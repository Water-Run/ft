# 事实出处

取证日期：2026-10-06。对象：双因素认证（2FA）的定义，TOTP（RFC 6238）与 HOTP（RFC 4226）的算法，几种验证方式的强弱。
画面与旁白里的每一项事实都列在下面。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。模型输出、记忆与搜索摘要只作线索；外部事实都读到了原始来源，下表给出定位。
实验脚本与完整回显在 `research/lab/`；本片没有不入库的第三方源码。

## 来源

| 记号 | 来源 | 版本与日期 |
|---|---|---|
| R6238 | [RFC 6238](https://www.rfc-editor.org/rfc/rfc6238)，TOTP: Time-Based One-Time Password Algorithm | 2011 年 5 月（Informational） |
| R4226 | [RFC 4226](https://www.rfc-editor.org/rfc/rfc4226)，HOTP: An HMAC-Based One-Time Password Algorithm | 2005 年 12 月 |
| R2104 | [RFC 2104](https://www.rfc-editor.org/rfc/rfc2104)，HMAC: Keyed-Hashing for Message Authentication | 1997 年 2 月 |
| NIST | [NIST SP 800-63-4](https://pages.nist.gov/800-63-4/sp800-63.html) 与 [SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html)，Digital Identity Guidelines | 第 4 版定稿，[2025 年 7 月](https://csrc.nist.gov/pubs/sp/800/63/b/4/final) |
| CISA | [Implementing Phishing-Resistant MFA](https://www.cisa.gov/sites/default/files/publications/fact-sheet-implementing-phishing-resistant-mfa-508c.pdf)（fact sheet） | 2022 年 10 月 |
| GOOG | Google Security Blog，[New research: How effective is basic account hygiene at preventing hijacking](https://security.googleblog.com/2019/05/new-research-how-effective-is-basic.html) | 2019-05-17 |
| KURI | google-authenticator wiki，[Key Uri Format](https://github.com/google/google-authenticator/wiki/Key-Uri-Format) | 取证当日的页面 |
| WA | W3C，Web Authentication: An API for accessing Public Key Credentials，[Level 1](https://www.w3.org/TR/2019/REC-webauthn-1-20190304/) 与 [Level 2](https://www.w3.org/TR/webauthn-2/) | Level 1：W3C Recommendation，2019-03-04；Level 2：2021-04-08 |
| PAT | [US 4,720,860](https://patents.google.com/patent/US4720860A/en)，Method and apparatus for positively identifying an individual（Kenneth P. Weiss；Security Dynamics Technologies） | 1984-11-30 申请，1988-01-19 授权 |
| GA | Google 帐号帮助，[Get verification codes with Google Authenticator](https://support.google.com/accounts/answer/1066447) | 取证当日的页面 |
| GH | GitHub Docs，[Configuring two-factor authentication](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication) | 取证当日的页面 |
| FIDO | FIDO Alliance，[Passkeys](https://fidoalliance.org/passkeys/) | 取证当日的页面 |
| PCI | PCI Security Standards Council，Information Supplement: Multi-Factor Authentication | 1.0 版，2017 年 2 月 |
| 实验 | 本片 `research/lab/` 的脚本与回显 | 2026-10-06 |

## 取证环境

实验在一台 Linux 机器上的独立目录里做，脚本只读写自己目录下的文件，回显里没有路径、主机名与账号（未做任何替换）。

| 项 | 版本 | 获取方式 |
|---|---|---|
| Python | 3.12.3，只用标准库（`hmac`、`hashlib`、`struct`、`base64`） | 系统自带 |
| Node.js | 18.19.1，`crypto` 模块 | 系统自带 |
| PyOTP | 2.10.0 | `pip install pyotp`（独立的虚拟环境） |
| segno | 1.6.6 | `pip install segno==1.6.6` |
| OpenCV | opencv-python-headless 5.0.0.93（只用它的二维码识别器） | `pip install opencv-python-headless` |

| 脚本 | 做什么 | 回显 |
|---|---|---|
| `totp_ref.py` | 参考实现：按 R4226 第 5.3 节与 R6238 第 4.2 节逐步写出，返回每一步的中间值 | — |
| `00_rfc_vectors.py` | 用 R4226 附录 D（计数 0–9 的 HMAC、截取值、6 位 HOTP）与 R6238 附录 B（SHA-1 的 6 个时刻）核对参考实现 | `out_00_rfc_vectors.txt`：全部一致 |
| `01_pick_time.py` | 按写明的规则选出演示时刻 t0 | `out_01_pick_time.txt` |
| `02_film_values.py` | 打印四个时间步的全部中间值，写 `film_values.json` | `out_02_film_values.txt` |
| `03_cross_node.js` | 独立实现（Node.js）：先过 R6238 附录 B，再与参考实现逐项比较 | `out_03_cross_node.txt`：全部一致 |
| `04_cross_pyotp.py` | 第三方库（PyOTP）在同一时刻生成验证码；解析密钥 URI | `out_04_cross_pyotp.txt`：全部一致 |
| `05_qr.py` | 把密钥 URI 编成二维码，再用 OpenCV 解码回文本 | `out_05_qr.txt`：解码结果与 URI 相同 |

画面上的密钥、计数器、HMAC 字节、偏移量、整数、验证码与二维码矩阵由 `tools/gen_data.py` 从 `film_values.json`、`qr_matrix.json` 生成到 `src/js/data.js`，场景代码不手写这些数。

**演示参数**（`research/lab/params.json`）：密钥是固定短语的 SHA-1（20 字节，可复现，不对应任何真实账号）；账号写作 `alice@example.com`，签发方 `Example`；算法 HMAC-SHA-1，6 位，步长 30 秒，T0 = 0。视频第 0 秒对应 Unix 时间 1791289020（2026-10-06 12:17:00 UTC）。这个时刻是任取的：为了让截取一步在画面上看得清，`01_pick_time.py` 从当天 12:00:00 UTC 起逐分钟查找，取第一个满足脚本里写明的四个条件的整分钟；条件只影响「演示哪一个时刻」，不改变算法。

## 逐章

「状态」一栏：已核 = 2026-10-06 读到原始来源或由实验得到，并有第二个独立来源印证。

### open（0–30 秒）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用范围 | 状态 |
|---|---|---|---|---|---|
| o1；画面的六位数字与表盘 | 验证码是 6 位数字，每 30 秒换一次 | R6238 第 4.1 节：时间步 X 缺省 30 秒；第 5.2 节建议 30 秒。R4226 第 5.3 节：至少 6 位 | KURI：`digits` 缺省 6，`period` 缺省 30；GH：SHA1、6 位、30 秒均为缺省 | 步长与位数可由服务另行设定；本片讲缺省值 | 已核 |
| 画面：933 531 等四个验证码 | 四个时间步的验证码依次为 933531、414536、685976、456834 | 实验：`out_02_film_values.txt` | `out_03_cross_node.txt`、`out_04_cross_pyotp.txt` | 仅对演示密钥与演示时刻成立 | 已核 |
| o2 | 手机可以不联网；服务器知道此刻的验证码是多少 | R6238 第 3 节 R1、R2：双方各自知道当前时间并共享密钥；第 5.2 节：验证方用自己的时间计算并比较 | GA：「You can still generate codes without an internet connection or mobile service.」 | TOTP | 已核 |
| o3；片名卡 | 这种验证码属于 2FA（双因素认证），是其中常见的一道验证 | CISA 第 1 页：MFA 要求两种或更多不同的验证依据；第 2 页表 1 把 OTP 列为一种形式 | NIST SP 800-63-4 第 2.3 节 | — | 已核 |
| p1；画面：密码、泄露出去的副本、账号失守 | 只验证密码时，密码泄露即可登录 | CISA 第 1 页：启用 MFA 后，一个因素（如密码）被攻破，未经授权者拿不出第二个因素就无法访问 | GOOG：多数攻击来自掌握第三方泄露密码的自动化程序 | 密码 `qwerty12` 是演示用的字符串 | 已核 |
| a1–a4；画面：知道 / 持有 / 自身 | 验证的依据分三类：知道的（密码）、持有的（手机、安全密钥）、自身的（指纹） | NIST SP 800-63-4 第 2.3 节：something you know / have / are，各举一例 | CISA 第 1 页同一分法；PCI 第 4 页 | 三个图形为示意 | 已核 |
| a5；画面：2FA = 不同的两类 | 双因素指用上其中不同的两类 | NIST SP 800-63-4 第 2.3 节：MFA 指使用一种以上不同的因素 | CISA 第 1 页：two or more different authenticators | — | 已核 |
| 画面：两个密码仍是同一类，不算 | 同一类用两次不构成双因素 | PCI 第 4 页：MFA 的整个验证过程须用到三类方法中的至少两类 | 由 NIST 与 CISA 的定义可得（「不同的」因素） | — | 已核 |

### seed（30–60 秒）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用范围 | 状态 |
|---|---|---|---|---|---|
| b1；画面：TOTP、Time-based One-Time Password | TOTP 的全称与中文意思 | R6238 标题 | GH：「A time-based one-time password (TOTP) application…」 | — | 已核 |
| b3；画面：密钥的 20 个字节、二维码、URI 三行 | 开启时由服务器生成密钥并放进二维码 | R6238 第 5.1 节：密钥应随机选取；KURI：密钥可按 `otpauth://TYPE/LABEL?PARAMETERS` 编进二维码，`secret` 为 Base32 | GH：页面显示二维码，或点「setup key」查看 TOTP 密钥 | 常见做法；也可手动输入密钥 | 已核 |
| 画面：20 字节 = 160 位 | 密钥长度 | R4226 第 4 节 R6：至少 128 位，建议 160 位 | 实验：演示密钥 20 字节 | 演示密钥 | 已核 |
| 画面：二维码 | 41×41 个模块（版本 6，纠错等级 M），内容即画面上的 URI | 实验：`out_05_qr.txt`（segno 生成，OpenCV 解码相同） | — | 演示密钥 | 已核 |
| b4 | 手机扫码，存下同一个密钥 | R6238 第 3 节 R2：双方须共享同一个密钥 | GH：「Scan the QR code with your mobile device's app.」；`out_04_cross_pyotp.txt`：解析 URI 得到同一个密钥 | — | 已核 |
| b5；画面：时间、秒数、自 1970-01-01 00:00:00 UTC 起；时间轴 1970 Unix 纪元 | 另一个输入是 Unix 时间 | R6238 第 3 节 R1：Unix 时间即自 1970 年 1 月 1 日 UTC 零点起经过的秒数 | R6238 第 4.1 节：T0 缺省为 0（Unix 纪元） | — | 已核 |
| 画面：秒数读数 | 视频第 t 秒显示 1791289020 + t | 实验：`out_01_pick_time.txt`、`out_02_film_values.txt` | — | 演示时刻 | 已核 |
| h1；时间轴 1984：令牌专利申请 US 4,720,860 | 1984 年申请的一项专利已让令牌上的数字随时间变化 | PAT：1984-11-30 申请；说明书：由固定数据与至少一个动态变量（如一天中的时刻）生成不可预测的码；动态变量最好取日期与分钟，因而每分钟变化 | — | 专利 1988-01-19 授权；片中说的是申请年份。「令牌」指专利所述生成该码的装置 | 已核（单一原始来源，为专利文本本身） |
| 时间轴 1997：HMAC · RFC 2104 | HMAC 发布于 1997 年 | R2104 页眉：February 1997 | R4226 第 5.2 节引用 HMAC-SHA-1 | — | 已核 |
| 时间轴 2005：HOTP · RFC 4226 | HOTP 发布于 2005 年 | R4226 页眉：December 2005 | R6238 第 1.2 节：TOTP 是 HOTP 的基于时间的变体 | — | 已核 |
| h2；时间轴 2011：TOTP · RFC 6238 | TOTP 于 2011 年作为公开规范发布 | R6238 页眉：May 2011 | — | RFC 6238 属 Informational 类，片中称「公开规范」，不称标准 | 已核 |
| b6；画面：÷ 30、= 59 709 635、计数器 | 把秒数除以 30 取整，得到计数器 | R6238 第 4.2 节：T = (当前 Unix 时间 − T0) / X，取整（floor） | 实验：`out_02_film_values.txt` 窗口 1，floor(1791289050 / 30) = 59709635 | 缺省 X = 30、T0 = 0 | 已核 |
| b7；画面：59709635｜59709636、+1 | 计数器每 30 秒加一；12:18:00 UTC 交界 | 同上；实验：窗口 2 的计数为 59709636，Unix 1791289080 = 12:18:00 UTC | `out_03_cross_node.txt` | 演示时刻 | 已核 |

### code（60–90 秒）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用范围 | 状态 |
|---|---|---|---|---|---|
| c1；画面：密钥 20 字节、计数器 59709636、00 00 00 00 03 8f 18 c4（8 个字节）、HMAC SHA-1、RFC 2104 · 1997 | 密钥与计数器送进 HMAC-SHA-1；计数器写成 8 个字节 | R4226 第 5.1–5.3 节：C 为 8 字节计数器；HS = HMAC-SHA-1(K, C)。R6238 第 4.2 节：TOTP = HOTP(K, T) | 实验：`out_02_film_values.txt` 窗口 2 | R6238 第 1.2 节允许改用 HMAC-SHA-256 / 512；缺省为 SHA-1（KURI、GH） | 已核 |
| c2；画面：20 个字节 be cd 5d … 7f a5 | HMAC-SHA-1 的输出是 20 个字节 | R4226 第 5.3 节：HS 是 20 字节的串 | 实验：窗口 2 的 HMAC；`out_03_cross_node.txt` 相同 | 演示密钥与时刻 | 已核 |
| c3；画面：a5、低 4 位 = 5、序号 5–8 的四个字节 ea 8d ec 58 | 最后一个字节的低 4 位给出偏移量，从那里起取 4 个字节 | R4226 第 5.3 节：OffsetBits 为 String[19] 的低 4 位；P = String[Offset]…String[Offset+3] | 实验：0xa5 的低 4 位 = 5；第 5–8 个字节（从 0 数起） | 序号从 0 数起 | 已核 |
| c4；画面：6a、最高位 → 0、= 1787685976、对 1 000 000 取余：末 6 位 | 去掉最高位，读成 31 位整数，对 10^6 取余 | R4226 第 5.3 节：取 P 的后 31 位；D = Snum mod 10^Digit；并说明屏蔽最高位是为避免有符号与无符号取模的混淆 | 实验：0xea8dec58 → 0x6a8dec58 = 1787685976；mod 10^6 = 685976 | Digit = 6 | 已核 |
| c5；画面：验证码 | 结果 685976 即这 30 秒的验证码，与右上角相同 | 实验：窗口 2 | `out_04_cross_pyotp.txt` | 演示密钥与时刻 | 已核 |
| c6、c7；画面：手机｜服务器，各有密钥、时间 ÷ 30、685 976 | 服务器用同一个密钥、同一个时间再算一遍，结果一致即通过 | R6238 第 5.2 节：验证方以收到时的时间戳计算并比较 | R6238 第 3 节 R1、R2 | 第 5.2 节另建议最多容许一个时间步的传输延迟，片中未讲 | 已核 |
| c8；画面：无需通信 | 生成验证码时手机与服务器不必通信，只靠同一个密钥与各自的时钟 | R6238 第 3 节 R1、R2；第 4.2 节：输入只有 K 与 T | GA：没有网络也能生成 | 指生成这一步；验证码本身仍要由用户提交给服务器 | 已核 |

### rank（90–112.5 秒）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用范围 | 状态 |
|---|---|---|---|---|---|
| d1；表头：钓鱼网站 / SIM 换卡 / 信令劫持 | 验证方式不止一种，强弱不同 | CISA 第 1 页：并非所有形式的 MFA 同样安全；所列威胁：phishing、push bombing、SS7、SIM swap | NIST SP 800-63B-4 第 3.2.5 节 | 片中的表取 CISA 表 1 里的三行与三种威胁；未列推送通知一类 | 已核 |
| d2；第一行三格斜线；号码被转到别人的卡上，验证码随之改道 | 短信验证码最弱；号码可能被转走 | CISA 第 2–3 页表 1：SMS or Voice 列在最弱一档，易受 phishing、SS7、SIM swap；第 1 页：SIM swap 即让运营商把号码转到攻击者控制的 SIM 卡 | NIST SP 800-63B-4 第 3.1.3.3 节：经 PSTN 的带外验证属受限（restricted），应考虑换机、换 SIM、携号转网等风险指标 | 「最弱」指 CISA 这张表里的排序 | 已核 |
| d3；第二行一格斜线；假网站当场收下数字，转手登录 | TOTP 更强，但会被钓鱼网站骗走验证码 | CISA 表 1：App-based OTP 易受 phishing，SS7 与 SIM swap 不适用，排在短信之上；第 1 页举例：用户在仿冒页面提交用户名、密码与验证器里的 6 位码 | NIST SP 800-63B-4 第 3.2.5 节：需手动输入的验证器（带外与 OTP）不得视为抗钓鱼；R6238 第 5.2 节：泄露的 OTP 在时间步内可被第三方使用 | — | 已核 |
| 第二行格内：456 834 | 这一时间步的验证码 | 实验：窗口 3 | — | 演示 | 已核 |
| d4；画面：WebAuthn、2019、W3C 标准、私钥签名 · 用于安全密钥与通行密钥 | WebAuthn 于 2019 年成为 W3C 标准，用私钥签名 | WA Level 1 状态行：W3C Recommendation, 4 March 2019；WA Level 2 第 1 节：服务器取出登记的公钥，验证断言的签名 | CISA 第 3 页：FIDO/WebAuthn 认证器可以是独立的实体令牌，也可内置于设备；FIDO：通行密钥是基于 FIDO 标准的认证凭据 | — | 已核 |
| d5；画面：签名只对 example.com 有效、examp1e.test、拿不到签名 | 凭据绑定域名，假网站拿不到可用的签名 | WA Level 2 第 1 节：凭据限定在某个依赖方（RP ID，一个域名），只有属于它的来源才能访问；这一限定由浏览器与认证器共同执行 | NIST SP 800-63B-4 第 3.2.5 节：WebAuthn 依据已认证的验证方域名选用认证器密钥，由此抗钓鱼；CISA 表 1：FIDO/WebAuthn 抗钓鱼 | `example.com`（RFC 2606）与 `examp1e.test`（RFC 6761 的保留顶级域）都是保留给示例用的域名，不指向真实站点 | 已核 |
| 画面：强弱排序与弱点依据 CISA… | 出处标注 | CISA 标题与日期 | — | — | 已核 |
| d6；结论卡：任何一种，都好过只有密码 | 任何一种 MFA 都好过没有 | CISA 第 1 页：any form of MFA is better than no MFA | GOOG 的数据（下一行） | — | 已核 |
| 结论卡：100% / 96% / 76%；数据：Google 安全博客，2019-05-17 | 发到恢复手机号的短信验证码拦下了 100% 的自动化攻击、96% 的批量钓鱼、76% 的定向攻击 | GOOG 原文：「an SMS code sent to a recovery phone number helped block 100% of automated bots, 96% of bulk phishing attacks, and 76% of targeted attacks」 | 同文说明研究由 Google 与纽约大学、加州大学圣迭戈分校合作，为期一年 | 2019 年、Google 帐号上的研究；数字不外推到其他服务 | 已核（单一研究） |

### outro（112.5–120 秒）

| 位置 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| 同一个密钥，同一个时钟 | 对 c8 的概括 | 同 c8 | 已核 |
| 制作名单与仓库地址 | 见下「制作署名」 | — | 已核 |

### 标题与封面

| 位置 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| 标题里的「120 秒」 | 成片时长 | `script.js` 的 `TOTAL = 120`；两种语言的时间线都是 120.00 秒；成片时长见「复核」 | 已核 |
| 封面：685 976 与表盘 | 取自 code 一章的真实结果（窗口 2）；表盘停在第 7 秒为示意 | 实验 | 已核 |

## 制作署名

策划：WaterRun（依据：仓库制作规范）。

开源视频：[GitHub · Water-Run/ft](https://github.com/Water-Run/ft)（依据：仓库制作规范；公开页面的核对见「复核」）。

| 参与模型（含可确认的版本） | 实际分工 | 记录依据 |
|---|---|---|
| Claude Opus 5.5（模型标识 `claude-opus-5-5`） | 取证、脚本、翻译、视觉设计、场景与动画、配乐编写与混音编排、封面、审查 | 本次制作会话的运行环境说明；`project.json` 的 `production.maker` |
| Microsoft Edge 在线语音合成（经 edge-tts 7.2.8 调用；音色 `zh-CN-YunyangNeural`、`en-US-AndrewNeural`；模型未披露） | 两种语言的旁白 | `project.json` 的 `voices`；`kit/tools/tts.py` |
| Whisper small（`Systran/faster-whisper-small`，经 faster-whisper 1.2.1 在本地运行） | 读法试验与成片后的读音回听 | `kit/assets.json`；`kit/tools/asr.py`、`tts_probe.py` |
| 制作会话自带的网页检索与摘录工具 WebSearch、WebFetch（内部所用模型未披露） | 取证时查找原始来源并摘录原文；摘录只作定位，所引内容均对照原始页面或文件 | 本次制作记录 |

配乐与音效由 `tools/music.py` 与 `kit/tools/mix.py` 程序合成，没有使用生成式模型或外部素材。

## 复核

成片于 2026-10-06 出齐，`node kit/tools/check.js videos/series/in-seconds/two-factor-auth --final` 结论为「全部通过」。逐项实测：

- **时长**：中文、英文都是 120.00 秒 = 7200 帧 @ 60 帧/秒，与 `script.js` 的 `TOTAL = 120` 一致；封装前的混音轨同样是 120.00 秒，片名里的秒数与成片相符。
- **规格**：1920×1080，H.264 视频 + AAC 声音，两版相同。
- **画面**：各抽 1200 帧检查，内容占比中位 16.2%（中文）与 14.8%（英文），没有空画面，也没有持续 3 秒以上不动的段落。
- **声音**：封装后整体响度 I = -16.7 LUFS（中文）、-15.6 LUFS（英文），真峰值 -1.4 与 -1.5 dBFS，落在仓库规范的目标（-16±1.5 LUFS、≤ -1 dBFS）内；混音轨没有削顶采样（|x| ≥ 0.999 的采样 0 个）。
- **字幕与封面**：两种语言各 31 条字幕；四种版式的封面齐全，16:9 出 3840×2160 的 png 与 jpg，4:3 出 3200×2400 的 png 与 jpg。
- **闸门覆盖**：「交付物」一项按固定清单逐个查文件（成片、去配乐版、仅旁白版、字幕、四张封面），并比对渲染时记录的源文件状态，确认渲染之后没有再改过 `src/` 下的任何文件；「源码规则」「场景齐全」「时长与节奏」「全片扫描」「音效覆盖」也都在同一轮里通过。
- **读音回听**：Whisper small 对成片回听，「读法」一节的改写生效——「two F A」回听为「2FA」、「H mac」为「HMAC」、英文「Web Authen」为「WebAuthn」。中文版的「取整」「令牌」「假网站」「私钥」「域名」与英文版 2011 年那句的「TOTP」被听错；回听文本只是识别结果，是否需要改由人试听决定。

片中出现的数（密钥、计数器、HMAC 的 20 个字节、偏移量、31 位整数、四个验证码与二维码矩阵）仍以「取证」一节的三方交叉核对为准，成片没有改动这些数——`out/<lang>/video.json` 的过期检测确认渲染之后再没有改过场景与数据。

成片于 2026-10-06 发布：哔哩哔哩 `BV1whpF6aECJ`（`https://www.bilibili.com/video/BV1whpF6aECJ`）与 YouTube `zD2afy1WBX0`（`https://www.youtube.com/watch?v=zD2afy1WBX0`），时刻、标题与时长取自两个频道的公开页面。片尾与本页给出的仓库地址 `https://github.com/Water-Run/ft` 已打开核对：2026-10-06 返回 200，可公开访问，指向本仓库。

## 取证中的旁支

没有进入成片，供日后更新时使用：

- R6238 第 5.2 节建议验证方最多容许一个时间步的传输延迟，并说明时钟漂移时的重同步做法。
- R6238 第 1.2 节允许改用 HMAC-SHA-256 或 HMAC-SHA-512；KURI 注明 Google Authenticator 的实现忽略 `algorithm` 参数。
- NIST SP 800-63B-4 第 3.1.4.2 节：验证方对同一个 OTP 在有效期内只应接受一次。
- GOOG：设备端提示（on-device prompt）拦下 100% / 99% / 90%；只用安全密钥的用户在调查期间无一人被定向钓鱼得手。
- CISA 表 1 另有两行：带数字匹配的推送通知与 OTP 同档；不带数字匹配的推送通知易受「推送轰炸」。
- 1981 年 11 月 Lamport 在 Communications of the ACM 发表 Password Authentication with Insecure Communication（一次性口令的早期方案）；本片只查到题录，未读原文，故未使用。
