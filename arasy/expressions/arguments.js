//parse a(a+b, c+d);
var argumentsParser = function( expressionParser ){
    var rs = [];

    var nextToken = expressionParser.scanner.lookAhead();
    //consume left paren;
    nextToken.value == '(' && expressionParser.scanner.nextToken();
    var nextToken = expressionParser.scanner.lookAhead();
    if ( nextToken.value != ')' ) {
        rs = expressionParser.parse(0);
    }
    expressionParser.scanner.nextToken();
    return rs;
};