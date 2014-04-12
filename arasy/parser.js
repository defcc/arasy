window.arasy = {};

arasy.parse = function( source, opts ){

    var lastToken;
    var currentToken;
    var lookaheadToken;
    var expressionParser = arasy.expressionParser;
    var lookaheadTokenConsumed = true;
    var isInBlockBody = [];

    var scanner = getScanner( source, opts );
    arasy.expressionParser.init( scanner );
    arasy.parse.blockParser = parseBlock;

    return parseProgram();

    function getScanner( source, opts ){
        var scanner = arasy.scanner( source );
        return {
            nextToken: function(){
                lastToken = currentToken;
                if ( lookaheadTokenConsumed ) {
                    currentToken = getNextToken( );
                } else {
                    currentToken = lookaheadToken;
                    lookaheadTokenConsumed = true;
                }
                return currentToken;
            },
            lookAhead: function(){
                if ( !lookaheadTokenConsumed ) {
                    return lookaheadToken;
                } else {
                    var token = getNextToken( );
                    lookaheadToken = token;
                    lookaheadTokenConsumed = false;
                    return token;
                }
            },
            retract: function(){
                lookaheadTokenConsumed = false;
                lookaheadToken = currentToken;
            }
        };

        function getNextToken( ){
            var afterTerminal = 0;
            var token = scanner.nextToken();
            while ( match({type: TokenType.Terminator}, token) ) {
                token = scanner.nextToken();
                afterTerminal = 1;
            }
            if ( afterTerminal ) {
                token.afterTerminal = 1;
            }
            return adjustExpressionType( token );
        }
        function adjustExpressionType( token ){
            var expType;

            if ( tokenType2ExpType[ token.type ] ) {
                expType = tokenType2ExpType[ token.type ];
            }

            if ( keywords2ExpType[ token.value ] ) {
                expType = keywords2ExpType[ token.value ];
            }
            if ( operator2ExpType[ token.value ] ) {
                expType = operator2ExpType[ token.value ];
            }

            //todo check context and lookup specialOperator2ExpType
            if ( mustBe( '(', token ) ) {
                if ( lastToken.type == TokenType.Identifier ) {
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
        programNode.body = parseSourceElements();
        return programNode;
    }

    function parseSourceElements(){
        var rs = [],
            item;

        while( (item = parseSourceElement()) ){
            rs.push( item );
        }
        return rs;
    }

    function parseSourceElement(){
        var peekToken = scanner.lookAhead();
        if( peekToken.type == TokenType.Eof ){
            return;
        }
        if( isInBlockBody.length && mustBe('}', peekToken) ){
            return;
        }

        if( peekToken.value == 'function' ){
            return parseFunctionDeclaration();
        }else{
            return parseStatements();
        }
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
        var peekToken = scanner.lookAhead();

        if( peekToken.type == TokenType.Eof ){
            return;
        }

        if( isInBlockBody.length && mustBe('}', peekToken) ){
            return;
        }

        if( mustBe('{', peekToken) ){
            return parseBlock();
        }else{
            if( mustBe('var', peekToken) ){
                return parseVariableStatement()
            }
            if( mustBe(';', peekToken) ){
                return parseEmptyStatement();
            }
            if( mustBe('if', peekToken) ){
                return parseIfStatement();
            }

            if( mustBe('do', peekToken) ){
                return parseDoWhileStatement();
            }
            if( mustBe('while', peekToken) ){
                return parseWhileStatement();
            }
            if( mustBe('for', peekToken) ){
                return parseForStatement();
            }
            if( mustBe('continue', peekToken) ){
                return parseSimpleStatement('continue');
            }

            if( mustBe('break', peekToken) ){
                return parseSimpleStatement('break');
            }
            if( mustBe('return', peekToken) ){
                return parseSimpleStatement('return');
            }
            if( mustBe('with', peekToken) ){
                return parseWithStatement();
            }
//
//            if( mustBe('switch', peekToken) ){
//                return parseSwitchStatement();
//            }
//            if( mustBe('throw', peekToken) ){
//                return parseThrowStatement();
//            }
//
//            if( mustBe('debugger', peekToken) ){
//                return parseDebuggerStatement();
//            }
            return parseExpressionStatement();
        }
    }

    function parseFunctionDeclaration(){

    }

    function parseBlock(){
        var blockStatement = new Node('blockstatement');
        mustBe('{', scanner.nextToken());

        isInBlockBody.push(1);

        var peekToken = scanner.lookAhead();

        if ( mustBe('}', peekToken) ) {
            blockStatement.body = {};
        } else {
            blockStatement.body = parseSourceElements();
        }

        mustBe('}', scanner.nextToken());

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
        mustBe( '(', scanner.nextToken() );
        var expression = expressionParser.parse( 0, 'noComma' );
        mustBe( ')', scanner.nextToken() );
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
        mustBe( 'while', nextToken );

        doWhileNode.test = parseIfTestPart();

        return doWhileNode;
    }


    // 12.10
    function parseWithStatement(){
        // with ( expression ) Statement
        var withNode = new Node('WithStatement');
        scanner.nextToken();

        // check (
        mustBe('(', scanner.nextToken());

        var object = expressionParser.parse( 0 );

        mustBe(')', scanner.nextToken());

        var body = parseStatements();

        withNode.object = object;
        withNode.body = body;

        return withNode;
    }


    // continue break return
    function parseSimpleStatement( type ){
        var statement = {
            'continue': 'ContinueStatement',
            'break': 'BreakStatement',
            'return': 'ReturnStatement'
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

        var peekNode = scanner.lookAhead();

        if ( match({type: TokenType.Identifier}, peekNode) ) {
            scanner.nextToken();
            extraData = peekNode;
        }
        if ( type == 'return' ) {
            targetNode['argument'] = extraData;
        } else {
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
        mustBe('(', scanner.nextToken());

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
        if ( mustBe('in', peekToken ) ) {
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

            mustBe(')', scanner.nextToken());

            var body = parseBlock();

            forInNode.left = left;
            forInNode.right = right;
            forInNode.body = body;

            return forInNode;

        } else {
            // for

            mustBe(';', scanner.nextToken());

            peekToken = scanner.lookAhead();

            var test;
            if ( match({value: ';'}, peekToken) ) {
                scanner.nextToken();
                test = null;
            } else {
                test = expressionParser.parse( 0 );
                mustBe(';', scanner.nextToken());
            }

            //update
            peekToken = scanner.lookAhead();
            if ( mustBe(')', scanner.lookAhead()) ){
                scanner.nextToken();
                update = null;
            } else {
                update = expressionParser.parse( 0 );

                // 剩下的 )
                scanner.nextToken();
            }

            var body = parseBlock();

            forNode.init = init;
            forNode.test = test;
            forNode.update = update;
            forNode.body = body;

            return forNode;
        }
    }

    function raiseError( errorToken, msg ){
        throw new Error( msg + ': ' + errorToken.value );
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
        mustBe('var', scanner.nextToken());
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
            var init = parseExpressionStatement( 'noComma', noIn );
            variableDeclarationNode.init = init;
        } else {
            variableDeclarationNode.init = null;
        }
        return variableDeclarationNode;
    }



    function parseExpressionStatement( noComma, noIn ){
        var node = new Node('ExpressionStatement');
        node.expressions = expressionParser.parse( 0, noComma, noIn );

        var peekToken = scanner.lookAhead();
        if ( mustBe(';', peekToken) ) {
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