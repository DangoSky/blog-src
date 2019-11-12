---
title: Git常用命令
date: 2019-09-03 00:36:03
tags: Git
categories: Git
summary: 整理一些常用的 Git 命令。
img: https://raw.githubusercontent.com/DangoSky/practices-for-web/master/images/11.jpg
---

在头条实习的这八周里，刚开始没少因为我对 Git 掌握严重不足而挨 mentor 训过，所以在这里记录一些比较常用的 Git 操作。

# 合并多个commit

假如我们现在在本地仓库提了3个 commit，就像这样：

![](1.png)

如果我们直接这样 push 的话，会产生三个提交记录，但在工作中我们都会把同一个 feature 的 commit 合并成一个再 push 到远端，所以这时候我们就需要把 test：one、test：two、test：three 这三个提交合并成一个了。具体操作是：

1. `git rebase -i cbd7376f88cab83c2913a4e5cf6fa3066ac973b9`

这里的 commitID 是指我们想要开始合并的前一个 commit（不参与到本次的合并操作中）。

2. 接着进入到命令模式:

![](2.png)

前面几行是我们要进行合并的 commit 信息，以 # 开头则表示是注释。这里我们只需要使用到两个命令：

- `pick`：表示这个 commit 将会被提交。
- `squash`：表示这个 commit 会被合并到前一个 commit 中去。

在修改之前，得先按 **i 键** 进入到编辑模式，根据需要修改要合并的 commit 前面的命令即可。修改完成后按 **esc** 键回到命令模式，输入 **:wq** 保存并退出。

3. 最后会进入到 commit message 的编辑界面：

![](3.png)

默认情况下，新生成的 commit message 包含了要合并的 commit 的 commit message，如果不想这样的话可以进入到编辑模式修改，之后再保存退出即可。操作完毕后再使用 git log 查看你就可以发现这三个 commit 已经被合并成一个了！

![](4.png)

# 查看操作日志

`git reflog` 和 `git log` 都可以用来查看日志，但各有侧重。git log 更多是用来查看我们的提交记录，比如提交日期、commit message 等。而 `git reflog` 更多是用来查看操作记录，记录我们使用了什么命令做了什么事，借此可以查看已经被删除的 commit 记录和 reset 的操作。假如我们想撤销之前的某次操作，我们就可以通过 `git reflog` 找到那次操作的 commitId，再使用 `git reset` 回退回去。

![](5.png)

# 暂存修改

在每次 commit 和 push 之前我们都需要先 `git pull` 以防后续的提交和远端仓库产生冲突，但这时候会报 `error: cannot pull with rebase: You have unstaged changes` 的错误，它会提示我们在拉取代码之前需要先 commit 或者 stash 代码。这时候我们就需要先暂存一下代码了，执行 `git stash` 让其回到上次 commit 时的状态，等拉取完成后再恢复我们刚才暂存的代码 `git stash pop`。我们可以暂存多次代码，所以我们也可以通过 `git stash list` 查看暂存区的暂存情况，并由 `git stash apply stash@{该次暂存对应的标号}` 来取出特定的暂存内容。（有时候我们开发到一半需要紧急开发另一个 feature 或是修某个 bug，也可以 `git stash` 暂存目前写一半的代码，等紧急情况处理完成后再恢复暂存继续开发）

# 撤销更改

有时候我们把代码改乱了，想要直接恢复到之前的状态的话，就可以使用 `git checkout -- <文件名>` 来删除某个文件中的更改内容，使其回到上一次提交时的状态。但这只适用于我们还没有把代码提交到暂存区（也就是还没有 `git add`）的情况。如果我们已经把代码提交到了暂存区的话，就需要先使用 `git reset HEAD <文件名>` 撤销该文件的暂存，再执行 `git checkout -- <文件名>` 命令。

# 撤销提交

- 如果只是提了 commit 还没有 push 的话，我们只需要 `git reset <版本号>` 回到提交前的状态就可以了。但默认下 `git reset` 只是撤销了这次提交记录而已，如果我们还需要在 IDE 中也删除该次提交的代码，就要使用到 `git reset --hard <版本号>` 了。

- 如果该 commit 也 push 到了远端仓库的话，我们先 `git reset --hard <版本号>` 撤销了本地的提交后，还需要撤销远端的提交。我们可能会直接使用 `git push origin <分支名>` 来覆盖掉远端的提交记录，但这样会提示本地的版本落后于远端的版本而无法成功 push，所以就需要 `git push origin <分支名> --force` 来强制 push，完成后就可以看到远端的该次提交和相关的代码修改都已经被撤销了。

# 补充提交

如果使用 Gerrit 的话，我们在提交代码后往往都会让其他人 review，确认没有问题后才把提交合进 master，如果有问题的话则要继续修改代码。当我们修改完代码后常常是使用 `git commit --amend` 把修改的内容追加在之前的提交上，最后形成一个完整的提交就可以了。如果提 `commit --amend` 时不需要修改 commit message 的话，可以直接 `git commit --amend --no-edit` 来跳过后续修改 commit message 的过程。除此之外，我们还可以通过 `commit --amend` 来修改提交的 commit message，即 `git commit --amend -m “新提交消息”`。

# 提取提交

在团队合作中，通常每一个 feature / bug 都需要新开一个分支，各个分支相互独立互不相干。然而有一次我把两个 feature 都 commit 在了同一个分支上，这时候就需要先撤销提交再重新创建分支提交了。撤销提交的操作在上面已经说到了，接着我们就需要把旧分支上的提交提取到新分支上。虽然旧分支上的提交已经被我们删除掉了，但我们可以通过 `git reflog` 找到它的 commitId，之后在新分支上执行 `git cherry-pick <commitId>` 就可以把对应的提交提取到该分支上了。

# 其他一些常用命令

- 分支

  - 创建本地分支: `git branch 分支名`
  - 查看本地分支: `git branch`
  - 查看远端分支: `git branch -a`
  - 切换分支: `git checkout 分支名`
  - 创建并切换分支: `git checkout -b branchName`
  - 删除本地分支: `git branch -d 分支名`
  - 合并本地分支: `git merge 分支名（将该分支合并到当前分支）`
  - 本地分支重命名: `git branch -m oldName newName`
  - 将本地分支推送到远端分支: `git push <远端仓库> <本地分支>:<远端分支>`

- pull

  - 将远端指定分支 拉取到 本地指定分支上: `git pull origin <远端分支名>:<本地分支名>`
  - 将与本地当前分支同名的远端分支 拉取到 本地当前分支上(需先关联远端分支): `git pull origin`

- push

  - 将本地当前分支 推送到 远端指定分支上: `git push origin <本地分支名>:<远端分支名>`
  - 将本地当前分支 推送到 与本地当前分支同名的远端分支上(需先关联远端分支): `git push origin`

> 如果要 pull / push 的本地分支和远端分支同名的话，可以简写为 `git pull/push origin <分支名>`

---

未完待续。
