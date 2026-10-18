// 只读 CASE-A 的本地源码；输出白名单统计和证据位置，不输出原文、私有路径、查询或配置。
// CASE_REPO 指向私有检出；node 18_case_deep_audit.cjs --date YYYY-MM-DD --out <公开统计.json>
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const { parseArgs } = require('node:util');
const { values } = parseArgs({ options: { date: { type: 'string' }, out: { type: 'string' } } });
const RULES = {
  registry: /new\s+Registry\s*\(/, loader: /new\s+Loader\s*\(/,
  dispatch: /->dispatch\s*\(/, preaction_login: /addPreAction.*common\/home\/login/,
  route_class: /preg_replace\(.*a-zA-Z0-9/, dynamic_call: /call_user_func_array|new\s+\$class/,
  preaction_loop: /pre_action/, registry_write: /registry->set\s*\(/,
  preaction_permission: /addPreAction.*common\/home\/permission/,
  permission: /->hasPermission\s*\(/, login_state: /->isLogged\s*\(/,
  session: /session->data|session_start\s*\(/, route: /request->get\[['"]route/,
  token_check: /request->get\[['"]token['"]\].*session->data\[['"]token/,
  models: /load->model\s*\(/, template: /\$this->template\s*=/,
  extract: /extract\(\$this->data\)/, render_require: /require\(\$file\)/,
  select: /\bSELECT\b/i, insert: /\bINSERT\s+INTO\b/i,
  update: /\bUPDATE\s+/i, delete: /\bDELETE\s+FROM\b/i,
  limit: /\bLIMIT\b/, order_by: /\bORDER\s+BY\b/, escape: /->escape\s*\(/,
  transaction: /\bSTART\s+TRANSACTION\b|\bCOMMIT\b|\bROLLBACK\b|beginTransaction\s*\(/i,
  ajax: /\$\.ajax|XMLHttpRequest|\bfetch\s*\(/, jquery: /\$\(/,
  form: /<form\b/i, table: /<table\b/i, pagination: /pagination/i,
  filters: /filter_/i, clickhouse: /clickhouse/i, postgres: /postgres|pg_query/i,
  export: /\bexport\b|exportData|exportCsv/i, download: /download/i,
  help: /helpChat|naturalQuery/, inline_script: /<script\b/i,
  session_release: /session_write_close\s*\(/, date_filter: /date_start|date_end|start_date|end_date/,
};
const GROUPS = [
  ['inventory', /^catalog\//], ['orders', /^sale\//], ['purchasing', /^(office|purchase)\//],
  ['finance', /^caiwu\//], ['weighing', /^wuliuweight\//], ['workforce', /^query\//],
  ['identity', /^(common|user|setting)\//],
];
function main() {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date || '') || !values.out || !process.env.CASE_REPO) throw new Error('arguments');
  const repo = fs.realpathSync(process.env.CASE_REPO);
  const apps = [repo, ...fs.readdirSync(repo, { withFileTypes: true }).filter(e => e.isDirectory() && !e.name.startsWith('.')).map(e => path.join(repo, e.name))].filter(p => fs.existsSync(path.join(p, 'admin/index.php')));
  if (apps.length !== 1) throw new Error('application');
  const app = fs.realpathSync(apps[0]), prefix = path.relative(repo, app).replaceAll('\\', '/');
  const tracked = cp.execFileSync('git', ['ls-files', '-z'], { cwd: repo, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }).split('\0').filter(Boolean);
  const names = tracked.filter(f => !prefix || f.startsWith(prefix + '/')).map(f => prefix ? f.slice(prefix.length + 1) : f);
  const read = rel => {
    const file = path.resolve(app, rel);
    if (!file.startsWith(app + path.sep) || fs.lstatSync(file).isSymbolicLink()) throw new Error('path');
    return fs.readFileSync(file, 'utf8');
  };
  const inspect = rel => {
    if (!fs.existsSync(path.join(app, rel))) return { exists: false };
    const text = read(rel), lines = text.split(/\r?\n/), evidence = {};
    for (const [key, rule] of Object.entries(RULES)) {
      const hits = lines.flatMap((line, i) => rule.test(line) ? [i + 1] : []);
      if (hits.length) evidence[key] = { count: hits.length, lines: hits.slice(0, 12) };
    }
    return { exists: true, lines: lines.length, evidence };
  };
  const corePaths = ['admin/index.php', 'system/engine/action.php', 'system/engine/front.php', 'system/engine/controller.php', 'system/engine/loader.php', 'system/library/user.php', 'system/library/session.php', 'admin/controller/common/home.php'];
  // 只有广泛公开的 OpenCart 框架相对路径允许出现在输出中；业务文件只用类别和稳定序号。
  const core = corePaths.map((file, i) => ({ id: 'S' + String(i + 1).padStart(2, '0'), public_framework_path: file, ...inspect(file) }));
  const domains = Object.fromEntries(GROUPS.map(([name]) => [name, { controllers: 0, methods: 0, model_references: 0, missing_model_references: 0, template_references: 0, missing_template_references: 0, signals: {} }]));
  domains.other = { controllers: 0, methods: 0, model_references: 0, missing_model_references: 0, template_references: 0, missing_template_references: 0, signals: {} };
  const controllers = names.filter(f => /^admin\/controller\/.*\.php$/.test(f)).sort(), samples = [];
  let declared = 0;
  for (const file of controllers) {
    if (!fs.existsSync(path.join(app, file))) continue;
    const text = read(file);
    if (!/\bclass\s+Controller\w+\s+extends\s+Controller\b/.test(text)) continue;
    declared++;
    const relative = file.slice('admin/controller/'.length), group = GROUPS.find(([, re]) => re.test(relative))?.[0] || 'other', d = domains[group];
    d.controllers++;
    d.methods += [...text.matchAll(/\b(?:public\s+)?function\s+[A-Za-z0-9_]+\s*\(/g)].length;
    const models = [...text.matchAll(/load->model\(\s*['"]([A-Za-z0-9_/]+)['"]/g)].map(m => 'admin/model/' + m[1] + '.php');
    const templates = [...text.matchAll(/\$this->template\s*=\s*['"]([A-Za-z0-9_/]+\.(?:tpl|php))['"]/g)].map(m => 'admin/view/template/' + m[1]);
    d.model_references += models.length; d.template_references += templates.length;
    d.missing_model_references += models.filter(f => !fs.existsSync(path.join(app, f))).length;
    d.missing_template_references += templates.filter(f => !fs.existsSync(path.join(app, f))).length;
    for (const [key, re] of Object.entries(RULES)) if (re.test(text)) d.signals[key] = (d.signals[key] || 0) + 1;
    if (/clickhouse|salary_query|procurement_plan|weightlist|sale\/order\.php/i.test(relative)) {
      const i = samples.length + 1;
      samples.push({ id: 'B' + String(i).padStart(2, '0'), domain: group, controller: inspect(file), models: [...new Set(models)].map(f => inspect(f)), templates: [...new Set(templates)].map(f => inspect(f)) });
    }
  }
  const menu = ['admin/view/template/common/header.tpl', 'admin/view/template/common/header_new.tpl'].map(file => {
    if (!fs.existsSync(path.join(app, file))) return { exists: false };
    const text = read(file), routes = [...new Set([...text.matchAll(/route=([A-Za-z0-9_/]+)/g)].map(m => m[1]))];
    return { exists: true, literal_routes: routes.length, exact_controller_files_found: routes.filter(route => fs.existsSync(path.join(app, 'admin/controller', route + '.php'))).length, ...inspect(file) };
  });
  const result = { schema: 1, date: values.date, case: 'CASE-A', method: 'read-only-static-allowlist', runtime_verified: false,
    export_policy: 'no-private-paths-source-hashes-source-text-sql-config-records-or-network-identifiers',
    counts: { tracked_application_paths: names.length, controller_php_paths: controllers.length, declared_controller_files: declared, deep_samples: samples.length }, core, domains, menu, samples };
  fs.writeFileSync(values.out, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ status: 'ok', ...result.counts }));
}
try { main(); } catch { console.error('测绘失败；未输出私有路径或异常原文。检查参数、目录与文件权限。'); process.exitCode = 1; }
