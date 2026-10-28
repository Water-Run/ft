// 第 5 幕：TOML，然后收尾。方括号里加一颗圆点就是多一层 → 缩进不算数、有注释、有类型 → 五种格式在「机器好解析」与「人好读写」之间找平衡。
scene('toml', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  blk(world, 'bg-paper', -100, -100, 2120, 1170);

  // ── e1：一红一黑两条斜线切出三角；TOML 巨字撑起左侧 ──
  const kb = slash(world, -100, 980, 1000, -60, 40, 'bg-ink'); cut(kb, s.start + 0.05, 0.3);
  const rb = slash(world, 420, -60, 980, 1040, 24, 'bg-ac'); cut(rb, s.start + 0.2, 0.3);
  const A = h('div', 'abs', world); px(A, 0, 0, 1920, 968);
  const G = giant(A, 'TOML', { x: 90, y: 985, size: 190, grow: 1.24, rot: -18, cls: 'ink' });
  giantIn(G, s.start + 0.25, 0.1);
  const yr = tag(A, 'k', '2013', 1600, 150); stamp(yr, s.start + 0.8);
  const two = txt(A, 'say', '直观 <span class="ac">+</span> 严谨', 1300, 230); wipe(two, W('e1', '直观'), { dir: 'l', d: 0.4 });

  // ── e2：[server] 落回纸面；一颗红圆点切进去，变成 [server.db] ──
  const X = 1060;
  const sec = h('div', 'abs bg-ink', A); px(sec, X, 340, 560, 112);
  const st = code(sec, '[server<span class="dot"></span>]', 30, 4, 84, 'paper');
  const tSec = W('e2', '方括号');
  stamp(sec, tSec, { from: 1.3 });
  const fromIni = txt(A, 'note', '和 .ini 一样的方括号', X, 290); appear(fromIni, tSec + 0.2);
  const dot = svg('svg', { class: 'abs', width: 70, height: 70, viewBox: '0 0 70 70' }, A); px(dot, X + 420, 160); svg('circle', { cx: 35, cy: 35, r: 35, fill: C.ac }, dot);
  const tDot = W('e2b', '圆点');
  tl.fromTo(dot, { autoAlpha: 1, y: -260 }, { y: 210, duration: 0.35, ease: 'power3.in', immediateRender: true }, tDot);
  vanish(dot, tDot + 0.4); sfx('thud', tDot + 0.35, { g: 0.8 });
  swapAt(st, '[server]', '[server<span class="r">.</span>db]', tDot + 0.35);
  tl.to(sec, { width: 720, duration: 0.25, ease: 'back.out(2)' }, tDot + 0.35);
  const tr2 = txt(A, 'note', '= server 里面的 db 表', X, 470);
  appear(tr2, W('e2b', '多层'));
  vanish(fromIni, tDot);

  // ── e3：缩进不影响结构；注释；类型 ──
  const rows = [code(A, 'port = 8080', X, 540, 56, 'ink'), code(A, 'host = "localhost"', X, 620, 56, 'ink')];
  const tE3 = W('e3');
  rows.forEach((r, i) => stamp(r, tE3 + i * 0.15, { g: 0.4 }));
  tl.to(rows[1], { x: 3 * 33.6, duration: 0.3, ease: 'power3.inOut' }, W('e3', '影响'));
  const same = tag(A, 'o', '结构不变', X + 560, 540); stamp(same, W('e3', '结构'), { g: 0.4 });
  const cmt = tag(A, 'r big', '# 端口设置', X, 720);
  stamp(cmt, W('e3', '注释'), { sfx: 'pop' });
  const ty1 = tag(A, 'k', '整数', X + 360, 736), ty2 = tag(A, 'r', '字符串', X + 500, 730);
  stamp(ty1, W('e3', '数据类型')); stamp(ty2, W('e3', '数据类型') + 0.2);

  // ── e4：一根粗黑大梁架在红三角上，左右摆动后找到平衡 ──
  const tE4 = W('e4');
  clearOut(A, tE4 - 0.1); clearOut(kb, tE4 - 0.1); clearOut(rb, tE4 - 0.1);
  const B = h('div', 'abs', world); px(B, 0, 0, 1920, 968);
  const tri = poly(B, [[960, 470], [1240, 900], [680, 900]], 'ac');
  wipe(tri, tE4, { dir: 'b', d: 0.35 });
  const beam = blk(B, 'bg-ink', 60, 430, 1800, 44); beam.dataset.overlapOk = '1';
  tl.fromTo(beam, { scaleX: 0, rotation: 0 }, { scaleX: 1, duration: 0.35, ease: 'power3.out', immediateRender: true }, tE4 + 0.1);
  tl.to(beam, { keyframes: [{ rotation: -6, duration: 0.5, ease: 'power2.inOut' }, { rotation: 5, duration: 0.6, ease: 'power2.inOut' }, { rotation: 0, duration: 0.6, ease: 'power2.inOut' }], transformOrigin: '50% 100%' }, W('e4', '两端'));
  sfx('thud', tE4 + 0.3, { g: 0.8 }); sfx('whoosh', W('e4', '两端'), { g: 0.4 }); sfx('whoosh', W('e4', '平衡'), { g: 0.4, p: 0.3 });

  // ── e5：左端机器好解析（XML、JSON），右端人好读写（INI、YAML、TOML） ──
  const lm = txt(B, 'say', '机器好解析', 100, 300), lh = txt(B, 'say ac', '人好读写', 1500, 300);
  const left = txt(B, 'giant ink', 'XML JSON', 90, 500), right = txt(B, 'giant ac', 'INI YAML TOML', 1060, 500);
  left.style.fontSize = '110px'; right.style.fontSize = '110px'; left.dataset.overlapOk = right.dataset.overlapOk = '1';
  stamp(lm, W('e5', '机器')); slide(left, W('e5', '机器') + 0.2, { y: -60, d: 0.35, ease: 'power3.out' });
  stamp(lh, W('e5', '人类')); slide(right, W('e5', '人类') + 0.2, { y: -60, d: 0.35, ease: 'power3.out' });
  // 先只压上机器这一端，梁向左沉；人这一端放上去后，梁慢慢回到水平
  tl.to(beam, { rotation: -3, transformOrigin: '50% 100%', duration: 0.6, ease: 'power2.out' }, W('e5', '机器') + 0.25);
  tl.to(beam, { rotation: 0, transformOrigin: '50% 100%', duration: 2.2, ease: 'power2.inOut' }, W('e5', '人类') + 0.25);

  // ── e6：红黑色块咬合；「只需改动配置」斜撑全屏 ──
  const tE6 = W('e6');
  clearOut(B, tE6);
  const C6 = h('div', 'abs', world); px(C6, 0, 0, 1920, 968);
  const pr = poly(C6, [[0, 0], [1920, 0], [1920, 300], [0, 640]], 'ac'), pk = poly(C6, [[0, 640], [1920, 300], [1920, 360], [0, 700]], 'ink');
  wipe(pr, tE6, { dir: 'l', d: 0.45 }); wipe(pk, tE6 + 0.15, { dir: 'r', d: 0.4 }); sfx('whoosh', tE6, { g: 0.7 });
  // 无论选哪一种：五个格式名依次盖上；作用都一样
  ['.ini', '.xml', '.json', '.yaml', '.toml'].forEach((n, i) => { const e = tag(C6, 'k', n, 120 + i * 190, 280); stamp(e, W('e6', '选哪') + i * 0.18, { g: 0.35 }); });
  const alike = txt(C6, 'say paper', '作用一样', 1100, 262); stamp(alike, W('e6', '一样'));
  const codeNo = txt(C6, 'say paper', '代码不动', 120, 160); stamp(codeNo, W('e6', '不必'));
  const G6 = giant(C6, '只需改动配置', { x: 130, y: 950, size: 120, grow: 1.16, rot: -10, cls: 'cn-giant ink' });
  giantIn(G6, W('e6', '只需'), 0.08);
  hudGround('L', tE6 + 0.2, s.end, 'ac');
  hold(cam, s, 1);
});
