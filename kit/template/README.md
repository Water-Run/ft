# {{TITLE}}

<!-- 一句话：这部片子讲什么、给谁看、多长、哪些语言。 -->

{{SERIES_LINE}}本片的阶段、署名、发布与评分记在 `project.json`，事实依据在 `research/FACTS.md`，文案只在 `src/js/script.js`。流程与规则见仓库的 `docs/`。

## 状态

<!-- 每次停工前更新，同时改 project.json 的 stage 与 next。旧的记录、片单状态或已有的 MP4 都不能证明当前版本已经完成。发布后按 docs/guides/release.md 冻结：只追加发布与反馈记录，未经策划者明确要求重做，不回改制作内容或 credits。 -->

| 项 | 记录 |
|---|---|
| 当前停在哪里 | 立项 |
| 下一步，依赖什么 | |
| 等待策划者的事 | |
| 本次会话的角色 | |

## 简报

<!-- 立项时写，准备方或制作方都可以写。策划者在会话里提的要求，原话与日期照录在这里，优先于任何缺省做法（docs/roles.md 第 2 节）。 -->

- 目标观众已有的知识：
- 看完能回答的一个核心问题：
- 逐章怎样推进，各章的答案：
- 决定不讲的材料与理由：
- 时长上限与语言：{{LANGS}}
- 策划者的要求（原话、日期）：

## 交接

<!-- 准备方交给制作方时写：做完了什么、在哪里；还有什么没解决；哪些取舍拿不准。没有经过准备方就删去本节。 -->

## 设计

<!-- 制作方写。视觉：取自讲解对象的哪些材料（F16）、试过的方向与选定的理由、每章的主画面（F18）、和近期作品的区别（F21）。声音：音色的试听与确认（F17）、配乐与音效的设计（F06）。参考了外部作品的，写明来源与借鉴方法。 -->

## 交付

<!-- 验收后写：成片文件、规格、时长、响度（在最终文件上测，F08）；check.js --final 的结论；review/lessons.json 里记为 open 的条目；实际看过、听过的范围，以及没看、没听的部分。 -->

## 评价与复盘

<!-- 发布后写：策划者的评分与原话（同时记进 docs/log/feedback.md 并引用 P 编号）、观众反馈摘要、这部片子做对了什么、做错了什么，以及建议补进经验规则的东西。 -->

## 复现

```bash
node kit/tools/script-review.js {{PATH}} check   # 核对当前稿本的人工确认
node kit/tools/tts.js     {{PATH}}               # 合成旁白，更新时间线
node kit/tools/check.js   {{PATH}}               # 制作期总闸门
node kit/tools/audio.js   {{PATH}}               # 混音
node kit/tools/render.js  {{PATH}}               # 渲染
node kit/tools/finish.js  {{PATH}}               # 封装成片
node kit/tools/covers.js  {{PATH}}               # 封面
node kit/tools/check.js   {{PATH}} --final       # 交付前总闸门
```
