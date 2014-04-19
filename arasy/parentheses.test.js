// paran 有两种语义。一种是 group operator， 一种是 call operator

// statement 开始时的 paran 是 group operator
if( true ) (a||b);

// operator 后面是  group operator
// void (a)

// )、]、} 后面是 call operator

// 可以结合 slash来一起处理


// 结论
// 如果当前 允许 正则 的话， 那么就是 group operator ，否则是 call operator
