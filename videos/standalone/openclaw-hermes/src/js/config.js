// 本片的引擎配置：字体、章节卡、换场、字幕随底色换色。
// 视觉系统见 css/style.css：纸白 + 朱红属于 OpenClaw，墨黑 + 金色属于 Hermes，中性的章节用纸白与墨黑分屏。
// 换场只有一种：整屏色块在本章开始时盖住画面（章节卡），盖住的那一刻换场景。没有章节卡的场景（片尾）用一块与新底色相同的幕布从右侧推过。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#111214', paper: '#eee9dc', claw: '#e5412d', herm: '#ffc61a', dim: '#5e5c55' };
// 各章的底色：paper 纸白、ink 墨黑、split 上纸下墨（两条泳道）；字幕颜色跟随。场景内部另有变化时，场景往 window.GROUND_AT 里登记 { t0, t1, g }
window.GROUND = { open: 'paper', map: 'split', claw: 'paper', hermes: 'ink', feishu: 'paper', journey: 'split', compare: 'split', outro: 'ink' };
window.GROUND_AT = [];
window.ENGINE = {
  fonts: [['900 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['500 20px "Inter"', 'Aa0'],
    ['900 20px "Sans SC"', '字A'], ['500 20px "Sans SC"', '字A'], ['700 20px "Serif SC"', '字A'],
    ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0'], ['20px "Pixel"', 'A0']],
  sceneFade: false,
  sceneCut: 0.45,
  chrome() {
    const hud = document.getElementById('hud');
    L.scenes.forEach((s, idx) => {
      if (s.chap) { chapterCard(hud, s); return; }
      if (idx > 0) curtain(hud, s);
    });
    // 字幕颜色：split 的下半是墨黑，字幕落在那里；其余按场景底色
    const cap = document.getElementById('caption');
    let last = '';
    F((t) => {
      let g = 'paper';
      for (const s of L.scenes) if (t >= s.start + 0.45 - 1e-6 && t < s.end + 0.45) { g = window.GROUND[s.id] || 'paper'; break; }
      for (const o of window.GROUND_AT) if (t >= o.t0 && t < o.t1) g = o.g;
      const cls = (g === 'ink' || g === 'split') ? 'on-ink' : '';
      if (cls !== last) { last = cls; cap.className = cls; }
    });
  },
};

// ── 章节卡 ──
// 三种：OpenClaw 整幅朱红（钳形合拢），Hermes 墨黑底（金色像素字逐列出现），其余中性（墨黑底，朱红与金色两条线）
function chapterCard(hud, s) {
  const [no, raw] = s.chap, parts = raw.split('|'), eyebrow = parts.length > 1 ? parts[0] : '', title = parts[parts.length - 1];
  const kind = s.id === 'claw' ? 'claw' : s.id === 'hermes' ? 'herm' : 'neutral';
  const card = h('div', 'card ' + kind, hud);
  const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.45;
  wipe(card, t0, { dir: 'l', d: 0.4 }); wipeOut(card, t1, { dir: 'r', d: 0.4 });
  sfx('whoosh', t0 - 0.05); sfx('thud', t0 + 0.32, { g: 0.6 });
  if (kind === 'claw') {
    const nn = h('div', 'no', card, no); nn.style.top = '280px'; nn.style.color = '#111214';
    const ti = h('div', 'ti in9', card, title); css(ti, { top: '378px', fontSize: '236px', letterSpacing: '-.04em', fontFamily: '"Inter","Sans SC"', fontWeight: 900 });
    const g = svg('svg', { class: 'g' }, card); css(g, { overflow: 'visible' });
    const claw = makeClaw(g, 1520, 700, 1.25, '#111214');
    F((t) => { const k = clamp((t - (t0 + 0.2)) / 1.5); claw.set(k < 0.55 ? lerp(34, 3, ease.io3(k / 0.55)) : lerp(3, 26, ease.out3((k - 0.55) / 0.45))); });
    slide(ti, t0 + 0.2, { x: -80, d: 0.55 }); sfx('thud', t0 + 0.2 + 0.55 * 1.5, { g: 0.7 });
  } else if (kind === 'herm') {
    const nn = h('div', 'no', card, no); nn.style.top = '280px'; nn.style.color = '#ffc61a';
    const g = svg('svg', { class: 'g' }, card); css(g, { overflow: 'visible' });
    const a = pixelText(g, 'HERMES', 120, 392, 30, '#ffc61a'), b = pixelText(g, 'AGENT', 120, 640, 30, '#ffc61a');
    colReveal(a.els, t0 + 0.25, 0.035); colReveal(b.els, t0 + 0.25 + 0.22, 0.035);
    const bars = wing(g, 1920, 300, 30, [12, 10, 8, 6, 4, 2], '#ffc61a');
    bars.forEach((r, i) => fromTo(r, t0 + 0.3 + i * 0.07, { x: 420 }, { x: 0, duration: 0.5, ease: 'power3.out' }));
    for (let i = 0; i < 6; i++) sfx('tick', t0 + 0.3 + i * 0.07, { g: 0.4 });
    sfx('pop', t0 + 0.25 + 0.035 * 12, { g: 0.6 });
  } else {
    if (eyebrow) { const eb = h('div', 'eb', card, eyebrow); eb.style.top = '338px'; }
    const nn = h('div', 'no', card, no); nn.style.top = '246px'; nn.style.color = '#eee9dc';
    const ti = h('div', 'ti', card, title); css(ti, { top: eyebrow ? '400px' : '350px', fontSize: (title.length > 14 ? 120 : 150) + 'px', color: '#eee9dc' });
    const g = svg('svg', { class: 'g' }, card); css(g, { overflow: 'visible' });
    const ly = eyebrow ? 690 : 640;
    const r1 = svg('rect', { x: 120, y: ly, width: 760, height: 8, fill: '#e5412d' }, g), r2 = svg('rect', { x: 120, y: ly + 36, width: 760, height: 8, fill: '#ffc61a' }, g);
    svg('circle', { cx: 120, cy: ly + 4, r: 18, fill: '#e5412d' }, g); svg('rect', { x: 102, y: ly + 22, width: 36, height: 36, fill: '#ffc61a' }, g);
    fromTo(r1, t0 + 0.3, { scaleX: 0, svgOrigin: '120 ' + (ly + 4) }, { scaleX: 1, duration: 0.6, ease: 'power3.out' });
    fromTo(r2, t0 + 0.42, { scaleX: 0, svgOrigin: '120 ' + (ly + 40) }, { scaleX: 1, duration: 0.6, ease: 'power3.out' });
    wipe(ti, t0 + 0.16, { dir: 'l', d: 0.5 });
  }
}
// 没有章节卡的场景：一块与新底色相同的幕布从右侧推过，推到一半时换场景
function curtain(hud, s) {
  const g = window.GROUND[s.id] || 'paper';
  const c = h('div', 'card', hud); c.style.background = g === 'ink' || g === 'split' ? '#111214' : '#eee9dc';
  const t0 = s.start + 0.02;
  tl.fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: true }, t0);
  tl.fromTo(c, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.42, ease: 'power3.inOut', immediateRender: true }, t0);
  tl.to(c, { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.42, ease: 'power3.inOut' }, t0 + 0.5);
  tl.set(c, { autoAlpha: 0 }, t0 + 0.95);
  sfx('whoosh', t0);
}
