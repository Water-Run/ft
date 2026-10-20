# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。
按仓库 `docs/guides/research.md` 阅读原始来源并做独立交叉核查；模型输出、记忆与搜索摘要只作线索。待核实的内容不能进入定稿，标题、字幕、封面与译文同样要核查。
实验脚本与完整回显放在 `research/lab/`；第三方源码、安装包等大文件放在 `research/_src/`（不入库），这里只记版本与获取方式。

## 环境与版本

取证日期：2026-10-20。全部源码结论以同一份检出为准：`openai/codex` 的提交 `8196bcdc189ad2c189d631b321fa54b8e09b9bb0`（`main` 分支，提交时间 2026-10-20T03:11:07Z）。片中引用代码时给出 `路径:行号`，一律以这个 SHA 为准；换版本须重录行号。

| 项 | 版本 | 获取方式 |
|---|---|---|
| `openai/codex` 检出 | `8196bcdc189ad2c189d631b321fa54b8e09b9bb0`（`main`，2026-10-20T03:11:07Z） | `git clone --no-single-branch https://github.com/openai/codex.git`；检出记录见 `research/lab/out_11_checkout_codex.txt` |
| 仓库许可证 | Apache License 2.0（文件 `LICENSE`，SHA-256 `AA5E89EDCBBD01FC3FB188A527D8BDC0DA5812305CAB220C84348C14EA427288`）；另有 `NOTICE` | 同上回显第 3 节。GitHub API 亦报告 `apache-2.0` |
| 仓库元数据 | `created_at` 2025-04-13T05:37:54Z；主语言 Rust；默认分支 `main`；仓库描述 "Lightweight coding agent that runs in your terminal" | `https://api.github.com/repos/openai/codex`，读取日 2026-10-20 |
| 官方文档 | OpenAI Codex 文档（`learn.chatgpt.com/docs/...`，每页有 `.md` 版本）；OpenAI API 弃用页 | 见下表各条的直达 URL，读取日均为 2026-10-20 |
| 官方博客 | Michael Bolin，*Unrolling the Codex agent loop*，2026-01-23 | `https://openai.com/index/unrolling-the-codex-agent-loop/`，读取日 2026-10-20 |
| 取证环境 | Windows 11 / PowerShell 7.6.7 / git 2.55.0.windows.3 / Node v24.21.0；工作区在检出后为 clean | `research/lab/out_11_checkout_codex.txt` 第 1、2 节 |

本轮没有运行 Codex CLI 本身：运行它需要 ChatGPT 登录或 API key，按 `docs/guides/research.md` 第 5 节不入库。片中凡涉及「一次任务实际跑起来」的段落，须写成源码与官方文档所述的路径，不得写成实测。本片因此不做演示回显；若后续要补实测，须另起编号的脚本并单独记录。

## 逐章

### 第 01 章 现象：终端里那个会自己动手的程序

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 01-01 | Codex CLI 是 OpenAI 的编码智能体，跑在用户自己的电脑上 | `README.md`（`8196bcdc`）开头："Codex CLI is a coding agent from OpenAI that runs locally on your computer." | 官方文档 `https://learn.chatgpt.com/docs/codex/cli.md` 首段（"Inspect, edit, and run code from your terminal"）；GitHub API 仓库描述 "Lightweight coding agent that runs in your terminal" | `8196bcdc`；文档读取日 2026-10-20 | 2026-10-20 已核 |
| 01-02 | 仓库主体是 Rust，不是 JavaScript 或 Python | 检出里 `.rs` 文件 5394 个，`.ts` 772 个，`.py` 198 个；`codex-rs/` 下 112 个 crate 目录 | GitHub API `language: "Rust"` | `8196bcdc`；统计脚本 `out_12_codex_layout_codex.txt` 第 2、3 节 | 2026-10-20 已核 |
| 01-03 | 顶层的 `codex-cli/` 只是一个 7 个文件的 JavaScript 包装层，真正的主体在 `codex-rs/` | `codex-cli/package.json:2` `"name": "@openai/codex"`、`:6-7` `"bin": {"codex": "bin/codex.js"}`；`codex-cli/bin/codex.js:1-2` 注释 "Unified entry point for the Codex CLI." | `out_12_codex_layout_codex.txt` 第 5 节；`out_14_codex_history_codex.txt` 第 3 节 | `8196bcdc` | 2026-10-20 已核 |
| 01-04 | 真正体量最大的几块：核心 435,793 行 Rust、TUI 432,572 行、app-server 187,256 行 | `out_12_codex_layout_codex.txt` 第 4 节（按扩展名统计的 .rs 文件数与行数） | 无第二来源；本条是本片自测的规模统计，片中只作量级参考 | `8196bcdc`；统计日 2026-10-20 | 2026-10-20 已核（自测统计） |

### 第 02 章 它是什么：一个 CLI，不是 2021 年那个 Codex 模型

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 02-01 | OpenAI 官方把 Codex 的一部分开源、另一部分不开源：Codex CLI、Codex SDK、Codex Security CLI、Codex Security TypeScript SDK、Codex App Server、Skills、Plugins 有源码；**IDE 扩展与 Codex cloud 明确标注 "Not open source"** | `https://learn.chatgpt.com/docs/open-source.md`（读取日 2026-10-20）的 "Open-source components" 表 | 仓库内对应物存在：`codex-rs/app-server`（358 个 .rs 文件）、`sdk/{python,python-runtime,typescript}` | 文档读取日 2026-10-20；仓库 `8196bcdc` | 2026-10-20 已核 |
| 02-02 | 2021 年 OpenAI 发布的那个 Codex 是一组 API 模型（`code-davinci-002`、`code-davinci-001`、`code-cushman-002`、`code-cushman-001`），官方弃用页记录其**公告日 2023-03-20、关停日 2023-03-23** | `https://developers.openai.com/api/docs/deprecations.md`（读取日 2026-10-20）"2023-03-20: Codex models" 一节 | 同页 "2023-07-06: GPT and embeddings" 一节另列 `code-davinci-002` 的替代关系；`code-davinci-002` 亦见 `2024-01-04` 关停表 | 文档读取日 2026-10-20 | 2026-10-20 已核（日期与模型名已核） |
| 02-03 | 这组 API 模型与本片讲的 CLI 不是同一件东西：CLI 仓库 2025-04-13 才创建，2025-04-16 才有前两次提交，README 自述是「跑在本地电脑上的编码智能体」，许可为 Apache-2.0 | 仓库创建时间与描述：`https://api.github.com/repos/openai/codex`（`created_at` 2025-04-13T05:37:54Z）；首两次提交：`out_11_checkout_codex.txt` 第 4 节（`59a180dd…`、`ae7b518c…`，均为 2025-04-16 "Initial commit"）；README 首段见 01-01；许可见 02-04 | 与 02-02 相互独立：一个是 API 模型族，一个是 2025 年才出现的本地程序 | 仓库 `8196bcdc`；API 读取日 2026-10-20 | 2026-10-20 已核。**由两份一手来源推出的结论**；本轮没有找到系列说明所称的「官方 FAQ 原文」，片中不引用不存在的 FAQ 原句 |
| 02-04 | 仓库以 Apache-2.0 发布 | `LICENSE` 首三行 "Apache License / Version 2.0, January 2004"；SHA-256 `AA5E89ED…` | GitHub API `license.spdx_id: "Apache-2.0"`；`codex-cli/package.json:5` `"license": "Apache-2.0"` | `8196bcdc` | 2026-10-20 已核 |
| 02-05 | 仓库不收外部代码贡献，只收 issue 与 PR | `https://learn.chatgpt.com/docs/open-source.md` 末段："doesn't accept external code contributions or pull requests" | 仓库 `docs/contributing.md` 存在（`out_12_codex_layout_codex.txt` 第 5 节） | 文档读取日 2026-10-20 | 2026-10-20 已核 |

### 第 03 章 一次任务的完整回合

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 03-01 | 一次回合是这样一个循环：每次采样请求，模型要么给出请求调用的函数、要么给出一条助手消息；模型要函数调用就执行它并把输出送回下一次采样请求；模型只给助手消息就记进历史、回合结束 | `codex-rs/core/src/session/turn.rs:158-172`（函数上方的说明注释）、`:173` `pub(crate) async fn run_turn(` | OpenAI 官方博客 *Unrolling the Codex agent loop*（2026-01-23）的 "The agent loop" 一节描述同一循环（用户输入 → 模型回复工具调用或最终回应 → 执行并追加输出 → 直到模型不再发出工具调用） | `8196bcdc`；博客 2026-01-23 | 2026-10-20 已核（源码与官方博客互为印证） |
| 03-02 | 回合开始前先做一次「预采样压缩」，估算即将进入上下文的条目，超过阈值就先压缩 | `codex-rs/core/src/session/turn.rs:196-206`（`:196-199` 注释说明这一步在新输入记入之前发生、并会估算待进入的条目；`:200-206` 调用 `run_pre_sampling_compact`），该函数定义在同文件 `:1379` | 官方博客同文讲压缩：超阈值后把 `input` 换成一份更小、但能代表对话的条目列表；并说明现在改用 Responses API 的 `/responses/compact` 端点，触发条件是 `auto_compact_limit` | `8196bcdc`；博客 2026-01-23 | 2026-10-20 已核 |
| 03-03 | 每回合创建一个模型客户端会话，用它发起 Responses API 请求，并缓存 Responses 的 WebSocket 连接 | `codex-rs/core/src/client.rs:11-12` 的模块说明："A `ModelClientSession` is created per turn and is used to stream one or more Responses API requests during that turn. It caches a Responses WebSocket connection (opened lazily)…" | 官方博客同文 "Model inference" 一节写 Codex CLI 经 Responses API 做推理 | `8196bcdc` | 2026-10-20 已核 |
| 03-04 | 模型提出的工具调用被统一转成内部调用对象再分发；只有无副作用的调用可以并行 | `codex-rs/core/src/tools/router.rs:257` `pub fn build_tool_call(...)`、`:313` `pub async fn dispatch_tool_call_with_code_mode_result(`、`:246` `pub fn tool_supports_parallel(...)` | 无第二来源；片中只讲「统一转成内部调用再分发」这一层，并行那一条若要讲需再核 | `8196bcdc` | 2026-10-20 已核（转分发部分）；并行判定 2026-10-20 已核但未与官方文档交叉 |

### 第 04 章 关键机制：两个开关，一套 OS 级沙箱

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 04-01 | 沙箱模式是三个枚举值：`read-only`（默认）、`workspace-write`、`danger-full-access` | `codex-rs/protocol/src/config_types.rs:104-114`（`:105-107` read-only 且标 `#[default]`、`:109-110` workspace-write、`:112-113` danger-full-access） | 官方文档 `https://learn.chatgpt.com/docs/agent-approvals-security.md`（读取日 2026-10-20）"Sandbox and approvals" 一节列出同样三档 | `8196bcdc`；文档读取日 2026-10-20 | 2026-10-20 已核 |
| 04-02 | 审批策略是另一组枚举：`untrusted`（内部策略，项目被标为不受信时命令都要审批）、`on-request`（默认，由模型决定何时问）、`granular`（按类别细分的自动批准/拒绝）、`never`（从不问，失败直接回给模型） | `codex-rs/protocol/src/protocol.rs:1097-1120`（`:1100-1102` untrusted、`:1104-1107` on-request 且标 `#[default]`、`:1114-1115` granular、`:1117-1119` never）；细分类别见 `:1123-1137` `GranularApprovalConfig` | 官方文档同页写 "Sandbox mode: What Codex can do technically" 与 "Approval policy: When Codex must ask you before it executes an action" 两层分工；`https://learn.chatgpt.com/docs/developer-commands.md` 记 `--ask-for-approval` 取值与 `--sandbox` 取值 | `8196bcdc`；文档读取日 2026-10-20 | 2026-10-20 已核 |
| 04-03 | 官方文档已说明 `untrusted` 这一档审批策略被取消，不再支持 | 官方文档 `https://learn.chatgpt.com/docs/agent-approvals-security.md` 首节 "Migrate from the retired `untrusted` approval policy" | 源码里 `untrusted` 仍作为枚举值存在（`protocol.rs:1100-1102`，注释写 "Internal policy for projects marked untrusted"） | 文档读取日 2026-10-20；源码 `8196bcdc` | 2026-10-20 已核。**两处并存**：源码保留枚举值并降级为内部策略，文档说用户侧不再支持；片中须按此说法，不写成「已删除」 |
| 04-04 | 沙箱由操作系统强制：macOS 用 Seatbelt 策略并以 `sandbox-exec` 执行；Linux 默认用 bubblewrap 加 seccomp；Windows 用原生 MXC，另有 elevated / unelevated 两个旧实现兜底 | 源码：`codex-rs/sandboxing/src/seatbelt.rs:21`（`include_str!("seatbelt_base_policy.sbpl")`）、`:58` 注释只认 `/usr/bin/sandbox-exec`；`codex-rs/sandboxing/src/landlock.rs:22` 注释 "The helper performs the actual sandboxing (bubblewrap by default + seccomp)"、`:7` `CODEX_LINUX_SANDBOX_ARG0 = "codex-linux-sandbox"`；`codex-rs/sandboxing/src/bwrap.rs:20` `SYSTEM_BWRAP_PROGRAM = "bwrap"`；`codex-rs/sandboxing/src/windows_mxc.rs:1` "Native Windows MXC capability discovery"；`codex-rs/sandboxing/src/windows.rs:6` `WindowsSandboxLevel`、`:17-18` 讲 elevated 与 unelevated restricted-token | 官方文档 `https://learn.chatgpt.com/docs/agent-approvals-security.md` "OS-level sandbox" 一节：macOS 用 Seatbelt 与 `sandbox-exec -p`；Linux 用 `bwrap` + `seccomp`；Windows 支持 MXC，elevated / unelevated 为 legacy 兜底 | `8196bcdc`；文档读取日 2026-10-20 | 2026-10-20 已核（源码与官方文档互为印证） |
| 04-05 | 沙箱 CLI 可以在本机用同一套策略跑一条命令，方便直接看沙箱把什么挡住 | `codex-rs/cli/src/debug_sandbox.rs:49` `pub async fn run_command_under_seatbelt(`、`:88`/`:96` `run_command_under_landlock(`、`:168` `enum SandboxType`、`:397` 起按类型分派 | 官方文档 `https://learn.chatgpt.com/docs/developer-commands.md` "Test the sandbox locally" 一节给出 `codex sandbox macos / linux / windows` 的用法与 `codex sandbox seatbelt`、`codex sandbox landlock` 别名 | `8196bcdc`；文档读取日 2026-10-20 | 2026-10-20 已核 |
| 04-06 | 默认不联网；`workspace-write` 下要联网需显式开 `sandbox_workspace_write.network_access` | 官方文档 `https://learn.chatgpt.com/docs/agent-approvals-security.md` "Network access" 一节给出配置片段 | 源码 `codex-rs/protocol/src/config_types.rs` 与 `codex-rs/network-proxy` 存在对应类型（`out_13_codex_mechanisms_codex.txt` 第 1 节） | 文档读取日 2026-10-20 | 2026-10-20 已核（文档侧）；源码侧只确认类型存在，未逐行核配置解析 |
| 04-07 | 工具侧把「可审批」与「可沙箱化」作为能力抽象出来，由运行时统一编排 | `codex-rs/core/src/tools/sandboxing.rs:1-5` 模块说明："Shared approvals and sandboxing traits used by tool runtimes. … (`Approvable`) together with the sandbox orchestration traits and helpers (`Sandboxable`, `ToolRuntime`, `SandboxAttempt`, etc.)" | 无第二来源 | `8196bcdc` | 2026-10-20 已核 |

### 第 05 章 特色与边界：仓库里有什么，没什么

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 05-01 | 开源的边界是官方写死的：CLI、SDK、Security CLI、Security 的 TypeScript SDK、App Server、Skills、Plugins 有源码；IDE 扩展与 Codex cloud 没有 | `https://learn.chatgpt.com/docs/open-source.md` 的 "Open-source components" 表（IDE extension 与 Codex cloud 两行写 "Not open source"） | 仓库里找不到 IDE 扩展的实现目录（`out_13_codex_mechanisms_codex.txt` 第 9 节） | 文档读取日 2026-10-20 | 2026-10-20 已核 |
| 05-02 | App Server 在开源仓库里，CLI 可以用 `--remote` 连到它，TUI 与 app-server 之间是网络协议 | `codex-rs/app-server` 目录（358 个 .rs 文件、187,256 行，`out_12_codex_layout_codex.txt` 第 4 节） | 官方文档 `https://learn.chatgpt.com/docs/developer-commands.md`："Use `--remote ws://host:port` … to connect the TUI to an app server started with `codex app-server --listen ws://IP:PORT`" | `8196bcdc`；文档读取日 2026-10-20 | 2026-10-20 已核 |
| 05-03 | 官方还说明 `codex mcp-server` 已被移除，改用 app server | 官方文档 `https://learn.chatgpt.com/docs/developer-commands.md` "`codex mcp-server`" 一节："The `codex mcp-server` command and standalone `codex-mcp-server` binary have been removed." | 仓库 `codex-rs/mcp-server` 不存在（顶层 crate 列表 `out_12_codex_layout_codex.txt` 第 3 节只作数量统计，未逐项核对；此项以文档为准） | 文档读取日 2026-10-20 | 2026-10-20 已核（文档侧） |
| 05-04 | 不开源的部件能观察到什么：IDE 扩展与 Codex cloud 只能从官方文档与其自身界面观察，本片不拿文档当源码讲 | 官方文档 `https://learn.chatgpt.com/docs/open-source.md`（仅给开源表，不给这两者源码）；`https://learn.chatgpt.com/docs/codex/ide.md` 与 `https://learn.chatgpt.com/docs/cloud.md` 存在但本次未逐段读 | 推断依据：官方开源表把这两项标为 "Not open source"，且仓库内无对应实现目录 | 文档读取日 2026-10-20 | 2026-10-20 已核（边界本身）；两份 IDE / cloud 文档尚未逐段读，片中若引用其具体说法须先补读 |

### 第 06 章 沿革

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 06-01 | 仓库建于 2025-04-13，最早两条提交都在 2025-04-16，消息都是 "Initial commit" | `https://api.github.com/repos/openai/codex`（`created_at` 2025-04-13T05:37:54Z）；`out_11_checkout_codex.txt` 第 4 节：`59a180ddec4adaf9760972cdb1eb89f06a81be8b`（2025-04-16T12:56:08-04:00）、`ae7b518c53cfb29cea518e5506a61dcec80edcee`（2025-04-16T13:00:18-04:00） | 该 SHA 已在 `videos/harness/research/FACTS.md` 记录过（同一份一手来源） | 仓库 `8196bcdc`；API 读取日 2026-10-20 | 2026-10-20 已核 |
| 06-02 | 官方博客的源码链接指向 `codex-rs/core/src/codex.rs`；这个文件今天已经不在，代理循环搬到了 `codex-rs/core/src/session/turn.rs` | 迁移提交 `71e4c6fa17884097fedd5bf2e49c55dfb6ccc70e`（2026-04-17，"Move codex module under session (#18249)"），该提交同时删掉 `codex-rs/core/src/codex.rs` 并新增 `codex-rs/core/src/session/turn.rs`（`out_14_codex_history_codex.txt` 第 2 节） | 官方博客正文里的链接（2026-01-23 写，指向 commit `99f47d6`）与当前检出的文件位置不一致，这处不一致本身就是沿革证据 | `8196bcdc`；博客 2026-01-23 | 2026-10-20 已核 |
| 06-03 | 上一代留下的痕迹之一：顶层 `codex-cli/` 是 npm 包 `@openai/codex` 的 JS 启动壳，只负责按平台找到并拉起 Rust 二进制 | `codex-cli/package.json:2,5,6-7`；`codex-cli/bin/codex.js:1-2`、`:16-23`（平台 → npm 包名映射）、`:88-93`（拼出 `vendor/<target-triple>/bin/codex`） | `out_12_codex_layout_codex.txt` 第 5 节（`codex-cli/` 共 7 个文件） | `8196bcdc` | 2026-10-20 已核 |
| 06-04 | 上一代留下的痕迹之二：仓库里有一批显式命名为 `legacy` 的文件与兼容代码 | `out_14_codex_history_codex.txt` 第 4 节列出 18 个 legacy 命名文件，其中 `codex-rs/protocol/src/legacy_events.rs:70-73` 说明是「把规范化的事件生命周期转回旧的原始事件流」 | 无第二来源 | `8196bcdc` | 2026-10-20 已核 |
| 06-05 | 上一代留下的痕迹之三：Linux 沙箱有新旧两条路径，旧路径的开关 `use_legacy_landlock` 仍在代码里 | `codex-rs/cli/src/debug_sandbox.rs:293-295`（读 `use_legacy_landlock`）、`:459`（传入沙箱参数） | 官方文档 `https://learn.chatgpt.com/docs/agent-approvals-security.md` 记 WSL1 支持到 Codex `0.114`，从 `0.115` 起 Linux 沙箱改用 `bwrap`；源码 `codex-rs/sandboxing/src/lib.rs:96` 有 `Wsl1UnsupportedForBubblewrap` | `8196bcdc`；文档读取日 2026-10-20 | 2026-10-20 已核 |
| 06-06 | 仓库自己的 CHANGELOG 不记条目，改指 GitHub Releases | `CHANGELOG.md:1`："The changelog can be found on the [releases page](https://github.com/openai/codex/releases)." | `out_14_codex_history_codex.txt` 第 6 节 | `8196bcdc` | 2026-10-20 已核 |

### 第 07 章 小结

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 07-01 | 一句话总结：Codex CLI 是一层 Harness——它把「用户一句话」变成「模型请求 → 工具执行 → 结果回填」的循环，并用两个独立开关（沙箱模式、审批策略）决定模型能做什么、什么时候要问你 | `codex-rs/core/src/session/turn.rs:158-173`；`codex-rs/protocol/src/config_types.rs:104-114`；`codex-rs/protocol/src/protocol.rs:1097-1120` | 官方文档 `https://learn.chatgpt.com/docs/agent-approvals-security.md` "Sandbox and approvals" 一节给出同样的两层分工 | `8196bcdc`；文档读取日 2026-10-20 | 2026-10-20 已核 |
| 07-02 | 需要记住的边界：IDE 扩展与 Codex cloud 不开源，讲到它们只能讲「能观察到什么」 | `https://learn.chatgpt.com/docs/open-source.md` | 05-01 | 文档读取日 2026-10-20 | 2026-10-20 已核 |

## 文案审查

<!-- 文案稿经指定校对者 WaterRun 人工审查并明确确认后才配音（见 docs/guides/script-review.md）。逐轮记录交审日期、内容 SHA-256、校对记录的链接与结论；逐句意见在 review/NOTES.md 留存，避免维护两份全文。确认之后的实质改动另起一轮。 -->

| 轮次 | 交审日期 | 稿本 | 审查意见与修改 | 结论与日期 |
|---|---|---|---|---|

## 制作署名

策划：WaterRun（依据：project.json 的 production.planner，交付前核对实际参与）。

开源视频：[本片源码](https://github.com/Water-Run/ft)（依据：project.json 的 production.repository；交付前核对公开仓库页面并记录日期与结果）。

<!-- 按实际制作记录填写，涵盖准备、制作、审查等环节；名称与可确认的版本不得推测。服务未披露模型时写明服务、用途与「模型未披露」。片尾、README 与委托片 DELIVERY.md 使用同一名单。 -->

| 参与模型（含可确认的版本） | 实际分工 | 记录依据 |
|---|---|---|
| MiniMax M3.1 Flash | 取证、事实表与开工反馈应用（子任务执行） | 本次会话运行时标识 `minimax-M3.1-Flash` |
| MiniMax M3.1 Flash | 片单重构、目录搭建与反馈记录校验（主会话） | 主会话记录 |

配音与渲染尚未开工。片尾名单以上表为准，另在 README「制作署名与片尾」一节同步。

## 复核

<!-- 记录核查范围、日期、依据、发现的问题、更正与复查结论；覆盖三项核心审查、原创与动画完成度、片尾名单。未做的写「未做」，待核查的不得写成通过。 -->

本轮（2026-10-20）只完成立项与取证。成片后的复核未做。
