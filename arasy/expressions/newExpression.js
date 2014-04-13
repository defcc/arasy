//new expression
var newParser = function( expressionParser, token ){
    var identify = expressionParser.scanner.nextToken();

    //check arguments;
    var argumentsParam = [];
    var leftParen = expressionParser.scanner.lookAhead();
    if ( match({value: '('}, leftParen) ) {
        argumentsParam = argumentsParser( expressionParser );
    }

    return {
        "type": 'newExpression',
        "callee": identify,
        "arguments": argumentsParam
    }
};

arasy.expressionParser.registerPrefixParselet(expressionTokenMap.newOperator, newParser);