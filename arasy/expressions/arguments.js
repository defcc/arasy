//parse a(a+b, c+d);
var argumentsParser = function( expressionParser ){
    var rs = [];

    var nextToken = arasy.scanner.lookAhead();
    //consume left paren;
    nextToken.val == '(' && arasy.scanner.consume();
    var nextToken = tokenList.lookAhead();
    if ( nextToken.val != ')' ) {
        rs = expressionParser.parse(0);
    }
    arasy.scanner.consume();
    return rs;
};