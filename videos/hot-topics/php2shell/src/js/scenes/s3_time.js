// 03 时间线。
// 主画面：一条横贯的时间轴。八月的发现与报告在左；十月二十日爆料起，一根红色引线一路烧到修复发布。
scene('time', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  screenGrid(world);
  const cam = makeCamera(world);
  const RY = 560;                                   // 时间轴的高度
  const rail = h('div', 'rail', world); px(rail, 160, RY, 7400);
  fromTo(rail, c0 + 0.1, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power2.inOut' });

  // 一个事件：轴上一个点，上方或下方一段说明
  const ev = (x, up, when, what, note, cls) => {
    const n = h('div', 'node' + (cls ? ' ' + cls : ''), world); px(n, x - 13, RY - 10);
    const e = h('div', 'ev', world, `<div class="when">${when}</div><div class="what">${what}</div>${note ? `<div class="note">${note}</div>` : ''}`);
    px(e, x - 30, up ? RY - 300 : RY + 70);
    return { n, e };
  };
  const enter = (o, t, up) => { appear(o.n, t); slide(o.e, t, { y: up ? -30 : 30, d: 0.4 }); };

  // 八月：发现与报告
  const T0 = DATA.timeline_bj;
  const aug1 = ev(300, true, T0[0][0].slice(5), 'Calif', tr('发现问题', 'finds the flaws'));
  const aug19 = ev(860, false, T0[2][0].slice(5), 'Wiz', tr('独立发现', 'finds them independently'));
  const aug11 = ev(580, true, T0[1][0].slice(5), tr('报告 PHP', 'reports to PHP'), 'Calif');
  const aug24 = ev(1140, false, T0[3][0].slice(5), tr('报告 PHP', 'reports to PHP'), 'Wiz');
  enter(aug1, T('c1', 'Calif'), true); sfx('pop', T('c1', 'Calif'), { p: -0.5 });
  enter(aug19, T('c1', 'Wiz'), false); sfx('pop', T('c1', 'Wiz'), { p: -0.3 });
  enter(aug11, T('c2', { zh: '报告', en: 'report' }), true); enter(aug24, T('c2', { zh: '报告', en: 'report' }, 0.15), false);
  sfx('tick', T('c2', { zh: '报告', en: 'report' }), { p: -0.4 });

  // 参与者：OpenAI 与「修补地球」；Wiz 用的模型
  const oai = h('div', 'card', world, `<div class="k">${tr('发现者之一', 'among the finders')}</div><div class="v">OpenAI</div><div class="k" style="margin-top:12px">${tr('「修补地球」计划', '“Patch the Planet”')}<br>Patch the Planet</div>`);
  px(oai, 1500, 180, 560, 300); oai.dataset.name = 'OpenAI';
  const models = h('div', 'card', world, `<div class="k">${tr('Wiz 说用了', 'Wiz says it used')}</div><div class="v php">Gemini 4 Argon<br>GPT-5.6 Sol</div>`);
  px(models, 1500, 640, 560, 230);
  slide(oai, T('c3', 'OpenAI'), { x: 60 }); sfx('pop', T('c3', 'OpenAI'));
  const ptp = oai.querySelectorAll('.k')[1];
  fromTo(ptp, T('c4', { zh: '修补', en: 'Patch' }, -0.2), { opacity: 0 }, { opacity: 1, duration: 0.3 }); sfx('tick', T('c4', { zh: '修补', en: 'Patch' }, -0.2));
  slide(models, T('c5', 'Gemini', -0.3), { x: 60 }); sfx('pop', T('c5', 'Gemini', -0.3), { p: 0.2 });

  // 两个月的保密修复
  const quiet = h('div', 'abs t-note', world, tr('约两个月 · 保密修复中', '≈ 2 months · fixed in secret')); px(quiet, 2500, RY - 70);
  const dash = h('div', 'abs mono dimc', world, '· · · · · · · · · · · · · · ·'); css(dash, { fontSize: '36px' }); px(dash, 2500, RY - 24);
  show(quiet, T('c8'), { y: 10 }); appear(dash, T('c8'));

  // 十月：爆料 → 证实 → 预告 → 临时防护 → 早期攻击 → 发布
  const xs = [3500, 4100, 4700, 5300, 5900, 6500];
  const leak = ev(xs[0], true, T0[4][0].slice(5), tr('Hacker News 爆料', 'Leaked on Hacker News'), tr('两个 PHP 远程执行漏洞即将公布', 'two PHP RCEs about to be disclosed'), 'red');
  const wt = ev(xs[1], false, tr('随即', 'soon after'), 'watchTowr', tr('证实：漏洞是真的', 'confirms: they are real'));
  const note = ev(xs[2], true, T0[5][0].slice(5), tr('PHP 发出预告', 'PHP pre-announces'), tr('次日发布修复', 'fix due next day'));
  const cf = ev(xs[3], false, T0[6][0].slice(5), 'Cloudflare', tr('补丁前先上临时防护', 'stopgap rules before the patch'));
  const atk = ev(xs[4], true, T0[7][0].slice(5), tr('看到早期攻击', '“early attacks”'), tr('Cloudflare 技术负责人', 'Cloudflare CTO'), 'red');
  const rel = ev(xs[5], false, T0[8][0].slice(5), tr('修复版本发布', 'Fixed releases out'), DATA.fixed.join(' · '));
  css(rel.e, { width: '760px' });
  const tLeak = T('c8', { zh: '爆料', en: 'leaked' }, -0.5);
  enter(leak, tLeak, true); sfx('error', tLeak);
  enter(wt, T('c9', 'watchTowr'), false); sfx('pop', T('c9', 'watchTowr'));
  enter(note, T('c10'), true); sfx('tick', T('c10') + 0.1);
  enter(cf, T('c11', 'Cloudflare'), false); sfx('pop', T('c11', 'Cloudflare'));
  enter(atk, T('c12', { zh: '攻击', en: 'attacks' }, -0.3), true); sfx('error', T('c12', { zh: '攻击', en: 'attacks' }, -0.3), { g: 0.7 });
  const tRel = T('c13', { zh: '修复', en: 'fixed' }, -0.2);
  enter(rel, tRel, false); sfx('chime', tRel);

  // 引线：从爆料一路烧到发布
  const fuse = h('div', 'fuse', world); px(fuse, xs[0], RY, xs[5] - xs[0]); fuse.dataset.name = '引线';
  fromTo(fuse, tLeak, { scaleX: 0 }, { scaleX: 1, duration: tRel - tLeak, ease: 'none' });

  // 镜头：八月 → 参与者 → 沿引线跟拍 → 发布
  const tOct = Tend('c5') + 0.1;
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { x: 1100, z: 1.16 }, T('c3', 'OpenAI') - c0 - 0.5, { ease: 'none', sfx: false }],
    [T('c3', 'OpenAI') - 0.4, { x: 1400, y: 540, z: 1 }, 0.8, { sfx: false }],
    [null, { x: 1500, z: 1.05 }, Tend('c5') - T('c3', 'OpenAI') - 0.7, { ease: 'none', sfx: false }],
    [tOct, { x: 3000, z: 1 }, 1.0],
    [null, { x: 3500 }, tLeak + 0.4 - (tOct + 1.15), { ease: 'none', sfx: false }],
    [tLeak + 0.4, { x: 5700 }, tRel - tLeak - 0.4, { ease: 'none', sfx: false }],
    [tRel + 0.1, { x: 5900, z: 0.8 }, 0.8, { sfx: false }],
    [null, { z: 0.84 }, s.end - tRel - 1.1, { ease: 'none', sfx: false }],
  ]);
});
