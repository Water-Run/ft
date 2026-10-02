// 打印时间线：每句旁白的起止时刻、时长、字幕，以及词边界（写 T(句号, 词) 时查这里）。
// 用法：node kit/tools/timeline.js <视频>              全部句子
//       node kit/tools/timeline.js <视频> c2 c3        只看指定句子，并列出词边界
//       --lang en / --lang all
const { needVideo, LANGS, layout, positional, mmss } = require('./lib');
needVideo();
for (const lang of LANGS()) {
  const { L, measured, strip } = layout(lang);
  const want = positional(['lang']);
  if (!measured) console.log(`（${lang}：还没有实测时长，以下为估算。先运行 node kit/tools/tts.js）`);
  console.log(`■ ${lang}  总长 ${L.total.toFixed(2)} s = ${mmss(L.total)}`);
  for (const s of L.scenes) {
    if (!want.length) console.log(`\n  场景 ${s.id}  ${s.start.toFixed(2)} → ${s.end.toFixed(2)}  （${(s.end - s.start).toFixed(1)} s${s.chap ? '，章节卡 ' + s.lead.toFixed(1) + ' s：' + s.chap.join(' ') : ''}）`);
    for (const id of L.order) {
      const c = L.cues[id]; if (c.scene !== s.id) continue;
      if (want.length && !want.includes(id)) continue;
      console.log(`    ${id.padEnd(4)} ${c.start.toFixed(2).padStart(7)} → ${c.end.toFixed(2).padStart(7)}  ${c.d.toFixed(2).padStart(5)}s  ${c.silent ? '（无旁白停顿）' : strip(c.cap)}`);
      if (want.length && c.words) console.log('         合成文本: ' + c.tts + '\n         词边界: ' + c.words.map(([o, d, w]) => `${w}@${(c.start + o).toFixed(2)}`).join('  '));
    }
  }
}
