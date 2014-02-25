var callerParser = function( expressionParser, left, token ){
    var identify = left;

    var argumentsParam = [];
    var rightParen = this.scanner.lookAhead();
    if ( rightParen.val != ')' ) {
        argumentsParam = argumentsParser( expressionParser );
    } else {
        this.scanner.consume();
    }

    return {
        "type": 'CallExpression',
        "callee": identify,
        "arguments": argumentsParam
    }

};

arasy.expressionParser.registerInfixParselet(expressionTokenMap.callOperator, callerParser);