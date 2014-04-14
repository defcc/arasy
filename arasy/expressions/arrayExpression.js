var arrayParser = function( expressionParser, token ){
    var rs = [];

    var nextToken = expressionParser.scanner.lookAhead();
    if ( nextToken.value != ']' ) {
        rs = expressionParser.parse(0, 0, 0, 'regexpStart');
    }
    //must be right bracket
    expressionParser.scanner.nextToken();

    return {
        type: 'ArrayExpression',
        elements: makeArray( rs )
    }
};

arasy.expressionParser.registerPrefixParselet(expressionTokenMap.arrayOperator, arrayParser);