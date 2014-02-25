//parse a[b]
var memberExpressionParser = function( expressionParser, left, token ){

    var propertyArg = expressionParser.parse(0);

    this.scanner.consume();

    return {
        type: 'MemberExpression',
        object: left,
        property: propertyArg,
        computed: true
    }
};

var dotExpressionParser = function( expressionParser, left, token ){
    var propertyArg = tokenList.consume();

    return {
        type: 'MemberExpression',
        object: left,
        property: propertyArg,
        computed: false
    }
};

arasy.registerInfixParselet(expressionTokenMap.arrayOperator, memberExpressionParser);

arasy.registerInfixParselet(expressionTokenMap.dotOperator, dotExpressionParser);