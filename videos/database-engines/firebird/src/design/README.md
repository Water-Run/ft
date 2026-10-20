# `src/design/` —— 关键帧与示范场景的工作区

**这里归你做。** 准备方不预置版面样张：视觉方案由你定，预置等于替你把构图定死。

## 放什么

| 文件 | 内容 |
|---|---|
| `keyframes.html` | 三到四张静态版面：标题、信息最密的一屏、图解、章节卡。做两到三个方向，按 `docs/standards.md` 自评后选定一个 |
| `scene-demo.js` | 一段十来秒的示范场景，用到镜头、两三种入场动作、打字机、音效登记。它是你自己照着写的范例 |

看关键帧：

```bash
node kit/tools/look.js videos/database-engines/firebird --url "/src/design/keyframes.html?k=1" --size 1920x1080
```

## 从哪拿材料

- **色板与字体**：`src/css/style.css` 的 `:root` 变量（锁在 `project.json` 的 `check.style.palette`），出处见 `research/STYLE.md` 第 1 节。
- **可用的官方语汇**：Firebird 的 `isql` 提示符、`MON$` 监控表字段、`.fdb` 的页结构、页类型的官方编号与名称。
- **画面上会出现的真实数值**：`research/STYLE.md` 第 2 节的表，来源是 `research/lab/out_*.txt` 与 `out_*.json`。
- **要满足的要求**：`brief/03-visual.md`。

## 注意

- 选定方向后，在本片 `README.md` 写明选了什么、为什么（`docs/guides/visual.md` 第 3 节）。
- 这个目录是**你的工作区**，文件名如上；除这两个文件外不要往里塞别的。
- 不要修改 `kit/`、仓库 `docs/`、别的视频目录，也不要改本片的 `src/js/engine.js`、`util.js`、`boot.js`、`css/base.css`。
