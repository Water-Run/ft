# 待办

本文是计划，不是承诺：日期与取舍随时可改，改了顺手更新这一份就行。

片单（[catalog.md](catalog.md)）记「有哪些片」，本文记「先做哪几部、什么时候做」。

| | 片单 `videos/catalog.json` | 本文 |
|---|---|---|
| 记什么 | 全部 20 个系列、160 部片的标题、系列归属、状态、制作方式 | 从今天起一个月左右的日程：日期、片子、开工要点 |
| 什么时候改 | 立项、状态变化、新增或改名 | 改期、换顺序、临时插队 |

每部片子的目标时长按它所属系列说明的「定位」一节定（「XX 秒速通」是标题里的定长秒数），开工时写进 `project.json` 的 `check.duration`。

一部片子做完后：片单里状态改为 `delivered` 并运行 `node kit/tools/catalog.js`，本文里划掉该条，产出与不足写进 [retrospectives.md](retrospectives.md)。做一部片子的完整步骤见 [workflow.md](workflow.md)；发布之后还要回填记录，见该文第 11 节。

## 开工

```bash
node kit/tools/new.js series/<系列>/<视频>        # 系列里的一集，标题与语言取自片单
node kit/tools/new.js standalone/<视频>           # 独立视频
node kit/tools/doctor.js <视频>                  # 环境自检
```

系列里的一集开工前先读该系列的 `videos/series/<系列>/README.md`：连续性约定在那里，不在片单里。速通系列另有基座 `videos/series/in-seconds/_base/`，`new.js` 会自动盖在模板上。

**排期是密度参考，不是交付承诺。** 闸门与三项审查不因为日期紧就压缩；做不完就顺延，并把新日期写回本文。

## 日程

| 日期 | 片子 | 目录 | 开工要点 |
|---|---|---|---|
| 10-08 | 从 WSL 1 到 WSL 2，再到 WSL 3 | `standalone/wsl` | 不再是定长片，时长按「数分钟」定；WSL 3 的现状须联网核对到原始来源 |
| 10-08 | OpenClaw 和 OpenCode 的 v2 大改 | `standalone/openclaw-opencode-v2` | 取证可复用上一部已取回的仓库、发布记录与文档，结论仍要重新给出处 |
| 10-08 | 10 年代的电商网站管理后台是什么样的？OpenCart 1.5 时代典型网页管理后端 | `standalone/opencart-1-5-admin` | 真实装一套 1.5，布局与配色从它自己的 CSS、模板与语言文件里取 |
| 10-09 | 一个数据库引擎是如何实现的？——现代化：InnoDB | `series/database-engines/innodb` | 本系列的新视觉系统由本集起重建；沿用首集的「四个问题」线索；两路取证 |
| 10-09 | 100 秒明白 Opus 5.5 是怎么做动画的 | `series/in-seconds/how-opus-animates` | 定长 100 秒；`check.duration` 设 `[99.9, 100.1]`；讲的是本仓库正在用的做法，每项都要能在 `docs/`、`kit/` 里指出处 |
| 10-10 | 200 秒速通 Lean 4：什么是形式化检验，以及为什么它可靠 | `series/in-seconds/lean4` | 定长 200 秒；用 Lean 4 真编译一段证明，画面上的证据取自编译器自己的输出 |
| 10-10 | 给 LLM 长出手——Harness 是如何工作的？ | `standalone/how-harness-works` | 讲各 harness 共有的那一层；本仓库自己也是一个，可作例子但要分清哪些是别人的做法 |
| 10-11 | 道交法中的路权 | `standalone/traffic-law-right-of-way` | 法条逐条取自现行文本，注意版本与修订日期 |
| 10-11 | 枪械自动原理 | `standalone/firearm-actions` | 机构原理取自可公开的权威资料；只讲原理，不讲操作 |
| 10-11 | CoT：先思考，再回答 | `series/llm-concepts/chain-of-thought` | 本系列首集，要为后续各集建立线索与视觉 |
| 10-12 | 用料是用料，调教是调教——汽车底盘的系统工程 | `series/automotive-systems-engineering/chassis` | 本系列首集 |
| 10-13 | 一个数据库引擎是如何实现的？——小巧紧凑：SQLite | `series/database-engines/sqlite` | 沿用 InnoDB 定下的视觉系统 |
| 10-13 | 编程语言——小巧简练：Lua 解释器的实现 | `series/programming-languages/lua` | 本系列首集（系列有建议栏目，骨架已由 `new.js` 生成） |
| 10-14 | 镜头光学 | `series/camera-gear/lens-optics` | 本系列首集。工作标题「镜头光学基础」，开工时定标题 |
| 10-14 | 宝马底盘代号与车型发展史 | `series/chassis-codes/bmw` | 本系列首集；代号与车型的一一对应逐项给出处 |
| 10-15 | Fluent Design | `series/design-languages/fluent` | 本系列首集。本系列的例外：每一集的视觉贴合它所讲的那套设计语言本身，连续性落在结构与讲法上 |
| 10-15 | CodeX CLI 的实现 | `series/agent-harnesses/codex` | 本系列首集，Harness 系列的线索与视觉从这里开始 |
| 10-16 | PowerPC 时代的麦金塔 | `series/eras/powerpc-macintosh` | 本系列首集：结构与讲法由本集定下；视觉贴合那个年代的麦金塔 |
| 10-16 | 恐龙年代的 AMD | `series/eras/amd-early` | 本系列第二集；连续性在结构与讲法，不在配色 |
| 10-17 | 编程语言——PHP 解释器是如何呈现出一个网站的？ | `series/programming-languages/php` | 沿用 Lua 定下的视觉系统 |
| 10-17 | Web 登录机制：如何确认你是你 | `standalone/web-login` | Cookie、Session、Token、OAuth、Passkey 各自的取舍；机制逐项取自规范与实现 |
| 10-18 | 大众——PQ 时代 | `series/car-platforms/vw-pq` | 本系列首集 |
| 10-18 | PSA——「老法系」经典——PF2 平台 | `series/car-platforms/psa-pf2` | 沿用 PQ 定下的视觉系统 |
| 10-19 | 利用磁力，从磁带到磁盘 | `series/storage-media/magnetic` | 本系列首集 |
| 10-20 | 一个数据库引擎是如何实现的？——开源巅峰 PostgreSQL | `series/database-engines/postgresql` | |
| 10-20 | 液晶显示器和面板，我们应该关心屏幕的什么和影响 | `standalone/lcd-panels` | 分辨率、像素排列、响应时间、色域；参数逐项取自厂商规格书与实测 |
| 10-21 | DeepSeek Harness | `series/agent-harnesses/deepseek-harness` | 沿用 CodeX 那一集定下的线索与视觉 |
| 10-22 | OpenCode | `series/agent-harnesses/opencode` | |
| 10-23 | 150 秒学会怎么打手枪？ | `series/in-seconds/pistol-shooting` | 定长 150 秒；讲射击原理与安全，不讲操作要领 |
| 10-23 | 垃圾回收的艺术 | `standalone/garbage-collection` | 至少两种回收算法各自的代价，用可测的数据说话 |
| 10-24 | 英特尔——酷睿 i 时代之前 | `series/silicon-history/intel-before-core-i` | 本系列首集；指标口径全系列统一，数据逐项给出处 |
| 10-25 | 当碰撞不可避免时：被动安全和白车身 | `series/automotive-systems-engineering/passive-safety` | 碰撞数据取自公开的评级机构报告，注明车型与年份 |
| 10-26 | Material Design | `series/design-languages/material` | 视觉贴合 Material 本身 |
| 10-26 | 宁少一马力，不多一公斤：一轻遮百丑，轻让你在哪里都快 | `standalone/lightweighting` | 整备质量与轴距、操控、油耗的关系；数据取自厂商与实测 |
| 10-27 | AMD 的农机时代 | `series/eras/amd-bulldozer-era` | 本系列第三集 |
| 10-28 | 编程语言——MiniScript | `series/programming-languages/miniscript` | |
| 10-28 | Codewhale | `series/agent-harnesses/codewhale` | |
| 10-29 | Notepad++ 是如何工作的 | `standalone/notepad-plus-plus` | 2026-10-06 新登记。编辑控件、编码与换行、插件机制、会话与多文档；能在本机装一套实测最好 |
| 10-30 | EA211+DQ200 经典动力总成 | `series/powertrains/ea211-dq200` | 本系列首集 |
| 10-30 | （肉到发麻）10s 前中期的 PSA，EC5 与 AT8 | `series/powertrains/psa-ec5-at8` | |
| 10-31 | 一个数据库引擎是如何实现的？——Firebird，小众的第三选择 | `series/database-engines/firebird` | |
| 10-31 | U 盘之前：软盘时代 | `series/storage-media/floppy` | |

## 排期里的顺序

系列内一集在首集做完之前不开工：首集定下结构、贯穿的线索与视觉（或视觉的例外），后续各集接得上。

「时代」系列的三集按这个顺序排：10-16 先做《PowerPC 时代的麦金塔》再做《恐龙年代的 AMD》，10-27 做《AMD 的农机时代》。这一系列是视觉上的例外——各集的视觉贴合各自年代实际的设计语言，连续性落在结构与讲法上（见该系列 README）。其余各系列的首集也都排在后续各集之前。

## 未收尾的杂项

| 事项 | 现状 |
|---|---|
| 2FA 的发布记录 | 已补全（2026-10-06）：哔哩哔哩 `BV1whpF6aECJ`、YouTube `zD2afy1WBX0`，仓库地址已打开核对（200）。片中 `README.md`、`FACTS.md` 与根 README 均已回填 |
| 2FA 的两种语言各上哪些平台 | 待定：B 站上是中文标题的一版，YouTube 上是英文标题的一版；两处是否都上中英两版尚未定 |
| MyISAM 与 Windows 批处理在油管上没有 | 待定：油管频道目前 5 个视频，2FA 与 luainstaller 在上，这两部只有哔哩哔哩 |
| 发布后回填文档 | 已写进 [workflow.md](workflow.md) 第 11 节。这一步漏过一次（2FA 已发布而根 README 未列），不要省 |
