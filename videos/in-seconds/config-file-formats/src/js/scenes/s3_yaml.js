// 第 4 幕：YAML。括号与引号飞散，只剩缩进 → 注释 → 末行少一个空格：报错；少两个：不报错，server 的 8080 被 5432 顶掉（PyYAML 实测）→ YAML 1.1 把挪威的 NO 读成 False。
scene('yaml', ({ root, s }) => {
  const { world, cam } = stage(root, s);
  const doc = makeDoc(world, FMT.json);
  classAt(doc.el, 'm-punct', s.start, W('d2', '不用括号') + 0.2);

  // ── d1：YAML 巨字；设计目标是人好读 ──
  const G = giant(world, 'YAML', { x: 90, y: 950, size: 190, grow: 1.22, rot: -7, cls: 'ac' });
  giantIn(G, s.start + 0.3, 0.1); shake(root, s.start + 0.42, 12);
  const yr = tag(world, 'k', '2001 · 第一个实现', 64, 310); stamp(yr, W('d1', '2001') + 0.3);
  const goal = tag(world, 'o', '设计目标：人好读', 64, 380); stamp(goal, W('d1', '阅读'), { g: 0.4 });

  // ── d2：括号和引号全部飞走；行首缩进成了阶梯 ──
  const tE = W('d2', '不用括号');
  docResize(doc, 6, tE + 0.3, 10); docMorph(doc, FMT.yaml, tE, { seed: 13 }); shake(root, tE + 0.8, 10);
  const lQ = tag(world, 'o', '多数字符串不加引号', 64, 450); stamp(lQ, W('d2', '引号'), { g: 0.4 });
  const tInd = W('d2b', '缩进');
  const ind = [[1, 2], [2, 2], [3, 2], [4, 4], [5, 4]].map(([row, n], i) => {
    const b = blk(world, 'bg-ac', DOC.x, DOC.y + row * DOC.lh + 4, n * CWD - 8, 40);
    tl.fromTo(b, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 0.25, ease: 'power3.out', immediateRender: true }, tInd + i * 0.08);
    return b;
  });
  sfx('tick', tInd, { g: 0.6 }); sfx('tick', tInd + 0.3, { g: 0.6, p: 0.4 });
  const pL = pointer(world, 'r', '缩进 = 层级', 4, W('d2b', '层级'), { w: 220, x: 640 });

  // ── d3：井号写注释 ──
  const tC = W('d3', '井号');
  const yc = FMT.yaml.map((l, i) => (i === 2 ? l + '  # 对外端口' : l));
  docMorph(doc, yc, tC, { seed: 17, d: 0.3 });
  [goal, lQ, pL.e, pL.ln].forEach((e) => clearOut(e, tC));

  // ── d4：缩进阶梯上裂开一道 ──
  const tCrack = W('d4', '隐患');
  const crack = slash(world, DOC.x - 30, DOC.y + 6 * DOC.lh, DOC.x + 160, DOC.y + DOC.lh - 20, 8, 'bg-paper'); cut(crack, tCrack, 0.2);
  shake(root, tCrack + 0.2, 8);

  // ── d5：末行少一个空格 → ParserError；少两个 → 不报错，server 的端口被换成 5432 ──
  const last = docFind(doc, (k) => k.row === 5), bar5 = ind[4];
  const t1 = W('d5', '少敲'), tErr = W('d5', '报错'), t2 = W('d5', '层级');
  last.forEach((k) => tl.fromTo(k.e, { x: 0 }, { x: -CWD, duration: 0.2, ease: 'power3.in', immediateRender: false }, t1));
  tl.fromTo(bar5, { width: 4 * CWD - 8 }, { width: 3 * CWD - 8, duration: 0.2, immediateRender: false }, t1); sfx('key', t1 + 0.1, { g: 1 });
  const err = tag(world, 'k big', '<span class="mono">ParserError</span>', 360, 420);
  stamp(err, tErr, { g: 1 }); shake(root, tErr + 0.16, 16);
  vanish(err, t2);
  last.forEach((k) => tl.fromTo(k.e, { x: -CWD }, { x: -2 * CWD, duration: 0.2, ease: 'power3.in', immediateRender: false }, t2));
  tl.fromTo(bar5, { width: 3 * CWD - 8 }, { width: 2 * CWD - 8, duration: 0.2, immediateRender: false }, t2); sfx('key', t2 + 0.1, { g: 1 });
  // 解析结果：server.port 那一格里的 8080 被 5432 撞飞
  const res = h('div', 'abs', world); px(res, 300, 400);
  const rh = txt(res, 'note', '解析结果（PyYAML 6.0.3 实测）', 0, 0);
  const rk = code(res, 'server.port =', 0, 60, 48, 'ink');
  const r8 = code(res, '8080', 400, 60, 48, 'ink');
  const rd = code(res, 'server.db.port = 无', 0, 130, 40, 'dimp');
  appear(res, t2 + 0.25);
  const fly = code(world, '5432', DOC.x + 8 * CWD, DOC.y + 5 * DOC.lh, 46, 'ac');
  gsap.set(fly, { autoAlpha: 0 });
  tl.fromTo(fly, { autoAlpha: 1, x: 0, y: 0 }, { x: 700 - DOC.x - 8 * CWD, y: 460 - DOC.y - 5 * DOC.lh, duration: 0.45, ease: 'power3.in', immediateRender: false }, t2 + 0.45);
  tl.fromTo(r8, { x: 0, y: 0, rotation: 0, autoAlpha: 1 }, { x: 260, y: 500, rotation: 70, autoAlpha: 0, duration: 0.7, ease: 'power2.in', immediateRender: false }, t2 + 0.9);
  sfx('thud', t2 + 0.9, { g: 1, p: -0.3 }); shake(root, t2 + 0.9, 16);
  const silent = tag(world, 'r', '不报错，8080 被悄悄顶掉', 300, 600); stamp(silent, t2 + 1.2);

  // ── d6：NO 先长成 NORWAY（挪威），再被盖成 FALSE ──
  const t6 = W('d6');
  [res, fly, silent, crack, yr].forEach((e) => clearOut(e, t6 - 0.1));
  last.forEach((k) => tl.to(k.e, { x: 0, duration: 0.3, ease: 'power3.out' }, t6));
  tl.to(bar5, { width: 4 * CWD - 8, duration: 0.3 }, t6);
  const rule = tag(world, 'k', 'YAML 1.1 规则', 120, 330); stamp(rule, W('d6', 'YAML'));
  const kv = h('div', 'abs code ink', world); px(kv, 120, 420); kv.style.fontSize = '90px';
  kv.innerHTML = 'country: <span class="no">NO</span><span class="rway ac">RWAY</span>';
  const rway = kv.querySelector('.rway');
  stamp(kv, W('d6', '不加引号'), { g: 0.6 });
  vanish(rway, 0); appear(rway, W('d6', '挪威'));
  tl.fromTo(rway, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(-20% -5% -20% 0%)', duration: 0.35, ease: 'power3.out', immediateRender: false }, W('d6', '挪威'));
  const nor = tag(world, 'o', 'NO = 挪威的国家代码', 120, 560); stamp(nor, W('d6', '挪威') + 0.2, { g: 0.4 });
  const tF = W('d6b', '否');
  tl.to(rway, { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.2, ease: 'power3.in' }, tF - 0.45);
  const fal = h('div', 'abs bg-ac', world); px(fal, 120 + 9 * 54 - 30, 405, 440, 140);
  txt(fal, 'giant paper', 'FALSE', 24, 22).style.fontSize = '110px';
  gsap.set(fal, { rotation: -6 }); fal.dataset.overlapOk = kv.dataset.overlapOk = '1'; fal.firstChild.dataset.overlapOk = '1';
  stamp(fal, tF - 0.15, { from: 1.6, d: 0.16, g: 1, p: -0.4 }); shake(root, tF, 16);
  const resF = tag(world, 'k', '读出来是布尔值 False（PyYAML 实测）', 120, 580); stamp(resF, tF + 0.4);
  clearOut(nor, tF - 0.2);
  slabIn(root, s.end);
  hold(cam, s, -1, s.start + 0.9);
});
