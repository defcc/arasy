window.arasy = {};

arasy.parse = function( source, opts ){
    var scanner = getScanner( source, opts );
    var expressionParser = arasy.expressionParser.init( scanner );
    return parseProgram();

    function getScanner( source, opts ){
        var scanner = arasy.scanner( source );
        var lookaheadToken = null;
        var lookaheadTokenConsumed = true;
        return {
            next: function(){
                if ( lookaheadTokenConsumed ) {
                    return scanner.nextToken();
                } else {
                    return lookaheadToken;
                }
            },
            lookAhead: function(){
                if ( lookaheadTokenConsumed ) {
                    return lookaheadToken;
                } else {
                    var token = scanner.nextToken();
                    lookaheadToken = token;
                    lookaheadTokenConsumed = false;
                    return token;
                }
            }
        };
    }

    function parseProgram(){
        var programNode = new Node('program');
        programNode.type = 'program';
        programNode.body = this.parseSourceElements();
        return programNode;
    }

    function parseSourceElements(){
        var rs = [],
            item;

        var peekToken = tokenList.lookahead();

        while( (item = this.parseSourceElement()) ){
            rs.push( item );
        }
        return rs;
    }

    function parseSourceElement(){
        var peekToken = tokenList.lookahead();
        if( peekToken.type == tokenType.Eof ){
            return;
        }

        if( match({type: 'keywords', value: 'function'}, peekToken )){
            return this.parseFunctionDeclaration();
        }else{
            return this.parseStatements();
        }
    }

    function parseFunctionDeclaration(){

    }

    function parseBlock(){

    }

    function parseStatements(){
        var rs = [],
            item;

        while(item = this.parseStatement()){
            rs.push( item );
        }
        return rs;
    }

    function parseStatement(){
        var peekToken = this.peekToken();

        if( peekToken.type == 'eof' ){
            return;
        }

        if( isInBlockBody.length && mustBe('}', peekToken) ){
            return;
        }

        //接下来是一个函数定义
        if( mustBe('function', peekToken) ){
            return;
        }

        if( mustBe('{', peekToken) ){
            return this.parseBlock();
        }else{
            if( mustBe('var', peekToken) ){
                return this.parseVariableStatement()
            }
            if( mustBe(';', peekToken) ){
                return this.parseEmptyStatement();
            }
            if( mustBe('if', peekToken) ){
                return this.parseIfStatement();
            }

            if( mustBe('do', peekToken) ){
                return this.parseEmptyStatement();
            }
            if( mustBe('for', peekToken) ){
                return this.parseIfStatement();
            }
            if( mustBe('continue', peekToken) ){
                return this.parseEmptyStatement();
            }
            if( mustBe('with', peekToken) ){
                return this.parseIfStatement();
            }

            if( mustBe('switch', peekToken) ){
                return this.parseEmptyStatement();
            }
            if( mustBe('throw', peekToken) ){
                return this.parseIfStatement();
            }

            if( mustBe('debugger', peekToken) ){
                return this.parseIfStatement();
            }
            if( mustBe('label', peekToken) ){
                return this.parseIfStatement();
            }
            return this.parseExpressionStatement();
        }
    }
};