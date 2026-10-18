// 场景空壳：受托模型按 brief/04-storyboard.md 与 src/design/ 的范例实现。
// 每个场景只保留入口；不要在这里写演示内容。
scene('open', ({ root, s, c0 }) => {
  // TODO: 列出 cookie/JWT/口令/短信码/passkey/验证码；先看 cookie
});

scene('cookie', ({ root, s, c0 }) => {
  // TODO: 会话表验证连续 → 缺点：共享表/偷编号/CSRF
});

scene('jwt', ({ root, s, c0 }) => {
  // TODO: 签名令牌代替查表 → 三段/编码≠加密/验签 → 缺点：撤销/被偷
});

scene('password', ({ root, s, c0 }) => {
  // TODO: 回到第一次验证 → 口令比对哈希 → 只证明“知道”
});

scene('factors', ({ root, s, c0 }) => {
  // TODO: 短信码验证“拥有” → 可转发；passkey 验证“私钥” → 设备依赖
});

scene('delegated', ({ root, s, c0 }) => {
  // TODO: 第三方身份提供方验证 → 交回断言 → 本站验签名/受众 → 信任转移
});

scene('attacks', ({ root, s, c0 }) => {
  // TODO: 验证码判人 → cookie/JWT 被偷 → 钓鱼/转发 → 配置错误
});

scene('close', ({ root, s, c0 }) => {
  // TODO: 没有万能机制；按证据/规则/代价选
});

scene('outro', ({ root, s, c0 }) => {
  // TODO: 片尾名单：策划 WaterRun、准备方与受托方模型、开源视频地址
});
