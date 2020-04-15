---
title: Vue双向数据绑定原理
date: 2019-08-17 23:52:53
tags:
  - Vue
  - JavaScript
categories:
  - Vue
summary: 动手实现一个简易版的MVVM，理解Vue双向数据绑定的过程。
specialImg: 2.png
---


# Vue双向数据绑定原理

完整的实现代码[戳这里](https://github.com/DangoSky/MVVM)。

## 实现思路

Vue 通过数据劫持来实现数据绑定，使用 [Object.defineProperty()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 来劫持各个数据的 `get` 和 `set` 方法。当使用到某一个数据时会触发该数据的 `get` 方法，所以我们可以在 `get` 方法中将使用到该数据的指令收集起来（这些就是该数据的依赖）；当修改到这个数据的值时会触发该数据的 `set` 方法，我们再在 `set` 方法中去逐个触发这些依赖的更新函数，从而就可以达到 model / view 双向更新的效果。

理解了实现思路后，我们再从这个思路出发，想想实现过程中会遇到什么问题：

- **依赖是什么：** 比如 `<input type="text v-model="inputVal">`，`inputVal` 是 `mvvm` 实例中的一个 `data` 属性，而这个 `input` 输入框的 `v-model` 指令使用到了它。所以这个输入框就成了 `inputVal` 的依赖，当 `inputVal` 的值改变时，这个依赖也要随着做出相应的改变。因为可能会有多个元素节点多条指令使用到同一个数据，所以数据的依赖是会有多个的。

- **如何收集：** 是否是某个数据的依赖取决于这个元素节点有没有使用到某个数据，可能是通过 `v-` 指令，也可能是通过 \{ \{\} \}。所以就需要我们去遍历整个 `Dom` 树，判断每一个元素节点 / 文本节点上是否有使用到相关的指令，以及指令上使用到了什么数据。这也就是 `compiler.js` 的工作——解析各个节点上的指令，并根据不同的指令使用、绑定不同的更新方法。

- **收集在哪里：** 顾名思义，依赖是依赖于数据而言的，所以我们可以为每一个数据建立一个对象，用一个独一无二的 `id` 来表示这个数据，用一个 `subs` 属性（数组）来存放该数据的所有依赖，也就是 `observer.js` 中的 `Dep` 构造器。

## 代码结构

```
MVVM
|—— index.html 入口文件
|—— js
|   |—— mvvm.js      构造 MVVM，实现数据代理
|   |—— observer.js  进行数据劫持，构造 Dep 来收集依赖
|   |—— compiler.js  解析、处理指令
|   |—— watcher.js   订阅相关属性的变化并更新视图
```

## 预期实现

- [x] 可以解析 `v-model` 指令进行双向数据绑定。
- [x] view / model 改变时，model / view 自动进行更新。
- [x] 可以解析一些简单的指令：\{ \{\} \}, `v-text`, `v-class`, `v-html`, `v-on`。

## 实现步骤

### 构建 MVVM

刚开始写一个 `mvvm` 的时候会有些无法从下手的感觉，因为看到的都是 `observer`、`compiler` 和 `watcher`。虽然这些是 `mvvm` 的重要组成部分，也是 Vue 双向数据绑定原理的精髓，但并不是 `mvvm` 的入口。如果一开始就从 `observer` 等写起的话，很可能会陷入不知道怎么写、接下来不知道写什么的局面。所以我们需要先把 `mvvm` 建立好，有了地基后才好有方向指引我们接下来要写什么。

我们可以模仿 Vue 那样，先创建一个 `MVVM` 实例。

```js
index.html

let vm = new MVVM({
  el: '#app',
  data: {},
  method: {}
}
```

有了一个 `mvvm` 实例，我们才可以往里面定义各个 `data` 属性和 `method` 函数，像使用 Vue 那样去构建我们的项目。为了能够正常使用这个 `vm` 实例，我们需要先定义 `MVVM` 构造器。

```js
function MVVM(options) {
  // vue实例的data
  this._data = options.data;
  // vue实例的各个属性，data、method等
  this.options = options;
}
```

到这里一个基本的空架子就有了，接下来我们就需要按照先前的实现思路一步步在上面添砖加瓦。不过为了后续操作 `data` 的方便，我们可以先实现数据代理。先解释一下什么是数据代理吧，比如我们可以通过 a 来操作 c，但由于这种方法比较麻烦，所以我们通过 b 来操作 c，而 b 在这里就是起到了代理的作用。回到 `mvvm`，我们每次要使用到 `data` 中的数据时，都得通过 `vm._data.xxx` 来获取数据，所以我们可以使用 `vm` 来代理 `vm._data`，之后我们只需要通过 `vm.xxx` 就能获取到 `vm._data.xxx` 了。可能当前这个数据代理的好处不是很明显，但在后续的 `observer.js` 等文件中操作 `data` 时就会很方便了。具体的实现也是利用 `Object.defineProperty()` 改写 `get` 和 `set` 方法，当读写 `vm.xxx` 时，操作 `vm._data.xxx` 就可以了。

### 指令解析

我们暂时先不去写数据劫持的代码，因为涉及到了 `Dep` 和 `Watcher`。我们可以先写指令解析和相关的更新操作，把页面渲染出来先。

在解析指令时，因为会频繁操作到 `DOM`，所以为了提高性能，我们先创建文档片段，在这个文档片段上进行 `DOM` 操作后再将其插入回 `DOM` 中。

```js
nodeToFragment(node) {
  let fragment = document.createDocumentFragment();
  let child;
  while(child = node.firstChild) {
    fragment.appendChild(child);
  }
  return fragment;
}
```

此处的 `node` 是指我们挂载 `MVVM` 实例的元素节点，也就是我们初始化时绑定的 `el`。可能会有人不理解这个 while 循环（包括我），`while(child = node.firstChild)` 不是一直将 `el` 的第一个子节点赋值给 child 吗？不会导致死循环吗？这个问题的关键在于，使用 `appendChid` 方法将原 `DOM` 树中的节点添加到 `DocumentFragment` 中时，会同时删除掉原来 `DOM` 树中的节点！所以当把 `el` 的所有子节点都添加到文档片段中时，自然也就结束循环了。

有了 `el` 的文档片段后，我们就可以遍历上面的每一个节点了。此处还要区分节点的类型，HTML 的节点有分为元素节点、文本节点和注释节点等。我们需要通过 `nodeType` 对元素节点和文本节点都进行判断，

1.  对于元素节点，我们要遍历节点上的每一个属性，若存在指令（以 `v-` 开头的属性），则根据不同的指令名进行相应的处理，比如 `v-text` 指令就进行节点文本替换，`v-class` 指令则增加节点的 class，`v-on` 指令就给节点绑定相关的监听函数。

2.  而对于文本节点，我们只需要去匹配它的文本是否具有 \{ \{\} \}，有的话则将文本内容替换成相应的 `data` 属性的数据。

这里有几个需要注意的点：

- 遍历节点时，需要递归遍历每一个节点。

- 对于 \{ \{\} \} 和 `v-text` 指令，需要考虑到有嵌套对象的情况，比如 a.b.c，要一步步从 `data` 解析下去获取相应的属性值。

完成到这一步后，我们已经能够使用 `MVVM` 的指令和数据成功渲染出一个页面了，只不过现在的页面还是静态的，还差最最关键的数据绑定部分。

### 数据绑定

我们先捋清楚几个点：

- 数据和指令是什么关系：在数据绑定中，指令使用到了 `data` 中的数据，所以指令是依赖于数据的。当 `data` 中的数据发生变化时，就需要通知所有依赖于它的指令去进行相关的更新操作。（数据相当于发布者，指令相当于订阅者）

- 数据和指令的对应关系：这里的对应关系是指一对一，一对多，多对一，多对多这些。一个数据可以被多条指令使用到，所以数据对应于指令，是一对多的关系。一条指令可能使用到多个数据，比如它使用到的数据是 a.b.c，这样的话该指令就成了 a、b、c 三者的依赖，所以指令对应数据，也是一对多的关系。

既然两者对应于彼此都是一对多的关系，那我们就可以为两者都建立一个对象（分别为 `Dep` 和 `Watcher`），其中分别用一个 `subs` 数组和一个 `depIds` 来收集它们使用到的依赖（指令和数据）。

####  Dep

现在我们来写数据劫持的代码，我们需要遍历 `data` 中的每一个数据，注意还需要递归遍历，以防有 a.b.c 这种嵌套的对象。每遍历一个数据时，我们就实例化一个 `Dep` 用来添加依赖。那么我们什么时候需要添加依赖呢？之前说过我们在 `get` 方法中添加依赖，当我们解析指令的时候，会去获取这个指令使用到的数据，这时候就触发到了该数据的 `get` 方法，我们便在此时把依赖添加进 `dep` 实例中。为了在 `observer.js` 中能够获取到 `watcher.js` 中正在解析的指令，所以我们给 `Dep` 建立一个静态属性 `Dep.target` 并初始化为 `null`， 表示当前需要添加到 `dep` 实例中的依赖。当 `Dep.target` 不为空时，就把依赖添加到 `dep` 中的 `subs` 数组。而在 `set` 方法中，我们则去更新依赖，遍历 `dep` 的 `subs` 数组，执行依赖的更新函数，从而更新视图，这也就到达了 数据 -> 视图 的效果了。

```js
defineReactive(data, key, curVal) {
  let dep = new Dep();
  // 递归劫持该对象里面的每一个属性（针对属性值是对象的时候）
  new Observer(curVal);

  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: false,
    get() {
      // 初始化数据劫持的时候Dep.target为null
      // 解析指令时，需要为指令对应的每个数据的dep添加watcher，此时Dep.target为该watcher
      if(Dep.target) {
        // 先回到watcher中，把这个dep添加到Dep.target的depIds中，之后再回来
        Dep.target.addDep(dep);
      }
      return curVal;
    },
    set(newVal) {
      if(newVal === curVal) {
        return;
      }
      curVal = newVal;
      // 监听newVal（针对newVal是对象的时候）
      new Observer(newVal);
      // 通知相关的订阅者(watcher)更新
      dep.notify();
    }
  })
}
```

#### Watcher

理清了 `Dep` 的逻辑，我们再来看 `Watcher`。其实 `Watcher` 就是指令，我们使用一个 `watcher` 实例来表示它，去封装它的指令值、使用到的数据以及更新函数，以便在触发数据的 `set` 方法时去更新视图。在实例化一个 `watcher` 的时候，我们需要先把 `Dep.target` 设置为当前的指令，并根据指令值去 `data` 中取一遍数据，以便触发数据的 `get` 方法从而将 `watcher` 添加进数据的 `subs` 中。

在上面的代码中，其实并没有直接在 `get` 方法中给 `dep` 添加依赖，而是先给 `watcher` 实例添加 `dep`， 也就是这句 `Dep.target.addDep(dep)`。我们先弄清楚一点，`Dep` 中有一个 `subs` 数组，用来存储使用到该数据的依赖（数组元素就是 `watcher` 实例），`Watcher` 中有一个 `depIds` 对象，用来存储该指令使用到的数据（对象属性就是 `dep` 实例，由一个 `id` 来标志每一个 `dep`， 使用对象可以避免 `depIds` 里加入重复的 `dep`）。所以当一个数据和一个指令产生联系的时候，我们既需要把 `dep` 添加进 `watcher` 的 `depIds` 中，还需要把 `watcher` 添加进 `dep` 的 `subs` 中。而 `dep` 和 `watcher` 分属在两个js 文件里，为了能够在 `watcher.js` 中获取当前的 `dep`，所以我们需要先在 `observer.js` 的 `get` 方法中触发当前 `watcher` 即 `Dep.target` 的 `addDep` 方法，并将当前的 `dep` 传递过去，再在 `addDep` 方法中调用 `dep` 的 `addSub` 方法。这样就能将 `dep` 和 `watcher` 都收集起来了。

## 总结

`MVVM` 的实现思路就如上面所述了，现在我们再总结一下整个流程。

我们先创建一个 `MVVM` 实例，并由 `Observer` 实现数据劫持，`Compiler` 实现指令解析。劫持对象时为每个数据创建 `Dep` 实例作为发布者，解析指令时则为每个指令创建 `Watcher` 实例，并订阅相应的 `Dep`（在数据的 `get` 方法中完成）。当数据变化时，`Dep` 就通知它的所有订阅者执行它绑定的更新函数来更新视图（在数据的 `set` 方法中完成）。

![mvvm实现流程图](https://raw.githubusercontent.com/DMQ/mvvm/master/img/2.png)

## 存在的问题（toDo）

- \{ \{\} \} 当作数据绑定处理并有其他文本信息出现时，解析之后其他的文本信息会丢失。
	
    例如： <p\>hello \{ \{inputVal\} \}</p\>。

	解决方案：使用正则匹配大括号，只对 \{ \{\} \} 之间的内容进行更新。但需要考虑到有多个大括号的情况。

-  在纯文本里面 \{ \{\} \} 也会被解析成是数据绑定，从而丢失了原来的文本信息。

	例如： <p\>这只是一个单纯的文本\{ \{不是用解析双括号\} \}</p\>。

      解决方案：解析到 \{ \{\} \} 时，判断 \{ \{\} \} 里面的内容是否为 `data` 中的属性，是的话则处理为数据绑定；没有的话则不进行解析，当作纯文本内容处理。

-  在同一个标签里无法解析多个 \{ \{\} \}。

	例如：<p\>\{ \{a\} \} \{ \{b\} \}</p\>。

	解决方案：使用正则匹配 \{ \{\} \} 之间的内容，改用数组的形式传递给处理指令的函数，批量更新。

## 参考资料

- [尚硅谷_Vue核心技术](https://www.bilibili.com/video/av24099073/?p=49)

- [mvvm](https://github.com/DMQ/mvvm)

