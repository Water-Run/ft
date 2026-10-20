# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。
按仓库 `docs/research.md` 阅读原始来源并做独立交叉核查；模型输出、记忆与搜索摘要只作线索。待核实的内容不能进入定稿，标题、字幕、封面与译文同样要核查。
实验脚本与完整回显放在 `research/lab/`；第三方源码、安装包等大文件放在 `research/_src/`（不入库），这里只记版本与获取方式。

本片属于「电子发展史」系列，讲 C 语言在时间线上的演进与版本转折，每一步「为什么改」。与「编程语言哲学」系列里的 Lua 一集分工不同，那一集只讲一条统一思想，本片不与之对照、不互相照搬。

取证日期：2026-10-20（UTC+8）。对象：**C 语言标准 ISO/IEC 9899 的历次版本**（ANSI X3.159-1989 起，至仍在进行的 C2y），以及 C 早期在 Bell Labs 的形成过程。本文是旁白、画面、标题与说明中的事实入口。

## 环境与版本

| 项 | 版本 / 取值 | 获取方式与依据 |
|---|---|---|
| 标准演进全景 | ISO/IEC 9899 各次版本、对应草案编号与日期、里程碑年表 | WG14 官方项目页 <https://www.open-std.org/jtc1/sc22/wg14/www/projects>，页面自带日期 2026-08-31；本地副本 `research/_src/wg14-projects.html` |
| C89（ANSI） | ANSI X3.159-1989 | 同上页面「Revision / Publication」表 C89 行；WG14 同时给出 NIST FIPS PUB 160 链接 |
| C90 | ISO/IEC 9899:1990，发布 1990-12 | ISO 官方目录条目（<https://www.iso.org/standard/17782.html>，经 Wayback 存档读取） |
| C95 | ISO/IEC 9899:1990/Amd 1:1995，发布 1995-03，51 页 | ISO 官方目录条目（<https://www.iso.org/standard/23909.html>） |
| C99 | ISO/IEC 9899:1999，发布 1999-12 | ISO 官方目录条目（<https://www.iso.org/standard/29237.html>） |
| C11 | ISO/IEC 9899:2011，发布 2011-12 | ISO 官方目录条目（<https://www.iso.org/standard/57853.html>） |
| C17 | ISO/IEC 9899:2018，发布 2018-06 | ISO 官方目录条目（<https://www.iso.org/standard/74528.html>） |
| C23 | ISO/IEC 9899:2024，发布 2024-10，状态 Published，阶段码 60.60 | ISO 官方目录条目（<https://www.iso.org/standard/82075.html>） |
| C2y（进行中） | 草案 N3886，2026-05-24；出版状态「Not available」 | WG14 项目页「C2y」行；草案 `research/_src/n3886.pdf` |
| 标准原文草案 | N1570（C11，2011-04-04）、N3096（C23 草案）、N3220（ISO/IEC 9899:2024 工作草案，2024-02-22）、N3886（C2y 工作草案）、N1256（C99 草案） | 官方 open-std.org 下载；`research/_src/`，不入库 |
| 标准的「改了什么」自述 | 各版附录 M（Annex M）Change History | N3220 文本第 44379–44621 行；N3886 文本第 47757–47811 行；N1570 文本第 1460–1530 行 |
| C89 官方理由书 | 《C89 Rationale》，X3J11 委员会自述，125 页 | <https://www.open-std.org/jtc1/sc22/wg14/www/C89Rationale.pdf>；`research/_src/C89Rationale.txt` |
| C99 官方理由书 | 《C99 Rationale》，224 页 | <https://www.open-std.org/jtc1/sc22/wg14/www/C99RationaleV5.10.pdf>；`research/_src/C99Rationale.txt` |
| 早期史料 | Dennis M. Ritchie、Brian W. Kernighan，《The Development of the C Language》，HOPL III（1993 年会议论文，1998 年 SIGPLAN 刊出） | Bell Labs 存档 <https://www.nokia.com/bell-labs/about/dennis-m-ritchie/chist.pdf>；`research/_src/chist.txt` |
| 标准制定流程 | WG14 的澄清请求与变更请求办法 | <https://www.open-std.org/jtc1/sc22/wg14/www/contributing.html>，页面自带日期 2026-10-15；`research/_src/wg14-contributing.html` |
| 教科书书目 | 《The C Programming Language》，Kernighan & Ritchie，1978；第 2 版 1988，Prentice Hall | Internet Archive 馆藏记录（`research/_src/archive-the-c-programming-language-kernighan-ritchie.json`、`archive-cprogramminglang00bria.json`） |
| 本机工具 | Python 3.14.3（PDF 抽文本）、PowerShell 7.6.7 | PDF 抽取脚本 `research/_src/extract_pdf_text.py` |

**取证的两种路径**：本片以「读一手文件」为主——WG14 官方项目页、ISO 官方目录条目、标准原文草案的附录 M、以及两本官方理由书；早期史实取自 Ritchie 本人的 HOPL III 论文。每条重要数字与条文都给出两路互相独立的来源（标准原文 + 官方理由书 / Bell Labs 论文 / ISO 目录），同一来源的转载不计为独立印证。

**未取到的材料**：ANSI X3.159-1989 的标准正文没有免费公开版本；NIST FIPS PUB 160（WG14 项目页给出的链接）在本机网络环境下始终无法下载（SSL 握手失败），因此本片关于 C89 条文的陈述只依据 WG14 项目页与 Bell Labs 论文对 X3J11 的记述，不引用 C89 条文原文。ISO 官方目录页面对本机请求返回 Cloudflare 验证页，改由 Internet Archive 的存档副本读取；存档副本的取得方式与校验和已记录在下表各条目的「独立印证」栏。`research/_src/` 整体不入库（仓库 `.gitignore` 第 31 行 `/videos/**/research/_src/`）。

## 逐章

### open

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| C01 | C 语言在 1970 年代初为正在形成的 Unix 操作系统而设计，作为系统实现语言。 | Bell Labs 存档的 HOPL III 论文摘要："The C programming language was devised in the early 1970s as a system implementation language for the nascent Unix operating system."（`research/_src/chist.txt` 第 9–13 行） | 同论文正文 "C came into being in the years 1969-1973, in parallel with the early development of the Unix operating system; the most creative period occurred during 1972."（第 19–21 行） | 论文记述截至 1993 年会议 | 2026-10-20 已核 |
| C02 | C 源自 BCPL 与 B：BCPL 是无类型语言；B 是 Thompson 在 Bell Labs 为 UNIX 写的系统语言，论文形容 B「可以看作没有类型的 C」。 | 同论文第 80–88 行："he created instead a language of his own, which he called B. B can be thought of as C without types; more accurately, it is BCPL squeezed into 8K bytes of memory" | 同论文第 90–97 行记 BCPL 由 Martin Richards 设计于 1960 年代中期，其编译器被移植到 Multics 与 GE-635/GECOS | 同上 | 2026-10-20 已核 |
| C03 | B 与 UNIX 起步的机器是 DEC PDP-7，内存 8K 个 18 位字；Thompson 在 1968 年开始在上面写 UNIX。 | 同论文第 58–63 行："the DEC PDP-7 on which he started in 1968 was a machine with 8K 18-bit words of memory" | 同论文第 75–76 行记 1969 年 McIlroy 为新系统写了第一种高级语言（TMG 的实现），Thompson 随后决定 UNIX 需要一种系统程序设计语言 | 同上 | 2026-10-20 已核 |

### ch1 从 B 到 C

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| C04 | 1971 年 Ritchie 在 B 上加入字符类型，并把编译器改写为直接生成 PDP-11 机器码，他把这个中间版本叫 NB（new B）。 | 同论文第 297–301 行："In 1971 I began to extend the B language by adding a character type and also rewrote its compiler to generate PDP-11 machine instructions instead of threaded code... I called the slightly-extended language NB, for 'new B.'" | 同论文第 294–296 行记 B 编译器原来用 threaded code，生成的程序比汇编慢得多，以致无法用 B 重写操作系统 | 同上 | 2026-10-20 已核 |
| C05 | 给这门语言取名 C 是因为 NB 的名字「不够有区分度」；作者本人没有断定 C 这个字母的由来。 | 同论文第 390–393 行："I felt that it deserved a new name; NB seemed insufficiently distinctive. I decided to follow the single-letter style and called it C, leaving open the question whether the name represented a progression through the alphabet or through the letters in BCPL." | 同论文第 389 行记 C 的类型组合方案受 Algol 68 影响很深；作者对名称来源持保留态度 | 同上 | 2026-10-20 已核（片中只说「作者没有定论」，不说字母表或 BCPL 哪种说法正确） |
| C06 | C 相对 B 的关键一步是数组在表达式中自动转成指针，论文称这是「无类型的 BCPL 与有类型的 C 之间演化链条上的关键一跳」，并使既有 B 代码大部分继续可用。 | 同论文第 349–358 行："The solution constituted the crucial jump in the evolutionary chain between typeless BCPL and typed C. It eliminated the materialization of the pointer in storage, and instead caused the creation of the pointer when the array name is mentioned in an expression." | 同论文第 328–330 行记代价：数组下标与指针算术从此要按元素类型缩放 | 同上 | 2026-10-20 已核 |
| C07 | 到 1973 年初「现代 C 的要素已经齐备」，同年夏天用 C 重写了 PDP-11 上的 UNIX 内核。 | 同论文第 434–437 行："By early 1973, the essentials of modern C were complete. The language and compiler were strong enough to permit us to rewrite the Unix kernel for the PDP-11 in C during the summer of that year." | 同论文第 438–441 行记同一时期编译器被移植到 Honeywell 635 与 IBM 360/370，Lesk 写的「可移植 I/O 包」后来成为 C 的标准 I/O 例程 | 同上 | 2026-10-20 已核 |
| C08 | 1973 至 1980 年间语言继续长出 unsigned、long、union、enum 类型；1977 年前后的改动主要出于可移植性与类型安全的考虑。 | 同论文第 447–449 行："During 1973-1980, the language grew a bit: the type structure gained unsigned, long, union, and enumeration types"；第 458–460 行："The language changes during this period, especially around 1977, were largely focused on considerations of portability and type safety" | 同论文第 461–484 行记当时 C 还保留强烈的无类型痕迹：指针与整型内存下标几乎不分、整数与指针可以互相赋值 | 同上 | 2026-10-20 已核 |
| C09 | 1972 至 1973 年间最重要的加入是预处理器，最初只提供 `#include` 与无参数 `#define`。 | 同论文第 417–421 行："the most important was the introduction of the preprocessor... Its original version was exceedingly simple, and provided only included files and simple string replacements: #include and #define of parameterless macros." | 同论文第 422–427 行记预处理器最初甚至要源文件开头有特殊信号才被调用 | 同上 | 2026-10-20 已核 |

### ch2 K&R 与事实标准

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| C10 | 1978 年 Kernighan 与 Ritchie 出版《The C Programming Language》，书中 K&R 第一版没有描述当时已经常见的若干新增内容，却在此后十多年里充当语言参考，直到正式标准出台。 | 同论文第 441–443 行："In 1978 Brian Kernighan and I published The C Programming Language. Although it did not describe some additions that soon became common, this book served as the language reference until a formal standard was adopted more than ten years later." | 书目印证：Internet Archive 馆藏记录 `the-c-programming-language-kernighan-ritchie`，title "The C Programming Language"，creator "Kernighan, Ritchie"，date 1978；同论文第 23 行称该书为「white book」或「K&R」 | 馆藏记录与论文互为独立来源 | 2026-10-20 已核 |
| C11 | K&R 第二版是 1988 年由 Prentice Hall 出版的另一本书，与 1978 年的第一版不是同一版本。 | Internet Archive 馆藏记录 `cprogramminglang00bria`：title "The C programming language"，creator "Brian W. Kernighan"，date 1988，publisher "Prentice Hall" | Bell Labs 论文第 442 行只提 1978 年那次出版，未提第二版；本片因此不把「K&R C」直接等同于任一版次的书 | 两路独立 | 2026-10-20 已核（**片中须说明「K&R C」通常指第一版描述的那种写法**） |
| C12 | 「K&R C」这个名字的所指：论文把 1978 年的第一版称为当时最接近标准的版本。 | 同论文第 22–23 行："In the middle of this second period, the first widely available description of the language appeared: The C Programming Language, often called the 'white book' or 'K&R'" | 同论文第 515–516 行："The best approximation to a standard, the first edition of K&R, no longer described the language in actual use" | 同上 | 2026-10-20 已核 |

### ch3 为什么需要 ANSI C

| 句号或位置 | 陈例 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| C13 | 到 1982 年已经明确 C 需要正式标准化：K&R 第一版不再描述实际使用的语言，尤其没有提到 void 与 enum 类型。 | Bell Labs 论文第 514–517 行："By 1982 it was clear that C needed formal standardization. The best approximation to a standard, the first edition of K&R, no longer described the language in actual use; in particular, it mentioned neither the void or enum types." | 《C89 Rationale》本身是 X3J11 对这次标准化的自述，见 `research/_src/C89Rationale.txt` | 论文记述截至 1993 | 2026-10-20 已核 |
| C14 | 第一版 K&R 在许多细节上不够精确，pcc 越来越不可能被当作「参考实现」；C 开始进入商业与政府合同项目，正式标准的权威性变得重要。 | 同论文第 523–527 行："The first edition of K&R was also insufficiently precise on many details of the language, and it became increasingly impractical to regard pcc as a 'reference compiler'... Finally, the incipient use of C in projects subject to commercial and government contract meant that the imprimatur of an official standard was important." | 同论文第 485–491 行记 Steve Johnson 把 pcc 改造成 lint 以扫描可疑写法，这正是「细节不够精确」的后果 | 同上 | 2026-10-20 已核 |
| C15 | 1983 年夏，在 M. D. McIlroy 的推动下，ANSI 设立由 CBEMA 主持的 X3J11 委员会；委员会在 1989 年底产出报告，随后被 ISO 采纳为 ISO/IEC 9899-1990。 | 同论文第 527–530 行："Thus (at the urging of M. D. McIlroy), ANSI established the X3J11 committee under the direction of CBEMA in the summer of 1983, with the goal of producing a C standard. X3J11 produced its report [ANSI 89] at the end of 1989, and subsequently this standard was accepted by ISO as ISO/IEC 9899-1990." | WG14 官方项目页里程碑："1989: Published ANSI X3.159-1989 (aka C89 or ANSI C)"、"1990: Published ISO/IEC 9899:1990 (aka C90)"；ISO 目录记 ISO/IEC 9899:1990 发布日期 1990-12 | 两路独立 | 2026-10-20 已核 |
| C16 | X3J11 的目标是「编纂已有的 C 的通行定义并促进用户程序的移植性」。 | Bell Labs 论文第 534–535 行引 X3J11 报告原话："to develop a clear, consistent, and unambiguous Standard for the C programming language which codifies the common, existing definition of C and which promotes the portability of user programs across C language environments." | 《C89 Rationale》正是这份报告的官方理由书，可与该目标互相印证（`research/_src/C89Rationale.txt`） | 同上 | 2026-10-20 已核 |
| C17 | X3J11 对语言本身只做了一项真正重要的改动：把形参类型写进函数签名，语法借自 C++。 | 同论文第 537–543 行："X3J11 introduced only one genuinely important change to the language itself: it incorporated the types of formal arguments in the type signature of a function, using syntax borrowed from C++... In the old style, external functions were declared like this: double sin(); ... In the new style, this better rendered double sin(double)" | 《C89 Rationale》§3.5.4.3 "Function declarators (including prototypes)"："The function prototype mechanism is one of the most useful additions to the C language... The particular form adopted in the Standard is based in large part upon C++."；§3.5.4 "The function prototype syntax was adapted from C++." | 两路独立（论文 + 官方理由书） | 2026-10-20 已核 |
| C18 | 函数原型的价值在于翻译期就能发现「参数个数或类型不对」的错误；没有原型时这类错误很难被翻译器发现。 | 《C89 Rationale》§3.5.4.3："Function prototypes provide a powerful translation-time error detection capability. In traditional C practice without prototypes, it is extremely difficult for the translator to detect errors (wrong number or type of arguments) in calls to functions declared in another source file. Detection of such errors has either occurred at runtime, or through the use of auxiliary software tools." | Bell Labs 论文第 544–550 行记这项改动引起的困难：不能禁绝旧式定义，新旧两种写法只好并存 | 官方理由书 + 论文 | 2026-10-20 已核 |
| C19 | X3J11 还加了一批较小的补充与调整，例如类型限定符 const 与 volatile，以及略有不同的类型提升规则。 | 同论文第 551–554 行："X3J11 also introduced a host of smaller additions and adjustments, for example, the type qualifiers const and volatile, and slightly different type promotion rules." | 《C89 Rationale》§3.5.2.3 专述 const 的引入理由，§3.2.1.1 述类型提升 | 两路独立 | 2026-10-20 已核 |
| C20 | 标准化没有改变这门语言的性格：标准「更像一次更细致的编纂，而不是一次新发明」。 | 同论文第 562–565 行："the core C language escaped nearly unscathed from the standardization process, and the Standard emerged more as a better, careful codification than a new invention. More important changes took place in the language's surroundings: the preprocessor and the library." | 同论文第 535–536 行："The committee realized that mere promulgation of a standard does not make the world change." | 同上 | 2026-10-20 已核 |
| C21 | C95 是对 1990 年版的第一次修订（Amd 1:1995），主要加入受限字符集支持与宽字符库。 | ISO 目录条目 ISO/IEC 9899:1990/Amd 1:1995，发布 1995-03，51 页，状态 Withdrawn；WG14 项目页记 "C95 | ISO/IEC 9899:1990/Amd 1:1995" | N3220 附录 M.6 "First Edition, Amendment 1"："Major changes in the amendment to the first edition (__STDC_VERSION__ 199409L) included: — addition of the predefined __STDC_VERSION__ macro — restricted character set support via digraphs and <iso646.h> — wide character library support in <wchar.h> and <wctype.h>"（`research/_src/n3220.txt` 第 44615–44620 行） | ISO 目录 + 标准原文附录 M | 2026-10-20 已核 |

### ch4 C99

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| C22 | C99 是标准的第二版，`__STDC_VERSION__` 为 199901L；ISO 目录记发布日期 1999-12，WG14 里程碑表把「Published ISO/IEC 9899:1999 (aka C99)」记在 2000 年。 | N3220 附录 M.5："Second Edition ... Major changes in the second edition (__STDC_VERSION__ 199901L) included:"（第 44547–44549 行）；ISO 目录 ISO/IEC 9899:1999 发布日期 1999-12 | WG14 项目页里程碑："2000: Published ISO/IEC 9899:1999 (aka C99)" | 两路独立 | 2026-10-20 已核（**两个官方来源对年份的记法不同，片中按各自来源如实说明，不做统一**） |
| C23 | C99 移除了隐式函数声明，理由是保证产生一条诊断信息、抓住一类新的编程错误；实现可以在给出诊断后仍按隐式声明继续翻译，以兼容既有程序。 | 《C99 Rationale》§6.5.2.2 "Function calls"："A new feature of C99: The rule for implicit declaration of functions has been removed in C99. The effect is to guarantee the production of a diagnostic that will catch an additional category of programming errors. After issuing the diagnostic, an implementation may choose to assume an implicit declaration and continue translation in order to support existing programs that exploited this feature."（`research/_src/C99Rationale.txt` 第 3195–3200 行） | N3220 附录 M.5 的 C99 变更清单同时列有 "— remove implicit function declaration"（第 44575 行） | 官方理由书 + 标准原文 | 2026-10-20 已核 |
| C24 | C99 加入 `//` 行注释，理由是它好用、且在同时处理 C 与 C++ 的翻译器里已被广泛使用。 | 《C99 Rationale》§6.4.9 "Comments"："// comments were added for C99 due to their utility and widespread existing practice, especially in dual C and C++ translators."（第 2980–2981 行） | N3220 附录 M.5 变更清单列有 "— // comments"（第 44572 行） | 两路独立 | 2026-10-20 已核 |
| C25 | C99 移除了隐式 int。 | N3220 附录 M.5 变更清单："— remove implicit int"（第 44565 行） | N1570（C11 草案）附录 M.5 的同一清单同样列出该项（`research/_src/n1570.txt` 第 1519 行） | 标准原文（两版草案互为一致） | 2026-10-20 已核 |
| C26 | C99 引入可变长数组（VLA），并因此改变了数组类型的兼容规则与 sizeof 何时是常量表达式。 | N3220 附录 M.5 变更清单："— variable length arrays"（第 44556 行）；同节 "— flexible array members"、"— static and type qualifiers in parameter array declarators" | 《C99 Rationale》§6.7.5.2 专述可变长数组；§6.7.1 "With the addition of variable length array (§6.7.5.2) in C99, array type compatibility was extended so that variable length arrays are compatible with both an array of known constant size and an array with an incomplete type."；§6.5.3.4 "the sizeof operator is a constant expression only if the type of the operand is not a variable length array type" | 标准原文 + 官方理由书 | 2026-10-20 已核 |
| C27 | C99 加入 `long long` 与扩展整数类型。 | N3220 附录 M.5："— the long long int type and library functions"、"— extended integer types"（第 44561–44562 行） | N1570 附录 M.5 同一清单亦列 "— the long long int type and library functions" | 两版标准原文一致 | 2026-10-20 已核 |
| C28 | C99 加入复合字面量与指定初始化器。 | N3220 附录 M.5："— compound literals"、"— designated initializers"（第 44570–44571 行） | N1570 附录 M.5 同一清单一致 | 两版标准原文一致 | 2026-10-20 已核 |
| C29 | C99 加入受限指针 restrict。 | N3220 附录 M.5："— restricted pointers"（第 44555 行） | 《C99 Rationale》§6.7.3.1 "Formal definition of restrict" 专述其引入 | 标准原文 + 官方理由书 | 2026-10-20 已核 |
| C30 | C99 允许声明与语句混排。 | N3220 附录 M.5："— mixed declarations and statements"（第 44577 行） | 《C99 Rationale》§6.8 述 "C89 requires all declarations in a block to occur before any statements."，C99 放宽 | 两路独立 | 2026-10-20 已核 |
| C31 | C99 引入 `_Bool`（经 `<stdbool.h>`）、`inline` 函数、`snprintf` 系列、`va_copy`、`__func__`、`_Pragma`、变参宏 `__VA_ARGS__`，并让 `printf`/`scanf` 接受 `%lf`。 | N3220 附录 M.5 对应条目："— boolean type in <stdbool.h>"、"— inline functions"、"— the snprintf family of functions"、"— va_copy macro"、"— __func__ predefined identifier"、"— _Pragma preprocessing operator"、"— macros with a variable number of arguments (__VA_ARGS__)"、"— %lf conversion specifier allowed in printf"（第 44581、44595–44606 行） | N1570 附录 M.5 列出完全相同的一组条目（第 1504–1519 行一带） | 两版标准原文一致 | 2026-10-20 已核 |
| C32 | C99 让 C 正式对接 IEEE 754（ISO/IEC 60559），并收紧了整数提升与整数常量类型的规则。 | N3220 附录 M.5："— ISO/IEC 60559 (also known as IEC 559 or IEEE 754 arithmetic) support"、"— integer constant type rules"、"— integer promotion rules"（第 44592、44579–44580 行） | N1570 附录 M.5 的 C89→C99 清单同样列出这三项 | 两版标准原文一致 | 2026-10-20 已核 |

### ch5 C11

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| C33 | C11 是标准的第三版，`__STDC_VERSION__` 为 201112L，ISO 目录记发布日期 2011-12。 | N3220 附录 M.3 "Third Edition"："Major changes in the third edition (__STDC_VERSION__ 201112L) included:"（第 44522 行） | ISO 目录 ISO/IEC 9899:2011 发布日期 2011-12；WG14 项目页里程碑 "2011: Published ISO/IEC 9899:2011 (aka C11)" | 两路独立 | 2026-10-20 已核 |
| C34 | C11 最重要的主题是并发：支持多线程执行、改进的内存序模型、原子对象与线程存储（`<stdatomic.h>` 与 `<threads.h>`）。 | N3220 附录 M.3 清单第 44524–44525 行："— support for multiple threads of execution including an improved memory sequencing model, atomic objects, and thread storage (<stdatomic.h> and <threads.h>)" | N1570（C11 草案）附录同一清单，第 1469–1472 行给出同样措辞 | 两版标准原文一致 | 2026-10-20 已核 |
| C35 | C11 引入 `_Generic` 类型泛型表达式。 | N1570 文本第 1484 行 "— type-generic expressions"、第 5821 行 "`_Generic ( assignment-expression , generic-assoc-list )`" | N3220 附录 M.3 清单同列 "— type-generic expressions"（第 44529 行） | 两版标准原文一致 | 2026-10-20 已核 |
| C36 | C11 引入静态断言 `_Static_assert`。 | N1570 文本第 1492 行 "— static assertions"、第 4729 行列出 `_StaticAssert` 关键字 | N3220 附录 M.3 清单同列 "— static assertions"（第 44530 行） | 两版标准原文一致 | 2026-10-20 已核 |
| C37 | C11 引入 `_Alignof`，用于查询类型对对齐的要求。 | N1570 文本 §6.5.3.4 "The sizeof and _Alignof operators"："The _Alignof operator yields the alignment requirement of its operand type."（第 6426–6441 行） | N3220 附录 M.3 清单列 "— querying and specifying alignment of objects (<stdalign.h>, <stdlib.h>)"（第 44527 行） | 两版标准原文一致 | 2026-10-20 已核 |
| C38 | C11 引入匿名结构体与匿名联合。 | N1570 文本第 1493 行 "— anonymous structures and unions" | N3220 附录 M.3 清单同列 "— anonymous structures and unions"（第 44531 行） | 两版标准原文一致 | 2026-10-20 已核 |
| C39 | C11 引入 `_Atomic` 类型限定符。 | N1570 文本第 3933 行 "An atomic type describes the type designated by the construct _Atomic ( type-..."；第 3977–3978 行 "Furthermore, there is the _Atomic qualifier." | N3220 附录 M.3 清单同列原子对象与 `<stdatomic.h>`（第 44525 行） | 两版标准原文一致 | 2026-10-20 已核 |
| C40 | C11 移除了 `gets` 函数。 | N1570 文本第 1497 行 "— removed the gets function (<stdio.h>)" | N3220 附录 M.3 清单同列 "— removed the gets function (<stdio.h>)"（第 44535 行） | 两版标准原文一致 | 2026-10-20 已核 |
| C41 | C11 引入 `_Noreturn`（无返回函数）、Unicode 字符与字符串（`<uchar.h>`，原 ISO/IEC TR 19769:2004）、条件性的边界检查接口。 | N1570 文本第 1494、1475–1483、1500–1501 行 | N3220 附录 M.3 清单对应条目（第 44532、44528、44537–44538 行） | 两版标准原文一致 | 2026-10-20 已核 |

### ch6 C17

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| C42 | C17 是标准的第四版，`__STDC_VERSION__` 为 201710L；标准自述第四版「没有重大改动，只有技术性更正与澄清」。 | N3220 附录 M.4 "Fourth Edition"："There were no major changes in the fourth edition (__STDC_VERSION__ 201710L), only technical corrections and clarifications."（第 44515–44518 行） | WG14 项目页「Change and Clarification Requests」表：针对 ISO/IEC 9899:2018 的综合文档是 N2396，「Previously called Defect Reports」 | 标准原文 + WG14 流程页 | 2026-10-20 已核 |
| C43 | C17 的 ISO 编号是 ISO/IEC 9899:2018，发布 2018-06；在 2024 年版发布后状态转为 Withdrawn。 | ISO 目录 ISO/IEC 9899:2018：发布 2018-06，状态 Withdrawn，阶段码 95.99，并注 "New version available: ISO/IEC 9899:2024" | WG14 项目页里程碑 "2018: Published ISO/IEC 9899:2018 (aka C17)" | 两路独立 | 2026-10-20 已核（**版本号写 2018 而通称写 C17，两者都要在片中出现**） |
| C44 | 2011 与 1999 两版在目录中的状态同样已转为 Withdrawn。 | ISO 目录 ISO/IEC 9899:2011 与 ISO/IEC 9899:1999 条目均记状态 Withdrawn、阶段码 95.99 | WG14 项目页仍把这几版列为该委员会产出的修订版本 | 两路独立 | 2026-10-20 已核 |

### ch7 C23

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| C45 | C23 是标准的第五版，ISO 编号 ISO/IEC 9899:2024，发布 2024-10，目录状态 Published、阶段码 60.60；`__STDC_VERSION__` 为 202311L。 | N3220 附录 M.2 "Fifth Edition"："Major changes in this fifth edition (__STDC_VERSION__ 202311L) include:"（第 44379–44381 行）；N3220 封面 "ISO/IEC 9899:2024 (en) — N3220 working draft" | ISO 目录 ISO/IEC 9899:2024：发布 2024-10，状态 Published，阶段码 60.60；WG14 里程碑 "2024: Published ISO/IEC 9899:2024 (aka C23)" | 三路一致 | 2026-10-20 已核 |
| C46 | C23 加入 `nullptr` 常量与 `nullptr_t` 类型，其底层表示与 `void*` 指针相同。 | N3220 附录 M.2 变更清单："— added a nullptr constant and a nullptr_t type with a well-defined underlying representation identical to a pointer to void"（第 44467–44468 行）；标准正文 §7.21.2 "The nullptr_t type"（第 623 行） | N3220 正文 §6.2.5 把 nullptr_t 列为标量类型之一（第 3493 行） | 标准原文内部两处互证 | 2026-10-20 已核 |
| C47 | C23 加入 `constexpr` 存储类说明符，并放宽了对常量表达式的认定。 | N3220 附录 M.2："— added the constexpr specifier for object definitions and improved what is recognized as a constant expression in conjunction with the constexpr storage-class specifier"（第 44442–44443 行） | N3220 正文 §6.7.1 述 constexpr 对象定义（第 3296–3297 行） | 标准原文内部两处互证 | 2026-10-20 已核 |
| C48 | C23 加入 `typeof` 与 `typeof_unqual` 运算符，用来推导表达式的类型。 | N3220 附录 M.2："— added the typeof and typeof_unqual operations for deducing the type of an expression"（第 44445 行）；正文 §6.7.3.6（`typeof` 关键字见第 4260–4261 行） | N3220 正文第 6908 行脚注："The operand of a typeof (6.7.3.6), sizeof, or alignof operator is usually not evaluated" | 标准原文内部两处互证 | 2026-10-20 已核 |
| C49 | C23 增强了 `auto` 说明符：单对象定义可以用类型推断。 | N3220 附录 M.2："— enhanced the auto type specifier for single object definitions using type inference"（第 44494 行） | N3220 正文 §6.7.1 把 `auto` 列入存储类说明符列表（第 4230 行） | 标准原文内部两处互证 | 2026-10-20 已核 |
| C50 | C23 加入二进制整数字面量与数字分隔符。 | N3220 附录 M.2："— binary integer literals and appropriate formatting for input/output of binary integer numbers"；"— digit separators with ’ (single quotation mark)"（第 44503–44504 行）；正文 §6.4.4.1 "A binary constant consists of the prefix 0b or 0B followed by a sequence of the digits 0 or 1."（第 4582–4583 行），词法文法列出 "binary-prefix: one of 0b 0B"（第 4521–4522 行），EXAMPLE 1 给出带分隔符的写法 `0b11’10’11’01`（第 4570–4575 行） | N3886 草案的附录 M.3 第五版清单同样列出这两项（第 47814 行起） | 2026-10-20 已核 |
| C51 | C23 加入位精确整数类型 `_BitInt(N)` 与 `unsigned _BitInt(N)`，N 从 1 到 `BITINT_MAXWIDTH`。 | N3220 附录 M.2："— added bit-precise integer types _BitInt( N) and unsigned _BitInt( N), where N can be an integer constant expression whose value is from one to BITINT_MAXWIDTH, inclusive."（第 44453–44454 行） | N3220 正文 §6.2.5 给 _BitInt 的定义与 `unsigned _BitInt(1)` 的特例（第 3353、3372–3373 行） | 标准原文内部两处互证 | 2026-10-20 已核 |
| C52 | C23 加入 `#embed` 预处理指令，把二进制数据嵌入源文件。 | N3220 附录 M.2："— added a feature to embed binary data as faithfully as possible with a new preprocessor directive #embed"（第 44465–44466 行） | N3220 正文 §6.10 一带列出 "include and #embed preprocessing directives, in __has_include and __has_embed expressions"（第 4194 行） | 标准原文内部两处互证 | 2026-10-20 已核 |
| C53 | C23 引入属性语法，首批属性为 deprecated、fallthrough、maybe_unused、nodiscard、noreturn、reproducible、unsequenced。 | N3220 附录 M.2："— added the attributes feature, which includes the attributes: deprecated… fallthrough… maybe_unused… nodiscard… noreturn… reproducible… unsequenced"（第 44420–44432 行） | N3220 正文 §6.7.4 属性语法给出 `[[` 与 `]]` 形式（第 8257 行一带） | 标准原文内部两处互证 | 2026-10-20 已核 |
| C54 | C23 把 bool、static_assert、true、false、thread_local 变成关键字，并允许实现把旧的带下划线拼写保留为宏。 | N3220 附录 M.2："— add new keywords such as bool, static_assert, true, false, thread_local and others, and allowed implementations to provide macros for the older spelling with a leading underscore followed by a capital letter"（第 44382–44385 行） | N3220 正文 §6.4.1 关键字表列有 bool、static_assert、true、false、thread_local（第 4230 行一带） | 标准原文内部两处互证 | 2026-10-20 已核 |
| C55 | C23 取消了整数位宽限制与过时的符号表示（补码之外的「1 的补数」与「符号-数值」），并删除了以标识符列表定义函数的写法。 | N3220 附录 M.2："— removed integer width constraints and obsolete sign representations (so-called '1's complement' and 'sign-magnitude')"；"— removed support for function definitions with identifier lists"；"— mandated function declarations whose parameter list is empty be treated the same as a parameter list which only contain a single void"（第 44386–44391 行） | N3220 正文 §6.7.1 相应条款（第 3218 行一带） | 标准原文内部两处互证 | 2026-10-20 已核 |
| C56 | C23 的另一批条目：空初始化 `{}`、枚举的冒号式固定底层类型、`<stdbit.h>`、`__VA_OPT__`、Unicode 标识符（UAX #31）、`memset_explicit`、`unreachable` 特性、`#elifdef`/`#elifndef`/`#warning`、把 `$`、`@`、`` ` `` 加入源字符集。 | N3220 附录 M.2 对应条目（第 44444、44455–44462、44469、44475–44476、44510–44511、44501–44502、44492–44493 行） | N3886 草案的附录 M.3 第五版清单逐条重复同一组条目（第 47814–47851 行一带）。**说明：两份草案出自同一委员会，属同一来源的两个版本，只作条文自洽核对，不算独立印证**；本片的独立印证来自 ISO 目录对 ISO/IEC 9899:2024 的出版记录 | 2026-10-20 已核 |

### ch8 C2y：进行中

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| C57 | C23 一轮结束后，WG14 于 2024 年 1 月 24 日开始下一版工作，称之为「C2y」；该版尚未出版。 | N3886 封面："After the end of the C23 cycle, work began on so-called 'C2y', the next projected edition of this document on 2024 January 24."（`research/_src/n3886.txt` 第 22–23 行）；封面页另印 "ISO/IEC 9899:202y (en) — N3886 working draft" | WG14 项目页 C2y 行：Publication 一栏为 "Not available"，Similar draft 为 N3886 [2026-05-24] | 两路独立 | 2026-10-20 已核 |
| C58 | C2y 对应标准的第六版，`__STDC_VERSION__` 写作 202ymmL——具体数值在草案里还是占位形式。 | N3886 附录 M.2 "Sixth Edition"："Major changes in this sixth edition (__STDC_VERSION__ 202ymmL) include:"（第 47757–47760 行） | 同处正文脚注写 "such as 202311L and 202ymmL"（第 14133 行） | 2026-10-20 已核 |
| C59 | C2y 已经进入标准文本的改动包括：具名循环、case 标签上的范围、`_Countof` 运算符、0o/0O 八进制前缀、分隔转义序列、if 与 switch 语句头部的声明、signed `_BitInt(1)`、复数类型的字面量、`<stdmchar.h>` 的文本转码工具、表达式中的静态断言、`_Generic` 替换可传字符串字面量。 | N3886 附录 M.2 变更清单："— Named loops."、"— Ranges in case labels."、"— _Countof operator for number of elements in an array."、"— New 0o and 0O prefixes for octal literals."、"— Delimited escape sequences."、"— Declarations in the header of if and switch statements."、"— Support signed _BitInt(1)."、"— Added literals for complex types."、"— New text transcoding utilities in the new header <stdmchar.h>."、"— Static assertions in expressions."、"— _Generic(...) replacement can pass-through string literals..."（第 47791–47800 行） | N3886 封面的逐次会议变更记录同样登记这些提案编号（如 N3260 "_Generic selection expression with a type operand"、N3273 "alignof of an incomplete array type"） | 草案自述 | 2026-10-20 已核（**只讲已进入草案文本的条目，不预告未落地的提案**） |
| C60 | C2y 草案仍在按会议逐次记录改动，N3886 封面记录到 2026 年 3 月的虚拟会议。 | N3886 封面 "2026 March / The following changes were integrated at or before the 2026 March Virtual meeting: — N3833: ..."（第 154–157 行） | WG14 项目页标 N3886 日期为 2026-05-24，晚于该次会议 | 截至 2026-05-24 的草案 | 2026-10-20 已核（**片中须说明这是 2026-05-24 的草案快照，之后还会继续变**） |
| C61 | C2y 也带来移除：独立的复数虚数类型被去掉，宏 `I` 被移除，附录 I 原「Common Warnings」整章被撤下改为空附录。 | N3886 附录 M.2："— The removal of explicit and independent imaginary types."、"— Removed macro I."、"— Annex I, previously 'Common Warnings', has been removed and replaced with a blank Annex."（第 47776、47781、47802 行） | N3886 正文 §6.2.5 一带相应条款 | 草案自述 | 2026-10-20 已核 |

### ch9 标准是怎么定出来的

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| C62 | WG14 是 ISO/IEC JTC 1/SC 22 下的工作组，它的主要产出是 ISO/IEC 9899。 | WG14 项目页开篇："The primary output of WG14 is ISO/IEC 9899, the C Standard."（`research/_src/wg14-projects.html` 第 33–34 行） | 同一页的里程碑列表按年份给出各次出版；WG14 页面本身位于 /jtc1/sc22/wg14/ 路径下 | 2026-08-31 页面 | 2026-10-20 已核 |
| C63 | 提案以「论文」形式提交：在会议邮寄截止前提交的论文在该次会议讨论，否则顺延到下一次；论文要先从委员会秘书处取得文档编号（就是 N 加数字）。 | WG14「Contributing」页 "Submitting a Change Request"："All proposals for new features, bug fixes, or other normative changes to the C Standard must be submitted to the committee in the form of a paper. Papers submitted before a meeting's mailing deadline will be discussed at the meeting. Others will be discussed at the subsequent meeting."；"To obtain a document number for your paper, submit the title of the paper to the committee secretariat ... and an appropriate number will be returned to you shortly thereafter."（`research/_src/wg14-contributing.html` 第 55–87 行） | 同一页要求论文正文包含「提案的理由、提案本身、已有实践中的先例与参考文献」，并给出 N2480 与 N2430 两份论文作为模板 | 2026-10-15 页面 | 2026-10-20 已核 |
| C64 | 提案需要有人「认领」并在讨论该提案的会议上到场；委员会讨论后告知作者提案是被原样接受、需要修改还是被否决；不以论文形式提交的提案不予考虑。 | 同一页："We require all proposals to have a champion in attendance at meetings where the proposal is scheduled to be discussed"；"the committee will inform each author whether the committee has accepted the proposal as-is, requires a further revision of the paper, or rejects the proposal. Proposals not submitted in the form of a paper will not be considered for inclusion in the standard."（第 61–70 行） | 同一页的 "Joining the Committee" 说明 WG14 是 ISO 工作组，贡献者须加入本国成员机构才能成为 WG14 专家（第 115–121 行） | 同上 | 2026-10-20 已核 |
| C65 | 除变更请求外，委员会还处理「澄清请求」：针对标准中看似含糊、歧义或矛盾的文本，请求委员会给出解释。 | 同一页 "Submitting a Clarification Request"："a Clarification Request, which is a request for the intended interpretation of a portion of text of the standard that may appear to be unclear, ambiguous, or contradictory"（第 38–52 行） | WG14 项目页 "Change and Clarification Requests" 一节：WG14 的这一流程「previously called Defect Reports」，并按 ISO 出版年份列出各版综合文档（2018/2011 对应 N2396，1999 对应 C99 CR 列表，1990 对应 C90 CR 列表） | 两路独立 | 2026-10-20 已核 |
| C66 | 每一次标准草案都带着一份按会议逐次登记改动的清单，标准原文的附录 M 另按版本列出「这一版的主要改动」。 | N1570 附录 "Major changes in the third edition"（`research/_src/n1570.txt` 第 1460 行起）；N3220 封面按 2024 January、2024 June 等会议逐条列出 N 编号改动（`research/_src/n3220.txt` 第 22–45 行）；N3886 封面记到 2026 March 会议 | 三份草案封面格式一致，N3220 与 N3886 各自列出逐次会议的改动条目 | 2026-05-24 最新草案 | 2026-10-20 已核 |
| C67 | 标准发布后，对已发布版本的改动被限制在「对现有标准作出解释」这一范围内；想扩展语言要走新的提案。 | Bell Labs 论文第 578–581 行（该文写于标准发布初期）："By the rules of the standards process, the current activity of the X3J11 committee is confined to issuing interpretations on the existing standard." | WG14 项目页把这条流程称为 Change and Clarification Requests，并说明提案也可被并入旧版作为扩展 | 论文记述截至 1993；流程页 2026-08-31 | 2026-10-20 已核（**论文写的是 X3J11 时期，片中按历史讲，不当作现行 WG14 的措辞**） |

### outro

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| C68 | 从 1989 年的 ANSI X3.159-1989 到 2024 年的 ISO/IEC 9899:2024，WG14 一共产出 8 个出版版本，另有 C2y 在进行中。 | WG14 项目页「Revision / Publication / Similar draft」表共 8 行：C89、C90、C95、C99、C11、C17、C23、C2y | ISO 目录对 1990、1995、1999、2011、2018、2024 各版均有独立条目 | 2026-08-31 页面 | 2026-10-20 已核 |
| C69 | C 之后产生了直接后继者，包括 Objective C 与 C++。 | Bell Labs 论文 "Successors" 一节："More recent descendants of C proper include Concurrent C [Gehani 89], Objective C [Cox 86], C* [Thinking 90], and especially C++ [Stroustrup 86]." | 论文同节记 C 的旁支（Eh、Zed）出自 1972 年带到滑铁卢大学的 B | 同上 | 2026-10-20 已核（**只作一句收尾，不展开**） |

## 文案审查

<!-- 文案稿经指定校对者 WaterRun 人工审查并明确确认后才配音（见 docs/script-review.md）。逐轮记录交审日期、内容 SHA-256、校对记录的链接与结论；逐句意见在 review/NOTES.md 留存，避免维护两份全文。确认之后的实质改动另起一轮。 -->

| 轮次 | 交审日期 | 稿本 | 审查意见与修改 | 结论与日期 |
|---|---|---|---|---|
| | | | | |

## 制作署名

策划：WaterRun（依据：project.json 的 production.planner，交付前核对实际参与）。

开源视频：[本片源码](https://github.com/Water-Run/ft)（依据：project.json 的 production.repository；交付前核对公开仓库页面并记录日期与结果）。

| 参与模型（含可确认的版本） | 实际分工 | 记录依据 |
|---|---|---|
| MiniMax M3.1 Flash（本次会话运行时标识 minimax-M3.1-Flash） | 取证、事实表与开工反馈应用（子任务执行） | 本次会话的系统标识与任务分工 |
| MiniMax M3.1 Flash（主会话） | 片单重构、目录搭建与反馈记录校验 | 主会话的执行记录 |

配音与渲染环节尚未开工，参与模型名单在开工前按实际记录补入本表、片尾与 README，不猜测版本。

## 复核

<!-- 记录核查范围、日期、依据、发现的问题、更正与复查结论；覆盖三项核心审查、原创与动画完成度、片尾名单。未做的写「未做」，待核查的不得写成通过。 -->

- 取证阶段复核（2026-10-20）：逐条核对本表所列 URL 与本地文件。WG14 项目页、ISO 目录存档副本、五份标准草案、两本官方理由书、Bell Labs 论文均已读到原文；草案 PDF 用 `research/_src/extract_pdf_text.py` 抽成文本后按页定位，引用的条款号与行号已回原文复核。发现并更正的两处：一是 C99 的出版年，ISO 目录记 1999-12 而 WG14 里程碑记在 2000 年，已按 C22 如实并列而不统一；二是 K&R 第一版与第二版是两本不同的书，原稿一度把二者混为一谈，已按 C10、C11 改写，片中会说明「K&R C」通常指第一版描述的写法。
- 成片后复核：未做。
