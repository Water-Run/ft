// 中文第 12 稿（关键结果后加留白）；事实入口 research/FACTS.md。未确认，不配音、不铺开场景。
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
        c('o2', '2018 年，58.7% 的人回答 MySQL，排在第一', 'S05'),
        c('o3', '回答 PostgreSQL 的，只有 32.9%', 'S05', { gap: 0.6 }),
        c('o4', '之后，差距一年比一年小', 'S05'),
        c('o5', '2023 年，PostgreSQL 反超', 'S02 S05'),
        c('o6', '到了 2026 年，PostgreSQL 是 57.9%', 'S03 S05'),
        c('o6a', 'MySQL 降到 35.1%', 'S03 S05', { gap: 2.0 }),
        c('o7', '这个系列前两集讲的 MyISAM 和 InnoDB', 'C05', { gap: 0.22, tts: { zh: '这个系列前两集讲的 My ISAM 和 Inno D B，' } }),
        c('o8', '这些都是 MySQL 的存储引擎', 'C05', { gap: 2.0 }),
        c('o9', '这一集，换到另一边，看看 PostgreSQL', 'C04 S05', { gap: 0.8 }),
        ['oT', null, { pause: 2.0, gap: 0 }],
      ],
    },
    {
      id: 'history', chap: ['01', { zh: '它从哪里来' }], lead: 4.3, tail: 0.7,
      cues: [
        c('h1', '和 InnoDB 不同，PostgreSQL 不是一个存储引擎', 'T01'),
        c('h1a', '而是从解析 SQL 到存放数据的一整套系统', 'T01', { gap: 0.7 }),
        c('h5', '它的来历，要从 1970 年说起', 'H01'),
        c('h6', 'IBM 的科德提出了关系模型', 'H01'),
        c('h6a', '数据放进一张张表，表和表之间，靠值来关联', 'H13', { gap: 2.0 }),
        c('h7', '想法很漂亮，但能不能真的做出来，当时不少人怀疑', 'H13'),
        c('h7a', '1973 年，IBM 开始做 System R', 'H13'),
        c('h7b', '我们今天写的 SQL，也诞生在 IBM', 'H13', { gap: 2.0 }),
        c('h8', '同一时期，伯克利的斯通布雷克和 Eugene Wong 等人', 'H02', { gap: 0.22, tts: { zh: '同一时期，伯克利的斯通布雷克和 Eugene Wong 等人，' } }),
        c('h8a', '做出了另一个关系数据库：Ingres', 'H02'),
        c('h9', '1988 年，两者一起获得 ACM 软件系统奖', 'H14', { gap: 2.0 }),
        c('h10', '斯通布雷克想再往前走一步', 'H03'),
        c('h10a', '1986 年，他开始做下一代系统，取名 POSTGRES', 'H03'),
        c('h10b', '意思是：Ingres 之后', 'H03'),
        c('h10c', '新系统让用户能自己添加数据类型、函数和索引', 'H03 T22 H15'),
        c('h10d', '他把这种思路叫对象关系', 'H15'),
        c('h10e', '今天的主流商业关系数据库，基本都吸收了这套思路', 'H15', { gap: 2.0 }),
        c('h11', '1994 年，两位研究者给它加上了 SQL', 'H05'),
        c('h12', '1996 年，它改名 PostgreSQL，交给社区开发', 'H06 H04', { tts: { zh: '一九九六年，它改名 PostgreSQL，交给社区开发。' } }),
        c('h13', '2014 年，斯通布雷克获得了图灵奖', 'H04', { gap: 2.0 }),
        c('h14', '这条线，从最早的关系数据库一路连到今天', 'H02 H03 H17', { gap: 2.0 }),
        c('h15', '它也一直贴着 SQL 标准走', 'H16'),
        c('h15a', 'SQL:2023 核心标准有 177 项必选特性', 'H16', { tts: { zh: 'SQL 二零二三核心标准，有一百七十七项必选特性。' } }),
        c('h15b', 'PostgreSQL 18 至少支持其中 170 项', 'H16', { tts: { zh: 'PostgreSQL 十八，至少支持其中一百七十项。' } }),
        c('h15c', '而 177 项全部做到的，目前还一个都没有', 'H16', { gap: 0.6, tts: { zh: '而一百七十七项全部做到的，目前还一个都没有。' } }),
        c('h16', '所以，说它是关系数据库的正统，并不为过', 'H17', { gap: 1.0 }),
      ],
    },
    {
      id: 'storage', chap: ['02', { zh: '数据怎么放' }], lead: 4.3, tail: 0.6,
      cues: [
        c('d0', '下面用 PostgreSQL 18.4 来演示', 'T04'),
        c('d1', '还是那张用户表：编号、名字、年龄三列，一共八行', 'C03', { gap: 2.0 }),
        c('d2', '数据写进一个文件，PostgreSQL 管它叫堆', 'T04'),
        c('d3', '堆里的行不按编号排列，哪里有空位，就放在哪里', 'T04 T28'),
        c('d4', '主键索引则是另一个文件', 'T04'),
        c('d5', '数据和索引分开放，这一点和 MyISAM 相似', 'C01 T04', { gap: 2.0 }),
        c('d6', '堆文件按页来分，一页 8192 字节', 'T05'),
        c('d7', '打开第一页', 'T05', { gap: 0.5 }),
        c('d8', '开头是页头，接着是八个指针，对应八行数据', 'T05'),
        c('d10', '每个指针，指向这一页里的一行', 'T05'),
        c('d11', '行本身，从页的末尾往前放', 'T05'),
        c('d12', '中间空着的部分，留给以后写入', 'T05'),
        c('d13', '指针从前往后长，行从后往前长', 'T05', { gap: 2.0 }),
        c('d15', '编号、名字、年龄的前面，还有一个行头', 'T06'),
        c('d16', '行头里记着，这一行是哪个事务写进来的', 'T06'),
        c('d17', '之后判断谁能读到这一行，靠的就是它', 'T06 T12'),
      ],
    },
    {
      id: 'query', chap: ['03', { zh: '怎么找到一行' }], lead: 4.3, tail: 0.7,
      cues: [
        c('q1', '现在，查编号为 1 的用户', 'T08 C03'),
        c('q2', 'SQL 先交给规划器，由它决定怎么找', 'T08'),
        c('q3', '表只有八行，它干脆从头扫一遍', 'T08'),
        c('q4', '换成两万行的表，它就改走主键索引', 'T08', { gap: 2.0 }),
        c('q5', '索引里，编号 1 旁边记着一个位置', 'T09'),
        c('q6', '第 0 页，第 1 项', 'T07 T09'),
        c('q7', '按这个位置，到堆里取出这一行', 'T09'),
        c('q8', '再确认这一行此刻能被看到，才返回结果', 'T06 T09'),
        c('q8a', 'alice，30 岁', 'C03', { gap: 2.0 }),
        c('q9', '这里和 InnoDB 不一样', 'T10'),
        c('q10', 'InnoDB 的主键索引里，直接存着整行数据', 'T10'),
        c('q11', '找到主键，就找到了数据', 'T10'),
        c('q12', 'PostgreSQL 的索引只存位置，还要再去堆里取一次', 'T09 T10', { gap: 0.6 }),
        c('q13', '二级索引，也有同样的差别', 'T30'),
        c('q14', 'InnoDB 的二级索引存的是主键，主键越长，索引越大', 'T30'),
        c('q16', 'PostgreSQL 的索引只存堆里的位置，和主键长短无关', 'T30'),
      ],
    },
    {
      id: 'modify', chap: ['04', { zh: '改一行，发生了什么' }], lead: 4.3, tail: 0.7,
      cues: [
        c('u1', '现在，把 alice 的年龄改成 31', 'T11 C03'),
        c('u2', 'PostgreSQL 不会把 30 直接改掉', 'T11'),
        c('u3', '而是在堆里另写一行，年龄是 31', 'T11'),
        c('u4', '新行放在第 9 项，旧的 30 还留在第 1 项', 'T07 T11'),
        c('u5', '旧行上记下：是哪个事务改的，新行在哪', 'T06 T11', { gap: 0.6 }),
        c('u6', '同一条记录，现在有了两个版本', 'T11', { gap: 2.0 }),
        c('u7', 'InnoDB 也会留下旧值，不过是放进 undo 信息', 'T14'),
        c('u8', '需要时，再拼回旧的样子', 'T14'),
        c('u9', 'PostgreSQL 则把旧版本原样留在堆里', 'T11 T14', { gap: 2.0 }),
        c('u10', '那索引呢？它指向的还是第 1 项', 'T15'),
        c('u11', '这次只改了年龄，年龄上没有索引', 'T15'),
        c('u12', '新行也写在了同一页', 'T15'),
        c('u13', '所以索引不用动', 'T15'),
        c('u14', '查询走到第 1 项，再在页内跳到第 9 项', 'T15'),
        c('u15', 'PostgreSQL 管这叫 HOT 更新', 'T15', { gap: 0.9 }),
        c('u16', '如果改的是名字，名字上有索引', 'T15', { gap: 0.22, tts: { zh: '如果改的是名字，名字上有索引，' } }),
        c('u17', '就得写一条新的索引项', 'T15 T18', { gap: 0.7 }),
      ],
    },
    {
      id: 'mvcc', chap: ['05', { zh: '同时读写' }], lead: 4.3, tail: 0.7,
      cues: [
        c('m1', '现在堆里有两个版本：30 和 31', 'T11'),
        c('m2', '别的连接来读，该给它哪一个', 'T12', { gap: 0.6 }),
        c('m3', '如果修改还没提交，别人读到的是 30', 'T12'),
        c('m4', '读的一方，也不用等它提交', 'T12 T13', { gap: 0.6 }),
        c('m5', '提交之后读到什么，要看隔离级别', 'T12 T31'),
        c('m6', 'PostgreSQL 默认的级别，叫读已提交', 'T31'),
        c('m7', '每条查询开始时，都会重新拍一张快照', 'T12'),
        c('m7a', '看清此刻哪些修改已经提交', 'T12'),
        c('m8', '所以提交后的新查询，读到 31', 'T12', { gap: 0.6 }),
        c('m9', '可重复读不一样', 'T12'),
        c('m10', '整个事务，都沿用第一次查询时拍下的那张快照', 'T12'),
        c('m11', '修改提交前就开始读的事务', 'T12', { gap: 0.22, tts: { zh: '修改提交前就开始读的事务，' } }),
        c('m11a', '会一直读到 30', 'T12', { gap: 1.0 }),
        c('m13', '拿快照和行头里的事务号一对，就知道该读哪个版本', 'T06 T12'),
        c('m14', '这就是多版本并发控制，MVCC', 'T11 T12', { gap: 2.0 }),
        c('m15', '读不用等写', 'T12 T13'),
        c('m16', '但两个连接同时改同一行，后来的那个还是得等', 'T13', { gap: 0.7 }),
      ],
    },
    {
      id: 'maintenance', chap: ['06', { zh: '旧版本去哪了' }], lead: 4.3, tail: 0.7,
      cues: [
        c('v1', '旧版本一直留着，表就会越来越大', 'T17 T18'),
        c('v2', '清理旧版本，靠的是 VACUUM', 'T16 T17'),
        c('v3', '但只要还有快照可能用到 30，就不能清', 'T16', { gap: 0.6 }),
        c('v4', '趁那个可重复读事务还开着，先执行一次 VACUUM', 'T16'),
        c('v5', '30 没有被清掉', 'T16'),
        c('v6', '事务结束，再执行一次，30 才被清掉', 'T16', { gap: 0.9 }),
        c('v7', '第 1 项的指针留了下来，改成指向第 9 项', 'T15 T16'),
        c('v8', '这样，索引里记的旧位置依然有效', 'T15 T16', { gap: 0.6 }),
        c('v9', '腾出的空间留给这张表，一般不会马上还给操作系统', 'T17', { gap: 0.6 }),
        c('v11', '所以更新很频繁的表，或者开了很久的事务', 'T17 T18', { gap: 0.22, tts: { zh: '所以更新很频繁的表，或者开了很久的事务，' } }),
        c('v12', '都要留意清理跟不跟得上', 'T17 T18'),
      ],
    },
    {
      id: 'recovery', chap: ['07', { zh: '崩溃以后' }], lead: 4.3, tail: 0.7,
      cues: [
        c('w1a', '最后，已经提交的数据，遇到崩溃还在不在', 'T19 T21', { gap: 0.6 }),
        c('w2', '修改先发生在内存里的数据页上', 'T19'),
        c('w3', '这一页写回磁盘之前，必须先把日志写进磁盘', 'T19'),
        c('w4', '这条规矩，叫预写日志，WAL', 'T19', { gap: 0.6 }),
        c('w5', '开启同步提交时，提交只需等日志写进磁盘', 'T20'),
        c('w6', '数据页，由后台慢慢写回', 'T19 T20'),
        c('w7', '检查点则记下，崩溃后该从哪里开始恢复', 'T20', { gap: 2.0 }),
        c('w8', '试一下：把 alice 的年龄改成 32，提交', 'T21'),
        c('w9', '另一个连接改了编号 2，还没提交', 'T21'),
        c('w10', '这时，让数据库进程直接崩溃', 'T21', { gap: 0.6 }),
        c('w11', '重启后，PostgreSQL 按日志把修改重做一遍', 'T21'),
        c('w12', '已经提交的 32，回来了', 'T21', { gap: 0.8 }),
        c('w13', '没提交的那笔，查出来还是原来的值', 'T21', { gap: 0.9 }),
        c('w14', '这和 InnoDB 的 redo 日志，是同一个思路', 'C02 T19 T21'),
      ],
    },
    {
      id: 'compare', chap: ['08', { zh: '为什么选它' }], lead: 4.3, tail: 0.7,
      cues: [
        c('b1', '论资历，PostgreSQL 才是老前辈', 'H03 H18'),
        c('b1a', '它的源头，比 MySQL 的第一版早了将近十年', 'H03 H18'),
        c('b1b', '这几年，这位老前辈又走到了最前面', 'S05 H18', { gap: 0.6 }),
        c('b1c', '一个老牌数据库，为什么会在今天复兴', 'S05 H18 T37', { gap: 2.0 }),
        c('b6', '底层存储，两边各有得失；差别更大的，在上面一层的功能', 'T01 T10 T18 T37', { gap: 2.0 }),
        c('b7', '只想给未完成的任务建索引，可以用部分索引', 'T32'),
        c('b8', 'JSON 存进 JSONB 列，再建 GIN 索引，就能按字段查', 'T33'),
        c('b9', '设备预约不能重叠，可以直接写成一条约束', 'T26'),
        c('b10', '冲突的预约，数据库自己就会拒绝', 'T26 T27', { gap: 2.0 }),
        c('b11', '当初让用户自己加类型和索引的设计，延续到了今天', 'H03 T22'),
        c('b13', 'PostGIS 加上了地理空间', 'T24'),
        c('b14', 'pgvector 加上了向量检索', 'T34', { gap: 0.6 }),
        c('b15', 'MySQL 也支持 JSON 和空间数据', 'T35'),
        c('b16', '区别是，PostgreSQL 把扩展接口开放了出来', 'T22 T37'),
        c('b17', '它的许可宽松，由社区维护', 'T25', { gap: 0.6 }),
        c('b18', 'Django 的官方教程，建议正式项目考虑 PostgreSQL', 'T36'),
        c('b19', 'Supabase 这样的服务', 'T36', { gap: 0.22, tts: { zh: 'Supabase 这样的服务，' } }),
        c('b19a', '给每个项目一个完整的 Postgres 数据库', 'T36', { gap: 2.0 }),
        c('b20', '扎实的老底子，加上不断长出来的新能力', 'T37', { gap: 0.22, tts: { zh: '扎实的老底子，加上不断长出来的新能力，' } }),
        c('b20a', '这就是很多人选择它的理由', 'S05 T25 T37', { gap: 1.0 }),
        c('b22', '当然，前面讲的旧版本清理，就是它要付的代价', 'T17 T18'),
        c('b23', '已经在用 MySQL 的项目，换之前要实际测过', 'T37', { gap: 0.7 }),
      ],
    },
    {
      id: 'outro', chap: ['09', { zh: '四个问题' }], lead: 4.3, tail: 0.6,
      cues: [
        c('z1', '回头看，PostgreSQL 这样回答了四个问题', 'T04 T08 T12 T19'),
        c('z2', '数据怎么放：堆里一个个行版本，索引另放', 'T04 T11'),
        c('z3', '怎么找：规划器选路，再判断这个版本能不能读', 'T08 T09'),
        c('z4', '怎么并发：快照决定读哪个版本，写和写排队', 'T12 T13'),
        c('z5', '出错怎么办：先写日志，崩溃后重做', 'T19 T21', { gap: 0.7 }),
        c('z6', '下一集，我们看两个开源巨头之外', 'C04', { gap: 0.22, tts: { zh: '下一集，我们看两个开源巨头之外，' } }),
        c('z6a', '一个更小众的选择，Firebird', 'C04', { gap: 0.8 }),
        ['zCredit', null, { pause: 14.0, gap: 0, credits: true }],
      ],
    },
  ];


  // 仅为候选读法，尚未调用语音；人工确认后逐段试听，不把这些替换当发音验收。
  const SAY = {
    zh: [
      [/MyISAM/g, 'My ISAM'],
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

