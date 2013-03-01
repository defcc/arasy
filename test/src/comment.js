test('注释的解析', function(){
    var source = '/**/var';
    var tokens = YAP(source).parse();
    ok(tokens.length == 2, '2个token');

    var source1 = '/**\\/incomment';
    var tokens1 = YAP(source1).parse();
    ok(tokens1.length == 1, '结尾slash被转义，最终1个token');

    //nested comment

    var nestSource = '/*/***/**/';
    var nestTokens = YAP(nestSource).parse();
    console.log(nestTokens);
    ok(nestTokens.length == 4, '4个token');
    equal(nestTokens.length, 4, '')
});