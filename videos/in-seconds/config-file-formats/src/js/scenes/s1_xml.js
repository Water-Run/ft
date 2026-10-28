// 第 2 幕：XML。成对标签夹住数据 → 一层套一层 → 属性与校验 → 标签比数据长（实测字数，research/lab/formats.out.txt）。
scene('xml', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  blk(world, 'bg-paper', -100, -100, 2120, 1170);

  // ── b1：两条斜线交叉；红色巨字 XML 顶破左上角 ──
  const k1 = slash(world, 600, 1000, 2100, 240, 46, 'bg-ink'); cut(k1, s.start + 0.1, 0.35);
  const r1 = slash(world, 380, -60, 1500, 1040, 22, 'bg-ac'); cut(r1, s.start + 0.3, 0.35);
  const G = giant(world, 'XML', { x: 70, y: 400, size: 230, grow: 1.3, rot: -12, cls: 'ac' });
  giantIn(G, s.start + 0.2, 0.11);
  const yr = tag(world, 'k', '1998 · W3C 推荐标准', 120, 430); stamp(yr, s.start + 0.9);
  const pair = code(world, '&lt;标签&gt; … &lt;/标签&gt;', 120, 510, 52, 'ink');
  wipe(pair, W('b1b', '成对'), { dir: 'l', d: 0.4 }); sfx('tick', W('b1b', '成对'), { g: 0.6 });

  // ── b2：<port> 与 </port> 从两侧夹住红色的 8080 ──
  const cx = 900, cy = 590;
  const data = h('div', 'abs bg-ac', world); px(data, cx + 300, cy, 230, 100); code(data, '8080', 26, 6, 72, 'paper');
  const open = h('div', 'abs bg-ink', world); px(open, cx, cy, 290, 100); code(open, '&lt;port&gt;', 18, 6, 72, 'paper');
  const close = h('div', 'abs bg-ink', world); px(close, cx + 540, cy, 330, 100); code(close, '&lt;/port&gt;', 18, 6, 72, 'paper');
  const tB2 = W('b2');
  stamp(data, tB2, { sfx: 'pop' });
  slide(open, W('b2', '一头'), { x: -500, d: 0.4, ease: 'power3.out' }); sfx('whoosh', W('b2', '一头'), { g: 0.5 });
  slide(close, W('b2', '一尾'), { x: 500, d: 0.4, ease: 'power3.out' }); sfx('thud', W('b2', '夹') + 0.1, { g: 0.7 });
  const lD = tag(world, 'o', '数据', cx + 340, cy + 120); stamp(lD, W('b2', '夹'), { g: 0.4 });

  // ── b3：外面一层层套上 <server>、<config> ──
  const frame = (x, y, w, hh, name, t) => {
    const f = h('div', 'abs', world); px(f, x, y, w, hh); css(f, { border: '12px solid var(--ink)' });
    const a = tag(world, 'k', `&lt;${name}&gt;`, x, y - 54), b = tag(world, 'k', `&lt;/${name}&gt;`, x + w - 40 - name.length * 21 - 60, y + hh - 6);
    wipe(f, t, { dir: 'l', d: 0.35 }); stamp(a, t + 0.15); stamp(b, t + 0.3, { g: 0.4 });
    return { f, a, b };
  };
  const srv = frame(cx - 40, cy - 70, 950, 290, 'server', W('b3', '大标签'));
  const cfg = frame(cx - 90, cy - 190, 1050, 480, 'config', W('b3', '小标签'));
  const tree = code(world, 'config\n └ server\n    └ port', 120, 690, 40, 'ink');
  wipe(tree, W('b3', '树状'), { dir: 't', d: 0.4 }); sfx('tick', W('b3', '树状'), { g: 0.6 });
  clearOut(pair, W('b3', '树状'));

  // ── b4：标签里切出属性；配上文档类型定义，逐项校验 ──
  const attr = tag(world, 'r', '<span class="mono">name="web"</span>', cx + 230, cy - 134);
  stamp(attr, W('b4', '属性'), { sfx: 'pop' });
  const lA = tag(world, 'o', '属性', cx + 480, cy - 124); stamp(lA, W('b4', '属性') + 0.25, { g: 0.4 });
  const dtd = code(world, '&lt;!ELEMENT port (#PCDATA)&gt;', 120, 850, 32, 'ink');
  const tD = W('b4b', '文档');
  wipe(dtd, tD, { dir: 'l', d: 0.4 }); sfx('tick', tD, { g: 0.6 });
  const ok = tag(world, 'r', '校验通过', 660, 838); stamp(ok, W('b4b', '校验'));

  // ── b5：每个数据都得有头有尾：标签块成对亮成红色 ──
  const heads = [open, srv.a, cfg.a], tails = [close, srv.b, cfg.b];
  heads.forEach((e, i) => classAt(e, 'bg-ac', W('b5', '有头') + i * 0.08, W('b6')));
  tails.forEach((e, i) => classAt(e, 'bg-ac', W('b5', '有尾') + i * 0.08, W('b6')));
  sfx('pop', W('b5', '有头'), { g: 0.6 }); sfx('pop', W('b5', '有尾'), { g: 0.6, p: 0.3 });

  // ── b6：标签比数据长：去掉空白后，标签 60 字符，数据 13 字符 ──
  const tB6 = W('b6');
  [tree, dtd, ok].forEach((e) => clearOut(e, tB6 - 0.1));
  const lab = txt(world, 'note', '本例去掉空白后', 120, 700); appear(lab, tB6);
  countBar(world, 120, 760, 60, 11, 'bg-ink', '标签', W('b6', '外面'));
  countBar(world, 120, 830, 13, 11, 'bg-ac', '数据', W('b6', '里面'));
  sfx('tick', W('b6', '外面'), { g: 0.6 }); sfx('tick', W('b6', '里面'), { g: 0.6, p: 0.3 });
  tl.to(data, { scale: 0.78, duration: 0.5, ease: 'power3.inOut' }, W('b6', '一大截'));
  hold(cam, s, -1);
});
