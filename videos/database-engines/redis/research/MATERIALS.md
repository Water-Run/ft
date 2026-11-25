# 讲解对象的材料

讲解对象自己的视觉与声音材料，供设计取用（经验规则 F16）。每一项写明取自哪里、怎样取得、取得的日期。这里只记**材料与约束**，不写怎么用——用法由制作方在 README 的「设计」里决定（`docs/roles.md` 第 3 节）。

对象：Redis（redis.io 官网、redis.io/docs 文档站、Redis 商标政策、redis-cli）。取得日期：2026-11-24，均用 `curl -sL` 取原始 HTML/CSS 后检索得出，未截图。redis.io 的 CSS 文件名带构建哈希，重新部署后会变，下面的 CSS 地址只对取得当日有效。

## 颜色

官方品牌指南没能读到（见「标志与商标规则」末行），下表的颜色名都是 redis.io CSS 里的**自定义属性名**，不是品牌手册里的正式色名。官网 CSS：`https://redis.io/_next/static/immutable/chunks/2x3h0-w-1flih.css`（下称「官网 CSS」）。文档站 CSS：`https://redis.io/docs/latest/css/index.min.53cbb78e7880859fd6d61a25eaed6c14185f91c9fb64f166e3eadff95bc826b4.css`（下称「文档 CSS」）。

| 材料 | 值 | 出处 | 取得日期 |
|---|---|---|---|
| 红（品牌红） | `#ff4438` | 官网 CSS `--redis-red`、`--hyper-05`；文档 CSS `.bg-redis-red-500` / `.text-redis-red-500`（`rgb(255 68 56)`） | 2026-11-24 |
| 红色阶 hyper | `--hyper-04 #fd736a`、`--hyper-05 #ff4438`、`--hyper-06 #eb352a`、`--hyper-07 #e4291e`、`--hyper-08 #d1281e`、`--hyper-09 #8a221c`、`--hyper-10 #351d22` | 官网 CSS | 2026-11-24 |
| 深底色 midnight | `#091a23` | 官网 CSS `--midnight`；文档 CSS `.bg-redis-ink-900`（`rgb(9 26 35)`） | 2026-11-24 |
| 深蓝灰 dusk | `#163341` | 官网 CSS `--dusk`；文档 CSS `.bg-redis-pen-800`（`rgb(22 51 65)`） | 2026-11-24 |
| dusk 色阶 | `--dusk-01 #f3f3f3`、`--dusk-09 #0d212c`、`--dusk-10 #d9d9d9`、`--dusk-30 #b9c2c6`、`--dusk-50 #8a99a0`、`--dusk-70 #5c707a`、`--dusk-90 #2d4754` | 官网 CSS | 2026-11-24 |
| 黄绿 yellow | `#dcff1e` | 官网 CSS `--yellow`；文档 CSS `.bg-redis-yellow-500`（`rgb(220 255 30)`） | 2026-11-24 |
| yellow 色阶 | `--yellow-06 #d0f41d`、`--yellow-07 #bfe112`、`--yellow-08 #a9ca03`、`--yellow-09 #8caa00`、`--yellow-10 #fbffe8`、`--yellow-11 #4e5f02`、`--yellow-50 #f1ffa5` | 官网 CSS | 2026-11-24 |
| 天蓝 sky-blue | `--sky-blue #80dbff`、`--sky-blue-09 #0477a5`、`--sky-blue-10 #f2fbff`、`--sky-blue-50 #bfedff` | 官网 CSS | 2026-11-24 |
| 紫 violet / purple | `--violet #c795e3`、`--violet-09 #592479`、`--violet-10 #f9f4fc`、`--violet-50 #e3caf1`、`--violet-90 #5925e8`、`--purple-05 #b76be2`、`--purple-07 #8f2ec4` | 官网 CSS | 2026-11-24 |
| 中性色 | `--base-white #fff`、`--base-black #000`、`--grey-10 #fcfcfc`、`--grey-20 #e9e9e9`、`--grey-50 #f9fafb`、`--light-gray #f8f8f8`、`--black-10 #e5e5e5`、`--black-30 #b2b2b2`、`--black-60 #6d6e71`、`--black-70 #4c4c4c`、`--black-90 #191919` | 官网 CSS | 2026-11-24 |
| 浅色主题语义色 | 背景 `--bg-default #fff`，正文 `--fg-body #091a23`，品牌色 `--fg-brand #ff4438`，链接 `--fg-link #e4291e`（悬停 `#8a221c`），边框 `--border-default #d9d9d9`，次背景 `--bg-subtle #f3f3f3`、`--bg-muted #f8f8f8`，弱文字 `--fg-muted #5c707a`，焦点环 `#ff4438` | 官网 CSS，选择器 `[data-ds][data-theme=light],[data-ds][data-theme=white],…` | 2026-11-24 |
| 深色主题语义色 | 背景 `--bg-default #091a23`，标题文字 `--fg-default #fff`，正文 `--fg-body #d9d9d9`，品牌色 `--fg-brand #dcff1e`，链接 `--fg-link #ff4438`（悬停 `#fd736a`），边框 `--border-default #163341`，次背景 `--bg-subtle #163341`、`--bg-muted #0d212c`，弱文字 `--fg-muted #b9c2c6`，激活边框 `#dcff1e` | 官网 CSS，选择器 `[data-ds][data-theme=dark],[data-ds][data-theme=midnight],…` | 2026-11-24 |
| dusk 主题 | `--bg-default: var(--dusk)`，`--fg-body: var(--base-white)`，`--fg-brand` 与 `--fg-tagline: var(--yellow)`，`--bg-muted: var(--midnight)` | 官网 CSS `[data-theme=dusk]` | 2026-11-24 |
| 文字选中色 | 背景 `var(--yellow)`，文字 `var(--midnight)` | 官网 CSS `body ::selection` | 2026-11-24 |
| 标志 SVG 填色 | `#FF4438` | `https://redis.io/` 页头 `<a aria-label="Redis" href="/">` 内联 `<svg viewBox="0 0 85 27">`，一条 `<path fill="#FF4438">` | 2026-11-24 |
| 标志单色变量 | `--logo-mono`：`#8a99a0` / `#fff`（两套主题各一值） | 官网 CSS | 2026-11-24 |
| 文档站其他品牌色类 | `redis-pen-300 #b9c2c6`、`redis-pen-400 #8a99a0`、`redis-pen-600 #5c707a`、`redis-pen-700 #2d4754`、`redis-pencil-200 #e5e5e5`、`redis-pencil-600 #4c4c4c`、`redis-red-600 #d52d1f`、`redis-red-700 #e4291e`、`redis-indigo-500 #5961ff`、`redis-neutral-800 #4e545b` | 文档 CSS `.bg-/.text-/.border-redis-*`（原值为 `rgb()`，此处换算为十六进制） | 2026-11-24 |
| 文档站另一组根变量 | `--primary-color #161f31`、`--secondary-color #5961ff`、`--secondary-color-shade #454cd5`、`--neutral-text-color #4e545b`、`--success-color #0fa869`、`--warning-color #ffb553`、`--error-color #ff5d15` | `https://redis.io/docs/latest/scss/style.min.ffd35a3be9b20fcc50a3caf3964670dfd229adc7a66c976768747546ae98a824.css` 的 `:root` | 2026-11-24 |

## 字体

| 材料 | 值 | 出处 | 取得日期 |
|---|---|---|---|
| 官网字体变量 | `--primary-font: "primaryFont"`（即 `--type-font-family-primary: "TT Trailers"`）；`--secondary-font: "Space Grotesk"`；`--tertiary-font: "Space Mono"` | 官网 CSS | 2026-11-24 |
| 官网大标题 | TT Trailers。`@font-face{font-family:primaryFont;src:url(../media/TTTrailers_Bd-s.p.0mp147ukrtwgu.woff2);font-weight:500}`；`h1,h2,h3,h4,h5,h6{font-family:var(--primary-font)}`。首页 `<h1>` 用 `SjEKjW_variant_heading SjEKjW_size_2xl … textTransform_uppercase`：大写、`font-size:100px`（窄屏 80px）、`line-height:85%`、`letter-spacing:-1px`、`font-weight:400` | 官网 CSS；`https://redis.io/` 的 `<h1>` | 2026-11-24 |
| 官网正文与次级标题 | Space Grotesk，400/500/700。`body{font-family:var(--secondary-font),sans-serif}`；`SjEKjW_variant_heading.SjEKjW_size_lg` 与正文、按钮、表单、表格均用 Space Grotesk | 官网 CSS | 2026-11-24 |
| 官网小标签（眉题） | Space Mono，400/700。例：`…_eventEyebrow{font-family:var(--tertiary-font);letter-spacing:1.5px;text-transform:uppercase;font-size:14px;color:#d9d9d9}` | `https://redis.io/_next/static/immutable/chunks/43u44ysv69-cy.css` 等 | 2026-11-24 |
| 文档站加载的字体 | `/docs/latest/fonts/` 下：SpaceMono-Regular.ttf、SpaceMono-Bold.ttf、SpaceGrotesk-VariableFont_wght.ttf、TT_Trailers_Bold.woff2、Geist-Regular.woff2、GeistMono-Regular.woff2（页内 `<style>` 的 `@font-face`） | `https://redis.io/docs/latest/develop/tools/cli/` 页内 `<link rel="preload">` 与 `<style>` | 2026-11-24 |
| 文档站各处字体 | 页面根 `html` 用 Space Grotesk；正文区 `.prose{font-family:Geist,…}`（含 h1，`.prose h1{font-size:2.25rem;font-weight:400}`）；顶栏与面包屑 `font-mono` 即 Space Mono；行内 `code` 与 redis-cli 示例框用 Space Mono；代码块 `.prose pre>code{font-family:Geist Mono,…}`；另有 `.font-trailers{font-family:TT Trailers,…}` 工具类 | 文档 CSS | 2026-11-24 |
| Space Grotesk 许可 | SIL Open Font License 1.1。「Copyright 2020 The Space Grotesk Project Authors (https://github.com/floriankarsten/space-grotesk)」 | `https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/OFL.txt` | 2026-11-24 |
| Space Mono 许可 | SIL Open Font License 1.1。「Copyright 2016 The Space Mono Project Authors (https://github.com/googlefonts/spacemono)」 | `https://raw.githubusercontent.com/google/fonts/main/ofl/spacemono/OFL.txt` | 2026-11-24 |
| Geist / Geist Mono 许可 | SIL Open Font License 1.1。「Copyright 2024 The Geist Project Authors (https://github.com/vercel/geist-font.git)」 | `https://raw.githubusercontent.com/google/fonts/main/ofl/geist/OFL.txt`、`…/ofl/geistmono/OFL.txt` | 2026-11-24 |
| TT Trailers 许可 | 商业字体，TypeType 出售，按字重与许可类型（Desktop 等）购买，单款「from $ 42.99」，另有试用版。不是开源字体 | `https://typetype.org/fonts/tt-trailers/` | 2026-11-24 |

## 标志与商标规则

| 材料 | 值 | 出处 | 取得日期 |
|---|---|---|---|
| 商标政策 | 《Redis Trademark Policy》，页面标注「Last Updated: September 15, 2026」。`https://redis.io/legal/trademark-guidelines/` 重定向到此 | `https://redis.io/legal/trademark-policy/` | 2026-11-24 |
| 权利人 | 「Redis Ltd. and its affiliates (collectively, “Redis”) own the Trademarks.」商标指 Redis 名称（Mark）与标志（Logos） | 同上 | 2026-11-24 |
| 注册符号 | 「You should always add the registration symbol (®) to “Redis” in usage along with the attribution language noted below to the bottom of the page: Redis®.」 | 同上 | 2026-11-24 |
| 署名声明 | 「You should include this attribution statement on each page where the Trademark appears: “Redis is a registered trademark of Redis Ltd. Any rights therein are reserved to Redis Ltd.”」 | 同上 | 2026-11-24 |
| 用法 | 「Always use a Trademark as an adjective (e.g., the Redis database), not as a noun or verb, and never in the possessive form.」 | 同上 | 2026-11-24 |
| 视觉识别 | 「Don’t imitate our visual identity—meaning, the distinctive look and feel of our Trademarks, websites and/or documentation」 | 同上，「Please don’t do this」一节 | 2026-11-24 |
| 暗示关联 | 「Don’t use our Trademarks in a way that inaccurately implies affiliation, sponsorship, compatibility, or endorsement by Redis」 | 同上 | 2026-11-24 |
| 名称 | 「Don’t put our Mark (or part of our name, e.g., “Red”) in your company name, commercial product name, domain name, or social media handle」 | 同上 | 2026-11-24 |
| 周边商品 | 「Don’t use our branding or Trademarks on merchandise.」 | 同上 | 2026-11-24 |
| 引用内容 | 「You may use the Trademarks to link to Redis pages and documentation (including referencing https://redis.io/docs/latest/). However, you may not copy or include parts of the Redis pages, documentation, or content within your sites or resources for any purpose unless it is non-commercial.」 | 同上，「Using our content」 | 2026-11-24 |
| 截图与录屏 | 「You may use unaltered screenshots or video captures of our products, services and Trademarks for academic purposes in teaching materials and school projects.」 | 同上，「Academic purposes」 | 2026-11-24 |
| 信息性提及 | 「You may refer to Redis or our products in an informational context in articles, websites, etc., in accordance with this Policy.」 | 同上，「Talking about Redis」 | 2026-11-24 |
| 联系 | 「please contact legal@redis.com」 | 同上，「Questions」 | 2026-11-24 |
| 标志的留白、配色版本、禁止改动等细则 | 商标政策页没有这些条目。`https://redis.io/brand-guidelines/` 301 重定向到 `https://brand.redis.io/`；该域名的 TLS 证书只覆盖 `*.frontify.com`、`frontify.com`，证书校验失败；跳过校验后返回 HTTP 404。没能读到品牌指南 | 见左 | 2026-11-24 |

## 官方部件与界面

| 材料 | 值 | 出处 | 取得日期 |
|---|---|---|---|
| 官网页头标志 | 内联 SVG，`viewBox="0 0 85 27"`，单条 path，`fill="#FF4438"`，外层链接 `aria-label="Redis"` | `https://redis.io/` | 2026-11-24 |
| 官网分区主题 | 各分区以 `data-theme` 切换深浅底色；首页计 `data-theme="dusk"` 14 处、`data-theme="midnight"` 13 处 | `https://redis.io/` | 2026-11-24 |
| 官网网格纹样 | 首页首屏分区 `HeaderHeroPromptSection`（`data-theme="midnight"`）背后有 `<svg>` 图案 `pattern id="grid_svg__a"`，单元 1348×1361.92，线段水平步长 55.564、垂直步长 32.08（约 30° 斜线，等角网格）；颜色 `var(--dusk-90)`（`#2d4754`）；用以光标位置为中心的径向渐变遮罩（中心不透明度 `#00000040`，到 76.36% 处透明），某一断点下 `display:none` | `https://redis.io/` 内联 SVG；`https://redis.io/_next/static/immutable/chunks/43u44ysv69-cy.css` 的 `.DWGf2W_grid` | 2026-11-24 |
| 官网表单与搜索框 | `border-radius:5px`；搜索框 `border:1px solid var(--midnight)`，`padding:22px`，`font-size:18px` | 官网 CSS 各组件类 | 2026-11-24 |
| 文档站页面骨架 | `<body class="antialiased tracking-[-0.01em] bg-white …">`；顶栏 `sticky top-0 h-[70px] … border-b border-white border-opacity-30 bg-redis-ink-900 text-white font-mono text-[15px]`；左侧栏 `nav#sidebar … md:w-96 … bg-white`；正文 `<section class="prose w-full py-12 max-w-none">`；右侧 `nav#TableOfContents`；页脚 `bg-redis-ink-900 … text-gray-300 border-t border-t-white border-opacity-30 text-[13px] font-sans` | `https://redis.io/docs/latest/develop/tools/cli/` | 2026-11-24 |
| 文档站页面底色 | `#fff`（`bg-white`） | 同上 `<body>` | 2026-11-24 |
| 文档站正文文字 | `#091a23`（`.prose{color:#091a23}`），`.prose p{font-size:1rem;line-height:1.5rem}` | 文档 CSS | 2026-11-24 |
| 文档站链接 | `#111827`（`--tw-prose-links`）加下划线，悬停 `rgb(255 68 56)` 即 `#ff4438`；面包屑链接 `hover:text-redis-red-500` | 文档 CSS `.prose :where(a)` 与 `:hover` | 2026-11-24 |
| 文档站行内代码 | 文字 `#111827`，`font-weight:500`，Space Mono；Tailwind 默认的前后反引号被 `content:""` 去掉；无底色规则 | 文档 CSS `.prose :where(code)`、`code,kbd,samp,pre{font-family:Space Mono,…}` | 2026-11-24 |
| 文档站普通代码块 | 底色 `rgb(15 23 42)` 即 `#0f172a`，圆角 `.5rem`，内边距 `1.25rem`，文字 `#e5e7eb`（`--tw-prose-pre-code`），字体 Geist Mono，字号 `.875em` | 文档 CSS `.prose pre`、`.prose :where(pre)`、`.prose pre>code` | 2026-11-24 |
| 文档站高亮代码块（chroma） | 底色 `#0f172a`，文字 `rgb(248 250 252)` 即 `#f8fafc`，圆角 `.375rem`；关键字与运算符 `#f87171`（运算符加粗），字符串与数字 `#60a5fa`，函数名 `#d8b4fe` 加粗，注释 `#64748b` 斜体，行号 `#94a3b8`，高亮行底色 `rgb(49 46 129 / .8)` | 文档 CSS `.chroma …` | 2026-11-24 |
| 文档站多语言代码标签（codetabs） | 外框 `rounded-lg bg-slate-900`，标签头 `bg-slate-900 rounded-t-lg`、`border-bottom:1px solid #475569`；右上角复制按钮，提示「Copied!」；底栏 `cli-footer … bg-slate-900` 列出用到的命令（如「Commands: SET, GET」）；语言选项含 redis-cli、Python、Node.js、Go、Java、C#、PHP、Ruby、Rust 等 | `https://redis.io/docs/latest/commands/set/`；文档 CSS `.codetabs …` | 2026-11-24 |
| 文档站 redis-cli 示例框 | `.redis-cli` 底色 `#0f172a`，文字 `rgb(250 250 250)` 即 `#fafafa`，Space Mono，下方两角圆角 `.75rem`；示例提示符写作 `> `（不带地址），如 `> SET mykey "Hello"` / `OK` / `> GET mykey` / `"Hello"` | 同上 | 2026-11-24 |
| 文档站命令语法框 | `<pre class="command-syntax">`，如「SET key value [NX \| XX \| IFEQ ifeq-value \| …] [GET] [EX seconds \| …]」，以标签页切换 | `https://redis.io/docs/latest/commands/set/` | 2026-11-24 |
| 文档站表格 | 表头 `bg-slate-50 … text-redis-ink-900 shadow-[inset_0_-2px_0_0_#B9C2C6]`；行 `border-t border-slate-100 hover:bg-slate-50` | `https://redis.io/docs/latest/develop/tools/cli/` | 2026-11-24 |
| 真实界面截图 | 未截取 | — | — |

## 终端

| 材料 | 值 | 出处 | 取得日期 |
|---|---|---|---|
| 默认提示符 | 「The string `127.0.0.1:6379>` is the prompt. It displays the connected Redis server instance's hostname and port.」 | `https://redis.io/docs/latest/develop/tools/cli/`，「Interactive mode」一节 | 2026-11-24 |
| 进入交互模式 | 文档示例：`$ redis-cli` / `127.0.0.1:6379> PING` / `PONG` | 同上 | 2026-11-24 |
| 非 0 号库 | 「The prompt updates as the connected server changes or when operating on a database different from the database number zero」；示例 `127.0.0.1:6379> SELECT 2` / `OK` / `127.0.0.1:6379[2]> DBSIZE` / `(integer) 1` | 同上 | 2026-11-24 |
| 切换实例 | 示例 `127.0.0.1:6379> CONNECT metal 6379` / `metal:6379> PING` / `PONG` | 同上 | 2026-11-24 |
| 断开状态 | 示例 `Could not connect to Redis at 127.0.0.1:9999: Connection refused` / `not connected> PING` | 同上 | 2026-11-24 |
| 回复格式 | 「redis-cli only shows additional information for human readability when it detects the standard output is a tty, or terminal. For all other outputs it will auto-enable the raw output mode」；文档中整数回复写作 `(integer) 7`，`--raw` 时省略 `(integer)` | 同上 | 2026-11-24 |
| 提示符的拼法（源码） | `cliRefreshPrompt()`：地址（或 `redis <socket>`）＋ 库号非 0 时 `[%i]` ＋ 事务中 `(TX)` ＋ 订阅模式 `(subscribed mode)` ＋ 结尾 `"> "` | `https://github.com/redis/redis/blob/f7c38e3973d4018ba290a4793b08c11cb2f7372f/src/redis-cli.c` 第 321 行起（取得时 `unstable` 分支 HEAD） | 2026-11-24 |

## 策划者对视觉与声音的明确要求

<!-- 原话与日期；没有就写「无」。 -->
