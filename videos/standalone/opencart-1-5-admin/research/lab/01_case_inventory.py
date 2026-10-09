#!/usr/bin/env python3
"""Read-only, allowlisted source survey. Emits no source text or configuration.

CASE_REPO points to the private checkout. The application is discovered without
printing its directory name. Run with --date YYYY-MM-DD to reproduce a snapshot.
Counts refer to tracked paths; semantic findings are lexical, not runtime tests.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess


ROUTES = (
    'common/login', 'common/home', 'catalog/product', 'catalog/stock',
    'catalog/outstock', 'catalog/kuweigl', 'catalog/batchstock',
    'office/procurement_plan', 'office/instock', 'sale/order',
    'sale/stockhistory', 'sale/orderjt', 'sale/stockhistoryjt',
    'caiwu/orderlistprint', 'wuliuweight/weight', 'wuliuweight/weightlist',
    'query/warehouse_salary_query', 'query/order_salary_query',
    'user/user', 'user/user_permission', 'setting/setting',
    'sale/stockhistory_record_clickhouse', 'sale/order_record_clickhouse',
    'sale/accrual_record_clickhouse', 'caiwu/accrual_record_clickhouse',
    'wuliuweight/weight_record_clickhouse', 'sale/order_clickhouse',
)
DOMAINS = (
    'catalog', 'sale', 'purchase', 'office', 'caiwu', 'wuliuweight',
    'query', 'user', 'setting', 'report', 'alipay', 'jd', 'TCPDF-master',
)
PATTERNS = {
    'version_constant': r"define\(['\"]VERSION['\"]",
    'registry': r'new Registry\(',
    'loader': r'new Loader\(',
    'session': r'new Session\(',
    'user': r'new User\(',
    'front_controller': r'new Front\(',
    'login_preaction': r"addPreAction.*common/home/login",
    'permission_preaction': r"addPreAction.*common/home/permission",
    'dispatch': r'->dispatch\(',
    'route_class': r"preg_replace\('/\[\^a-zA-Z0-9\]",
    'extract_data': r'extract\(\$this->data\)',
    'template_require': r'require\(\$file\)',
    'logged_in_check': r'->isLogged\(',
    'permission_check': r'->hasPermission\(',
    'route_session_token_comparison': r"request->get\['token'\].*session->data\['token'\]",
    'jquery_1_3_2': r'jquery-1\.3\.2',
    'jquery_1_8_0': r'jquery-1\.8\.0',
    'jquery_1_11_1': r'jquery-1\.11\.1',
    'superfish': r'superfish',
    'layui': r'layui',
    'role_branch': r'user_group_id\s*==',
    'inline_script': r'<script\b',
    'inline_style': r'<style\b',
    'table': r'<table\b',
    'form': r'<form\b',
    'pagination': r'pagination',
    'filter': r'filter_',
    'jquery_call': r'\$\(',
    'ajax': r'\$\.ajax|XMLHttpRequest|\bfetch\(',
    'clickhouse': r'ClickHouse|clickhouse',
    'postgresql': r'PostgreSQL|Postgresql|postgresql|pg_query',
    'downloader': r'YYDownloader|yy.downloader',
    'llm': r'Deepseek|DeepSeek|helpChat|naturalQuery',
}


def inspect_file(app, rel):
    p = app / rel
    if not p.is_file():
        return {'path': rel, 'exists': False}
    data = p.read_bytes()
    try:
        source = data.decode('utf-8')
        encoding = 'utf-8'
    except UnicodeDecodeError:
        source = data.decode('gb18030', errors='replace')
        encoding = 'legacy-decoded'
    lines = source.splitlines()
    anchors = {}
    for name, pattern in PATTERNS.items():
        if name == 'ajax' and not rel.endswith('.tpl'):
            continue
        hits = [i for i, line in enumerate(lines, 1) if re.search(pattern, line)]
        if hits:
            anchors[name] = {'count': len(hits), 'lines': hits[:12]}
    return {'path': rel, 'exists': True, 'bytes': len(data),
            'lines': len(lines), 'encoding': encoding,
            'sha256': hashlib.sha256(data).hexdigest(), 'anchors': anchors}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--date', required=True)
    args = parser.parse_args()
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', args.date):
        raise SystemExit('Invalid date')
    repo = Path(os.environ['CASE_REPO']).resolve()
    candidates = [repo] if (repo / 'admin/index.php').is_file() else [
        p for p in repo.iterdir() if p.is_dir() and (p / 'admin/index.php').is_file()
    ]
    if len(candidates) != 1:
        raise SystemExit('Expected one application directory')
    app = candidates[0]
    prefix = app.relative_to(repo).as_posix()
    prefix = '' if prefix == '.' else prefix + '/'
    raw = subprocess.run(['git', '-C', str(repo), 'ls-files', '-z'],
                         check=True, capture_output=True).stdout
    tracked = raw.decode('utf-8').split('\0')[:-1]
    files = [p[len(prefix):] for p in tracked if p.startswith(prefix)]
    php = [p for p in files if p.endswith('.php')]
    templates = [p for p in files if p.endswith('.tpl')]
    metrics = {
        'application_tracked_files': len(files),
        'application_php_files': len(php),
        'application_tpl_files': len(templates),
        'admin_controller_php_files': sum(p.startswith('admin/controller/') for p in php),
        'admin_model_php_files': sum(p.startswith('admin/model/') for p in php),
        'admin_template_files': sum(p.startswith('admin/view/template/') for p in templates),
        'admin_old_tracked_files': sum(p.startswith('admin/old/') for p in files),
        'templates_with_script_tag': 0,
        'templates_with_style_tag': 0,
        'templates_with_jquery_call': 0,
        'php_tpl_non_utf8_files': 0,
        'declared_controller_classes': 0,
    }
    for rel in php + templates:
        raw_file = (app / rel).read_bytes()
        try:
            text = raw_file.decode('utf-8')
        except UnicodeDecodeError:
            metrics['php_tpl_non_utf8_files'] += 1
            text = raw_file.decode('gb18030', errors='replace')
        if rel.endswith('.tpl'):
            metrics['templates_with_script_tag'] += bool(re.search(r'<script\b', text, re.I))
            metrics['templates_with_style_tag'] += bool(re.search(r'<style\b', text, re.I))
            metrics['templates_with_jquery_call'] += '$(' in text
        if rel.startswith('admin/controller/'):
            metrics['declared_controller_classes'] += len(re.findall(
                r'\bclass\s+Controller\w+\s+extends\s+Controller\b', text, re.I))
    artifacts = {}
    core = ['admin/index.php', 'system/engine/action.php',
            'system/engine/front.php', 'system/engine/controller.php',
            'system/engine/loader.php', 'system/engine/model.php',
            'system/engine/registry.php', 'admin/controller/common/home.php',
            'admin/controller/common/header.php', 'system/library/user.php',
            'admin/controller/common/footer.php',
            'admin/view/template/common/header.tpl',
            'admin/view/template/common/header_new.tpl',
            'admin/view/stylesheet/stylesheet.css',
            'frontend/package.json', 'frontend/vite.config.ts',
            'utils/ClickHouseConnector.php', 'utils/PostgreSQLConnector.php',
            'utils/YYDownloaderConnector.php', 'utils/Record47Export.php',
            'utils/RecordExportCapacity.php', 'utils/RecordPageHelp.php',
            'utils/LLMConnector.php', 'utils/LocalLLMConnector.php']
    for rel in core:
        artifacts[rel] = inspect_file(app, rel)
    version_source = (app / 'admin/index.php').read_text(errors='replace')
    version = re.search(r"define\(\s*['\"]VERSION['\"]\s*,\s*['\"]([\d.]+)['\"]", version_source)
    pages = []
    safe_rel = re.compile(r'^[a-zA-Z0-9_/]+\.(?:tpl|php)$')
    for route in ROUTES:
        rel = 'admin/controller/' + route + '.php'
        artifact = inspect_file(app, rel)
        artifacts[rel] = artifact
        if not artifact['exists']:
            pages.append({'route': route, 'exists': False})
            continue
        source = (app / rel).read_text(errors='replace')
        templates_found = list(dict.fromkeys(re.findall(
            r"\$this->template\s*=\s*['\"]([^'\"]+)['\"]", source)))
        model_names = list(dict.fromkeys(re.findall(
            r"\$this->load->model\(\s*['\"]([a-zA-Z0-9_/]+)['\"]", source)))
        template_paths = ['admin/view/template/' + p for p in templates_found if safe_rel.fullmatch(p)]
        model_paths = ['admin/model/' + p + '.php' for p in model_names]
        for target in template_paths + model_paths:
            artifacts[target] = inspect_file(app, target)
        pages.append({'route': route, 'exists': True,
                      'controller_lines': artifact['lines'],
                      'templates': template_paths, 'models': model_paths,
                      'public_methods': list(dict.fromkeys(re.findall(
                          r'\bpublic\s+function\s+([a-zA-Z0-9_]+)\s*\(', source)))})
    header = (app / 'admin/view/template/common/header.tpl').read_text(errors='replace')
    header_new = (app / 'admin/view/template/common/header_new.tpl').read_text(errors='replace')
    for page in pages:
        needle = 'route=' + page['route']
        page['literal_menu_links'] = {
            'header.tpl': [i for i, l in enumerate(header.splitlines(), 1) if needle in l],
            'header_new.tpl': [i for i, l in enumerate(header_new.splitlines(), 1) if needle in l],
        }
    ui_labels = ['采购计划', '商品目录', '库存查询', '库位管理', '入库记录',
                 '出库记录', '称重记录', '计提明细', '仓库组绩效工资计查存',
                 '打单组绩效工资计查存', '扫码打单', '打印条码', '财务']
    menu_labels = {label: [i for i, l in enumerate(header.splitlines(), 1) if label in l]
                   for label in ui_labels}
    environment = {}
    for name in ('Dockerfile', 'docker-compose.yml'):
        path = repo / name
        if not path.is_file():
            continue
        raw_config = path.read_bytes()
        config_text = raw_config.decode('utf-8', errors='replace')
        image_versions = re.findall(r'(?<![\w-])(?:php:[\d.]+-apache|mysql:[\d.]+|redis:[\d.]+)(?![\w.-])', config_text)
        environment[name] = {'sha256': hashlib.sha256(raw_config).hexdigest(),
                             'allowlisted_image_declarations': list(dict.fromkeys(image_versions))}
    frontend = json.loads((app / 'frontend/package.json').read_text())
    result = {
        'schema': 1, 'case': 'CASE-A', 'observed_on': args.date,
        'method': 'read-only tracked source inspection; no application execution',
        'privacy': 'allowlisted application-relative paths, counts, booleans and hashes only; no source excerpts, configuration, endpoints, identities or records',
        'declared_version': version.group(1) if version else None,
        'environment_declarations': environment,
        'frontend_dependency_declarations': {
            name: frontend.get('dependencies', {}).get(name)
            for name in ('vue', 'vuetify')
        },
        'version_scope': 'source constant only; ancestry and deployed version not established',
        'metrics': metrics,
        'top_level_tracked_counts': {d: sum(p.startswith(d + '/') for p in files)
                                     for d in ('admin', 'system', 'frontend', 'image',
                                               'zhongzhuan', 'print', 'utils', 'cmd',
                                               'erpapi', 'azpda', 'tmapi')},
        'root_entry_present': (app / 'index.php').is_file(),
        'root_catalog_present': (app / 'catalog').is_dir(),
        'controller_domain_php_counts': {d: sum(p.startswith('admin/controller/' + d + '/') for p in php) for d in DOMAINS},
        'menu_label_lines': menu_labels,
        'pages': pages,
        'artifacts': dict(sorted(artifacts.items())),
        'limitations': ['Lexical matches can include comments and disabled branches.',
                       'A linked route does not prove permission, data or runtime availability.',
                       'Method names and source structures do not prove business correctness.',
                       'Private source is required to reproduce CASE-A. It is not included.'],
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        raise SystemExit('Survey failed: ' + type(error).__name__) from None
