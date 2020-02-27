---
title: JS之原型和原型链
date: 2019-03-20 21:43:15
tags:  
      - JavaScript 
      - 前端基础
categories: JavaScript
summary: prototype 和 __proto__ 的区分，原型链的形成，以及 JS 模拟实现继承。
---

# 前言
&emsp;&emsp;在JavaScript之中并没有 C++ 和 Java 中类的概念，JavaScript的继承是基于原型的，ES6引入的 class 也只是一种语法糖而已，JS通过函数来模拟实现类。

&emsp;&emsp;JavaScript有三种方法可以建立一个对象：
1. 直接使用字面量创建。如``let obj = {}``。
2. 使用构造函数 new 一个实例。
3. 使用create方法，如``let obj = Object.create({})``。

# \__proto\__
&emsp;&emsp;JavaScript的原型里，最重要的两个属性就是``prototype``和``__proto__``（注意左右各是两个下划线）。首先先说 \__proto\__，所有的数据类型都有 \__proto\__ 和 constructor（除了 null 和 undefined）两个属性，前者指向了它们的原型。比如``"abc".__proto__``会返回一个 String 对象，其中包含了字符串的各种方法，``true.__proto__``则返回一个 Boolean 对象。对象的每一个数据都继承了它们原型上的方法，可以化为己用，比如每一个字符串字面量都可以使用 concat，slice 等各种方法。当我们查找一个对象的某个属性时，会先在该对象本身的属性上查找，如果查找不到的话会往它的原型上去查找，如果它的原型上还是没有，则会继续往它的原型的原型上去查找，依次类推上去，直到找到该属性或是达到了原型链的源头即 null 为止（我更喜欢说是源头，而不是尽头），若是达到原型链源头了还没能找到该属性则会返回 undefined。因此我们也能够通过在一个对象的原型增加某一个属性或方法，使得该对象也能够使用到它，包括基本数据类型，如下面这个栗子。
```js
let a = 1;
a.__proto__.name = "hello world";
console.log(a.__proto__ === Number.prototype);    // true
console.log(a.name);         // "hello world"
let b = 2;
console.log(b.name);    // "hello world"
```
&emsp;&emsp;虽然 a 只是一个普通的数字，但通过给它的原型``Number.prototype``增加了一个 num 属性，所以 a 也继承了这个 num 属性，包括其他也是以 Number.prototype 为原型的数据也是如此。除了直接使用 \__proto\__ 外，我们还可以使用``Object.getPrototypeOf()``来获取一个对象的属性，使用``Object.setPrototypeOf()``来设置一个对象的原型。（听说 \__proto\__ 操作比较慢而且还耗性能？这点我是从其他博客看到的，尚未经过实验。不过即使不考虑性能，单从兼容性上考虑也不推荐使用 \__proto\__，毕竟 \__proto\__ 只是浏览器厂商自己实现的内部属性。）

# prototype
&emsp;&emsp;至于``prototype``属性，需要明确区分的一点是，prototype 只是**存在于函数上的，并且这个函数要能够使用 new 运算符来生成实例**（相当于构造函数），像 Math.round() 这样的函数就没有 prototype 属性。当我们使用构造函数创建一个实例时，实例的 ``__proto__`` 属性就是指向了其构造函数的 ``prototype``属性（即该实例的原型）。
```js
function Fn() {}
let obj = new Fn();
console.log(obj.__proto__ === Fn.prototype);        
console.log(Fn.__proto__ === Function.prototype);   // 通过函数字面量定义的函数的 __proto__ 属性都指向了 Function.prototype。
console.log(Fn.prototype.__proto__ === Object.prototype);    // 注意和上式进行区分，构造函数继承自Function，其原型继承自 Object.prototype，因为 Fn.prototype 是一个对象，所以原型是 Object.prototype。
console.log(({}).__proto__ === Object.prototype);   // 通过对象字面量定义的对象的 __proto__ 属性都指向了Object.prototype。
console.log(Object.prototype.__proto__ === null);    // Object函数的原型的 __proto__ 属性指向null。
```

&emsp;&emsp;我们知道，普通函数实际上是Function的实例，即普通函数继承于``Function.prototype``，而**Object、Number、String、Function 等构造函数也是继承自``Function.prototype``**的。``Function.prototype``继承于``Object.prototype``，``Object.prototype``继承自 null，而null是原型链的源头。一条链下来就是`` Array/String/Number/Function -> Function.prototype -> Object.prototype -> null``。
```js
函数名.__proto__ === Function.prototype  
Function.prototype.__proto__ === Object.prototype
Object.prototype.__proto__ === null  

Number.__proto__ === Function.prototype  
String.__proto__ === Function.prototype  
Boolean.__proto__ === Function.prototype  
Object.__proto__ === Function.prototype  
Function.__proto__ === Function.prototype    
// 上述几个式子都为true
```

# constructor
&emsp;&emsp;此外还有一个``constructor``属性，存在于所有数据类型上（除了 null 和 undefined 外），指向了它们的构造函数。比如
```js
(true).constructor   // ƒ Boolean() { [native code] }
(1).constructor      // ƒ Number() { [native code] }

function Fn() {}
let obj = new Fn();
obj.constructor === Fn     // true
```
&emsp;&emsp;原型上的 constructor 属性也指向了构造函数，即该函数本身，``Fn.prototype.constructor === Fn)  // true ``。不过说 constructor 属性，存在于所有数据类型上不是很严谨， 并不是那些基本数据类型上自己有 constructor 属性，我们对其使用 constructor 属性时，实际是到它们的原型上获取到 constructor 属性的。
&emsp;&emsp;我们用一张关系图来总结 ``prototype`` 、 ``__proto__`` 和 ``constructor`` 的关系。

![](1.jpg)

# instanceof

&emsp;&emsp;我们可以使用``instanceof``来判断一个对象的原型链上是否存在一个构造函数的原型。如 A instanceof B，即判断  B.prototype 是否在对象 A 的原型链上。在判定过程中会循着 A 的原型链上去查找，只要该对象出现在其原型链上的任一位置，就会判定为 true。当然也可以借此判断某一个数据的数据类型，不过这还是会有些不足，虽然判断一个数据是否为数组时``[] instanceof Array``会返回 true，但判定``[] instanceof Object``也还是会返回 true，所以判定数据类型的时候还是采用``Object.prototype.toString.call()``的好。现在我们再来看下面的几个等式。

```js
Object instanceof Function
Function instanceof Function 
Function instanceof Object 
Object instanceof Object
// 上述几个式子都为true
```
&emsp;&emsp;前两个式子之所以会返回 true，是因为 Object 和 Function 等构造函数都继承自 ``Function.prototype``，所以所有的函数都能通过原型链找到创建它们的 Function 构造函数，自然也就返回了 true。而 ``Function.prototype``是一个对象，它的构造函数是 Object，所以在对 Function、Object 等的原型链上寻找时会找到它们的构造函数 Object，自然也就返回了 true。

&emsp;&emsp;我们可以根据 instanceof 的工作原理来模拟实现 instanceof。

```js
function _instanceof(left, right) {
  // 左值需要是函数或非null的对象，右值需要是函数。
  if(!((typeof left === "function" || (typeof left === "Object" && left !== null)) && typeof right === "function")) {
    throw new Error("传入的参数不符合规范。");
  }
  let _left = left.__proto__;
  let _right = right.prototype;
  while(true) {
    if(_left === _right) {
      return true
    }
    else if(_left === null) {
      return false
    }
    _left = _left.__proto__;
  }
}
```

`instanceof` 的工作原理是调用对象内置的 [Symbol.hasInstance](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance) 方法，我们可以通过改写 `Symbol.hasInstance` 来自定义的 `instanceof` 行为。

```js
class PrimitiveNumber {
  static [Symbol.hasInstance](x) {
    return typeof x === 'number'
  }
}
console.log(111 instanceof PrimitiveNumber); // true
```

# 判断数据类型的方法

#### typeof

可以判断基本数据类型，但判断数组、对象和 null 时得到的都是 Object，并且 `typeof NaN` 会得到 Number。可以在 typeof 的基础上再使用 Array.isArray 加以区分。

#### instanceof

可以判断基本数据类型，但判断引用类型的话，因为所有原型都继承自 Object，所以 `函数/数组 instanceof Object` 都会得到 true。

#### toString

通过 `Object.prototype.toString.call()` 来判断数据类型，不仅是基本数据类型还是引用数据类型，都可以得到正确结果。而且对于 Map、Set 等数据结构也能准确判断。


# JS继承的几种方式
## 构造函数继承
&emsp;&emsp;直接在子构造函数中调用父构造函数，这样可以使子类继承了父构造函数的属性和方法。
```js
function Parent() {
  this.name = "Parent";
}
Parent.prototype.show = function() {
  console.log("I'm Parent");
}
function Child() {
  Parent.call(this);    // 需要的话还可以向父构造函数传递参数
  this.des = "Child constructor" 
}
let child = new Child();
console.log(child.name);   // Parent
console.log(child.show);   // undefined
```
&emsp;&emsp;使用构造函数继承的缺陷在于，子构造函数只是继承到父构造函数中的属性和方法，无法继承到父构造函数原型链上的东西，因为这种方法**只是简单地在子构造函数上调用父构造函数，拷贝了一份属性方法而已**。

## 原型链继承
&emsp;&emsp;为了解决构造函数继承的问题，我们可以直接让子构造函数的原型指向父构造函数，这样既能继承父构造函数的属性方法，也能继承其原型链上的属性方法。
```js
function Parent() {
  this.name = "Parent";
}
Parent.prototype.show = function() {
  console.log("I'm Parent");
}
function Child() {
  this.des = "Child constructor" 
}
Child.prototype = new Parent();
let child = new Child();

// Child.prototype = Parent;
// child -> Child.prototype(Parent本身) -> Function.prototype -> Object.prototype -> null
// Child.prototype = new Parent();
// child -> Child.prototype(Parent的实例) -> Parent.prototype -> Object.prototype -> null
```
&emsp;&emsp;要注意到上面两种不同写法，结果 child 的原型链是不一样的。前面原型链上没有``Parent.prototype``，所以 child 上自然也就没有 show 方法了。原型链继承的不足在于，创建实例时不能给构造函数传参，child 不能自由初始化父构造函数上变量的值。而且对于每一个由 Child 生成的实例，当它们对 **Parent构造器上的引用类型数据**进行修改时会互相影响，因为每一次修改都会改动到 Parent 构造器上的值，造成下一次 Child 实例回溯原型链取值时拿到的都是被修改后的值。我们先修改一下上面的代码。
```js
function Parent() {
  this.name = "Parent";
  this.arr = [1,3];
}
Parent.prototype.show = function() {
  console.log("I'm Parent");
}
function Child() {
  this.des = "Child constructor" 
}
Child.prototype = new Parent();
let child = new Child();
let child1 = new Child();
// 操作一
child.arr[0] = 0;   // child.arr -> [0, 3], child1.arr -> [0, 3]
// 操作二
child.arr.push(4);  // child.arr -> [1, 3, 4], child1.arr -> [1, 3, 4]
// 操作三
child.arr = [1];    // child.arr -> [1], child1.arr -> [1, 3]
```
&emsp;&emsp;举这个例子要说明的是 JS 的堆栈存储方式。使用原型链继承，child 和 parent 都指向了 Parent.prototype 这个对象，而对象中的值是存储在堆中的，存储在栈中的只是指向这个堆空间的地址而已。如果是直接修改堆中数据的值（比如操作一和操作二），那么会影响到所有指向这个地址空间的变量。而若只是改变地址空间的指向，则不会影响到其他指向原来这个地址空间的变量（比如操作三）。（看到这里，你有没有想到那构造函数继承法会不会也存在这个问题？答案是不会，至于原因，其实上面的加粗字体也已经解释了。）

&emsp;&emsp;针对上面的例子，我们通过一段代码来佐证吧，这里就不再花篇幅解释了，有疑问的读者再好好理解上面这一段话吧。
```js
function A(params) {
  this.c = 1;
}
let a = new A();
A.prototype = {
  c: 1,
  d: 2
};
console.log(a.c);   // 1
console.log(a.d);   // undefined
// a 始终指向构造函数之前的那个原型
```

## 构造函数继承 + 原型链继承

&emsp;&emsp;既然构造函数继承法里不存在实例修改父构造函数上引用类型的值会相互影响的问题，那么我们便可以采用构造函数继承 + 原型链继承的方法了。使用构造函数继承法使子构造函数拥有父构造函数的属性和方法，使用原型链继承法修改子构造函数的原型使其指向父构造函数的原型。

```js
function Parent() {
  this.name = "Parent";
  this.arr = [1,3];
}
Parent.prototype.show = function() {
  console.log("I'm Parent");
}
function Child() {
  Parent.call(this);
  this.des = "Child constructor" 
}
// 这里不使用上例的 Child.prototype = new Parent()，是为了不重复指向两次父构造函数，避免引入多余的重复数据
Child.prototype = Parent.prototype;
let child = new Child();   
child.arr[0] = 10;        
let child1 = new Child();  // child.arr -> [10, 3]，child1.arr -> [1, 3]
```

&emsp;&emsp;现在可以看到，即使在 Child 的一个实例上修改了 arr 的值，也不会影响到 其他实例上 arr 的值了。不过问题又来了，当我们``console.log(child.constructor)``的时候，发现输出的会是 Parent 构造函数。这问题也很好理解，因为我们修改了 child.prototype 的原型，而我们对某一个对象或函数使用 constructor 属性时是到它们的原型上去读取的，所以 child 的构造函数自然也就成了 Parent。既然如此，我们可以手动把它的构造函数改回来，设置``Child.prototype.constructor = Child``。

```js
Child.prototype.constructor = Child
console.log(child.constructor);    // Child函数
let parent = new Parent();
console.log(parent.constructor);  // Child函数
```

&emsp;&emsp;虽然通过手动修改 Child.prototype 的 constructor 属性可以修正 Child 实例的构造函数指向错误问题，但当我们输出 Parent 实例的构造函数的时候发现也同样输出了 Child 函数！原因呢？我们可能会忽略了一点，``Child.prototype``是一个对象，而对象是按引用传递，牵一发而动全身！知道了问题所在，就可以对症下药了。使用``Object.create``方法既可以以参数为原型创建一个对象，也可以防止修改对象时也对原本的对象造成影响（但修改参数对象的话是会对实例对象造成修改的）。除了``Object.create``方法外，也可以使用``Child.prototype = JSON.parse(JSON.stringify(Parent.prototype))``，作用是一样的。最终的构造函数继承 + 原型链继承方法的代码实现为：

```js
function Parent() {
  // 父构造函数的属性和方法
}
function Child() {
  Parent.call(this);
  // 子构造函数的属性和方法
}
// 绑定子构造函数的原型
Child.prototype = Object.create(Parent.prototype);
// Child.prototype = JSON.parse(JSON.stringify(Parent.prototype));
// 修正实例构造函数的指向错误
Child.prototype.constructor = Child;
```

