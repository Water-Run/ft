// 第 04 章 落盘（第 4 轮重做）：上面是内存（WiredTiger 的缓存），下面是磁盘（db/ 里的集合文件），全章同一个画面。
// 写完 4096 人：文件只有 4 KB，文档都在缓存的页里 → 写入只改缓存里的页（标出改过的页）→ 60 秒的检查点把改过的页写进文件，文件长到 96 KB →
// 一页写下去之前先整理、压缩（118,705 字节 → 24,576 字节）→ 文件里的块升起来，排成集合树：根页记着分界与位置，四个叶页各装一段 RecordId →
// 用 2050 走一遍：从根页往下，落在第二个叶页（B 树）→ 两个索引也是根页带一排叶页。
// 事实：A07（检查点前文件 4096 字节、缓存约 835,550 字节）、A08（检查点后 98,304 字节）、H01（60 秒）、A09 A10 B04（整理、snappy 压缩、118,705 → 24,576）、
//       B03（根页与四个叶页、分界 1225 2449 3124、块的偏移）、B01 C05（从根页往下找、B 树）、B06 B07（索引 15、3 个叶页）。
scene('flush', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);
  const ov = overlay(world);
  chrome(root, s, '04 落盘');

  // ── 两层：内存（上）、磁盘（下） ──
  const memZ = h('div', 'panel gray', world); px(memZ, 120, 214, 1680, 330);
  memZ.innerHTML = `<div style="position:absolute;left:24px;top:20px">${ico('mem', 44, K.gd2, 2.4)}</div><div style="position:absolute;left:84px;top:24px;font:700 32px 'Sans SC';color:${K.ink}">内存 · WiredTiger 的缓存</div>`;
  const dskZ = h('div', 'panel gray', world); px(dskZ, 120, 580, 1680, 372);
  dskZ.innerHTML = `<div style="position:absolute;right:24px;top:282px;display:flex;align-items:center;gap:14px">${ico('disk', 40, K.gd2, 2.4)}<span style="font:700 30px 'Sans SC';color:${K.ink}">磁盘 · <span style="font-family:Mono">db/</span></span></div>`;
  show(dskZ, T('c1', '数据') - 0.4, { y: 16, d: 0.5 });
  const done4096 = h('div', 'abs', world); px(done4096, 160, 330); css(done4096, { font: '800 64px "Inter", "Sans SC"', color: K.ink }); done4096.innerHTML = '4096 <span style="font-size:40px;font-weight:700">个人写完了</span>';
  show(done4096, T('c1') - 0.1, { y: 12, d: 0.5 }); fadeOut(done4096, T('c3', '内存') - 0.6, 0.4);
  const ov2 = overlay(world);          // 连线层：在两块底板之上
  // 集合文件：按 98,304 字节排开（检查点之后的长度），先只有文件头 4 KB
  const TOTAL = 98304;
  const fName = tg(world, 160, 868, 'collection-ccaa…41d.wt', 'm'); css(fName, { fontSize: '28px', color: K.ink, fontWeight: 600 });
  const band = fileBand(world, 160, 716, 1600, TOTAL, 96);   // 文件条上移，底下的刻度与两行注解之间留出空
  const sz = h('div', 'abs', world, '4 KB'); px(sz, 1460, 636, 300); css(sz, { font: '800 56px/72px "Inter"', color: K.ink, textAlign: 'right', borderRadius: '12px', padding: '0 18px', left: 'auto', right: '142px', width: 'auto' });
  const bH = band.blk(0, 4096, 'h', '头');
  const ticks = band.ticks(32768, TOTAL);
  css(fName, { color: '#FFFFFF', background: K.ink, borderRadius: '8px', padding: '0 14px', lineHeight: '46px' });
  show([fName, band.wrap, ...ticks], T('c1', '集合文件') - 0.3, { y: 10, d: 0.5 }); show(bH, T('c1', '集合文件'), { y: 0, d: 0.4 });
  show(sz, T('c2', '4') - 0.25, { y: 10, d: 0.45 });
  solid(sz, T('c2', '装不下') - 0.2, 'del', [T('c3', '缓存') - 0.1, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', K.ink]);
  const n4096 = tg(world, 1000, 652, '4096 份文档', 'b'); css(n4096, { fontSize: '34px', color: K.gd2 });
  show(n4096, T('c2', '文档') - 0.2, { x: 12, y: 0, d: 0.4 }); fadeOut(n4096, T('c3', '缓存') - 0.1, 0.4);
  // 缓存：文档都在这里（A07 的回显：缓存里约 835,550 字节，文件 4,096 字节）
  show(memZ, T('c3', '内存') - 0.4, { y: -16, d: 0.5 });
  const memN = tg(world, 1180, 240, '集合在缓存里 <b style="font-family:Inter">835,550</b> 字节', 'b'); css(memN, { fontSize: '30px', width: '580px', textAlign: 'right' });
  show(memN, T('c3', '缓存') - 0.2, { y: 8, d: 0.45 });
  // 新名词的注解：缓存、文件头、区段表（A11 A20 B13）
  // 缓存（T07 A11 A20）：缓存那块底板右边一栏（页收窄后空出来的地方）
  const glCa = gl(world, 1390, 308, '缓存', 'WiredTiger 在 mongod 里划出的<br>一块内存：最近用到的页、还没<br>写进文件的修改，都放在这里；<br>页在这里不压缩', { key: '缓存' });
  css(glCa.querySelector('span'), { fontSize: '24px' });
  show(glCa, T('c3', '缓存') + 0.2, { x: 12, y: 0, d: 0.45 }); fadeOut(glCa, T('c7') - 0.3, 0.4);
  // 文件头（T17）：文件条下面、文件名右边，两行
  const glHd = gl(world, 600, 874, '文件头', '每个 WiredTiger 文件的第一块：记着版本号、校验和，和一个固定的「魔数」，<br>用来认出这是 WiredTiger 的文件、而且没有损坏；此时文件里只有这一块', { key: '文件头' }); glInline(glHd);
  show(glHd, T('c2', '4') - 0.1, { y: 8, d: 0.4 }); fadeOut(glHd, T('c8') - 0.5, 0.35);
  // 区段表（B13）：文件条上方的空处；文件末尾那一块同时亮起
  const glEx = gl(world, 600, 600, '区段表', '记下哪些地方在用、哪些空着；<br>每个检查点一份，这次在末尾', { key: '区段表' }); glInline(glEx);
  show(glEx, T('c9', '九十') - 0.3, { y: 8, d: 0.45 }); fadeOut(glEx, T('c10') - 0.4, 0.4);
  // 缓存里的页：一页一批排好序的键值（内存里怎样分页本片不细讲，只画成几页）
  const PGX = (i) => 170 + i * 240, PGW = 220;
  const MP = [0, 1, 2, 3, 4].map((i) => pageBox(world, PGX(i), 314, PGW, 196, '', { n: 7, rh: 14, gap: 9 }));
  MP.forEach((p) => css(p.head, { display: 'none' })); MP.forEach((p) => css(p.body, { top: '10px' }));
  MP.forEach((p, i) => show(p.c, T('c4', '按页') - 0.3 + i * 0.1, { y: 14, d: 0.45 }));
  // 放大其中一页：2049、2050、2051 排在一起
  const zoom = h('div', 'abs', MP[2].c); css(zoom, { left: '12px', top: '10px', right: '12px', bottom: '10px', background: '#fff' });
  zoom.innerHTML = ['2049 → 92 字节', '2050 → 47 字节', '2051 → 92 字节', '2052 → 92 字节'].map((t, i) => `<div style="font:600 22px/42px Mono;color:${i === 1 ? K.forest : K.gd2}">${t}</div>`).join('');
  to(MP[2].c, T('c4', '一页') - 0.2, { borderColor: K.g1, backgroundColor: K.mint, duration: 0.35 });
  show(zoom, T('c4', '排好序') - 0.3, { y: 0, d: 0.45 });
  css(zoom.children[1], { borderRadius: '6px', padding: '0 8px' }); to(zoom.children[1], T('c4', '键值') - 0.2, { backgroundColor: K.forest, color: '#FFFFFF', duration: 0.35 });
  // 写入：一笔改动落到缓存里的一页上，这一页标成「改过」；文件不动
  const tW = T('c5') - 0.2;
  const dirty = MP.map((p, i) => { const d = h('div', 'abs', p.c); css(d, { right: '-11px', top: '-11px', width: '20px', height: '20px', borderRadius: '50%', background: K.yel, border: '2px solid ' + K.yeld }); return d; });   // 挂在页角外沿，不压字
  dirty.forEach((d, i) => show(d, tW + 0.3 + i * 0.4, { y: 0, s: 0.3, d: 0.35 }));
  MP.forEach((p, i) => { to(p.c, tW + 0.3 + i * 0.4, { borderColor: K.yeld, backgroundColor: '#FCE9B0', duration: 0.35 }); to(p.rows, tW + 0.3 + i * 0.4, { backgroundColor: '#F2CF6B', duration: 0.35 }); });
  const dirtyT = tg(world, 600, 242, '<span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#FFC010;border:2px solid #944F01;vertical-align:-2px;margin-right:10px"></span>改过、还没写进文件', ''); css(dirtyT, { fontSize: '28px', lineHeight: '52px', color: '#FFFFFF', background: K.yeld, borderRadius: '10px', padding: '0 18px' }); show(dirtyT, T('c5', '文件') - 0.2, { y: 8, d: 0.45 }); fadeOut(dirtyT, T('c9', '做完') - 0.1, 0.4);
  // 60 秒：一圈走完，改过的页写下去（检查点）
  const clock = h('div', 'abs', world); px(clock, 960, 228, 76, 76);
  clock.innerHTML = `<svg width="76" height="76" viewBox="0 0 76 76"><circle cx="38" cy="38" r="32" fill="#fff" stroke="${K.gl1}" stroke-width="6"/><circle class="arc" cx="38" cy="38" r="32" fill="none" stroke="${K.g1}" stroke-width="6" stroke-linecap="round" transform="rotate(-90 38 38)" stroke-dasharray="201" stroke-dashoffset="201"/></svg>`;
  const clockT = tg(world, 1050, 240, '60 秒', 'b'); css(clockT, { fontSize: '34px' });
  show(clock, T('c5', '过一会') - 0.2, { y: 0, s: 0.8, d: 0.4 }); show(clockT, T('c7', '60') - 0.4, { x: 10, y: 0, d: 0.4 });
  to(memZ, T('c7') - 0.1, { backgroundColor: '#FFF6DA', borderColor: K.yel, duration: 0.45 }); to(memZ, T('c9', '做完') - 0.1, { backgroundColor: K.gl3, borderColor: K.gl2, duration: 0.45 });
  to(band.wrap, T('c9', '集合文件') - 0.2, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.45 });
  fromTo(clock.querySelector('.arc'), T('c7', '60') - 0.1, { strokeDashoffset: 201 }, { strokeDashoffset: 0, duration: 2.2, ease: 'none' });
  const tCk = T('c7', '写进') - 0.4;
  // 改过的页一页页落进文件：四个叶页、一个根页（B03 的偏移）
  const BL = [[4096, 28672, 'l', '1–1224'], [28672, 53248, 'l', '1225–2448'], [53248, 65536, 'l', '2449–3123'], [65536, 86016, 'l', '3124–4096'], [86016, 90112, 'r', '']];
  const blks = BL.map(([a, b, k, t]) => band.blk(a, b, k, t));
  const bEx = band.blk(90112, TOTAL, 'h', '区段表'); set(bEx, s.start, { autoAlpha: 0 });
  show(bEx, T('c9', '九十') - 0.1, { y: 0, s: 0.6, d: 0.35 }); to(bEx, T('c9', '九十') + 0.2, { backgroundColor: K.ink, duration: 0.35 }); to(bEx._t, T('c9', '九十') + 0.2, { color: '#FFFFFF', duration: 0.35 });
  to(bEx, T('c10') - 0.4, { backgroundColor: K.gl1, duration: 0.35 }); to(bEx._t, T('c10') - 0.4, { color: K.ink, duration: 0.35 });
  blks.forEach((e) => set(e, s.start, { autoAlpha: 0 }));
  MP.forEach((p, i) => {
    const b = BL[i], cx = band.xOf((b[0] + b[1]) / 2);
    const ghost = ghostPage(world, PGX(i), 314, PGW, 196, K.yeld);
    tl.fromTo(ghost, { autoAlpha: 0.9, x: 0, y: 0, scale: 1 }, { x: cx - (PGX(i) + PGW / 2), y: 716 + 48 - (314 + 98), scale: 0.25, autoAlpha: 0, duration: 0.8, ease: 'power2.in', immediateRender: false }, tCk + i * 0.25);
    show(blks[i], tCk + 0.7 + i * 0.25, { y: 0, s: 0.6, d: 0.35 });
    if (i < 4) { to(blks[i], T('c8', '写盘') - 0.2 + i * 0.1, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 }); if (blks[i]._t) to(blks[i]._t, T('c8', '写盘') - 0.2 + i * 0.1, { color: '#FFFFFF', duration: 0.35 }); }
    fadeOut(dirty[i], tCk + 0.1 + i * 0.25, 0.3);
    to(p.c, tCk + 0.1 + i * 0.25, { borderColor: K.gl1, backgroundColor: '#FFFFFF', duration: 0.3 });
  });
  sfx('thud', tCk + 0.9, { g: 0.5 });
  const glCk = gl(world, 600, 874, '检查点', '把缓存里改过的页写进数据文件：做完时，文件里的数据<br>在这一刻完整一致，出事后可以从这里恢复；默认每 60 秒一次'); glInline(glCk);   // T07 H01 H02
  show(glCk, T('c8', '检查') - 0.2, { y: 8, d: 0.45 });
  // 文件长到 96 KB（A08：98,304 字节）
  stepTo(sz, [[T('c9', '长到') - 0.4, 1.1, 4, 96]], (v) => Math.round(v) + ' KB');

  solid(sz, T('c9', '4') - 0.2, 'ink'); to(sz, T('c9', '九十') - 0.1, { backgroundColor: K.spring, borderColor: K.spring, color: K.ink, duration: 0.35 });
  to(sz, T('c9b') - 0.3, { backgroundColor: 'rgba(0,0,0,0)', borderColor: 'rgba(0,0,0,0)', color: K.forest, duration: 0.35 });   // lint-ok: 退回文字

  // ══ 一页写下去之前：整理、压缩（A10 B04） ══
  const tRc = T('c9b') - 0.3;
  fadeOut([...MP.map((p) => p.c), memN, clock, clockT], tRc, 0.45);
  const big = h('div', 'abs', world); px(big, 200, 300, 620, 210); css(big, { background: '#fff', border: '3px solid ' + K.gb, borderRadius: '10px' });
  big.innerHTML = `<div style="position:absolute;left:20px;top:14px;font:700 28px 'Sans SC';color:${K.ink}">一个叶页 · 内存里的样子</div><div style="position:absolute;left:20px;top:64px;font:600 26px Mono;color:${K.gd2}">键、值、各种指针与新旧版本</div><div style="position:absolute;right:20px;bottom:16px;font:800 44px Inter;color:${K.ink}">118,705 字节</div>`;
  show(big, tRc + 0.3, { x: -30, y: 0, d: 0.5 });
  const step1 = h('div', 'abs', world); px(step1, 880, 300, 360, 210); css(step1, { background: '#fff', border: '3px solid ' + K.gb, borderRadius: '10px' });
  step1.innerHTML = `<div style="position:absolute;left:20px;top:14px;font:700 30px 'Sans SC';color:${K.ink}">整理</div><div style="position:absolute;left:20px;top:64px;font:500 26px 'Sans SC';color:${K.gd2}">换成磁盘上的格式</div>`;
  const step2 = h('div', 'abs', world); px(step2, 1300, 300, 440, 210); css(step2, { background: K.mint, border: '3px solid ' + K.g1, borderRadius: '10px' });
  step2.innerHTML = `<div style="position:absolute;left:20px;top:14px;font:700 30px 'Sans SC';color:${K.forest}">压缩 · snappy</div><div style="position:absolute;right:20px;bottom:16px;font:800 44px Inter;color:${K.forest}">24,576 字节</div>`;
  const ar1 = link(ov2, [[826, 405], [872, 405]], 'ink', { w: 3, arrow: true }), ar2 = link(ov2, [[1246, 405], [1292, 405]], 'ink', { w: 3, arrow: true });
  show(step1, T('c9b', '整理') - 0.3, { x: -20, y: 0, d: 0.45 }); arrowIn(ar1, T('c9b', '整理') - 0.35, 0.35);
  show(step2, T('c9b', '压缩') - 0.3, { x: -20, y: 0, d: 0.45 }); arrowIn(ar2, T('c9b', '压缩') - 0.35, 0.35);
  to(blks[0], T('c9b', '压缩') + 0.3, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.4 }); if (blks[0]._t) to(blks[0]._t, T('c9b', '压缩') + 0.3, { color: K.ink, duration: 0.4 });
  const fx = lead(ov2, [[1520, 516], [1520, 562], [band.xOf(16384), 562], [band.xOf(16384), 712]], { color: 'accent', w: 2.5, dashed: '7 6' });
  arrowIn(fx, T('c9b', '压缩') + 0.2, 0.5);

  // ══ 文件里的集合树（B03）：块升起来排成树 ══
  const tTr = T('c10') - 0.3;
  fadeOut([big, step1, step2, ar1, ar2, fx], tTr, 0.45);
  fadeOut(memZ, tTr, 0.45);
  to(blks[0], tTr, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.4 }); if (blks[0]._t) to(blks[0]._t, tTr, { color: '#FFFFFF', duration: 0.4 });
  fadeOut(glCk, tTr, 0.4);
  const LV = ['1–1224', '1225–2448', '2449–3123', '3124–4096'], CN = [1224, 1224, 675, 973];
  const LX = (i) => 170 + i * 410, LW = 360, LY = 420, LH = 132;
  const leaves = LV.map((r, i) => {
    const p = pageBox(world, LX(i), LY, LW, LH, `叶页 · ${r}`, { n: 3, rh: 12, gap: 10 });
    textAt(p.head, [[0, '叶页'], [T('c12', '连续') - 0.1 + i * 0.1, `叶页 · ${r}`]]);
    const c = h('div', 'abs', p.c, `${CN[i]} 份`); css(c, { right: '14px', bottom: '10px', font: '700 28px "Inter", "Sans SC"', color: K.ink });
    css(c, { color: '#FFFFFF', background: K.ink, borderRadius: '6px', padding: '0 10px' });
    set(c, s.start, { autoAlpha: 0 }); show(c, T('c11', '四个') - 0.2 + i * 0.12, { y: 6, d: 0.35 });
    to(p.c, T('c11', '四个') - 0.2 + i * 0.12, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.35 }); to(p.c, T('c13') - 0.2, { backgroundColor: '#FFFFFF', borderColor: K.gl1, duration: 0.35 });
    return p;
  });
  const rootB = h('div', 'abs', world); px(rootB, 660, 222, 600, 140); css(rootB, { background: K.ink, borderRadius: '10px', color: '#fff' });
  rootB.innerHTML = `<div style="position:absolute;left:20px;top:12px;font:700 26px 'Sans SC'">根页</div>` + [['1', '4096'], ['1225', '28672'], ['2449', '53248'], ['3124', '65536']].map(([k, o], i) => `<div class="re" style="position:absolute;left:${20 + i * 146}px;top:56px;width:132px;font:600 24px/1.45 Mono;text-align:left">≥ ${k}<br><span style="color:#71F6BA">@${o}</span></div>`).join('');
  const rl = LV.map((r, i) => link(ov, [[660 + 20 + i * 146 + 60, 362], [LX(i) + LW / 2, LY]], 'ink', { w: 2 }));
  const tLf = T('c10', '样子') - 0.5;
  leaves.forEach((p, i) => { tl.fromTo(p.c, { autoAlpha: 0, y: 760 - LY, scale: 0.4 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', immediateRender: true }, tLf + i * 0.12); });
  blks.slice(0, 4).forEach((e, i) => { to(e, T('c10', '样子') - 0.2 + i * 0.1, { backgroundColor: K.ink, borderColor: K.ink, duration: 0.35 }); to(e._t || e, T('c10', '样子') - 0.2 + i * 0.1, { color: K.spring, duration: 0.35 }); });
  show(rootB, T('c13', '根页') - 0.4, { y: -14, d: 0.5 });
  const glRt = gl(world, 1290, 226, '根页里的一格', '≥ 1225：这个叶页从键 1225 开始<br>@28672：它在文件里从第 28672 字节起');   // B03
  show(glRt, T('c13', '哪个') - 0.2, { x: 14, y: 0, d: 0.45 }); fadeOut(glRt, T('c15') - 0.4, 0.4);
  const ctT = tg(world, 170, 360, '集合树（文件里的样子）', 'g'); css(ctT, { fontSize: '30px', lineHeight: '52px', color: '#FFFFFF', background: K.forest, borderRadius: '10px', padding: '0 18px' }); show(ctT, T('c10', '集合树') - 0.3, { y: 8, d: 0.4 }); fadeOut(ctT, T('c13', '根页') - 0.5, 0.3);
  rl.forEach((p, i) => draw(p, T('c13', '根页') - 0.1 + i * 0.08, 0.5));
  // 叶页 ↔ 文件里的块：一条虚线
  const lb = LV.map((r, i) => { const b = BL[i]; const p = lead(ov2, [[LX(i) + LW / 2, LY + LH], [band.xOf((b[0] + b[1]) / 2), 712]], { dashed: '6 6', w: 2 }); arrowIn(p, tLf + 0.5 + i * 0.1, 0.5); return p; });
  // 叶页：一共四个，键和值都在这里；每个叶页一段连续的 RecordId
  leaves.forEach((p, i) => to(p.c, T('c11', '四个') - 0.2 + i * 0.12, { borderColor: K.g1, duration: 0.35 }));
  leaves.forEach((p, i) => to(p.head, T('c12', '每个') - 0.2 + i * 0.1, { color: K.forest, duration: 0.35 }));
  leaves.forEach((p, i) => solid(p.head, T('c12', '连续') - 0.1 + i * 0.1, 'new'));
  leaves.forEach((p, i) => to(p.head, T('c12', '连续') - 0.3 + i * 0.1, { backgroundColor: K.mint, duration: 0.35 }));
  leaves.forEach((p, i) => to(p.c.lastChild, T('c11', '键') - 0.1 + i * 0.12, { color: K.spring, duration: 0.3 }));
  leaves.forEach((p, i) => to(p.rows, T('c11', '值') - 0.2 + i * 0.1, { backgroundColor: K.forest, duration: 0.35 }));
  // 根页：每个叶页从哪个键开始、在文件哪里（分界键 + 偏移）
  const reEls = [...rootB.querySelectorAll('.re')];
  to(reEls, T('c13', '哪个') - 0.1, { color: K.spring, backgroundColor: K.forest, duration: 0.35 });
  blks.slice(0, 4).forEach((e, i) => { to(e, T('c13', '文件') - 0.1 + i * 0.1, { backgroundColor: K.spring, borderColor: K.forest, duration: 0.35 }); if (e._t) to(e._t, T('c13', '文件') - 0.1 + i * 0.1, { color: K.ink, duration: 0.35 }); });
  to(reEls, T('c14') - 0.2, { color: '#FFFFFF', duration: 0.35 });
  lb.forEach((p, i) => to(p, T('c13', '文件') - 0.1 + i * 0.1, { stroke: K.g1, duration: 0.3 }));
  // 找 2050：落在 1225 那一段，往下走到第二个叶页
  const key = h('div', 'abs', world, '2050'); px(key, 380, 260); css(key, { font: '800 52px "Mono"', color: '#FFFFFF', background: K.forest, border: '3px solid ' + K.forest, borderRadius: '10px', padding: '4px 18px' });
  show(key, T('c14', '找') - 0.2, { x: -20, y: 0, d: 0.45 });
  const kA = link(ov, [[560, 296], [652, 296]], 'accent', { w: 3, arrow: true }); arrowIn(kA, T('c14', '根页') - 0.2, 0.35);
  to(reEls[1], T('c14', '落在') - 0.2, { backgroundColor: K.spring, color: K.ink, duration: 0.35 }); to([...reEls[1].querySelectorAll('*')], T('c14', '落在') - 0.2, { color: K.ink, duration: 0.35 });
  to(rootB, T('c14', '根页') - 0.2, { backgroundColor: K.forest, duration: 0.35 }); to(rootB, T('c14b', '树') - 0.4, { backgroundColor: K.ink, duration: 0.35 });
  const path = link(ov, [[660 + 20 + 146 + 60, 362], [LX(1) + LW / 2, LY]], 'spring', { w: 7 }); draw(path, T('c14', '往下') - 0.2, 0.5);
  to(leaves[1].c, T('c14', '往下') + 0.2, { backgroundColor: K.forest, borderColor: K.forest, duration: 0.35 });
  leaves.forEach((p) => { p.c.dataset.name = 'leaf'; });
  to(reEls[1], T('c14b', '一样') - 0.35, { backgroundColor: K.forest, duration: 0.3 }); to([...reEls[1].querySelectorAll('*')], T('c14b', '一样') - 0.35, { color: K.mint, duration: 0.3 }); to(reEls, T('c14b', '一样') - 0.2, { color: K.spring, duration: 0.3 }); to(reEls, Tend('c14b') + 0.2, { color: '#FFFFFF', duration: 0.3 });   // 和 InnoDB、SQLite 一样：根页的分界亮一下
  to([band.wrap, sz], T('c14b', '一样') - 0.2, { opacity: 0.3, duration: 0.45 }); to([band.wrap, sz], T('c15') - 0.3, { opacity: 1, duration: 0.45 });   // 讲这棵树时文件条退后
  leaves.forEach((p, i) => to(p.c, T('c14b', 'Inno') - 0.2 + i * 0.08, { backgroundColor: K.mint2, borderColor: K.g1, duration: 0.3 }));
  const glBt = gl(world, 170, 228, 'B 树', '按键排好序、一层层往下找的树：<br>上层只记分界和下层的位置，<br>键和值在叶页');   // B01 T16
  css(glBt.querySelector('span'), { fontSize: '24px' });
  fadeOut([key, kA, path], T('c14b', '树') - 0.5, 0.35);
  show(glBt, T('c14b', '树') - 0.3, { x: 16, y: 0, d: 0.5 }); [0, 2, 3].forEach((i) => to(leaves[i].c, Tend('c14b') - 0.1, { backgroundColor: K.mint, borderColor: K.g1, duration: 0.4 }));
  // 两个索引：也是根页带一排叶页（_id 3 个叶页、姓名 15 个）
  const tIx = T('c15') - 0.2;
  const ixBox = h('div', 'panel', world); px(ixBox, 1270, 190, 520, 180);
  ixBox.innerHTML = [['_id 索引', 3], ['姓名索引', 15]].map(([lab, n], j) => {
    const lw = n > 8 ? 21 : 100, g = n > 8 ? 4 : 18, W = n * (lw + g) - g, x0 = 134;
    const lines = `<svg style="position:absolute;left:0;top:0" width="520" height="196">${Array.from({ length: n }, (_, k) => `<path d="M${x0 + W / 2} ${10 + j * 90 + 14}L${x0 + k * (lw + g) + lw / 2} ${46 + j * 90}" stroke="${K.ink}" stroke-width="1.4"/>`).join('')}</svg>`;
    const pre = `<div class="ixr" style="position:absolute;left:0;top:0;right:0;bottom:0">` + lines;
    return pre + `<div class="ixl" style="position:absolute;left:20px;top:${22 + j * 90}px;font:700 24px 'Sans SC';color:${K.ink}">${lab}</div><div style="position:absolute;left:${x0 + W / 2 - 34}px;top:${10 + j * 90}px;width:68px;height:14px;background:${K.ink};border-radius:3px"></div>` +
      Array.from({ length: n }, (_, k) => `<div style="position:absolute;left:${x0 + k * (lw + g)}px;top:${46 + j * 90}px;width:${lw}px;height:30px;background:${K.mint2};border:2px solid ${K.g1};border-radius:4px"></div>`).join('') +
      `<div style="position:absolute;left:20px;top:${54 + j * 90}px;font:500 22px 'Sans SC';color:${K.gd1}">${n} 个叶页</div></div>`;
  }).join('');
  show(ixBox, tIx, { x: 30, y: 0, d: 0.5 });
  to([...leaves.map((p) => p.c), rootB, ...rl, ...lb], T('c15', '索引') - 0.2, { opacity: 0.35, duration: 0.45 }); to([...leaves.map((p) => p.c), rootB, ...rl, ...lb], T('c22') - 0.1, { opacity: 1, duration: 0.45 });
  to(ixBox, tIx + 0.2, { backgroundColor: K.mint, borderColor: K.g1, duration: 0.4 });
  const ixr = [...ixBox.querySelectorAll('.ixr')];
  set(ixr, s.start, { autoAlpha: 0 }); show(ixr[0], tIx + 0.25, { y: 8, d: 0.4 }); show(ixr[1], T('c15', '一排') - 0.3, { y: 8, d: 0.4 });
  to([...ixBox.querySelectorAll('.ixl')], T('c22', '几棵') - 0.2, { color: K.forest, duration: 0.35 });
  // 章末：拿着一个名字去找
  const qn = h('div', 'abs', world, 'find({ <span class="k">name</span>: <span class="s">"Alice"</span> })'); px(qn, 150, 244); css(qn, { font: '600 30px "Mono"', color: K.ink, background: '#fff', border: '2px solid ' + K.g1, borderRadius: '10px', padding: '8px 18px' });
  show(qn, T('c22', '名字') - 0.3, { y: 10, d: 0.5 });
  to(qn, T('c22', 'Alice') - 0.2, { backgroundColor: K.forest, borderColor: K.forest, color: '#FFFFFF', duration: 0.35 }); to([...qn.querySelectorAll('span')], T('c22', 'Alice') - 0.2, { color: '#FFFFFF', duration: 0.35 });
  fadeOut(glBt, T('c22', '名字') - 0.6, 0.35);
});
