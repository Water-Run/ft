# 从固定版本的源码与文档里摘出画面与旁白用到的原文，每条带仓库、版本、文件、起始行号。
# 用法：python -I 01_excerpts.py <解包目录> > out_01_excerpts.json
#   <解包目录> 下是 6 个源码包各自解开的目录（名字见 SOURCES；源码包的地址与校验和见 FACTS.md）。
# 每条按「锚点」（正则）定位，摘出从锚点所在行起的 n 行；锚点必须恰好命中一次，否则报错退出。
import json, re, sys, os

ROOT = sys.argv[1]
SOURCES = {
    'oc1': ('anomalyco/opencode', 'v1.0.0', 'opencode-v1.0.0'),
    'oc118': ('anomalyco/opencode', 'v1.18.35', 'opencode-v1.18.35'),
    'oc2': ('anomalyco/opencode', 'v2.0.24', 'opencode-v2.0.24'),
    'claw71': ('openclaw/openclaw', 'v2026.7.1', 'openclaw-v2026.7.1'),
    'claw81': ('openclaw/openclaw', 'v2026.8.1', 'openclaw-v2026.8.1'),
    'claw98': ('openclaw/openclaw', 'v2026.9.8', 'openclaw-v2026.9.8'),
}

# (键, 源, 文件, 锚点, 行数[, 前置锚点])：给了前置锚点时，取它之后第一处命中
WANT = [
    # OpenCode v1.0.0：循环、存储、排队、上下文
    ('oc1_loop_start', 'oc1', 'packages/opencode/src/session/prompt.ts', r'^    let step = 0$', 2),
    ('oc1_stream', 'oc1', 'packages/opencode/src/session/prompt.ts', r'^\s+streamText\(\{$', 1),
    ('oc1_stop', 'oc1', 'packages/opencode/src/session/prompt.ts', r'stopWhen: stepCountIs\(1\),', 1),
    ('oc1_continue', 'oc1', 'packages/opencode/src/session/prompt.ts', r'finishReason\) === "tool-calls"', 3),
    ('oc1_busy', 'oc1', 'packages/opencode/src/session/prompt.ts', r'^    if \(isBusy\(input\.sessionID\)\) \{$', 9),
    ('oc1_queue_map', 'oc1', 'packages/opencode/src/session/prompt.ts', r'const queued = new Map<', 1),
    ('oc1_lock', 'oc1', 'packages/opencode/src/storage/storage.ts', r'^  export async function write<T>', 6),
    ('oc1_ctx_completed', 'oc1', 'packages/opencode/src/session/message-v2.ts', r'^            if \(part\.type === "tool"\) \{$', 2),
    ('oc1_ctx_error', 'oc1', 'packages/opencode/src/session/message-v2.ts', r'^              if \(part\.state\.status === "error"\)$', 1),
    ('oc1_ctx_drop', 'oc1', 'packages/opencode/src/session/message-v2.ts', r'^            return \[\]$', 1, r'^            if \(part\.type === "reasoning"\) \{$'),
    # OpenCode v1.18.35：v1 末期仍有主包
    ('oc118_main_pkg', 'oc118', 'packages/opencode/package.json', r'"name": "opencode",', 1),
    # OpenCode v2.0.24：规范、文档、代码
    ('oc2_layers', 'oc2', 'AGENTS.md', r'^- Keep runtime dependencies directed from Schema', 1),
    ('oc2_generate', 'oc2', 'AGENTS.md', r'^- After changing the public Protocol or Server', 1),
    ('oc2_service', 'oc2', 'services/www/src/docs/content/cli/index.mdx', r'^By default, OpenCode discovers or starts one shared background server', 2),
    ('oc2_inbox', 'oc2', 'specs/v2/session.md', r'^`Session\.prompt\(\.\.\.\)` publishes one durable', 1),
    ('oc2_steer', 'oc2', 'specs/v2/session.md', r'^- `steer` is the default\.', 1),
    ('oc2_reload', 'oc2', 'specs/v2/session.md', r'^Before each Step, the runner reloads Session History', 1),
    ('oc2_durable_call', 'oc2', 'specs/v2/session.md', r'^Each complete local tool call is durable before side effects begin\.', 1),
    ('oc2_no_mem_loop', 'oc2', 'specs/v2/session.md', r'The runner never delegates orchestration to an in-memory tool loop\.', 1),
    ('oc2_claim', 'oc2', 'specs/v2/session.md', r'^Execution commits a write-ahead claim', 1),
    ('oc2_orphan', 'oc2', 'specs/v2/session.md', r'^At drain start, orphan reconciliation fails tool calls', 1),
    ('oc2_no_exactly_once', 'oc2', 'specs/v2/session.md', r'^An advisory wake is not itself crash recovery\.', 1),
    ('oc2_retry', 'oc2', 'specs/v2/session.md', r'^Generic scheduled retry covers', 1),
    ('oc2_instr', 'oc2', 'specs/v2/session.md', r'^Instruction sync persists content-addressed values', 1),
    ('oc2_bound', 'oc2', 'specs/v2/tools.md', r'^After tool execution, the registry bounds the model content', 1),
    ('oc2_final_step', 'oc2', 'specs/v2/tools.md', r'^Each model request captures the effective registration', 1),
    ('oc2_feed_law', 'oc2', 'specs/v2/event-stream-architecture.md', r'^> A connection has an independent finite lag budget\.', 1),
    ('oc2_feed_cap', 'oc2', 'specs/v2/event-stream-architecture.md', r'^Each connection receives a `Queue\.dropping` with capacity 4,096', 1),
    ('oc2_bench', 'oc2', 'specs/v2/event-stream-architecture.md', r'^\| Clients \| Current median', 5),
    ('oc2_bench_env', 'oc2', 'specs/v2/event-stream-architecture.md', r'^Results on Apple Silicon', 1),
    ('oc2_compact', 'oc2', 'services/www/src/docs/content/compaction.mdx', r'^When a session approaches the model', 3),
    ('oc2_compact_diag', 'oc2', 'services/www/src/docs/content/compaction.mdx', r'^before   \[ system prompt \]\[ older', 2),
    ('oc2_summary', 'oc2', 'services/www/src/docs/content/compaction.mdx', r'^It covers the objective and requirements', 2),
    ('oc2_warming', 'oc2', 'services/www/src/docs/content/warming.mdx', r'^With this configuration, OpenCode warms a recently active session', 2),
    ('oc2_lsp', 'oc2', 'services/www/src/docs/content/migrate-v1.mdx', r'^V2 accepts and preserves `lsp` configuration', 2),
    ('oc2_plugins', 'oc2', 'services/www/src/docs/content/migrate-v1.mdx', r'^3\. Port plugins, because V1 plugin implementations do not run in V2\.', 1),
    ('oc2_perm_last', 'oc2', 'services/www/src/docs/content/permissions.mdx', r'^The last matching rule wins', 1),
    ('oc2_event_table', 'oc2', 'packages/core/src/event/sql.ts', r'^export const EventTable = sqliteTable\($', 3),
    ('oc2_persist_opt', 'oc2', 'packages/core/src/bus.ts', r'^  /\*\* Retain durable event payloads for historical log reads and replay\. \*/$', 2),
    ('oc2_restart_text', 'oc2', 'packages/core/src/session/execution/restart.ts', r'The server restarted while you were working\.', 1),
    ('oc2_interrupted', 'oc2', 'packages/core/src/session/runner/llm.ts', r'message: `Tool execution interrupted: ', 1),
    # OpenClaw v2026.7.1：2.0 之前的会话存储
    ('claw71_store', 'claw71', 'docs/concepts/session.md', r'^- \*\*Store:\*\* `~/\.openclaw/agents/<agentId>/sessions/sessions\.json`', 2),
    # OpenClaw v2026.8.1 = 2.0
    ('claw_lc_gap', 'claw81', 'docs/concepts/message-lifecycle-refactor.md', r'^The reliability gap that forced the redesign:', 8),
    ('claw_lc_invariant', 'claw81', 'docs/concepts/message-lifecycle-refactor.md', r'^Target invariant: once core decides', 6),
    ('claw_lc_durability', 'claw81', 'docs/concepts/message-lifecycle-refactor.md', r'^Durability is one of `required`, `best_effort`, or `disabled`', 6),
    ('claw_lc_window', 'claw81', 'docs/concepts/message-lifecycle-refactor.md', r'^The boundary that stays dangerous', 4),
    ('claw_lc_reconcile', 'claw81', 'docs/concepts/message-lifecycle-refactor.md', r'^That hook classifies an interrupted send as', 2),
    ('claw_lc_journal', 'claw81', 'docs/concepts/message-lifecycle-refactor.md', r'createDurableInboundReceiveJournal', 1),
    ('claw_lc_watermark', 'claw81', 'docs/concepts/message-lifecycle-refactor.md', r'^OpenClaw only advances the persisted restart watermark', 2),
    ('claw_recovery_states', 'claw81', 'src/infra/outbound/delivery-queue-recovery.ts', r'^function needsUnknownSendReconciliation', 5),
    ('claw_store81', 'claw81', 'docs/concepts/session.md', r'^- \*\*Runtime session rows and transcripts:\*\*', 3),
    ('claw_db_decision', 'claw81', 'docs/refactor/database-first.md', r'^Use a two-level SQLite layout:', 4),
    ('claw_db_runtime', 'claw81', 'docs/refactor/database-first.md', r'^- Runtime never writes or reads session or transcript JSONL as active state\.', 1),
    ('claw_steer_default', 'claw81', 'docs/concepts/queue.md', r'^- `mode: "steer"`$', 1),
    ('claw_steer_mid', 'claw81', 'docs/concepts/queue.md', r'^Same-turn steering is the default\.', 1),
    ('claw_steer_synth', 'claw81', 'docs/concepts/queue.md', r'^`steer` does not abort in-flight tools\.', 1),
    ('claw_signal_log', 'claw81', 'docs/concepts/session-state.md', r'^1\. A \*\*durable signal log\*\*', 3),
    ('claw_signal_one', 'claw81', 'docs/concepts/session-state.md', r'^- \*\*One pending notice per watcher/target pair\.\*\*', 1),
    ('claw_adopt', 'claw81', 'docs/concepts/session-state.md', r'^Watched Claude, Codex, OpenCode, and Pi sessions', 1),
    ('claw_oc_provenance', 'claw81', 'docs/concepts/session-state.md', r"^OpenCode detection is deliberately conservative\.", 1),
    ('claw_notice', 'claw81', 'docs/concepts/session-state.md', r'^Session "agent:main:subagent:child" changed \(other actor\)\.', 1),
    ('claw_changes_json', 'claw81', 'docs/concepts/session-state.md', r'^  "stateVersion": 19,$', 10),
    ('claw_secret_proxy', 'claw81', 'docs/gateway/secrets.md', r'^The secret egress proxy lets Gateway-hosted agent subprocesses', 1),
    ('claw_sentinel', 'claw81', 'docs/gateway/secrets.md', r'^In the agent environment, `\$OPENAI_API_KEY` is an', 1),
    ('claw_agents_budget', 'claw81', 'AGENTS.md', r'^- Model-context budget:', 1),
    ('claw_agents_cache', 'claw81', 'AGENTS.md', r'^- Prompt cache: deterministic ordering', 1),
    ('claw_agents_canonical', 'claw81', 'AGENTS.md', r'^- Refactor default: one canonical path', 1),
    ('claw_agents_sqlite', 'claw81', 'AGENTS.md', r'^- Storage default: SQLite only\.', 1),
    # OpenClaw 2.0 的发布说明（成于 2.0 之后，取自 v2026.9.8）
    ('claw_rel_title', 'claw98', 'docs/releases/2026.8.1.md', r'^title: "v2026\.8\.1 \(AKA OpenClaw 2\.0\)"', 1),
    ('claw_rel_scale', 'claw98', 'docs/releases/2026.8.1.md', r'^\*\*Release scale:\*\*', 1),
    ('claw_rel_bound', 'claw98', 'docs/releases/2026.8.1/security-and-privacy.md', r'^Sensitive work now carries more of its authority with it\.', 1),
    ('claw_rel_approvals', 'claw98', 'docs/releases/2026.8.1/security-and-privacy.md', r'^An \[approval request\]\(/tools/exec-approvals\) now has one durable record', 1),
    ('claw_rel_messaging', 'claw98', 'docs/releases/2026.8.1/messaging.md', r'^Across supported channels, OpenClaw now holds accepted messages', 1),
    ('claw_rel_sqlite', 'claw98', 'docs/releases/2026.8.1/installation-and-onboarding.md', r'^This release changes how sessions and transcripts are stored', 1),
]

def find(key, src, rel, pat, n, after=None):
    repo, ver, d = SOURCES[src]
    p = os.path.join(ROOT, d, rel)
    lines = open(p, encoding='utf-8').read().split('\n')
    hits = [i for i, l in enumerate(lines) if re.search(pat, l)]
    if after:
        a = [i for i, l in enumerate(lines) if re.search(after, l)]
        if len(a) != 1:
            sys.exit(f'{key}: 前置锚点命中 {len(a)} 次')
        hits = [i for i in hits if i > a[0]][:1]
    if len(hits) != 1:
        sys.exit(f'{key}: 锚点命中 {len(hits)} 次：{rel} /{pat}/')
    i = hits[0]
    return {'key': key, 'repo': repo, 'version': ver, 'file': rel, 'line': i + 1, 'text': lines[i:i + n]}

out = [find(*w) for w in WANT]
print(json.dumps(out, ensure_ascii=False, indent=1))
