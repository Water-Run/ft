// 场景空壳：受托模型按 brief/04-storyboard.md 与 src/design/ 的范例实现。
// 每个场景只保留入口；不要在这里写演示内容。
scene('open', ({ root, s, c0 }) => {
  // TODO: 输入账号口令 → 服务器凭什么确认是你 → 四种证据
});

scene('password', ({ root, s, c0 }) => {
  // TODO: 账号 + 口令 → TLS → 盐/慢哈希 → 比对 → 只验证“知道”
});

scene('factors', ({ root, s, c0 }) => {
  // TODO: 短信码验证“拥有” → 可被转发；passkey 验证“持有私钥”
});

scene('session', ({ root, s, c0 }) => {
  // TODO: 会话表验证连续性 → JWT 用签名和声明代替查表 → 结构/编码/撤销
});

scene('federation', ({ root, s, c0 }) => {
  // TODO: Google/SSO → code → OIDC ID Token → 验证签名与受众 → PKCE
});

scene('attacks', ({ root, s, c0 }) => {
  // TODO: 伪造证据 → 钓鱼/撞库 → XSS/CSRF → 固定/JWT 被偷
});

scene('close', ({ root, s, c0 }) => {
  // TODO: 验证=证据对照规则；各机制验证什么；没有万能机制
});

scene('outro', ({ root, s, c0 }) => {
  // TODO: 片尾名单：策划 WaterRun、准备方与受托方模型、开源视频地址
});
