// 本片的部件：图标、标志、DSHU 应用窗口、设置页与对话框、模式换色、注解与高亮、3D 动作。
// 界面照 DSHU 的截图重画（research/_src/dshu/docs/assets/dshu/*.webp，见 research/MATERIALS.md），不贴截图；
// 窗口约为截图的 1.4 倍，窗口里的文字一律不小于 22px（project.json 的 check.min_font）。所有动作仍只由 t 决定。

const MC = { def: '#2563EB', sec: '#DC2626', rev: '#15803D', wri: '#A16207' };
const MODE = {
  def: { zh: '缺省', en: 'Default', d: '日常使用和通用开发', ic: 'hash', li: ['读写与检索工作区', '执行命令与测试', '任务清单与委派'] },
  sec: { zh: '网安', en: 'Security', d: '安全审计和渗透测试', ic: 'shield', li: ['七类现场手册', '案件记录与报告', '独立代理'] },
  rev: { zh: '逆向', en: 'Reverse', d: '逆向你要逆向的程序', ic: 'code', li: ['八类分析手册', '内置 REA 6.9.0', '样本清点'] },
  wri: { zh: '写作', en: 'Writing', d: '写你想写的东西', ic: 'pen', li: ['七类写作手册', '六轴文风卡', '设定集'] },
};
const MODES = ['def', 'sec', 'rev', 'wri'];
// UNCENSORED 标签用的「标记色」（ui-theme mode-accent.css）：写作是亮黄配深色字，其余三种就是模式色配白字
const MK = { def: MC.def, sec: MC.sec, rev: MC.rev, wri: '#f2b200' }, MKI = { def: '#ffffff', sec: '#ffffff', rev: '#ffffff', wri: '#101318' };
const ICONS = {
  hash: '<path d="M5 9h14M5 15h14M10 3 8 21M16 3l-2 18"/>',
  shield: '<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z"/>',
  code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  pen: '<path d="M5 4h10l4 4v12H5z"/><path d="M9 12h6M9 16h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M17 14v6M14 17h6"/>',
  folder: '<path d="M3 6h6l2 2h10v11H3z"/>',
  plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
  plain: '<path d="M12 5v14M5 12h14"/>',
  think: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  inject: '<path d="M6 4h12v16H6z"/><path d="M12 8v6M9 11l3 3 3-3"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4-4"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  newfolder: '<path d="M3 6h6l2 2h10v11H3z"/><path d="M15 11v5M12.5 13.5h5"/>',
  doc: '<path d="M6 3h9l3 3v15H6z"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  run: '<path d="M7 5l12 7-12 7z"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  side: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  term: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M12 15h5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  db: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
  gauge: '<path d="M4 15a8 8 0 1 1 16 0"/><path d="m12 15 4-4"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12h2"/>',
  limit: '<path d="M4 20h16M7 16V9M12 16V5M17 16v-4"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
  panelR: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
  split: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/>',
  full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  dots: '<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5H4v11h4"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  stop: '<rect x="7" y="7" width="10" height="10" rx="1.5"/>',
  send: '<path d="M4 12 20 4l-6 16-3-7z"/>',
  warn: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>',
  trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
  pin: '<path d="M12 17v5M8 3h8l-1 6 3 4H6l3-4z"/>',
  tasks: '<path d="M4 6h2M4 12h2M4 18h2M9 6h11M9 12h11M9 18h11"/>',
  github: '<path d="M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  memory: '<path d="M12 3a6 6 0 0 0-6 6c0 2 1 3.5 2.5 4.5V17h7v-3.5C17 12.5 18 11 18 9a6 6 0 0 0-6-6zM9.5 20h5"/>',
  box: '<path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
  windows: '<path d="M3 5.5 10.5 4.5v7H3zM12 4.3 21 3v8.5h-9zM3 12.5h7.5v7L3 18.5zM12 12.5h9V21l-9-1.3z"/>',
  linux: '<path d="M12 3c-2 0-3 1.8-3 4 0 1.5-1.5 3-2.5 5S5 16.5 6 18s4 2 6 2 5-.5 6-2-.5-4-1.5-6S15 8.5 15 7c0-2.2-1-4-3-4z"/><circle cx="10.5" cy="7.5" r=".6"/><circle cx="13.5" cy="7.5" r=".6"/>',
  apple: '<path d="M16.5 13c0-2.6 2.1-3.4 2.2-3.5-1.2-1.8-3.1-2-3.7-2-1.6-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.5 1.3 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.5.9-1.4 1.3-2.8 1.3-2.8s-2.3-.9-2.3-3.5zM14 5.5c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/>',
};
// 别家产品的标志，只用在类比注解里指明是谁（出处见 research/MATERIALS.md）：Claude Code 用 Claude 星芒（品牌色 #D97757），Codex 用其 VS Code 扩展自带的 OpenAI blossom
const LOGO = {
  claude: (s = 34) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="flex:none"><path fill="#D97757" d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg>`,
  codex: (s = 34) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="flex:none"><path fill="#fff" d="M13.798 23.976a5.7 5.7 0 0 1-2.26-.456 6.1 6.1 0 0 1-1.903-1.27 5.7 5.7 0 0 1-1.88.311 5.75 5.75 0 0 1-2.95-.79 6.2 6.2 0 0 1-2.188-2.159q-.81-1.366-.809-3.045 0-.695.19-1.51a6.4 6.4 0 0 1-1.475-2.038A5.95 5.95 0 0 1 0 10.573Q0 9.278.547 8.08q.547-1.2 1.523-2.062a5.5 5.5 0 0 1 2.307-1.223A5.7 5.7 0 0 1 5.472 2.35 6.1 6.1 0 0 1 7.565.623 5.8 5.8 0 0 1 10.206 0q1.19 0 2.26.456a6.1 6.1 0 0 1 1.903 1.27 5.7 5.7 0 0 1 1.88-.311q1.594 0 2.95.79a6 6 0 0 1 2.165 2.159q.832 1.366.832 3.045 0 .695-.19 1.51a6.3 6.3 0 0 1 1.475 2.062q.523 1.15.523 2.422a5.9 5.9 0 0 1-.547 2.493q-.547 1.2-1.546 2.086a5.4 5.4 0 0 1-2.284 1.199 5.56 5.56 0 0 1-1.118 2.445 5.9 5.9 0 0 1-2.07 1.727 5.8 5.8 0 0 1-2.64.623m-5.876-2.997q1.19 0 2.07-.504l4.472-2.589a.53.53 0 0 0 .238-.455v-2.062L8.945 18.7a.96.96 0 0 1-1.047 0l-4.496-2.613a.7.7 0 0 1-.024.168v.287q0 1.224.571 2.254a4.24 4.24 0 0 0 1.642 1.583q1.047.6 2.331.599m.238-3.908a.6.6 0 0 0 .262.072q.118 0 .238-.072l1.784-1.031-5.734-3.357q-.522-.312-.523-.935V6.545a4.3 4.3 0 0 0-1.903 1.63 4.25 4.25 0 0 0-.714 2.398q0 1.176.595 2.254.594 1.08 1.546 1.63zm5.638 5.323q1.26 0 2.284-.576a4.3 4.3 0 0 0 1.618-1.582q.595-1.008.595-2.254v-5.179a.47.47 0 0 0-.238-.431l-1.808-1.055v6.689q0 .624-.524.935l-4.496 2.613a4.3 4.3 0 0 0 2.57.84m.904-8.776v-3.26l-2.688-1.535-2.712 1.535v3.26l2.712 1.535zM7.756 5.97q0-.623.523-.935l4.496-2.613a4.3 4.3 0 0 0-2.569-.84q-1.26 0-2.284.576A4.3 4.3 0 0 0 6.304 3.74q-.57 1.008-.57 2.254v5.155q0 .287.237.455l1.785 1.055zM19.84 17.43a4.16 4.16 0 0 0 1.88-1.63 4.33 4.33 0 0 0 .713-2.397q0-1.176-.595-2.254-.594-1.08-1.546-1.63l-4.449-2.59q-.143-.096-.261-.072a.46.46 0 0 0-.238.072L13.56 7.936l5.758 3.38a.9.9 0 0 1 .38.384q.143.216.143.528zM15.059 5.25q.524-.335 1.047 0l4.52 2.662V7.48q0-1.15-.57-2.181A4.14 4.14 0 0 0 18.46 3.62q-1.023-.623-2.379-.623-1.19 0-2.07.503L9.54 6.09a.53.53 0 0 0-.238.455v2.062z"/></svg>`,
  // GitHub 标志（simple-icons 的 github.svg，出处见 MATERIALS）
  github: (s = 52, c = '#1f2329') => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" style="flex:none;display:block"><path fill="${c}" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
  // 平台标志：Tux 与 Apple 取自 simple-icons；Windows 11 的标志是四个等大的方块，按形状画。颜色跟着卡片的 --c 变
  linux: (s = 110) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path fill="currentColor" d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.043c-.06-.003-.12 0-.18 0h-.016c.151-.467-.182-.825-1.065-1.224-.915-.4-1.646-.336-1.77.465-.008.043-.013.066-.018.135-.068.023-.139.053-.209.064-.43.268-.662.669-.793 1.187-.13.533-.17 1.156-.205 1.869v.003c-.02.334-.17.838-.319 1.35-1.5 1.072-3.58 1.538-5.348.334a2.645 2.645 0 00-.402-.533 1.45 1.45 0 00-.275-.333c.182 0 .338-.03.465-.067a.615.615 0 00.314-.334c.108-.267 0-.697-.345-1.163-.345-.467-.931-.995-1.788-1.521-.63-.4-.986-.87-1.15-1.396-.165-.534-.143-1.085-.015-1.645.245-1.07.873-2.11 1.274-2.763.107-.065.037.135-.408.974-.396.751-1.14 2.497-.122 3.854a8.123 8.123 0 01.647-2.876c.564-1.278 1.743-3.504 1.836-5.268.048.036.217.135.289.202.218.133.38.333.59.465.21.201.477.335.876.335.039.003.075.006.11.006.412 0 .73-.134.997-.268.29-.134.52-.334.74-.4h.005c.467-.135.835-.402 1.044-.7zm2.185 8.958c.037.6.343 1.245.882 1.377.588.134 1.434-.333 1.791-.765l.211-.01c.315-.007.577.01.847.268l.003.003c.208.199.305.53.391.876.085.4.154.78.409 1.066.486.527.645.906.636 1.14l.003-.007v.018l-.003-.012c-.015.262-.185.396-.498.595-.63.401-1.746.712-2.457 1.57-.618.737-1.37 1.14-2.036 1.191-.664.053-1.237-.2-1.574-.898l-.005-.003c-.21-.4-.12-1.025.056-1.69.176-.668.428-1.344.463-1.897.037-.714.076-1.335.195-1.814.12-.465.308-.797.641-.984l.045-.022zm-10.814.049h.01c.053 0 .105.005.157.014.376.055.706.333 1.023.752l.91 1.664.003.003c.243.533.754 1.064 1.189 1.637.434.598.77 1.131.729 1.57v.006c-.057.744-.48 1.148-1.125 1.294-.645.135-1.52.002-2.395-.464-.968-.536-2.118-.469-2.857-.602-.369-.066-.61-.2-.723-.4-.11-.2-.113-.602.123-1.23v-.004l.002-.003c.117-.334.03-.752-.027-1.118-.055-.401-.083-.71.043-.94.16-.334.396-.4.69-.533.294-.135.64-.202.915-.47h.002v-.002c.256-.268.445-.601.668-.838.19-.201.38-.336.663-.336zm7.159-9.074c-.435.201-.945.535-1.488.535-.542 0-.97-.267-1.28-.466-.154-.134-.28-.268-.373-.335-.164-.134-.144-.333-.074-.333.109.016.129.134.199.2.096.066.215.2.36.333.292.2.68.467 1.167.467.485 0 1.053-.267 1.398-.466.195-.135.445-.334.648-.467.156-.136.149-.267.279-.267.128.016.034.134-.147.332a8.097 8.097 0 01-.69.468zm-1.082-1.583V5.64c-.006-.02.013-.042.029-.05.074-.043.18-.027.26.004.063 0 .16.067.15.135-.006.049-.085.066-.135.066-.055 0-.092-.043-.141-.068-.052-.018-.146-.008-.163-.065zm-.551 0c-.02.058-.113.049-.166.066-.047.025-.086.068-.14.068-.05 0-.13-.02-.136-.068-.01-.066.088-.133.15-.133.08-.031.184-.047.259-.005.019.009.036.03.03.05v.02h.003z"/></svg>`,
  apple: (s = 110) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><path fill="currentColor" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>`,
  windows: (s = 110) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24"><g fill="currentColor"><rect x="1" y="1" width="10.5" height="10.5"/><rect x="12.5" y="1" width="10.5" height="10.5"/><rect x="1" y="12.5" width="10.5" height="10.5"/><rect x="12.5" y="12.5" width="10.5" height="10.5"/></g></svg>`,
};
const icon = (k, extra = '') => `<svg class="i" viewBox="0 0 24 24" ${extra}>${ICONS[k] || ''}</svg>`;

// ── 标志：DSHU 图标里的同一条鲸鱼路径（src/design/assets/whale.js）。原版：白底深鲸、方角；DSHU：黑底白鲸、圆角 ──
function logoSVG(size, parent) {
  const s = svg('svg', { width: size, height: size, viewBox: '0 0 1024 1024' }, parent); s.style.position = 'relative'; s.style.display = 'block';
  const tile = svg('rect', { x: 32, y: 32, width: 960, height: 960, rx: 224, fill: '#FBFBFB', stroke: '#e2e4e9', 'stroke-width': 2 }, s);   // 原版与 DSHU 都是圆角矩形（策划者 2026-11-23）
  const fish = svg('path', { transform: 'translate(157 261) scale(32.5)', d: window.WHALE_PATH, fill: '#1C2434' }, s);
  return { s, tile, fish };
}
// 标志下面垫一块与底板同形的板子承托阴影（大尺寸 SVG 直接加 drop-shadow 在渲染时会丢掉鲸鱼）
function shadowPlate(parent, size, t, shadow) {
  const k = size / 1024, p = h('div', 'abs', parent); px(p, 32 * k, 32 * k, 960 * k, 960 * k);
  css(p, { borderRadius: (224 * k) + 'px', boxShadow: shadow, background: t ? '#10131a' : '#FBFBFB' });
  return p;
}
function logoDark(size, parent) {   // 静态的 DSHU 标志
  const l = logoSVG(size, parent); l.tile.setAttribute('fill', '#10131a'); l.tile.setAttribute('rx', 224); l.tile.setAttribute('stroke', '#303644'); l.fish.setAttribute('fill', '#ffffff');
  return l;
}
// 侧栏与首页里的小鲸鱼：截图里是不带底板的单色鲸鱼
function whale(size, color = 'currentColor') {
  return `<svg width="${size}" height="${size * 0.8}" viewBox="0 0 24 19" style="display:block;flex:none"><path d="${window.WHALE_PATH}" fill="${color}"/></svg>`;
}

// ── 应用窗口 ──
// o: { mode, home, title, sessions: [[标题, 模式, 选中?, 运行中?]], ws, wsSessions 放在哪个工作区下, more: 其余工作区, cost, x, y, w, h }
const CD_FILM0 = 39 * 3600 + 24 * 60 + 59;   // 片头那一刻的倒计时
function makeApp(parent, o = {}) {
  const m = o.mode || 'def';
  const el = h('div', 'app', parent); el.style.setProperty('--mc', MC[m]); el.style.setProperty('--mk', MK[m]); el.style.setProperty('--mki', MKI[m]);
  if (o.x != null) px(el, o.x, o.y, o.w, o.h);
  const side = h('div', 'side', el);
  const brand = h('div', 'brand', side);
  const mark = h('div', 'mark', brand, whale(46, '#1f2329'));
  const bt = h('div', '', brand, '<div class="wm">deepseek</div>');
  const tags = h('div', 'tags', bt, '<span class="tag h">HARNESS</span>');
  const tagU = o.official ? null : h('span', 'tag u', tags, 'UNCENSORED');
  h('span', 'sideicon', brand, icon('panel'));
  h('div', 'newbtn', side, icon('plus') + ' 新会话');
  h('div', 'nav', side, icon('clock') + ' 自动化任务'); h('div', 'nav', side, icon('grid') + ' 更多');
  h('div', 'grp', side, `<span>工作区</span><span class="gi">${icon('search')}${icon('sliders')}${icon('newfolder')}</span>`);
  const wsEl = h('div', 'ws open', side, icon('folder') + ` <span>${o.ws || 'acme-shop'}</span>`);
  const sess = (o.sessions || [[o.title || '新会话', m, true]]).map(([t, mm, on, run]) => {
    // 空白新会话没有模式：灰色半高的色条、不显示「刚刚」（hero 截图；Rows.tsx）
    const e = h('div', 'sess' + (on ? ' on' : '') + (mm ? '' : ' blank'), side, `${run ? stateDot() : ''}<span class="st">${t}</span><small>${mm ? '刚刚' : ''}</small>`);
    e.style.setProperty('--c', mm ? MC[mm] : 'rgb(129,133,140)'); return e;
  });
  for (const w of (o.more || ['router-fw', '雾港'])) h('div', 'ws', side, icon('folder') + ` <span>${w}</span>`);
  const bal = h('div', 'bal', side, `<div class="r"><span><span class="dot"></span><span class="ph">低峰时段</span></span><span class="cdw">${icon('clock')}<span class="cd" style="font-variant-numeric:tabular-nums">39:22:15</span></span></div><div class="r" style="margin-top:8px"><span>充值余额</span><b class="amt">¥126.73</b></div>`);
  h('div', 'nav', side, '<span style="width:24px;text-align:center">···</span> 更多').style.marginTop = '8px';
  const main = h('div', 'main', el);
  let hdr = null, titleEl = null, pill = null;
  if (!o.home) {
    hdr = h('div', 'hdr', main); titleEl = h('span', 'htitle', hdr, o.title || '');
    pill = h('span', 'pill', hdr, `<span class="pic">${icon(MODE[m].ic)}</span> <span class="pt">${MODE[m].zh}</span>`);
    h('span', 'hic', hdr, icon('side') + icon('dots') + icon('panelR'));
  }
  const body = h('div', 'body', main);
  // 峰谷倒计时真的在走：全片共用一个时钟，按片子时间一秒一格（策划者 2026-11-23「真的在走而不是静止 就按一秒一秒倒计时」）
  const cdEl = bal.querySelector('.cd'); let cdLast = '';
  F((t) => { const v = Math.max(0, CD_FILM0 - Math.floor(Math.max(0, t))); const str = `${String(Math.floor(v / 3600)).padStart(2, '0')}:${String(Math.floor(v / 60) % 60).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`; if (str !== cdLast) { cdEl.textContent = str; cdLast = str; } });
  return { el, side, brand, mark, tagU, wsEl, sess, bal, phase: bal.querySelector('.ph'), cd: cdEl, amt: bal.querySelector('.amt'), main, hdr, titleEl, pill, body };
}
function composer(parent, o = {}) {
  const c = h('div', 'composer', parent);
  const ph = h('div', 'ph', c, o.ph || '发消息或创建任务，/ 调用指令，@ 文件或对话');
  const bar = h('div', 'bar', c, `<span class="plusb">${icon('plain')}</span><span class="perm">${icon('shield')} 完全权限 <span class="car">⌄</span></span><span class="model">DeepSeek-V4.1-Flash <span style="opacity:.55">Max</span> <span class="car">⌄</span></span>`);
  const send = h('span', 'send' + (o.ready ? ' ready' : ''), bar, o.busy ? icon('stop') : icon('up'));
  const pw = o.pw || 1388, w = o.w || 1080;   // 居中：按父元素宽度直接算 left（不用 translateX(-50%)，免得被补间的 x 覆盖）
  css(c, { width: w + 'px', left: (pw - w) / 2 + 'px' });
  return { c, ph, bar, send };
}
// 底栏：轮次与步数、token 与缓存、本对话费用、额度限制
function footbar(parent, o = {}) {
  const f = h('div', 'foot', parent);
  const a = h('span', '', f, icon('gauge') + ` ${o.turns || '1 轮 4 步 · 242 tok/s'}`);
  const b = h('span', '', f, icon('db') + ` ${o.tok || '86.9K tok · 缓存命中 0%'}`);
  const c = h('span', 'cost', f, icon('wallet') + ` <span class="v">${(o.cost || '¥0.18').replace('¥', '￥')}</span>`);   // 底栏用全角 ￥
  const d = h('span', 'lim', f, icon('limit') + ` <span class="v">${o.lim || '未启用'}</span>`);
  return { f, turns: a, tok: b, cost: c, lim: d };
}
function step(parent, ic, label, detail, cls = '') { return h('div', 'step ' + cls, parent, `<span class="si">${icon(ic)}</span><span>${label}</span>${detail ? `<span class="sd"></span><span class="sv">${detail}</span>` : ''}`); }
function injects(parent) { return ['runtime-context', 'skill-catalog', 'time-context'].map((k) => step(parent, 'inject', '上下文注入', k)); }
const THUMB = '<path d="M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 3 2l-1 4h6a2 2 0 0 1 2 2l-2 7a2 2 0 0 1-2 1H7"/>';
function msgActions(parent, time = '17:32') { return h('div', 'acts', parent, `${icon('copy')}<svg class="i" viewBox="0 0 24 24">${THUMB}</svg><svg class="i" viewBox="0 0 24 24" style="transform:scaleY(-1)">${THUMB}</svg>${icon('send')}<span class="tm">${time}</span>`); }
// 对话正文的一栏（居中，窗口里所有回复都排在这一栏）
function column(body, o = {}) { const c = h('div', 'col', body); const w = o.w || 1040; css(c, { width: w + 'px', left: (1388 - w) / 2 + 'px' }); if (o.top != null) c.style.top = o.top + 'px'; return c; }

// ── 设置页（照「设置」截图：左侧通用、模型、额度、模式、插件）──
function settings(parent, active, o = {}) {
  const el = h('div', 'settings', parent); if (o.x != null) px(el, o.x, o.y, o.w, o.h);
  const nav = h('div', 'snav', el, '<div class="sh">设置</div>');
  const items = { 通用: 'gear', 模型: 'db', 额度: 'gear', 模式: 'box', 插件: 'sliders' };
  for (const k in items) h('div', 'sni' + (k === active ? ' on' : ''), nav, icon(items[k]) + ' ' + k);
  h('div', 'stop', el, `<span class="cfg">打开配置文件</span>${icon('x')}`);
  const content = h('div', 'scontent', el);
  return { el, nav, content };
}
function dialog(parent, x, y, w, title, o = {}) {
  const d = h('div', 'dialog', parent); px(d, x, y, w); if (o.h) d.style.height = o.h + 'px';
  d.dataset.overlapOk = '';   // 模态框：底下的内容被它盖住（真实界面就是这样）
  h('div', 'dh', d, `<span>${title}</span>${icon('x')}`);
  const body = h('div', 'db', d);
  return { d, body };
}
function toggleEl(parent, on = false) { const t = h('span', 'toggle' + (on ? ' on' : ''), parent, '<i></i>'); return t; }
// 开关在 t 时刻拨到「开」：底色与圆钮一起动
function toggleOn(tg, t, color) {
  // Switch.module.css：圆钮 220ms 略过冲，底色 200ms
  fromTo(tg, t, { backgroundColor: '#cfd3da' }, { backgroundColor: color || 'var(--mc)', duration: 0.2, ease: 'power2.inOut' });
  fromTo(tg.querySelector('i'), t, { x: 0 }, { x: 26, duration: 0.22, ease: 'back.out(1.7)' });
  sfx('tick', t, { g: 0.8 });
}
function checkOn(cb, t) { keyed(cb).at(t, { cls: 'cbx on' }); sfx('tick', t, { g: 0.7 }); }   // 原生复选框，瞬间勾上

// ── DSHU 自己的界面动效（照 ui-primitives 源码的时长与缓动；CSS 的 cubic-bezier 换成最接近的 GSAP 缓动）──
// 对话框 Modal.module.css：从 y 8px、scale .97 升到原位 240ms (.22,.8,.16,1)；遮罩 rgba(0,0,0,.24) 淡入 200ms；关闭只淡出 120ms
function modalIn(e, t) { tl.fromTo(e, { autoAlpha: 0, y: 11, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.24, ease: 'expo.out', immediateRender: true }, t); }
function modalOut(e, t) { tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.12, ease: 'power2.in', immediateRender: false }, t); }
function maskIn(e, t) { tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'power1.out', immediateRender: true }, t); }
// 浮层 StatPopover：只改不透明度，打开 140ms ease-out、关闭 120ms ease-in
function popIn(e, t) { tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.14, ease: 'power2.out', immediateRender: true }, t); }
function popOut(e, t) { tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.12, ease: 'power2.in', immediateRender: false }, t); }
// 菜单 MenuSurface：打开 40ms、关闭 80ms，只改不透明度；输入框上的模式菜单（Menu.module.css）用 d = 0.14
function menuIn(e, t, d = 0.04) { tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: d, ease: 'power2.out', immediateRender: true }, t); }
function menuOut(e, t) { tl.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.08, ease: 'power2.in', immediateRender: false }, t); }
// 侧面板与栏宽变化 AppFrame.module.css：0.3s cubic-bezier(.4,0,.2,1)
const PANEL_EASE = 'power2.inOut', PANEL_D = 0.3;
// 工具提示 Tooltip.module.css：深灰底白字，150ms 只淡入（淡入用 tl.fromTo 自己写）
function tooltip(parent, x, y, text) { const e = h('div', 'tip', parent, text); px(e, x, y); return e; }
// 运行中的小圈 StateDot：轨道 + 一段弧，1.5 秒转一圈，弧长 12→24→12 呼吸。返回 HTML，挂进页面后再用 F 驱动
let SD_N = 0;
function stateDot(size = 22) {
  const id = 'sd' + (++SD_N);
  F((t) => { const g = document.getElementById(id); if (!g) return; const k = (t % 1.5) / 1.5, b = 0.5 - 0.5 * Math.cos(k * 2 * Math.PI); g.setAttribute('transform', `rotate(${(k * 360).toFixed(1)} 12 12)`); const arc = g.lastChild; arc.setAttribute('stroke-dasharray', `${(12 + 12 * b).toFixed(2)} 150`); arc.setAttribute('stroke-dashoffset', (-6 * b).toFixed(2)); });
  return `<svg class="sdot" width="${size}" height="${size}" viewBox="0 0 24 24" style="flex:none"><g id="${id}"><circle cx="12" cy="12" r="9.5" fill="none" stroke="rgb(129,133,140)" stroke-width="2" opacity=".25"/><circle cx="12" cy="12" r="9.5" fill="none" stroke="rgb(129,133,140)" stroke-width="2" stroke-linecap="round" stroke-dasharray="12 150"/></g></svg>`;
}

// ── 动作工具（都显式给出起点，画面只由 t 决定）──
function fadeIn(e, t, o = {}) { tl.fromTo(e, { autoAlpha: 0, y: o.y != null ? o.y : 14, x: o.x || 0 }, { autoAlpha: 1, y: 0, x: 0, duration: o.d || 0.4, ease: o.ease || 'power2.out', immediateRender: true }, t); return e; }
function fadeOut(e, t, o = {}) { tl.fromTo(e, { autoAlpha: 1, y: 0, x: 0 }, { autoAlpha: 0, y: o.y || 0, x: o.x || 0, duration: o.d || 0.35, ease: o.ease || 'power2.in', immediateRender: false }, t); }
function modeTo(el, t, from, toM, d = 0.48) { tl.fromTo(el, { '--mc': MC[from], '--mk': MK[from], '--mki': MKI[from] }, { '--mc': MC[toM], '--mk': MK[toM], '--mki': MKI[toM], duration: d, ease: 'power2.inOut', immediateRender: false }, t); }
// 高亮环：围住 target（相对 rel 量），t0 出现，t1 退场
function ringOn(rel, target, t0, t1, o = {}) {
  const b = box(target, rel), p = o.pad != null ? o.pad : 8;
  const r = h('div', 'ring', rel); px(r, b.x - p, b.y - p, b.w + 2 * p, b.h + 2 * p);
  if (o.c) r.style.setProperty('--rc', o.c);
  if (o.r != null) r.style.borderRadius = o.r + 'px';
  tl.fromTo(r, { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power3.out', immediateRender: true }, t0);
  if (t1 != null) fadeOut(r, t1, { d: 0.3 });
  return r;
}
// 注解：深色磨砂玻璃卡片，挂在被讲的东西旁边
function note(parent, x, y, html, w, o = {}) {
  const n = h('div', 'note', parent, html); px(n, x, y); if (w) n.style.width = w + 'px';
  if (o.gloss) n.dataset.gloss = o.gloss;
  return n;
}
// 场景通用：深色舞台背景（带当前模式色的光晕与细颗粒）
function stageBg(world, m) { const b = h('div', 'stagebg', world); b.style.setProperty('--mc', MC[m]); h('div', 'grain', b); return b; }
// 停留时极慢横移：一屏合计不超过 48 像素
function drift(t0, t1, dir = 1, base = 960) { const d = Math.max(0.5, t1 - t0), dx = Math.min(40, 1.8 * d) * dir; return [t0, { x: base + dx / 2 }, d, { ease: 'none', sfx: false }]; }

// ── 3D ──
const P3 = 2600;   // 透视距离（像素），全片统一
// 从景深里立起来：前倾、在远处，落到正面。元素之前已经出场过（例如沉下去再回来）时传 again: true，不在构建时就把它设成起始状态
function rise3d(e, t, o = {}) {
  tl.fromTo(e, { autoAlpha: 0, rotationX: o.rx != null ? o.rx : 16, rotationY: o.ry || 0, z: o.z != null ? -o.z : -420, y: o.y != null ? o.y : 40, transformPerspective: P3 },
    { autoAlpha: 1, rotationX: 0, rotationY: 0, z: 0, y: 0, duration: o.d || 0.9, ease: o.ease || 'power3.out', immediateRender: o.again ? false : true }, t);
  return e;
}
// 沉回景深里去
function sink3d(e, t, o = {}) {
  tl.fromTo(e, { autoAlpha: 1, rotationX: 0, rotationY: 0, z: 0, y: 0, transformPerspective: P3 },
    { autoAlpha: 0, rotationX: o.rx != null ? o.rx : -14, rotationY: o.ry || 0, z: o.z != null ? -o.z : -500, y: o.y || 0, duration: o.d || 0.6, ease: o.ease || 'power2.in', immediateRender: false }, t);
}
// 立方体式换场：整扇窗口绕自己的一条竖边转过去，下一扇从另一边转进来
function cubeIn(e, t, d = 0.85) {
  tl.fromTo(e, { rotationY: 62, x: 700, z: -380, transformOrigin: '0% 50%', transformPerspective: P3, autoAlpha: 1 },
    { rotationY: 0, x: 0, z: 0, duration: d, ease: 'power3.inOut', immediateRender: true }, t);
}
function cubeOut(e, t, d = 0.85) {
  tl.fromTo(e, { rotationY: 0, x: 0, z: 0, transformOrigin: '100% 50%', transformPerspective: P3 },
    { rotationY: -62, x: -700, z: -380, duration: d, ease: 'power3.inOut', immediateRender: false }, t);
}
// 换场时卡片在原地 3D 翻面：前一面转走、后一面转出来
function flip3d(front, back, t, d = 0.7, axis = 'rotationX') {
  tl.fromTo(front, { [axis]: 0, autoAlpha: 1, transformPerspective: 1600 }, { [axis]: -90, duration: d / 2, ease: 'power2.in', immediateRender: false }, t);
  tl.set(front, { autoAlpha: 0 }, t + d / 2);
  tl.fromTo(back, { [axis]: 90, autoAlpha: 0, transformPerspective: 1600 }, { [axis]: 0, autoAlpha: 1, duration: d / 2, ease: 'power2.out', immediateRender: true }, t + d / 2);
}

// ── 新会话首页（照 hero 截图）：鲸鱼 + 标语、工作区与模式选择、输入框 ──
const HOME_SESS = [['新会话', null, true], ['整理发布说明', 'def'], ['修复搜索结果消失', 'def'], ['审计上传接口', 'sec']];
function homePage(app, o = {}) {
  const head = h('div', 'abs homehead', app.body, `${whale(56, '#1f2329')}<span>更自由的探索未至之境</span>`);
  css(head, { left: '0', right: '0', top: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '18px', fontSize: '44px' });
  const ctx = h('div', 'ctxrow', app.body, `<span>${icon('folder')} acme-shop <span class="car">⌄</span></span><span class="mchip"><span class="mic" style="color:var(--mc)">${icon(MODE[o.mode || 'def'].ic)}</span><span class="mname">${MODE[o.mode || 'def'].zh}</span> <span class="car">⌄</span></span>`);
  ctx.style.top = '386px'; css(ctx, { left: '160px', transform: 'none' });
  const comp = composer(app.body, { ph: '描述你想要构建的内容，/ 调用指令，@ 文件或对话' }); comp.c.style.bottom = '338px';
  return { head, ctx, mchip: ctx.querySelector('.mchip'), mname: ctx.querySelector('.mname'), mic: ctx.querySelector('.mic'), comp };
}

// ── 输入框内容的时间表：同一个元素只用一个控制器，按时段显示（多个 typeText / keyed 挂在同一元素上会互相覆盖）──
// segs: [[t0, 'text', html]] 或 [[t0, 'type', 纯文本, { cps, pre, post, cursorUntil, ghost }]]；返回 type(...) 打完的时刻用 typeEnd()
const CUR = '<span class="cur" style="height:1em;width:3px;vertical-align:-.15em;background:var(--mc)"></span>';
function inputTrack(el, base, segs) {
  segs = segs.slice().sort((a, b) => a[0] - b[0]);
  for (const [t0, kind, p, o = {}] of segs) if (kind === 'type') { const n = [...p].length, cps = o.cps || 14; for (let i = 0; i < n; i += 2) sfx('key', t0 + i / cps, { g: 0.8 }); }
  let last = null;
  F((t) => {
    let html = base;
    for (const [t0, kind, p, o = {}] of segs) {
      if (t < t0) break;
      if (kind === 'text') { html = p; continue; }
      const chars = [...p], k = Math.min(chars.length, Math.floor((t - t0) * (o.cps || 14)));
      const cur = (o.cursorUntil == null || t < o.cursorUntil) ? CUR : '';
      html = (o.pre || '') + `<span class="ty">${cmdChip(chars.slice(0, k).join(''))}</span>` + cur + (o.post || '');
    }
    if (html !== last) { el.innerHTML = html; last = html; }
    let typing = false; for (const [t0, kind, p2, o2 = {}] of segs) if (kind === 'type' && t >= t0 && t < t0 + [...p2].length / (o2.cps || 14) + 0.3) typing = true;
    el.classList.toggle('typing', typing);
  });
  blinkCursors(el);
}
const typeEnd = (t0, text, cps = 14) => t0 + [...text].length / cps;
// 斜杠命令打全以后变成命令片（ui-conversation 的 CommandChip：模式色文字、左右 4px 内边距，不加底色），后面的参数照常
const CMDS = ['/btw', '/side', '/clear'];
function cmdChip(s) {
  const c = CMDS.find((k) => s === k || s.startsWith(k + ' '));
  return c ? `<span class="cmd" style="color:var(--mc);padding:0 4px;margin-left:-4px">${c}</span>${esc(s.slice(c.length))}` : esc(s);
}
// 位图素材（标志、头像）：图片解码完才算页面就绪，免得首帧空白
function rasterImg(parent, src, size, extra = {}) {
  const im = h('img', '', parent); im.src = src; css(im, { width: size + 'px', height: size + 'px', display: 'block', flex: 'none', ...extra });
  (window.PENDING = window.PENDING || []).push(im.decode().catch(() => {}));
  return im;
}
// 光标闪烁：el 里的 .cur 在 [t0, t1) 内按时间明暗交替（inputTrack 打字时设 typing 类，保持常亮）
function blinkCursors(el, t0 = -1e9, t1 = 1e9) {
  let last = null;
  F((t) => {
    const off = t >= t0 && t < t1 && Math.floor(t / 0.53) % 2 === 1; if (off !== last) { el.classList.toggle('blink-off', off); last = off; }
    // 类名顺序与播放历史无关：typing 总在 blink-off 前面（scan 的确定性检查按类名比对）
    const cl = [...el.classList]; if (cl.includes('typing') && cl.includes('blink-off') && cl.indexOf('typing') > cl.indexOf('blink-off')) { el.classList.remove('blink-off'); el.classList.add('blink-off'); }
  });
}

// ── 让位：讲到的物件要放在窗口右侧时，对话栏与输入框像打开侧栏那样往左挪、收窄（显式起点）──
// 主区宽 1388；居中时对话栏 left 174、宽 1040，输入框 left 154、宽 1080。让位后两者的中心移到 424
const ROOM = { colL: 44, colW: 760, compL: 34, compW: 780 };
function makeRoom(t, col, comp, d = 0.7) {
  fromTo(col, t, { left: 174, width: 1040 }, { left: ROOM.colL, width: ROOM.colW, duration: d, ease: 'power3.inOut', immediateRender: false });
  if (comp) fromTo(comp, t, { left: 154, width: 1080 }, { left: ROOM.compL, width: ROOM.compW, duration: d, ease: 'power3.inOut', immediateRender: false });
}
// 聚焦：讲到的物件浮在舞台上时，整扇窗口淡到几乎看不见（之后再回来用 unfocus）
function focusOn(e, t, d = 0.5) { fromTo(e, t, { opacity: 1 }, { opacity: 0.1, duration: d, ease: 'power2.inOut', immediateRender: false }); }
function focusOff(e, t, d = 0.5) { fromTo(e, t, { opacity: 0.1 }, { opacity: 1, duration: d, ease: 'power2.inOut', immediateRender: false }); }
