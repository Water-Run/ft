# 事实测绘与制作接口

事实入口为 [FACTS](FACTS.md)。本页整理已经核对的关系与证据位置，不另外引入旁白事实。技术版本为 PostgreSQL 18.4，源码固定提交见 [sources](sources.json)。

## 层次与源码路线

| 路线 | 固定源码入口 | 关联事实与本片证据 |
|---|---|---|
| SQL → 解析/重写 → 计划 → 执行 | `src/backend/tcop/postgres.c` 的 `exec_simple_query`、`pg_parse_query`、`pg_plan_queries`；`src/backend/executor/nodeIndexscan.c` 的 `IndexNext` | T01、T08、T09；八行与两万行的实际计划分别 Seq Scan / Index Scan，无强制禁用顺序扫描。 |
| heap 页 → 项目指针 → 行版本 | `src/include/storage/bufpage.h:159`、`itemid.h:25`、`src/include/access/htup_details.h` | T04–T07；`out_03_decode.json` 按字节独立解码并对照 pageinspect；页头 24、项目 4、业务列均由实测得出。 |
| UPDATE → 新版本 → HOT / 普通索引维护 | `src/backend/access/heap/heapam.c` 的 `heap_update` 和 `use_hot_update`；`README.HOT` | T11、T15；只改年龄与改索引名字列的两条路径，保存实际标志、页内版本与索引项。 |
| 快照 → 版本可见性 → 冲突等待 | `heapam_visibility.c` 的 `HeapTupleSatisfiesMVCC`；heapam 更新锁路径 | T12–T14；RC、RR、未提交读与同一行冲突的多连接受控顺序。 |
| 旧快照 → 可回收界线 → VACUUM | `vacuumlazy.c` 的 `heap_vacuum_rel`、`lazy_scan_heap` | T16–T18；旧快照未释放和释放后的两次清理，lp1 从正常元组变重定向。 |
| COMMIT → WAL flush → crash redo | `xact.c` 的 `RecordTransactionCommit` / `XLogFlush`；`xlogrecovery.c` 的 `PerformWalRecovery` | T19–T21；明确同步配置、immediate 停机和实际恢复日志，不冒充掉电或数据页撕裂。 |
| 类型/运算/索引 → 排他约束 → 事务结果 | `execIndexing.c` 的 `check_exclusion_or_unique_constraint` / `XactLockTableWait`；`btree_gist.control` | T22、T26、T27；设备预约的等待、重叠拒绝、相邻成功和外键拒绝。 |

PostgreSQL 与 InnoDB 在系统边界上不同；默认 heap 是本片研究对象，不为它杜撰一个独立产品式引擎名。表访问方法接口存在，见 FACTS T01 所关联的 18 手册与源码；本片不讲接口实现教程。

## 实际观察的状态序列

1. users 八条合成记录，id=1 / alice / 30；项目号 1，物理位置 `(0,1)`。
2. 一连接在可重复读事务取快照；另一连接把年龄改成 31 但未提交。pageinspect 与原页解码都看到新版本，项目号 9，物理位置 `(0,9)`。
3. 普通 SELECT 仍得 30；竞争 UPDATE 等待至设定的 lock_timeout（55P03），不是测量数据库极限延迟。
4. 提交更新，新 RC 查询得 31；旧 RR 查询仍得 30。第一次 VACUUM 不能回收旧数据。
5. RR 结束，再清理；旧项目成指向 9 的重定向，旧元组存储被回收。
6. 索引名字列改为 alicia，记录新的索引维护路径。两表共同回滚、重复主键拒绝也已实测。
7. 同一用户预约设备，第一事务未提交时第二事务的重叠预约等待；第一事务提交后，重试重叠预约报 23P01；相邻半开区间成功。不存在的用户被外键拒绝。
8. 提交年龄 32，另一个用户的年龄 77 不提交；进程 immediate 停止。重新启动后恢复日志有 redo，查询得到 32 和另一个用户原值 25。

步骤是控制顺序，动画时间由旁白组织，不等同真实耗时。所有事务号、页偏移与 LSN 使用生成数据；重跑后数值可变，不能跨轮拼接。

## 跨库对照的范围

| 比较轴 | PostgreSQL 当前默认 heap | InnoDB 9.7 手册 | 可得出的结论 |
|---|---|---|---|
| 主键读取整行 | 索引找到堆位置，普通索引扫描取堆版本 | 主键聚簇索引叶子保存行数据 | 访问路径不同，不单凭一张结构图判定快慢。 |
| 旧版本 | heap 中保留独立行版本 | 聚簇记录与 undo 信息重建旧值 | 两者都有 MVCC，版本成本的位置不同。 |
| 回收 | 页内剪枝 / VACUUM / 冻结等维护 | undo 历史、删除标记及 purge 等维护 | 两者都需要维护，不能写“Pg 才有清理成本”。 |

这里只比较 FACTS T10、T14、T18 的口径；没有重跑跨库基准，不把 MySQL 的调查名次变化解释为单一存储机制所致。

## 已产出的研究材料

| 材料 | 用途 / 复现条件 |
|---|---|
| `lab/00_schema.sql`、`01_probe.py`、`out_01_probe.json` | 新建实例，多连接完整 SQL 和返回；需要 PostgreSQL 18.4 二进制、pageinspect / hstore / btree_gist 与 psycopg。 |
| `lab/out_01_recovery.log` | 独立实例的恢复日志，宿主身份在落盘前脱敏。 |
| `lab/02_sources.py`、`sources.json` | 23 份固定提交源文件与公开文档的 URL/校验和/符号；原文在忽略目录。MySQL requests 失败与网页工具已读原文分别记录。 |
| `lab/03_decode.py`、`out_03_decode.json` | 从已入库十六进制回显离线解码 7 份页，逐项核对 62 个行版本与 SQL；限本片 schema / 小端平台，不是通用页解析器。 |
| `lab/04_survey.py`、`out_04_survey.json` | 从缓存原页提取 2022/2023/2026 全部答题者口径；2026 人数与百分比复算。没有受访者个体信息。 |
| `lab/05_style.py`、`out_05_style.json` | 官方 SVG 蓝色与字色/底色对比核对，非关键帧验收。 |
| `../tools/gen_data.py`、`../src/js/data.js` | 从已入库 JSON 离线生成画面数据；研究记录为唯一输入，现阶段尚未被正式场景消费。 |

研究总共 15 项行为断言通过。它们证明本片受控实验的结果，不能替代人工审稿或成片验收。

## 第 2 稿的正文范围

按 WaterRun 本轮要求，主线固定为定位与来历 → 数据怎么放 → 怎么找 → 一次修改 → 怎么并发 → 回收 → 出错怎么办 → 四个问题。OLTP 是这些读写操作的负载定位，排名只在开场两句提及。

插入选页与删除事务标记补核了固定 18.4 的 `hio.c` / `heapam.c` 及手册，分别归入 FACTS T28/T29，作为源码示意，没有追加或伪造新的字节实测。源码索引现有 23 份文件。预约、排他约束、hstore、JSONB、PostGIS 的研究保留，设备预约不再是正文独立章节；类型与 GiST 只在索引查找中解释。

跨集关系另存 `lab/out_07_series.json`：首集文件组织、InnoDB 的主键路径/undo/redo、三集相同的八行业务数据、下一集 Firebird 的制作顺序。每处承接在本片 README 列出句号、比较目的与 FACTS 编号，不依赖读者记住前集。

## 第 3 稿的比较与优势核查

按 WaterRun 新要求，在查询与并发中增加二级索引键宽、默认隔离级别的对照；恢复后单列「与 InnoDB 的取舍」。物理路径、版本维护属于引擎层比较；部分索引、JSONB、约束、扩展与采用案例属于整套数据库选型，画面与正文分清层次。

新增 `08_compare.py` / `out_08_compare.json`，另起独立 Pg 18.4 实例：20,000 条合成任务，200 条 open，部分索引查询实际选中 jobs_open_idx；JSONB 包含查询实际选中 jobs_meta_gin，返回 206 行。5 项检查通过，实例已停止，不更改原 15 项实验的含义。计划用于证明能力和访问路径，不把毫秒值转成跨库比较。

`09_compare_sources.py` / `comparison-sources.json` 保存统计、两库手册、Django / Supabase 和扩展上游的一手材料；MySQL 网页的独立抓取失败，原文已通过网页工具阅读，不能冒称已缓存。Django 教程默认配置是 SQLite，只建议真实项目考虑 Pg；“默认选择”收窄为有工程理由的优先候选。采用案例、调查比例与技术原因分开，见 FACTS T30–T38。
