# 文案校对稿 · Web Login in 200 Seconds: How a Site Checks That You Are You

- 语言：en
- 内容 SHA-256：`2eeacf2b0ecca05d98d4b78836a157fee2889b0555c644a4c7db3ddc59b76349`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：200.0 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

反馈应用：[逐项记录](feedback.json)。交审时同时核对 Lean 4 负面案例、单集独立理解、中文释义与口播负担。

## open · 无章节卡

预估 21.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| o1 | After login, the browser holds one more cookie. |
| o2 | On the next request, the server sees it and knows you. |
| o3 | But the cookie is only transport; the Session on the server remembers you. |
| o4 | In 200 seconds: Session, JWT, authentication and authorization. |

## session · 无章节卡

预估 38.3 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s1 | After login, the server creates a session: user, permissions, expiry. |
| s2 | It gives the browser a Session ID. |
| s3 | The browser puts it in a Cookie, sent automatically. |
| s4 | The server looks up the session; Cookie is transport, Session is state. |
| s5 | The weakness: the server must store and share that session table. |
| s6 | A stolen Session ID impersonates you. |
| s7 | Browsers attach Cookies, so cross-site requests can use them. |

## jwt · 无章节卡

预估 36.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| j1 | To avoid the session table, sign identity and permissions into a token. |
| j2 | JWT is a token format, not a Session. |
| j3 | It has three parts: header, payload, signature. |
| j4 | The first two parts are encoded, not encrypted; anyone can read them. |
| j5 | The server verifies the signature, expiry and audience. |
| j6 | An Access Token calls resources; a Refresh Token gets a new Access Token. |
| j7 | Weaknesses: revocation is hard and tokens get stolen; keep them short-lived. |

## authn · 无章节卡

预估 30.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| p1 | Session and token only remember an earlier check. How was it done? |
| p2 | Password: salt, slow hash, compare; it proves knowledge. |
| p3 | SMS code: proves you have the phone, but can be relayed. |
| p4 | Passkey: proves you hold the private key, bound to the domain. |
| p5 | CAPTCHA only proves you are human, not your identity. |
| p6 | Authentication answers who; session answers how to remember. |

## oauth · 无章节卡

预估 28.7 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| a1 | OAuth 2.0 is authorization: limited access, not user authentication. |
| a2 | OIDC adds an identity layer and returns an ID Token. |
| a3 | Access Token calls resources; Refresh Token renews. |
| a4 | ID Token proves identity; the resource server verifies signature and audience. |
| a5 | The weakness is transferred trust: a bad provider weakens the site. |

## attacks · 无章节卡

预估 21.1 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| x1 | Each layer has its own attack surface. |
| x2 | Session: stolen IDs, CSRF, fixation. |
| x3 | JWT: stolen tokens, slow revocation, readable payloads. |
| x4 | AuthN: phishing, stuffing, SMS relay, lost passkey devices. |
| x5 | AuthZ: bad redirect, audience or signature checks break trust. |

## close · 无章节卡

预估 16.9 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| e1 | AuthN, session, AuthZ and tokens are layers, not competitors. |
| e2 | They solve different problems, each with a cost. |
| e3 | Ask what must be verified, then choose the mechanism. |

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
