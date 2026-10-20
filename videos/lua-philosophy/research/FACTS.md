# 事实出处

画面与旁白里的每一项事实都要有出处。优先级：亲手做实验取得的数据 > 源码 > 官方文档 > 其他。
按仓库 `docs/guides/research.md` 阅读原始来源并做独立交叉核查；模型输出、记忆与搜索摘要只作线索。待核实的内容不能进入定稿，标题、字幕、封面与译文同样要核查。
实验脚本与完整回显放在 `research/lab/`；第三方源码、安装包等大文件放在 `research/_src/`（不入库），这里只记版本与获取方式。

本片属于「编程语言哲学」系列，讲 Lua 的一条统一思想——「一切皆表」。与「电子发展史」系列里《Lua 语言的发展史》一集分工不同：那一集讲时间线上的版本演进，本片只讲这条思想为什么长成这样、在什么地方取舍。两片不互相照搬。

取证日期：2026-10-20（UTC+8）。对象：**Lua 5.5.0**（主用）、**Lua 5.4.9**、**Lua 5.3.6**（同机源码构建，用于版本差异对照）。本文是旁白、画面、标题与说明中的事实入口。

## 环境与版本

| 项 | 版本 / 取值 | 获取方式与依据 |
|---|---|---|
| 解释器（主用） | Lua 5.5.0，Copyright (C) 1994-2025 Lua.org, PUC-Rio | 本机已装的官方 Windows x64 预编译包；`research/lab/out_10_versions.txt` 的「## 1 预装解释器 5.5.0」一节原样回显 `lua55.exe -v` |
| 解释器（对照） | Lua 5.4.9，Copyright (C) 1994-2026；Lua 5.3.6，Copyright (C) 1994-2020 | 由官方源码包用发行包自带 Makefile 构建（`mingw32-make mingw`），见 `research/lab/11_build_older.ps1` 与 `out_11_build_older.txt` |
| 源码包与校验 | lua-5.5.1.tar.gz sha256=1c4b4068d67061f2a2231ad2b5422e77acea1487ea9890f6320af614f4373dce；lua-5.4.9.tar.gz sha256=2335b6c582a52654f94612bf10d2f4672805d05329aa6568b1d8cd9e5c6fb8e6；lua-5.3.6.tar.gz sha256=fc5fd69bb8736323f026672b1b7235da613d7177e72558893a0bdcd320466d60 | 官方下载页 <https://www.lua.org/ftp/> 公布的 SHA-256；`out_11_build_older.txt` 里逐个重算并比对，结果为「SHA-256 与官方公布值一致」 |
| 参考手册 | Lua 5.5 Reference Manual（Copyright © 2020–2026 Lua.org, PUC-Rio，页脚 "Last update: Fri Jul 24 14:06:33 UTC 2026"，"revised for Lua 5.5.1"）；5.4 与 5.3 同源 | `research/_src/lua-5.5-manual.html` 等；来源 <https://www.lua.org/manual/5.5/manual.html> |
| 设计史料 | "The evolution of Lua"，HOPL III（2007），作者 Roberto Ierusalimschy、Luiz Henrique de Figueiredo、Waldemar Celes | `research/_src/hopl-evolution-of-lua.pdf`，官方发布于 <https://www.lua.org/doc/hopl.pdf> |
| 官方源码（只读引用） | lua-5.5.1 源码树 | `research/_src/lua-5.5.1/`，由官方 tarball 解包；不入库 |
| 工具链 | Windows 11（10.0.26340）、PowerShell 7.6.7、MinGW-w64 gcc 16.2.0 | `out_10_versions.txt`、`out_11_build_older.txt` 首部 |
| 演示目录 | `C:\ftlab`（中性演示路径，不含个人身份信息） | 全部实验脚本使用；见下方脱敏说明 |

**脱敏说明**：`out_11_build_older.txt` 是构建日志，gcc 的诊断信息会带出编译器安装路径与临时目录，其中含本机用户名。脚本 `11_build_older.ps1` 内的 `Sanitize` 函数在写入回显前把这些路径替换为 `C:\Users\user`（实测替换后回显中不含真实用户名，已逐文件核对）。其余回显只出现 `C:\ftlab` 与解释器自报版本。

**构建说明**：5.4.9 与 5.3.6 用发行包自带 Makefile 的 `mingw` 目标构建，因此带有各自的兼容开关（5.4.9 为 `-DLUA_COMPAT_5_3`，5.3.6 为 `-DLUA_COMPAT_5_2`），这与官方对这两个版本的默认构建一致。引用其行为时只引用与兼容开关无关的部分。

**不复用的部分**：官方 `www.lua.org/ftp/` 只提供源码与手册，不提供 Windows 预编译包；本片的 5.5.0 来自本机已装的官方包，未在本片重复下载。`research/_src/` 整体不入库（仓库 `.gitignore` 第 31 行 `/videos/**/research/_src/`），`research/lab/` 内的 `.ps1` 与 `out_*.txt` 入库。

## 逐章

### open

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| L01 | Lua 有八种基本类型：nil、boolean、number、string、function、userdata、thread、table。 | 5.5 手册 §2.1 "There are eight basic types in Lua: *nil*, *boolean*, *number*, *string*, *function*, *userdata*, *thread*, and *table*."（`research/_src/lua-5.5-manual.html`） | 本机实测 `type()` 对八种值各返回一种类型名，见 `research/lab/out_10_versions.txt` 的「## 2 解释器自报版本与常量」 | 5.5.0；手册页脚 2026-07-24 | 2026-10-20 已核 |
| L02 | Lua 是动态类型语言：变量没有类型，只有值有类型；语言里没有类型定义。 | 5.5 手册 §2.1 首段 "Lua is a dynamically typed language. This means that variables do not have types; only values do. There are no type definitions in the language." | 5.4 手册 §2.1 同句；HOPL 论文 §1 "Like Scheme, Lua is dynamically typed: variables do not have types; only values have types." | 5.5.0 / 5.4.9 / 5.3.6 | 2026-10-20 已核 |
| L03 | Lua 的实现是一个库，用「clean C」写成——标准 C 与 C++ 的公共子集；官方发行包自带独立解释器 `lua`。 | 5.5 手册 §1 "Lua is implemented as a library, written in *clean C*, the common subset of standard C and C++."；§7 讲独立解释器 | HOPL 论文脚注 1："Lua is implemented in 'clean C', that is, the intersection of C and C++. Lua compiles unmodified as a C++ library." | 5.5.0 | 2026-10-20 已核 |
| L04 | 本片的证据基础：官方 5.5 手册、官方 5.5.1 源码、官方 HOPL III 设计论文，加上本机三个解释器的实测。 | 手册 `research/_src/lua-5.5-manual.html`；源码 `research/_src/lua-5.5.1/`；论文 `research/_src/hopl-evolution-of-lua.pdf`；实验 `research/lab/` | 本片自建，不引用其他片的实验 | 5.5.0 / 5.4.9 / 5.3.6 | 2026-10-20 已核 |

### ch1 为什么只有一种数据结构

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| L05 | 表是 Lua 唯一的数据结构机制。 | 5.5 手册 §2.1："Tables are the sole data-structuring mechanism in Lua; they can be used to represent ordinary arrays, lists, symbol tables, sets, records, graphs, trees, etc." | HOPL 论文 §1："One important semantic difference between Lua and Scheme — and probably the main distinguishing feature of Lua — is that Lua offers tables as its sole data-structuring mechanism." | 5.5.0；手册 2026-07-24 | 2026-10-20 已核 |
| L06 | 表实现的是关联数组：下标不限于数字，可以是除 nil 与 NaN 以外的任何 Lua 值；表可以是异构的。 | 5.5 手册 §2.1 "The type *table* implements associative arrays, that is, arrays that can have as indices not only numbers, but any Lua value except **nil** and NaN."，及 "Tables can be *heterogeneous*" | 实测：`research/lab/out_12_table_unified.txt` 中同一张表同时持有整数键、字符串键和布尔键；键的类型实测出现 number / string / boolean / table / function 五种 | 5.5.0 | 2026-10-20 已核 |
| L07 | 一张表既能当数组用，也能当字典、记录、集合用；用字段名作下标就是记录，写法 `a.name` 是 `a["name"]` 的语法糖。 | 5.5 手册 §2.1 "To represent records, Lua uses the field name as an index. The language supports this representation by providing `a.name` as syntactic sugar for `a["name"]`." | HOPL 论文 §1："Tables allow simple and efficient implementation of records (by using field names as keys), sets (by using set elements as keys), generic linked structures... Moreover, we can use a table to implement an array by using natural numbers as indices."；实测 `out_12_table_unified.txt` 中 `t.name`、`t[10]`、`t[true]` 同一张表并存 | 5.5.0 | 2026-10-20 已核 |
| L08 | 数组与字典不是两种类型，而是同一张表的两种用法：`ipairs` 只看 1..n 的连续整数下标，`pairs` 遍历全部键且顺序不保证。 | 5.5 手册 §3.4.9（`ipairs`）与 §3.4.6（`pairs`，"The order of traversal is unspecified"） | 实测 `out_12_table_unified.txt`：同一张 6 键的表，`ipairs` 只读到 i=1..3，`pairs` 读到 6 个键（1、2、3、10、name、true，脚本内先排序后打印） | 5.5.0 | 2026-10-20 已核 |
| L09 | 表的键在插入前会被规范化：整数值浮点下标会转成整数，所以 `a[2.0]` 与 `a[2]` 是同一个键。 | 5.5 手册 §2.1 "To avoid ambiguities, any float used as a key that is equal to an integer is converted to that integer." | 实测 `out_12_table_unified.txt` 末节："k[2] = 二  k[2.0] = 二"；源码 `ltable.c:1166` 一带把整数值的浮点键改写成整数键 | 5.5.0 / 源码 5.5.1 | 2026-10-20 已核 |
| L10 | 表、函数、线程和完整 userdata 是「对象」：变量里存的是引用，赋值、传参、返回都不发生复制。 | 5.5 手册 §2.1 "Tables, functions, threads, and (full) userdata values are *objects*: variables do not actually *contain* these values, only *references* to them." | 实测 `out_12_table_unified.txt`："u.x = 1（赋值传的是引用）"、"rawequal(u, v) = true  rawequal(u, w) = false" | 5.5.0 | 2026-10-20 已核 |
| L11 | 字符串、数字、布尔、nil 不是对象，是值。 | 5.5 手册 §2.1 同段的枚举（objects 列表不含 string / number / boolean / nil） | 5.4 手册 §2.1 同段；5.3 手册 §2.1 同段 | 5.5.0 / 5.4.9 / 5.3.6 | 2026-10-20 已核 |

### ch2 元表：把行为也变成数据

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| L12 | 每个值都可以有元表；元表本身就是一个普通的 Lua 表，里面按事件名存放元方法，键是双下划线开头的字符串。 | 5.5 手册 §2.4 "Every value in Lua can have a *metatable*. This *metatable* is an ordinary Lua table that defines the behavior of the original value under certain events." | 实测 `out_14_metatables.txt`：`setmetatable` / `getmetatable` 可用，元表里放 `__index`、`__call` 后行为立即改变 | 5.5.0 | 2026-10-20 已核 |
| L13 | 索引类元方法（`__index`、`__newindex`）与算术类元方法（`__add`、`__eq`、`__lt`、`__tostring` 等）走两条不同路径：没有 `__add` 的两个表相加会报错。 | 5.5 手册 §2.4 的元方法清单，分别说明「__index: The indexing access operation `table[key]`」与「__add: the addition (+) operation. If any operand for an addition is not a number, Lua will try to call a metamethod. ... Otherwise, Lua raises an error.」 | 实测 `out_14_metatables.txt`：`callable(3, 4) = 7`（`__call` 生效）、`A + B = A+B`（`__add` 生效），而 `{} + {}` 报 "attempt to perform arithmetic on a table value" | 5.5.0 | 2026-10-20 已核 |
| L14 | `__index` 的值可以是表，也可以是函数；表时是原型链，函数时被调用并收到 (表, 键) 两个参数。 | 5.5 手册 §2.4 "The metavalue for this event can be either a function, a table, or any value with an `__index` metavalue. If it is a function, it is called with *table* and *key* as arguments." | 实测 `out_14_metatables.txt`："obj.greet() = hi"（表形式）、"obj2.anything = 由函数补出的 anything"（函数形式）、"三级 __index 链 l1.deep = found"（链式） | 5.5.0 | 2026-10-20 已核 |
| L15 | `__newindex` 只在「键原先不存在」时触发；一旦用 `rawset` 写入使该键存在，后续写入就回到普通赋值。 | 5.5 手册 §2.4 "__newindex: The indexing assignment `table[key] = value`. Like the index event, this event happens when *table* is not a table or when *key* is not present in *table*." 及 "Whenever a `__newindex` metavalue is invoked, Lua does not perform the primitive assignment. If needed, the metamethod itself can call `rawset` to do the assignment." | 实测 `out_14_metatables.txt`："guarded.x = 1，被记录的新键：x" → "再次写入后 guarded.x = 2，记录条数 = 1" | 5.5.0 | 2026-10-20 已核 |
| L16 | 元方法在元表里是用 raw 查找的，所以「元表的元表」不参与元方法查找。 | 5.5 手册 §2.4 "You can query the metatable of any value using the `getmetatable` function. Lua queries metamethods in metatables using a raw access (see `rawget`)." | 实测 `out_14_metatables.txt`："rawget(meta, '__index') = table"、"deep.greet = function: ...（Lua 取的是 raw 的 __index，命中 base）"，对照 "把 metaMeta 直接当元表时 bare.anything = 由 metaMeta 提供：anything" | 5.5.0 | 2026-10-20 已核 |
| L17 | 表和完整 userdata 各自有独立元表；其他类型的值按类型共享一个元表（所有数字一个、所有字符串一个）；字符串类型的元表已由字符串库设置，其 `__index` 指向 `string` 表。 | 5.5 手册 §2.4 "Tables and full userdata have individual metatables, although multiple tables and userdata can share their metatables. Values of all other types share one single metatable per type... By default, a value has no metatable, but the string library sets a metatable for the string type." | 实测 `out_14_metatables.txt`："getmetatable('') ~= nil : true"、"getmetatable('').__index == string -> true"、"getmetatable(1) = nil"；`("abc"):upper()` 返回 "ABC" | 5.5.0 | 2026-10-20 已核 |
| L18 | `rawget` / `rawset` / `rawequal` 绕过元方法；`rawequal` 为真而 `==` 为真/假由元方法决定。 | 5.5 手册 §3.4.6（`rawget`/`rawset`）、§3.4.3（`rawequal` "does not invoke metamethods"） | 实测 `out_14_metatables.txt`："rawequal(A, B) = false，A == B = true"（`__eq` 生效）、"rawget(obj, 'missing') = nil" | 5.5.0 | 2026-10-20 已核 |
| L19 | Lua 代码里不能给数字、字符串等类型换元表，`debug` 库可以破这个限制。 | 5.5 手册 §2.4 "You can replace the metatable of tables using the `setmetatable` function. You cannot change the metatable of other types from Lua code, except by using the debug library";§6.11 `debug.setmetatable` | 实测 `out_14_metatables.txt` 末行："tostring(0)（装过元表后）= 零!" | 5.5.0 | 2026-10-20 已核 |
| L20 | 元表机制的历史：Lua 2.1 用 fallback，Lua 3.0（1997-07）改为 tag method，Lua 5.0（2003-04-11）改为元表与元方法；"metatable" 一词由 Rici Lake 在 2001 年 11 月提出。 | `research/_src/hopl-evolution-of-lua.pdf` §6.8 与版本沿革段："in Lua 3.0 (July 1997) we solved the fallback clash problem by replacing fallbacks with tag methods"、"In Lua 5.0 we replaced tags and tag methods (introduced in Lua 3.0) by metatables and metamethods"、"The term 'metatable' was suggested by Rici Lake in November 2001." | 官方版本沿革页 <https://www.lua.org/versions.html> 记 Lua 3.0 发布于 1997-07-01、Lua 5.0 发布于 2003-04-11，且 5.0 的主要新特性含 "metatables instead of tags and tag methods" | 沿革至 2026-10-07（该页页脚 "Last update: Wed Oct 7 12:32:36 UTC 2026"） | 2026-10-20 已核 |
| L21 | 官方设计论文直接点明表是 Lua 与 Scheme 最主要的语义差别，并说「表可以实现数组、记录、集合、链表」；论文同时说明表在内部用数组表示，顺序访问与数组相当。 | HOPL 论文 §1（含上述引文）及 "A careful implementation ensures that such a table uses the same amount of memory that an array would (because it is represented internally as an actual array)" | 5.5 手册 §2.1 的 "sole data-structuring mechanism" 表述与之一致 | 论文为 2007 年 HOPL III 版 | 2026-10-20 已核 |

### ch3 函数、闭包与一等值

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| L22 | 所有值都是一等值：可以赋给变量、存进表、作为参数传、作为结果返回；函数没有特殊地位，只是恰好指向一个函数值的变量。 | 5.5 手册 §2.1 "All values in Lua are first-class values. This means that all values can be stored in variables, passed as arguments to other functions, and returned as results."；§2.2 "a function name has no special status in Lua" 意同（5.4/5.3 手册同） | HOPL 论文 §1："all values in Lua are first-class values: they can be assigned to global and local variables, stored in tables, passed as arguments to functions, and returned from functions." | 5.5.0 / 5.4.9 / 5.3.6 | 2026-10-20 已核 |
| L23 | 闭包捕获的是外部局部变量本身，不是拷贝；每次执行 `local` 都产生一份新的局部变量。 | 5.5 手册 §2.2 "Because of the lexical scoping rules, local variables can be freely accessed by functions defined inside their scope. A local variable used by an inner function is called an *upvalue*"；"Notice that each execution of a **local** statement defines new local variables." | 实测 `out_16_closures.txt`："第 1 个闭包连续调用：21 22 23" 与 "第 2 个闭包首次调用：21"（共享 x=20，各有一份 y=0 起算）；"bump() = 1  2  3" 且闭包外 counter = 3 | 5.5.0 | 2026-10-20 已核 |
| L24 | `debug.getupvalue` 能读出闭包的 upvalue 及其名字，可用于观察闭包状态。 | 5.5 手册 §6.11 `debug.getupvalue` | 实测 `out_16_closures.txt`："debug.getupvalue(peek, 1) = 42" | 5.5.0 | 2026-10-20 已核 |
| L25 | 表的字段可以是函数，`obj:method()` 是 `obj.method(obj)` 的语法糖。 | 5.5 手册 §3.4.11 "Methods"（`function f:m()` 展开为 `function f.f(self)`） | 实测 `out_16_closures.txt`："obj:double() = 10" 与 "obj.double(obj) = 10" | 5.5.0 | 2026-10-20 已核 |
| L26 | 闭包与 upvalue 在语言沿革上来自 Lua 3.1（1998-07-11）引入的匿名函数；Lua 5.0 改为完整词法作用域。 | HOPL 论文版本沿革："Lua 3.1 (July 1998) brought functional programming to Lua by introducing anonymous functions and function closures via 'upvalues'"，以及官方沿革页记 5.0 的主要新特性含 "full lexical scoping instead of upvalues" | 官方版本沿革页 <https://www.lua.org/versions.html>：Lua 3.1 发布于 1998-07-11，"anonymous functions and function closures via 'upvalues'"；Lua 5.0 发布于 2003-04-11，"full lexical scoping instead of upvalues" | 沿革至 2026-10-07 | 2026-10-20 已核 |
| L27 | 5.5 的语言引入了全局变量声明（`global`），`global` 成为保留字。 | 5.5 手册 §2.2 "All chunks start with an implicit declaration `global *`"、"this preambular declaration becomes void inside the scope of any other `global` declaration"；§9 语法 `global` 为保留字；§8.1 "The word **global** is a reserved word." | 官方版本沿革页："Lua 5.5 ... Its main new features are declarations for global variables, named vararg tables, more compact arrays, and major garbage collections done incrementally." | 5.5.0 | 2026-10-20 已核 |

### ch4 值的内部：整数与浮点、字符串、轻量 userdata

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| L28 | number 有两个子类型 integer 与 float；标准 Lua 用 64 位整数与双精度浮点，也可以编译成 32 位。 | 5.5 手册 §2.1 "The type *number* represents both integer numbers and real (floating-point) numbers, using two subtypes: *integer* and *float*. Standard Lua uses 64-bit integers and double-precision (64-bit) floats" | 实测 `out_15_numbers.txt`（5.5.0）："math.type(1) integer"、"math.type(1.0) float"；"math.maxinteger 9223372036854775807" | 5.5.0 / 5.4.9 / 5.3.6 | 2026-10-20 已核 |
| L29 | 整数运算溢出按补码回绕；`math.maxinteger + 1` 等于 `math.mininteger`。 | 5.5 手册 §2.1 "Unless stated otherwise, any overflow when manipulating integer values *wrap around*, according to the usual rules of two's complement arithmetic." | 实测 `out_15_numbers.txt`（5.5.0）："math.maxinteger + 1 → -9223372036854775808"、"math.mininteger - 1 → 9223372036854775807" | 5.5.0 / 5.4.9 / 5.3.6 | 2026-10-20 已核 |
| L30 | `/` 总是得到浮点，`//` 是向下取整除法；整数除以零是错误，浮点除以零得到 inf 或 nan。 | 5.5 手册 §3.4.1（`/` "always produces a float"；`//` 为 floor division）与 §3.4.3 | 实测 `out_15_numbers.txt`（5.5.0）："7 / 2 → 3.5"、"7 // 2 → 3"、"1 / 0 → inf"、"0 / 0 → nan"、"1 // 0 → 错误: attempt to divide by zero"、"1 % 0 → 错误: attempt to perform 'n%0'" | 5.5.0 / 5.4.9 / 5.3.6 | 2026-10-20 已核 |
| L31 | 字符串是 intern 的：5.5 源码里长度不超过 40 字节的短字符串走 `internshrstr`，在全局字符串表里查找复用；长字符串不走这条路。 | 源码 `research/_src/lua-5.5.1/src/lstring.c:249-251`："if (l <= LUAI_MAXSHORTLEN) /* short string? */ return internshrstr(L, str, l);"，`lstring.c:214` 注释 "Checks whether short string exists and reuses it or creates a new one."；`lstring.h:28-30`："#if !defined(LUAI_MAXSHORTLEN) #define LUAI_MAXSHORTLEN 40 #endif" | 实测 `out_17_strings.txt`：10 万个内容相同的短字符串比 10 万个互不相同的短字符串少占 4231.5 KB；10 万个互不相同的长字符串（每条约 90 字节）比短字符串再多占约 8.6 MB | 源码 5.5.1；实测 5.5.0 | 2026-10-20 已核 |
| L32 | 外部字符串在进入 Lua 状态时会被规范化：短的被 intern，长的保持原样。 | 源码 `lstring.c:344-352` `luaS_normstr`："Normalize an external string: If it is short, internalize it." | 5.5 手册 §4.1 关于 C API 传入字符串的说明 | 源码 5.5.1 | 2026-10-20 已核 |
| L33 | 内容相同的短字符串，等值与恒等同时成立；表按键查找按内容进行。 | 5.5 手册 §2.1 "The indexing of tables follows the definition of raw equality in the language." | 实测 `out_17_strings.txt`："a == b : true"、"rawequal(a, b) : true"、`t["k"]`、`t[("k")]`、`t["k" .. ""]` 全部取到同一个值 "v" | 5.5.0 | 2026-10-20 已核 |
| L34 | 轻量 userdata 是一个 C 指针值：它是一个值（像数字一样），没有自己的元表，不被回收；与它 C 地址相同的任何轻量 userdata 与它相等。 | 5.5 手册 §4.1 `lua_pushlightuserdata`："A *light userdata* represents a pointer, a `void*`. It is a value (like a number): you do not create it, it has no individual metatable, and it is not collected (as it was never created). A light userdata is equal to 'any' light userdata with the same C address."；§2.1 "Userdata has no predefined operations in Lua, except assignment and identity test." | 5.3 手册 §4.1 与 §2.1 逐字相同；5.4 手册同 | 5.5.0 / 5.4.9 / 5.3.6 | 2026-10-20 已核 |
| L35 | 用 NaN 的位模式给轻量 userdata 打标签这一做法，在 5.3 / 5.4 / 5.5 三份官方手册中都没有记载；官方源码里也没有对应的实现。 | 三份手册的 §2.1 与 §4.1 只说明轻量 userdata 是指针值、无独立元表、按地址相等（见 L34）；5.5.1 源码中 `lobject.h:457-460` 注释 "Light userdata should be a variant of userdata, but for compatibility reasons they are also different types."，无 NaN 载荷编码；源码中 NaN 只出现在数值转换、比较与格式化路径（`lobject.c:310-319`、`lvm.c:430`、`ltable.c:1168`） | 官方 `lstring.c`/`lobject.h`/`ltable.c`/`lvm.c` 全文检索未见任何以 NaN 载荷区分轻量 userdata 类型的代码 | 5.3.6 / 5.4.9 / 5.5.0 手册，5.5.1 源码 | 2026-10-20 **待核实**：不进入定稿。片中只讲已核实的「轻量 userdata 是值、无独立元表、按地址相等」，「NaN 打标签」不作为 Lua 官方语义陈述 |
| L36 | NaN 不能作为表的键；用 NaN 作下标会报错。 | 5.5 手册 §2.1 "any Lua value except **nil** and NaN"；§3.4.9 `rawset` "index any value different from **nil** and NaN" | 源码 `ltable.c:1168-1169`："else if (l_unlikely(luai_numisnan(f))) luaG_runerror(L, \"table index is NaN\");" | 5.5.0 / 源码 5.5.1 | 2026-10-20 已核 |

### ch5 代价与边界

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| L37 | 语言的 `#` 运算符对表给出的是一个「边界」：遇到空洞时，返回哪个边界由实现决定，Lua 只保证返回一个合法的边界。 | 5.5 手册 §3.4.7 "The length of a table t is defined to be any border of that table. A border is any non-negative integer n such that t[n] is not nil and t[n+1] is nil; in particular, a table with a border n has a border at every n' < n, up to 0." | 实测 `out_13_length_border.txt`：`{10,20,30,[5]=50}` 的 `#b = 3`（5 也是合法边界）；`{1,nil,3,4,5}` 的 `#c = 1`（4 也是合法边界），脚本中同时打印 ipairs 读到的个数 3 与 1 | 5.5.0 | 2026-10-20 已核 |
| L38 | 字符串的长度是确定的，与表不同。 | 5.5 手册 §3.4.7 对字符串与表的分别规定（字符串长度即其字节数） | 实测 `out_13_length_border.txt`："字符串 \"abc\" 的 # = 3" | 5.5.0 | 2026-10-20 已核 |
| L39 | 装了 `__len` 元方法后，`#` 的结果由元方法决定，与实际键数无关。 | 5.5 手册 §2.4 "**__len**: The length (**#**) operation. If the object is not a string, Lua will try its metamethod. ... If there is no metamethod but the object is a table, then Lua uses the table length operation" | 实测 `out_13_length_border.txt`："带 __len 的表 #f = 42" 且 "直接数键仍是 0 个键" | 5.5.0 | 2026-10-20 已核 |
| L40 | 元表查找是运行时行为：每次 `t[k]` 未命中时都要去元表里找一次，元方法本身也是一次函数调用。 | 5.5 手册 §2.4（`__index` 触发条件与调用方式） | 源码 5.5.1：`ltable.c` 的表查找在未命中时返回 nil，由 `lvm.c` 的取表操作再查元表并调用元方法；本片未做性能测量，故只陈述语义与调用路径，不给出速度数字 | 源码 5.5.1 | 2026-10-20 已核（**速度数字不进入成片**） |
| L41 | Lua 没有类：没有 class 关键字、没有继承链，行为完全由元表与元方法提供；语言只提供元表这一件工具。 | 5.5 手册 §2.4 全文只给出元表与元方法机制，无类相关条款；§2.1 列出八种基本类型也不含类 | HOPL 论文 §6.8 说明元表是「用 userdata 和表表示用户自定义类型」的手段（"metatables can be used to represent user-defined types with userdata and tables: all objects of the same 'type' should share the same metatable"），不是内建类 | 5.5.0 | 2026-10-20 已核 |
| L42 | 元表与 tag method 的历史差别：tag method 只能作用于带同一个 tag 的值，彼此天然隔离，因此可以实现互不干扰的继承；元表可被 Lua 代码直接操作，且没有引用时会被回收。 | HOPL 论文 §6.8："Tag methods were fallbacks that operated only on values with a given tag. This made it possible to implement independent notions of inheritance, for instance. No chaining was needed because tag methods for one tag did not affect tag methods for another tag."；"Metatables are just ordinary Lua tables and so can be manipulated within Lua without the need for special functions. ... Unlike tags, metatables and their contents are naturally collected when no references remain to them." | 官方版本沿革页：Lua 3.0（1997-07-01）"tag methods as a powerful replacement for fallbacks"，Lua 5.0（2003-04-11）"metatables instead of tags and tag methods" | 沿革至 2026-10-07 | 2026-10-20 已核 |
| L43 | 字符串不自动参与算术：5.4 起字符串到数字的强制转换被移出核心语言，交给字符串库的元方法；官方明确说这类转换「可能在未来版本被移除」。 | 5.4 手册 §8.1 "The coercion of strings to numbers in arithmetic and bitwise operations has been removed from the core language. The string library does a similar job for arithmetic (but not for bitwise) operations using the string metamethods."；§3.4.3 "These coercions exist mainly for compatibility and may be removed in future versions of the language." | 5.5 手册 §3.4.3 保留同样措辞（"the string library sets metamethods that try to coerce strings to numbers in all arithmetic operations" 与 "may be removed in future versions"）；实测 `out_15_numbers.txt` 三版都有 `"10" + 1` 得 11、`"10" == 10` 为 false | 5.3.6 / 5.4.9 / 5.5.0 | 2026-10-20 已核 |

### ch6 5.x 演进与版本差异

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| L44 | Lua 5.3 发布于 2015-01-12，主要新特性是整数、位运算符、基础 UTF-8 库，并同时支持 64 位与 32 位平台。 | 官方版本沿革页 <https://www.lua.org/versions.html> "Lua 5.3 was released on 12 Jan 2015. Its main new features were integers, bitwise operators, a basic utf-8 library, and support for both 64-bit and 32-bit platforms." | 5.3 手册 §2.1 "The type *number* represents both integer numbers and real (floating-point) numbers, using two subtypes: *integer* and *float*"；§3.4.3 的整数/浮点转换规则 | 沿革页更新至 2026-10-07 | 2026-10-20 已核 |
| L45 | Lua 5.4 发布于 2020-06-29，主要新特性是分代垃圾回收模式，以及 const 与待关闭（to-be-closed）变量。 | 官方版本沿革页 "Lua 5.4 was released on 29 Jun 2020. Its main new features were a new generational mode for garbage collection and const and to-be-closed variables." | 5.4 手册 §3.3.8 "To-be-closed Variables"、"to *close* a value means to call its `__close` metamethod"；§3.3.6 的变量属性含 `const` 与 `close`；§2.4 列出 `__close` 键 | 沿革页更新至 2026-10-07 | 2026-10-20 已核 |
| L46 | Lua 5.5 发布于 2025-12-22，主要新特性是全局变量声明、具名可变参数表、更紧凑的数组，以及以增量方式完成的大规模垃圾回收；5.5.1 于 2026-08-03 发布，是当前发行版。 | 官方版本沿革页 "Lua 5.5 was released on 22 Dec 2025. Its main new features are declarations for global variables, named vararg tables, more compact arrays, and major garbage collections done incrementally. The current release is Lua 5.5.1, released on 03 Aug 2026." | 5.5 手册 §2.2 的 `global` 声明与 §8.1 "The word **global** is a reserved word."；§9 语法含 `global` 与 `varargparam ::= '...' [Name]`；手册页脚 "revised for Lua 5.5.1" | 沿革页更新至 2026-10-07 | 2026-10-20 已核 |
| L47 | 5.4.9 于 2026-08-25 发布，是 5.4 系列的最后一个版本；5.3.6 于 2020-09-25 发布，是 5.3 系列的最后一个版本；5.4 与 5.3 都不再继续发布。 | 官方版本沿革页："The last release was 5.4.9, released on 25 Aug 2026. There will be no further releases of Lua 5.4."；"The last release was 5.3.6, released on 25 Sep 2020. There will be no further releases of Lua 5.3." | 官方下载页 <https://www.lua.org/ftp/> 列出的 tarball 与日期：lua-5.4.9.tar.gz 2026-08-10，lua-5.3.6.tar.gz 2020-09-14 | 两页分别更新至 2026-10-07 与 2026-08-25 | 2026-10-20 已核（两页日期相差两天，如实照录，不做统一） |
| L48 | 同一段代码在 5.3.6 与 5.4.9 / 5.5.0 上结果不同的一处：字符串参与算术时，5.3.6 得到浮点 11.0，5.4.9 与 5.5.0 得到整数 11。 | 实测 `out_15_numbers.txt`："10" + 1 → 5.3.6 为 "11.0"，5.4.9 与 5.5.0 为 "11" | 5.4 手册 §3.4.3 "A string is converted to an integer or a float following its syntax and the rules of the Lua lexer."——即按词法规则先定子类型；5.3 手册同节只给出一条转换规则 | 5.3.6 / 5.4.9 / 5.5.0，同机同码 | 2026-10-20 已核 |
| L49 | 另一处差异：`tostring(1e15)` 在 5.5.0 输出 "1e+015"，在 5.4.9 与 5.3.6 输出 "1e+15"。 | 实测 `out_15_numbers.txt` 三段对照 | 三版手册均只说"数字到字符串的转换使用未规定的、便于阅读的格式"（5.4 手册 §3.4.3 "The conversion from numbers to strings uses a non-specified human-readable format."），不规定具体格式；本片据此只陈述实测到的输出，不推广成规范要求 | 5.3.6 / 5.4.9 / 5.5.0 | 2026-10-20 已核 |
| L50 | `//` 的结果在三个版本上实测一致：`7 // 2` 得 3，`7.0 // 2` 得 3.0。 | 实测 `out_15_numbers.txt` 三段对照 | 三版手册一致地把 `//` 定义为 floor division（5.4 手册 §3.4.1） | 5.3.6 / 5.4.9 / 5.5.0 | 2026-10-20 已核（**不声称 5.3 与 5.4 在 `//` 上有差别**） |
| L51 | 5.4 起 `for` 循环的控制变量只读；5.5 把 `__call` 链的长度限制为 15 层；5.5 里错误对象为 nil 时会被替换成字符串消息。 | 5.5 手册 §8.1 三条："The control variable in **for** loops is read only."、"A chain of `__call` metamethods can have at most 15 objects."、"In an error, a **nil** as the error object is replaced by a string message." | 5.5 手册 §1 与 §8 的其他不兼容条目（`global` 保留字、GC 参数选项改名、API 变动）同节并列 | 5.4 → 5.5 | 2026-10-20 已核 |
| L52 | 官方在版本沿革页同时给出两条并行的线：一条是语言版本号（1.0、1.1、2.1 … 5.5），另一条是 5.x 内部的修订号（5.5.0、5.5.1），同一修订号的不同发行只修 bug，虚拟机与手册相同、ABI 兼容；不同版本之间不保证 ABI 兼容。 | 官方版本沿革页 "Numbering scheme" 一节："Different releases of the same version correspond to bug fixes; they have the same reference manual, the same virtual machine, and are binary compatible (ABI compatible). Different versions are really different. The API is likely to be slightly different ... and there is no ABI compatibility" | 5.5 手册 §8 "Lua versions can always change the C API in ways that do not imply source-code changes in a program" 与 "precompiled chunks are not compatible between different Lua versions" | 沿革页更新至 2026-10-07 | 2026-10-20 已核 |

## 文案审查

<!-- 文案稿经指定校对者 WaterRun 人工审查并明确确认后才配音（见 docs/guides/script-review.md）。逐轮记录交审日期、内容 SHA-256、校对记录的链接与结论；逐句意见在 review/NOTES.md 留存，避免维护两份全文。确认之后的实质改动另起一轮。 -->

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

- 取证阶段复核（2026-10-20）：逐条核对本表所列 URL 与本地文件，官方手册、官方源码、官方沿革页三类一手来源均已读到原文；`research/_src/` 中的副本与线上原文的 SHA-256 已记录。发现并更正的一处：本片初稿曾把 5.4.9 的发布日按沿革页写作 2026-08-25，而下载页的 tarball 条目为 2026-08-10，已按 L47 如实记为两个来源各自的日期，不做统一。
- 成片后复核：未做。
