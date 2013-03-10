test('多行注释的解析', function(){
    var source = '/*as*/var';
    var tokens = YAP(source).parse();
    ok(tokens.length == 2, '2个token');

    var source1 = '/**\\/incomment';
    var tokens1 = YAP(source1).parse();
    ok(tokens1.length == 1, '结尾slash被转义，最终1个token');

    //nested comment

    var nestSource = '/*a/***/**/\n';
    var nestTokens = YAP(nestSource).parse();
    ok(nestTokens.length == 5, '4个token');
    equal(nestTokens.length, 5, '');
    equal(nestTokens[0].value, '/*a/***/', 'nested comment');

    //非正常注释
    var source = '/*/';
    var tokens = YAP(source).parse();
    ok(tokens.length == 1, '1个token');

    var source = '*/';
    var tokens = YAP(source).parse();
    ok(tokens.length == 2, '2个token');

    var source = '/*assa/';
    var tokens = YAP(source).parse();
    ok(tokens.length == 1, '2个token');

    var source = '/*assa\*/var';
    var tokens = YAP(source).parse();
    ok(tokens.length ==2, '2个token');

    var source = '/*assa\*\\/var';
    var tokens = YAP(source).parse();
    ok(tokens.length ==1, '1个token');
});

test('注释的断点继续解析', function(){
    var source = '*/\n//sa\nvar';
    var tokens = YAP(source, 1, {extVal: 'mcomment', startState: 'comment'}).parse();
    ok(tokens.length == 5, 'tokens数为5');
});