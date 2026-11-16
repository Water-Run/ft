# 讲解对象的材料

讲解对象自己的视觉与声音材料，供设计取用（经验规则 F16）。这里只记**材料与约束**，用法在 README 的「设计」。取得日期都是 2026-11-16。

| 材料 | 值或文件 | 出处 | 取得方式 |
|---|---|---|---|
| 标志 | 叶形标志与文字「MongoDB」组成；只准用四种颜色、不得改动；叶形单独使用只作品牌标识，「不得用作插图的一部分」 | 官网 Brand Resources https://www.mongodb.com/company/newsroom/brand-resources：“Only four colors can be used for the logo.”“It should never be used as part of an llustration”“Please don't alter the MongoDB logo in any way” | WebFetch 读页面原文。本系列各集不放产品标志（系列约定「Logo」一行），此条只作约束记录 |
| 主色（品牌页 Primary palette 图） | `#00ED64`、`#00684A`、`#023430`、`#001E2B`，另有白色 | 同上页面里的 `la1a3hesiprh7tm6o-Colors.svg` 的 `fill` 值 | curl 取 SVG，统计 fill |
| 色名与扩展色阶 | 官方设计系统 LeafyGreen 的 `palette.ts`：`green.base #00ED64`、`green.dark1 #00A35C`、`green.dark2 #00684A`、`green.dark3 #023430`、`green.light1 #71F6BA`、`green.light2 #C0FAE6`、`green.light3 #E3FCF7`；`black #001E2B`；`gray.dark4 #112733`、`dark3 #1C2D38`、`dark2 #3D4F58`、`dark1 #5C6C75`、`base #889397`、`light1 #C1C7C6`、`light2 #E8EDEB`、`light3 #F9FBFA`；另有 `blue.base #016BF8`、`purple.base #B45AF2`、`yellow.base #FFC010`、`red.base #DB3030` 等 | https://github.com/mongodb/leafygreen-ui/blob/main/packages/palette/src/palette.ts（最近一次改动提交 d70758d，2024-06-25；Apache-2.0） | curl 取 raw 文件 |
| 字体 | 官网正文 `Sohne`，代码 `Sohne Mono`，标题衬线 `MongoDB Value Serif`；中日韩回退 `Noto Sans SC` 等 | https://www.mongodb.com/ 首页内联样式的 `font-family` | curl 首页统计。Sohne 是 Klim Type Foundry 的商业字体、Value Serif 为 MongoDB 专有，仓库里没有，也不能再分发；仓库现有的开源字体见 `kit/assets.json`（Noto Sans SC、Noto Serif SC、Inter、JetBrains Mono 等） |
| 官方部件 | mongosh 的提示符与回显格式（`lab> `、`{ _id: ObjectId('…'), name: 'Alice', age: 42 }`、`Long('2050')`）；`explain("executionStats")` 的阶段名（COLLSCAN、IXSCAN、FETCH）；Compass 与 Atlas 的文档视图用 LeafyGreen 组件 | `research/lab/out_*.txt` 的真实回显 | 实验 |
| 真实界面或输出 | 数据目录文件名（`collection-<uuid>.wt`、`index-<uuid>.wt`、`WiredTigerHS.wt`、`journal/WiredTigerLog.0000000001`）；`wt verify -d dump_tree_shape / dump_address` 的真实输出；日志记录（`row_put`、键 `c7c2`）；Alice 的 47 字节 BSON | `research/lab/out_02…08` | 实验；路径已是相对路径，没有个人信息 |
| 官网与文档的实际渲染（2026-11-16 截图比对，F16） | 首页：暖白底 `rgb(253,255,245)` 即 `#FDFFF5`，标题近黑 `rgb(6,22,33)` 即 `#061621`（`Sohne Condensed` 700），细边线 `rgb(228,232,224)` 即 `#E4E8E0`；主按钮亮绿 `#00ED64` 底、深色字、直角细边；代码示例放在深色圆角卡片里（深底、浅字、键名绿、数字紫），卡片标题栏写文件名；下方大块近黑 `#001E2B` 区与白色大圆角卡片交替。文档页（浅色主题）：白底，H1 用衬线 `MongoDB Value Serif` 32px、颜色 `#00684A`，H2 `Euclid Circular A` 500、`#001E2B`；行内代码 `Source Code Pro`，底 `#F9FBFA`、边 `1px #C1C7C6`、圆角 4px；左侧导航当前项浅绿底加左侧绿色竖条；「注意」提示框左侧蓝色竖线 | https://www.mongodb.com/ 、https://www.mongodb.com/docs/manual/core/wiredtiger/ 、https://www.mongodb.com/docs/manual/reference/explain-results/ | puppeteer 截图并读 `getComputedStyle`；截图在 `out/ref/`（不入库，第三方页面截图不再分发） |

## 策划者对视觉与声音的明确要求

2026-11-16 会话原话：「视觉要参考MongoDB的官方, 浅色主题 B为主, 结合AC」「配乐C」。系列层面的要求见 `videos/database-engines/README.md` 的「共同约定」（视觉与配乐取自本集对象、配乐有质感且史诗感收着用、配音 5 个候选且读法平实、各集画面不放产品标志、封面立体可读、整屏章节卡、片头 PART 6、片尾 `SELECT * FROM credits;` 式的查询）。
