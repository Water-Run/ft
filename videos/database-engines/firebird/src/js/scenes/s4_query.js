// 04 从姓名索引取出记录：沿真实执行计划走一遍——第 230 页（姓名索引，根即叶子）→ 位图 → 记录号分解 → 指针页 / 页缓存 → 槽 → 记录头与可见性 → 30。
// 主画面：一条横向的取行路径，右侧常驻官网文档侧栏式的计划步骤，走到哪一步，哪一项被选中。
scene('query', ({ root, s, c0 }) => {
  const SW = 1920, N = 7;
  const { world, under, over } = stage(root, SW * N, 1080);
  const cam = makeCamera(world);
  const P = FB.page_map.clean_before.data_page_231, R = FB.record_layout;
  const NAMES = ['alice', 'bob', 'carol', 'dave', 'erin', 'frank', 'grace', 'heidi'];

  // ── 站 0：SQL 与实际执行计划 ──
  const sql = tx(world, 'm1', '', 120, 170, { fontWeight: 600 });
  const tSql = typeText(sql, "SELECT age FROM users WHERE name = 'alice';", c0 + 0.05, 30, { cursorUntil: c0 + 1.8, sfxGain: 0.4 });
  during(sql, c0 + 0.05, 1e9);
  const planBox = blk(world, 'panel', '', 120, 280, 1300, 380); planBox.dataset.name = '执行计划';
  const planT = tx(world, 't5', '实际执行计划（SET EXPLAIN ON）', 120, 690);
  const PL = FB.query.explain.split('\n').slice(0, 5);
  const ZH = ['', '过滤：检查名字', '按记录号取行', '位图', '姓名索引 · 范围扫描'];
  const planLines = PL.map((ln, i) => {
    const e = tx(world, 'm3', esc(ln), 150, 304 + i * 68, { fontSize: '27px' });
    const z = ZH[i] ? tx(world, 't5', ZH[i], 1440, 306 + i * 68, { color: C.ink }) : null;
    return { e, z };
  });
  const tPlan = T('q1', '计划') - 0.3;
  wipe(planBox, tPlan - 0.2, { dir: 't', d: 0.4 }); appear(planT, tPlan);
  planLines.forEach((p, i) => { appear(p.e, tPlan + i * 0.08); if (p.z) wipe(p.z, tPlan + 0.4 + i * 0.08, { dir: 'l', d: 0.3 }); });
  sfx('blip', tPlan, { g: 0.45 });
  const idxHi = blk(world, 'sel', '', 140, 304 + 4 * 68 - 6, 1270, 56); idxHi.style.zIndex = 1;
  appear(idxHi, T('q1', '姓名索引') - 0.1); sfx('tick', T('q1', '姓名索引'), { g: 0.5 });
  css(planLines[4].e, { zIndex: 2 });
  F((t) => { planLines[4].e.style.color = t >= T('q1', '姓名索引') - 0.1 ? C.white : ''; });

  // 常驻侧栏：计划的四步（不随镜头移动）
  const side = h('div', 'abs', root); px(side, 1480, 170, 400, 400); side.style.zIndex = 20;
  const steps = alist(side, 0, 0, ['姓名索引', '位图', '按记录号取行', '过滤 · 检查名字'], { w: 400, fs: 32 });
  const tSideIn = T('q2') - 0.3, tSideOut = T('q11') - 0.45;
  steps.els.forEach((e, i) => slide(e, tSideIn + i * 0.08, { x: 80, d: 0.45, ease: 'power3.out' }));
  wipeOut(side, tSideOut, { dir: 'r', d: 0.4 });
  const act = [[T('q2') - 0.3, T('q4') - 0.3], [T('q4') - 0.3, T('q6') - 0.4], [T('q6') - 0.4, T('q10') - 0.2], [T('q10') - 0.2, tSideOut + 0.4]];
  act.forEach(([a, b], i) => { classAt(steps.els[i], 'sel', a, b); if (i) sfx('tick', a, { g: 0.45, p: 0.7 }); });

  // ── 站 1：第 230 页——姓名索引的 B 树页，根即叶子 ──
  const X1 = SW;
  const bt = blk(world, 'panel', '', X1 + 120, 260, 900, 660); bt.dataset.name = '第 230 页 · 姓名索引';
  const btT = tx(world, 't3', '第 230 页 · 姓名索引的 B 树', X1 + 120, 170, { fontWeight: 700 });
  const rootTag = blk(world, 'chip ink', '树根 · 也是叶子', X1 + 1060, 280, 300, 70, { fontSize: '30px' });
  const rootNote = tx(world, 't5', '8 行数据，一页装下：层级 0', X1 + 1060, 370);
  const keys = NAMES.map((n, i) => {
    const r = blk(bt, 'chip w', '', 30, 30 + i * 76, 840, 62, { justifyContent: 'flex-start', fontSize: '32px' });
    r.innerHTML = `<span class="mono" style="font-size:32px;width:300px;padding-left:24px">${n}</span><span class="rn" style="color:#3A434B"></span>`;
    return r;
  });
  const tQ2 = T('q2');
  wipe(btT, tQ2 - 0.1, { dir: 'l', d: 0.4 }); wipe(bt, tQ2 - 0.05, { dir: 't', d: 0.5 });
  keys.forEach((k, i) => appear(k, tQ2 + 0.3 + i * 0.05));
  slam(rootTag, T('q2', '树根') - 0.15, { from: 1.2 }); appear(rootNote, T('q2', '树根') + 0.3); sfx('thud', T('q2', '树根') - 0.1, { g: 0.5 });
  const rootArr = arrow(over, [[X1 + 1060, 315], [X1 + 1040, 315]], 'ink');
  drawIn(rootArr, T('q2', '树根'), 0.2);
  // 查找：比较到 alice
  const probe = blk(world, '', '', X1 + 140, 280, 860, 74, { outline: '5px solid ' + C.teal, outlineOffset: '-5px' }); probe.dataset.name = '查找位置';
  appear(probe, T('q2', '查找') - 0.1); sfx('blip', T('q2', '查找'), { g: 0.4 });
  // q3：叶子里是姓名和记录号；年龄不在这里
  const tQ3 = T('q3');
  keys.forEach((k, i) => { const rn = k.querySelector('.rn'); swapAt(rn, '', '→ 记录号 ' + i, T('q3', '记录号') - 0.2 + i * 0.04); });
  classAt(keys[0], 'cur-rec', T('q3', '记录号'), s.end);
  sfx('pop', T('q3', '记录号'), { g: 0.5 });
  const noAge = tx(world, 't4', '年龄不在索引里，还在数据页', X1 + 1060, 520, { fontWeight: 500 });
  wipe(noAge, T('q3', '年龄') - 0.1, { dir: 'l', d: 0.45 });

  // ── 站 2：位图——标出要取的记录号 ──
  const X2 = SW * 2;
  const bmT = tx(world, 't3', '位图：按记录号逐位标记', X2 + 120, 170, { fontWeight: 700 });
  const bits = NAMES.map((n, i) => {
    const b = blk(world, 'chip g lat', '0', X2 + 120 + i * 150, 330, 130, 130, { fontSize: '64px', fontWeight: 300 });
    const lb = tx(world, 'lat', String(i), X2 + 170 + i * 150, 480, { fontSize: '34px', color: C.g4 });
    return { b, lb };
  });
  const bmL = tx(world, 't5', '记录号', X2 + 120, 540);
  const tQ4 = T('q4');
  wipe(bmT, tQ4 - 0.1, { dir: 'l', d: 0.4 });
  bits.forEach((o, i) => { appear(o.b, tQ4 + 0.2 + i * 0.05); appear(o.lb, tQ4 + 0.25 + i * 0.05); });
  appear(bmL, tQ4 + 0.5); sfx('tick', tQ4 + 0.3, { g: 0.4 });
  const tSet = T('q4', '收集') - 0.1;
  swapAt(bits[0].b, '0', '1', tSet); classAt(bits[0].b, 'cur-rec', tSet, s.end); sfx('pop', tSet, { g: 0.6 });
  const fromIdx = arrow(over, [[X2 - 100, 316], [X2 + 185, 316], [X2 + 185, 324]], 'flame', { w: 5 });
  drawIn(fromIdx, tSet - 0.3, 0.3);
  // q5：再按编号访问表
  const tQ5 = T('q5');
  const fetch = blk(world, 'chip ink', '按记录号 0 访问表', X2 + 120, 640, 520, 88, { fontSize: '36px' });
  const fArr = arrow(over, [[X2 + 185, 460], [X2 + 185, 520], [X2 + 185, 520]], 'ink', { head: false });
  const fArr2 = arrow(over, [[X2 + 185, 580], [X2 + 185, 632]], 'ink');
  const onlyL = tx(world, 't4', '只有 alice 这一位被标出', X2 + 720, 660, { color: C.g4 });
  appear(onlyL, T('q5', '标出') - 0.1);
  drawIn(fArr2, T('q5', '访问') - 0.4, 0.3); slide(fetch, T('q5', '访问') - 0.25, { y: 30, d: 0.45 }); sfx('pop', T('q5', '访问'), { g: 0.5 });

  // ── 站 3：记录号分解；它不是 id 列 ──
  const X3 = SW * 3;
  const rnT = tx(world, 't3', '记录号分解', X3 + 120, 170, { fontWeight: 700 });
  const rn = blk(world, 'chip cur-rec', '记录号 0', X3 + 120, 300, 420, 120, { fontSize: '52px', fontWeight: 700 });
  const part1 = blk(world, 'chip g', '<span class="t5" style="margin-right:16px">数据页序号</span><b class="lat" style="font-size:52px">0</b>', X3 + 780, 250, 520, 100);
  const part2 = blk(world, 'chip g', '<span class="t5" style="margin-right:16px">页内槽号</span><b class="lat" style="font-size:52px">0</b>', X3 + 780, 380, 520, 100);
  const sp1 = arrow(over, [[X3 + 540, 345], [X3 + 640, 345], [X3 + 640, 300], [X3 + 772, 300]], 'ink'), sp2 = arrow(over, [[X3 + 640, 360], [X3 + 640, 430], [X3 + 772, 430]], 'ink');
  const tQ6 = T('q6');
  wipe(rnT, tQ6 - 0.3, { dir: 'l', d: 0.4 }); slam(rn, tQ6 - 0.1, { from: 1.2 }); sfx('thud', tQ6, { g: 0.5 });
  drawIn(sp1, T('q6', '分解') - 0.1, 0.4); drawIn(sp2, T('q6', '分解'), 0.4);
  wipe(part1, T('q6', '数据页') - 0.15, { dir: 'l', d: 0.4 }); wipe(part2, T('q6', '槽号') - 0.15, { dir: 'l', d: 0.4 });
  sfx('pop', T('q6', '数据页'), { g: 0.45 }); sfx('pop', T('q6', '槽号'), { g: 0.45 });
  // q6a：和 users 表的 id 无关——alice 的 id 是 1，记录号是 0
  const tQ6a = T('q6a');
  const tbl = blk(world, 'panel', '', X3 + 120, 560, 1180, 260); tbl.dataset.name = 'users 表的一行';
  const thd = ['id', 'name', 'age'].map((c, i) => tx(tbl, 'mono', c, 40 + i * 380, 26, { fontSize: '32px', color: C.g4 }));
  const tdv = ['1', 'alice', '30'].map((c, i) => tx(tbl, 'mono', c, 40 + i * 380, 100, { fontSize: '52px', fontWeight: 600 }));
  const idRing = blk(tbl, '', '', 24, 92, 140, 84, { outline: '5px solid ' + C.teal, outlineOffset: '-5px' });
  const neq = tx(world, 't3', 'id 1 ≠ 记录号 0', X3 + 120, 850, { fontWeight: 700 });
  wipe(tbl, tQ6a - 0.1, { dir: 't', d: 0.45 }); appear(idRing, T('q6a', 'I D') - 0.15);
  wipe(neq, T('q6a', '无关') - 0.3, { dir: 'l', d: 0.45 }); sfx('error', T('q6a', '无关') - 0.2, { g: 0.35 });
  const inner = tx(world, 't4', '引擎内部的位置编号', X3 + 640, 330, { color: C.g4 });
  css(inner, { left: (X3 + 120) + 'px', top: '440px' }); wipe(inner, T('q6a', '内部') - 0.1, { dir: 'l', d: 0.4 });

  // ── 站 4：指针页把序号换成页号；缓存可以省掉这一步 ──
  const X4 = SW * 4;
  const ppT = tx(world, 't3', '第 225 页 · 指针页', X4 + 120, 170, { fontWeight: 700 });
  const pp = blk(world, 'panel', '', X4 + 120, 260, 460, 330); pp.dataset.name = '指针页 225';
  const ppE = blk(pp, 'chip w', '<span class="lat dim" style="margin-right:30px">[0]</span><b class="lat">231</b>', 30, 40, 400, 80, { fontSize: '40px' });
  const ppE2 = [1, 2].map((i) => blk(pp, 'chip w', `<span class="lat dim">[${i}]</span>`, 30, 40 + i * 100, 400, 80, { fontSize: '40px' }));
  const dp = blk(world, 'chip ink lat', '数据页 231', X4 + 840, 300, 400, 100, { fontSize: '44px' });
  const seq0 = blk(world, 'chip g', '数据页序号 0', X4 + 120, 660, 360, 80, { fontSize: '32px' });
  const a0 = arrow(over, [[X4 + 300, 652], [X4 + 300, 598]], 'ink'), a1 = arrow(over, [[X4 + 550, 340], [X4 + 832, 340]], 'ink');
  const tQ7 = T('q7');
  wipe(ppT, tQ7 - 0.3, { dir: 'l', d: 0.4 }); wipe(pp, tQ7 - 0.25, { dir: 't', d: 0.4 }); appear(seq0, tQ7 - 0.2);
  drawIn(a0, T('q7', '页序号') - 0.2, 0.3); classAt(ppE, 'sel', T('q7', '页序号'), T('q7a')); drawIn(a1, T('q7', '实际'), 0.4);
  slam(dp, T('q7', '数据页号') - 0.1, { from: 1.2 }); sfx('thud', T('q7', '数据页号'), { g: 0.5 });
  // q7a/q7b：页缓存（缓冲 2048 页）
  const cache = blk(world, '', '', X4 + 760, 520, 640, 380, { outline: '4px dashed ' + C.g4, outlineOffset: '-4px' }); cache.dataset.name = '页缓存';
  const cacheT = tx(world, 't4', '页缓存 · 2048 个缓冲页', X4 + 790, 540, { fontWeight: 500 });
  const map = blk(world, 'chip g', '序号 0 → 页 231', X4 + 790, 620, 300, 80, { fontSize: '30px' });
  const mem = blk(world, 'chip ink lat', '231', X4 + 1130, 620, 220, 80, { fontSize: '36px' });
  const memL = tx(world, 't5', '内存中的页面', X4 + 1130, 712);
  const bypass = arrow(over, [[X4 + 480, 700], [X4 + 600, 700], [X4 + 600, 660], [X4 + 782, 660]], 'teal', { dash: '14 10' });
  const tQ7a = T('q7a'), tQ7b = T('q7b');
  wipe(cache, tQ7a - 0.2, { dir: 'l', d: 0.45 }); appear(cacheT, tQ7a);
  wipe(map, T('q7a', '缓存') - 0.1, { dir: 'l', d: 0.35 }); drawIn(bypass, T('q7a', '省掉') - 0.3, 0.5);
  to(pp, T('q7a', '省掉'), { opacity: 0.35, duration: 0.4 }); to(a1, T('q7a', '省掉'), { opacity: 0.35, duration: 0.4 });
  sfx('blip', T('q7a', '省掉'), { g: 0.5 });
  slam(mem, T('q7b', '缓存') - 0.15, { from: 1.2 }); appear(memL, T('q7b', '内存') - 0.1); sfx('pop', T('q7b', '内存'), { g: 0.5 });
  classAt(mem, 'sel', T('q7b', '直接'), s.end);

  // ── 站 5：0 号槽 → 记录头 → 可见性 → 名字检查 → 30 ──
  const X5 = SW * 5;
  const p5T = tx(world, 't3', '数据页 231 · 0 号槽', X5 + 120, 170, { fontWeight: 700 });
  const slotB = bytes(world, ['e0', '1f', '20', '00'], X5 + 120, 260, { cw: 96, ch: 80, gap: 8, fs: 40, cls: () => 'sel' });
  const slotD = tx(world, 't3 lat', `偏移 ${P.slots[0].offset}`, X5 + 120, 360, { fontWeight: 700 });
  const hdrB = bytes(world, R.original.record_hex.match(/../g).slice(0, 13), X5 + 620, 260, { cw: 64, ch: 80, gap: 6, fs: 30, cls: (i) => 'hdr' });
  const hdrL = tx(world, 't4', '记录头', X5 + 620, 360, { fontWeight: 500 });
  const sToH = arrow(over, [[X5 + 504, 300], [X5 + 612, 300]], 'ink');
  const tQ8 = T('q8');
  wipe(p5T, tQ8 - 0.35, { dir: 'l', d: 0.4 });
  slotB.forEach((e, i) => appear(e, tQ8 - 0.2 + i * 0.05)); appear(slotD, T('q8', '偏移'));
  drawIn(sToH, T('q8', '定位') - 0.2, 0.3); hdrB.forEach((e, i) => appear(e, T('q8', '定位') + i * 0.03)); appear(hdrL, T('q8', '记录头'));
  sfx('tick', T('q8', '偏移'), { g: 0.45 }); sfx('pop', T('q8', '记录头'), { g: 0.5 });
  // q9：可见性
  const tQ9 = T('q9');
  const txB = blk(world, 'tx', '', X5 + 620 - 2, 258, 4 * 64 + 2, 84); appear(txB, T('q9', '事务') - 0.2);
  const txL = tx(world, 't4', '事务号 2', X5 + 620, 420, { fontWeight: 700 });
  const vis = alist(world, X5 + 620, 500, ['事务状态：已提交？', '快照：这个读取能否看见？'], { w: 640, fs: 32 });
  const ok = blk(world, 'sel', '可见', X5 + 1300, 500, 160, 140, { fontSize: '44px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' });
  appear(txL, T('q9', '事务') - 0.1);
  vis.els.forEach((e, i) => wipe(e, T('q9', i ? '快照' : '事务状态') - 0.2, { dir: 'l', d: 0.35 }));
  slam(ok, T('q9', '可见性') - 0.1, { from: 1.2 }); sfx('chime', T('q9', '可见性'), { g: 0.5 });
  const curL = tx(world, 't5', '从当前版本读起', X5 + 120, 440); appear(curL, T('q9', '当前') - 0.1);
  // q10：名字检查，返回 30（isql 的真实回显）
  const tQ10 = T('q10');
  const chk = blk(world, 'chip g', "<span class=\"mono\" style=\"font-size:34px\">name = 'alice'</span><b style=\"margin-left:24px\">相符</b>", X5 + 120, 680, 560, 90);
  const out = blk(world, 'dark', '', X5 + 760, 680, 520, 240); out.dataset.name = 'isql 回显';
  const outT = tx(out, 'mono', '    AGE\n=======\n     30', 40, 26, { fontSize: '40px', color: C.white, lineHeight: '1.25' });
  wipe(chk, T('q10', '名字') - 0.2, { dir: 'l', d: 0.4 }); sfx('tick', T('q10', '检查'), { g: 0.5 });
  wipe(out, T('q10', '返回') - 0.2, { dir: 't', d: 0.45 }); sfx('chime', T('q10', '三十'), { g: 0.7 });

  // ── 站 6：与 InnoDB 对照 ──
  const X6 = SW * 6;
  const tQ11 = T('q11'), tQ12 = T('q12');
  const cmpI = tx(world, 't3 b lat', 'InnoDB', X6 + 120, 170), cmpF = tx(world, 't3 b lat', 'Firebird', X6 + 120, 560);
  const iSteps = ['姓名索引', '主键值', '主键索引', '整行'].map((t_, i) => blk(world, i === 3 ? 'chip g' : 'chip w', t_, X6 + 120 + i * 330, 250, 280, 90, { fontSize: '34px', outline: '3px solid ' + C.g3, outlineOffset: '-3px' }));
  const fSteps = ['姓名索引', '记录号', '页与槽', '记录'].map((t_, i) => blk(world, 'chip w', t_, X6 + 120 + i * 330, 640, 280, 90, { fontSize: '34px', outline: '3px solid ' + C.g3, outlineOffset: '-3px' }));
  const iA = [0, 1, 2].map((i) => arrow(over, [[X6 + 400 + i * 330, 295], [X6 + 442 + i * 330, 295]], 'ink'));
  const fA = [0, 1, 2].map((i) => arrow(over, [[X6 + 400 + i * 330, 685], [X6 + 442 + i * 330, 685]], 'ink'));
  wipe(cmpI, tQ11 - 0.3, { dir: 'l', d: 0.4 });
  iSteps.forEach((e, i) => wipe(e, tQ11 + 0.1 + i * 0.12, { dir: 'l', d: 0.3 })); iA.forEach((a, i) => drawIn(a, tQ11 + 0.2 + i * 0.12, 0.2));
  classAt(iSteps[1], 'sel', T('q11', '主键') - 0.1, T('q12', '整行') - 0.1); classAt(iSteps[3], 'cur-rec', T('q12', '整行') - 0.1, s.end);
  sfx('tick', T('q11', '主键'), { g: 0.45, p: -0.3 }); sfx('tick', T('q12', '整行'), { g: 0.45, p: -0.3 });
  wipe(cmpF, T('q12', 'Fire') - 0.4, { dir: 'l', d: 0.4 });
  fSteps.forEach((e, i) => wipe(e, T('q12', 'Fire') - 0.2 + i * 0.1, { dir: 'l', d: 0.3 })); fA.forEach((a, i) => drawIn(a, T('q12', 'Fire') + i * 0.1, 0.2));
  classAt(fSteps[1], 'sel', T('q12', '记录号') - 0.1, s.end); classAt(fSteps[3], 'cur-rec', T('q12', '定位'), s.end);
  sfx('pop', T('q12', '记录号'), { g: 0.5, p: 0.3 });
  const iL = tx(world, 't5', '二级索引先得到主键，再走一棵树', X6 + 120, 360), fL = tx(world, 't5', '记录号直接换成页与槽', X6 + 120, 750);
  appear(iL, T('q11', '主键') + 0.3); appear(fL, T('q12', '定位'));

  // ── 镜头：逐站平移，站内慢推 ──
  const moves = [[T('q2') - 0.45, 1], [T('q4') - 0.45, 2], [T('q6') - 0.55, 3], [T('q7') - 0.45, 4], [T('q8') - 0.5, 5], [T('q11') - 0.5, 6]];
  const keysCam = [[c0 + 0.1, { x: 990, z: 1.03 }, moves[0][0] - c0 - 0.25, { ease: 'none', sfx: false }]];
  moves.forEach(([t, k], i) => {
    keysCam.push([t, { x: SW * k + 960, z: 1 }, 1.0, { g: 0.35 }]);
    const nextT = i + 1 < moves.length ? moves[i + 1][0] : s.end;
    keysCam.push([null, { x: SW * k + 985, z: 1.025 }, Math.max(0.5, nextT - t - 1.25), { ease: 'none', sfx: false }]);
  });
  cam.track(s.start, { x: 960, y: 540, z: 1 }, keysCam);
});
