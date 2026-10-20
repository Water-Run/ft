// 文件边界与制作锁。生成物清理只接受本仓库的单个视频目录。
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const GENERATED = ['audio', 'out', 'shots', 'build'];
const LOCK = '.ft-work.lock';
const inside = (root, target) => {
  const rel = path.relative(root, target);
  return rel !== '' && !path.isAbsolute(rel) && rel !== '..' && !rel.startsWith('..' + path.sep);
};
function noLinks(target) {
  let current = path.resolve(target);
  for (;;) {
    try {
      if (fs.lstatSync(current).isSymbolicLink()) throw new Error('拒绝符号链接或 junction：' + current);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
}
function videoRoot(repo, input) {
  const root = fs.realpathSync(repo), video = path.resolve(input);
  noLinks(video);
  const rel = path.relative(root, video).replaceAll('\\', '/');
  if (!/^(videos\/[a-z0-9]+(?:-[a-z0-9]+)*|out\/sandbox)\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rel)) {
    throw new Error('只接受 videos/ 下的单个视频，或 out/sandbox/ 下的新建练习目录');
  }
  if (!fs.statSync(path.join(video, 'project.json')).isFile()) throw new Error('缺少 project.json');
  return video;
}
// 遍历不跟随链接，连目录本身也检查。拒绝设备、管道等特殊文件。
function files(root, exclude = () => false) {
  noLinks(root);
  const result = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(dir, entry.name), rel = path.relative(root, file).replaceAll('\\', '/');
      if (exclude(rel)) continue;
      const stat = fs.lstatSync(file);
      if (stat.isSymbolicLink()) throw new Error('拒绝符号链接或 junction：' + rel);
      if (stat.isDirectory()) walk(file);
      else if (stat.isFile()) result.push({ path: rel, bytes: stat.size });
      else throw new Error('拒绝特殊文件：' + rel);
    }
  }
  walk(root);
  return result;
}
async function hash(file) {
  const sum = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(file)) sum.update(chunk);
  return sum.digest('hex');
}
function trackedGenerated(repo, video) {
  const relative = path.relative(repo, video).replaceAll('\\', '/');
  const result = execFileSync('git', ['ls-files', '-z', '--', relative], { cwd: repo, encoding: 'utf8' });
  return result.split('\0').filter(Boolean).filter(file => GENERATED.some(dir => file.startsWith(relative + '/' + dir + '/')));
}
const held = new Map();
function acquireLock(video) {
  video = path.resolve(video);
  if (held.has(video)) return;
  noLinks(video);
  const file = path.join(video, LOCK);
  if (fs.existsSync(file)) {
    noLinks(file);
    const previous = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (previous.token === process.env.FT_PROJECT_LOCK && previous.video === video) return;
    throw new Error('本片有制作锁（PID ' + previous.pid + '）。等待原任务结束；异常退出的处理见 docs/guides/release.md。');
  }
  const token = crypto.randomUUID();
  fs.writeFileSync(file, JSON.stringify({ pid: process.pid, token, video }), { flag: 'wx' });
  held.set(video, token);
  process.env.FT_PROJECT_LOCK = token; // run() 启动的子工具复用此锁，只有持有者负责释放。
  const release = () => {
    try {
      if (JSON.parse(fs.readFileSync(file, 'utf8')).token === token) fs.unlinkSync(file);
    } catch (error) { if (error.code !== 'ENOENT') process.stderr.write('制作锁未能释放：' + error.message + '\n'); }
    held.delete(video);
  };
  process.once('exit', release);
}
module.exports = { GENERATED, LOCK, inside, noLinks, videoRoot, files, hash, trackedGenerated, acquireLock };
