---
title: Vue全家桶仿iOS版网易云音乐
date: 2019-02-25 01:29:08
tags: 
    - Web Project
    - JavaScript    
	  - Vue
categories: Web Project
img: http://p1.pstatp.com/large/pgc-image/1539560119468feb70b785e
summary: 收官，对为期四十多天的仿iOS版网易云音乐开发的一点总结。
---
# 前言
&emsp;&emsp;使用vue全家桶开发这个仿网易云音乐进行实操。因所学有限，项目所包含的内容可能会比较简单，并没有涉及到服务器搭建以及webpack配置等，但整体的业务逻辑还是有的。(还是要多加学习啊，加油！)。
# 介绍
## 预览
> 使用的是学生服务器,带宽较小，初次体验可能会加载得比较慢 

&emsp;&emsp;[项目地址](https://github.com/DangoSky/cloud-music)   
&emsp;&emsp;[在线体验](vue全家桶仿iOS版网易云音乐/QRcode.png)
> PC端推荐使用chrome或firefox预览

![](https://user-gold-cdn.xitu.io/2019/3/10/1696339dfe78e0d4?w=320&h=319&f=png&s=7499)

> 移动端推荐使用Android手机微信扫码预览,暂不支持iOS播放   

## 安装运行
```
克隆项目     
git clone https://github.com/DangoSky/cloud-music.git
     
安装依赖   
npm install   

开发环境运行    
npm run serve   

生产环境构建   
npm run build 
```
## 技术栈  
&emsp;&emsp;vue2 + vue-cli3 + vue-router + vuex + axios
## 使用到的工具
&emsp;&emsp;``vue-lazyload``: 实现图片懒加载   
&emsp;&emsp;``fastclick``: 解决移动端点击300ms延迟   
&emsp;&emsp;``Iconfont``: 本项目包含的所有图标均来源于此    
&emsp;&emsp;(本项目未使用UI框架)
## api调用
  &emsp;&emsp;[网易云音乐 NodeJS 版 API](https://github.com/Binaryify/NeteaseCloudMusicApi)    
  &emsp;&emsp;[网易云音乐（Cloudmusic）API](https://zhuanlan.zhihu.com/p/30246788)   

## 项目截图

![](https://user-gold-cdn.xitu.io/2019/3/10/169633ba1c662491?w=279&h=502&f=png&s=183089)
![](https://user-gold-cdn.xitu.io/2019/3/10/169633bc0bda3c19?w=281&h=504&f=png&s=191437)
![](https://user-gold-cdn.xitu.io/2019/3/10/169633bcc1b60036?w=280&h=503&f=png&s=48341)
![](https://user-gold-cdn.xitu.io/2019/3/10/169633bdf34cdbdd?w=279&h=500&f=png&s=252193)
![](https://user-gold-cdn.xitu.io/2019/3/10/169633be8170cd45?w=279&h=500&f=png&s=217948)

## 功能实现
 + ios版网易云音乐界面的五个模块
 + 基本的播放暂停、上下一曲
 + 播放顺序调整、进度条拖拽
 + 歌词滚动   
 + 音乐搜索
 + 推荐歌单  
 + 推荐MV  
 + 增删改查歌单(使用localStorage存储，右滑可以删除歌单或将歌曲移出歌单)  
 > 因要开始准备学校挑战杯，所以本项目开发暂告一顿落，等以后有时间还会继续开发新功能，预期添加的功能包括：查看歌曲评论、用户登陆、每日推荐、查看动态...

## 目录结构
```
src  
|—— api 调用api
|—— assets 图标库
|—— components 组件库
|   |——base 基础组件
|   |——explore 发现页面
|   |——video 视频页面
|   |——myself 我的页面
|   |——friend 朋友页面
|   |——user 账号页面
|—— css 各个组件的样式 
|   |——base
|   |——explore
|   |——video
|   |——myself
|   |——friend
|   |——user
|—— router  路由配置
|—— store  vuex状态管理
|—— App.vue  根组件
|—— main.js 入口
```
# 遇到的问题
1. iOS上无法播放音乐，不论是用微信打开还是用safari、Firefox打开都没有声音，测试了一下是取得到音乐的url的。问题应该是audiod的paly方法失效了，原因未明，谷歌也未果，而且我看GitHub上别人的仿网易云貌似没有这个问题，未解。安卓的情况比较复杂，拿了几台手机测试，在微信上打开全部功能都正常运行。用浏览器则一些型号的手机可以，一些不可以，而且有的手机用UC打开无法播放，用系统自带的浏览器则可以播放。原因也未明，不过这倒是在意料之中，因为在代码中还没有做兼容性处理，等以后有时间再继续完善吧。

2. 偶尔会出现疑似跨域资源共享的问题(见下图)，说疑似是因为这个报错只有小概率会出现，而且即使出现了只要过一会再刷新就不会报错了，不像是跨域的问题。因为api是别人写好的，也不知道是不是后端接口的问题，原因未接。在GitHub上有和一个也在做仿网易云的人交流过，他也偶尔会出现这个cors问题，但也不知道怎么解决。
![](cors.png)

3. fixed定位的问题。网易云很多个界面上都有一个用于路由跳转的footer，并且是固定定位的。因为固定定位在文档流中不占据位置，所以会造成上面排版下来的元素会被footer覆盖住，设置z-index也不管用（如果footer有背景色的话，则footer无法被完全覆盖住）。我的解决办法是使用一个空的div或一个伪元素占位，把宽高设得和footer一样加上相对定位，这样就可以把fixed定位的空间补回来了。但我感觉这只是一种hack，并没有根本上解决问题，每次在一个页面中遇到这种问题都得手动再去新增一个伪元素和空div，而且这样一个空div不太符合语义化。但fixed定位本就规定了在文档流中不占据位置，貌似也没有更好的解决办法了。

```css
.userBar::after {   
  content: '';    
  width: 100%;
  height: 50px;
  position: relative;
  left: 0;
  bottom: 0;
  display: block;    
}
```

# 总结
&emsp;&emsp;有一个项目开发进行实操，有时候确实比一直看文档要有用的多。看文档和一些技术贴有时候会因为尚未接触到那些问题而没有什么想法，边在实操中发现问题边针对性地学习有时候不失为一种好的学习方法。本项目的开发过程也遇到过不少问题，几乎思考一阵子或是求助于Google和StackOverflow就可以解决掉了，也算是锻炼了一下在项目开发中发现问题和解决问题的能力吧。有些可惜的是，因所学有限，该项目尚未进行性能优化以及兼容性处理，可能在不同的设备和浏览器上会有意料之外的效果，等以后学到了更多后再陆续优化吧，目前得把时间投入到新任务中去了，现在写下这篇总结算是对这阵子开发的收官吧。

&emsp;&emsp;如果您发现有什么问题或是有什么想法，欢迎issues和PR。    

&emsp;&emsp;如果您觉得这个仿网易云音乐还算不错，可以在[GitHub](https://github.com/DangoSky/cloud-music)上点个star，非常感谢您的认可和鼓励，谢谢~

---
**后话**：   
&emsp;&emsp;接下来就开始向react进军了，虽然是打算等暑假或是大三再学习react的，但挑战杯的项目需要，既然决定要用react native开发app了，就顺道一起把react学了吧。其实还是很满意这个进程的，使用react native进行app开发挺契合我原先的技术栈的，而且这样就不用原生的app开发那一套，也就不用学Java啦，几乎没有额外的学习成本。所以啊，要继续加油啦，保持这几个月来的学习状态，继续前进吧！接下来这阵子的学习目标，边学习react后开始练手react native弄个demo熟悉熟悉，边巩固原先的js基础好为之后的实习僧面试做准备(暑假应该找得到实习吧，不知道外面的行情怎么样)。还得注意下时间准备做小程序了，虽然还有一个多月的时间，用mpvue搭建也几乎和用vue没啥差别，但还是得先安排好时间，免得到时出了什么岔子才行啊。   

&emsp;&emsp;以上。   

&emsp;&emsp;向前有路，未来可期！