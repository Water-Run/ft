// 密钥交换：两边各锁一个秘密，公开值过线，各自算出同一个 K；K 不上线 → 这次实际用 curve25519-sha256 →
// 共同密钥还要在本地再变一次才是数据包钥匙 → 但它认不出对面是谁。依据 RFC 4253 §7.2、§8。
scene('dh', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const rig = consoleRig(world);
  const scr1 = txt(rig.scr, 'term', '<span class="p">&gt;</span> ssh -p 2222\n  ftlab@127.0.0.1', 12, 12); scr1.style.fontSize = '26px';
  rig.units.forEach((u) => litAt(u, 0));
  // s26：开始换密钥
  const head = txt(world, 'cap-zh', tr('开始换密钥', 'now: make a key'), 660, 150); head.style.fontSize = '60px'; head.style.fontWeight = 700; head.style.color = 'var(--paper)';
  flick(head, T('s26', '换出') - 0.2); sfx('tick', T('s26', '换出') - 0.2, { g: 0.6 });
  // s27：名字卡
  const nc = blk(world, 'mod', 640, 130, 640, 190); nc.dataset.name = 'Diffie-Hellman card';
  const ncz = txt(nc, 'cap-zh', tr('迪菲-赫尔曼', 'Diffie-Hellman'), 24, 16); ncz.style.fontSize = '64px'; ncz.style.fontWeight = 700; ncz.style.color = 'var(--paper)';
  const nce = txt(nc, 'big', 'Diffie-Hellman', 24, 104); nce.style.fontSize = '52px';
  const ncs = txt(nc, 'plate', 'RFC 4253 §8', 410, 116);
  const tN = T('s27', '迪菲') - 0.25;
  flickOut(head, tN - 0.2);
  hop(nc, tN, { y: -40, d: 0.4 }); sfx('thud', tN, { g: 0.7 });
  flick(ncs, tN + 0.5);
  // s28：两边各锁一个秘密；公开值过线；各自算出 K
  const sec = (vx, vy, name) => {
    const b = h('div', 'tok amb', world, name); px(b, vx + 20, vy + 22); b.style.fontSize = '40px';
    const l = txt(world, 'cap-zh amb', tr('秘密', 'secret'), vx + 20, vy + 86); l.style.fontSize = '28px';
    return [b, l];
  };
  const [xC, xCl] = sec(rig.vCx, rig.vCy, 'x'), [yS, ySl] = sec(rig.vSx, rig.vSy, 'y');
  const h28 = txt(world, 'cap-zh', tr('两边各留一个秘密', 'each side keeps a secret'), 660, 340); h28.style.fontSize = '40px'; h28.style.fontWeight = 700; h28.style.color = 'var(--amber)';
  const tS = T('s28', '秘密') - 0.3;
  hop(xC, tS, { y: 30, d: 0.3 }); hop(yS, tS + 0.1, { y: 30, d: 0.3 }); sfx('pop', tS, { g: 0.6, p: -0.5 }); sfx('pop', tS + 0.1, { g: 0.6, p: 0.5 });
  appear(xCl, tS + 0.2); appear(ySl, tS + 0.3); flick(h28, T('s28') + 0.1);
  const tPub = T('s28', '送出去') + 0.1;
  const e = travel(world, rig, tr('e · 公开值', 'e · public'), tPub, { dir: 1, w: 210, d: 1.0, cls: 'zh', until: Tend('s29') + 0.3 });
  const f = travel(world, rig, tr('f · 公开值', 'f · public'), tPub + 0.25, { dir: -1, w: 210, d: 1.0, cls: 'zh', lane: 1, until: Tend('s29') + 0.3 });
  const kC = h('div', 'tok', world, 'K'), kS = h('div', 'tok', world, 'K');
  px(kC, rig.vCx + 250, rig.vCy + 22); px(kS, rig.vSx + 250, rig.vSy + 22); [kC, kS].forEach((k) => { k.style.fontSize = '40px'; k.style.background = 'var(--amber)'; });
  const kCl = txt(world, 'cap-zh amb', tr('算出 K', 'computes K'), rig.vCx + 250, rig.vCy + 86), kSl = txt(world, 'cap-zh amb', tr('算出 K', 'computes K'), rig.vSx + 250, rig.vSy + 86);
  [kCl, kSl].forEach((l) => { l.style.fontSize = '28px'; });
  const tK = T('s28', '同一个') - 0.15;
  flick(kC, tK); flick(kS, tK); appear(kCl, tK + 0.1); appear(kSl, tK + 0.1); sfx('chime', tK, { g: 0.5 });
  // s29：K 不上线
  const kx = 870, ky = 360;
  const kOff = h('div', 'tok', world, 'K'); px(kOff, kx, ky); kOff.style.fontSize = '40px'; kOff.style.background = 'var(--amber)';
  const kOffX = pixMark(world, kx - 6, ky - 6, 14, 'no', 'var(--paper)');
  const kOffL = txt(world, 'cap-zh', tr('这个密钥不在线上', 'this key is never on the wire'), 760, 300); kOffL.style.fontSize = '36px'; kOffL.style.fontWeight = 700; kOffL.style.color = 'var(--paper)';
  const t29 = T('s29') + 0.1;
  flickOut(h28, t29 - 0.25);
  [kOff].forEach((el) => hop(el, t29, { y: 60, d: 0.3 })); flick(kOffX, t29 + 0.3); flick(kOffL, t29 + 0.15); sfx('error', t29 + 0.3, { g: 0.35 });
  [kOff, kOffX, kOffL].forEach((el) => { el.dataset.overlapOk = '1'; flickOut(el, T('s30', '没有用') + 0.3); });
  // s30：这次没用它，走的是 curve25519-sha256
  const stamp = h('div', 'abs plate zh', world, tr('这次不用迪菲-赫尔曼', 'not used this time')); px(stamp, 700, 250); stamp.style.background = 'var(--orange)'; stamp.style.fontSize = '30px';
  const cv = h('div', 'tok grn', world, 'curve25519-sha256'); px(cv, 690, 340); cv.style.fontSize = '44px';
  const cvl = txt(world, 'term', 'debug1: SSH2_MSG_KEX_ECDH_REPLY received', 650, 420); cvl.style.fontSize = '30px';
  const t30 = T('s30', '没有用') - 0.1;
  slam(stamp, t30, { from: 1.3, d: 0.25, ease: 'steps(3)' }); sfx('thud', t30, { g: 0.8 });
  to(nc, t30 + 0.1, { opacity: 0.35, duration: 0.2, ease: 'steps(2)' });
  hop(cv, t30 + 0.4, { x: -40, d: 0.3 }); sfx('pop', t30 + 0.4, { g: 0.6 });
  line(cvl, t30 + 0.8, { g: 0.4 });
  [stamp, cv, cvl].forEach((el) => { el.dataset.overlapOk = '1'; flickOut(el, T('s31') + 1.0); });
  flickOut(nc, T('s31') + 1.0);
  // s31–s32：两边同一把共同密钥，后面的加密靠它
  const same = txt(world, 'cap-zh ac', tr('同一把共同密钥', 'the same shared secret'), 700, 180); same.style.fontSize = '56px'; same.style.fontWeight = 700;
  const t31 = T('s31', '共同密钥') - 0.2;
  flick(same, t31); [kC, kS].forEach((k) => set(k, t31, { background: 'var(--ac)' })); sfx('chime', t31, { g: 0.6 });
  swapAt(kCl, tr('算出 K', 'computes K'), tr('共同密钥', 'shared secret'), t31); swapAt(kSl, tr('算出 K', 'computes K'), tr('共同密钥', 'shared secret'), t31);
  const ov = overlay(world);
  const later = txt(world, 'cap-zh', tr('后面的加密靠它', 'later encryption rests on it'), 720, 280); later.style.fontSize = '40px'; later.style.color = 'var(--paper)';
  const arC = path(ov, `M ${rig.vCx + 300} ${rig.vCy + 18} L ${rig.vCx + 300} 400 L 700 400`, 'ac', { w: 5 });
  const arS = path(ov, `M ${rig.vSx + 300} ${rig.vSy + 18} L ${rig.vSx + 300} 400 L 1220 400`, 'ac', { w: 5 });
  const t32 = T('s32') - 0.1;
  drawIn(arC, t32, 0.4, { ease: 'steps(4)' }); drawIn(arS, t32 + 0.1, 0.4, { ease: 'steps(4)' }); flick(later, t32 + 0.3); sfx('tick', t32, { g: 0.6 });
  [arC, arS].forEach((a) => to(a, Tend('s32') + 0.3, { opacity: 0, duration: 0.2, ease: 'steps(2)' }));
  [same, later].forEach((el) => flickOut(el, Tend('s32') + 0.45));
  // s33–s34：本地再变一次，才是数据包钥匙（放大框接在 CLIENT 的保险格上）
  const zx = 600, zy = 560;
  const zoom = blk(world, 'vault', zx, zy, 560, 300); zoom.dataset.name = 'local derive';
  const link = path(ov, `M ${rig.vCx + 330} ${rig.vCy + 40} L ${zx} ${zy + 40}`, 'amber', { w: 4, arrow: false });
  const zK = h('div', 'tok grn', zoom, 'K'); px(zK, 24, 100); zK.style.fontSize = '44px';
  const zKl = txt(zoom, 'cap-zh ac', tr('共同密钥', 'shared secret'), 10, 176); zKl.style.fontSize = '26px';
  const box = blk(zoom, 'mod', 130, 70, 220, 140);
  const boxL = txt(box, 'cap-zh', tr('本地\n再变一次', 'changed\nonce, locally'), 18, 14); boxL.style.whiteSpace = 'pre'; boxL.style.fontSize = '36px'; boxL.style.fontWeight = 700; boxL.style.color = 'var(--paper)'; boxL.style.lineHeight = '1.3';
  const pk = [pixKey(zoom, 400, 64, 8, 'var(--ac)', 'packet key'), pixKey(zoom, 400, 124, 8, 'var(--ac)', 'packet key')];
  const pkl = txt(zoom, 'cap-zh ac', tr('数据包钥匙', 'packet keys'), 384, 186); pkl.style.fontSize = '30px'; pkl.style.fontWeight = 700;
  const neq = txt(world, 'cap-zh', tr('不是同一把', 'not the same key'), zx + 30, zy - 70); neq.style.fontSize = '44px'; neq.style.fontWeight = 700; neq.style.color = 'var(--paper)';
  const ar1 = path(ov, `M ${zx + 92} ${zy + 140} L ${zx + 128} ${zy + 140}`, 'paper', { w: 5 });
  const ar2 = path(ov, `M ${zx + 354} ${zy + 140} L ${zx + 392} ${zy + 140}`, 'paper', { w: 5 });
  const t33 = T('s33') + 0.05;
  wipe(zoom, t33, { dir: 'l', d: 0.4, ease: 'steps(4)' }); drawIn(link, t33, 0.3, { ease: 'steps(3)' }); sfx('drive', t33, { g: 0.4 });
  appear(zK, t33 + 0.3); appear(zKl, t33 + 0.3);
  hop(pk[0], T('s33b', '数据包') - 0.1, { x: 30, d: 0.3 }); hop(pk[1], T('s33b', '数据包'), { x: 30, d: 0.3 }); appear(pkl, T('s33b', '数据包') + 0.1); sfx('pop', T('s33b', '数据包') - 0.1, { g: 0.6 });
  flick(neq, T('s33b', '不是') - 0.1); sfx('tick', T('s33b', '不是') - 0.1, { g: 0.7 });
 
  const t34 = T('s34', '本地') - 0.2;
  flick(box, t34); drawIn(ar1, t34 + 0.2, 0.25, { ease: 'steps(2)' }); drawIn(ar2, t34 + 0.5, 0.25, { ease: 'steps(2)' }); sfx('drive', t34, { g: 0.45 });
  // 同一时刻 SERVER 那边也在本地变一次：保险格里 K 旁亮一格
  const sTag = txt(world, 'plate amb zh', tr('本地再变一次', 'local change'), rig.vSx + 140, rig.vSy + 104); sTag.style.fontSize = '24px';
  flick(sTag, t34 + 0.3);
  [zoom, neq, sTag].forEach((el) => flickOut(el, Tend('s34') + 0.3));
  [link, ar1, ar2].forEach((a) => to(a, Tend('s34') + 0.3, { opacity: 0, duration: 0.2, ease: 'steps(2)' }));
  // s35–s36：钥匙齐了，服务器还没认
  const ready = txt(world, 'cap-zh ac', tr('钥匙齐了', 'keys ready'), 700, 160); ready.style.fontSize = '56px'; ready.style.fontWeight = 700;
  const notYet = txt(world, 'plate zh', tr('服务器还没认', 'server not yet checked'), 1000, 176); notYet.style.background = 'var(--orange)'; notYet.style.fontSize = '30px';
  flick(ready, T('s35') + 0.1); sfx('tick', T('s35') + 0.1, { g: 0.6 });
  flick(notYet, T('s35', '隐患') - 0.1); sfx('error', T('s35', '隐患') - 0.1, { g: 0.4, p: 0.4 });
  const q = txt(world, 'big', '?', CON.sx + 190, 70); q.style.fontSize = '260px'; q.style.color = 'var(--amber)'; q.dataset.overlapOk = '1';
  const ghost = h('div', 'abs', world); px(ghost, CON.sx - 150, CON.y + 40, 260, 390); ghost.style.border = '6px solid var(--rust)'; ghost.dataset.name = 'impostor';
  hatch(ghost, 0, 0, 248, 378, 'var(--rust)', 22, 6);
  const who = txt(world, 'cap-zh', tr('共同密钥认不出服务器', 'a shared secret can’t tell who the server is'), 560, 840); who.style.fontSize = '44px'; who.style.fontWeight = 700; who.style.color = 'var(--paper)';
  const t36 = T('s36', '认出') - 0.3;
  flick(q, t36 - 0.3); sfx('beep', t36 - 0.3, { g: 0.45, p: 0.5 });
  tl.fromTo(ghost, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k < 0.2 ? 1 : k < 0.4 ? 0 : k < 0.6 ? 1 : k < 0.8 ? 0 : 1), immediateRender: true }, t36);
  flick(who, T('s36') + 0.1);
  // 镜头：全景 → 名字卡 → 全景慢推 → 线中段 → 放大框 → 右侧问号
  camPath(cam, s, { x: 960, y: 500, z: 1.04 }, [
    [s.start + 0.05, { z: 1 }, 1.2, { ease: 'power2.out', sfx: false }],
    [tN - 0.2, { x: 960, y: 380, z: 1.2 }, 0.9, { ease: 'power2.inOut', sfx: false }],
    [Tend('s27') + 0.05, { x: 960, y: 500, z: 1 }, 0.8, { ease: 'power3.inOut', g: 0.3 }],
    [T('s29') - 0.1, { x: 960, y: 420, z: 1.15 }, 0.8, { ease: 'power2.inOut', sfx: false }],
    [Tend('s29') + 0.1, { x: 960, y: 480, z: 1 }, 0.7, { ease: 'power3.out', sfx: false }],
    [T('s33') - 0.2, { x: 640, y: 690, z: 1.3 }, 1.0, { ease: 'power2.inOut', g: 0.3 }],
    [Tend('s34') + 0.1, { x: 960, y: 480, z: 1 }, 0.8, { ease: 'power3.out', sfx: false }],
    [T('s36') - 0.2, { x: 1100, y: 470, z: 1.08 }, 1.0, { ease: 'power2.inOut', sfx: false }],
  ]);
});
