# 文案校对稿 · Web Login in 200 Seconds: How a Site Checks That You Are You

- 语言：en
- 内容 SHA-256：`5359b29d9519ab518796c16b63f31ba3a7ee185595857a67e109ec7d5652059e`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：200.0 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

反馈应用：[逐项记录](feedback.json)。交审时同时核对 Lean 4 负面案例、单集独立理解、中文释义与口播负担。

## open · 无章节卡

预估 18.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| o1 | You open a site and type an account and password. |
| o2 | How does the server confirm it is really you? |
| o3 | Passwords, SMS codes, Google sign-in, fingerprints: all evidence. |
| o4 | What differs is what the server verifies. |

## password · 无章节卡

预估 30.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| p1 | The site asks for an account, then a password. |
| p2 | The password goes to the server over TLS. |
| p3 | The server stores a salt and a slow hash, not the password. |
| p4 | It hashes the input with the same salt and compares. |
| p5 | A match confirms that you know the password. |
| p6 | But that only proves knowledge. |
| p7 | It does not prove the next request is you. |

## factors · 无章节卡

预估 22.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| k1 | An SMS code verifies you have the phone, but it can be relayed. |
| k3 | A passkey verifies something else: you hold the private key. |
| k4 | The server stores the public key and sends a random challenge. |
| k5 | The authenticator signs; the server verifies, bound to the domain. |

## session · 无章节卡

预估 56.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s1 | After login, the server remembers this verification result. |
| s2 | HTTP does not remember; the server makes a random session ID. |
| s3 | It goes into a cookie, sent automatically on later requests. |
| s4 | The server checks its table: ID exists, not expired, session accepted. |
| s6 | A leaked ID impersonates you; rotate and invalidate it on logout. |
| j1 | One problem: many servers must share that session table. |
| j2 | Another way: put the result in a signed token, with no table. |
| j3 | A JWT is such a token: header, payload, signature. |
| j4 | The first two parts are encoded, not encrypted; anyone can read them. |
| j5 | The server verifies the signature, then expiry and audience. |
| j6 | The cost is revocation; keep it short-lived. Whoever holds it can use it. |

## federation · 无章节卡

预估 27.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| f1 | Another kind of verification: Google or enterprise SSO vouches for you. |
| f2 | You log in there, then return with a code. |
| f3 | OAuth handles authorization; OIDC adds identity and returns an ID token. |
| f4 | The site verifies the ID token’s signature and audience before trusting it. |
| f5 | The code is short-lived, single-use, redirect-bound; PKCE checks too. |

## attacks · 无章节卡

预估 24.2 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| a1 | An attacker wants verification to pass with evidence not yours. |
| a2 | Phishing takes passwords and codes; stuffing reuses leaks. |
| a3 | XSS reads cookies without HttpOnly. |
| a4 | CSRF sends the cookie; SameSite blocks it. |
| a5 | Fixation plants an ID; a stolen JWT works until invalid. |

## close · 无章节卡

预估 14.8 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| e1 | Verifying you means checking evidence against a rule. |
| e2 | Passwords verify knowledge, SMS possession, passkeys a key. |
| e3 | Cookies verify continuity, JWTs a signature; no mechanism fits all. |

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
