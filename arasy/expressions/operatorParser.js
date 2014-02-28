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

var registerPrefixOperator = function( expType ){
    arasy.expressionParser.registerPrefixParselet( expType, prefixOperatorParser );
};

var registerInfixOperator = function( expType ){
    arasy.expressionParser.registerInfixParselet( expType, infixOperatorParser );
};


registerPrefixOperator(expressionTokenMap.deleteOperator);
registerPrefixOperator(expressionTokenMap.voidOperator);
registerPrefixOperator(expressionTokenMap.unaryOperator);
registerPrefixOperator(expressionTokenMap.unarynegationOperator);
registerPrefixOperator(expressionTokenMap.typeofOperator);
registerPrefixOperator(expressionTokenMap.incrementOperator);
registerPrefixOperator(expressionTokenMap.decrementOperator);
registerPrefixOperator(expressionTokenMap.bitwisenotOperator);
registerPrefixOperator(expressionTokenMap.logicalnotOperator);

arasy.expressionParser.registerInfixParselet(expressionTokenMap.incrementOperator, postfixOperatorParser);
arasy.expressionParser.registerInfixParselet(expressionTokenMap.decrementOperator, postfixOperatorParser);