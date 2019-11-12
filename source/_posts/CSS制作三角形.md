---
title: CSS制作各种图形
date: 2018-12-25 11:20:41
tags: CSS
categories: CSS
summary: CSS制作三角形的原理以及制作其他小图形。
img: https://github.com/DangoSky/practices-for-web/blob/master/images/8.jpg?raw=true
---

# 三角形

## 原理
&emsp;&emsp;有时候代码和效果图可以比文字更清楚地表达我们想说明的意思，所以我们先上一段样式再看看效果。
```css
<div class="square"></div>  

.square {
  width: 50px;
  height: 50px;
  border: 20px solid;
  border-color: red;
}
```
![](0.png)
&emsp;&emsp;从图中我们好像并没有发现什么异常，这不就是普普通通地给一个div设置边框吗？这和三角形有什么关系？这样看确实是很平常，那是因为我们设置border都是左右上下四条边框都是同一种颜色的，如果我们把它们设置为四种不同的颜色呢？现在我们把``border-color: red``换为``border-color: yellow blue pink green``再来看看效果。
![](1.png)
&emsp;&emsp;现在有没有发现什么问题了？四条边框都是显示为等腰梯形的，并不是长方形！刚才我们看到的那个红色边框其实也是由四个等腰梯形拼成的，只是它们都是同一种颜色所以我们看不出来而已。我猜想之所以如此是为了让四条边框都可以等大而且分布在各自的位置上不至于混乱（想象一下如果四条都是长方形的话要怎么才能做到等大且均匀分布在上下左右）。现在我们再把这个div的宽高都调为 0 看看有什么变化。
![](2.png)
&emsp;&emsp;因为div的宽高为 0，且又存在着边框，所以原本是等腰梯形的四条边框会从开始延伸，在中心交为一点，于是就成了四个三角形。但我们只是要一个三角形而已，要怎么去掉其余三个呢？答案是我们可以给其余几条边框设置为透明色来隐藏掉它们。我们再把边框样式更换为``border-color: transparent transparent red transparent``试试看。（边框设置为透明不等于不设置边框，详见下文的注意点。）
![](3.png)
&emsp;&emsp;于是乎，一个三角形就出来了！理解了上述制造三角形的原理后，我们自然就可以随心所欲去变化三角形的指向和样式了。通过指定不同方向上的边框为透明色来改变三角形的方向，比如我们要得到一个指向左边的三角形，就应该把上下左边框都设置为透明色，即`` border-color: transparent pink transparent transparent``。（想象一下三角形是由原本方位上的等腰梯形延伸而成的就行了）
![](4.png)
&emsp;&emsp;如果我们要得到指向西北的三角形呢？（见下图）我们可以把它进行拆分，即由一个指向下和一个指向右的三角形组合而成（想象一下），所以只需要把边框样式改为``border-color: pink transparent  transparent pink``就成了，其他的同理。
![](5.png)

## 注意点
&emsp;&emsp;**如果没有设置全部四条边框，可能会出现断层效果。**
1. 只设置两条边框
+ 该两条边框相邻时

```css
.box {
  width: 50px;
  height: 50px;
  border-top: 50px solid red;
  border-right: 50px solid yellow;
}
```

![](8.png)
&emsp;&emsp;可以看到，因为没有设置左边框和下边框，所以上边框和右边框的部分也没有显示出来。（从中可以得到：**四个顶角处的那部分边框是属于相邻两个边框的，只要其中一个边框没有设置，顶角处的那部分边框就不会显示**。）
&emsp;&emsp;现在我们把宽高都设为0再看看效果。从下图可以发现，当div的宽高都为0时，原本延伸的那部分边框会收缩回去，最后两个三角形拼成了正方形。
![](9.png)

+ 该两条边框不相邻时

```css
.box {
  width: 50px;
  height: 50px;
  border-top: 50px solid red;
  border-bottom: 50px solid blue;
}
```
![](10.png)
&emsp;&emsp;原因同上，因为左右边框都没有设置，所以上下边框和左右边框相交的那部分也就不会显示了。和相邻边框不同的是，如果把宽高都设为0，则上下两个边框也会收缩回去，但最后直接收缩没了。**相邻边框收缩后拼成了一个正方形是因为那是由边框自己的大小拼凑而成的**，不依赖于div的宽高。而**不相邻的边框（即上下边框或左右边框）依赖于div的宽高**，它们中间那正方形的部分是随div的宽高来延长的（想象一下那画面就成了）。

2. 设置三条边框
设置三条边框和设置不相邻的两条边框的情况是一样的，这里就只贴图和代码不解释了。

```css
.box {
  width: 50px;
  height: 50px;
  border-top: 50px solid red;
  border-right: 50px solid yellow;
  border-left: 50px solid blue;
}
```
![](11.png)

```css
.box {
  width: 0;
  height: 0;
  border-top: 50px solid red;
  border-left: 50px solid blue;
  border-right: 50px solid yellow;
}
```
![](12.png)

# 圆
```css
.box {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: lightgreen;
}

// 或者通过边框来撑起圆的大小
.box {
  width: 0;
  height: 0;
  border-radius: 50%;
  border: 50px solid lightgreen;
}
```
![](14.png)

&emsp;&emsp;或者使用 **canvas** 来画圆。
```css
<canvas id="canvas" width="300" height="300"></canvas>
<script>
  let canvas = document.getElementById("canvas");
  let context = canvas.getContext("2d");
  context.beginPath();
  context.arc(100, 100, 50, 0, Math.PI * 2, true); 
  context.fillStyle = "red";
  context.fill();
</script>
```

# 半圆
&emsp;&emsp;设置半圆的时候宽高比是一比二或二比一（取决于半圆的方向）。而边框圆角，我们需要知道的是，设置``border-raidus``时是可以分开来设置四个方位的圆角的，依次顺序分别是左上，右上，右下，左下，所以半圆我们只需要设置相应的相邻两个边框圆角就行了。
```css
.semicircle {
  width: 100px;
  height: 50px;
  background-color: blue;
  border-radius: 100px 100px 0 0;
  /* 还可以如下分开设置 */
  /* border-top-left-radius: 100px;
  border-top-right-radius: 100px; */
}
```
![](6.png)

&emsp;&emsp;通过设置不同边框的样式，我们还可以设置出这么一个东西来，破了壳的蛋？食人花？如果想象力足够，CSS真的能够做出很多不可思议的玩样出来，比如人家IE的logo。Orz...
```css
.pac-man {
  width: 0px;
  height: 0px;
  border: 60px solid; 
  border-color: red transparent red red ; 
  border-radius: 50%;
}
```
![](15.png)

# 椭圆形
```css
.oval {
  width: 100px;
  height: 50px;
  background: green;
  border-radius: 50%; 
}
```
![](18.png)

# 扇形
&emsp;&emsp;扇形和半圆其实是同一个道理，只是扇形的宽高要相等，并且只需要设置一个边框圆角就行了。
```css
.fan-shaped {
  width: 50px;
  height: 50px;
  background: pink;
  border-radius: 0 0 0 100%;
}
```
![](7.png)

# 平行四边形
```css
.parallelogram {
  width: 100px;
  height: 50px;
  background: pink;
  transform: skew(45deg);
}
```
![](19.png)

# 六角星
```css
.sixStar {
  width: 0;
  height: 0;
  border-top: 100px solid red;
  border-right: 50px solid transparent;
  border-left: 50px solid transparent;
  position: relative;
}
.sixStar::after {
  width: 0;
  height: 0;
  border-bottom: 100px solid red;
  border-right: 50px solid transparent;
  border-left: 50px solid transparent;
  content: "";
  position: absolute;
  left: -50px;
  top: -135px;
}
```
![](13.png)
&emsp;&emsp;说白了，六角星就是由两个指向相反的三角形组合成的，只不过其中一个是通过伪元素来设置的，并使用绝对定位把它移动到合适的位置上去而已。需要注意的是，要调整好边框的大小，否则得到的六角星会达不到效果。

# 聊天框气泡
```css
.talkBubble {
  width: 120px; 
  height: 50px;
  background: lightgreen;
  position: relative;
  border-radius: 10px;
}
.talkBubble::before {
  content: "";
  position: absolute;
  right: 100%;
  top: 25%;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-right: 20px solid lightgreen;
  border-bottom: 10px solid transparent;
}
```
![](16.png)
&emsp;&emsp;说白了，就是一个长方形和一个三角形，其中三角形通过伪元素设置再绝对定位移动到左边而已，瞅着倒是挺好看的。

# 阴阳图
```css
.box {
  width: 100px;
  height: 50px;
  background: #eee;
  border-color: red;
  border-style: solid;
  border-width: 2px 2px 50px 2px;
  border-radius: 100%;
  position: relative;
}
.box::before {
  content: "";
  width: 10px;
  height: 10px;
  position: absolute;
  top: 50%;
  left: 0;
  background: #eee;
  border: 20px solid red;
  border-radius: 100%;
}
.box::after {
  content: "";
  width: 10px;
  height: 10px;
  position: absolute;
  top: 50%;
  left: 50%;
  background: red;
  border: 20px solid #eee;
  border-radius: 100%;
}
```
![](17.png)
&emsp;&emsp;这个阴阳图的制作很巧妙，之所以这么说是因为代码对borde运用地很灵活。整体的圆形其实并不只是一个圆形，它的上半部分是一个椭圆形，下半部分是由border来撑开的，这样就做到了上下两半是两种颜色。而中间那两个小圆也利用到了border，伪元素自身的宽高用来制作小圆，同时还设置了border来制作小圆外层的圆形，这样就达到了那弧形效果，最后还是绝对定位修改一下位置就大功告成了。