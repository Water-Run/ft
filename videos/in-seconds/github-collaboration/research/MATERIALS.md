# 材料表：150 秒速通 GitHub 协作

讲解对象自己的视觉与声音材料，各附出处与取得日期。只记材料，不写用法（用法归制作方，F16）。
策划者 2026-11-15 指定本片视觉走「非常 GitHub 的设计风格」；下列材料即该风格的官方依据。

取证日期：2026-11-15（UTC+8）。色值均为 light（浅色）主题——GitHub 网页的默认主题。

## 1. Primer 功能色（GitHub 产品 UI 的官方设计令牌）

来源：npm 包 `@primer/primitives@11.10.0` 编译产物 `dist/css/functional/themes/light.css`（unpkg 读取）；
源文件在 <https://github.com/primer/primitives>，提交 `47736486bf67b2a14ba1ada61fa0f57af29bb875`（main，2026-11-15 查询）。
回显：`lab/out_02_primer_tokens.txt` §1。许可：MIT（primer/primitives 仓库）。

| 令牌 | 色值 | 官方语义 |
|---|---|---|
| `--fgColor-default` | `#1f2328` | 正文与标题 |
| `--fgColor-muted` | `#59636e` | 次要文字（时间戳、元信息） |
| `--fgColor-accent` | `#0969da` | 链接与交互元素 |
| `--fgColor-success` / `--fgColor-open` | `#1a7f37` | 成功；Issue/PR 的 open 状态 |
| `--fgColor-attention` | `#9a6700` | 警告 |
| `--fgColor-danger` / `--fgColor-closed` | `#d1242f` | 错误；Issue/PR 的 closed 状态 |
| `--fgColor-done` | `#8250df` | 完成/已合并（merged）状态 |
| `--bgColor-default` | `#ffffff` | 页面主背景 |
| `--bgColor-muted` | `#f6f8fa` | 次级背景（代码块、表头、侧栏） |
| `--bgColor-accent-muted` | `#ddf4ff` | 信息/选中浅底 |
| `--bgColor-success-muted` | `#dafbe1` | 成功浅底 |
| `--bgColor-attention-muted` | `#fff8c5` | 警告浅底 |
| `--bgColor-danger-muted` | `#ffebe9` | 错误浅底 |
| `--bgColor-done-muted` | `#fbefff` | 完成浅底 |
| `--borderColor-default` | `#d1d9e0` | 默认边框 |
| `--borderColor-muted` | `#d1d9e0b3` | 次级边框（带透明度） |
| `--borderColor-accent-emphasis` | `#0969da` | 选中/聚焦强边框 |
| `--borderColor-success-emphasis` | `#1a7f37` | 成功强边框（主按钮） |
| `--borderColor-done-emphasis` | `#8250df` | 完成徽章强边框 |

## 2. diff 视图专用色（组件令牌 diffBlob）

来源：同上提交的 `src/tokens/component/diffBlob.json5` 与 `src/tokens/base/color/light/light.json5`。
回显：`lab/out_02_primer_tokens.txt` §3–4。

| 部位 | 引用 | light 色值 |
|---|---|---|
| 新增行背景 | `bgColor.success.muted` | `#dafbe1` |
| 新增词/行号背景 | `base.color.green.1` | `#aceebb` |
| 删除行背景 | `bgColor.danger.muted` | `#ffebe9` |
| 删除词背景 | `base.color.red.1` | `#ffcecb` |
| 行内文字 | `fgColor.default` | `#1f2328` |

## 3. 字体

来源：同上提交的 `src/tokens/functional/typography/font-stack.json5`。回显：`lab/out_02_primer_tokens.txt` §2。

| 用途 | 官方字体栈（原文） |
|---|---|
| UI 正文（system/sansSerif） | `'Mona Sans VF', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans Backtick Fix', 'Noto Sans', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'` |
| 代码（monospace） | `ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace` |

- **Mona Sans**：GitHub 自家字体，<https://github.com/github/mona-sans>，许可 OFL-1.1（GitHub API 核对，2026-11-15）。
- **Hubot Sans**：GitHub 展示用字体，<https://github.com/github/hubot-sans>，许可 OFL-1.1（同上）。
- 仓库 `kit/assets.json` 现有 Noto Sans SC、Inter、JetBrains Mono 等（均 OFL，见 `docs/reference/third-party.md`）；中文画面用字与是否引入 Mona Sans 由制作方决定。

## 4. 标志与商标

来源：GitHub 官方品牌页 <https://brand.github.com/foundations/logo>（github.com/logos 301 至此；读取 2026-11-15）。

- 官方标志打包下载：<https://brand.github.com/GitHub_Logos.zip>。
- 图形标志称 **Invertocat**（吉祥物 Octocat 的图形）；文字标志与图形组合称 lockup。“GitHub is always one word with a capitalized G and H.”
- 颜色限制：“The Invertocat and our wordmark should only appear in white, black, or in few cases grey or green.”
- 允许的用途包括：“Use the GitHub logo in a blog post or news article about GitHub.”、“Use a permitted GitHub logo to inform others that your project integrates with GitHub.”
- 禁止：“Do not use the GitHub name or any GitHub logo in a way that suggests you are GitHub, your offering or project is by GitHub, or that GitHub is endorsing you or your offering or project.”；不得改色、变形、加阴影渐变、与别的元素组合。
- 商标原文：“GITHUB®, the GITHUB® logo design, the INVERTOCAT logo design, OCTOCAT®, and the OCTOCAT® logo design are trademarks of GitHub, Inc., registered in the United States and other countries.”
- 本仓库的处理边界见 `docs/reference/third-party.md`「商标」：讲解对象的标志与界面可作讲解材料出现（F16），指明所讲对象、不暗示认可；权利不随 GPL 授出。本片如用官方标志，原样使用、不改形改色；是否使用及最终发布判断归策划者。

## 5. 界面结构（画面临摹的依据）

以下结构来自官方文档描述（读取 2026-11-15），供制作方画「GitHub 风格」界面时对照；真实界面截图可由制作方在公开仓库页面自行截取（注意脱敏，F07）：

- 仓库页：仓库名下方标注 fork 来源（“the upstream repository is indicated below the name of the fork”，《Forks》）。
- PR 页签：Conversation、Commits、Checks、Files changed（《Pull requests》§Working with pull requests：“The Checks tab shows automated tests, builds, and other validations.”）。
- 合并状态区：PR 头部与 merge box 显示阻塞项、缺少的批准（同上）。
- 状态徽章语义色：open=绿、closed=红、merged=紫（第 1 节 `fgColor-open/closed/done`）。
- 参考页面（公开、可截图）：nodejs/node 的 PR 列表与任一 PR 页，如 <https://github.com/nodejs/node/pull/67474>；fork 编号对照可用 <https://github.com/LiviaMedeiros/node/pulls>。

## 6. 声音材料

GitHub 品牌无官方音效/音乐素材可取；本片配乐按系列约定为本集原创（制作方负责），不采样 GitHub 产品音效。
## 7. Octicons 图标（2026-11-16 制作方补）

来源：npm 包 `@primer/octicons@19.42.0` 的 `build/svg/*-16.svg`（unpkg 读取，2026-11-16）；源仓库 <https://github.com/primer/octicons>。
许可：MIT License, Copyright (c) 2026 GitHub Inc.（包内 LICENSE 原文）。

取用的 23 个（16px）：`repo`、`repo-forked`、`git-branch`、`git-pull-request`、`git-pull-request-draft`、`git-merge`、`git-commit`、`issue-opened`、`issue-closed`、`check`、`check-circle-fill`、`x-circle-fill`、`comment`、`lock`、`person`、`eye`、`star`、`book`、`code`、`file`、`play`、`dot-fill`、`arrow-right`。
只抽出 `path` 的 `d` 属性放进 `src/design/octicons.js`，不改形；原文件存 `research/_src/octicons/`（不入库，可按上述版本重取）。

## 8. Primer 深色主题（2026-11-16 制作方补）

来源：`@primer/primitives@11.10.0` 的 `dist/css/functional/themes/dark.css`（unpkg 读取，2026-11-16）；许可同第 1 节。

| 令牌 | 色值 |
|---|---|
| `--fgColor-default` | `#f0f6fc` |
| `--fgColor-muted` | `#9198a1` |
| `--fgColor-accent` | `#4493f8` |
| `--fgColor-success` | `#3fb950` |
| `--fgColor-done` | `#ab7df8` |
| `--fgColor-danger` | `#f85149` |
| `--fgColor-attention` | `#d29922` |
| `--bgColor-default` | `#0d1117` |
| `--bgColor-muted` | `#151b23` |
| `--bgColor-inset` | `#010409` |
| `--bgColor-success-emphasis` | `#238636` |
| `--bgColor-done-emphasis` | `#8957e5` |
| `--bgColor-neutral-emphasis` | `#656c76` |
| `--borderColor-default` | `#3d444d` |

浅色主题另补：`--bgColor-success-emphasis` `#1f883d`、`--bgColor-done-emphasis` `#8250df`、`--bgColor-neutral-emphasis` `#59636e`、`--bgColor-emphasis` `#25292e`、`--underlineNav-borderColor-active` `#fd8c73`（同一版本的 light.css）。

浅色主题的 diff 文字色：`--prettylights-syntax-markup-deleted-text` `#82071e`、`--prettylights-syntax-markup-inserted-text` `#116329`（同一份 light.css，2026-11-16 读取；封面上的 diff 字色用它们）。
