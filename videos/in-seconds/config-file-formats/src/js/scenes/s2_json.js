// 第 3 幕：JSON。闭合标签被一刀砍落 → 剩下的换成大括号，同一份配置从 115 字符变成 75 字符（实测）→ 值自带类型 → 每行一个值就是 JSONL，日志一条条往下记 → 满屏引号括号，注释进不来。
scene('json', ({ root, s }) => {
  const { world, cam } = stage(root, s);
  const doc = makeDoc(world, FMT.xmlA);

  // ── c1：JSON 巨字；一刀砍下，闭合标签全部掉落 ──
  const G = giant(world, 'JSON', { x: 90, y: 950, size: 210, grow: 1.2, rot: -9, cls: 'ink' });
  giantIn(G, s.start + 0.3, 0.1); shake(root, s.start + 0.4, 12);
  const yr = tag(world, 'k', '2001 · Douglas Crockford', 64, 310); stamp(yr, W('c1', '提出'));
  const tCut = W('c1', '砍掉');
  const k = slash(world, DOC.x - 120, DOC.y + 10 * DOC.lh + 60, DOC.x + 880, DOC.y - 90, 22, 'bg-ac'); cut(k, tCut, 0.2);
  const r = seeded(21), closes = docFind(doc, (t) => t.cls === 'tc');
  closes.forEach((t, i) => tl.fromTo(t.e, { x: 0, y: 0, rotation: 0, autoAlpha: 1 }, { x: (r() - 0.3) * 260, y: 900 + r() * 300, rotation: (r() - 0.5) * 140, autoAlpha: 0, duration: 0.9, ease: 'power2.in', immediateRender: false }, tCut + 0.2 + i * 0.05));
  sfx('thud', tCut + 0.2, { g: 1, p: -0.4 }); shake(root, tCut + 0.2, 16);
  clearOut(k, tCut + 0.9);
  doc.toks = doc.toks.filter((t) => t.cls !== 'tc');

  // ── c2：剩下的换成大括号；同一份配置短了一大截 ──
  const tBr = W('c2', '大括号');
  docMorph(doc, FMT.json, tBr - 0.1, { seed: 9 });
  classAt(doc.el, 'm-punct', tBr + 0.8, W('c3'));
  const tShort = W('c2', '短了');
  const lab = txt(world, 'note', '同一份配置，去掉空白后的字符数（实测）', 300, 400); appear(lab, tShort - 0.2);
  const b1 = countBar(world, 300, 460, 115, 4, 'bg-ink', 'XML', tShort - 0.2), b2 = countBar(world, 300, 530, 75, 4, 'bg-ac', 'JSON', tShort + 0.2);
  sfx('pop', tShort + 0.2, { g: 0.7 }); shake(root, tShort + 0.6, 8);

  // ── c3：值自带类型：数字、字符串、布尔值、数组、对象 ──
  const tNum = W('c3', '数字');
  [lab, b1.b, b1.l, b2.b, b2.l].forEach((e) => clearOut(e, tNum - 0.2));
  const hl = (pred, t) => docFind(doc, pred).forEach((x) => { classAt(x.e, 'sel', t, W('c4')); tl.fromTo(x.e, { scale: 1 }, { keyframes: [{ scale: 1.3, duration: 0.08 }, { scale: 1, duration: 0.2 }], immediateRender: false }, t); });
  hl((x) => x.id === 'port' || x.id === 'dbport', tNum);
  const pN = pointer(world, 'k', '数字 8080', 3, tNum, { w: 220, x: 600 });
  const tStr = W('c3', '字符串');
  hl((x) => x.id === 'host' || x.id === 'user', tStr);
  const pS = pointer(world, 'r', '字符串 "localhost"', 2, tStr, { w: 330, x: 490 });
  const chB = tag(world, 'u', '<span class="mono">true / false</span> 布尔值', 330, 520); stamp(chB, W('c3', '布尔值'));
  const chA = tag(world, 'o', '<span class="mono">[ … ]</span> 数组', 330, 590); stamp(chA, W('c3', '数组'));
  const tObj = W('c3', '对象');
  const bxO = docBox(world, 1, 8, 2, 16, tObj), bxO2 = docBox(world, 4, 7, 4, 18, tObj + 0.15, { color: '#E9E0CC' });
  const chO = tag(world, 'r', '<span class="mono">{ … }</span> 对象', 600, 590); stamp(chO, tObj);

  // ── c4：整份压成一行；每行一个完整的值 = JSONL，日志一条条往下记 ──
  const tLine = W('c4', '每行');
  [pN.e, pN.ln, pS.e, pS.ln, chB, chA, chO, bxO, bxO2].forEach((e) => clearOut(e, tLine - 0.1));
  const squash = (k, t, back) => tl.fromTo(k.e, back ? { y: 2 * DOC.lh - (k.y - DOC.y), scaleY: 0.1, autoAlpha: 0 } : { y: 0, scaleY: 1, autoAlpha: 1 }, { ...(back ? { y: 0, scaleY: 1, autoAlpha: 1 } : { y: 2 * DOC.lh - (k.y - DOC.y), scaleY: 0.1, autoAlpha: 0 }), duration: 0.35, ease: back ? 'power3.out' : 'power4.in', immediateRender: false }, t);
  doc.toks.forEach((k) => squash(k, tLine, false));
  sfx('whoosh', tLine, { g: 0.7 });
  const one = code(world, '{"server":{"host":"localhost","port":8080,…}}', DOC.x - 30, DOC.y + 2 * DOC.lh, 26, 'paper');
  wipe(one, tLine + 0.35, { dir: 'l', d: 0.3 });
  const tL = W('c4', '.jsonl');
  const Lb = txt(world, 'giant ac', 'L', 660, 200); Lb.style.fontSize = '420px'; Lb.dataset.overlapOk = '1'; gsap.set(Lb, { rotation: -9 });
  slam(Lb, tL, { from: 2, d: 0.28, ease: 'power4.out' }); sfx('thud', tL + 0.2, { g: 1, p: -0.5 }); shake(root, tL + 0.25, 16);
  const recs = ['{"t":"09:00:01","event":"start","port":8080}', '{"t":"09:00:02","event":"listen"}', '{"t":"09:00:05","event":"request","path":"/"}', '{"t":"09:00:07","event":"request","path":"/a"}', '{"t":"09:00:09","event":"reload"}', '{"t":"09:00:12","event":"request","path":"/b"}'];
  const tRec = W('c4', '完整'), gap = (W('c4b', '记录') + 0.4 - tRec) / recs.length;
  vanish(one, tRec);
  recs.forEach((line, i) => {
    const e = code(world, line, DOC.x - 30, DOC.y + i * 70, 27, 'paper'); e.style.whiteSpace = 'pre';
    const t0 = tRec + i * gap;
    tl.fromTo(e, { autoAlpha: 0, x: 400 }, { autoAlpha: 1, x: 0, duration: 0.25, ease: 'power3.out', immediateRender: true }, t0); sfx('tick', t0, { g: 0.6, p: 0.1 * i });
    const bar = blk(world, i % 2 ? 'bg-ac' : 'bg-paper', DOC.x - 50, DOC.y + i * 70 + 4, 10, 30); appear(bar, t0);
    clearOut(e, W('c5') - 0.15); clearOut(bar, W('c5') - 0.15);
  });
  const lgT = tag(world, 'r', '日志：一行一条记录', DOC.x - 30, DOC.y + 6 * 70 + 10); stamp(lgT, W('c4b', '日志'));
  const lg = { e: lgT, ln: lgT };

  // ── c5：回到整份文件：满屏引号与括号；「# 注释」撞上来被弹开 ──
  const t5 = W('c5');
  [lg.e, lg.ln, Lb].forEach((e) => clearOut(e, t5 - 0.15));
  doc.toks.forEach((k) => squash(k, t5, true));
  const tQ = W('c5', '引号');
  classAt(doc.el, 'm-punct', tQ, s.end);
  docFind(doc, (x) => x.cls === 'q' || x.cls === 'b').forEach((x, i) => tl.fromTo(x.e, { scale: 1 }, { keyframes: [{ scale: 1.7, duration: 0.07 }, { scale: 1, duration: 0.18 }], immediateRender: false }, tQ + i * 0.035));
  sfx('tick', tQ, { g: 0.6 }); sfx('tick', tQ + 0.3, { g: 0.6, p: 0.3 }); sfx('tick', tQ + 0.6, { g: 0.6, p: 0.6 });
  const tNo = W('c5', '没有');
  const note = tag(world, 'r big', '# 对外端口', 400, DOC.y + 3 * DOC.lh - 10);
  gsap.set(note, { autoAlpha: 0 });
  tl.fromTo(note, { autoAlpha: 1, x: -700 }, { keyframes: [{ x: DOC.x - 60 - 400 - 330, duration: 0.3, ease: 'power3.in' }, { x: -160, rotation: -10, duration: 0.45, ease: 'back.out(2.5)' }], immediateRender: false }, tNo - 0.1);
  sfx('thud', tNo + 0.2, { g: 1, p: -0.2 }); shake(root, tNo + 0.2, 14);
  const lNo = tag(world, 'k', 'JSON 语法里没有注释', 300, DOC.y + 5 * DOC.lh); stamp(lNo, tNo + 0.5);
  slabIn(root, s.end);
  hold(cam, s, 1, s.start + 0.9);
});
