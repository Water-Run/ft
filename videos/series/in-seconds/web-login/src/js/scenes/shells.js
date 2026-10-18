// 场景空壳：受托模型按 brief/04-storyboard.md 与 src/design/ 的范例实现。
// 每个场景只保留入口；不要在这里写演示内容。
scene('open', ({ root, s, c0 }) => {
  // TODO: cookie → Session ID → Session；四层骨架 + 片名
});

scene('session', ({ root, s, c0 }) => {
  // TODO: 服务器会话、Session ID、Cookie 运输、查表；缺点：表/偷/CSRF
});

scene('jwt', ({ root, s, c0 }) => {
  // TODO: token 格式≠Session；三段/编码≠加密/验签；Access/Refresh；撤销
});

scene('authn', ({ root, s, c0 }) => {
  // TODO: 口令知道、短信拥有、passkey 私钥、验证码判人；认证≠会话
});

scene('oauth', ({ root, s, c0 }) => {
  // TODO: OAuth 授权、OIDC ID Token、Access/Refresh、验签/受众、信任转移
});

scene('attacks', ({ root, s, c0 }) => {
  // TODO: 会话/JWT/认证/授权各层攻击面
});

scene('close', ({ root, s, c0 }) => {
  // TODO: 认证、会话、授权、令牌四层；不同问题，不同代价
});

scene('outro', ({ root, s, c0 }) => {
  // TODO: 片尾名单：策划 WaterRun、准备方与受托方模型、开源视频地址（不配旁白）
});
