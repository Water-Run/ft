// 它是什么：模型文件里全是数（a1），每个数占 16 位（a3），加起来差不多 55 GB（a4）。
// 主对象是这条连续的色带——它就是文件；数字从 0 数到 278 亿多，再取一个数摊成 16 个 0/1。
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
    const numLab = el(world, 160, 330, 900, 44, {}, '个数 · 模型文件里全是数', 'lbl');
    appear(numLab, T('a1') + 0.3);
    // 文件：连续的色带，就是模型的全部数
    const file = el(world, 144, 404, 1584, 70, { background: grad() }, '', 'band-obj');
    wipe(file, T('a1') + 0.3, { dir: 'l', d: 0.7 });

    // a3：一个数占 16 位，就是 16 个 0 或 1（取文件里的一个数）
    const bits = bits16(G.values[2]);
    const lab1 = el(world, 160, 548, 300, 56, {}, '取一个数', 'hit');
    appear(lab1, T('a1') + 1.8);
    const cells = [];
    [...bits].forEach((b, i) => {
      const c = el(world, 160 + i * 78, 610, 64, 64, {}, '', 'cell ' + (b === '1' ? 'cell-on' : 'cell-off'));
      appear(c, T('a3') + 0.1 + i * 0.03);
      cells.push(c);
    });
    const lab2 = el(world, 160, 700, 1200, 56, {}, '16 位 = 16 个 0 或 1', 'hit');
    lab2.dataset.gloss = '位';
    appear(lab2, T('a3') + 1.0);
    sfx('tick', T('a3'), { g: 0.6 });

    // a4：加起来差不多 55 GB：数字换成体积，格子收走
    hide(num, T('a4'), { d: 0.25 }); hide(numLab, T('a4'), { d: 0.25 });
    cells.forEach((c) => hide(c, T('a4'), { d: 0.25 }));
    hide(lab1, T('a4'), { d: 0.25 }); hide(lab2, T('a4'), { d: 0.25 });
    const big55 = el(world, 156, 196, 700, 130, {}, '55 GB', 'big');
    appear(big55, T('a4'));
    const bigLab = el(world, 160, 330, 900, 44, {}, '278 亿 × 16 位 ≈ 55 GB', 'lbl');
    appear(bigLab, T('a4') + 0.3);
    sfx('thud', T('a4'), { g: 0.8 });
  });
})();
