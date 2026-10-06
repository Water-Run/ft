# Harness

逐个讲解编码智能体的运行框架（Harness）：它怎样把模型接到工具、文件和终端上。

## 连续性

同一系列的各集保持一致的做法记在这里：首集制作时定下来，后续各集遵守；要改就先改这里。各项的含义见 [docs/series.md](../../../docs/series.md)。标为「建议」的是起点，不是限制：每集按题目增删、合并、调整比重。

| 项 | 约定 |
|---|---|
| 标题 | 待首集确定 |
| 结构（建议） | 它是什么、由谁做 → 一次任务的完整回合（实测）→ 工具与权限模型 → 上下文管理 → 与其他 Harness 的差异 |
| 演示与取证 | 各集用同一项任务做演示，便于横向比较；这类软件变化快，涉及的版本与日期逐项标明。独立视频《给 LLM 长出手——Harness 是如何工作的？》是总论，可作本系列的引子 |
| 视觉与声音 | 待首集确定；定下后写回这里，并把可复用的源码整理成系列基座 `_base/` |

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
