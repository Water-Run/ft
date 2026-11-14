// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 字幕里 *词* 标出术语（字幕上显示为强调），只为加重语气的词不标；术语第一次出现的那句说完时，画面上要有 data-gloss="词" 的注解（scan.js 的 GLOSS）
// - tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。浏览器与 Node 共用本文件（工具读它排时间线）。
//
// 本系列（XX 秒速通）的时间线是定长的：片名里的秒数就是成片的时长。
// - 场景的 at 是它开始的时刻（秒）。上一场的旁白说完之后，余下的时间留白到这一刻；说不完就是超出，记入 L.problems，总闸门不通过。
// - TOTAL 是全片的时长，最后一场补齐到这一刻。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const TOTAL = 120;
  const RAW = [
    {
      id: 'open', at: 0, chap: null, lead: 0.4, tail: 0.2,
      cues: [
        ['o1', '这，是一个 Qwen3.8 27B', { gap: 0.4 }],
        ['o1b', '一个 AI 模型，文件有 55 GB', { gap: 0.3 }],
        ['o2', '想在自己电脑上跑，24 GB 的显卡装不下', { gap: 0.45 }],
        ['o3', '可它还有个 17 GB 的版本，做题的分数几乎一样', { gap: 0.5 }],
        ['o4', '这个让模型变小的办法，就叫*量化*', { gap: 0.8 }],
      ],
    },
    {
      id: 'what', at: null, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['a1', '模型文件里全是数，278 亿个', { gap: 0.35 }],
        ['a3', '原版每个数占 16 位，就是 16 个 0 或 1', { gap: 0.35 }],
        ['a4', '加起来差不多 55 GB', { gap: 0.6 }],
      ],
    },
    {
      id: 'how', at: null, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['b1', '从中取出 32 个数', { gap: 0.35 }],
        ['b2', '数不能删，那就让每个数少占几位', { gap: 0.4 }],
        ['b4', '4 位，只排得出 16 种', { gap: 0.4 }],
        ['b5', '先定 16 个值，每个数换成最近的那个', { gap: 0.4 }],
        ['b6', '文件里只记它是第几个', { gap: 0.4 }],
        ['b7', '这 32 个数，占的地方不到原来的三成', { gap: 0.7 }],
      ],
    },
    {
      id: 'cost', at: null, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['c1', '可这四个数，本来各不相同', { gap: 0.3 }],
        ['c2', '现在都换成同一个值，一模一样', { gap: 0.5 }],
        ['c3', '几乎每个数都偏了一点', { gap: 0.45 }],
        ['c4', '4 位每说 100 个词，约有 5 个和原版不一样', { gap: 0.4 }],
        ['c5', '它每个词都接着前面的说', { gap: 0.35 }],
        ['c6', '前面岔开一点，后面就可能越走越偏', { gap: 0.7 }],
      ],
    },
    {
      id: 'hist', at: null, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['h1', '2023 年，有个程序员想在 MacBook 上跑大模型', { gap: 0.3 }],
        ['h2', '他就是用 4 位压的', { gap: 0.3 }],
        ['h3', '他说明里写：开头通顺，三四十个词后明显变差', { gap: 0.6 }],
      ],
    },
    {
      id: 'test', at: null, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['t1', '三年后，有人拿 Qwen3.8 27B 的五个版本做题', { gap: 0.3 }],
        ['t2', '198 道选择题，四选一', { gap: 0.45 }],
        ['t3', '原版 55 GB，答对九成', { gap: 0.35 }],
        ['t4', '8 位 29 GB，4 位 17 GB，都还是九成', { gap: 0.4 }],
        ['t5', '2 位 10.7 GB，八成五', { gap: 0.4 }],
        ['t6', '1 位 6.2 GB，只对一成，还不如瞎蒙', { gap: 0.5 }],
        ['t7', '让它少想一点，反而能对一成半', { gap: 0.3 }],
        ['t8', '想久了，常常把字数用完，交白卷', { gap: 0.5 }],
        ['t9', '4 位做 89 个多步编程任务，也和原版打平', { gap: 0.7 }],
      ],
    },
    {
      id: 'close', at: null, chap: null, lead: 0.2, tail: 0.1,
      cues: [
        ['z1', '原版叫 BF16，量化过的叫 Q8、Q4，还有 NVFP4', { gap: 0.35 }],
        ['z2', '数字大致就是每个数占几位', { gap: 0.5 }],
        ['z3', '开头那个 17 GB 的，就是 4 位的', { gap: 0.35 }],
        ['z4', '24 GB 的显卡，装得下了', { gap: 0.4 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址。约 7.5 秒，不配旁白
      id: 'outro', at: 112.5, chap: null, lead: 0.5, tail: 0,
      cues: [
        ['z9', null, { pause: 6.5, credits: true }],   // 名单取自 project.json 的 credits
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。
  const SAY = {
    zh: [
      [/Qwen3\.8 27B/g, 'Qwen 三点八，二十七 B'],
      [/Q8、Q4/g, 'Q 八、Q 四'], [/NVFP4/g, 'N V F P 四'], [/BF16/g, 'B F 十六'],
      [/0 或 1/g, '零或一'], [/MacBook/g, 'Mac Book'],
      [/2023 年/g, '二零二三年'], [/278 亿/g, '二百七十八亿'], [/198 道/g, '一百九十八道'],
      [/10\.7 GB/g, '十点七 G B'], [/6\.2 GB/g, '六点二 G B'],
      [/55 GB/g, '五十五 G B'], [/29 GB/g, '二十九 G B'], [/24 GB/g, '二十四 G B'], [/17 GB/g, '十七 G B'],
      [/100 个/g, '一百个'], [/89 个/g, '八十九个'], [/5 个/g, '五个'],
      [/16 位/g, '十六位'], [/32 个/g, '三十二个'], [/16 个/g, '十六个'], [/16 种/g, '十六种'],
      [/8 位/g, '八位'], [/4 位/g, '四位'], [/2 位/g, '两位'], [/1 位/g, '一位'],
    ],
    en: [],
  };
  const strip = (s) => s.replace(/\*/g, '');
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap), pause: pick(o.pause) }]),
  }));
  const ttsText = (c) => (c[2] && c[2].tts) || ttsNorm(strip(c[1]) + (LANG === 'zh' && !/[？！。]$/.test(strip(c[1])) ? '。' : ''));

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
