// 01 开箱即用。主画面是「关于」面板（照 about 截图）：b1 圈出 dsh-purge 集成、打上 MIT；b1b、b3 在左边深色卡片的空处写明破甲提示词已内置，
// 两件不用再做的事被划掉；b6 圈出「基于 DeepSeek Harness 0.2.2-rc.5」。b7 起面板沉下去，窗口收进右边那枚 DSHU 图标，
// 左边立起官方 DSH 的图标：两枚图标在 3D 里相对而立，各自带着程序目录、配置、会话、更新渠道，中间一道分隔。
scene('box', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  stageBg(world, 'def');
  const wrapU = h('div', 'abs', world); css(wrapU, { inset: '0', transformOrigin: '0 0' });
  const app = makeApp(wrapU, { home: true, sessions: HOME_SESS });
  const hp = homePage(app);

  // ── 关于面板 ──
  const scrim = h('div', 'scrim', app.el);
  const ab = h('div', 'panel', app.el); px(ab, 110, 34, 1560, 832); css(ab, { padding: '30px 40px', whiteSpace: 'normal' });
  h('div', '', ab, `<span style="font-size:30px">关于</span><span style="float:right;color:#646973">${icon('x')}</span>`);
  const card = h('div', 'abs', ab); px(card, 40, 96, 620, 700);
  css(card, { borderRadius: '24px', background: 'radial-gradient(700px 600px at 110% 40%, #1d2a4a, transparent 60%), linear-gradient(165deg,#1a2030,#0b0d12 70%)', color: '#fff', padding: '36px 40px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.12)' });
  const cl = h('div', '', card); css(cl, { position: 'relative', width: '104px', height: '104px' }); logoDark(104, cl);
  h('div', 'abs', card, 'DSHU').style.cssText += 'right:40px;top:60px;font:600 22px Inter;letter-spacing:4px;color:#aab0bb';
  h('div', '', card, '<div style="font:700 46px/1.15 Inter;margin-top:26px">DeepSeek Harness<br>Uncensored</div><div style="color:#c6cbd6;margin-top:12px;font-size:28px">更自由的探索未至之境</div><div style="color:#aab0bb;margin-top:22px;font-size:24px">作者　<span style="color:#fff">WaterRun</span></div>');
  const right = h('div', 'abs', ab); px(right, 700, 96, 780, 700); css(right, { display: 'flex', flexDirection: 'column', gap: '18px' });
  const sBase = h('div', 'sec', right, '<div class="k">基础与许可</div><div class="big" style="color:var(--mc);font:600 34px Inter;margin-top:10px">基于 DeepSeek Harness 0.2.2-rc.5</div><div style="color:var(--mu);margin-top:6px">GPL-3.0-or-later · 第三方组件与许可</div>');
  const sPurge = h('div', 'sec', right, '<div class="k">dsh-purge 集成</div><div class="kv"><span style="color:var(--mu)">dsh-purge fork 节点</span><span class="v">19082c2b9788</span><span style="color:var(--mu)">dsh-purge 提交时间</span><span class="v">2026-10-22 07:22 UTC</span></div>');
  const sRea = h('div', 'sec', right, '<div class="k">内置 REA · MIT</div><div style="font:600 32px Inter;margin-top:8px">REA 6.9.0</div><div style="color:var(--mu);margin-top:4px">REA 与 Node 随应用提供；Ghidra、IDA 或 Hopper 按需另行配置</div>');

  const tAb = c0 + 0.05;
  set(scrim, s.start, { autoAlpha: 0 }); fadeIn(scrim, tAb, { y: 0, d: 0.5 });
  rise3d(ab, tAb, { rx: 14, z: 360, y: 60, d: 1.0 }); sfx('whoosh', tAb, { g: 0.5 });
  [sBase, sPurge, sRea].forEach((e, i) => fadeIn(e, tAb + 0.35 + i * 0.12, { y: 18 }));
  // 面板底下的窗口内容收起（只留下压暗的窗口外形），不让被盖住的字从边上透出来
  [app.side, hp.head, hp.ctx, hp.comp.c].forEach((e) => fromTo(e, tAb, { opacity: 1 }, { opacity: 0, duration: 0.4, ease: 'power1.out' }));

  // b1：dsh-purge 那一栏；MIT 标签砸上去；左边卡片的空处挂注解（来源与许可）
  ringOn(app.el, sPurge, T('b1', 'dsh-purge') - 0.15, Tend('b3') + 0.3, { pad: 6 }); sfx('tick', T('b1', 'dsh-purge'));
  const mit = h('span', 'chip', sPurge.querySelector('.k'), '<b style="color:var(--mc)">MIT</b> · e1d8e59'); css(mit, { marginLeft: '14px', fontSize: '22px' });
  slam(mit, T('b1', 'MIT') - 0.05, { from: 1.5 }); sfx('pop', T('b1', 'MIT'));
  const nx = 110 + 40 + 36, ny = 34 + 96 + 440;
  const n1 = note(app.el, nx, ny, '<div class="k">DSH-PURGE</div>作者 小杨（YuJunZhiXue）。DSHU 用的是它提交 <b>e1d8e59</b> 那一版，当时的许可是 <b>MIT</b>；它现在的主分支已改为商业许可', 548);
  n1.dataset.name = 'dsh-purge 注解';
  fadeIn(n1, T('b1', 'dsh-purge') + 0.3, { x: -20 });
  // b1b、b3：同一处换成「破甲提示词已内置」，两件不用再做的事被划掉
  const tN2 = T('b1b') - 0.2;
  fadeOut(n1, tN2 - 0.3, { d: 0.3 });
  const n2 = note(app.el, nx, ny, '<div class="k">破甲提示词</div>已内置，四种模式共用；装好，在 设置 → 模型 填上凭据就能用<div style="margin-top:12px;color:#c9ced8;font-size:26px"><div><s class="s1">到处找提示词</s></div><div><s class="s2">自己改配置</s></div></div>', 548);
  n2.querySelectorAll('s').forEach((e) => css(e, { textDecoration: 'none', backgroundImage: 'linear-gradient(#ff8a8a,#ff8a8a)', backgroundRepeat: 'no-repeat', backgroundPosition: '0 55%', backgroundSize: '0% 3px' }));
  fadeIn(n2, tN2, { x: -20 });
  const built = h('span', 'chip', sPurge.querySelector('.k'), '已内置'); css(built, { marginLeft: '10px', fontSize: '22px', background: 'var(--mc)', color: '#fff' });
  slam(built, T('b1b', '内置') - 0.05, { from: 1.4 }); sfx('pop', T('b1b', '内置'));
  fromTo(n2.querySelector('.s1'), T('b3', '找'), { backgroundSize: '0% 3px' }, { backgroundSize: '100% 3px', duration: 0.35, ease: 'power2.out' });
  fromTo(n2.querySelector('.s2'), T('b3', '改配置'), { backgroundSize: '0% 3px' }, { backgroundSize: '100% 3px', duration: 0.35, ease: 'power2.out' });
  sfx('tick', T('b3', '找')); sfx('tick', T('b3', '改配置'));
  // b6：基础与许可；注解换成 DSH 是什么
  fadeOut(n2, T('b6') - 0.3, { d: 0.3 });
  ringOn(app.el, sBase.querySelector('.big'), T('b6', '源码') - 0.1, Tend('b6') + 0.2, { pad: 10 }); sfx('tick', T('b6', '源码'));
  const n3 = note(app.el, nx, ny, '<div class="k">DEEPSEEK HARNESS</div>深度求索开源的桌面智能体工作台（MIT 许可）。DSHU 在它 <b>0.2.2-rc.5</b> 的源码上改出来，以 <b>GPL-3.0-or-later</b> 发布', 548);
  fadeIn(n3, T('b6') - 0.05, { x: -20 });

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
  const capO = h('div', 'abs', stage3); px(capO, ixO + IC / 2 - 430, iy + IC + 66, 860); css(capO, { color: '#fff', textAlign: 'center' }); capO.innerHTML = '<div style="font:700 40px Inter">DeepSeek Harness</div><div style="color:#aab0bb;margin-top:8px;font-size:26px">官方版</div>';
  const capU = h('div', 'abs', stage3); px(capU, ixU + IC / 2 - 430, iy + IC + 66, 860); css(capU, { color: '#fff', textAlign: 'center' }); capU.innerHTML = '<div style="font:700 40px Inter">DeepSeek Harness <span style="background:var(--blue);padding:0 8px;border-radius:5px;font-size:30px;vertical-align:4px">UNCENSORED</span></div><div style="color:#aab0bb;margin-top:8px;font-size:26px">数据目录 <span class="mono">~/.dsh-uncensored</span></div>';
  fadeIn(capU, tSplit + 1.1, { y: 14 }); fadeIn(capO, tSplit + 1.25, { y: 14 });
  // b8：四样东西各一份，左右对照，逐词点亮
  const items = ['程序目录', '配置', '会话', '更新渠道'];
  const mkRow = (cx) => { const r = h('div', 'abs', stage3); px(r, cx - 430, iy + IC + 196, 860); css(r, { display: 'flex', gap: '14px', justifyContent: 'center' }); return r; };
  const rowO = mkRow(ixO + IC / 2), rowU = mkRow(ixU + IC / 2);
  const chipsO = items.map((t) => h('span', 'chip', rowO, t)), chipsU = items.map((t) => h('span', 'chip', rowU, t));
  [...chipsO, ...chipsU].forEach((c) => css(c, { background: 'rgba(255,255,255,.10)', color: '#fff', fontSize: '28px', padding: '8px 20px', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.12)' }));
  chipsU.forEach((c) => css(c, { background: 'rgba(37,99,235,.35)' }));
  items.forEach((k, i) => { const t = T('b8', k) - 0.1; rise3d(chipsU[i], t, { rx: 50, z: 120, y: 16, d: 0.45 }); rise3d(chipsO[i], t + 0.08, { rx: 50, z: 120, y: 16, d: 0.45 }); sfx('tick', t + 0.05, { g: 0.6 }); });
  // b9：中间一道分隔；两枚图标同时转正
  const wall = h('div', 'abs', stage3); px(wall, 958, 110, 4, 700); css(wall, { background: 'linear-gradient(180deg,transparent,#5b8cff,transparent)', transformOrigin: '50% 0', boxShadow: '0 0 30px #5b8cff' });
  const tw = T('b9', '独立') - 0.2;
  fromTo(wall, tw, { scaleY: 0, autoAlpha: 1 }, { scaleY: 1, duration: 0.6, ease: 'power3.out' }); sfx('thud', tw + 0.2, { g: 0.5 });
  fromTo(icU, tw, { rotationY: -16 }, { rotationY: 0, duration: 0.8, ease: 'power2.inOut', immediateRender: false });
  fromTo(icO, tw, { rotationY: 16 }, { rotationY: 0, duration: 0.8, ease: 'power2.inOut', immediateRender: false });

  cam.track(s.start, { x: 960, y: 540, z: 1 }, [drift(c0, tSplit - 0.1, -1), [tSplit, { x: 960 }, 0.9, { sfx: false }], drift(tSplit + 1.1, s.end, -1)]);
});
