var singelTokenParser = function( expressionParser, token ){
    var rs;

    var tokenType = token.type;

    if ( tokenType == tokenType.Identifier ) {
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

var literalParser = function( expressionParser, token ){
    return {
        type: 'Literal',
        value: token.value
    }
};

var thisParser = function( expressionParser, token ){
    return {
        type: 'thisExpression'
    }
};

arasy.expressionParser.registerPrefixParselet( expressionTokenMap.singleToken, singelTokenParser );
