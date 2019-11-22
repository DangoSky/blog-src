---
title: elementUI级联选择器踩坑
date: 2019-06-14 21:58:11
tags: 踩坑指南
categories: 踩坑指南
summary: 由于 elementUI 级联选择器对所选择项的搜索是自上而下的，所以级联的每一项数据要唯一。
---

# 发现问题

&emsp;&emsp;今天使用 `elementUI` 的时候踩到坑了，期望的效果如下图所示。每一栋教学楼都有 1-7 层，每一层的教室都为 03-22，以此来选择不同的教室。

![](1.png)

&emsp;&emsp;参照[官方文档](https://element.eleme.io/#/zh-CN/component/cascader)，我写了如下的级联数据项。

```html
  <el-cascader
    v-model="form.address"
    :options="addressOptions"
    :props="{expandTrigger: 'hover'}"
    separator=""
  ></el-cascader>
```

```js
// 返回一个 1-7 楼，每楼有 03-22 教室的数组
function getOptions() {
  let arr = [];
  for(let i=1; i<=7; i++) {
    let floor = {};
    floor.value = i + "";
    floor.label = i + "";
    floor.children = [];
    for(let j=3; j<=22; j++) {
      let obj = {};
      obj.value = j < 10 ? `0${j}` : `${j}`;
      obj.label = j < 10 ? `0${j}` : `${j}`;
      floor.children.push(obj);
    }
    arr.push(floor);
  }
  return arr;
}

export default {
  addressOptions: [
    {
      value: '文清楼',
      label: '文清楼',
      children: getOptions()
    },
    {
      value: '文新楼',
      label: '文新楼',
      children: getOptions()
    },
    {
      value: '文俊楼',
      label: '文俊楼',
      children: getOptions()
    },
    {
      value: '文逸楼',
      label: '文逸楼',
      children: getOptions()
    }
  ]
}
```

&emsp;&emsp;从显示上看，上面的代码确实能够起到视角上的效果。但当我点击的时候，却发现不管我怎么选择，只有第三级的数据有显示变化，第一级和第二级的数据并不会随之改变。（下图使用的是我另外在 [jsfiddle](https://jsfiddle.net/DangoSky/7osfp265/1/) 测试时的数据图，所以和上面代码中的数据不一样）

![](2.gif)

&emsp;&emsp;在查错的时候，我发现更奇怪的现象，如果我给第三级数据加上一个参数（此处是第一级的数据），则第一级数据就会随之改变了，但第二级数据还是原样。

![](3.gif)

&emsp;&emsp;看着这么神奇的结果，我以为我发现了 `elementUI` 的 bug，所以我直接给它提了 [issues](https://github.com/ElemeFE/element/issues/16068)，不过还没有人解答。后来我又在 [StackOverflow](https://stackoverflow.com/questions/56594223/not-displayed-correctly-in-elementui-cascader) 提问，终于有人提出了猜想。我总结下就是：所以当我选择 Shanghai / 3 / 03 时，**elementUI 会自上而下搜索 03 这个值所在的位置**，而 03 在 Beijing / 1 中已经存在了，所以会直接显示为 Beijign / 1 / 03，而不会再继续向下搜索 Shanghai 这个数据项（如果 Beijing / 1 中没有 03 这个值，则以此向下搜索 Beijing / 2 、Beijing / 3，如果到最后一项 Beijing / 22 还没有找到的话，再搜索 Shanghai 中的数据）。读者可以在我上面给出的 jsfiddle 链接中测试。

&emsp;&emsp;同理，当我给第三级数据加上一个参数比如第一级的数据时，现在我选择 Shanghai / 3 / 03Shanghai，`elementUI` 继续从上而下搜索 03Shanghai 这个值，在 Beijing 这个数据项中没有找到，就向下找 Shanghai 这个数据项中是否存在 03Shanghai 这个值。在 Shanghai / 1 中已经找到了 03Shanghai，所以就直接结束搜索，返回的结果就是 Shanghai / 1 / 03Shanghai。

&emsp;&emsp;elementUI 官方文档中并没有注明**级联选择器的搜索方式**，而又刚好我使用的级联数据中第二级和第三级数据是一样的，所以这个坑就被我踩上了（下午谷歌了一个多小时貌似也没有发现遇到这个坑的人）。

# 解决办法

&emsp;&emsp;知道了问题的根源在于级联的数据项是一样的后，我们只要**让每一项的值唯一**就好了。比如第二级的数据带上第一级的数据做为唯一标记，第三级的数据带上第二级的数据做为唯一标记。注意，**是每一项的 value 带上标记，label只是作为视图的显示数据，不需要带上标记**。修改后的代码如下。

```js
function getOptions(val) {
  let res = [];
  for(let i=1; i<=7; i++) {
    let floor = Object.create(null);
    // 第二级选项的value带上第一级的数据标记
    floor.value = val + "+" + i;
    floor.label = i;
    floor.children = [];
    for(let j=3; j<=22; j++) {
      let obj = Object.create(null);
      // 第三级选项的value带上第二级的数据标记
      obj.value = j < 10 ? `${val}+${i}+0${j}` : `${val}+${i}+${j}`;
      obj.label = j < 10 ? `0${j}` : `${j}`;
      floor.children.push(obj);
    }
    res.push(floor);
  }
  return res;
}
```

&emsp;&emsp;到这里上面所描述的 bug 就解决了，级联选择器的结果会随着选择的路径而动态改变。jsfiddle 测试链接[在这里](https://jsfiddle.net/n365ecuk/)。

![](4.gif)

&emsp;&emsp;接下来还需要解决的问题是，如何把所选择的数据项结果简化成我们想要的格式。我们得到的数据项是 `["理科南教学楼", "理科南教学楼+6", "理科南教学楼+6+06"]`， 而我们想要的结果是理科南606。一开始我是直接使用 `substr` 进行字符串截取的，但这样有个问题，不同的教学楼名称长度不同，截取的开始点不能确定。所以我采用正则表达来截取字符串。

```js
formattingAddress(arr) {
  let str = "";
  this.form.address.forEach((val, index) => {
    // 第一级数据直接获取
    if(index === 0)  str += val;
    // 第二级数据过滤掉第一级的数据
    else if(index === 1) {
      str += val.replace(/^[\u4e00-\u9fa5]+\+/g, '');
    }
    // 第三级数据过滤掉第二级的数据
    else if(index === 2) { 
      str += val.replace(/^[\u4e00-\u9fa5]+\+[0-9]+\+/g, '');
    }
  })
  this.form.address = str;
}
```

&emsp;&emsp;至此，`elementUI` 级联选择器的使用就照常了，完结撒花。
