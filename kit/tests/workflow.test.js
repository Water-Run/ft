const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync, execFileSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const review = require('../tools/script-review');
const { verify } = require('../tools/clean');

function fixture(t) {
  const temporary = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'ft-workflow-'));
  const root = path.join(temporary, 'repo');
  fs.mkdirSync(root);
  for (const dir of ['tools', 'template', 'engine', 'delegation']) fs.cpSync(path.join(ROOT, 'kit', dir), path.join(root, 'kit', dir), { recursive: true });
  fs.writeFileSync(path.join(root, 'kit/studio.json'), JSON.stringify({ planner: 'Example Planner', reviewer: 'Fixture Reviewer', repository: 'https://github.com/example/films' }));
  fs.mkdirSync(path.join(root, 'videos'));
  fs.mkdirSync(path.join(root, 'docs'));
  fs.writeFileSync(path.join(root, 'videos/catalog.json'), JSON.stringify({ about: 'Test fixture', series: [], standalone: [] }));
  fs.copyFileSync(path.join(ROOT, '.gitignore'), path.join(root, '.gitignore'));
  execFileSync('git', ['init', '--quiet'], { cwd: root });
  const run = (tool, ...args) => spawnSync(process.execPath, [path.join(root, 'kit/tools', tool + '.js'), ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, FT_PROJECT_LOCK: '', PYTHON: 'nonexistent-test-python' }, timeout: 20000 });
  const created = run('new', 'standalone/example', '--title', '示例 <&> "稿本"', '--title-en', 'Example');
  assert.equal(created.status, 0, created.stderr);
  const video = path.join(root, 'videos/standalone/example');
  const project = JSON.parse(fs.readFileSync(path.join(video, 'project.json'), 'utf8'));
  t.after(() => {
    // 只清理由本测试创建并验证过的临时目录。
    assert.ok(path.resolve(temporary).startsWith(fs.realpathSync(os.tmpdir()) + path.sep + 'ft-workflow-'));
    fs.rmSync(temporary, { recursive: true, force: true });
  });
  return { root, video, project, run, archive: path.join(temporary, 'archive') };
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

test('新建视频带真实可配置的署名、校对入口和可执行时间线；重建不覆盖', t => {
  const f = fixture(t);
  assert.equal(f.project.production.planner, 'Example Planner');
  assert.equal(f.project.production.repository, 'https://github.com/example/films');
  assert.equal(f.project.review.required, true);
  assert.ok(fs.readFileSync(path.join(f.video, 'README.md'), 'utf8').includes('Example Planner'));
  assert.ok(fs.readFileSync(path.join(f.video, 'src/index.html'), 'utf8').includes('示例 &lt;&amp;&gt;'));
  assert.equal(f.run('timeline', f.video).status, 0);
  assert.equal(f.run('catalog', '--check').status, 0);
  assert.notEqual(f.run('new', 'standalone/example').status, 0);
});
test('练习目录不改片单；错误 slug、选项和语言在落盘前失败', t => {
  const f = fixture(t), catalog = fs.readFileSync(path.join(f.root, 'videos/catalog.json'), 'utf8');
  assert.equal(f.run('new', 'standalone/practice', '--scratch', '--title', '练习').status, 0);
  assert.equal(fs.readFileSync(path.join(f.root, 'videos/catalog.json'), 'utf8'), catalog);
  assert.ok(fs.existsSync(path.join(f.root, 'out/sandbox/practice/project.json')));
  for (const args of [['standalone/../escape', '--title', 'X'], ['standalone/bad', '--langs', 'zh,zh', '--title', 'X'], ['standalone/bad', '--typo'], ['standalone/bad', '--langs', 'fr', '--title', 'X']]) assert.notEqual(f.run('new', ...args).status, 0);
  assert.ok(!fs.existsSync(path.join(f.root, 'videos/standalone/bad')));
});
test('委托片使用实际配置的校对者与片尾信息，保留独立的任务书', t => {
  const f = fixture(t);
  const result = f.run('new', 'standalone/delegated', '--title', '委托测试', '--delegate', 'Fixture Model');
  assert.equal(result.status, 0, result.stderr);
  const video = path.join(f.root, 'videos/standalone/delegated');
  const entry = fs.readFileSync(path.join(video, 'AGENTS.md'), 'utf8');
  assert.ok(entry.includes('Fixture Reviewer') && entry.includes('Example Planner'));
  assert.ok(entry.includes('github.com/example/films'));
  for (const file of ['AGENTS.md', 'brief/02-script.md', 'brief/06-acceptance.md', 'README.md', 'research/FACTS.md']) assert.doesNotMatch(fs.readFileSync(path.join(video, file), 'utf8'), /\{\{[A-Z_]+\}\}|WaterRun|Water-Run\/ft/);
  assert.ok(fs.existsSync(path.join(video, 'review/NOTES.md')));
});
test('系列栏目可含引号，基座保留二进制字节，不能复制旧确认', t => {
  const f = fixture(t), catalogFile = path.join(f.root, 'videos/catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogFile));
  catalog.series.push({ slug: 'example-series', title: { zh: '示例系列' }, sections: [{ id: 'mechanism', zh: '机制的“解释”', en: "What's inside" }], videos: [] });
  fs.writeFileSync(catalogFile, JSON.stringify(catalog));
  const base = path.join(f.root, 'videos/series/example-series/_base');
  const binary = Buffer.from([0, 255, 128, 192, 17, 39]);
  write(base, 'src/images/sample.bin', binary);
  write(base, 'README.md', '系列基座说明，不得覆盖本片 README');
  const result = f.run('new', 'series/example-series/first', '--title', '第一集');
  assert.equal(result.status, 0, result.stderr);
  const video = path.join(f.root, 'videos/series/example-series/first');
  assert.deepEqual(fs.readFileSync(path.join(video, 'src/images/sample.bin')), binary);
  assert.ok(fs.readFileSync(path.join(video, 'README.md'), 'utf8').startsWith('# 第一集'));
  assert.equal(f.run('timeline', video, '--lang', 'en').status, 0);
  write(base, 'review/approval.json', '{}');
  assert.notEqual(f.run('new', 'series/example-series/second', '--title', '第二集').status, 0);
  assert.ok(!fs.existsSync(path.join(f.root, 'videos/series/example-series/second')));
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
test('确认者、日期、依据、标题及重复句号都被校验；旧项目不伪造批准', t => {
  const f = fixture(t); approve(f);
  const file = path.join(f.video, 'review/approval.json'), valid = JSON.parse(fs.readFileSync(file));
  for (const [key, value] of [['reviewer', 'Wrong Reviewer'], ['confirmed_at', 'today'], ['evidence', '']]) {
    const data = structuredClone(valid); data.languages.zh[key] = value; fs.writeFileSync(file, JSON.stringify(data));
    assert.equal(review.status(f.video, f.project, ['zh']).ok, false);
  }
  fs.writeFileSync(file, JSON.stringify(valid));
  assert.equal(review.status(f.video, { ...f.project, titles: { zh: 'Changed' } }, ['zh']).ok, false);
  assert.equal(review.status(f.video, { ...f.project, review: undefined }).legacy, true);
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
