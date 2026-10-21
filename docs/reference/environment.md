# 环境搭建

本文说明在一台新机器上要装什么、怎样确认可用、两台机器怎样分工，以及生成物占多少空间、怎样清理。

首次使用的分阶段步骤见 [getting-started.md](../getting-started.md)，归档与清理的完整流程见 [release.md](../guides/release.md)。只有一台机器也能完成全部制作，远端配置是可选项。

## 1. 需要什么

| 项 | 要求 | 用途 | 实测可用的版本 |
|---|---|---|---|
| Node.js | 22.12 或更新 | 运行全部工具 | 22.21、24.21 |
| Chrome 或 Chromium | 近期版本 | 无头出帧 | 152、154 |
| ffmpeg 与 ffprobe | 带 libx264 编码器 | 编码、封装、响度与静止检测 | 2026 年 9 月的主线构建 |
| Python 3 | 3.10 或更新 | 配音、混音、回听 | 3.12、3.14 |
| Python 包 `edge-tts`、`numpy` | 必需 | 配音、混音 | edge-tts 7.3（7.2.8 已被在线服务拒绝，见 [踩过的坑](pitfalls.md)）、numpy 1.26 与 2.4 |
| Python 包 `faster-whisper` | 可选 | 回听旁白（`asr.js`、`tts_probe.js`） | 1.2 |
| Python 包 `pillow` | 可选 | 越界自检（`margin.js`） | 10、12 |
| 字体 | 清单见 `kit/assets.json` | 画面 | 由 `assets.js` 下载并校验 |
| 语音识别模型 | 可选 | 回听旁白 | faster-whisper small |
| 显卡 | 可选，要能被 Chrome 用作硬件加速 | 出帧提速；策划者要求 4K 的片子靠它才出得动（缺省仍是 1080p），见 [tools.md](tools.md) 第 1 节「用显卡出帧与 4K 交付」 | Windows 上经 ANGLE（D3D11）调用 |

Windows、Linux、macOS 都可以。配音需要联网（edge-tts 调用在线语音服务）；其余步骤离线可做。

只写场景、看帧、跑扫描，需要的是 Node、Chrome 与字体；配音、混音、渲染、封装才需要 Python 与 ffmpeg。

只验证源码工具时运行 `npm test`、`npm run check:repo`；检查看帧环境用 `node kit/tools/doctor.js --visual`。这两层不需要在线语音服务。

## 2. 步骤

```bash
git clone <仓库地址>
cd ft
npm ci                                  # puppeteer-core 与 gsap，版本由 package-lock.json 锁定
node kit/tools/assets.js --fetch        # 字体，约 44 MB，逐个校验 SHA-256
node kit/tools/doctor.js                # 逐项检查，指出缺什么
```

Python 包使用 `.venv/` 安装 `kit/requirements.txt`；可选审查包使用 `kit/requirements-review.txt`，各系统命令见 [快速入门](../getting-started.md#5-安装完整出片环境)。工具优先采用 `PYTHON` / 本机配置指定的程序，其次查本仓库 `.venv/`，最后查系统 Python。

- ffmpeg：放进系统 `PATH`，或把可执行文件放在 `assets/ffmpeg/bin/` 下，或在本机配置里写明位置。
- 语音识别模型：不放置时 `asr.js` 首次运行由 faster-whisper 自行下载；也可 `node kit/tools/assets.js --fetch --whisper` 取到 `assets/whisper/fw-small/`（约 480 MB）。模型站点连不上时，在本机配置里把 `hf_endpoint` 换成可用的镜像。
- 工具按常见位置找 Chrome、ffmpeg、Python；位置特殊时写 `kit/config.local.json`（不入库，样例见 `kit/config.local.example.json`）或设环境变量，见 [tools.md](tools.md) 第 6 节。

`doctor.js` 输出「环境可用」即可开工。带 `!` 的项不影响出片，但会缺少对应的检查。

### Windows 上的注意事项

- 控制台输出是 UTF-8。cmd 里出现乱码时先执行 `chcp 65001`；PowerShell 里先执行 `[Console]::OutputEncoding = [Text.Encoding]::UTF8`。乱码只影响显示，不影响结果。
- 仓库路径里有非 ASCII 字符时，工具已作处理（语音识别模型按相对路径加载）。自己写命令时用相对路径。
- 写 PowerShell 脚本时，自定义函数不要叫 `mv`、`del`、`cp`、`rm` 这类名字：它们是内置别名，调用时执行的是内置命令而不是自己的函数。
- cmd 里 `if not exist x mkdir x & 后续命令` 会把后续命令一并归入 `if`，写成 `(if not exist x mkdir x) & …`。

## 3. 两台机器分工

常见的分法：在一台机器上写代码、看帧、跑扫描；在另一台性能更好的机器（渲染机）上配音、混音、渲染。有显卡的机器适合做渲染机。两边各有一份仓库，各自 `npm ci`、各自放 `assets/`。

下文把生成音频、画面与成片的机器称为**制作机**；只用一台机器时，它就是唯一的机器。分工时，制作机即**渲染机**，另一台称为**本机**（写代码、看帧、扫描）。

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
- 渲染机是共用的机器时，开工前看一眼它的内存与磁盘。每个编码进程限 4 线程，约占 0.7 GB；九路并行约 6–7 GB。渲染失败后，先按临时档案目录的名字（`lvs-chrome-`）确认残留的无头浏览器，再清理；其他浏览器进程不在清理范围内，不结束。

**提交历史的同步**与工作树的同步是两回事：提交在一边做，用 `git push` 或 `git pull` 带到另一边。仓库正常情况下只有 `main` 一个分支，两边都直接在 `main` 上提交（见 [process.md](../process.md) 的「并行开工与分支」）。渲染机上的仓库不是裸仓库时，可以让它接受推送并保持工作树不动（工作树已经由 `remote.js push` 同步过，内容与新提交一致）：

```bash
# 在渲染机的仓库里，一次性设置
git config receive.denyCurrentBranch updateInstead
printf '#!/bin/sh\ngit read-tree "$1"\n' > .git/hooks/push-to-checkout
```

这个钩子在收到推送时只把索引换成新提交，不改工作树。

## 4. 空间占用与清理

空间应以当前文件实测；下表是既有制作中的量级参考，不代表每次 clone 或每部影片的固定大小：

| 位置 | 内容 | 大小 | 能否删 |
|---|---|---|---|
| `node_modules/` | 依赖 | 约 35 MB | 能，`npm ci` 重装 |
| `assets/fonts/` | 字体 | 约 44 MB | 能，`assets.js --fetch` 重新下载 |
| `assets/whisper/` | 语音识别模型 | 约 480 MB | 能 |
| `assets/ffmpeg/` | ffmpeg | 视构建而定，约 500 MB | 能 |
| `<视频>/audio/` | 旁白音频缓存 | 每种语言几 MB | 先归档；重合成需要联网且可能改变时间线 |
| `<视频>/out/<语言>/video.mp4` | 无声画面 | 8 分钟约 150 MB | 先归档；重新渲染需要几分钟到几十分钟 |
| `<视频>/out/<语言>/*.wav` | 各条混音与分轨 | 8 分钟每条约 90 MB，一次混音五条 | 先归档；相同输入可由 `audio.js` 重建 |
| `<视频>/out/*.mp4` | 成片 | 8 分钟每个约 150 MB，每种语言三个 | 交付物，另行保存后才能删 |
| `<视频>/shots/`、`<视频>/build/` | 截图、检查报告与中间数据 | 随采样范围变化 | 先归档复盘证据，报告是重跑交付检查的输入 |

一部 8 分钟的双语片子，渲染与封装期间曾占约 2–3 GB。用 `node kit/tools/clean.js <视频>` 查看当前实际占用；执行删除需另指定仓库外的新归档目录并校验，见 [release.md](../guides/release.md)。

**会悄悄变大的地方：**

- **浏览器的临时档案目录。** 每个无头浏览器实例用一个 `lvs-chrome-*` 临时目录，正常关闭时删除。`doctor.js` 只报告数量，其中可能包含正在使用的目录。异常退出后按 [release.md](../guides/release.md) 核对 PID、子进程与目录归属，仅处理已确认不再使用的目录；不批量清理。
- **不经本工具启动的无头 Chrome。** 直接用命令行 `chrome --headless --screenshot` 出图时，每次会在用户缓存目录下留一份几十 MB 的档案（Linux 上是 `~/.cache/google-chrome-headless/`）。曾经因此累积到 17 GB。出图一律用 `look.js` 与 `sheets.js`。
- **中止的渲染留下的分段。** `out/<语言>/video.mp4.segs/`，重新渲染时会被覆盖；收尾时随 `out/` 统一归档和清理。
- **WSL 的虚拟磁盘。** 在 WSL 里删除文件之后，宿主机上的虚拟磁盘文件不会自动变小，要在关闭该发行版之后压缩。

清理须保留成片、配音和审查证据的可校验副本；单片清理工具不会删除字体、依赖、实验环境或系统缓存。
