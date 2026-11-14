// 本片的引擎配置：字体、箭头可用的颜色、常驻元素（网格底、左上角身份、右上角章名、整屏的黄章节卡）、换场方式。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#F9F9F9', accent: '#FAFF69', dim: '#A0A0A0', line: '#414141' };
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'], ['500 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0']],
  sceneFade: false,         // 硬切：每章开头由整屏的黄章节卡盖住
  sceneCut: 0.45,
  chrome() {
    // 细网格底（用 SVG 画，不用渐变）
    const bg = document.getElementById('bg');
    bg.innerHTML = '<svg viewBox="0 0 1920 1080"><defs><pattern id="gp" width="120" height="120" patternUnits="userSpaceOnUse"><path d="M120 0H0V120" fill="none" stroke="#282828" stroke-width="2"/></pattern></defs><rect width="1920" height="1080" fill="url(#gp)" opacity="0.5"/></svg>';
    const hud = document.getElementById('hud');
    const idt = h('div', 'idtag', hud, '<i></i>ClickHouse <span>26.8 LTS</span>');
    const chl = h('div', 'chlab', hud, '');
    const rule = h('div', 'hrule', hud);
    const chaps = L.scenes.filter((s) => s.chap);
    const first = chaps[0], last = L.scenes[L.scenes.length - 1];
    for (const el of [idt, chl, rule]) vanish(el, 0);
    const tShow = first.start + first.lead - 0.35;
    appear(idt, tShow); appear(chl, tShow); fromTo(rule, tShow, { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' });
    vanish(idt, last.start); vanish(chl, last.start); vanish(rule, last.start);
    const k = keyed(chl);
    for (const s of chaps) {
      const ask = (SCRIPT.find((x) => x.id === s.id) || {}).ask;
      const card = h('div', 'chapter', hud, `<div class="part">PART 5</div><div class="no">${s.chap[0]}</div><div class="ti">${s.chap[1]}</div>${ask ? `<div class="ask">${esc(ask)}</div>` : ''}`);
      const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.45;
      wipe(card, t0, { dir: 'l', d: 0.4 }); wipeOut(card, t1, { dir: 'r', d: 0.4 });
      const askEl = card.querySelector('.ask'); if (askEl) wipe(askEl, t0 + 0.4, { dir: 'l', d: 0.4 });
      const idx = chaps.indexOf(s);
      chaps.forEach((c2, k) => {
        const sq = h('div', 'csq' + (k < idx ? ' done' : ''), card, ''); css(sq, { left: (100 + k * 56) + 'px' });
        appear(sq, t0 + 0.6 + k * 0.06);
        if (k === idx) classAt(sq, 'cur', t0 + 1.1);
      });
      const cnt = h('div', 'ccnt', card, `${s.chap[0]} / ${chaps.length}`); appear(cnt, t0 + 2.0);
      sfx('whoosh', t0 - 0.05); sfx('thud', t0 + 0.32, { g: 0.6 });
      k.at(s.start + s.lead - 0.35, { html: `<b>PART 5</b>${s.chap[0]} · ${s.chap[1]}` });
    }
  },
};
