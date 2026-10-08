# 在这个仓库里工作

规则都写在 `docs/` 里。按这次要做的事去读对应的文档，按里面的做法做。

| 要做的事 | 先读 |
|---|---|
| 整理制作规范或文档 | [docs/standards.md](docs/standards.md)、[docs/workflow.md](docs/workflow.md)、[docs/review.md](docs/review.md)，再读对应专题 |
| 制作一部委托片 | 该片目录里的 `AGENTS.md`，再按它给出的阅读顺序往下读 |
| 自制一部新片 | [docs/workflow.md](docs/workflow.md) |
| 改工具或引擎 | [docs/tools.md](docs/tools.md)、[docs/engine.md](docs/engine.md)、[docs/pitfalls.md](docs/pitfalls.md) |
| 判断成片是否合格 | [docs/standards.md](docs/standards.md)、[docs/review.md](docs/review.md) |
| 开一个系列或加一集 | [docs/series.md](docs/series.md)、`videos/catalog.json` |
| 换机器、装环境、同步另一台机器 | [docs/environment.md](docs/environment.md) |

几条边界：

- 画面是时间的纯函数。质量、语体，以及不要出现的做法，以 [docs/standards.md](docs/standards.md) 为准。
- 仓库正常情况下只保留一个 `main` 分支；可能同时有多个制作者（Agent）各开一部片子，改动以自己的视频目录为单位提交到 `main`。做法见 [docs/workflow.md](docs/workflow.md)。
- 不直接抄袭现成产品；动画须精美精良；事实须严格核查；每部片子的片尾须包括实际参与的模型、「策划：WaterRun」与标明「开源视频」的 GitHub 仓库链接。细则见 [docs/standards.md](docs/standards.md)，验收见 [docs/review.md](docs/review.md)。
- 事实只来自该片的 `research/FACTS.md`。
- 文案稿须经策划者 WaterRun 人工审查并明确确认后，才能配音并往下做（自 2026-10-08 起新开工的片子执行）。做法见 [docs/workflow.md](docs/workflow.md) 第 2 步。
- 生成物（`audio/`、`out/`、`shots/`、`build/`）、`assets/` 里的字体和程序、`kit/config.local.json`、取证用的第三方源码（`research/_src/`）不入库。清单见 `.gitignore`。
- 两台机器各有一份仓库。源码用 `node kit/tools/remote.js` 同步；成片、配音和二进制依赖留在产生它们的那台机器上。
- 本仓库以 GPL-3.0-or-later 发布，是公开仓库：入库即公开。口令、密钥、内网地址与可识别身份的信息不写进任何文件；取证回显与数据文件入库前先脱敏，做法见 [docs/research.md](docs/research.md)。
