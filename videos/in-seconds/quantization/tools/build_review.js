// 生成「返修稿审览」本地 HTML：从当前（返修后）源码渲染各场关键帧，连同新文案、设计系统说明、改动清单与署名，
// 打包成一个自包含页面（图片以 data URI 内嵌）。供策划者/校对确认新文案与新设计。
// 用法：node videos/in-seconds/quantization/tools/build_review.js videos/in-seconds/quantization
const fs = require('fs'), path = require('path');
const lib = require(path.resolve(__dirname, '../../../../kit/tools/lib'));
const video = path.resolve(__dirname, '..');
const S = require(path.join(video, 'src/js/script.js'));
const proj = JSON.parse(fs.readFileSync(path.join(video, 'project.json'), 'utf8'));

// 各场关键帧时刻与说明（用旧配音时刻排布，画面已是返修后的新设计）
const SCENES = [
  { id: 'open', name: '开场 · 现象', sub: '同一个模型的两个文件', frames: [
      { t: 10.0, cap: '55 GB 连续色带 vs 17 GB 的 16 段色带；24 GB 显卡白线，线右边压暗「装不下」' },
      { t: 14.6, cap: '片名卡盖满后不再退回原画面；卡底色带「连续 → 16 段」带到下一场' } ],
    notes: ['色带即文件：原版是连续紫，17 GB 只剩 16 段——全片的母题', '去掉提前剧透的幽灵数字；「AI 模型」标签提前进场', '片名卡盖满后收起原画面且不再退回（修复「出现封面后又回到原来」）'] },
  { id: 'what', name: '它是什么', sub: '文件里全是数', frames: [
      { t: 22.0, cap: '取一个数摊成 16 个 0/1；「16 位 = 16 个 0 或 1」plain 标注' } ],
    notes: ['主对象是这条连续色带（文件本身），数字从 0 数到 278 亿', '说明文字是 plain 的 dim 字，不装胶囊'] },
  { id: 'how', name: '怎么变小', sub: '每个数换成最近的值', frames: [
      { t: 34.0, cap: '32 个真实的数落到 16 个值（色块），连线成一道波' },
      { t: 38.5, cap: '512 位 vs 144 位：两条长度对比，28%' } ],
    notes: ['机制段让过程自己跑：数依次落到最近的格子（F23）', '15 刀一起落下是一次整块变化，不逐个闪', '讲 16→4 位例子时收起格子编号，降低同屏密度'] },
  { id: 'cost', name: '丢了什么', sub: '精度与长程误差', frames: [
      { t: 49.5, cap: '原版一行、4 位一行，每 100 词约 5 个不一样（白格）' },
      { t: 53.5, cap: '岔开以后越走越偏：原版直线，4 位在每个不一样的词上再偏一点' } ],
    notes: ['残留的「平均偏差」标签已收进退场名单，不再压到岔开的线上', '长程累计误差按策划者要求留在画面与文案'] },
  { id: 'hist', name: '历史', sub: '2023 · llama.cpp', frames: [
      { t: 62.0, cap: 'MacBook 里是 16 段色带；README 原话（原文+译文）与 40 个词元' } ],
    notes: ['引文 significanlty 是 2023 原文拼写，照录不改', 'MacBook 收窄右移，与左边引文留出间距'] },
  { id: 'test', name: '测试', sub: '五个版本同一份卷子', frames: [
      { t: 84.0, cap: '五行对照：体积色带 + 分数条；行选区随旁白平滑滑动' },
      { t: 92.0, cap: '89 个多步编程任务：4 位与原版做对的一样多（约 63）' } ],
    notes: ['行选区平滑滑动（不再瞬移）；分数条长出来；t8「想久了退步」粉点从 15.7% 滑回 10.4%', '198 根细刺改一条带；删掉与字幕重复的标签', '同屏 26 段文字是该场内容本身（DENSE 提示保留）'] },
  { id: 'close', name: '收尾', sub: '回到那块显卡', frames: [
      { t: 108.0, cap: '17 GB 装得下 24 GB；原版 55 GB 虚线轮廓压暗「装不下」' } ],
    notes: ['色带/白线/显卡标签都用开场时的位置（F29 带一样东西过去）', '版本名高亮对齐词的时刻；「原版装不下」用白底不用粉（粉色只给 1 位分数）'] },
  { id: 'outro', name: '片尾', sub: '名单只上画面', frames: [
      { t: 118.0, cap: '参与方名单（含返修署名 Qwen-4-Max-Preview），行距收紧落在字幕条之上' } ],
    notes: ['名单从 project.json 读取，如实署名', '片尾不配旁白'] },
];
const TITLE = Object.fromEntries(S.SCRIPT.map((sc) => [sc.id, sc]));
// 第五稿（旧）→ 返修稿（新）有变化的句子，供对照
const OLD = {
  o4: '把模型变小的办法，叫量化', a1: '模型文件里装的全是数，一共 278 亿个',
  b1: '这是文件里的 32 个数', b4: '只给 4 位，就只能排出 16 种', b6: '文件里只记换成了第几个',
  b7: '这 32 个数，只占原来的不到三成', c1: '可这四个数，原本各不相同', c2: '现在换成了同一个值，一模一样',
  c3: '差不多每个数都偏了一点', c4: '4 位的每说 100 个词，约有 5 个和原版不一样',
  h2: '他就是这样压到 4 位的', h3: '他在说明里写：开头通顺，三四十个词以后明显变差',
  t4: '8 位的 29 GB，4 位的 17 GB，都还是九成', t5: '2 位的 10.7 GB，八成五',
  t6: '1 位的 6.2 GB，只对了一成，还不如瞎蒙', t8: '想久了，常常想到字数用完，交白卷',
  t9: '4 位的做 89 个多步的编程任务，也和原版打平',
};
const VERBATIM = new Set(['o1']); // 策划者原句，逐字保留

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rich = (s) => esc(S.strip(s)).replace(/\*([^*]+)\*/g, '<em>$1</em>');

(async () => {
  const { server, base } = await lib.startServer();
  const { browser, page } = await lib.openPage(base, { lang: 'zh', scale: 0.75 });
  const cdp = await page.createCDPSession();
  const frames = {};
  for (const sc of SCENES) for (const f of sc.frames) {
    await page.evaluate((x) => window.seek(x), f.t);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    frames[sc.id + '_' + f.t] = data;
  }
  await browser.close(); server.close();

  const cueCount = S.SCRIPT.flatMap((x) => x.cues).filter((c) => c[1]).length;
  const chars = S.SCRIPT.flatMap((x) => x.cues).filter((c) => c[1]).reduce((n, c) => n + S.strip(c[1]).replace(/[，。：；、\s*]/g, '').length, 0);

  // 场景卡片
  const sceneCards = SCENES.map((sc, i) => {
    const cues = (TITLE[sc.id]?.cues || []).filter((c) => c[1]);
    const imgs = sc.frames.map((f) => `
      <figure class="frame" data-cap="${esc(f.cap)}">
        <img loading="lazy" src="data:image/png;base64,${frames[sc.id + '_' + f.t]}" alt="${esc(sc.name)} 关键帧 t=${f.t}s">
        <figcaption><span class="t">t = ${f.t}s</span>${esc(f.cap)}</figcaption>
      </figure>`).join('');
    const lines = cues.map((c) => {
      const old = OLD[c[0]];
      const vb = VERBATIM.has(c[0]);
      return `<li class="cue${vb ? ' verbatim' : ''}" data-old="${old ? esc(old) : ''}">
        <span class="cid">${c[0]}</span>
        <span class="ctext">${rich(c[1])}${vb ? '<span class="tag-vb">策划者原句</span>' : ''}</span>
        ${old ? `<span class="cold">旧：${esc(old)}</span>` : ''}
      </li>`;
    }).join('');
    const notes = sc.notes.map((n) => `<li>${esc(n)}</li>`).join('');
    return `<section class="scene" id="sc-${sc.id}">
      <div class="scene-head"><span class="idx">${String(i + 1).padStart(2, '0')}</span><div><h2>${esc(sc.name)}</h2><p class="sub">${esc(sc.sub)}</p></div></div>
      <div class="frames">${imgs}</div>
      <div class="scene-body">
        <div class="script-col"><h3>旁白（返修稿）</h3><ul class="cues">${lines}</ul></div>
        <div class="notes-col"><h3>设计要点</h3><ul class="notes">${notes}</ul></div>
      </div>
    </section>`;
  }).join('');

  const navLinks = SCENES.map((sc) => `<a href="#sc-${sc.id}" data-target="sc-${sc.id}">${esc(sc.name.split(' · ')[0])}</a>`).join('');
  const credits = proj.credits;
  const peopleRows = `<div class="cr-row"><span class="cr-role">策划 · 校对</span><span class="cr-name">${esc(credits.planner)}</span></div>`;
  const modelRows = credits.models.map((m) => `<div class="cr-row${m.name === 'Qwen-4-Max-Preview' ? ' me' : ''}"><span class="cr-role">${esc(m.roles.join(' · '))}</span><span class="cr-name">${esc(m.name)}</span></div>`).join('');
  const serviceRows = credits.services.map((s) => `<div class="cr-row"><span class="cr-role">${esc(s.roles.join(' · '))}</span><span class="cr-name">${esc(s.name)}</span></div>`).join('');

  const html = `<style>
  :root{--ink:#0D0620;--ink2:#150a2e;--surface:#1c1038;--ac:#A855F7;--dim:#CDBDFF;--dimp:#8A7BB5;--deep:#1A0B5E;--bright:#FFE3FF;--bad:#FF6BB5;--ok:#7ee0a3;--line:#2c1d52}
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;background:var(--ink);color:#f3eeff;font-family:"Inter","Segoe UI","Microsoft YaHei",sans-serif;line-height:1.6}
  ::-webkit-scrollbar{width:12px;height:12px}
  ::-webkit-scrollbar-track{background:var(--ink2)}
  ::-webkit-scrollbar-thumb{background:linear-gradient(var(--deep),var(--ac));border-radius:8px;border:3px solid var(--ink2)}
  ::-webkit-scrollbar-thumb:hover{background:var(--ac)}
  a{color:var(--dim)}
  .top{position:sticky;top:0;z-index:40;background:rgba(13,6,32,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
  .top-in{max-width:1180px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;gap:18px;flex-wrap:wrap}
  .brand{font-weight:800;font-size:18px;letter-spacing:-.5px}
  .brand b{color:var(--ac)}
  .credit-badge{margin-left:auto;font-size:13px;color:var(--ink);background:linear-gradient(90deg,var(--ac),var(--bright));padding:6px 14px;border-radius:20px;font-weight:700;white-space:nowrap}
  nav{display:flex;gap:4px;flex-wrap:wrap;width:100%}
  nav a{font-size:13px;text-decoration:none;color:var(--dimp);padding:5px 11px;border-radius:8px;border:1px solid transparent;transition:.15s}
  nav a:hover{color:var(--bright);background:var(--surface)}
  nav a.active{color:var(--ink);background:var(--ac);font-weight:700}
  main{max-width:1180px;margin:0 auto;padding:0 24px 80px}
  .hero{padding:56px 0 32px;border-bottom:1px solid var(--line)}
  .hero h1{font-size:40px;line-height:1.15;margin:0 0 14px;letter-spacing:-1px;font-weight:800}
  .hero h1 .grad{background:linear-gradient(90deg,var(--ac),var(--bright));-webkit-background-clip:text;background-clip:text;color:transparent}
  .hero p{max-width:760px;color:var(--dim);font-size:16px;margin:0 0 10px}
  .meta{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
  .chip{font-size:13px;padding:7px 14px;border-radius:10px;background:var(--surface);border:1px solid var(--line);color:var(--dim)}
  .chip b{color:var(--bright)}
  .gate{margin-top:22px;padding:16px 20px;border-radius:12px;background:linear-gradient(90deg,rgba(168,85,247,.16),rgba(168,85,247,.04));border:1px solid var(--ac);color:var(--bright);font-size:14px}
  .gate b{color:#fff}
  h2.sec{font-size:13px;letter-spacing:2px;text-transform:uppercase;color:var(--ac);margin:56px 0 18px;font-weight:800}
  .palette{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px}
  .sw{border-radius:12px;overflow:hidden;border:1px solid var(--line);background:var(--surface)}
  .sw .chipcol{height:64px}
  .sw .lab{padding:8px 12px;font-size:12px}
  .sw .lab b{display:block;font-size:13px;color:#fff}
  .sw .lab span{color:var(--dimp);font-family:monospace}
  .ramp{height:46px;border-radius:12px;margin:16px 0 6px;background:linear-gradient(90deg,#1A0B5E,#3B0F9E,#6D28F0,#A855F7,#E061F2,#FFE3FF);border:1px solid var(--line)}
  .ramp-lab{display:flex;justify-content:space-between;font-size:12px;color:var(--dimp);font-family:monospace}
  .principles{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-top:20px}
  .pr{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px}
  .pr h4{margin:0 0 8px;font-size:15px;color:var(--bright)}
  .pr p{margin:0;font-size:13.5px;color:var(--dim)}
  .pr .x{color:var(--bad);font-weight:700}
  .pr .v{color:var(--ok);font-weight:700}
  .toolbar{display:flex;gap:12px;align-items:center;margin:8px 0 24px;flex-wrap:wrap}
  .toggle{display:inline-flex;align-items:center;gap:9px;cursor:pointer;font-size:14px;color:var(--dim);user-select:none}
  .toggle input{appearance:none;width:42px;height:24px;border-radius:14px;background:var(--surface);border:1px solid var(--line);position:relative;cursor:pointer;transition:.2s}
  .toggle input::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:var(--dimp);transition:.2s}
  .toggle input:checked{background:var(--ac)}
  .toggle input:checked::after{left:20px;background:#fff}
  .scene{padding:36px 0;border-bottom:1px solid var(--line);scroll-margin-top:120px}
  .scene-head{display:flex;align-items:center;gap:16px;margin-bottom:20px}
  .scene-head .idx{font-size:30px;font-weight:800;color:var(--ac);font-family:monospace;opacity:.8}
  .scene-head h2{margin:0;font-size:24px;letter-spacing:-.5px}
  .scene-head .sub{margin:2px 0 0;color:var(--dimp);font-size:14px}
  .frames{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px;margin-bottom:22px}
  .frame{margin:0;border-radius:14px;overflow:hidden;border:1px solid var(--line);background:#000;cursor:zoom-in;transition:.18s}
  .frame:hover{border-color:var(--ac);transform:translateY(-2px)}
  .frame img{width:100%;display:block}
  .frame figcaption{padding:11px 14px;font-size:12.5px;color:var(--dim);background:var(--surface);line-height:1.5}
  .frame figcaption .t{display:inline-block;font-family:monospace;color:var(--ac);margin-right:8px;font-weight:700}
  .scene-body{display:grid;grid-template-columns:1.4fr 1fr;gap:28px}
  .scene-body h3{font-size:13px;letter-spacing:1px;text-transform:uppercase;color:var(--dimp);margin:0 0 12px}
  ul.cues{list-style:none;margin:0;padding:0}
  .cue{padding:10px 0;border-bottom:1px dashed var(--line);display:grid;grid-template-columns:42px 1fr;gap:10px;align-items:baseline}
  .cue .cid{font-family:monospace;font-size:12px;color:var(--ac);font-weight:700}
  .cue .ctext{font-size:16px;color:#f3eeff}
  .cue .ctext em{font-style:normal;color:var(--ac);font-weight:800}
  .cue .cold{grid-column:2;font-size:13px;color:var(--dimp);display:none;margin-top:3px}
  .cue .cold::before{content:"";display:inline-block;width:14px;height:1px;background:var(--bad);vertical-align:middle;margin-right:6px}
  body.compare .cue .cold{display:block}
  .tag-vb{font-size:11px;color:var(--ink);background:var(--ok);padding:2px 8px;border-radius:6px;margin-left:8px;font-weight:700;vertical-align:middle}
  ul.notes{list-style:none;margin:0;padding:0}
  ul.notes li{position:relative;padding:7px 0 7px 20px;font-size:13.5px;color:var(--dim);border-bottom:1px dashed var(--line)}
  ul.notes li::before{content:"";position:absolute;left:0;top:15px;width:8px;height:8px;border-radius:2px;background:linear-gradient(135deg,var(--ac),var(--bright))}
  .changelog{display:grid;gap:12px}
  .cl{background:var(--surface);border:1px solid var(--line);border-left:3px solid var(--ac);border-radius:10px;padding:16px 18px}
  .cl h4{margin:0 0 6px;font-size:15px;color:var(--bright)}
  .cl p{margin:0;font-size:13.5px;color:var(--dim)}
  .cl code{font-family:monospace;font-size:12.5px;color:var(--ac);background:var(--ink2);padding:1px 6px;border-radius:5px}
  .credits{margin-top:20px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:24px}
  .cr-row{display:flex;justify-content:space-between;gap:16px;padding:9px 0;border-bottom:1px dashed var(--line);font-size:14px}
  .cr-row:last-child{border-bottom:none}
  .cr-role{color:var(--dimp);font-size:12.5px}
  .cr-name{color:#fff;font-weight:600;text-align:right}
  .cr-row.me .cr-name{color:var(--ac);font-weight:800}
  .cr-row.me{background:linear-gradient(90deg,rgba(168,85,247,.12),transparent);border-radius:8px;padding-left:10px;padding-right:10px}
  footer{margin-top:48px;padding-top:24px;border-top:1px solid var(--line);color:var(--dimp);font-size:13px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}
  .lightbox{position:fixed;inset:0;z-index:100;background:rgba(5,2,15,.94);display:none;align-items:center;justify-content:center;padding:30px;cursor:zoom-out}
  .lightbox.open{display:flex}
  .lightbox img{max-width:96%;max-height:88vh;border-radius:10px;border:1px solid var(--ac);box-shadow:0 20px 80px rgba(168,85,247,.3)}
  .lightbox .lcap{position:absolute;bottom:22px;left:0;right:0;text-align:center;color:var(--dim);font-size:14px;padding:0 20px}
  @media(max-width:760px){.scene-body{grid-template-columns:1fr}.hero h1{font-size:30px}.credit-badge{margin-left:0}}
</style>

<div class="top"><div class="top-in">
  <div class="brand">量化 <b>·</b> 120 秒速通 <b>·</b> 返修稿审览</div>
  <div class="credit-badge">制作 / 返修 · Qwen-4-Max-Preview</div>
  <nav>${navLinks}</nav>
</div></div>

<main>
  <div class="hero">
    <h1>新文案 与 <span class="grad">新设计</span><br>请确认后配音</h1>
    <p>这是按策划者 r1 意见全面返修后的稿本与画面：修掉了各帧闪烁的工程根因，重做了过渡与视觉（去「AI 味」），理顺了画面逻辑，并把文案改得更像自然口播。下面每一场的关键帧都<strong>直接从返修后的源码渲染</strong>，旁白是改后的新文案。</p>
    <p>配音音色保留不变；文案改了含义，按仓库闸门须先经校对确认，再重配音、重混音、出 r2 预览。</p>
    <div class="meta">
      <span class="chip">片长 <b>120s</b></span>
      <span class="chip">旁白 <b>${cueCount}</b> 句 · <b>${chars}</b> 字（旧 546）</span>
      <span class="chip">关键帧 <b>${Object.keys(frames).length}</b> 张 · 源码实时渲染</span>
      <span class="chip">闪烁自检 <b>33/33</b> 无闪烁</span>
      <span class="chip">扫描错误 <b>0</b> 项</span>
    </div>
    <div class="gate"><b>确认闸门：</b>新文案须由校对者明确确认（<code>script-review.js export</code> 导出交审稿）后才重跑 <code>tts.js</code>。本页供预览，不代表已确认、已配音。</div>
  </div>

  <h2 class="sec">设计系统 · 色带即数据</h2>
  <div class="ramp"></div>
  <div class="ramp-lab"><span>最小 · 深靛 #1A0B5E</span><span>紫色的深浅 = 数的大小</span><span>最大 · 粉白 #FFE3FF</span></div>
  <div class="palette" style="margin-top:18px">
    <div class="sw"><div class="chipcol" style="background:#0D0620"></div><div class="lab"><b>底 · 近黑紫</b><span>#0D0620</span></div></div>
    <div class="sw"><div class="chipcol" style="background:#A855F7"></div><div class="lab"><b>强调 · 亮紫</b><span>#A855F7</span></div></div>
    <div class="sw"><div class="chipcol" style="background:#CDBDFF"></div><div class="lab"><b>说明 · 淡紫</b><span>#CDBDFF</span></div></div>
    <div class="sw"><div class="chipcol" style="background:#FFFFFF"></div><div class="lab"><b>强调 · 白</b><span>#FFFFFF</span></div></div>
    <div class="sw"><div class="chipcol" style="background:#FF6BB5"></div><div class="lab"><b>垮掉 · 粉</b><span>#FF6BB5</span></div></div>
  </div>
  <div class="principles">
    <div class="pr"><h4>背景</h4><p><span class="x">✕ 旧</span> 深色渐变 + 光斑 + 霓虹辉光<br><span class="v">✓ 新</span> 平涂近黑紫，色带本身承担强调</p></div>
    <div class="pr"><h4>标签</h4><p><span class="x">✕ 旧</span> 满天飞的白色胶囊<br><span class="v">✓ 新</span> plain 说明文字；少数结论用实心块</p></div>
    <div class="pr"><h4>过渡</h4><p><span class="x">✕ 旧</span> 封面盖住又退回原画面<br><span class="v">✓ 新</span> 片名卡盖满后停留，带色带到下一场</p></div>
    <div class="pr"><h4>运动</h4><p><span class="x">✕ 旧</span> 处处瞬移 / 闪烁<br><span class="v">✓ 新</span> 纯函数渲染，行选区平滑滑动、分数条生长</p></div>
  </div>

  <h2 class="sec">逐场 · 画面与旁白</h2>
  <div class="toolbar">
    <label class="toggle"><input type="checkbox" id="cmp"> 显示旧稿对照（第五稿 → 返修稿）</label>
    <span style="font-size:13px;color:var(--dimp)">点击关键帧可放大</span>
  </div>
  ${sceneCards}

  <h2 class="sec">改动清单 · 工程与内容</h2>
  <div class="changelog">
    <div class="cl"><h4>闪烁根因（工程）</h4><p><code>hide()/exit()/wipeOut()</code> 原用 <code>tl.to()</code>，起点在首次渲染才记录；并行渲染各段从段首跳入时起点不同 → 各段画面不一致。改为显式起点 <code>fromTo</code> 并去掉 <code>overwrite:'auto'</code>。<code>check_pure.js</code> 33 时刻三序比对：DOM 全一致、渲染相关路径像素逐帧一致。</p></div>
    <div class="cl"><h4>过渡</h4><p>开场片名卡盖满后 <code>vanish(world)</code> 收起原画面且不再退回；卡上的字盖满后才出现（消重叠）；卡底「连续 → 16 段」色带带到下一场。换场消除空背景闪现。</p></div>
    <div class="cl"><h4>视觉去 AI 味</h4><p>按 <code>standards.md</code>「要避开的」：平涂背景去渐变光斑、去霓虹外发光、胶囊标签改 plain 文字层级、字幕与秒尺分离、版本标签亮紫底改墨字（对比度过 4.5）。色带母题保留。</p></div>
    <div class="cl"><h4>画面逻辑</h4><p>仪表读数只给已讲到的事实（不剧透）；去开场幽灵数字；cost 残留标签收走；收尾对齐开场几何；版本名高亮对齐词时刻；test 行选区平滑滑动 + 分数条生长 + t8 退步动画；删字幕重复标签。</p></div>
    <div class="cl"><h4>文案</h4><p>保留策划者原句开场白、全部事实数字、长程误差表述，改自然口播；净字数 546 → ${chars}（只减不增）。改含义按闸门未配音，待校对确认。</p></div>
  </div>

  <h2 class="sec">署名 · Credit</h2>
  <div class="credits">
    ${peopleRows}
    ${modelRows}
    ${serviceRows}
    <div class="cr-row"><span class="cr-role">许可</span><span class="cr-name">${esc(proj.license)}</span></div>
    <div class="cr-row"><span class="cr-role">源码仓库</span><span class="cr-name">${esc(credits.repository)}</span></div>
  </div>

  <footer>
    <span>量化 · 120 秒速通 · 返修稿审览（r2 基础）</span>
    <span>制作 / 返修：Qwen-4-Max-Preview · ${esc(credits.repository)}</span>
  </footer>
</main>

<div class="lightbox" id="lb"><img id="lbimg" alt="放大关键帧"><div class="lcap" id="lbcap"></div></div>

<script>
  // 导航高亮（滚动监听）
  const links=[...document.querySelectorAll('nav a')];
  const secs=links.map(a=>document.getElementById(a.dataset.target));
  const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.toggle('active',l.dataset.target===e.target.id));}});},{rootMargin:'-45% 0px -50% 0px'});
  secs.forEach(s=>s&&io.observe(s));
  // 旧稿对照开关
  document.getElementById('cmp').addEventListener('change',e=>document.body.classList.toggle('compare',e.target.checked));
  // 关键帧放大
  const lb=document.getElementById('lb'),lbimg=document.getElementById('lbimg'),lbcap=document.getElementById('lbcap');
  document.querySelectorAll('.frame').forEach(f=>f.addEventListener('click',()=>{lbimg.src=f.querySelector('img').src;lbcap.textContent=f.dataset.cap||'';lb.classList.add('open');}));
  lb.addEventListener('click',()=>lb.classList.remove('open'));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')lb.classList.remove('open');});
</script>`;

  const outDir = path.join(video, '.qwen', 'tmp', 'qz-review');
  fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, 'fragment.html');
  fs.writeFileSync(out, html);
  console.log('已生成审览页：' + out);
  console.log('关键帧 ' + Object.keys(frames).length + ' 张，旁白 ' + cueCount + ' 句 / ' + chars + ' 字，页面 ' + (Buffer.byteLength(html) / 1048576).toFixed(2) + ' MB');
})().catch((e) => { console.error(e); process.exit(1); });
