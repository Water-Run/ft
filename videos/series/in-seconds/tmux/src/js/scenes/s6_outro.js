// 片尾：机架铭牌上的名单。策划、参与模型与分工、开源视频地址。不配旁白（F14）。
scene('outro', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world, 1920, VH);
  const ZH = LANG === 'zh';
  const t0 = s.start + 0.2;
  const plate = panel(world, 'cream', 40, 30, 1840, 900, { screws: 18, name: 'credits plate' });
  appear(plate, s.start);
  // 左上：主题词
  const win = blk(world, C.black, 100, 130, 540, 300); win.dataset.name = 'title window';
  const tm = txt(win, 'vt green', 'TMUX', 40, 20); tm.style.fontSize = '230px';
  const sum = txt(world, 'zh-b ink', tr('程序住在 server 里', 'The program lives in the server'), 100, 452);
  sum.style.fontSize = ZH ? '44px' : '34px';
  swipe(win, t0, 't', 0.42); sfx('thud', t0 + 0.1, { g: 0.7, p: -0.4 });
  swipe(sum, t0 + 0.3, 'l', 0.33);
  // 右：名单
  const X = 720, rows = [];
  const lab = (text, y) => { const e = txt(world, 'lab', text, X, y); css(e, { fontSize: '26px', color: '#5C5747' }); if (ZH) e.style.fontFamily = '"Sans SC", "Mono"'; rows.push(e); return e; };
  const line = (html, y, size, cls = 'ink') => { const e = txt(world, 'zh-b ' + cls, html, X, y); e.style.fontSize = size + 'px'; rows.push(e); return e; };
  lab(tr('策划', 'PLANNING'), 120);
  line('WaterRun', 156, 44);
  lab(tr('参与模型与分工', 'MODELS AND ROLES'), 238);
  const M = [
    ['DeepSeek V4.1 Flash 1017', tr('事实测绘、tmux 3.4 实验、视觉方向', 'fact mapping, tmux 3.4 lab, visual direction')],
    ['Grok 4.7', tr('第 1–4 轮旁白草稿', 'narration drafts, rounds 1–4')],
    ['Claude Opus 5.5', tr('第 5 轮旁白、动画、配音与成片', 'round-5 narration, animation, voice and final cut')],
    ['MiniMax speech-2.8-hd', tr('中英文旁白语音合成', 'zh / en narration voice')],
  ];
  M.forEach(([m, r], i) => {
    const y = 274 + i * 90;
    const a = line(m, y, 34); a.style.fontFamily = '"Inter", "Sans SC"'; a.style.fontWeight = '800';
    const b = line(r, y + 42, 28); b.style.fontWeight = '500';
  });
  // 底部：开源视频地址
  const band = blk(world, C.black, 100, 650, 1720, 200); band.dataset.name = 'repo band';
  const ol = tag(band, tr('开源视频', 'OPEN-SOURCE VIDEO'), 34, 26, { zh: ZH, size: 30 });
  const url = txt(band, 'mono green', 'https://github.com/Water-Run/ft', 34, 92); css(url, { fontSize: '72px', fontWeight: 700 });
  rows.forEach((e, i) => swipe(e, t0 + 0.35 + i * 0.07, 'l', 0.33));
  for (let i = 0; i < 4; i++) sfx('tick', t0 + 0.35 + i * 0.21, { g: 0.5, p: 0.4 });
  swipe(band, t0 + 1.2, 'l', 0.42); sfx('drive', t0 + 1.2, { g: 0.5 }); sfx('chime', t0 + 1.7, { g: 0.5 });
  cam.track(s.start, { x: 960, y: 484, z: 1 }, [[s.start + 0.1, { z: 1.02 }, s.end - s.start - 0.2, { ease: 'none', sfx: false }]]);
});
