# 讲解对象自己的材料

本片讲解的对象是 HTTP 响应状态码本身。这里只收「对象自己的东西」：协议文法定下的格式、规范给的原因短语、官方登记的码表。**只记材料，不写用法**（画面上怎么用归制作方，F16）。

取得日期：2026-10-21。全部来自公开的一手来源，地址与校验和见各条。

## 1. 状态行的文法

来源：RFC 9110 §4.1（`https://www.rfc-editor.org/rfc/rfc9110.txt`，2026-10-21 读取，本地副本 SHA-256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`）。

HTTP/1.1 的响应报文第一行叫状态行（status line），由三段组成：协议版本、空格、状态码、空格、原因短语（reason phrase）、CRLF。

```
HTTP-version SP status-code SP reason-phrase CRLF
```

三个事实，各自可复查：

| 材料 | 出处 | 原文要点 |
|---|---|---|
| 状态码是三位十进制整数，前面不能有多余的零 | RFC 9110 §15 | "The status code of a response is a three-digit integer code" |
| 原因短语可以完全省略，不影响协议 | RFC 9110 §15.1 | "The reason phrases listed here are only recommendations -- they can be replaced by local equivalents or left out altogether without affecting the protocol." |
| HTTP/2 的响应里没有状态行，只有 `:status` 伪头字段 | RFC 9113 §8.1、§8.3.2 | §8.3.2："For HTTP/2 responses, a single ':status' pseudo-header field is defined that carries the HTTP status code field"；§8.1 规定 HTTP 报文由 HEADERS 帧与 DATA 帧组成，没有状态行这一项 |

第三条的两个事实分开记：

- **已证实的**：HTTP/2 的响应报文里，状态码放在 `:status` 伪头字段中；报文由帧组成，没有 HTTP/1.x 的状态行。
- **本片自己的推论**：因为 HTTP/2 没有状态行这个位置，也就**没有原因短语的位置**。RFC 9113 全文没有出现 "reason phrase" 一词，所以这是从报文结构推出的结论，不是规范原话。若片中要讲这一条，必须按推论表述（说明「HTTP/2 连原因短语的位置都没有」是观察，不是规范原句），或者干脆不讲。

HTTP/3 同理（RFC 9114 用 `:status`），本片如要提及须先读 RFC 9114 原文再写。

## 2. 规范给出的原因短语

RFC 9110 §15.1 列出各码的原因短语，这些短语是**建议**，可以换成本地等价说法或整条省略。下表是本片实验里真实出现过的那几个，加上规范给出的写法：

| 码 | 规范给出的原因短语 | 本片实验里实际回显的样子 |
|---|---|---|
| 200 | OK | `HTTP/1.1 200 OK` |
| 201 | Created | `HTTP/1.1 201 Created` |
| 204 | No Content | `HTTP/1.1 204 No Content` |
| 301 | Moved Permanently | `HTTP/1.1 301 Moved Permanently` |
| 302 | Found | `HTTP/1.1 302 Found` |
| 304 | Not Modified | `HTTP/1.1 304 Not Modified` |
| 400 | Bad Request | `HTTP/1.1 400 Bad Request` |
| 401 | Unauthorized | `HTTP/1.1 401 Unauthorized` |
| 403 | Forbidden | `HTTP/1.1 403 Forbidden` |
| 404 | Not Found | `HTTP/1.1 404 Not Found` |
| 405 | Method Not Allowed | `HTTP/1.1 405 Method Not Allowed` |
| 429 | Too Many Requests | `HTTP/1.1 429 Too Many Requests` |
| 500 | Internal Server Error | `HTTP/1.1 500 Internal Server Error` |
| 502 | Bad Gateway | `HTTP/1.1 502 Bad Gateway` |
| 503 | Service Unavailable | `HTTP/1.1 503 Service Unavailable` |
| 504 | Gateway Timeout | `HTTP/1.1 504 Gateway Timeout` |

回显来自 `research/lab/out_11_status_codes.txt`（本机实测，Node v24.21.0），规范写法来自 RFC 9110 §15.3–§15.6 与 RFC 6585 §4。

**一个可用的观察点**：401 的原因短语是 Unauthorized（未授权），但它表示的是「没通过身份验证」，真正讲授权的是 403 Forbidden（禁止）。原因短语本身有误导性——这是规范里的历史遗留。

## 3. 官方登记的码表

来源：IANA「Hypertext Transfer Protocol (HTTP) Status Code Registry」，`https://www.iana.org/assignments/http-status-codes/http-status-codes.xml`，2026-10-21 读取，注册表自报 `updated 2025-09-15`。

注册表里值得当材料用的结构：

| 材料 | 内容 | 出处 |
|---|---|---|
| 五类的一句话定义 | 1xx Informational / 2xx Successful / 3xx Redirection / 4xx Client Error / 5xx Server Error，每类一句 | 注册表 `<note>` 元素 |
| 每个码对应哪份 RFC 的哪一节 | 如 404 → `rfc9110` `section="15.5.5"` | 注册表每条 `<record>` 的 `<xref>` |
| 未登记区间 | 105–199、209–225、227–299、309–399、419–420、427、430、432–450、452–499、509、512–599 均标 `Unassigned` | 注册表 `<record>` 的 `<description>` |
| 临时登记的码 | 104（Upload Resumption Supported）2024-11-13 登记、2025-09-15 登记扩展，有效期至 2026-11-13 | 注册表该条 `<description>` |

注册表里 `description` 给的是原因的简短说明（例如 404 → `Not Found`），与规范正文的小节号一一对应。

## 4. 相关的响应头字段

本片用到的头字段，定义都在 RFC 9110 里：

| 字段 | 规范里的位置 | 它说明什么 |
|---|---|---|
| `Location` | §10.2.2 | 资源的新地址（301 / 302 / 307 / 308 等用） |
| `Allow` | §15.5.6（405 要求） | 这个资源当前支持哪些方法 |
| `Retry-After` | §10.2.3 | 建议等多久再重试（429 / 503 用） |
| `WWW-Authenticate` | §11.6.1 | 服务器给出的认证挑战（401 要求至少一个） |
| `ETag` | §8.8.3 | 资源当前版本标识（条件请求用） |
| `If-None-Match` | §13.1.2 | 客户端手上那个副本的标识（条件 GET 用） |

这些字段在 `research/lab/out_11_status_codes.txt` 里的实测样子见 FACTS 02-3、02-8、02-9、02-11、02-14、02-15、02-18 各行。

## 5. 不属于讲解对象的材料

明确排除，避免把别人的东西当成本片的对象：

- 浏览器 UI 的错误页（Chrome 的「此网页无法找到」之类）——那是浏览器画的，不是 HTTP 协议的一部分。浏览器层的行为见 FACTS「尚待核实」一节。
- 各种框架的错误页样式——同属实现，不属协议。
- 任何真实站点的响应——涉及第三方站点与隐私，不取。
