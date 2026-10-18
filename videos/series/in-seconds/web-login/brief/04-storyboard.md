# 04 分镜要求

逐句时间以 `timing.<语言>.js` 为准；下面用句号定位。每个场景至少一次连续镜头运动；形状动作按 12fps 步进。构图可调整，但图形语义与 `expect.*.json` 的文字不能破。全片反复问的是：**服务器在验证什么证据、用什么规则验证**。

## open（0:00–0:18）

- o1：米白底，一个抽象登录框（两条黑线）；红圆=口令、黄小方=短信码、蓝方=Google、黄三角=指纹，从四处落入画面。
- o2：黑框（服务器）把四块证据挡在外面，只留一条检查缝；大字 `VERIFY?`。
- o3：四块证据排开，标签 `EVIDENCE`；镜头轻推。
- o4：黑框上出现三个词 `WHO / PROOF / MEMORY`，再收成一个问号；片名卡在这时出现：`200` 极大，标题“了解 Web 登录 / 怎么验证你是你”。

## password（0:18–0:48）

- p1：账号是一张黄票，口令是红圆；两者一起进入黑框。标签 `ACCOUNT + PASSWORD`。
- p2：红圆外套蓝色 TLS 通道；标签 `TLS`。
- p3：服务器一侧只有盐（黄小块）和蓝方（哈希），没有红圆；标签 `SALT + HASH`。
- p4：红圆再次进入压模，出来蓝方；两个蓝方在黑框里对齐。标签 `COMPARE`。
- p5：对齐处亮一下，标签 `KNOW`。
- p6：红圆单独留在框外；标签仍是 `KNOW`，但加一条“只此一次”的细线。
- p7：下一次请求从浏览器发出，红圆不在请求里；标签 `NEXT REQUEST`。

## factors（0:48–1:10）

- k1：黄小方（短信码）从手机形状飞进黑框；标签 `SMS / POSSESSION`。
- k3：蓝方里长出一把带缺口的钥匙；标签 `PASSKEY / PRIVATE KEY`。
- k4：服务器一侧只放公钥；一个随机挑战形状飞向钥匙。标签 `PUBLIC KEY / CHALLENGE`。
- k5：钥匙转动、签名落在挑战上；假框（错位）伸过来却对不上；标签 `SIGNATURE / DOMAIN`。

## session（1:10–2:06）

- s1：黑框把“已验证”盖在一张票上；标签 `REMEMBER`。
- s2：浏览器和服务器之间没有记忆线；服务器生成蓝色票根。标签 `SESSION ID`。
- s3：票根装进 cookie 信封，回到浏览器；标签 `COOKIE`。
- s4：服务器一侧出现会话表网格；票根落格，标签 `SESSION TABLE`。
- s6：旧票根被剪断，注销时变灰；标签 `ROTATE`。
- j1：会话表变成很多台服务器之间的共享表，线越拉越乱；标签 `TABLE PROBLEM`。
- j2：另一条路：把“已验证”写进蓝色长条 token，服务器不建表；标签 `SIGNED TOKEN`。
- j3：长条分成三段：头部、载荷、签名；标签 `JWT / HEADER / PAYLOAD / SIGNATURE`。
- j4：长条被“打开”，内容可读；一只眼睛，标签 `ENCODED / NOT ENCRYPTED`。
- j5：签名缺口对上，旁边出现 expiry/audience 两个小刻度；标签 `SIGNATURE / EXPIRY / AUDIENCE`。
- j6：长条被剪短（短命），旁边一个“撤销名单”的黑框；标签 `REVOCATION`。

## federation（2:06–2:33）

- f1：本站黑框外出现第三方黑框（Google/企业 SSO），两者之间一条信任线；标签 `SSO`。
- f2：用户走到第三方，拿回一张 code 票；标签 `CODE`。
- f3：第三方给出“授权”钥匙；OIDC 再加一层身份，返回 `ID Token` 蓝条；标签 `OAUTH / OIDC / ID TOKEN`。
- f4：本站用放大镜检查蓝条的签名和 audience；标签 `VERIFY ID TOKEN`。
- f5：code 票短命、单次、绑定回调；PKCE 的 verifier 形状再对一次；标签 `CODE + PKCE`。

## attacks（2:33–2:57）

- a1：攻击者黑块把“别人的证据”推进检查缝；标签 `FORGED EVIDENCE`。
- a2：鱼钩拉走红圆/黄方；一叠泄露口令纸片倒进登录框；标签 `PHISHING / STUFFING`。
- a3：页面脚本黑块伸手读蓝色票根；`HttpOnly` 黑盾挡住；标签 `XSS / HTTPONLY`。
- a4：画外斜块推着浏览器带 cookie 发请求；`SameSite` 黑栏挡住；标签 `CSRF / SAMESITE`。
- a5：旧票根被预先塞入；token 蓝条被抽走；标签 `FIXATION / JWT THEFT`。

## close（2:57–3:12）

- e1：黑框把“证据”和“规则”两栏对上；标签 `EVIDENCE + RULE`。
- e2：红圆（知道）、黄方（拥有）、钥匙（私钥）依次亮；标签 `KNOW / HAVE / KEY`。
- e3：票根（连续）与蓝条（签名）并排，画面收成一句“没有万能机制”；标签 `CONTINUITY / SIGNATURE / NO UNIVERSAL`。

## outro（3:12–3:20）

黑底或米白底，左侧主题词 `WEB LOGIN` 与一句概括，右侧名单：策划 WaterRun、准备方 DeepSeek V4.1 Flash 1017、受托方 Opus 5.5 及分工、旁白合成、开源视频 `github.com/Water-Run/ft`。名单要留足阅读；不要用滚动字幕。
