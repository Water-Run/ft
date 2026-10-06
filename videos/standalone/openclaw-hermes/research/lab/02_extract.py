#!/usr/bin/env python3
"""取证脚本 02：从两个仓库的固定提交里摘出画面要用的代码片段与文档引文，并统计 OpenClaw 的扩展包。

输入：环境变量 SRC 指向放有两份稀疏浅克隆的目录（research/_src，不入库）：
    $SRC/openclaw       https://github.com/openclaw/openclaw         （docs、extensions/*/package.json、extensions/feishu、src 的相关目录）
    $SRC/hermes-agent   https://github.com/NousResearch/hermes-agent （gateway、agent、plugins/platforms、tools、website/docs 等）
    取法：git clone --depth 1 --filter=blob:none --no-checkout <url> <目录>；git sparse-checkout init --no-cone；
          git sparse-checkout set --no-cone <路径模式…>；git checkout。两份的 HEAD 记在输出里。
输出：out_09_extensions.tsv、out_10_excerpts.json、out_11_quotes.json（写到第 1 个参数指定的目录，缺省为当前目录）。
片段按「文件 + 行号」或「锚点正则 + 行数」摘取，原文逐字保留（含缩进），只记录、不改写。
用法：SRC=<目录> python3 02_extract.py [输出目录]
"""
import glob, json, os, re, subprocess, sys

SRC = os.environ['SRC']
OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
os.makedirs(OUT, exist_ok=True)

def head(repo):
    return subprocess.run(['git', '-C', os.path.join(SRC, repo), 'rev-parse', 'HEAD'], capture_output=True, text=True, check=True).stdout.strip()

COMMIT = {'openclaw': head('openclaw'), 'hermes-agent': head('hermes-agent')}
REPO_URL = {'openclaw': 'https://github.com/openclaw/openclaw', 'hermes-agent': 'https://github.com/NousResearch/hermes-agent'}

def lines_of(repo, path):
    with open(os.path.join(SRC, repo, path), encoding='utf8') as f:
        return f.read().split('\n')

def by_range(id_, repo, path, a, b):
    ls = lines_of(repo, path)
    return {'id': id_, 'repo': REPO_URL[repo], 'commit': COMMIT[repo], 'path': path, 'lines': [a, b], 'text': '\n'.join(ls[a - 1:b])}

def by_anchor(id_, repo, path, pattern, n, skip=0):
    ls = lines_of(repo, path)
    hit = [i for i, l in enumerate(ls) if re.search(pattern, l)]
    if len(hit) <= skip:
        raise SystemExit(f'anchor not found: {id_} {path} /{pattern}/')
    a = hit[skip] + 1
    return by_range(id_, repo, path, a, a + n - 1)

# ── 1. OpenClaw 扩展包：extensions/*/package.json，是否声明了聊天通道（openclaw.channel）──
rows = []
for f in sorted(glob.glob(os.path.join(SRC, 'openclaw', 'extensions', '*', 'package.json'))):
    name = f.split(os.sep)[-2]
    j = json.load(open(f, encoding='utf8'))
    ch = (j.get('openclaw') or {}).get('channel')
    rows.append((name, 'channel' if ch else '', (ch or {}).get('id', '') if ch else ''))
with open(os.path.join(OUT, 'out_09_extensions.tsv'), 'w', encoding='utf8', newline='\n') as f:
    f.write('# openclaw/openclaw @ %s：extensions/*/package.json，第二列为 channel 表示声明了聊天通道（openclaw.channel）\n' % COMMIT['openclaw'])
    f.write('# name\tkind\tchannel_id\n')
    for r in rows:
        f.write('\t'.join(r) + '\n')
print('extensions:', len(rows), 'channels:', sum(1 for r in rows if r[1]))

# ── 2. 代码片段 ──
ex = [
    # 飞书事件的注册：两边都把 im.message.receive_v1 交给自己的处理函数
    by_range('oc.feishu.register', 'openclaw', 'extensions/feishu/src/monitor.account.ts', 314, 330),
    by_range('oc.feishu.wsclient', 'openclaw', 'extensions/feishu/src/client.ts', 504, 525),
    by_range('oc.feishu.dmpolicy', 'openclaw', 'extensions/feishu/src/bot.ts', 529, 529),
    by_range('hm.feishu.register', 'hermes-agent', 'plugins/platforms/feishu/adapter.py', 1429, 1446),
    by_range('hm.feishu.wsclient', 'hermes-agent', 'plugins/platforms/feishu/adapter.py', 3882, 3890),
    by_range('hm.feishu.msg', 'hermes-agent', 'plugins/platforms/feishu/adapter.py', 2106, 2127),
    # 会话键
    by_range('oc.sessionkey.dm', 'openclaw', 'src/routing/session-key.ts', 220, 220),
    by_range('oc.sessionkey.group', 'openclaw', 'src/routing/session-key.ts', 261, 261),
    by_range('hm.sessionkey.doc', 'hermes-agent', 'gateway/session.py', 682, 693),
    by_range('hm.sessionkey.parts', 'hermes-agent', 'gateway/session.py', 714, 714),
    # 入口到循环
    by_range('hm.base.handle', 'hermes-agent', 'gateway/platforms/base.py', 4038, 4040),
    by_range('oc.embedded.run', 'openclaw', 'src/agents/embedded-agent-runner/run-orchestrator.ts', 111, 113),
    by_range('hm.loop.def', 'hermes-agent', 'agent/conversation_loop.py', 1695, 1695),
    # Hermes 的学习闭环
    by_range('hm.review.doc', 'hermes-agent', 'agent/background_review.py', 1, 6),
    by_range('hm.nudge.memory', 'hermes-agent', 'agent/agent_init.py', 1332, 1332),
    by_range('hm.nudge.skill', 'hermes-agent', 'agent/agent_init.py', 1411, 1411),
]
# OpenClaw 一次通道回合依次经过的阶段名（run-channel-turn.ts 里 emit 的 stage，按出现顺序去重）
rct = '\n'.join(lines_of('openclaw', 'src/channels/turn/run-channel-turn.ts'))
stages = []
for m in re.finditer(r'stage:\s*"([a-z-]+)"', rct):
    if m.group(1) not in stages:
        stages.append(m.group(1))
ex.append({'id': 'oc.turn.stages', 'repo': REPO_URL['openclaw'], 'commit': COMMIT['openclaw'], 'path': 'src/channels/turn/run-channel-turn.ts', 'lines': None, 'text': ' → '.join(stages)})
json.dump({'note': '源码片段，逐字摘自对应提交；MIT 许可。', 'excerpts': ex}, open(os.path.join(OUT, 'out_10_excerpts.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('excerpts:', len(ex), 'stages:', stages)

# ── 3. 文档与自述里的引文 ──
q = [
    by_anchor('oc.readme.def', 'openclaw', 'README.md', r'^OpenClaw is an open-source AI assistant', 1),
    by_anchor('oc.readme.gov', 'openclaw', 'README.md', r'^OpenClaw is developed in the open by the', 1),
    by_anchor('oc.readme.donor', 'openclaw', 'README.md', r'OpenAI is a donor, not an owner', 1),
    by_anchor('oc.readme.sandbox', 'openclaw', 'README.md', r'^Tools run on the host for the main session', 1),
    by_anchor('oc.readme.pi', 'openclaw', 'README.md', r'Special thanks to \[Mario Zechner\]', 1),
    by_anchor('oc.lore.names', 'openclaw', 'docs/start/lore.md', r'In the beginning, there was \*\*Warelay\*\*', 11),
    by_anchor('oc.lore.molt', 'openclaw', 'docs/start/lore.md', r'^## The First Molt', 3),
    by_anchor('oc.messages.pipeline', 'openclaw', 'docs/concepts/messages.md', r'^Inbound messages move through routing', 9),
    by_anchor('oc.arch.gateway', 'openclaw', 'docs/concepts/architecture.md', r'^- A single long-lived \*\*Gateway\*\*', 4),
    by_anchor('oc.memory.md', 'openclaw', 'docs/concepts/memory.md', r'^OpenClaw remembers things by writing plain Markdown', 3),
    by_anchor('oc.workspace.files', 'openclaw', 'docs/concepts/agent-workspace.md', r'^Standard files OpenClaw expects', 1),
    by_anchor('oc.why.sum', 'openclaw', 'docs/start/why-openclaw.md', r'^OpenClaw can separate a trusted \[Gateway\]', 1),
    by_anchor('oc.trust.sandbox', 'openclaw', 'docs/start/why-openclaw/the-trust-boundary.md', r'^\*\*Sandboxing is off by default\.\*\*', 1),
    by_anchor('oc.release.2.0', 'openclaw', 'docs/releases/index.md', r'AKA OpenClaw 2\.0', 1),
    by_anchor('oc.release.sqlite', 'openclaw', 'docs/releases/2026.8.1/installation-and-onboarding.md', r'^This release changes how sessions and transcripts are stored', 1),
    by_anchor('oc.release.scale', 'openclaw', 'docs/releases/2026.8.1.md', r'^\*\*Release scale:\*\*', 1),
    by_anchor('oc.channels.four', 'openclaw', 'docs/install/development-channels.md', r'^OpenClaw ships four update channels', 9),
    by_anchor('oc.feishu.setup', 'openclaw', 'docs/channels/feishu/setup.md', r'openclaw channels login --channel feishu', 1),
    by_anchor('oc.feishu.setup.wizard', 'openclaw', 'docs/channels/feishu/setup.md', r'This installs the `@openclaw/feishu` plugin', 5),
    by_anchor('oc.feishu.durable', 'openclaw', 'docs/channels/feishu/setup.md', r'^OpenClaw durably queues authenticated', 1),
    by_anchor('oc.feishu.dm', 'openclaw', 'docs/channels/feishu/access-control.md', r'^Configure `channels\.feishu\.dmPolicy`', 1),
    by_anchor('oc.feishu.group', 'openclaw', 'docs/channels/feishu/access-control.md', r'^\*\*Group policy\*\*', 1),
    by_anchor('oc.feishu.overview', 'openclaw', 'docs/channels/feishu.md', r'^OpenClaw connects to Feishu/Lark', 3),
    by_anchor('hm.readme.def', 'hermes-agent', 'README.md', r'^\*\*The self-improving AI agent built by', 1),
    by_anchor('hm.readme.backends', 'hermes-agent', 'README.md', r'Seven terminal backends', 1),
    by_anchor('hm.readme.migrate', 'hermes-agent', 'README.md', r'hermes claw migrate # Migrate from OpenClaw', 1),
    by_anchor('hm.agents.what', 'hermes-agent', 'AGENTS.md', r'^Hermes is a personal AI agent that runs the same agent core', 3),
    by_anchor('hm.agents.cache', 'hermes-agent', 'AGENTS.md', r'Per-conversation prompt caching is sacred', 3),
    by_anchor('hm.agents.waist', 'hermes-agent', 'AGENTS.md', r'The core is a narrow waist', 3),
    by_anchor('hm.arch.gateway', 'hermes-agent', 'website/docs/developer-guide/architecture.md', r'^### Gateway Message', 12),
    by_anchor('hm.arch.loop', 'hermes-agent', 'website/docs/developer-guide/agent-loop.md', r'^run_conversation\(\)', 17),
    by_anchor('hm.memory.files', 'hermes-agent', 'website/docs/user-guide/features/memory.md', r'^\| \*\*MEMORY\.md\*\*', 2),
    by_anchor('hm.memory.frozen', 'hermes-agent', 'website/docs/user-guide/features/memory.md', r'Frozen snapshot pattern', 1),
    by_anchor('hm.session.storage', 'hermes-agent', 'website/docs/developer-guide/architecture.md', r'^SQLite-based session storage with FTS5', 1),
    by_anchor('hm.security.boundary', 'hermes-agent', 'SECURITY.md', r'\*\*The only security boundary against an adversarial LLM is the', 2),
    by_anchor('hm.feishu.setup', 'hermes-agent', 'website/docs/user-guide/messaging/feishu.md', r'^Select \*\*Feishu / Lark\*\* and scan the QR code', 1),
    by_anchor('hm.feishu.env', 'hermes-agent', 'website/docs/user-guide/messaging/feishu.md', r'^FEISHU_APP_ID=cli_xxx', 4),
    by_anchor('hm.feishu.behaviour', 'hermes-agent', 'website/docs/user-guide/messaging/feishu.md', r'^\| Direct messages \| Hermes responds', 3),
    by_anchor('hm.feishu.modes', 'hermes-agent', 'website/docs/user-guide/messaging/feishu.md', r'^- `websocket` — recommended', 2),
    by_anchor('hm.feishu.events', 'hermes-agent', 'website/docs/user-guide/messaging/feishu.md', r'`im\.message\.receive_v1` — required for receiving messages', 1),
    by_anchor('hm.feishu.dedupe', 'hermes-agent', 'website/docs/user-guide/messaging/feishu.md', r'^Inbound messages are deduplicated using message IDs', 1),
    by_anchor('hm.feishu.serial', 'hermes-agent', 'website/docs/user-guide/messaging/feishu.md', r'^Messages within the same chat are processed serially', 1),
    by_anchor('hm.feishu.oneapp', 'hermes-agent', 'website/docs/user-guide/messaging/feishu.md', r'Another local Hermes gateway is already using this Feishu app_id', 1),
    by_anchor('hm.migrate.doc', 'hermes-agent', 'website/docs/guides/migrate-from-openclaw.md', r'^`hermes claw migrate` imports your OpenClaw', 1),
]
oc_mig = open(os.path.join(SRC, 'openclaw', 'extensions', 'migrate-hermes', 'README.md'), encoding='utf8').read().split('\n')
q.append({'id': 'oc.migrate.hermes', 'repo': REPO_URL['openclaw'], 'commit': COMMIT['openclaw'], 'path': 'extensions/migrate-hermes/README.md', 'lines': [3, 5], 'text': '\n'.join(oc_mig[2:5])})
json.dump({'note': '文档与自述的逐字引文；每条给出仓库、固定提交与行号。', 'quotes': q}, open(os.path.join(OUT, 'out_11_quotes.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('quotes:', len(q))
json.dump(COMMIT, open(os.path.join(OUT, 'out_12_snapshots.json'), 'w'), indent=1)
