# 取证实验

本目录是《一个数据库引擎是如何实现的？——Firebird，小众的第三选择》的实验脚本与证据。每一项事实的出处见 [FACTS.md](../FACTS.md)。

## 一次跑完

在仓库根目录执行：

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File videos/series/database-engines/firebird/research/lab/run_lab.ps1
```

用 **pwsh 7**（`pwsh`）执行。Windows PowerShell 5.1 会按 ANSI 码页读无 BOM 的 UTF-8 脚本，中文注释与字符串会被读坏，脚本直接报语法错。

前提：官方安装包已解压到 `research/_src/fb504/`（不入库）。版本、下载地址与 SHA-256 见 FACTS.md 的 T01 / T02。

产出：证据写进本目录（入库）；体积大的 `.fdb` 快照留在 `out/lab/`（不入库，可由脚本重新生成）。脚本结束时停掉服务端进程。

**口令不入库**：第一次跑时随机生成一个 SYSDBA 口令，存进 `out/lab/lab_password.txt`（`out/` 不入库），之后各次跑读同一个值——安全库里的口令是建库时定下的，改了就连不上。入库的 `.sql` 里只留 `__FTLAB_PASSWORD__` 占位符，由脚本替换后写到 `out/lab/` 再执行；Python 脚本从环境变量 `FTLAB_PASSWORD` 读。

**安全库**：装包里带的是出厂的空 `security5.fdb`（没有任何预置用户）。控制台方式启动的服务端不会自动生成它，缺了就从安装包里取回这一份；然后按 `doc/README.security_database.txt` 的步骤用**嵌入式**连接建 `SYSDBA`（嵌入式连接不需要口令，按宿主身份登录）。

## 脚本与产出

| 脚本 | 做什么 | 产出 |
|---|---|---|
| `01_probe.sql` | 建库并读运行参数：页大小、ODS、页数、强制写、清扫间隔、缓冲页，以及服务端进程里的三个 attachment | `out_01_probe.txt` |
| `01b_columns.sql` | 列名发现（`MON$DATABASE` 与 `RDB$DATABASE` 的真实列名） | 过程记录，不入库 |
| `02_init_user.sql` | 用**嵌入式**连接初始化安全库（出厂 `security5.fdb` 无预置用户） | — |
| `02b_init_user.sql` | 建 `SYSDBA`（插件 `Srp`） | `out_02_init_user.txt` |
| `03_schema.sql` | 系列标准示例表 `users(id, name, age)` 8 行与 `notes(id, body)` 3 行 | `out_03_schema.txt` |
| `04_mvcc.py` | 两个并发会话：写者改 `alice` 的年龄为 31 但不提交，读者两次都读到旧值 30，提交后才读到 31 | `out_04_mvcc.txt`、`out_04_mvcc.json` |
| `05_pages.py` | 按每页第 0 字节统计 240 页的页类型分布，并定位 `alice` 在数据页与索引页上的位置 | `out_05_pages.json` |
| `06_modes.py` | 三种连接方式（`inet://` / `xnet://` / 本地路径）；`server-off` 分支在停掉服务端后重试 | `out_06_modes_on.txt/json`、`out_06_modes_off.txt/json` |
| `07_versions.py` | 在同一个库里反复改 age，数出数据页上的历史副本 | **已被 08 取代**，不列入标准跑批：页上十几份副本是反复实验的产物，不是干净对照。脚本留档备查 |
| `08a_create.sql` | 另建一个干净的库文件（新建、建表、插 8 行） | `out_08a_create.txt` |
| `08_clean_versions.py` | 干净库对照：只做一次 `UPDATE` 提交，前后各拍一次文件快照，数出数据页上同一行的副本数由 1 变 2 | `out_08_clean_versions.txt/json` |
| `09_logo_colors.py` | 按像素统计官网火鸟标志的实际配色 | `out_09_logo_colors.txt` |
| `10_music_smoke.py` | 配乐脚本的离线自检：峰值、各分轨电平、逐章 RMS | `out_10_music.txt/json` |
| `11_style_lint.py` | 按 `kit/tools/check.js` 的同一条规则做样式 lint（渐变、阴影、模糊、圆角、rgb()/hsl()、调色板） | `out_11_style_lint.txt` |
| `12_refill_feedback.py` | `feedback.js sync` 会把规则文本变过的项置回 pending；这个脚本把 F05 / F09 / F10 重新填上 | — |

## 第三方材料（不入库）

放在 `research/_src/`，本目录只记版本与地址：

| 路径 | 是什么 | 地址 |
|---|---|---|
| `research/_src/fb504/` | Firebird 5.0.4.1812 windows-x64 安装包解压后的全部文件，含 `doc/` 下的官方文档与 `Firebird-5.0.4-ReleaseNotes.pdf` | GitHub Release `v5.0.4` |
| `research/_src/fb504-src/` | 源码基线的三个头文件（`src/jrd/ods.h`、`tra.h`、`Record.h`） | `github.com/FirebirdSQL/firebird` 标签 `v5.0.4` |
| `research/_src/web/` | 官网样式表、标志位图与语言参考页的离线副本 | `firebirdsql.org`、`www.sqlite.org` |

## 口径说明

- 页类型编号与页头字段取自 Firebird 5.0.4 源码 `src/jrd/ods.h`（第 187–196 行与第 227–237 行）。
- 行版本头的**字段级布局没有逐字段核实**。本片只用「同一个物理行在数据页上出现几份」这一可数事实，不在旁白与画面上标注行内各字节的字段含义。
- 回显里的绝对路径、用户名与实验口令不出现在入库文件里；实验口令是本机临时值，只在脚本与本机命令里出现。
