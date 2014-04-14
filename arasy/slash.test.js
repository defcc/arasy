
// in expression

a++/a/i; // divide
++/a/i; // regexp prefix

(a)/a/i //divide

5+/a/i // divide

+/a/i // regexp

var s = function(){}/i/i; // divide

1,/2/,3; // comma 后面是 regexp

// statement start
if(a)/a/i // regexp

function t(){}/i/i; // regexp


// Conclusion
// 对于statement解析。在statement开始时碰到的 / 为 regexp
// 对于在expression 中碰到的。如果是 前缀 表达式，那么 / 为 regexp，否则为 divide

// 1. 需要判断是在statement的开始处