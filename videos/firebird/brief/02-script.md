# 02 旁白：取用方式与边界

## 1. 唯一源稿

`src/js/script.js` 是唯一文案源稿（浏览器与工具共用）。**不要另存一份全文**，本文件也不复制全文。

- 交审导出稿（策划者逐句读的就是它）：`review/script.zh.<内容哈希>.md`
- 当前内容 SHA-256 见 `review/approval.json` 的 `content_sha256`
- 校对记录、策划者意见与确认依据：`review/NOTES.md`

## 2. 能改什么

| 可以改 | 不可以改 |
|---|---|
| 停顿（`gap`、`pause`）的长度 | **任何一个字** |
| 读法（`SAY` 表与各 cue 的 `tts`） | 句子的顺序与增删 |
| 字幕里的强调标记 `*词*` | 章节顺序与章节标题 |
| 场景内画面与时间点 | 片名与标题承诺 |

改文字（哪怕是错别字）都要回到策划者重新确认。改了 `script.js` 之后重新导出：

```bash
node kit/tools/script-review.js videos/firebird export
```

## 3. 读法

- `SAY` 表在 `src/js/script.js` 末尾，**按语言分两组**。本片只做中文，`en` 那组保持空。
- 长词写在前面，避免被短词的规则截断。
- 年份、版本号、字节数与偏移在对应 cue 的 `tts` 里已经写成中文读法（如「二零零二年三月十一日」「八千一百九十二字节」「一百九十万零二百五十四字节」），不要让 TTS 自己猜。
- 数据「行」读作 háng；`SAY` 里按具体词替换，不要全局替换「行」字。

拿不准的读法先试：

```bash
node kit/tools/tts_probe.js videos/firebird --lang zh "<写法一>" "<写法二>"
```

## 4. 时间点

- 画面上的所有时刻写成 `T(句号, 词)`，不写死秒数。`T('c5')` 是该句开始的时刻，`T('c5', '读')` 是「读」这个字被读到的时刻。
- 找不到词时页面日志里会有 `word not in cue`，`scan.js` 会报成 `PAGE` 错误。
- 查某句可用的词与时刻：`node kit/tools/timeline.js videos/firebird c5`。

## 5. 片尾

`credits` 场景是一条 13 秒的静默 cue（`pause: 13`、`credits: true`、无 `tts`、字幕为 `null`）。**名单与开源链接只上画面，不配旁白**；正文里不出现「策划」「模型」「开源视频」这类制作指令。

名单按 `research/FACTS.md` 的「制作署名」，并与 `README.md`、`DELIVERY.md` 一致。
