// 环境自检：逐项检查这台机器能不能做片子，并指出缺什么、怎么补。
// 用法：node kit/tools/doctor.js                   检查仓库级的依赖
//       node kit/tools/doctor.js <视频>             另查这部视频：用到的字体、各语言的配音缓存与成片中间文件
//       node kit/tools/doctor.js --clean           删掉残留的浏览器临时档案目录（渲染被强行终止时会留下，名字以 lvs-chrome- 开头，每个几十 MB）
// 每一项的安装办法见 docs/environment.md。
const os = require('os');
const { spawnSync } = require('child_process');
const { REPO, KIT, ASSETS, WIN, LOCAL, VIDEO, PROJECT, chromePath, ffmpegPath, ffprobePath, pythonPath, loadTiming, dirs, flag, path, fs } = require('./lib');
const rows = [];
const add = (level, name, detail) => rows.push({ level, name, detail });   // level: ok / warn / fail
const run = (cmd, args) => { const r = spawnSync(cmd, args, { encoding: 'utf8' }); return r.status === 0 ? (r.stdout || r.stderr || '').trim() : null; };
(async () => {
  // Node 与依赖
  const need = [22, 12], v = process.versions.node.split('.').map(Number);
  add(v[0] > need[0] || (v[0] === need[0] && v[1] >= need[1]) ? 'ok' : 'fail', 'Node.js', `${process.versions.node}（需要 ≥ ${need.join('.')}）`);
  for (const dep of ['puppeteer-core', 'gsap']) {
    let ver = null; try { ver = JSON.parse(fs.readFileSync(path.join(REPO, 'node_modules', dep, 'package.json'), 'utf8')).version; } catch (e) {}
    const want = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8')).dependencies[dep];
    add(ver === want ? 'ok' : 'fail', dep, ver ? `${ver}${ver === want ? '' : `（package.json 钉的是 ${want}：在仓库根目录运行 npm ci）`}` : '未安装：在仓库根目录运行 npm ci');
  }
  // Chrome：实际启动一次
  const chrome = chromePath();
  if (!chrome) add('fail', 'Chrome', '找不到。装好 Chrome，或在 kit/config.local.json 里写 "chrome"');
  else {
    try {
      const puppeteer = require('puppeteer-core'), profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lvs-chrome-'));
      const b = await puppeteer.launch({ executablePath: chrome, headless: true, userDataDir: profile, args: WIN ? [] : ['--no-sandbox'] });
      const ver = await b.version(); await b.close(); fs.rmSync(profile, { recursive: true, force: true });
      add('ok', 'Chrome', `${ver}  ${chrome}`);
    } catch (e) { add('fail', 'Chrome', `${chrome} 启动失败：${String(e.message).split('\n')[0]}`); }
  }
  // ffmpeg
  const ff = ffmpegPath(), fp = ffprobePath();
  if (!ff) add('fail', 'ffmpeg', '找不到。放进 PATH 或 assets/ffmpeg/bin/，或在 kit/config.local.json 里写 "ffmpeg"');
  else { const ver = (run(ff, ['-hide_banner', '-version']) || '').split('\n')[0]; const x264 = /libx264/.test(run(ff, ['-hide_banner', '-encoders']) || ''); add(x264 ? 'ok' : 'fail', 'ffmpeg', `${ver.replace(/ Copyright.*/, '')}${x264 ? '' : '（没有 libx264 编码器）'}  ${ff}`); }
  add(fp ? 'ok' : 'fail', 'ffprobe', fp || '找不到（随 ffmpeg 一起发布）');
  // Python 与模块
  const py = pythonPath();
  if (!py) add('fail', 'Python', '找不到。装好 Python 3，或在 kit/config.local.json 里写 "python"');
  else {
    add('ok', 'Python', `${(run(py, ['--version']) || '').trim()}  ${py}`);
    const mods = [['edge_tts', '配音', 'fail', 'edge-tts'], ['numpy', '混音与数值检查', 'fail', 'numpy'], ['faster_whisper', '回听旁白（asr.js、tts_probe.js）', 'warn', 'faster-whisper'], ['PIL', '越界自检（margin.js）', 'warn', 'pillow']];
    for (const [m, use, lv, pip] of mods) { const ver = run(py, ['-c', `import ${m}, importlib.metadata as md\ntry:\n    print(md.version(${JSON.stringify(pip)}))\nexcept Exception:\n    print('已安装')`]); add(ver ? 'ok' : lv, `  ${m}`, ver ? `${ver.trim()}（${use}）` : `未安装：pip install ${pip}（${use}）`); }
  }
  // 字体与模型
  const st = require('./assets').status();
  add(st.ok ? 'ok' : 'fail', '字体（assets/fonts）', st.ok ? '齐全，校验和一致' : st.problems.join('；') + '。运行 node kit/tools/assets.js --fetch');
  add(st.whisperReady ? 'ok' : 'warn', '语音识别模型', st.whisperReady ? 'assets/whisper/fw-small' : '未放置：asr.js 首次运行时由 faster-whisper 自行下载，或 node kit/tools/assets.js --fetch --whisper');
  // 磁盘与临时目录
  try { const s = fs.statfsSync(REPO), free = s.bavail * s.bsize / 2 ** 30; add(free > 10 ? 'ok' : 'warn', '磁盘剩余', `${free.toFixed(1)} GB（一部 8 分钟的片子，渲染与封装约占 1.5–3 GB）`); } catch (e) {}
  const tmp = os.tmpdir(), left = fs.readdirSync(tmp).filter((n) => n.startsWith('lvs-chrome-'));
  if (left.length && flag('clean')) { let n = 0; for (const d of left) try { fs.rmSync(path.join(tmp, d), { recursive: true, force: true }); n++; } catch (e) {} add('ok', '浏览器临时档案', `已删除 ${n} 个`); }
  else add(left.length ? 'warn' : 'ok', '浏览器临时档案', left.length ? `${tmp} 里有 ${left.length} 个残留（lvs-chrome-*）。确认没有正在进行的渲染后运行 node kit/tools/doctor.js --clean` : '无残留');
  if (Object.keys(LOCAL).length) add('ok', '本机配置', 'kit/config.local.json：' + Object.keys(LOCAL).join(', '));
  // 这部视频
  if (VIDEO) {
    const P = PROJECT(), src = path.join(VIDEO, 'src');
    add('ok', '视频', `${path.relative(REPO, VIDEO).replace(/\\/g, '/')}  语言 ${P.languages.join(', ')}`);
    const used = new Set(); const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(css|html)$/.test(e.name)) for (const m of fs.readFileSync(p, 'utf8').matchAll(/url\(["']?(?:\.\.)?\/fonts\/([^"')]+)/g)) used.add(m[1]); } };
    walk(src);
    const miss = [...used].filter((f) => !fs.existsSync(path.join(ASSETS, 'fonts', f)));
    add(miss.length ? 'fail' : 'ok', '  字体', miss.length ? '样式里引用了 assets/fonts 中没有的文件：' + miss.join(' ') : [...used].join(' ') || '（样式里没有引用字体文件）');
    for (const lang of P.languages) {
      const d = dirs(lang), nt = Object.keys(loadTiming(lang)).length;
      const cues = fs.existsSync(path.join(d.audio, 'cues')) ? fs.readdirSync(path.join(d.audio, 'cues')).filter((n) => n.endsWith('.mp3')).length : 0;
      const has = (f) => (fs.existsSync(path.join(d.out, f)) ? f : null);
      add(nt ? 'ok' : 'warn', `  ${lang}`, `实测时长 ${nt} 句；配音缓存 ${cues} 句${nt && !cues ? '（本机没有音频：混音前先运行 tts.js 重新合成）' : ''}；中间文件：${['video.mp4', 'audio.wav'].map(has).filter(Boolean).join(' ') || '无'}`);
    }
  }
  const mark = { ok: '✓', warn: '!', fail: '✗' };
  for (const r of rows) console.log(`${mark[r.level]} ${r.name.padEnd(22)} ${r.detail}`);
  const bad = rows.filter((r) => r.level === 'fail').length;
  console.log(bad ? `\n有 ${bad} 项不满足。安装办法见 docs/environment.md` : '\n环境可用。' + (rows.some((r) => r.level === 'warn') ? '带 ! 的项不影响出片，但会缺少对应的检查。' : ''));
  process.exit(bad ? 1 : 0);
})();
