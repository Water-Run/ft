// 本片的引擎配置：字体、箭头颜色、常驻元素（身份标识、章节卡）、换场方式。
// 章节卡沿用手册架构图的语汇：暖灰底、深青章节号、一排页小方块在卡片停留时一格格填满。场景之间硬切，切点由章节卡盖住。
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
    for (const s of L.scenes) {
      if (!s.chap) continue;
      const card = h('div', 'chapter', hud, `<div class="no">${s.chap[0]}</div><div class="ti">${s.chap[1]}</div><div class="row"></div>`);
      const row = card.querySelector('.row');
      const N = 16, cells = [];
      for (let i = 0; i < N; i++) cells.push(h('i', '', row));
      const t0 = s.start + 0.05, t1 = s.start + s.lead - 0.45;
      wipe(card, t0, { dir: 'l', d: 0.4 }); wipeOut(card, t1, { dir: 'r', d: 0.4 });
      let last = -1;
      F((t) => { const k = Math.round(clamp((t - (t0 + 0.6)) / (t1 - t0 - 1.0)) * N); if (k === last) return; last = k; cells.forEach((c, i) => c.classList.toggle('on', i < k)); });
      sfx('whoosh', t0 - 0.05, { g: 0.5 }); sfx('thud', t0 + 0.32, { g: 0.5 });
    }
  },
};
