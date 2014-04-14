var callerParser = function( expressionParser, left, token ){
    var identify = left;

    var argumentsParam = [];
    arasy.isRegexpAcceptable = 1;
    var rightParen = expressionParser.scanner.lookAhead();
    arasy.isRegexpAcceptable = 0;
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