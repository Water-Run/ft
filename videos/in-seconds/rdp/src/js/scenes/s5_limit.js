// 局限：和 Windows 绑得很深。被连的必须是 Windows，家庭版不行（FACTS D1）；只懂 Windows 的画法（D2）；
// 整屏都在变的画面指令说不过来，Windows 8 以后图片和视频交给视频编码（N1、N4）；视频流远程只认像素，哪个系统都能连，拼帧率（D3、V4、V5）。
scene('limit', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  // ── b1：它和 Windows 绑得很深 ──
  const tBind = Qf(T('b1', '绑'));
  const wTile = tile(world, 'tile', 120, 150, 300, 150, '', 'Windows'); wTile.style.outline = '4px solid var(--rdp)'; wTile.style.outlineOffset = '-4px';
  const rTile = tile(world, 'rdp', 460, 150, 300, 150, '', 'RDP');
  const tPre = Qf(T('b1', '前提'));
  slide(wTile, c0 + 0.1, { x: -60, d: 0.45 }); slide(rTile, tPre, { x: 240, d: 0.5 }); sfx('pop', c0 + 0.1, { g: 0.5 }); sfx('pop', tPre, { g: 0.6, p: 0.3 });
  fromTo(rTile, tBind, { x: 0 }, { x: -40, duration: 0.35, ease: 'power3.in', immediateRender: false });
  // 绑在一起：一道橙红的框把两块磁贴箍住
  const band = h('div', 'abs', world); px(band, 106, 136, 628, 178); css(band, { outline: '8px solid var(--fill)', outlineOffset: '-8px' }); band.dataset.name = '绑在一起';
  fromTo(band, tBind + 0.3, { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)', immediateRender: false });
  sfx('thud', tBind + 0.3);
  // ── b2：被连的那台电脑得是 Windows，家庭版还不行 ──
  const tWin = Qf(T('b2', 'Windows')), tHome = Qf(T('b2', '家庭版'));
  const edLab = txt(world, 't-s dim', tr('能被远程桌面连进去的 Windows', 'Windows editions that accept Remote Desktop'), 120, 340);
  wipe(edLab, tWin - 0.2, { dir: 'l', d: 0.35 });
  const eds = [[tr('专业版', 'Pro'), 120, 384], [tr('企业版', 'Enterprise'), 450, 384], [tr('教育版', 'Education'), 120, 500], ['Server', 450, 500]].map(([n, x, y], i) => {
    const e = tile(world, 'rdp', x, y, 310, 106, n, tr('可以', 'Yes')); e.lastChild.style.fontSize = '36px';
    slide(e, tWin + i * 0.08, { y: 40, d: 0.35 }); return e;
  });
  sfx('pop', tWin, { g: 0.6 });
  const home = tile(world, 'tile', 120, 616, 640, 106, tr('家庭版', 'Home'), tr('不行：只能去连别人', 'No: it can only connect out'));
  home.lastChild.style.fontSize = '36px'; home.style.outline = '4px solid var(--fill)'; home.style.outlineOffset = '-4px';
  slam(home, tHome, { from: 1.15, d: 0.35 }); sfx('thud', tHome, { g: 0.8 });
  // ── b3：它懂的，也只是 Windows 的画法 ──
  const tWay = Qf(T('b3', '画法'));
  const scr = screen(world, 900, 150, 900, 420, tr('那边的电脑', 'The remote PC'));
  wipe(scr.el, c0 + 0.3, { dir: 'r', d: 0.45 });
  const gdi = ['fill', 'glyph', 'move'].map((c, i) => { const e = tile(scr.desk, c, 24, 24 + i * 76, 330, 64); h('div', 'abs', e, [tr('填色', 'Fill'), tr('写字', 'Text'), tr('搬移', 'Move')][i]); css(e.lastChild, { left: '14px', top: '12px', fontSize: '30px' }); return e; });
  gdi.forEach((e, i) => slide(e, Qf(T('b3', '它懂')) + 0.2 + i * 0.3, { x: -40, d: 0.35 }));
  const gdiLab = txt(scr.desk, 't-s', tr('Windows 的绘图接口 GDI', 'Windows GDI drawing calls'), 24, 262); gdiLab.style.color = 'var(--rdpl)';
  wipe(gdiLab, tWay + 0.35, { dir: 'l', d: 0.35 }); sfx('blip', tWay, { g: 0.5 });
  // ── b4：游戏、电影这种整屏都在变的画面，指令说不过来 ──
  const tGame = Qf(T('b4', '游戏')), tMuch = Qf(T('b4', '说不过来'));
  const game = h('div', 'abs', scr.desk); px(game, 380, 0, 492, 392); game.dataset.name = '整屏都在变的画面';
  const cells = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 10; c++) { const e = blk(game, 'c-vid', c * 49, r * 49, 48, 48); cells.push(e); }
  const SH = ['c-vid', 'c-vid2', 'c-line', 'c-tile', 'c-rdp', 'c-you', 'c-fill', 'c-glyph', 'c-move'];
  let lastK = -1;
  F((t) => {
    // 每 1/12 秒整屏换一次：颜色由帧号和格号算出（固定公式，不用随机数）
    const k = t < tGame ? -1 : Math.floor((t - tGame) * 12);
    if (k === lastK) return; lastK = k;
    cells.forEach((e, i) => { e.className = 'blk ' + (k < 0 ? 'c-vid' : SH[(i * 7 + k * 13 + (i >> 3) * k) % SH.length]); });
  });
  wipe(game, tGame, { dir: 'l', d: 0.35 }); sfx('riser', tGame - 0.2, { g: 0.4 });
  // 指令越堆越多：一格一格往下压，压满出界
  const pile = h('div', 'abs', scr.desk); px(pile, 24, 252, 330, 140); css(pile, { overflow: 'hidden' });
  for (let i = 0; i < 24; i++) {
    const e = blk(pile, 'c-' + ['fill', 'glyph', 'move'][i % 3], (i % 6) * 55, 0, 50, 30); e.style.opacity = '0';
    fromTo(e, tMuch - 0.6 + i * 0.07, { y: -40, opacity: 0 }, { y: 104 - Math.floor(i / 6) * 34, opacity: 1, duration: 0.25, ease: 'power2.in', immediateRender: false });
  }
  hide(gdiLab, tMuch - 0.65, { d: 0.2 });
  sfx('error', tMuch + 0.6, { g: 0.5 });
  // ── b5、b5b：Windows 8 以后，图片和视频那一块交给视频编码 ──
  const t8 = Qf(T('b5', 'Windows')), tPic = Qf(T('b5', '图片')), tEnc = Qf(T('b5b', '视频编码'));
  const w8 = tile(world, 'rdp', 900, 590, 300, 100, '2012', 'Windows 8'); w8.lastChild.style.fontSize = '36px';
  slam(w8, t8, { from: 1.2, d: 0.35 }); sfx('thud', t8, { g: 0.7 });
  hide(pile, tPic - 0.2, { d: 0.3 });
  const zone = h('div', 'abs', world); px(zone, 900 + 14 + 380, 150 + 14, 492, 392); css(zone, { outline: '4px dashed var(--fill)', outlineOffset: '-4px' });
  show(zone, tPic, { d: 0.3 }); sfx('tick', tPic, { g: 0.6 });
  const zLab = txt(world, 't-s', tr('这一块：视频编码', 'This part: video codec'), 1300, 586);
  wipe(zLab, tEnc - 0.1, { dir: 'l', d: 0.3 });
  // 视频那一块走灰色的帧，字和窗口照旧走指令
  frameStream(world, tEnc, s.end, { x: 1560, y: 640 }, { x: 1800, y: 700 }, { period: 0.3, travel: 0.7, w: 80, h: 50 });
  sfx('blip', tEnc, { g: 0.5, p: 0.5 }); sfx('tick', Qf(T('b6', 'To')), { g: 0.5 });
  // ── b6：ToDesk、UU 远程只认像素，反倒哪个系统都能连 ──
  const tAny = Qf(T('b6', '哪个系统'));
  hide(zLab, tAny - 0.6, { d: 0.3 });
  const pfLab = txt(world, 't-s dim', tr('只认像素：两家官网列出的平台', 'Pixels only: platforms on their sites'), 1020, 720);
  wipe(pfLab, Qf(T('b6', 'To')), { dir: 'l', d: 0.35 });
  const rowP = (y, name, list, t0) => {
    const nm = txt(world, 't-n', name, 1020, y + 10); wipe(nm, t0 - 0.1, { dir: 'l', d: 0.3 });
    let x = 1180;
    list.forEach(([n, w], i) => { const e = tile(world, 'vid', x, y, w, 58); h('div', 'abs', e, n); css(e.lastChild, { left: '12px', top: '10px', fontSize: '26px' }); slide(e, t0 + i * 0.06, { y: 30, d: 0.3 }); x += w + 8; });
  };
  rowP(764, 'ToDesk', [['Win', 70], ['Mac', 74], ['Linux', 86], ['Android', 112], ['iOS', 62], [tr('鸿蒙', 'HarmonyOS'), 78]], tAny);
  rowP(834, tr('UU 远程', 'UU Remote'), [['Win', 70], ['macOS', 100], ['iOS', 62], ['Android', 112], ['TV', 56]], tAny + 0.25);
  sfx('pop', tAny, { g: 0.6 });
  // ── b7：又拼高帧率、低延迟，游戏也能玩 ──
  const tFps = Qf(T('b7', '高帧率')), tLow = Qf(T('b7', '低延迟')), tPlay = Qf(T('b7', '游戏'));
  const fp = [[tr('ToDesk 官网', 'ToDesk site'), '8K · 360FPS', tFps, 120], [tr('UU 远程官网', 'UU Remote site'), tr('4K · 144 帧', '4K · 144 fps'), tFps + 0.2, 450]].map(([k, v, t0, x]) => {
    const e = tile(world, 'vid', x, 760, 310, 106, k, v); e.lastChild.style.fontSize = '36px'; slam(e, t0, { from: 1.2, d: 0.3 }); return e;
  });
  sfx('pop', tFps, { g: 0.6 });
  const play = tile(world, 'vid', 120, 876, 640, 64, '', tr('远程游戏 · 低延迟', 'Remote gaming · low latency')); play.lastChild.style.fontSize = '30px'; play.lastChild.style.bottom = '12px';
  wipe(play, tLow, { dir: 'l', d: 0.4 }); sfx('tick', tPlay, { g: 0.6 });
  // b7 时左边让位：版本磁贴收起
  [edLab, ...eds, home].forEach((e) => to(e, tFps - 0.5, { opacity: 0, duration: 0.35 }));
  cam.track(s.start, { x: 952, y: 484, z: 1 }, [[s.start + 0.1, { x: 968 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
