# 基础实验与证据

实验日期 2026-10-09；Linux x86_64 / rootless Podman / MySQL Community Server 9.7.2。复现需要 Python 3、PyMySQL；取官方来源另需 requests、beautifulsoup4。镜像摘要见 `image.json`，源码 tag/commit 见 `source_version.json`。

从本片目录运行：

```bash
python research/lab/01_probe.py
python research/lab/02_sources.py
python research/lab/03_pages.py
python tools/gen_data.py
python tools/verify_research.py
```

`01_probe.py` 自建唯一命名的容器，网络关闭、没有发布端口，通过临时 Unix socket 连接。测试库只有合成数据；崩溃实验只 SIGKILL 自己的容器。正常结束或失败都会删除该容器及其匿名数据卷。不会连接或修改已有数据库。只需离线核对现有研究材料时，运行最后两条；无需再次下载镜像或执行崩溃实验。

| 文件 | 内容与范围 |
|---|---|
| `00_schema.sql` | 从前集继承的 8 个 users 行和 notes 数据；另建同版本 MyISAM 对照、间隙锁辅助表 |
| `01_probe.py` | 环境、布局元数据、执行计划、两表回滚、MyISAM对照、RR/RC、记录/间隙锁、死锁、进程崩溃与恢复 |
| `out_01_probe.json` / `.txt` | 各会话实际 SQL 和返回值。数组按完成记录；并发死锁的等待顺序由脚本明确设定，不用文件行序推断耗时 |
| `out_01_recovery.log` | Podman logs 的完整 stdout、随后 stderr，保留每条时间戳；不是已按时间排序的串流 |
| `02_sources.py` | 抓取官方手册及固定提交的源码，原文进忽略目录，来源、SHA-256、符号行号进 sources.json |
| `03_pages.py` | 用索引元数据取根页，再按页头与记录链解码 users.ibd；仅支持当前固定schema/页大小，不是通用解析器 |
| `out_03_pages.json` | 页号、偏移、索引类型/ID、用户列、事务字段和十六进制字节 |
| `out_04_verify.json` | 当前材料之间的一致性校验结果；不是视频验收报告 |

实验将 binlog 关闭以隔离 InnoDB 本体；`innodb_flush_log_at_trx_commit=1`，doublewrite=ON，16 KiB 页，file-per-table=ON，DYNAMIC 行格式，默认 RR；配置值全部实查。两个根页各仅 8 行，都是 level 0 的叶子页。

初始化镜像会先启动临时 mysqld。实验的 ready 检查同时确认容器 PID 1 已切换为正式 mysqld，并确认 socket 可用，避免把初始化期间的临时服务误当成最终实验服务。

实验清理后，正常停机取出的 `.ibd` 样本仍保存在 `research/_src/`，其 SHA-256 在 `out_03_pages.json`。重跑事务ID、LSN、部分页号/字节可能改变，必须成套重跑解码与数据生成，不拿新 SQL 输出搭配旧的字节图。当前的 `src/js/data.js` 只从已入库的结构化实验结果生成，可离线复现。

故障实验只是进程崩溃；没有模拟整机掉电、硬盘损坏或撕裂页。没有测性能、三层树、页分裂、完整undo链、purge时序、binlog协调或复制。公共材料使用通用容器主机名 `db-lab` 和标准容器路径；没有宿主身份或连接地址。
