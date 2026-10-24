// 05 变长行与碎片。主画面：notes.MYD 画成一条字节带（一格一个字节），三行各占一块：20 / 44 / 20 字节，块头写明长度。
// 把第 1 行改长：原块留 7 字节数据和指向 0x54 的指针，其余 49 字节追加到文件末尾，一行分成两段。
// 字节取自 snap_01/02 的 notes.MYD；定长时每行 205 字节取自 notes.MYI 的 reclength（FACTS「05」）。
// 「更新越多、碎片越多」与 OPTIMIZE 的整理是示意图（FACTS 注明），画面角上标「示意」。
scene('s5', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world); cam.el = world;   // track() 换页时要淡出整块画布
  const ov = overlay(world);
  const st = h('style', '', root); st.textContent = `
    .cell { position:absolute; height:44px; }
    .tc-h { background:#3fb4cc; } .tc-a { background:#2b606c; } .tc-b { background:#1f4a54; } .tc-z { background:#1d1f22; }
    .tc-p { background:#e5534b; } .tc-o { background:#F29111; } .tc-n { background:#a85f05; }`;
  const A = R.notesMYD[0].match(/../g), B = R.notesMYD[1].match(/../g);
  const X = 200, Y = 560, CW = 12, N1 = B.length;              // 84 → 136 字节；一格 12 像素，136 字节在原尺寸下就放得下，镜头不必拉远
  // 每个字节属于哪一块、是不是块头
  const blockOf = (i) => (i < 20 ? 0 : i < 64 ? 1 : 2);
  const clsA = (i) => { const k = blockOf(i), o = i - [0, 20, 64][k]; if (o < 4) return 'tc-h'; return A[i] === '00' && (k !== 1 ? o >= 15 : o >= 43) ? 'tc-z' : (k === 1 ? 'tc-b' : 'tc-a'); };
  const cells = [...Array(N1)].map((_, i) => { const e = h('div', 'cell ' + (i < 84 ? clsA(i) : 'tc-o'), world); px(e, X + i * CW, Y, CW - 3, 44); return e; });

  // 表与三行：长度各不相同
  const head = h('div', 'abs mono', world, 'notes.MYD'); px(head, X, 128); css(head, { fontSize: '40px', color: '#F29111' });
  const size = h('div', 'abs mono', world, '84 字节'); px(size, X + 250, 134); css(size, { fontSize: '34px', color: '#8a8a8a' });
  const schema = h('div', 'abs mono', world, 'notes ( id INT, body <span class="c-o">VARCHAR(200)</span> )'); px(schema, X, 200); css(schema, { fontSize: '30px', color: '#d9d9d9' });
  const BODY = [['1', 'hello'], ['2', 'MyISAM stores rows in a .MYD file'], ['3', 'short']];
  const bodies = BODY.map(([id, b], i) => { const e = h('div', 'abs mono', world, `${id}  '${b}'`); px(e, X, 262 + i * 48); css(e, { fontSize: '30px', color: '#8a8a8a' }); return e; });
  appear(head, c0 + 0.1); appear(schema, c0 + 0.25);
  // 表、三行与字节带一开场就在；讲到「长度不再相同」时，三块的长度标出来
  bodies.forEach((e, i) => appear(e, c0 + 0.35 + i * 0.08)); sfx('blip', c0 + 0.35, { g: 0.4 });
  for (let i = 0; i < 84; i++) appear(cells[i], c0 + 0.5 + i * 0.01);
  appear(size, c0 + 0.5); sfx('drive', c0 + 0.5, { g: 0.5 });
  vanish(cells.slice(84), 0);
  const segs = [[0, 20, "'hello'"], [20, 64, "'MyISAM stores rows in a .MYD file'"], [64, 84, "'short'"]].map(([a, b, t_], k) => {
    const lb = h('div', 'abs mono', world, `${b - a} B`); px(lb, X + a * CW, Y - 44); css(lb, { fontSize: '26px', color: '#8a8a8a' });
    const br = h('div', 'abs', world); px(br, X + a * CW, Y - 10, (b - a) * CW - 3, 6); css(br, { background: k === 1 ? '#1f4a54' : '#2b606c' });
    appear(lb, T('e1', '长度') + 0.3 + k * 0.15); appear(br, T('e1', '长度') + 0.3 + k * 0.15);
    return [lb, br];
  });
  const dyn = h('div', 'abs mono', world, 'Row_format: <span class="c-o">Dynamic</span>'); px(dyn, X + 900, 200); css(dyn, { fontSize: '30px', color: '#8a8a8a' });
  const dynL = h('div', 'abs t-big', world, '动态格式'); px(dynL, X + 900, 252); css(dynL, { color: '#F29111' });
  appear(dyn, T('e2') - 0.1); show(dynL, T('e2', '动态') - 0.1, { y: 12, d: 0.4 }); sfx('thud', T('e2', '动态'), { g: 0.45 });

  // 块头：类型、数据长度、填充
  const callX = X + 40, callY = Y + 120;
  const hdr = ['03', '00', '0b', '05'].map((b, k) => { const e = h('div', 'abs mono', world, b); px(e, callX + k * 70, callY, 62, 60); css(e, { fontSize: '32px', lineHeight: '58px', textAlign: 'center', color: '#0b0b0c', background: '#3fb4cc' }); return e; });
  const hdrL = [['类型 3', 0, -44], ['数据 11 字节', 1, 74], ['填充 5', 3, -44]].map(([t_, k, dy]) => { const e = h('div', 'abs', world, t_); px(e, callX + k * 70, callY + dy); css(e, { font: '500 28px "Sans SC"', color: '#3fb4cc' }); return e; });
  const lead = path(ov, `M ${X + 30} ${Y + 50} L ${callX + 30} ${callY - 6}`, 'teal', { w: 2, arrow: false });
  const tH = T('e3', '头部') - 0.3;
  draw(lead, tH, 0.3); hdr.forEach((e, k) => slide(e, tH + 0.1 + k * 0.08, { y: -16, d: 0.35 })); hdrL.forEach((e, k) => appear(e, tH + 0.5 + k * 0.15));
  sfx('pop', tH + 0.1, { g: 0.5 });
  for (const k of [0, 1, 2]) for (let o = 0; o < 4; o++) classAt(cells[[0, 20, 64][k] + o], 'tc-o', tH, T('e4') - 0.2);
  const tE4 = T('e4') - 0.3;
  hide([...hdr, ...hdrL], tE4, { y: 0, d: 0.3 }); tl.to(lead, { autoAlpha: 0, duration: 0.3 }, tE4);
  // 空间省下了：定长要 3 × 205 = 615 字节
  const cmp = h('div', 'abs', world); px(cmp, X, Y + 110, 1600, 140);
  const bFix = h('div', 'abs', cmp); px(bFix, 0, 0, 1230, 40); css(bFix, { border: '2px dashed #808080' });
  const bDyn = h('div', 'abs', cmp); px(bDyn, 0, 70, 168, 40); css(bDyn, { background: '#2b606c' });
  const lFix = h('div', 'abs mono', cmp, '定长：每行 205 字节，3 行 615'); px(lFix, 1250, 0); css(lFix, { fontSize: '28px', color: '#8a8a8a' });
  const lDyn = h('div', 'abs mono', cmp, '动态：84'); px(lDyn, 188, 70); css(lDyn, { fontSize: '28px', color: '#3fb4cc' });
  css(lFix, { left: '0px', top: '-40px' });
  wipe(bFix, T('e4') - 0.4, { dir: 'l', d: 0.6 }); appear(lFix, T('e4') - 0.3);
  wipe(bDyn, T('e4', '省下') + 0.1, { dir: 'l', d: 0.3 }); appear(lDyn, T('e4', '省下') + 0.2); sfx('tick', T('e4', '省下'), { g: 0.5 });
  hide(cmp, T('e5') - 0.1, { y: 0, d: 0.2 });

  // 改长第 1 行：放不下
  const bar = h('div', 'blk mono', world); px(bar, X, Y + 110, 1600, 58); css(bar, { fontSize: '26px', lineHeight: '54px', paddingLeft: '18px', whiteSpace: 'pre', overflow: 'hidden' });
  const barIn = h('span', '', bar, '');
  appear(bar, T('e5') + 0.1);
  typeText(barIn, "<span class=\"c-o\">mysql&gt; </span><span class=\"k\">UPDATE</span> notes <span class=\"k\">SET</span> body='hello, this row just grew longer than its old slot' <span class=\"k\">WHERE</span> id=1;", T('e5') + 0.15, 70, { cursorUntil: T('e5') + 1.5, sfxGain: 0.5 });
  // 想要的长度（56 字节）比原块（20 字节）长：红色的一截压到了第 2 行上
  const over = h('div', 'abs', world); px(over, X, Y - 4, 56 * CW, 52); css(over, { border: '3px solid #e5534b' });
  const overL = tag(world, X + 20 * CW + 10, Y + 58, '56 B > 20 B', 'c-r');
  wipe(over, T('e5', '改长') - 0.1, { dir: 'l', d: 0.5 }); appear(overL, T('e5', '改长') + 0.3); sfx('error', T('e5', '放不下'), { g: 0.6 });
  hide([over, overL], T('e6', '别处') - 0.2, { y: 0, d: 0.2 }); hide(bar, T('e6', '指针') , { y: 0, d: 0.3 });
  // 写到别处：原块里留 7 字节 + 指向 0x54 的指针；其余 49 字节追加到末尾（块头 07 00 31）
  const tS = T('e6', '别处') - 0.2;
  const clsB = (i) => (i < 20 ? (i < 5 ? 'tc-h' : i < 13 ? 'tc-p' : 'tc-o') : i < 84 ? clsA(i) : (i < 87 ? 'tc-h' : 'tc-o'));
  for (let i = 0; i < 20; i++) keyed(cells[i]).at(tS + i * 0.01, { cls: 'cell ' + clsB(i) });
  cells.slice(84).forEach((e, k) => { keyed(e).at(0, { cls: 'cell ' + clsB(84 + k) }); appear(e, tS + 0.3 + k * 0.015); });
  keyed(size).at(tS + 0.6, { html: '136 字节', cls: 'abs mono c-o' }); sfx('drive', tS + 0.3, { g: 0.6 });
  const tailL = h('div', 'abs mono', world, '0x54'); px(tailL, X + 84 * CW, Y - 44); css(tailL, { fontSize: '26px', color: '#F29111' });
  appear(tailL, tS + 0.4);
  const ptr = path(ov, `M ${X + 9 * CW} ${Y + 50} C ${X + 9 * CW} ${Y + 170}, ${X + 86 * CW} ${Y + 170}, ${X + 86 * CW} ${Y + 52}`, 'red', { w: 3 });
  arrowIn(ptr, T('e6', '指针') - 0.1, 0.8); sfx('pop', T('e6', '连起来'), { g: 0.5 });
  const ptrL = tag(world, X + 30 * CW, Y + 150, '8 字节的指针 → 0x54', 'c-r'); appear(ptrL, T('e6', '指针') + 0.4);
  const twoL = lab(world, X + 30 * CW, Y + 200, '7 B + 49 B', 'c-o'); appear(twoL, T('e7') - 0.2); sfx('chime', T('e7', '两段'), { g: 0.4 });

  // 示意：更新越多，碎片越多；OPTIMIZE TABLE 把它们排回连续
  const SY = 880, SX = X, SW = 20;
  hide([ptrL, twoL], T('e8') - 0.4, { y: 0, d: 0.3 });
  const sketch = h('div', 'abs', world); px(sketch, SX, SY, 2200, 60);
  const note = tag(world, SX, SY - 46, '示意', 'c-d');
  const r = seeded(5), pieces = [], ROWS = 6;
  const COLS6 = ['#2b606c', '#1f4a54', '#2b606c', '#1f4a54', '#2b606c', '#1f4a54'];
  // 每行切成 1–3 段，打乱后排在带上
  for (let k = 0; k < ROWS; k++) { const n = k === 0 ? 3 : 1 + Math.floor(r() * 3); for (let j = 0; j < n; j++) pieces.push({ k, j, w: 2 + Math.floor(r() * 4) }); }
  const shuffled = pieces.slice().sort((a, b) => (a.k === 0 || b.k === 0 ? (a.k - b.k) * 0 + (a.j - b.j) * 0 : 0) || r() - 0.5);
  const order = pieces.slice().sort(() => r() - 0.5);
  // 第 0 行的三段分散在头、中、尾
  const p0 = order.filter((p) => p.k === 0), rest = order.filter((p) => p.k !== 0);
  const seq = [p0[0], ...rest.slice(0, 4), p0[1], ...rest.slice(4, 8), p0[2], ...rest.slice(8)];
  let xx = 0; seq.forEach((p) => { p.x0 = xx; xx += p.w * SW + 6; });
  let yy = 0; pieces.slice().sort((a, b) => a.k - b.k || a.j - b.j).forEach((p) => { p.x1 = yy; yy += p.w * SW + (p === pieces.filter((q) => q.k === p.k).slice(-1)[0] ? 6 : 0); });
  const tFr = T('e8', '碎片') - 0.6, tOp = T('e9b') - 0.2;
  seq.forEach((p) => {
    const e = h('div', 'abs', sketch); css(e, { height: '44px', width: (p.w * SW - 3) + 'px', background: p.k === 0 ? '#F29111' : COLS6[p.k] });
    fromTo(e, tFr, { left: p.x0, autoAlpha: 0 }, { left: p.x0, autoAlpha: 1, duration: 0.3 });
    fromTo(e, tOp, { left: p.x0 }, { left: p.x1, duration: 1.0, ease: 'power3.inOut', immediateRender: false });
  });
  appear(note, tFr); sfx('drive', tFr, { g: 0.5 });
  // 读第 0 行要跳转：头 → 中 → 尾
  const hop = (a, b) => `M ${SX + a.x0 + a.w * SW / 2} ${SY - 4} C ${SX + a.x0 + a.w * SW / 2} ${SY - 70}, ${SX + b.x0 + b.w * SW / 2} ${SY - 70}, ${SX + b.x0 + b.w * SW / 2} ${SY - 6}`;
  const h1 = path(ov, hop(p0[0], p0[1]), 'orange', { w: 2.5 }), h2 = path(ov, hop(p0[1], p0[2]), 'orange', { w: 2.5 });
  arrowIn(h1, T('e8', '跳转') - 0.3, 0.5); arrowIn(h2, T('e8', '跳转') + 0.2, 0.5); sfx('tick', T('e8', '跳转'), { g: 0.5 }); sfx('tick', T('e8', '跳转') + 0.5, { g: 0.5 });
  tl.to([h1, h2], { autoAlpha: 0, duration: 0.3 }, tOp - 0.3);
  const opt = h('div', 'abs mono', world, '<span class="c-o">mysql&gt;</span> <span class="k">OPTIMIZE TABLE</span> notes;'); px(opt, SX + 1060, SY + 12); css(opt, { fontSize: '30px', color: '#d9d9d9' });   // 放在示意带右边：不压字幕栏，也不压跳转箭头
  appear(opt, T('e9', 'OPTIMIZE') - 0.3); sfx('blip', T('e9', 'OPTIMIZE') - 0.3, { g: 0.5 });
  sfx('whoosh', tOp, { g: 0.4 }); sfx('chime', tOp + 1.0, { g: 0.4 });

  track(cam, s.start, { x: 960, y: 560, z: 1 }, []);   // 这一章只有一页，镜头不动
});
