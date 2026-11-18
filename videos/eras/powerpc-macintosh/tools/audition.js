// Build the offline review page and its six full-resolution stills.
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const puppeteer = require('puppeteer-core');
const {chromePath, PY} = require('../../../../kit/tools/lib');
const {execFileSync} = require('node:child_process');
const {snapshot} = require('../../../../kit/tools/script-review');
const video = path.resolve(__dirname, '..');
const design = path.join(video, 'src/design'), out = path.join(video, 'out/audition');
const project = require('../project.json');
const {content,hash,estimate} = snapshot(video,project,'zh');
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const frames = {
  A:[
    {title:'软盘插在哪里？',date:'1998',desc:'切到真机正面，让观众亲自找一遍。屏幕下的长条是光盘托盘，右边才是电源键。对应 o2–o4。'},
    {title:'五种颜色',date:'1999',desc:'五台同向陈列，像在柜台前横移一步。同一批机型的选择，从规格落到人的偏好。对应 c8–c10。'},
    {title:'塔里的风',date:'2003',desc:'铝壳前面板放大到能数清孔眼。等观众看清风从哪里进，再打开机箱解释四个散热区。对应 g2–g5。'}
  ],
  B:[
    {title:'双击以后',date:'1994',desc:'在 System 7 风格的窗口里追踪一份旧应用。读到模拟器，才揭开中间那一步。对应 b4–b10。'},
    {title:'窗子有了光',date:'2001',desc:'先看 Aqua 的条纹、玻璃按钮和 Dock，再打开 Classic 的解释窗。旧应用和新系统同时出现在一张桌面上。对应 a2–a9。'},
    {title:'再双击一次',date:'2006',desc:'把同一台 Intel iMac 的两种情况并排。通用版选取 Intel 代码，许多旧 PowerPC 应用则经过 Rosetta。对应 e3–e8。'}
  ]
};
const voices = [
  ['v1','温和青年','Gentle_Youth'], ['v2','成熟女声','Mature_Woman'], ['v3','温和长者','Gentle_Senior'],
  ['v4','亲切女声','Warm_Bestie'], ['v5','诚恳成人','Sincere_Adult']
];
const music = [
  ['m1','桌边的琴键','84 BPM · 四拍','电钢琴把短句留给旁白，两声高音像手指轻落在键帽上。'],
  ['m2','透光的三拍','96 BPM · 三拍','玻璃音色弹出跳跃的三拍，走到五色机身时加入短小的切分。'],
  ['m3','塔里的余温','70 BPM · 四拍','低音长线托住金属机箱的重量，中段露出高音，结尾留出空拍。']
];
const paraEnds = {open:[4],bridge:[3,6,10],color:[3,7],aqua:[4,9],heat:[5,7],end:[2,7,9]};
const duration = n => Math.floor(n/60) + ' 分 ' + Math.round(n%60) + ' 秒';
const chapters = content.scenes.filter(s=>s.cues.some(c=>!c.silent));
const chaptersHtml = chapters.map((s,i)=>{
  let paragraphs = '', paragraph = '';
  s.cues.filter(c=>!c.silent).forEach((c,n,arr)=>{
    paragraph += '<span class="line"><span class="cue">'+esc(c.id)+'</span>'+esc(c.text)+'</span>';
    if(paraEnds[s.id].includes(n+1) || n===arr.length-1) {paragraphs += '<p>'+paragraph+'</p>'; paragraph='';}
  });
  return '<article id="chapter-'+s.id+'"><h3><i>0'+(i+1)+'</i>'+esc(s.chapter[1])+'</h3>'+paragraphs+'</article>';
}).join('');
const player = (id,name) => '<audio controls preload="metadata" aria-label="'+esc(name)+'试听" src="sound/'+id+'.mp3"></audio>';
const choice = (key,val) => '<label class="sound-select"><input type="radio" name="'+key+'" value="'+esc(val)+'"> 选择</label>';
const values = {
  DATA: JSON.stringify({hash,frames}).replaceAll('<','\\u003c'),
  HASH8: hash.slice(0,8), DURATION:duration(estimate.total), SCRIPT:chaptersHtml,
  SAMPLE:chapters[0].cues.filter(c=>['o2','o3','o4'].includes(c.id)).map(c=>esc(c.text)).join(''),
  CHAPTER_LINKS:chapters.map(s=>'<li><a href="#chapter-'+s.id+'"><span>'+s.chapter[0]+'</span>'+esc(s.chapter[1])+'</a></li>').join(''),
  VOICES:voices.map(([id,title,voice])=>'<div class="audio-row"><i class="num">'+id.toUpperCase()+'</i><div><strong>'+title+'</strong><small>'+voice+' · MiniMax</small></div>'+player(id,title)+choice('voice',id.toUpperCase()+' · '+title)+'</div>').join(''),
  MUSIC:music.map(([id,title,meter,note])=>'<article class="music-card"><i class="num">'+id.toUpperCase()+'</i> <small>'+meter+'</small><h3>'+title+'</h3><p>'+note+'</p>'+player(id,title)+choice('music',id.toUpperCase()+' · '+title)+'</article>').join('')
};

async function build() {
  fs.mkdirSync(path.join(out,'frames'),{recursive:true});
  fs.mkdirSync(path.join(out,'photos'),{recursive:true});
  for(const photo of ['bondi','profile']) fs.copyFileSync(path.join(design,'photos',photo+'.webp'),path.join(out,'photos',photo+'.webp'));
  for(const id of [...voices,...music].map(row=>row[0])) {
    if(!fs.existsSync(path.join(out,'sound',id+'.mp3'))) throw Error('缺少试听 '+id+'，先运行 voices.py 和 music.py。');
  }
  const browser = await puppeteer.launch({executablePath:chromePath(),headless:true,args:['--allow-file-access-from-files']});
  try {
    const page = await browser.newPage(); await page.setViewport({width:1920,height:1080,deviceScaleFactor:1});
    const base = pathToFileURL(path.join(design,'frames.html')).href;
    for (const key of ['a1','a2','a3','b1','b2','b3']) {
      await page.goto(base+'?frame='+key,{waitUntil:'load'});
      await page.evaluate(async()=>{
        await document.fonts.ready;
        await Promise.all([...document.querySelectorAll('section.visible img')].map(img=>img.decode()));
      });
      await page.screenshot({path:path.join(out,'frames',key+'.jpg'),type:'jpeg',quality:94});
    }
  } finally {await browser.close();}
  const template = fs.readFileSync(path.join(design,'review.html'),'utf8');
  const js = fs.readFileSync(path.join(design,'review.js'),'utf8');
  const css = fs.readFileSync(path.join(design,'review.css'),'utf8');
  execFileSync(PY(), [path.join(__dirname,'review_fonts.py')], {input:template+js+JSON.stringify(values)});
  const embed = (file,mime) => 'data:'+mime+';base64,'+fs.readFileSync(path.join(out,file)).toString('base64');
  const assets = {};
  for(const frame of ['a1','a2','a3','b1','b2','b3']) {
    const file='frames/'+frame+'.jpg'; assets[file]=embed(file,'image/jpeg');
  }
  for(const shot of ['profile','bondi']) {
    const file='photos/'+shot+'.webp'; assets[file]=embed(file,'image/webp');
  }
  values.DATA = JSON.stringify({hash,frames,assets}).replaceAll('<','\\u003c');
  const html = template.replace(/\{\{(\w+)\}\}/g,(_,key)=>{
    if(!(key in values)) throw Error('未知占位 '+key); return values[key];
  }).replace(/src="(sound\/[mv]\d\.mp3)"/g,(_,file)=>'src="'+embed(file,'audio/mpeg')+'"')
    .replace('<link rel="stylesheet" href="review.css">',()=>'<style>'+css.replace(/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/assets\/fonts\/(Noto\w+)\.ttf/g,(_,name)=>embed('fonts/'+name+'.woff2','font/woff2'))+'</style>')
    .replace('<script src="review.js"></script>',()=>'<script>'+js+'</script>')
    .replace('</details></div>',()=>'<details><summary>内嵌字体许可</summary><pre style="white-space:pre-wrap">'+esc(fs.readFileSync(path.join(design,'fonts-OFL.txt'),'utf8'))+'</pre></details></details></div>');
  fs.writeFileSync(path.join(out,'index.html'),html);
  console.log('out/audition/index.html · '+hash.slice(0,8)+' · '+duration(estimate.total));
}
build().catch(err=>{console.error(err);process.exitCode=1;});
