// 本片的引擎配置：字体、章节卡、小节幕、字幕随皮肤换色。
// 三套皮肤各管各的场景（见 css/style.css）：中性 n、OpenClaw cl、OpenCode oc。换场只有一种：章节卡或小节幕盖住画面，盖住的那一刻换场景。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#17181b', claw: '#ff5c5c', code: '#fab283', dim: '#5d5b55' };
window.SKIN = { open: 'n', before: 'n', claw: 'cl', claw2: 'cl', code: 'oc', crash: 'oc', budget: 'oc', lessons: 'n', outro: 'n' };
window.ENGINE = {
  fonts: [['900 20px "Serif SC"', '字A'], ['600 20px "Serif SC"', '字A'], ['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'],
    ['500 20px "Mono"', 'A0'], ['800 20px "Mono"', 'A0'], ['600 20px "Instrument Sans"', 'Aa0'], ['700 20px "Instrument Sans"', 'Aa0']],
  sceneFade: false,
  sceneCut: 0.45,
  chrome() {
    const hud = document.getElementById('hud');
    L.scenes.forEach((s, i) => {
      const sk = window.SKIN[s.id];
      if (s.chap) { (sk === 'cl' ? cardClaw : sk === 'oc' ? cardCode : cardNeutral)(hud, s); return; }
      if (i > 0) slate(hud, s, sk);
    });
    const cap = document.getElementById('caption');
    let last = null;
    F((t) => {
      let k = 'n';
      for (const s of L.scenes) if (t >= s.start + 0.45 - 1e-6 && t < s.end + 0.45) { k = window.SKIN[s.id]; break; }
      const cls = k === 'cl' ? 'g-claw' : k === 'oc' ? 'g-code' : '';
      if (cls !== last) { last = cls; cap.className = cls; }
    });
  },
};

// ── 章节卡 ──
// 中性：纸白底，左侧页边一列序号逐个跳出，宋体的章号与标题，一条细线从左画到右。
function cardNeutral(hud, s) {
  const c = h('div', 'card', hud); css(c, { background: C.paper });
  const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.45;
  wipe(c, t0, { dir: 'l', d: 0.4 }); wipeOut(c, t1, { dir: 'r', d: 0.4 });
  sfx('whoosh', t0 - 0.02, { g: 0.5 });
  const g = svg('svg', { class: 'g' }, c);
  const no = tx(c, 'ser', 250, 250, s.chap[0], { fontSize: '210px', lineHeight: '1' });
  const ti = tx(c, 'ser', 250, 520, s.chap[1], { fontSize: (s.chap[1].length > 12 ? 112 : 140) + 'px' });
  const ln = Ln(g, 250, 760, 1800, 760, C.ink, 4);
  for (let i = 0; i < 6; i++) { const q = tx(c, 'seqn', 120, 268 + i * 82, String(+s.chap[0] * 100 + i).padStart(4, '0'), { fontSize: '26px' }); appear(q, t0 + 0.12 + i * 0.06); }
  slide(no, t0 + 0.1, { y: 60, d: 0.5, ease: 'power3.out' }); sfx('thud', t0 + 0.2, { g: 0.7 });
  wipe(ti, t0 + 0.28, { dir: 'l', d: 0.55 }); draw(ln, t0 + 0.35, 0.8); sfx('tick', t0 + 0.5, { g: 0.4 });
}
// OpenClaw：Control UI 的深底，吉祥物从下方弹上来（之后按官方节奏漂浮、合钳），白色的名字，珊瑚红的 2.0。
function cardClaw(hud, s) {
  const c = h('div', 'card', hud); css(c, { background: C.clBg });
  const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.45;
  wipe(c, t0, { dir: 'b', d: 0.42 }); wipeOut(c, t1, { dir: 't', d: 0.42 });
  sfx('whoosh', t0 - 0.02, { g: 0.5 });
  const g = svg('svg', { class: 'g' }, c);
  const mg = svg('g', {}, g); lobsterMascot(mg, 1180, 230, 560, { t0 });
  fromTo(mg, t0 + 0.15, { y: 700 }, { y: 0, duration: 0.7, ease: 'back.out(1.5)', immediateRender: true }); sfx('pop', t0 + 0.55, { g: 0.8 });
  const no = tx(c, 'clb', 140, 296, s.chap[0], { fontSize: '56px', color: C.clMuted, fontWeight: 600 });
  const a = tx(c, 'clb', 128, 380, 'OpenClaw', { fontSize: '200px' });
  const b = tx(c, 'clb', 132, 590, '2.0', { fontSize: '200px', color: C.clAccent });
  appear(no, t0 + 0.2); slide(a, t0 + 0.2, { x: -120, d: 0.55 }); slam(b, t0 + 0.55, { from: 1.4 }); sfx('thud', t0 + 0.62, { g: 0.8 });
  const row = clRow(c, 140, 846, 16);
  [['v2026.8.1', 'on'], ['2026-08-31', 'out']].forEach(([x, k], i) => { const p = clPill(row, 0, 0, x, k, 30); p.style.position = 'static'; appear(p, t0 + 0.85 + i * 0.12); sfx('tick', t0 + 0.85 + i * 0.12, { g: 0.4 }); });
}
// OpenCode：终端的黑底，方块字标志按列逐格刷出（终端重绘的样子），桃橙的 v2 反白块砸下，下面一行等宽的版本号。
function cardCode(hud, s) {
  const c = h('div', 'card', hud); css(c, { background: C.ocBg });
  const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.45;
  appear(c, t0); vanish(c, t1 + 0.3);
  tl.fromTo(c, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.3, ease: 'steps(12)', immediateRender: true }, t0);
  tl.to(c, { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.3, ease: 'steps(12)' }, t1);
  sfx('whoosh', t0 - 0.02, { g: 0.4 });
  const g = svg('svg', { class: 'g' }, c);
  const lg = ocLogo(g, 160, 330, 34);
  colIn(lg.cells, t0 + 0.2, 0.022); for (let i = 0; i < 8; i++) sfx('key', t0 + 0.2 + i * 0.1, { g: 0.35 });
  const no = tx(c, 'oc', 160, 222, s.chap[0], { fontSize: '44px', color: C.ocMuted }); appear(no, t0 + 0.12);
  const v = ocTag(c, 160 + lg.w + 40, 330 + 68, 'v2', { size: 120 }); slam(v, t0 + 1.05, { from: 1.5 }); sfx('thud', t0 + 1.1, { g: 0.8 });
  const ln = ocLine(c, 160, 640, [['v2.0.0', C.ocText], ['  2026-09-11', C.ocMuted]], { size: 36 }); appear(ln, t0 + 1.25); sfx('blip', t0 + 1.25, { g: 0.4 });
}
// ── 小节幕：没有章节卡的场景开头，一张按所属皮肤画的整屏，盖住换场景的那一刻。上面必须有字（整屏单色会被判为空画面）。
const SLATE = {
  claw2: [tr('会话、授权、凭据', 'Sessions, authority, credentials'), 'OpenClaw 2.0'],
  crash: [tr('实验：工具执行到一半时强杀', 'Experiment: kill it mid-tool'), 'opencode run "Write a note."'],
  budget: [tr('上下文的预算', 'The context budget'), 'compaction · bounds · cache'],
  outro: [tr('片尾', 'Credits'), ''],
};
function slate(hud, s, sk) {
  const [title, sub] = SLATE[s.id] || ['', ''];
  const c = h('div', 'card', hud), t0 = s.start + 0.02, tin = 0.3, hold = 0.3, tout = 0.3;
  if (sk === 'cl') {
    css(c, { background: C.clBg });
    const k = clCard(c, 60, 60, 1800, 960, { bg: C.clCard }); css(k, { borderRadius: '28px' });
    tx(c, 'clb', 160, 380, esc(title), { fontSize: (title.length > 14 ? 92 : 120) + 'px' });
    const p = clPill(c, 164, 600, sub, 'acc', 34);
  } else if (sk === 'oc') {
    css(c, { background: C.ocBg });
    ocPane(c, 60, 60, 1800, 940, '');
    ocLine(c, 160, 300, [['$ ', C.ocMuted], [sub, C.oc300]], { size: 36 });
    tx(c, 'ocb', 160, 400, esc(title), { fontSize: (title.length > 14 ? 76 : 96) + 'px' });
  } else {
    css(c, { background: C.paper });
    tx(c, 'ser', 250, 420, esc(title), { fontSize: '140px' });
    const g = svg('svg', { class: 'g' }, c); Ln(g, 250, 640, 1800, 640, C.ink, 4);
  }
  appear(c, t0);
  tl.fromTo(c, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: tin, ease: 'power3.inOut', immediateRender: true }, t0);
  tl.to(c, { clipPath: 'inset(0% 100% 0% 0%)', duration: tout, ease: 'power3.inOut' }, t0 + tin + hold);
  tl.set(c, { autoAlpha: 0 }, t0 + tin + hold + tout + 0.02);
  sfx('whoosh', t0, { g: 0.55 });
}
