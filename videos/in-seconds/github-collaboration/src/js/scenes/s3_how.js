// 它怎么工作（重头）：同一处错误走完 Fork → 分支 → 提交推送 → PR → 审查 → 合并。
// 前半（b1–b6）是一张「改动在哪儿」的图：三行同一个文件的第 13 行——原仓库的 main、你的副本的 main、副本里的分支 fix-age——
//   Fork 让第二行从第一行复制下来，开分支让第三行从第二行岔出去，改动只落在第三行（A 的界面部件 + 左侧的连线）。
// 后半（b7–b13）是 PR 页：标题由那次提交的说明飞上去，「从哪、到哪」两颗分支标签由上面两行的标签飞上去；
//   左栏是 Conversation 时间线（C），事件一条条往下长；右栏是合并框。
scene('how', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const RX = 280, RW = 1520;

  // ── 一行：某个仓库某条分支上的 src/signup.js 第 13 行 ──
  function fileRow(y, o) {
    const e = el(world, 'box', `<div class="boxh" style="padding:12px 22px">${repoName(o.owner, '活动报名', { size: 30, icon: o.icon, pub: false })}
        ${o.from ? `<span class="k" style="font-size:24px">forked from WaterRun/活动报名</span>` : ''}
        <span class="chip br" style="font-size:26px">${o.branch}</span><span class="k mono" style="font-size:24px">src/signup.js</span>
        <span class="row rt" style="margin-left:auto;gap:14px">${o.right || ''}</span></div>
      <div style="position:relative;padding:6px 0"><div class="l13">${codeLn(13, `if (age <span class="gt">${GT}</span> 18) {`)}</div></div>`, RX, y, RW);
    return { e, chip: e.querySelector('.br'), rt: e.querySelector('.rt'), l13: e.querySelector('.l13'), gt: e.querySelector('.gt'), body: e.querySelector('.l13').parentNode };
  }
  const A = fileRow(150, { owner: 'WaterRun', icon: 'repo', branch: 'main', right: `<span class="btn fork" style="padding:6px 18px;font-size:26px">${oct('repo-forked', 26)}Fork</span><span class="pill">${oct('lock', 24, C.muted)}只能看</span>` });
  const B = fileRow(380, { owner: '你', icon: 'repo-forked', branch: 'main', from: true, right: `<span class="pill" style="color:var(--success);border-color:var(--success)">${oct('check', 24, C.success)}随便改</span>` });
  const Cc = fileRow(610, { owner: '你', icon: 'repo-forked', branch: '<span class="bn"></span>' });
  const bn = Cc.chip.querySelector('.bn'); bn.textContent = 'fix-age';   // 先放上全文量尺寸（飞上 PR 页的起点）；打字机逐帧改写
  // 第三行的第 13 行改过之后的样子：叠在原样上，到时淡变过去
  const l13new = el(Cc.body, '', codeLn(13, `if (age <span class="w">${GE}</span> 18) {`, 'add'), 0, 6, RW - 4);
  vanish(l13new, 0);
  const commitP = h('span', 'pill', Cc.rt, `${oct('git-commit', 24, C.fg)}<span class="msg" style="color:var(--fg)">年龄判断改成大于等于</span>`);
  const pushP = h('span', 'pill', Cc.rt, `${oct('check', 24, C.success)}已推送`); css(pushP, { color: C.success, borderColor: C.success });
  vanish(commitP, 0); vanish(pushP, 0);

  // 进场：原仓库这一行在场景开头就在（接上一场的仓库页）
  fadeIn(A.e, s.start + 0.1, { y: 16, d: 0.45 });
  const ov = overlay(world);
  const pFork = path(ov, `M${RX - 4},223 H200 V453 H${RX - 10}`, 'accent', { w: 5 });
  const pBr = path(ov, `M${RX - 4},470 H236 V683 H${RX - 10}`, 'success', { w: 5 });
  vanish(pFork, 0); vanish(pBr, 0);

  // ── b1 在原仓库点 Fork ──
  const fk = A.e.querySelector('.fork'), fkb = box(fk, world);
  const ptr = pointer(world);
  const tFork = Q(T('b1', 'Fork'));
  pointerPath(ptr, [[T('b1') + 0.1, 1240, 420], [tFork - 0.75, fkb.x + fkb.w * 0.7, fkb.y + fkb.h * 0.62, 0.6]], Tend('b2') - 0.3);
  clickAt(ptr, tFork, fk);
  const gFork = gloss(world, '<b>Fork</b>：把整个仓库复制一份，放到你名下', 0, box(A.e, world).b + 16, 'upr', 'Fork');
  gFork.style.left = (fkb.r + 20 - gFork.offsetWidth) + 'px';
  fadeIn(gFork, tFork + 0.1, { y: 10 });
  hudState(tFork + 0.3, st('step', 'repo-forked', '已 Fork'));
  // ── b2 复制一份到你名下：第二行从第一行滑下来 ──
  const tCopy = Q(T('b2', '复制')) - 0.25;
  fromTo(B.e, tCopy, { autoAlpha: 0, y: -230 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.inOut' });
  sfx('whoosh', tCopy, { g: 0.6 }); sfx('thud', tCopy + 0.75, { g: 0.6 });
  arrowIn(pFork, tCopy + 0.2, 0.7);
  const perm = B.rt.firstChild;
  fromTo(perm, T('b2', '随你改') - 0.1, { autoAlpha: 0, x: 16 }, { autoAlpha: 1, x: 0, duration: 0.3 }); sfx('pop', T('b2', '随你改') - 0.1, { g: 0.6, p: 0.6 });
  fadeOut(gFork, T('b3') - 0.2);

  // ── b3 在副本里开一条分支 fix-age：第三行从第二行岔出去 ──
  const tBr = Q(T('b3', '分支')) - 0.25;
  fromTo(Cc.e, tBr, { autoAlpha: 0, y: -230 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.inOut' });
  sfx('whoosh', tBr, { g: 0.5, p: 0.2 });
  arrowIn(pBr, tBr + 0.2, 0.7);
  typeText(bn, 'fix-age', T('b3', 'fix') - 0.15, 14, { cursorUntil: Tend('b3') + 0.2 });
  const gBr = gloss(world, '<b>分支</b>：从 main 岔出去的一条工作线', 560, 540, 'down', '分支');
  fadeIn(gBr, Q(T('b3', 'fix')) + 0.2, { y: -10 });
  hudState(Q(T('b3', 'fix')) + 0.3, st('step', 'git-branch', '在分支 fix-age'));
  // ── b4 怎么改，主线都不变：副本的 main 那一行原地框住 ──
  markOn(world, box(B.chip, world), Q(T('b4', '主线')), Tend('b6') + 0.3, 6);
  fadeOut(gBr, T('b5') - 0.2, { y: 8 });

  // ── b5 把 > 改成 >=，提交，推送 ──
  const tEd = Q(T('b5', '大于等于')) - 0.1;
  markOn(world, box(Cc.gt, world), Q(T('b5', '大于')) - 0.1, tEd + 0.1, 6);
  swapFade(Cc.l13, l13new, tEd, 0.3);
  sfx('key', tEd, { g: 0.8 }); sfx('key', tEd + 0.08, { g: 0.8 }); sfx('blip', tEd + 0.15, { g: 0.6 });
  fromTo(commitP, Q(T('b5', '提交')), { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, duration: 0.3 }); sfx('pop', Q(T('b5', '提交')), { g: 0.7 });
  fromTo(pushP, Q(T('b5', '推送')), { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'back.out(2)' }); sfx('blip', Q(T('b5', '推送')), { g: 0.7, p: 0.5 });

  // ── b6 原仓库一个字没变：第一行的 > 原地框住 ──
  const tSame = Q(T('b6', '原仓库')) - 0.1;
  markOn(world, box(A.gt, world), tSame, Tend('b6') + 0.3, 6);
  fromTo(A.l13, tSame, { backgroundColor: '#ffffff' }, { backgroundColor: '#fff8c5', duration: 0.35 });
  sfx('tick', tSame, { g: 0.8 });

  // ═══ 后半：PR 页 ═══
  const tPR = T('b7');
  // 申请页的各部件
  const title = el(world, '', `<span>年龄判断改成大于等于</span> <span class="k num" style="font-weight:300">#13</span>`, 120, 128);
  css(title, { fontSize: '52px', fontWeight: 600 });
  const meta = el(world, 'row', `<span class="stbox" style="position:relative;display:inline-flex">${st('open', 'git-pull-request', 'Open', 26)}</span>
      <span class="ask"><b style="color:var(--fg)">你</b> 想把 1 个提交合并进</span><span class="chip base">WaterRun:main</span><span>来自</span><span class="chip head">你:fix-age</span>`, 120, 214);
  css(meta, { gap: '16px', fontSize: '28px', color: C.muted });
  const stbox = meta.querySelector('.stbox'), openPill = stbox.firstChild;
  const mergedPill = h('span', '', stbox, st('merged', 'git-merge', 'Merged', 26)); css(mergedPill, { position: 'absolute', left: 0, top: 0 }); stbox.style.width = mergedPill.offsetWidth + 'px';   // 留出 Merged 的宽度，换样子时后面的字不动
  const base = meta.querySelector('.base'), head = meta.querySelector('.head'), ask = meta.querySelector('.ask');
  // 合并之后页头换成「已合并进」（GitHub 合并后的页头不再是「想把」）；两种说法叠在同一处，宽度取较宽的那个，后面的分支标签不动
  const ask0 = h('span', '', ask, ask.innerHTML); ask.childNodes[0] && [...ask.childNodes].slice(0, -1).forEach((n) => n.remove());
  const ask1 = h('span', '', ask, `<b style="color:var(--fg)">你</b>的 1 个提交已合并进`);
  css(ask, { position: 'relative', display: 'inline-block' }); css(ask1, { position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap' });
  ask.style.width = Math.max(ask0.offsetWidth, ask1.offsetWidth) + 'px';
  vanish(ask1, 0);
  // 时间线（左栏）
  const rail = el(world, 'tlrail', '', 146, 360, 4, 0);
  const ev = (y, icon, html, w = 920) => { const ic = el(world, 'tlicon', icon, 120, y); const b = el(world, '', html, 200, y, w); return [ic, b]; };
  const E1 = ev(350, av('你', 52), `<div class="box"><div class="boxh"><b>你</b><span class="k">发起了这个 Pull Request</span></div>
      <div style="padding:16px 24px;font-size:28px">修好刚满 18 岁报不上名。<span class="mono" style="color:var(--accent)">Closes #12</span></div></div>`);
  css(E1[0], { border: 'none', background: 'none' });
  const E2 = ev(502, oct('code', 28, C.muted), `<div class="box"><div class="boxh"><span class="mono">src/signup.js</span><span style="margin-left:auto;font-size:26px"><span style="color:var(--success)">+1</span> <span style="color:var(--danger)">−1</span></span></div>
      ${codeLn(13, `if (age <span class="w">${GT}</span> 18) {`, 'del', '−').replace('class="ln del"', 'class="ln del dl"')}
      ${codeLn(13, `if (age <span class="w">${GE}</span> 18) {`, 'add', '+')}</div>`);
  const E3 = ev(708, av('WaterRun', 52), `<div class="box" style="padding:14px 24px;font-size:28px"><b>WaterRun</b> <span class="k">在第 13 行</span>：对，满 18 岁当天就该能报名。</div>`);
  css(E3[0], { border: 'none', background: 'none' });
  const E3b = ev(796, oct('check', 28, C.success), `<div style="padding-top:10px;font-size:28px"><b>1 项检查通过</b><span class="k"> · 测试：18 岁能报名</span></div>`);
  const E4 = ev(868, oct('git-merge', 28, '#fff'), `<div style="padding-top:10px;font-size:28px"><b>WaterRun</b> 把 1 个提交合并进 <span class="chip">main</span></div>`);
  css(E4[0], { background: C.done, borderColor: C.done });
  // 合并框（右栏）
  const mbox = el(world, 'box', `<div class="row" style="gap:16px;padding:20px 24px;border-bottom:2px solid var(--bd);font-size:28px;position:relative"><span class="ck0 row" style="gap:16px">${oct('dot-fill', 32, C.attention)}<span class="k">检查中</span></span></div>
      <div class="row" style="gap:16px;padding:20px 24px;border-bottom:2px solid var(--bd);font-size:28px;position:relative"><span class="rv0 row" style="gap:16px">${oct('dot-fill', 32, C.muted)}<span class="k">等维护者审</span></span></div>
      <div style="padding:22px 24px;position:relative"><span class="btn green mg" style="width:100%;justify-content:center">${oct('git-merge', 28, '#fff')}Merge pull request</span>
        <div class="k" style="font-size:24px;margin-top:12px;text-align:center">只有维护者能点</div></div>`, 1180, 350, 620);
  const ck0 = mbox.querySelector('.ck0'), rv0 = mbox.querySelector('.rv0'), mg = mbox.querySelector('.mg');
  const ck1 = h('span', 'row', ck0.parentNode, `${oct('check-circle-fill', 32, '#ffffff')}<b>1 项检查通过，可以合并</b>`); css(ck1, { gap: '16px', position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, padding: '0 24px', background: C.success, color: '#ffffff' });   // 检查都过了：这一行整条变绿（GitHub 合并框的样子）
  const rv1 = h('span', 'row', rv0.parentNode, `${oct('check-circle-fill', 32, C.success)}<b>WaterRun 批准了改动</b>`); css(rv1, { gap: '16px', position: 'absolute', left: '24px', top: '20px' });
  const mg1 = h('span', 'btn purple', mg.parentNode, `${oct('git-merge', 28, '#fff')}Merged`); css(mg1, { position: 'absolute', left: '24px', top: '22px', width: 'calc(100% - 48px)', justifyContent: 'center' });
  [ck1, rv1, mg1, mergedPill].forEach((e) => vanish(e, 0));
  // 草稿（b12）：另一张小卡，合并按钮是灰的
  const draft = el(world, 'box', `<div class="boxh">${st('draft', 'git-pull-request-draft', 'Draft', 24)}<span>草稿 PR</span></div>
      <div style="padding:18px 24px"><span class="btn off" style="width:100%;justify-content:center">${oct('git-merge', 28, C.muted)}Merge pull request</span>
      </div>`, 1180, 676, 620);

  // ── 换页（b7 之前）：上面三行退场，标题与两颗分支标签从三行里飞上来 ──
  const tOut = Q(tPR - 0.55);
  [B.e, gFork, gBr].forEach((e) => fadeOut(e, tOut, { y: -16 }));
  [pFork, pBr].forEach((p) => fromTo(p, tOut, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.35, immediateRender: false }));
  fadeOut(A.e, tOut + 0.25, { y: -16 }); fadeOut(Cc.e, tOut + 0.35, { y: -16 });
  const fly = (dst, src, t, d = 0.75) => {
    const a = box(dst, world), b = box(src, world), k = b.h / a.h;
    dst.style.transformOrigin = '0 0';
    fromTo(dst, t, { x: b.x - a.x, y: b.y - a.y, scale: k }, { x: 0, y: 0, scale: 1, duration: d, ease: 'power3.inOut' });
    fromTo(dst, t, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 });
  };
  const tFly = tOut + 0.1;
  fly(title, commitP.querySelector('.msg'), tFly, 0.85);
  fly(base, A.chip, tFly + 0.1); fly(head, Cc.chip, tFly + 0.15);
  sfx('whoosh', tFly, { g: 0.7 });
  [...meta.children].filter((e) => e !== base && e !== head).forEach((e, i) => fadeIn(e, tFly + 0.5 + i * 0.06, { y: 10, d: 0.35 }));
  const tE1 = Q(T('b7', 'Pull')) + 0.2;   // 时间线的第一条：你发起了它
  fadeIn(E1[0], tE1); slide(E1[1], tE1, { x: -90, d: 0.45, ease: 'power3.out' }); fromTo(rail, tE1, { height: 0 }, { height: 130, duration: 0.5 });
  const tMb = Q(T('b8', '请')) - 0.1;   // 合并框在讲到「请你拉取」时进来：被请的是维护者，拉不拉在它手里
  slide(mbox, tMb, { x: 110, d: 0.45, ease: 'power3.out' }); sfx('pop', tMb, { g: 0.5, p: 0.6 });
  // 「请维护者」：注解从左边指着合并按钮——拉不拉，按钮在维护者手里（F3.6）；b10 的改动行进来之前让开
  const gWho = gloss(world, '合并按钮在维护者 <b>WaterRun</b> 手里', 0, 532, 'right');
  gWho.style.left = (1180 - 22 - gWho.offsetWidth) + 'px';
  const tWho = Q(T('b8', '维')) - 0.1;
  fadeIn(gWho, tWho, { x: 14, y: 0 }); sfx('tick', tWho, { g: 0.6, p: 0.5 });
  fadeOut(gWho, Q(T('b10')) - 0.55);
  sfx('pop', tPR + 0.35, { g: 0.6 });
  hudState(Q(T('b7', 'Pull')), st('open', 'git-pull-request', 'Open #13'));

  // ── b8 Pull Request：pull 拉取 + request 请求 ──
  const tb = box(title, world);
  // b7 先说它是什么（一页合并申请），b8 讲到「请你拉取」时换成字面意思
  const gPR0 = gloss(world, '<b>Pull Request</b>：请对方合并你的改动', tb.r + 30, 136, 'left', 'Pull Request');
  const gPR = gloss(world, '<b>Pull Request</b> = <span class="pl">pull 拉取</span> + request 请求', tb.r + 30, 136, 'left', 'Pull Request');
  // r2：只留一个注解（字面意思），从 b7 一直留到 b10 讲完；原来 b8 时换掉的那一个只停了 1.7 秒（F04）
  vanish(gPR0, 0); const tSw = Q(T('b7', 'Pull')) + 0.5;
  fromTo(gPR, tSw, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out' }); sfx('tick', tSw, { g: 0.6 });
  // b8「请你拉取」：注解里的 pull 拉取 点亮
  const tPl = Q(T('b8', '请')) - 0.1;
  markOn(world, box(gPR.querySelector('.pl'), world), tPl, T('b10') - 0.2, 4); sfx('tick', tPl, { g: 0.5, p: 0.3 });
  // 「请维护者把改动拉过去」：一道弧线从你的分支拉到原仓库的 main
  const ov2 = overlay(world);
  const hb0 = box(head, world), bb0 = box(base, world);
  const pull = path(ov2, `M${hb0.cx},${hb0.y - 4} C${hb0.cx - 40},${hb0.y - 22} ${bb0.cx + 40},${bb0.y - 22} ${bb0.cx + 6},${bb0.y - 6}`, 'accent', { w: 4 });
  const tPull = Q(T('b8', '请')) + 0.1;   // 讲到「请你拉取」就画：从你的分支拉到原仓库的 main
  arrowIn(pull, tPull, 0.6); sfx('whoosh', tPull, { g: 0.35, p: -0.3 });
  fromTo(pull, T('b10') - 0.2, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false });
  // ── b9 一页申请：「想把 1 个提交合并进」这句就是申请 ──
  markOn(world, box(ask, world), Q(T('b9', '申请')) - 0.2, T('b10') + 0.2, 6);
  // 「不是直接改进去」：合并按钮在维护者手里
  // 「不是直接改进去」：原仓库的 main 这时还没变——第 13 行还是 >（右下角一张卡，草稿出来之前让开；合并之后同一位置换成 >=）
  const tNot = Q(T('b8', '过')) - 0.25;   // 「把改动拉过去」：拉到哪——原仓库的 main，这时还没变
  const mainOld = el(world, 'box', `<div class="boxh">${repoName('WaterRun', '活动报名', { size: 26, pub: false })}<span class="chip">main</span><span class="pill" style="margin-left:auto">${oct('lock', 24, C.muted)}还没变</span></div>
      <div style="padding:6px 0">${codeLn(13, `if (age ${GT} 18) {`)}</div>`, 1180, 690, 620);
  slide(mainOld, tNot, { y: 90, d: 0.45, ease: 'power3.out' }); sfx('tick', tNot, { g: 0.6, p: 0.6 });
  const gMain = gloss(world, '<b>main</b>：要等维护者合并才会变', 1180, 690 + mainOld.offsetHeight + 16, 'up');
  fadeIn(gMain, Q(T('b9', '直接')) - 0.1, { y: 12 });
  fadeOut(gMain, T('b11') + 0.1);
  fromTo(mainOld, T('b12') - 0.1, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 70, duration: 0.35, ease: 'power2.in', immediateRender: false });
  sfx('tick', Q(T('b9', '申请')) - 0.2, { g: 0.6 });
  // ── b10 从哪条分支、合到哪里、改了哪一行 ──
  const hb = box(head, world), bb = box(base, world);
  const gHead = gloss(world, '从哪条分支', hb.x - 4, hb.b + 16, 'up');
  const gBase = gloss(world, '合到哪里', bb.x - 4, bb.b + 16, 'up');
  fadeIn(gHead, Q(T('b10', '从哪条')), { y: 10 }); fadeIn(gBase, Q(T('b10', '合到')), { y: 10 });
  sfx('pop', Q(T('b10', '从哪条')), { g: 0.6, p: 0.4 }); sfx('pop', Q(T('b10', '合到')), { g: 0.6, p: 0.1 });
  const tDiff = Q(T('b10')) - 0.2;
  fadeIn(E2[0], tDiff); slide(E2[1], tDiff + 0.05, { x: -90, d: 0.45, ease: 'power3.out' }); to(rail, tDiff, { height: 340, duration: 0.5 });
  sfx('blip', tDiff, { g: 0.6 });
  const dlb = box(E2[1].querySelector('.dl'), world);
  // 注解放在删除行里、代码右边（原来在框外，压住了右栏的合并框）
  const gLine = gloss(world, '改了哪一行', 700, dlb.y + 5, 'left');
  fadeIn(gLine, Q(T('b10', '改了')), { x: -12, y: 0 }); sfx('pop', Q(T('b10', '改了')), { g: 0.6, p: -0.2 });
  // 讲完 b10，三处注解收起，让位给审查
  [gHead, gBase, gPR].forEach((e, i) => fadeOut(e, T('b11') + 0.1 + i * 0.05)); fadeOut(gLine, T('b12'));

  // ── b11 逐行提意见、机器跑检查 ──
  const tCm = Q(T('b11', '逐航')) - 0.1, tCk = Q(T('b11', '检查')) - 0.1;
  fadeIn(E3[0], tCm); slide(E3[1], tCm + 0.05, { x: -90, d: 0.45, ease: 'power3.out' }); to(rail, tCm, { height: 450, duration: 0.4 }); sfx('pop', tCm, { g: 0.7, p: -0.4 });
  fadeIn(E3b[0], tCk); slide(E3b[1], tCk + 0.05, { x: -90, d: 0.45, ease: 'power3.out' }); to(rail, tCk, { height: 520, duration: 0.4 });
  swapFade(ck0, ck1, tCk, 0.3); sfx('chime', tCk + 0.1, { g: 0.45, p: 0.5 });
  swapFade(rv0, rv1, tCm + 0.4, 0.3); sfx('tick', tCm + 0.4, { g: 0.6, p: 0.5 });
  // ── b12 草稿：能看，不能合并 ──
  const tDr = Q(T('b12')) + 0.1;   // 草稿卡在 b12 一开口就进来，注解才停得够久（F04）
  slide(draft, tDr, { y: 90, d: 0.45, ease: 'power3.out' }); sfx('blip', tDr, { g: 0.6, p: 0.6 });
  const tNo = Q(T('b12', '不能合并')) - 0.15;
  const offBtn = draft.querySelector('.btn.off'), ob = box(offBtn, world);
  // 「不能合并」：草稿卡上灰色的合并按钮换成红色的「不能合并」（F4.1）
  const noBtn = h('span', 'btn', offBtn.parentNode, `${oct('x-circle-fill', 28, '#ffffff')}不能合并`);
  offBtn.parentNode.style.position = 'relative';
  css(noBtn, { position: 'absolute', left: offBtn.offsetLeft + 'px', top: offBtn.offsetTop + 'px', width: offBtn.offsetWidth + 'px', boxSizing: 'border-box', justifyContent: 'center', background: C.danger, borderColor: C.danger, color: '#ffffff' });
  vanish(noBtn, 0);
  markOn(world, ob, tNo, T('b13') - 0.2, 6);
  // 维护者的指针先去点草稿的合并按钮：按不动，按钮晃一下
  fromTo(offBtn, tNo + 0.45, { x: 0 }, { keyframes: [{ x: -12, duration: 0.06 }, { x: 10, duration: 0.07 }, { x: -6, duration: 0.07 }, { x: 0, duration: 0.06 }], immediateRender: false });
  sfx('error', tNo + 0.45, { g: 0.45, p: 0.6 });
  swapFade(offBtn, noBtn, tNo - 0.35, 0.3);
  const gDr = gloss(world, '<b>Ready for review</b> 之后才能合并', ob.x, ob.b + 18, 'up');
  fadeIn(gDr, tDr + 0.25, { y: 12 }); fadeOut(gDr, Q(T('b13')) - 0.05, { y: 10 });
  fromTo(draft, Q(T('b13')) + 0.4, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 70, duration: 0.35, ease: 'power2.in', immediateRender: false });
  // ── b13 维护者一点合并 ──
  const mgb = box(mg, world);
  const ptr2 = pointer(world);
  const tMg = Q(T('b13', '合并'));
  // b14：合并后 GitHub 给出 Delete branch；分支删掉，PR #13 留着（F3.7）。条子放在 main 卡下面
  const delBar = el(world, 'box', `<div class="row" style="gap:14px;padding:12px 20px;font-size:26px;height:72px;box-sizing:border-box">${oct('git-branch', 26, C.muted)}<span class="chip">你:fix-age</span><span class="k">可以删掉了</span><span class="btn db" style="margin-left:auto;padding:6px 16px;font-size:24px">Delete branch</span></div>`, 1180, 852, 620);
  const delRow = delBar.firstChild, db = delBar.querySelector('.db');
  const delRow2 = h('div', 'row', delBar, `${oct('git-branch', 26, C.muted)}<span class="chip" style="text-decoration:line-through;color:var(--muted);background:var(--bgm)">你:fix-age</span><span class="k">已删除</span><span class="btn" style="margin-left:auto;padding:6px 16px;font-size:24px">Restore branch</span>`);
  css(delRow2, { position: 'absolute', left: 0, top: 0, right: 0, height: '72px', gap: '14px', padding: '12px 20px', fontSize: '26px', boxSizing: 'border-box', background: '#ffffff' });
  vanish(delRow2, 0);
  const tDelIn = Q(T('b13', '主线')) + 0.3, tDel = Q(T('b14', '删掉')) + 0.1;
  slide(delBar, tDelIn, { y: 60, d: 0.45, ease: 'power3.out' }); sfx('pop', tDelIn, { g: 0.5, p: 0.6 });
  const dbb = box(db, world);
  clickAt(ptr2, tDel, db);
  swapFade(delRow, delRow2, tDel + 0.15, 0.3); sfx('whoosh', tDel + 0.15, { g: 0.35, p: 0.5 });
  // 「PR 一直留着」：标题的 #13 点亮，注解在原来 Pull Request 注解的位置
  const tKeep = Q(T('b14', 'PR')) - 0.15;
  const numEl = title.querySelector('.num');
  if (numEl) markOn(world, box(numEl, world), tKeep, s.end - 0.2, 4);
  const gKeep = gloss(world, '<b>#13</b> 和提交记录一直留着', tb.r + 30, 136, 'left');
  const tKeepG = Q(T('b14')) + 0.3;
  fadeIn(gKeep, tKeepG, { x: -14, y: 0 }); sfx('tick', tKeepG, { g: 0.6 });
  pointerPath(ptr2, [[tNo - 0.2, ob.x + ob.w * 0.8, ob.y + ob.h * 0.7], [tMg - 0.6, mgb.x + mgb.w * 0.8, mgb.y + mgb.h * 0.7, 0.5], [tDel - 0.6, dbb.x + dbb.w * 0.8, dbb.y + dbb.h * 0.7, 0.5]], s.end - 0.3);
  clickAt(ptr2, tNo + 0.4);
  clickAt(ptr2, tMg, mg);
  swapFade(mg, mg1, tMg + 0.12, 0.25); swapFade(openPill, mergedPill, tMg + 0.2, 0.3); swapFade(ask0, ask1, tMg + 0.25, 0.3);
  fadeIn(E4[0], tMg + 0.25); slide(E4[1], tMg + 0.3, { x: -90, d: 0.45, ease: 'power3.out' }); to(rail, tMg + 0.25, { height: 545, duration: 0.4 });
  sfx('thud', tMg + 0.12, { g: 0.7 }); sfx('chime', tMg + 0.35);
  hudState(tMg + 0.3, st('merged', 'git-merge', 'Merged #13'));
  // 「改动才进原仓库的主线」：原仓库 main 上的第 13 行现在是 >=（草稿卡让出来的位置）
  const mainCard = el(world, 'box', `<div class="boxh">${repoName('WaterRun', '活动报名', { size: 26, pub: false })}<span class="chip">main</span></div>
      <div style="padding:6px 0">${codeLn(13, `if (age <span class="w" style="background:var(--addW);border-radius:4px">${GE}</span> 18) {`)}</div>`, 1180, 690, 620);
  const tMain = Q(T('b13', '主线')) - 0.3;
  slide(mainCard, tMain, { y: 90, d: 0.45, ease: 'power3.out' }); sfx('thud', tMain + 0.3, { g: 0.55, p: 0.6 });

  // 前半朝右极慢横移，后半（PR 页）不动
  cam.track(s.start, { x: 960 + 14, y: 484, z: 1 }, [[s.start + 0.05, { x: 960 - 14 }, tPR - 0.7 - s.start, { ease: 'none', sfx: false }], [tPR - 0.6, { x: 960 }, 0.6, { sfx: false }]]);
});
