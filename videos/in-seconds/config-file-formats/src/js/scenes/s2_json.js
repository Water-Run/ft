// 第 3 幕：JSON。闭合标签被一刀切落 → 大括号包裹、字数变少（实测 73 → 43）→ 自带类型 → JSONL 逐行一条 → 没有注释。
scene('json', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  blk(world, 'bg-paper', -100, -100, 2120, 1170);

  // ── c1：一道黑斜线劈下，闭合标签被切落；JSON 巨字斜撑底部 ──
  const closes = ['&lt;/port&gt;', '&lt;/host&gt;', '&lt;/server&gt;', '&lt;/config&gt;'].map((t, i) => { const b = h('div', 'abs bg-ink', world); px(b, 1000 + (i % 2) * 420, 140 + i * 92, 380, 76); code(b, t, 18, 4, 54, 'paper'); return b; });
  closes.forEach((b, i) => appear(b, s.start + 0.1 + i * 0.06));
  const tCut = W('c1', '砍掉');
  const k = slash(world, 930, -60, 990, 1000, 30, 'bg-ink'); cut(k, tCut, 0.25);
  closes.forEach((b, i) => tl.to(b, { y: 900, rotation: (i % 2 ? 14 : -18), duration: 0.6, ease: 'power3.in' }, tCut + 0.2 + i * 0.05));
  sfx('thud', tCut + 0.7, { g: 0.8, p: -0.3 });
  const G = giant(world, 'JSON', { x: 70, y: 1000, size: 210, grow: 1.22, rot: -8, cls: 'ink' });
  giantIn(G, s.start + 0.3, 0.1);
  const yr = tag(world, 'k', '2001 · Douglas Crockford', 120, 140); stamp(yr, W('c1', '提出'));

  // ── c2：大括号层层包裹；同一段配置字数变少 ──
  const js = code(world, '<span class="r">{</span>\n  "server": <span class="r">{</span>\n    "port": 8080,\n    "host": "localhost"\n  <span class="r">}</span>\n<span class="r">}</span>', 1020, 130, 50, 'ink');
  const tBr = W('c2', '大括号');
  wipe(js, tBr, { dir: 't', d: 0.45 }); sfx('tick', tBr, { g: 0.6 });
  const tShort = W('c2', '短了');
  const lab = txt(world, 'note', '同一段配置，去掉空白后的字符数', 120, 230); appear(lab, tShort - 0.3);
  countBar(world, 120, 290, 73, 8, 'bg-ink', 'XML', tShort - 0.3);
  countBar(world, 120, 360, 43, 8, 'bg-ac', 'JSON', tShort);
  sfx('pop', tShort, { g: 0.7 });

  // ── c3：类型直接写在值上 ──
  const chips = [['数字', 'k', '8080'], ['字符串', 'r', '"web"'], ['布尔值', 'u', 'true'], ['数组', 'o', '[ ]'], ['对象', 'o', '{ }']];
  let cx = 120;
  chips.forEach(([w, c, v], i) => {
    if (i === 3) cx = 120;                                  // 两行：避开竖向的斜线
    const e = tag(world, c, `<span class="mono">${v}</span> ${w}`, cx, i < 3 ? 470 : 540); cx += 50 + (v.length * 20 + w.length * 32 + 40);
    stamp(e, W('c3', w), { sfx: 'pop', g: 0.5 });
  });

  // ── c4：L 砸下；每行一个完整的 JSON 值，一条一条滑进来 ──
  const tL = W('c4', '.jsonl');
  const Lbig = txt(world, 'giant ac', 'L', 1180, 610); Lbig.style.fontSize = '400px'; gsap.set(Lbig, { rotation: -8 });
  slam(Lbig, tL, { from: 1.8, d: 0.3, ease: 'power4.out' }); sfx('thud', tL, { g: 1, p: -0.5 });
  const tC4 = W('c4'); clearOut(k, tC4);
  [js, lab].forEach((e) => clearOut(e, tC4)); world.querySelectorAll('.tag, .bar-l, .blk.bg-ink, .blk.bg-ac').forEach((e) => { if (e !== yr && e.parentNode === world && e !== k) clearOut(e, tC4); });
  const lines = ['{"t":"09:00:01","msg":"start"}', '{"t":"09:00:02","msg":"listen 8080"}', '{"t":"09:00:05","msg":"request /"}', '{"t":"09:00:07","msg":"request /a"}'];
  const bands = lines.map((l, i) => {
    const b = h('div', 'abs ' + (i % 2 ? 'bg-ac' : 'bg-ink'), world); px(b, 760, 150 + i * 96, 1300, 80); gsap.set(b, { rotation: -4 });
    code(b, l, 40, 8, 44, 'paper'); return b;
  });
  const tLine = [W('c4', '每行'), W('c4', '完整'), W('c4b', '逐条'), W('c4b', '记录')];
  bands.forEach((b, i) => { slide(b, tLine[i], { x: 900, d: 0.4, ease: 'power3.out' }); sfx('whoosh', tLine[i], { g: 0.4, p: 0.2 * i }); });
  const lLog = tag(world, 'k', '日志：一行一条', 760, 600); stamp(lLog, W('c4b', '日志'));

  // ── c5：满屏引号与括号；「# 注释」刺进来，被挡在外面 ──
  const tC5 = W('c5');
  bands.forEach((b) => clearOut(b, tC5)); clearOut(lLog, tC5); clearOut(Lbig, tC5);
  const dense = code(world, '<span class="r">{"</span>server<span class="r">":{"</span>port<span class="r">":</span>8080<span class="r">,"</span>host<span class="r">":"</span>localhost<span class="r">"}}</span>', 160, 220, 60, 'ink');
  wipe(dense, W('c5', '引号'), { dir: 'l', d: 0.4 }); sfx('tick', W('c5', '引号'), { g: 0.6 });
  const wall = blk(world, 'bg-ink', 1420, 330, 40, 330);
  const note = tag(world, 'r big', '# 注释', 1480, 450);
  const tNo = W('c5', '没有');
  appear(wall, tNo - 0.2);
  tl.fromTo(note, { autoAlpha: 1, x: 700 }, { keyframes: [{ x: -10, duration: 0.3, ease: 'power3.in' }, { x: 90, rotation: 6, duration: 0.4, ease: 'back.out(2.5)' }], immediateRender: true }, tNo);
  sfx('thud', tNo + 0.3, { g: 0.9, p: -0.2 });
  const lNo = tag(world, 'k', 'JSON 语法里没有注释', 160, 380); stamp(lNo, Q(Tend('c5')) - 0.4);
  hold(cam, s, 1);
});
