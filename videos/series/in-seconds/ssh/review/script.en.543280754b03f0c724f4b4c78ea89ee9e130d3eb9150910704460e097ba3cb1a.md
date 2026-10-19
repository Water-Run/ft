# 文案校对稿 · SSH in 256 Seconds: What Happens Before the Login Prompt

- 语言：en
- 内容 SHA-256：`543280754b03f0c724f4b4c78ea89ee9e130d3eb9150910704460e097ba3cb1a`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：256.0 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

反馈应用：[逐项记录](feedback.json)。交审时同时核对 Lean 4 负面案例、单集独立理解、中文释义与口播负担。

## open · 无章节卡

预估 17.9 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| o1 | Type the *ssh* command, press Enter. Silence. |
| o2 | Both machines agreed a key nobody else can compute. |
| o3 | The server shows who it is. Then you get in. |
| o4 | This is called *SSH*. We take it apart. |
| oT | （无旁白；画面停留） |

## what · 无章节卡

预估 27.2 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| w1 | *SSH* is a protocol, not a program. |
| w2 | In 1995, Tatu Ylonen published the first version. |
| w3 | In 2006 it became a standard, RFC *4253*. |
| w4 | It has several layers; this film covers the bottom one. |
| w5 | This layer proves who the server is, never who you are. |
| w6 | Proving who you is a protocol one layer up. |
| w7 | The *ssh* used today comes from the OpenBSD project. |

## kex · 无章节卡

预估 32.4 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| k1 | Once connected, both sides send a list. |
| k2 | Each list names supported algorithms, by preference. |
| k3 | The cipher is the first on the client list the server has. |
| k4 | With none in common, both sides disconnect. |
| k5 | The software here is OpenSSH 9.5p2. |
| k6 | Key exchange uses *curve25519-sha256*. |
| k7 | The host identity uses *ssh-ed25519*. |
| k8 | Encryption uses *chacha20-poly1305*. |

## dh · 无章节卡

预估 32.5 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| d1 | Both sides compute half of the key. |
| d2 | The method is called *Diffie-Hellman*. |
| d3 | The client picks x, computes e, sends it. |
| d4 | The server picks y, computes f, sends back. |
| d5 | Each multiplies the other number by its secret. |
| d6 | Both sides get the same number. Only they can. |
| d7 | That shared key was never transmitted. |
| d8 | A listener sees e and f, cannot compute it. |
| d9 | But this does not identify the server. Separate step. |

## hostkey · 无章节卡

预估 35.1 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| h1 | The server has an identity key, the host key. |
| h2 | The shared number and both IDs hash into one. |
| h3 | The server signs that hash with the host private key. |
| h4 | The client checks the signature; mismatch ends it. |
| h5 | It must match the copy stored locally. |
| h6 | The local file holding these keys is *known_hosts*. |
| h7 | On the first connection there is nothing to compare. |
| h8 | By default it asks a person, then writes the file. |
| h9 | After that, a changed host key is reported immediately. |

## derive · 无章节卡

预估 29.3 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| r1 | Identity settled, the number must become real keys. |
| r2 | Hash repeatedly, adding a letter each time. |
| r3 | Six hashes, the letters A through F. |
| r4 | A and B are the initial vectors per direction. |
| r5 | C and D are encryption keys, E and F integrity. |
| r6 | From then on, everything sent is encrypted. |
| r7 | Even the header is encrypted. Nothing shows outside. |
| r8 | Every packet carries a check code; long transfers rekey. |

## userauth · 无章节卡

预估 33.3 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| a1 | The server is settled. Now you must prove who you are. |
| a2 | The client requests the auth service, *ssh-userauth*. |
| a3 | Public key is the one auth method that must be implemented. |
| a4 | The client offers the public key; the server acknowledges. |
| a5 | The client signs with the private key: session id, user name. |
| a6 | The server checks the signature with the public key, then admits you. |
| a7 | The private key never leaves this machine. |
| a8 | This connection used public key. No password was involved. |

## edge · 无章节卡

预估 29.7 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| e1 | There are three places to watch. |
| e2 | First: on the first connection there is no record to compare. |
| e3 | Second: forwarding the agent hands over your keys’ use. |
| e4 | Anyone reaching the agent there can log in as you. |
| e5 | Third: port forwarding opens another channel in the tunnel. |
| e6 | How far it reaches depends on both ends, not encryption. |
| e7 | One more rule: after a gigabyte or an hour, keys change. |

## close · 无章节卡

预估 10.7 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| c1 | In that second, four things happened. |
| c2 | Negotiate, agree a key, verify server, prove yourself. |
| c3 | All four were done before the prompt appeared. |

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
