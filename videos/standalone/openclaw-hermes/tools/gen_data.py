#!/usr/bin/env python3
"""把 research/lab/ 里的取证回显转成画面用的数据：写 src/js/data.js（不要手改）。
画面上出现的数字、日期、源码与文档引文都从这里来。只读 research/lab/out_*，不依赖不入库的材料。
用法：python tools/gen_data.py
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
LAB = os.path.join(ROOT, 'research', 'lab')
J = lambda n: json.load(open(os.path.join(LAB, n), encoding='utf8'))
T = lambda n: open(os.path.join(LAB, n), encoding='utf8').read()

gh = J('out_01_github.json')
rel = J('out_02_releases.json')
npm = J('out_03_npm.json')
models = J('out_05_models.json')
adv = J('out_08_advisory.json')
nvd = J('out_08_nvd_CVE-2026-25253.json')
ex = {e['id']: e for e in J('out_10_excerpts.json')['excerpts']}
qs = {e['id']: e for e in J('out_11_quotes.json')['quotes']}
snap = J('out_12_snapshots.json')

oc, hm, pi = gh['openclaw/openclaw'], gh['NousResearch/hermes-agent'], gh['earendil-works/pi']
d = lambda s: s[:10]

# 仓库概况
def repo(r, extra=None):
    o = {'created': d(r['created_at']), 'stars': r['stargazers_count'], 'forks': r['forks_count'], 'license': r['license'], 'lang': r['language'], 'commits': r.get('commits_total'), 'oldest': (r.get('oldest_commit') or {}).get('date', '')[:10], 'head': r['head_commit']['sha'][:10] if r.get('head_commit') else None, 'headDate': (r.get('head_commit') or {}).get('date', '')[:10]}
    if extra: o.update(extra)
    return o

# 发布：OpenClaw 取日期与是否预发布；Hermes 取日期与标签
ocr = [[d(r['published_at']), 1 if r['prerelease'] else 0, r['tag']] for r in rel['openclaw']]
hmr = [[d(r['published_at']), r['tag'], r['name']] for r in rel['hermes']]

# OpenClaw 的五个名字：起点按「仓库创建 / 首个发布 / npm 包创建」取，README 标题取自各标签的 README
reads = {}
cur = None
for line in T('out_04_readmes.txt').split('\n'):
    m = re.match(r'^######## (\S+) @ (\S+)', line)
    if m: cur = m.group(1) + '@' + m.group(2); reads[cur] = []; continue
    if cur and line.strip(): reads[cur].append(line)
title_of = lambda k: re.sub(r'^#\s*', '', reads[k][0])
first_rel = lambda tag: next(r for r in rel['openclaw'] if r['tag'] == tag)
names = [
    {'name': 'warelay', 'from': d(oc['created_at']), 'ver': 'v0.1.1', 'rel': d(first_rel('v0.1.1')['published_at']), 'readme': 'Send, receive, and auto-reply on WhatsApp', 'readmeTitle': title_of('openclaw/openclaw@v0.1.1')},
    {'name': 'CLAWDIS', 'from': d(first_rel('v2.0.0-beta1')['published_at']), 'ver': 'v2.0.0-beta1', 'rel': d(first_rel('v2.0.0-beta1')['published_at']), 'readme': 'WhatsApp & Telegram Gateway for AI Agents', 'readmeTitle': title_of('openclaw/openclaw@v2.0.0-beta1')},
    {'name': 'Clawdbot', 'from': d(first_rel('v2026.1.5')['published_at']), 'ver': 'v2026.1.5', 'rel': d(first_rel('v2026.1.5')['published_at']), 'readme': 'Personal AI Assistant', 'readmeTitle': title_of('openclaw/openclaw@v2026.1.5')},
    {'name': 'Moltbot', 'from': d(npm['moltbot']['created']), 'ver': None, 'rel': None, 'readme': None, 'readmeTitle': None},
    {'name': 'OpenClaw', 'from': d(first_rel('v2026.1.29')['published_at']), 'ver': 'v2026.1.29', 'rel': d(first_rel('v2026.1.29')['published_at']), 'readme': 'Personal AI Assistant', 'readmeTitle': title_of('openclaw/openclaw@v2026.1.29')},
]
today_title = title_of('openclaw/openclaw@v2026.8.1')

# 前身时期的 README 原句（按标签）
rl, cur = {}, None
for line in T('out_04_readme_lines.txt').split('\n'):
    m = re.match(r'^######## (\S+)', line)
    if m: cur = m.group(1); rl[cur] = []; continue
    if cur and line.strip(): rl[cur].append(line.strip())
dist_tags = J('out_03_openclaw_dist_tags.json')
xposts = J('out_13_x_posts.json')

# 扩展包
ext = []
for l in T('out_09_extensions.tsv').split('\n'):
    if not l or l.startswith('#'): continue
    p = l.split('\t'); ext.append([p[0], 1 if len(p) > 1 and p[1] == 'channel' else 0])

# Hermes v0.2.0 发布说明里的数字
notes = T('out_02_hermes_v0.2.0_notes.txt')
m = re.search(r'(\d+)\*{0,2} merged pull requests\*{0,2} from \*{0,2}(\d+)\*{0,2} contributors', notes, re.S)
m2 = re.search(r'(Hermes Agent went from a small internal project to a full-featured AI agent platform)', notes)
v020 = {'pulls': int(m.group(1)), 'contributors': int(m.group(2)), 'sentence': m2.group(1), 'date': re.search(r'Release Date:\*\* ([A-Za-z]+ \d+, \d{4})', notes).group(1)}

# 模型线
hf = models['huggingface']; ax = models['arxiv']
hm_models = [
    {'n': 'Nous-Hermes', 'd': d(hf['NousResearch/Nous-Hermes-13b']['createdAt']), 'src': 'Hugging Face 仓库创建'},
    {'n': 'Hermes 2 Pro', 'd': d(hf['NousResearch/Hermes-2-Pro-Mistral-7B']['createdAt']), 'src': 'Hugging Face 仓库创建'},
    {'n': 'Hermes 3', 'd': d(ax['2408.11857']['published']), 'src': 'arXiv 2408.11857'},
    {'n': 'Hermes 4', 'd': d(ax['2508.18255']['published']), 'src': 'arXiv 2508.18255'},
]
nous = T('out_06_nous_releases.txt')
assert '02/25/26' in nous
hm_events = {'repo': d(hm['oldest_commit']['date']), 'launch': '2026-02-25'}

# 飞书插件的来历
fe = {'community': d(npm['@m1heng-clawd/feishu']['created']), 'official': d(npm['@openclaw/feishu']['created']), 'larksuite': d(npm['@larksuiteoapi/feishu-openclaw-plugin']['created']),
      'communityPkg': '@m1heng-clawd/feishu', 'officialPkg': '@openclaw/feishu', 'larksuitePkg': '@larksuiteoapi/feishu-openclaw-plugin',
      'larksuiteDesc': npm['@larksuiteoapi/feishu-openclaw-plugin']['description'], 'officialDesc': npm['@openclaw/feishu']['description']}

# 安全公告
sec = {'ghsa': adv['target']['ghsa_id'], 'published': d(adv['target']['published_at']), 'earliest': d(adv['earliest']['published_at']), 'cvss': adv['target']['cvss_score'], 'severity': adv['target']['severity'],
       'patched': adv['target']['patched'], 'summary': adv['target']['summary'], 'cve': nvd['id'], 'nvdPublished': d(nvd['published']), 'nvdVector': nvd['cvss31']['vectorString']}

# 官方 SDK README 里的长连接说明与示例
sdk = [l for l in T('out_07_feishu_node_sdk.txt').split('\n')]
sample_start = next(i for i, l in enumerate(sdk) if l.startswith('```typescript'))
sample = sdk[sample_start + 1:]
notes_i = next(i for i, l in enumerate(sdk) if l.startswith('> Points to Note'))
sdk_notes = [l[2:].strip() for l in sdk[notes_i + 1:sample_start] if l.startswith('* ')]
sdk_nopublic = next(l[2:].strip() for l in sdk if l.startswith('* Only need to ensure'))
sample = sample[:next(i for i, l in enumerate(sample) if l.startswith('```'))] if any(l.startswith('```') for l in sample) else sample

data = {
    'snap': {'retrieved': '2026-10-06', 'oc': snap['openclaw'][:10], 'hm': snap['hermes-agent'][:10], 'ocDate': d(oc['head_commit']['date']), 'hmDate': d(hm['head_commit']['date'])},
    'repo': {'oc': repo(oc), 'hm': repo(hm), 'pi': {'created': d(pi['created_at']), 'stars': pi['stargazers_count'], 'license': pi['license']}},
    'rel': {'oc': ocr, 'hm': hmr, 'ocTotal': len(ocr), 'ocStable': sum(1 for r in ocr if not r[1]), 'ocPre': sum(1 for r in ocr if r[1]), 'hmTotal': len(hmr), 'cutoff': rel['cutoff'][:10]},
    'names': names, 'todayTitle': today_title, 'readmeLines': rl, 'distTags': dist_tags, 'xposts': xposts,
    'ext': ext, 'extCount': len(ext), 'extChannels': sum(1 for e in ext if e[1]),
    'hmModels': hm_models, 'hmEvents': hm_events, 'v020': v020, 'hmFirstRel': hmr[0][0], 'hmLastRel': hmr[-1][0], 'hmLastTag': hmr[-1][2],
    'npm': {k: {'created': d(v['created']), 'first': v['first']['version'], 'versions': v['versions'], 'latest': v['latest']} for k, v in npm.items()},
    'fe': fe, 'sec': sec, 'stars': json.loads(T('out_15_star_history.json')), 'hmPlatforms': [l for l in T('out_16_hermes_platforms.txt').split('\n') if l and not l.startswith('#')], 'sdk': sample, 'sdkNotes': sdk_notes, 'sdkNoPublic': sdk_nopublic, 'hm3abs': T('out_05_hermes3_abstract.txt').strip(),
    'ex': {k: {'path': v['path'], 'lines': v['lines'], 'commit': v['commit'][:10], 'text': v['text']} for k, v in ex.items()},
    'q': {k: {'path': v['path'], 'line': v['lines'][0], 'text': v['text']} for k, v in qs.items()},
}
out = os.path.join(ROOT, 'src', 'js', 'data.js')
with open(out, 'w', encoding='utf8', newline='\n') as f:
    f.write('// 由 tools/gen_data.py 从 research/lab/ 的取证回显生成，不要手改。\n')
    # 画面数据里不带 emoji（本片风格规则不许用；README 标题里的 emoji 不上画面）。原文回显仍在 research/lab/out_*
    emoji = re.compile('[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F\u200D]')
    f.write('window.DATA = ' + emoji.sub('', json.dumps(data, ensure_ascii=False, indent=1, sort_keys=True)) + ';\n')
print('data.js', os.path.getsize(out), 'bytes; ext', len(ext), 'channels', data['extChannels'], 'oc releases', len(ocr), 'hm releases', len(hmr), 'v0.2.0', v020)
