// 中文第 5 稿（2026-10-19）；事实入口 research/FACTS.md，每句的 facts 字段引用那里的编号。未确认，不配音、不铺开场景。
// 第 5 稿：WaterRun 要求全片 4–7 分钟（第 4 稿压成五章：01 引用计数、02 标记—清扫、03 分代、04 三色与写屏障、05 没有免费的午餐），
//   并要求配音与台词俏皮、妩媚、有艺术感，「赛博活泼」——本稿把旁白改成这种口吻，事实与句号对应关系不变；配音改用 MiniMax（见 project.json 的 tts）。
//   语言阵容按 WaterRun 的熟悉度：GC 语言 Python、Lua、C#、PHP、Nim、Java（JavaScript 只在报错拼贴里出现）；非 GC 语言 Rust、Zig、C。
//   保留第 2 稿的三条意见：不设「艺术」单独章节，妙处放在各章末尾一句；章名为机制名称并在旁白里点名；开场先看现象再提问。
//   并入第 3 稿对抗审稿（观众通读）的意见：追踪作为总称在 02 章定义、所有权在 Rust 句里定义、d 章的承诺改为「下一步揭晓」、迪杰斯特拉一句不用「并行」、Nim 句去掉缩写。
// 每个 cue = [句号, 字幕, { facts, tts, gap, pause }]。facts 只记录依据，不进入字幕。英文须在中文确认后翻译。
// 字幕里 *词* 表示强调；读法只放在 SAY 表或 tts 字段。gap：该句结束到下一句开始的停顿（秒，缺省 0.4）；pause：无旁白的纯画面停顿。
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  if (LANG !== 'zh') throw new Error('英文文案尚未翻译；当前仅可使用 --lang zh / ?lang=zh。');
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);
  const c = (id, text, facts, options = {}) => [id, { zh: text }, { facts: facts.split(' '), gap: 0.4, ...options }];

  const RAW = [
    {
      id: 'open', chap: null, lead: 0.8, tail: 0.5,
      cues: [
        c('o1', '来，把内存想成一张格子纸：程序每造一个对象，就占一格', 'G03 G01 D02', { gap: 0.6 }),
        c('o2', '有多快？C# 一秒钟，六千七百万个，数都数不过来', 'D06 E09', { gap: 0.6 }),
        c('o3', '堆只给 64 MB，一个都不撒手？收五次也收不回，内存耗尽', 'D07 D05 G04 V03', { gap: 0.6 }),
        c('o4', 'PHP、Java 撞上去，各骂各的；总有一句你眼熟', 'V04 P05 J03 D07', { gap: 1.5 }),
        c('o5', '换个活法，用完就撒手：还是六千七百万个，堆才 11 MB', 'D06'),
        c('o6', '中间替它收了一百三十六次，程序一个字都没管', 'D06 Z15 Z21', { gap: 0.9 }),
        c('o7', '幕后这位，叫垃圾回收：把没人要的内存找出来，腾回去', 'G01', { gap: 0.6 }),
        c('o8', '可惜，有收集器的程序不会交代：这块，我不要了', 'G04 K01', { gap: 0.6 }),
        c('o9', '它怎么猜出一块内存没用了？又怎么收，才不把程序晾太久', 'G04 T03 C01', { gap: 0.8 }),
        c('o10', '引用计数、标记—清扫、分代、三色、写屏障；最后，谁买单', 'G06 U08', { gap: 0.5 }),
        ['oT', null, { pause: 1.2, gap: 0 }],
      ],
    },
    {
      id: 'count', chap: ['01', { zh: '引用计数' }], lead: 3.5, tail: 0.7,
      cues: [
        c('a1', '最直接的办法：数数有多少地方在用它。这招叫引用计数', 'R01 P01 G06', { gap: 0.6 }),
        c('a2', 'CPython 把它藏在每个对象开头的 8 字节里，直接读', 'R02'),
        c('a3', 'a 刚出生，1；b = a，2；放进列表，3；删掉 b，2；清空列表，1', 'R02', { tts: 'a 刚出生，一；b 等于 a，二；放进列表，三；删掉 b，二；清空列表，一。' }),
        c('a4', '删掉最后一个名字：归零，当场释放，不劳烦任何人检查', 'R01 R04', { gap: 0.6 }),
        c('a5', '对象自己知道什么时候该走，多体面', 'R04 X01', { gap: 0.8 }),
        c('a6', '代价是每次引用增减都得记一笔；更烦的是环', 'R01 R06'),
        c('a7', 'X 牵着 Y，Y 牵着 X；外面的名字一删，两个计数都卡在 1', 'R05'),
        c('a8', '谁都不归零；Python、PHP 都另请一个收集器专门拆环', 'R06 R07 P03', { gap: 0.5 }),
        c('a9', '叫它出手：两边都报收了 2 个，正是 X 和 Y', 'R08 P04', { gap: 0.8, tts: '叫它出手：两边都报收了两个，正是 X 和 Y。' }),
      ],
    },
    {
      id: 'trace', chap: ['02', { zh: '标记—清扫' }], lead: 3.5, tail: 0.7,
      cues: [
        c('b1', '第二种办法不数，而是走：从根出发，栈上的变量、全局变量', 'G02'),
        c('b2', '顺着指针一路走：走得到的活着，走不到的，垃圾；这叫追踪', 'G02 G03', { gap: 0.5 }),
        c('b2a', '刚才那个环？够不着，照收', 'R06 G04', { gap: 0.6 }),
        c('b3', '以后用不用，神仙也说不准；能不能找到，现在就能算', 'G07 G04', { gap: 0.8 }),
        c('b4', '1960 年，麦卡锡的 Lisp：空闲的格子用光，才开始回收', 'T01 T02 H01'),
        c('b5', '走到的格子符号位拨成负；再扫一遍，没变的放回空闲表', 'T02'),
        c('b6', '这一轮，要花好几秒', 'T03', { gap: 0.7 }),
        c('b7', '今天这叫标记—清扫：标记只认活的，没标的清扫挨个请走', 'T05 T02 X19', { gap: 0.7 }),
        c('b8', 'Lua 就是标记—清扫：二十万张活表、二十万张垃圾，试试', 'L02 L06 E08'),
        c('b9', '一轮回收，28 MB 掉到 14 MB；活的一张没少', 'L06', { gap: 0.8 }),
      ],
    },
    {
      id: 'gen', chap: ['03', { zh: '分代' }], lead: 3.5, tail: 0.7,
      cues: [
        c('d1', '1983 年，利伯曼和休伊特看出来了：短命对象占大头', 'N01', { gap: 0.6 }),
        c('d2', '按年龄分家，这叫分代：新区小，收一次快，所以勤收', 'N02 D01 N01', { gap: 0.6 }),
        c('d3', '一条经验观察，就这样长成了堆的形状', 'N05 N02', { gap: 0.8 }),
        c('d4', '.NET 分三代：刚出生 0，活过一次回收 1，再活过一次 2', 'D01 D08', { gap: 0.7, tts: 'dot net 分三代：刚出生零，活过一次回收一，再活过一次二。' }),
        c('d5', '刚才那一秒：第 0 代收了 136 次，第 1、2 代一次都没收', 'D06', { gap: 0.8, tts: '刚才那一秒：第零代收了一百三十六次，第一、二代一次都没收。' }),
        c('d6', '可老对象也会指向新对象；只收新区，怎么知道它还活着', 'N03 N06'),
        c('d8', '.NET 用卡表记：老区哪块写过指针，写入时顺手打勾', 'D09 N03'),
        c('d9', '它有名字，先不告诉你', 'D09 C08', { gap: 0.7 }),
      ],
    },
    {
      id: 'tri', chap: ['04', { zh: '三色与写屏障' }], lead: 3.5, tail: 0.7,
      cues: [
        c('e2', '1978 年，迪杰斯特拉等人说：别停程序，让收集器和它一起跑', 'C01 H05 T03'),
        c('e3', '给每个对象上个色，就三种，这叫三色标记', 'C02 C07'),
        c('e4', '白，还没碰；灰，碰了，它牵的还没碰；黑，全碰完', 'C02', { gap: 0.6 }),
        c('e5', '收集器挑个灰的：它指的白全涂灰，自己升黑', 'C05'),
        c('e6', '灰的用完了，剩下的白，就是垃圾', 'C05 C07', { gap: 0.8 }),
        c('e7', '麻烦在于，程序同时还在改指针', 'C03', { gap: 0.3 }),
        c('e7a', '黑的悄悄牵上白的，灰的那头又松了手：活的就被当垃圾', 'C03 C16', { gap: 0.6 }),
        c('e8', '迪杰斯特拉定的家规：标记时，黑的不许指白的', 'C03 C16 L03', { gap: 1.0 }),
        c('e9', '程序每改一个指针，就把新指向的对象涂灰', 'C04'),
        c('e10', '这段写指针时顺手干的活，叫写屏障', 'C07 C08 Z11', { gap: 0.7 }),
        c('e11', '三种颜色，一条规矩；不用猜程序要干什么，活的一个不漏', 'C03 C04 C01', { gap: 0.8 }),
        c('e12', 'Lua 源码注释就写着：标记时，黑的永远不许指向白的', 'L03 E08', { gap: 0.5 }),
        c('e12a', '改表时它反着来：黑表自己退回灰，照样守规矩', 'L04', { gap: 0.6 }),
        c('e13', '回到那四十万张表：Lua 把回收拆小，419 步走完一轮', 'L06 L05'),
        c('e14', '前 300 步内存纹丝不动；之后清扫，28 MB 掉到 14 MB', 'L06 L09', { gap: 0.5 }),
        c('e15', '每一步之间，程序都溜回去干自己的活；这叫增量', 'L02 L05 C11', { gap: 0.7 }),
        c('e18', 'Java 的 G1 把标记丢去后台，头停一下尾停两下：并发', 'N08 J04 C13 C11 Z22', { gap: 0.7 }),
        c('e16', '回到 .NET 的卡表：a.Next = b 的机器码，四条指令', 'D09 E09 X20', { tts: '回到 dot net 的卡表：这句赋值的机器码，四条指令。' }),
        c('e17', '算地址，调写屏障，空一拍，返回；写入和打勾都在屏障里', 'D09 Z20', { gap: 0.7 }),
        c('e20', '程序员一行屏障都没写，却得了一个边跑边标记的收集器', 'C08 D09 J04 D03', { gap: 0.8 }),
      ],
    },
    {
      id: 'cost', chap: ['05', { zh: '谁来买单' }], lead: 3.5, tail: 0.7,
      cues: [
        c('g1', '收得越勤，内存占得越少，CPU 烧得越多', 'U01 L08'),
        c('g3', 'Nim 语言让你自己挑：默认引用计数加拆环器', 'M01'),
        c('g4', '只留引用计数，这叫 ARC：同一个环，永远不释放', 'M01 M04', { gap: 0.7 }),
        c('g5', 'Rust 不要收集器，靠所有权：一块内存只认一个主人', 'U05 U06'),
        c('g6', '释放由编译器写好；Nim 的 ARC 同理，只是还在数数', 'U06 M03 M02 Z23', { gap: 0.6 }),
        c('g7', 'C 和 Zig 更直接：自己分配，自己 free', 'K01 K02', { gap: 0.7 }),
        c('g8', '谁都没白吃，只是账记在不同人头上', 'U08', { gap: 0.4 }),
        c('g9', '计数每改一个指针付钱；追踪付标记、停顿，还有屏障', 'R01 T03 D09 X21'),
        c('g10', '所有权和手动管理，则把账单递给了写代码的人和编译器', 'U05 K01', { gap: 0.9 }),
      ],
    },
    {
      id: 'close', chap: null, lead: 1.2, tail: 0.8,
      cues: [
        c('h1', '怎么知道内存没用了？它不知道；它只知道，还找不找得到', 'G04 G07', { gap: 0.8 }),
        c('h4', '麦卡锡 1960 年那篇只叫它回收；后来重新排版，补了条脚注', 'T04 H01 H08'),
        c('h5', '我们早就管它叫垃圾回收了，但我大概是没敢写进论文', 'T04'),
        c('h6', '要不就是实验室管语法的女士们不让我用', 'T04', { gap: 2.5 }),
        c('h7', '六十多年，从一停好几秒，到一秒一百多次，程序一行没管', 'T03 D06 Z15 Z21', { gap: 1.0 }),
        ['gCredit', null, { pause: 14.0, gap: 0, credits: true }],
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
      [/PHP/g, 'P H P'],
      [/ARC/g, 'A R C'],
      [/CPU/g, 'C P U'],
      [/G1/g, 'G 1'],
      [/a\.Next = b/g, 'a 点 next 等于 b'],
      [/b = a/g, 'b 等于 a'],
      [/28 MB 掉到 14 MB/g, '二十八兆掉到十四兆'],
      [/64 MB/g, '六十四兆'],
      [/11 MB/g, '十一兆'],
      [/8 字节/g, '八字节'],
      [/419 步/g, '四百一十九步'],
      [/300 步/g, '三百步'],
      [/卡在 1/g, '卡在一'],
      [/(\d{4}) 年/g, (_, year) => [...year].map((n) => '零一二三四五六七八九'[+n]).join('') + '年'],
      [/(?<![执进运银发可])行(?!为)/g, '航'],
    ],
    en: [],
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
