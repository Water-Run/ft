# 200 秒了解 Web 登录机制：怎么验证你是你

一部 200 秒的 Web 登录科普：以“服务器怎么验证你是你”为主线，逐一看口令、短信码/passkey、会话 cookie、JWT、OAuth/OIDC/SSO 各自验证什么证据、能证明什么、不能证明什么，最后看攻击者怎样伪造证据。中文与英文两版。

制作流程与标准见仓库的 `docs/`；片中每一句陈述的出处见 `research/FACTS.md`。

## 当前状态与接续

阶段：准备到可交接前；中文稿待 WaterRun 确认，确认后合成配音并交接 Opus 5.5。文案：未确认。交付：未完成。发布：未发布。归档：未归档。

| 项 | 当前记录 |
|---|---|
| 最近完成的步骤与版本 | 2026-10-18：事实测绘；包豪斯 `style.css` 与四张关键帧；委托任务书与场景空壳。2026-10-19：按“怎么验证”重写为 7 场——口令、短信码/passkey、会话 cookie、JWT、联合登录、攻击面；JWT 先由会话表的共享问题引出，再讲三段结构、签名与撤销代价。中文稿 `49658ee9…`，英文草稿 `5359b29d…`，估算 200.0 秒；`production.mode=delegated`，maker=Opus 5.5，prepared_by=DeepSeek V4.1 Flash 1017 |
| 下一步及依赖 | WaterRun 按句号审阅中文稿 → 明确确认 → 运行 `tts.js` 合成中英旁白并核对读音 → `check.js --handoff` → Opus 5.5 开工 |
| 当前稿本 / 校对结论 | `src/js/script.js`；中文内容 SHA-256 `49658ee9…`；`review/approval.json` 为 pending；没有人工确认 |
| 输出在哪台制作机 | 制作机 A（Windows）；没有成片 |
| 未完成、未检查与阻塞 | 人工确认、中英配音、读音核对、`--handoff` 检查、Opus 5.5 的场景/声音/封面/渲染均未做 |

## 文案与校对

唯一文案源稿：`src/js/script.js`。指定校对者：WaterRun。

```bash
node kit/tools/script-review.js videos/series/in-seconds/web-login export
node kit/tools/script-review.js videos/series/in-seconds/web-login check
```

导出的 `review/script.<语言>.<哈希>.md` 供逐句阅读，意见写在 `review/NOTES.md`。先取得明确确认，再按真实记录填写 `review/approval.json`；主语言通过后翻译并校对其他语言。具体边界见仓库 `docs/script-review.md`。

本轮中文稿：[`review/script.zh.49658ee9…md`](review/script.zh.49658ee9ea1555c14281a94d54b5cace1f404936eca62497c3df5270e114a1c0.md)，内容哈希 `49658ee9ea1555c14281a94d54b5cace1f404936eca62497c3df5270e114a1c0`；英文草稿：[`review/script.en.5359b29d…md`](review/script.en.5359b29d9519ab518796c16b63f31ba3a7ee185595857a67e109ec7d5652059e.md)。`review/approval.json` 仍是 pending，不能据此配音。更早的 `298d8d99…`、`62c86207…`、`53db476c…` 保留在 `review/`，作为对照。

## 开工反馈应用

<!-- 开工必填，改片另起本轮记录。先读 docs/feedback.md 与最近相关复盘；按总账带入全部问题编号，新增编号也须补入。不适用写具体原因，不能只写“已阅读反馈”。 -->

反馈版本：2026-10-18（F01–F12）。本片逐项记录在 `review/feedback.json`；相关复盘：`docs/feedback.md`（2026-10-18 读取）的 P0–P13、C1–C14 与 F01–F12；重点看 P2/P3（卡片与转场同质化）、P6（镜头别晃）、P9（术语第一次出现要解释）和 F01–F03。

目标观众已有的知识：每天上网、登录过各种网站；知道口令、短信验证码、指纹/人脸、第三方登录这些词；没有系统学过 cookie、session、OAuth、JWT、passkey 的区别。

看完应能回答的一个核心问题：网站怎么确认屏幕对面是“你”，而不是拿着你的口令、cookie、验证码或 token 的别人。

逐章怎样推进问题、最后回答什么：先问“服务器凭什么确认是你” → 口令验证“知道” → 短信码验证“拥有”、passkey 验证“持有私钥” → cookie 验证“会话连续”，JWT 验证“签名和声明” → 联合登录验证“第三方断言” → 攻击者伪造证据 → 收束（验证=证据对照规则，没有万能机制）。

本片决定不讲的材料及理由：所有 OAuth grant type、SAML 断言细节、JWT/JWKS 细节、账号恢复/风控/设备指纹、具体厂商实现差异。SAML 不单独展开，企业 SSO 只作为“让第三方替你证明”的一句例子；200 秒里这些细节会挤掉“服务器到底在验证什么”的主线。

| 问题编号 | 适用性 / 不适用的原因 | 本片计划与正面对照 | 怎样验证 |
|---|---|---|---|
| F01 标题与主问题 | 适用 | 标题是“怎么验证你是你”，不是“登录方式大全”；每个机制都回答“服务器拿什么证据、按什么规则验证” | 审稿时标出开头问题、各场“验证什么”和结尾回答的时刻 |
| F02 解释步骤与理解负担 | 适用 | 每次验证都走完“证据 → 规则 → 结果”：口令比对哈希、短信码查码、passkey 验签名、cookie 查表、JWT 验签名/声明 | 正常播放检查每个机制能否说出“服务器在验证什么”；记录每步时间 |
| F03 名称、比较与边界 | 适用 | JWT 先由会话表的共享问题引出，再讲三段结构；区分 OAuth 授权与 OIDC 身份、cookie 连续与 JWT 无状态、口令/OTP/passkey 各自证明什么 | 审稿时核对首次定义、过渡句和画面文字 |
| F04 有效阅读时间 | 适用 | 用 7 场结构，不做“刷一下”的章节卡；片名/结论卡按 3–5 秒完整阅读设计 | 成片用 `sheets.js cue` 与逐帧检查卡片停留 |
| F05 动画解释机制 | 适用 | 形状拼合、单向压模、盖章、黑框拒绝四种动作各有语义；不做全片同一种擦除 | 与近期两部并排看开头/换章/解释段 |
| F06 声音选择与配合 | 适用 | 木块、印章、卡扣、纸张各有语义；不用默认 whoosh；配乐写清节奏、动机与加层 | 主混音/无配乐版试听，记录片段与结果 |
| F07 隐私与脱敏 | 适用 | 画面只用假域名、假 SID、假用户名；不出现真实站点、真实 cookie、真实账号 | 检查最终 MP4、字幕、封面与 FACTS 回显 |
| F08 最终文件与记录 | 适用 | 目标 200 秒 ±0.1；60fps、立体声、响度按仓库默认；出片后记录实际编码参数与哈希 | `check.js`、`ffprobe`、实际音轨测量与 README 对照 |
| F09 证据与反馈来源 | 适用 | “OAuth=登录”“JWT 加密”“HTTPS 让 cookie 安全”“MFA=短信”“指纹是认证器”等容易引战；每条回到 FACTS 的来源与版本 | 审稿与成片复核时逐条对照 `FACTS.md` 的“边界与常见误说” |
| F10 单集独立可懂 | 适用 | 本集独立；不要求记得 2FA/Lean 等前集。 | 不看前集也能理解；审稿逐句检查前集引用。 |
| F11 外文材料的中文解释 | 适用 | authentication/authorization/session、OAuth/OIDC/JWT/passkey/SSO 首次出现给中文解释；RFC 引文不要求观众读英文。 | 审稿时能找到每个外文术语的中文解释；不要求观众读 RFC 原文。 |
| F12 读音、断句与口播 | 适用 | OAuth、OIDC、JWT、passkey、SSO、SameSite、HttpOnly、CSRF、TLS 列试听清单。 | tts_probe/asr 回听；人耳确认读错/断句；记录时间点。 |

## 内容

大纲见 `research/NARRATIVE.md`。以下只是章节骨架，不是旁白；起点要等实测时间线。

| 场景 | 起点 | 内容 |
|---|---|---|
| open | 0:00 | 输入账号口令 → 服务器凭什么确认 → 四种证据；片名卡 |
| password | 0:18 | 账号+口令、TLS、盐/慢哈希、比对；只验证“知道” |
| factors | 0:48 | 短信码验证“拥有”；passkey 验证“持有私钥” |
| session | 1:10 | 会话表验证连续性；JWT 用签名和声明代替查表 |
| federation | 2:06 | Google/SSO、code、OIDC ID Token、PKCE；验证第三方断言 |
| attacks | 2:33 | 伪造证据：钓鱼、撞库、XSS、CSRF、固定、JWT 被偷 |
| close | 2:57 | 验证=证据对照规则；没有万能机制；片尾名单 |

## 视觉系统

包豪斯：红/黄/蓝三块纯色 + 黑/米白，圆=你知道的、方=你拥有的、三角=你本身，黑框=验证者，票=session，带签名缺口的长条=JWT，两个黑框互交=联合登录，单向压模=哈希，带缺口的钥匙=WebAuthn。三四个大形状撑起一屏，字很少，形状可以转角度；字也当形状（竖排/沿弧线短标签）。完整规范、色彩/字体/图形语义、封面与禁止项见 [`src/design/STYLE.md`](src/design/STYLE.md)，token 见 [`src/design/tokens.css`](src/design/tokens.css)。

视觉系统已落到 [`src/css/style.css`](src/css/style.css)；四张参考关键帧在 [`src/design/kf.html`](src/design/kf.html)（`?f=1` 标题、`?f=2` 哈希、`?f=3` 会话票、`?f=4` 因子/WebAuthn）。参考来源：策划者提供的「包豪斯」风格卡；本片把形状转译为认证因子与验证动作。没有使用名叫 Bauhaus 的字体，也没有复刻红黄蓝三角圆方的通用海报；具体选择见 STYLE.md 第 1、5、8 节。

这是「XX 秒速通」的视觉例外：保留系列的定长时间线、语速、字幕带/秒尺、剩余秒数、右上角仪表的位置与做法，只换视觉系统；理由写在系列说明的视觉例外里。

## 取证

- 标准：RFC 6265（cookie）、RFC 6749（OAuth 2.0）、RFC 7636（PKCE）、RFC 7519（JWT）、RFC 7617（Basic）、OIDC Core 1.0、W3C WebAuthn Level 2、NIST SP 800-63B-4、NIST SP 800-63C（federation/SSO）。
- 工程实践：OWASP Authentication / Password Storage / Session Management 三份 cheat sheet；读取日 2026-10-18。
- 历史：Netscape cookie 规格存档；Dave Kristol 2002 年关于 Lou Montulli 1994 年在 Netscape 发明 cookie 的邮件。
- 没有做真实站点实验；本片不展示任何真实账号、cookie 或站点配置。重做时按 `research/sources.json` 的链接逐条打开，注意页面日期与版本。

## 读法

`script.js` 的 `SAY` 表已列 session ID、passkey、SSO、OAuth 2.0、OIDC、JWT、PKCE、TLS、HttpOnly、SameSite、CSRF、XSS 的读法。尚未配音，未做 `tts_probe`/`asr` 回听；确认后在此登记实际读法与修正。

## 制作署名与片尾

策划：WaterRun。

开源视频：[本片源码](https://github.com/Water-Run/ft)。片尾须展示「开源视频」与完整可读的网址。

<!-- 根据 research/FACTS.md 的「制作署名」记录填写实际参与模型，不猜测版本；未披露模型的服务如实注明。所有语言、各交付视频版本都须包含完整名单。 -->

| 参与模型（含可确认的版本） | 实际分工 |
|---|---|
| DeepSeek V4.1 Flash 1017 | 准备方：事实测绘、Web Fetch 来源核对、RFC/W3C/NIST/OWASP 核对、叙事测绘、中文初稿/英文草稿、审稿包、包豪斯视觉系统与关键帧、逐句对应表、任务书 |
| Opus 5.5 | 受托方：场景实现、常驻元素、声音编排、封面、渲染、三项审查与交付（尚未开工） |

Opus 5.5 当前没有开工；`review/approval.json` 仍为 pending，旁白也未合成。

网页来源通过 Web Fetch 读取原文；PDF 与 403 页面用下载/存档文本核对。

片尾时段与各语言版本的核对结果：未做（没有成片）。

<!-- 各语言、各视频版本的片尾时段与核对结果：完整性、字号、对比度、停留时间；名单与成片一致。 -->

## 复现

```bash
node kit/tools/script-review.js videos/series/in-seconds/web-login check  # 核对当前稿本的人工确认
node kit/tools/tts.js    videos/series/in-seconds/web-login --lang all     # 合成旁白，更新时间线
node kit/tools/check.js  videos/series/in-seconds/web-login                # 制作期总闸门
node kit/tools/audio.js  videos/series/in-seconds/web-login --lang all     # 混音
node kit/tools/render.js videos/series/in-seconds/web-login --lang all     # 渲染
node kit/tools/finish.js videos/series/in-seconds/web-login --lang all     # 封装成片
node kit/tools/covers.js videos/series/in-seconds/web-login --lang all     # 封面
node kit/tools/check.js  videos/series/in-seconds/web-login --final        # 交付前总闸门
```

## 成片

<!-- 时长、规格、交付物清单；事实、读音与节奏、旁白与画面对应的审查结果；原创与动画完成度的检查范围、缺陷与修正；需要人来判断的事项（配乐听感、音色、画面观感）。自动闸门通过不代替上述检查，未核查的如实写明。 -->

## 结尾反馈复盘

<!-- 交付前必填。逐行引用开工表中的同一组编号（F01–F12 及后续新增项），不可只写“全部通过”。注明最终 MP4 的语言、版本或哈希；各项列出实际时间窗口和证据。没有播放/试听的范围保留待复核。委托片在 DELIVERY.md 同步结论。 -->

本次核查的最终文件、语言与版本 / SHA-256：

| 问题编号 | 开工计划 → 实际做法 | 成片时间区间、检查方法与证据 | 结果 / 未解决项与下一步 |
|---|---|---|---|
| F01 | | | |
| F02 | | | |
| F03 | | | |
| F04 | | | |
| F05 | | | |
| F06 | | | |
| F07 | | | |
| F08 | | | |
| F09 | | | |
| F10 | | | |
| F11 | | | |
| F12 | | | |

<!-- 结果使用“已验证 / 已修改待复核 / 待修改 / 待事实核查 / 不适用（原因）”。补记新发现与反馈总账的关联；修改后另存复测，不覆盖历史评分。 -->

## 发布、归档与清理

<!-- 交付后按 docs/lifecycle.md 执行。发布不是归档的前提；记录实际状态。归档路径含个人信息时仅在本机保存，公开表只写不含身份信息的备份代号。 -->

| 项 | 记录 |
|---|---|
| 平台链接、标题、发布时间与时长 | 未发布 |
| 最终文件、语言、规格、SHA-256 | |
| 实际 Node、Chrome、ffmpeg、Python 与包版本 | |
| 归档代号、manifest.json 哈希、校验日期 | 未归档 |
| 备份介质与恢复抽验结果 | 未检查 |
| 清理范围、时间、取证实验资源撤除 | 未清理 |
| 需保留的复盘证据与后续修订 | |

```bash
node kit/tools/clean.js videos/series/in-seconds/web-login   # 只预览，不删除
```
