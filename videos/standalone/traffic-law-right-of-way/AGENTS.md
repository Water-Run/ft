# Opus 开工入口：道交法中的路权

**状态：2026-10-09 立项与取证预研已落盘，可接续中文稿；尚无通过审查的文案、配音或成片。**

WaterRun 指定：把原 10 月 11 日的本片提前到 **10 月 9 日**；**只做中文**；面向中国大陆普通机动车驾驶员普及道路通行知识；Codex 建项目、测绘事实并准备资料，供 Opus 接入开工。独立片，初始预算 8–10 分钟、上限 600 秒，是准备方的叙事预算，不是用户指定的定长秒数。删减旁支优先于加速讲解。

本次是**取证阶段交接**，分工由上述用户要求确定。通用委托模板中“文案、配音、视觉稿已经做好，受托方不能改文字”的前提不适用于本片。Opus 接续取证、写中文稿、交审，再完成设计、配音、场景与验收。无需为了开始这些工作重新请求开工授权。

## 阅读顺序

1. 本片 [README](README.md)、[任务与主线](brief/01-mission.md)。
2. 仓库 [制作流程](../../../docs/workflow.md)、[质量标准](../../../docs/standards.md)、[取证规则](../../../docs/research.md)、[验收](../../../docs/review.md)。
3. [反馈总账](../../../docs/feedback.md) 与 [2026-10-09 复盘](../../../docs/reviews/2026-10-09.md)，核对 README 的 F01–F09 计划。
4. [FACTS](research/FACTS.md) 全文、[来源登记](research/sources.json)、[场景测绘](research/SCENARIOS.md) 与 `research/lab/cases.json`。
5. 按序读 `brief/02-script.md` 至 `brief/06-acceptance.md`；实现前再读仓库 `docs/visual-design.md`、`docs/scenes.md`、`docs/sound.md`、`docs/tools.md`。

## 接手后直接做什么

1. 复查本片当前文件和进度，登记实际接手模型与版本。本片只有中文；计划制作者不等于已参与者。
2. 按 FACTS 的证据状态取舍。单一路径、版本待核或图形细节未核的条目先补证或舍弃。正文中的法律事实只能来自 FACTS。
3. 以同一组 A/B 车辆、同一个冲突点推导规则。先看清条件，再给结论，不把资料库所有规则挤入成片。
4. 写中文全文和逐句 `cue → R 编号 → 来源条款` 对照，替换 `src/js/script.js` 模板；交审主旨、章节答案、舍弃材料、分章预算和 F01–F03 处理记录。
5. 按既有 `docs/workflow.md` 第 2 步，由 WaterRun 审查并明确确认中文稿，记录稿本哈希。**确认前不合成配音、不写成片场景**；可以继续取证、环境准备与视觉探索。
6. 确认后完成本片独立视觉、声音、制作与最终复盘；F01–F09 用最终中文 MP4 的时间点验证。

## 当前材料的用途

- `research/lab/`：来源记录、法条摘录和带条件的教学示意，不是实测事故数据。
- `src/js/data.js`：由 `tools/gen_data.py` 生成的案例输入；坐标、尺寸由后续设计确定，不能包装为实测。
- `src/js/script.js`、`src/js/scenes/`、`src/js/config.js`：带 `SCAFFOLD_ONLY` 标记的模板，**不是本片叙事、动效或声音方案**。
- `expect.zh.json` 与 `timing.zh.js`：占位；不得声称已有配音时长或 ASR 验收。
- 当前不运行完整 `check.js --handoff` 并声称制作交接通过：该闸门所需定稿、音频与设计尚未生产。预研检查见 `research/lab/preparation-check.txt`。

只修改本片目录。共用片单与 TODO 的收尾更新先检查他人改动；Dense/MoE 等并行项目不得覆盖，不清理其他会话的浏览器配置或产物。
