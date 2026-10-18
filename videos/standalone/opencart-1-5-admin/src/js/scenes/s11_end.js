// 片尾（r2_credits，12 秒，无旁白）。署名只在画面展示，不配旁白（F13）。
// 名单依据 research/FACTS.md 制作署名表与本次委托；后续实际参与的模型由交付前按 FACTS 补入。
scene('end', ({ root, s, c0 }) => {
  const w = h('div', 'world', root);
  const cam = makeCamera(w);

  const bx = ocBox(w, 150, 150, 1620, 770, '关于本片 · 制作人员', { icon: 'user' });
  const cr = h('div', 'abs credits', bx.bd); px(cr, 40, 26);

  const row = (y, html) => { const e = h('div', 'abs', cr, html); px(e, 0, y); return e; };
  const plan = row(0, '<span class="k">策划</span>　<span class="v">WaterRun</span>');
  const mh = row(96, '<span class="k">参与模型与分工</span>');
  const M = [
    ['Codex（GPT-6）', '历史预研'],
    ['Claude Opus 5.5', '官方实验、R1、关键帧探索、正式场景动画、配音与成片制作'],
    ['GPT-6 Astra', '匿名测绘、R3 文案、分镜与交接'],
  ];
  const ms = M.map(([m, r], i) => row(156 + i * 86, `<span class="m">${m}</span><span class="r" style="margin-left:28px">${r}</span>`));
  const sep = h('div', 'abs', cr); px(sep, 0, 440, 1520, 3); css(sep, { background: '#DBDBDB' });
  const osLbl = row(468, '<span class="k">开源视频</span>　<span class="r">GPL-3.0-or-later · 源码、文案与事实台账</span>');
  const url = row(522, '<span class="url">https://github.com/Water-Run/ft</span>');

  slideDown(bx.el, c0 + 0.1, { d: 0.5 }); sfx('pop', c0 + 0.15, { g: 0.6 });
  fadeIn(plan, c0 + 0.6);
  fadeIn(mh, c0 + 0.95);
  ms.forEach((e, i) => slide(e, c0 + 1.15 + i * 0.16, { x: -40, d: 0.4, ease: 'power2.out' }));
  sfx('tick', c0 + 1.15, { g: 0.5 }); sfx('tick', c0 + 1.31, { g: 0.5 }); sfx('tick', c0 + 1.47, { g: 0.5 });
  wipe(sep, c0 + 1.9, { dir: 'l', d: 0.4 });
  fadeIn(osLbl, c0 + 2.1);
  slide(url, c0 + 2.3, { y: 20, d: 0.45, ease: 'power2.out' }); sfx('chime', c0 + 2.4, { g: 0.5 });

  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { z: 1.03 }, s.end - c0 - 0.3, { ease: 'none', sfx: false }],
  ]);
});
