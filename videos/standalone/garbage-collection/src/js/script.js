// 中文第 8 稿（2026-10-20）；事实入口 research/FACTS.md，每句的 facts 字段引用那里的编号。未确认，不配音、不铺开场景。
// 第 8 稿：策划者 WaterRun 交来新的中文稿（文案由 Gemini 4 Argon 撰写），整稿替换第 7 稿的旁白。
//   改写要点：开场把「格子纸」铺得更满，o10 从机制清单改为「妥协与权衡」的总纲；各章句子普遍加长、
//   比喻更密（记账/账本、孤岛、追债与买单、冤杀、垂帘听政式的家规）；03 章的 d9 改成与 e10 呼应的悬念；
//   收束 h5、h6 加了引号，明确是麦卡锡脚注的原文引用。
//   facts 字段沿用第 7 稿的编号映射：新稿的每句仍是同一批事实，只是说法更满，未新增事实主张。
//   读法：字幕里新出现的「136 次」「28 MB」「14 MB」「CSharp」已加进 SAY 表；中文引号在 TTS 侧去掉，字幕保留。
//   配音：策划者要求可爱的女声，音色见 project.json 的 tts.voice。
// 每个 cue = [句号, 字幕, { facts, tts, gap, pause }]。facts 只记录依据，不进入字幕。
// 英文：EN 表逐句对应中文第 8 稿（2026-10-20 受托方 Claude Opus 5.5 译，待策划者确认）；tts 覆盖只给中文。
// 字幕里 *词* 表示强调；读法只放在 SAY 表或 tts 字段。gap：该句结束到下一句开始的停顿（秒，缺省 0.4）；pause：无旁白的纯画面停顿。
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);
  const EN = {
    o1: "Picture memory as a vast sheet of graph paper:",
    o1b: "every object a program makes takes up one square.",
    o2: "How fast does it go? In one second, C# can make sixty-seven million,",
    o2b: "filling the sheet in a blink.",
    o3: "But the sheet is only so big: say, 64 MB.",
    o3b: "Never give squares back, and it fills in a blink: out of memory.",
    o4: "Try PHP or Java, and you hit the same wall;",
    o4b: "the errors differ, but one of them looks familiar.",
    o5a: "Luckily, most objects are only needed for a moment:",
    o5: "erase and reuse them, and the same sixty-seven million fit in 11 MB.",
    o6: "In that second, someone behind the scenes erased 136 times,",
    o6b: "and the programmer didn't write a single extra line.",
    o7: "This invisible housekeeper is called garbage collection:",
    o7b: "find the memory nobody wants, and hand it back.",
    o8: "The hard part: programmers only ever ask for memory,",
    o8b: "and never say which piece they're *done with*.",
    o9: "So how does it guess what's no longer needed?",
    o9b: "And how does it clean up while the program sprints, without anyone noticing?",
    o10: "From bookkeeping to tracing, from generations to concurrency,",
    o10b: "this isn't brute force; it's an art of compromise and trade-offs.",
    a1: "The most intuitive trick: keep the books in real time,",
    a1b: "counting how many places use it. This is reference counting.",
    a2: "CPython keeps this ledger",
    a2b: "in the first 8 bytes of every object, read and written constantly.",
    a3: "a is born with 1; assign it to b, and it's 2;",
    a3b: "put it into a list, 3; delete b, clear the list, back to 1.",
    a4: "Erase the last name, and the count hits zero:",
    a4b: "freed on the spot, with no global check bothering anyone.",
    a5: "The object knows when it's time to leave. Clean, and graceful.",
    a6: "The price: every pointer change means updating the books;",
    a6b: "and the deadlier flaw is the reference cycle.",
    a7: "X holds Y, Y holds X; even with every outside name deleted,",
    a7b: "they pull at each other, and the counts stay stuck at 1.",
    a8: "Neither can ever reach zero: an island in memory.",
    a8b: "So Python and PHP both hire an extra collector, just to break cycles.",
    a8c: "How does it spot an island? PHP, for one, does a trial subtraction:",
    a8d: "it takes away every count the suspects give each other.",
    a8e: "Still above zero? Someone outside uses it, so the count goes back.",
    a8f: "Down to zero? Only its own circle holds it: that's an island.",
    a9: "Wake the cycle breaker and let it strike:",
    a9b: "both sides find and clear 2 deadlocked objects. Exactly X and Y.",
    b1: "Since bookkeeping strands islands, the second approach follows the vine:",
    b1b: "start from the *roots*, the stack and the global variables,",
    b2: "and follow the pointers down. Whatever you can reach is alive;",
    b2b: "whatever you can't is garbage. This is tracing.",
    b2a: "That deadlocked cycle? The roots can't reach it, so it's collected anyway.",
    b3: "Here hides the first elegant compromise: whether it'll be used later,",
    b3b: "no one can predict; whether it's findable now, you settle on the spot.",
    b4: "In 1960, McCarthy's Lisp did it first: normally idle,",
    b4b: "until the squares run out completely, then stop the program and clean house.",
    b5: "First follow the roots, flipping the sign bit of every square you touch;",
    b5b: "then sweep the whole heap, and put every unflipped square back on the free list.",
    b6: "On the machines of the day, that pause lasted several seconds, like a crash.",
    b7: "Today we call it *mark-and-sweep*:",
    b7b: "two steps. Mark: start at the roots, and tag everything you reach;",
    b7c: "then sweep: walk the heap end to end, the dead and the living alike;",
    b7d: "untagged goes back to the free list, tagged gets its tag wiped for next round.",
    b8: "Lua is mark-and-sweep at heart:",
    b8b: "make two hundred thousand live tables and as many dead ones, and try it.",
    b9: "One cycle later, memory is cut in half, from 28 MB to 14 MB,",
    b9b: "and not one live table is lost.",
    d1: "But scanning everything every time is too slow.",
    d1b: "In 1983, Lieberman and Hewitt saw through a pattern:",
    d1c: "most objects die young.",
    d2: "So objects live by age: generational collection. The new area is tiny,",
    d2b: "quick to sweep, so that's the area to sweep, and sweep often.",
    d2c: "Why quick? Most objects in the new area are already dead;",
    d2d: "move the few survivors up a generation, and the whole new area is empty again.",
    d3: "A statistical insight about how people write code",
    d3b: "grew into the physical shape of the heap.",
    d4: ".NET splits the heap into three generations: newborns start in gen 0,",
    d4b: "survive one collection to reach gen 1, and another to retire in gen 2.",
    d5: "In that first second, gen 0 was swept a full 136 times,",
    d5b: "while the big gens 1 and 2 weren't touched once.",
    d6: "But what if an old object holds a new one?",
    d6b: "Skip the old area, and how do you know the new object must live?",
    d8: ".NET's trick is a *card table*: whenever a pointer in the old area changes,",
    d8b: "tick a box on the write, and each collection checks only the ticked boxes.",
    d9: "That quiet *tick on the write* sentinel has a name. We'll save it for later.",
    e2: "And what if even the old area fills up?",
    e2b: "In 1978, Dijkstra and colleagues proposed:",
    e2c: "don't stop the program; let the collector and the program run at the same time.",
    e3: "To keep your head in the middle of a sprint,",
    e3b: "just paint objects in three states. This is tri-color marking.",
    e4: "White: untouched. Gray: touched, its targets not yet.",
    e4b: "Black: it and everything it points to are done. Completely safe.",
    e4c: "At the start, whatever the roots hold is gray; everything else is white.",
    e5: "Each time, the collector picks a gray one,",
    e5b: "paints every white it points to gray, and turns black itself.",
    e5c: "Gray is a to-do list: check one, cross it off;",
    e5d: "so the collector can work a bit, stop, and later pick up again from the gray.",
    e6: "When no gray is left, all black and white, the white that remains is garbage.",
    e7: "The thrill: as the collector paints, the program rewires pointers.",
    e7a: "If a black object, already checked, quietly grabs a white one,",
    e7ab: "and the gray that used to hold it lets go,",
    e7ac: "a live object is wrongly killed as garbage.",
    e8: "The way out? Dijkstra laid down a house rule:",
    e8b: "while marking, black must never point directly at white.",
    e9: "Whenever the program changes a pointer and breaks the rule,",
    e9b: "the white object it now points to is forcibly painted gray.",
    e10: "This little interception, done while writing a pointer,",
    e10b: "is the mystery we saved for later: the write barrier.",
    e11: "Three colors, one house rule; no need to predict what the program will do,",
    e11b: "and at full speed, not one living thing is missed.",
    e12: "Open the Lua source, and the comments state this iron rule word for word:",
    e12b: "while marking, black may never point to white.",
    e12a: "It only steps back when a table changes: new data in a black table,",
    e12ab: "the table turns itself back to gray, and the rule still holds.",
    e13: "Back to those four hundred thousand tables: with three colors and barriers,",
    e13b: "Lua splits the big cleanup into 419 small steps per cycle.",
    e14: "For the first 300 steps it's busy coloring, and memory doesn't budge;",
    e14b: "then it sweeps in batches, from 28 MB down to 14 MB.",
    e15: "And between every step, the program slips back to its own work.",
    e15b: "Big work in small pieces: this is incremental.",
    e18: "Java's G1 goes further: it moves marking into the background, running alongside,",
    e18b: "and pauses only briefly at the start and the end. This is concurrent.",
    e16: "Back to .NET's card table: the line a.Next = b",
    e16b: "compiles to four machine instructions:",
    e17: "compute the address, call the write barrier, a no-op to align, return.",
    e17b: "The pointer write and the card tick both live inside the barrier.",
    e20: "The programmer wrote not one line of barrier code,",
    e20b: "yet got a collector that marks while the program runs.",
    g1: "But clever is never free: the more often you collect,",
    g1b: "the less memory you use, and the hotter the CPU burns.",
    g3: "Since it's all trade-offs, Nim simply lets you choose:",
    g3b: "by default, reference counting plus a cycle collector.",
    g4: "Keep only the reference counting and you get ARC: no cycle-breaking cost,",
    g4b: "but that cycle from before can never be freed.",
    g5: "Rust drops the collector entirely,",
    g5b: "and lays down an iron law of ownership: every piece of memory has one owner.",
    g6: "The compiler writes the frees in at compile time; Nim's ARC does too,",
    g6b: "except it's still counting at run time.",
    g7: "C and Zig are blunter: memory you allocate yourself,",
    g7b: "you free yourself, and hand it back.",
    g8: "In computing, nobody gets a free lunch;",
    g8b: "the bill just lands on different people.",
    g9: "Reference counting pays small change on every pointer update;",
    g9b: "tracing collection pays for marking, pauses and barriers;",
    g10: "and ownership and manual management take the runtime's bill",
    g10b: "and hand it to the people writing code, and to the compiler.",
    h1: "Back to the first question: how does it know memory is no longer needed?",
    h1b: "It doesn't. All it knows is whether it can still find it, right now.",
    h4: "McCarthy's founding 1960 paper only dared to call it *reclamation*;",
    h4b: "a footnote came only with a later re-typesetting:",
    h5: "\"We already called this process 'garbage collection',",
    h5b: "but I guess I chickened out of using it in the paper,",
    h6: "or else the Research Laboratory of Electronics grammar ladies",
    h6b: "wouldn't let me.\"",
    h7: "Over sixty years, from pauses of several seconds",
    h7b: "to more than a hundred a second that nobody notices,",
    h7c: "seeking, between an unknowable future and strict hardware, the most elegant balance.",
    h8: "This is the art of garbage collection.",
  };
  // tts 字段写的是中文读法，只给中文
  const c = (id, text, facts, options = {}) => [id, { zh: text, en: EN[id] }, { facts: facts.split(' '), gap: 0.4, ...options, ...(typeof options.tts === 'string' ? { tts: { zh: options.tts } } : {}) }];

  const RAW = [
    {
      id: "open", chap: null, lead: 0.8, tail: 0.5,
      cues: [
        c('o1', "把内存想成一张巨大的格子纸：", 'G03 G01 D02', { gap: 0.05 }),
        c('o1b', "程序每造一个对象，就占掉一格", 'G03 G01 D02', { gap: 0.6 }),
        // 开场按策划者看片意见重写（2026-10-20）：观众刚进来，只用「格子纸」一个比喻——占格子、只占不还就写满、擦掉重用就够用、谁在擦
        c('o2', "造得有多快？C# 一秒钟能造六千七百万个，", 'D06 E09', { tts: "造得有多快？CSharp 一秒钟能造六千七百万个，", gap: 0.05 }),   // 字幕写 C#，配音按 CSharp 读（策划者要求）
        c('o2b', "眨眼就铺满", 'D06 E09', { gap: 0.6 }),
        c('o3', "可格子纸只有这么大，比如 64 MB；", 'D07 D05', { gap: 0.3 }),
        c('o3b', "要是只占不还，转眼就写满：内存耗尽", 'D07 G04 V03', { gap: 1.9 }),
        c('o4', "换成 PHP、Java，也一样撞墙，", 'V04 P05 J03 D07', { gap: 0.05 }),
        c('o4b', "报错各异，但总有一句你眼熟", 'V04 P05 J03 D07', { gap: 1.5 }),
        c('o5a', "好在大多数对象，用一下就没用了：", 'D06 N01', { gap: 0.9 }),
        c('o5', "把它们擦掉重用，同样六千七百万个，只占 11 MB", 'D06', { gap: 1.2 }),
        c('o6', "这一秒里，有人在幕后擦了 136 次，", 'D06 Z15 Z21', { gap: 0.05 }),
        c('o6b', "而写代码的人一个字都没多写", 'D06 Z15 Z21', { gap: 0.9 }),
        c('o7', "这位隐形管家，叫垃圾回收：", 'G01', { gap: 0.05 }),
        c('o7b', "把没人要的内存找出来，腾回去", 'G01', { gap: 0.6 }),
        c('o8', "难就难在，写代码的人只管要内存，", 'G04 K01', { gap: 0.05 }),
        c('o8b', "从不交代哪块“我不要了”", 'G04 K01', { gap: 0.6 }),
        c('o9', "它怎么猜出谁没用了？", 'G04 T03 C01', { gap: 0.05 }),
        c('o9b', "又怎么在程序狂奔时打扫，还不让人察觉？", 'G04 T03 C01', { gap: 1.5 }),
        c('o10', "从记账到追踪，从分代到并发——", 'G06 U08', { gap: 0.05 }),
        c('o10b', "这不是蛮力，而是一门妥协与权衡的艺术", 'G06 U08', { gap: 1.0 }),
        ['oT', null, { gap: 0, pause: 1.2 }]
      ],
    },
    {
      id: "count", chap: ["01", { zh: undefined }], lead: 5.6, tail: 0.7,
      cues: [
        c('a1', "最直觉的巧思：实时记账，", 'R01 P01 G06', { gap: 0.05 }),
        c('a1b', "数数有多少地方在用它。这招叫引用计数", 'R01 P01 G06', { gap: 0.6 }),
        c('a2', "CPython 把这本账藏在", 'R02', { gap: 0.05 }),
        c('a2b', "每个对象开头的 8 字节里，随时读写", 'R02', { gap: 0.4 }),
        c('a3', "a 刚出生记 1；赋给 b 变 2；", 'R02', { tts: "a 刚出生记一；赋给 b 变二；", gap: 0.05 }),
        c('a3b', "塞进列表升到 3；删掉 b、清空列表，又退回 1", 'R02', { tts: "塞进列表升到三；删掉 b、清空列表，又退回一。", gap: 0.4 }),
        c('a4', "抹去最后一个名字：计数归零，", 'R01 R04', { gap: 0.05 }),
        c('a4b', "当场释放，不劳烦任何人全局检查", 'R01 R04', { gap: 0.6 }),
        c('a5', "对象自己知道什么时候该走，干脆、体面", 'R04 X01', { gap: 0.8 }),
        c('a6', "代价是每次指针变动都得改账本；", 'R01 R06', { gap: 0.9 }),
        c('a6b', "更致命的死穴，是循环引用", 'R01 R06', { gap: 0.4 }),
        c('a7', "X 牵着 Y，Y 牵着 X；哪怕外面的名字全删光，", 'R05', { gap: 0.05 }),
        c('a7b', "它俩互相拉扯，计数依然卡在 1", 'R05', { gap: 0.4 }),
        c('a8', "谁都无法归零，成了内存孤岛；", 'R06 R07 P03', { gap: 0.05 }),
        c('a8b', "为此 Python 和 PHP 都得另请收集器，专门拆环", 'R06 R07 P03', { gap: 0.6 }),
        c('a8c', "拆环器怎么认出孤岛？拿 PHP 来说，它先“试减”：", 'P03', { gap: 0.05 }),
        c('a8d', "把它们彼此之间给的计数，先统统扣掉", 'P03', { gap: 0.6 }),
        c('a8e', "扣完还大于零，说明外面还有人在用，原样恢复；", 'P03', { gap: 0.3 }),
        c('a8f', "扣到零，说明只剩自己人互相拉扯：这就是孤岛", 'P03', { gap: 0.9 }),
        c('a9', "唤醒拆环器出手：", 'R08 P04', { tts: "唤醒拆环器出手：", gap: 0.05 }),
        c('a9b', "两边同时揪出并清理了 2 个死锁对象，正是 X 和 Y", 'R08 P04', { tts: "两边同时揪出并清理了两个死锁对象，正是 X 和 Y。", gap: 0.8 })
      ],
    },
    {
      id: "trace", chap: ["02", { zh: undefined }], lead: 5.6, tail: 0.7,
      cues: [
        c('b1', "既然低头记账怕孤岛，第二种办法选择顺藤摸瓜：", 'G02', { gap: 0.05 }),
        c('b1b', "从栈和全局变量这些“根”出发", 'G02', { gap: 0.4 }),
        c('b2', "顺着指针一路往下走：摸得到的算活着，", 'G02 G03', { gap: 0.05 }),
        c('b2b', "摸不到的就是垃圾。这叫追踪", 'G02 G03', { gap: 0.5 }),
        c('b2a', "刚才那个互相死锁的环？从根上摸不着，照收不误", 'R06 G04', { gap: 0.6 }),
        c('b3', "这里藏着第一次优雅的妥协：以后用不用，", 'G07 G04', { gap: 0.05 }),
        c('b3b', "神仙也算不准；现在能不能找到，当场就能算清", 'G07 G04', { gap: 0.8 }),
        c('b4', "1960 年麦卡锡的 Lisp 首次实现它：平时不管，", 'T01 T02 H01', { gap: 0.05 }),
        c('b4b', "直到格子彻底用光，才停下程序大扫除", 'T01 T02 H01', { gap: 0.4 }),
        c('b5', "先顺着根走，摸到的格子符号位拨成负；", 'T02', { gap: 0.05 }),
        c('b5b', "再扫一遍全盘，没拨过的统统放回空闲表", 'T02', { gap: 0.4 }),
        c('b6', "在当年的机器上，这一停就是好几秒，恍如死机", 'T03', { gap: 0.7 }),
        c('b7', "今天这叫“标记—清扫”：", 'T05 T02 X19', { gap: 0.05 }),
        c('b7b', "就两步。标记：从根出发，摸到一个就做个记号；", 'T05 T02', { gap: 0.4 }),
        c('b7c', "清扫：从堆的一头扫到另一头，死的活的都过一遍，", 'T05 X19', { gap: 0.05 }),
        c('b7d', "没记号的收回，有记号的擦掉记号，留给下一轮", 'T02 T09', { gap: 1.7 }),
        c('b8', "Lua 的底子就是标记—清扫：", 'L02 L06 E08', { gap: 0.05 }),
        c('b8b', "造出二十万张活表、二十万张废表，试试", 'L02 L06 E08', { gap: 0.4 }),
        c('b9', "一轮回收下来，内存从 28 MB 砍半到 14 MB，", 'L06', { gap: 0.05 }),
        c('b9b', "活表一张没少", 'L06', { gap: 0.8 })
      ],
    },
    {
      id: "gen", chap: ["03", { zh: undefined }], lead: 5.6, tail: 0.7,
      cues: [
        c('d1', "但每次全盘扫描太慢了。", 'N01', { gap: 0.05 }),
        c('d1b', "1983 年，利伯曼和休伊特看穿了一个规律：", 'N01', { gap: { zh: 0.05, en: 0.45 } }),
        c('d1c', "绝大多数对象都是短命鬼", 'N01', { gap: 0.6 }),
        c('d2', "于是按年龄分房住，这叫分代：新区极小，", 'N02 D01 N01', { gap: 0.05 }),
        c('d2b', "打扫极快，所以只盯着新区勤打扫", 'N02 D01 N01', { gap: 0.5 }),
        c('d2c', "为什么快？新区里的对象，大多已经死了；", 'N01 N05', { gap: 0.05 }),
        c('d2d', "把活下来的那几个挪到下一代，整片新区就能腾空重来", 'N02 D01', { gap: 0.8 }),
        c('d3', "一条关于写代码习惯的统计学洞察，", 'N05 N02', { gap: 0.05 }),
        c('d3b', "就这样长成了内存堆的物理形状", 'N05 N02', { gap: 0.8 }),
        c('d4', ".NET 把堆分为三代：刚出生在 0 代，", 'D01 D08', { tts: "dot net 把堆分为三代：刚出生在零代，", gap: 0.05 }),
        c('d4b', "熬过一次回收升 1 代，再熬过一次进 2 代养老", 'D01 D08', { tts: "熬过一次回收升一代，再熬过一次进二代养老。", gap: 2.4 }),
        c('d5', "开头那一秒钟里：第 0 代足足扫了 136 次，", 'D06', { tts: "开头那一秒钟里：第零代足足扫了一百三十六次，", gap: 0.05 }),
        c('d5b', "而庞大的第 1、2 代一次都没动", 'D06', { tts: "而庞大的第一、二代一次都没动。", gap: 0.8 }),
        c('d6', "可万一老对象牵着新对象呢？", 'N03 N06', { gap: 0.05 }),
        c('d6b', "如果不扫老区，怎么知道这个新对象不能杀？", 'N03 N06', { gap: 0.4 }),
        c('d8', ".NET 的巧思是用“卡表”记账：老区哪块改过指针，", 'D09 N03', { gap: 0.05 }),
        c('d8b', "写入时顺手打个勾，回收只查打勾处", 'D09 N03', { gap: 0.4 }),
        c('d9', "这个“顺手打勾”的暗哨有专门的名字，我们先留个悬念", 'D09 C08', { gap: 0.7 })
      ],
    },
    {
      id: "tri", chap: ["04", { zh: undefined }], lead: 6.1, tail: 0.7,
      cues: [
        c('e2', "如果连老区也满了呢？", 'C01 H05 T03', { gap: 0.05 }),
        c('e2b', "1978 年，迪杰斯特拉等人提出：", 'C01 H05 T03', { gap: 0.05 }),
        c('e2c', "别停程序，让收集器和程序同时跑", 'C01 H05 T03', { gap: 1.2 }),
        c('e3', "想在狂奔中理清头绪，", 'C02 C07', { gap: 0.05 }),
        c('e3b', "只需给对象染上三种状态，这叫三色标记", 'C02 C07', { gap: 0.4 }),
        c('e4', "白，还没碰；灰，自己碰过了、但牵着的还没碰；", 'C02', { gap: 0.05 }),
        c('e4b', "黑，自己和下线全碰完，绝对安全", 'C02', { gap: 0.5 }),
        c('e4c', "开始时，根直接牵着的先涂灰，其余全是白", 'C07', { tts: "开始时，根，直接牵着的先涂灰，其余全是白。", gap: 0.6 }),
        c('e5', "收集器每次挑个灰的：", 'C05', { gap: 0.05 }),
        c('e5b', "把它指向的白全涂灰，自己升为黑", 'C05', { gap: 0.4 }),
        c('e5c', "灰色就像一张待办清单：查完一个，划掉一个；", 'C02', { gap: 0.05 }),
        c('e5d', "所以收集器可以做一段、停一段，回头接着从灰的往下查", 'C02 L02 L05', { gap: 0.6 }),
        c('e6', "等到灰色全部清空、黑白分明，剩下的白，就是垃圾", 'C05 C07', { gap: 1.8 }),
        c('e7', "可惊险在于，收集器在涂色，程序正同时在改指针", 'C03', { gap: 0.3 }),
        c('e7a', "万一已查完的黑对象悄悄牵上白对象，", 'C03 C16', { gap: 0.05 }),
        c('e7ab', "原本牵着它的灰对象又松了手——", 'C03 C16', { gap: 0.05 }),
        c('e7ac', "活对象就会被当成垃圾冤杀", 'C03 C16', { gap: 0.9 }),
        c('e8', "怎么破局？迪杰斯特拉定下家规：", 'C03 C16 L03', { gap: 0.05 }),
        c('e8b', "标记期间，黑的绝不许直接指向白的", 'C03 C16 L03', { gap: 1 }),
        c('e9', "程序每改一次指针，一旦违规，", 'C04', { gap: 0.05 }),
        c('e9b', "就把新指向的白对象强行涂灰", 'C04', { gap: 0.4 }),
        c('e10', "这段改指针时顺手干的拦截活，", 'C07 C08 Z11', { gap: 0.05 }),
        c('e10b', "就是前面留下的悬念——写屏障", 'C07 C08 Z11', { gap: 0.7 }),
        c('e11', "三种颜色，一条家规；无需预判程序要干什么，", 'C03 C04 C01', { gap: 1.5 }),
        c('e11b', "高速并发中活物一个不漏", 'C03 C04 C01', { gap: 1.6 }),
        c('e12', "翻开 Lua 源码，注释里原封不动写着这条铁律：", 'L03 E08', { gap: 0.05 }),
        c('e12b', "标记时，黑的永远不许指向白的", 'L03 E08', { gap: { zh: 1.5, en: 0.5 } }),
        c('e12a', "只是改表时它选择退一步：黑表一旦塞入新数据，", 'L04', { gap: 0.05 }),
        c('e12ab', "自己主动退回灰，照样守规矩", 'L04', { gap: 0.6 }),
        c('e13', "回到那四十万张表：靠着三色与屏障，", 'L06 L05', { gap: 0.05 }),
        c('e13b', "Lua 把一轮大扫除拆小，419 步走完一轮", 'L06 L05', { gap: 0.4 }),
        c('e14', "前 300 步忙着染色，内存纹丝不动；", 'L06 L09', { gap: 0.05 }),
        c('e14b', "之后分批清扫，28 MB 平滑掉到 14 MB", 'L06 L09', { gap: 0.5 }),
        c('e15', "每一步的间隙，程序都能溜回去干自己的活——", 'L02 L05 C11', { gap: 0.05 }),
        c('e15b', "化整为零，这叫增量", 'L02 L05 C11', { gap: 0.7 }),
        c('e18', "Java 的 G1 更干脆，把标记丢去后台同时跑，", 'N08 J04 C13 C11 Z22', { gap: 0.05 }),
        c('e18b', "只在头尾极短地顿一下——这叫并发", 'N08 J04 C13 C11 Z22', { gap: 0.7 }),
        c('e16', "再看回 .NET 的卡表：一行 a.Next = b 的机器码，", 'D09 E09 X20', { tts: "再看回 dot net 的卡表：一航 a 点 next 等于 b 的机器码，", gap: 0.05 }),
        c('e16b', "背后其实有四条指令", 'D09 E09 X20', { tts: "背后其实有四条指令。", gap: 0.4 }),
        c('e17', "算地址、调写屏障、空一拍对齐、返回；", 'D09 Z20', { gap: 0.05 }),
        c('e17b', "指针写入和卡表打勾，全包在屏障里", 'D09 Z20', { gap: 0.7 }),
        c('e20', "程序员一行屏障都没写，", 'C08 D09 J04 D03', { gap: 0.05 }),
        c('e20b', "却白得了一个边跑边标记的收集器", 'C08 D09 J04 D03', { gap: 0.8 })
      ],
    },
    {
      id: "cost", chap: ["05", { zh: undefined }], lead: 5.6, tail: 0.7,
      cues: [
        c('g1', "但精妙绝不等于免费：收得越勤，", 'U01 L08', { gap: 0.05 }),
        c('g1b', "内存占得越少，CPU 就烧得越旺", 'U01 L08', { gap: 0.4 }),
        c('g3', "既然全是权衡，Nim 语言干脆让你自己挑：", 'M01', { gap: 0.05 }),
        c('g3b', "默认用引用计数加拆环器", 'M01', { gap: 0.4 }),
        c('g4', "只留引用计数，这叫 ARC：省了拆环开销，", 'M01 M04', { gap: 0.05 }),
        c('g4b', "但前面那个环，就永远无法释放", 'M01 M04', { gap: 1.9 }),
        c('g5', "Rust 则彻底不要收集器，", 'U05 U06', { gap: 0.05 }),
        c('g5b', "立下所有权铁律：一块内存只认一个主人", 'U05 U06', { gap: 0.4 }),
        c('g6', "何时释放由编译器在编译期写好；Nim 的 ARC 同理，", 'U06 M03 M02 Z23', { gap: 0.05 }),
        c('g6b', "只是运行时还在数数", 'U06 M03 M02 Z23', { gap: { zh: 2.2, en: 0.6 } }),
        c('g7', "C 和 Zig 更直接：自己分配的内存，", 'K01 K02', { gap: 0.05 }),
        c('g7b', "自己写 free 还回去", 'K01 K02', { gap: 2.8 }),
        c('g8', "计算机的世界里没人能白吃午餐，", 'U08', { gap: 0.05 }),
        c('g8b', "只是账单记在了不同人头上", 'U08', { gap: 0.4 }),
        c('g9', "引用计数，每改一次指针付一笔零钱；", 'R01 T03 D09 X21', { gap: 0.05 }),
        c('g9b', "追踪回收，为标记、停顿和屏障买单", 'R01 T03 D09 X21', { gap: 0.4 }),
        c('g10', "而所有权和手动管理，则是把运行时的账单，", 'U05 K01', { gap: 0.05 }),
        c('g10b', "递给了写代码的人和编译器", 'U05 K01', { gap: 1.4 })
      ],
    },
    {
      id: "close", chap: null, lead: 1.2, tail: 0.8,
      cues: [
        c('h1', "回到最初的问题：怎么知道内存没用了？", 'G04 G07', { gap: 0.05 }),
        c('h1b', "它不知道；它只知道，现在还找不找得到", 'G04 G07', { gap: 0.8 }),
        c('h4', "麦卡锡 1960 年那篇开山之作，正文只敢叫它“回收”；", 'T04 H01 H08', { gap: 0.05 }),
        c('h4b', "直到后来重新排版，才补了条脚注", 'T04 H01 H08', { gap: 0.4 }),
        c('h5', "“其实我们早就管它叫垃圾回收了，", 'T04', { gap: 0.05 }),
        c('h5b', "但我当年大概是没好意思写进论文——”", 'T04', { gap: 0.4 }),
        c('h6', "“又或者，是实验室管语法的女士们，", 'T04', { gap: 0.05 }),
        c('h6b', "不让我用这么粗俗的词。”", 'T04', { gap: 5.5 }),
        c('h7', "六十多年，从一停好几秒，", 'T03 D06 Z15 Z21', { gap: 0.05 }),
        c('h7b', "到一秒穿插上百次却浑然不觉；", 'T03 D06 Z15 Z21', { gap: { zh: 0.5, en: 0.8 } }),
        c('h7c', "在不可预知的未来与严苛的硬件之间寻找最优雅的平衡", 'T03 D06 Z15 Z21', { gap: 1.2 }),
        c('h8', "这就是，垃圾回收的艺术", 'G06 U08', { gap: 3.0 }),
        ['gCredit', null, { gap: 0, pause: 14, credits: true }]
      ],
    },
  ];

  // 候选读法，尚未调用语音；人工确认后逐段试听（tts_probe.js），不把这些替换当发音验收。长词在前。
  const SAY = {
    zh: [
      [/CPython/g, 'C Python'],
      [/Python/g, 'Python'],
      [/\.NET/g, 'dot net'],
      [/C#/g, 'C sharp'],
      [/CSharp/g, 'C sharp'],
      [/PHP/g, 'P H P'],
      [/ARC/g, 'A R C'],
      [/CPU/g, 'C P U'],
      [/G1/g, 'G 1'],
      [/a\.Next = b/g, 'a 点 next 等于 b'],
      [/b = a/g, 'b 等于 a'],
      [/28 MB/g, '二十八兆'],
      [/14 MB/g, '十四兆'],
      [/64 MB/g, '六十四兆'],
      [/11 MB/g, '十一兆'],
      [/8 字节/g, '八字节'],
      [/419 步/g, '四百一十九步'],
      [/300 步/g, '三百步'],
      [/136 次/g, '一百三十六次'],
      [/卡在 1/g, '卡在一'],
      [/(\d{4}) 年/g, (_, year) => [...year].map((n) => '零一二三四五六七八九'[+n]).join('') + '年'],
      // 中文引号只在 TTS 侧去掉，字幕保留原样
      [/[""]/g, ''],
      // 「强行」读 xíng（o3b、e9b），不换；2026-10-20 回听发现原规则把它换成了「强航」
      [/(?<![执进运银发可强])行(?!为)/g, '航'],
    ],
    en: [
      [/CPython/g, 'C Python'],
      [/C#/g, 'C sharp'],
      [/\.NET/g, 'dot net'],
      [/a\.Next = b/g, 'a dot Next equals b'],
      [/ARC/g, 'A R C'],
      [/CPU/g, 'C P U'],
      [/G1/g, 'G one'],
      [/(\d+) MB/g, '$1 megabytes'],
      [/gens? (\d)/g, 'generation $1'],
    ],
  };
  const strip = (s) => s.replace(/\*/g, '');
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap) }]),
  }));
  const ttsText = (cue) => (cue[2] && cue[2].tts) || ttsNorm(strip(cue[1]) + (LANG === 'zh' ? '。' : ''));

  // 没有实测时长时按 4.7 字/秒保守估算（合成旁白之前的占位）；必须由实际配音重新测时。
  const estimate = (text) => (LANG === 'zh' ? 0.25 + text.replace(/[，。：；、？\s]/g, '').length / 4.7 : 0.3 + text.split(/\s+/).length / 2.7);

  // 由脚本与实测时长算出整条时间线；浏览器端排动画、Node 端混音与检查都用它
  function layoutScript(DUR) {
    DUR = DUR || {};
    let t = 0;
    const cues = {}, scenes = [], order = [];
    for (const sc of SCRIPT) {
      const s0 = t;
      t += sc.lead || 0;
      const first = t;
      for (const cue of sc.cues) {
        const [id, cap, o = {}] = cue;
        const meas = DUR[id];
        const d = o.pause != null ? o.pause : (meas ? meas.d : estimate(ttsText(cue)));
        cues[id] = { id, scene: sc.id, cap, start: t, end: t + d, d, silent: o.pause != null, tts: o.pause != null ? null : ttsText(cue), words: meas ? meas.words : null };
        order.push(id);
        t += d + (o.gap != null ? o.gap : 0.3);
      }
      t += sc.tail != null ? sc.tail : 0.6;
      scenes.push({ id: sc.id, chap: sc.chap, start: s0, first, end: t, lead: sc.lead || 0 });
    }
    return { cues, scenes, order, total: t };
  }

  const api = { SCRIPT, LANG, pick, tr, layoutScript, ttsText, ttsNorm, strip };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { Object.assign(root, api); root.DUR = (root.DUR_ALL || {})[LANG] || {}; }
})(typeof window !== 'undefined' ? window : globalThis);
