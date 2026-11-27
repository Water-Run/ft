/* 分镜第 3 段：片名卡、07 删、08 五个问题、09 旧的 42、片尾名单（09 章按第 4 稿重画）。方向 A「桶阵」。
   画面上的实测数字一律取自 window.DATA（tools/gen_data.py 由 research/lab/ 的回显生成）；
   前几集的说法只取 research/FACTS.md 的 S01、S05、S07、S08（转录各集文案）。 */
(function () {
  const C = SB.C, D = DATA, B = D.buckets;
  const red = { [B.alice]: C.red };
  const label = (x, y, s, style = '') => SB.txt(x, y, s, 'font-size:30px;font-weight:700;color:#d9d9d9;white-space:nowrap;' + style);
  const note = (x, y, s, style = '') => SB.txt(x, y, s, 'white-space:nowrap;' + style, 't-note');
  const PART = SB.ENGINES.map((e, i) => ({ no: i + 1, e }));

  /* ───────── 片名卡 ───────── */
  frame({ id: 't-1', ch: '片名卡', cues: 'oT 前（无旁白）', title: '系列目录走到 PART 7',
    note: '这是「一个数据库引擎是如何实现的？」的第 7 集，也是最后一集：Redis。',
    motion: '左侧目录从 PART 1 起逐项递出，前六项打勾、变暗，选中条一路滑到 PART 7 停住；片名随后从选中条展开。右侧桶阵从全暗淡入，第 3271 号桶最后亮红，延续到 01 章。' }, () => {
    SB.txt(120, 72, '一个数据库引擎是如何实现的？', 'font-size:34px;font-weight:500;color:#b9c2c6;white-space:nowrap');
    SB.txt(120, 124, 'PART 7 · 最终集', `font:600 30px Mono;color:${C.red};letter-spacing:.08em;white-space:nowrap`);
    // 系列目录
    PART.forEach(({ no, e }) => {
      const y = 210 + (no - 1) * 66, cur = no === 7;
      if (cur) SB.box(120, y - 8, 470, 58, `background:${C.dusk};border-left:6px solid ${C.red}`);
      SB.txt(146, y, `PART ${no}`, `font:600 26px Mono;color:${cur ? C.white : C.dusk50};white-space:nowrap`);
      SB.txt(296, y - 4, e, `font-size:34px;font-weight:${cur ? 800 : 500};color:${cur ? C.white : C.dusk50};white-space:nowrap`);
      if (!cur) SB.txt(540, y - 2, '✓', `font-size:30px;color:${C.dusk50}`);
    });
    // 片名
    SB.txt(120, 790, '内存里的键值对：<span style="color:#ff4438">Redis</span>', 'font-size:96px;font-weight:800;letter-spacing:-.02em;white-space:nowrap');
    // 桶阵
    const g = SB.buckets(760, 200, 6, 1.5, { mark: red });
    const [ax, ay] = g.at(B.alice);
    SB.box(ax - 14, ay - 14, 28, 28, `border:3px solid ${C.red}`);
    note(760, 200 + g.hh + 18, `8192 个桶 · 4096 个键 · user:2050 在第 ${B.alice} 号桶`);
    SB.txt(1800 - 300, 900, 'Redis 8.12.0', `font:500 28px Mono;color:${C.dusk50};width:300px;text-align:right`);
  });

  /* ───────── 07 删 ───────── */
  frame({ id: 'g-0', ch: '07 删', cues: '章节卡', title: '章节卡',
    note: '第 07 章：Redis 什么时候忘掉一个键。', motion: '整屏卡从右刷入，停留，向左收走；背后是 06 章留下的桶阵。' }, () => {
    SB.chapter('07', '删', 'Redis 什么时候忘掉一个键？');
  });

  frame({ id: 'g-1', ch: '07 删', cues: 'g1–g3', title: '一个键当场摘掉',
    note: 'DEL 之后 user:2050 从第 3271 号桶里摘掉，键数从 4096 变成 4095，内存当场释放。',
    motion: '左侧桶阵常驻；g2 终端打出 DEL，回复 1；第 3271 号桶由红变暗（桶里只有它一个，桶变空），右侧放大格同步清空；键数 4096 翻成 4095。' }, () => {
    SB.crumb('07 删', 'DEL');
    const emptied = { [B.alice]: SB.SHADE[0] };
    const g = SB.buckets(120, 150, 6, 1.5, { mark: emptied });
    const [ax, ay] = g.at(B.alice);
    SB.box(ax - 14, ay - 14, 28, 28, `border:3px dashed ${C.red}`);
    SB.path(`M${ax + 14} ${ay} C 1110 ${ay}, 1110 300, 1180 300`, C.red, 2, '6 6');
    // 右：放大的那一格
    SB.box(1180, 220, 620, 170, `border:2px solid ${C.dusk70};border-radius:10px`);
    label(1210, 240, `第 ${B.alice} 号桶`, `color:${C.red}`);
    SB.txt(1210, 300, '<s style="color:#8a99a0">user:2050 → name Alice · age 43</s>', 'font:500 28px Mono;white-space:nowrap');
    note(1210, 344, '桶里只有它一个，摘掉后桶空了');
    SB.term(1180, 430, 620, 150, `${SB.prompt}<span class="c">DEL user:2050</span>\n(integer) 1`);
    SB.txt(1180, 620, `<span class="num" style="font-size:96px;color:#8a99a0">${D.expire.dbsize[0]}</span><span style="font-size:60px;color:#5c707a;margin:0 22px">→</span><span class="num" style="font-size:96px">${D.expire.dbsize[1]}</span>`, 'white-space:nowrap');
    note(1180, 744, '键数（DBSIZE）');
    SB.gloss(120, 200 + g.hh + 30, 900, 'DEL', '删除一个键：当场从哈希表里摘掉，它占的内存随即释放（缺省在主线程里同步释放）。');
    SB.sub('这个键当场从哈希表里摘掉，内存随即释放');
  });

  frame({ id: 'g-2', ch: '07 删', cues: 'g4–g6', title: '到期的两条路',
    note: '带寿命的键有两种死法：被访问时发现过期当场删，或被后台定时抽查到。',
    motion: '一个键挂上 2 秒的倒计时；左路一个读请求碰到它，键当场消失；右路一只「抽查」游标扫过一批带寿命的键，过期的逐个熄灭。两路共用同一个桶阵背景。' }, () => {
    SB.crumb('07 删', '过期');
    SB.term(120, 140, 1680, 150, `${SB.prompt}<span class="c">EXPIRE user:2050 2</span>\n(integer) 1      <span class="p"># 2 秒后到期</span>`);
    // 左：被动
    SB.box(120, 340, 800, 520, `border:2px solid ${C.dusk70};border-radius:10px`);
    label(150, 362, '有人来访问时');
    SB.txt(150, 430, '<span style="color:#80dbff">读请求</span>  →  user:2050', 'font:600 34px Mono;white-space:nowrap');
    SB.txt(150, 500, '已过期？  是', 'font:600 34px Mono;white-space:nowrap');
    SB.res(150, 580, '当场删掉，回答「没有这个键」');
    note(150, 680, '只有这一条路的话，没人访问的过期键，');
    note(150, 722, '会一直留在内存里');
    // 右：主动
    SB.box(1000, 340, 800, 520, `border:2px solid ${C.dusk70};border-radius:10px`);
    label(1030, 362, '没人访问的');
    const cells = 20;
    for (let i = 0; i < cells; i++) {
      const x = 1030 + (i % 10) * 72, y = 430 + Math.floor(i / 10) * 72, dead = [2, 7, 11, 16].includes(i);
      SB.box(x, y, 56, 56, `background:${dead ? C.red : C.dusk90};border-radius:4px`);
    }
    SB.path('M1020 410 L 1760 410', C.sky, 3);
    SB.txt(1030, 590, '<span style="color:#80dbff">后台定时抽查</span>：每轮随机挑一批带寿命的键', 'font-size:30px;white-space:nowrap');
    note(1030, 640, '红色是抽到时已经过期的，顺手删掉');
    note(1030, 690, '每轮每个库看 20 个（源码常量）', 'color:#8a99a0');
    SB.sub('没人访问的，后台定时抽查一批');
  });

  frame({ id: 'g-3', ch: '07 删', cues: 'g7–g8', title: '关掉抽查的实验',
    note: '实验里关掉后台抽查，过期的键 2.5 秒后仍占着一个位置；被访问一次才真正消失。',
    motion: '时间轴从 0 走到 2.5 秒，「已过期」标记在 2 秒处出现，键数仍是 4097、expired_keys 仍为 0；随后一次 EXISTS 碰到它，两个数同时翻成 4096 与 1。' }, () => {
    SB.crumb('07 删', '实验：只剩「访问时检查」');
    const ek = D.expire.expiredKeys, ds = D.expire.dbsize;
    // 时间轴
    SB.line(120, 300, 1800, 300, C.dusk70, 3);
    [[0, '0 秒：EXPIRE 2'], [2, '2 秒：已过期'], [2.5, '2.5 秒：还在'], [3.3, 'EXISTS 碰一下']].forEach(([t, s], i) => {
      const x = 160 + t * 420;
      SB.box(x - 8, 292, 16, 16, `background:${i === 3 ? C.sky : (i === 0 ? C.dusk30 : C.red)};border-radius:8px`);
      SB.txt(x - 10, 190 + (i % 2) * 50, s, `font-size:30px;white-space:nowrap;color:${i === 3 ? C.sky : C.dusk10}`);
    });
    // 前后两组数
    const col = (x, title, a, b, hi) => {
      SB.box(x, 400, 760, 400, `border:2px solid ${hi ? C.red : C.dusk70};border-radius:10px`);
      label(x + 30, 424, title);
      SB.txt(x + 30, 500, `<span class="num" style="font-size:110px">${a}</span>`, 'white-space:nowrap');
      note(x + 30, 630, '键数（DBSIZE）');
      SB.txt(x + 420, 500, `<span class="num" style="font-size:110px;color:${hi ? C.red : '#8a99a0'}">${b}</span>`, 'white-space:nowrap');
      note(x + 420, 630, 'expired_keys');
    };
    col(120, '过期 2.5 秒后、没人碰', ds[3], ek[0], false);
    col(1040, 'EXISTS user:2050 之后', ds[4], ek[1], true);
    note(120, 830, '已经过期，但还没人碰它，仍占着一个键');
    note(1040, 830, '被碰到的那一刻才删');
    SB.sub('实验里关掉抽查，过期的键就一直占着位置');
  });

  frame({ id: 'g-4', ch: '07 删', cues: 'g8b–g10', title: '满了：拒绝，或让位',
    note: '内存设了上限又满了：缺省拒绝再写（OOM 报错）；改成 LRU 就挑最久没用的键删掉腾地方。',
    motion: '桶阵上方一条内存用量条涨到上限线；左侧一条写命令撞上上限变红、弹回 OOM；切到右侧，最久没用的一批桶逐个熄灭，写入落进去。桶阵常驻到 08 章。' }, () => {
    SB.crumb('07 删', '内存上限');
    // 用量条
    SB.box(120, 140, 1680, 40, `background:${C.dusk9};border:2px solid ${C.dusk90}`);
    SB.box(122, 142, 1620, 36, `background:${C.dusk70}`);
    SB.line(1742, 120, 1742, 200, C.red, 4);
    SB.txt(1560, 210, 'maxmemory 上限', `font-size:28px;color:${C.red};white-space:nowrap`);
    label(120, 214, '已用内存');
    // 左：noeviction
    SB.box(120, 290, 800, 560, `border:2px solid ${C.red};border-radius:10px`);
    label(150, 312, '缺省：noeviction');
    SB.term(150, 370, 740, 330, `${SB.prompt}<span class="c">HSET user:2050 \\\n  name Alice age 42</span>\n<span class="r">(error) OOM command not\nallowed when used memory\n&gt; 'maxmemory'.</span>`);
    note(150, 730, '写不进去，回一个错误');
    note(150, 774, '读照常可以');
    // 右：allkeys-lru
    SB.box(1000, 290, 800, 560, `border:2px solid ${C.dusk70};border-radius:10px`);
    label(1030, 312, '改成 allkeys-lru');
    SB.buckets(1030, 380, 4, 1, { cols: 128, upto: 128 * 30, color: (i, k) => (k && i % 9 === 0 ? '#0f2530' : SB.SHADE[Math.min(k, 6)]) });
    note(1030, 380 + 30 * 5 + 20, '最久没用的键被挑出来删掉（暗格），新数据写进去');
    SB.txt(1030, 640, '<span style="color:#d9d9d9">HSET</span>  →  (integer) 2', 'font:600 32px Mono;white-space:nowrap');
    note(1030, 704, `这一次为一次写入淘汰了 ${D.evicted} 个键`, 'color:#8a99a0');
    note(1030, 746, '（暗格只示意位置，不是被淘汰的那几个）', 'color:#8a99a0');
    SB.sub('也可以让 Redis 挑最久没用的键删掉，给新数据腾地方');
  });

  /* ───────── 08 五个问题 ───────── */
  frame({ id: 'h-0', ch: '08 五个问题', cues: '章节卡', title: '章节卡',
    note: '第 08 章：五个问题，Redis 怎样回答。', motion: '整屏卡刷入、停留、收走；背后是桶阵。' }, () => {
    SB.chapter('08', '五个问题', '五个问题，Redis 怎样回答？');
  });

  frame({ id: 'h-1', ch: '08 五个问题', cues: 'h1–h7', title: '五个答案，都落在这张表上',
    note: '五个问题的答案逐条出现，每一条都指回桶阵上的同一个对象：放、找、改删、并发、出错。',
    motion: '左侧桶阵常驻；h2–h7 每念一问，右侧对应一行从暗变亮，同时桶阵上演一次那个动作：Alice 那一格亮（放）、一条线从键名直达那一格（找）、一个字节 2a→2b 闪一下（改）、命令一条条排队穿过（并发）、下方磁盘长出快照与日志两块（出错）。前四行亮过后变暗，不抢下一行。' }, () => {
    SB.crumb('08 五个问题', 'Redis 的回答');
    const g = SB.buckets(120, 160, 4, 1, { mark: red });
    const [ax, ay] = g.at(B.alice);
    SB.box(ax - 9, ay - 9, 18, 18, `border:2px solid ${C.red}`);
    // 内存底下的磁盘
    SB.line(120, 160 + g.hh + 30, 760, 160 + g.hh + 30, C.dusk70, 2);
    label(120, 160 + g.hh + 50, '磁盘');
    SB.tag(240, 160 + g.hh + 48, 'dump.rdb', C.dusk, C.white);
    SB.tag(420, 160 + g.hh + 48, 'appendonly.aof', C.dusk, C.white);
    const Q = [
      ['数据怎么放', '一张内存里的哈希表，值挤成紧凑的字节'],
      ['怎么找', '只按键，算一次哈希就到'],
      ['改和删', '原地覆盖，当场删除，或者到期消失'],
      ['怎么并发', '一个线程，一次一条；连着做用 MULTI、WATCH'],
      ['出错怎么办', '快照加命令日志，丢多少看多久落一次盘'],
    ];
    Q.forEach(([q, a], i) => {
      const y = 170 + i * 150, cur = i === 4;
      SB.box(860, y, 940, 126, `background:${cur ? C.dusk : 'transparent'};border-left:6px solid ${cur ? C.red : C.dusk90}`);
      SB.txt(890, y + 14, q, `font-size:30px;font-weight:700;color:${cur ? C.white : C.dusk50};white-space:nowrap`);
      SB.txt(890, y + 60, a, `font-size:34px;color:${cur ? C.white : C.dusk30};white-space:nowrap`);
    });
    SB.sub('出错怎么办：快照加命令日志，丢多少，看多久落一次盘');
  });

  /* ───────── 09 旧的 42 ───────── */
  // 前几集的说法只取 FACTS 的 S07、S09–S13；Redis 磁盘上的两个文件取 DATA.aofLog（P06、P10）
  frame({ id: 'z-0', ch: '09 旧的 42', cues: '章节卡', title: '章节卡',
    note: '最后一章：改掉的 42，去了哪里。', motion: '整屏卡刷入、停留比前几章长半拍；收走后画面先空一拍，再出第一集的终端。' }, () => {
    SB.chapter('09', '旧的 42', '改掉的 42，去了哪里？');
  });

  frame({ id: 'z-1', ch: '09 旧的 42', cues: 'z1–z3', title: '第一集的那一行',
    note: '全系列第一句话原样回来：一条查询，一行结果，零点零零七秒；那一行就是 alice。',
    motion: '全屏空，一行 MySQL 终端逐字打出第一集那条查询（不是 redis-cli 的样子），结果表与「0.007 sec」随 z1 出现；z2 时画面不动、只留问句；z3 时结果表里 alice 那一行亮起，其余压暗。左上角标 PART 1。' }, () => {
    SB.txt(120, 110, 'PART 1 · MyISAM', `font:600 28px Mono;color:${C.dusk50};white-space:nowrap`);
    const tbl = [
      '+----+-------+-----+',
      '| id | name  | age |',
      '+----+-------+-----+',
      `| <span style="color:${C.red}"> 1 | alice | 30 </span>|`,
      '+----+-------+-----+',
    ].join('\n');
    SB.txt(120, 200, `<span style="color:#5c707a">mysql&gt;</span> SELECT * FROM users WHERE name = &#39;alice&#39;;\n${tbl}\n1 row in set (<span style="color:${C.red}">0.007 sec</span>)`, 'font:500 38px/1.45 Mono;color:#d9d9d9;white-space:pre');
    SB.txt(1180, 300, '一条查询<br>一行结果<br><span class="num" style="color:#ff4438">零点零零七秒</span>', 'font-size:80px;font-weight:800;line-height:1.25;white-space:nowrap');
    note(124, 840, '第一集开头：8 行的小表里，alice 30 岁');
    SB.sub('那一次查的，就是 alice');
  });

  frame({ id: 'z-2', ch: '09 旧的 42', cues: 'z4–z6', title: '在 Redis 里，原地改掉一个字节',
    note: '七集里她都过了一次生日；在 Redis 里，那一下是第 3271 号桶里那 27 个字节中的一个：2a 盖成 2b，内存里不留 42。',
    motion: '从 PART 1 的终端横移到 PART 7：桶阵淡入，第 3271 号桶亮红、拉出 27 个字节；z5 时 age 那一格由 2a 翻成 2b；z6 时被盖掉的「2a · 42」从格子上方飘起、散成灰点消失，不留残影。' }, () => {
    SB.crumb('09 旧的 42', 'PART 7 · Redis');
    const g = SB.buckets(120, 150, 6, 1.5, { cols: 128, upto: 128 * 30, mark: red, dim: 0.3 });
    const [ax, ay] = g.at(B.alice);
    SB.box(ax - 12, ay - 12, 24, 24, `border:3px solid ${C.red}`);
    SB.path(`M${ax} ${ay + 14} L ${ax} 560`, C.red, 2);
    const bytes = SB.LP().slice(); bytes[24] = '2b';
    SB.lpRow(120, 600, { size: 46, bytes, hi: [24] });
    SB.txt(120 + 24 * 48 + 30, 510, '<span style="text-decoration:line-through">2a</span> · 42', `font:600 40px Mono;color:${C.dusk50};white-space:nowrap`);
    label(120, 800, '内存里的 42，就这样没了', `color:${C.red}`);
    SB.sub('内存里的 42，就这样没了');
  });

  // 七个引擎，旧的 42 各在哪里（S07、S10–S12；Redis U01）
  const WHERE = [
    ['MyISAM', '原地盖掉', 'ROLLBACK 只回一句警告', 'gone'],
    ['InnoDB', 'undo 里', '撤得回来；Bob 读到的也是它', 'keep'],
    ['PostgreSQL', '旧的那一行', '另写一行 43；Bob 读旧的', 'keep'],
    ['SQLite', '回滚日志里，原样的整页', '进程被杀，抄回去，还是 42', 'keep'],
    ['ClickHouse', '旧片段：一亿个年龄', '整列重写；旧的至少留 8 分钟', 'keep'],
    ['MongoDB', '更新链上，43 后面', 'Bob 的快照读到 42', 'keep'],
    ['Redis', '内存里：没有', '原地 2a → 2b', 'gone'],
  ];
  frame({ id: 'z-3', ch: '09 旧的 42', cues: 'z7–z14', title: '旧的 42，各在哪里',
    note: '七个引擎按 PART 排成七行，每行一个「42」放在它被留下的地方；只有 MyISAM 与 Redis 那一格是空的。',
    motion: '七行常驻、先全暗；随旁白逐行亮起（顺序是 Redis、MyISAM、InnoDB、PostgreSQL 与 MongoDB、ClickHouse、SQLite，不按行序），亮起时那一行的「42」滑进右边的去处；z9 时 InnoDB 一行旁边浮出 Bob 的读箭头，z10 同一支箭头再指向 PostgreSQL、MongoDB 两行；z11 ClickHouse 的格子里铺开一整列细格表示一亿个。MyISAM、Redis 的「42」滑到一半就散掉。' }, () => {
    SB.crumb('09 旧的 42', '七集，七个去处');
    SB.txt(560, 112, '旧的 42 在哪里', 'font-size:28px;color:#8a99a0;white-space:nowrap');
    SB.txt(1240, 112, '留着做什么', 'font-size:28px;color:#8a99a0;white-space:nowrap');
    WHERE.forEach(([e, where, why, kind], i) => {
      const y = 170 + i * 104, gone = kind === 'gone', cur = e === 'Redis';
      SB.line(120, y - 14, 1800, y - 14, C.dusk90, 1);
      SB.txt(120, y + 8, `PART ${i + 1}`, `font:600 24px Mono;color:${cur ? C.red : C.dusk50};white-space:nowrap`);
      SB.txt(270, y, e, `font-size:38px;font-weight:800;color:${cur ? C.red : C.dusk10};white-space:nowrap`);
      SB.txt(560, y - 2, `<span class="byte" style="width:78px;font-size:34px;line-height:54px;background:${gone ? 'transparent' : C.red};color:${gone ? C.dusk50 : C.midnight};border:2px ${gone ? 'dashed ' + C.dusk50 : 'solid ' + C.red}">42</span>`, '');
      SB.txt(670, y + 6, where, `font-size:32px;font-weight:600;color:${gone ? C.dusk50 : C.white};white-space:nowrap`);
      SB.txt(1240, y + 8, why, 'font-size:28px;color:#b9c2c6;white-space:nowrap');
    });
    SB.sub('PostgreSQL 和 MongoDB，也都给他留着 42');
  });

  frame({ id: 'z-4', ch: '09 旧的 42', cues: 'z15–z17', title: '存的都是改之前的样子',
    note: 'undo、旧版本、回滚日志、旧片段：前几集讲过的这些东西，存的都是改之前的样子；留到没人用得着，才清掉。',
    motion: '上一帧右侧的五个「42」向中央聚拢，四个名牌（undo、旧版本、回滚日志、旧片段）落在四周，中间一行字「改之前的样子」；z17 时四个名牌下各亮出它的清理方式，随后中央的「42」熄灭，画面只剩名牌的线稿。' }, () => {
    SB.crumb('09 旧的 42', '改之前的样子');
    const P = [['undo', 'InnoDB', 'purge：没有事务需要了', 240, 170], ['旧版本', 'PostgreSQL · MongoDB', 'PostgreSQL 靠 VACUUM 收走', 1160, 170], ['回滚日志', 'SQLite', '提交时，日志删掉', 240, 640], ['旧片段', 'ClickHouse', '没有查询在用，过了 8 分钟', 1160, 640]];
    P.forEach(([t, who, clean, x, y]) => {
      SB.box(x, y, 520, 210, `border:2px solid ${C.dusk70};border-radius:10px`);
      SB.txt(x + 28, y + 22, t, 'font-size:48px;font-weight:800;white-space:nowrap');
      SB.txt(x + 28, y + 94, who, 'font-size:28px;color:#8a99a0;white-space:nowrap');
      SB.txt(x + 28, y + 146, clean, `font-size:28px;color:${C.sky};white-space:nowrap`);
      SB.line(x + 260, y < 500 ? y + 210 : y, 960, y < 500 ? 450 : 590, C.dusk70, 1, '6 6');
    });
    SB.txt(0, 470, `<div style="text-align:center;width:1920px;font-size:64px;font-weight:800">改之前的样子 <span class="byte" style="width:96px;font-size:48px;line-height:72px;background:${C.red};color:${C.midnight};vertical-align:8px">42</span></div>`, '');
    SB.sub('存的都是改之前的样子');
  });

  const LOG = D.aofLog.cmds.map((c) => c.join(' '));
  const kb = (n) => n.toLocaleString('en-US');
  frame({ id: 'z-5', ch: '09 旧的 42', cues: 'z18–z21', title: '内存里没有了，磁盘上还有',
    note: '她注销以后，第 3271 号桶空了；开着 AOF 的磁盘上，一份快照存在她过生日之前，后面的日志一条条记着她过生日、Dave 注册、她注销。',
    motion: '上半屏是内存：第 3271 号桶的红色熄灭成空格，旁边 EXISTS user:2050 回 0；下半屏淡入 appendonlydir 的两个文件：先是快照（标「她过生日之前存的」），再是日志，三条命令随 z20、z21 逐条打出，最后一条 DEL 停在红色。' }, () => {
    SB.crumb('09 旧的 42', 'PART 7 · Redis 的内存与磁盘');
    label(120, 140, '内存');
    const g = SB.buckets(260, 140, 4, 1.5, { cols: 96, upto: 96 * 36, mark: { [B.alice]: '#0f2530' }, dim: 0.25 });   // 第 3271 号桶在前 3456 个之内
    const [ax, ay] = g.at(B.alice);
    SB.box(ax - 12, ay - 12, 24, 24, `border:3px dashed ${C.red}`);
    SB.term(1060, 140, 740, 150, `${SB.prompt}<span class="c">EXISTS user:2050</span>\n<span class="p">(integer) 0</span>`);
    SB.line(120, 360, 1800, 360, C.dusk90, 2);
    label(120, 390, '磁盘 · appendonlydir/');
    SB.box(120, 450, 700, 400, `background:${C.dusk9};border:2px solid ${C.dusk70};border-radius:10px`);
    SB.txt(150, 472, 'appendonly.aof.1.base.rdb', 'font:600 30px Mono;white-space:nowrap');
    SB.txt(150, 520, `快照 · ${kb(D.aofLog.base)} 字节`, 'font-size:28px;color:#b9c2c6;white-space:nowrap');
    SB.txt(150, 570, '她过生日之前存的', `font-size:30px;color:${C.sky};white-space:nowrap`);
    SB.txt(150, 680, `user:2050 · Alice · <span class="byte" style="width:78px;font-size:34px;line-height:54px;background:${C.red};color:${C.midnight}">42</span>`, 'font:500 34px Mono;white-space:nowrap');
    SB.box(880, 450, 920, 400, `background:${C.dusk9};border:2px solid ${C.dusk70};border-radius:10px`);
    SB.txt(910, 472, 'appendonly.aof.1.incr.aof', 'font:600 30px Mono;white-space:nowrap');
    SB.txt(910, 520, '日志 · 之后的写命令，一条一条', 'font-size:28px;color:#b9c2c6;white-space:nowrap');
    LOG.forEach((l, i) => SB.txt(910, 600 + i * 70, l, `font:500 34px Mono;color:${i === LOG.length - 1 ? C.red : '#d9d9d9'};white-space:nowrap`));
    SB.sub('最后一条，是她注销');
  });

  frame({ id: 'z-6', ch: '09 旧的 42', cues: 'z22–z23', title: '那份快照里，她还是 42 岁',
    note: '重启时从快照开始，把日志一条条再做一遍；画面最后停在快照里的她：42 岁。',
    motion: 'z22：一个读头从快照出发，依次扫过三条日志，上半屏的内存随之变化（2050 号变 43、4097 号 Dave 出现、2050 号消失），一遍做完；z23：镜头退回快照文件，其余全部压暗，只剩「Alice · 42」那一格亮着；配乐在这里收住，停两拍后接片尾。' }, () => {
    SB.buckets(128, 100, 11, 2, { dim: 0.85 });   // 128 × 13 = 1664 宽，左右各留 128
    SB.txt(0, 360, `<div style="text-align:center;width:1920px;font:500 40px Mono;color:#8a99a0">appendonly.aof.1.base.rdb</div>`, '');
    SB.txt(0, 450, `<div style="text-align:center;width:1920px;font:500 64px Mono">user:2050 · Alice · <span class="byte" style="width:120px;font-size:64px;line-height:100px;background:${C.red};color:${C.midnight}">42</span></div>`, '');
    SB.sub('那份快照里，她还是 42 岁');
  });

  /* ───────── 片尾名单（无旁白） ───────── */
  // 名单取自 videos/database-engines/redis/project.json 的 credits（2026-11-25 读取）；正式片由场景代码在运行时读，这里写死只为关键帧
  frame({ id: 'cr-1', ch: '片尾', cues: 'credits（无旁白）', title: 'LRANGE credits 0 -1',
    note: '片尾用一条 Redis 命令列出全部贡献，末尾给出行数；不配旁白。',
    motion: '终端里逐字打出命令，结果逐行出现，每行一拍；最后打出行数与下一个提示符，光标闪三下（按时刻算，不用定时器）后淡出。' }, () => {
    const rows = [
      '策划：WaterRun',
      'Claude Opus 5.5：取证、实验、文案、配音试听、配乐小样、视觉设计',
      'MiniMax speech-2.8-hd：配音试听',
      '许可：GPL-3.0-or-later',
      '开源视频：github.com/Water-Run/ft',
    ];
    const lines = rows.map((r, i) => `${i + 1}) "<span class="v">${r}</span>"`).join('\n');
    SB.term(120, 160, 1680, 640, `${SB.prompt}<span class="c">LRANGE credits 0 -1</span>\n${lines}\n<span class="p">(${rows.length} 项)</span>\n${SB.prompt}<span class="c">▌</span>`);
    note(120, 840, '名单取自本片 project.json 的 credits，交付前按实际参与者更新', 'color:#8a99a0');
  });
})();
