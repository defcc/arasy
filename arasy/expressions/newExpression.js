//new expression
var newParser = function( expressionParser, token ){
    var identify = expressionParser.scanner.nextToken();

    //check arguments;
    var argumentsParam = [];
    var leftParen = expressionParser.scanner.lookAhead();
    if ( maybeValue('(', leftParen) ) {
        expressionParser.scanner.nextToken();
        argumentsParam = argumentsParser( expressionParser );
    }

    return {
        "type": 'newExpression',
        "callee": identify,
        "arguments": argumentsParam
    }
};

arasy.expressionParser.registerPrefixParselet(expressionTokenMap.newOperator, newParser);