// 仓库级检查，不启动浏览器、不合成语音、不改文件。控制熵的规则（docs/README.md 第 5 节）能查的都在这里。
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync, execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const errors = [];
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const tracked = git('ls-files', '-z');
const listed = [...new Set(git('ls-files', '-z', '--cached', '--others', '--exclude-standard'))].filter((file) => fs.existsSync(path.join(root, file)));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

// 1. 生成物、本机配置与第三方源码不入库
for (const file of tracked) {
  if (/^(node_modules\/|\.venv\/|kit\/config\.local\.json$|kit\/local\/|assets\/(?!README\.md$))/.test(file) || /^videos\/.*\/(audio|out|shots|build|research\/_src)\//.test(file) || /(^|\/)\.ft-work\.lock$/.test(file)) errors.push('生成物或本机配置已跟踪：' + file);
}

// 2. 根目录只放约定的入口；仓库、系列、视频三级之外不另起目录
const ROOT_ALLOWED = new Set(['.editorconfig', '.gitattributes', '.github', '.gitignore', 'AGENTS.md', 'CONTRIBUTING.md', 'LICENSE', 'README.md', 'SECURITY.md', 'assets', 'docs', 'kit', 'package-lock.json', 'package.json', 'series', 'videos']);
for (const top of new Set(listed.map((file) => file.split('/')[0]))) if (!ROOT_ALLOWED.has(top)) errors.push('根目录多出了 ' + top + '：新东西放进仓库、系列或视频三级之一（docs/README.md）');
if (read('AGENTS.md').split('\n').length > 80) errors.push('AGENTS.md 超过 80 行：入口只写角色、边界与去哪里读，细则放进 docs/');
if (/bilibili\.com\/video|youtube\.com\/watch|youtu\.be\//.test(read('README.md'))) errors.push('根 README 里有某一部片子的发布链接：发布记录只放在该片 project.json 的 release，片单索引会生成');

// 3. 经验规则：规则表合法，文档的规则表与它一致
try {
  const lessons = require('./lessons'), data = lessons.registry(root);
  const doc = read('docs/lessons.md');
  if (lessons.renderDoc(doc, data) !== doc) errors.push('docs/lessons.md 与 docs/lessons.json 不一致；运行 node kit/tools/lessons.js render');
  const log = read('docs/log/feedback.md'), ids = new Set([...log.matchAll(/^\| ([PC]\d+) \|/gm)].map((m) => m[1]));
  for (const r of data.rules) for (const src of r.sources || []) if (!ids.has(src)) errors.push(`经验规则 ${r.id} 的来源 ${src} 不在 docs/log/feedback.md 里`);
} catch (error) { errors.push(error.message); }

// 4. 依赖锁与工具语法
const json = (file) => JSON.parse(read(file));
const pkg = json('package.json'), lock = json('package-lock.json').packages[''];
if (JSON.stringify(pkg.dependencies) !== JSON.stringify(lock.dependencies) || pkg.engines.node !== lock.engines.node) errors.push('package.json 与 package-lock.json 的依赖或 Node 版本不一致');
for (const file of listed.filter((file) => /^kit\/(tools|tests)\/.*\.js$/.test(file))) {
  const result = spawnSync(process.execPath, ['--check', file], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) errors.push(file + '：' + result.stderr.trim());
}

// 5. docs/ 下的每篇文档都在文档地图里登记过（只追加的 docs/log/ 除外）
const map = read('docs/README.md'), mapped = new Set([...map.matchAll(/\]\(([^)#\s]+)/g)].map((m) => path.posix.normalize('docs/' + m[1])));
for (const file of listed.filter((file) => /^docs\/.*\.md$/.test(file) && !file.startsWith('docs/log/') && file !== 'docs/README.md')) if (!mapped.has(file)) errors.push(file + ' 没有登记在 docs/README.md 的「全部文档」里');

// 6. 本地文件链接：根目录、docs/、series/、kit/ 下的说明，以及各片 README
const docs = listed.filter((file) => /^[^/]+\.md$/.test(file) || /^(docs|series)\/.*\.md$/.test(file) || /^kit\/.*\.md$/.test(file) || /^videos\/[^/]+(\/README)?\.md$/.test(file) || /^videos\/[^/]+\/README\.md$/.test(file));
for (const file of docs) {
  const content = read(file).replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  for (const match of content.matchAll(/\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+"[^"]*")?\)/g)) {
    const href = match[1] || match[2];
    if (/^[a-z][a-z0-9+.-]*:|^#|^\/\//i.test(href) || href.includes('{{')) continue;
    const target = decodeURIComponent(href.split('#')[0].split('?')[0]);
    if (target && !fs.existsSync(path.resolve(root, path.dirname(file), target))) errors.push(file + '：文件链接不存在 ' + href);
  }
}

// 7. 新版目录（project.json 的 layout 为 2）的视频只放约定的文件
const VIDEO_ALLOWED = /^(README\.md|project\.json|research|review|src|tools|expect\.[a-z]+\.json|\.gitignore|\.gitattributes)$/;
for (const dir of fs.readdirSync(path.join(root, 'videos'), { withFileTypes: true }).filter((d) => d.isDirectory())) {
  let p; try { p = json(`videos/${dir.name}/project.json`); } catch (error) { continue; }
  if (p.layout >= 2) for (const top of new Set(listed.filter((f) => f.startsWith(`videos/${dir.name}/`)).map((f) => f.split('/')[2]))) if (!VIDEO_ALLOWED.test(top)) errors.push(`videos/${dir.name}/${top}：新版目录不放这类文件（交接写进 README，任务书与交付说明已并入 README）`);
}

// 8. 片单、索引、系列说明与各片署名
const catalog = spawnSync(process.execPath, ['kit/tools/catalog.js', '--check'], { cwd: root, encoding: 'utf8' });
if (catalog.status !== 0) errors.push((catalog.stdout + catalog.stderr).trim());

if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('仓库检查通过：入库边界、根目录、经验规则、依赖锁、工具语法、文档登记与链接、视频目录、片单与署名。');
