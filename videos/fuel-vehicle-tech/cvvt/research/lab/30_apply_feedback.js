// 把本片的开工反馈应用计划合并进 review/feedback.json：只改 applicability / reason / plan / script_evidence，
// 保留工具写入的 rule_sha256、result、verification、clips 原样。重复运行结果一致。
// 用法：node 30_apply_feedback.js <视频目录>
const fs = require('node:fs');
const path = require('node:path');

const video = path.resolve(process.argv[2]);
const P = {
  F01: {
    reason: '片名是问句「是什么」，必须真的回答可变气门正时改变了什么，否则会变成一串厂商名与缩写。',
    plan: '全片只问一个问题：改变凸轮轴相位，从而改变气门开闭时刻，为什么同一台发动机在不同转速与负荷下要给出不同时刻。章节按系列约定的「现象→部件与原理→指标与取舍→厂商做法→协同→小结」推进，每章只回答这个问题的一步。不铺发动机结构史，不做厂商排名。正面对照 MyISAM 一集「同一对象走完一条链路」的讲法。',
    script_evidence: 'FACTS.md 逐章：open(V01,V02)、ch1(V03–V12)、ch2(V13–V17)、ch3(V18–V26)、ch4(V27–V32)、ch5(V33–V36)、close(V37,V38)；README「内容」表七行与「开工反馈应用」F01 行。文案未开工，cue 号待 WaterRun 审稿确认后回填。'
  },
  F02: {
    reason: '气门正时、重叠角、充气效率、泵气损失、进气惯性效应五个概念叠在一起，最易劝退没有工程背景的观众。',
    plan: '概念先于术语与数字：先让观众看到「气门开早一点、开晚一点」这个动作，再引出正时与重叠角；新名词控制在十个以内；每个数字先说它改变了什么（4800–5200 rpm 是换型线、7600 rpm 是功率点）。关键链条只走一次：气门时刻变→进气量变→扭矩变。',
    script_evidence: 'FACTS.md ch1 V03、V04、V05、V08、V09、V11；README「内容」ch1 行与「开工反馈应用」F02 行。'
  },
  F03: {
    reason: 'VVT-i、VTEC、VTEC-E、i-VTEC、VTC、CVTC、e-VTC、EcoBoost 一堆名字，中英文与厂商叫法各异，且各厂命名年代不同。',
    plan: '第一次出现即说明属于哪家、哪一年、改的是升程还是时刻；ch4 用一张命名对照表一次交代（Toyota 1995 VVT-i 只改时刻；Honda 1989 VTEC 两者皆改、2000 i-VTEC 加连续正时；Nissan 2006 CVTC 进气连续、e-VTC 排气电磁；Ford 不另起正时专名而并入 EcoBoost）；比较只在同一厂商代际之间做；每家的年代只用官方可查年份。',
    script_evidence: 'FACTS.md ch3 V21–V25、ch4 V27–V31（V32 为待核实的 VVT-iE 后缀）；README「内容」ch3、ch4 行与「开工反馈应用」F03 行。'
  },
  F04: {
    reason: '本片核心画面是两条时间轴加若干转角数值，是 F04 的高风险场景。',
    plan: '关键画面先排信息再排动作：气门开闭时间轴、转速轴上的切换点与功率扭矩点、厂商命名表，全部文字到位后按「1.5 秒 + 必要文字字数 ÷ 5 字/秒」留稳定阅读区间，再留一步机制的理解时间，其间不引入新东西；数值先于动画到位；元素退场交代去向。五到十分钟靠删内容腾时间。',
    script_evidence: 'FACTS.md ch1 V04、V11，ch2 V14，ch4 V31（命名表）；README「内容」ch1、ch2、ch4 行与「开工反馈应用」F04 行。'
  },
  F05: {
    reason: '正时与相位是抽象概念，静态图讲不清，只靠数字更讲不清。',
    plan: '每一步都可见：同一凸轮型线在低重叠怠速、部分负荷、高重叠高负荷三种工况下的气门动作并排；活塞与气门相对位置逐帧可读；相位改变画成凸轮相对转动并带动气门时间轴平移；升程切换画成三根摇臂连成一体；进气惯性效应画成压差与进气量。整屏擦除只用于换章。',
    script_evidence: 'FACTS.md ch1 V07、V08、V10、V19 与「视觉系统」表的机构形状行；README「开工反馈应用」F05 行与「视觉系统」表。'
  },
  F06: {
    reason: '机械题材容易堆砌机械噪音与气流声，正是 P3、P27 指出的问题。',
    plan: '配乐按「精密机械实验室」选持续低频铺底加克制节奏，与「参数逐个落定」的段落对齐；音效只用在真实机械动作（凸轮轴相位平移、液压销接合、气门开合）；不用默认 whoosh；读数与结论处留白不加音效。参照 MyISAM 一集的配乐存在度量级，不复制其配乐。',
    script_evidence: 'FACTS.md ch3 V19（液压销接合动作）、ch1 V12（相位平移动作）；README「开工反馈应用」F06 行与「视觉系统」表。'
  },
  F07: {
    reason: '取证来自公网并引用厂商页面，画面需避免带入任何本机信息。',
    plan: '画面只出现官方公开资料与依官方尺寸自绘的示意图；不出现本机路径、主机名、账号与内网地址；research/lab 回显同样不含本机绝对路径。',
    script_evidence: 'FACTS.md「环境与版本」表（各脚本回显头部记录 UTC 时刻与 SHA-256）；README「取证」「开工反馈应用」F07 行。'
  },
  F08: {
    reason: '尚未渲染，先立口径，避免交付时用混音 WAV 或旧报告代替最终文件。',
    plan: '以最终编码的 MP4 核对帧率、时长、响度、真峰值、文件名与哈希，实测值写回 README 与 FACTS「复核」；未测项写「未测」。',
    script_evidence: 'README「成片」「发布、归档与清理」表格与「开工反馈应用」F08 行；FACTS.md「复核」一节待成片后填写。'
  },
  F09: {
    reason: '本片技术结论全部依赖厂商官方材料，误用媒体数字或论坛说法风险高。',
    plan: '片中结论只来自 FACTS.md；每家厂商的材料分列并标明发布年份；媒体与论坛只用于定位官方页面，未写入结论；四项待核实（VVT-iE 后缀、Ford 可变气门升程等）与八处「第二路待补」的具体数字不进定稿，或改为「官方当年公布的试验值」这一转述口径。',
    script_evidence: 'FACTS.md V13、V23、V26、V32、V38（待核实与待补第二路的清单）；README「开工反馈应用」F09 行与「内容」ch2、ch3 行。'
  },
  F10: {
    reason: '本系列按「一次燃烧怎么发生、怎么被榨出效率、动力怎么传到车轮」排序，本集排在四冲程循环与燃油喷射点火之后，须独立可懂。',
    plan: '不出现「上一期」；本片自带必要基础（进气、排气、压缩做功），用到四冲程概念时用一句话就地交代，不要求先看别的集；也不假定观众记得前面集里的术语。',
    script_evidence: 'README「开工反馈应用」F10 行与「内容」open、ch1 行；FACTS.md open V01、V02 与 ch1 V03。'
  },
  F11: {
    reason: '厂商材料全为英文，缩写密集（VVT-i、VTEC、CVTC、e-VTC、ABDC、SU-LEV），不给中文释义会直接抬高门槛。',
    plan: '每个缩写第一次出现给中文释义并注明为意译；官方长文只引必要短句，原文不作主画面；片中不出现整段英文引文。',
    script_evidence: 'FACTS.md ch3 V21、V23、ch4 V31（各官方名称原文）、ch1 V09（ABDC）、ch2 V15（SU-LEV）；README「开工反馈应用」F11 行。'
  },
  F12: {
    reason: '专有名词与缩写密集，读法与断句容易出错，尤其是按字母逐个读的缩写。',
    plan: '配音前列专名读法表（VVT-i、VTEC、CVTC、e-VTC、ABDC、SU-LEV 均按字母读；Wards 专利名的读法单独确认）；长句按语义断句，字幕切分不决定口播停顿；代表段试听交策划者确认后合成全片；ASR 只作筛查。',
    script_evidence: 'FACTS.md ch4 V28–V30（Vard/Ward\'s 读法与型号名）、ch1 V11（rpm 数字读法）；README「开工反馈应用」F12 行与「文案与校对」一节。'
  },
  F13: {
    reason: '观众不知道这个技术从哪来、为什么各家叫法不同；年代与路线必须先交代。',
    plan: 'open 与 ch1 先交代对象与路线：老发动机的气门时刻为什么是写死的、什么时候开始能调，先从 Honda 1989 与 Toyota 1995 两条线说起；年代只用官方可查年份（FACTS V22、V27、V28、V29、V30），不使用来源不明的年份；观众熟悉的情境（踩油门时的体感）作为入口。',
    script_evidence: 'FACTS.md open V01、V02、ch4 V27–V30；README「开工反馈应用」F13 行与「内容」open、ch1、ch4 行。'
  },
  F14: {
    reason: '片尾有模型名单与仓库链接，混入旁白会破坏内容。',
    plan: '署名与 credit 全部放进制作说明；片尾用静默 cue 保留时长、字幕为空、TTS 不发声；导出正文检查无制作指令；成片核对名单与链接完整可读。',
    script_evidence: 'FACTS.md「制作署名」表与 README「制作署名与片尾」表（同名单）；README「开工反馈应用」F14 行。'
  },
  F15: {
    reason: '示意图多，最容易写出「示意 · 按源码分支构造」这类制作者口吻的小字。',
    plan: '画面只放观众需要的内容；来源只写一行「来源：厂商官方资料」；只有确实非写实比例的图才标「示意」，并注明比例依据（B16A 官方尺寸）；不写说明制作取舍或默认处理的标注。',
    script_evidence: 'FACTS.md V14（官方尺寸作为比例依据）、README「视觉系统」表的部件比例行与「开工反馈应用」F15 行。'
  },
  F16: {
    reason: '讲的是机械，正面图必须像真机构；通用示意图会让片子失去可信度。',
    plan: '部件形状、比例与动作全部按官方材料自绘：Honda 官方 VTEC 机构图的三摇臂与液压销、B16A 官方给出的进气门 33 mm / 排气门 28 mm / 气门夹角 56° / 缸径×行程 81.0×77.4 mm 作比例依据、Toyota 官方 VVT-i 系统图与 WT 皮带轮的螺旋花键动作；官方示意图中的橙色高亮沿用为强调色；常驻「凸轮型线＋相位角弧」标识。',
    script_evidence: 'README「视觉系统」表逐项列出官方出处；FACTS.md V12、V14、V19（官方尺寸与机构描述）。'
  },
  F17: {
    reason: '科普题材容易念成「说明书朗读」，是 P29 的高风险场景。',
    plan: '配音前试听候选音色与语速，确认句子有起伏、该强调处有重音、长句不被念平；语气是「把一件事讲明白」而不是背参数；不选已停用音色；术语密集段试听交策划者确认后合成全片。',
    script_evidence: 'README「开工反馈应用」F17 行与「文案与校对」一节；FACTS.md 逐章条目即为口播要点的来源清单。'
  },
  F18: {
    reason: '参数题材容易做成「逐条念数字」，每章必须有可记住的主画面。',
    plan: '每章一个主画面并写明尺度、层次与动作：三种工况下同一气门的动作对照、凸轮型线与气门升程曲线、相位平移带动气门时间轴平移、转速轴上的切换与功率扭矩点、四家命名年代对照、换气与增压直喷催化的协同图。逐行出现与高亮只作辅助；不以镜头晃动充数。',
    script_evidence: 'README「开工反馈应用」F18 行与「内容」表七行（每章一个主画面）；FACTS.md V04、V10、V11、V19、V31（可作主画面的具体数据）。'
  },
  F19: {
    reason: '时间轴、角度标注与表格容易越界、压字或在渐变中途与底色同色。',
    plan: '按实际字宽排版，角度与转数标注不压线；色块不越出部件轮廓；反色高亮不同时渐变底色与字色；元素退场交代去向；逐 0.1 秒取帧专看中间帧，不以 scan.js 过闸代替。',
    script_evidence: 'README「开工反馈应用」F19 行与「视觉系统」表；FACTS.md V04、V11（画面上的角度与转数即排版基准）。'
  }
};

const file = path.join(video, 'review', 'feedback.json');
const state = JSON.parse(fs.readFileSync(file, 'utf8'));
for (const item of state.items) {
  const p = P[item.id];
  if (!p) throw new Error('没有为 ' + item.id + ' 写计划');
  item.applicability = 'applies';
  item.reason = p.reason;
  item.plan = p.plan;
  item.script_evidence = p.script_evidence;
}
fs.writeFileSync(file, JSON.stringify(state, null, 2) + '\n');
console.log('已写入 ' + file + '（' + state.items.length + ' 项）');
