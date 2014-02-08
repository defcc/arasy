arasy.expressionParser = function(){

    var prefixParselet = {};
    var infixParselet = {};

    return {
        parse: function( precedence ){
            var token = arasy.scanner.lookAhead();
            if ( token.type == 'eof' ) {
                return;
            }
            var prefixParser = prefixParselet[ token.expType ];
            var left = prefixParser( this, token );

            while ( precedence < this.getPrecedence() ) {
                var token = arasy.scanner.consume();
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
            var nextToken = arasy.scanner.lookAhead();
            var precedence = getPrecedenceByToken( nextToken );
            if ( precedence ) {
                return precedence;
            }
            return 0;
        }
    }
}();