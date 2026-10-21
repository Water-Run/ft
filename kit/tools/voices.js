// 音色试听库：同一段范例文本，用本机能用的每个配音音色（edge-tts 与 MiniMax）各合成一遍，放进仓库根的 out/voices/（不入库），
// 并生成试听页 out/voices/index.html：每个音色一行，可逐个或整组连续播放，列出时长、语速和 docs/guides/script.md 第 9 节里已有的评价。
// 用法：node kit/tools/voices.js [--engine edge,minimax] [--lang zh,en] [--only <音色 id 里的字样>] [--force] [--zip]
//   --force   不用缓存，全部重新合成（缓存键含引擎、音色与范例文本；改了范例文本会自动重合成）
//   --zip     另把试听页、评价表（评价表.md）与全部音频打成 out/voices-<日期>.zip，交给策划者离线试听
// 范例文本写在 voices.py 开头。不针对某一部视频；需要联网，MiniMax 需要密钥（同 tts.js）。在线服务的音色列表会变，以试听页上实际列出的为准。
const { REPO, KIT, LOCAL, PY, arg, flag, path, fs, ffprobePath } = require('./lib');
const { spawnSync } = require('child_process');
const out = path.join(REPO, 'out', 'voices');
const env = {
  ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1',
  LVS_REPO: REPO, LVS_OUT: out, LVS_FFPROBE: ffprobePath() || '',
  LVS_ENGINES: arg('engine') || 'edge,minimax', LVS_LANGS: arg('lang') || 'zh,en', LVS_ONLY: arg('only') || '', LVS_FORCE: flag('force') ? '1' : '', LVS_ZIP: flag('zip') ? '1' : '',
  LVS_MINIMAX_BASE: process.env.MINIMAX_BASE || LOCAL.minimax_base || '',
};
fs.mkdirSync(out, { recursive: true });
const r = spawnSync(PY(), [path.join(KIT, 'tools', 'voices.py')], { env, stdio: 'inherit' });
process.exit(r.status || 0);
