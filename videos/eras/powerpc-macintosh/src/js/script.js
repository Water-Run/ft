// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 多语言时字幕写成 { zh: '…', en: '…' }；只有一种语言时直接写字符串。tts、gap、章节标题同理
// - 字幕里 *词* 标出术语（字幕上显示为强调），只为加重语气的词不标；术语第一次出现的那句说完时，画面上要有 data-gloss="词" 的注解（scan.js 的 GLOSS）
// - tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿（标题、转场）
// - 片尾署名只上画面：['credits', null, { pause: 8, credits: true }]；不写入旁白正文，不设置 tts。名单由 scenes/s9_credits.js 从 project.json 读取。
// - 每章一个 scene：chap [编号, 标题]（null 表示没有章节卡）、lead 章节卡时长、tail 章末留白
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。浏览器与 Node 共用本文件（工具读它排时间线）。
// 翻译以中文为底本：先定中文，再译其他语言；各语言的句号一一对应，时间轴各自排布。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const RAW = [
    {
      id: 'open', chap: ['01', '一张软盘'], lead: 0.6, tail: 0.8,
      cues: [
        ['o1', '假如你手里有一张软盘，里面是昨天没写完的稿子。'],
        ['o2', '现在，把它带到一台一九九八年的 iMac 面前。'],
        ['o3', '屏幕下面有一道缝。按一下，出来的是光盘托盘。'],
        ['o4', '沿着蓝色的机壳再找一圈，也找不到插软盘的地方。'],
        ['o5', '读昨天的软盘，今天得另接一个软驱。'],
        ['o6', '可就在四年前，苹果换掉了麦金塔的处理器，'],
        ['o7', '却花了很大力气，好让人还能双击昨天的软件。'],
        ['o8', '一张盘，一个程序。旧东西究竟怎么带到新机器上？'],
      ],
    },
    {
      id: 'bridge', chap: ['02', '双击以后'], lead: 1.3, tail: 0.8,
      cues: [
        ['b1', '一九九四年三月，首批 Power Macintosh 上市。'],
        ['b2', '这台 6100 的芯片，由苹果、IBM 和摩托罗拉合力开发。'],
        ['b3', '这一族芯片叫 PowerPC。6100 用的是其中的 601。'],
        ['b4', '难题藏在一个很平常的动作里。你双击桌上的应用图标。'],
        ['b5', '旧版应用里的指令，是写给摩托罗拉 68k 处理器的。'],
        ['b6', '图标还是那个图标，新的芯片却读不懂这些指令。'],
        ['b7', '苹果把一个模拟器装进了系统。'],
        ['b8', '碰到旧指令，它就用 PowerPC 的指令做出相应的动作。'],
        ['b9', '这样，许多旧程序可以原样打开，开发者也有时间改写。'],
        ['b10', '等到新版程序有了原生代码，芯片就能直接执行。'],
        ['b11', '连系统自己也这么搬家。一部分已经改写，'],
        ['b12', '另一部分仍跑在模拟器里，系统负责在两边交接。'],
        ['b13', '换芯这件大事，就这样藏进了一次双击里。'],
      ],
    },
    {
      id: 'color', chap: ['03', '蓝色机壳'], lead: 1.3, tail: 0.8,
      cues: [
        ['c1', '四年后再看那台 iMac。即使关着机，你也会认出它。'],
        ['c2', '从侧面看，邦迪蓝的外壳微微透光，里面的轮廓若隐若现。'],
        ['c3', '厚厚的显像管和电脑挤在同一个壳里，里头是一颗 G3。'],
        ['c4', '掀开侧盖，有两个 USB 口，配来的键盘也用它。'],
        ['c5', '软驱从机身里搬到了机身外。'],
        ['c6', '而要把文件从别处传来，机身上有以太网口，'],
        ['c7', '也有可以通过电话线上网的调制解调器。'],
        ['c8', '到了一九九九年一月，柜台上有了五种颜色。'],
        ['c9', '蓝莓、葡萄、橘子、青柠、草莓。同批五台，配置一样。'],
        ['c10', '你可以指着其中一台说，我就喜欢这个颜色。'],
      ],
    },
    {
      id: 'aqua', chap: ['04', '窗子有了光'], lead: 1.3, tail: 0.8,
      cues: [
        ['a1', '到了二〇〇一年三月，改变发生在屏幕里面。'],
        ['a2', 'Mac OS X 正式上市。新界面有个像水一样的名字，Aqua。'],
        ['a3', '按钮上有一道亮光。把窗口最小化，'],
        ['a4', '它就缩进屏幕边上的 Dock，等着你把它叫回来。'],
        ['a5', '亮晶晶的表面底下，新系统把各个程序的内存隔开。'],
        ['a6', '一个程序出了错，别的程序也就多了一层保护。'],
        ['a7', '那昨天用的软件呢？许多给 Mac OS 9 写的应用，'],
        ['a8', '还能在新系统的 Classic 环境里接着用。'],
        ['a9', '这回变的是操作系统，桌上的处理器依然是 PowerPC。'],
        ['a10', '一年后，iMac 身上那块厚厚的显像管也不见了。'],
        ['a11', '一块平板屏幕架在活动支臂上，抬高一点，再低一点，'],
        ['a12', '桌上的半球底座都不用跟着挪。G4 处理器就藏在底座里。'],
        ['a13', '连刚从相机里导进来的照片，也可以在 iPhoto 里翻看。'],
      ],
    },
    {
      id: 'heat', chap: ['05', '塔里的风'], lead: 1.3, tail: 0.8,
      cues: [
        ['g1', '二〇〇三年，把目光移到专业用户的桌边。'],
        ['g2', 'Power Mac G5 换上了铝合金塔式机箱。'],
        ['g3', '正面密密的孔留给空气，前后的把手留给搬机器的人。'],
        ['g4', '打开侧盖，机箱里划出了四个独立控制的散热区。'],
        ['g5', '哪一处更热，那一处的风扇就能跟着调速。'],
        ['g6', '这颗能做六十四位运算的 G5，在桌边有这么多地方散热。'],
        ['g7', '可如果把工作带出门，笔记本哪来这一整座塔的空间？'],
        ['g8', '二〇〇五年六月，乔布斯在开发者大会上提起这件事。'],
        ['g9', '大家想要装 G5 的 PowerBook，苹果一直没能交出来。'],
        ['g10', '他比较的是未来的每瓦性能。花一瓦电，能做多少事？'],
        ['g11', '在苹果当时的判断里，英特尔给出的前景更好。'],
      ],
    },
    {
      id: 'end', chap: ['06', '再双击一次'], lead: 1.3, tail: 0.8,
      cues: [
        ['e1', '二〇〇六年一月，新 iMac 还是熟悉的模样，'],
        ['e2', '里面已经换成了英特尔，同场还有新的 MacBook Pro。'],
        ['e3', '假如你把原来的应用拷过来，再双击一次，会发生什么？'],
        ['e4', '如果开发者给了通用版，里面装着两套代码，'],
        ['e5', '系统挑出适合这台机器的那一套，直接运行。'],
        ['e6', '如果手里只有给 PowerPC 写的 Mac OS X 应用，'],
        ['e7', '多数还能交给叫 Rosetta 的翻译软件，在新机器上运行。'],
        ['e8', '十二年前，模拟器接住了 68k 程序。如今轮到 PowerPC。'],
        ['e9', '到了八月，Mac Pro 发布，苹果宣布新机产品线换芯完成。'],
        ['e10', '发布会结束了，那张软盘里的稿子还等着你写完。'],
        ['e11', '对用电脑的人来说，时代怎样交到下一个时代手里，'],
        ['e12', '也许就是第二天坐下时，还能接着写昨天那一行。'],
      ],
    },
    {
      id: 'credits', chap: null, lead: 0.4, tail: 0.6,
      cues: [
        ['credits', null, { pause: 8, credits: true }],   // 片尾名单：只上画面，不配旁白；名单取自 project.json 的 credits
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/PowerPC/g, 'Power P C'], [/68k/g, '六十八 K'], [/601/g, '六零一'], [/6100/g, '六一零零'], [/Mac OS X/g, 'Mac O S Ten'], [/Mac OS 9/g, 'Mac O S 九'],
      // 多音字只按具体词替换，例：[/逐行/g, '逐航']；不要全局替换「行」字。
    ],
    en: [
      [/\bSAY\b/g, 'S A Y'],
    ],
  };
  const strip = (s) => s.replace(/\*/g, '');
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap) }]),
  }));
  const ttsText = (c) => (c[2] && c[2].tts) || ttsNorm(strip(c[1]));

  // 没有实测时长时的估算（合成旁白之前的占位）
  const estimate = (text) => (LANG === 'zh' ? 0.35 + text.replace(/[，。：；、\s]/g, '').length / 5.2 : 0.3 + text.split(/\s+/).length / 2.7);

  // 由脚本与实测时长算出整条时间线；浏览器端排动画、Node 端混音与检查都用它
  function layoutScript(DUR) {
    DUR = DUR || {};
    let t = 0;
    const cues = {}, scenes = [], order = [];
    for (const sc of SCRIPT) {
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
      t += sc.tail || 0.6;
      scenes.push({ id: sc.id, chap: sc.chap, start: s0, first, end: t, lead: sc.lead || 0 });
    }
    return { cues, scenes, order, total: t };
  }

  const api = { SCRIPT, LANG, pick, tr, layoutScript, ttsText, ttsNorm, strip };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else { Object.assign(root, api); root.DUR = (root.DUR_ALL || {})[LANG] || {}; }
})(typeof window !== 'undefined' ? window : globalThis);
