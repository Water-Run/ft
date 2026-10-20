// 分镜结构唯一维护在 brief/storyboard.json；导出阅读版和关键字对应。
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
process.env.VLANG = 'zh';
const source = require(path.join(root, 'src/js/script.js'));
const board = JSON.parse(fs.readFileSync(path.join(root, 'brief/storyboard.json'), 'utf8'));
const paragraphs = new Map(source.NARRATIVE.flatMap(scene => scene.paragraphs.map(p => [p[0], scene.id])));
const seen = new Set(), expected = {};
const lines = ['# 04 逐段分镜', '', '由 tools/export_storyboard.cjs 从 storyboard.json 导出；修改结构文件后重导。所有时间以配音后的 cue / 词边界定位，本表不把估算秒数当实测。', '',
'一组段落共用一个连续空间。句中只高亮对应对象；该组最后一句结束时，expect 的词须完整可见。稳定时间是文字全到位且镜头停止后的最低值，不能包含入场与退场。', '',
'每组覆盖的 cue 均由段号 r2_<段号>_<序号> 自动生成。完整旁白见 [SCRIPT-R3](../research/SCRIPT-R3.md)。', '',
'| 分镜 / 场景 | 段号 | 画面动作 | 必须得到的结果 | 完全可读的末句 / 文字 | 最低稳定区间 |', '|---|---|---|---|---|---:|'];
const cell = s => String(s).replaceAll('|', '\\|');
for (const step of board.steps) {
  for (const id of step.paragraphs) {
    if (!paragraphs.has(id) || paragraphs.get(id) !== step.scene || seen.has(id)) throw new Error('分镜段号错误或重复：' + id);
    seen.add(id);
  }
  const last = step.paragraphs.at(-1);
  const cues = source.SCRIPT.flatMap(s => s.cues).filter(c => c[2]?.paragraph === last);
  const cue = cues.at(-1)?.[0];
  if (!cue || !step.expect.length || step.stable_seconds < 3) throw new Error('分镜缺少关键字 / 稳定时间：' + step.id);
  expected[cue] = step.expect;
  lines.push('| ' + [step.id + ' / ' + step.scene, step.paragraphs.join('、'), step.action, step.result, cue + '：' + step.expect.join('、'), step.stable_seconds + ' 秒'].map(cell).join(' | ') + ' |');
}
const missing = [...paragraphs.keys()].filter(id => !seen.has(id));
if (missing.length) throw new Error('未覆盖正文段落：' + missing.join(' '));
lines.push('', '片尾 r2_credits：至少 12 秒，完整显示策划 WaterRun、实际模型与分工、“开源视频”及 github.com/Water-Run/ft。最终名单来自 FACTS，不能提前写入未发生的贡献。', '');
expected.r2_credits = ['WaterRun', 'GPT-6 Astra', '开源视频', 'github.com/Water-Run/ft'];
fs.writeFileSync(path.join(root, 'brief/04-storyboard.md'), lines.join('\n'));
fs.writeFileSync(path.join(root, 'expect.zh.json'), JSON.stringify(expected, null, 2) + '\n');
console.log(JSON.stringify({ paragraphs: seen.size, storyboards: board.steps.length, checkpoints: Object.keys(expected).length }));
