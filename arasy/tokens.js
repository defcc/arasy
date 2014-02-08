//7.5
var tokenType = {
    'Identifier': 'Identifier',
    'Keywords': 'Keywords',
    'Numeric': 'Numeric',
    'String': 'String',
    'Punctuator': 'Punctuator',
    'Null': 'Null',
    'Boolean': 'Boolean',
    'RegularExpression': 'RegularExpression'
};

var literalTypeMap = {
    'Numeric': 1,
    'String': 1,
    'Null': 1,
    'Boolean': 1,
    'RegularExpression': 1
};

var keywordsStr = "break do instanceof typeof case else new var catch finally return void continue for switch while" +
    " debugger function this with default if throw delete in try";

var keywordsMap = makeMap( keywordsStr );

var futureReservedKeywordsMap = makeMap( "class enum extends super const export import" );

var operatorStr = "{ } ( ) [ ] . ; , < > <= >= == != === !== + - * % ++ -- << >> >>> & | ^ ! ~ && || ? : = += -= *=" +
    " %= <<= >>= >>>= &= |= ^=";
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

function getPrecedenceByToken( token ){
    return precedence[ token.expType ] || 0;
}