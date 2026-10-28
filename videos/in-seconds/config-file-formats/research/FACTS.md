# 事实核查

取证日期：2026-10-28。对象：INI、XML 1.0、JSON / JSON Lines、YAML（1.1 类型表与 1.2.2 规范）、TOML 1.0.0。

## 对象与解释路径

软件把可变的参数放在代码外的纯文本里，改参数不必重新编译。五种格式沿「怎样表达层级、怎样区分类型、能否写注释」三件事推进：INI 只有章节与键值一层；XML 用成对标签表达任意层级，代价是标签冗长；JSON 用括号代替闭合标签并自带类型，但标准语法没有注释；YAML 靠缩进去掉括号、允许注释，但缩进出错和隐式类型会出问题；TOML 用带圆点的方括号表达嵌套，缩进不影响结构，有注释和类型。全片沿用同一组 `server` / `port = 8080` 示例。

来稿（Gemini 4 Argon）中经核查不成立或无依据的说法已改写，见「复核」。

## 取证环境

| 记录 | 环境 |
|---|---|
| `research/lab/formats.py` → `formats.out.txt` | Windows 11，Python 3.14.3，PyYAML 6.0.3（YAML 1.1 解析器），标准库 tomllib |
| 网页 | 2026-10-28 访问 |

## 开场与 INI

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| o1–o3、e6 | 配置文件是程序之外存参数的纯文本，改参数不需重新编译 | 通用定义；下列各格式规范均为纯文本格式。片中只作为引子，不作历史断言 | 采用 |
| a1 | Windows 1.0（1985）引入 INI 文件存放系统设置 | [Wikipedia: INI file](https://en.wikipedia.org/wiki/INI_file)「History」；[WIN.INI](https://en.wikipedia.org/wiki/WIN.INI) | 已核（二手来源，年代与 Windows 1.0 发布年一致） |
| a2 | 文件分章节 `[section]`，章节内为 `key=value` | 同上「Format」 | 已核 |
| a4 | 标准 INI 只有章节一层，没有嵌套 | 同上；部分实现以点号模拟层级，不属于通行格式 | 已核 |

## XML

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| b1 | XML 1.0 于 1998-02-10 成为 W3C 推荐标准 | [REC-xml-19980210](https://www.w3.org/TR/1998/REC-xml-19980210) 文首 | 已核 |
| b2–b3 | 非空元素以开始标签起、结束标签止，元素可嵌套 | 同上 §3「Logical Structures」 | 已核 |
| b4 | 开始标签可带属性（名与值）；有文档类型声明时可做有效性校验（well-formed 之外的 valid） | 同上 §3.1、§2.8 | 已核 |
| b5–b6 | 示例 `<config><server><port>8080</port><host>localhost</host></server></config>` 去空白 73 字符，数据 13，标签 60 | `research/lab/formats.out.txt` | 实测 |

## JSON 与 JSONL

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| c1 | Crockford 称 2001 年春「发现」JSON，首条 JSON 消息发于 2001 年 4 月 | [The Discovery of JSON](https://nofluffjuststuff.com/blog/douglas_crockford/2008/01/the_discovery_of_json)；[JSON Saga 讲稿](https://mamund.site44.com/rwcbook/the-json-saga/index.html) | 已核 |
| c2 | 同一示例写成 JSON 去空白 43 字符（XML 73） | `research/lab/formats.out.txt` | 实测；不推广为「小一半」 |
| c3 | 值的类型：字符串、数字、true/false、null、对象、数组 | [json.org](https://www.json.org/json-en.html) | 已核 |
| c4 | JSON Lines：UTF-8，每行一个合法 JSON 值，以 `\n` 分隔；适合日志文件、逐条处理 | [jsonlines.org](https://jsonlines.org/) | 已核 |
| c5 | json.org 语法没有注释 | [json.org](https://www.json.org/json-en.html) | 已核 |

## YAML

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| d1 | 第一个 YAML 实现（Perl）写于 2001 年；1.0 规范 2004 年发布 | [YAML 1.2.2](https://yaml.org/spec/1.2.2/) §0「Prior Art」 | 已核 |
| d1 | 设计目标第一条是便于人阅读 | 同上 §1.1「Goals」 | 已核 |
| d2 | 块式写法靠缩进表示层级；也有带 `[]` `{}` 的流式写法和引号标量，故**不是**「去掉了所有括号和引号」 | 同上 §1.2、§7 | 已核，来稿已改 |
| d3 | 注释以 `#` 开头 | 同上 §6.6 | 已核 |
| d5 | 示例中某行少一个空格 → ParserError；少两个空格 → 不报错，`host` 从 `db` 移到 `server` 下 | `research/lab/formats.out.txt` | 实测 |
| d6 | YAML 1.1 布尔类型的隐式写法包括 `n|N|no|No|NO`；PyYAML 把 `country: NO` 解析为 `False`。YAML 1.2 去掉了多数这类隐式类型 | [yaml.org/type/bool](https://yaml.org/type/bool.html)；YAML 1.2.2 §0；实测 | 已核，旁白限定为 1.1 |

## TOML 与收尾

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| e1 | toml-lang/toml 仓库首个提交 2013-02-24；1.0.0 于 2021-01-11 发布 | GitHub API `repos/toml-lang/toml/commits`；[toml.io v1.0.0](https://toml.io/en/v1.0.0) | 已核 |
| e2 | 表头 `[a.b]` 中圆点分隔的每一段成为一层嵌套表 | toml.io v1.0.0「Table」 | 已核；实测 `[server.db]` → `{'server': {'db': …}}` |
| e3 | 缩进视为空白、被忽略；`#` 起注释；值有字符串、整数、浮点、布尔、日期时间、数组、内联表等类型 | toml.io v1.0.0 | 已核 |
| e4–e5 | 「机器好解析 ↔ 人好读写」是本片的归纳框架，不是规范陈述 | — | 观点 |

## 复核

来稿 → 改稿（2026-10-28，Claude Opus 5.5）：

- a1「1980 年代普及……最早的常见格式」→ 只说 Windows 1.0（1985）用它存设置；「最早」无依据。
- b4「严格校验每一项的格式」→ 加条件：配上文档类型定义才能校验。
- c2「体积立刻小了一半」→ 实测为 73 → 43 字符，改为「短了一大截」，画面给实数。
- c3「机器读写极快」→ 无可比口径，删去。
- c4「AI 数据逐行追加」→ jsonlines.org 只说日志、逐条处理，改之。
- d2「去掉了所有括号和引号」→ 不成立，改为块式写法不用括号、多数字符串不必加引号。
- d3「常用于编写复杂的部署清单」→ 未取证，删去。
- d5「整个文件就会解析失败」→ 实测还可能不报错而层级变样，改之。
- d6 加限定「按 YAML 1.1 的规则」。
