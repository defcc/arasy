var arrayParser = function( expressionParser, token ){
    var rs = [];

    var nextToken = this.scanner.lookAhead();
    if ( nextToken.val != ']' ) {
        rs = expressionParser.parse(0);
    }
    //must be right bracket
    this.scanner.nextToken();

    return {
        type: 'ArrayExpression',
        elements: makeArray( rs )
    }
};

arasy.expressionParser.registerPrefixParselet(expressionTokenMap.arrayOperator, arrayParser);