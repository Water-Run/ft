# 文案校对稿 · Tmux in 128 Seconds: What It Is, How to Use It, How It Works

- 语言：en
- 内容 SHA-256：`ce875f7996b19a5d257da7ed44119e8e7f7c337325dbc0245546c19f13ac1332`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：149.6 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

反馈应用：[逐项记录](feedback.json)。交审时同时核对 Lean 4 负面案例、单集独立理解、中文释义与口播负担。

## open · 无章节卡

预估 22.8 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| o1 | A program counts in a terminal. At 4, the terminal drops. |
| o2 | Reconnect a moment later, and it is already at 9. |
| o3 | The program kept running. Only the terminal left. |
| o4 | What kept it alive is a terminal multiplexer: *tmux*. |
| o5 | Many terminals on one screen, still there after you go. |
| oT | （无旁白；画面停留） |

## past · 无章节卡

预估 16.6 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| p1 | *tmux* was born in 2007. |
| p2 | Its author used *screen*, but did not set out to copy it. |
| p4 | He wanted one window shown on several terminals at once. |
| p6 | In 2009, *tmux* was imported into the OpenBSD base system. |

## model · 无章节卡

预估 38.7 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| m1 | Back to the counter: where does it actually live? |
| m2 | Starting *tmux* first launches a background process, the *server*. |
| m3 | The counter is a child process of the server. |
| m4 | Its terminal is a pseudo terminal the server created. |
| m5 | The terminal in front of you is just a *client*: picture and keys. |
| m7 | They talk over a local socket; closing the terminal only cuts that link. |
| m10 | Inside the server are three layers. Outermost: a *session*, a group of terminals. |
| m11 | A session holds *windows*, each filling the screen. |
| m12 | Windows split into *panes*, each its own pseudo terminal. |

## use · 无章节卡

预估 22.9 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| u1 | Shortcuts take two steps: *Ctrl-b*, then one key. |
| u2 | *Ctrl-b*, then c: a new window. |
| u3 | *Ctrl-b*, then %: the pane splits left and right. |
| u4 | *Ctrl-b*, then a double quote: top and bottom. |
| u5 | *Ctrl-b*, then d: detach. The terminal goes, the program stays. |
| u6 | To come back, type *tmux* attach. Everything is as it was. |

## impl · 无章节卡

预估 29.2 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| i1 | Each key goes to the server, which checks its key table. |
| i2 | After Ctrl-b, c is found there as new window. |
| i3 | Keys not in the table go straight into the pane’s pseudo terminal. |
| i4 | Program output does not go straight to your screen either. |
| i5 | The server first records it in that pane’s own screen, |
| i6 | then redrawn for each client’s terminal. |
| i7 | That is why a reattached screen comes back exactly as it was. |

## edge · 无章节卡

预估 11.8 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| e1 | The answer: the program lives in the server. |
| e3 | To end it all, use kill-server. |
| e4 | Once the server stops, every session and program ends with it. |
| eT | （无旁白；画面停留） |

## outro · 无章节卡

预估 7.5 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| z1 | （无旁白；画面停留） |

## 交审核对

- 标题、开头和结尾回答同一个问题。
- 术语第一次出现有解释；因果、适用范围、版本和数字对应 FACTS.md。
- 根据句号逐条核对译文，记录简化与推断；片尾名单留足阅读时间。
- 有疑问的地方逐条写入 NOTES.md，关闭意见后由指定校对者明确确认。
