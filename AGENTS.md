# 在这个仓库里工作

规则都写在 `docs/` 里。按这次要做的事去读对应的文档，按里面的做法做。

| 要做的事 | 先读 |
|---|---|
| 制作一部委托片 | 该片目录里的 `AGENTS.md`，再按它给出的阅读顺序往下读 |
| 自制一部新片 | [docs/workflow.md](docs/workflow.md) |
| 改工具或引擎 | [docs/tools.md](docs/tools.md)、[docs/engine.md](docs/engine.md)、[docs/pitfalls.md](docs/pitfalls.md) |
| 判断成片是否合格 | [docs/standards.md](docs/standards.md)、[docs/review.md](docs/review.md) |
| 开一个系列或加一集 | [docs/series.md](docs/series.md)、`videos/catalog.json` |
| 换机器、装环境、同步另一台机器 | [docs/environment.md](docs/environment.md) |

几条边界：

- 画面是时间的纯函数。质量、语体，以及不要出现的做法，以 [docs/standards.md](docs/standards.md) 为准。
- 事实只来自该片的 `research/FACTS.md`。
- 生成物（`audio/`、`out/`、`shots/`、`build/`）、`assets/` 里的字体和程序、`kit/config.local.json`、取证用的第三方源码（`research/_src/`）不入库。清单见 `.gitignore`。
- 两台机器各有一份仓库。源码用 `node kit/tools/remote.js` 同步；成片、配音和二进制依赖留在产生它们的那台机器上。
- 本仓库以 GPL-3.0-or-later 发布。口令、密钥和内网地址不写进仓库。
