---
title: React Hook 中的闭包问题
date: 2019-11-16 18:21:43
tags:
  - JavaScript
  - React
categories: React
summary: 从几个自带闭包的React Hook入手，回顾闭包的特性，并介绍几种避免获取旧的state的方法。
specialImg: 10.png
---

# React Hook 中的闭包问题

本文不对 React Hook 做过多的介绍，只是记录笔者在学习过程中遇到的问题。关于 React Hook 的介绍请参考[官方文档](https://react.docschina.org/docs/hooks-intro.html)，或者也可以看我的[个人笔记](http://notes.dangosky.com/React/Hook.html)。


## 闭包

直接开门见山，通过代码来看问题。

```js
function Example() {
  const [count, setCount] = useState(0);

  function handleAlertClick() {
    setTimeout(() => {
      console.log('You clicked on: ' + count);
    }, 3000);
  }

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>count + 1</button>
      <button onClick={handleAlertClick}>print count</button>
    </div>
  );
}
```

上面这段代码看着并没有问题，两个 button 都可以正常工作。但如果我们先点击 print count 按钮，再点击 count + 1 按钮，就会发现打印出来的是点击 print count 按钮时的 count 值，而不是当前的 count 值。我们回顾下什么是闭包，说简单了就是在一个函数里包含了另一个函数，并且内层函数使用了外层函数的变量。说官方点就是**闭包是由函数以及创建该函数的词法环境组合而成**。这里的坑在于闭包的这个词法环境的有效期是多少，它包含的值会不会随之后变量的改变而改变？

答案是不会，这个词法环境包含了该闭包**创建时**所能访问的所有局部变量。划重点是闭包创建时的变量值，**闭包创建之后即使这些变量值改变了也不会影响到闭包内保存的这个变量**。所以在我们点击 print count 按钮时，就创建了一个闭包，它保存了这时候这一刻的 count 值 0，之后即使我们点击 count + 1 按钮使其增加到 1，之后打印出的也是刚才闭包内保存的 count 值 0，而不是 1（这也是我们可以使用闭包来保存循环变量的原因，还记得那道题么）。

下面是测试例子，

```js
function createIncrement(i) {
  let value = 0;
  return function increment() {
    value += i;
    console.log(value);
    const message = `Current value is ${value}`;
    return function logValue() {
      console.log(message);
    };
  }
}

const inc = createIncrement(1);
const log = inc(); // 1
inc();             // 2
inc();             // 3
log();             // "Current value is 1"
```


## Hook 中的闭包

看过了基本的闭包，我们再来看 Hook 中对闭包的应用。

```js
function Demo() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let timer = setInterval(function() {
      console.log(`Count is: ${count}`);
      setCount(count + 1)
    }, 1000);
    console.log(timer);
    return () => {
      clearInterval(timer);
    }
  }, []);

  return (
    <p>{count}</p>
  );
}
```

> 官方原话是：useEffect、useMemo、useCallback都是自带闭包的。每一次组件的渲染，它们都会捕获当前组件函数上下文中的状态(state, props)，所以每一次这三种hooks的执行，反映的也都是当前的状态，你无法使用它们来捕获上一次的状态。

什么意思呢？就是上述三个 Hook 创建出来的闭包所包含的变量是创建该闭包时的变量值，不受后续该变量变化的影响。又因为我们给 useEffect 指定的依赖项是空的，所以 useEffect 只会在页面第一次加载时执行而已，即定时器的闭包只创建了一次。所以这就造成了每次都是打印  Count is: 0，并且因为闭包中的 count 保持了初始值 0，所以 setCount 执行的一直是 `setCount(0+1)`，于是页面显示的 count 值就一直是 1 了。

上述代码可以[在这里测试](https://codesandbox.io/embed/interesting-robinson-xmgy0?fontsize=14&hidenavigation=1&theme=dark)。

## 对 Hook 过时闭包的解决办法

### 添加依赖项

Hook 中的闭包问题主要是因为我们没有在 Hook 中添加依赖项，导致闭包没有更新始终保持着初始值。所以我们只要给 useEffect 指定 count 这个依赖，则每当依赖项改变时都会重新生成一个新的闭包，而新闭包保存的 count 值也就随着自然更新了。

当然直接去掉依赖项（不传 useEffect 的第二个参数）也是可以解决闭包过时问题的，然而我们只要 useEffect 在依赖值变化时更新就够了，其他数据和这个 useEffect 没有半毛钱关系，改变了也完全不需要执行 useEffect。但如果不传依赖项的话只要组件的数据一有变化 useEffect 就会重新执行并返回新的闭包，造成了没必要的消耗。（注意**依赖项为空和不传依赖项是两个概念，前者是传了依赖项但它是一个空数组，后者是直接不传这个参数。前者只有依赖项改变时才会执行函数，后者只要组件数据改变了就执行**。）


### 以函数的形式更新state

添加依赖项固然可以解决闭包过时问题，但每次生成新的闭包函数时都会执行 useEffect 的代码，包括重新生成一个定时器和打印定时器的 ID。然而在这里我们并不需要反复生成定时器，如果我们忘记在 useEffect 里返回一个函数来清除定时器的话，还会造成多个定时器累加从而让页面直接崩溃掉。

解决办法是以函数的形式更新state，同 react 的 setState 一样，useState Hook 也可以通过函数的形式来修改 state，并且使用当前的 state 值作为函数参数。这样打印出来的 count 值虽然依旧是闭包初始化时保存的 0，但 count 不再是在它的初始值上更新，而是在当前 count 值的基础上更新的，所以页面显示的 count 能保持一个新的值。

```js
// 以函数的形式更新state
setCount((curCount) => curCount + 1);
```


### 使用useRef

通过 useRef 生成的对象来绑定 state，这样更新 state 的时候就可以不用依赖于该 state，而是直接在该绑定对象上的基础上更新即可。

```js
function Flow3() {
  const [count, setCount] = useState(0);
  const countRef = useRef();
  countRef.current = count; // 将useRef生成的对象和count绑定在一起

  useEffect(() => {
    let timer = setInterval(() => {
      setCount(countRef.current + 1)
    }, 1000);
    return () => {
      clearInterval(timer);
    }
  }, []);

  return (
    <p>{count}</p>
  );
}
```

### 使用useReducer

useReducer 可以达到和使用函数形式更新的 useState 一样的效果，也是在更新时在当前的 state 基础上进行操作。

```js
function reducer(count, action) {
  switch (action.type) {
    case 'add':
      return count + action.gap;
    default:
      return count;
  } 
}

function Demo() {
  const [count, dispatch] = useReducer(reducer, 0);

  useEffect(() => {
    let timer = setInterval(function() {
      dispatch({type: 'add', gap: 10});
    }, 1000);
    return () => {
      clearInterval(timer);
    }
  }, []);

  return (
    <p>{count}</p>
  );
}
```


## 收官

本文只是大致介绍了几种避免获取旧的 state 的方法，对于其中原理并没有太多解释，等之后有时间再去研究研究 React Hook 的原理和源码吧。
