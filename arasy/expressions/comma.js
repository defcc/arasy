var commaParser = function( expressionParser,  left, token ){
    var rs = [ left ];
    var expressionItem;
    while( expressionItem = expressionParser.parse( getPrecedenceByToken( token ) ) ) {
        rs.push( expressionItem );
        var nextToken = expressionParser.scanner.lookAhead();
        if ( nextToken.value == ',' ) {
            expressionParser.scanner.nextToken();
        } else {
            break;
        }
    }
    return rs;
};

arasy.expressionParser.registerInfixParselet( expressionTokenMap.commaOperator, commaParser );