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
                var tokenList = this.tokenList;
                if ( this.currentIdx < tokenList.length - 1 ) {
                    this.currentIdx++;
                    var token = tokenList[ this.currentIdx ];
                    if ( token.value == '/' ) {
                        tokenList.length = this.currentIdx;
                        var lastToken = tokenList[ this.currentIdx - 1 ];
                        tokenizer.setCursor( lastToken && lastToken.end );
                        token = this.fillToken();
                    }
                    parenTypeCheck( token );
                    return token;
                } else {
                    var token = this.fillToken();
                    this.currentIdx++;
                    return token;
                }
            },
            fillToken: function(){
                var tokenList = this.tokenList;
                var currentToken = tokenList[ tokenList.length - 1 ];
                var token = getNextToken( currentToken );
                parenTypeCheck( token );
                tokenList.push( token );
                return token;
            },
            lookAhead: function(){
                var tokenList = this.tokenList;
                if ( this.currentIdx + 1 <= tokenList.length -1 ) {
                    var token = tokenList[ this.currentIdx + 1 ];
                    if ( token.value == '/' ) {
                        tokenList.length = this.currentIdx + 1;
                        var lastToken = tokenList[ this.currentIdx ];
                        tokenizer.setCursor( lastToken && lastToken.end );
                        token = this.fillToken();
                    }
                    parenTypeCheck( token );
                    return token;
                } else {
                    return this.fillToken();
                }
            },
            lookAhead2: function(){
                var tokenList = this.tokenList;
                if ( this.currentIdx + 2 > tokenList.length -1 ) {
                    this.fillToken();
                    this.fillToken();
                }
                return tokenList[ this.currentIdx + 2 ];
            },
            retract: function(){
                this.currentIdx = this.currentIdx - 1;
                return this.tokenList[ this.currentIdx ];
            }

        };

        function parenTypeCheck( token ){
            if ( token.value == '(' && arasy.isRegexpAcceptable ) {
                token.expType =  specialOperator2ExpType['('].group;
            }
        }

        function getNextToken( lastToken ){
            var afterTerminal = 0;
            var token = tokenizer.nextToken();
            var tokenType = token.type;
            while ( tokenType == TokenType.Terminator || tokenType == TokenType.Comment ) {
                token = tokenizer.nextToken();
                tokenType = token.type;
                afterTerminal = 1;
            }
            if ( afterTerminal ) {
                token.afterTerminal = 1;
            }
            return adjustExpressionType( token, lastToken );
        }
        function adjustExpressionType( token, lastToken ){
            var expType;
            var tokenType = token.type;
            var tokenVal = token.value;

            var lastTokenVal;

            if ( lastToken ) {
                lastTokenVal = lastToken.value;
            }

            // 如果是简单token，就直接return;
            if ( token.expType == expressionTokenMap.singleToken ) {
                return token;
            }

            if ( tokenVal == 'new'
                || tokenVal == 'this'
                || tokenVal == 'function'
                || tokenVal == 'typeof'
                || tokenVal == 'delete'
                || tokenVal == 'void'
                || tokenVal == 'in'
                || tokenVal == 'instanceof'
                ) {
                expType = keywords2ExpType[ tokenVal ];
            }
            if ( tokenType == TokenType.Punctuator && operator2ExpType[tokenVal] ) {
                expType = operator2ExpType[ tokenVal ];
            }

            // 处理 .Keywords 的情况
            if ( lastToken && lastTokenVal == '.' && tokenType == TokenType.Keywords ) {
                token.type = TokenType.Identifier;
                expType = expressionTokenMap.singleToken;
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
        if( isInBlockBody.length && peekToken.value == '}' ){
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

        var val = peekToken.value;

        if( peekToken.type == TokenType.Eof ){
            return;
        }

        if( isInBlockBody.length && val == '}' ){
            return;
        }

        if ( isInSwitchCase.length &&
            ( val == 'case' || val == 'default' )
           ) {
            return;
        }



        if ( val == 'function' ) return parseFunctionDeclaration();
        if ( val == '{' ) return parseBlock();
        if ( val == 'switch' ) return parseSwitchStatement();
        if ( val == 'if' ) return parseIfStatement();
        if ( val == 'do' ) return parseDoWhileStatement();
        if ( val == 'var' ) return parseVariableStatement();
        if ( val == 'for' ) return parseForStatement();
        if ( val == 'try' ) return parseTryStatement();
        if ( val == 'while' ) return parseWhileStatement( );
        if ( val == ';' ) return parseEmptyStatement();
        if ( val == 'break' ) return parseSimpleStatement( 'break' );
        if ( val == 'return' ) return parseSimpleStatement( 'return' );
        if ( val == 'throw' ) return parseSimpleStatement( 'throw' );
        if ( val == 'with' ) return parseWithStatement( 'with' );
        if ( val == 'continue' ) return parseSimpleStatement('continue');
        if ( val == 'debugger' ) return parseSimpleStatement('debugger');

        var peek2Token = scanner.lookAhead2();
        var peelTokenType = peekToken.type;
        var peek2TokenValue = peek2Token.value;
        if ( peelTokenType == TokenType.Identifier && peek2TokenValue == ':' ) {
            return parseLabelledStatements();
        }

        return parseExpressionStatement();
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

        if ( peekToken.value == '}' ) {
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
        var expression = expressionParser.parse( 0, 0, 0, 'regexpStart' );
        expectValue( ')', scanner.nextToken() );
        return expression;
    }
    function parseIfBlockPart(){
        if ( scanner.lookAhead().value == '{' ) {
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
        var nextTokenVal = nextToken.value;
        var caseType;
        if ( nextTokenVal == 'case' ) {
            caseType = 'CaseClause';
        } else if( nextTokenVal == 'default' ) {
            caseType = 'DefaultClause';
        } else if( nextTokenVal == '}' ) {
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

        if ( peekToken.value == 'catch' ) {
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

        if ( peekToken.value == 'finally' ) {
            scanner.nextToken();
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
        var targetNode;
        if ( type == 'return' ) {
            targetNode = new Node( 'ReturnStatement' );
        } else if( type == 'break' ){
            targetNode = new Node( 'BreakStatement' );
        } else if ( type == 'continue' ){
            targetNode = new Node( 'ContinueStatement' );
        } else if ( type == 'throw' ){
            targetNode = new Node( 'ThrowStatement' );
        } else {
            targetNode = new Node( 'DebuggerStatement' );
        }

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
        var peekNodeVal = peekNode.value;
        var peekNodeType = peekNode.type;

        if ( type == 'return' || type == 'throw' ) {
            arasy.isRegexpAcceptable = 0;
        }

        if ( type == 'return' ) {

            if ( peekNodeVal == ';' ) {
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
            if ( peekNodeVal != ';'
                && peekNodeType != TokenType.Eof
                && peekNodeType != TokenType.Terminator
                ) {
                raiseError( peekNode, 'debugger 语句解析错误' );
            }

        } else {

            // continue break
            if ( peekNodeType == TokenType.Identifier ) {
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
        var peekTokenValue = peekToken.value;

        var init;
        var initType;

        if ( peekTokenValue == 'var' ) {
            scanner.nextToken();
            init = parseVariableDeclarationList( 1 );
            initType = 'VariableDeclaration';
        } else if ( peekTokenValue == ';' ) {
            init = null;
        } else {
            init = expressionParser.parse( 0, 0, 1 );
            initType = 'Expression';
        }

        peekToken = scanner.lookAhead();
        peekTokenValue = peekToken.value;

        //check if it is for in statement
        if ( peekTokenValue == 'in' ) {
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
            var peekTokenVal = peekToken.value;

            var test;
            if ( peekTokenVal == ';' ) {
                scanner.nextToken();
                test = null;
            } else {
                test = expressionParser.parse( 0, 0, 0, 'regexpStart' );
                expectValue(';', scanner.nextToken());
            }

            //update
            var update;
            if ( scanner.lookAhead().value == ')' ){
                scanner.nextToken();
                update = null;
            } else {
                update = expressionParser.parse( 0, 0, 0, 'regexpStart'  );

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
        if ( nextToken.value == ';' ) {
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
            if( nextToken.type != TokenType.Punctuator || nextToken.value != ','){
                break;
            }else{
                scanner.nextToken();
            }
        }
        return rs;
    }

    function parseVariableDeclaration( noIn ){
        var variableDeclarationNode = new Node('VariableDeclarator');
        var ID;
        var nextToken = scanner.nextToken();
        if ( nextToken.type == TokenType.Identifier ) {
            ID = nextToken;
        }
        variableDeclarationNode.id = ID;

        var peekToken = scanner.lookAhead();
        if( peekToken.value == '=' ){
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
        var peekTokenVal = peekToken.value;
        if ( peekTokenVal == ';' && !noIn ) {
            scanner.nextToken();
        } else {
            var peekTokenType = peekToken.type;
            if ( peekTokenType == TokenType.Terminator || peekTokenType == TokenType.Eof ) {
                scanner.nextToken();
            }
        }
        return node;
    }

    function Node( type ){
        this.type = type;
    }
};