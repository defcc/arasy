var prefixOperatorParser = function( expressionParser, token ){
    var operand = expressionParser.parse( getPrecedenceByToken( token) );
    return {
        type: 'UnaryExpression',
        operator: token.value,
        prefix: true,
        argument: operand
    };
};

var infixOperatorParser = function( expressionParser, left,  token ){
    var operand = expressionParser.parse( getPrecedenceByToken( token ) );
    return {
        type: 'BinaryExpression',
        operator: token.value,
        infix: true,
        left: left,
        right: operand
    };
};

var postfixOperatorParser = function( expressionParser, left, token ){
    return {
        type: 'updateExpression',
        operator: token.value,
        prefix: false,
        argument: left
    };
};

var registerPrefixOperator = function( opType ){
    arasy.expressionParser.registerPrefixParselet( expType, prefixOperatorParser );
};

var registerInfixOperator = function( expType ){
    arasy.expressionParser.registerInfixParselet( expType, infixOperatorParser );
};


registerPrefixOperator(operatorTokenMap.deleteOperator);
registerPrefixOperator(operatorTokenMap.voidOperator);
registerPrefixOperator(operatorTokenMap.unaryOperator);
registerPrefixOperator(operatorTokenMap.unarynegationOperator);
registerPrefixOperator(operatorTokenMap.typeofOperator);
registerPrefixOperator(operatorTokenMap.incrementOperator);
registerPrefixOperator(operatorTokenMap.decrementOperator);
registerPrefixOperator(operatorTokenMap.bitwisenotOperator);
registerPrefixOperator(operatorTokenMap.logicalnotOperator);

arasy.expressionParser.registerInfixParselet(operatorTokenMap.incrementOperator, postfixOperatorParser);
arasy.expressionParser.registerInfixParselet(operatorTokenMap.decrementOperator, postfixOperatorParser);