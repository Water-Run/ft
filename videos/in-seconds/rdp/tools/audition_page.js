// 审片页：生成 out/audition/index.html（不入库）。
// 第 3 轮（2026-11-07）：配音、配乐、视觉已选定（青年大学生、磁贴、磁贴），本页交第 2 稿修订版文案、全片试读与磁贴关键帧。
// 先运行：tools/audition.py <cues_full.json> <ffmpeg> <ffprobe> daxuesheng full（逐句合成）→ 排时间线写 out/audition/full/layout.json
//        → tools/readthrough.py <ffmpeg> daxuesheng --music；关键帧由 look.js --url "/design/keyframes.html?k=C1" 截图后复制到 out/audition/keyframes/。
// 用法（仓库根目录）：node videos/in-seconds/rdp/tools/audition_page.js
const fs = require('fs'), path = require('path');
const V = path.resolve(__dirname, '..');
const s = require(path.join(V, 'src/js/script.js'));
const lay = JSON.parse(fs.readFileSync(path.join(V, 'out/audition/full/layout.json'), 'utf8'));
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fmtCap = (t) => esc(t).replace(/\*([^*]+)\*/g, '<em>$1</em>');
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const SCENE = { open: '引子', history: '历史', stand: '本质区别：站的位置', bytes: '例子：同一个动作传多少', adapt: '优雅之处：照你的屏幕重新画', limit: '局限：和 Windows 绑得很深', end: '收尾', outro: '片尾名单' };
const start = Object.fromEntries(lay.cues.map(([id, st]) => [id, st]));
let script = '', n = 0, chars = 0;
for (const sc of s.SCRIPT) {
  const sp = lay.scenes.find((x) => x.id === sc.id);
  script += `<section class="sc"><h3>${SCENE[sc.id] || sc.id} <span class="at">${mmss(sp.start)} – ${mmss(sp.end)}</span></h3><p>`;
  for (const c of sc.cues) {
    if (!c[1]) { script += `<span class="sil">［${c[2].credits ? '片尾名单，无旁白' : '片名卡，无旁白'}］</span> `; continue; }
    n += 1; chars += s.strip(c[1]).replace(/[\s，。：；、「」？]/g, '').length;
    script += `<span class="cue" title="${mmss(start[c[0]])}"><sup>${c[0]}</sup>${fmtCap(c[1])}。</span> `;
  }
  script += '</p></section>';
}
const speech = lay.cues.reduce((a, c) => a + c[2], 0);
const KF = [
  ['C1', '标题', '片名卡（o4 之后）。'],
  ['C3', '站的位置', 'k5「RDP 站在 Windows 里面」：左边录像的办法只拿到像素，右边 RDP 拿到 Windows 要画的指令。'],
  ['C2', '同一个动作传多少', 'x5：磁贴面积严格按字节数画；RDP 的块小到只剩一个点。'],
  ['C4', '照你的屏幕重新排', 'a4：本机连上时会报上去的真实设置（2560×1600、200%、中文、UTC+8），右边对比录像的整张缩放。'],
  ['C6', '56K 拨号上传一次', 'x10：「远程桌面连接」体验选项的原文（卫星、调制解调器高亮）；右边两条按传输时间画，录像那一帧 3.31 秒，RDP 那句指令 0.002 秒细得只剩一条线。'],
  ['C5', '绑得很深', 'b2：能被连的 Windows 版本 vs 两家视频流远程官网列出的平台。'],
].map(([k, t, d]) => `<figure><a href="keyframes/${k}.png"><img src="keyframes/${k}.png" alt="${t}"></a><figcaption><b>${t}</b>　${d}</figcaption></figure>`).join('');

const html = `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>RDP 审片页</title>
<style>
:root { --bg:#1d1d1d; --fg:#f2f2f2; --mute:#a8a8a8; --line:#3a3a3a; --acc:#3d8be0; --card:#262626; }
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.8 "Segoe UI Variable Text","Segoe UI","Microsoft YaHei UI","Noto Sans SC",sans-serif; }
header { background:#1b64c4; padding:28px 16px; }
main, header > div { max-width:1080px; margin:0 auto; }
main { padding:8px 16px 80px; }
h1 { margin:0; font-size:30px; font-weight:300; } h1 small { font-weight:400; font-size:16px; margin-left:8px; opacity:.85; }
h2 { font-size:24px; font-weight:300; margin:44px 0 6px; }
.note { color:var(--mute); margin:4px 0 14px; }
header .note { color:#dce9f8; }
.picked { display:flex; flex-wrap:wrap; gap:8px; margin-top:14px; }
.picked span { background:rgba(255,255,255,.16); padding:4px 12px; font-size:15px; }
.ask { background:#262626; border-left:4px solid #1b64c4; padding:12px 18px; margin-top:16px; color:var(--fg); }
.ask ol { margin:4px 0 0; padding-left:22px; }
.card { background:var(--card); padding:18px 22px; }
.sc h3 { font-size:16px; margin:16px 0 2px; color:#7fb4ee; font-weight:600; } .sc .at { color:var(--mute); font-weight:400; font-size:13px; margin-left:6px; font-family:Consolas,monospace; }
.sc p { margin:0; }
.cue sup { color:#8a8a8a; font-size:11px; margin-right:2px; font-family:Consolas,monospace; }
.cue em { font-style:normal; font-weight:600; color:#9fd0ff; }
.sil { color:var(--mute); font-size:14px; }
ul.ch li, ul.q li { margin:6px 0; }
.player { background:var(--card); padding:14px 18px; margin:10px 0; }
.player b { font-weight:600; } audio { width:100%; margin-top:8px; }
figure { margin:14px 0; background:var(--card); padding:12px; } figure img { width:100%; display:block; }
figcaption { color:var(--mute); font-size:14px; margin-top:8px; } figcaption b { color:var(--fg); }
code { font-family:Consolas,monospace; font-size:14px; }
</style></head><body>
<header><div><h1>192秒了解RDP: Windows远程的优雅实现 <small>审片页 · 第 3 轮 · 2026-11-07</small></h1>
<p class="note">第 2 稿修订版尚未确认；下面的全片试读只是试听，正式配音等文案确认后再合成。数字都取自本片 <code>research/FACTS.md</code>。</p>
<div class="picked"><span>配音：青年大学生（已选）</span><span>配乐：磁贴 Metro（已选）</span><span>视觉：磁贴 Metro（已选）</span></div>
<div class="ask"><b>这一轮请看：</b><ol><li>第 2 稿修订版：o3 与新加的低带宽三句（x9–x11）是否合适，逐句意见，或明确确认</li><li>全片试读：节奏、读音（可以对照文案听）</li><li>磁贴关键帧：方向对不对</li></ol></div></div></header>
<main>
<h2>1　文案第 2 稿（修订）</h2>
<p class="note">${n} 句旁白，约 ${chars} 字；青年大学生实测旁白共 ${speech.toFixed(0)} 秒，排进 192 秒后每场末尾留约 1 秒（片尾名单 7.5 秒不配旁白）。鼠标停在句子上可看它在试读里的时刻。</p>
<div class="card">${script}</div>

<h2>2　这一版改了什么</h2>
<ul class="ch card">
<li><b>按你的第 2 轮意见：</b>o3 改为「Windows 自带的远程桌面，有更优雅的做法」。</li>
<li><b>加了极低带宽的一段（x9–x11）：</b>「远程桌面连接的选项里，卫星、56K 拨号都列着」→「在 56K 拨号上，刚才那一帧录像要传三秒多」→「而 RDP 那句指令，两毫秒就到了」。选项原文取自本机中文版 mstsc 的资源（「卫星(2 Mbps - 16 Mbps，高延迟)」「调制解调器(56 kbps)」），协议规范里也是这几档；三秒多 = 23159 字节 × 8 ÷ 56000，两毫秒 = 14 字节 × 8 ÷ 56000，只算纯传输时间。</li>
<li><b>为腾时间压了几处冗词：</b>a6 两句并一句（「录像的办法只能录屏幕本来的样子，尺寸不对就整张缩放」），x6、h2 各去几个字。每场末尾的余量从约 2.3 秒降到约 1 秒。</li>
</ul>
<h2>2.1　第 2 稿相对第 1 稿（上一轮已说明）</h2>
<ul class="ch card">
<li><b>主轴换成「站的位置」。</b>开头直接从你用过的 ToDesk、UU 远程说起：它们站在屏幕外面录像，只认像素；RDP 站在 Windows 里面，在指令变成像素之前接过来，交给你的电脑自己画。后面每一场都回到这个区别。</li>
<li><b>优雅之处落在「适应你的电脑」。</b>连上时你的电脑报上屏幕大小、缩放比例、键盘布局、时区，那边的桌面照你的屏幕重新排；窗口拉大拉小，分辨率跟着变（Windows 8.1 起）。录像的办法只能录那块屏幕本来的样子，尺寸对不上就整张缩放。依据：微软规范 MS-RDPBCGR 的客户端核心数据、MS-RDPEDISP 显示控制通道。</li>
<li><b>局限讲「深度绑定」。</b>被连的电脑得是 Windows，家庭版不行（微软官方文档）；它懂的只是 Windows 的画法，整屏都在变的游戏、电影说不过来，Windows 8 以后图片和视频也交给视频编码。反过来，视频流远程只认像素，哪个系统都能连，还拼帧率、能打游戏（两家官网）。</li>
<li><b>去 AI 味。</b>删掉了冒号排比（「看画面，按键盘」「填色、搬移、缓存照旧」）、「优雅在于」「分毫不差」「各走各的」这类套话，改成口语的因果句；结尾不再喊口号，落回「照着你的屏幕重新画一遍」。</li>
<li><b>删掉的：</b>「它是什么」单独一场（并进引子）、「网络会议标准」（对观众无用）、二十毫秒和四十毫秒、彩色小字发虚（时间留给「适应你的电脑」）。</li>
</ul>

<h2>3　全片试读（青年大学生）</h2>
<p class="note">MiniMax <code>male-qn-daxuesheng</code>，语速 1.2，逐句合成后按时间线放进 192 秒。Whisper 回听上一版 45 句，没有发现读错（只有「一帧→一针」「终端→中端」这类同音字的识别误差）。UU 读作两个字母 U；Hydra 读作「海德拉」。</p>
<div class="player"><b>旁白 + 磁贴配乐（粗混）</b><audio controls preload="none" src="full/readthrough_music.mp3"></audio></div>
<div class="player"><b>只有旁白</b><audio controls preload="none" src="full/readthrough.mp3"></audio></div>
<p class="note">配乐是按本片场景写的全长版（<code>tools/music.py</code>，112 拍，A – F#m – D – E）：引子只有拨弦，历史加低音，「站的位置」起加鼓，「适应你的电脑」加高处铺底最满，「深度绑定」抽掉拍手，结论处抬起，片尾只留铺底。粗混只为听节奏，正式混音以后由 mix.py 做。我听不到声音，电平只按数值核对过。</p>
<div class="player"><b>第 1 轮的磁贴小样（25 秒，供对照）</b><audio controls preload="none" src="music/B.wav"></audio></div>

<h2>4　磁贴关键帧</h2>
<p class="note">深色底、纯色磁贴、细字重大字号；左上剩余秒数、右上「这一步 RDP / 录像各传多少字节」、底部字幕带与秒尺按系列约定。字体用仓库自带的 Inter / 思源黑体，不用 Windows 徽标。点图看原尺寸。</p>
${KF}

<h2>5　待定问题</h2>
<ul class="q card">
<li><b>ToDesk、UU 远程是「录像」的依据。</b>两家都没有公开技术白皮书；我用的是官网用语：ToDesk「画面从编码到解码」「8K 和 360FPS」「4:4:4 真彩」，UU 远程「4K 144 帧」、商店名「游戏串流」。旁白据此说它们「把屏幕录成视频，一帧帧发给你」。可以这样说吗？</li>
<li><b>「尺寸对不上就整张缩放」。</b>这是录像办法的一般情况；ToDesk 官网另有「虚拟屏」功能，所以文案没说视频流远程「做不到」适配。</li>
<li><b>「三秒多」的口径。</b>只是那一帧的纯传输时间；真实的视频流在慢网上会自己降码率、降画质，所以文案没说视频流远程「在拨号上用不了」。卫星那一档的下限是 2 Mbps，同一帧约 93 毫秒，差距不如拨号醒目，所以数字用拨号来算，卫星只点名。</li>
<li><b>字节数的口径不变。</b>RDP 一侧取自微软规范的样例，录像一侧是本机 H.264 实测的同类变化，旁白只说量级。</li>
<li><b>Windows 8.1、Windows 8 这两个节点只上画面</b>，旁白只在「Windows 8 以后」处念一次。</li>
</ul>
</main></body></html>`;
fs.writeFileSync(path.join(V, 'out/audition/index.html'), html);
console.log('ok', n, 'cues', chars, 'chars');
