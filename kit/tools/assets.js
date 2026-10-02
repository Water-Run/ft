// 不入库的二进制依赖（字体、语音识别模型）：核对与下载。清单在 kit/assets.json。
// 用法：node kit/tools/assets.js                 核对 assets/ 下的文件是否齐全、SHA-256 是否与清单一致
//       node kit/tools/assets.js --fetch         下载缺少或校验不符的字体（约 44 MB）
//       node kit/tools/assets.js --fetch --whisper   连同语音识别模型（约 480 MB，只有回听旁白 asr.js 用到；不放也行，届时由 faster-whisper 自行下载）
// 下载优先用 curl（它认 HTTPS_PROXY 等代理环境变量），没有 curl 时用 Node 自带的 fetch。
// 模型默认从 huggingface.co 取；kit/config.local.json 里写 "hf_endpoint" 可换成镜像站。
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { spawnSync } = require('child_process');
const REPO = path.resolve(__dirname, '..', '..'), ASSETS = path.join(REPO, 'assets');
const M = JSON.parse(fs.readFileSync(path.join(REPO, 'kit', 'assets.json'), 'utf8'));
const LOCAL = (() => { try { return JSON.parse(fs.readFileSync(path.join(REPO, 'kit', 'config.local.json'), 'utf8')); } catch (e) { return {}; } })();
const argv = process.argv.slice(2), FETCH = argv.includes('--fetch'), WHISPER = argv.includes('--whisper');
const sha256 = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const hasCurl = spawnSync('curl', ['--version'], { stdio: 'ignore' }).status === 0;
async function download(url, dest) {
  const tmp = dest + '.part'; fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (hasCurl) { const r = spawnSync('curl', ['-fsSL', '--retry', '3', '--connect-timeout', '20', '-o', tmp, url], { stdio: ['ignore', 'ignore', 'inherit'] }); if (r.status !== 0) { fs.rmSync(tmp, { force: true }); throw new Error('curl 失败（退出码 ' + r.status + '）'); } }
  else { const r = await fetch(url, { redirect: 'follow' }); if (!r.ok) throw new Error('HTTP ' + r.status); fs.writeFileSync(tmp, Buffer.from(await r.arrayBuffer())); }
  return tmp;
}
// 返回 { ok, problems: [...] }；供 doctor.js 复用
function status() {
  const problems = [], rows = [];
  for (const f of M.fonts) {
    const p = path.join(ASSETS, 'fonts', f.file);
    if (!fs.existsSync(p)) { problems.push(`缺少字体 assets/fonts/${f.file}（${f.family}）`); rows.push([f.file, '缺少']); continue; }
    const ok = fs.statSync(p).size === f.bytes && sha256(p) === f.sha256;
    if (!ok) problems.push(`字体 assets/fonts/${f.file} 与清单的校验和不一致`);
    rows.push([f.file, ok ? '一致' : '校验和不一致']);
  }
  const wd = path.join(ASSETS, M.whisper.dir), wmiss = M.whisper.files.filter((n) => !fs.existsSync(path.join(wd, n)));
  rows.push([M.whisper.dir + '/', wmiss.length ? (wmiss.length === M.whisper.files.length ? '未放置（可选）' : '不完整，缺 ' + wmiss.join(' ')) : '已放置']);
  return { ok: !problems.length, problems, rows, whisperReady: !wmiss.length };
}
module.exports = { status, M };
if (require.main === module) (async () => {
  if (FETCH) {
    for (const f of M.fonts) {
      const p = path.join(ASSETS, 'fonts', f.file);
      if (fs.existsSync(p) && sha256(p) === f.sha256) continue;
      process.stdout.write(`下载 ${f.file}（${(f.bytes / 1048576).toFixed(1)} MB）… `);
      try { const tmp = await download(f.url, p); if (sha256(tmp) !== f.sha256) { fs.rmSync(tmp, { force: true }); throw new Error('下载到的文件校验和不符'); } fs.renameSync(tmp, p); console.log('完成'); }
      catch (e) { console.log('失败：' + e.message); }
    }
    if (WHISPER) {
      const base = (LOCAL.hf_endpoint || 'https://huggingface.co').replace(/\/$/, '') + '/' + M.whisper.repo + '/resolve/main/';
      for (const n of M.whisper.files) {
        const p = path.join(ASSETS, M.whisper.dir, n); if (fs.existsSync(p)) continue;
        process.stdout.write(`下载 ${M.whisper.dir}/${n} … `);
        try { fs.renameSync(await download(base + n, p), p); console.log('完成'); } catch (e) { console.log('失败：' + e.message); }
      }
    }
  }
  const st = status();
  for (const [n, s] of st.rows) console.log(`  ${n.padEnd(22)} ${s}`);
  if (!st.ok) { console.log('\n' + st.problems.join('\n') + (FETCH ? '' : '\n运行 node kit/tools/assets.js --fetch 下载')); process.exit(1); }
  console.log('字体齐全，校验和一致。');
})();
