# 事实出处

取证日期：2026-10-19。对象是「一次 SSH 连接里，从敲下命令到登录成功之间发生了什么」。

本文件只登记陈述和依据，不规定片子的结构、时长分配、画面或措辞。事实只从本文件出（仓库 `AGENTS.md` 的边界）。

三个来源层次，本片全部用到：

| 层 | 材料 | 怎么用 |
|---|---|---|
| 亲手做实验取得 | 本机跑起来的一次真实 SSH 连接、一次性密钥生成 | 支撑「实际发生了什么」和画面上的每一个数字 |
| 原始规范 | RFC 4253（传输层）、RFC 4252（认证层）、OpenSSH 的 `ssh_config(5)`、`PROTOCOL` | 支撑机制与规则 |
| 官方文档与发布说明 | OpenSSH 9.8 发布说明、OpenSSH 项目页与历史页 | 支撑历史与算法现状 |

## 取证环境

| 材料 | 固定点 |
|---|---|
| 客户端与服务端 | `OpenSSH_for_Windows_9.5p2, LibreSSL 3.8.2`（同机，客户端 `ssh.exe` 与服务端 `sshd.exe` 都是这个版本）。Windows 11，build 10.0.26340 |
| 真实连接 | 本机回环地址 `127.0.0.1` 的临时端口 `2222`，用一次性 `sshd`（`LogLevel DEBUG3`）与 `ssh -vvv` 连了一次，认证成功。脚本 `research/lab/03_handshake.ps1`，完整回显 `out_03_handshake.txt` |
| 一次性密钥 | 每次运行临时生成，实验结束即删除；口令从环境变量取，不写进任何文件。脚本 `research/lab/01_keygen.ps1`，完整回显 `out_01_keygen.txt` |
| 本机能力清单 | `ssh -Q <类别>`。脚本 `research/lab/02_ssh_capabilities.ps1`，完整回显 `out_02_ssh_capabilities.txt` |
| RFC 4253 | <https://www.rfc-editor.org/rfc/rfc4253.txt>，2006-01，Standards Track，T. Ylonen / C. Lonvick（编）。本地下载 SHA-256 `B471173305154F6C66FACFFCF7A4A25FC5C32765CB30542120BE6C20A88F1ED3` |
| RFC 4252 | <https://www.rfc-editor.org/rfc/rfc4252.txt>，2006-01，Standards Track。本地下载 SHA-256 `A36B882CF77B107335D49921B5E955B4BA78E253205DFBCE5096EBC0E78BDF14` |
| `ssh_config(5)` | OpenSSH 官方仓库 `openssh/openssh-portable` 的 `master` 分支 `ssh_config.5`，版本行 `$OpenBSD: ssh_config.5,v 1.433 2026/10/09 08:25:28 dtucker Exp $`。读取日 2026-10-19 |
| `PROTOCOL` | 同上仓库 `master` 分支的 `PROTOCOL` 文件，开头自述为「OpenSSH's deviations and extensions to the published SSH protocol」。读取日 2026-10-19 |
| OpenSSH 9.8 发布说明 | <https://openssh.com/txt/release-9.8>，发布日 2024-07-01。读取日 2026-10-19 |
| OpenSSH 项目页与历史页 | <https://www.openssh.com/>、<https://www.openssh.com/history.html>。读取日 2026-10-19 |

**脱敏说明。** 三份回显里的本机用户目录一律替换为 `C:\Users\user`，本机用户名替换为 `ftlab`；一次性公钥的 base64 本体一律替换为占位符（只留长度）。替换规则写在 `research/lab/03_handshake.ps1` 的 `Mask` 函数里。`out_01_keygen.txt` 只记录结构与长度，不记录任何密钥字节。

## 它是什么

| 句号 | 陈述 | 出处与定位 | 核实方式 | 状态 |
|---|---|---|---|---|
| — | SSH 是「a protocol for secure remote login and other secure network services over an insecure network」 | RFC 4253 摘要 | 读原文 | 已读 |
| — | 该协议提供 strong encryption、server authentication（§1 写作 cryptographic host authentication）与 integrity protection | RFC 4253 摘要、§1 第 1 段 | 读原文 | 已读 |
| w1 | SSH 是一套协议，不是一个程序 | RFC 4253 摘要与 §1 都以「protocol」自述；协议文档本身定义了算法与消息格式 | 读原文；本片按 RFC 的划分讲传输层与认证层 | 已读 |
| w2 | 第一版由 Tatu Ylonen 于 1995 年 11 月发布 | RFC 4253 §15.2 Informative References：`[ssh-1.2.30] Ylonen, T., "ssh-1.2.30/RFC", File within compressed tarball ... November 1995` | 读原文 | 已读 |
| w3 | 2006 年 1 月定为标准文档，编号 RFC 4253，类别 Standards Track | RFC 4253 头部（Request for Comments: 4253，Standards Track，January 2006） | 读原文 | 已读 |
| w4 | 本片讲的是传输层协议 | RFC 4253 标题「The Secure Shell (SSH) Transport Layer Protocol」；RFC 4252 标题「The SSH Authentication Protocol」 | 读原文 | 已读 |
| w5 | 这一层只认服务器是谁，不做用户认证 | RFC 4253 §1：「Authentication in this protocol level is host-based; this protocol does not perform user authentication. A higher level protocol for user authentication can be designed on top of this protocol.」 | 读原文 | 已读 |
| w6 | OpenSSH 由 OpenBSD 项目的开发者维护，以 BSD 风格许可发布 | <https://www.openssh.com/>：「OpenSSH is developed by a few developers of the OpenBSD Project and made available under a BSD-style license.」 | 读原文 | 已读 |
| w7 | OpenSSH 源自 Ylonen 的 ssh 1.2.12，最初导入 OpenBSD 的日期是 1999-09-26，随 OpenBSD 2.6 于 1999-12-01 发布 | <https://www.openssh.com/history.html>：「OpenSSH is a derivative of the original free ssh 1.2.12 release from Tatu Ylönen」「The initial import was done on Sep 26, 1999」「That marked the OpenSSH 1.2.2 release, which was shipped with OpenBSD 2.6 on December 1, 1999.」 | 读原文 | 已读 |
| w8 | SSH 2 协议支持由 Markus Friedl 推进，OpenSSH 2.0 随 OpenBSD 2.7 于 2000-06-15 发布 | 同上 history.html「SSH 2 Protocol Support」段 | 读原文 | 已读 |

## 一次连接实际发生了什么

| 句号 | 陈述 | 出处与定位 | 核实方式 | 状态 |
|---|---|---|---|---|
| o2 | 连接建立后，两端要做的第一件事是交换版本标识串 | RFC 4253 §4.2：「When the connection has been established, both sides MUST send an identification string.」格式为 `SSH-protoversion-softwareversion SP comments CR LF`，本套协议的 `protoversion` 必须是 `2.0`，必须以单个 CR 加单个 LF 结束 | 读原文；实验回显 `debug1: Local version string SSH-2.0-OpenSSH_for_Windows_9.5` 与 `debug1: Remote protocol version 2.0, remote software version OpenSSH_for_Windows_9.5`（`out_03_handshake.txt`） | 已读与复现 |
| o2 | 跑在 TCP 上时，服务端通常监听 22 端口，该端口号已由 IANA 正式分配给 SSH | RFC 4253 §4.1：「the server normally listens for connections on port 22. This port number has been registered with the IANA, and has been officially assigned for SSH.」 | 读原文 | 已读 |
| k1 | 紧跟着双方各发一个 KEXINIT，里面是十一个 name-list 字段 | RFC 4253 §7.1：字段依次为 kex_algorithms、server_host_key_algorithms、encryption_algorithms（两个方向）、mac_algorithms（两个方向）、compression_algorithms（两个方向）、languages（两个方向）、first_kex_packet_follows、reserved uint32 | 读原文；实验回显 `debug1: SSH2_MSG_KEXINIT sent` / `SSH2_MSG_KEXINIT received` 与 `debug2: local client KEXINIT proposal` 的十一行 | 已读与复现 |
| k2 | 每个 name-list 按偏好从高到低排列，第一个是最想用的 | RFC 4253 §7.1：「Each supported (allowed) algorithm MUST be listed in order of preference, from most to least. The first algorithm in each name-list MUST be the preferred (guessed) algorithm.」 | 读原文 | 已读 |
| k3 | 加密算法的选取规则是「取客户端 name-list 上第一个也在服务端 list 里的」 | RFC 4253 §7.1 encryption_algorithms：「The chosen encryption algorithm to each direction MUST be the first algorithm on the client's name-list that is also on the server's name-list.」 | 读原文 | 已读 |
| k4 | 没有共同算法就必须断开 | RFC 4253 §7.1：「If there is no such algorithm, both sides MUST disconnect.」（kex、host key、encryption、mac 四处各有一句） | 读原文 | 已读 |
| k5 | 清单里带一个 16 字节的随机 cookie | RFC 4253 §7.1 字段表 `byte[16] cookie (random bytes)` 与「cookie」条：「The 'cookie' MUST be a random value generated by the sender.」 | 读原文 | 已读 |
| d1 | 密钥交换用 Diffie-Hellman：客户端取随机 x，算 e = g^x mod p 发给服务端 | RFC 4253 §8 第 1 步：「C generates a random number x (1 < x < q) and computes e = g^x mod p. C sends e to S.」其中 p 是大安全素数、g 是子群生成元、q 是子群阶 | 读原文 | 已读 |
| d2 | 服务端取随机 y，算 f = g^y mod p，算出共同值 K = e^y mod p | RFC 4253 §8 第 2 步 | 读原文 | 已读 |
| d3 | 两边各自算出同一个 K：服务端用 e^y，客户端用 f^x | RFC 4253 §8 第 2、3 步（`K = e^y mod p` 与 `K = f^x mod p`） | 读原文 | 已读 |
| d4 | 共同值 K 不经过网络传输 | RFC 4253 §8 中 K 由双方各自本地算出，只出现在哈希输入里，不在任何一条消息的字段中 | 读原文 | 已读 |
| d5 | e 或 f 不在 [1, p-1] 区间内不得发送或接受，否则密钥交换失败 | RFC 4253 §8：「Values of 'e' or 'f' that are not in the range [1, p-1] MUST NOT be sent or accepted by either side. If this condition is violated, the key exchange fails.」 | 读原文 | 已读 |
| h1 | 交换哈希 H 的输入是双方标识串、双方 KEXINIT、主机公钥 K_S、e、f、K | RFC 4253 §8 第 2 步：`H = hash(V_C || V_S || I_C || I_S || K_S || e || f || K)` | 读原文 | 已读 |
| h2 | 服务端用主机私钥对 H 签名，连同主机公钥 K_S 与 f 一起发回 | RFC 4253 §8 第 2 步与消息格式 `SSH_MSG_KEXDH_REPLY: string K_S / mpint f / string signature of H` | 读原文；实验回显 `debug1: SSH2_MSG_KEX_ECDH_REPLY received` | 已读与复现 |
| h3 | 客户端要确认 K_S 真的是这台服务器的主机密钥，并验证对 H 的签名 s | RFC 4253 §8 第 3 步：「C verifies that K_S really is the host key for S (e.g., using certificates or a local database). ... C then computes K = f^x mod p, H = hash(...), and verifies the signature s on H.」 | 读原文 | 已读 |
| h4 | 允许不验证就接受主机密钥，但这样会对主动攻击不安全 | RFC 4253 §8 第 3 步：「C is also allowed to accept the key without verification; however, doing so will render the protocol insecure against active attacks (but may be desirable for practical reasons in the short term in many environments).」 | 读原文 | 已读 |
| h5 | DH 交换本身不提供主机身份，它与主机密钥签名合起来才提供 | RFC 4253 §8 开头：「The key exchange is combined with a signature with the host key to provide host authentication.」 | 读原文 | 已读 |
| r1 | 密钥交换产出两个值：共享密钥 K 与交换哈希 H | RFC 4253 §7.2：「The key exchange produces two values: a shared secret K, and an exchange hash H.」 | 读原文 | 已读 |
| r2 | H 首次算出后兼作会话标识，之后即使重交换也不变 | RFC 4253 §7.2：「The exchange hash H from the first key exchange is additionally used as the session identifier ... Once computed, the session identifier is not changed, even if keys are later re-exchanged.」 | 读原文 | 已读 |
| r3 | 密钥派生是六次哈希，各带一个字母 A 到 F | RFC 4253 §7.2：初始 IV（c→s）= HASH(K‖H‖"A"‖session_id)、初始 IV（s→c）= "B"、加密密钥（c→s）= "C"、加密密钥（s→c）= "D"、完整性密钥（c→s）= "E"、完整性密钥（s→c）= "F" | 读原文 | 已读 |
| r4 | 哈希输出不够长时按 K1、K2、K3 顺序追加 | RFC 4253 §7.2：`K1 = HASH(K‖H‖X‖session_id)`、`K2 = HASH(K‖H‖K1)`、`K3 = HASH(K‖H‖K1‖K2)`、`key = K1‖K2‖K3‖...` | 读原文 | 已读 |
| r5 | 密钥交换以双方各发一个 SSH_MSG_NEWKEYS 结束，该消息用旧密钥发送，之后的消息用新密钥 | RFC 4253 §7.3：「Key exchange ends by each side sending an SSH_MSG_NEWKEYS message. This message is sent with the old keys and algorithms. All messages sent after this message MUST use the new keys and algorithms.」 | 读原文；实验回显 `debug1: SSH2_MSG_NEWKEYS sent` / `SSH2_MSG_NEWKEYS received` | 已读与复现 |
| r6 | 加密生效后，包长、包填充长度、载荷、填充四部分全部加密 | RFC 4253 §6.3：「When encryption is in effect, the packet length, padding length, payload, and padding fields of each packet MUST be encrypted with the given algorithm.」 | 读原文 | 已读 |
| r7 | 包长字段本身也是加密的，收包要拿到前 8 字节（或一个密文块，取较大者）才能解出长度 | RFC 4253 §6：「the 'packet_length' field is also encrypted, and processing it requires special care ... Implementations SHOULD decrypt the length after receiving the first 8 (or cipher block size, whichever is larger) bytes of a packet.」 | 读原文 | 已读 |
| r8 | 二进制包格式是 packet_length ‖ padding_length ‖ payload ‖ random padding ‖ mac，填充至少 4 字节 | RFC 4253 §6 的包格式定义与「There MUST be at least four bytes of padding.」 | 读原文 | 已读 |
| r9 | 单向密文视为一条连续数据流，初始向量从上一包传到下一包 | RFC 4253 §6.3：「The encrypted data in all packets sent in one direction SHOULD be considered a single data stream. ... initialization vectors SHOULD be passed from the end of one packet to the beginning of the next packet.」 | 读原文 | 已读 |
| r10 | 有效密钥长度应当不少于 128 位 | RFC 4253 §6.3：「All ciphers SHOULD use keys with an effective key length of 128 bits or more.」 | 读原文 | 已读 |
| r11 | 建议每传输 1 GB 或每连接 1 小时重新交换一次密钥，先到者为准；但不宜太频繁 | RFC 4253 §9：「It is RECOMMENDED that the keys be changed after each gigabyte of transmitted data or after each hour of connection time, whichever comes sooner. However, since the re-exchange is a public key operation, it requires a fair amount of processing power and should not be performed too often.」 | 读原文 | 已读 |
| a1 | 密钥交换之后客户端请求服务，服务名是 ssh-userauth，服务器接受要回 SSH_MSG_SERVICE_ACCEPT | RFC 4253 §10：「After the key exchange, the client requests a service.」保留的服务名 `ssh-userauth` 与 `ssh-connection`；接受时「MUST respond with the following: byte SSH_MSG_SERVICE_ACCEPT / string service name」 | 读原文；实验回显 `debug2: service_accept: ssh-userauth`、`debug1: SSH2_MSG_SERVICE_ACCEPT received` | 已读与复现 |
| a2 | 认证协议里，公钥认证是唯一必须实现的方法 | RFC 4252 §7：「The only REQUIRED authentication 'method name' is "publickey" authentication. All implementations MUST support this method.」 | 读原文 | 已读 |
| a3 | 公钥认证用私钥签名来证明持有私钥，服务器要查公钥对该用户是否有效、并验签名 | RFC 4252 §7：「With this method, the possession of a private key serves as authentication ... The server MUST check that the key is a valid authenticator for the user, and MUST check that the signature is valid.」 | 读原文；实验回显 `debug1: Server accepts key: ... ED25519 SHA256:... explicit` 与 `Accepted key ED25519 SHA256:... found at .../authorized_keys:1` | 已读与复现 |
| a4 | 客户端可以先只发公钥试探，服务端回 SSH_MSG_USERAUTH_PK_OK | RFC 4252 §7 的方法专用消息号 `SSH_MSG_USERAUTH_PK_OK 60` | 读原文；实验回显 `debug2: we sent a publickey packet, wait for reply` | 已读与复现 |
| a5 | 签名的内容依次是：会话标识、SSH_MSG_USERAUTH_REQUEST、用户名、服务名、方法名 publickey、TRUE、公钥算法名、公钥本身 | RFC 4252 §7：「The value of 'signature' is a signature by the corresponding private key over the following data, in the following order: string session identifier / byte SSH_MSG_USERAUTH_REQUEST / string user name / string service name / string "publickey" / boolean TRUE / string public key algorithm name / string public key to be used for authentication」 | 读原文 | 已读 |
| a6 | 认证协议启动时从下层拿到会话标识，也就是首次密钥交换的交换哈希 H | RFC 4252 §1：「When this protocol starts, it receives the session identifier from the lower-level protocol (this is the exchange hash H from the first key exchange). The session identifier uniquely identifies this session and is suitable for signing in order to prove ownership of a private key.」 | 读原文 | 已读 |
| a7 | 私钥不离开本机，认证成功的那次连接只传了公钥和签名 | RFC 4252 §7（消息里只有公钥与签名）；实验回显中服务端只在 `authorized_keys` 文件里查公钥，签名由客户端本地用私钥生成 | 读原文与复现 | 已读与复现 |
| a8 | 这条实测连接走的是公钥认证，口令没有参与 | 实验用的 sshd 配置 `PasswordAuthentication no`，客户端回显 `debug1: Authentications that can continue: publickey` 与 `Authenticated to 127.0.0.1 ([127.0.0.1]:2222) using "publickey".` | 实验回显 | 已复现 |

## 本机这一次协商的结果

| 句号 | 陈述 | 出处与定位 | 核实方式 | 状态 |
|---|---|---|---|---|
| k6 | 本片这条连接协商出的结果是：密钥交换用 curve25519-sha256，主机密钥算法用 ssh-ed25519 | 实验回显 `debug1: kex: algorithm: curve25519-sha256` 与 `debug1: kex: host key algorithm: ssh-ed25519` | 本机实测 | 已复现 |
| k7 | 这条连接的加密算法是 chacha20-poly1305@openssh.com，压缩是 none | 实验回显 `debug1: kex: server->client cipher: chacha20-poly1305@openssh.com MAC: <implicit> compression: none` 与客户端方向同一句 | 本机实测 | 已复现 |
| k8 | 这一次用的软件版本是 OpenSSH 9.5p2 | `ssh -V` 回显 `OpenSSH_for_Windows_9.5p2, LibreSSL 3.8.2`（`out_02_ssh_capabilities.txt` 第一节） | 本机实测 | 已复现 |
| h6 | 服务器出示的主机密钥指纹是一串 SHA256 摘要 | 实验回显 `debug1: Server host key: ssh-ed25519 SHA256:...`；`ssh_config(5)` 的 `FingerprintHash` 条说明 `sha256` 是默认值 | 本机实测 | 已复现 |
| h7 | 客户端把主机公钥写进 known_hosts 文件，一行四段：主机名与端口、密钥类型、公钥本体、注释（此处无注释） | 实验回显：`known_hosts` 落在临时目录，内容形如 `[127.0.0.1]:2222 ssh-ed25519 <68 字符的 base64>`；`ssh_config(5)` 的 `UserKnownHostsFile` 条说明默认是 `~/.ssh/known_hosts` | 本机实测与读原文 | 已复现 |

## known_hosts 与「第一次连接」

| 句号 | 陈述 | 出处与定位 | 核实方式 | 状态 |
|---|---|---|---|---|
| e1 | 主机密钥要跟本地存的那份对得上，对不上就拒绝连接 | RFC 4253 §8 第 3 步（用本地数据库核对 K_S）；`ssh_config(5)` 的 `StrictHostKeyChecking` 条：「ssh will refuse to connect to hosts whose host key has changed.」 | 读原文 | 已读 |
| e2 | 第一次连接本地还没有旧记录可比，默认做法是先问人，人确认后才写进文件 | `ssh_config(5)` 的 `StrictHostKeyChecking` 条：`ask` 是默认值，「new host keys will be added to the user known host files only after the user has confirmed that is what they really want to do」 | 读原文 | 已读 |
| e3 | 协议本身允许客户端不核对就接受主机密钥，那样挡不住主动攻击 | RFC 4253 §8 第 3 步（见上 h4） | 读原文 | 已读 |
| e4 | 主机密钥存在 `~/.ssh/known_hosts`，这是用户的本地主机密钥库 | `ssh_config(5)` 的 `UserKnownHostsFile` 条：「The default is ~/.ssh/known_hosts, ~/.ssh/known_hosts2.」 | 读原文 | 已读 |

## 边界

| 句号 | 陈述 | 出处与定位 | 核实方式 | 状态 |
|---|---|---|---|---|
| e5 | 转发认证代理，拿到远端 socket 权限的人就能用本地 agent 里的身份去认证 | `ssh_config(5)` 的 `ForwardAgent` 条：「Users with the ability to bypass file permissions on the remote host (for the agent's Unix-domain socket) can access the local agent through the forwarded connection. An attacker cannot obtain key material from the agent, however they can perform operations on the keys that enable them to authenticate using the identities loaded into the agent.」 | 读原文 | 已读 |
| e6 | 端口转发是在这条加密通道上再开一条通道，能到哪里由两端的配置决定 | `ssh_config(5)` 的 `LocalForward`、`RemoteForward`、`DynamicForward` 三条；`DynamicForward` 条说明 `ssh` 可以充当 SOCKS4/SOCKS5 服务器，`PermitRemoteOpen` 条说明可以限制允许的目的地 | 读原文 | 已读 |
| e7 | 协议建议每传够 1 GB 或连够一小时就重换一次密钥 | RFC 4253 §9（见 r11） | 读原文 | 已读 |

## 密钥的真实结构（本机实测）

| 句号 | 陈述 | 出处与定位 | 核实方式 | 状态 |
|---|---|---|---|---|
| u1 | 一把 ed25519 公钥写成一个文件，就是一行：类型、base64 本体、注释 | `out_01_keygen.txt` 的 ed25519 段：「公钥整行字符数 : 103」「三段 : 类型=ssh-ed25519 / base64 段=68 字符 / 注释=ft-lab@example.invalid」 | 本机实测 | 已复现 |
| u2 | 这行 base64 解开是 51 字节，里面是两个「长度前缀 + 内容」：先 11 字节的 `ssh-ed25519`，再 32 字节的公钥本身 | `out_01_keygen.txt`：「base64 段解码后字节数 : 51」「第 1 个长度前缀串 : 长度前缀=11（hex 00 00 00 0b，大端） 内容=ssh-ed25519」「第 2 个长度前缀串 : 长度前缀=32（hex 00 00 00 20，大端）」；「字节账 : 长度前缀 8 + 内容 43 = 51 字节」 | 本机实测 | 已复现 |
| u3 | 长度字段是网络字节序（大端）；同样四个字节按小端读会读成 184549376 | `out_01_keygen.txt`：「解码后前 8 字节(hex) : 00 00 00 0b 73 73 68 2d」「同一批字节按小端读长度 : 184549376 ← 错的；SSH 用网络字节序（大端）」 | 本机实测 | 已复现 |
| u4 | 同样一把 4096 位的 RSA 公钥，写出来是 747 字符 | `out_01_keygen.txt` 的 rsa4096 段：「公钥整行字符数 : 747」「三段 : 类型=ssh-rsa / base64 段=716 字符」；解开 535 字节，三段是 7 字节的 `ssh-rsa`、3 字节的指数（hex `01 00 01`）、513 字节的模数 | 本机实测 | 已复现 |
| u5 | `ssh-keygen -lf` 打印的是指纹，开头的数字是密钥长度不是哈希长度 | `out_01_keygen.txt`：「256 SHA256:... (ED25519)」与「4096 SHA256:... (RSA)」 | 本机实测 | 已复现 |
| u6 | 私钥文件的开头是 `-----BEGIN OPENSSH PRIVATE KEY-----` | `out_01_keygen.txt`：「私钥首行 : -----BEGIN OPENSSH PRIVATE KEY-----」 | 本机实测 | 已复现 |

## 算法现状（只说「支持什么」）

| 句号 | 陈述 | 出处与定位 | 核实方式 | 状态 |
|---|---|---|---|---|
| — | 本机 `ssh -Q kex` 列出 12 项，`-Q cipher` 列出 10 项，`-Q key` 列出 16 项，`-Q key-sig` 列出 21 项 | `out_02_ssh_capabilities.txt` 各节 | 本机实测 | 已复现 |
| — | 这个清单是「支持什么」，不是「按什么顺序选」 | `ssh_config(5)` 的 `Ciphers` 条同时给出「支持的列表」与「默认列表」两段，并说「The list of available ciphers may also be obtained using "ssh -Q cipher".」；本机 `ssh -Q cipher` 的输出是按字母序，不是偏好序 | 读原文与实测对照 | 已核 |
| — | RFC 4253 只把两种 DH 交换、两种主机密钥算法列为必须实现 | RFC 4253 §8：「diffie-hellman-group1-sha1 REQUIRED」「diffie-hellman-group14-sha1 REQUIRED」；§6.6：「ssh-dss REQUIRED」「ssh-rsa RECOMMENDED」；§6.3：「3des-cbc REQUIRED」「aes128-cbc RECOMMENDED」 | 读原文 | 已读 |
| — | chacha20-poly1305@openssh.com 是 OpenSSH 自己的扩展 | `PROTOCOL` 第 1 节自述为「OpenSSH's deviations and extensions to the published SSH protocol」，其 1.7 条列出 chacha20-poly1305@openssh.com | 读原文 | 已读 |
| — | DSA 当年是 SSHv2 里唯一必须实现的算法，因为别的算法当时被专利封锁 | OpenSSH 9.8 发布说明：「DSA was the only mandatory-to-implement algorithm in the SSHv2 RFCs, mostly because alternative algorithms were encumbered by patents when the SSHv2 protocol was specified.」 | 读原文 | 已读 |
| — | DSA 被 OpenSSH 判定为本身弱：160 位私钥配 SHA1，估计安全强度只有 80 位 | OpenSSH 9.8 发布说明：「DSA, as specified in the SSHv2 protocol, is inherently weak - being limited to a 160 bit private key and use of the SHA1 digest. Its estimated security level is only 80 bits symmetric equivalent.」 | 读原文 | 已读 |
| — | OpenSSH 自 2015 年起默认禁用 DSA 密钥，9.8 起在编译期默认关闭，最终移除计划在 2025 年第一个版本 | OpenSSH 9.8 发布说明：「OpenSSH has disabled DSA keys by default since 2015 ... This release disables DSA by default at compile time. ... The final step of removing DSA support entirely is planned for the first OpenSSH release of 2025.」 | 读原文 | 已读 |

## 查过但决定不写进旁白

| 说法 | 为什么不写 |
|---|---|
| 「现在默认用 curve25519-sha256 和 chacha20-poly1305」 | 「支持清单」不等于「默认选择」。`ssh -Q` 的输出是按字母序排的，不是偏好序；默认顺序要看 `ssh_config(5)` 里的默认列表，而那份手册是 2026-10-09 的 master 分支，本机客户端是 9.5p2，两者未必一致。旁白只说「这一条连接协商出的结果是什么」，并把版本标在画面上。 |
| 「SSH 协议由 RFC 4253 定义，所以只用 RFC 4253 里的算法」 | 错。RFC 4253 只把 group1-sha1、group14-sha1、ssh-dss、ssh-rsa、3des-cbc 列为必须实现；本片实测用到的 curve25519-sha256、ssh-ed25519、chacha20-poly1305@openssh.com 都在它之后。讲的时候不把「RFC 规定的」说成「实际用的」。 |
| 「DSA 现在还能用 / 现在默认用什么」 | 9.8 的发布说明只说编译期默认关闭与移除计划，没说 10.x 的现状；本片也没有在本机禁用 DSA 做对照实验。不讲当前默认，只讲当年为什么是必选项。 |
| 「SSH 比 Telnet 安全」 | 没有比较对象与威胁模型就说不出这句话（仓库 `docs/standards.md` 第 1 节）。本片改为说清「传输层做哪三件事：加密、验服务器、查完整性」，以及「用户认证在上一层」。 |
| 「OpenSSH 是 OpenBSD 官方产品」 | 官方项目页只说「developed by a few developers of the OpenBSD Project」；没有说它是 OpenBSD 的官方产品或发行版组件。旁白只说「由 OpenBSD 项目的开发者维护」。 |
| 「Ylonen 是芬兰人 / 在赫尔辛基大学工作」 | RFC 4253 的 Authors' Addresses 只给了姓名与单位（SSH Communications Security Corp），`ssh-1.2.30` 的下载地址是 funet.fi 的 ftp 路径。国籍与单位这些没有读到一手说明，不写。 |
| 「这一秒只用了两个来回」 | RFC 4253 §1 说的是「In most environments, only 2 round-trips will be needed for full key exchange, server authentication, service request, and acceptance notification of service request. The worst case is 3 round-trips.」——含服务请求与接受通知在内的全套流程，不只是密钥交换。旁白不报这个回数。 |
| 「端口 22 是 SSH 专用、不安全、该改」 | RFC 4253 §4.1 只说这个端口已正式分配给 SSH。「该不该换端口」没有依据，不讲。 |
| 「加密后嗅探者看不出你在用 SSH」 | 协议只保证载荷被加密；端口号、报文长度与时序仍在明面上。RFC 4253 §6 提到随机填充「may help thwart traffic analysis」，那是「有帮助」不是「看不出」。不讲。 |
| 「公钥认证不依赖口令，所以更安全」 | 没有比较对象与威胁模型；本片只讲机制：服务器查公钥、验签名。 |
| 「本机 OpenSSH 10.6 的默认算法顺序」 | 本机是 9.5p2；10.6 是上游当前版本（openssh.com 记载 2026-10-06 发布），两者的默认列表不保证一致，没有做对照。不讲。 |

## 文案审查

2026-10-24 中文确认稿是 `review/script.zh.3577ae2c1ba07d7740371bcc5224512679c1b4ad7370a5e0693081a6352b8643.md`，内容 SHA-256 `3577ae2c1ba07d7740371bcc5224512679c1b4ad7370a5e0693081a6352b8643`。依据是 WaterRun 同日会话里的「可以」，加上 `SSH-ZH-R3` 的三句修改，见 `review/NOTES.md`。英文草稿 `review/script.en.027d26c337ec59e967356a1dd9012d38c253fd9b6a20cfba5bc032109f884598.md` 未确认。本文件「句号」列仍是 2026-10-19 第 1 稿的编号，不能拿来对当前的 s01–s62。

英文目前是直译草稿，未定稿；中文确认后重译。

## 制作署名

依据：`docs/standards.md` 第 7 节；模型名称与可确认版本来自本次制作记录，不以工具或平台名称代替。

| 角色 | 参与模型（含可确认的版本） | 实际分工 | 记录依据 |
|---|---|---|---|
| 策划 | WaterRun（英文版 `Planning: WaterRun`） | 题目、结构、取舍拍板、审稿 | `project.json` 的 `production.planner`；本片的系列与题目由策划者指定 |
| 事实测绘与中文文案 | MiniMax M3.1 Flash（本次会话确认的模型标识 `minimax-M3.1-Flash-Preview`） | 一手来源核实与交叉核查、本机实验（`ssh -vvv` 抓握手、一次性密钥结构测量、`ssh -Q` 能力清单）、256 秒定长中文文案、交审材料、视觉系统与配乐方向 | 本次制作记录；实验脚本与回显见 `research/lab/` |
| 视觉与配乐（2026-10-19，已被替换） | MiniMax M3.1 Flash（同上） | 当时写下俄国构成主义与 20 年代管弦。2026-10-23 策划者要求重做，该方向不再使用 | 本文件旧记录 |
| 视觉系统、配乐、文案对抗审稿、英文翻译 | Grok 4.7 | 2026-10-23 改视觉与配乐。2026-10-24 按已确认中文把 s01–s62 译成英文，译文未确认 | `project.json` 的 `credits`；`src/js/script.js`；`review/NOTES.md` |
| 中文稿优化 | Gemini 4 Argon | 2026-10-23 起计划 2–3 轮，均未采用。`SSH-ZH-R1` 过简。`SSH-ZH-R2`（2026-10-24）骨架可留，但「谈妥了一切」「不是现在的默认」「1995 年版本变成 RFC」和钥匙段落的顺序不对，正文字数大约 734，估时约 160 秒。第 3 轮反馈在 `research/GEMINI-PROMPT-R3.md` | 策划者会话；三份 Prompt |
| 场景实现、声音编排、封面、渲染与审查 | Opus 5.5 | **尚未开工**。按委托任务书实现场景、编排声音、做封面、渲染与三项审查；开工后据实追加分工 | `project.json` 的 `production.maker` 与 `production.mode: delegated` |
| 旁白合成 | MiniMax speech-2.8-hd | **尚未合成。** 2026-10-24 策划者指定：中文 `Chinese (Mandarin)_Radio_Host`（电台男主播），英文 `Friendly_Person`（Friendly Person），语速均为 1.0。署名写模型全名和音色 id，不写 Edge TTS | `project.json` 的 `tts` 与 `credits.services`；`review/NOTES.md` |
| 读音回听 | 无 | 未做 | `review/NOTES.md` 的「定稿后的调整」列出待试听项 |
| 网页检索与摘录 | 模型未披露 | 本次用到的是会话内置的网页抓取服务，读取了 RFC 4253、RFC 4252、OpenSSH 的 `ssh_config(5)` 与 `PROTOCOL`、OpenSSH 9.8 发布说明、项目页与历史页。该服务未披露底层模型 | 抓取记录见本文件「取证环境」一节的链接与本地下载校验值 |

开源视频：[本片源码](https://github.com/Water-Run/ft)（依据：`project.json` 的 `production.repository`）。画面上须完整可读 `github.com/Water-Run/ft`，英文标签 `Open-source video`。

## 复核

<!-- 成片后的三项审查（事实、读音与节奏、旁白与画面对应）逐条记在这里。 -->
