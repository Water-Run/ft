// 本质区别：站的位置。录像的办法站在屏幕外面，只认像素；RDP 站在 Windows 里面，在指令变成像素之前接过来。
// 主画面：那边的电脑画成两层——后面是 Windows（画窗口的地方），前面是屏幕（像素）。讲到 RDP 时屏幕往前下方让开，露出里面的 Windows 层。
scene('stand', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const head = txt(world, 't-3', tr('站的位置', 'Where it stands'), 230, 34);
  wipe(head, c0 + 0.05, { dir: 'l', d: 0.4 });
  // ── 两层：Windows（后）与屏幕（前）──
  const winL = tile(world, 'tile', 200, 170, 720, 440); winL.style.outline = '4px solid var(--rdp)'; winL.style.outlineOffset = '-4px';
  const winLab = txt(winL, 't-n', 'Windows', 20, 12); winLab.dataset.name = 'Windows 层';
  const scr = screen(world, 280, 250, 720, 440);
  const scrLab = txt(scr.el, 't-n', tr('屏幕', 'Screen'), 736, 0); scrLab.dataset.name = '屏幕';
  const pad0 = notepad(scr.desk, 40, 40, 440, 330, 'notes.txt', ['Remote Desktop', 'Protocol', '', 'draw, not record'], 28, 44);
  tile(scr.desk, 'rdp', 510, 40, 150, 150); tile(scr.desk, 'you', 510, 210, 150, 150);
  wipe(winL, c0 + 0.1, { dir: 't', d: 0.45 }); wipe(scr.el, c0 + 0.25, { dir: 'l', d: 0.45 }); sfx('whoosh', c0 + 0.1, { g: 0.4 });
  // 你的电脑
  const Y = screen(world, 1300, 300, 520, 330, tr('你的电脑', 'Your PC'));
  wipe(Y.el, c0 + 0.35, { dir: 'r', d: 0.45 });
  // k1「站的位置」：两个位置先放上问号——一个在屏幕外，一个在 Windows 里
  const tPos = Qf(T('k1', '位置'));
  const qOut = tile(world, 'vid', 1040, 360, 210, 110, '', '?'); const qIn = tile(world, 'rdp', 720, 196, 180, 96, '', '?');
  [qOut, qIn].forEach((e, i) => { e.lastChild.style.fontSize = '56px'; slam(e, tPos + i * 0.15, { from: 1.3, d: 0.35 }); });
  sfx('pop', tPos, { g: 0.6 });
  // ── k2：ToDesk、UU 远程站在屏幕外面 ──
  const tOut = Qf(T('k2', 'To')), tOutside = Qf(T('k2', '外面'));
  const rec = tile(world, 'vid', 1040, 360, 210, 110, tr('录像', 'Record'), 'ToDesk · UU', '');
  rec.lastChild.style.fontSize = '30px';
  slide(rec, tOut, { x: 120, d: 0.45 }); sfx('pop', tOut, { g: 0.7 }); hide(qOut, tOut, { d: 0.25 });
  const ov = overlay(world);
  // 「拍」的视线：从录像磁贴指向屏幕正面
  const sight = [path(ov, 'M 1040 380 L 1000 330', 'dim', { w: 3, arrow: false, dashed: true }), path(ov, 'M 1040 450 L 1000 600', 'dim', { w: 3, arrow: false, dashed: true })];
  sight.forEach((p) => drawIn(p, tOutside, 0.4));
  const outLab = txt(world, 't-n dim', tr('屏幕外面', 'Outside the screen'), 1046, 486);
  wipe(outLab, tOutside + 0.1, { dir: 'l', d: 0.35 }); sfx('tick', tOutside, { g: 0.5 });
  // 「屏幕」：屏幕这一层的玻璃亮一下——录像磁贴在它外面
  const glass = blk(scr.el, 'c-paper', 0, 0, 720, 440); glass.style.opacity = '0';
  fromTo(glass, Qf(T('k2', '站在')), { opacity: 0 }, { keyframes: [{ opacity: 0.3, duration: 0.15 }, { opacity: 0, duration: 0.9 }], immediateRender: false });
  // ── k3：每秒截几十次屏，压成视频发过来 ──
  const tShot = Qf(T('k3', '截')), tSend = Qf(T('k3', '发过来')), tStop = Qf(T('k5', 'R D P'));
  const flash = blk(scr.desk, 'c-paper', 0, 0, 692, 412); flash.style.opacity = '0';
  for (let k = 0; k < 6; k++) fromTo(flash, tShot + k * 0.42, { opacity: 0 }, { keyframes: [{ opacity: 0.22, duration: 0.06 }, { opacity: 0, duration: 0.3 }], immediateRender: false });
  sfx('tick', tShot, { g: 0.6 });
  frameStream(world, tShot, tStop, { x: 1150, y: 500 }, { x: 1320, y: 560 }, { period: 0.42, travel: 0.8, w: 90, h: 56 });
  const vGl = h('div', 'gloss', world, tr('视频：一张张整屏截图，压缩后连着发', 'Video: full-screen captures, compressed and streamed')); px(vGl, 1300, 640, 520, 40);
  vGl.dataset.gloss = tr('视频', 'video'); wipe(vGl, tShot + 0.4, { dir: 'l', d: 0.4 });
  // 你这边：收到的是一张张画好的图（灰蒙蒙的拷贝）
  const ym = h('div', 'abs', Y.desk); px(ym, 0, 0, 492, 302); ym.dataset.name = '收到的画面';
  notepad(ym, 28, 28, 300, 230, 'notes.txt', ['Remote Desktop', 'Protocol', '', 'draw, not record'], 24, 38);
  tile(ym, 'rdp', 350, 28, 110, 110); tile(ym, 'you', 350, 150, 110, 110);
  const yv = blk(ym, 'c-vid', 0, 0, 492, 302); yv.style.opacity = '0.35';
  show(ym, tSend, { d: 0.4 });
  // ── k4：它只认像素——把一帧放大，是一格一格的颜色 ──
  const tPix = Qf(T('k4', '像素')), rnd = seeded(7);
  const mos = h('div', 'abs', world); px(mos, 1300, 690, 520, 200); mos.dataset.name = '像素';
  const shades = ['c-paper', 'c-vid', 'c-vid2', 'c-tile', 'c-line'];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 26; c++) {
    // 左半像白纸上的字，右半像两块磁贴：只是颜色，没有「字」「窗口」的意思
    let cl = c < 15 ? (rnd() < 0.18 ? 'c-tile' : 'c-paper') : (r < 4 ? 'c-rdp' : 'c-you');
    if (c === 15) cl = 'c-line';
    blk(mos, cl, c * 20, r * 25, 19, 24);
  }
  wipe(mos, tPix, { dir: 'l', d: 0.6 }); sfx('blip', tPix, { g: 0.6 });
  const pixLine = path(ov, 'M 1560 632 L 1560 686', 'dim', { w: 3, arrow: false }); drawIn(pixLine, tPix - 0.2, 0.3);
  // ── k5：RDP 站在 Windows 里面——屏幕往前下方让开 ──
  const tIn = Qf(T('k5', 'Windows'));
  to(scr.el, tStop - 0.1, { x: 160, y: 260, duration: 0.7, ease: 'power3.inOut' }); sfx('whoosh', tStop - 0.15, { g: 0.5 });
  [rec, outLab, mos, vGl, ...sight, pixLine].forEach((e) => to(e, tStop - 0.1, { opacity: 0.28, duration: 0.5 }));
  hide(ym, tStop, { d: 0.4 });
  const rdp = tile(world, 'rdp', 720, 196, 180, 96, '', 'RDP'); rdp.lastChild.style.fontSize = '52px';
  hide(qIn, tIn - 0.05, { d: 0.2 }); slam(rdp, tIn, { from: 1.3, d: 0.4 }); sfx('thud', tIn);
  const inLab = txt(world, 't-n rdpl', tr('Windows 里面', 'Inside Windows'), 560, 120);
  wipe(inLab, tIn + 0.15, { dir: 'l', d: 0.35 });
  // ── k6：Windows 画窗口、写字，本来就是一句句指令 ──
  const tDraw = Qf(T('k6', '画窗口')), tWrite = Qf(T('k6', '写字')), tOrd = Qf(T('k6', '指令'));
  const ords = [
    ['fill', tr('填色', 'Fill'), '(40,40) 440×330', tDraw],
    ['glyph', tr('写字', 'Text'), '"A" @ (70,110)', tWrite],
    ['move', tr('搬移', 'Move'), '(510,40) ↑ 40', tOrd],
  ].map(([c, lab, arg, t0], i) => {
    const e = tile(world, c, 230, 230 + i * 92, 440, 80);
    h('div', 'abs', e, lab); css(e.children[0], { left: '16px', top: '20px', fontSize: '30px' });
    h('div', 'abs mono', e, arg); css(e.children[1], { left: '120px', top: '22px', fontSize: '28px' });
    slide(e, t0, { x: -60, d: 0.4 }); sfx('blip', t0, { g: 0.5, p: -0.3 });
    return e;
  });
  const oGl = h('div', 'gloss', world, tr('指令：Windows 画图时的一条条命令', 'Order: one drawing command from Windows')); px(oGl, 960, 120, 820, 40);
  oGl.dataset.gloss = tr('指令', 'order'); wipe(oGl, tOrd + 0.2, { dir: 'l', d: 0.4 });
  // ── k7：在这儿填一块颜色，在那儿写一个字（屏幕上真的出现）──
  const tFill = Qf(T('k7', '填')), tChar = Qf(T('k7', '写'));
  const sFill = blk(scr.desk, 'c-fill', 40, 40, 440, 330); sFill.dataset.name = '填出来的颜色';
  wipe(sFill, tFill, { dir: 't', d: 0.45 }); sfx('pop', tFill, { g: 0.6 });
  const sChar = txt(scr.desk, 't-1', 'A', 70, 110); sChar.style.color = '#f2f2f2';
  wipe(sChar, tChar, { dir: 'l', d: 0.35 }); sfx('pop', tChar, { g: 0.6, p: 0.2 });
  // ── k8：在变成像素之前接过来，交给你的电脑自己画 ──
  const tGrab = Qf(T('k8', '接过来')), tGive = Qf(T('k8', '交给')), tSelf = Qf(T('k8', '自己画'));
  ords.forEach((e, i) => {
    fromTo(e, tGrab + i * 0.1, { x: 0, y: 0, scale: 1 }, { x: 500, y: -40 - i * 92, scale: 0.4, transformOrigin: '0% 0%', duration: 0.5, ease: 'power2.in', immediateRender: false });
    to(e, tGrab + 0.6 + i * 0.1, { opacity: 0, duration: 0.15 });
  });
  sfx('tick', tGrab, { g: 0.6 });
  // 从 RDP 磁贴出发，沿上方这条路飞到你的电脑
  const fly = [['fill', 0], ['glyph', 1], ['move', 2]].map(([c, i]) => { const e = blk(world, 'c-' + c, 0, 0, 60, 40); e.style.opacity = '0'; return e; });
  fly.forEach((e, i) => {
    const t0 = tGive + i * 0.22;
    fromTo(e, t0, { x: 900, y: 226, opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.08 }, { x: 1240, duration: 0.5, ease: 'power2.inOut' }, { x: 1330 + i * 70, y: 340, duration: 0.35, ease: 'power2.in' }, { opacity: 0, duration: 0.12 }], immediateRender: false });
    sfx('blip', t0, { g: 0.45, p: 0.2 + i * 0.2 });
  });
  const flyPath = path(ov, 'M 900 244 L 1270 244', 'rdpl', { w: 3, arrow: false, dashed: true }); drawIn(flyPath, tGive - 0.2, 0.5);
  // 你这边照指令自己画：同样的颜色块、同一个字（不是灰蒙蒙的拷贝）
  const yFill = blk(Y.desk, 'c-fill', 28, 28, 300, 230); yFill.dataset.name = '你这边画出的颜色';
  const yChar = txt(Y.desk, 't-2', 'A', 50, 80); yChar.style.color = '#f2f2f2';
  wipe(yFill, tSelf - 0.1, { dir: 't', d: 0.4 }); wipe(yChar, tSelf + 0.25, { dir: 'l', d: 0.3 }); sfx('pop', tSelf, { g: 0.7 });
  [winLab, sChar, yChar].forEach((e) => { e.dataset.overlapOk = '1'; });
  cam.track(s.start, { x: 952, y: 484, z: 1 }, [[s.start + 0.1, { x: 968 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
