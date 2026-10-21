// 本片的引擎配置：字体、颜色名、常驻元素（左上身份标识、右上截止时间、告警横幅式章节卡）。
// 换场：硬切。每章开头由章节卡盖满画面，切换的那一刻藏在章节卡后面。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#e2e4ef', accent: '#ff3b3b', dim: '#8a90b4', php: '#777bb3', amber: '#ffb020', green: '#3ddc84' };
// 监控屏底纹：每个场景的 world 底下铺一层淡网格，随镜头一起动（告警屏的视觉语汇，也让缓慢的镜头漂移在像素上可见）
function screenGrid(world) {
  const s = svg('svg', { width: 12000, height: 4000, 'data-name': '底纹网格' }, world);
  css(s, { position: 'absolute', left: '-2000px', top: '-1000px', pointerEvents: 'none' });
  const defs = svg('defs', {}, s);
  const pat = svg('pattern', { id: 'g-' + world.parentNode.id, width: 80, height: 80, patternUnits: 'userSpaceOnUse' }, defs);
  svg('path', { d: 'M 80 0 L 0 0 0 80', fill: 'none', stroke: '#1a1f44', 'stroke-width': 2 }, pat);
  svg('rect', { width: 12000, height: 4000, fill: `url(#${pat.id})` }, s);
  world.insertBefore(s, world.firstChild);
}
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'], ['500 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0']],
  sceneFade: false,
  sceneCut: 0.45,
  chrome() {
    const hud = document.getElementById('hud');
    const credits = L.scenes.find((s) => s.id === 'credits');
    const tEnd = credits ? credits.start : L.total;

    // 左上：身份标识。全片常驻（片尾名单除外）
    const id = h('div', 'hud-id', hud, `<span class="sq"></span><span>PHP2Shell</span><span class="cve">CVE-2026-109618 · 109619</span>`);
    id.dataset.name = '身份标识';
    // 右上：信息截止时间
    const cut = h('div', 'hud-cut', hud, tr(`信息截至 <b>北京时间 ${DATA.cutoff_bj}</b>`, `As of <b>${DATA.cutoff_bj} UTC+8</b>`));
    const oT = L.cues.oT;
    wipe(id, oT.start + 0.4, { dir: 'l', d: 0.5 });
    wipe(cut, oT.start + 0.55, { dir: 'r', d: 0.5 });
    hide(id, tEnd - 0.1, { d: 0.3 }); hide(cut, tEnd - 0.1, { d: 0.3 });

    // 章节卡：红色告警横幅从左侧砸进，上下两条警示斜纹
    for (const s of L.scenes) {
      if (!s.chap) continue;
      const card = h('div', 'chapter', hud);
      const band = h('div', 'band', card);
      const st1 = h('div', 'stripe', card); css(st1, { top: '296px' });
      const st2 = h('div', 'stripe', card); css(st2, { top: '750px' });
      for (const st of [st1, st2]) for (let k = 0; k < 40; k++) px(h('i', '', st), k * 52, 0);   // 警示斜纹：琥珀与黑相间
      const no = h('div', 'no', card, `${s.chap[0]} / 05`);
      const ti = h('div', 'ti', card, s.chap[1]);
      const t0 = s.start - 0.3, t1 = s.start + s.lead - 0.2;   // 提前 0.3 秒盖上（上一场的留白里），晚 0.2 秒收走：卡上的字要读得完
      appear(card, t0);
      fromTo(band, t0, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.32, ease: 'power4.out' });
      slide(st1, t0 + 0.08, { x: -400, d: 0.4 }); slide(st2, t0 + 0.12, { x: 400, d: 0.4 });
      slide(no, t0 + 0.18, { x: -80, d: 0.3 });
      slam(ti, t0 + 0.26, { from: 1.15, d: 0.4 });
      sfx('thud', t0 + 0.3, { g: 0.45 });   // 配乐在同一时刻有重击，音效压轻
      // 停留时斜纹缓慢反向流动
      fromTo(st1, t0 + 0.5, { x: 0 }, { x: 52 * 3, duration: t1 - t0 - 0.5, ease: 'none', immediateRender: false });
      fromTo(st2, t0 + 0.55, { x: 0 }, { x: -52 * 3, duration: t1 - t0 - 0.55, ease: 'none', immediateRender: false });
      fromTo(ti, t0 + 0.7, { x: 0 }, { x: 48, duration: t1 - t0 - 0.7, ease: 'none', immediateRender: false });   // 标题极慢右移
      wipeOut(card, t1, { dir: 'r', d: 0.36 });
    }
  },
};
