// 本片的引擎配置：字体、章节卡、换场、字幕随底色换色。
// 视觉系统见 css/style.css：墨黑底上的系统图解；珊瑚红属于 OpenClaw，金色属于 Hermes Agent；中性的两章（这一类、异同）用纸白底。
// 换场只有一种：整屏色块在本章开始时盖住画面，盖住的那一刻换场景。有章节卡的用章节卡，没有的用一张小节幕（色块加一个大字标题）。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#0b0e14', paper: '#ece7da', claw: '#ff4f40', herm: '#ffd700', dim: '#8f939c' };
// 各章的底色：paper 纸白、ink 墨黑；字幕颜色跟随。场景内部另有变化时，场景往 window.GROUND_AT 里登记 { t0, t1, g }
window.GROUND = { open: 'ink', kind: 'paper', claw: 'ink', clawi: 'ink', hermes: 'ink', hermesi: 'ink', both: 'paper', mini: 'ink', outro: 'ink' };
// 字幕强调线的颜色：按章节归属
window.KIND = { claw: 'k-claw', clawi: 'k-claw', hermes: 'k-herm', hermesi: 'k-herm' };
window.GROUND_AT = [];
window.ENGINE = {
  fonts: [['900 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['500 20px "Inter"', 'Aa0'],
    ['900 20px "Sans SC"', '字A'], ['500 20px "Sans SC"', '字A'],
    ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0'], ['20px "Pixel"', 'A0']],
  sceneFade: false,
  sceneCut: 0.45,
  chrome() {
    const hud = document.getElementById('hud');
    L.scenes.forEach((s, idx) => {
      if (s.chap) { chapterCard(hud, s); return; }
      if (idx > 0) curtain(hud, s);
    });
    const cap = document.getElementById('caption');
    let last = null;
    F((t) => {
      let g = 'ink', k = '';
      for (const s of L.scenes) if (t >= s.start + 0.45 - 1e-6 && t < s.end + 0.45) { g = window.GROUND[s.id] || 'ink'; k = window.KIND[s.id] || ''; break; }
      for (const o of window.GROUND_AT) if (t >= o.t0 && t < o.t1) g = o.g;
      const cls = (g === 'ink' ? 'on-ink ' : '') + k;
      if (cls !== last) { last = cls; cap.className = cls; }
    });
  },
};

// ── 章节卡 ──
// OpenClaw：珊瑚红的名字，右侧像素龙虾，两只钳张合两次；Hermes Agent：banner 式的三段金色像素字逐列出现；
// 其余（中性）：章号、眉题、标题，下面一排消息方块逐个点亮，其中一个珊瑚红、一个金色。
function chapterCard(hud, s) {
  const [no, raw] = s.chap, parts = raw.split('|'), eyebrow = parts.length > 1 ? parts[0] : '', title = parts[parts.length - 1];
  const kind = s.id === 'claw' ? 'claw' : s.id === 'hermes' ? 'herm' : 'neutral';
  const card = h('div', 'card', hud);
  const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.45;
  wipe(card, t0, { dir: 'l', d: 0.4 }); wipeOut(card, t1, { dir: 'r', d: 0.4 });
  sfx('whoosh', t0 - 0.05); sfx('thud', t0 + 0.32, { g: 0.6 });
  const g = svg('svg', { class: 'g' }, card); css(g, { overflow: 'visible' });
  if (kind === 'claw') {
    const nn = h('div', 'no', card, no); css(nn, { top: '300px', color: '#ff4f40' });
    const ti = h('div', 'ti in9', card, title); css(ti, { top: '392px', fontSize: '220px', letterSpacing: '-.04em', fontFamily: '"Inter","Sans SC"', fontWeight: 900, color: '#ff4f40' });
    const lob = lobster(g, 1330, 292, 30);
    F((t) => { const k = clamp((t - (t0 + 0.3)) / 1.6); lob.set(Math.abs(Math.sin(k * Math.PI * 2))); });
    slide(ti, t0 + 0.2, { x: -80, d: 0.55 }); sfx('thud', t0 + 0.75, { g: 0.7 }); sfx('tick', t0 + 0.7, { g: 0.5 }); sfx('tick', t0 + 1.5, { g: 0.5 });
  } else if (kind === 'herm') {
    const nn = h('div', 'no', card, no); css(nn, { top: '262px', color: '#ffd700' });
    const a = pixelBanner(g, 'HERMES', 120, 372, 30), b = pixelBanner(g, 'AGENT', 120, 620, 30);
    colReveal(a.els, t0 + 0.25, 0.035); colReveal(b.els, t0 + 0.47, 0.035);
    for (let i = 0; i < 6; i++) sfx('tick', t0 + 0.3 + i * 0.09, { g: 0.4 });
    sfx('pop', t0 + 0.25 + 0.035 * 12, { g: 0.6 });
  } else {
    const nn = h('div', 'no', card, no); css(nn, { top: '262px', color: '#ece7da' });
    if (eyebrow) { const eb = h('div', 'eb', card, eyebrow); eb.style.top = '352px'; }
    const ti = h('div', 'ti', card, title); css(ti, { top: eyebrow ? '412px' : '360px', fontSize: (title.length > 14 ? 124 : 156) + 'px', color: '#ece7da' });
    wipe(ti, t0 + 0.16, { dir: 'l', d: 0.5 });
    const y = 690, n = 14, ci = (+no * 3) % n, hi = (ci + 5) % n;
    for (let i = 0; i < n; i++) {
      const r = svg('rect', { x: 120 + i * 56, y, width: 34, height: 34, fill: i === ci ? '#ff4f40' : i === hi ? '#ffd700' : '#ece7da' }, g);
      fromTo(r, t0 + 0.3 + i * 0.05, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 });
      if (i % 3 === 0) sfx('tick', t0 + 0.3 + i * 0.05, { g: 0.35 });
    }
  }
}
// 小节幕：一块整屏色块从右刷入、停一下、向左收走，上面是一个大字标题和一排方块。
// 用在两处：没有章节卡的场景开头（盖住换场景的那一刻）；场景内部镜头要换到图上很远的地方时（盖住的那一刻切镜头，不让画面扫过空白）。
// 色块上必须有字：整屏只有一种颜色的画面会被成片检查判为空画面。返回全盖住的时段 { cover, clear }。
function slate(t0, o = {}) {
  const hud = document.getElementById('hud'), bg = o.bg || '#ece7da', fg = '#0b0e14';
  const c = h('div', 'card', hud); css(c, { background: bg, color: fg });
  if (o.sub) { const sb = h('div', 'eb', c, o.sub); css(sb, { top: '318px', color: fg, font: '700 52px "Mono", "Sans SC"' }); }
  const ti = h('div', 'ti', c, o.text || ''); css(ti, { top: o.sub ? '396px' : '366px', fontSize: ((o.text || '').length > 10 ? 150 : 230) + 'px', color: fg });
  const g = svg('svg', { class: 'g' }, c); for (let i = 0; i < 14; i++) svg('rect', { x: 120 + i * 56, y: 720, width: 34, height: 34, fill: fg }, g);
  const tin = o.tin || 0.3, hold = o.hold != null ? o.hold : 0.25, tout = o.tout || 0.3;
  tl.fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: true }, t0);
  tl.fromTo(c, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: tin, ease: 'power3.inOut', immediateRender: true }, t0);
  tl.to(c, { clipPath: 'inset(0% 100% 0% 0%)', duration: tout, ease: 'power3.inOut' }, t0 + tin + hold);
  tl.set(c, { autoAlpha: 0 }, t0 + tin + hold + tout + 0.02);
  sfx('whoosh', t0, { g: 0.6 });
  return { cover: t0 + tin, clear: t0 + tin + hold };
}
// 没有章节卡的场景：开头一张小节幕，盖住换场景的那一刻（场景在本场开始后 sceneCut 秒切换）
function curtain(hud, s) {
  const k = { clawi: ['#ff4f40', tr('实现', 'Implementation'), 'OpenClaw'], hermesi: ['#ffd700', tr('实现', 'Implementation'), 'Hermes Agent'], outro: ['#ece7da', tr('小结', 'In short'), ''] }[s.id] || ['#ece7da', '', ''];
  slate(s.start + 0.02, { bg: k[0], text: k[1], sub: k[2], tin: 0.3, hold: 0.28, tout: 0.3 });
}
