// 本片的引擎配置：字体、颜色、节拍、常驻元素（章节卡、角标、金手指进度）。
// 视觉系统「内存条」见 css/style.css 开头；节拍与配乐共用一条 108 拍/分的网格（tools/music.py 读同一个数）。
document.documentElement.classList.add(LANG);
const C = { field: '#0B5B3E', deep: '#06402B', line: '#137050', white: '#F4F1E4', gray: '#8DAA99', ink: '#0B1410', gold: '#F5C242', pale: '#A9CDB9' };
window.PALETTE = { white: C.white, gold: C.gold, ink: C.ink, gray: C.gray, pale: C.pale, field: C.field };

// ── 节拍：画面上的重音落在配乐的拍子上 ──
const BPM = 108, BEAT = 60 / BPM, BAR = 4 * BEAT;
const qb = (t, div = 2) => Math.round(t / (BEAT / div)) * (BEAT / div);       // 就近取到八分音符（div=2）或十六分音符（div=4）
const qn = (t, div = 2) => Math.ceil(t / (BEAT / div) - 1e-6) * (BEAT / div);  // 不早于 t 的下一个拍点

// 章名只在画面上（脚本的 chap 字段保持确认稿原样）
const CHAPTERS = {
  count: ['01', '引用计数', 'Reference counting'],
  trace: ['02', '标记—清扫', 'Mark and sweep'],
  gen: ['03', '分代', 'Generational collection'],
  tri: ['04', '三色与写屏障', 'Tri-color marking, write barriers'],
  cost: ['05', '谁来买单', 'Who pays'],
};
// 换章：上一章被「回收」。32×18 块格子按本章机制的顺序长满画面（前沿是金色，收集器经过的地方），
// 章名读完后再按另一种顺序收走，露出新的一章。cover 的落点 = 配乐的强拍（tools/music.py 用同一条公式）。
const coverAt = (s) => qb(s.start + 0.25, 1);
const ORDER = {
  count(i, j, r) { return r; },                                    // 引用计数：各自归零、各自释放，没有先后
  trace(i, j) { return i / 31; },                                  // 标记—清扫：一道竖线从左扫到右
  gen(i, j) { return (17 - j) / 17 * 0.7 + (j % 6) / 6 * 0.3; },   // 分代：从下往上，一层一层
  tri(i, j) { return Math.min(1, (Math.abs(i - 3) + Math.abs(j - 9)) / 36); },   // 三色：从根出发的波
  cost(i, j) { return (j + i / 32) / 18; },                        // 账单：一行一行打印出来
  close(i, j) { return Math.min(1, Math.hypot(i - 15.5, j - 8.5) / 17.7); },     // 收束：从中心向外
};

window.ENGINE = {
  fonts: [['900 20px "Serif SC"', '垃圾回收的艺术引用计数标记清扫分代三色与写屏障谁来买单'], ['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Inter"', 'Aa0'], ['600 20px "Inter"', 'Aa0'], ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0']],
  sceneFade: false,
  sceneCut: 0.6,            // 晚于任何一次换章的盖满时刻（coverAt ≤ 场景开始后 0.53 秒）
  chrome() {
    const hud = document.getElementById('hud');
    // 换章用的格子：一层 SVG，576 块
    const sv = svg('svg', { id: 'tiles', width: 1920, height: 1080, viewBox: '0 0 1920 1080' }, hud);
    const rects = [];
    for (let j = 0; j < 18; j++) for (let i = 0; i < 32; i++) { const r = svg('rect', { x: 0, y: 0, width: 0, height: 0, fill: C.deep }, sv); r._c = {}; rects.push({ r, i, j }); }
    const rnd = seeded(41); for (const k of rects) k.r0 = rnd();
    const plan = [];   // 每次换章：[cover 起, cover 止, uncover 起, uncover 止, 顺序(收), 顺序(放)]
    for (const s of L.scenes) {
      const idx = L.scenes.indexOf(s);
      if (idx === 0) continue;
      const hit = coverAt(s), c0 = s.start + (s.chap ? s.lead - 0.35 : 0.1);
      const prevId = L.scenes[idx - 1].id;
      const inOrd = ORDER[s.id] || ORDER.close, outOrd = ORDER[prevId] || ORDER.close;
      const u0 = s.chap ? hit + 2.25 : Math.max(hit + 0.12, s.start + 0.62);      // 章名还在，格子先收走：新的一章从章名底下露出来
      const tOut = s.chap ? Math.max(u0 + 0.7, c0 - 0.65) : u0;
      plan.push({ s, a: hit - 0.62, b: hit, u0, u1: u0 + 0.62, inOrd, outOrd });
      if (s.chap) {
        const [no, ti, en] = CHAPTERS[s.id];
        const card = h('div', 'card', hud);
        const eNo = h('div', 'no', card, no), eTi = h('div', 'ti', card, ti), eEn = h('div', 'en', card, en);
        slam(eNo, hit + 0.06, { from: 1.25, d: 0.42 });
        wipe(eTi, hit + 0.1, { dir: 'b', d: 0.36 });
        appear(eEn, hit + 0.3); typeText(eEn, en, hit + 0.3, 22, { cursor: false, sfxGain: 0.25 });
        const bar = h('div', 'abs', card); px(bar, 126, 810, 0, 6); bar.style.background = C.gold;
        tl.fromTo(bar, { width: 0 }, { width: 520, duration: tOut - (hit + 0.5), ease: 'none', immediateRender: true }, hit + 0.5);
        for (const e of [eNo, eTi, eEn, bar]) wipeOut(e, tOut, { dir: 't', d: 0.2 });
        sfx('thud', hit, { g: 0.9 }); sfx('tick', hit + 0.4, { g: 0.6 });
        sfx('pop', u0 + 0.05, { g: 0.45 });
      }
      sfx('riser', hit - 1.2, { g: 0.45 });
    }
    // 每帧：落在哪一次换章里，就按那一次的顺序算每块格子的大小与颜色
    const G = 0.36;   // 单块格子从 0 长满所用的比例（其余是先后的错开）
    F((t) => {
      const p = plan.find((x) => t >= x.a - 0.01 && t <= x.u1 + 0.01);
      for (const k of rects) {
        let sz = 0, col = C.deep;
        if (p) {
          if (t < p.b + 0.001) {             // 盖上：按本章的顺序
            const d = p.inOrd(k.i, k.j, k.r0), u = clamp(((t - p.a) / (p.b - p.a) - d * (1 - G)) / G);
            sz = ease.out3(u); if (u < 0.9 && u > 0) col = C.gold;
          } else if (t < p.u0) sz = 1;
          else {                              // 收走：按上一章的顺序反过来
            const d = 1 - p.outOrd(k.i, k.j, k.r0), u = clamp(((t - p.u0) / (p.u1 - p.u0) - d * (1 - G)) / G);
            sz = 1 - ease.io3(u);
          }
        }
        const w = sz * 62, x = k.i * 60 + 30 - w / 2, y = k.j * 60 + 30 - w / 2;
        const key = w.toFixed(1) + col;
        if (k.r._c.k !== key) { k.r._c.k = key; k.r.setAttribute('x', x.toFixed(1)); k.r.setAttribute('y', y.toFixed(1)); k.r.setAttribute('width', w.toFixed(1)); k.r.setAttribute('height', w.toFixed(1)); k.r.setAttribute('fill', col); }
      }
    });

    // 角标：片名与当前章（画在格子之上）
    h('div', 'hud-t', hud, '垃圾回收的艺术');
    const chap = h('div', 'hud-c', hud, '');
    let lastC = null;
    F((t) => {
      const s = L.scenes.find((x) => t >= x.start && t < x.end);
      const v = s && CHAPTERS[s.id] && t > s.start + s.lead - 0.4 ? CHAPTERS[s.id][0] + '  ' + CHAPTERS[s.id][1] : '';
      if (v !== lastC) { chap.textContent = v; lastC = v; }
    });
    // 金手指：右上角一排触点，随片子推进逐个镀金
    const fing = svg('svg', { width: 400, height: 40, viewBox: '0 0 400 40' }, hud);
    css(fing, { position: 'absolute', left: '1460px', top: '40px' });
    const fs = [];
    for (let i = 0; i < 25; i++) { const r = svg('rect', { x: i * 16, y: 4, width: 10, height: 28, fill: C.line }, fing); fs.push(r); }
    let lastF = -1;
    F((t) => { const n = Math.floor(clamp(t / L.total) * 25 + 1e-6); if (n !== lastF) { fs.forEach((r, i) => r.setAttribute('fill', i < n ? C.gold : C.line)); lastF = n; } });
  },
};
