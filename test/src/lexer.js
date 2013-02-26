test('普通case', function(){
	var tokens = YAP('var a;', 1).parse();
	var tokens2 = YAP('var a;\nvar b;', 1).parse();
	var tokens3 = YAP('var a;\n//var b;', 1).parse();
	var tokens4 = YAP('/*var a;*/\n//var b;', 1).parse();


	ok(tokens.length == 4, '有4个token');
	ok(tokens2.length == 9, '有9个token');
	ok(tokens3.length == 6, '有6个token');
	ok(tokens4.length == 3, '有3个token');
});

test('字符串处理', function(){
	var s = '"asdadsads\\n';
	var tokens = YAP(s, 1).parse();

	ok(tokens.length == 1, '有1个token');
});