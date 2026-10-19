// 本片研究与交审前的一致性核对；不声明人工审稿或成片验收。
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p));
const json = p => JSON.parse(read(p));
const sha = p => crypto.createHash('sha256').update(read(p)).digest('hex');
const checks = [];
const check = (name, run) => { run(); checks.push({name, passed:true}); };
const project = json('project.json');
const raw = json('research/lab/out_01_probe.json');
const decoded = json('research/lab/out_03_decode.json');
const survey = json('research/lab/out_04_survey.json');
const style = json('research/lab/out_05_style.json');
const script = require(path.join(root,'src/js/script.js'));
const data = require(path.join(root,'src/js/data.js'));
const factsText = read('research/FACTS.md').toString('utf8');
const factIds = new Set([...factsText.matchAll(/^\| ((?:S|H|T|V|C)\d\d) \|/gm)].map(x=>x[1]));
const L = script.layoutScript();
check('实际 PostgreSQL 18.4 实验完成，15 项行为断言为真',()=>{
  assert.equal(raw.environment.server.version_num,'180004');
  assert.equal(raw.success,true); assert.equal(Object.keys(raw.checks).length,15);
  for(const value of Object.values(raw.checks)) assert.equal(value,true);
});
check('物理解码对应同一轮原始回显',()=>{
  assert.equal(decoded.source_sha256,sha('research/lab/out_01_probe.json'));
  assert.equal(Object.keys(decoded.snapshots).length,7);
  assert.equal(decoded.checked_items,62);
  assert.deepEqual(decoded.plans,{small:'Seq Scan',many:'Index Scan'});
});
check('系列接续据实际稿本、同一业务数据与原始文件核对',()=>{
  const series=json('research/lab/out_07_series.json');
  assert.deepEqual(series.sequence.map(x=>x.slug),['myisam','innodb','postgresql','firebird']);
  assert.equal(series.fixtures.length,3);
  for(const fixture of series.fixtures){assert.equal(fixture.users.length,8);assert.deepEqual(fixture.users,series.fixtures[0].users);}
  for(const capture of series.captures){assert.match(capture.sha256,/^[0-9a-f]{64}$/);assert.ok(capture.cues.length>0);}
  assert.ok(series.myisam_source.lines.some(x=>x.text.includes('.MYD')));
  assert.ok(series.myisam_source.lines.some(x=>x.text.includes('.MYI')));
});
check('恢复日志包含实际重做及最终正常停机',()=>{
  const log=read('research/lab/out_01_recovery.log').toString('utf8');
  for(const token of ['automatic recovery in progress','redo starts at','redo done at','database system is shut down']) assert.ok(log.includes(token));
  assert.equal(decoded.after_recovery[0].age,32); assert.equal(decoded.after_recovery[1].age,25);
});
check('调查同口径且 2026 人数可复算',()=>{
  assert.deepEqual(survey.years.map(x=>x.year),[2022,2023,2026]);
  const [a,b,c]=survey.years;
  const value=(y,n)=>y.data.find(r=>r.name===n).percent;
  assert.ok(value(a,'MySQL')>value(a,'PostgreSQL'));
  assert.ok(value(b,'PostgreSQL')>value(b,'MySQL'));
  assert.ok(value(c,'PostgreSQL')>value(c,'MySQL'));
  for(const r of c.data) assert.equal(Math.round(r.respondents/c.question_n*1000)/10,r.percent);
});
check('生成数据追溯到实际研究结果',()=>{
  for(const [key, p] of Object.entries(data.provenance)){
    assert.equal(p.sha256,sha(p.file));
    assert.deepEqual(data[key],json(p.file));
  }
});
check('部分索引与 JSONB/GIN 的独立实例验证',()=>{
  const compare=json('research/lab/out_08_compare.json');
  assert.equal(compare.success,true);
  assert.equal(compare.environment.server.version_num,'180004');
  assert.deepEqual(compare.counts,{total:20000,open:200,alert:206});
  assert.equal(Object.keys(compare.checks).length,5);
  for(const passed of Object.values(compare.checks))assert.equal(passed,true);
});
check('候选文字配色符合 4.5:1',()=>{
  assert.equal(style.palette.blue,'#336791');
  for(const pair of style.contrast) assert.ok(pair.ratio>=4.5);
});
const used = new Set(); let spoken=0; let maxWidth=0; let maxCue=0;
check('每句均有已核事实，句号唯一，字幕与时长预算符合',()=>{
  for(const sc of script.SCRIPT) for(const [id,cap,o] of sc.cues){
    assert.ok(!used.has(id),id); used.add(id);
    if(o.pause!=null) continue;
    spoken++;
    assert.ok(cap && o.facts?.length,id);
    for(const fact of o.facts){assert.ok(factIds.has(fact),`${id}:${fact}`); assert.notEqual(fact,'H08');}
    const width=[...script.strip(cap)].reduce((n,c)=>n+(c.charCodeAt(0)<0x2e80?.5:1),0);
    maxWidth=Math.max(maxWidth,width); maxCue=Math.max(maxCue,L.cues[id].d);
    assert.ok(width<=26,`${id}: width ${width}`); assert.ok(L.cues[id].d<=6,id);
    assert.ok(o.gap>=0.2,id);
  }
  assert.deepEqual(project.check.duration,[480,720]);
  assert.ok(L.total>=480 && L.total<=720);
});
check('保留人工确认闸门与指定署名',()=>{
  assert.equal(project.review.required,true); assert.equal(project.review.reviewer,'WaterRun');
  assert.equal(project.production.maker,'6.1Sol');
  assert.ok(project.titles.zh.includes('开源巅峰 PostgreSQL'));
  const approval=json('review/approval.json');
  assert.ok(approval.languages.zh?.content_sha256);
  const {snapshot}=require(path.join(root,'../../../../kit/tools/script-review.js'));
  assert.equal(approval.languages.zh.content_sha256,snapshot(root,project,'zh').hash);
  assert.ok(!read('review/feedback.json').toString('utf8').includes('\ufffd'),'反馈计划包含损坏字符');
  assert.ok(L.cues.zCredit.silent && L.cues.zCredit.d>=12);
});
const result={schema:1,scope:'研究一致性与文案格式；不代替人工审稿、音色试听或成片验收',
  script_sha256:sha('src/js/script.js'),total_estimated_seconds:L.total,spoken,cues:used.size,max_caption_width:maxWidth,
  max_estimated_cue_seconds:maxCue,review_status:Object.fromEntries(Object.entries(json('review/approval.json').languages).map(([k,v])=>[k,v.status])),checks,passed:true};
fs.writeFileSync(path.join(root,'research/lab/out_06_checks.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed:true,groups:checks.length,spoken,cues:used.size,estimated_seconds:L.total}));
