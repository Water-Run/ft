// 用户认证：NEWKEYS 之后线上加密 → ssh-userauth → 这一次用公钥、没有口令 → 两把钥匙各司其职 →
// 私钥留在本机，线上只有公钥和签名 → 服务器验签放行。依据 RFC 4253 §7.3、§10，RFC 4252 §7；回显取自实验。
scene('userauth', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const rig = consoleRig(world);
  rig.units.forEach((u) => litAt(u, 0));
  [[rig.vCx, rig.vCy], [rig.vSx, rig.vSy]].forEach(([x, y]) => { const k = h('div', 'tok grn', world, 'K'); px(k, x + 330, y + 22); k.style.fontSize = '40px'; });
  const hk = pixKey(world, rig.vSx + 24, rig.vSy + 36, 10, 'var(--amber)', 'host private key');
  const hkl = txt(world, 'cap-zh amb', tr('主机私钥', 'host private key'), rig.vSx + 24, rig.vSy + 92); hkl.style.fontSize = '28px';
  // 底部的日志条：真实回显逐行出现
  const log = blk(world, 'bg-ink', 150, 800, 1620, 130); log.style.border = '6px solid var(--chassis)'; log.dataset.name = 'ssh -vvv log';
  const logL = txt(world, 'plate', 'ssh -vvv', 170, 784);
  const L1 = txt(log, 'term', 'debug1: SSH2_MSG_NEWKEYS sent', 20, 8), L2 = txt(log, 'term', 'debug1: SSH2_MSG_NEWKEYS received', 20, 58);
  const L3 = txt(log, 'term', 'debug2: service_accept: <span class="a">ssh-userauth</span>', 20, 8);
  const L4 = txt(log, 'term', 'debug1: Authentications that can continue: <span class="a">publickey</span>', 20, 58);
  const L5 = txt(log, 'term', 'Authenticated to 127.0.0.1 ([127.0.0.1]:2222) using <span class="a">"publickey"</span>.', 20, 30);
  [L1, L2, L3, L4, L5].forEach((e) => { e.style.fontSize = '36px'; });
  flick(log, s.start + 0.2); flick(logL, s.start + 0.25);
  // s50：NEWKEYS，之后线上加密
  const t50 = T('s50', '新密钥') - 0.4;
  travel(world, rig, 'NEWKEYS', t50, { dir: 1, w: 170, d: 0.8, until: Tend('s50') + 0.2 });
  travel(world, rig, 'NEWKEYS', t50 + 0.2, { dir: -1, w: 170, d: 0.8, lane: 1, until: Tend('s50') + 0.2 });
  line(L1, t50 + 0.1); line(L2, t50 + 0.9);
  const tSeal = T('s50', '之后') - 0.2;
  wireSealed(rig, tSeal); sfx('drive', tSeal, { g: 0.5 });
  const h50 = txt(world, 'cap-zh', tr('新密钥生效', 'new keys in effect'), 690, 170); h50.style.fontSize = '50px'; h50.style.fontWeight = 700; h50.style.color = 'var(--paper)';
  const h50b = txt(world, 'plate grn zh', tr('之后才加密', 'encrypted from here on'), 820, 400); h50b.style.fontSize = '30px';
  flick(h50, T('s50', '宣布') - 0.1); flick(h50b, tSeal + 0.6); sfx('chime', tSeal + 0.6, { g: 0.5 });
  flickOut(h50, Tend('s50') + 0.25); flickOut(h50b, T('s51') + 1.2);
  // s51：现在证明你是你
  const t51 = T('s51') + 0.05;
  [L1, L2].forEach((e) => vanish(e, t51));
  line(L3, t51 + 0.1);
  const h51 = txt(world, 'cap-zh ac', tr('现在证明你是你', 'now prove you are you'), 660, 160); h51.style.fontSize = '60px'; h51.style.fontWeight = 700;
  flick(h51, T('s51', '证明') - 0.2); sfx('thud', T('s51', '证明') - 0.2, { g: 0.7 });
  // s52：公钥，没有口令
  line(L4, T('s52', '公钥') - 0.3);
  const pw = blk(world, 'bg-ink', 182, 400, 404, 84); pw.style.border = '4px solid var(--paper)'; pw.dataset.name = 'password field';
  const pwt = txt(pw, 'cap-zh', tr('口令', 'password'), 14, 16); pwt.style.fontSize = '34px'; pwt.style.color = 'var(--paper)';
  const pws = txt(pw, 'term p', '********', 120, 18); pws.style.fontSize = '44px';
  const pwx = blk(world, 'bg-paper', 176, 438, 416, 8);
  const noPw = txt(world, 'plate zh', tr('没有口令', 'no password'), 660, 446); noPw.style.background = 'var(--orange)'; noPw.style.fontSize = '30px';
  const t52 = T('s52', '口令') - 0.4;
  flick(pw, t52 - 0.3); fromTo(pwx, t52, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.4, ease: 'steps(4)' }); sfx('error', t52, { g: 0.35, p: -0.5 });
  flick(noPw, t52); sfx('tick', t52 + 0.3, { g: 0.6, p: -0.5 });
  [pw, pwx, h51].forEach((e) => flickOut(e, Tend('s52') + 0.25)); flickOut(noPw, T('s53') + 1.2);
  // s53–s54：两把钥匙各司其职
  const cardA = blk(world, 'mod', 645, 104, 310, 250), cardB = blk(world, 'mod', 965, 104, 310, 250);
  const kA = pixKey(cardA, 30, 30, 10, 'var(--ac)', 'host public key');
  const ka1 = txt(cardA, 'cap-zh ac', tr('服务器的主机公钥', 'server’s host public key'), 24, 110); ka1.style.fontSize = '34px'; ka1.style.fontWeight = 700;
  const ka2 = txt(cardA, 'cap-zh', tr('刚才你的电脑查验过', 'your computer just checked it'), 24, 170); ka2.style.fontSize = '28px'; ka2.style.color = 'var(--paper)';
  const kB = pixKey(cardB, 30, 30, 10, 'var(--amber)', 'your private key');
  const kb1 = txt(cardB, 'cap-zh amb', tr('你自己的私钥', 'your own private key'), 24, 110); kb1.style.fontSize = '34px'; kb1.style.fontWeight = 700;
  const kb2 = txt(cardB, 'cap-zh', tr('现在用来证明你', 'proves you now'), 24, 170); kb2.style.fontSize = '28px'; kb2.style.color = 'var(--paper)';
  const two = txt(world, 'cap-zh', tr('两把钥匙各司其职', 'two keys, two jobs'), 800, 380); two.style.fontSize = '36px'; two.style.fontWeight = 700; two.style.color = 'var(--paper)';
  const t53 = T('s53') + 0.05;
  [L3, L4].forEach((e) => vanish(e, t53 + 0.6));
  hop(cardA, t53, { y: -50, d: 0.3 }); flick(two, t53 + 0.1); sfx('pop', t53, { g: 0.6, p: -0.2 });
 
  [ka1, ka2].forEach((e, i) => flick(e, t53 + 0.15 + i * 0.1));
  sfx('tick', T('s53', '主机公钥') - 0.3, { g: 0.6, p: -0.3 }); sfx('blip', T('s53', '主机公钥') + 0.6, { g: 0.4, p: -0.3 });
  const tB = T('s54') + 0.1;
  hop(cardB, tB, { y: -50, d: 0.3 }); sfx('pop', tB, { g: 0.6, p: 0.2 });
  to(cardA, tB + 0.8, { opacity: 0.6, duration: 0.2, ease: 'steps(2)' });
  // s55：私钥落回 CLIENT 的保险格，私钥文件首行
  const t55 = T('s55') + 0.05;
  [cardA, cardB, two].forEach((e) => flickOut(e, t55));
  const uk = pixKey(world, rig.vCx + 24, rig.vCy + 36, 10, 'var(--amber)', 'your private key');
  const ukl = txt(world, 'cap-zh amb', tr('私钥留在本机', 'private key stays here'), rig.vCx + 24, rig.vCy + 92); ukl.style.fontSize = '28px';
  hop(uk, t55 + 0.1, { y: -260, x: 600, d: 0.6 }); sfx('thud', t55 + 0.7, { g: 0.7, p: -0.5 });
  flick(ukl, T('s55', '本机') - 0.1);
  const pem = txt(rig.scr, 'term a', '-----BEGIN OPENSSH\n PRIVATE KEY-----', 12, 96); pem.style.fontSize = '26px';
  flick(pem, T('s55', '本机') + 0.1);
  const notSent = txt(world, 'cap-zh', tr('不发给服务器', 'never sent to the server'), 660, 300); notSent.style.fontSize = '40px'; notSent.style.fontWeight = 700; notSent.style.color = 'var(--paper)';
  flick(notSent, T('s55') + 0.6); sfx('tick', T('s55') + 0.6, { g: 0.6 });
  flickOut(notSent, Tend('s55') + 0.6);
  // s56：线上只有公钥和签名
  const t56 = T('s56', '公钥') - 0.4;
  travel(world, rig, tr('公钥', 'public key'), t56, { dir: 1, w: 150, d: 1.0, cls: 'grn zh', until: Tend('s57') + 0.3, stay: false });
  travel(world, rig, tr('签名', 'signature'), T('s56', '签名') - 0.3, { dir: 1, w: 150, d: 1.0, cls: 'zh', lane: 1, until: Tend('s57') + 0.3 });
  const only = txt(world, 'cap-zh', tr('线上只有公钥和签名', 'only a public key and a signature on the wire'), 660, 190); only.style.fontSize = '44px'; only.style.fontWeight = 700; only.style.color = 'var(--paper)';
  flick(only, T('s56', '只有') - 0.1);
  // s57：服务器验签，放行
  const t57 = T('s57', '验过') + 0.2;
  const okS = blk(world, 'lamp', CON.sx + 360, 236, 48, 48); okS.style.width = okS.style.height = '48px';
  const okSl = txt(world, 'cap-zh ac', tr('验过签名才放行', 'signature checked, let in'), CON.sx + 40, 230); okSl.style.fontSize = '40px'; okSl.style.fontWeight = 700;
  flick(okS, T('s57', '验过') - 0.2); litAt(okS, t57); sfx('chime', t57, { g: 0.8, p: 0.5 });
  flick(okSl, t57 + 0.05);
  line(L5, t57 + 0.2, { g: 0.6 });
  flickOut(only, T('s57') + 0.3);
  // 镜头
  camPath(cam, s, { x: 960, y: 540, z: 1.04 }, [
    [s.start + 0.05, { z: 1 }, Math.max(0.6, Tend('s50') - s.start - 0.1), { ease: 'none', sfx: false }],
    [Tend('s50') + 0.05, { x: 900, y: 500, z: 1.1 }, 0.8, { ease: 'power2.inOut', sfx: false }],
    [T('s53') - 0.2, { x: 960, y: 400, z: 1.12 }, 0.9, { ease: 'power2.inOut', sfx: false }],
    [T('s55') - 0.1, { x: 700, y: 560, z: 1.12 }, 0.9, { ease: 'power2.inOut', g: 0.3 }],
    [T('s56') - 0.1, { x: 960, y: 540, z: 1 }, 0.8, { ease: 'power3.out', sfx: false }],
    [T('s57') - 0.1, { x: 1010, y: 540, z: 1.04 }, 0.9, { ease: 'power2.inOut', sfx: false }],
  ]);
});
