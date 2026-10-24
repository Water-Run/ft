# SQLite 自身材料

2026-10-24 由制作方从官网取得。用途是让画面认得出讲的是 SQLite（F16）；标志与名称是所有者的商标，只用于指明讲解对象，见仓库的[许可边界](../../../../docs/reference/third-party.md#商标)。

| 材料 | 值 | 出处 | 本片用途 |
|---|---|---|---|
| 官方标志 | sqlite370_banner.svg，原样存为 `src/img/sqlite-banner.svg`，不改色、不变形 | https://www.sqlite.org/images/sqlite370_banner.svg（官网首页 `<img class="logo">`） | 常驻左上角；标题页放大 |
| 字标深蓝 | `#003b57` | 同一 SVG，字标 `fill:#003b57` | 墨色 |
| 羽毛渐变 | `#97d9f6` → `#0f80cc`，另有实色 `#0f80cc` | 同一 SVG，`linearGradient51` 的 stop | 标志蓝作路线与焦点，浅端作被读到的页的底色；画面不用渐变 |
| 官网主色 | `#044a64`（导航条背景、标题与链接色） | https://www.sqlite.org/sqlite.css：`.menu` 背景、`.fancy h1` 等 | 章节条、常驻元素 |
| 官网字体 | `Verdana, sans-serif`；代码 `'Courier New', Courier, monospace` | 同一样式表 | 不用系统字体；以 Inter、JetBrains Mono 对应 |
| 标语 | Small. Fast. Reliable. Choose any three. | https://www.sqlite.org/index.html | 标题页，附中文释义 |
| 架构图 | Interface / SQL Compiler（Tokenizer, Parser, Code Generator）/ Virtual Machine / B-Tree / Pager / OS Interface，pikchr 绘制 | https://www.sqlite.org/arch.html | 01 章分层图的层名与次序 |
| 源码祝福 | “May you do good and not evil. …” | 3.54.1 源码 src/btree.c 第 1–9 行（FACTS S12） | 结尾，英文原文配中文 |

## 策划约束

见本片 [README「简报」](../README.md#简报)。视觉方案、配色用法与关键帧记在 README「设计」。
