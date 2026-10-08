// 由 tools/gen_data.py 从 research/lab/ 生成，不要手改。
window.DATA = {
"ex": {
"oc1_loop_start": {
"repo": "anomalyco/opencode",
"ver": "v1.0.0",
"path": "packages/opencode/src/session/prompt.ts",
"line": 225,
"text": "    let step = 0\n    while (true) {"
},
"oc1_stream": {
"repo": "anomalyco/opencode",
"ver": "v1.0.0",
"path": "packages/opencode/src/session/prompt.ts",
"line": 257,
"text": "        streamText({"
},
"oc1_stop": {
"repo": "anomalyco/opencode",
"ver": "v1.0.0",
"path": "packages/opencode/src/session/prompt.ts",
"line": 308,
"text": "          stopWhen: stepCountIs(1),"
},
"oc1_continue": {
"repo": "anomalyco/opencode",
"ver": "v1.0.0",
"path": "packages/opencode/src/session/prompt.ts",
"line": 412,
"text": "        if ((await stream.finishReason) === \"tool-calls\") {\n          continue\n        }"
},
"oc1_busy": {
"repo": "anomalyco/opencode",
"ver": "v1.0.0",
"path": "packages/opencode/src/session/prompt.ts",
"line": 162,
"text": "    if (isBusy(input.sessionID)) {\n      return new Promise((resolve) => {\n        const queue = state().queued.get(input.sessionID) ?? []\n        queue.push({\n          messageID: userMsg.info.id,\n          callback: resolve,\n        })\n        state().queued.set(input.sessionID, queue)\n      })"
},
"oc1_queue_map": {
"repo": "anomalyco/opencode",
"ver": "v1.0.0",
"path": "packages/opencode/src/session/prompt.ts",
"line": 72,
"text": "      const queued = new Map<"
},
"oc1_lock": {
"repo": "anomalyco/opencode",
"ver": "v1.0.0",
"path": "packages/opencode/src/storage/storage.ts",
"line": 170,
"text": "  export async function write<T>(key: string[], content: T) {\n    const dir = await state().then((x) => x.dir)\n    const target = path.join(dir, ...key) + \".json\"\n    return withErrorHandling(async () => {\n      using _ = await Lock.write(\"storage\")\n      await Bun.write(target, JSON.stringify(content, null, 2))"
},
"oc1_ctx_completed": {
"repo": "anomalyco/opencode",
"ver": "v1.0.0",
"path": "packages/opencode/src/session/message-v2.ts",
"line": 577,
"text": "            if (part.type === \"tool\") {\n              if (part.state.status === \"completed\") {"
},
"oc1_ctx_error": {
"repo": "anomalyco/opencode",
"ver": "v1.0.0",
"path": "packages/opencode/src/session/message-v2.ts",
"line": 608,
"text": "              if (part.state.status === \"error\")"
},
"oc1_ctx_drop": {
"repo": "anomalyco/opencode",
"ver": "v1.0.0",
"path": "packages/opencode/src/session/message-v2.ts",
"line": 630,
"text": "            return []"
},
"oc118_main_pkg": {
"repo": "anomalyco/opencode",
"ver": "v1.18.35",
"path": "packages/opencode/package.json",
"line": 4,
"text": "  \"name\": \"opencode\","
},
"oc2_layers": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "AGENTS.md",
"line": 2,
"text": "- Keep runtime dependencies directed from Schema to Core and Protocol, then from Core and Protocol to Server. Client runtime code may depend on Schema and Protocol but never Core or Server; `sdk` composes Client, Core, and Server."
},
"oc2_generate": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "AGENTS.md",
"line": 1,
"text": "- After changing the public Protocol or Server `HttpApi`, run `bun run generate` from `packages/client`. Do not edit generated client files directly."
},
"oc2_service": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "services/www/src/docs/content/cli/index.mdx",
"line": 48,
"text": "By default, OpenCode discovers or starts one shared background server for your user account. Every local OpenCode client\nconnects to that server, which owns sessions, configuration, integrations, permissions, and tool execution."
},
"oc2_inbox": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/session.md",
"line": 7,
"text": "`Session.prompt(...)` publishes one durable `session.inbox.enqueued` fact whose projection inserts one `session_inbox` row before advisory execution begins. An inbox item remains outside model-visible Session History until delivery. The `session.inbox.delivered` projection consumes the row and inserts a visible user or synthetic message atomically; compaction and move control items are consumed without becoming transcript messages."
},
"oc2_steer": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/session.md",
"line": 18,
"text": "- `steer` is the default. Steers deliver in enqueue order at the next Safe Step Boundary. Delivery stops before a compaction or move control item."
},
"oc2_reload": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/session.md",
"line": 72,
"text": "Before each Step, the runner reloads Session History, resolves the selected agent and model, prepares instructions, and materializes tools. Most Steps make one Physical Attempt. Generic retry, continuation-state rejection, incomplete-stream continuation, or overflow-triggered compaction may make another attempt without promoting input again."
},
"oc2_durable_call": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/session.md",
"line": 74,
"text": "Each complete local tool call is durable before side effects begin. Local calls start eagerly and may run concurrently, but terminal outcome publication remains serialized. Every local and hosted call reaches durable success or failure before the Step publishes its single terminal ended or failed event."
},
"oc2_no_mem_loop": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/session.md",
"line": 80,
"text": "After a local outcome, continuation reloads projected history and begins a new Step. The runner never delegates orchestration to an in-memory tool loop."
},
"oc2_claim": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/session.md",
"line": 68,
"text": "Execution commits a write-ahead claim when a process-local busy period starts. Success, failure, and user interruption release the claim; shutdown interruption and unclean process death preserve it. On startup, managed Node and fetch runtimes resume claimed top-level Sessions, append a durable continuation instruction, and count recovery attempts. Recovery is bounded per claimed execution but does not guarantee exactly-once provider requests or tool effects."
},
"oc2_orphan": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/session.md",
"line": 78,
"text": "At drain start, orphan reconciliation fails tool calls still projected as streaming or running from an earlier process before further model work. It preserves the original assistant attribution and never directly replays ambiguous side effects."
},
"oc2_no_exactly_once": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/session.md",
"line": 116,
"text": "An advisory wake is not itself crash recovery. Crash recovery is driven by a write-ahead execution claim that survives without a releasing terminal. Startup recovery resumes claimed top-level Sessions from durable projected history with bounded attempt accounting. It fails stale running tool projections before continuing, but it cannot prove whether an interrupted external operation already took effect and does not guarantee exactly-once provider or tool behavior."
},
"oc2_retry": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/session.md",
"line": 84,
"text": "Generic scheduled retry covers rate-limit and provider-internal failures, transport failures that are unsent or have unknown delivery, and provider output classified as an incomplete stream. The initial request plus at most four retries use jittered exponential backoff, increased when the provider supplies a longer retry delay."
},
"oc2_instr": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/session.md",
"line": 92,
"text": "Instruction sync persists content-addressed values and may freeze rendered chronological prose. `session.instructions.updated { delta, text? }` maps each changed source key to a SHA-256 content hash, with the literal `\"removed\"` for observed absence. Canonical JSON bodies live once in the machine-local `instruction_blob` store. The projected `instruction_state` row supplies current and epoch-initial values during normal boundary processing. The runner explicitly combines built-ins, ambient discovery, selected-agent skill guidance, references, MCP guidance, and API-managed instruction entries. There is no instruction registry."
},
"oc2_bound": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/tools.md",
"line": 152,
"text": "After tool execution, the registry bounds the model content sent to the provider: only textual parts are measured, native media remains unchanged under producer-owned limits, and the default cut keeps a head-plus-tail split with the omission marker in the middle. Oversized text is retained in managed storage and replaced with a bounded preview; if complete retention fails, execution fails operationally rather than publishing lossy success. Metadata is validated and measured independently and never becomes an unbounded side channel. Managed paths never appear in `Tool.make` or tool output schemas solely for retention bookkeeping."
},
"oc2_final_step": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/tools.md",
"line": 144,
"text": "Each model request captures the effective registration for every advertised name. Execution uses those captured tools; later registration changes affect later requests. Unknown, hook-removed, and final-Step calls fail individually through the same execution seam; the final Step retains tool definitions with `toolChoice: \"none\"` where the provider supports it so the cached prompt prefix survives."
},
"oc2_feed_law": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/event-stream-architecture.md",
"line": 51,
"text": "> A connection has an independent finite lag budget. Exceeding it terminates only that connection while publication and healthy connections continue in order."
},
"oc2_feed_cap": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/event-stream-architecture.md",
"line": 53,
"text": "Each connection receives a `Queue.dropping` with capacity 4,096 accepted public frames."
},
"oc2_bench": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/event-stream-architecture.md",
"line": 205,
"text": "| Clients | Current median | Shared median | Change |\n| ------: | -------------: | ------------: | -----: |\n|       1 |       9.488 ms |      9.554 ms |  +0.7% |\n|      10 |      96.312 ms |     10.352 ms | -89.3% |\n|      50 |     553.928 ms |     12.389 ms | -97.8% |"
},
"oc2_bench_env": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "specs/v2/event-stream-architecture.md",
"line": 203,
"text": "Results on Apple Silicon with Bun 1.3.14:"
},
"oc2_compact": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "services/www/src/docs/content/compaction.mdx",
"line": 10,
"text": "When a session approaches the model's context limit, OpenCode summarizes\neverything except the most recent conversation, about 15,000 tokens by default.\nOnce the summary is ready, it is placed in front of that recent conversation and"
},
"oc2_compact_diag": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "services/www/src/docs/content/compaction.mdx",
"line": 16,
"text": "before   [ system prompt ][ older conversation ............ ][ recent 15k ][ pending work ]\nafter    [ system prompt ][ summary ][ recent 15k ][ pending work ]"
},
"oc2_summary": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "services/www/src/docs/content/compaction.mdx",
"line": 142,
"text": "It covers the objective and requirements, decisions, completed and active work,\nblockers and next moves, and relevant files. In the recent conversation kept"
},
"oc2_warming": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "services/www/src/docs/content/warming.mdx",
"line": 18,
"text": "With this configuration, OpenCode warms a recently active session after four\nminutes without a model request. It continues every four minutes until 30"
},
"oc2_lsp": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "services/www/src/docs/content/migrate-v1.mdx",
"line": 415,
"text": "V2 accepts and preserves `lsp` configuration, but it does not run language servers, expose LSP tools, or produce LSP\ndiagnostics. Replace workflows that depend on those capabilities with the project's lint, typecheck, or compiler commands."
},
"oc2_plugins": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "services/www/src/docs/content/migrate-v1.mdx",
"line": 38,
"text": "3. Port plugins, because V1 plugin implementations do not run in V2."
},
"oc2_perm_last": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "services/www/src/docs/content/permissions.mdx",
"line": 24,
"text": "The last matching rule wins, so the specific exceptions follow the broad rule."
},
"oc2_event_table": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "packages/core/src/event/sql.ts",
"line": 10,
"text": "export const EventTable = sqliteTable(\n  \"event\",\n  {"
},
"oc2_persist_opt": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "packages/core/src/bus.ts",
"line": 178,
"text": "  /** Retain durable event payloads for historical log reads and replay. */\n  readonly persist?: boolean"
},
"oc2_restart_text": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "packages/core/src/session/execution/restart.ts",
"line": 16,
"text": "  \"The server restarted while you were working. Continue from where you left off without repeating completed work.\""
},
"oc2_interrupted": {
"repo": "anomalyco/opencode",
"ver": "v2.0.24",
"path": "packages/core/src/session/runner/llm.ts",
"line": 345,
"text": "              message: `Tool execution interrupted: ${tool.name}${childID ? ` (sessionID: ${childID})` : \"\"}`,"
},
"claw71_store": {
"repo": "openclaw/openclaw",
"ver": "v2026.7.1",
"path": "docs/concepts/session.md",
"line": 116,
"text": "- **Store:** `~/.openclaw/agents/<agentId>/sessions/sessions.json`\n- **Transcripts:** `~/.openclaw/agents/<agentId>/sessions/<sessionId>.jsonl`"
},
"claw_lc_gap": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/message-lifecycle-refactor.md",
"line": 30,
"text": "The reliability gap that forced the redesign:\n\n```text\nTelegram polling update acked\n  -> assistant final text exists\n  -> process restarts before sendMessage succeeds\n  -> final response is lost\n```"
},
"claw_lc_invariant": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/message-lifecycle-refactor.md",
"line": 39,
"text": "Target invariant: once core decides a visible outbound message should exist,\nthe send intent must be durable before the platform call is attempted, and the\nplatform receipt must be committed after success. That gives at-least-once\nrecovery by default. Exactly-once behavior only exists where an adapter proves\nnative idempotency or reconciles an unknown-after-send attempt against\nplatform state before replay."
},
"claw_lc_durability": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/message-lifecycle-refactor.md",
"line": 89,
"text": "Durability is one of `required`, `best_effort`, or `disabled`\n(`MessageDurabilityPolicy` in `src/channels/message/types.ts`). `required`\nfails closed when the durable intent cannot be written; `best_effort` falls\nthrough to a direct send when persistence is unavailable; `disabled` keeps the\npre-refactor direct-send behavior. Legacy compatibility helpers default to\n`disabled` and do not infer `required` just because a channel has a generic"
},
"claw_lc_window": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/message-lifecycle-refactor.md",
"line": 97,
"text": "The boundary that stays dangerous: after the platform call succeeds and before\nthe receipt commits. If the process dies there, core cannot know whether the\nplatform message exists unless the adapter declares `reconcileUnknownSend`.\nThat hook classifies an interrupted send as `sent`, `not_sent`, or"
},
"claw_lc_reconcile": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/message-lifecycle-refactor.md",
"line": 100,
"text": "That hook classifies an interrupted send as `sent`, `not_sent`, or\n`unresolved`; only `not_sent` permits replay. Channels without reconciliation"
},
"claw_lc_journal": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/message-lifecycle-refactor.md",
"line": 63,
"text": "| `durable-receive.ts`   | `createDurableInboundReceiveJournal` — accept/pending/complete/release journal for inbound dedupe                  |"
},
"claw_lc_watermark": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/message-lifecycle-refactor.md",
"line": 123,
"text": "OpenClaw only advances the persisted restart watermark past updates that\nfinished dispatch, so failed or still-pending updates replay after a restart."
},
"claw_recovery_states": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "src/infra/outbound/delivery-queue-recovery.ts",
"line": 238,
"text": "function needsUnknownSendReconciliation(entry: QueuedDelivery): boolean {\n  return (\n    entry.recoveryState === \"send_attempt_started\" || entry.recoveryState === \"unknown_after_send\"\n  );\n}"
},
"claw_store81": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/session.md",
"line": 201,
"text": "- **Runtime session rows and transcripts:** `~/.openclaw/agents/<agentId>/agent/openclaw-agent.sqlite` by default\n- **Archived transcript files:** `~/.openclaw/agents/<agentId>/sessions/`\n- **Legacy row migration source:** `~/.openclaw/agents/<agentId>/sessions/sessions.json`"
},
"claw_db_decision": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/refactor/database-first.md",
"line": 16,
"text": "Use a two-level SQLite layout:\n\n- Global database: `~/.openclaw/state/openclaw.sqlite`\n- Agent database: one SQLite database per agent for agent-owned workspace,"
},
"claw_db_runtime": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/refactor/database-first.md",
"line": 109,
"text": "- Runtime never writes or reads session or transcript JSONL as active state."
},
"claw_steer_default": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/queue.md",
"line": 28,
"text": "- `mode: \"steer\"`"
},
"claw_steer_mid": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/queue.md",
"line": 33,
"text": "Same-turn steering is the default. A prompt that arrives mid-run is injected into the active runtime when the run can accept steering, so no second session run is started. If the active run cannot accept steering, OpenClaw waits for the active run to finish before starting the prompt."
},
"claw_steer_synth": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/queue.md",
"line": 82,
"text": "`steer` does not abort in-flight tools. Skipped OpenClaw tool calls receive synthetic paired error results so the transcript remains valid. Use `/queue interrupt` when the newest message should abort the current run."
},
"claw_signal_log": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/session-state.md",
"line": 15,
"text": "1. A **durable signal log** records selected state changes per session.\n2. **Watchers** hold per-target cursors and receive one coalesced stale-state notice.\n3. **Reconciliation** pulls the exact delta via `session_status` with `changesSince`."
},
"claw_signal_one": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/session-state.md",
"line": 70,
"text": "- **One pending notice per watcher/target pair.** The notice text is byte-stable while pending and the system-event queue dedupes on it, so twenty rapid changes to the same target still produce a single line in the watcher's prompt."
},
"claw_adopt": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/session-state.md",
"line": 52,
"text": "Watched Claude, Codex, OpenCode, and Pi sessions adopted from a session catalog are checked for direct upstream human activity on a fixed cadence. Pi monitoring starts after the session is in its append-only v3 format. Detected activity enters the same signal log and watcher flow as other direct human turns."
},
"claw_oc_provenance": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/session-state.md",
"line": 54,
"text": "OpenCode detection is deliberately conservative. OpenCode's v1 tables do not preserve message provenance, so reporting ambiguous rows would create false alarms; per-message provenance exists only in its v2 schema. OpenCode therefore does not report image-only turns, `@file`-mention-only turns, slash commands routed to a subagent, or turns from ACP clients that annotate content with an audience (mapped by OpenCode to `synthetic` or `ignored`). It also suppresses text matching any of the preceding 50 user messages to catch compaction replay, which means a human deliberately repeating the same text within that window can be missed."
},
"claw_notice": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/session-state.md",
"line": 63,
"text": "Session \"agent:main:subagent:child\" changed (other actor). Reconcile before acting: session_status sessionKey \"agent:main:subagent:child\" changesSince 12."
},
"claw_changes_json": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/concepts/session-state.md",
"line": 82,
"text": "  \"stateVersion\": 19,\n  \"stateChanges\": {\n    \"events\": [\n      {\n        \"sequence\": 14,\n        \"kind\": \"human_direct_message\",\n        \"actorType\": \"human\",\n        \"summary\": \"human message via telegram\"\n      },\n      { \"sequence\": 19, \"kind\": \"goal_changed\", \"actorType\": \"human\", \"summary\": \"goal updated\" }"
},
"claw_secret_proxy": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/gateway/secrets.md",
"line": 320,
"text": "The secret egress proxy lets Gateway-hosted agent subprocesses use shared-store `secret` entries without receiving their plaintext. OpenClaw puts the existing authenticated sentinel in the subprocess environment, then a Gateway-owned loopback proxy replaces it in request URLs, headers, and streamed bodies immediately before egress."
},
"claw_sentinel": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "docs/gateway/secrets.md",
"line": 350,
"text": "In the agent environment, `$OPENAI_API_KEY` is an `oc-sent-v2...end` sentinel. The proxy replaces it with the stored value only for `api.openai.com`. A request to an unbound host is refused with `Secret \"OPENAI_API_KEY\" is not allowed for host \"<host>\". Run: openclaw secrets store set OPENAI_API_KEY --allow-host <host>`."
},
"claw_agents_budget": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "AGENTS.md",
"line": 143,
"text": "- Model-context budget: every injected prompt/tool-schema/context item is bounded with a hard cap; no unbounded items. New model-visible text that can cross ~1K tokens is a P0 review flag needing explicit justification. Context builds incrementally; only compaction rewrites history."
},
"claw_agents_cache": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "AGENTS.md",
"line": 142,
"text": "- Prompt cache: deterministic ordering for maps/sets/registries/plugin lists/files/network results before model/tool payloads. Preserve old transcript bytes when possible."
},
"claw_agents_canonical": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "AGENTS.md",
"line": 111,
"text": "- Refactor default: one canonical path — delete the old one. Keep old behavior only when the user explicitly asks or for an explicit public API/config/plugin SDK/data contract, tagged upgrade path, security/migration boundary, dependency contract, or observed prod state; cite it."
},
"claw_agents_sqlite": {
"repo": "openclaw/openclaw",
"ver": "v2026.8.1",
"path": "AGENTS.md",
"line": 115,
"text": "- Storage default: SQLite only. Do not add JSON/JSONL/TXT/sidecar files for OpenClaw-owned runtime state, caches, queues, registries, indexes, cursors, checkpoints, or plugin scratch data. File storage is only for named product artifacts: import/export, user attachment, log, backup, or external tool contract. Doctrine: `docs/refactor/database-first.md`."
},
"claw_rel_title": {
"repo": "openclaw/openclaw",
"ver": "v2026.9.8",
"path": "docs/releases/2026.8.1.md",
"line": 2,
"text": "title: \"v2026.8.1 (AKA OpenClaw 2.0)\""
},
"claw_rel_scale": {
"repo": "openclaw/openclaw",
"ver": "v2026.9.8",
"path": "docs/releases/2026.8.1.md",
"line": 21,
"text": "**Release scale:** 16,977 pull requests, 698 direct commits, and 987 contributors."
},
"claw_rel_bound": {
"repo": "openclaw/openclaw",
"ver": "v2026.9.8",
"path": "docs/releases/2026.8.1/security-and-privacy.md",
"line": 6,
"text": "Sensitive work now carries more of its authority with it. [Approvals](/tools/exec-approvals) stay attached to the exact request, command, session, and person that received them, removing or pairing a device again retires its old access, and [protected credentials](/gateway/secrets) can reach supported destinations without entering model-visible text. Sandboxes, network requests, browser actions, and plugin installs also recheck the workspace, destination, document, publisher, version, or artifact they depend on, so stale or mismatched authority stops or asks again instead of being reused."
},
"claw_rel_approvals": {
"repo": "openclaw/openclaw",
"ver": "v2026.9.8",
"path": "docs/releases/2026.8.1/security-and-privacy.md",
"line": 12,
"text": "An [approval request](/tools/exec-approvals) now has one durable record shared by authorized browser and supported mobile surfaces. The first valid answer settles it, reconnecting cannot revive a completed request, abandoned requests are cancelled, and aborting a run clears the approvals it left pending. Operators can also opt in to installed Control UI PWA approval alerts that open the authenticated request, with the subscribed device, person, current role and scopes, preferences, and request visibility checked again before delivery. Resolved or expired requests replace stale actionable alerts, while optional agent and task alerts remain off by default."
},
"claw_rel_messaging": {
"repo": "openclaw/openclaw",
"ver": "v2026.9.8",
"path": "docs/releases/2026.8.1/messaging.md",
"line": 8,
"text": "Across supported channels, OpenClaw now holds accepted messages through managed restarts, reports whether a connection is usable, recovering, or blocked, and preserves an uncertain send instead of blindly sending it again. Recovery starts once OpenClaw has accepted the message, and each service still controls what it can confirm beyond that point."
},
"claw_rel_sqlite": {
"repo": "openclaw/openclaw",
"ver": "v2026.9.8",
"path": "docs/releases/2026.8.1/installation-and-onboarding.md",
"line": 9,
"text": "This release changes how sessions and transcripts are stored by moving them into SQLite. Before downgrading to an older file-backed release, use the current CLI to restore archived legacy transcript artifacts; sessions created after the migration will not appear in older releases."
}
},
"meta": {
"opencode_releases": [
{
"tag": "v1.0.0",
"published_at": "2025-10-31T19:28:15Z",
"name": "v1.0.0"
},
{
"tag": "v1.2.0",
"published_at": "2026-02-14T05:20:24Z",
"name": "v1.2.0"
},
{
"tag": "v1.3.0",
"published_at": "2026-03-22T23:32:25Z",
"name": "v1.3.0"
},
{
"tag": "v1.18.35",
"published_at": "2026-10-06T20:18:39Z",
"name": "v1.18.35"
}
],
"opencode_release_lines": {
"v1.2.0": [
"This release includes a data migration that will execute on first run. It will migrate all flat files in data directory to a single sqlite database. Depending on how much data you have and speed of computer this can take some time."
],
"v1.3.0": [
"- **Node.js Support** (#18324): opencode can now run on Node.js in addition to Bun, with a dedicated Node.js entry point and build script that bundles the server with database migrations."
]
},
"opencode_releases_v2_count": 0,
"opencode_v2_tags": [
"v2.0.24",
"v2.0.23",
"v2.0.22",
"v2.0.21",
"v2.0.20",
"v2.0.19",
"v2.0.18",
"v2.0.17",
"v2.0.16",
"v2.0.15",
"v2.0.14",
"v2.0.13",
"v2.0.12",
"v2.0.11",
"v2.0.10",
"v2.0.9",
"v2.0.8",
"v2.0.7",
"v2.0.6",
"v2.0.5",
"v2.0.4",
"v2.0.3",
"v2.0.2",
"v2.0.1",
"v2.0.0"
],
"opencode_tag_commits": {
"v2.0.0": {
"sha": "63f7ceecbed2d7d9a627518d935dd963b9d4ac9f",
"date": "2026-09-11T23:46:37Z",
"message": "fix(release): use V2 Docker artifact paths (#48571)"
},
"v2.0.1": {
"sha": "afc3359eda634d9df012df5fe599e6bbfe26a655",
"date": "2026-09-12T05:01:45Z",
"message": "release: v2.0.1"
},
"v2.0.24": {
"sha": "e7a34f09bfd9134dfade5a8ddb843f7030bc9a69",
"date": "2026-10-06T03:04:12Z",
"message": "release: v2.0.24"
},
"v1.18.35": {
"sha": "53d1eabb61e21162157817bf677da0a4ad3332e3",
"date": "2026-10-06T20:18:24Z",
"message": "release: v1.18.35"
}
},
"opencode_branch_2.0": {
"sha": "7a6ce05d0939826aa6c8e1c481489a713b2d633f",
"date": "2026-04-13T17:47:33Z",
"message": "2.0 exploration (#22335)"
},
"opencode_repo": {
"full_name": "anomalyco/opencode",
"created_at": "2025-04-30T20:08:00Z",
"stargazers_count": 212231,
"default_branch": "dev",
"pushed_at": "2026-10-08T03:05:38Z",
"license": "MIT"
},
"openclaw_repo": {
"full_name": "openclaw/openclaw",
"created_at": "2025-11-24T10:16:47Z",
"stargazers_count": 391609,
"default_branch": "main",
"pushed_at": "2026-10-08T03:05:39Z",
"license": "MIT"
},
"openclaw_releases": [
{
"tag": "v0.1.1",
"published_at": "2025-11-25T13:24:35Z",
"name": "warelay 0.1.1"
},
{
"tag": "v2.0.0-beta1",
"published_at": "2025-12-19T17:25:54Z",
"name": "clawdis 2.0.0-beta1"
},
{
"tag": "v2026.7.1",
"published_at": "2026-07-13T22:33:14Z",
"name": "openclaw 2026.7.1"
},
{
"tag": "v2026.8.1",
"published_at": "2026-08-31T03:30:51Z",
"name": "OpenClaw 2026.8.1"
},
{
"tag": "v2026.9.8",
"published_at": "2026-10-03T03:21:47Z",
"name": "openclaw 2026.9.8"
}
],
"openclaw_readme_lines": {
"v0.1.1": [
{
"line": 1,
"text": "# warelay — Send, receive, and auto-reply on WhatsApp—Twilio-backed or QR-linked."
}
],
"v2.0.0-beta1": [
{
"line": 17,
"text": "**CLAWDIS** is a TypeScript/Node gateway that bridges WhatsApp (Web/Baileys) and Telegram (Bot API/grammY) to a local coding agent (**Pi**)."
}
]
}
},
"exp": {
"v1": {
"timeline": [
"== 2026-10-08T04:00:14Z start: opencode run",
"== 2026-10-08T04:00:19Z tool is running: 13811 /bin/sh -c sleep 20 && echo written >> note.txt",
"== 2026-10-08T04:00:19Z kill -9 opencode pid=13791",
"== 2026-10-08T04:00:20Z continue: opencode run --continue",
"== 2026-10-08T04:00:41Z run --continue exited (0)",
"== 2026-10-08T04:00:42Z orphaned command finished; note.txt now:",
"written",
"written",
"== 2026-10-08T04:00:42Z done"
],
"decisions": [
"0001 stream=true tools=11 last=user -> tool:bash",
"0002 stream=false tools=0 last=user -> text",
"0003 stream=true tools=11 last=user -> tool:bash",
"0004 stream=true tools=11 last=tool -> final"
],
"ps_before": [
"    PID    PPID COMMAND",
"  13779   13773 /home/user/tools/node /home/user/tools/mock.mjs",
"  13791   13773 /home/user/tools/oc1 run Write a note.",
"  13811   13791 /bin/sh -c sleep 20 && echo written >> note.txt",
"  13812   13811 sleep 20"
],
"ps_after": [
"    PID    PPID COMMAND",
"  13779   13773 /home/user/tools/node /home/user/tools/mock.mjs",
"  13811    6012 /bin/sh -c sleep 20 && echo written >> note.txt",
"  13812   13811 sleep 20"
],
"storage": [
"storage/message/ses_ee654c46cffeg62MmZjp5Yoo7s/msg_119ab3b97001TtDcZwHZvVstjB.json",
"storage/message/ses_ee654c46cffeg62MmZjp5Yoo7s/msg_119ab3c13001ZFCD2amw6rZDW5.json",
"storage/migration",
"storage/part/msg_119ab3b97001TtDcZwHZvVstjB/prt_119ab3b98001iSScAexRcUmlu1.json",
"storage/part/msg_119ab3c13001ZFCD2amw6rZDW5/prt_119ab3c40001JLCR7P0jpH9dLh.json",
"storage/part/msg_119ab3c13001ZFCD2amw6rZDW5/prt_119ab3c4a001s3xnlxLv6qFhG7.json",
"storage/project/global.json",
"storage/session/global/ses_ee654c46cffeg62MmZjp5Yoo7s.json"
],
"parts_after_kill": [
{
"file": "part/msg_119ab3c13001ZFCD2amw6rZDW5/prt_119ab3c4a001s3xnlxLv6qFhG7.json",
"tool": "bash",
"status": "running",
"command": "sleep 20 && echo written >> note.txt",
"start": 1791432014949
}
],
"parts_final": [
{
"file": "part/msg_119ab3c13001ZFCD2amw6rZDW5/prt_119ab3c4a001s3xnlxLv6qFhG7.json",
"tool": "bash",
"status": "running",
"command": "sleep 20 && echo written >> note.txt",
"start": 1791432014949
},
{
"file": "part/msg_119ab5389001e39bIfdFuUFwjQ/prt_119ab53b1001Ua73Sy8Ej3Mhzo.json",
"tool": "bash",
"status": "completed",
"command": "sleep 20 && echo written >> note.txt",
"start": 1791432020915
}
],
"req": [
{
"n": 1,
"tools": 11,
"stream": true,
"messages": [
{
"role": "system",
"text": ""
},
{
"role": "system",
"text": ""
},
{
"role": "user",
"text": "Write a note.\n"
}
]
},
{
"n": 2,
"tools": 0,
"stream": null,
"messages": [
{
"role": "system",
"text": ""
},
{
"role": "user",
"text": "\n              The following is the text to summarize:\n            "
},
{
"role": "user",
"text": "Write a note.\n"
}
]
},
{
"n": 3,
"tools": 11,
"stream": true,
"messages": [
{
"role": "system",
"text": ""
},
{
"role": "system",
"text": ""
},
{
"role": "user",
"text": "Write a note.\n"
},
{
"role": "user",
"text": "Continue.\n"
}
]
},
{
"n": 4,
"tools": 11,
"stream": true,
"messages": [
{
"role": "system",
"text": ""
},
{
"role": "system",
"text": ""
},
{
"role": "user",
"text": "Write a note.\n"
},
{
"role": "user",
"text": "Continue.\n"
},
{
"role": "assistant",
"text": "",
"calls": [
{
"id": "call_0003",
"name": "bash",
"args": {
"command": "sleep 20 && echo written >> note.txt",
"description": "Write a note slowly"
}
}
]
},
{
"role": "tool",
"text": "",
"id": "call_0003"
}
]
}
]
},
"v2": {
"timeline": [
"== 2026-10-08T03:34:02Z start: opencode run",
"== 2026-10-08T03:34:08Z tool is running: 9656 /bin/bash -c sleep 20 && echo written >> note.txt",
"== 2026-10-08T03:34:08Z kill -9 service pid=9637",
"== 2026-10-08T03:34:09Z run client exited",
"db=/home/user/.local/share/opencode/opencode.db",
"== 2026-10-08T03:34:09Z restart service",
"== 2026-10-08T03:34:36Z model gave final answer; note.txt now:",
"written",
"written",
"== 2026-10-08T03:34:37Z orphaned command finished; note.txt now:",
"== 2026-10-08T03:34:37Z after recovery",
"written",
"written",
"== 2026-10-08T03:34:37Z done"
],
"decisions": [
"0001 stream=true tools=0 last=user -> text",
"0002 stream=true tools=12 last=user -> tool:shell",
"0003 stream=true tools=12 last=user -> tool:shell",
"0004 stream=true tools=12 last=tool -> final"
],
"ps_before": [
"    PID    PPID COMMAND",
"   9615    9609 /home/user/tools/node /home/user/tools/mock.mjs",
"   9627    9609 /home/user/tools/oc2 run --auto Write a note.",
"   9637    9627 /home/user/tools/oc2 serve --service",
"   9656    9637 /bin/bash -c sleep 20 && echo written >> note.txt",
"   9657    9656 sleep 20"
],
"ps_after": [
"    PID    PPID COMMAND",
"   9615    9609 /home/user/tools/node /home/user/tools/mock.mjs",
"   9656    6012 /bin/bash -c sleep 20 && echo written >> note.txt",
"   9657    9656 sleep 20"
],
"rows_kill": [
{
"seq": 4,
"type": "user",
"text": "\"Write a note.\""
},
{
"seq": 5,
"type": "assistant",
"tool": {
"id": "call_0002",
"name": "shell",
"status": "running",
"command": "sleep 20 && echo written >> note.txt",
"error": null,
"created": 1791430444062,
"ran": 1791430444073
}
}
],
"rows_final": [
{
"seq": 4,
"type": "user",
"text": "\"Write a note.\""
},
{
"seq": 5,
"type": "assistant",
"tool": {
"id": "call_0002",
"name": "shell",
"status": "error",
"command": "sleep 20 && echo written >> note.txt",
"error": {
"type": "aborted",
"message": "Tool execution interrupted: shell"
},
"created": 1791430444062,
"ran": 1791430444073
}
},
{
"seq": 12,
"type": "synthetic",
"text": "The server restarted while you were working. Continue from where you left off without repeating completed work."
},
{
"seq": 15,
"type": "assistant",
"tool": {
"id": "call_0003",
"name": "shell",
"status": "completed",
"command": "sleep 20 && echo written >> note.txt",
"error": null,
"created": 1791430455804,
"ran": 1791430455811
}
},
{
"seq": 22,
"type": "assistant",
"text": "The note has been written."
},
{
"seq": 27,
"type": "idle",
"outcome": "succeeded"
}
],
"seq_kill": 11,
"seq_final": 27,
"claim_kill": {
"id": "ses_ee66cbe34ffeMKv305mM7Ec67Y",
"directory": "/home/user/demo",
"version": "2.0.24",
"time_idle": null,
"idle_outcome": null,
"time_suspended": 1791430443929,
"resume_attempts": 0
},
"claim_final": {
"id": "ses_ee66cbe34ffeMKv305mM7Ec67Y",
"directory": "/home/user/demo",
"version": "2.0.24",
"time_idle": 1791430475936,
"idle_outcome": "succeeded",
"time_suspended": null,
"resume_attempts": 0
},
"tables": [
"account",
"account_state",
"control_account",
"credential",
"event",
"event_sequence",
"instruction_blob",
"instruction_entry",
"instruction_state",
"kv",
"migration",
"permission",
"project",
"project_directory",
"session_inbox",
"session_message",
"session_pending",
"session_v2",
"workspace",
"worktree"
],
"req": [
{
"n": 1,
"tools": 0,
"stream": true,
"messages": [
{
"role": "system",
"text": ""
},
{
"role": "user",
"text": "\"Write a note.\""
}
]
},
{
"n": 2,
"tools": 12,
"stream": true,
"messages": [
{
"role": "system",
"text": ""
},
{
"role": "user",
"text": "\"Write a note.\""
}
]
},
{
"n": 3,
"tools": 12,
"stream": true,
"messages": [
{
"role": "system",
"text": ""
},
{
"role": "user",
"text": "\"Write a note.\""
},
{
"role": "assistant",
"text": "",
"calls": [
{
"id": "call_0002",
"name": "shell",
"args": {
"command": "sleep 20 && echo written >> note.txt",
"description": "Write a note slowly"
}
}
]
},
{
"role": "tool",
"text": "{\"error\":{\"type\":\"aborted\",\"message\":\"Tool execution interrupted: shell\"},\"content\":[]}",
"id": "call_0002"
},
{
"role": "user",
"text": "The server restarted while you were working. Continue from where you left off without repeating completed work."
}
]
},
{
"n": 4,
"tools": 12,
"stream": true,
"messages": [
{
"role": "system",
"text": ""
},
{
"role": "user",
"text": "\"Write a note.\""
},
{
"role": "assistant",
"text": "",
"calls": [
{
"id": "call_0002",
"name": "shell",
"args": {
"command": "sleep 20 && echo written >> note.txt",
"description": "Write a note slowly"
}
}
]
},
{
"role": "tool",
"text": "{\"error\":{\"type\":\"aborted\",\"message\":\"Tool execution interrupted: shell\"},\"content\":[]}",
"id": "call_0002"
},
{
"role": "user",
"text": "The server restarted while you were working. Continue from where you left off without repeating completed work."
},
{
"role": "assistant",
"text": "",
"calls": [
{
"id": "call_0003",
"name": "shell",
"args": {
"command": "sleep 20 && echo written >> note.txt",
"description": "Write a note slowly"
}
}
]
},
{
"role": "tool",
"text": "/bin/bash: warning: setlocale: LC_ALL: cannot change locale (zh_CN.UTF-8)\n",
"id": "call_0003"
}
]
}
]
}
}
};
