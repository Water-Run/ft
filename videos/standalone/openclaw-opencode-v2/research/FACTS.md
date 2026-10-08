# 事实出处：OpenClaw 和 OpenCode 的 v2 大改

本文件按场景列出成片（中文、英文两个版本）里的每一项事实陈述及其依据。陈述按旁白句号排列（句号见 `src/js/script.js`）；画面上的源码行、文档引文、数字、日期与旁白用同一条依据，单独写明的除外。

- **取证日期**：2026-10-08（成片中所有「截至」均指这一天；星标、版本号随时间变化）。
- **出处优先级**：亲手做的实验 > 固定版本的源码与项目自己的文档 > 项目的发布记录与博客 > 其他。第三方文章与搜索摘要只作线索，没有一条进入成片。
- **状态说明**：「实测」= 本片在干净环境里亲手运行得到；「已核实」= 固定版本的源码或项目文档直接支持，或两路以上出处互相印证；「概括」= 对前后已核实陈述的归纳，不含新的事实；「示意」= 画面上自拟的图解，已在画面上标明。成片中没有「待核实」的陈述。
- **行号**：下表的 `文件:行号` 由 `research/lab/01_excerpts.py` 生成（`out_01_excerpts.json`），指下面「环境与版本」里那个固定版本上的位置。场景代码在构建时逐条断言被引的文字确在 `data.js` 的原文里（`parts.js` 的 `quote()`），不符时页面日志报警，`check.js` 会拦下。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| OpenCode 源码 | `v1.0.0`、`v1.18.35`、`v2.0.24`（提交见 `out_02_meta.json`） | `https://codeload.github.com/anomalyco/opencode/tar.gz/refs/tags/<标签>`，2026-10-08 取得。SHA-256：v1.0.0 `d015e4e0…35234b1`，v1.18.35 `3092a7b9…1576dd59`，v2.0.24 `cf148442…6b95b` |
| OpenClaw 源码 | `v2026.7.1`、`v2026.8.1`（= 2.0）、`v2026.9.8` | `https://codeload.github.com/openclaw/openclaw/tar.gz/refs/tags/<标签>`，2026-10-08 取得。SHA-256：v2026.7.1 `30c14373…7dd55e229b`，v2026.8.1 `d3432cf7…80bf741960`，v2026.9.8 `a4e3435f…7c96b1` |
| OpenCode 可执行文件（实验用） | `opencode-linux-x64@1.0.0`、`@opencode/cli-linux-x64@2.0.24` | npm 注册表的平台包。SHA-256：1.0.0 `5382e89c…7e9e77`，2.0.24 `21b1ee06…16de6d` |
| 1.0.0 运行时临时安装的提供商包 | `@ai-sdk/openai-compatible@1.0.1` 及其依赖（`@ai-sdk/provider@2.0.0`、`@ai-sdk/provider-utils@3.0.0`、`zod@4.1.8` 等） | 1.0.0 启动时会用内置的 bun 去装 `@ai-sdk/openai-compatible@latest`；本机到 npm 太慢，改为预先放进它的缓存目录，版本取自 v1.0.0 源码的 `bun.lock`（第 418、422 行），与 1.0.0 当时的依赖一致 |
| GitHub REST API 回显 | — | `repos/…`、`releases`、`tags`、`commits/<sha>`、`branches/2.0`，2026-10-08 读取，摘要见 `out_02_meta.json`（原回显约 30 MB，不入库） |
| 早期 README | `openclaw/openclaw` 的 `v0.1.1`、`v2.0.0-beta1` 标签 | `raw.githubusercontent.com`，摘要见 `out_02_meta.json` |
| OpenClaw 博客 | 「OpenClaw 2.0, Accidentally」，2026-08-30 | `https://openclaw.ai/blog/openclaw-2-accidentally`，2026-10-08 读取；只作背景，成片中的数字不取自博客 |

**取证环境**：源码与文档只读。实验在本机 Linux（WSL2，x86-64）上进行，每次实验在一个新的用户命名空间里把实验目录挂成 `/home/user`，进程看到的家目录、项目目录（`/home/user/demo`）和工具目录（`/home/user/tools`）都是这个通用路径，回显天然不含本机用户名；`ps` 列表另做了过滤，只留与实验有关的进程。实验不联网访问任何模型服务：模型是本片自己写的按脚本应答的本地服务（`research/lab/10_scripted_model.mjs`）。

## 实验：工具执行到一半时强杀进程

脚本：`research/lab/11_crash_v1.sh`（OpenCode 1.0.0）、`12_crash_v2.sh`（OpenCode 2.0.24）；数据导出：`13_dump_v2_db.py`。回显在 `exp_v1/`、`exp_v2/`。

**做法**（两边相同）：
1. 起一个按脚本应答的模型服务。它的规则（`10_scripted_model.mjs` 开头的注释）：最后一条消息是用户消息时，要求调用 shell/bash 工具执行 `sleep 20 && echo written >> note.txt`；最后一条是工具结果、且结果里带「中断、出错、取消」等字样时，要求再执行一次 `echo written >> note.txt`；否则回一句收尾文字。每个请求的完整请求体存进 `model/req_*.json`。
2. 在项目目录里运行 `opencode run "Write a note."`（2.0.24 另加 `--auto` 放行权限；1.0.0 在配置里放行 bash）。
3. 等模型要求调用工具、且 `sleep 20` 已经在跑，再等 4 秒，`kill -9` 掉 OpenCode 的进程（1.0.0 是 `opencode run` 本身；2.0.24 是它拉起的后台服务 `opencode serve --service`）。
4. 1.0.0：运行 `opencode run --continue "Continue."`。2.0.24：运行 `opencode service start` 把后台服务重新拉起来，不再发任何提示。
5. 等被强杀的进程留下的那条命令自己跑完，看 `note.txt`。

**结果**：

| 项 | 1.0.0 | 2.0.24 | 依据 |
|---|---|---|---|
| 状态存在哪里 | `~/.local/share/opencode/storage/` 下每条消息、每个片段一个 JSON 文件 | `~/.local/share/opencode/opencode.db`（SQLite） | `exp_v1/storage_after_kill.txt`；`exp_v2/timeline.txt` 的 `db=` 一行 |
| 强杀时这次调用的记录 | 片段 JSON 里 `"status": "running"` | `session_message` 序号 5 的行里 `"status": "running"`；会话行的 `time_suspended` 已置（执行声明） | `exp_v1/storage_after_kill/part/…`；`exp_v2/db_rows.json` 的 `after_kill` |
| 强杀后那条命令 | 仍在运行，父进程变成了系统的收养进程 | 同左 | `exp_v1/ps_after_kill.txt`、`exp_v2/ps_after_kill.txt` |
| 恢复时那次调用的记录 | 一直是 `running`，继续跑完之后也没变 | 改成 `{"type":"aborted","message":"Tool execution interrupted: shell"}` | `exp_v1/storage_final/part/…`；`exp_v2/db_rows.json` 的 `after_recovery` 序号 5 |
| 恢复后发给模型的请求 | 两条 system、「Write a note.」、「Continue.」——那次调用不在里面 | 原调用、它的中断结果、一条合成消息「The server restarted while you were working. Continue from where you left off without repeating completed work.」 | `exp_v1/model/req_0003.json`；`exp_v2/model/req_0003.json` |
| 恢复是否需要人发提示 | 需要（`--continue` 加一句提示） | 不需要：服务一起来就自己接上（`resume` 由执行声明触发） | 两边的 `timeline.txt` |
| 模型的反应 | 重新要求执行同一条慢命令 | 同左 | 两边的 `decisions.txt`（第 3 个请求 `tool:`） |
| `note.txt` 最后几行 | 2 行 `written` | 2 行 `written` | 两边 `timeline.txt` 末尾 |
| 会话序号 | — | 强杀时 11；恢复结束 27；`session_message` 的序号依次是 4、5、12、15、22、27 | `exp_v2/db_rows.json` |
| 执行声明 | — | 强杀时 `time_suspended` = 1791430443929；恢复成功后清空 | 同上 |

两份 2.0.24 数据库快照（约 6 MB，不入库）的 SHA-256：强杀后 `4b5b2581…16bde6d`（主文件）+ `b87d7885…694e6a`（WAL）；恢复后主文件同上 + `4745c030…16bde6d`（WAL）。

1.0.0 的行为与源码一致：`packages/opencode/src/session/message-v2.ts:577` 起，工具片段只有 `completed`（第 578 行）与 `error`（第 608 行）两种状态会转进发给模型的消息，其余落到第 630 行的 `return []`。

2.0.24 的行为与规范一致：`specs/v2/session.md:68`（执行声明、启动时恢复声明过的会话、追加一条续作指令）、`:78`（启动时把仍是 streaming/running 的调用判为失败，「never directly replays ambiguous side effects」）、`:116`（「cannot prove whether an interrupted external operation already took effect and does not guarantee exactly-once provider or tool behavior」）。合成消息的原文在 `packages/core/src/session/execution/restart.ts:16`，中断结果的原文在 `packages/core/src/session/runner/llm.ts:345`。

**这个实验说明什么、不说明什么**：它是同一个场景下两个版本各运行一次的结果。两边的 `note.txt` 都是两行，是因为被强杀的服务留下的子进程没有随之结束，而模型又执行了一次；这一点与 harness 的版本无关，片中如实说两边都是两行。实验不说明在真实模型下模型一定会重试，脚本模型的选择规则在画面上说明是「按脚本应答」。

**本地事件日志的说明**：2.0.24 的事件在同一个事务里投影进 `session_message` 等表，并推进 `event_sequence`；本地默认不保留事件原文（`packages/core/src/bus.ts:178` 起的 `persist` 选项缺省为 false，实验库里 `event` 表为 0 行），所以片中只说「带序号的事件、在同一个事务里写进表」，不说「保存了完整的事件日志」。

## 数字与日期总表

| 项 | 值 | 出处 | 核查 |
|---|---|---|---|
| OpenClaw 2.0 | `v2026.8.1`，发布于 2026-08-31T03:30:51Z | GitHub Releases API（`out_02_meta.json`）；`docs/releases/2026.8.1.md:2`「v2026.8.1 (AKA OpenClaw 2.0)」（v2026.9.8） | 已核实 |
| OpenCode v2.0.0 | 标签提交 `63f7ceec`，2026-09-11T23:46:37Z | GitHub API `commits/63f7ceec…`（`out_02_meta.json`） | 已核实 |
| 两者间隔 | 11 天（UTC 日期 08-31 → 09-11）；旁白说「不到两周」 | 同上 | 已核实 |
| OpenCode v2.0.24 | 标签提交 2026-10-06T03:04:12Z；v2.0.0–v2.0.24 共 25 个标签 | 同上；`repos/…/tags` | 已核实 |
| OpenCode v1.18.35 | 发布于 2026-10-06T20:18:39Z（v1 仍在发布） | Releases API | 已核实 |
| v2 的标签没有发布说明 | Releases API 里没有 v2.0.x（`releases/tags/v2.0.24` 返回 Not Found） | `out_02_meta.json` 的 `opencode_releases_v2_count` = 0 | 已核实（未入成片，只解释为何以源码与文档为准） |
| OpenCode 1.0 | `v1.0.0` 发布于 2025-10-31T19:28:15Z | Releases API | 已核实 |
| OpenCode 1.2 | 发布于 2026-02-14；「migrate all flat files in data directory to a single sqlite database」 | Releases API 正文（`out_02_meta.json`） | 已核实 |
| OpenCode 1.3 | 发布于 2026-03-22；「Node.js Support … opencode can now run on Node.js in addition to Bun」 | 同上 | 已核实 |
| OpenClaw 仓库 | 创建于 2025-11-24T10:16:47Z | GitHub API | 已核实 |
| warelay | 首个发布 `v0.1.1`（2025-11-25），README 标题「warelay — Send, receive, and auto-reply on WhatsApp—Twilio-backed or QR-linked.」 | Releases API；`v0.1.1` 的 README 第 1 行 | 已核实 |
| CLAWDIS | `v2.0.0-beta1`（2025-12-19，名称「clawdis 2.0.0-beta1」）；README 第 17 行「**CLAWDIS** is a TypeScript/Node gateway that bridges WhatsApp (Web/Baileys) and Telegram (Bot API/grammY) to a local coding agent (**Pi**).」 | Releases API；该标签的 README | 已核实 |
| 2.0 的规模 | 「16,977 pull requests, 698 direct commits, and 987 contributors」 | `docs/releases/2026.8.1.md:21`（v2026.9.8）。博客（2026-08-30）写的是「933 contributors」「over 16,000 pull requests」；成片只用发布说明里的 PR 数，不用贡献者人数 | 已核实（两路口径不同，取发布说明） |
| 星标（截至 2026-10-08） | OpenClaw 391,609；OpenCode 212,231 | GitHub API `stargazers_count` | 已核实（画面上标「截至 2026-10-08」） |
| 事件队列上限 | 4,096 | `specs/v2/event-stream-architecture.md:53` | 已核实 |
| 编码耗时的测量 | 1 个客户端 9.488 → 9.554 ms；10 个 96.312 → 10.352 ms；50 个 553.928 → 12.389 ms；Apple Silicon、Bun 1.3.14、8 KiB 事件、9 次取中位数 | 同文件第 203–209 行；旁白取 50 个客户端的 554 → 12 毫秒 | 已核实（项目自己的测量，画面上注明出处与条件） |
| 压缩保留 | `keep.tokens` 缺省 15,000 | `services/www/src/docs/content/compaction.mdx:10`、第 31 行附近的表 | 已核实 |
| 保温 | 缺省关闭；开启后空闲 4 分钟发一次，30 分钟后停 | `warming.mdx:18` | 已核实 |
| 重试 | 首次请求之外至多 4 次，带抖动的指数退避 | `specs/v2/session.md:84` | 已核实 |

## 逐章

### open

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| o1 | 2026 年 8 月 31 日，OpenClaw 发布 2.0 | 见总表（UTC 日期） | 已核实 |
| o2 | 不到两周，OpenCode 打出 v2.0.0 的标签 | 见总表；只说「标签」，因为 v2 没有发布说明 | 已核实 |
| o3、o4 | 一个在聊天软件里当个人助理，一个在终端里写代码 | OpenClaw README（v2026.8.1）标题「Your assistant, on your devices, in your chats」与首段「OpenClaw is an AI assistant that runs on your devices and meets you in the channels you already use」；OpenCode 仓库描述「The open source coding agent.」，`cli/index.mdx`「Run the CLI in a project to open the full-screen terminal interface」 | 已核实 |
| o5、o6 | 两次大改都有相当一部分在处理同一个问题：进程半路死掉之后还剩什么 | 概括。OpenClaw：2.0 发布说明「Messaging」一节「holds accepted messages through managed restarts … preserves an uncertain send instead of blindly sending it again」（`messaging.md:8`），「Installation and Onboarding」一节把会话与记录迁进 SQLite（`installation-and-onboarding.md:9`）；OpenCode：`specs/v2/session.md` 的「Execution Is Process-Local」「Recovery Boundaries Stay Explicit」两节 | 概括 |

### before（01 一年前的 harness）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| a1–a3 | harness 是包在模型外面的程序：把对话和工具清单发给模型、执行工具、把结果接回去 | 1.0.0 `prompt.ts:225`（循环）、`:257`（`streamText({`，参数里带 `tools` 与 `messages`）、`:412`（`finishReason === "tool-calls"` 时 `continue`）；OpenClaw v2026.8.1 `docs/concepts/agent-runtimes.md:24`「A **harness** is the implementation that provides an agent runtime」（本片只用通俗说法） | 已核实 |
| a4 | 2025 年 10 月 31 日 OpenCode 发布 1.0 | 总表 | 已核实 |
| a5–a7 | 它的核心是一个循环；每转一圈读出历史、请求一次模型；要调工具就再转一圈 | `prompt.ts:225–226`（`let step = 0` / `while (true) {`）、`:308`（`stopWhen: stepCountIs(1)`：每次只让模型走一步）、`:412–414` | 已核实 |
| a8 | 每条消息、每个片段各是一个 JSON 文件 | 实验 `exp_v1/storage_after_kill.txt`（`storage/message/<会话>/<消息>.json`、`storage/part/<消息>/<片段>.json`）；`storage.ts:170` 起 `write()` 把每个键写成 `<键>.json` | 实测、已核实 |
| a9 | 写入时整个存储共用一把写锁 | `storage.ts:170–175`：`using _ = await Lock.write("storage")`，锁名是固定字符串 `storage` | 已核实 |
| a10 | 运行中又来的消息，排队的状态只在进程内存里 | `prompt.ts:162–170`：会话忙时把回调推进 `state().queued`；`:72` 起它是 `new Map<…>()`。用户消息本身在此之前已经写盘，旁白因此说「排队的状态」 | 已核实 |
| h1–h3 | v1 自己也在变：2026 年 2 月的 1.2 把文件迁进 SQLite；3 月的 1.3 开始支持 Node.js | 总表（发布正文原句） | 已核实 |
| h4、h5 | OpenClaw 晚一个月出现；2025 年 11 月叫 warelay，一个在 WhatsApp 上收发、自动回复的工具 | 总表（仓库创建 2025-11-24，比 OpenCode 1.0 晚 24 天；README 标题） | 已核实 |
| h6、h7 | 12 月改名 CLAWDIS，成了一个网关，把 WhatsApp 和 Telegram 接到本机的编程智能体 Pi | 总表（`v2.0.0-beta1` README 第 17 行） | 已核实 |
| h8 | 也就是在一个 harness 外面再加一层网关 | 对 h7 的概括：Pi 是编程智能体（README 原文「a local coding agent」） | 概括 |
| a11、a12 | OpenClaw 到 2026 年 7 月的版本，会话也还是文件：一个 sessions.json 做索引，每个会话一份 JSONL | v2026.7.1（2026-07-13）`docs/concepts/session.md:116–117`：「Store: `~/.openclaw/agents/<agentId>/sessions/sessions.json`」「Transcripts: `…/sessions/<sessionId>.jsonl`」 | 已核实 |
| a13–a15 | 难的是它没有处理的那些时刻：进程半路退出、上下文装不下、几个客户端同时连接、一条命令该不该放行 | 概括，四项分别对应后文已核实的改动（恢复、压缩、后台服务与事件队列、审批与权限）。不声称 1.0.0 完全没有这些能力：1.0.0 有压缩（`session/compaction.ts`）与权限（`permission/`），旁白说的是「难的是」 | 概括 |
| a16 | 下面看两个 v2 在这些地方各改了什么 | 过渡 | — |

### claw（02 OpenClaw 2.0）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| c1 | 2.0 的版本号是 2026.8.1 | 总表 | 已核实 |
| c2 | 发布说明附了 16,977 个拉取请求的清单 | 总表 | 已核实 |
| c5–c7 | 重构文档记着的故障：Telegram 的更新已确认、回复已生成、进程在发送前重启、回复丢失 | v2026.8.1 `docs/concepts/message-lifecycle-refactor.md:30–37`（代码块原文「Telegram polling update acked -> assistant final text exists -> process restarts before sendMessage succeeds -> final response is lost」） | 已核实 |
| c8、c9 | 先把发送意图写进库，再调用平台；成功之后再记回执 | 同文件 `:39–44`「the send intent must be durable before the platform call is attempted, and the platform receipt must be committed after success」 | 已核实 |
| c10、c11 | 最难办的一段：接口调了、回执没写、进程死了，无法知道消息发没发出去 | 同文件 `:97–99`「The boundary that stays dangerous: after the platform call succeeds and before the receipt commits. If the process dies there, core cannot know whether the platform message exists」 | 已核实 |
| c12 | 记成 unknown_after_send | 同文件 `:100–106`；源码 `src/infra/outbound/delivery-queue-recovery.ts:238–242`（`send_attempt_started` 与 `unknown_after_send` 两种状态需要对账） | 已核实 |
| c13 | 只有通道核实「确实没发出」才允许重发 | 同文件 `:100–101`「classifies an interrupted send as `sent`, `not_sent`, or `unresolved`; only `not_sent` permits replay」 | 已核实 |
| c14 | 默认至少一次；通道能证明幂等才有恰好一次 | 同文件 `:43–46`「That gives at-least-once recovery by default. Exactly-once behavior only exists where an adapter proves native idempotency or reconciles an unknown-after-send attempt against platform state before replay.」 | 已核实 |
| c14b、c14c | 意图写不进库时，要求持久的通道直接失败；只有「尽力而为」的退回直接发送 | 同文件 `:89–94`「`required` fails closed when the durable intent cannot be written; `best_effort` falls through to a direct send when persistence is unavailable」 | 已核实 |
| c15–c17 | 收消息一侧：接收、待处理、完成，每步留记录，网关重启后从记录接着走 | 同文件 `:63`（`createDurableInboundReceiveJournal` — accept/pending/complete/release journal for inbound dedupe）；2.0 发布说明 `messaging.md:8`、`:14`（accepted messages stay pending through a managed restart） | 已核实 |
| c17b、c17c | Telegram：一条更新处理完才推进重启水位线；没处理完的重启后再来一遍 | 同文件 `:120–125`（`safeCompletedUpdateId`：「only advances the persisted restart watermark past updates that finished dispatch, so failed or still-pending updates replay after a restart」） | 已核实 |
| c17d–c17f | 运行中来消息默认注入这一轮；在跑的工具跑完，没开始的跳过，跳过的补合成错误结果，记录保持成对 | v2026.8.1 `docs/concepts/queue.md:28`（`mode: "steer"`）、`:33`、`:39`、`:82`「Skipped OpenClaw tool calls receive synthetic paired error results so the transcript remains valid」 | 已核实 |

### claw2

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| c18 | 2.0 把会话和对话记录从文件搬进 SQLite | 2.0 发布说明 `installation-and-onboarding.md:9`「This release changes how sessions and transcripts are stored by moving them into SQLite」 | 已核实 |
| c19、c20 | 每个智能体一个库放会话和记录；全局一个库放网关自己的状态 | v2026.8.1 `docs/refactor/database-first.md:16–19`（global database `state/openclaw.sqlite`、one SQLite database per agent）及其后两段（control-plane / data-plane）；`docs/concepts/session.md:201`（`…/agent/openclaw-agent.sqlite`） | 已核实 |
| c21 | 运行时只读写数据库，旧文件只交给迁移工具 | `database-first.md:109`「Runtime never writes or reads session or transcript JSONL as active state.」；同文件 `:108`「Legacy files are doctor migration inputs only.」 | 已核实 |
| c21b–c21d | 会话协作时，人或别的智能体可能改动其中一个；2.0 给每个会话一条带序号的信号日志，观察者只收到一条提醒，再按序号取回之后的变化 | v2026.8.1 `docs/concepts/session-state.md`（2.0 新增的文件，7.1 中没有）：`:15–17`（durable signal log、watchers、reconciliation）、`:70`（One pending notice per watcher/target pair）、「`session_status` with `changesSince: <version>`」 | 已核实 |
| c22–c24 | 一次审批绑定到具体的请求、命令、会话和人；第一个有效答复了结它，重连不能让它复活 | 2.0 发布说明 `security-and-privacy.md:6`（stay attached to the exact request, command, session, and person）、`:12`（The first valid answer settles it, reconnecting cannot revive a completed request） | 已核实 |
| c25–c27 | 凭据不进模型可见的文字；开启出网代理后，子进程拿到的是哨兵串，出网时才在绑定的主机上换成真值 | v2026.8.1 `docs/gateway/secrets.md:320`、`:322`（每个密钥要列出允许替换的确切主机）、`:350`（`$OPENAI_API_KEY` 是 `oc-sent-v2...end` 哨兵，只对 `api.openai.com` 替换）；2.0 发布说明 Highlights 的「Private credential requests」（opt-in proxy）。代理缺省关闭，旁白用「开启出网代理后」限定 | 已核实 |
| c28 | 2.0 还能接管别的编程智能体的会话，包括 OpenCode | `session-state.md:52`「Watched Claude, Codex, OpenCode, and Pi sessions adopted from a session catalog …」 | 已核实 |
| c29、c30 | 它的文档写着：OpenCode v1 的表不记每条消息的来源，只有 v2 的结构里有 | `session-state.md:54`「OpenCode's v1 tables do not preserve message provenance … per-message provenance exists only in its v2 schema」 | 已核实 |

### code（03 OpenCode v2）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| d1、d2 | 2026-09-11 打出 v2.0.0；10 月 6 日已是 2.0.24，v1 仍在并行发布 | 总表 | 已核实 |
| d3 | v2 删掉了原来的主包 | v1.18.35 有 `packages/opencode`（`packages/opencode/package.json:4` `"name": "opencode"`）；v2.0.24 的 `packages/` 下没有 `opencode` 目录（目录列表见本节末） | 已核实 |
| d4、d5 | Schema 定形状，Core 管执行和存储，Protocol 定接口，Server 对外，客户端由接口生成 | v2.0.24 `specs/v2/README.md` 的 Authority 表；`AGENTS.md:1`（改了 Protocol 或 Server 的 HttpApi 之后在 `packages/client` 里 `bun run generate`，不要手改生成的客户端）、`:2`（依赖方向 Schema → Core/Protocol → Server，客户端不依赖 Core 或 Server） | 已核实 |
| d6、d7 | 默认每个用户一个后台服务；终端、桌面、网页都连它；会话、权限、工具执行都归它 | `cli/index.mdx:48–49`「By default, OpenCode discovers or starts one shared background server for your user account. Every local OpenCode client connects to that server, which owns sessions, configuration, integrations, permissions, and tool execution.」；首页文档列出终端、桌面、网页三种界面（`index.mdx`）；实验里 `opencode run` 拉起了 `opencode serve --service`（`exp_v2/ps_before.txt`） | 已核实、实测 |
| d7b、d7c | 每个事件只编码一次；每个连接一条队列，上限 4,096；慢的超限就断开，不拖住别人 | `specs/v2/event-stream-architecture.md:51`（independent finite lag budget）、`:53`（capacity 4,096）及其后的四步 | 已核实 |
| d7d、d7e | 规范里测过：50 个客户端时，编码耗时从 554 毫秒降到 12 毫秒 | 同文件 `:203–209`（553.928 → 12.389 ms）。这是项目自己在 Apple Silicon、Bun 1.3.14 上对单一编码环节的测量，画面上注明 | 已核实 |
| d8、d9 | 会话里的每次变化都是一个带序号的事件，在同一个事务里写进表 | `packages/core/src/event/sql.ts:10–13`（`event` 表与 `aggregate_id`、`seq`）；`bus.ts` 在一个事务里调用投影并更新 `event_sequence`；实验库里会话序号推进到 27（见「实验」） | 已核实、实测 |
| d10 | 用户输入先进收件箱，默认在下一个安全的步边界插入 | `specs/v2/session.md:7`（`session.inbox.enqueued` 与 `session_inbox` 一行）、`:18`（`steer` is the default … at the next Safe Step Boundary） | 已核实 |
| d11 | 每一步开始前重新从库里读出历史 | `session.md:72`、`:80`（The runner never delegates orchestration to an in-memory tool loop） | 已核实 |
| d12 | 工具调用在产生副作用之前就已落库 | `session.md:74`；实验：强杀时调用已以 `running` 落库（序号 5） | 已核实、实测 |
| d13、d14 | 重试只管限流、服务端故障和传输失败；至多再试四次，指数退避带随机抖动 | `session.md:84`「Generic scheduled retry covers rate-limit and provider-internal failures, transport failures that are unsent or have unknown delivery, and provider output classified as an incomplete stream. The initial request plus at most four retries use jittered exponential backoff」。旁白省略了「不完整的流」一项，没有说「只有这三项」以外的反例；画面上列全四项 | 已核实 |

`packages/` 目录（v2.0.24）：ai app cli client codemode console containers core desktop effect-drizzle-sqlite enterprise function gui-extensions httpapi-codegen http-recorder identity latex merman plugin plugin-browser posts protocol schema script sdk server session-ui simulation stats storybook theme tui ui util web。

### crash（实验）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| e1–e5 | 实验的做法：按脚本应答的模型要求「先睡 20 秒，再往文件里追加一行」；命令开始约 4 秒后强杀；在 1.0.0 和 2.0.24 上各做一遍 | 「实验」一节。「约 4 秒」：1.0.0 工具开始于 `time.start` = 1791432014949（04:00:14.949Z），强杀记录在 04:00:19Z；2.0.24 `time.ran` = 1791430444073（03:34:04.073Z），强杀记录在 03:34:08Z | 实测 |
| e6 | 1.0.0 的记录里，这次调用一直停在 running | `exp_v1/storage_after_kill` 与 `storage_final` 中同一个片段都是 `running` | 实测 |
| e7 | 让它继续，发给模型的请求里这次调用不见了 | `exp_v1/model/req_0003.json` | 实测 |
| e8 | 源码里只有完成或出错的调用才会转进上下文 | `message-v2.ts:577`、`:578`、`:608`、`:630` | 已核实 |
| e9 | 2.0.24 只要重启服务就自己接上 | `exp_v2/timeline.txt`（03:34:09 重启，此后没有任何提示输入；第 3、4 个模型请求分别在之后发出） | 实测 |
| e10、e11 | 把调用记成「被中断」，再补一条消息：服务器重启过，不要重复已完成的工作 | `exp_v2/model/req_0003.json`；`db_rows.json` 序号 12 的 `synthetic` 行（`metadata.notice` = `restart`）；原文 `restart.ts:16`。中文旁白是对英文原文的转述，画面上显示英文原文 | 实测、已核实 |
| e12 | 模型这边只看到命令被中断；按脚本，它又执行了一遍 | `exp_v2/decisions.txt` 第 3 行；`exp_v2/model/req_0003.json`（模型收到的是中断结果与重启通知）；脚本模型的规则见 `10_scripted_model.mjs`（最后一条是用户消息就要求执行那条命令）。初稿写成「只知道命令被中断，于是又执行」，把规则决定的行为说成了推断，定稿前改掉 | 实测 |
| e13 | 被强杀的服务留下的那条命令其实还在跑 | `exp_v2/ps_after_kill.txt`（9656 号进程仍在，父进程已变） | 实测 |
| e14 | 文件里最后是两行；1.0.0 那边也是两行 | 两边 `timeline.txt` | 实测 |
| e15 | v2 的规范写明恢复不保证工具恰好执行一次 | `session.md:116` | 已核实 |
| e16 | 区别在于 v2 记下了发生过的事并如实告诉了模型 | 对 e6–e14 的概括 | 概括 |

### budget

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| f1–f3 | 快到上限时较早的对话压成结构化摘要，默认留下最近约 15,000 个 token | `compaction.mdx:10–12`（about 15,000 tokens by default）、`:16–17`（前后对照的示意） | 已核实 |
| f3b、f3c | 摘要分固定几项：目标、决定、已完成和进行中的工作、卡点和下一步、相关文件，另一个智能体能照着接手 | `compaction.mdx:131`「The summary is structured so another agent could pick the work up from it」、`:142–143`「It covers the objective and requirements, decisions, completed and active work, blockers and next moves, and relevant files」 | 已核实 |
| f4 | 工具输出太长，模型只看到开头和结尾，全文另存 | `specs/v2/tools.md:152`（head-plus-tail split；Oversized text is retained in managed storage and replaced with a bounded preview） | 已核实 |
| f5–f7 | 指令文件按内容哈希记差异；改动作为新的一条追加，前面的提示前缀不变 | `session.md:92`（content-addressed values、SHA-256、Later changes … project that text as a chronological System message）、`:94`。「缓存还能命中」是这样设计的目的：v2.0.24 `specs/v2/tools.md:144` 对同类设计写明「so the cached prompt prefix survives」；OpenClaw `AGENTS.md:142` 也写「Preserve old transcript bytes when possible」。旁白用「还能」而非「一定」 | 已核实（目的为概括） |
| f7b、f7c | 最后一步不许再调工具，工具定义照样发送，也是为了保住这段前缀 | `tools.md:144`「the final Step retains tool definitions with `toolChoice: "none"` where the provider supports it so the cached prompt prefix survives」 | 已核实 |
| f7d、f7e | 可以打开保温：空闲时每 4 分钟发一次请求，让服务商那边的缓存不过期 | `warming.mdx` 首段（preserve provider-side prompt caches）、`:18`（after four minutes … every four minutes until 30 minutes）；缺省关闭（同文件「It is disabled by default」），旁白用「可以打开」 | 已核实 |
| f8 | v2 不再运行语言服务器 | `migrate-v1.mdx:415–416` | 已核实 |
| f9 | v1 的插件要按新接口重写 | `migrate-v1.mdx:38`（V1 plugin implementations do not run in V2）及插件迁移文档 `build/plugins/migrate-v1.mdx` | 已核实 |

### lessons（04 学到了什么）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| l1 | 两边有几条共同的做法 | 概括，下列每条都回指前文 | 概括 |
| l2、l3 | 先记下来再动手：OpenClaw 先写发送意图，OpenCode 先把工具调用落库 | c8、d12 | 概括 |
| l4–l6 | 恢复时承认不知道：一边 unknown_after_send，一边记成被中断；都不承诺恰好一次 | c12–c14；e10、e15 | 概括 |
| l7、l8 | 记录始终成对：被跳过或被中断的工具调用都补上一条错误结果 | c17f（`queue.md:82`）；e10（中断结果） | 概括 |
| l9–l11 | OpenClaw 的仓库守则：注入模型的每一项都有硬上限；顺序确定，旧记录的字节尽量不变 | v2026.8.1 `AGENTS.md:143`「every injected prompt/tool-schema/context item is bounded with a hard cap; no unbounded items」、`:142`「deterministic ordering … Preserve old transcript bytes when possible」。这是写给在仓库里干活的贡献者（包括编程智能体）的守则，画面上写明文件名 | 已核实 |
| l12 | OpenCode 的压缩、截断与追加指令做的是同一件事 | f1–f7 | 概括 |
| l13–l15 | 授权绑定到具体那一次：OpenClaw 的审批绑定请求、命令、会话和人；OpenCode 的权限按顺序匹配，最后命中的生效 | c23；`permissions.mdx:24`「The last matching rule wins」 | 已核实 |
| l16、l17 | 只留一条路径：OpenClaw 的守则写重构默认只留一条规范路径 | `AGENTS.md:111`「Refactor default: one canonical path — delete the old one.」 | 已核实 |
| l18 | OpenCode v2 删掉了整个旧主包，旧插件不再加载 | d3、f9 | 已核实 |
| l19–l21 | 一年前 harness 的核心是循环；到了 v2，分量移到了循环外面：先写下的记录、有上限的上下文、绑定到具体请求的权限 | 对全片的概括 | 概括 |

### 画面上的示意

- 开场与第 01 章的循环图、消息与工具的往返是示意，已标「示意」；代码行是 v1.0.0 的原文（`prompt.ts`）。
- 第 02 章顶部的细轨与沿轨移动的消息气泡是示意：站序（故障 → 发送 → 接收 → 插话）是讲述顺序，不是消息在系统里的实际路径。故障一站右侧的 Telegram 对话、审批卡片里的请求号与命令是示意，画面上已标；状态名与字段名取自源码与文档原文。
- 第 03 章的分层图是按 `AGENTS.md:2` 与 `specs/v2/README.md` 画的示意；实验部分的终端画面由 `tools/gen_data.py` 从实验回显生成，内容是原文（只截取、不改写），时间轴的秒数取自回显。
- 两个项目的标志：OpenClaw 的吉祥物按 `ui/public/favicon.svg`（v2026.8.1，MIT 许可）的路径绘制，动作节奏取自该文件注释里写的官方节奏；OpenCode 的方块字标志按 `packages/tui/src/logo.ts` 与 `component/logo.tsx`（v2.0.24，MIT 许可）的字符与配色规则绘制。

## 取证中的旁支发现（没有进入成片）

- OpenCode v2 的标签在 GitHub Releases 里没有发布说明（`releases/tags/v2.0.24` 返回 Not Found）；v2 的文档在源码 `services/www/src/docs/content/` 下。
- 有第三方文章称 v2 的变化包括「从 Bun 迁到 Node」「桌面端从 Tauri 换成 Electron」。核对后：Node.js 支持在 v1.3.0 就已加入；v1.18.35 的 `packages/desktop/package.json` 已依赖 `electron 42.3.3`。这两项都不是 v2 才有的，成片不提。
- OpenCode 的 `2.0` 分支最后一次提交是 2026-04-13 的「2.0 exploration (#22335)」；v2 的仓库守则说默认分支是 `v2`，GitHub API 报告的默认分支是 `dev`。
- v1.18.35 已经带着 v2 的部分表（`session_message`、`session_input`、`event`）；v1 后期是逐步过渡的，所以本片的对照用 1.0.0。
- OpenClaw 的 2.0 发布说明与博客对规模的口径不同（987 / 933 位贡献者）。
- OpenClaw 在 2025-12-19 有过一个名为 `v2.0.0-beta1` 的 CLAWDIS 版本，与 2026 年 8 月的「OpenClaw 2.0」（`v2026.8.1`）不是一回事。成片不出现前者的版本号。
- OpenClaw 2.0 里 QMD 记忆引擎被移除（`database-first.md`「QMD has been removed」），OpenProse 插件也被移除（2.0 发布正文「OpenProse migration (breaking)」）。

## 制作署名

策划：WaterRun（依据：仓库制作规范）。

开源视频：[GitHub · Water-Run/ft](https://github.com/Water-Run/ft)（依据：仓库制作规范；交付前核对公开仓库页面并记录日期与结果）。

| 参与模型（含可确认的版本） | 实际分工 | 记录依据 |
|---|---|---|
| Claude Opus 5.5 | 取证（源码、文档、发布记录）、实验设计与运行、脚本与翻译、视觉设计、场景实现、配乐脚本、封面、审查 | 本次制作会话 |
| Microsoft Edge 在线语音（`zh-CN-YunyangNeural`、`en-US-AndrewNeural`，模型未披露） | 旁白合成 | `project.json` 的 `voices` |
| faster-whisper `small` | 旁白回听 | `asr.js` |

## 复核

**外部事实的联网复核**（2026-10-08，GitHub REST API 与公开页面）

| 项 | 复核结果 | 结论 |
|---|---|---|
| OpenClaw 2.0 = `v2026.8.1` | 发布记录 `published_at` 2026-08-31T03:30:51Z，名称「OpenClaw 2026.8.1」 | 与片中一致 |
| OpenCode `v2.0.0` | 标签提交 `63f7ceec`，2026-09-11T23:46:37Z | 一致 |
| OpenCode `v2.0.24` | 标签提交 `e7a34f09`，2026-10-06T03:04:12Z；仍是最新的 v2 标签 | 一致；片中写「到 10 月 6 日已是 2.0.24」，以日期为界 |
| v1 仍在发布 | 最新发布 `v1.18.35`，2026-10-06T20:18:39Z | 一致 |
| OpenClaw 之后的版本 | `v2026.9.8`（2026-10-03）、`v2026.10.1-beta.1/2`（10-05、10-08） | 不影响片中陈述（片中只讲 2.0，引文版本已标明） |
| 开源仓库 | `github.com/Water-Run/ft` 公开（`private=false`），页面 HTTP 200 | 片尾地址可访问 |

**三项核心审查**

- 事实（2026-10-08）：脚本对着本表逐句重读，并单独检索了「所以」「于是」「因此」一类因果词。改了一处：e12 原为「于是它又执行了一遍」，会被理解成模型自己的推断；脚本模型的规则写死了这一步，改为「按脚本，它又执行了一遍」（见 crash 一节 e12）。第 02 章示意图的说明按最终画面重写（见「画面上的示意」）。外部事实的联网复核见上表。
- 读音与节奏：`asr.js` 回听两种语言各 141 句，没有漏读、数字与版本号读错。中文整轨识别把 OpenClaw 多处写成「OpenCloud」，第 04 章 l12、l18 两句的 OpenCode 也被写成「OpenCloud」；`tts_probe.js` 单句合成再回听为「Open Claw」「Open Code」，判断为识别器受前文影响，读音正确。英文版 `Clawdis` 被识别为「Claudis」，与读法一致。`stats.js`：中文各章平均每秒 4.62–4.91 字，没有超过每秒 6.3 字的句子；英文各章平均每秒 2.56–3.01 词，有 21 句单句超过每秒 3.6 词（最快 4.14，l19），各章平均在范围内。
- 旁白与画面对应：两种语言每 4 秒一帧的总览图通看（中文全部 16 张，英文 17 张），逐句总览图见下。改掉的问题：第 03 章强杀实验镜头下移后进程列表要等句末才出现（空着约 2 秒）、OpenCode 后台服务面板空着约 2 秒、第 02 章末尾特写把右侧引文切成半截、第 04 章开头与最后一站各有约 0.3–0.5 秒空屏、发送一站的连线在卡片出现前露出端点。

**原创与动画完成度**：参考来源与品牌素材的许可写在本片 README「视觉系统」。两个项目的部分只取设计变量（颜色、字体、圆角、边框、标志），版式、图解与动效按本片内容设计。动画检查的范围：每 4 秒一帧的总览（两种语言）、每句一帧的总览、低清预演的静止与空画面检查、全分辨率片段按成片闸门参数的静止检测。改掉的问题见上；漂移的做法改了三轮（见 README「成片」）。

**片尾名单**：两种语言的片尾帧核对过，策划、制作（Claude Opus 5.5 与分工）、配音（Microsoft Edge 在线语音，模型未披露）、回听（faster-whisper small）、素材许可与「开源视频 github.com/Water-Run/ft」齐全，与上面的「制作署名」一致。英文版的「Listening check」标签原先压住右侧的值，已改。

**成片与闸门**（2026-10-08）：两种语言按 30 帧/秒渲染，渲染日志末行 `verified frames=17208`（中文）、`verified frames=17631`（英文）；音画长度 573.60 秒、587.70 秒，与脚本总长一致；响度 −16.5 LUFS / −15.6 LUFS，真峰值 −1.4 / −1.5 dBFS；成片的静止检测与空画面检测均无；`check.js --final` 全部通过。配乐与音效的听感、两种音色、连续播放的观感未经人确认。
