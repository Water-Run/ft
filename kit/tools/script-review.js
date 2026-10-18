// 文案交审：export 生成只读稿本；check 核对人工记录与当前内容。
// node kit/tools/script-review.js <视频> export|check [--lang zh|en|all]
// 本工具不会确认文案。review/approval.json 只能依据真实的人工确认填写。
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { noLinks } = require('./project-files');
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const cell = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('\n', '<br>');

function snapshot(video, project, lang) {
  if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/.test(lang)) throw new Error('语言标记不能用于文件名：' + lang);
  if (!project.languages.includes(lang)) throw new Error('项目没有语言：' + lang);
  const scriptPath = path.join(video, 'src/js/script.js');
  const before = process.env.VLANG;
  let source;
  try {
    process.env.VLANG = lang;
    delete require.cache[require.resolve(scriptPath)];
    source = require(scriptPath);
  } finally {
    if (before === undefined) delete process.env.VLANG; else process.env.VLANG = before;
  }
  const ids = new Set();
  const scenes = source.SCRIPT.map(scene => ({
    id: scene.id, chapter: scene.chap,
    cues: scene.cues.map(([id, text, options = {}]) => {
      if (ids.has(id)) throw new Error('句号重复：' + id);
      ids.add(id);
      if (options.pause == null && (typeof text !== 'string' || !text.trim())) throw new Error(lang + ' 缺少字幕：' + id);
      return { id, text: text ?? null, silent: options.pause != null };
    }),
  }));
  const content = { lang, title: project.titles?.[lang] || project.title || '', scenes };
  return { content, hash: digest(content), estimate: source.layoutScript({}), source };
}
function status(video, project, languages = project.languages) {
  if (project.review === undefined) return { ok: true, legacy: true, problems: [], details: ['旧项目未启用版本闸门；仍按原有人工审稿规则执行。'] };
  const problems = [], details = [];
  if (project.review?.required !== true) problems.push('review.required 必须为 true，不能关闭已配置的校对检查');
  const reviewer = project.review?.reviewer;
  if (typeof reviewer !== 'string' || !reviewer.trim()) problems.push('project.json 缺少 review.reviewer');
  let approvals = {};
  try { approvals = JSON.parse(fs.readFileSync(path.join(video, 'review/approval.json'), 'utf8')); }
  catch (error) { problems.push('review/approval.json 缺失或不是合法 JSON'); }
  if (approvals.schema !== 1) problems.push('approval.json 的 schema 必须为 1');
  for (const lang of languages) {
    const current = snapshot(video, project, lang), record = approvals.languages?.[lang];
    if (!record || record.status !== 'approved') { problems.push(lang + ' 尚未明确确认'); continue; }
    if (record.content_sha256 !== current.hash) problems.push(lang + ' 标题、章节或字幕已变更，须更新稿本与校对记录');
    if (record.reviewer !== reviewer) problems.push(lang + ' 确认者与指定校对者不一致');
    if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(record.confirmed_at || '') || !Number.isFinite(Date.parse(record.confirmed_at))) problems.push(lang + ' 缺少带时区的确认日期');
    if (typeof record.evidence !== 'string' || record.evidence.trim().length < 5) problems.push(lang + ' 缺少可定位的人工确认依据');
    details.push(lang + ' ' + current.hash);
  }
  return { ok: problems.length === 0, legacy: false, problems, details };
}
function assertApproved(video, project, languages) {
  const result = status(video, project, languages);
  if (!result.ok) throw new Error('文案校对未通过：\n  ' + result.problems.join('\n  ') + '\n先导出交审稿：node kit/tools/script-review.js <视频> export。规则见 docs/script-review.md。');
  if (result.legacy) console.log('提示：' + result.details[0]);
}
function exportReview(video, project, languages) {
  const dir = path.join(video, 'review');
  noLinks(dir);
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, 'approval.json');
  noLinks(target);
  const approvals = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) : { schema: 1, languages: {} };
  if (approvals.schema !== 1 || !approvals.languages || Array.isArray(approvals.languages) || typeof approvals.languages !== 'object') throw new Error('approval.json 结构错误');
  const notes = path.join(dir, 'NOTES.md');
  noLinks(notes);
  if (!fs.existsSync(notes)) fs.writeFileSync(notes, '# 文案校对记录\n\n## 意见与处理\n\n| 稿本 / 句号 | 意见 | 修改与理由 | 状态 |\n|---|---|---|---|\n\n## 明确确认\n\n尚未确认。按仓库 docs/script-review.md 记录真实确认的语言、稿本、日期与依据。\n', { flag: 'wx' });
  for (const lang of languages) {
    const current = snapshot(video, project, lang);
    const name = 'script.' + lang + '.' + current.hash + '.md';
    const lines = ['# 文案校对稿 · ' + cell(current.content.title), '', '- 语言：' + lang, '- 内容 SHA-256：`' + current.hash + '`',
      '- 状态：交审稿；本文件不代表人工已确认。', '- 首次导出预估总时长：' + current.estimate.total.toFixed(1) + ' 秒。',
      '- 时间为首次导出时按字数估算；停顿调整后查看 timeline.js，配音实测以 timing 文件为准。',
      '- 目标观众、主问题、逐章答案及舍弃材料：[本片 README](../README.md)。',
      '- 事实、条件与推断：[FACTS.md](../research/FACTS.md)，按句号定位。',
      '- 意见与逐项处理：[校对记录](NOTES.md)。', '', '直接反馈句号、问题与建议即可；制作者修改 script.js 后重新导出。', ''];
    for (const scene of current.content.scenes) {
      const timing = current.estimate.scenes.find(item => item.id === scene.id);
      lines.push('## ' + cell(scene.id) + ' · ' + cell(scene.chapter?.join(' ') || '无章节卡'), '',
        '预估 ' + (timing.end - timing.start).toFixed(1) + ' 秒。', '', '| 句号 | 字幕 / 旁白原文 |', '|---|---|');
      for (const cue of scene.cues) lines.push('| ' + cell(cue.id) + ' | ' + (cue.silent ? '（无旁白；画面停留）' : cell(cue.text)) + ' |');
      lines.push('');
    }
    lines.push('## 交审核对', '', '- 标题、开头和结尾回答同一个问题。', '- 术语第一次出现有解释；因果、适用范围、版本和数字对应 FACTS.md。',
      '- 根据句号逐条核对译文，记录简化与推断；片尾名单留足阅读时间。', '- 有疑问的地方逐条写入 NOTES.md，关闭意见后由指定校对者明确确认。', '');
    const file = path.join(dir, name);
    noLinks(file);
    // 已导出的稿本不覆盖；完整内容哈希用于避免轮次被混淆。
    if (!fs.existsSync(file)) fs.writeFileSync(file, lines.join('\n'), { flag: 'wx' });
    console.log(path.relative(video, file).replaceAll('\\', '/'));
    if (!approvals.languages[lang]) approvals.languages[lang] = { status: 'pending', content_sha256: current.hash, reviewer: project.review?.reviewer || '', confirmed_at: '', evidence: '' };
  }
  // 保留现有确认原样；过期由 check 报出，不能把旧确认自动绑定到新稿。
  fs.writeFileSync(target, JSON.stringify(approvals, null, 2) + '\n');
}
if (require.main === module) {
  try {
    const { needVideo, PROJECT, LANGS, positional } = require('./lib');
    const video = needVideo(), project = PROJECT(), command = positional(['lang'])[0];
    const langs = LANGS(command === 'check');
    if (command === 'export') { require('./project-files').acquireLock(video); exportReview(video, project, langs); }
    else if (command === 'check') { const result = status(video, project, langs); console.log([...result.details, ...result.problems].join('\n')); process.exitCode = result.ok ? 0 : 1; }
    else throw new Error('用法：node kit/tools/script-review.js <视频> export|check [--lang zh|en|all]');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { snapshot, status, assertApproved, exportReview };
