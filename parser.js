/**
 *
 *  递归下降语法解析
 *
 */

function Parser(){
    this.lexer = new Lexer( code );

    this.ast = {};
    this.parseProgram();
}

Parser.prototype.parseProgram = function(){
    this.ast.type = 'program';
    this.ast.body = parse();
};

Parser.prototype.parse = function(){
    var token = this.lexer.nextToken();
};

Parser.prototype.parseFunctions = function(){

};

Parser.prototype.parseStatements = function(){

};

Parser.prototype.parseBlock = function(){

};

Parser.prototype.parseParenExpression = function(){
    match('(');
    var testNode = this.parseExpression();
    match(')');
    return testNode;
};

Parser.prototype.parseExpression = function(){

};

Parser.prototype.parseVariableStatement = function(){
    var variableStatement = new Node('variableDeclaration');
    match('var');
    variableStatement.declarations = this.parseVariableDeclarationList();
    return variableStatement;
};

Parse.prototype.parseVariableDeclarationList = function(){
    var rs = [],
        item;
    while(item = this.parseVariableDeclaration()){
        rs.push( item );
        if( !match(',') ){
            break;
        }
    }
    return rs;
};

Parse.prototype.parseVariableDeclaration = function(){
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





