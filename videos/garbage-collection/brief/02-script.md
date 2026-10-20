# 02 旁白与时间线

**唯一源稿是 `src/js/script.js`。** 本文件不另存一份全文，避免两边各改一份。导出的只读全文在 `review/script.zh.11b3303bab0410f6719547afc4a5146f06aec287b05687a9c4a2dc7831afcac8.md`。

```bash
node kit/tools/script-review.js videos/garbage-collection export --lang zh
node kit/tools/script-review.js videos/garbage-collection check --lang zh
node kit/tools/timeline.js videos/garbage-collection
```

## 1. 现在的状态

中文第 8 稿已经策划者 WaterRun 明确确认（2026-10-20）。确认后准备方只做了一次**不改含义的字幕断句**：原确认稿有 61 句超过 26 字宽的字幕上限（最长 50 字宽），拆成 142 句，每句不超过 24 字宽。断句的对应关系见 `review/NOTES.md`「字幕断句」一节；逐字校验确认拼接后与确认稿完全一致。

内容 SHA-256：`11b3303bab0410f6719547afc4a5146f06aec287b05687a9c4a2dc7831afcac8`。

## 2. 哪些能调，哪些不能改

| 改动 | 处理 |
|---|---|
| 旁白的字、句子的顺序、章节结构、标题承诺 | **不能改。** 要改先回准备方，由策划者重新确认 |
| 停顿（`gap`）、章节卡的 `lead`/`tail` | **可以调。** 配音后按 `timeline.js` 的实际时长重排；记录在 `DELIVERY.md` |
| 读法（`SAY` 表与单句 `tts` 字段） | **可以调**，但不能借此改变陈述的意思。改了要回听并记录 |
| 字幕的断句 | **可以调**，但改动后内容哈希会变，须在 `DELIVERY.md` 记录并同步 `review/approval.json` 的哈希（沿用同一确认依据，不新增审批） |
| 画面 | 全部由你定，见 `brief/03-visual.md` 与 `brief/04-storyboard.md` |

## 3. 配音

- 引擎与音色在 `project.json` 的 `tts` 段：MiniMax `speech-2.8-hd`，音色 `Chinese (Mandarin)_Sweet_Lady`（甜美女声），语速 1.0。
- 音色试听在 `audio/probe/`：六个候选各 4 段、最贴「可爱」的四个各 6 段。策划者已认可 Sweet_Lady；换音色前先问。
- 本机已缓存 129/142 句，`tts.js` 会跳过已合成的。**先跑 `tts.js` 再决定要不要改读法**，否则会白合成一遍。
- 合成后用 `asr.js` 回听。ASR 只作筛查：标出的存疑句要人耳确认，ASR 通过不等于读对了。
- 专名的读法清单见本片 `README.md` 的「读法」一节。

## 4. 时间线

- 定长：全片时长必须落在 `project.json` 的 `check.duration`（400–640 秒）内。
- 每个场景带 `at`（开始的时刻），`TOTAL` 是全片时长；旁白超出定点记入 `L.problems`，总闸门不通过。
- 画面上的时间点一律写 `T(句号, 词)`，不写死秒数。
- 配乐的抬起点 `audio.score.lift_cue` 指向结论那一句（当前指向 `c3` 所在的收束段），改结论位置时要一起改。
