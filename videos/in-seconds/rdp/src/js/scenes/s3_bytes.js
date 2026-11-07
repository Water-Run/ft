// 例子：同一个动作，两种办法各传多少。RDP 一侧取自 [MS-RDPEGDI] 带注释的样例（FACTS G4–G7），录像一侧是本机 H.264 实测（L2），
// 56K 拨号上的时间是按带宽算的（P3、L4）。
// 常驻：上面两块屏幕里的同一份记事本；你这边的字形缓存；下面一本「字节账」，磁贴面积与字节数成正比（边长 = √(字节 × 2)）。
scene('bytes', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const R = screen(world, 120, 170, 640, 380, tr('那边的电脑', 'The remote PC'));
  const Y = screen(world, 1160, 170, 640, 380, tr('你的电脑', 'Your PC'));
  wipe(R.el, c0 + 0.05, { dir: 'l', d: 0.45 }); wipe(Y.el, c0 + 0.15, { dir: 'r', d: 0.45 });
  const ROWS = ['RDP sends orders,', 'not pictures.', '', 'Glyphs are cached', 'once, then reused.', '', 'dumplings',
    'Scrolling is one', 'move order.', 'New lines: text.'];
  const LH = 40, TOP = 52;
  // 行在画面上的位置：屏幕 (120|1160, 170)，桌面内缩 14，记事本 (12, 10)，行左缩 14；等宽字每字 15.6 像素
  const ROWY = (i) => 170 + 14 + 10 + TOP + i * LH, RX = 120 + 14 + 12 + 14, YX = 1160 + 14 + 12 + 14, CW = 15.6;
  // 两边各一份记事本；行放在一个容器里，滚动时整体上移
  const mkPad = (desk) => {
    const el = h('div', 'pad', desk); px(el, 12, 10, 588, 332); h('div', 'bar', el, 'notes.txt');
    const body = h('div', 'abs', el); px(body, 0, 0, 588, 900);
    const clip = h('div', 'abs', el); px(clip, 0, 34, 588, 298); css(clip, { overflow: 'hidden' }); clip.appendChild(body); px(body, 0, -34, 588, 900);
    const lines = ROWS.map((t, i) => { const l = h('div', 'ln', body, esc(t)); css(l, { top: TOP + i * LH + 'px', fontSize: '26px', lineHeight: LH + 'px' }); return l; });
    return { el, body, lines };
  };
  const rp = mkPad(R.desk), yp = mkPad(Y.desk);
  // 那边：第 6 行是这一句要打的字，先空着；你这边：第 6 行及以后都还没画
  rp.lines[6].innerHTML = '';
  for (let i = 6; i < ROWS.length; i++) yp.lines[i].style.visibility = 'hidden';
  // ── x1：在远程的记事本里打一行字 ──
  const tType = Qf(T('x1', '打'));
  typeText(rp.lines[6], 'dumplings', tType, 9, { cursorUntil: tType + 1.6 });
  // ── 字节账（下半屏）──
  const K = 3.5, side = (b) => sideOf(b, K);
  const book = h('div', 'abs', world); px(book, 0, 0, 1920, 968);
  // 两步并排：左「写一行字」，右「往下翻一页」；每一步里左边 RDP（蓝）、右边录像（灰）
  const rowA = txt(book, 't-n', tr('写一行字', 'Type a line'), 120, 596), rowB = txt(book, 't-n', tr('往下翻一页', 'Scroll a page'), 800, 596);
  wipe(rowA, tType - 0.2, { dir: 'l', d: 0.35 });
  const leg = txt(book, 't-s dim', tr('磁贴面积按字节数画', 'Tile area = bytes'), 120, 900);
  wipe(leg, c0 + 0.8, { dir: 'l', d: 0.3 });
  // ── x2：录像的办法，把变了的那片像素压一遍，六百多字节 ──
  const tChg = Qf(T('x2', '变了')), tPress = Qf(T('x2', '压')), tNum = Qf(T('x2', '六百'));
  const ring = h('div', 'abs', R.desk); px(ring, 16, 10 + TOP + 6 * LH - 34 + 34, 300, LH); css(ring, { outline: '3px dashed var(--dim)', outlineOffset: '2px' });
  show(ring, tChg, { d: 0.3 }); hide(ring, tPress + 0.6, { d: 0.3 });
  // 录像的办法：一枚录像磁贴先到位；说到「变了的那片」时其余部分压暗，只照亮变了的那一行
  const recT = tile(world, 'vid', 800, 196, 200, 80, '', tr('录像', 'Video')); recT.lastChild.style.fontSize = '34px';
  slide(recT, Qf(T('x2', '录像')), { x: -80, d: 0.4 }); sfx('pop', Qf(T('x2', '录像')), { g: 0.5 }); hide(recT, Qf(T('x3', 'R D P')), { d: 0.35 });
  // 压暗用四块深色围住那一行（中间留空，不盖住字）
  const veil = h('div', 'abs', R.desk); px(veil, 0, 0, 612, 352); veil.style.opacity = '0'; veil.dataset.name = '压暗';
  [[0, 0, 612, 300], [0, 344, 612, 8], [0, 300, 10, 44], [602, 300, 10, 44]].forEach(([x, y, w, hh]) => { const e = blk(veil, '', x, y, w, hh); css(e, { background: 'var(--bg)' }); });
  fromTo(veil, tChg, { opacity: 0 }, { opacity: 0.6, duration: 0.4, immediateRender: false }); to(veil, Qf(T('x2', '六百')), { opacity: 0, duration: 0.45 });
  const vA = blk(book, 'c-vid', 400, 660, side(667), side(667)); vA.dataset.name = '667 字节';
  const vAl = txt(book, 't-n', tr('录像 · <span class="mono">667 B</span>', 'Video · <span class="mono">667 B</span>'), 400 + side(667) + 14, 664);
  // 被压成的灰块从那一行落进账本
  const drop = blk(world, 'c-vid', 0, 0, side(667), side(667)); drop.style.opacity = '0';
  fromTo(drop, tPress, { x: RX, y: ROWY(6), opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.1 }, { x: 400, y: 660, duration: 0.7, ease: 'power2.inOut' }, { opacity: 0, duration: 0.05 }], immediateRender: false });
  appear(vA, tPress + 0.82); sfx('thud', tPress + 0.8, { g: 0.5 });
  wipe(vAl, tNum, { dir: 'l', d: 0.3 }); sfx('pop', tNum, { g: 0.6 });
  // ── x3：每个字的样子，第一次出现时就存到你这边（字形缓存）──
  const tShelf = Qf(T('x3', '每个字')), tStore = Qf(T('x3', '样子'));
  const shelf = h('div', 'abs', world); px(shelf, 800, 330, 330, 220); css(shelf, { outline: '3px solid var(--you)', outlineOffset: '-3px' });
  const shLab = txt(world, 't-s', tr('你这边的字形缓存', 'Glyph cache, your side'), 800, 290); shLab.style.color = 'var(--fg)';
  const glyphs = 'dumplings'.split(''), slots = [];
  glyphs.forEach((g, i) => {
    const sl = h('div', 'abs', shelf); px(sl, 14 + (i % 3) * 104, 14 + Math.floor(i / 3) * 66, 94, 58); css(sl, { background: 'var(--tile)' });
    const n = txt(sl, 't-s dim', String(i), 8, 12); const ch = txt(sl, 'mono', g, 50, 2); css(ch, { fontSize: '40px', color: '#f2f2f2' });
    ch.style.visibility = 'hidden'; slots.push({ sl, ch, n });
  });
  wipe(shelf, tShelf, { dir: 't', d: 0.4 }); wipe(shLab, tShelf + 0.1, { dir: 'l', d: 0.35 }); sfx('pop', tShelf, { g: 0.6 });
  // 字从那一行飞进格子：第一次出现，传一次
  glyphs.forEach((g, i) => {
    const f = txt(world, 'mono', g, 0, 0); css(f, { fontSize: '30px', color: '#f2f2f2' }); f.style.opacity = '0';
    const t0 = tStore + i * 0.16, sx = RX + i * CW, sy = ROWY(6) + 2;
    const sl = slots[i].sl, tx = 800 + 14 + (i % 3) * 104 + 50, ty = 330 + 14 + Math.floor(i / 3) * 66 + 6;
    fromTo(f, t0, { x: sx, y: sy, opacity: 0, scale: 1 }, { keyframes: [{ opacity: 1, duration: 0.06 }, { x: tx, y: ty, scale: 1.9, duration: 0.4, ease: 'power2.out' }, { scale: 1.33, duration: 0.25 }, { opacity: 0, duration: 0.06 }], immediateRender: false });
    tl.set(slots[i].ch, { visibility: 'visible' }, t0 + 0.72);
    tl.set(slots[i].ch, { visibility: 'hidden' }, 0);
  });
  sfx('blip', tStore, { g: 0.5 });
  // ── x4：一个字母 d，九个字节（规范 4.6.1 的位图）──
  const tD = Qf(T('x4', '字母')), tNine = Qf(T('x4', '九个'));
  const dRing = h('div', 'abs', shelf); px(dRing, 14, 14, 94, 58); css(dRing, { outline: '3px solid var(--rdpl)', outlineOffset: '0px' });
  show(dRing, tD, { d: 0.3 }); hide(dRing, Qf(T('x5', '几号')), { d: 0.3 });
  const dPanel = h('div', 'abs', world); px(dPanel, 800, 640, 460, 300); dPanel.dataset.name = '字母 d 的位图';
  const D = [0x08, 0x08, 0x08, 0x78, 0x88, 0x88, 0x88, 0x88, 0x78];
  glyphGrid(dPanel, 0, 0, 26, D);
  const hex = txt(dPanel, 'mono', D.map((b) => b.toString(16).padStart(2, '0')).join('<br>'), 168, -2); css(hex, { fontSize: '24px', lineHeight: '29px' });
  const dCap = txt(dPanel, 't-s', tr('d · 5×9 点 · 9 B', 'd · 5×9 dots · 9 B'), 240, 110); dCap.style.color = 'var(--rdpl)';
  wipe(dPanel, tD + 0.1, { dir: 'l', d: 0.5 }); sfx('pop', tD + 0.1, { g: 0.6 });
  // 九个字节逐行亮一下：一行一个字节
  F((t) => { const k = clamp((t - tNine) / 0.9, 0, 1); hex.style.color = k > 0 && k < 1 ? 'var(--rdpl)' : ''; });
  // ── x5：之后只说几号字写在哪：一行九个字，四十七字节 ──
  const tSay = Qf(T('x5', '几号')), tLine = Qf(T('x5', '一航')), t47 = Qf(T('x5', '四十七'));
  hide(dPanel, tSay, { d: 0.35 });
  const ordT = tile(world, 'glyph', 0, 0, 220, 70); h('div', 'abs', ordT, tr('写字 · 0–8 号', 'Text · glyphs 0–8')); css(ordT.lastChild, { left: '14px', top: '16px', fontSize: '28px' });
  ordT.style.opacity = '0';
  fromTo(ordT, tSay, { x: 770, y: 200, opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.15 }, { x: 930, duration: 0.8, ease: 'power2.inOut' }, { opacity: 1, duration: 0.5 }, { opacity: 0, duration: 0.3 }], immediateRender: false });
  sfx('blip', tSay, { g: 0.6 });
  // 你这边：从格子里取字，排成那一行
  glyphs.forEach((g, i) => {
    const f = txt(world, 'mono', g, 0, 0); css(f, { fontSize: '30px', color: 'var(--you)' }); f.style.opacity = '0';
    const t0 = tLine + i * 0.08, sx = 800 + 14 + (i % 3) * 104 + 50, sy = 330 + 14 + Math.floor(i / 3) * 66 + 6;
    const tx = YX + i * CW, ty = ROWY(6) + 2;
    fromTo(f, t0, { x: sx, y: sy, opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.06 }, { x: tx, y: ty, duration: 0.55, ease: 'power2.inOut' }, { opacity: 0, duration: 0.06 }], immediateRender: false });
  });
  tl.set(yp.lines[6], { visibility: 'visible' }, tLine + 0.75); tl.set(yp.lines[6], { visibility: 'hidden' }, 0);
  sfx('tick', tLine + 0.7, { g: 0.6 });
  const rA = blk(book, 'c-rdp', 120, 680, side(47), side(47)); rA.dataset.name = '47 字节';
  const rAl = txt(book, 't-n rdpl', 'RDP · <span class="mono">47 B</span>', 120 + side(47) + 14, 664);
  slam(rA, t47, { from: 1.6, d: 0.3 }); wipe(rAl, t47 + 0.05, { dir: 'l', d: 0.3 }); sfx('pop', t47, { g: 0.7 });
  gauge(t47, Q(T('x6', '翻')), '47 B', '667 B');
  // ── x6：往下翻一页，录像这一帧要两万三千多字节 ──
  const tScroll = Qf(T('x6', '翻')), t23 = Qf(T('x6', '两万'));
  fromTo(rp.body, tScroll, { y: 0 }, { y: -3 * LH, duration: 0.5, ease: 'power2.inOut', immediateRender: false }); sfx('tick', tScroll, { g: 0.5 });
  wipe(rowB, tScroll, { dir: 'l', d: 0.35 });
  const vB = blk(book, 'c-vid', 1100, 660, side(23159), side(23159)); vB.dataset.name = '23159 字节';
  const vBk = txt(book, 't-n', tr('录像 · H.264 一帧', 'Video · one H.264 frame'), 1100 + side(23159) + 20, 664);
  const vBl = txt(book, 't-3 mono', '', 1100 + side(23159) + 20, 710);
  wipe(vBk, t23 - 0.1, { dir: 'l', d: 0.3 });
  wipe(vB, t23 - 0.1, { dir: 't', d: 0.6 }); sfx('thud', t23);
  appear(vBl, t23); countTo(vBl, 0, 23159, t23, 0.9, (v) => group3(Math.round(v)) + ' B');
  // ── x7：RDP 只说一句：把这块往上挪，十四个字节 ──
  const tMove = Qf(T('x7', '往上')), t14 = Qf(T('x7', '十四'));
  const mv = tile(world, 'move', 0, 0, 200, 70); h('div', 'abs', mv, tr('搬移', 'Move')); css(mv.lastChild, { left: '14px', top: '16px', fontSize: '30px' });
  mv.style.opacity = '0';
  fromTo(mv, tMove - 0.9, { x: 770, y: 200, opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.12 }, { x: 950, duration: 0.75, ease: 'power2.inOut' }, { opacity: 0, duration: 0.25 }], immediateRender: false });
  sfx('blip', tMove - 0.9, { g: 0.6 });
  fromTo(yp.body, tMove, { y: 0 }, { y: -3 * LH, duration: 0.5, ease: 'power2.inOut', immediateRender: false }); sfx('tick', tMove, { g: 0.6 });
  const rB = blk(book, 'c-rdp', 800, 684, side(14), side(14)); rB.dataset.name = '14 字节';
  const rBl = txt(book, 't-n rdpl', 'RDP · <span class="mono">14 B</span>', 800 + side(14) + 14, 664);
  slam(rB, t14, { from: 2, d: 0.3 }); wipe(rBl, t14 + 0.05, { dir: 'l', d: 0.3 }); sfx('pop', t14, { g: 0.7 });
  gauge(Q(T('x6', '翻')), Q(T('x9', '选项')), '14 B', '23 159 B');
  // ── x8：再补上露出来的几行（写字指令，你这边画）──
  const tFill = Qf(T('x8', '露出来'));
  [7, 8, 9].forEach((i, k) => {
    const g = blk(world, 'c-glyph', 0, 0, 56, 36); g.style.opacity = '0';
    fromTo(g, tFill - 0.6 + k * 0.15, { x: 770, y: 210, opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.08 }, { x: 1090, duration: 0.5, ease: 'power2.inOut' }, { opacity: 0, duration: 0.1 }], immediateRender: false });
    tl.set(yp.lines[i], { visibility: 'visible' }, tFill + k * 0.18); tl.set(yp.lines[i], { visibility: 'hidden' }, 0);
  });
  sfx('blip', tFill - 0.6, { g: 0.45 });
  // ── x9：远程桌面连接的选项里，卫星、56K 拨号都列着 ──
  const tOpt = Qf(T('x9', '选项')), tSat = Qf(T('x9', '卫星')), tModem = Qf(T('x9', '五十六'));
  exit(book, tOpt - 0.2, { x: -1920, d: 0.6 }); exit(shelf, tOpt - 0.2, { x: -1920, d: 0.6 }); exit(shLab, tOpt - 0.2, { x: -1920, d: 0.6 });
  sfx('whoosh', tOpt - 0.25, { g: 0.5 });
  const optHead = txt(world, 't-s dim', tr('远程桌面连接 · 体验 · 连接速度', 'Remote Desktop Connection · Experience · Speed'), 120, 588);
  // 选项原文取自本机中文版 mstsc.exe.mui（lab/out_05）
  const OPTS = ['调制解调器(56 kbps)', '低速宽带(256 kbps - 2 Mbps)', '卫星(2 Mbps - 16 Mbps，高延迟)', '高速宽带(2 Mbps - 10 Mbps)', 'WAN (10 Mbps 或更高速度，高延迟)', 'LAN (10 Mbps 或更高)'];
  const opt = OPTS.map((o, i) => { const e = h('div', 'tile c-tile', world, ''); px(e, 120, 630 + i * 52, 620, 46); h('div', 'abs', e, esc(o)); css(e.lastChild, { left: '16px', top: '6px', fontSize: '26px' }); return e; });
  wipe(optHead, tOpt, { dir: 'l', d: 0.35 });
  opt.forEach((e, i) => slide(e, tOpt + 0.1 + i * 0.07, { x: 60, d: 0.35 }));
  fromTo(opt[2], tSat, { backgroundColor: '#2b2b2b' }, { backgroundColor: C.rdp, duration: 0.35, immediateRender: false }); sfx('tick', tSat, { g: 0.7 });
  fromTo(opt[0], tModem, { backgroundColor: '#2b2b2b' }, { backgroundColor: C.rdp, duration: 0.35, immediateRender: false }); sfx('tick', tModem, { g: 0.7 });
  // ── x10：在 56K 拨号上，刚才那一帧录像要传三秒多（条按真实时间长出来）──
  const tBar = Qf(T('x10') + 0.1), BW = 960, DUR56 = 23159 * 8 / 56000;
  const barHead = txt(world, 't-s dim', tr('在 56 kbps 上传完要多久', 'Time to send at 56 kbps'), 820, 588);
  const vLab = txt(world, 't-s', tr('录像：刚才那一帧 · 23 159 B', 'Video: that frame · 23 159 B'), 820, 632);
  const vBar = blk(world, 'c-vid', 820, 674, BW, 84); vBar.dataset.name = '3.31 秒';
  const vT = txt(world, 't-3 mono', '', 840, 684);
  wipe(barHead, tOpt + 0.3, { dir: 'l', d: 0.35 }); wipe(vLab, tBar - 0.3, { dir: 'l', d: 0.3 });
  F((t) => { const k = clamp((t - tBar) / DUR56, 0, 1); vBar.style.width = (BW * k).toFixed(1) + 'px'; vBar.style.visibility = t >= tBar ? 'visible' : 'hidden'; vT.textContent = t >= tBar ? (DUR56 * k).toFixed(2) + tr(' 秒', ' s') : ''; });
  sfx('tick', tBar, { g: 0.5 }); sfx('chime', tBar + DUR56, { g: 0.5 });
  // ── x11：而 RDP 那句指令，两毫秒就到了 ──
  const tMs = Qf(T('x11', '两毫秒'));
  const rLab = txt(world, 't-s rdpl', tr('RDP：那句搬移指令 · 14 B', 'RDP: the move order · 14 B'), 820, 790);
  const rBar = blk(world, 'c-rdp', 820, 832, Math.max(3, Math.round(BW * 0.002 / DUR56)), 84); rBar.dataset.name = '0.002 秒';
  const rT = txt(world, 't-3 mono rdpl', tr('0.002 秒', '0.002 s'), 840, 842);
  wipe(rLab, tMs - 0.6, { dir: 'l', d: 0.3 }); appear(rBar, tMs); slam(rT, tMs, { from: 1.4, d: 0.3 }); sfx('pop', tMs, { g: 0.8 });
  gauge(tBar, s.end, '0.002 s', '3.31 s', tr('56K 拨号上传完 RDP / 录像', '56K modem: RDP / video'));
  [hex, dCap, vT, rT, vBl].forEach((e) => { e.dataset.overlapOk = '1'; });
  cam.track(s.start, { x: 952, y: 484, z: 1 }, [[s.start + 0.1, { x: 968 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
