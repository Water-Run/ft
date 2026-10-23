// 署名核对：片单允许保留未确认的历史记录，交付前必须补齐真实型号与分工。
// 这里只验证记录与片尾文字；参与者是否漏登、最终 MP4 是否一致仍须据实审查。
const NOT_MODELS = [/^codex\b/i, /^claude code\b/i, /^cursor\b/i, /^opencode\b/i, /^chatgpt\b/i, /^copilot\b/i, /^(claude|gpt|gemini|deepseek|kimi|qwen|grok|opus|sonnet|haiku)\s*-?\d*$/i, /主会话/];
const UNKNOWN = /未记录|未注明|未确认|未披露|未知|待确认|待补|待定|型号不详|\b(unknown|unspecified|unrecorded|tbd|todo)\b|^[-—?？]+$|\{\{.*\}\}/i;
const nonempty = (x) => typeof x === 'string' && !!x.trim();
const roleText = (x, lang) => typeof x === 'string' ? x : x && typeof x === 'object' ? x[lang] || x.zh : null;

function problems(p, where = 'project.json', { final = false } = {}) {
  const errs = [], add = (message) => errs.push(`${where}：${message}`), c = p && p.credits;
  if (p && p.license != null && p.license !== 'GPL-3.0-or-later') add('本项目的 license 须为 GPL-3.0-or-later，第三方材料的许可另行记录');
  if (!c) return final ? [...errs, `${where}：缺少 credits（准备方与制作方均须登记）`] : errs;
  if (typeof c !== 'object' || Array.isArray(c)) return [`${where}：credits 必须是对象`];
  if (final && !nonempty(c.planner)) add('缺少策划者的公开署名 credits.planner（姓名、昵称或笔名均可）');
  if (final) {
    let valid = false;
    try { const url = new URL(c.repository); valid = /^https?:$/.test(url.protocol) && !!url.hostname && url.pathname !== '/'; } catch (e) {}
    if (!valid) add('credits.repository 须为完整的 http(s) 仓库地址');
  }
  if (!Array.isArray(c.models)) add('credits.models 必须是数组');
  else if (final && !c.models.length) add('credits.models 为空：登记实际参与的模型及分工');
  if (c.services != null && !Array.isArray(c.services)) add('credits.services 必须是数组');
  const langs = p.languages || ['zh'];
  for (const [key, rows] of [['models', c.models], ['services', c.services]]) {
    if (!Array.isArray(rows)) continue;
    for (const m of rows) {
      if (!m || !nonempty(m.name)) { add(`credits.${key} 里有缺少 name 的条目`); continue; }
      if (!Array.isArray(m.roles) || !m.roles.length) add(`${m.name} 缺少 roles（实际分工）`);
      else if (m.roles.some((r) => !langs.every((lang) => nonempty(roleText(r, lang))))) add(`${m.name} 的 roles 须为非空分工文字（逐语言提供，或以 zh 回退）`);
      if (key === 'models') {
        if (NOT_MODELS.some((re) => re.test(m.name.trim()))) add(`「${m.name}」不是模型的真实名称（写提供方公布的型号与版本，见 docs/roles.md 第 5 节）`);
        else if (final && (UNKNOWN.test(m.name) || /^\d/.test(m.name.trim()))) add(`「${m.name}」的真实型号未完整登记：交付前核实，不用占位名或简称`);
      }
    }
  }
  return errs;
}

function cueProblems(script) {
  const cues = script.flatMap((sc) => sc.cues).filter((c) => c[2] && c[2].credits);
  if (!cues.length) return ['脚本里没有片尾名单的静默 cue（{ pause, credits: true }）'];
  return cues.filter((c) => c[1] != null || c[2].tts || !(Number.isFinite(c[2].pause) && c[2].pause > 0)).map((c) => `片尾 ${c[0]} 须为无旁白 cue，pause 为正数且不设置字幕或 tts`);
}

function screenProblems(p, lang, frames) {
  const c = p.credits, normalize = (x) => x.replace(/\s+/g, '');
  const seen = frames.flat().filter((it) => it.k === 'text' && it.op >= 0.5 && !it.cut && it.x >= 0 && it.y >= 0 && it.x + it.w <= 1920 && it.y + it.h <= 1080).map((it) => normalize(it.text));
  const rows = [...c.models, ...(c.services || [])];
  const want = [lang === 'en' ? 'Planning' : '策划', c.planner, lang === 'en' ? 'Open-source video' : '开源视频',
    p.license || 'GPL-3.0-or-later', ...rows.flatMap((m) => [m.name, ...m.roles.map((r) => roleText(r, lang))]), c.repository.replace(/^https?:\/\//, '').replace(/\/$/, '')];
  return [...new Set(want)].filter((w) => !seen.some((text) => text.includes(normalize(w)))).map((w) => `片尾画面上找不到完整可见的「${w}」`);
}

module.exports = { problems, cueProblems, screenProblems, roleText };
