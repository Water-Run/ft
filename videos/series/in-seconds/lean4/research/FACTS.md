# 事实出处

取证日期 2026-10-07 至 10-08。对象：Lean 4（4.34.1）、形式化证明的概念与沿革、本片自己在 Lean 里做的一组实验。

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。
实验脚本与完整回显在 `research/lab/`；取回的第三方源码在 `research/_src/`（不入库）。画面上的 Lean 源码、目标、报错、数字由 `tools/gen_data.py` 从这些回显生成（`src/js/data.js`），场景代码不手写。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| Lean 4 | 4.34.1（提交 `5045d0056413266e57c625dcd7c365b10e377c52`，2026-09-24 发布的稳定版；取证当日 GitHub 上最新的稳定版） | elan 4.2.4，工具链 `leanprover/lean4:v4.34.1`（`research/lab/proof/lean-toolchain`）。装在一个单独的目录里（`ELAN_HOME`），不改系统环境 |
| Lake | 5.0.0-src+5045d00（随工具链） | 同上 |
| 实验所在的系统 | Linux x86_64（`out_00_env.txt`） | 实验工程只依赖 Lean 自带的核心库，不依赖 Mathlib；回显里只有相对路径 |
| Lean 4 源码（数行数用） | 标签 `v4.34.1`，同一提交 | `04_kernel_size.sh` 稀疏克隆到 `research/_src/lean4`（不入库） |
| Mathlib 官方统计页 | 2026-10-07 12:33 UTC 取数 | `05_mathlib_stats.sh` |

重做一遍：装好 elan 后在 `research/lab/` 下依次运行 `00_env.sh` 至 `05_mathlib_stats.sh`，再运行 `python tools/gen_data.py`。`03_recheck.sh` 的耗时随机器而变；`05` 的三个数随 Mathlib 每日变化。

**实验工程** `research/lab/proof/`（`lake build` 通过）：

| 文件 | 内容 | 回显 |
|---|---|---|
| `SumOdd/Def.lean` | `sumOdd`：前 n 个奇数的和的递归定义 | — |
| `SumOdd/Test.lean` | 前 9 项与平方数并排；`testUpTo 1000001`（n = 0 … 1 000 000 逐个比较）；n = 0 … 200 的和 | `out_01_build.txt` |
| `SumOdd/Proof.lean` | 定理 `sumOdd_eq_sq (n : Nat) : sumOdd n = n ^ 2`，对 n 归纳，`rw [sumOdd, ih]` 后用 `grind` 收尾 | `out_01_build.txt` |
| `SumOdd/Trace.lean` | 同一份证明加 `trace_state`，打印每一步之前的目标 | `out_02_Trace.txt` |
| `SumOdd/Print.lean`、`Axioms.lean` | `#print` 证明项；`#print axioms` | `out_02_Print.txt`、`out_02_Axioms.txt` |
| `SumOdd/Wrong.lean`、`Wrong2.lean` | 假命题 `sumOdd 3 = 10` 分别配 `rfl` 与 `decide` | `out_02_Wrong.txt`、`out_02_Wrong2.txt`（退出码 1） |
| `SumOdd/Sorry.lean` | 用 `sorry` 跳过证明，再 `#print axioms` | `out_02_Sorry.txt` |
| `SumOdd/Kernel.lean` | 用元程序手工拼一个证明项（`Eq.refl 9`），以定理 `sumOdd 3 = 10` 的名义直接 `addDecl` 交给内核 | `out_02_Kernel.txt`（退出码 1） |
| `SumOdd/Name.lean` | 名字叫 `riemann_hypothesis`、命题是 `1 + 1 = 2` 的定理 | `out_02_Name.txt` |
| `SumOdd/Stats.lean` | 元程序：证明项的节点数；从定理出发沿「类型与值里引用到的常量」向下的依赖闭包 | `out_02_Stats.txt`（JSON） |
| `SumOdd/Count.lean` | 元程序：`SumOdd.Proof` 的环境里一共有多少条声明（与 `leanchecker --fresh` 重放的范围同一口径） | `out_02_Count.txt`（JSON） |

## 逐章

各表的列：句号或位置 ｜ 陈述 ｜ 原始出处与定位 ｜ 独立印证 ｜ 适用版本、环境与截至日期 ｜ 状态（核查日期均为 2026-10-07/08）。

### open（0:00–0:32）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用范围 | 状态 |
|---|---|---|---|---|---|
| o1；方点阵与算式 | 1 + 3 + 5 + 7 = 16 = 4²；前 n 个奇数的和等于 n² | 实验：`out_01_build.txt` 中 `Test.lean:4`、`:5` 两行回显相同（`[0, 1, 4, 9, 16, …]`）；一般情形即 `Proof.lean` 的定理，编译通过 | 数学上的标准结论；本片的归纳证明本身（t4–t6） | 对全部自然数 n | 已核实 |
| o2；`#eval testUpTo 1000001` 与 `true` | 从 n = 0 逐个比较到 n = 1 000 000，没有例外 | `out_01_build.txt` 中 `Test.lean:16:0: true`。`testUpTo` 按 `sumOdd` 的同一条递推边累加边与 `n ^ 2` 比较（直接调用 `sumOdd` 会做十亿量级的递归，故用累加） | — | Lean 4.34.1；范围含 n = 1 000 000 | 已核实 |
| o2 画面的刻度 10、100、…、1 000 000 | 视野里方点阵的边长（示意逐级放大） | 由场景按 t 计算，不是测量值；数字只是 10 的幂 | — | — | 示意，画面不作别的断言 |
| o3；斜线、问号 | 逐个去试不构成证明：自然数有无穷多个 | 数学常识 | — | — | 已核实 |
| 片名卡 | Lean 4；200 秒 | 片名；成片时长见 README | — | — | — |
| o4、o5；纸上的五行 | 证明是可以逐步核对的推理；历来由人核对。五行是本片自拟的归纳证明（n = 0；设对 k 成立；k² + (2k + 1) = (k + 1)²；故对 k + 1 成立） | 五行的内容与 Lean 的三个目标逐行对应（`out_02_Trace.txt`）。「历来由人核对」的依据：Hales《Formal Proof》第 1371 页对传统证明与同行评议的描述 | — | — | 已核实 |
| k1；「1998」「猜想提出于 1611 年 · 证明者 Hales 与 Ferguson」 | 开普勒猜想 1611 年由开普勒提出，1998 年由 Ferguson 与 Hales 证明 | Hales 等，*A formal proof of the Kepler conjecture*，arXiv:1501.02155v1（2015-01-09）第 1 页：「The booklet Six-Cornered Snowflake, which was written by Kepler in 1611, contains the statement of what is now known as the Kepler conjecture」「The truth of the Kepler conjecture was established by Ferguson and Hales in 1998」 | Flyspeck 完成公告（见 f3）：「first obtained by Ferguson and Hales in 1998」 | — | 已核实 |
| k1b；「300 页」「约 40 000 行程序」 | 证明有约 300 页正文，另依赖约四万行程序 | Thomas C. Hales，*Formal Proof*，Notices of the AMS 55(11)，2008 年 12 月，第 1378 页：「In addition to a 300-page text, the proof relies on about forty thousand lines of custom computer code.」 | Flyspeck 完成公告：「The proof relies on about 300 pages of text and on a large number of computer calculations.」 | 画面上 300 个小方块与 200 × 200 的方格只表示数量，不表示每页、每行的内容 | 已核实 |
| k2；「未能确认其正确」及出处行；程序块上的斜线 | 审稿人最终没能确认证明完全正确；程序没有被审稿人仔细检查 | 同上第 1378 页，转引《数学年刊》编辑的信：「They have not been able to certify the correctness of the proof, and will not be able to certify it in the future, because they have run out of energy to devote to the problem.」；同页：「To the best of my knowledge, the computer code was never carefully examined by the referees.」 | arXiv:1501.02155v1 第 1 页：「In the end, the proof was published without complete certification from the referees.」 | 画面上的中文是对引文的概括，不是逐字翻译；英文版写 Could not be certified | 已核实 |

### formal（0:32–1:04）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用范围 | 状态 |
|---|---|---|---|---|---|
| f1；大字「形式化证明」 | 形式化证明：每一步都写成式子，交给程序检查 | Hales《Formal Proof》第 1371 页：「A formal proof is a proof in which every logical inference has been checked all the way back to the fundamental axioms of mathematics.」 | Flyspeck 完成公告：「A formal proof is a mathematical proof that has been checked by computer from the foundational axioms of mathematics and primitive inference rules.」 | — | 已核实 |
| f1；右列的五行式子 | 纸上的五行各自对应的式子 | 第一行取自 `Proof.lean` 的定理声明；其余四行是 Lean 自己打印的目标与归纳假设（`out_02_Trace.txt`），经 `gen_data.py` 原样进入画面 | — | Lean 4.34.1 | 已核实 |
| f2；「1968 · Automath · N. G. de Bruijn · 埃因霍温」 | Automath 于 1968 年提出，让计算机核对证明 | Geuvers 与 Nederpelt，*Characteristics of de Bruijn's early proof checker Automath*，arXiv:2203.01173，摘要：「The 'mathematical language' Automath, conceived by N.G. de Bruijn in 1968, was the first theorem prover actually working and was used for checking many specimina of mathematical content.」 | 埃因霍温理工大学 Automath 档案 AUT001：N.G. de Bruijn，*AUTOMATH, a language for mathematics*，Department of Mathematics, Eindhoven University of Technology，Publishing date: November 1968（`win.tue.nl/automath/archive/webversion/aut001/aut001.html`） | 旁白只说「让计算机开始核对证明」，不说「第一个」 | 已核实 |
| f3；「2014 · 全部通过机器检查 · HOL Light · Isabelle」 | 开普勒猜想的证明于 2014 年完成形式化 | Flyspeck 完成公告，Thomas Hales 2014-08-10 的邮件（mizar-forum 存档 `mizar.uwb.edu.pl/forum/archive/1408/msg00001.html`）：「We are pleased to announce the completion of the Flyspeck project, which has constructed a formal proof of the Kepler conjecture.」「The formalization project covers both the text portion of the proof and the computer calculations.」落款日期 August 10, 2014 | arXiv:1501.02155v1 摘要：「a formal proof of the Kepler conjecture … in a combination of the HOL Light and Isabelle proof assistants. This paper constitutes the official published account of the now completed Flyspeck project.」 | — | 已核实 |
| f3；轴上 2003–2014 的朱红线与「Flyspeck」 | Flyspeck 于 2003 年 1 月宣布 | arXiv:1501.02155v1 第 1 页：「At the Joint Math Meetings in Baltimore in January 2003, Hales announced a project to give a formal proof of the Kepler conjecture」 | — | 线的起点取 2003 年，终点取 2014 年 | 已核实 |
| f4；「2013 · Lean 立项 · 微软研究院 · Leonardo de Moura」 | Lean 于 2013 年始于微软研究院 | *The Lean Language Reference*（lean-lang.org/doc/reference/latest/Introduction/，取证时为 4.35.0-rc4 版）History 一节：「Leonardo de Moura launched the Lean project when he was at Microsoft Research in 2013, and Lean 0.1 was officially released on June 16, 2014.」 | de Moura 等，*The Lean Theorem Prover (system description)*，CADE-25（2015）摘要：「Lean is a new open source theorem prover being developed at Microsoft Research and Carnegie Mellon University, with a small trusted kernel based on dependent type theory.」 | — | 已核实 |
| f4；字样「L∃∀N」 | 项目的标志把 E、A 写成 ∃、∀ | lean-lang.org 首页导航栏的标志（内嵌 SVG，一笔连成 L、∃、∀、N 四个字形；2026-10-08 取回并渲染核对） | — | 画面上是用本片的等宽字体照这个写法排的四个字符，不是标志的复制 | 已核实 |
| f5；「2023 · Lean 4.0 发布」「证明助手」「编程语言」 | Lean 4 于 2023 年发布；既是证明助手也是编程语言 | 同上 History：「Development of Lean 4 began in 2018, culminating in the 4.0 release on September 8, 2023.」；lean-lang.org 首页：「Lean is an open-source programming language and proof assistant …」 | GitHub 发布接口：`v4.0.0` 的 `published_at` 为 2023-09-08T04:44:41Z | — | 已核实 |
| f6；代码五行 | 定义与命题写成 Lean | `research/lab/proof/SumOdd/Def.lean`、`Proof.lean` 的原文 | 编译通过（`out_01_build.txt`） | Lean 4.34.1 | 已核实 |

### types（1:04–1:36）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用范围 | 状态 |
|---|---|---|---|---|---|
| t1、t2；「证明 : 命题」「值 : 类型」 | 在 Lean 里命题是类型，证明是这个类型的一个值（项） | *Theorem Proving in Lean 4*，Propositions and Proofs 一章「Propositions as Types」：「To formally express a mathematical assertion in the language of dependent type theory, we need to exhibit a term `p : Prop`. To prove that assertion, we need to exhibit a term `t : p`. Lean's task, as a proof assistant, is to help us to construct such a term, `t`, and to verify that it is well-formed and has the correct type.」 | 实验：`out_02_Print.txt` 里定理的值是一个项；`out_02_Wrong.txt` | 旁白用「值」，文档用 term（项） | 已核实 |
| t3；`theorem wrong : sumOdd 3 = 10 := rfl` 与报错 | 检查证明就是检查类型：假命题配上 `rfl`，Lean 报类型不符 | `out_02_Wrong.txt` 后六行（`error: Type mismatch … but is expected to have type sumOdd 3 = 10`），画面只去掉行首的「文件:行:列」 | `out_02_Wrong2.txt`：`decide` 判定该命题为假 | Lean 4.34.1。同一文件前四行的另一条报错（Not a definitional equality）未上画面 | 已核实 |
| t3；九个方点与 `sumOdd 3 = 9` | 前 3 个奇数的和是 9 | `out_01_build.txt` 中 `Test.lean:4` 回显的第 4 项 | 1 + 3 + 5 = 9 | — | 已核实 |
| t4；`⊢ sumOdd 0 = 0 ^ 2`；「sumOdd 0 = 0 = 0²」 | 归纳的第一步：n = 0 | `out_02_Trace.txt` 第一个目标；`Test.lean:4` 回显的第 1 项是 0 | — | — | 已核实 |
| t5；`k : Nat`、`ih : …`、`⊢ sumOdd (k + 1) = (k + 1) ^ 2` | 归纳的第二步：由 k 推 k + 1 | `out_02_Trace.txt` 第二个目标 | — | — | 已核实 |
| t6；`⊢ k ^ 2 + (2 * k + 1) = (k + 1) ^ 2`；方点图与「2k + 1」 | 多出的一圈是 2k + 1 个 | `out_02_Trace.txt` 第三个目标（`rw [sumOdd, ih]` 之后）；(k + 1)² − k² = 2k + 1；图上右边一列 k + 1 个、下边一行 k 个 | `grind` 证完该目标（编译通过） | 图上取 k = 5 | 已核实 |
| t7；「∀ n」与方点阵铺满全屏 | 两步证完，对全部 n 成立 | `Proof.lean` 编译通过，无剩余目标（`out_01_build.txt`）；证明项里用的是 `Nat.recAux`（`out_02_Print.txt`） | — | 铺满全屏的方点阵是示意 | 已核实 |

### kernel（1:36–2:08）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用范围 | 状态 |
|---|---|---|---|---|---|
| c1；「策略」「写给 Lean 的做法」「还不是证明本身」 | 策略是告诉 Lean 怎样构造证明项的指令，不是证明项本身 | *Theorem Proving in Lean 4*，Tactics 一章开头：「A proof term is a representation of a mathematical proof; tactics are commands, or instructions, that describe how to build such a proof. … tactics are instructions that tell Lean how to construct a proof term.」 | 实验：`out_02_Print.txt` | — | 已核实 |
| c2；证明项的原文；「3 347 个节点」「不同的子项 393 个」 | Lean 由这几行策略生成的证明项，按树展开有 3 347 个节点 | `out_02_Print.txt`（`#print`，`pp.proofs true`）；`out_02_Stats.txt`：定理的值 1 445 个节点，策略生成的辅助声明 `sumOdd_eq_sq._proof_1_4` 的值 1 902 个节点，合计 3 347；结构相同的子项只数一次时合计 393 个 | 统计程序 `Stats.lean` 入库可复查 | Lean 4.34.1；换版本或换写法数目会变。旁白说「三千多个」 | 已核实 |
| c3；一格一个节点、朱红线扫过 | 内核对证明项做类型检查 | *The Lean Language Reference*，Elaboration and Compilation 一节：「Lean's trusted kernel is a small, robust implementation of a type checker for the core type theory.」 | 源码 `src/kernel/type_checker.cpp`（v4.34.1）对表达式逐层推断类型 | 画面上「自上而下逐格扫过」是示意，不代表内核实际的遍历次序（内核对相同的子项有缓存） | 已核实 |
| c4；「8 071 行 C++」「src/kernel · 36 个文件」「714 515 行」「src/Init · Std · Lean · lake」 | 内核的源码约八千行 | `out_04_kernel_size.txt`：v4.34.1 的 `src/kernel` 下 `.cpp` 与 `.h` 共 36 个文件、8 071 行；`src/Init`、`Std`、`Lean`、`lake` 四个目录的 `.lean` 文件合计 714 515 行（214 229 + 198 934 + 271 566 + 29 786） | CADE-25（2015）论文第 2 节记当时的内核第一层为「6k lines of C++ code」，量级相符 | 口径 `wc -l`，含空行与注释。内核运行还依赖 `src/runtime`（17 558 行）等，画面与旁白只说内核目录的行数。两个正方形的面积与行数成正比（边长取行数的 0.8 倍的平方根） | 已核实 |
| c5；「策略」「自动化」在大正方形里，「AI」在外，三条线通到内核 | 策略、自动化与 AI 都在内核之外，它们产出的声明要过内核 | 同上参考手册：「Before new inductive types or definitions are added to the environment by the command or term elaborators, they must be checked by the kernel to guard against potential bugs in elaboration.」；lean-lang.org 首页：「Lean's minimal trusted kernel guarantees absolute correctness in mathematical proof, software and hardware verification.」 | 实验 c6 | 线的走向是示意 | 已核实 |
| c6；`(kernel) declaration type mismatch` 等四行 | 错的证明项过不了内核 | `out_02_Kernel.txt`（`Kernel.lean` 绕过策略与繁饰，直接把 `Eq.refl 9` 当作 `sumOdd 3 = 10` 的证明交给内核），画面去掉行首的「文件:行:列: error: 」并把首行拆成两行 | — | Lean 4.34.1 | 已核实 |
| c7；「5 行」「3 347 个节点」「8 071 行」 | 人写策略，Lean 生成证明项，内核只看证明项 | 以上各条 | — | 「5 行」是 `Proof.lean` 里定理声明之后的行数 | 已核实 |

### trust（2:08–2:40）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用范围 | 状态 |
|---|---|---|---|---|---|
| r1；`sorry`、`warning: declaration uses `sorry`` | 跳过不证的地方会被记录 | `out_02_Sorry.txt` 第一行 | *The Lean Language Reference*，Validating a Lean Proof 一节：`sorryAx` 表示使用了 `sorry` 或证明不完整 | Lean 4.34.1 | 已核实 |
| r2；两次 `#print axioms` 及回显 | 一条命令列出定理依赖的全部公理 | `out_02_Sorry.txt` 第二行（`[sorryAx]`）；`out_02_Axioms.txt`（`[propext, Classical.choice, Quot.sound]`） | 同上一节：检查 `#print axioms` 只报出 `propext`、`Classical.choice`、`Quot.sound` 三条内置公理 | Lean 4.34.1 | 已核实 |
| r3；「2 565 条声明」与四行图例 | 这条定理向下依赖 2 565 条声明：定理 1 211，定义 1 033，归纳类型、构造子、递归子及商类型等 318，公理 3 | `out_02_Stats.txt` 的 `closure`：从 `sumOdd_eq_sq` 出发，取每条声明的类型与值里引用到的常量（归纳类型另计它的构造子），一路向下直到不再有新的；含定理自身 | 三条公理与 `#print axioms` 的结果一致（`gen_data.py` 里有断言） | Lean 4.34.1。口径是「类型与值里出现的常量」，与内核检查时实际展开的范围不是一回事 | 已核实 |
| r4；「66 200 条声明」、命令行、「全部通过 · 本机用时 62 秒」 | 核心库的六万多条声明可以全部交给内核重查 | `out_03_recheck.txt`：`lake env leanchecker --fresh SumOdd.Proof` 无输出、退出码 0、用时 62 秒；`out_02_Count.txt`：该环境里共有 66 200 条声明（651 个模块） | `src/LeanChecker.lean`（v4.34.1）的说明：`--fresh` 把导入的与本文件定义的全部常量重放进一个空环境，由内核检查；该工具自述「not an external verifier, simply a tool to detect "environment hacking"」 | 66 200 里含本片工程自己的几条。耗时是取证所用的那台机器上的一次实测 | 已核实 |
| r5；「C++ · 官方内核」「Rust」「Lean」 | 内核另有独立写成的实现，可以互相对照 | *The Lean Language Reference*，Elaboration and Compilation 一节：「Lean's kernel is written in C++. There are independent re-implementations in Rust and Lean, and the Lean project is interested in having as many implementations as possible so that they can be cross-checked against each other.」 | 同书 Validating a Lean Proof 一节提到用 Rust 写的外部检查器 nanoda | 本片没有运行这些独立实现；画面只表示它们存在，不表示它们检查过本片的定理 | 已核实 |
| r6；「Mathlib · 290 195 条定理 · 2026-10-07」 | Mathlib 里有约 29 万条定理 | `out_05_mathlib_stats.txt`：官方统计页（`leanprover-community.github.io/mathlib_stats.html`）2026-10-07 12:33 UTC 显示 Definitions 137 930、Theorems 290 195、Contributors 772 | lean-lang.org 首页称 Mathlib「containing over a million lines of formalized mathematics」 | 数字每日变化，以画面上的日期为准。画面上 539 格见方的方点阵按这个数排，最外一圈未满 | 已核实 |
| r7；「费马大定理」「xⁿ + yⁿ = zⁿ」「形式化进行中 · 斜线为示意」 | 费马大定理的证明正在用 Lean 形式化 | 项目主页 `imperialcollegelondon.github.io/FLT/`：「An ongoing multi-author open source project to formalise a proof of Fermat's Last Theorem in the Lean theorem prover.」「The project is currently being led by Kevin Buzzard.」 | lean-lang.org 首页列有「Fermat's Last Theorem」形式化项目 | 截至 2026-10-08 仍在进行；斜线一圈的宽度不代表进度 | 已核实 |

### edge（2:40–3:12）

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用范围 | 状态 |
|---|---|---|---|---|---|
| e1；`theorem riemann_hypothesis : 1 + 1 = 2 := rfl` 与回显 | 命题本身写得对不对，内核不管：名字叫黎曼猜想、命题是 1 + 1 = 2 的定理照样通过 | `out_02_Name.txt`（编译通过，`'riemann_hypothesis' does not depend on any axioms`） | Lean 社区《Did you prove it?》（`leanprover-community.github.io/did_you_prove_it.html`）：「It is very easy to define a complicated-looking statement and call it TheRiemannHypothesis which, despite the name, is not actually a statement of the Riemann Hypothesis.」 | Lean 4.34.1 | 已核实 |
| e2；「要人来读」 | 命题是否表达了原意，仍要人来判断 | *The Lean Language Reference*，Validating a Lean Proof 一节列出的剩余假设之一：「No human error or misleading presentation of the theorem statement in the trusted challenge file.」「If there are doubts that the theorem means what it appears to mean, its statement and all referenced definitions must be investigated carefully」 | 《Did you prove it?》第 5 条：Does your work prove what you claim it proved? | — | 已核实 |
| e3；「2024」「AlphaProof」、六个方块及其标注 | 2024 年 AlphaProof 用 Lean 证出三道国际数学奥林匹克试题（代数两道、数论一道）；几何一道由 AlphaGeometry 2 证出；组合两道未解出 | Google DeepMind，*AI achieves silver-medal standard solving International Mathematical Olympiad problems*，2024-07-25：「AlphaProof solved two algebra problems and one number theory problem by determining the answer and proving it was correct」「AlphaGeometry 2 proved the geometry problem, while the two combinatorics problems remained unsolved」；文中说明 AlphaProof 在形式语言 Lean 里证明命题 | 同文：两个系统合计解出六题中的四题，得 28 分（满分 42） | 六个方块按「谁解出的」分组排列，不是试题的原始顺序 | 已核实 |
| e4；「人」「AI」与同一个朱红方块 | 证明不论由谁写出，都由同一个内核检查 | 由 c5、c6 的出处得出 | — | — | 已核实 |
| e5、e6；「177² = …」、200 格的长条、「∀ n」 | 右上角逐个去试，到片尾只试到 n = 200；证明对全部 n 成立 | 读数取自 `out_01_build.txt` 中 `Test.lean:19` 的回显（n = 0 … 200 的和，由 Lean 算出）；全片 200 秒，每秒 n 加一 | — | — | 已核实 |
| e7；结论卡 | 形式化证明把对作者的信任换成对每一步的检查 | 本片的概括；依据见 f1、c3–c6、r1–r5 | — | 边界见 e1、e2：命题是否写对、逻辑本身与内核实现的正确，仍是前提 | 概括，无新增事实 |

### outro（3:12–3:20）

片尾名单见下节。左下的读数停在 `200² = 40 000`，取自同一组回显。

### 标题、封面与右上角的常驻读数

| 位置 | 陈述 | 出处 | 状态 |
|---|---|---|---|
| 片名「200 秒了解 Lean 4：什么是形式化证明，以及它为什么可靠」 | 「可靠」的含义限于：证明项经内核检查、所用公理可以列出；不含命题是否写对 | 见 c3–c6、r1–r5、e1–e2 | 已核实 |
| 右上角 `n² = 和`（n = 1 … 200） | 前 n 个奇数的和 | `out_01_build.txt` 中 `Test.lean:19` 的回显；`gen_data.py` 另核对它们确是平方数 | 已核实 |
| 封面：4 × 4 方点阵（最外一圈 7 个为朱红）、「∀ n」 | 1 + 3 + 5 + 7 = 4²；定理对全部 n 成立 | 同 o1、t7 | 2026-10-08 四张封面出图后已逐张核对 |

## 没有进入成片的相关事实

- `Wrong.lean` 的回显里另有一条报错：`Not a definitional equality: the left-hand side sumOdd 3 is not definitionally equal to the right-hand side 10`。
- 证明的收尾用 `grind`，它生成的辅助声明占了证明项的一半以上（1 902 / 3 347）。依赖闭包里靠后的声明大多来自 `Lean.Grind.CommRing` 一带；不同的收尾写法会得到不同的节点数与依赖条数。
- 参考手册的 Validating a Lean Proof 一节把检查分成四级：编辑器里的蓝色对勾、`#print axioms`、`lean4checker`、`comparator` 加外部检查器；并列出最高一级之后仍剩下的假设（Lean 的逻辑本身可靠、工具链无共同缺陷、命题的陈述无误等）。本片只讲到前三级。
- 同一节说明：经本机代码求值（`decide +native`、`bv_decide`）得到的证明会多出专门的公理，外部检查器无法检查这类证明。
- Hales《Formal Proof》第 1376 页：HOL Light 的内核不到 500 行。
- Flyspeck 论文：主定理在 2 GHz 的处理器上约五小时可由证明脚本重新验证；三个计算密集的子命题中最难的一个约需 5 000 个处理器小时。
- DeepMind 的文章：两个系统在 2024 年国际数学奥林匹克的六道题里合计解出四道，28 分，相当于银牌水平。
- Mathlib 官方统计页同日的另两个数：定义 137 930 条，贡献者 772 人。

## 制作署名

策划：WaterRun（依据：仓库制作规范）。

开源视频：[GitHub · Water-Run/ft](https://github.com/Water-Run/ft)（依据：仓库制作规范；交付前核对公开仓库页面并记录日期与结果，见「复核」）。

| 参与模型（含可确认的版本） | 实际分工 | 记录依据 |
|---|---|---|
| Claude Opus 5.5 | 取证（含 Lean 实验与元程序）、脚本、翻译、视觉设计、场景与动画、配乐脚本与音效编排、封面、审查、文档 | 本次制作会话自身的模型标识（`claude-opus-5-5`） |
| GPT-6（Codex） | 接手收尾、事实与画面复核、片尾署名、局部重渲、封装与交付记录 | 2026-10-08 接手会话；系统确认的模型家族为 GPT-6，不推断更细版本 |
| Microsoft Edge 在线语音（模型未披露） | 旁白合成：中文 `zh-CN-YunyangNeural`，英文 `en-US-AndrewNeural`，经 edge-tts 调用 | `project.json` 的 `voices`；服务未披露所用模型 |
| Whisper small（faster-whisper 的 `fw-small`） | 读音回听（`kit/tools/asr.js`） | 仓库的 `kit/assets.json` 与 `docs/environment.md` |
| WebSearch、WebFetch（模型未披露） | 网页检索与摘录：检索只作线索，摘录后的每条引文都对到原始页面或原文 PDF | 本次制作会话的工具记录；工具未披露所用模型 |

片尾名单（中文 / 英文）：策划 / Planning：WaterRun；取证 · 脚本 · 翻译 · 视觉 · 动画 · 配乐 · 审查 / Research · script · translation · design · animation · score · review：Claude Opus 5.5；旁白合成 / Narration voice：Microsoft Edge 在线语音（模型未披露）；读音回听 / Read-back check：Whisper small；网页检索与摘录 / Web lookup：WebSearch · WebFetch（模型未披露）；开源视频 / Open-source video：github.com/Water-Run/ft。

## 复核

<!-- 成片后填写：核查范围、日期、依据、发现的问题、更正与复查结论；覆盖三项核心审查、原创与动画完成度、片尾名单。未做的写「未做」。 -->

**定稿前（2026-10-07/08）**

- 旁白 42 句逐句对到上表；历史年份与数字回到原文核对：Hales 的两段引文取自《Notices》原文 PDF 的第 1371、1378 页；Flyspeck 的完成日期取自公告邮件的存档；Lean 的两个年份取自官方参考手册并与 GitHub 发布接口、2015 年的系统描述论文相互印证。
- 初稿里三处说法在核对后改掉：「审稿人查了四年，只肯说 99% 确定」——读到的原文只支持「未能确认其正确」，年数与百分比没有读到原始出处，删去；「1968 年 Automath 首次让计算机核对证明」——出处的说法是 the first theorem prover actually working，旁白不作「首次」的断言；「de Bruijn 准则」一词没有读到提出它的原文，不用这个词，只讲「小内核检查证明项」这件事本身。
- 画面上的数由 `gen_data.py` 从回显生成，脚本里对关键数做了断言（三条公理与闭包里的公理一致、各类声明相加等于总数、节点数等于各部分之和、`leanchecker` 两次都以 0 退出）；各场景开头另有断言，数据与画面写死的结构不符时在页面日志里报出。

**接手收尾（2026-10-08，GPT-6 / Codex）**

- 数据核对：实际重跑 `tools/gen_data.py`，断言全部通过；生成文件前后的 SHA-256 相同。核对值为证明项 3,347 / 393、依赖 2,565、重放环境 66,200、内核 8,071 行、其余所列目录 714,515 行。没有重新在本机执行 Lean 工程；原始实验及其版本范围沿用上表。
- 新增联网复核：[Lean 官方历史](https://lean-lang.org/doc/reference/latest/Introduction/)支持 2013 年立项与 2023-09-08 发布 Lean 4.0；[官方内核说明](https://lean-lang.org/doc/reference/latest/Elaboration-and-Compilation/)支持类型检查、小内核及 Rust / Lean 独立实现；[命题与证明](https://lean-lang.org/theorem_proving_in_lean4/Propositions-and-Proofs/)支持命题即类型的讲法；[Did you prove it?](https://leanprover-community.github.io/did_you_prove_it.html)支持公理检查与命题含义须人工核对。
- 外部历史与项目状态：[Automath 论文摘要](https://arxiv.org/abs/2203.01173)支持 1968 年；[Flyspeck 论文摘要](https://arxiv.org/abs/1501.02155)支持使用 HOL Light 与 Isabelle 的完整形式化；[DeepMind 原文](https://deepmind.google/blog/ai-solves-imo-problems-at-silver-medal-level/)确认 AlphaProof 的两道代数与一道数论题，以及另外三题的归属；[FLT 项目主页](https://imperialcollegelondon.github.io/FLT/)仍称形式化进行中。Mathlib 数字保留原始 2026-10-07 快照及画面日期，未当作实时数量。
- 本次没有重新读取 Hales《Formal Proof》全文与 Flyspeck 公告邮件（邮件网址本次读取失败），这部分保留取证阶段核查记录，不计作本轮重新核查。
- 双语各 42 句的总览图已逐张看过，与本表及生成数据相符。四张封面的 16 个方点、7 个朱红外圈方点、200 秒、全称量词与中英文标题已核对。版面扫描中历史轴次要刻度的裁切和片尾文字密度提示已查看，未发现主体裁切。
- 片尾增加收尾者：收尾 · 复核 · 出片 / Final review · finishing：GPT-6 · Codex。192–200 秒重渲，两个语言 194、199.9 秒已抽帧核对；其余模型与 WaterRun 保留，开源视频地址完整可见。[公开仓库](https://github.com/Water-Run/ft)本次可打开。此前 Claude 的详细模型标识来自原制作记录，本次未独立核验其会话。
- 原创检查：沿用本集 README 记录的自有设计；接手仅改片尾名单，未增添外部模板。动画检查覆盖逐句静帧与片尾抽帧；整片实时连续观看及音乐音效的主观听感未核查，不能据静止检测通过声称整体审美已验收。
- 双语 Whisper 转写与节奏统计已运行。无语速、单句时长、停顿阈值超标；中文 k1b、r6 和英文 e7 有转写差异，需重点试听，详见 README。识别差异没有被直接当作合成错误。
- 成片规格、各版本位置、自动闸门与未完成检查以 README「成片」及 `build/finish.<语言>.json`、`build/delivery-check.log` 为准。尚未发布到视频平台。
- 最终 `check.js --final` 双语全部通过；实际成片每 4 秒抽帧共 100 张已检查，片尾含本次收尾署名。英文 e7 的原始单句配音重新识别后包含完整的 Formal proof；中文 k1b、r6 的单句识别仍有差异，保留人工试听项。
