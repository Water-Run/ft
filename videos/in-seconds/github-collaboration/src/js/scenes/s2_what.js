// 它是什么：同一个仓库页，先分清哪些是 Git 自带的（分支、提交）、哪些是 GitHub 网站的功能（Fork、Issue、Pull request）；再交代谁能直接改，引出三步。
// 主画面：「WaterRun / 活动报名」的仓库首页。仓库名与上一场在同一位置，换场时不动。
scene('what', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);

  // ── 仓库页 ──
  const repo = el(world, '', repoName('WaterRun', '活动报名', { size: 36 }), 120, 150);
  const btns = el(world, 'row', `<span class="btn">${oct('eye', 26)}Watch <span class="count">3</span></span>
      <span class="btn fork">${oct('repo-forked', 26)}Fork <span class="count">1</span></span>
      <span class="btn">${oct('star', 26)}Star <span class="count">8</span></span>`, 0, 144);
  css(btns, { gap: '14px' }); btns.style.left = (1800 - btns.offsetWidth) + 'px';
  const tabs = el(world, 'row', `<span class="row on" style="gap:12px;padding:14px 4px;border-bottom:4px solid #fd8c73;font-weight:600">${oct('code', 26)}Code</span>
      <span class="row iss" style="gap:12px;padding:14px 4px;color:var(--muted)">${oct('issue-opened', 26, C.muted)}Issues <span class="count">1</span></span>
      <span class="row prs" style="gap:12px;padding:14px 4px;color:var(--muted)">${oct('git-pull-request', 26, C.muted)}Pull requests <span class="count">0</span></span>`, 120, 222, 1680);
  css(tabs, { gap: '40px', fontSize: '26px', borderBottom: '2px solid var(--bd)', alignItems: 'flex-end' });
  const branch = el(world, 'btn', `${oct('git-branch', 26)}main`, 120, 312);
  const commits = el(world, 'row', `${oct('git-commit', 26, C.fg)}<b>12</b><span class="k">次提交</span>`, 0, 322);
  css(commits, { gap: '10px', fontSize: '26px' }); commits.style.left = (box(branch, world).r + 34) + 'px';
  const files = el(world, 'box', `<div class="boxh">${av('WaterRun', 40)}<b>WaterRun</b><span class="k">加上年龄判断</span></div>
      <div class="row" style="gap:16px;padding:16px 24px;font-size:26px">${oct('file', 26, C.muted)}<span class="mono">src/signup.js</span></div>
      <div class="row" style="gap:16px;padding:16px 24px;font-size:26px;border-top:2px solid var(--bd)">${oct('book', 26, C.muted)}<span class="mono">README.md</span></div>`, 120, 470, 1100);
  const about = el(world, 'box', `<div style="padding:22px 26px;display:flex;flex-direction:column;gap:14px">
      <b style="font-size:28px">关于</b><span class="k" style="font-size:26px">一个报名小工具</span>
      <div style="border-top:2px solid var(--bd);margin:6px 0"></div>
      <span class="k" style="font-size:24px">维护者</span>
      <div class="row mrow" style="gap:14px;font-size:26px">${av('WaterRun', 44)}<b>WaterRun</b><span class="pill" style="color:var(--success);border-color:var(--success)">${oct('check', 24, C.success)}有写权限</span></div>
      <div class="row yrow" style="gap:14px;font-size:26px">${av('你', 44)}<b>你</b><span class="pill">${oct('lock', 24, C.muted)}只能看</span></div>
    </div>`, 1320, 312, 480);
  const mrow = about.querySelector('.mrow'), yrow = about.querySelector('.yrow');
  // 换场：仓库名留在原处；其余的页面部件依次铺开
  [btns, tabs, branch, commits, files, about].forEach((e, i) => fadeIn(e, s.start + 0.15 + i * 0.08, { y: 14, d: 0.45 }));
  sfx('whoosh', s.start + 0.1, { g: 0.45 });
  vanish(yrow, 0);

  // ── a1 Git：分支与提交由它记录 ──
  const bb = box(branch, world), cb = box(commits, world);
  const gitBox = { x: bb.x, y: bb.y, w: cb.r - bb.x, h: bb.h, r: cb.r, b: bb.b };
  const rGit = ring(world, gitBox, 'git', 10);
  const tA1 = Q(T('a1', 'Git'));
  fromTo(rGit, tA1, { autoAlpha: 0, scale: 1.06 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power3.out' }); sfx('pop', tA1, { g: 0.7, p: -0.3 });
  const gGit = gloss(world, '<b>Git</b>：记下修改的工具，这里记了 12 次提交', 120, 398, 'up', 'Git');
  fadeIn(gGit, tA1 + 0.15, { y: 10 });
  // ── a2 GitHub：这一页所在的网站 ──
  const rb = box(repo.firstChild, world);
  const gHub = gloss(world, '<b>GitHub</b>：这一页所在的网站 github.com', rb.r + 34, 146, 'left', 'GitHub');
  const tA2 = Q(T('a2', 'GitHub'));
  fadeIn(gHub, tA2, { x: -14, y: 0 }); sfx('tick', tA2, { g: 0.7 });

  // ── a3 Fork、PR、Issue：网站的功能（蓝框） ──
  const tA3 = T('a3');
  fadeOut(gGit, tA3 + 0.5); fadeOut(gHub, tA3 + 0.5);   // 与 a3 的描框不在同一处，多留一会儿读完（F04）
  const fb = box(btns.querySelector('.fork'), world);
  const rFork = ring(world, fb, '', 8);
  const ib = box(tabs.querySelector('.iss'), world), pb = box(tabs.querySelector('.prs'), world);
  const rTabs = ring(world, { x: ib.x, y: ib.y, w: pb.r - ib.x, h: ib.h }, '', 6);
  const tagWeb1 = el(world, 'tag', '网站的功能', fb.x - 8, fb.b + 14);
  const tagWeb2 = el(world, 'tag', '网站的功能', pb.r + 26, ib.y + 14);
  fromTo(rFork, Q(T('a3', 'Fork')), { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power3.out' });
  fadeIn(tagWeb1, Q(T('a3', 'Fork')) + 0.1, { x: 14, y: 0 });
  fromTo(rTabs, Q(T('a3', 'P')), { autoAlpha: 0, scale: 1.05 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power3.out' });
  fadeIn(tagWeb2, Q(T('a3', 'Issue')), { x: -14, y: 0 });
  sfx('pop', Q(T('a3', 'Fork')), { g: 0.7, p: 0.5 }); sfx('pop', Q(T('a3', 'P')), { g: 0.6, p: -0.2 });
  // ── a4 分支和提交：Git 自带（绿框已在，补上标签） ──
  const tagGit = el(world, 'tag git', 'Git 自带', cb.r + 30, cb.y + 2);
  const tA4 = Q(T('a4', '分支'));
  fadeIn(tagGit, tA4, { x: -14, y: 0 }); sfx('blip', tA4, { g: 0.6 });
  fromTo(rGit, tA4, { scale: 1 }, { keyframes: [{ scale: 1.04, duration: 0.15 }, { scale: 1, duration: 0.3 }], immediateRender: false });

  // ── a5 仓库与维护者 ──
  const tA5 = T('a5');
  [rFork, rTabs, tagWeb1, tagWeb2, rGit, tagGit].forEach((e) => fromTo(e, tA5 - 0.3, { autoAlpha: 1 }, { autoAlpha: 0.25, duration: 0.5, immediateRender: false }));
  const fbx = box(files, world);
  const gRepo = gloss(world, '<b>仓库</b>：这个项目的家，代码和每次提交都存在这里', 140, fbx.b + 18, 'up', '仓库');
  fadeIn(gRepo, Q(T('a5', '仓库')), { y: 10 }); sfx('tick', Q(T('a5', '仓库')), { g: 0.7 });
  const ab = box(about, world);
  markOn(world, box(mrow, world), Q(T('a5', '维护者')) - 0.25, Tend('a6') - 0.2, 8);
  const gMaint = gloss(world, '<b>维护者</b>：有写权限的人，这里只有 WaterRun', 1320, ab.b + 18, 'up', '维护者');
  // 注解框比「关于」栏宽：右缘对齐到 1800
  gMaint.style.left = Math.min(1320, 1800 - gMaint.offsetWidth) + 'px';
  fadeIn(gMaint, Q(T('a5', '维护者')), { y: 10 }); sfx('pop', Q(T('a5', '维护者')), { g: 0.6, p: 0.6 });

  // ── a6 其他人改不了，但有三步 ──
  fromTo(yrow, T('a6', '其他人') - 0.1, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' }); sfx('thud', T('a6', '其他人') - 0.1, { g: 0.5 });
  fadeOut(gRepo, Tend('a6') - 0.3);
  const steps = el(world, 'row', `<span class="btn">${oct('repo-forked', 28)}Fork</span>${oct('arrow-right', 30, C.muted)}
      <span class="btn">${oct('git-branch', 28)}开分支</span>${oct('arrow-right', 30, C.muted)}
      <span class="btn green">${oct('git-pull-request', 28, '#fff')}提 PR</span>`, 120, 790);
  css(steps, { gap: '22px', fontSize: '28px' });
  const kids = [...steps.children], tw = [T('a6', 'Fork'), T('a6', '开分支'), T('a6', '提')];
  kids.forEach((c, i) => { const k = [0, 0, 1, 1, 2][i]; fadeIn(c, Q(tw[k]) - 0.1 + (i % 2) * 0.1, { x: -24, y: 0, d: 0.35 }); });
  tw.forEach((t, i) => sfx('pop', Q(t) - 0.1, { g: 0.6, p: -0.3 + i * 0.3 }));

  const hold = s.end - s.start, dx = Math.min(30, 1.4 * hold);
  cam.track(s.start, { x: 960 + dx / 2, y: 484, z: 1 }, [[s.start + 0.05, { x: 960 - dx / 2 }, hold, { ease: 'none', sfx: false }]]);
});
