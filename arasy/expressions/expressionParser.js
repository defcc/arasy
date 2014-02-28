arasy.expressionParser = function(){

    var prefixParselet = {};
    var infixParselet = {};

    return {
        init: function( scanner ){
            this.scanner = scanner;
        },
        parse: function( precedence ){
            var token = this.scanner.lookAhead();
            if ( token.type == 'eof' ) {
                return;
            }
            var prefixParser = prefixParselet[ token.expType || token.type ];
            var left = prefixParser( this, token );

            while ( precedence < this.getPrecedence() ) {
                var token = this.scanner.consume();
                var infixParser = infixParselet[ token.type ];
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