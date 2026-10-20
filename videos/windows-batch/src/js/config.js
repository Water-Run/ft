// 本片的引擎配置：要预载的字体、箭头可用的颜色、常驻元素（章节卡、左上角章节角标、进度条）。
// 字体与颜色已按 brief/03-visual.md 定好。
// 常驻元素都放在 #hud：它在场景之上、字幕条之下；只由 t 决定，不用定时器。
window.PALETTE = { ink: '#0C0C0C', amber: '#FFB000', dim: '#6B665D', paper: '#ECE8DF' };
// 贴一个标签：先在它底下垫一块同色的实心块。工具的对比度检查只看文字底下的色块、不看元素自己的背景，
// 垫上之后「琥珀底墨色字」「墨底纸色字」「纸底墨色字」三种都能被正确识别。kind：'amber' | 'ink' | 'inv'
window.tagAt = function (parent, kind, html, x, y, right) {
  const t = h('div', 'tag abs' + (kind === 'amber' ? ' amber' : kind === 'inv' ? ' inv' : ''), parent, html);
  if (right != null) css(t, { right: right + 'px', top: y + 'px' }); else px(t, x, y);
  const b = box(t, parent);
  const back = h('div', 'blk' + (kind === 'amber' ? '' : kind === 'inv' ? ' paper' : ' ink'), parent);
  px(back, b.x, b.y, b.w, b.h);
  parent.insertBefore(back, t);
  vanish(back, 0);
  F(() => { const cs = getComputedStyle(t); back.style.opacity = cs.opacity; back.style.visibility = cs.visibility; });
  return t;
};
// 镜头轨迹：给一串「时刻 + 目标」，起值写成上一个目标（显式 fromTo）。
// 引擎的 cam.to 是「从当前值」补间：倒退 seek 到某个补间中段时，起始值会被重新采样成当前值，
// 于是同一时刻「顺播」与「跳播」的画面不一样。显式给出起值就没有这个问题。
// keys: [[时刻, {x,y,z}, 秒数, {ease, sfx, g}] …]。时刻可以写 null：表示接在上一段结束后 0.15 秒，
// 用来放「缓慢漂移」这种不承担节拍的运动；承担节拍的运动（跨站点、推近）一律写 T(句号, 词) 的相对时刻。
window.camTrack = function (cam, startT, start, keys) {
  cam.cut(startT, start);
  let from = start, prevEnd = startT;
  for (const [t, to, d, o] of keys) {
    const tt = t == null ? prevEnd + 0.15 : t;
    fromTo(cam.st, tt, { ...from }, { ...to, duration: d, ease: (o && o.ease) || 'power3.inOut' });
    if (!o || o.sfx !== false) sfx('whoosh', tt, { g: o && o.g != null ? o.g : 0.6 });
    from = to; prevEnd = tt + d;
  }
};
// 「长出来的条」：宽度由 t 直接算出（分段、段内 easeInOut），第一段起点之前不可见。
// stops: [[t0, w0], [t1, w1], …]，宽度在 t0 之前视为 0。
// 同一根条分几次长起来时用它，而不是叠几个宽度补间：补间在倒退 seek 时会被「回退」成起始值，
// 同一属性上的多个补间会互相打架；由 t 直接算就不会。
window.growTo = function (el, stops) {
  F((t) => {
    let w = 0;
    for (let i = 1; i < stops.length; i++) {
      const ta = stops[i - 1][0], wa = stops[i - 1][1], tb = stops[i][0], wb = stops[i][1];
      if (t >= tb) { w = wb; continue; }
      if (t > ta) { const k = (t - ta) / (tb - ta); w = wa + (wb - wa) * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2); }
      break;
    }
    const on = t >= stops[0][0] && w > 0.5;
    el.style.width = Math.max(0, w).toFixed(1) + 'px';
    el.style.opacity = on ? '1' : '0';
    el.style.visibility = on ? 'inherit' : 'hidden';
  });
};
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'], ['900 20px "Grot"', 'A0'], ['400 20px "Pixel"', 'A0'], ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0']],
  sceneFade: false,         // 场景之间不自动整屏淡入淡出：每个场景自己编排入场与退场（见 brief/04-storyboard.md）
  chrome() {
    const hud = document.getElementById('hud');
    // ── 进度条：贴在字幕条上沿（y = 962），宽度 = t / 总长 × 1920 ──
    const prog = h('div', 'blk', hud);
    px(prog, 0, 962, 0, 6);
    F((t) => { prog.style.width = Math.round(Math.max(0, Math.min(1, t / L.total)) * 1920) + 'px'; });

    // ── 章节卡与章节角标：每个带章节的场景一套 ──
    for (const s of L.scenes) {
      if (!s.chap) continue;
      // 角标：章节卡收走之后出现，到本场结束（横切那一刻由下一场的色块盖住这个角落）
      const badge = h('div', 'abs nowrap', hud);
      badge.setAttribute('data-overlap-ok', '');
      px(badge, 96, 56);
      h('span', null, badge, s.chap[0]).style.cssText = 'font:900 30px/1 "Grot","Sans SC"';
      h('span', null, badge, s.chap[1]).style.cssText = 'font:700 30px/1 "Sans SC";margin-left:16px';
      appear(badge, s.start + 1.40);
      vanish(badge, s.end);

      // 章节卡：琥珀色块从左向右刷满内容区 → 章节号砸入 → 标题刷出 → 向右收走
      const card = h('div', 'blk', hud);
      px(card, 0, 0, 1920, 968);
      card.setAttribute('data-overlap-ok', '');
      const num = h('div', 'abs cardnum', card, s.chap[0]);
      px(num, 76, 130); num.setAttribute('data-overlap-ok', '');
      const ttl = h('div', 'abs cardttl', card, s.chap[1]);
      px(ttl, 600, 250); ttl.setAttribute('data-overlap-ok', '');
      wipe(card, s.start, { dir: 'l', d: 0.35 });
      sfx('whoosh', s.start);
      slam(num, s.start + 0.30);
      sfx('thud', s.start + 0.30);
      wipe(ttl, s.start + 0.42, { dir: 'l', d: 0.28 });
      sfx('tick', s.start + 0.42);
      wipeOut(card, s.start + 1.05, { dir: 'r', d: 0.35 });
      sfx('whoosh', s.start + 1.05, { g: 0.6 });
    }

    // ── s5 → end：墨色块从右向左刷满内容区，把画面吞掉；end 自己的底色就是墨色，色块随即消失 ──
    const last = L.scenes[L.scenes.length - 1];
    const cover = h('div', 'blk ink', hud);
    px(cover, 0, 0, 1920, 968);
    wipe(cover, last.start, { dir: 'r', d: 0.35 });
    sfx('whoosh', last.start);
    sfx('thud', last.start + 0.12, { g: 0.5 });
    vanish(cover, last.start + 0.5);
  },
};
