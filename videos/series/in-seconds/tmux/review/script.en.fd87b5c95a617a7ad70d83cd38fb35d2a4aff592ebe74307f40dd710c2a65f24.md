# 文案校对稿 · 

- 语言：en
- 内容 SHA-256：`fd87b5c95a617a7ad70d83cd38fb35d2a4aff592ebe74307f40dd710c2a65f24`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：128.0 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

反馈应用：[逐项记录](feedback.json)。交审时同时核对 Lean 4 负面案例、单集独立理解、中文释义与口播负担。

## open · 无章节卡

预估 16.5 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| o1 | A counting loop is running. |
| o2 | Detached, the count goes from 4 to 9. |
| o3 | No terminal is attached. |
| o4 | This is *tmux*, a terminal multiplexer. |
| oT | （无旁白；画面停留） |
| o5 | One screen, several terminals. |

## model · 无章节卡

预估 26.5 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| m1 | A pseudo terminal, a pty, is the read-write device. |
| m2 | A group of pseudo terminals is a *session*. |
| m3 | Detach does not end the session. |
| m4 | A *window* is one full-screen page. |
| m5 | A *pane* is one block of that page. |
| m6 | Each pane has its own process. |
| m7 | The run uses tmux 3.4. |
| m8 | Two windows. The second has two panes. |

## use · 无章节卡

预估 29.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| u1 | The one that attaches is the *client*. |
| u2 | Detach, or a dropped link, removes the client. |
| u3 | The background process is the *server*. |
| u4 | Press *Ctrl-b*, then a command key. |
| u5 | c makes a page. d detaches. |
| u6 | % splits side by side. " splits top and bottom. |
| u7 | Attach again with tmux attach. |
| u8 | Those keys bind tmux commands. |
| u9 | The screen reads back as *PANE-A*. |

## impl · 无章节卡

预估 33.0 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| i1 | A socket joins both processes, on this machine. |
| i2 | A client only takes keys and draws. |
| i3 | Keys hit the command table first. |
| i4 | A key with no command enters the pane. |
| i5 | In 3.8 the server forks a pty and a child. |
| i6 | *VT100* is a set of terminal control codes. |
| i7 | The server stores characters, not raw bytes. |
| i8 | It redraws a frame for each client terminal. |
| i9 | No client: the count still goes from 4 to 9. |

## edge · 无章节卡

预估 15.5 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| e1 | After kill-server, the server and the pane both end. |
| e2 | Staying up means a disconnect, not a reboot. |
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
