# 文案校对稿 · 

- 语言：en
- 内容 SHA-256：`da03e0356f9543733fd1613775b5d138723f55467e28eeea9ec77ee65f807260`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：128.0 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

反馈应用：[逐项记录](feedback.json)。交审时同时核对 Lean 4 负面案例、单集独立理解、中文释义与口播负担。

## open · 无章节卡

预估 16.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| o1 | The terminal leaves, and the program stays. |
| o2 | 4 before leaving, 9 after. |
| o3 | Only the attached terminal left. |
| o4 | What keeps this program is *tmux*. |
| o5 | It keeps several terminals on one screen. |
| oT | （无旁白；画面停留） |

## past · 无章节卡

预估 18.9 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| p1 | *tmux*'s *nscr* prototype was written in 2007. |
| p2 | *screen* is the terminal program the author was using. |
| p3 | The author said it is not a copy of *screen*. |
| p4 | In 2009 it entered the OpenBSD base system. |
| p5 | The September 2026 release is 3.8. |

## model · 无章节卡

预估 42.6 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| m1 | That count is still there. |
| m2 | The count sits in a group of terminals, a *session*. |
| m3 | A *window* is one full-screen page in it. |
| m4 | A *pane* is one cut of that page. |
| m5 | Each pane holds one program. |
| m6 | The process that keeps the session is the *server*. |
| m7 | The end that watches and types is the *client*. |
| m8 | After the client leaves, the session stays. |
| m9 | The read-write place is a pseudo terminal. |
| m10 | The pseudo terminal stays on the server. |
| m11 | tmux 3.4 has two windows. |
| m12 | The second window is split into two panes. |
| m13 | The counting program is in one of them. |

## use · 无章节卡

预估 17.3 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| u1 | First *Ctrl-b*, then the next key. |
| u2 | c opens a new window. |
| u3 | d makes the current client leave. |
| u4 | % splits a pane side by side. |
| u5 | " splits a pane top from bottom. |
| u6 | tmux attach brings it back. |

## impl · 无章节卡

预估 10.4 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| i1 | *tmux* handles the keys it knows. |
| i2 | Other keys go to the program in the pane. |
| i3 | No client, and the later reading is 9. |

## edge · 无章节卡

预估 15.2 秒。

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
