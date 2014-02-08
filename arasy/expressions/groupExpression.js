//group parser for (

var groupParser = function( expressionParser, token ){
    var groupExp = expressionParser.parse( getPrecedenceByToken( token ) );
    var rightParen = arasy.scanner.consume();
    return groupExp;
    //TODO check rightParen is just ")"
};

arasy.registerPrefixParselet(expressionTokenMap.groupOperator, groupParser);