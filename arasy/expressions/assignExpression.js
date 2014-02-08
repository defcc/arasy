//parse a = b = c
var assignParser = function( expressionParser, left, token ){

    //TODO check Invalid left-hand side in assignment

    var operand = expressionParser.parse( getPrecedenceByToken( token ) - 1 );

    return {
        type: 'assignExpression',
        operator: token.value,
        infix: true,
        left: left,
        right: operand
    };
};

arasy.expressionParser.registerInfixParselet(expressionTokenMap.assignmentOperator, assignParser);