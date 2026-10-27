# PostgreSQL 事实表（新版）

旁白、画面、注解与封面上的事实只来自本表。2026-10-26 开工，条目按 README「取证计划」逐项实测、读原文后再填，每条写清出处与核对方式。

## 环境与版本

- 对象：**PostgreSQL 18**，当前最新的生产大版本。WaterRun 2026-10-26：「pg用最新生产版本」；2026-10-27：「Pg我系统安装的是18大版本了, 那就以此即可」——以大版本 18 为准，实测用本机已装的 18.4。
- 18 是最新的生产大版本：[版本政策页](https://www.postgresql.org/support/versioning/)的支持表，18 系列首发 2025-09-25，当前小版本 18.6；[官网首页](https://www.postgresql.org/)「Latest Releases」列 18.6 于 2026-08-13 发布，同页的 PostgreSQL 19 RC 1（2026-10-15）是候选版，官方注明不建议用于生产。2026-10-26、10-27 读取。交付前再核一次 19 是否已正式发布。
- 为什么 18.4 的实测代表 18：同一版本政策页——「Starting with PostgreSQL 10, a major version is indicated by increasing the first part of the version」；「Minor releases only contain fixes for frequently-encountered bugs, low-risk fixes, security issues, and data corruption problems」；「Minor release upgrades do not require a dump and restore」，而大版本「the contents of the data directory cannot be maintained in a backward compatible way」。即同一大版本内数据目录通用，页与行的盘上结构不随小版本变。片中写「PostgreSQL 18」，实测记录写明 18.4。
- 本机：Windows x86-64，`C:\Program Files\PostgreSQL\18\bin` 的 `postgres --version` 为 `postgres (PostgreSQL) 18.4`（2026-10-27）。已有服务 `postgresql-x64-18` 不动、不连；实验用同一套二进制另起独立集群（临时数据目录、随机端口），做完即删。
- 源码 tag（REL_18_4）、数据规模与工具版本：取证时填写。

## 旧版材料

旧版（2026-10-19 发布，基于 18.4）的事实表、来源与实验原样存档在 [r12/](r12/)。WaterRun 2026-10-27：「旧版本不用署名」——旧版的署名不进新版名单。旧材料只作取证线索，新版全部重测（同为 18.4，但按新版的例子 Alice 2050 与新的取证计划重做）、重读原文后再进入本表。存档只作取证线索。

<!-- 下面各节按取证计划补充：开场的调查数字、历史与名称、整体结构（堆、两棵 B 树、FSM 与 VM）、页与元组、增、查、改（含 HOT）、事务与并发、删与 VACUUM（含冻结）、WAL 与崩溃恢复、与 InnoDB 的对照。 -->
