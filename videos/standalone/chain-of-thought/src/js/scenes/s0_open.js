// 开场：同一个模型、同一道题的三次回答，摊成桌上的三张纸（主线，第 02、04 章与结尾都回到这里）。
// 数字取自 research/lab（L1 n5-03）：只报答案 2394730896；先写过程的部分积与和；先写答案 2394841296。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  makeCamera(world);                              // 引擎镜头不动；运动由 rig 完成
  const { view, desk, rig } = makeDesk(world, { x: 2380, y: 880, rx: 26, rz: -2, k: 2.2 });

  // ── 三张纸 ──
  const S1 = sheet(desk, -900, -340, 560, 700), S2 = sheet(desk, -290, -340, 560, 700), S3 = sheet(desk, 320, -340, 620, 700, 30, 1);
  [S1, S2, S3].forEach((p, i) => { show(p, c0 + 0.05 + i * 0.12, { y: 0, d: 0.5 }); show(p.shadowEl, c0 + 0.05 + i * 0.12, { y: 0, d: 0.5, a: p === S3 ? 1 : 0.7 }); });

  // 第一次：只报答案
  // 题目跟着旁白一段段写出来（逗号后的第一个字时间偏早，取下一个字再提前一点）
  const prob1 = ln(S1, '', 44, 150, 54);
  appear(prob1, T('o1') + 0.05);
  [['259', T('o1') + 0.05], ['92', T('o1', '九十二')], [' × ', T('o1', '以') - 0.12], ['921', T('o1', '九万')], ['38', T('o1', '三十八')], [' =', T('o1', '于') - 0.12]]
    .forEach(([txt, t]) => appear(h('span', '', prob1, esc(txt)), t));
  // 等答案：答案的位置上一个光标在闪，答案一出来就收起
  const cur = h('div', 'abs', S1); px(cur, 46, 246, 3, 54); css(cur, { background: '#1c1c1c' });
  const cOn = T('o1', '于'), cOff = T('o3') + 0.1;
  F((t) => { cur.style.opacity = t >= cOn && t < cOff && Math.floor((t - cOn) * 1.6) % 2 === 0 ? 1 : 0; });
  header(S1, '第一次', '只报答案', 560, T('o2') + 0.15);
  const deep = h('div', 'note', S1, 'DeepSeek · 2026 年 11 月 3 日'); px(deep, 44, 520); css(deep, { fontSize: '24px' });
  show(deep, T('o2', 'DeepSeek') + 0.1, { y: 6, d: 0.5 });
  const ans1 = ln(S1, '', 44, 236, 60); css(ans1, { letterSpacing: '.01em' }); appear(ans1, T('o3') + 0.1);
  const D1 = [...'2394730896'].map((d) => h('span', '', ans1, d));
  [[0, 3], [3, 6], [6, 9], [9, 10]].forEach(([a, b], k) => { for (let i = a; i < b; i++) appear(D1[i], T('o3') + 0.1 + k * 0.16); });
  const ok1 = ln(S1, '正确　2394<span class="hl85">85</span>0896', 44, 346, 28, 'g');
  show(ok1, T('o3', '前') - 0.05, { y: 6, d: 0.45 });
  // 前四位、后四位对上：两段细灰线；中间两位错：朱红
  const under = (i0, i1, t, color) => { const b0 = box(D1[i0], S1), b1 = box(D1[i1], S1); const u = h('div', 'hair', S1); px(u, b0.x, b0.b + 4, b1.r - b0.x, 2); css(u, { background: color }); fromTo(u, t, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power2.out' }); return u; };
  under(0, 3, T('o3', '前'), '#b4b4b4');
  under(6, 9, T('o3', '后'), '#b4b4b4');
  const tErr = T('o4', '中间');
  under(4, 5, tErr, '#a5402d');
  [D1[4], D1[5]].forEach((d) => to(d, tErr, { color: '#a5402d', duration: 0.35 }));
  to(ok1.querySelector('.hl85'), tErr, { color: '#1c1c1c', duration: 0.35 });
  sfx('tick', tErr, { g: 0.5 });

  // 第二次：先写过程，再给答案
  header(S2, '第二次', '先写过程，再给答案', 560, T('o5', '第二次'));
  let t2 = T('o5', '算式');
  const L2 = ['92138 = 92000 + 138', '25992 × 92000 = 2,391,264,000', '25992 × 138 = 3,586,896', '2,391,264,000 + 3,586,896', '　= 2,394,850,896'];
  const rows2 = L2.map((txt, k) => { const r = stream(S2, txt, 44, 160 + k * 58, 26, t2, 64); t2 = r.end + 0.05; return r.e; });   // 过程写得快，写完才给答案
  const r2 = h('div', 'hair l', S2); px(r2, 44, 478, 472, 1); fromTo(r2, T('o5', '答案') - 0.1, { scaleX: 0 }, { scaleX: 1, duration: 0.4 });
  const ans2 = ln(S2, '答案　<span class="u">2394850896</span>', 44, 500, 36);
  show(ans2, Math.max(t2 + 0.15, T('o5', '再说')), { y: 6, d: 0.45 });
  const chk2 = h('div', 'chk', S2); px(chk2, 420, 506); show(chk2, T('o6', '算对'), { y: 0, d: 0.3 });
  sfx('tick', T('o6', '算对'), { g: 0.4 });

  // 第三次：先写答案，再补过程
  header(S3, '第三次', '先写答案，再补过程', 620, T('o7', '第三次'));
  const first3 = ln(S3, '答案　<span class="n">2394841296</span>', 44, 158, 36);
  show(first3, T('o7', '先写答案'), { y: 6, d: 0.45 });
  let t3 = T('o8', '拆分');
  const L3 = ['25992 × 92138', '= 25992 × (92000 + 138)', '= 25992 × 92000 + 25992 × 138', '= 2391264000 + 3586896'];
  L3.forEach((txt, k) => { const r = stream(S3, txt, 44, 238 + k * 58, 27, t3, 60); t3 = r.end + 0.05; });
  const chk = h('div', 'chk', S3); px(chk, 520, 418); show(chk, T('o8', '没问题'), { y: 0, d: 0.3 });
  const last3 = ln(S3, '= <span class="n">2394841296</span>', 44, 470, 36);
  show(last3, T('o9', '加完'), { y: 6, d: 0.4 });
  const tBack = T('o9', '错数') - 0.2;
  [first3, last3].forEach((e) => to(e.querySelector('.n'), tBack, { color: '#a5402d', duration: 0.35 }));
  const ul3 = h('div', 'hair', S3); const nb = box(last3.querySelector('.n'), S3); px(ul3, nb.x, nb.b + 4, nb.w, 2); css(ul3, { background: '#a5402d' });
  fromTo(ul3, tBack, { scaleX: 0 }, { scaleX: 1, duration: 0.4 });
  const ink3 = inkLayer(S3, 620, 700);
  const arc = svg('path', { d: 'M440 498 C 560 470, 575 230, 452 186', fill: 'none', stroke: '#a5402d', 'stroke-width': 2 }, ink3);
  const head3 = svg('path', { d: 'M466 176 l -16 9 l 14 12', fill: 'none', stroke: '#a5402d', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, ink3);
  draw(arc, tBack + 0.1, 0.8); show(head3, tBack + 0.85, { y: 0, d: 0.2 });
  sfx('tick', tBack + 0.1, { g: 0.5 });

  // 三张一起看：过程写不写、写在前还是后（纸边的铅笔批注）
  const margin = (sh, txt, x, y0, y1, t, ly) => {
    const bar = h('div', 'abs', sh); px(bar, x, y0, 2, y1 - y0); css(bar, { background: '#b4b4b4', transformOrigin: '50% 0' });
    fromTo(bar, t, { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: 'power2.out' });
    const lab = h('div', 'note', sh, txt); px(lab, 44, ly); css(lab, { fontSize: '32px' }); show(lab, t + 0.2, { y: 6, d: 0.4 }); sfx('pop', t + 0.2, { g: 0.3 });
    return lab;
  };
  // 先分两类：左边不写过程；中、右写了过程（左边那张移开，中右靠拢，桌面上各画一道括线）
  const tA = T('o11', '写不写') - 0.25, tB = T('o11', '前还是后') - 0.3;
  // 同一张纸挪两次：第二段 immediateRender 关掉，开始之前不生效（否则顺播与倒跳的画面不同）
  const slideX = (p, from, to_, t, later = false) => { [[p, 0], [p.shadowEl, 18]].forEach(([e, o]) => tl.fromTo(e, { left: from + o + 'px' }, { left: to_ + o + 'px', duration: 0.8, ease: 'power2.inOut', immediateRender: !later }, t)); };
  slideX(S1, -900, -1000, tA); slideX(S2, -290, -270, tA); slideX(S3, 320, 310, tA);
  const bracket = (x0, x1, txt, t) => {
    const ln_ = h('div', 'hair', desk); px(ln_, x0, 384, x1 - x0, 2); css(ln_, { background: '#707070' });
    const e0 = h('div', 'abs', desk), e1 = h('div', 'abs', desk); px(e0, x0, 372, 2, 14); px(e1, x1 - 2, 372, 2, 14); [e0, e1].forEach((e) => css(e, { background: '#707070' }));
    fromTo(ln_, t, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.out' }); show(e0, t, { y: 0, d: 0.2 }); show(e1, t + 0.4, { y: 0, d: 0.2 });
    const lab = h('div', 'note', desk, txt); css(lab, { position: 'absolute', left: (x0 + x1) / 2 + 'px', top: '402px', fontSize: '36px', color: '#1c1c1c', transform: 'translateX(-50%)' });
    show(lab, t + 0.25, { y: 6, d: 0.45 }); sfx('pop', t + 0.25, { g: 0.3 });
    return { ln_, e1 };
  };
  bracket(-1000, -440, '不写过程', tA + 0.6);
  const grp = bracket(-270, 930, '写了过程', tA + 0.75);
  // 再在「写了过程」里分开：过程在前、过程在后
  slideX(S3, 310, 370, tB, true);
  fromTo(grp.ln_, tB, { width: '1200px' }, { width: '1260px', duration: 0.8, ease: 'power2.inOut' });
  fromTo(grp.e1, tB, { left: '928px' }, { left: '988px', duration: 0.8, ease: 'power2.inOut' });
  const lab2 = margin(S2, '过程在前', 24, 166, 450, tB + 0.35, 600);
  margin(S3, '过程在后', 24, 244, 446, tB + 0.55, 590);
  hide(lab2, T('o12', '思维链') - 0.45, { y: 0, d: 0.3 });

  // 思维链：第二张纸
  const tCot = T('o12', '思维链');
  [S1, S3].forEach((p) => to(p, T('o12', '思维链') - 0.6, { opacity: 0.35, duration: 0.6 }));
  const g = h('div', 'gloss', S2, '思维链（Chain of Thought，CoT）<br><span class="g">通向答案的一串中间推理步骤<br>Wei 等，2022</span>'); px(g, 44, 568); css(g, { fontSize: '27px', lineHeight: '1.45' });
  g.dataset.gloss = '思维链'; sfx('blip', tCot - 0.1, { g: 0.3 });
  show(g, tCot - 0.1, { y: 10, d: 0.5 });
  // 这几行「思考」：第二张纸上过程那一段垫一层极淡的灰
  const band = h('div', 'abs', S2); px(band, 36, 158, 488, 300); css(band, { background: 'rgba(0,0,0,.045)' });
  S2.insertBefore(band, S2.firstChild);
  show(band, T('o15', '思考') - 0.1, { y: 0, d: 0.6 });

  // 镜头：近看第一张 → 第二张 → 第三张 → 拉开看三张 → 落到第二张
  rig.track(s.start, { x: 2380, y: 880, k: 2.2 }, [
    [c0 + 0.1, { x: 2368 }, Math.max(0.5, T('o2') - c0 - 0.15), { ease: 'none' }],
    [T('o2') - 0.05, { x: 1735, y: 630, k: 1.25 }, 1.6],                 // 退到整张纸：要它只报答案
    [null, { x: 1722 }, Math.max(0.5, Tend('o4') - T('o2') - 1.8), { ease: 'none' }],
    [Tend('o4') + 0.15, { x: 1000, y: 540 }, 1.0],
    [null, { x: 985 }, Math.max(0.5, Tend('o6') - Tend('o4') - 1.35), { ease: 'none' }],
    [Tend('o6') + 0.15, { x: 180, y: 520 }, 1.0],
    [null, { x: 165 }, Math.max(0.5, T('o10') - Tend('o6') - 1.6), { ease: 'none' }],
    [T('o10') - 0.25, { x: 950, y: 470, k: 0.9 }, 1.2],
    [null, { x: 940 }, Math.max(0.5, T('o12') - T('o10') - 1.3), { ease: 'none' }],
    [T('o12') + 0.1, { x: 990, y: 470, k: 1.12 }, 1.2],
    [null, { x: 975 }, Math.max(0.5, T('oT') - T('o12') - 1.4), { ease: 'none' }],
  ]);

  // 片名：安静的白卡，样子和封面一致
  const card = h('div', 'title-card', root);
  const wrap = h('div', 'abs', card); css(wrap, { inset: '0', transformOrigin: '50% 50%' });
  const cot = h('div', 'cot', wrap, 'CoT'), rule = h('div', 'rule', wrap), zh = h('div', 'zh', wrap, '先思考，再回答');
  const tT = T('oT');
  show(card, tT, { y: 0, d: 0.5 });
  vanish(view, tT + 0.55);                      // 白卡盖满之后，桌面不再参与画面
  show(cot, tT + 0.3, { y: 12, d: 0.8 });
  fromTo(rule, tT + 0.6, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' });
  show(zh, tT + 0.8, { y: 10, d: 0.8 });
  fromTo(wrap, tT, { scale: 1 }, { scale: 1.02, duration: s.end - tT, ease: 'none' });   // 卡片自己极慢地推近一次
  sfx('chime', tT + 0.3, { g: 0.35 });
  // 镜头换站：很轻的气流声
  [T('o2') - 0.05, Tend('o4') + 0.15, Tend('o6') + 0.15, T('o10') - 0.25, T('o12') + 0.1].forEach((t) => sfx('whoosh', t, { g: 0.22 }));
});
