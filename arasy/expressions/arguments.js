//parse a(a+b, c+d);
var argumentsParser = function( expressionParser ){
    var rs = [];

    var nextToken = expressionParser.scanner.lookAhead();
    //consume left paren;
    nextToken.val == '(' && expressionParser.scanner.nextToken();
    var nextToken = expressionParser.scanner.lookAhead();
    if ( nextToken.val != ')' ) {
        rs = expressionParser.parse(0);
    }
    expressionParser.scanner.nextToken();
    return rs;
};