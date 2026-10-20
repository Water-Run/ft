// 两种架构（25–43 秒）：稠密 → 每层最大的一块是前馈网络 → MoE 把它换成许多专家 → 路由器为每个 token 挑几个。
// 站 T：一个 270 亿参数稠密模型（Qwen3.8-27B，画面不点名）的 64 层，每层按实测参数比例分成注意力与前馈两块（每 4 层有一层是全注意力，块略窄），token 由下往上，层层涂红。
// 站 L：其中一层放大。先按 27B 的实测数字标出两块；再按 OLMoE-1B-7B 一层的实际比例换成 64 个专家，用实测路由逐拍点亮。
scene('two', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const zh = LANG === 'zh', Q27 = DATA.q27, OL = DATA.olmoe;

  // ── 站 T：64 层的塔 ──
  const TX = 880, TY = 150, TW = 840, TH = 790, FR = 6, DIV = 8;
  const pitch = (TH - FR) / 64, bh = pitch - 3, inner = TW - 2 * FR - DIV;
  const tower = blk(world, 'bg-ink', TX, TY, TW, TH); tower.dataset.name = 'tower';
  wipe(tower, s.start + 0.05, { dir: 'b', d: 0.5 });
  const bars = [];
  for (let i = 0; i < 64; i++) {                       // i = 0 是最底下的第 0 层
    const a = Q27.types[i] === 'F' ? Q27.attnFull : Q27.attnLinear, aw = Math.round(inner * a / (a + Q27.ffn));
    const y = TY + TH - FR - (i + 1) * pitch + 3;
    const at = blk(world, 'bg-paper', TX + FR, y, aw, bh), ff = blk(world, 'bg-paper', TX + FR + aw + DIV, y, inner - aw, bh);
    at.dataset.name = 'attn'; ff.dataset.name = 'ffn';
    bars.push([at, ff, y]);
  }
  const hA = txt(world, 't-n dimp', tr('注意力', 'Attention'), TX + FR, TY - 46), hF = txt(world, 't-n dimp', tr('前馈网络', 'Feed-forward'), TX + 300, TY - 46);
  wipe(hA, s.start + 0.4, { dir: 'l', d: 0.3 }); wipe(hF, s.start + 0.5, { dir: 'l', d: 0.3 });
  const tD = Q(T('d1')) ;
  const head1 = txt(world, zh ? '' : '', zh ? '稠密模型' : 'Dense', 112, 150); css(head1, { font: zh ? '900 132px "Sans SC"' : '900 168px "Inter"', letterSpacing: '-.03em', lineHeight: '1' });
  const head2 = txt(world, '', zh ? 'Dense' : 'model', 116, zh ? 300 : 330); css(head2, { font: zh ? '900 120px "Inter"' : '900 96px "Inter"', letterSpacing: '-.03em', lineHeight: '1' });
  const info = txt(world, 't-4 dimp', tr('270 亿参数 · 64 层', '27 billion parameters · 64 layers'), 120, 452);
  slam(head1, s.start + 0.12, { from: 1.3, d: 0.4 }); sfx('thud', s.start + 0.2, { g: 0.8, p: -0.5 });   // 标题随换场的黑线一起刷出
  wipe(head2, Q(T('d1', { zh: 'Dense', en: 'model' })), { dir: 'l', d: 0.35 }); sfx('pop', Q(T('d1', { zh: 'Dense', en: 'model' })), { g: 0.6, p: -0.5 });
  wipe(info, tD + 0.6, { dir: 'l', d: 0.35 });
  // token 由下往上穿过 64 层，走过的层整层涂红
  const tok = tokenBlock(world, '', TX - 96, TY + TH - 72, 72); tok.dataset.name = 'token';
  const tRise = Q(T('d1', 'token')) - 0.1, DR = Math.max(1.4, Tend('d1') - 0.2 - tRise);
  slide(tok, tRise - 0.45, { x: -200, d: 0.4 }); sfx('pop', tRise - 0.45, { g: 0.6 });
  fromTo(tok, tRise, { y: 0 }, { y: -(TH - 72), duration: DR, ease: 'power1.inOut', immediateRender: false });
  for (let k = 0; k < 8; k++) sfx('tick', tRise + k * DR / 8, { g: 0.45, p: 0.1 });
  const pct = txt(world, 'num red', '100%', 108, 560); pct.style.fontSize = '200px';
  const pctL = txt(world, 't-n dimp', tr('每个 token 用到的参数', 'of the parameters, for every token'), 120, 780);
  const tPct = Q(T('d1', { zh: '全部', en: 'parameter' }));
  slam(pct, tPct, { from: 1.35, d: 0.4 }); sfx('thud', tPct, { g: 0.9, p: -0.5 }); wipe(pctL, tPct + 0.2, { dir: 'l', d: 0.35 });
  const riseK = (t) => (t - tRise) / DR;                                    // 0 → 1：token 走过的比例
  let lastLit = null;
  F((t) => {
    const n = clamp(Math.floor(riseK(t) * 64 + 1e-6) + (t >= tRise ? 1 : 0), 0, 64);
    if (n === lastLit) return; lastLit = n;
    bars.forEach(([a, f], i) => { const c = i < n ? C.red : C.paper; a.style.background = c; f.style.background = c; });
  });

  // ── 站 L：一层放大 ──
  const LX = 2300, LY = 262, LW = 1480, LH = 520, LF = 12;
  const ia = Math.round((LW - 3 * LF) * Q27.attnLinear / (Q27.attnLinear + Q27.ffn));      // 27B 一层（Gated DeltaNet 层）的两块
  const RW = 40, iw = LW - 3 * LF - RW;                                                  // MoE：注意力 | 路由器（黑色竖条）| 64 个专家
  const ma = Math.round(iw * OL.attnLayer / (OL.attnLayer + OL.expertsLayer)), me = iw - ma;
  const frame = blk(world, 'bg-ink', LX, LY, LW, LH); frame.dataset.name = 'layer';
  const attB = blk(world, 'bg-paper', LX + LF, LY + LF, ia, LH - 2 * LF); attB.dataset.name = 'attn';
  const ffB = blk(world, 'bg-paper', LX + 2 * LF + ia, LY + LF, LW - 3 * LF - ia, LH - 2 * LF); ffB.dataset.name = 'ffn';
  const tL = Tend('d1') + 0.1;
  wipe(frame, tL + 0.35, { dir: 'l', d: 0.5 }); wipe(attB, tL + 0.45, { dir: 'l', d: 0.4 }); wipe(ffB, tL + 0.5, { dir: 'l', d: 0.45 });
  // 塔里的一层飞过来、放大成这张图
  const pick = 40, fly = blk(world, 'bg-red', TX + FR, bars[pick][2], TW - 2 * FR, bh); fly.dataset.name = 'flying-layer';
  appear(fly, tL);
  fromTo(fly, tL, { left: TX + FR, top: bars[pick][2], width: TW - 2 * FR, height: bh }, { left: LX, top: LY, width: LW, height: LH, duration: 0.95, ease: 'power3.inOut', immediateRender: false });
  wipeOut(fly, tL + 0.95, { dir: 'r', d: 0.3 }); sfx('thud', tL + 0.95, { g: 0.6, p: 0.2 });
  const hdr = txt(world, 't-4', tr('其中一层', 'One of its layers'), LX, LY - 76);
  wipe(hdr, tL + 0.6, { dir: 'l', d: 0.35 });
  const aT = txt(world, 't-3', tr('注意力', 'Attention'), LX + LF + 28, LY + 44);
  const aN = txt(world, 'num', group(Q27.attnLinear), LX + LF + 28, LY + 132); aN.style.fontSize = '40px';
  const fT = txt(world, zh ? 't-2' : 't-3', tr('前馈网络', 'Feed-forward network'), LX + 2 * LF + ia + 40, LY + 40); if (!zh) fT.style.fontSize = '80px';
  const fN = txt(world, 'num', '0', LX + 2 * LF + ia + 40, LY + 176); fN.style.fontSize = '72px';
  const most = h('div', 'abs bg-ink paper t-4', world, tr('参数最多', 'The largest block')); px(most, LX + 2 * LF + ia + 40, LY + LH - 130); css(most, { padding: '6px 20px' });
  const foot = txt(world, 't-n dimp', tr('64 层无一例外：前馈块都比注意力块大（全注意力层的注意力块为 ' + group(Q27.attnFull) + '）', 'All 64 layers: feed-forward is larger (full-attention layers: ' + group(Q27.attnFull) + ' in attention)'), LX, LY + LH + 28);
  const tP2 = Math.max(Q(T('d2', { zh: '参数', en: 'largest' })), tL + 1.0), tFF = Q(T('d2', { zh: '前馈', en: 'feed-forward' }));
  wipe(aT, tL + 1.05, { dir: 'l', d: 0.3 }); wipe(aN, tL + 1.2, { dir: 'l', d: 0.3 }); sfx('tick', tL + 1.2, { g: 0.6, p: -0.3 });
  appear(fN, tP2); countTo(fN, 0, Q27.ffn, tP2, 0.9, (v) => group(Math.round(v))); sfx('riser', tP2 - 0.3, { g: 0.3 });
  wipe(fT, tFF, { dir: 'l', d: 0.35 }); sfx('pop', tFF, { g: 0.7, p: 0.3 });
  slam(most, Q(Math.min(tFF + 0.5, Tend('d2') - 0.2)), { from: 1.3, d: 0.3 }); sfx('thud', Q(Math.min(tFF + 0.5, Tend('d2') - 0.2)), { g: 0.7, p: 0.3 });
  wipe(foot, tFF + 0.3, { dir: 'l', d: 0.4 });

  // ── MoE：前馈这一块换成 64 个专家（按 OLMoE-1B-7B 一层的实际参数比例重排）──
  const tM = Q(T('d3')), tSwap = Q(T('d3', { zh: '换', en: 'replaces' })) - 0.1, tGrid = Q(T('d3', { zh: '许多', en: 'many' })) - 0.1;
  [aT, aN, fN, most, foot].forEach((e, i) => wipeOut(e, tM - 0.05 + i * 0.04, { dir: 'l', d: 0.25 }));
  wipeOut(hdr, tM - 0.05, { dir: 'l', d: 0.25 });
  const mh1 = txt(world, '', zh ? '混合专家模型' : 'Mixture of experts', LX, LY - 160); css(mh1, { font: zh ? '900 100px "Sans SC"' : '900 84px "Inter"', letterSpacing: '-.02em', lineHeight: '1' });
  const mh2 = txt(world, '', 'MoE', LX + mh1.offsetWidth + 40, LY - 160 + (zh ? 0 : 8)); css(mh2, { font: zh ? '900 100px "Inter"' : '900 84px "Inter"', letterSpacing: '-.03em', lineHeight: '1' });
  slam(mh1, tM + 0.1, { from: 1.25, d: 0.4 }); sfx('thud', tM + 0.1, { g: 0.9 });
  const tMoE = Q(T('d3', { zh: 'M O E', en: 'M O E' }));
  slam(mh2, tMoE, { from: 1.4, d: 0.35 }); sfx('pop', tMoE, { g: 0.7, p: 0.3 });
  wipeOut(fT, tSwap - 0.25, { dir: 'r', d: 0.25 });
  fromTo(attB, tSwap, { width: ia }, { width: ma, duration: 0.6, ease: 'power3.inOut', immediateRender: false });
  const EX = LX + 2 * LF + ma + RW, EW = LX + LW - LF - EX;
  fromTo(ffB, tSwap, { left: LX + 2 * LF + ia, width: LW - 3 * LF - ia }, { left: EX, width: EW, duration: 0.6, ease: 'power3.inOut', immediateRender: false });
  sfx('whoosh', tSwap, { g: 0.6 });
  const G = 12, ecw = (EW - 7 * G) / 8, ech = (LH - 2 * LF - 7 * G) / 8, ecells = [];
  for (let k = 0; k < 64; k++) {
    const c = k % 8, r = Math.floor(k / 8);
    const e = blk(world, 'bg-paper', EX + c * (ecw + G), LY + LF + r * (ech + G), ecw, ech); e.dataset.name = 'expert'; ecells.push(e);
    appear(e, tGrid + 0.5);
  }
  for (let k = 1; k < 8; k++) {
    const v = blk(world, 'bg-ink', EX + k * (ecw + G) - G, LY + LF, G, LH - 2 * LF);
    fromTo(v, tGrid + k * 0.035, { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, transformOrigin: '50% 0%', duration: 0.2, ease: 'power3.out' });
    const hz = blk(world, 'bg-ink', EX, LY + LF + k * (ech + G) - G, EW, G);
    fromTo(hz, tGrid + 0.25 + k * 0.035, { autoAlpha: 0, scaleX: 0 }, { autoAlpha: 1, scaleX: 1, transformOrigin: '0% 50%', duration: 0.2, ease: 'power3.out' });
    if (k % 2) { sfx('tick', tGrid + k * 0.035, { g: 0.5, p: 0.3 }); }
  }
  sfx('thud', tGrid + 0.5, { g: 0.6, p: 0.3 });
  // 层下的三个标注与出处
  const lbY = LY + LH + 22;
  const lA = txt(world, 't-n ink', tr('注意力', 'Attention'), LX + LF + Math.round(ma / 2) - 20, LY + LF + 24), lR = txt(world, 't-n', tr('路由器', 'Router'), LX + 2 * LF + ma - 6, lbY + 46);
  const lE = txt(world, 't-4', tr('64 个专家', '64 experts'), EX, lbY - 6);
  const src = txt(world, 't-n dimp', tr('按 OLMoE-1B-7B 一层的实际参数比例：注意力 ' + group(OL.attnLayer) + '，专家共 ' + group(OL.expertsLayer), 'Drawn to scale from one OLMoE-1B-7B layer: attention ' + group(OL.attnLayer) + ', experts ' + group(OL.expertsLayer)), LX, lbY + 92);
  css(lA, { writingMode: 'vertical-rl', fontWeight: 800 }); lA.dataset.overlapOk = '1';    // 注意力块只剩一条窄条：标注竖排写在块里
  wipe(lA, tSwap + 0.55, { dir: 't', d: 0.3 }); wipe(lE, Q(Tend('d3') - 0.4), { dir: 'l', d: 0.35 }); sfx('pop', Q(Tend('d3') - 0.4), { g: 0.6, p: 0.4 });
  wipe(src, tGrid + 0.7, { dir: 'l', d: 0.4 });

  // ── 路由器怎样挑专家（OLMoE 第 8 层的实测数据）──
  // d4 一个 token 进来，路由器给 64 个专家打分（灰柱，高度按概率）；d5 前 8 名涂红并标出得分；
  // d6 这 8 个专家的输出各乘以得分再相加，得到这一层的输出（黄块）；d7 逐拍换 token，选中的专家跟着变（与右上角的仪表同步）；
  // d8 路由器与专家一起训练，训练时另加一项损失，防止总挑同几个（示意图）
  const KT = 15;                                                            // 演示用的 token：「parameters」
  const P = OL.probs[KT], top = ROUTE[KT], W8 = OL.weights[KT], pmax = Math.max(...P);
  const tScore = Q(T('d4', { zh: '打分', en: 'scores' })) - 0.25, tTop = Q(T('d5', { zh: '得分最高', en: 'top' })) - 0.1;
  const tMul = Q(T('d6', { zh: '乘以', en: 'scaled' })) - 0.1, tSum = Q(T('d6', { zh: '相加', en: 'summed' })) - 0.15;
  const tRest = Q(T('d6', { zh: '其余', en: 'rest' })), tRt = Q(T('d7')), tTrain = Q(T('d8')) - 0.1;
  classAt(lA, 'paper', T('d4') + 0.3);                                     // token 先经过注意力：注意力块转红，竖排的标注改用纸色
  const rbar = blk(world, 'bg-ink', LX + 2 * LF + ma - LF, LY - 36, RW + 2 * LF, 36); rbar.dataset.name = 'router';
  const tRb = Q(T('d4', { zh: '路由', en: 'router' }));
  fromTo(rbar, tRb, { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, transformOrigin: '50% 100%', duration: 0.25, ease: 'power3.out' });
  wipe(lR, tRb + 0.1, { dir: 't', d: 0.3 }); sfx('thud', tRb, { g: 0.7 });
  const tk = tokenBlock(world, '', LX - 278, LY + LH / 2 - 75, 150, 32); tk.dataset.name = 'token'; css(tk, { width: '250px', fontFamily: '"Inter"' });   // 最长的 token 是 information
  const tkWord = OL.pieces.map((p) => esc(p.trim()));
  const tTok = Q(T('d4')) - 0.1;
  slide(tk, tTok, { x: -240, d: 0.35 }); sfx('pop', tTok, { g: 0.6, p: -0.5 });
  // 得分柱：每格一根，从格底长起；灰色 = 路由器给的分
  const sbars = ecells.map((e, j) => {
    const bx = blk(world, '', +e.style.left.replace('px', ''), +e.style.top.replace('px', ''), ecw, ech); css(bx, { background: C.dimp });
    bx.dataset.name = 'score';
    const hgt = Math.max(0.04, P[j] / pmax);
    fromTo(bx, tScore + (j % 8) * 0.03 + Math.floor(j / 8) * 0.02, { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: hgt, transformOrigin: '50% 100%', duration: 0.35, ease: 'power3.out' });
    if (!top.includes(j)) to(bx, tTop + 0.2, { scaleY: 0, duration: 0.3, ease: 'power2.in' });
    else vanish(bx, tTop + 0.15);
    return bx;
  });
  for (let k = 0; k < 6; k++) sfx('tick', tScore + k * 0.07, { g: 0.4, p: 0.2 + k * 0.05 });
  const sLab = txt(world, 't-n', tr('灰柱：路由器给每个专家的得分（概率），64 个合计为 1', 'Grey bars: the router\'s score (probability) for each expert; all 64 sum to 1'), LX + 240, lbY + 46);   // 英文用直撇号：弯撇号在中文字体里是全角
  wipe(sLab, tScore + 0.3, { dir: 'l', d: 0.35 }); wipeOut(sLab, tTop + 0.55, { dir: 'l', d: 0.25 });   // 灰柱收走后说明也收走
  // 前 8 名：涂红，格里写出得分
  const wtxt = top.map((j, i) => {
    const e = ecells[j]; const w = txt(world, 'mono paper', W8[i].toFixed(3), 0, 0); css(w, { fontSize: '30px', fontWeight: 800 });
    px(w, +e.style.left.replace('px', '') + 14, +e.style.top.replace('px', '') + 10); appear(w, tTop + 0.1 + i * 0.06);
    return w;
  });
  sfx('pop', tTop + 0.1, { g: 0.7, p: 0.3 }); sfx('pop', tTop + 0.4, { g: 0.5, p: 0.3 });
  // 加权相加：8 个红块带着得分飞到下方排成一行，加起来汇成黄色的输出
  const RY = LY + LH + 190, RX0 = LX + 120, SQ = 46, PITCH = 132, pluses = [];
  const flyers = top.map((j, i) => {
    const e = ecells[j], x0 = +e.style.left.replace('px', ''), y0 = +e.style.top.replace('px', '');
    const f = blk(world, 'bg-red', x0, y0, ecw, ech); f.dataset.name = 'weighted-expert';
    appear(f, tMul);
    const fx = RX0 + i * PITCH, ts = tMul + i * 0.06;                     // 位移由帧函数按 t 直接算：补间库倒着跳时有亚像素的舍入差
    let lastK = null;
    F((t) => {
      const k = ease.io3(clamp((t - ts) / 0.55)), key = k.toFixed(4);
      if (key === lastK) return; lastK = key;
      px(f, +lerp(x0, fx, k).toFixed(1), +lerp(y0, RY, k).toFixed(1), +lerp(ecw, SQ, k).toFixed(1), +lerp(ech, SQ, k).toFixed(1));
    });
    const w = txt(world, 'mono red', W8[i].toFixed(3), RX0 + i * PITCH - 10, RY - 40); css(w, { fontSize: '30px', fontWeight: 800 });
    appear(w, tMul + i * 0.06 + 0.5);
    if (i < 7) { const pl = txt(world, 't-4', '+', RX0 + i * PITCH + SQ + 26, RY - 2); appear(pl, tSum + i * 0.04); pluses.push(pl); }
    return [f, w];
  });
  for (let k = 0; k < 4; k++) sfx('whoosh', tMul + k * 0.15, { g: 0.3, p: -0.2 + k * 0.15 });
  const eq = txt(world, 't-3', '=', RX0 + 8 * PITCH - 10, RY - 14);
  const out = tokenBlock(world, '', RX0 + 8 * PITCH + 60, RY - 22, 90); out.dataset.name = 'layer-output';
  const outL = txt(world, 't-n', tr('这一层的输出', 'output of this layer'), RX0 + 8 * PITCH + 170, RY + 4);
  appear(eq, tSum + 0.35); slam(out, tSum + 0.45, { from: 1.6, d: 0.35 }); wipe(outL, tSum + 0.6, { dir: 'l', d: 0.3 }); sfx('chime', tSum + 0.45, { g: 0.6, p: 0.3 });
  const leg1 = txt(world, 't-4', tr('8 个在算', '8 at work'), LX + 860, lbY - 6), leg1b = blk(world, 'bg-red', LX + 810, lbY + 6, 36, 36);
  const leg2 = txt(world, 't-4', tr('56 个不动', '56 idle'), LX + 1150, lbY - 6), leg2b = blk(world, 'bg-paper', LX + 1100, lbY + 6, 36, 36);
  css(leg2b, { border: `6px solid ${C.ink}` });
  wipe(leg1b, tTop + 0.2, { dir: 'l', d: 0.2 }); wipe(leg1, tTop + 0.26, { dir: 'l', d: 0.3 });
  wipe(leg2b, tRest, { dir: 'l', d: 0.2 }); wipe(leg2, tRest + 0.06, { dir: 'l', d: 0.3 }); sfx('pop', tRest, { g: 0.5, p: 0.6 });
  // 换一个 token：逐拍换，选中的专家跟着变（实测数据；与右上角的仪表同一个函数）
  const tClear = tRt - 0.25;
  wtxt.forEach((e, i) => vanish(e, tMul + i * 0.06));                     // 格里的得分随红块一起移到下方那一行
  [...flyers.flat(), ...pluses, eq, out, outL].forEach((e) => vanish(e, tClear));
  const cLab = txt(world, 't-4', tr('这一层：17 个 token，选了 17 种不同的组合（实测）', 'This layer: 17 tokens, 17 different sets (measured)'), RX0, RY - 6);
  wipe(cLab, tRt + 0.4, { dir: 'l', d: 0.4 }); sfx('pop', tRt + 0.4, { g: 0.5 });
  let lastR = null;
  F((t) => {
    const k = t < T('d4') + 0.3 ? -2 : t < tRt ? -1 : routeTok(t);          // -2：还没有 token；-1：演示用的「parameters」
    const key = k === -1 && t >= tTop ? 'top' : k;
    if (key === lastR) return; lastR = key;
    const on = new Set(key === 'top' ? top : k >= 0 ? ROUTE[k] : []);
    ecells.forEach((e, j) => { e.style.background = on.has(j) ? C.red : C.paper; });
    attB.style.background = k === -2 ? C.paper : C.red;
    tk.innerHTML = k === -2 ? tkWord[KT] : k === -1 ? tkWord[KT] : tkWord[k];
  });
  for (let b = 0; tRt + b * BEAT < s.end + WIPE; b++) sfx(b % 2 ? 'tick' : 'blip', Math.ceil((tRt + b * BEAT) / BEAT - 1e-6) * BEAT, { g: 0.35, p: 0.3 });
  // 训练与均衡：示意图（左：只靠路由器自己，越来越偏向同几个；右：加一项罚分配不均的损失）
  const tB = tTrain + 0.2, HX = RX0, HY = lbY + 215, HW = 600, HH = 96;
  wipeOut(cLab, tTrain - 0.1, { dir: 'l', d: 0.2 });
  const hist = (x0, vals, label) => {
    const fr = blk(world, 'bg-ink', x0, HY - HH - 8, HW, HH + 16); wipe(fr, tB, { dir: 'l', d: 0.3 });
    const bg = blk(world, 'bg-paper', x0 + 8, HY - HH, HW - 16, HH); appear(bg, tB);
    const bw = (HW - 16) / vals.length;
    vals.forEach((v, i) => { const b = blk(world, 'bg-red', x0 + 8 + i * bw + 1, HY - v * HH, bw - 2, v * HH); fromTo(b, tB + 0.25 + i * 0.015, { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, transformOrigin: '50% 100%', duration: 0.25, ease: 'power3.out' }); });
    const l = txt(world, 't-n', label, x0, HY + 16); wipe(l, tB + 0.3, { dir: 'l', d: 0.3 });
  };
  const N16 = 16, skew = Array.from({ length: N16 }, (_, i) => (i === 3 ? 1 : i === 11 ? 0.82 : 0.08)), even = Array.from({ length: N16 }, (_, i) => 0.42 + 0.12 * ((i * 7) % 5) / 4);
  hist(HX, skew, tr('不加约束：总挑同几个', 'Unchecked: the same few'));
  hist(HX + HW + 60, even, tr('加一项罚分配不均的损失', 'With a balancing loss'));
  sfx('tick', tB + 0.25, { g: 0.5 }); sfx('tick', tB + 0.45, { g: 0.5 });
  const hIll = txt(world, 't-n dimp', tr('示意 · Shazeer 等 2017 §4；OLMoE 负载均衡损失权重 0.01', 'Illustration · Shazeer et al. 2017 §4; OLMoE load-balancing loss weight 0.01'), HX, HY + 60);
  wipe(hIll, tB + 0.5, { dir: 'l', d: 0.35 });
  const rSize = txt(world, 't-n dimp', tr('路由器：' + group(OL.routerLayer) + ' 个参数，约占这一层的万分之三', 'Router: ' + group(OL.routerLayer) + ' parameters, about 0.03% of the layer'), LX, lbY + 92);
  wipeOut(src, tRb - 0.1, { dir: 'l', d: 0.25 }); wipe(rSize, tRb + 0.3, { dir: 'l', d: 0.4 });
  const src2 = txt(world, 't-n dimp', tr('实测路由：OLMoE-1B-7B 第 8 层，演示句取自 Shazeer 等 2017 年论文摘要', 'Measured routing: OLMoE-1B-7B, layer 8; sentence from Shazeer et al. 2017'), LX, lbY + 92);
  wipeOut(rSize, tTop - 0.15, { dir: 'l', d: 0.2 }); wipe(src2, tTop, { dir: 'l', d: 0.4 }); wipeOut(src2, tTrain - 0.1, { dir: 'l', d: 0.2 });   // 示意图要用这一行的位置

  // ── 镜头 ──
  const CX = LX + 600, CY = 470, tOut = tMul - 0.3;
  cam.track(s.start, { x: 960, y: 500, z: 1.04 }, [
    [s.start + 0.02, { z: 1 }, 0.8, { ease: 'power3.out', sfx: false }],
    [s.start + 0.85, { x: 980, z: 1.03 }, tL - s.start - 0.9, { ease: 'none', sfx: false }],
    [tL, { x: CX, y: CY, z: 1 }, 1.0, { g: 0.7 }],
    [tL + 1.05, { x: CX + 20, z: 1.02 }, tSwap - tL - 1.1, { ease: 'none', sfx: false }],
    [tSwap, { x: CX + 20, y: CY + 10, z: 1.0 }, 0.6, { ease: 'power2.inOut', sfx: false }],
    [tSwap + 0.65, { x: CX }, tOut - tSwap - 0.7, { ease: 'none', sfx: false }],   // 不推近：左边的 token 块与右边的专家格都要留出 60px 以上的边
    [tOut, { x: CX + 10, y: 590, z: 0.86 }, 0.8, { ease: 'power2.inOut', g: 0.4 }],   // 拉远：露出下方的加权相加
    [tOut + 0.85, { x: CX }, s.end + WIPE - tOut - 0.9, { ease: 'none', sfx: false }],
  ]);
});
