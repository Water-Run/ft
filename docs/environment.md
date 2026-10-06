# 环境搭建

本文说明在一台新机器上要装什么、怎样确认可用、两台机器怎样分工，以及生成物占多少空间、怎样清理。

## 1. 需要什么

| 项 | 要求 | 用途 | 实测可用的版本 |
|---|---|---|---|
| Node.js | 22.12 或更新 | 运行全部工具 | 22.21、24.21 |
| Chrome 或 Chromium | 近期版本 | 无头出帧 | 152、154 |
| ffmpeg 与 ffprobe | 带 libx264 编码器 | 编码、封装、响度与静止检测 | 2026 年 9 月的主线构建 |
| Python 3 | 3.10 或更新 | 配音、混音、回听 | 3.12、3.14 |
| Python 包 `edge-tts`、`numpy` | 必需 | 配音、混音 | edge-tts 7.2、numpy 1.26 与 2.4 |
| Python 包 `faster-whisper` | 可选 | 回听旁白（`asr.js`、`tts_probe.js`） | 1.2 |
| Python 包 `pillow` | 可选 | 越界自检（`margin.js`） | 10、12 |
| 字体 | 清单见 `kit/assets.json` | 画面 | 由 `assets.js` 下载并校验 |
| 语音识别模型 | 可选 | 回听旁白 | faster-whisper small |

Windows、Linux、macOS 都可以。配音需要联网（edge-tts 调用在线语音服务）；其余步骤离线可做。

只写场景、看帧、跑扫描，需要的是 Node、Chrome 与字体；配音、混音、渲染、封装才需要 Python 与 ffmpeg。

## 2. 步骤

```bash
git clone <仓库地址> && cd ft
npm ci                                  # puppeteer-core 与 gsap，版本由 package-lock.json 锁定
node kit/tools/assets.js --fetch        # 字体，约 44 MB，逐个校验 SHA-256
pip install edge-tts numpy              # 必需
pip install faster-whisper pillow       # 可选
node kit/tools/doctor.js                # 逐项检查，指出缺什么
```

- ffmpeg：放进系统 `PATH`，或把可执行文件放在 `assets/ffmpeg/bin/` 下，或在本机配置里写明位置。
- 语音识别模型：不放置时 `asr.js` 首次运行由 faster-whisper 自行下载；也可 `node kit/tools/assets.js --fetch --whisper` 取到 `assets/whisper/fw-small/`（约 480 MB）。模型站点连不上时，在本机配置里把 `hf_endpoint` 换成可用的镜像。
- 工具按常见位置找 Chrome、ffmpeg、Python；位置特殊时写 `kit/config.local.json`（不入库，样例见 `kit/config.local.example.json`）或设环境变量，见 [tools.md](tools.md) 第 6 节。

`doctor.js` 输出「环境可用」即可开工。带 `!` 的项不影响出片，但会缺少对应的检查。

### Windows 上的注意事项

- 控制台输出是 UTF-8。cmd 里出现乱码时先执行 `chcp 65001`；PowerShell 里先执行 `[Console]::OutputEncoding = [Text.Encoding]::UTF8`。乱码只影响显示，不影响结果。
- 仓库路径里有非 ASCII 字符时，工具已作处理（语音识别模型按相对路径加载）。自己写命令时用相对路径。
- 写 PowerShell 脚本时，自定义函数不要叫 `mv`、`del`、`cp`、`rm` 这类名字：它们是内置别名，调用时执行的是内置命令而不是自己的函数。

## 3. 两台机器分工

常见的分法：在一台机器上写代码、看帧、跑扫描；在另一台性能更好的机器（渲染机）上配音、混音、渲染。两边各有一份仓库，各自 `npm ci`、各自放 `assets/`。

在写代码的那台机器的 `kit/config.local.json` 里写：

```json
{ "remote": { "ssh": "<ssh 主机别名>", "path": "<渲染机上仓库的路径>" } }
```

之后：

```bash
node kit/tools/remote.js push                     # 同步工作树
node kit/tools/remote.js run tts <视频>           # 在渲染机上合成旁白，并取回 timing.<语言>.js
node kit/tools/remote.js run audio <视频>
node kit/tools/remote.js run render <视频>
node kit/tools/remote.js run finish <视频>
node kit/tools/remote.js pull <视频>/shots        # 取回生成物
```

要点：

- 要求能免口令 `ssh` 到渲染机，且那边的 `PATH` 里有 `node` 与 `tar`。
- 同步的是工作树（已跟踪与未被忽略的文件），不是提交；没提交的改动也会过去，本机删掉的文件在对面也删。
- 生成物不同步：`audio/`、`out/`、`build/`、`shots/` 各留在产生它们的机器上。渲染机上的画面与本机预览不完全一致（canvas、大倍率缩放、连续运动），成片以渲染机为准；需要核对时在渲染机上出帧再取回。
- 配音缓存只在渲染机上。本机没有音频也能看帧与扫描，因为时间线只依赖入库的 `timing.<语言>.js`。
- 渲染机是共用的机器时，开工前看一眼它的内存与磁盘。每个编码进程限 4 线程，约占 0.7 GB；九路并行约 6–7 GB。

**提交历史的同步**与工作树的同步是两回事：提交在一边做，用 `git push` 或 `git pull` 带到另一边。仓库正常情况下只有 `main` 一个分支，两边都直接在 `main` 上提交（见 [workflow.md](workflow.md) 的「并行开工与分支」）。渲染机上的仓库不是裸仓库时，可以让它接受推送并保持工作树不动（工作树已经由 `remote.js push` 同步过，内容与新提交一致）：

```bash
# 在渲染机的仓库里，一次性设置
git config receive.denyCurrentBranch updateInstead
printf '#!/bin/sh\ngit read-tree "$1"\n' > .git/hooks/push-to-checkout
```

这个钩子在收到推送时只把索引换成新提交，不改工作树。

## 4. 空间占用与清理

仓库本身很小（源码与取证材料约 7 MB）。占空间的是不入库的东西：

| 位置 | 内容 | 大小 | 能否删 |
|---|---|---|---|
| `node_modules/` | 依赖 | 约 35 MB | 能，`npm ci` 重装 |
| `assets/fonts/` | 字体 | 约 44 MB | 能，`assets.js --fetch` 重新下载 |
| `assets/whisper/` | 语音识别模型 | 约 480 MB | 能 |
| `assets/ffmpeg/` | ffmpeg | 视构建而定，约 500 MB | 能 |
| `<视频>/audio/` | 旁白音频缓存 | 每种语言几 MB | 能，但重新合成需要联网，结果可能与原来略有不同 |
| `<视频>/out/<语言>/video.mp4` | 无声画面 | 8 分钟约 150 MB | 能，重新渲染需要几分钟到几十分钟 |
| `<视频>/out/<语言>/*.wav` | 各条混音与分轨 | 8 分钟每条约 90 MB，一次混音五条 | 能，`audio.js` 一两分钟重建，结果逐样本相同 |
| `<视频>/out/*.mp4` | 成片 | 8 分钟每个约 150 MB，每种语言三个 | 交付物，另行保存后才能删 |
| `<视频>/shots/`、`<视频>/build/` | 截图与中间数据 | 几 MB | 能 |

一部 8 分钟的双语片子，渲染与封装期间约占 2–3 GB；交付后删掉混音的 WAV，留下无声画面与成片，约 1.3 GB。

**会悄悄变大的地方：**

- **浏览器的临时档案目录。** 每个无头浏览器实例用一个临时目录（系统临时目录下，名字以 `lvs-chrome-` 开头），关闭时删除。渲染被强行终止时会留下，每个几十 MB。`node kit/tools/doctor.js` 会报告残留数量，`--clean` 删除。
- **不经本工具启动的无头 Chrome。** 直接用命令行 `chrome --headless --screenshot` 出图时，每次会在用户缓存目录下留一份几十 MB 的档案（Linux 上是 `~/.cache/google-chrome-headless/`）。曾经因此累积到 17 GB。出图一律用 `look.js` 与 `sheets.js`。
- **中止的渲染留下的分段。** `out/<语言>/video.mp4.segs/`，重新渲染时会被覆盖；不再渲染时手动删除。
- **WSL 的虚拟磁盘。** 在 WSL 里删除文件之后，宿主机上的虚拟磁盘文件不会自动变小，要在关闭该发行版之后压缩。

清理生成物之前，先确认成片已经另行保存。
