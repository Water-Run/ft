# 叙事测绘

本文件只记录面向观众的讲述顺序与取舍，不是旁白稿。事实与依据在 `FACTS.md`。

## 观众前提

每天上网、登录过各种网站；知道口令、短信验证码、指纹/人脸、第三方登录这些词；没有系统学过 cookie、session、OAuth、JWT、WebAuthn 的区别。

## 一个核心问题

网站怎么确认屏幕对面是“你”，而不是拿着你的口令、cookie 或验证码的别人。

## 逐章问题与答案

| 章 | 观众的问题 | 本章要回答 | 画面上的主要证据 |
|---|---|---|---|
| 1 登录那一刻 | 我填了口令，网站到底收到什么 | 口令经 TLS 送到服务器；服务器不存口令，存的是 salt + 慢哈希 | 登录表单 → TLS → `argon2id`/`bcrypt` 的存储记录 |
| 2 之后为什么不用再填 | 网站怎么记得我 | 登录成功后服务器发一个无意义的 session ID，放在 cookie 里；之后每次请求都带着它 | `Set-Cookie: SID=...; Secure; HttpOnly; SameSite`；服务器端 session 表 |
| 3 这串东西为什么危险 | 别人拿到 cookie 会怎样 | session ID 是 bearer credential；拿到就能冒充；所以要防泄露、防猜测、防固定、防 CSRF | 三种攻击：XSS 读 cookie、CSRF 借浏览器发请求、session fixation |
| 4 只靠口令不够 | 为什么还要短信/指纹/安全密钥 | 因子：知道/拥有/本身；AAL2 要两个不同因子；OTP 不防钓鱼；WebAuthn 用 origin 绑定防钓鱼 | 三类因子图标；TOTP 被实时转发；WebAuthn challenge/签名 |
| 5 用 Google/微信登录 | 为什么不用在本站输密码 | OAuth 2.0 是授权，OIDC 在它上面加身份层；authorization code + PKCE；ID Token 是 JWT | 四个角色；code → token；PKCE 的 verifier/challenge |
| 6 收束 | 那“验证你是你”到底靠什么 | 靠一条链：口令/密钥 → 会话 → 每次请求的凭证；每一环都有假设，攻击者找最弱的一环 | 一条链上的四个环节与对应攻击 |

## 决定不讲

- 各种口令哈希算法的完整实现与参数调优。只讲“慢哈希 + salt + work factor”，给 Argon2id/bcrypt/PBKDF2 的定位。
- OAuth 的所有 grant type、隐式流的历史、SAML、SSO 的企业配置。只讲 authorization code + PKCE 这一条主线。
- JWT 的完整 JOSE 规范、JWKS 轮换、密钥管理。只讲“签名≠加密”“要校验 iss/aud/exp”。
- 账号恢复、客服重置、风控评分、设备指纹。它们是另外的章节，最多一句“恢复路径也是攻击面”。
- 具体厂商的 passkey 实现差异、同步/设备绑定细节。讲 WebAuthn 的 origin 绑定与公钥/私钥分工即可。
- 任何“某网站不安全”的个案判断。没有做渗透测试。

## 开场可用的钩子（不是定稿）

- 先给出一串 `SID=...` 的 cookie，问：为什么服务器看到这串东西，就认为是我？它不是我的名字，也不是我的口令。
- 或者：登录成功后，服务器其实没有“记住你的密码”；它记住的是另一串东西。那这串东西被偷走会怎样？

## 与系列的约束

本集属于「XX 秒速通」：成片必须恰好 200 秒；保留系列的定长时间线、语速、字幕带/秒尺/剩余秒数/右上角仪表的位置与做法。视觉系统改用包豪斯，理由与边界见 `src/design/STYLE.md` 和系列说明的视觉例外。
