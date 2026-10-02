# assets

本目录存放不入库的二进制依赖，内容因机器而异；除本文件外，目录里的一切都被 Git 忽略。

| 路径 | 内容 | 获取方式 |
|---|---|---|
| `fonts/` | 画面用到的字体（Noto Sans SC、Noto Serif SC、Inter、JetBrains Mono、VT323，均为 SIL OFL 1.1 许可） | `node kit/tools/assets.js --fetch`，按 `kit/assets.json` 的清单下载并校验 SHA-256 |
| `whisper/fw-small/` | 语音识别模型（faster-whisper small），回听旁白时使用，可选 | `node kit/tools/assets.js --fetch --whisper`；不放置时由 faster-whisper 在首次使用时自行下载 |
| `ffmpeg/bin/` | ffmpeg 与 ffprobe，可选 | 系统 `PATH` 里已有 ffmpeg 时不需要；否则把可执行文件放在这里，或在 `kit/config.local.json` 里指明位置 |

各项的版本要求与安装办法见 [docs/environment.md](../docs/environment.md)，许可信息见 [docs/third-party.md](../docs/third-party.md)。
