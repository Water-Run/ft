// 混音：旁白 + 配乐 + 音效 → out/<语言>/audio.wav；另出 audio_voice.wav（仅旁白）、audio_nomusic.wav（旁白 + 音效）与两条分轨。
// 用法：node kit/tools/audio.js <视频> [--lang zh] [music=pulse sfx_db=-6 out=audio_b.wav]      省略 --lang 时处理全部语言
//   key=value 原样传给 mix.py，临时覆盖 project.json 的 audio 段（各项含义见 mix.py 头部与 docs/sound.md）
//   --no-check   混完不跑数值自检（audio_check.py）
// 步骤：导出旁白与章节的时间 build/mix.<语言>.json → 打开页面取场景登记的音效事件 build/sfx.<语言>.json → mix.py 合成 → 自检
const { needVideo, LANGS, KIT, PY, ARGS, layout, run, pyEnv, startServer, openPage, flag, dirs, mkdirp, path, fs } = require('./lib');
(async () => {
  needVideo();
  const kv = ARGS.filter((a) => /^[a-z_]+=/.test(a));
  for (const lang of LANGS(true)) {
    const { L, measured } = layout(lang);
    if (!measured) { console.error(`${lang}：还没有实测时长，先运行 node kit/tools/tts.js`); process.exit(1); }
    const build = mkdirp(dirs(lang).build);
    const cues = L.order.map((id) => L.cues[id]).filter((c) => !c.silent).map((c) => ({ id: c.id, start: +c.start.toFixed(4), end: +c.end.toFixed(4) }));
    const scenes = L.scenes.map((s) => ({ id: s.id, start: +s.start.toFixed(4), end: +s.end.toFixed(4) }));
    fs.writeFileSync(path.join(build, `mix.${lang}.json`), JSON.stringify({ total: +L.total.toFixed(4), cues, scenes }));
    const { server, base } = await startServer();
    const { browser, page } = await openPage(base, { lang });
    const ev = await page.evaluate(() => (window.SFX || []).slice().sort((a, b) => a.t - b.t));
    await browser.close(); server.close();
    fs.writeFileSync(path.join(build, `sfx.${lang}.json`), JSON.stringify(ev));
    const by = {}; for (const e of ev) by[e.n] = (by[e.n] || 0) + 1;
    console.log(`■ ${lang}  音效事件 ${ev.length} ${JSON.stringify(by)}`);
    console.log('  各场景音效数（不含打字声 key）: ' + L.scenes.map((s) => s.id + '=' + ev.filter((e) => e.n !== 'key' && e.t >= s.start && e.t < s.end).length).join('  '));
    run(PY(), [path.join(KIT, 'tools', 'mix.py'), ...kv], { env: pyEnv(lang) });
    if (!flag('no-check') && !kv.some((a) => a.startsWith('out='))) run(PY(), [path.join(KIT, 'tools', 'audio_check.py')], { env: pyEnv(lang) });
  }
})();
