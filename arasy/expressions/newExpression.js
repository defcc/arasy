//new expression
var newParser = function( expressionParser, token ){
    var identify = this.scanner.consume();

    //check arguments;
    var argumentsParam = [];
    var leftParen = this.scanner.lookAhead();
    if ( leftParen.val == '(' ) {
        argumentsParam = argumentsParser( expressionParser );
    }

    return {
        "type": 'newExpression',
        "callee": identify,
        "arguments": argumentsParam
    }
};

arasy.expressionParser.registerInfixParselet(expressionTokenMap.newOperator, newParser);