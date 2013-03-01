/**
 * Created with JetBrains WebStorm.
 * User: taoqili
 * Date: 13-1-27
 * Time: 下午7:29
 * To change this template use File | Settings | File Templates.
 */

var fileList = [
    "lexer.js",
    "comment.js"
];
document.write('<script type="text/javascript" src="../lexer.js"></script>');
for(var i= 0,file;file = fileList[i++];){
    document.write('<script type="text/javascript" src="src/' + file + '"></script>');
}