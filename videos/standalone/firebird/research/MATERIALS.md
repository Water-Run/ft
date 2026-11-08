# 讲解对象的材料

讲解对象自己的视觉与声音材料，供设计取用（经验规则 F16）。这里只记**材料与约束**，用法见 README「设计」。Firebird 的标志与名称是其所有者的商标，用于指明所讲的对象，不暗示认可或参与本片。

| 材料 | 值或文件 | 出处 | 取得方式与日期 |
|---|---|---|---|
| 标志（400×400） | `src/img/logo400.png` | [firebird-documentation `src/docs/images/firebird_logo_400x400.png`](https://github.com/FirebirdSQL/firebird-documentation/blob/master/src/docs/images/firebird_logo_400x400.png) | 2026-11-08 下载 |
| 标志（放大、透明底） | `src/img/firebird-logo.png`，1600×1600 | 由上一项 Lanczos 放大 4 倍，白底转透明，形状与颜色不动 | 2026-11-08 |
| 标志字样（黑） | `src/img/logo-firebird-black.png`，649×120 | [firebirdsql.org/img/site/logo-firebird-black.png](https://firebirdsql.org/img/site/logo-firebird-black.png) | 2026-11-08 下载 |
| 标志色 | 金 `#FAAC19`、橙 `#F68A21`、红 `#EE2B24` | 旧版 `lab/09_logo_colors.py` 像素统计（提交 `e3f8a3e`） | 沿用，可复算 |
| 文档样式 | 由 Asciidoctor 默认样式派生；白页、左侧目录 `#f8f8f7`；分隔线 `#e7e7e9`、`#dddddf`；链接 `#2156a5`、悬停 `#1d4b8f`；警示红 `#bf0000`；代码块底 `#f7f7f8` | [Firebird 5 Quick Start Guide](https://firebirdsql.org/file/documentation/html/en/firebirddocs/qsg5/firebird-5-quickstartguide.html) 与 [Language Reference](https://firebirdsql.org/file/documentation/html/en/refdocs/fblangref50/firebird-50-language-reference.html) 的内联样式表 | 2026-11-08 读取 |
| 字体 | 标题 Open Sans（OFL，`src/type/OpenSans-wght.ttf`），正文 Noto Serif，代码 Droid Sans Mono（本片用工具包 JetBrains Mono 代替） | 同上 `@import` | 2026-11-08 |
| 官方部件 | 左栏 Table of Contents（当前项左侧有绿色竖线）；面包屑「Firebird Documentation Index → …」；编号标题「1. About this guide」；标题下细线与灰色作者行；带红色圆形叹号的提示框，右侧竖线分隔 | Quick Start Guide 截图 | 2026-11-08 |
| 官方用语 | FREE LIKE A BIRD / FREE LIKE FREE BEER；The true open-source relational database | [About Firebird](https://firebirdsql.org/en/about-firebird/)、首页 | 2026-11-08 |
| 真实终端回显 | `research/lab/out_01_two_modes.txt` | 本片实验 | 2026-11-08 |
