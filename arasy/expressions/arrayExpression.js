var arrayParser = function( expressionParser, token ){
    var rs = [];

    var nextToken = arasy.scanner.lookAhead();
    if ( nextToken.val != ']' ) {
        rs = expressionParser.parse(0);
    }
    //must be right bracket
    arasy.scanner..consume();

    return {
        type: 'ArrayExpression',
        elements: makeArray( rs )
    }
};

expressionParser.registerPrefixParselet(expressionTokenMap.arrayOperator, arrayParser);