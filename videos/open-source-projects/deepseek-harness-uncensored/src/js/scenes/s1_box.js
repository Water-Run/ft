// 01 开箱即用。主画面是「关于」面板（照 about 截图）：b1 圈出 dsh-purge 集成、打上 MIT；b1b、b3 在右栏下方的注解里写明破甲提示词已内置，
// 两件不用再做的事被划掉；b6 圈出「基于 DeepSeek Harness 0.2.2-rc.5」。b7 起面板沉下去，窗口收进右边那枚 DSHU 图标，
// 左边立起官方 DSH 的图标：两枚图标在 3D 里相对而立，各自带着程序目录、配置、会话、更新渠道，中间一道分隔。
scene('box', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  stageBg(world, 'def');
  const wrapU = h('div', 'abs', world); css(wrapU, { inset: '0', transformOrigin: '0 0' });
  const app = makeApp(wrapU, { home: true, sessions: HOME_SESS });
  const hp = homePage(app);

  // ── 关于面板（照 about 截图与 AboutDialog.tsx / .module.css；尺寸约为原界面的 1.66 倍）──
  // 本片的窗口比截图里的矮：真实对话框在矮窗口里是整体可滚动的，这里停在顶部；右栏最下面的 REA 一节在折线以下，不露出来（露出一截会和注解叠字）
  hp.mic.style.color = 'var(--ink)';   // 首页模式按钮的 # 图标是正文色，不随模式变色（AgentPresetSeat .seatIcon）
  const scrim = h('div', 'scrim', app.el);
  const ab = h('div', 'panel', app.el); px(ab, 110, 22, 1560, 856); css(ab, { padding: '30px 40px', whiteSpace: 'normal', overflow: 'hidden' });
  ab.dataset.overlapOk = '';   // 模态框：底下的窗口内容被它盖住（真实界面就是这样）
  h('div', '', ab, `<span style="font-size:30px">关于</span><span style="float:right;color:#646973">${icon('x')}</span>`);
  const LBL = 'rgba(255,255,255,.66)';
  const card = h('div', 'abs', ab); px(card, 40, 92, 680, 740);
  css(card, { boxSizing: 'border-box', borderRadius: '32px', border: '1px solid rgb(53,54,56)', overflow: 'hidden', isolation: 'isolate', color: '#fff', padding: '34px 44px',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px',
    background: 'radial-gradient(ellipse at 95% 0%, color-mix(in srgb, var(--mc) 36%, transparent), transparent 64%), linear-gradient(155deg, rgb(27,27,28), rgb(15,17,21))' });
  // 卡片右侧的同心圆（.identity::after：280px 圆、外扩 42 与 84px，2% 白）
  const rings = h('div', 'abs', card); css(rings, { width: '465px', height: '465px', right: '-282px', top: '150px', zIndex: '-1', borderRadius: '50%', border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 0 0 70px rgba(255,255,255,.02), 0 0 0 140px rgba(255,255,255,.02)' });
  const brandRow = h('div', '', card); css(brandRow, { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' });
  const cl = h('div', '', brandRow); css(cl, { position: 'relative', width: '96px', height: '96px' }); logoDark(96, cl);
  h('span', '', brandRow, 'DSHU').style.cssText = 'font:500 22px Inter;letter-spacing:.18em;color:rgba(255,255,255,.65)';
  h('div', '', card, 'DeepSeek Harness<br>Uncensored').style.cssText = 'font:600 44px/1.12 Inter;letter-spacing:-1px;margin-top:6px';
  h('div', '', card, '更自由的探索未至之境').style.cssText = 'font-size:24px;color:rgba(255,255,255,.75);margin-top:-8px';
  h('div', '', card, `<span style="color:${LBL}">作者</span>　WaterRun`).style.cssText = 'font-size:22px';
  const build = h('div', '', card); css(build, { width: '100%', display: 'grid', gap: '18px', fontSize: '22px', marginTop: '6px' });
  h('div', '', build, `<span style="color:${LBL}">Uncensored 版本</span><span style="font:500 46px/1 Inter;letter-spacing:-.8px;font-variant-numeric:tabular-nums">2026.11.23.0</span>`)
    .style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding-bottom:22px;border-bottom:1px solid rgba(255,255,255,.15)';
  h('div', '', build, `<div style="color:${LBL}">编译于</div><div style="margin-top:8px">2026-11-23 07:08 UTC</div>`);
  h('div', '', card, `${icon('github')} GitHub 仓库`).style.cssText = 'display:inline-flex;align-items:center;gap:12px;font-size:22px';
  const upd = h('div', '', card); css(upd, { marginTop: 'auto', width: '100%', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,.15)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px', fontSize: '22px' });
  h('div', '', upd, '<span style="width:10px;height:10px;border-radius:50%;background:rgb(34,197,94);box-shadow:0 0 0 5px rgba(34,197,94,.16);flex:none"></span>当前已是最新版本').style.cssText = 'display:flex;align-items:center;gap:14px;color:rgba(255,255,255,.8)';
  h('span', '', upd, '检查更新').style.cssText = 'padding:6px 18px;border-radius:10px;background:rgba(255,255,255,.06)';
  // 右栏：基础与许可、源码、dsh-purge 集成、内置 REA（.group：白底细边、圆角，标题前一道模式色短竖线）
  const right = h('div', 'abs', ab); px(right, 768, 92, 752, 740); css(right, { display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'hidden' });
  const MU = 'color:var(--mu)';
  const grp = (html) => { const g = h('div', 'sec', right, html); css(g, { padding: '18px 30px', borderRadius: '26px', display: 'grid', gap: '12px', flex: 'none' }); return g; };
  const kv = (rows) => `<div class="kv" style="grid-template-columns:270px 1fr;row-gap:12px;margin-top:0">${rows.map(([k, v]) => `<span style="${MU}">${k}</span><span class="v" style="font-variant-numeric:tabular-nums">${v}</span>`).join('')}</div>`;
  const sBase = grp(`<div class="k">基础与许可</div><div class="big" style="justify-self:start;color:var(--blue);font:500 29px Inter">基于 DeepSeek Harness 0.2.2-rc.5</div><div style="${MU};font-size:22px">GPL-3.0-or-later</div><div style="${MU};font-size:22px">第三方组件与许可</div>`);
  grp(`<div class="k">源码</div>${kv([['源码节点', '7efe20159de3'], ['提交时间', '2026-11-23 07:08 UTC']])}`);
  const sPurge = grp(`<div class="k">dsh-purge 集成</div>${kv([['dsh-purge fork 节点', '19082c2b9788'], ['dsh-purge 提交时间', '2026-10-22 07:22 UTC']])}`);
  const sRea = grp(`<div class="k">内置 REA · MIT</div><div style="display:flex;align-items:center;gap:12px;font:500 27px Inter">REA 6.9.0 <span style="color:var(--mu);display:inline-flex">${icon('github')}</span></div>${kv([['源码节点', 'd74549e495c5'], ['提交时间', '2026-11-12 08:58 UTC']])}<div style="${MU};font-size:22px">REA 与 Node 随应用提供；Ghidra/Java、IDA 或 Hopper 按需另行配置。</div>`);
  // 右栏只露到 dsh-purge 一节为止，下面空出来给注解
  css(right, { height: (sPurge.offsetTop + sPurge.offsetHeight) + 'px' }); sRea.style.visibility = 'hidden';

  // 打开（DSHU 3e312e1 修过关于页的抖动）：遮罩淡入；这么宽的对话框不再缩放，只淡入 160ms（Modal data-enter="fade"）；
  // 左卡与右栏同时只改不透明度 220ms（AboutDialog reveal）；窗口内容留在遮罩底下
  const tAb = c0 + 0.05;
  maskIn(scrim, tAb); tl.fromTo(ab, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.16, ease: 'power1.out', immediateRender: true }, tAb); sfx('whoosh', tAb, { g: 0.4 });
  fromTo(card, tAb, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, ease: 'power1.out' });
  fromTo(right, tAb, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, ease: 'power1.out' });

  // 注解挂在 dsh-purge 一节下方（让开高亮环），越过对话框与窗口的下沿（读作片子的注解，而不是界面）；舞台坐标 = 窗口坐标 + (70, 36)
  const nx = 70 + 110 + 768 - 6, ny = 36 + 22 + 92 + sPurge.offsetTop + sPurge.offsetHeight + 22, nw = 764;
  // b1：dsh-purge 那一栏；MIT 标签砸上去；下面挂注解（来源与许可）
  ringOn(app.el, sPurge, T('b1', 'dsh-purge') - 0.15, Tend('b3') + 0.3, { pad: 6, r: 30 }); sfx('tick', T('b1', 'dsh-purge'));
  const mit = h('span', 'chip', sPurge.querySelector('.k'), '<b style="color:var(--mc)">MIT</b> · e1d8e59'); css(mit, { marginLeft: '14px', fontSize: '22px' });
  slam(mit, T('b1', 'MIT') - 0.05, { from: 1.5 }); sfx('pop', T('b1', 'MIT'));
  const n1 = note(world, nx, ny, '<div class="k">DSH-PURGE</div>小杨（YuJunZhiXue）的项目；现在主分支已改为商业许可', nw);
  n1.dataset.name = 'dsh-purge 注解';
  fadeIn(n1, T('b1', 'dsh-purge') - 0.1, { y: 16 });
  // b1b、b3：同一处换成「装好之后还要做的一件事」（「已内置」由 dsh-purge 标题上的标签说；不用再做的两件事台词已经说了，不再写一遍）
  const tN2 = Tend('b1b') - 1.0;
  fadeOut(n1, tN2 - 0.3, { d: 0.3 });
  const n2 = note(world, nx, ny, '<div class="k">破甲提示词</div>装好 DSHU 后正常登录或配置凭据即可使用', nw);
  fadeIn(n2, tN2, { y: 16 });
  const built = h('span', 'chip', sPurge.querySelector('.k'), '已内置'); css(built, { marginLeft: '10px', fontSize: '22px', background: 'var(--mc)', color: '#fff' });
  slam(built, T('b1b', '内置') - 0.05, { from: 1.4 }); sfx('pop', T('b1b', '内置'));
  // b6：基础与许可；注解换成 DSH 是什么
  fadeOut(n2, T('b6') - 0.3, { d: 0.3 });
  ringOn(app.el, sBase.querySelector('.big'), T('b6', '源码') - 0.1, Tend('b6') + 0.2, { pad: 10 }); sfx('tick', T('b6', '源码'));
  const n3 = note(world, nx, ny, '<div class="k">DEEPSEEK HARNESS</div>深度求索开源的桌面智能体工作台，<b>MIT</b> 许可', nw);
  fadeIn(n3, T('b6'), { y: 16 });

  // ── b7–b9：同一台电脑上的两枚应用图标，在 3D 里相对而立 ──
  const tSplit = T('b7') - 0.3;
  fadeOut(n3, tSplit - 0.2, { d: 0.25 });
  sink3d(ab, tSplit - 0.1, { z: 300, d: 0.5 }); fadeOut(scrim, tSplit - 0.1, { d: 0.4 });
  const IC = 300, ixU = 1240, ixO = 380, iy = 150;
  // 窗口收进右边那枚 DSHU 图标里
  fromTo(wrapU, tSplit + 0.2, { x: 0, y: 0, scale: 1, autoAlpha: 1 }, { x: ixU + IC / 2 - 0.06 * 960, y: iy + IC / 2 - 0.06 * 540, scale: 0.06, autoAlpha: 0, duration: 0.9, ease: 'power3.inOut', immediateRender: false });
  sfx('whoosh', tSplit + 0.2, { g: 0.5 });
  const stage3 = h('div', 'abs', world); css(stage3, { inset: '0' });
  const floor = h('div', 'floor', stage3); floor.style.top = (iy + IC + 46) + 'px'; floor.style.setProperty('--mc', MC.def);
  const icU = h('div', 'abs', stage3); px(icU, ixU, iy); shadowPlate(icU, IC, 1, '0 40px 80px rgba(0,0,0,.65), 0 0 90px rgba(37,99,235,.25)'); logoDark(IC, icU); icU.dataset.name = 'DSHU 图标';
  const icO = h('div', 'abs', stage3); px(icO, ixO, iy); shadowPlate(icO, IC, 0, '0 40px 80px rgba(0,0,0,.55)'); logoSVG(IC, icO); icO.dataset.name = 'DeepSeek Harness 图标';
  fromTo(icU, tSplit + 0.7, { autoAlpha: 0, scale: 0.6, rotationY: 0, transformPerspective: P3 }, { autoAlpha: 1, scale: 1, rotationY: -16, duration: 0.8, ease: 'back.out(1.4)' });
  fromTo(icO, tSplit + 0.95, { autoAlpha: 0, x: -80, rotationY: 50, transformPerspective: P3 }, { autoAlpha: 1, x: 0, rotationY: 16, duration: 0.8, ease: 'power3.out' }); sfx('pop', tSplit + 1.0);
  set(floor, s.start, { autoAlpha: 0 }); fadeIn(floor, tSplit + 0.9, { y: 0, d: 0.6 });
  const capO = h('div', 'abs', stage3); px(capO, ixO + IC / 2 - 430, iy + IC + 66, 860); css(capO, { color: 'var(--ink)', textAlign: 'center' }); capO.innerHTML = '<div style="font:700 40px Inter">DeepSeek Harness</div><div style="color:#4a4f58;margin-top:8px;font-size:26px">官方版</div>';
  const capU = h('div', 'abs', stage3); px(capU, ixU + IC / 2 - 430, iy + IC + 66, 860); css(capU, { color: 'var(--ink)', textAlign: 'center' }); capU.innerHTML = '<div style="font:700 40px Inter">DeepSeek Harness <span style="background:var(--blue);padding:0 8px;border-radius:5px;font-size:30px;vertical-align:4px">UNCENSORED</span></div><div style="color:#4a4f58;margin-top:8px;font-size:26px">数据目录 <span class="mono">~/.dsh-uncensored</span></div>';
  fadeIn(capU, tSplit + 1.1, { y: 14 }); fadeIn(capO, tSplit + 1.25, { y: 14 });
  // b8：四样东西各一份，左右对照，逐词点亮
  const items = ['程序目录', '配置', '会话', '更新渠道'];
  const mkRow = (cx) => { const r = h('div', 'abs', stage3); px(r, cx - 430, iy + IC + 196, 860); css(r, { display: 'flex', gap: '14px', justifyContent: 'center' }); return r; };
  const rowO = mkRow(ixO + IC / 2), rowU = mkRow(ixU + IC / 2);
  const chipsO = items.map((t) => h('span', 'chip', rowO, t)), chipsU = items.map((t) => h('span', 'chip', rowU, t));
  [...chipsO, ...chipsU].forEach((c) => css(c, { background: 'rgba(255,255,255,.85)', color: 'var(--ink)', fontSize: '28px', padding: '8px 20px', boxShadow: 'inset 0 0 0 1px rgba(20,26,40,.10), 0 6px 16px rgba(28,36,60,.12)' }));
  chipsU.forEach((c) => css(c, { background: '#2563EB', color: '#fff' }));
  items.forEach((k, i) => { const t = T('b8', k) - 0.1; rise3d(chipsU[i], t, { rx: 50, z: 120, y: 16, d: 0.45 }); rise3d(chipsO[i], t + 0.08, { rx: 50, z: 120, y: 16, d: 0.45 }); sfx('tick', t + 0.05, { g: 0.6 }); });
  // b9：中间一道分隔；两枚图标同时转正
  const wall = h('div', 'abs', stage3); px(wall, 958, 110, 4, 700); css(wall, { background: 'linear-gradient(180deg,transparent,#5b8cff,transparent)', transformOrigin: '50% 0', boxShadow: '0 0 30px #5b8cff' });
  const tw = T('b9', '独立') - 0.2;
  fromTo(wall, tw, { scaleY: 0, autoAlpha: 1 }, { scaleY: 1, duration: 0.6, ease: 'power3.out' }); sfx('thud', tw + 0.2, { g: 0.5 });
  fromTo(icU, tw, { rotationY: -16 }, { rotationY: 0, duration: 0.8, ease: 'power2.inOut', immediateRender: false });
  fromTo(icO, tw, { rotationY: 16 }, { rotationY: 0, duration: 0.8, ease: 'power2.inOut', immediateRender: false });

  cam.track(s.start, { x: 960, y: 540, z: 1 }, [drift(c0, tSplit - 0.1, -1), [tSplit, { x: 960 }, 0.9, { sfx: false }], drift(tSplit + 1.1, s.end, -1)]);
});
