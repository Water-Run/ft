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
    by_range('hm.feishu.default', 'hermes-agent', 'plugins/platforms/feishu/adapter.py', 1394, 1394),
    by_range('hm.feishu.tools', 'hermes-agent', 'toolsets.py', 44, 47),
    by_range('hm.feishu.docread', 'hermes-agent', 'tools/feishu_doc_tool.py', 1, 4),
    by_range('oc.feishu.parse', 'openclaw', 'extensions/feishu/src/bot.ts', 147, 151),
    by_range('oc.feishu.doctool', 'openclaw', 'extensions/feishu/src/docx.ts', 855, 858),
    by_range('hm.feishu.wsimport', 'hermes-agent', 'plugins/platforms/feishu/adapter.py', 1202, 1202),
    by_anchor('hm.nudge.after', 'hermes-agent', 'agent/turn_finalizer.py', r'Background memory/skill review runs AFTER delivery', 2),
    by_anchor('hm.nudge.memtick', 'hermes-agent', 'agent/turn_context.py', r'def _tick_memory_nudge', 1),
    by_anchor('hm.nudge.skilltick', 'hermes-agent', 'agent/turn_finalizer.py', r'Skill trigger is checked NOW', 1),
    # ── 以下为按「这一类 → 各自实现 → 异同 → Mac mini 链路」的结构补充的片段 ──
    by_anchor('hm.base.connect', 'hermes-agent', 'gateway/platforms/base.py', r'^    async def connect\(self, \*, is_reconnect', 1),
    by_anchor('hm.base.send', 'hermes-agent', 'gateway/platforms/base.py', r'^    async def send\(self, chat_id: str, content: str', 1),
    by_anchor('hm.mem.limits', 'hermes-agent', 'tools/memory_tool.py', r'memory_char_limit", 2200', 1),
    by_anchor('hm.mem.frozen', 'hermes-agent', 'tools/memory_tool.py', r'FROZEN snapshot at session start', 1),
    by_anchor('hm.cache.plan', 'hermes-agent', 'agent/prompt_caching.py', r'^Default layout: 4 cache_control breakpoints', 3),
    by_anchor('hm.launchd.plist', 'hermes-agent', 'hermes_cli/gateway_launchd.py', r'<key>RunAtLoad</key>', 7),
    by_anchor('hm.launchd.label', 'hermes-agent', 'hermes_cli/gateway_launchd.py', r'return f"ai\.hermes\.gateway', 1),
    by_anchor('hm.budget.doc', 'hermes-agent', 'agent/iteration_budget.py', r'^Each ``AIAgent`` \(parent or subagent\)', 3),
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
    by_anchor('oc.readme.gateway', 'openclaw', 'README.md', r'^- The \[Gateway\]\(https://docs\.openclaw\.ai/gateway\) is the local control plane', 1),
    by_anchor('oc.why.plugins', 'openclaw', 'docs/start/why-openclaw.md', r'^Like other OpenClaw features, harnesses ship as plugins', 1),
    by_anchor('oc.messages.sessions', 'openclaw', 'docs/concepts/messages.md', r"^- Direct chats collapse into the agent's main session key", 2),
    by_anchor('oc.channelrouting.dm', 'openclaw', 'docs/channels/channel-routing.md', r'^Direct messages collapse to the agent', 3),
    by_anchor('oc.arch.gateway', 'openclaw', 'docs/concepts/architecture.md', r'^- A single long-lived \*\*Gateway\*\*', 5),
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
    by_anchor('hm.prompt.tiers', 'hermes-agent', 'website/docs/developer-guide/architecture.md', r'assembles the ordered system-prompt tiers', 1),
    by_anchor('hm.feishu.perms', 'hermes-agent', 'website/docs/user-guide/messaging/feishu.md', r'^\| `im:message` \| Receive and read messages', 2),
    by_anchor('hm.feishu.bot', 'hermes-agent', 'website/docs/user-guide/messaging/feishu.md', r'^4\. Enable the \*\*Bot\*\* capability', 1),
    by_anchor('hm.feishu.longconn', 'hermes-agent', 'website/docs/user-guide/messaging/feishu.md', r'Set the connection mode to \*\*Long Connection', 1),
    by_anchor('oc.prompt.build', 'openclaw', 'docs/concepts/agent-loop.md', r'^System prompt is built from OpenClaw', 1),
    by_anchor('oc.loop.def', 'openclaw', 'docs/concepts/agent-loop.md', r'^The agent loop is the serialized', 3),
    by_anchor('oc.feishu.streaming', 'openclaw', 'docs/channels/feishu/advanced-configuration.md', r'^Feishu/Lark supports streaming replies', 1),
    by_anchor('oc.workspace.memory', 'openclaw', 'docs/concepts/agent-workspace.md', r'Curated long-term memory: durable non-profile facts', 1),
    by_anchor('oc.workspace.daily', 'openclaw', 'docs/concepts/agent-workspace.md', r'Daily memory log \(one file per day\)', 1),
    by_anchor('oc.workspace.soul', 'openclaw', 'docs/concepts/agent-workspace.md', r'Persona, tone, and boundaries', 1),
    by_anchor('hm.feishu.post', 'hermes-agent', 'website/docs/user-guide/messaging/feishu.md', r'^When outbound text contains markdown formatting', 3),
    by_anchor('hm.memory.home', 'hermes-agent', 'website/docs/user-guide/features/memory.md', r'^Both are stored in `~/.hermes/memories/`', 1),
    by_anchor('hm.session.sqlite', 'hermes-agent', 'website/docs/user-guide/features/memory.md', r'All CLI and messaging sessions are stored in SQLite', 1),
    by_anchor('oc.feishu.mention', 'openclaw', 'docs/channels/feishu/access-control.md', r'^- Default: @mention required', 1),
    by_anchor('hm.sessionkey.ns', 'hermes-agent', 'gateway/session.py', r'prefix for a session key', 2),
    by_anchor('oc.vision.def', 'openclaw', 'VISION.md', r'^OpenClaw is the AI that actually does things', 2),
    by_anchor('oc.vision.core', 'openclaw', 'VISION.md', r'^Core stays lean; optional capabilities', 1),
    by_anchor('oc.vision.tax', 'openclaw', 'VISION.md', r'^The core carries a per-call tax', 2),
    by_anchor('oc.vision.ts', 'openclaw', 'VISION.md', r'^OpenClaw is primarily an orchestration system', 3),
    by_anchor('oc.vision.memory', 'openclaw', 'VISION.md', r'^Memory is a special plugin slot', 2),
    by_anchor('oc.vision.names', 'openclaw', 'VISION.md', r'^It evolved through several names and shells', 1),
    by_anchor('oc.exec.host', 'openclaw', 'docs/start/why-openclaw/the-trust-boundary.md', r'^\[`tools.exec.host`\]', 1),
    by_anchor('hm.agents.ladder', 'hermes-agent', 'AGENTS.md', r'^\*\*Footprint ladder\*\*', 4),
    by_anchor('hm.arch.entry', 'hermes-agent', 'website/docs/developer-guide/architecture.md', r'CLI \(cli.py\)', 2),
    by_anchor('hm.arch.registry', 'hermes-agent', 'website/docs/developer-guide/architecture.md', r'70\+ tools', 1),
    by_anchor('hm.arch.platforms', 'hermes-agent', 'website/docs/developer-guide/architecture.md', r'^├── plugins/platforms/', 4),
    by_anchor('hm.approvals', 'hermes-agent', 'website/docs/user-guide/security.md', r'^The approval system supports three modes', 1),
    by_anchor('hm.tools.default', 'hermes-agent', 'website/docs/user-guide/features/tools.md', r'Run on your machine \(default\)', 1),
    by_anchor('hm.tools.backend', 'hermes-agent', 'website/docs/user-guide/features/tools.md', r'backend: local +# or: docker', 1),
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
    # ── 以下为按「这一类 → 各自实现 → 异同 → Mac mini 链路」的结构补充的引文 ──
    by_anchor('oc.arch.onehost', 'openclaw', 'docs/concepts/architecture.md', r'^- One Gateway per host', 1),
    by_anchor('oc.arch.clients', 'openclaw', 'docs/concepts/architecture.md', r'^- Control-plane clients \(macOS app, CLI, web UI, automations\)', 3),
    by_anchor('oc.arch.nodes', 'openclaw', 'docs/concepts/architecture.md', r'^- \*\*Nodes\*\* \(macOS/iOS/Android/headless\) also connect', 2),
    by_anchor('oc.arch.first', 'openclaw', 'docs/concepts/architecture.md', r'^- First frame \*\*must\*\* be `connect`', 1),
    by_anchor('oc.arch.wire', 'openclaw', 'docs/concepts/architecture.md', r'Requests: `\{type:"req", id, method, params\}`', 2),
    by_anchor('oc.msg.owned', 'openclaw', 'docs/concepts/messages.md', r'^Sessions are owned by the gateway, not by clients', 1),
    by_anchor('oc.msg.dedupe', 'openclaw', 'docs/concepts/messages.md', r'^Channels can redeliver the same message after a reconnect', 1),
    by_anchor('oc.plugin.owns', 'openclaw', 'docs/plugins/sdk-channel-plugins.md', r'^Channel plugins do not implement send/edit/react tools', 2),
    by_anchor('oc.plugin.core', 'openclaw', 'docs/plugins/sdk-channel-plugins.md', r'^Core owns the shared message tool', 2),
    by_anchor('oc.loop.serial', 'openclaw', 'docs/concepts/agent-loop.md', r'^Runs are serialized per session key \(session lane\)', 1),
    by_anchor('oc.queue.lane', 'openclaw', 'docs/concepts/queue.md', r'CLI, embedded, and Codex runs share the same \*\*session-key lane\*\*', 1),
    by_anchor('oc.queue.mode', 'openclaw', 'docs/concepts/queue.md', r'^- `mode: "steer"`', 1),
    by_anchor('oc.queue.steer', 'openclaw', 'docs/concepts/queue.md', r'^Same-turn steering is the default', 1),
    by_anchor('oc.runtime.def', 'openclaw', 'docs/concepts/agent-runtimes.md', r'^An \*\*agent runtime\*\* owns one prepared model loop', 3),
    by_anchor('oc.runtime.embedded', 'openclaw', 'docs/concepts/agent-runtimes.md', r'^- \*\*Embedded harnesses\*\* run inside', 3),
    by_anchor('oc.runtime.cli', 'openclaw', 'docs/concepts/agent-runtimes.md', r'^- \*\*CLI backends\*\* run a local CLI process', 5),
    by_anchor('oc.runtime.alias', 'openclaw', 'docs/agent-runtime-architecture.md', r'^- The built-in runtime id is `openclaw`', 1),
    by_anchor('oc.prompt.own', 'openclaw', 'docs/concepts/system-prompt.md', r'^OpenClaw builds its own system prompt for every agent run', 1),
    by_anchor('oc.memory.daily', 'openclaw', 'docs/concepts/memory.md', r'^`memory/YYYY-MM-DD\.md` files are the working layer', 4),
    by_anchor('oc.memory.distill', 'openclaw', 'docs/concepts/memory.md', r'^Over time, useful material from daily notes is distilled', 2),
    by_anchor('oc.dreaming.default', 'openclaw', 'docs/concepts/dreaming.md', r'^Dreaming is enabled by default', 1),
    by_anchor('oc.memsearch', 'openclaw', 'docs/concepts/memory-search.md', r'^`memory_search` finds relevant notes', 3),
    by_anchor('oc.heartbeat.def', 'openclaw', 'docs/gateway/heartbeat.md', r'^Heartbeat is a system-owned automation that runs', 3),
    by_anchor('oc.heartbeat.default', 'openclaw', 'docs/gateway/heartbeat.md', r'Leave heartbeats enabled \(default is `30m`', 1),
    by_anchor('oc.session.dmwarn', 'openclaw', 'docs/concepts/session.md', r'^If multiple people can message your agent, enable DM isolation', 3),
    by_anchor('oc.session.dmmain', 'openclaw', 'docs/concepts/session.md', r'^\| `main` \(default\)', 1),
    by_anchor('oc.session.dmpeer', 'openclaw', 'docs/concepts/session.md', r'^\| `per-channel-peer`', 1),
    by_anchor('oc.mini.faq', 'openclaw', 'docs/help/faq-first-run/providers-and-hosting.md', r'No\. OpenClaw runs on macOS or Linux', 2),
    by_anchor('oc.launchd.plist', 'openclaw', 'docs/cli/daemon.md', r'On macOS, `install` writes LaunchAgent plists', 1),
    by_anchor('oc.launchd.keepalive', 'openclaw', 'docs/cli/gateway/service.md', r'KeepAlive auto-recovery stays active', 1),
    by_anchor('oc.launchd.label', 'openclaw', 'docs/gateway/troubleshooting/gateway-service-and-process.md', r'ai\.openclaw\.gateway\.plist', 1),
    by_anchor('oc.onboard', 'openclaw', 'README.md', r'^openclaw onboard --install-daemon', 1),
    by_anchor('hm.loop.core', 'hermes-agent', 'website/docs/developer-guide/agent-loop.md', r'^The core orchestration engine is the `AIAgent` class', 1),
    by_anchor('hm.loop.modes', 'hermes-agent', 'website/docs/developer-guide/agent-loop.md', r'^\| `chat_completions` \|', 3),
    by_anchor('hm.loop.converge', 'hermes-agent', 'website/docs/developer-guide/agent-loop.md', r'All three converge on the same internal message format', 1),
    by_anchor('hm.gw.flow', 'hermes-agent', 'website/docs/developer-guide/gateway-internals.md', r'^1\. \*\*Platform adapter\*\* receives raw event', 4),
    by_anchor('hm.gw.keyfmt', 'hermes-agent', 'website/docs/developer-guide/gateway-internals.md', r'^agent:\{namespace\}:\{platform\}:\{chat_type\}:\{chat_id\}', 1),
    by_anchor('hm.gw.deny', 'hermes-agent', 'website/docs/developer-guide/gateway-internals.md', r'^5\. \*\*Default: deny\*\*', 1),
    by_anchor('hm.gw.guard', 'hermes-agent', 'website/docs/developer-guide/gateway-internals.md', r'^1\. \*\*Level 1 — Base adapter\*\*', 1),
    by_anchor('hm.gw.extend', 'hermes-agent', 'website/docs/developer-guide/gateway-internals.md', r'All extend `BasePlatformAdapter`', 1),
    by_anchor('hm.busy', 'hermes-agent', 'website/docs/user-guide/messaging/index.md', r'busy_input_mode: steer   # or queue, or interrupt \(default\)', 1),
    by_anchor('hm.prompt.split', 'hermes-agent', 'website/docs/developer-guide/prompt-assembly.md', r'^- \*\*cached system prompt state\*\*', 2),
    by_anchor('hm.prompt.three', 'hermes-agent', 'website/docs/developer-guide/prompt-assembly.md', r'^1\. \*\*stable\*\* — identity', 3),
    by_anchor('hm.loop.reuse', 'hermes-agent', 'website/docs/developer-guide/agent-loop.md', r'3\. Build or reuse cached system prompt', 1),
    by_anchor('hm.skills.def', 'hermes-agent', 'website/docs/user-guide/features/skills.md', r'^Skills are on-demand knowledge documents', 1),
    by_anchor('hm.skills.home', 'hermes-agent', 'website/docs/user-guide/features/skills.md', r'^All skills live in \*\*`~/\.hermes/skills/`\*\*', 1),
    by_anchor('hm.skills.view', 'hermes-agent', 'website/docs/developer-guide/prompt-assembly.md', r'your task, load it with skill_view\(name\)', 1),
    by_anchor('hm.tools.register', 'hermes-agent', 'website/docs/developer-guide/tools-runtime.md', r'^Each tool module calls `registry\.register', 1),
    by_anchor('hm.cron.fresh', 'hermes-agent', 'website/docs/user-guide/features/cron.md', r'^- run in fresh agent sessions', 1),
    by_anchor('hm.launchd.doc', 'hermes-agent', 'website/docs/guides/team-telegram-assistant.md', r'^This creates a background service: a user-level \*\*systemd\*\*', 1),
    by_anchor('oc.memory.user', 'openclaw', 'docs/concepts/memory.md', r'^- \*\*`USER\.md`\*\* \(optional\)', 1),
    by_anchor('oc.memory.long', 'openclaw', 'docs/concepts/memory.md', r'^- \*\*`MEMORY\.md`\*\* — long-term memory', 1),
    by_anchor('oc.workspace.soulfile', 'openclaw', 'docs/concepts/agent-workspace.md', r'<Accordion title="SOUL\.md - persona and tone">', 2),
    by_anchor('oc.migrate.cmd', 'openclaw', 'docs/cli/migrate.md', r'^openclaw migrate hermes$', 1),
    by_anchor('oc.runtime.harness', 'openclaw', 'docs/concepts/agent-runtimes.md', r'^A \*\*harness\*\* is the implementation that provides an agent runtime', 1),
    by_anchor('oc.readme.untrusted', 'openclaw', 'README.md', r'Treat inbound messages as untrusted input', 1),
    by_anchor('hm.readme.cmd', 'hermes-agent', 'README.md', r'^hermes +# Interactive CLI', 1),
    by_anchor('hm.readme.gw', 'hermes-agent', 'README.md', r'^hermes gateway +# Start the messaging gateway', 1),
    by_anchor('hm.feishu.grouppolicy', 'hermes-agent', 'website/docs/user-guide/messaging/feishu.md', r'^With the default `allowlist` policy and an empty', 1),
]
oc_mig = open(os.path.join(SRC, 'openclaw', 'extensions', 'migrate-hermes', 'README.md'), encoding='utf8').read().split('\n')
q.append({'id': 'oc.migrate.hermes', 'repo': REPO_URL['openclaw'], 'commit': COMMIT['openclaw'], 'path': 'extensions/migrate-hermes/README.md', 'lines': [3, 5], 'text': '\n'.join(oc_mig[2:5])})
json.dump({'note': '文档与自述的逐字引文；每条给出仓库、固定提交与行号。', 'quotes': q}, open(os.path.join(OUT, 'out_11_quotes.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('quotes:', len(q))
json.dump(COMMIT, open(os.path.join(OUT, 'out_12_snapshots.json'), 'w'), indent=1)

# ── 平台适配器清单：hermes-agent 固定提交的 plugins/platforms/<平台>/adapter.py ──
plat = sorted(d for d in os.listdir(os.path.join(SRC, 'hermes-agent', 'plugins', 'platforms')) if os.path.isfile(os.path.join(SRC, 'hermes-agent', 'plugins', 'platforms', d, 'adapter.py')))
with open(os.path.join(OUT, 'out_16_hermes_platforms.txt'), 'w', encoding='utf8', newline='\n') as f:
    f.write('# hermes-agent @ %s：plugins/platforms/<平台>/adapter.py 的平台目录\n' % COMMIT['hermes-agent'])
    f.write('\n'.join(plat) + '\n')
print('platform adapters:', len(plat))
