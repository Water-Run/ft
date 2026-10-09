# 在这个仓库里工作

规则都写在 `docs/` 里。按这次要做的事去读对应的文档，按里面的做法做。

| 要做的事 | 先读 |
|---|---|
| 整理制作规范或文档 | [docs/standards.md](docs/standards.md)、[docs/workflow.md](docs/workflow.md)、[docs/review.md](docs/review.md)，再读对应专题 |
| 制作一部委托片 | 该片目录里的 `AGENTS.md`，再按它给出的阅读顺序往下读 |
| 查看近期计划或接续制作 | [docs/todo.md](docs/todo.md)，再核对本片当前源码、时间线、README 与实际输出 |
| 自制一部新片 | [docs/todo.md](docs/todo.md)、[docs/workflow.md](docs/workflow.md)、[docs/feedback.md](docs/feedback.md) |
| 整理观众反馈或回填发布记录 | [docs/feedback.md](docs/feedback.md)、[docs/workflow.md](docs/workflow.md) 第 11 节 |
| 改工具或引擎 | [docs/tools.md](docs/tools.md)、[docs/engine.md](docs/engine.md)、[docs/pitfalls.md](docs/pitfalls.md) |
| 判断成片是否合格 | [docs/standards.md](docs/standards.md)、[docs/review.md](docs/review.md)、[docs/feedback.md](docs/feedback.md) |
| 开一个系列或加一集 | [docs/series.md](docs/series.md)、`videos/catalog.json` |
| 换机器、装环境、同步另一台机器 | [docs/environment.md](docs/environment.md) |

几条边界：

- 画面是时间的纯函数。质量、语体，以及不要出现的做法，以 [docs/standards.md](docs/standards.md) 为准。
- 仓库正常情况下只保留一个 `main` 分支；可能同时有多个制作者（Agent）各开一部片子，改动以自己的视频目录为单位提交到 `main`。做法见 [docs/workflow.md](docs/workflow.md)。
- 不直接抄袭现成产品；动画须精美精良；事实须严格核查；每部片子的片尾须包括实际参与的模型、「策划：WaterRun」与标明「开源视频」的 GitHub 仓库链接。细则见 [docs/standards.md](docs/standards.md)，验收见 [docs/review.md](docs/review.md)。
- 事实只来自该片的 `research/FACTS.md`。
- 每次新片开工或改片，先读 [docs/feedback.md](docs/feedback.md) 及其中最近的相关复盘，在本片 README 写「开工反馈应用」：逐项对应问题编号、适用性、计划与验证办法。结尾必须用同一组编号写「结尾反馈复盘」，给出实际成片的时间点、证据、结果与遗留问题；只改流程或源码不能记为成片问题已解决。自制、委托都执行，格式见反馈文档第 7 节。
- 文案稿须经策划者 WaterRun 人工审查并明确确认后，才能配音并往下做（自 2026-10-08 起新开工的片子执行）。做法见 [docs/workflow.md](docs/workflow.md) 第 2 步。
- 生成物（`audio/`、`out/`、`shots/`、`build/`）、`assets/` 里的字体和程序、`kit/config.local.json`、取证用的第三方源码（`research/_src/`）不入库。清单见 `.gitignore`。
- 两台机器各有一份仓库。源码用 `node kit/tools/remote.js` 同步；成片、配音和二进制依赖留在产生它们的那台机器上。
- 本仓库以 GPL-3.0-or-later 发布，是公开仓库：入库即公开。口令、密钥、内网地址与可识别身份的信息不写进任何文件；取证回显与数据文件入库前先脱敏，做法见 [docs/research.md](docs/research.md)。
