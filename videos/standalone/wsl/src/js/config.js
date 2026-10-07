// 本片的引擎配置：字体、颜色、各场景的年代、常驻元素（底栏：三个答案格与日期；章节卡）、换场。
document.documentElement.classList.add(LANG);            // 样式表可按语言微调：.en #caption span { … }
// 设计阶段的对照方向：地址带 ?dir=b 时载入 design/dir-b.css（全片一套中性平面样式）。正片不带这个参数
if (new URLSearchParams(location.search).get('dir') === 'b') { document.documentElement.classList.add('dir-b'); const lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.href = 'design/dir-b.css'; document.head.appendChild(lk); }
window.PALETTE = { ink: '#1b1b1b', dim: '#5c5c5c', ac: '#005fb8', w10: '#0078d7', fl: '#0078d4', black: '#000000', white: '#ffffff', bad: '#c42b1c', good: '#0f7b0f', term: '#cccccc', gray: '#8f8f8f' };
const C = window.PALETTE;
const VH = 968;                                           // 底栏以上的画幅高度；镜头以这块区域为画幅
// 每个场景属于哪个年代：决定场景根、章节卡与底栏的皮肤
const ERA = { open: 'w11', one: 'w10', two: 'fl', num: 'w11', three: 'w11', end: 'w11', outro: 'w11' };
const YEAR = { one: '2016', two: '2019', num: '2021 – 2025', three: '2026' };
const CUT = 0.45;                                         // 有章节卡的场景：开始后这么久硬切，那一刻由章节卡盖住
const SWIPE = 0.6;                                        // 没有章节卡的场景：新场景由右向左刷入的时长
// 底栏上的日期与答案格：场景登记「某一刻起显示什么」
const CLOCK = [], SLOT = [];
const clockAt = (t, text) => CLOCK.push([t, text]);
const slotOn = (i, t) => SLOT.push([t, i]);
const nf = (n) => Number(n).toLocaleString('en-US');

window.ENGINE = {
  fonts: [['200 20px "Inter"', 'Aa0'], ['300 20px "Inter"', 'Aa0'], ['400 20px "Inter"', 'Aa0'], ['500 20px "Inter"', 'Aa0'], ['600 20px "Inter"', 'Aa0'], ['700 20px "Inter"', 'Aa0'], ['800 20px "Inter"', 'Aa0'], ['100 20px "Inter"', '01'],
    ['200 20px "Sans SC"', '字A'], ['300 20px "Sans SC"', '字A'], ['400 20px "Sans SC"', '字A'], ['500 20px "Sans SC"', '字A'], ['600 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['800 20px "Sans SC"', '字A'],
    ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0']],
  sceneFade: false,
  chrome() {
    const hud = document.getElementById('hud');
    const eraAt = (t) => { let e = ERA[L.scenes[0].id]; for (const s of L.scenes) if (t >= s.start + (s.chap ? CUT : SWIPE * 0.5)) e = ERA[s.id]; return e; };
    // ── 底栏 ──
    const strip = h('div', 'strip', hud, '<div class="fill"></div>');
    const slots = h('div', 'slots', strip);
    const cells = [1, 2, 3].map((n) => h('div', 'slot', slots, `<span>${n}</span>`));
    const clock = h('div', 'clock', strip);
    let lastEra = null, lastClock = null, lastSlots = null;
    F((t) => {
      const era = eraAt(t);
      if (era !== lastEra) { strip.className = 'strip era-' + era; document.documentElement.classList.toggle('cap-dark', era === 'w10'); lastEra = era; }
      let txt = '', at = -1; for (const [a, v] of CLOCK) if (t >= a && a >= at) { txt = v; at = a; }      // 场景在常驻元素之后才登记，所以每帧现找「不晚于此刻的最后一条」
      if (txt !== lastClock) { clock.textContent = txt; lastClock = txt; }
      const on = [0, 1, 2].map((i) => (SLOT.some(([a, k]) => k === i && t >= a) ? '1' : '0')).join('');
      if (on !== lastSlots) { cells.forEach((c, i) => c.classList.toggle('on', on[i] === '1')); lastSlots = on; }
    });
    // ── 章节卡：整屏，按该章的年代做 ──
    for (const s of L.scenes) {
      if (!s.chap) continue;
      const era = ERA[s.id], card = h('div', 'chapter era-' + era, hud);
      const t0 = s.start + 0.04, t1 = s.start + s.lead - 0.5;
      if (era !== 'w10') {                                   // 亚克力 / Mica：色团上压一块半透明的板
        [['a', -200, -260, 1100], ['b', 1100, 300, 1000], ['c', 500, 560, 900]].forEach(([k, x, y, d]) => { const b = h('div', 'blob ' + k, card); px(b, x, y, d, d); });
        const pl = h('div', 'plate', card); px(pl, era === 'fl' ? 96 : 150, era === 'fl' ? 90 : 150, era === 'fl' ? 1728 : 1620, era === 'fl' ? 900 : 780);
        fromTo(pl, t0 + 0.12, { y: 90, scale: 0.94 }, { y: 0, scale: 1, duration: 0.55, ease: 'power3.out' });
      }
      const no = h('div', 'no', card, s.chap[0]), ti = h('div', 'ti', card, s.chap[1]), yr = h('div', 'yr', card, YEAR[s.id] || '');
      if (era === 'w10') {                                   // Windows 10：整块纯色从左刷入，字从右滑到位
        wipe(card, t0, { dir: 'l', d: 0.4 }); wipeOut(card, t1, { dir: 'r', d: 0.4 });
        slide(no, t0 + 0.22, { x: 260, d: 0.5, ease: 'power4.out' }); slide(ti, t0 + 0.34, { x: 200, d: 0.5, ease: 'power4.out' }); slide(yr, t0 + 0.46, { x: 120, d: 0.45, ease: 'power4.out' });
      } else if (era === 'fl') {                             // Fluent：自上而下铺开，标题由下升起
        wipe(card, t0, { dir: 't', d: 0.4 }); wipeOut(card, t1, { dir: 'b', d: 0.4 });
        slam(no, t0 + 0.3, { from: 1.25, d: 0.45 }); wipe(ti, t0 + 0.48, { dir: 'l', d: 0.45 }); show(yr, t0 + 0.6, { y: 0, x: 40, d: 0.4 });
      } else {                                               // Windows 11：自下而上铺开，数字带一点回弹
        wipe(card, t0, { dir: 'b', d: 0.4 }); wipeOut(card, t1, { dir: 't', d: 0.4 });
        slam(no, t0 + 0.3, { from: 0.7, d: 0.5, ease: 'back.out(1.8)' }); slide(ti, t0 + 0.44, { y: 70, d: 0.5 }); show(yr, t0 + 0.6, { y: 0, x: 40, d: 0.4 });
      }
      sfx('whoosh', t0 - 0.04, { g: 0.8 }); sfx('thud', t0 + 0.34, { g: 0.7 }); sfx('pop', t0 + 0.5, { g: 0.5 }); sfx('whoosh', t1, { g: 0.6 });
    }
  },
  after() {
    // 场景的显隐。有章节卡的场景：章节卡盖住画面时硬切。没有章节卡的（落点、片尾）：新场景由右向左刷入，旧场景留到刷完。
    const roots = L.scenes.map((s) => document.getElementById('sc-' + s.id));
    roots.forEach((r, i) => r.classList.add('era-' + ERA[L.scenes[i].id]));
    const last = roots.map(() => null);
    F((t) => {
      L.scenes.forEach((s, i) => {
        const nx = L.scenes[i + 1], root = roots[i];
        const from = i === 0 ? -1 : s.start + (s.chap ? CUT : 0), to = nx ? nx.start + (nx.chap ? CUT : SWIPE) : Infinity;
        const vis = t >= from && t < to;
        root.style.display = vis ? '' : 'none';
        let clip = 'none';
        if (vis && i > 0 && !s.chap && t < s.start + SWIPE) clip = `inset(0px 0px 0px ${(1920 * (1 - ease.io3(clamp((t - s.start) / SWIPE)))).toFixed(1)}px)`;
        if (clip !== last[i]) { root.style.clipPath = clip; last[i] = clip; }
      });
    });
    for (const s of L.scenes.slice(1)) if (!s.chap) sfx('whoosh', s.start, { g: 0.7 });
  },
};
