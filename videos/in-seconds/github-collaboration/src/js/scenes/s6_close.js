// 一句结论：先回到开头那一行（已经是 >=，18 岁报上了名）；再说三步各解决一个问题；最后：谁都能提改动，收不收由维护者决定。
// 上排：原仓库 main 上的那一行与开头那张报名表（e1）。下排：Fork → 开分支 → 提 PR 三张卡（e2–e3），e4 时第四张「合并」卡进来，
// 底下两道括线分开「谁都能做」与「只有维护者能点」（F3.6：合并要写权限）。
scene('close', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);

  // ── e1 回到开头：原仓库 main 上的第 13 行已经是 >= ──
  const code = el(world, 'box', `<div class="boxh">${repoName('WaterRun', '活动报名', { size: 28, pub: false })}<span class="chip">main</span><span class="k mono" style="font-size:24px">src/signup.js</span>
      <span class="row who" style="margin-left:auto;gap:12px;font-size:26px">${av('WaterRun', 40)}<b>WaterRun</b><span class="k">合并了</span><span class="state merged" style="font-size:24px;padding:4px 14px">${oct('git-merge', 24, '#fff')}#13</span></span></div>
      <div style="padding:6px 0">${codeLn(12, '<span class="k">// 年满 18 岁才能报名</span>')}${codeLn(13, `if (age <span class="w ge" style="background:var(--addW);border-radius:4px">${GE}</span> 18) {`)}</div>`, 120, 150, 1120);
  const who = code.querySelector('.who'), ge = code.querySelector('.ge');
  const tCode = Q(T('e1')) - 0.2;
  fadeIn(code, tCode, { y: 24, d: 0.5 }); sfx('blip', tCode, { g: 0.6 });
  markOn(world, box(ge, world), Q(T('e1', '大')) - 0.15, Tend('e1') + 0.4, 5);
  sfx('tick', Q(T('e1', '大')) - 0.15, { g: 0.7, p: 0.3 });

  // ── 开头那张报名表：18 岁，点报名，这回成功 ──
  const form = el(world, 'box', `<div class="boxh">${oct('person', 26, C.muted)}<b>活动报名</b></div>
    <div style="padding:22px 26px;display:flex;flex-direction:column;gap:16px">
      <div class="row" style="gap:18px"><div class="mono" style="width:150px;height:60px;border:2px solid var(--bd);border-radius:10px;padding:0 18px;font-size:30px;line-height:56px">18</div><span class="btn green go">报名</span></div>
      <div class="row ok" style="gap:12px;font-size:28px;color:var(--success);font-weight:600;height:40px">${oct('check-circle-fill', 28, C.success)}报名成功</div>
    </div>`, 1300, 150, 500);
  const go = form.querySelector('.go'), ok = form.querySelector('.ok');
  const tF = Q(T('e1', '18')) - 0.5;
  fadeIn(form, tF, { x: 24, y: 0, d: 0.45 }); sfx('pop', tF, { g: 0.5, p: 0.6 });
  vanish(ok, 0);
  const p = pointer(world), gb = box(go, world);
  const tClick = Q(T('e1', '报'));
  pointerPath(p, [[tF + 0.2, 1720, 420], [tClick - 0.55, gb.x + gb.w * 0.85, gb.y + gb.h * 0.7, 0.45]], Tend('e1') + 0.8);
  clickAt(p, tClick, go);
  fromTo(ok, tClick + 0.25, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: 'power3.out' });
  sfx('chime', tClick + 0.25);

  // ── e2–e3 三步，各配一个「为什么」 ──
  const CY = 470, CW = 380, CX = [120, 560, 1000, 1440];
  const card = (x, why, icon, what, col = C.fg) => el(world, 'box', `<div style="padding:26px 30px;display:flex;flex-direction:column;gap:18px">
      <span class="k" style="font-size:30px">${why}</span>
      <span class="row" style="gap:16px;font-size:56px;font-weight:800;color:${col}">${oct(icon, 52, col)}${what}</span></div>`, x, CY, CW);
  const cards = [card(CX[0], '没有权限', 'repo-forked', 'Fork'), card(CX[1], '要隔开主线', 'git-branch', '开分支'), card(CX[2], '要人审', 'git-pull-request', '提 PR'), card(CX[3], '收不收', 'git-merge', '合并', C.done)];
  css(cards[2], { borderColor: C.sucE }); css(cards[3], { borderColor: C.done });
  const tw = [T('e2', '没'), T('e2', '要'), T('e3', '要'), T('e4', '收')];
  cards.forEach((c, i) => { const t = Q(tw[i]) - 0.15; fadeIn(c, t, { y: 26, d: 0.45 }); sfx(i >= 2 ? 'thud' : 'pop', t, { g: 0.7, p: -0.5 + i * 0.4 }); });
  const ov = overlay(world);
  [0, 1, 2].forEach((i) => { const a = box(cards[i], world), b = box(cards[i + 1], world); const pa = path(ov, `M${a.r + 8},${a.cy} H${b.x - 10}`, i === 2 ? 'done' : 'muted', { w: 4 }); arrowIn(pa, Q(tw[i + 1]) - 0.3, 0.3); });

  // ── e4 谁都能提改动；收不收，维护者说了算：两道括线 ──
  const bracket = (x0, x1, y, color, label, t) => {
    const pb = path(ov, `M${x0},${y - 18} V${y} H${x1} V${y - 18}`, color, { w: 4, arrow: false });
    arrowIn(pb, t, 0.45);
    const lb = el(world, '', label, x0, y + 18, x1 - x0);
    css(lb, { textAlign: 'center', fontSize: '32px', fontWeight: 700, color: C[color] });
    fadeIn(lb, t + 0.2, { y: 10 });
    return lb;
  };
  const cb = cards.map((c) => box(c, world)), BY = cb[0].b + 34;
  const tAny = Q(T('e4')) - 0.1, tMt = Q(T('e4', '收')) - 0.05;   // 括线比旁白早一点进场，留够读完（F04）
  bracket(cb[0].x + 10, cb[2].r - 10, BY, 'success', `谁都能做：不需要原仓库的写权限`, tAny); sfx('pop', tAny, { g: 0.55, p: -0.3 });
  bracket(cb[3].x + 10, cb[3].r - 10, BY, 'done', `只有维护者能点`, tMt); sfx('pop', tMt, { g: 0.55, p: 0.6 });
  markOn(world, box(who, world), tMt + 0.1, s.end - 0.3, 6);
  sfx('tick', tMt + 0.1, { g: 0.6, p: 0.4 });

  const hold = s.end - s.start, dx = Math.min(24, 1.5 * hold);
  cam.track(s.start, { x: 960 - dx / 2, y: 484, z: 1 }, [[s.start + 0.05, { x: 960 + dx / 2 }, hold, { ease: 'none', sfx: false }]]);
});
