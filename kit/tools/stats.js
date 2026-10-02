// 节奏统计：各章语速、最快句、最长句、过短的停顿。node kit/tools/stats.js <视频> [--lang zh]（省略时统计全部语言）
// 口径：中文按字数（汉字与数字各计 1，拉丁字母按 0.4 计）；其他语言按词数。阈值可在 project.json 的 check.pace 里按语言改。
const { needVideo, PROJECT, LANGS, layout, mmss } = require('./lib');
needVideo();
const PACE = { zh: { unit: '字', fast: 6.3 }, en: { unit: '词', fast: 3.6 } };
for (const lang of LANGS(true)) {
  const { L, strip, measured } = layout(lang);
  const pace = { ...(PACE[lang] || PACE.en), ...((PROJECT().check.pace || {})[lang] || {}) };
  if (!measured) console.log(`（${lang}：还没有实测时长，以下为估算。先运行 node kit/tools/tts.js）`);
  const count = lang === 'zh'
    ? (s) => Math.round([...strip(s).replace(/[，。：；、\s]/g, '')].reduce((a, ch) => a + (/[A-Za-z.@%!_\-]/.test(ch) ? 0.4 : 1), 0))
    : (s) => strip(s).split(/\s+/).filter(Boolean).length;
  const cues = L.order.map((id) => L.cues[id]), rows = [];
  for (const c of cues) { if (c.silent) continue; const nx = cues[cues.indexOf(c) + 1]; const n = count(c.cap); rows.push({ id: c.id, scene: c.scene, d: c.d, n, cps: n / c.d, gap: nx ? nx.start - c.end : 0 }); }
  console.log(`■ ${lang}\n章       句数   旁白秒   总秒   占比   ${pace.unit}/秒   最快句          最长句`);
  for (const s of L.scenes) {
    const rs = rows.filter((r) => r.scene === s.id); if (!rs.length) continue;
    const sp = rs.reduce((a, r) => a + r.d, 0), mx = rs.reduce((a, r) => (r.cps > a.cps ? r : a)), lg = rs.reduce((a, r) => (r.d > a.d ? r : a));
    console.log(s.id.padEnd(8), String(rs.length).padStart(4), sp.toFixed(1).padStart(8), (s.end - s.start).toFixed(1).padStart(6), ((100 * sp / (s.end - s.start)).toFixed(0) + '%').padStart(6), (rs.reduce((a, r) => a + r.n, 0) / sp).toFixed(2).padStart(7), `${mx.cps.toFixed(2)} (${mx.id})`.padStart(14), `${lg.d.toFixed(1)}s (${lg.id}, ${lg.n}${pace.unit})`.padStart(20));
  }
  const all = rows.map((r) => r.cps).sort((a, b) => a - b);
  console.log(`总长 ${L.total.toFixed(1)}s = ${mmss(L.total)}，旁白 ${rows.reduce((a, r) => a + r.d, 0).toFixed(1)}s；${pace.unit}/秒 最小/中位/最大 ${all[0].toFixed(2)} / ${all[all.length >> 1].toFixed(2)} / ${all[all.length - 1].toFixed(2)}`);
  console.log(`过快（>${pace.fast} ${pace.unit}/秒）:`, rows.filter((r) => r.cps > pace.fast).map((r) => r.id).join(' ') || '无');
  console.log('停顿过短（<0.2s）:', rows.filter((r) => r.gap > 0 && r.gap < 0.2).map((r) => r.id).join(' ') || '无');
  console.log('过长（>6s）:', rows.filter((r) => r.d > 6).map((r) => `${r.id}:${r.d.toFixed(1)}s`).join(' ') || '无');
}
