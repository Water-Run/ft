# 文案校对稿 · Web Login in 200 Seconds: How a Site Checks That You Are You

- 语言：en
- 内容 SHA-256：`b6ef4d186a135a73646bd330500f06e351f174296bcd3a06498d8f2e5c66e315`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：200.0 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

反馈应用：[逐项记录](feedback.json)。交审时同时核对 Lean 4 负面案例、单集独立理解、中文释义与口播负担。

## open · 无章节卡

预估 19.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| o1 | What is a site actually checking when you log in? |
| o2 | Passwords, codes, fingerprints, Google sign-in: many forms. |
| o3 | All answer three questions: who, proof, and memory. |
| o4 | Start with one temporary pass. |
| o5 | Why can it stand for you? |

## credentials · 无章节卡

预估 47.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| c1 | First: who are you? An account is your claim. |
| c2 | Second: how do you prove it? Usually a password. |
| c3 | The password travels to the server over TLS. |
| c4 | The server keeps a random salt and a slow hash, not the password. |
| c5 | A salt changes equal passwords; a slow hash slows guessing. |
| c6 | A correct password proves only that you know it now. |
| c7 | There are one-time codes: SMS, email, TOTP. |
| c8 | They are convenient, relayable, and not phishing-resistant. |
| c9 | For stronger proof, a passkey uses WebAuthn to create a key pair. |
| c10 | The server keeps the public key; the private key signs for this site. |

## session · 无章节卡

预估 41.7 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s1 | Third: after login, how does the site remember you? |
| s2 | HTTP does not remember the last request. |
| s3 | The classic way: a random ID in a cookie. |
| s4 | The browser sends it; the server checks a session store. |
| s5 | Another way: sign identity into a token, with no session store. |
| s6 | A JWT is such a token: signed, not encrypted by default. |
| s7 | A signature proves integrity, not secrecy. Do not put secrets in it. |
| s8 | Cookie and token are both bearer: whoever holds it is you. |
| s9 | So: short-lived, audience-bound, revocable, and rotated after login. |

## federation · 无章节卡

预估 32.9 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| f1 | Sometimes another site does the proving. |
| f2 | Click “Sign in with Google” and you leave this site. |
| f3 | OAuth 2.0 is authorization: what you may do, not who you are. |
| f4 | OIDC adds an identity layer and returns an ID token. |
| f5 | Code: short-lived, single-use, bound; PKCE verifies. |
| f6 | Enterprises use SAML SSO: one login, many apps. |
| f7 | Federation moves trust; it does not remove risk. |

## attacks · 无章节卡

预估 32.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| a1 | All these mechanisms fear a few things. |
| a2 | Phishing: a fake site takes a password or OTP. |
| a3 | Credential stuffing: trying passwords leaked elsewhere. |
| a4 | XSS reads cookies that lack HttpOnly. |
| a5 | CSRF sends the cookie via your browser; SameSite blocks it. |
| a6 | Fixation plants an ID; without rotation, it takes over. |
| a7 | A JWT: whoever holds it uses it until expiry. |

## close · 无章节卡

预估 19.4 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| e1 | So login is not just a password question. |
| e2 | It is three things: claim, proof, memory. |
| e3 | Add federation and attacks; every link has assumptions. |
| e4 | Verifying you means making every link hard to impersonate. |
| e5 | And “you” is a set of verifiable credentials. |

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
