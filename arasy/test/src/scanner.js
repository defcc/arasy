module('Identifier Parse.');

test('var a ', function(){
    var arasyScanner = arasy.scanner('var a');
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    ok( firstToken.type == tokenType.Keywords, '第一个token为Keywords' );
    ok( firstToken.value == 'var', '第一个token的value为var' );
    ok( secondToken.type == tokenType.Identifier, '第二个token为Identifier' );
    ok( secondToken.value == 'a', '第二个token的value为a' );
});

test('\\u1283 ', function(){
    var code = '\\u12345';
    var arasyScanner = arasy.scanner( code );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    console.log(firstToken);
    ok( firstToken.type == tokenType.Identifier, '第一个token为Identifier，实际为' + firstToken.type );
    ok( firstToken.value == '\\u12345', '第一个token的value为\\u12345', '实际为' + firstToken.value );
    ok( secondToken.type == tokenType.Eof, '第二个token为Eof' );
    ok( secondToken.value == undefined, '第二个token的value为undefined' );
});

module('Numeric Parse.');


module('Expression Parse');

test('a.test', function(){
    ok(1, 'MemberExpression')
});