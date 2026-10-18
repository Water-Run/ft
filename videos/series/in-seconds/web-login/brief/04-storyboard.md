# 04 分镜要求

逐句时间以 `timing.<语言>.js` 为准；下面用句号定位。每个场景至少一次连续镜头运动；形状动作按 12fps 步进。构图可调整，但图形语义与 `expect.*.json` 的文字不能破。全片按层推进：**Session（会话）→ JWT（令牌）→ 认证方式 → 授权/委托 → 攻击面 → 收束**；Cookie 只是 Session ID 的运输，不是 Session 本身。

## open（0:00–0:21）

- o1：米白底，一个抽象登录框；账号和口令两条线；标签 `LOGIN`。
- o2：登录成功后，浏览器一侧多出 cookie 小方块；标签 `COOKIE`。
- o3：cookie 方块被放到一边，服务器一侧的 Session 格子亮起；标签 `SESSION`；字幕说清“cookie 只是运输”。
- o4：镜头拉远，四层骨架出现；片名卡 `200` 极大，标题“了解 Web 登录 / 怎么验证你是你”；标签 `THE QUESTION`，念出那句问句。

## session（0:21–0:59）

- s1：服务器创建会话格子，写入用户、权限、过期时间；标签 `SESSION`。
- s2：生成蓝色 Session ID 票根；标签 `SESSION ID`。
- s3：票根装进 cookie 信封，回到浏览器；标签 `COOKIE`。
- s4：票根随请求回来，服务器查表；标签 `LOOKUP`。
- s5：会话表压在服务器上，越堆越多；标签 `SESSION TABLE`。
- s6：黑块偷走票根；标签 `STOLEN ID`。
- s7：浏览器自动把 cookie 附到跨站请求；`SameSite` 黑栏；标签 `CSRF`。

## jwt（0:59–1:35）

- j1：把身份和权限写进蓝色长条 token，绕开会话表；标签 `SIGNED TOKEN`。
- j2：长条旁出现“不是 Session”的对照；标签 `TOKEN FORMAT`。
- j3：长条分三段：头部、载荷、签名；标签 `HEADER / PAYLOAD / SIGNATURE`。
- j4：长条被打开，内容可读；眼睛；标签 `ENCODED / NOT ENCRYPTED`。
- j5：签名缺口与服务器校验对齐，旁边 expiry/audience 刻度；标签 `SIGNATURE / EXPIRY / AUDIENCE`。
- j6：两条长条分叉：Access Token 去资源服务器，Refresh Token 去换新；标签 `ACCESS / REFRESH`。
- j7：长条被剪短，旁边撤销名单；标签 `REVOCATION`。

## authn（1:35–2:05）

- p1：Session/JWT 退到背景，红圆（口令）进入前景；标签 `FIRST AUTH?`。
- p2：红圆进压模，黄盐 + 蓝哈希，两个蓝哈希对齐；标签 `SALT + HASH`。
- p3：黄方（短信码）从手机飞入；一条斜线复制走；标签 `SMS / POSSESSION`。
- p4：蓝方里长出钥匙，公钥/随机挑战/域名绑定；标签 `PASSKEY / PRIVATE KEY`。
- p5：验证码方块挡住脚本形状；标签 `CAPTCHA / HUMAN`。
- p6：认证层与会话层并排，各管各的；标签 `AUTHN ≠ SESSION`。

## oauth（2:05–2:34）

- a1：OAuth 2.0 授权钥匙交给第三方，但不交身份；标签 `OAUTH / AUTHZ`。
- a2：OIDC 在授权上叠身份层，返回 ID Token；标签 `OIDC / ID TOKEN`。
- a3：Access Token 去资源服务器，Refresh Token 续期；标签 `ACCESS / REFRESH`。
- a4：资源服务器用放大镜验签名、受众；标签 `VERIFY TOKEN`。
- a5：信任线从第三方延伸到本站，中间有缺口；标签 `TRANSFERRED TRUST`。

## attacks（2:34–2:55）

- x1：四层骨架出现裂缝；标签 `ATTACK SURFACE`。
- x2：Session ID 被偷、CSRF、固定；标签 `SESSION ATTACKS`。
- x3：JWT 被偷、撤销不及时、载荷可读；标签 `JWT ATTACKS`。
- x4：钓鱼、撞库、短信转发、passkey 设备丢失；标签 `AUTHN ATTACKS`。
- x5：回调/受众/签名配置错；标签 `AUTHZ CONFIG`。

## close（2:55–3:12）

- e1：四层骨架合成一张图；标签 `FOUR LAYERS`。
- e2：四层各自的问题并排；标签 `DIFFERENT PROBLEMS`。
- e3：证据、规则、代价三栏；标签 `WHAT TO VERIFY`。

## outro（3:12–3:20）

黑底或米白底，左侧主题词 `WEB LOGIN` 与一句概括，右侧名单：策划 WaterRun、准备方 DeepSeek V4.1 Flash 1017、受托方 Opus 5.5 及分工、旁白合成、开源视频 `github.com/Water-Run/ft`。名单要留足阅读；不要用滚动字幕，也不配旁白。
