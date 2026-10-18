# OpenCart 1.5 后台

**当前：中文 R3 待 WaterRun 明确确认。** A“后台即舞台”已确认；本轮完成匿名深入测绘、子系统复核、中文重写、时代引入、新版对照和 Opus 制作任务书。尚无本片配音或成片。

- [阅读中文 R3 全文与时间预算](research/SCRIPT-R3.md)
- [各子系统的详细覆盖与验收问题](research/SUBSYSTEMS.md)
- [Opus 制作入口](AGENTS.md) · [交接状态](HANDOFF.md)
- [事实台账](research/FACTS.md) · [匿名测绘](research/DEEP-MAP.md) · [视觉确认](research/STYLE-DECISION.md) · [脱敏规则](research/REDACTION.md)
- [逐轮校对与确认](review/NOTES.md) · [结构化反馈记录](review/feedback.json)

## 本片要讲清什么

观众用过网页和网店，不要求会 PHP、SQL，也不依赖前集。主问题是：**点击订单页和修改状态时，界面、程序与数据库怎样配合？**

开场从现代建站选择回到 2014 年，先说明 OpenCart 是什么、当时的产品 / 生态位置与观看路线。中途对照固定的 4.1.0.4：PHP 环境、数据库驱动与 Twig 模板。

正文九章：请求入口 → 登录 → 会话与令牌 → 权限管理 → 数据库结构 → 查询与缓存 → 模板和浏览器 → 写入与事务 → 匿名长期案例。先把一次查询走完，再修改七号演示订单。每章职责、输入、输出与拒绝分支见 SUBSYSTEMS。

中文当前 77 段、256 条旁白，估算 **17:28.3**，含 12 秒无旁白片尾。交审预算 **14–18 分钟**，尚非配音实测。英文待中文定稿后翻译并单独交审；文档均为中文。

保留后台共用机制的深度；前台结账、支付插件、每一种报表和真实业务规则不扩成另一套教程。规模数字在解释之后出现，不能重演 Lean 4 的术语与材料堆积。

## 当前版本与历史

| 时间 / 版本 | 已完成 | 尚未完成 |
|---|---|---|
| 2026-10-09 预研 | 官方与 CASE-A 静态结构；旧统计以匿名收紧版保留 | 未核生产状态；不证明直接分叉版本 |
| 2026-10-11 R1 | 官方容器实验、中文初稿、A / B / C 关键帧探索 | 没有明确文案确认；旧原始捕获仍留本机 |
| 2026-10-18 | WaterRun 选 A；CASE-A 新一轮 15 组深查；InnoDB / Lean 4 反馈落入规则 | 无新语音或成片 |
| 2026-10-19 R3 | 九章中文稿、S19 子系统事实、46 组分镜、47 个关键字检查点、合成数据与 Opus 任务书 | WaterRun 明确确认；英文；试听；正式场景与交付 |

R1 的初次提交说明见 [SCRIPT-REVIEW](research/SCRIPT-REVIEW.md)。重写前工作稿保存于 research/versions/script-before-r2.js；与最初交审哈希不同，不能冒充原件。R2 阅读后新增的开场与片尾意见已形成 R3；当前稿本内容哈希从唯一源稿导出，见 SCRIPT-R3；approval.json 保持 pending。

## 制作边界

A 方向采用白色内容、钢蓝页头、深灰菜单、锈橙当前步骤及有限的浅黄强调。借鉴的是所讲历史界面的视觉语言；图解、镜头和动作围绕本片重新设计。旧原稿推荐 C 的说法已失效。

官方运行实验与 CASE-A 分开。当前制作无需访问私有工作区：只用 FACTS、匿名统计和独立合成数据。私有源码、配置、真实记录、业务路径、网络标识、原始哈希及截图不交给后续模型。口令、会话和令牌只用显式占位。

旧实验脚本 L10–L17 和原始捕获尚未完成公开审核，由本片 .gitignore 排除。它们不是别人 clone 后已经具备的材料。公开官方固定源码链接、已记录测量、合成数据生成器和分镜足够继续制作；需要重跑旧实验时另行整理公开的隔离复现包，不凭过期数字推断新测量。

## 复查命令

在仓库根目录执行：

```sh
node videos/standalone/opencart-1-5-admin/tools/build_demo_data.cjs
node videos/standalone/opencart-1-5-admin/tools/export_storyboard.cjs
node videos/standalone/opencart-1-5-admin/tools/export_script.cjs
node kit/tools/script-review.js videos/standalone/opencart-1-5-admin export --lang zh
node videos/standalone/opencart-1-5-admin/tools/check_handoff.cjs --materials-only
node videos/standalone/opencart-1-5-admin/tools/check_handoff.cjs
```

最后一项在人工确认 pending 时应失败；不能用仅材料通过代替批准。配音、场景和全量制作闸门由 Opus 在确认后完成。没有执行本片生成物清理；交付后按仓库 lifecycle.md 先归档、校验并抽验恢复，再清理。

## 本轮开工反馈应用（F01–F14）

正面对照 MyISAM 的具体对象与逐步解释；Lean 4 是主旨和认知负担的典型负例。InnoDB 的七项新反馈在本片逐项处理，不能只写“已阅读”。

| 编号 | 本片具体做法 | 验证入口 |
|---|---|---|
| F01 | 用订单查询和状态修改串起九章；数字在机制讲通后出现，Lean 4 作主旨失焦的负例。 | SCRIPT-R3 o1–o5、e3–e4、g1–g2；分镜 B01–B02、B28、B39。 |
| F02 | 登录、会话、权限、数据库独立展开；同一七号订单连接表结构和两次写入。 | SUBSYSTEMS 的逐项验收问题；分镜 B08–B22、B31–B35。 |
| F03 | 官方 1.5.6.4、匿名 CASE-A、原实验测量和新合成示意分别标注；数据库连线不暗示外键。 | FACTS S19-07、S19-12、A18；R3 q5、f1–f8；分镜 B21、B36–B38。 |
| F04 | 章卡稳定≥2.5秒；结论≥3秒；多步对照≥5秒，入退场及镜头移动不计阅读。 | brief/03-visual、06-acceptance；storyboard.json 的 stable_seconds；最终逐段实测。 |
| F05 | 请求、用户、订单编号跨步骤保持可追踪；拒绝时停止请求，写入时原位更新记录。 | brief/04-storyboard、05-motion-sound；代表片段和最终连续播放核对。 |
| F06 | 文案批准后比较自然中文音色；先听连贯口播，再编配乐与动作声，阅读段保持安静。 | brief/05-motion-sound 三组代表段；保留试听文件、相邻句与最终混音的人耳结果。 |
| F07 | 只公开匿名结构统计；旧材料也移除自定义业务路径和原始源码哈希；演示数据独立生成。 | REDACTION、DEEP-MAP；18_case_deep_audit.test.cjs；tools/build_demo_data.cjs；入库和成片分别复查。 |
| F08 | 各语言正式主 MP4 测规格与最终编码音轨；用实际文件哈希及时段绑定结尾反馈。 | brief/06-acceptance；最终 out 清单、ffprobe、响度和 feedback.json clips。 |
| F09 | 新源码复核 S19、旧实验 R1、静态测绘 A18 和用户意见分开记；未知事实不补猜。 | FACTS、review/NOTES；原用户反馈及源码链接可定位；发布后回填意见和复测。 |
| F10 | MyISAM 和事务在本片解释；删掉依赖上一部的问题编号和回忆，不要求看过系列。 | SCRIPT-R3 d5–d8；brief/01-mission；目标观众按首次观看复述。 |
| F11 | SQL、access / modify、JSON、源码字段均附中文作用说明；英文译文与中文对应。 | SUBSYSTEMS、brief/03-visual；expect.zh.json；英文译稿另行导出和交审。 |
| F12 | 按具体词配置读法，取消全局“行”字替换；试听术语、逗号衔接、长句重音与断句。 | src/js/script.js SAY；brief/05-motion-sound；ASR 只作疑点，最终按实际人耳确认。 |

## 本轮结尾反馈复盘

本轮完成的是研究、文案与制作约束。下列项目全部尚缺新成片证据，不能以改了脚本或规则判为修复。

| 编号 | 本轮已留的材料 | 成片结果 / 遗留 |
|---|---|---|
| F01 | SCRIPT-R3 o1–o5、e3–e4、g1–g2；分镜 B01–B02、B28、B39。 | pending；由 Opus 制作后回填实际 MP4 时间、哈希和检查结果 |
| F02 | SUBSYSTEMS 的逐项验收问题；分镜 B08–B22、B31–B35。 | pending；由 Opus 制作后回填实际 MP4 时间、哈希和检查结果 |
| F03 | FACTS S19-07、S19-12、A18；R3 q5、f1–f8；分镜 B21、B36–B38。 | pending；由 Opus 制作后回填实际 MP4 时间、哈希和检查结果 |
| F04 | brief/03-visual、06-acceptance；storyboard.json 的 stable_seconds；最终逐段实测。 | pending；由 Opus 制作后回填实际 MP4 时间、哈希和检查结果 |
| F05 | brief/04-storyboard、05-motion-sound；代表片段和最终连续播放核对。 | pending；由 Opus 制作后回填实际 MP4 时间、哈希和检查结果 |
| F06 | brief/05-motion-sound 三组代表段；保留试听文件、相邻句与最终混音的人耳结果。 | pending；由 Opus 制作后回填实际 MP4 时间、哈希和检查结果 |
| F07 | REDACTION、DEEP-MAP；18_case_deep_audit.test.cjs；tools/build_demo_data.cjs；入库和成片分别复查。 | pending；由 Opus 制作后回填实际 MP4 时间、哈希和检查结果 |
| F08 | brief/06-acceptance；最终 out 清单、ffprobe、响度和 feedback.json clips。 | pending；由 Opus 制作后回填实际 MP4 时间、哈希和检查结果 |
| F09 | FACTS、review/NOTES；原用户反馈及源码链接可定位；发布后回填意见和复测。 | pending；由 Opus 制作后回填实际 MP4 时间、哈希和检查结果 |
| F10 | SCRIPT-R3 d5–d8；brief/01-mission；目标观众按首次观看复述。 | pending；由 Opus 制作后回填实际 MP4 时间、哈希和检查结果 |
| F11 | SUBSYSTEMS、brief/03-visual；expect.zh.json；英文译稿另行导出和交审。 | pending；由 Opus 制作后回填实际 MP4 时间、哈希和检查结果 |
| F12 | src/js/script.js SAY；brief/05-motion-sound；ASR 只作疑点，最终按实际人耳确认。 | pending；由 Opus 制作后回填实际 MP4 时间、哈希和检查结果 |

## 制作署名

策划：WaterRun。历史预研由 Codex（当时记录基于 GPT-6）完成；官方实验、R1 及关键帧探索由 Claude Opus 5.5 完成；本轮匿名测绘、S19 核对、R3、分镜与交接准备由 **GPT-6 Astra** 完成。后续 Opus 的实际型号与贡献在接手后登记。

开源视频：[github.com/Water-Run/ft](https://github.com/Water-Run/ft)。片尾、FACTS、README 与 DELIVERY 按最终实际参与统一；不把交通法拟用的 Gemini 算作本片参与者。


## 2026-10-19 新增反馈应用与结尾待办

- **F13**：开场先从现代网店进入 2014 年，解释 OpenCart 的定义、自建商城定位与生态，再给三步路线；以固定 4.1.0.4 作环境、驱动和模板对照。 验证：research/SCRIPT-R3.md o1–o8、a2a、c8a、e2a、g2；FACTS C19；分镜 B01、B02、B40–B46。 成片结果保持 pending，需实际时间与音轨证据。
- **F14**：片尾为12秒空字幕静默cue，credits:true且无tts；署名指令只留任务书，连贯正文不含它们。 验证：src/js/script.js r2_credits；brief/06-acceptance；SCRIPT-R3 正文与最终片尾音轨逐项核对。 成片结果保持 pending，需实际时间与音轨证据。
