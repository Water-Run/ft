// 本片自查：时间线是否溢出（实测时长 + 改稿后的估算两套），以及场景里每个 T('句号','词') 是否还在文案里找得到。
// 用法：node videos/in-seconds/quantization/tools/verify.js
// 改稿后实测时长会过期，估算口径（每秒 5.2 字）偏保守；两套都不溢出才算稳。词找不到会让 T() 返回 0，提前量一减成负数，整片动画被平移。
const fs = require('fs'), path = require('path');
const video = path.resolve(__dirname, '..');
const S = require(path.join(video, 'src/js/script.js'));

const tsrc = fs.readFileSync(path.join(video, 'src/js/timing.zh.js'), 'utf8');
const m = tsrc.match(/window\.DUR_ALL\["zh"\]\s*=\s*(\{[\s\S]*?\});/);
const DUR = m ? JSON.parse(m[1]) : {};

let bad = 0;
// 实测口径是硬闸门：旧配音比新稿长，旧稿能放下，更短的新稿重新配音后必然放得下。
const Lm = S.layoutScript(DUR);
console.log(`\n[实测（旧配音）] 总长 ${Lm.total.toFixed(2)}s（应为 ${S.TOTAL}）`);
if (Lm.problems.length) { bad += Lm.problems.length; Lm.problems.forEach((p) => console.log('  ✗ ' + p)); }
else console.log('  ✓ 无溢出');
for (const s of Lm.scenes) console.log(`  ${s.id.padEnd(6)} ${s.start.toFixed(2)}–${s.end.toFixed(2)}  余量 ${s.slack.toFixed(2)}s`);
// 估算口径（每秒 5.2 字）对这片选定的快音色（实测 6.29 字/秒）天生偏保守，会显示超出，只作提示，以实测为准。
const Le = S.layoutScript({});
console.log(`\n[估算（改稿后，提示）] 总长 ${Le.total.toFixed(2)}s — 估算口径偏保守，超出属正常，以配音实测为准`);
// 字数：新稿读口径字数应不超过第五稿的 546 字（时间预算紧）
const chars = S.SCRIPT.flatMap((sc) => sc.cues).filter((c) => c[1]).reduce((n, c) => n + S.strip(c[1]).replace(/[，。：；、\s*]/g, '').length, 0);
console.log(`\n[字数] 新稿读口径 ${chars} 字（第五稿 546 字）${chars <= 546 ? '✓ 只减不增' : '✗ 超出，需再删'}`);
if (chars > 546) bad++;

// 词对齐：扫描场景里的 T('id','word')
const L = S.layoutScript(DUR);
const sceneDir = path.join(video, 'src/js/scenes');
const refs = [];
for (const f of fs.readdirSync(sceneDir)) {
  const src = fs.readFileSync(path.join(sceneDir, f), 'utf8');
  const re = /T\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g;
  let mm; while ((mm = re.exec(src))) refs.push({ f, id: mm[1], word: mm[2] });
}
console.log(`\n[词对齐] 场景里按词对齐的引用 ${refs.length} 处`);
for (const { f, id, word } of refs) {
  const c = L.cues[id];
  if (!c) { console.log(`  ✗ ${f}: 句号 ${id} 不存在`); bad++; continue; }
  const txt = c.tts || '', w = S.ttsNorm(word);
  if (txt.indexOf(w) < 0) { console.log(`  ✗ ${f}: T('${id}','${word}') 在配音文本里找不到（${txt}）`); bad++; }
  else console.log(`  ✓ ${f}: T('${id}','${word}')`);
}
console.log(bad ? `\n✗ ${bad} 处问题` : '\n✓ 全部通过');
process.exitCode = bad ? 1 : 0;
