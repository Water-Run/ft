# 磁带、磁盘和软盘：利用磁力存储的机械年代

「存储介质」系列第一集，约 15 分钟：从一位数据怎样被磁化、怎样被读回讲起，走过磁带、硬盘、软盘三种介质，以及从 1898 年 Poulsen 钢丝到 2026 年 LTO-10 与 44 TB HAMR 的沿革。中文与英文两版。

制作流程与标准见仓库的 `docs/`；片中每一句陈述的出处见 `research/FACTS.md`。

## 当前状态与接续

阶段：事实测绘与视觉方向已落盘。文案：未写、未确认。交付：未完成。发布：未发布。归档：未归档。

| 项 | 当前记录 |
|---|---|
| 最近完成的步骤与版本 | 2026-10-18：Computer History Museum Storage Engine、ASME、Sony/Philips 厂商史、ECMA-147、LTO-9/LTO-10、Seagate Mozaic 4+ 核对；`research/FACTS.md`、`sources.json`、`NARRATIVE.md`；NASA 朋克设计方向与 token |
| 下一步及依赖 | 写中文稿 → 交 WaterRun 逐句审查并明确确认 → 翻译/校对英文 → 配音 → 视觉关键帧 → 场景 |
| 当前稿本 / 校对结论 | `src/js/script.js` 仍是模板骨架；没有文案确认 |
| 输出在哪台制作机 | 制作机 A（Windows）；没有成片 |
| 未完成、未检查与阻塞 | 文案、时间线、关键帧、场景、声音、渲染、审查、封面均未做；英文标题待中文稿定稿时确认 |

## 文案与校对

唯一文案源稿：`src/js/script.js`。指定校对者：WaterRun。

```bash
node kit/tools/script-review.js videos/storage-media/magnetic export
node kit/tools/script-review.js videos/storage-media/magnetic check
```

导出的 `review/script.<语言>.<哈希>.md` 供逐句阅读，意见写在 `review/NOTES.md`。先取得明确确认，再按真实记录填写 `review/approval.json`；主语言通过后翻译并校对其他语言。具体边界见仓库 `docs/guides/script-review.md`。

## 开工反馈应用

<!-- 开工必填，改片另起本轮记录。先读 docs/log/feedback.md 与最近相关复盘；按总账带入全部问题编号，新增编号也须补入。不适用写具体原因，不能只写“已阅读反馈”。 -->

反馈版本：2026-10-18（F01–F12）。本片逐项记录在 `review/lessons.json`；相关复盘：`docs/log/feedback.md`（2026-10-18 读取）的 P0–P13、C1–C14 与 F01–F12；重点看 P2/P3（卡片与转场同质化）、P6（镜头别晃）、P9（术语第一次出现要解释）和 F01–F03。

目标观众已有的知识：用过磁带、软盘或机械硬盘；知道“容量”“转速”“读写”这些词；没有系统想过磁记录在物理上怎样写入、怎样读回，也不清楚磁带为什么现在还在用。

看完应能回答的一个核心问题：一位数据怎样被磁力记住、又怎样被读回；同一个原理为什么会长出磁带、硬盘、软盘三种完全不同的东西。

逐章怎样推进问题、最后回答什么：一位数据（磁化/读头/矫顽力）→ 磁带（线性、顺序、卡带、LTO）→ 硬盘（随机访问、RAMAC/Winchester/MR/PMR/氦气/HAMR）→ 软盘（可移动、便宜、1.44 MB）→ 三种介质的比较（密度/面积/访问/成本）→ 收束（磁存储没有过时；下集光盘）。

本片决定不讲的材料及理由：光盘/闪存、磁带格式全家桶、硬盘接口/文件系统、软盘完整格式表、磁头薄膜工艺、数据恢复。理由见 `research/NARRATIVE.md`：15 分钟里这些会挤掉“一位数据怎样被记住”的主线。

| 问题编号 | 适用性 / 不适用的原因 | 本片计划与正面对照 | 怎样验证 |
|---|---|---|---|
| F01 标题与主问题 | 适用 | 标题是“磁带、磁盘和软盘”，不是“存储介质大全”；用“一位数据”作主线，三种介质都回到磁化/读出 | 审稿时标出开头问题、各章答案与结尾回答的时刻 |
| F02 解释步骤与理解负担 | 适用 | 用同一位数据走完“写头磁化→读头回读”，再分别看磁带/硬盘/软盘的机械怎样实现；每一步交代输入、变化、理由、结果 | 正常播放检查能否从“磁化”跟到“容量为什么不同”；记录每步时间 |
| F03 名称、比较与边界 | 适用 | 第一次出现磁化/矫顽力/磁阻/PMR/HAMR 时各给一句定义；容量单位、压缩比、面密度口径写清；区分 1980 Sony 3.5 英寸与 1982 行业规格 | 审稿时核对首次定义、版本标注和画面文字 |
| F04 有效阅读时间 | 适用 | 用 01–06 的章节编号，不做“刷一下”的章节卡；每张承载论点的卡按 3–5 秒完整阅读设计 | 成片用 `sheets.js cue` 与逐帧检查卡片停留 |
| F05 动画解释机制 | 适用 | 穿带、寻道、盘片旋转、软盘插入四种动作各有语义；不做全片同一种擦除 | 与近期两部并排看开头/换章/解释段 |
| F06 声音选择与配合 | 适用 | 继电器、电机、穿带、寻道、纸张各有语义；不用默认 whoosh；配乐写清节奏、动机与加层 | 主混音/无配乐版试听，记录片段与结果 |
| F07 隐私与脱敏 | 适用 | 博物馆/厂商图只用来源可查的；画面上的编号要么真实，要么标“示意”；不出现本机路径 | 检查最终 MP4、字幕、封面与 FACTS 回显 |
| F08 最终文件与记录 | 适用 | 目标约 15 分钟；60fps、立体声、响度按仓库默认；出片后记录实际编码参数与哈希 | `check.js`、`ffprobe`、实际音轨测量与 README 对照 |
| F09 证据与反馈来源 | 适用 | “RAMAC 5 MB/3.75 MB”“LTO-10 兼容”“磁带面密度更高”“3.5 英寸 1982 年发明”等容易引战；每条回到 FACTS 的来源与口径 | 审稿与成片复核时逐条对照 `FACTS.md` 的“边界与常见误说” |
| F10 单集独立可懂 | 适用 | 系列首集；不依赖前集，必要的系列背景用一两句交代。 | 不看前集也能理解；审稿逐句检查前集引用。 |
| F11 外文材料的中文解释 | 适用 | NASA 风格标签（STOW、THIS SIDE UP）、LTO/HAMR/BaFe/coercivity 等给中文解释；英文标签是画面质感，不是阅读任务。 | 审稿时能找到每个外文术语的中文解释；不要求观众读英文手册。 |
| F12 读音、断句与口播 | 适用 | RAMAC、LTO、HAMR、BaFe、coercivity、GMR/TMR 等列试听清单。 | tts_probe/asr 回听；人耳确认读错/断句；记录时间点。 |

## 内容

大纲见 `research/NARRATIVE.md`。以下只是章节骨架，不是旁白；起点要等实测时间线。

| 场景 | 起点 | 内容 |
|---|---|---|
| open | 0:00 | 一个磁化点 → 磁带/盘片/软盘；片名卡 |
| bit | 待定 | 写头磁化、矫顽力、读头（感应/MR）、为什么能非易失 |
| tape | 待定 | Poulsen → Magnetophon → Univac/IBM 726 → cassette → LTO-9/LTO-10；线性/顺序 |
| disk | 待定 | RAMAC → 3340 → ST-506 → MR/GMR/TMR → PMR → 氦气 → HAMR；随机访问 |
| floppy | 待定 | 8 英寸 → 5.25 → 3.5；1.44 MB；可移动/便宜；退场 |
| compare | 待定 | 面密度 vs 面积、顺序 vs 随机、容量 vs 成本；引出光盘 |

## 视觉系统

NASA 朋克：浅灰/米白测试台、面板接缝与铆钉、黑白功能图案、全大写小号标签、四色复古彩条、圆形任务徽章、一处红色强调、轻微使用痕迹。三种介质画成可拆硬件：磁带路径（卷轴/导轮/磁头）、硬盘剖面（主轴/盘片/磁头臂）、软盘（快门/轮毂/写保护缺口）；容量用同一套对数标尺。完整规范、色彩/字体/图形语义、封面与禁止项见 [`src/design/STYLE.md`](src/design/STYLE.md)，token 见 [`src/design/tokens.css`](src/design/tokens.css)。

参考来源：策划者提供的「NASA 朋克」风格卡；本片把面板/接缝/功能标签转译为三种磁介质的剖面与测试台。没有照搬《星空》或某本 NASA 手册的具体版面；具体选择见 STYLE.md 第 1、5、8 节。

系列关系：这是「存储介质」首集，NASA 朋克与容量标尺作为系列视觉基座；后续光盘、闪存集沿用四色彩条、面板语法与同一套比例图。

## 取证

- 史料：Computer History Museum 的 The Storage Engine（RAMAC、Winchester、floppy、Seagate ST-506、tape、LTO、PMR、MR head、helium、Poulsen）与时间线；ASME 的 RAMAC Landmark。
- 厂商/标准：Sony 记录媒体史、Philips Museum 与 1963 新闻资料、ECMA-147、LTO-9/LTO-10 页、Seagate Mozaic 4+ 新闻稿。
- 取舍：RAMAC 总磁道数两个来源冲突、1.44 MB 的字节口径、LTO-10 压缩容量等，都在 `research/FACTS.md` 的「边界与常见误说」「不进入定稿」里写明。
- 没有拆解真实盘片/磁带做磁力测量；没有做寿命/误码率实验。重做时按 `research/sources.json` 的链接逐条打开，注意页面日期与容量口径。

## 读法

尚无旁白。写稿与合成后，在此登记送去合成的文本与字幕不同的地方（`script.js` 的 SAY 表）及原因。

## 制作署名与片尾

策划：WaterRun。

开源视频：[本片源码](https://github.com/Water-Run/ft)。片尾须展示「开源视频」与完整可读的网址。

<!-- 根据 research/FACTS.md 的「制作署名」记录填写实际参与模型，不猜测版本；未披露模型的服务如实注明。所有语言、各交付视频版本都须包含完整名单。 -->

| 参与模型（含可确认的版本） | 实际分工 |
|---|---|
| DeepSeek V4.1 Flash 1017 | 事实测绘、Web Fetch 来源核对、博物馆/厂商/标准核对、叙事测绘、NASA 朋克设计方向 |

网页来源通过 Web Fetch 读取原文；PDF 与 403 页面用下载/存档文本核对。

片尾时段与各语言版本的核对结果：未做（没有成片）。

<!-- 各语言、各视频版本的片尾时段与核对结果：完整性、字号、对比度、停留时间；名单与成片一致。 -->

## 复现

```bash
node kit/tools/script-review.js videos/storage-media/magnetic check  # 核对当前稿本的人工确认
node kit/tools/tts.js    videos/storage-media/magnetic --lang all     # 合成旁白，更新时间线
node kit/tools/check.js  videos/storage-media/magnetic                # 制作期总闸门
node kit/tools/audio.js  videos/storage-media/magnetic --lang all     # 混音
node kit/tools/render.js videos/storage-media/magnetic --lang all     # 渲染
node kit/tools/finish.js videos/storage-media/magnetic --lang all     # 封装成片
node kit/tools/covers.js videos/storage-media/magnetic --lang all     # 封面
node kit/tools/check.js  videos/storage-media/magnetic --final        # 交付前总闸门
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

<!-- 交付后按 docs/guides/release.md 执行。发布不是归档的前提；记录实际状态。归档路径含个人信息时仅在本机保存，公开表只写不含身份信息的备份代号。 -->

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
node kit/tools/clean.js videos/storage-media/magnetic   # 只预览，不删除
```
