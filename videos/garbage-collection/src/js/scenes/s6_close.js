// 收束。回到开场那张格子纸：它不知道，只知道还找不找得到。麦卡锡 1960 年论文的一页，后来重排时补的脚注 7 用打字机打出来；
// 六十多年的时间线；最后一根横梁在「不可预知的未来」与「严苛的硬件」之间摆动、停平。片尾 14 秒名单，不配旁白。
scene('close', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ui = h('div', 'layer', root);
  const plate = { bg: C.field, pad: '0 18px 8px' };
  const P = 60, COLS = 40, ROWS = 20;
  const gsv = board(world, 0, 0, COLS * P, ROWS * P);
  gridLines(gsv, 0, 0, COLS, ROWS, P);
  const tsv = board(world, 0, 0, COLS * P, ROWS * P);
  const FL = field(tsv, 0, 0, COLS, ROWS, P, 50);
  const hash = (a, b) => { let x = Math.imul(a ^ 0x9E3779B9, 0x85EBCA6B) ^ Math.imul(b + 0x632BE5AB, 0xC2B2AE35); x ^= x >>> 15; x = Math.imul(x, 0x27D4EB2F); x ^= x >>> 13; return (x >>> 0) / 4294967296; };

  // ── 时刻 ──
  const tQ = qb(T('h1', { zh: '回到', en: 'Back' }) - 0.1), tNo = qb(Math.min(T('h1b', { zh: '它不知道', en: "It doesn't" }), Tend('h1') - 0.9)), tFind = qb(Math.min(T('h1b', { zh: '找不找得到', en: 'find' }), Tend('h1') - 0.5));
  const tWave = qb(T('h1b', { zh: '只知道', en: 'All it knows' }) - 0.1), tPap = qb(T('h4', { zh: '麦卡锡', en: 'McCarthy' }) - 0.4), tRec = qb(T('h4', { zh: '回收', en: 'reclamation' }) - 0.2), tRe = qb(T('h4b', { zh: '重新排版', en: 're-typesetting' }) - 0.2), tFn = qb(T('h4b', { zh: '脚注', en: 'footnote' }) - 0.2);
  const tT1 = qb(T('h5', { zh: '其实', en: 'already' }) - 0.1), tT2 = qb(T('h6', { zh: '又或者', en: 'or else' }) - 0.1);
  const tH7 = qb(T('h7', { zh: '六十', en: 'sixty' }) - 0.35), tLast = qb(T('h7b', { zh: '一秒', en: 'a second' }) - 0.1), tBal = qb(T('h7c', { zh: '在', en: 'between' }) - 0.2), tEven = qb(T('h7c', { zh: '平衡', en: 'balance' }) - 0.3);
  const tCr = L.cues.gCredit.start, tBalCam = Tend('h7b') - 0.05;

  // ── 回到格子纸：活的（芯片黑）与死的（丝印白），从根出发的一道波把活的找出来 ──
  const live = (i, j) => hash(i * 31 + j, 3) < 0.55;
  const depth = (i, j) => Math.abs(i - 2) + Math.abs(j - 10) * 0.6;
  F((t) => {
    for (let slot = 0; slot < FL.n; slot++) {
      const i = slot % COLS, j = (slot / COLS) | 0, c = FL.cells[slot];
      if (t >= tPap + 0.4 && t < tCr) { c.set({ k: 0 }); continue; }
      if (t >= tCr) {                                          // 片尾：右半边的格子不紧不慢地生灭（每拍一次）
        if (i < 22) { c.set({ k: 0 }); continue; }
        const m = Math.floor((t - tCr) / BEAT), on = hash(slot, m) < 0.38, prev = hash(slot, m - 1) < 0.38, ph = (t - tCr) / BEAT - m;
        if (!on && !prev) { c.set({ k: 0 }); continue; }
        c.set({ fill: on ? (hash(slot, m + 99) < 0.3 ? C.ink : C.line) : C.line, k: on ? Math.min(1, ph * 4) : Math.max(0, 1 - ph * 4) });
        continue;
      }
      const tin = c0 + (i + j) * 0.012;
      if (t < tin) { c.set({ k: 0 }); continue; }
      const tw = tWave + depth(i, j) * 0.045;
      if (live(i, j)) c.set({ fill: t >= tw ? (t < tw + 0.12 ? C.gold : C.ink) : C.white, k: Math.min(1, (t - tin) / 0.12) });
      else c.set(t >= tWave + 1.2 ? { st: C.white, sw: 3, k: 1 } : { fill: C.white, k: Math.min(1, (t - tin) / 0.12) });
    }
  });
  sfx('pop', c0 + 0.2, { g: 0.45 }); sfx('whoosh', tWave, { g: 0.4 });
  const q = tx(ui, 'ser', tr('怎么知道内存没用了？', 'How does it know memory is no longer needed?'), 110, 200, { size: tr(100, 70), ...plate });
  wipe(q, tQ, { dir: 'l', d: 0.5 }); sfx('thud', tQ, { g: 0.6 });
  const no = tx(ui, 'ser', tr('它不知道', "It doesn't."), 110, 420, { size: tr(150, 140), color: C.gold, ...plate });
  slam(no, tNo, { from: 1.3, d: 0.45 }); sfx('thud', tNo, { g: 0.9 });
  const w1 = wonder(ui, tr('只知道：现在还找不找得到', 'It only knows: can it still be found now?'), 110, 660, tFind, tPap - 0.1, { size: tr(84, 64), h: tr(110, 90), plate: true });
  for (const e of [q, no]) exit(e, tPap - 0.1, { y: -60, d: 0.3 });

  // ── 1960 年那一页：正文只叫它「回收」 ──
  const PX = 3000, PY = 40, PW = 1500;
  const pg = paper(world, PX, PY, PW, `
    <div class="pt" style="font-size:40px;line-height:1.2">Recursive Functions of Symbolic Expressions and Their Computation by Machine, Part I</div>
    <div class="pq" style="font-size:28px;margin-top:12px">John McCarthy · Communications of the ACM 3(4), April 1960</div>
    <div class="pq" style="font-size:36px;margin-top:30px;line-height:1.5">… <span class="rc">a reclamation cycle starts</span><sup style="font-size:22px">7</sup> …</div>`);
  pg.style.minHeight = '590px';
  slide(pg, tPap, { y: 120, d: 0.55 }); sfx('pop', tPap, { g: 0.55 });
  classAt(pg.querySelector('.rc'), 'mk', tRec);
  const recL = tx(ui, 'ser', tr('正文只叫它「回收」', 'The paper only says "reclamation"'), 110, 820, { size: 72, ...plate });
  wipe(recL, tRec, { dir: 'l', d: 0.45 }); sfx('thud', tRec, { g: 0.6 });
  const reissue = tx(world, 'mono', 'Copied with minor notational changes from CACM, April 1960.', PX + 52, PY + 330, { size: 26, color: C.deep });
  appear(reissue, tRe); sfx('tick', tRe, { g: 0.5 });
  const reL = tag(world, tr('后来重排的版本', 'later re-typeset edition'), PX + 52, PY + 272, 30); slam(reL, tRe, { from: 1.3, d: 0.3 });
  exit(recL, tT1 - 0.2, { y: 60, d: 0.3 });
  // 脚注 7：打字机
  const fnRule = h('div', 'abs', world); px(fnRule, PX + 52, PY + 404, 420, 3); fnRule.style.background = C.ink;
  wipe(fnRule, tFn, { dir: 'l', d: 0.35 }); sfx('blip', tFn, { g: 0.5 });
  const fnEl = tx(world, 'pq', '', PX + 52, PY + 424, { size: 34, w: PW - 104, color: C.ink, lh: 1.45 });
  css(fnEl, { fontFamily: '"Inter"', fontWeight: 500 });
  const FN1 = '<sup style="font-size:20px">7</sup>We already called this process &quot;garbage collection&quot;, but I guess I chickened out of using it in the paper';
  const FN2 = "—or else the Research Laboratory of Electronics grammar ladies wouldn't let me.";
  const end1 = Tend('h5') - 0.25, n1 = FN1.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').length, n2 = FN2.length;
  const cps1 = n1 / Math.max(1.5, end1 - tT1), end2 = Tend('h6') - 0.25, cps2 = n2 / Math.max(1.5, end2 - tT2);
  // 两段分别按旁白的速度打完：第一段到 h5 说完，第二段到 h6 说完
  const fnA = h('span', '', fnEl), fnB = h('span', '', fnEl);
  appear(fnEl, tT1 - 0.05);
  typeText(fnA, FN1, tT1, cps1, { cursor: false, sfxGain: 0.5 });
  typeText(fnB, FN2, tT2, cps2, { cursorUntil: end2 + 1.5, sfxGain: 0.5 });
  // 译文：贴在纸下
  const tr1 = tx(ui, 'note', tr('（译）我们早就把这个过程叫作“垃圾回收”了，不过我大概是怂了，没在论文里用——', ''), 110, 800, { size: 34, color: C.white, ...plate });
  const tr2 = tx(ui, 'note', tr('要不就是电子学研究实验室那几位管语法的女士不让我用。', ''), 110, 856, { size: 34, color: C.white, ...plate });
  appear(tr1, Tend('h5') - 0.6); appear(tr2, Tend('h6') - 0.6);
  for (const e of [pg, reissue, reL, fnRule, fnEl, tr1, tr2]) exit(e, tH7 - 0.1, { y: -80, d: 0.35 });

  // ── 六十多年：一条时间线 ──
  const TX = 6400, TY = 520, TL = 1500, yrX = (y) => TX + (y - 1960) / (2026 - 1960) * TL;
  const axis = h('div', 'abs', world); px(axis, TX, TY, TL, 8); axis.style.background = C.white;
  wipe(axis, tH7 + 0.2, { dir: 'l', d: 1.2, ease: 'power2.inOut' }); sfx('whoosh', tH7 + 0.2, { g: 0.4 });
  const MARK = [[1960, tr('标记—清扫', 'mark-and-sweep'), 0], [1978, tr('三色', 'tri-color'), 1], [1983, tr('分代', 'generations'), 0], [2026, '', 1]];
  MARK.forEach(([y, l, up], k) => {
    const x = yrX(y), tm = tH7 + 0.3 + (x - TX) / TL * 1.2;
    const tk = h('div', 'abs', world); px(tk, x - 4, TY - 30, 8, 68); tk.style.background = k === 3 ? C.gold : C.white;
    const yl = tx(world, 'big', y === 2026 ? tr('今天', 'today') : String(y), x - 30, up ? TY - 120 : TY + 56, { size: 48, color: k === 3 ? C.gold : C.white });
    const ll = l ? tx(world, 'note', l, x - 28, up ? TY - 170 : TY + 112, { size: 32, color: C.pale }) : null;
    slam(tk, tm, { from: 2, d: 0.3 }); appear(yl, tm + 0.05); if (ll) appear(ll, tm + 0.1); sfx('tick', tm, { g: 0.45 });
  });
  const six = tx(ui, 'ser', tr('六十多年', 'Over sixty years'), 110, 130, { size: tr(140, 112), ...plate }); slam(six, tH7, { from: 1.2, d: 0.45 }); sfx('thud', tH7, { g: 0.9 });
  const old = tx(world, 'sub', tr('一停好几秒', 'pauses of seconds'), yrX(1960) - 20, TY + 170, { size: 56 });
  const now = tx(world, 'sub', tr('一秒 136 次', '136 times a second'), yrX(2026) - tr(300, 500), TY + 170, { size: 56, color: C.gold });
  const nowS = tx(world, 'src', tr('.NET 10.0.12 · 那一秒', '.NET 10.0.12 · that second'), yrX(2026) - tr(296, 496), TY + 250);
  wipe(old, qb(T('h7', { zh: '好几秒', en: 'several seconds' }) - 0.2), { dir: 'l', d: 0.35 }); wipe(now, tLast, { dir: 'r', d: 0.35 }); appear(nowS, tLast + 0.2);
  sfx('pop', qb(T('h7', { zh: '好几秒', en: 'several seconds' }) - 0.2), { g: 0.5 }); sfx('pop', tLast, { g: 0.5 });
  const tlEls = [axis, six, old, now, nowS];
  // ── 平衡：一根横梁在两端之间摆动，最后停平 ──
  const BX = 9600, BY = 560, BW = 1300;
  const fulcrum = board(world, BX - 70, BY, 140, 120);
  svg('polygon', { points: `${BX},${BY + 6} ${BX - 60},${BY + 110} ${BX + 60},${BY + 110}`, fill: C.gold }, fulcrum);
  // 横梁一组：外层管入场退场（补间），内层管摆角（帧函数），两者不碰同一个 transform
  const bgOut = h('div', 'abs', world); px(bgOut, BX - BW / 2, BY - 140, BW, 160);
  const bgRot = h('div', 'abs', bgOut); px(bgRot, 0, 0, BW, 160); css(bgRot, { transformOrigin: `${BW / 2}px 140px` });
  const beam = h('div', 'abs', bgRot); px(beam, 0, 128, BW, 14); beam.style.background = C.white;
  const left = tx(bgRot, 'sub', tr('不可预知的未来', 'an unknowable future'), 0, 30, { size: 52 }), right = tx(bgRot, 'sub', tr('严苛的硬件', 'strict hardware'), BW - tr(270, 390), 30, { size: 52 });
  const lw = h('div', 'abs', bgRot); px(lw, 20, 100, 60, 28); lw.style.background = C.white;
  const rw = h('div', 'abs', bgRot); px(rw, BW - 80, 100, 60, 28); rw.style.background = C.white;
  const bal = tx(ui, 'ser', tr('最优雅的平衡', 'the most elegant balance'), 110, 800, { size: tr(96, 88), color: C.gold, ...plate });
  appear(bgOut, tBal - 0.1);
  appear(fulcrum, tBal - 0.1);
  // 摆角：阻尼振荡，平衡那个词落下时停平
  const ang = (t) => (t < tBal ? 9 : 9 * Math.exp(-(t - tBal) * 0.9) * Math.cos((t - tBal) * 4.2) * (t < tEven ? 1 : Math.exp(-(t - tEven) * 6)));
  F((t) => ss(bgRot, 'transform', `rotate(${ang(t).toFixed(2)}deg)`));
  wipe(bal, tEven, { dir: 'l', d: 0.5 }); sfx('chime', tEven + 0.1, { g: 0.7 }); sfx('thud', tBal, { g: 0.5 });
  for (let k = 0; k < 4; k++) sfx('tick', tBal + k * 0.75, { g: 0.3 - k * 0.05, p: k % 2 ? 0.4 : -0.4 });
  for (const e of tlEls) exit(e, Tend('h7b') + 0.05, { y: -60, d: 0.3 });
  for (const e of [bgOut, fulcrum, bal]) exit(e, tCr - 0.3, { y: 60, d: 0.35 });

  // ── 片尾名单（不配旁白）──
  const CR = [
    ['策划', ''],
    ['DeepSeek V4.1 Flash 1017', tr('事实测绘 · 实验 01–02 · 叙事测绘', 'fact mapping · experiments 01–02 · narrative mapping')],
    ['Claude Fable 5.1', tr('取证复核 · 实验 03–12 · 中文第 1–7 稿 · 对抗审稿', 'source review · experiments 03–12 · Chinese drafts 1–7 · adversarial review')],
    ['Gemini 4 Argon', tr('网页端 · 中文第 8 稿文案', 'web · Chinese draft 8')],
    ['MiniMax M3.1 Flash', tr('准备方辅助：落盘 · 断句 · 读法 · 音色试听 · 任务书', 'preparation: handoff · line splits · readings · voice trials · brief')],
    ['MiniMax speech-2.8-hd', tr('配音', 'narration')],
    ['Claude Opus 5.5', tr('视觉系统 · 分镜与动画 · 配乐与音效 · 英文译稿 · 封面 · 渲染与审查', 'visual system · storyboard & animation · music & sound · English translation · cover · rendering & review')],
  ];
  const crEls = [];
  CR.forEach(([a, b], k) => {
    const y = 150 + k * 82, t0 = tCr + 0.2 + k * BEAT / 2;
    const ea = tx(ui, k ? 'lat' : 'sub', k ? a : tr('策划：WaterRun', 'Planning: WaterRun'), 120, y, { size: k ? 34 : 40, color: k ? C.white : C.gold });
    const eb = tx(ui, 'note', b, 120, y + 40, { size: 26, color: C.pale });
    slide(ea, t0, { x: -40, d: 0.35 }); appear(eb, t0 + 0.1);
    sfx('tick', t0, { g: 0.3 });
    crEls.push(ea, eb);
  });
  const os = tag(ui, tr('开源视频', 'Open-source video'), 120, 760, 36);
  const url = tx(ui, 'mono', 'github.com/Water-Run/ft', tr(330, 500), 762, { size: 44, color: C.white });
  slam(os, tCr + 2.4, { from: 1.2, d: 0.35 });
  for (let k = 1; k <= 3; k++) if (tCr + 2.4 + k * 1.6 * BAR < s.end - 0.5) sfx('tick', tCr + 2.4 + k * 1.6 * BAR, { g: 0.18, p: 0.5 }); wipe(url, tCr + 2.5, { dir: 'l', d: 0.5 }); sfx('thud', tCr + 2.4, { g: 0.6 });

  // ── 镜头 ──
  cam.track(s.start, { x: 1200, y: 600, z: 0.62 }, [
    [s.start + 0.6, { x: 1200, y: 600, z: 0.66 }, tPap - 0.5 - (s.start + 0.6), { ease: 'none', sfx: false }],
    [tPap - 0.5, { x: PX + 760, y: 470, z: 1.0 }, 1.0, { ease: 'power3.inOut', g: 0.45 }],
    [null, { z: 1.03 }, tH7 - 0.5 - (tPap + 0.65) - 0.05, { ease: 'none', sfx: false }],
    [tH7 - 0.5, { x: TX + 760, y: 540, z: 1.0 }, 1.0, { ease: 'power3.inOut', g: 0.45 }],
    [null, { x: TX + 820 }, tBalCam - (tH7 + 0.65) - 0.05, { ease: 'none', sfx: false }],
    [tBalCam, { x: BX, y: 560, z: 1.0 }, 0.8, { ease: 'power3.inOut', g: 0.4 }],
    [null, { z: 1.04 }, tCr - 0.6 - (tBalCam + 0.95) - 0.05, { ease: 'none', sfx: false }],
    [tCr - 0.6, { x: 1200, y: 600, z: 0.62 }, 1.2, { ease: 'power3.inOut', sfx: false }],
    [null, { x: 1320, z: 0.65 }, s.end - (tCr + 0.75), { ease: 'none', sfx: false }],
  ]);
});
