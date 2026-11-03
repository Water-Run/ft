# 讲解对象的材料

讲解对象自己的视觉与声音材料，供设计取用（经验规则 F16）。每一项写明取自哪里、怎样取得、取得的日期。这里只记**材料与约束**，不写怎么用——用法由制作方在 README 的「设计」里决定（`docs/roles.md` 第 3 节）。

| 材料 | 值或文件 | 出处 | 取得方式与日期 |
|---|---|---|---|
| OpenAI 文字标 | SVG 路径，viewBox 裁为 0 0 288 78 | openai.com 文章页（OA 原文）页头内嵌 SVG | 2026-11-03 存下的原文页 `research/_src/openai.html` 里提取 |
| ChatGPT 标志（花形） | SVG 路径，viewBox 裁为 15 15.5 150 149；官方单色，浅色底用黑 | chatgpt.com 站标 `/cdn/assets/favicon.6a33781f61.svg` | 2026-11-03 curl 下载 |
| Anthropic 文字标 | SVG 路径，viewBox 0 0 570 64 | anthropic.com 文章页（AN 原文）页头内嵌 SVG | 2026-11-03 存下的原文页 `research/_src/anthropic.html` 里提取 |
| Claude 标志（星芒 + 文字） | SVG 路径，viewBox 0 0 573 125；星芒 `#D97757`，文字随前景色 | claude.com 首页页头内嵌 SVG | 2026-11-03 curl 下载首页后提取 |
| 主色、辅色 | | | |
| 字体 | | | |
| 官方部件（界面、文档里的表格、提示框等） | | | |
| 真实界面或输出的截图（已脱敏） | | | |

## 策划者对视觉与声音的明确要求

<!-- 原话与日期；没有就写「无」。 -->

- 2026-11-03：「OAI部分使用OpenAI的视觉风格, Anthropic部分使用Anthropic的」
- 2026-11-03（看过预览 r1 后）：「OpenAI, Anthropic, ChatGPT, Claude要出现Logo, 美学再优化一下.」

标志的权利归各自所有者，只用来指明片中所讲的对象，不随本仓库的 GPL 授出（`docs/reference/third-party.md`「商标」）。路径数据在 `src/js/logos.js`。
