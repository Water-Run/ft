# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。
按仓库 `docs/research.md` 阅读原始来源并做独立交叉核查；模型输出、记忆与搜索摘要只作线索。待核实的内容不能进入定稿，标题、字幕、封面与译文同样要核查。
实验脚本与完整回显放在 `research/lab/`；第三方源码、安装包等大文件放在 `research/_src/`（不入库），这里只记版本与获取方式。

## 环境与版本

取证日期：2026-10-20。全部源码结论以同一份检出为准：`anomalyco/opencode` 的提交 `16c338372a67121819248db970c9f287ccb450a9`（`dev` 分支，提交时间 2026-10-19T22:25:29-05:00）。片中引用代码时给出 `路径:行号`，一律以这个 SHA 为准；换版本须重录行号。

| 项 | 版本 | 获取方式 |
|---|---|---|
| `anomalyco/opencode` 检出 | `16c338372a67121819248db970c9f287ccb450a9`（`dev`，2026-10-19T22:25:29-05:00） | `git clone --no-single-branch https://github.com/anomalyco/opencode.git`；检出记录见 `research/lab/out_11_checkout_opencode.txt` |
| 旧地址 | `sst/opencode` 仍解析到同一仓库（GitHub API 返回同一个 repo id `975734319`，`full_name` 为 `anomalyco/opencode`） | `https://api.github.com/repos/sst/opencode`，读取日 2026-10-20 |
| 仓库许可证 | MIT License（文件 `LICENSE`，SHA-256 `B5C625D157735F04E1B2B7CECCEE849130B554BDB23CD58DB55A38A257EFBBDD`）；`:3` "Copyright (c) 2025 opencode" | 同上回显第 3 节。GitHub API 亦报告 `mit` |
| 仓库元数据 | `created_at` 2025-04-30T20:08:00Z；主语言 TypeScript；默认分支 `dev`；描述 "The open source coding agent."；主页 opencode.ai | `https://api.github.com/repos/anomalyco/opencode`，读取日 2026-10-20 |
| 官方文档 | OpenCode 文档（`opencode.ai/docs/...`），**文档源文件就在本仓库内**：`packages/web/src/content/docs/`，共 33 个 `.mdx` | `out_12_opencode_layout_opencode.txt` 第 5 节；在线页 `https://opencode.ai/docs/permissions/`，读取日 2026-10-20 |
| 取证环境 | Windows 11 / PowerShell 7.6.7 / git 2.55.0.windows.3 / Node v24.21.0；工作区在检出后为 clean | `research/lab/out_11_checkout_opencode.txt` 第 1、2 节 |

本轮没有运行 OpenCode 本身：运行它需要模型账号或 API key，按 `docs/research.md` 第 5 节不入库。片中凡涉及「一次任务实际跑起来」的段落，须写成源码与官方文档所述的路径，不得写成实测。本片因此不做演示回显；若后续要补实测，须另起编号的脚本并单独记录。

## 逐章

### 第 01 章 现象：终端里那个会自己动手的程序

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 01-01 | OpenCode 是开源的 AI 编码智能体，有终端界面、桌面应用和 IDE 扩展三种形态 | `packages/web/src/content/docs/index.mdx:15`："**OpenCode** is an open source AI coding agent. It's available as a terminal-based interface, desktop app, or IDE extension." | `README.md` 标题下 "The open source AI coding agent."；GitHub API 仓库描述 "The open source coding agent." | `16c33837`；文档读取日 2026-10-20 | 2026-10-20 已核 |
| 01-02 | 主体是 TypeScript，跑在 Bun 上；不是 Go，也不是 Node 原生 | 检出里 `.ts` 4378 个、`.tsx` 740 个、`.mdx` 630 个；根 `package.json` 的 `packageManager` 为 `bun@1.4.2`；有 `bun.lock`、`bunfig.toml` | GitHub API `language: "TypeScript"` | `16c33837`；统计见 `out_12_opencode_layout_opencode.txt` 第 2、6 节 | 2026-10-20 已核 |
| 01-03 | 不是一个程序，是一堆包：核心 163,368 行、模型层 74,318 行、TUI 36,731 行、CLI 22,785 行、服务端 8,843 行、插件 3,291 行 | `out_12_opencode_layout_opencode.txt` 第 4 节（.ts 文件数与行数） | 无第二来源；本条是本片自测的规模统计，片中只作量级参考 | `16c33837`；统计日 2026-10-20 | 2026-10-20 已核（自测统计） |

### 第 02 章 它是什么：OpenCode 这个名字的三段

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 02-01 | 最早是 Go 写的终端程序：README 自述 "OpenCode is a Go-based CLI application"，TUI 用 Bubble Tea，仓库里有 `go.mod`、`go.sum`、`main.go`、`cmd/`、`internal/`、`pkg/` | 重写前一次提交 `f3da73553c45f17e04b1e77cb13eb0fca714d1bd^` 的 `README.md` 与顶层树（`out_14_opencode_history_opencode.txt` 第 3 节） | 该 README 的 Features 段列出 Bubble Tea、LSP、会话管理、文件改动跟踪等 | `16c33837`；历史提交 `f3da7355`（2025-05-30） | 2026-10-20 已核 |
| 02-02 | 2025-05-30 的一次提交把 Go 实现整个换成了 TypeScript：同一次提交删掉 `go.mod`、新增 `packages/opencode/package.json`；该提交是当前 HEAD 的祖先 | 提交 `f3da73553c45f17e04b1e77cb13eb0fca714d1bd`（2025-05-30T20:48:36-04:00，消息 "sync"）；`git merge-base --is-ancestor` 返回 0（是祖先） | `out_14_opencode_history_opencode.txt` 第 2 节；当前检出里 `go.mod` 不存在 | `16c33837` | 2026-10-20 已核 |
| 02-03 | 仓库在 2025-03-21 就有第一条提交，早于 GitHub 上登记的建仓日 2025-04-30 | `out_11_checkout_opencode.txt` 第 4 节：最早六条提交从 2025-03-21T18:20:28+01:00 "initial" 开始 | GitHub API `created_at` 为 2025-04-30T20:08:00Z，与 git 历史起点不同 | `16c33837`；API 读取日 2026-10-20 | 2026-10-20 已核。**两者不同本身是事实**：GitHub 上的建仓时间不等于仓库历史的起点；片中按 git 历史讲起点 |
| 02-04 | 旧地址 `sst/opencode` 与现地址是同一个仓库，不是分叉 | `https://api.github.com/repos/sst/opencode` 返回 `full_name: "anomalyco/opencode"`、`id: 975734319`，与 `https://api.github.com/repos/anomalyco/opencode` 相同 | `out_11_checkout_opencode.txt` 第 1 节记录的 origin | API 读取日 2026-10-20 | 2026-10-20 已核（同一仓库已核）；**改名／转移发生的日期本轮未核**，见「尚待核实」 |
| 02-05 | 今天的版本自称 V2：CHANGELOG 写 "Release notes for OpenCode V2, newest first."，最新一条是 v2.0.32（2026-10-16） | `CHANGELOG.md:1-3`、`:99` "## v2.0.32 — 2026-10-16" | 文档站顶部横幅 "OpenCode v2 is now available"（`https://opencode.ai/docs/permissions/`，读取日 2026-10-20） | `16c33837` | 2026-10-20 已核 |

### 第 03 章 一次任务的完整回合

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 03-01 | 一次任务由「步」组成：模型给回工具调用与文本，程序执行工具、把结果回填，再进下一步 | `packages/core/src/session/runner/step.ts:10`（`type ToolCall`）、`:16`（`import { Permission }`）、`:19`（`import { ToolOutput }`）、`:71`（`const toolOutput = yield* ToolOutput.Service`） | 官方文档 `packages/web/src/content/docs/tools.mdx` 开头："Tools allow the LLM to perform actions in your codebase."；`https://opencode.ai/docs/tools/` | `16c33837` | 2026-10-20 已核（源码侧）；官方文档只印证工具用途，未逐句印证循环，片中循环部分以源码为准 |
| 03-02 | 每一步的结果有明确的状态分类：完成、重试、继续、整段恢复、已压缩、超出输出上限 | `packages/core/src/session/runner/step.ts:32` `export type Outcome = Data.TaggedEnum<{`、`:43` `export const Outcome = Data.taggedEnum<Outcome>()`，成员为 Completed / Retry / Continue / RecoverFull / Compacted / OutputLimit | 无第二来源 | `16c33837` | 2026-10-20 已核 |
| 03-03 | 一步内工具的输出经过统一的输出处理层再回填 | `packages/core/src/session/runner/step.ts:19` `import { ToolOutput } from "../../tool-output.js"`、`:71` `yield* ToolOutput.Service` | `packages/core/src/tool-output.ts` 存在（`out_13_opencode_mechanisms_opencode.txt` 第 4 节命中） | `16c33837` | 2026-10-20 已核 |
| 03-04 | 步数有上限：达到上限后工具被停用，要求模型只用文字回答，直到下一次用户输入 | `packages/core/src/session/runner/max-steps.ts:1` `export const MAX_STEPS_PROMPT = \`CRITICAL - MAXIMUM STEPS REACHED`、`:3` "The maximum number of steps allowed for this task has been reached. Tools are disabled until next user input. Respond with text only." | `:11` 同一提示要求模型声明已达上限 | `16c33837` | 2026-10-20 已核 |
| 03-05 | 上下文管理有独立的压缩实现，并且保留了「旧版」压缩提示的开关 | `packages/core/src/session/compaction.ts:151` `export const buildPrompt = (update: boolean, legacy = false) => {`、`:190` `export const layer = Layer.effect(`、`:890` `export const recentUserMessages = (` | `packages/core/src/session/context.ts:188` `export const node = makeLocationNode({` 是上下文装配入口 | `16c33837` | 2026-10-20 已核 |

### 第 04 章 关键机制：权限、插件、LSP

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 04-01 | 权限只有三种结果：允许、拒绝、询问 | `packages/schema/src/permission.ts:56` `export const Effect = Schema.Literals(["allow", "deny", "ask"])` | 官方文档 `packages/web/src/content/docs/permissions.mdx:14-18`："Each permission rule resolves to one of:"，随后 `:16` allow、`:17` ask、`:18` deny；在线页 `https://opencode.ai/docs/permissions/` | `16c33837`；文档读取日 2026-10-20 | 2026-10-20 已核（源码与官方文档互为印证） |
| 04-02 | 权限按「动作 + 资源」求值：程序把多组规则摊平后逐条比对，命中即定 | `packages/core/src/permission.ts:87` `export function evaluate(action: string, resource: string, ...rulesets: Permission.Ruleset[]): Permission.Rule {`、`:89` 起 `rulesets.flat()` | `packages/core/src/permission.ts:19` `const missingAgentPermissions: Permission.Ruleset = [{ action: "*", resource: "*", effect: "deny" }]`——没有对应权限时默认全拒 | `16c33837` | 2026-10-20 已核 |
| 04-03 | 被拒时抛两类错误：用户明确拒绝（DeclinedError）与规则拦截（BlockedError，携带命中规则与资源） | `packages/core/src/permission.ts:64` `export class DeclinedError …`、`:70` `export class BlockedError extends Schema.TaggedError<BlockedError>({` 及其字段 `rules` / `permission` / `resources` / `reason` | `packages/core/src/permission.ts:19` 的兜底全拒规则与之配套 | `16c33837` | 2026-10-20 已核 |
| 04-04 | 权限项按工具名分列，共十三项：`read`、`edit`（覆盖 edit/write/patch）、`glob`、`grep`、`shell`、`task`、`skill`、`lsp`、`question`、`webfetch`、`websearch`，外加两个安全护栏 `external_directory` 与 `doom_loop` | `packages/web/src/content/docs/permissions.mdx:156-168` 逐条列出（`:156` read、`:157` edit、`:158` glob、`:159` grep、`:160` shell、`:161` task、`:162` skill、`:163` lsp、`:164` question、`:165` webfetch、`:166` websearch、`:167` external_directory、`:168` doom_loop） | 源码侧内置工具文件与之一一对应：`packages/core/src/tool/plugin/` 下有 read、edit、write、patch、glob、grep、shell、skill、subagent、question、webfetch、websearch 等 16 个文件（`out_13_opencode_mechanisms_opencode.txt` 第 3 节） | `16c33837`；文档读取日 2026-10-20 | 2026-10-20 已核。**两套文档在这一项上不一致，见 04-04a** |
| 04-04a | 已部署的 v1 文档页与仓库 dev 分支的文档源在 shell 这一项上不一致：已部署页 `https://opencode.ai/docs/permissions/`（读取日 2026-10-20，页脚标 "Last updated: Oct 19, 2026"）的权限清单写 `bash`（"running shell commands (matches parsed commands like `git status --porcelain`)"），而同页的配置示例 JSON 却写 `"shell": "allow"`；仓库 `dev` 分支的 `packages/web/src/content/docs/permissions.mdx:160` 一律写 `shell` | 线上页与仓库源两处原文如上；仓库源 `permissions.mdx:160` 与同文件配置示例一致 | 源码侧工具文件名为 `shell.ts`（`out_13…` 第 3 节），与仓库文档源一致 | 线上页读取日 2026-10-20；仓库 `16c33837` | 2026-10-20 已核。**片中只按仓库 dev 分支的 `shell` 讲，并说明这是新一版文档的写法**；不把两套文档混用 |
| 04-05 | `doom_loop` 是防打转的护栏：同一个工具调用以完全相同的输入重复三次就触发 | `packages/web/src/content/docs/permissions.mdx:168` "triggered when the same tool call repeats 3 times with identical input" | 文档 "Available Permissions" 一节同段 | `16c33837`；文档读取日 2026-10-20 | 2026-10-20 已核 |
| 04-06 | 越界访问单独设一道关：工具碰到工作目录之外的路径时触发 `external_directory`；写路径用 `~` 展开不等于进入工作区，仍要过这一关 | `packages/web/src/content/docs/permissions.mdx:115` "Use `external_directory` to allow tool calls that touch paths outside the working directory where OpenCode was started…"、`:117` "Home expansion (like `~/...`) only affects how a pattern is written. It does not make an external path part of the current workspace…" | 文档同一节的外目录示例 | `16c33837`；文档读取日 2026-10-20 | 2026-10-20 已核 |
| 04-07 | 默认是宽松的：多数权限默认允许；`doom_loop` 与 `external_directory` 默认询问；`.env` 类文件默认拒绝 | `packages/web/src/content/docs/permissions.mdx:172-177`（`:174` "OpenCode starts from permissive defaults"、`:176` "Most permissions default to `\"allow\"`"、`:177` "`doom_loop` and `external_directory` default to `\"ask\"`"），同节给出 `.env` 相关的示例 | `packages/web/src/content/docs/tools.mdx` 开头："By default, all tools are **enabled** and don't need permission to run." | `16c33837`；文档读取日 2026-10-20 | 2026-10-20 已核（文档侧）。**源码侧未逐条核对默认值的求值顺序**；片中引用默认值时以文档为准并注明口径 |
| 04-08 | 插件可以挂在三个不同的宿主上：服务端、TUI、RPC | `packages/plugin/src/host.ts:12-14` `readonly server?: string` / `readonly tui?: string` / `readonly rpc?: string`、`:17` `export function resolve(target: Target): Entrypoints {`、`:43` `return { server: entry(["server", ""]), tui: entry(["tui"]), rpc: entry(["rpc"]) }` | 官方文档 `packages/web/src/content/docs/plugins.mdx:6` "Plugins allow you to extend OpenCode by hooking into various events…" | `16c33837` | 2026-10-20 已核 |
| 04-09 | 插件的钩子覆盖模型、会话、Shell、工具四类，另有注册期钩子 | `packages/core/src/plugin/hooks.ts:1` `export * as PluginHooks from "./hooks.js"`、`:3` `AISDKHooks`、`:4` `SessionHooks`、`:5` `ShellHooks`、`:6` `ToolFailures, ToolHooks`、`:7` `ModelHookOptions` | 官方文档 `plugins.mdx:6` | `16c33837` | 2026-10-20 已核 |
| 04-10 | 插件从两个地方加载：项目内 `.opencode/plugins/` 与全局 `~/.config/opencode/plugins/` 的 JS/TS 文件，或在配置里写 npm 包名 | `packages/web/src/content/docs/plugins.mdx:18-25`（`:20` "Place JavaScript or TypeScript files in the plugin directory."、`:22` ".opencode/plugins/ - Project-level plugins"、`:23` "~/.config/opencode/plugins/ - Global plugins"、`:25` "Files in these directories are automatically loaded at startup."），`:29` 起是 npm 用法 | 在线页 `https://opencode.ai/docs/plugins/`（读取日 2026-10-20） | `16c33837` | 2026-10-20 已核 |
| 04-11 | LSP 是可配置的：每个语言服务器写明启动命令、适用的文件扩展名，可单独禁用 | `packages/schema/src/config/lsp.ts:10-13` `export class Server extends Schema.Class<Server>("Config.LSP.Server")({ command: …, extensions: …, disabled: …`、`:6-7` `export const Disabled = Schema.Struct({ disabled: Schema.Literal(true) })` | 官方文档 `packages/web/src/content/docs/lsp.mdx` 的 "Built-in" 一节列出 30 余个内置 LSP 服务器及其扩展名与依赖 | `16c33837`；文档读取日 2026-10-20 | 2026-10-20 已核 |
| 04-12 | LSP 默认关闭；打开后，检测到对应扩展名且依赖满足时才启动服务器 | `packages/web/src/content/docs/lsp.mdx:51` "LSP is disabled by default. When enabled, servers start when one of the above file extensions is detected and the requirements are met."、`:80` "To enable all built-in LSP servers, set `lsp` to `true`." | 同页 "Built-in" 表 | `16c33837`；文档读取日 2026-10-20 | 2026-10-20 已核。**注意**：`packages/core/src/tool/plugin/edit.ts:205` 与 `write.ts:44` 仍留有 "TODO: Add LSP notification and diagnostics after LSP runtime exists."，即核心包里尚未接上 LSP 运行时；本片讲到 LSP 时要说清这是配置与文档层面的能力，不要说成「已把诊断喂回模型」 |

### 第 05 章 特色与边界：客户端 / 服务端分离与插件模型

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 05-01 | 服务端可以独立跑：`opencode serve` 起一个无头 HTTP 服务器，暴露 OpenAPI 端点给客户端用 | `packages/web/src/content/docs/server.mdx:9` "The `opencode serve` command runs a headless HTTP server that exposes an OpenAPI endpoint that an opencode client can use." | 在线页 `https://opencode.ai/docs/server/`（读取日 2026-10-20）；仓库 `packages/server`（91 个 .ts、8,843 行） | `16c33837` | 2026-10-20 已核 |
| 05-02 | 服务端默认只听本机：端口 4096、地址 127.0.0.1；可设口令走 HTTP basic auth | `packages/web/src/content/docs/server.mdx:23` "Port to listen on \| `4096`"、`:24` "Hostname to listen on \| `127.0.0.1`"、`:37-39`（`:37` "### Authentication"、`:39` "Set `OPENCODE_SERVER_PASSWORD` to protect the server with HTTP basic auth. The username defaults to `opencode`… This applies to both `opencode serve` and `opencode web`."） | 同页 "Usage" 与 "Authentication" 两节 | `16c33837`；文档读取日 2026-10-20 | 2026-10-20 已核 |
| 05-03 | 客户端有几种：终端界面、桌面应用、IDE 扩展；仓库里分别是 `packages/tui`、`packages/desktop`、`packages/app` 等 | `packages/web/src/content/docs/index.mdx:15`（三种形态） | `out_12_opencode_layout_opencode.txt` 第 3 节的包清单（tui、desktop、app、web、console、gui-extensions） | `16c33837` | 2026-10-20 已核 |
| 05-04 | 同一个核心被多种外壳包着：`packages/core` 163,368 行，`packages/tui` 36,731 行，`packages/server` 8,843 行，`packages/sdk` 2,700 行 | `out_12_opencode_layout_opencode.txt` 第 4 节 | 仓库根 `package.json` 的 workspace 声明（`out_12…` 第 6 节） | `16c33837`；统计日 2026-10-20 | 2026-10-20 已核（自测统计） |
| 05-05 | 配置目录按 XDG 规范分四块：data、cache、config、state，应用名是 `opencode` | `packages/util/src/global.ts:12` `const app = "opencode"`、`:13` `const { data, cache, config, state, tmp } = roots(app)`、`:19-26` 各路径字段 | 官方文档 `packages/web/src/content/docs/plugins.mdx` 用 `~/.config/opencode/plugins/` 作全局插件目录，与 `global.config` 对应 | `16c33837` | 2026-10-20 已核 |
| 05-06 | 配置发现会同时看系统目录、全局配置目录，并兼容 `~/.claude` 与 `~/.agents` 里的既有内容 | `packages/core/src/config/discovery.ts:68` `const globalDirectory = AbsolutePath.make(global.config)`、`:69` `globalAgentsDirectory`（`~/.agents`）、`:70` `globalClaudeDirectory`（`~/.claude`）、`:71` `const configDirectories = [...(system ? [system] : []), globalDirectory]`、`:73` | 无第二来源 | `16c33837` | 2026-10-20 已核 |
| 05-07 | 官方文档本身就在这个仓库里，是 Markdown 源文件 | `packages/web/src/content/docs/` 共 33 个 `.mdx`（`out_12_opencode_layout_opencode.txt` 第 5 节） | 每个 `.mdx` 末端的 "Edit page" 链接指向 `github.com/anomalyco/opencode/edit/dev/packages/web/src/content/docs/…` | `16c33837` | 2026-10-20 已核 |
| 05-08 | 不开源码的部分：本片未发现 OpenCode 的模型服务侧代码在仓库内——仓库里只有客户端侧实现与 provider 接口 | `packages/ai` 409 个 .ts 提供模型调用层（74,318 行）；`packages/core/src/provider.ts` 存在 | 无第二来源 | `16c33837` | 2026-10-20 **部分核实**：已确认 provider 侧是接口层；**未逐行核实是否调用自建推理服务**，片中不据此下结论 |

### 第 06 章 沿革

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 06-01 | 起点：2025-03-21 第一条提交 "initial"，三天后已经有 "initial working agent" | `out_11_checkout_opencode.txt` 第 4 节：`4b0ea68d7af9a6031a7ffda7ad66e0cb83315750`（2025-03-21T18:20:28+01:00）、`005b8ac16776512b2d4b1f22bd989da162ca1bad`（2025-03-24T11:47:39+01:00） | `out_14_opencode_history_opencode.txt` 第 1 节 | `16c33837` | 2026-10-20 已核 |
| 06-02 | 换语言：2025-05-30 的一次 "sync" 提交把 Go 实现换成 TypeScript（见 02-02） | 提交 `f3da73553c45f17e04b1e77cb13eb0fca714d1bd` | `out_14_opencode_history_opencode.txt` 第 2 节 | `16c33837` | 2026-10-20 已核 |
| 06-03 | 改包名：共享包 `packages/opencode` 在 2026-04-25 改名为 `packages/core` | 提交 `62ef2a220723a6d6cb050e523fcdfaa974dafdda`（2026-04-25T10:59:17-04:00，"refactor: rename shared package to core (#24309)"） | 当前检出里 `packages/opencode` 已不存在（`out_14…` 第 4 节） | `16c33837` | 2026-10-20 已核 |
| 06-04 | 上一代留下的痕迹之一：仓库里保留着上一代配置的全部结构（v1），共九个文件，权限、插件、模型、命令、MCP 各一份，另有迁移脚本 | `packages/core/src/v1/config/` 下 `agent.ts`、`command.ts`、`error.ts`、`mcp.ts`、`migrate.ts`、`permission.ts`、`plugin.ts`、`provider-options.ts`、`provider.ts`（`out_14…` 第 5 节） | `packages/core/src/database/v1-migration.bun.ts` 负责从旧库迁移（`out_14…` 第 5 节末） | `16c33837` | 2026-10-20 已核 |
| 06-05 | 上一代留下的痕迹之二：旧的 `tools` 布尔配置项已并入 `permission`，但仍向后兼容 | `packages/web/src/content/docs/permissions.mdx:8` "As of `v1.1.1`, the legacy `tools` boolean config is deprecated and has been merged into `permission`. The old `tools` config is still supported for backwards compatibility." | 同页 "Auto mode" 一节另记 `--auto` 开关（`opencode --auto`） | `16c33837`；文档读取日 2026-10-20 | 2026-10-20 已核 |
| 06-06 | 仓库与许可证仍写旧名：`LICENSE` 写 "Copyright (c) 2025 opencode" | `LICENSE:3` | 仓库当前归属是 `anomalyco`（`out_11_checkout_opencode.txt` 第 1 节；GitHub API `owner.login: "anomalyco"`）；文档站页脚为 "© Anomaly" | `16c33837`；API 读取日 2026-10-20 | 2026-10-20 已核。**改名/转移的具体日期本轮未核**，见「尚待核实」 |
| 06-07 | 版本号一路到 V2，当前 CHANGELOG 最新为 v2.0.32（2026-10-16） | `CHANGELOG.md:1-3`、`:99` | 文档站横幅 "OpenCode v2 is now available" | `16c33837` | 2026-10-20 已核 |

### 第 07 章 小结

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 07-01 | 一句话总结：OpenCode 是一层 Harness——它把「一句话」变成「模型 → 工具 → 结果回填」的步进循环，用一套「动作 + 资源 → 允许/拒绝/询问」的规则控制模型能做什么，并允许同一套核心被终端、桌面、IDE 和独立服务端共用 | `packages/core/src/permission.ts:87`；`packages/core/src/session/runner/step.ts:32,71`；`packages/web/src/content/docs/server.mdx:9` | 官方文档 `permissions.mdx`、`server.mdx` | `16c33837`；文档读取日 2026-10-20 | 2026-10-20 已核 |
| 07-02 | 需要记住的边界：LSP 在核心包里尚未接上运行时；模型服务侧不在本仓库 | `packages/core/src/tool/plugin/edit.ts:205`、`write.ts:44` 的 "TODO: Add LSP notification and diagnostics after LSP runtime exists." | 05-08 | `16c33837` | 2026-10-20 已核（见 04-12、05-08 的限定） |

## 尚待核实（与题目相关但本轮未查实，不进入定稿）

| 事项 | 现有线索 | 缺口 | 下一步 |
|---|---|---|---|
| 仓库从 `sst` 转到 `anomalyco` 的具体日期 | GitHub API 证明两者是同一 repo id `975734319` | 没有仓库内的改名提交，也没有官方公告页 | 查 GitHub 事件或官方发布说明；在查到之前，片中只说「旧地址仍指向同一仓库」，不说具体日期 |
| Go 实现是否另立为 Charm 的 Crush | 旁述称分家后 Go 那支成了 Crush | **本轮在仓库记录中未找到任何支持这一说法的依据**；仓库自己的记录是 Go 实现被就地换成 TypeScript（02-02） | 本片不采用这一说法；若要讲，先找到官方或仓库内的一手依据 |
| 权限默认值的求值顺序与 `missingAgentPermissions` 的实际触发路径 | 源码 `permission.ts:19` 定义了兜底全拒规则；文档给出默认值表 | 未逐行追到调用点 | 片中只引用文档口径；需要讲实现时再补查 |
| LSP 运行时的实际实现位置 | 核心包里只有 TODO；`packages/gui-extensions/src/details/configured-lsp.ts` 存在 | 未读该文件，也未确认它是否就是运行时 | 写稿前读这一处再决定怎么讲 |
| v2 客户端/服务端的协议细节 | `packages/web/src/content/docs/server.mdx` 说明 HTTP + OpenAPI；`packages/protocol`、`packages/httpapi-codegen` 存在 | 未逐项读协议定义 | 写「客户端/服务端分离」一章时按需补查 |

## 文案审查

<!-- 文案稿经指定校对者 WaterRun 人工审查并明确确认后才配音（见 docs/script-review.md）。逐轮记录交审日期、内容 SHA-256、校对记录的链接与结论；逐句意见在 review/NOTES.md 留存，避免维护两份全文。确认之后的实质改动另起一轮。 -->

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
