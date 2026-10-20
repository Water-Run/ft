// 开场：一条查询 → 它脚下的字节 → 存储引擎 → 标题
// users_big 的行由建表时的公式生成，这里按同一公式还原字节（与真实文件一致，见 research/FACTS.md）
function bigRowHex(i) {
  const le = (v) => [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255];
  const name = ('u' + String((i * 7919) % 1000003).padStart(6, '0')).padEnd(10, ' ');
  const b = [0xff, ...le(i), ...[...name].map((c) => c.charCodeAt(0)), 18 + (i * 31) % 60];
  return b.map((v) => v.toString(16).padStart(2, '0')).join('');
}

scene('intro', ({ root, s, c0 }) => {
  const st = document.createElement('style');
  st.textContent = `
  .floor { position:absolute; left:0; top:470px; width:1920px; height:640px; perspective:1500px; perspective-origin:50% -30%; overflow:hidden;
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.5) 14%, #000 36%, #000 66%, rgba(0,0,0,.25) 84%, transparent 96%); }
  .plane { position:absolute; left:-420px; top:30px; width:2760px; transform-origin:50% 0; transform: rotateX(60deg); }
  .plane-in { position:relative; }
  .prow { display:flex; justify-content:center; gap:46px; height:56px; align-items:center; font-family:var(--mono); font-size:27px; color:#2f6170; letter-spacing:.02em; white-space:pre; }
  .prec { padding:4px 12px; border-radius:6px; }
  .sweep { position:absolute; left:0; right:0; height:260px; background:linear-gradient(to bottom, transparent, rgba(70,203,230,.20) 50%, transparent); }
  .eng-band { position:absolute; left:260px; width:1400px; top:508px; height:1px; }
  .eng-line { position:absolute; left:0; right:0; top:0; height:1px; background:linear-gradient(90deg, transparent, var(--blue-hi) 18%, var(--orange) 50%, var(--blue-hi) 82%, transparent); box-shadow:0 0 24px rgba(25,169,201,.8); }
  .eng-label { position:absolute; left:50%; top:-31px; transform:translateX(-50%); padding:0 34px; height:62px; display:flex; align-items:center; gap:20px; background:#062430; border:1px solid rgba(242,145,17,.55); border-radius:31px; box-shadow:0 0 50px rgba(242,145,17,.22), 0 10px 40px rgba(0,0,0,.5); white-space:nowrap; }
  .eng-label b { font-size:32px; font-weight:500; letter-spacing:.2em; color:var(--text); }
  .eng-label span { font-family:var(--mono); font-size:19px; letter-spacing:.2em; color:var(--orange); }
  .ttl { position:absolute; left:0; right:0; top:262px; text-align:center; }
  .ttl-k { font-family:var(--mono); font-size:22px; letter-spacing:.34em; color:var(--blue-hi); }
  .ttl-main { margin-top:40px; font-family:var(--serif); font-weight:700; font-size:92px; letter-spacing:.07em; color:#f3f8f9; text-shadow:0 6px 50px rgba(0,117,143,.55); white-space:nowrap; }
  .ttl-main i { font-style:normal; display:inline-block; }
  .ttl-rule { margin:50px auto 0; width:150px; height:3px; background:var(--orange); transform-origin:50% 50%; }
  .ttl-sub { margin-top:44px; font-size:46px; font-weight:300; letter-spacing:.2em; color:var(--pale); }
  .ttl-sub b { font-family:var(--mono); font-weight:600; letter-spacing:.04em; color:var(--orange); margin:0 .12em; }
  .ttl-chips { position:absolute; left:0; right:0; top:706px; display:flex; justify-content:center; gap:22px; }
  .ttl-chips .pill { height:46px; font-family:var(--sans); font-size:22px; letter-spacing:.08em; padding:0 24px; color:var(--dim); }
  .ttl-chips .pill b { font-family:var(--mono); font-weight:500; color:var(--pale); margin:0 .3em; }
  `;
  root.appendChild(st);

  // ── 字节平面（“磁盘”）──
  const floor = h('div', 'floor', root);
  const plane = h('div', 'plane', floor);
  const pin = h('div', 'plane-in', plane);
  const users = REAL.usersMYD[0];
  const recHtml = (hex) => hex.match(/../g).join(' ');
  let erin = null;
  const ROWS = 34, HOT = 6;
  for (let r = 0; r < ROWS; r++) {
    const row = h('div', 'prow', pin);
    for (let c = 0; c < 5; c++) {
      let hex = bigRowHex(1 + r * 5 + c);
      if (r === HOT && c >= 1 && c <= 3) hex = users.substr((2 + c) * 32, 32);   // dave / erin / frank 的真实行
      const rec = h('span', 'prec', row, recHtml(hex));
      if (r === HOT && c === 2) erin = rec;
    }
  }
  const sweep = h('div', 'sweep', pin);
  F((t) => { pin.style.transform = `translateY(${(-(t - s.start) * 4).toFixed(2)}px)`; });

  // ── 终端 ──
  const term = terminal(root, { x: 430, y: 150, w: 1060, h: 500, title: 'mysql', right: 'localhost · 3306', fs: 30 });
  term.line('<span class="faint" style="font-size:22px">Server version: 5.5.62 MySQL Community Server (GPL)</span>');
  term.line('');
  const tCmd = T('h1') - 0.45;
  term.cmd('<span class="k">SELECT</span> * <span class="k">FROM</span> users <span class="k">WHERE</span> id = 5;', tCmd, 30, { appearAt: c0 + 0.1, cursorUntil: T('h1', '一行') - 0.05 });
  const tRes = T('h1', '一行') - 0.05;
  const tb = asciiTable(['id', 'name', 'age'], [[5, 'erin', 33]], [1, 0, 1]);
  const els = term.out(tb.map(esc), tRes);
  const foot = term.line('1 row in set <span id="i-sec">(0.00 sec)</span>', 'o');
  fromTo(foot, tRes + 0.2, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 });
  classAt(foot.querySelector('#i-sec'), 'hl', T('h1', '零点') - 0.1, T('h2') + 0.2);
  show(term.el, c0, { y: 30, d: 0.9 });

  // h2：镜头下沉，露出磁盘上的字节
  const tDive = T('h2') - 0.2;
  css(term.el, { transformOrigin: '50% 0%' });
  to(term.el, tDive, { scale: 0.7, y: -96, duration: 1.5, ease: 'power3.inOut' });
  fromTo(floor, tDive + 0.15, { autoAlpha: 0, y: 90 }, { autoAlpha: 1, y: 0, duration: 1.6, ease: 'power3.out' });

  // h3：扫描 → 定位到那一行
  fromTo(sweep, T('h3') - 0.1, { top: 1500, autoAlpha: 1 }, { top: -200, duration: 2.1, ease: 'power1.inOut' });
  const tHit = T('h3', '怎样') - 0.05;
  to(erin, tHit, { color: '#ffd9a0', backgroundColor: 'rgba(242,145,17,.26)', boxShadow: '0 0 0 2px rgba(242,145,17,.9), 0 0 60px rgba(242,145,17,.8)', duration: 0.5 });
  const resRow = els[3];
  to(resRow, tHit, { color: '#ffd9a0', duration: 0.5 });

  // h4：两者之间的那一层
  const band = h('div', 'eng-band', root);
  const eline = h('div', 'eng-line', band);
  const elabel = h('div', 'eng-label', band, '<b>存储引擎</b><span>STORAGE ENGINE</span>');
  const tEng = T('h4', '部件') - 0.1;
  fromTo(eline, tEng, { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 1.1, ease: 'power3.inOut' });
  fromTo(elabel, T('h4', '叫做') - 0.1, { autoAlpha: 0, scale: 0.9, y: 0 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(1.6)' });

  // 标题
  const tT = T('hT') - 0.25;
  hide(term.el, tT, { y: -60, d: 0.7 });
  hide(band, tT, { y: 0, d: 0.5 });
  to(floor, tT, { autoAlpha: 0.5, y: 215, duration: 1.4, ease: 'power2.inOut' });
  to(erin, tT, { color: '#2f6170', backgroundColor: 'rgba(242,145,17,0)', boxShadow: '0 0 0 0px rgba(242,145,17,0)', duration: 0.8 });

  const ttl = h('div', 'ttl', root);
  const k = h('div', 'ttl-k', ttl, 'HOW A STORAGE ENGINE WORKS');
  const main = h('div', 'ttl-main', ttl, [...'一个数据库引擎是如何实现的？'].map((ch) => `<i>${ch}</i>`).join(''));
  const rule = h('div', 'ttl-rule', ttl);
  const sub = h('div', 'ttl-sub', ttl, '从<b>MyISAM</b>说起');
  const t1 = tT + 0.55;
  sfx('riser', tT - 0.6); sfx('thud', t1 + 0.2); sfx('chime', t1 + 1.3, { g: 0.7 });
  sfx('whoosh', tDive, { g: 0.9 }); sfx('blip', tHit); sfx('pop', tEng + 0.6);
  fromTo(k, t1, { autoAlpha: 0, letterSpacing: '0.8em' }, { autoAlpha: 1, letterSpacing: '0.34em', duration: 1.3, ease: 'power3.out' });
  fromTo(main.children, t1 + 0.15, { autoAlpha: 0, y: 44, filter: 'blur(12px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.95, stagger: 0.055, ease: 'power3.out' });
  fromTo(rule, t1 + 1.0, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.inOut' });
  fromTo(sub, t1 + 1.25, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.9 });

  const chips = h('div', 'ttl-chips', root);
  const cs = ['始于<b>MySQL 3.23</b>', '<b>5.5</b>之前的默认引擎', '一张表<b>=</b>三个文件'].map((x) => h('span', 'pill', chips, x));
  fromTo(cs, T('h6') + 0.1, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.5 });
  // h7：字节亮起来
  to(floor, T('h7') - 0.1, { autoAlpha: 0.95, duration: 1.6, ease: 'power2.inOut' });
  to(ttl, s.end - 0.75, { y: -30, duration: 0.8, ease: 'power2.in' });
});
