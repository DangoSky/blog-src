# 确保脚本抛出遇到的错误
set -e

git add -A
git commit -m 'update blog'
git push origin master
