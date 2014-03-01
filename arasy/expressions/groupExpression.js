//group parser for (

var groupParser = function( expressionParser, token ){
    var groupExp = expressionParser.parse( getPrecedenceByToken( token ) );
    //TODO check rightParen is just ")"
    mustBe(')', expressionParser.scanner.nextToken());
    return groupExp;
};

arasy.expressionParser.registerPrefixParselet(expressionTokenMap.groupOperator, groupParser);