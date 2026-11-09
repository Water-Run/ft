// 本片的引擎配置：常驻左栏目录、面包屑、换页。目录随章亮起绿色竖线，章与章之间是上一页揭起、露出下一页。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#1c1c1c', accent: '#EE2B24', dim: '#6f6f6f' };
const CHAP_TOP = 190, CHAP_STEP = 62;
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'], ['500 20px "Serif SC"', '字A'], ['800 20px "Serif SC"', '字A'], ['600 20px "Open Sans"', 'Aa0'], ['800 20px "Open Sans"', 'Aa0'], ['500 20px "Mono"', 'A0'], ['800 20px "Mono"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    const rail = h('div', 'rail', hud);
    const logo = h('img', 'logo', rail); logo.src = '/img/firebird-logo.png';
    h('div', 'tt', rail, '目录');
    const chaps = L.scenes.filter((s) => s.chap);
    const bar = h('div', 'bar', rail);
    init(bar, { y: CHAP_TOP + 6, autoAlpha: 0 });
    chaps.forEach((s, i) => {
      const it = h('div', 'it', rail, `${s.chap[0]}. ${s.chap[1]}`);
      css(it, { top: (CHAP_TOP + i * CHAP_STEP) + 'px' });
      const next = chaps[i + 1];
      classAt(it, 'on', s.start, next ? next.start : Infinity);
      const yy = CHAP_TOP + i * CHAP_STEP + 2;
      if (i === 0) { set(bar, s.start, { y: yy, autoAlpha: 1 }); }
      else to(bar, s.start + 0.05, { y: yy, duration: 0.42, ease: 'power3.inOut' });
    });
    const lastEnd = L.scenes.find((s) => s.id === 'end');
    if (lastEnd) to(bar, lastEnd.start, { autoAlpha: 0, duration: 0.3 });
  },
  after() {
    L.scenes.forEach((s, i) => {
      const r = document.getElementById('sc-' + s.id);
      css(r, { zIndex: 100 - i });
      if (i > 0) init(r, { autoAlpha: 0 }), set(r, s.start - 0.02, { autoAlpha: 1 });
      const nx = L.scenes[i + 1];
      if (!nx) return;
      to(r, nx.start, { rotationX: -46, y: -1240, z: 140, transformPerspective: 2200, transformOrigin: '60% 0%', duration: 0.62, ease: 'power2.in' });
      set(r, nx.start + 0.64, { autoAlpha: 0 });
      sfx('whoosh', nx.start, { g: 0.7, p: 0.2 });
    });
  },
};
