# Firebird：当前任务入口

2026-10-21，策划者最新要求：**加长引子，先讲清“小众的第三选择”是什么；既能像 Pg/MySQL 做独立服务，也能像 SQLite 嵌入应用；实现主线保留，总片长比 MyISAM 短即可**。这条要求替代此前约 7:15 的目标；MyISAM 交付记录为 475.883 秒，当前稿估算约 7:35。继续降低认知负担、自然讲述，保留与前集的简单机制对比，不重复事务性教程。原话与预算见 [README.md](README.md) 的“简报”。

观众定位按最新会话纠正：**已经看过前三期，但未必熟悉 Firebird**。开场直接从 MyISAM、InnoDB、PostgreSQL 接续上一期的 Firebird 预告，不用“你先想到谁”重新介绍数据库，不在引子复讲建表与 SQL 基础。

当前角色为**准备方**，当前中文第 5 稿待 WaterRun 确认。先读仓库 docs/README.md 的按任务阅读，再读本片 README、research/FACTS.md、review/NOTES.md 和 src/js/script.js。

- 文案唯一来源：src/js/script.js；当前交审全文与哈希见 review/NOTES.md。
- 事实唯一来源：research/FACTS.md；源码研究固定 Firebird v5.0.4，已有实验结果直接读，新补查询路径实验为 research/lab/13_query_path.py。
- 文案未获明确确认，不配音。不得补造确认、试听、观看或验收结论。
- 本次只准备文案与证据；不改视觉系统、场景、配乐或共享文件。
- 旧 brief/ 与 src/js/scenes/ 是旧稿的材料和骨架；其章节、句号、时长、制作建议不再代表当前文案。制作方接手后按当前源稿和仓库规则设计。
- 尤其不能沿用旧稿的“先写日志”“旧版留原地”“每两万次事务才回收”断言，纠正依据见 FACTS。
- 署名从 project.json 的 credits 读取，只列实际参与者；具体模型版本无记录时如实写未记录，不补猜。
- 提交仅限本目录，遵守根 AGENTS.md 的路径限定要求。
