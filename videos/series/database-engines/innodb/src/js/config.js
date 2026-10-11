// 本片的引擎配置：字体、颜色、常驻元素（字幕带与进度、左上角的章节标签、每章开头的章节标题）、换场。
// 换场：上一章的画面淡出；新一章开头，章节标题（标志蓝的编号方块、章名、一排架构图式的页块）在左侧出现，
// 读完后收向左上角，变成这一章的章节标签；本章的画面随后淡入（sceneFade，引擎默认的整场淡入淡出）。不用整屏色块。
document.documentElement.classList.add(LANG);
window.PALETTE = { ink: '#1e3742', blue: '#00758f', or: '#f29111', dim: '#5a6b72', t2: '#84bdb5', t3: '#3f7d86', line: '#cdc6be', white: '#ffffff' };   // 与 css/style.css 的 :root 一致
const C = window.PALETTE;
const VH = 968;                                   // 字幕带以上的画幅高度；镜头以这块区域为画幅
const CHIP = { x: 64, y: 40 };                    // 左上角章节标签的位置

window.ENGINE = {
  fonts: [['500 20px "Sans SC"', '字A'], ['700 20px "Sans SC"', '字A'], ['900 20px "Sans SC"', '字A'],
    ['500 20px "Open Sans"', 'Aa0'], ['600 20px "Open Sans"', 'Aa0'], ['700 20px "Open Sans"', 'Aa0'], ['800 20px "Open Sans"', 'Aa0'],
    ['500 20px "Mono"', 'A0'], ['700 20px "Mono"', 'A0']],
  chrome() {
    const hud = document.getElementById('hud');
    // ── 字幕带：浅底、一条暖灰细线；标志蓝的进度沿线走，章节起点各有一道刻线 ──
    const band = h('div', 'band', hud);
    h('div', 'rl', band);
    const prog = h('div', 'pg', band);
    for (const s of L.scenes) if (s.chap) { const k = h('div', 'tk', band); k.style.left = (s.start / L.total * 1920 - 1.5).toFixed(1) + 'px'; }
    let lastW = null;
    F((t) => { const w = (clamp(t / L.total) * 1920).toFixed(1); if (w !== lastW) { prog.style.width = w + 'px'; lastW = w; } });

    // ── 左上角的章节标签：章节标题收进来之后出现，到下一章开始为止 ──
    const chip = h('div', 'chip', hud, '<div class="no"></div><div class="nm"></div>');
    const [cno, cnm] = chip.children;
    const chapAt = (t) => { let cur = null; for (const s of L.scenes) { if (s.start > t) break; cur = s; } return cur; };
    let lastKey = null;
    F((t) => {
      const s = chapAt(t);
      const on = !!(s && s.chap && t >= s.start + s.lead - 0.2);
      const key = on ? s.id : '';
      if (key !== lastKey) { chip.style.visibility = on ? 'visible' : 'hidden'; if (on) { cno.textContent = s.chap[0]; cnm.textContent = s.chap[1]; } lastKey = key; }
    });

    // ── 每章开头的章节标题 ──
    for (const s of L.scenes) {
      if (!s.chap) continue;
      const head = h('div', 'chead', hud);
      head.dataset.name = 'chapter-head';
      const no = h('div', 'no', head, s.chap[0]);
      const nm = h('div', 'nm', head, s.chap[1]);
      const tl_ = h('div', 'tl', head);
      const shades = ['t1', 't2', 't1', 't3', 't1', 't2', 't4', 't1'];
      const tiles = shades.map((c, i) => { const e = h('i', '', tl_); css(e, { left: (i * 68) + 'px', background: i === 6 ? C.or : `var(--${c})` }); return e; });
      const t0 = s.start + 0.15, tMove = s.start + s.lead - 0.75;
      slam(no, t0, { from: 0.6, d: 0.45, ease: 'back.out(1.8)' }); sfx('pop', t0, { g: 0.55, p: -0.5 });
      fromTo(nm, t0 + 0.2, { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out' });
      tiles.forEach((e, i) => fromTo(e, t0 + 0.35 + i * 0.05, { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(1.8)' }));
      sfx('tick', t0 + 0.35, { g: 0.4, p: 0.3 });
      // 收向左上角：整体缩小、平移，随后淡出，章节标签接着出现
      tl.fromTo(head, { x: 0, y: 0, scale: 1 }, { x: CHIP.x - 120, y: CHIP.y - 300, scale: 0.347, duration: 0.55, ease: 'power3.inOut', immediateRender: false, transformOrigin: '0 0' }, tMove);
      tl.fromTo(head, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.15, immediateRender: false }, tMove + 0.5);
      F((t) => { head.style.display = (t >= s.start && t < tMove + 0.7) ? '' : 'none'; });
    }
  },
  // 开场一场不做整场淡入：第 0 帧就要有画面（成片的空画面检查会把开头 0.3 秒的空白判为空画面）
  after() {
    const root = document.getElementById('sc-intro');
    if (root) F((t) => { if (t < 0.65) { root.style.display = ''; root.style.visibility = 'visible'; root.style.opacity = '1'; } });
  },
};
