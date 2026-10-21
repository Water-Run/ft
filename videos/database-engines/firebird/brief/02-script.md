# 文案取用

唯一源稿：[src/js/script.js](../src/js/script.js)。可阅读的当前全文与哈希在 [review/NOTES.md](../review/NOTES.md) 定位；本文件不另存全文。

当前为 2026-10-21 中文第 8 稿，估算约 7:37，**未确认**。观众已看过前三期但不熟悉 Firebird；本轮扩写历史，并将历史演进、引擎加载和数据文件连成连续叙述。实现主体与双重运行形态保留，总长短于 MyISAM。按校对意见继续修改、重新导出，明确确认后才进入配音。

实质修改的再确认、纯读法与停顿调整的边界，以仓库 docs/guides/script-review.md 为准；不另设审批流程。

```sh
node kit/tools/script-review.js videos/database-engines/firebird export --lang zh
```

第 8 稿按最新要求补深页槽、记录头、逻辑记录号、差量回溯与 TIP；开场从 MySQL 起，o6 不改旁白，背景数据与口径见 research/MATERIALS.md。
