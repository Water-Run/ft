# 事实

取证日期：2026-10-18。对象是垃圾回收（GC）的基本概念、几种主要机制、它们在真实运行时里的样子，以及这些想法从哪来。本文件只登记陈述和依据，不规定片子的结构、时长分配、画面或措辞。

论文只读摘要的条目会写明「只读摘要」；运行实验的记录在 `research/lab/`。来源编号见 `sources.json`。

## 取证环境

| 材料 | 固定点 |
|---|---|
| CPython 实验 | Windows x64，CPython `3.14.3`（MSC v.1944 64 bit）。脚本 `research/lab/01_python_refcount.py`，回显 `out_01_python_refcount.txt` |
| Go 实验 | Windows amd64，`go1.27.0`。脚本 `research/lab/02_go_trace.go`，回显 `out_02_go_trace.txt`；运行时设 `GODEBUG=gctrace=1` |
| 论文 | McCarthy 1960 读全文 PDF；Collins 1960、Cheney 1970、Dijkstra 1978 只读出版社摘要；Lieberman & Hewitt 1983 读全文 HTML |
| 运行时文档 | Go 的指南自述描述 Go 1.19；V8 文章发表于 2019-01-03；Python 文档是 3.15（页面最后更新 2026-10-18）；Java 文档是 JDK 21；Swift 与 Rust 读官方书的当前版本 |

## 什么算垃圾

| 陈述 | 依据 | 状态 |
|---|---|---|
| 垃圾回收器替程序回收内存：它找出程序不再需要的那部分内存，把它变回可分配的空间 | `go-gc-guide` Introduction | 已读 |
| 追踪式 GC 从 roots（栈上的局部变量、全局变量等）出发，沿指针访问对象；能被访问到的叫 reachable/live，访问不到的叫 unreachable | `go-gc-guide` Tracing Garbage Collection | 已读 |
| 对象与指向对象的指针组成 object graph；扫描（scanning）就是走这张图 | `go-gc-guide` 同上 | 已读 |
| 标记—清扫（mark-sweep）先标记所有可达对象，再遍历整个堆，把未标记的内存收回；Go 的 GC 是非移动的（non-moving） | `go-gc-guide` 同上 | 已读 |
| V8 的 major GC 分 marking、sweeping、compacting 三步；sweeping 把死对象留下的空隙加入 free-list，compaction 复制存活对象以消除碎片 | `v8-trash-talk` Major GC | 已读 |
| “垃圾”不等于“没用了”或“被置零”：判断依据是可达性；一个对象即使程序逻辑上不再使用，只要还有指针能到达，追踪式 GC 就不会收它 | `go-gc-guide`；`v8-trash-talk` 的 reachability 段 | 已读；这是对两处定义的归纳 |

## 引用计数

| 陈述 | 依据 | 状态 |
|---|---|---|
| 1960 年 Collins 的论文处理 LISP 列表的“重叠”与擦除：用穿插的引用计数（interspersed reference counts）描述一段列表被多少地方共享，从而只擦除不再被共享的部分 | `collins-1960` 摘要 | 只读摘要 |
| 引用计数的基本动作：每次新增一个指向对象的引用就加一，删除就减一；计数到零就立即释放 | `python-gc-docs` Introduction；`swift-arc` How ARC Works | 已读 |
| CPython 主要用引用计数；`gc` 模块的收集器是补充，用来处理引用计数回收不了的环 | `python-gc-docs` Introduction | 已读 |
| 实验：`a = Node("A")` 后 `sys.getrefcount(a)` 为 2；`b = a` 后为 3；`del b` 后回到 2。`getrefcount()` 本身会加一个临时引用 | `python-lab` 第 1 节 | 已复现 |
| 实验：最后一个引用 `del a` 后，`__del__ A` 立即打印，weakref 立即变成 `None`；不需要等一次 GC | `python-lab` 第 2 节 | 已复现 |
| 实验：X、Y 互相指向，形成环；各自 `sys.getrefcount` 为 3；删掉外部名字后 weakref 仍指向 X；`gc.collect()` 返回 2，之后 weakref 为 `None`，`gc.garbage` 为空 | `python-lab` 第 3 节 | 已复现 |
| 引用计数不能回收环：Lieberman & Hewitt 明确写 reference count systems cannot reclaim circular structures；Swift 文档也写两个 class 实例互相强引用会造成 strong reference cycle，计数不会降到零，实例不释放 | `lieberman-1983` Introduction；`swift-arc` Strong Reference Cycles | 已读 |
| Swift 的 ARC 只作用于 class 实例；最后一个强引用移除后立即释放；用 weak/unowned 打破强引用环；weak 在实例释放后自动变 `nil` | `swift-arc` How ARC Works、Resolving Strong Reference Cycles | 已读 |
| Python 的 `gc` 把对象分成三代；新对象在 generation 0，活过一次收集就进入更老的代；阈值按分配减释放的计数触发 | `python-gc-docs` set_threshold | 已读 |
| Python 3.14 一度移除 generation 1，3.14.5 又把它恢复成与 3.13 一致；本次实验是 3.14.3，不能把 3.15 文档的代际细节当成 3.14.3 的精确行为 | `python-gc-docs` get_objects、set_threshold 的 versionchanged；`python-lab` | 已读；版本差异是本次核查的边界 |

## 追踪、清扫、复制、压实

| 陈述 | 依据 | 状态 |
|---|---|---|
| McCarthy 1960 年的 LISP 用一张 free-storage list 管理列表寄存器；初始约 15,000 个寄存器；需要新寄存器时从表头取，FREE 指向下一个 | `mccarthy-1960` c. Free-Storage List | 已读全文 |
| 当 free-storage list 耗尽时，LISP 启动一次 reclamation cycle：从 base registers 出发，把所有能访问到的寄存器的符号位改成负；然后扫过整个列表存储区，把符号位没变的寄存器放回 free list，再把可达寄存器的符号位改回正 | `mccarthy-1960` 同上 | 已读全文 |
| 该论文说这次回收“需要好几秒才能执行”，所以一次至少要回收几千个寄存器，否则程序会把大部分时间花在回收上 | `mccarthy-1960` 同上 | 已读全文 |
| 论文脚注 7 写：我们早就把这个过程叫“garbage collection”，但我在论文里没敢用这个词——否则研究实验室的语法女士不会放过我 | `mccarthy-1960` 脚注 7 | 已读全文；原文是英文 |
| 标记—清扫不移动对象，会留下空洞；V8 的 sweeping 把空洞按大小放进 free-list，分配时按需找合适大小的块 | `v8-trash-talk` Sweeping | 已读 |
| 复制式收集把存活对象搬到另一半空间（from-space → to-space），在原位置留 forwarding pointer，最后交换两半；代价是一半空间闲置 | `v8-trash-talk` Minor GC (Scavenger)；`lieberman-1983` 第 2 节对 Baker 算法的描述 | 已读 |
| Cheney 1970 的算法是非递归的列表压实/复制算法：利用正在构建的部分结构记录已经复制过的列表，避免递归 | `cheney-1970` 摘要 | 只读摘要 |
| V8 的 major GC 在标记、清扫之后，按碎片程度选择一部分页面做压实，把存活对象复制到别的页面；不是所有页面都压实 | `v8-trash-talk` Compaction | 已读 |
| Go 的 GC 是非移动的 mark-sweep；它不搬对象，因此没有 forwarding pointer，也不靠压缩消除碎片 | `go-gc-guide` Tracing Garbage Collection | 已读 |
| “标记—清扫会压实”是错的；压实是 mark-compact 或 copying collector 的动作，mark-sweep 本身不搬对象 | `go-gc-guide`；`v8-trash-talk` | 本文件归纳 |

## 分代

| 陈述 | 依据 | 状态 |
|---|---|---|
| Lieberman & Hewitt 1983 年的摘要：短寿命对象占存储使用的一大部分；应当让短寿命对象的存储比长寿命对象更便宜，按对象寿命优化收集器 | `lieberman-1983` 摘要 | 已读全文 |
| 该文把地址空间划成小区域（regions），按 generation 组织；新对象在 creation region；condemned/obsolete 区域里的可达对象被疏散到 evacuation region；老区域收集得少，新区域收集得多 | `lieberman-1983` 第 3、5 节 | 已读全文 |
| 该文用 entry table 记录从老代指向新代的指针，避免每次收集都扫描整个老代；这也是后来 remembered set / card marking 一类做法的早期形态 | `lieberman-1983` 第 4 节 | 已读全文；与 remembered set 的对应是本文件归纳 |
| V8 把堆分成 young（nursery、intermediate）和 old；对象先在 nursery，活过一次 GC 进 intermediate，再活过一次进 old | `v8-trash-talk` Generational layout | 已读 |
| V8 明确写“大多数对象死得早”（The Generational Hypothesis），并说这不只适用于 V8/JavaScript，也适用于大多数动态语言 | `v8-trash-talk` Generational layout | 已读 |
| V8 的 Scavenger 只收集 young generation；用 semi-space，一半空着；用 write barrier 维护 old-to-new 引用列表，避免每次扫描整个老代 | `v8-trash-talk` Minor GC (Scavenger) | 已读 |
| Java G1 是分代、增量、并行、mostly concurrent、stop-the-world、evacuating 的收集器；堆分成等大的 region，young/old 是逻辑代 | `java-g1-guide` Basic Concepts、Heap Layout | 已读 |
| Python 也分三代；但 CPython 的主要机制仍是引用计数，`gc` 的代数收集是补充 | `python-gc-docs` | 已读 |
| “所有 GC 都分代”是错的：Go 的指南描述的是非移动 mark-sweep，没有分代设计；是否分代是实现选择，不是 GC 的定义 | `go-gc-guide`；`python-gc-docs`；`v8-trash-talk` | 本文件归纳 |

## 三色与并发

| 陈述 | 依据 | 状态 |
|---|---|---|
| Dijkstra 等 1978 年的论文让一个额外处理器与执行计算的处理器并发完成垃圾检测与收集，并尽量弱化排除与同步约束 | `dijkstra-1978` 摘要 | 只读摘要 |
| Go 1.5 的收集器是并发的三色 mark-sweep；文章明确把想法归给 Dijkstra 1978 | `go15gc` The Embellishment | 已读 |
| 三色：开始时所有对象白色；从 roots 可达的对象染灰；取一个灰对象，把它染黑，扫描它的指针，把指向的白对象染灰；重复到没有灰对象；此时白色对象不可达 | `go15gc` 同上 | 已读 |
| 并发时 mutator 会改指针，必须维持“黑对象不能指向白对象”的不变式；否则收集器可能漏掉已经装进已扫描区域的对象 | `go15gc` 同上 | 已读 |
| write barrier 是 mutator 改堆里的指针时运行的一小段代码；Go 的写屏障把新变为可达的白对象染灰，保证它最终会被扫描 | `go15gc` 同上 | 已读 |
| Go 1.5 先尽量并发做，再短暂 stop-the-world 检查所有可能的灰色来源；文章把“找到最终 STW 与总工作量的平衡点”列为 Go 1.6 的主要工作 | `go15gc` 同上 | 已读 |
| V8 区分 parallel（主线程和 helper 同时做、仍 STW）、incremental（主线程间歇做一小段）、concurrent（主线程跑 JS、helper 在后台做）；三者可以组合 | `v8-trash-talk` Orinoco 的 Parallel/Incremental/Concurrent | 已读 |
| V8 的 concurrent marking 用 write barrier 记录 JS 在标记期间新建的引用；标记结束后主线程做一次快速的 marking finalization，再并行压实/清扫 | `v8-trash-talk` Major GC、State of GC in V8 | 已读 |
| Java G1 的 marking 用 SATB（Snapshot-At-The-Beginning）：在 Initial Mark 时给堆拍一个虚拟快照，标记期间变成不可达的对象仍按存活处理，留到下一次标记再收 | `java-g1-guide` Marking | 已读 |
| G1 明确不是 real-time collector；它尽力在较长时间内以高概率满足暂停目标，但不能保证每一次暂停都绝对满足 | `java-g1-guide` Introduction | 已读 |
| “三色”不是某一份代码的专利：它是一种描述并发标记进度的抽象/不变式，Go、G1、V8 的具体实现和屏障都不一样 | `go15gc`；`java-g1-guide`；`v8-trash-talk` | 本文件归纳；具体差异未逐行对照 |

## 真实运行时

| 陈述 | 依据 | 状态 |
|---|---|---|
| Go 用 `GOGC` 控制堆目标；默认 100，目标是 `Live heap + (Live heap + GC roots) * GOGC / 100`；调大 GOGC 换更少 GC CPU、更多内存，调小相反 | `go-gc-guide` GOGC | 已读 |
| Go 1.19 加入 `GOMEMLIMIT`/`SetMemoryLimit`，给运行时总内存设软上限；在此之前 GOGC 是唯一旋钮 | `go-gc-guide` Memory limit | 已读 |
| 实验：分配 200,000 个 node，保留每 200 个中的一个（1,000 个），强制每个 node 逃逸；运行期间发生 8 次 GC；本次回显 `out_02_go_trace.txt` 是 before `HeapAlloc=438,944`、`HeapObjects=250`、`NumGC=0`；after `HeapAlloc=633,552`、`HeapObjects=1,324`、`NumGC=8`。重跑会有小幅波动 | `go-lab` | 已复现，单机单次 |
| 实验的 gctrace 里能看到堆在 3–4 MB 目标附近反复 `3->4->0 MB`、`2->2->0 MB (forced)`；这是这次分配速率下的行为，不是普遍常数 | `go-lab` | 已复现，单机单次 |
| V8 的 Orinoco 在 2019 年已经用 parallel scavenging、concurrent marking、parallel compaction；文章说 parallel scavenger 把 young generation GC 的主线程总时间降低约 20%–50%，具体随负载 | `v8-trash-talk` State of GC in V8、Takeaways | 已读；数字是该文报告，不是本次测量 |
| Swift 用 ARC（引用计数），没有 tracing cycle collector；循环引用要靠 weak/unowned 或 capture list 打破 | `swift-arc` | 已读 |
| Rust 用所有权/借用做内存安全，不需要 garbage collector | `rust-ownership` 开头 | 已读 |
| Java G1 是默认收集器；它用 region、remembered set、SATB、evacuation，在吞吐与暂停之间取舍 | `java-g1-guide` | 已读 |

## 历史时间线

| 年份 | 事件 | 依据 | 状态 |
|---|---|---|---|
| 1960 | McCarthy 的 LISP 论文描述 free-storage list 与自动 reclamation；脚注说这个过程早就被叫作 garbage collection | `mccarthy-1960` | 已读全文 |
| 1960 | Collins 用穿插的引用计数处理列表重叠与擦除 | `collins-1960` 摘要 | 只读摘要 |
| 1970 | Cheney 给出非递归的列表压实/复制算法 | `cheney-1970` 摘要 | 只读摘要 |
| 1978 | Dijkstra 等发表 on-the-fly GC，让收集器与 mutator 并发 | `dijkstra-1978` 摘要 | 只读摘要 |
| 1978 | Baker 的 real-time copying collector（本次没有读 Baker 原文；Lieberman & Hewitt 的第 2 节转述了 fromspace/tospace、转发指针、scavenging） | `lieberman-1983` 第 2 节与参考文献 [4] | 转述，未读原文 |
| 1983 | Lieberman & Hewitt 发表按对象寿命分代的实时收集器 | `lieberman-1983` | 已读全文 |
| 2015 | Go 1.5 改用并发三色 mark-sweep，目标是把暂停压到 10 ms 以下 | `go15gc` | 已读 |
| 2019 | V8 的 Orinoco 文章总结 parallel/incremental/concurrent 的组合 | `v8-trash-talk` | 已读 |
| 2026 | 本次读到的 Python 3.15 文档、Go 1.27、JDK 21 G1 文档仍是这些机制的现行版本；版本差异另记 | `python-gc-docs`、`go-lab`、`java-g1-guide` | 已读 |

## 边界与常见误说

| 说法 | 核查结果 | 依据 |
|---|---|---|
| “GC 一发现垃圾就立刻释放” | 不准确。引用计数在计数到零时立即释放；追踪式 GC 要等到标记/清扫的某个时点。两种机制不要混 | `python-lab`；`go-gc-guide`；`v8-trash-talk` |
| “引用计数不是垃圾回收” | 广义上它是自动内存管理的一种；Go 的指南明确说 GC 可以指很多方法，例如 reference counting。本文把 tracing 与 refcount 并列讲，不把后者开除出 GC | `go-gc-guide` Introduction |
| “所有 GC 都会移动对象/压实” | 错。Go 的 GC 非移动；V8 只压实部分页面；mark-sweep 本身不搬 | `go-gc-guide`；`v8-trash-talk` |
| “Go 的 GC 是分代的” | 本次读到的 Go 1.19 指南描述的是非移动 mark-sweep，没有分代设计。不要用其他运行时的分代经验套 Go | `go-gc-guide` |
| “三色是一个具体算法，照着写就行” | 三色是并发标记的抽象/不变式；Go 的写屏障、G1 的 SATB、V8 的 concurrent marking 具体做法不同 | `go15gc`；`java-g1-guide`；`v8-trash-talk` |
| “Java G1 是实时收集器” | 错。Oracle 明确写 G1 is not a real-time collector，只是以高概率满足暂停目标 | `java-g1-guide` |
| “Python 的 gc 模块就是 Python 的全部 GC” | 不准确。CPython 主要是引用计数，`gc` 是补充的环收集器 | `python-gc-docs` |
| “Swift ARC 是追踪式 GC” | 错。ARC 是引用计数；没有 tracing cycle collector，环会泄漏 | `swift-arc` |
| “Rust 有隐藏的 GC” | 官方书开篇说 ownership 让 Rust 在没有 garbage collector 的情况下做内存安全；不要把它说成有 GC | `rust-ownership` |
| “停止世界（STW）一定很长” | 不一定。V8/Go/G1 都把大量工作放在并发/增量阶段，只在某些点短暂 STW；具体暂停取决于实现与负载 | `v8-trash-talk`；`go15gc`；`java-g1-guide` |
| “GC 暂停时间可以用一个固定数字概括” | 不行。本次只记录单机单次实验；没有做跨运行时、跨负载的基准 | `python-lab`；`go-lab` |

## 不进入定稿的句子

| 句子 | 原因 |
|---|---|
| 垃圾回收是 1959 年发明的 | 论文标注 April 1960；1959 是 LISP 系统的开发时间，不能把两者混为一个日期。写 1960 年论文 |
| McCarthy 在论文里创造了“garbage collection”这个词 | 脚注说“我们早就这样叫”，但论文里没用；不能说他在这篇论文里首创这个词 |
| Go 的 GC 暂停小于 1 毫秒 | 本次没有测 Go 的暂停分布；gctrace 的单次数字不能推广 |
| Java ZGC 的暂停小于 1 毫秒 | 本次没有读 ZGC 文档，也没有测量；不写 |
| Python 的环收集器是三色标记 | 本次没有读 CPython 的 collector 实现；文档只说是 supplement，不写三色 |
| 引用计数完全不会停顿 | 计数更新本身有开销，释放大对象也可能有成本；本次没有测量，不写“不会停顿” |
| “分代假设”是一条自然定律 | 它是经验观察/启发式，不是定律；V8 自己说它适用于大多数动态语言，不是所有程序 |
| 某个运行时“没有 GC 暂停” | 不写绝对化说法 |

## 文案审查

尚未写稿，未交审。写稿后按 `docs/script-review.md` 逐轮记录交审日期、稿本哈希、意见与明确确认；没有确认不配音。

## 制作署名

策划：WaterRun。2026-10-18 这次会话中的 DeepSeek Flash 运行 CPython 3.14.3 与 Go 1.27.0 实验、读取论文与运行时文档，并写下本目录的事实记录；没有写旁白。仓库：https://github.com/Water-Run/ft 。

## 复核

没有成片。等脚本与画面完成后，按 `docs/review.md` 第 5 节逐句、逐画面复核；本文件现在只完成取证阶段的交叉核查。
