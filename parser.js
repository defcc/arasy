/**
 *
 *  递归下降语法解析
 *
 */

//function declare
var code = 'function a(b,c){function funName( innerA, innerB ){ function google(){} }}';
//var lexer = YAP('');

//statements
//var a;
//var code = 'var a,b,c';

//complex

var code = '[[]]'

var lexer = YAP( code );


var isInBlockBody = [];

var isInArray = [];

var isInParen = [];

function Node( type ){
    this.type = type;
}

function mustBe( val, token ){
    return token.value == val;
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

function eof( token ){
    return  token.type == 'eof';
}

function Parser( code ){
    this.lexer = lexer;
    var ast = this.parseProgram();
    console.log(ast);
}

Parser.prototype.tokenPool = [];

Parser.prototype.peekToken = function(){
    if( this.tokenPool.length ){
        return this.tokenPool[0];
    }
    var token = this.lexer.nextToken();
    this.tokenPool.push( token );
    return token;
};
//向前看第二个
Parser.prototype.peekToken2 = function(){
    if( this.tokenPool.length >= 2 ){
        return this.tokenPool[1];
    }
    var token = this.lexer.nextToken();
    this.tokenPool.push( token );
    return token;
};

Parser.prototype.nextToken = function(){
    var token;
    if( this.tokenPool.length ){
        token = this.tokenPool.shift();
    }else{
        token = this.lexer.nextToken();
    }
    this.currentToken = token;
    return token;
};

Parser.prototype.parseProgram = function(){
    var programNode = new Node('program');
    programNode.type = 'program';
    programNode.body = this.parseSourceElements();
    return programNode;
};


Parser.prototype.parseSourceElements = function(){
    var rs = [],
        item;

    var peekToken = this.peekToken();
    if( isInBlockBody.length && mustBe('}', peekToken) ){
        return rs;
    }

    while( (item = this.parseSourceElement()) ){
        rs.push( item );
    }
    return rs;
};

Parser.prototype.parseSourceElement = function(){

    var peekToken = this.peekToken();
    if( peekToken.type == 'eof' ){
        return;
    }

    if( isInBlockBody.length && mustBe('}', peekToken) ){
        return;
    }
    if( match({type: 'keywords', value: 'function'}, peekToken )){
        return this.parseFunctionDeclaration();
    }else{
        return this.parseStatements();
    }

};

Parser.prototype.parseFunctionDeclaration = function(){
    var functionDeclarationNode = new Node('functionDeclaration');
    match({type: 'keywords', value: 'function'}, this.nextToken());
    var nameToken = match({type: 'ID'}, this.nextToken());
    if( nameToken ){
        functionDeclarationNode.id = {
            type: 'ID',
            name: nameToken.value
        }
    }

    var params = this.parseParamsList();
    functionDeclarationNode.params = params;
    functionDeclarationNode.body =  this.parseBlock();
    return functionDeclarationNode;
};


Parser.prototype.parseParamsList = function(){
    var rs = [],
        item;

    match({type: 'punctuator', value: '('}, this.nextToken());
    var peekToken = this.peekToken();
    if( match({type: 'ID'}, peekToken) ){
        while( item = match({type: 'ID'}, this.nextToken()) ){
            rs.push({
                type: 'ID',
                name: item.value
            });
            var nextToke = this.peekToken();
            if(!match({type: 'punctuator', value: ','}, nextToke)){
                break;
            }else{
                this.nextToken();
            }
        }
    }
    match({type: 'punctuator', value: ')'}, this.nextToken());
    return rs;
};


Parser.prototype.parseBlock = function(){

    var blockStatement = new Node('blockstatement');

    isInBlockBody.push(1);

    mustBe('{', this.nextToken());

    blockStatement.body = this.parseSourceElements();

    mustBe('}', this.nextToken());

    isInBlockBody.pop(1);

    return blockStatement;
};


Parser.prototype.parseStatements = function(){
    var rs = [],
        item;

    while(item = this.parseStatement()){
        rs.push( item );
    }
    return rs;
};

Parser.prototype.parseStatement = function(){
    var peekToken = this.peekToken();

    if( peekToken.type == 'eof' ){
        return;
    }

    if( isInBlockBody.length && mustBe('}', peekToken) ){
        return;
    }

    //接下来是一个函数定义
    if( mustBe('function', peekToken) ){
        return;
    }

    if( mustBe('{', peekToken) ){
        return this.parseBlock();
    }else{
        if( mustBe('var', peekToken) ){
            return this.parseVariableStatement()
        }
        if( mustBe(';', peekToken) ){
            return this.parseEmptyStatement();
        }
        if( mustBe('if', peekToken) ){
            return this.parseIfStatement();
        }

        if( mustBe('do', peekToken) ){
            return this.parseEmptyStatement();
        }
        if( mustBe('for', peekToken) ){
            return this.parseIfStatement();
        }
        if( mustBe('continue', peekToken) ){
            return this.parseEmptyStatement();
        }
        if( mustBe('with', peekToken) ){
            return this.parseIfStatement();
        }

        if( mustBe('switch', peekToken) ){
            return this.parseEmptyStatement();
        }
        if( mustBe('throw', peekToken) ){
            return this.parseIfStatement();
        }

        if( mustBe('debugger', peekToken) ){
            return this.parseIfStatement();
        }
        if( mustBe('label', peekToken) ){
            return this.parseIfStatement();
        }
        return this.parseExpressionStatement();
    }
};



Parser.prototype.parseEmptyStatement = function(){
    this.nextToken();
    return new Node('emptystatement');
};

Parser.prototype.parseExpressionStatement = function(){
    var node = new Node('ExpressionStatement');
    node.expressions = this.parseExpression();
    return node;
};


Parser.prototype.parseVariableStatement = function(){
    var variableStatement = new Node('variableDeclarationList');
    mustBe('var', this.nextToken());
    variableStatement.declarations = this.parseVariableDeclarationList();
    return variableStatement;
};

Parser.prototype.parseVariableDeclarationList = function(){
    var rs = [],
        item;
    while(item = this.parseVariableDeclaration()){
        rs.push( item );

        var nextToke = this.peekToken();
        if(!match({type: 'punctuator', value: ','}, nextToke)){
            break;
        }else{
            this.nextToken();
        }
    }
    return rs;
};

Parser.prototype.parseVariableDeclaration = function(){
    var variableDeclarationNode = new Node('variableDeclaration');
    var ID = match( {type: 'ID'}, this.nextToken() );
    variableDeclarationNode.id = ID;

    var peekToken = this.peekToken();
    var assign = match({value: '='}, peekToken);
    if( assign ){
        this.nextToken();
        var init = this.parseExpression();
        variableDeclarationNode.init = init;
    }
    return variableDeclarationNode;
};




Parser.prototype.parseIfStatement = function(){
    var ifNode = new Node('IfStatement');
    ifNode.test = this.parseParenExpression();
    ifNode.body = this.parseBlock();
    return ifNode;
};

Parser.prototype.parseForStatement = function(){
    var forNode = new Node('for');
    match('(');
    var initNode = this.parseExpression();
    match(';');
    var testNode = this.parseExpression();
    match(';');
    var postNode = this.parseExpression();
    var body     = this.parseBlock();

    forNode.init = initNode;
    forNode.test = testNode;
    forNode.post = postNode;
    forNode.body = body;

    return forNode;
};

Parser.prototype.parseForInStatement = function(){
    var forInNode = new Node( 'forin' );
    match('(');
    var leftNode  = this.parseExpression();
    match('in');
    var rightNode = this.parseExpression();
    match(')');
    var body      = this.parseBlock();

    forInNode.leftNode  = leftNode;
    forInNode.rightNode = rightNode;
    forInNode.body      = body;

    return forInNode;
};

Parser.prototype.parseWhileStatement = function(){
    var wileNode = new Node('while');
    wileNode.test = this.parseParenExpression();
    wileNode.body = this.parseBlock();
    return wileNode;
};

Parser.prototype.parseDowhileStatement = function(){
    var dowhileNode = new Node('dowhile');
    dowhileNode.body = this.parseBlock();
    dowhileNode.test = this.parseParenExpression();
    return dowhileNode;
};

Parser.prototype.parseSwitchStatement = function(){
    var switchNode  = new Node('switch');

    switchNode.discriminant = this.parseParenExpression();
    switchNode.cases        = this.parseSwitchCases();

    return switchNode;
};

Parser.prototype.parseSwitchCases = function(){
    match('{');
    var rs = [],
        item;
    while( item = this.parseSwitchCase() ){
        rs.push( item );
    }
    match('}');

    return rs;
};

Parser.prototype.parseSwitchCase = function(){
    var checkRs = match('case|default');
    if( checkRs ){
        var rs = new Node('switchcase');
        if( checkRs.case ){
            rs.test = this.parseParenExpression();
        }else{
            rs.test = null;
        }
        rs.body = this.parseBlock();
        return rs;
    }
    return false;
};





Parser.prototype.parseExpression = function(){
    var peekToken = this.peekToken();
    var peekToken2 = this.peekToken2();

    if( isInArray.length && mustBe(']', peekToken) ){
        return;
    }

    //expression
    //this expression
    if( mustBe('this', peekToken)
        && (
            eof( peekToken2 )
            || mustBe(';', peekToken2)
            || mustBe(']', peekToken2)
            || mustBe(',', peekToken2)
            )
    ){
        return this.parseThisExpression();
    }

    //identify
    if( match({type: 'ID'}, peekToken)
        && ( eof( peekToken2 ) || mustBe(';', peekToken2) ) ){
        return this.parseIdentifyExpression();
    }
    //literal
    if( match({type: 'String'}, peekToken)
        && ( eof(peekToken2) || mustBe((';', peekToken2)) ) ){
        return this.parseLiteralExpression();
    }

    //array
    if( mustBe('[', peekToken) ){
        return this.parseArrayExpression();
    }

    //parenexpression
    if( mustBe('(', peekToken) ){
        return this.parseParenExpression();
    }


    //
    return {};
};

Parser.prototype.parseThisExpression = function(){
    this.nextToken();
    var node = new Node('thisexpression');
    return node;
};

Parser.prototype.parseIdentifyExpression = function(){
    var token = this.nextToken();
    var node = new Node('identify');
    node.name = token.value;
    return node;
};

Parser.prototype.parseLiteralExpression = function(){
    var token = this.nextToken();
    var node = new Node('literal');
    node.value = token.value;
    return node;
};

Parser.prototype.parseArrayExpression = function(){
    var node = new Node('ArrayExpression');
    node.elements = this.parseArrayExpressionElements();
    return node;
};

Parser.prototype.parseArrayExpressionElements = function(){
    var rs = [],
        item;

    mustBe('[', this.nextToken());
    isInArray.push(1);
    while( item = this.parseExpression() ){
        rs.push( item );
        var peekToken = this.peekToken();
        if( !mustBe(',', peekToken) ){
            break;
        }else{
            this.nextToken();
        }
    }
    mustBe(']', this.nextToken());
    isInArray.pop(1);
    return rs;
};

Parser.prototype.parseObjectExpression = function(){

};

Parser.prototype.parseParenExpression = function(){
    mustBe('(', this.nextToken());
    isInParen.push(1);
    var node = this.parseExpression();
    mustBe(')', this.nextToken());
    isInParen.pop();
    return node;
};

Parser.prototype.parseMemberExpression = function(){

};

Parser.prototype.parseNewExpression = function(){

};

Parser.prototype.parseCallExpression = function(){

};

Parser.prototype.parseFunctionExpression = function(){

};


Parser.prototype.parsePostfixExpression = function(){

};


Parser.prototype.parseUnaryExpression = function(){

};


Parser.prototype.parseMultiplicativeExpression = function(){

};


Parser.prototype.parseAdditiveExpression = function(){

};


Parser.prototype.parseShiftExpression = function(){

};

Parser.prototype.parseRelationalExpression = function(){

};


Parser.prototype.parseEqualityExpression = function(){

};

Parser.prototype.parseAssignmentExpression = function(){

};


Parser.prototype.parseSequenceExpression = function(){

};




