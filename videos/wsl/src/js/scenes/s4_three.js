// 第四章 「WSL 3」（2026 年的样子：Mica 底、圆角卡片、粗体）。重头在站 C：WSL 容器是怎样搭起来的。
// 站 A：2026 年的四件事；站 B：第三次提问；站 C：两台虚拟机、三个进程、一条套接字；站 D：卷走 virtiofs；站 E：网络与 compose。
scene('three', ({ root, s, c0 }) => {
  const world = h('div', 'world', root), cam = makeCamera(world, 1920, VH);
  const XB = 2100, XC = 4200, XD = 6300, XE = 8400;
  const D = DATA, Q = D.quotes, Wc = D.wslc, U = D.uname.wslc, cutU = U.indexOf('microsoft');
  blobs(world, [['a', -280, -300, 1100], ['b', 1150, 320, 1000], ['c', XB + 800, -260, 1100], ['a', XB + 1400, 400, 900], ['b', XC - 200, 300, 1000], ['c', XC + 900, -300, 1100], ['a', XC + 1300, 420, 1000],
    ['b', XD + 100, -260, 1000], ['c', XD + 1100, 380, 1000], ['a', XE + 200, -280, 1000], ['b', XE + 1200, 380, 1000]]);
  clockAt(s.start + CUT, '2026-06');

  // ── 站 A：2026 年 ──
  const y26 = txt(world, 't-0 ac', '2026', 96, 110); y26.dataset.name = '2026'; y26.style.fontSize = '350px';
  slam(y26, c0 + 0.1, { from: 0.8, d: 0.5, ease: 'back.out(1.6)' }); sfx('thud', c0 + 0.14, { g: 0.6, p: -0.4 });
  const mk = (y, hh, cls) => card(world, cls || '', 1010, y, 810, hh);
  const k1 = mk(70, 160), k2 = mk(250, 226), k3 = mk(496, 160, 'ac'), k4 = mk(676, 190);
  txt(k1, 't-4', tr('6 月 · 微软公布 WSL 容器（WSLc）', 'June · Microsoft announces WSL containers (WSLc)'), 34, 26).style.fontSize = LANG === 'zh' ? '42px' : '32px';
  txt(k1, 't-n dim', tr(`预览版 ${D.releases.preview.tag} · ${D.releases.preview.date}`, `preview ${D.releases.preview.tag} · ${D.releases.preview.date}`), 34, 96);
  Q.media.forEach((m, i) => {
    const t = m.title.length > 44 ? m.title.slice(0, 44).replace(/\s+\S*$/, '') + ' …' : m.title;
    txt(k2, 't-n', hl(t, 'WSL 3', 'm3'), 34, 24 + i * 100).style.fontWeight = '600';
    txt(k2, 't-n dim', `${m.site} · ${m.date}`, 34, 66 + i * 100).style.fontSize = '28px';
  });
  k2.querySelectorAll('.m3').forEach((e) => css(e, { background: C.bad, color: '#ffffff', padding: '0 8px', borderRadius: '6px' }));
  txt(k3, 't-4 white', `${Q.r301.date.slice(5)} · ${Q.r301.tag}`, 34, 26).style.fontFamily = '"Mono", "Sans SC"';
  txt(k3, 't-n white', esc(Q.r301.head) + `<span style="opacity:.86"> · ${Q.r301.from} → ${Q.r301.to}</span>`, 34, 96);
  txt(k4, 't-n', esc(Q.ga.title), 34, 24).style.cssText += 'font-size:34px;font-weight:700;';
  txt(k4, 't-n dim', `${Q.ga.site} · ${Q.ga.date}`, 34, 80).style.fontSize = '28px';
  txt(k4, 't-n', tr('全文里「WSL 3」出现的次数', 'occurrences of “WSL 3” in the article'), 34, 128);
  const zero = txt(k4, 'num ac', String(Q.ga.wsl3Count), 690, 76); zero.style.fontSize = '104px';
  const tk = [T('c1') + 0.1, T('c2', { zh: '报道', en: 'reports' }) - 0.2, T('c3', { zh: '9 月', en: 'September' }) - 0.1, T('c4') + 0.1];
  [k1, k2, k3, k4].forEach((k, i) => { slide(k, tk[i], { y: 70, d: 0.5 }); sfx(i === 2 ? 'thud' : 'pop', tk[i], { g: 0.7, p: 0.4 }); });
  clockAt(tk[2], Q.r301.date);
  const t0c = T('c4', { zh: '没有', en: 'never' });
  slam(zero, t0c, { from: 1.8, d: 0.35 }); sfx('chime', t0c, { g: 0.7, p: 0.4 });
  const cap26 = txt(world, 't-3', tr('官方的说法：<br>WSL 的一项新功能', 'In the official wording:<br>a new feature in WSL'), 104, 520);
  wipe(cap26, T('c4') + 0.4, { dir: 'l', d: 0.5 });
  const post = card(world, '', 104, 720, 760, 130); post.dataset.name = 'post again';
  txt(post, 't-n', `“${esc(Q.loewen.first)}”`, 28, 20).style.fontWeight = '600';
  txt(post, 't-n dim', `${esc(Q.loewen.name)} · ${Q.loewen.date}`, 28, 70).style.fontSize = '28px';
  slide(post, T('c2', { zh: '开头', en: 'prompted' }) - 0.1, { x: -160, d: 0.5 }); sfx('blip', T('c2', { zh: '开头', en: 'prompted' }), { g: 0.6, p: -0.4 });

  // ── 站 B：第三次提问 ──
  const tB = Tend('c4') + 0.1;
  const hB = txt(world, 't-3', `<span class="mono ac">wslc</span>${tr('：在 Windows 上直接运行 Linux 容器', ': Linux containers, run straight from Windows')}`, XB + 100, 40);
  if (LANG === 'en') hB.style.fontSize = '54px';
  wipe(hB, T('c5', { zh: '命令', en: 'command' }) - 0.2, { dir: 'l', d: 0.5 }); sfx('thud', T('c5', { zh: 'wslc', en: 'wslc' }), { g: 0.6, p: -0.3 });
  const term = makeTerm(world, { x: XB + 100, y: 150, w: 1330, h: 436, title: 'PowerShell', era: 'w11' });
  fromTo(term.el, tB + 0.25, { y: 90 }, { y: 0, duration: 0.6, ease: 'power3.out' }); appear(term.el, tB + 0.25);
  const imp = Wc.import, cutAt = imp.indexOf(' C:\\ftlab\\alpine');
  const t6 = T('c6') - 0.1, e6a = term.type('PS> ', esc(imp.slice(0, cutAt)), t6, 30, { promptAt: tB + 0.7, cursorUntil: t6 + cutAt / 30 });
  const l6b = term.line('<span class="p">  </span><span class="c"></span>', 's'); appear(l6b, e6a);
  const e6b = typeText(l6b.lastChild, esc(imp.slice(cutAt + 1)), e6a, 44, { cursorUntil: e6a + (imp.length - cutAt) / 44 + 0.15, sfxGain: 0.6 });
  term.out([[esc(Wc.importId), 'd']], e6b + 0.25);
  const tAsk = Math.max(e6b + 0.6, T('c6', { zh: '容器里', en: 'asked' }) - 0.3), eAsk = term.type('PS> ', esc(Wc.run), tAsk, 34);
  const tAns = Math.max(eAsk + 0.2, T('c7') - 0.05);
  term.out([[esc(U), 'big']], tAns, 0, 'chime'); term.el.querySelector('.ln.big').style.fontSize = '50px';
  slotOn(2, tAns); clockAt(tAns, '2026-10-06');
  const ans = txt(world, 'num ink', `${esc(U.slice(0, cutU))}<br>${esc(U.slice(cutU, -4))}<span class="k">WSL2</span>`, XB + 104, 626); css(ans, { fontSize: '96px', lineHeight: '1.14' }); ans.dataset.name = 'answer 3';
  wipe(ans, tAns + 0.2, { dir: 'l', d: 0.55 });
  const k = ans.querySelector('.k'), tW = T('c7', { zh: '仍然', en: 'still' });
  F((t) => { const on = t >= tW; k.style.background = on ? C.ac : 'transparent'; k.style.color = on ? '#ffffff' : ''; });
  sfx('blip', tW, { p: 0.2 });
  const runs = [[tr('第一次 · WSL 1', 'First · WSL 1'), D.uname.wsl1, ''], [tr('第二次 · WSL 2', 'Second · WSL 2'), '6.18.40.1-…-WSL2', ''], [tr('第三次 · wslc', 'Third · wslc'), '6.18.40.1-…-WSL2', 'ac']];
  const rc = runs.map(([a, b, cls], i) => { const e = card(world, cls, XB + 1480, 150 + i * 196, 370, 176, a, ''); e.querySelector('.sub').innerHTML = `<span class="mono" style="font-size:26px">${esc(b)}</span>`; return e; });
  rc.forEach((e, i) => { slide(e, i < 2 ? tB + 0.5 + i * 0.12 : tAns + 0.3, { x: 200, d: 0.5 }); });
  sfx('pop', tAns + 0.3, { p: 0.5 });
  const same = h('div', 'stamp good', world, tr('与第二次逐字相同', 'identical to the second')); px(same, XB + 1480, 746); same.style.fontSize = LANG === 'zh' ? '36px' : '30px';
  const tS = T('c8', { zh: '逐字', en: 'Identical' });
  slam(same, tS, { from: 1.6, d: 0.3 }); sfx('chime', tS, { g: 0.7, p: 0.5 });
  const samen = txt(world, 't-n dim', tr('容器里与版本 2 发行版里，/proc/version 整行一致', 'In the container and in the version 2 distribution, /proc/version matches in full'), XB + 104, 870);
  show(samen, T('c8', { zh: '内核', en: 'kernel' }), { x: -20, y: 0, d: 0.35 });

  // ── 站 C：它是怎样搭起来的 ──
  const tC = Tend('c8') + 0.1;
  const ov = overlay(world);
  // Windows 一侧的三个进程
  const pCli = card(world, 'line', XC + 80, 64, 430, 130, 'wslc.exe', tr('命令行', 'command line'));
  const pSvc = card(world, '', XC + 80, 300, 430, 160, 'wslservice.exe', tr('系统服务 · SYSTEM', 'system service · SYSTEM')); css(pSvc, { background: '#1b1b1b', color: '#ffffff' });
  const pSes = card(world, 'ac', XC + 80, 590, 430, 170, 'wslcsession.exe', tr('以当前用户身份运行', 'runs as the current user'));
  [pCli, pSvc, pSes].forEach((e) => { e.querySelector('.lab').style.fontFamily = '"Mono"'; e.querySelector('.lab').style.fontSize = '36px'; });
  // 两台虚拟机
  const vmA = card(world, 'dash', XC + 640, 64, 600, 234); vmA.dataset.name = 'distributions';
  txt(vmA, 't-n', tr('发行版（容器运行期间）', 'distributions (while the container runs)'), 26, 18).style.fontWeight = '600';
  const drows = ['ft-wsl1', 'ft-wsl2'].map((n, i) => txt(vmA, 'mono', `${n}   ${Wc.distroStateWhileRunning[i]}`, 26, 80 + i * 54)); drows.forEach((e) => { e.style.fontSize = '34px'; e.style.color = '#5c5c5c'; });
  const notHere = h('div', 'stamp', world, tr('不在这里', 'not here')); px(notHere, XC + (LANG === 'zh' ? 990 : 980), 184); notHere.style.fontSize = '34px';
  const vmB = card(world, 'line', XC + 640, 372, 1200, 528); vmB.dataset.name = 'session vm';
  const vmBl = txt(world, 't-4', tr('另一台虚拟机', 'Another virtual machine'), XC + 672, 388);
  const kern = card(world, 'ac', XC + 676, 778, 1128, 96); const kl = txt(kern, 'mono white', esc(U), 30, 20); css(kl, { fontSize: '40px', fontWeight: '700' });
  const kn = txt(kern, 't-n white', tr('内核', 'kernel'), 990, 26);
  const t9 = T('c9'), t9b = T('c9', { zh: '另一台', en: 'another' });
  slide(pCli, tC + 0.3, { x: -200, d: 0.5 }); wipe(vmA, t9 - 0.1, { dir: 'l', d: 0.45 }); sfx('pop', t9 - 0.1, { g: 0.6, p: 0.2 });
  slam(notHere, T('c9', { zh: '不在', en: 'no dist' }), { from: 1.6, d: 0.3 }); sfx('error', T('c9', { zh: '不在', en: 'no dist' }), { g: 0.5, p: 0.2 });
  wipe(vmB, t9b - 0.15, { dir: 't', d: 0.5 }); wipe(vmBl, t9b, { dir: 'l', d: 0.35 }); slide(kern, t9b + 0.2, { y: 60, d: 0.5 }); sfx('thud', t9b, { p: 0.3 });
  // 服务创建虚拟机，交给会话进程
  const a1 = path(ov, `M${XC + 295},198 L${XC + 295},292`, 'ink', { w: 5 });
  const a2 = path(ov, `M${XC + 514},380 C${XC + 580},380 ${XC + 570},470 ${XC + 632},470`, 'ink', { w: 5 });
  const a3 = path(ov, `M${XC + 295},464 L${XC + 295},582`, 'ink', { w: 5 });
  const hcs = h('div', 'chip', world, D.src.hcs.call); px(hcs, XC + 300, 472 - 124); css(hcs, { fontSize: '24px', left: (XC + 524) + 'px', top: '312px' });
  const give = txt(world, 't-n dim', tr('交给', 'hands over'), XC + 314, 506);
  const t10 = T('c10', { zh: 'wslservice', en: 'wslservice' }), t10b = T('c10', { zh: '创建', en: 'creates' }), t11 = T('c11', { zh: 'wslcsession', en: 'wslcsession' });
  arrowIn(a1, t10 - 0.35, 0.35); slide(pSvc, t10 - 0.1, { x: -200, d: 0.5 }); sfx('thud', t10, { g: 0.7, p: -0.5 });
  arrowIn(a2, t10b - 0.1, 0.45); slam(hcs, t10b + 0.1, { from: 1.4, d: 0.3 }); sfx('whoosh', t10b - 0.1, { g: 0.5 });
  arrowIn(a3, t11 - 0.4, 0.4); show(give, t11 - 0.2, { x: -14, y: 0, d: 0.3 }); slide(pSes, t11 - 0.1, { x: -200, d: 0.5 }); sfx('thud', t11, { g: 0.7, p: -0.5 });
  const own = path(ov, `M${XC + 514},676 L${XC + 632},676`, 'ac', { w: 7 });
  arrowIn(own, T('c11', { zh: '当前用户', en: 'as the user' }), 0.4); sfx('pop', T('c11', { zh: '当前用户', en: 'as the user' }), { g: 0.6, p: -0.3 });
  // 会话与存储盘
  const t12 = T('c12', { zh: '会话', en: 'session' });
  keyed(vmBl).at(t12, { html: tr('另一台虚拟机 = 一个<span class="ac">会话</span>', 'Another virtual machine = a <span class="ac">session</span>') }); sfx('blip', t12, { g: 0.7 });
  const disk = card(world, '', XC + 1490, 460, 314, 290, 'storage.vhdx', `${mb(Wc.storageVhdx)}<br>/var/lib/docker`); disk.querySelector('.lab').style.fontFamily = '"Mono"'; disk.querySelector('.lab').style.fontSize = '34px';
  slide(disk, T('c12', { zh: '存储盘', en: 'storage' }) - 0.1, { y: 80, d: 0.5 }); sfx('pop', T('c12', { zh: '存储盘', en: 'storage' }), { p: 0.6 });
  // 虚拟机里面：containerd 与 dockerd，容器先占位
  const dk = card(world, '', XC + 676, 460, 350, 138, 'dockerd', Wc.dockerd), cd = card(world, '', XC + 676, 616, 350, 138, 'containerd', Wc.containerd);
  [dk, cd].forEach((e) => { e.querySelector('.lab').style.fontFamily = '"Mono"'; css(e, { background: '#1b1b1b', color: '#ffffff' }); });
  const ctrGhost = card(world, 'dash', XC + 1066, 460, 386, 294), ctr = card(world, 'ac', XC + 1066, 460, 386, 294, tr('容器', 'container'), 'ft-alpine:3.24.2<br>sleep 3600');
  ctr.querySelector('.sub').style.fontFamily = '"Mono"'; ctr.querySelector('.sub').style.fontSize = '28px';
  const t13c = T('c13', { zh: 'containerd', en: 'containerd' }), t13d = T('c13', { zh: 'dockerd', en: 'dockerd' });
  slide(cd, t13c, { x: -120, d: 0.45 }); sfx('pop', t13c, { g: 0.7 }); slide(dk, t13d, { x: -120, d: 0.45 }); sfx('pop', t13d, { g: 0.8 });
  wipe(ctrGhost, T('c13') + 0.2, { dir: 'l', d: 0.4 });
  // 一条套接字：两条请求过去，容器填实
  const t14 = T('c14'), t14s = T('c14', { zh: '套接字', en: 'socket' }), t14h = Math.min(T('c14', { zh: 'HTTP', en: 'using' }), Tend('c14') - 1.45);      // 两条请求与容器填实都要落在这一句之内
  const sockP = path(ov, `M${XC + 514},720 C${XC + 600},720 ${XC + 590},530 ${XC + 668},530`, 'bad', { w: 7, arrow: false });
  sockP.setAttribute('stroke-linecap', 'butt');                  // 圆头线帽在零长度时会露出一个点
  const sockL = txt(world, 't-n', 'hvsocket → ' + D.src.docker.sock, XC + 80, 790); css(sockL, { fontFamily: '"Mono"', fontSize: '28px', color: C.bad, fontWeight: '700' });
  draw(sockP, t14s - 0.2, 0.5); hideUntil(sockP, t14s - 0.2); show(sockL, t14s, { x: -14, y: 0, d: 0.3 }); sfx('whoosh', t14s - 0.2, { g: 0.5, p: -0.3 });
  D.src.docker.calls.forEach((c, i) => {
    const m = h('div', 'chip', world, c); css(m, { fontSize: '24px', background: C.bad }); px(m, XC + 80, 836 + i * 56);
    const ta = t14h + i * 0.55;
    slide(m, ta, { x: -160, d: 0.4, ease: 'power3.out' }); sfx('tick', ta, { g: 0.9, p: -0.4 });
    // 一个点沿套接字走过去：请求到了 dockerd
    const dot = svg('circle', { r: 13, fill: C.bad }, ov), len = sockP.getTotalLength();
    F((t) => { const k = (t - ta - 0.15) / 0.5; dot.style.visibility = k > 0 && k < 1 ? 'visible' : 'hidden'; if (k > 0 && k < 1) { const pt = sockP.getPointAtLength(len * ease.io3(k)); dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); } });
  });
  const tRun = t14h + 1.25;
  vanish(ctrGhost, tRun); slam(ctr, tRun, { from: 0.8, d: 0.4, ease: 'back.out(1.8)' }); sfx('chime', tRun, { g: 0.7, p: 0.3 });
  const srcN = txt(world, 't-n dim', tr(`依据：实测进程表与 ${D.src.docker.file}（标签 ${D.src.tag}）`, `From the measured process list and ${D.src.docker.file} (tag ${D.src.tag})`), XC + 644, 912); srcN.style.fontSize = '26px';
  show(srcN, t14 + 0.3, { x: -14, y: 0, d: 0.3 });

  // ── 站 D：卷 ──
  const tD = Tend('c14') + 0.1;
  const hD = txt(world, 't-2', tr('挂进容器的目录', 'Folders mounted into a container'), XD + 96, 40); if (LANG === 'en') hD.style.fontSize = '80px';
  wipe(hD, T('c15') - 0.1, { dir: 'l', d: 0.5 });
  const wf = card(world, '', XD + 104, 210, 520, 190, 'C:\\ftlab\\share', tr('Windows 的目录', 'a Windows folder')); wf.querySelector('.lab').style.fontFamily = '"Mono"';
  const cf = card(world, 'ac', XD + 1240, 210, 520, 190, '/data', tr('容器里看到的', 'as seen in the container')); cf.querySelector('.lab').style.fontFamily = '"Mono"';
  const ovD = overlay(world), pipeD = path(ovD, `M${XD + 632},305 L${XD + 1230},305`, 'ink', { w: 8 });
  const no9 = h('div', 'chip', world, '9P'); px(no9, XD + 760, 196); css(no9, { background: '#5c5c5c' });
  const st9 = path(ovD, `M${XD + 748},258 L${XD + 846},198`, 'bad', { w: 8, arrow: false });
  st9.setAttribute('stroke-linecap', 'butt');
  const vfs = h('div', 'chip ac', world, 'virtiofs'); px(vfs, XD + 900, 190); vfs.style.fontSize = '46px';
  slide(wf, tD + 0.3, { x: -160, d: 0.5 }); slide(cf, tD + 0.42, { x: 160, d: 0.5 }); arrowIn(pipeD, T('c15', { zh: '挂进', en: 'mounted' }), 0.5); sfx('pop', tD + 0.35, { g: 0.6 });
  const t15n = T('c15', { zh: '不再', en: 'not 9P' }), t15v = T('c15', { zh: 'virtiofs', en: 'virtiofs' });
  slam(no9, t15n - 0.2, { from: 1.4, d: 0.28 }); draw(st9, t15n + 0.1, 0.25); hideUntil(st9, t15n + 0.1); sfx('error', t15n + 0.1, { g: 0.5 });
  slam(vfs, t15v, { from: 1.6, d: 0.35 }); sfx('thud', t15v);
  const termD = makeTerm(world, { x: XD + 104, y: 470, w: 1330, h: 300, title: 'PowerShell', era: 'w11' });
  fromTo(termD.el, tD + 0.5, { y: 90 }, { y: 0, duration: 0.6, ease: 'power3.out' }); appear(termD.el, tD + 0.5);
  const vc = Wc.volume.cmd, vcut = vc.indexOf(' ft-alpine');
  const tv = T('c15') + 0.3, ev1 = termD.type('PS> ', esc(vc.slice(0, vcut)), tv, 44, { promptAt: tD + 0.9, cursorUntil: tv + vcut / 44 });
  termD.el.querySelector('.ln').classList.add('s');
  const lv2 = termD.line('<span class="p">      </span><span class="c"></span>', 's'); appear(lv2, ev1);
  const ev2 = typeText(lv2.lastChild, esc(vc.slice(vcut + 1)), ev1, 46, { cursorUntil: ev1 + (vc.length - vcut) / 46 + 0.15, sfxGain: 0.6 });
  termD.out([hl(Wc.volume.mount, 'virtiofs', 'hb')], Math.max(ev2 + 0.2, t15v - 0.1), 0, 'blip');
  const twice = h('div', 'stamp good', world, tr('约快一倍', 'about twice as fast')); px(twice, XD + 1470, 500); if (LANG === 'en') twice.style.fontSize = '34px';
  const twn = txt(world, 't-n dim', tr('官方的说法：<br>与 plan9 相比', 'the official account:<br>compared to plan9'), XD + 1484, 590);
  const t16 = T('c16', { zh: '快一倍', en: 'twice' });
  slam(twice, t16, { from: 1.5, d: 0.3 }); show(twn, t16 + 0.25, { y: 0, x: 20, d: 0.3 }); sfx('chime', t16, { g: 0.6, p: 0.5 });
  const dn = txt(world, 't-n dim', tr(`对照：版本 2 的发行版里，/mnt/c 仍是 ${D.storage.wsl2.c}`, `For comparison: in a version 2 distribution, /mnt/c is still ${D.storage.wsl2.c}`), XD + 104, 800);
  show(dn, t15v + 0.6, { x: -14, y: 0, d: 0.3 });

  // ── 站 E：网络与 compose ──
  const tE = Tend('c16') + 0.1;
  const hE = txt(world, 't-2', tr('网络也换了', 'Networking changed too'), XE + 96, 40);
  wipe(hE, T('c17') - 0.1, { dir: 'l', d: 0.5 });
  const nv = card(world, 'line', XE + 104, 220, 470, 250, tr('虚拟机', 'virtual machine'), tr('发出以太网帧', 'sends Ethernet frames'));
  const nq = h('div', 'chip', world, tr('virtio 队列', 'virtio queue')); px(nq, XE + 660, 316); nq.style.fontFamily = '"Mono", "Sans SC"';
  const np = card(world, 'ac', XE + 1010, 220, 780, 250, tr('Windows 一侧的进程', 'a process on the Windows side'), tr('以用户身份运行', 'running as the user'));
  const ovE = overlay(world), n1 = path(ovE, `M${XE + 582},345 L${XE + 652},345`, 'ink', { w: 7 }), n2 = path(ovE, `M${XE + 930},345 L${XE + 1000},345`, 'ink', { w: 7 });
  slide(nv, tE + 0.3, { x: -160, d: 0.5 }); sfx('pop', tE + 0.3, { g: 0.6, p: -0.5 });
  const t17f = T('c17', { zh: '以太网帧', en: 'Ethernet' }), t17w = T('c17', { zh: 'Windows', en: 'Windows' });
  arrowIn(n1, t17f, 0.3); slam(nq, t17f + 0.15, { from: 1.4, d: 0.3 }); sfx('tick', t17f + 0.15, { g: 0.9 });
  arrowIn(n2, t17w - 0.2, 0.3); slide(np, t17w, { x: 160, d: 0.5 }); sfx('thud', t17w + 0.1, { g: 0.7, p: 0.5 });
  [tr('DNS', 'DNS'), tr('路由', 'routing'), tr('端口映射', 'port mapping')].forEach((n, i) => {
    const c = h('div', 'chip lite', world, n); px(c, XE + 1010 + [0, 190, 380][i] * (LANG === 'zh' ? 1 : 1.12), 500); c.style.fontFamily = '"Inter", "Sans SC"';
    const ta = T('c18', { zh: '转发', en: 'forwards' }) - 0.3 + i * 0.16;
    slam(c, ta, { from: 1.4, d: 0.28 }); sfx('pop', ta, { g: 0.6, p: 0.5 });
  });
  const pe = txt(world, 't-n dim', tr(`实测：${Wc.port}，从 Windows 连 localhost 读到容器里的 ${Wc.portReply}`, `Measured: ${Wc.port}; from Windows, localhost returned ${Wc.portReply} from the container`), XE + 104, 590);
  show(pe, T('c18', { zh: '转发', en: 'forwards' }) + 0.4, { x: -14, y: 0, d: 0.3 });
  const cp = card(world, 'dash', XE + 104, 690, 760, 170, 'wslc compose', tr('官方：下一步的重点', 'officially: the next priority')); cp.querySelector('.lab').style.fontFamily = '"Mono"';
  const cps = h('div', 'stamp', world, tr('目前没有', 'not yet')); px(cps, XE + (LANG === 'zh' ? 610 : 660), 716);
  const t19 = T('c19');
  wipe(cp, t19, { dir: 'l', d: 0.45 }); slam(cps, T('c19', { zh: '没有', en: 'No compose' }) + 0.2, { from: 1.6, d: 0.3 }); sfx('error', T('c19', { zh: '没有', en: 'No compose' }) + 0.2, { g: 0.5 });

  // ── 镜头 ──
  cam.track(s.start, { x: 960, y: 484, z: 1.04 }, [
    [c0, { z: 1 }, 0.8, { ease: 'power3.out', sfx: false }],
    [c0 + 0.85, { z: 1.03 }, tB - c0 - 0.9, { ease: 'none', sfx: false }],
    [tB, { x: XB + 975, z: 1 }, 0.9],
    [tB + 0.95, { z: 1.03 }, tC - tB - 1.0, { ease: 'none', sfx: false }],
    [tC, { x: XC + 960, z: 1 }, 0.9],
    [tC + 0.95, { z: 1.02 }, t10 - tC - 1.4, { ease: 'none', sfx: false }],
    [t10 - 0.4, { x: XC + 720, y: 440, z: 1.18 }, 1.0, { g: 0.4 }],                 // 推近：三个进程与虚拟机的边
    [t10 + 0.65, { z: 1.2 }, t12 - t10 - 1.1, { ease: 'none', sfx: false }],
    [t12 - 0.4, { x: XC + 1180, y: 600, z: 1.2 }, 1.0, { g: 0.4 }],                 // 移到虚拟机内部
    [t12 + 0.65, { z: 1.23 }, t14 - t12 - 1.1, { ease: 'none', sfx: false }],
    [t14 - 0.4, { x: XC + 960, y: 484, z: 1 }, 0.9, { g: 0.4 }],                    // 拉回全景：看请求从会话进程过去
    [t14 + 0.55, { z: 1.02 }, tD - t14 - 0.6, { ease: 'none', sfx: false }],
    [tD, { x: XD + 960, z: 1 }, 0.9],
    [tD + 0.95, { z: 1.03 }, tE - tD - 1.0, { ease: 'none', sfx: false }],
    [tE, { x: XE + 960, z: 1 }, 0.9],
    [tE + 0.95, { z: 1.03 }, s.end - tE - 1.0, { ease: 'none', sfx: false }],
  ]);
});
