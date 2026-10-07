// 片尾：两句归纳（各配一张缩略的结构图）→ 开源说明与仓库地址 → 无旁白的名单。
// 名单与 research/FACTS.md 的「制作署名」一致：策划 WaterRun；制作 Claude Sonnet 5.5 与 Claude Opus 5.5；配音为 edge-tts 的在线语音（模型未披露）；回听 faster-whisper；开源视频 github.com/Water-Run/ft。
scene('outro', ({ root, s, c0 }) => {
  const { world } = stageOf(root, 'ink');
  const cam = makeCamera(world);
  const g = gfx(world), D = window.DATA, RD = C.claw, GD = C.herm, PP = C.paper;
  const Lb = (x, y, t, o = {}) => lab(world, x, y, t, o);
  const t1 = T('s1'), t2 = T('s2'), tx1 = T('x1'), tC = T('xC');

  // ═══ 两句归纳 ═══
  // 左：网关在中心，四周是插口与可换的部件
  const HX = 480, HY = 360;
  const hub = frame(world, HX - 130, HY - 130, 260, 260, { c: RD, bw: 10 }), hubT = Lb(HX - 130, HY - 30, 'Gateway', { cls: 'in9', size: 50, c: RD, w: 260, align: 'center' });
  const plugs = [[-250, -70], [-250, 30], [190, -70], [190, 30], [-30, -250], [-30, 190]].map(([dx, dy], i) => { const sq = R(g, HX + dx, HY + dy, 60, 60, C.ink, { stroke: PP, 'stroke-width': 6 }); const w = dx < -200 ? Ln(g, HX + dx + 60, HY + dy + 30, HX - 130, HY + dy + 30, PP, 5) : dx > 100 ? Ln(g, HX + 130, HY + dy + 30, HX + dx, HY + dy + 30, PP, 5) : dy < 0 ? Ln(g, HX, HY + dy + 60, HX, HY - 130, PP, 5) : Ln(g, HX, HY + 130, HX, HY + dy, PP, 5); return [sq, w]; });
  const lob = lobster(g, HX + 150, HY - 250, 6);
  const o1 = Lb(HX - 380, HY + 290, tr('OpenClaw：状态集中在网关，其余都可以换', 'OpenClaw: state in the gateway; the rest can be swapped'), { cls: 'hd', size: tr(32, 30), w: 760, align: 'center', wrap: true });
  const tg = Tw('s1', '网关', 'gateway'), tsw = Tw('s1', '可以换', 'swapped');
  wipe(hub, s.start + 0.4, { dir: 'l', d: 0.4 }); slam(hubT, tg, { from: 1.2, d: 0.3 }); appear(lob.grp, t1 + 0.1); sfx('thud', tg); F((t) => lob.set(Math.abs(Math.sin(t * 3))));
  plugs.forEach(([sq, w], i) => { appear(w, t1 + 0.3 + i * 0.08); appear(sq, t1 + 0.3 + i * 0.08); });
  wipe(o1, t1 + 0.2, { dir: 'l', d: 0.5 });
  F((t) => plugs.forEach(([sq], i) => { const k = Math.floor((t - tsw) / 0.35); sq.setAttribute('fill', t >= tsw && (k % plugs.length) === i ? RD : C.ink); })); [0, 1, 2, 3, 4, 5].forEach((i) => sfx('tick', tsw + i * 0.35, { g: 0.4 }));
  // 右：沙漏的腰
  const WX = 1440, WY = 360;
  const top = Pa(g, `M${WX - 260},${WY - 250} L${WX + 260},${WY - 250} L${WX + 120},${WY - 60} L${WX - 120},${WY - 60} Z`, { stroke: PP, 'stroke-width': 6, 'stroke-linejoin': 'miter' }), bot = Pa(g, `M${WX - 120},${WY + 60} L${WX + 120},${WY + 60} L${WX + 260},${WY + 250} L${WX - 260},${WY + 250} Z`, { stroke: PP, 'stroke-width': 6, 'stroke-linejoin': 'miter' });
  const core = frame(world, WX - 120, WY - 60, 240, 120, { c: GD, bw: 10, fill: C.ink }), coreT = Lb(WX - 120, WY - 28, 'AIAgent', { cls: 'mono7', size: 40, c: GD, w: 240, align: 'center' });
  const pre = R(g, WX - 250, WY + 290, 0, 26, GD);
  const o2 = Lb(WX - 380, HY + 340, tr('Hermes：一切围着一个核心，和它的提示词缓存', 'Hermes: one core, and its prompt cache'), { cls: 'hd', size: tr(32, 30), w: 760, align: 'center', wrap: true });
  const tco = Tw('s2', '核心', 'core'), tca = Tw('s2', '缓存', 'cache');
  appear(top, t2 - 0.1); appear(bot, t2); wipe(core, tco - 0.2, { dir: 'l', d: 0.3 }); slam(coreT, tco, { from: 1.2, d: 0.3 }); sfx('thud', tco); wipe(o2, t2 + 0.2, { dir: 'l', d: 0.5 });
  F((t) => { const k = clamp((t - tca + 0.2) / 1.2); pre.setAttribute('width', (500 * ease.out3(k)).toFixed(1)); pre.setAttribute('opacity', k > 0 ? 1 : 0); }); sfx('blip', tca);

  // ═══ 开源说明与名单 ═══（下一屏）
  const OY = 1160, LX = 150, VX = 560;
  const title = Lb(LX, OY + 60, tr('OpenClaw, Hermes 和实现', 'OpenClaw, Hermes, and Their Implementation'), { cls: 'hd', size: tr(56, 46) });
  const url = Lb(VX, OY + 786, 'github.com/Water-Run/ft', { cls: 'in9', size: 84, c: PP });
  const urlL = Lb(LX, OY + 812, tr('开源视频', 'Open-source video'), { size: 30, c: C.dimi });
  const urlS = Lb(VX + 4, OY + 890, tr('取证记录、脚本与源码 · 数据截至 ', 'records, script and source · data as of ') + D.snap.retrieved + '<br>openclaw @ ' + D.snap.oc + ' · hermes-agent @ ' + D.snap.hm, { size: 24, c: C.dimi, lh: '1.4' });
  wipe(title, tx1 - 0.3, { dir: 'l', d: 0.5 });
  const tu = Tw('x1', '开源仓库', 'open repository');
  appear(urlL, tu - 0.2); slam(url, tu, { from: 1.1, d: 0.45 }); wipe(urlS, tu + 0.4, { dir: 'l', d: 0.5 }); sfx('thud', tu, { g: 0.8 }); sfx('chime', tu + 0.3, { g: 0.5 });
  const Y = [OY + 200, OY + 310, OY + 505, OY + 645];
  const rows = [
    [tr('策划', 'Planning'), 'WaterRun', null],
    [tr('制作', 'Production'), 'Claude Sonnet 5.5 · Claude Opus 5.5', tr('Anthropic · Sonnet 5.5：取证与初版；Opus 5.5：重定结构，脚本、视觉、场景、配乐与审查的重制', 'Anthropic · Sonnet 5.5: research and the first cut; Opus 5.5: restructuring, and the rebuilt script, visuals, scenes, score and review')],
    [tr('配音', 'Narration'), 'edge-tts', tr('在线语音 zh-CN-YunyangNeural（中文）、en-US-AndrewNeural（英文）；模型未披露', 'zh-CN-YunyangNeural (Chinese), en-US-AndrewNeural (English); model not disclosed')],
    [tr('回听', 'Listening check'), 'faster-whisper', tr('small 模型，回听旁白、核对读法；不参与成片内容', 'small model; checks the narration, not part of the film’s content')],
  ];
  rows.forEach(([k, v, sub], i) => {
    const a = Lb(LX, Y[i] + 16, k, { size: 30, c: C.dimi }), b = Lb(VX, Y[i], v, { cls: 'in9', size: i === 1 ? 56 : 60 }), els = [a, b];
    if (sub) els.push(Lb(VX + 4, Y[i] + 76, sub, { size: 24, c: C.dimi, w: 1240, wrap: true, lh: '1.4' }));
    els.forEach((e, j) => wipe(e, tC + 0.3 + i * 0.6 + j * 0.15, { dir: 'l', d: 0.5 })); sfx('pop', tC + 0.3 + i * 0.6, { g: 0.4, p: -0.2 + i * 0.15 });
  });
  // 标题下面一排行进的消息方块（与章节卡、封面同一母题）：名单停留时画面仍有动作
  const NSQ = 28, sq = []; for (let i = 0; i < NSQ; i++) sq.push(R(g, 0, OY + 142, 22, 22, i === 6 ? RD : i === 17 ? GD : PP));
  F((t) => { const on = t >= tx1 - 0.2 ? 1 : 0; sq.forEach((r, i) => { const x = 150 + ((i * 58 + (t - tx1) * 36) % (NSQ * 58) + NSQ * 58) % (NSQ * 58); r.setAttribute('x', x.toFixed(1)); r.setAttribute('opacity', on && x < 1250 ? 1 : 0); }); });
  // 右上角：两个标志收尾
  const lob2 = lobster(g, 1560, OY + 40, 9), ban = pixelBanner(g, 'HERMES', 1420, OY + 220, 7);
  appear(lob2.grp, tx1 - 0.2); colReveal(ban.els, tx1, 0.02); F((t) => lob2.set(Math.abs(Math.sin(t * 2.2))));

  camTrack(cam, s.start, { x: 960, y: 500, z: 1.06 }, [
    [t1 - 0.3, { x: 940, y: 520, z: 1.02 }, 3.6, { ease: 'sine.inOut', sfx: false }],
    [t2 - 0.2, { x: 980, y: 540, z: 1 }, 3.6, { ease: 'sine.inOut', sfx: false }],
    [tx1 - 0.6, { x: 960, y: OY + 540, z: 1 }, 1.1],
    [tx1 + 0.8, { z: 1.03 }, s.end - tx1 - 1.0, { ease: 'none', sfx: false }],
  ], s.end + 0.4, world);
});
