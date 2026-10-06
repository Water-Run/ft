// 旁白脚本：每个 cue = [句号, 字幕, {tts, gap, pause}]
// - 多语言时字幕写成 { zh: '…', en: '…' }；只有一种语言时直接写字符串。tts、gap、章节标题同理
// - 字幕里 *词* 表示强调；tts 缺省时由字幕按 SAY 表换成读法（字幕写正式拼写，读法只放在 SAY 表或 tts 字段）
// - gap：该句结束到下一句开始的停顿（秒，缺省 0.3）；pause：无旁白的纯画面停顿（标题、转场）
// - 每章一个 scene：chap [编号, 标题]（null 表示没有章节卡）、lead 章节卡时长、tail 章末留白
// 语言：浏览器取 ?lang=，Node 取环境变量 VLANG；缺省为 zh。浏览器与 Node 共用本文件（工具读它排时间线）。
// 翻译以中文为底本：先定中文，再译其他语言；各语言的句号一一对应，时间轴各自排布。
// 章节标题里的 | 把「眉题」与标题分开（config.js 的章节卡按它排版）。
// 事实依据：research/FACTS.md（按句号逐条列出）。数据截至 2026-10-06。
(function (root) {
  const isBrowser = typeof window !== 'undefined';
  const LANG = (isBrowser ? new URLSearchParams(location.search).get('lang') : process.env.VLANG) || 'zh';
  const pick = (v) => (v && typeof v === 'object' && !Array.isArray(v) && ('zh' in v || LANG in v) ? v[LANG] : v);
  const tr = (zh, en) => (LANG === 'zh' ? zh : en);            // 画面里的文字：tr('中文', 'English')

  const RAW = [
    // ───────────────────────── 开场 ─────────────────────────
    {
      id: 'open', chap: null, lead: 0.8, tail: 0.4,
      cues: [
        ['o1', { zh: '在飞书里发一句话，另一台电脑就开始工作', en: 'Send one message in Feishu, and another computer goes to work.' }, { gap: 0.45 }],
        ['o2', { zh: '读文件，跑命令，再把结果回复到对话里', en: 'It reads files, runs commands, and replies in the same chat.' }, { gap: 0.7 }],
        ['o3', { zh: '两个开源项目的 GitHub 星标，合计超过六十四万', en: 'Two open-source projects have over 640,000 GitHub stars between them.' }, { gap: 0.5 }],
        ['o4', { zh: '它们是 OpenClaw，和 Hermes Agent', en: 'They are OpenClaw, and Hermes Agent.' }, { gap: 0.6 }],
        ['o5', { zh: '这部片子先讲来历，再看实现，并以接入飞书为例', en: 'First where they came from, then how they work, with Feishu as the example.' }, { gap: 0.5 }],
        ['oT', null, { pause: 3.2 }],
      ],
    },
    // ───────────────────────── 01 总览 ─────────────────────────
    {
      id: 'map', chap: ['01', { zh: '总览', en: 'Overview' }], lead: 2.3, tail: 0.6,
      cues: [
        ['m1', { zh: '两者都是自托管的*智能体*，长期运行在自己的机器上', en: 'Both are self-hosted *agents* that run for long periods on the owner’s own machine.' }, { gap: 0.5 }],
        ['m2', { zh: '聊天软件里的消息，是它们接收任务的入口', en: 'Messages from chat apps are how they receive tasks.' }, { gap: 0.4 }],
        ['m3', { zh: '收到任务后，由模型决定下一步，必要时调用工具', en: 'The model decides each next step and calls tools when needed.' }, { gap: 0.35 }],
        ['m4', { zh: '工具可以读写文件、执行命令', en: 'Tools can read and write files and run commands.' }, { gap: 0.35 }],
        ['m5', { zh: '结果再回到同一个聊天里', en: 'The result returns to the same chat.' }, { gap: 0.8 }],
        ['m6', { zh: '这条链路可以拆成五站：*接入*、路由、循环、工具、记忆', en: 'The path splits into five stations: intake, routing, loop, tools and memory.' }, { gap: 0.5 }],
        ['m7', { zh: '后面的对比，都沿这五站展开', en: 'Every comparison that follows walks through these five stations.' }, { gap: 0.9 }],
        ['m8', { zh: 'OpenClaw 用 TypeScript 写成，MIT 许可', en: 'OpenClaw is written in TypeScript under the MIT license.' }, { gap: 0.4 }],
        ['m9', { zh: 'Hermes Agent 用 Python 写成，同为 MIT 许可', en: 'Hermes Agent is written in Python, also under the MIT license.' }, { gap: 0.4 }],
        ['m10', { zh: '二者的文档都称支持二十多个聊天平台', en: 'Both sets of docs list more than twenty chat platforms.' }, { gap: 0.5 }],
      ],
    },
    // ───────────────────────── 02 OpenClaw ─────────────────────────
    {
      id: 'claw', chap: ['02', { zh: 'OpenClaw', en: 'OpenClaw' }], lead: 2.3, tail: 0.6,
      cues: [
        ['c1', { zh: 'OpenClaw 的仓库，创建于 2025 年 11 月 24 日', en: 'The OpenClaw repository was created on November 24, 2025.' }, { gap: 0.45 }],
        ['c2', { zh: '那时它叫 warelay，是 WhatsApp 的收发与自动回复工具', en: 'It was called warelay, a tool to send, receive and auto-reply on WhatsApp.' }, { gap: 0.6 }],
        ['c3', { zh: '12 月更名 CLAWDIS，成为 WhatsApp 与 Telegram 的网关', en: 'In December it became CLAWDIS, a gateway for WhatsApp and Telegram.' }, { gap: 0.4 }],
        ['c4', { zh: '消息交给本机的编码代理 Pi 处理', en: 'Messages were handed to Pi, a coding agent running locally.' }, { gap: 0.4 }],
        ['c5', { zh: '网关监听 18789 端口、单聊并入主会话，沿用至今', en: 'Port 18789 and one main session for direct chats are still used today.' }, { gap: 0.8 }],
        ['c6', { zh: '2026 年 1 月更名 Clawdbot，定位变成个人 AI 助手', en: 'In January 2026 it became Clawdbot, positioned as a personal AI assistant.' }, { gap: 0.5 }],
        ['c7', { zh: '1 月 27 日改名 Moltbot，1 月 30 日定名 OpenClaw', en: 'It was renamed Moltbot on January 27, and OpenClaw on January 30.' }, { gap: 0.4 }],
        ['c8', { zh: '项目文档称，起因是 Anthropic 提出的商标请求', en: 'The project’s docs say the trigger was a trademark request from Anthropic.' }, { gap: 0.9 }],
        ['c8a', { zh: '1 月 31 日起，仓库陆续公开安全公告', en: 'From January 31, the repository began publishing security advisories.' }, { gap: 0.4 }],
        ['c8b', { zh: '其中一个评分 8.8 的漏洞，已在 2026.1.29 修复', en: 'One flaw, scored 8.8, was fixed in 2026.1.29.' }, { gap: 0.9 }],
        ['c9', { zh: '此后它从一个网关，扩展成*插件*平台', en: 'From there it grew from a gateway into a *plugin* platform.' }, { gap: 0.4 }],
        ['c10', { zh: '通道、模型提供方、记忆，都以扩展包形式提供', en: 'Channels, model providers and memory all ship as extension packages.' }, { gap: 0.4 }],
        ['c11', { zh: '仓库里现有一百六十多个扩展包', en: 'The repository now holds more than 160 of them.' }, { gap: 0.8 }],
        ['c12', { zh: '2 月 15 日，作者 Peter Steinberger 宣布加入 OpenAI', en: 'On February 15, its author Peter Steinberger announced he was joining OpenAI.' }, { gap: 0.4 }],
        ['c13', { zh: '项目改由 OpenClaw 基金会托管，OpenAI 是捐助方之一', en: 'The project moved to the OpenClaw Foundation, and OpenAI is one of its donors.' }, { gap: 0.8 }],
        ['c14', { zh: '8 月底的 2026.8.1，官方称之为 OpenClaw 2.0', en: 'Version 2026.8.1, in late August, was billed as OpenClaw 2.0.' }, { gap: 0.4 }],
        ['c15', { zh: '会话与转录从文件迁入 SQLite，网页控制台重做', en: 'Sessions moved from files into SQLite, and the web console was rebuilt.' }, { gap: 0.6 }],
        ['c16', { zh: '十个月里，GitHub 上有 253 个发布，125 个是正式版', en: 'In ten months GitHub shows 253 releases, 125 of them stable.' }, { gap: 0.4 }],
        ['c17', { zh: '现在同时维护稳定、延长稳定、测试、开发四个通道', en: 'Four update channels are maintained: stable, extended-stable, beta and dev.' }, { gap: 0.9 }],
        ['c18', { zh: '设计上，网关居中，是会话、工具和通道的控制面', en: 'The gateway sits at the center, as the control plane for sessions, tools and channels.' }, { gap: 0.45 }],
        ['c19', { zh: '官方的概括：受信的网关，不受信的执行，确定性的策略', en: 'The project’s summary: trusted gateway, untrusted execution, deterministic policy.' }, { gap: 0.5 }],
        ['c20', { zh: '不过沙箱默认关闭，命令默认在网关所在的主机上运行', en: 'But the sandbox is off by default, so commands run on the gateway host.' }, { gap: 0.6 }],
        ['c21', { zh: '记忆是工作区里的 Markdown 文件，没有隐藏状态', en: 'Memory is plain Markdown files in a workspace, with no hidden state.' }, { gap: 0.5 }],
      ],
    },
    // ───────────────────────── 03 Hermes ─────────────────────────
    {
      id: 'hermes', chap: ['03', { zh: 'Hermes Agent', en: 'Hermes Agent' }], lead: 2.3, tail: 0.6,
      cues: [
        ['h1', { zh: 'Hermes 先是 Nous Research 的一个模型系列', en: 'Hermes began as a model family from Nous Research.' }, { gap: 0.4 }],
        ['h2', { zh: '第一个 Nous-Hermes 模型，出现在 2023 年 6 月', en: 'The first Nous-Hermes model appeared in June 2023.' }, { gap: 0.4 }],
        ['h3', { zh: '2024 年 8 月的 Hermes 3，被论文称为工具使用模型', en: 'Hermes 3, in August 2024, was described in its paper as a tool-use model.' }, { gap: 0.8 }],
        ['h4', { zh: '代理仓库 hermes-agent，创建于 2025 年 7 月', en: 'The agent repository, hermes-agent, was created in July 2025.' }, { gap: 0.4 }],
        ['h5', { zh: 'v0.2.0 的发布说明称，它最初是内部的小项目', en: 'The v0.2.0 release notes call it a small internal project at first.' }, { gap: 0.5 }],
        ['h6', { zh: '2026 年 2 月 25 日，Nous 发布 Hermes Agent', en: 'On February 25, 2026, Nous released Hermes Agent.' }, { gap: 0.4 }],
        ['h7', { zh: '3 月 12 日的 v0.2.0，两周多合并了 216 个拉取请求', en: 'v0.2.0, March 12: 216 merged pull requests in just over two weeks.' }, { gap: 0.4 }],
        ['h8', { zh: '到 9 月 24 日的 v0.21.5，共发布了三十六个版本', en: 'By v0.21.5 on September 24, it had shipped 36 releases.' }, { gap: 0.9 }],
        ['h9', { zh: '设计上，同一个核心服务命令行、消息网关和桌面应用', en: 'By design one core serves the command line, the messaging gateway and the desktop app.' }, { gap: 0.5 }],
        ['h10', { zh: '它自述有内置的*学习闭环*：记忆、技能与会话检索', en: 'It describes a built-in *learning loop*: memory, skills and session search.' }, { gap: 0.4 }],
        ['h11', { zh: '源码里，有后台副本回看对话，决定是否存下记忆或技能', en: 'In the code, a background copy reviews the chat and decides what to save.' }, { gap: 0.6 }],
        ['h12', { zh: '另一条原则：保护提示词缓存，会话中不改系统提示', en: 'Another stated rule: protect the prompt cache, keeping the system prompt fixed.' }, { gap: 0.5 }],
        ['h13', { zh: '命令的执行位置有七种后端，默认是本机', en: 'Commands can run on seven backends, and the default is the local machine.' }, { gap: 0.9 }],
        ['h14', { zh: 'Hermes 用 hermes claw migrate，导入 OpenClaw 配置', en: 'Hermes provides hermes claw migrate to import an OpenClaw setup.' }, { gap: 0.4 }],
        ['h15', { zh: 'OpenClaw 也提供 openclaw migrate hermes，反向导入', en: 'OpenClaw offers openclaw migrate hermes for the reverse.' }, { gap: 0.5 }],
      ],
    },
    // ───────────────────────── 04 实现：接入飞书 ─────────────────────────
    {
      id: 'feishu', chap: ['04', { zh: '实现|接入飞书', en: 'Implementation|Connecting Feishu' }], lead: 2.3, tail: 0.6,
      cues: [
        ['f1', { zh: '接入飞书，先在开放平台创建企业自建应用', en: 'To connect Feishu, first create an enterprise self-built app on the Open Platform.' }, { gap: 0.4 }],
        ['f2', { zh: '启用机器人能力，授予收发消息的权限', en: 'Enable the bot capability and grant message permissions.' }, { gap: 0.4 }],
        ['f3', { zh: '事件订阅选择*长连接*，订阅 im.message.receive_v1', en: 'Choose *long connection* for events and subscribe to im.message.receive_v1.' }, { gap: 0.4, tts: { zh: '事件订阅选择长连接，订阅消息接收事件。', en: 'Choose long connection for events and subscribe to the message-receive event.' } }],
        ['f4', { zh: '长连接由程序主动发起，不需要公网地址', en: 'The program opens the connection itself, so no public address is needed.' }, { gap: 0.35 }],
        ['f5', { zh: '事件要在三秒内处理完，否则飞书会重新推送', en: 'An event must be handled within three seconds, or Feishu pushes it again.' }, { gap: 0.35 }],
        ['f6', { zh: '同一应用有多个连接时，只有一个会收到事件', en: 'With several connections on one app, only one receives each event.' }, { gap: 0.35 }],
        ['f7', { zh: '所以一个应用，只应交给一个网关实例', en: 'So one app should be given to one gateway instance only.' }, { gap: 0.9 }],
        ['f8', { zh: 'OpenClaw 运行 channels login，指定 feishu', en: 'OpenClaw runs channels login for feishu.' }, { gap: 0.4, tts: { zh: 'Open Claw 运行 channels login 命令，指定飞书。', en: 'Open Claw runs the channels login command for Feishu.' } }],
        ['f9', { zh: '向导会装上飞书插件，再询问凭据或扫码', en: 'The wizard installs the Feishu plugin, then asks for credentials or a QR scan.' }, { gap: 0.4 }],
        ['f10', { zh: '私聊默认要配对码，群聊默认只响应白名单里的群', en: 'Direct messages default to pairing codes, and groups default to an allowlist.' }, { gap: 0.9 }],
        ['f11', { zh: 'Hermes 运行 gateway setup，选择 Feishu 或 Lark', en: 'Hermes runs gateway setup and selects Feishu or Lark.' }, { gap: 0.4, tts: { zh: 'Hermes 运行 gateway setup 命令，选择飞书，或者 Lark。', en: 'Hermes runs the gateway setup command and selects Fay shoo or Lark.' } }],
        ['f12', { zh: '扫码后自动创建应用，也可以手动填写凭据', en: 'A QR scan creates the app automatically, or credentials can be entered by hand.' }, { gap: 0.4 }],
        ['f13', { zh: '长连接是默认模式，群聊里要 @ 机器人才响应', en: 'Long connection is the default, and in groups the bot answers only when mentioned.' }, { gap: 0.9 }],
        ['f14', { zh: '两边都用飞书官方 SDK 的长连接客户端收事件', en: 'Both receive events through the official Feishu SDK’s long-connection client.' }, { gap: 0.9 }],
        ['f15', { zh: 'OpenClaw 的飞书插件，最初是社区作者 1 月 25 日发布的', en: 'OpenClaw’s Feishu plugin began with a community author’s release on January 25.' }, { gap: 0.4 }],
        ['f16', { zh: '2 月 4 日，官方组织里出现了 @openclaw/feishu', en: 'On February 4, @openclaw/feishu appeared under the official organization.' }, { gap: 0.4 }],
        ['f17', { zh: '3 月 3 日，飞书团队也发布了自己的 OpenClaw 插件', en: 'On March 3, the Feishu team published its own OpenClaw plugin.' }, { gap: 0.5 }],
      ],
    },
    // ───────────────────────── 05 实现：一条消息 ─────────────────────────
    {
      id: 'journey', chap: ['05', { zh: '实现|一条消息', en: 'Implementation|One message' }], lead: 2.3, tail: 0.6,
      cues: [
        ['j1', { zh: '一条飞书消息发出后，先到达*入口*', en: 'A Feishu message first reaches the *intake* station.' }, { gap: 0.4 }],
        ['j2', { zh: '适配器把飞书的事件，整理成内部统一的消息对象', en: 'The adapter turns the Feishu event into one internal message object.' }, { gap: 0.6 }],
        ['j3', { zh: '然后*去重*：同一条消息，只处理一次', en: 'Then *deduplication*: each message is handled once.' }, { gap: 0.4 }],
        ['j4', { zh: '再做*准入*：谁能私聊，哪些群可用，要不要 @', en: 'Then *admission*: who may chat, which groups are allowed, whether a mention is required.' }, { gap: 0.5 }],
        ['j5', { zh: '通过后算出会话键，同一会话的消息排队串行', en: 'A session key is derived, and messages in one session run in order.' }, { gap: 0.4 }],
        ['j6', { zh: '两边的会话键都以 agent: 开头，后接通道与对象', en: 'Both session keys start with agent: followed by the channel and the peer.' }, { gap: 0.9 }],
        ['j7', { zh: '接着是*循环*：组装系统提示词，调用模型', en: 'Next is the *loop*: assemble the system prompt and call the model.' }, { gap: 0.4 }],
        ['j8', { zh: 'OpenClaw 用基础提示、技能和工作区文件拼成', en: 'OpenClaw builds it from a base prompt, skills and workspace files.' }, { gap: 0.35 }],
        ['j9', { zh: 'Hermes 分三层组装，记忆在会话开始时冻结', en: 'Hermes builds it in three tiers and freezes memory at the start of a session.' }, { gap: 0.6 }],
        ['j10', { zh: '模型请求工具时，程序执行并回传结果，直到模型给出回复', en: 'The program runs each tool the model asks for, feeding results back until it replies.' }, { gap: 0.5 }],
        ['j11', { zh: '接入飞书后，两边都多了读写飞书文档的*工具*', en: 'With Feishu connected, both gain *tools* for reading and writing Feishu documents.' }, { gap: 0.9 }],
        ['j12', { zh: '最终回复，经适配器发回飞书', en: 'The final reply goes back to Feishu through the adapter.' }, { gap: 0.4 }],
        ['j13', { zh: 'OpenClaw 可以用流式卡片，逐步更新同一条回复', en: 'OpenClaw can use a streaming card that updates one reply as it grows.' }, { gap: 0.35 }],
        ['j14', { zh: 'Hermes 把 Markdown 转成富文本，失败则退回纯文本', en: 'Hermes converts Markdown to rich text and falls back to plain text on failure.' }, { gap: 0.9 }],
        ['j15', { zh: '最后一站是*记忆*。OpenClaw 用工作区里的 Markdown 文件', en: 'The last station is *memory*. OpenClaw keeps Markdown files in a workspace.' }, { gap: 0.4 }],
        ['j16', { zh: '有 MEMORY.md、每日笔记，和 SOUL.md 这样的人设文件', en: 'There is MEMORY.md, daily notes, and persona files such as SOUL.md.' }, { gap: 0.5 }],
        ['j17', { zh: 'Hermes 用两份有字数上限的文件，另有全文检索', en: 'Hermes keeps two size-limited files, plus full-text search over past sessions.' }, { gap: 0.5 }],
        ['j18', { zh: '两边的记忆，都保存在本机的文件或数据库里', en: 'In both, memory is stored in files or databases on the local machine.' }, { gap: 0.5 }],
      ],
    },
    // ───────────────────────── 06 对比 ─────────────────────────
    {
      id: 'compare', chap: ['06', { zh: '对比', en: 'Comparison' }], lead: 2.3, tail: 0.6,
      cues: [
        ['k1', { zh: '并排放在一起，差别主要在*重心*', en: 'Side by side, the difference lies mainly in *emphasis*.' }, { gap: 0.5 }],
        ['k2', { zh: 'OpenClaw 的重心，是网关与插件平台', en: 'OpenClaw centers on the gateway and the plugin platform.' }, { gap: 0.4 }],
        ['k3', { zh: 'Hermes 的重心，是单一核心与学习闭环', en: 'Hermes centers on a single core and its learning loop.' }, { gap: 0.5 }],
        ['k4', { zh: '治理上，一个由基金会托管，一个由 Nous Research 主导', en: 'In governance, one sits under a foundation and the other is led by Nous Research.' }, { gap: 0.6 }],
        ['k5', { zh: '共同点：命令默认在本机执行，权限取决于配置', en: 'In common: commands run locally by default; permissions depend on configuration.' }, { gap: 0.8 }],
        ['k6', { zh: '二者变化都很快，具体行为以对应版本的文档和源码为准', en: 'Both change fast; behavior is defined by the matching version’s docs and source.' }, { gap: 0.5 }],
        ['k7', { zh: '本片的数据，截至 2026 年 10 月 6 日', en: 'The data in this film is as of October 6, 2026.' }, { gap: 0.5 }],
      ],
    },
    // ───────────────────────── 片尾 ─────────────────────────
    {
      id: 'outro', chap: null, lead: 0.8, tail: 0.5,
      cues: [
        ['x1', { zh: '本片的取证记录、脚本与源码，都已开源', en: 'The research notes, script and source of this film are open source.' }, { gap: 0.4 }],
        ['x2', { zh: '仓库：github.com/Water-Run/ft', en: 'Repository: github.com/Water-Run/ft' }, { gap: 0.5, tts: { zh: '仓库在 GitHub 上，Water Run 名下的 f t', en: 'The repository is on GitHub, under Water Run, named f t.' } }],
        ['xT', null, { pause: 7.5 }],
      ],
    },
  ];

  // 字幕 → 送去合成的读法。长词写在前面，避免被短词的规则截断。先用 kit/tools/tts_probe.js 试，再用 asr.js 回听。
  const SAY = {
    zh: [
      [/Hermes Agent/g, 'Hermes Agent'],
      [/OpenClaw/g, 'Open Claw'],
      [/warelay/g, 'ware relay'],
      [/CLAWDIS/g, 'Claw dis'],
      [/Clawdbot/g, 'Claud bot'],
      [/Moltbot/g, 'Molt bot'],
      [/SQLite/g, 'S Q Lite'],
      [/MIT/g, 'M I T'],
      [/OpenAI/g, 'Open A I'],
      [/18789/g, '一八七八九'],
      [/im\.message\.receive_v1/g, 'i m message receive v 1'],
      [/v0\.21\.5/g, 'v 零点二十一点五'],
      [/v0\.2\.0/g, 'v 零点二点零'],
      [/2026\.8\.1/g, '二零二六点八点一'],
      [/2026\.1\.29/g, '二零二六点一点二十九'],
      [/8\.8/g, '八点八'],
      [/@openclaw\/feishu/g, 'open claw 的飞书插件包'],
      [/agent:/g, 'agent 冒号'],
      [/MEMORY\.md/g, 'MEMORY 点 md'],
      [/SOUL\.md/g, 'SOUL 点 md'],
      [/hermes claw migrate/g, 'hermes claw migrate'],
      [/openclaw migrate hermes/g, 'open claw migrate hermes'],
      [/channels login/g, 'channels login'],
      [/gateway setup/g, 'gateway setup'],
      [/Nous-Hermes/g, 'Nous Hermes'],
    ],
    en: [
      [/OpenClaw/g, 'Open Claw'],
      [/warelay/g, 'ware relay'],
      [/CLAWDIS/g, 'Claw dis'],
      [/Clawdbot/g, 'Claud bot'],
      [/Moltbot/g, 'Molt bot'],
      [/SQLite/g, 'S Q Lite'],
      [/\bMIT\b/g, 'M I T'],
      [/Nous/g, 'Noose'],
      [/Feishu/g, 'Fay shoo'],
      [/18789/g, 'one eight seven eight nine'],
      [/im\.message\.receive_v1/g, 'I M message receive V 1'],
      [/v0\.21\.5/g, 'version 0.21.5'],
      [/v0\.2\.0/g, 'version 0.2.0'],
      [/2026\.8\.1/g, 'twenty twenty-six point eight point one'],
      [/2026\.1\.29/g, 'twenty twenty-six point one point twenty-nine'],
      [/@openclaw\/feishu/g, 'the Open Claw Fay shoo package'],
      [/agent:/g, 'agent colon'],
      [/MEMORY\.md/g, 'MEMORY dot M D'],
      [/SOUL\.md/g, 'SOUL dot M D'],
      [/github\.com\/Water-Run\/ft/g, 'github dot com slash Water Run slash f t'],
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
