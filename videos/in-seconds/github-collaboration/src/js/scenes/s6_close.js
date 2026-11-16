// 一句结论：三步各解决一个问题；开源项目谁都能提改动，收不收由维护者决定。最后回到开头那个报名工具：18 岁报上了名。
scene('close', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);

  // ── 三步，各配一个「为什么」 ──
  const card = (x, why, icon, what) => el(world, 'box', `<div style="padding:30px 34px;display:flex;flex-direction:column;gap:22px">
      <span class="k" style="font-size:30px">${why}</span>
      <span class="row" style="gap:18px;font-size:60px;font-weight:800">${oct(icon, 56, C.fg)}${what}</span></div>`, x, 170, 520);
  const cards = [card(120, '没有权限', 'repo-forked', 'Fork'), card(700, '要隔开主线', 'git-branch', '开分支'), card(1280, '要人审', 'git-pull-request', '提 PR')];
  css(cards[2], { borderColor: C.sucE });
  const tw = [T('e1', '没有'), T('e1', '要隔开'), T('e2', '要人审')];
  cards.forEach((c, i) => { const t = Q(tw[i]) - 0.15; fadeIn(c, t, { y: 26, d: 0.45 }); sfx(i === 2 ? 'thud' : 'pop', t, { g: 0.7, p: -0.5 + i * 0.5 }); });
  const ov = overlay(world);
  [0, 1].forEach((i) => { const a = box(cards[i], world), b = box(cards[i + 1], world); const p = path(ov, `M${a.r + 10},${a.cy} H${b.x - 12}`, 'muted', { w: 4 }); arrowIn(p, Q(tw[i + 1]) - 0.3, 0.3); });

  // ── 收不收，维护者说了算：原仓库的 main 上，第 13 行已经是 >= ──
  const code = el(world, 'box', `<div class="boxh">${repoName('WaterRun', '活动报名', { size: 28, pub: false })}<span class="chip">main</span><span class="k mono" style="font-size:24px">src/signup.js</span>
      <span class="row who" style="margin-left:auto;gap:12px;font-size:26px">${av('WaterRun', 40)}<b>WaterRun</b><span class="k">合并了</span><span class="state merged" style="font-size:24px;padding:4px 14px">${oct('git-merge', 24, '#fff')}#13</span></span></div>
      <div style="padding:6px 0">${codeLn(12, '<span class="k">// 年满 18 岁才能报名</span>')}${codeLn(13, `if (age <span class="w" style="background:var(--addW);border-radius:4px">${GE}</span> 18) {`)}</div>`, 120, 480, 1120);
  const who = code.querySelector('.who');
  const tCode = Q(T('e3')) - 0.2;
  fadeIn(code, tCode, { y: 24, d: 0.5 }); sfx('blip', tCode, { g: 0.6 });
  markOn(world, box(who, world), Q(T('e3', '维护者')) - 0.15, Tend('e3') + 1.5, 6);
  sfx('tick', Q(T('e3', '维护者')) - 0.15, { g: 0.7, p: 0.4 });

  // ── 回到开头：18 岁，报上了名 ──
  const form = el(world, 'box', `<div class="boxh">${oct('person', 26, C.muted)}<b>活动报名</b></div>
    <div style="padding:22px 26px;display:flex;flex-direction:column;gap:16px">
      <div class="row" style="gap:18px"><div class="mono" style="width:150px;height:60px;border:2px solid var(--bd);border-radius:10px;padding:0 18px;font-size:30px;line-height:56px">18</div><span class="btn green go">报名</span></div>
      <div class="row ok" style="gap:12px;font-size:28px;color:var(--success);font-weight:600;height:40px">${oct('check-circle-fill', 28, C.success)}报名成功</div>
    </div>`, 1300, 480, 500);
  const go = form.querySelector('.go'), ok = form.querySelector('.ok');
  const tF = Tend('e3') + 0.4;
  fadeIn(form, tF, { x: 24, y: 0, d: 0.45 }); sfx('pop', tF, { g: 0.5, p: 0.6 });
  vanish(ok, 0);
  const p = pointer(world), gb = box(go, world);
  const tClick = Q(tF + 1.3);
  pointerPath(p, [[tF + 0.4, 1720, 760], [tClick - 0.6, gb.x + gb.w * 0.85, gb.y + gb.h * 0.7, 0.5]], s.end - 0.4);
  clickAt(p, tClick, go);
  fromTo(ok, tClick + 0.25, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: 'power3.out' });
  sfx('chime', tClick + 0.25);
  // 结论停留：三张卡依次轻轻点一下，把「三步」再走一遍
  cards.forEach((c, i) => fromTo(c, tClick + 1.2 + i * 0.35, { y: 0 }, { keyframes: [{ y: -10, duration: 0.15, ease: 'power2.out' }, { y: 0, duration: 0.3, ease: 'power2.inOut' }], immediateRender: false }));
  [0, 1, 2].forEach((i) => sfx('tick', tClick + 1.2 + i * 0.35, { g: 0.5, p: -0.5 + i * 0.5 }));

  const hold = s.end - s.start, dx = Math.min(30, 1.6 * hold);
  cam.track(s.start, { x: 960 - dx / 2, y: 484, z: 1 }, [[s.start + 0.05, { x: 960 + dx / 2 }, hold, { ease: 'none', sfx: false }]]);
});
