// 开场：标志原位「黑化」。浅底上的 DSH 原版标志被一道蓝线自上而下漫过，变成黑底白鲸的 DSHU（两枚都是圆角矩形）；名字长出 UNCENSORED，底部中间注明 Uncensored 是什么。
// o6 读标语时，标志飞进侧栏的品牌位，应用窗口从标志所在的方块里向前「立」起来（3D），首页的标题正是这句标语。
scene('open', ({ root, s }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const CX = 960, TOP = 130, SZ = 400;

  // 浅色层：原版
  const light = h('div', 'abs', world); css(light, { inset: '0', background: 'radial-gradient(1400px 900px at 50% 30%, #ffffff, #dfe3ea)' });
  const L0 = h('div', 'abs', light); px(L0, CX - SZ / 2, TOP); L0.dataset.name = 'DSH 原版标志';
  shadowPlate(L0, SZ, 0, '0 30px 60px rgba(20,24,40,.20)'); logoSVG(SZ, L0);
  const tLight = h('div', 'title', light, '<div class="n" style="color:#1f2329">DeepSeek Harness</div><div class="ab" style="color:#3c414a">DSH</div>'); tLight.style.top = '600px';

  // 深色层：DSHU（同一位置），按分界线自上而下露出
  const dark = h('div', 'abs', world); css(dark, { inset: '0' });
  stageBg(dark, 'def');
  const L1 = h('div', 'abs', dark); px(L1, CX - SZ / 2, TOP); L1.dataset.name = 'DSHU 黑化标志';
  shadowPlate(L1, SZ, 1, '0 40px 90px rgba(0,0,0,.65), 0 0 120px rgba(37,99,235,.25)'); logoDark(SZ, L1);
  const tDark = h('div', 'title', dark, '<div class="n" style="color:var(--ink)">DeepSeek Harness <span class="u">UNCENSORED</span></div><div class="ab" style="color:#4a4f58"><span class="a1">DSH</span><span class="a2">U</span></div>'); tDark.style.top = '600px';
  const tagU = tDark.querySelector('.u'), abU = tDark.querySelector('.a2');
  // 策划者 2026-11-23：「不要在画面中写 黑化版」「画面底下中部增加注解: Uncensored: 去审查版」
  const gl = h('div', 'abs', dark); css(gl, { left: '0', right: '0', top: '770px', textAlign: 'center' });
  gl.innerHTML = '<span style="display:inline-block;background:rgba(20,23,30,.95);color:#fff;font-size:26px;padding:10px 24px;border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.14),0 0 0 1px rgba(255,255,255,.08)"><b style="color:#a9c1ff;font-weight:700">Uncensored</b>：去审查版</span>';
  gl.dataset.gloss = 'Uncensored'; gl.dataset.name = 'Uncensored 注解';
  const fine = h('div', 'fine', dark, '非 DeepSeek 官方项目 · 源码基于 DeepSeek Harness 0.2.2-rc.5'); fine.style.top = '840px';
  // 说明（策划者 2026-11-23）：画面里的界面是示意动画。放在最上层，从 o3 说完一直留到开场结束；深色胶囊在深色舞台和白色窗口上都看得清。
  // 高度取在窗口下沿（936）之内：窗口立起后胶囊整个落在输入框下面的空白里，不骑在窗口边上
  const disc = h('div', 'abs', world); css(disc, { left: '0', right: '0', top: '882px', textAlign: 'center', zIndex: 20 });
  disc.innerHTML = '<span style="display:inline-block;background:rgba(12,14,20,.86);color:#e3e6ec;font-size:24px;padding:8px 22px;border-radius:12px;box-shadow:0 0 0 1px rgba(255,255,255,.12)">动画页面 UI 按代码模拟渲染，真实页面截图参照 README</span>';
  const line = h('div', 'abs', world); css(line, { left: '0', width: '1920px', height: '3px', background: 'linear-gradient(90deg,transparent,#5b8cff 25%,#5b8cff 75%,transparent)', boxShadow: '0 0 24px #5b8cff' });

  // o1：原版先在（第一帧就有东西在动：标志从景深里轻轻落位）
  rise3d(L0, s.start, { rx: 10, z: 260, y: 20, d: 1.1 });
  fadeIn(tLight, s.start + 0.35, { y: 16, d: 0.6 });
  const abL = tLight.querySelector('.ab'); set(abL, s.start, { autoAlpha: 0 }); fadeIn(abL, Tend('o1') - 0.4, { y: 10, d: 0.5 });
  // 一道高光从标志上斜着扫过（只在浅色层里）
  const KS = SZ / 1024, shine = h('div', 'abs', L0); px(shine, 32 * KS, 32 * KS, 960 * KS, 960 * KS); css(shine, { overflow: 'hidden', borderRadius: (224 * KS) + 'px' });
  const band = h('div', 'abs', shine); px(band, -SZ, -SZ / 2, SZ * 0.35, SZ * 2); css(band, { background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.75), transparent)', transform: 'rotate(20deg)' });
  fromTo(band, 2.6, { x: 0 }, { x: SZ * 2.4, duration: 1.1, ease: 'power2.inOut' });
  // o2「黑化」：分界线从标志上沿扫到画面底部
  const w0 = T('o2', '黑化') - 0.1, wd = 1.5;
  const y0 = TOP - 40, y1 = 1100;
  fromTo(dark, w0, { clipPath: `inset(0px 0px ${1080 - y0}px 0px)` }, { clipPath: 'inset(0px 0px 0px 0px)', duration: wd, ease: 'power2.inOut' });
  fromTo(line, w0, { top: y0, autoAlpha: 1 }, { top: y1, duration: wd, ease: 'power2.inOut' });
  vanish(line, w0 + wd);
  sfx('riser', w0 - 1.2, { g: 0.35 }); sfx('thud', w0 + wd * 0.55, { g: 0.7 });
  vanish(light, w0 + wd + 0.05);
  // 深色层里的名字：先只有 DeepSeek Harness 与 DSH，o3 读到 Uncensored 时长出标签，句末 DSH 后面长出 U
  set(tagU, s.start, { autoAlpha: 0 }); set(abU, s.start, { autoAlpha: 0 });
  const tu = T('o3', 'Uncensored');
  fromTo(tagU, tu - 0.05, { autoAlpha: 0, scale: 1.3 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }); sfx('thud', tu, { g: 0.6 });
  const tU = Tend('o3') - 0.2;
  fromTo(abU, tU, { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'back.out(2)' }); sfx('pop', tU);
  fadeIn(gl, T('o3', 'Uncensored') + 0.15, { y: 10, d: 0.4 });
  fadeIn(fine, Tend('o3') + 0.1, { y: 10, d: 0.6 }); fadeIn(disc, Tend('o3') + 0.3, { y: 10, d: 0.6 });
  // o4「多了一个 Uncensored」：标签自己动一下（两段首尾相接）
  const tb = T('o4', 'Uncensored');
  fromTo(tagU, tb, { scale: 1 }, { scale: 1.12, duration: 0.25, ease: 'power2.out', immediateRender: false });
  fromTo(tagU, tb + 0.25, { scale: 1.12 }, { scale: 1, duration: 0.35, ease: 'power2.inOut', immediateRender: false });
  // 标志在 o4 里极慢地转一点（3D），让黑底的质感露出来
  fromTo(L1, T('o4'), { rotationY: 0, transformPerspective: P3 }, { rotationY: -10, duration: Tend('o4') - T('o4') + 0.6, ease: 'sine.inOut', immediateRender: false });

  // o6 标语：名字与小字退场，标志缩到侧栏的品牌位，窗口从标志的方块里向前立起来
  const tOpen = T('o6') - 0.35;
  fadeOut(tDark, tOpen - 0.1, { y: 20, d: 0.4 }); fadeOut(gl, tOpen - 0.1, { d: 0.3 }); fadeOut(fine, tOpen - 0.1, { d: 0.3 });
  const appWrap = h('div', 'abs', world); css(appWrap, { inset: '0' });
  const app = makeApp(appWrap, { home: true, sessions: HOME_SESS });
  const hp = homePage(app);
  hp.mic.style.color = 'var(--ink)';   // 首页模式按钮的 # 图标是正文色，不随模式变色（AgentPresetSeat .seatIcon）
  const lx = CX - SZ / 2;
  set(appWrap, s.start, { autoAlpha: 0 }); set(appWrap, tOpen, { autoAlpha: 1 });
  fromTo(appWrap, tOpen, { clipPath: `inset(${TOP}px ${1920 - lx - SZ}px ${1080 - TOP - SZ}px ${lx}px round 90px)` },
    { clipPath: 'inset(-200px -200px -200px -200px round 0px)', duration: 1.1, ease: 'power3.inOut' });
  fromTo(app.el, tOpen, { rotationX: 24, z: -500, transformPerspective: P3, transformOrigin: '50% 30%' }, { rotationX: 0, z: 0, duration: 1.3, ease: 'power3.out' });
  // 标志飞到侧栏品牌位：最上层另放一枚，与深色层里的那枚重合，接手之后原来那枚隐去，落位时淡成侧栏里的小鲸鱼
  const fly = h('div', 'abs', world); px(fly, lx, TOP); logoDark(SZ, fly); fly.dataset.name = 'DSHU 标志';
  const bx = 70 + 16 + 6 + 23, by = 36 + 24 + 23;
  set(fly, s.start, { autoAlpha: 0 }); set(fly, tOpen, { autoAlpha: 1 }); vanish(L1, tOpen);
  // 全片第 0 帧时间线不会重算（开机时本来就在 0），s.start 上的 set 不生效：窗口与飞行标志在 tOpen 之前由 t 直接藏起来（pitfalls：第 0 帧）
  F((t) => { if (t < tOpen) [appWrap, fly].forEach((e) => { e.style.visibility = 'hidden'; e.style.opacity = '0'; }); });
  fromTo(fly, tOpen, { x: 0, y: 0, scale: 1 }, { x: bx - CX, y: by - (TOP + SZ / 2), scale: 52 / SZ, duration: 1.1, ease: 'power3.inOut', immediateRender: false });
  fadeOut(fly, tOpen + 0.95, { d: 0.25 });
  set(app.mark, s.start, { autoAlpha: 0 }); fadeIn(app.mark, tOpen + 0.95, { y: 0, d: 0.25 });
  sfx('whoosh', tOpen, { g: 0.6 });
  // 首页内容随窗口立起依次到位，标语刷出
  set(hp.head, s.start, { autoAlpha: 0 });
  wipe(hp.head, T('o6') + 0.45, { dir: 'l', d: 0.9 }); sfx('chime', T('o6') + 0.6, { g: 0.5 });
  fadeIn(hp.ctx, tOpen + 0.8, { y: 10 }); fadeIn(hp.comp.c, tOpen + 0.9, { y: 16 });
  // oT：输入框里出现闪烁的光标，等你开口
  keyed(hp.comp.ph).at(T('oT'), { html: '<span class="cur" style="height:1em;width:3px;vertical-align:-.15em;background:var(--mc)"></span> 描述你想要构建的内容，/ 调用指令，@ 文件或对话' });
  blinkCursors(hp.comp.ph);   // 输入框里的光标按 530ms 明暗交替（原生文本框的闪烁）

  // 镜头基本不动：窗口立起后朝右极慢横移
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [drift(tOpen + 1.3, s.end, 1)]);
});
