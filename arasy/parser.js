window.arasy = {};

arasy.parse = function( source, opts ){

    var expressionParser = arasy.expressionParser;
    var isInBlockBody = [];
    var isInSwitchCase = [];
    var tokenizer;

    var scanner = getScanner( source, opts );
    arasy.expressionParser.init( scanner );
    arasy.parse.blockParser = parseBlock;

    return parseProgram();

    function getScanner( source, opts ){
        tokenizer = arasy.scanner( source );
        return {
            tokenList: [],
            currentIdx: -1,
            nextToken: function(){
                if ( this.currentIdx < this.tokenList.length - 1 ) {
                    this.currentIdx++;
                    var token = this.tokenList[ this.currentIdx ];
                    if ( maybeValue('/', token) && !maybeType(TokenType.Eof, this.lookAhead()) ) {
                        this.tokenList.splice( this.currentIdx );
                        var lastToken = this.tokenList[ this.tokenList.length - 1 ];
                        tokenizer.setCursor( lastToken && lastToken.end );
                        // check the token
                        token = this.fillToken();
                    }
                    if ( maybeValue('(', token) && arasy.isRegexpAcceptable ) {
                        token.expType =  specialOperator2ExpType['('].group;
                    }
                    return token;
                } else {
                    var token = this.fillToken();
                    this.currentIdx++;
                    return token;
                }
            },
            fillToken: function(){
                var currentToken = this.tokenList[ this.tokenList.length - 1 ];
                var token = getNextToken( currentToken );
                this.tokenList.push( token );
                return token;
            },
            lookAhead: function(){
                if ( this.currentIdx + 1 <= this.tokenList.length -1 ) {
                    var token = this.tokenList[ this.currentIdx + 1 ];
                    if ( maybeValue('/', token) ) {
                        this.tokenList.splice( this.currentIdx + 1 );
                        var lastToken = this.tokenList[ this.tokenList.length - 1 ];
                        tokenizer.setCursor( lastToken && lastToken.end );
                        // check the token
                        token = this.fillToken();
                    }
                    if ( maybeValue('(', token) && arasy.isRegexpAcceptable ) {
                        token.expType =  specialOperator2ExpType['('].group;
                    }
                    return token;
                } else {
                    return this.fillToken();
                }
            },
            lookAhead2: function(){
                if ( this.currentIdx + 2 > this.tokenList.length -1 ) {
                    this.fillToken();
                    this.fillToken();
                }
                return this.tokenList[ this.currentIdx + 2 ];
            },
            retract: function(){
                this.currentIdx = this.currentIdx - 1;
                return this.tokenList[ this.currentIdx ];
            }

        };

        function getNextToken( lastToken ){
            var afterTerminal = 0;
            var token = tokenizer.nextToken();
            while ( match({type: TokenType.Terminator}, token)
                || ( match({type: TokenType.Comment}, token) )
                ) {
                token = tokenizer.nextToken();
                afterTerminal = 1;
            }
            if ( afterTerminal ) {
                token.afterTerminal = 1;
            }
            return adjustExpressionType( token, lastToken );
        }
        function adjustExpressionType( token, lastToken ){
            var expType;

            if ( tokenType2ExpType.hasOwnProperty( token.type ) ) {
                expType = tokenType2ExpType[ token.type ];
            }

            if ( keywords2ExpType.hasOwnProperty( token.value ) ) {
                expType = keywords2ExpType[ token.value ];
            }
            if ( operator2ExpType.hasOwnProperty( token.value ) ) {
                expType = operator2ExpType[ token.value ];
            }

            // 处理 s.function 的情况
            if ( lastToken && maybeValue('.', lastToken) && token.value == 'function' ) {
                token.type = TokenType.Identifier;
                expType = tokenType2ExpType[ token.type ];
            }

            //todo check context and lookup specialOperator2ExpType
            if ( maybeValue( '(', token ) ) {
                if ( lastToken && (
                     maybeType( TokenType.Identifier, lastToken  )
                    || maybeValue( ')', lastToken )
                    || maybeValue( '}', lastToken )
                    || maybeValue( ']', lastToken )
                    )
                ) {
                    expType = specialOperator2ExpType['('].call;
                } else {
                    expType = specialOperator2ExpType['('].group;
                }
            }

            token.expType = expType;
            return token;
        }
    }

    function parseProgram(){
        var programNode = new Node('program');
        programNode.body = parseSourceElement();
        return programNode;
    }


    function parseSourceElement(){
        var peekToken = scanner.lookAhead();
        if( peekToken.type == TokenType.Eof ){
            return [];
        }
        if( isInBlockBody.length && maybeValue('}', peekToken) ){
            return [];
        }

        return parseStatements();
    }

    function parseStatements(){
        var rs = [],
            item;

        while(item = parseStatement()){
            rs.push( item );
        }
        return rs;
    }

    function parseStatement(){
        arasy.isRegexpAcceptable = 1;
        var peekToken = scanner.lookAhead();
        arasy.isRegexpAcceptable = 0;

        if( peekToken.type == TokenType.Eof ){
            return;
        }

        if( isInBlockBody.length && maybeValue('}', peekToken) ){
            return;
        }

        if ( isInSwitchCase.length &&
            ( match({value: 'case'}, peekToken) || match({value: 'default'}, peekToken) )
           ) {
            return;
        }

        if( maybeValue('{', peekToken) ){
            return parseBlock();
        }else{
            if( maybeValue('var', peekToken) ){
                return parseVariableStatement()
            }
            if( maybeValue(';', peekToken) ){
                return parseEmptyStatement();
            }
            if( maybeValue('if', peekToken) ){
                return parseIfStatement();
            }

            if( maybeValue('do', peekToken) ){
                return parseDoWhileStatement();
            }
            if( maybeValue('while', peekToken) ){
                return parseWhileStatement();
            }
            if( maybeValue('for', peekToken) ){
                return parseForStatement();
            }
            if( maybeValue('continue', peekToken) ){
                return parseSimpleStatement('continue');
            }

            if( maybeValue('break', peekToken) ){
                return parseSimpleStatement('break');
            }
            if( maybeValue('return', peekToken) ){
                return parseSimpleStatement('return');
            }
            if( maybeValue('throw', peekToken) ){
                return parseSimpleStatement('throw');
            }
            if( maybeValue('with', peekToken) ){
                return parseWithStatement();
            }

            if( maybeValue('switch', peekToken) ){
                return parseSwitchStatement();
            }

            if( maybeValue('debugger', peekToken) ){
                return parseSimpleStatement('debugger');
            }

            if ( maybeValue('try', peekToken) ) {
                return parseTryStatement();
            }

            if ( maybeValue('function', peekToken) ) {
                return parseFunctionDeclaration();
            }


            var peek2Token = scanner.lookAhead2();
            if ( match({type: TokenType.Identifier}, peekToken)
                && maybeValue(':', peek2Token)
                ) {
                return parseLabelledStatements();
            }

            return parseExpressionStatement();
        }
    }

    // 12.12
    function parseLabelledStatements(){
        //Identifier : Statement
        expectType(TokenType.Identifier, scanner.nextToken());
        expectValue(':', scanner.nextToken());

        var node = new Node('LabelledStatements');
        node.body = parseStatement();
        return node;
    }

    // 13
    function parseFunctionDeclaration(){
        var node = new Node('FunctionDeclaration');
        scanner.nextToken();

        var id = scanner.nextToken();
        expectType(TokenType.Identifier, id);
        var params = paramsListParser( scanner );
        var body = parseBlock();

        node.id = id;
        node.params = params;
        node.body = body;

        return node;
    }

    function parseBlock(){
        var blockStatement = new Node('BlockStatement');
        expectValue('{', scanner.nextToken());

        isInBlockBody.push(1);

        var peekToken = scanner.lookAhead();

        if ( maybeValue('}', peekToken) ) {
            blockStatement.body = {};
        } else {
            blockStatement.body = parseSourceElement();
        }

        expectValue('}', scanner.nextToken());

        isInBlockBody.pop(1);
        return blockStatement;
    }

    function parseIfStatement(){
        var ifNode = new Node('IfStatement');
        scanner.nextToken();
        ifNode.test = parseIfTestPart();
        ifNode.consequent = parseIfBlockPart();
        var lookAhead = scanner.lookAhead();
        if ( lookAhead.value == 'else' ) {
            scanner.nextToken();
            ifNode.alternate = parseIfBlockPart();
        }
        return ifNode;
    }

    function parseIfTestPart(){
        expectValue( '(', scanner.nextToken() );
        var expression = expressionParser.parse( 0, 'noComma' );
        expectValue( ')', scanner.nextToken() );
        return expression;
    }
    function parseIfBlockPart(){
        if ( match({value: '{'}, scanner.lookAhead()) ) {
            return parseBlock();
        } else {
            return parseStatement();
        }
    }

    function parseEmptyStatement(){
        scanner.nextToken();
        return new Node('EmptyStatement');
    }

    function parseDoWhileStatement(){
        //do statement while (expression);

        scanner.nextToken();
        var doWhileNode = new Node('DoWhileStatement');

        doWhileNode.body = parseIfBlockPart();

        var nextToken = scanner.nextToken();
        expectValue( 'while', nextToken );

        doWhileNode.test = parseIfTestPart();

        return doWhileNode;
    }


    // 12.10
    function parseWithStatement(){
        // with ( expression ) Statement
        var withNode = new Node('WithStatement');
        scanner.nextToken();

        // check (
        expectValue('(', scanner.nextToken());

        var object = expressionParser.parse( 0 );

        expectValue(')', scanner.nextToken());

        var body = parseStatements();

        withNode.object = object;
        withNode.body = body;

        return withNode;
    }

    // 12.11
    function parseSwitchStatement(){
        scanner.nextToken();
        isInSwitchCase.push(1);
        isInBlockBody.push(1);

        var switchNode  = new Node('SwitchStatement');

        expectValue('(', scanner.nextToken());
        var exp = expressionParser.parse( 0 );
        expectValue(')', scanner.nextToken());

        switchNode.discriminant = exp;
        switchNode.cases = parseSwitchCases();

        isInSwitchCase.pop();
        isInBlockBody.pop();

        return switchNode;
    }

    function parseSwitchCases(){
        expectValue('{', scanner.nextToken());
        var rs = [],
            item;
        while( item = parseSwitchCase() ){
            rs.push( item );
        }
        expectValue('}', scanner.nextToken());

        return rs;
    }

    function parseSwitchCase(){
        // case:
        // default:

        var switchCase = new Node('SwitchCase');

        var nextToken = scanner.nextToken();
        var caseType;
        if ( match({value: 'case'}, nextToken) ) {
            caseType = 'CaseClause';
        } else if( match({value: 'default'}, nextToken) ) {
            caseType = 'DefaultClause';
        } else if( match({value: '}'}, nextToken) ) {
            scanner.retract();
            return false;
        } else {
            raiseError( nextToken, 'case block 解析失败' );
        }

        if( caseType == 'CaseClause' ){
            switchCase.test = expressionParser.parse( 0 );
        }else{
            switchCase.test = null;
        }

        if ( caseType ) {
            expectValue(':', scanner.nextToken());
        }
        switchCase.consequent = parseStatements();

        return switchCase;
    }


    // 12.14
    // try block catch( Identifier ) block finally block
    function parseTryStatement(){
        var node = new Node('TryStatement');
        scanner.nextToken();
        node.body = parseBlock();

        var catchPart = 0;
        var finallyPart = 0;

        var peekToken = scanner.lookAhead();

        if ( maybeValue('catch', peekToken) ) {
            scanner.nextToken();
            var handlers = {
                type: 'CatchClause'
            };
            // (
            expectValue('(', scanner.nextToken());
            handlers.id = scanner.nextToken();
            expectType(TokenType.Identifier, handlers.id);
            // )

            expectValue(')', scanner.nextToken());

            handlers.block = parseBlock();
            node.handlers = handlers;
            catchPart = 1;
        }

        peekToken = scanner.lookAhead();

        if ( maybeValue('finally', peekToken) ) {
            node.finalizer = parseBlock();
            finallyPart = 1;
        }

        // no catch && finally
        if ( !catchPart && !finallyPart ) {
            raiseError( peekToken, 'TryStatement解析失败，至少得有catch语句或者finally语句' );
        }

        return node;
    }



    // continue break return  throw
    function parseSimpleStatement( type ){
        var statement = {
            'continue': 'ContinueStatement',
            'break': 'BreakStatement',
            'return': 'ReturnStatement',
            'throw': 'ThrowStatement',
            'debugger': 'DebuggerStatement'
        };

        var targetNode = new Node( statement[ type ] );
        var extraData = null;

        scanner.nextToken();

        // TODO as for contine  & break
        // 1. no LineTerminator here
        // 2. only exits in IterationStatement
        // 3. check label


        // TODO return
        // check in the function scope;

        if ( type == 'return' || type == 'throw' ) {
            arasy.isRegexpAcceptable = 1;
        }
        var peekNode = scanner.lookAhead();

        if ( type == 'return' || type == 'throw' ) {
            arasy.isRegexpAcceptable = 0;
        }

        if ( type == 'return' ) {

            if ( match({value: ';'}, peekNode) ) {
                scanner.nextToken();
            } else {
                extraData = expressionParser.parse( 0 );
            }
            targetNode['argument'] = extraData;

        } else if ( type == 'throw' ) {

            // TODO peekNode must not be a LineTerminator
            extraData = expressionParser.parse( 0 );
            targetNode['argument'] = extraData;

        } else if ( type == 'debugger' ) {

            // TODO scanner 对 terminator 的处理
            if ( ! match({ value: ';' }, peekNode)
                && ! match({ type: TokenType.Eof }, peekNode)
                && ! match({ type: TokenType.Terminator }, peekNode)
                ) {
                raiseError( peekNode, 'debugger 语句解析错误' );
            }

        } else {

            // continue break
            if ( match({type: TokenType.Identifier}, peekNode) ) {
                scanner.nextToken();
                extraData = peekNode;
            }
            targetNode['label'] = extraData;
        }

        consumeSemicolon();

        return targetNode;

    }

    function parseWhileStatement(){
        //while (expression) statement;

        scanner.nextToken();
        var whileNode = new Node('WhileStatement');

        whileNode.test = parseIfTestPart();

        whileNode.body = parseIfBlockPart();

        return whileNode;
    }

    function parseForStatement(){

        scanner.nextToken();
        var forNode = new Node('ForStatement');

        //for(var i = 0; i < 25; i++)
        expectValue('(', scanner.nextToken());

        //if the first token is var;
        var peekToken = scanner.lookAhead();

        var init;
        var initType;

        if ( match({value: 'var'}, peekToken) ) {
            scanner.nextToken();
            init = parseVariableDeclarationList( 1 );
            initType = 'VariableDeclaration';
        } else if ( match({value: ';'}, peekToken) ) {
            init = null;
        } else {
            init = expressionParser.parse( 0, 0, 1 );
            initType = 'Expression';
        }

        peekToken = scanner.lookAhead();

        //check if it is for in statement
        if ( maybeValue('in', peekToken ) ) {
            // for in
            var forInNode = new Node('ForInStatement');
            var left = init;

            if ( initType == 'VariableDeclaration' && init.length > 1 ) {
                raiseError( peekToken, ' ForInStatement 只允许一个变量申明 ' );
            }

            if ( initType == 'Expression' ) {
                // @TODO check LeftHandSideExpression
            }

            scanner.nextToken();

            var right = expressionParser.parse( 0 );

            expectValue(')', scanner.nextToken());


            var body = parseIfBlockPart();

            forInNode.left = left;
            forInNode.right = right;
            forInNode.body = body;

            return forInNode;

        } else {
            // for

            expectValue(';', scanner.nextToken());

            peekToken = scanner.lookAhead();

            var test;
            if ( match({value: ';'}, peekToken) ) {
                scanner.nextToken();
                test = null;
            } else {
                test = expressionParser.parse( 0 );
                expectValue(';', scanner.nextToken());
            }

            //update
            peekToken = scanner.lookAhead();
            if ( maybeValue(')', scanner.lookAhead()) ){
                scanner.nextToken();
                update = null;
            } else {
                update = expressionParser.parse( 0 );

                // 剩下的 )
                scanner.nextToken();
            }

            var body = parseIfBlockPart();

            forNode.init = init;
            forNode.test = test;
            forNode.update = update;
            forNode.body = body;

            return forNode;
        }
    }

    function consumeSemicolon(){
        var nextToken = scanner.lookAhead();
        if ( match({value: ';'}, nextToken) ) {
            scanner.nextToken();
        } else {
            if ( !nextToken.afterTerminal && !nextToken.type == TokenType.Eof ) {
                //no auto insert semicolon
                //unexpected token or unexpected end of input
                raiseError( nextToken, 'unexpected token' );
            }
        }
    }

    function parseVariableStatement(){
        var variableStatement = new Node('variableDeclaration');
        expectValue('var', scanner.nextToken());
        variableStatement.declarations = parseVariableDeclarationList();
        consumeSemicolon();
        return variableStatement;
    }

    function parseVariableDeclarationList( noIn ){
        var rs = [],
            item;
        while(item = parseVariableDeclaration( noIn )){
            rs.push( item );

            var nextToken = scanner.lookAhead();
            if(!match({type: TokenType.Punctuator, value: ','}, nextToken)){
                break;
            }else{
                scanner.nextToken();
            }
        }
        return rs;
    }

    function parseVariableDeclaration( noIn ){
        var variableDeclarationNode = new Node('VariableDeclarator');
        var ID = match( {type: TokenType.Identifier}, scanner.nextToken() );
        variableDeclarationNode.id = ID;

        var peekToken = scanner.lookAhead();
        var assign = match({value: '='}, peekToken);
        if( assign ){
            scanner.nextToken();
            var init = parseExpressionStatement( 'noComma', noIn, 'regexpStart' );
            variableDeclarationNode.init = init;
        } else {
            variableDeclarationNode.init = null;
        }
        return variableDeclarationNode;
    }



    function parseExpressionStatement( noComma, noIn, regexpStart ){
        var node = new Node('ExpressionStatement');
        node.expressions = expressionParser.parse( 0, noComma, noIn, regexpStart );

        var peekToken = scanner.lookAhead();
        if ( maybeValue(';', peekToken) && !noIn ) {
            scanner.nextToken();
        } else {
            if ( match({type: TokenType.Terminator}, peekToken) || match({type: TokenType.Eof}, peekToken) ) {
                scanner.nextToken();
            }
        }
        return node;
    }

    function Node( type ){
        this.type = type;
    }
};