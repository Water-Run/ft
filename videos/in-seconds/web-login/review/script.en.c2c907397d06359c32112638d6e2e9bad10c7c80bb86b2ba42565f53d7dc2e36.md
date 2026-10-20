# 文案校对稿 · Web Login in 200 Seconds: How a Site Checks That You Are You

- 语言：en
- 内容 SHA-256：`c2c907397d06359c32112638d6e2e9bad10c7c80bb86b2ba42565f53d7dc2e36`
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
| o1 | This string is not your name or password. |
| o2 | But the site sees it and knows you. |
| o3 | After login, the server sends this. |
| o4 | A temporary pass: a session ID. |
| o5 | Why can it stand for you? |

## password · 无章节卡

预估 31.6 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| p1 | What happens in a login. |
| p2 | The browser sends it over TLS. |
| p4 | It stores a salt and a slow hash. |
| p5 | A salt makes identical passwords hash differently. |
| p6 | A slow hash deliberately takes work. |
| p7 | At login, it recomputes the same way. |
| p8 | A leak exposes hashes, not passwords. |
| p9 | A correct password proves only that you know it. |
| p10 | The next request does not carry the password. |

## session · 无章节卡

预估 35.4 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s1 | The server has to remember that it was you. |
| s2 | It creates a meaningless session identifier. |
| s3 | It puts it in Set-Cookie and gives it to the browser. |
| s4 | Every later request carries it automatically. |
| s5 | The server looks it up and finds your identity. |
| s6 | Whoever holds the ID is treated as you. |
| s7 | The cookie has Secure, HttpOnly, and SameSite. |
| s8 | Rotate the ID after login; invalidate it on logout. |

## attacks · 无章节卡

预估 28.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| a1 | This pass has three common theft paths. |
| a2 | XSS lets an attacker’s script read the cookie. |
| a3 | CSRF makes the browser send the request for you. |
| a4 | Session fixation plants an ID on you first. |
| a5 | You log in with it, and the attacker takes over. |

## factors · 无章节卡

预估 32.7 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| f1 | A password alone stops neither phishing nor stuffing. |
| f2 | Factors are knowledge, possession, and inherence. |
| f3 | An SMS code can be relayed live. |
| f4 | OTP can be relayed by a fake site. |
| f5 | AAL2 requires two different factors. |
| f6 | WebAuthn has an authenticator create a key pair. |
| f7 | The server stores the public key and sends a challenge. |
| f8 | The credential is bound to the origin, so phishing fails. |

## federated · 无章节卡

预估 31.7 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| g1 | Another login lets a different site vouch for you. |
| g2 | Click “Sign in with Google” and you leave this site. |
| g3 | OAuth 2.0 is authorization, not authentication. |
| g4 | The code is short-lived, single-use, and bound to the redirect. |
| g5 | PKCE stops an intercepted code from becoming a token. |
| g6 | The ID token is signed, not encrypted. |
| g7 | OIDC adds an identity layer on top of OAuth. |

## close · 无章节卡

预估 15.1 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| c1 | The password proves knowledge; the cookie proves this session. |
| c2 | MFA proves you have something else. |
| c3 | Every link has assumptions; attackers pick the weakest. |
| c4 | Verifying you means making every step hard to impersonate. |

## outro · 无章节卡

预估 7.5 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| z1 | （无旁白；画面停留） |

## 交审核对

- 标题、开头和结尾回答同一个问题。
- 术语第一次出现有解释；因果、适用范围、版本和数字对应 FACTS.md。
- 根据句号逐条核对译文，记录简化与推断；片尾名单留足阅读时间。
- 有疑问的地方逐条写入 NOTES.md，关闭意见后由指定校对者明确确认。
