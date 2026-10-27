// 重做版中文第 1 稿（2026-10-27；按 WaterRun「应该比InnoDB短一点」压缩）。事实入口 research/FACTS.md；每句的 facts 记依据编号，只作核对用，不进字幕。
// 未经 WaterRun 确认，不配音、不铺开场景。旧版成片的文案在 Git 历史里（2026-10-19 发布的版本）。
// 旁白脚本：每个 cue = [句号, 字幕, {facts, tts, gap, pause}]；*词* 标出术语，第一次出现时画面要有注解。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);
  const c = (id, text, facts, o = {}) => [id, text, { facts: facts ? facts.split(' ') : [], gap: 0.4, ...o }];

  const RAW = [
    {
      id: 'open', chap: null, lead: 0.8, tail: 0.5,
      cues: [
        c('o1', '每年，Stack Overflow 都请开发者勾选', 'S1'),
        c('o2', '自己用过的数据库', 'S1', { gap: 0.7 }),
        c('o3', '2022 年，勾选 MySQL 的最多，约 47%', 'S1'),
        c('o4', 'PostgreSQL 紧随其后，约 44%', 'S1', { gap: 0.6 }),
        c('o5', '第二年，PostgreSQL 反超，之后差距一年比一年大', 'S2 S6'),
        c('o7', '到 2026 年，PostgreSQL 约 58%，MySQL 约 35%', 'S5', { gap: 1.4 }),
        c('o9', '同样是关系数据库，同样支持事务', 'H7 X1'),
        c('o10', '把 InnoDB 测过的那张用户表交给它', '取证环境'),
        c('o11', '4096 个用户里，把 2050 号 Alice 的年龄从 42 改成 43', '取证环境 U1', { gap: 0.7 }),
        c('o13', 'InnoDB 在原位改掉这一行，旧值放进 undo', 'U9'),
        c('o14', 'PostgreSQL 不覆盖这一行，另写了一行', 'U1'),
        c('o15', '表里，多出了一个版本', 'U1', { gap: 1.2 }),
        c('o16', '这一集，看 PostgreSQL 的这一种做法', null, { gap: 0.6 }),
        ['oT', null, { pause: 2.5 }],
      ],
    },
    {
      id: 'history', chap: ['01', '学院出身'], lead: 2.8, tail: 0.7,
      cues: [
        c('h1', '1986 年，伯克利开始实现一个研究系统', 'H1'),
        c('h2', '领头的，是做过关系数据库 Ingres 的斯通布雷克教授', 'H1 H2'),
        c('h4', '新系统取名 POSTGRES，意思是 Ingres 之后', 'H2', { gap: 0.8 }),
        c('h6', '1994 年，Andrew Yu 和 Jolly Chen 给它加上 SQL', 'H4'),
        c('h7', '改名 Postgres95，作为开源软件发布', 'H4'),
        c('h8', '1996 年定名 PostgreSQL，今天的大版本是 18', 'H5 环境与版本'),
        c('h10', '2014 年度的图灵奖，授给了斯通布雷克', 'H6', { gap: 1.0 }),
        c('h12', 'SQL:2023 的核心有 177 项必选特性，它至少符合 170 项', 'H7'),
        c('h15', '还没有哪个数据库，声称全部符合', 'H7', { gap: 0.6 }),
        c('h16', '建表、加列也能放进事务，回滚就全部撤销', 'H8'),
        c('h18', '约束由数据库自己把关，不合规矩的数据进不来', 'H9', { gap: 1.2 }),
      ],
    },
    {
      id: 'layout', chap: ['02', '一张表放在哪'], lead: 2.8, tail: 0.7,
      cues: [
        c('l2', '在 PostgreSQL 里，这张表是磁盘上的一个文件', 'T1'),
        c('l3', '文件分成一页一页，每页 8 KB', 'T2'),
        c('l5', '行按到达的顺序往里放，一页 88 行，一共 47 页', 'T2 G1'),
        c('l6', '这样的文件，叫作*堆*：不排序，谁先来谁在前', 'T2 T7', { gap: 0.8 }),
        c('l8', 'Alice 是第 2050 个注册的，落在第 23 页第 26 项', 'T3 G2'),
        c('l10', '「第几页、第几项」就是一行的地址，叫 *ctid*', 'T3', { gap: 1.0 }),
        c('l12', '这张表有三个索引：主键、姓名、年龄', 'T1 T4 T5 T6'),
        c('l13', '每个索引是另外一个文件，各是一棵 B 树', 'T1 T4 T5 T6 T7'),
        c('l14', '三棵树都是两层：一个根，下面 12、39、5 页叶子', 'T4 T5 T6'),
        c('l18', '叶子里存的，是键和行的地址', 'T4 T7'),
        c('l19', '主键 2050 和姓名 Alice 旁边，记着同一个地址', 'T4 T5', { gap: 1.0 }),
        c('l21', 'InnoDB 不一样：表本身就是按主键排的那棵树', 'T9'),
        c('l23', '姓名索引里存的是主键', 'T9'),
        c('l24', 'PostgreSQL 里，没有哪棵树装着整行', 'T7'),
        c('l25', '每个索引都直接指向堆里的地址', 'T7', { gap: 1.2 }),
      ],
    },
    {
      id: 'page', chap: ['03', '一页之内'], lead: 2.8, tail: 0.7,
      cues: [
        c('p1', '打开第 23 页：开头 24 字节是页头', 'P1 P3'),
        c('p3', '接着是 88 个*项目指针*，每个 4 字节，指向一行', 'P2 P3'),
        c('p5', '指针从前往后排，行从页尾往前放', 'P2'),
        c('p6', '两头之间的空隙，只剩 72 字节', 'P3', { gap: 0.8 }),
        c('p7', '第 26 个指针说：Alice 从第 5904 字节开始，占 82 字节', 'P4'),
        c('p8', '地址记的是第几个指针，不是字节位置', 'P2'),
        c('p9', '行在页里可能被挪动，指针不会', 'P2', { gap: 1.0 }),
        c('p11', '这 82 字节里，前 24 字节是*行头*，后面才是数据', 'P5 P6'),
        c('p13', '行头里有三样东西，后面每一章都要用到', 'P5', { gap: 0.6 }),
        c('p14', '*xmin*：写入这一行的事务号，2809', 'P5'),
        c('p15', '*xmax*：作废这一行的事务号，现在是 0', 'P5'),
        c('p17', '*t_ctid*：这一行最新版本的地址，现在指着自己', 'P5', { gap: 0.8 }),
        c('p18', 'InnoDB 的行头里，记的是事务号和回滚指针', 'P8', { gap: 1.2 }),
      ],
    },
    {
      id: 'insert', chap: ['04', '增'], lead: 2.8, tail: 0.7,
      cues: [
        c('i2', '用户一个个注册，新行放进最后一页，放满了再接一页', 'G1'),
        c('i4', 'Alice 注册时，落在当时的最后一页：第 23 页', 'G2'),
        c('i6', '三个索引各插一项', 'G2'),
        c('i7', '2050 比已有编号都大，插在主键树最右边的叶子', 'G2'),
        c('i8', 'Alice 排在所有 User 前面，插在姓名树最左边的叶子', 'G2 T5', { gap: 0.8 }),
        c('i10', '叶子放满，就一分为二，上面长出一个根', 'G3', { tts: '叶子放满，就一分为二，上面涨出一个根。' }),
        c('i13', '编号递增，主键树总在最右边分裂，左页只装九成', 'G4', { gap: 1.2 }),
      ],
    },
    {
      id: 'query', chap: ['05', '查'], lead: 2.8, tail: 0.7,
      cues: [
        c('q1', '按名字找 Alice：SQL 先交给*规划器*', 'Q1 Q2 Q3'),
        c('q3', '要找的只有一行，它选姓名索引', 'Q3'),
        c('q4', '从根走到最左边的叶子，拿到地址：第 23 页第 26 项', 'Q3 T5'),
        c('q6', '取出这一页，顺着第 26 个指针找到这一行', 'Q3 P4'),
        c('q7', '再看行头：xmin 已提交，xmax 是 0，看得见', 'X3 P5'),
        c('q9', 'Alice，42 岁；一共只读了根、叶子、堆页三页', 'P6 Q1 Q3', { gap: 1.0 }),
        c('q11', '统计一共多少人，它不走索引，把 47 页从头读到尾', 'Q4'),
        c('q17', '要找多少行，决定了它走哪条路', 'Q1 Q3 Q4', { gap: 1.0 }),
        c('q19', 'InnoDB 按主键找，走到叶子就拿到整行', 'T9 Q9'),
        c('q20', 'PostgreSQL 的叶子里只有地址，还得再去一趟堆', 'T7', { gap: 1.2 }),
      ],
    },
    {
      id: 'update', chap: ['06', '改'], lead: 2.8, tail: 0.7,
      cues: [
        c('u1', 'Alice 过生日，42 岁改成 43', 'U1'),
        c('u2', 'PostgreSQL 不覆盖，另写一个新版本', 'U1'),
        c('u4', '新版本先看原来那一页放不放得下', 'U11'),
        c('u5', '第 23 页只剩 72 字节，新版本连同指针要 92', 'U1'),
        c('u6', '只好写到别的页：第 46 页第 49 项', 'U1', { gap: 0.8 }),
        c('u7', '旧版本的数据不动，行头里改两处', 'U1'),
        c('u8', 'xmax 记上这次修改的事务号，t_ctid 指向新版本', 'U1'),
        c('u10', '新版本的 xmin，也是这个事务号', 'U1'),
        c('u11', '同一个 Alice，现在有两个版本', 'U1', { gap: 1.0 }),
        c('u12', '三个索引里的项都指着旧地址，每个都要再插一项', 'U2'),
        c('u14', '名字和编号没变，也一样要插', 'U2', { gap: 1.0 }),
        c('u16', 'InnoDB 原位改，旧值进 undo', 'U9'),
        c('u17', '它的姓名索引存的是主键，主键没变就不用动', 'T9 U9', { gap: 1.0 }),
        c('u18', 'PostgreSQL 也有少动索引的办法，叫 *HOT*', 'U7'),
        c('u19', '条件有两个：改的列上没有索引，新版本放得进原来那一页', 'U7'),
        c('u21', '这时新版本留在本页，旧版本指向它，索引一项都不加', 'U6 U7'),
        c('u23', '换一张每页留一成空位、年龄不建索引的表', 'U6 U10'),
        c('u24', '同样改年龄，日志里只有一条 HOT 更新', 'U6', { gap: 0.8 }),
        c('u25', 'Alice 这次两个条件都不满足', 'U8'),
        c('u26', '年龄有索引，第 23 页也满了', 'U8'),
        c('u27', '表默认把页装满；要给更新留位置，可以把填充比例改小', 'U10', { gap: 1.2 }),
      ],
    },
    {
      id: 'mvcc', chap: ['07', '事务与并发'], lead: 2.8, tail: 0.7,
      cues: [
        c('m1', '两个版本都在表里，别人来读，该给哪一个？', 'X1'),
        c('m2', 'Alice 改了还没提交，她的事务号是 4856', 'X1'),
        c('m3', '提交状态另有一处记着，这时是「进行中」', 'X1 X12', { gap: 0.6 }),
        c('m5', 'Bob 来读，查询带着一张*快照*', 'X2 X3'),
        c('m7', '快照写着：4856 和它以后的事务，都还看不见', 'X2'),
        c('m8', '新版本的 xmin 是 4856，看不见；旧版本的作废也不算数', 'X1 X2'),
        c('m10', 'Bob 读到旧版本 42，不用等 Alice', 'X2 X3', { gap: 1.0 }),
        c('m12', 'Carol 也要改这一行，她只能等 Alice 的事务结束', 'X4'),
        c('m15', 'Alice 对这一行的锁，就记在行头的 xmax 里，不占内存', 'X5 X13', { gap: 1.0 }),
        c('m17', 'Alice 提交，状态变成「已提交」', 'X6 X12'),
        c('m19', 'Carol 接着改的，是 43 这一版；后来她放弃了修改', 'X6'),
        c('m20', 'Bob 再查一次，读到 43', 'X7'),
        c('m21', '默认的*读已提交*，每条语句都拿一张新快照', 'X3 X10', { gap: 0.6 }),
        c('m23', '换成*可重复读*，整个事务只用开头那张快照', 'X7'),
        c('m24', 'Bob 会一直读到 42；再去改 Alice，就报错', 'X7'),
        c('m27', 'InnoDB 默认的，是可重复读', 'X11', { gap: 1.2 }),
      ],
    },
    {
      id: 'delete', chap: ['08', '删与回收'], lead: 2.8, tail: 0.7,
      cues: [
        c('d1', '后来，Alice 注销了账号', 'D1'),
        c('d2', 'DELETE 也不擦掉这一行', 'D1'),
        c('d3', '只在 xmax 记上删除它的事务', 'D1'),
        c('d5', 'Bob 的可重复读事务还开着，他仍然读到 Alice', 'D2', { gap: 0.8 }),
        c('d6', '收走旧版本和删掉的行，靠 *VACUUM*', 'D6'),
        c('d7', '趁 Bob 的事务开着做一次：这一行已死，还不能回收', 'D3'),
        c('d10', 'Bob 结束后再做一次，这一行才被收走', 'D4'),
        c('d11', '三个索引里指向它的项，一起删掉', 'D4'),
        c('d12', '第 26 个指针空出来，空隙从 72 字节变成 160', 'D4'),
        c('d14', '哪页空出多少，记进堆旁的另一个小文件：*空闲空间图*', 'T8 D4', { gap: 0.8 }),
        c('d16', 'Dave 来注册，先问空闲空间图哪页放得下', 'D5 D12'),
        c('d18', '他落在第 23 页、第 26 个指针，正是 Alice 原来的位置', 'D5'),
        c('d20', 'InnoDB 里，也要等 purge 做完，Dave 才用上这块空间', 'D10', { gap: 1.0 }),
        c('d22', '不是每次都要等 VACUUM', 'U4'),
        c('d23', '页快满时，读到这一页的查询会顺手清理', 'U4'),
        c('d24', 'Alice 改完年龄后，第 23 页的旧版本就是这样被清掉的', 'U4', { gap: 0.8 }),
        c('d28', '开得很久的事务会挡住清理，死行越积越多', 'D3', { gap: 0.8 }),
        c('d29', '事务号只有 32 位，用过四十多亿个就绕回开头', 'D7'),
        c('d31', '过去的事务会看起来像在未来', 'D7'),
        c('d32', '所以每张表至少每 20 亿个事务要 VACUUM 一遍', 'D7'),
        c('d33', 'VACUUM 把足够老的行标成*冻结*，对谁都算过去', 'D8 D11', { gap: 1.2 }),
      ],
    },
    {
      id: 'crash', chap: ['09', '出错怎么办'], lead: 2.8, tail: 0.7,
      cues: [
        c('w1', '最后：提交过的修改，断电以后还在吗？', 'W8'),
        c('w2', '规矩是先写日志，叫 *WAL*：数据页写盘之前，日志先落盘', 'W1'),
        c('w4', 'Alice 提交的那一刻，日志写进磁盘', 'W2'),
        c('w6', '数据文件里的第 23 页还是旧的，提交不必等它', 'W3 W1', { gap: 0.8 }),
        c('w8', '*检查点*之前的修改，保证都已写进数据文件', 'W10'),
        c('w10', '检查点后第一次改某页，整页写进日志，防止页只写了一半', 'W4 W5', { gap: 1.0 }),
        c('w13', '试一次：Carol 把 Bob 的年龄改成 99，不提交', 'W8'),
        c('w14', 'Alice 改成 43，提交；然后强行停掉数据库', 'W7 W8', { gap: 0.8 }),
        c('w16', '重启时，它从最近的检查点起把日志重放一遍', 'W7 W10'),
        c('w18', 'Alice 是 43；Bob 还是 51，99 不见了', 'W8'),
        c('w20', '99 那个版本还在页里，但它的事务已中止', 'W8 X12', { gap: 0.8 }),
        c('w22', 'InnoDB 要用 undo 把没提交的修改撤回去', 'W9'),
        c('w23', 'PostgreSQL 不用撤：没提交的版本，本来就看不见', 'W8', { gap: 1.2 }),
      ],
    },
    {
      id: 'five', chap: ['10', '五个问题'], lead: 2.8, tail: 0.8,
      cues: [
        c('z1', '回头看，PostgreSQL 这样回答五个问题', null, { gap: 0.8 }),
        c('z2', '怎么放：行按到达顺序放进堆，索引各是一棵 B 树', 'T2 T4', { gap: 0.6 }),
        c('z4', '怎么找：规划器选路，从索引到堆，再看版本能不能看见', 'Q1 Q3', { gap: 0.6 }),
        c('z6', '改和删：写新版本、记 xmax，旧版本留到没人需要再回收', 'U1 D1 D4', { gap: 0.6 }),
        c('z8', '怎么并发：快照决定读哪个版本，写和写排队', 'X2 X4', { gap: 0.6 }),
        c('z10', '出错怎么办：先写 WAL，崩溃后重放，没提交的看不见', 'W1 W7 W8', { gap: 1.2 }),
      ],
    },
    {
      id: 'tradeoff', chap: ['11', '取舍'], lead: 2.8, tail: 0.8,
      cues: [
        c('t1', '同一张表、同样五个问题，两个引擎给了两套答案', null, { gap: 0.8 }),
        c('t2', 'InnoDB 按主键找，一棵树走到底', 'T9 Q9'),
        c('t3', 'PostgreSQL 要从索引再到堆，但按名字找不必绕主键', 'T7 Q9'),
        c('t5', '改一行，它要写新版本，用不上 HOT 就要动每个索引', 'U2 U7'),
        c('t7', '旧版本留在表里，清理跟不上，死行就越积越多', 'D3 D4', { gap: 0.8 }),
        c('t9', '换来的是读写互不挡路，回滚和崩溃以后都不用撤销', 'X3 X8 W8', { gap: 1.2 }),
        c('t11', '一个 1986 年在伯克利开始的研究系统', 'H1'),
        c('t12', '到 2026 年，成了开发者勾选最多的数据库', 'S8', { gap: 1.0 }),
        c('t13', '同一份调查里，排在它后面的第二名，是 SQLite', 'S8 B2'),
        c('t14', '它没有独立的服务进程，直接嵌进程序里', 'B1'),
        c('t15', '这样一个小巧的引擎，怎样做成生产级的关系数据库？', 'B1', { gap: 1.5 }),
      ],
    },
    {
      id: 'credits', chap: null, lead: 0.4, tail: 0.6,
      cues: [
        ['credits', null, { pause: 12, credits: true }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面。配音前用 kit/tools/tts_probe.js 试，配音后对着交审稿的多音字清单逐条听。
  const SAY = {
    zh: [
      [/PostgreSQL/g, 'Postgres Q L'],
      [/Postgres95/g, 'Postgres 九五'],
      [/POSTGRES/g, 'Postgres'],
      [/InnoDB/g, 'Inno D B'],
      [/MySQL/g, 'My S Q L'],
      [/SQLite/g, 'S Q Lite'],
      [/SQL:2023/g, 'S Q L 二零二三'],
      [/SQL/g, 'S Q L'],
      [/VACUUM/g, 'vacuum'],
      [/DELETE/g, 'delete'],
      [/HOT/g, 'hot'],
      [/WAL/g, 'W A L'],
      [/t_ctid/g, 'T C T I D'],
      [/ctid/g, 'C T I D'],
      [/xmin/g, 'X min'],
      [/xmax/g, 'X max'],
      [/8 KB/g, '八 K B'],
      [/6\.0/g, '六点零'],
      [/(\d{4}) 年/g, (_, y) => [...y].map((n) => '零一二三四五六七八九'[+n]).join('') + ' 年'],
      [/重放/g, '崇放'],
      [/(?<![执进运银发可流不])行(?![为动走])/g, '航'],
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

  // 没有实测时长时的估算：沉稳高管、语速 1.1 的试听实测约每秒 4.6 字（汉字算 1，拉丁字母与数字算 0.5；按字幕计，不按读法文本计）
  const units = (s) => (s.match(/[一-鿿]/g) || []).length + (s.match(/[A-Za-z0-9]/g) || []).length / 2;
  const estimate = (cap) => (LANG === 'zh' ? 0.35 + units(strip(cap)) / 4.6 : 0.3 + cap.split(/\s+/).length / 2.7);

  // 由脚本与实测时长算出整条时间线；浏览器端排动画、Node 端混音与检查都用它
  function layoutScript(DUR) {
    DUR = DUR || {};
    let t = 0;
    const cues = {}, scenes = [], order = [];
    for (const sc of SCRIPT) {
      const s0 = t;
      t += sc.lead || 0;
      const first = t;
      for (const cc of sc.cues) {
        const [id, cap, o = {}] = cc;
        const meas = DUR[id];
        const d = o.pause != null ? o.pause : (meas ? meas.d : estimate(cap));
        cues[id] = { id, scene: sc.id, cap, start: t, end: t + d, d, silent: o.pause != null, tts: o.pause != null ? null : ttsText(cc), words: meas ? meas.words : null };
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
