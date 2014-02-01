var tokenList = {
    index: 0,
    list: [{
        type: 'eof',
        val: 'eof'
    }],
    consume: function(){
        if ( this.eof() ) {
            return this.eof();
        }
        return tokenList.list[ this.index++ ];
    },
    lookAhead: function(){
        if ( this.eof() ) {
            return this.eof();
        }
        return tokenList.list[ this.index ];
    },
    eof: function(){
        if ( this.index >= tokenList.list.length - 1 ) {
            return {
                type: 'eof',
                val: 'eof'
            }
        }
    }
};