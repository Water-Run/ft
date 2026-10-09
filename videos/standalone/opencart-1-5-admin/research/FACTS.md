# 后台案例事实记录

取证和核查日期：2026-10-09。对象包括私有工作区的匿名案例 CASE-A，以及官方 OpenCart 1.5.6.4 的固定提交。当前为选题前预研，没有待批准的文案或已经交付的影片。

## 取证环境和复现

案例测量在 Linux 工作区中使用 Python 标准库读取跟踪源码，不执行 PHP，不连接业务服务。真实路径通过环境变量传入，不打印也不写进公开输出。案例源代码不包含在本包中，CASE-A 的复跑需要授权的原工程副本。工作区定位和原始提交保存在原工程私有忽略目录中，公开证据以文件 SHA-256 固定被检查字节。

```bash
python research/lab/01_case_inventory.py --date 2026-10-09
```

运行前设置 `CASE_REPO` 为私有工作区。标准输出保存为 `research/lab/out_01_case_inventory.json`。脚本统计应用跟踪路径，对代表路由做词法扫描，输出元数据而非源码。匹配可能包含注释或未运行分支，不等同于 PHP AST 或浏览器实测。

官方取证脚本仅访问公开源码，固定提交为 `31323f8ce70338e88570217f76e1111f7b2bcc8f`。缓存参数指向公开包之外的临时目录，第三方源码不入库。

```bash
python research/lab/02_upstream_inventory.py --date 2026-10-09 --cache /tmp/opencart-research
```

官方脚本输出保存为 `research/lab/out_02_upstream_inventory.json`。本轮通过 GitHub 的 [tag 引用](https://api.github.com/repos/opencart/opencart/git/ref/tags/1.5.6.4) 核对了提交，随后从固定提交地址取回 5 个文件。未安装 PHP 运行环境或渲染官方页面。此临时演示缓存路径没有身份信息。

## 来源目录

| 编号 | 来源和版本 | 可复查位置 |
|---|---|---|
| S1 | CASE-A 当前应用源码，2026-10-09 检查 | [案例元数据](lab/out_01_case_inventory.json)，含文件相对路径、SHA-256、行号和匹配标记 |
| S2 | 官方 OpenCart 1.5.6.4 固定提交，2026-10-09 获取 | [官方元数据](lab/out_02_upstream_inventory.json)，含逐文件固定链接与 SHA-256 |
| S3 | 案例历史交接和仿真文档，主要为 2026-09 记录 | 私有原工程的 `docs/handover/`、`tests/sim121/README.md`；本包仅作脱敏概述，历史运行结论未重新验证 |
| S4 | 案例 Dockerfile、Compose、局部前端工程 | 版本声明与文件哈希列于 S1，配置内容不复制 |
| S5 | 制作规范与反馈 | ft 的 `docs/research.md`、`docs/feedback.md`、`docs/reviews/2026-10-09.md` |

S1 的文件计数和人工阅读同属同一源码快照，不能冒充两个独立来源。S2 可交叉核对框架机制，但不能为案例真实生产行为背书。S3 的环境、发布和数据问题需要另外验证才能写成当天现状。

## 版本与架构事实

以下各条核查日期均为 2026-10-09。适用版本在“范围”列内限定，源文件当前行号和哈希见 S1、S2。

| 编号 | 陈述 | 范围与状态 | 依据 |
|---|---|---|---|
| V01 | 案例入口中的版本常量为 `1.4.9.3` | CASE-A，静态确认；非完整发行版鉴定 | S1 `admin/index.php:206`；页尾 `admin/controller/common/footer.php:32–35` 引用常量 |
| V02 | 官方对照入口常量为 `1.5.6.4` | 官方固定提交，静态确认 | S2 `upload/admin/index.php:3` 及 tag 引用 |
| V03 | 两者都有后台登录与权限预动作 | 两份被检查源码，静态确认 | S1 `admin/index.php:431,434`；S2 对应文件 `149,152` |
| V04 | 两者都将路由映射到 Controller 类，并用 PHP 模板输出页面 | 两份源码的共同结构，静态确认 | S1 `system/engine/action.php:64`、`controller.php:148,154`；S2 对应文件 `27` 与 `78,82` |
| V05 | 上述证据不能证明完整分叉版本或首次上线年份 | 继承关系待考证 | 缺少原始发行包、历史合并记录和上线证据；不进入确定性版本史叙述 |

官方代码直达链接：[后台入口](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/admin/index.php)、[路由解析](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/system/engine/action.php)、[模板控制器](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/system/engine/controller.php)。

## 界面与业务事实

| 编号 | 陈述 | 范围与状态 | 依据 |
|---|---|---|---|
| U01 | 官方对照页头存在多级菜单，引用 jQuery 1.7.1、jQuery UI 和 Superfish | 官方 1.5.6.4 源码，未渲染 | S2 `upload/admin/view/template/common/header.tpl:20–24,63`，解析出的脚本与菜单变量 |
| U02 | 官方订单列表有表格、筛选字段和分页 | 官方 1.5.6.4 源码，未渲染 | S2 `upload/admin/view/template/sale/order_list.tpl:21,61–80,110` |
| U03 | 案例菜单包含采购、入库、出库、库位、称重、计提、绩效等入口 | CASE-A，静态确认，实际角色权限未核验 | S1 `menu_label_lines` 和 27 个路由的控制器映射 |
| U04 | 案例保留两套页头，并按路由和会话菜单版本选择 | CASE-A，静态确认 | S1 `admin/controller/common/header.php:423–428`，两份模板 |
| U05 | 案例旧列表包含表单、筛选和分页，公共 CSS 有 12px 字号与列表样式 | CASE-A，静态确认；尺寸和观感未实测 | S1 `admin/view/template/sale/order_list.tpl:20–21,252`、`admin/view/template/catalog/product_list.tpl:174,319`、`admin/view/stylesheet/stylesheet.css:13–14,241,294,298` |
| U06 | 近期计提记录模板仍有 jQuery 风格调用 | CASE-A，静态确认；纠正“新页无 jQuery”的旧描述 | S1 `admin/view/template/sale/accrual_record_clickhouse.tpl:1225–1226` 等标记 |
| U07 | 27 个代表控制器存在，六个被引用模型或模板缺失 | 当前工作区，静态确认；可达性和线上影响未知 | S1 `pages` 与 `artifacts` 中 `exists:false`；[页面地图](PAGE-MAP.md) |
| U08 | 五类记录查询对应六个样本路由，其中计提有两份实现 | CASE-A 当前工作区，静态确认 | S1 六份控制器、模型和模板映射 |

官方界面结构直达链接：[页头](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/admin/view/template/common/header.tpl)、[订单列表](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/admin/view/template/sale/order_list.tpl)。

## 规模与数据依赖事实

| 编号 | 陈述 | 范围与状态 | 依据 |
|---|---|---|---|
| D01 | 应用跟踪文件 50,660，其中 PHP 10,767、模板 1,436 | CASE-A 应用跟踪路径实测；含 SDK、副本和资源 | S1 `metrics`，由脚本枚举 Git 路径后按扩展名统计 |
| D02 | 1,202 个模板含 script 标签，25 个 PHP 或模板文件不是合法 UTF-8 | 同一快照的字节和文本扫描 | S1 `metrics`；不作实际脚本执行或性能推论 |
| D03 | 记录查询引用 ClickHouse 连接器，导出代码引用下载连接器 | CASE-A，静态依赖确认；服务状态未知 | S1 `admin/model/sale/accrualrecordclickhouse.php:8`、`utils/ClickHouseConnector.php:694–697` 等 |
| D04 | 工资模型同时引用 PostgreSQL 和 ClickHouse，并含存档方法 | CASE-A，静态确认；未读工资或存档数据 | S1 `admin/model/query/ordersalaryquery.php:8–13,455` 等；人工检查方法声明 |
| D05 | 近期记录控制器实现帮助问答和自然语言查询方法 | CASE-A，静态确认；未调用模型服务 | S1 相关控制器的 `public_methods` |
| D06 | 局部前端工程声明 Vue 3、Vuetify，输出到 `admin/Lib/vueapp` | CASE-A，构建配置静态确认；未构建 | S1 `frontend/package.json` 与 `frontend/vite.config.ts:28` |
| D07 | 历史文档记载不同生产 PHP 版本和仿真环境；开发容器声明 PHP 5.6 | 历史或配置背景；当前运行态未验证 | S3、S4，不能作为今日服务器验收 |

## 尚未进入确定性陈述的事项

- 案例完整来源版本、首次上线时间、所有页面的历史原貌。
- 线上文件与本地快照一致性、实际角色授权、所有菜单可用性。
- 数据同步实时性、工资与计提业务口径、吞吐或性能提升比例。
- 缺失源码引用是否能在现行操作路径触发。
- 官方或案例的运行截图、端到端演示、最终选题。

这些项目不是本轮已验证成果。后续需要哪一项取决于选题，不将其缺口替换成猜测。

## 制作署名

策划者为 WaterRun。实际参与取证、源码核对、脱敏及文档整理的是 Codex，基于 GPT-6；本次会话只确认到这一模型层级。没有配音、图像生成或其他模型参与记录。

开源视频源码仓库：[Water-Run/ft](https://github.com/Water-Run/ft)。本轮未发布视频，该链接作为制作仓库记录，未替代后续交付时的公开可访问性检查。

## 复核

本轮复核包括版本常量与官方固定提交、两份测绘输出、代表页面的模型和模板映射、缺失引用、文档数字与源输出的一致性，以及公开包脱敏检查。结果记于 [验证记录](lab/verification.json)。

已修正的口径：案例不是已经鉴定的官方 1.5；总文件数不等于业务功能数；近期模板仍有 jQuery；菜单链接不证明页面可以运行；五类查询存在六份路由实现。源码共同结构没有被写成完整继承关系。

文案、视听、实际网页运行和成片审查不适用于本轮预研产物，尚无影片时间点或通过结论。
