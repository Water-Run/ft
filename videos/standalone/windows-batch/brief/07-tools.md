# 07 工具与引擎

所有命令在项目根目录 `D:\LLM制视频\bat-video` 下执行，形式都是 `node tools/<名字>.js`。

## 1. 工具一览

| 命令 | 作用 | 耗时 |
|---|---|---|
| `node tools/tts.js` | 合成旁白（只重做文本变过的句子），更新时间线 | 有缓存时几秒 |
| `node tools/timeline.js [句号…]` | 打印时间线；带句号时列出该句每个词被读到的时刻 | 瞬间 |
| `node tools/stats.js` | 语速、停顿统计 | 瞬间 |
| `node tools/look.js …` | **用文字看画面**：列出某些时刻画面上的可见元素并指出版面问题，同时存 PNG 到 `shots/` | 每次约 5 秒 |
| `node tools/scan.js [--from 秒 --to 秒]` | **扫描**：版面、空屏、静止、确定性、逐句对应 | 全片约 1 分钟 |
| `node tools/check.js [--final]` | **总闸门** | 约 1–2 分钟 |
| `node tools/audio.js [music=… out=…]` | 混音：旁白 + 配乐 + 音效 → `out/audio.wav` 等 | 约 30 秒 |
| `node tools/asr.js` | 语音识别回听旁白，逐句对照 | 约 1 分钟 |
| `node tools/preview.js [--from 秒 --to 秒]` | 低清预演 + 像素级静止检测 → `out/preview.mp4` | 约 1 分钟 |
| `node tools/render.js [--from 秒 --to 秒 --out 文件]` | 正式渲染 → `out/video.mp4`（无声） | 全片数分钟 |
| `node tools/finish.js [--audio 文件 --name 名字]` | 响度处理、封装成片与仅旁白版、导出字幕、静止段检测 | 约 30 秒 |
| `node tools/covers.js` | 由 `src/cover.html` 出两版封面 | 约 15 秒 |
| `node tools/sheets.js cue` / `every 4` | 给用户看的总览图 → `out/sheets/` | 约 20 秒 |

`render.js` 运行时每 15 秒打印一行进度，期间不要中断它。若你的命令执行环境对单条命令有时间上限，先用 `--from/--to` 渲染一小段确认无误，再渲染整片；整片渲染若被截断，重新运行即可（它每次从头生成）。

## 2. 读懂 `look.js` 的输出

```
■ t=102.98s  场景 s3  旁白 c6  句 c6 说完时：这个脚本在运行途中，给自己追加了一行   截图 shots\t_0102.98.png
  [色块] x=  188 y=  101 w= 1079 h= 579  底色 #FBFAF5  <.sheet> @sc-s3
  [文字] x=  335 y=  391 w=  753 h=  64  48.6px #0C0C0C  「echo echo 3 >> selfmod.bat」  <.ln.on> @sc-s3
  [文字] x= 1559 y=  250 w=  608 h=  64  48.3px #CCCCCC 被裁:R  「D:\batlab>selfmod.bat」  <.row> @sc-s3
  [字幕] 「这个脚本在运行途中，给自己追加了一行」
  问题：无
  提示（特写时边缘的次要文字被切属正常；这一刻旁白讲的主体内容不能被切）：
   ! 文字被画面边缘切掉 「D:\batlab>selfmod.」(.row) 位置 x=1559 y=250 w=608 h=64
```

- 每行一个**此刻真正可见**的元素（不可见的、完全在画外的不列）。顺序是绘制顺序：后面的盖在前面的上面。
- `x y w h`：元素在画面上的最终位置与大小（已经算上镜头的平移和缩放）。画面是 1920×1080，`y ≥ 968` 是字幕条。文字项量的是**字本身**占的范围。
- 字号是变换后的实际大小：样式里 34px 的字，镜头放大 1.42 倍后显示为 48.3px。
- `被裁:R` 表示右侧被切（L 左、T 上、B 下）；`不透明度 0.4` 表示正在淡入淡出途中。
- `<.ln.on>` 是元素的类名；有 `data-name` 的显示 `data-name` 的值。**给图形类的元素（软盘、时间轴、比例条的各段）加 `data-name="软盘"` 这样的属性**，它们才会以有意义的名字出现在输出里。
- `@sc-s3` 是所属场景；`@hud` 是常驻层。

用法：

```
node tools/look.js 12.5 30                      看第 12.5 秒和第 30 秒
node tools/look.js --cue a3 c5                  看这两句旁白「说完那一刻」
node tools/look.js --cue a3:0.5                 看 a3 进行到一半时（0 = 刚开始，1 = 说完）
node tools/look.js --scene s3                   沿场景 s3 每 2 秒看一帧
node tools/look.js --url "/cover.html?r=169" --size 1920x1080      看封面或任意静态页
```

用它回答这些问题：主体完整吗？元素有没有重叠（比较 x、y 范围）？左边缘对齐了吗？最大的字和最小的字差几倍？此刻画面上有几组东西？琥珀色（`#FFB000`）此刻标了几处？

## 3. 引擎

整部片子是时间 t 的函数。页面加载时，所有场景的构建函数执行一次，把元素建好、把「什么时刻发生什么」登记到一条暂停的时间线上；之后工具通过 `window.seek(t)` 跳到任意时刻取帧。所以：

- 构建函数里的普通代码只在加载时跑一次，不是「播放到那里才执行」。
- 让某件事在某个时刻发生，只能通过下面这些登记函数。

### 3.1 场景

```js
scene('s3', ({ root, s, c0 }) => {
  // root：这个场景的容器（1920×1080，绝对定位）
  // s：{ id, start, end, lead, chap }，场景的起止时刻
  // c0：内容可以开始出现的时刻（章节卡开始收走的时刻）
});
```

### 3.2 时间

| | |
|---|---|
| `T('c5')` | c5 这句开始的时刻 |
| `T('c5', '读')` | c5 里「读」字被读到的时刻（词在合成文本里找，用 `node tools/timeline.js c5` 查） |
| `T('c5', '读', -0.2)` | 同上，再提前 0.2 秒 |
| `Tend('c5')` | c5 这句结束的时刻 |
| `s.start`、`s.end`、`c0` | 场景的起止与内容起点 |

### 3.3 建元素

| | |
|---|---|
| `h(标签, 类名, 父元素, html)` | 新建并挂到父元素下，返回元素。例：`h('div', 'slab now', world)` |
| `px(el, x, y, w, h)` | 设 `left / top / width / height`（px；w、h 可省） |
| `css(el, { … })` | 设行内样式 |
| `box(el, world)` | 量元素在 world 里的位置 `{ x, y, w, h, cx, cy, r, b }`（构建时量，不受动画影响）。用来把别的东西对齐到它 |
| `svg(标签, 属性, 父元素)`、`overlay(父元素)`、`path(svg, d, 'ink' / 'amber' / 'dim')`、`draw(path, t, d)` | 需要画线时用。颜色名来自 `config.js` 的 `PALETTE` |
| `esc(字符串)` | 把 `< > &` 转成 HTML 实体 |

绝对定位的元素加类名 `abs`。`.slab`、`.sheet`、`.blk`、`.rule` 自带绝对定位。

### 3.4 登记动作

见 `05-motion-sound.md` 第 2 节的表。补充：

- `show(el, t, { y, x, d })` / `hide(el, t)`：淡入加位移 / 淡出。可以用，但不要作为主要的入场方式。
- `typeText(span, html, t, cps, { cursorUntil, cursor: false, sfx: false })`：返回打完的时刻。`html` 里可以带标签（标签整体出现）。
- 所有动作的时间参数都是**绝对时刻**（秒），不是相对延迟。

### 3.5 镜头与音效

见 `05-motion-sound.md` 第 1、4 节。

## 4. 已知的坑

1. **一个元素只做一次入场。** `wipe` / `slam` / `slide` / `appear` / `show` 都会把元素在入场之前设为不可见。同一个元素登记两次入场，状态会打架。需要「消失后再出现」就建两个元素，或用 `appear` + `vanish` + 再 `set(el, t, { autoAlpha: 1 })`。
2. **被补间的元素不要靠 CSS `transform` 定位或居中**（例如 `translate(-50%)`）：补间会覆盖 `transform`。用 `left / top` 定位；需要居中就包一层 flex 容器。
3. **`box()` 量不到没有挂到页面上的元素，也量不到 `display: none` 的元素。** 先建好、挂好，再量。引擎在构建全部场景时所有场景都是显示状态，可以放心量。
4. **等宽字里的空格**：`.row`、`.ln` 已设 `white-space: pre`，缩进直接写空格。别的地方行内代码的空格要和文字写在同一个 `span` 里（flex 容器会丢掉纯空白的文本节点）。
5. **HTML 实体**：代码和终端内容里的 `<`、`>`、`&` 必须写成 `&lt;`、`&gt;`、`&amp;`（或用 `esc()`）。`>>`、`D:\batlab>` 都在此列。JS 字符串里的反斜杠要写两个：`'D:\\batlab&gt;'`。
6. **`%`、`!` 在 JS 字符串里不需要转义**，照写即可。
7. **多个 SVG 叠加层**用 `overlay()` 建（它给箭头标记的 id 加了序号，避免重名）。
8. **不要用 CSS `filter: blur()`**：单帧出图会慢三倍，而且视觉规则本来也禁用。
9. **改了 `script.js` 的文本**之后必须 `node tools/tts.js`，否则时间线用的是旧时长。
10. **`T(句号, 词)` 的词**取首次出现的位置。同一句里一个词出现两次（c5 里的两个「一条」），想取第二个就换一个只出现一次的相邻词（「读」）。
11. **F() 里不要累加状态。** `F((t) => { n++ })` 是错的；`F((t) => { el.style.width = (t / L.total * 1920) + 'px' })` 是对的（`L.total` 是全片总长，`L.scenes` 是各场景的起止）。
12. **场景之间是硬切**（`sceneFade: false`）：一个场景的元素在场景时段之外不显示，不需要你手动隐藏整个场景；但场景内部各站点的元素要自己管好出入。
13. **中文路径**：项目在 `D:\LLM制视频\` 下，工具都已处理。自己写命令时，路径用相对路径（`out/…`、`src/…`），不要拼绝对路径。
14. **控制台输出是 UTF-8。** 如果在 cmd 里看到乱码，先执行 `chcp 65001`；PowerShell 里先执行 `[Console]::OutputEncoding = [Text.Encoding]::UTF8`。乱码只影响显示，不影响工具的结果。
15. **不要启动常驻的本地服务器。** 每个工具自己起临时服务器，用完即关。

## 5. 文件结构

```
AGENTS.md               任务入口
brief/                  任务书（本目录）；expect.json 是逐句的画面要求
research/               FACTS.md、实验脚本与回显（lab/）、DOS 源码（src/）、统计数据（statcounter/）
project.json            片名、成片文件名前缀、音色、混音参数
src/
  index.html            页面：按顺序加载下面这些脚本
  cover.html            封面
  css/base.css          结构性样式（舞台、字幕条、字体声明），不要改
  css/style.css         视觉系统；新增样式写在末尾
  js/script.js          旁白脚本
  js/timing.js          实测时长（工具生成，不要手改）
  js/config.js          字体预载、常驻元素 chrome()
  js/engine.js、util.js、boot.js    引擎，不要改
  js/scenes/            七个场景，由你实现
  design/               参考关键帧 kf.html、示范场景 example_scene.js
tools/                  工具，不要改
audio/                  旁白音频缓存
out/                    产物（成片、封面、试听片、总览图、检查结果）
shots/                  look.js 存的截图
```
