// 这一次运行里还看得出的几件事：每次重发整段对话（五圈、五摞，E8、D5）→ 太长时压成摘要（示意，D6）→ 边界（本片 Harness 的规则，E10）
// → 同一个模型换 Harness，分数不同（LangChain 报告，D8）。
scene('more', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const hold = s.end - s.start - 0.2, dx = Math.min(48, 2 * hold);
  const cam = makeCamera(world, 1920, VH);
  cam.track(s.start, { x: 960 - dx / 2, y: 484, z: 1 }, [[s.start + 0.1, { x: 960 + dx / 2 }, hold, { ease: 'none', sfx: false }]]);
  const R0 = D.rounds;
  const KIND = (role, i) => (role === 'tool' ? 'tool' : role === 'assistant' ? 'call' : 'say');

  // ── 一、五圈与五摞：每一圈发出的整段对话（m1–m2） ──
  const tA1 = Q(T('m3') - 0.5);                    // 这一部分收起的时刻
  const ga = h('div', 'abs', world); px(ga, 0, 0, 1920, 968);
  const S = svg('svg', { class: 'abs', width: 1920, height: 968, viewBox: '0 0 1920 968' }, ga); px(S, 0, 0); S.dataset.name = tr('五圈', 'five laps');
  const cx = 400, cy = 500;
  const tStack = (i) => (i === 0 ? c0 + 0.45 : Math.min(T('m1', '每问') + (i - 1) * 0.6, Tend('m1') - 0.8 + i * 0.1));
  R0.forEach((r, i) => {
    const c = svg('circle', { cx, cy, r: 92 + i * 54, fill: 'none', stroke: C.ac, 'stroke-width': i === 4 ? 10 : 6, transform: `rotate(-90 ${cx} ${cy})` }, S);
    const t0 = tStack(i) - 0.1;
    draw(c, t0, 0.5);
    F((t) => { const v = t >= t0 ? '' : 'none'; if (c.style.display !== v) c.style.display = v; });
  });
  const mid = centered(ga, 'paper', tr('模型', 'Model'), cx, cy - 32, 300); mid.style.font = '900 52px "Sans SC"';
  wipe(mid, c0 + 0.1, { dir: 'l', d: 0.4 });
  const head = txt(ga, 'lab dim', tr('每一圈发出的整段对话', 'The whole conversation, sent each lap'), 760, 150);
  wipe(head, c0 + 0.15, { dir: 'l', d: 0.4 });
  const leg = [['bg-ac', tr('工具调用', 'tool call')], ['bg-paper', tr('结果', 'result')], ['', tr('说明、你', 'system, you')]];
  leg.forEach(([cls, nm], i) => {
    const sw = blk(ga, cls, 1240 + i * 210, 156, 28, 28); if (!cls) css(sw, { border: '3px solid var(--paper)', boxSizing: 'border-box' });
    const l = txt(ga, 'paper', nm, 1280 + i * 210, 150); l.style.font = '500 30px "Sans SC"';
    wipe(sw, c0 + 0.3 + i * 0.08, { dir: 'l', d: 0.3 }); wipe(l, c0 + 0.34 + i * 0.08, { dir: 'l', d: 0.3 });
  });
  const tops = [];
  R0.forEach((r, i) => {
    const x = 760 + i * 214, rowH = 52;
    r.roles.forEach((role, j) => {
      const k = KIND(role, j), y = 800 - (j + 1) * rowH;
      const b = blk(ga, k === 'call' ? 'bg-ac' : k === 'tool' ? 'bg-paper' : '', x, y, 160, rowH - 8);
      if (k === 'say') css(b, { border: '3px solid var(--paper)', boxSizing: 'border-box' });
      b.dataset.name = k;
      wipe(b, tStack(i) + j * 0.03, { dir: 'b', d: 0.25 });
    });
    tops.push([x + 80, 800 - r.sent * rowH - 8]);
    const a = txt(ga, 'paper', tr(`第 ${r.n} 圈`, `Lap ${r.n}`), x, 820); a.style.font = '700 32px "Sans SC"';
    const b = txt(ga, 'dim', tr(`${r.sent} 条`, `${r.sent} msgs`), x, 866); b.style.font = '700 32px "Sans SC"';
    wipe(a, tStack(i), { dir: 'l', d: 0.3 }); wipe(b, tStack(i) + 0.05, { dir: 'l', d: 0.3 });
    if (i === 0) { classAt(b, 'hl', T('m2', '2') - 0.1, tA1); sfx('tick', T('m2', '2') - 0.1, { g: 0.7, p: -0.4 }); }
    if (i === 4) { classAt(b, 'hl', T('m2', '11') - 0.1, tA1); sfx('tick', T('m2', '11') - 0.1, { g: 0.7, p: 0.5 }); }
    sfx('blip', tStack(i), { g: 0.5, p: -0.6 + i * 0.3 });
  });
  const ov = overlay(ga);
  const trend = path(ov, 'M ' + tops.map((p) => p.join(' ')).join(' L '), 'ac', { w: 4, dashed: '10 10', arrow: false });
  arrowIn(trend, T('m2', '涨') - 0.2, 0.6); sfx('whoosh', T('m2', '涨') - 0.2, { g: 0.35 });
  const gS = txt(ga, 'gloss', tr('模型的接口不保存上一次的对话（DeepSeek 文档：「无状态」），历史要每次全部带上', 'The API is stateless: send the whole history every time'), 64, 820);
  css(gS, { width: '620px' });
  wipe(gS, T('m1', '不记事') - 0.1, { dir: 'l', d: 0.5 });
  wipeOut(ga, tA1, { dir: 'l', d: 0.4 });

  // ── 二、太长时压成摘要（示意：这次只有 11 条，没有压缩）（m3）：左边是第 5 次发出的 11 条，右边是压过之后 ──
  const tB = tA1 + 0.3, tB1 = Q(T('m4') - 0.45);
  const gb = h('div', 'abs', world); px(gb, 0, 0, 1920, 968);
  const bottom = 880, rh = 56, LX = 300, RX = 1100, SW = 520;
  const roles = R0[4].roles, keep = (j) => j < 2 || j >= roles.length - 2;
  const nOld = roles.filter((_, j) => !keep(j)).length;
  const tSq = T('m3', '压成') - 0.2;
  const cell = (x, y, k, t0, dir = 'b') => {
    const b = blk(gb, k === 'call' ? 'bg-ac' : k === 'tool' ? 'bg-paper' : '', x, y, SW, rh - 8);
    if (k === 'say') css(b, { border: '3px solid var(--paper)', boxSizing: 'border-box' });
    b.dataset.name = k; wipe(b, t0, { dir, d: 0.25 }); return b;
  };
  roles.forEach((role, j) => cell(LX, bottom - (j + 1) * rh, KIND(role, j), tB + j * 0.03)); sfx('blip', tB, { g: 0.55, p: -0.4 });
  // 要压掉的 7 条：括起来
  const oldTop = bottom - (roles.length - 2) * rh, oldBot = bottom - 2 * rh;
  const brk = h('div', 'abs bracket', gb); px(brk, LX + SW + 18, oldTop, 24, oldBot - oldTop - 8); css(brk, { borderLeft: 'none', borderRight: '6px solid var(--ac)', borderColor: 'var(--ac)' });
  wipe(brk, T('m3', 'Harness') - 0.1, { dir: 't', d: 0.5 }); sfx('tick', T('m3', 'Harness') - 0.1, { g: 0.6 });
  const limY = bottom - roles.length * rh - 14;
  const lim = blk(gb, '', LX - 30, limY, SW + 60, 0); css(lim, { borderTop: '5px dashed var(--ac)' }); lim.dataset.name = tr('上限', 'limit');
  fromTo(lim, T('m3', '太长') - 0.2, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.5, ease: 'power3.out' }); sfx('tick', T('m3', '太长') - 0.2, { g: 0.6 });
  const limL = txt(gb, 'ac', tr('快装不下（示意）', 'near the limit (illustration)'), LX + SW + 50, limY - 22); limL.style.font = '700 30px "Sans SC"';
  wipe(limL, T('m3', '太长'), { dir: 'l', d: 0.4 });
  const capL = txt(gb, 'lab dim', tr('第 5 次发出的 11 条', 'The 11 messages of request 5'), LX, bottom - roles.length * rh - 70);
  wipe(capL, tB + 0.1, { dir: 'l', d: 0.3 });
  const ovb = overlay(gb);
  const arr = path(ovb, `M ${LX + SW + 60} ${(oldTop + oldBot) / 2} L ${RX - 30} ${bottom - 3 * rh + 24}`, 'ac', { w: 6 });
  arrowIn(arr, tSq, 0.5);
  // 右边：说明、你的话留着；中间 7 条变成一段摘要；最近的两条留着
  const right = [['say', 0], ['say', 1], ['sum'], [KIND(roles[roles.length - 2]), 3], [KIND(roles[roles.length - 1]), 4]];
  right.forEach(([k], i) => {
    const y = bottom - (i + 1) * rh, t0 = tSq + 0.45 + i * 0.08;
    if (k !== 'sum') { cell(RX, y, k, t0, 'l'); return; }
    const sum = h('div', 'abs row say', gb, `<span class="role">${tr('摘要', 'Summary')}</span><span class="tx">${tr(`前面 ${nOld} 条，压成一段话`, `${nOld} older messages, condensed`)}</span>`);
    px(sum, RX, y, SW, rh - 8); css(sum, { borderStyle: 'dashed', borderColor: 'var(--ac)' });
    wipe(sum, t0, { dir: 'l', d: 0.4 });
  });
  sfx('pop', tSq + 0.6, { g: 0.6 });
  const capR = txt(gb, 'lab dim', tr('压过之后：5 条', 'After: 5 messages'), RX, bottom - 5 * rh - 56);
  wipe(capR, tSq + 0.8, { dir: 'l', d: 0.3 });
  const nb = txt(gb, 'dim', tr('示意。本片这次运行只有 11 条，用不着压；对话长到快装不下时，Harness 才把较早的部分压成摘要', 'Illustration only: this run never needed it'), 64, 150);
  css(nb, { font: '500 30px "Sans SC"', width: '1700px', whiteSpace: 'normal' });
  wipe(nb, tB + 0.2, { dir: 'l', d: 0.5 });
  wipeOut(gb, tB1, { dir: 'l', d: 0.4 });

  // ── 三、边界：本片的 Harness 只许碰项目目录里的文件（m4） ──
  const tC = tB1 + 0.3, tC1 = Q(T('m5') - 0.45);
  const gc = h('div', 'abs', world); px(gc, 0, 0, 1920, 968);
  const dir = h('div', 'abs', gc); px(dir, 180, 260, 720, 480); css(dir, { border: '6px dashed var(--paper)', boxSizing: 'border-box' });
  dir.dataset.name = tr('项目目录', 'project folder');
  const dl = txt(gc, 'paper', tr('项目目录', 'Project folder'), 180, 196); dl.style.font = '700 38px "Sans SC"';
  const fa = h('div', 'abs file hit mono', gc, 'cart.py'); px(fa, 250, 360, 360, 64); css(fa, { fontSize: '34px', lineHeight: '58px' });
  const fb = h('div', 'abs file hit mono', gc, 'test_cart.py'); px(fb, 250, 452, 360, 64); css(fb, { fontSize: '34px', lineHeight: '58px' });
  wipe(dir, tC, { dir: 'l', d: 0.5 }); wipe(dl, tC + 0.1, { dir: 'l', d: 0.3 });
  wipe(fa, tC + 0.25, { dir: 'l', d: 0.3 }); wipe(fb, tC + 0.35, { dir: 'l', d: 0.3 });
  const out = h('div', 'abs file mono', gc, tr('项目外的文件', 'outside file')); px(out, 1260, 420, 420, 64); css(out, { fontFamily: '"Sans SC"', fontSize: '34px', lineHeight: '58px' });
  wipe(out, T('m4', '边界') - 0.1, { dir: 'r', d: 0.4 });
  const ovc = overlay(gc);
  const tryP = path(ovc, 'M 640 452 L 1230 452', 'ac', { w: 6, arrow: false });
  arrowIn(tryP, T('m4', '只许') - 0.3, 0.5);
  const wall = blk(gc, 'bg-ac', 892, 340, 18, 224); wall.dataset.name = tr('拦下', 'blocked');
  fromTo(wall, T('m4', '只许') + 0.15, { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(2)' });
  sfx('thud', T('m4', '只许') + 0.15, { g: 0.7 });
  // 越界时，本片 Harness 交回给模型的是一句拒绝（01_harness.py 的 inside()）；这次运行没有触发
  const rej = h('div', 'abs card-p', gc, `<div class="dimp" style="font:600 24px 'Sans SC'">${tr('越界时 Harness 交回的结果', 'What Harness returns')}</div><div class="ink mono" style="font:600 30px Mono,'Sans SC'">${esc('只能访问项目目录里的文件：…')}</div>`);
  px(rej, 980, 600); css(rej, { whiteSpace: 'nowrap' });
  wipe(rej, T('m4', '项目') - 0.1, { dir: 'l', d: 0.4 });
  const nc = txt(gc, 'dim', tr('本片这个 Harness 写死的规则；这次运行没有越界', "This Harness's own rule; not triggered in this run"), 980, 760); nc.style.font = '500 28px "Sans SC"';
  wipe(nc, T('m4', '项目') + 0.2, { dir: 'l', d: 0.4 });
  wipeOut(gc, tC1, { dir: 'l', d: 0.4 });

  // ── 四、同一个模型，换一套 Harness（m5–m7，LangChain 报告） ──
  const tD = tC1 + 0.3;
  const gd = h('div', 'abs', world); px(gd, 0, 0, 1920, 968);
  const mchip = h('div', 'abs bg-paper ink', gd, `<div class="dimp" style="font:600 26px 'Sans SC'">${tr('同一个模型', 'Same model')}</div><div class="mono" style="font:800 44px Mono">gpt-5.2-codex</div>`);
  px(mchip, 120, 380); css(mchip, { padding: '20px 30px' });
  slide(mchip, Q(T('m5', '同一个')) - 0.1, { x: -60, d: 0.45 }); sfx('thud', Q(T('m5', '同一个')), { g: 0.6 });
  const bx = 820, bw = 940, by = [330, 560], vals = [52.8, 66.5];
  const ovd = overlay(gd);
  const names = [tr('改之前的 Harness', 'Harness before'), tr('改过的 Harness', 'Harness after')];
  const bars = names.map((nm, i) => {
    const l = txt(gd, 'paper', nm, bx, by[i] - 56); l.style.font = '700 34px "Sans SC"';
    const track = blk(gd, '', bx, by[i], bw, 90); css(track, { border: '3px solid var(--dim)', boxSizing: 'border-box' });
    const fill = blk(gd, i ? 'bg-ac' : 'bg-paper', bx, by[i], 0, 90); fill.dataset.name = nm;
    const n = txt(gd, i ? 'ac num' : 'paper num', '', bx, by[i] + 100); n.style.fontSize = '64px';
    const tt = T('m5', '换一套') - 0.1 + i * 0.15;
    wipe(l, tt, { dir: 'l', d: 0.35 }); wipe(track, tt + 0.05, { dir: 'l', d: 0.4 }); sfx('pop', tt, { g: 0.5, p: 0.4 });
    const p = path(ovd, `M 520 ${430} C 640 430, 680 ${by[i] + 45}, ${bx - 12} ${by[i] + 45}`, 'paper', { w: 4 });
    arrowIn(p, T('m5', '本事') - 0.3 + i * 0.25, 0.5); sfx('tick', T('m5', '本事') - 0.3 + i * 0.25, { g: 0.5, p: 0.3 });
    const tv = Qf(T('m7', i ? '66.5' : '52.8') - 0.35);
    fromTo(fill, tv, { width: 0 }, { width: bw * vals[i] / 100, duration: 0.7, ease: 'power3.out', immediateRender: false });
    appear(fill, tv);
    appear(n, tv); countTo(n, 0, vals[i], tv, 0.7, (v) => v.toFixed(1));
    F((t) => { const k = ease.out3(clamp((t - tv) / 0.7)); n.style.left = (bx + bw * vals[i] / 100 * k + 20).toFixed(1) + 'px'; n.style.top = (by[i] + 8) + 'px'; });
    sfx(i ? 'chime' : 'thud', tv + 0.5, { g: i ? 0.8 : 0.6 });
    return { l, track, fill, n };
  });
  const axis = txt(gd, 'dim', tr('满分 100', 'out of 100'), bx + bw - 140, by[1] + 110); axis.style.font = '500 26px "Sans SC"';
  wipe(axis, T('m7', '分数') - 0.2, { dir: 'l', d: 0.3 });
  const src = txt(gd, 'dim', tr('LangChain《Improving Deep Agents with harness engineering》，2026-02-17　·　评测：Terminal Bench 2.0　·　只改了系统提示、工具与中间件',
    'LangChain, "Improving Deep Agents with harness engineering", 2026-02-17 · Terminal Bench 2.0'), 120, 800);
  css(src, { font: '500 26px "Sans SC", Inter', width: '1680px', whiteSpace: 'normal' });
  wipe(src, T('m6', 'LangChain') - 0.1, { dir: 'l', d: 0.6 }); sfx('blip', T('m6', 'LangChain') - 0.1, { g: 0.5 });
});
