# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。做法见仓库 `docs/guides/research.md`。待核实的内容不能进入定稿。

取证日期：2026-11-16。对象：MongoDB 9.0.8 Community（官方 ubuntu2404 构建）与它自带的存储引擎 WiredTiger（MongoDB 源码 `src/third_party/wiredtiger/import.data` 记为 wiredtiger/wiredtiger 分支 mongodb-9.0 的提交 `0e87e9f8`）。取证者：Claude Opus 5.5（本会话同时担任准备方与制作方）。

实验脚本与完整回显在 `research/lab/`，`bash run_all.sh` 依次重做（02 与 03 必须连着跑）。每次重做时 ObjectId、ident 文件名、校验和与时间戳都会变；页的形状、偏移、文档大小、RecordId 与计数不变（2026-11-16 两次完整重做一致，例外见 H06）。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| 系统 | WSL2 里的 Ubuntu 24.04.4 LTS，x86-64，24 线程、约 19 GB 内存 | 本机；`out_01_environment.txt` 第一段 |
| mongod | 9.0.8 Community，`mongodb-linux-x86_64-ubuntu2404-9.0.8.tgz`，SHA-256 `834da9b0…26a`，与官方 `https://downloads.mongodb.org/current.json` 所列一致；该清单标 9.0.8 为正式版，日期 11/05/2026 | `01_environment.sh`；不入库 |
| mongosh | 2.14.2，`mongosh-2.14.2-linux-x64.tgz`，SHA-256 `1523e16d…e53` | 同上 |
| MongoDB 源码 | `github.com/mongodb/mongo` 标签 `r9.0.8`，稀疏检出存储引擎相关目录，提交 `ace0d09a96a9186dbcdc4570a66fc702666aae65` | 放在实验目录 `src/`，不入库 |
| WiredTiger 源码 | `github.com/wiredtiger/wiredtiger` 提交 `0e87e9f8b7baffe01b2c027ab03983c112e112c7`（2026-10-07）。`src/` 目录与 MongoDB 自带的副本逐文件相同，只多一个 CMakeLists.txt | `01_environment.sh` 的 diff 一段 |
| `wt` 命令行工具 | 由上面的提交编译，带内置 snappy、开诊断模式（`verify -d dump_pages` 需要）。`wt -V` 打印 `WiredTiger 12.0.0: (November 15, 2024)`，这是源码里没有更新的版本串，以提交号为准 | 同上 |
| 数据 | 4096 个用户，按注册顺序写入；Alice 是第 2050 个、42 岁；其他人姓名为 50 字节演示串 `UserNNNNN-abc…MN`，年龄 18 + i % 63（与本系列各集同一规则）。文档不写 `_id`，由驱动生成 ObjectId | `lab_common.sh` 的 `LOAD_JS` |

回显里的路径都是相对实验目录的（`db/`、`wtcopy/`），没有个人目录；端口为本机回环 27917。wt 只在数据目录的副本上运行（它打开数据库时会做恢复与检查点）。

## 对象与解释路径

mongod 是服务端进程，收到的查询本身也是一份文档（`{ name: "Alice" }`），不经过 SQL（C07）。它把每份文档编码成 BSON（A01–A04），交给存储引擎 WiredTiger。WiredTiger 不认识文档，只管「键 → 字节」的表，每张表是数据目录里的一个 `.wt` 文件、一棵 B 树（B01–B04）：

- 集合 `users` 一个文件：键是 RecordId（存储引擎按写入顺序发的 64 位整数，Alice 是 2050），值是整份 BSON（A05、B05）。
- `_id` 索引一个文件：键是 ObjectId，值里放 RecordId（B07）。
- 姓名索引一个文件：键是姓名加上 RecordId，值是空的（B06）。

索引建好之后，一次插入在同一个事务里写这三棵树（H04，Dave 那一笔）；实验里 4096 份文档是先写进集合、再建姓名索引的，姓名索引的项是建索引时整批写入的（B09）。写入先落在缓存里的内存页上，检查点才把页整理成磁盘格式、压缩后写进文件（A07、A08、B08）。按姓名找 Alice：姓名索引给出 RecordId 2050，再按 2050 在集合树里走到第 2 个叶页（C01–C05）。改年龄：内存里在这一项的更新链上挂新版本（D01）；检查点把整个叶页写到文件里的新位置，旧位置不覆盖，空出来留给以后（D03–D06）。删除挂一个删除标记，检查点后这一项不再写出（F01–F03）；Dave 拿到 4097，写进的页正好用上 Alice 那一页空出来的位置（F04–F06）。并发：读者拿快照，看更新链上对它可见的版本（G01–G03）；两个事务改同一份文档，后一个立刻得到写冲突（G04）；不在事务里的写由服务端自己重试（G05）。出错：检查点之间的修改都记进日志，崩溃后从最后一个检查点起重放；缺省写法确认之后、日志落盘之前的那一小段可能丢（H01–H07）。

尚未弄清、没有进入文案的：内存里一个叶页拆成几页的精确时机（实验只看到检查点之后的结果）；历史存储在本实验里是否实际写入过旧版本（没有测，文案只按文档讲它的作用，G03）。

## 逐章

### 背景（开场、第 01 章）

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、截至日期 | 核查 |
|---|---|---|---|---|---|
| I01 | 存储引擎是数据库里负责数据在内存与磁盘上怎样存放的部件 | MongoDB 9.0 文档 Storage Engines：“The storage engine is the component of the database that is responsible for managing how data is stored, both in memory and on disk.” https://www.mongodb.com/docs/manual/core/storage-engines/ | 源码：`src/mongo/db/storage/` 是一层接口，WiredTiger 实现在 `storage/wiredtiger/` | 9.0 文档，2026-11-16 取 | 已核 |
| I02 | WiredTiger 是 MongoDB 的缺省存储引擎 | 同上：“WiredTiger is the default storage engine and is recommended for new deployments.” | 02 回显：没有指定引擎，数据目录里是 `WiredTiger*` 与 `.wt` 文件；日志里 `wiredtiger_open` 一行 | 9.0 | 已核 |
| I03 | 2014 年 12 月 16 日，MongoDB 宣布收购 WiredTiger 公司；联合创始人 Keith Bostic 与 Michael Cahill 曾是 Berkeley DB 的架构者 | MongoDB 新闻稿 https://www.mongodb.com/company/newsroom/press-releases/wired-tiger：“MongoDB today announced the acquisition of WiredTiger Inc.”“co-founders Keith Bostic (also a founder of Sleepycat Software), Dr. Michael Cahill”“were architects of Berkeley DB” | 单一出处（公司自己的新闻稿，属一手） | 2014-12-16 | 已核；具体哪个版本起成为缺省**待核实**，不进文案 |
| I04 | MongoDB 文档里，一条记录是一份文档：由字段与值组成 | MongoDB 9.0「What is MongoDB?」：“A record in MongoDB is a document, which is a data structure composed of field and value pairs.” | 02 回显 Alice 的文档 | 9.0 | 已核 |

### 增：Alice 注册（第 02 章）

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、截至日期 | 核查 |
|---|---|---|---|---|---|
| A01 | 文档里没写 `_id` 时，由驱动生成一个 ObjectId 当 `_id`；Alice 的文档是 `{ _id: ObjectId(…), name: 'Alice', age: 42 }` | 02「Alice 的文档」：`findOne` 回显 | 03 集合树里 Alice 那一项的 BSON 以 `07 5f696400` + 12 字节开头 | 本实验 | 已核 |
| A02 | 三个字段的类型：`_id` 是 objectId，`name` 是 string，`age` 是 int（32 位整数） | 02 `$type` 回显 `[ { _id: 'objectId', name: 'string', age: 'int' } ]` | 03 字节：类型字节 07、02、10 | 本实验 | 已核 |
| A03 | Alice 的文档编码成 BSON 共 47 字节；其他用户（姓名 50 字节）每份 92 字节 | 02 `bsonsize` 回显 47、92 | 03 集合树里 Alice 的值以 `2f000000`（47）开头；第 2049 项以 `5c000000`（92）开头 | 本实验 | 已核 |
| A04 | 47 字节逐段：4 字节总长；`_id`：类型 1 + 字段名 `_id\0` 4 + 12 字节 ObjectId；`name`：类型 1 + `name\0` 5 + 长度 4 + `Alice\0` 6；`age`：类型 1 + `age\0` 4 + 4 字节 42（`2a000000`）；末尾 1 个 0。字段名本身占 13 字节，随每一份文档存一遍 | 03 集合树 Alice 那一项的值 `2f000000 07 5f696400 6afa…81 02 6e616d6500 06000000 416c69636500 10 61676500 2a000000 00` | BSON 规范 1.1 https://bsonspec.org/spec.html：`document ::= int32 e_list unsigned_byte(0)`；`signed_byte(7) e_name (byte*12)`；`signed_byte(2) e_name string`；`signed_byte(16) e_name int32`；`e_name ::= cstring` | 本实验；规范 1.1 | 已核 |
| A05 | 存储引擎给每份文档一个内部编号 RecordId：4096 份按写入顺序为 1…4096，Alice 是 2050 | 02 `showRecordId` 回显：第一份 `Long('1')`，Alice `Long('2050')`，最后一份 `Long('4096')` | 源码 `wiredtiger_record_store.cpp:815–826`：没有给定 RecordId 时 `_reserveIdBlock` 预留一段，`record.id = RecordId(nextId++)`；`:1219` 起点是表里最大的键加 1 | 9.0.8 | 已核 |
| A06 | 集合与每个索引各对应数据目录里的一个 `.wt` 文件，文件名是 `collection-<uuid>.wt`、`index-<uuid>.wt`；`users` 一个集合文件、两个索引文件（`_id_` 与 `name_1`）。`_id` 索引是建集合时自带的 | 02「集合与索引各对应」：`stats().wiredTiger.uri` 与 `indexDetails`；`ls db` | 04 `getIndexes()` 只建了 `name_1`，却列出 `_id_` 与 `name_1` | 本实验 | 已核 |
| A07 | 刚写完 4096 份、检查点之前：集合文件只有 4096 字节；集合在缓存里约 835,550 字节 | 02「写入之后、检查点之前」回显 `{ '集合在缓存里的字节': 835550, '集合文件的字节': 4096 }`，`ls -l` 4096 | WiredTiger 文档 arch-cache：“Updates modify data in the cache and are flushed to storage asynchronously, either by Checkpoint or Eviction.” | 本实验 | 已核 |
| A08 | 正常关闭（做一次检查点）之后，集合文件变成 98,304 字节 | 02「等一次检查点」`ls -l` 98304 | 03 dump_address：最后一块到 90112，加文件尾部的区段表 | 本实验 | 已核 |
| A09 | 集合文件用 snappy 块压缩，叶页上限 32 KB、内部页上限 4 KB；索引文件不做块压缩，用前缀压缩，页上限 16 KB | 02 `creationString`：集合 `block_compressor=snappy … internal_page_max=4KB … leaf_page_max=32KB … prefix_compression=false`；姓名索引 `block_compressor=, … leaf_page_max=16k … prefix_compression=true` | MongoDB 文档 WiredTiger：“By default, WiredTiger uses block compression with the snappy compression library for most collections and prefix compression for all indexes.” | 9.0.8 | 已核 |
| A10 | 内存页与磁盘页是两种格式：缓存里的页为并发访问而组织，存储里的页为省空间而组织，读写时要互相转换；脏页写出之前要先「协调」（reconcile）成磁盘格式 | WiredTiger 源码文档 `src/docs/arch-cache.dox`：“The page layout in the WiredTiger cache is optimized for fast, concurrent access … WiredTiger organizes pages in storage to minimize storage space … has to convert between the in-memory and on-storage representations”；“To remove a dirty page, WiredTiger must first reconcile the page (converting it from in-memory format to on-disk format)” | 03：叶页解压后 118,705 字节，在文件里占 24,576 字节 | 提交 0e87e9f8 | 已核 |
| A12 | 同一个集合里的文档可以各有各的字段，事先不用声明：`people` 里三份文档，一份有 age，一份有 email 与数组 tags，一份有嵌套的 address；集合的选项是空的（没有校验规则） | 09 回显 | I04 | 9.0.8 | 已核 |
| A11 | mongod 打开 WiredTiger 的缓存大小：本机 9414 MB；缺省是 (内存 − 1 GB) 的一半与 0.256 GB 中较大的那个 | 02 日志 `cache_size=9414M`；MongoDB 文档 WiredTiger「Memory Use」 | 本机约 19.4 GB 内存，(19.4−1)/2 ≈ 9.2 GB，与 9414 MB 相符 | 本机 | 已核；只作画面注解 |

### 整体结构：三棵树（第 02、03 章）

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本 | 核查 |
|---|---|---|---|---|---|
| B01 | WiredTiger 的每张表是一棵 B 树：根页与内部页只放键和指向其他页的引用，叶页放键和值；键排好序，页满了就分裂 | `src/docs/arch-btree.dox`：“The root and internal pages only store keys and references to other pages, while leaf pages store keys and values … Records are maintained in sorted order according to their key, and pages will split once their configured limit is reached” | 03 三棵树的 dump_tree_shape | 0e87e9f8 | 已核 |
| B02 | WiredTiger 是不覆盖写的引擎：块被改写时写到文件里的新位置 | `src/docs/arch-block.dox`：“WiredTiger is a no-overwrite storage engine, and when blocks are re-written, they are written to new locations in the file.” | D03 实测 | 0e87e9f8 | 已核 |
| B03 | 集合树（检查点之后）：根页 1 个，下面 4 个叶页，分别是 RecordId 1–1224、1225–2448、2449–3123、3124–4096（1224、1224、675、973 份）；根页的分界键是 1225、2449、3124 | 03「集合 users：各页的键」与 dump_tree_shape | dump_address：根页在偏移 86016，4 个叶页在 4096、28672、53248、65536 | 本实验 | 已核 |
| B04 | 集合树的 4 个叶页在文件里分别占 24,576、24,576、12,288、20,480 字节；第 1 个叶页解压后 118,705 字节 | 03 dump_address 的 `[0: 4096-28672, 24576, …]` 等；dump_pages「磁盘映像解压后 118705 字节」 | — | 本实验 | 已核；块大小是 4 KB 的整数倍（allocation_size=4KB） |
| B05 | Alice 在集合树的第 2 个叶页（1225–2448）：键是 RecordId 2050，值是她整份 47 字节的 BSON | 03「集合 users：Alice 那一项」：键 `c7c2`（WiredTiger 的整数打包），值 `2f000000…` | B03 的分界键 1225 ≤ 2050 < 2449 | 本实验 | 已核 |
| B06 | 姓名索引树：根页 1 个，下面 15 个叶页（前 14 页各约 290 项，最后一页 44 项）；每一项的键是姓名加 RecordId，值是空的。Alice 排在第一项（大写 A 排在 U 前面），她的键是 `3c 416c696365 00 04 204011`，末尾 3 字节就是 RecordId 2050 | 03 姓名索引 dump_tree_shape 与「Alice 那一项」 | 源码 `wiredtiger_index.cpp:250–265`：非唯一索引的键是 `getKeyAndRecordIdView()`，值是类型位 `getTypeBitsView()` | 9.0.8 | 已核；「204011 即 2050」由 02 的 RecordId 与 _id 索引的值相同印证 |
| B07 | `_id` 索引树：根页 1 个，下面 3 个叶页（入库的 03 回显为 1755、913、1428 项；ObjectId 每次重做都不同，各叶页的项数随之变化，只有「根页 + 3 个叶页」稳定，画面数字以当次回显为准；2026-11-17 订正，原记 1772、921、1403 是另一次重做的值）；键是 ObjectId，值里是 RecordId（Alice 那一项的值 `204011`，与姓名索引末尾相同） | 03 `_id` 索引 dump_tree_shape 与「Alice 那一项」 | 源码 `wiredtiger_index.cpp:256–259`：`_id` 索引的键是 `getKeyView()`，值是 `getRecordIdAndTypeBitsView()` | 9.0.8 | 已核 |
| B08 | 检查点之后，三个文件的大小：集合 98,304 字节，`_id` 索引 57,344 字节，姓名索引 249,856 字节 | 02「等一次检查点」`ls -l`（ident 对应见 02「集合与索引」） | 03 dump_address 的最后一块 | 本实验 | 已核；姓名索引在建索引时就已整批写入文件 |

### 查：找 Alice（第 03 章）

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本 | 核查 |
|---|---|---|---|---|---|
| C01 | 没有姓名索引时，`find({ name: "Alice" })` 是集合扫描（COLLSCAN），看过 4096 份文档，返回 1 份 | 04 explain：`{ '计划': 'COLLSCAN', '返回': 1, '看过的索引键': 0, '看过的文档': 4096 }` | — | 9.0.8 | 已核 |
| C02 | 建了姓名索引后：计划是 IXSCAN → FETCH，看过 1 个索引键、1 份文档；索引范围 `["Alice", "Alice"]` | 04 explain：`'FETCH ← IXSCAN'`，1、1；winningPlan 的 `indexBounds` | 05、06 操作记录的 `planSummary: 'IXSCAN { name: 1 }'`、keysExamined 1 | 9.0.8 | 已核 |
| C03 | 按 `_id` 找也是 1 个索引键、1 份文档 | 04「按 _id 找」：`{ '看过的索引键': 1, '看过的文档': 1, '阶段': 'EXPRESS_IXSCAN' }` | — | 9.0.8 | 已核 |
| C04 | 按年龄找 42 岁：age 没有索引，看过 4096 份，返回 66 份 | 04「按年龄找」 | 年龄规则 18 + i % 63 | 本实验 | 已核 |
| C05 | 查找从根页开始，逐层往下；不在内存里的页才从文件读进缓存（解压、建查找用的结构） | `arch-cache.dox`：“To lookup an entry in a Btree, WiredTiger starts from the root page and searches the Btree until finds the entry. If WiredTiger encounters a page that is not in memory, it loads that page from storage” | — | 0e87e9f8 | 已核 |
| C06 | 索引里的键可以直接按字节比较：Alice 的键 `3c 41…`，其他人 `3c 55…`（`41` 是 A，`55` 是 U），所以 Alice 排第一 | 03 姓名索引的前 4 项 | 索引的 key_format=u（字节串） | 本实验 | 已核；不在文案里讲 KeyString 这个名字 |
| C07 | 查询本身也是一份文档：mongosh 的 `find()` 发给服务端的是 `find` 命令，条件写成 `{ name: "Alice" }` | 04 最后一段 `db.runCommand({ find: "users", filter: { name: "Alice" } })` 返回同一份文档 | — | 9.0.8 | 已核 |

### 改：Alice 过生日（第 04 章）

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本 | 核查 |
|---|---|---|---|---|---|
| D01 | 内存里修改不覆盖页上的原值：叶页上的一项被修改时，新值放在一个 `WT_UPDATE` 结构里；同一项改了不止一次，这些结构连成链；读者按自己的时间点决定看哪个版本 | `src/include/btmem.h:1496–1505` 的 WT_UPDATE 注释；`arch-btree.dox`：“Existing entries on leaf pages can be updated, modified or deleted through WT_UPDATE structures … chained into an update list … may be visible depending on the timestamp used by a reader” | G01 实测快照读到旧值 | 0e87e9f8 | 已核 |
| D02 | 这次修改只碰了集合树：查 1 个索引键、1 份文档，新增与删除的索引键都是 0；RecordId 仍是 2050 | 05 操作记录 `keysExamined: 1, docsExamined: 1, keysInserted: 0, keysDeleted: 0`；`showRecordId` 仍是 2050 | — | 9.0.8 | 已核 |
| D03 | 修改后、检查点之前，集合文件大小不变（98,304 字节），缓存里有约 15 万字节脏数据 | 05「改完、检查点之前」`ls -l` 98304；`tracked dirty bytes in the cache` 149958 | — | 本实验 | 已核 |
| D04 | 检查点之后：Alice 所在的第 2 个叶页从偏移 28672 换到文件末尾的 98304（同样 24,576 字节），根页从 86016 换到 122880；另外三个叶页位置不变；文件从 98,304 变成 135,168 字节 | 05 前后两次 dump_address | B02 不覆盖写 | 本实验 | 已核 |
| D05 | 检查点之后，集合文件里有 36,864 字节空着、可以复用 | 05 `file bytes available for reuse` 36864 | 06 同一时刻也是 36864 | 本实验 | 已核；包括旧的第 2 个叶页与旧根页等 |
| D06 | 写新检查点期间，上一个检查点仍然有效；即使写到一半 MongoDB 中断，重启时也能从上一个有效的检查点恢复 | MongoDB 文档 WiredTiger「Snapshots and Checkpoints」：“During the write of a new checkpoint, the previous checkpoint is still valid. Even if MongoDB terminates or encounters an error while writing a new checkpoint, MongoDB can recover from the last valid checkpoint on restart.” | B02 | 9.0 文档 | 已核 |
| D07 | 检查点里 Alice 那一项是整份新文档：最后的年龄字节由 `2a`（42）变成 `2b`（43） | 05「检查点里 Alice 那一项」 | — | 本实验 | 已核 |

### 删：Alice 注销，Dave 注册（第 05 章）

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本 | 核查 |
|---|---|---|---|---|---|
| F01 | 删除 Alice 碰了三棵树：集合里删 1 份文档，两个索引各删 1 个键（keysDeleted 2）；剩 4095 份 | 06 操作记录 `ndeleted: 1, keysDeleted: 2`；`countDocuments()` 4095 | — | 9.0.8 | 已核 |
| F02 | 内存里，删除也是挂在更新链上的一个版本：类型是删除标记（tombstone） | `btmem.h:1558` `#define WT_UPDATE_TOMBSTONE 4 /* deleted */`；`arch-btree.dox`（“updated, modified or deleted through WT_UPDATE structures”） | — | 0e87e9f8 | 已核 |
| F03 | 检查点之后，集合树里键 2049、2051 还在，2050 没有了；第 2 个叶页又一次写到新位置 | 06「检查点之后」：`c7c1`、`c7c3` 在，`c7c2` 不在；dump_address | — | 本实验 | 已核 |
| F04 | Dave 注册拿到的 RecordId 是 4097，不是 Alice 空出来的 2050：编号只往上加，不回收 | 06 `showRecordId` 4097 | A05 源码 `_nextIdNum.fetchAndAdd` | 9.0.8 | 已核 |
| F05 | Dave 写进最后一个叶页（3124 起）；检查点时这一页写到偏移 28672–49152，正是 Alice 那一页原来的位置 | 06「Dave 写进去之后」dump_address：`[0: 28672-49152, 20480, …]`；删除前第 2 个叶页在 `[0: 28672-53248 …]` | — | 本实验 | 已核；用上的是旧页空出的块，不是 Alice 那一项的位置 |
| F06 | 文件大小：删除后 135,168 字节；Dave 写入后 122,880 字节；之后仍有 24,576 字节空着可复用；`compact` 命令这次没有释放任何字节（bytesFreed 0）；文件不会因为删了一份文档就变小 | 06 `ls -l` 与 `file bytes available for reuse`；`compact` 回显 `{ bytesFreed: 0, ok: 1 }` | — | 本实验 | 已核 |

### 事务与并发：Bob 与 Carol（第 06 章）

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本 | 核查 |
|---|---|---|---|---|---|
| G00 | 单机运行的 mongod 不接受事务：服务端回 `Transaction numbers are only allowed on a replica set member or mongos`；本章实验因此用单节点副本集 | 08 第一段回显（用 `runCommand` 直接发带事务号的 insert） | 08 之后各段在 `--replSet rs0` 上成功 | 9.0.8 | 已核；画面注解写「实验：单节点副本集」 |
| G00b | 副本集是一组维护同一份数据的 mongod 进程；多文档事务对副本集可用 | MongoDB 文档 Replication：“A replica set in MongoDB is a group of mongod processes that maintain the same data set.”“Multi-document transactions are available for replica sets.” https://www.mongodb.com/docs/manual/replication/ | G00 实测 | 9.0 | 已核 |
| G07 | 快照：快照隔离级别的事务开始时建一个快照，整个事务期间沿用，只读事务开始之前的版本；快照的实现是记下建快照那一刻系统里各事务的状态 | `src/docs/arch-snapshot.dox`：“A snapshot is created at the beginning of a snapshot-level isolated transaction and is sustained throughout the entire life cycle of the transaction … will only read versions of records before the transaction started”“Snapshots are implemented by capturing the global state of transactions in the system at the time of snapshot creation” | G01 | 0e87e9f8 | 已核 |
| G01 | Bob 开一个快照读的事务，读到 Alice 42 岁；Alice 改成 43 并提交；Bob 在同一个事务里再读仍是 42；事务外此刻读到 43；Bob 结束事务后再读是 43 | 08 第一段回显 | MongoDB 文档 WiredTiger：“WiredTiger uses MultiVersion Concurrency Control (MVCC). At the start of an operation, WiredTiger provides a point-in-time snapshot of the data to the operation.” | 9.0.8 | 已核 |
| G02 | 写操作是文档级的并发控制：多个客户端可以同时改同一集合里的不同文档 | MongoDB 文档 WiredTiger：“WiredTiger uses document-level concurrency control for write operations. As a result, multiple clients can modify different documents of a collection at the same time.” | 05 操作记录：全局、库、集合三级都只拿了 `w`（意向写锁） | 9.0 | 已核 |
| G02b | 锁模式里小写 `w` 是意向写锁（IX）；WiredTiger 在全局、库、集合三级只用意向锁 | MongoDB FAQ Concurrency 的锁模式表（“`w` Represents Intent Exclusive (IX) lock”）与 “WiredTiger uses only intent locks at the global, database and collection levels.” | 05 `locks: { Global: { acquireCount: { w: 1 } }, Database: …, Collection: … }` | 9.0 | 已核 |
| G03 | 历史存储（`WiredTigerHS.wt`）存放还有旧读者需要的旧版本：写回用户表的只有每个键最新的一个版本，更旧的写进历史存储；所有用户表共用一个历史存储表 | `src/docs/arch-hs.dox`：“only the newest update to a key is written to the user table while the older updates for the key are written to the history store. All user tables in the database are backed by a single history store table.”；`arch-eviction.dox`：“the latest value goes to the data store and older values go to the history store” | 02 `ls db`：`WiredTigerHS.wt` | 0e87e9f8 | 已核（机制）；本实验未测历史存储里的实际内容 |
| G04 | Alice 在事务里改了年龄还没提交，Carol 在另一个事务里改同一份文档，立刻得到 `WriteConflict` 错误，标签 `TransientTransactionError`；Alice 提交后（44），Carol 把整个事务重做一遍成功（45） | 08 第二段回显 | WiredTiger `src/include/txn_inline.h:2340–2343`：发现冲突时 `ret = WT_ROLLBACK` 并记 `WT_WRITE_CONFLICT`；MongoDB `wiredtiger_error_util.cpp` 把 WT_ROLLBACK 转成 `throwWriteConflictException` | 9.0.8 | 已核 |
| G05 | Alice 的事务没提交时，Carol 不用事务直接改：没有报错，服务端自己重试，约 1 秒后（Alice 的事务在 1.5 秒时提交，Carol 晚 0.4 秒开始）改成功；操作记录里 writeConflicts 一百二十多次 | 08 第三段回显：`'Carol 修改了': 1, '等了约（毫秒）': 1100`；`writeConflicts: Long('123')`（同日另几次重做为 1000–1100 毫秒、120–124 次） | MongoDB 文档 FAQ Concurrency：“When the storage engine detects conflicts between two operations, one will incur a write conflict causing MongoDB to transparently retry that operation.” | 9.0.8 | 已核；重试次数随机器与时机变化，只作画面数字 |
| G06 | WiredTiger 对多数读写用乐观并发控制 | MongoDB 文档 FAQ Concurrency：“For most read and write operations, WiredTiger uses optimistic concurrency control.” | — | 9.0 | 已核 |

### 出错怎么办：强制结束之后（第 07 章）

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本 | 核查 |
|---|---|---|---|---|---|
| H01 | 缺省每 60 秒一个检查点（syncdelay 60），日志每 100 毫秒落盘一次（journalCommitInterval 100） | 02、07 `getParameter` 回显 `{ journalCommitInterval: 100, syncdelay: 60 }` | MongoDB 文档 WiredTiger：“MongoDB configures WiredTiger to create checkpoints … at intervals of 60 seconds.” | 9.0.8 | 已核 |
| H02 | WiredTiger 用预写日志（journal）配合检查点：日志记下检查点之间的全部修改；MongoDB 在两个检查点之间退出，就用日志重放上一个检查点以来的修改 | MongoDB 文档 WiredTiger：“The WiredTiger journal persists all data modifications between checkpoints. If MongoDB exits between checkpoints, it uses the journal to replay all data modified since the last checkpoint.” | `arch-logging.dox`：“implements a write-ahead log … so that changes made since the most recent checkpoint are not lost and can be recovered on restart after a crash” | 9.0 | 已核 |
| H03 | 日志文件在 `journal/` 下，`WiredTigerLog.0000000001` 与预先分配的 `WiredTigerPreplog.0000000001` 各 100 MB（104,857,600 字节） | 02 `ls -l db/journal` | `arch-logging.dox` 对三种日志文件名的说明 | 本实验 | 已核 |
| H04 | 崩溃后的日志里，最后一个检查点之后有两笔提交（实验在单机 mongod 上，不带副本集；Alice 那一笔带 `writeConcern: { j: true }`，Dave 那一笔是缺省写法，两笔都回复成功后才 kill -9；2026-11-17 补记写法条件，见 `07_crash.sh` 第 12–15 行）：Alice 改年龄是一次写入，记下的是整份新文档（47 字节，age 43）；Dave 注册是一个事务里的三次写入，分别写进集合文件（RecordId 4097，46 字节）、`_id` 索引与姓名索引 | 07「崩溃后磁盘上的日志」：`row_put 文件号 88 键 c7c2 … 47 字节`；事务 64 三条 `row_put`（文件号 88、96、104） | 集合文件号 88 由 `wt list -v` 核对 | 本实验 | 已核 |
| H05 | 重启时 WiredTiger 从检查点起重放日志：Alice 43 岁、Dave 都在，4097 份 | 07「重启」回显；日志 `recovery was completed successfully` | H02 | 本实验 | 已核 |
| H06 | 每种写法各 5 次、写完立刻强制结束再重启：带 `j: true` 的 5 次全在；缺省写法写完等 0.3 秒再结束的 5 次全在；缺省写法写完立刻结束，两次完整重做分别只留下 0 次、1 次 | 07「重复」回显（入库的这份是 1 次；同日另一次重做是 0 次） | H01 的 100 毫秒；`j: true` 等日志落盘才确认 | 本机，进程被强制结束 | 已核；结果取决于时机，文案只说「可能丢」。2026-11-17：文案按两轮各自的结果如实说「一轮 0 次、一轮 1 次」，结论仍只说「可能丢」。2026-11-18 补：H04、H05 里 Dave 那一笔不带 j，进程被杀后照样回来，说明进程被强制结束时，一笔留不留得下取决于它是否已写进日志文件（交给操作系统），不取决于是否已同步到磁盘；断电时后者才起作用（H07）。旁白据此说「还没写进日志文件的写入」 |
| H08 | 单机、`w: 1` 且不写 `j` 时，写入在内存里完成就确认；`j: true` 要求写进磁盘上的日志才确认，并触发一次立即的日志同步 | MongoDB 文档 Write Concern https://www.mongodb.com/docs/manual/reference/write-concern/ 的确认表（`w: 1`、j 未指定 → “In memory”；`j:true` → “On-disk journal”）与 “A write concern that includes or implies j: true causes an immediate journal synchronization.” | H06 实测 | 9.0 | 已核；本片的崩溃实验是单机 |
| H07 | 这只是进程被强制结束，不是断电或磁盘故障；断电时还要看操作系统缓存，本片不测 | 实验设计 | — | — | 边界 |

## 补充取证（2026-11-17，第 2 稿）

第 2 稿对抗审读时发现几句旁白缺少出处，补在这里。官方文档于 2026-11-17 读取；转录的条目注明来源条目，适用范围照原条目。取证者：Claude Opus 5.5。

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、截至日期 | 核查 |
|---|---|---|---|---|---|
| I05 | MongoDB 把文档存在集合里，集合相当于关系数据库里的表；集合不存在时，第一次往里存数据就自动建出来 | MongoDB 文档 Databases and Collections：“MongoDB stores documents in collections. Collections are analogous to tables in relational databases.”“If a collection does not exist, MongoDB creates the collection when you first store data for that collection.” https://www.mongodb.com/docs/manual/core/databases-and-collections/ | 02 回显：`insertMany` 之前没有建 `users`；A12 `people` 的选项为空 | 9.0 文档 | 已核 |
| I06 | 普通集合里每份文档都要有一个唯一的 `_id` 字段，起主键的作用；插入时省略 `_id`，驱动自动生成 ObjectId；建集合时缺省在 `_id` 上建一个唯一索引 | MongoDB 文档 Documents「The _id Field」：“each document stored in a standard collection requires a unique _id field that acts as a primary key. If an inserted document omits the _id field, the MongoDB driver automatically generates an ObjectId”“By default, MongoDB creates a unique index on the _id field during the creation of a collection.” https://www.mongodb.com/docs/manual/core/document/ | A01、A06；B06、B07 源码：非唯一索引的键带 RecordId，`_id` 索引把 RecordId 放在值里 | 9.0 文档 | 已核 |
| I07 | 事务是原子的：要么全部修改都生效，要么全部回滚；提交之前，事务里的修改在事务外看不到；中止时全部修改丢弃。对单份文档的一次操作本身就是原子的 | MongoDB 文档 Transactions「Transactions and Atomicity」：“Transactions either apply all data changes or roll back the changes.”“Until a transaction commits, the data changes made in the transaction are not visible outside the transaction.”“When a transaction aborts, all data changes made in the transaction are discarded”；开头：“In MongoDB, an operation on a single document is atomic.” https://www.mongodb.com/docs/manual/core/transactions/ | H04：Dave 的一次插入在 WiredTiger 日志里是同一个事务号下的三条写入 | 9.0 文档 | 已核 |
| G08 | 带 `TransientTransactionError` 标签的错误，表示整个事务可以重试（事务里单个写操作不能单独重试）；回调式 API 会自动重试，核心 API 要应用自己写重试 | MongoDB 文档 Transactions in Applications：“If an operation in a transaction returns an error labeled TransientTransactionError, the transaction as a whole can be retried.” https://www.mongodb.com/docs/manual/core/transactions-in-applications/ | G04 实测：Carol 重做整个事务后成功 | 9.0 文档 | 已核 |
| B09 | 本片实验的写入顺序：每个实验先在空库里 `insertMany` 写入 4096 份，再 `createIndex({ name: 1 })`；所以 4096 份写入时姓名索引还不存在，它的项是建索引时整批写进文件的（检查点前已 249,856 字节，B08）。索引建好之后的插入（Dave）才是一次写三棵树（H04） | `lab_common.sh` 的 `load()` | 02 回显的先后；H04 | 本实验 | 已核；05–08 每个实验都重新 `load`，从同一个起点开始（各章画面的偏移与大小取自该章自己的回显） |
| B10 | 每次重做 `load` 后、第一次检查点之后，页的布局相同：集合树第 2 个叶页在偏移 28672，文件 98,304 字节（A08、B03、D04、F05 在不同实验里都从这一布局出发） | 05、06 的第一次 dump_address 与 03 一致 | — | 本实验 | 已核 |
| B11 | 本片实验里的检查点用 `db.adminCommand({ fsync: 1 })` 触发，不是等 60 秒的定时检查点：MongoDB 9.0.8 源码 `wiredtiger_kv_engine.cpp` 的 `flushAllFiles` 以 `Fsync::kCheckpointStableTimestamp`（有日志时）调用 `waitUntilDurable` | 05、06、07 脚本的 fsync 一行；源码 r9.0.8 `src/mongo/db/storage/wiredtiger/wiredtiger_kv_engine.cpp` 的 `flushAllFiles`（2026-11-17 在 GitHub 读取） | 05 回显：fsync 之前文件大小不变（D03），之后叶页换了位置、文件变大（D04） | 9.0.8 | 已核（源码只核到请求检查点的参数；fsync 命令到 flushAllFiles 的调用链未逐行核对）；旁白只说「做一次检查点」 |
| A13 | 集合表的 `key_format=q`（64 位整数，即 RecordId）、`value_format=u`（不解释的字节串）：WiredTiger 把整份 BSON 当作一串字节存放；姓名索引表的 `key_format=u`、`value_format=u` | 02 `creationString` 回显第 146 行（集合）与第 149 行（姓名索引） | C06：索引的 key_format=u；A04：值的字节就是 BSON | 9.0.8 | 已核；旁白 a7、a9「WiredTiger 不认识文档，只当一串字节」的依据 |
| S01 | ClickHouse 按列存放：每一列的值挨在一起存，分析查询只读用到的列；MySQL、PostgreSQL 一类事务型数据库按行存放 | 转录本系列 ClickHouse 一集 `research/FACTS.md` 的 S01（出处为 ClickHouse 文档 What is OLAP? 与 SQLite 一集 FACTS G08、G15） | — | 一般性说法 | 已核（转录）；只用于开场的系列衔接 |
| S04 | 这个系列此前的五个数据库——MySQL 的 MyISAM 与 InnoDB、PostgreSQL、SQLite、ClickHouse——都是 SQL 数据库：用 SQL 语句建表、插入、查询，数据摆成表（行与列） | 转录本系列 ClickHouse 一集 `research/FACTS.md` 的 S04（其出处为各集已核的 FACTS） | — | — | 已核（转录）；只用于开场的系列衔接 |
| V01 | MongoDB 公司 2007 年由 Dwight Merriman、Eliot Horowitz、Kevin Ryan 创立，原名 10gen；三人是广告公司 DoubleClick 的老员工，在那里要每秒服务 40 多万条广告，体会到关系数据库在扩展上的局限；MongoDB 的名字取自「humongous database」 | MongoDB 公司页 https://www.mongodb.com/company ：“Dwight Merriman, Eliot Horowitz, and Kevin Ryan — veterans of the online advertising company Doubleclick … quickly learned the limitations of relational databases when scaling to serve more than 400,000 ads per second … they founded MongoDB (formerly 10gen) in 2007.”；Our Story https://www.mongodb.com/company/our-story ：“launched MongoDB (short for "humongous database") in 2009” | — | 2026-11-17 读取；公司自述，属厂商一手说法 | 已核（单一来源：公司自己的页面） |
| V02 | MongoDB 的第一个版本 2009 年 8 月发布；2015 年初的 3.0 版带来 WiredTiger 存储引擎，提供文档级并发控制与内置压缩；2018 年的 4.0 版提供多文档 ACID 事务 | MongoDB「MongoDB Evolved」版本史 https://www.mongodb.com/resources/products/mongodb-version-history ：“The first version of the MongoDB database shipped in August 2009.”“MongoDB 3.0 with the WiredTiger Storage Engine offers document-level concurrency control and built-in compression”“MongoDB 4.0 offers multi-document ACID transactions” | I03（2014 年底宣布收购 WiredTiger）；G02（文档级并发）；A09（snappy 压缩） | 2026-11-17 读取；版本史页上两节的标题原文为「2015 (Early) — MongoDB 3.0」「2018 — MongoDB 4.0」 | 已核；WiredTiger 从哪个版本起成为默认引擎仍未取到可读的一手出处，旁白只说 3.0 版「带来」它、现在 9.0 默认用它（I02） |
| V03 | NoSQL 的来由（厂商一手说法）：NoSQL 数据库在 2000 年代末出现，当时存储成本大幅下降，数据量与种类增长，有结构的、半结构的、无结构的都有，事先定义表结构几乎做不到；云计算兴起后，开发者想「横向扩展」（scale out）而不是「纵向扩展」（scale up），把数据分布到多台服务器与多个地区；关系数据库主要为纵向扩展设计；NoSQL 数据库为开发效率而优化；MongoDB 与 CouchDB 在 2009 年出现 | MongoDB「What is NoSQL?」https://www.mongodb.com/resources/basics/databases/nosql-explained ：“NoSQL databases emerged in the late 2000s as the cost of storage dramatically decreased.”“NoSQL databases optimized for developer productivity.”“RDBMS is designed for vertical scaling. However, it can extend limited capabilities for horizontal scaling.”（页面另述数据为 “structured, semi-structured, and unstructured”、开发者想 “to scale out instead of scale up”、2009 年 MongoDB 与 CouchDB 出现） | V04（独立来源：同一时期的一批新数据库、为大集群设计） | 2026-11-17 读取；MongoDB 公司的科普页 | 已核（厂商说法）；旁白说成「这一批数据库的说法是……」或只陈述背景，不说成定论 |
| V06 | NoSQL 更早的背景（厂商说法）：2000 年代初，Google 发表了一篇关于 Bigtable 的论文，Bigtable 是一个宽列数据库、分布式存储系统；云计算随后流行起来，开发者开始用公有云托管应用与数据 | MongoDB「What is NoSQL?」：“In the early 2000s, a paper published by Google on BigTable, the wide-column database, explored the wide range of possibilities for a distributed storage system.”“Cloud computing also rose in popularity, and developers began using public clouds to host their applications and data.” | V03 | 2026-11-18 读取 | 已核（厂商说法） |
| F07 | Dave 写入并做完检查点后，根页从文件末尾的 122880 挪到了 65536（原最后一个叶页的位置），Dave 那一页写在 28672–49152；文件末尾不再有在用的块，文件截短到 122,880 字节（120 KB） | 06 回显第 58 行（删除后根页 `[0: 122880-126976 …]`）与第 105 行（Dave 写入后根页 `[0: 65536-69632 …]`）；F06 的文件大小 | F05、F06 | 本实验 | 已核；「截短」是由块位置与文件大小推出的，WiredTiger 截短文件尾部空闲区段的机制本片没有单独取证 |
| V04 | NoSQL 这个名字（独立来源）：2009 年 6 月 11 日，Johan Oskarsson 在旧金山组织了一次非正式聚会，到场介绍的有 Voldemort、Cassandra、Dynomite、HBase、Hypertable、CouchDB、MongoDB；NoSQL 指的是这一批新数据库，它们有些共同特点但没有一条是定义性的：不用关系模型与 SQL、开源、为大集群设计、出于 21 世纪网站的需要、没有固定的表结构（字段可以随意加到任何一条记录上）；很多人说 NoSQL 不是对 SQL 说「不」，而是 Not Only SQL；这个词在 90 年代末曾是 Carlo Strozzi 一个开源关系数据库的名字 | Martin Fowler「NosqlDefinition」https://martinfowler.com/bliki/NosqlDefinition.html ：“The term originally surfaced at an informal meetup on June 11 2009 in San Francisco organized by Johan Oskarsson.”“At the session there were presentations from Voldemort, Cassandra, Dynomite, HBase, Hypertable, CouchDB, and MongoDB.”“NoSQL refers to a particular rush of recent databases.”“Some characteristics are common amongst these databases, but none are definitional.”“Designed to run on large clusters”“No schema, allowing fields to be added to any record without controls”“many advocates of NoSQL say that it does not mean a "no" to SQL, rather it means Not Only SQL.” | N01、V03 | 2026-11-17 读取；作者是《NoSQL Distilled》的合著者，与 MongoDB 公司无关 | 已核 |
| V05 | NoSQL 并不都排斥事务：MongoDB 支持 ACID 事务，也可以配置成多文档 ACID；NoSQL 数据库各有自己的查询语言，MongoDB 的叫 MQL | MongoDB「What is NoSQL?」：“Some NoSQL databases, like MongoDB, do, in fact, support ACID transactions.”“MongoDB has MQL” | I07、V02（4.0 提供多文档 ACID 事务） | 2026-11-17 读取 | 已核 |
| S09 | SQL 是关系数据库的标准查询语言（有 ISO 标准，现行版本 SQL:2023）：数据按表（行与列）组织，用 SQL 语句建表、写入、查询 | 转录本系列 ClickHouse 一集 `research/FACTS.md` 的 S9（其出处为 PostgreSQL 一集 FACTS H7，即 PostgreSQL 18 手册《SQL Conformance》） | S04 | — | 已核（转录）；旁白 o9–o11b「按表组织、用 SQL 来查，这一类叫关系数据库；前面五期都是」的依据。ClickHouse 按列存放，但数据仍是用 SQL 建的表（S01、S04），旁白按「表 + SQL」把五者统称为关系数据库，这是策划者 2026-11-17 要求的说法（「前面五期都是SQL关系数据库」）；不涉及外键、事务等关系数据库的其他特征 |
| N01 | NoSQL 数据库通常指任何非关系型数据库，不用关系表的格式存数据；NoSQL 有人解释为 non-SQL，也有人解释为 not only SQL；主要有四类：文档、键值、宽列、图；MongoDB 是文档数据库的例子；键值数据库每一项是键与值，常把数据放在内存里、读写快，Redis 是它的例子 | MongoDB「What is NoSQL?」https://www.mongodb.com/resources/basics/databases/nosql-explained ：“they typically use it to refer to any non-relational database. Some say the term "NoSQL" stands for "non-SQL" while others say it stands for "not only SQL."”“A NoSQL database is a database that stores data in a format other than relational tables.”“four major types of NoSQL databases have emerged: document databases, key-value databases, wide-column stores, and graph databases.”“Examples of document databases are MongoDB and Couchbase.”“A key-value store is a simpler type of database where each item contains keys and values … provide high performance in reads and writes because they tend to store things in memory.”“Examples are Amazon DynamoDB and Redis.” | S02（Redis 的数据在内存里） | 2026-11-17 读取；MongoDB 公司的科普页，属厂商一手说法 | 已核；「No」读作「不用」或「不只是」两种说法都照原文并列，不判定哪个对 |
| S02 | Redis 是「在内存里、在磁盘上持久化」的数据库：数据从内存提供，磁盘用于保存；数据集不能大于内存；磁盘上的两种格式是 RDB（时间点快照）与 AOF（记下每个写操作，启动时重放） | Redis FAQ：“Redis is an in-memory but persistent on disk database … with the limitation of data sets that can't be larger than memory”“data served from memory, disk used for storage” https://redis.io/docs/latest/develop/get-started/faq/ ；Redis persistence：“RDB persistence performs point-in-time snapshots”“AOF persistence logs every write operation received by the server. These operations can then be replayed again at server startup” https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/ | — | 2026-11-17 读取，未对应具体版本 | 已核；只用于结尾的系列衔接，Redis 一集开工后按它自己的 FACTS 重新取证 |

## 取证中发现、没有进入成片的事实

- 数据目录里还有 `_mdb_catalog.wt`（集合目录）、`sizeStorer.wt`（文档数与大小）、`WiredTiger.wt` / `WiredTiger.turtle`（WiredTiger 自己的元数据）、`admin`、`config`、`local` 三个系统库的集合与索引文件（02 `ls db`、03 `wt list`）。
- 页可以远大于 32 KB 的磁盘上限：集合第 1 个叶页的磁盘映像解压后（即整理成磁盘格式、还没压缩时）118,705 字节，块压缩后放进 24,576 字节；同一页读进内存后的占用（`mem_footprint`）是 128,729 字节（03 dump_tree_shape 第 0.0 行）。文案说「整理好、还没压缩时十一万多字节」，不说成内存里的大小。
- 新插入的键在内存页上放在 `WT_INSERT` 结构里（`arch-btree.dox`、`btmem.h:1706` 起），与修改已有项的 `WT_UPDATE` 不同；文案统一讲「挂在这一项上的新版本」，不分这两种。
- 姓名索引建好时就已整批写进文件（检查点前已是 249,856 字节，02），与集合不同。
- 日志用 snappy 压缩；不超过 128 字节的记录不压缩（MongoDB 文档 WiredTiger）。
- 缓存大小的缺省公式（A11）。

## 复核

未做（尚未成片）。
