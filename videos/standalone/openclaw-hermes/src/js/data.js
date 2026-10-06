// 由 tools/gen_data.py 从 research/lab/ 的取证回显生成，不要手改。
window.DATA = {
 "ex": {
  "hm.base.handle": {
   "commit": "4787e4d56f",
   "lines": [
    4038,
    4040
   ],
   "path": "gateway/platforms/base.py",
   "text": "    async def handle_message(self, event: MessageEvent) -> None:\n        \"\"\"Process an incoming message; returns quickly by spawning a background\n        task so new messages (and interrupts) can arrive while an agent runs.\"\"\""
  },
  "hm.feishu.msg": {
   "commit": "4787e4d56f",
   "lines": [
    2106,
    2127
   ],
   "path": "plugins/platforms/feishu/adapter.py",
   "text": "    async def _handle_message_event_data(self, data: Any) -> None:\n        \"\"\"Shared inbound message handling for websocket and webhook transports.\"\"\"\n        event = getattr(data, \"event\", None)\n        message = getattr(event, \"message\", None)\n        sender = getattr(event, \"sender\", None)\n        if not message or not sender or not getattr(sender, \"sender_id\", None):\n            logger.debug(\"[Feishu] Dropping malformed inbound event: missing message/sender\")\n            return\n        message_id = getattr(message, \"message_id\", None)\n        if not message_id or await self._is_duplicate(message_id):\n            logger.debug(\"[Feishu] Dropping duplicate/missing message_id: %s\", message_id)\n            return\n        reason = self._admit(sender, message)\n        if reason is not None:\n            logger.debug(\"[Feishu] dropping inbound event: %s\", reason)\n            if reason == \"group_policy_rejected\":\n                self._warn_once_empty_allowlist_deny(getattr(message, \"chat_id\", \"\") or \"\")\n            return\n        await self._process_inbound_message(\n            data=data, message=message, sender_id=getattr(sender, \"sender_id\", None),\n            chat_type=getattr(message, \"chat_type\", \"p2p\"), message_id=message_id, is_bot=_is_bot_sender(sender),\n        )"
  },
  "hm.feishu.register": {
   "commit": "4787e4d56f",
   "lines": [
    1429,
    1446
   ],
   "path": "plugins/platforms/feishu/adapter.py",
   "text": "    def _build_event_handler(self) -> Any:\n        if EventDispatcherHandler is None:\n            return None\n        return (\n            EventDispatcherHandler.builder(self._encrypt_key, self._verification_token)\n            .register_p2_im_message_message_read_v1(self._on_message_read_event)\n            .register_p2_im_message_receive_v1(self._on_message_event)\n            .register_p2_im_message_reaction_created_v1(lambda d: self._on_reaction_event(\"im.message.reaction.created_v1\", d))\n            .register_p2_im_message_reaction_deleted_v1(lambda d: self._on_reaction_event(\"im.message.reaction.deleted_v1\", d))\n            .register_p2_card_action_trigger(self._on_card_action_trigger)\n            .register_p2_im_chat_member_bot_added_v1(self._on_bot_added_to_chat)\n            .register_p2_im_chat_member_bot_deleted_v1(self._on_bot_removed_from_chat)\n            .register_p2_im_chat_access_event_bot_p2p_chat_entered_v1(self._on_p2p_chat_entered)\n            .register_p2_im_message_recalled_v1(self._on_message_recalled)\n            .register_p2_customized_event(\"drive.notice.comment_add_v1\", self._on_drive_comment_event)\n            .register_p2_customized_event(\"vc.bot.meeting_invited_v1\", self._on_meeting_invited_event)\n            .build()\n        )"
  },
  "hm.feishu.wsclient": {
   "commit": "4787e4d56f",
   "lines": [
    3882,
    3890
   ],
   "path": "plugins/platforms/feishu/adapter.py",
   "text": "        self._ws_client = FeishuWSClient(\n            app_id=self._app_id,\n            app_secret=self._app_secret,\n            log_level=lark.LogLevel.INFO,\n            event_handler=self._event_handler,\n            domain=domain,\n            # Without the \"channel\" UA tag Feishu won't push group @mention events over WS.\n            extra_ua_tags=[\"channel\"],\n        )"
  },
  "hm.loop.def": {
   "commit": "4787e4d56f",
   "lines": [
    1695,
    1695
   ],
   "path": "agent/conversation_loop.py",
   "text": "def run_conversation("
  },
  "hm.nudge.memory": {
   "commit": "4787e4d56f",
   "lines": [
    1332,
    1332
   ],
   "path": "agent/agent_init.py",
   "text": "    agent._memory_nudge_interval = 10"
  },
  "hm.nudge.skill": {
   "commit": "4787e4d56f",
   "lines": [
    1411,
    1411
   ],
   "path": "agent/agent_init.py",
   "text": "    agent._skill_nudge_interval = 10"
  },
  "hm.review.doc": {
   "commit": "4787e4d56f",
   "lines": [
    1,
    6
   ],
   "path": "agent/background_review.py",
   "text": "\"\"\"Background memory/skill review — fork the agent to evaluate the turn. After every turn\n``AIAgent.run_conversation`` may spawn a daemon thread that replays the conversation snapshot in a\nforked :class:`AIAgent` and asks \"should any skill/memory be saved or updated?\". Writes go\nstraight to the memory + skill stores; the main conversation and prompt cache are never touched.\nThe fork inherits the parent's live runtime (provider, model, credentials, cached system prompt)\nso it hits the same prefix cache, and runs under a dispatch-side tool whitelist.\"\"\""
  },
  "hm.sessionkey.doc": {
   "commit": "4787e4d56f",
   "lines": [
    682,
    693
   ],
   "path": "gateway/session.py",
   "text": "def build_session_key(\n    source: SessionSource, group_sessions_per_user: bool = True,\n    thread_sessions_per_user: bool = False, profile: Optional[str] = None,\n) -> str:\n    \"\"\"Build a deterministic session key from a message source (single source of truth).\n\n    Layout: ``<ns>:<platform>:<chat_type>[:<slack scope_id>][:<chat_id>][:<thread_id>][:<user>]``.\n    Slack ``scope_id`` precedes chat ids (Discord guild scope is deliberately NOT added, for key\n    compatibility). DMs are isolated per chat_id, falling back to the sender id, then to one\n    session per platform. Groups add the participant id only when ``group_sessions_per_user`` and\n    not in a thread (threads are shared unless ``thread_sessions_per_user``).\n    \"\"\""
  },
  "hm.sessionkey.parts": {
   "commit": "4787e4d56f",
   "lines": [
    714,
    714
   ],
   "path": "gateway/session.py",
   "text": "    parts = [_session_key_namespace(profile), source.platform.value, chat_type_slot]"
  },
  "oc.embedded.run": {
   "commit": "195e1cc6c1",
   "lines": [
    111,
    113
   ],
   "path": "src/agents/embedded-agent-runner/run-orchestrator.ts",
   "text": "export function runEmbeddedAgent(\n  internalParamsInput: RunEmbeddedAgentInternalParams,\n): Promise<EmbeddedAgentRunResult> {"
  },
  "oc.feishu.dmpolicy": {
   "commit": "195e1cc6c1",
   "lines": [
    529,
    529
   ],
   "path": "extensions/feishu/src/bot.ts",
   "text": "  const dmPolicy = feishuCfg?.dmPolicy ?? \"pairing\";"
  },
  "oc.feishu.register": {
   "commit": "195e1cc6c1",
   "lines": [
    314,
    330
   ],
   "path": "extensions/feishu/src/monitor.account.ts",
   "text": "  eventDispatcher.register({\n    \"im.message.receive_v1\": createFeishuMessageReceiveHandler({\n      cfg,\n      channelRuntime,\n      accountId,\n      runtime,\n      chatHistories,\n      fireAndForget,\n      isAccountActive: context.isAccountActive,\n      trackTask: context.trackTask,\n      handleMessage: handleFeishuMessage,\n      resolveDebounceText: ({ event, botOpenId }) =>\n        parseFeishuMessageEvent(event, botOpenId).content,\n      hasProcessedMessage: hasProcessedFeishuMessage,\n      getBotOpenId: (id) => botOpenIds.get(id),\n      resolveSequentialKey: getFeishuSequentialKey,\n      resolveIngressLifecycle: context.resolveIngressLifecycle,"
  },
  "oc.feishu.wsclient": {
   "commit": "195e1cc6c1",
   "lines": [
    504,
    525
   ],
   "path": "extensions/feishu/src/client.ts",
   "text": "export async function createFeishuWSClient(\n  account: ResolvedFeishuAccount,\n  callbacks: FeishuWsClientCallbacks = {},\n): Promise<Lark.WSClient> {\n  const { accountId, appId, appSecret, domain } = account;\n\n  if (!appId || !appSecret) {\n    throw new Error(`Feishu credentials not configured for account \"${accountId}\"`);\n  }\n\n  const agent = await getFeishuProxyAgent();\n  const defaultHttpTimeoutMs = resolveConfiguredHttpTimeoutMs(account);\n  return new Lark.WSClient({\n    appId,\n    appSecret,\n    domain: resolveSdkDomain(domain),\n    httpInstance: createFeishuHttpInstance(defaultHttpTimeoutMs, domain),\n    ...callbacks,\n    loggerLevel: Lark.LoggerLevel.info,\n    wsConfig: FEISHU_WS_CONFIG,\n    ...(agent ? { agent } : {}),\n  });"
  },
  "oc.sessionkey.dm": {
   "commit": "195e1cc6c1",
   "lines": [
    220,
    220
   ],
   "path": "src/routing/session-key.ts",
   "text": "    const dmScope = params.dmScope ?? \"main\";"
  },
  "oc.sessionkey.group": {
   "commit": "195e1cc6c1",
   "lines": [
    261,
    261
   ],
   "path": "src/routing/session-key.ts",
   "text": "  return `agent:${normalizeAgentId(params.agentId)}:${channel}:${peerKind}:${peerId}`;"
  },
  "oc.turn.stages": {
   "commit": "195e1cc6c1",
   "lines": null,
   "path": "src/channels/turn/run-channel-turn.ts",
   "text": "ingest → classify → preflight → assemble → finalize"
  }
 },
 "ext": [
  [
   "a2a",
   1
  ],
  [
   "acpx",
   0
  ],
  [
   "admin-http-rpc",
   0
  ],
  [
   "agentsapi",
   0
  ],
  [
   "alibaba",
   0
  ],
  [
   "amazon-bedrock-mantle",
   0
  ],
  [
   "amazon-bedrock",
   0
  ],
  [
   "anthropic-vertex",
   0
  ],
  [
   "anthropic",
   0
  ],
  [
   "apple-fm",
   0
  ],
  [
   "arcee",
   0
  ],
  [
   "azure-speech",
   0
  ],
  [
   "baseten",
   0
  ],
  [
   "beam",
   0
  ],
  [
   "bonjour",
   0
  ],
  [
   "brave",
   0
  ],
  [
   "browser",
   0
  ],
  [
   "buzz",
   1
  ],
  [
   "byteplus",
   0
  ],
  [
   "canvas",
   0
  ],
  [
   "cerebras",
   0
  ],
  [
   "chutes",
   0
  ],
  [
   "clawrouter",
   0
  ],
  [
   "clickclack",
   1
  ],
  [
   "cloudflare-ai-gateway",
   0
  ],
  [
   "cloudflare",
   0
  ],
  [
   "code-mode-quickjs",
   0
  ],
  [
   "codex",
   0
  ],
  [
   "cohere",
   0
  ],
  [
   "comfy",
   0
  ],
  [
   "copilot-proxy",
   0
  ],
  [
   "copilot",
   0
  ],
  [
   "crabbox",
   0
  ],
  [
   "cua-computer",
   0
  ],
  [
   "deepgram",
   0
  ],
  [
   "deepinfra",
   0
  ],
  [
   "deepseek",
   0
  ],
  [
   "diagnostics-otel",
   0
  ],
  [
   "diagnostics-prometheus",
   0
  ],
  [
   "diffs-language-pack",
   0
  ],
  [
   "diffs",
   0
  ],
  [
   "discord",
   1
  ],
  [
   "document-extract",
   0
  ],
  [
   "duckduckgo",
   0
  ],
  [
   "elevenlabs",
   0
  ],
  [
   "exa",
   0
  ],
  [
   "facetime",
   0
  ],
  [
   "fal",
   0
  ],
  [
   "featherless",
   0
  ],
  [
   "feishu",
   1
  ],
  [
   "file-transfer",
   0
  ],
  [
   "firecrawl",
   0
  ],
  [
   "fireworks",
   0
  ],
  [
   "fish-audio-speech",
   0
  ],
  [
   "geolocation",
   0
  ],
  [
   "github-copilot",
   0
  ],
  [
   "github",
   0
  ],
  [
   "gmi",
   0
  ],
  [
   "google-meet",
   0
  ],
  [
   "google",
   0
  ],
  [
   "googlechat",
   1
  ],
  [
   "gradium",
   0
  ],
  [
   "groq",
   0
  ],
  [
   "huggingface",
   0
  ],
  [
   "image-generation-core",
   0
  ],
  [
   "imap",
   0
  ],
  [
   "imessage",
   1
  ],
  [
   "inworld",
   0
  ],
  [
   "irc",
   1
  ],
  [
   "kie",
   0
  ],
  [
   "kilocode",
   0
  ],
  [
   "kimi-coding",
   0
  ],
  [
   "line",
   1
  ],
  [
   "linux-node",
   0
  ],
  [
   "litellm",
   0
  ],
  [
   "llama-cpp",
   0
  ],
  [
   "llm-task",
   0
  ],
  [
   "lmstudio",
   0
  ],
  [
   "lobster",
   0
  ],
  [
   "logbook",
   0
  ],
  [
   "longcat",
   0
  ],
  [
   "matrix",
   1
  ],
  [
   "mattermost",
   1
  ],
  [
   "memory-core",
   0
  ],
  [
   "memory-lancedb",
   0
  ],
  [
   "memory-wiki",
   0
  ],
  [
   "meta",
   0
  ],
  [
   "microsoft-foundry",
   0
  ],
  [
   "microsoft",
   0
  ],
  [
   "migrate-claude",
   0
  ],
  [
   "migrate-hermes",
   0
  ],
  [
   "minimax",
   0
  ],
  [
   "mistral",
   0
  ],
  [
   "moonshot",
   0
  ],
  [
   "msteams",
   1
  ],
  [
   "mxc",
   0
  ],
  [
   "nextcloud-talk",
   1
  ],
  [
   "nostr",
   1
  ],
  [
   "novita",
   0
  ],
  [
   "nvidia",
   0
  ],
  [
   "oc-path",
   0
  ],
  [
   "ollama",
   0
  ],
  [
   "onepassword",
   0
  ],
  [
   "onnx",
   0
  ],
  [
   "openai",
   0
  ],
  [
   "opencode-go",
   0
  ],
  [
   "opencode",
   0
  ],
  [
   "openrouter",
   0
  ],
  [
   "openshell",
   0
  ],
  [
   "parallel",
   0
  ],
  [
   "perplexity",
   0
  ],
  [
   "pixverse",
   0
  ],
  [
   "policy",
   0
  ],
  [
   "qa-channel",
   1
  ],
  [
   "qa-lab",
   0
  ],
  [
   "qianfan",
   0
  ],
  [
   "qwen",
   0
  ],
  [
   "radius",
   0
  ],
  [
   "raft",
   1
  ],
  [
   "reef",
   1
  ],
  [
   "runway",
   0
  ],
  [
   "searxng",
   0
  ],
  [
   "senseaudio",
   0
  ],
  [
   "session-share",
   0
  ],
  [
   "sglang",
   0
  ],
  [
   "signal",
   1
  ],
  [
   "slack-huddles",
   0
  ],
  [
   "slack",
   1
  ],
  [
   "sms",
   1
  ],
  [
   "stepfun",
   0
  ],
  [
   "synology-chat",
   1
  ],
  [
   "synthetic",
   0
  ],
  [
   "tavily",
   0
  ],
  [
   "team-reports",
   0
  ],
  [
   "teams-meetings",
   0
  ],
  [
   "telegram",
   1
  ],
  [
   "tencent",
   0
  ],
  [
   "tlon",
   1
  ],
  [
   "together",
   0
  ],
  [
   "tokenjuice",
   0
  ],
  [
   "tts-local-cli",
   0
  ],
  [
   "twitch",
   1
  ],
  [
   "typesafe",
   0
  ],
  [
   "vault",
   0
  ],
  [
   "venice",
   0
  ],
  [
   "vercel-ai-gateway",
   0
  ],
  [
   "visitor-access",
   0
  ],
  [
   "vllm",
   0
  ],
  [
   "voice-call",
   0
  ],
  [
   "volcengine",
   0
  ],
  [
   "voyage",
   0
  ],
  [
   "vydra",
   0
  ],
  [
   "web-readability",
   0
  ],
  [
   "whatsapp",
   1
  ],
  [
   "workboard",
   0
  ],
  [
   "x",
   1
  ],
  [
   "xai",
   0
  ],
  [
   "xiaomi",
   0
  ],
  [
   "zai",
   0
  ],
  [
   "zalo",
   1
  ],
  [
   "zalouser",
   1
  ],
  [
   "zoom-meetings",
   0
  ]
 ],
 "extChannels": 28,
 "extCount": 162,
 "fe": {
  "community": "2026-01-25",
  "communityPkg": "@m1heng-clawd/feishu",
  "larksuite": "2026-03-03",
  "larksuiteDesc": "OpenClaw Feishu/Lark channel plugin (official by Feishu team)",
  "larksuitePkg": "@larksuiteoapi/feishu-openclaw-plugin",
  "official": "2026-02-04",
  "officialDesc": "OpenClaw Feishu/Lark channel plugin for chats and workplace tools (community maintained by @m1heng).",
  "officialPkg": "@openclaw/feishu"
 },
 "hmEvents": {
  "launch": "2026-02-25",
  "repo": "2025-07-23"
 },
 "hmFirstRel": "2026-03-12",
 "hmLastRel": "2026-09-24",
 "hmLastTag": "Hermes Agent v0.21.5 (v2026.9.24)",
 "hmModels": [
  {
   "d": "2023-06-03",
   "n": "Nous-Hermes",
   "src": "Hugging Face 仓库创建"
  },
  {
   "d": "2024-03-11",
   "n": "Hermes 2 Pro",
   "src": "Hugging Face 仓库创建"
  },
  {
   "d": "2024-08-15",
   "n": "Hermes 3",
   "src": "arXiv 2408.11857"
  },
  {
   "d": "2025-08-25",
   "n": "Hermes 4",
   "src": "arXiv 2508.18255"
  }
 ],
 "names": [
  {
   "from": "2025-11-24",
   "name": "warelay",
   "readme": "Send, receive, and auto-reply on WhatsApp",
   "readmeTitle": "📡 warelay — Send, receive, and auto-reply on WhatsApp—Twilio-backed or QR-linked.",
   "rel": "2025-11-25",
   "ver": "v0.1.1"
  },
  {
   "from": "2025-12-19",
   "name": "CLAWDIS",
   "readme": "WhatsApp & Telegram Gateway for AI Agents",
   "readmeTitle": "🦞 CLAWDIS — WhatsApp & Telegram Gateway for AI Agents",
   "rel": "2025-12-19",
   "ver": "v2.0.0-beta1"
  },
  {
   "from": "2026-01-05",
   "name": "Clawdbot",
   "readme": "Personal AI Assistant",
   "readmeTitle": "🦞 CLAWDBOT — Personal AI Assistant",
   "rel": "2026-01-05",
   "ver": "v2026.1.5"
  },
  {
   "from": "2026-01-27",
   "name": "Moltbot",
   "readme": null,
   "readmeTitle": null,
   "rel": null,
   "ver": null
  },
  {
   "from": "2026-01-30",
   "name": "OpenClaw",
   "readme": "Personal AI Assistant",
   "readmeTitle": "🦞 OpenClaw — Personal AI Assistant",
   "rel": "2026-01-30",
   "ver": "v2026.1.29"
  }
 ],
 "npm": {
  "@larksuiteoapi/feishu-openclaw-plugin": {
   "created": "2026-03-03",
   "first": "2026.3.3",
   "latest": "2026.3.8",
   "versions": 14
  },
  "@m1heng-clawd/feishu": {
   "created": "2026-01-25",
   "first": "0.1.0",
   "latest": "0.1.19",
   "versions": 21
  },
  "@openclaw/feishu": {
   "created": "2026-02-04",
   "first": "2026.2.2",
   "latest": "2026.9.8",
   "versions": 151
  },
  "clawdbot": {
   "created": "2026-01-04",
   "first": "2026.1.4",
   "latest": "2026.1.24-3",
   "versions": 37
  },
  "clawdis": {
   "created": "2025-12-19",
   "first": "2.0.0-beta1",
   "latest": "2.0.0-beta4",
   "versions": 4
  },
  "moltbot": {
   "created": "2026-01-27",
   "first": "0.1.0",
   "latest": "0.1.0",
   "versions": 2
  },
  "openclaw": {
   "created": "2026-01-29",
   "first": "0.0.1",
   "latest": "2026.9.8",
   "versions": 266
  },
  "warelay": {
   "created": "2025-11-25",
   "first": "0.1.0",
   "latest": "1.3.0",
   "versions": 10
  }
 },
 "q": {
  "hm.agents.cache": {
   "line": 20,
   "path": "AGENTS.md",
   "text": "- **Per-conversation prompt caching is sacred.** Mutating past context, swapping toolsets,\n  reloading memories or rebuilding the system prompt mid-conversation breaks the cached prefix and\n  multiplies the user's cost; the ONE exception is context compression. Slash commands that change"
  },
  "hm.agents.waist": {
   "line": 24,
   "path": "AGENTS.md",
   "text": "- **The core is a narrow waist; capability lives at the edges.** Every model tool is sent on\n  every API call, so the bar for a new *core* tool is high. New capability should arrive as a\n  CLI command + skill, a service-gated tool, or a plugin — not as core surface."
  },
  "hm.agents.what": {
   "line": 12,
   "path": "AGENTS.md",
   "text": "Hermes is a personal AI agent that runs the same agent core across a CLI, a messaging\ngateway (Telegram, Discord, Slack, ~20 platforms), a TUI, and an Electron desktop app. It\nlearns across sessions (memory + skills), delegates to subagents, runs scheduled jobs, and"
  },
  "hm.arch.gateway": {
   "line": 153,
   "path": "website/docs/developer-guide/architecture.md",
   "text": "### Gateway Message\n\n```text\nPlatform event → Adapter.on_message() → MessageEvent\n  → GatewayRunner._handle_message()\n    → authorize user\n    → resolve session key\n    → create AIAgent with session history\n    → AIAgent.run_conversation()\n    → deliver response back through adapter\n```\n"
  },
  "hm.arch.loop": {
   "line": 64,
   "path": "website/docs/developer-guide/agent-loop.md",
   "text": "run_conversation()\n  1. Generate task_id if not provided\n  2. Append user message to conversation history\n  3. Build or reuse cached system prompt (prompt_builder.py)\n  4. Check if preflight compression is needed (>50% context)\n  5. Build API messages from conversation history\n     - chat_completions: OpenAI format as-is\n     - codex_responses: convert to Responses API input items\n     - anthropic_messages: convert via anthropic_adapter.py\n  6. Inject ephemeral prompt layers (budget warnings, context pressure)\n  7. Apply prompt caching markers if on Anthropic\n  8. Make interruptible API call (_interruptible_api_call)\n  9. Parse response:\n     - If tool_calls: execute them, append results, loop back to step 5\n     - If text response: persist session, flush memory if needed, return\n```\n"
  },
  "hm.feishu.behaviour": {
   "line": 24,
   "path": "website/docs/user-guide/messaging/feishu.md",
   "text": "| Direct messages | Hermes responds to every message. |\n| Group chats | Hermes responds only when the bot is @mentioned in the chat. |\n| Shared group chats | By default, session history is isolated per user inside a shared chat. |"
  },
  "hm.feishu.dedupe": {
   "line": 545,
   "path": "website/docs/user-guide/messaging/feishu.md",
   "text": "Inbound messages are deduplicated using message IDs with a 24-hour TTL. The dedup state is persisted across restarts to `~/.hermes/feishu_seen_message_ids.json`."
  },
  "hm.feishu.env": {
   "line": 152,
   "path": "website/docs/user-guide/messaging/feishu.md",
   "text": "FEISHU_APP_ID=cli_xxx\nFEISHU_APP_SECRET=secret_xxx\nFEISHU_DOMAIN=feishu\nFEISHU_CONNECTION_MODE=websocket"
  },
  "hm.feishu.events": {
   "line": 90,
   "path": "website/docs/user-guide/messaging/feishu.md",
   "text": "   - `im.message.receive_v1` — required for receiving messages"
  },
  "hm.feishu.modes": {
   "line": 17,
   "path": "website/docs/user-guide/messaging/feishu.md",
   "text": "- `websocket` — recommended; Hermes opens the outbound connection and you do not need a public webhook endpoint\n- `webhook` — useful when you want Feishu/Lark to push events into your gateway over HTTP"
  },
  "hm.feishu.oneapp": {
   "line": 588,
   "path": "website/docs/user-guide/messaging/feishu.md",
   "text": "| `Another local Hermes gateway is already using this Feishu app_id` | Only one Hermes instance can use the same app_id at a time. Stop the other gateway first. |"
  },
  "hm.feishu.serial": {
   "line": 465,
   "path": "website/docs/user-guide/messaging/feishu.md",
   "text": "Messages within the same chat are processed serially (one at a time) to maintain conversation coherence. Each chat has its own lock, so messages in different chats are processed concurrently."
  },
  "hm.feishu.setup": {
   "line": 44,
   "path": "website/docs/user-guide/messaging/feishu.md",
   "text": "Select **Feishu / Lark** and scan the QR code with your Feishu or Lark mobile app. Hermes will automatically create a bot application with the correct permissions and save the credentials."
  },
  "hm.memory.files": {
   "line": 17,
   "path": "website/docs/user-guide/features/memory.md",
   "text": "| **MEMORY.md** | Agent's personal notes — environment facts, conventions, things learned | 2,200 chars (~800 tokens) |\n| **USER.md** | User profile — your preferences, communication style, expectations | 1,375 chars (~500 tokens) |"
  },
  "hm.memory.frozen": {
   "line": 57,
   "path": "website/docs/user-guide/features/memory.md",
   "text": "**Frozen snapshot pattern:** The system prompt injection is captured once at session start and never changes mid-session. This is intentional — it preserves the LLM's prefix cache for performance. When the agent adds/removes memory entries during a session, the changes are persisted to disk immediately but won't appear in the system prompt until the next session starts. Tool responses always show the live state."
  },
  "hm.migrate.doc": {
   "line": 9,
   "path": "website/docs/guides/migrate-from-openclaw.md",
   "text": "`hermes claw migrate` imports your OpenClaw (or legacy Clawdbot/Moldbot) setup into Hermes. This guide covers exactly what gets migrated, the config key mappings, and what to verify after migration."
  },
  "hm.readme.backends": {
   "line": 29,
   "path": "README.md",
   "text": "<tr><td><b>Runs anywhere, not just your laptop</b></td><td>Seven terminal backends — local, Docker, SSH, Singularity, Modal, Daytona, and Vercel Sandbox. Daytona and Modal offer serverless persistence — your agent's environment hibernates when idle and wakes on demand, costing nearly nothing between sessions. Run it on a $5 VPS or a GPU cluster.</td></tr>"
  },
  "hm.readme.def": {
   "line": 19,
   "path": "README.md",
   "text": "**The self-improving AI agent built by [Nous Research](https://nousresearch.com).** It's the only agent with a built-in learning loop — it creates skills from experience, improves them during use, nudges itself to persist knowledge, searches its own past conversations, and builds a deepening model of who you are across sessions. Run it on a $5 VPS, a GPU cluster, or serverless infrastructure that costs nearly nothing when idle. It's not tied to your laptop — talk to it from Telegram while it works on a cloud VM."
  },
  "hm.readme.migrate": {
   "line": 117,
   "path": "README.md",
   "text": "hermes claw migrate # Migrate from OpenClaw (if coming from OpenClaw)"
  },
  "hm.security.boundary": {
   "line": 60,
   "path": "SECURITY.md",
   "text": "**The only security boundary against an adversarial LLM is the\noperating system.** Nothing inside the agent process constitutes"
  },
  "hm.session.storage": {
   "line": 223,
   "path": "website/docs/developer-guide/architecture.md",
   "text": "SQLite-based session storage with FTS5 full-text search. Sessions have lineage tracking (parent/child across compressions), per-platform isolation, and atomic writes with contention handling."
  },
  "oc.arch.gateway": {
   "line": 10,
   "path": "docs/concepts/architecture.md",
   "text": "- A single long-lived **Gateway** owns all messaging surfaces (WhatsApp via\n  Baileys, Telegram via grammY, Slack, Discord, Signal, iMessage, WebChat).\n- Control-plane clients (macOS app, CLI, web UI, automations) connect to the\n  Gateway over **WebSocket** on the configured bind host (default"
  },
  "oc.channels.four": {
   "line": 11,
   "path": "docs/install/development-channels.md",
   "text": "OpenClaw ships four update channels:\n\n- **stable**: npm dist-tag `latest`. Recommended for most users.\n- **extended-stable**: npm dist-tag `extended-stable`. A net-new, trailing\n  supported-month package channel. It is package-only, and installation is\n  foreground-only. It receives read-only update hints when `update.checkOnStart`\n  is enabled, including direct final extended-stable package installs, but never\n  applies automatically.\n- **beta**: the newest version by semantic version order from the npm `beta`"
  },
  "oc.feishu.dm": {
   "line": 17,
   "path": "docs/channels/feishu/access-control.md",
   "text": "Configure `channels.feishu.dmPolicy` (default: `pairing`) to control who can DM the bot:"
  },
  "oc.feishu.durable": {
   "line": 43,
   "path": "docs/channels/feishu/setup.md",
   "text": "OpenClaw durably queues authenticated `im.message.receive_v1` and `drive.notice.comment_add_v1` envelopes before agent dispatch. In webhook mode, the durable `200` carries `x-openclaw-delivery-accepted: durable`; verification challenges, non-durable event types, and error responses omit the marker, so reverse proxies can require it to distinguish durable acceptance from a generic `200`. Pending or retryable events survive a Gateway restart, remain serialized per chat or document, and use Feishu's event ID to suppress duplicate queue entries while the active or retained completion record exists."
  },
  "oc.feishu.group": {
   "line": 34,
   "path": "docs/channels/feishu/access-control.md",
   "text": "**Group policy** (`channels.feishu.groupPolicy`, default: `allowlist`):"
  },
  "oc.feishu.overview": {
   "line": 9,
   "path": "docs/channels/feishu.md",
   "text": "OpenClaw connects to Feishu/Lark (the all-in-one collaboration platform) through the official `@openclaw/feishu` plugin: bot DMs, group chats, streaming card replies, and Feishu doc/wiki/drive/Bitable tools.\n\n**Status:** production-ready for bot DMs + group chats. WebSocket is the default event transport (no public URL needed); webhook mode is optional."
  },
  "oc.feishu.setup": {
   "line": 21,
   "path": "docs/channels/feishu/setup.md",
   "text": "  openclaw channels login --channel feishu"
  },
  "oc.feishu.setup.wizard": {
   "line": 23,
   "path": "docs/channels/feishu/setup.md",
   "text": "  This installs the `@openclaw/feishu` plugin if it is missing, then walks through setup:\n\n- **Manual setup**: paste an App ID and App Secret from Feishu Open Platform (`https://open.feishu.cn`) or Lark Developer (`https://open.larksuite.com`).\n- **QR setup**: scan a QR code in the Feishu app to create a bot automatically. This flow locks DMs to your own account (`dmPolicy: \"allowlist\"` with your `open_id`).\n"
  },
  "oc.lore.molt": {
   "line": 28,
   "path": "docs/start/lore.md",
   "text": "## The First Molt (January 27, 2026)\n\nAt 5am, the community gathered in Discord. Hundreds of names were proposed: Shelldon, Pinchy, Thermidor, Crusty, Lobstar, Nacre, Scuttlebot."
  },
  "oc.lore.names": {
   "line": 14,
   "path": "docs/start/lore.md",
   "text": "In the beginning, there was **Warelay** — a sensible name for a WhatsApp gateway. It did its job. It was fine.\n\nThen came a space lobster.\n\nFor a while it was **Clawd**, living in a **Clawdbot**. In January 2026, Anthropic sent a polite email asking for a name change (trademark stuff). So the lobster did what lobsters do best:\n\n**It molted.**\n\nShedding its old shell, it emerged as **Molty**, living in **Moltbot**. That name never quite rolled off the tongue either.\n\nOn January 30, 2026, the lobster molted one more time into its final form: **OpenClaw**."
  },
  "oc.memory.md": {
   "line": 9,
   "path": "docs/concepts/memory.md",
   "text": "OpenClaw remembers things by writing plain Markdown files in your agent's\nworkspace (default `~/.openclaw/workspace`). The model only remembers what gets\nsaved to disk; there is no hidden state."
  },
  "oc.messages.pipeline": {
   "line": 10,
   "path": "docs/concepts/messages.md",
   "text": "Inbound messages move through routing, dedupe/debounce, an agent run, and outbound delivery:\n\n```text\nInbound message\n  -> routing/bindings -> session key\n  -> dedupe + debounce\n  -> queue (if a run is already active)\n  -> agent run (streaming + tools)\n  -> outbound replies (channel limits + chunking)"
  },
  "oc.migrate.hermes": {
   "line": 3,
   "path": "extensions/migrate-hermes/README.md",
   "text": "Import supported Hermes model configuration, workspace memory, skills, and MCP\nservers into OpenClaw. The provider can also import supported credentials with\nyour consent. Unsupported state is reported for manual review."
  },
  "oc.readme.def": {
   "line": 18,
   "path": "README.md",
   "text": "OpenClaw is an open-source AI assistant that runs on your own computer and meets you in the channels you already use: Discord, iMessage, Slack, Teams, Telegram, WhatsApp, and 20+ more, plus native apps for macOS, iOS, Android, Windows, and Linux. One Gateway runs it as a personal assistant on a laptop or as a shared [team deployment](https://docs.openclaw.ai/start/teams); configuration is the only difference."
  },
  "oc.readme.donor": {
   "line": 110,
   "path": "README.md",
   "text": "OpenClaw is developed in the open by the [OpenClaw Foundation](https://openclaw.org), an independent 501(c)(3). The Foundation employs the core team and signs releases. Donors and infrastructure sponsors support the Foundation; none of them own or direct the project. OpenAI is a donor, not an owner."
  },
  "oc.readme.gov": {
   "line": 110,
   "path": "README.md",
   "text": "OpenClaw is developed in the open by the [OpenClaw Foundation](https://openclaw.org), an independent 501(c)(3). The Foundation employs the core team and signs releases. Donors and infrastructure sponsors support the Foundation; none of them own or direct the project. OpenAI is a donor, not an owner."
  },
  "oc.readme.pi": {
   "line": 120,
   "path": "README.md",
   "text": "Special thanks to [Mario Zechner](https://mariozechner.at/) for his support and for [pi](https://github.com/earendil-works/pi), and to Adam Doppelt for the lobster.bot domain."
  },
  "oc.readme.sandbox": {
   "line": 81,
   "path": "README.md",
   "text": "Tools run on the host for the main session unless you configure sandboxing. Read the [security guide](https://docs.openclaw.ai/gateway/security), [exposure runbook](https://docs.openclaw.ai/gateway/security/exposure-runbook), and [sandboxing guide](https://docs.openclaw.ai/gateway/sandboxing) before connecting other users or exposing the Gateway remotely."
  },
  "oc.release.2.0": {
   "line": 21,
   "path": "docs/releases/index.md",
   "text": "- [v2026.8.1 (AKA OpenClaw 2.0)](/releases/2026.8.1) - A rebuilt web experience, simpler onboarding, stronger memory and session continuity, and a very large reliability pass across OpenClaw."
  },
  "oc.release.scale": {
   "line": 21,
   "path": "docs/releases/2026.8.1.md",
   "text": "**Release scale:** 16,977 pull requests, 698 direct commits, and 987 contributors."
  },
  "oc.release.sqlite": {
   "line": 9,
   "path": "docs/releases/2026.8.1/installation-and-onboarding.md",
   "text": "This release changes how sessions and transcripts are stored by moving them into SQLite. Before downgrading to an older file-backed release, use the current CLI to restore archived legacy transcript artifacts; sessions created after the migration will not appear in older releases."
  },
  "oc.trust.sandbox": {
   "line": 42,
   "path": "docs/start/why-openclaw/the-trust-boundary.md",
   "text": "**Sandboxing is off by default.** Out of the box, OpenClaw is a personal assistant for one trusted operator, and exec runs on the gateway host without prompts. The enterprise posture requires explicit configuration, verifiable with two commands: [`openclaw sandbox explain`](/gateway/sandbox-vs-tool-policy-vs-elevated) prints the effective execution posture, and [`openclaw security audit`](/gateway/security/audit-checks) flags drift with stable check IDs you can alarm on."
  },
  "oc.why.sum": {
   "line": 29,
   "path": "docs/start/why-openclaw.md",
   "text": "OpenClaw can separate a trusted [Gateway](/gateway) from untrusted, movable execution. Policy is enforced in code, and state is versioned and migrated, so a deployment is replaceable. This page compares configured architectures, not default security certifications: sandboxing is off by default in OpenClaw. The source review was refreshed on August 27, 2026 against [OpenClaw `7b624e9de25`](https://github.com/openclaw/openclaw/tree/7b624e9de25bc66c97166071c8d05f055d82ec54) and [Hermes Agent `6defe7eb6c`](https://github.com/NousResearch/hermes-agent/tree/6defe7eb6c462bb784d1f27f5afe7ca4b627fc70). These are development snapshots; check your installed version and configuration before relying on a capability."
  },
  "oc.workspace.files": {
   "line": 70,
   "path": "docs/concepts/agent-workspace.md",
   "text": "Standard files OpenClaw expects inside the workspace:"
  }
 },
 "rel": {
  "cutoff": "2026-10-06",
  "hm": [
   [
    "2026-03-12",
    "v2026.3.12",
    "Hermes Agent v0.2.0 (2026.3.12)"
   ],
   [
    "2026-03-17",
    "v2026.3.17",
    "Hermes Agent v0.3.0 (v2026.3.17)"
   ],
   [
    "2026-03-24",
    "v2026.3.23",
    "Hermes Agent v0.4.0 (v2026.3.23)"
   ],
   [
    "2026-03-28",
    "v2026.3.28",
    "Hermes Agent v0.5.0 (v2026.3.28)"
   ],
   [
    "2026-03-30",
    "v2026.3.30",
    "Hermes Agent v0.6.0 (v2026.3.30)"
   ],
   [
    "2026-04-03",
    "v2026.4.3",
    "Hermes Agent v0.7.0 (v2026.4.3)"
   ],
   [
    "2026-04-08",
    "v2026.4.8",
    "Hermes Agent v0.8.0 (v2026.4.8)"
   ],
   [
    "2026-04-13",
    "v2026.4.13",
    "Hermes Agent v0.9.0 (v2026.4.13)"
   ],
   [
    "2026-04-16",
    "v2026.4.16",
    "Hermes Agent v0.10.0 (2026.4.16)"
   ],
   [
    "2026-04-23",
    "v2026.4.23",
    "Hermes Agent v0.11.0 (2026.4.23)"
   ],
   [
    "2026-04-30",
    "v2026.4.30",
    "Hermes Agent v0.12.0 (2026.4.30)"
   ],
   [
    "2026-05-07",
    "v2026.5.7",
    "Hermes Agent v0.13.0 (2026.5.7) — The Tenacity Release"
   ],
   [
    "2026-05-16",
    "v2026.5.16",
    "Hermes Agent v0.14.0 (2026.5.16)"
   ],
   [
    "2026-05-28",
    "v2026.5.28",
    "Hermes Agent v0.15.0 (2026.5.28) — The Velocity Release"
   ],
   [
    "2026-05-29",
    "v2026.5.29",
    "Hermes Agent v0.15.1 (2026.5.29) — The Patch Release"
   ],
   [
    "2026-05-29",
    "v2026.5.29.2",
    "Hermes Agent v0.15.2 (2026.5.29.2)"
   ],
   [
    "2026-06-06",
    "v2026.6.5",
    "Hermes Agent v0.16.0 (2026.6.5) — The Surface Release"
   ],
   [
    "2026-06-19",
    "v2026.6.19",
    "Hermes Agent v0.17.0 (v2026.6.19)"
   ],
   [
    "2026-07-01",
    "v2026.7.1",
    "Hermes Agent v0.18.0 (2026.7.1) — The Judgment Release"
   ],
   [
    "2026-07-08",
    "v2026.7.7",
    "Hermes Agent v0.18.1 (2026.7.7)"
   ],
   [
    "2026-07-08",
    "v2026.7.7.2",
    "Hermes Agent v0.18.2 (2026.7.7.2)"
   ],
   [
    "2026-07-20",
    "v2026.7.20",
    "Hermes Agent v0.19.0 (2026.7.20) — The Quicksilver Release"
   ],
   [
    "2026-07-30",
    "v2026.7.30",
    "Hermes Agent v0.19.1 (v2026.7.30)"
   ],
   [
    "2026-08-03",
    "v2026.8.3",
    "Hermes Agent v0.20.0 (2026.8.3)"
   ],
   [
    "2026-08-13",
    "v2026.8.13",
    "Hermes Agent v0.20.1 (2026.8.13)"
   ],
   [
    "2026-08-16",
    "v2026.8.16",
    "Hermes Agent v0.20.2 (2026.8.16)"
   ],
   [
    "2026-08-17",
    "v2026.8.16.2",
    "Hermes Agent v0.20.3 (2026.8.16.2)"
   ],
   [
    "2026-08-18",
    "v2026.8.18",
    "Hermes Agent v0.20.4 (2026.8.18)"
   ],
   [
    "2026-08-21",
    "v2026.8.19",
    "Hermes Agent v0.20.5 (v2026.8.19)"
   ],
   [
    "2026-08-27",
    "v2026.8.27",
    "Hermes Agent v0.20.6 (v2026.8.27)"
   ],
   [
    "2026-08-31",
    "v2026.8.31",
    "Hermes Agent v0.21.0 (v2026.8.31)"
   ],
   [
    "2026-09-07",
    "v2026.9.7",
    "Hermes Agent v0.21.1 (v2026.9.7)"
   ],
   [
    "2026-09-11",
    "v2026.9.11",
    "Hermes Agent v0.21.2 (v2026.9.11)"
   ],
   [
    "2026-09-14",
    "v2026.9.14",
    "Hermes Agent v0.21.3 (v2026.9.14)"
   ],
   [
    "2026-09-21",
    "v2026.9.21",
    "Hermes Agent v0.21.4 (v2026.9.21)"
   ],
   [
    "2026-09-24",
    "v2026.9.24",
    "Hermes Agent v0.21.5 (v2026.9.24)"
   ]
  ],
  "hmTotal": 36,
  "oc": [
   [
    "2025-11-25",
    0,
    "v0.1.1"
   ],
   [
    "2025-11-25",
    0,
    "v0.1.2"
   ],
   [
    "2025-11-25",
    0,
    "v0.1.3"
   ],
   [
    "2025-11-26",
    0,
    "v1.1.0"
   ],
   [
    "2025-11-27",
    0,
    "v1.2.0"
   ],
   [
    "2025-11-28",
    0,
    "v1.2.1"
   ],
   [
    "2025-11-28",
    0,
    "v1.2.2"
   ],
   [
    "2025-12-02",
    0,
    "v1.3.0"
   ],
   [
    "2025-12-19",
    1,
    "v2.0.0-beta1"
   ],
   [
    "2025-12-21",
    0,
    "v2.0.0-beta2"
   ],
   [
    "2025-12-27",
    0,
    "v2.0.0-beta3"
   ],
   [
    "2025-12-27",
    0,
    "v2.0.0-beta4"
   ],
   [
    "2026-01-03",
    0,
    "v2.0.0-beta5"
   ],
   [
    "2026-01-05",
    0,
    "v2026.1.5"
   ],
   [
    "2026-01-05",
    0,
    "v2026.1.5-1"
   ],
   [
    "2026-01-05",
    0,
    "v2026.1.5-3"
   ],
   [
    "2026-01-08",
    0,
    "v2026.1.8"
   ],
   [
    "2026-01-10",
    0,
    "v2026.1.9"
   ],
   [
    "2026-01-11",
    0,
    "v2026.1.10"
   ],
   [
    "2026-01-12",
    0,
    "v2026.1.11"
   ],
   [
    "2026-01-12",
    0,
    "v2026.1.11-1"
   ],
   [
    "2026-01-12",
    0,
    "v2026.1.11-2"
   ],
   [
    "2026-01-12",
    0,
    "v2026.1.11-3"
   ],
   [
    "2026-01-13",
    0,
    "v2026.1.12"
   ],
   [
    "2026-01-13",
    0,
    "v2026.1.12-2"
   ],
   [
    "2026-01-15",
    0,
    "v2026.1.14-1"
   ],
   [
    "2026-01-16",
    0,
    "v2026.1.15"
   ],
   [
    "2026-01-17",
    0,
    "v2026.1.16-2"
   ],
   [
    "2026-01-21",
    0,
    "v2026.1.20"
   ],
   [
    "2026-01-22",
    0,
    "v2026.1.21"
   ],
   [
    "2026-01-23",
    0,
    "v2026.1.22"
   ],
   [
    "2026-01-24",
    0,
    "v2026.1.23"
   ],
   [
    "2026-01-25",
    0,
    "v2026.1.24"
   ],
   [
    "2026-01-30",
    0,
    "v2026.1.29"
   ],
   [
    "2026-01-31",
    0,
    "v2026.1.30"
   ],
   [
    "2026-02-02",
    0,
    "v2026.2.1"
   ],
   [
    "2026-02-04",
    0,
    "v2026.2.2"
   ],
   [
    "2026-02-05",
    0,
    "v2026.2.3"
   ],
   [
    "2026-02-07",
    0,
    "v2026.2.6"
   ],
   [
    "2026-02-09",
    0,
    "v2026.2.9"
   ],
   [
    "2026-02-13",
    0,
    "v2026.2.12"
   ],
   [
    "2026-02-14",
    0,
    "v2026.2.13"
   ],
   [
    "2026-02-15",
    0,
    "v2026.2.14"
   ],
   [
    "2026-02-16",
    1,
    "v2026.2.15-beta.1"
   ],
   [
    "2026-02-16",
    0,
    "v2026.2.15"
   ],
   [
    "2026-02-18",
    0,
    "v2026.2.17"
   ],
   [
    "2026-02-19",
    1,
    "v2026.2.19-beta.1"
   ],
   [
    "2026-02-19",
    0,
    "v2026.2.19"
   ],
   [
    "2026-02-21",
    0,
    "v2026.2.21"
   ],
   [
    "2026-02-23",
    0,
    "v2026.2.22"
   ],
   [
    "2026-02-24",
    0,
    "v2026.2.23"
   ],
   [
    "2026-02-25",
    1,
    "v2026.2.24-beta.1"
   ],
   [
    "2026-02-25",
    0,
    "v2026.2.24"
   ],
   [
    "2026-02-26",
    1,
    "v2026.2.25-beta.1"
   ],
   [
    "2026-02-26",
    0,
    "v2026.2.25"
   ],
   [
    "2026-02-27",
    0,
    "v2026.2.26"
   ],
   [
    "2026-03-02",
    0,
    "v2026.3.1"
   ],
   [
    "2026-03-03",
    1,
    "v2026.3.2-beta.1"
   ],
   [
    "2026-03-03",
    0,
    "v2026.3.2"
   ],
   [
    "2026-03-08",
    1,
    "v2026.3.7-beta.1"
   ],
   [
    "2026-03-08",
    0,
    "v2026.3.7"
   ],
   [
    "2026-03-09",
    1,
    "v2026.3.8-beta.1"
   ],
   [
    "2026-03-09",
    0,
    "v2026.3.8"
   ],
   [
    "2026-03-12",
    1,
    "v2026.3.11-beta.1"
   ],
   [
    "2026-03-12",
    0,
    "v2026.3.11"
   ],
   [
    "2026-03-13",
    0,
    "v2026.3.12"
   ],
   [
    "2026-03-14",
    1,
    "v2026.3.13-beta.1"
   ],
   [
    "2026-03-14",
    0,
    "v2026.3.13-1"
   ],
   [
    "2026-03-23",
    1,
    "v2026.3.22-beta.1"
   ],
   [
    "2026-03-23",
    0,
    "v2026.3.22"
   ],
   [
    "2026-03-23",
    0,
    "v2026.3.23"
   ],
   [
    "2026-03-25",
    1,
    "v2026.3.24-beta.1"
   ],
   [
    "2026-03-25",
    1,
    "v2026.3.24-beta.2"
   ],
   [
    "2026-03-25",
    0,
    "v2026.3.24"
   ],
   [
    "2026-03-28",
    1,
    "v2026.3.28-beta.1"
   ],
   [
    "2026-03-29",
    0,
    "v2026.3.28"
   ],
   [
    "2026-03-31",
    1,
    "v2026.3.31-beta.1"
   ],
   [
    "2026-03-31",
    0,
    "v2026.3.31"
   ],
   [
    "2026-04-01",
    1,
    "v2026.4.1-beta.1"
   ],
   [
    "2026-04-01",
    0,
    "v2026.4.1"
   ],
   [
    "2026-04-02",
    0,
    "v2026.4.2"
   ],
   [
    "2026-04-06",
    0,
    "v2026.4.5"
   ],
   [
    "2026-04-08",
    0,
    "v2026.4.7"
   ],
   [
    "2026-04-08",
    0,
    "v2026.4.8"
   ],
   [
    "2026-04-09",
    1,
    "v2026.4.9-beta.1"
   ],
   [
    "2026-04-09",
    0,
    "v2026.4.9"
   ],
   [
    "2026-04-11",
    0,
    "v2026.4.10"
   ],
   [
    "2026-04-11",
    1,
    "v2026.4.11-beta.1"
   ],
   [
    "2026-04-12",
    0,
    "v2026.4.11"
   ],
   [
    "2026-04-12",
    1,
    "v2026.4.12-beta.1"
   ],
   [
    "2026-04-13",
    0,
    "v2026.4.12"
   ],
   [
    "2026-04-14",
    1,
    "v2026.4.14-beta.1"
   ],
   [
    "2026-04-14",
    0,
    "v2026.4.14"
   ],
   [
    "2026-04-15",
    1,
    "v2026.4.15-beta.1"
   ],
   [
    "2026-04-16",
    1,
    "v2026.4.15-beta.2"
   ],
   [
    "2026-04-16",
    0,
    "v2026.4.15"
   ],
   [
    "2026-04-19",
    1,
    "v2026.4.19-beta.1"
   ],
   [
    "2026-04-19",
    1,
    "v2026.4.19-beta.2"
   ],
   [
    "2026-04-21",
    1,
    "v2026.4.20-beta.1"
   ],
   [
    "2026-04-21",
    1,
    "v2026.4.20-beta.2"
   ],
   [
    "2026-04-21",
    0,
    "v2026.4.20"
   ],
   [
    "2026-04-22",
    0,
    "v2026.4.21"
   ],
   [
    "2026-04-23",
    0,
    "v2026.4.22"
   ],
   [
    "2026-04-24",
    1,
    "v2026.4.23-beta.4"
   ],
   [
    "2026-04-24",
    1,
    "v2026.4.23-beta.5"
   ],
   [
    "2026-04-24",
    1,
    "v2026.4.23-beta.6"
   ],
   [
    "2026-04-24",
    0,
    "v2026.4.23"
   ],
   [
    "2026-04-25",
    1,
    "v2026.4.24-beta.1"
   ],
   [
    "2026-04-25",
    1,
    "v2026.4.24-beta.2"
   ],
   [
    "2026-04-25",
    1,
    "v2026.4.24-beta.3"
   ],
   [
    "2026-04-25",
    1,
    "v2026.4.24-beta.4"
   ],
   [
    "2026-04-25",
    1,
    "v2026.4.24-beta.5"
   ],
   [
    "2026-04-25",
    0,
    "v2026.4.24"
   ],
   [
    "2026-04-26",
    1,
    "v2026.4.25-beta.1"
   ],
   [
    "2026-04-26",
    1,
    "v2026.4.25-beta.2"
   ],
   [
    "2026-04-26",
    1,
    "v2026.4.25-beta.3"
   ],
   [
    "2026-04-26",
    1,
    "v2026.4.25-beta.4"
   ],
   [
    "2026-04-27",
    0,
    "v2026.4.25"
   ],
   [
    "2026-04-28",
    0,
    "v2026.4.26"
   ],
   [
    "2026-04-29",
    0,
    "v2026.4.27"
   ],
   [
    "2026-04-30",
    1,
    "v2026.4.29-beta.1"
   ],
   [
    "2026-04-30",
    1,
    "v2026.4.29-beta.2"
   ],
   [
    "2026-04-30",
    1,
    "v2026.4.29-beta.3"
   ],
   [
    "2026-04-30",
    1,
    "v2026.4.29-beta.4"
   ],
   [
    "2026-04-30",
    0,
    "v2026.4.29"
   ],
   [
    "2026-05-02",
    1,
    "v2026.5.2-beta.2"
   ],
   [
    "2026-05-02",
    1,
    "v2026.5.2-beta.3"
   ],
   [
    "2026-05-02",
    0,
    "v2026.5.2"
   ],
   [
    "2026-05-03",
    1,
    "v2026.5.3-beta.2"
   ],
   [
    "2026-05-04",
    1,
    "v2026.5.3-beta.3"
   ],
   [
    "2026-05-04",
    0,
    "v2026.5.3"
   ],
   [
    "2026-05-04",
    0,
    "v2026.5.3-1"
   ],
   [
    "2026-05-04",
    1,
    "v2026.5.4-beta.1"
   ],
   [
    "2026-05-05",
    1,
    "v2026.5.4-beta.2"
   ],
   [
    "2026-05-05",
    1,
    "v2026.5.4-beta.3"
   ],
   [
    "2026-05-05",
    0,
    "v2026.5.4"
   ],
   [
    "2026-05-06",
    0,
    "v2026.5.5"
   ],
   [
    "2026-05-06",
    0,
    "v2026.5.6"
   ],
   [
    "2026-05-07",
    0,
    "v2026.5.7"
   ],
   [
    "2026-05-09",
    1,
    "v2026.5.9-beta.1"
   ],
   [
    "2026-05-10",
    1,
    "v2026.5.10-beta.1"
   ],
   [
    "2026-05-10",
    1,
    "v2026.5.10-beta.2"
   ],
   [
    "2026-05-11",
    1,
    "v2026.5.10-beta.3"
   ],
   [
    "2026-05-11",
    1,
    "v2026.5.10-beta.4"
   ],
   [
    "2026-05-11",
    1,
    "v2026.5.10-beta.5"
   ],
   [
    "2026-05-12",
    1,
    "v2026.5.12-beta.1"
   ],
   [
    "2026-05-12",
    1,
    "v2026.5.12-beta.2"
   ],
   [
    "2026-05-12",
    1,
    "v2026.5.12-beta.3"
   ],
   [
    "2026-05-13",
    1,
    "v2026.5.12-beta.4"
   ],
   [
    "2026-05-13",
    1,
    "v2026.5.12-beta.5"
   ],
   [
    "2026-05-13",
    1,
    "v2026.5.12-beta.6"
   ],
   [
    "2026-05-14",
    1,
    "v2026.5.12-beta.7"
   ],
   [
    "2026-05-14",
    1,
    "v2026.5.12-beta.8"
   ],
   [
    "2026-05-14",
    0,
    "v2026.5.12"
   ],
   [
    "2026-05-14",
    1,
    "v2026.5.14-beta.1"
   ],
   [
    "2026-05-15",
    1,
    "v2026.5.14-beta.2"
   ],
   [
    "2026-05-16",
    1,
    "v2026.5.16-beta.1"
   ],
   [
    "2026-05-16",
    1,
    "v2026.5.16-beta.2"
   ],
   [
    "2026-05-16",
    1,
    "v2026.5.16-beta.3"
   ],
   [
    "2026-05-17",
    1,
    "v2026.5.16-beta.4"
   ],
   [
    "2026-05-17",
    1,
    "v2026.5.16-beta.5"
   ],
   [
    "2026-05-18",
    1,
    "v2026.5.16-beta.6"
   ],
   [
    "2026-05-18",
    1,
    "v2026.5.16-beta.7"
   ],
   [
    "2026-05-18",
    1,
    "v2026.5.18-beta.1"
   ],
   [
    "2026-05-18",
    0,
    "v2026.5.18"
   ],
   [
    "2026-05-18",
    1,
    "v2026.5.19-beta.1"
   ],
   [
    "2026-05-19",
    1,
    "v2026.5.19-beta.2"
   ],
   [
    "2026-05-20",
    1,
    "v2026.5.19-alpha.1"
   ],
   [
    "2026-05-20",
    0,
    "v2026.5.19"
   ],
   [
    "2026-05-21",
    1,
    "v2026.5.20-beta.1"
   ],
   [
    "2026-05-21",
    1,
    "v2026.5.20-beta.2"
   ],
   [
    "2026-05-21",
    0,
    "v2026.5.20"
   ],
   [
    "2026-05-23",
    1,
    "v2026.5.22-beta.1"
   ],
   [
    "2026-05-24",
    0,
    "v2026.5.22"
   ],
   [
    "2026-05-24",
    1,
    "v2026.5.24-beta.1"
   ],
   [
    "2026-05-24",
    1,
    "v2026.5.24-beta.2"
   ],
   [
    "2026-05-26",
    1,
    "v2026.5.25-beta.1"
   ],
   [
    "2026-05-26",
    1,
    "v2026.5.26-beta.1"
   ],
   [
    "2026-05-27",
    1,
    "v2026.5.26-beta.2"
   ],
   [
    "2026-05-27",
    0,
    "v2026.5.26"
   ],
   [
    "2026-05-28",
    1,
    "v2026.5.27-beta.1"
   ],
   [
    "2026-05-28",
    0,
    "v2026.5.27"
   ],
   [
    "2026-05-29",
    1,
    "v2026.5.28-beta.1"
   ],
   [
    "2026-05-29",
    1,
    "v2026.5.28-beta.2"
   ],
   [
    "2026-05-29",
    1,
    "v2026.5.28-beta.3"
   ],
   [
    "2026-05-29",
    1,
    "v2026.5.28-beta.4"
   ],
   [
    "2026-05-30",
    0,
    "v2026.5.28"
   ],
   [
    "2026-05-31",
    1,
    "v2026.5.30-beta.1"
   ],
   [
    "2026-05-31",
    1,
    "v2026.5.31-beta.1"
   ],
   [
    "2026-05-31",
    1,
    "v2026.5.31-beta.2"
   ],
   [
    "2026-05-31",
    1,
    "v2026.5.31-beta.3"
   ],
   [
    "2026-06-01",
    1,
    "v2026.5.31-beta.4"
   ],
   [
    "2026-06-01",
    1,
    "v2026.6.1-beta.1"
   ],
   [
    "2026-06-01",
    1,
    "v2026.6.1-beta.2"
   ],
   [
    "2026-06-03",
    1,
    "v2026.6.1-beta.3"
   ],
   [
    "2026-06-03",
    0,
    "v2026.6.1"
   ],
   [
    "2026-06-03",
    1,
    "v2026.6.2-beta.1"
   ],
   [
    "2026-06-06",
    1,
    "v2026.6.5-beta.1"
   ],
   [
    "2026-06-07",
    1,
    "v2026.6.5-beta.2"
   ],
   [
    "2026-06-08",
    1,
    "v2026.6.5-beta.3"
   ],
   [
    "2026-06-08",
    1,
    "v2026.6.5-beta.5"
   ],
   [
    "2026-06-09",
    1,
    "v2026.6.5-beta.6"
   ],
   [
    "2026-06-09",
    0,
    "v2026.6.5"
   ],
   [
    "2026-06-10",
    1,
    "v2026.6.6-beta.1"
   ],
   [
    "2026-06-12",
    1,
    "v2026.6.6-beta.2"
   ],
   [
    "2026-06-12",
    0,
    "v2026.6.6"
   ],
   [
    "2026-06-13",
    1,
    "v2026.6.7-beta.1"
   ],
   [
    "2026-06-14",
    1,
    "v2026.6.8-beta.1"
   ],
   [
    "2026-06-16",
    1,
    "v2026.6.8-beta.2"
   ],
   [
    "2026-06-16",
    0,
    "v2026.6.8"
   ],
   [
    "2026-06-19",
    1,
    "v2026.6.9-beta.1"
   ],
   [
    "2026-06-21",
    0,
    "v2026.6.9"
   ],
   [
    "2026-06-21",
    1,
    "v2026.6.10-beta.1"
   ],
   [
    "2026-06-22",
    1,
    "v2026.6.10-beta.2"
   ],
   [
    "2026-06-24",
    0,
    "v2026.6.10"
   ],
   [
    "2026-06-24",
    1,
    "v2026.6.11-beta.1"
   ],
   [
    "2026-06-28",
    1,
    "v2026.6.11-beta.2"
   ],
   [
    "2026-06-30",
    0,
    "v2026.6.11"
   ],
   [
    "2026-07-02",
    1,
    "v2026.7.1-beta.1"
   ],
   [
    "2026-07-05",
    1,
    "v2026.7.1-beta.2"
   ],
   [
    "2026-07-11",
    1,
    "v2026.7.1-beta.5"
   ],
   [
    "2026-07-13",
    1,
    "v2026.7.1-beta.6"
   ],
   [
    "2026-07-13",
    0,
    "v2026.7.1"
   ],
   [
    "2026-07-15",
    1,
    "v2026.7.2-beta.1"
   ],
   [
    "2026-07-17",
    1,
    "v2026.7.2-beta.2"
   ],
   [
    "2026-07-18",
    1,
    "v2026.7.2-beta.3"
   ],
   [
    "2026-07-28",
    1,
    "v2026.7.2-beta.5"
   ],
   [
    "2026-08-01",
    1,
    "v2026.7.2-beta.6"
   ],
   [
    "2026-08-02",
    1,
    "v2026.7.2-beta.7"
   ],
   [
    "2026-08-04",
    0,
    "v2026.7.1-1"
   ],
   [
    "2026-08-04",
    0,
    "v2026.7.1-2"
   ],
   [
    "2026-08-08",
    0,
    "v2026.6.33"
   ],
   [
    "2026-08-08",
    0,
    "v2026.6.34"
   ],
   [
    "2026-08-15",
    1,
    "v2026.8.1-beta.2"
   ],
   [
    "2026-08-24",
    1,
    "v2026.8.1-beta.3"
   ],
   [
    "2026-08-28",
    1,
    "v2026.9.1-beta.1"
   ],
   [
    "2026-08-31",
    0,
    "v2026.8.1"
   ],
   [
    "2026-09-01",
    0,
    "v2026.8.2"
   ],
   [
    "2026-09-03",
    0,
    "v2026.9.1"
   ],
   [
    "2026-09-05",
    0,
    "v2026.9.2"
   ],
   [
    "2026-09-08",
    0,
    "v2026.9.3"
   ],
   [
    "2026-09-10",
    0,
    "v2026.6.35"
   ],
   [
    "2026-09-11",
    0,
    "v2026.9.4"
   ],
   [
    "2026-09-19",
    0,
    "v2026.9.5"
   ],
   [
    "2026-09-19",
    1,
    "linux-stable"
   ],
   [
    "2026-09-21",
    0,
    "v2026.7.35"
   ],
   [
    "2026-09-23",
    0,
    "v2026.9.6"
   ],
   [
    "2026-09-29",
    0,
    "v2026.8.33"
   ],
   [
    "2026-09-30",
    0,
    "v2026.9.7"
   ],
   [
    "2026-10-02",
    0,
    "v2026.8.34"
   ],
   [
    "2026-10-02",
    0,
    "v2026.8.35"
   ],
   [
    "2026-10-03",
    0,
    "v2026.9.8"
   ],
   [
    "2026-10-05",
    1,
    "v2026.10.1-beta.1"
   ]
  ],
  "ocPre": 128,
  "ocStable": 125,
  "ocTotal": 253
 },
 "repo": {
  "hm": {
   "commits": 49041,
   "created": "2025-07-22",
   "forks": 54007,
   "head": "4787e4d56f",
   "headDate": "2026-10-05",
   "lang": "Python",
   "license": "MIT",
   "oldest": "2025-07-23",
   "stars": 251451
  },
  "oc": {
   "commits": 105635,
   "created": "2025-11-24",
   "forks": 82282,
   "head": "195e1cc6c1",
   "headDate": "2026-10-05",
   "lang": "TypeScript",
   "license": "MIT",
   "oldest": "2025-11-24",
   "stars": 391448
  },
  "pi": {
   "created": "2025-08-09",
   "license": "MIT",
   "stars": 112735
  }
 },
 "sdk": [
  "import * as Lark from '@larksuiteoapi/node-sdk';",
  "",
  "const baseConfig = {",
  "  appId: 'xxx',",
  "  appSecret: 'xxx'",
  "}",
  "",
  "const client = new Lark.Client(baseConfig);",
  "",
  "const wsClient = new Lark.WSClient({...baseConfig, loggerLevel: Lark.LoggerLevel.info});",
  "",
  "wsClient.start({",
  "  eventDispatcher: new Lark.EventDispatcher({}).register({",
  "    'im.message.receive_v1': async (data) => {",
  "      const {",
  "        message: { chat_id, content}",
  "      } = data;",
  "      await client.im.v1.message.create({",
  "        params: {",
  "          receive_id_type: \"chat_id\"",
  "        },",
  "        data: {",
  "          receive_id: chat_id,",
  "          content: Lark.messageCard.defaultCard({",
  "            title: `reply： ${JSON.parse(content).text}`,",
  "            content: 'hello'",
  "          }),",
  "          msg_type: 'interactive'",
  ""
 ],
 "sec": {
  "cve": "CVE-2026-25253",
  "cvss": 8.8,
  "earliest": "2026-01-31",
  "ghsa": "GHSA-g8p2-7wf7-98mq",
  "nvdPublished": "2026-02-01",
  "nvdVector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H",
  "patched": "v2026.1.29",
  "published": "2026-01-31",
  "severity": "high",
  "summary": "1-Click RCE via Authentication Token Exfiltration From gatewayUrl"
 },
 "snap": {
  "hm": "4787e4d56f",
  "hmDate": "2026-10-05",
  "oc": "195e1cc6c1",
  "ocDate": "2026-10-05",
  "retrieved": "2026-10-06"
 },
 "todayTitle": "OpenClaw 🦞 — Your assistant, on your devices, in your chats",
 "v020": {
  "contributors": 63,
  "pulls": 216
 }
};
