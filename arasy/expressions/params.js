var paramsListParser = function( scanner ){
    var rs = [],
        item;

    scanner.nextToken();
    //match({type: 'punctuator', value: '('}, this.nextToken());

    var peekToken = scanner.lookAhead();
    if( peekToken.type == TokenType.Identifier ){
        while( (item = scanner.lookAhead() ).type == TokenType.Identifier ){
            rs.push({
                type: 'Identifier',
                name: item.value
            });
            var nextToken = scanner.lookAhead();
            if(nextToken.val != ','){
                break;
            }else{
               scanner.nextToken();
            }
        }
    }
    //match({type: 'punctuator', value: ')'}, this.nextToken());
    scanner.nextToken();
    return rs;
};