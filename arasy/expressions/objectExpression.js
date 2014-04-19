//objectExpressionParser
var objectExpressionParser = function( expressionParser, token ){
    var objectRs = {
        type: "ObjectExpression",
        properties: []
    };

    var peekToken = expressionParser.scanner.lookAhead();
    if ( maybeValue('}', peekToken) ) {
        expressionParser.scanner.nextToken();
        return objectRs;
    }

    objectRs.properties = parseObjectExpressionElements();

    //consume }
    expressionParser.scanner.nextToken();

    return objectRs;


    function parseObjectExpressionElements(){
        var rs = [],
            item;

        while( item = parseObjectItem() ){
            rs.push( item );

            var peekToken = expressionParser.scanner.lookAhead();
            if( peekToken.value != ',' ){
                break;
            }else{
                expressionParser.scanner.nextToken();
            }
        }
        return rs;
    }

    function parseObjectItem(){
        var rs = {};

        rs.type = 'Property';
        rs.key = expressionParser.scanner.nextToken();
        //consume :
        expressionParser.scanner.nextToken();

        rs.value = expressionParser.parse(10, 1, 0, 'regexpStart');
        rs.kind = "init";

        return rs;
    }
};

arasy.expressionParser.registerPrefixParselet(expressionTokenMap.objectExpressionStart, objectExpressionParser);