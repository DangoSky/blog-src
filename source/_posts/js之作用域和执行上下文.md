---
title: JS之执行上下文和词法作用域
date: 2019-03-16 16:34:56
tags:
    - JavaScript 
    - 前端基础
categories: JavaScript
summary: 执行上下文的创建阶段和执行阶段各完成的工作，静态作用域和动态作用域的区分，函数声明和函数表达式两者对函数变量和函数名的读写性。
---

# 执行上下文

+ 全局执行上下文： 在浏览器中即window对象，此时this指向该全局对象（作用域链的源头）。JS代码一开始执行就会被创建，而且至始至终都存在直至关闭程序。
+ 函数执行上下文：每次调用函数时都会创建一个函数执行上下文，此时this指向并不能确定，可能指向当前函数，也可能指向全局对象。

&emsp;&emsp;一个执行上下文的生命周期可以分为两个阶段（我看到也有人说是编译阶段和执行阶段，但其实都一样）：
1. **创建阶段**:

&emsp;&emsp;在创建阶段中，代码还没有执行，此时的准备工作是：**创建变量对象**（Variable object，VO）、**建立作用域链**、**确定this的指向**。其中变量对象包含了当前执行上下文所有的参数，变量，函数，相当于是对这些数据进行初始化，工作包括以下三点：

+ **建立argument对象**，检查当前上下文的形参建立相应的属性，对于没有实参的形参则设为undefined。
+ **检查函数声明**，创建指向函数的引用。
+ **检查变量声明**，由var声明的变量通过变量提升会初始化为undefined。

&emsp;&emsp;在创建阶段，变量对象里的所有数据都不能访问，只有等到执行阶段，变量对象转变为活动对象（activation object，AO）后，这些数据才能被访问到。而活动对象，其实也就是变量对象，只是两者在不同的生命周期下的不同状态而已。

2. **执行阶段**:

&emsp;&emsp;创建完成之后就会开始执行代码，此时会完成变量赋值，函数引用，以及执行其他代码等工作。

&emsp;&emsp;其中需要注意的是：

1. 同一作用域下若存在多个同名函数声明，则后面的函数声明会替换前面的。

2. let和const不存在变量提升，变量值不会被初始化为undefined，直到被声明之前这段时间内会进入**暂时性死区**，若在这段时间内使用该变量会直接报错。

3. 创建阶段时，首先会处理函数声明（**函数会优先被提升**），其次再处理变量声明，如果变量名跟已经声明的形参或函数同名，则变量声明不会对其造成干扰。

```js
// 举个栗子：
function fn(a) {
  console.log(a);   // 1
  var a = 2;
  console.log(a);   // 2
}
fn(1);
// 进入创建阶段时，将a变量提前声明了，但因为其跟形参同名所以a不会被初始化为undefined而是保持原先的值1。
// 待到执行阶段时，形参的值被覆盖于是输出2。
// 题外话：如果重新声明一个已经被赋值了的变量，该变量还是会保留原先的值而不会被置为undefined，因为重复的声明会被忽略。
```

&emsp;&emsp;关于arguments：

&emsp;&emsp;调用函数时，会先为每一个函数创建一个Arguments对象，所有作为参数传入的值都会成为Arguments对象的数组元素，在该函数体内可以使用arguments.length来获取到参数个数。需要注意的是，虽然可以通过arguments[0]，arguments[1]等下标形式来获取参数，但arguments是一个伪数组，并没有数组的slice等方法，但可以通过``Array.from(arguments)``来把它转换为真正的数组。如果我们使用``Object.prototype.toString.call(arguments)``来判定argumes的数据类型，得到的会是``[object Arguments]``。

1. 如果我们给arguments新增一个值如arguments[100]，是会成功添加到arguments上的，但不会改变arguments的长度。

2. 如果我们在函数体内修改arguments的值，不仅会修改到arguments上，也会修改到该形参。若是使用严格模式，则只会修改到arguments，但不会修改到该形参。

3. 如果声明一个和形参同名的变量或修改形参，不仅会修改到该形参，也会修改到arguments上。若是使用严格模式，则只会修改到形参，而不会修改到arguments。

**&emsp;&emsp;总结一下就是，在非严格模式下，arguments和形参会同步改变，一变则两者都变。若是严格模式，arguments和形参则不会同步改变。（类似于JS的按值访问和按引用访问）**

![](1.png)

&emsp;&emsp;另外还有一点就是，如果形参是由 rest 接受的，或是设置了默认参数的，形参的改变就不会修改到 arguments 上。

```js
function fn(a) {
  a = 11;
  console.log(arguments);   // [Arguments] { '0': 11 }
}
fn(1);

function fn(...a) {
  a = 11;
  console.log(arguments);   // [Arguments] { '0': 1 }
}
fn(1);

function fn(a=2) {
  a = 11;
  console.log(arguments);   // [Arguments] { '0': 1 }
}
fn(1);
```

# 执行栈 / 调用栈 
&emsp;&emsp;用于存储在代码执行期间创建的所有执行上下文，具有后进先出（LIFO）的特性。

&emsp;&emsp;一开始运行JS代码时，就会创建全局执行上下文并放到到当前的执行栈中（全局执行上下文始终都在执行栈底）。每当调用函数时，JS引擎都会为该函数创建一个新的函数执行上下文（即使该函数曾经被调用过）并放到执行栈的栈顶。当函数执行完毕后，该函数执行上下文就会出栈，上下文控制权将交给执行栈的下一个函数执行上下文。



# 词法作用域
&emsp;&emsp;词法作用域由变量所在的位置决定，编写代码的时候就能够确定的了，所以也是静态作用域。
```js
function foo() {
  console.log(a);   // Uncaught ReferenceError: a is not defined
  a = 1;
}
foo();  
function bar() {
  console.log(a);   // 1
}
bar();    

// 创建foo函数执行上下文时，因为变量a没有使用var声明，所以在创建阶段不存在变量提升。
// 在执行阶段打印a时，会先在本函数的作用域里查找a，如果找不到则继续向父级作用域（这里是全局作用域）查找，也找不到a所以直接抛出错误。
// 如果是非严格模式则还会在全局上创建全局变量a（但是这样会污染全局变量，甚至造成内存泄露），因此在bar函数里往全局作用域查找时就找到了a所以输出1。
```

## 函数声明和函数表达式

&emsp;&emsp;函数表达式里函数变量a可读可写，函数名fn只能读不能写（类似于const）。
```js
var a = function fn() { 
  a = 1;        // 修改成功，但不会改变到fn
  fn = 1;       // 修改失败，非严格模式下默默失效，严格模式下直接报Uncaught TypeError: Assignment to constant 
  variable
  var fn = 1;   // 若是声明一个和函数名同名的变量则会覆盖掉fn，但不会修改到a
}
fn();          // 函数表达式的函数名只在该函数内部有效
a();  
```

&emsp;&emsp;函数声明里函数名fn可读可写（严格模式也是）。
```js
function fn() {  
  console.log(fn);  // 打印函数本身
  fn = 1;
  console.log(fn);   // 1
}
fn();
```

&emsp;&emsp;**IIFE中的函数是函数表达式而不是函数声明**，所以在非匿名自执行函数（Immediately Invoked Function Expressions）中，函数名只能读不能写。

```js
var b = 10;
(function b() {
  b = 20;          // 若是通过var再次声明则会覆盖掉原先的值
  console.log(b)   // 打印函数本身
})()
console.log(b);    // 10
```

## 静态作用域和动态作用域
&emsp;&emsp;刚才说过，JS采用的词法作用域也是静态作用域，变量和函数的作用域是在定义的时候就决定了的，跟执行时的状态无关。我们举个栗子说明便知（取自犀牛书P183）。
```js
var scope = "global scope";
function checkscope(){
  var scope = "local scope";
  function f(){
      return scope;
  }
  return f();
}
checkscope();

var scope = "global scope";
function checkscope(){
  var scope = "local scope";
  function f(){
      return scope;
  }
  return f;
}
checkscope()();
```
&emsp;&emsp;上面两段代码都会得到 local scope。先看第一段代码，我们调用了 checkscope 函数，并在 return 中调用了内部函数 f，返回 scope 变量。在查找 scope 的过程中会先在函数 f 中寻找，寻找不到会往上向外部函数 checkscope 寻找，找到了就返回 "local scope"，如果还找不到才会向上往全局变量查找。而第二段代码和第一段的区别在于，第二段代码是在 checkscope 函数中返回了函数 f，再再全局环境下调用 f。此时 scope 的查找过程其实是跟第一段代码一样的。因为 scope 的作用域早已在函数和变量定义的时候就确定好了，不受函数执行时的位置干扰，这也就是所谓的静态作用域，而动态作用域的查找依赖于函数执行的位置。假若此处使用动态作用域，第二段代码对 scope 的查找同样会是从函数 f 开始，找不到后就往调用 f 的环境即全局环境里去查找了。

&emsp;&emsp;理解了静态作用域后，我们再看一段代码，涉及的知识点是一样的，所以就不多做解释了。
```js
var fn = null;
function foo() {
  var a = 2;
  function innnerFoo() { 
      console.log(a);   // 2
      console.log(c);  // ReferenceError: c is not defined
  }
  fn = innnerFoo; 
}
function bar() {
  var c = 100;
  fn(); 
}
foo();
bar();
```