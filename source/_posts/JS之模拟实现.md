---
title: JS 之模拟实现
date: 2019-03-28 11:09:25
tags: JavaScript
categories: JavaScript
summary: 编写函数模拟实现 JS 中的一些 api，包括但不限于 bind、flat、new 等，陆续更新中。
cover: true
---

# Object.is

```js
function is(a, b) {
  // 修正 NaN !== NaN 为 false 的 bug
  if (a !== a && b !== b) {
    return true;
  }
  // 修正 +0 === -0 为 true 的 bug
  // 1/+0 = +Infinity，1/-0 = -Infinity
  if (
    a === b &&
    a === 0 &&
    b === 0 &&
    1 / a !== 1 / b
  ) {
    return false;
  }
  return a === b;
}
```

# call

&emsp;&emsp; 利用函数作为对象方法的时候 this 指向了该对象，所以给目标对象添加要调用的函数并执行，了事后再删除该对象中这个方法就可以了。
```js
Function.prototype._call = function(context, ...arg) {
  context = context || window;   // 没有传递参数或参数为 null 和 undefined 时默认 this 指向 window
  if(typeof context !== 'object') {
    context = Object.create(null);  // context 为原始值时 this 指向该原始值的自动包装对象。
  }
  // 考虑到对象本身已经有 fn 这个方法，使用 Symbol 作为对象的属性名可以保证不会出现同名的属性
  const fn = Symbol('fn');
  // 通过 this 获取调用 call 的函数，方法中的 this 指向调用方法的对象
  context[fn] = this;
  // 函数可能有返回值
  const result = context[fn](...arg);
  // 也可使用 eval 方法
  // let result = eval('context[fn](' + '...arg' + ')');
  // 最后记得要从对象中删除该方法
  delete context[fn];
  return result;
}

/* test */
let name = "window";
let obj = {
  name: "local"
}
function show(param) {
  console.log(this.name);
  console.log(param);
}
show._call(obj, "dangosky");
```

# apply

```js
Function.prototype._apply = function(context, arg) {
  context = context || window;
  if(typeof context !== 'object') {
    context = Object.create(null);
  }
  const fn = Symbol('fn');
  context[fn] = this;
  const result = context[fn](...arg);
  delete context[fn];
  return result;
}
```


# bind

&emsp;&emsp; 大致同 apply，但 bind 返回的是一个函数，并且需要考虑到返回的函数作为构造函数的情况。

```js
Function.prototype._bind = function(context, ...arg) {
  // 保存 this，表示调用 bind 的函数
  let _this = this;
  let fn = function(...arg1) {
    // 考虑到返回的函数作为构造函数时 this 会指向实例，即 this instanceof fn 为 true，此时执行环境为实例自己。
    // 若返回的函数只是作为普通函数调用，则 this 指向 window，此时执行环境为最初指定的 context
    context = this instanceof fn ? this : context
    return _this.apply(context, arg.concat(arg1));
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

/* test */
let obj = {
  name: "local"
}
function show(param1, param2) {
  console.log(this.name);
  console.log(param1 + param2);
}
var Fn = show._bind(obj, "Hello");
Fn("作为的普通函数");
var test = new Fn("作为构造函数");
```

# flat

## 迭代 + reduce

```js
Array.prototype._flat = function(deep = 1) {
  let arr = this;
  while(deep--) {
    // 标志数组是否已经达到一维，防止参数为 Infinity 时炸掉
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

## 迭代 + map

```js
Array.prototype._flat = function(deep = 1) {
  let res = this;
  while(deep--) {
    let isFinish = true;
    let temp = [];
    res.map(item => {
      if (Array.isArray(item)) {
        isFinish = false;
      }
      temp = temp.concat(item);    
    })
    res = temp;
    if (isFinish) {
      break;
    }
  }
  return res;
}
```


## 递归

```js
Array.prototype._flat = function(deep = 1) {
  let result = [];
  let arr = this;
  if(deep <= 0)  return arr;
  arr.forEach((val) => {
    if(Array.isArray(val)) {
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
    return val; // 通过该方法得到的扁平数组元素都是string，得再根据需要去转换
  })
}
console.log(_flat([[1], [[2, 3], [4]], 5, 6]));
console.log(_flat([1, '1', ['1', '2', [3, '4']]]));
```

### 2. 递归 + reduce
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

### 3. 循环判断 + 扩展运算符
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

&emsp;&emsp; 若只是展平二维数组，则还可以利用 apply 中第二个参数是 (伪) 数组时，每个值都会单独添加即会被展平（仅限于展平深度为 1）。

```js
[].concat([[1], [[2, 3], [4]], 5, 6]);                 // [ [ 1 ], [ [ 2, 3 ], [ 4 ] ], 5, 6 ]
[].concat.apply([], [[1], [[2, 3], [4]], 5, 6]);       // [ 1, [ 2, 3 ], [ 4 ], 5, 6 ]
```

# new

&emsp;&emsp; 其实 new 的模拟实现很简单，只要理解 new 做的四件事就可以了：
1. 先创建一个新对象。
2. 把新对象的原型绑定为构造函数的原型以实现继承。
3. 执行构造函数而且 this 指向新对象。
4. 若构造函数指定返回了一个对象则返回该指定对象否则返回创建的新对象。

```js
function _new(Constructor, ...arg) {
  if(typeof Constructor !== 'function'){
    throw `${Constructor} must be a function`;
  }
  let obj = {};
  Object.setPrototypeOf(obj, Object.create(Constructor.prototype));
  let result = Constructor.apply(obj, arg);
  const isObject = typeof result === 'object' && result !== null;
  const isFunction = typeof result === 'function';
  return (isObject || isFunction) ? result : obj;
}

function Fn(name) {
  this.name = name;
  this.getName =  function() {
    console.log(this.name);
  }
}
Fn.prototype.foo = function () {
  console.log('Hello' + this.name);
}
var person = _new(Fn, 'dangosky')
console.log(person.name);    // dangosky
person.getName();           // dangosky
person.foo();              // Hello dangosky
```

# instanceof

&emsp;&emsp; 只要循环去取左值的原型和右值的原型比较即可。
```js
function _instanceof(left, right) {
  // 左值需要是函数或非 null 的对象，右值需要是函数。
  if(!((typeof left === "function" || (typeof left === "Object" && left !== null)) && typeof right === "function")) {
    throw new Error("传入的参数不符合规范。");
  }
  let _left = left.__proto__;
  let _right = right.prototype;
  while(true) {
    if(_left === _right) {
      return true
    }
    if(_left === null) {
      return false
    }
    _left = _left.__proto__;
  }
}
```

# 基础版深拷贝

&emsp;&emsp; 递归拷贝每一个引用类型数据即可。

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

&emsp;&emsp;JSON.parse() + JSON.stringify() 实现。
```js
var obj = {a:1, arr: [{t: 1}, {t: 2}], b: null, c: undefined};
let obj1 = JSON.parse(JSON.stringify(obj));
```

> 至于这两种方法的不足，请看[我的另一篇文章](http://blog.dangosky.com/2019/04/01/%E6%B7%B1%E6%8B%B7%E8%B4%9D%E5%AE%9E%E7%8E%B0/) 介绍。

# 优化版深拷贝

> 优化方向和思路还是参考[我的另一篇文章](http://blog.dangosky.com/2019/04/01/%E6%B7%B1%E6%8B%B7%E8%B4%9D%E5%AE%9E%E7%8E%B0/#toc-heading-6) 介绍。

```js
function deepCopy(obj, map = new WeakMap()) {
  if (map.get(obj)) {
    return obj;
  }
  // 如果 obj 只是基本类型的话，就直接返回
  if(typeof obj !== 'object' || obj === null) return obj;
  const objType = Object.prototype.toString.call(obj);
  // 根据 obj 的数据类型获取到它的构造函数
  const constructorFn = Object.getPrototypeOf(obj).constructor;
  // 根据构造器创建不同的数据类型，并注意需要传递 obj 为参数。如果是 Date、Error 等数据类型才可以获取到这个值
  const res = new constructorFn(obj);
  // 标记 obj 已经拷贝过了
  map.set(obj, true);
  if (objType === "[object Array]" || objType === "[object Object]") {
    for(let key in obj) {
      // 因为 in 方法会遍历到 obj 的原型连上，所以需要判 key 是不是 obj 自己的属性
      if (obj.hasOwnProperty(key)) {
        res[key] = deepCopy(obj[key], map);
      }
    }
  } else if (objType === "[object Map]") {
    obj.forEach((item, key) => {
      res.set(deepCopy(key), deepCopy(item));
    })
  } else if (objType === "[object Set]") {
    obj.forEach(item => {
      res.add(deepCopy(item));
    })
  }
  return res;
}
```

# 记忆函数

&emsp;&emsp; 记忆函数的功能在于缓存先前操作得到的结果，避免对同一个值进行重复计算浪费时间，比如斐波那契数列和阶乘等运算，算是用空间换时间吧。

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

# 实现数组的 map 方法

```js
Array.prototype._map = function(fn, context = null) {
  if (this === null || this === undefined) {
    throw new TypeError("Cannot read property 'map' of null or undefined");
  }
  if (Object.prototype.toString.call(fn) != "[object Function]") {
    throw new TypeError(fn + ' is not a function')
  }
  const arr = this;
  const res = [];
  arr.forEach((val, index, arr) => {
    let temp = fn.call(context, val, index, arr);
    res.push(temp);
  })
  return res;
}
```

# 实现数组的 reduce 方法

```js
Array.prototype._reduce = function(fn, initialValue, context = null) {
  if (this === null || this === undefined) {
    throw new TypeError("Cannot read property 'reduce' of null or undefined");
  }
  if (Object.prototype.toString.call(fn) != "[object Function]") {
    throw new TypeError(fn + ' is not a function')
  }
  const arr = this;
  // 如果有传初始值的话，则结果值初始化为该初始值；否则初始化为数组第一个元素
  const hasInitialValue = initialValue !== undefined;
  let res = hasInitialValue ? initialValue : arr[0];  
  for(let i=0; i<arr.length; i++) {
    // 如果 res 已经被初始化为数组第一个元素，则不需要对第一个数组元素进行计算了
    if (!hasInitialValue && i === 0) {
      continue;
    }
    res = fn.call(context, res, arr[i], i, arr);
  }
  return res;
}
```

# 实现数组的 filter 方法

```js
Array.prototype._filter = function(fn, context = null) {
  if (this === null || this === undefined) {
    throw new TypeError("Cannot read property 'reduce' of null or undefined");
  }
  if (Object.prototype.toString.call(fn) != "[object Function]") {
    throw new TypeError(fn + ' is not a function')
  }
  const arr = this;
  const res = [];
  for(let i=0; i<arr.length; i++) {
    const mark = fn.call(context, arr[i], i, arr);
    if (mark) {
      res.push(arr[i]);
    }
  }
  return res;
}
```

# 实现数组的 push 方法

```js
Array.prototype._push = function(...items) {
  let arr = this;
  let originLen = arr.length;
  let addLength = items.length;
  for (let i=0; i<addLength; i++) {
    arr[originLen + i] = items[i];
  }
  // 考虑到对象可能也会调用 push 方法，所以得手动修改 length 属性。可见下例
  arr.length = originLen + addLength;
  return arr.length;
}

/* test */
var obj = {
  length: 0,
  addElem: function addElem (elem) {
    [].push.call(this, elem);
  }
};
obj.addElem({});
obj.addElem({});
console.log(obj);
```

# 实现数组的 pop 方法

```js
Array.prototype._pop = function() {
  let arr = this;
  let len = (+arr.length);
  // 如果不包含length属性或length属性不能被转成一个数值，会将length置为0，并返回undefined（参考自MDN）
  if (len === undefined || typeof len !== 'Number') {
    arr.length = 0;
    return undefined;
  }
  len--;
  const res = arr[len];
  delete arr[len];
  arr.length = len;
  return res;
}
```

# 实现数组的 splice 方法

```js
Array.prototype._splice = function(start, deleteSum, ...arg) {
  const arr = this;
  const len = arr.length;
  const res = [];
  // 处理开始索引为负数或越界的情况
  if (start < 0) {
    start = start + len > 0 ? start + len : 0;
  } else if(start > len) {
    start = len;
  }
  // 处理删除个数异常的情况。如果没有指定删除个数或其大于数组剩下的元素，则调整为删除剩下的所有元素
  if (deleteSum === undefined || deleteSum > len - start) {
    deleteSum = len - start;
  } else if(deleteSum < 0) {
    deleteSum = 0;
  }

  // 先将剩下的数组元素排到要新增的数组元素后面，这样就可以直接替换而不必去区分是剩下的数组元素亦或是要新增的了
  for(let i=start+deleteSum; i<len; i++) {
    arg.push(arr[i]);
  }
  let sum = 0;  // 表示已经删除的个数
  let arrIndex = start; // 循环原数组的索引
  let argIndex= 0;  // 循环要替换的数组的索引
  // 删除个数已经达到了并且要替换的数组已经全部替换完了才退出循环
  while(sum < deleteSum || argIndex < arg.length) {
    if (sum < deleteSum) {
      res.push(arr[arrIndex]);
      sum++;
    }
    arr[arrIndex++] = arg[argIndex++];
  }
  // 为避免因删除的个数和新增的个数不相等时，进行数组替换会出现undefined，所以最后还需要修改数组长度
  if (arg.length === 0) {
    arr.length = len - deleteSum;
  } else {
    arr.length = start + arg.length;
  }
  return res;
}
```


# Event 事件

```js
class EventEmitter {
  constructor() {
    this.events = new Map();  // 以事件名为键，监听函数数组为值
  }

  emit(name, ...arg) {
    const handles = this.events.get(name);
    if (handles && handles.length) {
      handles.forEach(fn => {
        fn.apply(this, arg);
      })
      return true;
    }
    return false;
  }

  addListener(name, fn) {
    const handles = this.events.get(name) || [];
    handles.push(fn);
    this.events.set(name, handles);
  }

  removeListener(name, fn) {
    const handles = this.events.get(name) || [];
    this.events.set(name, handles.filter(item => {
      return item !== fn;
    }))
  }

  removeAllListener(name) {
    this.events.set(name, []);
  }
}

/* test code */
const event = new EventEmitter();

function fn1() {
  console.log('hello world');
}
function fn2(name) {
  console.log(`hello ${name}`);
}

event.addListener('click', fn1);
event.addListener('click', fn2);
event.emit('click', 'DangoSky');
```

# 发布订阅模式

```js
class Publish {
  constructor() {
    this.subs = [];
    // 数组元素的格式为：{id, callbacks: {cb1, cb2}}
    // 订阅者的 callback 数据格式为对象，是为了使订阅者有多个订阅函数，并且在取消订阅时可以更好地区分订阅函数。
    // 如果使用数组的话需要用数组下标这样语义不强
  }
  notice() {
    this.subs.forEach(item => {
      Object.values(item.callbacks).forEach(fn => {
        fn && fn();
      })
    })
  }
  add(one) {
    this.subs.push(one);
  }
  remove(sub, fnName) {
    // 不传第二个参数(要移除的订阅者的某个订阅函数名)的话，就是移除整个订阅者
    if (fnName === undefined) {
      this.subs = this.subs.filter(item => {
        return item.id !== sub.id;
      })
    } else {
      // 只是移除订阅者的某个回调函数
      this.subs.forEach(item => {
        if (item.id === sub.id) {
          for(let key in item.callbacks) {
            if (key === fnName) {
              item.callbacks[key] = null;
            }
          }
        }
      })
    }
  }
}

// 对于发布订阅模式，可能是先发布后订阅。此类业务场景应用比如 QQ 的离线模式，就是先将信息存储起来（先发布），等到订阅者订阅，就立即将信息发送给订阅者，所以当切换到登录模式时（后订阅）就能马上接受到之前的消息了
```


# 基础版 Promise

```js
const PEDDING = 'pedding';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';

function Promise(fn) {
  this.value = null;
  this.status = PEDDING;
  this.callbacks = [];

  const resolve = (res) => {
    if (this.status === PEDDING) {
      this.value = res;
      this.status = RESOLVED;
      setTimeout(() => {
        this.callbacks.forEach(cb => {
          cb.onResolve(res);
        })
      });
    }
  }

  const reject = (err) => {
    if (this.status === PEDDING) {
      this.value = err;
      this.status = REJECTED;
      setTimeout(() => {
        this.callbacks.forEach(cb => {
          cb.onReject(err);
        }) 
      });
    }
  }
  
  try {
    fn(resolve, reject);
  } catch(err) {
    reject(err);
  }
}

Promise.prototype.then = function(onResolve, onReject) {
  if (typeof onResolve !== 'function') {
    onResolve = () => {
      return this.value;
    }
  }
  if (typeof onReject !== 'function') {
    onReject = () => {
      return this.value;
    }
  }
  return new Promise((resolve, reject) => {
    if (this.status === PEDDING) {
      this.callbacks.push({
        onResolve: val => {
          const res = onResolve(val);
          resolve(res);
        },
        onReject: val => {
          const res = onReject(val);
          reject(res);
        }
      })
    } else if (this.status === RESOLVED) {
      setTimeout(() => {
        const res = onResolve(this.value);
        resolve(res);
      });
    } else if (this.status === REJECTED) {
      setTimeout(() => {
        const err = onReject(this.value);
        reject(err);
      });
    }
  })
}
```

基础版 Promise 的不足:
1. 没有 try...catch，无法捕获错误。
2. 没有对 then 的返回值进行判断，可能会返回一个 promise，并需要对这个返回的 promise 做合规校验并解析它的结果。
3. 没有对重复的代码进行封装。
4. 没有实现静态 resolve、reject 方法，以及 all、race 方法。

# 完善版 Promise

```js
const PEDDING = 'pedding';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';

function Promise(fn) {
  if (typeof fn !== 'function') {
    throw new Error('fn is not a function');
  }
  this.status = PEDDING;
  this.value = null;
  this.callbacks = [];  // resolve 或 reject 后的回调函数

  const resolve = (res) => {
    if (this.status === PEDDING) {
      this.status = RESOLVED;
      this.value = res;
      // 模仿异步执行 then 决断后的回调函数，对于 resolve 或 reject 后的代码会继续同步执行
      setTimeout(() => {
        this.callbacks.forEach(item => {
          item.onResolve(res);
        })
      })
    }
  }
  const reject = (err) => {
    if (this.status === PEDDING) {
      this.status = REJECTED;
      this.value = err;
      setTimeout(() => {
        this.callbacks.forEach(item => {
          item.onReject(err);
        })
      })
    }
  }

  try {
    fn(resolve, reject);
  } catch(error) {
    reject(error);
  }
}

// 决断 then 返回的 promise。对捕获错误、判断决断后回调函数返回的 promise 是否合规、解析该 promise 的值，这三种情况进行封装
Promise.prototype.parse = function(selfPromise, result, resolve, reject) {
  // then 中返回的 promise 不能和 resolve/reject 回调函数中返回的 promise 一样
  if (selfPromise === result) {
    throw new TypeError('chaining cycle detected');
  }
  try {
    // 如果 resolve/reject 回调函数中返回的是 promise，则解析该 promise 的值返回给下一个 then
    if (result instanceof Promise) {
      result.then(resolve, reject);
    } else {
      resolve(result);
    }
  } catch(err) {
    reject(err);
  }
}

Promise.prototype.then = function(onResolve, onReject) {
  // 如果没有传 onResolve 或 onReject 函数的话，则默认返回当前 promise 的值，实现值穿透
  if (typeof onResolve !== 'function') {
    onResolve = () => {
      return this.value;
    }
  }
  if (typeof onReject !== 'function') {
    onReject = () => {
      return this.value;
    }
  }
  const selfPromise =  new Promise((resolve, reject) => {
    // 使用箭头函数绑定 this 为外层的 this 指向
    // 当前 promise 还在 pedding，先放入 callbacks 中等状态变化后再调用
    if (this.status === PEDDING) {
      this.callbacks.push({
        onResolve: val => {
          this.parse(selfPromise, onResolve(val), resolve, reject);
        },
        onReject: err => {
          this.parse(selfPromise, onReject(err), resolve, reject);
        }
      })
    } else if (this.status === RESOLVED) {
      // 模仿 then 的异步操作
      setTimeout(() => {
        this.parse(selfPromise, onResolve(this.value), resolve, reject);
      })
    } else if (this.status === REJECTED) {
      setTimeout(() => {
        this.parse(selfPromise, onReject(this.value), resolve, reject);
      })
    }
  })
  return selfPromise;
}

// 将 value 转化成 promise，默认为 resolve 状态
Promise.resolve = function(value) {
  return new Promise(function(resolve, reject) {
    // 如果 value 本身已经是 promise 了，则解析它的值来决断，否则直接 resolve
    if (value instanceof Promise) {
      value.then(resolve, reject);
    } else {
      resolve(value);
    }
  })
}

// 将 value 转化成 promise，默认为 reject 状态
Promise.reject = function(reason) {
  return new Promise(function(resolve, reject) {
    reject(reason);
  })
}

// 返回一个 promise，所有 promise 都 resolve 后才 resolve，有一个 reject 则该 promise 会被 reject
Promise.all = function(promises) {
  const resolvePromises = [];
  return new Promise(function(resolve, reject) {
    promises.forEach(item => {
      item.then(function(result) {
        resolvePromises.push(result);
        // 等到所有 promise 都 resolve 后才能 resolve
        if (resolvePromises.length === promises.length) {
          resolve(resolvePromises);
        }
      }, function(reason) {
        reject(reason);
      })
    })
  })
}

// 返回一个 promise，其状态跟第一个决断的 promise 相同
Promise.race = function(promises) {
  return new Promise(function(resolve, reject) {
    // 只要一个 promise 决断了就可以了，因为状态一经改变就不会再变，所以之后即使还有其他 promise 决断了也不会有影响
    promises.forEach(item => {
      item.then(function(result) {
        resolve(result);
      }, function(reason) {
        reject(reason);
      })
    })
  })
}
```

# async

```js
function _async(gen) {
  // 返回一个函数，使得 gen 可以接受参数
  return function(...arg) {
    // async/await 的返回值是一个 Promise
    return new Promise((resolve, reject) => {
      const g = gen(...arg);  
      function _next(val) {
        let res = null;
        try {
          res = g.next(val);
        } catch(err) {
          return reject(err);
        }
        // 如果遍历器已经遍历结束则直接 resolve 掉 Promise，否则递归调用 _next 以遍历完
        if (res.done) {
          return resolve(res.value);
        }
        // yield 后面可以跟 Promise 和基本数据类型，如果为 Promise 的话还得去获取它的结果，所以统一转化为 Promise 方便去获取 res.value
        Promise.resolve(res.value).then((val) => {
          _next(val);
        }, (err) => {
          // 抛出错误以便被外层的 try-catch 捕获
          g.throw(err)
        })
      }
      _next();
    })
  }
}

/* test */
const getData = (name) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('My name is ' + name)
    }, 1000) // 模拟异步获取数据
  })
}
const run = _async(function * (lastName) {
  const data1 = yield getData('Jerry ' + lastName)
  const data2 = yield getData('Lucy ' + lastName)
  return [data1, data2]
})
run('Green').then((val) => {
  console.log(val)  // [ 'My name is Jerry Green', 'My name is Lucy Green' ]
})
```

# 数组去重

## splice

排序后循环判断当前的数组元素值是否等于上一个数组元素，是的话则用 `splice` 删除。该方法会影响到原数组。并且如果数组中包含了字符串的话，该方法无法做到去重，因为排序后，两个相同的数值之间可能会含有它们的字符串形式，导致判断失效。

```js
function removeDuplicates(arr) {
  arr.sort((a, b) => {
    return a - b;
  })
  for(let i=0; i<arr.length; i++) {
    if(arr[i] === arr[i-1]) {
      arr.splice(i, 1);
      i--;
    }
  }
}

/* test */
const arr = [1, '1', 1, 22, 3, 3, '33', 22, '3'];
```

## filter + indexOf

使用 `indexOf` 和当前的数组下标进行比较，可以得到当前的数组元素是否是重复出现。该方法不需要排序，也不会影响到原数组。

```js
function removeDuplicates(arr) {
  let res = arr.filter((val, index) => {
    return arr.indexOf(val) === index;   // 去重
    // return arr.indexOf(parseInt(val)) === index;       // 可以先使用 parseInt 解析来转化字符串
    // return arr.indexOf(val) === arr.lastIndexOf(val);   // 用于找数组中没有重复的数
  })
  return res;
}
```

## Set

```js
function removeDuplicates(arr) {
  return [...new Set(arr)];
  // return Array.from(new Set(arr));
}
```
