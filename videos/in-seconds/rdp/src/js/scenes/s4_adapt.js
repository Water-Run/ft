// 优雅之处：画在多大的纸上由你这边说了算。连上时报上屏幕大小、缩放比例、键盘布局、时区（FACTS A1、A2），
// 那边的桌面照你的屏幕重新排；窗口拉大拉小，分辨率跟着变（A3，Windows 8.1 起）。录像只能整张缩放（A4）。复制、打印、声音各有通道（B3、B4、H7）。
// 示例值是本机的真实设置（research/lab/out_04_client_settings.txt）。
scene('adapt', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const head = txt(world, 'hdr', tr('你的电脑说了算', 'Your PC decides'), 230, 30); wipe(head, c0 + 0.05, { dir: 'l', d: 0.4 });
  const R = screen(world, 120, 170, 640, 380, tr('那边的电脑', 'The remote PC'));
  const Y = screen(world, 1160, 170, 640, 380, tr('你的电脑', 'Your PC'));
  wipe(R.el, c0 + 0.05, { dir: 'l', d: 0.45 }); wipe(Y.el, c0 + 0.15, { dir: 'r', d: 0.45 });
  // 那边的桌面：旧的排法（原来的分辨率）
  const old = h('div', 'abs', R.desk); px(old, 0, 0, 612, 352);
  notepad(old, 12, 10, 380, 250, 'notes.txt', ['RDP sends orders,', 'not pictures.', '', 'dumplings'], 24, 38);
  tile(old, 'rdp', 410, 10, 90, 90); tile(old, 'you', 410, 110, 90, 90); tile(old, 'fill', 510, 10, 90, 90);
  // ── a1：画在多大的纸上，由你这边说了算——你的电脑变大，变成主角 ──
  const tPaper = Qf(T('a1', '纸')), tYou = Qf(T('a1', '你这边'));
  const YW = 820, YH = 512, YX = 980, YY = 150;
  fromTo(Y.el, tPaper - 0.2, { left: 1160, top: 170, width: 640, height: 380 }, { left: YX, top: YY, width: YW, height: YH, duration: 0.7, ease: 'power3.inOut', immediateRender: false });
  sfx('whoosh', tPaper - 0.25, { g: 0.45 });
  const paperRing = h('div', 'abs', world); px(paperRing, YX + 14, YY + 14, YW - 28, YH - 28); css(paperRing, { outline: '4px solid var(--you)', outlineOffset: '0px' });
  show(paperRing, tYou, { d: 0.35 }); sfx('pop', tYou, { g: 0.6 });
  const ov = overlay(world);
  const dimW = path(ov, `M ${YX + 30} ${YY + YH / 2 - 30} L ${YX + YW - 30} ${YY + YH / 2 - 30}`, 'rdpl', { w: 3 });
  const dimH = path(ov, `M ${YX + YW / 2 + 160} ${YY + 40} L ${YX + YW / 2 + 160} ${YY + YH - 40}`, 'rdpl', { w: 3 });
  const dimWl = txt(world, 't-3 mono rdpl', '2560', YX + YW / 2 - 140, YY + YH / 2 - 100);
  const dimHl = txt(world, 't-3 mono rdpl', '1600', YX + YW / 2 + 180, YY + YH / 2 + 10);
  arrowIn(dimW, tPaper + 0.3, 0.5); arrowIn(dimH, tPaper + 0.45, 0.5);
  wipe(dimWl, tPaper + 0.5, { dir: 'l', d: 0.3 }); wipe(dimHl, tPaper + 0.65, { dir: 'l', d: 0.3 }); sfx('tick', tPaper + 0.3, { g: 0.5 });
  [dimW, dimH, dimWl, dimHl].forEach((e) => hide(e, Qf(T('a4', '桌面')), { d: 0.4 }));
  // ── a2、a3：连上的那一刻，你的电脑报上去的几项（蓝：RDP 传的数据）──
  const facts = [
    [tr('屏幕大小', 'Screen'), '2560×1600', Qf(T('a2', '屏幕大小'))],
    [tr('缩放比例', 'Scale'), '200%', Qf(T('a2', '缩放'))],
    [tr('键盘布局', 'Keyboard'), tr('中文（简体）', 'Chinese (Simplified)'), Qf(T('a3', '键盘'))],
    [tr('时区', 'Time zone'), 'UTC+8', Qf(T('a3', '时区'))],
  ];
  // 连上的那一刻：一枚「连接」磁贴从你的电脑走到那边
  const tConn = Qf(T('a2', '那一刻'));
  const conn = tile(world, 'rdp', 0, 0, 200, 80, '', tr('连上', 'Connect')); conn.lastChild.style.fontSize = '36px'; conn.lastChild.style.left = '76px'; icon(conn, 'link', 14, 14, 50); conn.style.opacity = '0';
  fromTo(conn, tConn, { x: 1000, y: 380, opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.15 }, { x: 560, duration: 0.9, ease: 'power2.inOut' }, { opacity: 0, duration: 0.25 }], immediateRender: false });
  sfx('whoosh', tConn, { g: 0.4 });
  const repLab = txt(world, 't-s dim', tr('连上时报过去的', 'Sent when connecting'), 120, 690);
  wipe(repLab, facts[0][2] - 0.3, { dir: 'l', d: 0.3 });
  const reps = facts.map(([k, v, t0], i) => {
    const e = tile(world, 'rdp', 120 + i * 425, 734, 405, 150, k, v); e.lastChild.style.fontSize = '48px'; icon(e, ['screen', 'zoom', 'keyboard', 'clock'][i], 405 - 86, 18, 64);
    // 从你的电脑那边飞下来，落进下面这一排
    fromTo(e, t0, { x: 1000 - i * 425, y: -420, scale: 0.5, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'power3.out', immediateRender: false });
    sfx('blip', t0, { g: 0.55, p: 0.4 - i * 0.2 });
    return e;
  });
  // ── a4：那边的桌面，就照你的屏幕重新排好（16:10、放大到 200%）──
  const tRe = Qf(T('a4', '重新排'));
  const tDesk = Qf(T('a4', '桌面'));
  hide(old, tDesk, { d: 0.5 }); sfx('tick', tDesk, { g: 0.4 });
  fromTo(R.el, tDesk + 0.3, { width: 640, height: 380 }, { width: 640, height: 428, duration: 0.6, ease: 'power2.inOut', immediateRender: false });
  const neo = h('div', 'abs', R.desk); px(neo, 0, 0, 612, 400); neo.dataset.name = '重新排好的桌面';
  const nPad = notepad(neo, 12, 10, 588, 300, 'notes.txt', ['RDP sends orders,', 'not pictures.', 'dumplings'], 40, 64, 60);
  css(nPad.el.firstChild, { fontSize: '28px', height: '40px', lineHeight: '40px' });
  const nT = [tile(neo, 'rdp', 12, 318, 180, 70), tile(neo, 'you', 204, 318, 180, 70), tile(neo, 'fill', 396, 318, 204, 70)];
  wipe(neo, tRe, { dir: 't', d: 0.55 }); sfx('pop', tRe, { g: 0.7 });
  const resLab = txt(world, 't-n mono rdpl', '2560×1600 · 200%', 120, 612);
  wipe(resLab, tRe + 0.2, { dir: 'l', d: 0.35 });
  // 你这边：同一个桌面，按你的屏幕画出来
  const mine = h('div', 'abs', Y.desk); px(mine, 0, 0, YW - 28, YH - 28);
  const mPad = notepad(mine, 16, 14, YW - 60, 360, 'notes.txt', ['RDP sends orders,', 'not pictures.', 'dumplings'], 50, 80, 70);
  css(mPad.el.firstChild, { fontSize: '32px', height: '44px', lineHeight: '44px' });
  tile(mine, 'rdp', 16, 390, 240, 80); tile(mine, 'you', 268, 390, 240, 80); tile(mine, 'fill', 520, 390, 252, 80);
  wipe(mine, tRe + 0.3, { dir: 't', d: 0.55 });
  // ── a5：窗口拉大拉小，远程的分辨率也跟着变 ──
  const tDrag = Qf(T('a5', '拉大')), tFollow = Qf(T('a5', '跟着'));
  // 你这边的「远程桌面连接」窗口：宽度按 1 → 0.8 → 0.92 变；那边的分辨率 = 2560 × 宽度比例（高同比）
  const KS = [[tDrag, 1, 0.8], [tFollow + 0.2, 0.8, 0.92]];
  const kAt = (t) => { let k = 1; for (const [t0, a, b] of KS) if (t >= t0) k = lerp(a, b, ease.io3(clamp((t - t0) / 0.8))); return k; };
  const win = h('div', 'abs', world); css(win, { outline: '4px dashed var(--you)', outlineOffset: '0px' }); win.dataset.name = '远程桌面连接的窗口';
  const winLab = txt(world, 't-s', tr('远程桌面连接的窗口', 'The Remote Desktop window'), 0, 0); winLab.style.color = 'var(--fg)';
  F((t) => {
    const k = kAt(t), w = (YW - 28) * k, hh = (YH - 28) * k;
    px(win, YX + 14, YY + 14, w, hh); px(winLab, YX + 14, YY + YH + 6);
    mine.style.transform = `scale(${k.toFixed(4)})`; mine.style.transformOrigin = '0 0';
    resLab.textContent = t >= tDrag ? `${Math.round(2560 * k)}×${Math.round(1600 * k)} · 200%` : '2560×1600 · 200%';
    neo.style.transform = `scale(${(0.8 + 0.2 * k).toFixed(4)})`; neo.style.transformOrigin = '0 0';
  });
  show(win, tDrag - 0.3, { d: 0.3 }); show(winLab, tDrag - 0.3, { d: 0.3 }); hide(paperRing, tDrag - 0.3, { d: 0.3 });
  sfx('tick', tDrag, { g: 0.5 }); sfx('tick', tFollow + 0.2, { g: 0.5 });
  const since = txt(world, 't-s dim', tr('Windows 8.1 起', 'Since Windows 8.1'), 520, 616);
  wipe(since, tFollow, { dir: 'l', d: 0.3 });
  // ── a6：录像的办法只能录屏幕本来的样子，尺寸不对就整张缩放 ──
  const tVid = Qf(T('a6', '录像')), tShrink = Qf(T('a6', '整张'));
  // 下面这一排让位给录像的对比
  [repLab, ...reps].forEach((e, i) => exit(e, tVid - 0.4 + i * 0.04, { y: 260, d: 0.45 }));
  const vb = h('div', 'abs', world); px(vb, 120, 712, 760, 230); vb.dataset.name = '录像：整张缩放';
  const vLab = txt(vb, 't-s dim', tr('录像：那块屏幕本来是 16:9', 'Video: the screen is 16:9'), 0, 0);
  const vWin = h('div', 'abs', vb); px(vWin, 0, 44, 300, 186); css(vWin, { outline: '3px dashed var(--you)', outlineOffset: '-3px' });
  const vPic = h('div', 'abs', vWin); px(vPic, 0, 0, 330, 186); vPic.style.transformOrigin = '0 50%';
  blk(vPic, 'c-vid', 0, 0, 330, 186); blk(vPic, 'c-paper', 18, 18, 190, 120); blk(vPic, 'c-vid2', 222, 18, 90, 70);
  css(vWin, { overflow: 'hidden' });
  wipe(vb, tVid, { dir: 'l', d: 0.45 }); sfx('pop', tVid, { g: 0.5 });
  // 先是比窗口宽、被切掉一截；然后整张缩小塞进去，上下留出黑边
  fromTo(vPic, tShrink, { scale: 1, y: 0 }, { scale: 300 / 330, y: 8, duration: 0.6, ease: 'power2.inOut', immediateRender: false }); sfx('tick', tShrink, { g: 0.6 });
  // ── a7、a7b：复制的字、要打印的文档、放出来的声音，各有通道 ──
  const tCopy = Qf(T('a7', '复制')), tPrint = Qf(T('a7', '打印')), tSound = Qf(T('a7', '声音')), tCh = Qf(T('a7b', '通道'));
  exit(vb, tCopy - 0.35, { x: -900, d: 0.45 }); exit(since, tCopy - 0.35, { x: -900, d: 0.45 }); hide(winLab, tCopy - 0.35, { d: 0.3 });
  const lanes = [[tr('剪贴板', 'Clipboard'), tCopy], [tr('打印机', 'Printer'), tPrint], [tr('声音', 'Sound'), tSound]].map(([lab, t0], i) => {
    const y = 724 + i * 76;
    const ln = blk(world, 'c-line', 300, y + 26, 1500, 6); wipe(ln, t0 - 0.1, { dir: 'l', d: 0.4 });
    const lb = txt(world, 't-n', lab, 170, y + 8); wipe(lb, t0 - 0.1, { dir: 'l', d: 0.3 }); const ic = icon(world, ['clip', 'printer', 'speaker'][i], 120, y + 6, 42, 'var(--rdpl)'); wipe(ic, t0 - 0.1, { dir: 'l', d: 0.3 });
    return { y, t0, ln, lb };
  });
  // 剪贴板里走的是字本身；打印走一张纸；声音走一段波形
  const tokCopy = txt(world, 'mono', 'dumplings', 0, 0); css(tokCopy, { fontSize: '30px', color: 'var(--rdpl)', background: 'var(--bg)', padding: '0 8px' });
  const tokPage = h('div', 'abs', world); px(tokPage, 0, 0, 40, 52); css(tokPage, { background: 'var(--paper)' });
  const tokWave = h('div', 'abs', world); px(tokWave, 0, 0, 90, 44);
  [10, 26, 40, 22, 34, 16, 8].forEach((hh, i) => blk(tokWave, 'c-rdp', i * 13, 22 - hh / 2, 8, hh));
  [[tokCopy, 0, 2], [tokPage, 1, 6], [tokWave, 2, 4]].forEach(([e, i, dy]) => {
    const t0 = lanes[i].t0, y = lanes[i].y + dy;
    e.style.opacity = '0';
    fromTo(e, t0, { x: 300, y, opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.15 }, { x: 1640, duration: 1.6, ease: 'power1.inOut' }], immediateRender: false });
    sfx(i === 0 ? 'blip' : 'tick', t0, { g: 0.5, p: -0.4 + i * 0.4 });
  });
  const gl = h('div', 'gloss', world, tr('通道：连接里另开的数据线路', 'Channel: a separate data line in the connection'));
  px(gl, 980, 674, 820, 40); gl.dataset.gloss = tr('通道', 'channel');
  css(gl, { background: 'var(--bg)' });
  wipe(gl, Qf(T('a7b')), { dir: 'l', d: 0.4 }); sfx('pop', Qf(T('a7b')), { g: 0.6 });
  [tokCopy, tokPage, tokWave, winLab, resLab].forEach((e) => { e.dataset.overlapOk = '1'; });
  cam.track(s.start, { x: 952, y: 484, z: 1 }, [[s.start + 0.1, { x: 968 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
