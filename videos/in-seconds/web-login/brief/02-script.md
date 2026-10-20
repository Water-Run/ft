# 02 旁白与时间线

旁白源稿在 `src/js/script.js`；每句起止时刻用 `node kit/tools/timeline.js videos/in-seconds/web-login [句号…]` 查。

## 1. 全文与确认状态

- 中文第 10 稿 `e01d3642…` 于 2026-10-19 22:16 经 WaterRun 确认；第 11 稿 `ab2fce95…` 是依 WaterRun「放行后自行迭代、自助完成」的授权由 Claude Opus 5.5 自行定稿的三处改动。英文以第 11 稿为底本重译，同属授权自主定稿。记录在 `review/NOTES.md`「明确确认」，当前哈希在 `review/approval.json`。
- 配音已合成：MiniMax speech-2.8-hd，中文「精英青年」语速 1.05，英文 English_Aussie_Bloke 语速 1.08。实测时长在 `src/js/timing.<语言>.js`。

## 2. 能不能改

- 含义、范围、增删句、标题：按 `docs/guides/script-review.md` 处理，并在 NOTES 记录依据。
- 读法、停顿、场景定点：可以调；调完运行 `tts.js`（有缓存）、`timeline.js`，确认两种语言都正好 200.00 秒。MiniMax 每次合成的时长略有出入，重新合成过的句子要重排定点。

## 3. 时间结构

场景定点（两种语言共用）：open 0 / session 27.25 / jwt 65.25 / authn 102 / oauth 149.5 / close 181.75 / outro 192，片尾 7.5 秒无旁白。定点按两种语言各场实测长度取较长者排出，富余的时间主要留给收束一场的结论句（F04）。

## 4. 每句对应的画面要求

`expect.zh.json` 与 `expect.en.json` 按第 11 稿重写，列出每句说完时画面上必须完整出现的文字；`scan.js` 逐句核对。
