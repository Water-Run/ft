# 事实表：150 秒速通 GitHub 协作

## 对象与解释路径

对象是 GitHub 平台上的协作机制：没有写权限的人如何给别人的项目提改动。一条完整操作路径：

1. 想改别人的项目，直接推会被拒（没有写权限）→ **Fork** 出自己的副本（F1）。
2. 在副本里开一条**分支**，把这次改动和主线隔开（F2）。
3. 在分支上提交、推送到自己的副本，再对原仓库发起 **Pull Request**；PR 是「请求合并的申请页」，改动在提 PR 之前就已经在分支里（F3）。
4. 维护者在 PR 页上看改动、留意见、跑自动检查；批准后合并，改动才进原仓库主线（F3、F8）。
5. 还没准备好就先开**草稿 PR**（F4）；**Issue** 是说清「要解决什么」的地方，与 PR 共用同一套编号（F5、F6）；`Closes #N` 在合并进默认分支时自动关 Issue，`Refs #N` 只是引用约定（F7）。

关键关系：Fork 解决「没有权限」，分支解决「要隔开」，PR 解决「要被审」。编号属于仓库而不属于人：同一仓库里 Issue 与 PR 共用一套递增编号，不回收；Fork 另有自己的一套。

依据：GitHub 官方文档（2026-11-15 读取，见各条链接）＋公开仓库只读实测（`lab/01_numbering.sh` ↔ `out_01_numbering.txt`）。未解决：一次性测试账号上的全流程动手实验未做（见「待做」）。

## 取证日期、对象与版本

- 取证日期：2026-11-15（UTC+8）。
- 对象：GitHub.com 托管平台的协作功能（Fork、分支、PR、Issue、编号、关联关键词、合并与分支保护）。
- 版本：GitHub 为持续上线的服务，文档页无版本号与更新日期，一律记录读取日期 2026-11-15；REST API 行为以当日实测为准。Primer 设计令牌版本见 `MATERIALS.md`。
- 文档站当日已改版：旧路径多已重定向到新路径，下表引用最终地址。

## 取证环境

| 记录 | 环境 |
|---|---|
| 官方文档引文（F1–F9 各条） | 本机经 web_fetch 读取 docs.github.com 的 text/markdown 原文，2026-11-15；引文为页面原句 |
| 编号实测（F6 各条） | Windows 本机（win32），gh CLI 已登录（只读调用），curl 经系统代理访问 github.com；对象为公开仓库 nodejs/node 及其 fork，未创建任何内容；回显见 `lab/out_01_numbering.txt` |
| Primer 令牌（MATERIALS.md） | gh API 读 primer/primitives 源文件（提交 47736486bf67b2a14ba1ada61fa0f57af29bb875）与 unpkg 的 @primer/primitives@11.10.0 编译产物；见 `lab/out_02_primer_tokens.txt` |

实测未用真实项目、真实账号或内部仓库的内容；nodejs/node 与 LiviaMedeiros/node 均为公开仓库。回显中的会话 Cookie 已去除。

## F1 Fork：没有写权限时的自己的副本

| # | 陈述 | 依据 | 状态 |
|---|---|---|---|
| F1.1 | Fork 是从另一个仓库（称上游仓库 upstream）复制出来的仓库；有自己的设置与权限，仍与上游保持连接 | 官方文档《Forks》§Forks 原句：“Forks are repositories that start as copies of another repository, called the upstream repository. A fork has its own settings and permissions but stays connected to the upstream repository.” <https://docs.github.com/en/pull-requests/reference/forks>（读取 2026-11-15） | 已核（官方文档） |
| F1.2 | Fork 是独立仓库，不是分支：分支属于一个仓库，Fork 是另一个仓库，有自己的协作空间；每个 Fork 可以有自己的分支、成员与讨论、Issue 与 PR、Actions 与 projects、标签与 wiki | 同上 §What makes forks distinct from branches 原句：“A branch is part of one repository. A fork is a separate repository with its own settings and collaboration space.” 及 “Each fork can have its own:” 列表 | 已核（官方文档） |
| F1.3 | 往自己 Fork 里推代码不需要上游仓库的许可 | 官方文档《Pull requests》§Collaborative development models → Fork and pull model 原句：“You do not need permission from the upstream repository to push to a fork you created.” <https://docs.github.com/en/pull-requests/reference/pull-requests>（读取 2026-11-15） | 已核（官方文档） |
| F1.4 | 任何有读权限的人都可以 Fork（只要上游所有者允许） | 同上 §Fork and pull model 原句：“In the fork and pull model, anyone can fork an existing ("upstream") repository if they have read access and the owner of the upstream repository allows it.” | 已核（官方文档） |
| F1.5 | Fork 让人能在不影响上游仓库的前提下提议改动 | 官方文档《Fork a repository》§About forks 原句：“Forking a repository lets you propose changes to a project without affecting the upstream repository.” <https://docs.github.com/en/pull-requests/how-tos/work-with-forks/fork-a-repo>（读取 2026-11-15） | 已核（官方文档） |
| F1.6 | 没有写权限时推不上去：GitHub Desktop 里克隆一个没有写权限的仓库再尝试推送，会直接为你创建一个 Fork | 同上 §Forking a repository（desktop）原句：“In GitHub Desktop, if you clone a repository that you do not have write access to, and then attempt to push a change to the repository, a fork will be created for you.” | 已核（官方文档）；网页端直接 push 被拒的实测回显未取（见「待做」） |
| F1.7 | 边界：Fork 与上游在同一仓库网络里共享 Git 数据；推送到网络中任一仓库的提交，可能从网络中其他仓库（含上游）访问到。Fork 的「独立」指设置、权限与协作空间，不是 Git 对象层面的完全隔离 | 《Forks》§Visibility of forks 原句：“Repositories in the network share Git data and remain connected to the upstream repository.” §Permissions of forks 原句：“Commits pushed to any repository in a network can be accessible from other repositories in that network, including the upstream repository.” | 已核（官方文档）；文案不得说「完全隔离」 |

## F2 分支：与主线隔开的工作线

| # | 陈述 | 依据 | 状态 |
|---|---|---|---|
| F2.1 | 开分支就是开辟一个不影响默认分支的工作空间 | 官方文档《GitHub flow》§Create a branch 原句：“By creating a branch, you create a space to work without affecting the default branch. Additionally, you give collaborators a chance to review your work.” <https://docs.github.com/en/get-started/using-github/github-flow>（读取 2026-11-15） | 已核（官方文档） |
| F2.2 | 分支上的改动在合并之前不会进入默认分支；改错了可以撤回或再改 | 同上 §Make changes 原句：“Your branch is a safe place to make changes. If you make a mistake, you can revert your changes or push additional changes to fix the mistake. Your changes will not end up on the default branch until you merge your branch.” | 已核（官方文档） |
| F2.3 | 有写权限的团队可以不 Fork：共享仓库模型里，协作者对同一个仓库有推送权限，需要改动时就开主题分支 | 《Pull requests》§Shared repository model 原句：“In the shared repository model, collaborators have push access to a single shared repository and create topic branches when they need to make changes.” | 已核（官方文档） |
| F2.4 | 分支名宜短而达意，例如 `increase-test-timeout`、`add-code-of-conduct` | 《GitHub flow》§Create a branch 原句：“A short, descriptive branch name enables your collaborators to see ongoing work at a glance. For example, `increase-test-timeout` or `add-code-of-conduct`.” | 已核（官方文档）；画面标签可用 |

## F3 PR：请求合并的申请页

| # | 陈述 | 依据 | 状态 |
|---|---|---|---|
| F3.1 | PR 是把代码改动并入项目的提议；在合并前讨论与审查这些改动 | 《Pull requests》开头原句：“Pull requests are proposals to merge code changes into a project. A pull request is GitHub's key collaboration feature, letting you discuss and review changes before merging them.” | 已核（官方文档） |
| F3.2 | 顺序：先在分支上提交并推送，再创建 PR 请求反馈；PR 里写清改动摘要与解决的问题 | 《GitHub flow》§Make changes 原句：“Commit and push your changes to your branch.” §Create a pull request 原句：“Create a pull request to ask collaborators for feedback on your changes.” “When you create a pull request, include a summary of the changes and what problem they solve.” | 已核（官方文档） |
| F3.3 | PR 页上有自动检查（测试、构建等）与合并状态（阻塞项、缺少的批准等要求） | 《Pull requests》§Working with pull requests 原句：“The Checks tab shows automated tests, builds, and other validations.” “the merge status highlights blockers, missing approvals, and other requirements before merging. It appears in the pull request header and in the merge box.” | 已核（官方文档） |
| F3.4 | 审查后可以继续提交推送，PR 自动更新 | 《GitHub flow》§Address review comments 原句：“You can continue to commit and push changes in response to the reviews. Your pull request will update automatically.” | 已核（官方文档） |
| F3.5 | 批准后合并，分支的改动出现在默认分支上 | 同上 §Merge your pull request 原句：“Once your pull request is approved, merge your pull request. This will automatically merge your branch so that your changes appear on the default branch.” | 已核（官方文档） |
| F3.6 | 合并需要仓库的写权限：提议的人不一定能自己合并 | 官方文档《Pull request merges》§Merge your commits 原句：“To merge pull requests, you must have write permissions in the repository.” <https://docs.github.com/en/pull-requests/reference/pull-request-merges>（读取 2026-11-15） | 已核（官方文档） |
| F3.7 | 合并后删除分支表示工作完成；PR 与提交历史不会被删，可随时恢复分支或回退 PR | 《GitHub flow》§Delete your branch 原句：“After you merge your pull request, delete your branch. This indicates that the work on the branch is complete…” “Your pull request and commit history will not be deleted. You can always restore your deleted branch or revert your pull request if needed.” | 已核（官方文档）；本集不展开 |

## F4 草稿 PR

| # | 陈述 | 依据 | 状态 |
|---|---|---|---|
| F4.1 | 草稿 PR 不能被合并，也不会自动请求 code owner 审查；用于先分享进行中的工作 | 《Pull requests》§Draft pull requests 原句：“Draft pull requests cannot be merged, and code owners are not automatically requested to review them. Drafts are useful when you want to share work-in-progress without formally requesting reviews.” | 已核（官方文档） |
| F4.2 | 准备好要反馈时，把草稿标记为 ready for review；也可以随时转回草稿 | 同上原句：“When you're ready to get feedback on your pull request, you can mark your draft pull request as ready for review. … You can convert a pull request to a draft at any time.” | 已核（官方文档） |

## F5 Issue：说清「要解决什么」

| # | 陈述 | 依据 | 状态 |
|---|---|---|---|
| F5.1 | Issue 建在仓库里，用来计划、讨论、跟踪工作：bug 报告、新功能与想法等 | 官方文档《About issues》原句：“You can create issues in your repository to plan, discuss, and track work.” “Issues can track bug reports, new features and ideas, and anything else you need to write down or discuss with your team…” <https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues>（读取 2026-11-15） | 已核（官方文档） |

## F6 编号：属于仓库，共用且不回收

| # | 陈述 | 依据 | 状态 |
|---|---|---|---|
| F6.1 | 每个 PR 都是一个 Issue，但并非每个 Issue 都是 PR；Issues 接口会同时返回两者，用 `pull_request` 字段区分 | 官方 REST 文档《REST API endpoints for issues》多个端点（List repository issues、Get an issue 等）下的 Note 原句：“GitHub's REST API considers every pull request an issue, but not every issue is a pull request. For this reason, "Issues" endpoints may return both issues and pull requests in the response. You can identify pull requests by the pull_request key.” <https://docs.github.com/en/rest/issues/issues>（读取 2026-11-15） | 已核（官方文档＋实测 F6.2） |
| F6.2 | 同一仓库里 Issue 与 PR 共用一套递增编号：nodejs/node 的 issues 接口按编号降序返回两者交错的序列（67479 PR、67478 PR、…、67469 Issue、67468 PR、67467 Issue…） | 实测 `lab/out_01_numbering.txt` §2（2026-11-15） | 已核（实测） |
| F6.3 | `/issues/N` 与 `/pull/N` 互相跳转：N 是 PR 时 `/issues/N` 302 到 `/pull/N`；N 是 Issue 时 `/pull/N` 302 到 `/issues/N` | 实测 `lab/out_01_numbering.txt` §8：`issues/67474 → 302 → pull/67474`；`pull/67469 → 302 → issues/67469`（2026-11-15） | 已核（实测） |
| F6.4 | 编号不回收：删除留下的空号一直空着，新内容继续向大号增长。nodejs/node 最近 100 条（67373–67479）有 7 个空号；抽查 67390、67387、67381 均 404，两侧编号存在 | 实测 `lab/out_01_numbering.txt` §2b、§6（2026-11-15）。官方文档《Get an issue》描述删除后的状态码：“If the issue was deleted from a repository where the authenticated user has read access, the API returns a 410 Gone status.”（<https://docs.github.com/en/rest/issues/issues>） | 已核（实测）；注意：实测删除空号返回 404，与文档所述 410 不一致，原因未查明——「编号不回收」的结论不受影响，成片不展示该状态码 |
| F6.5 | 转移的 Issue 旧号永久指向新位置：nodejs/node#67464 已转移到 nodejs/help#5185，请求旧号返回转移后的对象 | 实测 `lab/out_01_numbering.txt` §5；官方文档《Get an issue》原句：“The API returns a 301 Moved Permanently status if the issue was transferred to another repository.” | 已核（实测＋官方文档） |
| F6.6 | PR 的编号属于被提交的目标仓库（base），不属于来源仓库（head）：nodejs/node 的 PR #67472–67474 的 base 都是 nodejs/node，head 分别是 panva/node、LiviaMedeiros/node、Renegade334/node 三个 fork | 实测 `lab/out_01_numbering.txt` §3（2026-11-15） | 已核（实测） |
| F6.7 | Fork 有自己独立的编号序列：LiviaMedeiros/node（nodejs/node 的 fork）里的 PR 是 #1–#4，而上游已到 6.7 万号段 | 实测 `lab/out_01_numbering.txt` §7；《Forks》§What makes forks distinct from branches：“Each fork can have its own: … Issues and pull requests” | 已核（实测＋官方文档） |

## F7 关联关键词：Closes 与 Refs

| # | 陈述 | 依据 | 状态 |
|---|---|---|---|
| F7.1 | 官方关闭关键词共 9 个：close、closes、closed、fix、fixes、fixed、resolve、resolves、resolved；写在 PR 描述或提交信息里，后跟 `#编号`（如 `Closes #10`），可带冒号或大写 | 官方文档《Linking a pull request to an issue》§Linking a pull request to an issue using a keyword 的完整列表与示例（读取 2026-11-15）<https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue> | 已核（官方文档，列表为穷举） |
| F7.2 | 只有关联的 PR 合并进默认分支时，Issue 才自动关闭；目标不是默认分支时关键词被忽略 | 同上 §About linked issues and pull requests 原句：“When you merge a linked pull request into the default branch of a repository, its linked issue is automatically closed.” NOTE 原句：“The special keywords in a pull request description are interpreted only when the pull request targets the repository's default branch. If the pull request targets any other branch, then these keywords are ignored…” | 已核（官方文档） |
| F7.3 | `Refs` 不在官方关键词列表里，也不在自动引用规则里享有任何特殊行为；「Refs #N」只是人的约定，引用效果来自 `#N` 本身 | F7.1 的穷举列表不含 Refs（读取 2026-11-15）；官方文档《Autolinked references and URLs》§Issues and pull requests 原句：“Within conversations on GitHub, references to issues and pull requests are automatically converted to shortened links.”（`#26` 即成链接，无需关键词）<https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/autolinked-references-and-urls>（读取 2026-11-15） | 已核（两份官方文档互证：列表穷举＋自动引用不依赖关键词）；文案表述为「Refs 只是写法约定，不会自动关闭」 |
| F7.4 | 也可以手动关联：PR 侧栏最多手动关联 10 个 Issue；手动关联的可手动解除，关键词关联的要改描述去掉关键词 | 《Linking a pull request to an issue》§Manually linking… 原句：“You can manually link up to ten issues to each pull request.” “Only manually linked pull requests can be manually unlinked. To unlink an issue that you linked using a keyword, you must edit the pull request description to remove the keyword.” | 已核（官方文档）；本集不展开 |

## F8 合并方式与分支保护（边界一句话用）

| # | 陈述 | 依据 | 状态 |
|---|---|---|---|
| F8.1 | 合并有三种方式：merge commit（保留全部提交历史）、squash and merge（压成一个提交）、rebase and merge（逐个提交线性接上）；本集只说「合并」 | 《Pull request merges》各节原句：“all commits from the feature branch are added to the base branch in a merge commit.” “the pull request's commits are squashed into a single commit.” “all commits from the topic branch (or head branch) are added onto the base branch individually without a merge commit.” | 已核（官方文档）；细节留给别的集 |
| F8.2 | 受保护分支可以要求：合并前收到指定数量的批准评审；必需的状态检查全部通过 | 官方文档《About protected branches》原句：“…can require that all pull requests receive a specific number of approving reviews before someone merges the pull request into a protected branch.” “After enabling required status checks, all required status checks must pass before collaborators can merge changes into the protected branch.” <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches>（读取 2026-11-15） | 已核（官方文档） |

## F9 画面标签用：origin 与 upstream

| # | 陈述 | 依据 | 状态 |
|---|---|---|---|
| F9.1 | 同步 Fork 的常规配置里，自己 Fork 的远端名叫 `origin`，上游仓库的远端名叫 `upstream` | 《Fork a repository》§Configuring Git to sync your fork with the upstream repository 原句：“You should see the URL for your fork as `origin` and the URL for the upstream repository as `upstream`.” | 已核（官方文档）；只作画面标签，不进旁白 |

## 未进入成片的事实（备日后更新）

- Fork 的 Issue 功能默认关闭：实测 panva/node、Renegade334/node、LiviaMedeiros/node 三个 fork 均 `has_issues=false`（`out_01_numbering.txt` §7）；官方文档未找到「默认关闭」的明文，只有「每个 fork 可以有自己的 Issues and pull requests」。样本仅 3 个，不构成「默认」的充分证据。
- 仓库网络共享 Git 数据的安全含义（F1.7）：上游所有者可读网络内全部 fork；删除 fork 后贡献仍可能留在网络里（《Forks》§Important security considerations）。
- 间接合并（indirect merge）：head 分支的提交经别的途径进入 base 时，PR 也会被标为 merged（《Pull request merges》§Indirect merges）。
- 关键词关联 PR 评论时，合并引用方也会关闭被引用的 PR（《Linking a pull request to an issue》）。
- 自动引用会生成反向链接，可用 `redirect.github.com` 避免（《Autolinked references and URLs》§Avoiding backlinks）。
- 删除分支后可恢复；PR 可回退（F3.7）。

## 待核实 / 待做

1. **全流程动手实验未做**：简报要求在一次性测试账号与测试仓库里从头走 Fork → 分支 → 提交 → 推送 → PR → 评审 → 合并，并观察编号。本轮只做只读实测（不创建任何内容、不占用真实账号）；写实验留给制作方，需一次性测试账号，不用真实项目与内部仓库。
2. **网页端无写权限推送被拒的回显未取**：F1.6 目前只有官方文档描述（GitHub Desktop 行为）。开场「推不上去」若要用真实回显，在上面的写实验里一并取。
3. **删除空号 404 与文档 410 的差异**（F6.4）：原因未查明；成片不展示状态码，不影响结论。若日后要展示，先重核。
4. 文档页无更新日期：所有引文以 2026-11-15 读取为准；交付前按取证指南对会变化的外部事实重新确认。

## 复核

（成片审查后逐条记录。当前为空。）