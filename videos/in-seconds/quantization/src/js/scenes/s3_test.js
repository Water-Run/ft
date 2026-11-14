// 成绩与收尾：test → close 两场是一个连续的画面（config.js 的 GROUPS）。
//   test ：五行，同一个模型的五个版本。左边是按体积画的条带（五条用同一片数据，长度按 GB，色阶按位数），右边是 198 道四选一的答对率，
//          瞎蒙是 25%（FACTS E1–E6、E9）。t7 聚焦 1 位那一行，每行补一个空心圈：思路写短时的分数；只有 1 位那行的圈在条的右边（E11）。
//          t8 写到字数上限、没写出答案（E12，示意）。t9 右边换成 89 个多步编程任务：原版与 4 位都做成约 63 个（E15）。
//   close：版本的名字贴到各行（D1、D2），名字里的数字就是位数；NVFP4 与其他常见的名字列在右下角（不在任何一行上，它们没参加这次评测）；
//          4 位那一行的 17 块砖飞出来，回到开场那块显卡（E8）。
(function () {
  const { el, files, strip, tiles, gpu } = QZ;
  // close 一场画在 test 的画面里（config.js 的 GROUPS），它自己的根节点是空的
  scene('close', () => {});
  scene('test', ({ root, s }) => {
    const world = h('div', 'world', root);
    makeCamera(world, 1920, VH);   // 镜头不动
    const S = Object.fromEntries(L.scenes.map((x) => [x.id, x]));
    const tierZh = ['原版', '8 位的', '4 位的', '2 位的', '1 位的'];
    const RY0 = 262, RP = 118, SX = 400, UNIT = 11, KX = 1180, KW = 420, NX = 1620;
    const yOf = (r) => RY0 + r * RP, kx = (pct) => KX + KW * pct / 100;
    const fade = (els, t, a, b, d = 0.08) => fromTo(els, t, { opacity: a }, { opacity: b, duration: d, immediateRender: false });

    // 先建的在下层：t7、t8 聚焦 1 位那一行的底板，t6「比瞎蒙还低」的那一块
    // 「当前这一行」的底板：旁白念到哪个版本的分数、哪个名字，它就跳到哪里（只有一个，位置只由 t 决定）
    const plate = el(world, 96, 0, 1748, 112, { background: '#2A1466', borderRadius: '12px' });
    plate.dataset.name = '当前这一行';
    const plate2 = el(world, 96, yOf(4) + 98, 1748, 92, { background: '#2A1466', borderRadius: '0 0 12px 12px' });
    const fail = el(world, 96, yOf(4) - 14, 1748, 204, { background: '#FF6BB5', borderRadius: '12px' });   // 交白卷：1 位那一行的底板透出一层粉（粉色只给 1 位档），不透明度 0.22
    const zone = el(world, KX, 236, kx(25) - KX, 612, { background: '#5B21D6', borderRadius: '6px' });   // 不透明度 0.45
    zone.dataset.name = '比瞎蒙还低的区域';
    set([plate2, fail, zone], 0, { autoAlpha: 0 });

    const head = el(world, 120, 170, 1000, 44, {}, 'Qwen3.8 27B 的五个版本 · 体积', 'lbl');
    wipe(head, s.start + 0.1, { dir: 'l', d: 0.4 });
    const rows = files.map((f, r) => {
      const y = yOf(r);
      const name = el(world, 120, y, 270, 54, {}, tierZh[r], 'hit');
      const fn = el(world, 120, y + 56, 270, 36, { color: 'var(--dim)' }, f.name, 'mlbl-s');   // 会压在「当前这一行」的底板上，字要亮一档
      const st = strip(world, SX, y + 12, f.gb, UNIT, 60, 31, f.levels);
      const gb = el(world, SX + Math.round(f.gb * UNIT) + 18, y + 22, 200, 44, {}, f.gb + ' GB', 'lbl');
      const t0 = T('t1', 'Qwen') - 0.2 + r * 0.22;   // 旁白一说到模型名，五行就一行行搭起来，不让画面空着
      slide(name, t0, { x: -30, d: 0.4 }); appear(fn, t0 + 0.1);
      wipe(st, t0 + 0.05, { dir: 'l', d: 0.55 }); appear(gb, t0 + 0.45);
      return { name, fn, st, gb, y };
    });
    sfx('whoosh', T('t1', 'Qwen') - 0.2, { g: 0.5 });
    rows.forEach((_, r) => sfx('tick', T('t1', 'Qwen') + r * 0.22, { g: 0.45 }));
    const src = el(world, 1420, 872, 400, 36, { textAlign: 'right' }, 'Quesma 评测 · 2026-08', 'mlbl-s');
    appear(src, T('t1') + 0.5);

    // t2：先是一整片 198 道题，「四选一」时收起，换成五条答对率的槽与瞎蒙 25% 的线
    const tT2 = T('t2') - 0.05, t198 = T('t2', '一百九十八') - 0.1, t4x1 = T('t2', '思路') - 0.1;   // 198 道题留到「每题…思路」，再换成五条槽与瞎蒙线
    const kHead = el(world, KX, 170, 700, 44, {}, '198 道四选一 · 答对', 'lbl');
    wipe(kHead, tT2, { dir: 'l', d: 0.4 }); sfx('tick', tT2, { g: 0.6 });
    const qg = el(world, KX + 4, 262, 640, 400);
    qg.dataset.name = '198 道题';
    for (let i = 0; i < 198; i++) el(qg, (i % 18) * 35, Math.floor(i / 18) * 35, 28, 28, { background: '#5B21D6', borderRadius: '4px' });
    set(qg, 0, { autoAlpha: 0 }); set(qg, t198, { autoAlpha: 1 }); sfx('pop', t198, { g: 0.55 });
    const q1 = el(qg, 0, 0, 28, 28, { background: 'var(--paper)', borderRadius: '4px' });   // 「每题」：第一题亮起
    set(q1, 0, { autoAlpha: 0 }); set(q1, T('t2', '每题') - 0.05, { autoAlpha: 1 }); sfx('tick', T('t2', '每题'), { g: 0.5 });
    fade(qg, t4x1, 1, 0, 0.12);
    const tracks = rows.map((r) => { const e = el(world, KX, r.y + 28, KW, 26, { background: 'var(--line)', borderRadius: '8px' }); set(e, 0, { autoAlpha: 0 }); set(e, t4x1 + 0.1, { autoAlpha: 1 }); return e; });
    const think = el(world, 1420, 170, 400, 44, { textAlign: 'right' }, '先写思路，再作答', 'lbl-s');
    appear(think, t4x1 + 0.15);
    const guess = el(world, kx(25) - 2, 226, 4, 620, { background: 'repeating-linear-gradient(180deg,#CDBDFF 0 10px,transparent 10px 20px)' });
    const guessL = el(world, kx(25) + 12, 212, 300, 40, { fontSize: '32px' }, '瞎蒙 25%', 'lbl');
    wipe(guess, t4x1 + 0.1, { dir: 't', d: 0.45 }); appear(guessL, t4x1 + 0.3);
    sfx('blip', t4x1 + 0.1, { g: 0.5 });

    // t3–t6：各行的分数条一下子亮出来（整条瞬间出现，数字滚到位）
    const when = [T('t3', '九成') - 0.4, T('t4', '八位') - 0.1, T('t4', '四位') - 0.1, T('t5', '八成五') - 0.4, T('t6', '一成') - 0.3];
    const bars = files.map((f, r) => {
      const bad = r === 4, y = rows[r].y;
      const b = el(world, KX, y + 28, KW * f.score / 100, 26, { background: bad ? 'var(--bad)' : 'var(--paper)', borderRadius: '8px', transformOrigin: '0 50%' });
      const n = el(world, NX, y + 2, 200, 70, { textAlign: 'right', color: bad ? 'var(--bad)' : 'var(--paper)' }, '0%', 'mid');
      set(b, 0, { autoAlpha: 0 }); set(b, when[r], { autoAlpha: 1 });
      fromTo(b, when[r], { scaleX: 0.92 }, { scaleX: 1, duration: 0.18, ease: 'power2.out', immediateRender: false });
      appear(n, when[r]); countTo(n, 0, f.score, when[r], 0.6, (v) => v.toFixed(1) + '%');
      sfx(bad ? 'thud' : 'pop', when[r], { g: bad ? 0.8 : 0.55 });
      return { b, n };
    });
    const plus1 = el(world, 1300, rows[2].y + 70, 520, 36, { textAlign: 'right', color: 'var(--dim)' }, '比原版多对 1 题，属正常波动', 'lbl-s');
    appear(plus1, when[2] + 0.7);
    // 1 位那一行掉到瞎蒙线左边：线左边那一块亮起来，整行沉一下（垮掉是动作，不另贴红字）
    set(zone, T('t6', '瞎蒙') - 0.1, { autoAlpha: 0.45 }); sfx('thud', T('t6', '瞎蒙') - 0.1, { g: 0.5 });
    fromTo([rows[4].name, rows[4].st, rows[4].gb], when[4] + 0.35, { y: 0 }, { keyframes: [{ y: 10, duration: 0.15, ease: 'power2.in' }, { y: 0, duration: 0.45, ease: 'back.out(3)' }], immediateRender: false });

    // t7：聚焦 1 位那一行（底板亮起，其余几行退淡）。每行补一个空心圈 = 思路写短时的分数；
    // 其余各行的圈在条尾左边（写长更好）；1 位那行的圈从条尾滑到右边
    const tT7 = T('t7') - 0.05;
    const leg = el(world, 1420, 170, 400, 44, { textAlign: 'right' }, '○ 思路写短　▬ 写长', 'lbl-s');
    vanish(think, tT7); appear(leg, tT7);
    sfx('blip', tT7, { g: 0.45 });
    const upRows = rows.slice(0, 4).flatMap((r) => [r.name, r.fn, r.st, r.gb]);
    const upK = [...bars.slice(0, 4).flatMap((b) => [b.b, b.n]), ...tracks.slice(0, 4), plus1];
    fade([...upRows, ...upK], tT7, 1, 0.4);
    const rings = files.map((f, r) => {
      const y = rows[r].y, x1 = kx(f.low), top = r === 4;
      const g = el(world, x1 - 17, y + 24, 34, 34, { border: '5px solid ' + (top ? 'var(--bad)' : 'var(--dim)'), background: 'var(--ink)' }, '', 'dot');
      if (top) fromTo(g, T('t7', '一成半') - 0.6, { autoAlpha: 0, x: kx(f.score) - x1 }, { autoAlpha: 1, x: 0, duration: 0.7, ease: 'power3.inOut' });
      else fromTo(g, tT7 + 0.2 + r * 0.08, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 0.4, scale: 1, duration: 0.3, ease: 'back.out(2)' });
      return g;
    });
    sfx('tick', tT7 + 0.2, { g: 0.5 }); sfx('blip', T('t7', '一成半') - 0.1, { g: 0.6 });
    const low1 = el(world, NX - 100, rows[4].y + 66, 300, 36, { color: 'var(--bad)', textAlign: 'right' }, '写短 ' + files[4].low.toFixed(1) + '%', 'lbl-s');
    appear(low1, T('t7', '一成半') + 0.1);

    // t8：写长了，写到字数上限，没写出答案（示意）：底板向下延伸，答对率那一栏下面一条思路长到上限，答案框是空的
    const tT8 = T('t8') - 0.05, TY = rows[4].y + 128;
    set(plate2, tT8, { autoAlpha: 1 });
    fade(src, tT8, 1, 0, 0.15); fade(src, T('t9') + 0.2, 0, 1, 0.2);   // 出处一行给示意让位
    const tr = el(world, KX, TY, 300, 30, { background: 'var(--line)', borderRadius: '8px' });
    const tf = el(world, KX, TY, 300, 30, { background: 'var(--dimp)', borderRadius: '8px', transformOrigin: '0 50%' });
    const cap = el(world, KX + 300, TY - 14, 6, 58, { background: 'var(--paper)' });
    const capL = el(world, KX - 270, TY - 4, 250, 36, { textAlign: 'right', color: 'var(--dim)' }, '思路 · 示意', 'lbl-s');
    const ans = el(world, KX + 330, TY - 12, 110, 54, { border: '4px solid var(--bad)', borderRadius: '8px' });
    const ansL = el(world, KX + 456, TY - 2, 200, 36, { color: 'var(--bad)' }, '没写出答案', 'lbl-s');
    appear(tr, tT8); appear(capL, tT8); appear(cap, tT8);
    fromTo(tf, tT8 + 0.1, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 1.0, ease: 'power1.in' });
    appear(ans, T('t8', '白卷') - 0.25); appear(ansL, T('t8', '白卷') - 0.15);
    set(fail, T('t8', '白卷') - 0.25, { autoAlpha: 0.22 });
    sfx('riser', tT8 + 0.1, { g: 0.35 }); sfx('error', T('t8', '白卷') - 0.25, { g: 0.5 });

    // t9：右边换成 89 个多步编程任务（原版、4 位、2 位测了；8 位、1 位没测）。聚焦撤掉，各行恢复
    const tT9 = T('t9') - 0.1;
    fade(upK, tT9, 0.4, 0, 0.35); fade(rings.slice(0, 4), tT9, 0.4, 0, 0.35);
    fade(zone, tT9, 0.45, 0, 0.35); fade(fail, tT9, 0.22, 0, 0.35);
    fade([kHead, leg, guess, guessL, low1, plate2, tracks[4], bars[4].b, bars[4].n, rings[4], tr, tf, cap, capL, ans, ansL], tT9, 1, 0, 0.35);
    fade(upRows, tT9, 0.4, 1, 0.3);
    const tHead = el(world, KX, 170, 700, 44, {}, '89 个多步编程任务 · 做成', 'lbl');
    wipe(tHead, tT9 + 0.25, { dir: 'l', d: 0.4 });
    sfx('whoosh', tT9, { g: 0.45 });
    const TK = QZ.D.tasks, done = { 0: TK.bf16, 2: TK.q4, 3: TK.q2 };
    const tGrids = [];
    files.forEach((f, r) => {
      const y = rows[r].y;
      if (done[r] == null) { const e = el(world, KX, y + 20, 300, 44, {}, '没测', 'lbl-s'); appear(e, tT9 + 0.4); tGrids.push(e); return; }
      const g = el(world, KX, y + 12, 420, 66);
      for (let i = 0; i < TK.total; i++) el(g, (i % 30) * 14, Math.floor(i / 30) * 22, 10, 18, { background: i < done[r] ? 'var(--paper)' : 'var(--line)', borderRadius: '2px' });
      const n = el(world, NX, y - 4, 200, 64, { textAlign: 'right' }, (100 * done[r] / TK.total).toFixed(1) + '%', 'mid');
      const c = el(world, NX - 100, y + 60, 300, 36, { textAlign: 'right' }, '约 ' + done[r] + ' 个', 'lbl-s');
      const t0 = r === 0 ? T('t9', '编程') - 0.2 : r === 2 ? T('t9', '打平') - 0.4 : T('t9', '打平') + 0.2;
      wipe(g, t0, { dir: 'l', d: 0.6 }); appear(n, t0 + 0.5); appear(c, t0 + 0.6);
      sfx('tick', t0, { g: 0.5 });
      tGrids.push(g, n, c);
    });
    sfx('chime', T('t9', '打平'), { g: 0.55 });

    // ════ close ════
    const tZ1 = T('z1') - 0.05;
    fade(tGrids, tZ1, 1, 0, 0.3);
    exit(tHead, tZ1, { d: 0.25 }); exit(src, tZ1, { d: 0.25 });
    fade(rows.map((r) => r.fn), tZ1, 1, 0, 0.3);   // 名字贴上来，行下的小字文件名让位
    // 名字贴到各行：BF16、Q8、Q4
    const mk = (x, y, html, t) => { const e = el(world, x, y, null, null, {}, html, 'tag'); slam(e, t, { from: 1.25, d: 0.35 }); sfx('pop', t, { g: 0.55 }); return e; };
    const tagB = mk(KX, rows[0].y + 2, 'BF<b>16</b>', T('z1', 'B F'));
    const tag8 = mk(KX, rows[1].y + 2, 'Q<b>8</b>', T('z1', 'Q 八'));
    const tag4 = mk(KX, rows[2].y + 2, 'Q<b>4</b>', T('z1', 'Q 四'));
    // NVFP4 与其他常见的名字：在右下角另起一块，不挂在任何一行上
    const tagN = mk(KX, 612, 'NVFP<b>4</b>', T('z1', 'N V'));
    const nvL = el(world, KX + 236, 632, 420, 40, {}, '英伟达的 4 位格式', 'lbl');
    appear(nvL, T('z1', 'N V') + 0.3);
    const wall = el(world, 0, 0, 1920, 968);
    wall.dataset.name = '其他常见的名字';
    const SHOW = ['FP8', 'INT8', 'Q6_K', 'Q5_K_M', 'Q4_0', 'IQ2_XXS', 'MXFP4', 'AWQ', 'GPTQ', 'MLX-4bit', 'bnb-4bit'].filter((n) => QZ.D.names.includes(n));
    { let x = KX, y = 720; for (const n of SHOW) { const w = n.length * 19 + 34; if (x + w > 1830) { x = KX; y += 52; } el(wall, x, y, w, 44, { fontSize: '30px' }, n, 'mlbl'); x += w; } }
    set(wall, 0, { autoAlpha: 0 }); fromTo(wall, T('z1', 'N V') + 0.5, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, immediateRender: false });
    // z2：名字里的数字就是每个数占几位：四个名字一起翻成深紫，数字加下划线；1 位档实际平均约 1.8 位
    const tags = [tagB, tag8, tag4, tagN];
    tags.forEach((e) => classAt(e, 'lit', T('z2', '数字') - 0.05));
    sfx('blip', T('z2', '数字'), { g: 0.55 });
    const avg18 = el(world, SX + Math.round(files[4].gb * UNIT) + 140, rows[4].y + 22, 520, 36, { color: 'var(--dim)' }, '实际平均约 1.8 位', 'lbl-s');
    appear(avg18, T('z2', '几位') - 0.1);
    // 底板的行程：分数逐行念（「都是九成」时一次框住前三行）→ 聚焦 1 位 → 撤掉 → 名字逐个贴上 → 名字区 → 1 位那行（实际约 1.8 位）→ 收走
    const RECT = (r) => [96, yOf(r) - 14, 1748, 112], NAMES = [KX - 20, 596, 690, 290];
    const PLAN = [[when[0], RECT(0)], [when[1], RECT(1)], [when[2], RECT(2)], [T('t4', '九成') - 0.1, [96, yOf(0) - 14, 1748, 2 * RP + 112]], [when[3], RECT(3)], [when[4], RECT(4)], [tT9, null],
      [T('z1', 'B F'), RECT(0)], [T('z1', 'Q 八'), RECT(1)], [T('z1', 'Q 四'), RECT(2)], [T('z1', 'N V'), NAMES], [T('z2', '几位') - 0.1, RECT(4)], [T('z3') - 0.05, null]];
    let lastP = null;
    F((t) => {
      let cur = null; for (const [t0, r] of PLAN) if (t >= t0) cur = r;
      const key = cur ? cur.join(',') : 'off';
      if (key === lastP) return; lastP = key;
      plate.style.display = cur ? '' : 'none';
      if (cur) px(plate, cur[0], cur[1], cur[2], cur[3]);
    });

    // z3：4 位那一行的 17 块砖飞出来（与开场的 17 GB 同一套砖），其余退场；显卡回来
    const tZ3 = T('z3') - 0.05;
    const rest = [head, wall, ...tags, nvL, avg18, ...rows.flatMap((r, i) => (i === 2 ? [] : [r.name, r.st, r.gb]))];
    fade(rest, tZ3, 1, 0, 0.4);
    const B = tiles(world, 17, { x: 120, y: 520, cols: 6, pitch: 56, size: 48, levels: 16, seed: 2 });
    const r2 = rows[2];
    set(B, s.start, { autoAlpha: 0 });   // 飞出来之前不在场（否则从本场一开始就叠在 4 位那一行的条带上）
    B.forEach((e, i) => {
      const sx = SX + i * UNIT, sy = r2.y + 12;
      fromTo(e, tZ3 + 0.2 + i * 0.03, { autoAlpha: 1, x: sx - e._x, y: sy - e._y, scaleX: UNIT / 48, scaleY: 60 / 48, transformOrigin: '0 0' }, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.6, ease: 'power3.inOut', immediateRender: false });
    });
    set(r2.st, tZ3 + 0.2, { autoAlpha: 0 });
    fade(r2.fn, tZ3, 0, 1, 0.3);
    fromTo([r2.name, r2.fn], tZ3 + 0.2, { y: 0 }, { y: 520 - r2.y - 110, duration: 0.6, ease: 'power3.inOut', immediateRender: false });
    fromTo(r2.gb, tZ3 + 0.2, { x: 0, y: 0 }, { x: 120 + 6 * 56 + 20 - (SX + Math.round(17 * UNIT) + 18), y: 520 + 56 - r2.y - 22, duration: 0.6, ease: 'power3.inOut', immediateRender: false });
    sfx('whoosh', tZ3 + 0.2, { g: 0.5 });
    const G = gpu(world, 1000, 300);
    slide(G.root, T('z3', '十七') + 0.2, { x: 340, d: 0.6, ease: 'power3.out' }); sfx('whoosh', T('z3', '十七') + 0.1, { g: 0.5 });

    // z4：17 块砖飞进 24 个槽，还空着 7 个；左边换成这个文件的小结——开头那个问题的答案
    const tZ4 = T('z4') + 0.05, tFit = T('z4', '装得下') - 0.15;   // 「24 GB 的显卡」时砖往里飞，「装得下」时读数与小结出来
    B.forEach((e, i) => fromTo(e, tZ4 + i * 0.035, { x: 0, y: 0 }, { x: G.slots[i].x - e._x, y: G.slots[i].y - e._y, duration: 0.55, ease: 'power2.inOut', immediateRender: false }));
    sfx('blip', tZ4 + 0.3, { g: 0.5 }); sfx('pop', tZ4 + 0.55 + 16 * 0.035, { g: 0.7 });
    fade([r2.name, r2.fn, r2.gb], tZ4, 1, 0, 0.3);
    const sum1 = el(world, 116, 330, 700, 120, {}, '17 GB', 'big');
    const sum2 = el(world, 124, 470, 700, 44, {}, '4 位的 · Q4_K_M', 'mlbl');
    const sum3 = el(world, 120, 560, 700, 70, {}, '答对 ' + files[2].score.toFixed(1) + '%', 'mid');
    const sum4 = el(world, 124, 646, 700, 40, {}, '原版 55 GB · 答对 ' + files[0].score.toFixed(1) + '%', 'lbl-s');
    const tSum = tFit;
    wipe(sum1, tSum, { dir: 'l', d: 0.4 }); slide(sum2, tSum + 0.15, { x: -30, d: 0.4 }); wipe(sum3, tSum + 0.35, { dir: 'l', d: 0.4 }); appear(sum4, tSum + 0.6);
    const fit = el(G.root, 286, 30, 450, 60, { textAlign: 'right' }, '17 / 24 GB', 'mid');
    appear(fit, tFit);
    sfx('chime', tFit, { g: 0.6 });
    // 装进去了，就能跑：显卡下方一行词一个个冒出来（示意，词用中性的灰紫），一直到片尾名单之前
    const tRun = tFit + 0.5, tEnd = S.outro.start;
    const runL = el(world, 1000, 790, 400, 36, {}, '能跑了 · 示意', 'lbl-s');
    appear(runL, tRun);
    const NR = 40, run = [];
    for (let i = 0; i < NR; i++) { const e = el(world, 1000 + i * 20, 836, 14, 40, { background: '#8A7BB5', borderRadius: '4px' }); run.push(e); }
    let lastR = -1;
    F((t) => { const n = t < tRun ? 0 : Math.min(NR, Math.floor((t - tRun) * 9) + 1); if (n === lastR) return; lastR = n; run.forEach((e, i) => { e.style.visibility = i < n ? 'visible' : 'hidden'; }); });
    sfx('key', tRun, { g: 0.35 }); sfx('key', tRun + 0.6, { g: 0.3 }); sfx('key', tRun + 1.2, { g: 0.3 });
    // 片尾名单之前整页淡出，名单在空底上进来，不硬切
    fromTo(world, tEnd - 0.55, { opacity: 1 }, { opacity: 0, duration: 0.45, immediateRender: false });
  });
})();
