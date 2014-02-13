arasy.scanner = function( source ){

    var index = -1;
    var sourceLen = source.length;
    var lineNum = 0;

    var acceptRegexp = 1;

    function updateRegexpAcceptable( env ){
        acceptRegexp  = 0;
    }

    var tokenGenerator = {
        type: '',
        value: '',
        startIndex: '',
        endIndex: '',
        startLine: '',
        endLine: '',
        start: function( type ){
            this.type = type;
            this.startIndex = index;
            this.startLine = lineNum;
            return this;
        },
        end: function( val ){
            this.value = val;
            this.endIndex = index;
            this.endLine = lineNum;
            return this;
        },
        getToken: function( type ){
            if ( type == tokenType.Eof ) {
                return {
                    type: tokenType.Eof
                }
            }
            return {
                type: type || this.type,
                value: this.value,
                start: this.startIndex,
                end: this.endIndex,
                startLine: this.startLine,
                endLine: this.endLine
            }
        }
    };

    return {
        nextToken: nextToken
    };

    function nextToken( env ){
        updateRegexpAcceptable( env );
        if ( eof() ) {
            return tokenGenerator.getToken( tokenType.Eof );
        }
        return action();
    }

    function action(){
        skipWhitespace();

        var chr = peek();
        var chr2 = peek( 2 );

        var token;

        if ( isNumericStart( chr, chr2 ) ) {
            token = numeric();
        } else if ( isStringStart( chr ) ) {
            token = string();
        } else if ( isCommentStart( chr ) ) {
            token = comment();
        } else if ( isRegexpStart( chr ) ) {
            token = regexp();
        } else if ( isPunctuatorStart( chr ) ) {
            token = punctuator();
        } else if( isTerminator( chr ) ){
            token = terminator();
        } else {
            token = identifier();
        }
        console.log( token );
        return token;
    }

    function skipWhitespace(){
        var chr;
        while( chr = next() ){
            if( !isWhiteSpace( chr ) ){
                retract();
                break;
            }
        }
    }

    function eof(){
        return index >= sourceLen - 1;
    }

    function peek( pos ){
        return source.charAt( index+ (pos || 1) );
    }

    function next(){
        index++;
        return source.charAt( index );
    }
    function retract(){
        index--;
    }
    function newLine(){
        lineNum++;
    }

    function isNumericStart( chr, peekChr ){
        //0~9
        if ( isNumber( chr ) ) {
            return true;
        }

        //.12
        if ( chr == '.' ) {
            return isNumber( peekChr );
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
        var hexDigitMap = makeMap('0123456789abcdefABCDEF', '');
        return hexDigitMap.hasOwnProperty( chr );
    }

    function isRegexpStart( chr ){
        if ( chr == '/' &&  regexpAcceptable ) {
            return 1;
        }
        return 0;
    }

    function isCommentStart( chr ){
        var nextChr = peek();
        return chr == '/' && (nextChr == '/' || nextChr == '*');
    }

    function isStringStart( chr ) {
        return chr == '\'' || chr == '"';
    }
    function isPunctuatorStart( chr ){
        var nextChr = peek();
        if ( chr == '\\' && nextChr == 'u' ) {
            //identifier todo 检测后面是四个数字，否则raise error
            return false;
        }
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

    function isEscape( chr ){
        return chr == '\\';
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

        tokenGenerator.start( tokenType.Numeric );

        //check HexIntegerLiteral

        next_chr = peek();
        //0x为16进制
        //否则以0开始的为8进制,todo 在strict mode下8进制的数字字面量会报错
        if ( currentChr == 0 && next_chr == 'x' || next_chr == 'X' ) {
            numericVal = '0' + next_chr;
            next();
            while ( currentChr = next() ) {
                if ( isHexDigit( currentChr ) ) {
                    numericVal += currentChr;
                } else if ( isIdentifierStart( currentChr ) ) {
                    retract();
                    break;
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
                    //e1
                    //e+1
                    //e-1
                    next_chr = peek();
                    if( isNumber( next_chr ) || next_chr == '+' || next_chr == '-' ){
                        eExists = 1;
                        numericVal += currentChr + next();
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

        tokenGenerator.end( numericVal );
        return tokenGenerator.getToken();
    }

    function string(){
        var startString = next();
        var string_quote = startString;
        var extVal = 0;
        if( window.initStateInfo && window.initStateInfo.extVal ){
            string_quote =  initStateInfo.extVal;
            extVal = 1;
        }

        var chr = '';
        var stringVal = startString;
        tokenGenerator.start( tokenType.String );

        if( extVal && startString == string_quote ){
            //如果是有开始信息的,且第一个字符是字符串的开始字符，那么直接结束
        }else{
            while( chr = next() ){
                //如果后面是新行，那么token中断
                //todo raise error
                if( isTerminator( chr ) ){
                    retract();
                    break;
                }
                //如果是转义字符，那么向前看一个
                if( isEscape( chr ) ){
                    //换行转义。那么加一行
                    if( isTerminator( peek() ) ){
                        newLine();
                    }
                    stringVal += chr + next();
                }else{
                    stringVal += chr;
                    //如果是字符串结束符
                    if( chr == string_quote ){
                        break;
                    }
                }
            }
        }

        tokenGenerator.end( stringVal );

        return tokenGenerator.getToken();
    }

    function comment(){
        var currentChr = next();
        var commentStr = currentChr;

        var extVal = 0;
        var nextChr = peek();

        var currentCommentType;

        if( window.initStateInfo && window.initStateInfo.extVal ){
            currentCommentType =  window.initStateInfo.extVal;
            extVal = 1;
        }else{
            if ( nextChr == '*' ) {
                currentCommentType = commentType.MultiLineComment;
            } else {
                currentCommentType = commentType.SingleLineComment;
            }
        }

        tokenGenerator.start( tokenType.Comment );

        commentStr += next();

        var chr;
        if( currentCommentType == commentType.SingleLineComment ){
            while(chr = next()){
                if( isTerminator( chr ) ){
                    retract();
                    break;
                }
                commentStr += chr;
            }
        }else{
            while(chr = next()){
                nextChr = peek();

                if( chr == '*' && nextChr == '/' ){
                    next();
                    commentStr += '*/';
                    break;
                }
                if( isTerminator( chr ) ){
                    newLine();
                }
                commentStr += chr;
            }
        }
        tokenGenerator.end( commentStr );

        return tokenGenerator.getToken();
    }

    function regexp(){
        ///\/
        /*
         '[' => 91, ']' => 93
         */
        var chr = next();
        var regexpStr = chr;


        var isInClass = 0;

        tokenGenerator.start( tokenType.RegularExpression );

        while( chr = next() ){

            //换行的话，直接回退上一步
            if( isTerminator( chr ) ){
                retract();
                break;
            }

            regexpStr += chr;

            if( chr == '[' ){
                isInClass = 1;
            }
            if( chr == ']' ){
                isInClass = 0;
            }
            // 转义的\
            if( chr == '\\' ){
                regexpStr += next();
            }
            if( !isInClass && chr == '/' ){
                //如果match到最后的/，那么
                break;
            }

        }

        tokenGenerator.end( regexpStr );
        return tokenGenerator.getToken();
    }

    function punctuator(){
        var currentChr = next();
        var punctuatorStr = currentChr;


        tokenGenerator.start( tokenType.Punctuator );

        while( currentChr = next() ){
            if( !operatorMap[ punctuatorStr + currentChr ] ){
                retract();
                break;
            } else {
                punctuatorStr += currentChr;
            }
        }

        tokenGenerator.end( punctuatorStr );
        return tokenGenerator.getToken();
    }

    function identifier(){
        var currentChr = next();

        var identifierStr = currentChr;
        var type = tokenType.Identifier;

        tokenGenerator.start( tokenType.Identifier );

        while( currentChr = next() ){
            if( isWhiteSpace( currentChr ) || isTerminator( currentChr ) || isPunctuatorStart( currentChr )
                || isStringStart( currentChr )
                ){
                retract();
                break;
            }
            identifierStr += currentChr;
        }

        tokenGenerator.end( identifierStr );


        if( keywordsMap[ String(identifierStr) ] ){
            type = tokenType.Keywords;
        }
        return tokenGenerator.getToken( type );
    }

    function terminator(){
        tokenGenerator.start( tokenType.Terminator );
        next();
        tokenGenerator.end( '\n' );
        return tokenGenerator.getToken();
    }
};