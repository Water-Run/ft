# 引擎速查

引擎由四个文件组成：`engine.js`、`util.js`、`boot.js`、`base.css`。通用版在 `kit/engine/`；新建视频时拷一份到该片的 `src/js/` 与 `src/css/` 下，此后那一份属于这部片子，工具包再怎么改都不影响已经做完的片子。早期的片子带的是当时的版本（MyISAM 一片没有 `util.js`，部件在 `components.js` 里）。

怎样用它写场景见 [scenes.md](scenes.md)。

## 1. 页面结构

```html
<div id="stage">            <!-- 1920×1080 -->
  <div id="bg"></div>       <!-- 底色 -->
  <div id="scenes"></div>   <!-- 每个场景一个 <div class="scene" id="sc-<场景号>"> -->
  <div id="hud"></div>      <!-- 常驻层：章节卡、角标、进度条 -->
  <div id="caption"><span></span></div>
</div>
```

`src/index.html` 按顺序加载：`vendor/gsap.min.js` → 各语言的 `js/timing.<语言>.js` → `js/script.js` → `js/config.js` → `js/engine.js` → `js/util.js` →（本片的部件与数据）→ 各场景文件 → `js/boot.js`。

`/vendor/gsap.min.js` 与 `/fonts/*` 不在视频目录里：工具的静态服务器把它们分别映射到 `node_modules/gsap/dist/` 与 `assets/fonts/`。所以页面要通过工具打开，不能直接双击 `index.html`。

页面地址的参数：`?lang=<语言>`、`?t=<秒>`（打开时停在这一刻）。就绪后 `document.body.dataset.ready` 为 `'1'`，`window.READY` 是就绪的承诺，`window.TOTAL` 是总长，`window.seek(t)` 跳到任意时刻。

## 2. 配置：`js/config.js`

```js
window.PALETTE = { ink: '#16181d', accent: '#d9480f', dim: '#8c8f96' };   // overlay() 画线与箭头时可用的颜色名
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['800 20px "Inter"', 'Aa0']],   // 构建场景之前要载入的字体：[CSS 字体串, 样字]
  sceneFade: false,     // 见下
  sceneCut: 0.45,
  chrome() { … },       // 建常驻元素：章节卡、角标、进度条
  after() { … },        // 全部场景建好之后：场间转场、字幕配色等跨场景的编排
};
```

| `sceneFade` | `after()` | 场景怎样显隐 |
|---|---|---|
| 缺省或 `true` | — | 每个场景从 `c0` 起淡入，结束前淡出 |
| `false` | 无 | 硬切：每个场景在「本场开始后 `sceneCut` 秒」到「下一场开始后 `sceneCut` 秒」之间显示 |
| `false` | 有 | 由 `after()` 自己编排 |

## 3. 时间线

| 名称 | 含义 |
|---|---|
| `L` | 由脚本与实测时长算出的时间线：`L.total` 总长；`L.scenes` 各场景 `{ id, chap, start, first, end, lead }`；`L.cues[句号]` 为 `{ id, scene, cap, start, end, d, silent, tts, words }`；`L.order` 句号的先后 |
| `T(句号, 词?, 偏移?)` | 某句开始的时刻；带词时取该词被读到的时刻。词可写成 `{ zh, en }` |
| `Tend(句号, 偏移?)` | 某句结束的时刻 |
| `scene(场景号, ({ root, s, c0 }) => { … })` | 注册一个场景的构建函数。`c0` 是内容可以开始出现的时刻：有章节卡时为 `s.start + s.lead - 0.35`，否则为 `s.start + 0.1` |
| `tl` | GSAP 的暂停时间线。一般不直接用，用下面的登记函数 |
| `F(fn)` | 注册帧函数：每次 `seek(t)` 都以 t 调用。用于由 t 直接算出的内容 |

## 4. 建元素

| 函数 | 作用 |
|---|---|
| `h(标签, 类名, 父元素, html)` | 新建元素并挂到父元素下，返回元素 |
| `px(el, x, y, w?, h?)` | 设 `left / top / width / height`（像素） |
| `css(el, { … })` | 设行内样式 |
| `box(el, 参照?)` | 量元素相对舞台（或某个祖先）的位置：`{ x, y, w, h, cx, cy, r, b }`。构建期量，不受补间的变换影响。量不到没挂到页面上或 `display: none` 的元素 |
| `svg(标签, 属性, 父元素)` | 新建 SVG 元素 |
| `overlay(父元素)` | 建一层 1920×1080 的 SVG 叠加层，自带箭头标记 |
| `path(叠加层, d, 颜色名, { w, arrow, dashed, opacity })` | 在叠加层上画一条线，缺省带箭头 |
| `esc(字符串)` | 把 `< > &` 转成 HTML 实体 |
| `asciiTable(表头, 行, 右对齐的列)` | 生成 `+---+` 边框的文本表格，返回逐行字符串 |
| `seeded(种子)` | 固定种子的随机数发生器，返回的函数每次给出 [0, 1) 的数 |
| `freeze(canvas)` | 把画好的 canvas 换成 `<img>`，返回图片元素；引擎在就绪前等它载入 |

样式里的辅助类：`.abs`（绝对定位）、`.scene`、`svg.ov`、`.cur`（光标块）。

## 5. 登记动作

所有时间参数都是绝对时刻（秒）。

| 函数 | 作用 |
|---|---|
| `wipe(el, t, { dir, d, ease })` | 擦除式揭示。`dir` 是起刷的一侧：`'l'` `'r'` `'t'` `'b'`。入场前不可见 |
| `wipeOut(el, t, { dir, d, ease })` | 擦除式退场，朝 `dir` 一侧收走 |
| `slam(el, t, { from, d, ease })` | 砸入：从放大状态落到位，带过冲 |
| `slide(el, t, { x, y, d, ease })` | 滑入：`x, y` 是起始偏移 |
| `exit(el, t, { x, y, d, ease })` | 滑出：`x, y` 是去向的偏移 |
| `appear(el, t)`、`vanish(el, t)` | 瞬间出现、瞬间消失 |
| `show(el, t, { y, x, s, d, a, ease, stagger, blur })` | 淡入加位移 |
| `hide(el, t, { y, x, d, ease, stagger })` | 淡出 |
| `to(el, t, vars)`、`fromTo(el, t, from, to)`、`set(el, t, vars)` | GSAP 补间：任意属性 |
| `typeText(el, html, t, 每秒字数, { cursor, cursorUntil, sfx, sfxGain })` | 打字机。`html` 可带标签（标签整体出现）。自动登记按键声。返回打完的时刻 |
| `countTo(el, 起, 止, t, 秒, 格式函数?)` | 数字滚动 |
| `swapAt(el, 旧, 新, t)` | 在 t 时刻把内容从旧换成新 |
| `classAt(el, 类名, 起, 止?)` | 在一段时间内加上某个类名 |
| `keyed(el).at(t, { html, cls })` | 关键帧式的内容切换：同一元素可在多个时刻换文本或类名 |
| `flash(el, t, 颜色?)` | 一闪而过的强调，并登记 `blip`。它用阴影实现，平涂的片子不要用 |
| `draw(path, t, d, { dash, ease })` | SVG 路径描线 |
| `arrowIn(path, t, d)` | 显示一条箭头：先描线，箭头随之出现 |

小工具：`clamp(v, a, b)`、`lerp(a, b, k)`、`ease.out3`、`ease.io3`、`ease.out5`。

## 6. 镜头

```js
const cam = makeCamera(world);            // 或 makeCamera(world, 1920, 968)：以字幕条以上的区域为画幅
cam.track(起点时刻, { x, y, z }, [        // 一条轨迹：每段显式给出起止，画面与播放历史无关
  [t, { x, y, z, r }, d, { ease, sfx, g }],   // t 为 null 时接在上一段结束后 0.15 秒
]);
cam.cut(t, { x, y, z });                  // 直接放到某处
cam.to(t, { x, y, z, r }, { d, ease, sfx, sfxGain });   // 单段移动，从当时的位置出发；各段不能重叠
cam.frame(t, el, { pad, maxZ, d });       // 对准某个元素（单段）
cam.st                                    // 当前状态 { x, y, z, r }
```

`x, y` 是镜头中心在 `world` 里的坐标，`z` 是放大倍数，`r` 是旋转角度。`cam.track` 是通用版引擎后来加的，早期片子的引擎快照里没有。

## 7. 音效

```js
sfx('thud', t, { g: 0.6, p: -0.4 });      // 名称、时刻、相对音量、声像
```

登记的事件收在 `window.SFX` 里，混音时由工具取出。名称见 [sound.md](sound.md)。

## 8. 字幕

引擎按旁白的时间把每句字幕写进 `#caption span`，淡入淡出各约 0.14 秒；字幕里的 `*词*` 变成 `<em>`。

## 9. 异步资源

构建期间产生的异步工作（图片载入等）把承诺放进 `window.PENDING`，引擎在置就绪标记之前等它们全部完成。`freeze()` 已经这样做了。

## 10. 改引擎

- 某部片子需要引擎没有的东西时，优先写在该片自己的文件里（`parts.js`、`config.js`）。
- 确属通用的改进，改 `kit/engine/` 的通用版，供以后的片子使用；不回头改已交付片子里的那一份。
- 改通用版之后新建一部临时视频，确认模板仍能通过扫描。
