/* 分镜的共用部件（方向 A「桶阵」）。每个分镜文件用 frame({...}, draw) 登记一帧：
     frame({ id: 'b-2', ch: '02 增', cues: 'b6–b10', title: '27 个字节', note: '这一帧让观众看懂什么' }, () => { ... });
   storyboard.html?f=<id> 画出这一帧；?list=1 把全部帧的登记信息写成 JSON 放在 <pre id="list">（审片页据此排版）。
   画面上的数字一律取自 window.DATA（tools/gen_data.py 由回显生成）。不用阴影、渐变（flat）。 */
(function () {
  const FRAMES = [];
  const S = () => document.getElementById('stage');
  const h = (html) => { S().insertAdjacentHTML('beforeend', html); return S().lastElementChild; };
  const css = (o) => Object.entries(o || {}).map(([k, v]) => `${k}:${v}`).join(';');
  const SB = {
    FRAMES, h,
    C: { midnight: '#091a23', dusk: '#163341', dusk9: '#0d212c', dusk90: '#2d4754', dusk70: '#5c707a', dusk50: '#8a99a0', dusk30: '#b9c2c6', dusk10: '#d9d9d9', red: '#ff4438', redDeep: '#8a221c', redSoft: '#fd736a', sky: '#80dbff', yellow: '#dcff1e', violet: '#c795e3', white: '#fff' },
    // 桶里键数 0…6 的颜色（越亮键越多）
    SHADE: ['#0f2530', '#2d4754', '#5c707a', '#8a99a0', '#b9c2c6', '#d9d9d9', '#ffffff'],
    box(x, y, w, hh, style = '', inner = '', cls = '') { return h(`<div class="abs ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${hh}px;${style}">${inner}</div>`); },
    txt(x, y, s, style = '', cls = '') { return h(`<div class="abs ${cls}" style="left:${x}px;top:${y}px;${style}">${s}</div>`); },
    crumb(ch, sec) { return h(`<div class="crumb"><b>${ch}</b>${sec ? ' · ' + sec : ''}</div>`); },
    sub(s) { return h(`<div class="sub">${s}</div>`); },
    gloss(x, y, w, word, def) { return h(`<div class="gloss" style="left:${x}px;top:${y}px;width:${w}px"><b>${word}</b>${def}</div>`); },
    term(x, y, w, hh, lines) { return h(`<div class="term" style="left:${x}px;top:${y}px;width:${w}px;height:${hh}px">${lines}</div>`); },
    prompt: '<span class="p">127.0.0.1:6379&gt;</span> ',
    tag(x, y, s, bg, fg = '#fff', extra = '') { return h(`<div class="tag" style="left:${x}px;top:${y}px;background:${bg};color:${fg};${extra}">${s}</div>`); },
    res(x, y, s, kind = 'red') { return h(`<div class="res ${kind}" style="left:${x}px;top:${y}px">${s}</div>`); },
    chapter(no, ti, q) { return h(`<div class="chap"><div class="no">${no}</div><div class="ti">${ti}</div><div class="q">${q}</div></div>`); },
    svg(inner) { return h(`<svg class="abs" style="left:0;top:0;pointer-events:none" width="1920" height="1080">${inner}</svg>`); },
    line(x1, y1, x2, y2, color = '#ff4438', w = 3, dash = '') { return SB.svg(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`); },
    path(d, color = '#ff4438', w = 3, dash = '') { return SB.svg(`<path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`); },
    // 8192 个桶按真实桶号排成 cols 列（缺省 128 × 64）；opt.mark = {桶号: 颜色}，opt.dim = 0..1 整体变暗，opt.upto = 只画前 n 个桶
    buckets(x, y, cell, gap, opt = {}) {
      const B = DATA.buckets, cols = opt.cols || 128, n = opt.upto || B.size, rows = Math.ceil(n / cols);
      const w = cols * (cell + gap) - gap, hh = rows * (cell + gap) - gap;
      const cv = h(`<canvas class="abs" width="${w}" height="${hh}" style="left:${x}px;top:${y}px;${opt.dim ? `opacity:${1 - opt.dim}` : ''}"></canvas>`);
      const c = cv.getContext('2d');
      for (let i = 0; i < n; i++) {
        const k = opt.empty ? 0 : +B.counts[i];
        c.fillStyle = (opt.mark && opt.mark[i]) || (opt.color ? opt.color(i, k) : SB.SHADE[Math.min(k, 6)]);
        c.fillRect((i % cols) * (cell + gap), Math.floor(i / cols) * (cell + gap), cell, cell);
      }
      return { w, hh, at: (i) => [x + (i % cols) * (cell + gap) + cell / 2, y + Math.floor(i / cols) * (cell + gap) + cell / 2] };
    },
    // Alice 的 27 字节；colors 按段（总长、项数、name、Alice、age、42、结束）
    LP: () => DATA.listpack.hex.match(/../g),
    lpRow(x, y, opt = {}) {
      const seg = DATA.listpack.parts, sz = opt.size || 52, cols = opt.colors || ['#2d4754', '#2d4754', '#163341', '#8a221c', '#163341', '#8a221c', '#2d4754'];
      const bytes = opt.bytes || SB.LP();
      let html = '';
      bytes.forEach((b, i) => {
        const k = seg.findIndex((p) => i >= p.from && i < p.from + p.len), p = seg[k];
        const hi = opt.hi && opt.hi.includes(i);
        html += `<span class="byte" style="width:${sz}px;background:${hi ? '#ff4438' : cols[k]};color:${hi ? '#091a23' : '#fff'};margin-right:${i === p.from + p.len - 1 ? 8 : 2}px">${b}</span>`;
      });
      SB.txt(x, y, html, 'white-space:nowrap');
      if (opt.labels !== false) { let cx = x; seg.forEach((p) => { const w = p.len * (sz + 2) + 6; SB.txt(cx, y + 66, p.what, `width:${w}px;font-size:26px;color:#b9c2c6;white-space:nowrap`); cx += w; }); }
      return 27 * (sz + 2) + 6 * 7;
    },
    // 七个引擎（终章、片名卡用）
    ENGINES: ['MyISAM', 'InnoDB', 'PostgreSQL', 'SQLite', 'ClickHouse', 'MongoDB', 'Redis'],
  };
  window.SB = SB;
  window.frame = (meta, draw) => FRAMES.push({ ...meta, draw });
  SB.run = () => {
    const q = new URLSearchParams(location.search);
    if (q.get('list')) {
      document.body.style.overflow = 'auto';
      h(`<pre id="list" style="color:#fff;font:14px Mono;white-space:pre-wrap">${JSON.stringify(FRAMES.map(({ draw, ...m }) => m), null, 1).replace(/</g, '&lt;')}</pre>`);
    } else {
      const f = FRAMES.find((x) => x.id === q.get('f')) || FRAMES[0];
      if (f) f.draw();
    }
    document.fonts.ready.then(() => { document.body.dataset.ready = '1'; });
  };
})();
