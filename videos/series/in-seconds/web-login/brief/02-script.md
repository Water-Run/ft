# 02 旁白与时间线

旁白源稿在 `src/js/script.js`；每句起止时刻用 `node kit/tools/timeline.js videos/series/in-seconds/web-login [句号…]` 查。当前是**待确认稿**，不是已定稿。

## 1. 全文与确认状态

- 中文稿：`review/script.zh.53db476cea9e31747e954d4ffa98db5f7084b40bdfa0eb187d6e2f52bf9c37a4.md`，内容 SHA-256 `53db476cea9e31747e954d4ffa98db5f7084b40bdfa0eb187d6e2f52bf9c37a4`。
- 英文草稿：`review/script.en.c2c907397d06359c32112638d6e2e9bad10c7c80bb86b2ba42565f53d7dc2e36.md`，内容 SHA-256 `c2c907397d06359c32112638d6e2e9bad10c7c80bb86b2ba42565f53d7dc2e36`。
- `review/approval.json` 当前是 `pending`；WaterRun 明确确认前，不合成、不铺场景。确认后由准备方运行 `tts.js`，把 `timing.zh.js`/`timing.en.js` 与音频缓存补齐，再交给 Opus 5.5。
- 逐句意见与待确认问题在 `review/NOTES.md`；术语表也在那里。

## 2. 能不能改

- **不改**：各句文字、`SAY` 表、句号、场景顺序、标题承诺。
- **可以调**：句间 `gap`、场景 `lead`/`tail`，用来给镜头/动作留时间。调完运行 `tts.js`（有缓存）确认总长仍在 `check.duration` 内。
- 认为某句有事实错误或读音错误：不要自行改写；停下报告，说明依据。

## 3. 时间结构

估算总长 200.0 秒（中文与英文相同）。场景：open 0:00 / password 0:18 / session 0:49 / attacks 1:25 / factors 1:53 / federated 2:25 / close 2:57 / outro 3:12，片尾 7.5 秒无旁白。

实际配音后，`timing.*.js` 会改变每句的起止时刻；场景里的 `T()` 会自动跟着走。任何写死秒数的画面都会在改稿后错位。

## 4. 每句对应的画面要求

`expect.zh.json` 与 `expect.en.json` 列出每句说完时画面上必须完整出现的文字；不要删改条目。Opus 5.5 在实现场景时把标签/形状/读数放在对应时刻，`scan.js` 会逐句核对。
