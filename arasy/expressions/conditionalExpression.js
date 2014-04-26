var conditionalOperatorParser = function ( expressionParser, left, token, noComma ) {
    var rs = {
        type: 'ConditionalExpression'
    };
    var conditionalOpPrecedence = getPrecedenceByToken( token );
    rs.left = left;
    rs.consequentPart = expressionParser.parse( 0, 1, 0, 'regexpStart' );
    expectValue(':', expressionParser.scanner.nextToken());
    rs.alternate = expressionParser.parse( 0, noComma, 0, 'regexpStart' );
    return rs;
};

arasy.expressionParser.registerInfixParselet(expressionTokenMap.conditionalOperator, conditionalOperatorParser);
