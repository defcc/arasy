//parse a(a+b, c+d);
var argumentsParser = function( expressionParser ){
    var rs = [];

    var nextToken = this.scanner.lookAhead();
    //consume left paren;
    nextToken.val == '(' && this.scanner.consume();
    var nextToken = tokenList.lookAhead();
    if ( nextToken.val != ')' ) {
        rs = expressionParser.parse(0);
    }
    this.scanner.consume();
    return rs;
};