# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。
按仓库 `docs/guides/research.md` 阅读原始来源并做独立交叉核查；模型输出、记忆与搜索摘要只作线索。待核实的内容不能进入定稿，标题、字幕、封面与译文同样要核查。
实验脚本与完整回显放在 `research/lab/`；第三方源码、安装包等大文件放在 `research/_src/`（不入库），这里只记版本与获取方式。

## 概要

取证日期：2026-10-20。对象：Anthropic 自建的版本控制系统 Scion，以及「为什么用它替代 Git」这件事。

本片只有一篇一手来源：Anthropic 官方工程博客《Redesigning source control at Anthropic》
（<https://www.anthropic.com/engineering/redesigning-source-control>，发布 2026-10-13，2026-10-15 更新，读取日 2026-10-20）。
Anthropic 内部的规模与收益数字**没有第二路独立数据**：媒体与聚合站只用于定位原文，不作片中依据（见下表「独立印证」列）。
因此本片的定位是「讲它替代 Git 的动因与做法」，不讲可用教程，也不写官方原文没有的实现细节。

**边界（片中必须说清）**：Scion 未公开发布。官方原文明确说它不适用于一般用途、难以做成普遍可用的形态；核查日 2026-10-20，GitHub API 搜索 `scion org:anthropics` 返回 `total_count: 0`，没有公开仓库、下载地址、协议规范或开源许可。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| Anthropic 工程博客《Redesigning source control at Anthropic》 | 发布 2026-10-13，页面元数据 `article:modified_time` 2026-10-15（正文首行注明 10-15 更新） | Web Fetch 取回 HTML，剥离标签后按字符偏移分三段通读全文（正文 22,988 字符），引用均来自该次读取 |
| Git 官方文档（用于印证 Git 一侧的机制） | git-scm.com 当前版本，`git-clone` 页面标注 last updated in 2.54.0 | Web Fetch，读取日 2026-10-20 |
| GitHub REST 搜索 API | 匿名调用 | `GET api.github.com/search/repositories?q=scion+org:anthropics`，读取日 2026-10-20 |
| 抓取与检索环境 | Windows；Node v24.21.0（`fetch`） | 搜索用 DuckDuckGo HTML/Lite 端点定位候选页；定位到 anthropic.com 原文后改读原文 |
| 本片时长 | 150.00 秒（标题即时长，见 `series/in-seconds.md` 的「连续性」） | 系列约定；`project.json` 的 `check.duration` 目前仍是模板值 `[59.9, 60.1]`，须在第 2 步改为 `[149.9, 150.1]` |

## 逐章

### 0 现象：Git 为什么不够用了（正文 0:00–0:25）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 现象 a1 | Anthropic 在 2026 年 5 月平均每天合并约 2,500 次代码变更；到 9 月每天合并超过 30,000 次 | 博客正文第 2 段：「In May 2026, Anthropic averaged around 2,500 code changes merged per day; as of September, we merged over 30,000 per day.」 | 无第二路独立数据（同文转载不计）。同文另有两处自述可互证：「We did all this while the volume of code merged per day increased by 10x.」（What we learned 一节）与图注「Changes merged to our monorepo per day, from January to September 2026.」 | 截至 2026-10-13 发布的官方自述 | 2026-10-20 已读原文；**官方自述、单一来源**，片中须写明是 Anthropic 自己的数字 |
| 现象 a2 | 约四个月里日合并量涨到约 12 倍 | 本片按现象 a1 的两个官方数字推算：30,000 ÷ 2,500 ≈ 12 | 无（推算自官方数字） | 同上 | 2026-10-20 已核；片中写「12 倍（按官方两个数字）」，不得写成官方原话 |
| 现象 a3 | 写代码不再是瓶颈，瓶颈变成了为「人类规模」造的开发基础设施：源码控制、构建和 CI | 博客第 1 段：「The bottleneck, now, is all of the developer infrastructure built for human scale: source control, builds, and CI.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文 |
| 现象 a4 | 主分支的历史接近 100 GB，压缩后的工作副本超过 25 GB；CI 每天要做约 2,500 万次代码检出，天真地拉取相当于每天超过 600 PB 的 git 流量 | 博客「Growing our monorepo」一节：「The history of our main branch alone is almost 100 GB, and a compressed working copy is over 25 GB. We perform on the order of 25 million code checkouts per day for CI… Fetched naively, that would be over 600 PB of git traffic per day.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文 |
| 现象 a5 | Git 是去中心化的：每个 clone 都是完整自包含的仓库，可以离线算 diff、读历史和 blame、检出任意版本 | 博客「Growing our monorepo」：「Git is a decentralized system: every clone is a complete, self-contained repository that can compute diffs, read history and blame, and check out any revision while fully offline.」 | Git 官方文档印证同一机制：git-scm.com/docs/git-clone（`--depth` 浅克隆、`--filter` 部分克隆、`--sparse`）、git-scm.com/docs/git-sparse-checkout（稀疏检出）、git-scm.com/book/en/v2/Git-Internals-Packfiles（packfile）；读取日 2026-10-20 | git-scm.com 当前文档（2.54.0） | 2026-10-20 已核 |
| 现象 a6 | 他们试过常规办法：浅克隆、稀疏检出、promisor 远程、内部 git 镜像和放在对象存储里的快照（seeds）；高峰期运营着数百个内部 git 镜像，镜像越来越难运维，seeds 离主干顶端越来越远 | 博客「Growing our monorepo」：「Git offers tools for working with a slice of a repository, such as shallow clones, sparse checkouts, and promisor remotes… We've used all of them—at our peak, we operated several hundred internal git mirrors… Seeds fell further from the tip of main between refreshes…」 | git-scm.com/docs/git-clone 对浅克隆、部分克隆的说明（2026-10-20 读取） | 同上 | 2026-10-20 已读原文 |
| 现象 a7 | 关键判断：他们其实一直在把 git 当集中式系统用，但几乎所有客户端都是按定义在线的智能体和作业；git 适合分布式离线工作的那些特性，正在阻碍仓库继续长大 | 博客「Growing our monorepo」末段：「we noticed that, like most companies, we were using git as a centralized system with one authoritative copy, but nearly all of our clients were agents and jobs that are online by definition. The properties that make git excellent for distributed, offline work were actively undermining our ability to scale as the repo grew.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文；本片的核心因果句 |

### 1 它是什么：changeset，与「客户端永远在线」的前提（正文 0:25–0:57）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 它是什么 b1 | Scion 是 Anthropic 自建的版本控制系统，团队用五个月把 monorepo 从 git 完全迁移过去 | 博客第 3 段：「we built Scion, an in-house version control system, and fully migrated our monorepo from git in five months.」 | 同一篇的「What we learned」一节自述 5 个月完成迁移（7 人建 Scion 与 Antique） | 截至 2026-10-13 的官方自述 | 2026-10-20 已读原文；官方自述、单一来源 |
| 它是什么 b2 | 设计前提一：客户端永远在线。客户端与协议都围绕一个始终可达的服务器来设计，需要什么再取什么 | 博客「Principles for agent-scale source control」：「Clients are always online. Git assumes that clients work offline and need a complete copy of the repository. Since nearly all of our clients are agents and jobs, we designed Scion's client and protocols around a server that is always reachable, and have clients fetch data when they need it.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文 |
| 它是什么 b3 | 设计前提二：客户端—服务器不对称。服务器回答文件历史与 blame、创建 commit、执行 merge 与 rebase；客户端只维护有界的本地对象缓存、把工作副本写到磁盘、监视文件系统变化，几乎不自己算什么，因此本地需要的数据少得多 | 博客同节「Client-server asymmetry.」全段 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文 |
| 它是什么 b4 | 工作单元是 changeset：预写式日志（write-ahead log）里的一条记录，替代 git 的 commit | 博客「Data structures」：「In Scion, the unit of work is a "changeset," an entry in a write-ahead log. A changeset stores most of what you'd expect from a commit in git.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文；「write-ahead log（预写式日志）」为译法，英文原词保留在 FACTS |
| 它是什么 b5 | git 的 commit 指向一个 tree；changeset 存的是相对第一个父提交发生变化的文件列表，加上指向 blob 存储中压缩文件内容的内容寻址指针 | 博客同节：「But where a git commit stores a pointer to the tree, a changeset stores a list of the files that changed relative to its first parent, along with content-addressed pointers to the compressed file contents in blob storage.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文 |
| 它是什么 b6 | changeset 在服务端创建，处处立即可用；因此没有 packfile 要接收、没有加锁或跨服务器协调、没有要挪动的 ref | 博客同节：「Changesets are created server-side and are available everywhere, instantly.」与「there are no packfiles to accept, no locking or cross-server coordination, and no refs to move around.」 | git-scm.com/book/en/v2/Git-Internals-Packfiles 印证 git 一侧确有 packfile 机制（2026-10-20 读取） | 同上 | 2026-10-20 已读原文 |
| 它是什么 b7 | ref 仍然支持，但创建与读取 changeset 都不涉及它；移动一个 ref 是对单行 Spanner 记录做一次 compare-and-swap，与创建 changeset 分开进行 | 博客同节：「Scion does technically support refs, but since neither creating nor fetching commits involves them, moving one is a compare-and-swap on a single Spanner row that happens separately from creating changesets.」 | 无第二路独立数据（Spanner 官方文档在本轮抓取中未能取到，见「待核实」一节） | 同上 | 2026-10-20 已读原文；具体 Spanner 表结构未公开，片中不得展开 |
| 它是什么 b8 | 派生数据：changeset 只记「什么变了」，答不了「谁最后改了这行」「哪些提交碰过这个文件」。Scion 另外建专门的 file blame、path history 结构，以及提交图的 skip list；这类数据统一叫「派生数据」，用同一套机制递归算出来，可选择立即算或延后算，客户端看不到内部结构因而可以单独优化 | 博客同节第三段与「This mechanism has three benefits.」全段 | 官方脚注 2 指出派生数据的做法来自 Meta 的 Sapling 服务端组件 Mononoke（Bonsai 数据模型）：「Specifically, the server component of Sapling, Mononoke. It pioneered many of the techniques we use in Scion, in particular the Bonsai data model.」 | 同上 | 2026-10-20 已读原文；官方原文亦把 Mononoke/Bonsai 列为来源，可作「不是凭空发明」的历史注脚 |
| 它是什么 b9 | 官方脚注：把合并产生的改动记成「相对第一个父提交」是一种风格选择；在 monorepo 的主干式开发里，人们只关心主干上那些提交的历史与 blame | 博客脚注 1：「Storing changed files relative to the first parent of a merge is a stylistic choice; in practice, we've found that people only care about history or blame for commits on the main line in trunk-based development in a monorepo.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文；不进入画面时不必讲，讲解第一个父提交时也不能说成「必须」 |

### 2 三个关键做法（正文 0:57–1:52）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 做法一 c1 | 提交在服务端发生：每个 commit、rebase、merge 都在服务器上做，所以没有东西可 push；但每次都得够快——创建 commit 与更新下游数据结构的成本必须随「这次改动有多大」增长，而不是随仓库有多大增长 | 博客「Commits must be cheap, incremental, and lock-free.」全段：「In Scion, every commit, rebase, or merge happens on the server, so there's nothing to push… The cost of creating a commit and updating its downstream data structures has to scale with the size of the change, not the overall size of the repo, or the server can't keep up.」 | 无第二路独立数据 | 截至 2026-10-13 的官方自述 | 2026-10-20 已读原文 |
| 做法一 c2 | 推导：每类操作的成本只与改动量成正比，是这套做法能撑住 3 万次日合并的算术前提 | 本片按 c1 的陈述归纳（成本 ∝ 改动大小，不 ∝ 仓库大小） | 无（推算自官方陈述） | 同上 | 2026-10-20 已核；片中作为「原因—做法」一句带过，不加新数字 |
| 做法二 c3 | 全部源码控制查询都开成 API：一小队 Scion 服务器提供取 changeset、算 diff、找 merge base、取 blob 等任何客户端需要的操作；所有数据内容寻址，存下就不变，任意服务器都能缓存而不用与其他服务器确认，于是可以水平扩展 | 博客「Scaling Scion」：「A small fleet of Scion servers provides source control APIs for any operation a client needs, such as getting changesets, computing diffs, finding merge bases, and fetching blobs. All source control data is content-addressed, so a piece of data never changes once it's stored, and any server can cache it without checking with the others.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文 |
| 做法二 c4 | 因此 CI 任务不必再维护本地仓库：需要「某个提交与它的 merge base 之间的 diff」时直接问服务器；很多写入负载也能完全走 API、跳过检出 | 博客「The working copy is optional, and sparse by design.」：「a CI job that needs the diff between a commit and its merge base, for example, can ask the server for it. The same goes for writes: many write workloads can also skip the checkout and function entirely via API.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文 |
| 做法二 c5 | 原文还提到：内部的自动 bisect 与 revert 流水线，若没有这种廉价、可编程的源码控制访问，规模上就不现实 | 博客「A comprehensive source control service can power many novel applications.」：「Many internal tools, such as our automated bisect and revert pipelines, wouldn't be practical at scale without this cheap, programmatic access to source control.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文；bisect 是 git 既有概念，片中提到时须一句话说明「在提交历史里二分定位问题提交」 |
| 做法三 c6 | 三层缓存：客户端通过 socket 跟节点上的 scion-daemon 通信；daemon 为整个节点存对象，从定期刷新的快照起步，只跟本区域的 scion-cache 通信；cache 直接从内存按 daemon 要消费的磁盘格式流出对象，不必算缺失对象也不必做 delta 压缩；cache 缺对象时问权威的 scion-server，后者按需从 Spanner 或云存储读 | 博客「Scaling Scion」第三、四、五段 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文 |
| 做法三 c7 | 三层对同一套协议响应同样的 RPC，客户端不需要知道缓存拓扑；但严格强制分层，为的是隔离故障域——一个区域的 scion-cache 出问题不该压垮上游 scion-server | 博客同段：「The scion-daemon, scion-cache, and scion-server all respond to identical RPCs for this protocol, so the client doesn't need to know the cache topology… we strictly enforce the tiering to isolate failure domains.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文 |
| 做法三 c8 | 每一层的缓存命中率都超过 99%，且都不需要长生命周期状态，需要扩容很容易 | 博客同段：「Each tier of this system maintains a cache hit rate of over 99% and does not require long-lived state, so it's easy to scale up if needed.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文；官方自述、单一来源 |
| 做法三 c9 | 稀疏与虚拟化检出：协议以稀疏检出为中心，只包含客户端要的目录；虚拟化检出按需把文件实例化到磁盘，客户端只为自己真正读过的内容付费 | 博客「The working copy is optional, and sparse by design.」末段：「Scion's protocol is centered around sparse checkouts, which only contain the directories the client asks for, and virtualized checkouts, which materialize files on demand, so when a job does need files on disk, the client only pays for what it actually reads.」 | git-scm.com/docs/git-sparse-checkout 印证 git 一侧已有稀疏检出机制（2026-10-20 读取）；「虚拟化检出」是 Scion 侧的说法 | 同上 | 2026-10-20 已读原文 |
| 做法三 c10 | 附带：scn 客户端的协商不告诉服务端「你已经有了什么」，只谈客户端想要的 tree 与 blob；每次请求的对象都不变，任何缓存都能回答，所以稀疏和虚拟化检出不需要特殊支持 | 博客「Scaling Scion」第二段：「Scion's negotiation doesn't tell the server what the client already has; instead, it operates exclusively on trees and blobs the client wants.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文 |
| 权限与评审 c11 | Scion 支持仓库级的细粒度访问控制，也能把权限施加到单个目录，从而在保住 monorepo 好处的同时保护最敏感的代码；配套的代码评审工具 Antique 能表达对审批的复杂语义约束，把「只改注释」和「敏感的逻辑改动」区分开 | 博客「We laid the groundwork for new forms of monorepo security.」：「It supports rich access control on repositories, as well as the ability to apply permissions to individual directories… the code review tooling we built can express complex semantic constraints on approvals, which lets us differentiate simple things like comment-only changes from sensitive logical changes」；「Antique」在第 3 段首次出现：「a code review surface (called Antique)」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文；Antique 界面与规则细节未公开 |
| 合并队列 c12 | 标准的全局仓库锁在智能体规模下不成立；他们没有复制这套做法，转而投入合并后与部署前的自动测试；并发改动确实会冲突，但 Claude 通常比人类更快发现并修好冲突 | 博客「A new level of operational excellence is possible.」：「We've been unable to effectively replicate the industry standard of a global repository lock on the merge queue, so instead, we've invested in post-merge and pre-deploy automated testing. This does mean that concurrent changes can conflict, but Claude can typically fix these conflicts faster than humans can even identify them.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文；这是官方自评，片中不当作独立结论 |

### 3 官方给出的收益（正文 1:52–2:07）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 收益 d1 | Scion 的基础设施占用比原来的 git 镜像基础设施小 200 倍（按 CPU 与内存算） | 博客「Scaling Scion」末段：「Our Scion infrastructure footprint is now 200x smaller than our previous git mirroring infrastructure in terms of CPU and memory requirements.」 | 无第二路独立数据 | 截至 2026-10-13 的官方自述 | 2026-10-20 已读原文；**官方自述、单一来源**，片中须说明这是 Anthropic 自家环境的对比 |
| 收益 d2 | CI 与研究任务检出代码快两个数量级（从分钟级到秒级），为整个机队释放了可观容量；仅 CI 一项就拿到 25% 的 CPU 容量收益 | 博客同段：「CI and research jobs check out code two orders of magnitude faster (in seconds rather than minutes), which frees up a sizable amount of capacity across the fleet; CI alone realized a 25% CPU capacity win.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文；官方自述、单一来源 |
| 收益 d3 | 7 个人建成了 Scion 和 Antique，并完成完全迁移，用了五个月；同期每天合并的代码量增长 10 倍 | 博客「What we learned building Scion」：「A team of seven people built both Scion and Antique… and fully migrated to them in five months. We did all this while the volume of code merged per day increased by 10x.」 | 同文「Merged changes to the Scion and Antique codebases per week, from January to September 2026.」图注互证（同一发布方） | 同上 | 2026-10-20 已读原文 |
| 收益 d4 | 内部早期快照 Claude Mythos Preview 把手写的 git→Scion 摄取管线原型整个重写了一遍：内存少用 20 倍、快 4 倍，同时保留了摄取顺序与数据结构上的隐含不变量 | 博客同节：「We asked it to rewrite the whole thing, and with no further instructions, it produced a version that consumed 20x less memory and was 4x faster, while preserving all of the implicit invariants around ingestion ordering and data structures.」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文；模型名 Mythos Preview 是原文用词，片中提到时照写不猜版本号 |

### 4 边界：它没有公开，也暂时不打算公开（正文 2:07–2:20）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 边界 e1 | Scion 绝不适合拿来替代 git 的一般用途；这些做法只对真正巨大的 monorepo（数万名工程师，或大量智能体在狂写代码）才讲得通 | 博客「Contributing to the wider ecosystem」：「Scion is by no means a suitable replacement for git for general use. The concepts we've outlined here really only make sense for truly enormous monorepos, with either tens of thousands of engineers or swarms of agents prolifically writing code.」 | 无第二路独立数据 | 截至 2026-10-13 的官方自述 | 2026-10-20 已读原文 |
| 边界 e2 | 实际很难把 Scion 做成对别的组织普遍有用的形态：它与 git 分歧显著，公司要迁移整个开发生命周期，还需要自己的代码评审、代码搜索和 CI，而内部版本高度定制、别人难以采用；他们担心做一个面面俱到的公开版本反而没用 | 博客同节：「Practically speaking, it's difficult to offer Scion in a form that would be broadly useful to other organizations. It diverges significantly from git, meaning companies would need to migrate every piece of the development lifecycle, and it requires its own code review, code search, and CI. Our internal versions of these components are highly bespoke…」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文 |
| 边界 e3 | 到核查日没有公开实现可下载：GitHub API 搜索 `scion org:anthropics` 返回 `total_count: 0`，无公开仓库；博客也没有给出下载地址、协议规范或许可证 | 核查记录：`GET https://api.github.com/search/repositories?q=scion+org%3Aanthropics` → `{"total_count": 0, "incomplete_results": false, "items": []}` | 独立于博客的第二路检查（仓库托管平台的公开搜索接口） | 核查日 2026-10-20 | 2026-10-20 已核；片中可写「没有公开实现，外部装不了」 |
| 边界 e4 | 官方原文中未写明的实现细节一律不写：changeset 的表结构、Spanner 的 schema、scion-daemon / scion-cache / scion-server 的协议字段、Antique 的界面与规则、具体模型版本号 | 博客全文通读（22,988 字符）未见这些内容 | — | 2026-10-20 通读结果 | 2026-10-20 已核；列入「不进入定稿」清单 |
| 边界 e5 | 官方给社区的方向是：git 服务器不必和 git 客户端一个样；git 平台可以提供像 Scion 这样全面的服务端 RPC，甚至在各家代码托管平台之间标准化；git 的稀疏与浅克隆特性也可以重新组合 | 博客「Contributing to the wider ecosystem」末段：「A git server doesn't have to work the same way as a git client does… Git platforms can provide comprehensive server-side RPCs like Scion, perhaps even in a standardized way across forges…」 | 无第二路独立数据 | 同上 | 2026-10-20 已读原文；可作结尾一句 |

### 5 结论与片尾（正文 2:20–2:42.5）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 结论 f1 | 本片的结论句：git 的长处是离线、去中心化、每个 clone 都完整；在「几乎所有客户端都是在线的智能体和作业」的仓库里，这些长处反过来成了瓶颈。Scion 的做法是让服务端干重活，让客户端按需取 | 归纳自现象 a5、a7 与它是什么 b2、做法一 c1、做法三 c9；各条出处见上表 | 各条均为官方原文；结论句为本片归纳 | 截至 2026-10-20 | 2026-10-20 已核；归纳句不引入新事实 |
| 片尾 f2 | 片尾约 7.5 秒、无人声，只在画面展示「策划：WaterRun」「参与模型」「开源视频 https://github.com/Water-Run/ft」 | 系列约定（`series/in-seconds.md`「连续性」一节的「片尾」行）；名单见本文件「制作署名」 | — | 片尾时长随本片脚本定稿后复核 | 2026-10-20 记入；**尚未成片，待复核** |

## 文案审查

<!-- 文案稿经指定校对者 WaterRun 人工审查并明确确认后才配音（见 docs/guides/script-review.md）。逐轮记录交审日期、内容 SHA-256、校对记录的链接与结论；逐句意见在 review/NOTES.md 留存，避免维护两份全文。确认之后的实质改动另起一轮。 -->

| 轮次 | 交审日期 | 稿本 | 审查意见与修改 | 结论与日期 |
|---|---|---|---|---|
| | | | | |

尚未交审：`src/js/script.js` 仍是模板骨架，文案须先经 WaterRun 人工审查并明确确认才进入配音。

## 制作署名

策划：WaterRun（依据：project.json 的 production.planner，交付前核对实际参与）。

开源视频：[本片源码](https://github.com/Water-Run/ft)（依据：project.json 的 production.repository；交付前核对公开仓库页面并记录日期与结果）。

<!-- 按实际制作记录填写，涵盖准备、制作、审查等环节；名称与可确认的版本不得推测。服务未披露模型时写明服务、用途与「模型未披露」。片尾、README 与委托片 DELIVERY.md 使用同一名单。 -->

| 参与模型（含可确认的版本） | 实际分工 | 记录依据 |
|---|---|---|
| MiniMax M3.1 Flash（本次会话运行时标识 minimax-M3.1-Flash） | 取证、事实表与开工反馈应用（子任务执行） | 本次制作会话的运行时标识；版本按标识照写，不推测 |
| MiniMax M3.1 Flash（本次会话运行时标识 minimax-M3.1-Flash） | 片单重构、目录搭建与反馈记录校验（主会话） | 本次制作会话的运行时标识；版本按标识照写，不推测 |

其余环节（配音、渲染、封面）尚未开工，片尾名单待成片前核准。

## 复核

<!-- 记录核查范围、日期、依据、发现的问题、更正与复查结论；覆盖三项核心审查、原创与动画完成度、片尾名单。未做的写「未做」，待核查的不得写成通过。 -->

未做：成片尚未产出，本节留待第 8 步按 `docs/guides/acceptance.md` 第 5 节填写。

## 待核实（不进入定稿）

| 事项 | 状态 | 说明 |
|---|---|---|
| Spanner 上 compare-and-swap 的官方文档表述 | 待核实 | 本轮抓取 `cloud.google.com/spanner/docs/transactions` 失败（连接被拒），未能取到一手文档；片中只按 Anthropic 原文说「对单行 Spanner 记录做一次 compare-and-swap」，不展开 Spanner 的一致性模型 |
| 第三方对 Anthropic 内部数字的独立印证 | 无 | 媒体与聚合站（tech-insider.org、cryptobriefing.com、aiwiki.ai 等）只用于定位官方原文，转载不计独立印证，全部不作片中依据 |
| Scion 客户端 `scn` 的公开可用性 | 无公开实现 | 见边界 e3 |
| Anthropic 内部模型名称与版本（Mythos Preview、Claude Tag） | 仅按原文照写 | 原文只给产品名，未给版本号；片中不推测版本 |
