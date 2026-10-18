// 本片的引擎配置：预载字体、箭头颜色、常驻元素（章节卡）、换场方式。
// 换场：硬切（sceneFade:false、无 after）。每次换章都像 1.5 后台「点菜单、整页刷新」：
//   s.start        白页淡入盖住旧场景（0.2 秒，早于 sceneCut 0.45 的硬切）；页头与菜单是常驻的旧后台外框，菜单当前项为本章
//   +0.15 ~ 0.55   loading 图标步进转动（ajax 等待）
//   +0.35          内容框 slideDown 展开：「第 NN 章」标题条 + 章号 + 章名
//   完全到位后至少 2.7 秒稳定（lead 4.2），c0 前 0.05 秒 fadeOut 收走，露出本章场景
// 没有章节卡的场景（close / end）在 s.start 用一次白色刷新闪屏盖住硬切。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#1d1d1d', accent: '#C4561C', req: '#C4561C', res: '#0F6193', dim: '#8E9AA6', title: '#003A88' };
window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['800 20px "Sans SC"', '字A'], ['500 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['500 20px "Mono"', 'A0']],
  sceneFade: false,
  sceneCut: 0.45,
  chrome() {
    const hud = document.getElementById('hud');
    const chaps = L.scenes.filter((s) => s.chap);
    const SHORT = { request: '请求', login: '登录', session: '会话', permissions: '权限', database: '数据库', query: '查询', page: '页面', write: '写入', case: '案例' };
    L.scenes.forEach((s, idx) => {
      if (!s.chap) {
        if (idx === 0) return;
        // 无章节卡的换场：整页刷新闪屏，盖住 s.start + sceneCut 的硬切
        const fl = h('div', 'chap', hud); fl.setAttribute('data-overlap-ok', '');
        F((t) => {
          const k = (t - s.start) / 0.8;
          const a = k < 0 || k >= 1 ? 0 : k < 0.35 ? k / 0.35 : 1 - (k - 0.35) / 0.65;
          fl.style.opacity = a.toFixed(3); fl.style.visibility = a > 0 ? 'visible' : 'hidden';
        });
        sfx('tick', s.start + 0.05, { g: 0.6 });
        return;
      }
      const t0 = s.start, c0 = s.start + s.lead - 0.35;
      const card = h('div', 'chap', hud);
      const fr = adminFrame(card, { menu: chaps.map((c) => SHORT[c.id] || c.id), active: chaps.indexOf(s), who: 'OpenCart 1.5.6.4 · 一次订单请求' });
      const crumb = h('div', 'oc-crumb', card, `<u>首页</u> :: <u>第 ${s.chap[0]} 章</u>`);
      const bx = ocBox(card, 0, 0, 1728, 560, `第 ${s.chap[0]} 章`, { icon: 'report' });
      bx.el.style.left = ''; bx.el.style.top = '';
      const no = h('div', 'no', bx.bd, `CHAPTER ${s.chap[0]}`);
      const ti = h('div', 'ti', bx.bd, s.chap[1]);
      h('div', 'rule', bx.bd);
      h('div', 'meta', bx.bd, '点击 → 入口 → 检查 → 数据 → 页面');
      spinner(card, 932, 470, t0 + 0.15, t0 + 0.55, { size: 56 });
      fadeIn(card, t0, { d: 0.2 });
      slideDown(bx.el, t0 + 0.35, { d: 0.35 });
      fadeIn(ti, t0 + 0.45, { d: 0.3 });
      fadeOut(card, c0 - 0.4, { d: 0.35 });
      sfx('tick', t0 + 0.02, { g: 0.7 }); sfx('pop', t0 + 0.4, { g: 0.6 }); sfx('thud', t0 + 0.6, { g: 0.35 });
      void fr; void crumb; void no;
    });
  },
};
