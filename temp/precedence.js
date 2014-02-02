var precedence = {
    groupOperator: -1,

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
    inOperator: 20,
    instanceofOperator: 20,

    equalityOperator: 18,

    bitwiseandOperator: 16,
    bitwisexorOperator: 15,
    bitwiseorOperator: 14,
    logicalandOperator: 13,
    logicalorOperator: 12,
    conditionalOperator: 11,

    assignmentOperator: 10,

    commaOperator: 9,

    identify: 1,
    functionExpression: 1,
    'this': 1,
    'number': 1
};


function makeObject( precedenceMap ){
    var obj = {};

    for ( var key in precedenceMap ) {
        obj[ key ] = key;
    }
    return obj;
}

var operatorTokenMap = makeObject( precedence );

var tokensMap = makeObject( precedence );