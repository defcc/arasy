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
            var left = prefixParser( this, token );

            while ( precedence < this.getPrecedence() ) {
                var token = this.scanner.nextToken();
                if ( noComma && match({value: ','}, token) ) {
                    this.scanner.retract();
                    break;
                }

                if ( noIn && match({value: 'in'}, token) ) {
                    this.scanner.retract();
                    break;
                }

                var infixParser = infixParselet[ token.expType ];
                if ( !infixParser ) {
                    this.scanner.retract();
                    break;
                }
                left = infixParser( this, left, token );
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