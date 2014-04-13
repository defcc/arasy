var conditionalOperatorParser = function ( expressionParser, left, token ) {
    var rs = {
        type: 'ConditionalExpression'
    };
    var conditionalOpPrecedence = getPrecedenceByToken( token );
    rs.left = left;
    rs.consequentPart = expressionParser.parse( conditionalOpPrecedence );
    mustBe(':', expressionParser.scanner.nextToken());
    rs.alternate = expressionParser.parse( conditionalOpPrecedence );
    return rs;
};

arasy.expressionParser.registerInfixParselet(expressionTokenMap.conditionalOperator, conditionalOperatorParser);
