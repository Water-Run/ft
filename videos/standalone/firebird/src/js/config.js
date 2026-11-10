// 本片的引擎配置：常驻左栏目录。章与章之间像读文档一样整页往上滚，目录的绿色竖线同时滑到下一章。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#1c1c1c', accent: '#EE2B24', dim: '#6f6f6f', blue: '#2156a5', orange: '#F68A21' };
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
    const lastEnd = L.scenes.find((s) => s.id === 'end');
    const bar = h('div', 'bar', rail);
    gsap.set(bar, { y: CHAP_TOP + 2, autoAlpha: 0 });
    chaps.forEach((s, i) => {
      const it = h('div', 'it', rail, `${s.chap[0]}. ${s.chap[1]}`);
      css(it, { top: (CHAP_TOP + i * CHAP_STEP) + 'px' });
      const next = chaps[i + 1];
      classAt(it, 'on', s.start + 0.3, next ? next.start + 0.3 : (lastEnd ? lastEnd.start + 0.3 : Infinity));
      const yy = CHAP_TOP + i * CHAP_STEP + 2;
      if (i === 0) to(bar, s.start + 0.2, { autoAlpha: 1, duration: 0.3 });
      else to(bar, s.start + 0.1, { y: yy, duration: 0.6, ease: 'power2.inOut' });
    });
    if (lastEnd) to(bar, lastEnd.start + 0.1, { autoAlpha: 0, duration: 0.4 });
  },
  after() {
    const D = 0.8;
    L.scenes.forEach((s, i) => {
      const r = document.getElementById('sc-' + s.id);
      const nx = L.scenes[i + 1];
      if (i > 0) {
        gsap.set(r, { y: 1080, autoAlpha: 0 });
        set(r, s.start - 0.02, { autoAlpha: 1 });
        to(r, s.start, { y: 0, duration: D, ease: 'power2.inOut' });
      }
      if (nx) {
        to(r, nx.start, { y: -1080, duration: D, ease: 'power2.inOut' });
        set(r, nx.start + D + 0.02, { autoAlpha: 0 });
        sfx('whoosh', nx.start, { g: 0.6 });
      }
    });
  },
};
