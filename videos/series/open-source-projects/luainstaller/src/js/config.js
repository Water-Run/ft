// 本片的引擎配置：字体、场间转场、字幕配色。
// 场景各自带底色（纸白 / 藏蓝）。转场只有两种：圆形光圈（新场景从一个圆里展开）和直线推移，与全片「圆与直线」的图形语言一致。
window.PALETTE = { fg: 'currentColor', navy: '#000080', white: '#ffffff' };
// 进入各场景的方式。iris: 以 (x, y) 为圆心、从半径 r0 展开；wipe: 一条竖直的边从左扫到右。at 为相对场景起点的偏移
const fromEmblem = { type: 'iris', x: 1770, y: 112, r0: 12, d: 1.15 };
window.TRANS = {
  // 标题里的那轮「月亮」继续变大，成为第 01 章的纸白底；此后每次换章，都从角上那颗小行星里展开
  before: (s) => { const m = titleMoon(s.start, window.TITLE_T); return { type: 'iris', x: m.x, y: m.y, r0: m.r, d: 1.0 }; },
  what: fromEmblem, install: fromEmblem, use: fromEmblem, scope: fromEmblem, how: fromEmblem, outro: fromEmblem,
};
window.ENGINE = {
  fonts: [['800 20px "Inter"', 'Aa0'], ['500 20px "Inter"', 'Aa0'], ['900 20px "Sans SC"', '字'], ['500 20px "Sans SC"', '字'], ['500 20px "Mono"', 'A0'], ['400 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0']],
  sceneFade: false,
  after() {
    const io = gsap.parseEase('expo.inOut');
    const enters = [];
    L.scenes.forEach((s, i) => {
      const root = document.getElementById('sc-' + s.id);
      root.style.zIndex = String(i + 1);
      let tr_ = i === 0 ? { type: 'cut' } : (window.TRANS[s.id] || { type: 'cut' });
      if (typeof tr_ === 'function') tr_ = tr_(s);
      const te = i === 0 ? -1 : s.start + (tr_.at || 0), d = tr_.type === 'cut' ? 0 : (tr_.d || 0.9);
      enters.push({ te, d, root, ground: root.dataset.ground || 'paper' });
      if (i === 0) return;
      const R = Math.hypot(Math.max(tr_.x || 0, W - (tr_.x || 0)), Math.max(tr_.y || 0, H - (tr_.y || 0))) + 40;
      if (tr_.type === 'iris') { sfx('riser', te - 0.55, { g: 0.5 }); sfx('thud', te + d * 0.42, { g: 0.7 }); }
      if (tr_.type === 'wipe') sfx('whoosh', te, { g: 0.8 });
      let last = '';
      F((t) => {
        let disp = '', clip = 'none';
        if (t < te) disp = 'none';
        else if (t < te + d) {
          const k = io((t - te) / d);
          clip = tr_.type === 'iris' ? `circle(${((tr_.r0 || 0) + (R - (tr_.r0 || 0)) * k).toFixed(1)}px at ${tr_.x}px ${tr_.y}px)` : `inset(0 ${(100 * (1 - k)).toFixed(2)}% 0 0)`;
        }
        const key = disp + clip;
        if (key === last) return; last = key;
        root.style.display = disp; root.style.clipPath = clip;
      });
    });
    // 被完全盖住的场景不再绘制；字幕颜色跟随当前底色
    const cap = document.getElementById('caption');
    let lastK = -1;
    F((t) => {
      let k = 0;
      for (let i = 0; i < enters.length; i++) if (t >= enters[i].te + enters[i].d) k = i;
      let kc = 0;
      for (let i = 0; i < enters.length; i++) if (t >= enters[i].te + enters[i].d * 0.5) kc = i;
      const key = k * 100 + kc;
      if (key === lastK) return; lastK = key;
      enters.forEach((e, i) => { if (i < k) e.root.style.display = 'none'; else if (i === k) e.root.style.display = ''; });
      cap.className = enters[kc].ground === 'navy' ? 'on-navy-cap' : 'on-paper-cap';
    });
  },
};
