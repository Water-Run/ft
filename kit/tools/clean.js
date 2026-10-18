// 收尾清理：默认只列清单；--apply 必须给出仓库外的新归档目录。
// node kit/tools/clean.js <视频> [--archive <目录> --apply]
// node kit/tools/clean.js --verify <归档目录>
// 归档本片源码与生成物，逐文件核对 SHA-256 后，仅删除 audio/out/shots/build。
const fs = require('node:fs');
const path = require('node:path');
const { parseArgs } = require('node:util');
const { GENERATED, LOCK, inside, noLinks, videoRoot, files, hash, trackedGenerated, acquireLock } = require('./project-files');
const REPO = path.resolve(__dirname, '../..');
const excluded = rel => rel === LOCK || rel === '.git' || rel.startsWith('.git/') || rel === 'research/_src' || rel.startsWith('research/_src/');
const isGenerated = file => GENERATED.includes(file.split('/')[0]);
const total = list => list.reduce((sum, file) => sum + file.bytes, 0);
const comparable = list => JSON.stringify(list.map(file => [file.path, file.bytes]).sort());

async function verify(archive) {
  noLinks(archive);
  const manifestFile = path.join(archive, 'manifest.json');
  noLinks(manifestFile);
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  if (manifest.schema !== 1 || !Array.isArray(manifest.files) || !manifest.files.length) throw new Error('归档清单格式错误');
  const names = new Set();
  for (const item of manifest.files) {
    if (typeof item.path !== 'string' || !/^video\//.test(item.path) || item.path.includes('\\') || item.path.split('/').some(part => !part || part === '.' || part === '..') || !inside(archive, path.resolve(archive, item.path)) || names.has(item.path)) throw new Error('归档清单含越界、重复或非法路径');
    names.add(item.path);
    const file = path.join(archive, item.path);
    noLinks(file);
    if (!Number.isSafeInteger(item.bytes) || item.bytes < 0 || !/^[a-f0-9]{64}$/.test(item.sha256) || fs.statSync(file).size !== item.bytes || await hash(file) !== item.sha256) throw new Error('归档校验失败：' + item.path);
  }
  const actual = files(archive, rel => rel === 'manifest.json');
  if (comparable(actual) !== comparable(manifest.files)) throw new Error('归档实际文件集合与清单不一致');
  return manifest;
}
async function clean(repo, input, { archive, apply = false } = {}) {
  const video = videoRoot(repo, input);
  if (apply) acquireLock(video);
  for (const dir of GENERATED) {
    const target = path.join(video, dir);
    noLinks(target);
    if (fs.existsSync(target) && !fs.lstatSync(target).isDirectory()) throw new Error('生成物位置不是目录：' + dir);
  }
  const tracked = trackedGenerated(repo, video);
  if (tracked.length) throw new Error('生成物目录包含 Git 已跟踪文件，拒绝清理：\n' + tracked.join('\n'));
  const all = files(video, excluded), candidates = all.filter(file => isGenerated(file.path));
  for (const dir of GENERATED) {
    const group = candidates.filter(file => file.path.startsWith(dir + '/'));
    console.log(dir + '/：' + group.length + ' 个文件，' + (total(group) / 2 ** 20).toFixed(2) + ' MiB');
  }
  console.log('合计 ' + candidates.length + ' 个文件，' + (total(candidates) / 2 ** 20).toFixed(2) + ' MiB；源码、取证与校对记录保留。');
  if (!apply) { console.log('仅预览。执行清理：补上 --archive <仓库外的新目录> --apply。归档需要额外空间。'); return { removed: 0 }; }
  if (!candidates.length) { console.log('没有需要清理的生成物。'); return { removed: 0 }; }
  if (!archive) throw new Error('--apply 必须提供 --archive <仓库外的新目录>');
  archive = path.resolve(archive);
  noLinks(archive);
  const root = fs.realpathSync(repo);
  if (archive === root || inside(root, archive) || inside(archive, root)) throw new Error('归档目录必须在仓库外，且不能是仓库的上级目录');
  if (fs.existsSync(archive)) throw new Error('归档目录已存在；使用一个新的目录，避免覆盖');
  fs.mkdirSync(archive, { recursive: true });
  const manifest = { schema: 1, created_at: new Date().toISOString(), project: path.relative(root, video).replaceAll('\\', '/'), node: process.versions.node, files: [] };
  for (const item of all) {
    const src = path.join(video, item.path), dst = path.join(archive, 'video', item.path);
    noLinks(src);
    const sha256 = await hash(src);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst, fs.constants.COPYFILE_EXCL);
    manifest.files.push({ path: 'video/' + item.path, bytes: item.bytes, sha256 });
  }
  fs.writeFileSync(path.join(archive, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  await verify(archive);
  // 连源码一起复查，避免把制作期间变化的目录当作同一版本；所有检查先于第一次删除。
  if (comparable(files(video, excluded)) !== comparable(all)) throw new Error('归档期间本片文件集合发生变化，未清理');
  for (const item of manifest.files) {
    const src = path.join(video, item.path.slice(6));
    noLinks(src);
    if (await hash(src) !== item.sha256) throw new Error('归档期间文件发生变化，未清理：' + item.path);
  }
  if (trackedGenerated(repo, video).length) throw new Error('归档期间有生成物被加入 Git，未清理');
  const archived = new Map(manifest.files.map(item => [item.path.slice(6), item]));
  for (const item of candidates) {
    const file = path.join(video, item.path);
    noLinks(file);
    const record = archived.get(item.path);
    if (await hash(file) !== record.sha256) throw new Error('文件在清理时发生变化，已停止：' + item.path);
    fs.unlinkSync(file);
  }
  // 仅删除已核对的四个目录内的空目录；不使用递归强删，也不遍历用户临时目录。
  const removeEmpty = dir => {
    noLinks(dir);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const child = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.isSymbolicLink()) removeEmpty(child);
    }
    if (!fs.readdirSync(dir).length) fs.rmdirSync(dir);
  };
  for (const dir of GENERATED) { const target = path.join(video, dir); if (fs.existsSync(target)) removeEmpty(target); }
  console.log('归档校验通过；已清理 ' + candidates.length + ' 个生成文件。归档：' + archive);
  return { removed: candidates.length, archive };
}
if (require.main === module) {
  (async () => {
    const { values, positionals } = parseArgs({ allowPositionals: true, options: { archive: { type: 'string' }, apply: { type: 'boolean' }, verify: { type: 'string' }, help: { type: 'boolean' } } });
    if (values.help) { console.log('node kit/tools/clean.js <视频> [--archive <仓库外新目录> --apply]\nnode kit/tools/clean.js --verify <归档目录>'); return; }
    if (values.verify) {
      if (positionals.length || values.apply || values.archive) throw new Error('--verify 单独使用');
      const result = await verify(path.resolve(values.verify));
      console.log('归档校验通过：' + result.files.length + ' 个文件'); return;
    }
    if (positionals.length !== 1) throw new Error('必须明确指定一个视频目录。用 --help 查看用法。');
    await clean(REPO, path.resolve(positionals[0]), values);
  })().catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { clean, verify };
