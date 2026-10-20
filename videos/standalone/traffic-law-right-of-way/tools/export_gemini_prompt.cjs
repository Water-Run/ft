// 将当前中文交审稿、事实与来源合并为可直接复制的网页讨论材料；不提交给任何在线服务。
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const date = process.argv[2];
if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error('用法：node tools/export_gemini_prompt.cjs YYYY-MM-DD');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const scriptHash = sha('src/js/script.js');
if (!read('research/script-review.md').includes(scriptHash)) throw new Error('交审材料与当前源稿哈希不一致，先更新交审材料');
const body = [read('research/gemini-instructions.md').trimEnd(), '',
  '---', '', '打包日期：' + date + '。当前第 7 稿 SHA-256：`' + scriptHash + '`。',
  'FACTS 快照 SHA-256：`' + sha('research/FACTS.md') + '`。', '',
  '本包由 GPT-6 Astra 整理。事实出处属于原制作记录；待讨论的模型尚未登记为实际参与。', '',
  '## 附件 A：完整交审材料', '', read('research/script-review.md').trimEnd(), '',
  '## 附件 B：事实台账快照', '', read('research/FACTS.md').trimEnd(), '',
  '## 附件 C：来源登记快照', '', '```json', read('research/sources.json').trimEnd(), '```', '',
  '---', '', '接下来先给第一轮诊断和一个示范段，不直接改写整片。', ''].join('\n');
fs.writeFileSync(path.join(root, 'research/GEMINI-PROMPT.md'), body);
console.log('已生成 research/GEMINI-PROMPT.md；' + body.length + ' 字符；未调用在线服务。');
