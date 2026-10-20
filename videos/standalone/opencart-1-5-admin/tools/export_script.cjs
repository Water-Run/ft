// 从唯一源稿导出连贯全文、时间预算和逐句证据定位。不会批准文案。
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..'), repo = path.resolve(root, '../..');
process.env.VLANG = 'zh';
const sourceFile = path.join(root, 'src/js/script.js'), source = require(sourceFile);
const project = JSON.parse(fs.readFileSync(path.join(root, 'project.json'), 'utf8'));
const round = project.review?.draft || 'R3';
if (!/^R\d+$/.test(round)) throw new Error('稿本轮次格式错误');
const current = require(path.join(repo, 'kit/tools/script-review')).snapshot(root, project, 'zh');
const L = source.layoutScript({});
const chapters = source.NARRATIVE.filter(chapter => chapter.title).length;
const sha = crypto.createHash('sha256').update(fs.readFileSync(sourceFile)).digest('hex');
const time = value => Math.floor(value / 60) + ':' + (value % 60).toFixed(1).padStart(4, '0');
const cell = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const lines = ['# OpenCart ' + round + '：连贯正文与交审包', '',
  '**状态：待 WaterRun 明确确认。** 2026-10-19，由 GPT-6 Astra 完成文案与交接准备。风格已确认 A，文案尚未确认，不配音、不铺开正式场景。', '',
  '源稿：src/js/script.js。文件 SHA-256：`' + sha + '`。',
  '中文内容 SHA-256（approval.json 使用此值）：`' + current.hash + '`。', '',
  '## 1. 本轮方案', '',
  '- 面向用过网页和网店、不了解 OpenCart 与 PHP 后台的观众。开场从今天的建站选择回到 2014 年，先讲对象、生态位置、年代与观看路线，再进入机制。',
  '- 机制演示为官方 OpenCart 1.5.6.4，所有业务数据独立合成。CASE-A 只作匿名静态结构对照，不展示私有页面或真实业务。',
  '- A“后台即舞台”沿用已确认的白色内容区、钢蓝页头与深灰菜单。动作要带着同一请求和记录走，不靠连续刷屏。',
  '- 机制正文 ' + chapters + ' 章：请求入口、登录、会话、权限、数据库、查询、页面、写入、案例。数据库、权限管理与登录各自完整展开；配置、语言和缓存接在实际使用处。',
  '- 49 / 16 / 36,751 等数字在机制走通后解释；不依赖看过 MyISAM 或 InnoDB。新增明细与历史记录由独立合成数据演示。',
  '- 中文先定稿，英文随后按定稿翻译和校对。当前英文为空，不能直接运行英文配音。',
  '- 时长按字数估算 ' + time(L.total) + '，含 12 秒静默片尾；尚无配音实测。交审建议范围 14–18 分钟，给机制和稳定阅读留余量；不以加速配音解决超长。',
  '- 具体职责、例子、拒绝路径和验收问题见 [子系统覆盖表](SUBSYSTEMS.md)；制作任务入口见 [AGENTS](../AGENTS.md)。', '',
  '## 2. 章节与预算', '', '| 段落 | 起点（估） | 时长（估） |', '|---|---:|---:|'];
for (const scene of L.scenes) lines.push('| ' + cell(scene.chap?.join(' ') || (scene.id === 'open' ? '开场' : scene.id === 'end' ? '片尾名单' : '收束')) + ' | ' + time(scene.start) + ' | ' + (scene.end - scene.start).toFixed(1) + ' 秒 |');
lines.push('', '## 3. 连贯正文', '');
for (const chapter of source.NARRATIVE) {
  lines.push('### ' + (chapter.title || (chapter.id === 'open' ? '开场' : '收束')), '');
  for (const [id, text] of chapter.paragraphs) lines.push(text, '');
}
lines.push(  '## 4. 每段的依据', '', 'R1 是 FACTS 中保留的第 1 轮逐句依据；A18 是匿名深入测绘；S19 是本轮子系统源码复核；C19 是时代背景与新版对照。全部事实以 [FACTS](FACTS.md) 为主账。', '', '| 段号 | 依据定位 |', '|---|---|');
for (const chapter of source.NARRATIVE) for (const [id,, facts] of chapter.paragraphs) lines.push('| ' + id + ' | ' + cell(facts) + ' |');
lines.push('', '## 5. 制作分句与对应', '', '正文先按语义组织，下面只供字幕、TTS 和场景对应。逗号处使用较短间隔，句末使用较长间隔；这仍是待试听方案，不是读音或停顿已验收。', '', '| cue | 字幕 / 旁白 | 所属段 | 依据 |', '|---|---|---|---|');
for (const chapter of source.SCRIPT) for (const [id, cap, options] of chapter.cues) if (options.pause == null) lines.push('| ' + id + ' | ' + cell(cap) + ' | ' + options.paragraph + ' | ' + cell(options.fact_refs) + ' |');
const widths = source.SCRIPT.flatMap(chapter => chapter.cues).filter(cue => cue[2]?.pause == null).map(cue => [...source.strip(cue[1])].reduce((n, char) => n + (char.charCodeAt(0) < 0x2e80 ? 0.5 : 1), 0));
const long = L.order.filter(id => !L.cues[id].silent && L.cues[id].d > 6);
lines.push('', '## 6. 自动结构检查与待确认事项', '',
  '- ' + widths.length + ' 条旁白；最大字幕宽度 ' + Math.max(...widths) + ' 字宽；估算超过 6 秒的旁白 ' + long.length + ' 条。结构检查不能代替试听和事实判断。',
  '- 请 WaterRun 确认当前 ' + chapters + ' 章、约 ' + time(L.total) + ' 的中文正文与 14–18 分钟制作预算；有修改意见时可直接给段号。',
  '- 确认后由 Opus 从配音试听、静帧和代表片段开始；发现实质文案问题须回到人工审稿。任务入口见 ../AGENTS.md。',
  '- 口令、会话与令牌只用占位；私有案例原始文件、真实数据与网络配置不进入交接包。',
  '- 本轮未生成语音或成片。Gemini 的交通法讨论属于另一部片子的计划，不列为本片参与模型。', '');
fs.writeFileSync(path.join(root, 'research/SCRIPT-' + round + '.md'), lines.join('\n'));
console.log(JSON.stringify({ status: 'pending-human-review', duration: L.total, narration: widths.length, max_caption_width: Math.max(...widths), long_cues: long.length, content_sha256: current.hash, script_sha256: sha }));
