//new expression
var newParser = function( expressionParser, token ){
    var identify = arasy.scanner.consume();

    //check arguments;
    var argumentsParam = [];
    var leftParen = arasy.scanner.lookAhead();
    if ( leftParen.val == '(' ) {
        argumentsParam = argumentsParser( expressionParser );
    }

    return {
        "type": 'newExpression',
        "callee": identify,
        "arguments": argumentsParam
    }
};

arasy.registerInfixParselet(expressionTokenMap.newOperator, newParser);