#关于jsLexer
jsLexer is Yet Another js lexer


#TODO
1. 正则的解析，目前的实现有问题，按照es规范，当/的前面是表达式时，/为运算符。
2. numeric的解析有问题，缺乏对非二进制的数字的支持
3. *测试用例*

#API
YAP(codeStr, isKeepWhiteSpaceToken, startInfo);

结果： {nextToken: function}

参数

- codeStr： 源代码
- isKeepWhiteSpaceToken： 是否保留空白token
- startInfo 开始状态，即开始解析codeStr时，解析器所处的state(start|string|comment)
    - startState: start|string|comment
    - extVal: 对于string或者comment，需要指明此值，即字符串的开始符(单引号或者双引号)和注释(单行注释或者多行注释)的类型
    - startLine: 开始的行数


#实例
var rs = YAP('var s = 1;//comment goes here', 1) //返回9个token，包含空白

var rs = YAP('var s = 1;//comment goes here', 0, {startState: 'string', extVal: '\'', startLine: 10}) //返回1个token
