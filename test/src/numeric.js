test('数字测试', function(){
    var str = '0';
    var rs = YAP(str).parse();
    ok(rs.length == 1, '0的解析');

    var strDotStart = '.012';
    var rsDotStart =YAP(strDotStart).parse();
    ok(rsDotStart.length == 1, '.开始的数字解析');

    var strZeroStart = '023';
    var rsZeroStart = YAP(strZeroStart).parse();
    ok(rsZeroStart.length == 1, '0开始的数字的解析');

    var exponentStr = '0.e1';
    var exponentRs = YAP(exponentStr).parse();
    ok(exponentRs.length == 1, 'E的解析');

    var strHex = '0x12';
    var rsHex = YAP(strHex).parse();
    ok(rsHex.length == 1, '16进制的解析');
});