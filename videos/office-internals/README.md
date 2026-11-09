# Office 底层原理

## 定位

沿 Office 文档的格式与内部组织讲解底层原理：先简单回顾传统二进制格式并引出 OpenXML，再拆开 OpenXML 的文件包，然后依次进入 Excel、Word、PowerPoint。具体格式与实现细节在各集开工后取证。

| 项 | 约定 |
|---|---|
| 顺序 | 传统二进制格式（简讲，引出 OpenXML）→ OpenXML 文件包 → Excel → Word → PowerPoint |
| 语言 | 中文（片单缺省） |
| 片长 | 待策划者确定 |

## 策划者要求

2026-10-26 会话原话：

> 增加一个系列 Office底层原理
> 顺序:
> 1.引入OpenXML
> 2.Excel的底层是什么样的?
> 3.PowerPoint的底层是什么样的?
> 4.Word的底层是什么样的?
> 5.回顾: 传统Office二进制格式

2026-11-09 会话原话（取代上面的顺序）：

> Office底层原理第一期是回顾：传统 Office 二进制格式, 简单讲, 然后引入OpenXML. 我Office没你熟悉, 你看看怎么组织剧集.

编排思路（维护者建议，策划者授权组织；各集的技术细节开工时取证后再定）：

| 集 | 回答的问题 | 为什么排在这里 |
|---|---|---|
| 1 传统二进制格式 | 老 .doc、.xls 文件为什么难读，后来为什么换格式 | 简单讲，只为说明换格式的动机，结尾引出 OpenXML |
| 2 OpenXML 文件包 | 把 .docx 改名成 .zip 解开，里面的部件怎样互相找到 | 三个软件共用这一层，放在最前面，后面各集不再重复 |
| 3 Excel | 单元格、字符串、公式和结果分别存在哪里 | 网格结构最规整，最适合第一个进入内部 |
| 4 Word | 一段文字为什么被拆成很多小片，样式怎样叠加 | 流式内容比网格复杂，有了 Excel 的基础再讲 |
| 5 PowerPoint | 版式和母版怎样层层继承，图形怎样描述 | 继承关系最多，图形描述的部分也回头解释前两集里的图 |

## 分集

<!-- catalog:begin 由 node kit/tools/catalog.js 生成，不要手改 -->
| # | 标题 | 语言 | 状态 | 目录 |
|---|---|---|---|---|
| 1 | 回顾：传统 Office 二进制格式 | zh | 计划中 | `office-binary-formats` |
| 2 | 引入 OpenXML | zh | 计划中 | `openxml` |
| 3 | Excel 的底层是什么样的？ | zh | 计划中 | `excel-internals` |
| 4 | Word 的底层是什么样的？ | zh | 计划中 | `word-internals` |
| 5 | PowerPoint 的底层是什么样的？ | zh | 计划中 | `powerpoint-internals` |
<!-- catalog:end -->
