//parse a(a+b, c+d);
var argumentsParser = function( expressionParser ){
    var rs = [];
    arasy.isRegexpAcceptable = 1;
    var nextToken = expressionParser.scanner.lookAhead();
    arasy.isRegexpAcceptable = 0;

    if ( nextToken.value != ')' ) {
        rs = expressionParser.parse(0);
    }
    expectValue(')', expressionParser.scanner.nextToken());
    return rs;
};