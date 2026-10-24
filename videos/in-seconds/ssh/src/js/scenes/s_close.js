// 结论：回到那一秒——回车到登录成功之间，四道关依次点亮 → 共同密钥不上网、私钥不出本机 → 四道关已经走完 →
// 唯一要你点头的，是第一次把对面记下来。
scene('close', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  // ── A：大显像管，回车 → 登录成功 ──
  const A = crt(world, 110, 150, 1700, 700, 'CLIENT');
  const c1 = txt(A.scr, 'term', '<span class="p">&gt;</span> ssh -p 2222 ftlab@127.0.0.1', 40, 36); c1.style.fontSize = '48px';
  const tcL = txt(A.scr, 'cap-zh amb', tr('那一秒', 'that second'), 40, 130); tcL.style.fontSize = '96px'; tcL.style.fontWeight = 700;
  const enter = txt(A.scr, 'plate', 'ENTER', 40, 320);
  const enterZ = txt(A.scr, 'plate zh', tr('回车', 'Enter'), 160, 319);
  const done = txt(A.scr, 'plate grn zh', tr('登录成功', 'logged in'), 1380, 319); done.style.fontSize = '30px';
  const segs = [], segL = [];
  const GT = [tr('对上加密', 'match the cipher'), tr('换出密钥', 'make the key'), tr('认明服务器', 'recognize the server'), tr('证明你是你', 'prove it is you')];
  const W0 = 40, Wseg = 330;
  for (let i = 0; i < 4; i++) {
    const g = blk(A.scr, '', W0 + i * (Wseg + 12), 390, Wseg, 40); g.style.background = 'var(--chassis)'; g.style.outline = '3px solid var(--dim)'; segs.push(g);
    const n = txt(A.scr, 'term', String(i + 1).padStart(2, '0'), W0 + i * (Wseg + 12) + 10, 394); n.style.fontSize = '32px'; n.style.color = 'var(--paper)'; segs[i]._n = n;
    const l = txt(A.scr, 'cap-zh', GT[i], W0 + i * (Wseg + 12), 446); l.style.fontSize = LANG === 'zh' ? '40px' : '30px'; l.style.fontWeight = 700; l.style.color = 'var(--ac)';
    segL.push(l);
  }
  const auth = txt(A.scr, 'term', 'Authenticated to 127.0.0.1 ([127.0.0.1]:2222) using "publickey".', 40, 530); auth.style.fontSize = '40px';
  const t58 = s.start + 0.15;
  flick(c1, t58); flick(enter, T('s58', '回车') - 0.2); flick(enterZ, T('s58', '回车') - 0.15); sfx('key', T('s58', '回车') - 0.2, { g: 1.2 });
  flick(tcL, T('s58', '回车') - 0.1);
  const tcc = secondCells(A.scr, 420, 160, 10, 92, 70, 12, T('s58', '回车'), Tend('s58'));
  tcc.forEach((c) => appear(c, T('s58', '回车') - 0.1));
  flick(done, T('s58', '登录') - 0.1); sfx('tick', T('s58', '登录') - 0.1, { g: 0.6 });
  const words = [['s59', '对上'], ['s59', '换出'], ['s59', '认明'], ['s59', '证明']];
  words.forEach(([id, w], i) => {
    const t = T(id, w) - 0.1;
    set(segs[i], t, { background: 'var(--ac)' }); set(segs[i]._n, t, { color: 'var(--ink)' }); flick(segL[i], t);
    sfx('pop', t, { g: 0.7, p: -0.6 + i * 0.4 });
  });
  line(auth, T('s59', '证明') + 0.3, { g: 0.6 });
  // ── B：全景控制台：共同密钥不上网，私钥不出本机 ──
  const BY = 1100;
  const rig = consoleRig(world, { oy: BY });
  rig.units.forEach((u) => litAt(u, 0));
  wireSealed(rig, 0);
  const scrB = txt(rig.scr, 'term', 'Authenticated to\n127.0.0.1', 12, 12); scrB.style.fontSize = '26px';
  [[rig.vCx, rig.vCy], [rig.vSx, rig.vSy]].forEach(([x, y]) => { const k = h('div', 'tok grn', world, 'K'); px(k, x + 330, y + 22); k.style.fontSize = '40px'; });
  pixKey(world, rig.vCx + 24, rig.vCy + 36, 10, 'var(--amber)', 'your private key');
  pixKey(world, rig.vSx + 24, rig.vSy + 36, 10, 'var(--amber)', 'host private key');
  const pc = txt(world, 'cap-zh amb', tr('你的私钥', 'your private key'), rig.vCx + 24, rig.vCy + 92), ps = txt(world, 'cap-zh amb', tr('主机私钥', 'host private key'), rig.vSx + 24, rig.vSy + 92);
  [pc, ps].forEach((e) => { e.style.fontSize = '28px'; });
  const kOff = h('div', 'tok', world, 'K'); px(kOff, 900, BY + 380); kOff.style.fontSize = '40px'; kOff.style.background = 'var(--amber)';
  const kOffX = pixMark(world, 894, BY + 374, 14, 'no', 'var(--paper)');
  const l60a = txt(world, 'cap-zh', tr('共同密钥不上网', 'the shared secret stays off the wire'), 700, BY + 150); l60a.style.fontSize = '48px'; l60a.style.fontWeight = 700; l60a.style.color = 'var(--paper)';
  const l60b = txt(world, 'plate amb zh', tr('私钥不出本机', 'private keys stay home'), 820, BY + 800); l60b.style.fontSize = '34px';
  const t60 = T('s60') + 0.05;
  flick(l60a, T('s60', '共同') - 0.1); hop(kOff, T('s60', '网上') - 0.3, { y: -50, d: 0.3 }); flick(kOffX, T('s60', '网上')); sfx('tick', T('s60', '网上'), { g: 0.6 });
  flick(l60b, T('s60', '私钥') - 0.1); sfx('pop', T('s60', '私钥') - 0.1, { g: 0.6 });
  // s61：那一秒，四道关已经走完
  const sec = txt(world, 'cap-zh amb', tr('那一秒', 'that second'), 800, BY + 120); sec.style.fontSize = '96px'; sec.style.fontWeight = 700;
  const allDone = txt(world, 'cap-zh ac', tr('四道关已经走完', 'all four gates passed'), 720, BY + 236); allDone.style.fontSize = '60px'; allDone.style.fontWeight = 700;
  [l60a, kOff, kOffX].forEach((e) => flickOut(e, T('s61') - 0.05));
  flick(sec, T('s61') + 0.1); sfx('tick', T('s61') + 0.1, { g: 0.6 });
  flick(allDone, T('s61') + 0.5); sfx('chime', T('s61') + 0.5, { g: 0.8 });
  // s62：唯一要你点头的：第一次把对面记下来
  const yes = h('div', 'tok amb', world, 'YES'); px(yes, 330, BY + 380); yes.style.fontSize = '56px'; yes.style.padding = '12px 28px 8px'; yes.style.border = '6px solid var(--paper)';
  const yesL = txt(world, 'cap-zh', tr('第一次把对面记下来，还要你点头', 'the first time you record the other side, it is your yes'), 150, BY + 830); yesL.style.fontSize = '44px'; yesL.style.fontWeight = 700; yesL.style.color = 'var(--paper)';
  const t62 = T('s62', '点头') - 0.3;
  flickOut(l60b, T('s62') - 0.05); [sec, allDone].forEach((e) => flickOut(e, T('s62') + 0.8));
  hop(yes, t62, { y: -40, d: 0.3 }); sfx('beep', t62, { g: 0.5, p: -0.5 });
  flick(yesL, T('s62') + 0.1);
  set(yes, Tend('s62') + 0.3, { y: 6 }); sfx('key', Tend('s62') + 0.3, { g: 1.4, p: -0.5 });
  // 镜头：显像管 → 下移到控制台全景 → 推近 YES 键，慢慢停住
  camPath(cam, s, { x: 960, y: 500, z: 1.04 }, [
    [s.start + 0.05, { z: 1 }, Math.max(0.6, Tend('s59') - s.start - 0.2), { ease: 'none', sfx: false }],
    [Tend('s59') + 1.2, { x: 960, y: BY + 470, z: 1 }, 1.0, { ease: 'power3.inOut', g: 0.35 }],
    [T('s62') - 0.1, { x: 760, y: BY + 560, z: 1.12 }, 1.2, { ease: 'power2.inOut', sfx: false }],
    [null, { z: 1.18 }, Math.max(0.5, s.end - T('s62') - 1.5), { ease: 'none', sfx: false }],
  ]);
});
