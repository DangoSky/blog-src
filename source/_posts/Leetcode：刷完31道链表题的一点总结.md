---
title: Leetcode：刷完31道链表题的一点总结
date: 2019-05-10 23:32:26
tags: 
    - JavaScript
    - 数据结构
    - 算法
categories: 数据结构
summary: 刷完 Leetcode 的链表专题后，总结一些常用的解题思路。
cover: true
img: https://github.com/DangoSky/practices-for-web/blob/master/images/9.jpg?raw=true
---
# 前言

&emsp;&emsp;今天终于刷完了 Leetcode 上的[链表专题](https://leetcode-cn.com/tag/linked-list/)，虽然只有 31 道题（总共是 35 道，但有 4 道题加了锁）而已，但也陆陆续续做了两三个星期，严重跟不上原先计划啊。本来打算数据结构课程老师讲完一个专题，我就用 JS 在 Leetcode 做一个专题的。然而老师现在都讲到图了，而我连二叉树都还没刷 Orz（附上一张 AC 图，看着还是挺有成就感的嘛）。

![](3.png)

&emsp;&emsp;先写一篇博客总结一下这阵子刷链表题的收获吧，有输入也要有输出。这里就不花篇幅介绍链表的一些基本概念了，不清楚的看官就自行[谷歌一下](https://zh.wikipedia.org/wiki/%E9%93%BE%E8%A1%A8)吧，本文主要介绍一些常见的链表题和解题思路。文中提到的 Leetcode 题目都有给出题目链接以及相关解题代码，使用其他方法的解题代码，或者更多 Leetcode 题解可以访问我的[GitHub 仓库](https://github.com/DangoSky/algorithm/tree/master/LeetCode)。

# 正文

## 缓存

&emsp;&emsp;不得不说**使用数组 / map 来缓存链表中结点的信息**是解决链表题的一大杀器，覆盖问题的范围包括但不限于：在链表中插入 / 删除结点、反向输出链表、链表排序、翻转链表、合并链表等，Leetcode 上 31 道链表绝大部分都可以使用这种方法解题。具体实现思路是先使用一个数组或者 map 来存储链表中的结点信息，比如结点的数据值等，之后根据题目要求对数组进行相关操作后，再重新把数组元素做为每一个结点连接成链表返回即可。虽然**使用缓存来解链表题很 dirty，有违链表题的本意**，而且**空间复杂度也达到了 O(n)**（即使我们常常用空间来换时间，不过还是能避免就避免吧），但这种方法的确很简单易懂，看完题目后几乎就可以马上动手不加思考地敲代码一次 AC 了，不像常规操作那样需要去考虑到很多边界情况和结点指向问题。

&emsp;&emsp;当然，并不是很提倡这种解法，这样就失去了做链表题的意义。如果只是一心想要解题 AC 的话那无妨。否则的话我建议可以使用数组缓存先 AC 一遍题，再使用常规方法解一次题，我个人就是这么刷链表题的。甚至使用常规方法的话，你还可以分别使用迭代和递归来解题，迭代写起来比较容易，而递归的难点在于把握递归边界和递归式，但只要理解清楚了的话，递归的代码写起来真的很少啊（后面会说到）。

&emsp;&emsp;先找道题 show the code 吧，不然只是单纯的说可能会半知半解。比如[这道反转链表 II](https://leetcode-cn.com/problems/reverse-linked-list-ii/)：反转从位置 m 到 n 的链表。如果使用数组缓存的话，这道题就很容易了。只需要两次遍历链表，第一次把从 m 到 n 的结点值缓存到一个数组中，第二次遍历的时候再替换掉链表上 m 到 n 的结点的值就可以了（是不是很简单很清晰啊，如果使用常规方法的话就复杂得多了）。实现代码如下：

```js
var reverseBetween = function(head, m, n) {
  let arr = [];
  function fn(cur, operator) {
    let index = 1;
    let i = 0;
    while(cur) {
      if(index >= m && index <= n) {
        operator === "get" ?  arr.unshift(cur.val) : cur.val = arr[i++];
      }
      else if(index > n) {
        break;
      }
      index++;
      cur = cur.next;
    }
  }
  // 获取从 m 到 n 的结点数值
  fn(head, "get");
  // 重新赋值
  fn(head, "set");
  return head;
};
```

&emsp;&emsp;其他的题目例如链表排序、结点值交换等也是大致相同的代码，使用缓存解题就是这么简单。至于上面这题的常规解法，可以[戳这里查看](https://privatebin.net/?0f1f9e6d9b3152f1#3XxfN9PQzFFUy0M8ppCxTx9oMKEhVqWVnGcKO5bKUbA=)，我已经在代码中标注好解题思路了。

&emsp;&emsp;使用缓存来解题的时候，我们可以使用数组来存储信息，也可以使用 map，通常情况下两者是可以通用的。但因为**数组和对象的下标只能是字符串，而 map 的键名可以是任意数据类型**，所以 map 有时候能做一些数组无法做到的事。比如当我们要存储的不是结点值，而是整个结点的时候，这时候使用数组就无能为力了。举个例子，[环形链表](https://leetcode-cn.com/problems/linked-list-cycle/)：判断一个链表中是否有环。先看一下环形链表长什么样。

![](1.png)

&emsp;&emsp;还是使用缓存的方法，我们在遍历链表的过程中可以把整个结点当作键名放入到 map 中，并把它标记为 true 代表这个结点已经出现过。同时边判断 map 中以这个结点为键名的值是否为 true，是的话说明这个结点重复出现了两次，即这个链表有环。在这道题中我们是没办法用数组来缓存结点的，因为当我们把整个结点（一个对象）当作下标放入数组时，这个对象会先自动转化成字符串``[object Object]``再作为下标，所以这时候只要链表结点数量大于等于 2 的话，判断结果都会为 true。使用 map 解题的具体实现代码见下。

```js
var hasCycle = function(head) {
  let map = new Map();
  while(head) {
    if(map.get(head) === true) {
      return true;
    }
    else {
      map.set(head, true);   
    }
    head = head.next;
  }
  return false;
}
```

&emsp;&emsp;Leetcode 上还有一道题充分体现了 map 缓存解题的强大，[复制带随机指针的链表](https://leetcode-cn.com/problems/copy-list-with-random-pointer/)：给定一个链表，每个节点包含一个额外增加的随机指针，该指针可以指向链表中的任何节点或空节点，要求返回这个链表的深拷贝。具体的这里就不再多说了。此外，该题还有一种 O(1) 空间复杂度，O(n) 时间复杂度的解法（来自于《剑指offer》第187页）也很值得一学，推荐大家看看，详情可以[看这里](https://github.com/DangoSky/algorithm/blob/master/LeetCode/138.%20%E5%A4%8D%E5%88%B6%E5%B8%A6%E9%9A%8F%E6%9C%BA%E6%8C%87%E9%92%88%E7%9A%84%E9%93%BE%E8%A1%A8.js)。

## 快慢指针
&emsp;&emsp;在上面环形链表一题中，如果不使用 map 缓存的话，常规解法就是使用**快慢指针**了。指针是 C++ 的概念，JavaScript 中没有指针的说法，但在 JS 中使用一个变量也可以同样达到 C++ 中指针的效果。先稍微解释一下我对 C++ 指针的理解吧，具体的知识点看官可以自行[谷歌](https://www.runoob.com/cplusplus/cpp-pointers.html)。在 C++ 中声明一个变量，其实声明的是一个内存地址，可以通过取址符`&`来获取这个变量的地址空间。而我们可以定义一个指针变量来指向这个地址空间，比如`int *address = &a`。这时候 address 就是指 a 的地址，而 *addess 则代表对这个地址空间进行取值，也就是 a 的值了。（既然说到地址空间了就顺带说一下上面环形链表这道题的另一种很 6 的解法吧。利用的是堆的地址是从低到高的，而且链表的内存是顺序申请的，所以如果有环的话当要回到环的入口的时候，下一个结点的地址就会小于当前结点的地址! 以此判断就可以得到链表中是否有环的存在了。不过 JS 中没有提供获取变量地址的操作方法，所以这种解法和 JS 是无缘的了。C++ 解法可以[戳这里查看](https://privatebin.net/?c9f378ff792a427b#LEQWuCALfm00z8h3w6LKPA3PaLvTo1U2vcm+v2airoE=)。）

&emsp;&emsp;有没有觉得这很像 JS 的按引用传递？之所以说在 JS 中使用一个变量就可以达到同样的效果，这和 JS 是**弱语言类型**和**变量的堆栈存储方式**有关。因为 JS 是弱语言类型，所以定义一个变量它既可以是基本数据类型，也可以是对象数据类型。而对象数据类型是将整个对象存放在堆中的，存储在栈中的只是它的访问地址。所以对象数据类型之间的赋值其实是地址的赋值，**指向堆中同一个内存空间的变量会牵一发而动全身**，只要其中一个改变了内存空间中存储的值，都会影响到其他变量对应的值。但如果是**改变变量的访问地址的话，则对其他变量不会有任何影响**。理解这部分内容非常重要，因为常规的链表操作都是基于这些出发的。举最基本的链表循环来说明。

```js
let cur = head;
while(cur) {
  cur = cur.next;
}
```

&emsp;&emsp;上面的几行代码是最基本的链表循环过程，其中 `head` 表示一个链表的头节点，是一个链表的入口。`cur` 表示当前循环到的结点，当链表达到了终点即 `cur` 为 `null` 的时候就结束了循环。需要注意的是，每一个结点都是一个对象，简单的链表结点都有两个属性`val`和`next`，`val`代表了当前结点的数据值，`next`则代表了下一个结点。而由每个结点的`next`不断连接起其他的结点，就构成了一个链表。因为对象是按引用传递，所以可以在循环到任意一个结点的时候改变这个结点`cur`的信息，比如改变它的数据值或是指向的下一个结点，并且这会随着修改到原链表上去。而改变当前的结点`cur`，因为是直接修改其访问地址，所以并不会影响到原链表。链表的常规操作正是在这**一变一不变**的基础上完成的，因此操作链表的时候往往需要一个辅助链表，也就是`cur`，来修改原链表的各个结点信息却不改变整个链表的指向。每次循环结束后`head`还是指向原来的链表，而`cur`则指向了链表的末尾`null`。在这个过程中，除了最开始把`head`赋值给`cur`和最后的`return`外，几乎都不需要再操作到`head`了。

&emsp;&emsp;介绍完常规操作链表的一些基本知识点后，现在回到快慢指针。快慢指针其实是利用两个变量同时循环链表，区别在于一个的速度快一个的速度慢。比如慢指针`slow`的速度是 1，每趟循环都指向当前结点的下一个结点，即`slow = slow.next`。而快指针`fast`的速度可以是 2，每趟循环都指向当前结点的下下个结点，即`fast = fast.next.next`（使用的时候需要特别注意`fast.next`是否为`null`，否则很可能会报错）。现在想象一下，两个速度不相同的人在同一个环形操场跑步，那么这两个人最后是不是一定会相遇。同样的道理，一个环形链表，快慢指针同时在里面移动，那么它们最后也一定会在链表的环中相遇。所以**只要在循环链表的过程中，快慢指针相等了就代表该链表中有环**。实现代码如下。

```js
var hasCycle = function(head) {
  if(head === null) {
    return false;
  }
  let slow = head;
  let fast = head;
  while(fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if(slow === fast) {
      return true;
    }
  }
  return false;
};
```

&emsp;&emsp;除了判断链表中有没有环外，快慢指针还可以找出链表中环形的入口。假设 A 是链表的入口结点，B 是环形的入口结点，C 是快慢指针的相遇点，x 是 AB 的长度（也就是 AB 之间的结点数量），y 是 BC 的长度，z 是 CB 的长度。因为快指针移动的距离（x + y）是慢指针移动的距离（x + y + z + y）的两倍（当快慢指针相遇时，快指针比慢指针多移动了一圈），所以 z = x。因此，只要在快慢指针相遇的时候，再让一个新指针从头节点 A 开始移动，与此同时慢指针也继续从 C 点移动。但新指针和慢指针相遇的时候，也就是在链表环形的入口处 B。该题的三种实现代码可以[戳这里查看](https://github.com/DangoSky/algorithm/blob/master/LeetCode/142.%20%E7%8E%AF%E5%BD%A2%E9%93%BE%E8%A1%A8%20II.js)。


![](2.png)

&emsp;&emsp;如果我们把快指针的速度设置为 2，即每趟循环都指向当前结点的下下个结点。那么快慢指针在移动的过程中，**快指针移动的距离都会是慢指针移动距离的两倍**，利用这个性质我们可以很方便地得到链表的中间结点。只要让快慢指针同时从头节点开始移动，当快指针走到链表的最后一个结点（链表长度是奇数）或是倒数第二个结点（链表长度是偶数）的时候，慢指针就走到了链表中点。这里给出[题目链接](https://leetcode-cn.com/problems/middle-of-the-linked-list/)和实现代码。

```js
var middleNode = function(head) {
  let slow = head;
  let fast = head;
  while(fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
};
```

## 先后指针
&emsp;&emsp;先后指针和快慢指针很类似，不同的是**先后指针的移动速度是一样的，而且两者并没有同时开始移动**，是一前一后从头节点出发的。先后指针主要用来寻找链表中倒数第 k 个结点。通常我们寻找链表中倒数第 k 个结点可以有两种办法。 一是先循环一遍链表计算它的长度n，再正向循环一遍找到该结点的位置（正向是第 n - k + 1 个结点）。二是使用双向链表，先移动到链表结尾处再开始回溯 k 步，但大多时候给的链表都是单向链表，这就又需要我们先循环一遍链表给每一个结点增加一个前驱了。

&emsp;&emsp;使用先后指针的话只需要一趟循环链表，实现思路是先**让快指针走 k-1 步，再让慢指针从头节点开始走，这样当快指针走到最后一个结点的时候，慢指针就走到了倒数第 k 个结点**。解释一下为什么，假设链表长度是 n，那么倒数第 k 个结点也就是正数的第 n - k + 1 个结点（不理解的话可以画一个链表看看就清楚了）。所以只要从头节点出发，走 n - k 步就可以达到第 n - k + 1 个结点了，因此现在的问题就变成了如何控制指针只走 n - k 步。在长度为 n 的链表中，从头节点走到最后一个结点总共需要走 n - 1 步，所以只要让快指针先走 (n - 1) - (n - k)= k - 1 步后再让慢指针从头节点出发，这样快指针走到最后一个结点的时候慢指针也就走到了倒数第  n - k + 1 个结点。具体实现代码如下。

```js
var removeNthFromEnd = function(head, k) {
  let fast = head;
  for(let i=1; i<=k-1; i++) {
    fast = fast.next;
  }
  let slow = head;
  while(fast.next) {
    fast = fast.next;
    slow = slow.next;
  }
  return slow;
}
```

&emsp;&emsp;Leetcode 上[有一道题](https://leetcode-cn.com/problems/remove-nth-node-from-end-of-list/)是对寻找倒数第 k 个结点的简单变形，题目要求是要删除倒数第 k 个结点。代码和上面的代码大致相同，只是要再用到一个变量`pre`来存储倒数第 k 个结点的前一个结点，这样才可以把倒数第 k 个结点的下一个结点连接到`pre`后面实现删除结点的目的。实现代码可以[戳这里查看](https://privatebin.net/?405efe1211cfccb8#t2+dXZMmrxWz6fHU7T1kb+iNoiPeNr6k/mruRq+Ur8g=)。


## 双向链表
&emsp;&emsp;双向链表是在普通的链表上给每一个结点增加`pre`属性来指向它的上一个结点，这样就可以通过某一个结点直接找到它的前驱而不需要专门去缓存了。下面的代码是把一个普通的链表转化为双向链表。

```js
let pre = null;
let cur = head;
while(cur) {
  cur.pre = pre;
  pre = cur;
  cur = cur.next;
}
```

&emsp;&emsp;双向链表的应用场景还是挺多，比如上例寻找倒数第 n 个结点，或者是判断回文链表。可以使用两个指针，从链表的首尾一起向链表中间移动，一边判断两个指针的数据值是否相同。实现代码可以[戳这里查看](https://privatebin.net/?75e0059fc072dddd#/pzJY3fT6HehtEsPHF4iokBwDWRBKZ0yJy6vJjjVFgM=)。

&emsp;&emsp;除了借助双向链表外，还可以先翻转链表得到一个新的链表，再从头节点开始循环比较两个链表的数据值（当然使用数组缓存也是一种方法）。可能各位看官看到上面这句话觉得没什么毛病，通过翻转来判断链表 / 字符串 / 数组是否是回文的也是一个很常见的解法，但不知道看官有没有考虑到一个问题，**翻转链表是会修改到原链表的**，对后续循环链表比较两个链表结点的数据值是有影响的！一发现了这个问题，是不是马上联想到了 JS 的深拷贝。没错，一开始为了解决这个问题我是直接采用`JSON.parse` + `JSON.stringify`来粗暴实现深拷贝的（反正链表中没有 `Date，Symbol 、RegExp、Error、function 以及 null 和 undefined` 这些特殊的数据），但不知道为什么`JSON.parse(JSON.stringify(head))`**报了栈溢出的错误**，现在还没想通原因 Orz。所以只能使用递归去深拷贝一次链表了，下面给出翻转链表和深拷贝链表的代码。

```js
// 翻转链表
function reverse(head) {
  let pre = null;
  let cur = head;
  while(cur) {
    let temp = cur.next;
    cur.next = pre;
    pre = cur;
    cur = temp;
  }
  return pre;
}

// 翻转链表的递归写法
var reverseList = function(head) {
  if(head === null || head.next === null) {
    return head;
  }
  let cur = reverseList(head.next);
  head.next.next = head
  head.next = null;
  return cur;
}

```

```js
// 深拷贝链表
function deepClone(head) {
  if(head === null)  return null;
  let ans = new ListNode(head.val);
  ans.next = deepClone(head.next);
  return ans;
}
```

&emsp;&emsp;回文链表的 3 种解题方法（数组缓存、双向链表、翻转链表）可以[戳这里查看](https://github.com/DangoSky/algorithm/blob/master/LeetCode/234.%20%E5%9B%9E%E6%96%87%E9%93%BE%E8%A1%A8.js)，题目链接在[这里](https://leetcode-cn.com/problems/palindrome-linked-list/)。

&emsp;&emsp;除此之外还有一道[重排链表](https://leetcode-cn.com/problems/reorder-list/)的题，解题思路和判断回文链表大致相同，各位看官有兴趣的话可以试着 AC 这道题。同样的，这道题我也给出了 [3 种解题方法](https://github.com/DangoSky/algorithm/blob/master/LeetCode/143.%20%E9%87%8D%E6%8E%92%E9%93%BE%E8%A1%A8.js)。


## 递归 
&emsp;&emsp;使用递归解决链表问题不得不说是十分契合的，因为很多链表问题都可以分割成几个相同的子问题以缩小问题规模，再通过调用自身返回局部问题的答案从而来解决大问题的。比如[合并有序链表](https://leetcode-cn.com/problems/merge-two-sorted-lists/)，当两个链表长度都只有 1 的时候，就是只有判断头节点的数据值大小并合并两者而已。当链表一长问题规模一大，也只需调用自身来判断两者的下一个结点和已有序的链表，通过不断递归解决小问题最后便能得到大问题的解。

&emsp;&emsp;更多问题例如[删除链表中重复元素](https://leetcode-cn.com/problems/remove-duplicates-from-sorted-list/)、[删除链表中的特定值](https://leetcode-cn.com/problems/remove-linked-list-elements/)、[两两交换链表结点](https://leetcode-cn.com/problems/swap-nodes-in-pairs/)等也是可以通过递归来解决的，看官有兴趣可以自行尝试 AC，相关的解决代码可以[在这里找到](https://github.com/DangoSky/algorithm/tree/master/LeetCode)。使用递归解决问题的优势在于递归的代码十分简洁，有时候使用迭代可能需要十几二十行的代码，使用递归则只需要短短几行而已，有没有觉得很短小精悍啊啊啊。不过递归也还是得小心使用，否则一旦递归的层次太多很容易导致栈溢出（有没有联想到什么，其实就是函数执行上下文太多使执行栈炸了）。

## 一个小技巧
&emsp;&emsp;有时候我们在循环链表进行一些判断的时候，需要对头结点进行特殊判断，比如要新创建一个链表 newList 并根据一些条件在上面增加结点。我们通常是直接使用`newList.next`来修改结点指向从而增加结点的。但第一次添加结点的时候，newList 是为空的，不能直接使用`newList.next`，需要我们对 newList 进行判断看看它是否为空，为空的话就直接对 newList 赋值，不为空再修改`newList.next`。

&emsp;&emsp;为了避免对头节点进行特殊处理，我们可以在 newList 的初始化的时候先给它一个头结点，比如`let newList = new ListNode(0)`。这样在操作过程中只使用`newList.next`就可以了而不需要另行判断，而最后结果只要返回`newList.next`（当然，在循环的时候需要使用一个辅助链表来循环 newList ，否则会改变到 newList 的指向）。可能你会觉得不就是多了一个`else if`判断吗，对代码也没多大影响，但如果在这个`if`中包含了很多其他相关操作呢，这样的话`if`和`else if`里就会有很多代码是重复的，不仅代码量变多了还很冗余耶。

# 后话
&emsp;&emsp;关于链表本文就说这么多啦，如果大家发现有什么错误、或者有什么疑问和补充的，欢迎在下方留言。更多 LeetCode 题目的 JavaScript 解法可以参考[我的GitHub](https://github.com/DangoSky/algorithm/tree/master/LeetCode)，目前已经 AC 了一百多道题，并持续更新中。