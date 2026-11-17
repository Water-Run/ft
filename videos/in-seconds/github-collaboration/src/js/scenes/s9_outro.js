// 片尾名单。名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；check.js --final 核对画面上的名单与它一致。名单不配旁白。
// 版式：左边是全片走过的几步（到合并为止），右边是一张 Primer 的「名单」框。全长 4 秒（策划者 2026-11-17「字幕表3-5s即可」）。
scene('outro', ({ root, s }) => {
  const P = window.PROJECT || {}, C0 = P.credits || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const t0 = s.start + 0.3;

  const steps = el(world, '', `<div class="title-xl" style="font-size:88px">GitHub 协作</div>
      <div class="row" style="gap:20px;margin-top:40px;font-size:30px"><span class="btn">${oct('repo-forked', 28)}Fork</span>${oct('arrow-right', 30, C.muted)}<span class="btn">${oct('git-branch', 28)}分支</span>${oct('arrow-right', 30, C.muted)}<span class="btn green">${oct('git-pull-request', 28, '#fff')}PR</span>${oct('arrow-right', 30, C.muted)}<span class="btn purple">${oct('git-merge', 28, '#fff')}合并</span></div>`, 120, 220);
  fadeIn(steps, t0, { y: 20, d: 0.5 }); sfx('thud', t0, { g: 0.6, p: -0.3 });

  const rows = [[tr('策划', 'Planning'), C0.planner || '']];
  for (const m of [...(C0.models || []), ...(C0.services || [])]) rows.push([(m.roles || []).map(label).join(' · '), m.name]);
  rows.push([tr('开源视频', 'Open-source video') + ' · ' + (P.license || 'GPL-3.0-or-later'), String(C0.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '')]);
  const list = el(world, 'box', `<div class="boxh">${oct('person', 26, C.muted)}<b>制作</b></div>` + rows.map(([k, v], i) => `<div class="cr" style="padding:16px 26px;${i ? 'border-top:2px solid var(--bd);' : ''}white-space:normal">
      <div class="credit-k">${esc(k)}</div><div class="credit-v ${i === rows.length - 1 ? 'mono' : ''}" style="${i === rows.length - 1 ? 'color:var(--accent);font-size:34px' : v.length > 24 ? 'font-size:32px' : ''}">${esc(v)}</div></div>`).join(''), 1000, 150, 800);
  fadeIn(list, t0 + 0.15, { x: 24, y: 0, d: 0.5 });
  [...list.querySelectorAll('.cr')].forEach((r, i) => { fadeIn(r, t0 + 0.35 + i * 0.12, { y: 12, d: 0.35 }); sfx('tick', t0 + 0.35 + i * 0.12, { g: 0.5, p: 0.4 }); });

  const hold = s.end - s.start, dx = Math.min(16, 2 * hold);
  cam.track(s.start, { x: 960 + dx / 2, y: 484, z: 1 }, [[s.start + 0.05, { x: 960 - dx / 2 }, hold, { ease: 'none', sfx: false }]]);
});
