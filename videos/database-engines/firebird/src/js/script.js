// 中文第 8 稿（2026-10-21），WaterRun 已确认（review/NOTES.md）；事实入口 research/FACTS.md。
// 制作时只调 lead：各章 3.2 → 4.0 秒，让章节卡的编号与标题读得完（F04）；不改字幕与句子。
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
        c('o1', '前三期，我们从 MySQL', 'C03 C11', { tts: { zh: '前三期，我们从 My S Q L，' }, gap: 0.25 }),
        c('o2', '一路讲到了 PostgreSQL', 'C03 C11'),
        c('o5', '这一集，接着看两个开源巨头之外', 'C11', { tts: { zh: '这一集，接着看两个开源巨头之外，' }, gap: 0.25 }),
        c('o6', '一个小众的第三选择：Firebird', 'C09 C11 S04'),
        c('o7', '它同样是一套完整的开源关系数据库', 'H09', { gap: 0.8 }),
        c('o8', '既能像 MySQL、PostgreSQL 那样', 'C01 E03', { tts: { zh: '既能像 My S Q L、Postgres Q L 那样，' }, gap: 0.25 }),
        c('o9', '作为独立服务，接受应用的连接', 'E01 E03', { gap: 0.8 }),
        c('o10', '也能把引擎直接嵌进应用程序', 'E02 E09'),
        c('o11', '由应用自己读写文件，不必另开服务', 'E09', { gap: 0.8 }),
        c('o12', '这样一套引擎，来自哪里，又是怎样实现的', 'H11 E09', { tts: { zh: '这样一套引擎，来自哪里，又是怎样实现的？' }, gap: 1.0 }),
        ['oT', null, { pause: 2, gap: 0 }],
      ],
    },
    {
      id: 'history', chap: ['01', { zh: '它从哪里来' }], lead: 4.0, tail: 0.7,
      cues: [
        c('h1', '它的源头，是八十年代的 InterBase', 'H10 H11'),
        c('h2', '这套商业数据库，后来到了 Borland 手里', 'H11'),
        c('h3', '2000 年，Borland 公开了它的源码', 'H01 H11', { tts: { zh: '二零零零年，Borland 公开了它的源码。' }, gap: 0.8 }),
        c('h4', '原先围绕 InterBase 的开发者和用户', 'H11', { tts: { zh: '原先围绕 Inter Base 的开发者和用户，' }, gap: 0.25 }),
        c('h5', '由此组织起独立的开源项目，取名 Firebird', 'H01 H11'),
        c('h6', '社区接过的，是一套已经发展多年的数据库', 'H11'),
        c('h7', '他们清理代码、修正问题，做了大量测试', 'H12'),
        c('h8', '2002 年，发布了 Firebird 的第一个正式版本', 'H02 H12', { tts: { zh: '二零零二年，发布了 Fire bird 的第一个正式版本。' }, gap: 0.8 }),
        c('h9', '此后，社区继续改写代码，重整内部架构', 'H07 H12'),
        c('h10', '到 3.0，这些运行形态的核心合到了一起', 'H05 H12', { tts: { zh: '到三点零，这些运行形态的核心合到了一起。' } }),
        c('h11', '服务端和嵌入式，共用同一份引擎', 'H05 H12'),
        c('h12', '这一集用的 5.0.4，延续的就是这套架构', 'T01 H12', { tts: { zh: '这一集用的五点零点四，延续的就是这套架构。' }, gap: 1.0 }),
      ],
    },
    {
      id: 'engine', chap: ['02', { zh: '同一套引擎，两个入口' }], lead: 4.0, tail: 0.7,
      cues: [
        c('e1', '核心引擎装在一个可加载的库里', 'E01 E09'),
        c('e2', '客户端根据连接串，选择远程或本地引擎', 'E02 E03'),
        c('e3', '远程请求交给服务端，本地则由应用加载引擎', 'E02 E09'),
        c('e4', 'SQL 执行和页读写，都在加载它的进程里完成', 'E09 H09', { gap: 0.8 }),
        c('e5', '因此停掉独立服务，嵌入式仍能操作数据库', 'E08 E09'),
        c('e6', '两个入口，使用同一套页格式和存取代码', 'E01 E09 D02'),
        c('e7', '同一份 fdb 文件，存着 Alice 这行数据', 'D10 S01', { tts: { zh: '同一份 f d b 文件，存着 Alice 这航数据。' }, gap: 1.0 }),
      ],
    },
    {
      id: 'store', chap: ['03', { zh: '页、槽和记录头' }], lead: 4.0, tail: 0.7,
      cues: [
        c('d1', '库文件按页组织，这个库每页 8192 字节', 'D01 D10', { tts: { zh: '库文件按页组织，这个库每页八千一百九十二字节。' } }),
        c('d2', '页头第一个字节，标明这页的用途', 'D04 D05'),
        c('d3', '数据页里，一端是槽目录，另一端放记录', 'D11'),
        c('d4', '一个槽四字节，保存页内偏移和记录长度', 'D11'),
        c('d4a', '偏移和长度各占两字节，槽号就是这组数据的编号', 'D11'),
        c('d5', '第 231 页的 0 号槽，指向 Alice', 'D11', { tts: { zh: '第二百三十一页的零号槽，指向 Alice。' }, gap: 0.8 }),
        c('d6', '记录在页内搬动时，槽里的偏移跟着改', 'D11 U06'),
        c('d7', '表的指针页，另外保存各个数据页的页号', 'D10 D11'),
        c('d8', '定位一行，要先找到页，再按槽取记录', 'D10 Q05', { gap: 0.8 }),
        c('d9', '记录自身也有头，带着事务号和回溯位置', 'D11 U06'),
        c('d10', '名字、年龄这些列值，才是头后面的内容', 'D11 S01'),
        c('d11', 'InnoDB 的整行放在主键索引的叶子里', 'C06'),
        c('d12', 'Firebird 和 PostgreSQL 一样，行与索引分开', 'C06', { gap: 1.0 }),
      ],
    },
    {
      id: 'query', chap: ['04', { zh: '从姓名索引取出记录' }], lead: 4.0, tail: 0.7,
      cues: [
        c('q1', '按名字查 Alice 的年龄，计划使用姓名索引', 'Q01'),
        c('q2', '姓名索引是一棵 B 树，查找从树根开始', 'D08 Q03'),
        c('q3', '叶子里保存姓名和记录号，年龄还在数据页', 'Q03 Q04'),
        c('q4', '本例选择位图扫描，先收集匹配的记录号', 'Q01 Q02'),
        c('q5', '位图标出哪些记录需要取，再按编号访问表', 'Q02 Q05', { gap: 0.8 }),
        c('q6', '记录号分解出数据页序号和页内槽号', 'Q05'),
        c('q6a', '它是引擎内部的位置编号，和用户表的 id 无关', 'Q01 Q05', { tts: { zh: '它是引擎内部的位置编号，和用户表的 I D 无关。' } }),
        c('q7', '指针页把页序号，换成实际的数据页号', 'Q05 D11'),
        c('q7a', '页号映射已经缓存时，可以省掉这次指针页查找', 'Q06'),
        c('q7b', '数据页也在缓存里时，直接访问内存中的页面', 'Q06'),
        c('q8', '再读取槽里的偏移，定位记录头', 'Q05 D11'),
        c('q9', '读取当前版本，用事务状态和快照判断可见性', 'M03 Q03'),
        c('q10', '可见版本通过名字检查，才返回年龄 30', 'Q01 Q03', { tts: { zh: '可见版本通过名字检查，才返回年龄三十。' }, gap: 0.8 }),
        c('q11', '按同样的姓名条件，InnoDB 先取得主键', 'C06'),
        c('q12', '再沿主键索引取整行，Firebird 用记录号定位', 'C06 Q05', { gap: 1.0 }),
      ],
    },
    {
      id: 'update', chap: ['05', { zh: '更新记录，保存回溯版本' }], lead: 4.0, tail: 0.7,
      cues: [
        c('u1', '把年龄改成 31，先把当前记录读进来', 'U05 U06', { tts: { zh: '把年龄改成三十一，先把当前记录读进来。' } }),
        c('u2', '需要保留的旧内容，先另存为回溯版本', 'U05'),
        c('u3', '主记录再写入新值，记上这次修改的事务号', 'U05 U06'),
        c('u3a', '本例记录头的事务号，从 2 变成 11', 'U06', { tts: { zh: '本例记录头的事务号，从二变成十一。' } }),
        c('u4', '回溯页号和槽号，把它连到旧版本', 'U05 U06', { gap: 0.8 }),
        c('u5', '这次更新后，0 号槽仍是当前记录入口', 'U06', { tts: { zh: '这次更新后，零号槽仍是当前记录入口。' } }),
        c('u6', '它指向页内的新位置，历史版本放在 8 号槽', 'U06', { tts: { zh: '它指向页内的新位置，历史版本放在八号槽。' } }),
        c('u7', '索引里的逻辑记录号，不必随页内搬动而改变', 'Q05 U06'),
        c('u8', '本例的历史版本，保存的还是一份差量', 'U07'),
        c('u8a', '保存差量还是整份旧内容，要比较两者的长度', 'U05 U07'),
        c('u8b', '差量跳过没变的字节，只补回修改前的内容', 'U07'),
        c('u9', '把差量应用到当前记录，就能还原修改前的内容', 'U07'),
        c('u10', '还原结果，与更新前的记录逐字节一致', 'U07', { gap: 0.8 }),
        c('u11', '这和 InnoDB 的 undo 用途相近', 'C07'),
        c('u12', 'PostgreSQL 则在堆里保存独立的行版本', 'C07'),
        c('u13', '读取从当前版本开始，判断它是否可见', 'M03'),
        c('u14', '不可见，就沿回溯指针继续找', 'M03'),
        c('u15', '旧版本无人需要后，回收链上的空间', 'U01'),
        c('u16', '长事务会拖住这一步，让版本链越积越长', 'U01 U05', { gap: 1.0 }),
      ],
    },
    {
      id: 'durable', chap: ['06', { zh: '页面依赖和提交状态' }], lead: 4.0, tail: 0.7,
      cues: [
        c('w1', '提交之前，这些改动还要按顺序写盘', 'W05'),
        c('w1a', '修改先发生在页缓存，脏页随后写回数据库文件', 'Q06 W05'),
        c('w2', 'InnoDB 和 PostgreSQL，在崩溃后重放日志', 'C08'),
        c('w3', 'Firebird 的常规恢复，依靠页面依赖和事务状态', 'W04 W05 W06'),
        c('w4', '分配数据页时，先写新页，再写指向它的指针页', 'W05'),
        c('w5', '指针落盘之前，它指向的内容就已经写好', 'W05', { gap: 0.8 }),
        c('w6', '提交时，先刷新这笔事务修改的页面', 'W05'),
        c('w7', '然后更新事务清单页，记录已经提交', 'W03 W05'),
        c('w7a', '否则崩溃后，可能留下已提交却缺少内容的事务', 'W05'),
        c('w8', '清单页用两位，表示一个事务的状态', 'W07'),
        c('w9', '本例修改事务的状态，提交后是二进制 11', 'W07', { tts: { zh: '本例修改事务的状态，提交后是二进制一一。' } }),
        c('w9a', '读取时，把记录头的事务号与这张清单对应起来', 'W03 W07 M03'),
        c('w10', '这里开启强制写，要求写入完成物理落盘', 'W01 W05', { gap: 0.8 }),
        c('w11', '崩溃后重开库，遗留的普通活动事务标为失败', 'W06'),
        c('w12', '读到失败版本，沿回溯链找可见的历史记录', 'W06 M03', { gap: 1.0 }),
      ],
    },
    {
      id: 'outro', chap: null, lead: 1.0, tail: 0.6,
      cues: [
        c('z1', '页和槽确定位置，索引返回逻辑记录号', 'D11 Q05'),
        c('z2', '记录头连接历史版本，事务状态决定可见性', 'U06 M03'),
        c('z3', '写盘按页面依赖排序，最后确认提交', 'W05'),
      ],
    },
    {
      id: 'next', chap: null, lead: 0.8, tail: 0.6,
      cues: [
        c('n1', '这一整套引擎，既能放在独立服务端里', 'E01 E09', { tts: { zh: '这一整套引擎，既能放在独立服务端里，' }, gap: 0.25 }),
        c('n2', '也能直接装进应用程序', 'E01 E09', { gap: 0.8 }),
        c('n4', '下一集的 SQLite，则只做嵌入式', 'C02 C03'),
        c('n5', '它又怎样把引擎做得小巧，同时又强大呢', 'C02 C03 H08', { tts: { zh: '它又怎样把引擎做得小巧，同时又强大呢？' }, gap: 1.2 }),
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
      [/(?<![执进运银串])行/g, '航'],      // 数据的「行」读 háng；执行、运行等不换（ASR 回听 u12 听成「型版本」）
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
