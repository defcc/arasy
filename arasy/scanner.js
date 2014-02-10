arasy.scanner = function( source ){

    var index = -1;
    var source = source;
    var sourceLen = source.length;
    var lineNum = 0;

    return {
        nextToken: nextToken
    };

    function nextToken(){
        for ( ; index < sourceLen; index++ ) {
            action();
        }
    }

    function action(){
        var chr = peek();
        if ( isNumericStart( chr ) ) {
            numeric();
        } else if ( isStringStart( chr ) ) {
            string();
        } else if ( isPunctuatorStart( chr ) ) {
            punctuator();
        } else if ( isRegexpStart( chr ) ) {
            regexp();
        } else if ( isCommentStart( chr ) ) {
            comment();
        } else if( isTerminator( chr ) ){
            terminator();
        }
    }

    function peek( pos ){
        return source.charAt( index+ pos || 1 );
    }

    function next(){
        index++;
        return source.charAt( index );
    }
    function retract(){
        index--;
    }

    function isNumericStart( chr ){
        //0~9
        if ( isNumber( chr ) ) {
            return true;
        }

        //.12
        if ( chr == '.' ) {
            var nextChr = peek();
            return isNumber( nextChr );
        }

        return false;
    }

    function isNumber( chr, nonZero ){
        var min = nonZero ? 1 : 0;
        return chr >= min && chr <= 9;
    }

    function isExponentIndicator( chr ){
        return chr == 'e' || chr == 'E';
    }

    function isHexDigit( chr ){
        var hexDigitMap = makeMap('0123456789abcdefABCDEF');
        return hexDigitMap.hasOwnProperty( chr );
    }

    function isRegexpStart(){

    }

    function isCommentStart(){

    }

    function isStringStart( chr ) {
        return chr == '\'' || chr == '"';
    }
    function isPunctuatorStart( chr ){
        return operatorMap[chr];
    }
    function isTerminator( chr ){
        return chr.charCodeAt(0) == 10;
    }
    function isWhiteSpace( chr ){
        var whiteSpaceMap = {
            '20':1,'A0':1,'1680':1,'180E':1,
            '2000':1,'2001':1,'2002':1,'2003':1,
            '2004':1,'2005':1,'2006':1,'2007':1,
            '2008':1,'2009':1,'200A':1,'202F':1,
            '205F':1,'3000':1,'9':1
        };
        return whiteSpaceMap[chr.charCodeAt(0).toString(16)];
    }

    function isIdentifierStart( chr ){
        if ( isStringStart( chr ) ) {
            return false;
        }
        if ( isPunctuatorStart( chr ) ) {
            return false;
        }
        if ( isWhiteSpace( chr ) ) {
            return false;
        }
        if ( isTerminator( chr ) ) {
            return false;
        }
        return true;
    }


    /*
    *
    * errors here  7.8.3
    *
    * */
    function numeric(){
        var numericVal = '';
        var currentChr = next();

        var next_chr   = '';
        var next_chrOne;

        var dotExists = 0;
        var eExists = 0;

        var start = index + 1;

        tokenGenerator.start( tokensMap.Numeric, start, lineNum );

        //check HexIntegerLiteral
        if ( currentChr == 0 ) {
            next_chr = peek();
            if ( next_chr == 'x' || next_chr == 'X' ) {
                numericVal = '0' + next_chr;
                while ( currentChr == next() ) {
                    if ( isHexDigit( currentChr ) ) {
                        numericVal += currentChr;
                    } else if ( isIdentifierStart( currentChr ) ) {
                        retract();
                        break;
                    }
                }
            }
        } else {
            while( currentChr ){
                if( currentChr == '.' && !dotExists){
                    next_chrOne = peek();
                    if( isNumber( next_chrOne ) || isExponentIndicator(next_chrOne) ){
                        dotExists = 1;
                        numericVal += currentChr ;
                    }else{
                        retract();
                        break;
                    }
                }else if( isExponentIndicator(currentChr) && !eExists){
                    //e || E
                    next_chr = peek();
                    if( isNumber( next_chr ) ){
                        eExists = 1;
                        numericVal += currentChr;
                    }else{
                        retract();
                        break;
                    }
                }else if( isNumber( currentChr ) ){
                    numericVal += currentChr;
                }else {
                    retract();
                    break;
                }
                currentChr = next();
            }
        }

        if ( isIdentifierStart( peek() ) ) {
            //todo raise error;
        }

        tokenGenerator.end( numericVal, index, lineNum );
        return tokenGenerator.getToken();
    }

    function string(){

    }

    function comment(){

    }

    function regexp(){

    }

    function punctuator(){

    }
    function terminator(){

    }
};