var paramsListParser = function(){
    var rs = [],
        item;

    this.scanner.consume();
    //match({type: 'punctuator', value: '('}, this.nextToken());

    var peekToken = this.scanner.lookAhead();
    if( peekToken.type == tokensMap.identify ){
        while( (item = this.scanner.consume()).type == tokensMap.identify ){
            rs.push({
                type: 'Identifier',
                name: item.val
            });
            var nextToken = this.scanner.lookAhead();
            if(nextToken.val != ','){
                break;
            }else{
                this.scanner.consume();
            }
        }
    }
    //match({type: 'punctuator', value: ')'}, this.nextToken());
    this.scanner.consume();
    return rs;
};