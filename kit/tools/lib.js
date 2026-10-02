// 工具的公共部分：定位仓库与视频目录、读本机配置、语言、时间线、静态服务器、打开页面。
// 所有工具都是 `node kit/tools/<名字>.js [视频目录] [参数…]`，在任何系统的任何 shell 里用法相同。
//   视频目录：第一个「含 project.json 的目录」位置参数；省略时取当前目录（或其上级）里的那个。
//   语言：--lang zh | en | zh,en | all。省略时，出产物的工具处理 project.json 里的全部语言，看画面的工具只看第一种。
// 目录约定：
//   <仓库>/kit/            引擎、模板、工具（本目录的上一级）
//   <仓库>/assets/         本机的二进制依赖（字体、ffmpeg、语音识别模型），不入库；见 docs/environment.md
//   <仓库>/node_modules/   npm install 得到（puppeteer-core、gsap）
//   <视频>/project.json src/ research/         入库
//   <视频>/audio/ out/ shots/ build/            生成物，不入库
const path = require('path'), fs = require('fs'), http = require('http'), os = require('os');
const { spawnSync } = require('child_process');
const REPO = path.resolve(__dirname, '..', '..');
const KIT = path.join(REPO, 'kit');
const ASSETS = path.join(REPO, 'assets');
const WIN = process.platform === 'win32';

// ── 本机配置：kit/config.local.json（不入库）或环境变量。都没有时按系统的常见位置找 ──
const LOCAL = (() => { try { return JSON.parse(fs.readFileSync(path.join(KIT, 'config.local.json'), 'utf8')); } catch (e) { return {}; } })();
const which = (names) => {
  for (const n of names) {
    if (path.isAbsolute(n)) { if (fs.existsSync(n)) return n; continue; }
    const r = spawnSync(WIN ? 'where' : 'which', [n], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim().split(/\r?\n/)[0];
  }
  return null;
};
const lazy = (fn) => { let v, done = false; return () => { if (!done) { v = fn(); done = true; } return v; }; };
const exe = (n) => (WIN ? n + '.exe' : n);
const chromePath = lazy(() => process.env.CHROME || LOCAL.chrome || which(WIN
  ? ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'), 'chrome']
  : ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']));
const ffPath = (name) => lazy(() => process.env[name.toUpperCase()] || LOCAL[name] || which([path.join(ASSETS, 'ffmpeg', 'bin', exe(name)), name]));
const ffmpegPath = ffPath('ffmpeg'), ffprobePath = ffPath('ffprobe');
const pythonPath = lazy(() => process.env.PYTHON || LOCAL.python || which(WIN ? ['python', 'py'] : ['python3', 'python']));
const need = (what, get, hint) => { const v = get(); if (!v) { console.error(`找不到 ${what}。${hint} 详见 docs/environment.md；node kit/tools/doctor.js 可检查整个环境。`); process.exit(2); } return v; };
const CHROME = () => need('Chrome', chromePath, '装好 Chrome，或在 kit/config.local.json 里写 "chrome": "<路径>"。');
const FFMPEG = () => need('ffmpeg', ffmpegPath, '把 ffmpeg 放进 PATH 或 assets/ffmpeg/bin/，或在 kit/config.local.json 里写 "ffmpeg"。');
const FFPROBE = () => need('ffprobe', ffprobePath, '它随 ffmpeg 一起发布。');
const PY = () => need('Python', pythonPath, '装好 Python 3，或在 kit/config.local.json 里写 "python"。');

// ── 命令行 ──
const RAW = process.argv.slice(2);
const isVideoDir = (d) => { try { return fs.statSync(path.join(d, 'project.json')).isFile(); } catch (e) { return false; } };
let VIDEO = null; const ARGS = [];
for (const a of RAW) { if (!VIDEO && !a.startsWith('-') && isVideoDir(path.resolve(a))) VIDEO = path.resolve(a); else ARGS.push(a); }
if (!VIDEO) for (let d = process.cwd(); ; d = path.dirname(d)) { if (isVideoDir(d)) { VIDEO = d; break; } if (path.dirname(d) === d) break; }
const arg = (k, d) => { const i = ARGS.lastIndexOf('--' + k); return i >= 0 && i + 1 < ARGS.length ? ARGS[i + 1] : d; };   // 同名参数以最后一个为准
const flag = (k) => ARGS.includes('--' + k);
// 位置参数：去掉 --键 及其值（valued 列出带值的键）
const positional = (valued = []) => { const out = []; for (let i = 0; i < ARGS.length; i++) { if (ARGS[i].startsWith('--')) { if (valued.includes(ARGS[i].slice(2))) i++; continue; } out.push(ARGS[i]); } return out; };
// 去掉指定的选项后剩下的参数（valued：带值的键；flags：开关），供 parseTimes 这类自己再解析的函数用
const without = (valued = [], flags = []) => { const out = []; for (let i = 0; i < ARGS.length; i++) { const k = ARGS[i].startsWith('--') ? ARGS[i].slice(2) : null; if (k && valued.includes(k)) { i++; continue; } if (k && flags.includes(k)) continue; out.push(ARGS[i]); } return out; };
const needVideo = () => { if (!VIDEO) { console.error('没有指定视频目录。用法：node kit/tools/<工具>.js <视频目录> […]，或先 cd 进视频目录。视频目录是含 project.json 的那一层，例如 videos/standalone/luainstaller'); process.exit(2); } return VIDEO; };
const rel = (p) => path.relative(VIDEO || REPO, p).replace(/\\/g, '/');

// ── 项目与语言 ──
// project.json：{ slug, languages: ["zh","en"], titles: {zh,en}, voices: {zh,en}, rates: {zh,en}, asr_prompts: {zh,en}, production: {mode, maker, prepared_by}, audio: {…}, render: {…}, check: {…} }
// 各字段的含义见 docs/tools.md。production.mode：self（自制，缺省）| delegated（委托：准备方备好任务书，受托模型完成场景与收尾，见 docs/delegation.md）
// 单语言的旧写法（title / voice / rate / asr_prompt）也认。
const DEFAULTS = { voices: { zh: 'zh-CN-YunyangNeural', en: 'en-US-AndrewNeural' }, rates: { zh: '+0%', en: '+0%' }, asr_prompts: { zh: '以下是普通话的讲解。', en: 'A narration.' } };
const PROJECT = lazy(() => {
  const p = JSON.parse(fs.readFileSync(path.join(needVideo(), 'project.json'), 'utf8'));
  const languages = p.languages || (p.voices ? Object.keys(p.voices) : ['zh']);
  const per = (multi, single, dflt = {}) => Object.fromEntries(languages.map((l) => [l, (p[multi] && p[multi][l]) != null ? p[multi][l] : (p[single] != null ? p[single] : dflt[l])]));
  return { ...p, languages, titles: per('titles', 'title'), voices: per('voices', 'voice', DEFAULTS.voices), rates: per('rates', 'rate', DEFAULTS.rates), asr_prompts: per('asr_prompts', 'asr_prompt', DEFAULTS.asr_prompts), audio: p.audio || {}, render: p.render || {}, check: p.check || {}, production: { mode: 'self', ...(p.production || {}) } };
});
// 要处理的语言。--lang zh | en | zh,en | all 指定；省略时：出产物的工具（配音、混音、渲染、封装、封面、回听、统计）传 true，处理全部语言；
// 看画面的工具（look、sheets、scan、preview、margin……）不传，只看第一种语言
const LANGS = (defaultAll = false) => {
  const all = PROJECT().languages, v = arg('lang', null);
  if (!v) return defaultAll ? all.slice() : [all[0]];
  const list = v === 'all' ? all.slice() : v.split(',');
  for (const l of list) if (!all.includes(l)) { console.error(`这部视频没有语言 ${l}（project.json 的 languages：${all.join(', ')}）`); process.exit(2); }
  return list;
};
const dirs = (lang) => ({ audio: path.join(VIDEO, 'audio', lang), out: path.join(VIDEO, 'out', lang), build: path.join(VIDEO, 'build'), shots: path.join(VIDEO, 'shots'), timing: path.join(VIDEO, 'src', 'js', `timing.${lang}.js`) });
const mkdirp = (d) => { fs.mkdirSync(d, { recursive: true }); return d; };

// 实测时长：src/js/timing.<语言>.js 是给页面加载的脚本，这里在一个假的 window 上执行它来取数据
function loadTiming(lang) {
  const f = dirs(lang).timing; if (!fs.existsSync(f)) return {};
  const w = {}; new Function('window', fs.readFileSync(f, 'utf8'))(w);
  return (w.DUR_ALL && w.DUR_ALL[lang]) || w.DUR || {};
}
function writeTiming(lang, dur) {
  fs.writeFileSync(dirs(lang).timing, `// 由 kit/tools/tts.js 生成：每句旁白的实测时长与词边界。不要手改。\nwindow.DUR_ALL = window.DUR_ALL || {};\nwindow.DUR_ALL[${JSON.stringify(lang)}] = ${JSON.stringify(dur)};\nwindow.DUR = window.DUR || window.DUR_ALL[${JSON.stringify(lang)}];   // 单语言页面直接用；多语言页面由 script.js 按 ?lang= 取\n`);
}
// 时间线：由脚本与实测时长算出（没有实测时长时按字数估算）。script.js 在加载时读环境变量 VLANG 决定语言
function layout(lang = LANGS()[0]) {
  process.env.VLANG = lang;
  const f = path.join(needVideo(), 'src', 'js', 'script.js');
  delete require.cache[require.resolve(f)];
  const S = require(f), dur = loadTiming(lang);
  return { ...S, lang, L: S.layoutScript(dur), dur, measured: Object.keys(dur).length > 0 };
}

// 把命令行里的时刻写法换成 [{t, label}]。支持：
//   12.5            第 12.5 秒
//   a3              句 a3 说完的那一刻（结束前 0.05 秒）
//   a3:0.5          句 a3 进行到一半（0 = 刚开始，1 = 说完）
//   a3+1.2  a3e-0.3 句 a3 开始后 1.2 秒；a3 结束前 0.3 秒
//   --scene s3 [步长]   沿场景 s3 每隔若干秒（默认 2）
//   --every 4       沿全片每 4 秒
function parseTimes(L, list) {
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    if (a === '--cue') continue;                                   // 旧写法里的开关，句号本身已能识别
    if (a === '--scene') { const s = L.scenes.find((x) => x.id === list[i + 1]); if (!s) { console.error('没有这个场景:', list[i + 1]); process.exit(2); } i++; let step = 2; if (list[i + 1] != null && !isNaN(+list[i + 1])) step = +list[++i]; for (let t = s.start + 0.5; t < s.end; t += step) out.push({ t: +t.toFixed(3), label: '场景 ' + s.id }); continue; }
    if (a === '--every') { const step = +list[++i]; for (let t = 0.5; t < L.total; t += step) out.push({ t: +t.toFixed(3), label: '' }); continue; }
    if (a.startsWith('--')) { console.error('不认识的参数:', a); process.exit(2); }
    if (!isNaN(+a)) { out.push({ t: +a, label: '' }); continue; }
    const m = a.match(/^([A-Za-z_][\w]*?)(e)?(?::([\d.]+)|([+-][\d.]+))?$/);
    const c = m && (L.cues[m[1] + (m[2] || '')] ? { cue: L.cues[m[1] + (m[2] || '')], end: false } : (L.cues[m[1]] ? { cue: L.cues[m[1]], end: !!m[2] } : null));
    if (!c) { console.error('看不懂的时刻或没有这句旁白:', a); process.exit(2); }
    const q = c.cue, cap = q.cap ? String(q.cap).replace(/\*/g, '') : '（停顿）';
    if (m[3] != null) out.push({ t: +(q.start + q.d * +m[3]).toFixed(3), label: `句 ${q.id} 进行到 ${m[3]}：${cap}` });
    else if (m[4] != null) out.push({ t: +((c.end ? q.end : q.start) + +m[4]).toFixed(3), label: `句 ${q.id}${c.end ? ' 结束' : ' 开始'}${m[4]}s：${cap}` });
    else out.push({ t: +(q.end - 0.05).toFixed(3), label: `句 ${q.id} 说完时：${cap}` });
  }
  return out;
}

// ── 静态服务器：视频的 src/ 是站点根；/fonts/ 取 assets/fonts/；/vendor/ 取 node_modules 里的库（都不在各视频里重复存放）──
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp4': 'video/mp4', '.webp': 'image/webp' };
const VENDOR = { 'gsap.min.js': ['gsap', 'dist', 'gsap.min.js'] };
async function startServer(port = 0) {
  needVideo();
  const cache = new Map();
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    if (u === '/favicon.ico') { res.writeHead(204); res.end(); return; }
    let p;
    if (u.startsWith('/fonts/')) p = path.join(ASSETS, 'fonts', u.slice(7));
    else if (u.startsWith('/vendor/') && VENDOR[u.slice(8)] && !fs.existsSync(path.join(VIDEO, 'src', u))) p = path.join(REPO, 'node_modules', ...VENDOR[u.slice(8)]);
    else p = path.join(VIDEO, 'src', u);
    if (!path.resolve(p).startsWith(REPO)) { res.writeHead(403); res.end(); return; }
    let buf = cache.get(p);
    if (!buf) { try { buf = fs.readFileSync(p); if (port === 0) cache.set(p, buf); } catch (e) { res.writeHead(404); res.end(); return; } }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(buf);
  });
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}

// ── 打开一个页面并等它就绪 ──
// 多个浏览器必须逐个串行打开：同时加载大字体会互相拖到导航超时。gpu: true 时启用硬件加速（WebGL 场景需要）。
// 每个浏览器用一个临时档案目录（缓存也在里面），关闭时删掉；被强行终止的进程会把它留在系统临时目录（名字以 lvs-chrome- 开头）。
const PROFILES = new Set();
process.on('exit', () => { for (const d of PROFILES) try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) {} });
async function openPage(base, { url, lang = LANGS()[0], width = 1920, height = 1080, scale = 1, gpu = false, ready = true } = {}) {
  let puppeteer; try { puppeteer = require('puppeteer-core'); } catch (e) { console.error('缺少 puppeteer-core：在仓库根目录运行 npm install'); process.exit(2); }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lvs-chrome-')); PROFILES.add(profile);
  const args = ['--hide-scrollbars', '--mute-audio', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--force-color-profile=srgb', '--font-render-hinting=none', '--disk-cache-dir=' + path.join(profile, 'cache'), '--no-first-run', '--no-default-browser-check'];
  if (!WIN) args.push('--no-sandbox');
  if (gpu) args.push('--enable-gpu', '--ignore-gpu-blocklist', '--enable-webgl', ...(WIN ? ['--use-angle=d3d11'] : []));
  const browser = await puppeteer.launch({ executablePath: CHROME(), headless: true, protocolTimeout: 600000, userDataDir: profile, args });
  const close = browser.close.bind(browser);
  browser.close = async () => { try { await close(); } finally { for (let i = 0; i < 5; i++) { try { fs.rmSync(profile, { recursive: true, force: true }); break; } catch (e) { await new Promise((r) => setTimeout(r, 200)); } } PROFILES.delete(profile); } };
  const page = await browser.newPage();
  const logs = [];
  await page.setViewport({ width, height, deviceScaleFactor: scale });
  page.on('pageerror', (e) => { logs.push('pageerror: ' + e.message); console.error('pageerror', e.message); });
  page.on('console', (m) => { if (m.type() === 'warn' || m.type() === 'error') logs.push(m.type() + ': ' + m.text()); });
  page.on('requestfailed', (r) => logs.push('requestfailed: ' + r.url()));
  page.on('response', (r) => { if (r.status() >= 400) logs.push('http ' + r.status() + ': ' + r.url()); });
  await page.goto(base + (url || '/index.html?lang=' + lang), { waitUntil: 'load', timeout: 180000 });
  if (ready) {
    const ok = await Promise.race([page.evaluate(() => window.READY).then(() => true, (e) => { logs.push('boot failed: ' + e.message); return false; }), new Promise((r) => setTimeout(() => r(null), 90000))]);
    if (ok !== true) { console.error('页面未能就绪（boot 失败或超时）。页面日志：\n  ' + (logs.join('\n  ') || '（无）')); await browser.close(); process.exit(2); }
  }
  return { browser, page, logs };
}

// src/ 下每个文件的内容哈希。render.js 在整片渲染成功后把它记进 out/<语言>/video.json，check.js --final 据此判断成片是否过期
// （不用修改时间：检出、解包、同步都会改它）
function sourceState() {
  const crypto = require('crypto'), out = {}, root = path.join(needVideo(), 'src');
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((x, y) => (x.name < y.name ? -1 : 1))) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.isFile()) out[path.relative(root, p).replace(/\\/g, '/')] = crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex'); } };
  walk(root); return out;
}
// index.html 加载的本片脚本与样式（不含引擎、脚本、时长与第三方库）：check.js 的源码规则只看这些
const ENGINE_FILES = /^(js\/(engine|util|boot|script|timing(\.\w+)?)\.js|css\/base\.css|vendor\/.*)$/;
function loadedSources() {
  const html = fs.readFileSync(path.join(needVideo(), 'src', 'index.html'), 'utf8');
  const refs = [...html.matchAll(/<script[^>]*\ssrc="\/?([^"?]+)"/g), ...html.matchAll(/<link[^>]*\shref="\/?([^"?]+\.css)"/g)].map((m) => m[1]);
  return refs.filter((f) => !ENGINE_FILES.test(f) && fs.existsSync(path.join(VIDEO, 'src', f)));
}

// 运行子进程，继承输出；失败即退出
function run(cmd, args, opt = {}) {
  const r = spawnSync(cmd, args, { cwd: VIDEO || REPO, stdio: 'inherit', ...opt, env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1', ...(opt.env || {}) } });
  if (r.error) { console.error('无法运行', cmd, r.error.message); process.exit(1); }
  if (r.status !== 0 && !opt.allowFail) { console.error(`命令失败（退出码 ${r.status}）: ${path.basename(cmd)} ${args.join(' ')}`); process.exit(r.status || 1); }
  return r;
}
// 传给 Python 工具的环境变量
const pyEnv = (lang, extra = {}) => ({ LVS_REPO: REPO, LVS_VIDEO: VIDEO, LVS_LANG: lang, LVS_FFMPEG: ffmpegPath() || '', LVS_FFPROBE: ffprobePath() || '', ...extra });
const mmss = (t) => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
// 用页面把一组小图拼成总览图（不依赖 ffmpeg）：files 为图片路径，每张 cols×rows 格
async function tile(files, outPattern, { cols = 3, rows = 3, w = 640, h = 360 } = {}) {
  const puppeteer = require('puppeteer-core');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lvs-chrome-')); PROFILES.add(profile);
  const browser = await puppeteer.launch({ executablePath: CHROME(), headless: true, userDataDir: profile, args: WIN ? [] : ['--no-sandbox'] });
  const page = await browser.newPage(); const per = cols * rows, pad = 6, out = [];
  await page.setViewport({ width: cols * w + (cols + 1) * pad, height: rows * h + (rows + 1) * pad, deviceScaleFactor: 1 });
  for (let i = 0; i * per < files.length; i++) {
    const imgs = files.slice(i * per, i * per + per).map((f) => `<img src="data:image/jpeg;base64,${fs.readFileSync(f).toString('base64')}" style="width:${w}px;height:${h}px;display:block">`).join('');
    await page.setContent(`<body style="margin:0;background:#101010"><div style="display:grid;grid-template-columns:repeat(${cols},${w}px);gap:${pad}px;padding:${pad}px">${imgs}</div></body>`, { waitUntil: 'load' });
    const f = outPattern.replace('%02d', String(i + 1).padStart(2, '0')); await page.screenshot({ path: f, type: 'jpeg', quality: 86 }); out.push(f);
  }
  await browser.close(); try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {} PROFILES.delete(profile);
  return out;
}

module.exports = { REPO, KIT, ASSETS, WIN, LOCAL, get VIDEO() { return VIDEO; }, needVideo, ARGS, arg, flag, positional, without, rel, PROJECT, LANGS, dirs, mkdirp, loadTiming, writeTiming, layout, parseTimes,
  CHROME, FFMPEG, FFPROBE, PY, chromePath, ffmpegPath, ffprobePath, pythonPath, startServer, openPage, run, pyEnv, mmss, tile, sourceState, loadedSources, path, fs };
