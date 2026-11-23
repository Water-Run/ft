// 本片的引擎配置：字体、箭头颜色、章节卡、场间衔接。
// 衔接：全片是同一扇应用窗口，各场景把窗口画在同一位置；场景之间交叉淡变 0.5 秒，窗口外框不动，只有内容与模式色在变（F29）。
// 有章节卡的场景在章节卡盖满画面之后才出现。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#1f2329', accent: '#2563EB', dim: '#8c919c', white: '#ffffff', blue: '#2563EB', red: '#DC2626', green: '#15803D', amber: '#A16207' };
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'], ['500 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['500 20px "Mono"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    for (const s of L.scenes) {
      if (!s.chap) continue;
      const card = h('div', 'chapter', hud, `<div class="bar"><i style="background:#2563EB"></i><i style="background:#DC2626"></i><i style="background:#15803D"></i><i style="background:#A16207"></i></div><div class="no">${s.chap[0]}</div><div class="ti">${s.chap[1]}</div>`);
      const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.45;
      wipe(card, t0, { dir: 'l', d: 0.45 }); wipeOut(card, t1, { dir: 'r', d: 0.45 });
      const ti = card.querySelector('.ti');
      fromTo(ti, t0 + 0.3, { scale: 1 }, { scale: 1.02, duration: t1 - t0 - 0.3, ease: 'none', transformOrigin: '0 50%' });   // 停留时整张极慢推近一次（≤3%）
      sfx('whoosh', t0, { g: 0.45 }); sfx('thud', t0 + 0.32, { g: 0.5 });
    }
  },
  after() {
    L.scenes.forEach((s, i) => {
      const root = document.getElementById('sc-' + s.id), nx = L.scenes[i + 1];
      const a = i === 0 ? -1 : (s.chap ? s.start + s.lead - 0.5 : s.start - 0.25);
      const b = nx ? (nx.chap ? nx.start + 0.5 : nx.start + 0.3) : Infinity;
      F((t) => { root.style.display = (t >= a && t < b) ? '' : 'none'; });
      if (i > 0 && !s.chap) tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.inOut', immediateRender: true }, s.start - 0.25);
    });
  },
};
