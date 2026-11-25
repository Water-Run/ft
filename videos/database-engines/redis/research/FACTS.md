# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。做法见仓库 `docs/guides/research.md`。

取证日期 2026-11-24。对象：Redis Open Source 8.12.0（2026-11-22 GA，当时最新的稳定版）。实验脚本与完整回显在 `research/lab/`，按编号对应（`02_load.sh` ↔ `out_02_load.txt`）；计时与链长分布每次运行略有不同，本文的数一律取自现存的回显文件；源码在 `research/_src/`（不入库），行号都指 8.12.0。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| Redis | 8.12.0（`redis-server --version`：`v=8.12.0 … malloc=jemalloc-5.3.0 bits=64`） | https://download.redis.io/releases/redis-8.12.0.tar.gz ，SHA-256 `b0100a879b2d45dc97d8fda941127609d648f8913008db1b65a2f72a8ae36c8b`；源码目录 `make -j16 BUILD_TLS=no` 编译，只用核心的 `redis-server`、`redis-cli`、`redis-benchmark`（随源码附带的模块没有编译，也不在实验里） |
| 系统 | Debian 13（内核 6.12.118，x86_64），13th Gen Intel Core i5-13400，16 个逻辑核；gcc 14.2.0 | 局域网里一台 Linux 机器，经 SSH 运行；本机 Windows 的 WSL 服务停用，没有用 WSL。机器上原有的 Redis（6379 端口）没有碰 |
| 运行方式 | `redis-server` 不带配置文件、只靠命令行参数启动：`--port 7379 --bind 127.0.0.1 --dir /tmp/redis-lab/run/data --enable-debug-command local`；需要时另加 `--appendonly yes` 等（各脚本写明） | `research/lab/lab_common.sh` 的 `start()`；每个实验都从空的数据目录开始（`fresh()`） |
| 数据 | 4096 个用户，每人一个哈希键 `user:<编号>`，字段 `name`、`age`；Alice 是 `user:2050`、42 岁；其他人姓名为 50 字节的演示串 `UserNNNNN-abc…MN`，年龄 18 + i % 63（与本系列 InnoDB 起各集同一规则）；Dave 后来注册为 `user:4097`、19 岁（与前几集相同） | `lab_common.sh` 的 `gen_users`，逐条 `HSET` 经 `redis-cli` 写入 |
| 回显脱敏 | 回显只出现 `/tmp/redis-lab/` 下的通用路径；进程号写成 `PID`，客户端端口写成「端口」；对象的内存地址（`0x7f…`）是进程里的虚拟地址，每次运行不同，不涉及个人信息 | 脚本里的 `sed` |

重做：在一台 Linux 机器上把 8.12.0 源码解到 `/tmp/redis-lab/redis-8.12.0` 并编译，`research/lab/` 拷到 `/tmp/redis-lab/lab`，运行 `bash run_all.sh`。ObjectId 一类的随机值本片没有；会变的只有内存地址、计时（微秒、毫秒）与哈希表的链长分布（哈希种子每次启动随机，K05）。

## 对象与解释路径

Redis 是一个进程，数据主要放在内存里（H01）。整个数据库是一张从键到值的哈希表（K03）：键是应用起的名字，值有几种类型（K02）。Alice 是键 `user:2050`，值是一个两字段的哈希，在内存里是一段 27 字节的 listpack（L03–L06），挂在一个 16 字节对象头加内嵌键名的对象上（L01、L02）。

一次写入：`HSET` → 命令在唯一执行命令的主线程上执行（C01）→ 算键的哈希值找到桶（K04）→ 新建对象与 listpack 挂进桶。键数到达桶数时表翻倍，旧表里的键在之后的每次读写里一个桶一个桶地搬（R01–R04）。按键读是同一路径，服务端几微秒（Q01）；按名字读没有索引，只能扫全部键（Q03）。改年龄是原地改 listpack 里的一个字节（U01）；删是从表里摘掉（D01），或到期删除（D03、D04）。

并发：所有客户端的命令排成一队，一次执行一条（C01–C03），所以不需要锁和旧版本；MULTI/EXEC 把几条命令连在一起执行，WATCH 做乐观检查，出错不回滚（C05–C09）。

出错：进程一死内存就没了。RDB 是某一刻的整份快照，由 fork 出来的子进程写（P01–P04）；AOF 把每条写命令追加进文件，重启时重放（P05–P08）。两次 RDB 之间的修改在进程被杀时全丢（X01、X02）；AOF 在回复客户端之前已把命令写进内核，进程被杀不丢（X03、X04），断电可能丢约一秒（X06）。

没有弄清或没有实测的：断电与操作系统崩溃（X06 只有文档）；主从复制与集群（不讲）。

## 逐章

### 开场（open）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| o1–o3、c3 | 向 Redis 要 2050 号用户，回来名字 Alice、年龄 42；服务端执行这一条 `HGETALL user:2050` 用了 4–6 微秒（5 次：5、4、6、6、5），旁白说「大约五微秒」 | `out_04_find.txt`「按键找」：每次 `HGETALL` 的回复 `name Alice age 42` 与 `SLOWLOG GET 1` 的用时 | 源码 `server.c:4222` `call()` 里 `c->cmd->proc(c)`（`:4321`）前后计时，同一个数既进 SLOWLOG 也进 commandstats | 8.12.0，本实验 | 2026-11-24 已核 |
| o5、o9–o11 | Redis 把数据主要放在内存里；磁盘上的文件用于持久化（重启后找回） | H01 | H02（持久化页）、P01、P05 | 8.12.0 README；文档 2026-11-24 | 已核；「一个原因」：README 把快归因于内存与高效的数据结构两点 |
| o7、o9 | 本系列前六集的引擎（MyISAM、InnoDB、PostgreSQL、SQLite、ClickHouse、MongoDB）数据都在磁盘上 | S01 | — | 前六集 | 已核（转录） |
| o12–o14 | 名字是 REmote DIctionary Server 的缩写 | H03 | H04（第一个提交的 README：「a dictionary where keys are associated with values」） | 文档 2026-11-24 | 已核 |
| o15b–o15c | 2009 年由 Salvatore Sanfilippo 写成，最初是为了扩展他的实时日志分析工具 LLOOGG | H05 | H06（antirez 本人「Redis itself was a side project of LLOOGG」）；H07（GitHub 最早的提交 2009-03-22） | — | 已核 |
| o15 | Redis 是键值数据库（NoSQL 里的一类） | H04；S02（MongoDB 一集把键值数据库列为 NoSQL 的一类） | H11（DB-Engines 键值数据库排行 2026 年 11 月第 1 名，只作画面注解） | — | 已核 |

### 01 一本字典（dict）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| a2–a4 | 4096 个用户，每人一个键，键名由应用起，例子中是 `user:<编号>` | `out_02_load.txt`：`DBSIZE` 4096；写入命令示例 | — | 本实验 | 已核；「例子中」（F32） |
| a5–a6 | 值可以是字符串、哈希（一组字段）、列表、集合等；Alice 的值是哈希，两个字段 | K02 | `out_02_load.txt`：`TYPE user:2050` → `hash`，`HLEN` → 2 | 8.12.0 | 已核 |
| a7–a12 | 所有键放在一张哈希表里：键算成哈希值，按哈希值的低位选桶；查找时同样算出桶再在桶里比对 | K03、K04 | `out_03_rehash.txt` 的 `DEBUG HTSTATS` 只有一张主表 | 8.12.0 | 已核 |
| a13 | 同一个桶里的键串成链 | K04 | `DEBUG HTSTATS` 的「Chain length distribution」 | 8.12.0 | 已核 |
| a14–a17 | 此时（写完 1 秒后）4096 个键在 8192 个桶里；61.04% 的桶空，有键的 3192 个桶里 2448 个只有 1 个键；最长链 6；平均链长 1.28 | K07 | K05（另几次运行：空桶 60.1%–60.8%，最长链 4–5） | 本实验，`out_10_buckets.txt`（画面的桶位置取自同一次，K07） | 已核 |

### 02 增（insert）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| b2–b5 | 每个键是一个对象：对象头 16 字节（类型 4 位、编码 5 位、引用计数、LRU 时间 24 位、指向值的指针），后面 1 字节标志，再后面内嵌键名 | L01 | L02 | 8.12.0 | 已核；旁白只说类型与编码 |
| b6–b13 | Alice 的值是一段 27 字节的 listpack：4 字节总长 `1b000000`、2 字节项数 `0400`，然后 `84 6e616d65 05`（name）、`85 416c696365 06`（Alice）、`83 616765 04`（age）、`2a 01`（42），末尾 `ff` | L03 | L04（dump.rdb 里原样的 27 字节）、L05（listpack 规格与源码） | 8.12.0，本实验 | 已核 |
| b10 | 每项前面一个字节说明类型与长度（`84` = 长度 4 的短字符串），后面一个字节记这一项的长度，供倒着走 | L05 | L03 的 `hdrlen: 1`、`backlen: 1` | 规格与源码 | 已核 |
| b12 | 42 是小整数，编码字节本身就是数值（`2a` = 42），加上 1 字节的项长 | L03（`bytes: 2a|01|`） | L05（7 位无符号整数编码） | 8.12.0 | 已核 |
| b14 | 字段名 name、age 每个用户都存一遍 | L03、L04（每个用户的 listpack 都含 `6e616d65`、`616765`） | S03（MongoDB 的 BSON 也带字段名） | 8.12.0 缺省配置 | 已核；8.10 起有共享字段名的「hash 模板」，缺省关闭（N03），只作注解 |
| b15–b17 | `MEMORY USAGE user:2050` 55 字节；名字长的用户 100 字节；写入 4096 个用户使 `used_memory` 从 870,160 增到 1,460,384（多 590,224 字节，不到 600 KB） | `out_02_load.txt` | — | 本实验 | 已核；含哈希表本身 |
| b18 | 字段超过 512 个或值超过 64 字节，哈希改用真正的哈希表编码 | K07 | 桶的真实位置：用 gdb 读出该进程的哈希种子 `084b042c1f17cfbaf953f3b4ca36beed`，按 SipHash-1-2（`siphash.c`，`dict.c:116` `dictGenHashFunction`；`server.c` `dbDictType` 用 `dictSdsHash`）算出 4096 个键的桶号（`hash & 8191`），链长分布与同一进程的 `DEBUG HTSTATS`（空桶 5000、1 个 2448、2 个 600、3 个 130、4 个 13、6 个 1，有键的桶 3192）逐项相同；`user:2050` 在第 3271 号桶，桶里只有它 | `out_10_buckets.txt`；`research/lab/buckets.py`；每个键的桶号在 `research/lab/buckets.json` | 已核；种子每次启动随机，这些位置只属于这一次运行 |
| K06 | `out_02_load.txt`：513 个字段时 `OBJECT ENCODING` → `hashtable` | 8.12.0 缺省 | 已核 |
| b21 | 键数一到桶数，表翻倍（4096 → 8192） | R01 | R02 | 8.12.0 | 已核 |
| b24–b26 | 翻倍后新旧两张表并存，每次读写这张表时顺手搬一个桶；叫渐进式 rehash | R03 | R02（读 100 次后 201 个键在新表，读到 4100 次后全部搬完） | 8.12.0 | 已核；「渐进式 rehash」是 redis.conf 的说法 incremental/lazy rehashing 的中文 |
| b27 | 每一步都很小，没有哪条命令要等一次大搬家 | R03（每步搬一个桶，最多看 10 个空桶就返回）；R04 | — | 8.12.0 | 已核（由源码推出） |

### 03 查（find）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| c2–c3 | 按键读：算哈希、找桶、比对键名，取出对象，读 listpack | K04 | Q01 | 8.12.0 | 已核 |
| c5–c6 | 50 个客户端共 20 万次 `HGETALL user:2050`：每秒 162,733.94 次，客户端看到的延迟中位数 0.151 毫秒；服务端平均每次 0.24 微秒 | Q02 | — | 本实验 | 已核；单次的 4–6 微秒与压测平均的 0.24 微秒是两次不同的测量，画面分开标 |
| c7–c9 | 没有按名字的索引；按名字找只能把 4096 个键都扫一遍 | Q03 | — | 8.12.0 核心（不含 Redis 附带的查询引擎模块，N04） | 已核 |
| c10 | 扫一遍用了 3,590–4,155 微秒（3 次），比按键找的 4–6 微秒慢几百倍（约 600–1000 倍） | Q03、Q01 | — | 本实验，同一口径（SLOWLOG） | 已核 |
| c11–c12 | 要按名字找，就另存一个从名字到编号的键 | `out_04_find.txt`「自己维护」：`SET name:Alice 2050`、`GET` → 2050 | — | 本实验 | 已核 |

### 04 改（update）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| d2 | `HSET user:2050 age 43` 回复 0（没有新字段） | `out_05_update.txt` | — | 本实验 | 已核 |
| d3–d4 | 改前改后 listpack 的地址、总长都不变（`addr: 0x…25b8` 那一项），变的只有 `2a` → `2b` | U01 | `DEBUG OBJECT` 的 `Value at` 前后相同 | 本实验 | 已核 |
| d5–d6 | 旧值被覆盖，不留旧版本，不记撤销用的日志 | U01；C08（没有回滚） | — | 8.12.0 | 已核 |

### 05 事务与并发（concur）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| e3–e4 | 执行命令的只有主线程；另有 `bio_close_file`、`bio_aof`、`bio_lazy_free` 等后台线程（关文件、AOF 刷盘、释放内存） | C01 | H08（文档：单线程处理全部请求，后台线程做慢的磁盘 I/O） | 8.12.0 缺省（io-threads 1） | 已核 |
| e6–e7 | 命令排成一队，一次执行一条，执行中不被打断 | H08 | C02 | 文档 | 已核 |
| e8 | Alice 与 Carol 两个连接同时各做 10000 次 `HINCRBY`，结果 20000 | C02 | — | 本实验（字段 visits） | 已核 |
| e9–e11 | 不用行锁、不用旧版本：同一时刻只有一条命令在动数据 | H08、C01 | — | — | 已核（由单线程推出）；「行锁」「旧版本」是前几集讲过的做法（S01） |
| e12–e13 | 一条慢命令让所有人等：Carol 的 `DEBUG SLEEP 0.5` 期间，0.1 秒后发出的 Bob 的读又等了 0.40 秒 | C03 | H08（「a request that is slow to serve will make all other clients wait」一类说法，见 H08 原文） | 本实验 | 已核 |
| e15–e17 | 先读后写分两条命令：两边都读到 42、都写回 43，两次加一只多了一 | C04 | — | 本实验 | 已核 |
| e18–e20 | MULTI 后命令回 QUEUED，EXEC 时一起执行；排队期间 Bob 读到 42，EXEC 后 43 | C05 | H09（「A request sent by another client will never be served in the middle」） | 本实验；文档 | 已核 |
| e21–e24 | WATCH 后键被 Carol 改过，Alice 的 EXEC 回空；重读再做得到 44 | C06 | H09（WATCH、乐观锁、EXEC 返回空） | 本实验；文档 | 已核 |
| e26–e27 | 没有回滚：EXEC 里第二条报错，第一条照样生效 | C07 | H09（「even when a command fails, all the other commands in the queue are processed」） | 本实验；文档 | 已核 |
| e28–e29 | 官方的理由：支持回滚会显著影响 Redis 的简单与性能 | H09（「Redis does not support rollbacks of transactions since supporting rollbacks would have a significant impact on the simplicity and performance of Redis.」） | — | 文档 2026-11-24 | 已核 |

### 06 出错怎么办（crash）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| f4–f5 | RDB 是某一刻整份数据的快照 | H02 | P02 | 文档 | 已核 |
| f6–f7 | 写快照时 fork 一个子进程，子进程写，主进程继续处理命令（写时复制） | H02（「Redis forks. We now have a child and a parent process.」「copy-on-write」）；`rdb.c:2352` `rdbSaveBackground`、`:2361` `redisFork` | P01（日志「Background saving started by pid …」「DB saved on disk」） | 8.12.0 | 已核 |
| f10 | dump.rdb 里原样有 Alice 的 27 字节 listpack | L04 | — | 本实验 | 已核 |
| f11–f12 | 不带配置文件时缺省保存点：3600 秒内至少 1 次修改、300 秒内至少 100 次、60 秒内至少 10000 次 | P03 | `out_01_environment.txt`：`save 3600 1 300 100 60 10000` | 8.12.0 | 已核 |
| f15–f16 | 缺省配置下写完 4096 个用户立刻 `kill -9`，重启后 0 个键 | X01 | — | 本实验 | 已核 |
| f17–f18 | `SAVE` 之后改成 43 再 `kill -9`，重启后是 42 | X02 | — | 本实验 | 已核 |
| f19–f20 | AOF 缺省不开；开了以后每条写命令按协议格式追加到文件末尾 | P05、P06 | `out_01_environment.txt`：`appendonly no` | 8.12.0 | 已核 |
| f21 | Alice 改成 43 后，incr 文件多出 `*4 $4 HSET $9 user:2050 $3 age $2 43` 这一段（前面有一次 `SELECT 0`） | P06 | — | 本实验 | 已核 |
| f22–f23 | 重启时重放这些命令；和 InnoDB 的 redo 一样靠重放 | H02（「These operations can then be replayed again at server startup」）；X03 日志「DB loaded from incr file」 | S04（InnoDB 一集 redo 重放） | — | 已核；redo 记的是页的物理改动，AOF 记的是命令，相同的只是「重放」 |
| f24–f25 | 开了 AOF，缺省每秒 fsync 一次 | P07 | `out_01_environment.txt`：`appendfsync everysec` | 8.12.0 | 已核 |
| f26–f27 | 回复客户端之前，命令已写进内核（write），进程被杀不丢 | P08 | X03、X04 | 8.12.0 | 已核；例外：fsync 慢时 everysec 最多推迟写入 2 秒（P08），本片不讲 |
| f28–f29 | 一边 `INCR` 一边 `kill -9`：客户端最后收到 33287，重启后 33287 | X04 | — | 本实验 | 已核 |
| f30–f30b | 断电（灾难）时 everysec 可能丢约 1 秒的数据 | X06 | — | 文档 2026-11-24 | 已核（单一来源，官方文档；本片没有做断电实验） |
| f31 | `appendfsync always` 每条写都先 fsync 再回复，慢 | P07（「always: fsync after every write to the append only log. Slow, Safest.」）；P08（beforeSleep 注释） | X05（always 下 kill -9 后为 43） | 8.12.0 | 已核 |
| f33–f34 | AOF 会重写：当前数据写成一个新的 base（RDB 格式），之后的命令进新的 incr | P09 | — | 本实验 | 已核；4096 个用户的 incr 461,764 字节、RDB 347,102 字节（P02、X07），只作画面注解 |
| f36–f37 | RDB 恢复快、丢得多；AOF 丢得少、文件通常更大；两种可以同时开 | H02（RDB advantages / AOF disadvantages；「you should use both persistence methods」） | X07 | 文档 | 已核 |

### 07 删（delete）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| g1–g2 | `DEL user:2050` 回 1，之后 `EXISTS` 0，`DBSIZE` 4095；缺省（`lazyfree-lazy-user-del no`）在主线程里同步释放 | D01 | `db.c:1488` `delGenericCommand(c, server.lazyfree_lazy_user_del)` | 8.12.0 | 已核 |
| g3 | Dave 的键 `user:4097` 是应用起的名字 | `out_06_delete.txt` | — | 本实验 | 已核 |
| g4–g6 | 过期两条路：访问时发现过期就删（被动）；定时随机抽查带过期时间的键，过期的删掉（主动） | H10 | D02（`expire.c:96` 每轮 20 个） | 文档；8.12.0 | 已核；不讲具体百分比（文档写 25%，源码常量是 10%，N05） |
| g7–g8 | 关掉主动过期（`DEBUG SET-ACTIVE-EXPIRE 0`），过期 2.5 秒后 `expired_keys` 仍为 0、`DBSIZE` 4097；`EXISTS` 一碰，`expired_keys` 变 1、`DBSIZE` 4096；打开后不访问也被删掉 | D03 | — | 本实验 | 已核 |
| g9 | 设了内存上限又满了，缺省 noeviction 拒绝写入（`OOM command not allowed …`） | D04 | H12（文档：noeviction 返回错误；`maxmemory` 缺省 0 不限） | 8.12.0 | 已核 |
| g11 | 改成 allkeys-lru 后，写入时挑最近最少使用的键淘汰 | D04（`evicted_keys:464`） | H12 | 本实验 | 已核；淘汰个数只属于这一次，不进旁白 |

### 08 五个问题（five）

各句是前几章的归纳：h2–h3 → L01–L03、K03；h4 → K04、Q01；h5 → U01、D01、D03；h6–h7b → C01、C05、C06；h8–h9 → P01、P05、P07、X01–X04。2026-11-24 已核。

### 09 同一段经历（finale）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| z4–z13 | 前六集各自的做法（一句话） | S01 | — | 前六集 | 已核（转录） |
| z14 | Redis：放在内存里，一张哈希表直接找到 | K03、Q01 | — | — | 已核 |
| z17–z21 | 归纳：磁盘上的引擎设法少读页；内存里的设法不丢；并发靠锁、旧版本或单线程；大多数引擎先记一笔、出事照着记录恢复 | S01（各集的锁、多版本、日志）；C01 | — | — | 已核（归纳）；「大多」：InnoDB、PostgreSQL、SQLite、MongoDB、Redis（开了 AOF）有日志，MyISAM、ClickHouse 没有预写日志 |
| z22–z24 | 第一集开头：「一条查询，一行结果，零点零零七秒」「这一瞬间，数据库在磁盘上做了什么」 | S05 | — | MyISAM 一集 | 已核（转录原文） |

## 编号的事实

### 键空间与对象

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| K02 | 值的类型有字符串、列表、集合、有序集合、哈希、流等 | `object.h` / `server.h:917–938`：`OBJ_STRING 0`、`OBJ_LIST 1`、`OBJ_SET 2`、`OBJ_ZSET 3`、`OBJ_HASH 4`、`OBJ_STREAM 6` | 已核 |
| K03 | 一个库的全部键在一张哈希表（dict）里，单机模式只有一个 dict | `out_03_rehash.txt` 的 `DEBUG HTSTATS 0`：「Hash table 0 stats (main hash table)」；`kvstore.c` | 已核 |
| K04 | 查找与插入：算哈希值，`idx = hash & 表大小掩码` 选桶，桶内沿链比对 | `dict.c:1803–1815` `dictFindLinkForInsert`：`idx = hash & DICTHT_SIZE_MASK(...)` | 已核 |
| K05 | 4096 键、8192 桶时的链长分布：空桶 4977（60.75%），1 个 2476，2 个 612，3 个 114，4 个 11，5 个 2；有键的桶 3215；平均链长 1.27。哈希种子每次启动随机，各次运行分布略不同（另几次运行空桶 60.39%–60.49%，最长链都是 5） | `out_02_load.txt`（写完等 1 秒后，2026-11-24）；`out_03_rehash.txt` | 已核；画面以 `out_02_load.txt` 现存回显为准 |
| K06 | 哈希类型在字段数 ≤ 512 且每个值 ≤ 64 字节时用 listpack，超过就转 hashtable | `redis.conf:2291–2292` `hash-max-listpack-entries 512`、`hash-max-listpack-value 64`；`t_hash.c:358、366` | 已核 |
| L01 | `struct redisObject`：`type:4`、`encoding:5`、`refcount:22`、`iskvobj:1`、`metabits:8`、`lru:24`，加 `void *ptr`，共 16 字节；作为 kvobj 时其后 1 字节 kvBits，再内嵌键名 | `object.h:104–116`、`:122–130`；头注释的布局图「serverObject 16 bytes | kvbits 1 byte | sdshdr5 "mykey" \0」 | 已核 |
| L02 | 字符串值的编码：整数 `int`、44 字节以内 `embstr`、更长 `raw` | `object.c:348` `OBJ_ENCODING_EMBSTR_SIZE_LIMIT 44`；`out_02_load.txt`：`SET n 42` → int，`Alice` → embstr，52 字节 → raw | 已核（注解用） |
| L03 | `DEBUG LISTPACK user:2050`：`{total bytes 27} {num entries 4}`，四项依次 `84|6e|61|6d|65|05|`（name）、`85|41|6c|69|63|65|06|`（Alice）、`83|61|67|65|04|`（age）、`2a|01|`（42） | `out_02_load.txt` 末尾「服务端 stdout」 | 已核 |
| L04 | dump.rdb 里 Alice 那一项：`10`（类型 16 = 哈希 listpack）`09 user:2050`（键名长 9）`1b`（值长 27）+ 27 字节 listpack `1b000000 0400 846e616d6505 85416c69636506 8361676504 2a01 ff` | `out_08_persist.txt`「dump.rdb 里 Alice 那一项」；`rdb.h:71` `RDB_TYPE_HASH_LISTPACK 16` | 已核 |
| L05 | listpack：头 6 字节（32 位总长 + 16 位项数），每项「编码类型 + 数据 + 项长（backlen）」，项长供从尾向头遍历；结尾一个 `0xFF`；`0xxxxxxx` 是 7 位无符号整数，`10xxxxxx` 是 6 位长度的字符串 | `listpack.c:27` `LP_HDR_SIZE 6`、`:76` `LP_EOF 0xFF`；规格 https://github.com/antirez/listpack/blob/master/listpack.md L100–143 | 已核 |

### 扩容（rehash）

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| R01 | 元素数达到桶数（1:1）且允许扩容时，表扩到能放下 元素数+1 的最小 2 的幂；有子进程（写 RDB/AOF 重写）时只在达到 4 倍时才强制扩容 | `dict.c:1714–1727`；`dict.c:34–46`（`dict_force_resize_ratio = 4`）；`dict.c:1791–1797` `_dictNextExp` | 已核 |
| R02 | 实测：4095 个键时 4096 桶；关掉主动 rehash 后写第 4096 个，出现「rehashing target」；再读 100 次，旧表 3895、新表 8192 桶里 201（更早的一次运行：3906 与 190）；再读 4000 次，只剩 8192 桶的一张表、4096 个元素 | `out_03_rehash.txt` | 已核 |
| R03 | 渐进式 rehash：每次查找、插入顺手搬一个桶（`_dictRehashStepIfNeeded`），一步最多看 N×10 个空桶就返回 | `dict.c:397–406` 注释；`dict.c:1803–1812` | 已核 |
| R04 | 主动 rehash：每 100 毫秒用 1 毫秒 CPU 帮主哈希表搬家（缺省开） | `redis.conf:2506–2508`「Active rehashing uses 1 millisecond every 100 milliseconds of CPU time」；`activerehashing yes` | 已核 |
| R05 | 键数等于桶数时，即使没有下一次插入，serverCron 里的定期检查也会触发扩容 | `kvstore.c:661–674` `kvstoreTryResizeDicts` 调 `dictExpandIfNeeded`；`out_02_load.txt` 写完等 1 秒后 8192 桶；不等时一次运行仍是 4096 桶，取决于定期任务有没有跑到 | 已核 |

### 查找

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| Q01 | 单次 `HGETALL user:2050` 服务端 4–6 微秒（5、4、6、6、5）；更早的一次运行是 3–5 微秒 | `out_04_find.txt`，5 次 | 已核；计时每次运行略有不同 |
| Q02 | `redis-benchmark -n 200000 -c 50 HGETALL user:2050`：162,733.94 次/秒，平均 0.160 毫秒，中位数 0.151 毫秒；`cmdstat_hgetall:calls=200000,usec=47635,usec_per_call=0.24`（更早的一次运行 133,690 次/秒、0.35 微秒） | `out_04_find.txt` | 已核 |
| Q03 | 服务端 Lua 脚本 SCAN 全部键、逐个 `HGET name`：找到 `user:2050`，看了 4096 个键，3 次 3590、3670、4155 微秒 | `out_04_find.txt` | 已核 |

### 改

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| U01 | 改前改后 `DEBUG LISTPACK`：总长 27、四项地址相同，第 4 项 `2a|01|` → `2b|01|`；`MEMORY USAGE` 55 → 55；`DEBUG OBJECT` 的 `Value at` 相同 | `out_05_update.txt` | 已核 |

### 并发与事务

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| C01 | 一个 Redis 进程的线程：`redis-server`（主线程）、`bio_aof`、`bio_close_file`、`bio_lazy_free` 各 1 个、`jemalloc_bg_thd` 2 个；`io-threads 1`，`io_threads_active:0` | `out_01_environment.txt`、`out_07_concurrency.txt` | 已核 |
| C02 | 两个连接各 10000 次 `HINCRBY user:2050 visits 1`，结果 20000 | `out_07_concurrency.txt` | 已核 |
| C03 | Carol `DEBUG SLEEP 0.5`；0.10 秒时 Bob 发 `HGET`，0.50 秒拿到回复，等了 0.40 秒 | `out_07_concurrency.txt` | 已核 |
| C04 | 先读后写：两边 `HGET` 都是 42，各自 `HSET 43`，结果 43 | `out_07_concurrency.txt` | 已核 |
| C05 | `MULTI`；`HSET` → QUEUED；Bob `HGET` → 42；`EXEC` → `[0, '43']`；Bob → 43 | `out_07_concurrency.txt` | 已核 |
| C06 | `WATCH`；Carol 改成 43；Alice `MULTI`/`HSET 43`/`EXEC` → 空（None）；重做：`HGET` 43 → `HSET 44` → `EXEC [0]` | `out_07_concurrency.txt` | 已核 |
| C07 | EXEC 里 `HSET age 43` 成功、`HINCRBY name 1` 报「hash value is not an integer」，之后 age 为 43 | `out_07_concurrency.txt` | 已核 |
| C08 | 排队时就报错（参数个数不对）的事务，`EXEC` 回 `EXECABORT`，整个丢弃 | `out_07_concurrency.txt` | 已核（注解用） |
| C09 | `multi.c:127` `execCommand`；`:186` 起逐条执行队列里的命令，出错不回滚 | 源码 | 已核 |

### 持久化

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| P01 | `BGSAVE`：fork 用时 275 微秒（`latest_fork_usec:275`），`rdb_last_cow_size:733184`，日志「Background saving started by pid …」「DB saved on disk」 | `out_08_persist.txt` | 已核 |
| P02 | 4096 个用户的 dump.rdb 347,102 字节，开头 `REDIS0017`（17 是格式版本），随后是 `redis-ver 8.12.0` 等辅助字段 | `out_08_persist.txt`；`rdb.h:21` `RDB_VERSION 17` | 已核 |
| P03 | 缺省保存点 `{3600,1}`、`{300,100}`、`{60,10000}` | `config.c:385–389` `configDefaultSaveParams`；`out_01_environment.txt` | 已核 |
| P05 | AOF 缺省关闭；开了以后数据目录里是 `appendonlydir/`：`appendonly.aof.1.base.rdb`、`appendonly.aof.1.incr.aof`、`appendonly.aof.manifest` | `out_01_environment.txt`；`out_08_persist.txt` | 已核 |
| P06 | incr 文件内容就是 RESP 格式的命令：`*2 $6 SELECT $1 0`，`*4 $4 HSET $9 user:2050 $3 age $2 43`（69 字节）；之后 Dave 的 `HSET`、Alice 的 `DEL` 依次追加 | `out_08_persist.txt`（`cat -A` 与 `xxd`） | 已核 |
| P07 | `appendfsync` 缺省 everysec；三种：no（交给系统）、always（每次写都 fsync，慢、最安全）、everysec（每秒一次，折中） | `redis.conf:1592–1596`、`:1610`；`config.c:4295` | 已核 |
| P08 | 事件循环每轮睡下之前先写 AOF 缓冲（write），再给客户端发回复；everysec 下若上一次后台 fsync 还没完成，写入最多推迟 2 秒 | `server.c:2096–2100`（注释「must be done before handleClientsWithPendingWrites … in case of appendfsync=always」）；`aof.c:1482–1500`、`:1643–1650` | 已核 |
| P09 | `BGREWRITEAOF` 之后：`appendonly.aof.2.base.rdb` 347,101 字节、`appendonly.aof.2.incr.aof` 0 字节，manifest 指向 seq 2 | `out_08_persist.txt` | 已核 |

### 崩溃

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| X01 | 缺省配置：写完 4096 个用户（`rdb_changes_since_last_save:8192`，`rdb_saves:0`）后 `kill -9`，重启 `DBSIZE` 0 | `out_09_crash.txt` 一 | 已核 |
| X02 | `SAVE` 后改 43 再 `kill -9`：重启 4096 个键，age 42，日志「DB loaded from disk」 | `out_09_crash.txt` 二 | 已核 |
| X03 | AOF everysec：改 43 后立刻 `kill -9`，重启 4096 个键、age 43；日志「DB loaded from incr file appendonly.aof.1.incr.aof」 | `out_09_crash.txt` 三 | 已核 |
| X04 | AOF everysec：单连接不停 `INCR`，0.5 秒时 `kill -9`；客户端最后收到 33287，重启后 33287（更早的一次运行：36939 与 36939） | `out_09_crash.txt` 四 | 已核 |
| X05 | `appendfsync always`：改 43 后 `kill -9`，重启 43 | `out_09_crash.txt` 六 | 已核 |
| X06 | everysec 遇到灾难（断电）可能丢 1 秒的数据 | H02 `#how-durable-is-the-append-only-file`：「`appendfsync everysec`: `fsync` every second. … you may lose 1 second of data if there is a disaster.」；`#aof-advantages`：「so you can only lose one second worth of writes」 | 已核（文档；没有实测） |
| X07 | 开着 AOF 写入 4096 个用户后，incr 文件 461,764 字节（RDB 347,102 字节） | `out_09_crash.txt` 五 | 已核 |
| X08 | 把 incr 末尾截掉 5 字节：重启日志「!!! Truncating the AOF appendonly.aof.1.incr.aof at offset 461718 !!!」「loaded anyway because aof-load-truncated is enabled」，4096 个键、age 42 | `out_09_crash.txt` 五；H02 `#what-should-i-do-if-my-aof-gets-truncated` | 已核（第 1 稿删去了这一句，注解可用） |

### 删

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| D01 | `DEL user:2050` → 1；`EXISTS` 0；`DBSIZE` 4095 | `out_06_delete.txt` | 已核 |
| D02 | 主动过期每轮每个库抽 20 个带过期时间的键（`ACTIVE_EXPIRE_CYCLE_KEYS_PER_LOOP 20`），慢周期最多用 25% CPU | `expire.c:96–99` | 已核（注解用） |
| D03 | 见 g7–g8 | `out_06_delete.txt` | 已核 |
| D04 | `maxmemory` 设为当前用量减 4096 字节：`HSET` 报 `OOM command not allowed when used memory > 'maxmemory'.`，读照常；改 `allkeys-lru` 后写入成功，`evicted_keys:464`，`DBSIZE` 3633 | `out_06_delete.txt` | 已核 |

### 文档与历史

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| H01 | Redis 主要把数据放在内存里 | 8.12.0 `README.md:58`「Because Redis keeps data primarily in memory and uses efficient data structures…」；文档 https://redis.io/docs/latest/get-started/ 「Redis is an in-memory data store…」 | 已核 |
| H02 | 持久化文档（RDB 快照、AOF 记录每个写操作并在启动时重放、fork 与写时复制、everysec、两种都用、截断的 AOF） | https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/ ：「RDB persistence performs point-in-time snapshots of your dataset at specified intervals.」「AOF persistence logs every write operation received by the server. These operations can then be replayed again at server startup, reconstructing the original dataset.」「Redis forks. We now have a child and a parent process.」「This method allows Redis to benefit from copy-on-write semantics.」「The general indication you should use both persistence methods…」「…just discarding the last non well formed command in the file.」 | 2026-11-24 读取，已核 |
| H03 | 名字：「Redis is an acronym that stands for REmote DIctionary Server.」 | https://redis.io/docs/latest/develop/get-started/faq/#where-does-the-name-redis-come-from | 已核 |
| H04 | 第一个提交里的 README：「Redis is a database. To be more specific redis is a very simple database implementing a dictionary where keys are associated with values.」 | github.com/redis/redis 提交 `ed9b544e10b84cd43348ddfab7068b610a5df1f7` 的 `doc/README.html` | 已核 |
| H05 | 「Salvatore originally created Redis to scale LLOOGG, a real-time log analysis tool.」 | https://redis.io/docs/latest/develop/get-started/faq/#why-did-salvatore-sanfilippo-start-the-redis-project | 已核 |
| H06 | antirez（Salvatore Sanfilippo）：「Redis itself was a side project of LLOOGG.」 | http://antirez.com/news/86（2015-02-26） | 已核 |
| H07 | github.com/redis/redis 最早的提交：「first commit」，antirez，2009-03-22T09:30:00Z，没有父提交 | GitHub API，提交 `ed9b544e…` | 已核 |
| H08 | 「Redis uses a mostly single threaded design. This means that a single process serves all the client requests, using a technique called multiplexing.」；「…from Redis 2.4 we use threads in Redis in order to perform some slow I/O operations in the background, mainly related to disk I/O, but this does not change the fact that Redis serves all the requests using a single thread.」 | https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/#single-threaded-nature-of-redis | 已核 |
| H09 | 事务文档：「All the commands in a transaction are serialized and executed sequentially. A request sent by another client will never be served in the middle of the execution of a Redis Transaction.」「even when a command fails, all the other commands in the queue are processed」「Redis does not support rollbacks of transactions since supporting rollbacks would have a significant impact on the simplicity and performance of Redis.」「WATCH is used to provide a check-and-set (CAS) behavior」「This form of locking is called optimistic locking.」「If at least one watched key is modified before the EXEC command, the whole transaction aborts…」 | https://redis.io/docs/latest/develop/using-commands/transactions/ | 已核 |
| H10 | 「Redis keys are expired in two ways: a passive way and an active way. A key is passively expired when a client tries to access it and the key is timed out. … periodically, Redis tests a few keys at random amongst the set of keys with an expiration. All the keys that are already expired are deleted from the keyspace.」 | https://redis.io/docs/latest/commands/expire/#how-redis-expires-keys | 已核 |
| H11 | DB-Engines 键值数据库排行（2026 年 11 月，73 个系统）：Redis 第 1，163.29 分 | https://db-engines.com/en/ranking/key-value+store | 2026-11-24 读取，已核（只作注解） |
| H12 | 「`noeviction`: Keys are not evicted but the server will return an error when you try to execute commands that cache new data.」「`allkeys-lru`: Evict the least recently used (LRU) keys.」「Set `maxmemory` to zero … This is the default behavior for 64-bit systems」；缺省策略 noeviction 见 `redis.conf:1297–1299` | https://redis.io/docs/latest/develop/reference/eviction/ | 已核 |
| H13 | 许可：Redis 8 起三选一（RSALv2、SSPLv1、AGPLv3）；7.2 及以前是 BSD 3-Clause；7.4 起改为 RSALv2/SSPLv1（2024-03-20 公告）；AGPLv3 自 Redis 8（2025-05-01）加入 | 8.12.0 `LICENSE.txt:1–6`；https://redis.io/blog/redis-adopts-dual-source-available-licensing/ ；https://redis.io/blog/agplv3/ ；antirez https://antirez.com/news/151 | 已核（注解用） |
| H14 | antirez 2020-06-30 卸任维护者（「The end of the Redis adventure」），2024 年 11 月决定回到 Redis，2024-12-10 发文「From where I left」 | https://antirez.com/news/133 、https://antirez.com/news/144 ；Redis 官方博客 AGPL 一文 | 已核（没有进入第 1 稿） |

### 转录自前几集

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| S01 | 前六集的五问答案：MyISAM 一个数据文件、B 树索引存行位置、原地覆盖与空位链、表锁、无日志只能检查修复；InnoDB 表即主键 B+ 树、undo 旧版本、purge、行锁、redo 重做 + undo 撤销；PostgreSQL 堆表、写新版本记 xmax、VACUUM、快照、WAL 重放；SQLite 一个文件、表 B+ 树索引 B 树、回滚日志与 WAL、锁整个文件；ClickHouse 按列存进不可变片段、改是重写那一列、删是加删除标记、查询拿片段快照、临时目录改名；MongoDB 文档编成 BSON 进集合树、内存挂新版本、快照与写冲突、检查点加日志重放 | 各集 `src/js/script.js` 的「五个问题」一章与对应 FACTS（MyISAM「03」「06」「08」「09」；InnoDB M1、T1、M14、M8、X5、M12、R3；PostgreSQL T2、T7、U1、D4、X3、W1；SQLite A03、S09、J05、K01、E05；ClickHouse P01、C02、U01、D01、B04、R03；MongoDB A04、B05、D01、G04、H02） | 已核（转录，2026-11-24） |
| S02 | MongoDB 一集：NoSQL 有一类叫键值数据库，「这个系列的最后还会遇到」 | MongoDB `script.js` n29、j8–j14 | 已核 |
| S03 | MongoDB 一集：Alice 的 BSON 47 字节，13 字节是字段名 | MongoDB FACTS A03、A04 | 已核 |
| S04 | InnoDB 一集：崩溃后从检查点重放 redo | InnoDB FACTS M12、R3 | 已核 |
| S05 | MyISAM 一集开场 h1「一条查询，一行结果，零点零零七秒」、h2「这一瞬间，数据库在磁盘上做了什么」（在 MySQL 9.7.4 上实测 `1 row in set (0.007 sec)`） | MyISAM `script.js` h1、h2；MyISAM FACTS「开场」 | 已核；MyISAM 一集用的是 8 行小表（alice 30 岁）与十万行表，不是 2050 号 Alice，终章不说「每一集都是 2050 号」 |
| S06 | ClickHouse 一集：一亿个用户，平均年龄只读 `age.bin`；改 Alice 一个字节要重写这个片段的整列 | ClickHouse FACTS O01、O02、U01 | 已核 |

## 取证中发现、没有进入成片的事实

| 编号 | 事实 | 依据 |
|---|---|---|
| N01 | 写入 4096 个键后 dict 恰在 1:1，定期任务会把它扩到 8192（R05）；不等的话 `DEBUG HTSTATS` 可能仍是 4096 桶（早先一次运行如此，`02_load.sh` 因此在写完后等 1 秒） | R05 |
| N02 | `CONFIG SET appendonly yes` 会先把现有数据整份写成 base 文件（347,102 字节），incr 从 0 开始 | `out_08_persist.txt` |
| N03 | 8.10 起的「compact hashes」（hash 模板）：字段名相同的哈希可共享一份字段名，`hash-min-template-entries` 缺省 0（关闭） | `redis.conf:2294–2319`；8.10 发布说明 L76「Compact hashes - a new hash encoding that reduces memory usage by storing hash field names just once for keys that share a schema」 |
| N04 | Redis 8 的发行包附带查询引擎等模块（FT.SEARCH 可建二级索引）；本片的实验只用核心服务端，没有编译模块 | `00-RELEASENOTES`（FT.HYBRID 等条目）；`modules/` |
| N05 | 主动过期：文档写「超过 25% 过期就再采样一轮」，8.12.0 源码常量 `ACTIVE_EXPIRE_CYCLE_ACCEPTABLE_STALE 10`；口径不一，旁白不讲比例 | H10 所引延迟文档；`expire.c:99` |
| N06 | Redis 8.12 的主要变化（压缩位图、有序集合的 B+ 树编码 `OBJ_ENCODING_BTREE` 等）与本片无关 | `00-RELEASENOTES:16–40`；`object.h:81` |

## 复核

未做（文案未定稿）。
