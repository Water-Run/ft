// 第二章 WSL 2（2019 年的样子：浅灰底、亚克力面、柔和投影、半粗体）。
// 站 A：公布，虚拟机里的真内核；站 B：第二次提问；站 C：同样三项探测，这次都在；站 D：ext4 虚拟磁盘与解压计时；
// 站 E：边界上的代价（9P），88 秒的条形由镜头跟拍；站 F：两种发行版并存。
scene('two', ({ root, s, c0 }) => {
  const world = h('div', 'world', root), cam = makeCamera(world, 1920, VH);
  const XB = 2100, XC = 4200, XD = 6300, XE = 8400;
  const D = DATA, P = D.probes, Tm = D.timing;
  const PXS = 38, XF = XE + 104 + Math.round(Tm.ms.wsl2_win / 1000 * PXS) - 620;       // 条形每秒 38px；站 F 接在 88 秒条形的尽头
  blobs(world, [['a', -260, -300, 1100], ['b', 1100, 300, 1000], ['c', XB + 700, -260, 1100], ['a', XB + 1500, 420, 900], ['b', XC - 200, 380, 1000], ['c', XC + 1000, -240, 1000],
    ['a', XD + 100, -280, 1000], ['b', XD + 1100, 380, 1000], ['c', XE + 300, -300, 1100], ['a', XE + 1500, 300, 1000], ['b', XE + 2700, -200, 1000], ['c', XF + 300, 320, 1000], ['a', XF + 1200, -260, 1000]]);
  clockAt(s.start + CUT, '2019-05-06');

  // ── 站 A：2019 年 5 月 6 日 ──
  const y19 = txt(world, 't-0 ac', '2019', 96, 104); y19.dataset.name = '2019'; y19.style.color = C.fl;
  const d19 = txt(world, 't-2', tr('5 月 6 日', 'May 6'), 110, 494), who = txt(world, 't-4 dim', tr('微软公布 WSL 2', 'Microsoft announces WSL 2'), 114, 624);
  slam(y19, c0 + 0.1, { from: 1.15, d: 0.5 }); wipe(d19, c0 + 0.3, { dir: 'l', d: 0.45 }); show(who, c0 + 0.5, { y: 14, d: 0.4 }); sfx('thud', c0 + 0.14, { g: 0.6, p: -0.4 });
  // 右侧：虚拟机里的真内核
  const vm = card(world, 'line', 1060, 56, 760, 590); vm.dataset.name = 'vm';
  const vmL = txt(world, 't-4', tr('轻量级虚拟机', 'Lightweight virtual machine'), 1096, 78);
  const prog = card(world, '', 1110, 170, 660, 150, tr('Linux 程序', 'Linux program'), tr('ELF 二进制 · 未修改', 'ELF binary · unmodified'));
  const kern = card(world, 'ac', 1110, 430, 660, 170, tr('Linux 内核', 'Linux kernel'), tr('真正的内核 · 首批预览版为 4.19', 'the real kernel · 4.19 in the first builds'));
  const ntk = card(world, '', 1060, 690, 760, 150, tr('Windows NT 内核', 'Windows NT kernel')); ntk.querySelector('.lab').classList.add('solo');
  const ov = overlay(world), ar = path(ov, 'M1440,326 L1440,422', 'ink', { w: 5 });
  const tK = T('b2', { zh: '真正', en: 'real' }), tV = T('b3', { zh: '虚拟机', en: 'virtual' });
  slide(prog, T('b2') - 0.1, { y: 60, d: 0.5, ease: 'power3.out' }); slide(ntk, T('b2') + 0.05, { y: 60, d: 0.5, ease: 'power3.out' }); sfx('pop', T('b2'), { g: 0.6, p: 0.4 });
  const sc = h('div', 'chip lite', world, tr('系统调用', 'system call')); px(sc, 1470, 352);
  const noTr = txt(world, 't-n bad', tr('不再翻译', 'no translation'), 1110, 356); noTr.style.fontWeight = '700';
  wipe(noTr, T('b2', { zh: '不再', en: 'no trans' }), { dir: 'l', d: 0.3 }); sfx('blip', T('b2', { zh: '不再', en: 'no trans' }), { g: 0.6, p: 0.3 });
  slam(kern, tK, { from: 1.2, d: 0.45 }); sfx('thud', tK, { p: 0.4 }); arrowIn(ar, tK + 0.2, 0.4); slide(sc, tK + 0.25, { y: -50, d: 0.35 });
  wipe(vm, tV - 0.15, { dir: 't', d: 0.5 }); wipe(vmL, tV, { dir: 'l', d: 0.35 }); sfx('whoosh', tV - 0.15, { g: 0.5, p: 0.4 });
  const ga = h('div', 'chip ac', world, tr('2020 年 5 月 · Windows 10 2004 版 · 正式提供', 'May 2020 · Windows 10, version 2004 · generally available')); px(ga, 110, 750); ga.style.fontFamily = '"Inter", "Sans SC"'; ga.style.fontSize = LANG === 'zh' ? '36px' : '30px';
  const tGA = T('b4');
  slide(ga, tGA, { x: -160, d: 0.5 }); sfx('pop', tGA, { p: -0.4 }); clockAt(tGA, '2020-05-27');

  // ── 站 B：第二次提问 ──
  const tB = Tend('b4') + 0.1;
  const term = makeTerm(world, { x: XB + 100, y: 56, w: 1330, h: 474, title: 'PowerShell', era: 'fl' });
  fromTo(term.el, tB + 0.2, { y: 90 }, { y: 0, duration: 0.6, ease: 'power3.out' }); appear(term.el, tB + 0.2);
  const imp = D.import.wsl2, cutAt = imp.indexOf(' C:\\ftlab\\alpine');
  const t5 = T('b5') - 0.1, e5a = term.type('PS> ', esc(imp.slice(0, cutAt)), t5, 34, { promptAt: tB + 0.6, cursorUntil: t5 + cutAt / 34 });
  const l5b = term.line('<span class="p">      </span><span class="c"></span>', 's'); appear(l5b, e5a);
  const e5b = typeText(l5b.lastChild, esc(imp.slice(cutAt + 1)), e5a, 46, { cursorUntil: e5a + (imp.length - cutAt) / 46 + 0.15, sfxGain: 0.6 });
  term.out([[esc(D.import.ok[LANG]), 'd']], e5b + 0.25);
  const tAsk = Math.max(e5b + 0.6, T('b5', { zh: '问', en: 'question' }) - 0.2), eAsk = term.type('[ft-wsl2]$ ', 'uname -r', tAsk, 16);
  const tAns = Math.max(eAsk + 0.2, T('b6') - 0.05);
  const U = D.uname.wsl2, cutU = U.indexOf('microsoft');
  term.out([[esc(U), 'big']], tAns, 0, 'chime'); term.el.querySelector('.ln.big').style.fontSize = '50px';
  slotOn(1, tAns); clockAt(tAns, '2026-10-06');
  const ans = txt(world, 'num ink', `${esc(U.slice(0, cutU))}<br>${esc(U.slice(cutU, -4))}<span class="k">WSL2</span>`, XB + 104, 580); css(ans, { fontSize: '100px', lineHeight: '1.14' }); ans.dataset.name = 'answer 2';
  wipe(ans, tAns + 0.2, { dir: 'l', d: 0.55 });
  const k = ans.querySelector('.k'), tW = T('b6', { zh: '结尾', en: 'ends' });
  F((t) => { const on = t >= tW; k.style.background = on ? C.fl : 'transparent'; k.style.color = on ? '#ffffff' : ''; });
  sfx('blip', tW, { p: 0.2 });
  const side = card(world, '', XB + 1470, 56, 370, 250, tr('第一次', 'First run'), ''); side.querySelector('.sub').innerHTML = `<span class="mono" style="font-size:26px">${esc(D.uname.wsl1)}</span>`;
  const side2 = card(world, 'ac', XB + 1470, 336, 370, 250, tr('第二次', 'Second run'), ''); side2.querySelector('.sub').innerHTML = '<span class="mono" style="font-size:27px">6.18.40.1-…-WSL2</span>';
  slide(side, tB + 0.5, { x: 200, d: 0.5 }); slide(side2, tAns + 0.3, { x: 200, d: 0.5 }); sfx('pop', tAns + 0.3, { p: 0.5 });

  // ── 站 C：同样三项，这次都在 ──
  const tC = Tend('b6') + 0.1;
  const hC = txt(world, 't-2', tr('这一次都在', 'This time, all present'), XC + 96, 730);
  wipe(hC, T('b7', { zh: '也都', en: 'So are' }), { dir: 'l', d: 0.45 });
  const termC = makeTerm(world, { x: XC + 100, y: 56, w: 1200, h: 610, title: 'ft-wsl2', era: 'fl' });
  fromTo(termC.el, tC + 0.2, { y: 90 }, { y: 0, duration: 0.6, ease: 'power3.out' }); appear(termC.el, tC + 0.2);
  const dm = P.wsl2.dmesg.replace(/ \(root@.*$/, ' …');
  const probes = [['dmesg', tr('内核日志', 'kernel log'), dm, { zh: '内核日志', en: 'kernel log' }],
    ['userns', tr('用户命名空间', 'user namespaces'), P.wsl2.userns, { zh: '命名空间', en: 'namespaces' }],
    ['cgroup', 'cgroup', P.wsl2.cgroup, { zh: 'cgroup', en: 'cgroups' }]];
  probes.forEach(([key, name, outp, at], i) => {
    const tc = Math.max(T('b7', at) - 0.55, tC + 0.7 + i * 0.5), ec = termC.type('[ft-wsl2]$ ', esc(P.cmd[key]), tc, 34, { promptAt: i === 0 ? tC + 0.6 : tc - 0.25 });
    const to = ec + 0.15;
    termC.out([[`<span class="ok">${esc(outp)}</span>`, 's']], to, 0, 'blip');
    if (i < 2) termC.gap();
    const tl = card(world, '', XC + 1380, 56 + i * 212, 440, 186, name); tl.querySelector('.lab').classList.add('solo');
    const st = h('div', 'stamp good', world, tr('有', 'present')); px(st, XC + (LANG === 'zh' ? 1700 : 1610), 146 + i * 212); st.style.fontSize = '38px';
    slide(tl, tC + 0.45 + i * 0.1, { x: 200, d: 0.5 }); slam(st, to + 0.1, { from: 1.6, d: 0.28 }); sfx('pop', to + 0.1, { g: 0.7, p: 0.5 });
  });

  // ── 站 D：一个 ext4 虚拟磁盘文件；同样的解压 ──
  const tD = Tend('b7') + 0.1, S1 = D.storage.wsl1, S2 = D.storage.wsl2;
  const hD = txt(world, 't-3', tr('一个 ext4 格式的虚拟磁盘文件', 'One ext4 virtual disk file'), XD + 100, 56);
  wipe(hD, T('b8') - 0.05, { dir: 'l', d: 0.45 });
  const grid = makeGrid(world, { x: XD + 104, y: 180, n: S1.files, cols: 36, pitch: 23, size: 17, name: 'files' });
  appear(grid.el, tD + 0.2);
  const tV2 = T('b8', { zh: '虚拟磁盘', en: 'virtual disk' }) - 0.5;
  // 424 个方格收拢成一个文件
  grid.cells.forEach((c, i) => { const x = (i % 36) * 23, y = Math.floor(i / 36) * 23; to(c, tV2 + (i % 36) * 0.006, { x: 360 - x, y: 120 - y, scale: 0.2, autoAlpha: 0, duration: 0.5, ease: 'power3.in' }); });
  const vhd = card(world, 'ac', XD + 104, 200, 760, 210, 'ext4.vhdx', bytes(S2.vhdx)); vhd.querySelector('.lab').style.fontFamily = '"Mono"';
  slam(vhd, tV2 + 0.5, { from: 0.6, d: 0.45, ease: 'back.out(1.6)' }); sfx('whoosh', tV2, { g: 0.5, p: -0.4 }); sfx('thud', tV2 + 0.5, { p: -0.4 });
  const vn = txt(world, 't-n dim', tr(`C:\\ftlab\\wsl2 里只有这一个文件 · 挂载为 ${S2.root}（${S2.dev}）`, `the only file in C:\\ftlab\\wsl2 · mounted as ${S2.root} (${S2.dev})`), XD + 104, 432);
  show(vn, tV2 + 0.9, { x: -20, y: 0, d: 0.35 });
  const W = 1100, f2 = Tm.ms.wsl2_linux / Tm.ms.wsl1_linux, d2 = Tm.ms.wsl2_linux / 1000;
  const bl = txt(world, 't-b', tr(`同样解压那 ${nf(Tm.files)} 个文件`, `Unpacking the same ${nf(Tm.files)} files`), XD + 100, 560);
  const r1 = txt(world, 't-n dim', tr('版本 1', 'version 1'), XD + 104, 640), r2 = txt(world, 't-n', tr('版本 2', 'version 2'), XD + 104, 740);
  const b1 = makeBar(world, { x: XD + 250, y: 632, w: W, h: 50, frac: 1 }); b1.fill.style.background = '#a19f9d';
  const b2 = makeBar(world, { x: XD + 250, y: 732, w: W, h: 50, frac: f2 });
  const n1 = txt(world, 't-4 dim num', sec(Tm.ms.wsl1_linux) + tr(' 秒', ' s'), XD + 1380, 634), n2 = txt(world, 'num ac', '0.00', XD + 1380, 712); n2.style.fontSize = '104px'; n2.style.color = C.fl;
  const u2 = txt(world, 't-3', tr('秒', 's'), XD + 1660, 760);
  const t9 = T('b9'), tRun = T('b9', { zh: '0.34', en: '0.34' }) - d2;
  wipe(bl, t9 - 0.1, { dir: 'l', d: 0.4 }); [r1, b1.el, n1, r2, b2.el].forEach((e, i) => wipe(e, t9 + 0.05 + i * 0.05, { dir: 'l', d: 0.3 })); appear(n2, t9 + 0.2); appear(u2, t9 + 0.2);
  b2.run(tRun, d2); F((t) => { n2.textContent = (clamp((t - tRun) / d2) * d2).toFixed(2); }); sfx('chime', tRun + d2, { g: 0.7 });
  const seventh = h('div', 'stamp good', world, tr(`约为七分之一`, `about a seventh`)); px(seventh, XD + 250 + W * f2 + 30, 730); seventh.style.fontSize = '36px';
  slam(seventh, T('b9', { zh: '约为', en: 'about' }), { from: 1.4, d: 0.3 }); sfx('pop', T('b9', { zh: '约为', en: 'about' }));
  const dn = txt(world, 't-n dim', tr(`本机实测：${sec(Tm.ms.wsl1_linux)} 秒 ÷ ${sec(Tm.ms.wsl2_linux)} 秒 = ${Tm.ratioLinux} 倍`, `Measured here: ${sec(Tm.ms.wsl1_linux)} s ÷ ${sec(Tm.ms.wsl2_linux)} s = ${Tm.ratioLinux}×`), XD + 250, 810);
  show(dn, tRun + d2 + 0.3, { x: -20, y: 0, d: 0.35 });

  // ── 站 E：边界上的代价 ──
  const tE = Tend('b9') + 0.1;
  const hE = txt(world, 't-2', tr('代价在边界上', 'The cost is at the border'), XE + 96, 44);
  wipe(hE, T('b10') - 0.05, { dir: 'l', d: 0.45 });
  const lin = card(world, 'ac', XE + 104, 190, 520, 170, tr('Linux 文件系统', 'Linux filesystem'), 'ext4'), win = card(world, '', XE + 1180, 190, 560, 170, tr('Windows 的盘', 'Windows drive'), 'C:\\ · /mnt/c');
  const ovE = overlay(world), pipe = path(ovE, `M${XE + 632},275 L${XE + 1170},275`, 'ink', { w: 7 });
  const p9 = h('div', 'chip', world, '9P'); px(p9, XE + 850, 244);
  slide(lin, tE + 0.3, { x: -160, d: 0.5 }); slide(win, T('b10', { zh: 'Windows', en: 'Windows' }) - 0.1, { x: 160, d: 0.5 }); sfx('pop', T('b10', { zh: 'Windows', en: 'Windows' }) - 0.1, { p: 0.4 });
  const t9p = T('b10', { zh: '9P', en: '9P' });
  arrowIn(pipe, t9p - 0.3, 0.45); slam(p9, t9p, { from: 1.5, d: 0.3 }); sfx('thud', t9p, { g: 0.7 });
  const p9n = txt(world, 't-n dim', tr(`版本 2 里 /mnt/c 的挂载类型是 ${S2.c}，版本 1 里是 ${S1.c}`, `/mnt/c is mounted as ${S2.c} in version 2, as ${S1.c} in version 1`), XE + 104, 384);
  show(p9n, t9p + 0.3, { x: -20, y: 0, d: 0.35 });
  const el = txt(world, 't-b', tr(`把同一个包解到 C 盘`, `Unpacking the same archive onto C:`), XE + 100, 500);
  const e1 = txt(world, 't-n dim', tr('版本 1', 'version 1'), XE + 104, 584), e2 = txt(world, 't-n', tr('版本 2', 'version 2'), XE + 104, 714);
  const w1 = Tm.ms.wsl1_win / 1000 * PXS, w2 = Tm.ms.wsl2_win / 1000 * PXS, X0 = XE + 250;
  const eb1 = blk(world, 'bar-fill', X0, 576, w1, 50); eb1.style.background = '#a19f9d';
  const eb2 = blk(world, 'bar-fill', X0, 706, w2, 50); eb2.dataset.bleed = '1';
  const en1 = txt(world, 't-4 dim num', sec(Tm.ms.wsl1_win, 1) + tr(' 秒', ' s'), X0 + w1 + 24, 578);
  const t11 = T('b11'), tW1 = T('b11', { zh: '7.8', en: '7.8' }), t12 = T('b12'), tW2 = T('b12', { zh: '88', en: '88' });
  wipe(el, t11 - 0.1, { dir: 'l', d: 0.4 }); wipe(e1, t11 + 0.1, { dir: 'l', d: 0.3 }); wipe(e2, t11 + 0.2, { dir: 'l', d: 0.3 });
  fromTo(eb1, tW1 - 0.7, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.7, ease: 'none' }); appear(eb1, tW1 - 0.7); appear(en1, tW1); sfx('pop', tW1, { g: 0.7 });
  // 88 秒的条形：从这一句开口之前长起，读到「88」时正好长完，读数走到 88.0；镜头跟着条形的头走
  const tG = t12 - 0.35, GROW = tW2 + 0.3 - tG;
  fromTo(eb2, tG, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: GROW, ease: 'none' }); appear(eb2, tG); sfx('riser', tG + GROW - 1.2, { g: 0.8 });
  const big = txt(world, 'num', '0.0', 0, 0); css(big, { fontSize: '150px', color: C.bad }); big.dataset.name = '88 s';
  const bigU = txt(world, 't-3 bad', tr('秒', 's'), 0, 0);
  appear(big, tG); appear(bigU, tG);
  const headX = (t) => X0 + w2 * clamp((t - tG) / GROW);
  F((t) => { const hx = headX(t); big.textContent = (clamp((t - tG) / GROW) * Tm.ms.wsl2_win / 1000).toFixed(1); big.style.left = (hx - 520) + 'px'; big.style.top = '782px'; bigU.style.left = (hx - 520 + (big.textContent.length * 90) + 14) + 'px'; bigU.style.top = '852px'; });
  sfx('error', tG + GROW, { g: 0.8 }); sfx('thud', tG + GROW + 0.02);
  const fast = txt(world, 't-n dim', tr('本机实测，含 sync；条形的生长为快放', 'measured here, sync included; growth fast-forwarded'), XF + 60, 646);
  show(fast, tG + GROW + 0.3, { x: -20, y: 0, d: 0.35 });
  const ratio = h('div', 'stamp', world, tr(`是版本 1 的 ${Tm.ratioWin} 倍`, `${Tm.ratioWin}× version 1`)); px(ratio, XF + 620 - 560, 560);
  slam(ratio, tG + GROW + 0.25, { from: 1.5, d: 0.3 }); sfx('pop', tG + GROW + 0.25);

  // ── 站 F：两种发行版并存 ──
  const tF = Tend('b12') + 0.1;
  const hF = txt(world, 't-2', tr('版本 1 至今保留', 'Version 1 is still supported'), XF + 840, 56); if (LANG === 'en') hF.style.fontSize = '72px';
  wipe(hF, T('b13') - 0.05, { dir: 'l', d: 0.45 });
  const termF = makeTerm(world, { x: XF + 840, y: 220, w: 1010, h: 330, title: 'PowerShell', era: 'fl' });
  fromTo(termF.el, tF + 0.3, { y: 90 }, { y: 0, duration: 0.6, ease: 'power3.out' }); appear(termF.el, tF + 0.3);
  const eF = termF.type('PS> ', 'wsl -l -v', T('b13') + 0.2, 22, { promptAt: tF + 0.7 });
  const R = D.labList.rows;
  termF.out([[esc(D.labList.header), 'd'], esc(R[0].slice(0, -1)) + `<span class="hi">${R[0].slice(-1)}</span>`, esc(R[1].slice(0, -1)) + `<span class="hi">${R[1].slice(-1)}</span>`], Math.max(eF + 0.2, T('b13', { zh: '两种', en: 'two kinds' }) - 0.3));
  const both = txt(world, 't-4 dim', tr('同一台机器，两种发行版并存', 'one machine, both kinds side by side'), XF + 844, 580);
  show(both, T('b13', { zh: '并存', en: 'side' }), { y: 14, d: 0.4 }); sfx('chime', T('b13', { zh: '并存', en: 'side' }), { g: 0.6 });

  // ── 镜头 ──
  const xEnd = XF + 620 + 340;
  cam.track(s.start, { x: 960, y: 484, z: 1.04 }, [
    [c0, { z: 1 }, 0.8, { ease: 'power3.out', sfx: false }],
    [c0 + 0.85, { z: 1.03 }, tB - c0 - 0.9, { ease: 'none', sfx: false }],
    [tB, { x: XB + 970, z: 1 }, 0.9],
    [tB + 0.95, { z: 1.03 }, tC - tB - 1.0, { ease: 'none', sfx: false }],
    [tC, { x: XC + 960, z: 1 }, 0.9],
    [tC + 0.95, { z: 1.03 }, tD - tC - 1.0, { ease: 'none', sfx: false }],
    [tD, { x: XD + 960, z: 1 }, 0.9],
    [tD + 0.95, { z: 1.03 }, tE - tD - 1.0, { ease: 'none', sfx: false }],
    [tE, { x: XE + 960, z: 1 }, 0.9],
    [tE + 0.95, { z: 1.02 }, tG - tE - 1.0, { ease: 'none', sfx: false }],
    [tG, { x: xEnd, z: 1 }, GROW + 0.25, { ease: 'power1.inOut', g: 0.4 }],             // 跟着 88 秒的条形走到头
    [tG + GROW + 0.3, { z: 1.03 }, s.end - tG - GROW - 0.35, { ease: 'none', sfx: false }],
  ]);
});
