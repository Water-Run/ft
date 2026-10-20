# 文案校对稿 · Web Login in 200 Seconds: How a Site Checks That You Are You

- 语言：en
- 内容 SHA-256：`f23a210c4cf3b139f0c743fa9523fe9e8f8defad6f139a6e4a0da9cd1d51484b`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：200.0 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

反馈应用：[逐项记录](feedback.json)。交审时同时核对 Lean 4 负面案例、单集独立理解、中文释义与口播负担。

## open · 无章节卡

预估 14.1 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| o1 | After login, how does the site verify the next request? |
| o2 | Start with a cookie session. |
| o3 | Start with cookie. |

## cookie · 无章节卡

预估 38.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| c1 | The server makes a random session ID and puts it in a cookie. |
| c2 | The browser sends it automatically on every later request. |
| c3 | The server checks its table: the ID exists and has not expired. |
| c4 | So it verifies continuity, not the person again. |
| c5 | First weakness: the table lives on the server. |
| c6 | Many servers share it; lose it and sessions are gone. |
| c7 | Second: a stolen ID lets someone impersonate you. |
| c8 | Third: browsers attach cookies, so cross-site requests can use them. |

## jwt · 无章节卡

预估 29.7 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| j1 | To avoid that table, sign the result into a token. |
| j2 | A JWT is such a token: header, payload, signature. |
| j3 | The first two parts are encoded, not encrypted. |
| j4 | Verify signature, expiry and audience before trusting it. |
| j5 | It removes the table, but adds revocation. |
| j6 | A token stays valid until expiry, and a stolen one works too. |
| j7 | Keep it short-lived, with a revocation list. |

## password · 无章节卡

预估 25.7 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| p1 | Cookie and JWT only remember an earlier check. How was it done? |
| p2 | Usually a password: salt, slow hash, compare. |
| p3 | A match confirms that you know it. |
| p4 | But that only proves knowledge, not ownership. |
| p5 | It is vulnerable to phishing, stuffing, and password reuse. |
| p6 | So it is usually just the first check. |

## factors · 无章节卡

预估 25.2 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| f1 | A second way: an SMS code verifies you have this phone. |
| f2 | But codes can be relayed by fake sites. |
| f3 | A passkey proves you hold the private key. |
| f4 | The server stores the public key and sends a challenge. |
| f5 | The authenticator signs, bound to the site’s domain. |
| f6 | Its weakness is device dependence and recovery. |

## delegated · 无章节卡

预估 24.2 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| d1 | Another way: a separate identity provider verifies you. |
| d2 | It verifies you, then hands this site an assertion. |
| d3 | This site verifies the assertion’s signature and audience. |
| d4 | OIDC ID tokens and SAML assertions are such statements. |
| d5 | The weakness is transferred trust: a bad provider weakens the site. |

## attacks · 无章节卡

预估 19.9 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| a1 | CAPTCHA only checks you are human, not a script. |
| a2 | Cookies are stolen or CSRF’d; JWTs stolen or poorly revoked. |
| a3 | Passwords phished or stuffed; SMS relayed; passkeys need the device. |
| a4 | Federation fails on bad config: no audience or signature check. |

## close · 无章节卡

预估 15.2 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| e1 | No verification method fits every case. |
| e2 | Cookies continuity, JWTs a signature, passwords knowledge, SMS possession, passkeys a key. |
| e3 | Choose by evidence, rule reliability and cost. |

## outro · 无章节卡

预估 8.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| z1 | （无旁白；画面停留） |

## 交审核对

- 标题、开头和结尾回答同一个问题。
- 术语第一次出现有解释；因果、适用范围、版本和数字对应 FACTS.md。
- 根据句号逐条核对译文，记录简化与推断；片尾名单留足阅读时间。
- 有疑问的地方逐条写入 NOTES.md，关闭意见后由指定校对者明确确认。
