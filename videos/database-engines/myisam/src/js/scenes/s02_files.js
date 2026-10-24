// 02 一张表，三个文件。主画面：建表写入八行后，目录里的三个文件跟着镜头飞到第二站，各自摊开成一张卡：
// .frm 是表结构（上层维护），.MYD 是八行数据，.MYI 是两个索引；后两张就是 MyISAM 的全部，引擎就是它们的读写规则。
// 语句与回显照录 01_create.out，文件大小取自 snap_01_create 的目录列表（FACTS「02」）。
scene('s2', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const ov = overlay(world);
  const users = rowsOf(R.usersMYD[0]).map(decodeUser);

  // ── 第一站：建表，写入八行 ──
  const t = term(world, 120, 128, 1680, 600, '<b>mysql</b>  myisam_demo');
  wipe(t.el, c0 + 0.1, { dir: 'l', d: 0.45 });
  const tc = T('b1') - 0.3;
  t.lines([
    '<span class="p">mysql&gt;</span> <span class="k">CREATE TABLE</span> users (',
    '    ->   id   <span class="k">INT</span>      NOT NULL,',
    '    ->   name <span class="k">CHAR</span>(10) NOT NULL,',
    '    ->   age  <span class="k">TINYINT</span>  NOT NULL,',
    '    ->   PRIMARY KEY (id), KEY idx_name (name)',
    '    -> ) <span class="k">ENGINE=MyISAM</span>;',
  ], tc, { step: 0.07 });
  t.line('Query OK, 0 rows affected (0.14 sec)', tc + 0.6, { snd: 'tick' });
  const ti = T('b1', '写入') - 0.1;
  t.lines([
    '<span class="p">mysql&gt;</span> <span class="k">INSERT INTO</span> users <span class="k">VALUES</span>',
    "    -> (1,'alice',30),(2,'bob',25),(3,'carol',41),(4,'dave',19),",
    "    -> (5,'erin',33),(6,'frank',52),(7,'grace',28),(8,'heidi',36);",
  ], ti, { step: 0.07 });
  t.line('Query OK, 8 rows affected (0.00 sec)', ti + 0.5, { snd: 'tick' });
  t.line('Records: 8  Duplicates: 0  Warnings: 0', ti + 0.55, { sfx: false });

  // 数据目录：三个同名的文件
  const dirL = h('div', 'abs mono', world, 'data/myisam_demo/'); px(dirL, 140, 752); css(dirL, { fontSize: '30px', color: '#808080' });
  const FILES = [['users.frm', '8,614'], ['users.MYD', '128'], ['users.MYI', '3,072']];
  const tD = T('b2', '三个') - 0.25;
  appear(dirL, tD - 0.2);
  // ── 第二站：三张卡 ──
  const CX = [2040, 2640, 3260], CW = [520, 540, 540], CY = 330, CH = 520;
  const cards = CX.map((x, i) => { const e = h('div', 'blk', world); px(e, x, CY, CW[i], CH); return e; });
  const heads = FILES.map(([n, b], i) => {
    const e = h('div', 'abs mono', world, `${n}<span class="c-f">  ${b.padStart(5)} B</span>`); css(e, { fontSize: '32px', color: i === 0 ? '#d9d9d9' : '#F29111' });
    // 先在目录里（第一站），镜头去第二站时跟过去，落成卡的标题
    const x0 = 140, y0 = 800 + i * 48, x1 = CX[i] + 24, y1 = CY + 18;
    fromTo(e, tD + i * 0.1, { left: x0, top: y0, autoAlpha: 0 }, { left: x0, top: y0, autoAlpha: 1, duration: 0.01 });
    fromTo(e, T('b3') - 0.7 + i * 0.08, { left: x0, top: y0 }, { left: x1, top: y1, duration: 1.0, ease: 'power3.inOut', immediateRender: false });
    sfx('tick', tD + i * 0.1, { g: 0.45 });
    return e;
  });
  cards.forEach((c, i) => wipe(c, T('b3') + 0.15 + i * 0.12, { dir: 't', d: 0.5 }));

  // .frm：表结构
  const frmL = ['id    INT', 'name  CHAR(10)', 'age   TINYINT', '', 'PRIMARY KEY (id)', 'KEY idx_name (name)'];
  frmL.forEach((s_, i) => { const e = h('div', 'abs mono', world, s_); px(e, CX[0] + 30, CY + 96 + i * 46); css(e, { fontSize: '30px', color: i < 3 ? '#d9d9d9' : '#808080' }); appear(e, T('b3', '有哪些') + i * 0.12); });
  sfx('blip', T('b3', '有哪些'), { g: 0.4 });
  const sql = h('div', 'blk', world); px(sql, CX[0], 150, CW[0], 84);
  const sqlT = h('div', 'abs t-body', sql, '上层 · SQL'); css(sqlT, { left: '24px', top: '16px' });
  const aSql = path(ov, `M ${CX[0] + 260} 240 L ${CX[0] + 260} 322`, 'dim', { w: 2.5 });
  wipe(sql, T('b4', '上层') - 0.15, { dir: 'l', d: 0.4 }); arrowIn(aSql, T('b4', '上层') + 0.1, 0.4); sfx('pop', T('b4', '上层'), { g: 0.5 });
  const any = lab(world, CX[0] + 30, CY + CH - 66, '任何引擎都有', 'c-t'); appear(any, T('b4', '无论'));

  // .MYD：八行数据
  users.forEach((u, i) => { const e = h('div', 'abs mono', world, `${String(u.id).padStart(2)}  ${u.name.padEnd(6)} ${u.age}`); px(e, CX[1] + 34, CY + 90 + i * 46); css(e, { fontSize: '30px', color: u.name === 'alice' ? '#F29111' : '#d9d9d9' }); appear(e, T('b5', '每一') - 0.3 + i * 0.07); });
  sfx('blip', T('b5', '每一') - 0.3, { g: 0.4 });
  // .MYI：两个索引
  const myiL = [['主键 id', '#8a8a8a'], ['1 2 3 4 5 6 7 8', '#3fb4cc'], ['', ''], ['idx_name', '#8a8a8a'], ['alice bob carol', '#3fb4cc'], ['dave erin frank', '#3fb4cc'], ['grace heidi', '#3fb4cc']];
  myiL.forEach(([s_, c], i) => { const e = h('div', 'abs mono', world, s_); px(e, CX[2] + 34, CY + 92 + i * 50); css(e, { fontSize: '30px', color: c }); appear(e, T('b6', '索引') - 0.3 + i * 0.07); });
  sfx('blip', T('b6', '索引') - 0.3, { g: 0.4 });

  // 后两个文件 = MyISAM 的全部
  const brk = h('div', 'abs', world); px(brk, CX[1], CY - 36, CX[2] + CW[2] - CX[1], 18); css(brk, { border: '3px solid #F29111', borderBottom: '0' });
  const myisam = h('div', 'abs t-big', world, 'MyISAM'); px(myisam, CX[1] + (CX[2] + CW[2] - CX[1]) / 2 - 90, CY - 116); css(myisam, { color: '#F29111' });
  wipe(brk, T('b7', '后两个'), { dir: 'l', d: 0.5 }); slam(myisam, T('b7', 'My ISAM'), { from: 1.25 }); sfx('thud', T('b7', 'My ISAM'), { g: 0.6 });
  tl.to([cards[0], ...[sql, any]], { opacity: 0.45, duration: 0.5 }, T('b7') - 0.2);
  // 读写的规则：每张卡底部一条，后面几章一条一条讲
  const rules = [[1, '一行 16 字节，第 N 行在 N × 16'], [2, '1024 字节一页，排成 B 树']];
  rules.forEach(([k, s_], i) => { const e = h('div', 'abs', world, s_); px(e, CX[k] + 6, CY + CH + 22); css(e, { font: '500 28px "Sans SC"', color: '#F29111' }); slide(e, T('b8', '规则') - 0.3 + i * 0.35, { y: 16, d: 0.45 }); sfx('pop', T('b8', '规则') - 0.3 + i * 0.35, { g: 0.5 }); });

  track(cam, s.start, { x: 960, y: 540, z: 1 }, [
    [c0 + 0.1, { z: 1.03 }, T('b2') - c0 - 0.5, { ease: 'none', sfx: false }],
    [T('b2') - 0.3, { x: 960, y: 572, z: 1 }, 0.8, { sfx: false }],
    [T('b3') - 0.7, { x: 2880, y: 560, z: 1 }, 1.1, { g: 0.5 }],
    [T('b3', '有哪些') - 0.3, { x: 2330, y: 520, z: 1.28 }, 1.0, { sfx: false }],
    [T('b4') - 0.2, { x: 2320, y: 470, z: 1.18 }, 0.8, { sfx: false }],
    [T('b5') - 0.3, { x: 2910, y: 560, z: 1.25 }, 1.0, { g: 0.4 }],
    [T('b6') - 0.3, { x: 3520, y: 560, z: 1.25 }, 1.0, { g: 0.4 }],
    [Tend('b6') + 0.15, { x: 2900, y: 520, z: 1 }, 0.8, { sfx: false }],
    [null, { z: 1.03 }, s.end - Tend('b6') - 1.2, { ease: 'none', sfx: false }],
  ]);
});
