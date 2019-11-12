---
title: 盒模型和负margin
date: 2019-03-12 21:20:33
tags: 
	 - CSS
	 - 前端基础
categories: CSS
summary: 标准盒模型和IE盒模型之间的差异，负margin对文档流中定位元素宽度和定位的影响及其应用。
img: https://github.com/DangoSky/practices-for-web/blob/master/images/12.jpg?raw=true
---
# 盒模型
&emsp;&emsp;每一个HTML标签元素都是由四个部分组成的，分别是内容(content)、内边距(padding)、边框(border)、外边距(margin)。其中盒子的大小只由 content + padding + border 决定，margin影响的不是盒子大小，而是盒子占据的位置。这一部分比较简单，所以这里就不多做叙述了。
![](box.png)

## 标准盒模型和IE盒模型
&emsp;&emsp;关于盒模型需要着重注意的是标准盒模型和IE盒模型的差异。W3C标准盒模型下，content 的宽高只由其自身的宽高决定，而在IE盒模型下，content 的宽高还包括了 border 和 padding（也就是怪异模式）。我们可以在页面开头声明 DOCTYPE 的类型，来指定浏览器统一使用 W3C 标准盒模型，否则在 IE 浏览器中会将盒模型解释为 IE 盒模型。声明 DOCTYPE 时推荐使用``<!DOCTYPE html>``，会指示浏览器使用 HTML5 规范（要使用 HTML4 则会有三种 <!DOCTYPE> 声明方式）。

## box-sizing
&emsp;&emsp;在 IE8+ 及 chrome 等浏览器中还可以通过 CSS 的``box-sizing``属性来定义如何计算一个元素的宽高。对于默认值```box-sizing: content-box```，页面计算时会使用 W3C 标准盒模型，给元素的宽高赋值相当于对 content 赋值，而整个盒子的大小还得再算上 border 和 padding。
```css
.box {
  width: 100px;
  height: 100px;
  padding: 10px;
}
```
![](box1.png)
&emsp;&emsp;若设置```box-sizing: border-box```，则会使用IE盒模型，给元素的宽高赋值相当于是设置content+padding+border的总宽高。我们使用padding时很多时候都需要再设置```box-sizing: border-box```，以免元素超出容器范围。比如当我们设置一个列表或输入框的时候，通常左边或右边会有一个icon图标，我们可以采用设置背景图片的方式来显示图标，再设置padding-left或padding-right来间隔开图标和文字。这时候我们就需要再设置```box-sizing: border-box```了，否则设置的padding会加宽盒子的宽高使得列表或输入框超出容器造成页面在水平方向可以拖动。
```css
.box {
  width: 100px;
  height: 100px;
  padding: 10px;
  box-sizing: border-box;
}
```
![](box2.png)


# margin
## margin-left、margin-right和width
&emsp;&emsp;margin-left、margin-right和width设置为auto时的影响。
### 三者都设置为auto
&emsp;&emsp;margin-left和margin-right会失效，都被设置为0，width尽可能大(即父元素宽度减去左右border和左右padding)。
```css
<div class="parent"> 
  <div class="box">块级元素</div> 
</div>

.parent{
  width: 300px;
  background: #eeb3b3;
}
.box {
  background: #ffd800;
  margin-left: auto;
  margin-right: auto;
  padding: 10px; 
  width: auto;
}
```
![](box3.png)

### 其中一个设置为auto
&emsp;&emsp;设置为auto的元素会自动调整自身宽度，使得三者的总宽度等于父元素的宽度。若是margin-left和right设为定值且没有指定width，也会默认width为auto。
```css
.box {
  background: #ffd800;
  margin-left: 50px;
  margin-right: 50px;
  padding: 10px; 
  width: auto;
}
```
![](box4.png)

### 其中两个设置为auto
+ margin-lef和margin-right为auto：此时margin-left和margin-right相等，平分剩下的空间，达到水平居中的效果。

```css
.box {
  background: #ffd800;
  margin-left: auto;
  margin-right: auto;
  padding: 10px; 
  width: 100px;
}
```
![](box5.png)

+ width和其中一个margin为auto： 被设置为auto的那个margin变为0，width尽可能大。

```css
.box {
  background: #ffd800;
  margin-left: auto;
  margin-right: 50px;
  padding: 10px; 
  width: auto;
}
```
![](box6.png)

## 负margin
&emsp;&emsp;负margin同样可以使文档流中元素的位置发生偏移，和相对定位偏移的区别在于，相对定位的元素偏移后，仍然霸占着原先的位置，使文档流中其他元素无法占据该空间。而通过负margin偏移的元素，**虽然元素大小不变，但会使文档流向左流或向上流(文档流只能往这两个方向移动)，造成了后面的元素可以占据这部分空间，会使得两个元素重叠**(下文会详细说明)。

&emsp;&emsp;（我还有另一种理解，通过负margin偏移的元素，虽然元素大小不变，但会**减小该元素在文档流中占据的空间**，自然也会使文档流向左流或向上流，导致后面的元素移动。我觉得以这种观点去理解的话，这整篇文章所涉及的内容也都可以说得通，甚至可以更好的解释清楚。但我谷歌了一下，发现并没有关于 元素在文档流中占据的空间可不可以被减小 的相关文章，所以这里只当作一种个人的理解方式仅供参考）

### 对static定位而且没有浮动的元素使用负margin
![](negative-margin.jpg)

1. margin-top或margin-left为负值时，元素被拉向指定的方向(见上图)，即和设置margin-top和margin-left为正值时移动的方向相反。

2. margin-bottom或margin-right为负值时，元素本身不会偏移，但因为文档流向左/上移动了，所以后续的元素也会随之向左/上移动，和原来的元素重叠在一起。

![](no-margin-bottom.png)
![](use-margin-bottom.png)    

3. 如果元素没有设置width或width为auto时，设置负的margin-left或margin-right，会增大元素的宽度，类似于padding。若是负的margin-left的话，则还会向左移动。

```css
<div class="container">
  <div class="box">我没有设置宽高</div>
</div>

.container {
  width: 150px;
  height: 150px;
  background-color: #eee;
}
.box {
  background-color: red;
  margin-right: -50px;
}
```

![](margin-right.png)    

4. 这里单独再说一下负margin-bottom，负的margin-bottom不仅有上述第二点的影响外，更重要而且实用的一点是会**减少元素框的高度**。我在其他几个博客里看到有人把这说成是**减少自身的供css读取的高度**，但他们都没有解释什么叫做 “减少自身的供css读取的高度”，我谷歌了一下也没有发现什么解释，所以这里按照我个人的理解，使用 “减少元素框的高度” 这概念来解释。我们先来看几句代码和效果图：

```css
<div class="box">
  <div class="left">Coding Coding Coding Coding Coding</div>
</div>

.left {
  width: 60px;
  height: 100px;
  background-color: yellow;
}
```

![](1.png)

&emsp;&emsp;现在我们再给该元素设置``margin-bottom: -50px;``再来看看效果
![](2.png)
&emsp;&emsp;从图中我们可以发现，虽然控制台显示该元素的高度还是100px并且也全部都渲染出来了，但图中的橙色部分(貌似代表的是margin，但为了方便理解所以我把它当成**元素框**, 或者说是元素在文档流中占据的空间)缩小了一半。而CSS中的``overflow``属性判断元素是否溢出，不是根据我们给它设置好的height，而是根据元素框(图中的橙色框框)来判断的。只要元素内容超出这个元素框，给父容器设置了``overflow: hidden``后超出部分就会被隐藏，即使元素的高度是100px足够容纳元素内容。有图有真相：
![](3.png)

&emsp;&emsp;借助负margin-bottom这个特性我们就可以实现很多功能了，包括常见的两栏等高布局，栗子见下文。

### 对浮动元素使用负margin
&emsp;&emsp;先看没有设置负margin时的原始样式和表现
```css
<div class="fa"></div>
<div class="fb"></div>
<div class="fc"></div>

.fa {
  width: 100px;
  height: 100px;
  float: left;
  background-color: red;
}
.fb {
  width: 100px;
  height: 100px;
  float: left;
  background-color: blue;
}
.fc {
  width: 100px;
  height: 100px;
  float: left;
  background-color: pink;
}
```
![](float.png)

&emsp;&emsp;现在给每一个元素都设置```margin-right: -50px```，效果如下：
![](margin-right1.png)
![](margin-right2.png)
&emsp;&emsp;通过检查我们可以发现，三个元素的宽高并没有改变，还都是100px，那为什么fa，fb会被覆盖住呢？前面已经说过，通过负margin偏移后，元素在文档流中减小的那部分空间会被后面的元素占据上(这里是文档流左移了)，而自身的宽高不变。以fa为例(红色的方格)，本来fa占据了100px的空间，后面的元素只能紧挨着fa从100px后开始占位置，但现在给fa设置了``margin-right: -50px``，fa虽然宽还是100px，但fa在文档流中占据的空间减小了50px，所以这50px被后面的fb填充了，也就是图中的效果，fb重叠到了fa上面。至于fc和fb也是同样的道理。理解了这一点，下面这个也就懂了。
```css
<div class="left">左浮动</div>
<div class="right">也是左浮动</div>

.left {
  float: left;
  width: 50px;
  background-color: yellow;
}
.right {
  float: left;
  width: 100px;
  background-color: red;
}

```
![](float1.png)
&emsp;&emsp;当给第一个元素添加``margin-bottom: -200px``时，就成了
![](float2.png)
![](float3.png)
&emsp;&emsp;其中第一个元素并没有消失，宽高也没有改变，只是被第二个元素挡住了而已，原因同上。

## 负边距的应用
### 去除最后一个li的border-bottom
&emsp;&emsp;在一个列表中，我们经常会给每一个li设置border-bottom，并且外层的父元素也会设置border，代码和效果图如下：
```css
<div class="box">
  <ul>
    <li>Hello World</li>
    <li>Hello World</li>
    <li>Hello World</li>
    <li>Hello World</li>
    <li>Hello World</li>
  </ul>
</div>

.box {
  width: 300px;
}
.box ul {
  border: 1px solid red;
}
.box li {
  list-style: none;
  border-bottom: 1px solid red;
}
```

![](4.png)
&emsp;&emsp;很明显最后一个li的border-bottom和父元素的border靠在一起了，视觉效果很不美观。我在开发IOS仿网易云音乐的时候就经常遇到这个问题，不过我是把border-bottom的样式单独写在一个class里，如果不是最后一个li就给它绑定这个类，当然这是可行的，但这样终究麻烦了一点，现在我使用负margin实验了一下发现也可以达到同样的效果。只需要给li增加一句``margin-bottom: -1px``就可以了，
![](5.png)
&emsp;&emsp;这要怎么理解呢？前面也说过，**使用负margin后会使元素框的高度减小，造成后面的元素上移**。没错，除却第一个li外其余几个li都上移了，只是1px比较小看起来不是很明显而已，如果你调成-5px效果就很明显了，这里就不贴图了(有个小问题，为什么第一个li不会上移呢？因为虽然第一个li的元素框高度减小了，但影响到的是它后面的元素，对其自身是没什么影响的)。那为什么后面几个li上移了最后一个border-bottom就不会重叠了呢？代码中我们并没有给ul指定高度，所以ul会由子元素li撑起来，li的元素框高度减小后整个ul的高度也会随着减小(这里是减小了5px)，ul的border-bottom自然也会随着上移5px，而最后一个li是上移了4px。算上最后一个li自身border-bottom的1px，所以ul的border-bottom和最后一个li的border-bottom会重叠在一起！一开始我也不太理解，重叠在一起不是也会加粗了边框吗？后来实践得知，两个边框重叠和靠在一起是不同的概念的！两个边框靠在一起才会看起来像是加粗了，重叠在一起是不会有这种视觉效果的。想象一下，你正对着千手观音时，你觉得那是一个人还是N个人？这里我还是贴一下图说明吧。
```css
<div class="test"></div>
<div class="test"></div>

.test {
  width: 50px;
  height: 50px;
  border: 1px solid red;
}
```
![](6.png)
&emsp;&emsp;上图两条边框靠在了一起，当我给下面的方格添加``margin-top: -1px``后，,两个边框便重叠起来了，效果是
![](7.png)
&emsp;&emsp;以上，就是我对使用负margin消除最后一个li的border-bottom的理解了。所以啊，以后就不要用class动态绑定啦，开始用负margin吧。

### 实现两栏布局
&emsp;&emsp;利用浮动和负边距可以很神奇地实现两栏布局，即一栏作为侧边栏固定宽度，一栏宽度为100%自适应。先一步步来：
```css
<div>
  <div class="slider">
    <p>slider</p>
  </div>
  <div class="content">
    <p>content</p>
  </div>
</div>

.slider {
  float: left;
  width: 100px;
  height: 200px;
  background-color: blue;
}
.content {
  float: left;
  width: 100%;
  height: 200px;
  background-color: yellow;
}
```
![](example1.png)
&emsp;&emsp;在上图中因为content是100%宽度而且slider已经占据了100px，所以content被挤了下去，而要实现两栏布局我们首先要做的就是将slider和content放到同一行去。但两者挤不下要怎么办？我们可以想到使slider在文档流中不占据位置，这样就可以让content也占据slider原本的位置从而使两者同行排列，而方法自然是给slider绝对定位了。这是一种方法，但我们也还可以使用负margin。前面提到过，使用**负margin偏移后会造成该元素在文档流中占据的空间减小**，原先content需要在文档流中占据100%的宽度，现在我们给content添加``margin-right: -100px; // slider的宽度``，就可以使content在文档流中只需要占据100%-100px的宽度空间就够了。为了防止造成页面水平拖动，所以给最外层的div加上``overflow: hidden``。效果如下：
![](example2.png)
&emsp;&emsp;这里还有一个问题，我们虽然隐藏了content超出外层div的内容，但那一部分空间还是存在的，conten的内容还是会分布在那一部分位置上。所以我们还需要给content的子元素加上``.content p {margin-right: 100px}``，这样就大功告成了，最终效果如下：
![](example3.gif)
完整代码：
```css
<div style="overflow: hidden">
  <div class="slider">
    <p>slider</p>
  </div>
  <div class="content">
    <p>content</p>
  </div>
</div>

.slider {
  float: left;
  width: 100px;
  height: 200px;
  background-color: blue;
}
.content {
  float: left;
  width: 100%;
  height: 200px;
  background-color: yellow;
  margin-right: -100px;
}
.content p {
  margin-right: 100px;
}
```

### 和绝对定位配合实现已知宽高元素的水平垂直居中
&emsp;&emsp;这应用是家常便饭了，就不赘述了。

### 实现多列等高，双飞翼布局等
&emsp;&emsp;实现原理和上面的两栏布局差不多，具体的实现请[戳这里](http://blog.dangosky.com/%2F2019%2F03%2F07%2F%E6%9C%AA%E7%9F%A5%E5%AE%BD%E9%AB%98%E5%85%83%E7%B4%A0%E7%9A%84%E6%B0%B4%E5%B9%B3%E5%9E%82%E7%9B%B4%E5%B1%85%E4%B8%AD%E5%B8%83%E5%B1%80%2F#toc-heading-5)。

# BFC
&emsp;&emsp;块级格式化上下文（Block Formatting Context，BFC），我的理解是：BFC 就是具有特定规则的一个容器，而且容器里面的元素不会在布局上影响到外面的元素。即不同的 BFC 区域之间是各自独立互不影响的。这里说的特定规则即下文要说到的垂直方向上 marin 会合并、子元素的 margin-top 会带跑父元素等。

<!-- 一个BFC区域包含创建该上下文元素的所有子元素，但是不包括创建了新的BFC的子元素的内部元素。每一个BFC区域只包括其子元素，不包括其子元素的子元素。 -->

&emsp;&emsp;只要满足下列任意一个条件即可触发 BFC：
+ 根元素，即 body
+ float 的值不为 none
+ overflow 的值不为 visible
+ display 的值为 inline-block、table-cell、table-caption
+ position 的值为 absolute 或 fixed 

&emsp;&emsp;我们通常可以利用两个 BFC 之间不会互相影响这个特性，来消除 BFC 区域带来的一些影响。

## 防止垂直方向上的 margin 合并

```css
<div class="a"></div>
<div class="b"></div>

.a {
  width: 100px;
  height: 100px;
  background-color: red;
  margin-bottom: 50px;
}
.b {
  width: 100px;
  height: 100px;
  background-color: yellow;
  margin-top: 100px;
}
```
![](10.png)

&emsp;&emsp;在上面的测试代码中，我们给两个兄弟 div 各设置了 50px 和 100px 的外边距。依我们原先的预期，这两个 div 在垂直方向上应该会相距 150px 才对，但从上图中我们可以发现它们只相距了 100px 而已，这就是在同一个 BFC 区域内（这里是 body），垂直方向上的 margin 会合并。具体的合并规则是：

+ 如果两个外边距都为正数，则最终的外边距为两者的最大值。
+ 如果两个外边距一正一负，则最终的外边距为两者的和。
+ 如果两个外边距都为负数，则最终的外边距为两者的最小值。

&emsp;&emsp;总结成一句话就是：正正取大，正负相加，负负取小。读者可以[戳这里进行实验](https://jsfiddle.net/DangoSky/4a3bnev6/)。

&emsp;&emsp;为了防止 margin 合并，我们可以利用 BFC 来使两个 div 的布局不互相影响。可以给 div.a 或者 div.b 外层加一个父级 div 包裹，并触发父级 div 的 BFC，例如常用的`overflow: hidden`即可。

## 防止 margin 塌陷
```css
<div class="a">
  <div class="b"></div>
</div>

.a {
  width: 100px;
  height: 100px;
  background-color: red;
}
.b {
  width: 50px;
  height: 50px;
  background-color: yellow;
  margin-top: 50px;
}
```
![](11.png)

&emsp;&emsp;通过上面这段代码，我们预期中是想让子元素 b 距离父元素 a 顶部 50px 距离的，但结果却是子元素带着父元素一起偏离顶部 50px 了，它们的相对距离并没有改变，也就是子元素的 margin-top 带跑了父元素。解决办法也是利用 BFC 来使外层的 body 不影响到 div.a 和 div.b，同样给父元素添加 `overflow: hidden` 来触发 BFC。

![](16.png)

&emsp;&emsp;但需要注意的是，得子元素和父元素**直接相接触**才会导致 margin 塌陷，也就是说得满足几个条件：

+ 父元素没有设置 border 和 padding-top。
+ 该子元素是父元素的第一个非空子元素。
+ 如果父元素和该子元素之间存在其他空元素的话（比如空标签），若是行内元素则需保证没有设置水平方向的 margin、border 和 padding。若是块级元素则需保证没有设置垂直方向的 border 和 padding。

&emsp;&emsp;总的来说，就是父元素和该子元素要相接触，之间不能存在其他障碍物阻拦，比如 border 或 padding 之类的。需要区分的是如果它们中间有其他空元素的话，行内元素和块级元素一个是要求水平不接触一个是要求垂直不接触。[可以戳这里进行实验](https://jsfiddle.net/DangoSky/2zho76f9/)。

## 阻止元素被浮动元素覆盖
```css
<div class="a"></div>
<div class="b"></div>

.a {
  width: 50px;
  height: 50px;
  background-color: red;
	float: left;
}
.b {
  width: 100px;
  height: 100px;
  background-color: yellow;
}
```
![](12.png)

&emsp;&emsp;平时写页面的时候常常会遇到上图这种情况，一个浮动元素会覆盖在它后面的元素上。以前我都是直接给后面的元素设置一个外边距来间隔开它们。但其实利用 BFC 可以更方便得达成目的，也就是触发 div.b 的 BFC，使外层 body 的 BFC 不影响到 div.b。

![](15.png)

## 清除浮动

```css
<div class="a">
  <div class="b"></div>
</div>

.a {
  border: 1px solid red;
}
.b {
  width: 100px;
  height: 100px;
  background-color: yellow;
  float: left;
}
```
![](13.png)

&emsp;&emsp;我们知道，设置了浮动的元素不会将高度计算进父元素中，也就无法撑高父元素。如上图，父元素 a 只剩下 2px 的边框高度了。但往往我们需要把浮动元素的高度也计算进父元素中，之前写仿网易云音乐时就没少遇到这个需求。但当时还不知道 BFC，只会撒撒地再给父元素设置一个高度，然而弊端就在于需要事先知道这个高度才行，这就很硬核了... 如果使用 BFC 的话，就可以清除子元素的浮动，从而使得浮动中的子元素也可以撑起父元素。还是照旧，给父元素添加 `overflow: hidden` 即可。

![](14.png)