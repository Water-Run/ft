// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 多语言时字幕写成 { zh: '…', en: '…' }；只有一种语言时直接写字符串。tts、gap、章节标题同理
// - 字幕里 *词* 表示强调；tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
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
      id: 'open', chap: null, lead: 1.0, tail: 0.6,
      cues: [
        ['o1', '4096 个人，住在同一个文件里', { gap: 0.5 }],
        ['o2', '其中一个叫 Alice，42 岁', { gap: 0.8 }],
        ['o3', '要在四千多人里找到她', { gap: 0.25 }],
        ['o3b', 'MySQL 只读了 3 块索引，和 56 个字节', { gap: 0.6 }],
        ['o4', '一行结果，转眼就回来了', { gap: 0.8 }],
        ['o5', '这一瞬间，磁盘上发生了什么？', { gap: 0.6 }],
        ['o6', '回答这个问题的部件，叫*存储引擎*', { gap: 0.9 }],
        ['o7', '要看清一个引擎是怎样造出来的，*MyISAM* 是很好的起点', { gap: 0.3 }],
        ['o8', '它简单到每一个字节，都可以摊开来看', { gap: 0.6 }],
        ['oT', null, { pause: 3.0 }],
      ],
    },
    // <chapters>
    {
      id: 'layers', chap: ['01', '引擎的位置'], lead: 2.4, tail: 0.8,
      cues: [
        ['a1', 'MySQL 的内部分成两层', { gap: 0.4 }],
        ['a2', '上层读懂 SQL：解析语句，选定执行计划', { gap: 0.3 }],
        ['a3', '下层把数据写进磁盘，再读出来', { gap: 0.25 }],
        ['a4', '这一层，就是存储引擎', { gap: 0.6 }],
        ['a5', '两层之间是一组固定的接口', { gap: 0.25 }],
        ['a6', '写入一行，读下一行，按索引查找', { gap: 0.4 }],
        ['a7', '只要实现这组接口，引擎就可以替换', { gap: 0.8 }],
        ['a8', '本片用的 MySQL 9.7.4 里，就并排放着好几种引擎', { gap: 0.3 }],
        ['a9', '默认的 InnoDB 支持事务，MyISAM 不支持', { gap: 0.4 }],
        ['a10', 'MySQL 5.5 以前，默认的就是 MyISAM', { gap: 0.3 }],
        ['a11', '它的结构足够简单', { gap: 0.6 }],
      ],
    },
    {
      id: 'files', chap: ['02', '一张表，三个文件'], lead: 2.4, tail: 0.8,
      cues: [
        ['b1', '用 MyISAM 建一张 users 表，住进 4096 个用户', { gap: 0.5 }],
        ['b2', '数据目录里，多出了三个同名的文件', { gap: 0.5 }],
        ['b3', '.sdi 记着表的结构：有哪些列，各是什么类型', { gap: 0.25 }],
        ['b4', '表结构登记在 MySQL 的数据字典里，这是它的一份副本', { gap: 0.5 }],
        ['b5', '.MYD 放数据，每个人一行', { gap: 0.3 }],
        ['b6', '.MYI 放索引', { gap: 0.6 }],
        ['b7', '后两个文件，就是 MyISAM 的全部', { gap: 0.3 }],
        ['b8', '造一个引擎，说到底，是给这些文件定下读写的规矩', { gap: 0.6 }],
      ],
    },
    {
      id: 'fixed', chap: ['03', '数据文件：定长行'], lead: 2.4, tail: 0.8,
      cues: [
        ['c1', '先打开数据文件', { gap: 0.3 }],
        ['c2', '它没有文件头，第一个字节就是数据', { gap: 0.5 }],
        ['c3', '每 56 个字节，是一个人', { gap: 0.5 }],
        ['c4', '第一个字节是标志，表示这一行有效', { gap: 0.25 }],
        ['c5', '接着 4 个字节是 id，低位在前', { gap: 0.25 }],
        ['c6', '50 个字节是名字，不够就用空格补齐', { gap: 0.25 }],
        ['c7', '最后 1 个字节，是年龄', { gap: 0.6 }],
        ['c8', '每一行都一样长，这叫*定长格式*', { gap: 0.4 }],
        ['c9', '找位置不用找：第 n 行，就从 n 乘以 56 开始', { gap: 0.6 }],
        ['c10', 'Alice 的行号是 2049，乘以 56，就是第 114744 个字节', { gap: 0.8 }],
        ['c11', '她过生日了，年龄从 42 改成 43', { gap: 0.3 }],
        ['c12', '引擎回到同一个位置，只改写了最后一个字节', { gap: 0.7 }],
      ],
    },
    {
      id: 'holes', chap: ['04', '删除与空位'], lead: 2.4, tail: 0.8,
      cues: [
        ['d1', '有人注销了账号：2 号用户', { gap: 0.4 }],
        ['d2', '文件没有变小，引擎只改写了这一行开头的 7 个字节', { gap: 0.3 }],
        ['d3', '第一个字节写成 0：这里已经没有人了', { gap: 0.25 }],
        ['d4', '后面 6 个字节，记着下一个空位在哪', { gap: 0.6 }],
        ['d5', '5 号也注销了。新的空位，指回 2 号留下的那一个', { gap: 0.3 }],
        ['d6', '空位连成一条链，链头记在索引文件里', { gap: 0.8 }],
        ['d7', 'Dave 来注册。引擎先看链头，让他住进 5 号的位置', { gap: 0.4 }],
        ['d8', '下一个新用户，住进 2 号的位置', { gap: 0.25 }],
        ['d9', '再下一个，没有空位了，才排到文件末尾', { gap: 0.6 }],
        ['d10', '所以，文件里的先后，并不是注册的先后', { gap: 0.7 }],
      ],
    },
    {
      id: 'dynamic', chap: ['05', '变长行与碎片'], lead: 2.4, tail: 0.8,
      cues: [
        ['e1', '留言有长有短', { gap: 0.25 }],
        ['e2', '表里一旦有 VARCHAR 这样的变长列，行就不再一样长', { gap: 0.4 }],
        ['e3', '这时用*动态格式*：每一行是一块，块头写着它有多长', { gap: 0.6 }],
        ['e4', 'Alice、Bob、Carol 各留了一句话，三块首尾相接', { gap: 0.6 }],
        ['e5', '后来，Alice 把留言改长了', { gap: 0.3 }],
        ['e6', '原来那一块，放不下了', { gap: 0.5 }],
        ['e7', '引擎把放不下的部分写到文件末尾，在原处留下它的地址', { gap: 0.4 }],
        ['e8', '一行，就这样断成了两段', { gap: 0.7 }],
        ['e9', '一行分成几段，读它就要跟着地址跳几次', { gap: 0.4 }],
        ['e10', '要重新拼好，得用 OPTIMIZE TABLE', { gap: 0.25 }],
        ['e10b', '把整个数据文件重写一遍', { gap: 0.7 }],
      ],
    },
    {
      id: 'btree', chap: ['06', '索引文件与 B 树'], lead: 2.4, tail: 0.8,
      cues: [
        ['f1', '只有数据文件时，要找 Alice，只能从头一行一行比过去', { gap: 0.4 }],
        ['f2', '索引文件，就是为了不这样做', { gap: 0.6 }],
        ['f3', '它的开头是文件头：一共多少行，空位链从哪开始', { gap: 0.25 }],
        ['f3b', '每个索引的根在哪一块', { gap: 0.4 }],
        ['f4', '后面的空间，按 1024 字节切成一块一块', { gap: 0.3 }],
        ['f5', '每一块里是排好序的索引项：一个名字，加上这一行的行号', { gap: 0.8 }],
        ['f6', '从空表开始，一个一个住进来', { gap: 0.3 }],
        ['f7', '前 20 个名字，一块就装下了', { gap: 0.4 }],
        ['f8', '第 21 个来时，这一块装不下了', { gap: 0.25 }],
        ['f8b', '分成两块，上面长出新的一层', { gap: 0.4 }],
        ['f9', '新的根里只放了一个名字；左边 19 个，右边 1 个', { gap: 0.6 }],
        ['f10', '这就是 *B 树*：每一块都排好了序', { gap: 0.25 }],
        ['f10b', '上一层告诉你，往下该走哪一块', { gap: 0.8 }],
        ['f11', '住满 4096 人，姓名索引长成了三层', { gap: 0.3 }],
        ['f12', '一个根，12 块中间层，205 块叶子', { gap: 0.4 }],
        ['f13', '中间层里的每一项，也是一个真实的人', { gap: 0.4 }],
        ['f14', '索引里存的不是那一行，只是它的行号', { gap: 0.6 }],
      ],
    },
    {
      id: 'query', chap: ['07', '一次查询的全过程'], lead: 2.4, tail: 0.8,
      cues: [
        ['g1', '现在，把这些连起来：按名字，找 Alice', { gap: 0.4 }],
        ['g2', '上层调用引擎的接口：按索引查找', { gap: 0.3 }],
        ['g3', '引擎从文件头找到根，读入第 260 块', { gap: 0.3 }],
        ['g4', 'A 排在所有名字前面，走最左边：第 62 块，再到第 43 块', { gap: 0.3 }],
        ['g4b', '4096 个名字，过了根只剩 360 个，再下一层只剩 20 个', { gap: 0.5 }],
        ['g5', '叶子里的第一项就是 Alice，旁边记着行号 2049', { gap: 0.4 }],
        ['g6', '行号乘以 56，到数据文件读出 56 个字节，交还上层', { gap: 0.9 }],
        ['g7', '第一次查询，从磁盘读入了 3 块索引', { gap: 0.3 }],
        ['g8', '再查一次，这 3 块都留在内存的*键缓存*里，一块也不用读', { gap: 0.4 }],
        ['g9', '数据那一行，却还要再读一次', { gap: 0.25 }],
        ['g10', 'MyISAM 只缓存索引，数据交给操作系统', { gap: 0.6 }],
        ['g11', '如果不用索引，就要把 4096 行一行一行读完', { gap: 0.7 }],
      ],
    },
    {
      id: 'locks', chap: ['08', '并发：表锁'], lead: 2.4, tail: 0.8,
      cues: [
        ['k1', '许多人同时用这张表', { gap: 0.25 }],
        ['k1b', 'MyISAM 的办法很直接：给整张表上锁', { gap: 0.6 }],
        ['k2', 'Bob 正在翻看整张表', { gap: 0.3 }],
        ['k3', 'Alice 想改年龄，Carol 也想改，都只能等 Bob 看完', { gap: 0.5 }],
        ['k4', '反过来，Alice 改的时候，Bob 和 Dave 也得等她', { gap: 0.8 }],
        ['k5', '只有一个例外', { gap: 0.3 }],
        ['k6', '文件中间没有空位时，新行只会写在末尾', { gap: 0.25 }],
        ['k7', 'Bob 读着，新用户照样能在末尾注册，这叫*并发插入*', { gap: 0.5 }],
        ['k8', '可一旦有人注销、文件里留下空位，新来的人也得排队', { gap: 0.8 }],
        ['k9', '读多写少时，一把表锁很省事', { gap: 0.25 }],
        ['k10', '写的人一多，整张表就成了一道窄门', { gap: 0.7 }],
      ],
    },
    {
      id: 'nolog', chap: ['09', '没有事务的代价'], lead: 2.4, tail: 0.8,
      cues: [
        ['m1', 'MyISAM 没有事务', { gap: 0.3 }],
        ['m2', 'Alice 开始一个事务，改了年龄，又说要回滚', { gap: 0.4 }],
        ['m3', 'MySQL 只回了一句警告：有些表不支持事务，没法回滚', { gap: 0.25 }],
        ['m4', '改过的年龄，留了下来', { gap: 0.5 }],
        ['m5', '同样几句话，换成 InnoDB 的表，年龄就回到了原样', { gap: 0.9 }],
        ['m6', '再看出错的时候', { gap: 0.25 }],
        ['m7', '管理员要给每个人的年龄加一', { gap: 0.3 }],
        ['m8', '改到一半，服务进程被强行结束', { gap: 0.7 }],
        ['m9', '重新启动：前 155 个人老了一岁', { gap: 0.25 }],
        ['m9b', '后面 3940 个人，还是原样', { gap: 0.6 }],
        ['m10', '没有什么把它补齐，也没有什么把它撤回', { gap: 0.6 }],
        ['m11', '文件头里有个计数：开始修改时加一，正常关闭时减一', { gap: 0.25 }],
        ['m12', '它停在了 1：上次没有正常结束', { gap: 0.4 }],
        ['m13', 'CHECK TABLE 报告：年龄索引和数据对不上，表已损坏', { gap: 0.4 }],
        ['m14', 'REPAIR TABLE 能把表修好，却修不回那改了一半的数据', { gap: 0.8 }],
      ],
    },
    {
      id: 'outro', chap: ['10', '回到开头'], lead: 2.4, tail: 0.6,
      cues: [
        ['n1', '回头看，MyISAM 用最少的东西', { gap: 0.25 }],
        ['n1b', '回答了一个引擎必须回答的问题', { gap: 0.6 }],
        ['n2', '数据怎么放：一个文件，一行挨着一行', { gap: 0.3 }],
        ['n3', '怎么找：B 树给出行号，一次乘法找到位置', { gap: 0.3 }],
        ['n4', '怎么改，怎么删：原地覆盖，打上标记，空位留给后来的人', { gap: 0.3 }],
        ['n5', '怎么并发：一把表锁', { gap: 0.3 }],
        ['n6', '出错怎么办：检查，然后修复', { gap: 1.0 }],
        ['n7', 'MySQL 5.5 起，默认引擎换成了 InnoDB', { gap: 0.4 }],
        ['n8', '那一句没能撤回的回滚，在它那里，能撤回', { gap: 0.5 }],
        ['n9', '它在同样的问题上，给出了复杂得多的答案', { gap: 0.4 }],
        ['n10', '而要读懂那些答案，可以从这三个文件开始', { gap: 1.2 }],
        ['nT', null, { pause: 2.0 }],
      ],
    },
    // </chapters>
    {
      id: 'credits', chap: null, lead: 0.4, tail: 0.6,
      cues: [
        ['credits', null, { pause: 8, credits: true }],   // 片尾名单：只上画面，不配旁白；名单取自 project.json 的 credits
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/MyISAM/g, 'My ISAM'],
      [/InnoDB/g, 'Inno DB'],
      [/MySQL 9\.7\.4/g, 'My S Q L 九点七点四'],
      [/MySQL 5\.5/g, 'My S Q L 五点五'],
      [/MySQL/g, 'My S Q L'],
      [/SQL/g, 'S Q L'],
      [/\.MYD/g, 'M Y D'],
      [/\.MYI/g, 'M Y I'],
      [/\.sdi/g, 'S D I'],
      [/VARCHAR/g, 'var char'],
      [/OPTIMIZE TABLE/g, 'optimize table'],
      [/CHECK TABLE/g, 'check table'],
      [/REPAIR TABLE/g, 'repair table'],
      [/users/g, 'users'],
      [/\bid\b/g, 'I D'],
      [/n 乘以 56/g, 'N 乘以五十六'],
      [/第 n 行/g, '第 N 航'],
      // 数据「行」读 háng：只按具体词替换，「执行」「进行」不动
      [/行号/g, '航号'], [/(一|每|这|那|两|几)行/g, '$1航'], [/(\d+) 行/g, '$1 航'], [/变长行/g, '变长航'], [/定长行/g, '定长航'], [/新行/g, '新航'], [/，行就/g, '，航就'], [/多少行/g, '多少航'],
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
