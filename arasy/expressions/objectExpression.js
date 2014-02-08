//objectExpressionParser
var objectExpressionParser = function( expressionParser, token ){
    var objectRs = {
        type: "ObjectExpression",
        properties: []
    };

    objectRs.properties = parseObjectExpressionElements();

    //consume }
    arasy.scanner.consume();

    return objectRs;


    function parseObjectExpressionElements(){
        var rs = [],
            item;

        while( item = parseObjectItem() ){
            rs.push( item );

            var peekToken = arasy.scanner.lookAhead();
            if( peekToken.val != ',' ){
                break;
            }else{
                arasy.scanner.consume();
            }
        }
        return rs;
    }

    function parseObjectItem(){
        var rs = {};

        rs.type = 'Property';
        rs.key = arasy.scanner.consume();
        //consume :
        arasy.scanner.consume();

        rs.value = expressionParser.parse(10);
        rs.kind = "init";

        return rs;
    }
};

arasy.registerInfixParselet(expressionTokenMap.objectExpressionStart, objectExpressionParser);