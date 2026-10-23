# 文案校对稿 · SSH in 256 Seconds: What Happens Before the Login Prompt

- 语言：en
- 内容 SHA-256：`a2ebdd56e67314f0a1af226dc6c90b0a7f458346704e465ecffd074d5122c7ce`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：320.6 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

写稿与交审前读一遍本阶段的经验规则：`node kit/tools/lessons.js show --stage script`。

## 连贯阅读

先通读问题、解释与章节推进，再到逐句表定位意见。下文按源稿顺序连接字幕，保留原文字与标点；不含静默 cue。口播读法与停顿另按配音规则核对。

### open · 无章节卡

Type *ssh* and press Enter. The screen always goes quiet for a second. The key stays off the wire. The private key stays home. The link still encrypts. What governs that second is *SSH*: a remote-login protocol, not one program's name. Across the network it stops eavesdropping, and it stops a fake server. Before the login succeeds, the two machines must pass four gates. Match algorithms. Choose encryption both sides know. Make a key, and do not send that key across the network. Check the host. Confirm it is still the machine from last time. Prove yourself. The private key stays. The signature goes out.

### what · 无章节卡

In 1995, Tatu Ylonen published its first version. In 2006 its transport layer became the standard *RFC 4253*. Today's usual ssh program is maintained by OpenBSD project developers.

### kex · 无章节卡

Once online, they do not rush the key. First they exchange version strings. Each side thus confirms which version of *SSH* the other is speaking. Versions settled, each side sends a complete list of algorithms. The list is not only ciphers. It also names key exchange and host-identity algorithms. Every item is ranked by that side's own preference. The cipher rule is direct: walk your list from the top. Take the first one you have that the other side also has. That settles it. If the lists share nothing, the connection drops on the spot. On this test connection, the two sides settled on these three names. Key exchange: *curve25519-sha256*. Host identity: *ssh-ed25519*. Traffic encryption: *chacha20-poly1305*. These three are only this negotiation's result, not the mandatory list in the standard.

### dh · 无章节卡

Once the algorithms are set, the two machines begin to make a key. The standard first describes a classic method. Its name is Diffie-Hellman. Each side keeps a secret it does not send, and each computes the same key. That computed key itself does not travel the network. This connection did not use that method. It used the key exchange just chosen. When the exchange is done, both machines hold the same shared secret. The encryption that follows depends on that shared secret. But that shared secret is not the key that actually encrypts the packets. It still has to be changed once, locally, into the keys the packets use. The keys are ready. The danger is not gone. A shared secret alone still cannot tell you which server is on the other side.

### hostkey · 无章节卡

The other side must show who it is: a long-term host key. It is there to prove: I am still the machine from last time. The exchange so far is folded into a hash: a short digest. The server signs that short digest with its own host private key. Your computer checks it with the host public key. If it fails, the link drops. A signature that checks out is still not enough. Your computer keeps a *known_hosts* record: the server fingerprint it stored. If the server's identity changes later, the computer reports an error at once. If a record already exists, this public key must match it exactly.

### edge · 无章节卡

But on the first connection, your computer has no old record to compare. By default the program stops and asks. It records the identity only after you agree. Accept it then without checking the fingerprint, and an impersonator is not stopped. From the first connection, you may store an impostor as the real server.

### userauth · 无章节卡

Only after both sides announce the new keys does later traffic become encrypted. After the server is recognized, it is finally your turn to prove you are you. This test connection used a public key. It never used a password. Two jobs. Your computer just checked the server's host public key. What proves you now is another private key, the one you keep yourself. Your private key stays on this machine. It is not sent to the server. Only your public key, and a signature from the private key, cross the network. The server checks the signature with your public key, then lets you in.

### close · 无章节卡

From pressing Enter, to a login that has actually succeeded. Match the encryption, make the key, recognize the server, then prove you are you. The shared secret does not cross the network. Neither private key leaves its machine. In that quiet second on the screen, the four gates are already finished. The only yes still yours is the first time you record the other side.

## 逐句校对

### open · 无章节卡

预估 43.6 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s01 | Type *ssh* and press Enter. The screen always goes quiet for a second. |
| s02 | The key stays off the wire. The private key stays home. The link still encrypts. |
| s03 | What governs that second is *SSH*: a remote-login protocol, not one program's name. |
| s04 | Across the network it stops eavesdropping, and it stops a fake server. |
| s05 | Before the login succeeds, the two machines must pass four gates. |
| s06 | Match algorithms. Choose encryption both sides know. |
| s07 | Make a key, and do not send that key across the network. |
| s08 | Check the host. Confirm it is still the machine from last time. |
| s09 | Prove yourself. The private key stays. The signature goes out. |

### what · 无章节卡

预估 15.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s10 | In 1995, Tatu Ylonen published its first version. |
| s11 | In 2006 its transport layer became the standard *RFC 4253*. |
| s12 | Today's usual ssh program is maintained by OpenBSD project developers. |

### kex · 无章节卡

预估 62.6 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s13 | Once online, they do not rush the key. First they exchange version strings. |
| s14 | Each side thus confirms which version of *SSH* the other is speaking. |
| s15 | Versions settled, each side sends a complete list of algorithms. |
| s16 | The list is not only ciphers. It also names key exchange and host-identity algorithms. |
| s17 | Every item is ranked by that side's own preference. |
| s18 | The cipher rule is direct: walk your list from the top. |
| s19 | Take the first one you have that the other side also has. That settles it. |
| s20 | If the lists share nothing, the connection drops on the spot. |
| s21 | On this test connection, the two sides settled on these three names. |
| s22 | Key exchange: *curve25519-sha256*. |
| s23 | Host identity: *ssh-ed25519*. |
| s24 | Traffic encryption: *chacha20-poly1305*. |
| s25 | These three are only this negotiation's result, not the mandatory list in the standard. |

### dh · 无章节卡

预估 55.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s26 | Once the algorithms are set, the two machines begin to make a key. |
| s27 | The standard first describes a classic method. Its name is Diffie-Hellman. |
| s28 | Each side keeps a secret it does not send, and each computes the same key. |
| s29 | That computed key itself does not travel the network. |
| s30 | This connection did not use that method. It used the key exchange just chosen. |
| s31 | When the exchange is done, both machines hold the same shared secret. |
| s32 | The encryption that follows depends on that shared secret. |
| s33 | But that shared secret is not the key that actually encrypts the packets. |
| s34 | It still has to be changed once, locally, into the keys the packets use. |
| s35 | The keys are ready. The danger is not gone. |
| s36 | A shared secret alone still cannot tell you which server is on the other side. |

### hostkey · 无章节卡

预估 45.2 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s37 | The other side must show who it is: a long-term host key. |
| s38 | It is there to prove: I am still the machine from last time. |
| s39 | The exchange so far is folded into a hash: a short digest. |
| s40 | The server signs that short digest with its own host private key. |
| s41 | Your computer checks it with the host public key. If it fails, the link drops. |
| s42 | A signature that checks out is still not enough. |
| s43 | Your computer keeps a *known_hosts* record: the server fingerprint it stored. |
| s44 | If the server's identity changes later, the computer reports an error at once. |
| s45 | If a record already exists, this public key must match it exactly. |

### edge · 无章节卡

预估 22.1 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s46 | But on the first connection, your computer has no old record to compare. |
| s47 | By default the program stops and asks. It records the identity only after you agree. |
| s48 | Accept it then without checking the fingerprint, and an impersonator is not stopped. |
| s49 | From the first connection, you may store an impostor as the real server. |

### userauth · 无章节卡

预估 42.9 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s50 | Only after both sides announce the new keys does later traffic become encrypted. |
| s51 | After the server is recognized, it is finally your turn to prove you are you. |
| s52 | This test connection used a public key. It never used a password. |
| s53 | Two jobs. Your computer just checked the server's host public key. |
| s54 | What proves you now is another private key, the one you keep yourself. |
| s55 | Your private key stays on this machine. It is not sent to the server. |
| s56 | Only your public key, and a signature from the private key, cross the network. |
| s57 | The server checks the signature with your public key, then lets you in. |

### close · 无章节卡

预估 26.8 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| s58 | From pressing Enter, to a login that has actually succeeded. |
| s59 | Match the encryption, make the key, recognize the server, then prove you are you. |
| s60 | The shared secret does not cross the network. Neither private key leaves its machine. |
| s61 | In that quiet second on the screen, the four gates are already finished. |
| s62 | The only yes still yours is the first time you record the other side. |

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
