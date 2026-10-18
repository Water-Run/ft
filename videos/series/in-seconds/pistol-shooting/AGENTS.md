# 制作入口：150 秒学会怎么打手枪？

本片：`videos/series/in-seconds/pistol-shooting`。当前阶段与接续步骤以 README 为准。

1. 读仓库 `AGENTS.md`、`docs/workflow.md`、`docs/standards.md`、`docs/feedback.md`，填写 README 的开工反馈应用。
   先运行 `node kit/tools/feedback.js videos/series/in-seconds/pistol-shooting sync`，按当前规则填写 `review/feedback.json`，对照 Lean 4 负面案例与 MyISAM 正面对照；以后规则更新也要重新核对变化项。
2. 核对 `project.json`、README、`research/FACTS.md` 与当前输出。事实只能来自 FACTS.md。
3. `src/js/script.js` 是唯一文案源稿。用 `script-review.js` 导出逐句校对稿，意见留在 `review/NOTES.md`。
4. 指定校对者 WaterRun 明确确认前不配音、不铺开场景；不能自行填写虚构的通过记录。确认过期时按 `docs/script-review.md` 处理。
5. 按 `docs/review.md` 检查实际成片，填写结尾反馈复盘。片尾记录策划 WaterRun、实际参与模型及「开源视频」链接 https://github.com/Water-Run/ft。
6. 交付后按 `docs/lifecycle.md` 归档、校验、清理；更新 README 的当前状态与接续。生成物不入库，清理默认只预览。

修改限于本片目录；共享工具或规范的必要改进独立处理。既有授权内的实现自行完成；真实的人类确认、未核事实和工具阻塞如实报告。
