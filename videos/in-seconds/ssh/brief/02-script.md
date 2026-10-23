# 02 旁白与时间线

<!-- 准备方填写。脚本的通用写法在 docs/guides/script.md。 -->

中文旁白已确认，尚未合成，读音尚未回听。全文在 `src/js/script.js`。配音用 MiniMax speech-2.8-hd：中文 `Chinese (Mandarin)_Radio_Host`，英文 `Friendly_Person`，语速 1.0。英文译文未确认，确认前不合成英文。

## 1. 全文

中文确认稿：[script.zh.3577ae2c…](../review/script.zh.3577ae2c1ba07d7740371bcc5224512679c1b4ad7370a5e0693081a6352b8643.md)，SHA-256 `3577ae2c1ba07d7740371bcc5224512679c1b4ad7370a5e0693081a6352b8643`。依据在 [NOTES.md](../review/NOTES.md) 开头。英文校对稿已导出，`approval.json` 里 en 仍是 pending。

## 2. 能不能改

- **不改**：各句的文字、读法（`SAY` 表与 `tts` 字段）、句号。
- **可以调**：句间停顿 `gap`、章节的 `lead` 与 `tail`，用来给镜头和动作留时间。调完运行 `node kit/tools/tts.js videos/in-seconds/ssh`（有缓存，几秒），总长必须仍在 `project.json` 的 `check.duration` 范围内。
- 认为某句有事实错误或读音错误时，不要自行改写：停下来报告，说明依据。

## 3. 每句对应的画面要求

`expect.<语言>.json` 列出了每句说完的那一刻画面上必须完整出现的文字。它是「旁白与画面对应」的硬约束，`scan.js` 逐句核对。不要删改其中的条目。
