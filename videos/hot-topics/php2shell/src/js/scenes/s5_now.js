// 05 现在该怎么办。
// 主画面：一张版本表——绿色是正式修复，琥珀色是最小源码补丁，红色是没有补丁；
// 接着一根按版本分段的占比条；最后是截止时间的大印章。
scene('now', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  screenGrid(world);
  const cam = makeCamera(world);

  // 第一站：版本表
  const head = h('div', 'abs d-3', world, tr('现在就升级', 'Update now')); px(head, 160, 150);
  slam(head, T('e1') + 0.1, { from: 1.2 }); sfx('thud', T('e1') + 0.15);
  const rows = [
    [DATA.fixed.join('  '), 'green', tr('正式修复', 'fixed releases'), 'e2'],
    [DATA.backport_src.join('  '), 'amber', tr('只有最小源码补丁', 'minimal source patches only'), 'e3a'],
    ['5.x', 'red', tr('没有任何官方补丁', 'no official patch'), 'e3b'],
  ];
  rows.forEach(([v, cls, st, id], i) => {
    const r = h('div', 'vrow', world, `<span class="${cls}">${v}</span><span class="st ${cls}">${st}</span>`); px(r, 160, 300 + i * 120);
    r.dataset.name = '版本 ' + st;
    slide(r, T(id) + 0.1, { x: -60 }); sfx(i === 0 ? 'chime' : i === 1 ? 'tick' : 'error', T(id) + 0.1, { g: i === 0 ? 0.6 : 0.8 });
  });

  // 第二站：仍在旧版本上的网站
  const Y = 1300, W = 1560;
  const m = DATA.php_major_share;
  const segs = [['8', m['8'], 'var(--php)'], ['7', m['7'], 'var(--amber)'], ['5', m['5'], 'var(--red)']];
  let x = 160;
  const bars = segs.map(([k, v, c]) => {
    const b = h('div', 'vbar', world); px(b, x, Y + 300, W * v / 100); css(b, { background: c });
    const lb = h('div', 'abs mono', world, `PHP ${k} · ${v}%`); css(lb, { fontSize: '34px', fontWeight: 700, color: c });
    px(lb, k === '5' ? x + W * v / 100 - 250 : x, Y + 240); b._lb = lb; x += W * v / 100; return b;
  });
  const barNote = h('div', 'abs t-note', world, tr('用 PHP 的网站里各大版本的占比 · W3Techs · 2026-10-21', 'Share of PHP sites by major version · W3Techs · 21 Oct 2026')); px(barNote, 160, Y + 400);
  const old = h('div', 'abs d-1 amber', world, `${DATA.old_share}%`); px(old, 160, Y + 470);
  const oldNote = h('div', 'abs t-body', world, tr('还停在 PHP 7 和 PHP 5', 'still on PHP 7 or PHP 5')); px(oldNote, 760, Y + 520);
  const sub = h('div', 'abs mono', world, `7.4 ≈ ${DATA.sub_of_all['7.4']}%   5.6 ≈ ${DATA.sub_of_all['5.6']}%   5.3 ≈ ${DATA.sub_of_all['5.3']}%`); css(sub, { fontSize: '44px' }); px(sub, 160, Y + 680);
  const eol = h('div', 'abs t-note', world, tr(`停止维护：7.4 于 ${DATA.eol['7.4']} · 5.6 于 ${DATA.eol['5.6']} · 5.3 于 ${DATA.eol['5.3']}`, `End of life: 7.4 ${DATA.eol['7.4']} · 5.6 ${DATA.eol['5.6']} · 5.3 ${DATA.eol['5.3']}`)); px(eol, 160, Y + 760);
  const toBars = Tend('e3b') + 0.15;
  bars.forEach((b, i) => { fromTo(b, T('e3c') + i * 0.15, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power3.out' }); show(b._lb, T('e3c') + i * 0.15 + 0.2, { y: 10 }); });
  sfx('whoosh', T('e3c'), { g: 0.4 });
  show(barNote, T('e3c') + 0.3, { y: 10 });
  slam(old, T('e3c', { zh: '三分之一', en: 'third' }, -0.2), { from: 1.4 }); sfx('thud', T('e3c', { zh: '三分之一', en: 'third' }, -0.15));
  show(oldNote, T('e3c', { zh: '停在', en: 'stuck' }), { x: -20 });
  wipe(sub, T('e3d'), { dir: 'l', d: 0.5 }); sfx('tick', T('e3d'));
  show(eol, T('e3d', { zh: '停止维护', en: 'support' }), { y: 10 });
  const tip = h('div', 'abs t-body', world, tr('升级，或找发行版 / 长期支持厂商的补丁', 'Upgrade, or get patches from your distro / LTS vendor')); px(tip, 160, Y + 850);
  slide(tip, T('e4'), { y: 20 }); sfx('pop', T('e4'));

  // 第三站：唯一安全的选择；不只 PHP；截止时间
  const X = 2000;
  const only = h('div', 'abs d-2', world, tr('更新是<span class="red">唯一</span>安全的选择', 'Updating is the <span class="red">only</span> safe choice')); px(only, X + 160, 200);
  const onlyNote = h('div', 'abs t-note', world, tr('PHP 官方安全公告 · 2026-10-21', 'PHP security advisory · 21 Oct 2026')); px(onlyNote, X + 170, 320);
  const node = h('div', 'card', world, `<div class="k">Node.js · 10-21</div><div class="v" style="font-size:38px">${tr('安全更新 · 含可致远程代码执行的高危问题', 'security release · incl. a high-severity RCE')}</div>`); px(node, X + 160, 430, 1500, 160);
  const go = h('div', 'card', world, `<div class="k">Go · 10-19</div><div class="v" style="font-size:38px">${tr('安全修复', 'security fixes')}</div>`); px(go, X + 160, 620, 1500, 160);
  const toOnly = Tend('e4') + 0.15;
  wipe(only, toOnly + 0.15, { dir: 'l', d: 0.45 }); sfx('thud', T('e6', { zh: '唯一', en: 'only' }, -0.1));
  const ul = h('div', 'abs', world); css(ul, { background: 'var(--red)', height: '10px' }); px(ul, X + 160, 306, 980);
  fromTo(ul, T('e6', { zh: '唯一', en: 'only' }, -0.1), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.4, ease: 'power3.out' });
  show(onlyNote, T('e6', { zh: '唯一', en: 'only' }), { y: 10 });
  slide(node, T('e6a', 'Node'), { x: -60 }); sfx('pop', T('e6a', 'Node'));
  slide(go, T('e6c', 'Go'), { x: -60 }); sfx('pop', T('e6c', 'Go'));
  const Y2 = 1300;
  const cut = h('div', 'abs stamp amber', world, tr(`信息截至 北京时间 ${DATA.cutoff_bj}`, `As of ${DATA.cutoff_bj} UTC+8`)); css(cut, { fontSize: '64px', padding: '14px 34px' }); px(cut, X + 160, Y2 + 300);
  cut.dataset.name = '截止时间';
  const cutNote = h('div', 'abs t-body', world, tr('事件还在发展 · 以 PHP 官方公告为准', 'Still developing · follow PHP’s official advisories')); px(cutNote, X + 170, Y2 + 470);
  const url = h('div', 'abs mono php', world, 'php.net/archive/2026.php'); css(url, { fontSize: '40px' }); px(url, X + 170, Y2 + 560);
  const toCut = Tend('e6c') + 0.15;
  slam(cut, T('e7') + 0.1, { from: 1.4 }); sfx('thud', T('e7') + 0.15);
  show(cutNote, T('e8'), { y: 14 }); show(url, T('e8', { zh: '官方', en: 'official' }), { y: 10 }); sfx('tick', T('e8', { zh: '官方', en: 'official' }));

  cam.track(s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { x: 1020, z: 1.12 }, toBars - c0 - 0.2, { ease: 'none', sfx: false }],
    [toBars, { y: Y + 520, z: 1 }, 0.9],
    [null, { z: 1.03 }, toOnly - toBars - 1.1, { ease: 'none', sfx: false }],
    [toOnly, { x: X + 960, y: 540, z: 1 }, 1.0],
    [null, { z: 1.03 }, toCut - toOnly - 1.2, { ease: 'none', sfx: false }],
    [toCut, { y: Y2 + 460, z: 1.05 }, 0.9],
    [null, { z: 1.09 }, s.end - toCut - 1.1, { ease: 'none', sfx: false }],
  ]);
});
