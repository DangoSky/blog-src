---
title: 颜色规范校验 Lint
date: 2020-04-11 10:04:09
tags:
  - Node
  - 正则表达式
  - AST
categories: JavaScript
summary: 记录查找样式文件中使用到的色值的技术实现过程，以及编码过程遇到的一些坑。
changeRandomImg: 19
---

## 背景

最近有一个需求，要做的工作是编写一个校验脚本，在代码提 commit 的时候去校验提交的样式文件里有没有不符合规范的色值。项目里会有一个统一的 `normal-colors.less` 文件，样式文件里使用到的色值都必须使用这个 `normal-colors.less` 里的色值变量。对于不在规范里的色值，比如指定的十六进制、rgb、rgba、hsl、hsla 以及颜色名，都要检查出来并查找在 `normal-colors.less` 里有没有对应的色值变量，有的话则自动替换，没有则打印出所有不规范的色值。

## 技术实现

#### 1. 提取 commit 的样式文件

```js
const execSync = require('child_process').execSync;
const files = execSync('git diff HEAD --name-only', {
  encoding: 'utf8'
}).split('\n').filter(i => i && /\.(c|le|sa|sc)ss$/.test(i));
```

#### 2. 提取样式文件中使用到的色值

刚接到这个需求的时候，第一想法就是使用正则表达式去匹配。对颜色十六进制、常用的颜色名、rgb(a)、hsl(a) 这几种情况分别写正则表达式，再读取文件内容进行全局匹配。

```js
const nameRegx = /(black|silver|gray|white|maroon|red|purple|fuchsia|green|lime|olive|yellow|navy|blue|teal|aqua)/g;

const hexRegx = /#([0-9a-fA-f]{6}|[0-9a-fA-f]{3})/g;

const rgbRegx = /rgba?\((\d+)(\.\d+)?%?,\s*(\d+)(\.\d+)?%?,\s*(\d+)(\.\d+)?%?(,\s*((\d+)?)(\.\d+)?(%?))?\)/g;

const hslRegx = /hsla?\((\d+)(\.\d+)?%?,\s*(\d+)(\.\d+)?%?,\s*(\d+)(\.\d+)?%?(,\s*((\d+)?)(\.\d+)?(%?))?\)/g;
```

对于颜色名，只需要列举几个常用的颜色名就可以了。

对于十六进制色值，可能是 6 位的字符串，也可能是缩写成 3 位而已，并且允许的字符只能是在 `0-9` 或 `a-f` 或 `A-F` 之间而已。

对于 rgb(a) 和 hsl(a)，其实两者的格式是一样的，所以写出来的正则也就它们的前缀名不一样而已。但需要考虑到它里面使用的各个值可能是整数，也可能是小数、百分数，所以写出来的正则会复杂一些。为方便理解可将上面 rgb(a) 的正则拆分为以下几部分：

- `rgba?\(`
- `(\d+)(\.\d+)?%?`
- `,\s*(\d+)(\.\d+)?%?`
- `,\s*(\d+)(\.\d+)?%?`
- `(,\s*((\d+)?)(\.\d+)?(%?))?`
- `\)`

#### 3. rgb(a) 色值转换为十六进制

当检查到不规范的色值时，需要去 `normal-colors.less` 里查找有没有对应的色值变量。所以还要先读取 `normal-colors.less` 文件，将其中的色值变量和具体的色值号提取到一个对象里，并且是以色值为键名，色值变量为值。因为 `normal-colors.less` 里的色值都是使用的十六进制，所以对于检查出来的不规范色值，还需要再转换成十六进制才可以判断在 `normal-colors.less` 中是否有对应的色值变量（注意还需要对转换出来的十六进制再转换成小写形式），不过这里我只做了对 rgb(a) 的转换。rgb 转换为十六进制，其实只需要将其中的 r、g、b 值转换为十六进制，再加上前缀 `#` 就可以了，但要考虑到它们的值可能为小数和百分数的情况，以下是 rgb(a) 转换为十六进制的函数。

```js
// rgb 和 rgba 转换为十六进制
function rgbaToHex(rgba) {
  const color = rgba
    .replace(/rgba?\(/, '')
    .replace(/\)/, '')
    .replace(/[\s+]/g, '')
    .split(',');
  // 如果是 rgb 的话，默认 alpha 透明度是 1
  // 考虑到值可能为百分数，所以还需要对百分数进行计算
  const alpha = formatPer(color[3] || '1', true);
  const r = formatPer(color[0], false);
  const g = formatPer(color[1], false);
  const b = formatPer(color[2], false);
  const hex = '#' +
    ('0' + r.toString(16)).slice(-2) +
    ('0' + g.toString(16)).slice(-2) +
    ('0' + b.toString(16)).slice(-2);
  return {
    hex,
    alpha
  };
}

// 转换百分数
function formatPer(num, isAlpha) {
  if (num.includes('%')) {
    num = parseFloat(num.replace('%', '') / 100);
    return isAlpha ? num : parseInt(num * 255);
  }
  return isAlpha ? parseFloat(num) : parseInt(num);
}
```

#### 4. 设置白名单

有时候因为一些特殊原因，比如历史遗留了太多不规范的色值，并且当前的代码又急需要合进 master 准备上线，这时候就需要一个给业务方提供一个跳过校验的功能了。当然可以通过 `git commit --no-verify -m "<commit message>"` 来跳过所有 lint 检查，但这样对所有的文件都跳过了检查，并且其他的一些 lint 校验也都被忽略了。所以可以通过给某个文件加白名单的方式来跳过颜色校验脚本，比如说在文件中写个注释 `/* disable-color-check  */`，在读取样式文件时，如果全局匹配到了这条注释的话，就直接 return 出校验函数跳过检查。


#### 5. 打印出不同颜色

为了打印出来的信息可以清晰点提高辨识度，还可以对不同的信息打印出不同的颜色，比如文件名输出为红色，提示信息输出为绿色。这里貌似有专门的第三方库来控制打印的文本样式，还可以打印出一些 Icon 等。不过也没必要为此再引入一个库，我是直接对 `console.log` 做文章。

```js
console.log('\x1B[32m%s\x1B[0m', '打印出来是绿色的');
console.log('\x1B[31m%s\x1B[0m', '打印出来是红色的');
```

## 遇到的问题

上述讲的方案是通过正则表达式去匹配样式文件中的不规范色值，这使用在 rgb(a)、hsl(a) 和十六进制上没有问题，但用在颜色名上就有问题了。比如我有一个选择器是 `.m-red`，类名中如果出现了颜色名的话，它也会被正则匹配到，而这是不符合预期的。之后我就想到颜色名作为类名出现就这些情况，`.m-red`、 `.red-box`，颜色名左右会有 `.` 或者 `-`。所以如果颜色名左右有 `.` 或者 `-` 的话，就认为它是作为类名出现的，不进行匹配。改造后的正则为： `/(?<!(\.|-))(()bglack|silver|gray|white|maroon|red|purple|fuchsia|green|lime|olive|yellow|navy|blue|teal|aqua)/g`，也就是加了 `(?<!(\.|-))` 来判断颜色名，`?<!` 系列的作用如下。

- `exp1(?=exp2)`：查找 exp2 前面的 exp1。

- `(?<=exp2)exp1`：查找 exp2 后面的 exp1。

- `exp1(?!exp2)`：查找后面不是 exp2 的 exp1。

- `(?<!exp2)exp1`：查找前面不是 exp2 的 exp1。

但是事实上，我们并不能保证类名中的颜色名就只是以上面说的两种情况出现，可能也是 `.m-xxxredxxx`，如果用正则表达式的话实在难以囊括所有可能的情况，所以只能另想实现方案了。

## 最终方案

接着使用的方案是通过将样式文件解析成抽象语法树，通过递归遍历 AST 来提取所有 CSS 属性键值对，再用上面的正则表达式去匹配它的值。不过这里其实不用将键值对提取出来的，直接在遍历到键值对时进行正则匹配就够了。如果要提取出来的话，因为很多 CSS 属性是重复出现的，要区分的话只能通过它们的类名去区分。而对于 Less 而言存在着类嵌套（比如说 `.box p` 和 `.container p` 这两个选择器），为了避免类名重复就得将它的父级类名一起拼起来形成一个独一无而的值。但这样处理起来会比较麻烦，所以就放弃了提取所有的键值对，而是在遍历时判断就可以了。

#### 对于 CSS 文件

因为项目里使用的是 CSS 和 Less，所以需要使用不同的工具来解析两者。对于 CSS 文件使用的解析工具是 [css](https://github.com/reworkcss/css)，它提供了简单的 api 来解析 CSS 文件，并且解析出来的 AST 结构也很清晰提取挺方便的。

```js
const css = require('css');
const fileContent = fs.readFileSync(file, {
  encoding: 'utf8'
});
const res = css.parse(fileContent, {source: file}); // -> AST
```

![](./1.png)

#### 对于 Less 文件

**第一个方案**

将 Less 解析成 AST 有多种方法，一开始的做法是将 Less 编译成 CSS，再使用上述的 `css.parse` 解析成 AST。将 Less 编译成 CSS，可以使用 Less 提供的 [lessc](http://lesscss.cn/#using-less-command-line-usage) 命令编译，但 lessc 执行有些问题，所以就没采用 lessc 了。使用的是 Less 自带的 [less.render](http://lesscss.org/usage/#programmatic-usage) 函数编译。

```js
const less = require('less');
less.render(fileContent)
  .then(function(output) {
    console.log(output.css)； // -> 编译后的 Css
  }, function(error) {
    console.log(error）；
  });
```


但使用 `less.render` 中途又遇到了几个坑：

1. 如果 Less 文件中引入了其他的样式文件，`less.render` 会找不到引入的文件而报错。

解决方法：`less.render` 中使用参数 filename，指定如果解析过程中遇到了引入的其他样式文件，就以该文件为相对路径去查找引入的路径。（参考 [StackOverflow](https://stackoverflow.com/questions/27501958/less-render-is-not-working-in-nodejs-with-multiple-import-files-which-are-in-dif)）。

```js
const less = require('less');
less.render(fileContent, {filename: path.resolve(file)})
  .then(function(output) {
    console.log(output.css)； // -> 编译后的 Css
  }, function(error) {
    console.log(error）；
  });
```

2. 如果引入的样式路径使用到了路径别名比如 `@import '~css/base/norm-colors.less'`，则还是会解析失败，因为 `less.render` 无法识别 `~css`。

对此想到的解决方法是：在脚本中导入 `webpack.common.config.js` 文件，获取到其中的路径别名值后再对引用路径进行替换，将路径别名替换成完整的路径。感觉思路没问题，可问题在于 `less.render` 解析过程遇到其他引入的文件时，它内部自己去查找引入的文件，这个过程对我们是透明的，没有开放其它空间让我们去将引用路径中的路径别名替换成完整的路径！至此，这个方案卒（泣不成声.jpg）。

**第二个方案**

既然使用 `less.render` 行不通了，就只能使用专门的 Less 解析器，直接将 Less 解析成 AST 了。我使用的是这个 [postcss-less](https://github.com/shellscape/postcss-less )。它可以将 Less 文件解析成 AST，并且不存在方法一中引用其他文件的路径问题（因为 postcss-less 没有解析引用的其他样式文件）。

```js
const postcss = require('postcss');
const syntax = require('postcss-less');
postcss().process(fileContent, { syntax: syntax })
  .then(function (result) {
    console.log(result);   // -> AST 对象
  })
```

![](./2.png)

到这里就可以将 Less 成功解析成 AST 了，接着就是遍历 CSS 和 Less 解析出来的 AST，用上面的正则表达式去判断使用到的键值对里有没有不规范的色值。下面就不展开了，贴一下遍历两个 AST 的代码，方便以后有需要使用的话可以直接复用。


**解析 CSS 文件**

```js
/* 
  file 是要解析的 CSS 文件
  fileContent 是该 CSS 文件的内容
  regxArr 是要匹配的正则规则，是一个数组支持匹配多项规则
  返回值是一个数组，包含了命中 regxArr 中任一规则的 CSS 属性值
*/
const css = require('css');

function getCssColorArr(file, fileContent, regxArr) {
  const res = {};
  const obj = css.parse(fileContent, {source: file});
  (obj.stylesheet.rules).forEach(item => {
    if (item.type === 'rule') {
      item.declarations.forEach(kv => {
        if (kv.type === 'declaration') {
          regxArr.forEach(regx => {
            const target = (kv.value).match(regx);
            // 去重
            if (target && !res[target]) {
              res[target] = true;
            }
          })
        }
      })
    }
  })
  return Object.keys(res);
}
```

**解析 Less 文件**

```js
const postcss = require('postcss');
const syntax = require('postcss-less');

function getLessColorArr(fileContent, regxArr) {
  let res = {};
  const result = postcss().process(fileContent, { syntax: syntax });
  if (result.root) {
    res = formatLess(result.root, regxArr);
  }
  return Object.keys(res);
}

function formatLess(obj, regxArr) {
  let res = {};
  obj.nodes && obj.nodes.forEach(item => {
    // 嵌套的类则递归解析
    if (item.type === 'rule') {
      res = Object.assign(res, formatLess(item, regxArr))
    }
    // 是 CSS 属性则进行正则匹配
    if (item.type === 'decl') {
      regxArr.forEach(regx => {
        const target = (item.value).match(regx);
        if (target && !res[target]) {
          res[target] = true;
        }
      })
    }
  })
  return res;
}
```

## 方案总结

对于 CSS 文件，使用 `css.parse` 解析成 AST 再提取出所有的 CSS 属性键值对，再用正则匹配其中用到的颜色名。

对于 Less 文件，使用 `postcss().process` 解析成 AST 再提取出所有的 CSS 属性键值对，再用正则匹配其中用到的颜色名。

