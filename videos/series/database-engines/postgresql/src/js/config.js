// 本片的引擎配置：预载字体、箭头颜色、常驻层（左上角标志与章名、章节卡）。
// 常驻层仿 postgresql.org 的导航栏：大象标志 + PostgreSQL 字标；章节卡用官网特性区的蓝底与白描大象。
document.documentElement.classList.add(LANG);
window.PALETTE = { pg: '#336791', dk: '#193145', lt: '#699eca', ink: '#212121', grey: '#8a8f94', line: '#ced4da', warn: '#df421e', ok: '#84c578', white: '#ffffff' };
window.PENDING = window.PENDING || [];
// 大象标志：<img> 载入是异步的，承诺交给引擎在就绪前等待
function pgLogo(parent, white, abs = true) {
  const img = h('img', abs ? 'abs' : '', parent); img.decoding = 'sync'; img.alt = '';
  window.PENDING.push(new Promise((res) => { img.onload = res; img.onerror = res; }));
  img.src = white ? 'img/slonik-white.svg' : 'img/slonik.svg';
  img.dataset.name = 'PostgreSQL 大象标志';
  return img;
}
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['400 20px "Open Sans"', 'Aa0'], ['600 20px "Open Sans"', 'Aa0'], ['700 20px "Open Sans"', 'Aa0'], ['400 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0']],
  sceneFade: false,
  sceneCut: 0.6,
  chrome() {
    const hud = document.getElementById('hud');
    const cards = [];
    for (const s of L.scenes) {
      if (!s.chap) continue;
      const card = h('div', 'chapter', hud);
      card.dataset.name = '章节卡';
      const wm = pgLogo(card, true);
      const cln = h('div', 'ln', card);
      const no = h('div', 'no', card, s.chap[0]);
      const ti = h('div', 'ti', card, s.chap[1]);
      h('div', 'ft', card, 'PostgreSQL 18.4');
      // 盖上：从上往下展开；收起：向上收回。中间完整停留不少于 2.6 秒
      const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.6;
      tl.fromTo(wm, { scale: 1, y: 0 }, { scale: 1.08, y: -18, duration: s.lead + 0.4, ease: 'none', immediateRender: true }, t0);   // 章节卡停留时大象缓慢推近，画面不死
      tl.fromTo(card, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01, immediateRender: true }, t0);
      tl.fromTo(card, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45, ease: 'power3.inOut', immediateRender: true }, t0);
      tl.fromTo(cln, { width: 160 }, { width: 900, duration: s.lead - 0.6, ease: 'none', immediateRender: true }, t0 + 0.2);   // 停留时横线缓慢延伸
      tl.fromTo(no, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out', immediateRender: true }, t0 + 0.2);
      tl.fromTo(ti, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out', immediateRender: true }, t0 + 0.3);
      tl.to(card, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.5, ease: 'power3.inOut' }, t1);
      tl.set(card, { autoAlpha: 0 }, t1 + 0.5);
      sfx('tick', t0, { g: 0.5 }); sfx('thud', t0 + 0.25, { g: 0.35 });
      cards.push([t0, t1 + 0.5]);
    }
    // 左上角：大象 + PostgreSQL + 当前章名。章节卡盖着时收起
    const brand = h('div', 'hud-brand', hud);
    pgLogo(brand, false, false);
    h('div', 'wm', brand, 'PostgreSQL');
    const ch = h('div', 'ch', brand, '');
    const names = L.scenes.map((s) => [s.start, s.chap ? s.chap[0] + '  ' + s.chap[1] : '']);
    let lastName = null, lastVis = null;
    F((t) => {
      let n = ''; for (const [st, nm] of names) if (t >= st) n = nm;
      if (n !== lastName) { ch.textContent = n; ch.style.display = n ? '' : 'none'; lastName = n; }
      const covered = cards.some(([a, b]) => t >= a + 0.3 && t < b - 0.2);
      const vis = covered ? 'hidden' : 'visible';
      if (vis !== lastVis) { brand.style.visibility = vis; lastVis = vis; }
    });
  },
};
