# 事实核查记录

本文件记录视频《一个数据库引擎是如何实现的？——Firebird，小众的第三选择》中每一项事实陈述的出处。

核查分两路进行，结论须两路一致才写入脚本：

1. **实验**：本机安装 Firebird 5.0.4.1812（Windows x64 官方 zip），在 `lab/` 的脚本里建库、跑并发会话、按字节解析 `.fdb` 文件。回显与结构化结果在 `lab/out_*.txt` / `lab/out_*.json`。
2. **源码与官方文档**：Firebird 5.0.4 源码的 `src/jrd/ods.h`（页与页类型）、安装包自带的 `doc/README.providers.html`、`doc/README.garbage_collector.txt`、`doc/README.security_database.txt`、`doc/Firebird-5.0.4-ReleaseNotes.pdf`，以及 firebirdsql.org 官方站点与样式表。

画面上出现的字节、页数、页类型计数、二进制体积由 `tools/gen_data.py` 从实验产物生成，不手写。

编号：`T` 取证环境与版本，`H` 历史与来历，`E` 引擎与连接方式，`D` 存储与页，`U` 更新与行版本，`M` 并发，`W` 写出错与恢复，`V` 视觉取材。

## 00 取证环境

| 编号 | 陈述 | 出处 |
|---|---|---|
| T01 | 版本 Firebird 5.0.4.1812 | `isql -z` 回显：`ISQL Version: WI-V5.0.4.1812 Firebird 5.0`（`out_01_probe.txt`） |
| T02 | 安装包 `Firebird-5.0.4.1812-0-windows-x64.zip`，25,206,603 字节，SHA-256 `01e844fce4d5f53272a76205dbc3a1ba4b782ab8e8eadcd808cdbccd9ce13b72` | GitHub Release `v5.0.4`；本机下载后 `Get-FileHash` |
| T03 | 平台 Windows x64（本机）；源码基线 FirebirdSQL/firebird 标签 `v5.0.4`（tag 对象 `a1b022aae75d506f4d7a2492925d77fb5963488f`） | GitHub API `git/refs/tags/v5.0.4` |
| T04 | 服务端 `firebird.exe -p 3051` 独立进程；`firebird.conf` 未改，全部为出厂缺省 | `research/_src/fb504/firebird.conf` |
| T05 | 安全库：装包自带的是出厂空库（无预置用户），按 `doc/README.security_database.txt` 的步骤用嵌入式连接建 `SYSDBA`；实验口令现场生成，不入库 | `lab/02_init_user.sql` 与 `lab/out_02_init_user.txt` 的回显：`SEC$USER_NAME=SYSDBA`、`SEC$PLUGIN=Srp` |
| T06 | 取证日期 2026-10-20 | — |

第三方安装包与源码取回后放在 `research/_src/`（不入库）；本文件记录版本、获取地址与校验和。

## 01 它是什么，从哪来

| 编号 | 陈述 | 出处 |
|---|---|---|
| H01 | Firebird 从 Borland（时名 Inprise）的 InterBase 6.0 派生：2000 年 7 月 Borland 公开 InterBase 6.0 源码，同月 Firebird 项目在 SourceForge 建立 | FirebirdFAQ.org 的 Firebird 时间线；Wikipedia 词条互相印证（同一事件的两个独立来源） |
| H02 | 首个正式版 Firebird 1.0 于 2002 年 3 月 11 日发布 | 同上 |
| H03 | 现行稳定版 5.0.4，发布于 2026 年 4 月 17 日 | GitHub Release `v5.0.4`，`published_at = 2026-04-17T10:15:27Z`；官网首页「Firebird 5.0.4」条目 |
| H04 | 5.0.4 发布说明文档版本 `0504-01`，日期 2026 年 4 月 3 日 | `doc/Firebird-5.0.4-ReleaseNotes.pdf` 第 1 页 |
| H05 | 3.0 起把 Classic / Superclassic、Superserver 与 embedded 的核心引擎合并进同一个二进制（Remodelled Architecture） | Firebird 3.0.6 发布说明「Remodelled Architecture」；5.0.4 安装包 `doc/README.providers.html` 同义表述 |
| H06 | 官网标语是「The true open-source relational database」 | `https://firebirdsql.org/` 的 `<meta name="description">` 与页面标题 |
| H07 | Firebird 1.5 之后代码被大规模重写，如今用 C++ 写成 | Wikipedia 的 Firebird 词条：「the code has been largely rewritten since Firebird 1.5」；与 FirebirdFAQ 的时间线互相印证 |
| H08 | 下一集的主角 SQLite 自述为「a C-language library that implements a small, fast, self-contained, high-reliability, full-featured, SQL database engine」；本系列路线把 SQLite 定为「极小」的一端：不再是服务进程 | `https://www.sqlite.org/` 首页首段；本系列说明 `series/database-engines.md` 的「系列路线」表 |

## 02 与系列各集的承接（承上启下）

这一组事实支撑片中的三处承接。**承接靠点名与一条形态轴，不靠回顾前集**（F10：不要求观众记住前集编号或内容）。

| 编号 | 陈述 | 出处 |
|---|---|---|
| C01 | MySQL 与 PostgreSQL 都是客户端/服务器式的：引擎跑在服务端进程里，客户端连的是这个服务 | **PostgreSQL** 一侧取官方手册原文：PostgreSQL 18 文档 §18.3「Starting the Database Server」——「Before anyone can access the database, you must start the database server.」（<https://www.postgresql.org/docs/18/server-start.html>，已读）。**MySQL** 一侧取本系列前两集的实测：MyISAM 一集在 Windows 服务 `LegacyMySQL55`（MySQL 5.5.62）上建库（`myisam/research/FACTS.md` 的取证环境）；InnoDB 一集在容器里以 `mysqld` 为 PID 1 运行，并用 SIGKILL 模拟崩溃后由服务恢复（`innodb/research/FACTS.md` 的 I14）。MySQL 官方手册「What is MySQL?」一页在本机取用时站点故障（Oracle 侧事故 0.37aac117），**未读到原文，故不作逐字引用**；本条只据上面两处已核实的实测与 PostgreSQL 手册原文 |
| C02 | SQLite 连服务端形态都不保留：它是链接进程序的库 | `https://www.sqlite.org/` 首页首段（已读，见 H08） |
| C03 | 本系列的路线：MySQL（MyISAM、InnoDB）→ PostgreSQL → Firebird 是「服务型开源关系数据库」一段，收束在 Firebird；下一段「极小」是 SQLite | 本系列说明 `series/database-engines.md` 的「系列路线」表（策划者 2026-10-19 定） |

## 02 引擎是库，服务端是壳（本片的骨架事实）

| 编号 | 陈述 | 出处 |
|---|---|---|
| E01 | 引擎是一个库；服务端是提供程序（Provider）链里的一环，客户端按连接串决定走哪条路 | `doc/README.providers.html`：「The remodelled architecture integrates the core engine for Classic/Superclassic, Superserver and embedded models in a common binary.」 |
| E02 | 默认提供程序顺序是 `Remote,Engine13,Loopback`：连接串带网络协议走 Remote；只给本地路径则 Remote 拒绝、Engine13 直接打开文件，得到嵌入式连接；再失败才试 Loopback | 同上（原文：「When database name does not contain network protocol (just dbname) Remote provider rejects it and Engine13 provider comes to stage... we do not need special embedded library to have embedded connection, standard client loads appropriate provider and becomes embedded server.」） |
| E03 | 连接串形式：`inet://<host>:<port>/<path>` 走 TCP；`xnet://` 走本机共享内存（Windows 的本地连接）；直接给本地文件路径即嵌入式 | `doc/README.providers.html`；5.0.4 发布说明第 13 节「Removal of WNET protocol」——5.0 已移除 `wnet://`，本地只剩 `xnet://` |
| E04 | 服务端可执行文件 `firebird.exe` 1,160,192 字节；客户端库 `fbclient.dll` 2,073,088 字节；引擎插件 `plugins/engine13.dll` 8,932,352 字节 | `lab/06_modes.py` 的 `binary_sizes`（`out_06_modes.json`），本机 `os.path.getsize` 实测 |
| E05 | 服务端可执行文件比客户端库还小：它主要负责监听与转发，引擎本体在库里 | E04 的体积实测 + E01 的提供程序机制 |
| E06 | 服务端运行时除用户连接外还有两个内部 attachment：`Cache Writer` 与 `Garbage Collector` | `lab/01_probe.sql` 回显（`out_01_probe.txt`）：attachment 1 = Cache Writer，2 = Garbage Collector，3 = SYSDBA（`MON$REMOTE_PROTOCOL = TCPv4`） |
| E07 | 嵌入式连接不需要口令：本地文件路径的连接按宿主身份登录 | `doc/README.security_database.txt`：「For an embedded connection, an authentication password is not required and will be ignored if you provide one.」；本机正是用这种方式完成安全库初始化 |
| E08 | **停掉服务端进程后，远程与环回都连不上，只有嵌入式仍然可以打开同一个库文件** | `lab/06_modes.py` 的 `server-off` 分支：远程报 `Unable to complete network request to host "127.0.0.1"`，环回报 `Unable to complete network request to host "xnet://Global\FIREBIRD"`，本地路径连接成功。回显见 `out_06_modes.json` |

## 03 存储：页与页类型

| 编号 | 陈述 | 出处 |
|---|---|---|
| D01 | 本片实验库的页大小是 8192 字节 | `MON$DATABASE.MON$PAGE_SIZE = 8192`（`out_01_probe.txt`）；字节数互证：1,966,080 = 240 × 8192 |
| D02 | 磁盘结构版本是 ODS 13.1 | `MON$ODS_MAJOR = 13`、`MON$ODS_MINOR = 1` |
| D03 | 建库后 224 页；建表并插入 11 行后 240 页 | `out_01_probe.txt`（224）与 `out_03_schema.txt`（240） |
| D04 | 页头是 16 字节：`pag_type`(1) `pag_flags`(1) `pag_reserved`(2) `pag_generation`(4) `pag_scn`(4) `pag_pageno`(4) | Firebird 5.0.4 源码 `src/jrd/ods.h` 第 227–237 行（`struct pag`，`static_assert(sizeof(struct pag) == 16)`） |
| D05 | 页类型共 10 种：1 header 库头页、2 page inventory 页清单页、3 transactions 事务清单页(TIP)、4 pointer 指针页、5 data 数据页、6 index root 索引根页、7 index 索引页、8 blob data 大字段页、9 gen-ids 生成器页、10 SCN inventory | 同上，第 187–196 行的 `pag_header … pag_scns` 常量表 |
| D06 | 本片实验库 240 页的实际分布：header 1、page inventory 1、transactions 1、pointer 40、data 87、index root 40、index 64、gen-ids 1、SCN inventory 1，其余 4 页尚未分配 | `lab/05_pages.py` 按第 0 字节读页类型（`out_05_pages.json`） |
| D07 | 数据页上 `users` 表的物理行所在页是第 231 号页 | `lab/08_clean_versions.py` 的 `clean_before.fdb` 解析：唯一的 `alice` 落在第 231 页（`out_08_clean_versions.json`） |
| D08 | 名字索引 `idx_users_name` 的 B 树页在第 230 号页，那一页里也有 `alice` 这个键 | `lab/05_pages.py` 的解析：`alice` 命中一次于第 230 页（页类型 7，index B-tree） |
| D09 | 库里实际有 3 个用户自定义索引：`pk_users`、`idx_users_name`、`pk_notes` | `out_03_schema.txt` 的 `RDB$INDICES` 查询 |

## 04 更新与行版本

| 编号 | 陈述 | 出处 |
|---|---|---|
| U01 | 引擎知道每次 update / delete 产生的各个行版本，最老快照事务允许时就能回收 | `doc/README.garbage_collector.txt`：「Engine knows about each record versions produced by update\delete statement and can remove them as soon as oldest snapshot transaction (OST) allowed this.」 |
| U02 | 回收方式由 `GCPolicy` 决定：cooperative（由用户请求顺带回收，Classic 模式只有这一种）、background（专门的回收线程）、combined（两者都做）；SuperServer 缺省是 combined | 同上 |
| U03 | 本机实验库的清扫间隔 `MON$SWEEP_INTERVAL = 20000`（事务） | `out_01_probe.txt` |
| U04 | **一次 UPDATE 之后，同一个物理行在数据页上留下两份副本**：干净库（新建、建表、插 8 行）快照里 `alice` 出现 1 次；只做一次 `UPDATE users SET age = 31` 并提交后再快照，变成 2 次，新副本在第 231 页、文件偏移 1,900,254 | `lab/08_clean_versions.py`（`out_08_clean_versions.json`：`before_hits = 1`、`after_hits = 2`） |

## 05 并发

| 编号 | 陈述 | 出处 |
|---|---|---|
| M01 | **两个并发会话实测：写者更新 `users` 第 1 行的 age 为 31 但未提交，读者在同一行读到的仍是旧值 30，连读两次都是 30；写者提交后读者才读到 31** | `lab/04_mvcc.py` 的 `out_04_mvcc.txt`（五步逐条回显：更新前 30 / 写者自己读到 31 / 读者未提交时 30 / 读者再读 30 / 提交后 31） |
| M02 | 5.0 缺省是 READ COMMITTED 加上语句级读一致性；`ReadConsistency` 参数为 1 时 `rec_version` / `no_rec_version` 事务标志不起作用，设为 0 退回旧行为 | `firebird.conf` 第 800–808 行注释：「The engine currently provides statement-level read consistency in READ COMMITTED mode by default.」 |
| M03 | 引擎在读一致性模式下「沿着后继版本链（back versions chain）找当前快照可见的那一份」 | Firebird 5.0 语言参考（`refdocs/fblangref50`）关于 READ COMMITTED READ CONSISTENCY 的说明 |
| M04 | 5.0 起事务清单里能看到各事务的状态 | `lab/04_mvcc.py` 的 `MON$TRANSACTIONS` 回显：`(58, 1)`、`(59, 0)` |
| M05 | 缓冲页数 `MON$PAGE_BUFFERS = 2048`；数据库只读标志为 0 | `out_01_probe.txt` |

## 06 写出错与恢复

| 编号 | 陈述 | 出处 |
|---|---|---|
| W01 | 强制写已开启：`MON$FORCED_WRITES = 1` | `out_01_probe.txt`；`firebird.conf` 缺省即开 |
| W02 | 引擎内部有两个专职角色：Cache Writer 负责把脏页写回库文件，Garbage Collector 负责回收无用的行版本 | `out_01_probe.txt` 的 attachment 清单（Cache Writer、Garbage Collector）；`doc/README.garbage_collector.txt` 说明回收由专职线程完成（background 模式） |
| W03 | 事务状态在事务清单页（TIP）上：页类型 3 即 `pag_transactions` | `src/jrd/ods.h` 第 189 行的常量与注释 `// Transaction inventory page` |

**不确定的字节口径（不进脚本）**：本片没有解码行版本头的字段布局，只用「同一物理行在页上出现几份」这一可数事实；行内各字节的字段含义未逐字段核实，故不在旁白或画面上标注具体偏移的含义。

## 07 演示用数据

| 编号 | 陈述 | 出处 |
|---|---|---|
| S01 | 本片沿用系列前几集的同一张示例表与同一批数据：`users(id, name, age)` 8 行 alice/bob/carol/dave/erin/frank/grace/heidi，`notes(id, body)` 3 行 | MyISAM 一集 `research/lab/01_create.sql`；本片 `lab/03_schema.sql` 与 `lab/08a_create.sql` |
| S02 | Firebird 没有 TINYINT，`age` 用 SMALLINT | 建表语句与 `out_03_schema.txt` 回显（建表成功） |
| S03 | MyISAM 一集 `notes` 第 2 行原文是「MyISAM stores rows in a .MYD file」；本片改成「Firebird keeps row versions in the data page」，因为本片讲的正是这件事 | `lab/03_schema.sql`；`myisam/research/lab/01_create.sql` |

## 08 视觉与声音的取材

| 编号 | 陈述 | 出处 |
|---|---|---|
| V01 | 官网标志是一只「火鸟」：火焰由金黄渐变到橙再到红，落在红橙色的方框里 | `firebirdsql.org/img/site/firebird.png`（本机取回后按像素统计，`lab/09_logo_colors.py`） |
| V02 | 标志里的实际颜色：金 `#FAAC19`、橙 `#F68A21`、红 `#EE2B24` | 同上，像素统计的前几位 |
| V03 | 官网正文色 `#17222b`，链接与悬停色 `#2e6474` | `https://firebirdsql.org/template/css/style.css`（`a:hover { color: #2e6474 }`，`a { color: #17222B }`） |
| V04 | 官网拉丁字体是 Heebo | 同上，`font-family: "Heebo", sans-serif`（OFL 授权，可自由取用） |
| V05 | isql 的提示符是 `SQL>` | `lab/01_probe.sql` 等回显 |

## 09 制作署名

- 策划：WaterRun
- 事实测绘与实验：MiniMax M3.1 Flash（会话标识 `minimax-M3.1-Flash-Preview`）
- 文案：MiniMax M3.1 Flash
- 任务书与交接材料：MiniMax M3.1 Flash
- 视觉系统、配乐、场景、封面、渲染与交付：Claude Opus 5.5（受托方）
- 配音：尚未合成（音色待定，见 README 与 `brief/05-motion-sound.md`）
- 开源视频：github.com/Water-Run/ft（[源码仓库](https://github.com/Water-Run/ft)）

本片是**委托制作**（`project.json` 的 `production.mode: "delegated"`）。准备方负责第 0–4 步（立项、取证、旁白、任务书）与交接材料；受托方负责视觉系统、配乐、场景、封面、声音、渲染与交付。视觉与声音的**具体方案由受托方设计**，准备方只给材料与硬约束（见 `research/STYLE.md` 与 `brief/`）。

实际用到的第三方软件与版本：

| 软件 | 版本 | 用途 | 许可 |
|---|---|---|---|
| Firebird | 5.0.4.1812 | 被讲的数据库，本机实验 | IPL 1.0 / IDPL |
| Firebird 源码 | 标签 `v5.0.4` | 页结构与页类型常量 | 同上 |
| Python `fdb` | 2.0.4 | 实验脚本连接 Firebird | BSD |
| Python | 3.14.3 | 实验脚本 | PSF |
| Docker Desktop | 29.5.3 | 一次尝试拉取 Firebird 4.0 镜像（未用上，最终改用官方 zip） | — |

## 10 取证中查到、但本片不讲的材料

留待日后再查或另立选题，不写进本片：

- `GCPolicy` 的三种取值在本机 SuperServer 下的实际差别（只从文档读到定义，没有逐项实测）。
- 行版本头的字段级布局（`src/jrd/` 下未定位到 `rse` 结构定义，需要进一步查源码）。
- 5.0 的并行执行（`ParallelWorkers` / `MaxParallelWorkers`）与「更紧凑的记录压缩」（Denser compression of records）——发布说明第 3 节列出，但本片时长与主线不展开。
- `xnet://` 环回与嵌入式的性能差异（本片只讲「能不能连上」，不讲快慢）。
- Firebird 5.0 移除了 `wnet://` 协议（发布说明第 13 节），本片只提到本地连接用 `xnet://`。
- Firebird 的历史考据（Starkey 的 Datatrieve / JRD、Groton、Ashton-Tate、Borland 的收购与开源决定）——本片只需一句「从 InterBase 公开源码而来」，不展开编年史。
