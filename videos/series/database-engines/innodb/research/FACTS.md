# InnoDB 第二集：事实核查记录

核查日期：2026-10-09。对象：**MySQL Community Server 9.7.2 / InnoDB，9.7 LTS 系列**。仅中文；本轮是基础测绘，不是已审定旁白。事实编号 Ixx 供之后逐句绑定，未充分核实的扩展项不得以定论进入文案。

## 取证环境与版本

- 干净的 Linux x86_64 rootless Podman 容器；网络关闭、未发布端口、Unix socket 连接，全部业务数据为合成数据。
- 镜像固定为 `docker.io/library/mysql@sha256:091c9c7c4b6a6b4d2329d54b7f40d323741785ca990469df9a1d706be0db43e7`。`SELECT VERSION()` 返回 9.7.2，完整配置在 `lab/out_01_probe.json` 的 `environment`，镜像元数据在 `lab/image.json`。
- 源码：官方 `mysql/mysql-server` 的 `mysql-9.7.2`，提交 `008e09c2834b98143a8c067d4d225c90953050cf`；只下载本片核查用的相关文件，未从源码重新编译服务端。路径、SHA-256、符号行号见 [sources.json](sources.json) 与 [SOURCE_MAP](SOURCE_MAP.md)。
- 版本口径：[下载页](https://dev.mysql.com/downloads/mysql/9.7.html) 列 9.7.2 LTS；[9.7.3 发布说明](https://dev.mysql.com/doc/relnotes/mysql/9.7/en/news-9-7-3.html) 说明它仅面向 Docker 镜像补丁。本片技术对象按实际服务端 9.7.2 及同版源码记录，不把镜像补丁号冒充引擎版本。
- 本实验明确关闭 binlog，以隔离 InnoDB 的存储/恢复路径；不把这个实验配置描述为完整默认生产配置。实测 `innodb_flush_log_at_trx_commit=1`、doublewrite=ON、file-per-table=ON、16 KiB 页、DYNAMIC、RR。
- 前集是 MySQL 5.5.62 / MyISAM。本轮沿用相同 users/notes 数据，同时在 9.7.2 创建 MyISAM 对照表。前集成片和原先 README 只能证明前集采用了什么，不能代替本片跨版本事实复核。

来源编号 Dxx 是官方手册，Cxx 是同版源码；编号的直达链接、定位和哈希在 SOURCE_MAP/sources.json。实验 P 指 `lab/out_01_probe.json`（同名 txt 便于阅读）；页实验 B 指 `lab/out_03_pages.json`。源文件原文与网页保存于不入库的 `_src/`。只把实际读到的段落与实际运行输出作为证据，符号搜索结果本身不等于已审计整个函数。

## 定位与存储

| ID | 可以使用的陈述与范围 | 证据与状态 |
|---|---|---|
| I00 | 本集的环境与样本：MySQL 9.7.2（`VERSION()` 实测），默认隔离级别 RR，`innodb_flush_log_at_trx_commit=1`，file-per-table 开启；`users`（8 行）与 `notes`（3 行）为前集沿用的合成数据（据 `lab/README.md`，未逐行对照前集）；同一服务另建与 users 同列的 `users_myisam` | **实测**。P `environment`、`schema`；`lab/README.md`。binlog 关闭，本实验配置不是完整生产配置 |
| I01 | 本实验 MySQL 9.7.2 的 InnoDB 为默认引擎，支持 Transactions/XA/Savepoints；同服务的 MyISAM 三项均为 NO | **实测 + 官方核对**。P `environment`，D19；handler接口位置 C12 `ha_innobase::index_read`、`write_row`、`update_row`。不据此展开未经测试的 XA 工作流 |
| I02 | 本例 file-per-table 的 `users.ibd` 同时包含表数据和索引；配置/表空间类型改变时，不能一概而论 | **实测 + 官方核对**。P `tablespaces`，B 文件131072字节、8个16384字节页；D11。文件还含管理页和SDI，不能将所有页都画成用户记录 |
| I03 | 本表有显式主键，聚簇索引叶子含整行；本次主键根页就是叶子，页号4、level0、8条记录 | **字节实测 + 源码 + 手册**。B `indexes.PRIMARY`；C01 `PAGE_LEVEL`/`PAGE_INDEX_ID`，C13 `dict_index_build_internal_clust`，D01/D02。没有主键的选择规则只作补充，不能说所有表必须显式声明主键 |
| I04 | 当前固定schema下，聚簇记录的用户载荷为 id4字节、name10字节、age1字节；另有DB_TRX_ID6字节、DB_ROLL_PTR7字节，当前记录头5字节 | **字节实测 + 源码 + 手册**。B逐行解码并与8行SQL对照；C13/C14/C18/C19、D03/D17。此表所有字段NOT NULL、latin1、无页外列；不是所有行都固定33字节。显式主键下不额外画一个6字节DB_ROW_ID |
| I05 | 当前二级 `idx_name` 记录保存名字和主键id；查carol的age可沿 `(carol,3)` 到主键记录取得41。只选id/name可出现覆盖索引计划 | **字节实测 + 执行计划 + 源码 + 手册**。B页5的二级记录14字节载荷；P `secondary_lookup`；C13 `dict_index_build_internal_non_clust` 添加聚簇唯一键列，D01。覆盖计划不保证任何隔离场景都完全不访问聚簇记录；两次逻辑树查找不等于两次物理I/O |
| I16 | 聚簇记录的两个事务字段：`DB_TRX_ID` 为最后插入或更新该行的事务；`DB_ROLL_PTR` 指向 undo 记录，该记录含重建修改前内容所需的信息；聚簇记录原地更新，二级索引记录不含这两个字段 | **手册原文核对（已读）**。D03（InnoDB Multi-Versioning）；D01 说明二级索引记录含主键列。字段宽度见 I04 与页实测 B。2026-10-09 补入，供 I04 的字段语义引用 |

有符号整数的字节转换按 C23 `row_mysql_store_col_in_innobase_format` 的大端与符号位处理核对，解码器再用全部8行SQL值交叉检查。字段偏移和十六进制内容由 `03_pages.py` 生成，画面不手抄字节。

## 事务、可见性与锁

| ID | 可以使用的陈述与范围 | 证据与状态 |
|---|---|---|
| I06 | 在本次显式事务中，users和notes两次DML可一起回滚；更新者先见31/birthday，另一个会话仍见30/hello，回滚后恢复30/hello。MyISAM对照改为31后ROLLBACK不能撤回，并返回1196警告 | **实测 + 官方/源码核对**。P `rollback`/`myisam_control`，D12/D19，C11 `trx_rollback_for_mysql`。不把DDL隐式提交、混合非事务表等情况包含在“所有操作都可回滚”里 |
| I07 | undo支持撤销修改，也为一致性读构造所需旧版本；可见性还要由read view判断，不是简单“事务ID小就可见” | **行为实验 + 源码 + 手册**。P `rr_snapshot`、`rc_snapshot`；C04 `ReadView::changes_visible` 检查边界、创建者与活跃事务集合；C06→C07重建旧版本，D03/D08。未逐字节解完整undo链，版本链画面标示意 |
| I08 | 本例普通START TRANSACTION不立即确定RR快照；第一次一致性读见31，外部再次提交32后仍见31，FOR UPDATE见32；RC下一次一致性读见新提交的33 | **实测 + 源码 + 手册**。P `rr_snapshot`/`rc_snapshot`；C08 `trx_assign_read_view`、C05 `ReadView::prepare`，D04/D18。仅讨论本例普通读与锁定读，不把所有SELECT/DML都归到同一个快照规则 |
| I09 | A按唯一主键锁住id1时，B可修改id2；B修改id1会等待并在本例设定的超时后得到1205。行级锁之外，本例还出现表级IX意向锁 | **实测 + 源码 + 手册**。P `record_locks`、performance_schema.data_locks：PRIMARY RECORD X,REC_NOT_GAP；C09 `lock_rec_lock`，D05/D18。条件是本例访问路径，不是“不同行的任意SQL永不冲突” |
| I10 | RR 下 `id>10 AND id<30 FOR UPDATE` 只返回 20。20 上的锁为 next-key 锁（X，即 20 的记录锁加其前的间隙 (10,20]），30 上为 X,GAP（间隙 (20,30)）。插入 15 落在 (10,20]，被 20 上的 next-key 锁挡住，等待后超时（1205）；A 回滚后插入成功。RR 下的范围锁用于防止幻读 | **实测 + 手册原文核对（已读）**。P `gap_locks`（data_locks：20 为 X，30 为 X,GAP）；D05 的 next-key 定义、间隙锁作用与幻读。插入 25 等未测，不作为事实。**2026-10-09 更正**：原文把插入 15 的阻塞归于「30 之前的间隙」，与 data_locks 不符，已改写。辅助表只为明确制造间隙；不能把所有隔离级别、所有范围都套同一锁图 |
| I11 | 两个事务以相反顺序锁id1/id2，本例发生死锁，一方收到1213，另一方继续；死锁与普通锁等待超时是不同结果 | **实测 + 源码 + 手册**。P `deadlock`，C24 `lock_wait_rollback_deadlock_victim`，D13。受害者选择和完成时序不固定；本片不能承诺总回滚最后一个事务 |

## 写入、故障与恢复

| ID | 可以使用的陈述与范围 | 证据与状态 |
|---|---|---|
| I12 | buffer pool缓存表与索引页；提交与每张脏数据页最终刷回文件是不同环节。当前flush=1配置下提交路径要求相应日志写出并刷新 | **源码 + 官方核对，未做fsync系统调用追踪**。C21 `buf_page_get_gen`，C08 `trx_flush_log_if_needed_low` 的case1，D09/D06。本轮不展示“某次提交恰好只做一次fsync”或性能数字；关闭binlog的实验不涵盖binlog协调 |
| I13 | redo记录引擎的修改信息，恢复时从检查点附近解析并应用；未提交事务另需撤销。redo不是SQL文本，也不是binlog | **恢复实验 + 源码 + 手册**。P `crash`/`crash_recovery`，恢复log中的MY-012552/MY-012550/MY-013023/MY-013014；C10 `recv_recovery_from_checkpoint_start`、C11 `trx_rollback_or_clean_recovered`；D06/D07。日志行序按时间戳读；redo也可能包含未提交事务的变化 |
| I14 | 本次已提交id90、未提交id91后对专用容器发送 SIGKILL（其中 mysqld 为 PID 1），重启只见id90；CHECK TABLE返回OK，恢复日志明确出现1个待撤销事务 | **实测 + 源码 + 手册**。P `crash_recovery` 与 `out_01_recovery.log`，C10/C11、D07。仅证明本轮配置与这次进程崩溃；不是掉电、介质损坏、任意故障下零丢失的证明 |
| I15 | doublewrite为数据页写入中断提供另一份页拷贝，解决的问题与redo/undo不同 | **源码 + 官方核对；撕裂页注入未测**。C22 `Double_write::write_pages` 先write_dblwr_pages再write_data_pages；D10。本轮只实查ON，不展示虚构的坏页修复前后字节，不说它等于备份 |

## 补充材料与未测范围

| 主题 | 已有依据 | 进入定稿前的处理 |
|---|---|---|
| 无显式主键时选全NOT NULL唯一索引，否则隐藏聚簇键 | D01与C13的分支 | 如要画隐藏键的实际字节，新增无主键表实测；当前8行样本不适用 |
| 删除标记、purge与长事务保留旧版本 | D03，C07相关可见性判断 | 高层简述可依据来源收窄；若画页空间回收时刻，补采活跃读者与purge实验 |
| 变长列、溢出页、页分裂/合并 | D17、C16导航 | 本次notes短文本仍在页内；不得借用前集动态MyISAM块的格式。详细动画先补测 |
| 三层树与查询路径 | C16搜索入口，前集有不同引擎的三层树 | 当前两个root是叶子。需要就生成较大表、逐页解析，不迁用前集页号或IO次数 |
| ACID中的一致性、外键、约束 | 仅作为待扩展主题 | 尚未做外键/约束实验，不把数据库事务说成自动保证任意业务规则 |
| binlog协调、复制、XA、备份、生产参数调优 | 不在本轮核心范围 | 当前实验binlog=OFF，不据此讲完整生产提交链 |
| 性能与市场份额、历史年份 | 未测/未取证 | 不进入当前稿件，不编速度倍数或采用率 |

## 第 2 轮补证（结构、版本、崩溃与锁的机制，2026-10-09）

R2 以 InnoDB 自身的结构与机制为主线，下列陈述由手册原文（已读，见复核第 7 条）与本轮实测共同支持。

| ID | 可以使用的陈述与范围 | 证据与状态 |
|---|---|---|
| I17 | InnoDB 索引默认页为 16 KiB；索引记录存放在 B 树的叶子页中；聚簇索引插入时预留约 1/16 页空间供后续插入与更新 | **手册原文核对（已读）**。D02（Physical Structure）、D01；页大小与叶子页由 I02、I03 实测。非叶页与多层树未在本实验中测得，画面与稿件标「示意」 |
| I18 | 聚簇记录原地更新；旧值保存在 undo 记录中，undo 记录通常比对应的行小；旧版本只在没有快照需要它时才可丢弃（purge 的前提） | **手册原文核对（已读）**。D03（In-place 更新、undo 大小、update undo 的丢弃条件）、D08（undo 记录含撤销最新修改所需的信息）；回滚结果见 I06 |
| I19 | redo 记录待写回数据文件的修改；恢复从最近的检查点开始，重放尚未写完数据文件的修改；崩溃时仍活动的未提交事务被回滚；若所有修改都已写回，则跳过重放 | **手册原文核对（已读）**。D06（Redo Log：编码修改请求、检查点）、D07（Crash recovery 的步骤与跳过条件）；崩溃实验见 I13、I14 |
| I20 | 锁的范围取决于访问路径。RR 为默认隔离级别；唯一索引的等值条件只锁找到的索引记录，不锁其前的间隙；范围条件用间隙锁或 next-key 锁阻止范围内插入；提交或回滚释放事务持有的锁 | **手册原文核对（已读）**。D18（默认 RR；两类锁定读的加锁方式）、D05（记录锁、间隙锁、next-key 锁）、D12（提交与回滚释放锁）；实测见 I09、I10 |
| I21 | 双写缓冲：页从缓冲池写出时先写入双写缓冲区，再写到数据文件的原位置；写入中断时，崩溃恢复可从双写缓冲区取得完好的页副本 | **手册原文核对（已读）**。D10。本实验只实查 `innodb_doublewrite=ON`（I15），未制造写坏的页，不据此声称修复过程已被验证 |
| I22 | 第一集（承接）：MySQL 5.5.62 / MyISAM；定长行 16 字节；索引项记行在数据文件中的位置；表锁；崩溃后检查与修复。本集只把它们当作对照，不重讲 | 第一集 `myisam/research/FACTS.md` 的 03、索引、并发、崩溃各节，以及 `myisam/src/js/script.js` 的 cue 编号。承接对照表见本集 README「与上一集的承接」 |

## 第 3 轮补证（历史、事务与设计思路，2026-10-09）

R4 增加了 InnoDB 的来历与设计思路，并把开场改为「上一期的局限 → 事务性 → InnoDB」。下列来源中，**O 与 W 尚未回到原站或 9.7 手册原文核对**，交审前须补核；I23 为已读原文。

| ID | 可以使用的陈述与范围 | 证据与状态 |
|---|---|---|
| I23 | 事务：一组修改作为一个整体；提交使修改永久保留并对其他会话可见；回滚撤销全部修改；提交与回滚都释放事务持有的锁。ACID 中，隔离性是其中的 I | **手册原文核对（已读）**。D12（autocommit、Commit 与 Rollback）；D18（"Isolation is the I in the acronym ACID"） |
| I24 | 来历：InnoDB 由芬兰的 Innobase Oy 开发，以开源许可分发；2005 年 10 月 7 日 Oracle 宣布收购 Innobase OY，并表示将继续开发 InnoDB 技术 | **转载，待原站核对**。O：Oracle 新闻稿经 pgsql-advocacy 邮件列表转载（邮件时间 2005-10-07 18:44:47；正文 "07-OCT-2005 Oracle Corporation today announced the acquisition of Finland-based Innobase OY"）。Oracle 官网原文 URL 未取得，待补 |
| I25 | 9.7 中 InnoDB 是默认存储引擎，`CREATE TABLE` 不指定引擎即建 InnoDB 表；InnoDB 的目标包括 ACID 事务、行级锁与一致性读、按主键聚簇组织数据以减少主键查找的 I/O、崩溃后恢复 | **官方手册摘录（WebFetch，待原文核对）**。W 17.1 Introduction to InnoDB（9.7）；默认引擎句亦见 W 第 18 章概述。未取得 InnoDB 成为默认引擎的版本年份，R4 不写年份（5.5 的说法未采用） |
| I26 | 变更缓冲：二级索引页不在缓冲池时，修改先缓存在变更缓冲中，页被读入时再合并。自适应哈希索引：根据观察到的查找模式，在索引键的前缀上自动建立哈希索引，手册称它不牺牲事务与可靠性 | **官方手册摘录（WebFetch，待原文核对）**。W 17.5.2、17.5.3（9.7）。本实验未测其效果，稿件只讲机制，标「示意」 |

## 第 4 轮补证（事务史、OLTP 与 InnoDB 细节，2026-10-09）

R5 增加事务性详解（概念、ACID、锁、日志、多版本与隔离级别、OLTP）与更底层的 InnoDB 细节。文献类陈述按「已读原文 / 摘要或目录 / 检索所得待核」分级；**待核项在配音前必须补核或删改**。

| ID | 可以使用的陈述与范围 | 证据与状态 |
|---|---|---|
| I27 | Jim Gray《The Transaction Concept: Virtues and Limitations》，1981 年 6 月 Tandem 技术报告，同年收入 VLDB（戛纳）。摘要：事务是一次状态变换，具有原子性（全有或全无）、持久性（效果在故障后保留）、一致性（正确的变换）；全部动作完成称提交，没有效果留下称中止。正文：每个可撤销的动作要留下 undo 日志记录，每个可重做的动作要生成 redo 日志记录；提交以向日志写入提交记录为标志。1998 年 Gray 获图灵奖，颁奖词提及数据库与事务处理研究 | 论文：作者分发的 .doc 全文（UMass 课程页，WebFetch 读取，引文为原文）；VLDB 收录见 VLDB 目录（检索）。图灵奖：ACM 页面返回 403，未直读，**待核** |
| I28 | Gray、Lorie、Putzolu、Traiger《Granularity of Locks in a Large Shared Data Base》，VLDB 1975，pp. 428–451：提出把锁与一组资源对应的加锁协议，允许不同事务同时按不同粒度加锁，并使用共享、排他之外的锁模式 | VLDB 目录（dblp 镜像）中的摘要（WebFetch） |
| I29 | Eswaran、Gray、Lorie、Traiger《The Notions of Consistency and Predicate Locks in a Database System》，CACM 19(11): 624–633，1976：一致性要求事务在释放锁之后不再申请新锁；这条规则后来称为两阶段锁 | 书目经 dblp 镜像核对；规则陈述来自检索摘要与课程讲义，摘要原文未直读，**待核**；「两阶段锁」一名出自后来的文献，未核 |
| I30 | Mohan 等《ARIES: A Transaction Recovery Method Supporting Fine-Granularity Locking and Partial Rollbacks Using Write-Ahead Logging》，ACM TODS 17(1)，1992 | 标题、作者与出处经 IBM Research 页面核对（WebFetch）；正文未直读，稿件只引用标题中的内容 |
| I31 | Bernstein、Goodman《Multiversion Concurrency Control—Theory and Algorithms》，ACM TODS 8(4): 465–483，1983：给出分析多版本并发控制算法正确性的理论 | 书目与摘要来自检索结果，**待核** |
| I32 | Berenson、Bernstein、Gray、Melton、E. O'Neil、P. O'Neil《A Critique of ANSI SQL Isolation Levels》，SIGMOD 1995：SQL-92 以脏读、不可重复读、幻读三种现象定义隔离级别；这些现象与定义不足以刻画几种常见的隔离级别；论文定义了快照隔离这一多版本隔离类型 | arXiv cs/0701157 摘要原文（WebFetch）。SQL:1992 的四个隔离级别另见 D18（已读） |
| I33 | 页类型与记录链：`FIL_PAGE_INDEX` = 17855，`FIL_PAGE_SDI` = 17853；紧凑格式记录头 5 字节，最后两字节是到下一条记录的相对偏移。alice 的记录头 `00 00 10 00 21`，偏移 0x21 = 33，下一条记录（bob）在页内偏移 158 = 125 + 33 | **源码 + 字节实测**。C `fil0fil.h`、`rem/rec.h`（`REC_N_NEW_EXTRA_BYTES = 5`）、`rem0rec.ic`（next 为相对偏移）；B 页 4 的记录偏移与记录头 |
| I34 | 整数存放：InnoDB 以大端序存放整数，有符号整数的符号位取反；MySQL 服务层的整数为小端序。本表 id 1 存为 `80 00 00 01`，age 30 存为 `9e`。第一集 MyISAM 文件里 id 1 为 `01 00 00 00`（5.5.62） | **源码 + 字节实测**。C `row0mysql.cc` 第 416–418 行、第 826–828 行注释；B payload；第一集 FACTS 03。源码未说明这样存放的原因，稿件不写原因 |
| I35 | 事务号：alice 一行的 DB_TRX_ID 为 2575，其余七行为 2071。实验中只有 alice（id 1）有过已提交的修改（RR/RC 实验与最后的复原），其余行的修改都已回滚 | **字节实测 + 推断**。B trx_id；P 各实验的提交与回滚；D03 对 DB_TRX_ID 的定义。「其余七行仍是插入时的事务号」是由定义与实验顺序得出的推断 |
| I36 | 回滚段：启动日志记录两个 undo 表空间各创建并跟踪 128 个回滚段；每个 undo 表空间最多 128 个回滚段；undo 日志位于回滚段中的 undo 日志段 | P `out_01_recovery.log`（MY-013018）；D08（已读）；W 术语表 undo tablespace |
| I37 | 崩溃恢复日志：重启时写明系统表空间中的 LSN 与 redo 中的 LSN 不一致（MY-012560），开始崩溃恢复（MY-012552），从检查点附近解析 redo（MY-013086），应用一批 16 条 redo 记录（MY-012532），1 个事务待撤销（MY-013023），随后在后台回滚（MY-013014）；检查点 LSN 写在日志文件头，恢复从最近的检查点开始 | P `out_01_recovery.log` 第 519–559 行；D06、D07（已读） |
| I38 | MySQL 9.7 术语表：ACID（原子性、一致性、隔离性、持久性；InnoDB 的事务遵循 ACID；一致性指多表同时修改时查询只见全旧或全新的值；持久性指提交成功后修改不怕断电与崩溃，双写缓冲协助持久性）；事务；MVCC；一致性读（原数据由 undo 重建）；undo；OLTP（联机事务处理：事务多、读写频繁、每次涉及少量数据，例如航班订座、银行存款；凭行级锁与事务能力，InnoDB 是 MySQL 中 OLTP 应用的理想引擎） | W 术语表（WebFetch 摘录，引文为原文），**待对照手册原页核对** |

## 第 5 轮补证（默认引擎的时间，2026-10-09）

| ID | 可以使用的陈述与范围 | 证据与状态 |
|---|---|---|
| I39 | MySQL 5.5 发布说明「Changes in MySQL 5.5.5 (2010-07-06, Developer Milestone)」写明：InnoDB 取代 MyISAM，成为常规版与企业版的默认存储引擎；嵌入式版仍以 MyISAM 为默认。同一说明的 Bug #54832 指出 SHOW ENGINES 仍把 MyISAM 标为默认，而自 5.5.5 起已不是这样。5.5 系列的正式版为 5.5.8（2010-12-03）。开发任务 WL#5349（Complete，Server-5.5）：自 MySQL 5.5 起，默认存储引擎由 MyISAM 改为 InnoDB。本期的 9.7.2 只是演示环境 | **官方原文（已读）**。downloads.mysql.com/docs/mysql-5.5-relnotes-en.pdf（本地解压 PDF 文本流后检索原句）；dev.mysql.com/worklog/task/?id=5349（WebFetch）。补足 I25 中「未取得年份」一项 |

## 第 6 轮核查（文案确认之后，2026-10-09）

R6 经策划者确认（见「文案审查」）。配音前按「待核实不入成片」逐项补核：网页由 curl 直接取得原始 HTML 后检索原句（副本存于不入库的 `research/_src/web/`，SHA-256 前 16 位附后）。

| ID | 结论 | 依据 |
|---|---|---|
| I24 | **可用**。Oracle 官网新闻列表有「Oracle Announces the Acquisition of Open Source Software Company, Innobase」与「Oracle Subsidiary Innobase OY Releases InnoDB Plug-in for MySQL 5.1」两条标题；全文与日期仍取自 pgsql-advocacy 的转载（2005-10-07） | `oracle_news_listing.html`（6d712a235df79026） |
| I25 | **原文已核**。9.7 手册 17.1：「Its DML operations follow the ACID model…」「Row-level locking and … consistent reads increase multi-user concurrency」「clustered index that organizes the data to minimize I/O for primary key lookups」 | `intro.html`（489d26c40cfd7679） |
| I26 | **原文已核并更正**。17.5.2：变更缓冲缓存「changes to secondary index pages when those pages are not in the buffer pool」，读入时合并；「The default innodb_change_buffering value is none」。17.5.3：「Based on the observed pattern of searches, a hash index is built using a prefix of the index key」；「The adaptive hash index is disabled by the innodb_adaptive_hash_index variable」。InnoDB 1.1 for MySQL 5.5 指南：innodb_change_buffering「The default is all」。**R6 把两项写成默认在工作的机制，不准确；R7 改为「5.5 时变更缓冲默认全开，9.7 中两项默认都关闭」** | `chbuf.html`（546b04e425212419）、`ahi.html`（8a846ba456bbe57a）、`innodb11.pdf`（de8c99497d5accc8） |
| I27 | **图灵奖原文已核**。ACM 页面（2019 年存档）：「1998 CITATION For seminal contributions to database and transaction processing research and technical leadership in system implementation.」 | `acm_turing_gray_2019.html`（ccc8ccab516c8485） |
| I29 | **未采用**。论文 PDF 为无文字层的扫描件，ACM 页面与存档都取不到摘要原文；R7 删去「1976 年 Eswaran 等人的规则」与「两阶段锁」三句 | — |
| I31 | **摘要原文已核**。ACM DL（存档）：「In a multiversion database system, each write on a data item produces a new copy (or version) of that data item. This paper presents a theory for analyzing the correctness of concurrency control algorithms for multiversion database systems.」 | `acm_dl_bernstein_goodman_1983.html`（c0c4106ff8b6c5c9） |
| I38 | **原文已核**。9.7 术语表 ACID、MVCC、OLTP 各条与 R7 引用的措辞一致 | `glossary.html`（8f4d932f6ef3f877） |
| I40 | **新增，原文已核**。ACM 页面同一段：Gray「create a unified approach to the interrelated problems of concurrency control and crash recovery」；「Gray developed techniques that allowed concurrent execution of many transactions, as well as restart after crashes, while maintaining the consistency of the database.」稿件不提其中的其他数据库系统 | `acm_turing_gray_2019.html` |
| I27 | **画面引文已对原件核对**（制作期，2026-10-09）。作者分发的 Word 原件：「The basic idea of logging is that every undoable action must not only do the action but must also leave behind a string, crumb or undo log record which allows the operation to be undone.  Similarly, every redoable action must not only do the operation but must also generate a redo log record which allows the operations to be redone.」「In a log-based scheme, transaction commit is signaled by writing the commit record to the log.」第 03 章画面按此照录（只在句首省略） | `gray81.doc`（92b8b60fbdafdfa3） |
| I32 | **画面引文已对原文核对**（制作期）。arXiv cs/0701157 摘要：「This paper shows that these phenomena and the ANSI SQL definitions fail to characterize several popular isolation levels, including the standard locking implementations of the levels.」「An important multiversion isolation type, Snapshot Isolation, is defined.」 | `arxiv_b95.html`（d32bf23763d957b2） |
| I02 | **制作期更正**（2026-10-09）。users.ibd 第 6、7 页的页类型为 0，`fil0fil.h` 第 1269–1270 行：「Freshly allocated page」「FIL_PAGE_TYPE_ALLOCATED = 0」，即新分配、尚未使用的页，不是管理页。a5 由「其余是管理页，并不存用户记录」改为「其余不存用户记录：前三页管理用，后两页尚未使用」（第 0、1、2 页类型 8、5、3：File space header、Insert buffer bitmap、Index node） | `_src/mysql/storage/innobase/include/fil0fil.h`；B pages |
| I41 | **R8 新增，原文已核**。1995 年论文表 1「ANSI SQL Isolation Levels Defined in terms of the Three Original Phenomena」：READ UNCOMMITTED 三种现象都 Possible；READ COMMITTED 脏读 Not Possible；REPEATABLE READ 脏读、不可重复读 Not Possible，幻读 Possible；ANOMALY SERIALIZABLE 三种都 Not Possible。§4.2：Snapshot Isolation「each transaction reads data from a snapshot of the (committed) data as of the time the transaction started」 | `b95.pdf`（734e83d498b9730e，arXiv cs/0701157 全文） |
| I42 | **R8 新增，原文已核**。9.7 参数页 innodb_flush_log_at_trx_commit：「Default Value 1」「The default setting of 1 is required for full ACID compliance. Logs are written and flushed to disk at each transaction commit.」 | `params.html`（6dd4832e5f1466ff） |
| I43 | **R8 新增，原文已核**。9.7 术语表：dirty read「data that was updated by another transaction but not yet committed」；non-repeatable read「a later query within the same transaction retrieves what should be the same data, but the queries return different results (changed by another transaction committing in the meantime)」；phantom「A row that appears in the result set of a query, but not in the result set of an earlier query」；shared lock / exclusive lock；page「how much data InnoDB transfers at any one time between disk and memory」；buffer pool；dirty page；checkpoint「a record of the latest changes (represented by an LSN value) that have been successfully written to the data files」；LSN「ever-increasing value」；redo「encodes requests to change InnoDB table data」；gap lock「prevents other transactions from inserting a value of 15」；record lock「A lock on an index record」；deadlock「each holds a lock that the other needs」；doublewrite buffer；consistent read「the original data is reconstructed based on the contents of the undo log」 | `glossary.html`（8f4d932f6ef3f877） |
| I44 | **R8 新增，原文已核**。D01：「Accessing a row through the clustered index is fast because the index search leads directly to the page that contains the row data」；没有主键时用第一个所有键列都 NOT NULL 的 UNIQUE 索引，否则生成隐藏的 GEN_CLUST_INDEX（行号列）；二级索引记录含主键列，「InnoDB uses this primary key value to search for the row in the clustered index」。D11：默认建 file-per-table 表空间。D09：新页插在中点（旧子链表头部），再被访问移到新子链表头部，「The algorithm keeps frequently used pages in the new sublist」。D05：意向锁「table-level locks that indicate which type of lock … a transaction requires later for a row」；next-key 锁「prevents phantom rows」。D06：检查点 LSN 存在文件头，恢复从最近的检查点开始。D10：页写到一半中断时，恢复可从双写缓冲区找到完好的副本 | `_src/manual/D01、D05、D06、D09、D10、D11.txt` |

## 文案审查

**确认（2026-10-09）**：WaterRun 审阅 R6 全文后指示「完成视频制作」，记为对 R6 的确认（稿本哈希 `5c74c4e2e694845ce67154d624416689214f64e8ecc5dda69dd26683822adb0c`）。
**确认后的修订 R7（2026-10-09）**：仅为满足「待核实不入成片」与更正事实：删 l6–l8（两阶段锁，I29 核不到原文），增 l0、l0b（I40），改 l1、r1 的过渡语，c1–c6 按 9.7 手册改写（I26 更正）。共 194 条 cue，估算约 15:00。稿本哈希：`SHA-256 b0552d6b30d42468540335369e511f30912e4fff7b1fbd1dc6cb53bba3aa5ff3`。这些修改涉及增删句子，按流程须告知策划者追认，交付说明中单列。
**制作期的修订（2026-10-09，配音与场景阶段）**：不改结构与论点，只为事实与闸门：（1）a5 由「其余是管理页，并不存用户记录」改为「其余不存用户记录：前三页管理用，后两页尚未使用」——第 6、7 页类型为 0（`fil0fil.h`：Freshly allocated page），见本表 I02 的制作期更正；（2）a4 拆为 a4「页头记着类型：17855 是索引页」与 a4b「17853 是 SDI 页」，a15 拆为 a15「id 1 存成 80 00 00 01」与 a15b「年龄 30 存成 9e」——原句配音后超过单句 6 秒的上限，措辞未变；（3）文件头注释更新为确认状态。共 193 条 cue，实测 14:35。稿本哈希：`SHA-256 4e1bf5f1e1389aaa88079198c51b4e3b9911d41020dd13594a111a1e49fd1593`。与 R7 一并请策划追认。
**R8 交审（2026-10-10）**：WaterRun 看过第一版预演后要求重做（意见原话见 `docs/feedback.md` 的 P6–P13）：定位与第一集一致（「一个引擎怎样实现」），主线仍是 MyISAM 引出事务性 → 介绍事务性 → InnoDB；约 15 分钟，其中事务性约 4.5–5 分钟、InnoDB 本身约 8–9 分钟；演示环境只在 y6 交代一次，正文不再说「本实验」；每个术语第一次出现即解释，删去页类型编号、SDI、十六进制与字节序、回滚段个数、恢复日志代码、变更缓冲与自适应哈希；新增「没有主键怎么办」「一次按主键的查询」「一次修改的全过程（示意）」；片尾不配音。新增依据 I41–I44。共 230 条 cue（含 2 处画面停顿），按 R7 实测校准估算约 15:36。稿本哈希：`SHA-256 4784361fe0d4f800ec0f92f663fd0544e87b9bf1e76fee6665d893a17e240c97`。**状态：待 WaterRun 审查，确认前不配音、不做场景。**
**R8 确认（2026-10-10）**：WaterRun 回复「继续」，随后「完成视频」，记为对 R8 全文、设计语言提案（关键帧 kf-r8-1..4）与推荐配音（zh-CN-YunyangNeural，语速 −6%）的确认；「配音」一词按旁白理解，配乐另按 2000 年代电子乐的方向制作，交付时请策划确认听感。
**R8 制作期的修订（2026-10-10，配音与场景阶段）**：旁白的字句与 R8 交审稿相同，只改了三处：（1）语速由确认时的 −6% 改为 −2%——−6% 时全片 16:26，超出 `check.duration` 的 960 秒上限；（2）各章章末留白收紧（`gap` 0.9→0.7、0.6→0.5，`tail` 0.8→0.7、0.9→0.8），全片 15:49；（3）沿用 R7 制作期加入 `SAY` 表的「行」读法规则（数据的「行」送去合成时换成同音的「航」）。稿本哈希（定稿）：`SHA-256 6cd761eed79088de523bf0ac614c3da9cc012e9ac51f5571727d0159351573f9`。语速与留白属于节奏调整，不改论点；听感请策划确认。

**第 5 轮交审（2026-10-09）**：中文稿 R6。按策划意见：章节由 18 个合并为 10 个（从 MyISAM 到 InnoDB、事务与 ACID、锁与日志、多版本隔离级别与 OLTP、设计思路与数据布局、缓冲池与查找、修改与版本、锁、日志与恢复、回到三条局限）；第 01 章补「2010 年 7 月的 MySQL 5.5.5 起成为默认存储引擎」（I39），并说明 9.7.2 只是本期演示版本。191 句旁白、3 处纯画面停顿，共 194 条 cue；估算 14:57（`stats.js` 占位估算），字/秒中位数 4.52，无告警。稿本哈希：`SHA-256 5c74c4e2e694845ce67154d624416689214f64e8ecc5dda69dd26683822adb0c`。待核项同第 4 轮。**状态：待 WaterRun 审查，尚未确认。** 未配音、未写场景。

**第 4 轮交审（2026-10-09，已由第 5 轮取代）**：中文稿 R5 写入 `src/js/script.js` 的 `RAW`（仅 zh）：189 句旁白、3 处纯画面停顿，共 192 条 cue，cue 编号无重复。估计总长约 15:16（`stats.js` 占位估算，未经 TTS 实测），在策划要求的 14–16 分钟内；字/秒中位数 4.53，无过快、过短停顿或超 6 秒的句子。稿本哈希：`SHA-256 9d43556dc605c59f3dd27e414389446bb937ea7bded842d11be6856503293faf`。
- 结构（按策划 2026-10-09 的要求）：从 MyISAM 引出 InnoDB（上一期的三条局限、简短历史、点出事务性）→ 事务性详解（事务的概念、ACID、锁与隔离、日志与恢复、多版本与隔离级别、OLTP）→ InnoDB 详解（设计思路、数据怎么放、缓冲池、两处优化、怎么找、修改与版本、锁、提交与日志、崩溃之后、页写到一半）→ 回到三条局限。
- 只讲 InnoDB，不涉及其他数据库；OLTP 在本集引出，第三集起直接使用。
- 待核：I27 的图灵奖、I29、I31 的文献陈述，I25、I26、I38 的 WebFetch 摘录，I24 的 Oracle 原站公告。配音前须补核，核不了的删改。
- 待策划者判断：事务史的取舍与篇幅（约 4.5 分钟）；片尾署名的写法。
- **状态：待 WaterRun 审查，尚未确认。** 未配音、未写场景；确认前不得运行 `tts.js`。

**第 3 轮交审（2026-10-09，已由第 4 轮取代）**：中文稿 R4 写入 `src/js/script.js` 的 `RAW`（仅 zh）：118 句旁白、3 处纯画面停顿，共 121 条 cue，cue 编号无重复。估计总长约 9:41（`stats.js` 占位估算，未经 TTS 实测）；字/秒中位数 4.60，无过快、过短停顿或超 6 秒的句子。稿本哈希：`SHA-256 b61d96201f5aa2d5f4963d3dfe05da18a9882d131aef161408077de8379e7e4d`。
- 结构：开场引出上一期并列出 MyISAM 的三条局限（无事务、表锁、无日志）→ 事务性 → InnoDB 的来历（I24、I25）→ 五条设计思路 → 细节（数据怎么放、缓冲池、两处优化、怎么找、修改与版本、锁、提交与日志、崩溃之后、页写到一半）→ 回到三条局限。
- 「四个问题」以穿插方式出现在对应章节（a0 放、d0 找、e0 并发、h0 出错），每处只点出问题与本集答案。
- 副题统一为「事务性与现代化：InnoDB」，与片单、`project.json`、本集 README、系列分集表一致。
- 待策划者判断：（1）历史段是否保留 2005 年收购一句（I24 待原站核对）；（2）设计思路的五条是否接受；（3）片尾是否列「文案初稿：Claude Haiku 5.5」。
- **状态：待 WaterRun 审查，尚未确认。** 未配音、未写场景；确认前不得运行 `tts.js`。

**第 2 轮交审（2026-10-09，已由第 3 轮取代）**：中文稿 R2 写入 `src/js/script.js` 的 `RAW`（仅 zh）：108 句旁白、3 处纯画面停顿，共 111 条 cue。估计总长约 8:31（`stats.js` 按占位估算，未经 TTS 实测）；字/秒中位数 4.60，无过快、过短停顿或超 6 秒的句子。行尾编号即本表与 I/D/M/P 的依据。稿本哈希：`SHA-256 f3da7cad609187d9312780698e15ba01d447a755002530b820b5287096c94cee`。
- 主线改为 InnoDB 自身的结构与机制：页与主键树、二级索引、原地更新与 undo、读视图、锁、redo 与检查点、双写。第一集只作开头承接与对照处的一句；承接句以「上一期」开头，出处见行尾 M 编号，逐条对照写在本集 README「与上一集的承接」。
- 待策划者判断：（1）承接句的回顾范围；（2）片尾是否列「文案初稿：Claude Haiku 5.5」；（3）「非叶页与多层树」一句标「示意」、不测多层，是否接受。
- **状态：待 WaterRun 审查，尚未确认。** 未配音、未写场景；确认前不得运行 `tts.js`。确认后，对旁白的实质改动须再次交审。

**第 1 轮交审（2026-10-09，已由第 2 轮取代）**：中文稿 R1 写入 `src/js/script.js` 的 `RAW`（仅 zh）：120 句旁白、3 处纯画面停顿，共 123 条 cue。估计总长约 8:58（`stats.js` 按占位估算，未经 TTS 实测）；字/秒中位数 4.38，无过快或过短停顿。行尾编号即本表与 I/D/M/P 的依据。稿本哈希：`SHA-256 83af352b31c5ec1dba83e7a90602b689642d9b248ff50a29e4eaf80f26142b6a`。
- 交审摘要：核心问题为「同一张表增加事务、并发读写和崩溃恢复之后，数据布局与一次读写需要怎样改变？」。章节为 接回前集 → 数据怎么放 → 数据怎么找 → 一组改动 → 旧版本与读视图 → 写入的冲突 → 提交与恢复 → 四个问题。F01–F09 的处理见 README「开工反馈应用」。
- 示意与简化：页与缓冲池、undo 版本关系、会话时序的先后只按读取顺序，不代表实测耗时（画面阶段标「示意」）；未测的插入 25、撕裂页、掉电均未进入稿件。
- 待策划者判断：（1）片尾是否列出 Claude Haiku 5.5 为文案初稿（当前写入）；（2）时长约 9 分钟，接近 10 分钟上限，是否压缩「接回前集」一章；（3）e5「原地的值已经是 31，30 来自 undo 记录」的说法是否接受。
- **状态：待 WaterRun 审查，尚未确认。** 未配音、未写场景；确认前不得运行 `tts.js`。确认后，对旁白的实质改动须再次交审。

## 制作署名

策划：WaterRun。实际参与本轮的模型：Codex（GPT-6，按本次会话提供的模型标识），负责基础实验、官方来源/源码核查和研究文档。没有进行TTS、图像生成、视频渲染或其他模型委托；不得填入尚未参与的模型。开源视频：[github.com/Water-Run/ft](https://github.com/Water-Run/ft)。最终片尾须与真实制作记录一致。
**2026-10-09 第 1 轮文案**：Claude Haiku 5.5（`claude-haiku-5-5`，本会话的模型标识）撰写中文稿 R1，并按 I/D/M/P 编号自检。是否列入片尾及其写法待策划者确认；确认前片尾名单不定稿。
**2026-10-09 第 4 轮文案**：本会话后段的模型标识为 Claude Opus 5.5（`claude-opus-5-5`），由它撰写 R5 并补证 I27–I38；R1–R4 由 Claude Haiku 5.5 撰写。片尾暂写「文案：Claude Haiku 5.5、Claude Opus 5.5」，待策划者确认。
**2026-10-09 制作（定稿名单）**：R6 确认后，Claude Opus 5.5（`claude-opus-5-5`）撰写 R7 与制作期修订，补证并逐句核对画面引文（I23–I40 与本表核查记录），完成视觉设计、12 个场景与动画、配乐（`tools/music.py`）与音效、封面、审查与文档。旁白由 Microsoft Edge 在线语音合成（zh-CN-YunyangNeural，服务未披露模型），读音回听用 Whisper small，网页检索与摘录用 WebSearch、WebFetch（服务未披露模型）；原文另以 curl 直接下载核对（见核查表的文件与哈希）。片尾名单（14:15 起）：策划 WaterRun；取证与实验 Codex（GPT-6）；文案 Claude Haiku 5.5 · Claude Opus 5.5；补核 · 视觉 · 动画 · 配乐 · 审查 Claude Opus 5.5；旁白合成 Microsoft Edge 在线语音（模型未披露）；读音回听 Whisper small；网页检索与摘录 WebSearch · WebFetch（模型未披露）；开源视频 github.com/Water-Run/ft。旁白读出前三行与开源地址。

**2026-10-10 重做（第二版）**：第一版被要求整片重做后，Claude Opus 5.5（`claude-opus-5-5`）撰写 R8 并补证 I41–I44，重新完成视觉设计（取自 9.7 手册 InnoDB 架构图与 MySQL 标志色）、12 个场景与动画、配乐（`tools/music.py`，2000 年代电子乐的方向）与音效、封面、审查与文档。旁白仍由 Microsoft Edge 在线语音合成（zh-CN-YunyangNeural，−2%），读音回听用 Whisper small，网页检索与摘录用 WebSearch、WebFetch。片尾名单（15:37 起，不配音）：策划 WaterRun；取证与实验 Codex（GPT-6）；文案 Claude Haiku 5.5 · Claude Opus 5.5；补核 · 视觉 · 动画 · 配乐 · 审查 Claude Opus 5.5；旁白合成 Microsoft Edge 在线语音（模型未披露）；读音回听 Whisper small；网页检索与摘录 WebSearch · WebFetch（模型未披露）；开源视频 github.com/Water-Run/ft。

**2026-10-18 收尾**：Claude Opus 5.5（`claude-opus-5-5`，本会话的模型标识）接手：修两处静止段、重新混音、正式渲染与封装、Whisper small 回听、成片复核与文档。这些工作都在片尾「补核 · 视觉 · 动画 · 配乐 · 审查 Claude Opus 5.5」与「读音回听 Whisper small」两行之内，片尾名单不变。

## 本轮复核

1. 运行9.7.2核心实验与正常停机取样；本轮原始SQL、错误码、恢复日志已保留。
2. 真实页的header/index_id/root_page与INFORMATION_SCHEMA交叉核对；8个聚簇记录和8个二级记录的业务值逐一对照SQL。
3. `tools/gen_data.py`只读已保存JSON生成画面数据；完整一致性校验结果见 `lab/out_04_verify.json`。
4. 官方HTML与源码保存哈希；抓取失败不记为已取证，补抓成功后才用于FACTS。版本标签/提交与实际服务端一致。
5. 仅合成数据、通用容器路径；公共材料不含宿主目录、私人地址或真实口令。完整网页与源码不入库。
6. 2026-10-09 写稿前复核：I10 的阻塞原因已更正（插入 15 落在 (10,20]，由 20 上的 next-key 锁覆盖，不是 30 前的间隙）；I14 的「强杀 mysqld」改为专用容器 SIGKILL（mysqld 为 PID 1）；补 I00（环境与样本）与 I16（事务字段语义）。手册原文已读：D01、D03、D04、D05、D08、D13；D06、D07、D09、D10、D12、D18 本轮未重读原文，仍依 2026-10-09 前的核查。源码行号 C 系列本轮未重新核对。前集 M 的 5.5.62 与 16 字节定长行已对照其 FACTS 核对；notes 的沿用关系仅据 `lab/README.md`，未逐行对照前集。
7. 2026-10-09 第 2 轮写稿复核：手册原文已读的有 D01、D02、D03、D04、D05、D06、D07、D08、D09、D10、D12、D13、D18；D11（file-per-table）只据 I02 与实测，未重读原文；C 系列行号（C04、C08）本轮未重核。新增 I17–I22。承接句所引第一集的 cue 编号已对照第一集脚本核对。
8. 2026-10-09 第 4 轮写稿复核：新增 I27–I38。已读原文或源码的有 Gray 1981 正文（作者分发版）、Berenson 1995 摘要、`fil0fil.h`、`rec.h`、`rem0rec.ic`、`row0mysql.cc` 的相关注释与恢复日志；仅有目录、摘要或检索结果的已在各行标明待核。第一集的「整数低位在前」与 5.5.62 已对照其 FACTS。

没有中文定稿、配音、画面或最终MP4，尚未做成片三项审查。F01–F09的最终时间点与观感结果仍待制作后核查；基础测绘完成不等于影片已交付。

## 成片复核（2026-10-18）

上一节「本轮复核」是 2026-10-09 基础测绘阶段的记录，本节是 R8 成片的复核。本轮由 Claude Opus 5.5 做，只改画面，没有改旁白。

1. **接手核对**：`out/zh/video.json` 记下的源文件哈希与当前 `src/` 比对，12 个源文件在 2026-10-10 那次正式渲染之后改过（已随 `e37b3e2` 入库），那一版成片已过期，作废重做。
2. **本轮的画面改动**（都没有新增事实）：
   - 第 03 章 l4（3:05）读到「粒度」时出现释义标签「锁的粒度：锁住多大一块」，复述旁白原句。
   - 第 05 章开头：MyISAM 面板加高，讲到「数据」「索引」时出现记录条与小树，读到「分成」时出现分隔虚线。`.MYD` 存数据、`.MYI` 存 B 树索引，依据同第一集（M s2 b5、b6）与本片开场 i1b–i2 的画法。
   - 第 05 章 a14b（7:36）读到「按主键」时出现整条说明「按主键排好：1 → … → 8」，替换原先读到「链」时才出现的一行小字；编号由 `D.indexes[0].records` 生成，与页 4 的八条记录一致（I03）。
   - 第 07 章 e16 的说明删去「并且」两字，避免压在面板边框上，含义不变。
   - 第 08 章开头：面板、六行与两个会话在本场淡入之前就位，消除换章处的空画面。
   - 第 02 章 t1 读到表名时，那一行标成标志蓝；第 06 章磁盘面板在 b1「怎么找」时先出现；第 09 章 g2 读到「缓冲池」时这一页先压暗，再写进 31。只改出现时刻与强调，没有新增内容。
3. **自动检查**：`check.js` 全部通过，只有 1 条 DENSE 提示（7:57 同屏 29 段文字）。全片低清预演没有 ≥3 秒的静止段，最长 2.8 秒；在预演视频上跑空画面检查，0 段。正式渲染（`verified frames=56968`）与封装之后，`check.js --final` 全部通过：成片没有 ≥3 秒的静止段，空画面 0 段。成片 AAC 音轨另用 ffmpeg 实测：整体响度 −16.5 LUFS，样本峰值 −0.95 dBFS，真峰值 −0.9 dBTP，比 −1 dB 的目标高 0.1 dB（封装工具测的是编码前的混音，报 −1.4 dBTP）。
4. **研究材料**：`tools/verify_research.py` 59 项证据检查、43 份来源的哈希一致，其中包括 `src/js/data.js` 与保存的证据一致。
5. **读音**：Whisper small 对 R8 配音整段回听（`out/zh/asr.txt`），再把可疑的句子从旁白轨切出来逐句复听。同音字（事务／事物、锁／所、页／叶、日志／日治）与「回滚」「连到」「空隙」在逐句复听里都识别对了，是整段转写的上下文误差。逐句复听仍不对的有 y3「Oracle」（识别成「Boracow」）、a14b「链」（识别成「列」）、a17b「事务号」（识别成「15号」），全片「My ISAM」识别成「MySM」，记为待人工试听。在线语音服务当天拒绝连接（403），没有试其他写法。
6. **旁白与画面对应**：`sheets.js cue` 228 帧的逐句总览图逐张看过，每句讲的东西都在画面上；发现第 07 章一行说明压在面板边框上，已改。
7. **片尾与开源链接**：片尾八行名单与 README、本表「制作署名」一致；GitHub 仓库 2026-10-18 可公开访问（API 显示 public，默认分支 main），与片尾的 `github.com/Water-Run/ft` 一致。
8. **隐私**：在 `src/` 中检索个人目录、主机名、内网地址与口令，没有。
9. **未做**：没有逐句重核全部画面事实（本轮只核对改动处与工具检查，其余沿用 R8 制作时的核查记录）；没有重新联网复核外部史实（沿用 I23–I44 的原文与哈希记录）；没有连续播放通看，也没有试听。

### 发布后复核：2026-10-18

- 哔哩哔哩公开稿件：[BV1vanV6nEYq](https://www.bilibili.com/video/BV1vanV6nEYq)；标题「一个数据库引擎是如何实现的?事务性与现代化: InnoDB」；发布于 2026-10-18 22:28:38（UTC+8）；平台时长 15:50（950 秒）；合集「数据库引擎」。取自该稿件的公开视频页，由策划者投稿。简介里的开源地址 `https://github.com/Water-Run/ft` 与片尾一致。
- 核对时评论 0 条。YouTube 频道的公开视频列表里截至同日没有本片。线上与本地成片没有逐帧比对。
- 提交前复查改动时发现：第 02 章开头 notes 表与两张表的表头、记录在本场淡入时就已出现，而不是读到「两张表」时（`s02_tx.js` 第 16 行的行尾注释把入场调用一并注释掉了）。只涉及出现的时刻，不涉及事实与旁白；源码保持与线上成片一致，详见 README「成片」末尾。上文第 2 条第 02 章的「只改出现时刻与强调」，对 notes 表并没有按预期生效。

## 2026-10-18：R8 发布后反馈测绘

来源：WaterRun 本轮直接评价，编号 P14–P20，详见仓库 docs/feedback.md 和 docs/reviews/2026-10-18.md。用户确认了配音、阅读保持、前集依赖、动画直观性、叙事负担、中文释义、读音与断句的问题；这些是观看反馈，不冒充新的技术事实或评分。

本轮依据当前 script.js、timing.zh.js 与正式中文 MP4 测量：10 句明确含“上一期”，整句旁白合计 35.372 秒；十张章卡大字的稳定区间约 1 秒。已从实际 MP4 抽帧核对 1981 年摘要、日志引文和 ARIES 文献画面：有中文标签和部分概念说明，但题名 / 长引文缺完整中文对应，不能写成“所有材料都无中文”。

主 MP4 SHA-256：69b9cb64f2a4779703a501de60c7ffd32a618f11d53bc622593c18fc99f533b8。只读抽帧与测量在 docs/reviews/2026-10-18-measurements.json。三段实际音轨按 cue 截取后用本地 Whisper small 识别，记录见 docs/reviews/2026-10-18-asr.json；Oracle、链、事务号仍是候选。ASR 识别差异不能独立证明发音错误，具体问题须人工复听。

本轮实际参与：GPT-6（Codex，测绘、反馈归档与约束落实）；Whisper small（经 faster-whisper 本地执行三段语音识别）。策划与反馈：WaterRun。原 R8 参与名单保留；下次修订的片尾按实际分工补全，并保留“开源视频”及 GitHub 链接。

结论：反馈已定位，原片未修复；没有连续通看或人耳试听，也没有改旁白、场景或重新生成成片。后续实质改稿须再交 WaterRun 确认。F01–F12 的新应用与待复核状态见 review/feedback.json。
