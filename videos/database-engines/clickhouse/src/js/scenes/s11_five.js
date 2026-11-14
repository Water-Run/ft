// 第 11 章 五个问题：每个数据库引擎都得回答——放、找、改和删、并发、出错
scene('five', ({ root, s, c0 }) => {
  const world = h('div', 'world', root);
  const cam = makeCamera(world);
  const g = groupAt(world); appear(g, c0 + 0.05);
  const ROWS = [
    ['数据怎么放？', '按列，存进排好序、不再改动的片段<br>再由后台不断合并', T('f2'), 'f2'],
    ['怎么找？', '稀疏索引加标记，按颗粒跳着读<br>条件不在排序键里，就要读完那一列', T('f3'), 'f3'],
    ['怎么改和删？', '改：生成新版本，重写那一列<br>删：加一列删除标记，清理留给合并', T('f4'), 'f4'],
    ['怎么同时读写？', '查询拿快照，写入只添新片段<br>互不等待', T('f5'), 'f5'],
    ['出错怎么办？', '先写临时文件夹再改名，有校验和<br>还留着旧片段，万一要退回', T('f6'), 'f6'],
  ];
  const Y0 = 190, PITCH = 148;
  ROWS.forEach(([q, a, ta, id], i) => {
    const qe = mk(g, 'cell lg', 100, Y0 + i * PITCH, 440, 124, '<span>' + q + '</span>'); css(qe, { fontSize: '38px', fontWeight: '700' });
    wipe(qe, T('f1') + 0.3 + i * 0.4, { dir: 'l', d: 0.45 }); sfx('tick', T('f1') + 0.3 + i * 0.4, { g: 0.4 });
    const ae = mk(g, 'h2', 600, Y0 + i * PITCH + 12, 1220, 110, a); css(ae, { fontSize: '38px', lineHeight: '1.4', whiteSpace: 'nowrap' }); wipe(ae, ta + 0.2, { dir: 'l', d: 0.7 });
    const nxt = i + 1 < ROWS.length ? ROWS[i + 1][2] - 0.2 : Tend('f6b', 0.6);
    classAt(qe, 'on', ta - 0.1, nxt); sfx('chime', ta, { g: 0.35 });
  });
  const hint = mk(g, 'lab', 100, 150, null, null, '放 · 找 · 改和删 · 并发 · 出错'); css(hint, { fontSize: '24px' }); appear(hint, T('f1'));
  drift(cam, s, 1);
});
