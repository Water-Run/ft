# 从 clone 到第一部视频

先取得一个可查看的结果，再安装完整出片环境。以下命令均在仓库根目录运行，除单独标注外适用于 PowerShell、bash 与 zsh。

## 1. 先验证源码与工具

安装 Git 和 Node.js 22.12 或更新，然后：

```sh
git clone https://github.com/Water-Run/ft.git
cd ft
npm ci
npm test
npm run check:repo
```

`npm ci` 按锁文件安装 JS 依赖；不会下载 Chrome、字体或配音。后两条命令不调用在线语音、不需要 Python 或 ffmpeg。测试在独立临时仓库运行，不修改片单或实际影片。

## 2. 打开第一张画面

安装 Chrome / Chromium，下载有校验和的字体：

```sh
npm run assets -- --fetch
npm run doctor -- --visual
npm run smoke
```

预期：环境检查通过；`smoke` 输出新建的 `out/sandbox/smoke-…/` 路径，其中包含中文、英文校对稿及 `shots/` 截图。该目录被 Git 忽略，不加入片单。它验证模板、时间线和浏览器资源加载；示例文案、版式与占位内容仍需重写，不能用它声明成片通过。

工具自行启动并关闭本地服务器。不要双击 `src/index.html`，它依赖 `/fonts/` 和 `/vendor/` 的资源映射。安装或下载失败的诊断见 [environment.md](reference/environment.md)。

## 3. 用于独立制作或 fork

原仓库的策划与校对者是 WaterRun，频道与排期属于这个制作团队。独立制作时，先在自己的 fork 中修改 [kit/studio.json](../kit/studio.json)：

```json
{
  "planner": "策划者本人选定的公开署名",
  "reviewer": "校对者本人选定的公开署名",
  "repository": "https://github.com/example/my-videos"
}
```

`planner` 与 `reviewer` 可以填写本人选择的姓名、昵称或笔名，不要求实名。`new.js` 将它们拷入新片 `project.json` 的 `credits` 与 `review`，片尾和校对记录使用这些署名。修改 studio 配置只影响后续新片；已有作品的贡献、确认与发布记录按实际情况保留。原仓库仍由 WaterRun 审稿。

初次使用可保留 `videos/` 中的历史作品作参考，先用 `--scratch` 练习。希望空片单起步时，在自己的新仓库中保留 `kit/`、`docs/`、依赖清单、许可与贡献说明，创建 `videos/catalog.json`：

```json
{ "about": "本团队的视频片单", "series": [], "videos": [] }
```

随后运行 `node kit/tools/catalog.js`，编写自己的 README、排期与反馈。清空片单须与移除旧作品目录一起进行，否则检查会报告不一致；不要在原仓库或仍有制作任务的目录里批量清空。衍生仓库保留许可与来源说明，第三方组件按 [third-party.md](reference/third-party.md) 处理。

## 4. 正式立项与校对

```sh
node kit/tools/new.js first-video --title "这部片子的问题" --title-en "The question this film answers"
```

随后依次完成，先把内容讲通再投入视听制作：

1. 本片 README 的「简报」：受众、核心问题、时长上限、逐章推进、决定不讲的材料。
2. `research/FACTS.md`：取证、来源、适用范围、核查状态。
3. `src/js/script.js`：中文逐句文案；`review/NOTES.md`：术语解释与待讨论的取舍。
   写稿前读这一阶段的经验规则：`node kit/tools/lessons.js show --stage script`。
4. `node kit/tools/script-review.js videos/standalone/first-video export`：生成连贯阅读与逐句校对两种视图。先通读叙事，再定位逐句问题。
5. 做本地审片页（文案、配音候选、配乐小样与关键帧，见[制作周期](process.md#1-主线)），把稿本交给指定校对者，按句号收集意见、修改并重新导出。得到明确确认后，按 [script-review.md](guides/script-review.md) 记录；中文确认后翻译，逐句校对译文。

`new.js` 产生可运行的骨架，并不代表取证、审稿或场景已完成。模板中的 TODO 和示例必须替换；参与的模型按实际分工补进 `project.json` 的 `credits`。之后的阶段与闸门见 [制作周期](process.md)。

## 5. 安装完整出片环境

安装带 libx264 的 ffmpeg / ffprobe 和 Python 3.10 或更新。建议将 Python 依赖装在仓库的 `.venv/` 中，工具会自动优先查找它。

PowerShell：

```powershell
py -3 -m venv .venv
.venv\Scripts\python.exe -m pip install -r kit/requirements.txt
```

bash / zsh：

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r kit/requirements.txt
```

回听与像素检查另装 `kit/requirements-review.txt`；安装命令只需更换上面的 requirements 路径。Python 清单限定兼容范围，实际安装版本应记入交付记录；完整环境差异与可复现边界见 [environment.md](reference/environment.md) 和[成片重建](guides/acceptance.md#9-已交付的片子能否重建)。

```sh
npm run doctor
node kit/tools/script-review.js videos/standalone/first-video check
node kit/tools/tts.js videos/standalone/first-video
```

最后一条会把待合成旁白提交给在线语音服务；文案确认无效时工具先退出。服务暂不可用时保留稿本与缓存，在 README 记明停点。此后的视觉、声音、渲染、验收、发布按 [process.md](process.md) 做；交付后的归档和清理按 [release.md](guides/release.md) 做。
