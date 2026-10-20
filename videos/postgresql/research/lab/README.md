# 本片研究的复现

实验：2026-10-19，Windows x86-64 / PostgreSQL 18.4 / Python 3.14.3 / psycopg 3.3.5。源码 tag REL_18_4 与固定提交见 `../sources.json`。事实与适用边界见 `../FACTS.md`，路线见 `../MAP.md`。

从仓库根目录执行，路径中的二进制目录换成实际安装位置：

```powershell
python -X utf8 videos/series/database-engines/postgresql/research/lab/01_probe.py --bin 'C:\Program Files\PostgreSQL\18\bin'
python -X utf8 videos/series/database-engines/postgresql/research/lab/02_sources.py
python -X utf8 videos/series/database-engines/postgresql/research/lab/03_decode.py
python -X utf8 videos/series/database-engines/postgresql/research/lab/04_survey.py
python -X utf8 videos/series/database-engines/postgresql/research/lab/05_style.py
python -X utf8 videos/series/database-engines/postgresql/tools/gen_data.py
node videos/series/database-engines/postgresql/tools/verify_research.cjs
```

第 2 稿的跨集核对另用 `node videos/series/database-engines/postgresql/research/lab/07_series.cjs`：它只读取前两集的实际正文、八行业务数据和首集已留的取证源/文件，不修改其他影片或连接数据库；需要相应缓存。日常离线验证直接读已入库的 `out_07_series.json`，不依赖另一片目录。新增插入/删除示意来自固定 18.4 源码和手册，未追加数据库字节实验。

在线抓取需要 requests、beautifulsoup4；离线解码与数据生成只用 Python 标准库。服务器实验需要 psycopg 及兼容的 pageinspect / hstore / btree_gist。当前环境已具备这些依赖，本轮未安装额外软件包。

01 自建唯一命名的集群，只监听本机回环；只有合成 users/notes、20,000 行对照表、点与设备预约。不会连接现有数据库，不修改现有服务配置。immediate 崩溃实验只作用于它创建的实例；结束正常停机。为了留取页证据，集群和页样本留在被忽略的 `research/_src/lab-*`；本轮未清理或删除研究目录，也没有运行仓库清理工具。不得批量停止所有 postgres 进程。

01 仅捕获所需环境信息，initdb 输出中的宿主身份和个人目录在写入公开记录前替换，未保存口令或业务记录。环回地址是本机实验监听，不是远端连接方式。完整服务器日志保留了有序动作及合成 SQL 的错误，不伪造失败回显。

03 可只使用已入库 JSON 重做；04 需要 02 保存的网页原文；05 重新下载公开 SVG；gen_data 与离线 verify 使用已入库结果。原始页的事务号、LSN、物理名和运行时间可能改变；重跑 01 后须跟着重跑 03、数据生成及验证，不能把新旧结果混用。

当前：15 项实际行为检查通过、7 页快照的 62 个元组解码与 pageinspect 一致。所有毫秒耗时仅为当次局部环境结果，不进入性能比较；没有断电、撕裂页、备库、复制、多节点和吞吐测试。没有配音、图像生成或视频渲染。

第 3 稿新增独立索引实验与一手材料抓取：

```powershell
python -X utf8 videos/series/database-engines/postgresql/research/lab/08_compare.py --bin 'C:\Program Files\PostgreSQL\18\bin'
python -X utf8 videos/series/database-engines/postgresql/research/lab/09_compare_sources.py
python -X utf8 videos/series/database-engines/postgresql/tools/gen_data.py
node videos/series/database-engines/postgresql/tools/verify_research.cjs
```

08 不连接原实例或既有服务；在新建实例中验证部分索引和 JSONB/GIN，5 项检查通过并正常停机。09 只缓存公开原文，不安装 PostGIS / pgvector、不调用托管数据库。新结果与第一轮 15 项行为检查分开记录；数据生成器现在同时读取 out_08_compare.json。许可和框架/平台资料用于说明采用路径，不是迁移因果统计。

第 5 稿新增开场趋势数据：

```powershell
python -X utf8 videos/series/database-engines/postgresql/research/lab/10_survey_trend.py          # 用缓存原页
python -X utf8 videos/series/database-engines/postgresql/research/lab/10_survey_trend.py --fetch  # 重新下载 2018–2021、2024、2025 原页
```

10 只读公开页面的汇总百分比；2022、2023、2026 沿用 04 的结果。各年样本与题目不同，输出的 warning 字段写明不能当市场份额或迁移数据。
