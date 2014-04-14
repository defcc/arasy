var prefixOperatorParser = function( expressionParser, token ){
    var operand = expressionParser.parse( getPrecedenceByToken( token), 0, 0, 'prefix' );
    return {
        type: 'UnaryExpression',
        operator: token.value,
        prefix: true,
        argument: operand
    };
};

var infixOperatorParser = function( expressionParser, left,  token ){
    var operand = expressionParser.parse( getPrecedenceByToken( token ), 0, 0, 'prefix' );
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
        type: 'UpdateExpression',
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
registerPrefixOperator(expressionTokenMap.additionOperator);
registerPrefixOperator(expressionTokenMap.subtractionOperator);

arasy.expressionParser.registerInfixParselet(expressionTokenMap.incrementOperator, postfixOperatorParser);
arasy.expressionParser.registerInfixParselet(expressionTokenMap.decrementOperator, postfixOperatorParser);


registerInfixOperator(expressionTokenMap.additionOperator);
registerInfixOperator(expressionTokenMap.mutliOperator);
registerInfixOperator(expressionTokenMap.divOperator);
registerInfixOperator(expressionTokenMap.subtractionOperator);
registerInfixOperator(expressionTokenMap.dotOperator);
registerInfixOperator(expressionTokenMap.bitwiseandOperator);
registerInfixOperator(expressionTokenMap.bitwiseorOperator);
registerInfixOperator(expressionTokenMap.bitwiseshiftOperator);

registerInfixOperator(expressionTokenMap.logicalandOperator);
registerInfixOperator(expressionTokenMap.logicalorOperator);



//gt、gte、lt、lte、in、instanceof
registerInfixOperator(expressionTokenMap.relationalOperator);

// ==、===、!=、!==
registerInfixOperator(expressionTokenMap.equalityOperator);