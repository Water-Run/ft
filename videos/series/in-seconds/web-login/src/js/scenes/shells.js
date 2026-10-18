// 场景空壳：受托模型按 brief/04-storyboard.md 与 src/design/ 的范例实现。
// 每个场景只保留入口；不要在这里写演示内容。
scene('open', ({ root, s, c0 }) => {
  // TODO: 每日登录的钩子 → 三个问题 → SID/临时通行证 → 片名卡
});

scene('credentials', ({ root, s, c0 }) => {
  // TODO: 账号声明 → 口令/TLS/盐/慢哈希 → 一次性码 → passkey/WebAuthn
});

scene('session', ({ root, s, c0 }) => {
  // TODO: HTTP 无状态 → cookie/session ID → 会话表 → JWT/token → bearer → 轮换
});

scene('federation', ({ root, s, c0 }) => {
  // TODO: Google 登录 → OAuth 授权 ≠ 认证 → OIDC ID Token → code/PKCE → SAML/SSO
});

scene('attacks', ({ root, s, c0 }) => {
  // TODO: 钓鱼/撞库 → XSS/HttpOnly → CSRF/SameSite → fixation → JWT 泄露
});

scene('close', ({ root, s, c0 }) => {
  // TODO: 三个问题收束：声明、证明、记住；每一环都有假设
});

scene('outro', ({ root, s, c0 }) => {
  // TODO: 片尾名单：策划 WaterRun、准备方与受托方模型、开源视频地址
});
