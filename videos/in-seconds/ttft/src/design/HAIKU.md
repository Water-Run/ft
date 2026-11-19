# 交给 Haiku：实现预览（首 Token 延迟）

给接手「实现预览」的会话。你不需要做设计决定：文案、画面方向、配色、几何、动作、配乐编排都已定好，写在 `src/design/scenes.md`，静帧在 `src/design/keyframes.html`。你的活是把规格逐行变成代码、用工具对照关键帧、出低清有声预览。拿不准就停下来问，不要自己改。

## 0. 开工提示词（可直接粘贴给 Haiku）

> 按 `videos/in-seconds/ttft/src/design/HAIKU.md` 开工：实现「96 秒了解 TTFT」的预览 r1。先读 `HAIKU.md`、`src/design/scenes.md`、本片 `README.md` 的「状态」。先跑 `node videos/in-seconds/ttft/tools/preflight.js`，文案还没确认就停下并告诉我。一个会话只改 `videos/in-seconds/ttft/`，不改文案、不改配色、不放宽任何检查阈值。每写完一个场景就跑预检和 `look.js` 对照关键帧；全部完成后出预览并如实汇报没看、没听的范围。

切换方法：在 Claude Code 里输入 `/model`，选 Haiku，然后粘贴上面的提示词。

## 1. 先决条件（闸门）

1. `node videos/in-seconds/ttft/tools/preflight.js` 第 ① 项必须显示「校对者已确认」。现在是 `pending`：**没确认之前，不配音、不按稿铺开场景**（`tts.js`、`audio.js`、`preview.js`、`render.js` 也会拒绝运行）。确认只能由人（WaterRun）作出，由他在会话里明确说，并记进 `review/NOTES.md` 与 `review/approval.json`；不要自己改 `approval.json`。
2. 文案确认后文案又被改了：重新导出（`node kit/tools/script-review.js videos/in-seconds/ttft export --lang zh`），等人确认新哈希，再继续。

## 2. 已经做好的（不要重做、不要改）

| 东西 | 位置 | 说明 |
|---|---|---|
| 文案与时间线 | `src/js/script.js` | 唯一文案源。时间线定长 96 秒，各场的 `at` 在小节线上。**不要改字**；只能改 `gap` / `lead` / `tail` |
| 事实依据 | `research/FACTS.md` | 画面上的数字、出处都在这里 |
| 视觉系统 | `src/css/style.css` | 颜色变量、字号阶梯、`.tok` `.node` `.brace` 等类 |
| 引擎配置 | `src/js/config.js` | 100 BPM 拍子（`BEAT`、`Q()`、`Qf()`）、字幕带与秒尺、左上剩余秒数、右上角等待读数（`METER(t)`，已写好）、换场（左→右直刷一拍）、`hudGround()`、示例读数的时钟 `CLK()` |
| 部件 | `src/js/parts.js` | `tokenCol`、`codeTok`、`cacheCell`、`brace`、`arrowUp`、`ttftLine`、`hatch`、`txt`、`blk`、常量 `COLX(i)`、`ROWY`、`IN_TOKENS`、`OUT_TOKENS`、`CODE_FILE` |
| 场景骨架 | `src/js/scenes/s0…s6` | 只有容器与静止镜头，带 `root.dataset.skeleton`；`index.html` 已按顺序加载 |
| 片尾名单 | `src/js/scenes/s9_credits.js` | 已实现（场景号 `outro`，分两组出现，约 3 秒）；名单取自 `project.json` 的 `credits` |
| 配乐 | `tools/music.py` | 已按 `scenes.md` 第 5 节写好（100 BPM，只做过数值自检，没听过） |
| 预检 | `tools/preflight.js` | 见第 5 节 |
| 逐句对应表 | `expect.zh.json` | `scan.js` 用：每句说完时画面上必须有的字 |
| 关键帧 | `src/design/keyframes.html` | `?f=wait|title|tokens|bracket|ttft|write|prefill|reuse|length|scale|close` |
| 封面 | `src/cover.html` | 已做；出图是 `covers.js`，在成片阶段 |

## 3. 你要做的（按顺序）

1. **配音**：`node kit/tools/tts.js videos/in-seconds/ttft`（需要联网；Xiaoyi，+6%，已配好）。得到 `src/js/timing.zh.js` 后跑预检，看第 ② 项：有场景超出定点就**只调** `script.js` 里的 `gap` / `lead` / `tail`；仍超出就停下报告。`Token` 读「托肯」、`TTFT` 读「T T F T」、`LLM` 读「L L M」已在 `SAY` 表里；回听 `node kit/tools/asr.js videos/in-seconds/ttft`，读错了只改 `SAY` 或该句的 `tts`，不改字幕。
2. **有声代表段先行**：先写 `s3_prefill.js`（全片重头），再写 `s1_define.js` 里的 TTFT 展开。用 `node kit/tools/preview.js videos/in-seconds/ttft --from 40.8 --to 62.4 --mix` 看。动作、旁白对不上就先改这一段，再铺开。
3. **其余场景**：`s0_open.js` → `s1_define.js` → `s2_write.js` → `s4_length.js` → `s5_scale.js` → `s6_close.js`。每场按 `scenes.md` 的表逐行写，一行表一段代码。
4. **音效**：在各场景里按 `scenes.md` 第 5 节的名称与时刻 `sfx(...)`；覆盖要求在 `project.json` 的 `check.sfx`。
5. **混音**：`node kit/tools/audio.js videos/in-seconds/ttft`，看数值自检（电平、削波、章节卡处压低是否生效）。
6. **全片预览**：`node kit/tools/preview.js videos/in-seconds/ttft --round r1 --mix`（产物 `out/zh/preview-r1.mp4`）。出之前先做自对抗审查（`docs/process.md` 第 2 节）：`node kit/tools/sheets.js videos/in-seconds/ttft every 3` 通看全片，找哪里空、哪里挤、哪里和旁白对不上。
7. **汇报**：在 `review/NOTES.md` 追加「预览 r1」一节：查了什么、修了什么、还剩什么、**没看没听的范围**（你听不到声音，就如实写没听）。更新 `project.json` 的 `stage`（`preview`）与 `next`，README「状态」。
8. **署名**：你参与了，就在 `project.json` 的 `credits.models` 加一项：你的准确型号（会话里能看到，例如 `Claude Haiku 5.5`），分工写「场景实现、预览」，字数要短（片尾只有约 3 秒）。

## 4. 本片会用到的引擎函数（`docs/reference/engine.md` 的节选）

所有时刻都是**绝对时刻（秒）**，由 `T()` / `Tend()` / `s.start` / `c0` 推出，不写死数字。

| 要做的事 | 写法 |
|---|---|
| 某句开始 / 结束；某词被读到 | `T('r3')`、`Tend('r3')`、`T('r3','之后')`（词在合成文本里找；`Token` 找「托肯」；`TTFT` 找旁边的汉字词，例如 `T('d3','缩写')`） |
| 吸附到拍子（0.3 秒格） | `Q(t)`（最近）、`Qf(t)`（不晚于 t） |
| 建元素 | `h('div','类名',父,'html')`、`px(el,x,y,w,h)`、`txt(world,'类名','文字',x,y)`、`blk(world,'类名',x,y,w,h)` |
| 入场 | `wipe(el,t,{dir:'l',d:0.5})`、`slam(el,t,{from:1.2,d:0.4})`、`slide(el,t,{x:-60,d:0.3})`、`appear(el,t)`、`show(el,t,{y:20})` |
| 退场 | `wipeOut`、`exit`、`hide`、`vanish(el,t)` |
| 补间 | `fromTo(el,t,{left:100},{left:400,duration:0.8})`（**起点显式给出**）、`to(el,t,{...})`、`set(el,t,{...})` |
| 每帧由 t 算 | `F((t)=>{ … })`（**不累加状态**） |
| 换内容 | `keyed(el).at(t,{html:'…',cls:'…'})`、`swapAt`、`classAt` |
| 音效 | `sfx('tick', t, {g:0.6})`；名称：`tick pop thud chime whoosh blip riser` |
| 常驻元素反色 | `hudGround('L'\|'R', t0, t1, 'ac')`（琥珀满铺时） |
| 镜头 | 全片不动：骨架里已有 `cam.cut(...)`，不要加 `cam.track` / `cam.to` |
| 部件 | `tokenCol(world,'def',COLX(6),ROWY,'first',true)`、`codeTok(...)`、`cacheCell(...)`、`brace(...)`、`arrowUp(...)`、`ttftLine(world,240,170)`（返回 `{ letters, rests, setK }`） |

TTFT 展开的写法（定义一场，由时间纯函数驱动）：

```js
const ttft = ttftLine(world, 240, 170);              // 四个字母并排紧贴（k = 0）
const t1 = T('d3', '缩写') + 0.9;                     // 展开开始
ttft.letters.forEach((e, i) => appear(e, T('d3', '缩写') + i * 0.15));      // 四个字母逐个出现
F((t) => ttft.setK(ease.out3(clamp((t - t1) / 0.9))));                      // k 只由 t 决定
```

## 5. 每次改完跑的检查

```bash
node videos/in-seconds/ttft/tools/preflight.js          # 语法、场景号、T() 的句号与词、禁用写法、颜色、进度
node kit/tools/look.js videos/in-seconds/ttft r3 r4     # 这两句说完那一刻的画面；也可写时刻：look.js videos/in-seconds/ttft 47.5
node kit/tools/scan.js videos/in-seconds/ttft --from 40.8 --to 62.4     # 版面、静止、缺字（expect.zh.json）、术语注解
node kit/tools/check.js videos/in-seconds/ttft          # 总闸门（制作期）
```

`preflight.js` 退出码非 0 就先修，别往下走。`look.js` 的文字输出每行是一个此刻可见的元素（位置、字号、颜色、文字）：与 `keyframes.html` 对应帧的坐标逐项比，差超过 2 像素就是没照规格。

## 6. 不能越过的线

- **不改 `script.js` 的任何字**（含标点），不改 `SAY` 的含义；只能调 `gap` / `lead` / `tail`。
- **不为通过检查放宽阈值、改工具、删检查项、给 `project.json` 的 `check` 加豁免。** 检查不过，改画面。
- **画面是时间的纯函数**：不用 CSS 动画 / transition / `@keyframes`、`setTimeout` / `setInterval` / `requestAnimationFrame`、`Math.random()`（用 `seeded()`）、`tl.call()` 与 `onComplete` 之类回调；`F()` 里不累加状态；一个元素只做一次入场；同一属性不在重叠时间段被两个补间改。
- **平涂**：不用渐变、阴影、模糊、圆角；斜线用 `hatch()`；颜色只用 `PALETTE` 里的六种（预检会查）。
- **字号**：正文 38px 起，注解不小于 28px；片尾名单不小于 36px。
- **镜头不动**；正在讲的内容完整在画内，不伸进字幕条（y ≥ 968）。
- **数字与标注**：画面上的数字只用 `scenes.md` 与 `FACTS.md` 里有的；示例带「示例」「示意」标记；不写命中率、减少的秒数或百分比；不点名模型或厂商。
- **不泄露**：不把口令、密钥、内网地址、个人路径写进任何文件。
- **提交**：只写本片目录；用 `git commit -m "…" -- videos/in-seconds/ttft/`，不用 `git add -A`、`git commit -a`。生成物（`out/`、`shots/`、`audio/`、`build/`）不入库。
- 听不到声音就如实写没听；没看过的画面不写「看过」。

## 7. 常见坑

- `T('id','词')` 的词必须在该句的**合成文本**里（`Token` 要写「托肯」，`TTFT` 读成「T T F T」，不能当词）。找不到词时 `T()` 返回句首，画面悄悄提前——预检会报。
- 往 GSAP 时间线插负时刻会把已有动画整体后移：时刻写成 `T(..) − 0.3` 之前先确认结果 ≥ 场景起点。
- 补间的元素不要用 CSS `transform` 定位或居中，用 `left/top`。
- 带字的色条要变长，用 `width` 补间，不用 `scaleX`。
- 同一元素的第二次「弹一下」只动 `scale`，不再用带 `autoAlpha` 的 `slam`。
- 跟着词出的标签挂在它写的那个词上，不要等到句尾。
- 「同时」必须在同一帧发生：prefill 里 6 个输入块同时变亮、6 格缓存同时升起，不要错开。
- 任意 2.5 秒内要有可见变化（`scan.js` 的 `STILL`）：有空档就让下一步元素提前进场或让 Token 继续落下，**不要**靠镜头晃动凑。
- 更多见 `docs/reference/pitfalls.md`。

## 8. 什么时候停下来问

- 文案还是 `pending`，或文案又被改了。
- 配音后有场景超出定点，调 `gap` / `lead` / `tail` 仍不够。
- 规格自相矛盾，或与关键帧对不上。
- 某项检查通不过，而你想放宽阈值（不要放宽，停下来问）。
- 读音不对，改 `SAY` / `tts` 后还是错。
- 任何你想改文案、配色、画面方向的念头。

## 9. 完成的样子

预览 `out/zh/preview-r1.mp4` 能放；`preflight.js` 全过；`scan.js` 与 `check.js`（制作期）通过或把未过的项如实列出；NOTES 里有「预览 r1」一节，写清查了什么、没看没听什么；`project.json` 的 `stage` 为 `preview`。**不要登记交付、不要发布**：那要等策划者看过并明确同意。
