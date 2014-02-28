var singelTokenParser = function( expressionParser, token ){
    var rs;

    var tokenType = token.type;

    if ( tokenType == TokenType.Identifier ) {
        rs = {
            type: 'Identifier',
            name: token.value
        }
    } else if ( token.value == 'this' ) {
        rs = {
            type: 'thisExpression'
        }
    } else if ( literalTypeMap[ token.type ] ){
        rs = {
            type: 'Literal',
            value: token.value
        }
    }
    return rs;
};

arasy.expressionParser.registerPrefixParselet( expressionTokenMap.singleToken, singelTokenParser );
