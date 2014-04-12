//function identifierName(opt) ( arguments )
var functionParser = function( expressionParser, token ){
    var scanner = expressionParser.scanner;

    var identifyerName = null;
    var lookaheadToken = scanner.lookAhead();
    var isIdentifierNameToken = lookaheadToken.type == TokenType.Identifier;

    if ( isIdentifierNameToken ) {
        identifyerName = {
            type: 'Identifier',
            name: lookaheadToken.value
        };
        scanner.nextToken();
    }
    var params = paramsListParser( scanner );

    var functionBody = arasy.parse.blockParser();

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