// 生成本地审片页 out/audition/index.html（out/ 不入库）：连贯文案与逐句表、5 个配音候选、3 个配乐小样、3 个视觉方向的关键帧，一处看完、一次选定。
// 数据全部从源头读：文案取 src/js/script.js；配音取 out/audition/voices/（tools/audition_voices.py 的产物）；配乐取 out/audition/music/（tools/demo_music.py）；
// 关键帧取 shots/page__design_keyframes_html_d_<方向>_f_<帧>.png（look.js 截 src/design/keyframes.html）。改了源头，重跑本脚本即可。
// 用法（仓库根）：node videos/in-seconds/github-collaboration/tools/audition_page.js
const fs = require('fs'), path = require('path');
const VIDEO = path.resolve(__dirname, '..'), OUT = path.join(VIDEO, 'out', 'audition');
const S = require(path.join(VIDEO, 'src', 'js', 'script.js'));
const P = JSON.parse(fs.readFileSync(path.join(VIDEO, 'project.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rd = (f, d = null) => { try { return JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')); } catch (e) { return d; } };
// 策划者已选定的（2026-11-16）：选定后在页首标出，并在各卡片上标「已选定」
const PICKED = { voice: 'Chinese (Mandarin)_Warm_Girl', music: 'B · 分支与合并', visual: 'A 为主，结合 C', when: '2026-11-16' };
const exportFile = fs.readdirSync(path.join(VIDEO, 'review')).find((f) => /^script\.zh\.[0-9a-f]{64}\.md$/.test(f));
const HASH = exportFile ? exportFile.slice(10, 74) : '（未导出）';

// ── 口播量与时长：按候选音色的实测语速推算（未配全片，只是估计）──
const U = (t) => { t = S.strip(t); return (t.match(/[一-鿿]/g) || []).length + (t.match(/[A-Za-z0-9]+/g) || []).length * 1.2; };
const lines = rd('voices/lines.json', []), sum = rd('voices/summary.json', { voices: {} });
const LU = lines.reduce((a, l) => a + U(l.cap), 0);
const VOICES = [
  { id: 'Chinese (Mandarin)_Warm_Girl', label: '温暖少女', who: '女声', note: '回听最干净的一个：「加盐 / 加糖」「Git」「GitHub」都听对了；Fork 被听成 folk（可能只是不卷舌的读法）。' },
  { id: 'Chinese (Mandarin)_Warm_Bestie', label: '温暖闺蜜', who: '女声', note: '回听里两处「Git」被听成 get / gith，「提改动」听成「替改动」：可能只是识别误差，请耳听。' },
  { id: 'Chinese (Mandarin)_Gentle_Senior', label: '温柔学长', who: '男声', note: '天生最慢的一档：1.2 倍下全片约 147 秒，余量最小。回听里「Closes」「提改动」不稳。' },
  { id: 'Chinese (Mandarin)_Southern_Young_Man', label: '南方小哥', who: '男声', note: '音色 id 提示带南方口音，可能更亲切，也可能不够标准。回听里「加盐」被听成「佳业」，请耳听。' },
  { id: 'chunzhen_xuedi', label: '纯真学弟', who: '男声', note: '天生偏慢，用到 1.25 倍（本系列以往用过的上沿）。回听里「Git」「Pull Request」「收不收」不稳。' },
];
const rates = [];
for (const v of VOICES) {
  const o = sum.voices[v.id] || { lines: {} };
  const tot = Object.values(o.lines).reduce((a, x) => a + (x.d || 0), 0), n = Object.keys(o.lines).length;
  v.speed = o.speed; v.demo = tot; v.rate = tot ? LU / (tot - 0.18 * n) : null;   // 每段 mp3 尾部约 0.18 秒静音（silencedetect 实测），按句扣掉
  v.file = 'voices/' + v.id.replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_|_$/g, '') + '.mp3';
  v.asr = (() => { try { return fs.readFileSync(path.join(OUT, v.file.replace('.mp3', '.asr.txt')), 'utf8').split('\n').map((l) => l.slice(14).trim()).filter(Boolean); } catch (e) { return []; } })();
  if (v.rate) rates.push(v.rate);
}
rates.sort((a, b) => a - b);
const RATE = rates.length ? rates[Math.floor(rates.length / 2)] : 4.6;
const DUR = {};
for (const sc of S.SCRIPT) for (const c of sc.cues) if (c[1]) DUR[c[0]] = { d: U(c[1]) / RATE };
const L = S.layoutScript(DUR);
let fixed = 0, speechU = 0;
for (const sc of S.SCRIPT) { fixed += (sc.lead || 0) + (sc.tail != null ? sc.tail : 0.6); for (const c of sc.cues) { if (c[2].pause != null) fixed += c[2].pause; else { speechU += U(c[1]); fixed += c[2].gap != null ? c[2].gap : 0.3; } } }
for (const v of VOICES) v.total = v.rate ? speechU / v.rate + fixed : null;
const PICK_TOTAL = (VOICES.find((v) => v.id === 'Chinese (Mandarin)_Warm_Girl') || {}).total;
const TOTS = VOICES.map((v) => v.total).filter(Boolean), RANGE = TOTS.length ? `${Math.floor(Math.min(...TOTS))}–${Math.ceil(Math.max(...TOTS))}` : '—';

// ── 文案的注记：句号 → FACTS 条目；新增或改动的说明 ──
const FACT = {
  o1: '例子（虚构，见 README「设计」）', o2: '例子的代码逻辑：age > 18 不含 18 本身', o3: 'F11.1、F11.2', o4: 'F1.3、F1.4、F3.1',
  a1: 'F10.3', a2: 'F10.1', a3: 'F10.1、F10.2、F10.4', a4: 'F10.3', a5: 'F11.1–F11.3', a6: 'F1.3、F2.1、F3.1',
  b1: 'F1.4、F10.4', b2: 'F1.1、F1.3、F10.4', b3: 'F2.1、F2.4（名字为例）', b4: 'F2.1、F2.2', b5: 'F3.2', b6: 'F1.5、F2.2',
  b7: 'F3.1、F10.8', b8: 'F10.6', b9: 'F3.1', b10: 'F12.2、F6.6', b11: 'F12.3、F3.3', b12: 'F4.1', b13: 'F3.5、F3.6',
  c1: 'F6.2、F12.1', c2: 'F5.1', c3: 'F6.1、F6.2、F12.1', c4: 'F6.4（实测空号）', c5: 'F7.1、F7.2', c6: 'F7.3',
  d1: 'F2.3', d2: 'F2.3、F10.7', d3: 'F10.7', d4: 'F10.7（GitLab 仓库即 Git 仓库）',
  e1: 'F1.3、F2.1、F3.1', e2: 'F3.1', e3: 'F1.4、F3.6',
};
const NOTE = {
  o1: '例子换成一行代码的 bug（策划者 2026-11-16 选定）', o2: '新增：错在哪一行，「大于」与「大于等于」读得出区别', o3: '开场不再说「推送被拒」：那句要实测回显，现在只讲权限这个事实', o4: '反差钩子',
  a1: '新增：分清 Git 与 GitHub（策划者 2026-11-16 要求）', a3: '新增：三样都是网站的功能', a4: '新增：分支、提交属于 Git', a5: '新增：谁能直接改；引出「维护者」', a6: '路线图：三步',
  b2: '「副本」这个词在这里落地', b4: '说出为什么要开分支', b6: '承上启下：改动已在，原仓库没变',
  b8: '新增：PR 的字面意思（Git 自带的 request-pull 也是「请对方拉取」）', b9: '核心纠偏：PR 是申请，不是写入', b11: '「也能让机器跑检查」：检查要仓库配置，不说成必然',
  b12: '草稿 PR（简报要求）', c1: '新增：用「为什么不是 #1」引出编号', c2: 'Issue 先定义，再讲共用编号', c4: '不回收（实测）',
  c6: 'Refs 不进旁白（回听里读不稳），画面上作「只是提一下」的例子；改为「只写 #12」', d3: '新增：换个平台叫法不同，回扣「不属于 Git」', d4: '新增：收回分界',
  e3: '新增：决定权在维护者，回答开头「没有权限为什么还能改」',
};
const TERMS = [
  ['Git', 'a1', 'a1', '工具，记下每一次修改'], ['GitHub', 'a2', 'a2', '网站，把这些项目放到网上'], ['仓库', 'a5', 'a5（画面注解）', '一个项目在网站上的家；画面上给注解，旁白不另解释'],
  ['维护者', 'a5', 'a5', '拿到写权限、能直接改的人（F11.3）'], ['Fork', 'a3', 'b1–b2', '在网站上把仓库复制一份到你名下'], ['分支', 'a4', 'b3–b4', '从主线岔出去的一条工作线'],
  ['Pull Request（PR）', 'a3', 'b7–b10', '请维护者把改动拉过去的申请页'], ['Issue', 'a3', 'c2', '记下要解决的问题'],
];
const OPEN = [
  ['例子是虚构的', '「阿梅 / 活动报名」与「age > 18 改成 >=」都是演示用的虚构仓库；GitHub 用户名只能用英文字母，中文名不会与真实账号撞名。画面不出现任何真实账号。'],
  ['「Fork」的读法', '几个音色的回听把 Fork 听成「folk / fog」，可能只是英式读法（不卷舌），也可能读得含糊。请听一下；需要的话在 SAY 表里改成更清楚的写法。'],
  ['GitLab 那一句要不要留', 'd3–d4 约 7 秒，是这次为了「说明这不是 Git 的标准内容」加的：换个平台叫法就变，说明这些是网站的设计。删掉它，分界只在 a3–a4 讲一次。'],
  ['时长余量', `按选定的温暖少女（1.2 倍）的实测语速推算，全片约 ${PICK_TOTAL ? PICK_TOTAL.toFixed(0) : '—'} 秒（定长 150 秒，旁白须在 142.5 秒前说完）；5 个候选的范围是 ${RANGE} 秒。全片配音后以实测为准：超出就删句或把语速提到 1.23，不压停顿。`],
  ['编号的两个细节没讲', '转移出去的 Issue 旧号会跳转（F6.5）、/issues/N 与 /pull/N 互跳（F6.3）：都是真的，但 150 秒放不下，留在画面上或不出现。'],
];
const MUSIC = [
  { f: 'music/A-commit.mp3', name: 'A · 提交', bpm: 120, key: 'F 大调', inst: '毛毡钢琴分解和弦 · 机械键盘的「咔嗒」做八分音符 · 最高处一句钟片（C A F G | A C D C）· 轻底鼓与低音',
    why: '打字、提交、推送都是「按下去」的动作：键盘声就是节拍。适合方向 A（真实界面）。', marks: [[0, '引子：只有钢琴'], [12, '推进：键盘声进来'], [30, '最高处：钟片与低音'], [48, '收束']] },
  { f: 'music/B-branch-merge.mp3', name: 'B · 分支与合并', bpm: 80, key: 'D 大调', inst: '两支马林巴：先同一句，推进时错一个八分做卡农，最高处各走各的反向线，第 45 秒并回同度；铺底与摇铃',
    why: '音乐自己演「分开再合并」：两条旋律线就是两条分支。适合方向 B（网络图）。', marks: [[0, '引子：一条线'], [12, '推进：第二条线跟上'], [30, '最高处：两条线分开'], [45, '合并：并回同度'], [48, '收束']] },
  { f: 'music/C-network.mp3', name: 'C · 仓库网络', bpm: 120, key: 'A 小调 → C 的明亮色彩', inst: '宽铺底 · 玻璃质感的十六分音符琶音逐渐浮起 · 最高处半拍底鼓、边击与慢旋律 · 收束只剩铺底',
    why: '安静、有空间感，把注意力留给画面上的字和编号。适合方向 C（时间线）。', marks: [[0, '引子：铺底'], [12, '推进：琶音浮起'], [30, '最高处：鼓与旋律'], [48, '收束']] },
];
const KF = [
  { d: 'A', name: '跟着一个 PR 走', sub: '真实界面临摹 · 浅色', frames: ['标题：片名压在那一行写错的代码上', '信息最密：PR 申请页（三处注解指「从哪、到哪、改了哪」）', '图解：Fork，从按钮复制到你名下'],
    method: '画面就是 GitHub 网页本身：仓库页 → Fork → 副本 → 分支 → PR 页 → 合并。镜头在一页里推近、指认，换页时带着同一个对象过去（那一行 if (age > 18)）。右上角仪表是这次改动的状态：还没开始 → Open #13 → Merged。',
    plus: '观众看完就认得真界面，下次自己点得到；GitHub 的样子一眼可认（F16）。', minus: '界面是静的，容易变成一页页换图；要靠「那一行」在页间移动、注解原地出现来保持连续（F23、F29）。', music: 'A · 提交' },
  { d: 'B', name: '一条改动的旅程', sub: '网络图 · 深色', frames: ['标题：主线、分支与合并点做底', '信息最密：两个仓库两条带，一个提交从分支经 PR 回到主线', '图解：Git 在下，网站的功能在上；GitLab 只换上层的叫法'],
    method: '两个仓库画成两条带，一个绿色的提交点就是这次改动：在副本的分支上出生，沿 PR 的箭头走向原仓库的主线，合并时变紫。权限画成带上的锁。右上角仪表是一条缩小的线，点走到哪就亮到哪。',
    plus: '「为什么要隔开」「为什么要申请」能画成结构：点在哪条线上，一眼看清（F23 的过程模型）；Git 与 GitHub 的分界可以画成上下两层。', minus: '离真实界面远，观众要自己把图对回网页；深色更像技术图解。', music: 'B · 分支与合并' },
  { d: 'C', name: '一个编号的生平', sub: '时间线部件 · 浅色', frames: ['标题：Issue #12 先出现在时间线上', '信息最密：PR #13 的时间线一条条往下累积；右侧是仓库的编号簿', '图解：编号一格一格排，空号不补，副本另起一套'],
    method: '用 GitHub 自己的时间线部件讲：fork、建分支、提交、开草稿、留言、检查、合并、关闭 #12，一条条往下长。右上角仪表是「仓库的下一个号」，每新建一个 Issue 或 PR 就加一。',
    plus: '编号那一段最自然；事件按发生顺序累积，本身就是时间推进。', minus: '「为什么要 Fork、为什么要分支」不容易画出来；前半段会像在读日志。', music: 'C · 仓库网络' },
];

// ── 页面 ──
const cueRows = [];
for (const sc of S.SCRIPT) for (const c of sc.cues) {
  const cu = L.cues[c[0]], cap = c[1];
  cueRows.push({ sc: sc.id, id: c[0], t: cu.start, d: cu.d, cap, silent: c[2].pause != null, tts: cap ? S.ttsText(c) : '', fact: FACT[c[0]] || '', note: NOTE[c[0]] || '' });
}
const SCN = { open: '现象', what: '它是什么', how: '它怎么工作', numbers: '原来如此：编号', boundary: '边界', close: '结论', outro: '片尾' };
const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const capHTML = (s) => esc(s).replace(/\*([^*]+)\*/g, '<b class="term">$1</b>');
const proseHTML = S.SCRIPT.filter((sc) => sc.cues.some((c) => c[1])).map((sc) => {
  const s = L.scenes.find((x) => x.id === sc.id);
  return `<div class="hunk"><div class="hunk-h"><b>@@ ${sc.id} @@</b><span>${SCN[sc.id]}</span><span class="mono">${fmt(s.start)} – ${fmt(s.end)}</span></div><p class="prose">${sc.cues.filter((c) => c[1]).map((c) => `<span class="cue${NOTE[c[0]] && NOTE[c[0]].startsWith('新增') ? ' new' : ''}" title="${c[0]}">${capHTML(c[1])}</span>`).join('')}</p></div>`;
}).join('');
const tableHTML = cueRows.map((r) => r.silent
  ? `<tr class="silent"><td class="mono">${r.id}</td><td class="mono">${fmt(r.t)}</td><td colspan="3">（无旁白 · ${r.sc === 'outro' ? '片尾名单，取自 project.json 的 credits' : '片名卡'} · ${r.d.toFixed(1)} 秒）</td></tr>`
  : `<tr${NOTE[r.id] && NOTE[r.id].startsWith('新增') ? ' class="new"' : ''}><td class="mono">${r.id}</td><td class="mono">${fmt(r.t)}<br><span class="k">${r.d.toFixed(1)}s</span></td><td>${capHTML(r.cap)}${S.strip(r.cap) + '。' !== r.tts && S.strip(r.cap) !== r.tts.replace(/。$/, '') ? `<div class="tts">读作：${esc(r.tts.replace(/。+$/, ''))}</div>` : ''}${r.note ? `<div class="nt">${esc(r.note)}</div>` : ''}</td><td class="fact">${esc(r.fact)}</td></tr>`).join('');
const sceneBar = L.scenes.map((s) => `<div class="seg seg-${s.id}" style="flex:${(s.end - s.start).toFixed(2)}" title="${SCN[s.id]} ${fmt(s.start)}–${fmt(s.end)}"><span>${SCN[s.id]}</span></div>`).join('');
const voiceCards = VOICES.map((v, i) => `<div class="card vc"><div class="card-h"><span class="badge">${i + 1}</span><b>${v.label}</b><span class="k">${v.who}</span><code>${esc(v.id)}</code></div>
  <div class="card-b"><audio controls preload="none" src="${v.file}"></audio>
  <div class="kv"><span>语速</span><b>${v.speed}</b><span>样段</span><b>${v.demo.toFixed(1)} 秒</b><span>推算全片</span><b class="${v.total > 149 ? 'warn' : ''}">${v.total ? v.total.toFixed(0) + ' 秒' : '—'}</b></div>
  <p>${esc(v.note)}</p>
  <details><summary>Whisper 回听（同音字不算错，只看漏读与英文）</summary><ol class="asr">${v.asr.map((l) => `<li>${esc(l)}</li>`).join('')}</ol></details>
  <label class="pick"><input type="radio" name="voice" value="${esc(v.id)}"${v.id === PICKED.voice ? ' checked' : ''}> 选这个${v.id === PICKED.voice ? ' <span class="state" style="background:var(--sucE)">已选定</span>' : ''}</label></div></div>`).join('');
const musicCards = MUSIC.map((m) => `<div class="card"><div class="card-h"><b>${m.name}</b><span class="k">${m.bpm} 拍/分 · ${m.key}</span></div><div class="card-b">
  <audio controls preload="none" src="${m.f}" data-music></audio><div class="marks">${m.marks.map(([t, l]) => `<button class="chipbtn" data-seek="${t}">${t}s ${l}</button>`).join('')}</div>
  <p><b>配器：</b>${esc(m.inst)}</p><p class="k">${esc(m.why)}</p><label class="pick"><input type="radio" name="music" value="${esc(m.name)}"${m.name === PICKED.music ? ' checked' : ''}> 选这个${m.name === PICKED.music ? ' <span class="state" style="background:var(--sucE)">已选定</span>' : ''}</label></div></div>`).join('');
const kfCards = KF.map((k) => `<div class="card kfc"><div class="card-h"><span class="badge">${k.d}</span><b>${k.name}</b><span class="k">${k.sub}</span></div><div class="card-b">
  <div class="kf-row">${k.frames.map((cap, i) => `<figure><button class="kf" data-full="keyframes/${k.d}${i + 1}.png" data-cap="${esc(k.name + ' · ' + cap)}"><img loading="lazy" src="keyframes/${k.d}${i + 1}.png" alt="${esc(cap)}"></button><figcaption>${esc(cap)}</figcaption></figure>`).join('')}</div>
  <p><b>怎么讲：</b>${esc(k.method)}</p><p><b class="ok">长处：</b>${esc(k.plus)}</p><p><b class="warn">风险：</b>${esc(k.minus)}</p><p class="k">配乐建议：${esc(k.music)}</p>
  <label class="pick"><input type="radio" name="visual" value="${k.d} ${esc(k.name)}"> 选这个方向${'AC'.includes(k.d) ? ` <span class="state" style="background:var(--sucE)">${k.d === 'A' ? '已选定 · 为主' : '已选定 · 结合'}</span>` : ''}</label></div></div>`).join('');

const oct = (d, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="${d}"/></svg>`;
const I = {
  pr: 'M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z',
  repo: 'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z',
};
const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>审片页 · 150 秒速通 GitHub 协作</title>
<style>
:root{--fg:#1f2328;--muted:#59636e;--accent:#0969da;--success:#1a7f37;--done:#8250df;--danger:#d1242f;--attention:#9a6700;--bg:#fff;--bgm:#f6f8fa;--accm:#ddf4ff;--sucm:#dafbe1;--attm:#fff8c5;--donem:#fbefff;--bd:#d1d9e0;--bdm:#d1d9e0b3;--ul:#fd8c73;--sucE:#1f883d;--doneE:#8250df;
--ui:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans","Microsoft YaHei","PingFang SC",Helvetica,Arial,sans-serif;--mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace}
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth;scroll-padding-top:110px}
body{font-family:var(--ui);font-size:14px;line-height:1.6;color:var(--fg);background:var(--bg)}
a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
code,.mono{font-family:var(--mono);font-size:12px}code{background:var(--bgm);border-radius:6px;padding:1px 6px;overflow-wrap:anywhere}
.ic{width:16px;height:16px;fill:currentColor;vertical-align:text-bottom;flex:none}
.wrap{max-width:1180px;margin:0 auto;padding:0 16px}
header.top{border-bottom:1px solid var(--bd);background:var(--bgm)}
header.top .wrap{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;padding-top:16px;padding-bottom:16px}
.crumb{display:flex;align-items:center;gap:6px;font-size:18px;min-width:0;flex-wrap:wrap}.crumb .k{color:var(--muted)}.crumb b{color:var(--accent)}
.state{display:inline-flex;align-items:center;gap:6px;border-radius:2em;padding:4px 12px;font-size:13px;font-weight:600;color:#fff;background:#59636e}
h1{font-size:26px;font-weight:400;line-height:1.3;margin:20px 0 6px}h1 .num{color:var(--muted);font-weight:300}
.meta{color:var(--muted);font-size:13px;display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}
.chip{display:inline-flex;align-items:center;gap:4px;font-family:var(--mono);font-size:12px;color:var(--accent);background:var(--accm);border-radius:6px;padding:1px 8px}
nav.tabs{position:sticky;top:0;z-index:20;background:var(--bg);border-bottom:1px solid var(--bd);margin-top:16px}
nav.tabs .wrap{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none}
nav.tabs a{padding:10px 10px;color:var(--fg);white-space:nowrap;border-bottom:2px solid transparent;font-size:14px}
nav.tabs a:hover{text-decoration:none;border-bottom-color:var(--bd)}nav.tabs a.on{font-weight:600;border-bottom-color:var(--ul)}
.flash{border:1px solid #d4a72c66;background:var(--attm);border-radius:6px;padding:12px 16px;margin:16px 0}
section{padding:28px 0 8px}section>h2{font-size:20px;font-weight:600;border-bottom:1px solid var(--bd);padding-bottom:8px;margin-bottom:16px;display:flex;flex-wrap:wrap;gap:8px;align-items:baseline}
section>h2 .k{font-size:13px;font-weight:400}
.k{color:var(--muted)}.ok{color:var(--success)}.warn{color:var(--attention)}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:16px}
.card{border:1px solid var(--bd);border-radius:6px;overflow:hidden;background:var(--bg)}
.card-h{background:var(--bgm);border-bottom:1px solid var(--bd);padding:8px 14px;display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}
.card-h code{font-size:11px;margin-left:auto;overflow-wrap:anywhere}
.card-b{padding:14px}.card-b p{margin-top:8px}
.badge{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;border-radius:11px;background:var(--fg);color:#fff;font-size:12px;font-weight:600;padding:0 6px}
.answer{font-size:16px;line-height:1.7}.answer b{font-weight:600}
ol.path{padding-left:22px}ol.path li{margin:4px 0}
.bar{display:flex;height:34px;border-radius:6px;overflow:hidden;border:1px solid var(--bd);margin:12px 0 4px}
.seg{display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;overflow:hidden;white-space:nowrap;min-width:0}.seg span{overflow:hidden;text-overflow:ellipsis;padding:0 4px}
.seg-open{background:#59636e}.seg-what{background:#0969da}.seg-how{background:#1f883d}.seg-numbers{background:#8250df}.seg-boundary{background:#9a6700}.seg-close{background:#cf222e}.seg-outro{background:#25292e}
.seg-ruler{display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;color:var(--muted)}
.seg-toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:12px}
.seg-ctl{display:inline-flex;border:1px solid var(--bd);border-radius:6px;overflow:hidden}
.seg-ctl button{border:0;background:var(--bg);padding:5px 14px;font:inherit;cursor:pointer;color:var(--fg)}.seg-ctl button+button{border-left:1px solid var(--bd)}
.seg-ctl button.on{background:var(--accm);color:var(--accent);font-weight:600}
.btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--bd);border-radius:6px;background:var(--bgm);padding:5px 14px;font:inherit;font-weight:600;cursor:pointer;color:var(--fg)}
.btn.green{background:var(--sucE);border-color:transparent;color:#fff}
.hunk{border:1px solid var(--bd);border-radius:6px;margin-bottom:12px;overflow:hidden}
.hunk-h{background:var(--accm);font-family:var(--mono);font-size:12px;color:var(--muted);padding:6px 12px;display:flex;flex-wrap:wrap;gap:4px 12px}.hunk-h b{color:var(--accent)}
p.prose{padding:12px 14px;font-size:16px;line-height:1.9}
.cue{border-radius:3px}.cue.new{background:var(--sucm);box-shadow:0 0 0 2px var(--sucm)}
b.term{font-weight:600;color:var(--accent)}
.tablewrap{overflow-x:auto;border:1px solid var(--bd);border-radius:6px}
table{border-collapse:collapse;width:100%;font-size:13px}th,td{border-bottom:1px solid var(--bd);padding:7px 10px;text-align:left;vertical-align:top}
th{background:var(--bgm);font-weight:600;white-space:nowrap}tr:last-child td{border-bottom:0}
tr.new td:first-child{box-shadow:inset 3px 0 0 var(--sucE)}tr.silent td{color:var(--muted);background:var(--bgm)}
td.fact{font-family:var(--mono);font-size:11px;color:var(--muted);min-width:110px}
.tts{font-size:12px;color:var(--muted);margin-top:2px}.nt{font-size:12px;color:var(--attention);margin-top:2px}
.legend{font-size:12px;color:var(--muted);margin:8px 0}.legend .sw{display:inline-block;width:12px;height:12px;background:var(--sucm);border-radius:2px;vertical-align:-1px;margin-right:4px}
.open-q{border-left:3px solid var(--attention);background:var(--attm);border-radius:0 6px 6px 0;padding:8px 12px;margin-bottom:8px}
audio{width:100%;margin:2px 0 4px}
.kv{display:grid;grid-template-columns:auto 1fr auto 1fr auto 1fr;gap:2px 8px;font-size:12px;color:var(--muted);align-items:baseline}.kv b{color:var(--fg)}.kv b.warn{color:var(--attention)}
details{margin-top:8px}summary{cursor:pointer;color:var(--accent);font-size:12px}ol.asr{font-size:12px;color:var(--muted);padding-left:20px;margin-top:6px}
.pick{display:flex;gap:6px;align-items:center;margin-top:10px;padding-top:10px;border-top:1px solid var(--bdm);font-weight:600;cursor:pointer}
.marks{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0}
.chipbtn{border:1px solid var(--bd);background:var(--bg);border-radius:2em;padding:1px 10px;font-size:12px;cursor:pointer;color:var(--fg);font-family:inherit}.chipbtn:hover{border-color:var(--accent);color:var(--accent)}
.kf-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
@media(max-width:700px){.kf-row{grid-template-columns:1fr}}
figure{margin:0}figcaption{font-size:12px;color:var(--muted);margin-top:4px}
button.kf{display:block;width:100%;border:1px solid var(--bd);border-radius:6px;overflow:hidden;padding:0;background:var(--bgm);cursor:zoom-in;aspect-ratio:16/9}button.kf img{width:100%;height:100%;object-fit:cover;display:block}
.kfc .card-b>p{font-size:13px}
.lightbox{position:fixed;inset:0;background:#1f2328e6;display:none;z-index:50;align-items:center;justify-content:center;flex-direction:column;gap:10px;padding:16px}
.lightbox.show{display:flex}.lightbox img{max-width:100%;max-height:84vh;border-radius:6px;background:#fff}.lightbox .cap{color:#fff;font-size:13px;text-align:center}
.lightbox .x{position:absolute;top:12px;right:12px;background:#25292e;color:#fff;border:1px solid #59636e;border-radius:6px;padding:4px 12px;cursor:pointer}
textarea{width:100%;min-height:90px;border:1px solid var(--bd);border-radius:6px;padding:8px 10px;font:inherit;resize:vertical}
pre.out{background:var(--bgm);border:1px solid var(--bd);border-radius:6px;padding:10px 12px;font-family:var(--mono);font-size:12px;white-space:pre-wrap;word-break:break-all;margin-top:10px;min-height:40px}
ul.check{list-style:none}ul.check li{padding:4px 0 4px 24px;position:relative}ul.check li::before{content:"";position:absolute;left:4px;top:11px;width:8px;height:8px;border-radius:50%;background:var(--sucE)}
ul.check.no li::before{background:var(--attention)}
footer{border-top:1px solid var(--bd);margin-top:32px;padding:20px 0 40px;color:var(--muted);font-size:12px}
</style></head><body>
<header class="top"><div class="wrap">
  <div class="crumb">${oct(I.repo)}<span class="k">Water-Run / ft</span><span class="k">/</span><span>in-seconds</span><span class="k">/</span><b>github-collaboration</b></div>
  <span class="state">${oct(I.pr)}审片 · 待选定</span>
</div></header>
<div class="wrap">
  <h1>150 秒速通 GitHub 协作：为什么要 Fork、开分支、再提 PR <span class="num">审片页</span></h1>
  <div class="meta"><span>文案稿</span><span class="chip">${HASH.slice(0, 12)}</span><span>· 制作方 Claude Opus 5.5 · 取证底稿 Qwen 4 Max Preview · 生成于 ${new Date().toLocaleDateString('sv-SE')}</span></div>
  <div class="flash" style="background:var(--sucm);border-color:#4ac26b66"><b>${PICKED.when} 已选定：</b>配音「温暖少女」（<code>${PICKED.voice}</code>，1.2 倍）· 配乐 ${PICKED.music}（已按全片时间线写成 <code>tools/music.py</code>，草稿见「配乐」）· 视觉 ${PICKED.visual} · 封面初稿见「封面」。<b>文案仍待确认</b>：确认后才配全片。</div>
  <div class="flash"><b>这是选定用的审片页，不是确认。</b> 文案还没经校对确认，配音只是 10 句试听，不是全片；关键帧是静帧，不是成片。请在这一页看完：文案、5 个配音、3 个配乐、3 个视觉方向，到「选定」一栏勾选，把生成的文字发回会话即可。</div>
</div>
<nav class="tabs"><div class="wrap">
  <a href="#overview">概览</a><a href="#script">文案 <span class="k">${cueRows.filter((r) => !r.silent).length} 句</span></a><a href="#voices">配音 <span class="k">5</span></a><a href="#music">配乐 <span class="k">3</span></a><a href="#keyframes">关键帧 <span class="k">3×3</span></a><a href="#cover">封面</a><a href="#decide">选定</a><a href="#selfcheck">自查</a>
</div></nav>
<main class="wrap">

<section id="overview"><h2>概览</h2>
  <div class="grid2">
    <div class="card"><div class="card-h"><b>核心问题与回答</b></div><div class="card-b answer">
      <p><b>问：</b>别人的项目你没有权限改，为什么在 GitHub 上照样能给它提改动？</p>
      <p><b>答：</b>Fork 一份副本解决「没权限」，开分支解决「要隔开」，提 PR 解决「要被审」；收不收，维护者说了算。</p>
      <p class="k" style="font-size:13px">而且：Fork、PR、Issue 是 GitHub 网站的功能，<b>不是 Git 的一部分</b>；分支和提交才是 Git 自带的。换个平台叫法就变（GitLab 叫合并请求）。</p></div></div>
    <div class="card"><div class="card-h"><b>解释路径</b><span class="k">同一个例子走到底：「阿梅 / 活动报名」的判断写成了 age &gt; 18，刚满 18 岁的人报不上名</span></div><div class="card-b"><ol class="path">
      <li><b>现象</b>：别人的项目，你没权限改——但照样能提改动。</li>
      <li><b>是什么</b>：先分清 Git（工具）和 GitHub（网站）；谁能直接改一个仓库；三步办法。</li>
      <li><b>怎么工作</b>：Fork → 分支 fix-age → 把 &gt; 改成 &gt;=、提交、推送 → PR #13（请你拉取）→ 逐行意见、检查、草稿 → 维护者合并。</li>
      <li><b>原来如此</b>：为什么是 #13 不是 #1——Issue 与 PR 共用仓库的编号；Closes #12。</li>
      <li><b>边界</b>：有写权限就不用 Fork；GitLab 叫法不同，底下仍是 Git。</li>
      <li><b>结论</b>：三步各解决一个问题；决定权在维护者。</li></ol></div></div>
  </div>
  <div class="bar">${sceneBar}</div>
  <div class="seg-ruler"><span>0s</span><span>30</span><span>60</span><span>90</span><span>120</span><span>150s</span></div>
  <p class="k" style="font-size:12px;margin-top:4px">按 5 个候选音色的中位实测语速（每秒 ${RATE.toFixed(2)} 字）排出的时间线；定长 150 秒，片尾名单 7.5 秒无旁白。选定音色、全片配音后以实测为准。</p>
  <h3 style="font-size:16px;margin:20px 0 8px">相对准备方草稿（Qwen，2026-11-15）的大改</h3>
  <ul class="check">
    <li><b>新增 Git 与 GitHub 的分界</b>（策划者 2026-11-16「包括说明这不是Git的标准内容」）：a1–a4 先分清，d3–d4 用 GitLab 的叫法收回。新补事实 F10–F12，出处为 Git 官方的 <i>Pro Git</i>、git-request-pull 手册、GitHub 与 GitLab 官方文档。</li>
    <li><b>例子换成听得出来的错</b>：草稿的「eatting / eating」与第一版的「鸡旦 / 鸡蛋」读出来一样，观众听不出改了什么（回听实测）。现在用策划者选定的一行代码 bug：<code>age &gt; 18</code> 应为 <code>&gt;=</code>，「大于」「大于等于」读得出区别。</li>
    <li><b>每一步都说「为什么」</b>：权限规则引出 Fork，「主线不变」引出分支，「请你拉取」解释 PR 的名字；编号用「为什么是 #13 不是 #1」提问。</li>
    <li><b>开场不再依赖未取的回显</b>：草稿里「推送被拒」要一次性账号实测；现在只讲权限这个已核事实，测试账号实验不再是开工前提。</li>
    <li><b>结论回答开头</b>：「谁都能提改动；收不收，维护者说了算」。</li>
    <li><b>长度</b>：从 24 句草稿（估 150 秒，未实测）改为 ${cueRows.filter((r) => !r.silent).length} 句，按候选音色实测推算 ${RANGE} 秒。</li>
  </ul>
</section>

<section id="script"><h2>文案 <span class="k">稿本 SHA-256 <code>${HASH}</code> · 待校对</span></h2>
  <div class="seg-toolbar"><div class="seg-ctl"><button class="on" data-view="prose">连贯阅读</button><button data-view="table">逐句表</button></div>
    <button class="btn" id="copyScript">复制全文</button><span class="legend"><span class="sw"></span>本轮新增的句子</span></div>
  <div id="v-prose">${proseHTML}</div>
  <div id="v-table" hidden><div class="tablewrap"><table><thead><tr><th>句号</th><th>开始</th><th>字幕 · 读法 · 说明</th><th>依据（FACTS）</th></tr></thead><tbody>${tableHTML}</tbody></table></div></div>
  <h3 style="font-size:16px;margin:20px 0 8px">新名词</h3>
  <div class="tablewrap"><table><thead><tr><th>词</th><th>首次出现</th><th>讲清它的句子</th><th>说法</th></tr></thead><tbody>${TERMS.map(([w, a, b, c]) => `<tr><td><b>${esc(w)}</b></td><td class="mono">${a}</td><td class="mono">${b}</td><td>${esc(c)}</td></tr>`).join('')}</tbody></table></div>
  <p class="k" style="font-size:12px;margin-top:6px">简报的上限是四个主动教的名词（Fork、分支、PR、Issue）。Git、GitHub 是片名里的词，这次按要求讲清两者的分界；「仓库」「维护者」是普通词，画面上给注解。</p>
  <h3 style="font-size:16px;margin:20px 0 8px">读法与多音字</h3>
  <ul class="check"><li>「#13」读作「13号」；「PR」逐字母读「P R」；「fix-age」读作「fix age」；「哪一行」「逐行」的「行」读 háng（SAY 表改写，配音后逐条耳听）。</li>
  <li>「这处错误」改成「这个错误」，避开「处」的多音。「还有」读 hái，语境明确。</li></ul>
  <h3 style="font-size:16px;margin:20px 0 8px">请您定的取舍</h3>
  ${OPEN.map(([h, b]) => `<div class="open-q"><b>${esc(h)}</b><br>${esc(b)}</div>`).join('')}
</section>

<section id="voices"><h2>配音候选 <span class="k">MiniMax speech-2.8-hd · 同一组 10 句 · 都是此前片子没用过的音色</span></h2>
  <p class="k" style="margin-bottom:12px">样段录于换例子之前（当时是菜谱例子），只用来比较音色。样句：${lines.map((l) => `<code>${l.id}</code>`).join(' ')}（开场、Git 与 GitHub、PR、编号、Closes、结论）。每个音色的语速按它自己的快慢定，让全片都能放进 150 秒，不靠压停顿。</p>
  <div class="grid2">${voiceCards}</div>
</section>

<section id="music"><h2>配乐小样 <span class="k">各 60 秒：引子 → 推进 → 最高处 → 收束 · 程序合成，本片原创</span></h2>
  <p class="k" style="margin-bottom:12px">三首的拍点都落在 0.25 秒的网格上（系列约定）。史诗感收着用：没有铜管、合唱和大鼓。点时间标签可跳到该段。</p>
  <div class="grid2">${musicCards}</div>
  ${fs.existsSync(path.join(OUT, 'music', 'film-sketch.mp3')) ? `<div class="card" style="margin-top:16px"><div class="card-h"><b>选定之后 · 全片配乐草稿</b><span class="k">tools/music.py 按估算时间线试跑，150 秒，没有旁白</span></div><div class="card-b"><audio controls preload="none" src="music/film-sketch.mp3"></audio>
  <div class="marks">${[[0, '开场：一支马林巴'], [Math.round(L.cues.o3 ? L.cues.o3.end + 0.4 : 11), '片名卡：钟片'], [Math.round(L.cues.b1 ? L.cues.b1.start : 40), 'Fork：第二支照抄'], [Math.round(L.cues.b3 ? L.cues.b3.start : 48), '分支：反向'], [Math.round(L.cues.b13 ? L.cues.b13.start + 1 : 85), '合并：并成同度'], [Math.round(L.cues.e1 ? L.cues.e1.start : 125), '结论抬起']].map(([t, l]) => `<button class="chipbtn" data-seek="${t}">${t}s ${l}</button>`).join('')}</div>
  <p class="k">音乐演的是片子的过程：Fork 那一句第二支旋律照抄主线（副本），开分支时改走反向的线，点合并的那一拍两支并成同度。落点取自旁白句号，配音实测后自动对齐。</p></div></div>` : ''}
</section>

<section id="keyframes"><h2>关键帧 <span class="k">三种讲法 · 每种三张：标题、信息最密、图解 · 点图放大</span></h2>
  <p class="k" style="margin-bottom:12px">三个方向比较的是<b>怎么讲</b>，不只是配色：A 演真界面，B 画结构，C 记时间。色值来自 Primer 官方令牌，图标来自 Octicons（MIT），常驻元素（左上剩余秒数、右上仪表、底部字幕带与秒尺）三个方向都有、各按本方向画。</p>
  <div style="display:grid;gap:16px">${kfCards}</div>
  <div class="open-q" style="margin-top:16px"><b>制作方的建议</b><br>以 A 为主画面（观众要认得真界面），在讲「为什么要隔开、为什么要申请」的几句插入 B 的网络图（b4–b6、b9），编号那一段用 C 的编号条（c1–c4）。这是混合方案；只选一个方向也完全可以做。</div>
</section>

<section id="cover"><h2>封面 <span class="k">初稿 · 16:9 与 4:3 · 单独设计，不取截帧</span></h2>
  <p class="k" style="margin-bottom:12px">左边是秒数与片名，右边是全片那一处改动：一行代码的 diff「age &gt; 18 → age &gt;= 18」和一颗绿色的合并按钮，背后一个巨大的 Pull Request 图标。缩到 360 像素宽主标题仍清楚；底部 15% 不放字（投稿平台在那里叠时长与标题）。正式的 2 倍 PNG 与 JPG 由 <code>covers.js</code> 在文案确认后输出。</p>
  <div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))">${['169', '43'].map((r) => `<figure><button class="kf" style="aspect-ratio:${r === '169' ? '16/9' : '4/3'}" data-full="cover/cover-${r}.png" data-cap="封面 ${r === '169' ? '16:9' : '4:3'}"><img loading="lazy" src="cover/cover-${r}.png" alt="封面 ${r === '169' ? '16:9' : '4:3'}"></button><figcaption>${r === '169' ? '16:9（1920×1080）' : '4:3（1600×1200）'}</figcaption></figure>`).join('')}
  <figure><div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap"><img src="cover/cover-169.png" alt="" style="width:360px;border:1px solid var(--bd);border-radius:6px"><img src="cover/cover-169.png" alt="" style="width:180px;border:1px solid var(--bd);border-radius:6px"></div><figcaption>缩到 360 与 180 像素宽：投稿列表里大致的样子</figcaption></figure></div>
</section>

<section id="decide"><h2>选定</h2>
  <p class="k" style="margin-bottom:10px">在上面各栏勾选；下面会生成一段文字，复制后发回会话即可。文案的意见按「句号 + 问题 + 建议」写，例如 <code>b8：「请你拉取」不好懂，换个说法</code>。</p>
  <div class="grid2"><div><textarea id="notes" placeholder="文案意见、其他要求……"></textarea><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn green" id="copyPick">复制我的选择</button><span class="k" id="copied"></span></div></div>
  <pre class="out" id="pickOut">（还没有选择）</pre></div>
</section>

<section id="selfcheck"><h2>自查 <span class="k">交出前的自对抗审查</span></h2>
  <div class="grid2"><div><h3 style="font-size:14px;margin-bottom:6px">查过、改过的</h3><ul class="check">
    <li>逐句对照 FACTS：每句的依据列在逐句表；新补 F10（Git 与 GitHub 的分界）、F11（写权限）、F12（编号与 PR 页的第二来源）。</li>
    <li>用 Whisper 回听样段：发现「鸡旦 / 鸡蛋」同音，换例子；「PR」被听成「Pull」，读法改为逐字母；「Refs」几个音色读不稳，移出旁白。</li>
    <li>时长：按 5 个音色的实测语速推算全片 ${RANGE} 秒；单句不超过 6 秒，字幕不超过 26 字宽。</li>
    <li>多音字：「行」两处已改写；「这处」改「这个」。</li>
    <li>关键帧 9 张逐张看过：修掉了箭头压字、注解压字、PR 卡片压边框、中文字体未加载就截图、仪表文字被切与字号小于 24px。</li>
    <li>配乐：三首峰值 −1.8 到 −4.0 dBFS，不削波；四段的响度有起伏（引子到最高处约 5–7 dB）。</li>
  </ul></div><div><h3 style="font-size:14px;margin-bottom:6px">没查到、要靠您的</h3><ul class="check no">
    <li>我听不到声音：音色好不好听、「Fork」读得清不清、配乐的听感，只能请您耳听判断。</li>
    <li>关键帧是静帧：动起来的连续性（F23、F29）要到代表段才能验证。</li>
    <li>静帧上的剩余秒数是按估算时间线标的，只示意位置。</li>
    <li>MiniMax 音色列表接口返回的中文名在源头就是乱码，所以卡片上的中文名是按音色 id 写的。</li>
  </ul></div></div>
</section>
</main>
<footer><div class="wrap">本地审片页，不入库（out/ 由工具生成）。源头：<code>src/js/script.js</code> · <code>research/FACTS.md</code> · <code>tools/audition_voices.py</code> · <code>tools/demo_music.py</code> · <code>src/design/keyframes.html</code> · 生成：<code>tools/audition_page.js</code>。署名、片尾与发布按 GPL-3.0-or-later，仓库 ${esc(P.credits.repository)}。</div></footer>
<div class="lightbox" id="lb"><button class="x" id="lbx">关闭（Esc）</button><img id="lbi" alt=""><div class="cap" id="lbc"></div></div>
<script>
const SCRIPT_TEXT = ${JSON.stringify(S.SCRIPT.filter((sc) => sc.cues.some((c) => c[1])).map((sc) => sc.cues.filter((c) => c[1]).map((c) => S.strip(c[1])).join('')).join('\n\n'))};
document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('[data-view]').forEach((x) => x.classList.toggle('on', x === b));
  document.getElementById('v-prose').hidden = b.dataset.view !== 'prose'; document.getElementById('v-table').hidden = b.dataset.view !== 'table';
}));
const copy = (t, el) => { const ok = () => { if (el) { el.textContent = '已复制'; setTimeout(() => el.textContent = '', 1600); } };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(ok, () => fallback(t, ok)); else fallback(t, ok); };
const fallback = (t, ok) => { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); ok(); } catch (e) {} a.remove(); };
document.getElementById('copyScript').addEventListener('click', (e) => copy(SCRIPT_TEXT, e.target.nextElementSibling));
document.querySelectorAll('[data-seek]').forEach((b) => b.addEventListener('click', () => { const a = b.closest('.card-b').querySelector('audio'); a.currentTime = +b.dataset.seek; a.play(); }));
document.querySelectorAll('audio').forEach((a) => a.addEventListener('play', () => document.querySelectorAll('audio').forEach((o) => { if (o !== a) o.pause(); })));
const lb = document.getElementById('lb');
document.querySelectorAll('button.kf').forEach((b) => b.addEventListener('click', () => { document.getElementById('lbi').src = b.dataset.full; document.getElementById('lbc').textContent = b.dataset.cap; lb.classList.add('show'); }));
const closeLb = () => lb.classList.remove('show');
document.getElementById('lbx').addEventListener('click', closeLb); lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });
const pickOut = document.getElementById('pickOut');
const render = () => { const g = (n) => (document.querySelector('input[name="' + n + '"]:checked') || {}).value || '（未选）';
  const notes = document.getElementById('notes').value.trim();
  pickOut.textContent = 'GitHub 协作审片页（稿本 ${HASH.slice(0, 12)}）\\n配音：' + g('voice') + '\\n配乐：' + g('music') + '\\n视觉：' + g('visual') + (notes ? '\\n意见：\\n' + notes : ''); };
document.querySelectorAll('input[type=radio], #notes').forEach((el) => el.addEventListener('input', render)); render();
document.getElementById('copyPick').addEventListener('click', () => copy(pickOut.textContent, document.getElementById('copied')));
const links = [...document.querySelectorAll('nav.tabs a')], secs = links.map((a) => document.querySelector(a.getAttribute('href')));
const spy = () => { let i = 0; secs.forEach((s, k) => { if (s.getBoundingClientRect().top < 140) i = k; }); links.forEach((a, k) => a.classList.toggle('on', k === i)); };
addEventListener('scroll', spy, { passive: true }); spy();
</script>
</body></html>`;
fs.mkdirSync(path.join(OUT, 'keyframes'), { recursive: true }); fs.mkdirSync(path.join(OUT, 'cover'), { recursive: true });
for (const r of ['169', '43']) { const src = path.join(VIDEO, 'shots', `page__cover_html_r_${r}_lang_zh.png`); if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUT, 'cover', `cover-${r}.png`)); else console.warn('缺封面截图：' + src); }
for (const d of 'ABC') for (const f of [1, 2, 3]) {
  const src = path.join(VIDEO, 'shots', `page__design_keyframes_html_d_${d}_f_${f}.png`);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUT, 'keyframes', `${d}${f}.png`)); else console.warn('缺关键帧截图：' + src);
}
fs.writeFileSync(path.join(OUT, 'index.html'), html);
console.log(`审片页：${path.relative(process.cwd(), path.join(OUT, 'index.html'))}　中位语速 ${RATE.toFixed(2)} 字/秒　全片估计 ${L.total.toFixed(1)} 秒` + (L.problems.length ? '\n' + L.problems.join('\n') : ''));
for (const v of VOICES) console.log(`  ${v.id.padEnd(40)} ${v.speed}  全片约 ${v.total ? v.total.toFixed(1) : '—'} 秒`);
