// 第 09 章 删：Alice 注销。
// 主画面：叶页 27 里 2048–2052 这五条记录，记录头把它们按编号连成一条链（M28）；下方是泳道。
// 一、删除：Alice 那条打上删除标记，仍在链上（D2）；Bob 的快照还开着，读到 42 岁的 Alice（D1）。
//     Bob 提交后 purge 把她移出链，页头可回收字节 0 → 73，空闲链指向 6184（D3）；Dave 落进 6184（D4）。
// 二、换一个时机：Bob 锁定读 2049..2051，锁住记录与间隙（X6、D.locks.gap、M10）；Dave 的插入要等；Bob 再读仍两行（M11）；Bob 提交后 Dave 插入。
scene('s9', ({ root, s, c0 }) => {
  const W = h('div', 'world', root);
  pan1(makeCamera(W), s, -1);             // 镜头只极慢横移（parts.js）
  const ov = overlay(W);
  const DL = D.del;
  const recOf = (state, id) => DL[state].records.find((r) => r.id === id);

  // ── 叶页 27 ──
  const pg = boxEl(W, 120, 110, 1680, 450, '');
  const pgT = h('div', 'abs', pg, `<span class="t-h">叶页 ${D.alice.page}</span><span class="t-small" style="margin-left:16px">记录按编号连成链</span>`); px(pgT, 28, 18);
  // 页头里的两个数：可回收字节、空闲链头（D3、D4）
  const hdr = h('div', 'abs', pg); px(hdr, 1060, 22);
  const gar = h('span', 'mono', hdr, ''); css(gar, { fontSize: '24px', marginRight: '34px' });
  const fre = h('span', 'mono', hdr, ''); css(fre, { fontSize: '24px' });
  const IDS = [2048, 2049, 2050, 2051, 2052];
  const CW = 268, GAP = 64, X0 = 46, Y0 = 108, CH = 214;
  const cx = (i) => X0 + i * (CW + GAP);
  const card = (r, i) => {
    const e = h('div', 'abs', pg); px(e, cx(i), Y0, CW, CH); css(e, { border: '2px solid var(--mainD)', background: 'var(--panel)' });
    e.dataset.name = '记录 ' + r.id;
    const nm = r.name.startsWith('User') ? r.name.slice(0, 9) + '…' : r.name;
    e.innerHTML = `<div class="mono" style="position:absolute;left:14px;top:10px;font-size:22px;color:var(--ink2)">偏移 ${r.offset}</div>`
      + `<div class="num" style="position:absolute;left:14px;top:44px;font:800 40px Inter;color:var(--ink)">${r.id}</div>`
      + `<div style="position:absolute;left:14px;top:96px;font:600 28px Inter;color:var(--ink)">${nm}</div>`
      + `<div style="position:absolute;left:14px;top:136px;font:500 24px 'Sans SC';color:var(--ink2)">${r.age} 岁 · <span class="trx">事务 ${r.trx_id}</span></div>`;
    return e;
  };
  const cards = IDS.map((id, i) => card(recOf('start', id), i));
  const iA = 2;
  const alice = cards[iA];
  alice.querySelector('.num').style.color = 'var(--main)';
  // 删除标记：Alice 卡片右上角的一位（D2：记录头 info bits 里的删除标记）
  const flag = h('div', 'abs', alice, '删除标记 <b>0</b>'); px(flag, 14, 172); css(flag, { font: '600 22px "Sans SC"', color: 'var(--ink2)' });
  const flagB = flag.querySelector('b'); css(flagB, { fontFamily: 'Mono', fontSize: '24px', marginLeft: '4px' });
  // Dave 的记录（D4）：落在同一个偏移
  const dv = recOf('dave', 2050);
  const dave = card(dv, iA); dave.querySelector('.num').style.color = 'var(--main)';
  // 链：相邻两条之间的箭头；purge 后 2049 直接指向 2051
  const chainY = 110 + Y0 + CH / 2;
  const links = IDS.slice(0, -1).map((_, i) => path(ov, `M${120 + cx(i) + CW + 4},${chainY} L${120 + cx(i + 1) - 6},${chainY}`, 'mainD', { w: 2.6 }));
  const ends = [path(ov, `M${120 + 6},${chainY} L${120 + cx(0) - 6},${chainY}`, 'mute', { w: 2, dashed: '5 6' }), path(ov, `M${120 + cx(4) + CW + 4},${chainY} L${120 + 1680 - 8},${chainY}`, 'mute', { w: 2, dashed: '5 6' })];
  const bypass = path(ov, `M${120 + cx(1) + CW / 2},${110 + Y0 - 4} C${120 + cx(1) + CW / 2 + 60},${110 + Y0 - 52} ${120 + cx(3) + CW / 2 - 60},${110 + Y0 - 52} ${120 + cx(3) + CW / 2},${110 + Y0 - 6}`, 'main', { w: 2.6 });
  // 腾出来的空位：虚线框
  const hole = h('div', 'abs', pg); px(hole, cx(iA), Y0, CW, CH); css(hole, { border: '2.5px dashed var(--acc)' });
  hole.innerHTML = `<div class="mono" style="position:absolute;left:14px;top:10px;font-size:22px;color:var(--acc)">偏移 ${DL.purged.free}</div><div style="position:absolute;left:14px;top:80px;font:700 30px 'Sans SC';color:var(--acc)">${DL.purged.garbage} 字节空着</div>`;
  hole.dataset.name = '空位';
  W.appendChild(ov);

  // ── 时刻 ──
  const tMark = T('d1', '删掉'), tFlag = T('d2', '删除标记') - 0.2;   // 泳道上 DELETE 在「删掉」；卡片上的删除标记讲到时才翻
  const tPurge = T('d5', '移走');
  const tDave = T('d7', '注册');
  const tRe = T('d8');                       // 换一个时机：回到「刚删掉、还没 purge」
  const tLockR = T('d8z', '锁定读');
  const tBobC2 = T('d13', '提交');

  // 页进场；五条记录与链
  wipe(pg, c0 + 0.1, { dir: 'l', d: 0.6 }); sfx('whoosh', c0 + 0.1, { g: 0.4 });
  cards.forEach((e, i) => slide(e, c0 + 0.35 + i * 0.08, { y: 24 }));
  [...links, ...ends].forEach((p, i) => arrowIn(p, c0 + 0.7 + i * 0.05, 0.4));
  // Alice 那条：删除标记、事务号换成删除她的那一笔（D2）；purge 后移出；换时机后回来；Dave 进来时退场
  const aliceState = (t) => {                // 'live' | 'marked' | 'gone'
    if (t >= tRe + 0.3) return t >= tBobC2 + 0.4 ? 'gone' : 'marked';
    if (t >= tPurge) return 'gone';
    if (t >= tFlag) return 'marked';
    return 'live';
  };
  const trxEl = alice.querySelector('.trx');
  const mrk = recOf('delete_marked', 2050);
  let lastA = '';
  F((t) => {
    const st = aliceState(t); if (st === lastA) return; lastA = st;
    alice.style.display = st === 'gone' ? 'none' : '';
    const m = st === 'marked';
    flagB.textContent = m ? '1' : '0'; flag.style.color = m ? 'var(--acc)' : 'var(--ink2)';
    alice.style.borderColor = m ? 'var(--acc)' : 'var(--mainD)';
    alice.style.borderWidth = m ? '4px' : '2px';
    trxEl.textContent = '事务 ' + (m ? mrk.trx_id : recOf('start', 2050).trx_id);
  });
  // purge 的那一下：Alice 往上抬起再消失（只在 tPurge 前后 0.6 秒）
  const ghost = alice.cloneNode(true); pg.appendChild(ghost); ghost.dataset.name = '';
  css(ghost, { borderColor: 'var(--acc)', borderWidth: '4px' });
  ghost.querySelector('b').textContent = '1';
  ghost.querySelector('.trx').textContent = '事务 ' + mrk.trx_id;
  vanish(ghost, 0); appear(ghost, tPurge);                    // 显隐与位移分开写
  fromTo(ghost, tPurge, { y: 0 }, { y: -70, duration: 1.0, ease: 'power2.in' });
  vanish(ghost, tPurge + 1.0);
  sfx('whoosh', tPurge, { g: 0.5 });
  // 链：2049→2050、2050→2051 两段在 Alice 不在时隐藏，绕过她的那根亮起
  const linkOn = (t) => aliceState(t) !== 'gone' || daveIn(t);
  const daveIn = (t) => (t >= tDave + 0.4 && t < tRe + 0.3) || t >= tBobC2 + 0.4;
  let lastL = null;
  F((t) => {
    const on = linkOn(t), by = !on && t >= tPurge + 0.2;
    const key = on + ':' + by; if (key === lastL) return; lastL = key;
    [links[1], links[2]].forEach((p) => { p.style.display = on ? '' : 'none'; });
    bypass.style.visibility = by ? 'visible' : 'hidden';
  });
  tl.fromTo(flag, { scale: 1 }, { scale: 1.35, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false, transformOrigin: '0% 50%' }, tFlag + 0.05);
  const still = h('div', 'tag acc', W, '行还在：只是打上删除标记'); px(still, 120 + cx(iA) - 20, 110 + Y0 - 48); css(still, { fontSize: '24px' });
  vanish(still, 0); slam(still, tFlag + 0.1, { from: 1.3 }); exit(still, tPurge - 0.25, { y: -8, d: 0.3 }); sfx('pop', tFlag + 0.1, { g: 0.45 });
  { const len = bypass.getTotalLength(); bypass.style.strokeDasharray = len + ' ' + len;   // 链当场改接：2049 直接指向 2051（只画线，显隐仍由帧函数管）
    tl.fromTo(bypass, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut', immediateRender: true }, tPurge + 0.6); }
  // 空位：purge 之后到 Dave 进来之前
  let lastH = null;
  F((t) => { const on = t >= tPurge + 0.4 && t < tDave + 0.4; if (on === lastH) return; lastH = on; hole.style.visibility = on ? 'visible' : 'hidden'; });
  // Dave：落进 6184（D4），换时机时退场，Bob 提交后再次落进
  let lastDv = null;
  F((t) => {
    const k1 = clamp((t - tDave) / 0.4), k2 = clamp((t - tBobC2 - 0.1) / 0.4);
    const on = daveIn(t) || (t >= tDave && t < tRe + 0.3) || t >= tBobC2 + 0.1;
    const k = t >= tBobC2 + 0.1 ? k2 : k1;
    const key = on ? Math.round(k * 20) : -1; if (key === lastDv) return; lastDv = key;
    dave.style.visibility = on ? 'visible' : 'hidden';
    dave.style.transform = `translateY(${Math.round(-120 * (1 - ease.out3(k)))}px)`; dave.style.opacity = (0.2 + 0.8 * k).toFixed(2);
  });
  // 页头：可回收字节与空闲链头随状态变（D3、D4）
  let lastHd = '';
  F((t) => {
    const purged = t >= tPurge + 0.4 && t < tDave + 0.4;
    const txt = purged ? [`可回收 ${DL.purged.garbage} 字节`, `空闲链 → ${DL.purged.free}`] : [`可回收 ${DL.start.garbage} 字节`, '空闲链 → 无'];
    const key = txt.join('|'); if (key === lastHd) return; lastHd = key;
    gar.textContent = txt[0]; fre.textContent = txt[1];
    gar.style.color = fre.style.color = purged ? 'var(--acc)' : 'var(--ink2)';
  });
  show(hdr, c0 + 0.8, { y: 0, d: 0.4 }); exit(hdr, tRe, { d: 0.25 });
  const freePtr = path(ov, `M${120 + 1060 + 300},${110 + 58} C${120 + 1060 + 300},${196} ${120 + cx(iA) + CW + 10},${186} ${120 + cx(iA) + CW - 30},${110 + Y0 - 2}`, 'acc', { w: 2.4, dashed: '8 6' });   // 从页头的「空闲链」下面出发，不穿过字
  tl.fromTo(freePtr, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: true }, tPurge + 0.6); tl.fromTo(freePtr, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, tDave + 0.6);
  const daveL = h('div', 'abs', W, `Dave 正好用上 Alice 腾出的 ${DL.purged.garbage} 字节`); px(daveL, 166, 470); css(daveL, { font: '600 24px "Sans SC"', color: 'var(--main)' });
  vanish(daveL, 0); show(daveL, tDave + 0.5, { y: 8, d: 0.35 }); exit(daveL, tRe - 0.1, { d: 0.3 });
  // 清除（purge）的注解
  const gPurge = gloss(W, 166, 470, '清除', '<b>清除</b>：后台真正移走没人需要的行', { w: 1200, src: 'M8、D1–D3' });
  vanish(gPurge, 0); show(gPurge, T('d5', '清除') + 0.1, { y: 8, d: 0.4 }); exit(gPurge, tDave + 0.3, { y: 8, d: 0.3 });
  const purgeTag = h('div', 'tag', W, 'purge'); px(purgeTag, 120 + cx(iA) + 80, 110 + Y0 - 48); css(purgeTag, { fontFamily: 'Inter', fontSize: '26px' });
  slam(purgeTag, tPurge - 0.1, { from: 1.4 }); exit(purgeTag, tDave - 0.2, { y: -10, d: 0.3 });

  // ── 泳道一（d1–d7）：管理员、Bob、Dave ──
  const LY = 650, RH = 112;
  const G1 = h('div', 'abs', W); px(G1, 0, 0);
  const L1 = lanes(G1, { x: 120, y: LY, w: 1680, gap: 190, rowH: RH, names: ['管理员', 'Bob', 'Dave'], pts: [[c0 + 0.3, 330], [tMark, 520], [T('d3z', '读得到'), 900], [T('d4', '提交'), 1120], [tDave, 1500], [Tend('d7z'), 1760]] });
  L1.enter(c0 + 0.3);
  const e1 = [];
  e1.push(L1.event(0, tMark, 'DELETE 2050', 'acc', -44));
  e1.push(L1.bar(L1.Y(1) - 20, c0 + 0.3, T('d4', '提交'), '快照', 'old'));          // D1：Bob 的快照在删除之前就开着
  e1.push(L1.event(1, T('d3z', '读得到'), 'SELECT 2050', '', -44));
  e1.push(L1.event(1, T('d4', '提交'), 'COMMIT', '', -44));
  e1.push(L1.event(2, tDave, 'INSERT 2050 Dave 35', '', -44));
  e1.forEach((e) => { if (e.classList.contains('vbar')) css(e, { height: '40px', fontSize: '22px', padding: '4px 10px' }); });
  const bobSees = h('div', 'echo', G1, 'Alice · 42'); px(bobSees, L1.X(T('d3z', '读得到')) - 60, L1.Y(1) + 26); css(bobSees, { color: 'var(--main)', fontWeight: 700 });
  appear(bobSees, T('d3z', '42') - 0.1); sfx('pop', T('d3z', '42'));
  const readA = path(ov, `M${L1.X(T('d3z', '读得到'))},${L1.Y(1) - 64} L${L1.X(T('d3z', '读得到'))},${600} L${120 + cx(iA) + CW / 2},${110 + Y0 + CH + 4}`, 'main', { w: 2.2, dashed: '7 6' });
  arrowIn(readA, T('d3', '快照'), 0.6); svgOut(readA, T('d4'));
  const ph1 = L1.playhead(c0 + 0.3, Tend('d7z'), 590, LY + 2 * RH + 40);
  const out1 = tRe - 0.1;
  exit(G1, out1, { y: 16, d: 0.3 });

  // ── 换一个时机（d8–d13）：Bob 锁定读 2049..2051 ──
  const rewind = h('div', 'tag', W, '刚删掉，还没 purge'); px(rewind, 1180, 130); css(rewind, { fontSize: '24px' });
  appear(rewind, tRe + 0.2); exit(rewind, Tend('d13') + 0.6, { d: 0.3 });
  const G2 = h('div', 'abs', W); px(G2, 0, 0);
  const L2 = lanes(G2, { x: 120, y: LY + 40, w: 1680, gap: 190, rowH: 150, names: ['Bob', 'Dave'], pts: [[tRe + 0.4, 330], [tLockR, 520], [T('d9', '插进'), 980], [T('d11', '再读'), 1200], [tBobC2, 1460], [Tend('d13') + 0.4, 1720]] });
  L2.enter(tRe + 0.2);
  const e2 = [];
  e2.push(L2.event(0, tLockR, '2049..2051 FOR UPDATE', '', -46));
  e2.push(L2.event(0, T('d11', '再读'), '再读', '', -46));
  e2.push(L2.event(0, tBobC2, 'COMMIT', '', -46));
  e2.push(L2.event(1, T('d9', '插进'), 'INSERT 2050', '', -46));
  const waitD = L2.bar(L2.Y(1) - 20, T('d9', '插进') + 0.2, tBobC2, '', 'wait'); css(waitD, { height: '40px' });
  const okD = h('div', 'pill fill', G2, '插入成功'); px(okD, L2.X(tBobC2) + 20, L2.Y(1) - 20); slam(okD, tBobC2 + 0.2, { from: 1.3 }); sfx('pop', tBobC2 + 0.2);
  const r1 = h('div', 'echo', G2, '2049、2051'); px(r1, L2.X(tLockR) + 172, L2.Y(0) - 60); css(r1, { color: 'var(--main)', fontWeight: 700 });
  const r2 = h('div', 'echo', G2, '2049、2051'); px(r2, L2.X(T('d11', '再读')) + 60, L2.Y(0) - 60); css(r2, { color: 'var(--main)', fontWeight: 700 });
  appear(r1, T('d8z', '两行')); appear(r2, T('d11', '那两行'));
  const ph2 = L2.playhead(tRe + 0.4, Tend('d13') + 0.4, 640, LY + 40 + 150 + 40);
  // 锁：2049 只锁记录（X,REC_NOT_GAP）；2050、2051 锁记录加前面的间隙（X）。取自 performance_schema.data_locks（X6）
  const modeOf = (id) => D.locks.gap.find((l) => l.data === String(id)).mode;
  const lockEls = [];
  [2049, 2050, 2051].forEach((id) => {
    const i = IDS.indexOf(id), m = modeOf(id);
    const lk = lockAt(pg, cx(i) + CW - 40, Y0 + 14, ''); lockEls.push(lk);
    const ml = h('div', 'abs mono', pg, m); px(ml, m === 'X' ? cx(i) + CW - 34 : cx(i) + 14, Y0 + CH + 12); css(ml, { fontSize: '22px', color: 'var(--mainD)', fontWeight: 600 }); lockEls.push(ml);
    if (m === 'X') {                                         // 记录前面的那段间隙
      const g = h('div', 'abs', pg); px(g, cx(i) - GAP + 6, Y0 + 30, GAP - 12, CH - 60); css(g, { background: 'var(--mainD)' }); g.dataset.name = id + ' 前面的间隙';
      const gl = lockAt(pg, cx(i) - GAP / 2 - 13, Y0 + CH / 2 - 8, ''); css(gl, { background: '#fff' }); gl.classList.add('s9w');
      lockEls.push(g, gl);
    }
  });
  const st9 = h('style', '', document.head, '.s9w::before { border-color: #fff !important; }');
  lockEls.forEach((e, k) => { vanish(e, 0); appear(e, tLockR + 0.3 + (k % 4) * 0.05); });
  lockEls.forEach((e) => exit(e, tBobC2 + 0.05, { d: 0.25 }));
  sfx('thud', tLockR + 0.3, { g: 0.6 });
  // 图例：两种锁
  const leg = h('div', 'abs', pg, '<span class="mono" style="font-size:22px;color:var(--mainD);font-weight:600">X,REC_NOT_GAP</span><span class="gloss" style="position:static;margin:0 34px 0 10px">只锁这一行</span><span class="mono" style="font-size:22px;color:var(--mainD);font-weight:600">X</span><span class="gloss" style="position:static;margin-left:10px">这一行，加上它前面的间隙</span>');
  px(leg, 880, 392);
  vanish(leg, 0); show(leg, tLockR + 0.6, { y: 8, d: 0.4 }); exit(leg, tBobC2, { d: 0.3 });
  // 间隙在被讲到时再强调一下（d10）
  lockEls.filter((e) => e.dataset.name && e.dataset.name.endsWith('间隙')).forEach((g) => tl.fromTo(g, { opacity: 1 }, { opacity: 0.45, duration: 0.3, yoyo: true, repeat: 3, immediateRender: false }, T('d10', '间隙')));
  // 幻影：被挡住的那一行（d12），虚线框里打叉
  const ph = h('div', 'abs', pg, '<div style="position:absolute;left:0;right:0;top:56px;text-align:center;font:800 34px Inter;color:var(--acc)">2050 ?</div>');
  px(ph, cx(iA) - GAP / 2 - 70, Y0 - 80, 140, 64); css(ph, { border: '2.5px dashed var(--acc)', background: 'var(--panel)' });
  ph.firstChild.style.top = '12px';
  ph.dataset.name = '幻影';
  vanish(ph, 0); slam(ph, T('d12', '多出') - 0.2, { from: 1.3 }); exit(ph, T('d13', '插') - 0.2, { d: 0.3 });
  sfx('error', T('d12', '多出'), { g: 0.4 });
  const tagP = h('div', 'tag acc', pg, '幻读'); px(tagP, 0, 0); css(tagP, { position: 'absolute', right: '8px', top: '8px', left: 'auto', fontSize: '26px' });
  vanish(tagP, 0); slam(tagP, T('d12', '幻读'), { from: 1.4 }); exit(tagP, T('d13', '插') - 0.2, { d: 0.3 });
  const gGap = gloss(W, 166, 494, '间隙', '<b>间隙</b>：记录间的空档，锁住就插不进来', { w: 820, src: 'M11、X6' });
  vanish(gGap, 0); show(gGap, T('d10', '间隙') + 0.1, { y: 8, d: 0.4 }); exit(gGap, T('d12') - 0.1, { y: 8, d: 0.3 });
  const gPh = gloss(W, 166, 494, '幻读', '<b>幻读</b>：第二次读多出了新插的行', { w: 820, src: 'M44、M46' });
  vanish(gPh, 0); show(gPh, T('d12', '幻读') + 0.1, { y: 8, d: 0.4 }); exit(gPh, T('d13', '插') - 0.2, { y: 8, d: 0.3 });
  const dvArrow = path(ov, `M${L2.X(T('d9', '插进'))},${L2.Y(1) - 70} L${L2.X(T('d9', '插进'))},${600} L${120 + cx(iA) - GAP / 2},${110 + Y0 + CH - 24}`, 'acc', { w: 2.2, dashed: '7 6' });
  arrowIn(dvArrow, T('d9', '挡住') - 0.3, 0.5); svgOut(dvArrow, tBobC2);
  // 本场收尾
  const tEnd = s.end - 0.7;
  exit(G2, tEnd, { y: 16, d: 0.3 });
});
