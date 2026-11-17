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

  const TOTAL = 150;
  // 贯穿例子（虚构，画面与旁白共用；策划者 2026-11-16 选定）：开源仓库「WaterRun / 活动报名」的报名判断写成了 if (age > 18)，刚满 18 岁的人报不上名，应为 >=。
  // 不用同音错字（如「鸡蛋 / 鸡旦」）：旁白听不出差别（2026-11-16 回听发现）。「大于」与「大于等于」读得出区别。
  // 观众没有写权限 → Fork 出「你 / 活动报名」→ 开分支 fix-age → 改一行、提交、推送 → 向原仓库发起 PR #13（Closes #12）→ 维护者审、合并。
  // 事实依据逐句见 review/NOTES.md 的「句号 ↔ FACTS」表；事实只来自 research/FACTS.md。
  const RAW = [
    {
      // 现象：没有权限，却照样能提改动（反差）；片名卡落在 oT
      id: 'open', at: 0, chap: null, lead: 0.5, tail: 0.3,
      cues: [
        ['o1', '一个开源的报名工具：刚满 18 岁，却报不上名。', { gap: 0.35 }],
        ['o2', '代码写的是“大于 18”，正好 18 岁的被挡在外面。', { gap: 0.5 }],
        ['o3', '可这是别人的项目，你没有权限改。', { gap: 0.5 }],
        ['o4', '但在 GitHub 上，你照样能提改动。怎么做到的？', { gap: 0.4 }],
        ['oT', null, { pause: 2.8 }],
      ],
    },
    {
      // 它是什么：先分清 Git 与 GitHub（Fork、PR、Issue 不属于 Git）；再交代谁能直接改一个仓库，引出三步
      id: 'what', chap: null, lead: 0.6, tail: 0.5,
      cues: [
        ['a1', '先分清：*Git* 是个工具，记下每一次修改；', { gap: 0.2 }],
        ['a2', '*GitHub* 是个网站，把这些项目放到网上。', { gap: 0.5 }],
        ['a3', 'Fork、PR、Issue 都是网站的功能，不属于 Git；', { gap: 0.25 }],
        ['a4', '分支和提交，才是 Git 自带的。', { gap: 0.6 }],
        ['a5', '每个*仓库*，只有拿到写权限的*维护者*能直接改。', { gap: 0.4 }],
        ['a6', '其他人改不了，但有三步办法：Fork、开分支、提 PR。', { gap: 0.3 }],
      ],
    },
    {
      // 它怎么工作（重头）：同一处错误走完 Fork → 分支 → 提交推送 → PR → 审查 → 合并
      id: 'how', chap: null, lead: 0.6, tail: 0.6,
      cues: [
        ['b1', '第一步，在原仓库点 *Fork*。', { gap: 0.25 }],
        ['b2', 'GitHub 把仓库复制一份到你名下，这份副本随你改。', { gap: 0.7 }],
        ['b3', '第二步，在副本里开一条*分支*，叫 fix-age。', { gap: 0.3 }],
        ['b4', '分支从主线岔出去，怎么改，主线都不变。', { gap: 0.6 }],
        ['b5', '把“大于”改成“大于等于”，提交，推送到副本。', { gap: 0.4 }],
        ['b6', '改动在你的分支上了，原仓库一个字没变。', { gap: 0.6 }],
        ['b7', '第三步，回原仓库发起 *Pull Request*，简称 PR。', { gap: 0.3 }],
        ['b8', '意思是“请你拉取”：请维护者把改动拉过去。', { gap: 0.5 }],
        ['b9', '它不是直接改进去，而是一页申请，', { gap: 0.25 }],
        ['b10', '写明从哪条分支、合到哪里、改了哪一行。', { gap: 0.5 }],
        ['b11', '维护者能逐行提意见，也能让机器跑检查。', { gap: 0.6 }],
        ['b12', '没改完，可以先开成草稿：能看，不能合并。', { gap: 0.6 }],
        ['b13', '维护者一点合并，改动才进原仓库的主线。', { gap: 0.4 }],
        ['b14', '合并后，fix-age 可以删掉，PR 一直留着。', { gap: 0.3 }],
      ],
    },
    {
      // 原来如此：编号属于仓库，Issue 与 PR 共用；Closes 与 Refs
      id: 'numbers', chap: null, lead: 0.6, tail: 0.6,
      cues: [
        ['c1', '你的 PR 编号是 #13。为什么不是 #1？', { gap: 0.4 }],
        ['c2', '仓库里还有 *Issue*，用来记下要解决的问题。', { gap: 0.3 }],
        ['c3', 'Issue 和 PR 共用一套编号：#12 报的正是这个问题。', { gap: 0.4 }],
        ['c4', '编号属于仓库，按先后排，用过就不回收。', { gap: 0.6 }],
        ['c5', 'PR 里写 Closes #12，合并时，#12 自动关闭；', { gap: 0.25 }],
        ['c6', '只写 #12，只是提一下，不会关。', { gap: 0.3 }],
      ],
    },
    {
      // 边界或比较：有写权限就不必 Fork；换个平台叫法会变（GitLab 的 Merge Request），做的事一样 → 收回 Git 与 GitHub 的分界
      id: 'boundary', chap: null, lead: 0.6, tail: 0.6,
      cues: [
        ['d1', '本来就有写权限的人，不用 Fork：', { gap: 0.25 }],
        ['d2', '直接在原仓库开分支、提 PR。', { gap: 0.6 }],
        ['d3', '换个平台，叫法也变：GitLab 管它叫 Merge Request。', { gap: 0.3 }],
        ['d4', '做的事一样：请原仓库把改动合进去。', { gap: 0.5 }],
        ['d5', '底下记录修改的，始终是 Git。', { gap: 0.3 }],
      ],
    },
    {
      // 一句结论：先回到开头那一行（改好了），再说三步各解决一个问题；决定权在维护者
      id: 'close', chap: null, lead: 0.6, tail: 0.5,
      cues: [
        ['e1', '回到开头：那一行改成“大于等于”，18 岁就能报名了。', { gap: 0.5 }],
        ['e2', '没有权限，就 Fork；要隔开主线，就开分支；', { gap: 0.25 }],
        ['e3', '要人审，就提 PR。', { gap: 0.7 }],
        ['e4', '开源项目，谁都能提改动；收不收，维护者说了算。', { gap: 0.3 }],
      ],
    },
    {
      // 片尾名单：策划、参与模型与分工、开源视频的仓库地址。4 秒，不配旁白（策划者 2026-11-17：「字幕表3-5s即可」，空出的时间给旁白）
      id: 'outro', at: 146, chap: null, lead: 0.4, tail: 0,
      cues: [
        ['z1', null, { pause: 3.3, credits: true }],   // 名单取自 project.json 的 credits；lead 0.4 + 3.3 + 缺省 gap 0.3 = 4 秒
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/#(\d+)/g, '$1号'],                 // #13 → 13号（十三号）
      [/fix-age/g, 'fix age'],
      [/\bPR\b/g, 'P R'],                // 逐字母读，不读成 pull
      [/GitLab/g, 'Git Lab'],
      [/哪一行/g, '哪一航'], [/那一行/g, '那一航'], [/逐行/g, '逐航'],   // 行 读 háng
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
