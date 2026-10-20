// 检查本片当前 Git 可见文件；已知私有标识只由 CASE_PRIVATE_MARKERS 传入，不写进报告。
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),repo=path.resolve(root,'../..'),prefix=path.relative(repo,root).replaceAll('\\','/');
const report='research/lab/verification-public.json';
const files=[...new Set(cp.execFileSync('git',['ls-files','-z','--cached','--others','--exclude-standard','--',prefix],{cwd:repo,encoding:'utf8'}).split('\0').filter(Boolean))]
 .map(f=>f.slice(prefix.length+1)).filter(f=>f!==report&&fs.existsSync(path.join(root,f))).sort();
const markers=(process.env.CASE_PRIVATE_MARKERS||'').split('|').filter(Boolean);
const problems=[],localLinks=[],hashes=[];
const patterns=[
 ['private-network',/\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b/g],
 ['personal-path',/[A-Za-z]:[\\/](?:Users|Coding|工作)[\\/][^\s"'<>]+/g],
 ['auth-value',/(?:token|PHPSESSID)=([a-f0-9]{24,})/gi]
];
for(const file of files){
 const bytes=fs.readFileSync(path.join(root,file)),text=bytes.toString('utf8');
 const textual=/\.(?:md|json|js|cjs|py|css|html|txt)$/.test(file);
 const canonical=textual?Buffer.from(text.replace(/\r\n/g,'\n'),'utf8'):bytes;
 hashes.push({file,basis:textual?'UTF-8 with LF':'raw bytes',sha256:crypto.createHash('sha256').update(canonical).digest('hex')});
 for(const marker of markers)if(text.toLowerCase().includes(marker.toLowerCase()))problems.push({file,category:'known-private-marker'});
 if(/\.(?:md|json|js|cjs|py|css|html|txt)$/.test(file)){
  for(const [category,re]of patterns){re.lastIndex=0;for(const hit of text.matchAll(re)){if(category==='auth-value'&&/^0+$/.test(hit[1]))continue;problems.push({file,category,line:text.slice(0,hit.index).split('\n').length});}}
 }
 if(file.endsWith('.md')){
  for(const hit of text.matchAll(/\]\(([^)]+)\)/g)){
   const dest=hit[1].split('#')[0].split('?')[0];
   if(!dest||/^(?:https?:|mailto:|app:)/.test(dest))continue;
   const clean=dest.replace(/^<|>$/g,'');
   localLinks.push({file,target:clean});
   if(!fs.existsSync(path.resolve(root,path.dirname(file),decodeURIComponent(clean))))problems.push({file,category:'missing-local-link',target:clean});
  }
 }
}
const historical=JSON.parse(fs.readFileSync(path.join(root,'research/lab/out_01_case_inventory.json'),'utf8'));
const deep=JSON.parse(fs.readFileSync(path.join(root,'research/lab/out_18_case_deep_audit.json'),'utf8'));
if(historical.schema!==2||historical.pages.some(p=>p.route||p.path||p.sha256))problems.push({category:'legacy-private-fields'});
if(/"sha256"\s*:/.test(JSON.stringify(historical)))problems.push({category:'legacy-source-fingerprint'});
if(deep.runtime_verified!==false||deep.samples.some(s=>s.path||s.route||s.sha256))problems.push({category:'deep-output-boundary'});
const result={schema:1,checked_on:'2026-10-19',scope:'current-git-visible-film-files; not full Git history or final audiovisual acceptance',
status:problems.length?'failed':'passed',known_private_markers_supplied:markers.length>0,files_checked:files.length,local_links_checked:localLinks.length,
limitations:['Git history was not rewritten.','Pattern checks cannot identify every unknown identity or image content.','The one official demo screenshot was reviewed separately; no private UI capture is included.','No new audio or film has been generated.'],problems,files:hashes};
if(process.argv.includes('--record')){
 if(problems.length)throw Error('检查失败，不写通过报告；仅报告类别与位置：'+JSON.stringify(problems));
 if(!markers.length)throw Error('落盘报告需要通过 CASE_PRIVATE_MARKERS 提供已知私有标识；标识不会写入报告');
 fs.writeFileSync(path.join(root,report),JSON.stringify(result,null,2)+'\n');
}
console.log(JSON.stringify({status:result.status,files:files.length,local_links:localLinks.length,known_markers_checked:markers.length>0,problems},null,2));
process.exitCode=problems.length?1:0;
