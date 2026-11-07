// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 多语言时字幕写成 { zh: '…', en: '…' }；tts、gap、pause 同理
// - 字幕里 *词* 标出术语（字幕上显示为强调），只为加重语气的词不标；术语第一次出现的那句说完时，画面上要有 data-gloss="词" 的注解（scan.js 的 GLOSS）
// - tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。浏览器与 Node 共用本文件（工具读它排时间线）。
// 翻译以中文为底本：先定中文，再译其他语言；各语言的句号一一对应，时间轴各自排布。
//
// 本系列（XX 秒速通）的时间线是定长的：片名里的秒数就是成片的时长，各语言相同。
// - 场景的 at 是它开始的时刻（秒）。上一场的旁白说完之后，余下的时间留白到这一刻；说不完就是超出，记入 L.problems，总闸门不通过。
// - TOTAL 是全片的时长，最后一场补齐到这一刻。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')


  // 定点 at 是按估算排的初稿位置；选定音色后逐句实测，再改定点（只删内容，不压留白）。
  const TOTAL = 192;
  const RAW = [
    {
      // 引子：观众用过的 ToDesk、UU 远程 → 反差 → 点名。片名卡只上画面，不念
      id: 'open', at: 0, chap: null, lead: 0.4, tail: 0.2,
      cues: [
        ['o1', '用 ToDesk、UU 远程连过别人的电脑吗？', { gap: 0.4 }],
        ['o2', '它们把那边的屏幕录成视频，一帧帧发给你', { gap: 0.6 }],
        ['o3', 'Windows 自带的远程桌面，有更优雅的做法', { gap: 0.3 }],
        ['o4', '它叫 *RDP*，发过来的不是录像，是画面的画法', { gap: 0.3 }],
        ['oT', null, { pause: 1.4 }],
      ],
    },
    {
      // 历史：为什么会有它。年份上画面
      id: 'history', at: 19, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['h1', 'RDP 诞生在 1998 年', { gap: 0.3 }],
        ['h2', '那时电脑贵，微软想让一台服务器分给很多人用', { gap: 0.3 }],
        ['h3', '每人一台便宜的终端，程序全在服务器上跑', { gap: 0.3 }],
        ['h4', '项目代号就叫 Hydra，九头蛇', { gap: 0.5 }],
        ['h5', '2001 年，Windows XP 专业版也带上了它', { gap: 0.3 }],
      ],
    },
    {
      // 本质区别：站的位置
      id: 'stand', at: 38.25, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['k1', '两种远程，最根本的区别，是站的位置', { gap: 0.5 }],
        ['k2', 'ToDesk、UU 远程站在屏幕外面', { gap: 0.2 }],
        ['k3', '那边每秒截几十次屏，压成*视频*发过来', { gap: 0.3 }],
        ['k4', '它只认像素，不管像素是怎么来的', { gap: 0.6 }],
        ['k5', 'RDP 站在 Windows 里面', { gap: 0.3 }],
        ['k6', 'Windows 画窗口、写字，本来就是一句句*指令*', { gap: 0.2 }],
        ['k7', '在这儿填一块颜色，在那儿写一个字', { gap: 0.3 }],
        ['k8', 'RDP 在它们变成像素之前接过来，交给你的电脑自己画', { gap: 0.3 }],
      ],
    },
    {
      // 例子：同一个动作，两边各传多少。字节数取自规范样例（FACTS G4–G7）与本机实验（L2）
      id: 'bytes', at: 68.5, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['x1', '比如在远程的记事本里打一行字', { gap: 0.3 }],
        ['x2', '录像的办法，把变了的那片像素压一遍，六百多字节', { gap: 0.5 }],
        ['x3', 'RDP 呢，每个字的样子，第一次出现时就存到你这边', { gap: 0.2 }],
        ['x4', '一个字母 d，九个字节', { gap: 0.3 }],
        ['x5', '之后只说几号字写在哪，这一行九个字，四十七字节', { gap: 0.6 }],
        ['x6', '往下翻一页，录像这一帧要两万三千多字节', { gap: 0.3 }],
        ['x7', 'RDP 只说一句把这块往上挪，十四个字节', { gap: 0.2 }],
        ['x8', '再补上露出来的几行', { gap: 0.4 }],
        ['x9', '远程桌面连接的选项里，卫星、56K 拨号都列着', { gap: 0.3 }],
        ['x10', '在 56K 拨号上，刚才那一帧录像要传三秒多', { gap: 0.2 }],
        ['x11', '而 RDP 那句指令，两毫秒就到了', { gap: 0.3 }],
      ],
    },
    {
      // 优雅之处：远程桌面按你的电脑重新排
      id: 'adapt', at: 112, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['a1', '因为传的是画法，画在多大的纸上，由你这边说了算', { gap: 0.5 }],
        ['a2', '连上的那一刻，你的电脑会报上自己的屏幕大小、缩放比例', { gap: 0.2 }],
        ['a3', '还有键盘布局，连时区都报', { gap: 0.3 }],
        ['a4', '那边的桌面，就照你的屏幕重新排好', { gap: 0.3 }],
        ['a5', '窗口拉大拉小，远程的分辨率也跟着变', { gap: 0.5 }],
        ['a6', '录像的办法只能录屏幕本来的样子，尺寸不对就整张缩放', { gap: 0.5 }],
        ['a7', '复制的字、要打印的文档、放出来的声音', { gap: 0.15 }],
        ['a7b', '也都有专门的*通道*送到你这边', { gap: 0.3 }],
      ],
    },
    {
      // 局限：深度绑定
      id: 'limit', at: 144.25, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['b1', '不过，这一切的前提，是它和 Windows 绑得很深', { gap: 0.4 }],
        ['b2', '被连的那台电脑得是 Windows，家庭版还不行', { gap: 0.3 }],
        ['b3', '它懂的，也只是 Windows 的画法', { gap: 0.2 }],
        ['b4', '游戏、电影这种整屏都在变的画面，指令说不过来', { gap: 0.2 }],
        ['b5', '所以 Windows 8 以后，图片和视频那一块', { gap: 0.15 }],
        ['b5b', 'RDP 也交给视频编码去传', { gap: 0.5 }],
        ['b6', 'ToDesk、UU 远程只认像素，反倒哪个系统都能连', { gap: 0.2 }],
        ['b7', '又拼高帧率、低延迟，游戏也能玩', { gap: 0.3 }],
      ],
    },
    {
      // 收尾：回到「站的位置」，一句结论
      id: 'end', at: 174.5, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['e1', '录像的办法，看到的是结果', { gap: 0.2 }],
        ['e2', 'RDP 知道每一笔是怎么画上去的', { gap: 0.3 }],
        ['e3', '所以它能照着你的屏幕，重新画一遍', { gap: 0.3 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址。约 7.5 秒，不配旁白
      id: 'outro', at: 184.5, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['z1', null, { pause: 6.5, credits: true }],   // 名单取自 project.json 的 credits
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。
  const SAY = {
    zh: [
      [/1998 年/g, '一九九八年'],
      [/2001 年/g, '二零零一年'],
      [/Hydra/g, '海德拉'],
      [/56K/g, '五十六 K'],
      [/ToDesk/g, 'To Desk'],
      [/UU 远程/g, '优优远程'],
      [/RDP/g, 'R D P'],
      [/Windows XP/g, 'Windows X P'],
      [/一行/g, '一航'],
      [/几行/g, '几航'],
      [/「|」/g, ''],
    ],
    en: [
    ],
  };
  const strip = (s) => s.replace(/\*/g, '');
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap), pause: pick(o.pause) }]),
  }));
  const ttsText = (c) => (c[2] && c[2].tts) || ttsNorm(strip(c[1]) + (LANG === 'zh' ? '。' : ''));

  // 没有实测时长时的估算（合成旁白之前的占位）
  const estimate = (text) => (LANG === 'zh' ? 0.35 + text.replace(/[，。：；、\s]/g, '').length / 5.2 : 0.3 + text.split(/\s+/).length / 2.7);

  // 由脚本与实测时长算出整条时间线；浏览器端排动画、Node 端混音与检查都用它
  function layoutScript(DUR) {
    DUR = DUR || {};
    let t = 0;
    const cues = {}, scenes = [], order = [], problems = [];
    const pinTo = (at, what) => {            // 把时间线补齐到定点；已经超过就记为问题
      const last = scenes[scenes.length - 1];
      if (t > at + 1e-6) { problems.push(`场景 ${last.id} 的旁白超出${what} ${(t - at).toFixed(2)} 秒（到 ${t.toFixed(2)}s，应在 ${at}s 之前说完）`); return; }
      last.slack = +(at - t).toFixed(3); t = at; last.end = t;
    };
    for (const sc of SCRIPT) {
      if (sc.at != null && scenes.length) pinTo(sc.at, `下一场 ${sc.id} 的定点`);
      const s0 = t;
      t += sc.lead || 0;
      const first = t;
      for (const c of sc.cues) {
        const [id, cap, o = {}] = c;
        const meas = DUR[id];
        const d = o.pause != null ? o.pause : (meas ? meas.d : estimate(ttsText(c)));
        cues[id] = { id, scene: sc.id, cap, start: t, end: t + d, d, silent: o.pause != null, tts: o.pause != null ? null : ttsText(c), words: meas ? meas.words : null };
        order.push(id);
        t += d + (o.gap != null ? o.gap : 0.3);
      }
      t += sc.tail != null ? sc.tail : 0.6;
      scenes.push({ id: sc.id, chap: sc.chap, start: s0, first, end: t, lead: sc.lead || 0, slack: 0 });
    }
    pinTo(TOTAL, '全片时长');
    return { cues, scenes, order, total: t, problems };
  }

  const api = { SCRIPT, LANG, pick, tr, layoutScript, ttsText, ttsNorm, strip, TOTAL };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { Object.assign(root, api); root.DUR = (root.DUR_ALL || {})[LANG] || {}; }
})(typeof window !== 'undefined' ? window : globalThis);
