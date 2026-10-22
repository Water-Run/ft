// 02 同一套引擎，两个入口：引擎是可加载的库；客户端按连接串在提供程序链里分流；服务端或应用进程加载同一个库，读写同一个文件。
// 主画面：两条通道——远程经 firebird.exe，本地由应用自己加载 engine13；服务端停掉后，下面那条照样读写 users.fdb。
scene('engine', ({ root, s, c0 }) => {
  const { world, under, over } = stage(root, 3840, 1080);
  const cam = makeCamera(world);

  // ── 站 0：引擎库与提供程序链 ──
  const lib = fileIcon(world, 160, 270, 380, 420, 'engine13.dll');
  const libM = blk(lib, '', '<img src="img/fb-mark.png" style="width:100%">', 110, 120, 160, 162);
  const libP = tx(world, 'm3 dim', 'plugins/engine13.dll', 160, 720);
  const libL = tx(world, 't3', '可加载的库', 160, 186, { fontWeight: 700 });
  wipe(lib, c0 + 0.1, { dir: 't', d: 0.55 }); sfx('pop', c0 + 0.3, { g: 0.5, p: -0.6 });
  appear(libP, c0 + 0.5);
  wipe(libL, T('e1', '可加载') - 0.15, { dir: 'l', d: 0.45 }); sfx('tick', T('e1', '可加载'), { g: 0.45, p: -0.6 });

  const cl = blk(world, 'chip w lat', 'fbclient', 720, 270, 380, 92, { fontSize: '42px', fontWeight: 600, outline: '4px solid ' + C.ink, outlineOffset: '-4px' });
  cl.dataset.name = '客户端库 fbclient';
  const clL = tx(world, 't5', '客户端', 720, 214);
  const plist = alist(world, 1280, 270, ['Remote', 'Engine13', 'Loopback'], { w: 460, fs: 38 });
  plist.els.forEach((e) => { e.style.fontFamily = 'Heebo'; });
  const plL = tx(world, 't5', '提供程序（按顺序尝试）', 1280, 214);
  const s1 = tx(world, 'm2', '', 720, 480), s2 = tx(world, 'm2', '', 720, 640);
  const s1L = tx(world, 't5', '连接串 · 带网络协议', 720, 430), s2L = tx(world, 't5', '连接串 · 只有本地路径', 720, 590);
  const tE2 = T('e2');
  wipe(cl, tE2 - 0.3, { dir: 'l', d: 0.45 }); appear(clL, tE2 - 0.1);
  plist.els.forEach((e, i) => slide(e, tE2 + 0.05 + i * 0.12, { x: 60, d: 0.5, ease: 'power3.out' }));
  appear(plL, tE2 + 0.1); sfx('pop', tE2 + 0.1, { g: 0.4, p: 0.4 });
  const tS1 = T('e2', '连接串') - 0.1;
  appear(s1L, tS1); during(s1, tS1, 1e9); const tS1e = typeText(s1, 'inet://server/users.fdb', tS1, 34, { cursorUntil: tS1 + 1.1, sfxGain: 0.4 });
  const a1 = arrow(over, [[1010, 520], [1180, 520], [1180, 316], [1272, 316]], 'teal');
  drawIn(a1, tS1e - 0.05, 0.35);
  classAt(plist.els[0], 'sel', tS1e + 0.2, T('e2', '本地') - 0.05);
  sfx('blip', tS1e + 0.2, { g: 0.5, p: 0.4 });
  const tS2 = T('e2', '本地') - 0.45;
  appear(s2L, tS2); during(s2, tS2, 1e9); const tS2e = typeText(s2, 'users.fdb', tS2, 30, { cursorUntil: tS2 + 0.6, sfxGain: 0.4 });
  const rej = tx(world, 't5', 'Remote 不认本地路径，交给下一个', 1280, 520, { color: C.g4 });
  const a2 = arrow(over, [[1010, 680], [1200, 680], [1200, 392], [1272, 392]], 'teal');
  drawIn(a2, tS2e - 0.05, 0.35);
  appear(rej, tS2e + 0.05);
  to(plist.els[0], tS2e + 0.05, { opacity: 0.45, duration: 0.25 });
  classAt(plist.els[1], 'sel', tS2e + 0.3, s.end);
  sfx('blip', tS2e + 0.3, { g: 0.55, p: 0.5 });

  // ── 站 1：两条通道 ──
  const X = 1920;
  const laneL1 = tx(world, 't5', '远程', X + 120, 150), laneL2 = tx(world, 't5', '本地 · 嵌入式', X + 120, 566);
  const appA = blk(world, 'panel', '', X + 120, 200, 470, 250); appA.dataset.name = '应用进程（远程）';
  tx(appA, 't4', '应用进程', 28, 22, { fontWeight: 500 });
  blk(appA, 'chip w lat', 'fbclient', 30, 140, 410, 80, { fontSize: '34px' });
  const srv = blk(world, 'dark', '', X + 880, 180, 560, 290); srv.dataset.name = '服务端进程 firebird.exe';
  const srvT = tx(srv, 'lat', 'firebird.exe', 30, 22, { fontSize: '40px', fontWeight: 500, color: C.white });
  const engA = blk(srv, 'chip w lat', '<img src="img/fb-mark.png" style="height:50px;margin-right:14px">engine13', 30, 110, 500, 90, { fontSize: '38px' });
  const engAL = tx(srv, 't5', 'SQL 执行 · 页读写', 34, 216, { color: C.g3 });
  const appB = blk(world, 'panel', '', X + 120, 616, 1260, 290); appB.dataset.name = '应用进程（嵌入式）';
  tx(appB, 't4', '应用进程', 28, 22, { fontWeight: 500 });
  blk(appB, 'chip w lat', 'fbclient', 30, 150, 410, 80, { fontSize: '34px' });
  const engB = blk(appB, 'chip w lat', '<img src="img/fb-mark.png" style="height:50px;margin-right:14px">engine13', 730, 130, 500, 90, { fontSize: '38px', outline: '4px solid ' + C.ink, outlineOffset: '-4px' });
  const engBL = tx(appB, 't5', 'SQL 执行 · 页读写', 734, 236);
  const file = fileIcon(world, X + 1540, 300, 280, 440, 'users.fdb');
  const rowsF = ['alice', 'bob', 'carol', 'dave', 'erin', 'frank', 'grace', 'heidi'].map((n, i) =>
    blk(file, i === 0 ? 'cur-rec' : '', `<span class="mono" style="font-size:26px;padding-left:12px">${n}</span>`, 26, 110 + i * 38, 228, 30, i === 0 ? {} : { background: C.g1 }));
  rowsF.forEach((r) => { r.style.display = 'flex'; r.style.alignItems = 'center'; });
  const conA = arrow(over, [[X + 590, 360], [X + 880, 360]], 'ink'), strA = tx(world, 'm3', 'inet://server/…', X + 600, 300);
  const srvF = arrow(over, [[X + 1440, 340], [X + 1540, 340]], 'ink');
  const conB = arrow(over, [[X + 560, 806], [X + 850, 806]], 'ink'), strB = tx(world, 'm3', 'users.fdb', X + 600, 746);
  const embF = arrow(over, [[X + 1350, 786], [X + 1460, 786], [X + 1460, 640], [X + 1540, 640]], 'ink');
  const tE3 = T('e3');
  const tGo = tE3 - 0.35;
  cam.track(s.start, { x: 960, y: 520, z: 1 }, [
    [c0 + 0.1, { x: 990, z: 1.03 }, tGo - c0 - 0.2, { ease: 'none', sfx: false }],
    [tGo, { x: X + 960, y: 540, z: 1 }, 1.0, { g: 0.4 }],
    [null, { x: X + 940, z: 1.025 }, Math.max(1, T('e7') - tGo - 1.45), { ease: 'none', sfx: false }],
  ]);
  appear(laneL1, tGo + 0.5); appear(laneL2, tGo + 0.5);
  slide(appA, tGo + 0.55, { x: -60, d: 0.5, ease: 'power3.out' });
  const tRem = T('e3', '服务端') - 0.4;
  wipe(srv, tRem, { dir: 't', d: 0.45 }); drawIn(conA, tRem + 0.1, 0.4); appear(strA, tRem + 0.2); sfx('thud', tRem + 0.2, { g: 0.5 });
  drawIn(srvF, tRem + 0.5, 0.3); wipe(file, tGo + 0.6, { dir: 't', d: 0.5 });
  const tLoc = T('e3', '本地') - 0.15;
  wipe(appB, tLoc, { dir: 'l', d: 0.5 }); drawIn(conB, T('e3', '加载') - 0.1, 0.35); appear(strB, T('e3', '加载'));
  slam(engB, T('e3', '加载') + 0.15, { from: 1.25 }); sfx('thud', T('e3', '加载') + 0.2, { g: 0.6, p: -0.2 });
  drawIn(embF, T('e3', '加载') + 0.5, 0.35);
  // e4：在加载它的进程里完成——两个引擎被选中
  const tE4 = T('e4');
  classAt(engA, 'sel', T('e4', '进程') - 0.2, T('e5'));
  classAt(engB, 'sel', T('e4', '进程') - 0.05, T('e5'));
  appear(engAL, T('e4', 'S') + 0.1); appear(engBL, T('e4', 'S') + 0.1);
  sfx('blip', T('e4', '进程') - 0.2, { g: 0.5, p: 0.1 }); sfx('blip', T('e4', '进程'), { g: 0.45, p: -0.1 });

  // e5：停掉独立服务——服务端只剩虚线框，远程报错；嵌入式照样读写文件
  const tStop = T('e5', '停掉') - 0.1, tBack = T('e6') - 0.1;
  const ghost = blk(world, '', '', X + 880, 180, 560, 290, { outline: '4px dashed ' + C.g3, outlineOffset: '-4px' }); ghost.dataset.name = '已停止的服务端';
  const ghostL = tx(world, 't4', '服务已停止', X + 1060, 300, { color: C.g4 });
  during(ghost, tStop, tBack); during(ghostL, tStop, tBack);
  F((t) => { strA.style.visibility = (t >= tStop && t < tBack) ? 'hidden' : ''; });
  F((t) => { srv.style.visibility = (t >= tStop && t < tBack) ? 'hidden' : ''; });
  F((t) => { const off = t >= tStop && t < tBack; conA.style.opacity = off ? 0.2 : ''; srvF.style.opacity = off ? 0.2 : ''; });
  sfx('error', tStop + 0.05, { g: 0.6, p: 0.2 });
  const err = blk(world, 'w', '', X + 120, 466, 700, 62, { background: C.white, outline: '3px solid ' + C.g4, outlineOffset: '-3px' });
  tx(err, 'm3', 'Unable to complete network request', 18, 12, { fontSize: '27px' });
  const errZh = tx(world, 't5', '远程连接：无法完成网络请求', X + 120, 486, {});
  css(errZh, { left: (X + 840) + 'px', top: '480px' });
  during(err, tStop + 0.4, tBack); during(errZh, tStop + 0.4, tBack);
  // 嵌入式通道上一块数据来回：仍在读写
  const pkt = blk(world, '', '', X + 1350, 776, 28, 22, { background: C.ink }); pkt.dataset.name = '读写';
  F((t) => {
    const k = (t - (tStop + 0.5)) / 1.3;
    if (t < tStop + 0.5 || t > tBack) { pkt.style.visibility = 'hidden'; return; }
    pkt.style.visibility = 'visible';
    const ph = k - Math.floor(k), u = ph < 0.5 ? ph * 2 : 2 - ph * 2;    // 去了又回
    const L1 = 110, L2 = 130, L3 = 80, Ltot = L1 + L2 + L3, d = u * Ltot;
    let x, y;
    if (d < L1) { x = X + 1350 + d; y = 776; } else if (d < L1 + L2) { x = X + 1460 - 14; y = 776 - (d - L1); } else { x = X + 1460 + (d - L1 - L2); y = 630; }
    pkt.style.left = x.toFixed(1) + 'px'; pkt.style.top = y.toFixed(1) + 'px';
  });
  for (let k = 0; k < 3; k++) sfx('tick', tStop + 0.5 + k * 1.3 + 0.65, { g: 0.35, p: 0.6 });

  // e6：两个入口，同一套页格式和存取代码——两个引擎之间的括线
  const tE6 = T('e6');
  const brk = arrow(over, [[X + 1160, 470], [X + 1160, 500]], 'teal', { head: false });
  const brk2 = arrow(over, [[X + 1100, 568], [X + 1100, 746]], 'teal', { head: false });
  drawIn(brk2, T('e6', '同一套'), 0.4);
  drawIn(brk, T('e6', '同一套') - 0.2, 0.6);
  const same = blk(world, 'sel', '同一套页格式和存取代码', X + 860, 504, 560, 64, { fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' });
  wipe(same, T('e6', '同一套'), { dir: 'l', d: 0.45 }); sfx('chime', T('e6', '存取') + 0.1, { g: 0.5 });

  // e7：推进 users.fdb，Alice 这行
  const tE7 = T('e7');
  const aliceAge = tx(file, 'mono', '30', 200, 112, { fontSize: '26px', color: C.ink });
  appear(aliceAge, T('e7', 'Alice') - 0.1);
  cam.track(tE7 - 0.2, { x: X + 940, y: 540, z: 1.025 }, [[tE7 - 0.2, { x: X + 1680, y: 540, z: 2.2 }, 1.3, { g: 0.45 }], [null, { z: 2.3 }, Math.max(0.5, s.end - tE7 - 1.3), { ease: 'none', sfx: false }]]);
  sfx('pop', T('e7', 'Alice'), { g: 0.6, p: 0.5 });
});
