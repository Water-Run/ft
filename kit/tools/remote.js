// 两台机器分工时用：在一台机器上写代码、看帧、扫描，在另一台（渲染机）上配音、混音、渲染。两边各有一份仓库。
// 配置：本机 kit/config.local.json 里写 "remote": { "ssh": "<ssh 主机别名>", "path": "<渲染机上仓库的路径>" }
//       渲染机的路径形如 D:/Coding/ft 时按 Windows（cmd）处理，否则按 POSIX shell 处理；也可显式写 "shell": "cmd" | "sh"。
// 用法：
//   node kit/tools/remote.js push                       把工作树同步过去：已跟踪与未被忽略的文件；本机删掉的文件在对面也删
//   node kit/tools/remote.js run <工具> [参数…]          先同步，再在渲染机上运行 node kit/tools/<工具>.js …，输出回显到本机；
//                                                      结束后取回运行期间被改写的入库文件（各视频的 src/js/timing.<语言>.js）
//   node kit/tools/remote.js pull <相对仓库的路径…>      取回文件或目录（生成物：某部视频的 shots/、out/cover-zh-16x9.jpg、out/zh/asr.txt……）
//   node kit/tools/remote.js sh "<命令>"                 在渲染机的仓库目录下执行一条命令
// 同步的是工作树，不是提交：没提交的改动也会过去。生成物（audio/、out/、shots/、build/）与 assets/、node_modules/ 不同步，各留在产生它们的机器上。
// 渲染机上首次使用：先 push，再在那边运行 npm ci 与 node kit/tools/doctor.js。
const fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');
const REPO = path.resolve(__dirname, '..', '..');
const argv = process.argv.slice(2), cmd = argv[0];
const inRepo = (p) => { const a = path.resolve(REPO, p); return a === REPO || a.startsWith(REPO + path.sep) ? a : null; };
const walk = (d, fn) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!['node_modules', '.git', 'assets'].includes(e.name)) walk(p, fn); } else fn(p); } };
const relp = (p) => path.relative(REPO, p).replace(/\\/g, '/');
const tar = (args, cwd = REPO) => { const r = spawnSync('tar', args, { cwd, stdio: 'inherit' }); if (r.status !== 0) { console.error('tar 失败'); process.exit(1); } };

// ── 渲染机一侧：由本机经 ssh 调用，不直接使用 ──
if (cmd === '_apply') {               // 解包之后：删掉本机已删除的文件，清理临时文件
  const j = JSON.parse(fs.readFileSync(path.join(REPO, '.lvs-sync.json'), 'utf8'));
  let n = 0; for (const f of j.removed || []) { const a = inRepo(f); if (a && a !== REPO && fs.existsSync(a) && fs.statSync(a).isFile()) { fs.rmSync(a); n++; } }
  fs.rmSync(path.join(REPO, '.lvs-sync.tgz'), { force: true }); fs.rmSync(path.join(REPO, '.lvs-sync.json'), { force: true });
  console.log(`[remote] 已同步 ${j.count} 个文件${n ? `，删除 ${n} 个` : ''}`);
  process.exit(0);
}
if (cmd === '_exec' || cmd === '_pack') {
  const j = JSON.parse(fs.readFileSync(path.join(REPO, '.lvs-remote.json'), 'utf8')); fs.rmSync(path.join(REPO, '.lvs-remote.json'), { force: true });
  fs.rmSync(path.join(REPO, '.lvs-back.tgz'), { force: true });
  let status = 0, list = [];
  if (cmd === '_exec') {
    const t0 = Date.now() - 2000, tool = path.join(REPO, 'kit', 'tools', path.basename(j.argv[0]).replace(/\.js$/, '') + '.js');
    if (!fs.existsSync(tool)) { console.error('[remote] 没有这个工具：' + j.argv[0]); process.exit(2); }
    status = spawnSync(process.execPath, [tool, ...j.argv.slice(1)], { cwd: REPO, stdio: 'inherit' }).status || 0;
    walk(path.join(REPO, 'videos'), (p) => { if (/[\\/]src[\\/]js[\\/]timing\.\w+\.js$/.test(p) && fs.statSync(p).mtimeMs >= t0) list.push(relp(p)); });
  } else for (const f of j.paths) { const a = inRepo(f); if (!a || !fs.existsSync(a)) { console.error('[remote] 没有 ' + f); status = 1; continue; } list.push(relp(a)); }
  if (list.length) { fs.writeFileSync(path.join(REPO, '.lvs-back.list'), list.join('\n') + '\n'); tar(['-czf', '.lvs-back.tgz', '-T', '.lvs-back.list']); fs.rmSync(path.join(REPO, '.lvs-back.list'), { force: true }); }
  process.exit(status);
}

// ── 本机一侧 ──
const LOCAL = (() => { try { return JSON.parse(fs.readFileSync(path.join(REPO, 'kit', 'config.local.json'), 'utf8')); } catch (e) { return {}; } })();
const R = LOCAL.remote;
if (!R || !R.ssh || !R.path) { console.error('没有配置渲染机：在 kit/config.local.json 里写 "remote": { "ssh": "<ssh 主机别名>", "path": "<渲染机上仓库的路径>" }（写法见 kit/config.local.example.json）'); process.exit(2); }
if (!['push', 'run', 'pull', 'sh'].includes(cmd)) { console.error('用法：node kit/tools/remote.js push | run <工具> [参数…] | pull <路径…> | sh "<命令>"'); process.exit(2); }
const WINR = (R.shell || (/^[A-Za-z]:/.test(R.path) ? 'cmd' : 'sh')) === 'cmd';
const rpath = WINR ? R.path.replace(/\//g, '\\') : R.path, spath = R.path.replace(/\\/g, '/');
const here = (c) => (WINR ? `cd /d "${rpath}" && ${c}` : `cd '${rpath}' && ${c}`);
const ssh = (c, opt = {}) => spawnSync('ssh', ['-o', 'BatchMode=yes', R.ssh, c], { stdio: 'inherit', ...opt });
const must = (r, what) => { if (r.status !== 0) { console.error(what + ' 失败（退出码 ' + r.status + '）'); process.exit(r.status || 1); } };
const scpTo = (local, name) => must(spawnSync('scp', ['-q', '-o', 'BatchMode=yes', local, `${R.ssh}:${spath}/${name}`], { stdio: 'inherit' }), '传输 ' + name);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lvs-remote-'));
process.on('exit', () => { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {} });

function push() {
  const ls = spawnSync('git', ['ls-files', '-co', '--exclude-standard', '-z'], { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 28 });
  if (ls.status !== 0) { console.error('这里不是 Git 仓库，无法确定要同步哪些文件'); process.exit(1); }
  const files = ls.stdout.split('\0').filter((f) => f && fs.existsSync(path.join(REPO, f)));
  const gitDir = spawnSync('git', ['rev-parse', '--absolute-git-dir'], { cwd: REPO, encoding: 'utf8' }).stdout.trim();
  const mf = path.join(gitDir, 'lvs-remote-manifest.json');
  let prev = []; try { prev = JSON.parse(fs.readFileSync(mf, 'utf8')); } catch (e) {}
  const now = new Set(files), removed = prev.filter((f) => !now.has(f));
  fs.writeFileSync(path.join(tmp, 'list'), files.join('\n') + '\n');
  tar(['-czf', path.join(tmp, 'sync.tgz'), '-T', path.join(tmp, 'list')]);
  fs.writeFileSync(path.join(tmp, 'sync.json'), JSON.stringify({ count: files.length, removed }));
  must(ssh(WINR ? `if not exist "${rpath}" mkdir "${rpath}"` : `mkdir -p '${rpath}'`), '建立远端目录');
  scpTo(path.join(tmp, 'sync.tgz'), '.lvs-sync.tgz'); scpTo(path.join(tmp, 'sync.json'), '.lvs-sync.json');
  must(ssh(here(`tar -xzf .lvs-sync.tgz && node kit${WINR ? '\\' : '/'}tools${WINR ? '\\' : '/'}remote.js _apply`)), '远端解包');
  fs.writeFileSync(mf, JSON.stringify(files));
}
function back() {                     // 取回远端打好的包（没有就算了）
  const local = path.join(tmp, 'back.tgz');
  const r = spawnSync('scp', ['-q', '-o', 'BatchMode=yes', `${R.ssh}:${spath}/.lvs-back.tgz`, local], { stdio: ['ignore', 'ignore', 'ignore'] });
  if (r.status !== 0 || !fs.existsSync(local)) return 0;
  const names = spawnSync('tar', ['-tzf', local], { encoding: 'utf8' }).stdout.split(/\r?\n/).filter(Boolean);
  tar(['-xzf', local]);
  ssh(here(WINR ? 'del /q .lvs-back.tgz' : 'rm -f .lvs-back.tgz'), { stdio: 'ignore' });
  for (const n of names.slice(0, 12)) console.log('[remote] 取回 ' + n);
  if (names.length > 12) console.log(`[remote] …… 共 ${names.length} 项`);
  return names.length;
}
const agent = (mode, payload) => { fs.writeFileSync(path.join(tmp, 'remote.json'), JSON.stringify(payload)); scpTo(path.join(tmp, 'remote.json'), '.lvs-remote.json'); return ssh(here(`node kit${WINR ? '\\' : '/'}tools${WINR ? '\\' : '/'}remote.js ${mode}`)); };

if (cmd === 'push') push();
else if (cmd === 'run') {
  if (!argv[1]) { console.error('用法：node kit/tools/remote.js run <工具> [参数…]'); process.exit(2); }
  push();
  // 参数里的路径换成相对仓库的写法，对面的仓库位置不同
  const args = argv.slice(1).map((a, i) => (i > 0 && !a.startsWith('-') && fs.existsSync(path.resolve(a)) && inRepo(path.resolve(a)) ? relp(path.resolve(a)) : a));
  const r = agent('_exec', { argv: args });
  back();
  process.exit(r.status || 0);
} else if (cmd === 'pull') {
  if (argv.length < 2) { console.error('用法：node kit/tools/remote.js pull <相对仓库的路径…>'); process.exit(2); }
  const r = agent('_pack', { paths: argv.slice(1).map((a) => (fs.existsSync(path.resolve(a)) || !a.includes(path.sep) ? relp(path.resolve(a)) : a.replace(/\\/g, '/'))) });
  const n = back();
  if (!n) console.log('[remote] 没有取回任何文件');
  process.exit(r.status || 0);
} else if (cmd === 'sh') process.exit(ssh(here(argv.slice(1).join(' '))).status || 0);
