# 事实出处：OpenClaw, Hermes 和实现

本文件按场景列出成片（中文、英文两个版本）里的每一项事实陈述及其依据。陈述按旁白句号排列（句号见 `src/js/script.js`）；画面上的数字、日期、引文、源码行与旁白用同一条依据，单独写明的除外。

- **取证日期**：2026-10-06（成片中所有「截至」均指这一天；星标、发布数随时间变化）。源码与文档的补充摘录在 2026-10-07 完成，对象仍是同一对固定提交。
- **对象与版本**：
  - OpenClaw：`github.com/openclaw/openclaw`，固定提交 `195e1cc6c1`（2026-10-05）。
  - Hermes Agent：`github.com/NousResearch/hermes-agent`，固定提交 `4787e4d56f`（2026-10-05）。
  - 飞书官方 Node SDK：`@larksuiteoapi/node-sdk` 的 README（`github.com/larksuite/node-sdk`）。
  - GitHub REST API、npm 注册表、Hugging Face、arXiv、Nous Research 发布页、star-history.com 的星标曲线、作者的 X 帖子（两条）。
- **方法**：接口数据由 `research/lab/01_collect.sh` 取回，回显逐字保存在 `research/lab/out_*`；源码与文档在固定提交上读取，由 `02_extract.py` 摘出片段与引文（`out_10_excerpts.json`、`out_11_quotes.json`，每条带仓库、固定提交、文件与起始行号）；星标曲线由 `04_star_history.py` 从 star-history.com 的图里取采样点；`tools/gen_data.py` 把这些转成画面用的 `src/js/data.js`。场景代码在构建时逐条断言被引的文字确在原文里（`parts.js` 的 `has()`），不符时页面日志报警，`check.js` 会拦下。
- **本表里的行号**：下表「依据」一栏的 `文件:行号` 由取证数据生成，指固定提交上的位置；`docs/…`、`extensions/…`、`src/…`、`VISION.md`、`README.md:56–110` 一类属于 OpenClaw，`website/docs/…`、`agent/…`、`gateway/…`、`plugins/…`、`tools/…`、`hermes_cli/…`、`AGENTS.md`、`SECURITY.md` 属于 Hermes Agent；两边都有 `README.md` 时在句中写明是哪一个。
- **出处优先级**：接口回显与源码 > 项目官方文档 > 其他。两路以上互相印证，或一手出处直接支持，才写进脚本。
- **取证环境**：只读访问公开接口与公开仓库，不运行两个项目的安装程序或服务；第三方源码按固定提交以稀疏浅克隆取得，放在 `research/_src/`（不入库）。
- **脱敏**：入库的回显与数据不含口令、内网地址、主机名、用户目录。画面与回显里出现的 `127.0.0.1:18789`、`~/.openclaw/workspace`、`~/.hermes/…`、`~/Library/LaunchAgents/…` 是两个项目文档自己的默认值。
- **状态说明**：「已核实」= 有两路以上出处互相印证，或一手出处（接口回显、固定提交的源码与文档、作者本人帖子）直接支持；「概括」= 对前后已核实陈述的归纳，不含新的事实；「示意」= 画面上自拟的图解或演示，已在画面上标明或在此说明。成片中没有「待核实」的陈述。

## 数字与日期总表

| 项 | 值 | 出处 | 核查 |
|---|---|---|---|
| OpenClaw GitHub 星标 | 391,448（API）；曲线末点 391,446 | GitHub API `stargazers_count`（`out_01_github.json`，2026-10-06）；star-history.com 采样（`out_15_star_history.json`） | 已核实 |
| Hermes Agent GitHub 星标 | 251,451（API）；曲线末点 251,508 | 同上（两路读取时刻不同，差几十个） | 已核实 |
| OpenClaw 仓库创建 | 2025-11-24（UTC） | GitHub API `created_at` = 2025-11-24T10:16:47Z | 已核实 |
| Hermes Agent 仓库创建 | 2025-07-22（UTC） | GitHub API `created_at` = 2025-07-22T22:22:28Z | 已核实 |
| 许可 | 均为 MIT | GitHub API `license.spdx_id` | 已核实 |
| OpenClaw 星标采样点 | 2026-01-20：4,918；02-07：161,484；03-16：301,885；10-06：391,446 | `out_15_star_history.json` | 已核实（第三方采样） |
| Hermes Agent 星标采样点 | 2026-03-08：2,034；04-01：20,001；04-24：110,980；10-06：251,508 | 同上 | 已核实（第三方采样） |
| 扩展包数量 | 162（其中 28 个声明了聊天通道） | 固定提交上 `extensions/*/package.json` 的统计（`out_09_extensions.tsv`） | 已核实 |
| Hermes 平台适配器 | 21 个 `plugins/platforms/<平台>/adapter.py` | `out_16_hermes_platforms.txt` | 已核实 |
| 2026.8.1（OpenClaw 2.0） | 发布于 2026-08-31 | GitHub Releases API（`out_02_releases.json`） | 已核实 |
| Hermes Agent v0.2.0 | 2026-03-12；216 个合并的拉取请求、63 位贡献者 | 发布说明（`out_02_hermes_v0.2.0_notes.txt`） | 已核实 |
| 安全公告 | GHSA-g8p2-7wf7-98mq，CVSS 8.8，2026-01-31 发布 | `out_08_advisory.json`、`out_08_nvd_CVE-2026-25253.json` | 已核实 |
| Hermes 记忆上限 | MEMORY.md 2,200 字符；USER.md 1,375 字符 | 文档与源码默认值（见 j13） | 已核实 |
| OpenClaw 心跳默认间隔 | 30m（用 Anthropic OAuth 时 1h） | 见 i21 | 已核实 |

## 开场

| 句号 | 陈述 | 依据 | 核查 |
|---|---|---|---|
| o1、o2 | 一台不关机的电脑上常驻一个进程，一头连着聊天软件，一头连着模型、文件和终端 | 对后文两个项目共同形态的概括：常驻的网关进程（`docs/concepts/architecture.md:10`、`website/docs/developer-guide/architecture.md:17`）、聊天平台（`README.md:18`、`AGENTS.md:12`）、模型与工具循环（`docs/concepts/agent-loop.md:9`、`website/docs/developer-guide/agent-loop.md:64`）。画面是自拟的示意图（已标「示意」），运行时长「41 天」是示意数字 | 概括、示意 |
| o3 | 这一类程序里有 OpenClaw 和 Hermes Agent；画面：GitHub 星标 391,448 与 251,451 | GitHub REST API `stargazers_count`（`out_01_github.json`，2026-10-06 读取）；画面注明「截至 2026-10-06」 | 已核实 |
| o4、oT | 本片讲这一类的设计，和两者的实现 | 本片结构 | 概括 |

## 01 网关型智能体

| 句号 | 陈述 | 依据 | 核查 |
|---|---|---|---|
| k1–k4 | 终端里的编程智能体内部是一个循环：把对话和工具清单发给模型；模型要调用工具就执行、把结果追加回去；直到模型给出不再调用工具的回答 | 这是两个项目的文档对各自循环的共同描述：Hermes `website/docs/developer-guide/agent-loop.md:64`（九步里的「If tool_calls: execute them, append results, loop back … If text response: … return」）；OpenClaw `docs/concepts/agent-loop.md:9`（「intake, context assembly, model inference, tool execution, streaming, persistence」）。画面里的对话内容与工具名是示意 | 已核实（循环）、示意（画面内容） |
| k5 | 包着模型的这层程序叫 harness | OpenClaw `docs/concepts/agent-runtimes.md:24`：「A **harness** is the implementation that provides an agent runtime」；同文件把 `claude-cli`、`codex` 列为运行时（`docs/concepts/agent-runtimes.md:33`、`docs/concepts/agent-runtimes.md:36`） | 已核实 |
| k6、k7 | 它默认了几件事：人在键盘前、输入只来自这个人、一个窗口一段对话、窗口关了进程也就结束 | 对「在终端里交互使用」这一形态的归纳，用来和下文对照；不是对某一个产品的断言（多数编程智能体另有无人值守或恢复会话的用法）。画面标「示意」 | 概括、示意 |
| k8 | 网关型智能体把这些前提都换掉了 | 以下四句的总起。「网关型智能体」是本片对这一类的称呼；两个项目都把常驻进程叫 Gateway（`README.md:70`、`website/docs/developer-guide/architecture.md:17`） | 概括 |
| k9 | 进程常驻，由系统的服务管理器拉起 | OpenClaw `docs/concepts/architecture.md:10`「A single long-lived **Gateway**」、`docs/cli/daemon.md:52`（macOS 写 LaunchAgent）；Hermes `website/docs/guides/team-telegram-assistant.md:149`（Linux 为 systemd、macOS 为 launchd） | 已核实 |
| k10 | 输入来自许多聊天平台，每个平台一个适配器 | OpenClaw 的通道插件（`docs/plugins/sdk-channel-plugins.md:21`）；Hermes `website/docs/developer-guide/gateway-internals.md:146`「All extend `BasePlatformAdapter`」。画面上的「聊天平台 A–D」与形状各异的事件是示意 | 已核实、示意 |
| k11 | 消息按来源算出会话键，分到各自的上下文 | OpenClaw `src/routing/session-key.ts:261`；Hermes `website/docs/developer-guide/gateway-internals.md:75`。画面上的三条车道是示意 | 已核实、示意 |
| k12 | 发消息的可能是任何人，所以先做准入 | OpenClaw `README.md:79`「Treat inbound messages as untrusted input. DM-capable channels pair unknown senders by default」；Hermes `website/docs/developer-guide/gateway-internals.md:102`「Default: deny」。两个项目里准入与会话键的先后各不相同，画面的排法是一般化的示意 | 已核实、示意 |
| k13 | 没有人发消息时，定时任务也能启动一轮 | OpenClaw `docs/gateway/heartbeat.md:15`（心跳是定时的一轮）；Hermes `website/docs/user-guide/features/cron.md:19`（定时任务在新的会话里运行） | 已核实 |
| k14 | 循环没有变，网关回答的是循环之外的问题（谁在说话、哪个会话、能不能进、何时开始） | 对 k9–k13 的归纳 | 概括 |

## 02 OpenClaw：来历与用法

| 句号 | 陈述 | 依据 | 核查 |
|---|---|---|---|
| c1 | 仓库创建于 2025 年 11 月，起初叫 warelay | GitHub API `created_at` = 2025-11-24T10:16:47Z；首个发布 v0.1.1（2025-11-25）的 README 标题「warelay — Send, receive, and auto-reply on WhatsApp」（`out_04_readmes.txt`）；npm `warelay` 首版 2025-11-25（`out_03_npm.json`） | 已核实 |
| c2、c3 | 12 月改名 CLAWDIS，定位是一句话：把 WhatsApp 和 Telegram 桥接到本机的编程智能体 | v2.0.0-beta1（2025-12-19）README 首句：「**CLAWDIS** is a TypeScript/Node gateway that bridges WhatsApp (Web/Baileys) and Telegram (Bot API/grammY) to a local coding agent (**Pi**).」（`out_04_readme_lines.txt`）；npm `clawdis` 创建于 2025-12-19 | 已核实 |
| c4 | 也就是给一个 harness 加上了网关 | 对 c3 的概括。Pi：GitHub `earendil-works/pi` 的描述「AI agent toolkit: unified LLM API, agent loop, TUI, coding agent CLI」（`out_01_github.json`）；OpenClaw README 致谢 `README.md:120` | 概括 |
| c5 | 2026 年 1 月三次改名，30 日定名 OpenClaw | Clawdbot：首个发布 v2026.1.5（2026-01-05）；Moltbot：`docs/start/lore.md:28`「The First Molt (January 27, 2026)」；OpenClaw：`docs/start/lore.md:14`（1 月 30 日）与 v2026.1.29 的发布日 2026-01-30。画面上的日期取自 `data.js` 的 `names` | 已核实 |
| c6 | 星标 1 月 20 日不到五千，2 月 7 日超过十六万；画面：18 天、32.8 倍 | star-history.com 的曲线采样点：2026-01-20 为 4,918，2026-02-07 为 161,484（`04_star_history.py` → `out_15_star_history.json`）；161,484 ÷ 4,918 = 32.8，两日相隔 18 天。GitHub 的 stargazers 接口需要认证，未用 | 已核实（第三方采样） |
| c6 画面 | 01-31 安全公告 · CVSS 8.8 | GHSA-g8p2-7wf7-98mq：项目仓库的安全公告发布于 2026-01-31（`published_at` = 2026-01-31T10:04:35Z），CVSS 8.8，修复于 v2026.1.29；NVD 记录 CVE-2026-25253（`out_08_advisory.json`、`out_08_nvd_CVE-2026-25253.json`）。画面上的日期取仓库公告的发布日；NVD 的收录日是 2026-02-01，GitHub 公告数据库的收录日是 2026-02-02 | 已核实 |
| c7 | 2 月 15 日，作者宣布加入 OpenAI，项目转给基金会 | 作者本人的 X 帖子 `x.com/steipete/status/2023154018714100102`（2026-02-15T21:54:41Z，时间由帖子编号按 Snowflake 规则推算：`03_snowflake.py`、`out_13_x_posts.json`）；同日的报道（Bloomberg、Fortune，2026-02-15）写明项目将转入基金会、OpenAI 继续支持（2026-10-07 联网复核）；基金会：`README.md:110`「developed in the open by the OpenClaw Foundation, an independent 501(c)(3) … OpenAI is a donor, not an owner」。旁白把两件事放在同一句里，画面把基金会一行单列，不标日期。英文版作「announced a move to OpenAI; the project went to a foundation」，画面标注作「author to join OpenAI」 | 已核实 |
| c8 | 到 10 月 6 日，星标是 39.1 万 | 同一条曲线的最后一个采样点 391,446（2026-10-06）；GitHub API 当日读数 391,448 | 已核实 |
| c9 | 8 月底的 2.0 把会话从文件迁进 SQLite | `docs/releases/index.md:21`「v2026.8.1 (AKA OpenClaw 2.0)」；GitHub 发布 `v2026.8.1` 日期 2026-08-31；`docs/releases/2026.8.1/installation-and-onboarding.md:9`「moving them into SQLite」 | 已核实 |
| c10 | 用法只有一步：安装，并把网关注册成系统服务 | `README.md:56`（`openclaw onboard --install-daemon`）；`docs/cli/daemon.md:52` | 已核实 |

## OpenClaw：实现与分析

| 句号 | 陈述 | 依据 | 核查 |
|---|---|---|---|
| i1 | 实现上，OpenClaw 的中心是网关 | `README.md:70`「The Gateway is the local control plane for sessions, tools, events, and channel connections.」 | 已核实 |
| i2 | 一台主机一个网关进程，默认监听本机 18789 端口 | `docs/concepts/architecture.md:17`「One Gateway per host」；`docs/concepts/architecture.md:10`（默认 `127.0.0.1:18789`） | 已核实 |
| i3、i4 | 命令行、网页控制台、桌面应用都是它的客户端；用 WebSocket 连进来，收发带类型的 JSON 帧 | `docs/concepts/architecture.md:12`；`docs/concepts/architecture.md:81`（请求、响应、事件三种帧）；`docs/concepts/architecture.md:79`（首帧必须是 `connect`） | 已核实 |
| i5 | 会话归网关所有，不归任何客户端 | `docs/concepts/messages.md:68`「Sessions are owned by the gateway, not by clients.」 | 已核实 |
| i6 | 聊天平台以通道插件接入：162 个扩展包里占 28 个 | 固定提交上 `extensions/*/package.json` 的统计：162 个包，28 个声明了 `openclaw.channel`（`02_extract.py` → `out_09_extensions.tsv`）。画面网格逐格对应这张表 | 已核实 |
| i7 | 插件管平台的收发和准入，会话键和调度留在核心 | `docs/plugins/sdk-channel-plugins.md:21`（插件负责 Config、Security、Pairing、Session grammar、Outbound、Threading）；`docs/plugins/sdk-channel-plugins.md:43`「Core owns the shared message tool, prompt wiring, the outer session-key shape … and dispatch」 | 已核实 |
| i8 | 一条消息进来，先路由出会话键，再去重、合并连发 | `docs/concepts/messages.md:10`（routing/bindings → session key → dedupe + debounce → queue → agent run → outbound） | 已核实 |
| i9 | 私聊默认并入同一个主会话，群聊各有各的键 | `src/routing/session-key.ts:220`（`dmScope ?? "main"`）、`docs/channels/channel-routing.md:38`（`agent:main:main`）、`src/routing/session-key.ts:261` | 已核实 |
| i10 | 每个会话一条车道，同一会话里的轮次串行 | `docs/concepts/agent-loop.md:48`「Runs are serialized per session key (session lane)」；`docs/concepts/queue.md:21` | 已核实 |
| i11 | 一轮没跑完又来消息，默认注入正在进行的这一轮 | `docs/concepts/queue.md:31`（`mode: "steer"`）；`docs/concepts/queue.md:36`「A prompt that arrives mid-run is injected into the active runtime when the run can accept steering」。运行时不能接受时会等这一轮结束，旁白以「默认」限定 | 已核实 |
| i12 | 跑循环的部分叫智能体运行时 | `docs/concepts/agent-runtimes.md:10`「An **agent runtime** owns one prepared model loop」 | 已核实 |
| i13 | 内置的那个叫 openclaw，旧别名正是 pi | `docs/agent-runtime-architecture.md:46`「The built-in runtime id is `openclaw`. The legacy alias `pi` normalizes to `openclaw`.」 | 已核实 |
| i14、i15 | Codex 或者 Claude 的命令行也能接进来当运行时；循环本身是可以替换的部件 | `docs/concepts/agent-runtimes.md:33`（插件 harness `codex`、`copilot`）；`docs/concepts/agent-runtimes.md:36`（CLI 后端 `claude-cli`）；`docs/start/why-openclaw.md:69` | 已核实 |
| i16 | 系统提示词每一轮都由 OpenClaw 自己装配 | `docs/concepts/system-prompt.md:9`「OpenClaw builds its own system prompt for every agent run」；`docs/concepts/agent-loop.md:61` | 已核实 |
| i17 | 工作区里的几份 Markdown 会注入进去，记忆也在其中 | `docs/concepts/agent-workspace.md:70`；`docs/concepts/memory.md:20`（`MEMORY.md` 在会话开始时载入）。画面的四层是对 `docs/concepts/agent-loop.md:61` 的图解 | 已核实 |
| i18 | 官方的说法：模型只记得落盘的内容，没有隐藏状态 | `docs/concepts/memory.md:9`「The model only remembers what gets saved to disk; there is no hidden state.」 | 已核实 |
| i19 | 每天一份笔记可供检索，后台定期整理进长期记忆 | `docs/concepts/memory.md:46`（`memory/YYYY-MM-DD.md`，供 `memory_search` 检索）；`docs/concepts/memory-search.md:10`；`docs/concepts/memory.md:51`、`docs/concepts/dreaming.md:14`（dreaming 默认开启）。画面上的日期是示意 | 已核实 |
| i20 | 工具默认在网关所在的主机上执行，沙箱默认关闭 | `docs/start/why-openclaw/the-trust-boundary.md:32`；`docs/start/why-openclaw/the-trust-boundary.md:42`「Sandboxing is off by default.」 | 已核实 |
| i21 | 没有消息时，心跳默认每三十分钟跑一轮 | `docs/gateway/heartbeat.md:37`「default is `30m`, or `1h` when Anthropic OAuth/token auth is configured」（画面注明后半句）；`docs/gateway/heartbeat.md:15` | 已核实 |
| i22 | 归纳：状态集中在网关，其余几乎都是插件 | 对 i5–i19 的归纳；`VISION.md:74`「Core stays lean; optional capabilities should usually ship as plugins.」；`VISION.md:102` | 概括 |
| i23 | 代价官方也写了：核心里的东西，每次请求都要付成本 | `VISION.md:79`「The core carries a per-call tax: each core tool, prompt line, and config key reaches every operator on every model request」 | 已核实 |
| i24 | 默认值对应一人自用；多人使用时，文档要求隔离私聊 | `docs/start/why-openclaw/the-trust-boundary.md:42`「a personal assistant for one trusted operator」；`docs/concepts/session.md:50`「If multiple people can message your agent, enable DM isolation.」；`docs/concepts/session.md:69` | 已核实 |

## 03 Hermes Agent：来历与用法

| 句号 | 陈述 | 依据 | 核查 |
|---|---|---|---|
| h1、h2 | Hermes 这个名字最早属于一系列模型；2023 年 6 月 Nous Research 发布 Nous-Hermes-13b | Hugging Face `NousResearch/Nous-Hermes-13b` 创建于 2023-06-03（`out_05_models.json`）。画面时间轴上其余各点：Hermes 2 Pro 2024-03-11（仓库创建）、Hermes 3 2024-08-15 与 Hermes 4 2025-08-25（arXiv 提交日） | 已核实 |
| h3 | 2024 年的 Hermes 3，定位是通用的指令与工具调用模型 | arXiv 2408.11857（2024-08-15）摘要：「a neutrally-aligned generalist instruct and tool use model」（`out_05_hermes3_abstract.txt`） | 已核实 |
| h4 | 先有会调用工具的模型，后有智能体 | 对 h2、h3、h5 的时间先后的概括 | 概括 |
| h5 | 智能体在 2026 年 2 月 25 日公开，仓库建于前一年七月 | Nous Research 发布页列出 Hermes Agent，日期 02/25/26（`out_06_nous_releases.txt`；2026-10-07 另由第三方资料交叉核对同一日期）；GitHub API `created_at` = 2025-07-22T22:22:28Z。英文版作「its repository was seven months old」（2025-07-22 至 2026-02-25） | 已核实 |
| h6 | 两周多后的 v0.2.0 合并了 216 个拉取请求 | v0.2.0 发布说明（2026-03-12）：「In just over two weeks … 216 merged pull requests from 63 contributors」（`out_02_hermes_v0.2.0_notes.txt`） | 已核实 |
| h7、h7b | 星标四月初两万，四月下旬过十一万；到 10 月 6 日是 25.1 万 | star-history.com 采样点：2026-04-01 为 20,001，04-24 为 110,980，10-06 为 251,508（`out_15_star_history.json`）；GitHub API 当日读数 251,451。画面上的细线是同一坐标下 OpenClaw 的曲线 | 已核实（第三方采样） |
| h8 | 用法同样一句：hermes 进入对话，加 gateway 启动网关 | `README.md:110`、`README.md:115`；`AGENTS.md:12`「runs the same agent core across a CLI, a messaging gateway …」 | 已核实 |

## Hermes Agent：实现与分析

| 句号 | 陈述 | 依据 | 核查 |
|---|---|---|---|
| j1、j2 | 中心不是网关，是核心；核心是一个类 AIAgent，循环在 run_conversation 里 | `website/docs/developer-guide/agent-loop.md:9`「The core orchestration engine is the `AIAgent` class」；`agent/conversation_loop.py:1695`（`def run_conversation(`） | 已核实 |
| j3、j4 | 命令行、消息网关、ACP、批处理都只是入口；每个入口做同一件事：构造 AIAgent，交给它一轮对话 | `website/docs/developer-guide/architecture.md:17`（CLI、Gateway、ACP、Batch Runner、API Server、Python Library）；`website/docs/developer-guide/architecture.md:153`（「create AIAgent with session history → AIAgent.run_conversation()」） | 已核实 |
| j5 | 官方称之为窄腰：核心收窄，能力放在边缘 | `AGENTS.md:24`「The core is a narrow waist; capability lives at the edges.」 | 已核实 |
| j6 | 模型接口有三种模式，进出核心时统一成一种格式 | `website/docs/developer-guide/agent-loop.md:47`（`chat_completions`、`codex_responses`、`anthropic_messages`）；`website/docs/developer-guide/agent-loop.md:51`「All three converge on the same internal message format」 | 已核实 |
| j7 | 网关一侧，每个平台一个适配器，继承同一个基类 | `website/docs/developer-guide/gateway-internals.md:146`；`gateway/platforms/base.py:2725`、`gateway/platforms/base.py:2735`（基类的抽象方法）；固定提交上 `plugins/platforms/<平台>/adapter.py` 共 21 个（`out_16_hermes_platforms.txt`；另有少数旧适配器仍在 `gateway/platforms/`，画面写「共 21 个」指前者） | 已核实 |
| j8 | 会话键写进平台和聊天编号，每个私聊各自独立 | `website/docs/developer-guide/gateway-internals.md:75`；`gateway/session.py:682`「DMs are isolated per chat_id」；`gateway/session.py:714`；命名空间 `agent:main` 见 `gateway/session.py:653–661`。文档的示例写作 `telegram:private`，源码把私聊规整为 `dm`（`plugins/platforms/telegram/adapter.py:799`、飞书见 `plugins/platforms/feishu/adapter.py:2649`），画面按源码。两条键里的聊天编号是示意 | 已核实、示意 |
| j9 | 准入默认拒绝；一轮没跑完又来消息，默认打断 | `website/docs/developer-guide/gateway-internals.md:102`「Default: deny」；`website/docs/user-guide/messaging/index.md:448`（`busy_input_mode`：`interrupt (default)`）、`website/docs/developer-guide/gateway-internals.md:88` | 已核实 |
| j10 | 另一条不变量：一场对话里的提示词缓存不能破坏 | `AGENTS.md:20`「Per-conversation prompt caching is sacred.」 | 已核实 |
| j11 | 系统提示词分三层：稳定、上下文、易变 | `website/docs/developer-guide/prompt-assembly.md:31` | 已核实 |
| j12 | 会话开始时装配一次，之后原样复用 | `website/docs/developer-guide/agent-loop.md:67`「Build or reuse cached system prompt」；`website/docs/developer-guide/prompt-assembly.md:11`；`agent/prompt_caching.py:3`。画面上三轮的「装配一次 / 缓存命中」是图解 | 已核实、示意 |
| j13 | 记忆是两份有上限的文件：2200 和 1375 个字符 | `website/docs/user-guide/features/memory.md:17`；`tools/memory_tool.py:56`（两个默认值）；`website/docs/user-guide/features/memory.md:20`。画面上两条的已用比例是示意 | 已核实、示意 |
| j14 | 中途写的记忆会落盘，提示词里的快照却不变 | `website/docs/user-guide/features/memory.md:57`「captured once at session start and never changes mid-session … persisted to disk immediately」；`tools/memory_tool.py:3` | 已核实 |
| j15 | 所有会话存进 SQLite，带全文索引，可以检索 | `website/docs/user-guide/features/memory.md:221`「stored in SQLite (`~/.hermes/state.db`) with FTS5 full-text search」；`website/docs/developer-guide/architecture.md:223` | 已核实 |
| j16–j18 | 学习闭环：一轮结束后，后台复制一个智能体重放这段对话，只判断有没有该存下的记忆或技能 | `README.md:19`（「a built-in learning loop」，成片以「自述」限定）；`agent/background_review.py:1`（模块文档字符串：「spawn a daemon thread that replays the conversation snapshot in a forked AIAgent and asks "should any skill/memory be saved or updated?"」）；`agent/turn_finalizer.py:769` | 已核实 |
| j19 | 技能是 Markdown 写的做法，提示词里只放索引 | `website/docs/user-guide/features/skills.md:9`（「progressive disclosure」）；`website/docs/user-guide/features/skills.md:11`；`website/docs/developer-guide/prompt-assembly.md:107`。画面上的技能名是文档里的示例 | 已核实 |
| j20 | 副本沿用同一份提示词，命中的是同一段缓存 | `agent/background_review.py:1`「inherits the parent's live runtime (provider, model, credentials, cached system prompt) so it hits the same prefix cache」 | 已核实 |
| j21 | 终端有七种后端，默认本机；安全边界是操作系统 | `README.md:29`「Seven terminal backends」；`website/docs/user-guide/features/tools.md:73`（`local` 为默认）；`SECURITY.md:60`「The only security boundary against an adversarial LLM is the operating system.」 | 已核实 |
| j22 | 归纳：一个核心服务所有入口，网关只是其中之一 | 对 j1–j9 的归纳 | 概括 |
| j23 | 许多设计出自同一个约束：缓存按前缀命中（画面：记忆有上限、快照被冻结、后台副本共用前缀） | 后两项的原文明说是为了前缀缓存（`website/docs/user-guide/features/memory.md:57`、`agent/background_review.py:1`）；「记忆有上限」与缓存的关系是本片的归纳（上限的直接依据见 j13），以「许多」限定 | 概括 |

## 04 异同

| 句号 | 陈述 | 依据 | 核查 |
|---|---|---|---|
| b1、b2 | 骨架相同：常驻进程、平台适配器、会话键、工具循环 | 见 k9–k11、i1–i12、j1–j8 | 概括 |
| b3 | 记忆都在 Markdown 里，连文件名都相同 | OpenClaw：`docs/concepts/agent-workspace.md:76`（SOUL.md）、`docs/concepts/memory.md:17`、`docs/concepts/memory.md:20`；Hermes：`website/docs/developer-guide/prompt-assembly.md:31`（SOUL.md）、`website/docs/user-guide/features/memory.md:17`（MEMORY.md、USER.md） | 已核实 |
| b4 | 都能定时启动，工具都默认在本机执行，都是 MIT 许可 | `docs/gateway/heartbeat.md:15`、`website/docs/user-guide/features/cron.md:19`；`README.md:81`、`website/docs/user-guide/features/tools.md:73`；GitHub API `license.spdx_id` 均为 MIT | 已核实 |
| b5 | 各带一条命令，把对方的数据迁移过来 | `README.md:117`（`hermes claw migrate`）、`website/docs/guides/migrate-from-openclaw.md:9`；`docs/cli/migrate.md:27`（`openclaw migrate hermes`）、`extensions/migrate-hermes/README.md:3` | 已核实 |
| b6 | 差别从中心开始：一个是网关，一个是核心 | 见 i1、j1 | 概括 |
| b7 | OpenClaw 的循环可以整个换掉，Hermes 只有一个 | 见 i12–i15、j2–j4 | 概括 |
| b8 | 中途来的消息：一个默认注入，一个默认打断 | 见 i11、j9 | 概括 |
| b9 | 私聊：一个默认并入主会话，一个按聊天分开 | 见 i9、j8 | 概括 |
| b10 | 记忆：一个是笔记加检索，一个是限额加技能 | 见 i18–i19、j13–j19 | 概括 |
| b11 | 出发点也不同：一个从桥接聊天做起，一个从模型做起 | 见 c1–c4、h1–h4；画面上的 2025-11 与 2023-06 取自仓库创建日与第一个模型仓库的创建日 | 概括 |

## 05 真实链路：Mac mini 与飞书

| 句号 | 陈述 | 依据 | 核查 |
|---|---|---|---|
| m1、m2 | 一台 Mac mini 放在家里，不关机 | 情景设定。OpenClaw 文档提到这种用法：`docs/help/faq-first-run/providers-and-hosting.md:122`「A Mac mini is a popular always-on host choice, but a small VPS, home server, or Raspberry Pi-class box works too.」。两个网关并排画在同一台机器上是为了对照，画面已注明 | 示意（情景）、已核实（引文） |
| m3 | 网关是 launchd 服务：登录时启动，异常退出后被拉起 | OpenClaw：`docs/cli/daemon.md:52`、`docs/gateway/troubleshooting/gateway-service-and-process.md:131`（`~/Library/LaunchAgents/ai.openclaw.gateway.plist`）、`docs/cli/gateway/service.md:254`；Hermes：`website/docs/guides/team-telegram-assistant.md:149`、`hermes_cli/gateway_launchd.py:28`、`hermes_cli/gateway_launchd.py:422`（`RunAtLoad` 为真；`KeepAlive` 的 `SuccessfulExit` 为假，即非正常退出时重启）。LaunchAgent 在用户登录时载入，所以旁白说「登录时启动」 | 已核实 |
| m4、m5 | 家里的电脑没有公网地址；做法是反过来，由 Mac mini 主动向飞书建立长连接 | 飞书官方 Node SDK 的 README：「Only need to ensure that the running environment has the ability to access the public network, no need to provide public IP or domain name.」（`out_07_feishu_node_sdk.txt`、`out_14_feishu_official.txt`）；OpenClaw `docs/channels/feishu.md:9`（WebSocket 为默认，不需要公网地址）；Hermes `website/docs/user-guide/messaging/feishu.md:17`、`plugins/platforms/feishu/adapter.py:1394` | 已核实 |
| m6 | 两边用的都是飞书官方 SDK 的 WebSocket 客户端 | OpenClaw `extensions/feishu/src/client.ts:504`（返回 `Lark.WSClient`，来自 `@larksuiteoapi/node-sdk`）；Hermes `plugins/platforms/feishu/adapter.py:1202`（`lark_oapi.ws` 的 `Client`） | 已核实 |
| m7 | 有人给机器人发消息，事件沿长连接推下来 | `extensions/feishu/src/monitor.account.ts:314`（`im.message.receive_v1`）；`plugins/platforms/feishu/adapter.py:1429`（`register_p2_im_message_receive_v1`） | 已核实 |
| m8 | 飞书要求三秒内处理完，否则重推 | 飞书官方 Node SDK 的 README：「developers need to complete processing within 3 seconds after receiving a message, otherwise, a timeout re-push will be triggered」（同上） | 已核实 |
| m9 | 两边都先收下：一个写入持久队列，一个起后台任务 | OpenClaw `docs/channels/feishu/setup.md:43`「durably queues authenticated `im.message.receive_v1` … envelopes before agent dispatch」；Hermes `gateway/platforms/base.py:4038`「returns quickly by spawning a background task」 | 已核实 |
| m10 | 去重、准入之后，算出会话键 | 去重：`docs/concepts/messages.md:31`、`website/docs/user-guide/messaging/feishu.md:545`（按消息编号，保留 24 小时）；准入：`extensions/feishu/src/bot.ts:529`（`dmPolicy ?? "pairing"`）、`docs/channels/feishu/access-control.md:17`、`website/docs/developer-guide/gateway-internals.md:102` | 已核实 |
| m11 | 同一条私聊，一边并入主会话，一边得到自己的键 | 见 i9、j8；画面上的 `agent:main:feishu:dm:oc_…` 按 `website/docs/developer-guide/gateway-internals.md:75` 的格式写出，聊天编号省略 | 已核实、示意 |
| m12–m14 | 进入循环：装配提示词，调用模型；模型要读一篇飞书文档，就发出一次工具调用；结果追加回对话，模型再给出回答 | 循环见 k1–k4；工具：OpenClaw `extensions/feishu/src/docx.ts:855`（`feishu_doc`，动作含 read）；Hermes `tools/feishu_doc_tool.py:1`（`feishu_doc_read`，只读）、`toolsets.py:44`。「读一篇飞书文档」是示例任务 | 已核实、示意 |
| m15 | 回复沿原路发回：一边是流式卡片，一边是富文本 | OpenClaw `docs/channels/feishu/advanced-configuration.md:62`；Hermes `website/docs/user-guide/messaging/feishu.md:429`（含 Markdown 时发 post，接口拒绝时退回纯文本） | 已核实 |
| m16 | 最后落盘：会话进 SQLite，记忆写进文件 | 见 c9、i18、j15、j13；Hermes 此时的后台回看见 j16–j18 | 概括 |
| m17 | 离开这台机器的只有两类请求：发给飞书的，和发给模型的 | 对本章链路的归纳：飞书一侧是长连接与开放接口的调用，模型一侧是对模型接口的请求；工具默认在本机执行（i20、j21）。画面注明「用本地模型时只剩第一类」。这是对图上这条链路的描述，不涵盖用户另行配置的联网工具 | 概括 |

## 片尾

| 句号 | 陈述 | 依据 | 核查 |
|---|---|---|---|
| s1、s2 | 两句归纳 | 见 i22、j22–j23 | 概括 |
| x1、xC | 取证记录、脚本和源码都在开源仓库里；名单 | 本仓库 `github.com/Water-Run/ft`；见「制作署名」 | 已核实 |

## 画面上的补充内容（旁白没有逐字讲到，但出现在画面上）

| 位置 | 画面内容 | 依据 | 核查 |
|---|---|---|---|
| 02 名字时间轴 | 五个名字与日期：warelay 2025-11-24；CLAWDIS 2025-12-19；Clawdbot 2026-01-05；Moltbot 2026-01-27；OpenClaw 2026-01-30；warelay 的 README 一句 | 仓库创建日、各名字的首个发布或 npm 包（`out_02_releases.json`、`out_03_npm.json`）、`docs/start/lore.md`；`out_04_readmes.txt` | 已核实 |
| 02 星标曲线 | 坐标刻度、四个标注点、「01-31 安全公告」「02-15 作者宣布加入 OpenAI」两条竖线 | 数字总表；c6、c7 | 已核实 |
| 02 的 2.0 | `v2026.8.1 · 2026-08-31`；发布说明的一句原文 | c9 | 已核实 |
| OpenClaw 实现 | 三种帧的写法；「JSON 帧，首帧必须是 connect」；通道 feishu、telegram、slack、whatsapp 四个插口（网格里对应的四格描白边） | i3、i4；四个名字取自 `out_09_extensions.tsv` 里声明了聊天通道的包 | 已核实 |
| OpenClaw 实现 | 网关内部的三条会话键 `agent:main:main`、`agent:main:feishu:group:…`、`agent:main:telegram:group:…`；消息方块的排队与注入 | 键的格式见 i9；后两条的省略号处是群的编号；方块的数量与节奏是示意 | 已核实（格式）、示意 |
| OpenClaw 实现 | 三张「卡带」：`openclaw`（内置，旧别名 pi）、`codex`（插件 harness）、`claude-cli`（CLI 后端） | i13、i14 | 已核实 |
| OpenClaw 实现 | 执行位置三格：网关所在的主机（默认）、沙箱（默认关闭）、配对的设备（可选） | i20 | 已核实 |
| OpenClaw 实现 | 全图上的三个大字标签：通道 = 插件、运行时 = 插件、记忆 = 插件位 | i6、i12–i15；`VISION.md` 的「Memory is a special plugin slot」（见 i22） | 已核实 |
| OpenClaw 分析 | `session.dmScope: "main"`、`session.dmScope: "per-channel-peer"` | i9、i24 | 已核实 |
| 03 模型时间轴 | 四个模型的名字与日期；「仓库创建 2025-07-22」 | h1–h5 | 已核实 |
| 03 星标曲线 | 「2026-02-25 公开发布」「2026-03-12 v0.2.0 · 216 个合并的拉取请求 · 63 位贡献者」；OpenClaw 的细线 | h5–h7 | 已核实 |
| Hermes 实现 | 六个入口及各自的文件；五格「边缘的能力」及路径（`tools/registry.py`、`~/.hermes/memories`、`~/.hermes/skills`、`~/.hermes/state.db`、`tools/environments`） | j3；`website/docs/developer-guide/tools-runtime.md:11–19`（工具注册与终端环境的文件）；j13、j15、j19 | 已核实 |
| Hermes 实现 | 六个平台名（telegram、discord、slack、feishu、matrix、email）与「共 21 个」；`connect()  disconnect()  send()`；`MessageEvent`、`GatewayRunner` | j7；`out_16_hermes_platforms.txt` | 已核实 |
| Hermes 实现 | 准入的五步（平台放行开关、平台白名单、私聊配对、全局放行开关、默认拒绝） | `website/docs/developer-guide/gateway-internals.md:98–102` | 已核实 |
| Hermes 实现 | 三层里各自的内容（SOUL.md；AGENTS.md …；技能索引、记忆快照） | j11 | 已核实 |
| Hermes 实现 | 七个后端的名字；「默认：本机」 | j21 | 已核实 |
| 05 launchd | 两个 plist 的路径；`RunAtLoad`、`KeepAlive` | m3（Hermes 的路径由标签 `ai.hermes.gateway` 与 LaunchAgents 目录拼出） | 已核实 |
| 05 链路 | 七步各自的源码行或文档行；「3 s」倒计时 | m7–m16 | 已核实 |
| 片尾 | 数据截至 2026-10-06；`openclaw @ 195e1cc6c1`、`hermes-agent @ 4787e4d56f` | `out_12_snapshots.json` | 已核实 |

画面上的「示意」（均已在画面标明，或是对原文的图解）：开场的电脑、进程与运行时长；01 章的终端、对话内容、聊天平台 A–D 与三条车道；OpenClaw 网关内部方块的排队节奏、工作区里按日期命名的笔记；Hermes 一侧三轮请求的「装配一次 / 缓存命中」、记忆两条的已用比例、学习闭环里的对话条；05 章把两个网关并排画在同一台 Mac mini 上，以及示例任务「读一篇飞书文档」。

## 制作署名

| 项 | 内容 | 依据 |
|---|---|---|
| 策划 | WaterRun（英文 `Planning: WaterRun`） | 用户提出题目与全部要求，看过初版后重定了全片结构（先讲这一类，再分讲两个项目的来历、用法与实现，然后比较，最后以 Mac mini 上接入飞书的链路收束） |
| 制作 | Claude Sonnet 5.5（Anthropic；`claude-sonnet-5-5`）：取证的大部分与第一版（脚本、视觉与场景），第一版的结构被策划否定，成片保留了它的取证脚本与数据。Claude Opus 5.5（Anthropic；`claude-opus-5-5`）：按重定的结构重写脚本与翻译、补充取证、重新设计视觉并实现全部场景、配乐、封面与审查 | 制作会话的模型标识；`project.json` 的 `production.maker` |
| 配音 | edge-tts 在线语音：`zh-CN-YunyangNeural`（中文）、`en-US-AndrewNeural`（英文）；服务未披露底层模型，记为「模型未披露」 | `project.json` 的 `voices` |
| 回听 | faster-whisper（`small` 模型）：把合成的旁白转写后与脚本逐句对照，不参与成片内容 | `kit/tools/asr.py` |
| 开源视频 | `github.com/Water-Run/ft`（英文 `Open-source video`） | 仓库地址；片尾画面中出现 |

没有使用图像生成模型。配乐由本片的 `tools/music.py` 合成（经 `kit/tools/mix.py` 调用），音效由 `mix.py` 合成，均不含外部素材。像素龙虾的 16×16 点阵逐格取自 OpenClaw 仓库的 `docs/assets/pixel-lobster.svg`（MIT 许可，颜色照原图）；Hermes Agent 的像素字是照其仓库 `assets/banner.png` 的样子（三段金色加描边回声）用 5×7 点阵重画的，没有使用其图片文件；片中没有使用飞书、Nous Research、Apple 的标志，Mac mini 画成一个圆角方形。

## 复核

**范围与日期**：2026-10-07，对象是两种语言的最终源码与成片；115 句旁白与「画面上的补充内容」一节的各行都在范围内。

**做法与依据**

1. 画面文字与本表比对。用 `sheets.js cue` 出两种语言每句说完那一刻的画面（各 115 帧），对照本表逐句通看。另把页面里的全部文字节点导出（中文 535 个、英文 539 个），其中带数字、日期、版本号、行号的，逐个在本文件里查找。没有在本文件里出现的只有四类：标明「示意」的运行时长（`已运行 41 天 07:12:34` 一类）；坐标刻度（`300k`、`2026-06` 等）；计数器滚动途中的中间值；英文字幕里与中文约数对应的写法（`Under 5,000`、`over 160,000`、`391,000`、`251,000`，对应 c6、c8、h7b）。
2. 引文与源码行。场景代码里有 119 处 `has()` 断言，逐条核对被引的文字确在固定提交的原文里；`check.js` 通过时页面日志为空。
3. 外部事实联网复核，读取原始来源：

| 项 | 来源（2026-10-07 读取） | 结果 |
|---|---|---|
| 两个仓库的创建时间与许可 | GitHub REST API `repos/openclaw/openclaw`、`repos/NousResearch/hermes-agent` | 与 10-06 的回显一致；当日星标为 391,517 与 251,700，比 10-06 各多几十到二百多个 |
| 2026.8.1 的发布日 | GitHub Releases API `releases/tags/v2026.8.1` | `published_at` = 2026-08-31T03:30:51Z，一致 |
| Hermes Agent v0.2.0 | GitHub Releases API `releases/tags/v2026.3.12` | 名称「Hermes Agent v0.2.0 (2026.3.12)」，`published_at` = 2026-03-12T10:07:34Z；正文「216 merged pull requests from 63 contributors」，一致 |
| 安全公告 | GitHub 公告数据库 `advisories/GHSA-g8p2-7wf7-98mq` | CVE-2026-25253，CVSS 8.8，修复于 2026.1.29，一致；该库的收录日是 2026-02-02，与仓库公告的发布日 2026-01-31 不是同一个日期（见下） |
| Nous-Hermes-13b | Hugging Face API `models/NousResearch/Nous-Hermes-13b` | `createdAt` = 2023-06-03T03:21:50Z，一致 |
| Hermes 3 的定位 | arXiv `abs/2408.11857` | 2024-08-15 提交；摘要原句与画面引文一致 |
| 作者加入 OpenAI、项目转入基金会 | Bloomberg、Fortune 2026-02-15 的报道 | 与作者本人帖子的日期和内容一致 |
| Hermes Agent 的公开日期 | 第三方条目 `agentic-ai.readthedocs.io` 的 Hermes Agent 页（「released by Nous Research on February 25, 2026」） | 与 Nous Research 发布页的日期一致；只取日期，该页的其他说法未采用 |

4. 标题、字幕、封面与译文。英文脚本对照中文底本逐句通读，核对每句的数字、日期、限定词与因果是否一致；封面只有标题与两个项目的标志，没有事实性陈述。
5. 画面上没有本机路径、主机名、用户名；出现的路径都是两个项目文档里的默认值（见文首「脱敏」）。

**发现的问题与更正**

- 英文 c7 原作「its author joined OpenAI」。中文底本与出处（当天的帖子与报道）说的是宣布加入。已改为「announced a move to OpenAI; the project went to a foundation」，画面标注改为「author to join OpenAI」，这一句重新配音。
- 安全公告有三个日期：项目仓库的公告 2026-01-31、NVD 收录 2026-02-01、GitHub 公告数据库收录 2026-02-02。三者不矛盾。成片采用第一个，c6 一行已写明。
- 取证笔记里曾把 Hermes 的迭代预算记成没有上限；源码与文档都是默认 500。记录已更正，成片没有涉及这一项。
- Hermes 会话键里表示私聊的一段，文档示例写 `private`，源码归一为 `dm`。成片按源码写 `dm`。
- 星标有两路读数：片头用 GitHub API（391,448、251,451），曲线末点用 star-history.com 的采样（391,446、251,508）。两处各自标了来源，本表「数字与日期总表」并列给出。

**复查结论**：更正后重新过了 `check.js`、回听与低清预演，并重新渲染。成片中没有「待核实」的陈述。

**未核查**：star-history.com 的星标采样点没有另一路来源逐点核对（GitHub 的 stargazers 时间线接口需要认证，未用）；只核对了末点与 GitHub API 当日读数的差。

**发布**：成片于 2026-10-07 上到哔哩哔哩与 YouTube。逐条取自两个频道的公开页面，核对日期 2026-10-07。

| 平台 | 平台上的标题 | 平台显示时长 | 发布时刻 | 链接 |
|---|---|---|---|---|
| 哔哩哔哩，合集「科普视频, 但不隶属于任何分类」 | OpenClaw, Hermes和实现 | 8:35（515 秒） | 2026-10-07 20:17 | [BV1DkHk6FEie](https://www.bilibili.com/video/BV1DkHk6FEie) |
| YouTube | OpenClaw, Hermes, and Implementation | 未核 | 2026-10-07 20:16 | [iULu-c3fAcI](https://www.youtube.com/watch?v=iULu-c3fAcI) |

本机成片的容器时长（读 mp4 的 `mvhd`）是中文 514.60 秒、英文 570.45 秒；哔哩哔哩显示 515 秒，是向上取整。两处的标题一为中文、一为英文，各处上的是不是分别对应中文版与英文版，仓库里没有记录，未核——两版成片都在制作机上，按平台逐版核对需要人工观看。片尾「开源视频」指向的 `github.com/Water-Run/ft` 已于 2026-10-07 打开核对：公开可访问。

## 取证中的旁支发现（未进入成片）

- OpenClaw 的 `docs/start/why-openclaw.md` 含一段项目自己写的 OpenClaw 与 Hermes Agent 的架构对照；成片的比较一章没有采用其结论，各行依据都回到两边的源码与文档。
- Hermes 的迭代预算默认 500（`agent/iteration_budget.py:3–5`），子智能体默认 50；成片没有涉及。
- Hermes 的记忆提醒与技能提醒各有一个默认为 10 的间隔（`agent/agent_init.py`、`agent/turn_context.py`、`agent/turn_finalizer.py`）；成片只讲了「一轮结束后回看」，没有展示这两个数字。
- `@openclaw/feishu` 在 npm 上的描述写的是「community maintained by @m1heng」；包在官方组织名下，维护者最初是社区作者。另有飞书团队发布的 `@larksuiteoapi/feishu-openclaw-plugin`。成片只讲仓库内置的飞书通道，没有展开三个包的来历。
- Hermes 的飞书群聊默认按白名单处理，白名单为空时群消息全部被拒而私聊照常（`website/docs/user-guide/messaging/feishu.md:245`）；成片的链路以私聊为例。
- 两个项目的文档自述的聊天平台数量口径不同（OpenClaw「and 20+ more」，Hermes「~20 platforms」）；成片没有比较这两个数。
