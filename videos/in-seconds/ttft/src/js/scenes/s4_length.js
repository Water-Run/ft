// 输入越长越晚（62.4–72.0 秒）：两条输入同时开始读（赛跑），读头扫过的地方变亮；第一条（一句话）先读完、先出 Token，
// 第二条（同一句话 + 整个代码文件）读得更久，第一个 Token 落在旁白说「更晚」的那一刻。条里写着「一句话」「整个代码文件」。
// 横向的长度 ∝ 读的时间（示意）：两条用同一个速度，括号随读头画出来。规格：第 3.5 节（2026-11-19 r2 改为赛跑）。
scene('length', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  cam.cut(s.start, { x: 960, y: 484, z: 1 });
  const tAttach = T('l1', '附上');             // 「附上整个代码文件」：第二条的后半段从右边接上来
  const tB = T('l2', '晚');                    // 第二条读完、第一个 Token 落下：旁白说「更晚」
  const X0 = 240, WQ = 360, WF = 640, WB = WQ + WF;   // 一句话 360、整个代码文件 640、第二条共 1000（示意）
  const DUR = 3.2, V = WB / DUR;               // 第二条读 3.2 秒（从「附上整个代码文件」说完就开始读）；两条同速（像素/秒）
  const tRace = tB - DUR;                      // 赛跑开始：「要先读的内容多了」
  const tAq = tRace + WQ / V;                  // 一句话读完
  const YA = 326, YB = 612;                    // 两条的 y（条高 104）
  const OXA = X0 + WQ + 16, OXB = X0 + WB + 16;   // 输出区的起点：与输入条之间留 16 像素（与 prefill 里输入块与输出块的间隔一致），否则纸色的等待位会和读完的条连成一块
  const lab = (cls, text, x, y, size) => { const e = txt(world, cls, text, x, y); if (size) css(e, { fontSize: size + 'px' }); return e; };
  const growBrace = (b, t0, t1) => { appear(b, t0); fromTo(b.firstChild, t0, { width: '0%' }, { width: '100%', duration: t1 - t0, ease: 'none' }); appear(b.children[2], t1); };

  // 一段输入：底（ink2、暗字）+ 读过的覆盖层（纸色、墨字，宽度随读头增长）；字写在条里面
  const seg = (x, y, w, text, t0, t1) => {
    const base = h('div', 'abs', world); px(base, x, y, w, 104); css(base, { background: PALETTE.ink2 });
    const mk = (parent, color) => { const d = h('div', 'abs', parent, text); css(d, { left: '0px', top: '0px', width: w + 'px', height: '104px', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 44px "Sans SC"', color }); return d; };
    mk(base, PALETTE.dim);
    const fill = h('div', 'abs', world); px(fill, x, y, 0, 104); css(fill, { background: PALETTE.paper, overflow: 'hidden' });
    mk(fill, PALETTE.ink);
    fromTo(fill, t0, { width: 0 }, { width: w, duration: t1 - t0, ease: 'none' });
    return base;
  };
  // 读头：琥珀竖条，随读的进度从 xa 走到 xb（纯函数）
  const head = (xa, xb, y, t0, t1) => {
    const e = blk(world, 'caret', xa - 3, y, 6, 104);
    F((t) => { const k = clamp((t - t0) / (t1 - t0)); e.style.left = (xa + k * (xb - xa) - 3) + 'px'; e.style.opacity = (t >= t0 && t < t1 + 0.02) ? '1' : '0'; });
  };
  // 第一个输出位：纸色的「正在写」块，每拍亮灭一次，直到第一个 Token 出现
  const slot = (x, y, t0, t1) => blinkCaret(blk(world, 'bg-paper', x, y, 140, 104), t0, t1);

  // ── 第一条：一句话 ──
  const bA = seg(X0, YA, WQ, '一句话', tRace, tAq);
  wipe(bA, c0, { dir: 'l', d: 0.5 });
  const brA = brace(world, 'ac', X0, X0 + WQ, YA - 34, 1); growBrace(brA, tRace, tAq);
  wipe(lab('tag ac', '首 Token 延迟', X0, YA - 114, 56), c0 + 0.3, { dir: 'l', d: 0.5 });
  head(X0, X0 + WQ, YA, tRace, tAq);
  slot(OXA, YA, tRace - 0.2, tAq);
  // 读完，第一个 Token（琥珀）落下，随后连续冒出：快
  ['def', 'is_', 'prime', '(', 'n', '):', 'if'].forEach((t, i) => {
    const tb = tAq + i * 0.25, x = OXA + i * 156;
    const e = tokenCol(world, t, x, YA, i === 0 ? 'first' : 'out', true);
    fromTo(e, tb, { top: YA - 34, autoAlpha: 0 }, { top: YA, autoAlpha: 1, duration: 0.25, ease: 'power2.out' });
    sfx(i === 0 ? 'chime' : 'tick', tb, { g: i === 0 ? 0.5 : 0.45 });
  });
  blinkCaret(blk(world, 'caret', OXA + 7 * 156 - 4, YA, 40, 104), tAq + 2.0);

  // ── 第二条：同一句话 + 整个代码文件 ──
  const bB1 = seg(X0, YB, WQ, '一句话', tRace, tAq);
  wipe(bB1, tAttach - 0.5, { dir: 'l', d: 0.4 });
  const bB2 = seg(X0 + WQ, YB, WF, '整个代码文件', tAq, tB);
  slide(bB2, tAttach, { x: 280, d: 0.5, ease: 'power3.out' }); sfx('pop', tAttach + 0.35, { g: 0.7 });
  const div = h('div', 'abs', world); px(div, X0 + WQ - 3, YB, 6, 104); css(div, { background: PALETTE.ink });   // 读过之后两段都是纸色：用墨色细线分开「一句话」与「整个代码文件」
  appear(div, tAttach + 0.2);
  const brB = brace(world, 'ac', X0, X0 + WB, YB - 34, 1); growBrace(brB, tRace, tB);
  wipe(lab('tag ac', '首 Token 延迟', X0, YB - 114, 56), tAttach - 0.3, { dir: 'l', d: 0.5 });
  head(X0, X0 + WB, YB, tRace, tB);
  slot(OXB, YB, tRace - 0.2, tB);
  // 读完，第一个 Token 落下（旁白说「更晚」）；随后几块
  ['def', 'is_', 'prime'].forEach((t, i) => {
    const tb = tB + i * 0.3, x = OXB + i * 156;
    const e = tokenCol(world, t, x, YB, i === 0 ? 'first' : 'out', true);
    fromTo(e, tb, { top: YB - 34, autoAlpha: 0 }, { top: YB, autoAlpha: 1, duration: 0.25, ease: 'power2.out' });
    sfx(i === 0 ? 'thud' : 'tick', tb, { g: i === 0 ? 0.6 : 0.5 });
  });
  blinkCaret(blk(world, 'caret', OXB + 3 * 156 - 4, YB, 40, 104), tB + 1.2);
  // 两个第一个 Token 之间的横向距离，就是多等的那一段：括号从第一条的 def 量到第二条的 def（纸色，与琥珀的「首 Token 延迟」区分）
  const tGap = tB + 0.6;
  const brG = brace(world, 'pp', OXA, OXB, 482, 1); wipe(brG, tGap, { dir: 'l', d: 0.6 });
  wipe(lab('tag pp', '多等的这一段', OXA, 436, 34), tGap + 0.2, { dir: 'l', d: 0.4 });
  sfx('pop', tGap, { g: 0.5 });

  appear(lab('eg', '示例 · 长度与时间为示意', 1180, YA - 114, 30), c0 + 0.2);
});
