// 第 6 章（两边都站，真实实验）与收尾（小众、接住、回到火狐）。
scene('today', ({ root, s, c0 }) => {
  const pg = fbPage(root, s, c0);

  // ── 选边 ──
  const a = fbPlane(pg, 6, 0, 0, 2000, '50% 40%');
  const slab = (x, rot, dark) => {
    const e = fbCard(a, x, 210, 700, 680, '', { background: dark ? '#1c1c1c' : '#f8f8f7', boxShadow: '0 26px 50px rgba(50,30,10,.35)', transformOrigin: dark ? '100% 50%' : '0% 50%' });
    init(e, { rotationY: rot, autoAlpha: 0, x: dark ? -160 : 160 });
    to(e, T('f2') - 0.12, { autoAlpha: 1, x: 0, duration: 0.4, ease: 'power3.out' });
    return e;
  };
  const L_ = slab(90, 20, true), R_ = slab(830, -20, false);
  sfx('thud', T('f2', '选边') + 0.05);
  const lt = fbAbs(L_, 54, 44, '服务', 'slab-t'); css(lt, { color: '#fff' });
  const rt = fbAbs(R_, 280, 44, '嵌入式', 'slab-t');
  // 左：几个人连同一个服务
  const srv = fbAbs(L_, 430, 300, fbDb(180, false));
  fbIn(srv, T('f3', '服务') - 0.15, { y: 60 }, { ease: 'back.out(1.3)' });
  [0, 1, 2].forEach((i) => {
    const p = fbAbs(L_, 70, 230 + i * 118, fbPerson(70, '#fff'));
    fbIn(p, T('f3', '多人') - 0.1 + i * 0.1, { x: -60 }, { d: 0.24 });
    const ln = fbAbs(L_, 170, 280 + i * 118, '', 'link-w'); init(ln, { transformOrigin: '0 50%', scaleX: 0, rotationZ: (1 - i) * 6 });
    to(ln, T('f3', '服务') + i * 0.08, { scaleX: 1, duration: 0.2, ease: 'power2.out' });
  });
  sfx('tick', T('f3', '多人'), { p: -0.5 });
  const flows = [0, 1, 2].map((i) => { const d = fbAbs(L_, 170, 276 + i * 118, '', 'flow-y'); fbIn(d, T('f3', '服务'), { scale: 0.3 }, { d: 0.15 }); return d; });
  const fT0 = T('f3', '服务'), fT1 = Tend('f3') + 0.3;
  flows.forEach((d) => fbOut(d, fT1));
  F((t) => flows.forEach((d, i) => { const k = t < fT0 ? 0 : ((t - fT0) * 1.5 + i * 0.3) % 1; d.style.transform = `translate(${250 * k}px,${Math.tan((1 - i) * Math.PI / 30) * 250 * k}px)`; }));
  const peersL = [['MySQL', 'My'], ['PostgreSQL', 'Postgre']];
  peersL.forEach(([n, w], i) => { const e = fbAbs(L_, 54 + i * 260, 590, n, 'peer-w'); fbIn(e, T('f3', w) - 0.08, { y: 40 }, { ease: 'back.out(1.5)' }); sfx('pop', T('f3', w), { g: 0.7, p: -0.5 }); });
  // 右：程序里一个文件
  const prog = fbCard(R_, 210, 230, 400, 300, '<div class="br-bar" style="height:44px"></div>');
  fbIn(prog, T('f4', '省事') - 0.15, { y: 60 }, { ease: 'back.out(1.3)' });
  const file = fbAbs(prog, 140, 96, `<svg width="120" height="150" viewBox="0 0 120 150"><path fill="#fff" stroke="#b5b2ab" stroke-width="4" d="M6 6 h74 l34 34 v104 h-108 z"/><path fill="#d8d6cf" d="M80 6 v34 h34 z"/></svg>`);
  fbIn(file, T('f4', '文件') - 0.1, { y: -130 }, { ease: 'bounce.out', d: 0.42 });
  sfx('thud', T('f4', '文件') + 0.14, { g: 0.7, p: 0.5 });
  const sq = fbAbs(R_, 54, 590, 'SQLite', 'peer-k');
  fbIn(sq, T('f4', 'Lite') - 0.08, { y: 40 }, { ease: 'back.out(1.5)' });
  sfx('pop', T('f4', 'Lite'), { g: 0.7, p: 0.5 });
  // 中间站上来的是它
  const tBoth = T('f5', '两边') - 0.25;
  const lg = fbAbs(a, 620, 360, '<img src="/img/firebird-logo.png" style="width:380px;height:380px;display:block;filter:drop-shadow(0 18px 22px rgba(0,0,0,.45))">');
  init(lg, { autoAlpha: 0, z: 200, y: -340 });
  to(lg, T('f5') - 0.05, { autoAlpha: 1, y: 0, duration: 0.42, ease: 'bounce.out' });
  sfx('thud', T('f5') + 0.25);
  sfx('chime', tBoth + 0.3, { g: 0.7 });
  fbKicks(a, [T('f2', '选边'), T('f3', '多人'), T('f3', '服务'), T('f3', 'My'), T('f3', 'Postgre'), T('f4', '省事'), T('f4', '文件'), T('f4', 'Lite'), T('f5') + 0.25]);

  // ── 真实实验 ──
  const b = fbPlane(pg, 4, -3, 0, 2400, '50% 40%');
  fbSwap(a, b, T('f6') - 0.3);
  const term = fbCard(b, 50, 200, 1000, 720, '', { background: '#f7f7f8', border: '2px solid #e0e0dc' });
  fbIn(term, T('f6') - 0.15, { x: -120, rotationZ: -1.5 });
  const mkL = (y, txt) => fbAbs(term, 30, y, txt, 'tl');
  const LN = (t, e, snd = true) => { fbIn(e, t - 0.04, { x: -14 }, { d: 0.14 }); if (snd) sfx('blip', t, { g: 0.45, p: -0.3 }); };
  const mark = (y, t) => { const m = fbAbs(term, 16, y - 6, '', 'tl-mark'); fbIn(m, t, { scaleX: 0, transformOrigin: '0 50%' }, { d: 0.2 }); };
  LN(T('f6', '试了'), mkL(22, 'ISQL Version: WI-V5.0.4.1812 Firebird 5.0'));
  LN(T('f6', '开任何'), mkL(76, '<b>$ isql -q</b>   <i># 没开任何服务</i>'));
  LN(T('f7', '建库'), mkL(126, "SQL> create database 'demo/shop.fdb' user 'SYSDBA';"));
  LN(T('f7', '建表'), mkL(174, 'SQL> create table t (id int, name varchar(20));'));
  LN(T('f7', '写进'), mkL(222, "SQL> insert into t values (1, 'phoenix');"));
  LN(T('f7', '写进') + 0.5, mkL(270, 'SQL> select * from t;'));
  LN(T('f7', '写进') + 0.72, mkL(318, '           1 phoenix'));
  mark(318, T('f7', '写进') + 0.82);
  const tNet = T('f9', '网络') - 0.1;
  LN(T('f9', '启动') + 0.15, mkL(390, '<b>$ isql -q -user SYSDBA</b>'));
  LN(T('f9', '启动') + 0.3, mkL(434, '<b>    inet://127.0.0.1:3051/.../demo/shop.fdb</b>'), false);
  LN(T('f10') + 0.2, mkL(482, '           1 phoenix'));
  mark(482, T('f10', '这一') - 0.05);
  LN(T('f11', '关掉') + 0.2, mkL(554, '<b>$ isql -q -user SYSDBA demo/shop.fdb</b>'));
  LN(T('f11', '打开') - 0.2, mkL(602, '           1 phoenix'), false);
  mark(602, T('f11', '打开') - 0.05);
  // 右边的结构图：同一个文件
  const fdb = fbCard(b, 1200, 640, 240, 170, '<div class="fdb-t">shop.fdb</div>', { background: 'linear-gradient(#F68A21,#EE2B24)' });
  fbIn(fdb, T('f7', '建库') - 0.1, { y: 80, z: 120 }, { ease: 'back.out(1.4)' });
  sfx('pop', T('f7', '建库'), { g: 0.8, p: 0.5 });
  const app = fbCard(b, 1090, 240, 250, 210, '<div class="br-bar" style="height:36px"></div><div class="box-l">你的程序</div>');
  fbIn(app, T('f6', '开任何') - 0.05, { y: -50, z: 80 });
  const eng = fbAbs(app, 58, 86, '<img src="/img/firebird-logo.png" style="width:96px;height:96px;display:block">');
  fbIn(eng, T('f8', '引擎') - 0.1, { scale: 0.3 }, { ease: 'back.out(1.8)' });
  sfx('pop', T('f8', '引擎'), { g: 0.8, p: 0.4 });
  const line1 = fbAbs(b, 1212, 460, '', 'v-link'); init(line1, { transformOrigin: '50% 0', scaleY: 0 });
  to(line1, T('f8', '嵌入') - 0.1, { scaleY: 1, duration: 0.2, ease: 'power2.out' });
  const srv2 = fbCard(b, 1370, 240, 200, 210, `<div class="br-bar" style="height:36px"></div><div class="box-l">服务</div><div style="text-align:center">${fbDb(84, false)}</div>`);
  fbIn(srv2, T('f9', '启动') - 0.05, { y: -60, x: 60, z: 100 }, { ease: 'back.out(1.3)' });
  sfx('pop', T('f9', '启动'), { g: 0.8, p: 0.5 });
  const dotE = fbAbs(b, 1208, 462, '', 'flow-y'), dotN = fbAbs(b, 1456, 462, '', 'flow-b');
  fbIn(dotE, T('f8', '嵌入'), { scale: 0.3 }, { d: 0.15 });
  const nT0 = T('f9', '网络'), nT1 = T('f11', '关掉') - 0.1, eT0 = T('f8', '嵌入'), eT1 = T('f12') + 1.5;
  fbIn(dotN, nT0, { scale: 0.3 }, { d: 0.15 });
  to(dotN, nT1, { autoAlpha: 0, duration: 0.1 });
  F((t) => {
    const kE = ((t - eT0) * 1.1) % 1, kN = ((t - nT0) * 1.1) % 1;
    dotE.style.transform = t > eT0 && t < eT1 ? `translateY(${kE * 165}px)` : 'translateY(0)';
    dotN.style.transform = t > nT0 && t < nT1 ? `translate(${-kN * 44}px,${kN * 165}px)` : 'translate(0,0)';
  });
  const line2 = fbAbs(b, 1462, 460, '', 'v-link dash'); init(line2, { transformOrigin: '50% 0', scaleY: 0, rotationZ: 14 });
  to(line2, tNet, { scaleY: 1, duration: 0.2, ease: 'power2.out' });
  const tcp = fbAbs(b, 1484, 520, 'TCP', 'lab-s'); fbIn(tcp, tNet + 0.05, { y: 12 }, { d: 0.18 });
  const tOff = T('f11', '关掉') - 0.06;
  to(srv2, tOff, { y: 440, rotationZ: 16, autoAlpha: 0.0, duration: 0.42, ease: 'power2.in' });
  fbOut(line2, tOff); fbOut(tcp, tOff);
  sfx('thud', tOff + 0.3, { g: 0.8, p: 0.5 });
  // 一九八四年的那一条
  const y84 = fbMini(b, 1120, 80, '一九八四年', '9 月');
  fbIn(y84, T('f12', '一九') - 0.08, { scale: 1.6, y: -24 });
  sfx('tick', T('f12', '一九'), { p: 0.3 });
  fbKicks(b, [T('f6', '任何'), T('f7', '建库'), T('f7', '建表'), T('f7', '写进'), T('f8', '引擎'), T('f8', '嵌入'), T('f9', '启动'), tNet + 0.1, T('f10', '这一'), T('f10') + 0.05, tOff + 0.32, T('f11', '转换'), T('f11', '打开'), T('f12', '一九'), T('f12', '想要')], 1.8);

  // ── 其余 ──
  const c = fbPlane(pg, 7, -6, 0, 2000);
  fbSwap(b, c, T('f13') - 0.3);
  fbOut(y84, T('f13') - 0.3);
  const sqlCards = [['CREATE PROCEDURE', '存储'], ['CREATE TRIGGER', '触发器']];
  sqlCards.forEach(([txt, w], i) => {
    const e = fbCard(c, 80 + i * 720, 210, 680, 120, `<div class="sql-t" style="line-height:120px;font-size:50px">${txt}</div>`);
    fbIn(e, T('f13', w) - 0.08, { y: -70, z: 120 }, { ease: 'back.out(1.5)' }); sfx('pop', T('f13', w), { g: 0.7 });
  });
  const oses = [['Windows', 'Windows'], ['Linux', 'Linux'], ['macOS', 'mac']];
  oses.forEach(([txt, w], i) => {
    const e = fbCard(c, 80 + i * 480, 390, 440, 150, `<div class="peer" style="line-height:150px;text-align:center;font-size:62px">${txt}</div>`);
    fbIn(e, T('f13b', w) - 0.08, { y: 80, z: 90 }, { ease: 'back.out(1.5)' }); sfx('pop', T('f13b', w), { g: 0.7, p: -0.3 + i * 0.3 });
  });
  const free = fbCard(c, 80, 620, 780, 230, '<div class="free-t" style="line-height:230px;font-size:74px">FREE LIKE FREE BEER</div>', { background: 'linear-gradient(90deg,#FAAC19,#F68A21)' });
  fbIn(free, T('f14', '下载') - 0.08, { scale: 1.3, z: 120 }, { d: 0.24 });
  sfx('thud', T('f14', '下载'));
  const pack = fbCard(c, 910, 620, 620, 230, `<div class="box-l" style="margin-top:22px;font-size:44px">你的商业软件</div><div style="display:flex;align-items:center;justify-content:center;gap:24px;margin-top:14px"><img src="/img/firebird-logo.png" style="width:98px;height:98px"><div class="zero">$0</div></div>`);
  fbIn(pack, T('f14', '商业') - 0.12, { x: 200, z: 100 }, { ease: 'back.out(1.3)' });
  sfx('pop', T('f14', '商业'));
  fbKicks(c, [T('f13', '存储'), T('f13', '触发器'), T('f13b', 'Windows'), T('f13b', 'Linux'), T('f13b', 'mac'), T('f14', '下载'), T('f14', '商业')], 2);
});

scene('end', ({ root, s, c0 }) => {
  const pg = fbPage(root, s, c0);

  // ── 真小众：柱高就是得分（FACTS U02，DB-Engines 2026 年 11 月，线性）
  const a = fbPlane(pg, 42, 0, -8, 2200, '50% 15%');
  const K = 380 / 823.23;
  const data = [['MySQL', 823.23, '第 2', 'My', 'g1b', 150], ['PostgreSQL', 689.69, '第 4', 'g1b', 'g1b', 500], ['SQLite', 94.68, '第 8', 'g1b', 'g1b', 850], ['Firebird', 18.45, '第 20', '小众', 'g1', 1200]];
  const src = fbAbs(pg, 50, 70, 'DB-Engines · 关系数据库 · 2026 年 11 月 · 流行度得分', 'lab-s');
  fbIn(src, T('g1b', 'D') - 0.1, { y: 10 });
  const floor = fbCard(a, 90, 180, 1440, 620, '', { background: '#f4f2ec', boxShadow: 'none', border: '3px solid #e3e0d8' });
  fbIn(floor, T('g1') + 0.05, { scale: 0.92 }, { d: 0.3 });
  data.forEach(([name, score, rank, w, cue, x], i) => {
    const hh = score * K, flame = name === 'Firebird';
    const b = fbBox(a, x + 50, 400, 130, 70, hh, flame ? '#FAAC19' : '#c9d4e6', flame ? '#EE2B24' : '#8ea4c4', flame ? '#F68A21' : '#a9bbd4');
    const t = w === 'g1b' ? T('g1b', 'My') + i * 0.22 : T(cue, w) - 0.06;
    init(b, { autoAlpha: 0, scaleZ: 0.01, transformOrigin: '50% 50% 0' });
    to(b, t, { autoAlpha: 1, scaleZ: 1, duration: 0.48, ease: 'power3.out' });
    sfx(flame ? 'thud' : 'pop', t + 0.1, { g: 0.7, p: -0.45 + i * 0.3 });
    const lab = fbAbs(a, x - 10, 550, name, 'bar-n');
    if (flame) css(lab, { color: '#c2410c' });
    fbIn(lab, t, { y: 24 }, { d: 0.22 });
    const r = fbAbs(a, x + 10, 620, `${rank} · ${score}`, flame ? 'bar-r-f' : 'bar-r');
    fbIn(r, t + 0.08, { y: 18 }, { d: 0.22 });
  });
  const arrow = fbAbs(a, 1262, 300, '<svg width="100" height="150" viewBox="0 0 70 104"><path d="M35 104 V20 M8 44 L35 14 L62 44" fill="none" stroke="#c2410c" stroke-width="11"/></svg>');
  fbIn(arrow, T('g2', 'Fire') - 0.08, { y: 70 }, { ease: 'back.out(1.6)' });
  sfx('thud', T('g2', 'Fire'), { g: 0.8, p: 0.5 });
  fbKicks(a, [T('g1', '小众'), T('g1b', 'D'), T('g1b', 'My'), T('g2', 'Fire'), T('g2', '四十')], 1.8);

  // ── 没有大公司，还在发新版，用它的人接住了它 ──
  const b = fbPlane(pg, 7, -5, 0, 2000);
  fbSwap(a, b, T('g3') - 0.3);
  fbOut(src, T('g3') - 0.3);
  const co = fbCard(b, 90, 240, 360, 200, '<div class="plate-b" style="line-height:200px;font-size:54px;color:#6a6a6a">大公司</div>');
  fbIn(co, T('g3') - 0.1, { x: -120 });
  const strike = fbAbs(co, -14, 94, '', 'strike'); init(strike, { scaleX: 0, transformOrigin: '0 50%' });
  to(strike, T('g3', '大公司') + 0.2, { scaleX: 1, duration: 0.18, ease: 'power3.out' });
  sfx('tick', T('g3', '大公司') + 0.2, { g: 0.8 });
  const crowd = fbAbs(b, 660, 690, `<div style="transform:scale(2.3);transform-origin:0 100%">${fbCrowd}</div>`);
  fbIn(crowd, T('g3', '用它') - 0.1, { y: 120 }, { ease: 'back.out(1.3)' });
  sfx('pop', T('g3', '用它'), { p: 0.2 });
  const hop0 = T('g3', '用它'), hop1 = T('g4') + 0.2;
  const hops = [0, 1, 2].map((i) => { const d = fbAbs(b, 760 + i * 130, 500, '', 'coin'); init(d, { autoAlpha: 0 }); to(d, hop0 + i * 0.1, { autoAlpha: 1, duration: 0.1 }); to(d, hop1, { autoAlpha: 0, duration: 0.15 }); return d; });
  F((t) => hops.forEach((d, i) => { d.style.transform = `translateY(${-Math.abs(Math.sin((t - hop0) * 118 / 60 * Math.PI + i * 1.1)) * 74}px)`; }));
  const rel = [['5.0', '2024.1', 90, false], ['6.0', '路线图', 340, true]];
  rel.forEach(([v, sub, x, dash], i) => {
    const e = fbCard(b, 90 + (i ? 260 : 0), 520, 240, 180, `<div class="plate-b" style="line-height:110px;font-size:72px">${v}</div><div class="rel-s">${sub}</div>`, dash ? { border: '3px dashed #b5b2ab', background: '#fbfaf8', boxShadow: 'none' } : {});
    fbIn(e, T('g4', i ? '第六版' : '第五版') - 0.1, { y: 70, z: 90 }, { ease: 'back.out(1.4)' });
    sfx('pop', T('g4', i ? '第六版' : '第五版'), { g: 0.7 });
  });
  // 接住：公司的牌子抽走，标志落下，人群接住
  const tLet = T('g5', '放手') - 0.1, tCatch = T('g5', '接住') - 0.15;
  const lgW = fbAbs(b, 800, 80, '<img src="/img/firebird-logo.png" style="width:300px;height:300px;display:block;filter:drop-shadow(0 16px 18px rgba(0,0,0,.4))">');
  init(lgW, { autoAlpha: 0, z: 150, y: -60 });
  to(lgW, T('g5') - 0.15, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power3.out' });
  to(lgW, tCatch, { y: 276, duration: 0.42, ease: 'bounce.out' });
  sfx('thud', tCatch + 0.2);
  sfx('chime', tCatch + 0.28, { g: 0.8 });
  fbOut(co, tLet, { x: -400, rotationZ: -14 });
  fbKicks(b, [T('g3', '大公司'), T('g3', '用它'), T('g3', '出钱'), T('g4', '第五版'), T('g4', '第六版'), T('g4', '路线'), tLet, tCatch + 0.2]);

  // ── 第三选择，回到火狐 ──
  const c = fbPlane(pg, 10, -6, 0, 2000, '50% 30%');
  fbSwap(b, c, T('g6') - 0.3);
  const lineup = [];
  const names = [['MySQL', 'My'], ['PostgreSQL', 'Postgre'], ['SQLite', 'Lite']];
  names.forEach(([n, w], i) => {
    const e = fbCard(c, 60 + i * 335, 330, 310, 230, `<div class="peer" style="line-height:230px">${n}</div>`);
    fbIn(e, T('g6', w) - 0.1, { y: 60, z: 120, rotationZ: i % 2 ? 3 : -3 }, { ease: 'back.out(1.5)' });
    sfx('pop', T('g6', w), { g: 0.7, p: -0.4 + i * 0.3 });
    lineup.push(e);
  });
  const blank4 = fbAbs(c, 1085, 250, '', 'blank4');
  fbIn(blank4, T('g6') + 0.1, { scale: 0.9 }, { d: 0.3 });
  fbOut(blank4, T('g6b', '选择') - 0.2);
  const f4 = fbCard(c, 1110, 280, 440, 360, `<div class="fin-c"><img src="/img/firebird-logo.png" style="width:220px;height:220px"></div><div class="slot"></div>`);
  fbIn(f4, T('g6b', '选择') - 0.3, { y: 90, z: 150, rotationZ: 5 }, { ease: 'back.out(1.5)' });
  sfx('thud', T('g6b', '选择') - 0.05);
  // 最后一句：开场的窗口回来，名字回到它的主人身上
  const br = fbBrowser(c, 90, 196, 860, 500);
  const tBack = T('g7', '火狐') - 0.25;
  init(br.el, { autoAlpha: 0, x: -300, z: 200, rotationZ: -3 });
  to(br.el, tBack, { autoAlpha: 1, x: 0, rotationZ: 0, duration: 0.36, ease: 'power3.out' });
  lineup.forEach((e) => fbOut(e, tBack));
  br.titles([['Mozilla Firefox', tBack + 0.05]]);
  sfx('pop', tBack + 0.05, { p: -0.3 });
  const tag = fbCard(c, 300, 196, 300, 66, '<div class="plate-t" style="line-height:66px">Firebird</div>');
  init(tag, { autoAlpha: 0, z: 240 });
  const tFly = T('g7', '名字') - 0.1;
  to(tag, tFly - 0.12, { autoAlpha: 1, duration: 0.12 });
  to(tag, tFly, { x: 870, y: 372, rotationZ: 0, duration: 0.7, ease: 'power2.inOut' });
  sfx('whoosh', tFly, { g: 0.45, p: 0.3 });
  sfx('chime', tFly + 0.7, { g: 0.8, p: 0.4 });
  const freeL = fbAbs(c, 90, 720, 'FREE LIKE A BIRD<span class="fin-g">官网用语 · 像鸟一样自由</span>', 'fin-l');
  fbIn(freeL, T('g7', '谁的') + 0.1, { x: -40 }, { d: 0.3 });
  fbKicks(c, [T('g6', 'My'), T('g6', 'Postgre'), T('g6', 'Lite'), T('g6b', '选择'), tBack + 0.1, tFly + 0.7], 2);
});
