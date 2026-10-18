# 06 验收

## 1. 阈值

以 `project.json` 的 `check` 为准：时长 199.9–200.1 秒；60fps；1080p；最小字号 24px；静止上限 2.5 秒；左右边距 60px；字幕宽 zh 26 / en 44；英文最快 4 词/秒；音效覆盖 per_seconds 2.5 / kinds 6 / scene_per_seconds 4 / max_gap 6。

风格规则：`flat`（无阴影/渐变/模糊）、`no_emoji`、`palette`（只许 `111111 F1ECE1 E2412C F2C230 2F57B0 FFFFFF 6E6A61 8A857A`）、`fonts`（Sans SC / Inter / Mono）。不要把 `no_radius` 打开：圆、三角与票根需要几何形状。

## 2. 必须查的事实

- 账号是声明；口令是证明；口令不存明文，只存唯一盐 + 慢哈希；不是加密。
- session ID 是 bearer 凭证；cookie 的 Secure/HttpOnly/SameSite；登录后换 ID、注销失效。
- XSS/CSRF/session fixation 的区别；XSS 只读非 HttpOnly cookie；HttpOnly 不防 CSRF。
- 三类因子；MFA 是两个不同因子；OTP 不防钓鱼；passkey/WebAuthn 的公私钥、随机挑战、网站域名绑定。
- JWT 是 token 的一种：有签名，不默认加密；签名证明完整性，不隐藏内容；cookie 与 token 都认票不认人；要短命/绑定用途/可撤销。
- OAuth 2.0 是授权不是认证；OIDC 加身份层；code 短命/单次/绑定回调；PKCE；SAML/SSO 用 NIST 800-63C 的 federation 定义。
- 所有数字/协议名与 `research/FACTS.md` 逐字一致；不确定的不写。

## 3. 三项核心审查

1. 事实：逐句、逐画面对照 FACTS；标题、字幕、封面、译文也查。
2. 读音与节奏：`asr.js` 回听；专名清单见 `review/NOTES.md`；人耳确认读错/断句。
3. 旁白与画面对应：`scan.js` 对 `expect.*.json`；逐句看是否说到即出现。

## 4. 原创与动画完成度

- 参考来源与独立设计选择写进 README；不照搬海报/产品/聊天 UI。
- 每帧单看成立；任意 3 秒有可感知变化；镜头连续；形状动作有预备/过冲/落点；转场不重复同一种擦除。
- 关键帧 `src/design/kf.html` 是起点，不是逐帧复刻；场景可以更完整，但不能换掉视觉系统。

## 5. 交付说明 `DELIVERY.md`

包含：交付物、闸门完整输出、三项审查、原创与动画完成度、制作署名与片尾核对、需要人判断的事项、取舍、未做/未通过、复现命令、F01–F12 结尾反馈复盘（实际成片时间、证据、结果、遗留）。

## 6. 片尾

各语言、各版本：策划 WaterRun；准备方 DeepSeek V4.1 Flash 1017；受托方 Opus 5.5；实际分工；旁白合成；「开源视频」与 `github.com/Water-Run/ft`。名单与 `FACTS.md`、README、`DELIVERY.md` 一致；不猜版本、不虚构参与者。

## 7. 交付前

`node kit/tools/check.js videos/series/in-seconds/web-login --final` 必须「全部通过」；`docs/review.md` 第 5 节完成；未目视/未试听的范围如实写。只有工具缺陷或发现事实错误时才停下报告。
