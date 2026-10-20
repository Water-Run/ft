# 事实

取证日期：2026-10-11。对象是模型外面负责工具、执行和上下文的那层程序，以及从早期工具调用到 Codex、Claude Code、DeepSeek Harness 的公开材料。本文件只登记陈述和依据。不规定本片的结构、时长分配、画面或措辞。

没有运行这三家产品，没有终端回显。来源编号见 `sources.json`。没有版本号的网页以读取日为准。

## 取证环境

| 材料 | 固定点 |
|---|---|
| DeepSeek Harness | 提交 `d743267388641bc76f17c45ce8b4c231aed1d32c`，2026-10-09T09:31:32Z，`master`。许可 MIT。下面引到的仓库文件都属于这次提交 |
| Codex CLI，发布当日说明 | `openai/codex` 提交 `704df1efa37617598c484f1a0f2e21dd185335a2`，2025-04-16T17:45:24Z，当时的 `README.md` |
| Codex CLI，2026-10 的默认分支 | 提交 `cc7ba33601286a751477832b01de7b6f8de0dd9c`，2026-10-10T22:28:01Z。只读了 README 开头 |
| Claude Code 的公开 GitHub 仓库 | `anthropics/claude-code` 提交 `2301018b1f61073c501a8e7a4813ef48c239163b`，2026-10-09T19:28:36Z。顶层没有代理循环的实现目录；递归树里没有路径名含 `src/`、`agent-loop` 或 `cli/src` 的条目。许可文件写明保留所有权利，使用受商业条款约束 |
| 其余公告和文档 | 见各条。Claude Code 与 Codex 的在线文档没有随页给出文档版本 |

## 原始材料里的定义

各条只代表该页自己的用词，不合并成一个定义。

| 陈述 | 依据 | 状态 |
|---|---|---|
| 在时间步 t，代理从环境收到观察 o_t，再按策略采取动作 a_t。上下文是此前的观察和动作加上当前观察。语言空间里的 thought 不改变外部环境，因此没有观察反馈；它只把信息写回上下文 | Yao 等，arXiv:2210.03629 的 HTML，ReAct 一节。v1 提交于 2022-10-06，读到的是 v3（2023-03-10）页面上的这一段。未读全文 | 已读该段 |
| 推理为主的任务上，轨迹由多个 thought、action、observation 步骤交替组成。文中的 HotpotQA 例子把步骤写成 Thought N、Action N、Observation N，动作包括 Search、Lookup、Finish | 同一 HTML。问答例子与 “multiple thought-action-observation steps” 那句 | 已读摘录。文中的成功率数字未核，不引用 |
| 2023-06-13，开发者可以向 `gpt-4-0613` 和 `gpt-3.5-turbo-0613` 描述函数。模型选择输出一份符合函数签名的 JSON 参数。公告把它说成把 GPT 接到外部工具和 API 的方式，并举了 `send_email`、`get_current_weather`、内部 API 和 `sql_query` | OpenAI，*Function calling and other API updates*，2023-06-13，Function calling 一节 | 已读。该节没有写「程序执行函数之后把结果送回模型」 |
| 同一节写：自 ChatGPT plugins 的 alpha 以来，工具输出中的不可信数据可以指示模型做未预期的事。对发信、发帖、购买这类会留下外界后果的动作，开发者应加入用户确认 | 同一节末段 | 已读。plugins alpha 的发布日不在这页上 |
| 没有工具时 Claude 只能以文本回答。工具使其能读代码、改文件、跑命令、搜索网页和调用外部服务。每次工具使用把信息送回循环 | Claude Code 文档 *How Claude Code works*，Tools。读取日 2026-10-11 | 已读该节。页会改 |
| 该页把代理循环写成 gather context、take action、verify results，并写明这些阶段会混在一起。提供工具并管理模型所见上下文的周围一层，被称作 agentic harness。页中「Claude chooses」「Claude decides」指模型在推理 | 同一页，The agentic loop | 已读 |
| 2026-01-23，OpenAI 把 Codex CLI 里编排用户、模型和工具的核心逻辑叫做 agent loop，并把这一角色称作 agent 或 “harness”。Codex harness 提供核心循环和执行逻辑，位于 CLI、云和 VS Code 扩展之下 | Michael Bolin，*Unrolling the Codex agent loop*，2026-01-23，开头 | 已读 |
| DeepSeek Harness 的 README：它是 DeepSeek 的开源 agent harness，架构是 everything-is-a-plugin，由 Cordis 驱动；开发者预览，会有不兼容变更；许可 MIT | README，提交 `d743267` | 已读 README。未读 Cordis 论文 `arXiv:2608.25512`，不描述 Cordis 内部 |
| 仓库 README 没有「Agent = Model + Harness」这句 | 同一 README 全文 | 已读。营销页上若有这句，本次没有整页核对，不采用 |

## 一轮在各份材料里怎么走

三份材料的计数单位不一样。下表不把它们换成同一个词。

| 陈述 | 依据 | 状态 |
|---|---|---|
| Claude 的 Agent SDK 文档把循环写成五步：收到提示、系统提示、工具定义和历史；模型给出文本、工具调用或两者；SDK 执行工具并收集结果；重复，直到一次回应不再包含工具调用；再交出最终结果。它把一次工具往返称为一个 turn，并写明这条循环就是 Claude Code 的执行循环 | *How the agent loop works*，The loop at a glance 与 Turns and messages。读取日 2026-10-11 | 已读 |
| 模型按任务决定调用哪个工具。调用能否执行由 allowed tools、disallowed tools 和 permission mode 决定。被拒绝时，模型收到拒绝消息作为工具结果 | 同一页，Tool permissions | 已读 |
| 只读工具（Read、Glob、Grep，以及标为只读的 MCP 工具）可以并行。Edit、Write、Bash 顺序执行。文档列出的内置类别包括文件 Read/Edit/Write，搜索 Glob/Grep，执行 Bash，网页 WebSearch/WebFetch，以及 Agent、Skill 等编排工具 | 同一页，Built-in tools 与 Parallel tool execution | 已读。这是 SDK 页对 Claude Code 工具的列举，不是某次安装的实测清单 |
| 许可文档：规则按 deny、ask、allow 的顺序取第一条匹配。更窄的 allow 不能从 deny 里挖出例外。原文：Permission rules are enforced by Claude Code, not by the model。提示和 `CLAUDE.md` 影响模型尝试做什么，不改变 Claude Code 允许什么。PreToolUse hook 的 allow 也不能压过匹配的 deny 或 ask | *Configure permissions*。读取日 2026-10-11。页内还提到 v2.1.234 之前的排队行为，说明该页描述的是阅读时的现行文档 | 已读这些段落 |
| Codex 文章中的循环：用户输入进入提示；推理后，模型或者给出最终回应，或者请求工具调用；代理执行调用，把输出追加到提示，再查询；直到模型不再发出工具调用，而以给用户的消息结束。从一次用户输入到这次结束可以包含许多次推理和工具调用。文章把这一整段称为对话的一个 turn（Codex 里也叫 thread）。每次结束都有一条助手消息，即使主要产物是磁盘上的代码 | Bolin，2026-01-23，The agent loop | 已读 |
| 上下文窗口同时计入输入和输出 token。管理窗口是代理的职责之一。Codex CLI 经 Responses API 做推理；用 ChatGPT 登录时端点写的是 `https://chatgpt.com/backend-api/codex/responses`，用 API key 时是 `https://api.openai.com/v1/responses` | 同一文，The agent loop 末与 Model inference | 已读。端点是文章写下时的说法 |
| 文章里的 `tools` 例子包括 CLI 提供的 `shell`（参数含 command、workdir、timeout_ms）、`update_plan`、Responses API 的 `web_search`，以及用户经 MCP 配置的函数。放进提示的沙箱说明只约束 Codex 提供的 `shell`。MCP 工具不在这个沙箱里 | 同一文，Building the initial prompt | 已读。文中源码链接指向更早的提交，没有在 `cc7ba336` 上重核行号 |
| DeepSeek 术语：turn 是把一次已接纳的输入排空，直到模型和工具停下或策略终止。step 是一次模型请求加上该次回应引起的工具执行。一个 turn 可以有零个或多个 step。round 是外层策略迭代，例如 goal round，不把会话里的每个 turn 都数进去 | `docs/glossary.md`，loop hierarchy，提交 `d743267` | 已读 |
| 生命周期文档：driver 写 `turn/start`，组装系统提示，跑 `agent/pre-step`，再写 `step/start` 并向 `ctx.llm` 发请求。成功的助手消息之后按 executionMode 分类工具调用，记录 `tool/call`，做 pre 与 execute，再以 `tool/result` 写回，然后 `step/end`。自然停止且没有下一步输入时有 `agent/turn-stopping`，最后 `turn/end`。`session/event` 是可重放记录；`agent/*` 是实时协调，不作为重放副本 | `docs/agent-lifecycle.md` 开头的序列和图下三段，同一提交。文件标明由 `scripts/gen-doc-graphs.ts` 生成 | 已读开头。未逐事件对照生成脚本 |
| 工具管线：从助手消息中的工具调用块到 `tool/call`，再进入 `tools/pre-execute`（hooks、permission、sandbox）。拒绝或审批不通过则跳过工具本体。其后还有 guards、`tools/execute`、`tools/post-execute`，最后一条面向模型的 `tool/result` | `docs/tool-execution-pipeline.md` 开头，同一提交。同为生成文档 | 已读开头 |
| 压缩：`dsh-compaction-basic` 在 `agent/pre-step` 处理压力，只在约定的上下文溢出上使用 `agent/request-error`。修剪或摘要推进了替换代际时，才在当前 step 内重试 | `docs/agent-lifecycle.md` 图下关于 compaction 的段 | 已读该段。未读压缩算法本身 |

对照（本文件的归纳，不是某一家的原句）：三份材料都写了「模型发出调用，程序执行，结果回到后续请求，直到不再调用」。Claude 文档里的 turn 接近一次工具往返，也接近 DeepSeek 的 step。Bolin 文里的 turn 接近一次用户发话直到助手把话交还，DeepSeek 用 turn 指一次输入排空，两者都比单次工具往返长，但是否同边界没有并排实验。

## 日期和仓库

| 陈述 | 依据 | 状态 |
|---|---|---|
| ReAct v1 提交于 2022-10-06。读到的修订是 v3，2023-03-10 | arXiv 摘要页的版本记录 | 已读 |
| 函数调用公告的日期是 2023-06-13，作者署名为 Atty Eleti、Jeff Harris、Logan Kilpatrick | 该公告页眉与文末 | 已读 |
| `anthropics/claude-code` 的 `created_at` 是 2025-02-22T17:41:21Z | GitHub API | 已核 |
| 2025-02-24，Anthropic 公告 Claude 3.7 Sonnet，并介绍命令行工具 Claude Code，当时是有限研究预览。Claude Code 一节写明它可以搜索和阅读代码、编辑文件、编写并运行测试、提交并推送到 GitHub、使用命令行工具 | *Claude 3.7 Sonnet and Claude Code*，2025-02-24 | 已读开头和 Claude Code 一节 |
| 同一公告的 SWE-bench 附录把一种「更简单的脚手架」写成：模型在一次会话里自己决定跑哪些命令、改哪些文件；主要的无扩展思考 pass@1 给模型两个工具，一个 bash，一个通过字符串替换编辑文件，另加一个 planning 工具。附录同时提到更重的做法，例如 Agentless 的检索、定位和 best-of-N，以及其他脚手架里的重试、best-of-N 或 MCTS。附录里的百分数是评测分数，不在这里转引 | 同一文，Appendix，SWE-bench Verified，Information about the scaffolding | 已读该附录。这是评测脚手架的描述，公告没有写它等于后来 Claude Code 产品的工具表 |
| `openai/codex` 的 `created_at` 是 2025-04-13T05:37:54Z。API 报告的许可是 Apache-2.0。许可证文件开头是 Apache License 2.0，2004 年 1 月 | GitHub API 与仓库 `LICENSE` | 已核 |
| 该仓库在 2025-04-16 有两条消息为 “Initial commit” 的提交：`59a180ddec4adaf9760972cdb1eb89f06a81be8b`（16:56:08Z）和 `ae7b518c53cfb29cea518e5506a61dcec80edcee`（17:00:18Z）。同日 17:45:24Z 的 `704df1ef` 更新了 README | GitHub commits API，`until=2025-04-16T18:00:00Z` | 已核 |
| 2025-04-16 17:27 UTC，Sam Altman 发文：因 o3 和 o4-mini 擅长写代码，所以发布新产品 Codex CLI；它是跑在用户计算机上的编码代理；完全开源，当天可用 | 帖子 https://x.com/sama/status/1912558495997784441 | 已读帖文 |
| 2025-04-16 的 o3 / o4-mini 公告开头写的是这两个模型在 ChatGPT 和 API 中使用工具。读过的开头没有宣布 Codex CLI。Bolin 文说 CLI 于四月首次发布，并把链接指到这篇公告 | *Introducing OpenAI o3 and o4-mini*，2025-04-16，开头；Bolin 文首段 | 已读这两处。不能把 o3 公告的正文当成 CLI 发布声明 |
| 2025-05-16 的 *Introducing Codex* 介绍云端软件工程代理，并在 Updates to Codex CLI 写：上个月发布了 Codex CLI，一个在终端里运行的轻量开源编码代理 | 检索工具返回的该文页面文本，日期行 May 16, 2025，以及 “Last month, we launched Codex CLI” 那一节 | 页文已见。本次没有用浏览器再打开一遍 |
| 2026-02-02 的 *Introducing the Codex app* 写 “Since we launched Codex in April 2025” | 该文页面文本 | 页文已见 |
| DeepSeek Harness 仓库 `created_at` 为 2026-08-13T11:56:32Z。2026-10-11 列出的 releases 里，返回集合中最早一条是 `dsh-v0.1.0-rc.7`，发布于 2026-08-17T12:01:58Z。第二页为空。读到的 `master` 是合并 `release-0.2.1-alpha.2` 的 `d743267`，对应标签 `dsh-v0.2.1-alpha.2`，发布于 2026-10-09T11:09:26Z | GitHub API：仓库、commits、releases | 已核这次返回。更早的未发布提交不在 releases 里 |

## 三份实现材料各自写了什么

材料的日期不同。同一产品前后两份说明不一致时，两条都保留，不取较新的覆盖较旧的。

### Codex CLI 在 2025-04-16 的 README

提交 `704df1ef` 的 README 自称为 lightweight coding agent that runs in your terminal。它写可以运行代码、改文件，并在版本控制之下迭代。

`--approval-mode` 三种模式：

| 模式 | README 写的、可不询问而做的事 | 仍要批准的事 |
|---|---|---|
| Suggest，默认 | 读仓库里的任何文件 | 所有文件写入或补丁；所有 shell / Bash 命令 |
| Auto Edit | 读，以及把补丁写到文件 | 所有 shell / Bash 命令 |
| Full Auto | 读、写、执行 shell | 表内没有剩余项 |

Full Auto 下每条命令网络禁用，并限制在当前工作目录和临时文件。目录不是 Git 仓库时，auto-edit 或 full-auto 启动会警告。macOS 12+ 用 Seatbelt，默认可写根包括 `$PWD`、`$TMPDIR`、`~/.codex`，出站网络默认全阻。Linux 一段推荐 Docker，仓库以读写挂载，防火墙拒绝除 OpenAI API 以外的出站。系统要求写 macOS 12+、Ubuntu 20.04+ / Debian 10+，或经 WSL2 的 Windows 11；Node.js 写 “22 newer”。

这是该提交的 README，不是 2026 年文档。

### Codex 在 2026 年另两份说明里的不同说法

| 陈述 | 依据 | 状态 |
|---|---|---|
| 2026-10-10 的 README 开头仍写 Codex CLI 是在本机运行的编码代理，并把它和 IDE 扩展、桌面应用、云端 Codex Web 分成不同入口 | 提交 `cc7ba336` 的 README 开头 | 已读开头。没有重读批准模式一节，不能用它证明 2025-04-16 的三档模式还在 |
| 现行 CLI 参考把 `--full-auto` 标为已弃用的兼容旗标，并写优先使用 `--sandbox workspace-write`。`--ask-for-approval` 的取值包括 untrusted、on-request、never；on-failure 标为弃用 | `https://developers.openai.com/codex/cli/reference` 的检索页文。页上日期显示 2026-07-01 | 页文已见。没有对应当时的 git 提交 |
| 非交互文档写 `codex exec` 默认在只读沙箱中运行；`--sandbox workspace-write` 允许编辑；`--sandbox danger-full-access` 允许更宽访问，并要求只在受控环境使用。`codex exec --full-auto` 同样标为弃用 | `https://developers.openai.com/codex/noninteractive` 的检索页文，日期显示 2026-07-01 | 页文已见 |
| 一份 CLI 概述写 Codex CLI 在 macOS 和 Linux 可用，Windows 支持是实验性的，并建议 Windows 使用 WSL | `https://developers.openai.com/codex/cli/` 的检索页文，日期显示 2026-04-06 | 页文已见。与 2025-04-16 README 的 “Windows 11 via WSL2” 不是同一句，两句都只在各自日期成立 |
| Bolin 文里的 shell 沙箱只约束 CLI 自带的 shell，不约束 MCP。这和 2025-04-16 README 里「Full Auto 的每条命令都网络禁用」不是同一套开关 | 两份已读材料 | 不能并成一句 timeless 的安全说明 |

### Claude Code

| 陈述 | 依据 | 状态 |
|---|---|---|
| 2025-02-24 公告中的能力列表是搜索、阅读、编辑、写并运行测试、提交和推送、使用命令行工具 | 公告 Claude Code 一节 | 已读 |
| 2026-10-11 的文档把工具分成文件、搜索、执行、网页和编排，并把许可执行放在 Claude Code 而不是模型 | 上面两页文档 | 已读。不是源码行号 |
| 公开仓库的顶层是说明、变更日志、插件、脚本和示例。递归查询没有找到名为实现源码树的路径。许可文件是 “All rights reserved” 和商业条款，不是 OSI 开源许可 | 提交 `2301018b` 与 `LICENSE.md` | 已核这次树查询。没有人工打开每一个插件子目录，因此「插件目录里没有任何代码」不是已证陈述 |
| 文档写 Claude Code 会在上下文变满时先清旧的工具输出，再摘要对话；把持久规则放在 `CLAUDE.md`。子代理使用自己的上下文窗口 | *How Claude Code works*，The context window 与 Subagents | 已读。没有测量某个会话的 token |

### DeepSeek Harness，提交 d743267

| 陈述 | 依据 | 状态 |
|---|---|---|
| `dsh-base` 是共享核心：模型连接、全套工具、可跨重启的会话，以及工作区安全默认。带上这个核心的配置档包括文档点名的 web、headless、sdk、acp。`sdk-minimal` 故意不用这棵共享树 | `packages/bundle/base/README.md`，Summary 与 Use this package | 已读 |
| 该核心写出的全套工具包括文件编辑、shell、网页搜索、公开 HTTP(S) 抓取、子代理、任务和目标跟踪。默认许可把文件写入限制在工作区，并在风险动作前询问。网页抓取不逐次审批，其提供者拒绝非公开目的地。默认文件编辑工具是 `read`、`write`、`edit`。`str_replace_editor` 要在补丁里显式加入 | 同一 README，What you get | 已读 |
| macOS 和 Linux 使用 bash shell 工具，Windows 使用对应的 PowerShell。同一台机器只有一套 shell。`working_directory` 改变后续操作的目录，不改变已经存在的进程和写权限 | 同一 README，Shell tools per platform 与 working_directory 段 | 已读 |
| `sdk-minimal` 默认向模型公布的工具是持久 shell 和 `working_directory`。Linux / macOS 为 bash，Windows 为 pwsh。它排除 `dsh-base`、文件系统工具、工作区说明、技能、子代理和压缩等。danger-full-access 允许 shell 修改进程能访问的路径，文档要求只配合隔离工作区 | `packages/bundle/sdk-minimal/README.md`，Summary 与 Model Experience | 已读。因此「极简档是一个 shell 加一个文件编辑器」与这份 README 冲突 |
| 没有配置 MCP 服务器时，这个档不增加 MCP 工具。配置了才会把服务器的工具加进去 | 同一 README，Use this package | 已读 |

## OpenCode

材料分两段，不并成「它一直是同一种程序」。

| 陈述 | 依据 | 状态 |
|---|---|---|
| GitHub 仓库 `anomalyco/opencode` 的 `created_at` 是 2025-04-30T20:08:00Z。API 报告许可 MIT，默认分支 `dev`，描述是 “The open source coding agent.”。`sst/opencode` 的 API 返回同一个仓库，不是另一个 fork 父仓库 | GitHub API，2026-10-11 | 已核。仓库何时从 `sst` 改名，这次没有读改名事件 |
| 2025-04-30 的提交 `0e8842a007aefd28aff2d429263e690a05861f57` 的树里有 `go.mod`、`main.go`、`cmd/`。同一提交的 README 写 “OpenCode is a Go-based CLI application”，TUI 用 Bubble Tea，并写模型可以执行命令、搜索文件、修改代码 | 该提交的目录列表与 README 开头 | 已读 |
| 提交 `f3da73553c45f17e04b1e77cb13eb0fca714d1bd`（2025-05-31，说明是 “sync”，commits API 把它列为最后一次碰到 `go.mod` 的提交）的树上已经没有 `go.mod` | 对该 ref 取 `go.mod` 得到 404 | 已核文件不在。没有读这次 diff，不写「这一行删除了它」 |
| 2025-06-24 的提交 `2384c7e734eb0316bc3f1f85bd1ca2983547a1e2` 已碰到 `packages/opencode/package.json` | commits API，`path=packages/opencode/package.json`，`until=2025-07-01` | 已核该路径在此之前被提交碰到。没有读文件正文 |
| 2026-10-11 的 `dev` 提交 `0d61729b3fa005cec9aa754c075a809663c736a4` 的 README 自称 “The open source AI coding agent.”。内置代理：`build` 是默认的、开发用的全权限代理；`plan` 是只读代理，跑 bash 前会请求许可。另有一个叫 `general` 的 subagent，用于复杂搜索和多步任务。可用 Tab 在 build 和 plan 之间切换 | 该提交 README 的 Agents 一节 | 已读该节。没有读工具实现，不列工具文件名 |
| Charm 的 `charmbracelet/crush` 在 README 读到的部分没有写自己是 OpenCode 的 Go 分支。仓库 `created_at` 是 2025-05-21，但 2025-05-15 已有提交 | Crush README 检索与 commits API | 「Go 那一支变成了 Crush」本次不采用 |

## Pi

固定提交 `ea448f454af474f3e2fe9733b331e17b0662f5d6`，2026-10-10T19:29:35Z，`main`。仓库 `earendil-works/pi`，`created_at` 2025-08-09T14:03:50Z，API 报告许可 MIT。描述是 “AI agent toolkit: unified LLM API, agent loop, TUI, coding agent CLI”。

| 陈述 | 依据 | 状态 |
|---|---|---|
| README 称 Pi 是 “a minimal, extensible agent harness that you can make your own.”。它写自己带默认能力，但不包括 sub-agents 和 plan mode。扩展、技能、提示模板和主题用 TypeScript，并可打成包 | README 开头，该提交 | 已读 |
| 安装要求 Node.js 22.19 或更新。Windows 安装命令写在 README 里 | 同一 README，Getting started | 已读 |
| 包表里和循环直接相关的是 `@earendil-works/pi-agent-core`（“Agent runtime with tool calling and state management”）和 `@earendil-works/pi-coding-agent`（交互式 CLI）。另有统一的多提供商 API `pi-ai` | 同一 README，Packages | 已读表。没有读这些包的实现 |
| `how-pi-works.md`：一次提交的消息进入当前分支；Pi 用系统提示、分支、可用工具和模型设置组请求，经所选提供商送出。回应可以含文本和工具调用。Pi 记录回应、执行每个工具调用、记录结果，这构成一个 turn。若结果或排队消息还需要再问模型，就再开始一个 turn | `packages/coding-agent/docs/how-pi-works.md`，Agent loop，该提交 | 已读该节 |
| 同一文档：会话是一棵树，当前路径是 active branch，下一步模型请求用这条分支上的历史。压缩会插入一条摘要，替换后续请求里的较旧消息；原条目仍留在树里 | 同一文档，Context 与 Sessions | 已读 |
| 扩展是载入 Pi 进程的 TypeScript 模块，可以注册工具、命令、提供商和界面。启用的工具使用启动 Pi 的那个操作系统用户的权限 | 同一文档，Extensions 与 Trust and permissions | 已读 |
| README 的 Permissions 一节：Pi 没有内建的、用来限制文件系统、进程、网络或凭据的许可系统。默认以启动它的用户和进程的权限运行。更强的边界要靠容器或沙箱 | README，Permissions & Containerization | 已读 |
| `usage.md`：Pi 不会在每次工具调用前询问。文档要求查看命令和改过的文件，对不可信或无人值守的工作使用沙箱 | `packages/coding-agent/docs/usage.md`，该提交 | 已读该段 |
| `security.md`：把模型生成的命令和代码视为不可信。观看记录、项目信任和复查改动并不构成安全边界。项目信任决定是否加载目录提供的设置和资源，不限制工具调用能碰到什么 | 同一提交的 `security.md` 开头 | 已读开头 |
| 该提交的 `packages/coding-agent/src/core/tools/` 导出 read、write、edit、bash、powershell、grep、find、ls 等工具定义 | `index.ts` 与目录列表 | 已读导出。因此「Pi 只有 read、write、edit、bash 四个工具」与这次提交不符，不采用 |

## 不进入定稿的句子

| 句子 | 原因 |
|---|---|
| 某人在某一天发明了 harness 或 harness engineering | 二次文章对署名不一致。本次没有打开那些原始帖 |
| DeepSeek 把代理定义成 Model + Harness | 已读的 README 没有这句 |
| DeepSeek 极简模式等于 shell 加文件编辑器 | 与 `d743267` 的 `sdk-minimal` 冲突 |
| 2025-04-16 的 o3 公告正文发布了 Codex CLI | 读过的开头没有这句话。当日的发布证据是仓库提交、当日 README 和 Sam Altman 的帖 |
| 2021 年的 OpenAI Codex 模型于 2023-03 退役 | 只在未重开的页面摘要里见过。本文件不使用 |
| 2025-05-22 Claude Code 一般可用，或任何更晚的产品发布日 | 本次没有打开对应公告 |
| Pi 只有四个工具 | 与 `ea448f45` 的工具导出不符。read、write、edit、bash 之外还有 powershell、grep、find、ls |
| OpenCode 的 Go 版本后来变成 Charm Crush | Crush 已读部分的 README 没有这句话 |
| 换 Harness 使同一模型的基准上升某个百分数 | 没有打开原始评测 |
| 三家 turn 的边界已经用同一次任务量过 | 只有文档对照，没有运行 |
| 任何耗时、token 数、失败次数、界面截图 | 没有运行记录 |

## 2026-10-18 复核

这一天为写中文稿重开了下面这些材料。没有运行 Codex、Claude Code、OpenCode、Pi 或 DeepSeek Harness。提交号没有更换。网页没有版本号的，以这一天读到的正文为准；和 2026-10-11 的摘录不一致时，两条都留，不取新的覆盖旧的。

| 陈述 | 依据 | 状态 |
|---|---|---|
| 没有工具时，Claude 只能以文本回答。提供工具并管理模型所见上下文的周围一层，称作 agentic harness。页中 “Claude chooses” 指模型在推理 | *How Claude Code works*，The agentic loop 与 Tools。读取日 2026-10-18 | 已读。10 月 11 日的摘录没有这句对 harness 的直接定义；这句以 10 月 18 日的页为准 |
| 同一页把循环写成 gather context、take action、verify results，并写这些阶段会混在一起。上下文变满时先清旧的工具输出，再摘要对话 | 同一页 | 已读。与 10 月 11 日摘录一致 |
| Agent SDK 页仍把循环写成五步：收到提示、系统提示、工具定义和历史；模型给出文本、工具调用或两者；SDK 执行并收集结果；重复到一次回应不再包含工具调用；再交出结果。一次工具往返称为一个 turn | *How the agent loop works*，The loop at a glance 与 Turns and messages。读取日 2026-10-18 | 已读。与 10 月 11 日摘录一致 |
| 被拒绝时，模型收到拒绝消息作为工具结果。只读工具可以并行，Edit、Write、Bash 顺序执行 | 同一页，Tool permissions 与 Parallel tool execution | 已读 |
| 许可规则仍由 Claude Code 执行，不由模型执行。提示和 `CLAUDE.md` 不改变 Claude Code 允许什么。规则按 deny、ask、allow 取第一条匹配。更窄的 allow 不能从 deny 里挖出例外 | *Configure permissions*，Manage permissions。读取日 2026-10-18 | 已读。与 10 月 11 日摘录一致 |
| 同一天的文档另有权限模式。`auto` 在 shell 和网络请求等动作之前用分类器审查，而不是逐次询问。*How Claude Code works* 写：交互终端和 VS Code 在 v2.1.283 或更新版本上，Auto 是内建的起始模式 | *Configure permissions* 的 Permission modes；*How Claude Code works* 的 Control what Claude can do | 已读。10 月 11 日的记录没有这套模式。不能把「程序决定准不准」写成「总是询问使用者」 |
| 2023-06-13 的函数调用公告仍写：模型为 `gpt-4-0613` 和 `gpt-3.5-turbo-0613` 输出符合函数签名的 JSON。该节没有写谁把结果送回。工具输出中的不可信数据可以指示模型做未预期的事；发信、发帖、购买这类动作应有用户确认 | OpenAI，*Function calling and other API updates*，日期行 June 13, 2023 | 已重读该节。页上另有 July 20, 2023 的模型延期说明，不把它当成函数调用的发布日 |
| Bolin 文日期仍是 January 23, 2026。开头把 Codex 里编排用户、模型和工具的逻辑称作 agent 或 harness。从一次用户输入到助手把话交还，称为对话的一个 turn。沙箱说明只约束 Codex 提供的 shell，不约束 MCP 工具 | *Unrolling the Codex agent loop* | 已重读这些段。文中指向更早提交的行号没有在新提交上重核 |
| ReAct v3 HTML（2023-03-10）仍写：语言空间里的 thought 不改变外部环境，因此没有观察反馈，只把信息写回上下文。推理为主的轨迹由 thought、action、observation 交替组成 | arXiv HTML 2210.03629v3，ReAct 一节 | 已重读该节。文中的成功率数字仍不引用 |
| DeepSeek README 在 `d743267` 仍自称 open-source agent harness，架构 everything-is-a-plugin，开发者预览，许可 MIT。`sdk-minimal` 默认向模型公布的工具仍是持久 shell 和 `working_directory`，排除文件系统工具 | 上述提交的 README 与 `packages/bundle/sdk-minimal/README.md` | 已重读这些段。`docs/glossary.md` 的 turn / step / round 本次没有重开，沿用 2026-10-11 对同一提交的摘录 |
| Pi 在 `ea448f45` 的 README 仍写 minimal, extensible agent harness，并写没有内建的文件系统、进程、网络或凭据许可系统，默认以启动它的用户和进程的权限运行。`usage.md` 仍写不会在每次工具调用前询问 | 同一提交的 README Permissions 与 `packages/coding-agent/docs/usage.md` | 已重读这两处。`how-pi-works.md` 的 turn 定义本次没有重开 |
| OpenCode 在 `0d61729` 的 README 仍写：`build` 是默认的全权限代理；`plan` 默认拒绝文件编辑，跑 bash 前请求许可；可用 Tab 切换 | 同一提交 README 的 Agents 一节 | 已重读该节 |

本片归纳，不是某一家的原句：三份仍在使用的循环描述都包含「模型发出调用，程序执行，结果进入下一次请求，直到不再调用」。做之前问不问，写在 Claude、Codex、OpenCode 的规则或模式里，不写在这个共同循环里。Pi 的两份文档写明它不逐次询问。三家 turn 的差异仍只来自文档对照，没有并排实验。DeepSeek 的那一条沿用 2026-10-11 的 glossary 摘录。

## 文案审查

中文稿在 `src/js/script.js`。2026-10-18 写稿，2026-10-19 导出交审，指定校对者 WaterRun，尚未确认。稿本是 `review/script.zh.e30c6fea6b84a047c0a1bf7eab2f828a77385f48ed4b89a859779100d818a8bb.md`。说明、术语和取舍在 `review/NOTES.md`。英文是对照草稿，不在本轮确认范围。

## 制作署名

策划：WaterRun。

| 参与模型 | 分工 | 依据 |
|---|---|---|
| Grok 4.7 | 2026-10-11：事实记录，并按当天要求删去讲法规定。没有写旁白 | 本文件原「制作署名」与本片 README |
| Grok 4.7 | 2026-10-18：复核上表所列材料，补记 Claude Code 的许可模式，写中文稿和英文对照草稿，定终端视觉方案。2026-10-19：复测时间线并导出中文校对稿。没有配音，没有写正片场景 | 本轮会话。片尾名单与此表一致 |

仓库：https://github.com/Water-Run/ft 。

## 复核

没有成片。2026-10-18 的重读见上一节。
