// 中文第 6 稿（口语化重写）；事实入口 research/FACTS.md。未确认，不配音、不铺开场景。
// facts 关联事实编号；此字段只记录依据，不进入字幕。英文须在中文确认后翻译。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  if (LANG !== 'zh') throw new Error('英文文案尚未翻译；当前仅可使用 --lang zh / ?lang=zh。');
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => LANG === 'zh' ? zh : en;
  const c = (id, text, facts, options = {}) => [id, { zh: text }, { facts: facts.split(' '), gap: 0.4, ...options }];

  const RAW = [
    {
      id: 'open', chap: null, lead: 0.6, tail: 0.5,
      cues: [
        c('o1', '每年，Stack Overflow 都会问开发者', 'S05'),
        c('o1a', '你在用什么数据库', 'S05', { gap: 0.6 }),
        c('o2', '2018 年，MySQL 排第一，58.7%', 'S05'),
        c('o3', 'PostgreSQL 只有 32.9%', 'S05', { gap: 0.6 }),
        c('o4', '之后，差距一年比一年小', 'S05'),
        c('o5', '2023 年，PostgreSQL 反超', 'S02 S05'),
        c('o6', '到了 2026 年，它是 57.9%', 'S03 S05'),
        c('o6a', 'MySQL 是 35.1%', 'S03 S05', { gap: 0.8 }),
        c('o7', '这个系列前两集讲的 MyISAM 和 InnoDB', 'C05', { gap: 0.22, tts: { zh: '这个系列前两集讲的 My ISAM 和 Inno D B，' } }),
        c('o8', '其实都是 MySQL 的存储引擎', 'C05', { gap: 0.6 }),
        c('o9', '这一集，换到另一边，看看 PostgreSQL', 'C04 S05'),
        c('o10', '还是那张用户表，还是那八行数据', 'C03'),
        c('o11', '最后再来回答：新项目为什么值得先考虑它', 'T37', { gap: 0.8 }),
        ['oT', null, { pause: 2.0, gap: 0 }],
      ],
    },
    {
      id: 'history', chap: ['01', { zh: '它从哪里来' }], lead: 3.2, tail: 0.7,
      cues: [
        c('h1', '先说清楚，PostgreSQL 不只是一个存储引擎', 'T01'),
        c('h2', '解析 SQL、规划查询、管理事务、存放数据', 'T01', { gap: 0.22, tts: { zh: '解析 SQL、规划查询、管理事务、存放数据，' } }),
        c('h3', '都由它自己完成', 'T01'),
        c('h4', '这一集主要看最底下那一层：数据怎么存', 'T01 T04', { gap: 0.7 }),
        c('h5', '它的来历，要从伯克利说起', 'H02'),
        c('h6', '七十年代，斯通布雷克等人在这里做了 Ingres', 'H02'),
        c('h7', '一个早期的关系数据库', 'H02', { gap: 0.6 }),
        c('h8', '1986 年，斯通布雷克开始做它的后继者', 'H03'),
        c('h9', '取名 POSTGRES，意思是 Ingres 之后', 'H03'),
        c('h10', '它从一开始，就想让用户自己添加数据类型和索引', 'H03 T22', { gap: 0.6 }),
        c('h11', '1994 年，两位研究者给它加上了 SQL', 'H05'),
        c('h12', '1996 年，它改名 PostgreSQL，一直用到今天', 'H06', { tts: { zh: '一九九六年，它改名 Postgres Q L，一直用到今天。' } }),
        c('h13', '此后由社区持续开发', 'H04 H07'),
      ],
    },
    {
      id: 'storage', chap: ['02', { zh: '数据怎么放' }], lead: 3.2, tail: 0.6,
      cues: [
        c('d0', '下面用 PostgreSQL 18.4 来演示', 'T04'),
        c('d1', '表还是三列：编号、名字、年龄，一共八行', 'C03'),
        c('d2', '数据写进一个文件，PostgreSQL 管它叫堆', 'T04'),
        c('d3', '堆里的行不按编号排列，哪里有空位，就放在哪里', 'T04 T28'),
        c('d4', '主键索引，是另一个单独的文件', 'T04'),
        c('d5', '这点和 MyISAM 相似：数据和索引分开放', 'C01 T04', { gap: 0.7 }),
        c('d6', '堆文件按页来分，一页 8192 字节', 'T05'),
        c('d7', '打开第一页', 'T05', { gap: 0.5 }),
        c('d8', '开头 24 个字节，是页头', 'T05'),
        c('d9', '紧接着是八个指针，每个 4 字节', 'T05'),
        c('d10', '每个指针，指向这一页里的一行', 'T05'),
        c('d11', '行本身，从页的末尾往前放', 'T05'),
        c('d12', '中间这一大块，是还没用上的空间', 'T05'),
        c('d13', '以后写入，指针和行从两头往中间长', 'T05', { gap: 0.7 }),
        c('d14', '再看一行里面装了什么', 'T06'),
        c('d15', '编号、名字、年龄的前面，还有一个行头', 'T06'),
        c('d16', '行头里记着：是哪个事务写下了这一行', 'T06'),
        c('d17', '后面会看到，谁能看见这一行，就靠它来判断', 'T06 T12'),
      ],
    },
    {
      id: 'query', chap: ['03', { zh: '怎么找到一行' }], lead: 3.2, tail: 0.7,
      cues: [
        c('q1', '现在，查编号为 1 的用户', 'T08 C03'),
        c('q2', 'SQL 先交给规划器，由它决定怎么找', 'T08'),
        c('q3', '表里只有八行，它选择从头扫一遍', 'T08'),
        c('q4', '换成两万行的表，它就改走主键索引', 'T08', { gap: 0.6 }),
        c('q5', '索引里，编号 1 旁边记着一个位置', 'T09'),
        c('q6', '第 0 页，第 1 项', 'T07 T09'),
        c('q7', '按这个位置，到堆里取出这一行', 'T09'),
        c('q8', '确认它对这次查询可见，才把名字和年龄交出去', 'T06 T09', { gap: 0.7 }),
        c('q9', '这里和 InnoDB 不一样', 'T10'),
        c('q10', 'InnoDB 的主键索引里，直接存着整行数据', 'T10'),
        c('q11', '找到主键，就找到了数据', 'T10'),
        c('q12', 'PostgreSQL 的索引只存位置，还要再去堆里取一次', 'T09 T10', { gap: 0.6 }),
        c('q13', '别的索引也有这个差别', 'T30'),
        c('q14', 'InnoDB 的二级索引，存的是主键', 'T30'),
        c('q15', '主键很长时，每个二级索引都跟着变大', 'T30'),
        c('q16', 'PostgreSQL 的索引存的都是堆里的位置，不用带上主键', 'T30'),
      ],
    },
    {
      id: 'modify', chap: ['04', { zh: '改一行，发生了什么' }], lead: 3.2, tail: 0.7,
      cues: [
        c('u1', '把 alice 的年龄，从 30 改成 31', 'T11 C03'),
        c('u2', 'PostgreSQL 并不直接改掉原来的 30', 'T11'),
        c('u3', '它在堆里另写一行，年龄是 31', 'T11'),
        c('u4', '新行放在第 9 项，旧的 30 还留在第 1 项', 'T07 T11'),
        c('u5', '旧行上记下：被哪个事务改了，新的在哪里', 'T06 T11', { gap: 0.6 }),
        c('u6', '同一条记录，现在有了两个版本', 'T11'),
        c('u7', 'InnoDB 也会留下旧值，不过是放进 undo 信息', 'T14'),
        c('u8', '需要时，再拼回旧的样子', 'T14'),
        c('u9', 'PostgreSQL 则把旧版本原样留在堆里', 'T11 T14', { gap: 0.7 }),
        c('u10', '那索引呢？它指向的还是第 1 项', 'T15'),
        c('u11', '这次只改了年龄，年龄上没有索引', 'T15'),
        c('u12', '同一页里也还有空位', 'T15'),
        c('u13', '这时索引不用动', 'T15'),
        c('u14', '查询走到第 1 项，再在页内跳到第 9 项', 'T15'),
        c('u15', '这叫 HOT 更新', 'T15', { gap: 0.6 }),
        c('u16', '如果改的是名字，名字上有索引', 'T15', { gap: 0.22, tts: { zh: '如果改的是名字，名字上有索引，' } }),
        c('u17', '就得写一条新的索引项', 'T15 T18', { gap: 0.6 }),
        c('u18', '删除也一样，不会马上抹掉', 'T29'),
        c('u19', '只是记下：这一行被哪个事务删了', 'T29', { gap: 0.7 }),
      ],
    },
    {
      id: 'mvcc', chap: ['05', { zh: '同时读写' }], lead: 3.2, tail: 0.7,
      cues: [
        c('m1', '现在堆里有两个版本：30 和 31', 'T11'),
        c('m2', '别的连接来读，该给它哪一个', 'T12', { gap: 0.6 }),
        c('m3', '修改还没提交，读到的是 30', 'T12'),
        c('m4', '读的一方也不用等它提交', 'T12 T13', { gap: 0.6 }),
        c('m5', '提交以后，要看隔离级别', 'T12 T31'),
        c('m6', 'PostgreSQL 默认的级别，叫读已提交', 'T31'),
        c('m7', '每条查询开始时，都重新看一眼：此刻已提交了哪些修改', 'T12'),
        c('m8', '所以提交后的新查询，读到 31', 'T12', { gap: 0.6 }),
        c('m9', '另一种级别，叫可重复读', 'T12'),
        c('m10', '整个事务，从第一次查询起，都用同一个视角', 'T12'),
        c('m11', '这样的事务如果在提交前就开始读了', 'T12', { gap: 0.22, tts: { zh: '这样的事务如果在提交前就开始读了，' } }),
        c('m11a', '就会一直读到 30', 'T12', { gap: 0.6 }),
        c('m12', '这个视角，叫快照', 'T12'),
        c('m13', '快照，加上行头里的事务号，决定了谁能看见哪个版本', 'T06 T12'),
        c('m14', '这套办法，叫多版本并发控制，MVCC', 'T11 T12', { gap: 0.6 }),
        c('m15', '读不用等写', 'T12 T13'),
        c('m16', '但两个连接同时改同一行，后来的那个还是得等', 'T13', { gap: 0.6 }),
        c('m17', '顺便一提，InnoDB 默认是可重复读', 'T31'),
        c('m18', '比较两边时，要先把级别调成一样', 'T31', { gap: 0.7 }),
      ],
    },
    {
      id: 'maintenance', chap: ['06', { zh: '旧版本去哪了' }], lead: 3.2, tail: 0.7,
      cues: [
        c('v1', '旧版本一直留着，表就会越来越大', 'T17 T18'),
        c('v2', '清理它们的命令，叫 VACUUM', 'T16 T17'),
        c('v3', '但只要还有快照可能用到 30，就不能清', 'T16', { gap: 0.6 }),
        c('v4', '那个可重复读事务还开着时，执行 VACUUM', 'T16'),
        c('v5', '30 还留在页里', 'T16'),
        c('v6', '事务结束，再执行一次，30 才被清掉', 'T16', { gap: 0.6 }),
        c('v7', '第 1 项的指针留了下来，改成指向第 9 项', 'T15 T16'),
        c('v8', '这样，索引里记的旧位置依然有效', 'T15 T16', { gap: 0.6 }),
        c('v9', '腾出的空间，留给这张表以后写入', 'T17'),
        c('v10', '通常不会立刻还给操作系统', 'T17', { gap: 0.6 }),
        c('v11', '所以更新很频繁的表，或者开了很久的事务', 'T17 T18', { gap: 0.22, tts: { zh: '所以更新很频繁的表，或者开了很久的事务，' } }),
        c('v12', '都要留意清理跟不跟得上', 'T17 T18'),
      ],
    },
    {
      id: 'recovery', chap: ['07', { zh: '崩溃以后' }], lead: 3.2, tail: 0.7,
      cues: [
        c('w1', '最后一个问题：提交之后，数据库突然崩溃，数据还在吗', 'T19 T21'),
        c('w2', '修改先发生在内存里的页上', 'T19'),
        c('w3', '这一页写回磁盘之前，必须先把日志写进磁盘', 'T19'),
        c('w4', '这叫预写日志，WAL', 'T19', { gap: 0.6 }),
        c('w5', '开启同步提交时，提交只等日志落盘', 'T20'),
        c('w6', '数据页，由后台慢慢写回', 'T19 T20'),
        c('w7', '检查点会标记：崩溃后从哪里开始恢复', 'T20', { gap: 0.6 }),
        c('w8', '试一下：把 alice 的年龄改成 32，提交', 'T21'),
        c('w9', '另一个连接改了编号 2，还没提交', 'T21'),
        c('w10', '这时，让数据库进程直接崩溃', 'T21', { gap: 0.6 }),
        c('w11', '重启后，PostgreSQL 按日志把修改重做一遍', 'T21'),
        c('w12', '已经提交的 32，回来了', 'T21'),
        c('w13', '没提交的那笔，查出来还是原来的值', 'T21', { gap: 0.6 }),
        c('w14', '这和 InnoDB 的 redo 是同一个思路', 'C02 T19'),
        c('w15', '先写日志，崩溃后重做', 'C02 T19 T21'),
      ],
    },
    {
      id: 'compare', chap: ['08', { zh: '为什么先考虑它' }], lead: 3.2, tail: 0.7,
      cues: [
        c('b1', '回到开头的问题：新项目为什么值得先考虑 PostgreSQL', 'T37', { gap: 0.6 }),
        c('b2', '只看存储，两边各有得失', 'T10 T18'),
        c('b3', 'InnoDB 按主键读整行，少跳一次', 'T10'),
        c('b4', 'PostgreSQL 的索引，不用背着主键', 'T30'),
        c('b5', '旧版本，两边都得花力气清理', 'T14 T18', { gap: 0.6 }),
        c('b6', '更大的差别，在存储之上', 'T01 T37'),
        c('b7', '比如，只给未完成的任务建索引，这叫部分索引', 'T32'),
        c('b8', '比如，把 JSON 存进 JSONB 列，再用 GIN 索引按字段查', 'T33'),
        c('b9', '再比如，同一台设备的预约时间不能重叠', 'T26', { gap: 0.22, tts: { zh: '再比如，同一台设备的预约时间不能重叠，' } }),
        c('b10', '可以直接写成一条约束，冲突的那笔写不进去', 'T26 T27', { gap: 0.7 }),
        c('b11', '还记得它最初的目标吗：让用户自己加类型和索引', 'H03 T22'),
        c('b12', '这条路一直走到今天', 'T22'),
        c('b13', 'PostGIS 加上了地理空间', 'T24'),
        c('b14', 'pgvector 加上了向量检索', 'T34', { gap: 0.6 }),
        c('b15', 'MySQL 也支持 JSON 和空间数据', 'T35'),
        c('b16', '不同在于，PostgreSQL 开放了扩展接口', 'T22 T37'),
        c('b16a', '别人可以继续往里加', 'T22 T37'),
        c('b17', '它的许可宽松，由社区维护', 'T25', { gap: 0.6 }),
        c('b18', 'Django 的官方教程，建议正式项目考虑 PostgreSQL', 'T36'),
        c('b19', 'Supabase 这样的服务', 'T36', { gap: 0.22, tts: { zh: 'Supabase 这样的服务，' } }),
        c('b19a', '给每个项目一个完整的 Postgres 数据库', 'T36', { gap: 0.7 }),
        c('b20', '调查只告诉我们比例在上升，没有说原因', 'S04 T38'),
        c('b21', '但从实现和生态看，它是新项目很自然的起点', 'T37', { gap: 0.6 }),
        c('b22', '代价也要记住：更新很多的表，要管好清理', 'T18'),
        c('b23', '已经在用 MySQL 的项目，换之前要实际测过', 'T37', { gap: 0.7 }),
      ],
    },
    {
      id: 'outro', chap: ['09', { zh: '四个问题' }], lead: 3.2, tail: 0.6,
      cues: [
        c('z1', '回头看，一个数据库要回答的四个问题', 'T04 T08 T12 T19', { gap: 0.22, tts: { zh: '回头看，一个数据库要回答的四个问题，' } }),
        c('z1a', 'PostgreSQL 是这样回答的', 'T04 T08 T12 T19'),
        c('z2', '数据怎么放：堆里一个个行版本，索引另放', 'T04 T11'),
        c('z3', '怎么找：规划器选路，再看版本能不能见', 'T08 T09'),
        c('z4', '怎么并发：快照决定读哪个版本，写和写排队', 'T12 T13'),
        c('z5', '出错怎么办：先写日志，崩溃后重做', 'T19 T21', { gap: 0.7 }),
        c('z6', '下一集，我们拆开 Firebird', 'C04', { gap: 0.8 }),
        ['zCredit', null, { pause: 14.0, gap: 0, credits: true }],
      ],
    },
  ];


  // 仅为候选读法，尚未调用语音；人工确认后逐段试听，不把这些替换当发音验收。
  const SAY = {
    zh: [
      [/MyISAM/g, 'My ISAM'],
      [/PostgreSQL/g, 'Postgres'],
      [/Postgres95/g, 'Postgres 九五'],
      [/POSTGRES/g, 'Postgres'],
      [/InnoDB/g, 'Inno D B'],
      [/MySQL/g, 'My S Q L'],
      [/Stack Overflow/g, 'Stack Overflow'],
      [/PostGIS/g, 'Post G I S'],
      [/pgvector/g, 'P G vector'],
      [/GIN/g, 'gin'],
      [/58\.7%/g, '百分之五十八点七'],
      [/57\.9%/g, '百分之五十七点九'],
      [/32\.9%/g, '百分之三十二点九'],
      [/35\.1%/g, '百分之三十五点一'],
      [/JSONB/g, 'J son B'],
      [/MVCC/g, 'M V C C'],
      [/OLTP/g, 'O L T P'],
      [/WAL/g, 'W A L'],
      [/SQL/g, 'S Q L'],
      [/GiST/g, 'gist'],
      [/HOT/g, 'hot'],
      [/VACUUM/g, 'vacuum'],
      [/(\d{4}) 年/g, (_, year) => [...year].map(n => '零一二三四五六七八九'[+n]).join('') + '年'],
      [/8192/g, '八千一百九十二'],
      [/18\.4/g, '十八点四'],
      [/6\.0/g, '六点零'],
      [/32/g, '三十二'], [/31/g, '三十一'], [/30/g, '三十'],
      [/(?<![执进运银发可])行(?!为)/g, '航'],
    ],
    en: [],
  };
  const strip = s => s.replace(/\*/g, '');
  const ttsNorm = text => { for (const [re, to] of SAY[LANG] || []) text = text.replace(re, to); return text; };
  const SCRIPT = RAW.map(sc => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap) }]),
  }));
  const ttsText = cue => cue[2]?.tts || ttsNorm(strip(cue[1]) + '。');
  // 无音频时按 4.7 字/秒保守估算；必须由实际配音重新测时。
  const estimate = text => 0.25 + text.replace(/[，。：；、？\s]/g, '').length / 4.7;
  function layoutScript(DUR = {}) {
    let t = 0;
    const cues = {}, scenes = [], order = [];
    for (const sc of SCRIPT) {
      const start = t;
      t += sc.lead || 0;
      const first = t;
      for (const cue of sc.cues) {
        const [id, cap, o = {}] = cue, measured = DUR[id];
        const d = o.pause != null ? o.pause : measured ? measured.d : estimate(ttsText(cue));
        cues[id] = { id, scene: sc.id, cap, start: t, end: t + d, d, silent: o.pause != null,
          tts: o.pause != null ? null : ttsText(cue), words: measured?.words || null };
        order.push(id);
        t += d + (o.gap ?? 0.3);
      }
      t += sc.tail ?? 0.6;
      scenes.push({ id: sc.id, chap: sc.chap, start, first, end: t, lead: sc.lead || 0 });
    }
    return { cues, scenes, order, total: t };
  }
  const api = { SCRIPT, LANG, pick, tr, layoutScript, ttsText, ttsNorm, strip };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { Object.assign(root, api); root.DUR = (root.DUR_ALL || {})[LANG] || {}; }
})(typeof window !== 'undefined' ? window : globalThis);

