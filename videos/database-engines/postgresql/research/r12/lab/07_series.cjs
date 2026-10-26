// 重新读取前两集的正文、合成数据与已留存原始文件，只输出本片接续所需的证据。
// 需要前两集源码和首集 research/_src、snap_01_create 缓存；离线验证现有 JSON 不需要它们。
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),repo=path.resolve(root,'../..');
const read=p=>fs.readFileSync(p,'utf8');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const my=path.join(repo,'videos/database-engines/myisam');
const inn=path.join(repo,'videos/database-engines/innodb');
const captures=[];
for(const [movie,dir,ids] of [['myisam',my,['b5','b6','f13','f14','n3','n4','n5','n6']],['innodb',inn,['k2','k4','k4b','k9']]]){
  const file=path.join(dir,'src/js/script.js'),cues=require(file).SCRIPT.flatMap(s=>s.cues);
  captures.push({movie,file:'src/js/script.js',sha256:hash(file),cues:ids.map(id=>{const c=cues.find(c=>c[0]===id);if(!c)throw new Error('找不到原句 '+id);return {id,text:c[1]};})});
}
const fixtures=[['myisam',path.join(my,'research/lab/01_create.sql')],['innodb',path.join(inn,'research/lab/00_schema.sql')],['postgresql',path.join(root,'research/lab/00_schema.sql')]].map(([movie,file])=>{
  const values=read(file).match(/INSERT INTO users VALUES\s*([\s\S]*?);/i);
  if(!values)throw new Error(movie+': 缺少 users 初始数据');
  return {movie,sha256:hash(file),users:[...values[1].matchAll(/\((\d+),'([a-z]+)',(\d+)\)/g)].map(x=>({id:+x[1],name:x[2],age:+x[3]}))};
});
if(fixtures.some(x=>x.users.length!==8||JSON.stringify(x.users)!==JSON.stringify(fixtures[0].users)))throw new Error('八行业务数据不一致');
const header=path.join(my,'research/_src/mysql-5.5.62/include/myisam.h');
const snapshots=['users.MYD','users.MYI'].map(name=>{const p=path.join(my,'research/lab/remote/snap_01_create',name);return {file:name,bytes:fs.statSync(p).size,sha256:hash(p)};});
const catalog=JSON.parse(read(path.join(repo,'videos/catalog.json')));
const result={schema:1,checked_at:'2026-10-19',scope:'跨集接续的实际脚本、同一业务数据与原始文件；不作跨版本性能比较',captures,fixtures,
  myisam_source:{tag:'mysql-5.5.62',path:'include/myisam.h',url:'https://github.com/mysql/mysql-server/blob/mysql-5.5.62/include/myisam.h',sha256:hash(header),lines:read(header).split(/\r?\n/).flatMap((line,i)=>/MI_NAME_[ID]EXT/.test(line)?[{line:i+1,text:line.trim()}]:[])},
  myisam_snapshots:snapshots,sequence:catalog.videos.filter(v=>v.series==='database-engines').slice(0,4).map(x=>({slug:x.slug,title:x.title.zh})),
  next_episode:'Firebird：制作计划，不预先陈述技术特性'};
fs.writeFileSync(path.join(__dirname,'out_07_series.json'),JSON.stringify(result,null,2)+'\n','utf8');
console.log(JSON.stringify({checked_episodes:captures.length,matching_users:fixtures[0].users.length,sequence:result.sequence.map(x=>x.slug)}));
