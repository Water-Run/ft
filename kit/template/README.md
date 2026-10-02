# {{TITLE}}

<!-- 开头用一两句话给出定义：这部片子讲什么、多长、哪些语言。语体严谨克制，不用比喻与第二人称。 -->

制作流程与标准见仓库的 `docs/`；片中每一句陈述的出处见 `research/FACTS.md`。

## 内容

| 场景 | 起点 | 内容 |
|---|---|---|
| open | 0:00 | |

## 视觉系统

<!-- 颜色、字体、图形语言、转场；全片保持的约定（同一个图形只有一个含义）。 -->

## 取证

<!-- 事实从哪里来：实验环境、版本、脚本与回显的位置；怎样重做一遍。 -->

## 读法

<!-- 送去合成的文本与字幕不同的地方（script.js 的 SAY 表）及原因。 -->

## 复现

```bash
node kit/tools/tts.js    {{PATH}} --lang all     # 合成旁白，更新时间线
node kit/tools/check.js  {{PATH}}                # 制作期总闸门
node kit/tools/audio.js  {{PATH}} --lang all     # 混音
node kit/tools/render.js {{PATH}} --lang all     # 渲染
node kit/tools/finish.js {{PATH}} --lang all     # 封装成片
node kit/tools/covers.js {{PATH}} --lang all     # 封面
node kit/tools/check.js  {{PATH}} --final        # 交付前总闸门
```

## 成片

<!-- 时长、规格、交付物清单；审查中发现并改掉的问题；需要人来判断的事项（配乐听感、音色）。 -->
