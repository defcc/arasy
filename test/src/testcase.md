var a=12.334e-5,b=[0x37,0xa5];//数字，关键字加亮
function func(){
    var reg=/^\d+[-_]\d+\/\\/g;//正则加亮
    var str='字符串""""\'jjj\\\\\'';//识别转义引号
    var str2='字符串""""\'jjj\\\\';
}
/*多行注释
//html标签<p>jhjh</p>
*/

var $do='>',//html转义和关键字加亮
    $function=function(){
        return/123/;
    };
aaa=12;

//下面为字符串除法运算
x='333'
/aaa/
6
alert(x)//下面为++运算符后的除法运算
aaa++/aaa/
444

//下为---后面的正则减法运算
aaa---/aaa/
'\'///*'

~/ssss[////]///其他前缀的正则


//下为除法运算
444/**/
/3/
3


//此除法正确
444/**/
/3


//下为正则
a=/**/
/3/
4

//下面为摘自infinte 的无敌验证代码
// test 1
function myfun(id) {
    /* this is mutilcomments "string" keyword: function */
    var str = "this is a string, /*fasasdf*/ //fdsasdf /^reg/";
    var reg = /^fdadfasdf$/ig;
    return "myvalue"; // hahah
}
//test 2
if(str.match(/(?:(?:[!=(,:]|\[|\n)[ \t]*\/$)|^\n?[\t ]*\/$/)){}
//test 3
a = 1
b = 2
g = {test:function(){return 1}}
c = a//
/*
*/
/b/g.test();
alert(c);
// test 4
function t4(test) {

    return (test/*
    /* //
    ' "
    { ;
    \*/ && // /* // " ' { ; \
    test &&
    " /* // \
    \" ' \
    { ;" &&
    ' /* // \
    " \' \
    { ;' &&
    test);

}
// test 5
var rexT5 = /[/][+]([\S\s]*?)(?:[+][/]|$)|[/][/](.*)|"((?:\\"|[^"])*)"|'((?:\\'|[^'])*)'/g;  //正则
var nu = 1/2/3 //这是除法
var str = "123//456".replace(/[/]/g,'')+1/2/3; //comment
var o=[/re/,(/re/),typeof /re/,function(){return /re/},'o' in /re/,1 / /re/,!/re/];

//javascript
var reg = /**//[\/][/][*]([\S\s]*?)(?:[*][/;\[\]]|$)|[\/][/g;//](.*)|\
"((?:\\\\|\\"|[^"///])*)"|'((?:\\\\|\\'|[^'\//;])*)'/gi;

reg = 0;
reg = 2 / 1 /**///
/**///
/**/
//
/reg/ 1;

var num1 = 0.541;
