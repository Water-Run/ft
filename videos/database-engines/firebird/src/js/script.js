// 中文第 5 稿（2026-10-21）；事实入口 research/FACTS.md。未确认，不配音、不铺开场景。
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
      id: 'open', chap: null, lead: 0.9, tail: 0.6,
      cues: [
        c('o1', '前三期，我们从 MyISAM、InnoDB', 'C03 C11', { tts: { zh: '前三期，我们从 My ISAM、Inno D B，' }, gap: 0.25 }),
        c('o2', '一路讲到了 PostgreSQL', 'C03 C11'),
        c('o3', '同样是存、查、改数据，底下的做法各有不同', 'C06 C07 C08'),
        c('o4', '但应用连接的，都是一个独立的数据库服务', 'C01 C11', { gap: 0.8 }),
        c('o5', '这一集，接着看两个开源巨头之外', 'C11', { tts: { zh: '这一集，接着看两个开源巨头之外，' }, gap: 0.25 }),
        c('o6', '一个小众的第三选择：Firebird', 'C09 C11'),
        c('o7', '它同样是一套完整的开源关系数据库', 'H09', { gap: 0.8 }),
        c('o8', '既能像 MySQL、PostgreSQL 那样', 'C01 E03', { tts: { zh: '既能像 My S Q L、Postgres Q L 那样，' }, gap: 0.25 }),
        c('o9', '作为独立服务，接受应用的连接', 'E01 E03', { gap: 0.8 }),
        c('o10', '也能像下一集的 SQLite，直接嵌进应用程序', 'C02 C03 E02 E09'),
        c('o11', '由应用自己读写文件，不必另开服务', 'C02 E09', { gap: 0.8 }),
        c('o12', '同一套引擎，两种用法', 'E01 E09'),
        c('o13', '数据怎么放、怎么找，修改又怎样落盘', 'D10 Q03 W05', { tts: { zh: '数据怎么放、怎么找，修改又怎样落盘？' } }),
        c('o14', '我们接着用 Alice 这行数据，看它怎样实现', 'S01 Q01 U05', { gap: 1.0 }),
        ['oT', null, { pause: 2, gap: 0 }],
      ],
    },
    {
      id: 'history', chap: ['01', { zh: '它从哪里来' }], lead: 3.2, tail: 0.7,
      cues: [
        c('h4', '它的来历，要追到八十年代的 InterBase', 'H10'),
        c('h5', '2000 年，Borland 公开了 InterBase 的源码', 'H01', { tts: { zh: '二零零零年，Borland 公开了 Inter Base 的源码。' } }),
        c('h6', '社区接过这份代码，建立了 Firebird 项目', 'H01'),
        c('h7', '2002 年，Firebird 发布第一个正式版本', 'H02', { tts: { zh: '二零零二年，Fire bird 发布第一个正式版本。' } }),
        c('h8', '这一集，就用它的 5.0.4 版来看看', 'T01', { tts: { zh: '这一集，就用它的五点零点四版来看看。' }, gap: 1.0 }),
      ],
    },
    {
      id: 'engine', chap: ['02', { zh: '引擎也能装进程序' }], lead: 3.2, tail: 0.7,
      cues: [
        c('e1', '两种用法，背后其实是同一套引擎', 'E01 E09'),
        c('e2', '做服务端时，引擎由服务端进程加载', 'E01 E09'),
        c('e3', '应用发来 SQL，它处理好，再把结果送回去', 'E01 E03 H09', { gap: 0.8 }),
        c('e4', '能换一种用法，是因为引擎做成了可加载的库', 'E01 E09'),
        c('e5', '这里的库，是一组能被程序调用的代码', 'E09'),
        c('e6', '它负责执行 SQL、查找记录、读写文件', 'H09 E09 Q01', { gap: 0.8 }),
        c('e7', '应用把这份引擎加载进来', 'E02 E09', { tts: { zh: '应用把这份引擎加载进来，' }, gap: 0.25 }),
        c('e8', '数据库的工作，就在自己的进程里完成', 'E02 E09'),
        c('e9', '这种用法，就叫嵌入式', 'E02 E09', { gap: 0.8 }),
        c('e10', '从 3.0 起，这两种形态共用同一份核心引擎', 'H05', { tts: { zh: '从三点零起，这两种形态共用同一份核心引擎。' } }),
        c('e11', '所以关掉独立服务端，嵌入式仍能读写', 'E08 E09'),
        c('e12', '数据则另外存放，放在数据库文件里', 'E09 D10', { gap: 1.0 }),
      ],
    },
    {
      id: 'store', chap: ['03', { zh: '数据放在哪里' }], lead: 3.2, tail: 0.7,
      cues: [
        c('d1', '还是那张 users 表，有名字，也有年龄', 'S01'),
        c('d2', 'Alice，30 岁，就在其中一行', 'S01 Q01', { tts: { zh: 'Alice，三十岁，就在其中一航。' } }),
        c('d3', '这张表和它的索引，都装在这个 fdb 文件里', 'D10', { tts: { zh: '这张表和它的索引，都装在这个 f d b 文件里。' }, gap: 0.8 }),
        c('d4', '文件内部，先分成一页一页', 'D01 D10'),
        c('d5', '这个库里，一页是 8192 字节', 'D01', { tts: { zh: '这个库里，一页是八千一百九十二字节。' } }),
        c('d6', '存一行数据，就是给它在数据页里安排位置', 'D10'),
        c('d7', '页内还有一小块目录，记着每行在什么地方', 'D10'),
        c('d8', '表也有自己的目录，记着各个数据页的位置', 'D10'),
        c('d8a', '先找到页，再在页里找到行', 'D10 Q03', { gap: 0.8 }),
        c('d9', '这里和前面的 InnoDB 有一点不同', 'C06'),
        c('d10', 'InnoDB 沿主键索引找到底，拿到的就是整行', 'C06'),
        c('d11', 'Firebird 把行放在数据页，索引另放', 'D10 C06'),
        c('d12', '索引负责指路，数据页负责装内容', 'D10 Q03'),
        c('d13', '这一点，和 PostgreSQL 更接近', 'C06', { gap: 1.0 }),
      ],
    },
    {
      id: 'query', chap: ['04', { zh: 'Alice 今年几岁' }], lead: 3.2, tail: 0.7,
      cues: [
        c('q1', '现在，程序要问：Alice 今年几岁', 'Q01', { tts: { zh: '现在，程序要问：Alice 今年几岁？' } }),
        c('q2', '它只给出名字，数据库得先找到这一行', 'Q01 Q04'),
        c('q3', '最直接的办法，是把名字一个个比过去', 'Q04'),
        c('q4', '不过，我们已经给姓名建好了索引', 'D09'),
        c('q5', '这次，引擎决定从索引找', 'Q01', { gap: 0.8 }),
        c('q6', '姓名索引，把名字组织成一棵查找树', 'D08 Q03'),
        c('q7', '沿着树找到 alice，会拿到对应的记录号', 'Q03'),
        c('q8', '这是引擎在表里定位记录用的内部编号', 'Q01 Q03'),
        c('q9', '这时还没有年龄，拿到的只是找行的线索', 'Q03 Q04', { gap: 0.8 }),
        c('q10', '引擎先记下匹配的记录号，再去读表', 'Q02 Q03'),
        c('q11', '找到对应的数据页，再按页内目录取出记录', 'D10 Q03'),
        c('q12', '确认名字符合条件，这条记录现在也允许读取', 'Q03'),
        c('q13', '最后，才把年龄 30 返回给应用', 'Q01 Q03', { tts: { zh: '最后，才把年龄三十返回给应用。' } }),
        c('q14', '所以，这次查询分了两步', 'Q01 Q03'),
        c('q15', '先用名字找线索，再沿线索去取内容', 'Q02 Q03', { gap: 1.0 }),
      ],
    },
    {
      id: 'update', chap: ['05', { zh: '把 30 改成 31' }], lead: 3.2, tail: 0.7,
      cues: [
        c('u1', '接下来，把 Alice 的年龄从 30 改成 31', 'S01 U05', { tts: { zh: '接下来，把 Alice 的年龄从三十改成三十一。' } }),
        c('u2', '改完以后，原来的 30 就能直接擦掉吗', 'U01 U05', { tts: { zh: '改完以后，原来的三十就能直接擦掉吗？' }, gap: 0.7 }),
        c('u3', '还不行，另一个正在读旧数据的连接', 'U01 M03', { tts: { zh: '还不行，另一个正在读旧数据的连接，' }, gap: 0.25 }),
        c('u4', '可能还需要看到修改前的年龄', 'U01 M03', { gap: 0.8 }),
        c('u5', 'InnoDB 为此保存 undo，也就是撤销信息', 'C07'),
        c('u6', '需要旧值时，再用这些信息重建', 'C07'),
        c('u7', 'PostgreSQL 则把新旧行版本留在表里', 'C07', { gap: 0.8 }),
        c('u8', 'Firebird 也保留历史，但从当前记录往回找', 'U05 C07'),
        c('u9', '当前记录留着线索，能找到它之前的样子', 'U05'),
        c('u10', '这样，修改的一方和读取的一方', 'M01 M03', { tts: { zh: '这样，修改的一方和读取的一方，' }, gap: 0.25 }),
        c('u11', '就不一定要看到同一个年龄', 'M01 M03', { gap: 0.8 }),
        c('u12', '比如，这次改年龄还没有提交', 'M01 M03'),
        c('u13', '修改者自己能读到 31，另一边仍能读到 30', 'M01 M03', { tts: { zh: '修改者自己能读到三十一，另一边仍能读到三十。' }, gap: 0.8 }),
        c('u14', '等到旧版本再也没有读者需要，才可以清掉', 'U01'),
        c('u15', '清理可以在访问时顺带做，也可以在后台做', 'U02'),
        c('u16', '所以，一直不结束的旧事务', 'U01', { tts: { zh: '所以，一直不结束的旧事务，' }, gap: 0.25 }),
        c('u17', '也可能让这些历史越积越多', 'U01 U05', { gap: 1.0 }),
      ],
    },
    {
      id: 'durable', chap: ['06', { zh: '写到一半，崩了怎么办' }], lead: 3.2, tail: 0.7,
      cues: [
        c('w1', '还有最后一关：修改得真正存下来', 'W01 W05'),
        c('w2', '前面的 InnoDB 和 PostgreSQL，都要记恢复日志', 'C08'),
        c('w3', '数据页没来得及写完，重启后还能按日志补上', 'C08', { gap: 0.8 }),
        c('w4', 'Firebird 的常规恢复，不靠这样一份重做日志', 'W04 C08'),
        c('w5', '它必须管好数据库文件里，各页写入的先后', 'W04 W05', { gap: 0.8 }),
        c('w6', '比如，给表新增一个数据页', 'W05 D10'),
        c('w7', '目录也得记住，新的数据页在什么地方', 'W05 D10'),
        c('w8', '如果目录写好了，数据页却还没写好', 'W05', { tts: { zh: '如果目录写好了，数据页却还没写好，' }, gap: 0.25 }),
        c('w9', '这时一崩溃，目录就可能指向不存在的内容', 'W05', { gap: 0.8 }),
        c('w10', '所以，要先写数据页，再写指向它的目录', 'W05'),
        c('w11', '这类先后关系，由引擎来管理', 'W05', { gap: 0.8 }),
        c('w12', '回到 Alice 的修改，提交时也是有顺序的', 'W05'),
        c('w13', '先把这次修改需要的页写出去', 'W05'),
        c('w14', '再把事务状态，记成已经提交', 'W03 W05'),
        c('w15', '这里开着强制写，要求这些写入真正落盘', 'W01 W05', { gap: 0.8 }),
        c('w16', '如果崩溃后重开库，普通事务还没完成提交', 'W06', { tts: { zh: '如果崩溃后重开库，普通事务还没完成提交，' }, gap: 0.25 }),
        c('w17', '就按失败处理，留下的修改不能算已提交', 'W06', { gap: 1.0 }),
      ],
    },
    {
      id: 'outro', chap: null, lead: 1.0, tail: 0.6,
      cues: [
        c('z1', '从存下 Alice，到查出年龄，再到修改', 'D10 Q01 U05'),
        c('z2', 'Firebird 的几部分就接到了一起', 'D10 Q01 U05 W05'),
        c('z3', '数据页装内容，索引把查询引过去', 'D10 Q03'),
        c('z4', '历史版本让旧数据仍然可读', 'U01 U05 M03'),
        c('z5', '页面的写入顺序，保证提交按步骤完成', 'W05', { gap: 1.0 }),
      ],
    },
    {
      id: 'next', chap: null, lead: 0.8, tail: 0.6,
      cues: [
        c('n1', '这一整套引擎，既能放在独立服务端里', 'E01 E09', { tts: { zh: '这一整套引擎，既能放在独立服务端里，' }, gap: 0.25 }),
        c('n2', '也能直接装进应用程序', 'E01 E09', { gap: 0.8 }),
        c('n4', '下一集的 SQLite，则只做嵌入式', 'C02 C03'),
        c('n5', '没有独立服务端，它又怎样把引擎做得小巧', 'C02 C03 H08', { tts: { zh: '没有独立服务端，它又怎样把引擎做得小巧？' }, gap: 1.2 }),
      ],
    },
    {
      id: 'credits', chap: null, lead: 0.4, tail: 0.2,
      cues: [['credits', null, { pause: 13, credits: true, gap: 0 }]],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/PostgreSQL/g, 'Postgres Q L'],
      [/MySQL/g, 'My S Q L'],
      [/MyISAM/g, 'My ISAM'],
      [/InnoDB/g, 'Inno D B'],
      [/undo/g, 'undo'],
      [/SQLite/g, 'S Q Lite'],
      [/SQL/g, 'S Q L'],
      [/Alice|alice/g, 'Alice'],
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
