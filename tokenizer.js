/**
 * Created with JetBrains WebStorm.
 * User: chengchao01
 * Date: 13-1-20
 * Time: 下午1:58
 * To change this template use File | Settings | File Templates.
 */

var YAP = function(){
    var Keywords = "break do instanceof typeof case else new var catch finally return void continue for switch while debugger function this with default if throw delete in try".split(' ');
    var FutureReservedKeywords = "class enum extends super const export import".split(' ');
    var StrictKeywords = "implements let private public interface package protected static yield".split(' ');
    var Punctuator = "{ } ( ) [ ] . ; , < > <= >= == != === !== + - * % ++ -- << >> >>> & | ^ ! ~ && || ? : = += -= *= %= <<= >>= >>>= &= |= ^=".split(' ');

    var source = '';
    var tokenList = [];
    var index = 0;
    var lineNum = 0;//当前的行
    var offset = 0;//str在当前行的offset
    var sourceLen = 0;
    var str = '';
    var next_str = '';
    var next_str2 = '';

    var buffer = [];

    function tokenizer( code ){
        init( code );
        while( !eof() ){
            str = read();
            if ( isWhiteSpace( str ) ) {
                //空白符
                skipWhiteSpace();
            }else if(isNumberStart( str )){
                parseNumber();
            }else if( isPunctuator( str ) ){
                //操作符、运算符等
                parsePunctuator();
            }else if( isStringStart( str ) ){
                parseString();
            }else if( isCommentStart( str ) ){
                parseComment();
            }else if( isLineTerminator( str )){
				parseLineTerminator();
			}else{
                parseID();
            }

        }
        return tokenList;
    }

    function init( code ){
        source = code;
        sourceLen = source.length;
        tokenList = [];
        buffer = [];
        index = 0;
        lineNum = 0;
        offset = 0;
    }
    function eof(){
        return index >= sourceLen;
    }

    function read( offset ){
        return source.charAt(typeof offset == 'undefined' ? index : offset);
    }
	
	//回退
	function retract( offset ){
		
	}

    function emitToken( token ){
        buffer = [];
        tokenList.push( token );
    }

    function parseNumber(){
        var start = index;
        var currentChr = '';
        var next_chr = '';
        var dotExists = 0;
        var eExists = 0;
        for(; start < sourceLen; start++){
            currentChr = read( start );
            if( currentChr == '.' && !dotExists){
                next_chr = read( start + 1 );
                if( next_chr >= '0' && next_chr <= '9' ){
                    dotExists = 1;
                    buffer.push( currentChr ) ;
                }else{
                    start--;
                    break;
                }
            }else if( currentChr.toLowerCase() == 'e' && !eExists){
                next_chr = read( start + 1 );
                if( next_chr >= '0' && next_chr <= '9' ){
                    eExists = 1;
                    buffer.push( currentChr ) ;
                }else{
                    start--;
                    break;
                }
            }else if( currentChr >= '0' && currentChr <= '9' ){
                buffer.push( currentChr );
            }else {
                start--;
                break;
            }
        }
        if( start == sourceLen ){
            start = start - 1;
        }
        var token = {
            type: 'number',
            lineNum: lineNum,
            start: index,
            end: start,
            value: buffer.join('')
        };
        emitToken( token );
        index = start+1;
    }

    function parseString(  ){
        var start = index;
        var currentChr = read( start );
        var stringStart = currentChr;
        var next_chr = '';
        var token = {
            type: 'string',
            value: '',
            startLineNum: lineNum,
            start: index,
            end: start,
            endLineNum: lineNum
        };

        buffer.push( currentChr );

        for(start = start + 1; start < sourceLen; start++){
            currentChr = read( start );
            if( currentChr == stringStart ){
                buffer.push( currentChr );
                break;
            }
            //转义
            if( currentChr == '\\' ){
                buffer.push( currentChr );

                if( ( start + 1 ) < sourceLen ){
                    start = start + 1;
                    next_chr = read( start );
                    if( isLineTerminator(next_chr) ){
                        lineNum++;
                    }
                    buffer.push( next_chr );
                }
                continue;
            }
			if( isLineTerminator( currentChr )  ){
				start--;
				break;
			}
            buffer.push( currentChr );

        }
        if( start == sourceLen ){
            start = start - 1;
        }
        
        token.value = buffer.join('');
        token.end = start;
        token.endLineNum = lineNum;
        emitToken( token );
		index = start+1;
    }


    function parsePunctuator(){
        var start = index;
        var currentChr = '';
        for(; start < sourceLen ; start++ ){
            currentChr = read( start );
            if( !isPunctuator( currentChr ) || isWhiteSpace( currentChr ) || isLineTerminator( currentChr ) ){
                start--;
                break;
            }
			buffer.push( currentChr );
        }
        if( start == sourceLen ){
            start = start - 1;
        }
        var token = {
            type: 'punctuator',
            value: buffer.join(''),
            start: index,
            end: start
        };
        emitToken( token );
        index = start+1;
    }

	function parseLineTerminator(){
		var token = {
			type: 'LineTerminator',
			start: index
		};
		emitToken( token );
		lineNum++;
		index++;
	}

    function skipWhiteSpace(){
        var start = index;
        var currentChr = '';
        for(; start < sourceLen ; start++ ){
            currentChr = read( start );
            if( !isWhiteSpace( currentChr ) ){
                start--;
                break;
            }
        }
        if( start == sourceLen ){
            start = start - 1;
        }
        var token = {
            type: 'whitespace',
            value: source.substr( index, start - index + 1 ),
            start: index,
            end: start
        };
        emitToken( token );
        index = start+1;
    }

    function isWhiteSpace( str ){
		var whiteSpaceMap = {
			'20':1,'A0':1,'1680':1,'180E':1,
			'2000':1,'2001':1,'2002':1,'2003':1,
			'2004':1,'2005':1,'2006':1,'2007':1,
			'2008':1,'2009':1,'200A':1,'202F':1,
			'205F':1,'3000':1
		};
        return whiteSpaceMap[str.charCodeAt(0).toString(16)];
    }

	function isLineTerminator( str ){
		return str.charCodeAt(0) == 10;
	}

    function isPunctuator( str ){
        return isInArray( Punctuator, str );

    }

    function isStringStart( str ){
        return str == '\'' || str == '"';
    }
    function isCommentStart( str ){
		var nextChr = source.charAt(index+1);
		return str == '/' && (nextChr == '/' || nextChr == '*');
    }

	function parseComment( ){
		var start = index;
		var commentStart = source.charAt( start );
		var commentType = source.charAt( start+1 );
		var commentType = (['singleline', 'multiline'])[+(commentType == '*')];
		var comment = {
			start: start,
			startLineNum: lineNum,
			end: 0,
			type: commentType
		};

		var chr;
		if( commentType == 'singleline' ){
			while( start < sourceLen && (chr = read(start).charCodeAt(0)) != 10 ){
				if( read(start+1).charCodeAt(0) == 10 ){
					comment.endLineNum = lineNum;
					comment.end = start;
					index = start + 1;
					emitToken( comment );
					return;
				}
				start++;
			}
			comment.endLineNum = lineNum;
			comment.end = start;
			index = start+1;
			emitToken( comment );
			return;
		}
		console.log(index);
		while( start < sourceLen ){
			if ( read(start).charCodeAt(0) == 42 && read(start + 1).charCodeAt(0) == 47 ) {
				comment.end = start + 1;
				comment.endLineNum = lineNum;
				index = start + 2;
				emitToken( comment );
				return; 
			}
			if( read(start).charCodeAt(0) == 10 ){
				lineNum++;
			}
			start++;
		}
		comment.end = start;
		comment.endLineNum = lineNum;
		index = start+1;
		emitToken( comment );
		return;	
	}

    function isNumber( str ){
        return str == '.' || (str >= '0' && str <= '9')
    }
	
	function isNumberStart( str ){
		var nextChr = read( index + 1 );
		return (str == '.' && nextChr >= '0' && nextChr <= '9') || (str >= '0' && str <= '9')
	}

    function isInArray( arr, clue ){
        for( var i = 0, len = arr.length; i < len; i++ ){
            if( arr[i] == clue ){
                return 1;
            }
        }
        return 0;
    }

    function parseID(  ){
        var start = index;
        for(; start < sourceLen; start++){
            var currentChr = read( start );
            if( isWhiteSpace( currentChr ) || isLineTerminator( currentChr ) || isPunctuator( currentChr )
                ){
                start = start - 1;
                break;
            }
            buffer.push( currentChr );
        }
        if( start == sourceLen ){
            start = start - 1;
        }

        var token = {
            type: 'ID',
            value: buffer.join(''),
            start: index,
            end: start,
            lineNum: lineNum
        };
        emitToken( token );
        index = start + 1;
    }



    return {
        tokenizer: tokenizer
    }
}();
