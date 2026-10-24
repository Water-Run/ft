# 文案校对稿 · SSH in 256 Seconds: How a Connection Is Made

- 语言：en
- 内容 SHA-256：`9bef868192491c6ca8c2cf6ca1718bb6ddd7e40bf8fe750b8543c8a03a2c016b`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：256.0 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

写稿与交审前读一遍本阶段的经验规则：`node kit/tools/lessons.js show --stage script`。

## 连贯阅读

先通读问题、解释与章节推进，再到逐句表定位意见。下文按源稿顺序连接字幕，保留原文字与标点；不含静默 cue。口播读法与停顿另按配音规则核对。

### open · 无章节卡

Type *ssh*, press Enter, and wait a moment to get in. In that moment, over a line anyone can listen to, two machines agree on a key only they know. They also make sure the server is real, and that you are you. These rules are *SSH*: a remote-login protocol. Let's follow one real connection, step by step.

### what · 无章节卡

Tatu Ylonen released the first version in 1995. In 2006 its transport layer became the standard *RFC 4253*. Today's common OpenSSH is maintained by OpenBSD developers.

### kex · 无章节卡

In our test, the client connects to port 2222 on this computer. Once connected, both sides announce their version: *SSH-2.0*. Next, each side sends a list of algorithms. It has columns: how to make the key, prove identity, and encrypt. Each column is ranked by preference, favorite first. For encryption: the client's top choice the server also supports. If they share none, the connection drops. This time, the three picks were: key exchange *curve25519*, identity *ed25519*, encryption *chacha20*.

### dh · 无章节卡

Now the key. The trouble: anyone can see the bytes on the line. The method is called Diffie-Hellman key exchange. Each side picks a secret number and never sends it. From it, each computes a public number and sends that over. Each takes the other's public number with its own secret, and both get exactly the same result. That result is the *shared secret*. It never appeared on the line. Only the two public numbers crossed the line. This run's curve25519 does the same thing on an elliptic curve. From it, both sides derive the keys that encrypt the data.

### hostkey · 无章节卡

The key is ready. But is that really your server? The exchange alone can't tell who is on the other end. So the server keeps a long-term *host key*. It folds the exchange into a digest, signs it with its host private key, and sends it along with its host public key. Your computer checks the signature with that key. A mismatch ends it.

### edge · 无章节卡

But is that key the real server's? Your computer checks *known_hosts*. After a first visit, its key is recorded there. If it changes, ssh refuses. On a first visit there is no record, so ssh asks: trust this fingerprint? Say yes without checking, and an impostor gets recorded as real.

### userauth · 无章节卡

Then both switch to the new keys; everything after is encrypted. Last step: prove you are you. This test logs in with a public key, not a password. Your public key sits on the server; your private key stays on your computer. Your computer signs data that includes this session's ID and your username. The server checks it with your public key, then lets you in. The private key never left your computer.

### close · 无章节卡

Looking back, that moment held four steps: the algorithms, the key, the server, and you. The key was computed on each side and never sent. Private keys stayed home; only public numbers and signatures crossed the line. The one thing left to you: check the fingerprint on a first connection.

## 逐句校对

### open · 无章节卡

预估 25.7 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s01 | Type *ssh*, press Enter, and wait a moment to get in. |
| s02 | In that moment, over a line anyone can listen to, |
| s03 | two machines agree on a key only they know. |
| s04 | They also make sure the server is real, and that you are you. |
| s05 | These rules are *SSH*: a remote-login protocol. |
| s06 | Let's follow one real connection, step by step. |

### what · 无章节卡

预估 15.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s07 | Tatu Ylonen released the first version in 1995. |
| s08 | In 2006 its transport layer became the standard *RFC 4253*. |
| s09 | Today's common OpenSSH is maintained by OpenBSD developers. |

### kex · 无章节卡

预估 42.8 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s10 | In our test, the client connects to port 2222 on this computer. |
| s11 | Once connected, both sides announce their version: *SSH-2.0*. |
| s12 | Next, each side sends a list of algorithms. |
| s13 | It has columns: how to make the key, prove identity, and encrypt. |
| s14 | Each column is ranked by preference, favorite first. |
| s15 | For encryption: the client's top choice the server also supports. |
| s16 | If they share none, the connection drops. |
| s17 | This time, the three picks were: |
| s18 | key exchange *curve25519*, identity *ed25519*, encryption *chacha20*. |

### dh · 无章节卡

预估 45.6 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s19 | Now the key. The trouble: anyone can see the bytes on the line. |
| s20 | The method is called Diffie-Hellman key exchange. |
| s21 | Each side picks a secret number and never sends it. |
| s22 | From it, each computes a public number and sends that over. |
| s23 | Each takes the other's public number with its own secret, |
| s24 | and both get exactly the same result. |
| s25 | That result is the *shared secret*. It never appeared on the line. |
| s26 | Only the two public numbers crossed the line. |
| s27 | This run's curve25519 does the same thing on an elliptic curve. |
| s28 | From it, both sides derive the keys that encrypt the data. |

### hostkey · 无章节卡

预估 28.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s29 | The key is ready. But is that really your server? |
| s30 | The exchange alone can't tell who is on the other end. |
| s31 | So the server keeps a long-term *host key*. |
| s32 | It folds the exchange into a digest, signs it with its host private key, |
| s33 | and sends it along with its host public key. |
| s34 | Your computer checks the signature with that key. A mismatch ends it. |

### edge · 无章节卡

预估 21.9 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s35 | But is that key the real server's? Your computer checks *known_hosts*. |
| s36 | After a first visit, its key is recorded there. If it changes, ssh refuses. |
| s37 | On a first visit there is no record, so ssh asks: trust this fingerprint? |
| s38 | Say yes without checking, and an impostor gets recorded as real. |

### userauth · 无章节卡

预估 31.9 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s39 | Then both switch to the new keys; everything after is encrypted. |
| s40 | Last step: prove you are you. |
| s41 | This test logs in with a public key, not a password. |
| s42 | Your public key sits on the server; your private key stays on your computer. |
| s43 | Your computer signs data that includes this session's ID and your username. |
| s44 | The server checks it with your public key, then lets you in. |
| s45 | The private key never left your computer. |

### close · 无章节卡

预估 37.5 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s46 | Looking back, that moment held four steps: |
| s47 | the algorithms, the key, the server, and you. |
| s48 | The key was computed on each side and never sent. |
| s49 | Private keys stayed home; only public numbers and signatures crossed the line. |
| s50 | The one thing left to you: check the fingerprint on a first connection. |

### outro · 无章节卡

预估 7.5 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| z1 | （无旁白；画面停留） |

## 交审核对

- 标题、开头和结尾回答同一个问题。
- 术语第一次出现有解释；因果、适用范围、版本和数字对应 FACTS.md。
- 根据句号逐条核对译文，记录简化与推断；片尾名单留足阅读时间。
- 有疑问的地方逐条写入 NOTES.md，关闭意见后由指定校对者明确确认。
