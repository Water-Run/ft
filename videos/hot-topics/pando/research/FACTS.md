# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。做法见仓库 `docs/guides/research.md`：读原始来源、做独立交叉核查；模型输出、记忆与搜索摘要只作线索。待核实的内容不能进入定稿，标题、字幕、封面与译文同样要核查。

本片是新闻解读，不做实验。两家的工程博客是一手来源，原文 HTML 与抽出的正文存在 `research/_src/`（不入库）；下表引用原文句子，便于逐句复查。

## 来源

| 代号 | 来源 | 日期 | 获取方式 |
|---|---|---|---|
| **OA** | OpenAI 工程博客《Scaling Git at OpenAI》，作者 Aaron Friel、Taylor Blau、Ted Nyman。https://openai.com/index/scaling-git-at-openai/ | 2026-11-02 | 2026-11-03 用 curl 下载全文 HTML（`_src/openai.html`），抽出正文（`_src/openai.txt`） |
| **AN** | Anthropic 工程博客《Redesigning source control at Anthropic》，作者 Nick G. 与源码控制团队。https://www.anthropic.com/research/redesigning-source-control | 2026-10-13，10-15 更新 | 2026-11-03 用 curl 下载全文 HTML（`_src/anthropic.html`），抽出正文（`_src/anthropic.txt`） |
| **TW** | @OpenAIDevs 推文。https://x.com/OpenAIDevs/status/2117408792346509663 | 2026-11-03 00:09:30 UTC | 2026-11-03 经 api.fxtwitter.com 读取（x.com 对自动抓取返回 402） |
| **NS** | The New Stack，Frederic Lardinois《OpenAI built itself a new Git backend, too》。https://thenewstack.io/openai-pando-git-backend/ | 2026-11-02 | 只读到标题与日期，正文未取得；只用于说明媒体把两件事并提 |

## 对象与解释路径

两家公司各自的主代码仓库（monorepo，全公司共用的一个大仓库）都用 Git 管理（OA 开篇；AN-2）。AI 编程智能体让推送、拉取、合并的次数暴涨（OA-3、AN-1、AN-3），传统 Git 服务方式的两处默认做法成了瓶颈：所有写入排一个总顺序（OA-6），以及为每个拉取者单独计算打包（OA-7）；Anthropic 另从「客户端都在线」角度诊断（AN-4）。

两家的解法：
- OpenAI 的 Pando 保留 Git 协议与客户端，只重写服务端：每个分支各自串行、互不相干的分支并行（OA-9、OA-10）；复用推送时收到的包，经区域缓存下发（OA-11、OA-12）。
- Anthropic 的 Scion 离开 Git，自研客户端与服务端：客户端总在线、按需取数（AN-6）；提交与合并在服务器完成，没有推送（AN-7）；内容寻址、数据不变，多层缓存（AN-8、AN-9）。

共同点：不再让整个仓库的写入排一条队（OA-6、OA-10；AN-7 的「lock-free」与对全局 ref 状态的回避）；存好的数据不再改动，所以能放心缓存，命中率都在 99% 以上（OA-11、OA-12；AN-8、AN-9）。

## 逐条事实

### 背景与人物

| 编号 | 陈述 | 原始出处与定位 | 状态 |
|---|---|---|---|
| B1 | Anthropic 在 2026-10-13 发文，宣布用自研的 Scion 替换主代码仓库的 git，迁移用时五个月 | AN 首段后：「we built Scion, an in-house version control system, and fully migrated our monorepo from git in five months.」页头 Published Oct 13, 2026 | 2026-11-03 已核 |
| B2 | OpenAI 在 2026-11-02 发文公布 Pando，「a new backend for Git repositories」，现在承载 OpenAI monorepo 的全部开发 | OA 页头 November 2, 2026；首段「We built Pando, a new backend for Git repositories … Pando now powers all development in OpenAI's monorepo.」 | 2026-11-03 已核 |
| B3 | @OpenAIDevs 于 2026-11-03 00:09:30 UTC（北京时间 08:09）发推介绍 Pando；抓取时约 41 万次浏览 | TW | 2026-11-03 已核；互动数据会变，进片前重查或不用 |
| B4 | 两次发布相隔 20 天（10-13 至 11-02），口语称「三周」 | B1、B2 日期相减 | 已算 |
| B5 | OpenAI 的产品包括 ChatGPT 与 Codex；Anthropic 的产品包括 Claude 与 Claude Code | OA 页面导航「Try ChatGPT」、正文多处 Codex；AN 页面「Try Claude」、Topics「Claude Code」、相关文章《The making of Claude Code》 | 2026-11-03 已核 |
| B6 | Git 已有二十多年历史；起源于用电子邮件交换内核补丁的社区 | OA：「Git grew out of a community that exchanged patches to the kernel via email. For more than two decades, developers have adapted their tools around Git」；AN：「a large part of why git became the standard」「nearly two decades scaling the platform for millions of developers」 | 2026-11-03 已核。「二十多年」取 OA 的说法 |
| B7 | Git 是去中心化的：每一份克隆都是完整、自足的仓库，断网也能看差异、历史与追溯，检出任意版本 | AN「Git is a decentralized system: every clone is a complete, self-contained repository that can compute diffs, read history and blame, and check out any revision while fully offline.」 | 2026-11-03 已核 |
| B8 | 媒体把两件事并提：The New Stack 标题为「OpenAI built itself a new Git backend, too」 | NS 标题 | 只核了标题 |

### OpenAI · Pando

| 编号 | 陈述 | 原始出处与定位 | 状态 |
|---|---|---|---|
| OA-1 | Pando 保留与 Git 协议和客户端的兼容，工程师和智能体照常使用 Git；迁移期间没有中断工程工作 | OA 首段「without interrupting any engineering work or changing how our team uses Git」；第二段「retaining compatibility with the Git protocol and client, enabling both our engineers and agents to seamlessly adopt Pando」 | 已核 |
| OA-2 | 动机：要扩展到 Codex 带来的并发工作量 | OA 开篇「we needed to revamp our source control system to scale to the level of concurrent work that Codex makes possible.」 | 已核 |
| OA-3 | 一个工程师现在同时有几项改动等着跑 CI，每次推送又会让好几个任务去拉取同一个提交 | OA「One engineer now has several changes ready for CI at once, and each push can set several jobs fetching the same commit.」 | 已核 |
| OA-4 | 大约从去年年底起，支撑 monorepo 的系统跟不上：拉取和推送慢、合并失败，可靠性有时低于 90% | OA「Starting around the end of last year, the systems supporting our monorepo were struggling to keep up. We suffered slow fetches and pushes along with failed merges, with reliability at times falling below 90%.」 | 已核。「去年」指 2025 年 |
| OA-5 | 一次推送 = 把本地的提交打成一个包（packfile）交给服务器，请求移动分支；拉取时服务器找出客户端缺的对象，打成包发回 | OA「Git object storage primer」一节 | 已核 |
| OA-6 | 对仓库全部写入强加一个总顺序的系统，会让推送不相干分支的人互相等待 | OA「Systems that impose a single order on all writes to a repository can make pushes to unrelated branches wait on one another.」；「Repository-wide consistency: … pushes to unrelated branches contend on a single coordination point.」 | 已核 |
| OA-7 | 两个本地历史不同的客户端拉同一分支时，服务器可能要为每人生成一份不同的包；生成要耗 CPU 与磁盘 I/O，难以支撑大量读者 | OA「Unique packfiles for every client: … the server may need to generate a different pack for each … Creating these responses costs CPU and disk I/O, making it difficult to scale to high volumes of readers.」 | 已核 |
| OA-8 | Pando 的两个目标：写入可水平扩展、针对大量分支的并发推送优化；读吞吐最大化，让客户端跑满带宽 | OA 首段 | 已核 |
| OA-9 | Pando 让每个分支的更新各自协调，不相干分支可以并行；只有同时推同一个分支才会冲突 | OA「Pando coordinates updates to each branch independently. Updates to unrelated branches can proceed in parallel」；「Clients only conflict when pushing to the same ref simultaneously.」 | 已核 |
| OA-10 | 代价：同时读几个分支的人，看到的可能是不同时间点的样子；实际上用户和智能体并不在意全局顺序，只依赖单个分支的更新顺序 | OA「The tradeoff is that a reader looking at several branches can see them at different points of time.」；「In practice, users and agents are agnostic to the global ordering of ref updates, and instead depend on the order of updates to a single reference.」原文称这种一致性为因果一致性（causal consistency） | 已核 |
| OA-11 | 推送上来的包作为不可变的 blob 原样存入对象存储；拉取时复用这些包，客户端可能会下载一些已有的对象，但服务器能用很少的计算把同一份字节发给很多客户端 | OA「Pando stores the incoming packfile as an immutable blob in a blob store.」；「Pando reuses packfiles … A client may download some objects it already has, but the server can serve the same bytes to many clients with little computation.」 | 已核 |
| OA-12 | 包由区域缓存服务 Express 下发，缓存命中率超过 99% | OA「We use consistent hashing to route requests for a packfile to Express servers, with cache hit rates of over 99%.」 | 已核 |
| OA-13 | 中位推送延迟降低近 80%（同文另一处写「近 5 倍」）；推文写「~80%」 | OA「Switching to Pando improved merge reliability and reduced the latency of the median push by nearly 80%.」；首段「cut median push latency by nearly 5x」；TW | 已核。片中只用「近八成」一种说法 |
| OA-14 | 每天交付近 1 PB Git 数据，只用少量 CPU 核；单小时最高送出超过 57 TB，99% 以上来自本地磁盘缓存 | OA「Pando can deliver a petabyte of Git data per day with just a handful of CPU cores. Pando has served more than 57 terabytes of Git packs in a single hour」；首段「nearly a petabyte of Git data per day」 | 已核。1 PB = 1000 TB |
| OA-15 | 用 Codex 构建，从立项到上线 10 周；核心由一名工程师设计，由智能体团队实现，由几名工程师部署；4 月开始承接生产流量；用 Rust 编写 | OA「We built Pando with Codex, moving from kick-off to production, in just 10 weeks. The core of Pando was designed by a single engineer, implemented by teams of agents, and deployed by a handful of engineers. Pando began serving production traffic in April of this year」；「we chose to implement Pando in Rust」 | 已核 |
| OA-16 | 对 Git 客户端的改进有几项已进入上游 Git，其余在 OpenAI 公开的 Git 仓库里 | OA「Several of these improvements are already in upstream Git, and many others in our public repository.」https://github.com/openai/git | 已核 |
| OA-17 | Pando 本身没有开源；OpenAI 说正在探索向用户分享相关技术的方式 | OA「We're currently exploring ways to share the technology that makes Pando possible with our users.」全文无开源声明 | 已核 |
| OA-18 | 迁移时先把 Pando 作为旧系统的读写代理，两边同步，零停机切流量 | OA「Deploying Pando」一节 | 已核（片中未用） |

### Anthropic · Scion

| 编号 | 陈述 | 原始出处与定位 | 状态 |
|---|---|---|---|
| AN-1 | 2026 年 5 月平均每天合并约 2,500 次代码改动；9 月超过每天 30,000 次 | AN「In May 2026, Anthropic averaged around 2,500 code changes merged per day; as of September, we merged over 30,000 per day.」 | 已核 |
| AN-2 | 写代码已不是瓶颈；瓶颈是为人的规模建造的开发基础设施：源码控制、构建与 CI | AN 首段「At Anthropic, coding is no longer the bottleneck … The bottleneck, now, is all of the developer infrastructure built for human scale: source control, builds, and CI.」 | 已核 |
| AN-3 | main 分支历史近 100 GB，压缩后的工作副本超过 25 GB；CI 每天约 2,500 万次检出代码（不含开发环境、智能体沙箱与研究任务）；按朴素方式拉取，每天会超过 600 PB 的 git 流量 | AN「The history of our main branch alone is almost 100 GB, and a compressed working copy is over 25 GB. We perform on the order of 25 million code checkouts per day for CI … Fetched naively, that would be over 600 PB of git traffic per day.」 | 已核。600 PB 是原文的估算，不是实测；600 PB = 60 万 TB |
| AN-4 | 高峰时运维几百个内部 git 镜像应付负载；他们像多数公司一样把 git 当成只有一份权威副本的集中式系统来用，而几乎所有客户端都是天然在线的智能体和任务；让 git 擅长分布式离线工作的特性，反而妨碍了扩展 | AN「at our peak, we operated several hundred internal git mirrors」；「we were using git as a centralized system with one authoritative copy, but nearly all of our clients were agents and jobs that are online by definition. The properties that make git excellent for distributed, offline work were actively undermining our ability to scale」 | 已核 |
| AN-5 | Anthropic 自称用 Claude 写软件的量远超几乎任何公司，所以常常最先发现为人设计的工具在哪里吃紧 | AN「Anthropic uses Claude to write software far more than almost any other company, so we're often the first to see where tools built for human scale start to strain.」 | 已核。是 Anthropic 的自述，片中须说明是它自己说的 |
| AN-6 | 原则：客户端永远在线；客户端只保留有限的本地缓存，需要数据时再取 | AN「Clients are always online. … have clients fetch data when they need it.」；「The client maintains a bounded local object cache」 | 已核 |
| AN-7 | 每次提交、变基、合并都在服务器上完成，所以没有东西需要推送；提交必须廉价、增量、无锁 | AN「In Scion, every commit, rebase, or merge happens on the server, so there's nothing to push」；原则标题「Commits must be cheap, incremental, and lock-free.」；「global state that every server has to agree on is a looming scaling problem」 | 已核 |
| AN-8 | 所有数据按内容寻址，存进去就不再改变，任何服务器都能直接缓存，不必和其他服务器核对 | AN「All source control data is content-addressed, so a piece of data never changes once it's stored, and any server can cache it without checking with the others.」 | 已核 |
| AN-9 | 三层：每个节点一个 scion-daemon，每个地区的 scion-cache，权威的 scion-server（读 Spanner 或云存储）；每一层缓存命中率都超过 99% | AN「Scaling Scion」一节；「Each tier of this system maintains a cache hit rate of over 99%」 | 已核 |
| AN-10 | Scion 基础设施的 CPU 与内存需求比原先的 git 镜像设施小 200 倍；CI 和研究任务检出代码快两个数量级（几秒而不是几分钟）；CI 省下 25% 的 CPU | AN「Our Scion infrastructure footprint is now 200x smaller than our previous git mirroring infrastructure in terms of CPU and memory requirements. CI and research jobs check out code two orders of magnitude faster (in seconds rather than minutes) … CI alone realized a 25% CPU capacity win.」 | 已核 |
| AN-11 | 七个人的团队造了 Scion 和代码审查工具 Antique 以及半打相关系统，五个月完成迁移；同期每天合并的代码量涨了 10 倍 | AN「A team of seven people built both Scion and Antique … not to mention half a dozen related systems, and fully migrated to them in five months. We did all this while the volume of code merged per day increased by 10x.」 | 已核 |
| AN-12 | Claude 写代码的能力既是造成这一局面的原因，也是能快速造出这套系统的原因；参与的工程师都认为 Claude 写代码比自己强，工程师的作用常常是对 Claude 说「不」 | AN「Claude's ability to write code was both what put us in this situation in the first place and how we were able to quickly build a high-quality, scalable system to deal with it.」；「All of the engineers who worked on this system would now rate Claude as better at writing code than them.」；「the role of the engineers was to tell Claude "no."」 | 已核 |
| AN-13 | Scion 绝不是适合普通用途的 git 替代品，只对极其庞大的 monorepo 有意义；它与 git 差别很大，很难做成对其他组织普遍有用的形式 | AN「Scion is by no means a suitable replacement for git for general use. The concepts we've outlined here really only make sense for truly enormous monorepos」；「it's difficult to offer Scion in a form that would be broadly useful to other organizations」 | 已核 |
| AN-14 | Anthropic 认为 git 服务器不必与 git 客户端同一个做法，已有新的服务器架构能大幅改善扩展性 | AN「A git server doesn't have to work the same way as a git client does; novel server architectures exist that provide significant scaling improvements.」 | 已核。片中不暗示 Pando 是对此的回应：Pando 4 月已上线（OA-15） |
| AN-15 | Anthropic 预计这类问题会在未来 6 到 12 个月变得更普遍 | AN「we anticipate that this class of problems will become more commonplace over the next six to 12 months」 | 已核 |
| AN-16 | 这个项目让他们重新审视其他为人的规模设计的流程，例如合并队列与 CI | AN「This project prompted us to take a very hard look at other workflows designed for human scale. A proper merge queue, for example, doesn't make much sense at agent scale. What does CI even mean when hundreds or even thousands of changes can merge while tests are running?」 | 已核 |
| AN-17 | Scion 的客户端叫 scn，它的取数协议在几个重要方面偏离 git | AN「Scion's scn client deviates from git's fetch protocols in several important ways」 | 已核 |
| AN-18 | 致谢前人：Google 的 Piper 与 Meta 的 Sapling；10-15 更新的脚注写明 Sapling 的服务端 Mononoke 开创了 Scion 用到的许多技术，尤其是 Bonsai 数据模型 | AN 正文与脚注 02；页头「Updated October 15 to include more detail on the projects that pioneered many of the techniques we use in Scion.」 | 已核 |
| AN-19 | 用 Claude Mythos Preview 重写 git→Scion 的导入管线，内存降为 1/20、速度快 4 倍 | AN「it produced a version that consumed 20x less memory and was 4x faster」 | 已核（片中未用） |

### 共同点（由上面的条目归纳）

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| C1 | 两家都不再让整个仓库的写入排成一条队 | OA-6、OA-9；AN-7（无锁、没有推送、回避全局状态） | 归纳，措辞已对照原文 |
| C2 | 两家存进去的数据都不再改动，因此能放心缓存，命中率都在 99% 以上 | OA-11、OA-12；AN-8、AN-9 | 归纳 |
| C3 | 一家保留 Git、改进还回馈上游 Git；一家离开 Git、只为自己的巨型仓库 | OA-1、OA-16；AN-13 | 归纳 |

## 取证中发现、没有进入成片的事实

- Mononoke 署名争议：前 Meta 的 Mononoke 开发者在 10 月 14 日前后发文，指 Scion 的设计与 Mononoke 高度重合而原文只致谢 Sapling；Anthropic 作者在 Hacker News 回应并补了脚注。只读到二手转述（ai-tldr.dev、zeli.app、explainx.ai），原帖与 HN 讨论串未核。一手可核的只有 AN 的 10-15 更新说明与脚注（AN-18）。片中不讲争议本身。
- OpenAI 用 GPT-6 Astra 让智能体写 Lean 与 TLA+ 做形式化验证（OA「Building Pando」）。
- Pando 推送时只通告 trunk 分支；中位包小于 20 KiB，P99 小于 3 MiB；后台把小包按 L0–L4 逐级合并（OA）。技术细节，超出本片深度。
- Pando 与 Scion 的命名由来，两篇原文都没有解释。

## 复核

未做。成片后逐句、逐画面再核。
