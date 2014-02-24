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

    ok( firstToken.type == tokenType.Identifier, '第一个token为Identifier，实际为' + firstToken.type );
    ok( firstToken.value == '\\u12345', '第一个token的value为\\u12345', '实际为' + firstToken.value );
    ok( secondToken.type == tokenType.Eof, '第二个token为Eof' );
    ok( secondToken.value == undefined, '第二个token的value为undefined' );
});

module('Numeric Parse.');

test('0x123 ', function(){
    var code = '0x123';
    var arasyScanner = arasy.scanner( code );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    equal( firstToken.type, tokenType.Numeric );
    equal( firstToken.value, 0x123);
    equal( secondToken.type, tokenType.Eof );
    equal( secondToken.value, undefined );


    var code1 = '012345';
    var arasyScanner = arasy.scanner( code1 );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    equal( firstToken.type, tokenType.Numeric );
    equal( firstToken.value, 12345);
    equal( secondToken.type, tokenType.Eof );
    equal( secondToken.value, undefined );
});

test('ExponentPartopt ', function(){
    var code1 = '19293E1';
    var arasyScanner = arasy.scanner( code1 );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    equal( firstToken.type, tokenType.Numeric );
    equal( firstToken.value, 19293e1);
    equal( secondToken.type, tokenType.Eof );
    equal( secondToken.value, undefined );


    var code2 = '19293E+1';
    var arasyScanner = arasy.scanner( code2 );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    equal( firstToken.type, tokenType.Numeric, 'Numeric类型' );
    equal( firstToken.value, 19293e1);
    equal( secondToken.type, tokenType.Eof );
    equal( secondToken.value, undefined );
});

test('Numeric width dot', function(){
    var code1 = '123.1';
    var arasyScanner = arasy.scanner( code1 );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    equal( firstToken.type, tokenType.Numeric );
    equal( firstToken.value, 123.1);
    equal( secondToken.type, tokenType.Eof );
    equal( secondToken.value, undefined );


    var code2 = '.12';
    var arasyScanner = arasy.scanner( code2 );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    equal( firstToken.type, tokenType.Numeric, 'Numeric类型' );
    equal( firstToken.value, 0.12);
    equal( secondToken.type, tokenType.Eof );
    equal( secondToken.value, undefined );
});

module('Punctuator Parse.');

test('i+++a', function(){
    var code1 = 'i+++a';
    var arasyScanner = arasy.scanner( code1 );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();
    var thirdToken = arasyScanner.nextToken();

    equal( firstToken.type, tokenType.Identifier );
    equal( firstToken.value, 'i');
    equal( secondToken.type, tokenType.Punctuator );
    equal( secondToken.value, '++' );

    equal( thirdToken.type, tokenType.Punctuator );
    equal( thirdToken.value, '+' );


    var code2 = '.12';
    var arasyScanner = arasy.scanner( code2 );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    equal( firstToken.type, tokenType.Numeric, 'Numeric类型' );
    equal( firstToken.value, 0.12);
    equal( secondToken.type, tokenType.Eof );
    equal( secondToken.value, undefined );
});

module('Comment parse.');

test('注释', function(){
    var code1 = '//aasa';
    var arasyScanner = arasy.scanner( code1 );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    equal( firstToken.type, tokenType.Comment );
    equal( firstToken.value, '//aasa');
    equal( secondToken.type, tokenType.Eof );
    equal( secondToken.value, undefined );



    var code2 = '/**/';
    var arasyScanner = arasy.scanner( code2 );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    equal( firstToken.type, tokenType.Comment );
    equal( firstToken.value, code2);
    equal( secondToken.type, tokenType.Eof );
    equal( secondToken.value, undefined );

    var code2 = '/**/var';
    var arasyScanner = arasy.scanner( code2 );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    equal( firstToken.type, tokenType.Comment );
    equal( firstToken.value, '/**/');
    equal( secondToken.type, tokenType.Keywords );
    equal( secondToken.value, 'var' );
});



module('Comment parse.');

test('正则表达式', function(){
    var code1 = '/12/';
    var arasyScanner = arasy.scanner( code1 );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    equal( firstToken.type, tokenType.RegularExpression );
    equal( firstToken.value, '/12/');
    equal( secondToken.type, tokenType.Eof );
    equal( secondToken.value, undefined );



    var code2 = '/[[1]2\n/i';
    var arasyScanner = arasy.scanner( code2 );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    equal( firstToken.type, tokenType.RegularExpression );
    equal( firstToken.value, code2);
    equal( secondToken.type, tokenType.Eof );
    equal( secondToken.value, undefined );
});

module('String parse.');

test('字符串', function(){
    var code1 = '\'baidu\\n\'';
    var arasyScanner = arasy.scanner( code1 );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    equal( firstToken.type, tokenType.String );
    equal( firstToken.value, '\'baidu\\n\'');
    equal( secondToken.type, tokenType.Eof );
    equal( secondToken.value, undefined );



    var code2 = '"\'\\""';
    var arasyScanner = arasy.scanner( code2 );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    equal( firstToken.type, tokenType.String );
    equal( firstToken.value, "\"'\"\"");
    equal( secondToken.type, tokenType.Eof );
    equal( secondToken.value, undefined );

    var code2 = '"\u1234\u2345 a"';
    var arasyScanner = arasy.scanner( code2 );
    var firstToken = arasyScanner.nextToken();
    var secondToken = arasyScanner.nextToken();

    console.log( code2, firstToken );

    equal( firstToken.type, tokenType.String );
    equal( firstToken.value, String('"\u1234\u2345 a"'));
    equal( secondToken.type, tokenType.Eof );
    equal( secondToken.value, undefined );
});