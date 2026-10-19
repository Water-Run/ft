// 07_node_heap_limit.js — 开场钩子取证（Node 24，V8）：程序创建对象有多快；放手时堆不涨；攥住不放时撞上堆上限。
// 运行：node --trace-gc 07_node_heap_limit.js churn  > out_07_node_churn.txt
//       node --max-old-space-size=64 07_node_heap_limit.js hoard > out_07_node_hoard.txt 2>&1
// 回显入库前去掉本机路径与原生栈（见 out_07_*.txt 头部说明）。
'use strict';
const mode = process.argv[2] || 'churn';
const mb = (b) => (b / 1048576).toFixed(1);
const fmt = (n) => n.toLocaleString('en-US');
let last = null;

if (mode === 'churn') {
  // 一秒钟里不停创建小对象，每个用完即弃
  const h0 = process.memoryUsage().heapUsed;
  const t0 = Date.now();
  let n = 0;
  while (Date.now() - t0 < 1000) {
    for (let i = 0; i < 10000; i++) last = { n: n++, prev: null };
  }
  const ms = Date.now() - t0;
  const h1 = process.memoryUsage().heapUsed;
  console.log(`churn: ${fmt(n)} objects created in ${ms} ms; heapUsed ${mb(h0)} MB -> ${mb(h1)} MB; last=${last.n}`);
} else {
  // 同样的对象，一个都不放手，直到撞上 --max-old-space-size
  const keep = [];
  let n = 0;
  const t0 = Date.now();
  const tick = () => {
    for (let i = 0; i < 100000; i++) keep.push({ n: n++, prev: null });
    if (n % 500000 === 0) console.log(`hoard: kept ${fmt(n)} objects; heapUsed ${mb(process.memoryUsage().heapUsed)} MB; ${Date.now() - t0} ms`);
    setImmediate(tick);
  };
  tick();
}
