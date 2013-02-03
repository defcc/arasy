/*
fixme: 最后一个token的index不正确
@TODO: 注释里面的处理 && 状态转移的优化

除法运算符和正则开始符
1. 目前来看，仅仅词法分析阶段，比较难区分。只有当左边和右边都是表达式的时候，/才是除法运算符
2. 简化一下，处理正则开始符号
	a. 如果前面是,或者;或者[或者(或者{或者:时，即可看成是正则开始符号
	b. 前面是keywords，

3. 从实际来看，可以考虑在遇到slash时转入到语法分析，看看前面是否为表达式

test case

var a,g; (a)/a/g;
var a,g;if(a)/a/g;
var g; void function(){}/2/g
var g; function t(){}/2/g

*/
/**
* '\///
----------------
| char | code |
|  /   |  47  |
|  *   |  42  |
|  "   |  34  | 
|  '   |  39  | 
|  \   |  92  | 
|  e   |  101 | 
|  E   |  69  | 
----------------
*
*/

function YAP( source, keepWS ){
	
	//define states
	var END_STATE		 = 'eof';
	var START_STATE		 = 'start';
	var ID_STATE		 = 'id';
	var STRING_STATE	 = 'string';
	var NUMBER_STATE	 = 'numeric';
	var PUNCTUATOR_STATE = 'pun';
	var DIV_STATE		 = 'div'; //和punctuator是一起的。
	var COMMENT_STATE	 = 'comment';
	var REGEXP_STATE	 = 'regexp'
	var WS_STATE		 = 'ws';
	var TERMINATOR_STATE = 'terminator';
	

	var ID_TOKEN		 = 'id';
	var NUMBER_TOKEN	 = 'number';
	var STRING_TOKEN	 = 'string';
	var WS_TOKEN		 = 'whitespace';
	var TERMINATOR_TOKEN = 'terminator';
	var MCOMMENT_TOKEN	 = 'mcomment';
	var SCOMMENT_TOKEN	 = 'scomment';
	var REGEXP_TOKEN	 = 'regexp';


    var Keywords = "break do instanceof typeof case else new var catch finally return void continue for switch while debugger function this with default if throw delete in try".split(' ');
    var FutureReservedKeywords = "class enum extends super const export import".split(' ');
    var StrictKeywords = "implements let private public interface package protected static yield".split(' ');
    var Punctuator = "{ } ( ) [ ] . ; , < > <= >= == != === !== + - * % ++ -- << >> >>> & | ^ ! ~ && || ? : = += -= *= %= <<= >>= >>>= &= |= ^=".split(' ');


	var state = START_STATE;
	var tokenList = [];
	var source;
	var sourceLen;
	var index = 0;
	var lineNum = 0;
	var lastToken = null;

	var CHR = '';

	
		state = START_STATE;
		tokenList = [];
		source = source;
		sourceLen = source.length;
		index = -1;
		lineNum = 0;
	
	keepWS = typeof keepWS ? keepWS : 1;

	var parse = function(){
		
		mainLoop:
		while( !eof() ){
			switch( state ){
				case START_STATE:
					//peek and set the state
					parseStart();
					break;
				
				case WS_STATE:
					parseWS();
					break;

				case STRING_STATE:
					parseString();
					break;

				case NUMBER_STATE:
					parseNumber();
					break;
				
				case PUNCTUATOR_STATE:
					parsePunctuator();
					break;
				
				case COMMENT_STATE:
					parseComment();
					break;

				case TERMINATOR_STATE:
					parseTerminator();
					break;

				case ID_STATE:
					parseID();
					break;

				case REGEXP_STATE:
					parseRegexp();
					break;

				case DIV_STATE:
					parseDiv();
					break;
				
				case END_STATE:
				default:
					break mainLoop;
					break;
			}
		}
		return tokenList;
	};

	return {
		parse: parse
	}

	
	function parseStart(){
		var chr = peek( index + 1 );
		
		if( isStringStart( chr ) ){
			state = STRING_STATE;	
		}else if( isWhiteSpace( chr ) ){
			state = WS_STATE;
		}else if( isNumberStart( chr, index + 1 ) ){
			state = NUMBER_STATE;
		}else if( isPunctuator( chr ) ){
			state = PUNCTUATOR_STATE;
		}else if( isCommentStart( chr, index + 1 ) ){
			state = COMMENT_STATE;
		}else if( isRegexpStart( chr, index + 1 ) ){
			state = REGEXP_STATE;
		}else if( isDivStart( chr ) ){
			//先看是否是除法运算符
			state = DIV_STATE;
		}else if( isTerminator( chr )){
			state = TERMINATOR_STATE;
		}else if ( isNaN(chr) ){
			state = END_STATE;
		}else{
			state = ID_STATE;
		}
	}



	function parseString(){
		var string_quote = nextChr();
		var buffer = [];
		var token = {
			type: STRING_TOKEN,
			start: index,
			startLine: lineNum,
			end: index,
			endLine: lineNum,
			value: ''
		};
		var chr = '';
		push2buffer(buffer, string_quote) ;
		while( chr = nextChr()){
			//如果是新行
			if( isTerminator( chr ) ){
				state = TERMINATOR_STATE;
				retract();
				break;	
			}
			//如果是转义字符，那么向前看一个
			if( isEscape( chr ) ){
				if( isTerminator( peek( index+1 ) ) ){
					newLine();	
				}
				push2buffer(buffer, chr) ;
				push2buffer(buffer, nextChr()) ;
			}else{
				push2buffer(buffer, chr) ;
				if( chr == string_quote ){
					state = START_STATE;
					break;
				}
			}
		}

		token.endLine = lineNum;
		token.end	  = index;
		token.value	  = buffer.join('');

		emitToken( token );

	}

	function parseNumber(){
		var buffer = [];
        var currentChr = '';
        var next_chr = '';
        var dotExists = 0;
        var eExists = 0;
		var start = index + 1;
		var tk = {
			type: 'number',
			start: start,
			startLine: lineNum,
			end: start,
			endLine: lineNum,
			value: ''
			
		};
		while( currentChr = nextChr() ){
			if( currentChr == 46 && !dotExists){
                next_chrOne = peek( index + 1 );
                if( isNumber( next_chrOne ) ){
                    dotExists = 1;
                    push2buffer(buffer, currentChr) ;
                }else{
                    state = START_STATE;
					retract();
                    break;
                }
            }else if( (currentChr == 101 || currentChr == 69) && !eExists){
				//e || E
                next_chr = peek( start + 1 );
                if( isNumber( nextChr ) ){
                    eExists = 1;
                    push2buffer(buffer, currentChr) ;
                }else{
                    state = START_STATE;
					retract();
                    break;
                }
            }else if( isNumber( currentChr ) ){
                push2buffer(buffer, currentChr) ;
            }else {
                state = START_STATE;
				retract();
                break;
            }
		}
		tk.end = index;
		tk.endLine = lineNum;
		tk.value = buffer.join('');
        emitToken( tk );
    }

	function parseWS(){
        var buffer = [];
        var currentChr = '';
	
		var tk = {
			type: 'whitespace',
			start: index + 1,
			startLine: lineNum,
			endLine: lineNum
		};

		while( currentChr = nextChr() ){
			if( !isWhiteSpace( currentChr ) ){
                state = START_STATE;
				retract();
                break;
            }
			push2buffer( buffer, currentChr );
		}

		tk.end = index;
		tk.value = buffer.join('');
        emitToken( tk );
    }

	function parsePunctuator(){
        var buffer = [];
        var currentChr = '';

		var tk = {
			type: 'punctuator',
			start: index + 1,
			startLine: lineNum,
			endLine: lineNum
		};
		
		while( currentChr = nextChr() ){
			if( !isPunctuator( currentChr ) || isWhiteSpace( currentChr ) || isTerminator( currentChr ) ){
                state = START_STATE;
				retract();
                break;
            }
			push2buffer( buffer, currentChr );
		}

		tk.end = index;
		tk.value = buffer.join('');
        emitToken( tk );
    }

	function parseDiv(){
		var buffer = [];
		var chr = nextChr();
		push2buffer( buffer, chr );
		var tk = {
			type: 'punctuator',
			start: index,
			startLine: lineNum,
			endLine: lineNum
		}
		if( chr = nextChr() ){
			// = 
			if( chr == 61 ){
				push2buffer( buffer, chr );	
			}else{
				state = START_STATE;
				retract();
			}
		}
		tk.end = index;
		tk.value = buffer.join('');
        emitToken( tk );
	}

	function parseID( ){
        var buffer = [];
        var currentChr = '';
		
		var tk = {
			type: 'ID',
			start: index + 1,
			startLine: lineNum,
			endLine: lineNum
		};

		while( currentChr = nextChr() ){
			if( isWhiteSpace( currentChr ) || isTerminator( currentChr ) || isPunctuator( currentChr )
				|| isStringStart( currentChr ) || currentChr == 47
                ){
                state = START_STATE;
				retract();
                break;
            }
            push2buffer( buffer, currentChr );
		}

        tk.end = index;
		tk.value = buffer.join('');
		if( isKeyWords( tk.value ) ){
			tk.type = 'keywords';
		}
        emitToken( tk );
    }

	function parseTerminator(){
		nextChr();
		var tk = {
			type: TERMINATOR_TOKEN,
			lineNum: lineNum
		};
		emitToken( tk );
		newLine();
		state = START_STATE;
	}

	function parseRegexp(){
		///\/
		/*
			'[' => 91, ']' => 93
		*/
		var buffer = [];
		var chr = nextChr();
		push2buffer( buffer, chr );


		var isInClass = 0;

		var tk = {
			type: 'regexp',
			start: index + 1,
			startLine: lineNum,
			endLine: lineNum
		};

		while( chr = nextChr() ){
			
			//push2buffer( buffer, chr );

			//换行的话，直接回退上一步
			if( isTerminator( chr ) ){
				state = TERMINATOR_STATE;
				retract();
                break;
			}

			push2buffer( buffer, chr );
			
			if( chr == 91 ){
				isInClass = 1;
			}
			if( chr == 93 ){
				isInClass = 0;
			}
			// 转义的\
			if( chr == 92 ){
				push2buffer( nextChr() );
			}
			if( !isInClass && chr == 47 ){
				//如果match到最后的/，那么
				state = START_STATE;
				break;
			}
				
		}

		tk.end = index;
		tk.value = buffer.join('');
        emitToken( tk );
	}
	
	function parseComment( ){
		var buffer = [];
        var currentChr = nextChr();;

		var commentType = peek( index + 1 );
		var commentType = ([SCOMMENT_TOKEN, MCOMMENT_TOKEN])[+(commentType == 42)];
		var tk = {
			start: index,
			startLineNum: lineNum,
			type: commentType
		};
		
		push2buffer( buffer, currentChr );
		var chr;
		if( commentType == 'scomment' ){
			while(chr = nextChr()){
				if( isTerminator( chr ) ){
					state = TERMINATOR_STATE;
					retract();
					break;
				}
				push2buffer( buffer, chr );
			}
		}else{
			while(chr = nextChr()){
				var peek1 = peek( index + 1 );
				
				if( isEscape( chr ) && peek1 ){
					if( peek1 == 47 ){
						push2buffer( buffer, chr );
						push2buffer( buffer, nextChr() );
						continue;
					}
				}

				if( chr == 42 && peek1 == 47 ){
					state = START_STATE;
					push2buffer( buffer, chr );
					push2buffer( buffer, nextChr() )
					break;
				}
				if( isTerminator( chr ) ){
					newLine();
				}
				push2buffer( buffer, chr );
				
			}
		}
		tk.endLine = lineNum;
		tk.end = index;
		tk.value = buffer.join('');
		emitToken( tk );
	}



	function push2buffer( buffer, chr ){
		buffer.push(String.fromCharCode(chr));
	}
	
	function eof(){
		return index >= sourceLen;
	}
	
	
	function emitToken( tk ){
		if( !keepWS && (tk.type == 'whitespace' || tk.type == 'terminator') ){
			return;
		}
		tokenList.push( tk );
		tk.type != 'whitespace' && (lastToken = tk);
	}

	function isTerminator( chr ){
		return chr == 10;
	}

	function isCommentStart( chr, index ){
		var nextChr = peek(index+1);
		return chr == 47 && (nextChr == 47 || nextChr == 42);
    }

	function isStringStart( chr ){
		// ' OR "
        return chr == 39 || chr == 34;
    }

	function isNumberStart( chr, index ){
		var nextChr = peek( index + 1 );
		return chr == '.' && isNumber( nextChr ) || isNumber(chr, 1);
	}

	function isNumber( chr, startOne ){
		//48-57
		return chr <= 57 && chr >= (startOne?49:48);
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

	function isPunctuator( chr ){
        return isInArray( Punctuator, String.fromCharCode( chr ) );
    }

	function isEscape( chr ){
		return chr == 92;
	}

	function isKeyWords( id ){
		return isInArray(Keywords, id) || 
			isInArray(FutureReservedKeywords, id) ||
			isInArray(StrictKeywords, id);
	}

	function isDivStart( chr, index ){
		//以/开始，前面
		if( chr == 47 ){
			return 1;
		}
		return 0;
	}

	function isRegexpStart( chr, index ){
		//以/开始
		//last token: ( [ {
		if( chr == 47 ){
			if(!lastToken){ 
				return 1;
			}
			//,或者;或者[或者(或者{或者:
			if( isInArray(['(', '[', '{', '=', ',', ';', ':'], lastToken.value) ){
				return 1;
			}
		}
		return 0;
	}

	function newLine(){
		lineNum++;
	}

	function peek( n ){
		return source.charCodeAt( typeof n == 'undefined' ? index:n );
	}

	function nextChr(){
		index++;
		return peek();
	}

	function retract( n ){
		index--;	
	}

	function isInArray( arr, clue ){
        for( var i = 0, len = arr.length; i < len; i++ ){
            if( arr[i] == clue ){
                return 1;
            }
        }
        return 0;
    }
}