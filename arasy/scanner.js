arasy.scanner = function( source ){

    var index = -1;
    var sourceLen = source.length;
    var lineNum = 0;

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
            if ( eof() ) {
                this.endIndex = index - 1;
            } else {
                this.endIndex = index;
            }
            this.value = val;
            this.endLine = lineNum;
            return this;
        },
        getToken: function( type ){
            if ( type == TokenType.Eof ) {
                return {
                    type: TokenType.Eof
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
        nextToken: nextToken,
        setCursor: setCursor
    };

    function setCursor( cursorIdx ){
        if ( typeof cursorIdx == 'undefined' ) {
            cursorIdx = -1;
        }
        index = cursorIdx;
    }

    function nextToken( env ){
        skipWhitespace();
        if ( eof() ) {
            return tokenGenerator.getToken( TokenType.Eof );
        }
        return action();
    }

    function action(){
        var chr = peek();
        var peekPos = index + 1;

        var token;

        if ( isNumericStart( chr, peekPos ) ) {
            token = numeric();
        } else if ( isStringStart( chr ) ) {
            token = string();
        } else if ( isCommentStart( chr, peekPos ) ) {
            token = comment();
        } else if ( isRegexpStart( chr ) ) {
            token = regexp();
        } else if ( isPunctuatorStart( chr, peekPos ) ) {
            token = punctuator();
        } else if( isTerminator( chr ) ){
            token = terminator();
        } else {
            token = identifier();
        }
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
        return source.charCodeAt( index+ (pos || 1) );
    }
    function peekAt( pos ){
        return source.charCodeAt( pos );
    }

    function next(){
        index++;
        return source.charCodeAt( index );
    }
    function retract(){
        index--;
    }
    function newLine(){
        lineNum++;
    }

    function isNumericStart( chr, idx ){
        //0~9
        if ( isNumber( chr ) ) {
            return true;
        }

        var peekChr = peekAt( idx + 1 );

        //.12
        if ( chr == 46/*'.'*/ ) {
            return isNumber( peekChr );
        }

        return false;
    }

    function isNumber( chr, nonZero ){
        // 0 - 9: charcode:  48 ~ 57
        if ( chr < 48 || chr > 57 ) {
            return false;
        }
        var min = nonZero ? 49 : 48;
        return chr >= min && chr <= 57;
    }

    function isExponentIndicator( chr ){
        // e: 101 || E: 69
        return chr == 101 || chr == 69;
    }

    function isHexDigit( chr ){
        // 0 - 9: 48 ~ 57
        // a - f: 97 ~ 102
        // A - F: 65 ~ 70

        return chr >= 48 && chr <= 57
             || ( chr >= 65 && chr <= 70  )
             || ( chr >= 97 && chr <= 102  )
    }

    function isRegexpStart( chr ){
        // / charCode: 47
        return  chr == 47 &&  arasy.isRegexpAcceptable;
    }

    function isCommentStart( chr, idx ){
        // charCode: 47 , *: 42
        var peekChr = peekAt( idx + 1 );
        return chr == 47 && (peekChr == 47 || peekChr == 42);
    }

    function isStringStart( chr ) {
        // ': 39, ": 34
        return chr == 39 || chr == 34;
    }
    function isPunctuatorStart( chr, idx ){
        // \: 92, u: 117
        var peekChr = peekAt( idx + 1 );
        if ( chr == 92 && peekChr == 117 ) {
            //identifier todo 检测后面是四个数字，否则raise error
            return false;
        }
        return operatorMap[getChr(chr)];
    }
    function isTerminator( chr ){
        return chr == 10;
    }
    function isWhiteSpace( chr ){
        var whiteSpaceMap = {
            '20':1,'A0':1,'1680':1,'180E':1,
            '2000':1,'2001':1,'2002':1,'2003':1,
            '2004':1,'2005':1,'2006':1,'2007':1,
            '2008':1,'2009':1,'200A':1,'202F':1,
            '205F':1,'3000':1,'9':1
        };
        return whiteSpaceMap[chr.toString(16)];
    }

    function isEscape( chr ){
        return chr == 92;
    }

    function isIdentifierStart( chr, idx ){
        if ( isStringStart( chr, idx ) ) {
            return false;
        }
        if ( isPunctuatorStart( chr, idx ) ) {
            return false;
        }
        if ( isWhiteSpace( chr, idx ) ) {
            return false;
        }
        if ( isTerminator( chr, idx ) ) {
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

        tokenGenerator.start( TokenType.Numeric );

        //check HexIntegerLiteral

        next_chr = peek();
        //0x为16进制
        //否则以0开始的为8进制,todo 在strict mode下8进制的数字字面量会报错
        if ( currentChr == 48/*0*/ && next_chr == 120/*'x'*/ || next_chr == 88/*'X'*/ ) {
            numericVal = '0' + getChr(next_chr);
            next();
            while ( currentChr = next() ) {
                if ( isHexDigit( currentChr ) ) {
                    numericVal += getChr(currentChr);
                } else {
                    retract();
                    break;
                }
            }
        } else {
            while( currentChr ){
                if( currentChr == 46/*'.'*/ && !dotExists){
                    next_chrOne = peek();
                    if( isNumber( next_chrOne ) || isExponentIndicator(next_chrOne) ){
                        dotExists = 1;
                        numericVal += getChr(currentChr) ;
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
                    if( isNumber( next_chr ) || next_chr == 43/*'+'*/ || next_chr == 45/*'-'*/ ){
                        eExists = 1;
                        numericVal += getChr(currentChr) + getChr(next());
                    }else{
                        retract();
                        break;
                    }
                }else if( isNumber( currentChr ) ){
                    numericVal += getChr(currentChr);
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
        var stringVal = getChr(startString);
        tokenGenerator.start( TokenType.String );

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
                    stringVal += getChr(chr) + getChr(next());
                }else{
                    stringVal += getChr(chr);
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
        var commentStr = getChr(currentChr);

        var extVal = 0;
        var nextChr = peek();

        var currentCommentType;

        if( window.initStateInfo && window.initStateInfo.extVal ){
            currentCommentType =  window.initStateInfo.extVal;
            extVal = 1;
        }else{
            if ( nextChr == 42/*'*'*/ ) {
                currentCommentType = commentType.MultiLineComment;
            } else {
                currentCommentType = commentType.SingleLineComment;
            }
        }

        tokenGenerator.start( TokenType.Comment );

        commentStr += getChr(next());

        var chr;
        if( currentCommentType == commentType.SingleLineComment ){
            while(chr = next()){
                if( isTerminator( chr ) ){
                    retract();
                    break;
                }
                commentStr += getChr(chr);
            }
        }else{
            while(chr = next()){
                nextChr = peek();

                if( chr == 42/*'*'*/ && nextChr == 47/*'/'*/ ){
                    next();
                    commentStr += '*/';
                    break;
                }
                if( isTerminator( chr ) ){
                    newLine();
                }
                commentStr += getChr(chr);
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
        var regexpStr = getChr(chr);


        var isInClass = 0;

        tokenGenerator.start( TokenType.RegularExpression );

        while( chr = next() ){

            //换行的话，直接回退上一步
            if( isTerminator( chr ) ){
                newLine();
            }

            regexpStr += getChr(chr);

            if( chr == 91/*'['*/ ){
                isInClass = 1;
            }
            if( chr == 93/*']'*/ ){
                isInClass = 0;
            }
            // 转义的\
            if( chr == 92/*'\\'*/ ){
                regexpStr += getChr(next());
            }
            if( !isInClass && chr == 47/*/*/ ){
                //如果match到最后的/，那么
                break;
            }
        }

        //check RegularExpressionFlags
        var peekChr = peek();
        if ( isIdentifierStart( peekChr, index + 1 ) ) {
            regexpStr += readIdentifier();

            //todo check flags is valid
        }

        tokenGenerator.end( regexpStr );
        return tokenGenerator.getToken();
    }

    function punctuator(){
        var currentChr = next();
        var punctuatorStr = getChr(currentChr);


        tokenGenerator.start( TokenType.Punctuator );

        while( currentChr = next() ){
            var currentStr = getChr(currentChr);
            if( !operatorMap[ punctuatorStr + currentStr ] ){
                retract();
                break;
            } else {
                punctuatorStr += currentStr;
            }
        }

        tokenGenerator.end( punctuatorStr );
        return tokenGenerator.getToken();
    }

    function identifier(){
        var identifierStr = getChr(next());
        var type = TokenType.Identifier;

        tokenGenerator.start( TokenType.Identifier );

        identifierStr += readIdentifier();

        tokenGenerator.end( identifierStr );


        if( keywordsMap.hasOwnProperty( String(identifierStr) ) ){
            type = TokenType.Keywords;
        }
        return tokenGenerator.getToken( type );
    }

    function readIdentifier(){
        var currentChr;
        var rs = '';

        while( currentChr = next() ){
            if( !isIdentifierStart( currentChr, index ) ) {
                retract();
                break;
            }
            rs += getChr(currentChr);
        }
        return rs;
    }

    function getChr( charCode ){
        return String.fromCharCode( charCode );
    }

    function terminator(){
        tokenGenerator.start( TokenType.Terminator );
        next();
        tokenGenerator.end( '\n' );
        return tokenGenerator.getToken();
    }
};