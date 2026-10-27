# 实验

新版取证的实验，2026-10-27 起，在 PostgreSQL 18.4（Windows x86-64，已装的 `C:\Program Files\PostgreSQL\18\bin`）上进行。

每个脚本都调用 [pglab.py](pglab.py)：
- 用已装的二进制另起一个独立集群：临时目录在 `research/_src/`，随机端口，只监听 127.0.0.1，C 区域、UTF8。
- 不连接已有服务 `postgresql-x64-18`。
- 每条命令与查询的完整回显写进同名的 `out_*.json`；写入前把个人目录、用户名、主机名换成通用写法。
- 结束时停掉集群，删除临时目录。

各脚本都从同一张表出发（`pglab.build`）：
- 系列共用的 `users(id, name char(50), age smallint)`，有主键、姓名、年龄三个索引。
- 4096 行逐行插入，2050 号 Alice 42 岁。
- 语句序列相同，所以事务号、页号、行的位置在各脚本里一致。

| 脚本 | 回显 | 内容 |
|---|---|---|
| `01_build.py` | `out_01_build.json`、`pages/` | 逐行插入时堆与三棵树的生长；整体结构；从根到 Alice 的路径；Alice 所在堆页的原样字节（缓冲区与盘上各一份），pageinspect 与自写解析两路核对；VACUUM 后的 FSM、VM |
| `02_query.py` | `out_02_query.json` | 执行计划；冷缓存下各查询读进缓冲区的页；仅索引扫描与可见性映射 |
| `03_update.py` | `out_03_update.json` | 三种表上的 42 → 43：换页的普通更新、同页的普通更新、HOT；索引项与 WAL 记录；第一次读取后的剪枝与重定向 |
| `04_mvcc.py` | `out_04_mvcc.json` | 未提交的版本、快照、读已提交与可重复读、Carol 的等待、串行化失败、回滚的插入、死锁 |
| `05_delete_vacuum.py` | `out_05_delete_vacuum.json` | 删除、长事务挡住回收、VACUUM 收回行与索引项、Dave 复用空间、冻结 |
| `06_wal_crash.py` | `out_06_wal_crash.json` | 提交时 WAL 落盘而数据页未写回、检查点后的整页写、pg_waldump、断电式停机后的恢复 |
| `07_orthodox.py` | `out_07_orthodox.json` | 事务里的 DDL 回滚；CHECK、外键、主键、NOT NULL 约束的报错 |
| `08_survey.py` | `out_08_survey.json` | Stack Overflow 调查 2022–2026 年数据库题「All Respondents」口径的两库比例；原页重新下载到 `research/_src/`，记 SHA-256 |
| `09_docs.py` | `out_09_docs.json` | 18 手册、发布公告、伯克利教员页、MIT News、Hellerstein 回顾里本集要用的原句（逐字）；原页存 `research/_src/` |
| `10_source.py` | `out_10_source.json` | REL_18_4 源码里的定义与规则，记文件、行号与原文 |

重做：`python <脚本>`（01–07 需要 psycopg 3；08、09 需要 beautifulsoup4；Python 3.10 及以上；二进制目录可用环境变量 `PG_BIN` 指定）。

重跑会得到同样的结构、页号与事务号。WAL 位置、校验和、进程号与时间会变。
