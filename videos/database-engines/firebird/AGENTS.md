# Firebird：当前任务入口

2026-10-21：中文第 8 稿已由 WaterRun 确认（`review/NOTES.md`、`review/approval.json`），进入制作；本轮角色为**制作方**。先读 README 的「状态」「简报」「设计」。

- 文案只在 `src/js/script.js`；改字幕、句子或章名要重新交审。读法、停顿、lead 可改，记进 NOTES。
- 事实只来自 `research/FACTS.md`；画面上的字节、页号、槽、事务状态、开场背景数据都由 `tools/gen_data.py` 从 `research/lab/out_*` 生成，不手抄。
- 视觉：方向 1「官网」（导航条页签即章节、青色选中态、文档侧栏、火焰三色只给记录版本与事务）。颜色锁在 `check.style.palette`。
- 开场背景按策划者最新要求用 DB-Engines 2026 年 10 月流行度得分（FACTS S06），标明不是市场份额；o6 旁白不变。
- 配音 MiniMax `danya_xuejie` 语速 1.1；配乐 `tools/music.py`（柏林学派音序器）。制作者听不到声音，听感由策划者确认。
- 章节卡：常驻层刷入，刷满后交给场景内的同款卡（`config.js` 的 `after()`），否则停留期会被静止检测判失败。
- 只写本片目录；共享文件（系列说明、docs）的建议记在 README「复盘」。提交用 `git commit -m "…" -- videos/database-engines/firebird/`。
