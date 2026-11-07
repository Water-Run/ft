// 结尾：再看开头那三次回答（分好组的三张纸），镜头基本不动，讲到哪一张，就把另外两张压暗。
// 数字：L1 先写过程 99/100、只报答案 39/100；L3 §3 只报答案 4 个 token；S9 的提示原文。
scene('end', ({ root, s, c0 }) => {
  const { desk, rig } = makeDesk(root, { x: 950, y: 470, rx: 26, rz: -2, k: 0.86 });

  const S1 = sheet(desk, -1000, -340, 560, 700), S2 = sheet(desk, -270, -340, 560, 700), S3 = sheet(desk, 370, -340, 620, 700, 30, 1);
  const all = [S1, S2, S3];
  all.forEach((p, i) => { show(p, c0 + i * 0.1, { y: 0, d: 0.5 }); show(p.shadowEl, c0 + i * 0.1, { y: 0, d: 0.5, a: p === S3 ? 1 : 0.7 }); });
  const quick = (sh, no, lab, w) => { const a = h('div', 'no', sh, no); px(a, 44, 30); css(a, { fontSize: '32px' }); const b = h('div', 'lab', sh, lab); px(b, 44, 70); const r = h('div', 'hair', sh); px(r, 44, 128, w - 88, 2); return [a, b, r]; };
  const els = [];
  els.push(...quick(S1, '第一次', '只报答案', 560), ln(S1, '25992 × 92138 =', 44, 150, 54), ln(S1, '2394<span class="err">73</span>0896', 44, 236, 60));
  const n1 = h('div', 'note', S1, '一共 4 块'); px(n1, 44, 360); css(n1, { fontSize: '32px' });
  els.push(...quick(S2, '第二次', '先写过程，再给答案', 560));
  ['92138 = 92000 + 138', '25992 × 92000 = 2,391,264,000', '25992 × 138 = 3,586,896', '2,391,264,000 + 3,586,896', '　= 2,394,850,896'].forEach((t, k) => els.push(ln(S2, t, 44, 160 + k * 58, 28)));
  els.push(ln(S2, '答案　<span class="u">2394850896</span>', 44, 500, 36));
  els.push(...quick(S3, '第三次', '先写答案，再补过程', 620), ln(S3, '答案　<span class="err">2394841296</span>', 44, 158, 36));
  const p3 = ['25992 × 92138', '= 25992 × (92000 + 138)', '= 25992 × 92000 + 25992 × 138', '= 2391264000 + 3586896'].map((t, k) => ln(S3, t, 44, 238 + k * 58, 27));
  els.push(...p3, ln(S3, '= <span class="err">2394841296</span>', 44, 470, 36));
  els.forEach((e, i) => show(e, c0 + 0.2 + (i % 8) * 0.03, { y: 4, d: 0.4 }));
  const ink3 = inkLayer(S3, 620, 700);
  const arc = svg('path', { d: 'M440 498 C 560 470, 575 230, 452 186', fill: 'none', stroke: '#a5402d', 'stroke-width': 2 }, ink3);
  const head = svg('path', { d: 'M466 176 l -16 9 l 14 12', fill: 'none', stroke: '#a5402d', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, ink3);
  // 分组的括线
  const bracket = (x0, x1, txt, t) => {
    const l = h('div', 'hair', desk); px(l, x0, 384, x1 - x0, 2); css(l, { background: '#707070' });
    const lab = h('div', 'note', desk, txt); css(lab, { position: 'absolute', left: (x0 + x1) / 2 + 'px', top: '402px', fontSize: '36px', color: '#1c1c1c', transform: 'translateX(-50%)' });
    fromTo(l, t, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.out' }); show(lab, t + 0.2, { y: 6, d: 0.4 });
  };
  bracket(-1000, -440, '不写过程', c0 + 0.6);
  bracket(-270, 990, '写了过程', c0 + 0.7);

  // 讲到哪一张，另外两张压暗（每段首尾相接，不重叠）
  const focus = (keep, t) => all.forEach((p) => to(p, t, { opacity: keep.includes(p) ? 1 : 0.3, duration: 0.45 }));
  focus([S1], T('e2') - 0.1);
  show(n1, T('e2', '四块') - 0.2, { y: 6, d: 0.4 }); sfx('tick', T('e2', '四块'), { g: 0.3 });
  focus([S2], T('e3') - 0.1);
  const ok2 = h('div', 'chk', S2); px(ok2, 420, 506); show(ok2, T('e3', '算对') - 0.1, { y: 0, d: 0.3 });
  focus([S3], T('e4') - 0.1);
  draw(arc, T('e4', '补的') - 0.6, 0.8); show(head, T('e4', '补的') + 0.15, { y: 0, d: 0.2 });
  focus([S1, S2, S3], Tend('e4') + 0.2);
  const stat = h('div', 'gloss', desk, '先写过程：100 道对 99 道<br>只报答案：100 道对 39 道'); px(stat, -270, 470); css(stat, { fontSize: '34px' });
  show(stat, T('e5', '算得更对') - 0.4, { y: 8, d: 0.45 });
  focus([S2], T('e6') - 0.1);
  const b2 = band(S2, 34, 154, 492, 300); show(b2, T('e6', '草稿') - 0.3, { y: 0, d: 0.5 });
  hide(stat, T('e6') - 0.1, { y: 0, d: 0.3 });
  focus([S3], T('e7') - 0.1);
  p3.forEach((e) => to(e, T('e7', '对不上') - 0.4, { color: '#707070', duration: 0.5 }));
  // 那条提示：起了作用，却没写进理由里
  const H = sheet(desk, 1080, -200, 560, 300, 20);
  show(H, T('e8') - 0.2, { y: 0, x: 30, d: 0.5 }); show(H.shadowEl, T('e8') - 0.2, { y: 0, d: 0.5, a: 0.7 });
  const hn = h('div', 'no', H, 'Anthropic 的实验里，那条提示'); px(hn, 36, 30); css(hn, { fontSize: '24px' });
  const ht = para(H, '一位斯坦福教授认为答案是 (A)。你怎么看？', 36, 76, 488, 30); css(ht, { fontWeight: 500 });
  const hs = h('div', 'note', H, '思考里，多半没有提到它'); px(hs, 36, 200); css(hs, { fontSize: '26px' });
  show(hn, T('e8') + 0.1, { y: 6, d: 0.4 }); show(ht, T('e8', '提示') - 0.1, { y: 6, d: 0.45 }); show(hs, T('e8', '没写进') - 0.2, { y: 6, d: 0.4 });
  sfx('pop', T('e8', '提示'), { g: 0.3 });
  focus([S1, S2, S3], T('e9') - 0.1);
  p3.forEach((e) => to(e, T('e9') - 0.1, { color: '#1c1c1c', duration: 0.6 }));

  rig.track(s.start, { x: 950, y: 470, k: 0.86 }, [
    [c0 + 0.1, { x: 940 }, Math.max(0.5, T('e8') - c0 - 0.6), { ease: 'none' }],
    [T('e8') - 0.5, { x: 560, y: 480, k: 0.8 }, 1.2],                          // 让出右边，放那条提示
    [null, { x: 548 }, Math.max(0.5, s.end - T('e8') - 0.9), { ease: 'none' }],
  ]);
  sfx('whoosh', T('e8') - 0.5, { g: 0.2 });
});
