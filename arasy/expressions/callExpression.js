var callerParser = function( expressionParser, left, token ){
    var identify = left;

    var argumentsParam = [];
    var rightParen = expressionParser.scanner.lookAhead();
    if ( rightParen.val != ')' ) {
        argumentsParam = argumentsParser( expressionParser );
    } else {
        expressionParser.scanner.nextToken();
    }

    return {
        "type": 'CallExpression',
        "callee": identify,
        "arguments": argumentsParam
    }

};

arasy.expressionParser.registerInfixParselet(expressionTokenMap.callOperator, callerParser);