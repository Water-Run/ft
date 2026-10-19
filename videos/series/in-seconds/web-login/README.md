# 200 秒了解 Web 登录机制：怎么验证你是你

一部 200 秒的 Web 登录科普：先分清认证、会话、授权、令牌四层；Session 是服务器上的会话状态，Session ID 是标识，Cookie 只是运输；JWT 是 token 格式，不是 Session。再讲口令/短信码/passkey/验证码等认证方式，以及 OAuth/OIDC 的授权与委托。中文与英文两版。

制作流程与标准见仓库的 `docs/`；片中每一句陈述的出处见 `research/FACTS.md`。

## 当前状态与接续

阶段：文案第 7 轮待审；中文稿待 WaterRun 确认，确认后重译英文、合成配音、按定稿重写交接材料，再交接 Opus 5.5。文案：未确认。交付：未完成。发布：未发布。归档：未归档。

| 项 | 当前记录 |
|---|---|
| 最近完成的步骤与版本 | 2026-10-18：事实测绘；包豪斯 `style.css` 与四张关键帧；委托任务书与场景空壳。2026-10-19：从根上按“四层”重写为 7 个内容场景——Session（会话状态/Session ID/Cookie 运输/缺点）→ JWT（token 格式/三段/验签/Access/Refresh/撤销）→ 认证方式（口令/短信码/passkey/验证码）→ OAuth/OIDC 授权与委托 → 各层攻击面 → 收束。中文稿 `4c5c728f…`，英文草稿 `7e5b8ad4…`，估算 200.0 秒；`production.mode=delegated`，maker=Opus 5.5，prepared_by=DeepSeek V4.1 Flash 1017 |
| 2026-10-19 第 8 轮 | 按 WaterRun「按照你的建议来重写文案」定 5 项取舍：三件事、先会话、守 200 秒只加回口令「故意算得慢」、跨站请求伪造一句、片名卡 2.5 秒；中文 `c2a62ed5…`，估算 200.0 秒 |
| 2026-10-19 第 7 轮 | Claude Opus 5.5 逐句重写中文：同一次登录贯穿，开场分认证/会话/授权三件事，每个机制一条主因果，删去攻击面一场；中文 `7c7c9cba…`，估算 200.0 秒。待决问题与删减清单见 `review/NOTES.md` |
| 下一步及依赖 | WaterRun 按句号审阅第 8 稿 → 明确确认 → 重译英文并交审 → 按定稿重写 `expect.*.json`、`brief/02-script.md`、`brief/04-storyboard.md` → `tts.js` 合成并核对读音 → `check.js --handoff` → Opus 5.5 开工 |
| 当前稿本 / 校对结论 | `src/js/script.js`；中文内容 SHA-256 `c2a62ed5…`；`review/approval.json` 为 pending；没有人工确认。英文仍是第 6 轮草稿，估算超时约 23 秒 |
| 输出在哪台制作机 | 制作机 A（Windows）；没有成片 |
| 未完成、未检查与阻塞 | 人工确认、中英配音、读音核对、`--handoff` 检查、Opus 5.5 的场景/声音/封面/渲染均未做 |

## 文案与校对

唯一文案源稿：`src/js/script.js`。指定校对者：WaterRun。

```bash
node kit/tools/script-review.js videos/series/in-seconds/web-login export
node kit/tools/script-review.js videos/series/in-seconds/web-login check
```

导出的 `review/script.<语言>.<哈希>.md` 供逐句阅读，意见写在 `review/NOTES.md`。先取得明确确认，再按真实记录填写 `review/approval.json`；主语言通过后翻译并校对其他语言。具体边界见仓库 `docs/script-review.md`。

本轮中文稿：[`review/script.zh.c2a62ed5…md`](review/script.zh.c2a62ed5fe18364916932f0246a00423552ea2e91d4d8c117e75692293ff3830.md)，内容哈希 `c2a62ed5fe18364916932f0246a00423552ea2e91d4d8c117e75692293ff3830`。第 7 轮 `7c7c9cba…` 保留作对照。英文未随本轮重译。`review/approval.json` 仍是 pending，不能据此配音。第 6 轮 `4c5c728f…` 及更早的 `298d8d99…`、`62c86207…`、`53db476c…` 保留在 `review/`，作为对照。

## 开工反馈应用

<!-- 开工必填，改片另起本轮记录。先读 docs/feedback.md 与最近相关复盘；按总账带入全部问题编号，新增编号也须补入。不适用写具体原因，不能只写“已阅读反馈”。 -->

反馈版本：2026-10-19.2（F01–F15；F04 升为核心规则，新增 F15）。本片逐项记录在 `review/feedback.json`；相关复盘：`docs/feedback.md`（2026-10-18 读取）的 P0–P13、C1–C14 与 F01–F12；重点看 P2/P3（卡片与转场同质化）、P6（镜头别晃）、P9（术语第一次出现要解释）和 F01–F03。

目标观众已有的知识：每天上网、登录过各种网站；知道口令、短信验证码、指纹/人脸、第三方登录这些词；没有系统学过 cookie、session、OAuth、JWT、passkey 的区别。

看完应能回答的一个核心问题：网站怎么确认屏幕对面是“你”，而不是拿着你的口令、cookie、验证码或 token 的别人。

逐章怎样推进问题、最后回答什么：cookie 验证“会话连续” → 缺点是服务器要存/共享会话表、cookie 可被偷/CSRF → JWT 用签名和声明代替查表 → 缺点是撤销麻烦、token 可被偷 → 那第一次怎么验证？口令验证“知道” → 短信码验证“拥有”、passkey 验证“私钥” → 验证码只验证“你是人” → 委托验证验证“第三方断言” → 攻击者伪造证据 → 收束（没有万能机制，按证据/规则/代价选）。

本片决定不讲的材料及理由：所有 OAuth grant type、SAML 断言细节、JWT/JWKS 细节、账号恢复/风控/设备指纹、具体厂商实现差异。SAML 不单独展开，企业 SSO 只作为“让第三方替你证明”的一句例子；200 秒里这些细节会挤掉“服务器到底在验证什么”的主线。

| 问题编号 | 适用性 / 不适用的原因 | 本片计划与正面对照 | 怎样验证 |
|---|---|---|---|
| F01 标题与主问题 | 适用 | 同一次登录贯穿；开场分认证/会话/授权三件事；Cookie 只运送，JWT 是票的格式；结尾 e2 回答“服务器认的是你出示的证据” | 开头三件事、各场问题与结尾是否对应 |
| F02 解释步骤与理解负担 | 适用 | 每个机制一条主因果：做法 → 为什么能认出你 → 代价 → 引出下一种；删去只列名词的攻击一场 | 正常播放检查每场能否说出“怎么认出你、代价是什么”；记录每步时间 |
| F03 名称、比较与边界 | 适用 | 区分 Session/Session ID/Cookie/JWT/Access Token/Refresh Token；认证≠会话≠授权；不把 Google 当独立方式 | 审稿时核对首次定义、过渡句和画面文字 |
| F04 有效阅读时间（核心） | 适用 | 6 个内容场景 + 片尾；片名卡 oT 2.5 秒并与 o3b 同屏；关键状态完整出现后按 1.5 秒 + 字数 ÷ 5 留足再换 | 实际 MP4 逐屏记录“全部到位”到“开始退场”的区间；需要暂停才看得完即不通过 |
| F05 动画解释机制 | 适用 | 形状拼合、单向压模、盖章、黑框拒绝四种动作各有语义；不做全片同一种擦除 | 与近期两部并排看开头/换章/解释段 |
| F06 声音选择与配合 | 适用 | 木块、印章、卡扣、纸张各有语义；不用默认 whoosh；配乐写清节奏、动机与加层 | 主混音/无配乐版试听，记录片段与结果 |
| F07 隐私与脱敏 | 适用 | 画面只用假域名、假 SID、假用户名；不出现真实站点、真实 cookie、真实账号 | 检查最终 MP4、字幕、封面与 FACTS 回显 |
| F08 最终文件与记录 | 适用 | 目标 200 秒 ±0.1；60fps、立体声、响度按仓库默认；出片后记录实际编码参数与哈希 | `check.js`、`ffprobe`、实际音轨测量与 README 对照 |
| F09 证据与反馈来源 | 适用 | “OAuth=登录”“JWT 加密”“HTTPS 让 cookie 安全”“MFA=短信”“指纹是认证器”等容易引战；每条回到 FACTS 的来源与版本 | 审稿与成片复核时逐条对照 `FACTS.md` 的“边界与常见误说” |
| F10 单集独立可懂 | 适用 | 本集独立；不要求记得 2FA/Lean 等前集。 | 不看前集也能理解；审稿逐句检查前集引用。 |
| F11 外文材料的中文解释 | 适用 | authentication/authorization/session、OIDC/SAML/JWT/passkey 首次出现给中文解释；RFC 引文不要求观众读英文。 | 审稿时能找到每个外文术语的中文解释；不要求观众读 RFC 原文。 |
| F12 读音、断句与口播 | 适用 | OIDC、SAML、JWT、passkey、SameSite、HttpOnly、CSRF、TLS 列试听清单。 | tts_probe/asr 回听；人耳确认读错/断句；记录时间点。 |
| F13 背景、年代与观看路线 | 适用 | 技术主题，不需要年代史；用 HTTP 无状态作背景，交代四层定位与 Session→JWT→认证→OAuth 的路线 | 首次观看能否复述对象、背景与路线 |
| F14 片尾署名与旁白分开 | 适用 | 片尾用空字幕 + pause + credits:true；名单与开源地址只做画面，不配旁白；制作说明留在 README/FACTS | 成片片尾无人声、名单与网址可读 |
| F15 制作者口吻的自我说明 | 适用 | 画面不写“示意”“假数据”“已脱敏”之类说明；假域名、假编号直接用 | 逐屏列出说明性小字，正常人做视频不会写的删去 |

## 内容

大纲见 `research/NARRATIVE.md`。以下只是章节骨架，不是旁白；起点要等实测时间线。

| 场景 | 起点 | 内容 |
|---|---|---|
| open | 0:00 | 登录后它再也没问过密码 → 问句 → 片名 → 认证、会话、授权三件事 |
| session | 0:26 | HTTP 不记事 → 服务器记会话、发 Session ID → Cookie 带回 → 查表；代价：编号被拿、跨站请求伪造 |
| jwt | 1:07 | 多台服务器共用表 → 签名票 JWT → 内容可读、改字验签失败 → 不查表；代价：难收回 → 短有效期 |
| authn | 1:37 | 口令（只存算不回去的摘要）→ 会被骗 → 短信码也会被转 → passkey 公私钥、只给注册网站签名；验证码只分辨人和程序 |
| oauth | 2:25 | 平台替你认 → 一次性码换票 → OAuth 是授权、Access Token → OIDC 与 ID Token；代价：信任集中 |
| close | 3:02 | 第一次看证据，之后认编号或票；服务器认的是你出示的证据；片尾名单 |

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
