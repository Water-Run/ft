# 讲解对象的材料

讲解对象自己的视觉与声音材料，供设计取用（经验规则 F16）。每一项写明取自哪里、怎样取得、取得的日期。这里只记**材料与约束**，不写怎么用——用法由制作方在 README 的「设计」里决定（`docs/roles.md` 第 3 节）。

| 材料 | 值或文件 | 出处 | 取得方式与日期 |
|---|---|---|---|
| 标志（DSHU） | 黑底 `#1c202b → #080a0f`、圆角 rx 224/960、白色鲸鱼；鲸鱼路径另存为 `src/design/assets/whale.js`；原文件 `src/design/assets/dshu-icon.svg` | DSHU 仓库 `apps/desktop/resources/icon.svg`（提交 d04e0da），项目许可 GPL-3.0-or-later；鲸鱼图形为深度求索的商标图形 | sparse clone，2026-11-21 |
| 标志（DSH 原版） | 白底 `#FBFBFB`、方角、深色渐变鲸鱼（`#0F1115`、`#1C2434`）；`src/design/assets/dsh-icon.svg` | `deepseek-ai/deepseek-harness` 标签 dsh-v0.2.2-rc.5 的 `apps/desktop/resources/icon.svg`，仓库许可 MIT；商标归深度求索，品牌规范见 `BRAND_GUIDELINES.zh.md` | gh api，2026-11-21 |
| 主色、辅色 | 缺省 `#2563EB`、网安 `#DC2626`、逆向 `#15803D`、写作 `#A16207` | README 模式表与 `docs/assets/dshu/swatch-*.svg` | 同上 |
| 字体 | 截图中界面字体为系统无衬线中文字体；本仓库可用 Inter、Noto Sans SC、JetBrains Mono | 截图目测，未从源码核对 | — |
| 官方部件 | 侧栏（标志 + HARNESS/UNCENSORED 标签，UNCENSORED 标签取当前模式色）、新会话按钮、工作区与会话列表（左侧模式色条）、余额卡（高低峰、倒计时、充值余额）、标题栏模式胶囊、工具步骤行、输入框（权限、模型、发送键取模式色）、底栏状态、旁问右侧面板、随问卡片、额度卡片、模式卡与模式菜单 | `research/_src/dshu/docs/assets/dshu/*.webp` | 同上 |
| 真实界面截图 | `hero-*`、`mode-*`、`side-question`、`btw-progress`、`spend-*`、`balance`、`memory` 等 34 张；截图背景为随模式色变化的渐变 | 同上 | 同上；截图里是演示数据，未含个人信息 |

## 策划者对视觉与声音的明确要求

2026-11-21：「设计语言: 契合DSHU, 包括模式 主要就是虚拟页面展示」；「Logo体现黑化, 就是Deepseek Harness 加Uncensored 同时Logo从原版白变黑」。
