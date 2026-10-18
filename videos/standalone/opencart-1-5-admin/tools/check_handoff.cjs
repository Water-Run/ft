// 文案阶段交接检查。默认连同人工确认一起检查；--materials-only 只核准备材料。
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),repo=path.resolve(root,'../../..');
const project=JSON.parse(fs.readFileSync(path.join(root,'project.json'),'utf8'));
const review=require(path.join(repo,'kit/tools/script-review')), feedback=require(path.join(repo,'kit/tools/feedback'));
const issues=[],required=['AGENTS.md','HANDOFF.md','research/FACTS.md','research/SUBSYSTEMS.md','research/SCRIPT-R3.md','research/DEEP-MAP.md','research/STYLE-DECISION.md','research/REDACTION.md','review/NOTES.md','brief/01-mission.md','brief/02-script.md','brief/03-visual.md','brief/04-storyboard.md','brief/05-motion-sound.md','brief/06-acceptance.md','brief/storyboard.json','expect.zh.json','src/data/demo.json'];
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
for(const file of required){if(!fs.existsSync(path.join(root,file)))issues.push('缺少 '+file);else if(/\{\{[A-Z0-9_]+\}\}/.test(read(file)))issues.push('残留模板占位 '+file);}
let current;
try{
 current=review.snapshot(root,project,'zh');
 const script=read('research/SCRIPT-R3.md');
 if(!script.includes(current.hash))issues.push('R3 阅读稿已过期');
 const expectedFile='review/script.zh.'+current.hash+'.md';
 if(!fs.existsSync(path.join(root,expectedFile)))issues.push('缺少当前哈希的逐句校对稿');
 const facts=read('research/FACTS.md'),paras=new Map(current.source.NARRATIVE.flatMap(sc=>sc.paragraphs.map(([id,text,refs])=>[id,{scene:sc.id,text,refs}])));
 for(const [id,p] of paras){if(!p.refs||!/(R1|A18|S19|C19)/.test(p.refs))issues.push('段落缺依据 '+id);for(const hit of p.refs.matchAll(/(?:S19|A18|C19)-\d{2}/g))if(!facts.includes(hit[0]))issues.push('事实编号不存在 '+hit[0]);}
 const board=JSON.parse(read('brief/storyboard.json')),seen=new Set();
 for(const step of board.steps){for(const id of step.paragraphs){if(!paras.has(id)||paras.get(id).scene!==step.scene||seen.has(id))issues.push('分镜段号错误 '+id);seen.add(id);}if(!step.action||!step.result||!step.expect?.length)issues.push('分镜不完整 '+step.id);}
 for(const id of paras.keys())if(!seen.has(id))issues.push('未分镜 '+id);
 const expected=JSON.parse(read('expect.zh.json')),cueIds=new Set(current.estimate.order);
 for(const [id,words] of Object.entries(expected))if(!cueIds.has(id)||!Array.isArray(words)||!words.length)issues.push('对应表无效 '+id);
 if(current.source.NARRATIVE.filter(sc=>sc.title).length!==9)issues.push('主体章数与本轮子系统方案不同');
 if(project.visual?.direction!=='A'||project.visual?.confirmed_by!=='WaterRun')issues.push('视觉确认不一致');
 if(project.production?.prepared_by!=='GPT-6 Astra')issues.push('准备署名不一致');
 const range=project.check?.duration?.zh;
 if(!Array.isArray(range)||current.estimate.total<range[0]||current.estimate.total>range[1])issues.push('估算时长超出交审预算');
 const f=feedback.prepared(root,project);issues.push(...f.problems);
 const approval=JSON.parse(read('review/approval.json')).languages?.zh;
 if(approval?.content_sha256!==current.hash)issues.push('当前审批记录没有指向此稿；保留旧记录后更新 pending 稿本');
 console.log(JSON.stringify({material_status:issues.length?'incomplete':'complete',content_sha256:current.hash,estimated_seconds:+current.estimate.total.toFixed(2),paragraphs:paras.size,storyboards:board.steps.length,problems:issues},null,2));
}catch(error){issues.push(error.message);console.error(error.message);}
if(issues.length)process.exitCode=1;
else if(process.argv.includes('--materials-only'))console.log('准备材料检查通过；不代表文案已批准或成片已制作。');
else{
 const approval=review.status(root,project,['zh']);
 console.log(approval.ok?'中文确认记录通过，可按本片入口接续；英文另行交审。':'人工确认未通过：'+approval.problems.join('；'));
 process.exitCode=approval.ok?0:2;
}
