# 事实

取证日期：2026-10-18（DeepSeek V4.1 Flash 1017）；2026-10-19 复核与补充（Claude Fable 5.1）。对象是垃圾回收（GC）的基本概念、几种主要机制、它们在真实运行时里的样子，以及这些想法从哪来。本文件只登记陈述和依据，不规定片子的结构、时长分配、画面或措辞。

每条陈述有编号；`src/js/script.js` 每句旁白的 `facts` 字段引用这些编号。论文只读摘要的条目写明「只读摘要」；运行实验的记录在 `research/lab/`。来源编号见 `sources.json`。

## 取证环境

| 编号 | 材料 | 固定点 |
|---|---|---|
| E01 | CPython 实验 | Windows x64，CPython `3.14.3`（MSC v.1944 64 bit，非 free-threaded）。脚本 `lab/01_python_refcount.py`、`lab/05_python_refcount_raw.py`，回显同名 `out_*.txt` |
| E02 | Go 实验 | Windows amd64，`go1.27.0`。`lab/02_go_trace.go`（运行时设 `GODEBUG=gctrace=1`）；`lab/03_go_writebarrier.go`（只编译，`go build -trimpath -gcflags=-S`，取 `main.link` 的汇编清单） |
| E03 | V8 实验 | Node `v24.21.0`，V8 `13.6.233.17-node.53`。`lab/04_v8_trace_gc.js`，用 `node --trace-gc` 运行；trace 在 `out_04_v8_trace_gc.txt`，程序自己的汇总在 `out_04_v8_trace_gc.summary.txt` |
| E04 | Rust 实验 | `rustc 1.98.1`。`lab/06_rust_drop.rs`；回显含程序输出与 `--emit=mir` 中间表示里的 `drop` 调用行 |
| E05 | 论文 | McCarthy 1960 读全文（Stanford 重排版 PDF）；Dijkstra 等 1978 读全文（CACM 原版扫描 PDF 的提取文本）与 1975 年手稿 EWD520 的转录；Lieberman & Hewitt 1983 读全文 HTML；Collins 1960、Cheney 1970 只读出版社摘要 |
| E06 | 运行时文档与源码 | Go GC 指南（自述描述 Go 1.19）；Go 1.5 博客；Go 运行时源码（本机 `go1.27.0` 的 `src/runtime/mbarrier.go`、`mgc.go`、`extern.go`）；V8 Orinoco 文章（2019-01-03）；Python `gc` 文档（在线页为 3.15；另读 CPython 仓库 3.14 分支的 `Doc/library/gc.rst`）；JDK 21 G1 调优指南；Swift 语言书 ARC 章；Rust 语言书第 4 章；Lua 5.5 参考手册 §2.5、§6.2 与 5.1 手册 §2.10、lua.org 版本页、5.5 readme；Lua 5.5.0 源码 `lgc.h`、`lgc.c`、`lvm.c`、`lvm.h`、`lstate.c`、`lua.c` |
| E07 | Node 开场实验 | Windows x64，Node `v24.21.0`。`lab/07_node_heap_limit.js`：`churn` 模式用 `node --trace-gc` 运行，`hoard` 模式用 `node --max-old-space-size=64` 运行；回显 `out_07_node_churn.txt`（保留汇总行与首尾 trace 行）、`out_07_node_hoard.txt`（保留到 `FATAL ERROR` 一行，原生栈回溯删去） |
| E08 | Lua 实验与源码 | Lua `5.5.0`（lua.org 发布的 Windows x64 官方二进制；`lua -v` 为 `Lua 5.5.0  Copyright (C) 1994-2025 Lua.org, PUC-Rio`）。`lab/08_lua_gc_steps.lua`，回显 `out_08_lua_gc_steps.txt`。源码 `lua-5.5.0.tar.gz`（lua.org/ftp）解压在 `research/_src/`，不入库；引用的行号以该版本为准 |
| E09 | C# / .NET 实验 | Windows x64，.NET SDK 10.0.401，运行时 `.NET 10.0.12`（工作站 GC，后台 GC 默认开启，`GCSettings.LatencyMode = Interactive`）。`lab/09_dotnet_gc.cs` 是 .NET 10 的单文件程序，`dotnet run -c Release 09_dotnet_gc.cs -- <mode>`；`hoard` 模式设 `DOTNET_GCHeapHardLimit=0x4000000`，`wb` 模式设 `DOTNET_TieredCompilation=0 DOTNET_JitDisasm="*Link*"` 打印 JIT 汇编；回显 `out_09_dotnet_{churn,hoard,gen,wb}.txt` |
| E10 | PHP 实验 | PHP `8.5.10`（cli，ZTS，x64）。`lab/10_php_gc.php`：`count` 模式与 `-d memory_limit=64M` 的 `hoard` 模式；回显 `out_10_php_{count,hoard}.txt`（路径已替换成 `…/`） |
| E11 | Nim 实验 | Nim `2.2.12`，C 后端 gcc 16.2.0（MinGW-W64）。`lab/l11_nim_arc.nim`（Nim 模块名不能以数字开头，文件名前缀 l）；`--mm:arc` 与 `--mm:orc` 各编译运行一次，`--expandArc:scopeDemo --compileOnly` 打印编译器变换后的代码；回显 `out_11_nim_{arc,orc,expandarc}.txt` |
| E12 | Java 实验 | OpenJDK `27`（build 27+35-2325，2026-09-15；默认 G1）。`lab/12_java_gc.java` 单文件源码直接启动；`churn`、`-Xmx64m hoard`、`-Xmx64m mark` 三种模式都带 `-Xlog:gc`；回显 `out_12_java_{churn,hoard,mark}.txt`；默认参数取自 `java -XX:+PrintFlagsFinal -version` |
| E13 | 第 3 稿补读的文档 | .NET：Fundamentals of garbage collection、Garbage collector config settings、Background garbage collection、Workstation and server GC、`GC.GetGeneration` API、dotnet/runtime 的 BOTR Garbage Collection Design；PHP 手册：Reference Counting Basics、Collecting Cycles、`debug_zval_dump`、`memory_limit`、`gc_collect_cycles`、`gc_status`；Nim 2.2.12 自带的 `doc/mm.md`、`doc/destructors.md`；Oracle JDK 21 排障指南（OutOfMemoryError）；Zig 官网概述；cppreference 的 C `free`。Oracle 的 HotSpot GC 调优指南正文需要脚本渲染，本次没有读到（Z18） |

## G 什么算垃圾

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| G01 | 垃圾回收器替程序回收内存：它找出程序不再需要的那部分内存，把它变回可分配的空间 | `go-gc-guide` Introduction | 已读 |
| G02 | 追踪式 GC 从 roots（栈上的局部变量、全局变量等）出发，沿指针访问对象；能被访问到的叫 reachable/live，访问不到的叫 unreachable | `go-gc-guide` Tracing Garbage Collection | 已读 |
| G03 | 对象与指向对象的指针组成 object graph；扫描（scanning）就是走这张图 | `go-gc-guide` 同上 | 已读 |
| G04 | “垃圾”不等于“程序以后不用了”：追踪式 GC 判断的是可达性；一个对象即使逻辑上不再使用，只要还有指针能到达，就不会被收 | `go-gc-guide`；`v8-trash-talk` reachability 段 | 已读；对两处定义的归纳 |
| G05 | Dijkstra 等 1978 年的论文把执行计算的处理器叫 the mutator，把收集垃圾的处理器叫 the collector；收集器的一个大周期由 marking phase（标记）和 appending phase（把未标记的节点接回空闲表）组成 | `dijkstra-1978` 第 1 节、第 3 节 | 已读全文 |
| G06 | “垃圾回收”可以指很多方法，引用计数也在其中；本片把追踪与引用计数并列讲 | `go-gc-guide` Introduction | 已读 |
| G07 | V8 的文章写收集器用可达性作为“活着”的代理：Garbage collectors do this by using reachability as a proxy for 'liveness'；当前可达的对象必须保留，不可达的可以回收。Go 指南写“可达”只是指扫描过程能发现它。旁白据此说“以后用不用说不准，能不能找到现在就能算” | `v8-trash-talk` Marking；`go-gc-guide` Tracing Garbage Collection | 已读；“说不准”是对 proxy 一词的归纳 |

## R 引用计数

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| R01 | 引用计数的基本动作：每多一个指向对象的引用就加一，少一个就减一；计数到零立即释放 | `python-gc-docs` 引言；`swift-arc` How ARC Works | 已读 |
| R02 | CPython（非 free-threaded 构建）把计数放在每个对象的开头：`object()` 占 16 字节，前 8 字节是 `ob_refcnt`。用 ctypes 直接读这 8 字节：`a = Node('A')` 后为 1；`b = a` 后 2；放进一个列表后 3；`del b` 后 2；清空列表后 1 | `python-raw-lab` 第 1 节 | 已复现 |
| R03 | `sys.getrefcount()` 比内存里的计数多 1，因为它的参数本身是一个引用；`01` 实验中的 2→3→2 对应内存里的 1→2→1 | `python-lab` 第 1 节；`python-raw-lab` 第 1 节 | 已复现 |
| R04 | 最后一个引用 `del a` 之后，`__del__ A` 立即打印，weakref 立即变成 `None`；不需要等任何一次 GC | `python-lab` 第 2 节；`python-raw-lab` 第 1 节 | 已复现 |
| R05 | X、Y 互相指向形成环。有外部名字时两者内存计数各为 2（名字 + 对方）；删掉外部名字后各停在 1，只剩对方在引用；weakref 仍指向 X | `python-raw-lab` 第 2 节；`python-lab` 第 3 节 | 已复现 |
| R06 | 引用计数回收不了环：Lieberman & Hewitt 写 reference count systems cannot reclaim circular structures；Swift 文档写两个 class 实例互相强引用形成 strong reference cycle，计数不会降到零，实例不释放 | `lieberman-1983` Introduction；`swift-arc` Strong Reference Cycles | 已读 |
| R07 | CPython 主要用引用计数；`gc` 模块的收集器是补充（supplements），用来处理引用计数回收不了的环；确定程序不产生环时可以禁用它 | `python-gc-docs` 引言；`python-gc-rst-314` 同段 | 已读 |
| R08 | `01` 实验先做一次基线收集，再建环并删名字：`gc.collect()` 返回 2，之后 weakref 为 `None`，`gc.garbage` 为空。`05` 实验没有基线收集，同样的环之后 `gc.collect()` 返回 45，多出的是解释器启动遗留的环 | `python-lab` 第 3 节；`python-raw-lab` 第 3 节 | 已复现；旁白说“返回 2”时画面必须用 `out_01` 的输出并先交代“先清一次场”，不能用 `out_05` 的 45 |
| R09 | Swift 的 ARC 只作用于 class 实例；最后一个强引用移除后立即释放；用 weak/unowned 打破强引用环；weak 引用在实例释放后自动变 `nil` | `swift-arc` How ARC Works、Resolving Strong Reference Cycles | 已读 |
| R10 | Python 的 `gc` 把对象分成三代；新对象在 generation 0，活过一次收集进入更老的代；按分配减释放的计数触发。3.14.0 起 threshold2 被忽略、generation 1 被移除、`collect(1)` 是一次增量；3.14.5 恢复成与 3.13 一致。本机 3.14.3 的 `gc.get_threshold()` 为 `(2000, 10, 0)`，`DEBUG_STATS` 打印三组计数 `4701 3877 0` | `python-gc-rst-314` set_threshold / get_objects / collect 的 versionchanged；`python-raw-lab` 第 3 节 | 已读、已复现；3.14.3 与 3.15 文档的代际细节不同，不写精确行为 |
| R11 | 1960 年 Collins 的论文处理 LISP 列表的重叠与擦除：用穿插的引用计数（interspersed reference counts）记录一段列表被多少处共享 | `collins-1960` 摘要 | 只读摘要 |
| R12 | CPython 收集器自己的日志格式：`gc: collecting generation 2...`、`gc: objects in each generation: …`、`gc: done, 45 unreachable, 0 uncollectable, 0.0006s elapsed` | `python-raw-lab` 第 3 节 | 已复现，单机单次 |

## T 追踪、清扫、复制、压实

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| T01 | McCarthy 1960 年的 LISP 用一条 free-storage list 管理列表存储单元（论文称 registers）；初始约 15,000 个；程序里有一个 FREE 寄存器指向表头，要新单元就取表头、FREE 指向下一个 | `mccarthy-1960` c. Free-Storage List | 已读全文 |
| T02 | 空闲表用完才开始 reclamation cycle：从一组 base registers 出发，沿 car–cdr 链把能到达的每个单元的符号改成负；再扫过整片列表存储区，把符号没变的放回空闲表，把可达单元的符号改回正 | `mccarthy-1960` 同上 | 已读全文 |
| T03 | 论文说这个过程“需要好几秒才能执行”（requires several seconds to execute），因此一次至少要收回几千个单元，否则程序会把大部分时间花在回收上 | `mccarthy-1960` 同上 | 已读全文 |
| T04 | 脚注 7 的原文：We already called this process "garbage collection", but I guess I chickened out of using it in the paper—or else the Research Laboratory of Electronics grammar ladies wouldn't let me. 它挂在 “a reclamation cycle starts” 一句上。所读 PDF 是作者后来用 LaTeX 重排的版本，首页注明 Copied with minor notational changes from CACM, April 1960；同一文件里其他回顾性脚注标有“1995:”。脚注 7 是第一人称回顾口吻，不能写成 1960 年原刊的脚注 | `mccarthy-1960` 脚注 7、首页星号注、脚注 3–5 | 已读全文；提法见 Z09 |
| T05 | 标记—清扫（mark-sweep）先标记所有可达对象，再遍历整个堆，把未标记的内存收回；Go 的 GC 是非移动的（non-moving）mark-sweep | `go-gc-guide` Tracing Garbage Collection | 已读 |
| T06 | `02` 实验：分配 200,000 个节点，保留每 200 个中的一个（1,000 个），强制每个节点逃逸到堆；运行期间发生 8 次 GC。before `HeapAlloc=438,944`、`HeapObjects=250`、`NumGC=0`；after `HeapAlloc=633,552`、`HeapObjects=1,324`、`NumGC=8` | `go-lab` | 已复现，单机单次 |
| T07 | `GODEBUG=gctrace=1` 每次收集打印一行，格式 `gc # @#s #%: #+#+# ms clock, #+#/#/#+# ms cpu, #->#-># MB, # MB goal, …`。三段 clock 时间分别是 stop-the-world 的 sweep termination、并发的 mark and scan、stop-the-world 的 mark termination；`#->#-># MB` 是 GC 开始时的堆、结束时的堆、活着的堆；行尾 `(forced)` 表示由 `runtime.GC()` 触发 | `go-runtime-src` `extern.go` 的 gctrace 说明 | 已读（go1.27.0 源码） |
| T08 | `02` 实验的 trace：前 7 次形如 `3->4->0 MB, 4 MB goal`（活堆不足 1 MB，四舍五入成 0），第 8 次 `2->2->0 MB … (forced)` | `go-lab` | 已复现，单机单次 |
| T09 | 清扫不搬对象，死对象留下空洞；V8 的 sweeping 把空洞按大小记进 free-list，分配时找合适大小的块 | `v8-trash-talk` Sweeping | 已读 |
| T10 | 复制式收集把存活对象从一半空间搬到另一半（from-space → to-space），在原位置留 forwarding pointer，最后交换两半；代价是一半空间闲置 | `v8-trash-talk` Minor GC (Scavenger)；`lieberman-1983` 第 2 节对 Baker 算法的转述 | 已读 |
| T11 | Cheney 1970 给出非递归的列表压实/复制算法：利用正在构建的部分结构记录已复制过的列表，避免递归 | `cheney-1970` 摘要 | 只读摘要 |
| T12 | V8 的 major GC 分 marking、sweeping、compacting；压实只对碎片程度高的部分页面做，把存活对象复制到别的页面，不是所有页面都压实 | `v8-trash-talk` Major GC、Compaction | 已读 |
| T13 | “标记—清扫会压实”是错的；压实是 mark-compact 或 copying collector 的动作，mark-sweep 本身不搬对象 | `go-gc-guide`；`v8-trash-talk` | 本文件归纳 |

## N 分代

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| N01 | Lieberman & Hewitt 1983 年的摘要：短寿命对象占存储使用的一大部分；应让短寿命对象的存储更便宜，按对象寿命优化收集器 | `lieberman-1983` 摘要 | 已读全文 |
| N02 | 该文把地址空间划成小区域，按 generation 组织；新对象在 creation region；被判定要回收的区域里的可达对象被疏散到 evacuation region；老区域收集得少，新区域收集得多 | `lieberman-1983` 第 3、5 节 | 已读全文 |
| N03 | 该文用 entry table 记录从老代指向新代的指针，避免每次收集都扫描整个老代；这是后来 remembered set / card marking 一类做法的早期形态 | `lieberman-1983` 第 4 节 | 已读全文；与 remembered set 的对应是本文件归纳 |
| N04 | V8 把堆分成 young（nursery、intermediate）和 old；对象先在 nursery，活过一次 GC 进 intermediate，再活过一次进 old | `v8-trash-talk` Generational layout | 已读 |
| N05 | V8 明确写“大多数对象死得早”（The Generational Hypothesis），并说这不只适用于 V8/JavaScript，也适用于大多数动态语言 | `v8-trash-talk` Generational layout | 已读 |
| N06 | V8 的 Scavenger 只收集 young generation；用 semi-space，一半空着；用 write barrier 维护 old-to-new 引用列表，避免每次扫描整个老代 | `v8-trash-talk` Minor GC (Scavenger) | 已读 |
| N07 | `04` 实验：分配 3,000,000 个小对象，每 4 个留 1 个（750,000 个）在数组里；再清空数组，分配 1,000,000 个用完即弃的对象。trace 共 23 行：21 次 `Scavenge`，2 次 `Mark-Compact`。第一行 `Scavenge 4.9 (6.0) -> 4.2 (7.0) MB … 0.34 / 0.00 ms`；第二次 Mark-Compact 一行含 `(+ 0.3 ms in 26 steps since start of marking …)`。整段 147 ms | `v8-lab` | 已复现，单机单次；只引用次数与字段原文，不把毫秒数当普遍结论 |
| N08 | Java G1 是分代、增量、并行、mostly concurrent、stop-the-world、evacuating 的收集器；堆分成等大的 region，young/old 是逻辑上的代 | `java-g1-guide` Basic Concepts、Heap Layout | 已读 |
| N09 | Python 也分三代，但 CPython 的主要机制仍是引用计数，`gc` 的代数收集是补充 | `python-gc-docs`；R07、R10 | 已读 |
| N10 | “所有 GC 都分代”是错的：Go 的指南描述的是非移动 mark-sweep，没有分代设计；是否分代是实现选择 | `go-gc-guide`；`python-gc-docs`；`v8-trash-talk` | 本文件归纳 |

## C 并发：三色与写屏障

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| C01 | Dijkstra、Lamport、Martin、Scholten、Steffens，On-the-Fly Garbage Collection: An Exercise in Cooperation，Communications of the ACM 21(11)，1978 年 11 月，966–975 页；1977 年 7 月收稿，1978 年 2 月修订。摘要：让一个额外处理器与执行计算的处理器并发完成几乎全部垃圾检测与收集工作，排除与同步约束尽量弱 | `dijkstra-1978` 题头、摘要、文末 | 已读全文 |
| C02 | 三种颜色：white、gray、black；“Gray is darker than white and lighter than black”；灰表示“半标记”，更准确地说是一项尚未完成的标记义务（unfulfilled marking obligation）；标记阶段里没有节点会变浅 | `dijkstra-1978` 第 4 节 | 已读全文 |
| C03 | 不变式 P1：no edge points from a black node to a white one（没有边从黑节点指向白节点） | `dijkstra-1978` 第 4 节与附录 | 已读全文 |
| C04 | “shading a node”指白变灰、灰黑不动。mutator 的动作 M1：把一个可达节点的出边改指向另一个已可达的节点，并给新目标 shade。论文说如果不这样做，刚放下的边会违反 P1 | `dijkstra-1978` 第 4 节 | 已读全文 |
| C05 | 收集器标记阶段对灰节点 i 的处理：给 i 的左右后继 shade，再把 i 变黑；标记结束后，appending phase 把未标记（白）的节点接回空闲表 | `dijkstra-1978` 第 4 节 C1.x、第 3 节 | 已读全文 |
| C06 | 同一算法的手稿 EWD520 日期为 1975 年 10 月 20 日，已有白/灰/黑、P1 与“引入边时 mutator 给目标 shade”的动作 A1 | `ewd520` 转录 | 已读转录 |
| C07 | Go 1.5 的收集器是并发的三色 mark-sweep，文章把想法归给 Dijkstra 1978：开始时所有对象白；从 roots 可达的染灰；取一个灰的染黑并扫描其指针，把指到的白对象染灰；没有灰的时白对象不可达。并发时要维持“黑对象不能指向白对象”；write barrier 是 mutator 改堆里指针时运行的一小段代码，把新变为可达的白对象染灰；Go 1.5 先尽量并发做，最后短暂 stop-the-world 检查；目标是把暂停压到 10 ms 以下 | `go15gc` The Embellishment | 已读 |
| C08 | Go 编译器为“可能落在堆对象里的指针字段”的写入生成写屏障调用；单个指针写入的屏障 `gcWriteBarrier` 用汇编实现。运行时的全局 `writeBarrier.enabled` 由编译器在调用屏障前检查 | `go-runtime-src` `mbarrier.go` 文件头；`mgc.go` 的 `writeBarrier` 结构体注释 | 已读（go1.27.0 源码） |
| C09 | Go 用混合屏障：Yuasa 式删除屏障（给被覆盖的旧目标 shade）加 Dijkstra 式插入屏障（给写入的新目标 shade）。源码里的伪码：`shade(*slot); if current stack is grey: shade(ptr); *slot = ptr`。注释说两次 shade 与条件合在一起，使 mutator 无法把对象藏过收集器；详细证明见 Go 提案 17503 | `go-runtime-src` `mbarrier.go` 第 24–60 行 | 已读（go1.27.0 源码） |
| C10 | `03` 实验：`a.next = b` 这一句编译成的 amd64 指令里，先 `CMPL runtime.writeBarrier(SB), $0`，开关为零就 `JEQ` 跳过；否则 `MOVQ (AX), CX` 取旧指针，`CALL runtime.gcWriteBarrier2(SB)`，把新指针 BX 与旧指针 CX 写进屏障缓冲；之后才是真正的写入 `MOVQ BX, (AX)` | `go-wb-lab`，`out_03_go_writebarrier.txt` 第 19–26 行 | 已复现（go1.27.0，-trimpath） |
| C11 | V8 区分 parallel（主线程和 helper 同时做、仍 stop-the-world）、incremental（主线程间歇做一小段）、concurrent（主线程跑 JS、helper 在后台做）；三者可以组合 | `v8-trash-talk` Orinoco 的 Parallel/Incremental/Concurrent | 已读 |
| C12 | V8 的 concurrent marking 用 write barrier 记录 JS 在标记期间新建的引用；标记结束后主线程做一次快速的 marking finalization，再并行压实/清扫。`04` 实验的 Mark-Compact 行写明标记分成了 25 和 26 个 step | `v8-trash-talk` Major GC、State of GC in V8；`v8-lab` | 已读、已复现 |
| C13 | Java G1 的 marking 用 SATB（Snapshot-At-The-Beginning）：在 Initial Mark 时给堆拍一个虚拟快照，标记期间变成不可达的对象仍按存活处理，留到下一次标记再收 | `java-g1-guide` Marking | 已读 |
| C14 | G1 明确不是 real-time collector；它尽力在较长时间内以高概率满足暂停目标，不能保证每一次暂停都满足 | `java-g1-guide` Introduction | 已读 |
| C15 | “三色”是描述并发标记进度的抽象与不变式，不是某一份代码：Go 的混合屏障、G1 的 SATB、V8 的 concurrent marking、Lua 的增量收集器具体做法不同 | C09、C12、C13、L04 | 本文件归纳；未逐行对照各家源码 |
| C16 | 并发标记丢掉活对象要两件事同时发生：黑对象新指向一个白对象，且原来从灰对象通向这个白对象的路径被删掉。Dijkstra 的插入屏障守前者（P1：黑不指白），Yuasa 式删除屏障守后者（给被覆盖的旧目标 shade）；Go 的 `mbarrier.go` 注释说两次 shade 与条件合起来 prevent a mutator from hiding an object。G1 的 SATB 不守 P1，守的是“开始时的快照”，所以 P1 是迪杰斯特拉的规矩，不是所有并发收集器的规矩 | C03、C04、C09（`mbarrier.go` 第 24–60 行）、C13 | 本文件归纳；旁白把规矩归到迪杰斯特拉名下，不说“所有收集器都这样” |

## L Lua：一份可读的增量三色源码

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| L01 | lua.org 版本页：Lua 5.1（2006-02-21）引入 incremental garbage collection；Lua 5.4（2020-06-29）加入 a new generational mode for garbage collection；Lua 5.5（2025-12-22）major garbage collections done incrementally。5.1 手册 §2.10：Lua implements an incremental mark-and-sweep collector | `lua-versions`；`lua-manual-51`；`lua-readme-55` | 已读 |
| L02 | 5.5 手册 §2.5：Lua 自动管理内存；收集器可以工作在两种模式 incremental 与 generational。§2.5.1：增量模式下每个 GC 周期 performs a mark-and-sweep collection in small steps interleaved with the program's execution；A unit of work corresponds roughly to traversing one slot or sweeping one object。§2.5.2：分代模式做频繁的 minor collection，只遍历最近创建的对象。`collectgarbage("incremental")` / `("generational")` 切换模式并返回之前的模式 | `lua-manual-55` §2.5、§6.2；本机 `doc/manual.html` 同文核对 | 已读 |
| L03 | `lgc.h` 第 18–23 行注释原文：Collectable objects may have one of three colors: white, which means the object is not marked; gray, which means the object is marked, but its references may be not marked; and black, which means that the object and all its references are marked. The main invariant of the garbage collector, while marking objects, is that a black object can never point to a white one. 颜色位 `WHITE0BIT`、`WHITE1BIT`、`BLACKBIT` 在第 79–81 行 | `lua-src-55` `lgc.h` | 已读源码 |
| L04 | 两种屏障：`luaC_barrier_`（`lgc.c` 第 234 行起，Barrier that moves collector forward, that is, marks the white object 'v' being pointed by the black object 'o'）与 `luaC_barrierback_`（第 265 行起，barrier that moves collector backward, that is, mark the black object pointing to a white object as gray again）。表的写入走后者：`lvm.h` 第 105 行 `luaV_finishfastset` 展开为 `luaC_barrierback`，`lvm.c` 第 348、1925 行同；upvalue 赋值走前者（`lvm.c` 第 1297 行） | `lua-src-55` | 已读源码；源码没有说明表为何用后退屏障（Z13） |
| L05 | `singlestep` 注释：标记（propagate）阶段一步遍历一个对象；清扫阶段一步清扫 `GCSWEEPMAX`（20）个对象。`incstep` 注释：一个基本步把 step size 换成 units of work，循环执行 single step 直到做够这么多工作或完成一个周期。手册 §6.2：`collectgarbage("step", 0)` 执行一个基本步，增量模式下基本步对应当前 step size，本步结束一个周期时返回 true | `lua-src-55` `lgc.c` 第 1596–1612、1703–1728 行；`lua-manual-55` §6.2 | 已读 |
| L06 | `08` 实验：切到增量模式后先完整回收一次并停止自动触发；建 200,000 张活表（局部变量 `live` 可达）与 200,000 张随后置空的表，`collectgarbage("count")` 28,457 KB。反复 `collectgarbage("step", 0)`：第 419 步返回 true；第 300 步时仍是 28,458 KB，第 350 步时 14,239 KB，结束时 14,239 KB；活表完好（`live[1][1] = 1`，`#live = 200000`）。同一程序再跑一次，步数相同 | `lua-lab` | 已复现，单机；步数取决于该版本默认参数 |
| L07 | 库的初始模式是增量（`lstate.c` 第 361 行 `g->gckind = KGC_INC`）；独立解释器 `lua.c` 第 723–724 行在启动时 `lua_gc(L, LUA_GCGEN)` 切到分代，所以实验里 `collectgarbage("incremental")` 返回 `generational` | `lua-src-55` `lstate.c`、`lua.c`；`lua-lab` | 已读源码、已复现 |
| L09 | `singlestep`：`GCSpropagate` 下没有灰对象时进入 `GCSenteratomic`（`lgc.c` 第 1629–1631 行）；`GCSenteratomic` 这一步整段执行 `atomic()`，返回 `atomicstep`（第 1638–1644 行），`incstep` 遇到它立即 break（第 1719 行）——所以 419 步里有一步是不可切分的原子步。清扫阶段 `sweeplist`（第 896 行起）对每个对象判断 `isdeadm`：死的 `freeobj`，活的改回当前白色；因此第 350 步之后内存不再变化但周期仍走了几十步，是在把活表洗回白色。`lgc.h` 第 50–58 行 `keepinvariant` 的注释说清扫阶段可以破坏不变式（该注释把黑白写反了，画面不要截这一段） | `lua-src-55` `lgc.c`、`lgc.h` | 已读源码；步数分解由注释与回显归纳 |
| L08 | 手册 §2.5.1：pause 控制收集器等多久再开新一轮，A value of 200 means that the collector waits for the total number of bytes to double before starting a new cycle；调大让收集器更不积极。5.5.0 源码 `lgc.h` 第 191 行 `LUAI_GCPAUSE 250`、第 198 行 `LUAI_GCMUL 200`；本机 `collectgarbage("param", "pause")` 返回 250、`stepmul` 200、`stepsize` 9600 | `lua-manual-55` §2.5.1；`lua-src-55` `lgc.h`；`lua-lab` | 已读、已复现；旁白只说“几倍”，不说默认值 |

## D .NET（C#）

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| D01 | 文档：托管堆分 0、1、2 三代；新对象在第 0 代；活过第 0 代回收的对象升到第 1 代，活过第 1 代回收的升到第 2 代，第 2 代的幸存者留在第 2 代；大对象（85,000 字节及以上）在大对象堆（有时叫第 3 代），随第 2 代一起收；第 0 代回收最频繁，大多数对象在第 0 代就被收走 | `dotnet-gc-fundamentals` Generations、Survival and promotions | 已读 |
| D02 | 文档：分配是把堆指针加一个值，it's almost as fast as allocating memory from the stack；回收分标记（找出活对象）、重定位（更新引用）、压实（回收死对象的空间并把幸存对象挪到一起）三个阶段；Before a garbage collection starts, all managed threads are suspended；大对象堆通常不压实，设了硬上限时会自动压实 | `dotnet-gc-fundamentals` Memory allocation、What happens during a garbage collection | 已读 |
| D03 | 文档：后台 GC 只针对第 2 代，在一个或多个专用线程上进行，托管线程可以继续分配；期间第 0、1 代的回收叫前台 GC，前台 GC 时所有托管线程暂停；后台 GC 默认开启（`System.GC.Concurrent` / `DOTNET_gcConcurrent`） | `dotnet-background-gc`；`dotnet-gc-config` Background GC | 已读 |
| D04 | 文档：工作站 GC 是独立应用的默认；服务器 GC 在多个专用线程上收集，每个逻辑 CPU 一个堆和一个线程，各堆同时收集 | `dotnet-wks-svr`；`dotnet-gc-config` Workstation vs. server | 已读 |
| D05 | 文档：`DOTNET_GCHeapHardLimit`（环境变量，十六进制）/ `System.GC.HeapHardLimit` 是 GC 堆与簿记的最大提交字节数，只对 64 位 | `dotnet-gc-config` Heap hard limit | 已读 |
| D06 | `09` churn（Release）：一秒钟（1001 ms）创建 67,000,000 个用完即弃的对象；`GC.GetTotalMemory` 0.1 → 10.8 MB；第 0 代回收 136 次，第 1、2 代各 0 次。Debug 配置下两次为 38,560,000 / 78 次与 59,140,000 / 120 次 | `dotnet-lab` `out_09_dotnet_churn.txt` | 已复现，单机单次；只说“这一秒” |
| D07 | `09` hoard：`DOTNET_GCHeapHardLimit=0x4000000`（64 MiB），同样的对象全部留在 List 里；1,000,000 个时 38.6 MB；分配第 1,048,577 个对象时抛出 `System.OutOfMemoryException`，用时 679 ms，其间第 2 代回收 5 次 | `dotnet-lab` `out_09_dotnet_hoard.txt` | 已复现，单机单次 |
| D08 | `09` gen：`GC.GetGeneration(o)` 对新对象返回 0；一次第 0 代回收后 1；一次第 1 代回收后 2；再一次第 2 代回收后仍是 2；`GC.MaxGeneration = 2`。API 文档：GetGeneration(Object) 返回对象当前所在的代号 | `dotnet-lab` `out_09_dotnet_gen.txt`；`dotnet-getgeneration` | 已复现 |
| D09 | `09` wb：Release 下 `Lab.Link(Node,Node)`（函数体只有 `a.Next = b`）的 JIT 汇编共 11 字节、四条指令：`lea rcx, bword ptr [rcx+0x08]`（算出 `Next` 字段的地址）、`call CORINFO_HELP_ASSIGN_REF`、`nop`、`ret`；第二个参数 `b` 留在 `rdx` 里原样递给辅助函数，方法体里没有别的写指令，所以赋值本身在这个辅助函数里完成（由清单推断）。Debug 下同一方法也含 `call CORINFO_HELP_ASSIGN_REF`。BOTR：The GC uses cards for the older generation marking. Cards are set by JIT helpers during assignment operations——这是分代用的记卡屏障，不是三色标记的涂灰屏障 | `dotnet-lab` `out_09_dotnet_wb.txt`；`dotnet-botr-gc` Mark phase | 已复现（.NET 10.0.12 x64）；第 3 稿曾写成“三条指令”，对抗审稿指出清单里还有一条 `nop`，已更正；“这个辅助函数就是写屏障”由 BOTR 的 JIT helpers 一句归纳 |

## P PHP

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| P01 | 手册：变量存在 zval 里，refcount 记录有多少符号指向它；赋给另一个变量 refcount 加一，离开作用域或 unset 减一；refcount 到零时容器销毁。手册的环例子：数组引用自己，unset 后 refcount 从 2 降到 1，没有外部符号能再清理它，形成泄漏 | `php-refcounting` | 已读 |
| P02 | `debug_zval_dump()` 显示的 refcount 比调用处高 1，因为按值传参本身加了一个引用（手册：it will show a refcount one higher than in the calling scope）。`10` 实验：`$a = new Node('A')` 显示 refcount(2)，`$b = $a` 后 3，放进数组后 4，`unset($b)` 后 3，清空数组后 2，`unset($a)` 时立即打印 `__destruct A` | `php-debug-zval-dump`；`php-lab` `out_10_php_count.txt` | 已读、已复现；画面显示原始值时注明“多 1” |
| P03 | 手册：PHP 5.3 起实现 Bacon & Rajan 论文 Concurrent Cycle Collection in Reference Counted Systems 里的同步算法：可能的根放进 root buffer（标紫），缓冲区满（固定 10,000 个）时运行；试减 refcount 并标灰，再检查：为零标白、大于零恢复并标黑，白的释放；`gc_collect_cycles()` 可强制收集，手册字面为 Returns number of collected cycles（8.5.0 起不再计入间接收走的字符串与资源）；本实验一个 X↔Y 环返回 2，与析构的对象数一致，旁白说“报收了 2 个”不说“2 个环” | `php-cycles`；`php-gc-collect-cycles`；`php-lab` | 已读、已复现；返回值的计数单位以回显为准 |
| P04 | `10` 实验：X、Y 互指后 `unset($x, $y)` 没有析构；`gc_status()` 为 runs=0 collected=0 roots=2；`gc_collect_cycles()` 打印 `__destruct X`、`__destruct Y` 并返回 2；之后 runs=2 collected=2 roots=0 | `php-lab` `out_10_php_count.txt`；`php-gc-status` | 已复现；runs 含脚本开头的基线那次 |
| P05 | 手册：`memory_limit` 是脚本允许分配的最大字节数，默认 128M。`10` hoard：`-d memory_limit=64M`，400,000 个对象时 `memory_get_usage` 57.2 MB（224 ms），随后 `PHP Fatal error:  Allowed memory size of 67108864 bytes exhausted (tried to allocate 4096 bytes)` | `php-ini-core`；`php-lab` `out_10_php_hoard.txt` | 已读、已复现 |

## M Nim

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| M01 | 文档 mm.md：ORC is the default memory management strategy，主要基于引用计数，环由基于 trial deletion 的环收集机制处理；不用 tracing 算法，运行时行为与堆、栈大小无关。`--mm:arc` 与 ORC 机制相同但 leaves out the cycle collector，大致说变量离开作用域时内存就释放；可选模式还有 `refc`（延迟引用计数加 Mark&Sweep 后备）、`markAndSweep`、`boehm`、`go`、`none`（Allocated memory is simply never freed） | `nim-mm` | 已读（2.2.12 自带文档） |
| M02 | 文档：`--expandArc:functionName` 可查看编译器对函数做的 ARC/ORC 变换；destructors.md：`--mm:arc|orc` 下 `ref` 通过同一套运行时钩子即引用计数实现，环结构不能立即释放（`--mm:orc` ships with a cycle collector），`cursor` 可声明式打破环 | `nim-mm`；`nim-destructors` | 已读 |
| M03 | `11` expandArc：`scopeDemo` 被变换成 try/finally：内层 block 结束处 `=destroy(b)`；`let c = a` 变成 `=copy(c, a)`；proc 结束处 `=destroy(c)`、`=destroy(a)`——析构调用是编译器插进去的 | `nim-lab` `out_11_nim_expandarc.txt` | 已复现（Nim 2.2.12） |
| M04 | `11` 运行：ARC 与 ORC 下 B 都在内层作用域结束时析构，A 在 proc 结束时析构（destroyed = 2）。环 X↔Y 置空后：ARC 下 `GC_fullCollect()` 之后 destroyed 仍为 2，环泄漏；ORC 下打印 `=destroy Y`、`=destroy X`，destroyed = 4 | `nim-lab` `out_11_nim_arc.txt`、`out_11_nim_orc.txt` | 已复现 |

## J Java

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| J01 | 本机 OpenJDK 27 `-XX:+PrintFlagsFinal`：`UseG1GC = true`（ergonomic）、`MaxGCPauseMillis = 200`（default）、`InitiatingHeapOccupancyPercent = 45`、`G1HeapRegionSize = 8388608`。`-Xlog:gc` 每次回收一行，如 `GC(0) Pause Young (Normal) (G1 Evacuation Pause) 8M->2M(16M) 2.729ms` | `java-lab`；`out_12_java_churn.txt` | 已复现 |
| J02 | `12` churn：一秒钟创建 287,530,000 个用完即弃的对象；年轻代回收 16 次；已用堆 143.5 MB（默认最大堆按本机内存算出约 10 GB） | `java-lab` | 已复现，单机单次 |
| J03 | `12` hoard：`-Xmx64m`，2,000,000 个对象时已用 60.4 MB（231 ms）；日志连续出现 `Pause Full (G1 Compaction Pause) 63M->63M(64M)`，随后 `Exception in thread "main" java.lang.OutOfMemoryError: Java heap space`。Oracle 排障指南：Java heap space 表示对象无法在 Java 堆里分配，不一定是泄漏，可能只是堆配得不够（-Xms / -Xmx） | `java-lab` `out_12_java_hoard.txt`；`java-oom` | 已复现、已读 |
| J04 | `12` mark：留住 700,000 个活对象再不停制造垃圾，日志出现一个并发标记周期：`GC(6) Pause Young (Concurrent Start) (G1 Humongous Allocation) … 4.899ms`（周期以一次年轻代暂停开头）→ `GC(7) Concurrent Mark Cycle` → 期间年轻代回收照常（GC(8) 8.532ms、GC(9) 2.183ms、GC(10) 4.376ms）→ `GC(7) Pause Remark 22M->22M(28M) 1.474ms` → `GC(7) Pause Cleanup 25M->25M(45M) 0.030ms` → `GC(7) Concurrent Mark Cycle 22.553ms`。标记大部分并发；周期自身的停顿是开头一次、收尾两次，期间年轻代的停顿照旧 | `java-lab` `out_12_java_mark.txt` 第 9–16 行；`java-g1-guide`（C13、C14，mostly concurrent） | 已复现，单机单次；毫秒数只作画面原文；第 3 稿曾写“只停两个点”，对抗审稿指出开头的 Concurrent Start 也是停顿，已更正 |

## K 没有收集器：C、Zig、Rust

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| K01 | C：`free(ptr)` 释放此前由 malloc、calloc、aligned_alloc 或 realloc 分配的空间；释放时机由程序员写出。Rust 语言书第 4 章：没有 GC 的语言里，由我们判断内存何时不再使用并显式释放 | `c-free`；`rust-ownership-4-1` Memory and Allocation | 已读 |
| K02 | Zig 官网概述：There is no hidden control flow, no hidden memory allocations, no preprocessor, and no macros；小节标题 Manual memory management | `zig-overview` | 已读 |
| K03 | Rust：所有权规则与编译期插入的 `drop`，见 U05、U06 | — | 已有 |

## U 真实运行时与代价

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| U01 | Go 用 `GOGC` 控制堆目标；默认 100，目标是 `Live heap + (Live heap + GC roots) * GOGC / 100`，即活堆大约翻一倍时回收；调大 GOGC 换更少 GC CPU、更多内存，调小相反 | `go-gc-guide` GOGC | 已读 |
| U02 | Go 1.19 加入 `GOMEMLIMIT` / `SetMemoryLimit`，给运行时总内存设软上限；在此之前 GOGC 是唯一旋钮 | `go-gc-guide` Memory limit | 已读 |
| U03 | V8 的 Orinoco 在 2019 年已经用 parallel scavenging、concurrent marking、parallel compaction；文章说 parallel scavenger 把 young generation GC 的主线程总时间降低约 20%–50%，随负载不同 | `v8-trash-talk` State of GC in V8、Takeaways | 已读；数字是该文报告，不是本次测量 |
| U04 | Swift 用 ARC，没有追踪式的环收集器；循环引用要靠 weak/unowned 或 capture list 打破 | `swift-arc` | 已读 |
| U05 | Rust 通过所有权在没有垃圾回收器的情况下保证内存安全：规则由编译器检查，违反就不能编译；“None of the features of ownership will slow down your program while it's running”；三条规则：每个值有一个 owner、同一时刻只有一个 owner、owner 离开作用域时值被 drop；Rust 在右花括号处自动调用 `drop` | `rust-ownership` 第 4 章开头；`rust-ownership-4-1` Ownership Rules、Memory and Allocation | 已读 |
| U06 | `06` 实验：内层作用域结束时打印 `drop B`，`main` 结束时打印 `drop A`；`let c = a` 的移动不释放任何东西。MIR 里能看到编译器插入的 `drop(_2)`（内层作用域末尾）、`drop(_11)`（main 末尾）和 `_11 = move _1`；被移走的 `_1` 在正常路径上没有 drop | `rust-lab` | 已复现（rustc 1.98.1） |
| U07 | Java G1 是默认收集器；它用 region、remembered set、SATB、evacuation，并以暂停时间目标为约束 | `java-g1-guide` | 已读 |
| U08 | CPython = 引用计数 + 补充的环收集器；Swift = 引用计数，不补环收集器；Go = 非移动、非分代、并发的 mark-sweep；V8 = 分代 + 并行/增量/并发；Java G1 = 分代、region、暂停目标；Lua = 增量三色 mark-sweep，可切到分代模式；Rust = 无收集器、编译期插入释放 | R07、U04、T05、N10、N04、C11、N08、L02、U05 | 本文件归纳，各条有一手依据 |

## V 分配速度与堆上限（开场实验）

| 编号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| V01 | `07` 实验 churn 模式：一秒钟（1000 ms）内循环创建 318,210,000 个用完即弃的小对象；`heapUsed` 从 4.1 MB 到 4.3 MB；`--trace-gc` 共 12,143 行 `Scavenge`、0 行 `Mark-Compact`，每行形如 `Scavenge 5.0 (7.0) -> 4.0 (7.0) MB … 0.02 / 0.00 ms` | `node-heap-lab` `out_07_node_churn.txt` | 已复现，单机单次；计数与次数只作画面原文，不推广（Z14） |
| V02 | `07` 实验 hoard 模式：`--max-old-space-size=64`，同样的对象全部保留在数组里；500,000 个时 `heapUsed` 32.8 MB（32 ms），1,000,000 个时 64.1 MB（60 ms）；139 ms 时进程以 `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory` 终止，退出码 134；之前的 Last few GCs 是两次 `Mark-Compact (reduce)` | `node-heap-lab` `out_07_node_hoard.txt` | 已复现，单机单次 |
| V03 | 两个模式只差一件事：对象是否仍被数组引用（可达）。churn 里对象立刻不可达，年轻代回收不断收回它们；hoard 里对象始终可达，收集器无法回收，直到撞上堆上限 | V01；V02；G02；G04 | 本文件归纳 |
| V04 | 四个运行时撞上内存上限时的原话：PHP `Allowed memory size of 67108864 bytes exhausted`；Java `java.lang.OutOfMemoryError: Java heap space`；.NET `System.OutOfMemoryException`；Node `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`。第 3 稿开场用 .NET 的 churn / hoard（D06、D07）讲机制，其余三行只作画面拼贴 | P05；J03；D07；V02 | 已复现 |

## H 历史时间线

| 编号 | 年份 | 事件 | 依据 | 状态 |
|---|---|---|---|---|
| H01 | 1960 | McCarthy 的 LISP 论文（CACM 1960 年 4 月；脚注说系统写于 1959 年初）描述 free-storage list 与自动 reclamation | `mccarthy-1960` | 已读全文 |
| H02 | 1960 | Collins 用穿插的引用计数处理列表重叠与擦除 | `collins-1960` 摘要 | 只读摘要 |
| H03 | 1970 | Cheney 给出非递归的列表压实/复制算法 | `cheney-1970` 摘要 | 只读摘要 |
| H04 | 1975 | Dijkstra 等人的 on-the-fly GC 手稿 EWD520（10 月 20 日） | `ewd520` | 已读转录 |
| H05 | 1978 | 该文发表于 CACM 21(11)，收集器与 mutator 并发，白/灰/黑与“黑不指白” | `dijkstra-1978` | 已读全文 |
| H06 | 1978 | Baker 的 real-time copying collector（本次没有读 Baker 原文；Lieberman & Hewitt 第 2 节转述了 fromspace/tospace、转发指针、scavenging） | `lieberman-1983` 第 2 节与参考文献 [4] | 转述，未读原文 |
| H07 | 1983 | Lieberman & Hewitt 发表按对象寿命分代的实时收集器 | `lieberman-1983` | 已读全文 |
| H08 | 1995 | McCarthy 用 LaTeX 重排 1960 年论文，加入回顾性脚注（含“garbage collection”一条） | `mccarthy-1960` 首页星号注与脚注 | 已读全文；年份取自同文件其他脚注的“1995:”标记，脚注 7 本身未标年份 |
| H09 | 2015 | Go 1.5 改用并发三色 mark-sweep，目标是把暂停压到 10 ms 以下 | `go15gc` | 已读 |
| H10 | 2019 | V8 的 Orinoco 文章总结 parallel/incremental/concurrent 的组合 | `v8-trash-talk` | 已读 |
| H11 | 2026 | 本次读到的 Python 3.15 / 3.14 文档、Go 1.27 源码、JDK 21 G1 文档、Lua 5.5.0 源码仍是这些机制的现行版本 | E05、E06、E08 | 已读 |
| H12 | 2006 | Lua 5.1（2 月 21 日）引入增量垃圾回收 | `lua-versions`；`lua-manual-51` | 已读 |
| H13 | 2020 | Lua 5.4（6 月 29 日）加入分代模式 | `lua-versions` | 已读 |
| H14 | 2025 | Lua 5.5（12 月 22 日）：大收集改为增量完成 | `lua-versions`；`lua-readme-55` | 已读 |

## X 边界与常见误说

| 编号 | 说法 | 核查结果 | 依据 |
|---|---|---|---|
| X01 | “GC 一发现垃圾就立刻释放” | 不准确。引用计数在计数到零时立即释放；追踪式 GC 要等到标记/清扫的某个时点 | R04；T05；T09 |
| X02 | “引用计数不是垃圾回收” | 广义上它是自动内存管理的一种；Go 的指南明确说 GC 可以指很多方法，例如 reference counting | G06 |
| X03 | “所有 GC 都会移动对象/压实” | 错。Go 的 GC 非移动；V8 只压实部分页面；mark-sweep 本身不搬 | T05；T12；T13 |
| X04 | “Go 的 GC 是分代的” | 本次读到的 Go 1.19 指南描述的是非移动 mark-sweep，没有分代设计 | N10 |
| X05 | “三色是一个具体算法，照着写就行” | 三色是并发标记的抽象/不变式；Go 的混合屏障、G1 的 SATB、V8 的 concurrent marking 各不相同 | C15 |
| X06 | “Java G1 是实时收集器” | 错。Oracle 明确写 G1 is not a real-time collector | C14 |
| X07 | “Python 的 gc 模块就是 Python 的全部 GC” | 不准确。CPython 主要是引用计数，`gc` 是补充的环收集器 | R07 |
| X08 | “Swift ARC 是追踪式 GC” | 错。ARC 是引用计数；没有追踪式环收集器，环会泄漏 | U04 |
| X09 | “Rust 有隐藏的 GC” | 官方书说 ownership 让 Rust 在没有 garbage collector 的情况下做内存安全；释放点由编译器在编译期插入 | U05；U06 |
| X10 | “停止世界（STW）一定很长” | 不一定。V8/Go/G1 都把大量工作放在并发/增量阶段，只在某些点短暂停止；具体暂停取决于实现与负载 | C07；C11；T07 |
| X11 | “GC 暂停时间可以用一个固定数字概括” | 不行。本次只记录单机单次实验；没有做跨运行时、跨负载的基准 | T06；N07 |
| X12 | “写屏障让每次赋值都变慢很多” | 本次没有测量。能说的是：Go 的屏障在收集器不标记时只剩一次比较和一次跳转 | C10 |
| X13 | “Lua 5.5 默认是分代模式” | 要分开说：库创建状态时是增量模式，独立解释器 `lua.c` 启动时切到分代 | L07 |
| X14 | “JavaScript 一秒钟能创建三亿个对象” | 单机单次、特定循环的数字；旁白只说“这段程序、这一秒、三亿多个”，画面给原始行 | V01；Z14 |
| X15 | “.NET 的 GC 不压实 / 每次都把整个堆压实” | 回收时把幸存对象压实到一起，但大对象堆通常不压实；只在发现大量不可达对象时才压实 | D02 |
| X16 | “Nim 的 ARC 就是 Swift 的 ARC” | 名字都是引用计数，但 Nim 的 ARC 由编译器插入析构、带 move 语义，并有 ORC 环收集器可选；本片不比较两者 | M01–M04 |
| X17 | “G1 日志里的毫秒数就是典型暂停时间” | 单机单次、64 MB 小堆；只作画面原文，旁白只说“两个很短的点” | J04；Z10 |
| X18 | “PHP 和 CPython 的环收集器一样” | 两者都是引用计数加环收集器，但 PHP 用 Bacon–Rajan 的同步算法，CPython 的实现本次没有读；旁白只说“都另外补一个收集器找环” | P03；Z05；Z19 |
| X19 | “标记—清扫不用碰垃圾” | 错。标记只碰活的，但清扫要线性扫过整个堆，死的活的都摸一遍；“不碰死对象”是复制式收集的特点 | T02；T05；T10；L09 |
| X20 | “.NET 那段 `CORINFO_HELP_ASSIGN_REF` 就是三色标记的涂灰屏障” | 它是分代用的记卡屏障（写入并标脏卡），和三色标记的 shade 是两种写屏障；旁白把它接回卡表 | D09；C15 |
| X21 | “追踪式 GC 只在扫描和停顿时付钱” | 不对。写屏障让追踪式收集器在每次改指针时也付一点钱（.NET 的辅助函数调用、Lua 的 `luaC_barrierback`、Go 的屏障），只是通常比引用计数便宜 | D09；L04；C08；X12 |

## Z 不进入定稿的句子

| 编号 | 句子 | 原因 |
|---|---|---|
| Z01 | 垃圾回收是 1959 年发明的 | 论文标注 April 1960；1959 是 LISP 系统的开发时间。写 1960 年论文 |
| Z02 | McCarthy 在论文里创造了“garbage collection”这个词 | 脚注说“我们早就这样叫”，但论文里没用；不能说他在这篇论文里首创这个词 |
| Z03 | Go 的 GC 暂停小于 1 毫秒 | 本次没有测 Go 的暂停分布；gctrace 的单次数字不能推广 |
| Z04 | Java ZGC 的暂停小于 1 毫秒 | 本次没有读 ZGC 文档，也没有测量 |
| Z05 | Python 的环收集器是三色标记 / 从根出发追踪 | 本次没有读 CPython 收集器的实现文档；文档只说它是 supplement。旁白只说“另外补一个收集器，专门找环” |
| Z06 | 引用计数完全不会停顿 | 计数更新本身有开销，释放大对象也可能有成本；本次没有测量 |
| Z07 | “分代假设”是一条自然定律 | 它是经验观察/启发式；V8 自己说它适用于大多数动态语言，不是所有程序 |
| Z08 | 某个运行时“没有 GC 暂停” | 不写绝对化说法 |
| Z09 | 1960 年的论文脚注里写着“garbage collection” | 该脚注出自作者后来的重排版（同文件回顾脚注标 1995），旁白只能说“多年后重新排版时加的脚注” |
| Z10 | V8 一次年轻代回收只要零点几毫秒 | 单机单次 trace 数字，不推广；画面可原样显示该行，旁白不概括成结论 |
| Z11 | Dijkstra 1978 发明了“写屏障”这个词 | 该文说的是 mutator 的 shading 动作；“write barrier”一词出自后来的文献与 Go/V8 文档，本次未考证首次出现 |
| Z12 | Rust 比 GC 语言更快 / 更省内存 | 本次没有比较；只说“编译器在编译期决定释放点，运行期没有收集器” |
| Z13 | Lua 的表用后退屏障，是因为表改得频繁 | 源码注释没有给出原因，本次未读其他资料；旁白只说屏障有两种方向 |
| Z14 | 一秒钟创建三亿个对象 / 一万两千次回收，作为普遍结论 | 单机单次实验（V01）；旁白用“三亿多”“一万两千多次”并限定在“这段程序”“这一秒” |
| Z15 | churn 模式里程序“完全没有停顿” | 每次 Scavenge 仍是短暂的停止世界；旁白只说“程序自己从头到尾没管过这件事” |
| Z16 | Lua 5.1 的源码里就有三色 | 本次只读 5.5.0 源码；5.1 只凭手册说“增量 mark-and-sweep”，旁白说“从 5.1 起就做增量回收” |
| Z17 | “.NET 一秒六千七百万、Java 一秒两亿八千万，所以 Java 更快” | 不同程序、不同堆配置，不可比；旁白只说“这一秒”，不比较语言 |
| Z18 | Java 年轻代的 eden 与两个幸存区、晋升年龄等细节 | HotSpot 调优指南正文需要脚本渲染，本次没有读到；只凭日志里的 Evacuation Pause 与 G1 指南说“疏散” |
| Z19 | “PHP 的环收集器和 CPython 一样” | 算法不同（X18） |
| Z20 | “C# 的写屏障只有三条指令” | 清单里是四条（含一条 `nop`），而且那是 `a.Next = b` 这个方法的全部，其中一条是调用辅助函数；辅助函数本身的代码本次没有读 |
| Z21 | “程序全程不知情 / 毫不知情”（.NET churn 的 136 次回收） | 第 0 代回收是前台 GC，每次都挂起所有托管线程；旁白只能说“程序自己一个字都没管” |
| Z22 | “G1 只停两个点” | 并发周期以一次年轻代暂停开头，收尾 Remark、Cleanup 两次，期间年轻代暂停照旧；旁白说“开头停一下，收尾停两下” |
| Z23 | “Nim 的 ARC 和 Rust 一样” | Rust 的 MIR 是 `move`，被移走的值不再 drop；Nim 的 ARC 由编译器插入计数加减（`=copy` / `=destroy`），运行期仍在数数 |

## 文案审查

2026-10-19：中文第 1 稿写定（`src/js/script.js`），每句带 `facts` 编号；同日 WaterRun 读第 1 稿后给出三条意见（不设“艺术在哪里”单独章节、章名与旁白点出机制名称、开场钩子加长），第 2 稿据此重写，新增 V 节与 L 节事实。随后 WaterRun 要求语言阵容按其熟悉度排序（GC 语言：Python、Lua、C#、PHP、Nim、Java、JavaScript；非 GC：Rust、Zig、C），并对文案做几轮对抗迭代：第 3 稿据此改写，新增 D、P、M、J、K 节与实验 09–12；Go 的 T06–T08、C07–C10、U01–U03 与 V8 的部分事实保留在本文件，第 3 稿不再旁白。 之后 WaterRun 又定：全片 4–7 分钟（第 4 稿五章）、配音与台词俏皮妩媚“赛博活泼”并用 MiniMax（第 5 稿）、整体要震撼有冲击感；三轮对抗审稿（事实审计、目标观众、运行时工程师）的意见处理后为第 6 稿（`cd70f324…`，6:59），对应更正见 D09、J04、C16、L09、X19–X21、Z21–Z23。交审材料见 `review/NOTES.md`，稿本哈希以 `review/script.zh.<哈希>.md` 为准。**2026-10-20：策划者交来第 8 稿**（文案由 Gemini 4 Argon 撰写），整稿替换第 7 稿旁白（`ef6363d1…`），事实编号映射沿用第 7 稿、逐句比对未发现新增事实主张；当日 10:43 WaterRun 明确确认（「接受。CSharp是为了配音。就这样落盘吧，我叫Opus开工」），并接受六项取舍。确认后准备方只做了一次不改含义的字幕断句：61 句超宽句拆成 142 句（逐字校验与确认稿一致），内容哈希更新为 `11b3303b…`，沿用同一确认依据。**本片改为委托制作**：受托模型 Claude Opus 5.5 负责配音、关键帧与分镜、场景实现、声音编排、封面、渲染封装、三项审查与 `DELIVERY.md`；准备方只交稿本、事实、视觉系统、逐句对应表与任务书。英文版本轮不做。

## 制作署名

策划：WaterRun。

| 参与模型 | 实际分工 |
|---|---|
| DeepSeek V4.1 Flash 1017（2026-10-18） | 事实测绘、Web Fetch 来源核对、CPython 3.14.3 与 Go 1.27.0 实验（01、02）、论文与运行时文档核对、叙事测绘、瑞士风格设计方向 |
| Claude Fable 5.1（2026-10-19） | 复核 McCarthy 1960 全文与脚注出处；读 Dijkstra 1978 全文与 EWD520 转录、Go 运行时源码、Rust 语言书第 4 章；补做实验 03（Go 写屏障汇编）、04（V8 trace）、05（CPython 原始计数）、06（Rust drop 与 MIR）；给事实编号；写中文第 1 稿、交审材料与反馈应用 F01–F15。同日按 WaterRun 意见改第 2 稿：读 Lua 5.5 手册与 5.5.0 源码，补实验 07（Node 分配速度与堆上限）、08（Lua 增量步数）。再按语言阵容要求改第 3 稿：读 .NET、PHP、Nim、Java 文档，补实验 09（.NET 10）、10（PHP 8.5）、11（Nim 2.2）、12（OpenJDK 27），并组织对抗迭代 |
| Gemini 4 Argon（网页端，2026-10-20） | **中文第 8 稿文案**：整稿重写，比第 7 稿更长、比喻更密（记账与账本、内存孤岛、冤杀、家规、垂帘式的退让）；收束 h5、h6 加引号，明确是 McCarthy 脚注的原文引用；03 章 d9 改成与 04 章 e10 呼应的悬念 |
| MiniMax M3.1 Flash（运行时标识 `minimax-M3.1-Flash-Preview`，2026-10-20） | **准备方辅助**：第 8 稿落盘与逐句核对（沿用第 7 稿的事实编号映射，未新增事实主张）；按「不改含义的字幕断句」把 61 句超宽句拆成 142 句（逐字校验与第 8 稿一致，续句停顿 0.05 s）；读法覆盖与 SAY 表；导出校对稿；核对时长与语速；选「可爱的女声」并合成 6 个候选的试听（定 `Chinese (Mandarin)_Sweet_Lady`）；视觉系统 `src/css/style.css`（瑞士风格，按 `research/STYLE.md`）；逐句对应表 `expect.zh.json`；任务书 `AGENTS.md` 与 `brief/01–06`。**关键帧、分镜构图、场景实现、配音、渲染与交付均由受托方做** |
| Claude Opus 5.5（2026-10-20） | **受托方**（`project.json` 的 `production.maker`）：执行配音（MiniMax，140 句）并回听，修正两处读法（「强行」、e16 的「一行」）；按策划者「不要和 XX 秒速通的瑞士风格与配乐同质化」的要求做三个方向的关键帧，策划者选定「内存条」后重做视觉系统；分镜细化、全部七个场景与常驻元素、换章动画；自写配乐 `tools/music.py` 与音效编排；英文译稿（策划者提醒本片双语之后，2026-10-20）与英文版画面文字；封面；渲染封装、成片后的三项审查与交付说明 `DELIVERY.md` |

尚未使用图像生成模型；后续参与者据实追加。仓库：https://github.com/Water-Run/ft 。

## 复核

### 取证阶段（准备方）

取证阶段只做了交叉核查。2026-10-19 的复核更正：原记录把 McCarthy 的“garbage collection”写成“论文脚注 7”，未说明它来自后来的重排版，已在 T04、H08、Z09 更正；Dijkstra 1978 由只读摘要改为已读全文（C01–C05）。同日第 2 稿新增：V01–V03（开场实验）、L01–L07（Lua 源码与手册）、G07（可达性是“活着”的代理）、H12–H14、X13–X14、Z13–Z16；Lua 的 `lgc.h` 注释逐字核对过本机解压的 5.5.0 源码。第 3 稿新增：D01–D09（.NET）、P01–P05（PHP）、M01–M04（Nim）、J01–J04（Java）、K01–K03（C、Zig、Rust）、L08、V04、X15–X18、Z17–Z20；.NET、PHP、Zig、cppreference 的网页与 Nim 自带文档都下载到 `research/_src/docs/`（不入库）逐句核对。

### 2026-10-20 成片复核（受托方 Claude Opus 5.5）

范围：画面上出现的每一个数字、版本、代码、终端回显、论文题名与引文，逐条对照本文件与 `research/lab/out_*` 原文（字面比对：取场景源码 `src/js/scenes/s0–s6` 里写死的字符串，再看 `look.js`、`sheets.js` 在对应时刻的截图；画面是时间的纯函数，截图与成片出自同一份源码）。旁白文字沿用已确认的第 8 稿，未改动。

| 画面内容（场景） | 依据 | 结论 |
|---|---|---|
| `67,000,000`、「一秒钟，六千七百万个」、「实测：.NET 10.0.12 · 1001 ms」（开场） | D06、`out_09_dotnet_churn` | 一致 |
| `64 MB`、`DOTNET_GCHeapHardLimit=0x4000000`、`keep.Add(new Node(n++));`（开场） | D05、D07、`lab/09_dotnet_gc.cs` 源码 | 一致；代码行取自实验源码原样 |
| 五道金线与计数 `gen2 GCs 0` → `5`、`1,048,577`、`System.OutOfMemoryException`、`(after 1,048,577 objects, 679 ms; gen2 GCs 5)`（开场） | D07、`out_09_dotnet_hoard` | 一致；回显截取原行的连续片段。原文只有总数 5，计数随五道金线逐次加一，各次的时刻是示意 |
| 报错墙四行：`hoard: System.OutOfMemoryException`；`PHP Fatal error:  Allowed memory size of 67108864 bytes exhausted` / `(tried to allocate 4096 bytes)`；`Exception in thread "main" java.lang.OutOfMemoryError: Java heap space`；`FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`；运行时版本 .NET 10.0.12、PHP 8.5.10、OpenJDK 27、Node 24.21.0 | V04、P05、J03、V02、E03/E07/E09/E10/E12 | 一致；PHP 行去掉行尾的本机相对路径与行号 |
| `Lab.Last = new Node(n++);`、循环两行源码（开场） | `lab/09_dotnet_gc.cs` | 一致 |
| `11 MB`、`heap 0.1 MB -> 10.8 MB; gen0 GCs 136, gen1 0, gen2 0`、`136 次`、0–1001 ms 轨道上 136 根刻度（开场） | D06 | 一致；「11 MB」是旁白的取整，原文 10.8 MB 同屏 |
| `ob_refcnt`、「前 8 字节」、`sys.getsizeof(object()) = 16 bytes`、`a = Node('A') raw = 1` … `del a -> __del__ A`、计数 1→2→3→2→1→0（01） | R02、R04、`out_05` | 一致 |
| X、Y 计数 1→2→1，`with names: raw X = 2 raw Y = 2`、`after del x,y: raw X = 1 raw Y = 1`（01） | R05、`out_05` | 一致（截去原行尾的括注） |
| `cycle: x.next = y, y.next = x, then unset(x, y):`、`(after unset x, y: no destructor ran)`、`gc_status before: runs=0 collected=0 roots=2`、`__destruct X/Y`、`gc_collect_cycles() = 2`（01） | P04、`out_10_php_count` | 一致 |
| `baseline gc.collect() -> 21`、`__del__ X/Y`、`gc.collect() -> 2`（01） | R08、`out_01` | 一致；按 R08 先亮基线，不用 `out_05` 的 45 |
| 「1960」「麦卡锡 · LISP」「McCarthy, CACM 3(4), April 1960」、free-storage list、FREE、base registers、符号位拨成负（02） | T01、T02、H01 | 一致；12 个单元是示意数量（论文为约 15,000 个），画面不标数量 |
| `… requires several seconds to execute …`（译：需要好几秒才能执行）（02） | T03 | 一致 |
| `Lua 5.5.0`、`before: 28457 KB (200000 live + 200000 unreachable tables)`、`cycle finished after 419 basic steps: 14239 KB`、`#live = 200000`、「28 MB」「14 MB」（02） | L06、`out_08` | 一致；20×20 格是示意的比例，不代表数量 |
| 「1983」「利伯曼 · 休伊特」、*A Real-Time Garbage Collector Based on the Lifetimes of Objects*、Henry Lieberman, Carl Hewitt、Communications of the ACM 26(6), 1983（03） | N01、H07、`sources.json` | 一致 |
| `gen: new object -> generation 0` 等四行、「0 代」「1 代」「2 代」（03） | D01、D08、`out_09_dotnet_gen` | 一致 |
| `gen0 GCs 136, gen1 0, gen2 0`（03） | D06 | 一致（原行片段） |
| 卡表、写入时打勾、只查打勾处（03） | D09、N03 | 一致；卡的数目是示意 |
| 「1978」「迪杰斯特拉等」、*On-the-fly garbage collection: an exercise in cooperation*、五位作者、Communications of the ACM 21(11), November 1978、the mutator / the collector（04） | C01、G05、`sources.json` | 一致 |
| 白「还没碰」、灰「碰过，下线还没碰」、黑「自己和下线全碰完」（04） | C02 | 一致 |
| 家规与 `no edge points from a black node to a white one`（译）、「Dijkstra 等, CACM 1978 · 不变式 P1」（04） | C03 | 一致 |
| 写屏障：黑→白写入时把白涂灰（04） | C04、C07 | 一致；旁白与画面都归到迪杰斯特拉的规矩，不说所有收集器都如此（C16） |
| `lgc.h` 第 17–23 行原文（含行号），`a black object can` / `never point to a white one` 标出，（译）（04） | L03 | 一致；未截第 50–58 行 |
| `lgc.c` 的 `luaC_barrierback_` 注释两行（04） | L04 | 一致 |
| 「四十万张表」「419 步」「300 步」「28 MB」「14 MB」，曲线：300 步时 28,458 KB、350 步时 14,239 KB，`after step 300: 28458 KB`、`after step 350: 14239 KB`（04） | L06、L09、`out_08` | 一致；300–350 步之间画成直线下降，原数据只有这两个采样点 |
| 增量：收集器一步、程序一段（04） | L02、L05、C11 | 一致 |
| G1：停顿按日志的毫秒比例画；周期自身停顿 Concurrent Start、Remark、Cleanup，期间年轻代停顿 GC(8)、GC(9)、GC(10)；日志四行原文（04） | J04、Z22、`out_12_java_mark` | 一致；时间轴按 0.526–0.554 s 线性映射 |
| `static void Link(Node a, Node b) { a.Next = b; }`、`lea rcx, bword ptr [rcx+0x08]`、`call CORINFO_HELP_ASSIGN_REF`、`nop`、`ret`、「4 条指令 · 11 字节」（04） | D09、`lab/09_dotnet_gc.cs` | 一致；源码在实验文件里写作 `public static void Link(Node a, Node b) { a.Next = b; }`，画面省去 `public` 修饰，函数体与签名原样 |
| 「写入 a.Next」「卡表打勾」在屏障里（04） | D09、X20 | 一致（D09 注明「由清单推断」） |
| 「真实的旋钮：Go 的 GOGC · Lua 的 pause」（05） | U01、L08 | 一致 |
| Nim 2.2.12 的七个 `--mm` 模式、默认 ORC、ARC 只留引用计数；`--mm:arc … destroyed = 2`、`--mm:orc =destroy Y/X … destroyed = 4`（05） | M01、M04、`out_11_nim_arc/orc` | 一致；ORC 两行把原文的缩进对齐到同一列 |
| 「Rust」「rustc 1.98.1」「所有权」、`_11 = move _1;`、`drop(_2) -> [return: bb4, unwind: bb15];`、`drop(_11) -> [return: bb10, unwind: bb15];`（05） | U05、U06、`out_06_rust_drop` | 一致（去掉行首的 MIR 行号） |
| `` `=destroy`(b) `` `` `=copy`(c, a) `` `` `=destroy`(c) `` `` `=destroy`(a) ``（05） | M03、`out_11_nim_expandarc` | 一致 |
| `free(ptr);`、「C · cppreference：free 释放此前由 malloc 等分配的空间」、*Manual memory management*、`There is no hidden control flow, no hidden memory allocations …`、ziglang.org（05） | K01、K02 | 一致 |
| 三张账单的条目（05） | R01、T03、D09、X21、U05、K01 | 与旁白 g9–g10 一致，不含数值 |
| 麦卡锡 1960 论文题名、`a reclamation cycle starts`、`Copied with minor notational changes from CACM, April 1960.`、脚注 7 全文、（译）（收束） | T04、H08、Z02、Z09 | 一致；画面只说「后来重排的版本」，不写 1995 年，也不说 1960 年原刊就有这条脚注 |
| 时间线 1960 标记—清扫、1978 三色、1983 分代、今天；「一停好几秒」「一秒 136 次 · .NET 10.0.12 · 那一秒」（收束） | T03、H01、H05、H07、D06 | 一致 |
| 片尾名单与 `github.com/Water-Run/ft` | 本文件「制作署名」 | 一致 |

未出现本机路径、主机名或用户名（回显已在 `research/lab/` 脱敏；PHP 那行的相对路径也去掉了）。没有使用「待核实」条目。未核查：无。
