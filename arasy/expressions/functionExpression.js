//function identifierName(opt) ( arguments )
var functionParser = function( expressionParser, token ){
    var identifyerName = null;
    var lookaheadToken = this.scanner.lookAhead();
    var isIdentifierNameToken = lookaheadToken.type == tokensMap.identify;
    if ( isIdentifierNameToken ) {
        identifyerName = {
            type: 'Identifier',
            name: lookaheadToken.val
        };
        tokenList.consume();
    }
    var params = paramsListParser();

    //consume {
    this.scanner.consume();

    var functionBody = blockParser();

    return {
        type: 'functionExpression',
        id: identifyerName,
        params: params,
        body: functionBody
    };

    function blockParser(){

    }
};

arasy.expressionParser.registerPrefixParselet(expressionTokenMap.functionExpressionStart, functionParser);