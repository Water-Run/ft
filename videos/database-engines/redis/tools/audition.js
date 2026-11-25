// 本地审片页：连贯全文与待定问题、5 个配音候选、3 个配乐小样、3 个视觉方向的关键帧，一处看完、一次选定。
// 产物 out/audition/index.html（out/ 不入库），音频与截图用相对路径引用 out/audition/ 下的文件。
// 用法（仓库根目录）：node videos/database-engines/redis/tools/audition.js
// 依赖：tools/voice_demo.py（voices/）、tools/music_demo.py（music-*.mp3、music-demo.json）、keyframes/*.png（look.js 截图）已经生成。
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const VIDEO = path.resolve(__dirname, '..'), REPO = path.resolve(VIDEO, '..', '..', '..'), OUT = path.join(VIDEO, 'out', 'audition');
const S = require(path.join(VIDEO, 'src', 'js', 'script.js'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const term = (s) => esc(s).replace(/\*([^*]+)\*/g, '<b class="term">$1</b>');

// 导出当前稿本，取内容哈希
const exp = execFileSync('node', [path.join(REPO, 'kit', 'tools', 'script-review.js'), path.relative(REPO, VIDEO), 'export'], { cwd: REPO, encoding: 'utf8' });
const md = exp.split('\n').find((l) => /review[\\/]script\.zh\.[0-9a-f]{64}\.md/.test(l)).trim();
const hash = md.match(/([0-9a-f]{64})/)[1];
const tl = S.layoutScript({});
const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, '0')}`;
const voices = JSON.parse(fs.readFileSync(path.join(OUT, 'voices', 'voices.json'), 'utf8'));
const music = JSON.parse(fs.readFileSync(path.join(OUT, 'music-demo.json'), 'utf8'));

const PENDING = [
  ['时长', '工具估算 ' + fmt(tl.total) + '，按前两集的实测语速折算约 12 分钟，比预期的 10 分钟长约 2 分钟。要再压的话，依次可删：02 的渐进式 rehash（b21–b27）、06 的 AOF 重写与两种同时开（f33–f37）、07 的内存上限（g9–g11）。'],
  ['开场点名前六集', 'o7–o9 一句话带过前六集「数据都在磁盘上」，接住 MongoDB 一集结尾的问题；终章 z4–z14 逐集一句。观众没看过前几集也能懂，只是少了回味。'],
  ['终章的分寸', 'z15–z21 写成归纳（磁盘与内存、锁与版本与单线程、记一笔再恢复），不喊口号；z22–z24 回到第一集开场的原话；最后两句用系列片名作问、再作答。史诗感交给配乐与画面。'],
  ['片尾名单', '拟在 redis-cli 里执行一条读取 credits 的命令，逐行列出分工；具体命令随视觉方向定。'],
  ['商标', 'Redis 的商标政策要求不模仿它的视觉识别（官网与文档的外观），并建议在出现商标处附「Redis is a registered trademark of Redis Ltd.」。三个方向都只借官方色值，版式与图形是本片自己的；是否在片尾加这句声明，请定。'],
];
const TREAT = {
  A: { name: 'A 桶阵', how: '哈希表是全片常驻的主画面：8192 个桶按真实桶号排成 128 × 64 的格阵（4096 个键各落在哪个桶，是用 gdb 读出进程的哈希种子、按 SipHash-1-2 算出、再与 Redis 自己的统计逐项对上的），Alice 在第 3271 号桶。增、查、改、删都从这一格拉出对象与字节；出错一章分成上面内存、下面磁盘。', look: '深色：午夜蓝 #091a23、暮蓝 #163341，品牌红 #ff4438 只给正在讲的那一样（Alice、这一次的命令）。', plus: '一张图从头到尾不换，结构一直在（F02、F29）；「内存里的一张表」最直观。', risk: '格阵很密，近看要靠放大与局部高亮；并发一章需要另画时间线。' },
  B: { name: 'B 一条线程', how: '时间是主轴：所有客户端的命令汇进一条主线程，一个挨一个走过；并发一章 Alice、Bob、Carol 三条泳道汇成一队，慢命令把后面的人挡住；出错一章主线程下面是子进程（RDB）与 AOF 文件，命令每执行一条就追加一段。', look: '浅色：白底、墨色字，红改用更深的官方红阶 #d1281e（白字对比度达标）。', plus: '「一个一个来」「谁等谁」「回复前已交给内核」最直观，和电子乐的节拍对得上。', risk: '数据放在哪里（哈希表、listpack）不在这个画面里，01–02 章要换画法。' },
  C: { name: 'C 终端与字节', how: '证据优先：redis-cli 的真实回显与 27 个原样字节在前，图形只做注解；每一步先看实物再解释。', look: '暮蓝底 #163341、深色终端，黄绿 #dcff1e 标关键值。', plus: '「原样」的可信感最强：27 字节、REDIS0017、33287 = 33287。', risk: '容易变成一屏屏终端与文字，结构画面不足；适合当特写，不适合当主画面。' },
};
const scenes = S.SCRIPT.filter((sc) => sc.cues.some((c) => c[1]));
let html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>审片页 · Redis（第 1 稿）</title>
<style>
body{margin:0;background:#f6f7f8;color:#091a23;font:16px/1.7 "Inter","Noto Sans SC","Microsoft YaHei",sans-serif}
main{max-width:1180px;margin:0 auto;padding:32px 24px 80px} h1{font-size:28px;margin:0 0 4px} h2{font-size:22px;margin:48px 0 12px;padding-top:12px;border-top:2px solid #091a23}
h3{font-size:17px;margin:20px 0 6px} .meta{color:#5c707a;font-size:14px} .card{background:#fff;border:1px solid #d9d9d9;border-radius:10px;padding:16px 20px;margin:12px 0}
.cue{display:inline} .id{font:12px/1 "JetBrains Mono",monospace;color:#8a99a0;margin:0 4px 0 6px;vertical-align:1px} .term{color:#d1281e} .chap{font-weight:700;margin-top:18px}
.chap small{font-weight:400;color:#5c707a;margin-left:8px} table{border-collapse:collapse;width:100%} td,th{border-bottom:1px solid #e5e5e5;padding:8px 10px;text-align:left;vertical-align:top} th{background:#f3f3f3}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px} .grid img{width:100%;border:1px solid #d9d9d9;border-radius:6px;display:block} .kf{margin:0} .kf figcaption{font-size:13px;color:#5c707a}
audio{width:100%;margin-top:6px} .pick{display:inline-block;background:#091a23;color:#fff;border-radius:6px;padding:2px 10px;font-size:13px;margin-right:6px} .rec{background:#fff8d6;border:1px solid #e9d97a}
code{font-family:"JetBrains Mono",monospace;font-size:14px;background:#f3f3f3;padding:1px 5px;border-radius:4px}
</style></head><body><main>
<h1>一个数据库引擎是如何实现的？——内存里的键值对：Redis</h1>
<div class="meta">数据库引擎系列 PART 7（最终集）· 第 1 稿 · 稿本 <code>${hash.slice(0, 12)}</code> · 估算 ${fmt(tl.total)}（实测语速折算约 12 分钟）· 2026-11-24</div>
<div class="card"><b>这一页要定的四件事</b><ol style="margin:6px 0 0">
<li>文案：通读「连贯全文」，按「句号 + 问题 + 建议」给意见；明确确认之后才配全片（全片配音只用确认后的稿本）。</li>
<li>配音：5 个男声里选 1 个（本系列一集男声、一集女声，Redis 一集是男声）。</li><li>配乐：3 个电子乐方向里选 1 个。</li><li>视觉：A、B、C 三个方向里选 1 个（或指定组合）。</li></ol></div>

<h2>核心问题与路线</h2>
<div class="card"><b>看完能回答：</b>数据住在内存里的 Redis，怎样放、怎样找、怎样改和删、怎样让很多人同时用，进程没了之后又靠什么找回来？最后一章回答整个系列的问题：一个数据库引擎是如何实现的。<br>
<b>例子：</b>同一批 4096 个用户，Alice 是 <code>user:2050</code>、42 岁。实验全部在 Redis 8.12.0（2026-11-22 发布）上实测：服务端 4–6 微秒一条命令；8192 个桶的真实分布；27 字节的 listpack；改年龄只变一个字节；两个人同时各加一万次得两万；只有快照时写完立刻 <code>kill -9</code>，重启 0 个键；开了 AOF，最后收到 33287，重启后 33287。<br>
<b>不讲：</b>主从复制、集群、附带的查询引擎等模块、I/O 线程（缺省关闭）。事实与出处见 <code>research/FACTS.md</code>。</div>

<h2>待定问题</h2><table><tr><th style="width:140px">问题</th><th>说明</th></tr>${PENDING.map(([a, b]) => `<tr><td>${a}</td><td>${esc(b)}</td></tr>`).join('')}</table>

<h2>连贯全文（第 1 稿，全部是新句）</h2><div class="meta">灰色小字是句号，红字是第一次出现、画面会给注解的术语。片尾名单只上画面，不配旁白。</div>
<div class="card">${scenes.map((sc) => {
    const t = tl.scenes.find((x) => x.id === sc.id);
    const head = sc.chap ? `${sc.chap[0]} ${esc(sc.chap[1])}<small>${esc(sc.chap[2] || '')} · 约 ${fmt(t.end - t.start)}</small>` : `开场<small>约 ${fmt(t.end - t.start)}</small>`;
    return `<div class="chap">${head}</div><p>${sc.cues.filter((c) => c[1]).map((c) => `<span class="id">${c[0]}</span><span class="cue">${term(c[1])}</span>`).join('')}</p>`;
  }).join('')}</div>

<h2>配音：5 个男声候选</h2>
<div class="meta">MiniMax ${esc(voices.model)}，语速 ${voices.speed}；同一组代表句（${voices.lines.map((l) => l[0]).join('、')}）。只是试听，全片配音等文案确认。本系列已用过的男声（Gentleman、Reliable_Executive、Gentle_Youth）没有放进来。Whisper 回听：5 段都没有漏词，MULTI、EXEC 都按单词读；播报男声那段的转写里有一段重复，像是识别器的误差，请以耳朵为准；多音字（重启、重放、重来）只有人耳能听出来。</div>
${voices.voices.map((v, i) => `<div class="card"><span class="pick">${i + 1}</span><b>${esc(v.name)}</b> <code>${esc(v.id)}</code> <span class="meta">· ${v.seconds} 秒</span><audio controls preload="none" src="${v.file}"></audio></div>`).join('')}

<h2>配乐：3 个电子乐方向</h2>
<div class="meta">各约 60 秒（引子 → 推进 → 最高处 → 收束），程序合成，响度统一 −18 LUFS；数值都检查过（不削波、低频不压过中频），没有人耳听过。</div>
${Object.values(music.demos).map((d) => `<div class="card"><span class="pick">${d.id}</span><b>「${esc(d.title)}」</b> <span class="meta">${d.bpm} 拍/分 · ${esc(d.key)} · ${esc(d.progression)}</span><audio controls preload="none" src="music-${d.id}.mp3"></audio><p style="margin:8px 0 0">${esc(d.description)}</p></div>`).join('')}

<h2>视觉：3 个方向的关键帧</h2>
<div class="meta">比较的是解释方法，不只是配色。颜色取自 redis.io 的色值（research/MATERIALS.md），版式与图形是本片自己的，不仿官网；画面不放产品标志（系列约定）。字幕条是示意。</div>
${['A', 'B', 'C'].map((d) => { const t = TREAT[d]; const n = d === 'C' ? 3 : 4; const cap = { 1: '标题', 2: d === 'B' ? '05 并发（信息最密）' : '02 增（信息最密）', 3: '06 出错（图解）', 4: '09 终章' };
    return `<h3>${t.name}</h3><div class="card"><p style="margin:0"><b>解释方法：</b>${esc(t.how)}<br><b>颜色：</b>${esc(t.look)}<br><b>长处：</b>${esc(t.plus)}<br><b>风险：</b>${esc(t.risk)}</p>
<div class="grid" style="margin-top:12px">${Array.from({ length: n }, (_, i) => `<figure class="kf"><img src="keyframes/${d}-${i + 1}.png" alt="${t.name} ${cap[i + 1]}"><figcaption>${t.name} · ${cap[i + 1]}</figcaption></figure>`).join('')}</div></div>`; }).join('')}
<div class="card rec"><b>制作方的倾向：</b>以 A 的桶阵为全片常驻的主画面（01–04、07 章都在这张表上推进），05 并发与 06 出错章借 B 的时间线（主线程、子进程、AOF），真实回显与字节只在 02、06 章用 C 的终端做特写。终章用 A 的七行对照表，逐行亮起到 PART 7。最终以选定为准。</div>
</main></body></html>`;
fs.writeFileSync(path.join(OUT, 'index.html'), html);
console.log('out/audition/index.html', html.length, '字节；稿本', hash, '；导出', md);
