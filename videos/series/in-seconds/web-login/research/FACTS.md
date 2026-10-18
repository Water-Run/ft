# 事实

取证日期：2026-10-18。对象是 Web 登录怎样确认“你是你”：口令、会话、多因素、联合登录与 WebAuthn 的基本机制，以及各自能防什么、不能防什么。本文件只登记陈述和依据，不规定片子的结构、时长分配、画面或措辞。

标准以 RFC/W3C/NIST 的正式文本为准，OWASP 作为工程实践的第二路印证。来源编号见 `sources.json`。

## 取证环境

| 材料 | 固定点 |
|---|---|
| Cookie | RFC 6265（2011-04），Netscape 早期规格（1999 存档），Kristol 2002 年的历史说明 |
| 口令 | RFC 7617（2015-09），OWASP Authentication/Password Storage（读取日 2026-10-18） |
| 会话 | RFC 6265，OWASP Session Management |
| OAuth/OIDC/JWT/PKCE | RFC 6749（2012-10），RFC 7636（2015-09），OIDC Core 1.0（2014 final；errata set 2，2023-12-15），RFC 7519（2015-05） |
| WebAuthn | W3C Recommendation，2021-04-08 |
| 认证保障级别 | NIST SP 800-63B-4，页面日期 2025-08-26 |

## 先分清几个词

| 陈述 | 依据 | 状态 |
|---|---|---|
| Authentication（AuthN）是验证某个个体、实体或网站确实是它声称的身份；用口令、指纹、安全令牌等 authenticator 支撑这个声明 | `owasp-auth` Introduction | 已读 |
| Digital Identity 是主体在某个数字服务里的唯一表示；Identity Proofing 是把数字身份与真实的人绑定，和 KYC 相关 | `owasp-auth` Introduction | 已读 |
| Session Management 是服务器维持某个实体跨多个请求的状态；服务器用 session identifier 把状态与后续请求关联起来 | `owasp-auth` Introduction；`owasp-session` Introduction | 已读 |
| NIST 把认证写成：验证 claimant 控制一个或多个与 subscriber account 绑定的 authenticator；成功后 verifier 把 identifier 断言给 relying party | `nist-800-63b-4` Introduction | 已读 |
| 认证因子分三类：知道的东西（口令）、拥有的东西（设备/密钥）、本身是什么（生物特征）。AAL2 要求两个不同的因子；生物特征本身不算 authenticator，必须与物理 authenticator 一起使用 | `nist-800-63b-4` AAL2、AAL2 的 biometric note | 已读 |
| “验证你是你”在 Web 上不是一次哲学判断，而是一串可检查的动作：你能否出示某个秘密/密钥，服务器能否验证它，以及之后的会话能否继续证明是同一个人 | `owasp-auth`；`nist-800-63b-4`；`rfc6265` | 本文件归纳 |

## 口令与口令存储

| 陈述 | 依据 | 状态 |
|---|---|---|
| HTTP Basic 认证把 `user-id:password` 用 Base64 编码后放在 `Authorization` 头里；Base64 只是编码，不是加密 | `rfc7617` §2 | 已读 |
| Basic 认证本身不是安全的用户认证方法，除非配合 TLS 之类的外部安全通道；否则口令在网络上是明文 | `rfc7617` §1、§4 | 已读 |
| 登录页和登录后的所有已认证页面必须只通过 TLS 或同等强度的通道访问；登录页不走 TLS 会让攻击者改表单 action，把口令送到任意位置 | `owasp-auth` Transmit Passwords Only Over TLS | 已读 |
| 口令不能明文存储，也不能用可逆加密；必须用慢的、抗 GPU/内存攻击的哈希 | `owasp-password-storage` Introduction、Hashing vs Encryption | 已读 |
| 每个口令要有唯一 salt；salt 让攻击者不能一次算哈希再查所有用户，也让相同口令得到不同哈希 | `owasp-password-storage` Salting | 已读 |
| 新系统优先 Argon2id；最低配置之一是 19 MiB 内存、t=2、p=1；scrypt 是备选；bcrypt 只用于遗留系统，work factor 至少 10，输入上限 72 字节；PBKDF2 在需要 FIPS 时用，HMAC-SHA-256 至少 600,000 次 | `owasp-password-storage` 开头的推荐与各算法节 | 已读 |
| 口令哈希的 work factor 应随硬件升级；常见做法是用户下次登录成功时用新参数重新哈希 | `owasp-password-storage` Upgrading the Work Factor | 已读 |
| 比较口令哈希要用常量时间函数；否则响应时间会泄露前缀匹配程度 | `owasp-auth` Compare Password Hashes Using Safe Functions | 已读 |
| 口令长度：有 MFA 时至少 8 字符，无 MFA 时至少 15；最大至少 64；不要组成规则（不强制大小写/数字/符号）；用 blocklist 挡常见和已泄露口令；不要定期强制更换 | `owasp-auth` Implement Proper Password Strength Controls；`nist-800-63b-4` Password Verifiers | 已读 |
| 登录要限速/锁定，挡口令猜测、密码喷洒和 credential stuffing；不要只靠 CAPTCHA | `owasp-auth` Protect Against Automated Attacks | 已读 |

## Cookie 与会话

| 陈述 | 依据 | 状态 |
|---|---|---|
| HTTP 本身是无状态的；服务器用 `Set-Cookie` 把状态放到 user agent，后续请求由 user agent 用 `Cookie` 头带回 | `rfc6265` Abstract、§3 | 已读 |
| Cookie 有 scope：过期时间、域、路径、scheme；`Secure` 只允许在安全通道发送，`HttpOnly` 不允许脚本通过 `document.cookie` 读取 | `rfc6265` §4.1.2、§5.2 | 已读 |
| 服务器通常不在 cookie 里直接放会话内容，而是放一个无意义的 session identifier；服务器用这个 nonce 查会话状态 | `rfc6265` §8.4 | 已读 |
| session ID 是 bearer credential；一旦泄露、被猜中或被固定，攻击者就能冒充受害者；OWASP 说它在会话期间“temporarily equivalent to the strongest authentication method” | `owasp-session` Introduction | 已读 |
| session ID 至少 64 bits 熵，用 CSPRNG 生成；自己生成时建议 128 bits；值必须无意义，不能放 PII 或权限信息 | `owasp-session` Session ID Properties | 已读 |
| Cookie 应设 `Secure`、`HttpOnly`、`SameSite`；`SameSite` 降低跨站请求携带 cookie 的风险，但不能替代 CSRF token | `owasp-session` Cookies；`rfc6265` §8.2 | 已读；SameSite 的具体行为以浏览器实现为准 |
| Cookie 是 ambient authority：浏览器会自动把它附到符合 scope 的请求上，攻击者不需要知道 cookie 内容就能让浏览器代发请求；这是 CSRF 的根源 | `rfc6265` §8.2 | 已读 |
| session fixation：攻击者先把自己的 session ID 塞给受害者，受害者用这个 ID 登录后，攻击者再用同一个 ID 接管；登录成功/权限变化后要换新 ID | `rfc6265` §8.4；`owasp-session` Renew the Session ID | 已读 |
| 会话要有空闲超时和绝对超时；NIST 建议 AAL1 总时长不超过 30 天，AAL2 不超过 24 小时、空闲不超过 1 小时 | `nist-800-63b-4` AAL1/AAL2 Reauthentication | 已读 |
| 注销不能只删浏览器里的 cookie；服务器端也要让 session 失效，否则旧的 session ID 仍可用 | `owasp-session` Session Expiration、Logout Button | 已读 |
| Cookie 的历史：Lou Montulli 1994 年前后在 Netscape 发明 cookie，用来支持电子商务应用；这是 cookie 规范作者 Dave Kristol 2002 年的说法 | `kristol-cookie-history` | 已读；这是历史陈述，不是 1994 年原始文档 |
| 最早的 Netscape cookie 规格已经包含 `expires`、`path`、`domain`、`secure`，并说明删除 cookie 要用过去的过期时间 | `netscape-cookie-spec` | 已读存档页 |

## 多因素与 WebAuthn

| 陈述 | 依据 | 状态 |
|---|---|---|
| AAL1 只要求单因素；AAL2 要求两个不同因子，并且 verifier 必须提供至少一种 phishing-resistant 选项；AAL3 要求公钥、私钥不可导出、phishing-resistant | `nist-800-63b-4` AAL1/AAL2/AAL3 | 已读 |
| OTP（含 TOTP）不是 phishing-resistant；它只能证明“知道/拥有某个会变的码”，不能证明你正在跟哪个站点说话 | `nist-800-63b-4` Single-Factor OTP、Multi-Factor OTP | 已读 |
| 生物特征本身不被 NIST 当作 authenticator；它必须与一个物理 authenticator 一起使用 | `nist-800-63b-4` AAL2 的 biometric note | 已读 |
| 邮件不能用于 out-of-band authentication；NIST 列出的原因是可能只靠口令访问、传输/中间服务器被截获、DNS 重路由等 | `nist-800-63b-4` Out-of-Band Authenticators | 已读 |
| WebAuthn 让 Web 应用创建/使用 public key credentials；凭据由 authenticator 创建并绑定到某个 Relying Party，用户要同意，authenticator 可提供 attestation | `webauthn-2` Abstract | 已读 |
| WebAuthn 有 registration 和 authentication 两个 ceremony：注册时在 authenticator 上创建凭据，服务器保存公钥；认证时服务器给 challenge，authenticator 用私钥签名，服务器用保存的公钥验证 | `webauthn-2` §1.2、§1.3、§7 | 已读；这是对规范流程的概述 |
| WebAuthn 凭据的作用域是 origin/Relying Party；一个 RP 不能检测另一个 RP 的凭据是否存在 | `webauthn-2` §1 Introduction | 已读 |
| WebAuthn 的 phishing-resistant 来自 origin 绑定：浏览器只在匹配的 origin 使用凭据，钓鱼站拿不到可用的签名 | `webauthn-2` §1、§13.4；`nist-800-63b-4` phishing-resistant 定义 | 已读；这是机制归纳 |
| 平台/漫游 authenticator 可以是手机、指纹传感器、USB 安全密钥等；WebAuthn 规范把 on-device 的叫 platform authenticator，off-device 的叫 roaming authenticator | `webauthn-2` §1 Introduction | 已读 |

## OAuth、OIDC、JWT、PKCE

| 陈述 | 依据 | 状态 |
|---|---|---|
| OAuth 2.0 是授权框架：第三方应用在资源所有者授权下，获得对 HTTP 服务的有限访问；它不直接定义“如何认证用户” | `rfc6749` Abstract、§1 | 已读 |
| OAuth 定义四个角色：resource owner、resource server、client、authorization server；access token 代表具体的 scope、寿命和访问属性 | `rfc6749` §1.1、§1.4 | 已读 |
| Authorization Code Flow：client 把用户送到 authorization endpoint；用户认证/同意后，authorization server 把 code 重定向回 client；client 再用 code 到 token endpoint 换 access token | `rfc6749` §4.1 | 已读 |
| Authorization code 应短期有效（建议最多 10 分钟）、只能使用一次、绑定 client identifier 和 redirect URI；重复使用要拒绝并尽可能撤销已发 token | `rfc6749` §4.1.2 | 已读 |
| `state` 是 client 用来维持请求与回调之间状态的 opaque 值，用来防 CSRF | `rfc6749` §4.1.1、§10.12 | 已读 |
| PKCE 让 public client 在授权请求里带 `code_challenge`，在 token 请求里带 `code_verifier`；服务器用 S256 验证；攻击者截到 code 但没有 verifier，换不到 token | `rfc7636` Abstract、§4 | 已读 |
| PKCE 的 `code_verifier` 是 43–128 字符的高熵随机串；`S256` 是 `BASE64URL(SHA256(ASCII(code_verifier)))` | `rfc7636` §4.1、§4.2 | 已读 |
| OIDC 是 OAuth 2.0 上的身份层：它让 client 能验证 end-user 的身份，并拿到基本 profile；authentication 结果放在 ID Token 里 | `oidc-core` Abstract、§1 | 已读 |
| OIDC 的 Authorization Code Flow 在请求里加 `openid` scope；ID Token 是 JWT，包含认证事件相关的 claims；client 要验证 ID Token | `oidc-core` §3.1 | 已读 |
| OAuth 2.0 本身不能提供 end-user 认证信息；OIDC 通过扩展 OAuth 的授权流程来做认证 | `oidc-core` §1 | 已读 |
| JWT 是 claims 的紧凑、URL-safe 表示；作为 JWS payload 时可以签名/MAC，作为 JWE plaintext 时可以加密；JWT 不默认加密 | `rfc7519` Abstract、§3 | 已读 |
| JWT 的 `iss`、`sub`、`aud`、`exp`、`nbf`、`iat`、`jti` 都是可选 claim，但应用要定义哪些必须校验；不校验 `aud`/`iss`/`exp` 会出问题 | `rfc7519` §4.1、§7.2、§11.1 | 已读 |
| JWT 的内容只有被密码学保护并绑定到信任决策所需的上下文时，才能用于信任决策 | `rfc7519` §11.1 | 已读 |

## 攻击面与边界

| 陈述 | 依据 | 状态 |
|---|---|---|
| 钓鱼：用户被引导到假站点输入口令/OTP；口令和 OTP 都可能被实时转发。WebAuthn 的 origin 绑定是目前标准里更强的缓解 | `nist-800-63b-4` phishing-resistant；`webauthn-2` §1 | 已读 |
| 撞库/密码喷洒：攻击者用别处泄露的口令批量尝试；限速、blocklist、MFA、passkey 都能降低风险，但不能让弱口令变强 | `owasp-auth` Protect Against Automated Attacks；`owasp-password-storage` | 已读 |
| 会话劫持：session ID 被窃取/预测/固定；用 CSPRNG、足够熵、Secure/HttpOnly、登录后换 ID、超时、服务器端注销来缓解 | `owasp-session`；`rfc6265` §8.4 | 已读 |
| CSRF：浏览器自动带 cookie，攻击者让受害者在自己已登录的站点上执行动作；SameSite、CSRF token、检查 Origin/Referer 等可缓解，单靠 HttpOnly 不够 | `rfc6265` §8.2；`owasp-session` SameSite | 已读 |
| XSS：脚本在页面里运行，能读非 HttpOnly cookie、能代替用户发请求；HttpOnly 只保护 cookie 不被 JS 读取，不修 XSS 本身 | `rfc6265` §8.4；`owasp-session` HttpOnly | 已读；这是机制归纳 |
| TLS 只保护传输，不保护端点；cookie 协议本身有弱机密性/完整性，HTTPS 不是“cookie 安全”的同义词 | `rfc6265` §8.3、§8.5、§8.6 | 已读 |
| “记住我”长期 token、恢复码、备用邮箱/手机号都是额外的认证路径，安全性取决于它们自身的保护；不能只把主登录做严 | `owasp-auth` Secure Password Recovery、Re-authentication；`nist-800-63b-4` recovery | 已读；具体实现需单独取证 |

## 历史时间线

| 年份 | 事件 | 依据 | 状态 |
|---|---|---|---|
| 1994 | Lou Montulli 在 Netscape 发明 cookies，用于电子商务 | `kristol-cookie-history` | 已读；历史陈述 |
| 1999 | Netscape 的 cookie 规格存档页版权行；RFC 2617 定义 Basic/Digest | `netscape-cookie-spec`；`rfc7617` 的引用 | 已读存档/引用 |
| 2011 | RFC 6265 发布，定义 Cookie/Set-Cookie | `rfc6265` | 已读 |
| 2012 | RFC 6749 发布 OAuth 2.0 | `rfc6749` | 已读 |
| 2014 | OIDC Core 1.0 final；2023 年 errata set 2 | `oidc-core` | 已读 |
| 2015 | RFC 7617 Basic、RFC 7519 JWT、RFC 7636 PKCE | 各 RFC 页眉 | 已读 |
| 2019 | WebAuthn Level 1 成为 W3C Recommendation（2019-03-04） | `webauthn-2` 的 Previous Versions 列表 | 已读 |
| 2021 | WebAuthn Level 2 成为 W3C Recommendation（2021-04-08） | `webauthn-2` 页眉 | 已读 |
| 2025 | NIST SP 800-63B-4 页面日期 2025-08-26 | `nist-800-63b-4` 页眉 | 已读 |

## 边界与常见误说

| 说法 | 核查结果 | 依据 |
|---|---|---|
| “OAuth 就是登录” | 不准确。OAuth 2.0 是授权框架；OIDC 在它上面加身份层，才提供“用户是谁”的认证结果 | `rfc6749` Abstract；`oidc-core` §1 |
| “JWT 是加密的” | 不默认。JWT 可以是 JWS（签名/MAC）或 JWE（加密）；很多登录用的是签名 JWT，内容可被读取 | `rfc7519` Abstract、§3 |
| “口令是加密存储的” | 错。应存慢哈希 + 唯一 salt，不可逆；加密是可逆的，不适合口令 | `owasp-password-storage` Hashing vs Encryption |
| “HTTPS 就让 cookie 安全了” | 不准确。TLS 保护传输；cookie 还有 ambient authority、弱机密性/完整性、CSRF/session fixation 等问题 | `rfc6265` §8 |
| “HttpOnly 能防 CSRF” | 错。HttpOnly 阻止 JS 读 cookie，不阻止浏览器在跨站请求里自动带 cookie | `rfc6265` §8.2；`owasp-session` HttpOnly |
| “SameSite 能替代 CSRF token” | 不能一概而论。SameSite 降低风险，但浏览器/场景差异和顶层导航等边界要具体分析；高风险动作仍应加 token/Origin 检查 | `owasp-session` SameSite；`rfc6265` §8.2 |
| “MFA 就是短信验证码” | 不是。MFA 有很多因子；NIST 对 PSTN/SMS 有额外限制，邮件不允许做 OOB | `nist-800-63b-4` Out-of-Band |
| “指纹/人脸本身就是一种认证器” | NIST 明确说生物特征本身不算 authenticator，必须与物理 authenticator 结合 | `nist-800-63b-4` AAL2 biometric note |
| “OTP 能防钓鱼” | 不能。NIST 说 OTP 不是 phishing-resistant；实时钓鱼可以转发 OTP | `nist-800-63b-4` OTP |
| “passkey/WebAuthn 绝对不会被攻击” | 不能绝对化。它把钓鱼和服务器端口令泄露的风险大幅降低，但账号恢复、设备丢失、恶意软件/中间人界面等仍是攻击面 | `webauthn-2` §13；`nist-800-63b-4` | 本文件归纳 |
| “注销就是删 cookie” | 不够。服务器端 session 也要失效；否则旧 session ID 仍可能被重放 | `owasp-session` Session Expiration |
| “session ID 放 JWT 里就无状态、更安全” | 不必然。JWT 只是令牌格式；无状态会话的撤销、过期、密钥管理是另一组问题 | `rfc7519`；`owasp-session` | 本文件归纳 |

## 不进入定稿的句子

| 句子 | 原因 |
|---|---|
| 某个口令哈希算法“绝对安全” | 没有绝对；参数、实现、口令强度、侧信道都影响。写具体算法与参数，不写绝对结论 |
| “NIST 要求所有系统 15 字符以上” | NIST/OWASP 的条件是有无 MFA；不要去掉条件 |
| “passkey 已经完全取代口令” | 现实中口令仍在；没有做采用率调查 |
| “某次泄露中 N% 的账号被撞库” | 没有读原始报告；不写统计 |
| “OAuth 2.1 已经取代 OAuth 2.0” | 本次没有读 OAuth 2.1 规范；不写 |
| “TLS 1.3 是登录的强制要求” | 本次没有核对具体合规要求；只写 OWASP 的 TLS/强通道要求 |
| “Cookie 是 1994 年 10 月发明的” | Kristol 只说 sometime in 1994；不要编具体月份 |
| “WebAuthn 私钥永远不会离开认证器” | 规范说凭据由 authenticator 创建/保存、RP 存公钥；不同实现（同步凭据）有差异，不能绝对化。写“服务器只保存公钥，签名在认证器侧完成” |
| “短信验证码不安全，所以不能用” | NIST 是限制/风险提示，不是一句“不能用”；不要扩大 |

## 文案审查

2026-10-19 第 1 轮：中文稿导出为 `review/script.zh.53db476cea9e31747e954d4ffa98db5f7084b40bdfa0eb187d6e2f52bf9c37a4.md`，内容哈希 `53db476cea9e31747e954d4ffa98db5f7084b40bdfa0eb187d6e2f52bf9c37a4`，估算 200.0 秒；英文草稿导出为 `review/script.en.c2c907397d06359c32112638d6e2e9bad10c7c80bb86b2ba42565f53d7dc2e36.md`。等待 WaterRun 按句号反馈；`review/approval.json` 仍是 pending，没有明确确认，不配音、不铺开场景。

## 制作署名

策划：WaterRun。准备方：DeepSeek V4.1 Flash 1017。2026-10-18 使用 Web Fetch 读取 RFC/W3C/NIST/OWASP 文本并写下本目录的事实记录；2026-10-19 写中文初稿与英文草稿、审稿包、包豪斯视觉系统与关键帧、逐句对应表与任务书，未配音。受托方：Opus 5.5，负责场景、常驻元素、声音、封面、渲染与审查；截至本条记录尚未开工。仓库：https://github.com/Water-Run/ft 。

## 复核

没有成片。等脚本与画面完成后，按 `docs/review.md` 第 5 节逐句、逐画面复核；本文件现在只完成取证阶段的交叉核查。
