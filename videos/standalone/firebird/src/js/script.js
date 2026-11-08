// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 多语言时字幕写成 { zh: '…', en: '…' }；只有一种语言时直接写字符串。tts、gap、章节标题同理
// - 字幕里 *词* 标出术语（字幕上显示为强调），只为加重语气的词不标；术语第一次出现的那句说完时，画面上要有 data-gloss="词" 的注解（scan.js 的 GLOSS）
// - tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿（标题、转场）
// - 片尾署名只上画面：['credits', null, { pause: 8, credits: true }]；不写入旁白正文，不设置 tts。名单由 scenes/s9_credits.js 从 project.json 读取。
// - 每章一个 scene：chap [编号, 标题]（null 表示没有章节卡）、lead 章节卡时长、tail 章末留白
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。浏览器与 Node 共用本文件（工具读它排时间线）。
// 翻译以中文为底本：先定中文，再译其他语言；各语言的句号一一对应，时间轴各自排布。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const RAW = [
    {
      id: 'open', chap: null, lead: 0.8, tail: 0.5,
      cues: [
        ['o1', '火狐浏览器，你多半用过。', { gap: 0.25 }],
        ['o2', '可在二〇〇三年，它叫 Firebird，火鸟。', { gap: 0.3 }],
        ['o3', '这个名字只用了十个月，因为它早就有主了。', { gap: 0.3 }],
        ['o4', '主人是一个数据库。', { gap: 0.7 }],
        ['o5', 'MySQL、PostgreSQL、SQLite，这些你都熟。', { gap: 0.25 }],
        ['o6', '可这个让火狐改了名的 Firebird，你大概率没听说过。', { gap: 0.5 }],
        ['o7', '它的故事，得从一间浴室说起。', { gap: 0.3 }],
      ],
    },
    {
      id: 'shower', chap: ['1', '一间浴室'], lead: 1.3, tail: 0.5,
      cues: [
        ['a1', '八十年代初，DEC 的程序员吉姆·斯塔基，', { gap: 0.1 }],
        ['a2', '一天早上洗澡时想通了一件事。', { gap: 0.4 }],
        ['a3', '改一条记录，别把旧的盖掉，留下几个版本。', { gap: 0.2 }],
        ['a4', '读的人看旧的，写的人写新的，读的不用等写的。', { gap: 0.3 }],
        ['a5', '同样的思路，今天在 PostgreSQL 里也能见到。', { gap: 0.5 }],
        ['a6', '一九八四年，他和两个伙伴出来开公司，', { gap: 0.1 }],
        ['a7', '办公室就是他家二楼的客房。', { gap: 0.4 }],
        ['a8', '启动资金二百四十三块五美元。', { gap: 0.15 }],
        ['a9', '一把椅子，两个文件柜，架上一扇门，就是办公桌。', { gap: 0.3 }],
        ['a10', '猫睡在电脑上，维修工每周上门吸一次猫毛。', { gap: 0.3 }],
        ['a12', '公司起名，别的都过不了商标检索，', { gap: 0.1 }],
        ['a12b', '只好用小镇的名字 Groton。', { gap: 0.15 }],
        ['a13', '接电话的人念成 Rotten，烂数据库公司，', { gap: 0.1 }],
        ['a13b', '这才改叫 InterBase。', { gap: 0.5 }],
        ['a14', '他们要做一个不碍事的数据库，好装，几乎不用管，', { gap: 0.1 }],
        ['a15', '还能直接放进应用程序里。', { gap: 0.5 }],
        ['a16', '它还有个流传很广的梗。', { gap: 0.2 }],
        ['a17', '说美军 M1 坦克一开炮，电涌就把车载电脑搞崩，', { gap: 0.1 }],
        ['a18', '重启之后，InterBase 接着干活。', { gap: 0.3 }],
        ['a19', '真假没有证据，老用户自己都管这叫传说。', { gap: 0.5 }],
      ],
    },
    {
      id: 'xmas', chap: ['2', '圣诞节前'], lead: 1.3, tail: 0.5,
      cues: [
        ['b1', '一九九一年，InterBase 随一笔收购归了 Borland。', { gap: 0.4 }],
        ['b2', '一九九九年圣诞节前，管理层说这条线赚得不够，', { gap: 0.1 }],
        ['b3', '至少裁一半的人，第六版的开发也停了。', { gap: 0.3 }],
        ['b4', '用户急了，组织起来要把它买下来，', { gap: 0.1 }],
        ['b5', '肯掏的钱够买好几回。', { gap: 0.4 }],
        ['b6', '二〇〇〇年一月，公司宣布开源，', { gap: 0.1 }],
        ['b6b', '还打算把这块业务拆出去。', { gap: 0.2 }],
        ['b7', '谈了半年，这笔拆分谈崩了。', { gap: 0.4 }],
        ['b8', '七月二十五号，同一天两份新闻稿。', { gap: 0.2 }],
        ['b9', '一份说，这条产品线不卖了。', { gap: 0.2 }],
        ['b10', '另一份说，源码放出来了。', { gap: 0.3 }],
      ],
    },
    {
      id: 'fork', chap: ['3', '六天'], lead: 1.1, tail: 0.4,
      cues: [
        ['c1', '代码有了，公司那边还在扯皮，社区不想等。', { gap: 0.2 }],
        ['c2', '二十四小时搭好源码树，', { gap: 0.1 }],
        ['c2b', '两个澳大利亚程序员把项目开上 SourceForge。', { gap: 0.25 }],
        ['c3', '七月三十一号，开源第六天，它有了名字。', { gap: 0.2 }],
        ['c4', 'Firebird，传说里烧完还能重生的火鸟。', { gap: 0.4 }],
      ],
    },
    {
      id: 'door', chap: ['4', '一个账号'], lead: 1.1, tail: 0.5,
      cues: [
        ['d1', '半年后，一个德国程序员在代码里翻出一个账号。', { gap: 0.4 }],
        ['d2', '用户名，politically。', { gap: 0.3 }],
        ['d3', '密码，correct。', { gap: 0.5 }],
        ['d4', '政治正确。只要连得上服务器，', { gap: 0.1 }],
        ['d5', '谁知道这两个词，谁就能进。', { gap: 0.25 }],
        ['d6', '过去七年发布的版本，全带着它。', { gap: 0.25 }],
        ['d7', '闭源的时候没人看得见，源码一公开，就被翻出来了。', { gap: 0.4 }],
      ],
    },
    {
      id: 'name', chap: ['5', '一个名字'], lead: 1.1, tail: 0.5,
      cues: [
        ['e1', '然后就是开头那件事。', { gap: 0.2 }],
        ['e2', '二〇〇三年，Mozilla 的浏览器撞了商标要换名字，', { gap: 0.1 }],
        ['e3', '选中了 Firebird。', { gap: 0.3 }],
        ['e4', '赞助 Firebird 的公司哭穷，说这官司打不起，', { gap: 0.1 }],
        ['e5', '就发动大家，一封一封给 Mozilla 写信。', { gap: 0.4 }],
        ['e6', '二〇〇四年二月，浏览器改名 Firefox。', { gap: 0.2 }],
        ['e7', 'Mozilla 说，是想回应同行的关切。', { gap: 0.5 }],
      ],
    },
    {
      id: 'today', chap: ['6', '两边都站'], lead: 1.2, tail: 0.5,
      cues: [
        ['f2', '选数据库，通常先选边。', { gap: 0.2 }],
        ['f3', '要多人同时连，就跑服务，MySQL、PostgreSQL 都这样。', { gap: 0.2 }],
        ['f4', '要省事，一个文件放进程序里，那是 SQLite。', { gap: 0.3 }],
        ['f5', 'Firebird 两边都站。', { gap: 0.5 }],
        ['f6', '我们拿 5.0.4 试了一下。不开任何服务，', { gap: 0.1 }],
        ['f7', '一个命令行工具，建库，建表，写进一行。', { gap: 0.2 }],
        ['f8', '引擎就在程序里，这叫嵌入式。', { gap: 0.4 }],
        ['f9', '接着启动服务，同一个文件，从网络连上去，', { gap: 0.1 }],
        ['f10', '读出来还是这一行。', { gap: 0.3 }],
        ['f11', '再把服务关掉，文件不用转换，照样能打开。', { gap: 0.4 }],
        ['f12', '能放进程序里，一九八四年他们就想要这个。', { gap: 0.5 }],
        ['f13', '存储过程、触发器这些都有，', { gap: 0.1 }],
        ['f13b', 'Windows、Linux、macOS 都能跑，', { gap: 0.1 }],
        ['f14', '下载不要钱，打包进商业软件卖，也不要钱。', { gap: 0.4 }],
      ],
    },
    {
      id: 'end', chap: null, lead: 0.5, tail: 0.5,
      cues: [
        ['g1', '当然，它是真小众。', { gap: 0.25 }],
        ['g1b', 'DB-Engines 的关系库榜上，MySQL 第二，', { gap: 0.1 }],
        ['g2', 'Firebird 第二十，流行度差了四十多倍。', { gap: 0.3 }],
        ['g3', '背后也没有哪家大公司，靠用它的人出钱出力。', { gap: 0.2 }],
        ['g4', '二〇二四年发了第五版，第六版的路线图也公布了。', { gap: 0.5 }],
        ['g5', '公司放手以后，是用它的人把它接住的。', { gap: 0.5 }],
        ['g6', 'MySQL、PostgreSQL、SQLite 之外，', { gap: 0.1 }],
        ['g6b', '还有这么一个选择。', { gap: 0.3 }],
        ['g7', '下回打开火狐，你就知道它以前那个名字是谁的了。', { gap: 0.6 }],
      ],
    },
    {
      id: 'credits', chap: null, lead: 0.3, tail: 0.3,
      cues: [
        ['credits', null, { pause: 5, credits: true }],
      ],
    },
  ];

  const SAY = {
    zh: [
      [/PostgreSQL/g, 'Postgre S Q L'],
      [/SQLite/g, 'S Q Lite'],
      [/MySQL/g, 'My S Q L'],
      [/InterBase/g, 'Inter Base'],
      [/SourceForge/g, 'Source Forge'],
      [/DB-Engines/g, 'D B Engines'],
      [/macOS/g, 'mac O S'],
      [/DEC/g, 'D E C'],
      [/M1/g, 'M 一'],
      [/5\.0\.4/g, '五点零点四'],
      [/命令行/g, '命令航'], [/同行/g, '同航'], [/写进一行/g, '写进一航'], [/这一行/g, '这一航'],
      [/二〇〇〇/g, '二零零零'], [/二〇〇三/g, '二零零三'], [/二〇〇四/g, '二零零四'], [/二〇二四/g, '二零二四'],
    ],
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
