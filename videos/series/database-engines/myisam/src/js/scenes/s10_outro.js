// 10 四个问题：回顾 MyISAM 的答案，对照后来的 InnoDB，回到三个文件
scene('s10', ({ root, s, c0 }) => {
  const st = document.createElement('style');
  st.textContent = `
  .o-h { position:absolute; left:96px; top:132px; font-family:var(--serif); font-weight:700; font-size:46px; letter-spacing:.1em; }
  .o-h small { font-family:var(--sans); font-weight:400; font-size:24px; letter-spacing:.1em; color:var(--dim); margin-left:26px; }
  .qc { position:absolute; top:236px; width:402px; height:436px; border-radius:18px; border:1px solid var(--line-2); background:linear-gradient(180deg, rgba(11,52,66,.72), rgba(5,28,37,.8)); box-shadow:0 34px 90px rgba(0,0,0,.45), 0 1px 0 rgba(255,255,255,.05) inset; padding:30px 30px; overflow:hidden; }
  .qc .no { font-family:var(--mono); font-size:20px; letter-spacing:.14em; color:var(--faint); }
  .qc .q { margin-top:10px; font-size:38px; font-weight:500; letter-spacing:.1em; }
  .qc .ans { margin-top:26px; padding-top:22px; border-top:1px solid var(--line); }
  .qc .who { font-family:var(--mono); font-size:19px; letter-spacing:.08em; color:var(--orange); }
  .qc .a { margin-top:8px; font-size:27px; letter-spacing:.06em; line-height:1.45; }
  .qc .ans2 { margin-top:22px; padding-top:20px; border-top:1px dashed var(--line-2); }
  .qc .ans2 .who { color:var(--cyan); }
  .qc .ans2 .a { color:var(--pale); font-size:25px; }
  .tlx { position:absolute; left:96px; top:740px; width:1728px; height:120px; }
  .tlx .ln { position:absolute; left:0; right:0; top:22px; height:2px; background:linear-gradient(90deg, var(--blue) 0%, var(--blue-hi) 60%, var(--orange) 100%); }
  .tlx .ev { position:absolute; top:0; }
  .tlx .ev i { display:block; width:14px; height:14px; margin-top:16px; background:var(--pale); transform:rotate(45deg); }
  .tlx .ev b { display:block; margin-top:18px; font-family:var(--mono); font-size:24px; font-weight:500; color:var(--text); white-space:nowrap; }
  .tlx .ev span { display:block; margin-top:4px; font-size:21px; letter-spacing:.06em; color:var(--dim); white-space:nowrap; }
  .three { position:absolute; left:0; right:0; top:330px; display:flex; justify-content:center; gap:120px; }
  .three div { text-align:center; }
  .three b { display:block; font-family:var(--mono); font-size:112px; font-weight:600; letter-spacing:-.01em; line-height:1; }
  .three span { display:block; margin-top:26px; font-size:30px; letter-spacing:.3em; color:var(--dim); }
  .endc { position:absolute; left:0; right:0; top:330px; text-align:center; }
  .endc .t1 { font-family:var(--serif); font-weight:700; font-size:78px; letter-spacing:.07em; color:#f3f8f9; text-shadow:0 6px 50px rgba(0,117,143,.55); }
  .endc .rl { margin:42px auto 0; width:150px; height:3px; background:var(--orange); }
  .endc .t2 { margin-top:36px; font-size:40px; font-weight:300; letter-spacing:.2em; color:var(--pale); }
  .endc .t2 b { font-family:var(--mono); font-weight:600; letter-spacing:.04em; color:var(--orange); margin:0 .12em; }
  .endc .t3 { margin-top:120px; font-size:22px; letter-spacing:.14em; color:var(--faint); }
  .black { position:absolute; inset:0; background:#020d12; }
  `;
  root.appendChild(st);

  const hd = h('div', 'o-h', root, '四个问题<small>每一个存储引擎都要回答</small>');
  show(hd, c0 + 0.1, { y: 16, d: 0.7 });
  const Q = [
    ['数据怎么放', '一个数据文件<br>一行接一行', '按主键组织的 B+ 树<br>16 KB 的页'],
    ['怎么找', 'B 树索引<br>键 → 行的位置', '二级索引 → 主键 → 行'],
    ['怎么并发', '一把表锁', '行级锁，多版本并发控制'],
    ['出错怎么办', '检查，然后修复', '事务日志，重启后自动恢复'],
  ];
  const cards = Q.map(([q, a, b], i) => {
    const c = h('div', 'qc', root, `<div class="no">0${i + 1}</div><div class="q">${q}</div><div class="ans"><div class="who">MyISAM</div><div class="a">${a}</div></div><div class="ans2"><div class="who">InnoDB</div><div class="a">${b}</div></div>`);
    c.style.left = (96 + i * 442) + 'px';
    return { c, ans: c.querySelector('.ans'), ans2: c.querySelector('.ans2') };
  });
  cards.forEach((k) => gsap.set([k.ans, k.ans2], { autoAlpha: 0, y: 14 }));
  show(cards.map((k) => k.c), T('n1', '用最少') - 0.2, { y: 40, d: 0.7, stagger: 0.28 });
  tl.fromTo(hd, { scale: 1 }, { scale: 1.06, transformOrigin: '0% 50%', duration: 0.35, yoyo: true, repeat: 1, immediateRender: false }, T('n2', '四个') - 0.1);
  ['n3', 'n4', 'n5', 'n6'].forEach((id, i) => {
    const t = T(id) - 0.05;
    tl.to(cards[i].c, { borderColor: 'rgba(242,145,17,.85)', y: -10, duration: 0.4 }, t);
    tl.to(cards[i].c, { borderColor: 'rgba(127,211,230,.30)', y: 0, duration: 0.5 }, Tend(id) + 0.25);
    tl.to(cards[i].ans, { autoAlpha: 1, y: 0, duration: 0.5 }, t + 0.6);
  });

  // 时间线（版本与年份）
  const tx = h('div', 'tlx', root);
  h('div', 'ln', tx);
  const evs = [[0, '3.23', 'MyISAM 加入 MySQL'], [760, '5.5 · 2010', '默认引擎改为 InnoDB'], [1390, '8.0 · 2018', '系统表迁往 InnoDB，.frm 取消']].map(([x, b, sp]) => { const e = h('div', 'ev', tx, `<i></i><b>${b}</b><span>${sp}</span>`); e.style.left = x + 'px'; return e; });
  const ln = tx.querySelector('.ln');
  const t7 = T('n7') - 0.3;
  fromTo(ln, t7, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 0.46, duration: 1.2, ease: 'power2.inOut' });
  fromTo(evs[0], t7 + 0.1, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 });
  fromTo(evs[1], T('n7', '5.5') - 0.2, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 });
  tl.to(evs[1].querySelector('i'), { backgroundColor: '#f29111', boxShadow: '0 0 20px rgba(242,145,17,.9)', duration: 0.4 }, T('n7', '换成'));
  // InnoDB 的答案
  const order = [2, 3, 0, 1];   // 行级锁 → 事务/恢复 → 其余
  tl.to(cards[2].ans2, { autoAlpha: 1, y: 0, duration: 0.5 }, T('n8', '行级锁') - 0.1);
  tl.to(cards[3].ans2, { autoAlpha: 1, y: 0, duration: 0.5 }, T('n8', '事务') - 0.1);
  tl.to([cards[0].ans2, cards[1].ans2], { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.25 }, T('n9') );
  tl.to(ln, { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, T('n9') + 0.4);
  fromTo(evs[2], T('n9') + 1.5, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 });

  // 回到三个文件
  const t10 = T('n10') - 0.4;
  hide([hd, ...cards.map((k) => k.c), tx], t10, { y: -20, d: 0.45, stagger: 0.03 });
  const three = h('div', 'three', root, '<div><b class="c-pale">.frm</b><span>表结构</span></div><div><b class="c-mint">.MYD</b><span>数据</span></div><div><b class="c-orange">.MYI</b><span>索引</span></div>');
  fromTo([...three.children], T('n10', '三个') - 0.5, { autoAlpha: 0, y: 40, filter: 'blur(10px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.16 });
  // 片尾
  const tE = Tend('n10') + 0.7;
  hide(three, tE, { y: -24, d: 0.5 });
  sfx('riser', tE - 0.5, { g: 0.7 }); sfx('thud', tE + 0.6, { g: 0.8 });
  const endc = h('div', 'endc', root, '<div class="t1">一个数据库引擎是如何实现的？</div><div class="rl"></div><div class="t2">从<b>MyISAM</b>说起</div><div class="t3">画面中的字节、数字与终端回显，均取自 MySQL 5.5.62 上的真实文件</div>');
  fromTo([...endc.children], tE + 0.45, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.18 });
  const chapHud = document.querySelector('.hud-chap');
  F((t) => { if (t > tE) chapHud.style.opacity = Math.min(parseFloat(chapHud.style.opacity || '1'), clamp(1 - (t - tE) / 0.5)).toFixed(3); });
  const black = h('div', 'black', root);
  fromTo(black, s.end - 1.0, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: 'power1.in' });
});
