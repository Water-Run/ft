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

  const TOTAL = 96;
  // 100 BPM：一拍 0.6 秒，一小节 2.4 秒，全片 40 小节。各场的 at 都落在小节线上：open 6 小节、define 7、write 4、prefill 9、length 4、scale 5、close 到 93.0 秒，片尾名单 3.0 秒（策划者 2026-11-18 要求压到 2–3 秒）。
  // 叙事主线（大模型的工作方式）：为什么第一个 Token 来得慢，之后却一个接一个？——先交代它是对话里体感延迟的主要来源；
  // 模型每次只写一个 Token，写每一个都要参考前面所有的内容，所以写出第一个之前要先读完整个输入并把中间结果存进缓存；输入越长，第一个来得越晚；
  // 之后每个新 Token 只在缓存上续一小步（间隔目标几十毫秒，只在画面上标出处）；重复提问时，开头相同的部分会命中缓存、不用重新读，首 Token 延迟通常更短（命中缓存与它的影响，各一句）。
  // 再给出尺度：聊天里一秒以内算快、长输入几秒（只在画面上）、开着深度思考的要几十秒以上；最后点明它不说明整段回答多久。
  // 例子用程序员的场景：让模型写一个判断质数的 Python 函数，输出的 Token 是 def、is_、prime……；长输入是「整个代码文件」。
  // 首 Token 延迟这个名字本身只需要一句话（后面带上缩写 TTFT，再念出全称 Time To First Token；画面上 TTFT 四个字母随旁白逐词展开），定义压在 define 一场里，其余时间讲机制与尺度。
  const RAW = [
    { id: "open", at: 0, chap: null, lead: 0.2, tail: 0.1, cues: [
      ["o1", "向 LLM 提问之后，光标闪一会儿，第一个字才出现", { gap: 0.25 }],
      ["o2", "之后文字却一个接一个冒出来", { gap: 0.25 }],
      ["o3", "这段等待，是对话里体感延迟的主要来源", { gap: 0.1 }],
      ["oT", null, { pause: 1.6 }],
    ] },
    { id: "define", at: 14.4, chap: null, lead: 0.3, tail: 0.2, cues: [
      ["d1", "回答是一小段一小段写出来的，每一小段叫一个 *Token*", { gap: 0.3 }],
      ["d2", "从发出请求，到收到第一段有内容的输出", { tts: "从发出请求，到收到第一段有内容的输出，", gap: 0.15 }],
      ["d3", "这段时间就是 *首 Token 延迟*，缩写 *TTFT*", { tts: "这段时间就是首偷啃延迟，缩写 T T F T，", gap: 0.1 }],
      // 2026-11-19 策划者要求念出全称（预览 r1 意见）并确认字幕与旁白都加；显式 tts 绕过 SAY，保留英文 Token
      ["d4", "全称 Time To First Token", { tts: "全称 Time To First Token。", gap: 0.3 }],
    ] },
    { id: "write", at: 31.2, chap: null, lead: 0.3, tail: 0.2, cues: [
      ["w1", "模型写回答，每次只能写一个 Token", { gap: 0.3 }],
      ["w2", "写每一个新 Token，都要参考前面所有的 Token", { gap: 0.3 }],
    ] },
    { id: "prefill", at: 40.8, chap: null, lead: 0.2, tail: 0.1, cues: [
      ["r1", "写出第一个 Token 之前，要先读完整个输入", { gap: 0.2 }],
      ["r2", "输入的 Token 同时处理，中间结果存进缓存", { gap: 0.2 }],
      ["r3", "之后每个新 Token，只在缓存上续一小步", { gap: 0.2 }],
      ["r4", "重复提问时，开头相同的部分会命中缓存", { tts: "重复提问时，开头相同的部分会命中缓存，", gap: 0.15 }],
      ["r5", "不用重新读，首 Token 延迟通常更短", { gap: 0.3 }],
    ] },
    { id: "length", at: 62.4, chap: null, lead: 0.3, tail: 0.2, cues: [
      ["l1", "同样的问题，附上整个代码文件", { gap: 0.4 }],
      ["l2", "要先读的内容多了，第一个 Token 就更晚", { gap: 0.3 }],
    ] },
    { id: "scale", at: 72.0, chap: null, lead: 0.2, tail: 0.05, cues: [
      ["s1", "聊天里，首 Token 延迟一秒以内算快", { gap: 0.25 }],
      ["s3", "开着深度思考的模型，要等几十秒以上", { gap: 0.25 }],
      ["s4", "首 Token 延迟短，不代表整段写完快", { gap: 0.3 }],
    ] },
    { id: "close", at: 84.0, chap: null, lead: 0.3, tail: 0.2, cues: [
      ["e1", "第一个 Token 慢，是因为要先读完输入", { tts: "第一个偷啃慢，是因为要先读完输入，", gap: 0.15 }],
      ["e2", "之后才一个接一个地写", { gap: 0.3 }],
    ] },
    { id: 'outro', at: 93.0, chap: null, lead: 0.3, tail: 0, cues: [['z1', null, { pause: 2.4, credits: true }]] },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      // Token 读「偷啃」（策划者 2026-11-19）；两侧的空格一并吃掉，否则合成时在「首 / Token / 延迟」之间各停一下
      [/TTFT/g, 'T T F T'], [/LLM/g, 'L L M'], [/\s*Token\s*/g, '偷啃']
    ],
    en: [
    ],
  };
  const strip = (s) => s.replace(/\*/g, '');
  // 汉字与汉字之间的空格会让合成多停一下（字幕里的「就是 首 Token」「写 Python」这类写法）：换成读法之后一并去掉
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return LANG === 'zh' ? s.replace(/([一-鿿，。])\s+(?=[一-鿿])/g, '$1') : s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap), pause: pick(o.pause) }]),
  }));
  const ttsText = (c) => (c[2] && c[2].tts) || ttsNorm(strip(c[1]) + (LANG === 'zh' ? '。' : ''));

  // 没有实测时长时的估算（合成旁白之前的占位）。2026-11-18 用 Xiaoyi +6% 的 10 句实测拟合：每句约 0.55 秒 + 字数 / 5.2；误差约 ±0.4 秒/句
  const estimate = (text) => (LANG === 'zh' ? 0.55 + text.replace(/[，。：；、\s]/g, '').length / 5.2 : 0.3 + text.split(/\s+/).length / 2.7);

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
