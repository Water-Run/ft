// 审片页：生成 out/audition/index.html（不入库）。先运行 tools/audition.py（配音）与 tools/music_demos.py（配乐），关键帧由 look.js --url 截到 shots/ 再复制到 out/audition/keyframes/。
// 用法（仓库根目录）：node videos/in-seconds/rdp/tools/audition_page.js
const fs = require('fs'), path = require('path');
const V = path.resolve(__dirname, '..');
const s = require(path.join(V, 'src/js/script.js'));
const rep = JSON.parse(fs.readFileSync(path.join(V, 'out/audition/voices/report.json'), 'utf8'));
const cues = JSON.parse(fs.readFileSync(path.join(V, 'out/audition/cues.json'), 'utf8')).cues.map((c) => c[0]);
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fmtCap = (t) => esc(t).replace(/\*([^*]+)\*/g, '<em>$1</em>');
const SCENE = { open: '引子', what: '它是什么', history: '历史', video: '主线 · 把屏幕当视频', orders: '主线 · 发绘图命令', channels: '画面之外', limit: '边界', end: '收尾', outro: '片尾名单' };
const L = s.layoutScript({});
let script = '';
let total = 0;
for (const sc of s.SCRIPT) {
  const pin = L.scenes.find((x) => x.id === sc.id);
  script += `<section class="sc"><h3>${SCENE[sc.id] || sc.id} <span class="at">定点 ${sc.at}s</span></h3><p>`;
  for (const c of sc.cues) {
    if (!c[1]) { script += `<span class="sil">［${c[2].credits ? '片尾名单，无旁白' : '片名卡，无旁白'}］</span> `; continue; }
    total += 1;
    script += `<span class="cue${cues.includes(c[0]) ? ' rep' : ''}"><sup>${c[0]}</sup>${fmtCap(c[1])}。</span> `;
  }
  script += '</p></section>';
}
const voices = rep.map((r, i) => `
  <div class="voice">
    <div class="vh"><b>${String.fromCharCode(65 + i)}　${esc(r.name)}</b><span class="mono">${esc(r.id)} · MiniMax speech-2.8-hd · 语速 ${r.speed}</span></div>
    <audio controls preload="none" src="voices/${r.slug}/demo.mp3"></audio>
    <div class="vs">${r.error ? '合成失败' : `实测 ${r.cps} 字/秒 · 全片旁白约 ${Math.round(r.full_estimate)} 秒（可用 ${Math.round(r.budget)} 秒）${r.full_estimate > r.budget - 6 ? ' · <b>偏紧，需要删几句或提速</b>' : ''}`}</div>
  </div>`).join('');
const music = [
  ['A', '开机', '76 拍 · 降 E 利底亚。长铺底 + FM 钟琴上行琶音 + 轻沙锤，后半加一点底鼓。温暖、开阔，像 NT / 2000 年代开机后的桌面。'],
  ['B', 'Metro', '112 拍 · A 大调。切分的短促方波拨弦 + 干净的底鼓与拍手 + 低音，第 4 小节起加高处铺底。利落、扁平，像 Windows 8 / 10 的磁贴。'],
  ['C', '九八', '100 拍 · F 大调。FM 电钢七和弦下行 + 行走低音 + 鼓机 + 方波小旋律。像 Win9x 时代示例 MIDI 的伴奏。'],
].map(([k, n, d]) => `<div class="mus"><b>${k}　${n}</b><audio controls preload="none" src="music/${k}.wav"></audio><p>${d}</p></div>`).join('');
const dirs = [
  ['A', 'Fluent（Windows 11）', '并排比较两条路径', '亚克力窗口、柔和蓝色光晕、8 像素圆角。左右两台电脑的记事本常驻画面，中间两条道：上面是视频流（一帧帧整屏），下面是 RDP（一枚枚小命令）。每一步两条道同时走，右上角仪表记「这一步各传了多少字节」。讲法：同一个动作，两种传法并排看。'],
  ['B', 'Classic（Windows 2000）', '追踪同一扇窗口', '灰色立体按钮、深蓝渐变标题栏、蓝色桌面。主角是你电脑上的那扇记事本：左边「线上的字节」窗口逐条收到 RDP 命令的真实字节（取自微软规范的样例），右边的窗口跟着一笔一笔画出来；字形缓存里能看到字母 d 的 9 个字节。讲法：盯住一扇窗口，看它怎么被命令拼出来。'],
  ['C', 'Metro（Windows 8）', '把字节画成磁贴', '深色底、纯色方块、细字重的大字号。每一步变成一行：左边 RDP 命令、右边当成视频的一帧，磁贴面积严格按字节数画——RDP 的块小到只剩一个点，滚动那一帧占满半屏。讲法：用面积让差距一眼可见。'],
].map(([k, n, m, d]) => `<div class="dir"><h3>${k}　${n} <span>讲法：${m}</span></h3><p>${d}</p><div class="pair"><a href="keyframes/${k}1.png"><img src="keyframes/${k}1.png" alt="${k} 标题"></a><a href="keyframes/${k}2.png"><img src="keyframes/${k}2.png" alt="${k} 主线"></a></div></div>`).join('');

const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>RDP 审片页</title>
<style>
:root { --bg:#f3f3f3; --fg:#1b1b1b; --mute:#5f5f5f; --line:#d6d6d6; --acc:#005fb8; --card:#fff; }
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.75 "Segoe UI Variable Text","Segoe UI","Microsoft YaHei UI","Noto Sans SC",sans-serif; }
header { background:#fff; border-bottom:1px solid var(--line); padding:28px 16px; }
main, header > div { max-width:1080px; margin:0 auto; }
main { padding:8px 16px 80px; }
h1 { margin:0; font-size:28px; font-weight:600; } h1 small { font-weight:400; color:var(--mute); font-size:16px; margin-left:8px; }
h2 { font-size:22px; font-weight:600; margin:44px 0 6px; padding-top:8px; }
.note { color:var(--mute); margin:4px 0 14px; }
.card { background:var(--card); border:1px solid var(--line); border-radius:8px; padding:18px 22px; }
.ask { background:#e8f1fb; border:1px solid #b9d4f1; border-radius:8px; padding:14px 20px; margin-top:16px; }
.ask ol { margin:6px 0 0; padding-left:22px; }
.sc h3 { font-size:16px; margin:16px 0 2px; color:var(--acc); } .sc .at { color:var(--mute); font-weight:400; font-size:13px; margin-left:6px; }
.sc p { margin:0; }
.cue sup { color:#8a8a8a; font-size:11px; margin-right:2px; font-family:Consolas,monospace; }
.cue.rep { background:linear-gradient(transparent 62%, #fff2b3 62%); }
.cue em { font-style:normal; font-weight:600; }
.sil { color:var(--mute); font-size:14px; }
.voice, .mus { background:var(--card); border:1px solid var(--line); border-radius:8px; padding:14px 18px; margin:10px 0; }
.vh { display:flex; flex-wrap:wrap; gap:4px 14px; align-items:baseline; } .vh b { font-size:17px; }
.mono { font-family:Consolas,"JetBrains Mono",monospace; font-size:13px; color:var(--mute); }
audio { width:100%; margin:8px 0 2px; }
.vs, .mus p { color:var(--mute); font-size:14px; margin:0; }
.dir { background:var(--card); border:1px solid var(--line); border-radius:8px; padding:16px 18px; margin:14px 0; }
.dir h3 { margin:0; font-size:18px; } .dir h3 span { font-weight:400; color:var(--acc); font-size:15px; margin-left:8px; }
.dir p { margin:6px 0 10px; }
.pair { display:grid; grid-template-columns:1fr 1fr; gap:10px; } .pair img { width:100%; display:block; border:1px solid var(--line); border-radius:4px; }
@media (max-width:700px) { .pair { grid-template-columns:1fr; } }
ul.q li { margin:6px 0; }
</style></head><body>
<header><div><h1>192秒了解RDP: Windows远程的优雅实现 <small>审片页 · 第 1 稿 · 2026-11-07</small></h1>
<p class="note">文案尚未确认；下面的配音只是试听，全片配音等文案确认后再合成。关键帧是方向样张，数字都取自本片 <code>research/FACTS.md</code>。</p>
<div class="ask"><b>请一次选定：</b><ol>
<li>文案：方向是否成立，逐句意见（句号见上标）</li><li>配音：A–E 选一个</li><li>配乐：A 开机 / B Metro / C 九八 选一个</li><li>视觉：A Fluent / B Classic / C Metro 选一个（可混搭讲法与外观）</li></ol></div></div></header>
<main>
<h2>1　文案（第 1 稿，全部为新句）</h2>
<p class="note">共 ${total} 句旁白。核心问题：隔着网络操作另一台 Windows 电脑，画面是怎么传过来的？RDP 优雅在哪？黄色底的是配音试听用的代表句。片名只上画面，不念。</p>
<div class="card">${script}</div>

<h2>2　配音候选</h2>
<p class="note">5 个都是近几部没用过的 MiniMax 音色，语速统一 1.2，读同一组 ${cues.length} 句代表句。按各自实测语速估算了全片能否放进 192 秒（片尾名单 7.5 秒不算）。</p>
${voices}

<h2>3　配乐小样</h2>
<p class="note">程序合成、旋律原创，各约 25 秒；三个方向都取 Windows 自己的年代感，不引用任何系统提示音。选定后为全片重写，段落落点对齐场景。</p>
${music}

<h2>4　视觉方向</h2>
<p class="note">按「契合 MS Windows」的要求，三个方向都取自 Windows 的视觉谱系，且讲法不同。每个方向两张：标题、信息最密的一刻（旁白 r6「以后只报编号：一行 9 个字，47 个字节」）。字体用仓库自带的 Inter / 思源黑体（Segoe UI 不随仓库发布），不用 Windows 徽标。点图看原尺寸。</p>
${dirs}

<h2>5　待定问题</h2>
<ul class="q card">
<li><b>对比的口径。</b>RDP 一侧的字节数（10 / 47 / 14 / 字母 d 的 9 字节）取自微软协议规范的带注释样例；视频一侧（950 / 667 / 23159 字节）是本机用 H.264 按串流常用设置实测的同类变化，不是同一块屏幕。旁白只说量级，不说倍数。这样可以吗？</li>
<li><b>经典做法与今天。</b>这些逐字节的绘图命令是 RDP 的经典做法；Windows 8 之后改了传画面的方式，规范没写今天还在多大程度上发这些命令。文案在「边界」一场说明：填色、搬移、缓存照旧，图像交给视频编码。</li>
<li><b>「主流视频流远程」点谁的名。</b>有一手出处的是 Parsec（官方技术博客）和 Sunshine + Moonlight（项目说明），画面上可以出现这几个名字；向日葵、ToDesk 等没有读到技术原文，暂不点名。</li>
<li><b>两处趣味细节</b>：项目代号 Hydra（九头蛇）、游戏串流「总延迟二十毫秒和四十毫秒，可能就是好玩和玩不了的差别」（Parsec 技术博客的说法）。嫌多可以删。</li>
<li><b>不讲</b>：安全漏洞、登录认证细节、RemoteApp、授权费用、Citrix 的协议细节。</li>
</ul>
</main></body></html>`;
fs.writeFileSync(path.join(V, 'out/audition/index.html'), html);
console.log('ok', total, 'cues');
