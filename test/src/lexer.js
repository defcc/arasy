test('单行case', function(){
	var tokens = YAP('var a;', 1).parse();

	ok(tokens.length == 4, '有4个token');

    deepEqual(tokens[0], {
        start: 0,
        end: 2,
        startLine: 0,
        endLine: 0,
        type: 'keywords',
        value: 'var'
    }, 'var的start=0');
    ok(tokens[0].end == 2, 'var的token信息');


    var token1Expect = {
        start: 3,
        end: 3,
        startLine: 0,
        endLine: 0,
        type: 'whitespace',
        value: ' '
    };

    deepEqual(tokens[1], token1Expect,  '第一个token');

    var token2Expect = {
        start: 4,
        end: 4,
        startLine: 0,
        endLine: 0,
        type: 'ID',
        value: 'a'
    };
    deepEqual(tokens[2],token2Expect,  '第二个token');

    var token3Expect = {
        start: 5,
        end: 5,
        startLine: 0,
        endLine: 0,
        type: 'punctuator',
        value: ';'
    };
    deepEqual(tokens[3], token3Expect, '第三个token;')


});
test('多行case', function(){
    var tokens = YAP('var a;\nvar b;', 1).parse();
    var tokensLen = tokens.length;
    ok(tokensLen == 9 , '共有9个token');

    var tokenTerminatorExpect = {
        lineNum: 0,
        startLine: 0,
        endLine: 0,
        type: 'terminator'
    };
    deepEqual(tokens[4], tokenTerminatorExpect, 'terminator');

    var token5Expect = {
        startLine: 1,
        endLine: 1,
        type: 'keywords'
    }, token5Actual = {
        startLine: tokens[5].startLine,
        endLine: tokens[5].endLine,
        type: tokens[5].type
    };
    deepEqual(token5Actual, token5Expect, 'token 5 ,新行的var')
});

test('字符串处理', function(){
	var s = '"asdadsads\\n';
	var tokens = YAP(s, 1).parse();

	ok(tokens.length == 1, '有1个token');
});