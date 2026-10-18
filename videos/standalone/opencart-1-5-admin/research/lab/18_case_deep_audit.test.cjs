const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
test('匿名测绘输出不会复制源代码字符串、业务路径或测试身份标记', t => {
  const dir = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'ft-case-audit-'));
  t.after(() => {
    assert.ok(dir.startsWith(fs.realpathSync(os.tmpdir()) + path.sep + 'ft-case-audit-'));
    fs.rmSync(dir, { recursive: true, force: true });
  });
  const write = (file, content) => { fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true }); fs.writeFileSync(path.join(dir, file), content); };
  write('private-name/admin/index.php', '<?php $registry = new Registry(); // PRIVATE_ID_SENTINEL');
  write('private-name/admin/controller/sale/order.php', "<?php class ControllerSaleOrder extends Controller { public function index(){ $this->load->model('sale/order'); $this->template='sale/order.tpl'; $private='PRIVATE_RECORD_SENTINEL'; } }");
  write('private-name/admin/model/sale/order.php', "<?php /* PRIVATE_NETWORK_SENTINEL */ SELECT secret_column FROM private_table;");
  write('private-name/admin/view/template/sale/order.tpl', '<table>PRIVATE_PERSON_SENTINEL</table>');
  execFileSync('git', ['init', '--quiet'], { cwd: dir });
  execFileSync('git', ['add', '--', 'private-name'], { cwd: dir });
  const target = path.join(dir, 'public.json');
  const result = spawnSync(process.execPath, [path.join(__dirname, '18_case_deep_audit.cjs'), '--date', '2026-10-18', '--out', target], { env: { ...process.env, CASE_REPO: dir }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const output = fs.readFileSync(target, 'utf8');
  assert.doesNotMatch(output, /PRIVATE_|private-name|private_table|secret_column/);
  const json = JSON.parse(output);
  assert.equal(json.counts.declared_controller_files, 1);
  assert.equal(json.samples.length, 1);
  assert.equal(json.runtime_verified, false);
});
