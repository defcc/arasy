var commaParser = function( expressionParser,  left, token ){
    var rs = [ left ];
    var expressionItem;
    while( expressionItem = expressionParser.parse( getPrecedenceByToken( token ) ) ) {
        rs.push( expressionItem );
        var nextToken = tokenList.lookAhead();
        if ( nextToken.val == ',' ) {
            tokenList.consume();
        } else {
            break;
        }
    }
    return rs;
};

arasy.expressionParser.registerInfixParselet( expressionTokenMap.commaOperator, commaParser );