function makeMap( source, delimiter ){
    var rs = {};
    delimiter = arguments.length == 2 ? delimiter : ' ';

    if ( Object.prototype.toString.call( source ) == '[object String]' ) {
        source = source.split( delimiter );
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

function maybeValue( val, token ){
    return val == token.value;
}

function maybeType( type, token ){
    return type == token.type;
}

function expectValue( value, token ){
    if ( value != token.value ) {
        raiseError( token, 'Unexpected Token' );
    }
}

function expectType( type, token ){
    if ( type != token.type ) {
        raiseError( token, 'Unexpected Token' );
    }
}

function match( obj, token ){
    var typeRs = valueRs = 1;
    if( obj.type && obj.type != token.type ){
        typeRs = 0;
    }
    if( obj.value && obj.value != token.value ){
        valueRs = 0;
    }

    return typeRs == 1 && valueRs == 1 ? token : false;
}

function raiseError( errorToken, msg ){
    throw new Error( msg + ': ' + errorToken.value );
}