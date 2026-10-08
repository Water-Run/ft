# 从 GitHub REST API 的回显里摘出版本与日期（回显取于 2026-10-08，原文件不入库，见 FACTS.md「取证环境」）。
# 用法：python -I 02_meta.py <回显目录> > out_02_meta.json
import json, sys, os, glob, re

D = sys.argv[1]
J = lambda f: json.load(open(os.path.join(D, f), encoding='utf-8'))
out = {}

rels = []
for f in sorted(glob.glob(os.path.join(D, 'oc_rel_[0-9].json'))):
    rels += json.load(open(f, encoding='utf-8'))
by = {r['tag_name']: r for r in rels}
def rel(tag):
    r = by[tag]
    return {'tag': tag, 'published_at': r['published_at'], 'name': r['name']}
out['opencode_releases'] = [rel(t) for t in ('v1.0.0', 'v1.2.0', 'v1.3.0', 'v1.18.35')]
out['opencode_release_lines'] = {}
for t, pat in (('v1.2.0', r'migrate all flat files'), ('v1.3.0', r'Node\.js Support')):
    out['opencode_release_lines'][t] = [l.strip() for l in (by[t]['body'] or '').splitlines() if re.search(pat, l)]
out['opencode_releases_v2_count'] = sum(1 for r in rels if r['tag_name'].startswith('v2'))
tags = []
for f in sorted(glob.glob(os.path.join(D, 'oc_tags_*.json'))):
    tags += json.load(open(f, encoding='utf-8'))
out['opencode_v2_tags'] = [t['name'] for t in tags if re.match(r'^v2\.0\.\d+$', t['name'])]
out['opencode_tag_commits'] = {}
for t in ('v2.0.0', 'v2.0.1', 'v2.0.24', 'v1.18.35'):
    c = J(f'oc_commit_{t}.json')
    out['opencode_tag_commits'][t] = {'sha': c['sha'], 'date': c['commit']['committer']['date'], 'message': c['commit']['message'].split('\n')[0]}
b = J('oc_branch_2.0.json')
out['opencode_branch_2.0'] = {'sha': b['commit']['sha'], 'date': b['commit']['commit']['committer']['date'], 'message': b['commit']['commit']['message'].split('\n')[0]}
for k, f in (('opencode_repo', 'oc_repo.json'), ('openclaw_repo', 'claw_repo.json')):
    r = J(f)
    out[k] = {x: r[x] for x in ('full_name', 'created_at', 'stargazers_count', 'default_branch', 'pushed_at')} | {'license': r['license']['spdx_id']}

crel = []
for f in sorted(glob.glob(os.path.join(D, 'claw_rel_[0-9].json'))):
    crel += json.load(open(f, encoding='utf-8'))
cby = {r['tag_name']: r for r in crel}
out['openclaw_releases'] = [{'tag': t, 'published_at': cby[t]['published_at'], 'name': cby[t]['name']} for t in ('v0.1.1', 'v2.0.0-beta1', 'v2026.7.1', 'v2026.8.1', 'v2026.9.8')]
out['openclaw_readme_lines'] = {}
for t, pat in (('v0.1.1', r'^# '), ('v2.0.0-beta1', r'is a TypeScript/Node gateway')):
    lines = open(os.path.join(D, f'claw_readme_{t}.md'), encoding='utf-8').read().split('\n')
    out['openclaw_readme_lines'][t] = [{'line': i + 1, 'text': l} for i, l in enumerate(lines) if re.search(pat, l)][:1]
print(json.dumps(out, ensure_ascii=False, indent=1))
