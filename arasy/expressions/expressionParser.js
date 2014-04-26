arasy.expressionParser = function(){

    var prefixParselet = {};
    var infixParselet = {};

    return {
        init: function( scanner ){
            this.scanner = scanner;
        },
        parse: function( precedence, noComma, noIn, regexpStart ){
            if ( regexpStart ) {
                arasy.isRegexpAcceptable = 1;
            }

            var token = this.scanner.nextToken();
            if ( regexpStart ) {
                arasy.isRegexpAcceptable = 0;
            }
            if ( token.type == 'eof' ) {
                return;
            }
            var prefixParser = prefixParselet[ token.expType ];
            if ( !prefixParser ) {
                raiseError(token);
            }
            var left = prefixParser( this, token );
            var scanner = this.scanner;

            while ( precedence < this.getPrecedence() ) {
                var token = scanner.nextToken();
                var tokenVal = token.value;
                if ( noComma && tokenVal == ',' ) {
                    scanner.retract();
                    break;
                }

                if ( noIn && tokenVal == 'in' ) {
                    scanner.retract();
                    break;
                }

                var infixParser = infixParselet[ token.expType ];
                if ( !infixParser ) {
                    scanner.retract();
                    break;
                }
                left = infixParser( this, left, token, noComma );
            }
            return left;
        },
        registerPrefixParselet: function( tokenType, parselet ){
            prefixParselet[ tokenType ] = parselet;
        },
        registerInfixParselet: function( tokenType, parselet ){
            infixParselet[ tokenType ] = parselet;
        },
        getPrecedence: function(){
            var nextToken = this.scanner.lookAhead();
            var precedence = getPrecedenceByToken( nextToken );
            if ( precedence ) {
                return precedence;
            }
            return 0;
        }
    }
}();