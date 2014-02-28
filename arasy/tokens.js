//7.5
var tokenType = {
    'Identifier': 'Identifier',
    'Keywords': 'Keywords',
    'Numeric': 'Numeric',
    'String': 'String',
    'Punctuator': 'Punctuator',
    'Null': 'Null',
    'Boolean': 'Boolean',
    'RegularExpression': 'RegularExpression',
    'Eof': 'eof',
    'Comment': 'Comment',
    'Terminator': 'Terminator'
};

var literalTypeMap = {
    'Numeric': 1,
    'String': 1,
    'Null': 1,
    'Boolean': 1,
    'RegularExpression': 1
};

var commentType = {
    'SingleLineComment': 'SingleLineComment',
    'MultiLineComment': 'MultiLineComment'
};

var keywordsStr = "break do instanceof typeof case else new var catch finally return void continue for switch while" +
    " debugger function this with default if throw delete in try";

var keywordsMap = makeMap( keywordsStr );

var futureReservedKeywordsMap = makeMap( "class enum extends super const export import" );

var operatorStr = "{ } ( ) [ ] . ; , < > <= >= == != === !== + - * % / ++ -- << >> >>> & | ^ ! ~ && || ? : = += -= *=" +
    " %= /= <<= >>= >>>= &= |= ^=";
var operatorMap = makeMap( operatorStr );

var precedence = {
    arrayOperator: 30,
    dotOperator: 30,
    newOperator: 30,
    callOperator: 30,

    incrementOperator: 29,
    decrementOperator: 29,

    logicalnotOperator: 28,
    bitwisenotOperator: 28,
    unaryOperator: 28,
    unarynegationOperator: 28,
    typeofOperator: 28,
    deleteOperator: 28,
    voidOperator: 28,


    mutliOperator: 26,
    divOperator: 26,
    modulusOperator: 26,


    additionOperator: 24,
    subtractionOperator: 24,


    bitwiseshiftOperator: 22,

    relationalOperator: 20,

    equalityOperator: 18,

    bitwiseandOperator: 16,
    bitwisexorOperator: 15,
    bitwiseorOperator: 14,
    logicalandOperator: 13,
    logicalorOperator: 12,
    conditionalOperator: 11,

    assignmentOperator: 10,

    commaOperator: 9,

    singleToken: 1,

    functionExpressionStart: 1,
    objectExpressionStart: 1,

    groupOperator: 0
};

var expressionTokenMap = makeMap( precedence );

var tokenType2ExpType = {};
tokenType2ExpType[tokenType.Identifier]        = expressionTokenMap.singleToken;
tokenType2ExpType[tokenType.String]            = expressionTokenMap.singleToken;
tokenType2ExpType[tokenType.Numeric]           = expressionTokenMap.singleToken;
tokenType2ExpType[tokenType.Null]              = expressionTokenMap.singleToken;
tokenType2ExpType[tokenType.Boolean]           = expressionTokenMap.singleToken;
tokenType2ExpType[tokenType.RegularExpression] = expressionTokenMap.singleToken;

var keywords2ExpType = {
    'new': expressionTokenMap.newOperator,
    'this': expressionTokenMap.singleToken,
    'function': expressionTokenMap.functionExpressionStart,
    'typeof': expressionTokenMap.typeofOperator,
    'delete': expressionTokenMap.deleteOperator,
    'void': expressionTokenMap.voidOperator,
    'in': expressionTokenMap.relationalOperator,
    'instanceof': expressionTokenMap.relationalOperator
};

var operator2ExpType = {
    '[': expressionTokenMap.arrayOperator,
    '.': expressionTokenMap.dotOperator,
    '(': expressionTokenMap.callOperator,
    '++': expressionTokenMap.incrementOperator,
    '--': expressionTokenMap.decrementOperator,
    '~': expressionTokenMap.bitwisenotOperator,
    '!': expressionTokenMap.logicalnotOperator,
    '+': expressionTokenMap.unaryOperator,
    '-': expressionTokenMap.unaryOperator,
    '*': expressionTokenMap.mutliOperator,
    '/': expressionTokenMap.divOperator,
    '%': expressionTokenMap.modulusOperator,
    '+': expressionTokenMap.additionOperator,
    '-': expressionTokenMap.subtractionOperator,
    '<<': expressionTokenMap.bitwiseshiftOperator,
    '>>': expressionTokenMap.bitwiseshiftOperator,
    '>>>': expressionTokenMap.bitwiseshiftOperator,
    '<': expressionTokenMap.relationalOperator,
    '>': expressionTokenMap.relationalOperator,
    '<=': expressionTokenMap.relationalOperator,
    '>=': expressionTokenMap.relationalOperator,
    '==': expressionTokenMap.equalityOperator,
    '!=': expressionTokenMap.relationalOperator,
    '===': expressionTokenMap.relationalOperator,
    '!==': expressionTokenMap.relationalOperator,
    '&': expressionTokenMap.bitwiseandOperator,
    '^': expressionTokenMap.bitwisexorOperator,
    '|': expressionTokenMap.bitwiseorOperator,
    '&&': expressionTokenMap.logicalandOperator,
    '||': expressionTokenMap.logicalorOperator,
    '?': expressionTokenMap.conditionalOperator,

    '=': expressionTokenMap.assignmentOperator,
    '*=': expressionTokenMap.assignmentOperator,
    '/=': expressionTokenMap.assignmentOperator,
    '%=': expressionTokenMap.assignmentOperator,
    '+=': expressionTokenMap.assignmentOperator,
    '-=': expressionTokenMap.assignmentOperator,
    '<<=': expressionTokenMap.assignmentOperator,
    '>>=': expressionTokenMap.assignmentOperator,
    '>>>=': expressionTokenMap.assignmentOperator,
    '&=': expressionTokenMap.assignmentOperator,
    '^=': expressionTokenMap.assignmentOperator,
    '|=': expressionTokenMap.assignmentOperator,
    ',': expressionTokenMap.commaOperator
};

//有歧义的类型，需要结合上下文进行判断
var specialOperator2ExpType = {
    '(': {
        'call': expressionTokenMap.callOperator,
        'group': expressionTokenMap.groupOperator
    },
    '+': {
        'unary': expressionTokenMap.unaryOperator,
        'addition': expressionTokenMap.additionOperator
    },
    '-': {
        'unary': expressionTokenMap.unaryOperator,
        'subtraction': expressionTokenMap.subtractionOperator
    }
};



function getExpressionTokenType( token ){
    var map = {};
    map[tokenType.Identifier] = expressionTokenMap.singleToken;
    map[tokenType.Identifier] = expressionTokenMap.singleToken;
}

function getPrecedenceByToken( token ){
    return precedence[ token.expType ] || 0;
}