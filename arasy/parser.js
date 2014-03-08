window.arasy = {};

arasy.parse = function( source, opts ){

    var lastToken;
    var currentToken;
    var lookaheadToken;
    var lookaheadTokenConsumed = true;
    var isInBlockBody = [];

    var scanner = getScanner( source, opts );
    arasy.expressionParser.init( scanner );
    var expressionParser = arasy.expressionParser;
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
//            if( mustBe('for', peekToken) ){
//                return parseForStatement();
//            }
//            if( mustBe('continue', peekToken) ){
//                return parseContinueStatement();
//            }
//            if( mustBe('with', peekToken) ){
//                return parseWithStatement();
//            }
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
        var variableStatement = new Node('variableDeclarationList');
        mustBe('var', scanner.nextToken());
        variableStatement.declarations = parseVariableDeclarationList();
        consumeSemicolon();
        return variableStatement;
    }

    function parseVariableDeclarationList(){
        var rs = [],
            item;
        while(item = parseVariableDeclaration()){
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

    function parseVariableDeclaration(){
        var variableDeclarationNode = new Node('variableDeclaration');
        var ID = match( {type: TokenType.Identifier}, scanner.nextToken() );
        variableDeclarationNode.id = ID;

        var peekToken = scanner.lookAhead();
        var assign = match({value: '='}, peekToken);
        if( assign ){
            scanner.nextToken();
            var init = parseExpressionStatement( 'noComma' );
            variableDeclarationNode.init = init;
        } else {
            variableDeclarationNode.init = null;
        }
        return variableDeclarationNode;
    }

    function parseExpressionStatement( noComma ){
        var node = new Node('ExpressionStatement');
        node.expressions = expressionParser.parse( 0, noComma);

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