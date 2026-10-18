// 持续反馈：sync 引入当前规则；check 在配音前查计划，在交付前核对实际文件证据。
// node kit/tools/feedback.js <视频> sync | check [--stage prepared|final]
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { noLinks, inside, hash, acquireLock } = require('./project-files');
const REPO = path.resolve(__dirname, '../..');
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
function registry(root = REPO) {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'docs/feedback-rules.json'), 'utf8'));
  if (data.schema !== 1 || !data.version || !Array.isArray(data.rules) || !data.rules.length) throw new Error('反馈规则表格式错误');
  const seen = new Set();
  for (const rule of data.rules) {
    if (!/^F\d{2,}$/.test(rule.id) || seen.has(rule.id) || !rule.title || !rule.plan || !rule.verify) throw new Error('反馈规则缺字段或编号重复');
    seen.add(rule.id);
  }
  return data;
}
function entry(rule) {
  return { id: rule.id, rule_sha256: digest(rule), applicability: 'pending', reason: '', plan: '', script_evidence: '', result: 'pending', verification: '', clips: [] };
}
function initial(data = registry()) { return { schema: 1, version: data.version, items: data.rules.map(entry), history: [] }; }
const filled = value => typeof value === 'string' && value.trim().length >= 4 && !/^(待填|待定|TODO|pending|未做|未检查|不适用)$/i.test(value.trim());
function readState(video) { return JSON.parse(fs.readFileSync(path.join(video, 'review/feedback.json'), 'utf8')); }
function prepared(video, project, data = registry()) {
  if (project.feedback === undefined && !fs.existsSync(path.join(video, 'review/feedback.json'))) return { ok: true, legacy: true, problems: [] };
  const problems = [];
  if (project.feedback?.required !== true) problems.push('feedback.required 必须为 true，不能关闭已启用的反馈检查');
  let state;
  try { state = readState(video); } catch { return { ok: false, problems: ['缺少合法的 review/feedback.json；先运行 feedback.js sync'] }; }
  if (state.schema !== 1 || !Array.isArray(state.items)) return { ok: false, problems: ['反馈应用记录格式错误'] };
  const ids = state.items.map(item => item.id);
  if (new Set(ids).size !== ids.length) problems.push('反馈应用记录编号重复');
  if (state.version !== data.version) problems.push('反馈版本已更新；运行 feedback.js sync 后逐项复查');
  for (const rule of data.rules) {
    const item = state.items.find(value => value.id === rule.id);
    if (!item) { problems.push(rule.id + ' 未带入本片'); continue; }
    if (item.rule_sha256 !== digest(rule)) problems.push(rule.id + ' 规则已变化，须重新应用');
    if (item.applicability === 'not_applicable') {
      if (!filled(item.reason)) problems.push(rule.id + ' 不适用须说明本片的具体原因');
    } else if (item.applicability === 'applies') {
      if (!filled(item.plan)) problems.push(rule.id + ' 缺少具体处理计划');
      if (!filled(item.script_evidence)) problems.push(rule.id + ' 缺少文案、分镜或核查清单的定位');
    } else problems.push(rule.id + ' 尚未判断适用性');
  }
  return { ok: problems.length === 0, problems, state };
}
function assertPrepared(video, project) {
  const result = prepared(video, project);
  if (!result.ok) throw new Error('反馈应用未完成：\n  ' + result.problems.join('\n  '));
}
async function final(video, project, data = registry()) {
  const result = prepared(video, project, data);
  if (!result.ok || result.legacy) return result;
  const problems = [], hashes = new Map();
  for (const rule of data.rules) {
    const item = result.state.items.find(value => value.id === rule.id);
    if (item.applicability === 'not_applicable') continue;
    if (item.result !== 'verified' || !filled(item.verification)) { problems.push(rule.id + ' 缺少实际复核结论，未解决项不能视为通过'); continue; }
    const clips = Array.isArray(item.clips) ? item.clips : [];
    for (const lang of project.languages) if (!clips.some(clip => clip.lang === lang)) problems.push(rule.id + ' 缺少 ' + lang + ' 成片证据');
    for (const clip of clips) {
      const valid = typeof clip.file === 'string' && /^out\/.+\.mp4$/.test(clip.file) && !clip.file.includes('\\') && !clip.file.split('/').includes('..');
      const file = valid ? path.resolve(video, clip.file) : '';
      if (!valid || !inside(video, file) || !project.languages.includes(clip.lang) || !Number.isFinite(clip.start) || !Number.isFinite(clip.end) || clip.start < 0 || clip.end <= clip.start || !/^[a-f0-9]{64}$/.test(clip.sha256 || '')) { problems.push(rule.id + ' 成片文件、语言、时段或 SHA-256 不合法'); continue; }
      try {
        if (clip.file !== `out/${project.slug}-${clip.lang}-1080p60.mp4`) throw new Error('非正式主成片');
        const manifest = JSON.parse(fs.readFileSync(path.join(video, 'out', clip.lang, 'video.json'), 'utf8'));
        if (!Number.isFinite(manifest.total) || clip.end > manifest.total + 1 / (manifest.fps || 60)) throw new Error('时段超出成片');
        noLinks(file);
        if (!hashes.has(file)) hashes.set(file, await hash(file));
        if (hashes.get(file) !== clip.sha256) problems.push(rule.id + ' 证据文件已经变化：' + clip.file);
      } catch { problems.push(rule.id + ' 证据文件不存在或不能读取：' + clip.file); }
    }
  }
  return { ok: problems.length === 0, problems };
}
function sync(video, data = registry()) {
  acquireLock(video);
  const directory = path.join(video, 'review'), file = path.join(directory, 'feedback.json');
  noLinks(file); fs.mkdirSync(directory, { recursive: true });
  const state = fs.existsSync(file) ? readState(video) : initial(data);
  if (state.schema !== 1 || !Array.isArray(state.items)) throw new Error('已有反馈记录格式错误，未覆盖');
  state.history ||= [];
  for (const rule of data.rules) {
    const index = state.items.findIndex(item => item.id === rule.id);
    if (index < 0) state.items.push(entry(rule));
    else if (state.items[index].rule_sha256 !== digest(rule)) {
      state.history.push({ version: state.version, item: state.items[index] });
      state.items[index] = entry(rule); // 变化的规则必须重新填写；旧证据保留在 history。
    }
  }
  state.version = data.version;
  fs.writeFileSync(file, JSON.stringify(state, null, 2) + '\n');
  const projectFile = path.join(video, 'project.json'); noLinks(projectFile);
  const project = JSON.parse(fs.readFileSync(projectFile, 'utf8'));
  project.feedback = { required: true };
  fs.writeFileSync(projectFile, JSON.stringify(project, null, 2) + '\n');
  return state;
}
if (require.main === module) {
  (async () => {
    const { needVideo, PROJECT, LANGS, positional, arg } = require('./lib');
    const video = needVideo(), command = positional(['stage', 'lang'])[0], stage = arg('stage', 'prepared');
    if (command === 'sync') { const state = sync(video); console.log('已带入反馈 ' + state.version + '；逐项填写 review/feedback.json。'); return; }
    if (command !== 'check' || !['prepared', 'final'].includes(stage)) throw new Error('用法：feedback.js <视频> sync | check [--stage prepared|final]');
    const project = { ...PROJECT(), languages: LANGS(true) };
    const result = stage === 'final' ? await final(video, project) : prepared(video, project);
    console.log(result.legacy ? '旧项目尚未接入反馈版本检查；接续制作时先运行 sync。' : result.ok ? '反馈记录检查通过；内容与观感仍按实际检查范围判断。' : result.problems.join('\n'));
    process.exitCode = result.ok ? 0 : 1;
  })().catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { registry, initial, prepared, assertPrepared, final, sync, digest };
