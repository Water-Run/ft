# 任务入口：制作《200 秒了解 Web 登录机制：怎么验证你是你》

> **状态：准备中，尚未交接。** 本文件是准备方 DeepSeek V4.1 Flash 1017 写给受托模型 Opus 5.5 的任务入口。只有 `review/approval.json` 的中英两版都为 `approved`、且 `audio/` 里已有实测旁白时，才开始做场景；否则停下来报告。

准备方：DeepSeek V4.1 Flash 1017。策划/校对：WaterRun。受托方：Opus 5.5。

## 1. 要做出什么

一部 200 秒、1920×1080、60 帧/秒的视频，中文与英文两版，带旁白、内嵌字幕、配乐与音效；每种语言两版封面（16:9 与 4:3）。

主题：Web 登录机制怎样验证“你是你”。先分清认证、会话、授权、令牌四层：Session 是服务器会话状态，Session ID 是标识，Cookie 只是运输；JWT 是 token 格式，不是 Session；再讲口令/短信码/passkey/验证码等认证方式，OAuth/OIDC 的授权与委托；最后看各层攻击面。视觉：包豪斯（红黄蓝几何 + 黑/米白、平涂、形状承担语义）。

受众：每天上网、登录过网站，知道口令/短信码/指纹/第三方登录这些词，但没有系统学过 cookie、session、OAuth、JWT、passkey 的区别。

## 2. 分工

**已经做好，直接用，不要重做：**

| 内容 | 位置 |
|---|---|
| 事实取证（RFC/W3C/NIST/OWASP，逐条依据） | `research/FACTS.md`、`research/sources.json` |
| 中文初稿与英文草稿（待 WaterRun 确认） | `src/js/script.js`、`review/script.zh.*.md`、`review/script.en.*.md` |
| 审稿记录、术语表、待确认问题 | `review/NOTES.md`、`review/approval.json`（当前 pending） |
| 视觉系统（包豪斯） | `src/css/style.css`、`src/design/STYLE.md`、`src/design/tokens.css` |
| 四张参考关键帧 | `src/design/kf.html`（`?f=1` 标题、`?f=2` 哈希、`?f=3` 会话/JWT、`?f=4` passkey） |
| 逐句对应表 | `expect.zh.json`、`expect.en.json` |
| 场景空壳 | `src/js/scenes/shells.js`（7 个内容场景 + 片尾，共 8 个 `scene(...)` 入口） |

**归你做：**

1. 把 `src/js/scenes/shells.js` 拆成/实现为各场景，按 `brief/04-storyboard.md`；常驻元素（右上角仪表）在 `src/js/config.js`。
2. 声音编排：按 `brief/05-motion-sound.md` 选择音效、写配乐；混音与试听片。
3. 两种语言的两版封面：`src/cover.html`。
4. 渲染、封装、三项审查（事实、读音与节奏、旁白与画面对应）。
5. `DELIVERY.md`；`research/FACTS.md` 的「复核」；本片 `README.md` 的状态与结尾反馈复盘。

## 3. 阅读顺序

1. 本文件。
2. `brief/01-mission.md` → `02-script.md` → `03-visual.md` → `04-storyboard.md` → `05-motion-sound.md` → `06-acceptance.md`。
3. 仓库 `docs/standards.md`、`docs/feedback.md`、`docs/review.md`、`docs/scenes.md`、`docs/sound.md`、`docs/tools.md`、`docs/engine.md`、`docs/pitfalls.md`。
4. `research/FACTS.md`、`review/NOTES.md`、`src/design/kf.html`、`src/css/style.css`。

## 4. 环境

- 工作目录是仓库根目录；本片在 `videos/series/in-seconds/web-login`。命令形如 `node kit/tools/<工具>.js videos/series/in-seconds/web-login [参数…]`。
- 开工先跑 `node kit/tools/doctor.js videos/series/in-seconds/web-login`。
- 只改本片目录；不改 `kit/`、`docs/`、别的视频，不改 `src/js/engine.js`、`util.js`、`boot.js`、`css/base.css`。
- 不要启动常驻服务器；工具会自己起临时服务器。

## 5. 工作步骤

| 步 | 做什么 | 命令 | 过关条件 |
|---|---|---|---|
| 0 | 确认版本闸门与环境 | `node kit/tools/script-review.js videos/series/in-seconds/web-login check`<br>`node kit/tools/doctor.js videos/series/in-seconds/web-login` | 两版 `approved`；环境可用。未通过就停下报告，不要自行配音或改稿 |
| 1 | 读关键帧与示范部件 | `node kit/tools/look.js videos/series/in-seconds/web-login --url "/design/kf.html?f=1" --size 1920x1080` 等四张 | 看懂 `look.js` 的文字输出；不要重做视觉系统 |
| 2 | 写 `brief/storyboard-detail.md` | — | 每句一行：画面、动作、镜头、音效；先写再写代码 |
| 3 | 实现 `config.js` 的右上角仪表 | `look.js` 查几个时刻 | 仪表可见，不与字幕/剩余秒数冲突 |
| 4 | 逐个实现 7 个内容场景 + 片尾 | 每场 `look.js --scene <id>`、`scan.js --from/--to` | 该场无错误 |
| 5 | 全片自检 | `node kit/tools/check.js videos/series/in-seconds/web-login` | 全部通过 |
| 6 | 混音与读音核对 | `audio.js`、`asr.js` | 混音成功；读音核对记录写进 README |
| 7 | 低清预演 | `preview.js` | 无超限静止段 |
| 8 | 封面 | `cover.html`、`look.js --url`、`covers.js` | 每语言 2 张 JPG、2 张 PNG |
| 9 | 渲染与封装 | `render.js`、`finish.js` | 末行 `verified frames=`；时长与 200 秒一致；响度合格 |
| 10 | 三项审查与反馈复盘 | `sheets.js cue`、`sheets.js every 4`、实际 MP4 | 无未解决项；F01–F12 逐项有成片时间与证据 |
| 11 | 交付前总检 | `check.js --final` | 全部通过；`DELIVERY.md` 写完 |

## 6. 铁律

1. 事实只来自 `research/FACTS.md`；画面上的数字、协议名、年份与引文逐字一致，不凭记忆补。
2. 画面只由时间 `t` 决定：不用 CSS transition/animation、定时器、`tl.call()`、`Math.random`；用引擎的 `F()`、`keyed()`、`classAt()`。
3. 时间点写 `T(句号, 词)`，不写死秒数。
4. 只用本片包豪斯视觉：颜色/字体用 `style.css` 变量；形状语义不破例；不用阴影、渐变、毛玻璃、圆角卡片。
5. 动画要精美：镜头连续运动；任意 3 秒有可感知变化；形状拼合/压模/盖章/拒绝各有语义；按 12fps 步进，不做平滑缓动。
6. 声音服务内容：关键动作才配音效；慢移/阅读保持可留白；不用默认 whoosh；配乐 120 BPM，旁白优先。
7. 不泄露本机信息：画面、封面、说明不出现主机名、用户名、内网地址、真实账号/cookie。
8. 不谎报：没做写“未做”，没通过写“未通过”并贴工具输出；看不到画面/听不到声音如实写。
9. 不为过关改规则：不改 `kit/`、`project.json.check`、`expect.*.json`。
10. 不抄袭：不照搬现成产品/海报/聊天 UI；参考来源与独立设计选择写进 README。
11. 片尾名单完整：策划 WaterRun、准备方 DeepSeek V4.1 Flash 1017、受托方 Opus 5.5 及实际分工；各语言、各版本一致可读。
12. 片尾展示「开源视频」与 `github.com/Water-Run/ft`，网址完整可读。
13. 开工与结尾都按 F01–F12 复盘；结尾写实际成片时间、证据、结果与遗留项。

## 7. 遇到问题时

- 工具报错：先读 `docs/pitfalls.md`，自己解决。
- 闸门不过：按 `docs/review.md` 改画面，不改规则。
- 只有两种情况停下报告：工具缺陷无法继续；发现 `FACTS.md` 或旁白有事实错误。

## 8. 完成的定义

`check.js --final` 输出「全部通过」，`docs/review.md` 第 5 节检查完成，`DELIVERY.md`、`FACTS.md` 的「制作署名」「复核」、本片 README 与结尾反馈复盘都已写好。汇报：成片位置、时长、闸门结果、审查与片尾核对、反馈处理、需要人判断的事项。
