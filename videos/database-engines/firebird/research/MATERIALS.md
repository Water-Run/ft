# 第 8 稿新增的数据材料与策划约束

策划者要求“一个小众的第三选择：Firebird”旁白不变，但背景要有采用规模数据。该要求定位在 `o6`，此处只记录数据与约束，具体画面由制作方设计。

| 背景数据 | 同一来源与口径 |
|---|---|
| PostgreSQL 48.7% | 2024 Stack Overflow Developer Survey，Databases / All Respondents |
| MySQL 40.3% | 同上 |
| Firebird 1.1% | 同上 |

背景必须带明示口径：**2024 开发者数据库使用率；全部答题者；多选；n=52,418**。来源是 [官方 2024 技术页](https://survey.stackoverflow.co/2024/technology/)，对应提取结果为 `lab/out_16_usage_context.json`。这是该调查的使用比例，不能标成全球装机、收入或独占市场份额，也不能混用 2026 年的 MySQL/Pg 数字。

2025 页面将 Firebird 仅列在手填项中，2026 未单列该项；未列出不等于 0%。本轮选取三者都作为数据库选项列出的 2024 年同口径数据，不使用手填项的 0% 舍入值。

可复核数据统一生成在 `src/js/data.js`，由 `tools/gen_data.py` 读取 `out_13_query_path.json`、`out_15_record_layout.json`、`out_16_usage_context.json` 生成，不在画面源码手抄数字。

第 8 稿的底层材料还包括：225 号指针页到 231 号数据页、0 号槽的偏移与长度、更新后指向 8 号历史槽的记录头、差量还原与事务清单页状态。这些数字来自对原实验 08 二进制的新增解析，不是另一次在线写入或崩溃实验。字段、范围与源码定位见 FACTS。
