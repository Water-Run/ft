# 文案校对记录

指定校对者：WaterRun。规则见仓库 `docs/script-review.md`。

## 交审说明

稿本：`review/script.zh.62c86207ab49cad8a3ed63a88dc7bf32b5bd6565b31613caa170663e79adf9a3.md`（内容 SHA-256 `62c86207ab49cad8a3ed63a88dc7bf32b5bd6565b31613caa170663e79adf9a3`）。

英文草稿：`review/script.en.b6ef4d186a135a73646bd330500f06e351f174296bcd3a06498d8f2e5c66e315.md`（内容 SHA-256 `b6ef4d186a135a73646bd330500f06e351f174296bcd3a06498d8f2e5c66e315`）。

预估总时长：200.0 秒（估算，未配音）。各段：open 19.0 / credentials 47.0 / session 41.7 / federation 32.9 / attacks 32.0 / close 19.4 / 片尾 7.5（含 0.5 入场，合计 8.0）。

## 自我对抗发现与修正

这一轮按 `docs/feedback.md` 的 P0–P13、F01–F12，以及 `docs/script-review.md` 的“先解释再给数字”逐句反查，改了以下问题：

1. **缺少“为什么需要会话”的前提**：旧稿直接说“服务器得记住你”，没有说 HTTP 无状态。改为 s1–s2：“HTTP 不记得上一次请求”之后才出现 cookie/会话表。
2. **缺少“账号是声明、口令是证明”**：旧稿只讲口令。改为 c1–c2，把 identification 和 authentication 分开，回应标题“怎么验证你是你”。
3. **术语首次出现没有中文解释**：TLS、salt、JWT、OIDC、SAML、WebAuthn、challenge、origin、AAL2 等；改为“加密通道 TLS”“唯一盐”“JWT……有签名，但不默认加密”“随机挑战”“网站域名”“SAML 单点登录”，删掉 AAL2 这个对主线不必要的缩写。
4. **cookie 属性是清单，没有动作**：旧稿 s7 只列 Secure/HttpOnly/SameSite；改为把 HttpOnly 放进 XSS、把 SameSite 放进 CSRF，让每个属性对应一个攻击。
5. **XSS 说得过宽**：旧稿“读走 cookie”会被理解成所有 cookie；改为“没设 HttpOnly 的 cookie”。
6. **CSRF 没说明浏览器自动带 cookie**：改为“浏览器自动带着 cookie 发请求”，再接 SameSite。
7. **session fixation 没写触发条件**：改为“先塞编号；登录后不换就被接管”，与 s9 的轮换呼应。
8. **JWT 只作为 OIDC 的 ID Token 出现**：补 s5–s9，把 JWT 作为“无状态会话/token”讲清楚：签名≠加密、别放秘密、bearer、短命/绑定用途/撤销；a7 补 token 被偷。
9. **缺少 SSO/SAML**：补 f6“企业里常用 SAML 单点登录”，依据 NIST 800-63C 的 federation/SSO 定义，并补入 FACTS/sources。
10. **OAuth 的“授权”没解释**：改为 f3“OAuth 2.0 是授权，不说你是谁”，f4 紧接 OIDC 身份层；f7 收“联合登录只是转移信任”。
11. **开头没有主流机制的全景**：o2–o3 先列口令、验证码、指纹、Google 登录，再收成“三个问题”，避免观众以为本片只讲口令。
12. **旧稿 8 场按机制切，主线不够清楚**：改为 7 场，按“你是谁/怎么证明/之后怎么记住 → 联合登录 → 攻击面 → 收束”推进；时长仍 200.0 秒。
13. **f3 原句 18 字，估算 6.3 秒**：缩短为“OAuth 2.0 是授权，不说你是谁”，过 6 秒检查。

## 需要讨论的具体取舍

1. **7 场结构**：credentials 47 秒里同时讲口令、一次性码、passkey；是否接受“先全景后深挖”，还是要把 passkey 单独成段？
2. **JWT 的篇幅**：s5–s9 五句，加上 a7；是否够讲清“无状态会话”和“签名≠加密”，还是要把 cookie 会话压短？
3. **SAML/SSO 只一句**：f6 只给“一次登录，多个系统”，不展开 SAML 断言/IdP/RP；是否接受？
4. **OAuth 只一句定义**：f3 说“授权，不说你是谁”，没有展开 scope/access token；是否够？
5. **“认票不认人”**：s8 用这个口语说法替代 bearer；是否接受，还是保留“bearer 凭证”并加中文解释？
6. **片尾 7.5 秒**：名单四行 + 开源地址，是否够读？

| 术语 | 首次句号 | 解释句号 | 定义或简化的依据 |
|---|---|---|---|
| 账号/声明 | c1 | c1–c2 | 账号是 claim；口令是 proof |
| TLS | c3 | c3 | 加密通道；FACTS「TLS 只保护传输」 |
| 唯一盐 | c4 | c5 | 每个口令唯一 salt；相同口令不同哈希 |
| 慢哈希 | c4 | c5 | 故意拖慢猜测；不展开 Argon2id 参数 |
| 一次性码/OTP | c7 | c8 | 短信/邮件/验证器；可被实时转发，不防钓鱼 |
| passkey/WebAuthn | c9 | c9–c10 | 认证器生成密钥对；服务器存公钥；私钥签名；绑定网站域名 |
| HTTP 无状态 | s2 | s2 | RFC 6265：HTTP 本身无状态 |
| session ID/cookie | s3 | s3–s4 | 随机编号；Set-Cookie 交给浏览器；查会话表 |
| JWT | s5 | s6–s7 | 一种 token；有签名，不默认加密；签名证明完整性，不隐藏内容 |
| bearer | s8 | s8 | 认票不认人；谁拿着谁用 |
| OAuth 2.0 | f3 | f3 | 授权框架，不直接定义认证 |
| OIDC | f4 | f4 | OAuth 上的身份层；ID Token |
| PKCE | f5 | f5 | 截到 code 没有 verifier 也换不到 token |
| SAML/SSO | f6 | f6 | NIST 800-63C：federation 让 IdP 认证后把 assertion 交给 RP，用户不必在每个 RP 各持 authenticator |
| 钓鱼/撞库 | a2/a3 | a2/a3 | 假站点骗凭证；拿别处泄露口令来试 |
| XSS/HttpOnly | a4 | a4 | 脚本读非 HttpOnly cookie |
| CSRF/SameSite | a5 | a5 | 浏览器自动带 cookie；SameSite 限制跨站携带 |
| session fixation | a6 | a6 | 先塞编号；登录后不换就被接管 |
| MFA | c9/e2 | c9 | 两个不同因子；passkey 是其中一种更强的方式 |

## 意见与处理

| 轮次 / 稿本 | 句号或章节 | 校对意见 | 处理与理由 | 状态 |
|---|---|---|---|---|
| 第 1 轮 / `53db476c…` | 全文 | 初稿待审 | 已被本轮结构替换 | 归档 |
| 第 2 轮 / `62c86207…` | 全文 | 自我对抗后待 WaterRun 审阅 | 见上表 13 项修正 | 待审 |

状态：待修改 / 已修改待复核 / 已确认 / 经讨论保留。

## 明确确认

尚未确认。没有 WaterRun 的明确确认前不合成配音、不铺开场景。

## 定稿后的调整

纯读法、停顿、lead/tail 调整在此登记；含义、范围、标题、章节或字幕文字变化重新导出并重新确认。
