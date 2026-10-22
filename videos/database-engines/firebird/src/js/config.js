// 本片的引擎配置：方向 1「官网」。常驻元素取自 firebirdsql.org 的页头：深色导航条（标志 + 页签 + 版本框）与正文上方的面包屑。
// 章节即导航页签：换章时青色选中块移到新页签，导航条下方整页换成章节卡；章名随后缩进面包屑，整章常驻。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#17222B', teal: '#2e6474', flame: '#F68A21', gold: '#FAAC19', fire: '#EE2B24', g3: '#B9BCBF', white: '#FFFFFF' };
const TABS = [['', 'Firebird'], ['01', '来历'], ['02', '两个入口'], ['03', '页与槽'], ['04', '查询'], ['05', '更新'], ['06', '提交']];
const CARDS = [];
const TAB_OF = { open: 0, history: 1, engine: 2, store: 3, query: 4, update: 5, durable: 6, outro: 0, next: 0, credits: 0 };
window.ENGINE = {
  fonts: [['400 20px "Sans SC"', '字A'], ['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['200 20px "Heebo"', 'Aa0'], ['400 20px "Heebo"', 'Aa0'],
    ['500 20px "Heebo"', 'Aa0'], ['700 20px "Heebo"', 'Aa0'], ['800 20px "Heebo"', 'Aa0'], ['400 20px "Mono"', 'A0'], ['600 20px "Mono"', 'A0']],
  sceneFade: false,
  sceneCut: 0.45,
  chrome() {
    const hud = document.getElementById('hud');
    // 导航条
    const bar = h('div', '', hud); bar.id = 'bar';
    h('div', 'brand', bar, '<img class="m" src="img/fb-mark.png"><img class="w" src="img/fb-word-white.png">');
    const hi = h('div', 'hi', bar);
    const tabs = h('div', 'tabs', bar);
    const tabEls = TABS.map(([n, t]) => h('div', 'tab', tabs, (n ? `<b>${n}</b>` : '') + t));
    const ver = h('div', 'ver', bar, 'Firebird 5.0.4');
    window.BAR = { bar, ver, tabs: tabEls };
    const tb = tabEls.map((e) => { const b = box(e, bar); return { x: b.x, w: b.w }; });
    // 选中块：每场开始时从上一个页签移到本场的页签（由 t 直接算出）
    const marks = L.scenes.map((s) => ({ t: s.start + 0.05, i: TAB_OF[s.id] != null ? TAB_OF[s.id] : 0 }));
    F((t) => {
      let k = 0; while (k + 1 < marks.length && marks[k + 1].t <= t) k++;
      const from = k > 0 ? marks[k - 1].i : marks[0].i, to_ = marks[k].i;
      const e = ease.io3(clamp((t - marks[k].t) / 0.5));
      const x = lerp(tb[from].x, tb[to_].x, e), w = lerp(tb[from].w, tb[to_].w, e);
      hi.style.left = x.toFixed(1) + 'px'; hi.style.width = w.toFixed(1) + 'px';
    });
    for (const m of marks.slice(1)) if (m.i !== marks[marks.indexOf(m) - 1].i) sfx('tick', m.t, { g: 0.7, p: -0.3 });
    // 面包屑与章节卡
    for (const s of L.scenes) {
      if (!s.chap) continue;
      const card = h('div', 'chapter', hud);
      const no = h('div', 'no', card, s.chap[0]);
      const rl = h('div', 'rl', card);
      const ti = h('div', 'abs', hud, s.chap[1]);
      const fs = Math.min(120, Math.floor(1010 / [...s.chap[1]].length));
      css(ti, { left: '790px', top: (334 + (120 - fs) * 0.6) + 'px', fontSize: fs + 'px', fontWeight: 700, whiteSpace: 'nowrap', transformOrigin: '0 0' });
      const cr = h('div', 'abs', hud, `Firebird 5.0.4 <span style="color:#B9BCBF">/</span> <b style="font-weight:500;color:#17222B">${s.chap[0]} ${s.chap[1]}</b>`);
      css(cr, { left: '120px', top: '100px', fontSize: '28px', color: '#3A434B', whiteSpace: 'nowrap' });
      const crT = cr.querySelector('b');
      const tb0 = box(ti), tb1 = box(crT);
      const t0 = s.start + 0.02, tOut = s.start + s.lead - 0.55;
      wipe(card, t0, { dir: 't', d: 0.42, ease: 'power2.inOut' });
      slide(no, t0 + 0.32, { x: -70, d: 0.55, ease: 'power3.out' }); sfx('thud', t0 + 0.34, { g: 0.8, p: -0.5 });
      wipe(ti, t0 + 0.46, { dir: 'l', d: 0.55 });
      wipe(rl, t0 + 0.7, { dir: 'l', d: 0.6 });
      // 退场：页面卷回导航条；章名缩小飞进面包屑，交代去向
      vanish(card, t0 + 1.35);                       // 刷满之后交给场景里的同款卡（after() 里建），常驻层只留章名
      CARDS.push({ s, tIn: t0 + 1.35, tOut });
      tl.to(ti, { x: tb1.x - tb0.x, y: tb1.y - tb0.y, scale: 28 / fs, duration: 0.6, ease: 'power3.inOut' }, tOut);
      vanish(ti, tOut + 0.6);
      appear(cr, tOut + 0.6);
      vanish(cr, s.end + 0.02);
    }
  },
  after() {
    // 场景硬切（同 sceneFade: false 的缺省）：本场开始后 0.45 秒到下一场开始后 0.45 秒之间显示，切换那一刻由章节卡盖住
    L.scenes.forEach((s, idx) => {
      const root = document.getElementById('sc-' + s.id), nx = L.scenes[idx + 1];
      const a = idx === 0 ? -1 : s.start + 0.45, b = nx ? nx.start + 0.45 : Infinity;
      F((t) => { root.style.display = (t >= a && t < b) ? '' : 'none'; });
    });
    // 章节卡在场景里的副本：与常驻层的卡同位同样，接手停留与卷回；停留时编号极慢地右移
    for (const { s, tIn, tOut } of CARDS) {
      const root = document.getElementById('sc-' + s.id);
      const card = h('div', 'chapter', root); card.dataset.name = '章节卡 ' + s.chap[0];
      const no = h('div', 'no', card, s.chap[0]); h('div', 'rl', card);
      appear(card, tIn);
      tl.fromTo(no, { x: 0 }, { x: 40, duration: tOut - tIn, ease: 'none', immediateRender: true }, tIn);
      wipeOut(card, tOut, { dir: 't', d: 0.42, ease: 'power2.in' });
    }
  },
};
