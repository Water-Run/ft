// 仓库级检查，不启动浏览器、不合成语音、不改文件。
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync, execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const errors = [];
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const listed = [...new Set(execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean))].filter(file => fs.existsSync(path.join(root, file)));
for (const file of tracked) {
  if (/^(node_modules\/|\.venv\/|kit\/config\.local\.json$|assets\/(?!README\.md$))/.test(file) || /^videos\/.*\/(audio|out|shots|build|research\/_src)\//.test(file) || /(^|\/)\.ft-work\.lock$/.test(file)) errors.push('生成物或本机配置已跟踪：' + file);
}
const json = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const pkg = json('package.json'), lock = json('package-lock.json').packages[''];
if (JSON.stringify(pkg.dependencies) !== JSON.stringify(lock.dependencies) || pkg.engines.node !== lock.engines.node) errors.push('package.json 与 package-lock.json 的依赖或 Node 版本不一致');
for (const file of listed.filter(file => /^kit\/(tools|tests)\/.*\.js$/.test(file))) {
  const result = spawnSync(process.execPath, ['--check', file], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) errors.push(file + '：' + result.stderr.trim());
}
// 维护入口与规范的文件链接；片内历史取证、网页和锚点由各片审查，不假称网络已核查。
const docs = listed.filter(file => /^[^/]+\.md$/.test(file) || /^docs\/[^/]+\.md$/.test(file));
for (const file of docs) {
  const content = fs.readFileSync(path.join(root, file), 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const match of content.matchAll(/\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+"[^"]*")?\)/g)) {
    const href = match[1] || match[2];
    if (/^[a-z][a-z0-9+.-]*:|^#|^\/\//i.test(href) || href.includes('{{')) continue;
    const target = decodeURIComponent(href.split('#')[0].split('?')[0]);
    if (target && !fs.existsSync(path.resolve(root, path.dirname(file), target))) errors.push(file + '：文件链接不存在 ' + href);
  }
}
const catalog = spawnSync(process.execPath, ['kit/tools/catalog.js', '--check'], { cwd: root, encoding: 'utf8' });
if (catalog.status !== 0) errors.push((catalog.stdout + catalog.stderr).trim());
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('仓库检查通过：工具语法、依赖锁、文档文件链接、入库边界与片单。');
