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
      id: 'open', chap: null, lead: 0.8, tail: 0.4,
      cues: [
        ['o1', '十一月二日，OpenAI 发布了 Pando', { gap: 0.2 }],
        ['o2', '一套重新写过的 Git 服务器', { gap: 0.5 }],
        ['o3', '就在三周前，Anthropic 宣布', { gap: 0.15 }],
        ['o4', '它的主代码仓库，已经彻底离开了 Git', { gap: 0.7 }],
        ['o5', '做出 ChatGPT 的 OpenAI，做出 Claude 的 Anthropic', { gap: 0.2 }],
        ['o6', 'AI 双雄，前后脚动了同一样东西', { gap: 0.15 }],
        ['o7', '用了二十多年的 Git', { gap: 0.6 }],
        ['o8', '为什么偏偏是它们，要重造 Git？', { gap: 0.4 }],
        ['o9', '又为什么，一家换掉了它，一家却把它留下？', { gap: 0.3 }],
        ['oT', null, { pause: 1.5 }],
      ],
    },
    {
      id: 'git', chap: ['01', 'Git 怎么用'], lead: 1.8, tail: 0.5,
      cues: [
        ['g1', '一个项目的代码和全部修改历史，放在一个*仓库*里', { gap: 0.4 }],
        ['g2', '想同时做几件事，就各开一条*分支*', { gap: 0.15 }],
        ['g3', '做完再*合并*回去', { gap: 0.4 }],
        ['g4', '改好的东西打成包，*推送*给服务器', { gap: 0.15 }],
        ['g5', '别人要用，再从服务器*拉取*下来', { gap: 0.5 }],
        ['g6', '两家各自都有一个装着大量代码的巨型主仓库', { gap: 0.6 }],
      ],
    },
    {
      id: 'jam', chap: ['02', '仓库扛不住了'], lead: 1.8, tail: 0.5,
      cues: [
        ['j1', '现在，AI 也来写代码了', { gap: 0.3 }],
        ['j2', '一个工程师让几个智能体并行干活，就有好几项改动', { gap: 0.15 }],
        ['j3', '每次推送，又让好几个测试任务去拉取同一份代码', { gap: 0.5 }],
        ['j4', '整个公司加起来呢？', { gap: 0.4 }],
        ['j5', 'Anthropic 每天合并的改动，五月约 2,500 次', { gap: 0.1 }],
        ['j6', '九月超过 30,000 次', { gap: 0.5 }],
        ['j7', '光是自动测试，每天就要取出约 2,500 万次代码', { gap: 0.1 }],
        ['j8', '每次都完整取一遍，一天就要传 600 PB 以上', { gap: 0.6 }],
        ['j9', 'OpenAI 从去年年底起，推送变慢、合并失败', { gap: 0.05 }],
        ['j10', '可靠性一度跌破九成', { gap: 0.8 }],
        ['j11', '卡在哪？Git 服务器通常有两个老规矩', { gap: 0.5 }],
        ['j12', '第一，所有推送排成一队，好让整个仓库时刻只有一个样子', { gap: 0.5 }],
        ['j13', '第二，每来一个拉取的人，都单独现算、现打一个包', { gap: 0.5 }],
        ['j14', '人一多，这两件事都成了瓶颈', { gap: 0.8 }],
      ],
    },
    {
      id: 'oai', chap: ['03', 'OpenAI：留下 Git'], lead: 1.8, tail: 0.5,
      cues: [
        ['p1', 'OpenAI 先问：是 Git 本身到了极限', { gap: 0.05 }],
        ['p2', '还是服务它的方式到了极限？', { gap: 0.5 }],
        ['p3', '它押后者：Git 的用法一点不变，只换背后的服务器', { gap: 0.6 }],
        ['p4', '先治排队：每条分支各排各的，撞上同一条才分先后', { gap: 0.3 }],
        ['p5', '代价是同时看几条分支，未必是同一刻的样子', { gap: 0.05 }],
        ['p6', '而 OpenAI 说，人和智能体并不在意', { gap: 0.7 }],
        ['p7', '再治现算：推上来的包原样存好，谁要就直接发过去', { gap: 0.3 }],
        ['p8', '这些包在各地就近存一份，也就是*缓存*', { gap: 0.05 }],
        ['p9', '九成九以上的请求，就地就能取到', { gap: 0.7 }],
        ['p10', '结果，推送通常要等的时间缩短了近八成', { gap: 0.15 }],
        ['p11', '每天送出将近 1 PB 数据，只用少量 CPU', { gap: 0.6 }],
        ['p12', '十周上线：一名工程师设计核心，Codex 智能体写出实现', { gap: 0.9 }],
      ],
    },
    {
      id: 'ant', chap: ['04', 'Anthropic：换掉 Git'], lead: 1.8, tail: 0.5,
      cues: [
        ['a1', 'Anthropic 走得更远', { gap: 0.4 }],
        ['a2', 'Git 让每份拷贝都完整、能离线', { gap: 0.15 }],
        ['a3', '可 Anthropic 说，它的使用者几乎全是', { gap: 0.05 }],
        ['a4', '永远在线的智能体和自动任务', { gap: 0.15 }],
        ['a5', '这份优点，反倒成了拖累', { gap: 0.7 }],
        ['a6', '于是它造了 Scion：使用者不存完整仓库，要什么取什么', { gap: 0.2 }],
        ['a7', '记录、合并改动都在服务器上完成，连推送都省了', { gap: 0.5 }],
        ['a8', '数据存进去就不再改，于是可以层层缓存', { gap: 0.05 }],
        ['a9', '每一层，九成九的请求就地取到', { gap: 0.7 }],
        ['a10', '结果，CPU 和内存只有原来那套 Git 设施的两百分之一', { gap: 0.1 }],
        ['a11', '测试任务取代码，从几分钟缩短到几秒', { gap: 0.6 }],
        ['a12', '七个人，五个月，靠的也是 Claude 写代码', { gap: 0.7 }],
        ['a13', '不过 Anthropic 也说，Scion 只适合极其庞大的仓库', { gap: 0.05 }],
        ['a14', '不是给一般人替代 Git 用的', { gap: 0.9 }],
      ],
    },
    {
      id: 'why', chap: ['05', '为什么都在重造'], lead: 1.8, tail: 0.5,
      cues: [
        ['w1', '回到开头：为什么偏偏是这两家？', { gap: 0.5 }],
        ['w2', 'Anthropic 说，它用 Claude 写代码，比几乎任何公司都多', { gap: 0.05 }],
        ['w3', '所以常常最先发现，为人设计的工具在哪里吃紧', { gap: 0.4 }],
        ['w4', 'OpenAI 也说，Codex 改变了它开发软件的规模和速度', { gap: 0.8 }],
        ['w5', '一家认为问题在服务器，一家认为在 Git 的离线前提', { gap: 0.3 }],
        ['w6', '但都拆掉了那条总队伍，都靠不变的数据层层缓存', { gap: 0.8 }],
        ['w7', '对普通开发者，Git 的用法不会变', { gap: 0.1 }],
        ['w8', 'OpenAI 的部分改进，已经并入了 Git 本身', { gap: 0.4 }],
        ['w9', '但 Anthropic 预计，六到十二个月内', { gap: 0.05 }],
        ['w10', '会有更多公司撞上同一堵墙', { gap: 0.9 }],
        ['w11', '本片信息截至北京时间 2026 年 11 月 3 日', { gap: 0.5 }],
      ],
    },
    {
      id: 'credits', chap: null, lead: 0.4, tail: 0.6,
      cues: [
        ['credits', null, { pause: 8, credits: true }],   // 片尾名单：只上画面，不配旁白；名单取自 project.json 的 credits
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。合成前用 tts_probe.js 试读，配音后回听。
  const SAY = {
    zh: [
      [/2026 年 11 月 3 日/g, '二零二六年十一月三日'],
      [/2,500 万/g, '两千五百万'],
      [/2,500/g, '两千五百'],
      [/30,000/g, '三万'],
      [/600 PB/g, '六百 P B'],
      [/1 PB/g, '一 P B'],
      [/(\d+|千|万) TB/g, '$1 T B'],
      [/25 GB/g, '二十五 G B'],
    ],
  };
  const strip = (s) => s.replace(/\*/g, '');
  const ttsNorm = (s) => { for (const [re, to] of SAY[LANG] || []) s = s.replace(re, to); return s; };
  const SCRIPT = RAW.map((sc) => ({
    ...sc, chap: sc.chap ? [sc.chap[0], pick(sc.chap[1])] : null,
    cues: sc.cues.map(([id, cap, o = {}]) => [id, pick(cap), { ...o, tts: pick(o.tts), gap: pick(o.gap) }]),
  }));
  const ttsText = (c) => (c[2] && c[2].tts) || ttsNorm(strip(c[1]) + (LANG === 'zh' ? '。' : ''));

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
