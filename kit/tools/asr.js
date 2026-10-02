// 回听旁白：用 Whisper 转写 out/<语言>/audio_voice.wav，写 out/<语言>/asr.txt，并与脚本逐句并排打印，核对读音与漏读。
// 用法：node kit/tools/asr.js <视频> [--lang zh]      先运行过 audio.js；省略 --lang 时回听全部语言
// 读法：转写里的同音错字、英文拼写偏差属于识别误差；要看的是有没有读错音、漏词、把英文单词逐字母拼读、把缩写读成单词。
// 模型：assets/whisper/fw-small（没有时由 faster-whisper 自行下载 small）；kit/config.local.json 可写 "asr_model"、"asr_device"、"hf_endpoint"。
const { needVideo, PROJECT, LANGS, LOCAL, KIT, PY, layout, run, pyEnv, dirs, rel, path, fs } = require('./lib');
needVideo();
for (const lang of LANGS(true)) {
  const d = dirs(lang), wav = path.join(d.out, 'audio_voice.wav');
  if (!fs.existsSync(wav)) { console.error(`没有 ${rel(wav)}：先运行 node kit/tools/audio.js`); process.exit(1); }
  const env = pyEnv(lang, { LVS_ASR_PROMPT: PROJECT().asr_prompts[lang] || '', LVS_ASR_MODEL: LOCAL.asr_model || '', LVS_ASR_DEVICE: LOCAL.asr_device || '' });
  if (LOCAL.hf_endpoint) env.HF_ENDPOINT = LOCAL.hf_endpoint;
  run(PY(), [path.join(KIT, 'tools', 'asr.py')], { env, stdio: ['ignore', 'ignore', 'inherit'] });
  const segs = fs.readFileSync(path.join(d.out, 'asr.txt'), 'utf8').split(/\r?\n/).filter(Boolean).map((l) => { const m = l.match(/^\s*([\d.]+)\s+([\d.]+)\s+(.*)$/); return { a: +m[1], b: +m[2], text: m[3] }; });
  const { L } = layout(lang);
  console.log(`■ ${lang}`);
  for (const id of L.order) {
    const c = L.cues[id]; if (c.silent) continue;
    const heard = segs.filter((s) => (Math.min(s.b, c.end) - Math.max(s.a, c.start)) > 0.35 * Math.min(s.b - s.a, c.d)).map((s) => s.text).join(' / ');
    console.log(`${id.padEnd(4)} 合成: ${c.tts}\n     听到: ${heard || '（无）'}`);
  }
}
