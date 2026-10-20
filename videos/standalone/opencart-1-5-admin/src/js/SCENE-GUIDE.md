# 场景作者指南（OpenCart 1.5 后台）

先读 `docs/guides/scenes.md`、`brief/03-visual.md`、`brief/04-storyboard.md`。本页只记本片的约定。参照场景：`scenes/s00_open.js`。

## 1. 文件与骨架

- 每个场景一个文件 `scenes/sNN_<id>.js`，已在 `index.html` 里按顺序登记；替换占位文件的全部内容即可。
- 骨架照 s00_open：`const w = h('div','world',root); const cam = makeCamera(w);`（`makeCamera` 必须在场景文件里直接写，检查按字样判断）。
- 时间一律用 `T('r2_<段>_<n>', '词')`、`Tend(...)`、`c0`、`s.end` 推出。写一个 `C = (id, word, sh) => T('r2_' + id, word, sh)` 的简写。不写死秒数：配音合成后时间会重排。
- 词按字幕原文找（`T` 会自动换成读法）；同一句里出现两次的词取第一次。查可用的词：`node kit/tools/timeline.js <视频>`。
- 第一个元素不早于 `c0 + 0.1`（章节卡在 c0 前 0.05 秒收完）。

## 2. 画面与颜色

| 用途 | 值 / 类名 |
|---|---|
| 页头钢蓝 | `--oc-hdr-a #0D4C76` → `--oc-hdr-b #0F6193`（`.oc-hdr`） |
| 菜单深灰 / 当前项锈橙 | `.oc-menu`，`span.on` |
| 内容框 | `.oc-box`（圆角顶、渐变标题条、蓝色标题 `#003A88`） |
| 本句正在解释的对象 | 浅黄 `#FFFFCB`：类 `hi`，`hl(el,t0,t1)`；表格行 `mark(r,t0,t1)`，`'cur'` 加锈橙左边 |
| 去程请求 / 当前步骤 | 锈橙 `#C4561C`：`.token.req`、`.c-req`、`svgLine(..,'req')` |
| 返回结果 | 钢蓝 `#0F6193`：`.token.res`、`.c-res`、`'res'` |
| 提示框 | `.oc-note.success / .warning / .attention`（`ocNotice`） |
| 浏览器 / 服务器 / 数据库区 | `zone(..,'browser'|'server'|'db')`，未展开的区加类 `ghost` |

字号：`.t-hero` 80、`.t-h1` 64、`.t-h2` 52、`.t-lbl` 40、`.t-lbl-s` 34、`.t-data` 32、`.t-note` 28、`.t-src` 24（最小 22）。代码行 32、表格 30。
版心 x = 96…1824、y = 160…900（以镜头在站心、z=1 计）；y ≥ 968 是字幕区，什么都不放。每屏同时强调至多两处。
真实截图（`shot()`）必须配 `stamp(..,'real')`「OpenCart 1.5.6.4 实际页面 · 演示数据」；按源码重建的画面配 `stamp(..,'demo')`「示意」；CASE-A 用 `caseStrip()` 固定顶边。截图原字太小，裁小块放大用，或推近到 ≥22px。

## 3. 部件（`js/parts.js`，文件头有完整签名）

- 皮肤：`adminFrame`、`ocBox`、`ocTable`（`mark`、`addRow`）、`ocButton`、`ocNotice`、`ocTabs`（`select`）、`ocInput`、`shot`、`cursor` + `click`。
- 图解：`zone`、`token`、`chip`、`codeBlock`（`on` 行高亮、`note` 中文逐行注释）、`callout`（`show(t)`，带引线）、`sessionFile`、`stamp`、`caseStrip`、`ovl` + `svgLine`。
- 动作（jQuery 时代）：`slideDown` / `slideUp`（面板、提示框、新行）、`fadeIn` / `fadeOut`、`reloadFlash`（整页刷新）、`spinner(t0,t1)`（ajax 等待）、`travel`（令牌沿折线走）、`drawLine`（连线描出）、`press`（按钮按下）。引擎原有的 `wipe` `slide` `slam` `appear` `typeText` `keyed` `classAt` 照用。

## 4. 镜头

- 站点横排，站心 `x = 960 + 2100·i`（`world` 宽 16000）。整场写成一条 `cam.track`，关键帧显式、互不重叠。
- 站间平移 0.9 s，从上一站最后一句结束前 0.4 s 起步（`mv(id) = Tend(id,-0.4)`）；下一站的标题在起步时就 `appear`。
- 站内单向慢推 `z 1.03`，`ease:'none', sfx:false`；看细节推 1.15–1.4，拉回 0.7 s；读的时候镜头不动、不晃。
- 推近前算视野：x ± 960/z、y ± 540/z，主体完整、底边不压字幕区。
- 第 0 帧问题只在 open；其他场景不需要 s00 里的 `camRef` 帧函数。

## 5. 换场（`config.js`，已做好）

硬切 + 章节卡。章节卡是一页「刷新出来的」1.5 后台：白页 0.2 s 盖住硬切 → loading 图标 → 内容框 `slideDown` 出「第 NN 章」→ 稳定 ≥2.7 s → `fadeOut`。菜单项就是九章的短名，当前章为锈橙。`lead` 已统一为 4.2。close / end 没有章节卡，用白色刷新闪屏衔接。场景开头给全景（本章的「建立」）。

## 6. s00_open 的写法摘要

```js
const tc = [C('o4_3','安装工具'), C('o4_4','主题'), C('o4_4','订单扩展')];
cards.forEach((b, i) => { drawLine(lines[i], tc[i] - 0.25, 0.35); slideDown(b.el, tc[i]); sfx('pop', tc[i], { g: 0.55 }); });
// 请求令牌：出现 → 沿折线走 → 消失；返回用钢蓝令牌；页面回来时 reloadFlash + 截图 appear
appear(out, tOut); travel(out, [[tOut, 1.2, [[x0,y0],[x1,y1],[x2,y2]]]]); vanish(out, tOut + 1.3);
```

- 占位再填实：路线图先摆四个虚线框（`.ghost`），说到哪个，哪个 `slideDown` 成内容框。
- 令牌要写「带着什么」：`token(w, 'route=sale/order', 'req', 0, 0, '请求：打开订单列表')`。

## 7. 要做 / 不要做

要：
- 每句的关键词对应一个可见动作；结论出来后留足阅读（机制结论 ≥3 s，两步因果 ≥5 s）。
- 一个请求从头追到尾：同一个令牌 / 同一行订单在各站之间连续可追踪。
- 数据库连线只写「按订单编号关联」；拒绝路径停在检查处并写中文结果；AJAX 返回 HTML 与 JSON 分开画。
- 音效克制：`pop` 贴标签、`tick` 小项 / 按钮、`thud` 大字落位、`chime` 一段结果（每场 ≤2）、`error` 被拒、`blip` 请求出发 / 返回。阅读段不加声。

不要：
- CSS transition / animation、setTimeout、Math.random、`tl.call`、在 `F()` 里累加状态。
- 同一元素两次入场；同一元素同一类名两次 `classAt`；同一元素既 `keyed` 换类名又 `classAt`（会互相抹掉，见 pitfalls）。
- 同一个元素调用两次 `travel`（多段写进一个 legs）。
- 被补间的元素用 CSS `transform` 定位。
- 现代扁平 UI（圆角卡片阴影、汉堡菜单、Material 风格）——只有开场 B01 的「现代后台示意」例外。
- 把真实令牌、会话编号、口令或生产数据放进画面；合成值也不要拿来当装饰。
- 用快闪、擦屏或装饰流光代替讲解。
