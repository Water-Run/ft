// 安装后验证模板可在浏览器打开；不配音、不正式渲染、不登记片单。
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const slug = 'smoke-' + crypto.randomBytes(4).toString('hex');
const video = 'out/sandbox/' + slug;
const run = (tool, args, expect) => {
  const result = spawnSync(process.execPath, ['kit/tools/' + tool + '.js', ...args], { cwd: root, ...(expect ? { encoding: 'utf8' } : { stdio: 'inherit' }) });
  if (result.error) throw result.error;
  if (expect) { process.stdout.write(result.stdout || ''); process.stderr.write(result.stderr || ''); }
  if (result.status !== 0) process.exit(result.status || 1);
  if (expect && !expect.test(result.stdout)) throw new Error('模板片尾没有可见的 GPL 标识：' + args.join(' '));
};
run('new', [slug, '--scratch', '--title', '环境验证', '--title-en', 'Environment check']);
run('timeline', [video]);
run('script-review', [video, 'export', '--lang', 'all']);
run('look', [video, 'o1', '--lang', 'zh']);
run('look', [video, 'a2', '--lang', 'en']);
for (const lang of ['zh', 'en']) run('look', [video, 'credits', '--lang', lang], /\[文字\].*GPL-3\.0-or-later/);
console.log('模板与浏览器验证完成。练习源码、校对稿和截图：' + video + '。本次未验证音频、正式渲染或成片质量。');
