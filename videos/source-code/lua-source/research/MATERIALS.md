# 讲解对象的材料

讲解对象自己的视觉与声音材料，供设计取用（经验规则 F16）。每一项写明取自哪里、怎样取得、取得的日期。这里只记**材料与约束**，不写怎么用——用法在 README 的「设计」。原件由 `research/lab/10_materials.py` 下载到被忽略的 `research/_src/materials/`，URL、字节数与 SHA-256 见 [out_10_materials.json](lab/out_10_materials.json)。

| 材料 | 值或文件 | 出处 | 取得方式与日期 |
|---|---|---|---|
| 标志 | 无环绕文字版的 PostScript 程序：行星半径 1，颜色 `0 0 0.5`（#000080）；月亮半径 1−√2/2，圆心 (1,1)；白色圆洞半径同月亮，圆心 (1−2r,1−2r)；环绕虚线 0.5 灰、线宽 0.03、用 arcn 从 27° 顺时针画到 57°，共 330°；「Lua」为 Helvetica 0.9，居中、基线 −0.5 | [lua-logo-nolabel.ps](https://www.lua.org/images/lua-logo-nolabel.ps)；另有 128px GIF [lua-logo.gif](https://www.lua.org/images/lua-logo.gif) | 10_materials.py，2026-11-15 |
| 标志的使用条件 | 可为任何目的使用、复制、分发；不得冒称原作；唯一允许的修改是改环绕文字；任意大小但保持各部分比例；建议在印刷物中注明设计者 Alexandre Nakonechnyj。© 1998 Lua.org | [lua.org/images](https://www.lua.org/images/) 页面与 .ps 文件头注释 | 同上 |
| 主色、辅色 | 标题与链接 #000080；链接悬停底 #D0D0FF；激活链接 #FF0000；页面 #FFFFFF，外底 #F8F8F8；边框 #CCCCCC；表格分隔 #A0A0A0；页脚 gray | [lua.css](https://www.lua.org/lua.css) | 同上 |
| 字体 | 标题 Verdana（常规字重），正文 Helvetica／Arial；手册代码 12pt 等宽。本仓库没有这两种字体，用 Inter 代正文与标题、JetBrains Mono 代代码；标志里的「Lua」用度量相同的 TeX Gyre Heros（GUST 字体许可，[CTAN](https://mirrors.ctan.org/fonts/tex-gyre/opentype/texgyreheros-regular.otf)） | lua.css；`texgyreheros-regular.otf` 与 L、u、a 的字宽（556/1000）见 FACTS P03 | 同上 |
| 官方部件 | h2 前的 ❖（U+2756）小节标记；菜单用「·」分隔；参考手册为白页、蓝色常规字重标题、两栏目录 | lua.css 的 `h2:before`、[版本史](https://www.lua.org/versions.html) 与手册页 | 同上 |
| 真实界面或输出 | 计数器程序在 5.5.1 上的四行输出；`luac -l -l -p` 的字节码列表；`lua -v` 的版本行 | out_07、out_02、out_12 | 实验，2026-11-15 |

## 策划者对视觉与声音的明确要求

2026-11-15：「设计风格高度遵循Lua风格, 必要时可以3D, 内容大于形式.」「可以并出现Lua Logo等标识」。
