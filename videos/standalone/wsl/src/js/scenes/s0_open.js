// 开场（2026 年的样子）：两个数字的矛盾 → 片名 → 方法。
// 站 A：6 月 23 日的帖子；站 B：9 月 29 日的发布页；站 C：终端里的 3 与 2；片名卡盖住换站；站 D：同一份根文件系统，问三次。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  // 全片的第 0 帧：镜头轨迹里的每一段在构建时都会套用自己的起点（而且是延迟到下一拍才写入），构建完镜头停在最后一站；
  // 开机时时间线本来就在 0，跳到 0 不会重算。所以在镜头自己的帧函数之前登记这一个：轨迹的第一段开始之前，每帧都把镜头放回起点
  const CAM0 = { x: 960, y: 484, z: 1.07, r: 0 };
  let cam = null;
  F((t) => { if (cam && t < 0.02) Object.assign(cam.st, CAM0); });
  cam = makeCamera(world, 1920, VH);
  const XB = 2100, XC = 4300, XD = 6600;
  const Q = DATA.quotes, V = DATA.version;
  blobs(world, [['a', -320, -340, 1150], ['b', 1250, 360, 1050], ['c', XB + 950, -260, 1150], ['a', XB + 60, 480, 950], ['b', XC - 320, -240, 1050], ['c', XC + 1150, 380, 1050], ['a', XD + 150, -300, 1050], ['b', XD + 1200, 400, 1050]]);
  clockAt(0, Q.loewen.date);

  // ── 站 A：帖子 ──
  const yA = txt(world, 't-3 dim', '2026', 124, 62), dA = txt(world, 't-2', tr('6 月 23 日', 'June 23'), 118, 138);
  slide(yA, 0.05, { x: -70, d: 0.4 }); slam(dA, 0.1, { from: 1.25, d: 0.42 }); sfx('thud', 0.12, { g: 0.7, p: -0.4 });
  const post = card(world, '', 120, 292, 1250, 388); post.dataset.name = 'post';
  txt(post, 't-4', `${esc(Q.loewen.name)} <span class="dim" style="font-weight:500">${esc(Q.loewen.handle)}</span>`, 46, 30);
  txt(post, 't-n dim', esc(Q.loewen.bio.split(' #')[0]), 46, 96);
  const q1 = txt(post, '', '', 46, 166); css(q1, { font: '600 52px "Inter"', letterSpacing: '-.015em', lineHeight: '1.2' });
  const q2 = txt(post, 't-n dim', esc(Q.loewen.second), 46, 252);
  const srcA = txt(post, 't-n dim mono', 'x.com/craigaloewen/status/2069420597487055276', 46, 316); srcA.style.fontSize = '26px';
  fromTo(post, 0.35, { y: 80 }, { y: 0, duration: 0.6, ease: 'power3.out' }); appear(post, 0.35); sfx('pop', 0.4, { g: 0.6, p: -0.3 });
  const tQ = T('o1', { zh: '帖子', en: 'posted' }) - 0.5;
  const tQe = typeText(q1, esc(Q.loewen.first), tQ, 30, { cursorUntil: T('o2') + 0.2, sfxGain: 0.6 });
  show(q2, tQe + 0.15, { y: 12, d: 0.4 });
  const bigA = txt(world, 't-2', tr('「没有 WSL 3 这种东西」', '“no such thing as WSL 3”'), 108, 720);
  const tNo = T('o2', { zh: '没有', en: 'no such' });
  wipe(bigA, tNo, { dir: 'l', d: 0.5 }); sfx('whoosh', tNo, { g: 0.5, p: -0.3 });
  // 右侧：一个被划掉的 3
  const three = txt(world, 't-0 ink', '3', 1500, 250); three.dataset.name = '3';
  slam(three, tQ + 0.3, { from: 1.4, d: 0.45 }); sfx('thud', tQ + 0.32, { g: 0.6, p: 0.5 });
  const ovA = overlay(world), strike = path(ovA, 'M1440,640 L1800,250', 'bad', { w: 22, arrow: false });
  strike.setAttribute('stroke-linecap', 'butt');                 // 圆头线帽在零长度时会露出一个点
  const tStrike = T('o2', { zh: 'WSL', en: 'WSL' });
  draw(strike, tStrike, 0.3); hideUntil(strike, tStrike); sfx('error', tStrike, { g: 0.6, p: 0.5 });

  // ── 站 B：发布页 ──
  const tB = Tend('o2') + 0.12;
  clockAt(T('o3', { zh: '9 月', en: 'September' }), Q.r301.date);
  const yB = txt(world, 't-3 dim', '2026', XB + 124, 62), dB = txt(world, 't-2', tr('9 月 29 日', 'September 29'), XB + 118, 138);
  slide(yB, tB + 0.3, { x: -70, d: 0.4 }); slam(dB, T('o3', { zh: '9 月', en: 'September' }), { from: 1.25, d: 0.42 }); sfx('thud', T('o3', { zh: '9 月', en: 'September' }), { g: 0.7, p: -0.4 });
  const rel = card(world, '', XB + 120, 292, 1180, 388); rel.dataset.name = 'release';
  txt(rel, 't-4', 'microsoft <span class="dim" style="font-weight:500">/</span> WSL <span class="dim" style="font-weight:500">· Releases</span>', 46, 30);
  txt(rel, 't-3', esc(Q.r301.head), 46, 118);
  txt(rel, 't-n dim', `Latest · ${Q.r301.date} ${Q.r301.time} UTC`, 46, 222);
  txt(rel, 't-n dim mono', `Full Changelog: ${Q.r301.from}...${Q.r301.to}`, 46, 286).style.fontSize = '28px';
  fromTo(rel, tB + 0.2, { y: 80 }, { y: 0, duration: 0.6, ease: 'power3.out' }); appear(rel, tB + 0.2);
  const tag = txt(world, 'num ac', Q.r301.tag, XB + 1332, 318); css(tag, { fontSize: '150px' }); tag.dataset.name = '3.0.1';
  const tTag = T('o3', { zh: '3.0.1', en: '3.0.1' });
  slam(tag, tTag, { from: 1.4, d: 0.45 }); sfx('thud', tTag, { p: 0.5 });
  const bigB = txt(world, 't-2', tr('WSL 3.0.1 发布', 'WSL 3.0.1 released'), XB + 108, 720);
  wipe(bigB, tTag + 0.25, { dir: 'l', d: 0.5 }); sfx('chime', tTag + 0.3, { g: 0.6 });

  // ── 站 C：同一台机器上的 3 与 2 ──
  const tC = Tend('o3') + 0.12;
  clockAt(T('o4'), '2026-10-06');
  const term = makeTerm(world, { x: XC + 100, y: 62, w: 1210, h: 838, title: 'PowerShell', era: 'w11' });
  wipe(term.el, tC + 0.15, { dir: 'l', d: 0.5 });
  const L1 = LANG === 'zh' ? V.zh : V.en, E3 = LANG === 'zh' ? V.set3.zh : V.set3.en;
  const t4 = T('o4') - 0.2, e4 = term.type('PS> ', 'wsl --version', t4, 22, { promptAt: tC + 0.5 });
  term.out([hl(L1[0], '3'), [esc(L1[1]), 'd']], e4 + 0.2);
  term.gap();
  const t5 = T('o5') - 0.15, e5 = term.type('PS> ', 'wsl -l -v', t5, 22);
  term.out([[esc(V.list.header), 'd'], esc(V.list.row.slice(0, -1)) + `<span class="hi">${V.list.row.slice(-1)}</span>`,
    [tr(`  （另有 ${V.list.others} 个发行版从略，VERSION 均为 2）`, `  (${V.list.others} more omitted; VERSION is 2 for each)`), 'd']], e5 + 0.2);
  term.gap();
  const t6 = T('o6') - 0.15, e6 = term.type('PS> ', 'wsl --set-default-version 3', t6, 24);
  term.out([[`<span class="er">${esc(E3[0])}</span>`], [esc(E3[1]), 'd']], Math.max(e6 + 0.2, T('o6', { zh: '回答', en: 'cannot' }) - 0.2), 0.09, 'error');
  // 右侧：从回显里取出的两个数字
  const n3 = txt(world, 't-0 ac', '3', XC + 1420, 112), n2 = txt(world, 't-0 ink', '2', XC + 1420, 492);
  n3.dataset.name = 'big 3'; n2.dataset.name = 'big 2';
  const l3 = txt(world, 't-n dim', tr('版本号<br>的第一位', 'first digit<br>of the version'), XC + 1690, 312), l2 = txt(world, 't-n dim', tr('VERSION<br>一栏', 'the VERSION<br>column'), XC + 1690, 698);
  const t3 = T('o4', { zh: '第一位', en: 'starts' }), t2 = T('o5', { zh: '仍然', en: 'still' });
  slam(n3, t3, { from: 1.5, d: 0.4 }); sfx('thud', t3, { p: 0.5 }); show(l3, t3 + 0.25, { x: -20, y: 0, d: 0.35 });
  slam(n2, t2, { from: 1.5, d: 0.4 }); sfx('thud', t2, { p: 0.5 }); show(l2, t2 + 0.25, { x: -20, y: 0, d: 0.35 });
  const ne = txt(world, 't-2 bad', '≠', XC + 1700, 452); ne.style.fontWeight = '800';
  const tNe = T('o7', { zh: '不是', en: 'different' });
  slam(ne, tNe, { from: 1.6, d: 0.35 }); sfx('pop', tNe, { p: 0.5 });
  fromTo(n3, tNe, { y: 0 }, { y: -14, duration: 0.5, ease: 'power2.out', immediateRender: false }); fromTo(n2, tNe, { y: 0 }, { y: 14, duration: 0.5, ease: 'power2.out', immediateRender: false });
  const note = txt(world, 't-n dim', tr('实测 2026-10-06 · 3.0.2 为预发布版', 'Measured 2026-10-06 · 3.0.2 is a pre-release'), XC + 104, 912); note.style.fontSize = '30px';
  show(note, e4 + 0.5, { y: 0, x: -20, d: 0.4 });

  // ── 片名卡：盖住换站 ──
  const tT = T('oT') - 0.25, tTo = Tend('oT') - 0.2;
  const tc = h('div', 'abs', root); px(tc, 0, 0, 1920, VH); css(tc, { background: '#eef2f7', overflow: 'hidden' }); tc.dataset.name = 'title';
  blobs(tc, [['a', -260, -300, 1200], ['b', 1050, 260, 1100], ['c', 500, 520, 900]]);
  const tl1 = txt(tc, 't-2', tr('从 WSL 1 到 WSL 2，', 'From WSL 1 to WSL 2,'), 150, 196), tl2 = txt(tc, 't-1', tr('再到「WSL 3」', 'then “WSL 3”'), 138, 350);
  const bar = blk(tc, 'bg-ac', 156, 610, 520, 16);
  const tl3 = txt(tc, 't-4 dim', tr('三个数字，两种含义', 'Three numbers, two meanings'), 156, 668);
  [tl1, tl2, tl3, bar].forEach((e) => { e.dataset.overlapOk = '1'; });
  wipe(tc, tT, { dir: 'b', d: 0.45 }); sfx('whoosh', tT - 0.05, { g: 0.8 });
  slide(tl1, tT + 0.3, { y: 60, d: 0.5 }); slam(tl2, tT + 0.5, { from: 1.18, d: 0.5 }); sfx('thud', tT + 0.52);
  fromTo(bar, tT + 0.85, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.5, ease: 'power3.out' }); appear(bar, tT + 0.85);
  show(tl3, tT + 1.1, { y: 16, d: 0.45 }); sfx('pop', tT + 1.1, { g: 0.5 });
  fromTo(tl2, tT + 1.05, { scale: 1 }, { scale: 1.035, transformOrigin: '0% 60%', duration: tTo - tT - 1.05, ease: 'none', immediateRender: false });
  wipeOut(tc, tTo, { dir: 't', d: 0.45 }); sfx('whoosh', tTo, { g: 0.7 });

  // ── 站 D：方法 ──
  const A = DATA.alpine, tD = tTo + 0.1;
  const hD = txt(world, 't-3', tr('同一份根文件系统', 'One root filesystem'), XD + 120, 70);
  const file = card(world, 'ac', XD + 120, 190, 700, 270); file.dataset.name = 'alpine';
  txt(file, 'mono white', A.file.replace('-3.', '-<br>3.'), 34, 30).style.cssText += 'font-size:40px;font-weight:700;line-height:1.25;';
  txt(file, 't-n white', `Alpine Linux ${A.release} · ${bytes(A.bytes)}`, 34, 196);
  const qL = txt(world, 't-4 dim', tr('问同一个问题：内核是哪个版本', 'The same question: which kernel?'), XD + 120, 540);
  const qC = txt(world, 'num ink', 'uname -r', XD + 114, 618); qC.style.fontSize = '132px';
  wipe(hD, tD + 0.1, { dir: 'l', d: 0.4 }); slide(file, T('o8', 'Alpine') - 0.2, { x: -200, d: 0.55 }); sfx('pop', T('o8', 'Alpine') - 0.15, { p: -0.4 });
  const ovD = overlay(world);
  const rows = [['WSL 1', tr('版本 1 的发行版', 'a version 1 distribution')], ['WSL 2', tr('版本 2 的发行版', 'a version 2 distribution')], ['wslc', tr('WSL 容器', 'a WSL container')]];
  const t9 = T('o9');
  rows.forEach(([a, b], i) => {
    const y = 96 + i * 268, bx = card(world, 'dash', XD + 1010, y, 790, 214, `${i + 1} · ${a}`, b);
    const qm = txt(bx, 't-1 dim', '?', 640, 20); qm.style.fontSize = '150px';
    const ar = path(ovD, `M${XD + 830},325 C${XD + 930},325 ${XD + 900},${y + 107} ${XD + 1000},${y + 107}`, 'gray', { w: 5 });
    const ta = t9 + i * 0.22;
    arrowIn(ar, ta, 0.45); wipe(bx, ta + 0.2, { dir: 'l', d: 0.4 }); sfx('tick', ta + 0.2, { g: 0.8, p: 0.4 });
  });
  const tQq = T('o9', { zh: '问同一个', en: 'asked' });
  wipe(qL, tQq, { dir: 'l', d: 0.4 }); slam(qC, T('o9', { zh: '内核', en: 'which' }), { from: 1.25, d: 0.4 }); sfx('thud', T('o9', { zh: '内核', en: 'which' }), { p: -0.3 });

  // ── 镜头 ──
  const tAB = Tend('o2') + 0.1, tBC = Tend('o3') + 0.1;
  cam.track(s.start, CAM0, [
    [0.02, { z: 1 }, 0.9, { ease: 'power3.out', sfx: false }],
    [0.95, { z: 1.035 }, tAB - 1.0, { ease: 'none', sfx: false }],
    [tAB, { x: XB + 960, z: 1 }, 0.9],
    [tAB + 0.95, { z: 1.035 }, tBC - tAB - 1.0, { ease: 'none', sfx: false }],
    [tBC, { x: XC + 960, z: 1 }, 0.9],
    [tBC + 0.95, { z: 1.03 }, tT - tBC - 0.6, { ease: 'none', sfx: false }],
    [tT + 0.6, { x: XD + 960, z: 1.04 }, 0.02, { ease: 'none', sfx: false }],        // 片名卡盖着的时候换站
    [tTo, { z: 1 }, 0.8, { ease: 'power3.out', sfx: false }],
    [tTo + 0.85, { z: 1.035 }, s.end - tTo - 0.9, { ease: 'none', sfx: false }],
  ]);
});
