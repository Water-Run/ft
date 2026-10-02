# 第三方组件与许可

本仓库自身的内容（工具、引擎、模板、各视频的源码与文档）以 GPL-3.0-or-later 发布，全文见仓库根目录的 `LICENSE`。下列第三方组件不随仓库分发，由使用者自行取得，各自适用自己的许可。

## 运行时依赖

| 组件 | 版本 | 取得方式 | 许可 | 用途 |
|---|---|---|---|---|
| GSAP | 3.13.0 | `npm ci` | GreenSock Standard License（免费使用，不是开源许可）：<https://gsap.com/standard-license> | 页面里的补间与时间线 |
| puppeteer-core | 25.12.0 | `npm ci` | Apache-2.0 | 驱动无头浏览器 |
| Chrome / Chromium | 近期版本 | 自行安装 | Chrome 为专有软件；Chromium 为 BSD 等 | 出帧 |
| FFmpeg | 带 libx264 的构建 | 自行安装 | 视构建而定；启用 GPL 组件的构建为 GPL | 编码、封装、检测 |
| edge-tts | 7.x | `pip install` | LGPL-3.0 | 调用在线语音服务合成旁白 |
| NumPy | 1.26 或 2.x | `pip install` | BSD-3-Clause 等 | 混音与数值检查 |
| faster-whisper、CTranslate2 | 1.2、4.x | `pip install` | MIT | 回听旁白 |
| Pillow | 10 或更新 | `pip install` | MIT-CMU | 越界自检 |
| Whisper small 模型（faster-whisper 格式） | — | `assets.js --fetch --whisper` 或首次使用时自动下载 | MIT | 回听旁白 |

GSAP 由页面在运行时加载，文件来自 `node_modules`，仓库里不含它的副本。它的许可允许免费使用，但不是开源许可；再分发本仓库的衍生作品时，这一点由分发者自行处理。

## 字体

清单与校验和在 `kit/assets.json`，由 `node kit/tools/assets.js --fetch` 从 Google Fonts 仓库的固定提交下载。五种字体都以 SIL Open Font License 1.1 发布：

| 字体 | 来源 |
|---|---|
| Noto Sans SC、Noto Serif SC | Google Fonts `ofl/notosanssc`、`ofl/notoserifsc` |
| Inter | Google Fonts `ofl/inter` |
| JetBrains Mono | Google Fonts `ofl/jetbrainsmono` |
| VT323 | Google Fonts `ofl/vt323` |

成片里嵌入的是字体渲染出的画面，不是字体文件。

## 在线语音服务

旁白由 edge-tts 调用微软的在线语音合成服务生成，音色（`zh-CN-YunyangNeural`、`en-US-AndrewNeural` 等）属于该服务。服务的可用性、输出与使用条款由服务方决定；发布含有这些语音的成片之前，应自行确认其使用条款是否允许相应的用途。

## 取证时引用的材料

下列材料只在各片的 `research/FACTS.md` 里记版本与获取方式，不入库：

| 材料 | 许可 | 用在哪一部 |
|---|---|---|
| MySQL 5.5.62 源码（`mysql/mysql-server` 的 `mysql-5.5.62` 标签） | GPL-2.0 | MyISAM |
| MS-DOS 1.25 / 2.0 源码（`microsoft/MS-DOS`） | MIT | 批处理 |
| luainstaller 1.4.0 源码 | LGPL-3.0-or-later | luainstaller |
| srlua、luastatic | 各自的许可 | luainstaller |

入库的取证材料里有两份来自 StatCounter Global Stats 的统计数据（`videos/standalone/windows-batch/research/statcounter/`），该数据以 CC BY-SA 3.0 发布，出处见该片的 `FACTS.md`。

## 商标

片中提到的产品名称是各自所有者的商标。各片不使用这些产品的徽标；配色参照某个产品的，在该片的 README 里注明。
