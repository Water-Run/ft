// 原来如此：编号属于仓库。Issue 与 PR 共用一套编号，按先后排、用过不回收；Closes #12 让 #12 在合并时自动关闭，只写 #12 不会。
// 主画面：C 的编号簿——「WaterRun / 活动报名」的 #1–#13 排成一行，#13 由 PR 标题里的那个号飞进来。编号簿是示意，规律依据 FACTS F6（实测）。
scene('numbers', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);

  // ── PR 标题：与上一场同一位置 ──
  const title = el(world, '', `<span>年龄判断改成大于等于</span> <span class="k num" style="font-weight:300">#13</span>`, 120, 128);
  css(title, { fontSize: '52px', fontWeight: 600 });
  const num = title.querySelector('.num');
  markOn(world, box(num, world), Q(T('c1', '13号')) - 0.1, T('c1', '为什么') + 0.6, 6);
  sfx('tick', Q(T('c1', '13号')) - 0.1, { g: 0.7 });

  // ── 编号簿 ──
  const lab = el(world, 'row', `${repoName('WaterRun', '活动报名', { size: 30, pub: false })}<span class="k" style="font-size:28px">的编号</span>`, 120, 228);
  css(lab, { gap: '14px' });
  const KIND = ['i', 'p', 'i', 'p', 'p', 'i', null, 'p', 'i', 'p', 'i', 'i', 'p'];
  const TX = (i) => 120 + i * 116, TY = 290;
  const tiles = KIND.map((k, i) => {
    const n = i + 1, icon = k === 'p' ? 'git-pull-request' : 'issue-opened';
    const e = el(world, 'tile' + (k ? '' : ' void'), k ? `<span class="ic" style="position:relative;width:36px;height:36px">${oct(icon, 36, C.muted)}<span class="col" style="position:absolute;left:0;top:0">${oct(icon, 36, k === 'p' ? C.done : C.success)}</span></span><span class="n">#${n}</span>`
      : `<span style="font-size:24px;color:var(--muted)">空号</span><span class="n k">#${n}</span>`, TX(i), TY);
    const col = e.querySelector('.col'); if (col) vanish(col, 0);
    return e;
  });
  const next = el(world, 'tile void', `<span style="font-size:24px;color:var(--muted)">下一个</span><span class="n k">#14</span>`, TX(13), TY);
  // c1「为什么不是 #1」：#1–#12 从左往右排开，#13 从标题飞进最后一格
  const tRow = Q(T('c1', '为什么')) - 0.25;
  fadeIn(lab, tRow - 0.2, { y: 10 });
  tiles.slice(0, 12).forEach((e, i) => { fromTo(e, tRow + i * 0.06, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out' }); if (i % 3 === 0) sfx('tick', tRow + i * 0.06, { g: 0.55, p: -0.6 + i * 0.1 }); });
  const t13 = tiles[12], a = box(t13, world), b = box(num, world);
  t13.style.transformOrigin = '0 0';
  fromTo(t13, tRow + 0.5, { x: b.x - a.x, y: b.y - a.y, scale: b.h / a.h }, { x: 0, y: 0, scale: 1, duration: 0.8, ease: 'power3.inOut' });
  fromTo(t13, tRow + 0.5, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
  css(t13, { borderColor: C.done, borderWidth: '4px' });
  sfx('whoosh', tRow + 0.5, { g: 0.5 }); sfx('thud', tRow + 1.25, { g: 0.6 });
  fadeIn(next, tRow + 0.9, { y: 16 });
  markOn(world, box(tiles[0], world), Q(T('c1', '1号')), T('c2') - 0.1, 6);
  fadeOut(title, T('c2') - 0.4, { y: -12 });

  // ── c2 Issue：#12 摊开成一张 Issue 卡 ──
  const iss = el(world, 'box', `<div class="boxh"><span class="row" style="position:relative;width:30px;height:30px">${oct('issue-opened', 30, C.success)}<span class="icx" style="position:absolute;left:0;top:0">${oct('issue-closed', 30, C.done)}</span></span>
      <b>刚满 18 岁报不上名</b><span class="k">#12</span>
      <span class="ist" style="margin-left:auto;position:relative;display:inline-flex">${st('open', 'issue-opened', 'Open', 24)}</span></div>
      <div class="row" style="gap:16px;padding:18px 24px;font-size:28px">${av('路人甲', 48)}<span><b>路人甲</b>：18 岁点报名，提示「未满 18 岁」</span></div>`, 1000, 520, 800);
  const icx = iss.querySelector('.icx'), ist = iss.querySelector('.ist');
  const closedP = h('span', '', ist, st('merged', 'issue-closed', 'Closed', 24)); css(closedP, { position: 'absolute', right: 0, top: 0 });
  vanish(icx, 0); vanish(closedP, 0);
  const t12 = box(tiles[11], world);
  const ov = overlay(world);
  const link = path(ov, `M${t12.cx},${t12.b + 6} V514`, 'success', { w: 4, arrow: false });
  const tIss = Q(T('c2', 'Issue')) - 0.25;
  draw(link, tIss, 0.3); fadeIn(iss, tIss + 0.15, { y: -16 }); sfx('blip', tIss + 0.15, { g: 0.6 });
  const gIss = gloss(world, '<b>Issue</b>：记下一个要解决的问题，谁报的、出了什么事', 1000, 688, 'up', 'Issue');
  gIss.style.left = Math.min(1000, 1800 - gIss.offsetWidth) + 'px';
  fadeIn(gIss, Q(T('c2', '记下')), { y: 10 }); sfx('tick', Q(T('c2', '记下')), { g: 0.6 });

  // ── c3 共用一套编号：图标上色，#12 与 #13 挨着 ──
  const tCol = Q(T('c3', '共用')) - 0.1;
  tiles.forEach((e, i) => { const col = e.querySelector('.col'); if (col) fromTo(col, tCol + i * 0.04, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }); });
  sfx('pop', tCol, { g: 0.6 });
  const legend = el(world, 'row', `<span class="row" style="gap:10px">${oct('issue-opened', 28, C.success)}Issue</span><span class="row" style="gap:10px">${oct('git-pull-request', 28, C.done)}Pull Request</span>`, 120, 462);
  css(legend, { gap: '36px', fontSize: '28px', color: C.muted });
  fadeIn(legend, tCol + 0.2, { y: 10 });
  const tIt = Q(T('c3', '12号')) - 0.1;
  markOn(world, box(tiles[11], world), tIt, Tend('c4') - 0.2, 6);
  markOn(world, box(iss, world), tIt + 0.1, Tend('c3') + 0.3, 4);
  fadeOut(gIss, T('c3') + 0.1);
  sfx('tick', tIt, { g: 0.7 });

  // ── c4 编号属于仓库，按先后排，用过不回收 ──
  const tSeq = Q(T('c4', '先后')) - 0.2;
  tiles.forEach((e, i) => fromTo(e, tSeq + i * 0.07, { y: 0 }, { keyframes: [{ y: -12, duration: 0.12, ease: 'power2.out' }, { y: 0, duration: 0.2, ease: 'power2.in' }], immediateRender: false }));
  for (let i = 0; i < 13; i += 3) sfx('tick', tSeq + i * 0.07, { g: 0.5, p: -0.6 + i * 0.1 });
  const tGap = Q(T('c4', '不回收')) - 0.15;
  markOn(world, box(tiles[6], world), tGap, Tend('c4') + 1.2, 6);
  const gGap = gloss(world, '#7 删掉了：号空着，不再分配', TX(6) - 4, TY + 168, 'up');
  fadeIn(gGap, tGap + 0.1, { y: 10 }); sfx('pop', tGap, { g: 0.6 });
  fadeOut(gGap, T('c5') + 0.6);
  hudState(Q(T('c4', '属于')), `<div class="meter-n"><div style="font-size:24px;color:var(--muted)">仓库的下一个号</div><div class="mono" style="font-size:40px;font-weight:700">#14</div></div>`);

  // ── c5 Closes #12：合并时 #12 自动关闭 ──
  const pr = el(world, 'box', `<div class="boxh">${oct('git-merge', 28, C.done)}<b>#13 的说明</b></div>
      <div style="padding:18px 24px;font-size:28px">修好刚满 18 岁报不上名。<span class="mono kw" style="color:var(--accent)">Closes #12</span></div>`, 120, 520, 820);
  const kw = pr.querySelector('.kw');
  const tPr = Q(T('c5')) - 0.2;
  fadeIn(pr, tPr, { y: 16 }); sfx('blip', tPr, { g: 0.6, p: -0.5 });
  markOn(world, box(kw, world), Q(T('c5', 'Closes')) - 0.1, Tend('c5') + 0.2, 4);
  const kwb = box(kw, world), ib = box(iss, world);
  const arr = path(ov, `M${kwb.r + 14},${kwb.cy} H${ib.x - 12}`, 'done', { w: 4 });
  const tClose = Q(T('c5', '合并时')) - 0.1;
  arrowIn(arr, tClose - 0.3, 0.4);
  swapFade(ist.firstChild, closedP, tClose + 0.1, 0.3);
  fromTo(icx, tClose + 0.1, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
  // 编号簿上的 #12 也换成「已关闭」
  const t12ic = h('span', '', tiles[11].querySelector('.ic'), oct('issue-closed', 36, C.done)); css(t12ic, { position: 'absolute', left: 0, top: 0, background: '#ffffff' });
  fromTo(t12ic, tClose + 0.1, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
  sfx('chime', tClose + 0.15, { g: 0.7 });
  fromTo(arr, T('c6') - 0.2, { autoAlpha: 1 }, { autoAlpha: 0.3, duration: 0.4, immediateRender: false });

  // ── c6 只写 #12：只是提一下，不会关 ──
  const ref = el(world, 'box', `<div class="boxh">${oct('git-pull-request', 28, C.muted)}<b>如果 #13 的说明只写</b></div>
      <div class="row" style="padding:18px 24px;font-size:28px;gap:18px"><span>修好刚满 18 岁报不上名。<span class="mono" style="color:var(--accent)">#12</span></span>
        <span class="row" style="margin-left:auto;gap:10px;font-size:26px;color:var(--success)">${oct('issue-opened', 26, C.success)}合并后 #12 仍是 Open</span></div>`, 120, 712, 820);
  const tRef = Q(T('c6')) - 0.2;
  fadeIn(ref, tRef, { y: 16 }); sfx('blip', tRef, { g: 0.6, p: -0.5 });
  const gRef = gloss(world, '写成 <span class="mono">Refs #12</span> 也一样：Refs 不是关闭用的词', 140, 872, 'up');
  fadeIn(gRef, Q(T('c6', '提一下')), { y: 10 }); sfx('tick', Q(T('c6', '提一下')), { g: 0.6 });

  const hold = s.end - s.start, dx = Math.min(30, 1.3 * hold);
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [[s.start + 0.05, { x: 960 + dx }, hold, { ease: 'none', sfx: false }]]);
});
