var callTest = [{
    type: operatorTokenMap.newOperator,
    val: 'new'
},{
    type: operatorTokenMap.identify,
    val: 'a'
},{
    type: operatorTokenMap.groupOperator,
    val: '('
},{
    type: operatorTokenMap.groupOperator,
    val: ')'
}, {
    type: operatorTokenMap.mutliOperator,
    val: '*'
},{
    type: operatorTokenMap.identify,
    val: '4'
}];

var functionCallExpressionTest = [{
    type: operatorTokenMap.identify,
    val: 'a'
},{
    type: operatorTokenMap.callOperator,
    val: '('
}, {
    type: operatorTokenMap.groupOperator,
    val: '('
}, {
    type: operatorTokenMap.groupOperator,
    val: '('
},{
    type: operatorTokenMap.identify,
    val: 'a'
}, {
    type: operatorTokenMap.groupOperatorRight,
    val: ')'
},{
    type: operatorTokenMap.groupOperatorRight,
    val: ')'
}, {
    type: operatorTokenMap.callOperatorRight,
    val: ')'
},{
    type: operatorTokenMap.mutliOperator,
    val: '+'
},{
    type: operatorTokenMap.identify,
    val: '1'
}];

var dotMemberExpressionTest = [{
    type: operatorTokenMap.groupOperator,
    val: '('
}, {
    type: operatorTokenMap.groupOperator,
    val: '('
},{
    type: operatorTokenMap.identify,
    val: 'a'
}, {
    type: operatorTokenMap.dotOperator,
    val: '.'
}, {
    type: operatorTokenMap.identify,
    val: 'b'
}, {
    type: operatorTokenMap.groupOperatorRight,
    val: ')'
},{
    type: operatorTokenMap.groupOperatorRight,
    val: ')'
},{
    type: operatorTokenMap.dotOperator,
    val: '.'
}, {
    type: operatorTokenMap.identify,
    val: 'b'
}];


var functionExpTest = [{
    type: operatorTokenMap.functionExpression,
    val: 'function'
},{
    type: operatorTokenMap.identify,
    val: 'funcName'
},{
    type: operatorTokenMap.groupOperator,
    val: '('
},{
    type: operatorTokenMap.identify,
    val: 'arg1'
},{
    type: operatorTokenMap.groupOperatorRight,
    val: ')'
},{
    type: operatorTokenMap.braces,
    val: '{'
},{
    type: operatorTokenMap.bracesRight,
    val: '}'
}];


var arithmeticTest = [{
    type: operatorTokenMap.identify,
    val: '3'
},{
    type: operatorTokenMap.mutliOperator,
    val: '*'
},{
    type: operatorTokenMap.identify,
    val: '5'
},{
    type: operatorTokenMap.additionOperator,
    val: '+'
},{
    type: operatorTokenMap.identify,
    val: '5'
},{
    type: operatorTokenMap.subtractionOperator,
    val: '-'
},{
    type: operatorTokenMap.identify,
    val: '1'
}];

var thisTest = [{
    type: operatorTokenMap['this'],
    val: 'this'
},{
    type: operatorTokenMap.arrayOperator,
    val: '['
},{
    type: operatorTokenMap.identify,
    val: 'a'
},{
    type: operatorTokenMap.arrayOperator,
    val: ']'
}];


var prefixTest = [{
    type: operatorTokenMap.incrementOperator,
    val: '++'
},{
    type: operatorTokenMap.identify,
    val: 'a'
},{
    type: operatorTokenMap.additionOperator,
    val: '+'
},{
    type: operatorTokenMap.identify,
    val: 'b'
}];

var postfixTest = [{
    type: operatorTokenMap.identify,
    val: 'a'
},{
    type: operatorTokenMap.dotOperator,
    val: '.'
}, {
    type: operatorTokenMap.identify,
    val: 'b'
}, {
    type: operatorTokenMap.incrementOperator,
    val: '++'
},{
    type: operatorTokenMap.additionOperator,
    val: '+'
},{
    type: operatorTokenMap.identify,
    val: 'b'
}];

var identifierTest = [{
    type: operatorTokenMap.identify,
    val: 'b'
}];

var literalTest = [{
    type: operatorTokenMap.number,
    val: 2
},{
    type: operatorTokenMap.additionOperator,
    val: '+'
},{
    type: operatorTokenMap.identify,
    val: 'c'
}];

var arrayExpTest = [{
    type: operatorTokenMap.arrayOperator,
    val: '['
},{
    type: operatorTokenMap.identify,
    val: 'a'
},{
    type: operatorTokenMap.commaOperator,
    val: ','
},{
    type: operatorTokenMap.identify,
    val: 'a'
},{
    type: operatorTokenMap.commaOperator,
    val: ','
},{
    type: operatorTokenMap.arrayOperator,
    val: '['
},{
    type: operatorTokenMap.identify,
    val: 'a'
},{
    type: operatorTokenMap.arrayOperatorRight,
    val: ']'
},{
    type: operatorTokenMap.arrayOperatorRight,
    val: ']'
}];

var memberExpressionTest = [{
    type: operatorTokenMap.identify,
    val: 'a'
},{
    type: operatorTokenMap.arrayOperator,
    val: '['
},{
    type: operatorTokenMap.identify,
    val: 'a'
},{
    type: operatorTokenMap.subtractionOperator,
    val: '-'
},{
    type: operatorTokenMap.identify,
    val: 'b'
},{
    type: operatorTokenMap.commaOperator,
    val: ','
},{
    type: operatorTokenMap.identify,
    val: 'c'
},{
    type: operatorTokenMap.arrayOperatorRight,
    val: ']'
}];

var objectExpressionTest = [{
    type: operatorTokenMap.braces,
    val: '{'
},{
    type: operatorTokenMap.identify,
    val: 'a'
},{
    type: operatorTokenMap.maoType,
    val: ':'
},{
    type: operatorTokenMap.groupOperator,
    val: '('
},{
    type: operatorTokenMap.identify,
    val: 'b'
},{
    type: operatorTokenMap.mutliOperator,
    val: '+'
},{
    type: operatorTokenMap.identify,
    val: 'b'
},{
    type: operatorTokenMap.groupOperator,
    val: ')'
},{
    type: operatorTokenMap.commaOperator,
    val: ','
},{
    type: operatorTokenMap.identify,
    val: 'c'
},{
    type: operatorTokenMap.maoType,
    val: ':'
},{
    type: operatorTokenMap.identify,
    val: 'd'
}, {
    type: operatorTokenMap.bracesRight,
    val: '}'
},{
    type: operatorTokenMap.mutliOperator,
    val: '+'
},{
    type: operatorTokenMap.identify,
    val: 'b'
}];


var deleteExpressionTest = [{
    type: operatorTokenMap.voidOperator,
    val: 'void'
},{
    type: operatorTokenMap.voidOperator,
    val: 'void'
},{
    type: operatorTokenMap.voidOperator,
    val: 'void'
},{
    type: operatorTokenMap.identify,
    val: 'a'
},{
    type: operatorTokenMap.mutliOperator,
    val: '+'
},{
    type: operatorTokenMap.identify,
    val: 'b'
}];


var relationalExpressionTest = [{
    type: operatorTokenMap.identify,
    val: 'a'
},{
    type: operatorTokenMap.mutliOperator,
    val: '+'
},{
    type: operatorTokenMap.identify,
    val: 'b'
},{
    type: operatorTokenMap.relationalOperator,
    val: '>='
},{
    type: operatorTokenMap.identify,
    val: 'c'
}];


var assignmentExpressionTest = [{
    type: operatorTokenMap.identify,
    val: 'a'
},{
    type: operatorTokenMap.assignmentOperator,
    val: '+='
},{
    type: operatorTokenMap.identify,
    val: 'b'
},{
    type: operatorTokenMap.assignmentOperator,
    val: '='
},{
    type: operatorTokenMap.identify,
    val: 'b'
},{
    type: operatorTokenMap.equalityOperator,
    val: '!=='
},{
    type: operatorTokenMap.identify,
    val: 'c'
}];

var testTokenList = assignmentExpressionTest;
makeTestToken(tokenList.list, testTokenList);


function makeTestToken( source, testTokens ){
    var testTokenLen = testTokens.length;
    for ( var i = 0; i < testTokenLen; i++ ) {
        source.unshift( testTokens.pop() );
    }
}