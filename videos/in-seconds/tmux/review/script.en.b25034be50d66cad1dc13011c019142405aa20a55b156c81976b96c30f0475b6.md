# 文案校对稿 · 

- 语言：en
- 内容 SHA-256：`b25034be50d66cad1dc13011c019142405aa20a55b156c81976b96c30f0475b6`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：128.0 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

反馈应用：[逐项记录](feedback.json)。交审时同时核对 Lean 4 负面案例、单集独立理解、中文释义与口播负担。

## open · 无章节卡

预估 17.2 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| o1 | The terminal leaves. The counting program stays. |
| o2 | 4 before it leaves, 9 after. |
| o3 | Only the terminal in front left. |
| o4 | The program that keeps the count is *tmux*. |
| o5 | One screen can hold several terminals. |
| oT | （无旁白；画面停留） |

## past · 无章节卡

预估 19.4 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| p1 | *tmux* was written in 2007. |
| p2 | *screen* is the terminal program he was using. |
| p3 | He wrote that it is not a copy of *screen*. |
| p5 | He wanted the same page on several terminals at once. |
| p6 | In 2009, *tmux* became a program shipped with OpenBSD. |

## model · 无章节卡

预估 38.2 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| m1 | That number is still there. |
| m2 | These terminals together are a *session*. |
| m3 | A full-screen page is a *window*. |
| m4 | One cut of that page is a *pane*. |
| m6 | The process that keeps this group is the *server*. |
| m7 | The end that watches and types is the *client*. |
| m8 | After the client leaves, the session remains. |
| m9 | A pseudo terminal is the terminal *tmux* gives the program. |
| m10 | That pseudo terminal stays on the server. |
| m11 | This group has two windows. |
| m12 | The second window is cut into two. |
| m13 | The count is in one of them. |

## use · 无章节卡

预估 19.8 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| u1 | *Ctrl-b* first. Then *tmux* hears the next key. |
| u2 | c opens a new window. |
| u3 | d makes the current client leave. |
| u4 | % cuts a pane into left and right. |
| u5 | A quote cuts a pane into top and bottom. |
| u6 | *tmux* attach brings the client back. |

## impl · 无章节卡

预估 10.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| i1 | *tmux* takes the keys just shown. |
| i2 | Other keys go to the program in the pane. |
| i3 | With no client, the reading is 9. |

## edge · 无章节卡

预估 15.9 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| e1 | The program stays because the server stays. |
| e2 | That stay only covers the terminal leaving. |
| e3 | To stop it, use kill-server. |
| e4 | When the server stops, the program inside stops too. |
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
