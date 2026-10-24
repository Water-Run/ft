// 主机密钥：服务器亮出长期的主机密钥 → 整个交换收成一份哈希 → 主机私钥签名 → 主机公钥验签 →
// 还要跟 known_hosts 里记下的那份对照。依据 RFC 4253 §8 与 ssh_config(5)；指纹与 known_hosts 结构取自实验回显。
scene('hostkey', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const rig = consoleRig(world);
  const scr1 = txt(rig.scr, 'term', '<span class="p">&gt;</span> ssh -p 2222\n  ftlab@127.0.0.1', 12, 12); scr1.style.fontSize = '26px';
  rig.units.forEach((u) => litAt(u, 0));
  // 两边保险格里的共同密钥仍在
  [[rig.vCx, rig.vCy], [rig.vSx, rig.vSy]].forEach(([x, y]) => { const k = h('div', 'tok grn', world, 'K'); px(k, x + 330, y + 22); k.style.fontSize = '40px'; });
  // s37–s38：主机密钥（私钥锁在 SERVER，公钥亮出来）
  const hkPriv = pixKey(world, rig.vSx + 24, rig.vSy + 36, 10, 'var(--amber)', 'host private key');
  const hkPrivL = txt(world, 'cap-zh amb', tr('主机私钥', 'host private key'), rig.vSx + 24, rig.vSy + 92); hkPrivL.style.fontSize = '28px';
  const badge = blk(world, 'card', 1290, 110, 480, 170); badge.dataset.name = 'host key';
  h('div', 'hd', badge, 'HOST KEY');
  const bz = txt(badge, 'lz', tr('主机密钥 · 长期', 'host key · long-term'), 20, 60); bz.style.fontSize = '36px';
  const bk = txt(badge, 'ln', 'ssh-ed25519', 20, 112); bk.style.fontSize = '40px';
  const t37 = T('s37', '主机密钥') - 0.3;
  hop(badge, t37, { y: 80, d: 0.4 }); sfx('thud', t37, { g: 0.7, p: 0.5 });
  hop(hkPriv, t37 + 0.2, { y: 20, d: 0.3 }); appear(hkPrivL, t37 + 0.4);
  const me = txt(world, 'cap-zh ac', tr('我还是上次那一台', 'I am the same machine as last time'), 760, 200); me.style.fontSize = '48px'; me.style.fontWeight = 700;
  flick(me, T('s38') + 0.05); sfx('tick', T('s38') + 0.05, { g: 0.6, p: 0.4 });
  flickOut(me, Tend('s38') + 0.35);
  // ── B：上方的哈希台 ──
  const BY = -1000;
  const parts = [tr('两边的版本标识', 'both version strings'), tr('两份算法清单', 'both KEXINIT lists'), tr('主机公钥', 'host public key'), 'e', 'f', 'K'];
  const pEls = parts.map((p, i) => { const e = h('div', 'tok' + (i < 3 ? ' zh' : ''), world, p); px(e, 110 + (i % 3) * 400, BY + 170 + Math.floor(i / 3) * 90); if (i === 5) e.style.background = 'var(--ac)'; return e; });
  const fun = svg('svg', { class: 'abs', width: 760, height: 200, viewBox: '0 0 760 200' }, world); px(fun, 230, BY + 370);
  svg('polygon', { points: '0,0 760,0 460,180 300,180', fill: 'var(--chassis)' }, fun); fun.dataset.name = 'hash funnel';
  for (let i = 0; i < 6; i++) svg('rect', { x: 80 + i * 100, y: 24, width: 60, height: 12, fill: 'var(--dim)' }, fun);
  const H = h('div', 'tok grn', world, 'H'); px(H, 560, BY + 590); H.style.fontSize = '64px'; H.style.padding = '10px 34px 6px';
  const Hl = txt(world, 'cap-zh ac', tr('哈希 · 一份短摘要', 'hash · a short digest'), 700, BY + 604); Hl.style.fontSize = '44px'; Hl.style.fontWeight = 700;
  const Hf = txt(world, 'term p', 'H = hash(V_C || V_S || I_C || I_S || K_S || e || f || K)   RFC 4253 §8', 110, BY + 730); Hf.style.fontSize = '32px';
  const t39 = T('s39') + 0.1;
  pEls.forEach((e, i) => { hop(e, t39 + i * 0.15, { y: -40, d: 0.2 }); sfx('tick', t39 + i * 0.15, { g: 0.45, p: -0.6 + (i % 3) * 0.6 }); });
 
  const tFold = T('s39', '哈希') - 0.3;
  pEls.forEach((e, i) => to(e, tFold + i * 0.08, { opacity: 0.6, duration: 0.2, ease: 'steps(2)' }));
  const fcells = [...fun.querySelectorAll('rect')];
  fcells.forEach((r, i) => { set(r, tFold + 0.05 + i * 0.08, { attr: { fill: C.ac } }); });
  sfx('drive', tFold, { g: 0.45 });
  flick(H, tFold + 0.5); sfx('pop', tFold + 0.5, { g: 0.8 }); flick(Hl, T('s39', '短摘要') - 0.2); appear(Hf, tFold + 0.8);
  // s40：主机私钥给 H 签名
  const sigKey = pixKey(world, 1180, BY + 560, 12, 'var(--amber)', 'host private key');
  const sigKeyL = txt(world, 'cap-zh amb', tr('主机私钥', 'host private key'), 1180, BY + 640); sigKeyL.style.fontSize = '32px';
  const sig = h('div', 'tok', world, tr('签名', 'signature')); px(sig, 760, BY + 680); sig.style.fontSize = '36px'; sig.classList.add('zh');
  const t40 = T('s40', '签名') - 0.35;
  hop(sigKey, T('s40', '主机私钥') - 0.2, { x: 120, d: 0.4 }); appear(sigKeyL, T('s40', '主机私钥'));
  to(sigKey, t40, { x: -570, y: -70, duration: 0.2, ease: 'steps(2)' });
  slam(sig, t40 + 0.2, { from: 1.4, d: 0.25, ease: 'steps(3)' }); sfx('thud', t40 + 0.2, { g: 0.8 });
  // s41：签名过线，主机公钥验签；不对就断开
  const t41 = T('s41') - 0.1;
  const sigT = travel(world, rig, tr('签名', 'signature'), t41 + 0.2, { dir: -1, w: 150, d: 1.0, cls: 'zh', stay: true });
  const okLamp = blk(world, 'lamp', CON.cx + 30, 228, 40, 40); okLamp.style.width = okLamp.style.height = '40px';
  const okL = txt(world, 'cap-zh', tr('主机公钥验签', 'checked with host public key'), CON.cx + 84, 222); okL.style.fontSize = '36px'; okL.style.fontWeight = 700; okL.style.color = 'var(--paper)';
  const wLamp = blk(world, 'lamp', CON.cx + 30, 160, 40, 40); wLamp.style.width = wLamp.style.height = '40px';
  const wL = txt(world, 'cap-zh', tr('不对就断开', 'if not: disconnect'), CON.cx + 84, 154); wL.style.fontSize = '32px'; wL.style.color = 'var(--paper)';
  const pubK = pixKey(world, CON.cx + 300, 150, 7, 'var(--ac)', 'host public key');
  const tChk = T('s41', '查验') - 0.1;
  [okLamp, okL, wLamp, wL, pubK].forEach((e, i) => flick(e, tChk - 0.4 + i * 0.06));
  litAt(okLamp, sigT.end + 0.1); sfx('chime', sigT.end + 0.1, { g: 0.6, p: -0.5 });
  sfx('tick', T('s41', '断开') - 0.1, { g: 0.6, p: -0.5 });
  // s42：签名对了还不够
  const notEnough = txt(world, 'plate zh', tr('签名对了还不够', 'a good signature is not enough'), CON.cx + 84, 274); notEnough.style.background = 'var(--orange)'; notEnough.style.fontSize = '30px';
  flick(notEnough, T('s42') + 0.1); sfx('error', T('s42') + 0.1, { g: 0.35, p: -0.5 });
  // ── C：左边的 known_hosts ──
  const CX = -1920;
  const kh = fileCard(world, CX + 120, 150, 1680, 170, '~/.ssh/known_hosts');
  const khl = txt(kh, 'ln', '[127.0.0.1]:2222 ssh-ed25519 ', 30, 74); khl.style.fontSize = '44px';
  const rnd = seeded(4253), ref = [];
  for (let i = 0; i < 20; i++) ref.push(rnd() < 0.5 ? 1 : 0);
  const cellsRow = (parent, x, y, bits, on = 'var(--ink)', off = 'var(--dimp)') => bits.map((b, i) => { const c = blk(parent, '', x + i * 34, y, 28, 40); c.style.background = b ? on : off; return c; });
  const khBits = cellsRow(kh, 620, 78, ref);
  const fp = txt(world, 'term p', tr('指纹  ', 'fingerprint  ') + 'SHA256:g6PoA9wiW3y53PxinYaTpcdUILkmw5VNG3RK/qJBbs8', CX + 136, 346); fp.style.fontSize = '38px';
  const khz = txt(world, 'cap-zh', tr('你这台电脑记下的服务器', 'the server your computer recorded'), CX + 130, 430); khz.style.fontSize = '40px'; khz.style.fontWeight = 700; khz.style.color = 'var(--paper)';
  const t43 = T('s43', 'known hosts') - 0.3;
  hop(kh, t43, { y: 60, d: 0.4 }); sfx('pop', t43, { g: 0.7 });
  line(khl, t43 + 0.4, { g: 0.5 }); khBits.forEach((c) => appear(c, t43 + 0.5));
  line(fp, T('s43b', '指纹') - 0.3, { g: 0.5 }); flick(khz, T('s43b') + 0.1);
  // 对照台：眼前的公钥 vs 记录
  const cmpY = 520;
  const rowA = txt(world, 'cap-zh', tr('眼前的公钥', 'key shown now'), CX + 130, cmpY + 4); rowA.style.fontSize = '34px'; rowA.style.color = 'var(--ac)';
  const rowB = txt(world, 'cap-zh', tr('记录里的公钥', 'key on record'), CX + 130, cmpY + 84); rowB.style.fontSize = '34px'; rowB.style.color = 'var(--paper)';
  const changed = ref.map((b, i) => ([3, 7, 8, 12, 17].includes(i) ? 1 - b : b));
  const cmpBox = blk(world, 'bg-ink', CX + 460, cmpY - 10, 720, 160); cmpBox.style.border = '6px solid var(--chassis)';
  const now1 = cellsRow(world, CX + 480, cmpY + 4, changed, 'var(--ac)', 'var(--dim)');
  const recd = cellsRow(world, CX + 480, cmpY + 84, ref, 'var(--paper)', 'var(--chassis)');
  const now2 = cellsRow(world, CX + 480, cmpY + 4, ref, 'var(--ac)', 'var(--dim)');
  const t44 = T('s44') + 0.05;
  [rowA, rowB, cmpBox].forEach((e, i) => flick(e, t44 + i * 0.08));
  now1.forEach((c, i) => appear(c, t44 + 0.2 + i * 0.03)); recd.forEach((c) => appear(c, t44 + 0.2));
  const bad = [3, 7, 8, 12, 17].map((i) => { const m = blk(world, '', CX + 480 + i * 34 - 4, cmpY - 2, 36, 128); m.style.border = '4px solid var(--orange)'; return m; });
  const tBad = T('s44', '变了') + 0.1;
  bad.forEach((m) => flick(m, tBad));
  const warnL = blk(world, 'lamp lamp-warn', CX + 1230, cmpY + 10, 56, 56); warnL.style.width = warnL.style.height = '56px';
  const warnT = txt(world, 'cap-zh', tr('身份变了就报错', 'identity changed: error'), CX + 1310, cmpY + 6); warnT.style.fontSize = '44px'; warnT.style.fontWeight = 700; warnT.style.color = 'var(--paper)';
  const quote = txt(world, 'term p', '"ssh will refuse to connect to hosts whose host key has changed."', CX + 130, cmpY + 190); quote.style.fontSize = '32px';
  const quoteZ = txt(world, 'cap-zh', tr('主机密钥变了，ssh 拒绝连接　ssh_config(5)', 'ssh_config(5)'), CX + 130, cmpY + 236); quoteZ.style.fontSize = '30px';
  flick(warnL, T('s44', '报错') - 0.2); sfx('error', T('s44', '报错') - 0.2, { g: 0.9 });
  flick(warnT, tBad + 0.1); flick(quote, t44 + 0.4); flick(quoteZ, t44 + 0.5);
  // s45：已经有记录时，公钥必须完全一样：逐格扫过，全部一致
  const t45x = T('s45') + 1.1;
  [...now1, ...bad, warnL, warnT].forEach((e) => vanish(e, t45x));
  now2.forEach((c) => appear(c, t45x));
  const scanC = blk(world, '', CX + 476, cmpY - 6, 36, 136); scanC.style.border = '4px solid var(--amber)';
  fromTo(scanC, t45x + 0.05, { x: 0 }, { x: 19 * 34, duration: 0.8, ease: 'steps(19)' });
  appear(scanC, t45x + 0.05);
  for (let i = 0; i < 4; i++) sfx('tick', t45x + 0.05 + i * 0.2, { g: 0.4 });
  const okL2 = blk(world, 'lamp on', CX + 1230, cmpY + 10, 56, 56); okL2.style.width = okL2.style.height = '56px';
  const okT2 = txt(world, 'cap-zh ac', tr('公钥必须一样', 'must match exactly'), CX + 1310, cmpY + 6); okT2.style.fontSize = '44px'; okT2.style.fontWeight = 700;
  const tOk = t45x + 0.9;
  flick(okL2, tOk); flick(okT2, tOk + 0.05); sfx('chime', tOk, { g: 0.6 });
  [quote, quoteZ].forEach((e) => vanish(e, t45x));
  // 镜头：全景 → 上方哈希台 → 回到线上 → 左边 known_hosts
  camPath(cam, s, { x: 960, y: 480, z: 1.04 }, [
    [s.start + 0.05, { x: 1200, y: 420, z: 1.1 }, 1.1, { ease: 'power2.out', sfx: false }],
    [Tend('s38') + 0.3, { x: 960, y: BY + 470, z: 1 }, 1.0, { ease: 'power3.inOut', g: 0.35 }],
    [Tend('s40') + 0.02, { x: 960, y: 470, z: 1 }, 0.9, { ease: 'power3.inOut', g: 0.35 }],
    [Tend('s42') + 0.6, { x: CX + 960, y: 470, z: 1 }, 1.0, { ease: 'power3.inOut', g: 0.35 }],
  ]);
});
