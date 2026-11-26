/* 分镜第 1 段：开场、01 一张哈希表、02 增、03 查（第 3 稿）。方向 A「桶阵」。
   画面上的实测数字一律取自 window.DATA（tools/gen_data.py 由 research/lab/ 的回显生成）。 */
(function () {
  const C = SB.C, D = DATA, B = D.buckets;
  const LP = () => SB.LP();
  const median = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const us = median(D.hgetallUs);
  const pct = (n) => Math.round(n * 100 / B.size);
  const fmt = (n) => n.toLocaleString('en-US');
  const red = { [B.alice]: C.red };
  const label = (x, y, s, style = '') => SB.txt(x, y, s, 'font-size:30px;font-weight:700;color:#d9d9d9;white-space:nowrap;' + style);
  const note = (x, y, s, style = '') => SB.txt(x, y, s, 'white-space:nowrap;' + style, 't-note');
  const tagAt = (x, y, s) => SB.tag(x, y, s, C.red, C.midnight);

  /* ───────── 开场 ───────── */
  frame({ id: 'o-1', ch: '开场', cues: 'o1–o4', title: '五微秒，没碰磁盘',
    note: '一条命令拿回 Alice，服务端只用了约 5 微秒；她的资料就在内存里，磁盘这一次没被读。',
    motion: '终端里打出命令、逐行出回复；右侧「5 微秒」随 o2 砸入；o3 时磁盘一格压暗、标「没有读」，o4 时引线从回复连到内存里 Alice 所在的那一格。内存这块与它里面的桶阵留到下一帧。' }, () => {
    SB.term(120, 150, 1000, 312, `${SB.prompt}<span class="c">HGETALL user:2050</span>\n1) "name"\n2) "<span class="v">Alice</span>"\n3) "age"\n4) "<span class="v">42</span>"`);
    SB.txt(1220, 150, `<span class="num" style="font-size:150px;color:${C.red}">${us}</span><span style="font-size:56px;font-weight:700;margin-left:16px">微秒</span>`, 'white-space:nowrap');
    note(1224, 330, '服务端执行这一条命令');
    note(1224, 378, `5 次实测：${D.hgetallUs.join('、')} 微秒`, `color:${C.dusk50}`);
    // 内存与磁盘
    SB.box(120, 520, 1000, 400, `border:2px solid ${C.dusk70};border-radius:10px`);
    label(150, 540, '内存');
    const g = SB.buckets(150, 590, 4, 1, { mark: red });
    const [ax, ay] = g.at(B.alice);
    SB.box(ax - 8, ay - 8, 16, 16, `border:2px solid ${C.red}`);
    SB.path(`M${ax + 8} ${ay} L 840 ${ay}`, C.red, 2);
    tagAt(850, ay - 22, 'user:2050');
    SB.box(1220, 520, 580, 400, `border:2px dashed ${C.dusk90};border-radius:10px`);
    label(1250, 540, '磁盘', `color:${C.dusk50}`);
    note(1250, 700, '这一条命令，没有读它', `color:${C.dusk50}`);
    SB.sub('这五微秒里，它一次也没有碰磁盘');
  });

  frame({ id: 'o-2', ch: '开场', cues: 'o5–o6', title: '快而会忘，慢而记得',
    note: '同一份数据：放在内存里，断电后整片清空；写在磁盘上，断电后一个字节不少。',
    motion: '上一帧的内存块缩到左半边，右边亮起磁盘上的一段真实字节（dump.rdb 里 Alice 那一项）；o5 时左下一行在「断电」处整片熄灭；o6 时右下一行原样复制下来。' }, () => {
    label(120, 120, '内存');
    SB.tag(240, 116, '快', C.red, C.midnight);
    label(1020, 120, '磁盘');
    SB.tag(1140, 116, '慢', C.dusk90, '#fff');
    SB.line(960, 120, 960, 900, C.dusk90, 2);
    SB.txt(120, 200, '通电时', 'width:200px', 't-small');
    SB.txt(120, 560, '断电之后', 'width:200px', 't-small');
    SB.txt(1020, 200, '通电时', 'width:200px', 't-small');
    SB.txt(1020, 560, '断电之后', 'width:200px', 't-small');
    SB.buckets(120, 260, 3, 1, { mark: red });
    SB.buckets(120, 620, 3, 1, { empty: true });
    SB.txt(680, 720, '没了', `font-size:48px;font-weight:800;color:${C.red}`);
    const hex = D.rdbEntry.hex.match(/../g);
    const rows = (y) => { for (let r = 0; r < 3; r++) SB.txt(1020, y + r * 50, hex.slice(r * 13, r * 13 + 13).join(' '), 'font:500 30px Mono;color:#d9d9d9;white-space:pre'); };
    rows(260); rows(620);
    note(1020, 420, 'dump.rdb 里 Alice 那一项（真实字节）', `color:${C.dusk50}`);
    SB.txt(1020, 800, '还在', 'font-size:48px;font-weight:800;color:#fff');
    SB.sub('内存很快，可是一断电，里面的东西就没了');
  });

  frame({ id: 'o-3', ch: '开场', cues: 'o7–o10', title: '前六集与 Redis：数据住在哪一层',
    note: '前六集的数据住在磁盘那一层，内存里多半只放一份缓存；Redis 反过来，数据住在内存，磁盘上只放重启时用来找回的文件。',
    motion: '七列从左到右依次立起，前六列先在磁盘层填实、再在内存层画出缓存框；o9 时第七列 Redis 的实块从磁盘层「升」到内存层，磁盘层只留一个虚框。' }, () => {
    const X0 = 300, W = 200, G = 10;
    SB.box(120, 220, 1680, 230, `background:${C.dusk9}`);
    SB.box(120, 520, 1680, 230, `background:${C.dusk}`);
    label(140, 310, '内存');
    label(140, 610, '磁盘');
    // 缓存的叫法取自各集（FACTS S08）；ClickHouse 一集没有讲它的缓存，不画
    const CACHE = ['键缓存', '缓冲池', '页缓存', '页缓存', '', '缓存'];
    SB.ENGINES.forEach((e, i) => {
      const x = X0 + i * (W + G), last = i === 6;
      SB.txt(x, 160, e, `width:${W}px;text-align:center;font-size:${e.length > 8 ? 28 : 30}px;font-weight:700;color:${last ? C.red : '#fff'};white-space:nowrap`);
      if (!last) {
        SB.box(x + 10, 560, W - 20, 150, `background:${C.dusk70};border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:700`, '数据');
        if (CACHE[i]) SB.box(x + 40, 290, W - 80, 90, `border:2px solid ${C.dusk50};border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#d9d9d9`, CACHE[i]);
      } else {
        SB.box(x + 10, 250, W - 20, 170, `background:${C.red};color:${C.midnight};border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:800`, '数据');
        SB.box(x + 10, 560, W - 20, 150, `border:2px dashed ${C.red};border-radius:6px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:28px;line-height:1.35;color:#d9d9d9`, '重启时<br>读回的文件');
      }
    });
    note(120, 800, '前六集：数据在磁盘上，内存里多半放一份缓存，为了少读几次磁盘。');
    note(120, 850, 'Redis：数据整个在内存里，磁盘上的文件只用来在重启之后找回。', 'color:#fff');
    SB.sub('Redis 反过来，把数据整个放在内存里');
  });

  frame({ id: 'o-4', ch: '开场', cues: 'o11–o15', title: '远程字典服务',
    note: '名字取自 REmote DIctionary Server；字典就是一个键对应一个值，所以 Redis 是键值数据库。',
    motion: '三个英文词逐个打出，RE、DI、S 三段变红后向中间收拢成 Redis；o12 时下方画出一个键指向一个值；o13 时注解从左侧红线处展开；o14–o15 底部一行年份与作者淡入。' }, () => {
    SB.txt(120, 170, `<span style="color:${C.red}">RE</span>mote <span style="color:${C.red}">DI</span>ctionary <span style="color:${C.red}">S</span>erver`, 'white-space:nowrap', 't-big');
    SB.txt(124, 290, '远程字典服务', 'font-size:44px;color:#d9d9d9');
    // 一个键 → 一个值
    SB.box(120, 420, 420, 110, `border:3px solid ${C.red};border-radius:8px;display:flex;align-items:center;justify-content:center;font:600 44px Mono`, 'user:2050');
    SB.txt(130, 540, '键', '', 't-small');
    SB.path('M560 475 L 700 475', '#fff', 3);
    SB.path('M686 463 L 702 475 L 686 487', '#fff', 3);
    SB.box(720, 420, 520, 110, `background:${C.dusk};border:2px solid ${C.dusk70};border-radius:8px;display:flex;align-items:center;justify-content:center;font:600 40px Mono`, 'name Alice · age 42');
    SB.txt(730, 540, '值', '', 't-small');
    SB.gloss(1310, 410, 490, '键值数据库', '按一个键存取一个值的数据库，不按表、行、列来组织数据。');
    note(120, 660, '2009 年，Salvatore Sanfilippo 为撑住自己的实时日志分析工具 LLOOGG 写了它');
    SB.sub('Redis 是一个键值数据库');
  });

  frame({ id: 'o-5', ch: '开场', cues: 'o16–o18', title: '换来了快，欠下两笔账',
    note: '数据放进内存换来了快，也带来两个问题：会忘、装不下；全片从 Alice 这一个键讲起。',
    motion: '桶阵回到画面中央；o16 时 Alice 那一格亮红；o17 两侧依次挂出「会忘」「装不下」两块，标出后面在哪一章还账；o18 镜头推向第 3271 号桶，直接接 01 章节卡。' }, () => {
    const g = SB.buckets(480, 200, 6, 1.5, { mark: red });
    const [ax, ay] = g.at(B.alice);
    SB.box(ax - 12, ay - 12, 24, 24, `border:3px solid ${C.red}`);
    SB.path(`M${ax} ${ay - 14} L ${ax} 150`, C.red, 2);
    tagAt(ax - 75, 104, 'user:2050');
    label(120, 104, '内存里的 4096 个键');
    // 两笔账
    SB.box(120, 760, 760, 150, `border:2px solid ${C.dusk70};border-radius:10px`);
    SB.txt(150, 780, '会忘', 'font-size:44px;font-weight:800');
    note(150, 845, '断电、进程结束，内存就清空 → 06 出错怎么办');
    SB.box(1040, 760, 760, 150, `border:2px solid ${C.dusk70};border-radius:10px`);
    SB.txt(1070, 780, '装不下', 'font-size:44px;font-weight:800');
    note(1070, 845, '内存有上限，满了总要有人让位 → 07 删');
    SB.sub('Redis 怎样应付这些，要从 Alice 这一个键说起');
  });

  /* ───────── 01 一张哈希表 ───────── */
  frame({ id: 'a-0', ch: '01 一张哈希表', cues: '章节卡', title: '章节卡',
    note: '第 01 章：不用迁就磁盘，数据怎样放。', motion: '整屏卡从右刷入，停留，向左收走；收走时露出已在背后的桶阵。' }, () => {
    SB.chapter('01', '一张哈希表', '不用迁就磁盘，数据怎样放？');
  });

  frame({ id: 'a-1', ch: '01 一张哈希表', cues: 'a1–a2', title: '一层层往下，还是一次算到',
    note: 'B 树为少读磁盘页而一层层缩小范围；数据在内存里，按键找值可以一次算到位置。',
    motion: '左侧 B 树从根到叶逐层亮起，每层亮一页并记一次「读一页」；o2 时右侧键名经一次计算直接落进一格，对比两条路径的步数。右侧的桶阵延续到下一帧。' }, () => {
    SB.crumb('01 一张哈希表', '前几集的找法');
    label(120, 140, '前几集：B 树');
    // 三层树：根 1 页 → 4 页 → 16 页（示意的形状，不是实测页数）
    const lv = [[1, 160], [4, 360], [10, 560]];
    const pos = [];
    lv.forEach(([n, y], li) => {
      const w = li === 2 ? 52 : 90, gap = li === 2 ? 14 : 40, tw = n * w + (n - 1) * gap, x0 = 120 + (760 - tw) / 2;
      pos[li] = [];
      for (let i = 0; i < n; i++) { const x = x0 + i * (w + gap), on = (li === 0) || (li === 1 && i === 2) || (li === 2 && i === 6); SB.box(x, y + 40, w, 60, `border:2px solid ${on ? C.red : C.dusk70};background:${on ? C.redDeep : 'transparent'};border-radius:4px`); pos[li].push([x + w / 2, y + 40, y + 100]); }
    });
    SB.path(`M${pos[0][0][0]} ${pos[0][0][2]} L ${pos[1][2][0]} ${pos[1][2][1]}`, C.red, 3);
    SB.path(`M${pos[1][2][0]} ${pos[1][2][2]} L ${pos[2][6][0]} ${pos[2][6][1]}`, C.red, 3);
    [['读一页', 0], ['再读一页', 1], ['再读一页', 2]].forEach(([s, li]) => note(890 - 20, lv[li][1] + 52, s, `color:${C.red}`));
    note(120, 720, '每往下一层，范围缩小一截；为的是少读几页磁盘', 'white-space:normal;width:800px');
    SB.line(1000, 140, 1000, 900, C.dusk90, 2);
    label(1060, 140, '数据在内存里：一张哈希表');
    SB.box(1060, 220, 300, 80, `border:3px solid ${C.red};border-radius:8px;display:flex;align-items:center;justify-content:center;font:600 36px Mono`, 'user:2050');
    SB.path('M1380 260 L 1500 260', '#fff', 3); SB.path('M1486 248 L 1502 260 L 1486 272', '#fff', 3);
    SB.box(1520, 220, 280, 80, `background:${C.dusk};border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:30px`, '算一次');
    const g = SB.buckets(1060, 380, 3, 2.5, { mark: red, cols: 128 });
    const [ax, ay] = g.at(B.alice);
    SB.path(`M1660 300 L 1660 340 L ${ax} 340 L ${ax} ${ay - 6}`, C.red, 3);
    SB.box(ax - 9, ay - 9, 18, 18, `border:2px solid ${C.red}`);
    note(1060, 760, '一次算到一个格子，不用一层层往下', 'white-space:normal;width:740px');
    SB.sub('数据在内存里，按键找一个值，可以更直接');
  });

  frame({ id: 'a-2', ch: '01 一张哈希表', cues: 'a4–a10', title: '键 → 哈希值 → 桶',
    note: 'user:2050 算成一个 64 位的哈希值，取它的低位得到桶号 3271；找的时候再算一遍，直接去这一格。',
    motion: '左侧一列键名滚动出现，user:2050 停住变红；中间一条计算链逐格点亮；箭头落进右侧第 3271 号桶。a6 时哈希表的注解展开。' }, () => {
    SB.crumb('01 一张哈希表', '一个键落进哪个桶');
    const keys = ['user:1', 'user:2', 'user:3', '……', 'user:2049', 'user:2050', 'user:2051', '……', `user:${B.size / 2}`];
    keys.forEach((k, i) => SB.txt(120, 170 + i * 56, k, `font:500 32px Mono;color:${k === 'user:2050' ? C.red : (k === '……' ? C.dusk50 : '#d9d9d9')};white-space:nowrap`));
    note(120, 690, `${fmt(B.size / 2)} 个用户，每人一个键`, `color:${C.dusk50}`);
    const bits = Math.log2(B.size);
    const steps = [['user:2050', 'border:3px solid ' + C.red], ['SipHash', `background:${C.dusk}`], ['64 位哈希值', `background:${C.dusk}`], [`取低 ${bits} 位`, `background:${C.dusk}`], [`第 ${B.alice} 号桶`, `background:${C.red};color:${C.midnight};font-weight:800`]];
    steps.forEach(([s, st], i) => {
      const y = 170 + i * 104;
      SB.box(470, y, 300, 70, `${st};border-radius:8px;display:flex;align-items:center;justify-content:center;font:600 30px Mono, 'Sans SC'`, s);
      if (i < steps.length - 1) { SB.line(620, y + 70, 620, y + 104, '#fff', 3); }
    });
    const g = SB.buckets(970, 170, 5, 1.5, { mark: red });
    const [ax, ay] = g.at(B.alice);
    SB.box(ax - 10, ay - 10, 20, 20, `border:3px solid ${C.red}`);
    SB.path(`M770 ${170 + 4 * 104 + 35} C 880 ${170 + 4 * 104 + 35}, 880 ${ay}, ${ax - 12} ${ay}`, C.red, 3);
    note(970, 170 + g.hh + 16, `${fmt(B.size)} 个桶是 2 的 ${bits} 次方，取低 ${bits} 位正好是桶号`, `color:${C.dusk50}`);
    SB.gloss(970, 700, 830, '哈希表', '把每个键算成一个数（哈希值），按这个数放进一排格子（桶）里的某一格；找的时候再算一遍，直接去那一格。');
    SB.sub('哈希值决定它落进哪一个桶');
  });

  frame({ id: 'a-3', ch: '01 一张哈希表', cues: 'a11–a15', title: '8192 个桶里的 4096 个键',
    note: '真实分布：六成的桶空着，有键的大多只有一个，最长的一串 6 个；所以找一个键通常只比一两次。',
    motion: '桶阵放大铺满左侧，桶按键数由暗到亮；右侧图例逐行亮出各档的桶数；a14 时第 7909 号桶闪亮并把它那一串 6 个键拉成一行；Alice 的那一格一直是红的。' }, () => {
    SB.crumb('01 一张哈希表', '一次真实的分布');
    const LONG = B.longest.bucket;
    const g = SB.buckets(120, 150, 8, 2, { mark: { ...red, [LONG]: C.yellow } });
    const [lx, ly] = g.at(LONG);
    SB.box(lx - 12, ly - 12, 24, 24, `border:3px solid ${C.yellow}`);
    const [ax, ay] = g.at(B.alice);
    SB.box(ax - 12, ay - 12, 24, 24, `border:3px solid ${C.red}`);
    // 图例
    const X = 1450;
    label(X, 150, '桶里有几个键');
    Object.entries(B.dist).forEach(([k, v], i) => {
      const y = 210 + i * 62;
      SB.box(X, y + 6, 30, 30, `background:${SB.SHADE[Math.min(+k, 6)]};border:1px solid ${C.dusk70}`);
      SB.txt(X + 48, y, `${k} 个`, 'font-size:30px;color:#d9d9d9;white-space:nowrap');
      SB.txt(X + 150, y, `${fmt(v)}`, 'font:700 30px Inter;color:#fff;white-space:nowrap');
      if (+k === 0) SB.txt(X + 250, y, `${pct(v)}%`, `font:700 30px Inter;color:${C.dusk50}`);
    });
    note(X, 210 + Object.keys(B.dist).length * 62 + 20, `有键的桶：${fmt(B.used)}`, 'color:#fff');
    SB.txt(120, 150 + g.hh + 26, `第 ${LONG} 号桶的一串：${B.longest.keys.join(' → ')}`, `font:500 28px Mono;color:${C.yellow};white-space:nowrap`);
    note(120, 150 + g.hh + 80, `红：第 ${B.alice} 号桶，只有 user:2050 一个键`, `color:${C.red}`);
    SB.sub('最长的一串有 6 个');
  });

  /* ───────── 02 增 ───────── */
  frame({ id: 'b-0', ch: '02 增', cues: '章节卡', title: '章节卡',
    note: '第 02 章：Alice 注册，内存里多了什么。', motion: '整屏卡刷入、停留、收走；背后是缩小的桶阵，Alice 那一格亮着。' }, () => {
    SB.chapter('02', '增', 'Alice 注册，内存里多了什么？');
  });

  frame({ id: 'b-1', ch: '02 增', cues: 'b1–b5', title: '一个键，一个对象',
    note: 'HSET 写下两个字段；第 3271 号桶里挂上一个对象：16 字节的对象头，后面紧跟键名。',
    motion: '终端打出 HSET 与回复；桶阵缩到左上，Alice 那一格拉出一条引线；对象的字节条从左往右长出：对象头 16 格、标志 1 格、键名逐字符；b5 时键名那一段亮起。指针那一段留到下一帧，向下指向值。' }, () => {
    SB.crumb('02 增', '对象');
    SB.term(120, 140, 1680, 140, `${SB.prompt}<span class="c">HSET user:2050 name Alice age 42</span>
(integer) 2`);
    const g = SB.buckets(120, 330, 3, 1, { mark: red, upto: B.size / 2 });
    const [ax, ay] = g.at(B.alice);
    SB.box(ax - 7, ay - 7, 14, 14, `border:2px solid ${C.red}`);
    SB.path(`M${ax} ${ay + 7} L ${ax} 515`, C.red, 3);
    note(680, 330, `桶阵的上半（0–${B.size / 2 - 1} 号）`, `color:${C.dusk50}`);
    label(680, 380, `第 ${B.alice} 号桶指向一个对象`, 'font-size:32px');
    // 字节条
    const CW = 46, Y = 560; let x = 120;
    const cell = (s, bg, fg = '#fff', w = CW) => { SB.box(x, Y, w - 2, 64, `background:${bg};color:${fg};display:flex;align-items:center;justify-content:center;font:600 28px Mono`, s); x += w; };
    const g1 = x; for (let i = 0; i < 8; i++) cell('', C.dusk90); const g1e = x;
    const g2 = x; for (let i = 0; i < 8; i++) cell('', C.dusk70); const g2e = x;
    x += 8; const g3 = x; cell('', C.dusk50); const g3e = x;
    x += 8; const g4 = x; 'user:2050'.split('').forEach((ch) => cell(ch, C.redDeep)); const g4e = x;
    const brace = (a, b, y, s, sub2, color = '#d9d9d9') => { SB.line(a, y, b - 4, y, color, 2); SB.txt(a, y + 12, s, `font-size:28px;font-weight:700;color:${color};white-space:nowrap`); if (sub2) SB.txt(a, y + 54, sub2, `font-size:28px;color:${C.dusk50};white-space:nowrap`); };
    brace(g1, g1e, Y + 88, '类型 · 编码 · 引用计数 · 访问时间', 'type hash · encoding listpack');
    brace(g2, g2e, Y + 210, '指针 → 值', '下一帧：值的 27 个字节');
    brace(g3, g3e + 4, Y + 210, '标志', '1 字节', C.dusk30);
    brace(g4, g4e, Y + 88, '键名 user:2050', '紧跟在对象头后面');
    SB.txt(g1, Y - 44, '对象头 16 字节', `font-size:28px;color:${C.dusk30};white-space:nowrap`);
    SB.sub('对象头 16 个字节，记着值的类型和存法');
  });

  frame({ id: 'b-2', ch: '02 增', cues: 'b6–b10', title: '27 个字节的 listpack',
    note: 'Alice 的两个字段挤在一段 27 字节的连续内存里：先记总长和项数，每项自带类型和长度，42 只占一个字节，ff 收尾。',
    motion: '对象的「指针」一段向下拉出一条线，27 个字节从左到右逐个落下；b7 时各段下方的标签依次亮起；b9 时 84 与 05 两个字节被框出；b10 时 2a 变成实心红。listpack 这一行留到下一帧。' }, () => {
    SB.crumb('02 增', '值');
    SB.txt(120, 150, `值：listpack · ${D.listpack.parts.reduce((a, p) => Math.max(a, p.from + p.len), 0)} 字节`, '', 't-h');
    const lp = LP();
    SB.lpRow(120, 260, { hi: [24] });
    SB.gloss(120, 440, 760, 'listpack', '把一串字符串和整数按顺序紧挨着写进一段连续内存的格式；每一项自己带着类型和长度。');
    const ROWS = [[`${lp.slice(0, 4).join(' ')}`, '总长 27（小端）'], [`${lp.slice(4, 6).join(' ')}`, '4 项'], [lp[6], '短字符串，长 4：name'], [lp[11], '这一项占 5 字节，倒着走时用'], [lp[24], '就是 42：小整数，编码即数值'], [lp[26], '到此为止']];
    ROWS.forEach(([a, b], i) => SB.txt(960, 440 + i * 64, `<span style="display:inline-block;width:230px;color:${i === 4 ? C.red : C.yellow}">${a}</span>${b}`, 'font-size:30px;font-weight:500;color:#d9d9d9;white-space:nowrap', 'mono'));
    SB.sub('42 是个小整数，只占一个字节');
  });

  frame({ id: 'b-3', ch: '02 增', cues: 'b11–b14', title: '字段名每人一遍',
    note: '每个用户的值里都重复存着 name、age；Alice 这个键 55 字节，名字长的用户 100 字节，4096 个用户一共不到 600 KB。',
    motion: 'Alice 的那一行上方、下方各添一行别的用户；三行里的 name、age 同时描红；右侧逐行给出实测的字节数；最后底部的总量砸入。' }, () => {
    SB.crumb('02 增', '省内存');
    const rows = [['user:2049', 'User02049-…', '51', D.mem.other], ['user:2050', 'Alice', '42', D.mem.alice]];
    rows.forEach(([k, v, a, m], i) => {
      const y = 200 + i * 130, me = k === 'user:2050';
      SB.txt(120, y + 14, k, `font:600 32px Mono;color:${me ? C.red : '#d9d9d9'};white-space:nowrap`);
      let x = 420; const seg = (s, w, st) => { SB.box(x, y, w, 64, `${st};border-radius:4px;display:flex;align-items:center;justify-content:center;font:600 28px Mono`, s); x += w + 8; };
      seg('name', 150, `border:3px solid ${C.red}`);
      seg(v, me ? 170 : 520, `background:${me ? C.redDeep : C.dusk}`);
      seg('age', 120, `border:3px solid ${C.red}`);
      seg(a, 90, `background:${me ? C.redDeep : C.dusk}`);
      SB.txt(1500, y + 6, m ? `<span class="num" style="font-size:44px">${m}</span><span style="font-size:28px;color:#b9c2c6"> 字节</span>` : '', 'white-space:nowrap');
    });
    note(1500, 130, 'MEMORY USAGE', `color:${C.dusk50}`);
    note(420, 470, '红框：字段名，每个用户的值里都存一遍（例子中名字是 50 字节的演示串）', 'white-space:normal;width:1000px');
    SB.box(120, 620, 1680, 1, `background:${C.dusk90}`);
    const total = D.mem.after - D.mem.before;
    SB.txt(120, 660, `<span class="num" style="font-size:96px">${fmt(total)}</span><span style="font-size:36px;color:#b9c2c6"> 字节</span>`, 'white-space:nowrap');
    note(120, 790, `写入 4096 个用户前后，used_memory 从 ${fmt(D.mem.before)} 到 ${fmt(D.mem.after)}（含哈希表本身）`);
    note(120, 840, '字段不超过 512 个、每个值不超过 64 字节时，哈希用 listpack 存（缺省配置）', `color:${C.dusk50}`);
    SB.sub('4096 个用户，一共不到 600 KB');
  });

  /* ───────── 03 查 ───────── */
  frame({ id: 'c-0', ch: '03 查', cues: '章节卡', title: '章节卡',
    note: '第 03 章：找到 Alice，走了哪条路。', motion: '整屏卡刷入、停留、收走。' }, () => {
    SB.chapter('03', '查', '找到 Alice，走了哪条路？');
  });

  frame({ id: 'c-1', ch: '03 查', cues: 'c1–c4', title: '按键找：一条直路',
    note: '算哈希值、到第 3271 号桶、比对键名、读出 27 个字节，四步走完，服务端约 5 微秒。',
    motion: '右侧四步逐个点亮，同时左侧桶阵上一条红线从键名落到第 3271 号桶；c3 时那 27 个字节在下方闪过；c4 时「5 微秒」与开场那一帧的数字对上。' }, () => {
    SB.crumb('03 查', '按键');
    SB.term(120, 140, 830, 120, `${SB.prompt}<span class="c">HGETALL user:2050</span>`);
    const g = SB.buckets(120, 300, 5, 1.5, { mark: red });
    const [ax, ay] = g.at(B.alice);
    SB.box(ax - 10, ay - 10, 20, 20, `border:3px solid ${C.red}`);
    SB.path(`M${ax} 262 L ${ax} ${ay - 12}`, C.red, 3);
    const steps = ['算出 user:2050 的哈希值', `取低位 → 第 ${B.alice} 号桶`, '桶里比对键名：user:2050', '读出值的 27 个字节，回复'];
    steps.forEach((s, i) => {
      const y = 160 + i * 108;
      SB.box(1030, y, 64, 64, `background:${C.red};color:${C.midnight};border-radius:50%;display:flex;align-items:center;justify-content:center;font:800 32px Inter`, `${i + 1}`);
      SB.txt(1120, y + 10, s, 'font-size:34px;white-space:nowrap');
    });
    SB.box(1030, 620, 770, 1, `background:${C.dusk90}`);
    SB.txt(1030, 650, `<span class="num" style="font-size:110px;color:${C.red}">${us}</span><span style="font-size:44px;font-weight:700"> 微秒</span>`, 'white-space:nowrap');
    note(1030, 800, `5 次：${D.hgetallUs.join('、')} 微秒（服务端用时）`, `color:${C.dusk50}`);
    SB.sub('开头那五微秒，就花在这里');
  });

  frame({ id: 'c-2', ch: '03 查', cues: 'c5–c8', title: '按名字找：4096 个键都要看',
    note: '没有按名字的索引，只能把 4096 个键逐个取出比对；这一次用了三四毫秒，是按键找的几百倍。',
    motion: '桶阵里有键的格子从第 0 号开始依次被扫成蓝色，左下计数器从 0 走到 4096；扫到第 3271 号时它变红但扫描不停；c8 时右侧两根横条一齐长出，短的那根几乎看不见。' }, () => {
    SB.crumb('03 查', '按名字');
    const g = SB.buckets(120, 150, 5, 1.5, { mark: red, color: (i, k) => (k ? '#2b6f8c' : SB.SHADE[0]) });
    note(120, 150 + g.hh + 16, `有键的 ${fmt(B.used)} 个桶全部走一遍，比对了 ${fmt(B.size / 2)} 个键的名字`, 'color:#fff');
    SB.txt(120, 150 + g.hh + 70, 'Redis 只认键，没有按名字的索引', '', 't-note');
    // 时间对比（服务端用时，同一口径 SLOWLOG）
    const X = 1010, maxW = 760, sMin = Math.min(...D.scanUs), sMax = Math.max(...D.scanUs), sMed = median(D.scanUs);
    const scale = maxW / sMax;
    label(X, 150, '服务端用时');
    SB.txt(X, 220, '按名字扫一遍', 'font-size:30px;white-space:nowrap');
    SB.box(X, 270, Math.round(sMed * scale), 48, `background:#2b6f8c`);
    SB.txt(X, 330, `${fmt(sMin)}–${fmt(sMax)} 微秒（3 次）`, 'font:700 30px Inter;white-space:nowrap');
    SB.txt(X, 430, '按键找', 'font-size:30px;white-space:nowrap');
    SB.box(X, 480, Math.max(3, Math.round(us * scale)), 48, `background:${C.red}`);
    SB.txt(X + 20, 482, `${Math.min(...D.hgetallUs)}–${Math.max(...D.hgetallUs)} 微秒`, 'font:700 30px Inter;white-space:nowrap');
    const r1 = Math.round(sMin / Math.max(...D.hgetallUs) / 100) * 100, r2 = Math.round(sMax / Math.min(...D.hgetallUs) / 100) * 100;
    SB.box(X, 620, 790, 1, `background:${C.dusk90}`);
    SB.txt(X, 650, `约 <span class="num" style="font-size:72px">${r1}–${r2}</span> 倍`, 'font-size:36px;white-space:nowrap');
    SB.sub('这一次用了三四毫秒，比按键找慢了几百倍');
  });

  frame({ id: 'c-3', ch: '03 查', cues: 'c9–c10', title: '自己存一把「名字→编号」的钥匙',
    note: '要按名字找，就多存一个键 name:Alice，值是 2050；一次按名字的查找变成两次按键查找。',
    motion: '终端里逐条打出三条命令与回复；右侧两个键依次亮起，第一个的值 2050 沿箭头变成第二个键名 user:2050，再落到 Alice 的值上。' }, () => {
    SB.crumb('03 查', '存的时候就想好');
    SB.term(120, 150, 900, 470, `${SB.prompt}<span class="c">SET name:Alice 2050</span>\nOK\n${SB.prompt}<span class="c">GET name:Alice</span>\n"<span class="v">2050</span>"\n${SB.prompt}<span class="c">HGETALL user:2050</span>\n1) "name"\n2) "<span class="v">Alice</span>"\n3) "age"\n4) "<span class="v">42</span>"`);
    const box = (y, k, v, kc) => {
      SB.box(1110, y, 320, 80, `border:3px solid ${kc};border-radius:8px;display:flex;align-items:center;justify-content:center;font:600 32px Mono`, k);
      SB.path(`M1440 ${y + 40} L 1500 ${y + 40}`, '#fff', 3);
      SB.box(1510, y, 290, 80, `background:${C.dusk};border-radius:8px;display:flex;align-items:center;justify-content:center;font:600 30px Mono`, v);
    };
    label(1110, 150, '两次按键查找');
    box(220, 'name:Alice', '2050', C.yellow);
    SB.path('M1655 300 C 1655 360, 1270 340, 1270 410', C.yellow, 3, '8 6');
    box(420, 'user:2050', 'name · age', C.red);
    note(1110, 540, '第一次：名字 → 编号', 'white-space:nowrap');
    note(1110, 590, '第二次：编号 → Alice 的资料', 'white-space:nowrap');
    note(120, 680, '没有现成的索引：要按什么找，存的时候就得多存一份', 'white-space:nowrap;color:#fff');
    SB.sub('要按名字找，就再存一个键，从名字指到编号');
  });
})();
