// 片尾名单：版式取官网页脚（#17222B 深底、白色字标）。整页向上滚：导航条滚出画面，页脚升上来。
// 名字只取自 project.json 的 credits（docs/roles.md 第 5 节），这里不手写任何名字；check.js --final 核对画面上的名单与它一致。名单不配旁白。
scene('credits', ({ root, s }) => {
  const Cr = (window.PROJECT && window.PROJECT.credits) || {};
  const label = (x) => (x && typeof x === 'object' ? x[LANG] || x.zh : x);
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const foot = blk(world, 'dark', '', 0, 0, 1920, 1080); foot.dataset.name = '页脚';
  const brand = blk(foot, '', '<img src="img/fb-mark.png" style="height:96px;margin-right:24px"><img src="img/fb-word-white.png" style="height:58px">', 120, 120, 900, 110, { display: 'flex', alignItems: 'center' });
  const rule = blk(foot, '', '', 120, 270, 1680, 0, { borderTop: '2px dashed ' + C.g4 });
  const rows = [['策划', Cr.planner || '']];
  for (const m of [...(Cr.models || []), ...(Cr.services || [])]) rows.push([(m.roles || []).map(label).join(' · '), m.name]);
  const repo = String(Cr.repository || '').replace(/^https:\/\//, '').replace(/\/$/, '');
  const els = rows.map(([k, v], i) => {
    const col = i % 2, r = Math.floor(i / 2);
    const e = h('div', 'abs', foot); px(e, 120 + col * 860, 320 + r * 160);
    e.innerHTML = `<div style="font-size:30px;color:#B9BCBF;white-space:nowrap">${esc(k)}</div><div class="lat" style="font-size:46px;font-weight:500;color:#FFFFFF;white-space:nowrap;margin-top:6px">${esc(v)}</div>`;
    return e;
  });
  const oss = h('div', 'abs', foot); px(oss, 120, 320 + Math.ceil(rows.length / 2) * 160 + 20);
  oss.innerHTML = `<div style="font-size:30px;color:#B9BCBF">开源视频</div><div class="lat" style="font-size:46px;font-weight:500;color:#FFFFFF;margin-top:6px">${esc(repo)}</div>`;
  // 页面上滚：导航条与页脚一起移动
  const t0 = s.start;
  tl.fromTo(foot, { y: 1080 }, { y: 0, duration: 1.1, ease: 'power3.inOut', immediateRender: true }, t0 + 0.05);
  const bar = document.getElementById('bar');
  if (bar) tl.fromTo(bar, { y: 0 }, { y: -120, duration: 0.9, ease: 'power3.inOut', immediateRender: false }, t0 + 0.05);
  sfx('whoosh', t0 + 0.05, { g: 0.35 });
  wipe(brand, t0 + 0.9, { dir: 'l', d: 0.45 }); wipe(rule, t0 + 1.1, { dir: 'l', d: 0.6 }); sfx('pop', t0 + 1.0, { g: 0.45 });
  els.forEach((e, i) => { wipe(e, t0 + 1.6 + i * 0.35, { dir: 'l', d: 0.45 }); sfx('tick', t0 + 1.65 + i * 0.35, { g: 0.35, p: i % 2 ? 0.4 : -0.4 }); });
  const tRepo = t0 + 1.6 + els.length * 0.35 + 0.5;
  wipe(oss, tRepo, { dir: 'l', d: 0.5 }); sfx('pop', tRepo + 0.1, { g: 0.5 });
  // 结尾：仓库地址下划一道青线（官网链接的悬停色）
  const ul = blk(foot, '', '', 120, parseFloat(oss.style.top) + 112, 640, 5, { background: C.teal });
  const tUl = Math.min(s.end - 3.5, tRepo + 5.0);
  wipe(ul, tUl, { dir: 'l', d: 0.8 }); sfx('tick', tUl + 0.1, { g: 0.45 });
  cam.track(s.start, { x: 960, y: 540, z: 1 }, [[s.start + 1.2, { z: 1.02 }, s.end - s.start - 1.3, { ease: 'none', sfx: false }]]);
});
