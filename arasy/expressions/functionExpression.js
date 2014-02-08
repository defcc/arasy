//function identifierName(opt) ( arguments )
var functionParser = function( expressionParser, token ){
    var identifyerName = null;
    var lookaheadToken = arasy.scanner.lookAhead();
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
    arasy.scanner.consume();

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

arasy.registerPrefixParselet(expressionTokenMap.functionExpressionStart, functionParser);