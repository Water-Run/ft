# 文案校对稿 · SSH in 256 Seconds: What Happens Before the Login Prompt

- 语言：en
- 内容 SHA-256：`027d26c337ec59e967356a1dd9012d38c253fd9b6a20cfba5bc032109f884598`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：263.2 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

写稿与交审前读一遍本阶段的经验规则：`node kit/tools/lessons.js show --stage script`。

## 连贯阅读

先通读问题、解释与章节推进，再到逐句表定位意见。下文按源稿顺序连接字幕，保留原文字与标点；不含静默 cue。口播读法与停顿另按配音规则核对。

### open · 无章节卡

Type *ssh*, press Enter. The screen goes quiet for a second. The key never crosses the wire, and the private key never leaves the machine. Still, the two computers open an encrypted connection. What runs that second is *SSH*: a remote-login protocol, not the name of one program. Across a network, it has to stop eavesdropping, and stop impersonation. Before you are logged in, the two machines pass four gates. Agree an algorithm both sides can use. Make a key, and do not send that key. Check the host: is it still the machine from last time? Prove yourself. The private key stays. A signature goes out.

### what · 无章节卡

In 1995, Tatu Ylonen published the first version. In 2006 its transport layer became a standard, *RFC 4253*. The ssh program in common use is maintained by developers of the OpenBSD project.

### kex · 无章节卡

Once connected, they announce versions before any key. Each side learns which version of *SSH* the other speaks. Then each side sends its full list of algorithms. The list holds ciphers, key exchange, and host-key algorithms. Each list is ordered by that side's preference. For the cipher, walk down your list. Take the first one the other side also has. If nothing overlaps, the connection drops. On this test connection, three names were chosen. Key exchange: *curve25519-sha256*. Host identity: *ssh-ed25519*. Encryption: *chacha20-poly1305*. These are this negotiation's results, not the standard's required set.

### dh · 无章节卡

With the algorithms set, they make a key. The standard first describes an older method, Diffie-Hellman. Each side keeps a secret and computes the same key. That key itself is not transmitted. This connection did not use that method. It used the one just chosen. Afterward, both machines hold one shared secret. Later encryption depends on that shared secret. It is not itself the key that encrypts the packets. It is transformed once, locally, into the packet keys. The keys are ready. One doubt remains. A shared secret does not tell you which server that is.

### hostkey · 无章节卡

The other side shows a long-term host key. It says: I am still the machine from last time. The exchange collapses into a hash, a short digest. The server signs that digest with its host private key. Your computer checks it with the host public key. A mismatch drops the connection. A valid signature is not enough. *known_hosts* stores the server fingerprint this computer kept. If that identity changes later, the computer errors at once. If a record already exists, the public key must match it.

### edge · 无章节卡

On the first connection, there is no old record. By default it stops and asks. It writes the identity only after you agree. Accepting it without checking the fingerprint does not stop an impersonator. From that first yes, you can record the wrong machine as the real one.

### userauth · 无章节卡

After both sides announce the new keys, later traffic is encrypted. Only then does the server ask you to prove who you are. This test connection used a public key. No password. Two different keys. Your computer just checked the server's host public key. The key that proves you is a different private key, and it stays with you. That private key never goes to the server. The wire carries your public key and a signature. The server checks the signature with your public key, then lets you in.

### close · 无章节卡

From the Enter key to a real login. Agree encryption, make a key, check the server, prove yourself. The shared secret is not sent. Each private key stays home. In that quiet second, the four gates are already done. The only yes still required of you is the first time you record the other side.

## 逐句校对

### open · 无章节卡

预估 44.3 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s01 | Type *ssh*, press Enter. The screen goes quiet for a second. |
| s02 | The key never crosses the wire, and the private key never leaves the machine. Still, the two computers open an encrypted connection. |
| s03 | What runs that second is *SSH*: a remote-login protocol, not the name of one program. |
| s04 | Across a network, it has to stop eavesdropping, and stop impersonation. |
| s05 | Before you are logged in, the two machines pass four gates. |
| s06 | Agree an algorithm both sides can use. |
| s07 | Make a key, and do not send that key. |
| s08 | Check the host: is it still the machine from last time? |
| s09 | Prove yourself. The private key stays. A signature goes out. |

### what · 无章节卡

预估 13.5 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s10 | In 1995, Tatu Ylonen published the first version. |
| s11 | In 2006 its transport layer became a standard, *RFC 4253*. |
| s12 | The ssh program in common use is maintained by developers of the OpenBSD project. |

### kex · 无章节卡

预估 40.4 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s13 | Once connected, they announce versions before any key. |
| s14 | Each side learns which version of *SSH* the other speaks. |
| s15 | Then each side sends its full list of algorithms. |
| s16 | The list holds ciphers, key exchange, and host-key algorithms. |
| s17 | Each list is ordered by that side's preference. |
| s18 | For the cipher, walk down your list. |
| s19 | Take the first one the other side also has. |
| s20 | If nothing overlaps, the connection drops. |
| s21 | On this test connection, three names were chosen. |
| s22 | Key exchange: *curve25519-sha256*. |
| s23 | Host identity: *ssh-ed25519*. |
| s24 | Encryption: *chacha20-poly1305*. |
| s25 | These are this negotiation's results, not the standard's required set. |

### dh · 无章节卡

预估 40.9 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s26 | With the algorithms set, they make a key. |
| s27 | The standard first describes an older method, Diffie-Hellman. |
| s28 | Each side keeps a secret and computes the same key. |
| s29 | That key itself is not transmitted. |
| s30 | This connection did not use that method. It used the one just chosen. |
| s31 | Afterward, both machines hold one shared secret. |
| s32 | Later encryption depends on that shared secret. |
| s33 | It is not itself the key that encrypts the packets. |
| s34 | It is transformed once, locally, into the packet keys. |
| s35 | The keys are ready. One doubt remains. |
| s36 | A shared secret does not tell you which server that is. |

### hostkey · 无章节卡

预估 36.7 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s37 | The other side shows a long-term host key. |
| s38 | It says: I am still the machine from last time. |
| s39 | The exchange collapses into a hash, a short digest. |
| s40 | The server signs that digest with its host private key. |
| s41 | Your computer checks it with the host public key. A mismatch drops the connection. |
| s42 | A valid signature is not enough. |
| s43 | *known_hosts* stores the server fingerprint this computer kept. |
| s44 | If that identity changes later, the computer errors at once. |
| s45 | If a record already exists, the public key must match it. |

### edge · 无章节卡

预估 19.9 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s46 | On the first connection, there is no old record. |
| s47 | By default it stops and asks. It writes the identity only after you agree. |
| s48 | Accepting it without checking the fingerprint does not stop an impersonator. |
| s49 | From that first yes, you can record the wrong machine as the real one. |

### userauth · 无章节卡

预估 36.9 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s50 | After both sides announce the new keys, later traffic is encrypted. |
| s51 | Only then does the server ask you to prove who you are. |
| s52 | This test connection used a public key. No password. |
| s53 | Two different keys. Your computer just checked the server's host public key. |
| s54 | The key that proves you is a different private key, and it stays with you. |
| s55 | That private key never goes to the server. |
| s56 | The wire carries your public key and a signature. |
| s57 | The server checks the signature with your public key, then lets you in. |

### close · 无章节卡

预估 23.1 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s58 | From the Enter key to a real login. |
| s59 | Agree encryption, make a key, check the server, prove yourself. |
| s60 | The shared secret is not sent. Each private key stays home. |
| s61 | In that quiet second, the four gates are already done. |
| s62 | The only yes still required of you is the first time you record the other side. |

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
