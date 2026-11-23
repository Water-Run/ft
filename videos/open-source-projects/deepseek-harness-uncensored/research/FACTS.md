# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。做法见仓库 `docs/guides/research.md`。

本片是宣发片，按策划者要求（2026-11-21）只讲产品层面的功能，不深入破甲提示词、网安与逆向手册的内容。全部事实取自项目自己的 README、使用手册、`product.json`、图标与截图；没有安装运行软件，没有实测。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| DSHU 仓库 | `Water-Run/deepseek-harness-uncensored`，提交 `d04e0dade6fe16bfb24437118077832e5955be64`（2026-11-21T20:31:48+08:00） | `git clone --depth 1 --sparse`，只检出 `README.md`、`SAFETY.zh.md`、`BRAND_GUIDELINES.zh.md`、`product.json`、`LICENSE`、`docs/assets/dshu/`、`docs/user/guide/dshu.md`、`apps/desktop/resources/icon.svg`，放在 `research/_src/dshu/`（不入库） |
| 上游 DSH 图标 | `deepseek-ai/deepseek-harness` 标签 `dsh-v0.2.2-rc.5`（提交 `9c2670d3bce5275e0d1610272958121af87787bb`）的 `apps/desktop/resources/icon.svg` | `gh api …/contents/apps/desktop/resources/icon.svg?ref=dsh-v0.2.2-rc.5`，放在 `research/_src/upstream/icon.svg` |
| Release | 2026-11-21 查得 3 个，均为 Draft：`v2026.11.17.3`、`.4`、`.5` | `gh release list -R Water-Run/deepseek-harness-uncensored` |

下文 README 指 DSHU 仓库根的 `README.md`，手册指 `docs/user/guide/dshu.md`，均为上述提交。

## 对象与解释路径

DSHU 是基于 DeepSeek Harness（DSH）的桌面智能体工作台（F1、F2）。它与 DSH 的区别分三层：内置破甲提示词、开箱即用（F4）；四种模式，共用同一套破甲提示词，各带不同的工具、手册与资料，有主题色，发出首条消息后锁定（F6–F10）；与模式无关的通用增强：旁问、随问、输入预测、余额与额度限制、跨对话记忆（F20–F30）。它与官方版各自独立、可并存（F5）。本片按这三层顺序介绍，开场用标志从白底到黑底的反相（F3）引出名字。

## 逐章

### open

| 编号 | 句号或位置 | 陈述 | 原始出处与定位 | 适用版本与截至日期 | 核查 |
|---|---|---|---|---|---|
| F0 | o1–o6 | 开场文案取策划者原话（第 5 稿起策划者亲自改写：开场不再口播 DSH、DSHU 缩写，删去「多了开箱即用的破甲体验」）（2026-11-21）：「这, 是一个Deepseek Harness, DSH. 现在它黑化了, 成了Deepseek Harness Uncensored, DSHU. 多了一个Uncensored, 多了开箱即用的破甲体验.」「更自由的探索未至之境也放在开头」。DSH 是上游品牌规范建议的缩写（`BRAND_GUIDELINES.zh.md`「建议使用缩写的“DSH”标识」） | 会话原话；品牌规范 | — | 2026-11-21 |
| F3 | o1–o3 | DSH 原版图标是 `#FBFBFB` 白底、深色渐变（`#0F1115`、`#1C2434` 等）的鲸鱼；DSHU 图标是 `#1c202b → #080a0f` 黑底、`#fff` 白色鲸鱼 | `research/_src/upstream/icon.svg` 的 `fill`/`stop-color`；`research/_src/dshu/apps/desktop/resources/icon.svg` 同；README 首行图标的 alt「DSHU 黑底白鲸标志」 | DSH 0.2.2-rc.5；DSHU 提交 d04e0da | 2026-11-21 已核 |
| F1 | o3、o6 | 全名 DeepSeek Harness Uncensored，简称 DSHU；标语「更自由的探索未至之境」 | README 第 5–9 行、第 22 行「**DeepSeek Harness Uncensored（DSHU）**」；仓库描述「更自由的探索未至之境.」 | 同上 | 已核 |

### box（01 开箱即用）

| 编号 | 句号 | 陈述 | 原始出处与定位 | 适用 | 核查 |
|---|---|---|---|---|---|
| F2 | b6 | DSHU 是基于 DeepSeek Harness 的桌面智能体工作台；源码基于 DSH 0.2.2-rc.5 | README「**DeepSeek Harness Uncensored（DSHU）** 是基于 DeepSeek Harness 的桌面智能体工作台」；「版本基线」表；`product.json` 的 `upstreamVersion: "0.2.2-rc.5"`、`upstreamCommit` | 同上 | 已核 |
| F2a | f1 | 开源：许可 GPL-3.0-or-later；上游 DSH 为 MIT | `product.json` 的 `license`；README 徽章；`gh api repos/deepseek-ai/deepseek-harness` 的 `license.spdx_id = MIT` | 同上 | 已核 |
| F4 | b1b、b3 | 破甲提示词已经内置，装好就是开箱即用的破甲体验，不用再自己找提示词、改配置 | README 第 22 行 | 同上 | 已核（只引用说法，未读提示词内容） |
| F34 | b1 | DSHU 的破甲部分用到 dsh-purge（README 第 307 行「dsh-purge 提供破甲提示词，DSHU 沿用其 MIT 历史版本并保留原许可」；第 301 行「破甲提示词：dsh-purge 的 MIT 历史版本 e1d8e590」。所以 b1 写「沿用」，不写「参考」）：`product.json` 的 `purge.repository = Water-Run/dsh-purge`、`licensedContentCommit = e1d8e59087857fa86d0ef2bb9878800274b13a29`、`licensedContentLicense = MIT`；关于页列出 dsh-purge 来源。该提交（2026-10-13，提交说明含「default-prompt-inject.zh.md: 优化中文版提示词」）的 `LICENSE` 为 MIT，版权「小杨」；dsh-purge 当前主分支已改为商业许可（「本软件不是开源软件。当前分支也不是 MIT。」）。`Water-Run/dsh-purge` 自述为 `YuJunZhiXue/dsh-purge` 的个人派生副本（上游仓库 2026-11-21 查询返回 404）。策划者要求（2026-11-21）：「提到dsh purge的贡献, 包括用MIT的版本」 | `product.json`；`gh api repos/Water-Run/dsh-purge/contents/LICENSE?ref=e1d8e59…` 与 `?ref=master`；该仓库 README 开头 | 同上 | 2026-11-21 已核（未读提示词内容） |
| F5 | b7–b9 | DSHU 有独立的程序目录、配置、会话和更新渠道，可以和官方 DSH 装在同一台机器上互不影响；数据目录默认 `~/.dsh-uncensored`，可用 `DSH_UNCENSORED_HOME` 修改 | README 第 26–28 行 NOTE；「安装与数据」表；手册「数据与更新」 | 同上 | 已核 |

### modes（02 四种模式）

| 编号 | 句号 | 陈述 | 原始出处与定位 | 适用 | 核查 |
|---|---|---|---|---|---|
| F6 | m1、m2 | 四种模式：缺省、网安、逆向、写作；模式菜单在新会话输入框上方、工作区旁边 | README「四种模式」表；手册「第一个任务」第 3 步「工作区旁边就是模式菜单」；默认设置表「新会话模式：缺省，新会话输入框上方」；截图 `hero-dark.webp` | 同上 | 已核 |
| F7 | m3、m4 | 四种模式共用内置的破甲提示词，区别在于带哪些工具、工作手册和资料；手册按需加载，用到哪本读哪本，不会一开始就塞满上下文 | README「四种模式」首段；手册「四种模式」首段 | 同上 | 已核 |
| F8 | m6、m7 | 主题色：缺省蓝 `#2563EB`、网安红 `#DC2626`、逆向绿 `#15803D`、写作黄 `#A16207`；会话标题、侧栏色条和按钮颜色跟着变 | README 表格的 swatch alt 与 `docs/assets/dshu/swatch-*.svg`；README「每种模式有自己的主题色……」 | 同上 | 已核 |
| F9 | m8、m8b、m9 | 新会话默认缺省，发第一条消息前可改；发出后模式锁定，避免中途换掉工具和手册；要换须在 设置 → 模式 临时打开开关，重启后自动关闭 | README「新会话默认是**缺省**……」；手册「换模式的规矩」 | 同上 | 已核 |
| F10 | d1–d2b | 新会话默认是缺省（README「新会话默认是**缺省**」）。缺省模式：日常使用和通用开发，写代码、修 bug、查资料、处理文件；自己定位、修改和验证，最后说明改了哪些文件、跑了哪些检查，没跑的也会标出来 | README「缺省模式」首段 | 同上 | 已核 |
| F11 | s1–s3 | 网安模式：用于网络安全审计和攻击（片中按策划者 2026-11-21 决定写作「安全审计和渗透测试」：「和README一起改成 安全审计和渗透测试 吧」；DSHU README 在 d04e0da 仍是原话，发布前核对是否已同步）：应用审查、配置检查、问题复现、修复验证；七类现场手册按调查阶段取用；目标、证据和发现写进案件文件 `.security/<案件>/case.json`，可以生成报告 | README「网安模式」首段与列表 | 同上 | 已核（未读手册内容） |
| F12 | s4 | 独立代理默认关闭；打开后网安会话访问目标的流量统一从指定代理出去，模型请求、登录、余额查询仍走原来的网络 | README「网安模式」列表「独立代理」 | 同上 | 已核 |
| F13 | s6、s7 | 第一次在新会话里进入网安，会先请你读完责任说明；网安模式会执行真实命令、访问真实目标，软件不会替你判断目标是否已获授权，请只在授权范围内使用 | README「进入确认」与 WARNING | 同上 | 已核 |
| F14 | r1b | 逆向模式：程序、二进制、文件格式、协议；结论落到地址、偏移或运行观察上，推测和已验证的内容分开写；八类分析手册 | README「逆向模式」首段与列表 | 同上 | 已核（未读手册内容） |
| F15 | r1、r5 | 内置 REA 6.9.0，装好就有，不用另装；每个逆向会话独占一个分析进程；Ghidra、IDA、Hopper 等引擎按需接入 | README「内置 REA 6.9.0」；`product.json` 的 `rea.version: "6.9.0"`、`toolCount: 255`、`license: MIT` | 同上 | 已核 |
| F16 | （第 5 稿删去，未进旁白） | 样本清点只读样本字节，算出 SHA-256、格式、熵和可打印字符串，不执行样本 | README「样本清点」 | 同上 | 已核 |
| F17 | w1–w3 | 写作模式：小说、剧本、长文；人物、设定和文风卡放在 `story/` 下，只有勾选的资料会发给模型 | README「写作模式」首段 | 同上 | 已核 |
| F18 | （第 5 稿删去，未进旁白；w2 仍提到文风卡） | 文风卡用措辞、句法、节奏、意象、对白、结构六条轴描述一种文风 | README「文风卡」 | 同上 | 已核 |
| F19 | w6 | 写作模式不挂载终端和代码执行工具 | README「专注写作」；手册四种模式表备注「不挂终端和代码执行」 | 同上 | 已核 |

### asides、spend、memory（03 通用增强）

| 编号 | 句号 | 陈述 | 原始出处与定位 | 适用 | 核查 |
|---|---|---|---|---|---|
| F20 | x1、x1b | 主线在跑任务时可以提问；旁问和随问都不会打断主线，也不会在侧栏多出新会话 | README「旁问与随问」首段 | 同上 | 已核 |
| F21 | x4、x5、x5b | 旁问 `/side`：在右侧开一个独立对话；每次提问前同步主线**已完成**的进展；可以讨论方案、追问细节、附图提问；关掉标签再打开还在 | README「旁问 /side」与对比表；截图 `side-question.webp` | 同上 | 已核 |
| F22 | x2、x3、x3c | 随问 `/btw`：给任务运行途中用，最常用 `/btw 进度如何`；读取主线实时状态，连正在跑的那一步也算；只读，不改文件、不跑命令；回答默认不超过 512 token；以输入框上方的一张小卡片给出 | README「随问 /btw」与对比表；截图 `btw-progress.webp` | 同上 | 已核 |
| F23 | x11、x11b、x12 | 输入预测：停下打字约 0.8 秒后出现灰色的后半句，按 Tab 采用，不会替你发送；会调用当前模型、计费；默认开，可在 设置 → 通用 关掉（x11「可选的」即可以关，策划者 2026-11-23 要求保留这个说法） | README「输入预测」；手册「旁问、随问与输入预测」、默认设置表「输入预测：开」 | 同上 | 已核 |
| F24 | y1、y2 | 侧栏常驻账户余额（余额卡片在窗口左下角），标出当前是官网的高峰还是低峰时段、离下次切换还有多久。y2 是策划者写的谐音玩笑：「梁文峰 / 梁文谷」借 DeepSeek 创始人梁文锋的名字谐「高峰 / 低谷」，界面上实际写的是「高峰时段 / 低峰时段」 | README「余额」；手册「余额」（高峰为工作日北京时间 09:00–12:00、14:00–18:00）；截图 `mode-default.webp` 左下角「低峰时段 39:27:11 · 充值余额」 | 同上 | 已核 |
| F25 | y3、画面 | 设置 → 额度 有本机采样的总余额曲线，默认 15 秒采一次；鼠标悬停（或轻触、方向键）读出每个点的时间和金额。点侧栏余额卡片只是立即刷新，不打开曲线 | README「余额」；手册「余额」；源码 `packages/client/ui-settings-account/src/client/BalanceHistory.tsx`（d04e0da，按指针、触摸或方向键查看采样点） | 同上 | 已核 |
| F26 | y5–y7 | 「如果你习惯使用各种 Coding Plan，有看额度百分比的癖好的话」……带来经典的 5h 和周限额；六档：15 分钟、1 小时、5 小时、1 天、7 天、30 天，各自开关、各自设金额，默认全关 | README「额度限制」；手册额度表（初始金额 5/15/50/100/500/2000 元） | 同上 | 已核 |
| F27 | （第 5 稿删去，未进旁白） | 额度用完对话自动暂停，并给出预计恢复时间；打开自动恢复后额度回来就继续（自动恢复默认关） | README「额度限制」第三条；手册「额度用完了」 | 同上 | 已核 |
| F28 | （第 5 稿删去，未进旁白） | 余额、费用和限额都是本地估算，不是账单 | README CAUTION | 同上 | 已核 |
| F29 | k1、k2 | 跨对话记忆：项目约定、个人偏好、做过的结论、小说设定可以存成记忆；作用范围：全局、某个工作区、某种模式，或两者叠加，不会串到无关的对话里；自动提炼默认关 | README「跨对话记忆」 | 同上 | 已核 |
| F30 | y4、画面 | 底栏显示轮次与步数、生成速度、token 用量与缓存命中、本对话费用和限额进度 | README「其它小改进」表；截图 `mode-default.webp` | 同上 | 已核（只用于画面） |

### outro

| 编号 | 句号 | 陈述 | 原始出处与定位 | 适用 | 核查 |
|---|---|---|---|---|---|
| F36 | y4 | 底栏显示本对话费用；点开底栏金额，看到这个对话的累计费用曲线（第 5 稿旁白只讲前半句） | README「其它小改进」表「底栏状态」「对话费用」 | 同上 | 已核 |
| F35 | w7 | 彻底删除：删除对话会先停下任务，再连同旁问、随问和子会话一起删掉，工作区文件不动 | README「其它小改进」表「彻底删除」 | 同上 | 已核 |
| F37 | （第 5 稿删去 b2，未进旁白） | 首次配置：设置 → 模型中填写提供方与凭据 | README「安装与数据」表；手册「第一个任务」第 1 步 | 同上 | 已核 |
| F31 | f1 | 许可 GPL-3.0-or-later | `product.json`；README 徽章 | 同上 | 已核 |
| F32 | f2–f4 | 安装包覆盖 Windows x64、Linux x64、Linux ARM64、macOS ARM64 | 策划者原话（2026-11-21）：「我后面会发Release. 包括Windows X64, Linux X64, Linux ARM64和MacOS ARM64」。2026-11-23 补充：「安装包部分, 其中Linux X64包括.deb和.rpm」（只上画面）。README（d04e0da）写的是「Windows x64 为首发平台，Linux x64 提供检查包」 | **发布时核对** Release 附件的平台 | 待核 |
| F33 | f2 | 安装包在 GitHub 的 Release 页面 | 2026-11-21 Release 均为 Draft。策划者原话（2026-11-21）：「片中是对应等会Release包发出来的, 宣发视频」 | **发布时核对**：本片发布前确认 Release 已公开，否则改这一句 | 待核 |
| F38 | s5、s5b | 独立代理的覆盖范围有限：只在网安模式生效，覆盖受控网页抓取、遵守代理变量的命令与终端、桌面侧栏浏览器和几种以 `launch` 启动的浏览器 MCP；其他协议、入站隔离等「尚未覆盖」。「再套一层马甲」是策划者对「流量从你指定的代理出去」的口语说法。「这只是一个实验功能」：README 没有单独这样标注独立代理（`SAFETY.zh.md` 说整个软件是实验性预览）；策划者即 DSHU 作者（仓库 Water-Run），2026-11-23 明确要求「s5 保留 实验功能的说法」，按作者的说法写 | README「独立代理与目标保护的覆盖范围」；`SAFETY.zh.md`「实验性状态」；作者原话 | DSHU 提交 d04e0da | 2026-11-23 已核 |
| F39 | x6、x6b | 旁问里发 `/clear` 从头开始；设置 → 通用 可打开「旁问关闭后自动清除上下文」，关掉标签就清空（策划者原稿写「每次开启时自动清理」，按 README 改为关掉时） | README「旁问 /side」第 174 行；手册「旁问里的 /clear」 | 同上 | 2026-11-23 已核 |
| F40 | x3b、x4b | 类比：Claude Code 的 `/btw`「Ask a side question about the current session without adding to the conversation」；Codex 的 `/side`「Start a temporary side chat without interrupting the main chat」。只说「类似」，不比较细节（Codex 旁聊是临时的，DSHU 旁问关掉再开还在，F21） | https://code.claude.com/docs/en/commands 的命令表；https://learn.chatgpt.com/codex/reference/slash-commands | 2026-11-23 查阅 | 2026-11-23 已核 |
| F41 | f4a | DSH 与 DSHU 的代码主要是 TypeScript；DSHU 有本地打包指南，可自己生成安装包 | `gh api repos/deepseek-ai/deepseek-harness/languages`、`…/Water-Run/deepseek-harness-uncensored/languages`（TypeScript 均占绝大部分）；DSHU `apps/desktop/packaging/README.zh.md`「在本地生成 DSHU Desktop 安装包」 | DSHU 提交 d04e0da；2026-11-23 查询 | 2026-11-23 已核 |
| F42 | o3（画面注解） | Uncensored 在片中注作「去审查版」 | 策划者（DSHU 作者）2026-11-23 看 r1 后的要求：「画面底下中部增加注解: Uncensored: 去审查版」 | 会话原话 | 2026-11-23 |
| F43 | b1b–b3（画面注解） | 装好 DSHU 后正常登录或配置凭据即可使用（破甲提示词已内置，不需另配） | 策划者（DSHU 作者）2026-11-23：「改为 装好DSHU后正常登录或配置凭据即可使用」；与 F37（设置 → 模型 填写提供方与凭据）、F12（独立代理不改登录的网络路径，说明存在登录）相容 | 会话原话 | 2026-11-23 |
| F44 | x5、x5b（侧栏状态环） | 主线停止、旁问仍在运行时，侧栏会话行首的状态环改为 8 段虚线、不画底环、沿用同一旋转；主线自己在跑时为实线环；随问 /btw 不标记行 | DSHU 提交 8aba03f「侧栏在旁问运行时显示虚线加载环」与 `ui-primitives/src/StateDot.module.css`（`.spinnerDashed`） | 本地 clone 快进到 7efe201，2026-11-23 | 已核 |
| F45 | y3（余额曲线） | 余额曲线：缩短的不变时段与没有采样的时段都画虚线（5 4），说明文字「虚线表示已缩短的余额不变时段，或没有采样的时段」；会话费用曲线不带说明、保持实线；提示框先显示两位小数 | DSHU 提交 ac598fa、eb83e00；`ui-settings-account/src/client/balance-chart.ts`、`BalanceHistory.tsx`、`balance-locales.ts` | 同上 | 已核 |
| F46 | b1（关于页入场） | 关于页对话框不再缩放，只淡入 160ms；左卡与右栏同时只改不透明度 220ms | DSHU 提交 3e312e1「修复关于页打开时的抖动」；`Modal.module.css`、`AboutDialog.module.css` | 同上 | 已核 |
| F47 | x3（命令输入） | 斜杠命令被认领后在输入框里显示为命令片：模式色文字，左右 4px 内边距，无底色 | `ui-conversation/src/client/input/editor/CommandChip.tsx`、`composer-editor.module.css`（`.reference`）、`ReferenceChip.module.css` | 同上 | 已核 |
| F48 | b1–b6（关于页） | 关于页显示 Uncensored 版本 2026.11.23.0；源码节点 7efe20159de3、提交时间 2026-11-23 07:08 UTC；「编译于」按同一时刻填 2026-11-23 07:08 UTC | 版本号取策划者（DSHU 作者）2026-11-23 原话「Uncensored的版本显示为2026.11.23.0」；仓库 `product.json` 在 7efe201 写的是 `2026.1123.1`、提交 70fb8ad 说明写「统一 2026.11.23.1 发布版本」，与原话不同，按策划者原话。编译时间来自打包时的 `DSH_CLIENT_BUILD_TIME`，仓库里查不到，按最新提交时间推定，**待策划者按实际打包时间确认** | 本地 clone 7efe201 | 部分推定 |
| F49 | s2（手册卡片） | 网安七类现场手册：交战流程、侦察、Web 攻击、网络利用、载荷实验、云与容器、报告 | DSHU README 第 68 行「七类现场手册」 | 同上 | 已核 |

## 取证中发现、没有进入成片的事实

- 品牌规范（`BRAND_GUIDELINES.zh.md`，来自上游）：建议衍生项目以「DSH」命名，避免直接用完整的「DeepSeek Harness」商标命名，避免在宣传中以引起误解的方式使用官方品牌素材、让人以为有官方背书。本片用了原版图标做「黑化」对照（策划者 2026-11-21 明确要求），旁白称原版为「官方 DeepSeek Harness」，DSHU 为基于它的项目，不说官方合作或授权。是否在画面上加「非官方」字样，交策划者决定。
- 逆向手册清单含「补丁与注册机」，网安手册含「载荷实验」等；宣发片只说手册的类数，不列名目。
- 网安的「目标保护」（境内网站、指定目标和生产资源的拦截规则）默认全关，属进阶功能；篇幅所限未讲。
- `SAFETY.zh.md`（来自上游）：实验性预览软件，未经安全审计，可执行模型生成的命令；建议在一次性虚拟机或容器中运行。成片只保留网安的授权提醒。
- 版本号格式 `YYYY.MM.DD.N`；`product.json` 写 `2026.1114.1`，README 写最新预发布 `2026.11.17.5`。片中不提具体版本号，免得发布时过期。

## 复核

未做。
