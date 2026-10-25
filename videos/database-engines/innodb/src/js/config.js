// 本片的引擎配置：字体、箭头颜色、常驻元素（身份标识）、换场方式。
// 章节卡沿用手册架构图的语汇：暖灰底、深青章节号，下面一排页小方块一格格填满。
// 章节卡是每一章自己的第一拍（放在本场的容器里，不放常驻层）：场景之间硬切，切到下一章时先看到它的章节卡，
// 卡片停留约 3 秒、一排页方块随之填满，然后向右收走，露出本章内容。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#15191C', main: '#00758F', mainD: '#2D5A68', acc: '#B5452E', mute: '#8D9599', ink2: '#4A5358' };
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'], ['500 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['500 20px "Mono"', 'A0']],
  sceneFade: false,
  sceneCut: 0.45,
  chrome() {
    const hud = document.getElementById('hud');
    // 全片共用的 SVG 定义（斜纹等），放在常驻层里，各场景的 SVG 都能引用
    const g = svg('svg', { width: 0, height: 0, style: 'position:absolute' }, document.getElementById('bg'));
    g.innerHTML = '<defs><pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
      + '<rect width="14" height="14" fill="#F3DCD5"/><line x1="0" y1="0" x2="0" y2="14" stroke="#B5452E" stroke-width="5"/></pattern></defs>';
    const ident = h('div', 'ident', hud, '<i></i>InnoDB<b>MySQL 9.7.4</b>');
    // 开场前两句还在讲 MyISAM，身份标识等 InnoDB 的名字出来再亮
    vanish(ident, 0); show(ident, T('h15', 'InnoDB'), { y: 0, d: 0.5 });
  },
  after() {
    const cut = 0.45;
    L.scenes.forEach((s, idx) => {
      const root = document.getElementById('sc-' + s.id), nx = L.scenes[idx + 1];
      // 硬切：本场从「本场开始后 cut 秒」显示到「下一场开始后 cut 秒」（与引擎缺省的硬切相同）
      const a = idx === 0 ? -1 : s.start + cut, b = nx ? nx.start + cut : Infinity;
      F((t) => { const v = t >= a && t < b ? '' : 'none'; if (root.style.display !== v) root.style.display = v; });
      if (!s.chap) return;
      const card = h('div', 'chapter', root, `<div class="no">${s.chap[0]}</div><div class="ti">${s.chap[1]}</div><div class="row"></div>`);
      const row = card.querySelector('.row'), no = card.querySelector('.no');
      const N = 16, cells = [];
      for (let i = 0; i < N; i++) cells.push(h('i', '', row));
      const t0 = s.start + cut, t1 = s.start + s.lead - 0.45;
      slam(no, t0, { from: 1.25, d: 0.35 });
      wipeOut(card, t1, { dir: 'r', d: 0.4 });
      tl.fromTo(card, { scale: 1 }, { scale: 1.03, duration: Math.max(0.5, t1 - t0), ease: 'none', immediateRender: false, transformOrigin: '120px 50%' }, t0);   // 与 MyISAM 一集的章节卡相同：停留时轻微推近
      let last = -1;
      F((t) => { const k = Math.round(clamp((t - (t0 + 0.3)) / (t1 - t0 - 0.5)) * N); if (k === last) return; last = k; cells.forEach((c, i) => c.classList.toggle('on', i < k)); });
      sfx('whoosh', t0 - 0.05, { g: 0.5 }); sfx('thud', t0 + 0.1, { g: 0.5 });
    });
  },
};
