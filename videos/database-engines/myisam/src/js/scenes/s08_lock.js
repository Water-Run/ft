// 08 并发：表锁。时间轴上的条 = 某个连接持有锁（实心）或在排队（斜纹）
scene('s8', ({ root, s, c0 }) => {
  const GX = 430, GW = 1250, UNIT = GW / 10, LH = 66, GY = 96;
  const st = document.createElement('style');
  st.textContent = `
  .gp { position:absolute; left:96px; top:128px; width:1728px; height:${GY + 4 * LH + 30}px; }
  .lane { position:absolute; left:0; right:0; height:${LH}px; border-top:1px solid var(--line); }
  .lane-n { position:absolute; left:30px; top:0; height:${LH}px; display:flex; align-items:center; gap:16px; font-size:23px; letter-spacing:.08em; color:var(--dim); }
  .lane-n b { font-family:var(--mono); font-weight:500; color:var(--pale); font-size:22px; letter-spacing:0; }
  .bar { position:absolute; height:38px; border-radius:6px; overflow:hidden; display:flex; align-items:center; padding-left:12px; font-family:var(--mono); font-size:18px; white-space:nowrap; }
  .bar.r { background:rgba(25,169,201,.34); box-shadow:inset 0 0 0 1.5px var(--blue-hi); color:#d3f1f8; }
  .bar.w { background:rgba(242,145,17,.36); box-shadow:inset 0 0 0 1.5px var(--orange); color:#ffe2b8; }
  .bar.q { background:repeating-linear-gradient(135deg, rgba(159,220,234,.16) 0 6px, rgba(159,220,234,.04) 6px 12px); box-shadow:inset 0 0 0 1px rgba(159,220,234,.3); color:var(--faint); font-family:var(--sans); letter-spacing:.2em; font-size:16px; }
  .ph { position:absolute; top:${GY - 14}px; width:2px; height:${4 * LH + 22}px; background:var(--pale); box-shadow:0 0 14px rgba(159,220,234,.9); }
  .gaxis { position:absolute; left:${GX}px; top:${GY - 40}px; width:${GW}px; text-align:right; font-family:var(--mono); font-size:17px; color:var(--faint); letter-spacing:.1em; }
  .lock { position:absolute; left:30px; top:22px; display:flex; align-items:center; gap:16px; font-size:26px; letter-spacing:.1em; }
  .lock svg { width:34px; height:34px; }
  .lock b { font-family:var(--mono); font-weight:500; color:var(--orange-hi); letter-spacing:0; }
  .lgd8 { position:absolute; left:96px; top:${128 + GY + 4 * LH + 56}px; display:flex; gap:44px; font-size:22px; letter-spacing:.06em; color:var(--dim); align-items:center; white-space:nowrap; }
  .lgd8 i { display:inline-block; width:44px; height:20px; border-radius:4px; margin-right:12px; vertical-align:-3px; }
  .lgd8 small { font-family:var(--mono); font-size:16px; color:var(--faint); margin-left:10px; }
  .ci { position:absolute; left:96px; top:570px; width:1728px; height:310px; }
  .ci-rib { position:absolute; left:30px; top:124px; display:flex; gap:5px; }
  .ci-rib i { width:60px; height:60px; border-radius:6px; display:block; background:rgba(111,224,182,.16); box-shadow:inset 0 0 0 1px rgba(111,224,182,.45); }
  .ci-rib i.new { background:rgba(242,145,17,.34); box-shadow:inset 0 0 0 1.5px var(--orange); }
  .ci-end { position:absolute; top:100px; width:2px; height:108px; background:var(--pale); }
  .ci-cur { position:absolute; top:116px; width:76px; height:76px; border-radius:9px; border:2.5px solid var(--cyan); box-shadow:0 0 26px rgba(70,203,230,.7); }
  .verdict { position:absolute; left:0; right:0; top:660px; text-align:center; font-size:38px; letter-spacing:.14em; font-weight:500; }
  .verdict small { display:block; margin-top:14px; font-size:24px; font-weight:400; letter-spacing:.1em; color:var(--dim); }
  `;
  root.appendChild(st);

  const gp = h('div', 'panel gp', root);
  const lock = h('div', 'lock', gp, `<svg viewBox="0 0 34 34"><rect x="5" y="15" width="24" height="16" rx="3" fill="rgba(242,145,17,.25)" stroke="#f29111" stroke-width="2"/><path d="M10 15v-4a7 7 0 0 1 14 0v4" fill="none" stroke="#f29111" stroke-width="2"/></svg><span>表 <b>users</b></span><span class="dim" style="font-size:22px">整张表一把锁</span>`);
  h('div', 'gaxis', gp, '时间 →');
  const names = [['连接 A', 'SELECT'], ['连接 B', 'SELECT'], ['连接 C', 'UPDATE'], ['连接 D', 'SELECT']];
  const lanes = names.map(([a, b], i) => { const l = h('div', 'lane', gp); l.style.top = (GY + i * LH) + 'px'; const n = h('div', 'lane-n', l, `<span>${a}</span><b>${b}</b>`); return { l, n, stmt: n.querySelector('b') }; });
  show(gp, c0 + 0.05, { y: 24, d: 0.7 });
  gsap.set(lock.children, { autoAlpha: 0 });
  tl.to(lock.children[1], { autoAlpha: 1, duration: 0.4 }, c0 + 0.3);
  fromTo(lock.children[0], T('k2', '加锁') - 0.25, { autoAlpha: 0, scale: 2.2, y: -10 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(2.5)' });
  tl.to(lock.children[2], { autoAlpha: 1, duration: 0.4 }, T('k2', '加锁') + 0.1);
  fromTo(lanes.map((x) => x.n), T('k1') - 0.1, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.12 });

  // 一组条 + 一根播放头；条的可见宽度由播放头位置决定
  const makeSet = (bars, pos, tIn, tOut, stmts) => {
    const g = h('div', 'abs', gp); css(g, { left: 0, top: 0, width: '100%', height: '100%' });
    const ph = h('div', 'ph', g);
    const els = bars.map(([lane, a, b, kind, label]) => { const e = h('div', 'bar ' + kind, g, label || ''); css(e, { left: (GX + a * UNIT) + 'px', top: (GY + lane * LH + (LH - 38) / 2) + 'px' }); return { e, a, b }; });
    gsap.set(g, { autoAlpha: 0 });
    tl.to(g, { autoAlpha: 1, duration: 0.35 }, tIn);
    if (tOut) tl.to(g, { autoAlpha: 0, duration: 0.35 }, tOut);
    F((t) => {
      const p = pos(t);
      ph.style.left = (GX + p * UNIT) + 'px';
      for (const { e, a, b } of els) { const w = clamp(p - a, 0, b - a) * UNIT; e.style.width = w.toFixed(1) + 'px'; e.style.visibility = w < 3 ? 'hidden' : ''; e.style.paddingLeft = w < 60 ? '0' : '12px'; e.style.color = w < 70 ? 'transparent' : ''; }
    });
    if (stmts) stmts.forEach((sx, i) => keyed(lanes[i].stmt).at(tIn, { html: sx }));
    return g;
  };
  const seg = (pts) => (t) => { if (t <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], (t - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0])); return pts[pts.length - 1][1]; };

  // ① k3 读锁共享 → k4 写锁独占
  makeSet([
    [0, 0.3, 3.3, 'r', '读'], [1, 0.8, 3.8, 'r', '读'], [3, 1.3, 4.2, 'r', '读'],
    [2, 2.2, 4.2, 'q', '等待'], [2, 4.2, 6.6, 'w', '写 · 独占'],
    [0, 4.8, 6.6, 'q', '等待'], [0, 6.6, 8.6, 'r', '读'],
    [1, 5.4, 6.6, 'q', '等待'], [1, 6.6, 9.0, 'r', '读'],
  ], seg([[T('k3') - 0.2, 0], [Tend('k3') + 0.3, 2.2], [T('k4') + 0.2, 2.4], [T('k4', '一个连接') , 4.6], [Tend('k4') + 0.5, 9.4]]), T('k3') - 0.3, T('k8') - 0.4);

  const lg = h('div', 'lgd8', root, '<span><i style="background:rgba(25,169,201,.4);box-shadow:inset 0 0 0 1.5px #19a9c9"></i>读锁 · 共享<small>TL_READ</small></span><span><i style="background:rgba(242,145,17,.4);box-shadow:inset 0 0 0 1.5px #f29111"></i>写锁 · 独占<small>TL_WRITE</small></span><span><i style="background:repeating-linear-gradient(135deg, rgba(159,220,234,.3) 0 5px, rgba(159,220,234,.06) 5px 10px)"></i>排队等待</span>');
  gsap.set(lg.children, { autoAlpha: 0 });
  tl.to(lg.children[0], { autoAlpha: 1, duration: 0.4 }, T('k3', '读锁') - 0.1);
  tl.to([lg.children[1], lg.children[2]], { autoAlpha: 1, duration: 0.4, stagger: 0.5 }, T('k4', '写锁') - 0.1);

  // ② k5–k7 例外：并发插入
  const ci = h('div', 'panel ci', root);
  h('div', 'panel-hd', ci, '<span>并发插入</span><span class="r">concurrent_insert = AUTO</span>');
  const rib = h('div', 'ci-rib', ci);
  const N0 = 16, cellsEl = [];
  for (let i = 0; i < 22; i++) cellsEl.push(h('i', i >= N0 ? 'new' : '', rib));
  const endX = 30 + N0 * 65 - 3;
  const end = h('div', 'ci-end', ci); end.style.left = endX + 'px';
  const endT = h('div', 'tag c-pale', ci, '查询开始时的文件末尾'); css(endT, { left: (endX + 12) + 'px', top: '62px', fontSize: '20px', transform: 'translateX(-100%)', textAlign: 'right' });
  const cur = h('div', 'ci-cur', ci);
  const curT = h('div', 'tag c-cyan', ci, 'SELECT 读到末尾为止'); px(curT, 30, 216); css(curT, { fontSize: '21px' });
  const insT = h('div', 'tag c-orange', ci, 'INSERT 只追加在末尾之后'); px(insT, endX + 20, 216); css(insT, { fontSize: '21px' });
  const cond = h('div', 'tag dim', ci, '前提：文件中间没有空位<small>dellink = ff…ff</small>'); css(cond, { right: '30px', top: '62px', fontSize: '20px' });
  gsap.set(cellsEl.slice(N0), { autoAlpha: 0 });
  gsap.set([cur, curT, insT, end, endT, cond], { autoAlpha: 0 });
  show(ci, T('k5') - 0.3, { y: 24, d: 0.6 });
  tl.to(lg, { autoAlpha: 0, duration: 0.3 }, T('k5') - 0.4);
  tl.to(gp, { autoAlpha: 0.35, duration: 0.5 }, T('k5') - 0.2);
  fromTo(cellsEl.slice(0, N0), T('k6') - 0.3, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.25, stagger: 0.025 });
  tl.to(cond, { autoAlpha: 1, duration: 0.4 }, T('k6', '没有空位') - 0.2);
  tl.to([end, endT], { autoAlpha: 1, duration: 0.4 }, T('k6', '末尾') - 0.4);
  const tk7 = T('k7') - 0.1, tk7e = Tend('k7') + 0.5;
  tl.to([cur, curT], { autoAlpha: 1, duration: 0.3 }, tk7);
  F((t) => { const k = ease.io3(clamp((t - tk7) / (tk7e - tk7))); cur.style.left = (30 - 8 + k * (N0 - 1) * 65) + 'px'; });
  tl.to(insT, { autoAlpha: 1, duration: 0.3 }, T('k7', '插入') - 0.1);
  cellsEl.slice(N0, N0 + 5).forEach((c, i) => { fromTo(c, T('k7', '插入') + i * 0.55, { autoAlpha: 0, y: -30 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' }); });

  // ③ k8 读多写少 / k9 写入一多
  const t8 = T('k8') - 0.4;
  hide(ci, t8, { y: 16, d: 0.4 });
  tl.to(gp, { autoAlpha: 1, duration: 0.5 }, t8 + 0.1);
  const rd = [];
  for (let l = 0; l < 4; l++) for (let j = 0; j < 4; j++) { const a = 0.2 + j * 2.3 + l * 0.35 + (j % 2) * 0.2; rd.push([l, a, Math.min(a + 2.05, 9.7), 'r', '读']); }
  makeSet(rd, seg([[T('k8') - 0.2, 0], [Tend('k8') + 0.25, 9.8]]), t8 + 0.3, T('k9') - 0.35, ['SELECT', 'SELECT', 'SELECT', 'SELECT']);
  const v1 = h('div', 'verdict', root, '读多写少<small>读锁互不阻塞，加锁本身的开销很小</small>');
  show(v1, T('k8', '开销') - 0.5, { y: 16, d: 0.6 });
  hide(v1, T('k9') - 0.3, { y: -10, d: 0.3 });
  const wr = [[0, 0.2, 1.9, 'w', '写'], [1, 0.5, 1.9, 'q', '等待'], [1, 1.9, 3.6, 'w', '写'], [2, 0.8, 3.6, 'q', '等待'], [2, 3.6, 5.3, 'w', '写'], [3, 1.1, 5.3, 'q', '等待'], [3, 5.3, 7.0, 'w', '写'], [0, 2.6, 7.0, 'q', '等待'], [0, 7.0, 8.7, 'w', '写'], [1, 4.2, 8.7, 'q', '等待'], [1, 8.7, 9.9, 'w', '写']];
  makeSet(wr, seg([[T('k9') - 0.2, 0], [Tend('k9') + 0.6, 9.9]]), T('k9') - 0.3, null, ['UPDATE', 'INSERT', 'UPDATE', 'DELETE']);
  const v2 = h('div', 'verdict', root, '<span class="c-orange">写入一多</span><small>同一时刻只有一个连接能写，其余全部排队</small>');
  show(v2, T('k9', '瓶颈') - 0.6, { y: 16, d: 0.6 });
});
