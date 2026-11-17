// 开场：现象（报不上名）→ 出错的那一行 → 你没有权限 → 片名卡。
// 主画面：左边是报名工具本身（输入 18、点报名、被拒），右边是「WaterRun / 活动报名」的 src/signup.js，第 13 行的 > 被框出；片名压在这页的左半边（关键帧 A1）。
scene('open', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);

  // ── 仓库名：开场第一帧就在，下一场在同一位置接着用 ──
  const repo = el(world, '', repoName('WaterRun', '活动报名', { size: 36 }), 120, 150);
  fadeIn(repo, s.start + 0.05, { y: 0, d: 0.5 });

  // ── 报名工具：输入 18，点报名，被拒 ──
  const form = el(world, 'box', `<div class="boxh">${oct('person', 26, C.muted)}<b>活动报名</b><span class="k" style="font-size:24px">报名表</span></div>
    <div style="padding:26px 30px;display:flex;flex-direction:column;gap:18px">
      <div class="k" style="font-size:26px">年龄</div>
      <div class="row" style="gap:20px"><div class="mono" style="width:260px;height:64px;border:2px solid var(--bd);border-radius:10px;padding:0 18px;font-size:32px;line-height:60px"><span class="inp"></span></div><span class="btn green go">报名</span></div>
      <div class="row err" style="gap:12px;font-size:28px;color:var(--danger);font-weight:600;height:40px">${oct('x-circle-fill', 28, C.danger)}未满 18 岁，不能报名</div>
    </div>`, 120, 250, 700);
  const inp = form.querySelector('.inp'), go = form.querySelector('.go'), err = form.querySelector('.err');
  slide(form, s.start + 0.15, { x: -60, d: 0.6, ease: 'power3.out' }); sfx('whoosh', s.start + 0.15, { g: 0.4 });
  const tType = T('o1', '刚满');
  typeText(inp, '18', tType, 6, { cursorUntil: T('o1', '却') - 0.3 });
  const p = pointer(world);
  const gb = box(go, world);
  pointerPath(p, [[T('o1', '开源'), 640, 640], [tType + 0.2, gb.x + gb.w * 0.86, gb.y + gb.h * 0.62, 0.55]], T('o3') - 0.2);
  const tClick = Q(T('o1', '却') - 0.05);
  clickAt(p, tClick, go);
  fromTo(err, T('o1', '报不上') - 0.1, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.3, ease: 'power3.out' });
  sfx('error', T('o1', '报不上') - 0.1, { g: 0.8 });
  // 被拒：输入框变红，整行左右一晃
  const inRow = inp.closest('.row'), inBox = inp.parentNode, tErr = T('o1', '报不上') - 0.1;
  fromTo(inBox, tErr, { borderColor: '#d1d9e0' }, { borderColor: '#d1242f', duration: 0.15 });
  fromTo(inRow, tErr, { x: 0 }, { keyframes: [{ x: -16, duration: 0.06 }, { x: 14, duration: 0.07 }, { x: -9, duration: 0.07 }, { x: 5, duration: 0.06 }, { x: 0, duration: 0.06 }], immediateRender: false });

  // ── 出错的那一行：src/signup.js 第 13 行 ──
  const code = el(world, 'box', `<div class="boxh">${oct('file', 26, C.muted)}<b class="mono" style="font-size:26px">src/signup.js</b><span class="row lockp" style="margin-left:auto;gap:10px;font-size:24px;color:var(--muted)">${oct('lock', 24, C.muted)}你没有写权限</span></div>
    <div style="padding:12px 0">
      ${codeLn(12, '<span class="k">// 年满 18 岁才能报名</span>')}
      <div class="l13">${codeLn(13, `if (age <span class="gt">${GT}</span> 18) {`)}</div>
      ${codeLn(14, '  signUp(user);')}
      ${codeLn(15, '}')}
    </div>`, 960, 250, 840);
  const lockp = code.querySelector('.lockp'), l13 = code.querySelector('.l13'), gt = code.querySelector('.gt');
  const tCode = Q(T('o1', '刚满')) - 0.3;   // 报名表一开始填，背后那段代码就在旁边
  wipe(code, tCode, { dir: 'l', d: 0.5 }); sfx('blip', tCode, { g: 0.6 });
  vanish(lockp, 0);
  // 第 13 行整行垫一层黄，> 再框一下
  fromTo(l13, T('o2', '大于') - 0.2, { backgroundColor: '#ffffff' }, { backgroundColor: '#fff8c5', duration: 0.35 });
  markOn(world, box(gt, world), Q(T('o2', '大于')), null, 6);
  sfx('pop', Q(T('o2', '大于')), { g: 0.7, p: 0.4 });
  const g1 = gloss(world, `第 13 行：age 是 18 时，<span class="mono">18 ${GT} 18</span> 不成立`, 990, 598, 'up');
  fadeIn(g1, T('o2', '正好') - 0.1, { y: 10 }); sfx('tick', T('o2', '正好') - 0.1, { g: 0.6 });

  // ── 别人的项目：仓库主人是WaterRun，你只能看 ──
  const owner = repo.querySelector('span[style*="accent"]');
  markOn(world, box(owner, world), Q(T('o3', '别人')), Tend('o3') + 0.6, 6);
  fromTo(lockp, T('o3', '没有权限') - 0.1, { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, duration: 0.35, ease: 'power3.out' });
  sfx('thud', T('o3', '没有权限') - 0.1, { g: 0.6 });
  fadeOut(g1, Tend('o3') + 0.3);   // 留够读完（F04）

  // ── 但在 GitHub 上照样能提改动：三步先露个面 ──
  const steps = el(world, 'row', `<span class="btn">${oct('repo-forked', 28)}Fork</span>${oct('arrow-right', 30, C.muted)}
      <span class="btn">${oct('git-branch', 28)}fix-age</span>${oct('arrow-right', 30, C.muted)}
      <span class="btn green">${oct('git-pull-request', 28, '#fff')}Pull request</span>`, 124, 680);
  css(steps, { gap: '22px' });
  [...steps.children].forEach((c, i) => fadeIn(c, Q(T('o4', '提改动')) + i * 0.12, { x: -24, y: 0, d: 0.35 }));
  sfx('pop', Q(T('o4', '提改动')), { g: 0.6 }); sfx('pop', Q(T('o4', '提改动')) + 0.48, { g: 0.5, p: 0.3 });

  // ── 片名卡：报名表让位，片名落在左半边 ──
  const tT = Q(T('o4', '怎')) - 0.1;   // 片名卡落在「怎么做到的？」这一问上，副标题停够读完（F04）
  fadeOut(form, tT - 0.35, { x: -30, y: 0 });
  const title = el(world, 'title-xl', '150 秒速通<br>GitHub 协作', 120, 240);
  const sub = el(world, 'title-sub', '为什么要 Fork、开分支、再提 PR', 124, 520);
  slam(title, tT, { from: 1.12, d: 0.45 }); sfx('thud', tT);
  fadeIn(sub, tT + 0.15, { y: 14 }); sfx('tick', tT + 0.15, { g: 0.6 });

  hudState(s.start + 0.3, st('idle', 'dot-fill', '改动：还没开始'));

  // 停留：整场只朝一个方向极慢横移（不缩放）
  const hold = s.end - s.start, dx = Math.min(30, 1.6 * hold);
  cam.track(s.start, { x: 960 - dx / 2, y: 484, z: 1 }, [[s.start + 0.05, { x: 960 + dx / 2 }, hold, { ease: 'none', sfx: false }]]);
});
