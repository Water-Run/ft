// 第 4 幕：YAML。括号与引号被抹去、缩进成阶梯 → 注释 → 少一个空格：报错；少两个：层级悄悄变了（PyYAML 实测）→ YAML 1.1 把 NO 读成 False。
scene('yaml', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  blk(world, 'bg-paper', -100, -100, 2120, 1170);

  // ── d1：大斜线重切；红色巨字 YAML 斜跨右半屏、出画 ──
  const k = slash(world, -100, 470, 2100, 330, 26, 'bg-ink'); cut(k, s.start + 0.05, 0.3);
  const G = giant(world, 'YAML', { x: 960, y: 330, size: 170, grow: 1.24, rot: -6, cls: 'ac' });
  giantIn(G, s.start + 0.2, 0.1);
  const yr = tag(world, 'k', '2001 · 第一个实现', 120, 150); stamp(yr, W('d1', '2001') + 0.3);
  const goal = tag(world, 'o', '设计目标：人好读', 120, 226); stamp(goal, W('d1', '阅读'), { g: 0.4 });

  // ── d2：黑块抹掉 {} 与 ""，只剩缩进；左侧红色横条是缩进阶梯 ──
  const X = 260, Y = 520, LH = 92, CW = 38.4;     // 64px 等宽字一格宽 0.6em
  const ghost = code(world, '{"server": {"db": {\n  "port": 8080, "host": "localhost"}}}', X - 120, Y, 50, 'dimp');
  appear(ghost, s.start + 0.3);
  const tErase = W('d2', '不用括号');
  const eraser = blk(world, 'bg-ink', X - 140, Y - 20, 1400, 180);
  tl.fromTo(eraser, { scaleX: 0 }, { keyframes: [{ scaleX: 1, duration: 0.3, ease: 'power3.in' }, { scaleX: 0, duration: 0.3, ease: 'power3.out' }], transformOrigin: '0 50%', immediateRender: true }, tErase);
  tl.set(eraser, { transformOrigin: '100% 50%' }, tErase + 0.3); vanish(ghost, tErase + 0.3); sfx('whoosh', tErase, { g: 0.7 });
  const L = [['server:', 0], ['db:', 2], ['port: 8080', 4], ['host: localhost', 4]].map(([t, ind], i) => {
    const e = code(world, ' '.repeat(ind) + t.replace(/^(\w+):/, '$1<span class="r">:</span>'), X, Y - 60 + i * LH, 64, 'ink');
    const bar = blk(world, 'bg-ac', X, Y - 60 + i * LH + 20, Math.max(8, ind * CW - 10), 48);
    if (!ind) bar.style.opacity = 0;
    appear(e, tErase + 0.3 + i * 0.06);
    return { e, bar, ind };
  });
  const tInd = W('d2b', '缩进');
  L.forEach((l, i) => { if (l.ind) tl.fromTo(l.bar, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.3, ease: 'power3.out', immediateRender: true }, tInd + i * 0.08); });
  sfx('tick', tInd, { g: 0.6 }); sfx('tick', tInd + 0.24, { g: 0.6, p: 0.4 });
  const lInd = tag(world, 'r', '缩进 = 层级', X + 720, Y - 60); stamp(lInd, W('d2b', '层级'));

  // ── d3：注释 ──
  const cmt = tag(world, 'r big', '# 端口设置', X + 600, Y - 60 + 2 * LH + 2);
  stamp(cmt, W('d3', '井号'), { sfx: 'pop' });

  // ── d4：缩进阶梯上出现一道斜向切口 ──
  const tCrack = W('d4', '隐患');
  const crack = slash(world, X - 20, Y + 280, X + 200, Y - 40, 10, 'bg-paper'); cut(crack, tCrack, 0.25);
  clearOut(lInd, tCrack);

  // ── d5：少一个空格 → ParserError；少两个 → host 跑到 server 下 ──
  const host = L[3];
  const t1 = W('d5', '少敲'), tErr = W('d5', '报错'), t2 = W('d5', '层级');
  tl.to(host.e, { x: -CW, duration: 0.2, ease: 'power3.in' }, t1); tl.to(host.bar, { width: 4 * CW - 10 - CW, duration: 0.2 }, t1);
  const err = h('div', 'abs bg-ink', world); px(err, X + 900, Y + 140, 520, 90); code(err, 'ParserError', 30, 8, 60, 'paper');
  stamp(err, tErr, { g: 0.9 }); sfx('blip', tErr + 0.1, { g: 0.7 });
  tl.to(host.e, { x: -2 * CW, duration: 0.2, ease: 'power3.in' }, t2); tl.to(host.bar, { width: 2 * CW - 10, duration: 0.2 }, t2);
  vanish(err, t2);
  const was = code(world, '应为 server.db.host', X + 900, Y + 120, 40, 'dimp');
  const now = code(world, '实为 server.host', X + 900, Y + 180, 48, 'ink');
  appear(was, t2 + 0.1); stamp(now, t2 + 0.35, { sfx: 'pop' });
  const sl = blk(world, 'bg-dimp', X + 890, Y + 146, 440, 6); css(sl, { background: 'var(--dimp)' }); tl.fromTo(sl, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.25, immediateRender: true }, t2 + 0.3);
  const lab = txt(world, 'note', 'PyYAML 6.0.3 实测', X + 900, Y + 260); appear(lab, t2 + 0.5);

  // ── d6：NO 被 FALSE 盖印 ──
  const tD6 = W('d6');
  [...L.map((l) => l.e), ...L.map((l) => l.bar), cmt, crack, was, now, sl, lab].forEach((e) => clearOut(e, tD6));
  const rule = tag(world, 'k', 'YAML 1.1 规则', 120, 520); stamp(rule, W('d6', 'YAML'));
  const kv = code(world, 'country: <span class="no">NO</span>', 120, 600, 150, 'ink');
  stamp(kv, W('d6', '不加引号'), { sfx: 'pop' });
  const nor = tag(world, 'o', '挪威', 980, 470); stamp(nor, W('d6', '挪威'), { g: 0.4 });
  const fal = h('div', 'abs bg-ac', world); px(fal, 760, 590, 640, 190); txt(fal, 'giant paper', 'FALSE', 30, 24).style.fontSize = '150px';
  gsap.set(fal, { rotation: -5 }); fal.dataset.overlapOk = kv.dataset.overlapOk = '1'; fal.firstChild.dataset.overlapOk = '1';
  const tF = W('d6b', '否');
  stamp(fal, tF - 0.15, { from: 1.4, d: 0.18, g: 1, p: -0.3 });
  const res = txt(world, 'note', '读出来是布尔值 False', 760, 820); appear(res, tF + 0.3);
  hold(cam, s, -1);
});
