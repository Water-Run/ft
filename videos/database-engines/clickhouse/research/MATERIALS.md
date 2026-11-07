# 讲解对象的材料

讲解对象自己的视觉与声音材料，供设计取用（经验规则 F16）。每一项写明取自哪里、怎样取得、取得的日期。这里只记**材料与约束**，不写怎么用——用法由制作方在 README 的「设计」里决定（`docs/roles.md` 第 3 节）。

| 材料 | 值或文件 | 出处 | 取得方式与日期 |
|---|---|---|---|
| 标志 | 单色的几根竖条（最后一根较短）。本系列各集画面不放产品标志（系列说明「Logo」一项），这里只记作视觉来源：画面里的竖条是「列」本身，不复刻标志的根数与比例 | clickhouse.com 首页页眉 | 2026-11-07 浏览器查看 |
| 主色 | 黄 `#FAFF69`（站点 CSS 变量 `--color-primary-300`）；同一色阶 `#FEFFBA`（100）、`#FDFFA3`（200）、`#EEF400`（400）、`#9FA300`（500） | clickhouse.com 站点样式表 `/_next/static/immutable/chunks/*.css`；首页 HTML 内联样式里 `#FAFF69` 出现 8 次 | 2026-11-07 curl 下载首页与其引用的样式表，统计色值（文件在 `research/_src/site/`，不入库） |
| 近黑与灰 | `#151515`（`--color-neutral-900`，页面底色）、`#161517`（首页 HTML 内联）、`#1F1F1C`（750）、`#282828`（725）、`#414141`（700）、`#606060`（600）、`#A0A0A0`（400）、`#DFDFDF`（200）、`#F9F9F9`（100） | 同上 | 同上 |
| 字体 | 站点用 Inter（正文，OFL，仓库 `kit/assets.json` 已有）、Basier（标题，商业字体）、Söhne / Söhne Breit（商业字体）、Inconsolata（代码，OFL）。商业字体不用；等宽字体仓库现有 JetBrains Mono | 站点样式表的 `font-family` 统计：Inter 28 处、`--font-basier` 15 处、Inconsolata 13 处、fontSohne 7 处 | 同上 |
| 官方部件 | 客户端提示符 `:)`（clickhouse-client 的交互提示符，也用于本片回显）；`PrettyCompact` 表格输出的框线字符；`EXPLAIN indexes = 1` 的缩进树 | `research/lab/out_*.txt`（26.8.34.13 的真实输出） | 2026-11-07 实验 |
| 真实输出 | 片段目录 `all_1_90_3/` 的文件清单、`age.bin` 的 16 进制、`mergeTreeIndex` 的标记、`part_log` 的合并记录等，全部来自实验回显，路径是容器内的 `/var/lib/clickhouse/…`，没有个人信息 | `research/lab/out_02…10_*.txt` | 2026-11-07 实验 |

## 策划者对视觉与声音的明确要求

- 「ClickHouse的黄黑视觉风格很有特色.」（WaterRun，2026-11-07，开工时）
- 系列共同约定：不放产品标志；视觉契合本集引擎自己的风格，各集一眼可分；封面有质感、立体、可读（见系列说明）。
