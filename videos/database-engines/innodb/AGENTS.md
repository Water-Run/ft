# InnoDB 第二集：接续入口

2026-10-18 最新反馈以 docs/log/feedback.md 的 P14–P20、docs/log/reviews/2026-10-18.md 及本片 review/lessons.json 为准。R8 已定位配音、阅读保持、前集依赖、动画直观性、叙事负担、中文释义和断句问题，尚未修片。后续先据此重审稿与分镜；章节不再反复说“上一期第几个问题”，实质改稿仍交 WaterRun 确认。

本集是数据库引擎系列第 2 集，承接 MyISAM。仅中文；演示环境固定 MySQL 9.7.2（实际服务版本），不要改回 8.4，也不要生成英文版本。

阅读顺序：

1. 根 `AGENTS.md`、`docs/log/plans/2026-10-20-todo.md`、`docs/process.md`、`docs/log/feedback.md`（尤其 P6–P13：策划者对第一版的意见）与 `docs/reference/pitfalls.md`。
2. `../README.md`（系列约定）、`../myisam/README.md` 与其 `research/FACTS.md`；前集是 MySQL 5.5.62，不混用其字节布局。
3. 本片 `README.md`（内容、视觉系统、开工反馈与复盘）、`research/MAP.md` 的主线、时长与边界。
4. `research/FACTS.md`、`research/sources.json`、`research/SOURCE_MAP.md`。
5. `research/lab/README.md`、`out_01_probe.json`、`out_03_pages.json`、`tools/gen_data.py`。

现状：第一版（R7，纸色加钴蓝）已整片作废，不要回到 R7 的稿本或版面。第二版的中文稿 R8 于 2026-10-10 经 WaterRun 确认，配音后只调了节奏（语速 −2%、章末留白），记录见 FACTS「R8 交审」「R8 确认」「R8 制作期的修订」。配音、12 个场景、配乐（`tools/music.py`）、封面与成片的状态与审查结论见 README「成片」与 FACTS「成片复核」。2026-10-18 出片（15:49），同日由策划者投稿哔哩哔哩（[BV1vanV6nEYq](https://www.bilibili.com/video/BV1vanV6nEYq)），记录见 README「发布与反馈」。投稿之后发现第 02 章开头一处画面与设计不符（`s02_tx.js` 第 16 行），为与线上成片一致，源码没有改，见 README「成片」末尾。待人确认的听感、读音与观感见 README「需要人来判断的事项」；要改任何一处，按下文顺序重做并重新渲染。

视觉系统取自 MySQL 9.7 手册的 InnoDB 架构图与 MySQL 标志色，定义在 `src/css/style.css` 的开头注释与 README「视觉系统」；Open Sans 随片放在 `src/type/`。场景的共用部件在 `src/js/parts.js`。镜头一律用 `camTrack`：只在站与站之间移动，停留时极慢单向推近（最多 4%），换站时缩放回到起点；不加往复平移或推拉（策划者明确反对镜头晃动）。静止检查靠内容节拍满足：镜头到站时就给成块内容，长句里按关键词分步出现。

写场景时的几条约束（都踩过）：画线用 `drawIn`，不用引擎的 `draw`（起点前会留下圆头线帽的点）；元素的显隐若要在区间内切换，用 `F()` 由 t 直接算，不用补间切显隐（倒着跳会留下可见元素）；类名经部件拼接时会规范空格，直接写 `h()` 时不要留多余空格；世界容器宽 16000 px，超出 1920 的 `wrap` 文字仍要给宽度。

改动旁白时：先改 `script.js` 并重算 FACTS 的稿本哈希，实质改动须再交审；然后依次 `tts.js`、`check.js`、`audio.js`、`preview.js`、`render.js`、`finish.js`、`check.js --final`。只改配乐或混音时不必重新渲染画面。

复现只在脚本自己创建的隔离容器里做。`research/_src/` 的第三方源码、网页和数据库快照不入库；公开文件不写真实口令、宿主目录或连接地址。并行工作只改本片及必要的本片片单/TODO 条目，保留其他片子的在制改动。
