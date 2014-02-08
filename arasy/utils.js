function makeMap( str ){
    var rs = {},
        arr = str.split( ' ' ),
        arrLen = arr.length;

    for ( i = 0; i < arrLen; i++ ) {
        rs[ arr[i] ] = arr[i];
    }
    return rs;
}