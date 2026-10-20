# 文案校对稿 · 

- 语言：en
- 内容 SHA-256：`4b1266b310dcb09a1bf9804573d767f5bb2a98b0d77064d7881e0f4869e84ed4`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：128.0 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

反馈应用：[逐项记录](feedback.json)。交审时同时核对 Lean 4 负面案例、单集独立理解、中文释义与口播负担。

## open · 无章节卡

预估 14.4 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| o1 | A terminal runs a count. |
| o2 | It leaves, and 4 becomes 9. |
| o3 | The program keeps running. |
| o4 | This is *tmux*. |
| oT | （无旁白；画面停留） |
| o5 | Only the attached terminal left. |

## model · 无章节卡

预估 43.2 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| m1 | The process that keeps it is the *server*. |
| m2 | The watching and typing end is the *client*. |
| m3 | After the client leaves, the server stays. |
| m4 | That place is a pseudo terminal. |
| m5 | The pseudo terminal stays on the server. |
| m6 | The server started the counting process. |
| m7 | A full-screen page is a *window*. |
| m8 | tmux 3.4 has two windows. |
| m9 | One cut of a window is a *pane*. |
| m10 | The second window splits into two panes. |
| m11 | The counting program is in one of them. |
| m12 | Each pane has its own pseudo terminal. |
| m13 | Kept together, they are a *session*. |

## use · 无章节卡

预估 19.5 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| u1 | Press *Ctrl-b*, then the next key. |
| u2 | c opens a new window. |
| u3 | d makes the current client leave. |
| u4 | % splits a pane side by side. |
| u5 | " splits a pane top from bottom. |
| u6 | tmux attach brings this session back. |

## impl · 无章节卡

预估 28.8 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| i1 | Keys hit tmux first. Known ones, it handles. |
| i2 | Other keys go to the program in the pane. |
| i3 | Bytes the program writes reach the server. |
| i4 | The server reads those bytes into characters. |
| i5 | Raw bytes are not given to the client. |
| i6 | It redraws one frame for this client. |
| i7 | A command to the other pane reads back *PANE-A*. |
| i8 | With no client, 4 still becomes 9. |

## edge · 无章节卡

预估 14.6 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| e1 | After kill-server, server and pane both stop. |
| e2 | Still there means leaving, not a reboot. |
| e3 | Process and screen stay on the server, not the client. |
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
