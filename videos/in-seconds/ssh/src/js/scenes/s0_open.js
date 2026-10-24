// 开场：敲下 ssh 回车，屏幕静上一秒 → 拉开看见两台机器与中间那条线 → 片名卡 → 偷听与冒充 → 四道关。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const rig = consoleRig(world);
  // ── 显像管里的命令行（CLIENT 的小屏）──
  const sc = rig.scr;
  const tOn = s.start + 0.05;
  flick(sc, tOn); sfx('beep', tOn, { g: 0.45, p: -0.3 });
  const p1 = txt(sc, 'term', '', 12, 12); p1.style.fontSize = '26px';
  const cmd = '<span class="p">&gt;</span> ssh -p 2222 ftlab@127.0.0.1';
  const tType = Math.max(s.start + 0.45, T('s01') - 0.05), tEnter = Math.min(T('s01', '回车'), tType + 1.6);
  typeText(p1, cmd, tType, 22, { cursorUntil: tEnter });
  sfx('key', tEnter, { g: 1.3 });
  const curs = blinkCursor(sc, 12, 52, 13, 26, tEnter + 0.05, Tend('s02') + 1);
  const tcl = txt(sc, 'term d', 'WAIT', 150, 140); tcl.style.fontSize = '26px';
  appear(tcl, tEnter + 0.05);
  const tcc = secondCells(sc, 214, 144, 10, 14, 20, 5, tEnter + 0.1, Tend('s01') + 0.05);
  tcc.forEach((c) => appear(c, tEnter + 0.05));
  for (let k = 1; k <= 4; k++) sfx('tick', tEnter + 0.1 + k * (Tend('s01') - tEnter) / 4.2, { g: 0.35, p: -0.3 });
  // 机器与线：拉开时开机
  const tPull = Tend('s01') + 0.05;
  flick(rig.sv, T('s02') + 0.1); sfx('thud', T('s02') + 0.1, { g: 0.7, p: 0.5 });
  rig.units.forEach((u, i) => litAt(u, T('s02') + 0.3 + i * 0.2));
  // 私钥锁在 CLIENT 里
  const kPriv = pixKey(world, rig.vCx + 30, rig.vCy + 48, 10, 'var(--amber)', 'private key');
  const kPrivL = txt(world, 'cap-zh amb', tr('私钥', 'private key'), rig.vCx + 200, rig.vCy + 46);
  hop(kPriv, T('s02', '私钥'), { y: 30, d: 0.4 }); hop(kPrivL, T('s02', '私钥') + 0.1, { x: -30, d: 0.4 }); sfx('pop', T('s02', '私钥'), { g: 0.7, p: -0.5 });
  // 钥匙停在线外：线上方一把钥匙被拦下
  const kx = (rig.wx0 + rig.wx1) / 2 - 70, ky = rig.wy - 160;
  const kWire = pixKey(world, kx, ky, 10, 'var(--amber)', 'key off the wire');
  const kX = pixMark(world, kx + 36, ky + 64, 14, 'no', 'var(--paper)');
  const kXl = txt(world, 'cap-zh', tr('钥匙不上线', 'no key on the wire'), kx - 22, ky - 58);
  hop(kWire, T('s02', '钥匙'), { y: -50, d: 0.4 }); sfx('pop', T('s02', '钥匙'), { g: 0.6 });
  flick(kX, T('s02', '网上') + 0.1); flick(kXl, T('s02', '网上') + 0.2); sfx('tick', T('s02', '网上') + 0.1, { g: 0.7 });
  // 加密连接：线上的格子一格一格封成实心
  wireSealed(rig, T('s02b') + 0.1);
  const encL = txt(world, 'plate grn zh', tr('加密连接', 'encrypted link'), (rig.wx0 + rig.wx1) / 2 - 64, rig.wy + 80);
  flick(encL, T('s02b') + 0.8); sfx('chime', T('s02b') + 0.8, { g: 0.55 });
  [kWire, kX, kXl].forEach((e) => flickOut(e, Tend('s02b') + 0.2)); flickOut(encL, T('s03', 'SSH') - 0.3);
  // ── 片名卡：整屏显像管，大字 SSH ──
  const tCard = T('s03', 'SSH') - 0.35, tCardOut = T('s04') + 1.2;
  const card = blk(root, 'bg-ink', 0, 0, 1920, VH);
  const frame = blk(card, '', 40, 40, 1840, VH - 80); frame.style.border = '10px solid var(--olive)';
  const kick = txt(card, 'plate', '256 SECONDS', 120, 120);
  const kickZ = txt(card, 'cap-zh', tr('256 秒搞懂', 'in 256 seconds'), 380, 112); kickZ.style.fontSize = '40px'; kickZ.style.color = 'var(--paper)';
  const big = txt(card, 'big', 'SSH', 104, 170); big.style.fontSize = '400px';
  const def1 = txt(card, 'cap-zh ac', tr('一套远程登录协议', 'a remote-login protocol'), 124, 600); def1.style.fontSize = '64px'; def1.style.fontWeight = 700;
  const def2 = txt(card, 'plate', 'PROTOCOL', 124, 700);
  const def2z = txt(card, 'plate zh', tr('协议', 'protocol'), 290, 700);
  const not = txt(card, 'term p', 'ssh.exe', 1060, 360); not.style.fontSize = '120px';
  const notBar = blk(card, 'bg-paper', 1040, 430, 460, 12);
  const notL = txt(card, 'cap-zh', tr('不是程序名', 'not a program name'), 1064, 500); notL.style.fontSize = '48px'; notL.style.fontWeight = 700;
  const src = txt(card, 'term d', 'RFC 4253 · ABSTRACT', 1064, 600); src.style.fontSize = '32px';
  [kick, kickZ, big, def1, def2, def2z, not, notBar, notL, src].forEach((e) => { e.dataset.overlapOk = '1'; });
  wipe(card, tCard, { dir: 't', d: 0.2, ease: 'steps(4)' }); sfx('drive', tCard, { g: 0.6 });
  flick(kick, tCard + 0.15); flick(kickZ, tCard + 0.2);
  slam(big, Q(T('s03', 'SSH')) - 0.1, { from: 1.15, d: 0.3, ease: 'steps(3)' }); sfx('thud', Q(T('s03', 'SSH')) - 0.1);
  flick(def1, T('s03b')); sfx('tick', T('s03b'), { g: 0.6 });
  flick(def2, T('s03b', '协议')); flick(def2z, T('s03b', '协议') + 0.05);
  flick(not, T('s03b', '协议') + 0.1); sfx('tick', T('s03b', '不是') - 0.1, { g: 0.6, p: 0.4 });
  fromTo(notBar, T('s03b', '程序'), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.4, ease: 'steps(4)' }); sfx('error', T('s03b', '程序'), { g: 0.4, p: 0.4 });
  flick(notL, T('s03b', '不是')); flick(src, T('s03b', '不是') + 0.3);
  fromTo(big, tCard + 1.2, { x: 0 }, { x: 24, duration: tCardOut - tCard - 1.2, ease: 'none', immediateRender: false });
  tl.to(card, { clipPath: 'inset(50% 0% 50% 0%)', duration: 0.2, ease: 'steps(4)' }, tCardOut);
  tl.set(card, { autoAlpha: 0 }, tCardOut + 0.2);
  sfx('drive', tCardOut, { g: 0.45 });
  // ── 偷听与冒充 ──
  const mx = rig.wx0 + 170;
  const probe = blk(world, 'bg-chassis', mx - 10, rig.wy + 8, 20, 170); probe.dataset.name = 'tap';
  const probeHead = blk(world, 'bg-paper', mx - 34, rig.wy + 2, 68, 24);
  const probeL = txt(world, 'plate zh', tr('偷听', 'eavesdrop'), mx - 44, rig.wy + 190); probeL.style.background = 'var(--orange)';
  const tTap = T('s04b', '偷听') - 0.2;
  hop(probe, tTap, { y: 120, d: 0.4 }); hop(probeHead, tTap + 0.1, { y: 120, d: 0.4 }); flick(probeL, tTap + 0.3); sfx('tick', tTap, { g: 0.8 });
  const fake = h('div', 'abs', world); px(fake, CON.sx - 150, CON.y + 40, 260, 390); fake.style.background = 'var(--ink)'; fake.style.border = '6px solid var(--rust)'; fake.dataset.name = 'impostor';
  hatch(fake, 0, 0, 248, 378, 'var(--rust)', 22, 6);
  const fakeL = txt(world, 'plate zh', tr('冒充', 'impostor'), CON.sx - 104, CON.y + 200); fakeL.style.background = 'var(--orange)';
  const tFake = T('s04b', '冒名') - 0.4;
  hop(fake, tFake, { x: 260, d: 0.6 }); flick(fakeL, tFake + 0.3); sfx('error', tFake + 0.4, { g: 0.6, p: 0.5 });
  [probe, probeHead, probeL, fake, fakeL].forEach((e) => { e.dataset.overlapOk = '1'; flickOut(e, Tend('s04b') + 0.9); });
  // ── 四道关 ──
  const GY = 1120;
  const head = txt(world, 'cap-zh', tr('四道关还没过', 'four gates, none passed'), 150, GY - 110); head.style.fontSize = '56px'; head.style.fontWeight = 700; head.style.color = 'var(--paper)';
  const titles = [tr('对上算法', 'Match algorithms'), tr('换出密钥', 'Make a key'), tr('认明主机', 'Check the host'), tr('证明自己', 'Prove yourself')];
  const notes = [tr('两边都会的加密', 'a cipher both know'), tr('钥匙不上线', 'no key on the wire'), tr('还是上次那一台', 'same machine as last time'), tr('私钥留下 · 签名出门', 'key stays, signature goes')];
  const cueOf = ['s06', 's07', 's08', 's09'];
  const gates = titles.map((tt, i) => gateMod(world, 150 + i * 410, GY, i + 1, tt, { w: 380, h: 330 }));
  const tG = T('s05') + 1.0;
  flick(head, T('s05', '四道关'));
  gates.forEach((g, i) => { hop(g.g, tG + i * 0.2, { y: 60, d: 0.4 }); sfx('thud', tG + i * 0.2, { g: 0.45, p: -0.6 + i * 0.4 }); });
  gates.forEach((g, i) => {
    const t = T(cueOf[i]) + 0.05;
    flick(g.ttl, t);
    gateOn(g, t, { p: -0.6 + i * 0.4 });
    const n = txt(g.g, 'cap-zh ac', notes[i], 22, 200); n.style.fontSize = '30px';
    flick(n, t + 0.2);
  });
  // 每关一枚小图：清单圈出共同项 / 钥匙打叉 / 两枚指纹对照 / 私钥与出门的签名
  const ico = [];
  { const g = gates[0].g; const a = blk(g, 'cell', 22, 258, 90, 10), b = blk(g, 'cell', 140, 258, 90, 10), m = blk(g, 'cell on', 250, 252, 90, 22); ico.push([a, b, m]); }
  { const g = gates[1].g; const k = pixKey(g, 230, 22, 6, 'var(--amber)', 'key'); k.style.left = '230px'; k.style.top = '200px'; const x = pixMark(g, 260, 206, 6, 'no', 'var(--paper)'); ico.push([k, x]); }
  { const g = gates[2].g; const a = blk(g, 'cell on', 22, 258, 140, 12), b = blk(g, 'cell on', 190, 258, 140, 12); ico.push([a, b]); }
  { const g = gates[3].g; const k = pixKey(g, 22, 252, 5, 'var(--amber)', 'private key'), sg = h('div', 'tok', g, 'SIG'); px(sg, 230, 244); sg.style.fontSize = '24px'; ico.push([k, sg]); }
  ico.forEach((list, i) => list.forEach((e, j) => hop(e, T(cueOf[i]) + 0.6 + j * 0.1, { x: -20, d: 0.3 })));
  // 镜头：屏幕近景 → 拉开全景 → 线中段 → 关卡排
  const zS = 3.3, sx = CON.cx + 18 + 216, sy = CON.y + 64 + 100;
  Object.assign(cam.st, { x: sx, y: sy, z: zS });
  camPath(cam, s, { x: sx, y: sy, z: zS }, [
    [s.start + 0.1, { z: zS * 1.03 }, tPull - s.start - 0.15, { ease: 'none', sfx: false }],
    [tPull, { x: 960, y: 520, z: 1 }, 1.1, { ease: 'power3.inOut', g: 0.4 }],
    [T('s04') - 0.1, { x: 960, y: 560, z: 1.12 }, 1.0, { ease: 'power2.inOut', sfx: false }],
    [Tend('s04b') + 0.6, { x: 960, y: GY + 120, z: 1 }, 1.0, { ease: 'power3.inOut', g: 0.4 }],
  ]);
  hudGround('L', 0, 0, 'ink');
});
