# 这是 DangoSky 的博客呐

## 常用命令

```bash
yarn 

hexo new <文章名>

hexo g # 生成静态文件

hexo s # 本地预览

hexo d # 打包、推送到blog仓库，并发布到线上

npm run push # 直接三板斧push到blog-src仓库
```


## 文章封面图的选择

因为 hexo-theme-matery 使用的随机选择文章封面图的代码不是很好，选择到的图片索引多有重复，所以给文章增加了几个配置项。相关代码见 `themes/hexo-theme-matery/layout/index.ejs`。

```js
specialImg：使用 themes/hexo-theme-matery/source/medias/specialImg/ 下的图片，用于指定符合文章主题的图片。
changeRandomImg：使用 themes/hexo-theme-matery/source/medias/featureimages/ 下的图片，用于对随机选择的图片不满意时进行指定更换。
img：通过 url 指定图片。
```




