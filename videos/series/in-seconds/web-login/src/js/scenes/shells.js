// 场景空壳：受托模型按 brief/04-storyboard.md 与 src/design/ 的范例实现。
// 每个场景只保留入口；不要在这里写演示内容。
scene('open', ({ root, s, c0 }) => {
  // TODO: 钩子（SID/cookie）→ 片名卡 → “session ID 凭什么代表你”
});

scene('password', ({ root, s, c0 }) => {
  // TODO: 口令 → TLS → salt + 慢哈希；不存口令
});

scene('session', ({ root, s, c0 }) => {
  // TODO: 会话编号 → Set-Cookie → 服务端会话表 → bearer 凭证
});

scene('attacks', ({ root, s, c0 }) => {
  // TODO: XSS / CSRF / session fixation 三条失窃路径；换编号与注销
});

scene('factors', ({ root, s, c0 }) => {
  // TODO: 三类因子 → AAL2 → OTP 不防钓鱼 → WebAuthn 的 challenge/签名/origin
});

scene('federated', ({ root, s, c0 }) => {
  // TODO: OAuth 授权 ≠ 认证 → code/PKCE → OIDC ID Token/JWT
});

scene('close', ({ root, s, c0 }) => {
  // TODO: 一条链：口令、cookie、MFA；每一环都有假设
});

scene('outro', ({ root, s, c0 }) => {
  // TODO: 片尾名单：策划 WaterRun、准备方与受托方模型、开源视频地址
});
