# Lua源码全解析：事实与源码定位

取证与核查日期：**2026-11-15**。主对象是 lua.org 官方 **Lua 5.5.1** 发布包；语言版本称 5.5，具体实现、行号、指令与实验均锁定到 5.5.1。旧版只为解释当前实现的主要变迁。本文是研究材料，尚未对应到文案句号；后续旁白、标题、字幕与画面事实应引用本表的事实编号。

## 1. 对象与解释路径

Lua 的主体是一份供宿主调用的 C 库；`lua.c` 是随发行版附送的命令行宿主，`luac.c` 是编译及列出字节码的工具（F01）。先从宿主进入这份库：读入脚本，经扫描、语法分析与代码生成得到函数原型和闭包，再由虚拟机用执行栈上的槽位保存值、调用函数和返回结果（F10–F18）。读到表、闭包、协程和回收时，都能回到这条路径上确定它们服务于哪一步。

贯穿输入是 [02_counter.lua](lab/02_counter.lua)：工厂函数创建一张计数表，返回引用它的闭包；外部调用两次得到 42、45，通过元方法取得标签；协程先交出 45，再恢复并返回 46；最后保护调用捕获指定错误（T01–T08）。它把「源码中的函数」「运行时函数对象」「一张共享的表」「调用帧」区分开。GC 与 C API 用补充实验解释，因为没有必要把全部机制硬塞进同一段程序。

以下调用链是按源码重建、由字节码与结果验证的解释路径，**没有用调试器记录逐次 C 调用**。实验不证明每条静态分支都运行过，也不证明性能、暂停上限或全部边界情形。

## 2. 核查口径与取证环境

| 标记 | 含义 | 后续使用边界 |
|---|---|---|
| 交叉核对 | 已读官方源码，并与手册或本地实验核对 | 可据注明的版本和范围写稿；定稿前再核一次 |
| 实验观察 | 有脚本、完整进程回显及断言，结果只适用于记录环境 | 不扩写成所有平台的尺寸、速度或时延承诺 |
| 静态定位 | 核过源文件与入口，但尚无独立证据验证完整行为 | 作为继续阅读的路标；单源细节不直接进入定稿 |
| 官方记录／待交叉 | 已读官方页面，但未独立复现或补齐第二路证据 | 保留来源原有范围，不写成已实测 |
| 待核实 | 当前证据不足，或者只列了需要继续回答的问题 | 不进入定稿 |

环境是既有 Windows 11 AMD64，Python 3.14.3，GCC 16.2.0（MinGW-w64 x86_64 UCRT POSIX SEH）。本轮不是干净虚拟机或容器实验。使用 `-std=gnu99 -O2 -DLUA_USE_APICHECK`；Windows 平台宏由各版 `luaconf.h` 自动选择，未改第三方源码，未打开历史兼容开关，未改变默认数值类型。Lua 5.5.1、5.4.9、5.3.6、5.2.4、5.1.5 编译并运行对照；5.0.3、4.0.1 仅静态对照。

| 记录 | 内容与复现方式 |
|---|---|
| [00_fetch_sources.py](lab/00_fetch_sources.py)、[out_00_sources.json](lab/out_00_sources.json) | 官方发布包 URL、字节数、SHA-256 与官方校验值一致性；所查网页的 URL、快照 SHA-256。第三方原件仅留 `_src/`，不入库 |
| [01_inventory.py](lab/01_inventory.py)、[out_01_inventory.json](lab/out_01_inventory.json) | 全部 `src/*.c`、`src/*.h` 的原始哈希与行数；Makefile 组别；函数定义及类型、操作码定位。正则索引不是完整 C 解析器，定位仍要读上下文 |
| [07_build_and_run.py](lab/07_build_and_run.py)、[out_07_build_and_run.txt](lab/out_07_build_and_run.txt) | 构建命令、版本、自编实验输出及退出码；只在本片 `build/research/` 产生二进制 |
| [out_07_processes.json](lab/out_07_processes.json) | 每个普通构建／运行命令的 stdout、stderr 原始字节以 base64 保存，保留 CRLF，不做换行转换；上面的 TXT 是便于阅读的汇总 |
| [5.5 计数器字节码](lab/out_02_counter_5.5.1_bytecode.txt)、[5.4 计数器字节码](lab/out_02_counter_5.4.9_bytecode.txt)、[5.5 新语法字节码](lab/out_04_lua55_5.5.1_bytecode.txt) | `luac -l -l -p` 原始输出仅把进程指针改成 `<address>`。原始回显保存在 `_src/`，其 SHA-256 见运行汇总；指令、操作数、行号未改 |
| [10_materials.py](lab/10_materials.py)、[out_10_materials.json](lab/out_10_materials.json) | 制作方补充：Lua 标志的 PostScript 原程序与 GIF、官网样式表、关于页，以及排「Lua」字样用的 TeX Gyre Heros 字体，URL、字节数与 SHA-256；原件在 `_src/materials/` |
| [11_internals.c](lab/11_internals.c)、[12_probes.lua](lab/12_probes.lua)、[12_producer_runs.py](lab/12_producer_runs.py)、[out_12_producer_runs.txt](lab/out_12_producer_runs.txt) | 制作方补充：指令编码、执行中的栈槽与调用帧、指令执行次数、字符串驻留、哈希冲突与重新散列、C 调用层数；另建 4.0.1、5.0.3 的 luac，把同一小段代码交给 4.0.1–5.5.1 七个编译器列出。11_internals.c 读内部结构，结果只适用于本环境的 5.5.1 |

从仓库根目录顺次运行：

```sh
python videos/source-code/lua-source/research/lab/00_fetch_sources.py
python videos/source-code/lua-source/research/lab/01_inventory.py
python videos/source-code/lua-source/research/lab/07_build_and_run.py
python videos/source-code/lua-source/research/lab/10_materials.py
python videos/source-code/lua-source/research/lab/12_producer_runs.py
python videos/source-code/lua-source/tools/gen_logo.py
```

实验均在本片目录内用相对路径执行；入库文件不含个人路径、内网地址或凭据。不要把重新运行时的地址、工具版本与观察数值当作固定值。Lua 源码及其文档使用 Lua 的 MIT 许可，见 [5.5 发行说明的许可段](https://www.lua.org/manual/5.5/readme.html#license)；本项目自写说明和实验遵循仓库 GPL-3.0-or-later，不能据此把 Lua 自身的许可改写为 GPL。

## 3. 固定版本与一手来源

| 编号 | 陈述 | 依据与定位 | 核查状态／范围 |
|---|---|---|---|
| V01 | 查阅日官方当前发布为 5.5.1；本片固定该发布包，不跟随 Git 开发分支 | [下载页](https://www.lua.org/download.html)、[源码浏览首页](https://www.lua.org/source/5.5/)，包内 `src/lua.h` 的 `LUA_RELEASE`；来源快照见 out_00 | 交叉核对；截至 2026-11-15 |
| V02 | 5.5.1 包为 398643 字节，SHA-256 为 `1c4b4068d67061f2a2231ad2b5422e77acea1487ea9890f6320af614f4373dce` | [官方 FTP 目录](https://www.lua.org/ftp/)、out_00 `releases[0]`；下载字节实算哈希 | 交叉核对；固定发布包 |
| V03 | 历史样本固定为 5.4.9、5.3.6、5.2.4、5.1.5、5.0.3、4.0.1；完整 URL、大小与哈希不另抄，见来源清单各 `releases` 条目 | out_00；各包均与官方 FTP 校验和一致 | 交叉核对；只代表选中的样本 |
| V04 | 官方将 5.5 初版发布日期记为 2025-12-22，5.5.1 发布日记为 2026-08-03；FTP 的文件日期不是发布日 | [版本史 5.5 段](https://www.lua.org/versions.html#5.5) 与 [FTP 目录](https://www.lua.org/ftp/)；后者给 5.5.1 文件日期 2026-07-24 | 官方记录／待交叉；如需片中讲日期，继续核发行记录 |
| V05 | 不同语言版本间不能假设 C ABI 或预编译 chunk 兼容；本地 5.4.9 产物被 5.5.1 拒绝加载 | [5.5 手册 §8](https://www.lua.org/manual/5.5/manual.html#8)、out_07 `[CROSS-VERSION CHUNK]`；`lundump.c:377` `checkHeader` | 交叉核对；实测一个 5.4→5.5 组合，不声称枚举全部版本／平台 |

除非特别标注，下文 `文件:行号` 指未修改的 **lua-5.5.1/src/**，行号可用 out_01 的定义索引查回；`doc/manual.html` 指同一发布包附带的手册。官网 `/source/5.5/` 以后可能换成更新补丁版，复查行号应优先用带校验和的本地归档。

## 4. 模块全景：每份实现属于哪里

F01–F06 建立整体。下表是定位地图，不把列出的每个函数都视为已完成行为验证。

| 编号／层 | 文件覆盖与职责 | 首读入口与相邻关系 | 依据／状态 |
|---|---|---|---|
| F01 宿主与工具 | `lua.c` 命令行宿主；`luac.c` 编译／反汇编工具 | `lua.c:777 main` → `pmain:731`；`luac.c:169 pmain` | [手册 §1](https://www.lua.org/manual/5.5/manual.html#1)、Makefile `LUA_O/LUAC_O`；交叉核对 |
| F02 构建分层 | Makefile 将 20 个核心 C 文件、12 个库 C 文件、两个程序分开；共 34 个 C、27 个 H 文件，合计 32202 个物理行 | out_01 `groups`、`files`、`totals`；计数含空行注释，只计 `src/*.c,*.h` | 实验观察；不写成「核心 3.2 万行」或有效代码行数 |
| F03 编译路径 | `lzio.c/h` 输入抽象；`llex.c/h` 扫描；`lparser.c/h` 语法和作用域；`lcode.c/h` 代码生成；`lopcodes.c/h` 指令定义与属性 | `luaZ_fill:24`、`luaX_next:588`、`luaY_parser:2171`、`luaK_code:384` | 源码＋§3／T01 字节码；机制交叉核对，细分语法仍按 F10–F18 的边界 |
| F04 执行与对象 | `lvm.c/h` 指令执行；`ldo.c/h` 调用、保护执行、恢复；`lobject.c/h` 值及公共对象操作；`lstate.c/h` 线程与共享状态；`lfunc.c/h` 闭包和上值 | `luaV_execute:1204`、`luaD_precall:717`、`lua_newstate:341`、`luaF_findupval:87` | 源码＋§2／T01／运行时实验；交叉核对 |
| F05 内存与扩展语义 | `lstring.c/h` 字符串；`ltable.c/h` 表；`ltm.c/h` 元方法；`lgc.c/h` 回收；`lmem.c/h` 分配接口 | `luaS_newlstr:249`、`luaH_get:1019`、`luaT_callTMres:119`、`luaC_step:1740`、`luaM_realloc_:176` | §2.1、§2.4、§2.5 与下述实验；机制交叉核对，分配失败路径仅静态定位 |
| F06 其他核心支持 | `lapi.c/h` C API；`ldebug.c/h` 调试信息、hook 与错误定位；`ldump.c` 序列化；`lundump.c/h` 反序列化；`lctype.c/h` 字符分类 | `lua_load:1120`、`luaG_traceexec:936`、`luaU_dump:288`、`luaU_undump:395` | §4、§4.7 与源码；load／API 已实验，其余完整行为仅静态定位 |
| F07 公共接口 | `lua.h` 核心 API；`lauxlib.h/c` 检查参数、加载、注册、buffer 等辅助能力；`lualib.h` 标准库入口；`luaconf.h` 平台与数值配置；`lua.hpp` 用 extern "C" 包裹三个公共头供 C++ 调用 | `luaL_loadfilex:821`、`luaL_setfuncs:978`、`luaL_newstate:1197`；out_01 `additional_files` 另记 Makefile 与 lua.hpp，不计入 C/H 行数 | §4、§5、C API 实验；常用路径交叉核对，C++ 包装只静态定位 |
| F08 标准库初始化 | `linit.c` 选择加载／预加载哪些库；`lbaselib.c` 基础函数；`lcorolib.c` 协程；`loadlib.c` package／动态模块 | `luaL_openselectedlibs:46`、`luaB_print:25`、`luaB_collectgarbage:201`、`ll_require:650` | [手册 §6](https://www.lua.org/manual/5.5/manual.html#6)、源码；基础／协程有实验，动态模块只定位 |
| F09 其余标准库与支持头 | `ldblib.c` debug；`liolib.c` io；`lmathlib.c` math；`loslib.c` os；`lstrlib.c` string；`ltablib.c` table；`lutf8lib.c` utf8。`llimits.h` 内部限制／宏、`lprefix.h` 编译前缀、`lopnames.h` 助记符、`ljumptab.h` 分派表 | 各 `luaopen_*`；`ltablib.c:64 tcreate`。头文件类型／宏需读原文，函数索引不覆盖所有宏 | Makefile、§6 与源码；模块归属已核，除单项实验外仅静态定位 |

## 5. 从脚本文本到结果

| 编号 | 陈述／输入到输出 | 可复查依据 | 核查状态 |
|---|---|---|---|
| F10 | 加载与执行是两步。`luaL_loadfilex` 经 `lua_load` 产生栈顶函数；之后保护调用才运行它 | `lauxlib.c:821`、`lapi.c:1120`、`lua.c:264 handle_script`；[lua_load](https://www.lua.org/manual/5.5/manual.html#lua_load)；C 实验 `host-loaded`／`host-result` | 交叉核对 |
| F11 | 输入先封装为 `ZIO`。保护解析器按签名字节分支：文本进 `luaY_parser`，二进制进 `luaU_undump` | `lapi.c:1127`、`ldo.c:1129–1155 f_parser`、`lzio.c:24/39`；§4 的 lua_load；跨版本 chunk 实验 | 交叉核对；固定 binary 的特殊加载条件另列 U05 |
| F12 | 编译主块时建立闭包与 Proto，创建 `_ENV` 上值，扫描 token、分析语句并生成指令；不是先建立整棵完整 AST 再统一生成代码的流水线 | `lparser.c:2153 mainfunc`、`:2171 luaY_parser`，`:877 statlist`、`:1377 subexpr` 同时调用 `luaK_*`；`llex.c:467 llex`；§3.3.2 主块；luac 显示主块／嵌套函数 | 前半交叉核对；「不建完整 AST」为基于该编译路径的静态判断，不推广为「编译器没有任何临时表达式表示」 |
| F13 | 表达式用 `expdesc` 保存阶段性结果，函数编译状态是 `FuncState`；常量、寄存器、跳转由代码生成器处理 | `lparser.h` 的 `expdesc/FuncState`、`lcode.c:384 luaK_code`、`:488 luaK_reserveregs`、`:999 luaK_exp2nextreg`、`:1788 luaK_posfix`；out_01 类型索引 | 静态定位；未逐一实验常量折叠与跳转修补规则 |
| F14 | Proto 保存指令、常量、子 Proto、上值描述与调试信息；LClosure 引用 Proto 和实际 UpVal，编译结果与运行时捕获状态是不同层次 | `lobject.h:603–626 Proto`、`:707–711 LClosure`；[手册 §3.4.11](https://www.lua.org/manual/5.5/manual.html#3.4.11)、计数器 `make_counter` 与内层函数列表 | 交叉核对 |
| F15 | 此发布版有 85 种操作码，指令为 32 位，低 7 位为 opcode；格式包括 `iABC/ivABC/iABx/iAsBx/iAx/isJ` | `lopcodes.h:14–36`、`:231–351`；out_01 `opcode_index`；C 实验的 `sizeof Instruction` 与 `NUM_OPCODES` | 交叉核对；这些是 5.5.1 编码，不套用到 5.1／5.3 |
| F16 | 「寄存器」是解释器执行栈中相对函数基址的槽位，不是每个 Lua 变量绑定一颗 CPU 寄存器 | `lvm.c:1108 RA`、`:1221 base=ci->func.p+1`；`lstate.h:187 CallInfo`；手册 §1 的寄存器虚拟机描述，计数器 luac 寄存器操作数 | 交叉核对 |
| F17 | 调用先区分 Lua 闭包、C 闭包、轻 C 函数或 `__call`；Lua 调用准备 CallInfo，C 调用直接进入 C 函数后搬回结果 | `ldo.c:717–748 luaD_precall`、`precallC`、`:759 ccall`；[手册 §4.1](https://www.lua.org/manual/5.5/manual.html#4.1)、C 实验 `c-entry top=2` 后 host 栈中得到 42 | 交叉核对；不是每次 Lua→Lua 调用都重新递归调用一层 C 解释器 |
| F18 | 解释循环取指令后按 opcode 分派；可按编译选项使用跳转表或 switch，因此不能只称「唯一的巨大 switch」 | `lvm.c:39–45`、`:1204–1238`、`ljumptab.h`；手册 §1、运行结果 | 分派路径已静态定位；运行结果不能单独证实机器码实际采用哪种分派 |

### 5.1 同一段程序的完整路径

本表的步序用于解释，不是实录的 C 调用时间线。脚本自身的行号见 [02_counter.lua](lab/02_counter.lua)，指令序号见它的 5.5.1 字节码回显；不要把源代码行号当作 PC。

| 编号／步骤 | 状态变化与结果 | 对应实现与观察 |
|---|---|---|
| T01 读入和编译 | 主块的 Proto 包含工厂、元方法、协程体、错误体等嵌套 Proto；加载只拿到可调用主闭包 | F10–F15；`CLOSURE`／子函数列表见 out_02_counter_5.5.1_bytecode |
| T02 创建计数器 | 调用 `make_counter(40)`；新建 `state={value=40}`，创建内层函数；返回闭包和表引用 | `OP_NEWTABLE/OP_SETFIELD/OP_CLOSURE/OP_RETURN`；`lvm.c:840 pushclosure`、`lfunc.c:87` |
| T03 离开工厂 | 内层函数捕获的 `state` 上值继续有效；关闭上值移动的是值槽中的引用，不复制整张表 | F24–F25；`lfunc.c:197–207`；工厂返回后闭包与外部仍观察同一张表 |
| T04 查标签 | `state` 没有 `label` 字段，普通查表落入 `__index` 函数并返回 `counter` | `lvm.c:291 luaV_finishget`、`ltm.c:119`；第一行结果的标签 |
| T05 两次调用 | `next_value(2)` 写 value=42，再调用 `next_value(3)` 写 value=45；`print` 将三个参数输出为 `counter\t42\t45` | 内层 `GETTABUP/ADD/MMBIN/SETTABUP/RETURN1`，实际助记符以保存的 luac 列表为准；out_07 计数器第一行 |
| T06 挂起 | 新协程捕获同一份状态；第一次 resume 运行到 yield，交出 45，状态是 suspended | `lcorolib.c:96 luaB_cocreate`、`ldo.c:968 lua_resume`、`:1008 lua_yieldk`；out_07 `yield true 45 suspended` |
| T07 恢复 | 第二次 resume 继续此前控制流，调用计数闭包写 value=46 并返回；状态是 dead | 同上及 `ldo.c` 的 `resume/unroll`；out_07 `return true 46 dead` |
| T08 捕获错误与退出 | `error` 产生 `counter-error`；pcall 返回 false 与错误值，宿主正常收尾 | `lbaselib.c:475 luaB_pcall`、`lapi.c:1076 lua_pcallk`、`ldo.c:1083 luaD_pcall`；out_07 `protected false counter-error`；`lua.c:791 lua_close` |

T01–T08 的可观察结果在 5.1.5、5.2.4、5.3.6、5.4.9、5.5.1 上一致；这不表示它们的操作码、对象布局或 API 相同。5.5 的精确指令应从对应版本列表读出。

## 6. 值、字符串与表

| 编号 | 陈述 | 依据与定位 | 核查状态／边界 |
|---|---|---|---|
| F19 | 语言层有 nil、boolean、number、string、function、userdata、thread、table 八种基本类型；值带类型，变量本身不固定类型 | [手册 §2.1](https://www.lua.org/manual/5.5/manual.html#2.1)、`lua.h` 类型常量、`lobject.h:35–69` 标签表示 | 交叉核对；不是「一切值都是表」 |
| F20 | 通用 TValue 由 Value 联合体和类型标签组成；内存管理对象另外有 GC 头和引用关系；不要把每个值都画成一份单独堆对象 | `lobject.h:49–69`、`:302 CommonHeader`、数字／布尔标签；§2.1，C 实验的 sizeof | 交叉核对；5.5 数组专用布局例外见 F29 |
| F21 | number 有 integer／float 子类型；本机默认配置是 8 字节 lua_Integer 与 8 字节 lua_Number；语言的算术规则不能由某次 C sizeof 推广到所有构建 | §2.1、§3.4.1／§3.4.2，`luaconf.h`，03_runtime 的 `numbers` 与 C 输出 | 交叉核对；配置与观察分开 |
| F22 | 字符串是不可变字节序列，可含 NUL，不自动表示 Unicode 码点序列；`#"a\0b"` 是 3 | §2.1；`lstring.c:249 luaS_newlstr`；03_runtime `bytes 3 0` | 交叉核对 |
| F23 | 短字符串经 internshrstr 去重；长字符串有另一条创建路径，不能讲成「所有 Lua 字符串都全局驻留」 | `lstring.c:214–258`；`lobject.h` 的短／长字符串变体；[手册 §4.1.3](https://www.lua.org/manual/5.5/manual.html#4.1.3) 字符串指针规则不是驻留保证 | 静态定位；默认短串阈值与内部身份若入稿需补独立实验 |
| F24 | 多个闭包可以引用同一个上值，修改会被彼此观察；闭包不是把外部局部变量的值各复制一份 | §3.5、`lobject.h:680–711`、`lfunc.c:87–98`；03_runtime 的两个闭包具有同一 debug.upvalueid，依次观察 1、1、2、2 | 交叉核对；debug.upvalueid 只用于实验，不是一般业务所需 |
| F25 | 开放 UpVal 指向仍有效的执行栈槽；关闭时复制槽中 TValue 到 UpVal 内部并重定向指针；表值复制后仍是同一对象的引用 | `lobject.h:680–693`、`lfunc.c:197–207`；§2.1 对象赋值规则，T03 与 03_runtime | 交叉核对；关闭上值与 `<close>` 资源关闭要分清 |
| F26 | 表按引用传递；整数 1 与整数值的浮点 1.0 对应同一个键，稀疏大整数与字符串键也有效 | §2.1；`ltable.c:1019 luaH_get`、`:1131 luaH_pset`；03_runtime `table same sparse shared` | 交叉核对；不许由语义键型断言它一定存在哪个物理区 |
| F27 | 一张 Table 可有数组部分与哈希部分；只把一定范围的正整数索引作为数组候选，其他键可走哈希；数组容量不等于 `#t` | `lobject.h:777 Table`、`ltable.c:319 arrayindex`、`:761 rehash`、`:1301 luaH_getn`；§3.4.7；C 实验预留 1024 个槽而空表长度为 0 | 交叉核对；含洞表的长度不能等同元素个数或最大键 |
| F28 | 5.5.1 的数组重选容量实际使用 `arrayXhash(na,nh): na<=3*nh` 比较内存代价；`computesizes` 考察 2 的幂容量。不能沿用文件头「超过半满」作为此版的精确规则 | `ltable.c:429–465` 实际宏与循环，对照同文件 `:13–23` 旧注释；5.4.9 `computesizes`；C 实验 `sparse-keys 1,4,8` | 交叉核对；宏参数是容量与元素数的成本比较，不是「只要三分之一满必定立即扩容」的通用承诺 |
| F29 | 5.5.1 数组将 Value 与单字节 tag 分离，Value 反向存放，数组中间另有 unsigned 长度提示；5.4.9 数组是 TValue 数组 | `ltable.h:95–124`、`ltable.c:544 concretesize`、`lobject.h:782 Value* array`；对照 5.4.9 `lobject.h:742 TValue* array`；C 实验 | 交叉核对；哈希节点、栈与通用 TValue 没有因此全部改成这种格式 |
| F30 | 本环境预留 1024 数组槽，5.5.1 与 5.4.9 的字节数比较由 C 实验同时记录 sizeof、源码公式和 GC 记账增量 | 06_c_api.c 的 `array`／`table-plus-array` 行；5.5 `concretesize` 与 5.4 `luaH_resize` | 实验观察；只比较这项请求内存，不等于进程 RSS 或所有表的节省比例；不照搬发行说明中大数组「约省 60%」作实测结果 |

F28–F30 的实测数值（来源：out_07 两次 `06_c_api.c` 运行）：

| 同一 Win64 默认配置 | Lua 5.4.9 | Lua 5.5.1 |
|---|---:|---:|
| sizeof(Value)／sizeof(TValue)，字节 | 8／16 | 8／16 |
| sizeof(Node)／sizeof(Table)，字节 | 24／56 | 24／48 |
| 预留数组容量，槽 | 1024 | 1024 |
| 数组请求字节，按实测 sizeof 与源码公式计算 | 16384 | 9220 |
| Table＋数组，GC 记账实际增加的字节 | 16440 | 9268 |
| 空表的长度 | 0 | 0 |
| 按顺序插入键 1、4、8 后的数组容量，槽 | 1 | 8 |

5.5.1 的数组公式为 `1024 × (8 + 1) + 4`，再加 48 字节 Table，与 GC 记账增量相等；5.4.9 为 `1024 × 16 + 56`。这是指定容量和此平台上的请求内存，不包含分配器额外开销，也不等同有相同键集合的任意两张表的整体比例。

## 7. 元方法、调用、协程与错误

| 编号 | 陈述 | 依据与定位 | 核查状态／边界 |
|---|---|---|---|
| F31 | 普通表读取命中原始字段直接返回；缺失时才寻找 `__index`。rawget 不触发该事件 | [手册 §2.4](https://www.lua.org/manual/5.5/manual.html#2.4)、`lvm.c:291`、`lapi.c` 的 rawget 路径；03_runtime 的 misses=1 | 交叉核对；`__index` 也可为表或可继续索引的值，不局限函数 |
| F32 | 原始表键不存在时的普通赋值才需要考虑 `__newindex`；事件处理函数若需要实际写入可调用 rawset；已存在字段写入不必触发它 | §2.4、`lvm.c:334 luaV_finishset`、`ltable.h:57–64`；03_runtime 的 writes=1，而已有／新增／raw 三项结果为 2、3、4 | 交叉核对 |
| F33 | 算术有数值快速路径与元方法后备；主例数字加法的后备 MMBIN 指令不能据此讲成每次加法都调用元方法 | `lvm.c` 的 OP_ADD／OP_MMBIN、`lcode.c` 的 `finishbinexpval`、`ltm.c:150 luaT_trybinTM`；§2.4；计数器字节码 | 静态路径＋字节码；独立验证自定义 `__add` 及拒绝条件仍可补实验 |
| F34 | 每个协程由一个 lua_State 保存执行栈与 CallInfo；同一 Lua 状态内的协程共享 global_State 的对象、注册表与 GC。它不是一条操作系统线程 | `lstate.h:285–312`、`:327 global_State`、`lstate.c:278 lua_newthread`；[手册 §2.6](https://www.lua.org/manual/5.5/manual.html#2.6)、T06–T07 | 交叉核对；多个独立 lua_newstate 则不是这里说的共享状态 |
| F35 | resume／yield 保存并恢复控制状态与值；这类协作式切换不自动带来并行执行，也不是本轮实测的调度性能 | `ldo.c:968 lua_resume`、`:1008 lua_yieldk`、`resume/unroll`，`lcorolib.c`；§2.6，计数器两次 resume | 交叉核对；C 边界能否 yield 有额外限制 |
| F36 | 保护调用把错误变成状态／结果；错误对象可以是表等值，不限定字符串。5.5 中 nil 错误对象会替换成字符串消息 | §2.3、§8.1；`lbaselib.c:475`、`lapi.c:1076`、`ldo.c:1083`；03_runtime 保留同一 marker 表，04_lua55／05_versions 对照 nil | 交叉核对；错误码与错误对象不是同一样东西 |
| F37 | 此 C 构建的保护错误机制使用 setjmp／longjmp；源码也提供 C++ 异常等配置分支，不能讲成所有平台唯一使用 longjmp | `ldo.c:68–108`、`:125 luaD_throw`、`:160 luaD_rawrunprotected`；[手册 §4.4](https://www.lua.org/manual/5.5/manual.html#4.4) | 源码＋手册；未编译 C++ 分支，不宣称已测 C++ 析构行为 |
| F38 | Lua 的 pcall 可以包住可让出的 Lua 调用；穿越普通 C 调用栈仍受限制，可用 continuation 风格 API 组织恢复 | [手册 §4.5](https://www.lua.org/manual/5.5/manual.html#4.5)、`ldo.c` 的 `finishCcall/unroll`、`CallInfo.u.c`；03_runtime `yieldable-pcall` 成功 | 交叉核对；本轮没有实现 lua_callk 的宿主 continuation 实验 |
| F39 | 适当形式的尾调用可复用调用帧；`return f(...)` 的具体限制仍以语法与待关闭变量规则为准 | §3.4.10；`ldo.c:671 luaD_pretailcall`、lvm OP_TAILCALL；03_runtime 的 100000 次尾递归结束 | 交叉核对；不是所有看似位于末尾的调用都能尾调用 |
| F40 | C API 通过栈交换参数和结果；进入 C 回调时正索引从参数 1 起，负索引相对栈顶；C 函数返回的是结果个数 | §4.1／§4.1.1，`lapi.c` 栈接口、`ldo.c precallC`；06_c_api 的 c_add 收到 19、23，返回一个 42，宿主取得结果后清栈 | 交叉核对；示例的内部布局检查不是公共 C API 用法 |
| F41 | 标准库经 C API／辅助库接入；5.5 的 luaL_openlibs 是调用 luaL_openselectedlibs 的宏，可分别控制加载与预加载 | `lualib.h:62`、`linit.c:28–61`；[luaL_openselectedlibs](https://www.lua.org/manual/5.5/manual.html#luaL_openselectedlibs)、06_c_api | 交叉核对；每个库本身的全部算法未审查 |
| F42 | require 先看注册表中的 loaded 表；未命中时找 loader、执行并缓存结果；不是每次 require 都重新读文件 | `loadlib.c:650–676 ll_require`，`:539 searcher_Lua`、`:574 searcher_C`；[手册 §6.4](https://www.lua.org/manual/5.5/manual.html#6.4) | 源码＋手册；文件搜索与 DLL 成败边界未实测 |

## 8. 回收与资源关闭

| 编号 | 陈述 | 依据与定位 | 核查状态／边界 |
|---|---|---|---|
| F43 | Lua 用可达性回收对象；循环引用不会像单纯引用计数那样天然阻止回收 | [手册 §2.5](https://www.lua.org/manual/5.5/manual.html#2.5)、`lgc.c:440 restartcollection`、`:727 propagatemark`；03_runtime 在两个模式下都清除了只被弱引用观察的自循环表 | 交叉核对；实验调用了完整 collect，不能用于声称自然回收的精确时刻 |
| F44 | 弱键表中的 ephemeron 关系需特别处理；值对其键的回指不能单靠这一关联永远保活键 | §2.5.4；`lgc.c:541 traverseephemeron`、`:755 convergeephemerons`；03_runtime 的 key→value→key 只被弱键表观察，最终 next 为 nil | 交叉核对；不把所有 Lua 类型都说成可被弱表同样清除 |
| F45 | 回收状态有标记传播、atomic、清扫与终结等步骤；写屏障维持回收期间的对象引用不变量 | `lgc.h` 状态与颜色／年龄；`lgc.c:246 luaC_barrier_`、`:268 luaC_barrierback_`、`:1617 singlestep`；§2.5 | 源码＋手册；本轮未作屏障触发的动态计数或完整状态轨迹 |
| F46 | 5.5 有增量与分代两种用户模式；分代 major 走增量步骤，但仍有 atomic 等不可拆的工作，不等于零暂停或硬实时保证 | §2.5.1／§2.5.2；`lgc.c:1306 minor2inc`、`:1471 checkmajorminor`、`:1617 singlestep`、`:1740 luaC_step`；发行说明 Changes | 交叉核对；实验只验证两种模式的可观察回收结果，没有测 major 分步时延 |
| F47 | 「默认回收模式」必须说明入口：lua_newstate 初始化 gckind 为增量，官方命令行宿主随后显式切到分代 | `lstate.c:366 KGC_INC` 对照 `lua.c:753–754 LUA_GCGEN`；§2.5 允许宿主控制 | 静态定位；不可只据 CLI 结果断言所有嵌入式宿主默认分代 |
| F48 | `<close>` 是离开作用域时调用 __close 的资源管理机制；正常退出与保护错误退出都能触发，不必等待 GC | §3.3.8、`lfunc.c:107 callclosemethod`、`:230 luaF_close`；03_runtime 得到 `normal:nil`、`error:sentinel` | 交叉核对；闭包上值关闭、GC 终结器 __gc 与资源关闭要区分 |
| F49 | suspended 协程若永远不恢复，其中局部变量未必离开作用域；错误结束的普通协程也不会自动展开栈关闭全部资源，可以显式 coroutine.close | §3.3.8、§6.3；`lcorolib.c:176 luaB_close`、`lstate.c:329 lua_closethread` | 源码＋手册；本轮未独立实验这组资源关闭边界及重入情况，已知缺陷见 B04 |
| F50 | 垃圾回收器不等于进程全部内存管理；分配器接口允许宿主决定怎样分配，full userdata 与 light userdata 所有权也不同 | §2.1、§4 的 lua_Alloc／lua_newuserdatauv；`lmem.c:176/201`、`lstate.c:341` | 静态定位＋官方说明；自定义分配器失败注入、外部资源生命周期留待继续实验 |

## 9. 5.5 主线中的新增机制

| 编号 | 陈述 | 依据与定位 | 核查状态／限制 |
|---|---|---|---|
| N01 | 没写显式 global 声明时仍有隐含的 `global *`，保留自由名字默认全局的行为；进入其他 global 声明的作用域后，这个隐含默认失效 | [手册 §2.2](https://www.lua.org/manual/5.5/manual.html#2.2)、`lparser.c:538 singlevar`、`:1934 globalstat`；04_lua55 的 implicit／declared 成功、undeclared 被拒绝 | 交叉核对；不能说 5.5 所有程序强制显式声明全局变量 |
| N02 | 不带初始化的 global 声明保留原值；带初始化时目标已有非 nil 值会报运行错误；global const 是语法约束，不能阻止 `_ENV` 等途径改同一字段 | §3.3.7；`lcode.c:715 luaK_codecheckglobal`、OP_ERRNNIL；04_lua55 的 declaration-only／duplicate-initialization／syntactic-only | 交叉核对；不是安全沙箱或运行时只读表 |
| N03 | `function(...args)` 为可变参数表命名，索引 1…n 保存额外参数，字段 n 保留包括 nil 在内的参数数量；名字只读不等于表内容不可改 | §3.4.11；`lparser.c:1067 parlist`、`lcode.c:808 luaK_vapar2local`、`ltm.c:338 luaT_getvarargs`；04_lua55 检查 nil、n 与改表后 ... 的结果 | 交叉核对 |
| N04 | 满足条件时不实际构造 vararg table，可通过内部参数槽直接取索引与 n；若名字逃逸／被嵌套函数捕获等，就需要实际表 | §3.4.11 优化条件；`lobject.h PF_VAHID/PF_VATAB`、`lcode.c:808`、`ltm.c:292 luaT_getvararg`；04_lua55 的 indexed／escaped 字节码对照 | 交叉核对编译路径；不是所有具名 vararg 都无分配，也没测吞吐提升 |
| N05 | 数值／泛型 for 的控制变量在 5.5 为只读，旧代码可以因此在加载时失败。手册 §8.1 把 global 列为保留字，同时说明编译选项 LUA_COMPAT_GLOBAL 使它成为普通名字；**5.5.1 发布包的 luaconf.h 默认打开该选项**，所以默认构建里 global 仍可作变量名，只在语句开头按上下文识别为声明（P05） | [手册 §8.1](https://www.lua.org/manual/5.5/manual.html#8.1)、lparser 对声明／循环变量的处理；05_versions 的 for-assignment 与 global-declaration 跨版本结果；P05 | 交叉核对；本轮 for 赋值实验覆盖数值 for，泛型只依据手册与源码。2026-11-15 制作方更正：原表述「global 成为保留字」不适用于默认构建 |
| N06 | table.create 预留数组／哈希容量，返回的表仍是空表，容量不是已填充内容；utf8.offset 现在可同时返回字符终止字节位置 | §6.7 的 [table.create](https://www.lua.org/manual/5.5/manual.html#pdf-table.create)、§6.6 的 [utf8.offset](https://www.lua.org/manual/5.5/manual.html#pdf-utf8.offset)，`ltablib.c:64 tcreate` 与 `lutf8lib.c`；04_lua55 输出 0／true 和 1／2 | 交叉核对；实验只用一个合法双字节字符 |
| N07 | lua_newstate 在 5.5 增加字符串哈希 seed 参数；GC 参数不再经 mode 切换接口设置，而有 param／LUA_GCPARAM | §8.2／§8.3、`lstate.c:341`、`lapi.c` 的 lua_gc；5.4.9 对应函数签名对照 | 源码＋手册；本轮未做自定义 seed／GC 调参实验 |
| N08 | 外部字符串、fixed binary 复用载入内存等也是 5.5 改动，但有所有权、存活期、对齐／加载方式等条件 | [发行说明 Changes](https://www.lua.org/manual/5.5/readme.html#changes)、[lua_pushexternalstring](https://www.lua.org/manual/5.5/manual.html#lua_pushexternalstring)、[lua_load](https://www.lua.org/manual/5.5/manual.html#lua_load)；`lstring.c:318 luaS_newextlstr`、`ldo.c:1140–1146`、`lundump.c` | 静态定位；未实测，不宣称所有二进制加载零拷贝 |

## 10. 旧版本：只保留解释实现变化所需的对照

每行是两版之间的关键转折，不是完整发布清单。语言特性与默认配置以对应版手册为准，不以旧教程名称代替当前源码。

| 编号／版本 | 与 5.5 阅读直接相关的变化 | 一手定位与交叉证据 | 核查状态 |
|---|---|---|---|
| H01 4.0→5.0 | 4.0 VM 有 PUSH／POP 栈式操作；5.0 转为寄存器 VM，采用分离的数组／哈希表结构，并具有完整词法作用域、协程与元表机制 | 4.0.1 `src/lopcodes.h:91`、`src/lvm.c:351` 对照 5.0.3 `src/lopcodes.h:135`、`src/ltable.c:10`、`src/lfunc.c:40`；[Lua 5.0 的设计与实现论文](https://www.lua.org/doc/jucs05.pdf) 待阅读全文；[版本史](https://www.lua.org/versions.html#5.0) | 指令／结构静态交叉核对；历史动机与首引入年份未靠论文核完，不写未经核实因果 |
| H02 5.0→5.1 | 增量 GC、模块机制与新的可变参数机制是重要变化；5.1 仍可见函数环境 getfenv／setfenv 接口 | [版本史 5.1](https://www.lua.org/versions.html#5.1)、[5.1 手册](https://www.lua.org/manual/5.1/manual.html) §2.9／§5.1，5.1.5 `lgc.c:556 singlestep`、`lapi.c:616 lua_getfenv`；05_versions environment-api | 交叉核对；不把 5.1 的 env 字段布局搬到 5.5 |
| H03 5.1→5.2 | 全局名字通过词法环境 `_ENV` 解析；可让出的保护调用、continuation API、ephemeron 与 goto 等进入该版 | [5.2 手册 §2.2／§4.7](https://www.lua.org/manual/5.2/manual.html#2.2)、[版本史 5.2](https://www.lua.org/versions.html#5.2)；5.2.4 `lparser.c:297 singlevar`、`lapi.c:928 lua_pcallk`、`lgc.c:378 traverseephemeron`；当前运行时实验补证继承行为 | 源码＋手册交叉核对；本轮未在 5.2 运行 yield／ephemeron 专用样例 |
| H04 5.2→5.3 | integer／float 两个数值子类型、位运算、整除和基础 utf8 库改变了值标签、算术和标准库 | [5.3 手册 §2.1／§3.4](https://www.lua.org/manual/5.3/manual.html#2.1)、[版本史 5.3](https://www.lua.org/versions.html#5.3)；5.3.6 `lobject.h:59`、`lopcodes.h:195`、`lutf8lib.c:250`；05_versions 的 integer-subtype／bitwise-floor | 交叉核对；不是此前 Lua 从来不能做任何位运算 |
| H05 5.3→5.4 | 新的分代回收模式、const 与 to-be-closed 局部变量，是本片读取 GC／关闭流程所需的主要转折 | [5.4 手册 §2.5／§3.3.7／§3.3.8](https://www.lua.org/manual/5.4/manual.html#2.5)、[版本史 5.4](https://www.lua.org/versions.html#5.4)；5.4.9 `lgc.c:1255 youngcollection`、`lparser.c:1719 checktoclose`；05_versions 与 03_runtime | 交叉核对；不要扩写成「5.4 是 Lua 历史上首次尝试分代」 |
| H06 5.4→5.5 | global 声明、具名 vararg、紧凑数组、增量 major GC；同时有循环变量只读、API 与库行为的兼容性变化 | [5.5 发行说明 Changes](https://www.lua.org/manual/5.5/readme.html#changes)、[手册 §8](https://www.lua.org/manual/5.5/manual.html#8)；N01–N08、F28–F30、F46；05_versions | 交叉核对，逐项范围以上文为准 |

## 11. 锁定发布版的已知缺陷

官方 [5.5.1 缺陷页](https://www.lua.org/bugs.html#5.5.1) 在查阅日列出以下四项，并链接 Git 修复。本轮**使用原始 5.5.1 包，未把 Git 修复混入发布版**。不能把发布包的已知错误讲成语言规范，也不能从「Git 已修复」声称所用二进制已经包含修复。

| 编号 | 官方记录／本轮观察 | 证据与状态 |
|---|---|---|
| B01 | luaO_applyparam 接收负参数后左移可能触发未定义行为 | [5.5.1-1](https://www.lua.org/bugs.html#5.5.1-1)；官方记录／待交叉，未启用 UBSan 复现 |
| B02 | NaN 边界的数值 for 存在错误行为；本例实际进入循环，到第 11 次被实验的保护 break 截止，正确行为应不进入 | [5.5.1-2](https://www.lua.org/bugs.html#5.5.1-2)；08_known_bugs.lua 与 out_07 `NaN-loop-iterations 11`，交叉核对 |
| B03 | `-0.0 - 0` 的错误优化丢失负零符号；本例以倒数检查，未得到应有的负无穷 | [5.5.1-3](https://www.lua.org/bugs.html#5.5.1-3)；08_known_bugs.lua 与 out_07 `negative-zero-preserved false`，交叉核对 |
| B04 | 在错误清理协程期间重入 coroutine.close，可能丢失错误消息 | [5.5.1-4](https://www.lua.org/bugs.html#5.5.1-4)；官方记录／待交叉，本轮未独立复现 |

## 12. 未进入定稿的材料与待核实项

| 编号 | 尚需回答的问题 | 已有入口与下一项证据 |
|---|---|---|
| U01 | GC 的完整阶段、对象年龄、屏障触发及 major 切换怎样在一次真实分配过程出现？ | `lgc.c`、`lgc.h`；需可复现状态轨迹。当前不能写暂停毫秒数、吞吐或硬实时结论 |
| U02 | 表哈希冲突、扩容／删除后的节点搬移、含洞表长度边界如何精确演示？ | `ltable.c:858 insertkey`、`:913 luaH_newkey`、`:1301 luaH_getn`；需扩展内部只读检查实验，区分逻辑键与物理位置 |
| U03 | 短串驻留、长串散列、外部字符串生存期如何实测？ | `lstring.c`；需 C API／受控分配器实验，避免用相等值冒充同一内部对象 |
| U04 | C continuation、不可让出边界、userdata 与分配失败恢复有哪些可观察的反例？ | `lua_callk/lua_pcallk`、`lmem.c`、`ldo.c`；当前宿主例子只覆盖同步 C 调用和保护错误 |
| U05 | 二进制 chunk 的完整格式、fixed 模式的复用及不可信输入的限制？ | `ldump.c`、`lundump.c`、手册 lua_load；只验证了跨版本拒绝，不能据此声称可安全加载任意不可信字节码 |
| U06 | 标准库的模式匹配、排序、UTF-8 校验、I/O、OS、随机数与动态库加载细节？ | F08–F09 是覆盖地图，尚非这些子系统的逐函数审查；如需展开，每项补自己的事实与实验 |
| U07 | 4.0→5.0 的设计动机与历史阶段怎样讲才不失真？ | H01 已核源码差异，5.0 设计论文和 HOPL 原文尚未阅读全文；目前不提出未经取证的性能因果／设计者意图 |
| U08 | 本片究竟讲到哪一级深度、片长多少？ | 这是策划与内容取舍，尚未指定；本轮只建立可继续深入的地图，不把事实条目直接等同成片章节 |

## 13. 本轮复核记录

- 操作码索引已包含最后一个没有逗号的 OP_EXTRAARG，数量与 C 的 NUM_OPCODES 交叉核对；不能只匹配 `OP_名字,`。
- 表容量的判断以 F28 实际执行代码及实验为准，保留文件头注释不一致的说明。
- 区分 Lua 状态初始化和命令行宿主选择的 GC 模式；区分关闭上值、__close 与 __gc。
- 对照样本统一使用同一份 02_counter／05_versions 输入；不同构建对象、内部布局、API、字节码均不互认。
- 源码地图不表示全部分支运行过；没有人工文案确认、视听审查或成片验收记录。
- [09_verify_evidence.py](lab/09_verify_evidence.py) 核对发布包、未改源码、索引、模块覆盖、事实编号、进程字节流和本地链接，结果见 [out_09_verify_evidence.txt](lab/out_09_verify_evidence.txt)。这是材料一致性检查，不是制作交接或成片验收。

## 14. 制作方补证（2026-11-15）

制作方（Claude Opus 5.5）为写文案和画面补读源码、补做实验。行号均指未修改的 lua-5.5.1/src；「探针」指 [out_12_producer_runs.txt](lab/out_12_producer_runs.txt) 中 11_internals.c 或 12_probes.lua 的回显，只代表本环境。文案句号与事实编号的对应写在 `review/NOTES.md` 的事实对照里。

### 14.1 对象与背景

| 编号 | 陈述 | 依据与定位 | 核查状态／边界 |
|---|---|---|---|
| P01 | Lua 由巴西里约热内卢天主教大学（PUC-Rio）的团队设计与维护，诞生于该校的 Tecgraf 组，自 1993 年起有版本在使用；名字是葡萄牙语的「月亮」，写作 Lua，不是缩写 | [关于页](https://www.lua.org/about.html)（out_10 `about-page`）；[版本史](https://www.lua.org/versions.html) 1.0 段：未公开发布，1993-07-28 已在运行；1.1 于 1994-07-08 首次公开 | 官方记录；不展开早期动机 |
| P02 | Lua 实现为一个 C 库；发行版附带名为 lua 的宿主程序，用这个库提供独立解释器。官网称它可嵌入、常用于嵌入式系统与游戏 | [手册 §1](https://www.lua.org/manual/5.5/manual.html#1)；关于页「Lua is embeddable」「emphasis on embedded systems … and games」 | 官方记录；用途只按官网原意转述，不作排名 |
| P03 | 标志由 Alexandre Nakonechnyj 设计，© 1998 Lua.org；许可允许任意用途使用、复制、分发，条件是不冒称原作、只可修改环绕文字、按原比例缩放，并建议在印刷物中注明设计者。PostScript 原程序：行星半径 1、颜色 `0 0 0.5`（#000080），月亮半径 1−√2/2，位于 (1,1)，白色圆洞在 (1−2r,1−2r)，环绕虚线 0.5 灰，「Lua」用 Helvetica 0.9 居中 | [标志页](https://www.lua.org/images/)、[lua-logo-nolabel.ps](https://www.lua.org/images/lua-logo-nolabel.ps)；out_10；`tools/gen_logo.py` 据此生成 SVG，字形改用度量相同的 TeX Gyre Heros（L、u、a 宽度均为 556/1000，与 Helvetica 度量一致） | 交叉核对：生成的 SVG 与官方 128px GIF 叠合无重影（制作方目视，2026-11-15）；不改色、不拆件、不变形 |
| P04 | 官网主色：标题与链接 #000080，链接悬停底色 #D0D0FF，激活链接 #FF0000，页面底 #FFFFFF／#F8F8F8，边框 #CCCCCC；标题用 Verdana，正文 Helvetica | [lua.css](https://www.lua.org/lua.css)（out_10 `site-css`） | 官方样式表原值 |

### 14.2 值与字符串

| 编号 | 陈述 | 依据与定位 | 核查状态／边界 |
|---|---|---|---|
| P05 | 5.5.1 的 luaconf.h 默认定义 `LUA_COMPAT_GLOBAL 1`；扫描器初始化时把 "global" 的 extra 置 0，使它不是保留字；语法分析在语句开头遇到名字 global、且下一个记号是 `<`、名字、`*` 或 function 时，才按 global 声明处理 | `luaconf.h:342-346`、`llex.c:191-195`、`lparser.c:2117-2130`；探针 `LUA_COMPAT_GLOBAL=1`、`"global" extra=0`、`global-as-name 7` | 交叉核对；更正 N05 |
| P06 | TValue 由 8 字节的 Value 联合体（GC 对象指针、轻量 userdata 指针、轻量 C 函数、整数、浮点数）和 1 字节标签 tt_ 组成；本构建 sizeof(TValue)=16。标签第 0–3 位是基本类型，第 4–5 位是变体，第 6 位表示可回收 | `lobject.h:36-44`、`:49-68`；06_c_api `TValue=16` | 交叉核对；16 字节只代表本平台 |
| P07 | 每个可回收对象以 CommonHeader 开头：next、tt、marked；新建对象被挂到 global_State 的 allgc 链表头 | `lobject.h:302`；`lgc.c:297-306 luaC_newobjdt` | 源码交叉核对 |
| P08 | 长度不超过 LUAI_MAXSHORTLEN（40）的字符串经 internshrstr 查全局字符串表，内容相同就复用已有对象，因此短串相等可比较指针；更长的字符串每次新建，不查表 | `lstring.h:29`、`:54 eqshrstr`、`lstring.c:214-258`；探针：两块独立缓冲区各建一次 "label" 得到同一对象，41 字节的同内容得到两个对象 | 交叉核对；补足 F23 在本例上的实验 |

### 14.3 读入与编译

| 编号 | 陈述 | 依据与定位 | 核查状态／边界 |
|---|---|---|---|
| P09 | f_parser 读第一个字节：等于 LUA_SIGNATURE 的首字节 0x1B（`"\x1bLua"`）就交给 luaU_undump，否则交给 luaY_parser；lua_load 随后把注册表里的全局表放进主函数的第一个上值 | `ldo.c:1129-1155`、`lua.h:32`、`lapi.c:1120-1140`、`lstate.c:191-206 init_registry` | 源码交叉核对；配合 F10–F11 |
| P10 | llex 用一个 switch 按当前字符分派：换行、空白跳过，`--` 开始注释，引号开始字符串，数字开始数值，字母开始名字；名字读完后照常经 luaS_newlstr 创建字符串，若其 extra 非 0 即为保留字。luaX_init 预先创建 23 个保留字并在 extra 写入序号 +1 | `llex.c:467-566`、`:75-84`、`llex.h:33-41`、`lstring.h:48`；探针 `"while" extra=23` | 交叉核对 |
| P11 | `state.value = state.value + delta` 被切成 9 个记号；分析器经 luaX_next 每次取一个记号，必要时 luaX_lookahead 多看一个 | `llex.c:569-588`；记号数按 P10 的规则数出 | 源码推演；未用调试器逐个打印记号 |
| P12 | 名字解析顺序：当前函数的局部变量 → 外层函数（找到即逐层建立上值）→ 都没有则改写为 `_ENV.名字` | `lparser.c:476-505 singlevaraux`、`:506-517 buildglobal`、`:2153-2168 mainfunc` 建立 _ENV 上值 | 交叉核对；计数器字节码中全局名的 `GETTABUP … _ENV` |
| P13 | expdesc 记录尚未落地的表达式（如 VUPVAL、VINDEXUP 上值字段、VLOCAL、VKINT）；需要值时 luaK_dischargevars 才生成取值指令，discharge2reg 再填入目标寄存器；二元算术由 finishbinexpval 生成运算指令并紧跟一条 MMBIN；每条语句结束时 freereg 回到局部变量个数，临时寄存器全部释放 | `lparser.h:25-75`、`lcode.c:819-930`、`:999-1008`、`:1489-1517`、`lparser.c:2140` | 交叉核对；与内层函数字节码一致 |
| P14 | 计数器编译结果：主函数 74 条指令、4 个子原型；make_counter 7 条、含 1 个子原型；内层函数 7 条、最多 2 个寄存器、1 个上值，其描述为 `state instack=1 idx=1`，常量只有 "value"；`__index` 函数 5 条，协程体 9 条，pcall 里的函数 5 条，合计 107 条 | out_02 5.5.1 列表；探针 `[proto]`、`[upvaldesc]`、`[code]` | 交叉核对 |
| P15 | 常量折叠：`local x = 2 * 3` 编译为一条 `LOADI 1 6`；`a + 1` 用带立即数的 ADDI | 探针 snippets/fold.lua 5.5.1 列表；`lcode.c:1419 constfolding` | 实验观察＋源码 |

### 14.4 指令与执行

| 编号 | 陈述 | 依据与定位 | 核查状态／边界 |
|---|---|---|---|
| P16 | 指令为 32 位：低 7 位操作码；iABC 中 A 8 位、k 1 位、B 8 位、C 8 位；iABx 的 Bx 17 位；isJ 的 sJ 25 位。内层函数 ADD 的编码为 0x000100A2，即操作码 34（ADD）、A=1、k=0、B=1、C=0 | `lopcodes.h:14-36`、`:41-63`；探针 `[code] inner closure` | 交叉核对；只适用于 5.5.1 编码 |
| P17 | 同一句 `local a, b, c = 1, 2, 3; a = b + c`：4.0.1 列出 PUSHINT×3、GETLOCAL×2、ADD、SETLOCAL、END 共 8 条，ADD 不带操作数；5.0.3、5.1.5、5.2.4、5.3.6 为一条 `ADD 0 1 2`，后面没有 MMBIN；5.4.9、5.5.1 为 `ADD 0 1 2` 加 `MMBIN 1 2 6` | 探针 snippets/add.lua 七个编译器的列表；H01 | 实验观察；4.0.1、5.0.3 只建了 luac，未运行其解释器 |
| P18 | luaV_execute 循环：vmfetch 取 pc 处的指令并前移 pc，按低 7 位分派；`__GNUC__` 存在时使用 ljumptab.h 的标签地址表，否则用 switch；本构建定义了 `__GNUC__`。RA(i) 即 base + A，base 为当前函数之后的第一格 | `lvm.c:39-45`、`:1108`、`:1191-1238`、`ljumptab.h`；探针 `__GNUC__=16` | 源码＋编译环境；未反汇编机器码 |
| P19 | ADD 的处理：两个操作数都是整数则整数相加；都能作为浮点数则浮点相加；两种情况都把 pc 再前移一格，跳过随后的 MMBIN；否则不跳，下一条 MMBIN 按事件号（6 即 __add）调用 luaT_trybinTM | `lvm.c:964-1013`、`:1512-1515`、`:1562-1571`；`ltm.h:18-46` 事件顺序 | 交叉核对 |
| P20 | 计数器整段运行中，内层函数第 1、2、4、5、6 条指令各执行 3 次，第 3 条 MMBIN 与第 7 条 RETURN0 执行 0 次；协程继承主线程的 hook，因此协程中的那次调用也被计入 | 探针 `[trace]`；`lstate.c:291-293` | 实验观察 |
| P21 | GETTABUP 用常量里的短字符串作键，先在表里直接取（luaV_fastget + luaH_getshortstr），取不到才进入 luaV_finishget | `lvm.c:1306-1316` | 源码交叉核对 |

### 14.5 调用、闭包与全局变量

| 编号 | 陈述 | 依据与定位 | 核查状态／边界 |
|---|---|---|---|
| P22 | CALL 设置参数个数后调用 luaD_precall：轻量 C 函数与 C 闭包当场调用并返回 NULL；Lua 闭包则准备新的 CallInfo（帧末端 = 函数位置 + 1 + maxstacksize，savedpc 指向第一条指令），luaV_execute 换到新帧后跳回循环开头，不递归调用自身；其他值尝试 `__call` | `lvm.c:1726-1742`、`ldo.c:717-748`、`lstate.h:187-210` | 交叉核对 |
| P23 | RETURN1 把结果放到 base−1，即原来函数所在的格，再把当前帧换回上一层；只有标记为 CIST_FRESH 的帧（由 C 进入的那一层）才从 luaV_execute 返回 | `lvm.c:1808-1835`、`ldo.c:759-770` | 交叉核对 |
| P24 | 第一次调用 next_value(2) 时：主函数帧 base 在第 3 格；被调函数在第 8 格（主函数的 5 号寄存器），其 0 号寄存器在第 9 格放着参数 2，帧末端第 11 格；执行 RETURN1 前 1 号寄存器（第 10 格）为整数 42；CallInfo 链共 3 层：内层函数、主函数、宿主层 base_ci | 探针 `[stack]` 两次快照 | 实验观察；格号依赖本次加载与 lua_pcall 的方式，不推广为固定布局 |
| P25 | Lua 调 Lua 不嵌套 C 调用：非尾递归 100000 层正常结束；经 pcall（C 函数）递归时，嵌套 C 调用受 LUAI_MAXCCALLS=200 限制，实测到第 198 层得到 "C stack overflow" | `ldo.h:63`、`ldo.c:759-770 ccall`；12_probes `lua-recursion 100000`、`recursion-through-pcall deepest 198` | 实验观察；198 依赖调用方式 |
| P26 | CLOSURE 执行 pushclosure：上值描述 instack 为真时，用 luaF_findupval 在开放上值链表（按栈位置排序）中找该格，有则复用，无则新建一个 UpVal，其指针指向该栈格（UpVal 另有对象头、开放链表指针与关闭后存值的 TValue，`lobject.h:679-692`）；否则直接取外层闭包的上值 | `lvm.c:840-855`、`lfunc.c:87-98` | 交叉核对 |
| P27 | 关闭上值：把栈格中的 TValue 复制到 UpVal 内部的 value 字段，并把指针改指这份复制。make_counter 的 RETURN 带 k 标志，表示可能有开放上值需要关闭。探针在内层函数开始执行时看到其上值已关闭、开放上值链表为空；两次调用 make_counter 得到的计数器互不影响（42 与 40） | `lfunc.c:197-210`、`lvm.c:1769-1790`；探针 `word=0x00038146 RETURN k=1`、`closed=1 open-list-empty=1`；12_probes `independent-counters 42 40 42` | 交叉核对 |

### 14.6 表与元表

| 编号 | 陈述 | 依据与定位 | 核查状态／边界 |
|---|---|---|---|
| P28 | 手册：表是 Lua 唯一的数据结构机制，可表示数组、列表、符号表、集合、记录、图、树等 | [手册 §2.1](https://www.lua.org/manual/5.5/manual.html#2.1) | 官方原文 |
| P29 | 哈希部分有 2^lsizenode 个节点；每个节点存值、键与 next 偏移；整数键的主位置为 键 mod ((节点数−1) or 1)，8 个节点时即模 7；插入时主位置被占：若占位者不在自己的主位置，把它搬到空节点、新键占主位置，否则新键进空节点并接入链；空节点从 lastfree 往前找 | `lobject.h:752-786`、`ltable.c:145-151`、`:828-895`；文件头注释 `ltable.c:13-23` 的不变式 | 交叉核对 |
| P30 | 8 节点表依次插入 3、10、0、7、6：3 在 3 号；10 冲突进 7 号，3 号 next=4；0 在 0 号；7 冲突进 6 号，0 号 next=6；6 的主位置 6 号被 7 占，7 被移到 5 号、0 号 next 改为 5，6 进 6 号。再插 1、2、4 后全满；插入 5 时无空节点，重新散列为数组 16 格（存 1–7 与 10）、哈希 1 个节点（存 0） | 探针 `[hash]` 各步 | 实验观察；整数键位置与种子无关，字符串键的位置随启动时的随机种子变化（`lauxlib.c:1168-1199`） |
| P31 | 重新散列时 computesizes 在 2 的幂中选数组容量：容量不超过落入其中的整数键个数的 3 倍才采用，理由是一个哈希节点约占数组一格的 3 倍内存 | `ltable.c:418-465` | 交叉核对；与 F28 一致，只在重新散列时发生 |
| P32 | `{value = 40}` 建出的表没有数组部分，哈希部分 1 个节点 | 探针 `[state] asize=0 nodes=1` | 实验观察 |
| P33 | 表读取缺键且表有元表时，luaV_finishget 取 __index：是函数就以（表，键）调用，结果即读取结果；否则对它继续索引，循环最多 MAXTAGLOOP=2000 次 | `lvm.c:50`、`:291-322` | 交叉核对 |
| P34 | 元表的 flags 字节缓存「没有某元方法」：luaT_gettm 查不到就置位，之后 fasttm 只看这一位；只对前 6 个事件（__index 到 __eq）有效；invalidateTMcache 清零这些位。共有 25 个元方法事件 | `ltm.c:60-68`、`ltm.h:18-55`、`ltable.h:23`；探针 `TM_N=25` | 交叉核对；invalidateTMcache 的调用点未逐一列出，文案不讲清零时机 |

### 14.7 错误、协程、回收、C API

| 编号 | 陈述 | 依据与定位 | 核查状态／边界 |
|---|---|---|---|
| P35 | luaD_rawrunprotected 在栈上建一个 lua_longjmp（含 jmp_buf 与指向上一个的指针），挂到 L->errorJmp，再 LUAI_TRY 调用目标；luaD_throw 对最近的 errorJmp 执行 LUAI_THROW。luaD_pcall 出错后恢复 ci、关闭上值与待关闭变量、把错误对象放到原栈顶 | `ldo.c:60-108`、`:125-171`、`:1083-1100` | 交叉核对；本 Windows 构建走 ISO C 的 setjmp/longjmp 分支（未定义 LUA_USE_POSIX，见 `luaconf.h:50-87`） |
| P36 | coroutine.yield 是 C 函数 luaB_yield，调用 lua_yieldk：把线程状态设为 LUA_YIELD、记下交出的值个数，然后 luaD_throw(L, LUA_YIELD)，回到 lua_resume 里 luaD_rawrunprotected 的保护点。恢复时 resume 先完成那次被中断的 C 调用（luaD_poscall），再 unroll 沿 CallInfo 继续执行 Lua 函数 | `lcorolib.c:113-115`、`ldo.c:868-879`、`:918-945`、`:968-1000`、`:1008-1035` | 交叉核对；T06–T07 |
| P37 | 在不可让出的 C 调用中 yield 会报 "attempt to yield across a C-call boundary"；pcall 用 lua_pcallk 登记续接函数 finishpcall，因此协程中 pcall 内可以 yield | `ldo.c:1013-1019`、`lbaselib.c:475-482`；03_runtime `yieldable-pcall` | 交叉核对 |
| P38 | 三色：白＝未标记，灰＝已标记、其引用未全查，黑＝自身与引用都已标记；不变式：黑对象不能指向白对象。一轮从主线程、注册表、全局元表和待终结对象开始；状态依次为 propagate、enteratomic、atomic、四个清扫状态、callfin、pause | `lgc.h:12-37`、`lgc.c:440-447`、`:1617-1690` | 源码交叉核对 |
| P39 | 写屏障两种：luaC_barrier_ 把被指向的白对象标记（向前），luaC_barrierback_ 把黑色的表重新放回 grayagain 列表（向后）；表插入新键时调用后者 | `lgc.c:246-280`、`ltable.c:921` | 源码交叉核对；未做动态计数 |
| P40 | 有两种白色；atomic 阶段末尾翻转 currentwhite；新对象涂当前白色；清扫只释放带「另一种白」的对象，并把存活对象改回当前白色 | `lgc.h` WHITE0BIT/WHITE1BIT、`lgc.c:1579`、`:892-909 sweeplist` | 源码交叉核对 |
| P41 | 分配记账：GCdebt 随分配减少，luaC_condGC 在 GCdebt≤0 时调用 luaC_step；增量模式每步做一定量工作后重设额度 | `lgc.h:233-238`、`lmem.c:187`、`lgc.c:1710-1760` | 源码交叉核对；不给暂停时长 |
| P42 | 手册：增量模式把标记—清扫切成小步与程序交替；分代模式频繁做只遍历新近对象的 minor 回收，超过阈值再转为遍历全部对象的 major 回收。对象年龄有 new、survival、old0、old1、old 等 | [手册 §2.5.1／§2.5.2](https://www.lua.org/manual/5.5/manual.html#2.5.1)、`lgc.h` G_NEW…G_TOUCHED2 | 官方原文＋源码 |
| P43 | 手册：弱表的元素是弱引用，回收器忽略弱引用；由元表的 __mode 指定 | [手册 §2.5.4](https://www.lua.org/manual/5.5/manual.html#2.5.4) | 官方原文；配合 F44 |
| P44 | 4.0 起标准库的函数都用官方 API 写成（版本史）；5.5.1 的 lbaselib.c 只包含 lua.h、lauxlib.h、lualib.h 与 llimits.h（宏），不包含 lobject.h、lstate.h 等内部结构头 | [版本史 4.0](https://www.lua.org/versions.html#4.0)；`lbaselib.c:10-22` | 交叉核对；其他库文件未逐一列出 include |
| P45 | lua.c 的 main 建状态、停 GC，以保护模式调用 pmain；pmain 打开标准库、建立 arg 表、重启 GC 并切到分代、运行 LUA_INIT 与命令行选项、加载并调用脚本；main 最后 lua_close。lua.c 共 794 行 | `lua.c:725-794`、`:264-275 handle_script`；out_01 行数 | 交叉核对；F47 |

- 2026-11-15 制作方（Claude Opus 5.5）：更正 N05（默认构建中 global 不是保留字）；补第 14 节 P01–P45；新增实验 10、11、12 与 tools/gen_logo.py。

### 14.8 第 2 稿补证：语言层面的说明与新增细节（2026-11-16）

第 2 稿面向只有通用计算机基础的观众，在讲实现之前先说明语言特性。以下陈述取自 5.5 参考手册原文、官网与源码，并由 [13_language.lua](lab/13_language.lua) 补做实验（回显在 out_12 的 `[13_language.lua …]` 段）。

| 编号 | 陈述 | 依据与定位 | 核查状态／边界 |
|---|---|---|---|
| P46 | 短字符串在创建时用全局种子算出哈希值存入 TString 的 hash 字段；查表时字符串键的主位置直接由这个值取模得到（hashstr）；种子由 luaL_newstate 用局部变量地址与当前时间生成，所以字符串键所在的节点在两次运行间可能不同 | `lstring.c:214-247 internshrstr`（第 218 行算哈希）、`:171 createstrobj`、`ltable.c:115 hashstr`、`lauxlib.c:1168-1199` | 源码交叉核对；P30 用整数键演示正是为了避开这一点 |
| P47 | 记号（Token）由一个整数 token 与语义信息 SemInfo 组成；SemInfo 是联合体：浮点数、整数，或指向字符串对象（名字与字符串字面量）的指针；不超过 40 字节的是驻留的短串，更长的字面量是不驻留的长串（P08） | `llex.h:49-59`、`llex.c` 中 `seminfo->ts = …` | 源码交叉核对 |
| P48 | 二元运算符的优先级表：`+ -` 为 10，`* % / //` 为 11，`^` 左 14 右 13（右结合），`..` 左 9 右 8，比较为 3，and 为 2，or 为 1；subexpr 只在运算符优先级高于当前界限时继续向右读 | `lparser.c:1355-1405` | 源码交叉核对 |
| P49 | 手册：Lua 的所有值都是一等值，可以存进变量、作为参数传递、作为结果返回；函数可以返回多个值 | [手册 §2.1](https://www.lua.org/manual/5.5/manual.html#2.1)、§3.3.4；13_language `function-as-value 7` | 官方原文＋实验 |
| P50 | 手册：函数定义是在运行时求值的表达式；预编译时函数体也被编译，但尚未创建；每执行一次函数定义就实例化一次，这个实例称为闭包。局部变量可被其作用域内定义的函数自由访问，被内层函数使用的局部变量称为上值；每执行一次 local 语句就定义新的局部变量 | [手册 §3.4.11](https://www.lua.org/manual/5.5/manual.html#3.4.11)、[§3.5](https://www.lua.org/manual/5.5/manual.html#3.5) | 官方原文 |
| P51 | 手册：每个值都可以有元表；元表是普通的 Lua 表；元表中每个事件的键是事件名前加两个下划线；`__add` 在加法的任一操作数不是数字时被查找，先查第一个操作数，再查第二个，找到就以两个操作数调用并以结果作为运算结果，找不到就报错 | [手册 §2.4](https://www.lua.org/manual/5.5/manual.html#2.4)；13_language `metamethod-add 11 22 calls 1`、`plain-tables-add false` | 官方原文＋实验；补足 F33 所缺的自定义 `__add` 实验 |
| P52 | 手册：Lua 代码可以调用 error 抛出错误；pcall 以保护模式调用函数，函数中任何错误都会停止其执行，控制立即回到 pcall，pcall 返回状态码；错误对象可以是任何值 | [手册 §2.3](https://www.lua.org/manual/5.5/manual.html#2.3)；13_language `error-table false 7` | 官方原文＋实验 |
| P53 | 手册：协程也称协作式多线程；与多线程系统中的线程不同，协程只在显式调用 yield 时暂停；create 只创建协程、不启动；resume 运行它直到结束或 yield；yield 的参数作为 resume 的额外结果，再次 resume 的参数作为 yield 的结果；status 返回 running、suspended、normal、dead；coroutine.wrap 返回一个每次调用都会恢复协程的函数 | [手册 §2.6](https://www.lua.org/manual/5.5/manual.html#2.6)、[§6.2](https://www.lua.org/manual/5.5/manual.html#6.2)；13_language `generator 1 2 3`、`coroutine-states suspended running suspended dead`、`values-exchanged 11 42` | 官方原文＋实验 |
| P54 | 手册：Lua 自动管理内存，不必为新对象分配或在不需要时释放；回收器能确定对象在正常执行中不会再被访问时，对象即为死对象；设置了 `__gc` 的对象死去后不立即回收，先调用终结器，对象通常在下一轮回收时才被释放 | [手册 §2.5](https://www.lua.org/manual/5.5/manual.html#2.5)、[§2.5.3](https://www.lua.org/manual/5.5/manual.html#2.5.3)；13_language `gc-finalizer finalized` | 官方原文＋实验；实验只证明终结器被调用，未观察释放发生在哪一轮 |
| P55 | 手册：表是 Lua 唯一的数据结构机制；`a.name` 是 `a["name"]` 的语法糖；同一张表可同时有整数下标与字段 | [手册 §2.1](https://www.lua.org/manual/5.5/manual.html#2.1)；13_language `table-mixed 10 20 30 x 3` | 官方原文＋实验 |
| P56 | 官网关于页：Lua 5.5.1 的发布包压缩后 390K、解压后 1.5M，源码约 32000 行 C；把「small」列为特点之一；Lua 被用于许多工业应用，偏重嵌入式系统与游戏 | [关于页](https://www.lua.org/about.html)（out_10 `about-page`） | 官方记录；与 V02（398643 字节）、F02（32202 行）一致 |
| P57 | 标志 PostScript 程序中三个圆分别命名为 planet（行星）、hole（圆洞）、moon（月亮），环绕的虚线命名为 orbit | lua-logo-nolabel.ps 的 `%-- planet --`、`%-- moon --`、`%-- orbit --` 段与 `/MOONCOLOR` | 原件核对；支持旁白「标志画的是一颗行星和环绕着它的月亮」 |
| P58 | 生产级实现在可移植与效率之间留出编译期选择：分派用标签地址表或 switch（`LUA_USE_JUMPTABLE` 随 `__GNUC__`）；错误处理用 C++ 异常、POSIX `_longjmp` 或 ISO C `longjmp`（`LUAI_THROW`/`LUAI_TRY`） | `lvm.c:39-45`、`ldo.c:60-108`；F18、F37 | 源码交叉核对 |

- 2026-11-16 制作方（Claude Opus 5.5）：第 2 稿补 P46–P58，新增实验 13_language.lua（接入 12_producer_runs.py）。

### 14.9 第 3 稿补证与更正（2026-11-21）

自对抗审查中的事实核对发现几处措辞超出依据，已改文案；以下两条补足版本归属，两处更正见 P26、P47。

| 编号 | 陈述 | 依据与定位 | 核查状态／边界 |
|---|---|---|---|
| H07 | 版本史：Lua 5.0 的主要新特性是基于协程的协作式多线程、取代旧式上值的完整词法作用域、取代 tag 的元表；5.0 还引入了布尔、真正的尾调用与弱表 | [版本史 5.0 段](https://www.lua.org/versions.html#5.0)（`_src/pages/versions.html`） | 官方记录；与 H01 的源码对照一致 |
| H08 | 分代回收在 5.2 是可选的实验特性（5.2 手册 §2.5：假定多数对象「死得早」，只遍历新近创建的对象，并不时做一次完整回收；5.2.4 `lua.h:291 LUA_GCGEN`）；5.3 移除了它（5.3 手册 §8.1）；版本史称 5.4 的主要新特性之一是「新的分代回收模式」 | `_src/lua-5.2.4/doc/manual.html` §2.5、`_src/lua-5.3.6/doc/manual.html` §8.1、版本史 5.4 段 | 官方原文＋源码；补足 H05「不要扩写成 5.4 首次尝试分代」的边界 |
| P59 | 文案「调用」一章的栈格号与三层调用帧来自 11_internals.c 的最小宿主（luaL_loadfile 后直接 lua_pcall）；官方 lua.c 先用 lua_pcall 调 pmain，docall 还会压入消息处理函数，帧数与格号都不同 | P24；`lua.c:788` 调 pmain、`:158-168 docall` 压入 msghandler | 源码交叉核对；文案说明这是最简单的宿主 |
| P60 | 解释循环用标签地址表的条件是定义了 `__GNUC__`（源码注释：gcc 及兼容的编译器），不只限 GCC | `lvm.c:36-45` | 源码交叉核对；更正 P18、P58 的口径 |
| P61 | 布尔与 nil 的区分只靠标签（`LUA_VFALSE`、`LUA_VTRUE`、`LUA_VNIL` 等变体），不使用 Value 的 8 字节 | `lobject.h:183`、`:251-252` | 源码交叉核对 |

- 2026-11-21 制作方（Claude Opus 5.5）：第 3 稿补 H07、H08、P59–P61，更正 P26、P47 的措辞。

### 14.10 第 4 稿：各章的程序（2026-11-21）

策划者要求不再用一段程序贯穿全片，各章换用合适的程序（README「简报」）。程序在 [chapters/](lab/chapters/)，由 [14_chapter_runs.py](lab/14_chapter_runs.py) 在 07 的同一批构建上运行，回显在 [out_14_chapter_runs.txt](lab/out_14_chapter_runs.txt)；只代表本环境。

| 编号 | 陈述 | 依据与定位 | 核查状态／边界 |
|---|---|---|---|
| Q01 | 同一个变量先后存 1、"one"、{}，type 依次为 number、string、table；math.type(3) 为 integer、math.type(3.0) 为 float，而 3 == 3.0 为真；math.maxinteger + 1 == math.mininteger 为真（整数运算按二进制补码回绕）；2^53 + 1 == 2^53 为真（`^` 总得浮点数，超出 53 位精度） | c04_value.lua 回显；手册 §2.1、§3.4.1 | 实验观察＋手册 |
| Q02 | `load("local while = 1")` 返回 nil 与「<name> expected near 'while'」；默认构建里 `local global = 5` 可以运行；`1--[[ 注释 ]]+2` 得 3（`--` 后紧跟 `[` 时按长注释整段跳过，`llex.c:484-488`）；`0x10`、`1e2`、`7 // 2` 分别是 16、100.0、3 | c05_lex.lua 回显；P05、P10 | 实验观察 |
| Q03 | `local a, b, c = 1, 2, 3; a = b + c * 2; local d = 2 * 3` 在 5.5.1 编译为：三条 LOADI；`MULK 3 2 0` 把 c 乘常量 2 放进临时的 3 号寄存器，后跟 MMBINK；`ADD 0 1 3` 后跟 MMBIN；`2 * 3` 折叠成 `LOADI 3 6`；共 10 条指令 | c06_compile.lua 的 luac 列表；P13、P15、P48 | 实验观察 |
| Q04 | `"10" + 1`：5.3.6 得 11.0（float），5.4.9 与 5.5.1 得 11（integer）。5.3.6 的 OP_ADD 自己用 tonumber 把字符串转成浮点数再相加（`lua-5.3.6/src/lvm.c:889-901`）；5.5.1 的 ADD 只对数字走快路（`tonumberns`，不转换字符串，`lvm.c:971`；5.4.9 相同，`lua-5.4.9/src/lvm.c:934`，字符串库的 __add 在 `lstrlib.c:331`），字符串落到 MMBIN，由字符串库给字符串设的元表里的 __add 处理（`lstrlib.c:259-300`、`:333`），它把 "10" 转成整数 10 再相加。`getmetatable("").__add` 在 5.3.6 为 nil、5.4.9 起存在；`{} + 1` 在三个版本都报「attempt to perform arithmetic on a table value」 | c08_vm.lua 在三个版本的回显；手册 5.5 §3.4.3「the string library sets metamethods that try to coerce」 | 交叉核对 |
| Q05 | 非尾递归 `return 1 + deep(n - 1)`：100000 层正常；二分查找得最深 499990 层，再深一层报「stack overflow」（Lua 栈的上限 LUAI_MAXSTACK = 1000000 格，`ldo.c:186-194`）。经 pcall 递归自身，在第 197 层得到「C stack overflow」（与 P25 的 198 层是不同写法，层数随调用方式变化）。尾递归 `return loop(n - 1)` 走 10000000 层正常结束 | c09_call.lua 回显 | 实验观察；层数只代表本环境与这几种写法 |
| Q06 | for 循环里每轮建一个返回 i 的函数，三个函数得 1、2、3；while 循环里同样建三个返回 j 的函数，得 3、3、3。luac 列表：for 循环体末尾、FORLOOP 之前有一条 CLOSE（关闭这一轮 i 所在的寄存器），每轮结束关闭这一轮的 i；while 循环体里没有 CLOSE，三个闭包共用同一个仍开放的 j 上值 | c10_closure.lua 回显与 luac 列表；手册 §3.3.5（循环变量是循环体的局部变量）、§3.5（每执行一次 local 语句就定义新的局部变量，手册的例子正是循环里各建一个闭包）、P26、P27 | 实验观察＋手册 |
| Q07 | `{10, 20, 30, name = "lua"}`：t[1] 为 10，t.name 与 t["name"] 都是 "lua"，#t 为 3；`t[1.0] = 11` 后 t[1] 为 11。u[1]、u[2]、u[4] 有值时 #u 在 5.4.9 为 4、在 5.5.1 为 2；`{1, 2, nil, 4}` 的长度同样是 4 与 2。手册只保证 # 返回一个「边界」，两种结果都合规 | c11_table.lua 在 5.4.9 与 5.5.1 的回显；手册 §3.4.7「border」、F26、F27 | 实验观察＋手册；不解释两版选边界的内部差异 |
| Q08 | Animal、Dog 两张元表用 __index 串成链：rex:fetch() 得「Rex fetches」，rex:speak() 得「Rex makes a sound」；speak 不在 rex 也不在 Dog 里（rawget 为 nil），只在 Animal 里 | c12_meta.lua 回显；P33；手册 §3.4.10：`v:name(args)` 是 `v.name(v, args)` 的语法糖 | 实验观察 |
| Q09 | error 抛出一张表，pcall 接到的是同一张表（code 为 7）；`<close>` 变量所在函数出错时，先调用 __close（收到错误对象 "fail"），pcall 再返回 false 与 "fail" | c13_error.lua 回显；F36、F48 | 实验观察 |
| Q10 | coroutine.wrap 包装的生产者依次交出 "lua"、"is"、"small"，泛型 for 逐个取出并转大写，得「LUA IS SMALL」；在 table.sort 的比较函数里 yield，resume 返回 false 与「attempt to yield across a C-call boundary」；在 pcall 里 yield 则可以，交出 "inside pcall"，再次 resume 后 pcall 正常返回 true 与 "resumed" | c14_coro.lua 回显；P37、F38 | 实验观察 |
| Q11 | 两张互相引用的表（其中一张存 100000 个整数），函数返回后仍占约 1152 KB；一次完整回收后增量为 0，指向它的弱引用被清除 | c15_gc.lua 回显；F43 | 实验观察；KB 数只代表本环境 |
| Q12 | Q03 里的 `ADD 0 1 3` 编码为 0x03010022：操作码 34 在第 0–6 位，A=0 在第 7–14 位，k=0 在第 15 位，B=1 在第 16–23 位，C=3 在第 24–31 位 | `lopcodes.h:42-66` 的 SIZE_／POS_ 定义，ADD 在操作码枚举中序号 34；同一算式算出内层函数的 `ADD 1 1 0` 为 0x000100A2，与探针实测（P16）一致 | 由已核实的编码规则计算 |
| Q13 | 主函数总是可变参数函数：mainfunc 调用 setvararg，于是 Q03 列表的第 1 条是 VARARGPREP | `lparser.c:2153-2157`（注释「main function is always vararg」）；手册 §3.3.2：主块被当作一个参数个数可变的匿名函数 | 源码＋手册 |
| Q14 | `3 == 3.0` 为真：luaV_equalobj 遇到一个整数一个浮点数时，只有浮点数恰好是那个整数值才相等 | `lvm.c:588-602` | 源码交叉核对；配合 Q01 |
| Q15 | 浮点数键若恰好是整数值，查表前先转成整数键（luaH_get 对 LUA_VNUMFLT 调 luaV_flttointeger，再走 luaH_getint），所以 t[1.0] 与 t[1] 是同一个位置 | `ltable.c:1030-1033`；F26 | 源码交叉核对；配合 Q07 |
| Q16 | 二元元方法先查第一个操作数，第一个没有才查第二个（callbinTM）；所以 `"10" + 1` 在第一个操作数 "10" 上就找到了字符串的 __add | `ltm.c:138-142`；P51 | 源码交叉核对；更正第 4 稿初稿「先看 1」的说法 |

### 14.11 第 5 稿：核实 Gemini 4 Neon 审读提出的问题（2026-11-21）

第 4 稿交 Gemini 4 Neon 审读（提示见 `review/GEMINI-PROMPT-R1.txt`）。它提出的事实问题逐条回到 5.5.1（必要时 5.4.9）源码与本片构建核实，成立的记在下面；第 07 章程序改为局部变量后重跑 14，表的长度另用 [15_table_length.c](lab/15_table_length.c) 探针（[15_table_length.py](lab/15_table_length.py) 编译运行，回显 [out_15_table_length.txt](lab/out_15_table_length.txt)）。

| 编号 | 陈述 | 依据与定位 | 核查状态／边界 |
|---|---|---|---|
| Q17 | 内部的基本类型编号有 9 个：nil 0、布尔 1、轻量 userdata 2、数字 3、字符串 4、表 5、函数 6、完整 userdata 7、线程 8（LUA_NUMTYPES 9）；type 把两种 userdata 都报成 "userdata"，所以语言层面是 8 种。Value 联合体里除 gc 指针、整数、浮点数外，还有轻量 userdata 的指针 p 与轻量 C 函数的函数指针 f：它们直接存在这 8 个字节里，不在堆上分配（轻量 C 函数是函数类型的变体 LUA_VLCF） | `lua.h:64-74`；`lobject.h:49-57`、`lobject.h:641-643`；手册 §2.1 | 源码交叉核对；更正第 4 稿「函数只能在堆上分配」的笼统说法 |
| Q18 | 算术指令生成时目标寄存器先写 0，表达式记为 VRELOC（可重定位）；等这个值要落到某个寄存器时才回填 A。所以 Q03 里 MULK 的 3 号，是 ADD 需要它在寄存器里时（codebinexpval 对右操作数调 luaK_exp2anyreg）才填上的；ADD 的 0 号，是赋值给 a 时填上的 | `lcode.c:1489-1499`（finishbinexpval：`luaK_codeABCk(fs, op, 0, …)`、`e1->k = VRELOC`）、`lcode.c:1507-1510`、`lcode.c:912-916`（discharge2reg 的 VRELOC 分支 SETARG_A） | 源码交叉核对；更正第 4 稿「积放进 3 号」先于回填的说法 |
| Q19 | 字面量写法 `"10" + 1` 在 5.5.1 编译为 LOADK、`ADDI`、`MMBINI`（右操作数是小整数常量）；第 07 章程序改为 `local s, n = "10", 1; local r = s + n`，编译为 `ADD 2 0 1` 后跟 `MMBIN 0 1 6`（6 即 __add）。结果与 Q04 相同：5.3.6 得 11.0（float），5.4.9、5.5.1 得 11（integer）；"3.0" + n 都得 4.0；空表加 n 都报错 | `out_14_chapter_runs.txt` 的 c08 段（含 luac 列表）；字面量写法另用 luac 5.5.1 列表核对 | 实验观察；第 07 章画面删去 getmetatable 一行 |
| Q20 | Q05 的 deep 每深一层，Lua 栈多占 2 格：deep 把自己取到 1 号寄存器（GETUPVAL 1 0）、参数 n - 1 放 2 号，`CALL 1 2 2`；新一层从被调函数后面一格、即上一层的 2 号开始。上限 1000000 格除以 2，与实测最深 499990 层相合 | luac 5.5.1 列表（c09_call.lua 的 deep）；Q05 | 实验观察＋推导 |
| Q21 | 5.5.1 的数组部分，值与标签之间夹着一个 4 字节的 unsigned，作 `#t` 的长度提示（lenhint）；1024 格占 1024 × 9 + 4 = 9220 字节，多出的 4 字节就是它。扩容时提示设为新数组大小的一半；luaH_getn 从提示处开始，前后各看至多 4 格找边界，找不到再二分。5.4.9 的 luaH_getn 从 alimit（数组末尾）开始。u[1]、u[2]、u[4] 逐个赋值后，两版的数组部分都是 4 格：5.4.9 第 4 格有值，答 4；5.5.1 提示为 2，第 2 格有值、第 3 格空，答 2 | `lua-5.5.1/src/ltable.h:100-124`（注释「The unsigned between the two arrays is used as a hint for #t」）、`ltable.c:742`、`ltable.c:1301-1335`；`lua-5.4.9/src/ltable.c:938-…`；探针回显 `5.4.9 realasize=4 alimit_before=4 len=4`、`5.5.1 asize=4 lenhint_before=2 len=2` | 实验观察＋源码交叉核对；补足第 4 稿只说「两个答案都对」 |
| Q22 | lua_State 的 nCcalls 低 16 位数 C 调用层数，高 16 位数「不能让出」的调用；lua_callk 不给续接函数时走 luaD_callnoyield，计数加一；lua_yieldk 先查这个计数，不为 0 就报「attempt to yield across a C-call boundary」。table.sort 用 lua_call 调比较函数，没有续接函数 | `lstate.h:94-104`；`lapi.c:1037-1053`；`ldo.c:1015-1017`；`ltablib.c:282` | 源码交叉核对；配合 Q10 |
| Q23 | Makefile 的 LIB_O 共 12 个：lauxlib（辅助库）、linit 与 10 个标准库文件；lua.c 运行脚本时，用 pushargs 把命令行参数压栈、再以这些参数调用主函数（handle_script），脚本里用 `...` 取到——主函数总是可变参数函数（Q13）就是为此 | `Makefile:36-37`；`lua.c:251-274` | 源码交叉核对；更正「12 个标准库文件」 |
| Q24 | flags 字节只有低 6 位缓存「没有这个元方法」（maskflags 覆盖 TM_INDEX 到 TM_EQ）；第 6 位 BITDUMMY 表示这张表的哈希部分用的是共享的空节点 | `ltm.h:54`；`ltable.h:23-31`；P34 | 源码交叉核对；更正第 4 稿「每一位对应一种常用的元方法」 |
| Q25 | 带 __gc 的对象被判定为死时，终结器还要用到它，所以它（以及只经它可达的对象）先被「复活」；通常这次复活是暂时的，内存到下一轮回收才释放。原子阶段一口气完成：标记正在运行的线程、注册表与全局元表并传播；重新标记可能已死线程的上值；遍历 grayagain（回收期间被写屏障重新涂灰的对象）；清除弱表里的值；挑出待终结的对象并标记它们（传播复活）；清除弱表里死去的键；最后切换当前白色 | 手册 §2.5.3（「must be resurrected by Lua. Usually, this resurrection is transient, and the object memory is freed in the next garbage-collection cycle」）；`lgc.c:1543-1579` | 手册＋源码交叉核对 |
| Q26 | 分代模式的对象年龄占 3 位，共 7 种：G_NEW、G_SURVIVAL、G_OLD0、G_OLD1、G_OLD、G_TOUCHED1、G_TOUCHED2；文案按新建、活过一轮、老三类概括时须说「大致」 | `lgc.h:110-116` | 源码交叉核对 |
| Q27 | C API 的栈下标：正数是从栈底数起的绝对位置，1 是最先压入的元素；负数从栈顶倒数，-1 是栈顶元素 | 手册 §4.1；`lapi.c` index2value | 手册 |
| Q28 | 整数键的主位置是除以 `(节点数 - 1) | 1` 的余数，节点数是 2 的幂时就是节点数减 1，是个奇数；源码注释说明，除了哈希值本身就好的类型，别的类型最好避免用 2 的幂取模，因为它们可能含有很多因子 2 | `ltable.c:103-112`（hashmod 与注释）、`ltable.c:145-151`（hashint） | 源码交叉核对 |
| Q29 | 开放上值的链表 openupval 挂在每个 lua_State 上（每个协程一条），由 lfunc.c 查找与关闭；编译时名字在各层函数都找不到，就定为全局名，若正处在 global 声明的作用域里而它没被声明，报「variable 'x' not declared」，检查之后才改写成 `_ENV` 的字段；指令里的 k 位含义随指令而定（如 MMBINI／MMBINK 里表示操作数换过位置，RETURN／TAILCALL 里表示要关闭上值） | `lstate.h:294`；`lparser.c:520-535`（buildvar）；`lopcodes.h:395-405` | 源码交叉核对 |
| Q30 | 手册 §1：作为扩展语言，Lua 没有「主程序」的概念，它总是嵌在一个宿主程序里运行（「Lua has no notion of a "main" program: it works embedded in a host client, called the embedding program or simply the host」），宿主常常就是独立的 lua 程序 | `lua-5.5.1/doc/manual.html` §1；P02 | 手册原文；第 6 稿开场与第 01 章引用 |
| Q31 | 手册 §1 的自我介绍：Lua 是强大、高效、轻量、可嵌入的脚本语言；它把简单的过程式语法，和基于关联数组、语义可扩展的数据描述结构结合在一起（「Lua combines simple procedural syntax with powerful data description constructs based on associative arrays and extensible semantics」）；动态类型，用寄存器式虚拟机解释字节码，自动管理内存；实现为一个库，用 clean C（标准 C 与 C++ 的公共子集）写成；发布包里的宿主程序 lua 用这个库提供完整的独立解释器；Lua 既可嵌入任何需要脚本的程序，也可作为独立语言使用 | `lua-5.5.1/doc/manual.html` §1 | 手册原文；第 7 稿第 01 章与结语引用；「扩展语义靠元表」由 §2.4 元表一节对应 |
