window.arasy = {};

arasy.parse = function( source, opts ){

    var lastToken;
    var currentToken;
    var lookaheadToken;
    var lookaheadTokenConsumed = true;

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
                    currentToken = getNextToken();
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
                    var token = getNextToken();
                    lookaheadToken = token;
                    lookaheadTokenConsumed = false;
                    return token;
                }
            }
        };

        function getNextToken(){
            var token = scanner.nextToken();
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
            token.expType = expType;
            return token;
            //todo check context and lookup specialOperator2ExpType
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

        var peekToken = scanner.lookAhead();

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

        if( peekToken.value == 'function' ){
            return parseFunctionDeclaration();
        }else{
            return parseStatements();
        }
    }

    function parseFunctionDeclaration(){

    }

    function parseBlock(){

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

//            if( mustBe('do', peekToken) ){
//                return parseDoStatement();
//            }
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

    function parseVariableDeclarationList(){
        var rs = [],
            item;
        while(item = parseVariableDeclaration()){
            rs.push( item );

            var nextToke = scanner.lookAhead();
            if(!match({type: 'punctuator', value: ','}, nextToke)){
                break;
            }else{
                this.nextToken();
            }
        }
        return rs;
    }

    function parseVariableDeclaration(){
        var variableDeclarationNode = new Node('variableDeclaration');
        var ID = match( {type: 'ID'}, scanner.nextToken() );
        variableDeclarationNode.id = ID;

        var peekToken = scanner.lookAhead();
        var assign = match({value: '='}, peekToken);
        if( assign ){
            scanner.nextToken();
            var init = parseExpressionStatement();
            variableDeclarationNode.init = init;
        }
        return variableDeclarationNode;
    }

    function parseExpressionStatement(){
        var node = new Node('ExpressionStatement');
        node.expressions = expressionParser.parse( 0 );
        return node;
    }

    function Node( type ){
        this.type = type;
    }

    function mustBe( val, token ){
        return token.value == val;
    }

    function match( obj, token ){
        var typeRs = valueRs = 1;
        if( obj.type && obj.type != token.type ){
            typeRs = 0;
        }
        if( obj.value && obj.value != token.value ){
            valueRs = 0;
        }

        return typeRs == 1 && valueRs == 1 ? token : false;
    }
};