# DeepSeek Harness Uncensored：更自由的探索未至之境

DSHU（DeepSeek Harness Uncensored）的宣发片：随 Release 包发布，介绍它开箱即用的破甲体验、四种模式与几项通用增强。中文，5:00–5:59。

系列：[开源项目](../README.md)。只遵守系列说明里写明的共同约定，其余按本片的对象设计。本片的阶段、署名、发布与评分记在 `project.json`，事实依据在 `research/FACTS.md`，文案只在 `src/js/script.js`。流程与规则见仓库的 `docs/`。

## 状态

<!-- 每次停工前更新，同时改 project.json 的 stage 与 next。开工、换模型及交接时据实更新 credits 的型号与分工，未核型号须在交付前解决。旧的记录、片单状态或已有的 MP4 都不能证明当前版本已经完成。发布后按 docs/guides/release.md 冻结：只追加发布与反馈记录，未经策划者明确要求重做，不回改制作内容或 credits。 -->

| 项 | 记录 |
|---|---|
| 当前停在哪里 | **已交付**（2026-11-23）：正式片 `out/deepseek-harness-uncensored-zh-1080p60.mp4`（4:45.9），WaterRun 看过后决定投稿（见「交付」） |
| 下一步，依赖什么 | WaterRun 投稿后回填 `project.json` 的 `release`（平台、地址、日期、标题，取自公开页面），`stage` 改为 `released`；补记外置材料的公开地址；之后冻结 |
| 等待策划者的事 | 投稿后的平台地址 |
| 本次会话的角色 | 制作方（接盘会话，Claude Opus 5.5） |

**中断记录（2026-11-23，时间均为 +08:00）。** 之后的恢复会话也在约 15:38 因 429 停下（三组子代理改完界面、未看画面）；接盘会话据其会话记录接着做完自查并出 r1，见 `review/NOTES.md`。以下为第一次中断的还原： 本节由另一个会话据文件时间与残存记录还原，不是原会话自己写的。

- 制作会话（Claude Opus 5.5，目标「实现DSHU的Preview」）约 11:23 因额度限流（429）停下；之后本机的 Claude Code 会话记录被误删，回收站里也没有，原对话无法恢复。策划者的原话、各项决定与文案确认此前已落盘在本 README「简报」、`review/NOTES.md`、`review/approval.json`，接续以这些文件为准。
- 由文件修改时间还原的最后进度：09:56 全片配音、时间线更新 → 10:19–10:30 按自查改场景与本片的引擎拷贝，10:24、10:27 出逐帧总览 → 10:32 `check.js` 扫描 → 10:33 封面页 `src/cover.html` → 10:40 配乐 `tools/music.py` → 10:45 写 r1 自查记录和本状态（当时提前写成了「出预览 r1」）→ 10:48 渲出无声的 `out/zh/preview_video.mp4` → 10:53 混音（`build/audio.zh.json`）→ 约 10:55 起的预览渲染中断（`out/zh/preview_video.mp4.segs/` 只有 `seg_000`、`seg_001`）→ 11:08 在 `s0_open.js` 加开场的模拟说明。
- 本片目录从未提交。会话改过的共享文件也都没有提交：`docs/lessons.json`、`docs/lessons.md`（F35、F36）、`docs/log/feedback.md`（P124），以及片单生成物 `videos/catalog.json`、`videos/README.md`、`videos/CREDITS.md`、`videos/open-source-projects/README.md`。生成物里混着别的片子（MongoDB、Lua 源码全解析）的变化，本片条目还停在「审稿」；提交前重跑 `catalog.js`，共享文件按 AGENTS.md 单独提交，并跑 `npm test`、`npm run check:repo`。

## 简报

<!-- 立项时写，准备方或制作方都可以写。策划者在会话里提的要求，原话与日期照录在这里，优先于任何缺省做法（docs/roles.md 第 2 节）。 -->

- 目标观众已有的知识：用过或听说过 DeepSeek Harness 或其他编码智能体的桌面客户端；知道模型、提示词、上下文、额度这些词。
- 看完能回答的一个核心问题：DSHU 比官方 DeepSeek Harness 多了什么，值不值得装一个？
- 用哪个具体例子走完解释：同一个应用窗口贯穿全片——标志反相引出名字，新会话首页→模式菜单→四种模式各自的会话→旁问、随问、余额、额度、记忆。每一项落在界面上实际能看到的地方。
- 逐章怎样推进，各章的答案：
  - 开场：原版白底标志加上 Uncensored，翻成黑底——DSHU 是什么。
  - 01 开箱即用：破甲提示词内置，装好即用；与官方版并存。
  - 02 四种模式：共用破甲、各带工具与手册；主题色；发出后锁定。缺省、网安、逆向、写作各一段，网安附授权提醒。
  - 03 通用增强：旁问 /side、随问 /btw、输入预测；余额、六档额度限制；跨对话记忆。
  - 结尾：许可、平台、Release 页面；标语。
- 决定不讲的材料与理由：破甲提示词、网安与逆向手册的具体内容（策划者要求不深入）；逆向「补丁与注册机」等手册名目；目标保护、独立代理的覆盖范围细节；版本号（发布时会变）；内部实现。
- 时长上限与语言：zh，4:30–5:59（2026-11-23 由 5:00–5:59 放宽）。
- 策划者的要求（原话、日期，2026-11-21）：
  > 一个简单的视频, 宣发 https://github.com/Water-Run/deepseek-harness-uncensored 标题: Deepseek Harness Uncensored: 更自由的探索未至之境

  > 设计语言: 契合DSHU, 包括模式 主要就是虚拟页面展示 时长: 约3-4min 突出: 开箱即用的破甲体验(和DSH共存), 四种模式, 通用增强, 包括旁问随问, 额度等 不要深入追寻, 会造成你的安全围栏. Release包还在测试打包.

  > 如果内容较多, 允许扩展到5min吧. 范围最好5min00-5min59

  > 配音给我minimax不重复的男女10个

  > Logo体现黑化, 就是Deepseek Harness 加Uncensored 同时Logo从原版白变黑

  > 片中是对应等会Release包发出来的, 宣发视频, 现在只是片子草案, 出preview, 不着急

  > 1. 按DeepSeek 2. 开场小字 3. 我后面会发Release. 包括Windows X64, Linux X64, Linux ARM64和MacOS ARM64 4. 和README一起改成 安全审计和渗透测试 吧 5. 提到dsh purge的贡献, 包括用MIT的版本 配音 温暖闺蜜 配乐都不够好, 优化, 更有质感, 电子, 空灵.

  > 视觉方向选A. 不过Logo变化直接原位, 文案"黑化版"

  > 开场: 这, 是一个Deepseek Harness, DSH. 现在它黑化了, 成了Deepseek Harness Uncensored, DSHU. 多了一个Uncensored, 多了开箱即用的破甲体验.

  > 更自由的探索未至之境也放在开头

  已定（2026-11-21）：标题用「DeepSeek」；开场加「非 DeepSeek 官方项目」小字；四个平台；网安写作「安全审计和渗透测试」；b5、b6 讲 dsh-purge 及其 MIT 版本；配音 `Chinese (Mandarin)_Warm_Bestie`（温暖闺蜜）；视觉方向 A（整机巡览），开场标志原位从原版翻成 DSHU，画面字「黑化版」；开场文案取策划者原话，标语放在开头与结尾。配乐三个小样均未通过，按「更有质感，电子，空灵」重做。

  > DSHU 以 GPL-3.0-or-later 开源 -> DSHU 以 GPL-3.0-or-later 开源在GitHub 配乐用流明 出Preview吧

  配乐定为 C「流明」（112 BPM，E 小调）。第 3 稿确认，进入配音与实现。

  > UI记得契合软件真实的样子哈, 看源码

  > 跨对话记忆不是重点简单提就行. 提到页面底下多的比如对话消耗额度 删除对话(可以和写作一起说, 你的用语都太claude了, 文案你先出还得大改, 比如写作后面说哦对了, 现在对话还可以删除)之类的小功能

  > 我要人工重写稿件, 基于现有版本. 改完后, 你来进行事实核对, 确认最终稿件. 记录我的Credit

  > 注意这回我大量手动介入的稿件, 要整理风格和重心, 包括去掉你的风格和中心, 落盘文档, 之后自己写可以学习.

    > s1 保留 网络安全审计 不要再加安全 s5 保留 实验功能的说法 x11 保留 可选的输入预测 y3说的是悬浮, 总余额变化, y4才是每个对话的花费

  > 时长允许放宽 y2保持说法 3按照我的 ,别乱改 4一行

  2026-11-23：WaterRun 在改稿页里亲自改写第 4 稿，制作方核对事实后得第 5 稿，再按上面两条定稿（`c49d20f2…`）；时长范围放宽为 4:30–5:59（`check.duration` 270–359）；署名记为 `credits.people`「文案：WaterRun」，片尾与策划合成一行「策划 · 文案」。风格与重心的对照见 `review/NOTES.md`，提炼出经验规则 F35、F36（P124）。

  > 确认, 出Preview. 画面记得契合正式UI的模拟.

  > 另外, 富有高级感和质感, 合适的地方, 你可以用各种3D, 包括转场, 不要拘于平面

  2026-11-23：据此把本片的风格声明从平涂改为允许阴影与渐变（`project.json` 的 `check.style.flat: false`），3D 只用 CSS 变换。

  2026-11-23（原会话记录已丢，这一条的原话没有留下）：开场注明画面里的界面是按代码模拟的动画。原会话 11:08 把它写进 `s0_open.js`：深色胶囊里写「动画页面 UI 按代码模拟渲染，真实页面截图参照 README」，放在最上层，从 o3 说完留到开场结束；代码注释记为「策划者 2026-11-23：画面里的界面是示意动画」。界面照真实软件重画，依据是 DSHU 的截图与 `packages/client/ui-theme` 源码（见「设计」）。策划者在恢复会话里回忆：

  > 是搞明白在重做UI 动画UI契合软件真实的样子的吧

  > 还有开场说动画模拟还原之类的

  2026-11-23（恢复会话，r1 出成之前）：

  > UI有照着真实大改了吧

  > claude code和codex出现真实logo 页面内的动画最好也契合真实

  > 比如余额曲线是虚线等

  > 包括余额曲线竖线是虚线等之类的细节

  据此：x3b、x4b 的类比注解换上 Claude Code 与 Codex 的真实标志（出处记进 `research/MATERIALS.md`）；画面里的各个界面逐屏对照截图与 DSHU 源码，细节（如余额曲线里缩短时段的横向虚线、坐标与统计行）和界面自己的动效照真实软件。

  > 后面加一句 给自己上一些防沉迷控制（指 y7）

  > 安装包部分, 其中Linux X64包括.deb和.rpm

  > 最后一句改成 DeepSeek Harness Uncensored, 更自由的探索未至之境

  > 片尾留白不要那么久

  > 确认第六稿. 页面务必精美高级, 动画富有质感.

  据此：y7 后加 y7b，f6 照改，fT 3→1 秒、片尾名单 8→6 秒（第 6 稿 `fd5b6614…`，已确认）；Linux x64 卡片标出 .deb、.rpm（只上画面，FACTS F32）。

  2026-11-23（接盘会话，出 r1 时）：

  > 台词别乱改啊 最后一句就是 更自由的探索未至之境 别改

  台词照第 6 稿不动，f6 仍是确认过的「DeepSeek Harness Uncensored，更自由的探索未至之境」；这一轮只改了画面上的注解文字，没有改旁白。

  2026-11-23（看 r1 后）：

  > 1. 原版的DSH和DSHU应该都是圆角矩形 2. 00:05 黑化版 不要在画面中写 黑化版 3. 00:07 画面底下中部增加注解: Uncensored: 去审查版 4. 00:17 标题改成 开箱即用的破甲体验 同时减少1.5s的等待时间 现在更自由的...到第一幕间隔太长 5. 留意DSHU旁问左边现在有个闪烁呼吸灯, 还有旁问下转圈的行为, 同步在画面中, 不用突出, 只是同步 6. [关于页注解「装好后在 设置 → 模型 填上凭据就能用」] 改为 装好DSHU后正常登录或配置凭据即可使用 7. 01:06 模式顶部的颜色条不要超过圆角矩形 8. [m7 发送按钮外圈] 外层的圆很不对称 9. [注解] 临时允许 改为 可设置临时允许 这条会话带着 改为 这条会话上下文包含 10. [Ghidra、IDA、Hopper] 这三出现真实Logo 11. 02:55 /btw 这样的命令 输入时有高亮的 样式要对齐 12. 03:31 转场闪烁 13. 03:41 余额曲线有断点考虑刚更新的横向虚线 对齐样式 14. 04:18 Water-Run用Water-Run的头像, 出现GitHub的真实Logo 15. ARM的读法连读, 大概类似于阿姆 16. 片子最后字幕表减少2s

  （方括号内是策划者附的截图所指，由制作方补述。）这一条推翻了 2026-11-21「文案"黑化版"」的画面字。第 4 条改章名得第 7 稿，策划者已确认。DSHU 仓库在 r1 之后有更新（8aba03f 旁问运行时侧栏虚线加载环、ac598fa/eb83e00 余额曲线虚线、3e312e1 关于页抖动），本地 `research/_src/dshu` 已快进到 7efe201。

  制作方提出两处做法（第 5 条让主线在提旁问之前跑完，以便画面里出现「主线停、旁问在跑」的虚线加载环；第 10 条 IDA 官网没有单列图标，用发行商 Hex-Rays 的方形标志）后，策划者答复：

  > 都按照你的最佳推荐来.

  2026-11-23（看 r2 后）：

  > 开场顶上不是全白, 有蓝色, 明明还没变 黑化的变化更有冲击力的力量感 黑化UNCENSORED出来前DeepSeek Harness还是居中 直到UNCENSORED出来才向左 包括DSH和DSHU 去审查版小图注就行, 不要那么突出 淡化的一个小图注 放在右上角吧 Uncensored的版本显示为2026.11.23.0,编译时间看一下 UI页面中那个余额高低峰倒计时 真的在走而不是静止 就按一秒一秒倒计时 [模式胶囊的圈错位] bug 7类现场手册有几个字简介手册类别 [流量图连线压住卡片上的字] 重叠bug 01:58 闪烁bug 一系列便于使用的通用 前面的卡片向左滚还没出画面就消失了 余额线条连续横向不要断开 对了 DSHU的DSHU读的不通顺 项目约定的框跑到画面外了 更新版本的更是第四声, 不是第一声 可能还有我没注意到的小bug 反正自我诘问每帧过过去 衔接自然没bug 都是看一眼都能看到的 直接出成片吧, 封面换一个富有质感和力量感的, 有冲击力

  （方括号内是策划者附的截图所指，由制作方补述。）据此出正式片，不再出 r3。「更新版本」的「更」：MiniMax 的读法写成「或更高版本」，字幕仍是「GPL-3.0-or-later」不变。

  2026-11-23（收尾前）：

  > 时间不多了, 对了, 背景色多参考README的, 而不是现在的浅色. 记住然后收尾暂停吧

  随即更正：

  > 现在的深色, 要README同款浅色, 说错了

  > 立刻记住收尾, 没时间

  下次开工先做：把现在的**深色舞台背景**换成 DSHU README 截图同款的**浅色**背景（`research/_src/dshu/docs/assets/dshu/*.webp` 里窗口外的浅色渐变底，随模式色变化，见 MATERIALS「真实界面截图」），改 `stageBg` 等；深色底上的白字（注解、章节卡、片尾等）要随之核对对比度。

  按前述各条执行：时长取 5:00–5:59（覆盖最初的 3–4 分钟）；片尾说安装包在 Release 页面，发布前核对（FACTS F33）。标题按项目自己的拼写写作「DeepSeek」，交审时请策划者确认。

## 交接

<!-- 准备方交给制作方时写：主问题、解释路径与取舍能否由材料还原；做完了什么、依据在哪里、什么没解决。只写本片的信息，不复制通用规则表。没有经过准备方就删去本节。 -->

## 设计

<!-- 制作方写，方法见 docs/guides/visual.md 第 3 节。比较过哪些解释方法、为什么选定这一方向；贯穿的对象、机制揭示、阅读停顿和声音落点；关键帧与有声代表段的位置、实际看听范围、发现的问题。视觉材料（F16）、每章主画面（F18）、与近期作品的区别（F21）；音色确认（F17）、配乐与音效（F06）。外部参考记录来源与借鉴方法，不抄一份旁白或通用规则。 -->

## 设计

**方向 A 整机巡览**（2026-11-21 选定），按 2026-11-23 的要求加了 3D 与质感。全片是同一扇 DSHU 窗口，界面逐屏照 `research/_src/dshu/docs/assets/dshu/` 的截图重画（窗口约 1.4 倍、最小字号 22px）：小写 deepseek 字标、HARNESS / UNCENSORED 标签（UNCENSORED 取当前模式色）、会话左侧模式色条、余额卡、模式胶囊、底栏（轮次、token、本对话费用、额度）、关于页、设置页、删除对话框、网安进入确认、跨对话记忆管理框。截图里没有的「模式菜单」按 `modes-overview` 卡片的图标、颜色与描述画成输入框上方的下拉。

**每章主画面与 3D 的用处。** 3D 只用在三种地方：物件从窗口里「升出来」讲完再落回（四种模式的卡片立在同一块「内置破甲提示词」底座上，光柱插进底座，表达共用；网安的七本现场手册沿调查阶段抽出；REA 模块与三个外部引擎插件；六档额度限制像一叠卡片从景深里展开）；换场（四种模式之间整扇窗口立方体式转过去；通用增强开头六张卡片封面流式滑过）；对象的入场（`rise3d` 从景深前倾立起）。讲到窗口外的物件时，对话栏像开侧栏那样往左让位，或整扇窗口淡下去（聚焦），不让物件压在正文上。

**质感**：深色舞台带当前模式色的光晕、细颗粒与暗角；窗口与卡片带多层阴影与一圈高光；注解是深色磨砂玻璃。

**声音**：配乐 C「流明」写成全长 `tools/music.py`（112 BPM，E 小调），各层随场景起落：开场只有铺底与次低音，四种模式与通用增强加底鼓与镲，有章节卡的三场在章节卡那一小节换气，结尾标语处最后一次抬起。配音 `Chinese (Mandarin)_Warm_Bestie` ×1.1（MiniMax speech-2.8-hd）。

**事实边界**：画面上的演示对话（修复搜索、审计上传接口、固件头、《雾港》）取自 DSHU 自己的截图；Claude Code `/btw`、Codex `/side` 的注解取自两家官方命令文档（FACTS F40）；语言占比取自 GitHub 语言统计（F41）。

## 交付

<!-- 验收后写：成片文件、规格、时长、响度（在最终文件上测，F08）；check.js --final 的结论；review/lessons.json 里记为 open 的条目；实际看过、听过的范围，以及没看、没听的部分。Credit：对照哪些会话、审稿与交接记录核对了参与者；逐个语言与交付版本记录实际片尾时刻、型号与分工核对结论，未核的如实写。 -->

<!-- 开源交付（第三方制作也必须填写）：GPL-3.0-or-later；与本版成片对应的公开源码地址及提交号/标签；可编辑工程和必要外置音画材料的地址及校验和；制作环境与步骤；第三方材料的许可和使用、再分发依据。检查项目见 docs/reference/third-party.md，不预填通过。 -->

**交付（2026-11-23）。** WaterRun 看过正式片后回复：「视频一些小问题不用管了, 我决定投稿」，据此登记交付。

| 文件（`out/`，不入库） | 规格 | SHA-256 |
|---|---|---|
| `deepseek-harness-uncensored-zh-1080p60.mp4` | 1920×1080、60fps、H.264 + AAC 48 kHz，285.93 秒（4:45.9）；响度 I = -15.6 LUFS、TP = -1.5 dBFS（finish.js 在最终文件上测） | `ac8ee2da565325ca646c24989de327c19184260a56ff99b97fd5508a44951194` |
| `deepseek-harness-uncensored-zh-1080p60-no-music.mp4` | 同上，无配乐 | `e44dd61f955fa63f2f8f8362a444be5bb2af7646718b039c52d3187b9e621cc3` |
| `deepseek-harness-uncensored-zh-1080p60-voice-only.mp4` | 同上，仅旁白 | `1da893982700fd955d3e523069268faadee7be0d853af4d6e8453f68ec5f1d85` |
| `deepseek-harness-uncensored-zh.srt` | 字幕 | `f33b803cba7198cf2eb0f45eaca1750f095671dce3ca672fb067af6af283d8bf` |
| `cover-zh-16x9.jpg`、`cover-zh-4x3.jpg`（另有 2 倍 PNG） | 封面 | `5200efd0…`、`8cf1a6d0…` |

- **成片对应的源码**：文案第 7 稿 `9d516820…`（已确认）；成片之后源码没有再改（`build/finish.zh.json` 记录的各源文件与当前一致）。本节所在的提交即对应版本。
- **策划者知情并接受的问题**（「视频一些小问题不用管了」）：
  - f1 的配音念「G P L 三点零或**更高**版本」：制作方为让「更」读第四声，把读法里的「更新」换成了「更高」，改了念出来的词，不该这样做；字幕仍是「GPL-3.0-or-later」。策划者随后要求「别动我台词」，未重配。
  - 关于页的「编译于 2026-11-23 07:08 UTC」是按最新提交时间推定的，实际打包时间未核（FACTS F48）。
  - dsh-purge 的注解只写作者与许可变化，没有先说它是什么（经验规则 F31 第 2 版要求先下定义；规则在正式片渲染期间更新，改它要整片重渲，未改）。
  - 经验规则记为 `open` 的：F04（几条注解停留比下限短 0.3–2.0 秒）、F06（制作方未试听）、F12（「未至之境」等读音未经人耳确认）。
- **实际看过、听过的范围**：制作方只看了静帧——`sheets.js every 3` 通看全片（96 帧，`shots/sheets/zh-every_*.jpg`），可疑处 `look.js` 看原图，各场衔接与开场逐 0.1–0.3 秒取帧，成片文件抽查 0.3、4.6、284.0 秒三帧；没有以正常速度看过视频，没有试听。读音靠 Whisper 回听全片与改读法的单句。
- **自动检查**：`check.js`（制作期）通过；`overlap.js` 282 处逐条看过，均为有意的层次（见 NOTES）；`check.js --final`（2026-11-23）全部通过：署名登记、文案校对、经验规则复核、源码规则、场景齐全、时长、全片扫描、片尾名单、音效覆盖、交付物。
- **成片审查中改掉的**：见 `review/NOTES.md`「预览与自查」r1、r2、正式片各行。
- **Credit 核对**：参与者据本 README「简报」、`review/NOTES.md`、`review/approval.json` 与三个制作会话的记录核对——策划与文案 WaterRun（第 5 稿起亲自改写，本人要求片尾合为「策划 · 文案」一行）；Claude Opus 5.5 担任取证、文案初稿、事实核对、视觉设计、场景实现、配乐（三个会话都是该型号，含其子代理）；MiniMax speech-2.8-hd 配音、Whisper small 回听。片尾名单在成片 280.6–285.9 秒，无旁白（混音报告该段旁白 -99 dB），284.0 秒抽帧核对名字与分工与 `project.json` 一致。
- **开源交付**：许可 GPL-3.0-or-later；源码在 `github.com/Water-Run/ft` 的本片目录（提交号见本节所在提交）。可编辑材料都在目录里：文案 `src/js/script.js`、场景与样式 `src/`、配乐生成脚本 `tools/music.py`、引擎拷贝 `src/js/engine.js`；工具与依赖为同一提交的 `kit/` 与 `package.json`（gsap 3.13.0、puppeteer-core 25.12.0），Node 24.21.0。原配音（`audio/zh/cues/`，74 句 MiniMax 合成）与成片属于生成物，不入库；重新合成需要 MiniMax 密钥且不保证逐字节相同，**公开的外置下载地址未定**，发布时随附件给出并补记于此。第三方材料与依据见 `research/MATERIALS.md`：DSHU 与 DSH 标志（各自项目许可、商标归深度求索）、Claude、GitHub、Tux、Apple 标志（simple-icons）、Codex blossom（VS Code 扩展自带）、Ghidra 图标（NSA 官方仓库）、Hex-Rays 标志与 Hopper 图标（官网），只作指认，商标归各自权利人；Water-Run 头像为策划者本人的公开头像、按本人要求使用。
- **未做或未通过**：以正常速度通看与试听（交策划者）；外置材料的公开地址。



## 评价与复盘

<!-- 发布后写：策划者的评分与原话（同时记进 docs/log/feedback.md 并引用 P 编号）、观众反馈摘要、这部片子做对了什么、做错了什么，以及建议补进经验规则的东西。 -->

制作中发现、留给维护者的：

- 引擎的 `css(e, o)` 用 `Object.assign(e.style, o)`，`--mc` 这类 CSS 变量设不上，画面会静默地取不到颜色；它还让一段画面在「顺着播」和「直接跳到」时不一样（scan 报 NONDET）。本片的拷贝已改为 `--` 开头的键用 `setProperty`（`src/js/engine.js`），建议同步到 `kit/engine/engine.js`。
- 同一个元素上挂两个每帧改 `innerHTML` 的东西（`typeText` 与 `keyed`），后注册的会盖掉前一个，而且 `typeText` 在开始之前就把元素清空。本片写了 `inputTrack`（`src/js/parts.js`）按时段排一个元素的全部内容；可以考虑提炼进 `kit/engine/util.js`。
- 场景提前淡入（本片 config.js 的 after 让无章节卡的场景在 s.start 前 0.25 秒出现）时，`cam.track` 在 startT 才放回起点，提前那段露出后面某一站补间的起始机位（本片额度场开头闪一帧 1.3 倍推近，策划者 r1 指出「03:31 转场闪烁」）。本片在 `src/js/engine.js` 的 track 里提前 0.5 秒放回起点；建议 `kit/engine/engine.js` 同步，或在 pitfalls「第 0 帧」一条旁补上。
- 「全片第 0 帧时间线不重算」不只影响镜头（`docs/reference/pitfalls.md` 已记）：第一个场景里 `set(el, s.start, { autoAlpha: 0 })` 在开机的第 0 帧也不生效，本片的应用窗口和飞行标志因此在第 0 帧露了出来（scan 报 NONDET，最早 t=0.0）。本片在 `s0_open.js` 用 `F()` 按 t 直接藏起；建议引擎在第一次 `seek` 时强制渲染一次，或在 pitfalls 里把这条写宽。

## 复现

```bash
node kit/tools/script-review.js videos/open-source-projects/deepseek-harness-uncensored check   # 核对当前稿本的人工确认
node kit/tools/tts.js     videos/open-source-projects/deepseek-harness-uncensored               # 合成旁白，更新时间线
node kit/tools/check.js   videos/open-source-projects/deepseek-harness-uncensored               # 制作期总闸门
node kit/tools/audio.js   videos/open-source-projects/deepseek-harness-uncensored               # 混音
node kit/tools/render.js  videos/open-source-projects/deepseek-harness-uncensored               # 渲染
node kit/tools/finish.js  videos/open-source-projects/deepseek-harness-uncensored               # 封装成片
node kit/tools/covers.js  videos/open-source-projects/deepseek-harness-uncensored               # 封面
node kit/tools/check.js   videos/open-source-projects/deepseek-harness-uncensored --final       # 交付前总闸门
```
