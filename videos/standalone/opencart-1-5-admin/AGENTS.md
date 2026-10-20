# OpenCart 1.5：Opus 制作入口

**当前阶段：中文 R3 待 WaterRun 明确确认；尚未开始配音和正式场景。** 风格 A 已确认。本轮准备模型为 GPT-6 Astra。

## 交接范围

WaterRun 要求本片讲透各个子系统，并推进到文案讨论完成、能交给 Opus 制作。本次按这个边界交接：准备方完成事实、中文稿、选定视觉方向和分镜任务；Opus 接续音色试听、翻译、视觉细化、动画、声音与成片。这比仓库通用的“配音和示范场景均完成后交接”更早，依据是本次直接委托范围。

`project.production.maker = Opus` 表示拟接续方，不证明新的制作已经发生。接手后登记实际型号与完成的工作，保留 Claude Opus 5.5 的原实验 / R1 贡献及 GPT-6 Astra 的 R3 准备贡献。

## 阅读顺序

1. [README](README.md)、[交接状态](HANDOFF.md)、[校对记录](review/NOTES.md)。
2. [事实台账](research/FACTS.md)、[子系统覆盖表](research/SUBSYSTEMS.md)、[脱敏规则](research/REDACTION.md)。
3. [R3 连贯全文](research/SCRIPT-R3.md)，核对 `src/js/script.js` 和 `review/approval.json`。
4. [使命](brief/01-mission.md)、[文案边界](brief/02-script.md)、[视觉](brief/03-visual.md)、[分镜](brief/04-storyboard.md)、[动作与声音](brief/05-motion-sound.md)、[验收](brief/06-acceptance.md)。
5. 仓库 [反馈](../../../docs/log/feedback.md)、[10 月 18 日复盘](../../../docs/log/reviews/2026-10-18.md)、[制作流程](../../../docs/process.md)、[质量标准](../../../docs/standards.md)、[审查](../../../docs/guides/acceptance.md)、[环境](../../../docs/reference/environment.md)。

## 开工顺序

所有命令在仓库根目录运行，`V` 指本片目录 `videos/standalone/opencart-1-5-admin`。

| 步骤 | 动作 | 通过条件 |
|---|---|---|
| 文案边界 | `node V/tools/check_handoff.cjs` | 材料检查通过；文案确认检查也通过。pending 时只可继续读稿和不依赖稿件的准备 |
| 环境 | `node kit/tools/doctor.js V` | 缺失依赖按环境文档补齐，路径留在本机配置 |
| 反馈 | `node kit/tools/lessons.js V sync`，核对并保留具体计划，再运行 check | 当前 F 规则逐项处理；不把旧结论自动迁移到新规则 |
| 音色与读法 | 按 05 的三个代表段试听；确认音色后合成中文 | 听清术语、句中停顿和连续语气；有实际试听记录 |
| 中文画面 | 按 A 方向细化关键帧，先做会话 / 权限代表片段 | 同一对象可追踪；文字稳定停留；不再出现“刷一下就过去” |
| 英文 | 中文获批后翻译，解释与中文逐段对应，单独导出交审 | 英文未确认前不运行英文 TTS。用户只要求文档中文化，原双语影片计划仍保留 |
| 制作与交付 | 按仓库流程完成正式场景、音轨、成片、封面、审查和 DELIVERY | `check.js --final`、实际观感检查、F01–F14 成片证据与片尾名单均通过 |

`V` 是文档中的代号，实际命令要替换为上述目录；不是可直接运行的环境变量。当前只具备文案阶段的交接包，不能宣称通用 `check.js --handoff` 已通过。

## 本片不可省略的要求

- 九章按一次订单请求连接；登录、会话 / token、权限、数据库各自讲清，不缩成术语闪卡。事实只取 FACTS。
- 已确认 A“后台即舞台”；历史 UI 作为讲解对象，说明图、镜头与动作重新设计。
- CASE-A 只采用公开匿名证据和独立合成图解。制作无需访问私有工程；不读取或索取生产配置。
- 阅读时镜头稳定。数据库关联图不得暗示外键或事务保证；AJAX 返回 HTML 与 JSON 分开画。
- 未获明确确认，不配音、不实现依赖稿件的正式场景；实质改稿重新交审。
- 当前空场景是旧骨架。按 R3 的 scene ID 重建加载清单，不能把占位动画当完成稿。
- 片尾至少 12 秒，列策划 WaterRun、所有实际参与模型与分工，以及“开源视频”与完整 GitHub 地址。
- 只提交本片目录；共享工具有问题时记录和报告，不降低闸门或改动其他制作者的片子。
