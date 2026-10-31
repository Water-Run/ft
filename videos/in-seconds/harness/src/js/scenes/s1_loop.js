// Agent Loop：先给地图（p1–p5：四站、一圈 = 问一次模型、没有工具调用就停），再把开头那次修测试走一遍（w1–w7：五圈，每圈一个动作）。
// 同一个环、同一摞对话，中间不换场。左：对话栈（整段对话 = 上下文，每一圈全部发出）；右：环与四张站卡；
// 环心先放 Agent Loop 的名字，走一遍时换成 cart.py 与三件商品的价格 3、5、2（第 2 圈测出 7，第 3 圈找到原因并改掉，第 4 圈通过）。
// 数据取自实验记录（data.js，FACTS E1–E8、E11）。
scene('loop', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const sW = L.scenes.find((x) => x.id === 'walk');
  const hold = sW.end - s.start - 0.2, dx = 16;
  const cam = makeCamera(world, 1920, VH);
  cam.track(s.start, { x: 960 + dx / 2, y: 484, z: 1 }, [[s.start + 0.1, { x: 960 - dx / 2 }, hold, { ease: 'none', sfx: false }]]);
  const R0 = D.rounds;
  const cx = 1240, cy = 515, R = 290;

  // ── 时刻 ──
  const mSend = T('p2', '发给'), mCall = T('p3', '写明'), mExec = T('p4', '执行'), mBack = T('p4', '放回'), mAgain = T('p4', '再问');
  const mExit = T('p5', '不再'), mStop = T('p5', '停下');
  const tW = T('w1');                                   // 地图 → 走一遍
  // 每一圈：[发出（整段对话到模型）, 工具调用, Harness 执行, 结果交回]
  const W = [
    [T('w2') + 0.1, T('w2', '看'), T('w2', 'Harness'), T('w2', '放回')],
    [T('w3') + 0.1, T('w3', '跑'), Tend('w3') + 0.15, T('w3b', '实际') + 0.3],
    [T('w4') + 0.1, T('w5', '要求'), T('w5', 'Harness'), Tend('w5')],
    [T('w6') + 0.1, T('w6', '跑'), T('w6', '测试') + 0.15, T('w6', '通过')],
    [T('w7') + 0.1],
  ];
  const tExit = T('w7', '不再'), tStop = T('w7', '停下');
  const MV = 0.45;                                      // 指针提前起步，词读到时正好到站
  const keys = [[c0, 0], [mCall - MV, 90], [mExec - MV, 180], [mBack - MV, 270], [mAgain - MV, 360]];
  W.forEach((w, i) => {
    const base = 360 * (i + 1);
    if (i > 0) keys.push([w[0] - 0.6, base]);
    if (w.length > 1) keys.push([w[1] - MV, base + 90], [w[2] - MV, base + 180], [w[3] - MV, base + 270]);
  });
  keys.slice(1).forEach(([t0, deg]) => sfx(deg % 360 === 0 ? 'thud' : 'tick', t0 + 0.6, { g: deg % 360 === 0 ? 0.45 : 0.5, p: 0.3 }));

  // ── 环与四张站卡 ──
  const chips = (lit) => D.tools.map((n) => `<span class="chip${n === lit ? ' lit' : ''}">${n}</span>`).join('');
  const loop = makeLoop(world, {
    cx, cy, R, keys, stopAt: tStop, from: mSend - 0.3,
    cards: { model: [cx - 240, 132, 480, 175], call: [1490, 425, 360, 180], exec: [cx - 260, 735, 520, 140], back: [620, 425, 340, 180] },
    bodies: {
      model: tr('读整段对话，写出回复', 'Reads it all, writes a reply'),
      call: tr('用哪个工具、参数是什么', 'Which tool, which arguments'),
      exec: chips(''),
      back: tr('结果放回对话', 'The result goes back in'),
    },
  });
  const K = loop.cards;
  K.call.body.dataset.gloss = '工具调用';
  wipe(loop.S, c0 + 0.1, { dir: 'l', d: 0.6 }); sfx('whoosh', c0 + 0.1, { g: 0.5 });
  ['model', 'call', 'exec', 'back'].forEach((k, i) => wipe(K[k].box, c0 + 0.3 + i * 0.12, { dir: 'l', d: 0.35 }));
  // 站卡的内容按圈换
  const at = (k, t, html) => keyed(K[k].body).at(t, { html });
  // 模型回复里的话（摘录；删去的部分用省略号标出）
  const SAYS = [tr('「我先看看这两个文件。」', ''), '', tr('「问题确认了：prices[1:] 把第一件商品漏掉了……」', ''), '', tr('「测试通过了。……」', '')];
  const say = (r) => (SAYS[r.n - 1] ? `<div class="q">${esc(SAYS[r.n - 1])}</div>` : '');
  const got = (r) => `<div>${tr(`收到 ${r.sent} 条`, `${r.sent} messages in`)}</div>`;
  const CALL = [`read_file ×2<br>cart.py<br>test_cart.py`, 'run_tests()', 'edit_file<br>sum(prices[1:])<br>→ sum(prices)', 'run_tests()'];
  const DO = [tr('读出两个文件', 'reads both files'), '$ python test_cart.py', tr('改 cart.py 第 3 行', 'edits line 3 of cart.py'), '$ python test_cart.py'];
  const LIT = ['read_file', 'run_tests', 'edit_file', 'run_tests'];
  const BACK = [tr('cart.py 的内容<br>test_cart.py 的内容', 'contents of both files'), tr('失败<br>应为 10，实际 7', 'FAIL<br>expected 10, got 7'), tr('已修改 cart.py', 'cart.py edited'), tr('通过<br>3 + 5 + 2 = 10', 'PASS<br>3 + 5 + 2 = 10')];
  // 走一遍开始时，站卡清空成「等着」的样子
  at('model', tW, tr('等着发来的对话', 'waiting')); at('call', tW, ''); at('exec', tW, chips('')); at('back', tW, '');
  W.forEach((w, i) => {
    const r = R0[i];
    at('model', w[0] - 0.1, got(r) + say(r));
    if (i < 4) {
      at('call', w[1] - 0.25, CALL[i]);
      at('exec', w[2] - 0.25, chips(LIT[i]) + `<div>${DO[i]}</div>`);
      at('back', w[3] - 0.25, BACK[i]);
      sfx('pop', w[1] - 0.25, { g: 0.55, p: 0.5 }); sfx('blip', w[2] - 0.25, { g: 0.5 }); sfx('tick', w[3] - 0.2, { g: 0.6, p: -0.5 });
    }
  });
  at('call', tExit - 0.1, tr('没有工具调用', 'no tool call'));
  sfx('thud', tExit - 0.1, { g: 0.6 });

  // 模型一站的岔路：回复里没有工具调用 → 停下
  const ov = overlay(world);
  const exitBox = h('div', 'abs exitbox', world, tr('没有工具调用<br>→ 停下', 'No tool call<br>→ stop')); px(exitBox, 1540, 165, 300, 110);
  exitBox.dataset.name = tr('停下', 'stop');
  const exitLn = path(ov, `M ${cx + 244} 222 L 1532 222`, 'paper', { w: 4 });
  arrowIn(exitLn, mExit - 0.2, 0.4); wipe(exitBox, mExit - 0.05, { dir: 'l', d: 0.4 }); sfx('tick', mExit - 0.05, { g: 0.6 });
  keyed(exitBox).at(mStop - 0.1, { cls: 'abs exitbox on' }).at(tW, { cls: 'abs exitbox' })
    .at(tExit, { cls: 'abs exitbox on', html: tr('没有工具调用<br>→ 停下，回复你', 'No tool call<br>→ stop, reply to you') });
  sfx('chime', mStop - 0.1, { g: 0.5 }); sfx('chime', tStop, { g: 0.7 });

  // ── 左：对话栈（上下文）与工具清单 ──
  const rows = [
    ['say', tr('说明', 'System'), 'System Prompt', c0 + 0.6],
    ['say', tr('你', 'You'), esc(D.task), c0 + 0.75],
  ];
  const CALLROW = ['read_file ×2', 'run_tests', 'edit_file', 'run_tests'];
  const RES = [[tr('cart.py 的内容', 'cart.py'), tr('test_cart.py 的内容', 'test_cart.py')], [tr('失败：应为 10，实际 7', 'FAIL: expected 10, got 7')], [tr('已修改 cart.py', 'cart.py edited')], [tr('通过：3 + 5 + 2 = 10', 'PASS: 3 + 5 + 2 = 10')]];
  W.slice(0, 4).forEach((w, i) => {
    rows.push(['call', tr('模型', 'Model'), CALLROW[i], w[1] + 0.2]);
    RES[i].forEach((x, j) => rows.push(['tool', tr('结果', 'Result'), x, w[3] + 0.2 + j * 0.15]));
  });
  const sendAt = [mSend, ...W.map((w) => w[0])];
  const conv = makeConv(world, {
    x: 110, bottom: 790, w: 480, maxH: 600, rows, labX: 430,
    sent: [[mSend - 0.5, 2, 0, tr('整段发出', 'all of it, sent')], ...W.map((w, i) => [w[0] - 0.5, R0[i].sent, i + 1, tr(`第 ${i + 1} 圈发出 ${R0[i].sent} 条`, `lap ${i + 1}: ${R0[i].sent} sent`)])],
    newFrom: (t) => { let n = 0; for (let i = 0; i < 5; i++) if (t >= W[i][0] - 0.5) n = R0[i].sent; return n; },
  });
  conv.head.innerHTML = `${tr('对话', 'Conversation')} · ${tr('上下文', 'context')} <span class="en">Context</span>`;
  wipe(conv.head, c0 + 0.5, { dir: 'l', d: 0.3 });
  // 说明（System Prompt）的原文：这一次发出去的第一条
  const sysCard = h('div', 'abs', world, `<div class="dim" style="font:600 26px 'Sans SC'">System Prompt · ${tr('说明的原文', 'the text')}</div><div class="paper" style="font:500 26px 'Sans SC',Mono;white-space:normal;line-height:1.45"></div>`);
  px(sysCard, 110, 170, 480); sysCard.dataset.name = 'System Prompt';
  wipe(sysCard, T('p2', '整段') - 0.2, { dir: 'l', d: 0.3 });
  typeText(sysCard.lastChild, esc(D.system), T('p2', '整段'), 34, { cursorUntil: T('p3'), sfxGain: 0.35 });
  wipeOut(sysCard, tW - 0.1, { dir: 'l', d: 0.35 });
  const tools = h('div', 'abs toolsbox2', world, `<div class="role">${tr('工具清单', 'Tool list')} <span class="en">Tools</span></div><div>${D.tools.map((n) => `<span class="tn mono">${n}</span>`).join('')}</div>`);
  px(tools, 110, 806, 480, 96); tools.dataset.name = tr('工具清单', 'tools');
  wipe(tools, T('p2', '工具清单') - 0.2, { dir: 'l', d: 0.4 }); sfx('blip', T('p2', '工具清单') - 0.2, { g: 0.5 });
  // 发出：整段对话（连同工具清单）飞到模型那一站
  const pkt = h('div', 'abs pkt', world, ''); px(pkt, 0, 0);
  const pktLab = [tr('整段对话 + 工具清单', 'all + tools'), ...R0.map((r) => tr(`${r.sent} 条 + 工具清单`, `${r.sent} + tools`))];
  let lastP = null;
  F((t) => {
    let k = -1;
    sendAt.forEach((ts, i) => { if (t >= ts - 0.55 && t < ts + 0.15) k = i; });
    const key = k < 0 ? 'x' : k + ':' + t.toFixed(3);
    if (key === lastP) return; lastP = key;
    if (k < 0) { pkt.style.visibility = 'hidden'; return; }
    const p = ease.io3(clamp((t - (sendAt[k] - 0.55)) / 0.55)), y0 = conv.topAt(sendAt[k] - 0.55);
    pkt.textContent = pktLab[k];
    css(pkt, { visibility: 'visible', left: lerp(300, cx - 240 - 20, p).toFixed(1) + 'px', top: lerp(y0 - 40, 200, p).toFixed(1) + 'px', transform: `translateX(${(-p * 100).toFixed(1)}%)` });
  });
  sendAt.forEach((ts) => sfx('whoosh', ts - 0.55, { g: 0.35, p: 0.2 }));
  W.forEach((w, i) => window.SENDS.push([w[0], R0[i].bytes]));

  // ── 环心（地图）：Agent Loop 的名字与注解 ──
  const nm = centered(world, 'paper', 'Agent Loop', cx, cy - 175, 540); css(nm, { font: '900 84px Inter', letterSpacing: '-.03em' });
  slam(nm, Q(T('p1', 'Agent')), { from: 1.3, d: 0.45 }); sfx('thud', Q(T('p1', 'Agent')), { g: 0.8 });
  const sub = centered(world, 'ac', tr('一圈 = 问一次模型', 'One lap = one request'), cx, cy - 60, 540); sub.style.font = '700 40px "Sans SC"';
  wipe(sub, mSend - 0.3, { dir: 'l', d: 0.4 });
  const gL = txt(world, 'gloss', tr('<b>Agent Loop</b>：Harness 一圈一圈地问模型、照工具调用去做，直到模型不再调用工具', '<b>Agent Loop</b>: ask, run the tool calls, repeat until none'), cx - 220, cy + 20);
  css(gL, { width: '440px' }); gL.dataset.gloss = 'Agent Loop';
  wipe(gL, Tend('p1') - 0.5, { dir: 'l', d: 0.5 });
  [nm, sub, gL].forEach((e) => wipeOut(e, tW - 0.1, { dir: 'l', d: 0.35 }));

  // ── 上：五圈的进度（走一遍时出现）──
  const LAPS = [tr('读文件', 'read'), tr('跑测试', 'test'), tr('改代码', 'edit'), tr('再跑测试', 'test again'), tr('停下', 'stop')];
  const lapIn = (i) => (i === 0 ? W[0][0] - 0.6 : W[i][0] - 0.6);
  LAPS.forEach((nm2, i) => {
    const c = h('div', 'abs lapchip', world, `<b>${i + 1}</b>${nm2}`); px(c, 300 + i * 232, 48, 212, 52);
    c.dataset.name = tr(`第 ${i + 1} 圈`, `lap ${i + 1}`);
    const t0 = T('w1', '五圈') - 0.5 + i * 0.12;
    wipe(c, t0, { dir: 'l', d: 0.3 }); sfx('tick', t0, { g: 0.45, p: -0.6 + i * 0.3 });
    const end = i < 4 ? lapIn(i + 1) : tStop;
    keyed(c).at(lapIn(i), { cls: 'abs lapchip cur' }).at(end, { cls: 'abs lapchip done' });
  });

  // ── 环心（走一遍）：cart.py 与三件商品的价格 ──
  const cl = D.cart_before.split('\n').map(esc); cl[1] = '    ⋯';                // 第 2 行是说明文字，环心放不下，略去
  const code = codeCard(world, tr('cart.py · 算购物车总价', 'cart.py · cart total'), cl, cx - 230, cy - 152, 460, 24, 36);
  wipe(code.card, tW + 0.2, { dir: 'l', d: 0.5 });
  const L3 = (html) => `<span class="ln">3</span>${html}`;
  keyed(code.ls[2]).at(T('w4', '这一') - 0.1, { html: L3('    return sum(prices<span class="hl">[1:]</span>)') })
    .at(W[2][2] - 0.2, { html: L3('    return sum(prices<span class="strike">[1:]</span>)') })
    .at(W[2][2] + 0.35, { html: L3(esc(D.cart_after.split('\n')[2])) });
  // 第 1 圈：Harness 读文件时，一条朱红的扫描线扫过代码
  const scan = blk(code.card, 'bg-ac', 0, 66, 10, 36);
  F((t) => { const k = clamp((t - W[0][2] + 0.2) / 0.9); scan.style.top = (66 + k * 72).toFixed(1) + 'px'; scan.style.visibility = k > 0 && k < 1 ? 'visible' : 'hidden'; });
  // 三件商品：3、5、2
  const PX = (i) => cx - 170 + i * 120;
  const boxes = [3, 5, 2].map((v, i) => {
    const b = h('div', 'abs price', world, String(v)); px(b, PX(i), cy + 44, 100, 86); b.style.lineHeight = '78px';
    b.dataset.name = tr(`第 ${i + 1} 件：${v}`, `item ${i + 1}: ${v}`);
    const t0 = T('w3b', String(v)) - 0.15;
    wipe(b, t0, { dir: 'b', d: 0.3 }); sfx('pop', t0, { g: 0.45, p: -0.4 + i * 0.4 });
    return b;
  });
  const tIn = T('w4', '这一') + 0.25, tSkip = T('w4', '漏加') - 0.1, tFix = W[2][2] + 0.35;
  classAt(boxes[1], 'in', tIn); classAt(boxes[2], 'in', tIn);
  classAt(boxes[0], 'skip', tSkip, tFix); classAt(boxes[0], 'in', tFix);
  sfx('tick', tIn, { g: 0.6 }); sfx('thud', tSkip, { g: 0.5, p: -0.4 }); sfx('pop', tFix, { g: 0.6 });
  // 括号：括出被加起来的那几件。[1:] 从第二件起；改好之后括住三件
  const brk = h('div', 'abs ubrk', world); px(brk, PX(1), cy + 136, 220, 16); brk.dataset.name = tr('加起来的', 'summed');
  F((t) => {
    const k = ease.io3(clamp((t - tFix) / 0.45)), x0 = lerp(PX(1), PX(0), k);
    css(brk, { left: x0.toFixed(1) + 'px', width: (PX(2) + 100 - x0).toFixed(1) + 'px', visibility: t >= tIn ? 'visible' : 'hidden' });
  });
  // 算式：应为 10 → 实际 7 → 原因 → 改好 → 通过
  const sum = centered(world, 'paper', '', cx, cy + 160, 440); sum.style.font = '700 30px "Sans SC", Mono';
  keyed(sum).at(T('w3b', '应为') - 0.1, { html: `${tr('总价', 'total')} 3 + 5 + 2 ${tr('应为', 'should be')} <b class="mono">10</b>` })
    .at(T('w3b', '实际') - 0.05, { html: `${tr('应为', 'expected')} 10 · ${tr('实际', 'got')} <b class="mono hl">7</b>` })
    .at(tIn, { html: `<span class="mono ac">[1:]</span> ${tr('从第二件开始加', 'starts at item 2')}` })
    .at(tSkip, { html: `${tr('漏加第一件', 'item 1 skipped')}：5 + 2 = <b class="mono hl">7</b>` })
    .at(tFix, { html: `3 + 5 + 2 = <b class="mono">10</b>` })
    .at(T('w6', '通过') - 0.05, { html: `3 + 5 + 2 = <b class="mono">10</b> · <span class="pass">${tr('通过', 'PASS')}</span>` });
  sfx('thud', T('w3b', '实际') - 0.05, { g: 0.6 }); sfx('chime', T('w6', '通过') - 0.05, { g: 0.6 });
});

// walk 一场的画面全部建在上面的 loop 里（同一个环上接着走五圈）；config.js 的 after() 不单独显示它
scene('walk', () => {});
