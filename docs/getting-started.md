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

工具自行启动并关闭本地服务器。不要双击 `src/index.html`，它依赖 `/fonts/` 和 `/vendor/` 的资源映射。安装或下载失败的诊断见 [environment.md](environment.md)。

## 3. 用于独立制作或 fork

原仓库的策划与校对者是 WaterRun，频道与排期属于这个制作团队。独立制作时，先在自己的 fork 中修改 [kit/studio.json](../kit/studio.json)：

```json
{
  "planner": "实际策划者的公开署名",
  "reviewer": "实际负责校对的人",
  "repository": "https://github.com/example/my-videos"
}
```

`new.js` 将这些公开信息拷入新片的 `project.json`、README、FACTS 和任务入口；之后修改 studio 配置不会追改旧片。已有作品的原作者、历史确认和发布记录保持真实；新片的片尾实现须按自己的项目配置填写，不能把未参与者列进名单。原仓库的 WaterRun 审稿约定在原仓库继续适用。

初次使用可保留 `videos/` 中的历史作品作参考，先用 `--scratch` 练习。希望空片单起步时，在自己的新仓库中保留 `kit/`、`docs/`、依赖清单、许可与贡献说明，创建 `videos/catalog.json`：

```json
{ "about": "本团队的视频片单", "series": [], "standalone": [] }
```

随后运行 `node kit/tools/catalog.js`，编写自己的 README、排期与反馈。清空片单须与移除旧作品目录一起进行，否则检查会报告不一致；不要在原仓库或仍有制作任务的目录里批量清空。衍生仓库保留许可与来源说明，第三方组件按 [third-party.md](third-party.md) 处理。

## 4. 正式立项与校对

```sh
node kit/tools/new.js standalone/first-video --title "这部片子的问题" --title-en "The question this film answers"
```

随后依次完成：

1. 本片 README：受众、主问题、时长上限、章节推进与开工反馈应用。
2. `research/FACTS.md`：取证、来源、适用范围、核查状态。
3. `src/js/script.js`：中文逐句文案；`review/NOTES.md`：术语解释与待讨论的取舍。
   按 `review/feedback.json` 逐项写具体计划与文案 / 分镜定位；规则更新时先运行 `feedback.js <视频> sync`。Lean 4 负面案例与 MyISAM 正面对照从这一步进入实际写稿。
4. `node kit/tools/script-review.js videos/standalone/first-video export`：生成可阅读的全文。
5. 把稿本交给指定校对者，按句号收集意见、修改并重新导出。得到明确确认后，按 [script-review.md](script-review.md) 记录；中文确认后翻译，逐句校对译文。

`new.js` 产生可运行的骨架，并不代表取证、审稿或场景已完成。模板中的 TODO 和示例必须替换；片尾名单须按实际分工补齐。

## 5. 安装完整出片环境

安装带 libx264 的 ffmpeg / ffprobe 和 Python 3.10 或更新。建议将 Python 包装在仓库的 `.venv/` 中，工具会自动优先查找它。

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

回听与像素检查另装 `kit/requirements-review.txt`；安装命令只需更换上面的 requirements 路径。Python 清单限定兼容范围，实际安装版本应记入交付记录；完整环境差异与可复现边界见 [environment.md](environment.md) 和 [review.md](review.md) 第 7 节。

```sh
npm run doctor
node kit/tools/script-review.js videos/standalone/first-video check
node kit/tools/tts.js videos/standalone/first-video
```

最后一条会把待合成旁白提交给在线语音服务；文案确认无效时工具先退出。服务暂不可用时保留稿本与缓存，在 README 记明停点。此后的视觉、声音、渲染、验收、发布按 [workflow.md](workflow.md) 做；交付后的归档和清理按 [lifecycle.md](lifecycle.md) 做。
