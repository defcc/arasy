test('注释的解析', function(){
    var source = '/**/var';
    var tokens = YAP(source).parse();
    ok(tokens.length == 2, '2个token');
});