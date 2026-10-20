// 旁白脚本（中英双语）：每个 cue = [id, {zh, en}, {tts:{zh,en}, gap, pause}]
// - 字幕里 *词* 表示强调；tts 缺省时由字幕按 SAY 表换成读法
// - gap: 该句结束到下一句开始的停顿（秒，可写成 {zh, en}），pause: 无旁白的纯画面停顿
// 语言：浏览器取 ?lang=en，Node 取环境变量 VLANG；默认 zh。浏览器与 Node 共用本文件。
// 结构：开场 → 01 既有做法与不足 → 02 概述 → 03 安装 → 04 使用 → 05 边界 → 06 实现原理 → 片尾
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || 'en' in v) ? v[LANG] : v);

  const RAW = [
    {
      id: 'open', chap: null, lead: 0.9, tail: 0.3,
      cues: [
        ['o1', { zh: '一个 Lua 脚本，写完了', en: 'A Lua script. Finished.' }, { gap: 0.55 }],
        ['o2', { zh: '要交给别人运行，对方得先装好 Lua', en: 'To run it, the other person needs Lua installed,' }, { gap: 0.3 }],
        ['o3', { zh: '还要拿到它 require 的每一个模块', en: 'and every module it requires.' }, { gap: 0.7 }],
        ['o4', { zh: '更省事的办法，是把它们做成一个可执行文件', en: 'The simpler way: turn all of it into one executable.' }, { gap: 0.45 }],
        ['o5', { zh: '*luainstaller* 做的就是这件事', en: 'That is what *luainstaller* does.' }, { gap: 0.3 }],
        ['oT', null, { pause: 3.0 }],
      ],
    },
    {
      id: 'before', chap: ['01', { zh: '在它之前', en: 'Before it' }], lead: 2.3, tail: 0.6,
      cues: [
        ['b1', { zh: '这件事，早已有工具在做', en: 'Tools for this have existed for years.' }, { gap: 0.45 }],
        ['b2', { zh: '一个是 *srlua*', en: 'One is *srlua*.' }, { gap: 0.35 }],
        ['b3', { zh: '用它之前，要先自己编译出解释器和粘合工具', en: 'First you compile its interpreter and glue tool yourself.' }, { gap: 0.35 }],
        ['b4', { zh: '它把脚本原样接在解释器的后面', en: 'It then appends your script to that interpreter.' }, { gap: 0.45 }],
        ['b5', { zh: '只接一个脚本；require 的模块不在其中', en: 'One script only. Required modules are not included.' }, { gap: 0.35 }],
        ['b6', { zh: '换一个目录运行，模块就找不到了', en: 'Run it from another directory, and they are not found.' }, { gap: 0.5 }],
        ['b7', { zh: '只用名字、经 PATH 启动，它打不开自己', en: 'Started by name through PATH, it cannot open itself.' }, { gap: 0.8 }],
        ['b9', { zh: '另一个是 *luastatic*', en: 'The other is *luastatic*.' }, { gap: 0.35 }],
        ['b10', { zh: '它把源码写成 C 数组，和 Lua 静态库一起编译', en: 'It writes your sources into C arrays and compiles them with a static Lua library.' }, { gap: 0.45 }],
        ['b11', { zh: '入口、每一个模块、静态库的路径', en: 'The entry, every module, the library path:' }, { gap: 0.25 }],
        ['b12', { zh: '都要在一条命令里逐个写出', en: 'all spelled out in one command.' }, { gap: 0.5 }],
        ['b13', { zh: '模块越多，命令越长；漏写一个，运行时才报错', en: 'More modules, longer command. Leave one out, and it fails only at run time.' }, { gap: 0.74 }],
        ['b14', { zh: '放在一起看：两者都不会替你找依赖', en: 'Side by side: neither finds dependencies for you,' }, { gap: 0.35 }],
        ['b16', { zh: '也没有清单、校验和诊断', en: 'and neither keeps a manifest, verifies files, or explains failures.' }, { gap: 0.6 }],
        ['b17', { zh: '这些，正是 *luainstaller* 要补上的', en: 'That is the gap *luainstaller* sets out to fill.' }, { gap: 0.74 }],
      ],
    },
    {
      id: 'what', chap: ['02', { zh: '它做什么', en: 'What it does' }], lead: 2.3, tail: 0.5,
      cues: [
        ['a1', { zh: 'luainstaller 是一个 Lua 打包工具', en: 'luainstaller is a packaging tool for Lua.' }, { gap: 0.4 }],
        ['a2', { zh: '它收集三样东西：*入口脚本*', en: 'It collects three things: your *entry script*,' }, { gap: 0.3 }],
        ['a3', { zh: '脚本通过 require 加载的*模块*', en: 'the *modules* it loads with require,' }, { gap: 0.3 }],
        ['a4', { zh: '以及 *Lua 运行时*', en: 'and the *Lua runtime*.' }, { gap: 0.55 }],
        ['a5', { zh: '再把它们构建成一个原生可执行文件', en: 'Then it builds a native executable from them.' }, { gap: 0.45 }],
        ['a6', { zh: '运行它的机器，*不需要安装 Lua*', en: "The machine that runs it *doesn't need Lua*." }, { gap: 1.15 }],
        ['a7', { zh: '只写入口；模块和运行时，由它自己去找', en: 'You name the entry. It finds the rest.' }, { gap: 0.74 }],
        ['a8', { zh: 'Python 有 PyInstaller，Lua 有 *luainstaller*', en: 'Python has PyInstaller. Lua has *luainstaller*.' }, { gap: 0.82 }],
        ['a9', { zh: '它支持官方 Lua 5.1 到 5.5', en: 'It works with official Lua, 5.1 through 5.5,' }, { gap: 0.35 }],
        ['a10', { zh: '覆盖 Linux、Windows 和 macOS', en: 'on Linux, Windows and macOS,' }, { gap: 0.25 }],
        ['a11', { zh: '以及 FreeBSD 和 Android 上的 Termux', en: 'FreeBSD, and Termux on Android.' }, { gap: 0.4 }],
        ['a12', { zh: 'Windows 最早可以到 XP', en: 'Windows support goes back to XP.' }, { gap: 0.74 }],
        ['a13', { zh: '它是开源的，采用 LGPL 3.0 或更新版本', en: 'It is open source, under LGPL 3 or later.' }, { gap: 0.6 }],
        ['a15', { zh: '每次改动，都在 Linux 和 Windows 上测完五个 Lua 版本', en: 'Every change is tested on Linux and Windows with all five Lua versions.' }, { gap: 0.74 }],
      ],
    },
    {
      id: 'install', chap: ['03', { zh: '安装', en: 'Install' }], lead: 2.3, tail: 0.6,
      cues: [
        ['i1', { zh: '安装只需要一行', en: 'Installing takes one line.' }, { gap: 1.07 }],
        ['i2', { zh: '没有 LuaRocks，也能从源码目录直接安装', en: 'Without LuaRocks, install straight from the source tree.' }, { gap: 0.74 }],
        ['i3', { zh: '分析依赖，只需要一个 Lua 解释器', en: 'Analyzing dependencies needs only a Lua interpreter.' }, { gap: 0.5 }],
        ['i4', { zh: '构建可执行文件，还需要一个 C 编译器', en: 'Building also needs a C compiler,' }, { gap: 0.3 }],
        ['i5', { zh: '以及和解释器同一版本的 Lua 头文件与库', en: "and Lua headers and a library matching the interpreter's version." }, { gap: 0.5 }],
        ['i6', { zh: '缺少它们，构建会在工具链检查处停下', en: 'Without them, the build stops at the toolchain check.' }, { gap: 1.9 }],
        ['i7', { zh: '装好之后，有两个命令', en: 'Once installed, you get two commands.' }, { gap: 0.4 }],
        ['i8', { zh: '*luai* 用短选项，和 lua 一样简短', en: '*luai* takes short options, as terse as lua itself.' }, { gap: 0.4 }],
        ['i9', { zh: '*luainstaller* 用完整的子命令', en: '*luainstaller* takes full subcommands.' }, { gap: 0.4 }],
        ['i10', { zh: '同一个工具，两种写法，不能混用', en: "One tool, two spellings. They don't mix." }, { gap: 0.82 }],
      ],
    },
    {
      id: 'use', chap: ['04', { zh: '使用', en: 'Using it' }], lead: 2.3, tail: 0.6,
      cues: [
        ['u1', { zh: '稳妥的顺序是四步：分析，构建目录包，验证，再做单文件', en: 'The safe path has four steps: analyze, build a folder, test it, then make a single file.' }, { gap: 0.8 }],
        ['u3', { zh: '用一个计算月相的小程序来试', en: "Take a small program that computes the Moon's phase:" }, { gap: 0.3 }],
        ['u4', { zh: '一个入口，三个模块', en: 'one entry script, three modules.' }, { gap: 0.7 }],
        ['u5', { zh: '第一步，*分析*：看看哪些文件会被打包', en: 'Step one, *analyze*: see which files will be packaged.' }, { gap: 0.8 }],
        ['u6', { zh: '这里没有列出的，可执行文件里也不会有', en: 'What is not listed here will not be in the executable.' }, { gap: 0.8 }],
        ['u7', { zh: '第二步，*构建*', en: 'Step two, *build*.' }, { gap: 1.23 }],
        ['u8', { zh: '得到一个目录：可执行文件，和一个 .luai 文件夹', en: 'You get a folder: the executable, and a .luai directory.' }, { gap: 0.7 }],
        ['u9', { zh: '第三步，清空 Lua 的搜索路径，再运行', en: "Step three: clear Lua's search paths and run it." }, { gap: 0.7 }],
        ['u10', { zh: '包不是沙箱：漏打包的模块可能悄悄从本机加载，这一步能让它现形', en: 'The bundle is not a sandbox: a forgotten module may load quietly from your machine. This step exposes it.' }, { gap: 0.74 }],
        ['u12', { zh: '第四步，加上 --file，得到*单个文件*', en: 'Step four: add --file for a *single file*.' }, { gap: 0.9 }],
        ['u13', { zh: '目录包直接启动，便于检查；单文件首次运行要先解压', en: 'A folder starts directly and is easy to inspect. A single file unpacks on first run.' }, { gap: 0.4 }],
        ['u15', { zh: '单文件出了问题，就回到目录包去查', en: 'If the single file misbehaves, go back to the folder.' }, { gap: 0.74 }],
        ['u16', { zh: '在 Windows 上，同样的命令得到 moon.exe', en: 'On Windows, the same command gives you moon.exe.' }, { gap: 1.31 }],
        ['u17', { zh: '依赖发现，有三种方式', en: 'There are three ways to find dependencies.' }, { gap: 0.4 }],
        ['u18', { zh: '默认是*静态*方式：只读源码，不执行', en: 'The default, *static*, reads your source and runs nothing.' }, { gap: 0.4 }],
        ['u19', { zh: '名字若在运行时才拼出，它跟不到；构建会停下，指出是哪一行', en: "A name computed at run time can't be followed: the build stops and points to the line." }, { gap: 0.7 }],
        ['u21', { zh: '*运行时*方式，把脚本真的运行一次，记下加载了什么', en: '*Runtime* mode really runs your script once and records what loads,' }, { gap: 0.3 }],
        ['u22', { zh: '只覆盖这一次走到的路径', en: 'covering only the path taken on that run.' }, { gap: 0.7 }],
        ['u23', { zh: '*手动*方式不做扫描，由你逐个列出', en: '*Manual* mode scans nothing; you list each module.' }, { gap: 0.74 }],
        ['u24', { zh: 'C 模块，按 package.cpath 找到，原样复制进包里', en: 'C modules are found through package.cpath and copied in as they are.' }, { gap: 1.25 }],
        ['u25', { zh: '常用的选项不多：-o 指定输出位置', en: 'The everyday options are few: -o sets the output path,' }, { gap: 0.3 }],
        ['u27', { zh: '--max-deps 放宽模块数量的上限，默认是 36', en: '--max-deps raises the module limit, 36 by default,' }, { gap: 0.3 }],
        ['u28', { zh: '--include 和 --exclude，增减要打包的模块', en: 'and --include and --exclude add or drop modules.' }, { gap: 0.74 }],
        ['u29', { zh: '这些功能，也能在 Lua 里当作库来调用', en: 'The same features are available as a Lua library.' }, { gap: 0.4 }],
        ['u30', { zh: '调用返回一张表；失败时，error.type 说明原因', en: 'Calls return a table. On failure, error.type names the problem.' }, { gap: 0.82 }],
        ['u32', { zh: '再看一个大些的例子：仓库自带的示例服务', en: 'A larger example: the sample web service in the repository.' }, { gap: 0.4 }],
        ['u33', { zh: '十七个 Lua 模块，两个 C 模块，一条命令', en: 'Seventeen Lua modules, two C modules, one command.' }, { gap: 0.8 }],
        ['u35', { zh: '放到没有 Lua 的机器上，服务照常启动', en: 'On a machine without Lua, the service starts as usual.' }, { gap: 0.98 }],
      ],
    },
    {
      id: 'scope', chap: ['05', { zh: '边界', en: 'Limits' }], lead: 2.3, tail: 0.6,
      cues: [
        ['e1', { zh: '它不做交叉编译', en: "It doesn't cross-compile." }, { gap: 0.3 }],
        ['e2', { zh: '要在哪里运行，就在哪里构建：同一系统、架构和 Lua 版本', en: 'Build where you will run: same system, architecture and Lua version.' }, { gap: 0.7 }],
        ['e4', { zh: 'LuaJIT 不在支持范围内', en: "LuaJIT isn't supported." }, { gap: 0.6 }],
        ['e5', { zh: 'C 模块依赖的系统库，不会被一并带走', en: 'System libraries that C modules depend on are not collected.' }, { gap: 0.6 }],
        ['e6', { zh: '源码以文本嵌入，不加密，也不混淆', en: 'Sources are embedded as text: no encryption, no obfuscation.' }, { gap: 0.6 }],
        ['e7', { zh: '不签名，也不生成安装包', en: 'No code signing, and no installer packages.' }, { gap: 0.74 }],
      ],
    },
    {
      id: 'how', chap: ['06', { zh: '实现原理', en: 'How it works' }], lead: 2.3, tail: 0.6,
      cues: [
        ['h1', { zh: '一次构建，从源码到可执行文件，经过八步', en: 'A build goes from source to executable in eight steps.' }, { gap: 0.9 }],
        ['h2', { zh: '先*校验*：解释器必须是官方 Lua 5.1 到 5.5', en: 'First, *validate*: the interpreter must be official Lua, 5.1 to 5.5.' }, { gap: 0.3 }],
        ['h3', { zh: '选项逐项检查，写错的不会被悄悄忽略', en: 'Every option is checked. An unknown one is an error, not ignored.' }, { gap: 0.74 }],
        ['h4', { zh: '第二步，*发现依赖*。静态方式只做词法扫描', en: 'Step two, *discover*. Static mode only scans the text:' }, { gap: 0.3 }],
        ['h5', { zh: '找出字面量形式的 require', en: 'it finds the literal require calls,' }, { gap: 0.3 }],
        ['h6', { zh: '从入口所在的目录找起，再按 Lua 的搜索路径定位', en: "and resolves each from the entry's folder, then along Lua's search paths." }, { gap: 0.4 }],
        ['h7', { zh: '模块自己的 require，继续向下追', en: "A module's own requires are followed in turn." }, { gap: 0.5 }],
        ['h8', { zh: '每个文件，此刻记下 SHA-256', en: "Each file's SHA-256 is recorded at this moment." }, { gap: 0.74 }],
        ['h9', { zh: '第三步，*清单*：每个文件的身份、哈希和它在包里的位置', en: "Step three, the *manifest*: each file's identity, hash, and place in the bundle." }, { gap: 0.3 }],
        ['h10', { zh: '路径相对于入口，不含构建机器的绝对路径', en: 'Paths are relative to the entry, with no absolute paths from the build machine.' }, { gap: 0.74 }],
        ['h11', { zh: '第四步，*工具链*：找到 C 编译器和同版本的 Lua 开发文件，再用探针确认可用', en: 'Step four, the *toolchain*: find a C compiler and matching Lua development files, then prove them with probes.' }, { gap: 1.5 }],
        ['h13', { zh: '第五步，*生成 C 代码*。先拼出一段引导脚本', en: 'Step five, *generate C*. First, a bootstrap script:' }, { gap: 0.3 }],
        ['h14', { zh: '一张模块表，装着每个文件的源码；再加一个搜索器', en: "a table holding every file's source, plus a searcher." }, { gap: 0.6 }],
        ['h15', { zh: '这段文本，被逐字节写成 C 数组', en: 'That text is written out, byte by byte, as a C array,' }, { gap: 0.74 }],
        ['h16', { zh: '接上启动器模板，就是 launcher.c', en: 'and joined with the launcher template to form launcher.c.' }, { gap: 0.74 }],
        ['h17', { zh: '第六步，*编译*：变成机器码，并链接 Lua', en: 'Step six, *compile*: it becomes machine code, linked with Lua.' }, { gap: 0.98 }],
        ['h18', { zh: '这就是最终的可执行文件：两万两千多字节', en: 'This is the final executable: just over twenty-two thousand bytes.' }, { gap: 0.5 }],
        ['h19', { zh: '开头是 ELF 文件头，接着是机器码', en: 'An ELF header first, then the machine code.' }, { gap: 0.4 }],
        ['h20', { zh: '中间这一段，就是那个 C 数组', en: 'This band in the middle is that C array.' }, { gap: 0.6 }],
        ['h21', { zh: '在二进制里，仍然能读到原来的 Lua 源码', en: 'Inside the binary, the original Lua source is still readable.' }, { gap: 2.0 }],
        ['h22', { zh: '第七步，*核验*：再运行一个探针，确认链接到的 Lua 版本无误', en: 'Step seven, *verify*: one more probe confirms the linked Lua is the right version.' }, { gap: 0.4 }],
        ['h24', { zh: '期间源文件若被改动，哈希对不上，构建作废', en: 'If a source file changed meanwhile, its hash no longer matches, and the build is abandoned.' }, { gap: 0.74 }],
        ['h25', { zh: '第八步，*落盘*。前面的一切，都发生在旁边的暂存目录里', en: 'Step eight, *commit*. All of this happened in a staging folder next door.' }, { gap: 0.3 }],
        ['h26', { zh: '全部完成，才整体换入输出位置', en: 'Only when everything is done is it swapped into place.' }, { gap: 0.4 }],
        ['h27', { zh: '中途失败，原来的产物保持不动', en: 'If anything fails, the previous bundle stays as it was.' }, { gap: 0.7 }],
        ['h28', { zh: '每个文件的哈希记在一份标记里；目录被人改过，重建就拒绝覆盖', en: "Every file's hash goes into a marker. If the folder was changed by hand, a rebuild refuses to overwrite it." }, { gap: 0.7 }],
        ['h30', { zh: '同样的代码和工具链，产物逐字节相同', en: 'Same code, same toolchain: byte-identical output.' }, { gap: 0.98 }],
        ['h31', { zh: '运行时，程序创建 Lua 状态，打开标准库', en: 'At run time, the program creates a Lua state, opens the standard libraries,' }, { gap: 0.3 }],
        ['h32', { zh: '载入引导脚本，把搜索器插进 package.searchers 的第二位', en: 'loads the bootstrap, and inserts the searcher at position two of package.searchers.' }, { gap: 0.4 }],
        ['h33', { zh: '于是 require 先在可执行文件内部查找，再查文件系统', en: 'So require looks inside the executable before the file system.' }, { gap: 0.9 }],
        ['h34', { zh: '*单文件*，是把整个目录包再写成字节数组，包进一个解压器', en: 'A *single file* is the whole folder written as byte arrays once more, inside an extractor.' }, { gap: 0.4 }],
        ['h35', { zh: '首次运行，解压到按内容哈希命名的临时目录；之后直接复用', en: 'On first run it unpacks into a temporary folder named by content hash, and reuses it afterwards.' }, { gap: 0.4 }],
        ['h37', { zh: '解压器随后把自己替换成真正的程序，进程号不变', en: 'The extractor then replaces itself with the real program. The process ID stays the same.' }, { gap: 0.98 }],
      ],
    },
    {
      id: 'outro', chap: null, lead: 1.0, tail: 0.4,
      cues: [
        ['f1', { zh: '每个产物，都带着许可证文本和生成它的 C 源码', en: 'Every bundle carries the license texts, and the C source it was built from.' }, { gap: 0.5 }],
        ['f2', { zh: '源码和文档都在 GitHub', en: 'Source and documentation are on GitHub.' }, { gap: 0.7 }],
        ['f3', { zh: '把 Lua 脚本，交给*没有 Lua 的人*', en: 'Hand your Lua script to someone *without Lua*.' }, { gap: 0.5 }],
        ['fT', null, { pause: 6.5 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词在前，避免 luainstaller 被 luai 的规则截断。
  const SAY = {
    zh: [
      [/luainstaller/g, 'lua installer'], [/luastatic/g, 'lua static'], [/srlua/g, 'S R lua'], [/srglue/g, 'S R glue'],
      [/\.luai\b/g, '点 lua i'], [/\bluai\b/g, 'lua i'], [/LuaRocks/g, 'lua rocks'], [/PyInstaller/g, 'pie installer'], [/LuaJIT/g, 'Lua JIT'],
      [/5\.1 到 5\.5/g, '五点一到五点五'], [/SHA-256/g, 'S H A 二五六'], [/月相/g, '月象'],
      [/--file/g, 'file 选项'], [/--max-deps/g, 'max deps 选项，'], [/--include 和 --exclude/g, 'include 和 exclude 选项'], [/-o 指定/g, '杠 O 指定'],
      [/moon\.exe/g, 'moon 点 E X E'], [/LGPL 3\.0/g, 'L G P L 三点零'], [/error\.type/g, 'error 点 type'], [/launcher\.c/g, 'launcher 点 C'],
      [/package\.searchers/g, 'package 点 searchers'], [/package\.cpath/g, 'package 点 C path'], [/ELF/g, 'E L F'], [/生成 C 代码/g, '生成 C 语言代码'],
      [/默认是 36/g, '默认是三十六'], [/XP/g, 'X P'],
    ],
    en: [
      [/luainstaller/g, 'Lua installer'], [/luastatic/g, 'Lua static'], [/srlua/g, 'S R Lua'], [/srglue/g, 'S R glue'],
      [/\.luai\b/g, 'dot lua-eye'], [/\bluai\b/g, 'lua-eye'], [/LuaRocks/g, 'Lua Rocks'], [/PyInstaller/g, 'Pie Installer'], [/LuaJIT/g, 'Lua JIT'],
      [/--file/g, 'dash dash file'], [/--max-deps/g, 'dash dash max deps'], [/--include and --exclude/g, 'dash dash include, and dash dash exclude,'], [/-o sets/g, 'dash O sets'],
      [/moon\.exe/g, 'moon dot E X E'], [/LGPL 3 /g, 'L G P L 3 '], [/LGPL/g, 'L G P L'], [/error\.type/g, 'error dot type'], [/launcher\.c/g, 'launcher dot C'],
      [/package\.searchers/g, 'package dot searchers'], [/package\.cpath/g, 'package dot C path'], [/\bELF\b/g, 'E L F'], [/generate C\b/g, 'generate C code'],
      [/\bPATH\b/g, 'path'],
    ],
  };
  const strip = (s) => s.replace(/\*/g, '');
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap) }]),
  }));
  const ttsText = (c) => (c[2] && c[2].tts) || ttsNorm(strip(c[1]) + (LANG === 'zh' ? '。' : ''));

  // 没有真实音频时长时的估算（开发期占位）
  const estimate = (text) => (LANG === 'zh' ? 0.35 + text.replace(/[，。：；、\s]/g, '').length / 5.2 : 0.3 + text.split(/\s+/).length / 2.7);

  // 由脚本与实测时长计算整条时间线；浏览器端排动画、Node 端混音都用它
  function layoutScript(DUR) {
    DUR = DUR || {};
    let t = 0;
    const cues = {}, scenes = [], order = [];
    for (const sc of SCRIPT) {
      const s0 = t;
      t += sc.lead || 0;
      const first = t;
      for (const c of sc.cues) {
        const [id, cap, o = {}] = c;
        const meas = DUR[id];
        const d = o.pause != null ? o.pause : (meas ? meas.d : estimate(ttsText(c)));
        cues[id] = { id, scene: sc.id, cap, start: t, end: t + d, d, silent: o.pause != null, tts: o.pause != null ? null : ttsText(c), words: meas ? meas.words : null };
        order.push(id);
        t += d + (o.gap != null ? o.gap : 0.3);
      }
      t += sc.tail || 0.6;
      scenes.push({ id: sc.id, chap: sc.chap, start: s0, first, end: t, lead: sc.lead || 0 });
    }
    return { cues, scenes, order, total: t };
  }

  const api = { SCRIPT, LANG, pick, layoutScript, ttsText, ttsNorm, strip };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { Object.assign(root, api); root.DUR = (root.DUR_ALL || {})[LANG] || {}; }
})(typeof window !== 'undefined' ? window : globalThis);
