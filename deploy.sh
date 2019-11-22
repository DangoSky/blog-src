# 确保脚本抛出遇到的错误
set -e

var1=`date`

git add -A
git commit -m "update on $var1"
git push origin master
