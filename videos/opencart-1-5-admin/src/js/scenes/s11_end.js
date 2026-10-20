// 片尾（r2_credits，12 秒，无旁白）。署名只在画面展示，不配旁白（F13）。
// 名单依据 research/FACTS.md 制作署名表与本次委托：Codex（GPT-6）、Claude Opus 5.5、GPT-6 Astra、MiniMax speech-2.8-hd（旁白合成）。
scene('end', ({ root, s, c0 }) => {
  const w = h('div', 'world', root);
  const cam = makeCamera(w);

  const bx = ocBox(w, 150, 150, 1620, 770, '关于本片 · 制作人员', { icon: 'user' });
  const cr = h('div', 'abs credits', bx.bd); px(cr, 40, 26);

  const row = (y, html) => { const e = h('div', 'abs', cr, html); px(e, 0, y); return e; };
  const plan = row(0, '<span class="k">策划</span>　<span class="v">WaterRun</span>');
  const mh = row(92, '<span class="k">参与模型与分工</span>');
  const M = [
    ['Codex（GPT-6）', '历史预研'],
    ['Claude Opus 5.5', '官方实验、R1 文案与关键帧探索、正式场景动画与成片制作'],
    ['GPT-6 Astra', '匿名测绘、R3 文案、分镜与交接'],
    ['MiniMax speech-2.8-hd', '中文旁白语音合成'],
  ];
  const ms = M.map(([m, r], i) => row(150 + i * 84, `<span class="m" style="display:inline-block;width:500px">${m}</span><span class="r" style="font-size:34px;color:#333">${r}</span>`));
  const sep = h('div', 'abs', cr); px(sep, 0, 486, 1520, 3); css(sep, { background: '#DBDBDB' });
  const osLbl = row(510, '<span class="k">开源视频</span>　<span class="r">GPL-3.0-or-later · 源码、文案与事实台账</span>');
  const url = row(564, '<span class="url" style="font-size:60px">https://github.com/Water-Run/ft</span>');

  // 尽快全部到位（片尾 12 秒内留足阅读）：盒子 0.3 秒展开，各行 1.2 秒内依次进场，之后只有极慢的推近
  slideDown(bx.el, c0 + 0.05, { d: 0.3 }); sfx('pop', c0 + 0.1, { g: 0.6 });
  fadeIn(plan, c0 + 0.3, { d: 0.25 });
  fadeIn(mh, c0 + 0.45, { d: 0.25 });
  ms.forEach((e, i) => { slide(e, c0 + 0.55 + i * 0.1, { x: -30, d: 0.3, ease: 'power2.out' }); sfx('tick', c0 + 0.55 + i * 0.1, { g: 0.45 }); });
  wipe(sep, c0 + 1.0, { dir: 'l', d: 0.3 });
  fadeIn(osLbl, c0 + 1.05, { d: 0.25 });
  slide(url, c0 + 1.15, { y: 16, d: 0.35, ease: 'power2.out' }); sfx('chime', c0 + 1.2, { g: 0.5 });

  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { z: 1.03 }, s.end - c0 - 0.3, { ease: 'none', sfx: false }],
  ]);
});
