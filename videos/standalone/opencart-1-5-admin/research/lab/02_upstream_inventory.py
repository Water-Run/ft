#!/usr/bin/env python3
"""Inspect official OpenCart 1.5.6.4 sources at an immutable commit.

No PHP is executed. Third-party source stays in the user-supplied --cache folder,
which must be outside the public evidence directory. Only metadata is emitted.
Requires curl and Python standard library. Download errors produce a nonzero exit.
"""
import argparse
import concurrent.futures
import hashlib
import json
from pathlib import Path
import re
import subprocess

COMMIT = '31323f8ce70338e88570217f76e1111f7b2bcc8f'
VERSION = '1.5.6.4'
PATHS = (
    'upload/admin/index.php',
    'upload/admin/view/template/common/header.tpl',
    'upload/admin/view/template/sale/order_list.tpl',
    'upload/system/engine/action.php',
    'upload/system/engine/controller.php',
)
PATTERNS = {
    'version_constant': r"define\(['\"]VERSION['\"]",
    'login_preaction': r"addPreAction.*common/home/login",
    'permission_preaction': r"addPreAction.*common/home/permission",
    'route_class': r"preg_replace\('/\[\^a-zA-Z0-9\]",
    'extract_data': r'extract\(\$this->data\)',
    'template_require': r'require\(DIR_TEMPLATE',
    'menu': r'id="menu"',
    'jquery': r'<script.*jquery',
    'superfish': r'superfish',
    'filter': r'filter_',
    'table': r'<table',
    'pagination': r'pagination',
}


def inspect(cache, path):
    url = 'https://raw.githubusercontent.com/opencart/opencart/' + COMMIT + '/' + path
    target = cache / COMMIT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        partial = target.with_suffix(target.suffix + '.part')
        proc = subprocess.run(['curl', '--fail', '--silent', '--show-error',
                               '--location', '--retry', '2', '--connect-timeout',
                               '10', '--max-time', '20', url, '-o', str(partial)],
                              capture_output=True)
        if proc.returncode:
            partial.unlink(missing_ok=True)
            return {'path': path, 'url': url, 'error': 'download_failed'}
        partial.rename(target)
    data = target.read_bytes()
    text = data.decode('utf-8')
    lines = text.splitlines()
    result = {
        'path': path, 'url': url,
        'browser_url': 'https://github.com/opencart/opencart/blob/' + COMMIT + '/' + path,
        'sha256': hashlib.sha256(data).hexdigest(),
        'bytes': len(data), 'lines': len(lines),
        'anchors': {name: [i for i, line in enumerate(lines, 1) if re.search(pattern, line)]
                    for name, pattern in PATTERNS.items()},
    }
    if path.endswith('admin/index.php'):
        result['declared_version'] = re.search(
            r"define\(['\"]VERSION['\"],\s*['\"]([\d.]+)", text).group(1)
    if path.endswith('header.tpl'):
        result['jquery_scripts'] = re.findall(r'src="(view/javascript/jquery/[^"\s]+)"', text)
        result['menu_text_variables'] = list(dict.fromkeys(re.findall(r'\$(text_[a-z_]+)', text)))
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cache', type=Path, required=True)
    parser.add_argument('--date', required=True)
    args = parser.parse_args()
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        results = list(executor.map(lambda path: inspect(args.cache, path), PATHS))
    report = {'source': 'official opencart/opencart', 'tag': VERSION,
              'commit': COMMIT, 'observed_on': args.date,
              'method': 'downloaded source inspection; no installation or browser rendering',
              'tag_ref_url': 'https://api.github.com/repos/opencart/opencart/git/ref/tags/' + VERSION,
              'artifacts': results}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(1 if any('error' in row for row in results) else 0)


if __name__ == '__main__':
    main()
