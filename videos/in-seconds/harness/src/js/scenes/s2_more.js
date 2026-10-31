// Harness 还管着的几件事，左边始终是同一块「模型」：
// 一、上下文：模型不记事，每一圈整段重发，五圈从 2 条涨到 11 条（E8、D5）→ 二、再长下去，旧的部分压成摘要（D6）
// → 三、边界：只许碰项目里的文件（E10、D7）→ 四、同一个模型换五套 Harness，得分不同（2026-10 的论文，D10）。
scene('more', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const hold = s.end - s.start - 0.2, dx = 16;
  const cam = makeCamera(world, 1920, VH);
  cam.track(s.start, { x: 960 - dx / 2, y: 484, z: 1 }, [[s.start + 0.1, { x: 960 + dx / 2 }, hold, { ease: 'none', sfx: false }]]);
  const R0 = D.rounds;
  const KIND = (role) => (role === 'tool' ? 'tool' : role === 'assistant' ? 'call' : 'say');
  const cellCls = (k) => (k === 'call' ? 'bg-ac' : k === 'tool' ? 'bg-paper' : '');
  const outline = (b) => css(b, { border: '3px solid var(--paper)', boxSizing: 'border-box' });
  const tA1 = Q(T('m3') - 0.4), tB = tA1 + 0.25, tB1 = Q(T('m4', '边界') - 0.9), tC = tB1 + 0.25, tC1 = Q(T('m5') + 0.2), tD = tC1 + 0.25;

  // ── 左：同一块「模型」，四部分都在；到第四部分换成论文里的那个模型 ──
  const model = blk(world, 'bg-paper', 110, 300, 380, 300); model.dataset.name = tr('模型', 'model');
  const mT = centered(model, 'ink', tr('模型', 'Model'), 190, 54, 380); mT.style.font = '900 96px "Sans SC"';
  const mS = centered(model, 'ink', tr('不记事', 'no memory'), 190, 180, 380); mS.style.font = '700 40px "Sans SC"';
  wipe(model, c0 + 0.05, { dir: 'l', d: 0.45 });
  sfx('thud', Q(T('m1', '不记事')), { g: 0.5 }); slam(mS, Q(T('m1', '不记事')) - 0.1, { from: 1.4, d: 0.4 });
  keyed(mS).at(tD + 0.1, { html: tr('同一个模型', 'same model') });
  keyed(mT).at(T('m6b', 'Claude') - 0.15, { html: 'Claude Opus 5' });
  F((t) => { const v = t >= T('m6b', 'Claude') - 0.15 ? '900 50px Inter' : '900 96px "Sans SC"'; if (mT.style.font !== v) mT.style.font = v; });
  sfx('pop', T('m6b', 'Claude') - 0.15, { g: 0.6 });

  // ── 一、上下文：五圈、五摞（m1–m2） ──
  const ga = h('div', 'abs', world); px(ga, 0, 0, 1920, 968);
  const headA = txt(ga, 'paper', `${tr('上下文', 'Context')} <span class="en ac">Context</span>　${tr('每一圈整段重发', 'resent in full every lap')}`, 640, 140); headA.style.font = '700 40px "Sans SC"';
  wipe(headA, c0 + 0.15, { dir: 'l', d: 0.4 });
  const leg = [['bg-ac', tr('工具调用', 'tool call')], ['bg-paper', tr('结果', 'result')], ['', tr('说明、你', 'system, you')]];
  leg.forEach(([cls, nm], i) => {
    const sw = blk(ga, cls, 640 + i * 230, 212, 28, 28); if (!cls) outline(sw);
    const l = txt(ga, 'paper', nm, 680 + i * 230, 206); l.style.font = '500 30px "Sans SC"';
    wipe(sw, c0 + 0.3 + i * 0.08, { dir: 'l', d: 0.3 }); wipe(l, c0 + 0.34 + i * 0.08, { dir: 'l', d: 0.3 });
  });
  const tStack = (i) => (i === 0 ? c0 + 0.45 : T('m1', '每一圈') + (i - 1) * 0.7);
  const tops = [];
  R0.forEach((r, i) => {
    const x = 640 + i * 240, rowH = 44, bottom = 770;
    r.roles.forEach((role, j) => {
      const k = KIND(role), b = blk(ga, cellCls(k), x, bottom - (j + 1) * rowH, 170, rowH - 8);
      if (k === 'say') outline(b);
      b.dataset.name = k;
      wipe(b, tStack(i) + j * 0.03, { dir: 'b', d: 0.25 });
    });
    tops.push([x, bottom - r.sent * rowH - 26], [x + 170, bottom - r.sent * rowH - 26]);   // 沿每摞的顶上走，斜线只落在两摞之间的空隙里
    const a = txt(ga, 'paper', tr(`第 ${r.n} 圈`, `Lap ${r.n}`), x, 786); a.style.font = '700 30px "Sans SC"';
    const b = txt(ga, 'paper', tr(`${r.sent} 条`, `${r.sent} msgs`), x, 826); b.style.font = '800 34px "Sans SC"';
    const c = txt(ga, 'dim', `${r.tokens} tokens`, x, 874); c.style.font = '600 26px Mono';
    wipe(a, tStack(i), { dir: 'l', d: 0.3 }); wipe(b, tStack(i) + 0.05, { dir: 'l', d: 0.3 }); wipe(c, tStack(i) + 0.1, { dir: 'l', d: 0.3 });
    if (i === 0) { classAt(b, 'hl', T('m2', '2') - 0.1, tA1); sfx('tick', T('m2', '2') - 0.1, { g: 0.7, p: -0.4 }); }
    if (i === 4) { classAt(b, 'hl', T('m2', '11') - 0.1, tA1); sfx('tick', T('m2', '11') - 0.1, { g: 0.7, p: 0.5 }); }
    sfx('blip', tStack(i), { g: 0.5, p: -0.6 + i * 0.3 });
  });
  const ova = overlay(ga);
  // 涨势线：从「五圈下来」描到「11 条」，一路跟着旁白
  const trend = path(ova, 'M ' + tops.map((p) => p.join(' ')).join(' L '), 'ac', { w: 5, arrow: false });
  const tTr = T('m2', '五圈') - 0.1, dTr = T('m2', '11') + 0.2 - tTr;
  draw(trend, tTr, dTr, { ease: 'none' });
  F((t) => { const v = t >= tTr ? '' : 'none'; if (trend.style.display !== v) trend.style.display = v; });
  sfx('whoosh', tTr, { g: 0.35 });
  const inA = path(ova, 'M 610 450 L 506 450', 'paper', { w: 5 }); arrowIn(inA, T('m1', '重发') - 0.2, 0.4);
  const gS = txt(ga, 'gloss', tr('模型的接口不保存上一次的对话（DeepSeek 文档：「无状态」），历史每次都要全部带上', 'The API is stateless: send the whole history every time'), 110, 630);
  css(gS, { width: '400px' });
  wipe(gS, T('m1', '不记事') + 0.2, { dir: 'l', d: 0.5 });
  wipeOut(ga, tA1, { dir: 'l', d: 0.4 });

  // ── 二、再长下去：顶到上限，旧的部分压成一段摘要（m3） ──
  const gb = h('div', 'abs', world); px(gb, 0, 0, 1920, 968);
  const SX = 640, SW = 520, rh = 44, bottom = 860;
  const roles = R0[4].roles, NX = 4;                      // 第 5 圈的 11 条，再长出 4 条
  const tMore = T('m3', '再长'), tSq = T('m3', 'Harness') - 0.1;
  const list = [...roles.map((r) => KIND(r)), ...Array(NX).fill('more')];
  const n = list.length, old = (j) => j >= 2 && j < n - 2;
  const cells = list.map((k, j) => {
    const b = blk(gb, k === 'more' ? '' : cellCls(k), SX, 0, SW, rh - 8);
    if (k === 'say') outline(b);
    if (k === 'more') { css(b, { border: '3px dashed var(--dim)', boxSizing: 'border-box' }); b.innerHTML = '<span class="dim" style="font:700 26px Mono;padding-left:16px;line-height:30px">…</span>'; }
    b.dataset.name = k;
    return b;
  });
  const sumRow = h('div', 'abs row say', gb, `<span class="role">${tr('摘要', 'Summary')}</span><span class="tx">${tr('前面 11 条', '11 older messages')}</span>`);
  css(sumRow, { borderStyle: 'dashed', borderColor: 'var(--ac)' });
  px(sumRow, SX, 0, SW, 0);
  classAt(sumRow, 'sumhl', T('m3', '摘要') - 0.1); sfx('tick', T('m3', '摘要') - 0.1, { g: 0.6 });   // 说到「摘要」时点亮那一行
  const tIn = (j) => (j < roles.length ? tB + j * 0.03 : tMore - 0.2 + (j - roles.length) * 0.15);
  let lastB = null;
  F((t) => {
    const k = ease.io3(clamp((t - tSq) / 0.6)), key = k.toFixed(3) + (t >= tB ? 1 : 0) + list.map((_, j) => (t >= tIn(j) ? 1 : 0)).join('');
    if (key === lastB) return; lastB = key;
    let y = bottom;
    cells.forEach((b, j) => {
      const on = t >= tIn(j), f = old(j) ? 1 - k : 1, hh = rh * f * (on ? 1 : 0);
      if (j === 2) { const sh = rh * k; y -= sh; css(sumRow, { top: y.toFixed(1) + 'px', height: Math.max(0, sh - 8).toFixed(1) + 'px', visibility: k > 0 ? 'visible' : 'hidden' }); }
      y -= hh;
      css(b, { top: y.toFixed(1) + 'px', height: Math.max(0, hh - 8).toFixed(1) + 'px', visibility: on && hh > 9 ? 'visible' : 'hidden' });
    });
  });
  list.forEach((k, j) => { if (j >= roles.length) sfx('tick', tIn(j), { g: 0.45, p: 0.2 }); });
  sfx('blip', tB, { g: 0.5, p: -0.4 }); sfx('whoosh', tSq, { g: 0.5 }); sfx('pop', tSq + 0.6, { g: 0.6 });
  const limY = bottom - n * rh - 6;
  const lim = blk(gb, '', SX - 40, limY, SW + 80, 0); css(lim, { borderTop: '5px dashed var(--ac)' }); lim.dataset.name = tr('上限', 'limit');
  fromTo(lim, tMore - 0.3, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.5, ease: 'power3.out' }); sfx('tick', tMore - 0.3, { g: 0.6 });
  const limL = txt(gb, 'ac', tr('上下文的上限', 'context limit'), SX + SW + 60, limY - 22); limL.style.font = '700 32px "Sans SC"';
  wipe(limL, tMore - 0.1, { dir: 'l', d: 0.4 });
  const inB = path(overlay(gb), 'M 610 450 L 506 450', 'paper', { w: 5 }); arrowIn(inB, tB + 0.2, 0.4);
  const cT = txt(gb, 'paper', `${tr('压缩', 'Compaction')} <span class="en ac">Compaction</span>`, 1260, 330); cT.style.font = '900 64px "Sans SC"';
  const cS = txt(gb, 'paper', tr('旧消息压成摘要', 'Older messages become a summary'), 1260, 430); css(cS, { font: '500 34px "Sans SC"', lineHeight: '1.4' });
  const cN = txt(gb, 'num paper', '', 1260, 560); cN.style.fontSize = '64px';
  countTo(cN, 11, n, tMore - 0.2, 0.15 * NX + 0.1, (v) => tr(`${Math.round(v)} 条`, `${Math.round(v)} msgs`));
  const cA = txt(gb, 'num ac', tr('→ 5 条', '→ 5'), 1460, 560); cA.style.fontSize = '64px';
  wipe(cA, tSq + 0.6, { dir: 'l', d: 0.4 });
  wipe(cT, tSq - 0.1, { dir: 'l', d: 0.45 }); wipe(cS, tSq + 0.2, { dir: 'l', d: 0.45 }); wipe(cN, tB + 0.2, { dir: 'l', d: 0.4 });
  wipeOut(gb, tB1, { dir: 'l', d: 0.4 });

  // ── 三、边界：只许碰项目里的文件；越界的调用被 Harness 拦下（m4） ──
  const gc = h('div', 'abs', world); px(gc, 0, 0, 1920, 968);
  const headC = txt(gc, 'paper', `${tr('边界', 'Boundary')} <span class="en ac">Permissions</span>`, 640, 140); headC.style.font = '700 40px "Sans SC"';
  wipe(headC, tC, { dir: 'l', d: 0.4 });
  const box = h('div', 'abs', gc); px(box, 960, 240, 460, 470); css(box, { border: '5px dashed var(--paper)', boxSizing: 'border-box' }); box.dataset.name = tr('项目目录', 'project folder');
  const bl = txt(gc, 'paper', tr('项目目录', 'Project folder'), 990, 262); bl.style.font = '700 34px "Sans SC"';
  const fa = h('div', 'abs file mono', gc, 'cart.py'); px(fa, 990, 340, 360, 60); css(fa, { fontSize: '32px', lineHeight: '54px' });
  const fb = h('div', 'abs file mono', gc, 'test_cart.py'); px(fb, 990, 424, 360, 60); css(fb, { fontSize: '32px', lineHeight: '54px' });
  const fo = h('div', 'abs file mono', gc, '../notes.txt'); px(fo, 1520, 560, 300, 60); css(fo, { fontSize: '32px', lineHeight: '54px' });
  wipe(box, tC + 0.05, { dir: 'l', d: 0.5 }); wipe(bl, tC + 0.15, { dir: 'l', d: 0.3 });
  wipe(fa, tC + 0.25, { dir: 'l', d: 0.3 }); wipe(fb, tC + 0.32, { dir: 'l', d: 0.3 }); wipe(fo, tC + 0.4, { dir: 'r', d: 0.3 });
  const ovc = overlay(gc);
  // Harness 在模型与文件之间检查路径：项目里的放过去，项目外的拦下
  const gate = path(ovc, 'M 930 250 L 930 700', 'ac', { w: 4, dashed: '8 10', arrow: false });
  const gateL = txt(gc, 'ac', tr('Harness 检查路径', 'Harness checks the path'), 820, 196); gateL.style.font = '700 28px "Sans SC"';
  arrowIn(gate, tC + 0.3, 0.5); wipe(gateL, tC + 0.4, { dir: 'l', d: 0.4 });
  const okP = path(ovc, 'M 500 380 C 700 380, 800 370, 980 370', 'paper', { w: 5 });
  const okL = txt(gc, 'mono paper', 'read_file("cart.py")', 520, 310); okL.style.font = '700 30px Mono';
  arrowIn(okP, T('m4', '边界') - 0.2, 0.5); wipe(okL, T('m4', '边界') - 0.2, { dir: 'l', d: 0.4 }); classAt(fa, 'hit', T('m4', '边界') + 0.3);
  sfx('blip', T('m4', '边界') - 0.2, { g: 0.5 });
  const tNo = T('m4', '边界') + 0.35;
  const noP = path(ovc, 'M 500 540 C 650 540, 820 560, 916 560', 'ac', { w: 5, arrow: false });
  const noL = txt(gc, 'mono ac', 'read_file("../notes.txt")', 520, 488); noL.style.font = '700 26px Mono';
  arrowIn(noP, tNo, 0.5); wipe(noL, tNo, { dir: 'l', d: 0.4 });
  const wall = blk(gc, 'bg-ac', 920, 500, 20, 120); wall.dataset.name = tr('拦下', 'blocked');
  fromTo(wall, tNo + 0.45, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(2)' }); sfx('thud', tNo + 0.45, { g: 0.7 });
  const rej = h('div', 'abs card-p', gc, `<div class="dimp" style="font:600 26px 'Sans SC'">${tr('交回给模型', 'Handed back to the model')}</div><div class="ink" style="font:700 32px 'Sans SC'">${esc('只能访问项目目录里的文件')}</div>`);
  px(rej, 640, 740); css(rej, { whiteSpace: 'nowrap' });
  wipe(rej, tNo + 0.55, { dir: 'l', d: 0.4 }); sfx('pop', tNo + 0.55, { g: 0.5 });
  const backP = path(ovc, 'M 630 790 C 560 790, 420 760, 330 610', 'paper', { w: 4, dashed: '10 10' }); arrowIn(backP, tNo + 0.85, 0.5);
  wipeOut(gc, tC1, { dir: 'l', d: 0.4 });

  // ── 四、同一个模型，换五套 Harness（m5–m7，2026-10 的论文，D10） ──
  const gd = h('div', 'abs', world); px(gd, 0, 0, 1920, 968);
  const tFill = T('m7', '换了') - 0.1;
  const HS = [['OpenHands', 57.14], ['Claude Code', 49.21], ['openJiuwen', 41.27], ['DSH', 34.92], ['PI', 30.16]];
  const bx = 960, bw = 700, by = (i) => 210 + i * 116;
  const ovd = overlay(gd);
  const headD = txt(gd, 'dim', tr('Harness', 'Harness'), 640, 140); css(headD, { font: '700 30px Inter' });
  const headV = txt(gd, 'dim', tr('得分（满分 100%）', 'Score (of 100%)'), bx, 140); headV.style.font = '700 30px "Sans SC"';
  wipe(headD, tD + 0.1, { dir: 'l', d: 0.3 }); wipe(headV, tD + 0.15, { dir: 'l', d: 0.3 });
  HS.forEach(([nm, v], i) => {
    const y = by(i), tt = T('m5', '换一套') - 0.2 + i * 0.12;
    const l = txt(gd, 'paper', nm, 640, y + 14); l.style.font = '800 40px Inter';
    const track = blk(gd, '', bx, y, bw, 76); css(track, { border: '3px solid var(--dim)', boxSizing: 'border-box' });
    const qm = txt(gd, 'dim num', '?', bx + 24, y + 12); qm.style.fontSize = '48px';            // 本事不一样：分数先空着，打个问号
    const tq = T('m5', '本事') - 0.2 + i * 0.12;
    appear(qm, tq); vanish(qm, tFill + i * 0.18); sfx('tick', tq, { g: 0.4, p: 0.4 });
    const top = i === 0, low = i === HS.length - 1;
    const fill = blk(gd, top ? 'bg-ac' : low ? 'bg-paper' : 'bg-dim', bx, y, 0, 76); fill.dataset.name = nm;
    const num = txt(gd, (top ? 'ac' : 'paper') + ' num', '', bx, y + 12); num.style.fontSize = '48px';
    const p = path(ovd, `M 500 450 C 560 450, 570 ${y + 38}, 626 ${y + 38}`, 'paper', { w: 3, arrow: false });
    arrowIn(p, tt, 0.4); wipe(l, tt + 0.1, { dir: 'l', d: 0.35 }); wipe(track, tt + 0.15, { dir: 'l', d: 0.4 }); sfx('pop', tt + 0.1, { g: 0.45, p: 0.4 });
    const tv = tFill + i * 0.18;
    fromTo(fill, tv, { width: 0 }, { width: bw * v / 100, duration: 0.7, ease: 'power3.out', immediateRender: false }); appear(fill, tv);
    appear(num, tv); countTo(num, 0, v, tv, 0.7, (x) => x.toFixed(1) + '%');
    F((t) => { const k = ease.out3(clamp((t - tv) / 0.7)); num.style.left = (bx + bw * v / 100 * k + 18).toFixed(1) + 'px'; });
    sfx('tick', tv, { g: 0.5, p: 0.3 });
  });
  // 最高、最低：说到时砸一下
  sfx('thud', T('m7', '最低') - 0.05, { g: 0.6 }); sfx('chime', T('m7', '最高') - 0.05, { g: 0.8 });
  const lowT = txt(gd, 'ink bg-paper', tr('最低', 'lowest'), bx + bw + 30, by(4) + 16); css(lowT, { font: '800 32px "Sans SC"', padding: '2px 12px' });
  const topT = txt(gd, 'ink bg-ac', tr('最高', 'highest'), bx + bw + 30, by(0) + 16); css(topT, { font: '800 32px "Sans SC"', padding: '2px 12px' });
  slam(lowT, Q(T('m7', '最低')) - 0.1, { from: 1.4, d: 0.35 }); slam(topT, Q(T('m7', '最高')) - 0.1, { from: 1.4, d: 0.35 });
  // 同样的 63 道题：模型下面一格一题
  const grid = h('div', 'abs', gd); px(grid, 110, 640, 380, 220); grid.dataset.name = tr('63 道题', '63 tasks');
  const cellsG = [];
  for (let i = 0; i < 63; i++) { const c = blk(grid, 'bg-dim', (i % 9) * 42, Math.floor(i / 9) * 30, 34, 22); cellsG.push(c); }
  const t63 = T('m6b', '63 道') - 0.2;
  cellsG.forEach((c, i) => appear(c, t63 + i * 0.012)); sfx('blip', t63, { g: 0.6 });
  const gl = txt(gd, 'paper', tr('同样的 63 道题', 'the same 63 tasks'), 110, 860); gl.style.font = '700 30px "Sans SC"';
  wipe(gl, t63 + 0.3, { dir: 'l', d: 0.4 });
  const src = txt(gd, 'dim', tr('<span class="ttl">《Finding the Right Fit: Model-Harness Interactions across Agent Tasks》</span><br>（找到合适的搭配：不同 Agent 任务中模型与 Harness 的相互作用）<br>Yixuan Li 等　·　arXiv 2610.00917　·　2026-10-01　·　题目取自 Terminal-Bench 4', 'Yixuan Li et al., "Finding the Right Fit", arXiv 2610.00917, 2026-10-01 · 63 tasks from Terminal-Bench 4'), 640, 790);
  css(src, { font: '500 26px "Sans SC", Inter', lineHeight: '1.4' });
  wipe(src, T('m6') - 0.1, { dir: 'l', d: 0.6 }); sfx('blip', T('m6') - 0.1, { g: 0.5 });
  if (src.querySelector('.ttl')) { classAt(src.querySelector('.ttl'), 'paper', T('m6', '论文') - 0.1); sfx('tick', T('m6', '论文') - 0.1, { g: 0.5 }); }
});
