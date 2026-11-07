// 引子：你用过的 ToDesk、UU 远程——它们把屏幕录成视频一帧帧发过来；Windows 自带的远程桌面发的是画法。片名卡只上画面。
// 常驻：左边「那边的电脑」、右边「你的电脑」两块屏幕；中间这条路上先走灰色的帧，再走三种颜色的指令。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const R = monitor(world, 120, 290, 660, 420, tr('那边的电脑', 'The remote PC'));
  const Y = monitor(world, 1140, 290, 660, 420, tr('你的电脑', 'Your PC'));
  wipe(R.el, s.start + 0.05, { dir: 'l', d: 0.5 }); wipe(Y.el, s.start + 0.2, { dir: 'r', d: 0.5 }); sfx('whoosh', s.start + 0.05, { g: 0.4 });
  // 那边的桌面：一扇记事本、两块磁贴
  const rp = notepad(R.desk, 40, 40, 400, 300, 'notes.txt', ['Remote Desktop', 'Protocol', '', 'draw, not record'], 26, 40);
  const rt1 = tile(R.desk, 'rdp', 470, 40, 130, 130); const rt2 = tile(R.desk, 'you', 470, 186, 130, 130);
  [rp.el, rt1, rt2].forEach((e) => { e.dataset.name = '那边的桌面'; });
  // 说到「别人的电脑」时，那边的桌面才亮起来；「连过」时两台电脑之间拉出一条线
  const tOther = Qf(T('o1', '别人'));
  wipe(rp.el, tOther, { dir: 't', d: 0.45 }); slide(rt1, tOther + 0.15, { y: 40, d: 0.35 }); slide(rt2, tOther + 0.25, { y: 40, d: 0.35 }); sfx('pop', tOther, { g: 0.5 });
  const link = blk(world, 'c-line', 780, 500, 360, 6); wipe(link, Qf(T('o1', '连过')), { dir: 'l', d: 0.5 });
  // ── o1：ToDesk、UU 远程（灰：录像的办法）──
  const tdk = mtile(world, 'vid', 640, 96, 310, 120, { label: tr('录像', 'Video') }); logo(tdk, 'todesk', 40, 26, 230);
  const uu = mtile(world, 'vid', 970, 96, 310, 120, { label: tr('录像', 'Video') }); logo(uu, 'uu', 40, 14, 230);
  icon(tdk, 'record', 254, 70, 40); icon(uu, 'record', 254, 70, 40);
  turnIn(tdk, Qf(T('o1', 'To'))); sfx('pop', Qf(T('o1', 'To')), { g: 0.7, p: -0.1 });
  turnIn(uu, Qf(T('o1', '优优'))); sfx('pop', Qf(T('o1', '优优')), { g: 0.7, p: 0.1 });
  // ── o2：把屏幕录成视频，一帧帧发过来 ──
  const tRec = Qf(T('o2', '录成')), tStream = Qf(T('o2', '一帧')), tStop = Qf(T('o3', '远程桌面'));
  const flash = blk(R.desk, 'c-paper', 0, 0, 632, 392); flash.style.opacity = '0';
  fromTo(flash, tRec, { opacity: 0 }, { keyframes: [{ opacity: 0.55, duration: 0.08 }, { opacity: 0, duration: 0.5 }], immediateRender: false }); sfx('tick', tRec, { g: 0.8 });
  frameStream(world, tStream - 0.6, tStop, { x: 770, y: 476 }, { x: 1060, y: 476 }, { period: 0.32, travel: 0.9, w: 96, h: 60 });
  // 你这边：整张画面的拷贝（录下来的结果），第一帧到了才出现，换成 RDP 时收走
  const mirror = h('div', 'abs', Y.desk); px(mirror, 0, 0, 632, 392);
  const mp = notepad(mirror, 40, 40, 400, 300, 'notes.txt', ['Remote Desktop', 'Protocol', '', 'draw, not record'], 26, 40);
  tile(mirror, 'rdp', 470, 40, 130, 130); tile(mirror, 'you', 470, 186, 130, 130);
  mirror.dataset.name = '录下来的画面';
  show(mirror, tStream + 0.3, { d: 0.4 });
  const veil = blk(mirror, 'c-vid', 0, 0, 632, 392); veil.style.opacity = '0';      // 录像：整张都是像素，蒙一层灰
  fromTo(veil, tStream + 0.5, { opacity: 0 }, { opacity: 0.35, duration: 0.6, immediateRender: false });
  hide(mirror, tStop + 0.2, { d: 0.5 });
  // ── o3：Windows 自带的远程桌面，有更优雅的做法 ──
  to(tdk, tStop, { opacity: 0.35, duration: 0.5 }); to(uu, tStop, { opacity: 0.35, duration: 0.5 });
  const mstsc = tile(world, 'rdp', 560, 800, 320, 120, tr('远程桌面连接', 'Remote Desktop Connection'), 'mstsc', 'mono'); icon(mstsc, 'pc', 244, 52, 56);
  turnIn(mstsc, tStop + 0.1); sfx('pop', tStop + 0.1, { g: 0.8 });
  // ── o4：它叫 RDP，发过来的是画法 ──
  const tName = Qf(T('o4', 'R D P')), tWay = Qf(T('o4', '画法'));
  const rdpBig = txt(world, 't-1 rdpl', 'RDP', 930, 784); rdpBig.dataset.name = 'RDP';
  slam(rdpBig, tName, { from: 1.3, d: 0.4 }); sfx('thud', tName + 0.05);
  const rdpGl = h('div', 'gloss', world, tr('RDP：Remote Desktop Protocol，远程桌面协议', 'RDP: Remote Desktop Protocol')); px(rdpGl, 1240, 850, 600, 40);
  rdpGl.dataset.gloss = 'RDP'; wipe(rdpGl, tName + 0.3, { dir: 'l', d: 0.4 });
  // 三种指令磁贴依次飞过去；到了之后，你这边自己画出对应的东西
  const kinds = [['fill', tr('填色', 'Fill')], ['glyph', tr('写字', 'Text')], ['move', tr('搬移', 'Move')]];
  const drawn = [];
  kinds.forEach(([c, lab], i) => {
    const t0 = Q(Qf(T('o4', '发过来')) + i * 0.5);
    const e = tile(world, c, 0, 0, 150, 64, ''); icon(e, ['fill', 'doc', 'move'][i], 10, 10, 44); h('div', 'abs', e, lab); css(e.lastChild, { left: '62px', top: '12px', fontSize: '30px' });
    px(e, 0, 0); e.style.opacity = '0';
    fromTo(e, t0, { x: 760, y: 450, opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.1 }, { x: 1080, duration: 1.2, ease: 'power1.inOut' }, { opacity: 0, duration: 0.2 }], immediateRender: false });
    sfx('blip', t0, { g: 0.5, p: -0.3 + i * 0.3 });
    drawn.push(t0 + 1.3);
  });
  // 你这边照着指令，把同一个桌面画出来：先填出白纸，再写字，最后把两块磁贴搬到位（清清楚楚，不是灰蒙蒙的拷贝）
  const yp = notepad(Y.desk, 40, 40, 400, 300, 'notes.txt', ['Remote Desktop', 'Protocol', '', 'draw, not record'], 26, 40);
  yp.lines.forEach((l) => { l.style.visibility = 'hidden'; });
  yp.el.dataset.name = '你这边画出来的记事本';
  wipe(yp.el, drawn[0], { dir: 't', d: 0.35 });
  yp.lines.forEach((l, i) => { tl.set(l, { visibility: 'hidden' }, 0); tl.set(l, { visibility: 'visible' }, drawn[1] + i * 0.08); });
  const yb1 = tile(Y.desk, 'rdp', 470, 40, 130, 130), yb2 = tile(Y.desk, 'you', 470, 186, 130, 130);
  slide(yb1, drawn[2], { y: 60, d: 0.4 }); slide(yb2, drawn[2] + 0.1, { y: 60, d: 0.4 }); sfx('tick', drawn[2], { g: 0.5 });
  // ── 片名卡：磁贴版的开始屏 ──
  const tCard = Q(Tend('o4') + 0.15);
  const card = h('div', 'abs', root); px(card, 0, 0, 1920, VH); card.style.background = 'var(--bg)';
  const big = tile(card, 'rdp', 120, 200, 760, 420, tr('远程桌面协议', 'Remote Desktop Protocol'));
  const bigT = txt(big, '', 'RDP', 30, 150); css(bigT, { font: '600 230px "Inter"', letterSpacing: '-.03em', lineHeight: '1' });
  const tsec = txt(card, 't-1', `${TOTAL}<span class="t-3" style="margin-left:14px">${tr('秒了解', 's')}</span>`, 960, 230);
  const tname = txt(card, '', 'RDP', 960, 400); css(tname, { font: '600 150px "Inter"', lineHeight: '1' });
  const tsub = txt(card, 't-3', tr('Windows 远程的优雅实现', 'Windows remoting, done elegantly'), 966, 580);
  const sm = [tile(card, 'you', 120, 630, 250, 120, tr('诞生', 'Born'), '1998'), tile(card, 'fill', 380, 630, 240, 120, tr('端口', 'Port'), '3389', 'mono'), tile(card, 'glyph', 630, 630, 250, 120, tr('传的是', 'Sends'), tr('画法', 'the drawing'))];
  appear(card, tCard);
  wipe(big, tCard, { dir: 'l', d: 0.4 }); sfx('whoosh', tCard - 0.05, { g: 0.7 });
  [['clock', 0], ['globe', 1], ['fill', 2]].forEach(([n, i]) => icon(sm[i], n, [250, 240, 250][i] - 70, 14, 52));
  turnAll(sm, tCard + 0.25, 0.1);
  // 动态磁贴：片名卡停着时，三块小磁贴依次翻一圈（开始屏的动态磁贴）
  sm.forEach((e, i) => fromTo(e, tCard + 1.3 + i * 0.35, { rotationX: 0 }, { rotationX: 360, transformPerspective: 900, duration: 0.8, ease: 'power2.inOut', immediateRender: false }));
  sfx('tick', tCard + 1.3, { g: 0.4 });
  slam(tsec, tCard + 0.3, { from: 1.2, d: 0.35 }); sfx('thud', tCard + 0.3);
  wipe(tname, tCard + 0.45, { dir: 'l', d: 0.4 }); wipe(tsub, tCard + 0.3, { dir: 'l', d: 0.4 });
  [card, big, bigT, tsec, tname, tsub, ...sm].forEach((e) => { e.dataset.overlapOk = '1'; });
  // 停留：只朝一个方向极慢横移
  cam.track(s.start, { x: 950, y: 484, z: 1 }, [[s.start + 0.1, { x: 970 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
