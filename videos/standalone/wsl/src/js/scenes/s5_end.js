// 落点（2026 年的样子）：开场的两个数字各自数的是什么。
// 站 A：2 与 3 回来，各自填上含义；站 B：3.0.1 源码里的那一行校验；站 C：两句话同时成立，以及此刻的两行回显。
scene('end', ({ root, s, c0 }) => {
  const world = h('div', 'world', root), cam = makeCamera(world, 1920, VH);
  const XB = 2100, XC = 4200;
  const D = DATA, V = D.version, Sr = D.src;
  blobs(world, [['a', -300, -320, 1150], ['b', 1200, 340, 1050], ['c', XB + 800, -260, 1100], ['a', XB + 1300, 420, 950], ['b', XC - 200, -240, 1050], ['c', XC + 1100, 380, 1050]]);

  // ── 站 A：两个数字，两种含义 ──
  const n2 = txt(world, 't-0 ink', '2', 150, 130), n3 = txt(world, 't-0 ac', '3', 1010, 130); n2.dataset.name = 'big 2'; n3.dataset.name = 'big 3';
  const back = txt(world, 't-3 dim', tr('开头的两个数字', 'The two numbers from the start'), 156, 44);
  wipe(back, c0 + SWIPE * 0.6, { dir: 'l', d: 0.45 });
  const tN = T('e1', { zh: '两个', en: 'two' }) - 0.35;       // 两个数字跟着旁白先后落下
  slam(n2, tN, { from: 1.5, d: 0.42 }); slam(n3, tN + 0.5, { from: 1.5, d: 0.42 }); sfx('thud', tN + 0.02, { p: -0.4 }); sfx('thud', tN + 0.52, { g: 0.8, p: 0.4 });
  const h2 = txt(world, 't-2', tr('架构', 'Architecture'), 430, 190), h3 = txt(world, 't-2 ac', tr('软件包版本', 'Package version'), 1290, 190); h3.style.fontSize = '92px';
  if (LANG === 'en') { h2.style.fontSize = '72px'; h3.style.fontSize = '72px'; }
  const s2 = txt(world, 't-n dim', tr('VERSION 一栏：1 或 2', 'the VERSION column: 1 or 2'), 436, 330), s3 = txt(world, 't-n dim', tr(`wsl --version：${V.pkg}`, `wsl --version: ${V.pkg}`), 1296, 330);
  const t2 = T('e2', { zh: '架构', en: 'architectures' }), t3 = T('e3', { zh: '版本号', en: 'package' });
  const tS = Tend('e1') + 0.02;                               // 句间：两个数字各自出自哪条命令
  wipe(s2, tS, { dir: 'l', d: 0.4 }); wipe(s3, tS + 0.35, { dir: 'l', d: 0.4 }); sfx('tick', tS, { g: 0.8, p: -0.4 }); sfx('tick', tS + 0.35, { g: 0.8, p: 0.4 });
  wipe(h2, t2, { dir: 'l', d: 0.45 }); sfx('pop', t2, { p: -0.4 });
  wipe(h3, t3, { dir: 'l', d: 0.45 }); sfx('pop', t3, { p: 0.4 });
  const a1 = card(world, '', 150, 520, 380, 300, tr('1 · 翻译', '1 · translate'), tr('驱动把系统调用<br>译成 NT 的调用', 'drivers turn system calls<br>into NT calls'));
  const a2 = card(world, '', 550, 520, 380, 300, tr('2 · 真内核', '2 · real kernel'), tr('虚拟机里的<br>Linux 内核', 'a Linux kernel<br>in a virtual machine'));
  css(a2, { background: '#1b1b1b', color: '#ffffff' });
  slide(a1, T('e2', { zh: '翻译', en: 'translate' }) - 0.1, { y: 80, d: 0.5 }); slide(a2, T('e2', { zh: '虚拟机', en: 'real kernel' }) - 0.1, { y: 80, d: 0.5 });
  sfx('tick', T('e2', { zh: '翻译', en: 'translate' }), { p: -0.5 }); sfx('tick', T('e2', { zh: '虚拟机', en: 'real kernel' }), { p: -0.2 });
  const steps = ['0', '1', '2', '3'].map((kk) => D.releases.firsts[kk]);
  const chips = steps.map(([tag, day], i) => { const c = h('div', 'chip' + (i === 3 ? ' ac' : ' lite'), world, tag); px(c, 1050 + i * 196, 540); c.style.fontSize = '36px'; const dd = txt(world, 't-n dim', day.slice(0, 7), 1054 + i * 196, 606); dd.style.fontSize = '28px'; return [c, dd]; });
  chips.forEach(([c, dd], i) => { const ta = t3 + 0.5 + i * 0.14; slam(c, ta, { from: 1.4, d: 0.28 }); appear(dd, ta + 0.1); sfx('tick', ta, { g: 0.8, p: 0.2 + i * 0.1 }); });
  const plus = card(world, 'ac', 1050, 680, 760, 140, tr('第二种架构 + 容器', 'the second architecture + containers')); plus.querySelector('.lab').classList.add('solo');
  slide(plus, T('e3', { zh: '第二种', en: 'second' }), { y: 80, d: 0.5 }); sfx('thud', T('e3', { zh: '容器', en: 'containers' }), { g: 0.7, p: 0.4 });

  // ── 站 B：源码里的那一行 ──
  const tB = Tend('e3') + 0.1;
  const hB = txt(world, 't-3', tr(`WSL ${Sr.tag} 的源码`, `The WSL ${Sr.tag} source`), XB + 100, 50);
  const fB = txt(world, 't-n dim mono', `${Sr.file} : ${Sr.line}`, XB + 104, 136);
  wipe(hB, tB + 0.3, { dir: 'l', d: 0.45 }); show(fB, tB + 0.6, { x: -20, y: 0, d: 0.3 });
  const code = card(world, '', XB + 100, 210, 1720, 470); css(code, { background: '#0c0c0c', color: '#cccccc', borderColor: 'rgba(0,0,0,.2)' }); code.dataset.name = 'code';
  // 校验的那一行很长：按原文断成几段显示，每段保持原样
  const chk = Sr.check, cA = chk.indexOf('(FAILED'), cB = chk.indexOf('((version != LXSS_WSL_VERSION_1)');
  const seg = [['DWORD', 'd'], ['ParseVersionString(_In_ const std::wstring_view& versionString)', 'd'], ['{', 'd'], ['    …', 'd'],
    ['    ' + chk.slice(0, cA).trim(), ''], ['        ' + chk.slice(cA, cB).trim(), ''], ['        ' + chk.slice(cB).trim(), 'key']];
  const rowsB = seg.map(([tx, cls], i) => { const e = txt(code, 'mono', '', 40, 34 + i * 58); css(e, { fontSize: '32px', lineHeight: '58px', whiteSpace: 'pre', color: cls === 'd' ? '#9a9a9a' : '#e6e6e6' });
    e.innerHTML = cls === 'key' ? esc(tx).replace('LXSS_WSL_VERSION_1', '<span class="v">LXSS_WSL_VERSION_1</span>').replace('LXSS_WSL_VERSION_2', '<span class="v">LXSS_WSL_VERSION_2</span>') : esc(tx); return e; });
  fromTo(code, tB + 0.35, { y: 90 }, { y: 0, duration: 0.6, ease: 'power3.out' }); appear(code, tB + 0.35);
  rowsB.forEach((e, i) => { appear(e, tB + 0.6 + i * 0.07); }); sfx('blip', tB + 0.6, { g: 0.6 });
  const vs = code.querySelectorAll('.v'), tV1 = T('e4', { zh: '只接受', en: 'accepts' }), tV2 = tV1 + 0.3;
  F((t) => { vs.forEach((v, i) => { const on = t >= (i ? tV2 : tV1); v.style.background = on ? '#f9f1a5' : 'transparent'; v.style.color = on ? '#0c0c0c' : ''; }); });
  sfx('tick', tV1, { p: -0.2 }); sfx('tick', tV2, { p: 0.2 });
  const defs = Sr.defines.filter((d) => /_[12]$/.test(d[0])).map((d) => `#define ${d[0]} ${d[1]}`);
  const dB = txt(world, 't-n mono', defs.map(esc).join('<br>'), XB + 104, 716); css(dB, { fontSize: '30px', lineHeight: '46px' });
  const nB = h('div', 'stamp', world, tr('没有 LXSS_WSL_VERSION_3', 'no LXSS_WSL_VERSION_3')); px(nB, XB + 900, 730); css(nB, { fontFamily: '"Mono", "Sans SC"', fontSize: '36px' });
  show(dB, tV2 + 0.3, { x: -20, y: 0, d: 0.3 }); slam(nB, Tend('e4') - 0.5, { from: 1.5, d: 0.3 }); sfx('error', Tend('e4') - 0.5, { g: 0.6, p: 0.3 });

  // ── 站 C：同时成立 ──
  const tC = Tend('e4') + 0.1;
  const q1 = card(world, '', XC + 100, 80, 840, 250), q2 = card(world, 'ac', XC + 980, 80, 840, 250);
  txt(q1, 't-3', tr('「没有 WSL 3」', '“There is no WSL 3”'), 36, 40); txt(q1, 't-n dim', tr('按架构讲 · 2026-06-23', 'read as architecture · 2026-06-23'), 44, 160);
  txt(q2, 't-3 white', tr('「WSL 3.0 发布了」', '“WSL 3.0 is out”'), 36, 40); txt(q2, 't-n white', tr('按软件包讲 · 2026-09-29', 'read as the package · 2026-09-29'), 44, 160);
  if (LANG === 'en') [q1, q2].forEach((q) => { q.querySelector('.t-3').style.fontSize = '56px'; });
  const ok1 = h('div', 'stamp good', world, tr('成立', 'true')); px(ok1, XC + 730, 230); const ok2 = h('div', 'stamp good', world, tr('成立', 'true')); px(ok2, XC + 1610, 230);
  slide(q1, T('e5', { zh: '没有', en: 'there is no' }) - 0.15, { x: -200, d: 0.5 }); slide(q2, T('e5', { zh: '发布了', en: 'is out' }) - 0.3, { x: 200, d: 0.5 }); sfx('pop', T('e5', { zh: '没有', en: 'there is no' }) - 0.1, { p: -0.4 }); sfx('pop', T('e5', { zh: '发布了', en: 'is out' }) - 0.25, { p: 0.4 });
  const tOk = T('e5', { zh: '同时', en: 'both' });
  slam(ok1, tOk, { from: 1.6, d: 0.3 }); slam(ok2, tOk + 0.18, { from: 1.6, d: 0.3 }); sfx('chime', tOk + 0.1, { g: 0.8 });
  const L1 = (LANG === 'zh' ? V.zh : V.en)[0], U = D.uname.wslc;
  const r1 = txt(world, 'num ink', hl(L1, '3', 'k'), XC + 100, 430), r2 = txt(world, 'num ink', esc(U.slice(0, -4)) + '<span class="k2">WSL2</span>', XC + 100, 640);
  css(r1, { fontSize: '104px' }); css(r2, { fontSize: '88px' }); r1.dataset.name = 'line 1'; r2.dataset.name = 'line 2';
  const c1 = txt(world, 't-n dim', 'wsl --version', XC + 104, 392), c2 = txt(world, 't-n dim', 'uname -r', XC + 104, 602); [c1, c2].forEach((e) => { e.style.fontFamily = '"Mono"'; });
  const t6a = T('e6'), t6b = T('e6', { zh: '内核', en: 'kernel' });
  // 占位：两条命令与两道横线在 e5 里先摆出来，回显到 e6 再填上
  const u1 = blk(world, '', XC + 104, 566, 1500, 4), u2 = blk(world, '', XC + 104, 760, 1500, 4), tP = T('e5') + 0.5;
  [u1, u2].forEach((u, i) => { u.style.background = '#8f8f8f'; u.dataset.name = 'placeholder'; wipe(u, tP + i * 0.5, { dir: 'l', d: 0.6 }); sfx('tick', tP + i * 0.5, { g: 0.7, p: -0.3 }); });
  show(c1, tP + 0.1, { x: -20, y: 0, d: 0.35 }); show(c2, tP + 0.6, { x: -20, y: 0, d: 0.35 });
  wipe(r1, t6a, { dir: 'l', d: 0.5 }); wipe(r2, t6b - 0.1, { dir: 'l', d: 0.5 }); sfx('whoosh', t6a, { g: 0.5 }); sfx('whoosh', t6b - 0.1, { g: 0.5 });
  const k1 = r1.querySelector('.k'), k2 = r2.querySelector('.k2'), tk1 = T('e6', { zh: '3', en: '3' }), tk2 = T('e6', { zh: 'WSL2', en: 'WSL2' });
  F((t) => { k1.style.background = t >= tk1 ? C.ac : 'transparent'; k1.style.color = t >= tk1 ? '#ffffff' : ''; k2.style.background = t >= tk2 ? '#1b1b1b' : 'transparent'; k2.style.color = t >= tk2 ? '#ffffff' : ''; });
  sfx('thud', tk1, { g: 0.8 }); sfx('thud', tk2);

  // ── 镜头 ──
  cam.track(s.start, { x: 960, y: 484, z: 1.12 }, [
    [c0, { z: 1 }, tN + 0.9 - c0, { ease: 'power2.out', sfx: false }],             // 推近的收束一直持续到两个数字落定
    [tN + 0.95, { z: 1.035 }, tB - tN - 1.0, { ease: 'none', sfx: false }],
    [tB, { x: XB + 960, z: 1 }, 0.9],
    [tB + 0.95, { z: 1.012 }, tV1 - tB - 1.4, { ease: 'none', sfx: false }],
    [tV1 - 0.4, { x: XB + 960, y: 480, z: 1.025 }, 0.8, { g: 0.3 }],                  // 推近到校验的那一行
    [tV1 + 0.45, { z: 1.035 }, tC - tV1 - 0.5, { ease: 'none', sfx: false }],
    [tC, { x: XC + 960, y: 484, z: 1 }, 0.9],
    [tC + 0.95, { z: 1.035 }, s.end - tC - 1.0, { ease: 'none', sfx: false }],
  ]);
});
