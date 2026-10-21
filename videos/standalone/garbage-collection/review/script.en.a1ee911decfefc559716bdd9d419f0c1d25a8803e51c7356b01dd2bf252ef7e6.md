# 文案校对稿 · The Art of Garbage Collection

- 语言：en
- 内容 SHA-256：`a1ee911decfefc559716bdd9d419f0c1d25a8803e51c7356b01dd2bf252ef7e6`
- 状态：交审稿；本文件不代表人工已确认。
- 首次导出预估总时长：751.7 秒。
- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。
- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。
- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。
- 意见与逐项处理：[校对记录](NOTES.md)。

直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。

写稿与交审前读一遍本阶段的经验规则：`node kit/tools/lessons.js show --stage script`。

## open · 无章节卡

预估 87.5 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| o1 | Picture memory as a vast sheet of graph paper: |
| o1b | every object a program makes takes up one square. |
| o2 | How fast does it go? In one second, C# can make sixty-seven million, |
| o2b | filling the sheet in a blink. |
| o3 | Give it just 64 MB, and never let go? |
| o3b | Five forced collections can't save it: out of memory. |
| o4 | Try PHP or Java, and you hit the same wall; |
| o4b | the errors differ, but one of them looks familiar. |
| o5 | Now live differently: let go as soon as you're done. |
| o5b | The same sixty-seven million, and the heap stays at 11 MB. |
| o6 | In that one second, someone behind the scenes swept up 136 times, |
| o6b | and the code didn't gain a single extra line. |
| o7 | This invisible housekeeper is called garbage collection: |
| o7b | find the memory nobody wants, and hand it back. |
| o8 | The hard part: programmers only ever ask for memory, |
| o8b | and never say which piece they're *done with*. |
| o9 | So how does it guess what's no longer needed? |
| o9b | And how does it clean up while the program sprints, without anyone noticing? |
| o10 | From bookkeeping to tracing, from generations to concurrency, |
| o10b | this isn't brute force; it's an art of compromise and trade-offs. |
| oT | （无旁白；画面停留） |

## count · 01 

预估 102.4 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| a1 | The most intuitive trick: keep the books in real time, |
| a1b | counting how many places use it. This is reference counting. |
| a2 | CPython keeps this ledger |
| a2b | in the first 8 bytes of every object, read and written constantly. |
| a3 | a is born with 1; assign it to b, and it's 2; |
| a3b | put it into a list, 3; delete b, clear the list, back to 1. |
| a4 | Erase the last name, and the count hits zero: |
| a4b | freed on the spot, with no global check bothering anyone. |
| a5 | The object knows when it's time to leave. Clean, and graceful. |
| a6 | The price: every pointer change means updating the books; |
| a6b | and the deadlier flaw is the reference cycle. |
| a7 | X holds Y, Y holds X; even with every outside name deleted, |
| a7b | they pull at each other, and the counts stay stuck at 1. |
| a8 | Neither can ever reach zero: an island in memory. |
| a8b | So Python and PHP both hire an extra collector, just to break cycles. |
| a8c | How does it spot an island? PHP, for one, does a trial subtraction: |
| a8d | it takes away every count the suspects give each other. |
| a8e | Still above zero? Someone outside uses it, so the count goes back. |
| a8f | Down to zero? Only its own circle holds it: that's an island. |
| a9 | Wake the cycle breaker and let it strike: |
| a9b | both sides find and clear 2 deadlocked objects. Exactly X and Y. |

## trace · 02 

预估 102.7 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| b1 | Since bookkeeping strands islands, the second approach follows the vine: |
| b1b | start from the *roots*, the stack and the global variables, |
| b2 | and follow the pointers down. Whatever you can reach is alive; |
| b2b | whatever you can't is garbage. This is tracing. |
| b2a | That deadlocked cycle? The roots can't reach it, so it's collected anyway. |
| b3 | Here hides the first elegant compromise: whether it'll be used later, |
| b3b | no one can predict; whether it's findable now, you settle on the spot. |
| b4 | In 1960, McCarthy's Lisp did it first: normally idle, |
| b4b | until the squares run out completely, then stop the program and clean house. |
| b5 | First follow the roots, flipping the sign bit of every square you touch; |
| b5b | then sweep the whole heap, and put every unflipped square back on the free list. |
| b6 | On the machines of the day, that pause lasted several seconds, like a crash. |
| b7 | Today we call it *mark-and-sweep*: |
| b7b | two steps. Mark: start at the roots, and tag everything you reach; |
| b7c | then sweep: walk the heap end to end, the dead and the living alike; |
| b7d | untagged goes back to the free list, tagged gets its tag wiped for next round. |
| b8 | Lua is mark-and-sweep at heart: |
| b8b | make two hundred thousand live tables and as many dead ones, and try it. |
| b9 | One cycle later, memory is cut in half, from 28 MB to 14 MB, |
| b9b | and not one live table is lost. |

## gen · 03 

预估 94.4 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| d1 | But scanning everything every time is too slow. |
| d1b | In 1983, Lieberman and Hewitt saw through a pattern: |
| d1c | most objects die young. |
| d2 | So objects live by age: generational collection. The new area is tiny, |
| d2b | quick to sweep, so that's the area to sweep, and sweep often. |
| d2c | Why quick? Most objects in the new area are already dead; |
| d2d | move the few survivors up a generation, and the whole new area is empty again. |
| d3 | A statistical insight about how people write code |
| d3b | grew into the physical shape of the heap. |
| d4 | .NET splits the heap into three generations: newborns start in gen 0, |
| d4b | survive one collection to reach gen 1, and another to retire in gen 2. |
| d5 | In that first second, gen 0 was swept a full 136 times, |
| d5b | while the big gens 1 and 2 weren't touched once. |
| d6 | But what if an old object holds a new one? |
| d6b | Skip the old area, and how do you know the new object must live? |
| d8 | .NET's trick is a *card table*: whenever a pointer in the old area changes, |
| d8b | tick a box on the write, and each collection checks only the ticked boxes. |
| d9 | That quiet *tick on the write* sentinel has a name. We'll save it for later. |

## tri · 04 

预估 208.4 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| e2 | And what if even the old area fills up? |
| e2b | In 1978, Dijkstra and colleagues proposed: |
| e2c | don't stop the program; let the collector and the program run at the same time. |
| e3 | To keep your head in the middle of a sprint, |
| e3b | just paint objects in three states. This is tri-color marking. |
| e4 | White: untouched. Gray: touched, its targets not yet. |
| e4b | Black: it and everything it points to are done. Completely safe. |
| e4c | At the start, whatever the roots hold is gray; everything else is white. |
| e5 | Each time, the collector picks a gray one, |
| e5b | paints every white it points to gray, and turns black itself. |
| e5c | Gray is a to-do list: check one, cross it off; |
| e5d | so the collector can work a bit, stop, and later pick up again from the gray. |
| e6 | When no gray is left, all black and white, the white that remains is garbage. |
| e7 | The thrill: as the collector paints, the program rewires pointers. |
| e7a | If a black object, already checked, quietly grabs a white one, |
| e7ab | and the gray that used to hold it lets go, |
| e7ac | a live object is wrongly killed as garbage. |
| e8 | The way out? Dijkstra laid down a house rule: |
| e8b | while marking, black must never point directly at white. |
| e9 | Whenever the program changes a pointer and breaks the rule, |
| e9b | the white object it now points to is forcibly painted gray. |
| e10 | This little interception, done while writing a pointer, |
| e10b | is the mystery we saved for later: the write barrier. |
| e11 | Three colors, one house rule; no need to predict what the program will do, |
| e11b | and at full speed, not one living thing is missed. |
| e12 | Open the Lua source, and the comments state this iron rule word for word: |
| e12b | while marking, black may never point to white. |
| e12a | It only steps back when a table changes: new data in a black table, |
| e12ab | the table turns itself back to gray, and the rule still holds. |
| e13 | Back to those four hundred thousand tables: with three colors and barriers, |
| e13b | Lua splits the big cleanup into 419 small steps per cycle. |
| e14 | For the first 300 steps it's busy coloring, and memory doesn't budge; |
| e14b | then it sweeps in batches, from 28 MB down to 14 MB. |
| e15 | And between every step, the program slips back to its own work. |
| e15b | Big work in small pieces: this is incremental. |
| e18 | Java's G1 goes further: it moves marking into the background, running alongside, |
| e18b | and pauses only briefly at the start and the end. This is concurrent. |
| e16 | Back to .NET's card table: the line a.Next = b |
| e16b | compiles to four machine instructions: |
| e17 | compute the address, call the write barrier, a no-op to align, return. |
| e17b | The pointer write and the card tick both live inside the barrier. |
| e20 | The programmer wrote not one line of barrier code, |
| e20b | yet got a collector that marks while the program runs. |

## cost · 05 

预估 83.8 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| g1 | But clever is never free: the more often you collect, |
| g1b | the less memory you use, and the hotter the CPU burns. |
| g3 | Since it's all trade-offs, Nim simply lets you choose: |
| g3b | by default, reference counting plus a cycle collector. |
| g4 | Keep only the reference counting and you get ARC: no cycle-breaking cost, |
| g4b | but that cycle from before can never be freed. |
| g5 | Rust drops the collector entirely, |
| g5b | and lays down an iron law of ownership: every piece of memory has one owner. |
| g6 | The compiler writes the frees in at compile time; Nim's ARC does too, |
| g6b | except it's still counting at run time. |
| g7 | C and Zig are blunter: memory you allocate yourself, |
| g7b | you free yourself, and hand it back. |
| g8 | In computing, nobody gets a free lunch; |
| g8b | the bill just lands on different people. |
| g9 | Reference counting pays small change on every pointer update; |
| g9b | tracing collection pays for marking, pauses and barriers; |
| g10 | and ownership and manual management take the runtime's bill |
| g10b | and hand it to the people writing code, and to the compiler. |

## close · 无章节卡

预估 72.4 秒。

| 句号 | 字幕 / 旁白原文 |
|---|---|
| h1 | Back to the first question: how does it know memory is no longer needed? |
| h1b | It doesn't. All it knows is whether it can still find it, right now. |
| h4 | McCarthy's founding 1960 paper only dared to call it *reclamation*; |
| h4b | a footnote came only with a later re-typesetting: |
| h5 | "We already called this process 'garbage collection', |
| h5b | but I guess I chickened out of using it in the paper, |
| h6 | or else the Research Laboratory of Electronics grammar ladies |
| h6b | wouldn't let me." |
| h7 | Over sixty years, from pauses of several seconds |
| h7b | to more than a hundred a second that nobody notices, |
| h7c | seeking, between an unknowable future and strict hardware, the most elegant balance. |
| h8 | This is the art of garbage collection. |
| gCredit | （无旁白；画面停留） |

## 交审核对

- 标题、开头和结尾回答同一个问题。
- 术语第一次出现有解释；因果、适用范围、版本和数字对应 FACTS.md。
- 根据句号逐条核对译文，记录简化与推断；片尾名单留足阅读时间。
- 有疑问的地方逐条写入 NOTES.md，关闭意见后由指定校对者明确确认。
