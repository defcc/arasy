var callerParser = function( expressionParser, left, token ){
    var identify = left;

    var argumentsParam = [];
    var rightParen = arasy.scanner.lookAhead();
    if ( rightParen.val != ')' ) {
        argumentsParam = argumentsParser( expressionParser );
    } else {
        arasy.scanner.consume();
    }

    return {
        "type": 'CallExpression',
        "callee": identify,
        "arguments": argumentsParam
    }

};

arasy.expressionParser.registerInfixParselet(expressionTokenMap.callOperator, callerParser);