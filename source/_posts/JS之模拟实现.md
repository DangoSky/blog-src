---
title: JS之模拟实现
date: 2019-03-28 11:09:25
tags: JavaScript
categories: JavaScript
summary: 编写函数模拟实现JS中的一些api，包括但不限于bind、flat、new等，陆续更新中。
cover: true
---

# call
&emsp;&emsp;利用函数作为对象方法的时候 this 指向了该对象，所以给目标对象添加要调用的函数并执行，了事后再删除该对象中这个方法就可以了。
```js
Function.prototype._call = function(...arg) {
  let context = arg[0] || window;   // 没有传递参数或参数为null和undefined时默认this指向window
  if(typeof context !== 'object') {
    context = Object.create(null);  // context为原始值时this指向该原始值的自动包装对象。
  }
  // 考虑到对象本身已经有fn这个方法，使用Symbol作为对象的属性名可以保证不会出现同名的属性
  let fn = Symbol();
  // 通过this获取调用call的函数，方法中的this指向调用方法的对象
  context[fn] = this;  
  // 函数可能有返回值
  let result = context[fn](...arg.slice(1));
  // 也可使用 eval 方法
  // let result = eval('context[fn](' + '...arg.slice(1)' + ')');   
  // 最后记得要从对象中删除该方法
  delete context[fn];
  return result;   
}
let name = "window";
let obj = {
  name: "local"
}    
function show(param) {
  console.log(this.name);
  console.log(param);
}
show._call(obj, "dangosky");、
```

&emsp;&emsp;至于 apply，只是传入的参数变成了数组而已，导致了 arg 可能是一个二维数组。所以只需要把上述调用``content[fn]``函数的代码改为``context[fn](...(arg.slice(1).flat()))``即可，

# bind
&emsp;&emsp;大致同 apply，但 bind 返回的是一个函数，并且需要考虑到返回的函数作为构造函数的情况。
```js
Function.prototype._bind = function(...arg) {
  let _this = this;
  let fn = function(...arg1) {
    // 考虑到返回的函数作为构造函数时this会指向实例，即 this instanceof fn 为true，此时执行环境为实例自己。
    // 若返回的函数只是作为普通函数调用，则this指向window，此时执行环境为最初指定的context
    let context = this instanceof fn ? this : arg[0];
    return _this.call(context, ...arg.slice(1).concat(...arg1));
  }
  // 若返回的函数作为构造函数时，实例要继承原先绑定函数的属性方法，所以要改变返回的函数的原型。
  // 因为原型是一个对象，牵一发而动全身所以不能直接赋值
  fn.prototype = Object.create(this.prototype); 
  // 或者使用一个空函数充当中间代理
  // var empty = function () {};
  // empty.prototype = this.prototype;
  // fn.prototype = new empty();
  return fn;
}

let obj = {
  name: "local"
}    
function show(param1, param2) {
  console.log(this.name);
  console.log(param1 + param2);
}
var Fn = show._bind(obj, "Hello");
Fn(" 作为的普通函数"); 
var test = new Fn(" 作为构造函数");
```

# flat
## 迭代 + reduce

```js
Array.prototype._flat = function(deep = 1) {
  let arr = this;
  while(deep--) {
    // 标志数组是否已经达到一维，防止参数为Infinity时炸掉
    let mark = true;
    arr = arr.reduce((total, val) => {
      if(Array.isArray(val)) {
        mark = false;
      }
      return total.concat(val);
    }, [])
    if(mark)  return arr;
  }
  return arr;
}

console.log([1, 2, [3, 4, [5, 6]]]._flat(Infinity));
console.log([[1], [[2, 3], [4]], 5, 6]._flat());
```

## 递归 + map

```js
Array.prototype._flat = function(deep = 1) {
  let result = [];
  let arr = this;
  if(deep <= 0)  return arr;
  arr.map((val) => {
    if(Array.isArray(val)) {
      mark = true;
      result = result.concat(val._flat(deep-1));
    }
    else {
      result.push(val);
    }
  })
  deep--;
  return result;
}
```

## 不考虑展平的深度（一展到底）
### 1. join + split
```js
function _flat(arr) {
  return arr.join().split(',').map((val) => {
    return Number(val);
  })
}
console.log(_flat([[1], [[2, 3], [4]], 5, 6]));
console.log(_flat([1, '1', ['1', '2', [3, '4']]]));
```

### 2. reduce + 递归
```js
function _flat(arr) {
  return arr.reduce((total, val) => {
    if(Array.isArray(val)) {
      total = total.concat(_flat(val));
    }
    else {
      total.push(val);
    }
    return total;
  }, [])
}
```

### 3. some + 循环
```js
function _flat(arr) {
  while(arr.some((val) => {
    return Array.isArray(val)
  })) {
    arr = [].concat(...arr);
  }
  return arr;
}
```

&emsp;&emsp;若只是展平二维数组，则还可以利用 apply 中第二个参数是(伪)数组，每个值都会单独添加即会被展平（仅限于二维数组）。
```js
[].concat([[1], [[2, 3], [4]], 5, 6]);                 // [ [ 1 ], [ [ 2, 3 ], [ 4 ] ], 5, 6 ]
[].concat.apply([], [[1], [[2, 3], [4]], 5, 6]);       // [ 1, [ 2, 3 ], [ 4 ], 5, 6 ]
```

# new
&emsp;&emsp;其实 new 的模拟实现很简单，只要理解 new 做的四件事就可以了：
1. 先创建一个新对象。
2. 把新对象的原型绑定为构造函数的原型以实现继承。
3. 执行构造函数而且 this 指向新对象。
4. 若构造函数指定返回了一个对象则返回该指定对象否则返回创建的新对象。

```js
function _new(Constructor, ...arg) {
  let obj = {};
  obj.__proto__ = Object.create(Constructor.prototype);
  let result = Constructor.apply(obj, arg);
  return typeof result === 'object' ? result : obj; 
}

function Fn(name) {
  this.name = name;
  this.getName =  function() {
    console.log(this.name);
  }
}
Fn.prototype.foo = function () {
  console.log('Hello ' + this.name);
}
var person = _new(Fn, 'dangosky')
console.log(person.name);    // dangosky
person.getName();           // dangosky
person.foo();              // Hello dangosky
```

# instanceof
&emsp;&emsp;只要循环去取左值的原型和右值的原型比较即可。
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

# 深拷贝
&emsp;&emsp;递归拷贝每一个引用类型数据即可。

```js
function deepCopy(obj) {
  if(typeof obj !== 'object')  return obj;
  let res = obj.constructor === Array ? [] : {};
  for(let key in obj) {
    if(typeof obj[key] === 'object' && obj[key] !== null) {
      res[key] = deepCopy(obj[key]);
    }
    else {
      res[key] = obj[key];
    }
  }
  return res;
}

var obj = {a:1, arr: [{t: 1}, {t: 2}], b: null, c: undefined};
let obj1 = deepCopy(obj);
obj1.arr[1].t = 20;
console.log(obj);    // { a: 1, arr: [ { t: 1 }, { t: 2 } ], b: null, c: undefined }
console.log(obj1);   // { a: 1, arr: [ { t: 1 }, { t: 20 } ], b: null, c: undefined }
```

&emsp;&emsp;JSON.parse() + JSON.stringify()实现。
```js
var obj = {a:1, arr: [{t: 1}, {t: 2}], b: null, c: undefined};
let obj1 = JSON.parse(JSON.stringify(obj));
```

> 至于这两种方法的不足，请看[我的另一篇文章](http://blog.dangosky.com/2019/04/01/shen-kao-bei-shi-xian/)介绍。

# 记忆函数

&emsp;&emsp;记忆函数的功能在于缓存先前操作得到的结果，避免对同一个值进行重复计算浪费时间，比如斐波那契数列和阶乘等运算，算是用空间换时间吧。

```js
// 记忆函数
function memoize(res, fn) {
  var recur = function(n) {
    // 若记忆数组中没有记录则递归求值再保存
    if(typeof res[n] !== 'number') {
      res[n] = fn(recur, n);
    }
    return res[n];
  }
  return recur;
}

// 斐波那契数列
function fibonacci(fn, n) {
  return fn(n-1) + fn(n-2);
} 
let memoizeFib = memoize([0, 1], fibonacci);
console.log(memoizeFib(20));

// 阶乘
function factorial(fn, n) {
  return n * fn(n-1);
}
let memoizeFac = memoize([0, 1], factorial);
console.log(memoizeFac(6));
```

# reduce实现map

```js
Array.prototype._map = function(fn, context = null) {
  let arr = this;
  let res = [];
  arr.reduce((total, curVal, index, arr) => {
    let temp = fn.call(context, curVal, index, arr);
    res.push(temp);
  }, null)
  return res;
}
```
