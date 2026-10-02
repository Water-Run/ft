# llm-video-studio

llm-video-studio 是由大语言模型制作的科普视频与项目介绍视频的源码仓库，连同把这些源码变成成片的工具链。每一部视频是一段以时间 t 为唯一输入的 HTML 动画：旁白逐句合成，画面上的动作挂在旁白的词边界上；无头浏览器并行出帧，由 ffmpeg 编码与封装。成片为 1920×1080、60 帧/秒；除另有说明外，每部出中文与英文两个版本。

[English](README.en.md)

## 仓库的构成

| 路径 | 内容 |
|---|---|
| `videos/standalone/<视频>/` | 独立成篇的视频：旁白脚本、场景源码、取证材料、配置 |
| `videos/series/<系列>/<视频>/` | 属于某个系列的视频；每个系列另有一份系列说明 |
| `videos/catalog.json` | 片单：已成片与计划中的全部视频 |
| `kit/engine/` | 时间线引擎：补间、帧函数、镜头、字幕、音效登记 |
| `kit/tools/` | 工具：配音、看帧、扫描、总闸门、混音、渲染、封装、封面、环境自检 |
| `kit/template/` | 新视频的骨架，默认中英双语 |
| `kit/delegation/` | 委托制作时的任务书骨架 |
| `docs/` | 制作流程、质量标准与各项专题文档 |
| `assets/` | 字体、语音识别模型等二进制依赖，不入库，由工具下载 |

成片、配音缓存与渲染的中间文件不入库。

## 已成片

| 视频 | 语言 | 时长 | 制作 |
|---|---|---|---|
| [一个数据库引擎是如何实现的？——从 MyISAM 说起](videos/series/database-engines/myisam/) | 中文 | 7:55 | 自制 |
| [luainstaller：把 Lua 脚本交给没有 Lua 的人](videos/standalone/luainstaller/) | 中文、英文 | 7:55、7:57 | 自制 |
| [古代来的 Shell：Windows 批处理（.bat）](videos/standalone/windows-batch/) | 中文 | 3:13 | 委托 |

全部片单（15 个系列、96 部，含计划中的）见 [docs/catalog.md](docs/catalog.md)。

## 工作方式

- **画面是时间的纯函数。** 不用 CSS 动画、定时器与回调；同一个时刻无论顺着播到还是直接跳到，画面都相同。因此任意一帧可以独立渲染，多个浏览器各渲一段再拼接。
- **旁白决定时间。** 每句旁白逐句合成，取回时长与每个词被读到的时刻；动画的时间点写成「某句里某个词被读到时」，脚本一改，画面自动重排。同一套场景代码因此可以配多种语言。
- **事实有出处。** 画面与旁白里的每一项事实记在该片的 `research/FACTS.md`；画面上的字节、数字、终端回显由脚本从实验数据生成。
- **检查用文字完成。** 工具把任意一帧写成「此刻可见的元素、位置、字号、颜色、文字」，据此检查重叠、对比度、越界、空屏、静止与确定性，看不到画面的模型也能照此工作。
- **声音由程序合成。** 配乐与音效不使用外部素材；混音是确定性的。
- **两种制作方式。** 自制：从取证到成片由同一个制作者完成。委托：准备方备好取证、旁白、视觉系统与任务书，由另一个模型完成场景与收尾。

## 快速开始

需要 Node.js 22.12 或更新、Chrome、带 libx264 的 ffmpeg、Python 3（`edge-tts`、`numpy`）。详见 [docs/environment.md](docs/environment.md)。

```bash
npm ci                                   # 依赖
node kit/tools/assets.js --fetch         # 字体
node kit/tools/doctor.js                 # 环境自检

V=videos/standalone/luainstaller
node kit/tools/timeline.js $V            # 时间线
node kit/tools/look.js     $V a6         # 句 a6 说完那一刻的画面：文字描述与截图
node kit/tools/check.js    $V            # 制作期总闸门

node kit/tools/tts.js    $V              # 合成旁白（需要联网）
node kit/tools/audio.js  $V              # 混音
node kit/tools/render.js $V              # 渲染
node kit/tools/finish.js $V              # 封装成片
node kit/tools/covers.js $V              # 封面
```

新建一部视频：

```bash
node kit/tools/new.js standalone/<视频> --title "中文标题" --title-en "English title"
node kit/tools/new.js series/<系列>/<视频>          # 片单里已有的条目
```

## 文档

| 文档 | 内容 |
|---|---|
| [workflow.md](docs/workflow.md) | 制作流程：从立项到交付的每一步、产物与过关条件 |
| [standards.md](docs/standards.md) | 质量标准：可靠、审美、动态、声音、语体 |
| [research.md](docs/research.md) | 取证：事实记在哪里、证据怎么留、什么不入库 |
| [script-and-voice.md](docs/script-and-voice.md) | 脚本与配音：写法、多语言、读法、回听 |
| [visual-design.md](docs/visual-design.md) | 视觉设计：视觉系统、关键帧、封面 |
| [scenes.md](docs/scenes.md) | 场景与动态：空间与镜头、动作、换场、节奏 |
| [sound.md](docs/sound.md) | 声音：音效、配乐、混音参数、数值自检 |
| [review.md](docs/review.md) | 审查与交付：闸门的各项检查、成片后的三项审查 |
| [series.md](docs/series.md) | 系列：连续性与维持它的做法 |
| [delegation.md](docs/delegation.md) | 委托制作：分工、任务书、交接与验收 |
| [engine.md](docs/engine.md) | 引擎速查 |
| [tools.md](docs/tools.md) | 工具速查与 `project.json` 的全部字段 |
| [environment.md](docs/environment.md) | 环境搭建、两台机器分工、空间占用与清理 |
| [pitfalls.md](docs/pitfalls.md) | 踩过的坑 |
| [retrospectives.md](docs/retrospectives.md) | 各部复盘 |
| [catalog.md](docs/catalog.md) | 片单 |
| [third-party.md](docs/third-party.md) | 第三方组件与许可 |

在仓库里工作的模型另见 [AGENTS.md](AGENTS.md)。

## 许可

版权所有 © 2026 WaterRun。

本仓库以 GNU 通用公共许可证第 3 版或（由使用者选择的）任何更新的版本发布，全文见 [LICENSE](LICENSE)。本仓库不提供任何担保。

第三方组件（GSAP、字体、ffmpeg、在线语音服务等）不随仓库分发，各自适用自己的许可，见 [docs/third-party.md](docs/third-party.md)。
