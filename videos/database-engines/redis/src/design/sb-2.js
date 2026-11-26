/* 分镜第 2 段：04 改、05 事务与并发、06 出错怎么办（第 3 稿，方向 A 桶阵）。
   画面上的数字取自 window.DATA；DATA 里没有、取自回显的文字在各帧 note 里注明出处。 */
(function () {
  const C = SB.C, D = DATA;
  const LANE_C = { Alice: C.red, Bob: C.sky, Carol: C.violet };
  const DIM_C = { Alice: '#8a221c', Bob: '#0477a5', Carol: '#592479' };   // 同一人的暗色（MATERIALS 的红阶、天蓝阶、紫阶），白字；排队的块实心，不用透明
  // 一条泳道：名字 + 横线
  const lane = (y, name, color, x0 = 360, x1 = 1800) => { SB.txt(120, y - 24, name, `font-size:34px;font-weight:700;color:${color};white-space:nowrap`); SB.box(x0, y - 1, x1 - x0, 3, `background:${color}`); };
  // 命令块
  const blk = (x, y, w, s, bg, fg = '#fff', extra = '') => SB.box(x, y - 28, w, 56, `background:${bg};color:${fg};border-radius:6px;display:flex;align-items:center;justify-content:center;font:600 26px Mono;white-space:nowrap;${extra}`, s);
  const after = () => { const b = SB.LP(); b[24] = (43).toString(16); return b; };   // 42 → 43：第 24 个字节 2a → 2b（U01）
  const AGE_I = 24;

  /* ───────── 04 改 ───────── */
  frame({ id: 'd-1', ch: '04 改', cues: '章节卡', title: '章节卡', note: '第 04 章要回答：改一个数字，内存里改了什么。', motion: '整屏章节卡从左刷入，停留后收走；收走时露出上一章的桶阵，Alice 那一格仍是红的。' }, () => {
    SB.chapter('04', '改', '改一个数字，内存里改了什么？');
  });

  frame({ id: 'd-2', ch: '04 改', cues: 'd1–d2', title: '一条 HSET', note: 'Alice 过生日，应用发来一条 HSET，只改 age 这一个字段；回复 0 表示没有新增字段。', motion: '桶阵缩到左上，Alice 那一格拉出一条线落到下方的 27 个字节；终端里打出命令，回复出现时 42 那一格变红。' }, () => {
    SB.crumb('04 改', 'Alice 过生日');
    const g = SB.buckets(120, 170, 4, 1, { mark: { [D.buckets.alice]: C.red } });
    const [ax, ay] = g.at(D.buckets.alice);
    SB.box(ax - 9, ay - 9, 18, 18, `border:2px solid ${C.red}`);
    SB.txt(120, 170 + g.hh + 14, `user:2050 · 第 ${D.buckets.alice} 号桶`, `font-size:28px;color:${C.red};white-space:nowrap`);
    SB.term(860, 170, 940, 170, SB.prompt + '<span class="c">HSET user:2050 age 43</span>\n(integer) <span class="v">0</span>');
    SB.txt(860, 360, '回复 0：没有新增字段，改的是已有的 age', '', 't-note nw');
    SB.txt(120, 560, 'Alice 的值 · listpack · 27 字节', 'font-size:34px;font-weight:700;white-space:nowrap');
    SB.path(`M${ax} ${ay + 10} L ${ax} 548`, C.red, 2, '6 6');
    SB.lpRow(120, 620, { hi: [AGE_I] });
    SB.sub('一条 HSET，把 age 改成 43');
  });

  frame({ id: 'd-3', ch: '04 改', cues: 'd3–d4', title: '只变了一个字节', note: '改前改后是同一段 27 个字节、同一个地址，只有表示年龄的那一个字节从 2a 变成 2b。', motion: '上一帧的字节行原地停住，下面复制出「改之后」一行；2a 翻成 2b 的一瞬间那一格亮红，其余 26 格不动。' }, () => {
    SB.crumb('04 改', '同一个地址');
    SB.txt(120, 170, '改之前', 'font-size:34px;font-weight:700');
    SB.lpRow(120, 230, { hi: [AGE_I] });
    SB.txt(120, 450, '改之后', 'font-size:34px;font-weight:700');
    SB.lpRow(120, 510, { hi: [AGE_I], bytes: after(), labels: false });
    { let cx = 120; DATA.listpack.parts.forEach((p) => { const w = p.len * 54 + 6; SB.txt(cx, 576, p.what === '42' ? '<span style="color:#ff4438;font-weight:700">43</span>' : p.what, `width:${w}px;font-size:26px;color:#b9c2c6;white-space:nowrap`); cx += w; }); }
    SB.path('M1472 352 L1472 500 M1460 488 L1472 502 L1484 488', C.red, 3);
    SB.txt(1660, 236, '同一个地址<br>同样 27 字节', 'font-size:30px;line-height:1.5;color:#d9d9d9;white-space:nowrap');
    SB.txt(120, 700, `<span class="num" style="font-size:96px">2a</span><span style="font-size:40px;color:${C.dusk50}">　=　42</span><span style="font-size:56px;color:${C.red}">　→　</span><span class="num" style="font-size:96px;color:${C.red}">2b</span><span style="font-size:40px;color:${C.dusk50}">　=　43</span>`, 'white-space:nowrap');
    SB.txt(1160, 740, '小整数：这一个字节就是数值本身', '', 't-note nw');
    SB.sub('只有一个字节变了：2a 变成 2b');
  });

  frame({ id: 'd-4', ch: '04 改', cues: 'd5–d8', title: '不留旧的一版', note: 'InnoDB、PostgreSQL 改的时候留住旧版本给正在读的人；Redis 只剩 43，所以要问：Bob 这时在读怎么办。', motion: '三栏依次出现：InnoDB 的 undo、PostgreSQL 的两个版本、Redis 只有一格；最后 Bob 的箭头指向 Redis 那一格，问号留到下一章。' }, () => {
    SB.crumb('04 改', '旧版本');
    const col = (x, title, rows, hot) => {
      SB.box(x, 170, 500, 520, `border:2px solid ${hot ? C.red : C.dusk90};border-radius:10px`);
      SB.txt(x + 30, 196, title, `font-size:44px;font-weight:800;color:${hot ? C.red : '#fff'}`);
      rows.forEach(([label, val, kind], i) => {
        const y = 300 + i * 150;
        if (kind === 'ghost') SB.box(x + 30, y, 440, 110, `border:2px dashed ${C.dusk70};border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:30px;color:${C.dusk50}`, val);
        else SB.box(x + 30, y, 440, 110, `background:${kind === 'old' ? C.dusk9 : C.dusk};border:2px solid ${kind === 'old' ? C.dusk90 : C.dusk70};border-radius:8px;padding:12px 20px`, `<div style="font-size:26px;color:${C.dusk50}">${label}</div><div style="font:700 40px Mono;color:${kind === 'old' ? C.dusk30 : '#fff'}">${val}</div>`);
      });
    };
    col(120, 'InnoDB', [['这一行', 'age 43', 'new'], ['undo 里的旧值', 'age 42', 'old']]);
    col(710, 'PostgreSQL', [['新版本', 'age 43', 'new'], ['旧版本，留在表里', 'age 42', 'old']]);
    col(1300, 'Redis', [['listpack 里', 'age 43', 'new'], ['', '没有旧的一版', 'ghost']]);
    SB.txt(150, 610, `<span style="color:${C.sky};font-weight:700">Bob</span> 读到 42`, 'font-size:32px;white-space:nowrap');
    SB.txt(740, 610, `<span style="color:${C.sky};font-weight:700">Bob</span> 读到 42`, 'font-size:32px;white-space:nowrap');
    SB.txt(1330, 610, `<span style="color:${C.sky};font-weight:700">Bob</span> 正在读，读到什么？`, 'font-size:32px;white-space:nowrap');
    SB.txt(120, 730, '旧版本留给正在读的人，照旧读到改之前的样子', '', 't-note nw');
    SB.sub('Redis 不留，要是这时 Bob 正好在读呢？');
  });

  /* ───────── 05 事务与并发 ───────── */
  frame({ id: 'e-1', ch: '05 事务与并发', cues: '章节卡', title: '章节卡', note: '第 05 章要回答：有人在读，有人在写，谁等谁。', motion: '章节卡刷入；收走时上一帧 Bob 的箭头还在，接到下一帧的泳道上。' }, () => {
    SB.chapter('05', '事务与并发', '有人在读，有人在写，谁等谁？');
  });

  frame({ id: 'e-2', ch: '05 事务与并发', cues: 'e1–e4', title: '一个线程，一条一条来', note: '所有客户端的命令汇成一队，只有一个主线程按顺序执行，一条做完才轮到下一条。', motion: '三条客户端泳道上的命令块依次滑进汇合处，在主线程上排成一行，从左到右一块块点亮执行；桶阵在右上角常驻。' }, () => {
    SB.crumb('05 事务与并发', '一个线程');
    const rows = [['Alice', 230, [['HSET age 43', 230]]], ['Bob', 340, [['HGETALL', 170]]], ['Carol', 450, [['HSET', 120], ['HGET', 120]]]];
    rows.forEach(([n, y, cmds]) => {
      lane(y, n, LANE_C[n], 300, 760);
      let x = 320; cmds.forEach(([s, w]) => { blk(x, y, w, s, LANE_C[n], C.midnight); x += w + 14; });
      SB.path(`M760 ${y} C 860 ${y}, 860 680, 960 680`, LANE_C[n], 2);
    });
    SB.txt(120, 656, '主线程', 'font-size:34px;font-weight:700');
    SB.box(960, 679, 840, 3, 'background:#fff');
    const q = [['HSET age 43', 'Alice', 200], ['HGETALL', 'Bob', 150], ['HSET', 'Carol', 110], ['HGET', 'Carol', 110]];
    let x = 980; q.forEach(([s, who, w], i) => { if (i === 0) blk(x, 680, w, s, LANE_C[who], C.midnight, 'outline:4px solid #fff;outline-offset:3px'); else blk(x, 680, w, s, DIM_C[who]); x += w + 18; });
    SB.txt(980, 740, '正在执行 → 　其余排队', '', 't-note nw');
    SB.txt(980, 572, '一次执行一条', 'font-size:34px;font-weight:700;white-space:nowrap');
    SB.buckets(1290, 170, 3, 1, { mark: { [D.buckets.alice]: C.red } });
    SB.txt(1290, 440, '数据：内存里的哈希表', '', 't-small nw');
    SB.sub('所有客户端的命令排成一队，一次执行一条');
  });

  frame({ id: 'e-3', ch: '05 事务与并发', cues: 'e5–e8', title: '两万', note: '两个客户端同时各加一万次，结果正好两万：同一时刻只有一条命令在动数据，用不着锁和旧版本。', motion: '两条泳道上的「加一」细块交错落进主线程，计数从 0 滚到两万后停住；底下一行字随后淡入。' }, () => {
    SB.crumb('05 事务与并发', '各加一万次');
    lane(230, '客户端 1', C.red, 360, 1800); lane(330, '客户端 2', C.violet, 360, 1800);
    for (let i = 0; i < 28; i++) { blk(380 + i * 50, 230, 38, '', C.red, C.midnight); blk(400 + i * 50, 330, 38, '', C.violet, C.midnight); }
    SB.txt(380, 270, 'HINCRBY +1　× 10000', 'font:500 26px Mono;color:#b9c2c6');
    SB.txt(400, 370, 'HINCRBY +1　× 10000', 'font:500 26px Mono;color:#b9c2c6');
    SB.txt(120, 450, '主线程', 'font-size:34px;font-weight:700');
    SB.box(360, 475, 1440, 3, 'background:#fff');
    for (let i = 0; i < 56; i++) SB.box(370 + i * 25.5, 459, 20, 34, `background:${i % 2 ? C.violet : C.red};border-radius:3px`);
    SB.txt(120, 560, `<span class="num" style="font-size:180px">${D.conc.sum}</span>`, 'line-height:1');
    SB.txt(820, 600, '结果正好两万', 'font-size:44px;font-weight:700;white-space:nowrap');
    SB.txt(820, 670, '同一时刻只有一条命令在动数据：用不着锁，也用不着旧版本', '', 't-note nw');
    SB.txt(820, 730, '数据在内存里，一条命令几微秒就做完，一个线程排队也来得及', '', 't-note nw');
    SB.sub('两个客户端同时给一个数各加一万次，结果正好是两万');
  });

  frame({ id: 'e-4', ch: '05 事务与并发', cues: 'e9–e11', title: '一条慢的，后面都得等', note: '一条命令让服务端停了半秒，0.1 秒时发来的 Bob 的读要等它做完，多等了 0.4 秒。', motion: '紫色的慢命令块沿时间轴拉长到 0.5 秒；Bob 的读在 0.1 秒落到队尾，一直等到紫块结束才执行，等待那段用括线标出。' }, () => {
    SB.crumb('05 事务与并发', '慢命令');
    const X0 = 360, PX = 2300;            // 0 秒在 x=360，每秒 2300 像素
    const tx = (t) => X0 + t * PX;
    SB.txt(120, 476, '主线程', 'font-size:34px;font-weight:700');
    SB.box(X0, 499, 1440, 3, 'background:#fff');
    blk(tx(0), 500, tx(0.5) - tx(0), 'DEBUG SLEEP 0.5（让服务端停半秒）', C.violet, C.midnight, 'justify-content:flex-start;padding-left:24px');
    blk(tx(0.5) + 6, 500, 130, 'HGET', C.sky, C.midnight);
    lane(300, 'Bob', C.sky, X0, 1800);
    SB.box(tx(0.1) - 8, 292, 16, 16, `background:${C.sky};border-radius:50%`);
    SB.txt(tx(0.1) + 20, 230, '0.1 秒：Bob 发来 HGET', `font-size:28px;color:${C.sky};white-space:nowrap`);
    SB.path(`M${tx(0.1)} 310 L ${tx(0.1)} 470 M${tx(0.1)} 530 L ${tx(0.1)} 600 M${tx(0.5)} 530 L ${tx(0.5)} 600`, C.sky, 2, '6 6');
    SB.path(`M${tx(0.1)} 600 L ${tx(0.5)} 600 M${tx(0.1)} 588 L ${tx(0.1)} 612 M${tx(0.5)} 588 L ${tx(0.5)} 612`, C.sky, 3);
    SB.txt(tx(0.1) + 300, 624, `Bob 多等了 ${D.conc.wait.toFixed(1)} 秒`, `font-size:40px;font-weight:700;color:${C.sky};white-space:nowrap`);
    for (let i = 0; i <= 5; i++) { SB.box(tx(i / 10) - 1, 720, 2, 14, `background:${C.dusk50}`); SB.txt(tx(i / 10) - 20, 742, `${(i / 10).toFixed(1)} 秒`, 'font:500 26px Mono;color:#8a99a0;white-space:nowrap'); }
    SB.sub('Bob 的一次读，就跟着多等了 0.4 秒');
  });

  frame({ id: 'e-5', ch: '05 事务与并发', cues: 'e12–e17', title: '桶也一个一个搬', note: '4096 个键装满 4096 个桶时表翻成 8192 个桶；旧桶里的键每读写一次搬一个桶，读了一百次后新表里有 201 个键。', motion: '旧表从 0 号桶起一格格变暗，对应的键亮到新表的两个位置（i 与 i+4096）上；两个计数随之一减一增，停在 3895 与 201。' }, () => {
    SB.crumb('05 事务与并发', '渐进式 rehash');
    const [oldSize] = D.rehashBefore, [left, moved] = D.rehash100;
    const DONE = 64;   // 示意：已搬过的旧桶画成前两行（从 0 号起搬）；实测的只有键数 3895 与 201
    SB.txt(120, 196, '旧表（4096 个桶，画出前一半）', '', 't-small nw');
    SB.buckets(120, 236, 9, 2, { cols: 64, upto: oldSize / 2, color: (i) => (i < DONE ? '#0f2530' : C.dusk70) });
    SB.box(120 + (DONE % 64) * 11 - 3, 236 + Math.floor(DONE / 64) * 11 - 3, 15, 15, `border:3px solid ${C.red}`);
    SB.txt(120, 606, '暗下去的：已经搬走的桶　　<span style="color:#ff4438">红框：下一个要搬的桶</span>', '', 't-small nw');
    SB.txt(900, 196, '新表（8192 个桶）', '', 't-small nw');
    SB.buckets(900, 236, 5, 2, { cols: 128, upto: 8192, color: (i) => ((i % 4096) < DONE * 2 && (i % 4096) % 2 === 0 ? C.red : '#0f2530') });
    SB.path('M832 410 L 886 410 M 870 396 L 886 410 L 870 424', C.red, 3);
    SB.txt(120, 680, `旧表还剩 <span class="num" style="font-size:56px;color:#fff">${left}</span> 个键`, 'white-space:nowrap', 't-note');
    SB.txt(900, 700, `读了一百次，新表里已有 <span class="num" style="font-size:56px;color:${C.red}">${moved}</span> 个键`, 'white-space:nowrap', 't-note');
    SB.gloss(120, 820, 1680, '渐进式 rehash', '哈希表扩容时，旧表里的键不一次搬完：每处理一次读写，顺手搬一个桶；闲下来时后台也接着搬。');
    SB.sub('这叫渐进式 rehash；实验里读了一百次，搬过去 201 个键');
  });

  frame({ id: 'e-6', ch: '05 事务与并发', cues: 'e18–e21', title: '两条命令之间被插队', note: '先读出 42、再写回 43 是两条命令；两个客户端交错着做，都读到 42、都写回 43，加了两次只多一岁。', motion: '四个命令块按真实顺序在主线程上排开：两次读都返回 42，两次写都是 43；最后结果块「43」砸下，旁边划掉「44」。' }, () => {
    SB.crumb('05 事务与并发', '先读，再写');
    lane(230, 'Alice', C.red, 360, 1800); lane(330, 'Carol', C.violet, 360, 1800);
    SB.txt(120, 450, '主线程', 'font-size:34px;font-weight:700');
    SB.box(360, 475, 1440, 3, 'background:#fff');
    const steps = [['Alice', 'HGET age', '→ 42'], ['Carol', 'HGET age', '→ 42'], ['Alice', 'HSET age 43', ''], ['Carol', 'HSET age 43', '']];
    steps.forEach(([who, s, r], i) => {
      const x = 380 + i * 350, y = who === 'Alice' ? 230 : 330;
      blk(x, y, 300, s, DIM_C[who]);
      blk(x, 476, 300, s, LANE_C[who], C.midnight);
      if (r) SB.txt(x + 70, 520, r, 'font:700 34px Mono;color:#fff;white-space:nowrap');
    });
    SB.res(380, 640, 'age = 43', 'red');
    SB.txt(640, 646, '加了两次，只多了一岁　<span style="text-decoration:line-through;color:#5c707a">44</span>', 'font-size:40px;font-weight:700;white-space:nowrap');
    SB.txt(380, 740, '两条命令之间，插进了别人的命令', '', 't-note nw');
    SB.sub('两个客户端同时这样做，都读到 42，都写回 43');
  });

  frame({ id: 'e-7', ch: '05 事务与并发', cues: 'e22–e24', title: 'MULTI 和 EXEC', note: 'MULTI 之后的写命令先排队，EXEC 时连着执行，中间插不进别人；但「先读 42、再算 43」的那一读，进不了这一包。', motion: 'Alice 的几条命令被一个红框收成一包，在主线程上一口气走完，别人的命令只能排在包前包后；包外的「读 42 → 算 43」灰掉，打上一道斜线。' }, () => {
    SB.crumb('05 事务与并发', 'MULTI / EXEC');
    SB.txt(120, 296, '主线程', 'font-size:34px;font-weight:700');
    SB.box(360, 319, 1440, 3, 'background:#fff');
    blk(380, 320, 120, 'HGET', DIM_C.Carol);
    SB.box(530, 270, 860, 100, `border:4px solid ${C.red};border-radius:10px`);
    blk(550, 320, 130, 'MULTI', C.red, C.midnight); blk(694, 320, 240, 'HSET age 43', C.red, C.midnight); blk(948, 320, 260, 'HSET name …', C.red, C.midnight); blk(1222, 320, 150, 'EXEC', C.red, C.midnight);
    blk(1420, 320, 120, 'HSET', DIM_C.Carol);
    SB.txt(530, 390, '连着执行，中间插不进别人的命令', `font-size:30px;color:${C.red};white-space:nowrap`);
    SB.box(380, 520, 520, 90, `border:2px dashed ${C.dusk70};border-radius:8px;display:flex;align-items:center;justify-content:center;font:600 30px Mono;color:${C.dusk50}`, 'HGET → 42 → 算出 43');
    SB.path('M380 610 L 900 520', C.red, 4);
    SB.txt(940, 540, '读出来、算一下，再决定写什么：<br>这一步放不进这一包', 'font-size:30px;line-height:1.5;color:#d9d9d9;white-space:nowrap');
    SB.gloss(120, 760, 1680, 'MULTI、EXEC', 'MULTI 之后发来的命令先排进队，不执行；EXEC 时把它们连着执行完。');
    SB.sub('可先读、再算的那一步，连不进去');
  });

  frame({ id: 'e-8', ch: '05 事务与并发', cues: 'e25–e27', title: 'WATCH：落空，重来', note: 'Alice 先盯住键再读；Carol 抢先改了它，Alice 的 EXEC 什么也不做、回一个空；重读一遍再做，得到 44。', motion: '左边终端逐行打出 Alice 与 Carol 交错的命令，Carol 那一行出现时键上亮起红点；EXEC 回出 (nil) 后，右侧重试的三行接着打出，结果 44 落定。' }, () => {
    SB.crumb('05 事务与并发', 'WATCH');
    const A = `<span style="color:${C.red}">Alice&gt;</span> `, Ca = `<span style="color:${C.violet}">Carol&gt;</span> `;
    SB.term(120, 160, 980, 520, `${A}<span class="c">WATCH user:2050</span>
${A}<span class="c">HGET user:2050 age</span>      "42"
${Ca}<span class="c">HSET user:2050 age 43</span>
${A}<span class="c">MULTI</span>
${A}<span class="c">HSET user:2050 age 43</span>  QUEUED
${A}<span class="c">EXEC</span>
<span class="r">(nil)</span>`);
    SB.term(1160, 160, 640, 520, `${A}<span class="c">WATCH user:2050</span>
${A}<span class="c">HGET … age</span>  "43"
${A}<span class="c">MULTI</span>
${A}<span class="c">HSET … age 44</span>
${A}<span class="c">EXEC</span>
1) (integer) 0`);
    SB.txt(1160, 120, '重读一遍，再做', '', 't-small nw');
    SB.res(1500, 600, `age = ${D.conc.retryAge}`, 'red');
    SB.gloss(120, 740, 1680, 'WATCH', '先盯住一个键；到 EXEC 时它要是被别人改过，整包命令都不执行，EXEC 回一个空。不加锁，冲突了就重来。');
    SB.sub('要是中间有人改过它，这次 EXEC 就什么也不做');
  });

  frame({ id: 'e-9', ch: '05 事务与并发', cues: 'e28–e30', title: '不回滚', note: '一包命令里第二条出错，第一条照样生效：年龄已经是 43，没有回滚。', motion: 'EXEC 的两行回复先后打出，第二行红色报错；随后右边 age 43 的结果块落定不动，「回滚」两个字划掉。' }, () => {
    SB.crumb('05 事务与并发', '没有回滚');
    SB.term(120, 160, 1080, 520, `${SB.prompt}<span class="c">MULTI</span>
OK
${SB.prompt}<span class="c">HSET user:2050 age 43</span>
QUEUED
${SB.prompt}<span class="c">HINCRBY user:2050 name 1</span>
QUEUED
${SB.prompt}<span class="c">EXEC</span>
1) (integer) 0
2) <span class="r">(error) ERR hash value is not an integer</span>`);
    SB.txt(1260, 220, '第一条', '', 't-small nw');
    SB.res(1260, 270, 'age = 43　照样生效', 'red');
    SB.txt(1260, 400, '<span style="text-decoration:line-through">回滚</span>', 'font-size:56px;font-weight:800;color:#5c707a');
    SB.txt(1260, 500, '官方文档：支持回滚，会大大影响<br>Redis 的简单和性能', 'font-size:30px;line-height:1.5;color:#d9d9d9;white-space:nowrap');
    SB.sub('前面的照样生效');
  });

  /* ───────── 06 出错怎么办 ───────── */
  frame({ id: 'f-1', ch: '06 出错怎么办', cues: '章节卡', title: '章节卡', note: '第 06 章要回答：断了电，还剩什么。', motion: '章节卡刷入，收走时露出满格的桶阵。' }, () => {
    SB.chapter('06', '出错怎么办', '断了电，还剩什么？');
  });

  frame({ id: 'f-2', ch: '06 出错怎么办', cues: 'f1–f4', title: '进程一死，内存就空了', note: '数据只在内存里时，进程一结束，4096 个键全部没了；要在重启后找回来，只能往磁盘写一份。', motion: '左边满格的桶阵被一道红线切过（kill -9），整片在一拍里熄灭成右边的空格阵；下方「磁盘」一栏这时才出现，空着，等下一帧。' }, () => {
    SB.crumb('06 出错怎么办', '进程没了');
    SB.txt(120, 150, '内存 · kill -9 之前', 'font-size:34px;font-weight:700;white-space:nowrap');
    const g = SB.buckets(120, 210, 5, 1, { cols: 128 });
    SB.txt(120, 210 + g.hh + 14, `${D.buckets.used} 个桶里有键，一共 4096 个`, '', 't-small nw');
    SB.res(844, 340, 'kill -9', 'red');
    SB.txt(1032, 150, '重启之后', 'font-size:34px;font-weight:700;white-space:nowrap');
    SB.buckets(1032, 210, 5, 1, { cols: 128, empty: true });
    SB.txt(1032, 210 + g.hh + 14, '0 个键', `font-size:34px;font-weight:700;color:${C.red}`);
    SB.box(120, 800, 1680, 2, `background:${C.dusk70}`);
    SB.txt(120, 830, '磁盘', 'font-size:34px;font-weight:700');
    SB.txt(260, 836, '要在重启后找回来，得先往这里写一份', '', 't-note nw');
    SB.sub('进程一死，内存里的就都没了');
  });

  frame({ id: 'f-3', ch: '06 出错怎么办', cues: 'f5–f7、f9', title: 'RDB：分出子进程写快照', note: 'RDB 是某一刻全部数据的快照；写的时候 fork 出一个子进程去写，主进程照常处理命令；缺省按修改次数决定隔多久存一次。', motion: '主线程上的命令一直往前走；在某一刻向下分出一条虚线，子进程照着那一刻的数据慢慢写满 dump.rdb，主线程不停。' }, () => {
    SB.crumb('06 出错怎么办', 'RDB');
    SB.txt(120, 196, '主进程', 'font-size:34px;font-weight:700');
    SB.box(360, 219, 1440, 3, 'background:#fff');
    [380, 520, 660].forEach((x) => blk(x, 220, 120, 'HSET', C.dusk, '#fff', `border:2px solid ${C.dusk70}`));
    [900, 1040, 1180, 1320, 1460].forEach((x) => blk(x, 220, 120, 'HGET', C.dusk, '#fff', `border:2px solid ${C.dusk70}`));
    SB.path('M820 222 L 820 400', C.red, 3, '8 6');
    SB.txt(840, 300, `fork：${D.fork.usec} 微秒`, `font-size:30px;color:${C.red};white-space:nowrap`);
    SB.txt(120, 376, '子进程', 'font-size:34px;font-weight:700');
    SB.box(820, 399, 980, 3, `background:${C.red}`);
    SB.box(1180, 450, 620, 110, `border:2px solid ${C.dusk70};border-radius:8px;background:${C.dusk9};padding:16px 24px`, `<div style="font:600 32px Mono">dump.rdb</div><div style="font-size:28px;color:${C.dusk30}">${D.rdbSize.toLocaleString('en-US')} 字节 · 分出那一刻的全部数据</div>`);
    SB.path('M1100 401 L 1180 470', C.red, 2);
    SB.gloss(120, 620, 1000, 'RDB', '快照文件：某一刻内存里的全部数据，写成一个文件；由分出的子进程写，主进程不停。');
    SB.txt(120, 800, '缺省什么时候存：3600 秒内改过 1 次 · 300 秒内改过 100 次 · 60 秒内改过 10000 次', '', 't-note nw');
    SB.sub('写的时候分出一个子进程去写，主进程照常处理命令');
  });

  frame({ id: 'f-4', ch: '06 出错怎么办', cues: 'f8', title: 'Alice 那 27 个字节，原样在文件里', note: 'dump.rdb 里 Alice 这一项：类型、键名、长度之后，就是内存里那 27 个字节，原样写进了文件。', motion: '上一帧的 dump.rdb 展开成一行字节；中间那 27 格和第 02 章内存里的那一行逐格对齐，一格不差地亮起来。' }, () => {
    SB.crumb('06 出错怎么办', 'dump.rdb 里的 Alice');
    const hex = D.rdbEntry.hex.match(/../g);
    const sz = 34, step = sz + 2;
    let html = '';
    hex.forEach((b, i) => { const head = i < 12; html += `<span class="byte" style="width:${sz}px;font-size:24px;background:${head ? C.dusk90 : (i >= 36 && i <= 37 ? C.redDeep : C.dusk)};margin-right:${i === 0 || i === 1 || i === 10 || i === 11 ? 8 : 2}px">${b}</span>`; });
    SB.txt(120, 200, `dump.rdb 里 Alice 这一项（键名 user:2050 在文件偏移 ${D.rdbEntry.offset.toLocaleString('en-US')} 处）`, 'font-size:34px;font-weight:700;white-space:nowrap');
    SB.txt(120, 270, html, 'white-space:nowrap');
    const xAt = (i) => 120 + i * step + (i > 0 ? 6 : 0) + (i > 1 ? 6 : 0) + (i > 10 ? 6 : 0) + (i > 11 ? 6 : 0);
    SB.box(xAt(12) - 4, 266, xAt(38) + sz - xAt(12) + 8, 64, `border:3px solid ${C.red};border-radius:4px`);
    SB.txt(120, 350, '10 = 类型（用 listpack 存的哈希）　09 = 键名 9 字节　user:2050　1b = 值 27 字节', '', 't-note nw');
    SB.txt(120, 500, '内存里的那 27 个字节', 'font-size:34px;font-weight:700;white-space:nowrap');
    SB.lpRow(120, 570);
    SB.txt(120, 760, '红框里的 27 个字节，和第 02 章内存里的那一行逐个相同', '', 't-note nw');
    SB.sub('Alice 那 27 个字节，原样在文件里');
  });

  frame({ id: 'f-5', ch: '06 出错怎么办', cues: 'f10–f13', title: '两次 kill -9', note: '只靠快照：写完 4096 个用户就杀，重启 0 个键；存过快照再改成 43 后杀，回来的是 42。', motion: '左右两张卡片依次翻开：每张从上到下走完「写入 → kill -9 → 重启」三步，最后的数字砸下。' }, () => {
    SB.crumb('06 出错怎么办', '只有快照');
    const card = (x, steps, big, cap) => {
      SB.box(x, 170, 820, 640, `border:2px solid ${C.dusk90};border-radius:12px`);
      steps.forEach((s, i) => { SB.txt(x + 40, 210 + i * 76, `<span style="font:600 26px Mono;color:${C.dusk50};margin-right:16px">${i + 1}</span>${s}`, 'font-size:32px;white-space:nowrap'); });
      SB.txt(x + 40, 470, cap, '', 't-note nw');
      SB.txt(x + 40, 520, `<span class="num" style="font-size:200px;color:${C.red}">${big}</span>`, 'line-height:1');
    };
    card(120, ['写入 4096 个用户（没存过快照）', '<span style="color:#ff4438">kill -9</span>', '重启'], D.crash.rdbOnlyKeys, '重启之后的键数');
    card(980, ['存一次快照（age 42）', '把 Alice 改成 43，<span style="color:#ff4438">kill -9</span>', '重启'], D.crash.snapshotAge, 'Alice 的年龄');
    SB.sub('存过一次快照，再把 Alice 改成 43，杀掉');
  });

  frame({ id: 'f-6', ch: '06 出错怎么办', cues: 'f14–f17', title: 'AOF：把命令追加到文件末尾', note: 'AOF 缺省不开；开了以后每条写命令原样追加到文件末尾，重启时从头再执行一遍，和 InnoDB 重放 redo 一个道理。', motion: '主线程上执行完的 HSET 块向下复制一份，落进 AOF 文件的最后一行；重启时整份文件从上到下逐行亮起，又落回上方的桶阵。' }, () => {
    SB.crumb('06 出错怎么办', 'AOF');
    SB.txt(120, 176, '主线程', 'font-size:34px;font-weight:700');
    SB.box(360, 199, 1440, 3, 'background:#fff');
    blk(380, 200, 420, 'HSET user:2050 age 43', C.red, C.midnight);
    SB.path('M590 230 L 590 300', C.red, 3);
    const parts = D.aof.split('\r\n').filter(Boolean);
    const sel = parts.slice(0, 5).join(' '), cmd = parts.slice(5).join(' ');
    SB.box(120, 300, 1680, 250, `border:2px solid ${C.dusk70};border-radius:10px;background:${C.dusk9}`);
    SB.txt(150, 320, 'appendonly.aof.1.incr.aof', 'font:600 30px Mono;color:#fff');
    SB.txt(150, 380, `<span style="color:${C.dusk50}">${sel}</span>`, 'font:500 30px Mono;white-space:nowrap');
    SB.txt(150, 440, `<span style="color:${C.red}">${cmd}</span>`, 'font:600 30px Mono;white-space:nowrap');
    SB.txt(150, 494, '每段之间是 \\r\\n；这就是那条命令本身，原样写进去', '', 't-small nw');
    SB.gloss(120, 610, 1680, 'AOF', '只追加的命令日志：每执行一条写命令，就把它原样追加到文件末尾；重启时把文件里的命令从头再执行一遍。缺省不开。');
    SB.txt(120, 800, '和 InnoDB 重放 redo 一样，靠重放回到崩溃之前；不同的是，这里记的是命令', '', 't-note nw');
    SB.sub('就把这条命令原样追加到文件末尾');
  });

  frame({ id: 'f-7', ch: '06 出错怎么办', cues: 'f18–f21', title: '33287 = 33287', note: '开着 AOF 一边加一一边杀掉进程：最后收到的回复和重启后的值一样，因为回复之前命令已经交给了操作系统。', motion: '加一的细块飞快地排过主线程，计数跟着滚；红线切断时数字定住，右边重启后的数字从 0 滚到同一个值；下方三步依次点亮。' }, () => {
    SB.crumb('06 出错怎么办', 'AOF 下的 kill -9');
    SB.txt(120, 196, '主线程', 'font-size:34px;font-weight:700');
    SB.box(360, 219, 1100, 3, 'background:#fff');
    for (let i = 0; i < 40; i++) SB.box(370 + i * 27, 204, 22, 32, `background:${C.dusk70};border-radius:3px`);
    SB.box(1470, 180, 4, 80, `background:${C.red}`);
    SB.txt(1490, 196, 'kill -9', `font:700 34px Mono;color:${C.red}`);
    SB.txt(120, 300, '崩溃前最后收到的回复', '', 't-note nw');
    SB.txt(120, 340, `<span class="num" style="font-size:150px">${D.crashCounter[0]}</span>`, 'line-height:1');
    SB.txt(980, 300, '重启之后', '', 't-note nw');
    SB.txt(980, 340, `<span class="num" style="font-size:150px;color:${C.red}">${D.crashCounter[1]}</span>`, 'line-height:1');
    const st = [['执行 INCR', C.dusk], ['write()：交给操作系统', C.dusk], ['回复客户端', C.dusk]];
    st.forEach(([s, bg], i) => { SB.box(120 + i * 560, 600, 500, 90, `background:${bg};border:2px solid ${i === 1 ? C.red : C.dusk70};border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:600`, s); if (i < 2) SB.path(`M${630 + i * 560} 645 L ${670 + i * 560} 645`, C.dusk50, 3); });
    SB.txt(120, 720, '进程死了，已经交给操作系统的还在', '', 't-note nw');
    SB.sub('Redis 回复之前，已经把命令交给了操作系统');
  });

  frame({ id: 'f-8', ch: '06 出错怎么办', cues: 'f22–f24', title: '断电：最后一秒左右', note: '整台机器断电时，缺省每秒落一次盘，可能丢掉最后一秒左右的数据（官方说法）；每条都先落盘再回复就一条也不丢，只是慢。', motion: '上一条时间轴上写入的细线一根根出现，每秒一次「落盘」把前面的写入压成实心；断电的红线落下，最后一次落盘之后的那一段变红。下面一条 always 的轴每根都实心。' }, () => {
    SB.crumb('06 出错怎么办', '断电');
    const X0 = 360, PX = 480, tx = (t) => X0 + t * PX;
    const axis = (y, label, every) => {
      SB.txt(120, y - 24, label, 'font-size:30px;font-weight:700;white-space:nowrap');
      SB.box(X0, y - 1, 1440, 3, 'background:#fff');
      for (let i = 0; i < 54; i++) { const t = 0.05 + i * 0.05, lost = !every && t > 2 && t < 2.7; SB.box(tx(t) - 2, y - 22, 4, 44, `background:${lost ? C.red : (every ? '#fff' : C.dusk30)}`); }
      if (!every) [1, 2].forEach((t) => SB.box(tx(t) - 4, y - 40, 8, 80, 'background:#fff'));
    };
    axis(260, '每秒落盘', false);
    SB.box(tx(2.72), 190, 4, 150, `background:${C.red}`);
    SB.txt(tx(2.72) + 14, 190, '断电', `font-size:32px;font-weight:700;color:${C.red}`);
    SB.path(`M${tx(2)} 330 L ${tx(2.7)} 330`, C.red, 3);
    SB.txt(tx(2) + 30, 350, '最后一秒左右，可能丢', `font-size:28px;color:${C.red};white-space:nowrap`);
    SB.txt(tx(1) + 14, 160, '落盘', 'font-size:26px;color:#b9c2c6');
    axis(560, '每条先落盘', true);
    SB.txt(X0, 620, '每条写命令都先落盘再回复：一条也不丢，只是慢', '', 't-note nw');
    for (let i = 0; i <= 2; i++) SB.txt(tx(i) - 16, 296, `${i} 秒`, 'font:500 26px Mono;color:#8a99a0;white-space:nowrap');
    SB.txt(120, 800, '「可能丢掉约 1 秒的数据」是官方文档的说法；本片实验只测了进程被杀，没有测断电', '', 't-small nw');
    SB.sub('可能丢掉最后一秒左右的数据');
  });

  frame({ id: 'f-9', ch: '06 出错怎么办', cues: 'f25–f27', title: '还是回到了磁盘上', note: '内存里的桶阵之下，磁盘上是两份文件：隔一阵子存的全量（RDB），和中间改动的日志（AOF）；前几集的引擎也是这样。', motion: '上方桶阵常驻，下方两份文件从左右滑入，各自用一根线连到桶阵；右下角前几集的两行小字最后淡入。' }, () => {
    SB.crumb('06 出错怎么办', '回到磁盘');
    SB.txt(120, 150, '内存', 'font-size:34px;font-weight:700');
    SB.buckets(120, 200, 6, 2, { cols: 210, upto: 8190, mark: { [D.buckets.alice]: C.red } });
    SB.box(120, 540, 1680, 2, `background:${C.dusk70}`);
    SB.txt(120, 566, '磁盘', 'font-size:34px;font-weight:700');
    SB.box(120, 630, 800, 160, `border:2px solid ${C.dusk70};border-radius:10px;background:${C.dusk9};padding:24px 30px`, `<div style="font:600 34px Mono">dump.rdb</div><div style="font-size:30px;color:${C.dusk30};margin-top:12px">隔一阵子，存一份全量</div>`);
    SB.box(1000, 630, 800, 160, `border:2px solid ${C.dusk70};border-radius:10px;background:${C.dusk9};padding:24px 30px`, `<div style="font:600 34px Mono">appendonly …incr.aof</div><div style="font-size:30px;color:${C.dusk30};margin-top:12px">中间的改动，一条条记进日志</div>`);
    SB.path('M520 520 L 520 630 M1400 520 L 1400 630', C.dusk50, 2, '6 6');
    SB.txt(120, 830, '前几集：InnoDB 用检查点加 redo，MongoDB 用检查点加日志，办法差不多', '', 't-note nw');
    SB.sub('办法也和前几集差不多：隔一阵子存一份全量');
  });
})();
