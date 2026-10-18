# 文案阶段交接状态

更新：2026-10-19。准备：GPT-6 Astra。策划与审稿：WaterRun。后续拟由 Opus 制作。

## 已具备

- 官方固定版本机制证据、S19 子系统复核，以及 CASE-A 的匿名深入静态测绘。
- 中文 R3 连贯全文、自动分句、逐段事实定位和估算时间表：[SCRIPT-R3](research/SCRIPT-R3.md)。
- WaterRun 已确认的 A 视觉方向；登录、会话、权限、数据库、查询、页面、写入的具体分镜。
- F01–F14 应用计划、合成数据生成器、字幕 / 画面关键字对应与独立的文案阶段交接检查。
- 中文任务书、脱敏边界、音色与读音试听方案、成片验收和收尾清理要求。

## 当前未完成

| 项目 | 状态 | 完成依据 |
|---|---|---|
| WaterRun 对当前 R3 的明确确认 | pending | 带当前内容哈希的 approval.json，以及 NOTES 的真实确认原话和日期 |
| 音色、读音和连贯口播试听 | 未开始 | 文案确认后由 Opus 录制试听片，再记录实际人耳反馈 |
| 英文译文与审查 | 未开始 | 中文定稿后逐段译文、逐 cue 对应和英文确认 |
| 正式场景 / 代表动画 | 未开始 | A 方向只是已确认风格，不是完整动画验收 |
| 配音、主成片、封面与最终复盘 | 未开始 | 实际文件、参数、哈希、时段和观感检查 |

## 交给 Opus 的任务文本

> 先读本片 AGENTS.md，核对中文 R3 的当前内容哈希、WaterRun 的明确确认和 F01–F14 处理计划。确认成立后，从代表段音色试听和 A 方向代表动画开始，按 brief 继续中文配音、场景、英文翻译交审、声音与双语成片。讲透登录、会话、权限、数据库等子系统，沿同一张订单推进。CASE-A 全程只用匿名证据与独立合成图解。按实际贡献登记模型 credit，最终提交 DELIVERY 和成片证据。文案仍为 pending 时，先把具体问题反馈给 WaterRun。

无需再向策划者重问已选风格或是否需要详细子系统。准备材料检查通过和人工确认是两个状态；`check_handoff.cjs` 会分别报告。通用制作闸门仍须在后续对应阶段真实通过。

## 2026-10-19 制作中断点（Claude Opus 5.5）

WaterRun 于 01:37 授权自主完成到中文成片（记录见 review/NOTES.md「2026-10-19 授权自主定稿」，approval.json 据此为 approved；不是逐句阅读确认）。02:05 因额度不足，WaterRun 改为「专注做 tmux，其它在最近点妥善收尾」，本片在下列状态停下。**没有混音、渲染或成片。**

| 部分 | 状态 | 说明 |
|---|---|---|
| 语言 | 只做中文 | project.json languages 改为 zh；英文取消 |
| 配音 | 完成，未人耳试听 | MiniMax speech-2.8-hd，音色 Chinese (Mandarin)_Reliable_Executive，speed 0.97；256 句，总长 1009.0 s（16:48），5.56 字/秒，略快于 4.8–5.3 目标，可改 speed≈0.92 重合成（约 20 分钟，受 RPM 限制）。SAY 表是为 edge 调的，MiniMax 能直接读 OpenCart / PHP / MySQL，需要回听后精简 |
| 共用基础 | 完成，未看画面 | style.css（1.5 后台皮肤 + 图解层）、parts.js（部件 API 见文件头）、config.js（「整页刷新」式章节卡，lead 4.2）、index.html 按 s00–s11 加载、src/js/SCENE-GUIDE.md |
| s00_open | 完成初稿 | B01、B02、B40–B43 七站；未用 look/scan 检查 |
| s01_request | 部分 | 只有 B03；B44、B04–B07 未做 |
| s02_login | 初稿 | B08–B10 五站；已知镜头比站点偏左约 400px（cam.track 漂移段与下一关键帧重叠）、「＝ 相同」对比度不足 |
| s03_session | 占位 | B11–B14 未做（代表段，优先） |
| s04_permissions、s05_database | 初稿 | B15–B22 全部写完；未开图、未 scan；疑似重叠点见下 |
| s06_query | 占位 | B23–B26 未做；已核：第 2 页 `LIMIT 20,20`（46 条按 order_id 倒序，第 2 页为 26–7，订单 7 正好是末行）、COUNT 语句、状态清单查询只在首开时执行；(int) 与 escape() 的位置；缓存文件 cache.order_status.1.<到期时间>（g13、g14、S19-08、S19-10、L14、C19-05） |
| s07_page | 部分 | B27（e1）、B28 完成；B27（e2）、B46、B29、B30 是标注占位；两处离站过早导致截帧在平移中 |
| s08_write、s09_case、s10_close | 占位 | B31–B39 未写代码；设计方案见下 |
| s11_end | 完成初稿 | 12 秒片尾；名单交付前对照 FACTS |

已知坑：T() 的第二参数必须是字符串或 null，传数字会让 boot 报 `s.replace is not a function`；不要用 SQL 作 T() 关键词（SAY 会改写成 S Q L）；本片制作锁会被 look.js 占用，并行检查需重试。

### 未完成段落的设计要点（各场景作者留下）

- request B44–B07：左右卡片演示环境 PHP 5.3.10 / MySQL 5.5.62 / Apache 2.2.22 / Ubuntu 12.04.5 对 4.1.0.4 的 PHP ≥ 8.1（只比运行要求）；三条地址对齐 index.php → route → `admin/controller/sale/order.php` 的 `index()`；控制器连模型（取数据）与 order_list.tpl（生成页面）；入口三步（连库、读 131 项设置、建对象）与 Registry；令牌停在登录检查、权限检查两道关前。
- session B11–B14：浏览器 Cookie 卡 `PHPSESSID = ‹会话编号（示意）›` 对服务器会话文件（user_id = 1、token = ‹令牌A›）；销毁后被送回登录页；URL 令牌与会话令牌并排比较，去掉 URL 令牌停在「Invalid token session」；历史 / 访问日志小面板（实验访问日志 12 行含 token=）。
- page 其余：header / order_list / footer 三组控制器→模板拼成一页；PHP 模板与 Twig 两行写法对照；19 个资源文件与 5×56 header.png 切片横向重复；顾客筛选 AJAX 返回 JSON（1,972 字节）与 HTML 片段区分；五步查询路径收在「查询完成」。
- write B31–B35：2×2 世界；订单 #7 页三道检查（登录 / access / modify）；out_13_trace 的 UPDATE 与 INSERT；MyISAM 与 InnoDB 副本按「开始→修改→回滚」逐步对比（FACTS h11–h15：1→7，警告 1196）；两写之间截断的推断示意；历史 HTML 片段（785 字节）对自动补全 JSON（1,972 字节）。
- case B36–B38：固定 caseStrip；官方链路退为背景，采购 / 库存 / 订单 / 称重 / 查询 / 导出逐项点出；条件→控制器→连接器→结果→列表或导出（合成输入）；结尾「静态观察 · 合成示意」。
- close B39：回到订单列表，筛选、页码、查看依次对应请求；入口→检查→数据→页面走一遍；1.5.6.4 对 4.1.0.4 三项对照；g2 结论稳定 ≥5 秒。

接续顺序建议：先修 s02 镜头并完成 s03 代表段，看画面确认 A 风格；再补 s01、s06–s10；全片 scan / check 后再混音渲染。
