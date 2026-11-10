// 它是什么：模型文件里全是数（a1），每个数占 16 位（a3），加起来差不多 55 GB（a4）。
// 色带就是这个文件：先是一条连续的紫，数字从 0 数到 278 亿多。
(function () {
  const { el, grad, bits16, G } = QZ;
  scene('what', ({ root }) => {
    const world = h('div', 'world', root);
    makeCamera(world, 1920, VH);
    const fmt = (v) => Math.round(v).toLocaleString('en-US').replace(/,/g, ' ');

    // a1：数一共有多少个
    const num = el(world, 160, 196, 1500, 130, {}, fmt(QZ.D.params), 'num');
    appear(num, T('a1'));
    sfx('thud', T('a1'), { g: 0.7 });
    // 文件：连续的色带，就是模型的全部数
    const file = el(world, 144, 404, 1584, 70, { background: grad(), borderRadius: '35px', boxShadow: '0 0 48px #A855F7' });
    appear(file, T('a1') + 0.3);

    // a3：一个数占 16 位，就是 16 个 0 或 1（取文件里的一个数）
    const bits = bits16(G.values[2]);
    const lab1 = el(world, 160, 548, 240, 56, { background: '#FFFFFF', color: '#0D0620', borderRadius: '28px', textAlign: 'center', lineHeight: '56px', font: '700 34px/56px "Sans SC", "Inter"' }, '一个数');
    appear(lab1, T('a1') + 1.8);
    const cells = [];
    [...bits].forEach((b, i) => {
      const c = el(world, 160 + i * 78, 610, 64, 64, {}, '', 'cell ' + (b === '1' ? 'cell-on' : 'cell-off'));
      appear(c, T('a3') + 0.1);
      cells.push(c);
    });
    const lab2 = el(world, 1400, 624, 240, 68, { background: '#FFFFFF', color: '#0D0620', borderRadius: '34px', textAlign: 'center', lineHeight: '68px', font: '700 36px/68px "Sans SC", "Inter"' }, '16 位');
    appear(lab2, T('a3') + 1.0);
    sfx('tick', T('a3'), { g: 0.6 });

    // a4：加起来差不多 55 GB：数字换成体积，格子收走
    hide(num, T('a4'), { d: 0.25 });
    cells.forEach((c) => hide(c, T('a4'), { d: 0.25 }));
    hide(lab1, T('a4'), { d: 0.25 }); hide(lab2, T('a4'), { d: 0.25 });
    const big55 = el(world, 156, 196, 700, 130, {}, '55 GB', 'big');
    appear(big55, T('a4'));
    sfx('thud', T('a4'), { g: 0.8 });
  });
})();
