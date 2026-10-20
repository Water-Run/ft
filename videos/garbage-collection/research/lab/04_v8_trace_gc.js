// Generational collection in V8 (Node.js). Run:
//   node --trace-gc 04_v8_trace_gc.js 1>out_04_v8_trace_gc.txt 2>out_04_v8_trace_gc.summary.txt
// --trace-gc prints one line per collection to stdout: "Scavenge" is the
// young-generation collector, "Mark-Compact" is the full collector.
// Phase 1 allocates 3,000,000 small objects and keeps every 4th one alive
// in an array (they survive scavenges and get promoted). Phase 2 drops
// the array and allocates 1,000,000 objects that die immediately.
// Numbers are one run on one machine, not a benchmark.
const mb = () => (process.memoryUsage().heapUsed / 1048576).toFixed(1);
const t0 = Date.now();
const keep = [];
for (let i = 0; i < 3_000_000; i++) {
  const o = { id: i, pad: [i, i + 1, i + 2, i + 3] };
  if (i % 4 === 0) keep.push(o);
}
process.stderr.write(`phase1 kept=${keep.length} heapUsedMB=${mb()} t=${Date.now() - t0}ms\n`);
keep.length = 0;
for (let i = 0; i < 1_000_000; i++) { const o = { id: i }; if (o.id < 0) keep.push(o); }
process.stderr.write(`phase2 dropped; heapUsedMB=${mb()} t=${Date.now() - t0}ms\n`);
process.stderr.write(`node=${process.version} v8=${process.versions.v8}\n`);
