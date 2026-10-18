# 文案校对记录

指定校对者：WaterRun。规则见仓库 `docs/script-review.md`。

## 交审说明

稿本：`review/script.zh.53db476cea9e31747e954d4ffa98db5f7084b40bdfa0eb187d6e2f52bf9c37a4.md`（内容 SHA-256 `53db476cea9e31747e954d4ffa98db5f7084b40bdfa0eb187d6e2f52bf9c37a4`）。

预估总时长：200.0 秒（估算，未配音）。各段：open 18.0 / password 31.6 / session 35.4 / attacks 28.0 / factors 32.7 / federated 31.7 / close 15.1 / 片尾 7.5。

难点与预算：

- password 段要在 31.6 秒里讲清“不存口令、salt、慢哈希、只证明此刻知道”，不能再塞算法参数；Argon2id/bcrypt 目前只放在画面标签，不进旁白。
- session 段的 s7 一句话列三个 cookie 属性，TTS 估算 5.9 秒；如果读得拖，会改成两句或只留 Secure/HttpOnly，把 SameSite 放到画面。
- federated 段 7 句覆盖 OAuth/OIDC/PKCE/JWT；每个词都只够一句，不能再展开。
- 片尾 7.5 秒，不配旁白；名单与开源地址必须在画面里读完。

需要讨论的具体取舍：

1. **Argon2id/bcrypt 要不要进旁白？** 现在只在画面标签出现。进旁白需要加一句（约 3 秒），要从别处删。
2. **OAuth/OIDC 的密度**：g3–g7 五句连着讲授权、授权码、PKCE、JWT、OIDC。要不要把 JWT 的“签名≠加密”移到画面，只留一句旁白？
3. **session fixation 用英文原词还是“会话固定”？** 现在保留英文原词，画面可给中文；如果口播更顺，可改中文。
4. **MFA 第一次出现**：c2 才出现“MFA”，前面 f5 只说 AAL2。要不要把 c2 改成“多因素认证”，或在 f5 补一句“也就是多因素”？
5. **片名卡位置**：计划落在 o3/o4 之间（“服务器发来的就是它”到“临时通行证”）。是否接受？

| 术语 | 首次句号 | 解释句号 | 定义或简化的依据 |
|---|---|---|---|
| session ID | o4 | s2–s5 | `FACTS.md`「Cookie 与会话」；服务端用无意义编号查会话 |
| TLS | p2 | 画面标签（加密通道） | `FACTS.md`「口令与口令存储」；旁白只说到这里 |
| salt | p4 | p5 | 唯一 salt 让相同口令哈希不同 |
| 慢哈希 | p4 | p6 | Argon2id/bcrypt 故意拖慢计算；旁白不展开参数 |
| XSS | a2 | a2 | 脚本读走非 HttpOnly cookie |
| CSRF | a3 | a3 | 不读 cookie，让浏览器代发请求 |
| session fixation | a4 | a4–a5 | 先塞编号，受害者登录后攻击者接管 |
| AAL2 | f5 | f5 | 两个不同因子；画面给“两把不同的钥匙” |
| WebAuthn | f6 | f6–f8 | 认证器生成密钥对；服务器存公钥；challenge/签名；origin 绑定 |
| OAuth 2.0 | g3 | g3 | 授权框架，不是认证 |
| PKCE | g5 | g5 | 截到授权码也换不到 token |
| JWT | g6 | g6 | ID Token 是签名 JWT，不默认加密 |
| OIDC | g7 | g7 | OAuth 上的身份层 |
| MFA | c2 | 待定 | 多因素认证；第一次出现是否要展开，见取舍 4 |

## 意见与处理

| 轮次 / 稿本 | 句号或章节 | 校对意见 | 处理与理由 | 状态 |
|---|---|---|---|---|
| 第 1 轮 / `53db476c…` | 全文 | 等待 WaterRun 按句号反馈 | 尚未收到意见 | 待审 |

状态：待修改 / 已修改待复核 / 已确认 / 经讨论保留。

## 明确确认

尚未确认。没有 WaterRun 的明确确认前不合成配音、不铺开场景。

## 定稿后的调整

纯读法、停顿、lead/tail 调整在此登记；含义、范围、标题、章节或字幕文字变化重新导出并重新确认。
