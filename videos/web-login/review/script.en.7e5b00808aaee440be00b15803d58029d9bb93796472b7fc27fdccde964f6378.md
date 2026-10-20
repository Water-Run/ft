# 文案校对稿 · Web Login in 200 Seconds: How a Site Checks That You Are You

- 语言：en
- 内容 SHA-256：`7e5b00808aaee440be00b15803d58029d9bb93796472b7fc27fdccde964f6378`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：228.6 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

反馈应用：[逐项记录](feedback.json)。交审时同时核对 Lean 4 负面案例、单集独立理解、中文释义与口播负担。

## open · 无章节卡

预估 27.7 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| o1 | You enter your account and password, and log in. |
| o2 | After that, orders, a new address: it never asks again. |
| o3 | How does Web login work? |
| o3b | How does the server know that you are you? |
| oT | （无旁白；画面停留） |
| o4 | Three jobs. Recognizing you the first time: authentication. |
| o5 | Knowing you on every later request: the session. |
| o6 | What you may do: authorization. |

## session · 无章节卡

预估 43.1 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s1 | Sessions first. HTTP, the Web’s protocol, forgets each request. |
| s2 | So at login, the server writes down a session: |
| s3 | who you are, what you may do, when it expires. |
| s4 | then gives it a random number, the Session ID, |
| s5 | and hands it to the browser in a Cookie. |
| s6 | After that, the browser sends it with each request, |
| s7 | and the server looks the number up and knows you. |
| s8 | The Cookie only carries it; the server’s session remembers you. |
| s9 | The cost: whoever holds that number is you, to the server. |
| s10 | Another page’s request for you carries it too: cross-site request forgery. |

## jwt · 无章节卡

预估 41.8 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| j1 | On a big site, many servers must check one table. |
| j2 | Another way skips it: who you are goes on a ticket the server signs. |
| j3 | A common format is JWT: header, payload, signature. |
| j4 | It is only encoded, so anyone can read it; change one character and the signature fails. |
| j5 | Checking signature and expiry, a server knows you without a lookup. |
| j6 | The cost: once issued, a ticket is hard to take back early; |
| j7 | so it is kept short, and renewed with a long-lived one. |
| j7b | The short one is the Access Token; the long one, the Refresh Token. |

## authn · 无章节卡

预估 59.1 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| p1 | So how are you recognized the first time? |
| p2 | Take passwords: the server keeps only a hash that cannot be reversed. |
| p3 | What you type is hashed the same way; a match lets you in. |
| p3b | And it is slow on purpose: a stolen table is hard to guess back. |
| p4 | It proves you know a secret, but fake sites can steal it: phishing. |
| p5 | An SMS code proves you have the phone; fake sites relay it too. |
| p6 | A passkey differs: the device makes a key pair; the server keeps the public key. |
| p7 | At login you touch the sensor; the device signs a challenge with the private key; |
| p7b | the server checks it with the public key: it is you. |
| p8 | The key signs only for its own site; fakes get nothing usable. |
| p9 | Picture puzzles and sliders tell people from programs, not who you are. |

## oauth · 无章节卡

预估 38.2 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| a1 | With “sign in with another platform,” that platform checks you. |
| a2 | You log in there, agree, and come back with a one-time code, |
| a3 | which the site trades for tickets. |
| a3b | That flow is OAuth 2.0. |
| a4 | It is authorization: the Access Token only says what may be done. |
| a5 | Saying who you are takes a layer on top, OIDC: |
| a6 | a signed ID Token naming who you are and which site it is for. |
| a7 | The cost: trust concentrates. Lose that account, and those sites fall with it. |

## close · 无章节卡

预估 10.7 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| e1 | First, the proof you show; after that, the number or ticket you bring back. |
| e2 | The server never recognizes you, only the proof you present. |

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
