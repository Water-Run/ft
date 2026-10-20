// 第一章 WSL 1（2016 年的样子：白底、细体大字、纯色磁贴、直角）。
// 站 A：公布；站 B：没有 Linux 内核，驱动翻译系统调用；站 C：第一次提问，答案里的 26100；站 D：没实现的调用；站 E：文件与解压计时。
scene('one', ({ root, s, c0 }) => {
  const world = h('div', 'world', root), cam = makeCamera(world, 1920, VH);
  const XB = 2100, XC = 4200, XD = 6300, XE = 8400;
  const D = DATA, P = D.probes;
  clockAt(s.start + CUT, '2016-03-30');

  // ── 站 A：2016 年 3 月 30 日 ──
  const y16 = txt(world, 't-0', '2016', 84, 96); y16.dataset.name = '2016';
  const d16 = txt(world, 't-2', tr('3 月 30 日', 'March 30'), 108, 500);
  const who = txt(world, 't-4 dim', tr('微软 · Build 2016', 'Microsoft · Build 2016'), 112, 640);
  slide(y16, c0 + 0.1, { x: 320, d: 0.6, ease: 'power4.out' }); slide(d16, c0 + 0.24, { x: 260, d: 0.55, ease: 'power4.out' }); slide(who, c0 + 0.36, { x: 200, d: 0.5, ease: 'power4.out' });
  sfx('whoosh', c0 + 0.1, { g: 0.5, p: -0.3 });
  const tile1 = card(world, 'ac', 1010, 96, 790, 350, 'Bash on Ubuntu on Windows', tr('2016 年公布时的名字', 'the name at its 2016 announcement'));
  const tile2 = card(world, '', 1010, 470, 790, 350, 'Windows Subsystem for Linux', tr('支撑它的新设施 · WSL', 'the new infrastructure beneath · WSL'));
  css(tile2, { background: '#000000', color: '#ffffff' });
  const t2a = T('a2', 'Bash') - 0.15, t3a = T('a3', 'Windows Subsystem') - 0.15;
  slide(tile1, t2a, { x: 420, d: 0.55, ease: 'power4.out' }); sfx('pop', t2a, { p: 0.4 });
  slide(tile2, t3a, { x: 420, d: 0.55, ease: 'power4.out' }); sfx('thud', t3a + 0.1, { g: 0.7, p: 0.4 });

  // ── 站 B：没有 Linux 内核；两个驱动把系统调用翻译过去 ──
  const tB = Tend('a3') + 0.1;
  const hB = txt(world, 't-2', tr('没有 Linux 内核', 'No Linux kernel'), XB + 880, 70);
  slide(hB, T('a4') - 0.1, { x: 300, d: 0.55, ease: 'power4.out' }); sfx('thud', T('a4') + 0.1, { g: 0.7, p: 0.3 });
  const prog = card(world, 'line', XB + 120, 70, 640, 180, tr('Linux 程序', 'Linux program'), tr('ELF 二进制', 'ELF binary'));
  const drv = card(world, 'ac', XB + 120, 390, 640, 200, 'lxss.sys · lxcore.sys', tr('Windows 内核驱动', 'Windows kernel drivers'));
  const nt = card(world, '', XB + 120, 730, 640, 160, tr('Windows NT 内核', 'Windows NT kernel')); css(nt, { background: '#000000', color: '#ffffff' });
  [prog, drv, nt].forEach((e, i) => { slide(e, tB + 0.25 + i * 0.12, { x: 360, d: 0.5, ease: 'power4.out' }); sfx('tick', tB + 0.3 + i * 0.12, { g: 0.7, p: -0.3 }); });
  // 「Linux 内核」的位置是空的
  const ghost = card(world, 'dash', XB + 940, 390, 560, 200, tr('Linux 内核', 'Linux kernel'));
  const none = h('div', 'stamp', world, tr('没有', 'absent')); px(none, XB + 1290, 446);
  wipe(ghost, T('a4') + 0.25, { dir: 'l', d: 0.4 }); slam(none, T('a4', { zh: '没有', en: 'no Linux' }) + 0.3, { from: 1.6, d: 0.3 }); sfx('error', T('a4', { zh: '没有', en: 'no Linux' }) + 0.3, { g: 0.6, p: 0.3 });
  // 一次系统调用：从程序落到驱动，换成 NT 的调用，再落到内核
  const ovB = overlay(world);
  const a1 = path(ovB, `M${XB + 440},254 L${XB + 440},382`, 'black', { w: 5 }), a2 = path(ovB, `M${XB + 440},594 L${XB + 440},722`, 'black', { w: 5 });
  const tCall = T('a5', { zh: '系统调用', en: 'system call' }), tDrv = T('a5', { zh: '接住', en: 'caught' }), tTr = T('a6', { zh: '翻译', en: 'translated' });
  const lx = h('div', 'chip lite', world, 'sched_yield()'); px(lx, XB + 468, 284);
  const ntc = h('div', 'chip ac', world, 'ZwYieldExecution()'); px(ntc, XB + 468, 624);
  arrowIn(a1, tCall - 0.1, 0.45); slide(lx, tCall, { y: -70, d: 0.4, ease: 'power3.out' }); sfx('pop', tCall, { p: -0.2 });
  classAt(drv, 'hot', tDrv, tTr + 1.2); fromTo(drv, tDrv, { scale: 1 }, { scale: 1.04, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }); sfx('blip', tDrv, { p: -0.2 });
  arrowIn(a2, tTr - 0.05, 0.45); slide(ntc, tTr, { y: -70, d: 0.4, ease: 'power3.out' }); sfx('chime', tTr + 0.1, { g: 0.6, p: -0.2 });
  const lbl1 = txt(world, 't-n dim', tr('Linux 系统调用', 'Linux system call'), XB + 800, 296), lbl2 = txt(world, 't-n dim', tr('NT 内核的调用', 'NT kernel call'), XB + 940, 636);
  show(lbl1, tCall + 0.3, { x: -20, y: 0, d: 0.3 }); show(lbl2, tTr + 0.3, { x: -20, y: 0, d: 0.3 });
  const ex = txt(world, 't-n dim', tr('例：一一对应的一对调用（微软，2016）', 'Example: a pair that maps one to one (Microsoft, 2016)'), XB + 880, 760);
  show(ex, tTr + 0.6, { x: -20, y: 0, d: 0.35 });
  const unm = h('div', 'stamp good', world, tr('未修改', 'unmodified')); px(unm, XB + 566, 96); unm.style.fontSize = '38px';
  slam(unm, T('a7', { zh: '不用', en: 'unmodified' }), { from: 1.5, d: 0.3 }); sfx('pop', T('a7', { zh: '不用', en: 'unmodified' }), { p: -0.2 });

  // ── 站 C：第一次提问 ──
  const tC = Tend('a7') + 0.1;
  const term = makeTerm(world, { x: XC + 100, y: 60, w: 1330, h: 470, title: 'Windows PowerShell', era: 'w10' });
  wipe(term.el, tC + 0.2, { dir: 'l', d: 0.45 });
  const imp = D.import.wsl1, cutAt = imp.indexOf(' C:\\ftlab\\alpine');
  const t8 = T('a8') - 0.1, e8a = term.type('PS> ', esc(imp.slice(0, cutAt)), t8, 34, { promptAt: tC + 0.55, cursorUntil: t8 + cutAt / 34 });
  const l8b = term.line(`<span class="p">      </span><span class="c"></span>`, 's'); appear(l8b, e8a);
  const e8b = typeText(l8b.lastChild, esc(imp.slice(cutAt + 1)), e8a, 46, { cursorUntil: e8a + (imp.length - cutAt) / 46 + 0.15, sfxGain: 0.6 });
  term.out([[esc(D.import.ok[LANG]), 'd']], e8b + 0.25);
  const tAsk = Math.max(e8b + 0.7, T('a8', { zh: '问它', en: 'ask' }) - 0.1), eAsk = term.type('[ft-wsl1]$ ', 'uname -r', tAsk, 16);
  const tAns = Math.max(eAsk + 0.2, T('a9') - 0.05);
  term.out([[esc(D.uname.wsl1), 'big']], tAns, 0, 'chime');
  slotOn(0, tAns);
  // 答案放大，26100 接到 Windows 内核文件的版本号上
  const ans = txt(world, 'num ink', `4.4.0-<span class="k">${D.nt.build}</span>-Microsoft`, XC + 110, 600); ans.style.fontSize = '104px'; ans.dataset.name = 'answer 1';
  wipe(ans, tAns + 0.2, { dir: 'l', d: 0.5 });
  const k = ans.querySelector('.k'), t10 = T('a10');
  F((t) => { const on = t >= t10; k.style.background = on ? '#0063b1' : 'transparent'; k.style.color = on ? '#ffffff' : ''; });
  sfx('blip', t10, { p: -0.2 });
  const ntk = card(world, 'ac', XC + 1470, 60, 370, 230, 'ntoskrnl.exe', D.nt.ntoskrnl); ntk.querySelector('.sub').style.fontFamily = '"Mono"';
  const ntl = txt(world, 't-n dim', tr('Windows 内核文件<br>自己的版本号', 'the Windows kernel<br>file\'s own version'), XC + 1474, 306);
  const lxc = card(world, '', XC + 1470, 500, 370, 230, 'lxcore.sys', D.nt.lxcore.desc + ' · ' + D.nt.lxcore.ver.split('.').slice(2).join('.')); css(lxc, { background: '#000000', color: '#ffffff' });
  const lxl = txt(world, 't-n dim', tr('回答问题的驱动', 'the driver that answered'), XC + 1474, 746);
  slide(ntk, t10 + 0.15, { x: 300, d: 0.5, ease: 'power4.out' }); show(ntl, t10 + 0.5, { y: 0, x: 30, d: 0.3 }); sfx('pop', t10 + 0.2, { p: 0.5 });
  const t11 = T('a11', { zh: 'Windows 的驱动', en: 'driver' });
  slide(lxc, t11 - 0.1, { x: 300, d: 0.5, ease: 'power4.out' }); show(lxl, t11 + 0.3, { y: 0, x: 30, d: 0.3 }); sfx('thud', t11, { g: 0.7, p: 0.5 });

  // ── 站 D：没实现的调用 ──
  const tD = Tend('a11') + 0.1;
  const hD = txt(world, 't-2', tr('翻译，逐个实现', 'Translated call by call'), XD + 96, 720);
  slide(hD, T('a12') - 0.05, { x: 300, d: 0.55, ease: 'power4.out' });
  const termD = makeTerm(world, { x: XD + 100, y: 60, w: 1200, h: 600, title: 'ft-wsl1', era: 'w10' });
  wipe(termD.el, tD + 0.2, { dir: 'l', d: 0.45 });
  const probes = [['dmesg', tr('内核日志', 'kernel log'), 'a13', { zh: '内核日志', en: 'kernel log' }, { zh: '功能', en: 'function' }],
    ['userns', tr('用户命名空间', 'user namespaces'), 'a14', { zh: '容器', en: 'User' }, { zh: '用户命名空间', en: 'namespaces' }],
    ['cgroup', 'cgroup', 'a14', { zh: 'cgroup', en: 'cgroups' }, { zh: '也都', en: 'absent' }]];
  probes.forEach(([key, name, cue, at, ansAt], i) => {
    const tc = Math.max(T(cue, at) - 0.35, tD + 0.7), ec = termD.type('[ft-wsl1]$ ', esc(P.cmd[key]), tc, 30, { promptAt: i === 0 ? tD + 0.6 : tc - 0.25 });
    const to = Math.max(ec + 0.15, T(cue, ansAt) - 0.1);
    termD.out([[`<span class="er">${esc(P.wsl1[key])}</span>`, 's']], to, 0, 'error');
    if (i < 2) termD.gap();
    const tl = card(world, 'line', XD + 1380, 60 + i * 212, 440, 186, name); tl.querySelector('.lab').classList.add('solo');
    const st = h('div', 'stamp', world, tr('没有', 'absent')); px(st, XD + (LANG === 'zh' ? 1676 : 1640), 78 + i * 212); st.style.fontSize = '38px';
    slide(tl, tD + 0.5 + i * 0.14, { x: 280, d: 0.5, ease: 'power4.out' }); sfx('tick', tD + 0.55 + i * 0.14, { g: 0.6, p: 0.5 }); slam(st, to + 0.1, { from: 1.6, d: 0.28 });       // 三项先摆出来占位，说到哪项哪项盖章
  });
  const fn = txt(world, 't-n dim', tr('klogctl、unshare(CLONE_NEWUSER)、mount cgroup2：三处都被拒绝', 'klogctl, unshare(CLONE_NEWUSER), mount cgroup2: all three refused'), XD + 100, 860);
  show(fn, Tend('a14') - 0.6, { x: -20, y: 0, d: 0.35 });

  // ── 站 E：文件与解压 ──
  const tE = Tend('a14') + 0.1, St = D.storage.wsl1, Tm = D.timing;
  const hE = txt(world, 't-3', tr('Windows 文件系统里的普通文件', 'Ordinary files on the Windows filesystem'), XE + 100, 60);
  slide(hE, T('a15') - 0.05, { x: 300, d: 0.55, ease: 'power4.out' });
  const grid = makeGrid(world, { x: XE + 104, y: 190, n: St.files, cols: 36, pitch: 23, size: 17, name: 'rootfs files' });
  grid.cells.forEach((c, i) => { appear(c, tE + 0.35 + (i % 36) * 0.012 + Math.floor(i / 36) * 0.03); });
  sfx('tick', tE + 0.4, { g: 0.6, p: -0.4 }); sfx('tick', tE + 0.6, { g: 0.5, p: -0.4 }); sfx('tick', tE + 0.8, { g: 0.4, p: -0.4 });
  const gl = txt(world, 't-b', `C:\\ftlab\\wsl1\\rootfs<span class="dim"> · ${tr(`${St.files} 个文件，${St.dirs} 个目录`, `${St.files} files, ${St.dirs} directories`)}</span>`, XE + 100, 490); gl.style.fontFamily = '"Mono", "Sans SC"';
  const gn = txt(world, 't-n dim', tr(`挂载类型 ${St.root} · 在 Windows 一侧可以直接数出来`, `mounted as ${St.root} · countable from the Windows side`), XE + 100, 548);
  show(gl, T('a15', { zh: '普通文件', en: 'ordinary' }), { x: -30, y: 0, d: 0.4 }); show(gn, T('a15', { zh: '普通文件', en: 'ordinary' }) + 0.3, { x: -30, y: 0, d: 0.4 });
  const tRun = T('a16', { zh: '用了', en: 'took' }) - Tm.ms.wsl1_linux / 1000;       // 条形走完的那一刻正好读到「用了」
  const bl = txt(world, 't-b', tr(`解压 WSL 3.0.1 的源码包 · ${nf(Tm.files)} 个文件`, `Unpacking the WSL 3.0.1 source archive · ${nf(Tm.files)} files`), XE + 100, 650);
  const bar = makeBar(world, { x: XE + 104, y: 716, w: 1100, h: 56, frac: 1 });
  const num = txt(world, 'num ac', '0.00', XE + 1250, 650); num.style.fontSize = '150px';
  const unit = txt(world, 't-3', tr('秒', 's'), XE + 1640, 730);
  wipe(bl, T('a16') - 0.1, { dir: 'l', d: 0.4 }); wipe(bar.el, T('a16') + 0.05, { dir: 'l', d: 0.35 }); appear(num, T('a16') + 0.1); appear(unit, T('a16') + 0.1);
  bar.run(tRun, Tm.ms.wsl1_linux / 1000);
  F((t) => { num.textContent = (clamp((t - tRun) / (Tm.ms.wsl1_linux / 1000)) * Tm.ms.wsl1_linux / 1000).toFixed(2); });
  sfx('riser', tRun, { g: 0.5 }); sfx('thud', tRun + Tm.ms.wsl1_linux / 1000, { p: 0.3 });
  const bn = txt(world, 't-n dim', tr('本机实测，5 次的中位数，已扣除启动开销；条形按真实耗时走完', 'Measured here: median of 5, start-up overhead subtracted; the bar runs in real time'), XE + 104, 800);
  show(bn, tRun + 0.3, { x: -20, y: 0, d: 0.35 });

  // ── 镜头 ──
  const tAB = tB, tBC = tC, tCD = tD, tDE = tE;
  cam.track(s.start, { x: 960, y: 484, z: 1.04 }, [
    [c0, { z: 1 }, 0.8, { ease: 'power3.out', sfx: false }],
    [c0 + 0.85, { z: 1.03 }, tAB - c0 - 0.9, { ease: 'none', sfx: false }],
    [tAB, { x: XB + 900, z: 1 }, 0.9],
    [tAB + 0.95, { z: 1.03 }, tBC - tAB - 1.0, { ease: 'none', sfx: false }],
    [tBC, { x: XC + 975, z: 1 }, 0.9],
    [tBC + 0.95, { z: 1.03 }, tCD - tBC - 1.0, { ease: 'none', sfx: false }],
    [tCD, { x: XD + 960, z: 1 }, 0.9],
    [tCD + 0.95, { z: 1.03 }, tDE - tCD - 1.0, { ease: 'none', sfx: false }],
    [tDE, { x: XE + 960, z: 1 }, 0.9],
    [tDE + 0.95, { z: 1.03 }, s.end - tDE - 1.0, { ease: 'none', sfx: false }],
  ]);
});
