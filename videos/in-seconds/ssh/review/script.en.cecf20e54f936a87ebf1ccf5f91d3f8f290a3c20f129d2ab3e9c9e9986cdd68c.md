# 文案校对稿 · SSH in 256 Seconds: What Happens Before the Login Prompt

- 语言：en
- 内容 SHA-256：`cecf20e54f936a87ebf1ccf5f91d3f8f290a3c20f129d2ab3e9c9e9986cdd68c`
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

Type the *ssh* command, press Enter. Silence. In that second, both sides first announce a version. Then they make a key, and check the server. This is called *SSH*. We follow one connection.

### what · 无章节卡

*SSH* is a protocol, not a program. In 1995, Tatu Ylonen published the first version. In 2006 it became a standard, RFC *4253*. It has two layers. The lower one checks the server first. This layer does not check who you are. Who you are waits for the upper layer, later in this film. Today's *ssh* is maintained by OpenBSD project developers.

### kex · 无章节卡

After the versions, each side sends a list. Each list names supported algorithms, by preference. The cipher is the first on the client list the server has. With none in common, both sides disconnect. This connection uses OpenSSH 9.5p2 for Windows. Key exchange uses *curve25519-sha256*. The host identity uses *ssh-ed25519*. Encryption uses *chacha20-poly1305*. These are this connection's results, not the spec's required set.

### dh · 无章节卡

The spec first describes another method, *Diffie-Hellman*. Each side keeps a secret and sends a computed number. Both sides each compute the same key. That key itself is not transmitted. This connection did not use that method. The log names *curve25519-sha256*. Key exchange alone does not identify the server.

### hostkey · 无章节卡

The server has an identity key, the host key. The server signs a hash from this exchange. The server signs that hash with the host private key. The client checks the signature; mismatch ends it. It must match the copy stored locally. The local file holding these keys is *known_hosts*. On the first connection there is nothing to compare. By default it asks a person, then writes the file. After that, a changed host key is reported immediately.

### derive · 无章节卡

Identity settled, the number must become real keys. Hash repeatedly, adding a letter each time. Six hashes, the letters A through F. A and B are the initial vectors per direction. C and D are encryption keys, E and F integrity. From then on, everything sent is encrypted. Even the header is encrypted. Nothing shows outside. Every packet carries a check code. Each side then sends one message. The next packets use the new keys.

### userauth · 无章节卡

The server is settled. Now you must prove who you are. The client requests the auth service, *ssh-userauth*. Public key is the only method that must be implemented. The client offers the public key; the server acknowledges. The client signs with the private key: session id, user name. The server checks the signature with the public key, then admits you. The private key never leaves this machine. This connection used public key. No password was involved.

### edge · 无章节卡

One place to watch. On the first connection, there is no old record. Accepting it unchecked does not stop an impersonator.

### close · 无章节卡

So that second did four things. Agree the algorithms. Make a key. Check the server. Prove yourself. All four were done before the prompt.

## 逐句校对

### open · 无章节卡

预估 17.9 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| o1 | Type the *ssh* command, press Enter. Silence. |
| o2 | In that second, both sides first announce a version. |
| o3 | Then they make a key, and check the server. |
| o4 | This is called *SSH*. We follow one connection. |
| oT | （无旁白；画面停留） |

### what · 无章节卡

预估 27.2 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| w1 | *SSH* is a protocol, not a program. |
| w2 | In 1995, Tatu Ylonen published the first version. |
| w3 | In 2006 it became a standard, RFC *4253*. |
| w4 | It has two layers. The lower one checks the server first. |
| w5 | This layer does not check who you are. |
| w6 | Who you are waits for the upper layer, later in this film. |
| w7 | Today's *ssh* is maintained by OpenBSD project developers. |

### kex · 无章节卡

预估 38.2 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| k1 | After the versions, each side sends a list. |
| k2 | Each list names supported algorithms, by preference. |
| k3 | The cipher is the first on the client list the server has. |
| k4 | With none in common, both sides disconnect. |
| k5 | This connection uses OpenSSH 9.5p2 for Windows. |
| k6 | Key exchange uses *curve25519-sha256*. |
| k7 | The host identity uses *ssh-ed25519*. |
| k8 | Encryption uses *chacha20-poly1305*. |
| k9 | These are this connection's results, not the spec's required set. |

### dh · 无章节卡

预估 25.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| d1 | The spec first describes another method, *Diffie-Hellman*. |
| d2 | Each side keeps a secret and sends a computed number. |
| d3 | Both sides each compute the same key. |
| d4 | That key itself is not transmitted. |
| d5 | This connection did not use that method. |
| d6 | The log names *curve25519-sha256*. |
| d7 | Key exchange alone does not identify the server. |

### hostkey · 无章节卡

预估 34.4 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| h1 | The server has an identity key, the host key. |
| h2 | The server signs a hash from this exchange. |
| h3 | The server signs that hash with the host private key. |
| h4 | The client checks the signature; mismatch ends it. |
| h5 | It must match the copy stored locally. |
| h6 | The local file holding these keys is *known_hosts*. |
| h7 | On the first connection there is nothing to compare. |
| h8 | By default it asks a person, then writes the file. |
| h9 | After that, a changed host key is reported immediately. |

### derive · 无章节卡

预估 33.8 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| r1 | Identity settled, the number must become real keys. |
| r2 | Hash repeatedly, adding a letter each time. |
| r3 | Six hashes, the letters A through F. |
| r4 | A and B are the initial vectors per direction. |
| r5 | C and D are encryption keys, E and F integrity. |
| r6 | From then on, everything sent is encrypted. |
| r7 | Even the header is encrypted. Nothing shows outside. |
| r8 | Every packet carries a check code. |
| r9 | Each side then sends one message. The next packets use the new keys. |

### userauth · 无章节卡

预估 32.8 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| a1 | The server is settled. Now you must prove who you are. |
| a2 | The client requests the auth service, *ssh-userauth*. |
| a3 | Public key is the only method that must be implemented. |
| a4 | The client offers the public key; the server acknowledges. |
| a5 | The client signs with the private key: session id, user name. |
| a6 | The server checks the signature with the public key, then admits you. |
| a7 | The private key never leaves this machine. |
| a8 | This connection used public key. No password was involved. |

### edge · 无章节卡

预估 10.2 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| e1 | One place to watch. |
| e2 | On the first connection, there is no old record. |
| e3 | Accepting it unchecked does not stop an impersonator. |

### close · 无章节卡

预估 28.6 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| c1 | So that second did four things. |
| c2 | Agree the algorithms. |
| c3 | Make a key. |
| c4 | Check the server. |
| c5 | Prove yourself. |
| c6 | All four were done before the prompt. |

### outro · 无章节卡

预估 8.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| z1 | （无旁白；画面停留） |

## 交审核对

- 标题、开头和结尾回答同一个问题。
- 术语第一次出现有解释；因果、适用范围、版本和数字对应 FACTS.md。
- 根据句号逐条核对译文，记录简化与推断；片尾名单留足阅读时间。
- 有疑问的地方逐条写入 NOTES.md，关闭意见后由指定校对者明确确认。
