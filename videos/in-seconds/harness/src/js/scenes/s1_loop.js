// 主场（ask + loop，同一个环上走完五圈）：左边是环，一圈 = 一次请求；右边是整段对话，每到「模型」一站整段发出，括号括出发出的条数。
// 左下是项目文件，Harness 执行时连过去。全部数据取自实验记录（data.js，FACTS E2–E8）。
scene('ask', ({ root, s }) => {
  const world = h('div', 'world', root);
  const sL = L.scenes.find((x) => x.id === 'loop');
  const tEnd = sL.end;
  const hold = tEnd - s.start - 0.2, dx = 16;
  const cam = makeCamera(world, 1920, VH);
  cam.track(s.start, { x: 960 + dx / 2, y: 484, z: 1 }, [[s.start + 0.1, { x: 960 - dx / 2 }, hold, { ease: 'none', sfx: false }]]);
  const R0 = D.rounds;

  // ── 时刻：每次请求发出（send）、回复到（reply）、Harness 执行（exec）、结果交回（back） ──
  const send = [Tend('a4') + 0.15, T('l1', '整段'), T('l4', '第三'), T('l6', '第四'), T('l7', '第五')];
  const reply = [send[0] + 0.25, T('l2', '跑') - 0.6, T('l5', '改掉') - 0.6, T('l6', '再跑') - 0.25, T('l7', '回复') - 0.3];
  const exec = [T('a7', '照着') - 0.2, T('l3', '跑完') - 0.4, T('l5', '照办') - 0.5, T('l6', '通过') - 0.55];
  const back = [T('a7', '放回') - 0.3, Tend('l3') - 0.6, Tend('l5') - 0.25, Tend('l6') + 0.02];
  const arrive = [s.start, T('l1', '再问') - 0.75, send[2] - 0.35, send[3] - 0.3, send[4] - 0.3];   // 指针回到「模型」一站的起步时刻
  const keys = [[s.start, 0]];
  for (let i = 0; i < 5; i++) {
    if (i > 0) keys.push([arrive[i], i * 360, i >= 3 ? 0.5 : 0.7]);
    if (i < 4) {
      keys.push([reply[i], i * 360 + 90, i >= 3 ? 0.5 : 0.8]);
      keys.push([exec[i], i * 360 + 180, i >= 3 ? 0.5 : 0.7]);
      keys.push([back[i], i * 360 + 270, i >= 3 ? 0.5 : 0.7]);
    } else keys.push([reply[4], 4 * 360 + 50, 1.1]);        // 第 5 次：回复里没有工具调用，指针没走到「工具调用」就停下
  }
  const stopAt = T('l7', '没有');
  const cx = 620, cy = 490, R = 290;
  const ring = makeRing(world, { cx, cy, R, keys, stopAt });
  wipe(ring.S, s.start + 0.1, { dir: 'l', d: 0.6 });
  ring.labels.forEach((e, i) => wipe(e.parentNode, s.start + 0.25 + i * 0.1, { dir: 'l', d: 0.35 }));
  sfx('whoosh', s.start + 0.1, { g: 0.5 });
  // 指针每到一站，配一声轻响；到「模型」一站（发出请求）重一点
  keys.slice(1).forEach(([t0, deg, d]) => { const at = t0 + (d || 0.7) * 0.85; sfx(deg % 360 === 0 ? 'thud' : 'tick', at, { g: deg % 360 === 0 ? 0.45 : 0.5, p: -0.4 }); });
  sends(send);
  function sends(ts) { ts.forEach((t, i) => window.SENDS.push([t, R0[i].bytes])); }

  // ── 左上：第几圈（第几次请求） ──
  const lapLab = txt(world, 'dim', tr('圈', 'Lap'), 76, 146); lapLab.style.font = '500 30px "Sans SC"';
  const lapBoxes = R0.map((r, i) => {
    const b = h('div', 'abs lapbox', world, String(r.n)); px(b, 128 + i * 68, 136, 56, 56);
    return b;
  });
  [lapLab, ...lapBoxes].forEach((e, i) => wipe(e, s.start + 0.3 + i * 0.06, { dir: 'l', d: 0.3 }));
  const lapHit = blk(world, 'bg-ac', 128, 136, 56, 56); lapHit.dataset.name = tr('第 1 圈', 'lap 1');
  fromTo(lapHit, T('a1', '第一次') - 0.05, { autoAlpha: 0, scale: 1.8 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }); vanish(lapHit, T('a1', '第一次') + 0.5);
  sfx('thud', T('a1', '第一次') - 0.05, { g: 0.5 });
  let lastLap = null;
  F((t) => {
    let cur = 1; for (let i = 1; i < 5; i++) if (t >= arrive[i] + 0.35) cur = i + 1;
    if (cur === lastLap) return; lastLap = cur;
    lapBoxes.forEach((b, i) => { b.className = 'abs lapbox ' + (i + 1 === cur ? 'cur' : i + 1 < cur ? 'done' : 'todo'); });
  });

  // ── 右边：对话栈 ──
  const rv = (i) => R0[i];
  const rows = [
    ['say', tr('说明', 'System'), esc('文件：cart.py、test_cart.py'), T('a2', '说明')],
    ['say', tr('你', 'You'), esc(D.task), T('a4', '你')],
    ['call', tr('工具调用', 'Tool call'), 'read_file ×2', reply[0] + 0.7],
    ['tool', tr('结果', 'Result'), esc('cart.py 的内容'), back[0] + 0.55],
    ['tool', tr('结果', 'Result'), esc('test_cart.py 的内容'), back[0] + 0.7],
    ['call', tr('工具调用', 'Tool call'), rv(1).calls[0].name, reply[1] + 0.6],
    ['tool', tr('结果', 'Result'), esc('失败：应为 10，实际得到 7'), back[1] + 0.55],
    ['call', tr('工具调用', 'Tool call'), 'edit_file cart.py', reply[2] + 0.6],
    ['tool', tr('结果', 'Result'), esc(rv(2).results[0]), back[2] + 0.45],
    ['call', tr('工具调用', 'Tool call'), rv(3).calls[0].name, reply[3] + 0.45],
    ['tool', tr('结果', 'Result'), esc('通过：total([3, 5, 2]) = 10'), back[3] + 0.45],
    ['say', tr('回复', 'Reply'), esc('测试通过了。我把 sum(prices[1:]) …'), reply[4] + 0.9],
  ];
  const sentLab = (i) => tr(`第 ${i + 1} 次发出 ${R0[i].sent} 条`, `Request ${i + 1}: ${R0[i].sent} messages`) + (i === 0 ? tr('，外加工具清单', ' + tool list') : '');
  const conv = makeConv(world, {
    x: 1215, bottom: 840, w: 610, maxH: 580, rows,
    sent: send.map((t, i) => [t, R0[i].sent, i + 1, sentLab(i)]),
    newFrom: (t) => { let n = 0; for (let i = 0; i < 5; i++) if (t >= send[i]) n = R0[i].sent; return n; },
  });
  wipe(conv.head, T('a2', '说明') - 0.3, { dir: 'l', d: 0.3 });
  // 工具清单：不是一条消息，是随请求另外发去的一张清单（实验的 tools 参数）
  const tools = h('div', 'abs toolsbox', world, `<span class="role">${tr('工具清单', 'Tools')}</span>` + D.tools.map((n) => `<span class="tn mono">${n}</span>`).join(''));
  px(tools, 1215, 856, 610, 56);
  wipe(tools, T('a3', '工具清单') - 0.1, { dir: 'l', d: 0.4 }); sfx('pop', T('a3', '工具清单'), { g: 0.5, p: 0.5 });
  const tns = tools.querySelectorAll('.tn');
  [['读文件', 1], ['改文件', 2], ['跑测试', 3]].forEach(([w, k]) => classAt(tns[k - 1], 'lit', T('a3', w) - 0.05, T('a3', w) + 0.9));
  rows.forEach(([k, , , t0]) => sfx(k === 'call' ? 'pop' : 'blip', t0, { g: 0.45, p: 0.5 }));

  // 第 1 次请求的原文：说明（system 消息）与三个工具各自的说明（随请求发去的 tools 参数），发出之后收起
  const sysCard = h('div', 'abs', world, `<div class="dim" style="font:600 26px 'Sans SC'">${tr('说明的原文', 'The system message')}</div><div class="paper" style="font:500 28px 'Sans SC',Mono;white-space:normal;line-height:1.45"></div>`);
  px(sysCard, 1215, 150, 620); during(sysCard, T('a2', '说明') + 0.1, send[0] + 0.2);
  typeText(sysCard.lastChild, esc(D.system), T('a2', '说明') + 0.2, 30, { cursorUntil: T('a3') - 0.2, sfxGain: 0.4 });
  const toolCard = h('div', 'abs', world, `<div class="dim" style="font:600 26px 'Sans SC'">${tr('工具清单的原文', 'The tool list')}</div>` +
    D.tools.map((n, i) => `<div class="trow" style="font:500 28px 'Sans SC';line-height:1.5;white-space:normal"><span class="mono ac" style="display:inline-block;width:170px;font-weight:700">${n}</span><span class="paper">${esc(D.tool_desc[i])}</span></div>`).join(''));
  px(toolCard, 1215, 400, 620); during(toolCard, T('a3', '工具清单') + 0.1, send[0] + 0.2);
  toolCard.querySelectorAll('.trow').forEach((r, i) => slide(r, T('a3', ['读文件', '改文件', '跑测试'][i]) - 0.15, { x: 40, d: 0.35 }));

  // 发出：从括号顶上连到「模型」一站（沿环外走），每次发出时亮 1.6 秒
  const ov = overlay(world);
  const sendPath = path(ov, 'M 0 0', 'ac', { w: 5 });
  let lastSP = null;
  F((t) => {
    let i = -1; for (let k = 0; k < 5; k++) if (t >= send[k]) i = k;
    const on = i >= 0 && t < send[i] + 1.6;
    const top = conv.topAt(Math.min(t, send[Math.max(0, i)] + 0.5));
    const k = on ? prog(t, send[i] + 0.2, 0.6) : 0;
    const key = on + ':' + k.toFixed(3) + ':' + top.toFixed(0);
    if (key === lastSP) return; lastSP = key;
    sendPath.style.visibility = on && k > 0 ? 'visible' : 'hidden';
    const pts = [[1180, top + 6], [1170, top + 6], [1170, 128], [720, 128]];
    const len = (pts[0][0] - pts[1][0]) + (top + 6 - 128) + (1170 - 720);
    sendPath.setAttribute('d', `M ${pts.map((p) => p.join(' ')).join(' L ')}`);
    sendPath.style.strokeDasharray = `${len} ${len}`; sendPath.style.strokeDashoffset = ((1 - k) * len).toFixed(1);
  });

  // ── 左下：项目文件。Harness 执行时从「Harness 执行」一站连过去 ──
  const proj = txt(world, 'dim', tr('项目', 'Project'), 76, 760); proj.style.font = '700 28px "Sans SC"';
  const fileA = h('div', 'abs file mono', world, 'cart.py'); px(fileA, 76, 806, 270, 44);
  const fileB = h('div', 'abs file mono', world, 'test_cart.py'); px(fileB, 76, 858, 270, 44);
  wipe(proj, T('a2', '项目') - 0.2, { dir: 'l', d: 0.3 }); wipe(fileA, T('a2', '文件') - 0.2, { dir: 'l', d: 0.35 }); wipe(fileB, T('a2', '文件') - 0.08, { dir: 'l', d: 0.35 });
  // a6：模型要的就是这两个文件，可它自己打不开：文件框变成朱红虚线，等 Harness 去读
  [fileA, fileB].forEach((f, i) => classAt(f, 'want', T('a6', '两个') + i * 0.12, exec[0] + 0.3));
  sfx('tick', T('a6', '两个'), { g: 0.6, p: -0.6 }); sfx('thud', T('a6', '打不开'), { g: 0.5, p: -0.6 });
  const reach = path(ov, `M ${cx - 120} 640 L 360 790`, 'ac', { w: 5, dashed: '12 10', arrow: false });
  arrowIn(reach, T('a6', '读') - 0.1, 0.4);
  F((t) => { const v = t >= T('a6', '读') - 0.1 && t < exec[0] + 0.2 ? '' : 'none'; if (reach.style.display !== v) reach.style.display = v; });
  const stopBar = blk(world, 'bg-ac', 410, 700, 14, 90); stopBar.dataset.name = tr('打不开', 'cannot open');
  css(stopBar, { transform: 'rotate(58deg)' });
  appear(stopBar, T('a6', '打不开') - 0.05); vanish(stopBar, exec[0] + 0.2);
  keyed(fileA).at(exec[2] + 0.6, { html: 'cart.py <span class="ac">·</span> ' + tr('已改', 'edited') });
  const touch = [[exec[0], fileA, fileB], [exec[1], fileB], [exec[2], fileA], [exec[3], fileB]];
  touch.forEach(([t0, ...fs]) => {
    fs.forEach((f) => classAt(f, 'hit', t0 + 0.3, t0 + 1.6));
    const p = path(ov, 'M 470 845 L 356 845', 'paper', { w: 5 });
    arrowIn(p, t0 + 0.2, 0.3);
    F((t) => { const v = t >= t0 + 0.2 && t < t0 + 1.5 ? '' : 'none'; if (p.style.display !== v) p.style.display = v; });
  });

  // ── 环中间：这一步的实物（请求的三样东西、模型写出的工具调用原文、Harness 拿到的结果） ──
  const hub = (t0, t1, build) => { const g = h('div', 'abs hub', world); px(g, cx - 260, 300, 520, 400); build(g); during(g, t0, t1, 0.2); return g; };
  const line = (g, cls, html, y, font) => { const e = centered(g, cls, html, 260, y, 520); if (font) e.style.font = font; return e; };
  // 第 1 次请求要带的三样东西
  hub(s.start + 0.6, send[0] + 0.3, (g) => {
    const ttl = line(g, 'paper', tr('第 1 次请求', 'Request 1'), 10, '900 64px "Sans SC"');
    wipe(ttl, T('a1', '第一次') - 0.1, { dir: 'l', d: 0.45 });
    [[tr('说明', 'System'), T('a2', '说明')], [tr('工具清单', 'Tools'), T('a3', '工具清单')], [tr('你的话', 'Your words'), T('a4', '你')]].forEach(([nm, t0], i) => {
      const slot = h('div', 'abs slot', g, nm); px(slot, 20 + i * 166, 130, 150, 110);
      wipe(slot, T('a1', '三样') - 0.1 + i * 0.16, { dir: 't', d: 0.35 }); sfx('tick', T('a1', '三样') - 0.1 + i * 0.16, { g: 0.45 });
      classAt(slot, 'full', t0, Infinity);
    });
    const n = line(g, 'dim', '', 276, '600 30px "Sans SC"');
    keyed(n).at(T('a2', '说明'), { html: '1 / 3' }).at(T('a3', '工具清单'), { html: '2 / 3' }).at(T('a4', '你'), { html: '3 / 3' });
  });
  // 模型的回复：一段约定格式的文字
  const call1 = R0[0].calls;
  hub(reply[0] + 0.55, exec[0] - 0.05, (g) => {
    line(g, 'hub-k', tr('模型回的', 'The model replies'), 10);
    line(g, 'argx', esc(R0[0].say), 60, '500 30px "Sans SC"');
    call1.forEach((c, i) => {
      sfx('pop', reply[0] + 0.6 + i * 0.25, { g: 0.5, p: -0.3 });
      line(g, 'callx', c.name, 124 + i * 112, '800 44px Mono');
      line(g, 'argx', esc(JSON.stringify(c.args)), 176 + i * 112, '600 28px Mono');
    });
  });
  const gCall = txt(world, 'gloss', tr('<b>工具调用</b>：模型照约定的格式写出的一段文字，写明要用哪个工具、参数是什么。它自己并不执行', '<b>Tool call</b>: text in an agreed format'), 1215, 200);
  css(gCall, { width: '620px' }); gCall.dataset.gloss = tr('工具调用', 'tool call');
  during(gCall, T('a5', '工具调用') - 0.3, back[0] + 0.6); sfx('blip', T('a5', '工具调用') - 0.3, { g: 0.5, p: 0.5 });
  const gCallLn = path(ov, 'M 1203 222 L 1172 222 L 1172 452', 'dim', { w: 3, dashed: '6 8', arrow: false });
  during(gCallLn, T('a5', '工具调用') - 0.3, back[0] + 0.6);
  // Harness 读出的文件
  hub(exec[0] + 0.5, arrive[1], (g) => {
    line(g, 'hub-k', tr('Harness 读出 cart.py', 'Harness reads cart.py'), 40);
    const code = h('div', 'abs card-p', g); px(code, 40, 100, 440); code.style.boxSizing = 'border-box';
    code.innerHTML = D.cart_before.split('\n').map((l) => `<div class="mono" style="font:500 24px Mono,'Sans SC';white-space:pre;line-height:40px">${esc(l)}</div>`).join('');
    line(g, 'dim', tr('还有 test_cart.py，一起放回对话', '+ test_cart.py, both put back'), 290, '500 28px "Sans SC"');
  });
  // 第 2–5 次请求：发出的条数
  const sentHub = (i, t1) => hub(send[i], t1, (g) => {
    line(g, 'hub-k', tr(`第 ${i + 1} 次请求`, `Request ${i + 1}`), 40);
    const n = line(g, 'paper', `${R0[i].sent}<span style="font:700 48px 'Sans SC';margin-left:12px">${tr('条', 'msgs')}</span>`, 100, '800 150px Mono');
    line(g, 'dim', tr('整段对话，一条不少', 'the whole conversation'), 290, '500 28px "Sans SC"');
    return n;
  });
  sentHub(1, reply[1] + 0.5);
  hub(reply[1] + 0.5, exec[1] + 0.4, (g) => {
    line(g, 'hub-k', tr('模型回的', 'The model replies'), 60);
    line(g, 'callx', R0[1].calls[0].name, 130, '800 60px Mono');
    line(g, 'argx', '{}', 214, '600 34px Mono');
  });
  const resultCard = (g, lines) => {
    const c = h('div', 'abs card-p', g); px(c, 40, 90, 440); c.style.boxSizing = 'border-box';
    c.innerHTML = lines.map(([cls, html, font]) => `<div class="${cls}" style="font:${font.replace(/"/g, "'")};white-space:pre">${html}</div>`).join('');
    return c;
  };
  hub(exec[1] + 0.4, send[2], (g) => {
    line(g, 'hub-k', tr('Harness 跑测试的结果', 'Harness runs the tests'), 30);
    const [code, msg] = R0[1].results[0].split('\n');
    const card = resultCard(g, [['dimp mono', esc(code), '600 26px Mono'], ['ink', tr('失败', 'FAIL'), '900 40px "Sans SC"'], ['ink mono', 'total([3, 5, 2])', '700 34px Mono'],
      ['ink', `${tr('应为', 'expected')} <b>10</b>${tr('，实际得到', ', got')} <b class="seven" style="background:var(--ink);color:var(--ac);padding:0 12px;display:inline-block">7</b>`, '500 34px "Sans SC"']]);
    const sum = h('div', 'abs', g, `<span class="mono" style="font:700 34px Mono">3 + 5 + 2 = </span><span class="mono paper" style="font:800 40px Mono">10</span>`); px(sum, 40, 330, 440); css(sum, { textAlign: 'center' });
    wipe(sum, T('l3', '加') - 0.2, { dir: 'l', d: 0.6 });
    slam(card.querySelector('.seven'), Q(T('l3', '实际')), { from: 2, d: 0.4 });
  });
  sentHub(2, T('l4', '找到') - 0.2);
  hub(T('l4', '找到') - 0.2, reply[2] + 0.5, (g) => {
    line(g, 'hub-k', tr('模型回的', 'The model replies'), 10);
    line(g, 'argx', tr('问题确认了：', 'Found it:'), 60, '500 30px "Sans SC"');
    line(g, 'argx', `<span class="ac">prices[1:]</span> ${tr('把第一件商品漏掉了', 'drops the first item')}`, 108, '500 30px Mono, "Sans SC"');
    line(g, 'dim', esc('（3+5+2=10，实际算成 5+2=7）'), 156, '500 28px Mono, "Sans SC"');
    const c = h('div', 'abs card-p', g); px(c, 30, 220, 460); c.style.boxSizing = 'border-box';
    c.innerHTML = `<div class="mono" style="font:600 26px Mono;white-space:pre">    return sum(prices<span style="border-bottom:6px solid var(--ac)">[1:]</span>)</div>`;
    const lab = line(g, 'dim', tr('cart.py 第 3 行', 'cart.py line 3'), 310, '500 26px "Sans SC"');
  });
  const edit = R0[2].calls[0];
  hub(reply[2] + 0.5, send[3], (g) => {
    line(g, 'hub-k', tr('模型回的', 'The model replies'), 10);
    line(g, 'callx', edit.name, 56, '800 52px Mono');
    const o = h('div', 'abs card-p', g); px(o, 40, 130, 440); o.style.boxSizing = 'border-box';
    o.innerHTML = `<div class="dimp" style="font:600 24px Mono">old</div><div class="mono ink" style="font:600 24px Mono;white-space:pre">${esc(edit.args.old)}</div>`;
    const n = h('div', 'abs', g); px(n, 40, 236, 440); css(n, { border: '3px solid var(--paper)', padding: '12px 26px', boxSizing: 'border-box' });
    n.innerHTML = `<div class="dim" style="font:600 24px Mono">new</div><div class="mono paper" style="font:600 24px Mono;white-space:pre">${esc(edit.args.new)}</div>`;
    const done = h('div', 'abs strikebar', o); px(done, 26, 66, 0, 6);
    fromTo(done, exec[2] + 0.4, { width: 0 }, { width: 360, duration: 0.4, ease: 'power2.out' });
  });
  sentHub(3, reply[3] + 0.4);
  hub(reply[3] + 0.4, exec[3] + 0.4, (g) => {
    line(g, 'hub-k', tr('模型回的', 'The model replies'), 60);
    line(g, 'callx', R0[3].calls[0].name, 130, '800 60px Mono');
    line(g, 'argx', '{}', 214, '600 34px Mono');
  });
  hub(exec[3] + 0.4, send[4], (g) => {
    line(g, 'hub-k', tr('Harness 跑测试的结果', 'Harness runs the tests'), 30);
    const [code, msg] = R0[3].results[0].split('\n');
    resultCard(g, [['dimp mono', esc(code), '600 26px Mono'], ['ink', tr('通过', 'PASS'), '900 40px "Sans SC"'], ['ink mono', esc('total([3, 5, 2]) = 10'), '700 30px Mono']]);
  });
  sfx('chime', exec[3] + 0.5, { g: 0.6 }); sfx('thud', Q(T('l3', '实际')), { g: 0.6 });
  sentHub(4, reply[4] + 0.3);
  const tStop = T('l7', '停下');
  hub(reply[4] + 0.3, T('l8') - 0.2, (g) => {
    line(g, 'hub-k', tr('模型回的', 'The model replies'), 0);
    const say = h('div', 'abs argx', g, esc(R0[4].say)); px(say, 30, 46, 460); css(say, { whiteSpace: 'normal', font: '500 28px "Sans SC", Mono', lineHeight: '1.45' });
    const no = line(g, 'dim', tr('没有工具调用', 'no tool call'), 236, '700 32px "Sans SC"');
    const stop = line(g, 'ink bg-ac', tr('循环停下', 'Loop stops'), 290, '900 48px "Sans SC"'); stop.style.padding = '4px 26px';
    wipe(no, T('l7', '没有') - 0.1, { dir: 'l', d: 0.35 });
    slam(stop, Q(tStop), { from: 1.3, d: 0.4 });
  });
  sfx('thud', Q(tStop));
  // 回顾：这一次一共几次请求、几次工具调用（数字取自实验）
  const nCalls = R0.reduce((a, r) => a + r.calls.length, 0);
  hub(T('l8') - 0.2, T('l9') - 0.15, (g) => {
    const a = line(g, 'paper', `5<span style="font:700 40px 'Sans SC';margin-left:12px">${tr('次请求', 'requests')}</span>`, 60, '800 110px Mono');
    const b = line(g, 'ac', `${nCalls}<span style="font:700 40px 'Sans SC';margin-left:12px;color:var(--paper)">${tr('次工具调用', 'tool calls')}</span>`, 200, '800 110px Mono');
  });
  // 回顾的三段：模型说（0→90）、Harness 做（90→270）、交回（270→360），沿环外再描一圈
  const RB = R + 48;
  const P = (deg) => { const a = deg / 180 * Math.PI - Math.PI / 2; return `${(cx + Math.cos(a) * RB).toFixed(1)} ${(cy + Math.sin(a) * RB).toFixed(1)}`; };
  const arcs = [[0, 90, T('l8', '说')], [90, 270, T('l8', '去做') - 0.1], [270, 359, T('l8', '交回') - 0.1]].map(([a, b, t0], i) => {
    const p = path(ov, `M ${P(a)} A ${RB} ${RB} 0 ${b - a > 180 ? 1 : 0} 1 ${P(b)}`, i === 1 ? 'ac' : 'paper', { w: 12, arrow: false });
    draw(p, t0, 0.6);
    F((t) => { const v = t >= t0 ? '' : 'none'; if (p.style.display !== v) p.style.display = v; });   // 描线之前整条藏起来（docs/reference/pitfalls.md）
    sfx('pop', t0, { g: 0.5, p: -0.3 });
    return p;
  });
  // 循环
  hub(T('l9') - 0.15, tEnd + 1, (g) => {
    const w = line(g, 'ac', tr('循环', 'Loop'), 60, '900 150px "Sans SC"');
    slam(w, Q(T('l9', '循环')), { from: 1.25, d: 0.4 });
    const gl = h('div', 'abs gloss', g, tr('<b>循环</b>：问 → 做 → 交回 → 再问，<br>直到回复里不再要工具', '<b>Loop</b>: ask, act, return, ask again'));
    px(gl, 40, 250, 440); css(gl, { textAlign: 'center' }); gl.dataset.gloss = tr('循环', 'loop');
    wipe(gl, T('l9', '循环') + 0.3, { dir: 'l', d: 0.4 });
  });
  sfx('thud', Q(T('l9', '循环')));
});

// loop 一场的画面全部建在上面的 ask 里（同一个环上接着走第 2–5 圈）；config.js 的 after() 不单独显示它
scene('loop', () => {});
