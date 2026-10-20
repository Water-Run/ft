# 事实出处

片中的陈述（旁白与画面）与其依据。取证日期 2026-10-01，对象为 luainstaller 1.4.0（源码 `6346a8a`，LuaRocks 上的 `1.4.0-1`）。

原始记录都在 `research/lab/`：`NN_*.sh` 是执行的脚本，`out_*.txt` 是完整回显，`v2/art/` 是从构建机取回的真实产物。画面上的终端文字、源码、清单、哈希、字节、反汇编、文件布局由 `tools/gen_data.py` 从这些文件生成到 `src/js/data.js`，不手写；生成脚本里的 `assert` 会在数据与预期不符时中止。

## 取证环境

| 记录 | 环境 |
|---|---|
| `v2/out_11_usage.txt` | 干净的 `fedora:44` 容器（podman）。`dnf install lua lua-devel lua-static compat-lua-devel luarocks gcc make …`；`luarocks install luainstaller luastatic luafilesystem lua-cjson pegasus`。Lua 5.4.8、GCC 16.2.1、LuaRocks 3.9.2。普通用户 `waterrun`，演示项目在 `~/moon`。构建时用 `LUAI_CC` 指向一个只做记录的包装脚本，编译命令原文见 `v2/cc.log` |
| `v2/out_12_clean.txt` | 另一个干净的 `fedora:44` 容器，**没有 Lua、没有编译器、没有 LuaRocks 模块**，只放入上一步的产物 |
| `v2/out_14_prereq.txt` | 分三步的构建前提：只有 `lua` → 加 `gcc` → 加 `lua-devel`（安装器用源码目录里的 `tools/install.lua`，因为 Fedora 的 `luarocks` 包会连带装上编译器与头文件） |
| `v2/out_15_extra.txt` | 默认输出位置、可复现、路径是否进入产物 |
| `v2/out_16_nolib.txt` | 把系统里的 `liblua*`（rpm 依赖）也移开之后运行各产物 |
| `v2/out_18_more.txt` | srlua 经 `PATH` 启动、模块搜索顺序、单文件的进程号 |
| `v2/out_20_web.txt`、`v2/out_21_clean.txt` | 仓库自带的示例服务：构建与耗时；放到干净容器里启动并请求首页 |
| `v2/out_23_luajit.txt` | 用 LuaJIT 2.1 运行 luainstaller |
| `v2/out_25_srcchange.txt` | 构建期间改动源文件（包装脚本在编译 `launcher.c` 的那一刻往 `moon/names.lua` 追加一行） |
| `v2/out_27_luastatic_path.txt` | luastatic 的产物只用名字、经 `PATH` 启动 |
| `v2/out_29_onefile_unpack.txt` | 在本机（WSL Ubuntu x86_64）运行 Fedora 上构建的 `moon-onefile`，列出它解出的每个文件，并在单文件里原样查找这些文件得到偏移 |
| `out_w9_windows.txt` | Windows 11（build 26220），MSVC 19.51，Lua 5.5.0（LuaBinaries），项目在 `C:\luai-demo\moon`，`LUAI_LUA_PREFIX=C:\luai-demo\lua55` |
| `v2/art/` | 取回的产物：`moon/build/moon/`（目录包，含 `launcher.c`、`manifest.lua`、`generated-output.txt`）、`moon/build/moon-onefile`、`websql/`、`ltokei/`、`list/`、`dyn/` |

演示程序 `research/lab/moon/`：`main.lua` 加 `moon/phase.lua`、`moon/julian.lua`、`moon/names.lua`，按日期输出月相（Meeus《天文算法》第 48 章的低精度公式）。校验：2024-04-08（日全食）输出 new moon，2026-09-26 输出 full moon。片中所有「月相」图形画的都是它对 2026-10-01 的输出：waning gibbous，78%。

## 开场

| 陈述 | 依据 |
|---|---|
| 没有 Lua 的机器上 `lua main.lua` 报 `bash: lua: command not found` | `v2/out_12_clean.txt` |
| 脚本 `require` 了模块，要一并交付 | `lab/moon/` 源码；`luai -a` 回显 `scripts: 3` |

## 01 在它之前

| 陈述 | 依据 |
|---|---|
| srlua：Luiz Henrique de Figueiredo，srlua-103，2026-09 | `lab/src/srlua-103.tar.gz`（sha256 `57ba5397…239ffe`）里的 `HISTORY`：`srlua-103 2026-09-11`；<https://www.tecgraf.puc-rio.br/~lhf/ftp/lua/#srlua> |
| 用之前要先自己编译出 `srlua` 与 `srglue` | srlua 的 README；`out_11`：`make LUA_TOPDIR=/usr LUA_LIBDIR=/usr/lib64` 的两条 gcc 命令（画面上把 `-std=c99 -Wall -Wextra -Wfatal-errors -O2` 省成 `…`） |
| 它把脚本原样接在解释器后面 | README：`srglue srlua prog.lua a.out`；`out_11`：`moon-srlua` 14,443 字节 |
| 只接一个脚本，模块不在其中；换目录运行报 `module 'moon.phase' not found` | `out_11`：`cd /tmp && ~/moon/moon-srlua 2026-10-01`。在项目目录里运行是正常的（模块还在磁盘上） |
| 只用名字、经 `PATH` 启动，它打不开自己 | `out_18`：`env PATH=/home/waterrun/bin:/usr/bin moon-srlua 2026-10-01` → `moon-srlua: cannot open moon-srlua: No such file or directory`。原因见 `srlua.c`：`main` 里把 `argv[0]` 原样交给 `load()` 去打开，不经 `PATH` 解析 |
| luastatic 0.0.12，ers35，2020 | `luarocks install luastatic` 的回显（`luastatic-0.0.12-1`）；<https://github.com/ers35/luastatic> 的标签 `0.0.12` 提交于 2020-06-13（2026-10-01 用 `git fetch` 查得；仓库主干最后一次提交在 2022-04-30） |
| 它把源码写成 C 数组，和 Lua 静态库一起编译 | `out_11`：生成 `main.luastatic.c`（21,735 字节）并执行 `cc -Os main.luastatic.c /usr/lib64/liblua.a -rdynamic -lm -ldl -o main`；`main` 1,303,640 字节 |
| 入口、每个模块、静态库的路径都要写在命令里；这条命令 84 个字符 | luastatic 的用法说明；`out_11` 里那条命令；`gen_data.py` 对实测命令计数 |
| 漏写一个，运行时才报错 | `out_11`：只给入口时构建成功，运行报 `no module 'moon.phase' in luastatic bundle` |

### 对照表每一格的依据

| 行 | srlua | luastatic | luainstaller |
|---|---|---|---|
| 自动发现依赖 | 无：只接受一个脚本 | 无：模块由命令行给出 | 有：`luai -a` 的回显 |
| 多个 Lua 模块 | 无（上表「换目录运行」） | 可以，但要逐个列出 | 有 |
| C 模块 | 无：不收集 | 只能链接静态库（用法说明第 4 项：*One or more static libraries for a required Lua binary module*） | 有：`.luai/native/lfs.so`（`out_11`） |
| 自带 Lua 运行时 | 视编译方式：按发行版默认方式编译出的 `srlua` 动态链接 `liblua`，系统里没有它就起不来（`out_16`：`error while loading shared libraries: liblua-5.4.so`） | 有：静态链接 `liblua.a`（`out_27` 的 `ldd` 里没有 liblua） | 有：`.luai/native/liblua-5.4.so`，`out_16` 中照常运行 |
| 经 `PATH` 启动 | 不行（上表） | 可以（`out_27`） | 可以（`out_11`：经符号链接、只给名字启动；`docs/BUNDLING.adoc`） |
| 目录包与单文件 | 只有单文件 | 只有单文件 | 两种都有 |
| 清单与校验 | 无 | 无 | `manifest.lua`、`generated-output.txt` |
| 诊断与日志 | 无 | 无 | `luai -t`、带类型的错误、`luainstaller logs` |

两个工具在本片的例子里都能做出可运行的程序；片中比较的是「要手工做多少事」和「出了问题能不能看出来」。

## 02 它做什么

| 陈述 | 依据 |
|---|---|
| 收集入口脚本、`require` 的模块、Lua 运行时，构建成原生可执行文件；运行的机器不需要装 Lua | README 首段；`out_12`：无 Lua 的容器里 `./moon/build/moon/moon 2026-10-01` 正常输出；`out_16`：连 `liblua` 都移开后仍正常 |
| 只写入口：`luai -b main.lua`（16 个字符）及其回显 | `out_15`：`ok` / `executable: /home/waterrun/moon/build/main/main` |
| 「Python 有 PyInstaller，Lua 有 luainstaller」 | 类比，非事实陈述 |
| 支持官方 Lua 5.1–5.5 | README；`docs/PLATFORMS-NATIVE-LIMITS.adoc`「Lua versions」。本次实测 5.4（Linux）与 5.5（Windows） |
| Linux、Windows、macOS、FreeBSD、Android/Termux；各列下的架构与工具链 | README「Where it runs」表；`PLATFORMS-NATIVE-LIMITS.adoc`「What each system needs」。本次实测 Linux x86_64 与 Windows x86_64，其余依据文档 |
| Windows 最早可以到 XP（SP3） | 同一张表。文档注明需要支持 XP 的编译器与运行时；片中只陈述「最早可以到 XP」 |
| 开源，LGPL-3.0-or-later；`github.com/Water-Run/luainstaller` | rockspec；`luainstaller version` 的回显 |
| 用 Lua 写成：Lua 23 个文件、15,877 行、13,869 行代码 | `out_11`：用它自己打包出的 `ltokei`（仓库 `test/ltokei`）统计 `src/` 的输出 |
| 每次改动都在 Linux 与 Windows 上测完五个 Lua 版本 | `.github/workflows/ci.yml`：`version-matrix`（POSIX，5.1–5.5）、`windows-version-matrix`（MSVC，5.1–5.5）、`linux-x86-native`（5.4）；`docs/TESTING.adoc` 与 `PLATFORMS-NATIVE-LIMITS.adoc`「How it's tested」 |

## 03 安装

| 陈述 | 依据 |
|---|---|
| `luarocks install luainstaller` 及回显；`luai -v` → `luai 1.4.0` | `out_11`（画面取第 1 行与 `is now installed` 一行） |
| 没有 LuaRocks 也能从源码目录安装 | `out_14`：`lua tools/install.lua --prefix …` 的三行回显；`docs/INSTALL.adoc` |
| 分析只需要 Lua 解释器；构建还需要 C 编译器、与解释器同版本的头文件与库；缺少时在工具链检查处停下 | `out_14`：三个阶段。只有解释器时 `luai -a` 成功、`luai -b` 报 `ToolchainError: No Lua development metadata matches the selected ABI`；补上 gcc 后报错相同；再补 `lua-devel` 后成功 |
| `luai` 用短选项，`luainstaller` 用子命令；不能混用 | `out_11`：两份帮助；`luai build main.lua` → `unknown luai command: build`，`luainstaller -b main.lua` → `unknown luainstaller command: -b` |

## 04 使用

| 陈述 | 依据 |
|---|---|
| 稳妥的顺序：分析、构建目录包、验证、再做单文件 | README「Build your first executable」：*The safe path is: check the dependencies, build a folder, test the folder, and only then make a single file.* |
| `lua main.lua 2026-10-01`、`luai -a main.lua`、`luai -b main.lua -o build/moon` 的回显；可执行文件 22,472 字节 | `out_11` |
| 目录包里是可执行文件和一个 `.luai` 文件夹 | `out_11`：`find build/moon`（16 项，画面归并成树） |
| 清空搜索路径后运行 | `out_11`：`env -u LUA_PATH -u LUA_CPATH build/moon/moon 2026-10-01` |
| 包不是沙箱；查找顺序四项 | `docs/BUNDLING.adoc`「Where modules are looked up」：`package.preload` → 包内模块 → Lua 文件搜索 → C 模块搜索（`.luai/native/` 在前）；*it isn't sealed: a module that wasn't packaged can still be found on the host* |
| `--file` 得到单个文件，486,280 字节 | `out_11`：`ls -l build` |
| 目录包直接启动、便于检查；单文件首次运行先解压 | `docs/USAGE.adoc`「Directory bundle or single file」表 |
| 单文件出了问题，就回到目录包去查 | README：*If the single file misbehaves, go back to the directory bundle.* |
| Windows 上同样的命令得到 `moon.exe`；目录里还有 `lua55.dll` 与 `.luai` | `out_w9_windows.txt`。头文件与 DLL 的位置通过 `LUAI_LUA_PREFIX` 给出（Windows 没有约定位置），命令行本身相同 |
| 依赖发现有三种方式；默认静态，只读源码不执行 | `luai -h`：`-d, --discovery-mode <mode>  static, manual, or runtime`；`docs/USAGE.adoc` |
| 运行时才拼出的名字跟不到，构建停下并指出行号 | `out_11`：`DynamicRequireError: Dynamic require at /home/waterrun/dyn/main.lua:2: require('drivers.' .. ...)` |
| 运行时方式把脚本真的运行一次，只覆盖这次走到的路径 | `out_11`：`-d runtime -- mysql` 得到 `drivers/mysql.lua`，不带参数得到 `drivers/sqlite.lua`；trace 里的 `note: runtime require discovery only covers build-time executed code paths` |
| 手动方式不做扫描，逐个列出 | `out_11`：`-d manual --include … --include …` 得到 `scripts: 2` |
| C 模块按 `package.cpath` 找到，原样复制进包里 | `out_11`：`library[1]: /usr/lib64/lua/5.4/lfs.so`；`find .luai/native` 含 `lfs.so`；`env -i` 下运行正常 |
| `-o`、`--max-deps`（默认 36）、`--include`、`--exclude` | `out_11`：`luai -h` 原文（画面只显示其中 `Options:` 一节，前面的用法与子命令以 `⋮` 略去）；`luainstaller help`：`--max-deps <n>  Dependency count limit (default: 36)`；`--max-deps 2` 时报 `DependencyLimitExceededError: Dependency count (3) exceeds limit (2)`；不写 `-o` 时输出到 `build/main/main`（`out_15`） |
| 可以在 Lua 里当库调用；返回一张表，失败时 `error.type` 说明原因 | `out_11`：`/tmp/api.lua` 的脚本（在 `v2/11_user.sh` 里）与输出；六个入口名取自 `src/init.lua` |
| 示例服务：17 个 Lua 模块、2 个 C 模块，一条命令 | `out_20`：`luai -a test/firebird_web_sql/server.lua` → `scripts: 17`、`libraries: 2`（项目内 6 个，LuaRocks 里 11 个）；`luai -b … -o ~/websql` 成功，用时 5.5 秒，目录 1.6M |
| 放到没有 Lua 的机器上，服务照常启动 | `out_21`：干净容器里 `lua -v` 报 command not found；启动后 `curl -si http://127.0.0.1:9090/ | head -1` → `HTTP/1.1 200 OK` |

## 05 边界

| 陈述 | 依据 |
|---|---|
| 不做交叉编译；同一系统、架构和 Lua 版本 | `out_11`：`--target-os windows` → `UnsupportedPlatformError: luainstaller only builds for the native host OS and architecture`；`PLATFORMS-NATIVE-LIMITS.adoc`「Build where you'll run」。两个圆里的 `linux`、`x86_64`、`Lua 5.4` 取自库的 `compatibility()` 输出 |
| 不支持 LuaJIT | `out_23`：`luajit bin/luai.lua -a ~/moon/main.lua` → `UnsupportedLuaVersionError: luainstaller requires an official Lua 5.1 through 5.5 interpreter` |
| C 模块依赖的系统库不随包带走 | `out_11`：`luai -t` 末行的 warning 原文；`PLATFORMS-NATIVE-LIMITS.adoc`「Native C modules」 |
| 源码以文本嵌入，不加密不混淆 | `v2/art/moon/build/moon/moon` 偏移 `0x2150` 处的十六进制（`xxd` 式两行）；文档「Out of scope」 |
| 不签名，不生成安装包 | 文档「Out of scope」的原文两行 |

## 06 实现原理

八步的划分依据 `docs/IMPLEMENTATION.adoc` 与对 `src/init.lua`、`src/discovery.lua`、`src/analyzer.lua`、`src/toolchain.lua`、`src/cgen.lua`、`src/bundler.lua` 的阅读。

| 陈述 | 依据 |
|---|---|
| 校验：解释器必须是官方 Lua 5.1–5.5 | `out_11`：`lua -v`；`out_23` 的报错 |
| 选项逐项检查，写错的不会被悄悄忽略 | `out_11`：`bundle({ …, colour = "blue" })` → `InvalidOptionsError`、`unknown option: colour` |
| 静态方式只做词法扫描，找字面量形式的 `require` | `src/analyzer.lua`；`docs/USAGE.adoc`「How dependencies are found」 |
| 从入口所在的目录找起，再按 Lua 的搜索路径定位 | `out_18`：对一个不存在的模块，报错里的 `Searched:` 列表（前 4 项在入口目录下，后 5 项来自 `package.path`/`cpath`） |
| 模块自己的 `require` 继续向下追 | `out_11`：`luai -t main.lua` 的三行 `lua resolved …`，顺序为 phase → julian → names |
| 每个文件此刻记下 SHA-256 | `src/discovery.lua` 的快照；画面上的四个哈希取自产物里的 `manifest.lua` |
| 清单：身份、哈希、在包里的位置 | `v2/art/moon/build/moon/.luai/manifest.lua` 的 `source_id`、`content_hash`、`destination_path` |
| 路径相对于入口，不含构建机器的绝对路径 | `out_15`：`grep -c /home/waterrun` 对清单与对可执行文件的 `strings` 输出都是 0 |
| 工具链：C 编译器、同版本的头文件与库；用探针确认 | `v2/cc.log` 的前两条命令（`native-probe.c`、`probe.c`）；`luai -t` 的 note：*POSIX bundles select shared or static Lua through compile-and-run capability probes*；`LUA_VERSION_NUM 504` 取自 `launcher.c` 的 `#if` |
| 引导脚本：模块表装着每个文件的源码，再加一个搜索器 | 由 `launcher.c` 里的字节数组还原出的全文（221 行、6,964 字节）；画面上的行号是真实行号 |
| 文本逐字节写成 C 数组 | `launcher.c` 第 13–595 行；网格里的 96 个字节与数组前 8 行逐一比对（不符则构建期告警） |
| 接上启动器模板就是 `launcher.c`，824 行 | 同一文件；缩略图按每行的真实长度画出；`#error` 在第 635 行，`main()` 在第 786 行 |
| 编译成机器码，并链接 Lua | `v2/cc.log` 第三条命令；`objdump -d` 里 `main` 的五条 `call`；`ldd build/moon/moon` |
| 最终的可执行文件 22,472 字节；开头是 ELF 文件头，接着是机器码；中间一段是那个 C 数组 | `v2/art/…/moon`：`.text` 在 `0x530`，2,125 字节；`luai_bootstrap` 在 `0x18c0`，6,964 字节 |
| 在二进制里仍能读到原来的 Lua 源码 | 同一文件偏移 `0x2147` 起即 `local phase = require(\"moon.phase\")`（按 224 列排，是第 38 行第 7 列） |
| 核验：再运行一个探针，确认链接到的 Lua 版本 | `v2/cc.log` 第四条命令（`lua-abi-probe.c`）；探针源码模板在 `src/bundler.lua` 的 `abiProbeSource` |
| 期间源文件被改动，哈希对不上，构建作废 | `out_25`：`SourceChangedError: Source changed during build: /home/waterrun/moon/moon/names.lua`；画面上两个哈希是该文件改动前后的 SHA-256 |
| 前面的一切发生在旁边的暂存目录里；完成后整体换入 | `v2/cc.log` 里的路径 `build/.luai-staging-<hash>-<token>/`；`docs/BUNDLING.adoc`「Rebuilding in place」 |
| 中途失败，原来的产物保持不动 | `out_25`：失败后 `build/moon/moon` 的 SHA-256 与失败前相同，`ls -a build` 只有 `moon` |
| 每个文件的哈希记在一份标记里；目录被改过，重建就拒绝覆盖 | `generated-output.txt`（节选）；`out_11`：往 `THIRD_PARTY_NOTICES.md` 追加一行后重建 → `InvalidOutputError: Generated output no longer matches its ownership marker` |
| 同样的代码和工具链，产物逐字节相同 | `out_15`：同一源码构建两次、再复制到 `/tmp/elsewhere` 构建一次，三个可执行文件的 SHA-256 相同（`2eda4a9a…dcbe`）；单文件两次构建相同（`1df435a1…787f`）。范围见下方「需要说明的两点」 |
| 运行时创建 Lua 状态、打开标准库、载入引导脚本 | `launcher.c` 的 `main()`（画面上的行号为真实行号）；引导脚本以 `"t"` 方式载入（第 772 行） |
| 搜索器插在 `package.searchers` 的第二位；先查包内，再查文件系统 | 引导脚本第 176 行 `table.insert(searchers, 2, searcher)`；Lua 5.4 手册 §6.3 的四个默认搜索器；`require("lfs")` 的落点取自 `out_11` |
| 单文件是把目录包写成字节数组，包进一个解压器 | `out_29`：解出的 12 个文件共 465,299 字节，全部能在 `moon-onefile` 里原样找到；画面上那条图按这些真实偏移画出，头尾空心的两段是解压器自身（共 20,981 字节） |
| 首次运行解压到按内容哈希命名的临时目录，之后复用（画面注记「内容相同，直接复用这个目录」） | `out_11`：`/tmp/luainstaller-onefile-1000/e69cfd50…d755/`；`out_29` 在另一台机器上解出的目录同名；`docs/BUNDLING.adoc`「The single file」 |
| 解压器把自己替换成真正的程序，进程号不变 | `out_18`：shell 启动的进程号与程序内读到的进程号都是 2792；同一节文档 |

## 片尾

| 陈述 | 依据 |
|---|---|
| 每个产物都带着许可证文本和生成它的 C 源码 | `out_11`：`.luai/licenses/` 三个文件、`THIRD_PARTY_NOTICES.md`、`.luai/build/launcher.c`、`RELINKING.adoc` |
| 作者 WaterRun；LGPL-3.0-or-later；1.4.0 | rockspec；`luai -v` |

## 需要说明的两点

- **「逐字节相同」的范围。** 实测相同的是可执行文件和单文件。目录包里的 `.luai/generated-output.txt` 第二行是 `output_dir=<绝对路径>`，所以输出位置不同时，整个目录并不逐字节相同。片中展示的是三个可执行文件的哈希。
- **「不含构建机器的绝对路径」的范围。** 这句说的是清单（以及可执行文件），实测如此。上面那份标记文件含有输出目录的绝对路径；片中第 8 步如实显示了它的前两行。

## 取证中另外发现的几件事（未入片，供作者参考）

- `docs/BUNDLING.adoc` 写着 *Build-host absolute paths aren't written into the bundle*，而目录包的 `.luai/generated-output.txt` 里有 `output_dir=` 的绝对路径（单文件不受影响：实测两个不同输出名的单文件逐字节相同，且解出的目录里没有这个标记文件）。
- 打包后的程序出错时，报错信息里的文件名与行号和直接用 `lua` 运行一致，退出码同为 1，但 traceback 的内容不同（多出 `luainstaller-bootstrap` 的帧）。片中没有说「traceback 一致」。
- `luai -t --verbose` 与不加 `--verbose` 的输出相同。
- Fedora 44 自带的 LuaRocks 3.9.2 安装时会多打一行 `cp: -r not specified; omitting directory 'LICENSES'`，安装仍成功。
- 在 WATERRUN（Windows 11）上经 SSH 会话构建很慢：目录包约 3 分钟、单文件约 3.5 分钟（Linux 上分别约 1.8 秒、3.0 秒）。未进一步定位原因。
- 缺 C 编译器与缺 Lua 头文件时，报错是同一句 `No Lua development metadata matches the selected ABI`；只缺编译器时，这句话不太能把人引到「去装编译器」上。
