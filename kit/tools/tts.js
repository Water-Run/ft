// 配音：由 src/js/script.js 导出待合成的句子 → edge-tts 逐句合成 → 写 src/js/timing.<语言>.js → 打印时间线。
// 用法：node kit/tools/tts.js <视频> [--lang zh]            省略 --lang 时处理全部语言
// 有缓存：只重新合成文本、音色或语速变了的句子。需要联网（edge-tts 调用的是在线语音服务）。
// 音色与语速取 project.json 的 voices / rates；字幕一行的宽度上限取 check.caption_width（按「字宽」算：汉字 1，其余 0.5）。
const { needVideo, PROJECT, LANGS, KIT, PY, layout, run, pyEnv, dirs, mkdirp, writeTiming, mmss, path, fs } = require('./lib');
needVideo();
const P = PROJECT(), CAPW = { zh: 26, en: 44 };
const limit = (lang) => { const c = P.check.caption_width; return c == null ? (CAPW[lang] != null ? CAPW[lang] : 44) : (typeof c === 'object' ? c[lang] : c); };
for (const lang of LANGS(true)) {
  const { SCRIPT, ttsText, strip } = layout(lang);
  const cues = [], seen = new Set(), problems = [], max = limit(lang);
  const width = (s) => [...strip(s)].reduce((a, ch) => a + (ch.charCodeAt(0) < 0x2e80 ? 0.5 : 1), 0);
  for (const sc of SCRIPT) for (const c of sc.cues) {
    if (seen.has(c[0])) problems.push(`句号重复: ${c[0]}`); seen.add(c[0]);
    if (c[2] && c[2].pause != null) continue;
    if (!c[1]) { problems.push(`句 ${c[0]} 没有 ${lang} 的字幕文本`); continue; }
    if (max && width(c[1]) > max) problems.push(`字幕超过一行（${width(c[1])} 个字宽 > ${max}）: ${c[0]} ${c[1]}`);
    cues.push({ id: c[0], tts: ttsText(c) });
  }
  if (problems.length) { console.error(`${lang}：\n  ` + problems.join('\n  ')); process.exit(1); }
  const d = dirs(lang);
  fs.writeFileSync(path.join(mkdirp(d.build), `cues.${lang}.json`), JSON.stringify(cues, null, 1));
  console.log(`${lang}：待合成 ${cues.length} 句（音色 ${P.voices[lang]}，语速 ${P.rates[lang]}）`);
  run(PY(), [path.join(KIT, 'tools', 'tts.py')], { env: pyEnv(lang, { LVS_VOICE: P.voices[lang], LVS_RATE: P.rates[lang] }) });
  writeTiming(lang, JSON.parse(fs.readFileSync(path.join(d.audio, 'dur.json'), 'utf8')));
  const { L } = layout(lang);
  console.log(`总长 ${L.total.toFixed(1)} s = ${mmss(L.total)}`);
  console.log('场景        起点    终点    时长  章节');
  for (const s of L.scenes) console.log(' ', s.id.padEnd(9), s.start.toFixed(1).padStart(6), s.end.toFixed(1).padStart(7), (s.end - s.start).toFixed(1).padStart(6) + 's', s.chap ? s.chap.join(' ') : '');
}
