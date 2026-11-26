/* 分镜第 3 段：片名卡、07 删、08 五个问题、09 一瞬间、片尾名单（第 3 稿）。方向 A「桶阵」。
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
    note: '第 07 章：内存满了，谁让出位置。', motion: '整屏卡从右刷入，停留，向左收走；背后是 06 章留下的桶阵。' }, () => {
    SB.chapter('07', '删', '内存满了，谁让出位置？');
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

  frame({ id: 'g-4', ch: '07 删', cues: 'g9–g10', title: '满了：拒绝，或让位',
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

  /* ───────── 09 一瞬间 ───────── */
  frame({ id: 'z-0', ch: '09 一瞬间', cues: '章节卡', title: '章节卡',
    note: '最后一章：那一瞬间，数据库做了什么。', motion: '整屏卡刷入、停留时间比前几章长半拍，收走后画面先空一拍。' }, () => {
    SB.chapter('09', '一瞬间', '那一瞬间，数据库做了什么？');
  });

  frame({ id: 'z-1', ch: '09 一瞬间', cues: 'z1–z3', title: '第一集的那一瞬间',
    note: '系列从第一集的一条查询开始：一行结果，零点零零七秒，这一瞬间数据库在磁盘上做了什么。',
    motion: '全屏空，只有一行终端逐字打出第一集那条查询的回显（MySQL 的样子，不是 redis-cli）；「0.007 sec」停住、放大到中央；左上角标 PART 1。' }, () => {
    SB.txt(120, 120, 'PART 1 · MyISAM', `font:600 28px Mono;color:${C.dusk50};white-space:nowrap`);
    SB.txt(120, 300, '<span style="color:#5c707a">mysql&gt;</span> SELECT * FROM users WHERE name = &#39;alice&#39;;', 'font:500 40px Mono;color:#d9d9d9;white-space:nowrap');
    SB.txt(120, 370, '1 row in set (<span style="color:#ff4438">0.007 sec</span>)', 'font:500 40px Mono;color:#d9d9d9;white-space:nowrap');
    SB.txt(120, 540, '一条查询，一行结果', 'font-size:88px;font-weight:800;white-space:nowrap');
    SB.txt(120, 660, '<span class="num" style="color:#ff4438">零点零零七秒</span>', 'font-size:88px;font-weight:800;white-space:nowrap');
    note(124, 800, '第一集开头的那一句');
    SB.sub('这一瞬间，数据库在磁盘上做了什么');
  });

  const SEVEN = [
    ['MyISAM', '把数据一行行排在文件里，用 B 树记下每一行的位置'],
    ['InnoDB', '整张表是一棵树，改之前先记下旧值'],
    ['PostgreSQL', '从不覆盖，每改一次，写一个新版本'],
    ['SQLite', '整个数据库装进一个文件，嵌进程序里'],
    ['ClickHouse', '拆成一列一列，只读用得到的那一列'],
    ['MongoDB', '不要表，整份文档存进 B 树'],
    ['Redis', '绕开磁盘，把一切放进内存'],
  ];
  frame({ id: 'z-2', ch: '09 一瞬间', cues: 'z4–z11', title: '七种回答',
    note: '七个引擎各用一句话说出自己的做法，从 PART 1 一路亮到 PART 7。',
    motion: '七行自上而下随旁白逐行亮起：每行亮时为白，下一行亮起后退成灰；Redis 一行最后亮红并留住，其右端一格桶阵小图淡入，带进下一帧。' }, () => {
    SB.crumb('09 一瞬间', '七集，七种回答');
    SEVEN.forEach(([e, s], i) => {
      const y = 150 + i * 106, cur = i === 6;
      SB.line(120, y - 18, 1800, y - 18, C.dusk90, 1);
      SB.txt(120, y + 8, `PART ${i + 1}`, `font:600 24px Mono;color:${cur ? C.red : C.dusk50};white-space:nowrap`);
      SB.txt(280, y, e, `font-size:40px;font-weight:800;color:${cur ? C.red : C.dusk30};white-space:nowrap`);
      SB.txt(620, y + 4, s, `font-size:34px;color:${cur ? C.white : C.dusk50};white-space:nowrap`);
    });
    SB.sub('Redis 绕开磁盘，把一切放进内存');
  });

  frame({ id: 'z-3', ch: '09 一瞬间', cues: 'z12–z16', title: '同一对难处',
    note: '页、树、缓存和日志大多在对付同一对难处：磁盘记得住但慢，内存快可是会忘。',
    motion: '画面一分为二：左「磁盘 · 记得住，但是慢」，右「内存 · 快，可是会忘」；中间一条横轴。z15 时「页、树、缓存」三个标签从左向右推，标「少读几次磁盘」；z16 时「日志」从右向左推，标「先记一笔，断电后回到对的样子」。' }, () => {
    SB.crumb('09 一瞬间', '页、树、缓存、日志');
    SB.box(120, 160, 800, 300, `background:${C.dusk};border-radius:10px`);
    SB.txt(160, 190, '磁盘', 'font-size:72px;font-weight:800;white-space:nowrap');
    SB.txt(160, 300, '记得住，但是慢', 'font-size:44px;color:#d9d9d9;white-space:nowrap');
    SB.box(1000, 160, 800, 300, `border:2px solid ${C.red};border-radius:10px`);
    SB.txt(1040, 190, '内存', `font-size:72px;font-weight:800;color:${C.red};white-space:nowrap`);
    SB.txt(1040, 300, '快，可是会忘', 'font-size:44px;color:#d9d9d9;white-space:nowrap');
    // 两种办法
    SB.line(120, 620, 1800, 620, C.dusk70, 3);
    ['页', '树', '缓存'].forEach((t, i) => SB.tag(140 + i * 130, 560, t, C.dusk90, C.white));
    SB.path('M560 584 L 860 584', C.sky, 3); SB.path('M846 574 L 862 584 L 846 594', C.sky, 3);
    SB.txt(140, 650, '少读几次磁盘，就快一点', `font-size:34px;color:${C.sky};white-space:nowrap`);
    SB.tag(1640, 560, '日志', C.dusk90, C.white);
    SB.path('M1620 584 L 1320 584', C.yellow, 3); SB.path('M1334 574 L 1318 584 L 1334 594', C.yellow, 3);
    SB.txt(1000, 650, '改之前先记一笔，断电之后回到对的样子', `font-size:34px;color:${C.yellow};white-space:nowrap`);
    note(140, 760, '前几集的做法，大多在对付这一对难处');
    SB.sub('磁盘记得住，但是慢；内存快，可是会忘');
  });

  frame({ id: 'z-4', ch: '09 一瞬间', cues: 'z17–z19', title: '各自停在不同的地方',
    note: '七个引擎在「快」与「记得住」之间各取一处：六个以磁盘为家、用缓存求快；Redis 以内存为家、用快照和日志求记得住。',
    motion: '横轴两端是「数据住在磁盘」与「数据住在内存」，没有刻度；七个引擎的名牌依次落下，各带一行自己的手段。前六个落在磁盘一侧（按出场顺序排，不表示快慢），Redis 落在内存一侧，随后从它身上拉回一条虚线指向磁盘端，标「快照 + 日志」。' }, () => {
    SB.crumb('09 一瞬间', '快，和记得住');
    SB.line(120, 520, 1800, 520, C.dusk70, 3);
    SB.txt(120, 548, '数据住在磁盘上', 'font-size:32px;font-weight:700;color:#d9d9d9;white-space:nowrap');
    SB.txt(1800 - 300, 548, '数据住在内存里', `font-size:32px;font-weight:700;color:${C.red};white-space:nowrap;width:300px;text-align:right`);
    const DEV = [['MyISAM', '键缓存'], ['InnoDB', '缓冲池 + redo'], ['PostgreSQL', '新版本 + WAL'], ['SQLite', '回滚日志'], ['ClickHouse', '只读要的列'], ['MongoDB', '缓存 + 检查点']];
    DEV.forEach(([e, d], i) => {
      const x = 120 + i * 175, y = i % 2 ? 330 : 190;
      SB.box(x, y, 165, 120, `background:${C.dusk};border-radius:8px`);
      SB.txt(x + 14, y + 14, e, `font-size:${e.length > 7 ? 26 : 30}px;font-weight:800;white-space:nowrap`);
      SB.txt(x + 14, y + 66, d, 'font-size:26px;color:#b9c2c6;white-space:nowrap');
      SB.line(x + 80, y + 120, x + 80, 510, C.dusk70, 1);
    });
    SB.box(1530, 190, 270, 150, `background:${C.red};border-radius:8px`);
    SB.txt(1554, 206, 'Redis', `font-size:40px;font-weight:800;color:${C.midnight};white-space:nowrap`);
    SB.txt(1554, 270, '哈希表在内存', `font-size:28px;color:${C.midnight};white-space:nowrap`);
    SB.line(1665, 340, 1665, 510, C.red, 2);
    SB.path('M1640 600 C 1200 760, 500 760, 260 600', C.red, 2, '8 8');
    SB.txt(820, 710, '为了记得住，回到磁盘：快照 + 日志', `font-size:32px;color:${C.red};white-space:nowrap`);
    note(120, 840, '前六个按出场顺序排在左边，位置不表示快慢');
    SB.sub('七个引擎，在快和记得住之间，各自停在了不同的地方');
  });

  frame({ id: 'z-5', ch: '09 一瞬间', cues: 'z20–z22', title: '一个字节，七个地方',
    note: 'Alice 的年龄只是一个字节：七集里它在文件里、在树的叶子上、在一列数字里，这一次在内存的一个桶里。',
    motion: '中央一个字节「2b」常驻；它依次被放进四种容器的剪影：一排定长行（MyISAM、SQLite 的文件）、一棵树的叶子（InnoDB、MongoDB）、一列数字（ClickHouse）、最后一个桶；每换一种，上一种退成线稿留在左边。末了只剩桶，桶阵从这一格向外淡出整张表。' }, () => {
    SB.crumb('09 一瞬间', 'Alice 的年龄');
    const slots = [
      ['在文件里', 'MyISAM · SQLite', (x, y) => { for (let i = 0; i < 4; i++) SB.box(x, y + i * 34, 300, 26, `background:${i === 2 ? C.dusk70 : C.dusk90}`); }],
      ['在树的叶子上', 'InnoDB · MongoDB', (x, y) => { SB.box(x + 120, y, 60, 26, `background:${C.dusk90}`); [0, 1, 2, 3].forEach((i) => { SB.box(x + i * 80, y + 100, 60, 26, `background:${i === 2 ? C.dusk70 : C.dusk90}`); SB.line(x + 150, y + 26, x + i * 80 + 30, y + 100, C.dusk70, 1); }); }],
      ['在一列数字里', 'ClickHouse', (x, y) => { for (let i = 0; i < 5; i++) SB.box(x + 110, y + i * 26, 80, 20, `background:${i === 3 ? C.dusk70 : C.dusk90}`); }],
      ['在内存的一个桶里', 'Redis', (x, y) => { SB.buckets(x, y, 6, 2, { cols: 38, upto: 38 * 16, mark: { [B.alice % (38 * 16)]: C.red } }); }],
    ];
    slots.forEach(([t, who, draw], i) => {
      const x = 120 + i * 430, y = 220, cur = i === 3;
      SB.box(x - 10, y - 30, 400, 420, `border:2px solid ${cur ? C.red : C.dusk90};border-radius:10px`);
      draw(x + 40, y + 20);
      SB.txt(x + 10, y + 260, t, `font-size:34px;font-weight:700;color:${cur ? C.red : C.dusk10};white-space:nowrap`);
      SB.txt(x + 10, y + 316, who, 'font-size:28px;color:#8a99a0;white-space:nowrap');
    });
    SB.txt(120, 700, '<span style="font-size:72px;font-weight:800">Alice 的年龄，只是一个字节</span>', 'white-space:nowrap');
    SB.txt(1450, 694, '<span class="byte" style="width:120px;font-size:64px;line-height:100px;background:#ff4438;color:#091a23">2b</span>', '');
    note(120, 820, '第一集的例子是 alice 30 岁（8 行的小表）；之后各集是 2050 号 Alice，42 岁', 'color:#8a99a0');
    SB.sub('这一次，在内存的一个桶里');
  });

  frame({ id: 'z-6', ch: '09 一瞬间', cues: 'z23–z25', title: '一个数据库引擎是如何实现的？',
    note: '系列的问题落到这一个字节上：放在哪里、怎样找到、怎样改、很多人同时要它怎么办、断电后怎样找回。',
    motion: '中央只剩那个红色字节；系列片名的问句在它上方淡入；五个短语围着字节依次亮起（放、找、改、同时、找回），每亮一个，从字节拉出一根细线；配乐此处到最高处。' }, () => {
    SB.txt(0, 170, '<div style="text-align:center;width:1920px;font-size:84px;font-weight:800">一个数据库引擎是如何实现的？</div>', '');
    SB.txt(900, 500, '<span class="byte" style="width:120px;font-size:64px;line-height:100px;background:#ff4438;color:#091a23">2b</span>', '');
    const W = [['放在哪里', 480, 380], ['怎样找到它', 1180, 380], ['怎样改它', 420, 640], ['很多人同时要它', 1180, 640], ['断了电，怎样找回来', 760, 800]];
    W.forEach(([t, x, y]) => { SB.line(960, 550, x + 120, y + 24, C.dusk70, 1); SB.txt(x, y, t, `font-size:40px;font-weight:600;color:#d9d9d9;white-space:nowrap;background:${C.midnight};padding:0 12px`); });
    SB.sub('就是决定这一个字节放在哪里，怎样找到它，怎样改它');
  });

  frame({ id: 'z-7', ch: '09 一瞬间', cues: 'z26–z27', title: '眨眼之间',
    note: '下一次一条查询在眨眼间返回，这些事都已经在那一瞬间里发生过了。',
    motion: '镜头不动：那个字节缩回第 3271 号桶，桶阵从这一格向四周亮开成整张 8192 格的表，再整体压暗到只剩极淡的纹理；中央留大片空白，一行字慢慢淡入、停住，配乐收在大三和弦上，之后切片尾。' }, () => {
    SB.buckets(120, 140, 13, 2, { dim: 0.82, mark: red });
    SB.txt(0, 420, '<div style="text-align:center;width:1920px;font-size:60px;font-weight:700;line-height:1.6">下一次，一条查询在眨眼间返回<br><span style="color:#b9c2c6">这些事，都已经在那一瞬间里发生过了</span></div>', '');
    SB.sub('这些事，都已经在那一瞬间里发生过了');
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
