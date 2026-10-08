// 03 OpenCode v2（下）：上下文的预算与删减。OpenCode 皮肤。
// 面板：Q1 压缩（文档里的前后对照原文）→ Q2 工具输出只留头尾 → Q3 提示前缀不变（指令差异追加、最后一步保留工具定义）→ Q4 保温 → Q5 删减。
scene('budget', ({ root, s, c0 }) => {
  const { world, g, gt } = stage(root, 'oc');
  const cam = makeCamera(world);
  const T2 = (id, zh, en) => T(id, { zh, en });
  const L_ = (p, x, y, parts, o) => ocLine(p, x, y, parts, o);
  const QX = [0, 2000, 4000];

  // ── Q1：压缩（v2.0.24 compaction.mdx:10–17、:131、:142）──
  const q1 = ocPane(world, QX[0] + 100, 90, 1720, 820, 'compaction');
  wipeP(q1.p, c0 + 0.1, { dir: 't', d: 0.35, ease: 'steps(10)' }); sfx('blip', c0 + 0.1, { g: 0.4 });
  // 用图形把文档里那两行对照画出来：方块的宽度示意各段的多少
  const blk = (pane, x, y, w, label, c, outline) => { const e = tx(pane, 'ocb', x, y, esc(label), { fontSize: '26px', lineHeight: '70px', height: '70px', width: w + 'px', padding: '0 14px', background: outline ? 'transparent' : c, color: outline ? c : C.ocBg, border: outline ? `3px solid ${c}` : 'none' }); return e; };
  const segs = (y, items) => items.map(([w, label, c, b], i) => { const x = items.slice(0, i).reduce((a, it) => a + it[0] + 8, 0); return { bx: blk(q1.p, 60 + x, y, w, label, c, b) }; });
  const before = segs(120, [[300, 'system', C.ocMuted], [760, tr('较早的对话', 'older conversation'), C.oc300], [300, 'recent 15k', C.ocText], [200, 'pending', C.ocMuted, true]]);
  const after = segs(300, [[300, 'system', C.ocMuted], [240, 'summary', C.ocPeach], [300, 'recent 15k', C.ocText], [200, 'pending', C.ocMuted, true]]);
  const bL = L_(q1.p, 60, 70, [['before', C.ocMuted]], { size: 24 }), aL = L_(q1.p, 60, 250, [['after', C.ocMuted]], { size: 24 });
  appear(bL, T('f1') + 0.3); before.forEach((o, i) => { wipe(o.bx, T('f1') + 0.3 + i * 0.1, { dir: 'l', d: 0.3, ease: 'steps(8)' }); });
  appear(aL, T2('f2', '摘要', 'summary')); after.forEach((o, i) => { wipe(o.bx, T2('f2', '摘要', 'summary') + i * 0.1, { dir: 'l', d: 0.3, ease: 'steps(8)' }); });
  sfx('thud', T2('f2', '摘要', 'summary') + 0.1, { g: 0.55 });
  const keep = L_(q1.p, 1180, 400, [['keep.tokens = ', C.ocMuted], ['15000', C.ocPeach]], { size: 34, bold: true });
  appear(keep, T2('f3', '15,000', '15,000')); sfx('pop', T2('f3', '15,000', '15,000'), { g: 0.5 });
  has('oc2_compact', 'about 15,000 tokens by default'); has('oc2_compact_diag', 'before   [ system prompt ][ older conversation');
  // 摘要的几项（文档原句：objective and requirements, decisions, completed and active work, blockers and next moves, relevant files）
  const heads = ['## Objective', '## Decisions', '## Done / Active', '## Blockers / Next Move', '## Files'];
  const hEls = heads.map((h_, i) => L_(q1.p, 60 + (i % 3) * 540, 500 + Math.floor(i / 3) * 60, [[h_, C.ocText]], { size: 30, bold: true }));
  seq(hEls, T('f3b') + 0.1, 0.3, (e, t) => { appear(e, t); sfx('key', t, { g: 0.4 }); });
  const hsrc = L_(q1.p, 60, 650, [['compaction.mdx:' + ent('oc2_summary').line + '  ', C.ocMuted], [tr('标题为示意；所含各项取自文档原句', 'headings schematic; the items are from the docs'), C.ocMuted]], { size: 24 });
  has('oc2_summary', 'It covers the objective and requirements, decisions, completed and active work,');
  const pick = L_(q1.p, 60, 710, [[tr('另一个智能体能照着接手', 'another agent could pick the work up'), C.ocPeach]], { size: 32 });
  appear(hsrc, T('f3b') + 1.2); appear(pick, T2('f3c', '接手', 'take over')); sfx('chime', T2('f3c', '接手', 'take over'), { g: 0.4 });

  // ── Q2：工具输出只留头尾（specs/v2/tools.md:152）──
  const q2 = ocPane(world, QX[1] + 100, 90, 1720, 820, tr('工具输出', 'tool output'));
  wipeP(q2.p, T('f4') - 0.5, { dir: 't', d: 0.35, ease: 'steps(10)' });
  const rnd = seeded(7);
  const lineBars = Array.from({ length: 26 }, (_, i) => R(gt, QX[1] + 160, 90 + 70 + i * 26, 160 + Math.floor(rnd() * 360), 12, C.oc300));
  seq(lineBars, T('f4') - 0.3, 0.02, (e, t) => appear(e, t));
  const keepHead = R(gt, QX[1] + 150, 90 + 62, 560, 26 * 5 + 6, 'none', { stroke: C.ocPeach, 'stroke-width': 3 });
  const keepTail = R(gt, QX[1] + 150, 90 + 62 + 21 * 26, 560, 26 * 5 + 6, 'none', { stroke: C.ocPeach, 'stroke-width': 3 });
  const mid = L_(q2.p, 680, 330, [[tr('… 中间省略 …', '… omitted …'), C.ocMuted]], { size: 30 });
  const toM = L_(q2.p, 900, 130, [['→ model: ', C.ocMuted], [tr('开头 + 结尾', 'head + tail'), C.ocPeach]], { size: 34, bold: true });
  const toS = L_(q2.p, 900, 230, [['→ storage: ', C.ocMuted], [tr('全文', 'full text'), C.oc300]], { size: 34, bold: true });
  appear(keepHead, T2('f4', '开头', 'head')); appear(keepTail, T2('f4', '结尾', 'tail')); appear(mid, T2('f4', '结尾', 'tail') + 0.1); appear(toM, T2('f4', '开头', 'head')); appear(toS, T2('f4', '另存', 'stored'));
  sfx('tick', T2('f4', '开头', 'head'), { g: 0.4 }); sfx('tick', T2('f4', '结尾', 'tail'), { g: 0.4 });
  F((t) => { const k = t >= T2('f4', '结尾', 'tail') ? 1 : 0; lineBars.forEach((b, i) => b.setAttribute('opacity', k && i >= 5 && i < 21 ? 0.25 : 1)); });
  const q2src = L_(q2.p, 900, 330, [['specs/v2/tools.md:' + ent('oc2_bound').line, C.ocMuted]], { size: 24 });
  has('oc2_bound', 'head-plus-tail split'); appear(q2src, T2('f4', '另存', 'stored') + 0.2);

  // ── Q3：提示前缀不变（specs/v2/session.md:92；tools.md:144）——同一面板的下半部 ──
  const q3 = ocPane(world, QX[1] + 100, 980, 1720, 760, tr('一次请求的开头', 'the start of a request'));
  wipeP(q3.p, T('f5') - 0.5, { dir: 't', d: 0.35, ease: 'steps(10)' });
  const pre = [['system', 260, C.ocMuted], ['tools', 300, C.ocMuted], ['AGENTS.md', 300, C.oc300], [tr('历史', 'history'), 420, C.oc300]];
  let px0 = 0;
  const pEls = pre.map(([n, w, c]) => { const x = px0; px0 += w + 8; return blk(q3.p, 60 + x, 90, w, n, c); });
  pEls.forEach((e, i) => appear(e, T('f5') - 0.2 + i * 0.08));
  const hsh = L_(q3.p, 60, 210, [['AGENTS.md  ', C.ocMuted], ['sha256 ', C.ocMuted], ['3f9a…', C.oc300], tr(['  （示意）', C.ocMuted], ['  (schematic)', C.ocMuted])], { size: 28 });
  appear(hsh, T2('f5', '哈希', 'hash')); sfx('tick', T2('f5', '哈希', 'hash'), { g: 0.4 });
  const app = blk(q3.p, 60 + px0, 90, 300, tr('改动', 'change'), C.ocPeach);
  wipe(app, T2('f6', '追加', 'appended'), { dir: 'l', d: 0.3, ease: 'steps(8)' }); sfx('pop', T2('f6', '追加', 'appended'), { g: 0.55 });
  const brk = Pa(gt, `M${QX[1] + 160},${980 + 180} L${QX[1] + 160},${980 + 200} L${QX[1] + 160 + px0 - 8},${980 + 200} L${QX[1] + 160 + px0 - 8},${980 + 180}`, { stroke: C.ocPeach, 'stroke-width': 3 });
  const brkL = L_(q3.p, 60, 250, [[tr('前缀不变 → 缓存命中', 'prefix unchanged → cache hit'), C.ocPeach]], { size: 30, bold: true });
  drawH(brk, T2('f7', '前缀', 'prefix'), 0.4); appear(brkL, T2('f7', '缓存', 'cache')); sfx('chime', T2('f7', '缓存', 'cache'), { g: 0.45 });
  has('oc2_instr', 'SHA-256 content hash');
  const fin = L_(q3.p, 60, 360, [['final step  ', C.ocMuted], ['tools: [ … ]', C.ocText], ['   toolChoice: ', C.ocMuted], ['"none"', C.ocPeach]], { size: 32 });
  const finS = L_(q3.p, 60, 420, [['specs/v2/tools.md:' + ent('oc2_final_step').line + '  ', C.ocMuted], ['so the cached prompt prefix survives', C.oc300]], { size: 24 });
  has('oc2_final_step', 'so the cached prompt prefix survives'); has('oc2_final_step', 'toolChoice: "none"');
  appear(fin, T2('f7b', '最后一步', 'final step')); appear(finS, T2('f7c', '前缀', 'prefix')); sfx('blip', T2('f7b', '最后一步', 'final step'), { g: 0.4 });
  // 保温：空闲 4 分钟发一次，30 分钟后停（warming.mdx:18 起；缺省关闭）
  const wy = 520;
  const wax = Ln(gt, QX[1] + 160, 980 + wy + 60, QX[1] + 160 + 1500, 980 + wy + 60, C.ocBorder, 2);
  const wdots = [0, 4, 8, 12, 16, 20, 24, 28].map((m, i) => { const x = QX[1] + 160 + m / 30 * 1500; const d = R(gt, x - 9, 980 + wy + 51, 18, 18, i ? C.ocPeach : C.ocText); const l = L_(q3.p, 60 + m / 30 * 1500 - 26, wy + 76, [['00:' + String(m).padStart(2, '0'), C.ocMuted]], { size: 24 }); return { d, l }; });
  const wend = L_(q3.p, 60 + 1500 - 80, wy + 10, [['00:30 stop', C.ocMuted]], { size: 24 });
  const wlab = L_(q3.p, 60, wy - 20, [['"warming": true', C.ocPeach], [tr('   缺省关闭', '   off by default'), C.ocMuted]], { size: 28 });
  drawH(wax, T('f7d') - 0.3, 0.4); appear(wlab, T2('f7d', '保温', 'warming'));
  wdots.forEach((o, i) => { const t = T2('f7d', '4 分钟', '4 idle') - 0.2 + i * 0.12; appear(o.d, t); appear(o.l, t); if (i) sfx('tick', t, { g: 0.3 }); });
  appear(wend, Tend('f7d')); has('oc2_warming', 'after four');

  // ── Q5：删减（migrate-v1.mdx:38、:415）──
  const q5 = ocPane(world, QX[2] + 100, 90, 1720, 820, tr('删减', 'removed'));
  wipeP(q5.p, T('f8') - 0.5, { dir: 't', d: 0.35, ease: 'steps(10)' });
  const lsp = L_(q5.p, 60, 90, [['lsp', C.ocText], [tr('   配置保留，但不再运行语言服务器', '   config kept, language servers no longer run'), C.oc300]], { size: 40 });
  const lspX = R(gt, QX[2] + 160, 90 + 90 + 30, 90, 5, C.ocRed);
  const plg = L_(q5.p, 60, 210, [['plugins (v1)', C.ocText], [tr('   不能在 v2 运行，要按新接口重写', '   do not run in v2; rewrite for the new API'), C.oc300]], { size: 40 });
  const plgX = R(gt, QX[2] + 160, 90 + 210 + 30, 330, 5, C.ocRed);
  appear(lsp, T('f8') - 0.2); wipe(lspX, T2('f8', '语言服务器', 'language') + 0.2, { dir: 'l', d: 0.3, ease: 'steps(6)' }); sfx('error', T2('f8', '语言服务器', 'language') + 0.2, { g: 0.4 });
  appear(plg, T2('f9', '插件', 'plugins')); wipe(plgX, T2('f9', '重写', 'rewritten'), { dir: 'l', d: 0.3, ease: 'steps(6)' }); sfx('error', T2('f9', '重写', 'rewritten'), { g: 0.4 });
  const q5src = L_(q5.p, 60, 330, [['migrate-v1.mdx:' + ent('oc2_plugins').line + ', :' + ent('oc2_lsp').line, C.ocMuted]], { size: 24 });
  has('oc2_lsp', 'it does not run language servers'); has('oc2_plugins', 'V1 plugin implementations do not run in V2'); appear(q5src, T('f9') + 0.4);
  // 退场：方块字标志在面板下方一格格亮起，作为本章的落点
  const lg = ocLogo(gt, QX[2] + 160, 90 + 470, 22);
  colIn(lg.cells, T('f9') + 0.3, 0.012);

  camTrack(cam, s.start, { x: QX[0] + 960, y: 500, z: 1.0 }, [
    [c0 + 0.2, { x: QX[0] + 975, z: 1.03 }, Math.max(1.2, Tend('f3c') - c0 - 0.6), { sfx: false, room: 30 }],
    [Tend('f3c') + 0.1, { x: QX[1] + 960, y: 500, z: 1.0 }, 0.9],
    [null, { x: QX[1] + 975, z: 1.02 }, Math.max(1.2, Tend('f4') - Tend('f3c') - 1.0), { sfx: false, room: 30 }],
    [Tend('f4') + 0.05, { x: QX[1] + 960, y: 980 + 380, z: 1.0 }, 0.8],
    [null, { x: QX[1] + 975, z: 1.03 }, Math.max(1.2, Tend('f7e') - Tend('f4') - 0.9), { sfx: false, room: 30 }],
    [Tend('f7e') + 0.05, { x: QX[2] + 960, y: 500, z: 1.0 }, 0.9],
    [null, { x: QX[2] + 975, z: 1.03 }, Math.max(1.2, s.end - Tend('f7e') - 1.0), { sfx: false, room: 30 }],
  ], s.end + 0.45);
});
