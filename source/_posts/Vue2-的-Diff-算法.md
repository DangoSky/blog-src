---
title: Vue2 的 Diff 算法
date: 2020-05-07 13:56:36
tags:
  - Vue
  - 源码解析
categories: 源码解析
summary: 从虚拟 DOM 出发，边通过图文解释，边 debugger 源码来理解 Vue2 的 Diff 过程。
specialImg: 2.png
---

> 文章中涉及到的 Vue 代码特指版本 2.6.11。

# 虚拟 DOM

## 什么是虚拟 DOM

要理解 Diff 算法，就得先理解好虚拟 DOM。虚拟 DOM 说白了其实就只是一个 JavaScript 对象，它抽象地描述了一个真实的 DOM 结构。我们可以从 Chrome 的 DevTools 中看到，一个 DOM 结构无非是由很多个 HTML 标签根据父子、兄弟等关系组织起来的，而每个 HTML 标签又包含了各种属性，比如 style、class、src 等。所以只要知道了真实 DOM 的结构，我们就可以把它抽象成一个对象的形式来描述，这个对象就是虚拟 DOM。我们可以通过递归的方式将一个 DOM 结构解析成一个虚拟 DOM，也可以通过 `document.createElement` 的方法把一个虚拟 DOM 还原成一个真实 DOM。


Vue 中一个虚拟 DOM 节点（VNode） 包含了很多项数据，具体可以看源码 [vue/src/core/vdom/vnode.js](https://github.com/vuejs/vue/blob/dev/src/core/vdom/vnode.js)。但为了方便，在这里一个 VNode 包含最基本的三个属性就可以了，分别是节点类型 tag、属性 data、子元素 children。

```html
<div id="container" class="p-container">
  <h1>Real DOM</h1>
  <ul style="color: red">
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
</div>
```

举个栗子，上面这个 DOM 结构，我们可以把它抽象成如下的一个虚拟 DOM 结构。不难发现，真实 DOM 和 虚拟 DOM 是可以相互转化的。

```js
const VirtualDOM = {
  tag: 'div',
  data: {
    id: 'container',
    class: 'p-container'
  },
  children: [
    {
      tag: 'h1',
      data: {},
      children: ['Real DOM'],
    },
    {
      tag: 'ul',
      data: {
        style: "color: red"
      },
      children: [
        {
          tag: 'li',
          data: {},
          children: ['Item1']
        },
        {
          tag: 'li',
          data: {},
          children: ['Item2']
        },
        {
          tag: 'li',
          data: {},
          children: ['Item3']
        }
      ]
    }
  ]
}
```

## 为什么要有虚拟 DOM

在以前还没有框架的时候，前端开发几乎都是靠原生 JavaScript 或者是 JQuery 一把梭进行 DOM 操作的。那么为什么 React 和 Vue 都采用了虚拟 DOM 呢？我理解的虚拟 DOM 的优势是：

1. 更好的性能。虚拟 DOM 只会在 Diff 后修改一次真实 DOM，所以不会有大量的重排重绘消耗。并且只更新有变动的部分节点，而非更新整个视图。

2. 跨平台渲染。借助虚拟 DOM 后 FrontEnd 可以进行移动端、小程序等开发。因为虚拟 DOM 本身只是一个 JavaScript 对象，所以可以先由 FE 们写 UI 并抽象成一个虚拟 DOM，再由安卓、IOS、小程序等原生实现根据虚拟 DOM 去渲染页面（React Native、Weex）。

3. 函数式的 UI 编程。将 UI 抽象成对象的形式，相当于可以以编写 JavaScript 的形式来写 UI。

TODO：补充

## 虚拟 DOM 一定会更快吗

我的理解是不一定。如果一个页面的整个 DOM 结构都改变了的话，使用虚拟 DOM 不仅一样要绘制渲染整个视图，而且还要进行 Diff 算法，会比直接操作真实 DOM 更慢，所以虚拟 DOM 带来的性能优势并不是绝对的。

而且不管框架如何封装、掩盖底层操作，终究是需要去调用到 DOM 相关的 api 更新页面的。并且它可能还包含了其他一些 Diff、polyfill、封装逻辑等，这样是不会比我们直接进行 DOM 操作更新 UI 快的。只是，难道我们每修改数据，就要手动操作 DOM 吗？虽然这样会更快，但带来的是很差的代码可读性和可维护性，这样得不偿失。所以正如尤雨溪说的，这是一个性能 VS 可维护性的取舍问题。

推荐阅读：

[网上都说操作真实 DOM 慢，但测试结果却比 React 更快，为什么？](https://www.zhihu.com/question/31809713)

[Vue为什么要用VDOM？](https://segmentfault.com/q/1010000010520929)


# Diff 算法

## 什么是 Diff 算法

首先我们先了解一下使用了虚拟 DOM 后的渲染流程：

1. 将真实 DOM 抽象成虚拟 DOM。

2. 数据改变时，将新的真实 DOM 再抽象成另一个新的虚拟 DOM。

3. 采用深度优先遍历新旧两个虚拟 DOM，用一个唯一的 ID 标志每个节点，并比对两者的差别，将变化的类型、新值记录、节点 ID 记录在一个补丁对象里。节点的变化只有文本变化、属性变化、节点增删移动几种情况。

4. 根据补丁对象去修改需要更新的 DOM 节点。

> template/JSX -> Render Function -> Vnode（做 Diff）-> DOM


可以看到，所谓的 Diff 算法，其实就是上述第三个步骤中比对两个虚拟 DOM 所使用的算法。Diff 算法的优劣直接决定了页面性能的好坏。有的 Diff 算法时间复杂度是 O(n^3)，有的 Diff 算法时间复杂度是 O(n)，n 表示 DOM 节点的最深层级（？？？？？）。


## Vue2 中 Diff 的流程

> 相关源码参考 [vue/src/core/vdom/patch.js](https://github.com/vuejs/vue/blob/dev/src/core/vdom/patch.js)

我们先通过图文来看 Vue 中的 Diff 流程，等理解了之后再来看源码，不然直接看源码的话容易懵 Orz。





## 如何调试 Vue 源码

看源码的时候，我们最好能够边看源码理清它的逻辑，边 debugger 源码验证我们的理解是否正确，所以这里先介绍下如何在 VScode 中调试 Vue 源码。

clone 好 Vue 源码后，先 `npm install` 安装各项依赖，再 `npm run dev` 使用 `rollup.js` 对整个源码进行打包，在 `package.json` 中对应的命令行是：

`"dev": "rollup -w -c scripts/config.js --environment TARGET:web-full-dev"`

这里将环境变量设置为 `web-full-dev`，对应到 `vue/scripts/config.js` 中的配置是：

```js
const builds = {
  ...,
  'web-full-dev': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.js'),
    format: 'umd',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  },
  ...
}
```

可以看到，它打包后的输出路径是 `vue/dist/vue.js`，并且通过控制台提示可以知道，每当我们修改源码时它都会实时地重新打包并更新 `dist/vue.js`。所以我们可以在一个 HTML 文件中引入 `dist/vue.js`，接着在源码中打 `debugger` 和 `console.log`，通过浏览器访问该 HTML 页面就可以看到相应的断点和日志信息，以此我们就能知道 Vue 整个的执行流程啦~。

在调试源码的时候还可以开启 `sourcemap`，具体方法可以参考[vue源码分析系列:用sourcemap调试源码](https://blog.csdn.net/a419419/article/details/91493026)。


## Vue2 Diff 源码分析

接下来我们来看源码。为了方便阅读，以下摘抄的源码只截取其中重点的部分。

当初始化渲染、组件更新的时候，Vue 会调用原型上的 `_update` 方法进行 Diff。可以看到，其中主要是通过 `vm.__patch__` 方法进行 Diff、获取修改补丁、更新 DOM 并返回新的 DOM 等操作。当页面初始化渲染时，此时 `vm._vnode` 为初始值 [null](https://github.com/vuejs/vue/blob/dev/src/core/instance/render.js#L20），

```js
// vue/src/core/instance/lifecycle.js

Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
  const vm: Component = this
  const prevVnode = vm._vnode
  vm._vnode = vnode
  if (!prevVnode) {
    vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
  } else {
    vm.$el = vm.__patch__(prevVnode, vnode)
  }
```


createPatchFunction
Vue.prototype.__patch__ = inBrowser ? patch : noop
Vue.prototype._update

Vue 构造函数：core/instance/index.js

## diff 算法

- diff 算法的优化：
  - 深度遍历。
  - 同级比对，只比较新旧虚拟 DOM 中同个层级的节点。
  - 同级相同节点位置变了可以复用（通过 key 来复用）。



createKeyToOldIdx: 返回一个 map，以 key 为键，数组下标为值


## FAQ

1. 为什么使用深度优先遍历而不是广度优先遍历？

深度遍历使用到的是栈结构，深度遍历的时候，栈中保留的是当前节点的父元素和祖先元素，栈中存储的节点数就是树的深度值，占用的空间比较少。而广度遍历使用的是队列结构，广度遍历按树的层级来遍历，队列中保存的是下一层的节点，数量是树的广度值，占用的空间会更大。

2. diff 算法时间复杂度如何从 O(n^3) 优化到 O(n)？

原来的 diff 算法，是将旧虚拟 DOM 的每个节点和新虚拟 DOM 的每个节点进行比较，这就已经有 O(n^2) 了。但考虑到实际应用中跨层级的 DOM 节点改变很少，所以现在的 diff 算法只是比较同层级的节点，也就下降到了 O(n)。

3. 为什么要使用双端比较法？


diff 算法的优势


为什么要设置 key