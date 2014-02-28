//group parser for (

var groupParser = function( expressionParser, token ){
    var groupExp = expressionParser.parse( getPrecedenceByToken( token ) );
    var rightParen = this.scanner.consume();
    return groupExp;
    //TODO check rightParen is just ")"
};

arasy.expressionParser.registerPrefixParselet(expressionTokenMap.groupOperator, groupParser);