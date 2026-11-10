// 第 6 章：选数据库先选边（服务 / 嵌入式）→ Firebird 两边都站 → 5.0.4 的真实实验（同一个文件，先嵌入、再走网络、再嵌入）→ 一九八四年的愿望 → 其余特性与许可。
scene('today', ({ root, s }) => {
  const { pl, world, vh } = fbPage(root, s, { ry: 0 });
  const cam = makeCamera(world, 1620, vh);   // 镜头：多数段落不动，只在需要强调时推近

  // ── A 选边 ──
  const A = fbSec(pl, true);
  const slab = (x, rot, dark) => {
    const e = fbCard(A, x, 30, 700, 690, '', { background: dark ? '#26282d' : '#f8f8f7', transformOrigin: dark ? '100% 50%' : '0% 50%' });
    init(e, { rotationY: rot, autoAlpha: 0, x: dark ? -160 : 160 });
    to(e, T('f2') - 0.1, { autoAlpha: 1, x: 0, duration: 0.42, ease: 'power3.out' });
    return e;
  };
  const L_ = slab(60, 16, true), R_ = slab(860, -16, false);
  sfx('thud', T('f2', '选边') + 0.05);
  const lt = fbAbs(L_, 44, 34, '服务', 'slab-t'); css(lt, { color: '#fff' });
  const rt = fbAbs(R_, 340, 34, '嵌入式', 'slab-t');
  fbIn(lt, T('f2', '选边') - 0.1, { y: -20 }, { d: 0.3 }); fbIn(rt, T('f2', '选边'), { y: -20 }, { d: 0.3 });
  // 左：很多人同时连一个服务
  const srv = fbAbs(L_, 330, 150, ART.server);
  fbIn(srv, T('f3', '服务') - 0.2, { y: -60 }, { d: 0.4, ease: 'bounce.out' });
  const users = [0, 1, 2].map((i) => {
    const p = fbAbs(L_, 50 + (i % 2) * 40, 150 + i * 92, artHuman({ ...CROWD[i * 2], w: 46 }));
    fbIn(p, T('f3', '多人') - 0.1 + i * 0.08, { x: -50 }, { d: 0.25 });
    return p;
  });
  sfx('pop', T('f3', '多人'), { g: 0.6, p: -0.6 });
  const wires = fbAbs(L_, 0, 0, '<svg width="700" height="690" viewBox="0 0 700 690"><g stroke="#8ea6c0" stroke-width="5" fill="none" stroke-dasharray="12 8"><path d="M110 200 C250 200 330 260 470 270"/><path d="M150 292 C270 292 350 300 470 290"/><path d="M110 384 C250 384 330 330 470 312"/></g></svg>');
  fbIn(wires, T('f3', '同时') - 0.05, { scaleX: 0, transformOrigin: '0 50%' }, { d: 0.35 });
  const my = fbLogo(L_, 50, 480, 'mysql', 200, { pad: 24 }), pg = fbLogo(L_, 320, 428, 'postgresql', 150, { pad: 22 });
  fbIn(my, T('f3', 'MySQL') - 0.1, { y: 60 }, { ease: 'back.out(1.5)', d: 0.35 }); sfx('pop', T('f3', 'MySQL'), { g: 0.7, p: -0.6 });
  fbIn(pg, T('f3', 'PostgreSQL') - 0.1, { y: 60 }, { ease: 'back.out(1.5)', d: 0.35 }); sfx('pop', T('f3', 'PostgreSQL'), { g: 0.7, p: -0.4 });
  // 右：一个文件放进程序里
  const app = fbAbs(R_, 160, 160, artApp(420, 270, '你的程序'));
  fbIn(app, T('f4', '省事') - 0.15, { y: 60 }, { d: 0.35, ease: 'back.out(1.3)' });
  const file = fbAbs(R_, 320, 250, '<svg width="110" height="140" viewBox="0 0 120 150"><path fill="#fff" stroke="#8e98a4" stroke-width="5" d="M6 6 h74 l34 34 v104 h-108 z"/><path fill="#d8d6cf" d="M80 6 v34 h34 z"/><g stroke="#b9c6d4" stroke-width="6"><path d="M24 70 H96 M24 92 H96 M24 114 H76"/></g></svg>');
  fbIn(file, T('f4', '文件') - 0.1, { y: -120 }, { d: 0.42, ease: 'bounce.out' });
  sfx('thud', T('f4', '文件') + 0.15, { g: 0.6, p: 0.5 });
  const sq = fbLogo(R_, 200, 480, 'sqlite', 300, { pad: 26 });
  fbIn(sq, T('f4', 'SQLite') - 0.1, { y: 60 }, { ease: 'back.out(1.5)', d: 0.35 }); sfx('pop', T('f4', 'SQLite'), { g: 0.7, p: 0.6 });
  // Firebird 两边都站：落在接缝上
  const both = fbAbs(A, 665, 270, '<img src="/img/firebird-logo.png" style="width:300px;height:300px;display:block;filter:drop-shadow(0 18px 20px rgba(0,0,0,.4))">');
  init(both, { autoAlpha: 0, y: -360, z: 160 });
  to(both, T('f5') - 0.1, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'bounce.out' });
  sfx('thud', T('f5') + 0.25); sfx('chime', T('f5', '两边') + 0.05, { g: 0.7 });
  [L_, R_].forEach((e, i) => to(e, T('f5', '两边') - 0.05, { rotationY: i ? -9 : 9, duration: 0.4, ease: 'power2.out' }));

  // ── B 真实实验：同一个文件，先嵌入式打开，再从网络连，再关掉服务打开（research/lab/out_01_two_modes.txt） ──
  const B = fbSec(pl);
  fbScroll(A, B, T('f6') - 0.4);
  const term = fbCard(B, 30, 20, 930, 700, '', { background: '#f7f7f8', boxShadow: '0 0 0 2px #e0e0dc, 10px 20px 36px rgba(50,30,10,.2)' });
  fbIn(term, T('f6') - 0.15, { x: -100, rotationZ: -1 }, { d: 0.4 });
  // 当前行：命令一敲下，蓝色的条就跳到那一行
  const cur = fbAbs(term, 0, 0, ''); css(cur, { width: '930px', height: '48px', background: 'rgba(33,86,165,.16)', borderLeft: '8px solid #2156a5' }); init(cur, { autoAlpha: 0 });
  const LN = (t, y, txt, snd = true) => { const e = fbAbs(term, 28, y, txt, 'tl'); fbIn(e, t - 0.04, { x: -14 }, { d: 0.14 }); if (snd) { sfx('blip', t, { g: 0.45, p: -0.3 }); set(cur, t - 0.04, { autoAlpha: 1, y: y - 8 }); } return e; };
  const mark = (y, t) => { const m = fbAbs(term, 16, y - 6, '', 'tl-mark'); fbIn(m, t, { scaleX: 0, transformOrigin: '0 50%' }, { d: 0.2 }); };
  LN(T('f6', '试了'), 22, 'ISQL Version: WI-V5.0.4.1812 Firebird 5.0');
  LN(T('f6', '开任何'), 74, '<b>$ isql -q</b>   <i># 没开任何服务</i>');
  LN(T('f7', '建库'), 124, "SQL> create database 'demo/shop.fdb' user 'SYSDBA';");
  LN(T('f7', '建表'), 172, 'SQL> create table t (id int, name varchar(20));');
  LN(T('f7', '写进'), 220, "SQL> insert into t values (1, 'phoenix');");
  LN(T('f7', '写进') + 0.45, 268, 'SQL> select * from t;');
  LN(T('f7', '写进') + 0.68, 316, '           1 phoenix');
  mark(316, T('f7', '写进') + 0.78);
  LN(T('f9', '启动') + 0.1, 390, '<b>$ isql -q -user SYSDBA</b>');
  LN(T('f9', '启动') + 0.25, 434, '<b>    inet://127.0.0.1:3051/.../demo/shop.fdb</b>', false);
  LN(T('f10') + 0.2, 482, '           1 phoenix');
  mark(482, T('f10', '这一') - 0.05);
  LN(T('f11', '关掉') + 0.2, 556, '<b>$ isql -q -user SYSDBA demo/shop.fdb</b>');
  LN(T('f11', '打开') - 0.2, 604, '           1 phoenix', false);
  mark(604, T('f11', '打开') - 0.05);
  // 右边的结构图：左一条是程序里的引擎（嵌入式），右一条是服务加网络，两条都通到下面同一个 shop.fdb
  const app2 = fbAbs(B, 990, 30, artApp(290, 220, '你的程序'));
  fbIn(app2, T('f6', '开任何') - 0.05, { y: -50 }, { d: 0.35 });
  const eng = fbAbs(B, 1085, 105, '<img src="/img/firebird-logo.png" style="width:100px;height:100px;display:block">');
  fbIn(eng, T('f8', '引擎') - 0.1, { scale: 0.3 }, { ease: 'back.out(1.8)', d: 0.35 });
  sfx('pop', T('f8', '引擎'), { g: 0.8, p: 0.4 });
  // 引擎就在程序里：程序窗口整块染上标志的橙色
  const tint = fbAbs(B, 990, 80, ''); css(tint, { width: '290px', height: '170px', background: 'rgba(246,138,33,.22)', border: '4px solid #F68A21', boxSizing: 'border-box' });
  B.insertBefore(tint, eng);
  fbIn(tint, T('f8', '程序') - 0.08, { scale: 0.9 }, { d: 0.14 });
  sfx('tick', T('f8', '程序'), { g: 0.6, p: 0.4 });
  const engL = fbAbs(B, 984, 400, '引擎在程序里<br>嵌入式', 'lab-o'); css(engL, { lineHeight: '1.3', fontSize: '30px' });
  fbIn(engL, T('f8', '嵌入') - 0.1, { y: 10 }, { d: 0.25 });
  const fdb = fbAbs(B, 1180, 470, `<div style="position:relative">${fbDbPlain(150)}<div class="fdb" style="position:absolute;left:-30px;top:186px;width:210px;text-align:center">shop.fdb</div></div>`);
  fbIn(fdb, T('f7', '建库') - 0.1, { y: 70 }, { ease: 'back.out(1.4)', d: 0.36 });
  sfx('pop', T('f7', '建库'), { g: 0.8, p: 0.5 });
  const ov = fbAbs(B, 0, 0, '<svg width="1620" height="900" viewBox="0 0 1620 900"><path d="M1135 252 L1228 490" stroke="#F68A21" stroke-width="9" fill="none"/><path d="M1490 226 C1470 330 1380 420 1322 490" stroke="#2156a5" stroke-width="7" stroke-dasharray="16 10" fill="none"/><circle data-e="1" r="10" fill="#F68A21"/><circle data-n="1" r="10" fill="#2156a5"/></svg>');
  const pE = ov.querySelectorAll('path')[0], pN = ov.querySelectorAll('path')[1], dE = ov.querySelector('[data-e]'), dN = ov.querySelector('[data-n]');
  arrowIn(pE, T('f8', '嵌入') - 0.1, 0.3);
  const srv2 = fbAbs(B, 1400, 30, ART.server);
  init(srv2, { scale: 0.8, transformOrigin: '50% 0%' });
  fbIn(srv2, T('f9', '启动') - 0.05, { y: -120 }, { d: 0.22, ease: 'power3.out', end: { scale: 0.8 } });
  sfx('pop', T('f9', '启动'), { g: 0.8, p: 0.6 });
  const srvL = fbAbs(B, 1338, 96, '服务', 'lab-b');
  fbIn(srvL, T('f9', '启动'), { y: 10 }, { d: 0.25 });
  const tNet = T('f9', '网络') - 0.1, tOff = T('f11', '关掉') - 0.06;
  init(pN, { autoAlpha: 0 }); to(pN, tNet, { autoAlpha: 1, duration: 0.2 });
  const tcp = fbAbs(B, 1482, 356, '网络', 'lab-b'); fbIn(tcp, tNet + 0.05, { y: 10 }, { d: 0.2 });
  const eT0 = T('f8', '嵌入') + 0.2, eT1 = T('f9', '启动') - 0.1, nT0 = tNet + 0.2, eT2 = T('f11', '打开') - 0.3;
  const lenN = pN.getTotalLength(), lenE = pE.getTotalLength();
  F((t) => {
    const onE = (t > eT0 && t < eT1) || (t > eT2 && t < Tend('f12') + 0.3);
    const pe = pE.getPointAtLength(lenE * (onE ? ((t - eT0) * 1.1) % 1 : 0));
    dE.setAttribute('cx', f1(pe.x)); dE.setAttribute('cy', f1(pe.y)); dE.style.opacity = onE ? 1 : 0;
    const onN = t > nT0 && t < tOff;
    const p = pN.getPointAtLength(lenN * (onN ? ((t - nT0) * 1.1) % 1 : 0));
    dN.setAttribute('cx', f1(p.x)); dN.setAttribute('cy', f1(p.y)); dN.style.opacity = onN ? 1 : 0;
  });
  to(srv2, tOff, { x: 220, autoAlpha: 0, duration: 0.42, ease: 'power2.in' });
  [pN, tcp, srvL].forEach((e) => fbOut(e, tOff));
  sfx('thud', tOff + 0.3, { g: 0.8, p: 0.5 });
  const same = fbAbs(B, 1000, 716, fbTag('同一个文件', 'small'));
  fbIn(same, T('f9', '同一个') - 0.05, { y: 20 }, { d: 0.25 });
  const noConv = fbAbs(B, 1360, 716, fbTag('不用转换', 'small'));
  fbIn(noConv, T('f11', '转换') - 0.1, { y: 20 }, { d: 0.25 });
  // 能放进程序里：一九八四年他们就想要这个
  const y84 = fbMini(B, 1380, 16, '一九八四年', '9 月');
  fbIn(y84, T('f12', '一九') - 0.08, { scale: 1.6, y: -24 }, { ease: 'back.out(1.6)' });
  sfx('tick', T('f12', '一九'), { p: 0.4 });
  // 第 1 章那张「放进程序里」的卡调回来：四十年前要的就是这个
  const back = fbCard(B, 470, 170, 520, 440, `<div class="abs" style="left:60px;top:46px">${artApp(400, 250, '应用程序')}</div><div class="abs" style="left:200px;top:120px">${fbDbPlain(110)}</div><div class="nm" style="position:absolute;left:0;right:0;bottom:30px">一九八四年：放进程序里</div>`);
  fbIn(back, T('f12') - 0.05, { y: 160, rotationZ: -4, z: 160 }, { d: 0.24, ease: 'power3.out' });
  sfx('pop', T('f12'), { g: 0.7 });
  to(term, T('f12') - 0.05, { opacity: 0.35, duration: 0.25 });

  // ── C 其余：存储过程、触发器；三种系统；不要钱 ──
  const C = fbSec(pl);
  fbScroll(B, C, T('f13') - 0.4);
  [['CREATE PROCEDURE', '存储'], ['CREATE TRIGGER', '触发']].forEach(([txt, w], i) => {
    const e = fbCard(C, 70 + i * 740, 20, 700, 120, `<div class="sql-t" style="line-height:120px;text-align:center">${txt}</div>`);
    fbIn(e, T('f13', w) - 0.08, { y: -60 }, { ease: 'back.out(1.5)', d: 0.35 }); sfx('pop', T('f13', w), { g: 0.7, p: -0.4 + i * 0.8 });
  });
  [['windows', 150, 'Windows'], ['linux', 130, 'Linux'], ['macos', 110, 'mac']].forEach(([k, w, word], i) => {
    const c = fbLogo(C, 150 + i * 470, 180, k, w, { pad: 30 });
    const off = (190 - w) / 2; css(c, { left: 150 + i * 470 + off + 'px' });
    fbIn(c, T('f13b', word) - 0.08, { y: 70 }, { ease: 'back.out(1.5)', d: 0.35 }); sfx('pop', T('f13b', word), { g: 0.7, p: -0.4 + i * 0.4 });
  });
  const free = fbCard(C, 70, 510, 760, 200, '<div class="free-t" style="line-height:200px;text-align:center">FREE LIKE FREE BEER</div>', { background: 'linear-gradient(90deg,#FAAC19,#F68A21)' });
  fbIn(free, T('f14', '下载') - 0.08, { scale: 1.25 }, { d: 0.26, ease: 'back.out(1.6)' });
  sfx('thud', T('f14', '下载'));
  const freeL = fbAbs(C, 76, 722, '官网用语：像免费啤酒一样不要钱', 'lab');
  fbIn(freeL, T('f14', '下载') + 0.2, { y: 10 }, { d: 0.25 });
  const pack = fbAbs(C, 940, 420, `<div style="position:relative;width:360px;height:330px">${ART.box.replace('width="200" height="190"', 'width="320" height="304"')}<img src="/img/firebird-logo.png" style="position:absolute;left:52px;top:150px;width:96px;height:96px;transform:skewY(20deg)"></div>`);
  fbIn(pack, T('f14', '打包') - 0.12, { y: -160 }, { d: 0.45, ease: 'bounce.out' });
  sfx('thud', T('f14', '打包') + 0.2, { g: 0.8, p: 0.4 });
  const sell = fbAbs(C, 1270, 440, '<div class="lab">你的商业软件</div>');
  fbIn(sell, T('f14', '商业') - 0.05, { x: 30 }, { d: 0.25 });
  const zero = fbAbs(C, 1280, 520, '$0', 'zero');
  fbIn(zero, T('f14', '也不要钱') - 0.08, { scale: 1.8, rotationZ: 12 }, { d: 0.22, end: { rotationZ: -6 }, ease: 'power4.out' });
  sfx('thud', T('f14', '也不要钱'), { g: 0.8, p: 0.6 });
});
