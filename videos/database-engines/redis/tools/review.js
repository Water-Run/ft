// 审片页（第 4 稿）：混音小样（配音 + 配乐）、完整稿件、全片分镜关键帧、封面预选。产物 out/review/index.html（out/ 不入库）。
// 用法（仓库根目录）：node videos/database-engines/redis/tools/review.js
// 依赖：tools/mix_demo.py（out/audition/demo/）已运行；分镜 src/design/storyboard.html 与封面 src/cover.html 已写好。
// 截图用 kit/tools/look.js（同一套静态服务器与字体），逐帧存进 out/review/frames/、out/review/covers/。
const fs = require('fs'), path = require('path'), url = require('url'), os = require('os'), { execFileSync } = require('child_process');
const VIDEO = path.resolve(__dirname, '..'), REPO = path.resolve(VIDEO, '..', '..', '..'), OUT = path.join(VIDEO, 'out', 'review');
const S = require(path.join(VIDEO, 'src', 'js', 'script.js'));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const term = (s) => esc(s).replace(/\*([^*]+)\*/g, '<b class="term">$1</b>');
const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, '0')}`;
const SKIP = process.argv.includes('--no-shots');
// --only=o-5,z- 只重拍 id 以这些前缀开头的分镜帧，其余沿用 out/review/frames/ 里已有的截图；封面不重拍
const ONLY = ((process.argv.find((a) => a.startsWith('--only=')) || '').slice(7)).split(',').filter(Boolean);
const PREV = 'script.zh.1c6379a41467f637ae23d577c179c2a65d11478714a4f160b6247689bd3fe354.md';   // 第 3 稿的导出，用于终章与开场的对照
const prevPara = (id) => {   // 第 3 稿逐句表里这一章的字幕（无旁白的行跳过）
  const t = fs.readFileSync(path.join(VIDEO, 'review', PREV), 'utf8'), body = t.slice(t.indexOf('## 逐句校对'));
  const sec = body.slice(body.indexOf('### ' + id + ' '), body.indexOf('\n### ', body.indexOf('### ' + id + ' ') + 4));
  return sec.split('\n').map((l) => l.match(/^\| ([a-z]+\d+[a-z]*) \| (.+) \|$/)).filter((m) => m && !/无旁白/.test(m[2])).map((m) => m[2].replace(/\*/g, ''));
};

function look(u, size, dest, tries = 3) {
  try { return look1(u, size, dest); } catch (e) { if (tries <= 1) throw e; console.log('\n  重试', u); return look(u, size, dest, tries - 1); }
}
function look1(u, size, dest) {
  const r = execFileSync('node', [path.join(REPO, 'kit', 'tools', 'look.js'), path.relative(REPO, VIDEO), '--url', u, '--size', size, '--brief'], { cwd: REPO, encoding: 'utf8' });
  const shot = r.match(/截图 (shots\/\S+\.png)/)[1]; fs.copyFileSync(path.join(VIDEO, shot), dest);
  const issues = r.includes('问题：无') ? [] : r.split('\n').filter((l) => l.includes('✗')).map((l) => l.trim());
  return issues;
}
async function listFrames() {
  const puppeteer = require(path.join(REPO, 'node_modules', 'puppeteer-core'));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lvs-chrome-'));
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, userDataDir: profile });
  const p = await b.newPage(); await p.goto(url.pathToFileURL(path.join(VIDEO, 'src', 'design', 'storyboard.html')).href + '?list=1');
  const j = await p.$eval('#list', (e) => e.textContent); await b.close(); fs.rmSync(profile, { recursive: true, force: true });
  return JSON.parse(j);
}

(async () => {
  fs.mkdirSync(path.join(OUT, 'frames'), { recursive: true }); fs.mkdirSync(path.join(OUT, 'covers'), { recursive: true });
  const exp = execFileSync('node', [path.join(REPO, 'kit', 'tools', 'script-review.js'), path.relative(REPO, VIDEO), 'export'], { cwd: REPO, encoding: 'utf8' });
  const hash = exp.match(/script\.zh\.([0-9a-f]{64})\.md/)[1];
  const tl = S.layoutScript({});
  const demo = JSON.parse(fs.readFileSync(path.join(VIDEO, 'out', 'audition', 'demo', 'demo.json'), 'utf8'));
  for (const d of demo.demos) fs.copyFileSync(path.join(VIDEO, 'out', 'audition', d.file), path.join(OUT, d.id + '.mp3'));
  const frames = await listFrames();
  const issues = {};
  if (!SKIP) for (const f of frames) { if (ONLY.length && !ONLY.some((pre) => f.id.startsWith(pre))) continue; issues[f.id] = look(`/design/storyboard.html?f=${encodeURIComponent(f.id)}`, '1920x1080', path.join(OUT, 'frames', f.id + '.png')); process.stdout.write('.'); }
  const covers = [];
  for (const v of [1, 2, 3]) for (const r of ['169', '43']) {
    const file = `cover-${v}-${r}.png`;
    covers.push({ v, r, file, issues: SKIP || ONLY.length ? [] : look(`/cover.html?v=${v}&r=${r}&lang=zh`, r === '169' ? '1920x1080' : '1600x1200', path.join(OUT, 'covers', file)) });
  }
  console.log('');
  const chapName = (id) => { const sc = S.SCRIPT.find((s) => s.id === id); return sc && sc.chap ? `${sc.chap[0]} ${sc.chap[1]}` : '开场'; };
  const groups = [];
  for (const f of frames) { const g = f.ch || '其他'; let G = groups.find((x) => x.name === g); if (!G) groups.push(G = { name: g, frames: [] }); G.frames.push(f); }
  const scenes = S.SCRIPT.filter((sc) => sc.cues.some((c) => c[1]));
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>审片页 · Redis（第 4 稿）</title>
<style>
body{margin:0;background:#f6f7f8;color:#091a23;font:16px/1.7 "Inter","Noto Sans SC","Microsoft YaHei",sans-serif}
main{max-width:1240px;margin:0 auto;padding:32px 24px 100px}h1{font-size:28px;margin:0 0 4px}h2{font-size:22px;margin:52px 0 12px;padding-top:14px;border-top:2px solid #091a23}h3{font-size:17px;margin:26px 0 8px}
nav{position:sticky;top:0;background:#f6f7f8;padding:8px 0;border-bottom:1px solid #d9d9d9;z-index:2}nav a{margin-right:18px;color:#d1281e;text-decoration:none;font-weight:600}
.meta{color:#5c707a;font-size:14px}.card{background:#fff;border:1px solid #d9d9d9;border-radius:10px;padding:16px 20px;margin:12px 0}
.id{font:12px/1 "JetBrains Mono",monospace;color:#8a99a0;margin:0 4px 0 6px;vertical-align:1px}.term{color:#d1281e}.chap{font-weight:700;margin-top:18px}.chap small{font-weight:400;color:#5c707a;margin-left:8px}
table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #e5e5e5;padding:7px 10px;text-align:left;vertical-align:top}th{background:#f3f3f3}
audio{width:100%;margin-top:6px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.fr img,.cv img{width:100%;border:1px solid #d9d9d9;border-radius:6px;display:block;cursor:zoom-in}
.fr figcaption{font-size:13.5px;line-height:1.55;color:#2d4754;margin-top:4px}.fr b{color:#091a23}.warn{color:#d1281e}.cvs{display:grid;grid-template-columns:1.2fr 1fr;gap:14px;align-items:start}
code{font-family:"JetBrains Mono",monospace;font-size:13.5px;background:#f3f3f3;padding:1px 5px;border-radius:4px}.small{font-size:13px;color:#5c707a}
#zoom{display:none;position:fixed;inset:0;background:rgba(9,26,35,.92);z-index:9;align-items:center;justify-content:center}#zoom img{max-width:96vw;max-height:94vh}
</style></head><body><main>
<h1>一个数据库引擎是如何实现的？——内存里的键值对：Redis</h1>
<div class="meta">PART 7（最终集）· 第 4 稿 · 稿本 <code>${hash.slice(0, 12)}</code> · 估算 ${fmt(tl.total)}（按实测语速折算约 10 分半）· 已选：配音「真诚青年」、视觉 A 桶阵、配乐 C「终章」、封面 1 · 2026-11-26</div>
<nav><a href="#mix">混音小样</a><a href="#script">完整稿件</a><a href="#diff">这一稿改了什么</a><a href="#frames">分镜关键帧（${frames.length} 帧）</a><a href="#covers">封面预选</a><a href="#todo">待定</a></nav>

<h2 id="mix">一、混音小样：配音 + 配乐</h2>
<div class="card small">用选定的音色 <code>${esc(demo.voice)}</code>（MiniMax speech-2.8-hd，语速 ${demo.speed}）念第 4 稿的三段，配上方向 C「终章」，混音参数与正式混音相同（<code>project.json</code>：配乐 ${demo.audio.music_db} dB、说话时再压 ${demo.audio.duck_db} dB；旁白按 RMS 对齐到 −21 dB）。成品按 −16 LUFS 出。<br>
<b>音量偏小的处理：</b>这个音色原声的有声部分 RMS 约 −33 dB，比其他候选小约 10 dB；混音的 RMS 对齐把它拉到和任何音色相同的电平（成品里旁白约 −19 dB RMS），三段都在 −16 LUFS、峰值不超过 −1 dBFS。请以耳朵为准，偏小或偏大直接说。<br>
这只是小样：全片配音仍等文案确认。配乐是按小节排的方向 C，终章那一段把「最高处」放在 z15「undo、旧版本、回滚日志、旧片段」，最后一句 z23「那份快照里，她还是 42 岁」落到 C 大调；正式配乐要等全片配音有实测时长再按章节编排。没有人耳听过，数值见下表。</div>
${demo.demos.map((d) => `<div class="card"><b>${esc(d.title)}</b> <span class="small">· ${fmt(d.seconds)} · ${d.lufs} LUFS · 峰值 ${d.peak} dBFS · 旁白原声 ${d.voice_raw_rms_db} → 混音后 ${d.voice_rms_db} dB RMS · 说话时配乐 ${d.music_under_voice_db} dB</span>
<audio controls preload="none" src="${d.id}.mp3"></audio><details><summary class="small">逐句时刻</summary><table>${d.cues.map((c) => `<tr><td class="small" style="width:60px">${fmt(c[2])}</td><td class="small" style="width:50px">${c[0]}</td><td>${term(c[1])}</td></tr>`).join('')}</table></details></div>`).join('')}

<h2 id="script">二、完整稿件（第 4 稿）</h2>
<div class="card small">主线：Redis 把数据整个放进内存，换来了快；开场许下「看 Redis 怎样记住她，又怎样忘掉她」，06 章（进程没了，还记得 Alice 吗）、07 章（什么时候忘掉一个键）各还一半。终章用一个问题收全系列：Alice 过生日时，改掉的 42 去了哪里——七个引擎各一句，归到「存的都是改之前的样子」；最后落在 Redis 磁盘上那份快照里 42 岁的她，接回本集第一句的「年龄 42」。灰色小字是句号，红字是第一次出现、画面会给注解的术语；片尾名单只上画面，不配旁白。逐句的事实出处在 <code>research/FACTS.md</code>，改法在 <code>review/NOTES.md</code>。</div>
<div class="card">${scenes.map((sc) => {
    const t = tl.scenes.find((x) => x.id === sc.id);
    const head = sc.chap ? `${sc.chap[0]} ${esc(sc.chap[1])}<small>${esc(sc.chap[2] || '')} · 约 ${fmt(t.end - t.start)}</small>` : `开场<small>约 ${fmt(t.end - t.start)}</small>`;
    return `<div class="chap">${head}</div><p>${sc.cues.filter((c) => c[1]).map((c) => `<span class="id">${c[0]}</span>${term(c[1])}`).join('')}</p>`;
  }).join('')}</div>

<h2 id="diff">三、这一稿改了什么：开场与终章，第 3 稿 → 第 4 稿</h2>
<div class="card small">经过三轮诘问：制作方先对照第一集的开场逐句诘问第 3 稿，写出第 4 稿初稿；再请一位没看过前面讨论的审读按策划者的要求挑刺（终章点名太多、两个设问与 04 章重复、「用不着退回去」把不能回滚说成了好处、「一行一行」不准、最后一句像课后题、没有接回本集自己的开场）；制作方逐条核对后改成定稿，没有照单全收的一条：仍让七个引擎各出现一次，因为终章要收全系列。逐条记录在 <code>review/NOTES.md</code>「交审说明 · 第 4 稿」。</div>
<div class="grid">${['open', 'finale'].map((id) => { const sc = S.SCRIPT.find((x) => x.id === id); const now = sc.cues.filter((c) => c[1]).map((c) => S.strip(c[1])); const was = prevPara(id); return `<div class="card"><b>${id === 'open' ? '开场' : '终章'} · 第 3 稿</b><p class="small" style="line-height:1.9">${was.map(esc).join('<br>')}</p></div><div class="card"><b>${id === 'open' ? '开场' : '终章 · 09 ' + esc(sc.chap[1]) + '（' + esc(sc.chap[2]) + '）'} · 第 4 稿</b><p style="line-height:1.9">${now.map(esc).join('<br>')}</p></div>`; }).join('')}</div>

<h2 id="frames">四、分镜关键帧（${frames.length} 帧）</h2>
<div class="card small">方向 A「桶阵」：8192 个桶按真实桶号排成格阵（每个键落在哪个桶，是读出进程的哈希种子按 SipHash-1-2 算出、再与 Redis 自己的统计逐项对上的），全片常驻；红色只给正在讲的那一样。每帧下面写着它对应的句号、让观众看懂什么、怎样动起来。画面上的数字都由实验回显生成。字幕条是示意。点图放大。开场 o-5、06 章 f-1/f-6、07 章 g-0、终章 z-0 至 z-6 按第 4 稿重画；第 3 稿的 o-2、f-9、z-7 随句子删去。</div>
${groups.map((G) => `<h3>${esc(G.name)}</h3><div class="grid">${G.frames.map((f) => `<figure class="fr" style="margin:0"><img src="frames/${encodeURIComponent(f.id)}.png" alt="${esc(f.title)}" loading="lazy"><figcaption><b>${esc(f.id)} · ${esc(f.title)}</b>${f.cues ? ` <span class="small">（${esc(f.cues)}）</span>` : ''}<br>${esc(f.note)}${f.motion ? `<br><span class="small">动起来：${esc(f.motion)}</span>` : ''}${(issues[f.id] || []).length ? `<br><span class="warn">自动检查：${esc(issues[f.id].join('；'))}</span>` : ''}</figcaption></figure>`).join('')}</div>`).join('')}

<h2 id="covers">五、封面（已选 1）</h2>
<div class="card small">三个方向，各有 16:9 与 4:3 两版（4:3 重新排布，不是裁切）。系列要求：立体、有质感，集数、问句、大标题、一幅讲清本集要点的图、实测数据；缩到 360 像素宽仍读得清；底部约 15% 不放字；不放产品标志。</div>
${[1, 2, 3].map((v) => `<h3>封面 ${v}</h3><div class="cvs">${covers.filter((c) => c.v === v).map((c) => `<figure class="cv" style="margin:0"><img src="covers/${c.file}" alt="封面 ${v} ${c.r === '169' ? '16:9' : '4:3'}"><figcaption class="small">${c.r === '169' ? '16:9' : '4:3'}${c.issues.length ? ` <span class="warn">${esc(c.issues.join('；'))}</span>` : ''}</figcaption></figure>`).join('')}</div>
<div class="small" style="margin-top:6px">缩略图大小（360 像素宽）：<img src="covers/cover-${v}-169.png" style="width:360px;vertical-align:top;border:1px solid #d9d9d9"></div>`).join('')}

<h2 id="todo">六、待定</h2>
<table><tr><th style="width:150px">问题</th><th>说明</th></tr>
<tr><td>文案</td><td>第 4 稿的意见，或明确确认（确认之后才配全片）。</td></tr>
<tr><td>终章的点名</td><td>现在七个引擎各出现一次（z7–z14），用「旧的 42 去了哪里」串起来；审读建议只留三个引擎，会更紧，但收不全七集。倾向保留七个，画面用一张七行的表承担细节（z-3）。</td></tr>
<tr><td>时长</td><td>工具估算 ${fmt(tl.total)}，按实测语速折算约 10 分半，比预期的 10 分钟长约半分钟。</td></tr>
<tr><td>封面</td><td>已选 1「整张表」（2026-11-26）。</td></tr>
<tr><td>商标声明</td><td>Redis 的商标政策建议在出现商标处附「Redis is a registered trademark of Redis Ltd.」，片尾是否加。</td></tr>
</table>
</main><div id="zoom" onclick="this.style.display='none'"><img></div>
<script>document.querySelectorAll('.fr img,.cv img').forEach(i=>i.onclick=()=>{const z=document.getElementById('zoom');z.firstChild.src=i.src;z.style.display='flex'})</script>
</body></html>`;
  fs.writeFileSync(path.join(OUT, 'index.html'), html);
  console.log('out/review/index.html；分镜', frames.length, '帧；有问题的帧', Object.entries(issues).filter(([, v]) => v.length).map(([k]) => k).join(' ') || '无');
})();
