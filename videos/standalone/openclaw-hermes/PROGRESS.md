# 制作进度与接续（制作中，未提交）

状态：2026-10-06 停在「场景实现之前」。脚本、配音、取证数据、视觉方向都已定，场景与之后的步骤未做。流程见仓库 `docs/workflow.md`。

## 已完成

| 项 | 结果 |
|---|---|
| 立项 | `new.js` 已建目录并沿用片单里的 `openclaw-hermes` 独立条目；`doctor.js` 全绿 |
| 脚本 | `src/js/script.js`：8 个场景、97 句，中文为底本、英文由中文译出，读法表已按 ASR 试听调整；字幕宽度已过闸 |
| 配音 | `tts.js` 已合成两种语言：中文 7:41、英文 8:24（`timing.zh.js`、`timing.en.js`）。语速 `+4%` |
| 取证 | `research/lab/`：`01_collect.sh`（接口取证）、`02_extract.py`（源码片段、文档引文、扩展包统计）及各 `out_*`；数据截至 2026-10-06 |
| 画面数据 | `tools/gen_data.py` → `src/js/data.js`（不要手改） |
| 视觉 | 方向已定为 A「两个世界」，关键帧在 `src/design/frames.html`（`?f=A1…A6`）；`src/css/style.css`、`src/js/config.js`（章节卡与换场）已写 |

## 未完成（按顺序）

1. `src/js/parts.js`（部件：`stageOf`、`gfx`、`pixelText`、`colReveal`、`makeClaw`、`wing`、代码块、芯片等；`config.js` 已在调用 `makeClaw`、`pixelText`、`colReveal`、`wing`，**现在页面还跑不起来**），并更新 `src/index.html`（加载 `data.js`、`parts.js`，换成本片的场景文件，删掉模板的 `s0_open.js`/`s1_demo.js`）。
2. 场景 `open`、`map`、`claw`、`hermes`、`feishu`、`journey`、`compare`、`outro`（设计要点见下），边写边 `look.js`、`scan.js`、`check.js`；先验证一段代表性动画（信息最密的时间线 + 一次换场）。
3. `project.json`：`check.duration`（中文约 [440, 480]、英文约 [490, 520]）、`check.style.palette/fonts`、`audio.score` 的分章编排（OpenClaw 一侧偏节奏层，Hermes 一侧偏旋律层）；`expect.<语言>.json`。
4. `audio.js` → `asr.js` 回听 → `preview.js` → `render.js`（日志末行要有 `verified frames=`）→ `finish.js`。
5. 成片三审与原创、动画、片尾核对；两种语言各出 16:9 与 4:3 封面（`src/cover.html` 还是模板）。
6. `research/FACTS.md`（逐句出处表，依据在 `research/lab/`）、本片 `README.md`、`check.js --final`、片单状态改 `delivered` 后运行 `catalog.js`、复盘写进 `docs/`、提交（只暂存本片路径；工作树里有别的会话未提交的改动）。

## 视觉系统（方向 A）

- 颜色：纸白 `#eee9dc`、墨黑 `#111214`、朱红 `#e5412d`（只属于 OpenClaw）、金色 `#ffc61a`（只属于 Hermes，只放墨黑底上）。朱红与金色不另作他用（不表示出错或警告）。
- 字型：OpenClaw 用 Inter 900 与无衬线粗体；Hermes 用自绘 5×7 位图像素字（`HERMES AGENT`、数字）、VT323 与衬线；中性部分用无衬线与等宽。
- 图形：朱红一侧是圆与钳形（一个圆掌加两片弯刃，开合由时间决定）、描边的「壳」；金色一侧是方块与像素阶梯（翼）；报文是一个小方块，在两条泳道上分别染成朱红与金色。
- 章节卡：OpenClaw 整幅朱红 + 钳形合拢；Hermes 墨黑底 + 金色像素字逐列出现；其余中性（墨黑底，朱红与金色两条线）。
- 场景底色：`open` 纸白、`map` 与 `journey` 与 `compare` 上纸下墨分屏、`claw` 纸白、`hermes` 墨黑、`feishu` 纸白、`outro` 墨黑。

## 各场景的画面设计要点

- open：聊天（示意）→ 本机终端（示意）→ 两个大数字（OpenClaw 与 Hermes 的星标，取自 lab）→ 同一版式里数字变成两个名字 → 标题（A1）。
- map：机器、聊天入口、模型与工具的循环，再展开五站（接入、路由、循环、工具、记忆），之后两条泳道；末尾是两行规格条。
- claw：名字链按天数画成「壳」（warelay 25 天、CLAWDIS 17 天、Clawdbot 22 天、Moltbot 3 天、OpenClaw 至今 249 天，见 A2）；早期 README 首句；18789 端口与 `agent:main:main` 的今昔对照；扩展包 162 个小方块（其中 28 个通道涂色）；基金会引文；2.0 的文件到 SQLite；发布 253 个刻度（实心为正式版）；安全公告卡；信任边界图；记忆文件堆。
- hermes：模型线与代理线共用一条时间轴（稀疏 → 密集，见 A4）；v0.2.0 的 216 与 63；七种后端；学习闭环的副本代理示意；两个迁移命令的互指。
- feishu：飞书侧五步；长连接三条限制（含「多连接只有一个收到」）；两边的命令、配置与默认策略；官方 SDK 示例与两边注册 `im.message.receive_v1` 的真实代码并排；飞书插件来历三个日期。
- journey：沿五站逐站推近，两条泳道并排，真实代码行与文档引文（`lab/out_10_excerpts.json`、`out_11_quotes.json`）。
- compare：左纸右墨，逐行对照。
- outro：策划与参与模型名单、开源视频链接，留足阅读时间（脚本里已预留 7.5 秒）。

## 取证要点与不采信的内容

- 一手来源：GitHub 仓库与发布记录、npm 注册表时间戳、两个项目的文档与源码（固定提交记在 `out_12_snapshots.json`）、Nous 发布页、arXiv 与 Hugging Face 记录、飞书官方 SDK 的 README。
- 飞书开放平台页面的措辞经抓取工具读取，以 SDK README 的同义段落独立印证。
- 不采信：第三方文章里的「超越 OpenClaw」等比较性说法；OpenClaw 文档里对比 Hermes 的评价性表述（只用可核对的事实）；Hermes 文档里「默认迭代预算 500」（源码里默认不限）。
- 旁白里的安全一句只陈述公告与修复版本（GHSA 与 NVD 互相印证），不比较两者的安全性。

## 重做取证

- `research/_src` 需重新克隆（命令见 `02_extract.py` 开头）；`out_01…08` 是 2026-10-06 当天取回的响应，经相同字段裁剪；`01_collect.sh` 记录了对应的请求。未认证的 GitHub 接口每小时限 60 次，整体重跑会更新星标等数字，重跑前先隔开一小时。
