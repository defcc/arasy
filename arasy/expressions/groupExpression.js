//group parser for (

var groupParser = function( expressionParser, token ){
    var groupExp = expressionParser.parse( getPrecedenceByToken( token ), 0, 0, 'regexpStart' );
    //TODO check rightParen is just ")"
    expectValue(')', expressionParser.scanner.nextToken());
    return groupExp;
};

arasy.expressionParser.registerPrefixParselet(expressionTokenMap.groupOperator, groupParser);