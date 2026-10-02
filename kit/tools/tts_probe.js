// 读法试验：同一个词换几种写法各合成一句，用 Whisper 回听并列出词边界，挑读得对的那一种写进脚本的 SAY 表或 tts 字段。
// 用法：node kit/tools/tts_probe.js <视频> [--lang en] "luainstaller 是一个工具" "lua installer 是一个工具" "Lua Installer 是一个工具"
// 词边界一栏还用来确认 T(句号, 词) 能不能命中：引擎按「合成文本里的词」找时刻，写法变了词边界也会变。
const { needVideo, PROJECT, LANGS, LOCAL, KIT, PY, positional, pyEnv, path } = require('./lib');
const { spawnSync } = require('child_process');
needVideo();
const lang = LANGS()[0], sents = positional(['lang']);
if (!sents.length) { console.error('用法见文件头注释：至少给一句要试的文本'); process.exit(2); }
const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1', ...pyEnv(lang, { LVS_VOICE: PROJECT().voices[lang], LVS_RATE: PROJECT().rates[lang], LVS_ASR_MODEL: LOCAL.asr_model || '', LVS_ASR_DEVICE: LOCAL.asr_device || '' }) };
if (LOCAL.hf_endpoint) env.HF_ENDPOINT = LOCAL.hf_endpoint;
const r = spawnSync(PY(), [path.join(KIT, 'tools', 'tts_probe.py')], { input: JSON.stringify(sents), env, stdio: ['pipe', 'inherit', 'inherit'] });
process.exit(r.status || 0);
