# 一个数据库引擎是如何实现的？——从 MyISAM 说起

数据库引擎系列的第一集。中文，成片 7 分 55.9 秒，1920×1080、60 帧/秒。用一台真实跑着 MySQL 5.5.62 的机器，加上同一版本的源码，讲清 MyISAM：数据落在哪几个文件里、一行有多长、删掉之后留下什么、变长的行怎么放、索引怎样走完一次查询、表锁挡住了什么、崩溃之后剩下什么。结尾提出的「四个问题」成为这个系列后续各集的线索。

**本 README 于 2026-10-06 事后补写。** 这一部在迁入本仓库之前做完，目录里原先没有 README——`docs/retrospectives.md` 第 4 节写着「MyISAM 降为提示的项目记在它的 README 里」，那一句此前无处可指。下面的内容取自 `project.json`、`research/FACTS.md`、`docs/retrospectives.md` 与本机的成片文件，没有重新渲染核对；未核的项逐条标明。制作流程与标准见 [`docs/`](../../../../docs/)。

## 内容

场景文件与 `research/FACTS.md` 的章节一一对应：

| 场景 | 章节 | 讲什么 |
|---|---|---|
| `s00_intro.js` | — | 开场（`FACTS.md` 从 01 起逐章记录） |
| `s01_layers.js` | 01 引擎的位置 | MyISAM 在数据库里负责什么 |
| `s02_files.js` | 02 三个文件 | `.frm`、`.MYD`、`.MYI` 各自存什么 |
| `s03_fixed.js` | 03 定长行 | 第 N 行的偏移就是 N × 16；行号以 6 字节指针寻址 |
| `s04_delete.js` | 04 删除与空位 | 删除标记与空位链；全表扫描按物理顺序返回 |
| `s05_dynamic.js` | 05 变长行 | 碎片与 `OPTIMIZE TABLE`；「多次更新之后」的碎片条为示意图，画面已标注 |
| `s06_index.js` | 06 索引文件与 B 树 | 主键与普通索引结构相同，存的都是行位置 |
| `s07_query.js` | 07 一次查询 | 键缓存只缓存索引页，数据文件依赖操作系统的文件缓存 |
| `s08_lock.js` | 08 表锁 | 排队关系为示意图，不对应具体实测时序 |
| `s09_crash.js` | 09 崩溃 | 索引与数据各自的落盘顺序 |
| `s10_outro.js` | 10 收束 | 提出「四个问题」；与 InnoDB 作对照，不展开 |

## 取证

两路核对，结论须两路一致才写入脚本（详见 `research/FACTS.md` 开头）：

1. **实验**：仿真机（Windows Server 2008，`LegacyMySQL55` 服务，MySQL 5.5.62 Community Server）上建库 `myisam_demo`，执行 `research/lab/*.sql`，每个阶段 `FLUSH TABLES` 后把 `.frm`、`.MYD`、`.MYI` 复制出来。快照在 `research/lab/remote/snap_*`，回显在 `research/lab/remote/*.out`。
2. **源码**：MySQL 5.5.62 的 `storage/myisam/`、`sql/`、`mysys/`，取自 `mysql/mysql-server` 的 `mysql-5.5.62` 标签。

画面里的字节、偏移、页数由 `tools/gen_data.py` 从快照生成到 `src/js/data.js`，不手写；`research/myi.py` 按 `mi_open.c` 的落盘顺序解析 `.MYI`。

## 画面与声音

深色面板式的视觉系统：渐变底、半透明圆角面板、细描边、小号的英文注脚。声音只有旁白和一层铺底（`project.json` 里 `audio.music` 为 `pad`，`music_db −21`、`duck_db 9`、`sfx_db −8`），铺底的低频过重；音效是事后补的，只在两个试听版里。以上都是这一部的问题，不是本系列的做法——按 [`docs/series.md`](../../../../docs/series.md) 第 5 节，视觉系统自本系列第二集（InnoDB）起重新建立，「四个问题」这条线索继续用。

## 已知问题与检查配置

`project.json` 把 `SMALL`、`CONTRAST`、`OVERLAP`、`STILL`、`EMPTY`、`NONDET` 全部降为提示（`warn`），音效覆盖检查关闭（`sfx.per_seconds` 为 0）。按现行检查，本片有二十多处超过 3 秒的静止、两处空画面；画面在四个时刻依赖播放历史（文件卡片的明暗、章节卡上打字那一行的位置），当时没有这项检查。设计上的其余不足（画面由静态版面加局部淡入组成、时长偏长、声音单薄）记在 `docs/retrospectives.md` 第 1 节。这些阈值是本片交付时定下的，未为通过而放宽；后续各集不应照抄。

## 成片

`out/`（生成物，不入库）：

| 文件 | 说明 |
|---|---|
| `myisam-zh-1080p60.mp4` | 成片 |
| `myisam-zh-1080p60-voice-only.mp4` | 仅旁白版 |
| `myisam-zh-试听-A*.mp4`、`myisam-zh-试听-B*.mp4` | 两个试听版（各带一份音效） |
| `myisam-zh.srt` | 字幕 |
| `cover-zh-16x9.*`、`cover-zh-4x3.*` | 封面各两版 |

容器时长 475.883 秒（7 分 55.9 秒，读 mp4 的 `mvhd`）；`docs/retrospectives.md` 记为 7 分 55 秒。本片没有在本仓库的工具链下重新渲染核对。

## 发布

2026-10-06 按频道的公开页面逐条核对：

| 平台 | 平台上的标题 | 平台显示时长 | 发布时刻 | 链接 |
|---|---|---|---|---|
| 哔哩哔哩，合集「数据库引擎」 | 一个数据库引擎是如何实现的?从MyISAM说起 | 7:56（476 秒） | 2026-10-01 13:50 | [BV1u2YA65EMQ](https://www.bilibili.com/video/BV1u2YA65EMQ) |

哔哩哔哩显示的 476 秒是向上取整，文件是 475.883 秒。YouTube 频道上没有这一部。平台简介写的是「由Opus 5.5一句话许愿生成. 约3小时的工作, 消耗20$ Pro 5h限额的50%.」，没有给出本仓库的地址。

## 制作署名

自制。`project.json` 的 `production` 记 `maker` 为 Claude（无版本）。片尾名单的完整内容没有记录在本仓库，未核；`docs/retrospectives.md` 第 1 节只记了成片后三审改掉的三处（多音字「行」被读成 xíng、二分查找的探测顺序与源码不符、一句注解过度概括）。策划：WaterRun。

## 重建

`docs/retrospectives.md` 第 4 节记录了三部片子迁入本仓库时逐项核对能否重建的结果。本片的两处例外：成片的主混音出自更早的混音脚本，无法逐样本重建；四个依赖播放历史的时段，新渲染的画面与已交付的不一致。按本仓库的工具链重做一部片的命令序列见 [`docs/workflow.md`](../../../../docs/workflow.md)。
