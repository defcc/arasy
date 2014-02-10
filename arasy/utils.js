function makeMap( source, delimiter ){
    var rs = {};
    delimiter = arguments.length == 2 ? delimiter : ' ';

    if ( Object.prototype.toString.call( source ) == '[object String]' ) {
        source = source.split( ' ' );
        var sourceLen = source.length;

        for ( i = 0; i < sourceLen; i++ ) {
            rs[ source[i] ] = source[i];
        }
    } else {
        for ( var key in source ) {
            if ( source.hasOwnProperty( key ) ) {
                rs[ key ] = key;
            }
        }
    }

    return rs;
}

function makeArray( obj ){
    if ( Object.prototype.toString.call( obj ) == '[object Array]' ) {
        return obj;
    } else {
        return [obj];
    }
}
var tokenGenerator = {
    type: '',
    value: '',
    start: '',
    end: '',
    startLine: '',
    endLine: '',
    start: function( type, start, startLine ){
        this.type = type;
        this.start = start;
        this.startLine = startLine;
    },
    end: function( val, end, endLine ){
        this.value = val;
        this.end = end;
        this.endLine = endLine;
    },
    getToken: function( type ){
        if ( type == tokenType.Eof ) {
            return {
                type: tokenType.Eof
            }
        }
        return {
            type: this.type,
            value: this.value,
            start: this.start,
            end: this.end,
            startLine: this.startLine,
            endLine: this.endLine
        }
    }
};