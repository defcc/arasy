//parse a[b]
var memberExpressionParser = function( expressionParser, left, token ){

    var propertyArg = expressionParser.parse(0);

    expressionParser.scanner.nextToken();

    return {
        type: 'MemberExpression',
        object: left,
        property: propertyArg,
        computed: true
    }
};

var dotExpressionParser = function( expressionParser, left, token ){
    var propertyArg = expressionParser.scanner.nextToken();

    return {
        type: 'MemberExpression',
        object: left,
        property: propertyArg,
        computed: false
    }
};

arasy.expressionParser.registerInfixParselet(expressionTokenMap.arrayOperator, memberExpressionParser);

arasy.expressionParser.registerInfixParselet(expressionTokenMap.dotOperator, dotExpressionParser);