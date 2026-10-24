// 算法协商：互报版本 → 两张 KEXINIT 清单 → 顺着你这边的清单找第一个共同项 → 没有就断开 → 这一次的三个结果。
// 清单、版本串与结果全部取自 research/lab/out_03_handshake.txt。
scene('kex', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  // ── A：控制台，两边互报版本 ──
  const rig = consoleRig(world);
  const vs = 'SSH-2.0-OpenSSH_for_Windows_9.5';
  const scr1 = txt(rig.scr, 'term', '<span class="p">&gt;</span> ssh -p 2222\n  ftlab@127.0.0.1', 12, 12); scr1.style.fontSize = '26px';
  rig.units.forEach((u) => litAt(u, 0));
  const tV = T('s13', '版本') - 0.3;
  const a = travel(world, rig, 'SSH-2.0', tV, { dir: 1, w: 150, d: 1.0, until: Tend('s13') + 0.1 });
  const b = travel(world, rig, 'SSH-2.0', tV + 0.3, { dir: -1, w: 150, d: 1.0, lane: 1, until: Tend('s13') + 0.1 });
  const vl = txt(world, 'cap-zh', tr('先互报版本标识', 'version strings first'), 760, 300); vl.style.fontSize = '40px'; vl.style.fontWeight = 700;
  flick(vl, T('s13') + 0.3);
  // ── B：显像管里的两行真实回显 ──
  const BX = 1920;
  const cB = crt(world, BX + 80, 170, 1760, 640, 'CLIENT · ssh -vvv');
  const l1 = txt(cB.scr, 'term', 'debug1: Connection established.', 40, 40);
  const l2 = txt(cB.scr, 'term', 'debug1: Local version string <span class="a">SSH-2.0</span>-OpenSSH_for_Windows_9.5', 40, 110);
  const l3 = txt(cB.scr, 'term', 'debug1: Remote protocol version <span class="a">2.0</span>, remote software\n        version OpenSSH_for_Windows_9.5', 40, 180);
  const z1 = txt(cB.scr, 'cap-zh', tr('← 我方报出', '← we announce'), 40, 330);
  const z2 = txt(cB.scr, 'cap-zh', tr('← 对方报来', '← they announce'), 520, 330);
  const q14 = txt(cB.scr, 'cap-zh ac', tr('哪一版 SSH？ 2.0', 'Which SSH? 2.0'), 40, 410); q14.style.fontSize = '60px'; q14.style.fontWeight = 700;
  [l1, l2, l3].forEach((e) => { e.style.fontSize = '38px'; });
  const tB = Tend('s13') + 0.1;
  line(l1, tB + 0.6); line(l2, tB + 0.8); line(l3, T('s14'));
  flick(z1, tB + 1.0); flick(z2, T('s14') + 0.4);
  flick(q14, T('s14', '哪一版') - 0.1); sfx('pop', T('s14', '哪一版') - 0.1, { g: 0.7 });
  // ── C：两张 KEXINIT 清单 ──
  const CY = 1130;
  const LISTS = {
    c: { kex: ['curve25519-sha256', 'curve25519-sha256@libssh.org', 'ecdh-sha2-nistp256'], kexN: 11,
      host: ['ssh-ed25519-cert-v01@openssh.com', 'ecdsa-sha2-nistp256-cert-v01@openssh.com', 'ecdsa-sha2-nistp384-cert-v01@openssh.com'], hostN: 16,
      ciph: ['chacha20-poly1305@openssh.com', 'aes128-ctr', 'aes192-ctr'], ciphN: 6 },
    s: { kex: ['curve25519-sha256', 'curve25519-sha256@libssh.org', 'ecdh-sha2-nistp256'], kexN: 10,
      host: ['ssh-ed25519'], hostN: 1,
      ciph: ['chacha20-poly1305@openssh.com', 'aes128-ctr', 'aes192-ctr'], ciphN: 6 },
  };
  const SEC = [['kex', 'KEX', tr('密钥交换', 'key exchange')], ['host', 'HOST KEY', tr('主机身份', 'host identity')], ['ciph', 'CIPHER', tr('加密', 'encryption')]];
  const panels = {}, tL = T('s15') + 0.1;
  ['c', 's'].forEach((side, pi) => {
    const x0 = pi ? 1010 : 70, P = blk(world, 'bg-ink', x0, CY + 140, 840, 712); P.style.border = '8px solid var(--chassis)'; P.dataset.name = side === 'c' ? 'client KEXINIT' : 'server KEXINIT';
    const hd = txt(world, 'plate', side === 'c' ? 'CLIENT' : 'SERVER', x0 + 24, CY + 120);
    const hd2 = txt(world, 'plate grn', 'SSH2_MSG_KEXINIT', x0 + 170, CY + 120);
    const rows = {}, heads = {};
    SEC.forEach(([k, en, zh], si) => {
      const y = 44 + si * 218;
      const sh = txt(P, 'plate', en, 24, y); const sz = txt(P, 'plate zh', zh, 24 + (en.length * 17 + 40), y - 1);
      heads[k] = [sh, sz];
      rows[k] = LISTS[side][k].map((nm, ri) => { const r = txt(P, 'term', `<span class="d">${ri + 1}</span> ${nm}`, 24, y + 50 + ri * 40); r.style.fontSize = '32px'; return r; });
      const more = txt(P, 'cap-zh', tr(`… 共 ${LISTS[side][k + 'N']} 项`, `… ${LISTS[side][k + 'N']} in all`), 24, y + 48 + rows[k].length * 40); more.style.fontSize = '26px';
      if (LISTS[side][k + 'N'] === 1) more.textContent = tr('只有 1 项', 'only 1');
      rows[k].more = more;
    });
    panels[side] = { P, rows, heads, x0 };
    wipe(P, tL + pi * 0.25, { dir: 't', d: 0.4, ease: 'steps(4)' }); sfx('drive', tL + pi * 0.25, { g: 0.4, p: pi ? 0.5 : -0.5 });
    flick(hd, tL + pi * 0.25 + 0.2); flick(hd2, tL + pi * 0.25 + 0.3);
    let k = 0;
    SEC.forEach(([key]) => { heads[key].forEach((e) => appear(e, tL + 0.5 + pi * 0.25)); rows[key].forEach((r) => { line(r, tL + 0.55 + pi * 0.25 + k * 0.06, { sfx: k % 3 === 0, g: 0.3, p: pi ? 0.5 : -0.5 }); k++; }); appear(rows[key].more, tL + 0.55 + pi * 0.25 + k * 0.06); });
  });
  // s16：三段依次点亮：加密、密钥交换、主机身份
  const hi = (key, t, t1) => ['c', 's'].forEach((sd) => panels[sd].heads[key].forEach((e) => { classAt(e, 'grn', t, t1); }));
  hi('ciph', T('s16', '加密') - 0.1, Tend('s17') + 0.2); hi('kex', T('s16', '密钥交换') - 0.1, Tend('s17') + 0.2); hi('host', T('s16', '主机') - 0.1, Tend('s17') + 0.2);
  sfx('tick', T('s16', '加密') - 0.1, { g: 0.6 }); sfx('tick', T('s16', '密钥交换') - 0.1, { g: 0.6 }); sfx('tick', T('s16', '主机') - 0.1, { g: 0.6 });
  // s17：名次 = 偏好
  const pref = blk(world, 'bg-paper', 920, CY + 190, 64, 620);
  const prefL = txt(world, 'cap-zh', tr('按偏好\n从高到低', 'by\npreference'), 0, 0); prefL.style.whiteSpace = 'pre'; prefL.style.color = 'var(--ink)'; prefL.style.fontSize = '28px'; prefL.style.fontWeight = 700; prefL.style.lineHeight = '1.25';
  px(prefL, 924, CY + 210); prefL.style.width = '56px'; prefL.style.whiteSpace = 'normal'; prefL.style.textAlign = 'center';
  const prefA = txt(world, 'big', '▼', 932, CY + 740); prefA.style.fontSize = '48px'; prefA.style.color = 'var(--ink)';
  const notAbc = txt(world, 'plate amb zh', tr('不是字母序', 'not alphabetical'), 880, CY + 868);
  const tPref = T('s17', '偏好') - 0.2;
  wipe(pref, tPref, { dir: 't', d: 0.4, ease: 'steps(4)' }); flick(prefL, tPref + 0.2); flick(prefA, tPref + 0.4); sfx('pop', tPref, { g: 0.7 });
  flick(notAbc, T('s17', '偏好') + 0.3); sfx('tick', T('s17', '偏好') + 0.3, { g: 0.6 });
  [pref, prefL, prefA].forEach((e) => { e.dataset.overlapOk = '1'; flickOut(e, Tend('s18') + 0.1); });
  flickOut(notAbc, Tend('s18') + 0.1);
  // s18–s19：顺着你这边的加密清单找第一个共同项
  const cR = panels.c.rows.ciph, sR = panels.s.rows.ciph;
  const yRow = (side, i) => CY + 140 + 8 + 44 + 2 * 218 + 50 + i * 40;
  const ptr = txt(world, 'big', '▶', 30, yRow('c', 0) - 4); ptr.style.fontSize = '44px'; ptr.style.color = 'var(--amber)';
  const walk = txt(world, 'cap-zh amb', tr('从头往下找', 'walk down from the top'), 150, CY + 868); walk.style.fontSize = '36px';
  const tW = T('s18', '清单') - 0.2;
  hop(ptr, tW, { x: -40, d: 0.2 }); flick(walk, tW + 0.1); sfx('tick', tW, { g: 0.7, p: -0.5 });
  const scanBar = blk(world, '', panels.s.x0 + 14, yRow('s', 0) - 4, 800, 42); scanBar.style.border = '4px solid var(--amber)';
  const tScan = T('s19', '对方') - 0.2;
  fromTo(scanBar, tScan, { autoAlpha: 0, y: 120 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'steps(3)' });
  sfx('tick', tScan, { g: 0.5, p: 0.5 }); sfx('tick', tScan + 0.2, { g: 0.5, p: 0.5 }); sfx('tick', tScan + 0.4, { g: 0.5, p: 0.5 });
  const tHit = T('s19', '第一个') - 0.05;
  const ov = overlay(world);
  const link = path(ov, `M ${70 + 720} ${yRow('c', 0) + 20} L ${1010 + 24} ${yRow('s', 0) + 20}`, 'ac', { w: 6, arrow: false });
  drawIn(link, tHit, 0.4, { ease: 'steps(4)' });
  classAt(cR[0], 'inv', tHit, Infinity); classAt(sR[0], 'inv', tHit, Infinity);
  [cR[0], sR[0]].forEach((r) => set(r, tHit, { background: 'var(--ac)', color: 'var(--ink)' }));
  sfx('chime', tHit + 0.1, { g: 0.6 });
  const both = txt(world, 'cap-zh ac', tr('你有、对方也有的第一个', 'first one you both have'), 1050, CY + 868); both.style.fontSize = '36px'; both.style.fontWeight = 700;
  flick(both, T('s19', '拍板') - 0.3); sfx('thud', T('s19', '拍板') - 0.1, { g: 0.6 });
  // s20：没有交集就断开（规则，不是这一次）
  const tNo = T('s20') + 0.1;
  const dim = blk(world, 'bg-ink', 0, CY + 100, 1920, 840); dim.style.opacity = 0;
  to(dim, tNo, { opacity: 0.75, duration: 0.2, ease: 'steps(2)' });
  const warn = blk(world, 'mod', 360, CY + 230, 1200, 520); warn.dataset.name = 'disconnect rule';
  const wl = blk(warn, 'lamp lamp-warn', 40, 40, 64, 64); wl.style.width = wl.style.height = '64px';
  const wt = txt(warn, 'cap-zh', tr('比对到底，没有交集', 'checked to the end: nothing shared'), 140, 36); wt.style.fontSize = '50px'; wt.style.fontWeight = 700; wt.style.color = 'var(--paper)';
  const wt2 = txt(warn, 'big', 'DISCONNECT', 140, 120); wt2.style.fontSize = '120px'; wt2.style.color = 'var(--paper)';
  const wz = txt(warn, 'cap-zh ac', tr('连接当场断开', 'the connection drops'), 140, 260); wz.style.fontSize = '50px'; wz.style.fontWeight = 700;
  const wq = txt(warn, 'term p', '"both sides MUST disconnect"  RFC 4253 §7.1', 140, 360); wq.style.fontSize = '34px';
  const wqz = txt(warn, 'cap-zh', tr('双方必须断开', 'both sides must disconnect'), 140, 410); wqz.style.fontSize = '30px';
  stripe(warn, 0, 486, 1188);
  [wt, wt2, wz, wq, wqz].forEach((e) => { e.dataset.overlapOk = '1'; });   // 不透明模块盖在压暗的清单上
  hop(warn, tNo, { y: 60, d: 0.4 }); sfx('thud', tNo, { g: 0.6 });
  flick(wt, tNo + 0.2); flick(wl, T('s20', '断开') - 0.15); sfx('error', T('s20', '断开') - 0.15, { g: 0.9 });
  flick(wt2, tNo + 0.5); flick(wz, tNo + 0.7); flick(wq, tNo + 0.9); flick(wqz, tNo + 1.0);
  // ── D：这一次的三个结果 ──
  const DX = 1920, DY = 1130;
  const cD = crt(world, DX + 70, DY + 150, 1780, 330, 'CLIENT · ssh -vvv');
  const r1 = txt(cD.scr, 'term', 'debug1: kex: algorithm: <span class="a">curve25519-sha256</span>', 30, 18);
  const r2 = txt(cD.scr, 'term', 'debug1: kex: host key algorithm: <span class="a">ssh-ed25519</span>', 30, 74);
  const r3 = txt(cD.scr, 'term', 'debug1: kex: server-&gt;client cipher: <span class="a">chacha20-poly1305@openssh.com</span>\n        MAC: &lt;implicit&gt; compression: none', 30, 130);
  [r1, r2, r3].forEach((e) => { e.style.fontSize = '36px'; });
  const ver = txt(world, 'plate amb', 'OpenSSH_for_Windows_9.5p2', DX + 1400, DY + 132);
  const tD = T('s21') + 0.05;
  flick(ver, T('s21', '实验')); sfx('tick', T('s21', '实验'), { g: 0.6, p: 0.5 });
  const RES = [['s22', tr('密钥交换', 'key exchange'), 'curve25519-sha256', r1], ['s23', tr('主机身份', 'host identity'), 'ssh-ed25519', r2], ['s24', tr('通信加密', 'traffic encryption'), 'chacha20-poly1305', r3]];
  const cards = RES.map(([id, zh, nm, rl], i) => {
    const c = blk(world, 'mod', DX + 70 + i * 600, DY + 510, 580, 170);
    const z = txt(c, 'plate zh', zh, 20, 20);
    const n = txt(c, 'big', nm, 20, 72); n.style.fontSize = nm.length > 14 ? '62px' : '72px';
    hop(c, T(id) + 0.15, { y: 40, d: 0.3 }); sfx('pop', T(id) + 0.25, { g: 0.6, p: -0.5 + i * 0.5 });
    return c;
  });
  [r1, r2, r3].forEach((rl, i) => line(rl, T('s21', '三个') - 0.2 + i * 0.25, { g: 0.45 }));
  const hiBar = blk(cD.scr, '', 16, 10, 1680, 50); hiBar.style.border = '4px solid var(--amber)';
  const hiY = [10, 66, 122];
  appear(hiBar, T('s22') - 0.15);
  [['s23', 1], ['s24', 2]].forEach(([id, i]) => set(hiBar, T(id) - 0.15, { y: hiY[i] - hiY[0], height: i === 2 ? 92 : 50 }));
  sfx('tick', T('s22') - 0.15, { g: 0.5 }); sfx('tick', T('s23') - 0.15, { g: 0.5 }); sfx('tick', T('s24') - 0.15, { g: 0.5 });
  flickOut(hiBar, T('s25') - 0.05);
  // s25：RFC 4253 列为必须实现的那几个——这一次的三个都不在其中
  const rfc = fileCard(world, DX + 70, DY + 712, 1100, 196, tr('RFC 4253 · 必须实现', 'RFC 4253 · REQUIRED'));
  const req = txt(rfc, 'ln', 'diffie-hellman-group1-sha1   diffie-hellman-group14-sha1\nssh-dss                      3des-cbc', 24, 64); req.style.fontSize = '34px';
  const not25 = txt(world, 'cap-zh', tr('这一次的结果', 'this run’s result'), DX + 1210, DY + 724); not25.style.fontSize = '44px'; not25.style.fontWeight = 700; not25.style.color = 'var(--ac)';
  const not25b = txt(world, 'plate zh', tr('不是 RFC 4253 的必选项', 'not RFC 4253’s required list'), DX + 1210, DY + 812); not25b.style.fontSize = '30px';
  const t25 = T('s25') + 0.05;
  hop(rfc, t25, { y: 60, d: 0.4 }); sfx('pop', t25, { g: 0.6 });
  flick(not25, T('s25', '本次') - 0.1); flick(not25b, T('s25', '不是') - 0.1); sfx('thud', T('s25', '不是') - 0.1, { g: 0.6 });
  // ── 镜头 ──
  const zA = 1;
  camPath(cam, s, { x: 960, y: 520, z: 1.04 }, [
    [s.start + 0.05, { z: 1 }, Math.max(0.6, tB - s.start - 0.1), { ease: 'none', sfx: false }],
    [tB, { x: BX + 960, y: 484 }, 1.0, { ease: 'power3.inOut', g: 0.35 }],
    [Tend('s14') + 0.05, { x: 960, y: CY + 484, z: 1 }, 1.1, { ease: 'power3.inOut', g: 0.35 }],
    [T('s18') - 0.3, { x: 960, y: CY + 500, z: 1.02 }, 1.0, { ease: 'power2.inOut', sfx: false }],
    [T('s20') - 0.2, { x: 960, y: CY + 470, z: 1 }, 0.7, { ease: 'power3.out', sfx: false }],
    [Tend('s20') + 0.7, { x: DX + 960, y: DY + 470, z: 1 }, 1.0, { ease: 'power3.inOut', g: 0.35 }],
  ]);
});
