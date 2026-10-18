# 04 分镜要求

逐句时间以 `timing.<语言>.js` 为准；下面用句号定位。每个场景至少一次连续镜头运动；形状动作按 12fps 步进。构图可调整，但图形语义与 `expect.*.json` 的文字不能破。全片是一条“验证方式递进”：**cookie 验证会话连续 → 它的缺点 → JWT 验证令牌可信 → 它的缺点 → 第一次验证（口令/短信码/passkey）→ 验证码判人 → 委托验证断言 → 攻击与收束**。

## open（0:00–0:14）

- o1：片名卡。米白底，`200` 极大；标题“了解 Web 登录 / 怎么验证你是你”。念出片名，建立开场。
- o2：六块小形状排开：cookie 票根、JWT 长条、红圆（口令）、黄方（短信码）、钥匙（passkey）、验证码方块；每块一个词，标签 `METHODS`。
- o3：镜头推向 cookie 票根；标签 `COOKIE`。

## cookie（0:14–0:52）

- c1：服务器生成蓝色票根，写随机编号；标签 `SESSION ID`。
- c2：票根装进 cookie 信封，回到浏览器；标签 `COOKIE`。
- c3：每次请求票根自动返回；服务器一侧会话表网格，票根落格；标签 `SESSION TABLE`。
- c4：票根与表对上，亮一下；标签 `CONTINUITY`。旁白强调“不是重新验证人”。
- c5：会话表压在服务器上，越来越重；标签 `SERVER TABLE`。
- c6：多台服务器拉扯同一张表，线乱；标签 `SHARED TABLE`。
- c7：一只黑色斜块偷走票根；标签 `STOLEN ID`。
- c8：浏览器自动把 cookie 附到跨站请求上；`SameSite` 黑栏出现；标签 `AUTO COOKIE`。

## jwt（0:52–1:22）

- j1：把“已验证”写进蓝色长条，绕开会话表；标签 `SIGNED TOKEN`。
- j2：长条分三段：头部、载荷、签名；标签 `JWT / HEADER / PAYLOAD / SIGNATURE`。
- j3：长条被“打开”，内容可读；眼睛图标；标签 `ENCODED / NOT ENCRYPTED`。
- j4：签名缺口与服务器校验对齐，旁边 expiry/audience 两个刻度；标签 `SIGNATURE / EXPIRY / AUDIENCE`。
- j5：长条被剪短，旁边一个“撤销名单”黑框；标签 `REVOCATION`。
- j6：黑块偷走长条，仍能用到失效；标签 `STOLEN TOKEN`。
- j7：长条被剪得更短；标签 `SHORT-LIVED`。

## password（1:22–1:47）

- p1：cookie/JWT 票根退到背景，红圆（口令）进入前景；标签 `FIRST VERIFICATION?`。
- p2：红圆进入压模，黄盐 + 蓝哈希；标签 `SALT + HASH`。
- p3：两个蓝哈希对齐；标签 `KNOW`。
- p4：红圆只对齐一次，账号/身份的形状仍空着；标签 `KNOWLEDGE ≠ OWNERSHIP`。
- p5：鱼钩（钓鱼）与一叠泄露口令纸片靠近；标签 `PHISHING / STUFFING`。
- p6：红圆退回“第一道”位置；标签 `FIRST CHECK`。

## factors（1:47–2:12）

- f1：黄方（短信码）从手机飞入；标签 `SMS / POSSESSION`。
- f2：一条斜线把黄方实时复制走；标签 `RELAY`。
- f3：蓝方里长出带缺口的钥匙；标签 `PASSKEY / PRIVATE KEY`。
- f4：服务器只放公钥，随机挑战飞向钥匙；标签 `PUBLIC KEY / CHALLENGE`。
- f5：钥匙签名，签名绑定域名，假框对不上；标签 `SIGNATURE / DOMAIN`。
- f6：设备被拿走，恢复路径是一个断开的黑框；标签 `DEVICE / RECOVERY`。

## delegated（2:12–2:36）

- d1：本站黑框外出现另一个身份提供方黑框；标签 `IDENTITY PROVIDER`。
- d2：它验证完，递来一张 assertion 票；标签 `ASSERTION`。
- d3：本站用放大镜检查签名和 audience；标签 `VERIFY ASSERTION`。
- d4：票面写 `OIDC / SAML`；标签 `OIDC / SAML`。
- d5：信任线从第三方延伸到本站，中间有缺口；标签 `TRANSFERRED TRUST`。

## attacks（2:36–2:56）

- a1：验证码方块挡住脚本形状；标签 `CAPTCHA / HUMAN`。旁白“只判人，不判身份”。
- a2：黑块偷 cookie/JWT 长条；标签 `COOKIE / JWT THEFT`。
- a3：鱼钩、转发斜线、丢失设备三块并排；标签 `PHISHING / RELAY / DEVICE`。
- a4：本站配置黑框里的 audience/签名刻度没对上；标签 `CONFIG ERROR`。

## close（2:56–3:12）

- e1：六块方法形状排开，没有一块能单独盖住全部；标签 `NO UNIVERSAL`。
- e2：cookie 票根、JWT 长条、口令红圆、短信黄方依次亮；标签 `METHOD MAP`。
- e3：证据、规则、代价三栏并排；标签 `EVIDENCE / RULE / COST`。

## outro（3:12–3:20）

黑底或米白底，左侧主题词 `WEB LOGIN` 与一句概括，右侧名单：策划 WaterRun、准备方 DeepSeek V4.1 Flash 1017、受托方 Opus 5.5 及分工、旁白合成、开源视频 `github.com/Water-Run/ft`。名单要留足阅读；不要用滚动字幕。
