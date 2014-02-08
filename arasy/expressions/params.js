var paramsListParser = function(){
    var rs = [],
        item;

    arasy.scanner.consume();
    //match({type: 'punctuator', value: '('}, this.nextToken());

    var peekToken = arasy.scanner.lookAhead();
    if( peekToken.type == tokensMap.identify ){
        while( (item = arasy.scanner.consume()).type == tokensMap.identify ){
            rs.push({
                type: 'Identifier',
                name: item.val
            });
            var nextToken = arasy.scanner.lookAhead();
            if(nextToken.val != ','){
                break;
            }else{
                arasy.scanner.consume();
            }
        }
    }
    //match({type: 'punctuator', value: ')'}, this.nextToken());
    arasy.scanner.consume();
    return rs;
};