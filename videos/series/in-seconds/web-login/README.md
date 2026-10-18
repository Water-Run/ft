# 200 秒了解 Web 登录机制：怎么验证你是你

一部 200 秒的 Web 登录科普：口令与慢哈希、cookie 与会话、CSRF/会话劫持/钓鱼、多因素与 WebAuthn，以及 OAuth/OIDC 的联合登录怎样把“你是谁”交给别人验证。中文与英文两版。

制作流程与标准见仓库的 `docs/`；片中每一句陈述的出处见 `research/FACTS.md`。

## 当前状态与接续

阶段：事实测绘与视觉方向已落盘。文案：未写、未确认。交付：未完成。发布：未发布。归档：未归档。

| 项 | 当前记录 |
|---|---|
| 最近完成的步骤与版本 | 2026-10-18：RFC 6265/6749/7519/7617/7636、OIDC Core、W3C WebAuthn、NIST 800-63B-4、OWASP 三份 cheat sheet 核对；`research/FACTS.md`、`sources.json`、`NARRATIVE.md`；包豪斯设计方向与 token |
| 下一步及依赖 | 写中文稿 → 交 WaterRun 逐句审查并明确确认 → 翻译/校对英文 → 配音 → 视觉关键帧 → 场景 |
| 当前稿本 / 校对结论 | `src/js/script.js` 仍是模板骨架；没有文案确认 |
| 输出在哪台制作机 | 制作机 A（Windows）；没有成片 |
| 未完成、未检查与阻塞 | 文案、时间线、关键帧、场景、声音、渲染、审查、封面均未做 |

## 文案与校对

唯一文案源稿：`src/js/script.js`。指定校对者：WaterRun。

```bash
node kit/tools/script-review.js videos/series/in-seconds/web-login export
node kit/tools/script-review.js videos/series/in-seconds/web-login check
```

导出的 `review/script.<语言>.<哈希>.md` 供逐句阅读，意见写在 `review/NOTES.md`。先取得明确确认，再按真实记录填写 `review/approval.json`；主语言通过后翻译并校对其他语言。具体边界见仓库 `docs/script-review.md`。

## 开工反馈应用

<!-- 开工必填，改片另起本轮记录。先读 docs/feedback.md 与最近相关复盘；按总账带入全部问题编号，新增编号也须补入。不适用写具体原因，不能只写“已阅读反馈”。 -->

反馈版本：2026-10-18（F01–F12）。本片逐项记录在 `review/feedback.json`；相关复盘：`docs/feedback.md`（2026-10-18 读取）的 P0–P13、C1–C14 与 F01–F12；重点看 P2/P3（卡片与转场同质化）、P6（镜头别晃）、P9（术语第一次出现要解释）和 F01–F03。

目标观众已有的知识：每天上网、登录过各种网站；知道口令、短信验证码、指纹/人脸、第三方登录这些词；没有系统学过 cookie、session、OAuth、JWT、WebAuthn 的区别。

看完应能回答的一个核心问题：网站怎么确认屏幕对面是“你”，而不是拿着你的口令、cookie 或验证码的别人。

逐章怎样推进问题、最后回答什么：登录那一刻（口令/TLS/慢哈希）→ 之后为什么不用再填（session cookie）→ 这串东西为什么危险（XSS/CSRF/session fixation）→ 只靠口令不够（因子、OTP、WebAuthn）→ 用 Google/微信登录（OAuth/OIDC/PKCE/JWT）→ 收束（一条链，每一环都有假设）。

本片决定不讲的材料及理由：所有 OAuth grant type、SAML/SSO、JWT/JWKS 细节、账号恢复/风控/设备指纹、具体厂商实现差异。理由见 `research/NARRATIVE.md`：200 秒里这些会挤掉“登录到底发生什么”的主线。

| 问题编号 | 适用性 / 不适用的原因 | 本片计划与正面对照 | 怎样验证 |
|---|---|---|---|
| F01 标题与主问题 | 适用 | 标题是“怎么验证你是你”，不是“登录方式大全”；用一条链把口令、会话、MFA、联合登录串起来 | 审稿时标出开头问题、各章答案与结尾回答的时刻 |
| F02 解释步骤与理解负担 | 适用 | 用同一次登录走完：输入口令 → 服务器查哈希 → 发 session cookie → 下一次请求带 cookie；每一步交代输入、变化、理由、结果 | 正常播放检查能否从“口令正确”跟到“下一次请求为什么认得我”；记录每步时间 |
| F03 名称、比较与边界 | 适用 | 第一次出现 authentication/authorization/session/identity proofing、OAuth/OIDC、JWT/JWS 时各给一句定义；区分 2FA 与 MFA、口令与 passkey | 审稿时核对首次定义、版本标注和画面文字 |
| F04 有效阅读时间 | 适用 | 用 01–06 的段落编号，不做“刷一下”的章节卡；片名/结论卡按 3–5 秒完整阅读设计 | 成片用 `sheets.js cue` 与逐帧检查卡片停留 |
| F05 动画解释机制 | 适用 | 形状拼合、单向压模、盖章、黑框拒绝四种动作各有语义；不做全片同一种擦除 | 与近期两部并排看开头/换章/解释段 |
| F06 声音选择与配合 | 适用 | 木块、印章、卡扣、纸张各有语义；不用默认 whoosh；配乐写清节奏、动机与加层 | 主混音/无配乐版试听，记录片段与结果 |
| F07 隐私与脱敏 | 适用 | 画面只用假域名、假 SID、假用户名；不出现真实站点、真实 cookie、真实账号 | 检查最终 MP4、字幕、封面与 FACTS 回显 |
| F08 最终文件与记录 | 适用 | 目标 200 秒 ±0.1；60fps、立体声、响度按仓库默认；出片后记录实际编码参数与哈希 | `check.js`、`ffprobe`、实际音轨测量与 README 对照 |
| F09 证据与反馈来源 | 适用 | “OAuth=登录”“JWT 加密”“HTTPS 让 cookie 安全”“MFA=短信”“指纹是认证器”等容易引战；每条回到 FACTS 的来源与版本 | 审稿与成片复核时逐条对照 `FACTS.md` 的“边界与常见误说” |
| F10 单集独立可懂 | 适用 | 本集独立；不要求记得 2FA/Lean 等前集。 | 不看前集也能理解；审稿逐句检查前集引用。 |
| F11 外文材料的中文解释 | 适用 | authentication/authorization/session/identity proofing、OAuth/OIDC/JWT/JWS/WebAuthn 首次出现给中文解释；RFC 引文不要求观众读英文。 | 审稿时能找到每个外文术语的中文解释；不要求观众读 RFC 原文。 |
| F12 读音、断句与口播 | 适用 | Argon2id、bcrypt、OAuth、OIDC、JWT、WebAuthn、SameSite、HttpOnly、CSRF、TOTP、AAL 列试听清单。 | tts_probe/asr 回听；人耳确认读错/断句；记录时间点。 |

## 内容

大纲见 `research/NARRATIVE.md`。以下只是章节骨架，不是旁白；起点要等实测时间线。

| 场景 | 起点 | 内容 |
|---|---|---|
| open | 0:00 | 一串 SID 的钩子；片名卡 |
| password | 待定 | 登录表单、TLS、salt + 慢哈希；不是加密 |
| session | 待定 | `Set-Cookie`、session ID、服务端会话；为什么之后不用再填 |
| attacks | 待定 | XSS 读 cookie、CSRF 借浏览器、session fixation；HttpOnly/SameSite/换 ID |
| factors | 待定 | 知道/拥有/本身；AAL2；OTP 不防钓鱼；WebAuthn 的 origin 绑定 |
| federated | 待定 | OAuth 四角色、authorization code + PKCE、OIDC ID Token、JWT 签名≠加密 |
| close | 待定 | 一条链；片尾名单 |

## 视觉系统

包豪斯：红/黄/蓝三块纯色 + 黑/米白，圆=你知道的、方=你拥有的、三角=你本身，黑框=验证者，票=session，单向压模=哈希，带缺口的钥匙=WebAuthn。三四个大形状撑起一屏，字很少，形状可以转角度；字也当形状（竖排/沿弧线短标签）。完整规范、色彩/字体/图形语义、封面与禁止项见 [`src/design/STYLE.md`](src/design/STYLE.md)，token 见 [`src/design/tokens.css`](src/design/tokens.css)。

参考来源：策划者提供的「包豪斯」风格卡；本片把形状转译为认证因子与验证动作。没有使用名叫 Bauhaus 的字体，也没有复刻红黄蓝三角圆方的通用海报；具体选择见 STYLE.md 第 1、5、8 节。

这是「XX 秒速通」的视觉例外：保留系列的定长时间线、语速、字幕带/秒尺、剩余秒数、右上角仪表的位置与做法，只换视觉系统；理由写在系列说明的视觉例外里。

## 取证

- 标准：RFC 6265（cookie）、RFC 6749（OAuth 2.0）、RFC 7636（PKCE）、RFC 7519（JWT）、RFC 7617（Basic）、OIDC Core 1.0、W3C WebAuthn Level 2、NIST SP 800-63B-4。
- 工程实践：OWASP Authentication / Password Storage / Session Management 三份 cheat sheet；读取日 2026-10-18。
- 历史：Netscape cookie 规格存档；Dave Kristol 2002 年关于 Lou Montulli 1994 年在 Netscape 发明 cookie 的邮件。
- 没有做真实站点实验；本片不展示任何真实账号、cookie 或站点配置。重做时按 `research/sources.json` 的链接逐条打开，注意页面日期与版本。

## 读法

尚无旁白。写稿与合成后，在此登记送去合成的文本与字幕不同的地方（`script.js` 的 SAY 表）及原因。

## 制作署名与片尾

策划：WaterRun。

开源视频：[本片源码](https://github.com/Water-Run/ft)。片尾须展示「开源视频」与完整可读的网址。

<!-- 根据 research/FACTS.md 的「制作署名」记录填写实际参与模型，不猜测版本；未披露模型的服务如实注明。所有语言、各交付视频版本都须包含完整名单。 -->

| 参与模型（含可确认的版本） | 实际分工 |
|---|---|
| DeepSeek Flash（运行环境未披露更细版本） | 事实测绘、RFC/W3C/NIST/OWASP 核对、叙事测绘、包豪斯设计方向 |

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
