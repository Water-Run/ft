# 仓库大事记

只追加。各部片子的复盘在各自的 README「复盘」一节。

## 把三部迁入本仓库

2026-10-02。三部片子原先各带一套工具，迁入时合并成 `kit/` 里的一套，并逐项核对了能否重建已交付的成片：

| 项 | 结果 |
|---|---|
| 旁白 | 三部的全部句子都命中原有缓存，重新生成的时间线数据与原先逐项相同 |
| 混音 | 批处理一片的主混音、仅旁白与两条分轨逐样本相同；luainstaller 两种语言的主混音、仅旁白与两条分轨逐样本相同，无配乐版的音效噪声是另一次随机实现；MyISAM 的两个试听版的分轨逐样本相同，它的成片主混音出自更早的混音脚本，无法逐样本重建 |
| 画面 | 新渲染的片段与已交付的画面在压缩噪声之内一致；例外是 MyISAM 里依赖播放历史的时段 |
| 封装 | luainstaller 两种语言的成片与仅旁白版，重新封装后视频流与音频流都与已交付的文件逐字节相同 |
| 闸门 | 三部在各自的检查配置下全部通过；MyISAM 降为提示的项目记在它的 README 里 |

## 仓库重整：分级、角色、经验规则

2026-10-20，策划者 WaterRun 要求「从根源上的彻底重置」：文档散乱、流程时有时无、片子之间同质化、反馈不成体系、前期模型越界、署名写法不统一。Claude Opus 5.5 执行，与同时在制作《垃圾回收的艺术》的会话协作挪动其目录。

- **三个层级。** 去掉 series / standalone 这一层：`videos/` 下第一层是各系列与 `standalone`，第二层是片子；系列说明放在 `videos/<系列>/README.md`，系列可设缺省语言；速通的基座移到 `kit/starters/in-seconds/`。slug 全仓库唯一，重名的改为 `lua-philosophy`、`powershell-pwsh`、`metro-design`、`china-metro` 等。（当天先拍平成一层，策划者指出第一层的分类仍要保留，随即改为现在的两层。）
- **文档。** `docs/` 分为核心（宗旨、角色、制作周期、标准、经验规则）、`guides/`、`reference/` 与只追加的 `log/`。`workflow.md`、`delegation.md`、`feedback-loop.md`、`todo.md`、`catalog.md`、`retrospectives.md` 由 `process.md`、`roles.md`、`lessons.md`、生成的 `videos/README.md` 与各片 README 的「复盘」取代；旧排期存档在 `log/plans/`。
- **角色。** 准备方只交材料与约束，不定审美方案；制作方可以推翻准备方的建议；策划者在会话里的明确要求优先于任何任务书。
- **经验规则。** F01–F20 改写成通用表述，新增 F21「每部片子自成一体」；按阶段用 `lessons.js show --stage` 读取，交付前在 `review/lessons.json` 逐条下结论。规则带 `rev`，只改措辞不让在制片的结论失效。各片原 `review/feedback.json` 转换为新格式，结论原样保留。
- **署名。** 唯一来源是各片 `project.json` 的 `credits`，写真实的模型型号；新片的片尾从这里读，`check.js --final` 核对画面上的名单。旧片的记录按可确认的信息整理，型号未记录的照实写「型号未记录」。
- **工具。** 新增 `lessons.js`、`readable.js`；`catalog.js` 生成片单索引与系列分集表；`check.js` 增加片尾名单核对与雷同提示；`repo-check.js` 增加根目录、文档登记、视频目录与署名写法的检查；渲染的缺省并发按可用内存收紧。
- **自由软件，自由视频。** 宗旨写进 `docs/principles.md` 与根 README。
