// 本片的引擎配置：预载字体、箭头颜色、常驻元素（章节卡）、换场方式。
// 换场：硬切（sceneFade:false、无 after）。每次换章都像 1.5 后台「点菜单、整页刷新」：
//   s.start        白页直接盖住旧场景（早于 sceneCut 0.45 的硬切）；页头与菜单是常驻的旧后台外框，菜单当前项为本章
//   +0.15 ~ 0.55   loading 图标步进转动（ajax 等待）
//   +0.5           内容框 slideDown 展开：「第 NN 章」标题条 + 章号 + 章名
//   完全到位后至少 2.7 秒稳定（lead 4.2），c0 前 0.05 秒 fadeOut 收走，露出本章场景
//   常驻层只放白页、外框和 loading（盖硬切）；内容框建在本场景根元素里，稳定段内路线五步依次点亮
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
      const menu = chaps.map((c) => SHORT[c.id] || c.id), who = 'OpenCart 1.5.6.4 · 一次订单请求';
      // 常驻层只负责盖住硬切：白页 + 外框 + loading 图标（t0 → t0+0.55）。
      const cover = h('div', 'chap', hud);
      adminFrame(cover, { menu, active: chaps.indexOf(s), who });
      h('div', 'oc-crumb', cover, `<u>首页</u> :: <u>第 ${s.chap[0]} 章</u>`);
      spinner(cover, 932, 470, t0 + 0.15, t0 + 0.55, { size: 56 });
      appear(cover, t0);                      // 整页刷新：白页直接盖上（半透明过渡会让文字对比度不足）
      vanish(cover, t0 + 0.55);
      // 章节内容框放进本场景的根元素（场景建好后追加，压在场景内容之上）：硬切之后它就是本场景的第一屏，
      // 稳定段里路线上的五步依次点亮、下划线随之移动（画面不会静止 3 秒以上，也提示整条路线）
      const orig = SCENE_BUILDERS[s.id];
      SCENE_BUILDERS[s.id] = (ctx) => {
        if (orig) orig(ctx);
        const card = h('div', 'chap', ctx.root);
        adminFrame(card, { menu, active: chaps.indexOf(s), who });
        h('div', 'oc-crumb', card, `<u>首页</u> :: <u>第 ${s.chap[0]} 章</u>`);
        const bx = ocBox(card, 0, 0, 1728, 560, `第 ${s.chap[0]} 章`, { icon: 'report' });
        bx.el.style.left = ''; bx.el.style.top = '';
        h('div', 'no', bx.bd, `CHAPTER ${s.chap[0]}`);
        const ti = h('div', 'ti', bx.bd, s.chap[1]);
        h('div', 'rule', bx.bd);
        const meta = h('div', 'meta', bx.bd, ['点击', '入口', '检查', '数据', '页面'].map((k) => `<span>${k}</span>`).join(' → '));
        const hold0 = t0 + 1.0, hold1 = c0 - 0.5;
        const ul = h('div', 'abs', meta); css(ul, { left: '0px', top: '44px', width: '0px', height: '5px', background: '#C4561C' });
        let px0 = 0, pw0 = 0;
        [...meta.querySelectorAll('span')].forEach((sp, i) => {
          const tk = hold0 + (hold1 - hold0) * i / 5;
          tl.fromTo(sp, { color: '#666666' }, { color: '#9A3E10', duration: 0.25, ease: 'none', immediateRender: false }, tk);
          const nx = sp.offsetLeft, nw = sp.offsetWidth;
          tl.fromTo(ul, { left: px0, width: pw0 }, { left: nx, width: nw, duration: 0.25, ease: 'power2.out', immediateRender: i === 0 }, tk);
          px0 = nx; pw0 = nw;
        });
        slideDown(bx.el, t0 + 0.5, { d: 0.3 });
        fadeIn(ti, t0 + 0.6, { d: 0.25 });
        fadeOut(card, c0 - 0.3, { d: 0.25 });
      };
      sfx('tick', t0 + 0.02, { g: 0.7 }); sfx('pop', t0 + 0.5, { g: 0.6 }); sfx('thud', t0 + 0.7, { g: 0.35 });
    });
  },
};
