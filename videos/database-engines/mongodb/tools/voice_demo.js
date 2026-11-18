// 写配音试听的代表句：取 script.js 里的几句，按 SAY 表换成合成文本，写到 out/audition/voices/sample.txt。
// 第 1 轮（2026-11-16）用的是第 1 稿（79b77f7b）的句号；第 2 稿改了句号，这些 id 已不全在。要重做第 1 轮试听，先检出第 1 稿的 script.js；审片页里照录的样本文本见 tools/audition.js 的 SAMPLE_R1。
const fs = require('fs'), path = require('path');
const S = require(path.join(__dirname, '..', 'src', 'js', 'script.js'));
const IDS = ['o1', 'o2', 'o3', 'o4', 'b10', 'b11', 'd10', 'd11', 'd12', 'd13', 'g13', 'g14', 'g15'];
const all = {}; for (const sc of S.SCRIPT) for (const c of sc.cues) all[c[0]] = c;
const out = path.join(__dirname, '..', 'out', 'audition', 'voices'); fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'sample.txt'), IDS.map((i) => S.ttsText(all[i])).join(''));
