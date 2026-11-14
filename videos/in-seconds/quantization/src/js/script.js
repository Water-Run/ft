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
        ['o4', '这个让模型变小的办法，就叫*量化*', { gap: 1.6 }],
      ],
    },
    {
      id: 'hist', at: null, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['h1', '2023 年，有个程序员想在 MacBook 上跑 AI 模型', { gap: 0.3 }],
        ['h2', '他用的就是量化', { gap: 0.4 }],
        ['h3', '他说这是一晚上赶出来的，也不知道对不对', { gap: 1.1 }],
      ],
    },
    {
      id: 'what', at: null, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['a1', '模型文件里全是数，278 亿个', { gap: 0.35 }],
        ['a3', '原版每个数占 16 位，就是 16 个 0 或 1', { gap: 0.35 }],
        ['a4', '加起来差不多 55 GB', { gap: 0.8 }],
      ],
    },
    {
      id: 'how', at: null, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['b2', '数一个不少，只让每个数少占几位', { gap: 0.4 }],
        ['b4', '比如留 4 位，只排得出 16 种', { gap: 0.4 }],
        ['b5', '每 32 个数一组，各定 16 个值', { gap: 0.4 }],
        ['b6', '每个数换成最近的那个，只用 4 位记它是第几个', { gap: 0.6 }],
        ['b7', '这一组占的地方，不到原来的三成', { gap: 1.3 }],
      ],
    },
    {
      id: 'cost', at: null, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['c1', '可这四个数，本来各不相同', { gap: 0.3 }],
        ['c2', '现在换成了同一个值', { gap: 0.8 }],
        ['c3', '这 32 个数，几乎个个偏了一点', { gap: 1.2 }],
        ['c3b', '数一偏，模型说出的词也可能变', { gap: 0.5 }],
        ['c4', '4 位的每说 100 个词，约有 5 个和原版不一样', { gap: 0.4 }],
        ['c5', '它每个词都接着前面的说', { gap: 0.35 }],
        ['c6', '前面岔开一点，后面可能越走越偏', { gap: 2.6 }],
      ],
    },
    {
      id: 'test', at: null, chap: null, lead: 0.2, tail: 0.2,
      cues: [
        ['t1', '2026 年，有人拿 Qwen3.8 27B 的五个版本做题', { gap: 0.3 }],
        ['t2', '198 道四选一，每题它都先写一段思路再答', { gap: 0.45 }],
        ['t3', '原版答对九成', { gap: 0.35 }],
        ['t4', '8 位的、4 位的，也都是九成', { gap: 0.4 }],
        ['t5', '2 位的掉到八成五', { gap: 0.4 }],
        ['t6', '1 位的只对一成，还不如瞎蒙', { gap: 0.9 }],
        ['t7', '思路写短些，反而能对一成半', { gap: 0.3 }],
        ['t8', '写长了，常常写到字数上限，交白卷', { gap: 0.8 }],
        ['t9', '要做很多步的编程任务，4 位的也和原版打平', { gap: 1.4 }],
      ],
    },
    {
      id: 'close', at: null, chap: null, lead: 0.2, tail: 0.1,
      cues: [
        ['z1', '原版叫 BF16，量化过的叫 Q8、Q4，还有 NVFP4 等等', { gap: 0.35 }],
        ['z2', '数字大致就是每个数占几位', { gap: 0.7 }],
        ['z3', '开头那个 17 GB 的，就是 4 位的', { gap: 0.35 }],
        ['z4', '24 GB 的显卡，装得下了', { gap: 0.4 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址。不配旁白。策划者看 r3 后要求「结尾总太长 缩短30%」：最后一句之后的停留 + 名单由约 10.2 秒缩到约 7 秒，名单 5.8 秒
      id: 'outro', at: 114.2, chap: null, lead: 0.3, tail: 0,
      cues: [
        ['z9', null, { pause: 5.2, credits: true }],   // 名单取自 project.json 的 credits
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。
  // 「数一个不少」「数一偏」句首的「数」合成时读成了 shǔ（策划者 r3 听出），读法里换成同音的「树」，只改这两个词，字幕不变
  const SAY = {
    zh: [
      [/Qwen3\.8 27B/g, 'Qwen 三点八，二十七 B'],
      [/Q8、Q4/g, 'Q 八、Q 四'], [/NVFP4/g, 'N V F P 四'], [/BF16/g, 'B F 十六'],
      [/数一个不少/g, '树，一个不少'], [/数一偏/g, '树一偏'], [/0 或 1/g, '零或一'], [/MacBook/g, 'Mac Book'],
      [/2023 年/g, '二零二三年'], [/2026 年/g, '二零二六年'], [/278 亿/g, '二百七十八亿'], [/198 道/g, '一百九十八道'], [/32 个数/g, '三十二个数'],
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

  // 没有实测时长时的估算（合成旁白之前的占位）。中文按本片选定音色（精英青年 beta，1.25 倍速）36 句旧配音的最小二乘拟合：
  // 每个汉字 0.104 秒、每个拉丁字母 0.135 秒、每个句中逗号 0.48 秒、每句 0.33 秒（最大误差 0.9 秒），再乘 1.03 偏保守
  const estimate = (text) => {
    if (LANG !== 'zh') return 0.3 + text.split(/\s+/).length / 2.7;
    const lat = (text.match(/[A-Za-z]/g) || []).length, commas = (text.match(/[，：；、]/g) || []).length;
    const cjk = text.replace(/[，。：；、\s]/g, '').length - lat;
    return 1.03 * (0.33 + 0.104 * cjk + 0.135 * lat + 0.48 * commas);
  };
  // 实测时长只在它对应的就是当前这句的读法时才用：改过字的句子，旧配音的时长与词边界都作废，按估算排，直到重新配音
  const fresh = (meas, c) => meas && meas.words && meas.words.map((w) => w[2]).join('').replace(/\s/g, '') === ttsText(c).replace(/\s/g, '');

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
        const meas = fresh(DUR[id], c) ? DUR[id] : null;
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
