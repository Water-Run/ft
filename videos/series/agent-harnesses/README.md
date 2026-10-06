# Harness

逐个讲解编码智能体的运行框架（Harness）：它怎样把模型接到工具、文件和终端上。

本系列的做法只有一条：**源码拉下来，按源码讲。** 每一集都从公开仓库取一份固定版本的检出，片中讲的每一处机制都要指得出文件与行号；讲不了的、只从文档或旁述看到的，单独标出来。演示与截图用的是同一份检出，保证片中看到的就是分析过的那份代码。

## 连续性

同一系列的各集保持一致的做法记在这里：首集制作时定下来，后续各集遵守；要改就先改这里。各项的含义见 [docs/series.md](../../../docs/series.md)。标为「建议」的是起点，不是限制：每集按题目增删、合并、调整比重。

| 项 | 约定 |
|---|---|
| 标题 | 待首集确定 |
| 结构（建议） | 它是什么、由谁做 → 从检出里读出来的架构 → 一次任务的完整回合（实测）→ 工具与权限模型 → 上下文管理 → 与其他 Harness 的差异 → 它的来路（沿革） |
| 演示与取证 | 各集用同一项任务做演示，便于横向比较；这类软件变化快，涉及的版本与日期逐项标明。独立视频《给 LLM 长出手——Harness 是如何工作的？》是总论，可作本系列的引子 |
| 历史变迁 | 每集固定有一节讲沿革，见下 |
| 视觉与声音 | 待首集确定；定下后写回这里，并把可复用的源码整理成系列基座 `_base/` |
| 术语与读法 | 同一批术语（harness、agent loop、工具契约、上下文压缩、审批、沙箱、MCP、ACP）在各集的写法与读法一致；英文原名首次出现时给出原文 |

### 取证的标准

「拉源码真实解析」要落成可核对的产物，不能只是一句态度：

- 每集在 `research/lab/` 下留一份检出记录：仓库 URL、完整的 commit SHA、检出日期、许可证文件的位置。
- 片中引用代码时给出 `路径:行号`，一律以该 SHA 为准；换版本重录，行号重查。
- 官方文档之外的旁述（媒体报道、社区文章、聚合站）只用来定位，不作为片中结论的依据。确实采用了，在 `FACTS.md` 里标明是二手，并写明有没有与源码核对过。
- **不开源的部分不假装讲了。** 有的 Harness 只开放一部分（例：官方把 CLI、SDK、应用服务器、安全 CLI 列为开源，而 IDE 扩展与云端环境不开源）。这类环节单独成段，说明哪些没有源码、能观察到什么、推断的依据是什么，而不是拿文档当源码讲。
- 实测与源码分开记：片中演示用的任务、命令与其输出进 `FACTS.md`，不与源码结论混在一起。

### 历史变迁

这一系列的项目几乎都在半年内改过架构、换过名字或换过上游，只讲当前快照会很快过时。每集固定有一节讲沿革：

- **从哪来**：fork 自哪个项目、由谁发起、什么时间公开。追到上游仓库，并写清同步方式（例：一个仓库里有定期「Sync upstream」的提交，说明它长期跟着上游走）。
- **改过什么名**：项目名、命令名、包名、配置目录、协议，以及为兼容旧名保留的迁移代码。这些是 fork 与分家的直接痕迹。
- **架构什么时候转折的**：关键版本与日期，以及转折的原因。
- **今天的代码里哪些是上一代留下的**：改名的文件、标记为 legacy 的文件、被打补丁覆盖的上游文件。这类痕迹在仓库里一眼可见，比任何旁述可靠。

依据优先取仓库自己的记录：commit 历史、改名提交、`REBRAND`／`CHANGELOG`／迁移文档、legacy 命名的文件。旁述只用来提示该往哪看。

## 各集的源码与脉络

下面是为开工准备的**线索表，不是已核实的事实**：每集动手时按上节的标准回到检出里核对一遍，把状态改成已核，并补上 commit SHA。已见线索的出处一并记在这里，免得下一个人重复找一遍。

| 集 | 仓库 | 语言 / 运行时 | 许可 | 沿革线索 | 核对状态 |
|---|---|---|---|---|---|
| codex | `openai/codex`（主体在 `codex-rs/`） | Rust | 待核 | 2021 年那个 Codex 模型与这个 CLI 无关（模型 2023-03 退役，官方 FAQ 明说）；官方把 CLI、SDK、应用服务器、安全 CLI 列为开源，IDE 扩展与 Codex 云不开源 | 仓库与官方开源清单已见；许可待核 |
| opencode | `sst/opencode` → 现 `anomalyco/opencode` | TypeScript / Bun | MIT | 最早是 Go 实现；分家后 Go 那支成了 Charm 的 Crush，OpenCode 这个名字留给 SST/Anomaly 用 TypeScript 重写 | 旁述一致；待用 git 历史核对分家时点 |
| codewhale | `Hmbown/CodeWhale` | Rust | MIT | 原名 `deepseek-tui`（`gc801/DeepSeek-TUI`），改名后仍兼容读 `~/.deepseek/` 配置；仓库自带 `docs/REBRAND.md` | README 自述已见 |
| deepseek-harness | `deepseek-ai/deepseek-harness` | Node.js | MIT | 2026-08-13 以 v0.1 Developer Preview 公开，标语「一切皆插件」，插件内核是 Cordis；仓库为 `apps/` + `packages/` 单仓。作者声明后续会有破坏性变更 | 多方一致（含引用官方 README）；版本号待从仓库核对 |
| openclaude | 待定位 | — | — | 检索本条时反复出现的是港大 HKUDS 的 **OpenHarness**（另见文末），两者关系需要确认 | 未核实 |
| grok-build | 待定位 | — | — | — | 未核实 |
| mimo-code | `XiaomiMiMo/MiMo-Code` | TypeScript | 待核 | 初次开源 2026-06-10；多处报道称基于 OpenCode 改写 | 官方仓库已定位；fork 关系待用 git 历史核对 |
| kimi-code | `MoonshotAI/kimi-cli` | Python（uv，需 3.12+） | 待核（旁述称 Apache-2.0） | 项目正过渡到后继产品 Kimi Code，本仓库逐步收尾；旁述称 1.49.0 发布于 2026-07-16 | 仓库已定位；过渡说明待从仓库核对 |
| qwen-code | `QwenLM/qwen-code` | TypeScript / pnpm，需 Node 22+ | 待核 | fork 自 Google Gemini CLI；仓库里既有「Sync upstream Gemini-CLI v0.8.2」这类提交，也有 `patches/`、`eslint.legacy-*.mjs` 等继承痕迹 | 仓库证据已见；许可待核 |
| zcode | 待定位 | — | — | — | 未核实 |
| minimax-code | 待定位 | — | — | — | 未核实 |
| pi | 待定位 | — | — | — | 未核实 |
| context-compaction | 不是项目，是横向题 | — | — | 跨集比较各家的上下文压缩做法，素材取自前面各集的检出 | 待排期 |

片单外的一个候选：**OpenHarness**（`HKUDS/OpenHarness`，MIT，Python，2026-04 公开，约 1.1 万行）。它公开的动机就是让人读懂 Harness 怎么搭——按本系列的做法是很好的题材。要不要加进来由你定；`openclaude` 那一集指的对象也建议一并确认。

## 分集

<!-- catalog:begin 由 node kit/tools/catalog.js 生成，不要手改 -->
| # | 标题 | 语言 | 状态 | 目录 |
|---|---|---|---|---|
| 1 | CodeX CLI 的实现 | zh + en | 计划中 | `codex` |
| 2 | OpenCode | zh + en | 计划中 | `opencode` |
| 3 | Codewhale | zh + en | 计划中 | `codewhale` |
| 4 | DeepSeek Harness | zh + en | 计划中 | `deepseek-harness` |
| 5 | OpenClaude | zh + en | 计划中 | `openclaude` |
| 6 | Grok Build | zh + en | 计划中 | `grok-build` |
| 7 | Mimo Code | zh + en | 计划中 | `mimo-code` |
| 8 | Kimi Code | zh + en | 计划中 | `kimi-code` |
| 9 | Qwen Code | zh + en | 计划中 | `qwen-code` |
| 10 | ZCode | zh + en | 计划中 | `zcode` |
| 11 | MiniMax Code | zh + en | 计划中 | `minimax-code` |
| 12 | Pi | zh + en | 计划中 | `pi` |
| 13 | 上下文压缩的方式 | zh + en | 计划中 | `context-compaction` |
<!-- catalog:end -->
