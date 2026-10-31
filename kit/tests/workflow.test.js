const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync, execFileSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const review = require('../tools/script-review');
const { verify } = require('../tools/clean');
const credits = require('../tools/credits');
const artifacts = require('../tools/artifact-record');

test('编码器实际探测、自动回退与显式失败；硬件质量参数独立于 CRF', () => {
  const { selectEncoder, encodingArgs } = require('../tools/encoder');
  const called = [];
  const execute = (cmd, args) => {
    const name = args[args.indexOf('-c:v') + 1]; called.push(name);
    return name === 'h264_nvenc' ? { status: 1, stderr: 'driver unavailable' } : { status: 0 };
  };
  assert.equal(selectEncoder('ffmpeg', 'auto', {}, execute).name, 'libx264');
  assert.deepEqual(called, ['h264_nvenc', 'libx264']);
  called.length = 0;
  assert.throws(() => selectEncoder('ffmpeg', 'h264_nvenc', {}, execute), /driver unavailable/);
  assert.deepEqual(called, ['h264_nvenc']);
  assert.throws(() => selectEncoder('ffmpeg', 'unknown', {}, execute), /encoder/);
  assert.throws(() => selectEncoder('ffmpeg', 'auto', {}, () => ({ status: null, error: new Error('timeout') })), /timeout/);
  assert.equal(encodingArgs('h264_nvenc', { crf: 30, cq: 17 }).includes('-crf'), false);
  assert.equal(encodingArgs('libx264', { crf: 15 }).includes('-cq'), false);
  assert.equal(selectEncoder('ffmpeg', 'auto', {}, () => ({ status: 0 })).name, 'h264_nvenc');
});

function fixture(t) {
  const temporary = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'ft-workflow-'));
  const root = path.join(temporary, 'repo');
  fs.mkdirSync(root);
  for (const dir of ['tools', 'template', 'engine']) fs.cpSync(path.join(ROOT, 'kit', dir), path.join(root, 'kit', dir), { recursive: true });
  fs.writeFileSync(path.join(root, 'kit/studio.json'), JSON.stringify({ planner: 'Example Planner', reviewer: 'Fixture Reviewer', repository: 'https://github.com/example/films' }));
  fs.mkdirSync(path.join(root, 'videos'));
  fs.mkdirSync(path.join(root, 'docs'));
  fs.copyFileSync(path.join(ROOT, 'docs/lessons.json'), path.join(root, 'docs/lessons.json'));
  fs.writeFileSync(path.join(root, 'videos/catalog.json'), JSON.stringify({ about: 'Test fixture', series: [], videos: [] }));
  fs.copyFileSync(path.join(ROOT, '.gitignore'), path.join(root, '.gitignore'));
  execFileSync('git', ['init', '--quiet'], { cwd: root });
  const run = (tool, ...args) => spawnSync(process.execPath, [path.join(root, 'kit/tools', tool + '.js'), ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, FT_PROJECT_LOCK: '', PYTHON: 'nonexistent-test-python' }, timeout: 20000 });
  const created = run('new', 'example', '--title', '示例 <&> "稿本"', '--title-en', 'Example', '--langs', 'zh,en');   // 双语夹具：覆盖英文路径
  assert.equal(created.status, 0, created.stderr);
  const video = path.join(root, 'videos/standalone/example');
  const project = JSON.parse(fs.readFileSync(path.join(video, 'project.json'), 'utf8'));
  t.after(() => {
    // 只清理由本测试创建并验证过的临时目录。
    assert.ok(path.resolve(temporary).startsWith(fs.realpathSync(os.tmpdir()) + path.sep + 'ft-workflow-'));
    fs.rmSync(temporary, { recursive: true, force: true });
  });
  const catalog = () => JSON.parse(fs.readFileSync(path.join(root, 'videos/catalog.json'), 'utf8'));
  const saveCatalog = (data) => fs.writeFileSync(path.join(root, 'videos/catalog.json'), JSON.stringify(data));
  return { root, video, project, run, catalog, saveCatalog, archive: path.join(temporary, 'archive') };
}
function write(video, relative, content = 'fixture') {
  const file = path.join(video, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
function approve(f, lang = 'zh') {
  // 仅用于隔离测试的虚构确认；永不写入实际视频。
  const current = review.snapshot(f.video, f.project, lang);
  const file = path.join(f.video, 'review/approval.json');
  const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { schema: 1, languages: {} };
  data.languages[lang] = { status: 'approved', content_sha256: current.hash, reviewer: 'Fixture Reviewer', confirmed_at: '2026-10-18T10:00:00+08:00', evidence: 'Synthetic test fixture only' };
  fs.writeFileSync(file, JSON.stringify(data));
  return current;
}
const lessonsIn = (root) => require(path.join(root, 'kit/tools/lessons.js'));

test('产物内容核对拒绝同尺寸替换、漏记、越界和缺失文件', async t => {
  const f = fixture(t);
  write(f.video, 'out/one.mp4', 'first');
  const record = await artifacts.capture(f.video, ['out/one.mp4']);
  assert.deepEqual(await artifacts.verify(f.video, record, ['out/one.mp4']), []);
  write(f.video, 'out/one.mp4', 'other');
  assert.match((await artifacts.verify(f.video, record, ['out/one.mp4'])).join(), /不一致/);
  assert.ok((await artifacts.verify(f.video, {}, ['out/one.mp4'])).length);
  assert.ok((await artifacts.verify(f.video, record, ['out/missing.mp4'])).length);
  for (const relative of ['../outside', '/absolute', 'C:/outside', 'out/../one.mp4']) assert.throws(() => artifacts.localFile(f.video, relative));
});

test('混音来源包括辅助脚本，Python 字节码缓存不改变输入集合', t => {
  const f = fixture(t), p = { audio: { music: 'tools/music.py' } };
  write(f.video, 'tools/music.py', '# fixture');
  write(f.video, 'tools/helper.py', '# helper');
  const before = artifacts.audioInputs(f.video, p, 'zh', []);
  write(f.video, 'tools/__pycache__/music.cpython-314.pyc', 'cache');
  assert.deepEqual(artifacts.audioInputs(f.video, p, 'zh', []), before);
  assert.ok(before.includes('tools/helper.py'));
});

test('完整交付报告绑定每个文件；最终文件、混音输入、封面或检查缺失都会阻止交付', async t => {
  const f = fixture(t), p = { ...f.project, languages: ['zh'], audio: { music: 'none' } };
  const sources = { 'js/script.js': 'synthetic-source', 'js/timing.zh.js': 'synthetic-timing' }, L = { total: 2, cues: { a: { id: 'a', silent: false } } }, lang = 'zh', tag = '1080p60';
  const save = (relative, data) => write(f.video, relative, JSON.stringify(data));
  for (const relative of [...artifacts.audioInputs(f.video, p, lang, Object.values(L.cues)), ...artifacts.audioOutputs(p, lang), 'out/zh/video.mp4', ...artifacts.finalFiles(p, lang, tag), ...artifacts.coverFiles(lang)]) write(f.video, relative, 'Synthetic test fixture only');
  save('out/zh/video.json', { schema: 1, lang, fps: 60, scale: 1, width: 1920, height: 1080, frames: 120, total: 2, sources, output: await artifacts.fingerprint(path.join(f.video, 'out/zh/video.mp4')) });
  save('build/audio.zh.json', { schema: 1, lang, sources, config: artifacts.audioConfig(p), inputs: await artifacts.capture(f.video, artifacts.audioInputs(f.video, p, lang, Object.values(L.cues))), outputs: await artifacts.capture(f.video, artifacts.audioOutputs(p, lang)) });
  const loudness = { I: -16, TP: -1.5 };
  const fin = { schema: 2, lang, tag, config: artifacts.finishConfig(p), sources, duration: 2, frames: 120, probe: 'width=1920\nheight=1080\nr_frame_rate=60/1\n', loudness, measurements: Object.fromEntries(artifacts.finalFiles(p, lang, tag).filter((x) => x.endsWith('.mp4')).map((x) => [path.basename(x), loudness])), freezes: [], blank: { blank: [], sparse: [] }, inputs: await artifacts.capture(f.video, artifacts.finishInputs(p, lang)), outputs: await artifacts.capture(f.video, artifacts.finalFiles(p, lang, tag)) };
  save('build/finish.zh.json', fin);
  save('build/covers.zh.json', { schema: 1, lang, sources, outputs: await artifacts.capture(f.video, artifacts.coverFiles(lang)) });
  const check = () => artifacts.deliveryProblems(f.video, p, lang, L, sources);
  assert.deepEqual(await check(), []);
  for (const relative of [artifacts.finalFiles(p, lang, tag)[0], 'audio/zh/cues/a.mp3', artifacts.coverFiles(lang)[0], 'out/zh/video.mp4']) {
    const original = fs.readFileSync(path.join(f.video, relative));
    write(f.video, relative, Buffer.alloc(original.length, 42));
    assert.match((await check()).join(), /不一致/, relative);
    write(f.video, relative, original);
  }
  for (const change of [{ blank: null }, { loudness: { I: null, TP: null } }, { freezes: null }, { schema: 1 }, { measurements: {} }]) {
    save('build/finish.zh.json', { ...fin, ...change });
    assert.ok((await check()).length, JSON.stringify(change));
  }
  save('build/finish.zh.json', fin);
  assert.ok((await artifacts.deliveryProblems(f.video, { ...p, audio: { music: 'none', lufs: -14 } }, lang, L, sources)).length);
  assert.deepEqual(await artifacts.audioProblems(f.video, { ...p, audio: { music: 'none', lufs: -14 } }, lang, Object.values(L.cues), sources), [], '只改封装响度不要求重做混音');
  assert.ok((await artifacts.deliveryProblems(f.video, p, lang, L, { ...sources, 'js/script.js': 'changed' })).length);
  assert.deepEqual(artifacts.sourceChanges({ ...sources, 'js/timing.en.js': 'old' }, { ...sources, 'js/timing.en.js': 'new' }, lang), []);
});

test('新建视频按分组放在 videos/<系列或 standalone>/ 下，署名取自 studio 配置并作为唯一来源；重建不覆盖', t => {
  const f = fixture(t);
  assert.equal(f.project.layout, 2);
  assert.equal(f.project.stage, 'brief');
  assert.equal(f.project.license, 'GPL-3.0-or-later');
  assert.equal(f.project.credits.planner, 'Example Planner');
  assert.equal(f.project.credits.repository, 'https://github.com/example/films');
  assert.deepEqual(f.project.credits.models, []);
  assert.equal(f.project.review.required, true);
  assert.equal(f.project.production, undefined);
  assert.ok(!fs.existsSync(path.join(f.video, 'AGENTS.md')), '每片不再有自己的任务入口');
  assert.ok(fs.readFileSync(path.join(f.video, 'README.md'), 'utf8').startsWith('# 示例'));
  assert.ok(fs.readFileSync(path.join(f.video, 'src/index.html'), 'utf8').includes('示例 &lt;&amp;&gt;'));
  assert.ok(fs.readFileSync(path.join(f.video, 'src/js/scenes/s9_credits.js'), 'utf8').includes('PROJECT'));
  for (const file of ['README.md', 'research/FACTS.md', 'research/MATERIALS.md', 'review/NOTES.md', 'project.json']) assert.doesNotMatch(fs.readFileSync(path.join(f.video, file), 'utf8'), /\{\{[A-Z_]+\}\}|WaterRun|Water-Run\/ft/, file);
  assert.equal(f.catalog().videos[0].status, 'in-progress');
  assert.ok(fs.existsSync(path.join(f.root, 'videos/README.md')), '片单索引随新建生成');
  assert.equal(f.run('timeline', f.video).status, 0);
  assert.equal(f.run('catalog', '--check').status, 0);
  assert.notEqual(f.run('new', 'example').status, 0);
});
test('练习目录不改片单；旧的位置写法、错误 slug、选项和语言在落盘前失败', t => {
  const f = fixture(t), catalog = fs.readFileSync(path.join(f.root, 'videos/catalog.json'), 'utf8');
  assert.equal(f.run('new', 'practice', '--scratch', '--title', '练习').status, 0);
  assert.equal(fs.readFileSync(path.join(f.root, 'videos/catalog.json'), 'utf8'), catalog);
  assert.ok(fs.existsSync(path.join(f.root, 'out/sandbox/practice/project.json')));
  for (const args of [['../escape', '--title', 'X'], ['standalone/bad', '--title', 'X'], ['Bad_Slug', '--title', 'X'], ['bad', '--langs', 'zh,zh', '--title', 'X'], ['bad', '--typo'], ['bad', '--langs', 'fr', '--title', 'X']]) assert.notEqual(f.run('new', ...args).status, 0, args.join(' '));
  assert.ok(!fs.existsSync(path.join(f.root, 'videos/standalone/bad')));
});

test('计划中仅有 README 的目录可重新立项，人工简报原样保留；有其他文件则拒绝覆盖', t => {
  const f = fixture(t), cat = f.catalog();
  cat.videos.push({ slug: 'restart', title: { zh: '重开选题' }, status: 'planned' });
  f.saveCatalog(cat);
  const dir = path.join(f.root, 'videos/standalone/restart'), brief = '# 重开选题\n\n## 简报\n\n> 这是测试策划者要求保留的原话。\n';
  write(dir, 'README.md', brief);
  write(dir, 'research/keep.txt', 'not disposable');
  assert.notEqual(f.run('new', 'restart').status, 0);
  assert.equal(fs.readFileSync(path.join(dir, 'research/keep.txt'), 'utf8'), 'not disposable');
  fs.unlinkSync(path.join(dir, 'research/keep.txt'));
  fs.rmdirSync(path.join(dir, 'research'));
  const result = f.run('new', 'restart');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(fs.readFileSync(path.join(dir, 'README.md'), 'utf8'), brief);
  assert.ok(fs.existsSync(path.join(dir, 'src/js/script.js')));
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'project.json'), 'utf8')).stage, 'brief');
  assert.equal(f.catalog().videos.find((v) => v.slug === 'restart').status, 'in-progress');
  assert.notEqual(f.run('new', 'restart').status, 0);
  assert.equal(f.run('catalog', '--check').status, 0);
});
test('片单：slug 全仓库唯一，目录名与 project.json 一致，署名不能写客户端名', t => {
  const f = fixture(t), cat = f.catalog();
  cat.series.push({ slug: 'one', title: { zh: '一' } }, { slug: 'two', title: { zh: '二' } });
  cat.videos.push({ slug: 'dup', series: 'one', title: { zh: '甲' } }, { slug: 'dup', series: 'two', title: { zh: '乙' } });
  f.saveCatalog(cat);
  assert.match(f.run('catalog', '--check').stderr, /slug 重复/);
  cat.videos.splice(-2); f.saveCatalog(cat);
  const file = path.join(f.video, 'project.json'), project = JSON.parse(fs.readFileSync(file, 'utf8'));
  fs.writeFileSync(file, JSON.stringify({ ...project, credits: { ...project.credits, models: [{ name: 'Codex', roles: ['取证'] }] } }));
  assert.match(f.run('catalog', '--check').stderr, /不是模型的真实名称/);
  fs.writeFileSync(file, JSON.stringify({ ...project, credits: { ...project.credits, models: [{ name: 'Claude Opus 5.5', roles: ['制作'] }] } }));
  assert.equal(f.run('catalog').status, 0);
  fs.writeFileSync(file, JSON.stringify({ ...project, slug: 'other' }));
  assert.match(f.run('catalog', '--check').stderr, /与目录名不一致/);
  fs.writeFileSync(file, JSON.stringify(project));
  fs.mkdirSync(path.join(f.root, 'videos/standalone/stray'));
  assert.match(f.run('catalog', '--check').stderr, /不在片单里/);
  fs.rmdirSync(path.join(f.root, 'videos/standalone/stray'));
  fs.mkdirSync(path.join(f.root, 'videos/unknown-group'));
  assert.match(f.run('catalog', '--check').stderr, /既不是片单里的系列/);
});
test('片单时长四舍五入后正确跨分钟进位', t => {
  const f = fixture(t), cat = f.catalog();
  cat.videos[0].status = 'delivered';
  f.saveCatalog(cat);
  for (const [zh, en, expected] of [[59.49, 59.5, 'zh 0:59、en 1:00'], [299.96, 3600, 'zh 5:00、en 60:00']]) {
    write(f.video, 'project.json', JSON.stringify({ ...f.project, stage: 'delivered', delivery: { date: '2026-10-22', duration: { zh, en } } }));
    const result = f.run('catalog');
    assert.equal(result.status, 0, result.stderr);
    assert.ok(fs.readFileSync(path.join(f.root, 'videos/README.md'), 'utf8').includes(`| ${expected} |`), expected);
  }
});

test('片单状态跟着当前版本：已成片与已交付、已发布的阶段互相对应；已放弃的单列', t => {
  const f = fixture(t), cat = f.catalog(), file = path.join(f.video, 'project.json');
  cat.videos[0].status = 'delivered'; f.saveCatalog(cat);
  assert.match(f.run('catalog', '--check').stderr, /片单是「已成片」，project\.json 的阶段却是「立项」/);
  write(f.video, 'project.json', JSON.stringify({ ...f.project, stage: 'released' }));
  cat.videos[0].status = 'in-progress'; f.saveCatalog(cat);
  assert.match(f.run('catalog', '--check').stderr, /片单是「制作中」，project\.json 的阶段却是「已发布」/);
  write(f.video, 'project.json', JSON.stringify({ ...f.project, stage: 'preview' }));
  assert.equal(f.run('catalog').status, 0);
  assert.match(fs.readFileSync(path.join(f.root, 'videos/README.md'), 'utf8'), /\| 预览迭代 \|/);
  cat.videos[0].status = 'abandoned'; cat.videos[0].note = '策划者决定不再制作'; f.saveCatalog(cat);
  assert.equal(f.run('catalog').status, 0, fs.readFileSync(file, 'utf8'));
  const index = fs.readFileSync(path.join(f.root, 'videos/README.md'), 'utf8');
  assert.match(index, /已放弃 1/);
  assert.match(index, /## 已放弃[\s\S]*策划者决定不再制作/);
  assert.doesNotMatch(index.split('## 已放弃')[0].split('## 制作中')[1], /示例/);
});

test('Markdown 写法：中文标点紧贴 ** 配不成对、表格格数不齐、标题缺空格都报出；正常写法不报', () => {
  const { markdownStyleProblems: md } = require('../tools/repo-check');
  for (const ok of ['正常 **加粗**，好。', '（**括号里**）也好', '- **列表项。** 说明', '**核心**（规则本身）', '`a**b` 在代码里', '转义 \\*\\* 不算', '```\n**代码块**的\n```', '| a | b |\n|---|---|\n| `x\\|y` | 2 |'])
    assert.deepEqual(md(ok), [], ok);
  assert.match(md('看**「片单」**的')[0], /配不成对/);
  assert.match(md('写在 **`code`**的')[0], /没有配对|配不成对/);
  assert.match(md('| a | b |\n|---|---|\n| 1 | 2 | 3 |')[0], /3 格，表头是 2 格/);
  assert.match(md('| a | b |\n|---|---|\n| `x|y` | 2 |')[0], /3 格，表头是 2 格/);
  assert.match(md('##标题')[0], /缺空格/);
});

test('交付署名拒绝漏填、占位、简称、客户端及空分工；服务可以注明模型未披露', () => {
  const p = { languages: ['zh', 'en'], credits: { planner: 'Example Planner', repository: 'https://github.com/example/films', models: [{ name: 'GPT-6.1 Sol', roles: [{ zh: '取证', en: 'Research' }] }], services: [{ name: '语音服务（模型未披露）', roles: ['配音'] }] } };
  const check = (project) => credits.problems(project, 'project.json', { final: true });
  assert.deepEqual(check(p), []);
  for (const planner of ['WaterRun', '山间笔记', 'Unknown']) assert.deepEqual(check({ ...p, credits: { ...p.credits, planner } }), [], '人的公开署名由本人选择，不套用模型名称检查');
  assert.ok(check({ ...p, license: 'Proprietary' }).some((x) => /GPL-3.0-or-later/.test(x)));
  for (const name of ['未记录', 'GPT-6（型号未记录）', '型号未记录（经 Codex 客户端）', '待确认', 'Unknown', 'TBD', '6.1Sol', 'Codex', 'GPT6']) {
    assert.ok(check({ ...p, credits: { ...p.credits, models: [{ name, roles: ['取证'] }] } }).length, name);
  }
  for (const change of [{ models: [] }, { planner: '' }, { repository: '' }, { repository: 'github.com/example/films' }, { models: null }, { services: {} }, { models: [null] }, { models: [{ name: 'GPT-6.1 Sol', roles: [''] }] }, { models: [{ name: 'GPT-6.1 Sol', roles: [{}] }] }]) assert.ok(check({ ...p, credits: { ...p.credits, ...change } }).length, JSON.stringify(change));
  assert.ok(check({}).length);
  assert.deepEqual(credits.problems({ credits: { models: [{ name: '未记录', roles: ['取证'] }] } }), [], '历史记录和草稿仍可如实保留缺口');
});

test('check --final 在新旧目录都先拦住署名缺口，不启动媒体检查', t => {
  const f = fixture(t);
  for (const layout of [undefined, 2]) for (const models of [[], [{ name: '未记录', roles: ['文案'] }]]) {
    write(f.video, 'project.json', JSON.stringify({ ...f.project, layout, credits: { ...f.project.credits, models } }));
    const r = f.run('check', f.video, '--final');
    assert.equal(r.status, 1, r.stderr);
    assert.match(r.stderr, /署名登记/);
    assert.doesNotMatch(r.stderr, /文案校对|Chrome|浏览器/);
    assert.ok(!fs.existsSync(path.join(f.video, '.ft-work.lock')));
  }
});

test('片尾核对分工、开源标记及完整可见的名字，不能用被裁文字或字幕充数', () => {
  const p = { credits: { planner: 'Example Planner', models: [{ name: 'GPT-6.1 Sol', roles: [{ zh: '取证', en: 'Research' }] }], services: [], repository: 'https://github.com/example/films' } };
  const texts = ['Planning', 'Example Planner', 'GPT-6.1 Sol', 'Research', 'Open-source video', 'GPL-3.0-or-later', 'github.com/example/films'];
  const frame = texts.map((text) => ({ k: 'text', text, op: 1, x: 100, y: 100, w: 400, h: 30, cut: '' }));
  assert.deepEqual(credits.screenProblems(p, 'en', [frame]), []);
  assert.match(credits.screenProblems(p, 'en', [frame.filter((x) => x.text !== 'Research')]).join(), /Research/);
  assert.match(credits.screenProblems(p, 'en', [frame.filter((x) => x.text !== 'Open-source video')]).join(), /Open-source video/);
  assert.match(credits.screenProblems(p, 'en', [frame.filter((x) => x.text !== 'GPL-3.0-or-later')]).join(), /GPL-3.0-or-later/);
  for (const change of [{ cut: 'R' }, { x: -5 }, { x: 1800 }, { y: 1070 }, { op: 0.2 }, { k: 'cap' }]) {
    const hidden = frame.map((x) => x.text === 'GPT-6.1 Sol' ? { ...x, ...change } : x);
    assert.match(credits.screenProblems(p, 'en', [hidden]).join(), /GPT-6.1 Sol/, JSON.stringify(change));
  }
  assert.deepEqual(credits.cueProblems([{ cues: [['c', null, { credits: true, pause: 8 }]] }]), []);
  for (const cue of [['c', 'Narration', { credits: true, pause: 8 }], ['c', null, { credits: true, pause: 0 }], ['c', null, { credits: true, pause: 8, tts: 'Spoken' }], ['c', null, { pause: 8 }]]) assert.ok(credits.cueProblems([{ cues: [cue] }]).length);
});

test('Credit 盘点覆盖在制与发布名单，检查生成物过期，保留历史署名不回写', t => {
  const f = fixture(t);
  const p = { ...f.project, stage: 'released', credits: { ...f.project.credits, models: [{ name: '未记录', roles: ['文案'] }] } };
  write(f.video, 'project.json', JSON.stringify(p));
  const cat = f.catalog(); cat.videos[0].status = 'delivered'; f.saveCatalog(cat);
  const before = fs.readFileSync(path.join(f.video, 'project.json'), 'utf8');
  assert.equal(f.run('catalog').status, 0);
  const file = path.join(f.root, 'videos/CREDITS.md'), report = fs.readFileSync(file, 'utf8');
  assert.match(report, /已发布（冻结）/);
  assert.match(report, /未记录：文案/);
  assert.match(report, /真实型号未完整登记/);
  assert.equal(fs.readFileSync(path.join(f.video, 'project.json'), 'utf8'), before);
  fs.writeFileSync(file, 'stale');
  assert.match(f.run('catalog', '--check').stderr, /videos\/CREDITS.md/);
  write(f.video, 'project.json', JSON.stringify({ ...p, stage: 'script', credits: { ...p.credits, models: [{ name: 'GPT-6.1 Sol', roles: ['取证'] }] } }));
  cat.videos[0].status = 'in-progress'; f.saveCatalog(cat);
  assert.equal(f.run('catalog').status, 0);
  assert.match(fs.readFileSync(file, 'utf8'), /GPT-6.1 Sol：取证/);
  assert.match(fs.readFileSync(path.join(f.root, 'videos/README.md'), 'utf8'), /GPT-6.1 Sol/);
  assert.equal(f.run('catalog', '--check').status, 0);
});

test('旧目录也将 Credit 纳入渲染快照，修改型号或分工都会让快照变化', t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.root, 'kit/tools/test-source-state.js'), "console.log(JSON.stringify(require('./lib').sourceState()))");
  const p = { ...f.project, layout: undefined, credits: { ...f.project.credits, models: [{ name: 'GPT-6.1 Sol', roles: ['取证'] }] } };
  const state = () => { const r = f.run('test-source-state', f.video); assert.equal(r.status, 0, r.stderr); return JSON.parse(r.stdout); };
  write(f.video, 'project.json', JSON.stringify(p));
  const first = state();
  assert.ok(first['../project.json#credits']);
  p.credits.models[0].roles.push('文案');
  write(f.video, 'project.json', JSON.stringify(p));
  assert.notEqual(first['../project.json#credits'], state()['../project.json#credits']);
  const second = state();
  p.stage = 'accept';
  write(f.video, 'project.json', JSON.stringify(p));
  assert.deepEqual(state(), second, '只更新流程状态不会让成片过期');
});

test('语言按「条目 ＞ 系列 ＞ 只做中文」继承；与系列相同的条目语言被拒绝', t => {
  const f = fixture(t);
  const solo = f.run('new', 'solo', '--title', '独立的一部');
  assert.equal(solo.status, 0, solo.stderr);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.root, 'videos/standalone/solo/project.json'))).languages, ['zh'], '没有系列也没写语言时只做中文');
  const cat = f.catalog();
  cat.series.push({ slug: 'zh-only', title: { zh: '只做中文的系列' }, languages: ['zh'] });
  f.saveCatalog(cat);
  assert.equal(f.run('new', 'episode', '--series', 'zh-only', '--title', '一集').status, 0);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.root, 'videos/zh-only/episode/project.json'))).languages, ['zh']);
  assert.equal(f.catalog().videos.find(v => v.slug === 'episode').languages, undefined, '与系列相同就不写在条目上');
  assert.equal(f.run('new', 'bilingual', '--series', 'zh-only', '--title', '双语的一集', '--langs', 'zh,en').status, 0);
  assert.deepEqual(f.catalog().videos.find(v => v.slug === 'bilingual').languages, ['zh', 'en']);
  const again = f.catalog(); again.videos.find(v => v.slug === 'episode').languages = ['zh']; f.saveCatalog(again);
  assert.match(f.run('catalog', '--check').stderr, /与系列的缺省相同/);
});
test('交接检查要求事实、简报、交接说明与有效的文案确认', t => {
  const f = fixture(t);
  const result = f.run('check', f.video, '--handoff');
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /FACTS/);
  assert.match(result.stdout, /简报/);
  assert.match(result.stdout, /交接/);
  const mixed = f.run('check', f.video, '--handoff', '--final');
  assert.equal(mixed.status, 2);
  assert.match(mixed.stderr, /不能同时使用/);
});

test('新版交接看已填写的事实记录，不因文档短拒绝，也不因占位说明长就放行', t => {
  const f = fixture(t);
  approve(f);
  write(f.video, 'project.json', JSON.stringify({ ...f.project, check: { ...f.project.check, duration: [1, 60] } }));
  write(f.video, 'README.md', '# 测试项目\n\n## 简报\n\n核心问题：测试交接文件检查。逐章答案、时长与语言见测试配置。\n\n## 交接\n\n已完成合成测试资料，实际影片不使用这些记录。\n');
  write(f.video, 'research/FACTS.md', '# 说明\n' + '这是一段没有出处与核查状态的说明。'.repeat(100));
  assert.notEqual(f.run('check', f.video, '--handoff').status, 0);
  write(f.video, 'research/FACTS.md', '# 合成测试证据\n\n| 陈述 | 原始出处与定位 | 核查状态 |\n|---|---|---|\n| 测试值为 1 | 本测试中的固定输入 | 已核（仅测试夹具） |\n');
  const result = f.run('check', f.video, '--handoff');
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
test('系列栏目可含引号，起点保留二进制字节，不能带入某一集的记录', t => {
  const f = fixture(t), cat = f.catalog();
  cat.series.push({ slug: 'example-series', title: { zh: '示例系列' }, starter: 'example', sections: [{ id: 'mechanism', zh: '机制的“解释”', en: "What's inside" }] });
  f.saveCatalog(cat);
  const starter = path.join(f.root, 'kit/starters/example');
  const binary = Buffer.from([0, 255, 128, 192, 17, 39]);
  write(starter, 'src/images/sample.bin', binary);
  write(starter, 'README.md', '起点说明，不得覆盖本片 README');
  const result = f.run('new', 'first', '--series', 'example-series', '--title', '第一集', '--langs', 'zh,en');
  assert.equal(result.status, 0, result.stderr);
  const video = path.join(f.root, 'videos/example-series/first');
  assert.deepEqual(fs.readFileSync(path.join(video, 'src/images/sample.bin')), binary);
  assert.ok(fs.readFileSync(path.join(video, 'README.md'), 'utf8').startsWith('# 第一集'));
  assert.ok(fs.readFileSync(path.join(video, 'README.md'), 'utf8').includes('](../README.md)'), '本片 README 链到系列说明');
  assert.equal(f.catalog().videos.find(v => v.slug === 'first').series, 'example-series');
  assert.ok(fs.readFileSync(path.join(f.root, 'videos/example-series/README.md'), 'utf8').includes('](first/)'), '系列说明的分集表链到本集');
  assert.equal(f.run('timeline', video, '--lang', 'en').status, 0);
  write(starter, 'review/approval.json', '{}');
  assert.notEqual(f.run('new', 'second', '--series', 'example-series', '--title', '第二集').status, 0);
  assert.ok(!fs.existsSync(path.join(f.root, 'videos/example-series/second')));
});
test('起点带 project.json 与 tools/ 时一并继承，本片的身份字段随后覆盖', t => {
  const f = fixture(t), cat = f.catalog();
  cat.series.push({ slug: 'base-series', title: { zh: '起点系列' }, starter: 'base' });
  f.saveCatalog(cat);
  const starter = path.join(f.root, 'kit/starters/base');
  write(starter, 'src/css/style.css', '/* 起点样式 */');
  write(starter, 'project.json', JSON.stringify({ slug: '{{SLUG}}', production: { mode: 'self' }, check: { still_seconds: 1.25 }, audio: { music: 'tools/music.py' } }, null, 2));
  write(starter, 'tools/music.py', '# 起点配乐\n');
  const result = f.run('new', 'one', '--series', 'base-series', '--title', '一集');
  assert.equal(result.status, 0, result.stderr);
  const video = path.join(f.root, 'videos/base-series/one');
  const project = JSON.parse(fs.readFileSync(path.join(video, 'project.json'), 'utf8'));
  assert.equal(project.slug, 'one');
  assert.equal(project.check.still_seconds, 1.25, '起点的检查阈值应保留');
  assert.equal(project.audio.music, 'tools/music.py');
  assert.equal(project.production, undefined, '旧字段不带进新片');
  assert.equal(project.credits.planner, 'Example Planner');
  assert.ok(fs.existsSync(path.join(video, 'tools/music.py')));
  write(starter, 'research/FACTS.md', '某一集的事实记录');
  assert.notEqual(f.run('new', 'two', '--series', 'base-series', '--title', '二集').status, 0);
  assert.ok(!fs.existsSync(path.join(f.root, 'videos/base-series/two')));
});
test('未确认文案阻止配音和下游写入，先于浏览器、Python 与网络调用', t => {
  const f = fixture(t);
  for (const tool of ['tts', 'tts_probe', 'audio', 'render', 'preview', 'finish', 'covers', 'check']) {
    const result = f.run(tool, f.video, '--lang', 'zh');
    assert.notEqual(result.status, 0, tool);
    assert.match(result.stderr, /文案校对/, tool + ': ' + result.stderr);
  }
  assert.ok(!fs.existsSync(path.join(f.video, 'audio')));
  assert.ok(!fs.existsSync(path.join(f.video, 'out')));
  assert.ok(!fs.existsSync(path.join(f.video, '.ft-work.lock')));
});
test('交审稿逐句导出，保持旧确认；文字改后失效，纯停顿与读法调整保持确认', t => {
  const f = fixture(t);
  assert.equal(f.run('script-review', f.video, 'export', '--lang', 'all').status, 0);
  assert.equal(review.status(f.video, f.project, ['zh']).ok, false);
  const first = approve(f), script = path.join(f.video, 'src/js/script.js');
  assert.equal(review.status(f.video, f.project, ['zh']).ok, true);
  assert.equal(review.status(f.video, f.project).ok, false, '英文未确认');
  fs.writeFileSync(script, fs.readFileSync(script, 'utf8').replace('gap: 0.4', 'gap: 0.8').replace("'S A Y'", "'say'"));
  assert.equal(review.snapshot(f.video, f.project, 'zh').hash, first.hash);
  fs.writeFileSync(script, fs.readFileSync(script, 'utf8').replace('这是第一句旁白', '这是修改后的旁白'));
  assert.equal(review.status(f.video, f.project, ['zh']).ok, false);
  assert.equal(f.run('script-review', f.video, 'export').status, 0);
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.video, 'review/approval.json'))).languages.zh.content_sha256, first.hash);
  assert.equal(fs.readdirSync(path.join(f.video, 'review')).filter(name => /^script\.zh\./.test(name)).length, 2);
});

test('交审先给连贯阅读再给逐句表，静默 cue 不进正文，重导不覆盖历史稿', t => {
  const f = fixture(t), before = review.snapshot(f.video, f.project, 'zh');
  assert.equal(f.run('script-review', f.video, 'export', '--lang', 'zh').status, 0);
  const file = path.join(f.video, 'review', `script.zh.${before.hash}.md`), text = fs.readFileSync(file, 'utf8');
  assert.ok(text.indexOf('## 连贯阅读') < text.indexOf('## 逐句校对'));
  const prose = text.split('## 连贯阅读')[1].split('## 逐句校对')[0];
  assert.match(prose, /这是第一句旁白，画面随它出现 动画的时间点，取自某个\*词\*被读到的时刻/);
  assert.doesNotMatch(prose, /无旁白；画面停留|### credits/);
  assert.match(text.split('## 逐句校对')[1], /\| o1 \|/);
  assert.equal(review.snapshot(f.video, f.project, 'zh').hash, before.hash);
  assert.equal(f.run('script-review', f.video, 'export', '--lang', 'zh').status, 0);
  assert.equal(fs.readFileSync(file, 'utf8'), text);
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.video, 'review/approval.json'), 'utf8')).languages.zh.status, 'pending');
});

test('仓库检查拦截失效 npm 入口，包括 node --test 后的测试文件', t => {
  const f = fixture(t), { commandProblems } = require('../tools/repo-check');
  assert.deepEqual(commandProblems({ scripts: { new: 'node kit/tools/new.js' } }, f.root), []);
  const errors = commandProblems({ scripts: { feedback: 'node kit/tools/feedback.js', test: 'node --test kit/tests/missing.test.js' } }, f.root);
  assert.equal(errors.length, 2);
  assert.match(errors[0], /feedback.js/);
  assert.match(errors[1], /missing.test.js/);
});

test('共享文档章节检查支持中文、重复标题和显式锚点，忽略代码中的假标题', () => {
  const { markdownAnchors } = require('../tools/repo-check');
  const anchors = markdownAnchors('# 文档\n## 6.2 事实\n## 重复\n## 重复\n```md\n## 代码里的假标题\n```\n<a id="manual"></a>\n');
  assert.deepEqual([...anchors], ['文档', '62-事实', '重复', '重复-1', 'manual']);
  assert.ok(!anchors.has('51-事实'));
});
test('确认者、日期、依据、标题及重复句号都被校验；旧项目不伪造批准', t => {
  const f = fixture(t); approve(f);
  const file = path.join(f.video, 'review/approval.json'), valid = JSON.parse(fs.readFileSync(file));
  for (const [key, value] of [['reviewer', 'Wrong Reviewer'], ['confirmed_at', 'today'], ['evidence', '']]) {
    const data = structuredClone(valid); data.languages.zh[key] = value; fs.writeFileSync(file, JSON.stringify(data));
    assert.equal(review.status(f.video, f.project, ['zh']).ok, false);
  }
  fs.writeFileSync(file, JSON.stringify(valid));
  assert.equal(review.status(f.video, { ...f.project, titles: { zh: 'Changed' } }, ['zh']).ok, false);
  assert.equal(review.status(f.video, { ...f.project, review: undefined }).ok, false, '新版项目不能删除 review 绕过确认');
  assert.equal(review.status(f.video, { ...f.project, layout: undefined, review: undefined }).legacy, true);
  assert.equal(review.status(f.video, { ...f.project, review: { required: false } }, ['zh']).ok, false);
  const script = path.join(f.video, 'src/js/script.js');
  fs.writeFileSync(script, fs.readFileSync(script, 'utf8').replace("['o2',", "['o1',"));
  assert.throws(() => review.snapshot(f.video, f.project, 'zh'), /句号重复/);
});
test('清理只预览；执行先校验完整归档，源码与取证留存，可从归档恢复', async t => {
  const f = fixture(t);
  write(f.video, 'out/film.mp4', 'finished media');
  write(f.video, 'audio/zh/cues/o1.mp3', 'voice cache');
  write(f.video, 'build/finish.zh.json', '{}');
  write(f.video, 'shots/review.png', 'review evidence');
  write(f.video, 'research/lab/evidence.txt', 'public evidence');
  write(f.video, 'research/_src/vendor.bin', 'external source');
  assert.equal(f.run('clean', f.video).status, 0);
  assert.ok(fs.existsSync(path.join(f.video, 'out/film.mp4')));
  assert.notEqual(f.run('clean', f.video, '--apply').status, 0);
  const result = f.run('clean', f.video, '--archive', f.archive, '--apply');
  assert.equal(result.status, 0, result.stderr);
  const manifest = await verify(f.archive);
  assert.ok(manifest.files.some(file => file.path === 'video/build/finish.zh.json'));
  assert.ok(!manifest.files.some(file => file.path.includes('_src') || file.path.includes('.ft-work.lock')));
  assert.ok(!fs.existsSync(path.join(f.video, 'out')));
  assert.ok(fs.existsSync(path.join(f.video, 'src/js/script.js')));
  assert.ok(fs.existsSync(path.join(f.video, 'research/lab/evidence.txt')));
  fs.cpSync(path.join(f.archive, 'video/audio'), path.join(f.video, 'audio'), { recursive: true });
  assert.equal(fs.readFileSync(path.join(f.video, 'audio/zh/cues/o1.mp3'), 'utf8'), 'voice cache');
  write(path.join(f.archive, 'video'), 'out/film.mp4', 'corrupted');
  await assert.rejects(verify(f.archive), /归档校验失败/);
});
test('仓库内归档、已有归档、已跟踪生成物及根目录清理均拒绝', t => {
  const f = fixture(t); write(f.video, 'out/film.mp4');
  for (const target of [f.root, path.join(f.root, 'archive'), path.dirname(f.root)]) assert.notEqual(f.run('clean', f.video, '--archive', target, '--apply').status, 0);
  fs.mkdirSync(f.archive);
  assert.notEqual(f.run('clean', f.video, '--archive', f.archive, '--apply').status, 0);
  assert.notEqual(f.run('clean', f.root, '--archive', f.archive, '--apply').status, 0);
  execFileSync('git', ['add', '-f', 'videos/standalone/example/out/film.mp4'], { cwd: f.root });
  assert.notEqual(f.run('clean', f.video).status, 0);
  assert.ok(fs.existsSync(path.join(f.video, 'out/film.mp4')));
});
test('生成物根位置是普通文件时拒绝清理', t => {
  const f = fixture(t); write(f.video, 'out', 'source-like file');
  assert.notEqual(f.run('clean', f.video, '--archive', f.archive, '--apply').status, 0);
  assert.equal(fs.readFileSync(path.join(f.video, 'out'), 'utf8'), 'source-like file');
});
test('清理拒绝输出目录中的符号链接或 junction', t => {
  const f = fixture(t), external = path.join(path.dirname(f.root), 'external');
  fs.mkdirSync(external); write(external, 'keep.txt', 'keep');
  fs.symlinkSync(external, path.join(f.video, 'out'), process.platform === 'win32' ? 'junction' : 'dir');
  const result = f.run('clean', f.video, '--archive', f.archive, '--apply');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /符号链接|junction/);
  assert.equal(fs.readFileSync(path.join(external, 'keep.txt'), 'utf8'), 'keep');
});
test('制作锁阻止第二个写入者，子工具可复用锁，退出后释放', t => {
  const f = fixture(t), lock = path.join(f.video, '.ft-work.lock');
  fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, token: 'occupied', video: f.video }));
  assert.match(f.run('clean', f.video, '--archive', f.archive, '--apply').stderr, /制作锁/);
  assert.match(f.run('tts', f.video).stderr, /制作锁/);
  fs.unlinkSync(lock);
  const modulePath = path.join(f.root, 'kit/tools/project-files.js');
  const child = `require(${JSON.stringify(modulePath)}).acquireLock(${JSON.stringify(f.video)});`;
  const parent = child + `require('node:child_process').execFileSync(process.execPath, ['-e', ${JSON.stringify(child)}]);`;
  const result = spawnSync(process.execPath, ['-e', parent], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(!fs.existsSync(lock));
});
test('归档清单不能指向上级路径', async t => {
  const f = fixture(t); fs.mkdirSync(f.archive);
  write(f.archive, 'manifest.json', JSON.stringify({ schema: 1, files: [{ path: 'video/../../escape', bytes: 1, sha256: '0'.repeat(64) }] }));
  await assert.rejects(verify(f.archive), /越界|非法/);
});

test('新片自动带入全部经验规则；制作期不拦配音，交付前每条都要有结论', t => {
  const f = fixture(t), lessons = lessonsIn(f.root), data = lessons.registry(f.root);
  const rec = JSON.parse(fs.readFileSync(path.join(f.video, 'review/lessons.json')));
  assert.deepEqual(Object.keys(rec.items), data.rules.map(rule => rule.id));
  assert.equal(rec.version, data.version);
  assert.equal(lessons.status(f.video, f.project, {}, data).ok, true);
  const final = lessons.status(f.video, f.project, { final: true }, data);
  assert.equal(final.ok, false);
  assert.match(final.problems.join(' '), /还没有结论/);
  fs.rmSync(path.join(f.video, 'review/lessons.json'));
  assert.equal(lessons.status(f.video, f.project, {}, data).ok, false, '新片删掉记录不能绕过');
  assert.equal(lessons.status(f.video, { ...f.project, layout: undefined }, {}, data).legacy, true);
});
test('规则的要求改变（rev）或新增时，在制片待复核、下一部新片自动带入；改措辞不影响', t => {
  const f = fixture(t), lessons = lessonsIn(f.root);
  const file = path.join(f.root, 'docs/lessons.json'), data = JSON.parse(fs.readFileSync(file));
  data.version = 'test-wording'; data.rules[0].rule += '（措辞调整）';
  fs.writeFileSync(file, JSON.stringify(data));
  assert.equal(f.run('lessons', f.video, 'sync').status, 0);
  let rec = JSON.parse(fs.readFileSync(path.join(f.video, 'review/lessons.json')));
  assert.equal(rec.history.length, 0, '只改措辞不重置结论');
  data.version = 'test-next'; data.rules[0].rev += 1;
  data.rules.push({ id: 'F99', rev: 1, stages: ['script'], title: '测试新增规则', rule: '测试要求', check: '测试检查' });
  fs.writeFileSync(file, JSON.stringify(data));
  const stale = lessons.status(f.video, f.project, {}, lessons.registry(f.root));
  assert.equal(stale.ok, false);
  assert.equal(f.run('lessons', f.video, 'sync').status, 0);
  rec = JSON.parse(fs.readFileSync(path.join(f.video, 'review/lessons.json')));
  assert.ok(rec.history.some(record => record.id === data.rules[0].id));
  assert.equal(rec.items[data.rules[0].id].result, 'pending');
  assert.ok(rec.items.F99);
  assert.equal(f.run('new', 'next', '--title', '下一部测试片').status, 0);
  assert.ok(JSON.parse(fs.readFileSync(path.join(f.root, 'videos/standalone/next/review/lessons.json'))).items.F99);
});
test('交付前的结论：pass 要证据，n/a 要理由，open 要说明并在交付时列出', t => {
  const f = fixture(t), lessons = lessonsIn(f.root), data = lessons.registry(f.root);
  const file = path.join(f.video, 'review/lessons.json'), rec = JSON.parse(fs.readFileSync(file));
  for (const id of Object.keys(rec.items)) Object.assign(rec.items[id], { result: 'n/a', note: '隔离测试的虚构输入，不代表影片审核' });
  const [a, b] = Object.keys(rec.items);
  Object.assign(rec.items[a], { result: 'pass', evidence: '' });
  fs.writeFileSync(file, JSON.stringify(rec));
  assert.equal(lessons.status(f.video, f.project, { final: true }, data).ok, false);
  rec.items[a].evidence = 'zh 0:10–0:20 连续观看（测试）';
  Object.assign(rec.items[b], { result: 'open', note: '测试：已知未解决的问题' });
  fs.writeFileSync(file, JSON.stringify(rec));
  const result = lessons.status(f.video, f.project, { final: true }, data);
  assert.equal(result.ok, true, result.problems.join('\n'));
  assert.equal(result.open.length, 1);
});
test('片尾署名只允许静默时间线，不允许字幕或 tts 混入旁白', t => {
  const f = fixture(t), file = path.join(f.video, 'src/js/script.js');
  const original = fs.readFileSync(file, 'utf8');
  assert.equal(review.snapshot(f.video, f.project, 'zh').estimate.cues.credits.silent, true, '模板自带静默的片尾 cue');
  const silent = original.replace("['oT', null, { pause: 2.0 }]", "['oT', null, { pause: 2.0, credits: true }]");
  fs.writeFileSync(file, silent);
  const snapshot = review.snapshot(f.video, f.project, 'zh');
  assert.equal(snapshot.estimate.cues.oT.silent, true);
  assert.equal(snapshot.estimate.cues.oT.tts, null);
  fs.writeFileSync(file, silent.replace("['oT', null,", "['oT', { zh: '片尾制作说明', en: 'Credits instruction' },"));
  assert.throws(() => review.snapshot(f.video, f.project, 'zh'), /片尾署名须为无旁白/);
  fs.writeFileSync(file, silent.replace('pause: 2.0, credits: true', "pause: 2.0, credits: true, tts: 'Do not narrate'"));
  assert.throws(() => review.snapshot(f.video, f.project, 'zh'), /片尾署名须为无旁白/);
});
test('配音引擎按 project.json 的 tts 块逐语言选择；没有 tts 块时保持 edge-tts', t => {
  const { ttsSpec } = require('../tools/lib');
  const saved = process.env.MINIMAX_API_KEY;
  process.env.MINIMAX_API_KEY = 'test-placeholder';
  t.after(() => { if (saved == null) delete process.env.MINIMAX_API_KEY; else process.env.MINIMAX_API_KEY = saved; });
  const base = { voices: { zh: 'zh-CN-YunyangNeural', en: 'en-US-AndrewNeural' }, rates: { zh: '+0%', en: '+6%' } };
  assert.deepEqual(ttsSpec('en', base).env, { LVS_ENGINE: 'edge', LVS_VOICE: 'en-US-AndrewNeural', LVS_RATE: '+6%' });
  const P = { ...base, tts: { engine: { zh: 'minimax', en: 'edge' }, model: 'speech-2.8-hd', voice: { zh: 'v-zh' }, speed: { zh: 0.97 } } };
  const zh = ttsSpec('zh', P);
  assert.equal(zh.engine, 'minimax');
  assert.equal(zh.env.LVS_VOICE, 'v-zh');
  assert.equal(zh.env.LVS_SPEED, '0.97');
  assert.equal(zh.env.LVS_MODEL, 'speech-2.8-hd');
  assert.equal(ttsSpec('en', P).engine, 'edge');
  assert.throws(() => ttsSpec('zh', { ...base, tts: { engine: 'minimax' } }), /tts\.voice/);
  assert.throws(() => ttsSpec('zh', { ...base, tts: { engine: 'other' } }), /tts\.engine/);
});

test('镜头缩放检查：停留时持续推拉与来回往复报错，两秒内的站间推拉与单向横移不报', () => {
  const { zoomProblems } = require('../tools/inspect');
  const sample = (from, to, z) => { const out = []; for (let t = from; t <= to + 1e-9; t += 0.5) out.push({ t: +t.toFixed(2), z: z(t) }); return out; };
  const kinds = (samples) => zoomProblems(samples).map((p) => p.kind);
  // 每 10 秒推近 4% 再拉回（被退回的写法）
  const breathe = zoomProblems(sample(0, 30, (t) => 1 + 0.02 * (1 - Math.cos(t / 10 * 2 * Math.PI))));
  assert.equal(breathe[0].kind, 'long');
  assert.ok(breathe[0].to - breathe[0].from >= 29 && breathe[0].turns >= 2);
  // 整屏慢推 1 → 1.05
  assert.deepEqual(kinds(sample(0, 12, (t) => 1 + 0.05 * t / 12)), ['long']);
  // 3 秒推近、停 2 秒、3 秒拉回：每段都不到 4 秒，但来回往复
  assert.deepEqual(kinds(sample(0, 12, (t) => (t < 3 ? 1 + 0.01 * t : t < 5 ? 1.03 : t < 8 ? 1.03 - 0.01 * (t - 5) : 1))), ['back']);
  // 站间：1.5 秒推近到 1.2，停 4 秒，1.5 秒拉回
  assert.deepEqual(kinds(sample(0, 12, (t) => (t < 2 ? 1 : t < 3.5 ? 1 + 0.2 * (t - 2) / 1.5 : t < 7.5 ? 1.2 : t < 9 ? 1.2 - 0.2 * (t - 7.5) / 1.5 : 1))), []);
  // 一次 3.5 秒的缓慢推近，不往回：不报（停留时不推近由人看，工具只拦持续与往复）
  assert.deepEqual(kinds(sample(0, 10, (t) => (t < 2 ? 1 : t < 5.5 ? 1 + 0.03 * (t - 2) / 3.5 : 1.03))), []);
  // 只横移：缩放恒定
  assert.deepEqual(kinds(sample(0, 30, () => 0.95)), []);
  // 中间看不见（场景没显示）的时段断开计数
  assert.deepEqual(kinds([...sample(0, 3, (t) => 1 + 0.01 * t), ...sample(10, 13, (t) => 1.03 + 0.01 * (t - 10))]), []);
});

test('术语注解检查：标星号的术语只在第一次出现的那句核对；注解要看得见、不被裁、不压字幕条', () => {
  const { glossTerms, glossShown } = require('../tools/inspect');
  const L = { order: ['a', 'b', 'c', 'd'], cues: {
    a: { cap: '表本身就是一棵*聚簇索引*' }, b: { cap: null, silent: true },
    c: { cap: '*聚簇 索引*之外，还有*二级索引*与*回表*' }, d: { cap: '再说一次*回表*' } } };
  assert.deepEqual([...glossTerms(L)], [['a', ['聚簇索引']], ['c', ['二级索引', '回表']]]);
  const note = { k: 'text', gloss: '回表||覆盖索引', op: 1, x: 100, y: 200, w: 600, h: 40, cut: '', cutByStage: false };
  assert.ok(glossShown([note], '回表'));
  assert.ok(glossShown([note], '覆盖 索引'), '一个注解可写几个术语，比较时忽略空白');
  assert.ok(!glossShown([note], '二级索引'));
  for (const change of [{ op: 0.3 }, { cutByStage: true }, { cut: 'R' }, { y: 950 }, { k: 'cap' }, { gloss: '' }, { w: 0 }]) assert.ok(!glossShown([{ ...note, ...change }], '回表'), JSON.stringify(change));
  assert.ok(glossShown([{ k: 'named', gloss: '二级索引', op: 1, x: 0, y: 300, w: 400, h: 300, cut: 'B', cutByStage: false }], '二级索引'), '装着字的容器也算');
});

test('看画面的收集：注解随显隐与刷出进出，镜头画布量到缩放（最小页面，本机没有 Chrome 时跳过）', async (t) => {
  const exe = require('../tools/lib').chromePath();
  if (!exe) { t.skip('本机没有 Chrome'); return; }
  const puppeteer = require('puppeteer-core');
  const { COLLECT, CAMERAS, glossShown } = require('../tools/inspect');
  const profile = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'ft-inspect-'));
  const browser = await puppeteer.launch({ executablePath: exe, headless: true, userDataDir: profile, args: process.platform === 'win32' ? [] : ['--no-sandbox'] });
  t.after(async () => { await browser.close(); fs.rmSync(profile, { recursive: true, force: true }); });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  const at = (top) => `position:absolute;left:600px;top:${top}px;font-size:30px;white-space:nowrap`;
  await page.setContent(`<body style="margin:0"><div id="stage" style="position:relative;width:1920px;height:1080px;overflow:hidden;background:#fff"><div id="scenes">
    <div class="scene" id="sc-a" style="position:absolute;inset:0">
      <div class="world" style="position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0;transform:translate(960px,540px) scale(1.25) translate(-960px,-540px)">
        <div data-gloss="回表" style="${at(350)}">回表：拿着编号回主键树取整行</div>
        <div data-gloss="覆盖索引" style="${at(420)};opacity:0">覆盖索引：要的列都在索引里</div>
        <div data-gloss="页目录" style="${at(490)};clip-path:inset(0 100% 0 0)">页目录：页尾的一列槽</div>
        <div data-gloss="二级索引" style="${at(560)};width:500px;height:120px"><div>二级索引</div><div>按名字排，叶子里是名字与编号</div></div>
      </div>
    </div>
    <div class="scene" id="sc-b" style="position:absolute;inset:0;display:none"><div class="world" style="transform:scale(2)"></div></div>
    <div class="scene" id="sc-c" style="position:absolute;inset:0"><div data-camera style="position:absolute;transform:matrix(0.95,0,0,0.95,48,27)"></div></div>
  </div><div id="hud"></div><div id="caption"><span></span></div></div></body>`);
  const items = await page.evaluate(COLLECT);
  assert.ok(glossShown(items, '回表'));
  assert.ok(!glossShown(items, '覆盖索引'), '透明的注解不算');
  assert.ok(!glossShown(items, '页目录'), '还没刷出来的注解不算');
  assert.ok(glossShown(items, '二级索引'), '装着几行字的容器也算');
  assert.deepEqual((await page.evaluate(CAMERAS)).map((c) => [c.key, c.z]), [['a#0', 1.25], ['c#0', 0.95]], '没显示的场景不量；makeCamera 标的画布也量');
});

test('中文交审稿附多音字清单：标出位置、读音与已改写的处理；英文稿不附', t => {
  const f = fixture(t), script = path.join(f.video, 'src/js/script.js');
  fs.writeFileSync(script, fs.readFileSync(script, 'utf8')
    .replace("'术语的读法，写进 SAY 表'", "'树再长一层，每一行都重新排'")
    .replace("[/SAY/g, 'S A Y'],", "[/SAY/g, 'S A Y'], [/长一层/g, '涨一层'],"));
  const rows = review.polyphones(review.snapshot(f.video, f.project, 'zh').source), a2 = rows.find((row) => row.id === 'a2');
  assert.deepEqual(a2.hits.map((hit) => [hit.ch, hit.i, hit.changed]), [['长', 2, true], ['行', 8, false], ['重', 10, false]]);
  assert.equal(f.run('script-review', f.video, 'export', '--lang', 'all').status, 0);
  const read = (lang) => fs.readFileSync(path.join(f.video, 'review', `script.${lang}.${review.snapshot(f.video, f.project, lang).hash}.md`), 'utf8');
  const list = read('zh').split('## 多音字清单')[1].split('## 交审核对')[0];
  assert.match(list, /\| a2 \| 树再【长】一层，每一【行】都【重】新排 \| 长 cháng \/ zhǎng；行 xíng \/ háng；重 zhòng \/ chóng \|/);
  assert.match(list, /第 3 字「长」已由 SAY 改写；第 9 字「行」未改写；第 11 字「重」未改写；合成文本「树再涨一层，每一行都重新排。」/);
  assert.match(list, /不是闸门/);
  assert.doesNotMatch(read('en'), /多音字清单/);
});
