// 中文第 1 稿；事实入口 research/FACTS.md。未确认，不配音、不铺开场景。
// facts 关联 research/FACTS.md 的事实编号；此字段只记录依据，不进入字幕。
// 英文须在中文确认后翻译（当前只出中文）。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  if (LANG !== 'zh') throw new Error('英文文案尚未翻译；当前仅可使用 --lang zh / ?lang=zh。');
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => LANG === 'zh' ? zh : en;
  const c = (id, text, facts, options = {}) => [id, { zh: text }, { facts: facts.split(' '), gap: 0.4, ...options }];

  const RAW = [
    {
      id: 'open', chap: null, lead: 0.9, tail: 0.5,
      cues: [
        c('o1', '有一种数据库，可以把服务端整个关掉', 'E08'),
        c('o2', '库文件照样打开，数据照样读写', 'E08'),
        c('o3', '因为引擎本来就住在你自己的程序里', 'E01 E02'),
        c('o4', '它叫 Firebird', 'H01 T01', { gap: 0.7 }),
        c('o5', '两个开源巨头之外，一个更小众的选择', 'H01 H03'),
        c('o6', '这一集，就看它是怎么做到的', 'E01 E05', { gap: 2.0 }),
        ['oT', null, { pause: 2.0, gap: 0 }],
      ],
    },
    {
      id: 'history', chap: ['01', { zh: '它从哪里来' }], lead: 3.2, tail: 0.7,
      cues: [
        c('h1', '它的起点，不是一段新写的代码', 'H01'),
        c('h2', '2000 年，Borland 公开了一套源码', 'H01', { tts: { zh: '二零零零年，Borland 公开了一套源码。' } }),
        c('h2a', '那是它的商业数据库，InterBase 6.0', 'H01', { tts: { zh: '那是它的商业数据库，Inter Base 六点零。' } }),
        c('h3', '同一年，Firebird 这个项目建立了起来', 'H01', { gap: 0.5 }),
        c('h3a', '第一版在 2002 年 3 月 11 日发布', 'H02', { tts: { zh: '第一版在二零零二年三月十一日发布。' } }),
        c('h4', '今天的稳定版，是 5.0.4', 'H03 T01', { tts: { zh: '今天的稳定版，是五点零点四。' } }),
        c('h5', '二十多年过去，代码被大规模重写', 'H07', { gap: 0.5 }),
        c('h6', '如今用 C++ 写成', 'H07', { tts: { zh: '如今用 C 加加写成。' }, gap: 2.0 }),
      ],
    },
    {
      id: 'engine', chap: ['02', { zh: '引擎是库，服务端是壳' }], lead: 3.4, tail: 0.7,
      cues: [
        c('e1', '现在看 Firebird 的内部，第一件反直觉的事', 'E01'),
        c('e2', '它没有一个非要存在的「数据库服务」', 'E01 E05'),
        c('e3', '核心是一个库文件，引擎的代码就在里面', 'E01 E04'),
        c('e4', '外面那个 firebird.exe，只负责听端口、转发连接', 'E04 E05', { tts: { zh: '外面那个 firebird 点 exe，只负责听端口、转发连接。' }, gap: 0.5 }),
        c('e5', '三个文件的体积，最能说明问题', 'E04'),
        c('e6', '服务端程序，1.16 MB', 'E04', { tts: { zh: '服务端程序，一点一六 M B。' } }),
        c('e7', '客户端库，2.07 MB', 'E04', { tts: { zh: '客户端库，二点零七 M B。' } }),
        c('e8', '真正干活的引擎插件，8.93 MB', 'E04', { tts: { zh: '真正干活的引擎插件，八点九三 M B。' }, gap: 0.6 }),
        c('e9', '服务端，比客户端库还小', 'E04 E05', { gap: 0.6 }),
        c('e10', '那客户端，凭什么知道该走哪条路', 'E02'),
        c('e11', 'Firebird 内部有一串「提供程序」，按顺序试', 'E02', { gap: 0.5 }),
        c('e12', '带着网络地址的走远程，只给本地路径的，引擎直接进你的进程', 'E02 E03', { gap: 2.0 }),
      ],
    },
    {
      id: 'modes', chap: ['03', { zh: '同一个库文件，三种走法' }], lead: 3.4, tail: 0.7,
      cues: [
        c('m1', '同一个库文件，三种走法，读的都是同一份数据', 'E02 E03 E08'),
        c('m2', '远程，inet 开头，走 TCP', 'E03', { tts: { zh: '远程，i net 开头，走 T C P。' } }),
        c('m3', '环回，xnet 开头，走本机的共享内存', 'E03', { tts: { zh: '环回，x net 开头，走本机的共享内存。' }, gap: 0.5 }),
        c('m4', '嵌入式，只给文件路径，引擎在你自己的进程里', 'E02 E08', { gap: 0.6 }),
        c('m5', '怎么证明第三种真的不需要服务端', 'E08'),
        c('m6', '把服务端进程停掉，再连一次', 'E08'),
        c('m7', '远程连不上了，环回也连不上了', 'E08', { gap: 0.5 }),
        c('m8', '只有嵌入式，照样打开那个库文件', 'E08', { gap: 0.6 }),
        c('m9', '这就是 Firebird 的形态：引擎是库，外壳可有可无', 'E01 E05 E08', { gap: 2.0 }),
      ],
    },
    {
      id: 'store', chap: ['04', { zh: '数据怎么放' }], lead: 3.2, tail: 0.7,
      cues: [
        c('d1', '库就是一个文件，扩展名 fdb', 'D01', { tts: { zh: '库就是一个文件，扩展名 f d b。' } }),
        c('d2', '这个文件被切成固定大小的页，本片是 8192 字节', 'D01 D03', { tts: { zh: '这个文件被切成固定大小的页，本片是八千一百九十二字节。' }, gap: 0.5 }),
        c('d3', '每种页有自己的类型，页头第一个字节就写着', 'D04 D05'),
        c('d4', '有存数据的页，也有索引的页', 'D05 D06'),
        c('d5', '还有一页，记着所有事务的生死', 'D05 D06 W03', { gap: 0.5 }),
        c('d6', '剩下的，是管空间和管编号的书页', 'D05 D06'),
        c('d7', '本片这个库，建完表插完数据，一共 240 页', 'D03 D06', { gap: 0.5 }),
        c('d8', '数据页 87 页，索引页 64 页', 'D06', { tts: { zh: '数据页八十七页，索引页六十四页。' } }),
        c('d9', '那一页事务清单，记着每个事务是活的还是死了', 'D05 W03', { gap: 2.0 }),
      ],
    },
    {
      id: 'update', chap: ['05', { zh: '一次修改' }], lead: 3.2, tail: 0.7,
      cues: [
        c('u1', '改一行数据，磁盘上会发生什么', 'U04'),
        c('u2', 'Firebird 不就地改', 'U04'),
        c('u3', '它把新的一份写到数据页上，旧的那份留在原地', 'U04 U01'),
        c('u4', '本片实测：干净库里，alice 只有一个副本', 'U04', { gap: 0.5 }),
        c('u5', '执行一次 UPDATE 提交，再看同一个文件', 'U04', { tts: { zh: '执行一次 update 提交，再看同一个文件。' } }),
        c('u6', '变成两个副本', 'U04', { gap: 0.5 }),
        c('u7', '新副本在第 231 页，文件偏移 1900254 字节', 'U04 D07', { tts: { zh: '新副本在第二百三十一页，文件偏移一百九十万零二百五十四字节。' } }),
        c('u8', '旧副本还在，等着被回收', 'U01 U03', { gap: 2.0 }),
      ],
    },
    {
      id: 'concur', chap: ['06', { zh: '怎么并发' }], lead: 3.2, tail: 0.7,
      cues: [
        c('c1', '既然不是就地改，读者会看到哪一份', 'M01'),
        c('c2', '开两个会话，一个写，一个读', 'M01'),
        c('c3', '写的那边，把 alice 的年龄改成 31，先不提交', 'M01', { gap: 0.5 }),
        c('c4', '读的那边，看到的还是 30', 'M01'),
        c('c5', '再读一次，还是 30，读不受写的影响', 'M01 M02', { gap: 0.5 }),
        c('c6', '写的那边一提交，读的这边才变成 31', 'M01', { gap: 0.6 }),
        c('c7', '这就是行版本：每个事务，看自己的一份', 'U01 M03'),
        c('c8', 'Firebird 5 的缺省，是读已提交加上语句级读一致性', 'M02'),
        c('c9', '引擎沿着后继版本链，往回找当前能看见的那一份', 'M03', { gap: 0.6 }),
        c('c10', '旧副本要等回收，间隔是两万次事务一次', 'U03 U02', { tts: { zh: '旧副本要等回收，间隔是两万次事务一次。' }, gap: 2.0 }),
      ],
    },
    {
      id: 'durable', chap: ['07', { zh: '出错怎么办' }], lead: 3.2, tail: 0.7,
      cues: [
        c('w1', '最后是出错怎么办', 'W01'),
        c('w2', '强制写是开着的，事务先写日志，再落数据页', 'W01'),
        c('w3', '引擎里有两个专职角色', 'W02'),
        c('w4', '一个叫 Cache Writer，负责把脏页写回文件', 'W02', { gap: 0.5 }),
        c('w5', '一个叫 Garbage Collector，负责回收旧版本', 'W02 U01 U02', { tts: { zh: '一个叫 Garbage Collector，负责回收旧版本。' } }),
        c('w6', '它们各占一个连接，在服务端进程里', 'E06 W02', { gap: 2.0 }),
      ],
    },
    {
      id: 'outro', chap: ['08', { zh: 'Firebird 的回答' }], lead: 3.2, tail: 0.7,
      cues: [
        c('z1', '回到这一系列的老问题', 'D04 D05 M01 W01'),
        c('z2', '数据怎么放：切成页，页有类型', 'D01 D05'),
        c('z3', '怎么找：索引是独立的页', 'D06 D08'),
        c('z4', '怎么改：不就地改，留在原地', 'U04'),
        c('z5', '怎么并发：每个事务看自己的一份', 'M01'),
        c('z6', '出错怎么办：先写日志，再落盘', 'W01'),
        c('z7', 'Firebird 的答案，和前两集不太一样', 'E01 E05', { gap: 0.6 }),
        c('z8', '它的引擎是库，所以能整个搬进你的程序', 'E01 E08', { gap: 2.0 }),
      ],
    },
    {
      id: 'next', chap: null, lead: 2.8, tail: 0.6,
      cues: [
        c('n1', '这个系列，下一集往另一个极端走', 'H08'),
        c('n2', '下一集的主角 SQLite，是个链接进程序的库', 'H08', { gap: 0.6 }),
        c('n3', '它连服务端的形态，都不保留', 'H08', { gap: 0.6 }),
        c('n4', 'Firebird 站在中间：引擎是库，外壳可要可不要', 'E01 E05 E08', { gap: 1.6 }),
      ],
    },
    {
      id: 'credits', chap: null, lead: 0.4, tail: 0.2,
      cues: [
        ['credits', null, { pause: 13, credits: true, gap: 0 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/InterBase/g, 'Inter Base'],
      [/C\+\+/g, 'C 加加'],
      [/firebird\.exe/g, 'firebird 点 exe'],
      [/Garbage Collector/g, 'Garbage Collector'],
      [/Cache Writer/g, 'Cache Writer'],
      [/inet/g, 'i net'],
      [/xnet/g, 'x net'],
      [/TCP/g, 'T C P'],
      [/fdb/g, 'f d b'],
      [/Firebird/g, 'Fire bird'],
      [/UPDATE/g, 'update'],
    ],
    en: [],
  };
  const strip = (s) => s.replace(/\*/g, '');
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap) }]),
  }));
  const ttsText = (c) => (c[2] && c[2].tts) || ttsNorm(strip(c[1]) + (LANG === 'zh' ? '。' : ''));

  // 没有实测时长时的估算（合成旁白之前的占位）
  const estimate = (text) => (LANG === 'zh' ? 0.35 + text.replace(/[，。：；、\s]/g, '').length / 5.2 : 0.3 + text.split(/\s+/).length / 2.7);

  // 由脚本与实测时长算出整条时间线；浏览器端排动画、Node 端混音与检查都用它
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

  const api = { SCRIPT, LANG, pick, tr, layoutScript, ttsText, ttsNorm, strip };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { Object.assign(root, api); root.DUR = (root.DUR_ALL || {})[LANG] || {}; }
})(typeof window !== 'undefined' ? window : globalThis);
