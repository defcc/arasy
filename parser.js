/**
 *
 *  递归下降语法解析
 *
 */

//function declare
//var lexer = YAP('function a(b,c){function funName( innerA, innerB ){ function google(){} }}');

//statements
//var a;


var isInFunctionBody = [];

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
    if( isInFunctionBody.length && mustBe('}', peekToken) ){
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

    if( isInFunctionBody.length && mustBe('}', peekToken) ){
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
    functionDeclarationNode.body =  this.parseFunctionBody();
    return functionDeclarationNode;
};


Parser.prototype.parseParamsList = function(){
    var rs = [],
        item;

    match({type: 'punctuator', value: '('}, this.nextToken());
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
    match({type: 'punctuator', value: ')'}, this.nextToken());
    return rs;
};

Parser.prototype.parseFunctionBody = function(){

    isInFunctionBody.push(1);

    mustBe('{', this.nextToken());

    var rs = this.parseSourceElements();

    mustBe('}', this.nextToken());

    isInFunctionBody.pop(1);

    return rs;
};



Parser.prototype.parseExpression = function(){

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




Parser.prototype.parseBlock = function(){
    mustBe('{', this.nextToken());

    var rs = this.parseStatements();

    mustBe('}', this.nextToken());

    return rs;
};

Parser.prototype.parseParenExpression = function(){
    match('(');
    var testNode = this.parseExpression();
    match(')');
    return testNode;
};


Parser.prototype.parseVariableStatement = function(){
    var variableStatement = new Node('variableDeclaration');
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
    var ID = match('id');
    variableDeclarationNode.id = ID;
    var assign = match('=');
    if( assign ){
        var init = this.parseExpression();
        variableDeclarationNode.init = init;
    }
    return variableDeclarationNode;
};




Parser.prototype.parseIfStatement = function(){
    var ifNode = new Node('if');
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





