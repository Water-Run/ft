# 文案校对稿 · HTTP Status Codes in 96 Seconds

- 语言：en
- 内容 SHA-256：`b077cc94b4c22364d501d9c736763bcf0d256109704091bf1730d115a77bc652`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：96.0 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

写稿与交审前读一遍本阶段的经验规则：`node kit/tools/lessons.js show --stage script`。

## open · 无章节卡

预估 13.8 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| o1 | A request goes out; three digits return. |
| o2 | 404 is not found; 500 is the server broke. |
| o3 | This is an HTTP status code. |
| oT | （无旁白；画面停留） |

## what · 无章节卡

预估 15.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| w1 | It sits on the response’s first line; the digit sets the class: |
| w2 | 1xx working, 2xx success, 3xx redirect, |
| w3 | 4xx bad request, 5xx server failure; |
| w4 | unknown ones sort by digit, like 471 as 400. |

## history · 无章节卡

预估 14.5 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| h1 | In 1990, HTTP only sent files, no status codes. |
| h2 | Messages came later, and this line was added. |
| h3 | From 1.1 to HTTP/3 in 2022, versions changed; codes stayed. |

## common · 无章节卡

预估 20.3 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| c1 | At the origin holding the resource, checks run: |
| c2 | Bad syntax gets 400; no credentials, 401; |
| c3 | not enough permission, 403, retrying fails. |
| c4 | No such resource, 404, temporary or permanent. |
| c5 | Found it, 200 carries the content; |
| c6 | if the cache is valid, 304 skips resending. |

## who · 无章节卡

预估 15.3 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| u1 | If the origin itself crashes, it returns 500. |
| u2 | Too fast, and rate limiters return 429. |
| u3 | A gateway or proxy just forwards origin codes; |
| u4 | 502 on a bad upstream, 504 on a timeout. |

## close · 无章节卡

预估 13.6 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| x1 | On error, check the first digit: |
| x2 | 4xx, fix your request; 5xx, wait; |
| x3 | 502 and 504 mean it got stuck upstream. |
| x4 | Three digits show where it stopped, and who acts. |

## outro · 无章节卡

预估 3.5 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| z1 | （无旁白；画面停留） |

## 交审核对

- 标题、开头和结尾回答同一个问题。
- 术语第一次出现有解释；因果、适用范围、版本和数字对应 FACTS.md。
- 根据句号逐条核对译文，记录简化与推断；片尾名单留足阅读时间。
- 有疑问的地方逐条写入 NOTES.md，关闭意见后由指定校对者明确确认。
