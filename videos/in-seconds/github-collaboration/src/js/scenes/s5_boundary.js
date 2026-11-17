// 边界或比较：有写权限的人不用 Fork，直接在原仓库开分支、提 PR；换个平台叫法也变（GitLab 叫 Merge Request），做的事一样，底下记录修改的始终是 Git。
// 前半：两条路并排——没有写权限的你（四步）与有写权限的人（少了 Fork 这一步）。后半：分层图——上层是各网站的功能，下层是 Git。
scene('boundary', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  // ── 两条路 ──
  const panel = (x, head) => el(world, 'box', `<div class="boxh">${head}</div>`, x, 150, 800, 640);
  const L1 = panel(120, `${oct('lock', 26, C.muted)}<b>没有写权限的你</b>`);
  const R1 = panel(1000, `${oct('check', 26, C.success)}<b>有写权限的人</b><span class="k">维护者、队友</span>`);
  const node = (x, y, html, cls = 'btn') => el(world, cls, html, x, y);
  const LX = 170, RX = 1050, Y = [250, 390, 530, 670];
  const ln = [
    node(LX, Y[0], `${oct('repo', 26, C.muted)}WaterRun / 活动报名`),
    node(LX, Y[1], `${oct('repo-forked', 26, C.muted)}Fork 到 你 / 活动报名`),
    node(LX, Y[2], `${oct('git-branch', 26, C.muted)}在副本里开分支`),
    node(LX, Y[3], `${oct('git-pull-request', 26, C.success)}回原仓库提 PR`),
  ];
  const rn = [
    node(RX, Y[0], `${oct('repo', 26, C.muted)}WaterRun / 活动报名`),
    node(RX, Y[1], `${oct('repo-forked', 26, C.muted)}不用 Fork`, 'btn off'),
    node(RX, Y[2], `${oct('git-branch', 26, C.muted)}直接在原仓库开分支`),
    node(RX, Y[3], `${oct('git-pull-request', 26, C.success)}提 PR`),
  ];
  css(rn[1], { borderStyle: 'dashed', background: '#ffffff' });
  const ov = overlay(world);   // 叠在面板之上，箭头才看得见
  const arrows = (nodes, color) => nodes.slice(1).map((n, i) => { const a = box(nodes[i], world), b = box(n, world); return path(ov, `M${a.x + 40},${a.b + 6} V${b.y - 8}`, color, { w: 4 }); });
  const la = arrows(ln, 'muted');
  // 右边：从仓库直接跳到分支，绕过「不用 Fork」那一格
  const r0 = box(rn[0], world), r2 = box(rn[2], world), r3 = box(rn[3], world), r1 = box(rn[1], world);
  const ra = [path(ov, `M${r0.x + 40},${r0.b + 6} C${r0.x - 20},${r0.b + 60} ${r2.x - 20},${r2.y - 60} ${r2.x + 40},${r2.y - 8}`, 'success', { w: 4 }),
    path(ov, `M${r2.x + 40},${r2.b + 6} V${r3.y - 8}`, 'success', { w: 4 })];
  // 左边一开场就在（接上一场：你走过的四步），右边按旁白一格格出现
  [L1, ...ln].forEach((e, i) => fadeIn(e, s.start + 0.1 + i * 0.08, { y: 12, d: 0.4 }));
  la.forEach((p, i) => arrowIn(p, s.start + 0.3 + i * 0.1, 0.4));
  sfx('whoosh', s.start + 0.1, { g: 0.45 });
  const tR = Q(T('d1', '写权限')) - 0.2;
  fadeIn(R1, tR, { x: 20, y: 0 }); fadeIn(rn[0], tR + 0.15, { x: 16, y: 0 }); sfx('pop', tR, { g: 0.6, p: 0.5 });
  const tNoF = Q(T('d1', 'Fork')) - 0.15;
  fadeIn(rn[1], tNoF, { x: 16, y: 0 }); sfx('tick', tNoF, { g: 0.7, p: 0.5 });
  markOn(world, box(ln[1], world), tNoF, Tend('d2') + 0.2, 6);
  const tBr = Q(T('d2')) - 0.1;
  arrowIn(ra[0], tBr - 0.1, 0.45); fadeIn(rn[2], tBr + 0.2, { x: 16, y: 0 }); sfx('pop', tBr + 0.2, { g: 0.6, p: 0.5 });
  const tP = Q(T('d2')) + 0.5;
  arrowIn(ra[1], tP - 0.1, 0.3); fadeIn(rn[3], tP + 0.1, { x: 16, y: 0 }); sfx('pop', tP + 0.1, { g: 0.6, p: 0.6 });

  // ── 换段：两条路往上收走，分层图从下面升起来（两边的「提 PR」变成上层的 Pull Request） ──
  const tL = T('d3') + 0.15;   // 两条路多留到 d3 开头，读完（F04）
  [L1, R1, ...ln, ...rn].forEach((e, i) => fadeOut(e, tL + (i % 5) * 0.03, { y: -24, d: 0.35 }));
  [...la, ...ra].forEach((p) => fromTo(p, tL, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }));
  sfx('whoosh', tL, { g: 0.5 });
  const item = (icon, t, col = C.fg) => `<span class="btn">${oct(icon, 26, col)}${t}</span>`;
  const layer = (x, y, w, col, title, items, foot = '') => {
    const e = el(world, '', `<div style="font-size:30px;font-weight:700;color:${col};margin-bottom:18px">${title}</div><div class="row" style="gap:16px;flex-wrap:wrap">${items}</div>${foot}`, x, y, w);
    css(e, { border: `3px solid ${col}`, borderRadius: '16px', padding: '24px 28px', background: '#f6f8fa', whiteSpace: 'normal' });
    return e;
  };
  // 两边都写英文原名；d4 时各自下面出一行字面意思：一个是「拉取」，一个是「合并」——名字不同（F10.7、F10.8）
  const foot = (html) => `<div class="lit" style="margin-top:20px;font-size:28px;color:var(--fg);white-space:nowrap">${html}</div>`;
  const hub = layer(120, 180, 820, C.accent, 'GitHub 网站上的功能', item('repo-forked', 'Fork') + `<span class="btn pr">${oct('git-pull-request', 26, C.success)}Pull Request</span>` + item('issue-opened', 'Issue', C.success),
    foot(`<span class="mono" style="color:var(--accent);margin:0 12px 0 6px">pull</span> 拉取<span class="k"> · 中文文档译作</span>“拉取请求”`));
  const lab = layer(1000, 180, 800, C.muted, 'GitLab 网站上的功能', item('repo-forked', 'Fork') + `<span class="btn mr">${oct('git-pull-request', 26, C.success)}Merge Request</span>` + item('issue-opened', 'Issue', C.success),
    foot(`<span class="mono" style="color:var(--accent);margin:0 12px 0 6px">merge</span> 合并<span class="k"> · 直译</span>“合并请求”`));
  const git = layer(120, 600, 1680, C.success, 'Git：记下每一次修改', ['commit 提交', 'branch 分支', 'merge 合并', 'push 推送'].map((t) => `<span class="chip" style="font-size:28px;color:var(--fg);background:#ffffff;border:2px solid var(--bd);padding:6px 16px">${t}</span>`).join(''));
  const tHub = Q(T('d3')) + 0.5;
  fadeIn(hub, tHub, { y: 30, d: 0.5 }); sfx('pop', tHub, { g: 0.6, p: -0.4 });
  const tLab = Q(T('d3', 'GitLab')) - 0.2;
  fadeIn(lab, tLab, { x: 30, y: 0, d: 0.45 }); sfx('pop', tLab, { g: 0.6, p: 0.5 });
  const tMR = Q(T('d3', 'Merge')) - 0.15;
  const lits = [hub, lab].map((e) => e.querySelector('.lit'));
  lits.forEach((e) => vanish(e, 0));
  const tLit = Q(T('d4')) - 0.1;
  lits.forEach((e, i) => fadeIn(e, tLit + i * 0.35, { y: 10, d: 0.4 }));
  sfx('pop', tLit, { g: 0.5, p: -0.3 }); sfx('pop', tLit + 0.35, { g: 0.5, p: 0.5 });
  // d4「做的事一样」：两张卡的 Pull Request 与 Merge Request 之间出一个等号——名字不同，做的是同一件事（F10.7、F3.1）
  const pb = box(hub.querySelector('.pr'), world), hb0 = box(hub, world), lb0 = box(lab, world);
  const eq = el(world, '', '=', 0, 0);
  css(eq, { fontSize: '56px', fontWeight: 700, color: C.accent, lineHeight: 1 });
  eq.style.left = ((hb0.r + lb0.x) / 2 - eq.offsetWidth / 2) + 'px'; eq.style.top = (pb.cy - eq.offsetHeight / 2) + 'px';
  const tEq = Q(T('d4', '一样')) - 0.1;
  fromTo(eq, tEq, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' });
  sfx('tick', tEq, { g: 0.6 });
  markOn(world, box(hub.querySelector('.pr'), world), tMR, Tend('d4') + 0.3, 6);
  markOn(world, box(lab.querySelector('.mr'), world), tMR + 0.1, Tend('d4') + 0.3, 6);
  sfx('tick', tMR, { g: 0.7 });
  // 下层：Git 从下面升起来，两条虚线把上层接到它身上
  const tGit = Q(T('d5')) - 0.3;
  fadeIn(git, tGit, { y: 40, d: 0.55 }); sfx('thud', tGit + 0.3, { g: 0.6 });
  const hb = box(hub, world), lb = box(lab, world), gb = box(git, world);
  const d1 = path(ov, `M${hb.cx},${hb.b + 8} V${gb.y - 10}`, 'muted', { w: 4, dashed: '10 10', arrow: false });
  const d2 = path(ov, `M${lb.cx},${lb.b + 8} V${gb.y - 10}`, 'muted', { w: 4, dashed: '10 10', arrow: false });
  arrowIn(d1, tGit + 0.35, 0.4); arrowIn(d2, tGit + 0.45, 0.4);
  const note = el(world, 'k', '都建在 Git 上', hb.cx + 24, hb.b + 70); css(note, { fontSize: '28px' });
  fadeIn(note, tGit + 0.5, { x: -10, y: 0 });
  fromTo(git, Q(T('d5', '始终')), { borderWidth: '3px' }, { keyframes: [{ borderWidth: '7px', duration: 0.18 }, { borderWidth: '4px', duration: 0.4 }], immediateRender: false });
  sfx('chime', Q(T('d5', '始终')), { g: 0.5 });

  hudState(s.start + 0.2, st('merged', 'git-merge', 'Merged #13'));
  const hold = s.end - s.start, dx = Math.min(24, 1.5 * hold);
  cam.track(s.start, { x: 960 + dx / 2, y: 484, z: 1 }, [[s.start + 0.05, { x: 960 - dx / 2 }, hold, { ease: 'none', sfx: false }]]);
});
