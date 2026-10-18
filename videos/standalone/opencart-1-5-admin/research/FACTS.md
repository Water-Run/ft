# 事实出处

**当前稿为 2026-10-19 的 R3，正在交 WaterRun 讨论确认。** 当前逐段 / 逐句依据见 [R3 交审包](SCRIPT-R3.md)；下方原“逐句依据”保留第 1 轮的句号，引用时写 R1，避免混淆。2026-10-18 新增 CASE-A 的 A18 测绘；本轮 GPT-6 Astra 重读了官方固定提交的路由、分派、用户与订单模型代码，补充边界如下，未冒充重新运行旧实验。

## R2 送审前核对（2026-10-19）

- 重读固定提交的 [Action](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/system/engine/action.php)、[Front](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/system/engine/front.php)、[User](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/system/library/user.php) 和[订单模型](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/admin/model/sale/order.php)。确认路由选择、预动作、会话用户查询、权限清单、分页与两次主写入的代码关系。
- R2 先走完“请求 → 登录与会话 → 权限 → 数据库与查询 → 模板 → 页面”，再讲修改状态。按 WaterRun 2026-10-19 的补充，登录、会话、权限管理、数据库各有独立章节；配置、缓存、语言与浏览器交互在对应链路解释。旧兼容算法史、目录规模清单留在本台账。
- 49 个文件是该条请求涉及的已载入程序 / 模板路径数，不等同于 49 次物理磁盘 I/O；16 条为数据库语句，包含 SET，不写成 16 次业务表查询。36,751 字节为原轮那一次演示的页面正文，不能当所有页面固定大小。
- 修改订单中的 UPDATE 与 INSERT 是两次主写入，不是整个 HTTP 请求总共只有两条 SQL。模型随后还可能读取订单及按条件处理通知；演示和受托任务不得调用真实外部收件人或业务服务。
- 会话销毁不等同于浏览器 Cookie 必然同时删除；控制器中的权限检查也不等同于所有安全风险已验收。图解按具体代码职责绘制，不额外推导未经核查的安全保证。
- CASE-A 只说明本地源码中的结构与模块，不公开其真实名称、自定义业务路径、配置、原始哈希、记录与截图；不据相似框架证明它直接从官方 1.5 分叉，也不宣称所有线上功能可用。正文不再带私有部署版本或发布方式。
- 旧工作稿已保存到 research/versions/script-before-r2.js，SHA-256 为 feb9a1f2fee7000b0b3cee75e609618e2760313a37ae7841f3026ad4354aa0f1；它是重写前工作树版本，不冒称下方第 1 轮 d0853a40 稿本原件。
- 本轮模型 credit 按 WaterRun 明确说明记为 **GPT-6 Astra**：深入测绘、脱敏输出、R2 文案、送审与 Opus 交接准备。Opus 是后续拟接续方，尚未发生的新制作贡献不提前登记；既有 Claude Opus 5.5 的实验与第 1 稿贡献保留。

### S19：子系统复核

以下均在 2026-10-19 重读官方固定提交，属于源码核对；未把 2026-10-11 的运行记录冒称本轮重跑。链接固定到同一提交；方法名和字段名用于复查，画面使用中文职责标签。

| 编号 | 可用陈述 | 一手依据与边界 |
|---|---|---|
| S19-01 | 入口从 config.php 取连接常量，建立数据库对象；setting 表里的键值写入 Config。连接信息和业务设置不是同一份内容 | [admin/index.php](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/admin/index.php) 的 Configuration、Database、Settings；不公开配置值 |
| S19-02 | 同一入口建立会话、缓存、语言、货币和计量对象，通过 Registry 供业务代码取用 | 同上 Session、Language、Currency、Weight、Length；是职责图，不声称每个请求都用到每个服务 |
| S19-03 | User 按会话 user_id 读取启用的用户，再按 user_group_id 读取组的权限；失效用户走 logout。登录比较包含加盐 SHA1 与旧 MD5 分支 | [system/library/user.php](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/system/library/user.php)，构造、login、logout；中文正文简化摘要计算，画面注明历史实现，不当作今天的选型建议 |
| S19-04 | 受保护路由有登录 / token 检查和 access 检查；比较的权限路由只取前两段；存在登录、错误页等豁免项 | [common/home.php](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/admin/controller/common/home.php)，login、permission；不能说所有 URL 无例外都检查 token |
| S19-05 | 订单 history 的 POST 分支先检查 modify；有权限才调用 addOrderHistory。即使用户已通过 access，也不因此自动获得写权限 | [sale/order.php](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/admin/controller/sale/order.php)，history；所述为这条具体写入路径，不对所有控制器作安全承诺 |
| S19-06 | 用户组编辑器列举两层目录下的控制器，排除固定项目后供 access / modify 选择；保存时把权限数组序列化到用户组字段 | [user_permission.php](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/admin/controller/user/user_permission.php)，getForm、validateForm；[user_group.php](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/admin/model/user/user_group.php)，addUserGroup、editUserGroup。发现新控制器不等于自动授予权限 |
| S19-07 | order 保存订单当前资料，order_product 保存订单商品项，order_history 保存状态记录；后三者用 order_id 建立业务关联。order 的主键为 order_id，另两表有各自的主键 | [安装表结构](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/install/opencart.sql)，oc_order、oc_order_product、oc_order_history 的 CREATE TABLE；这些表为 MyISAM，定义中没有外键约束。示意连线只能标“按订单编号关联” |
| S19-08 | 数据库包装层按配置装载驱动，转交 query / escape。mysql 驱动发出 SQL，把结果组织成 row、rows、num_rows；失败时触发错误并退出 | [DB 包装层](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/system/library/db.php)、[mysql 驱动](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/system/database/mysql.php)。模型组织业务查询，驱动负责连接和结果封装；不称 ORM |
| S19-09 | 订单列表模型按筛选条件、可选排序字段、起点和条数组装查询；总数另查；驱动返回的数据再交给控制器 | [订单模型](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/admin/model/sale/order.php)，getOrders、getTotalOrders；46 条、每页 20 条、第二页 LIMIT 20,20 沿用 L12–L14，不能当默认安装数据 |
| S19-10 | 无分页参数的订单状态字典查询先读按语言区分的缓存；未命中才查表并写缓存；修改状态名称等操作删除该类缓存 | [order_status.php](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/admin/model/localisation/order_status.php)，getOrderStatuses 及增删改方法。缓存的是状态名称清单，不是整张订单列表；文件缓存实现与命中对照见 R1 g16–g19 |
| S19-11 | history 返回由模板渲染的 HTML 片段，自动补全返回 JSON，整页导航返回完整 HTML | history 的 template / setOutput 与 R1 h2–h3、i13–i15；三种响应按具体调用分开画，不把所有 AJAX 都画成 JSON |
| S19-12 | 修改状态至少包括 UPDATE 订单与 INSERT 历史两次主写入；后续还可能读取订单并按条件处理通知等工作 | [订单模型](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/admin/model/sale/order.php)，addOrderHistory；事务失败对照沿用 L16，真实外发服务不属于本片演示 |

用户要求“详细介绍各个子系统”的范围、演示路径和验收问题见 [子系统覆盖表](SUBSYSTEMS.md)。表内合成的账号、订单商品项和状态历史只解释结构，不伪装成旧实验输出。

### C19：时代背景与新版对照

2026-10-19，WaterRun 反馈 R2 开场突兀，要求先介绍 OpenCart、年代、当时的位置、全片路线，并联系新系统。本节只加入能核对的背景，不用今天的网站数量倒推 2014 年市场份额。

| 编号 | 可以进入正文的内容 | 一手依据与范围 |
|---|---|---|
| C19-01 | 今天开独立网店可使用托管服务，也可自行部署开源商城；两种模式是责任分工的比较，不是新旧时代的绝对分界 | [Shopify 官方概览](https://help.shopify.com/en/manual/intro-to-shopify/overview)、[托管说明](https://www.shopify.com/website/hosting)；[OpenCart 官方功能介绍](https://www.opencart.com/index.php?route=cms/feature)。只介绍模式，不采用当前商户数、售价或宣传性优劣判断 |
| C19-02 | OpenCart 是 PHP 开源网店程序，提供面向顾客的商店和商家管理后台；官方旧安装方式包括上传文件、准备 MySQL 数据库、运行安装页 | 固定旧提交的 [install.txt](https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/install.txt)、前后台目录及 R1；同年代 [Softaculous 2014-04-25 分发记录](https://www.softaculous.com/news/scripts/updated-opencart-package-to-1-5-6-4-3390.html) 将它列作供商家使用的开源购物车。免费指程序许可，不意味着主机和扩展没有成本 |
| C19-03 | 1.5 系列属于 2011–2014 这段历史；本片的 1.5.6.4 固定快照提交于 2014-04-24 17:50:37 UTC，正文只说“2014 年 4 月的版本” | R1 G1 / G4；本轮 GitHub API 重核固定提交；[提交页面](https://github.com/opencart/opencart/commit/31323f8ce70338e88570217f76e1111f7b2bcc8f)。提交日、不同网站标注的发布日及安装包更新日不是同一口径，不把 4 月 25 日分发记录当官方首发日 |
| C19-04 | 当时它属于可自行部署的开源商城产品，已进入安装工具分发渠道，并有面向商家的主题与扩展生态 | 上述 Softaculous 同期记录；官方市场 [Admin Order Edit](https://www.opencart.com/index.php?route=marketplace/extension/info&extension_id=16437) 创建于 2014-03-22，保留 2014 年变更记录；[主题条目](https://www.opencart.com/index.php?route=marketplace/extension/info&extension_id=15325) 创建于 2014-01-04。只证明发行与生态存在，不据少数条目称全球第一、市场份额或扩展总数 |
| C19-05 | 新版对照固定为 OpenCart 4.1.0.4，提交 3b0597ec91cae3de040a63fee3834a6d910372ea。项目要求 PHP >=8.1，存在 MySQLi 驱动和 Twig 模板实现 | [composer.json](https://github.com/opencart/opencart/blob/3b0597ec91cae3de040a63fee3834a6d910372ea/composer.json)、[mysqli.php](https://github.com/opencart/opencart/blob/3b0597ec91cae3de040a63fee3834a6d910372ea/upload/system/library/db/mysqli.php)、[twig.php](https://github.com/opencart/opencart/blob/3b0597ec91cae3de040a63fee3834a6d910372ea/upload/system/library/template/twig.php)。本轮取回并核对源码，未运行新版；不把一个项目推成全部现代后台 |
| C19-06 | 新版仍有控制器、模型、视图的装载职责；具体运行环境、驱动和模板实现已变化 | 同一新提交的 [loader.php](https://github.com/opencart/opencart/blob/3b0597ec91cae3de040a63fee3834a6d910372ea/upload/system/engine/loader.php)，controller、model、view；对比 R1 / S19。用来回答旧结构与今天有什么关系，不得声称现代系统均前后端分离、均有事务或均更安全 |

本轮公开原始文件的校验值与来源 URL 保存在 lab/out_20_context_sources.json；下载缓存 research/_src 不入库。未取得同口径、同日期的一手市场份额统计，正文以产品定位、分发渠道与生态说明其位置，不制造排名。

取证日期：2026-10-11（UTC+8）。对象：官方 OpenCart 1.5.6.4（固定提交 `31323f8ce70338e88570217f76e1111f7b2bcc8f`），运行在 Ubuntu 12.04.5 自带的 Apache 2.2.22、PHP 5.3.10、MySQL 5.5.62 上；另以匿名案例 CASE-A 的源码统计作第 10 章的材料。2026-10-09 的选题前预研保留在 [PRESTUDY-FACTS.md](PRESTUDY-FACTS.md)、[SURVEY.md](SURVEY.md)、[PAGE-MAP.md](PAGE-MAP.md)，脱敏规则见 [REDACTION.md](REDACTION.md)。

出处优先级按仓库 `docs/research.md`：实验 > 源码 > 官方文档 > 其他。本片的机制陈述以实验回显为主、源码为辅；版本日期取自 GitHub 提交记录与 php.net；概念定义取自 RFC、OWASP 与 php.net 手册。

## 取证环境

| 编号 | 环境 | 内容 | 位置 |
|---|---|---|---|
| L10 | 实验主机镜像 | `ubuntu:12.04`（摘要 `sha256:18305429afa14ea462f810146ba44d4363ae76e4c8dfc38288cf73aa07485005`）加归档源里的 `apache2 2.2.22-1ubuntu1.15`、`libapache2-mod-php5 5.3.10-1ubuntu3.48`、`php5-mysql`、`php5-gd`、`php5-mcrypt`、`mysql-server-5.5 5.5.62-0ubuntu0.12.04.1`；会话设置 `session.save_handler = files`、`session.save_path = /var/lib/php5`、`session.name = PHPSESSID` | `lab/env/Dockerfile`、`lab/10_build.sh` → `lab/out_10_build.txt` |
| L11 | 安装 | OpenCart 1.5.6.4 的 `upload/` 拷入 `/var/www/shop`，用自带的 `install/cli_install.php` 安装：驱动 `mysql`、表前缀 `oc_`、主机名 `shop.example`（容器内解析到自己）；安装后删除 `install/`。数据库口令每次随机生成、不打印；回显里 `DB_PASSWORD` 已遮蔽 | `lab/11_install.sh` → `lab/out_11_install.txt` |
| L11p | 实验探针 | `auto_prepend_file` 载入 `lab/env/probe.php`，每个请求结束时记录载入的文件、PHP 执行耗时、内存峰值与输出字节。不改 OpenCart 源码；探针文件自身不计入。MySQL 打开 general log 记录每条语句 | 同上 |
| L12 | 演示数据 | 固定种子生成 46 张订单（2013-03）、12 位顾客 `Demo Customer 01–12`；商品与厂商改为无品牌名、商品图改为占位图；关闭仪表盘的自动汇率更新（它会在渲染时向外部服务请求）；新建用户组 Clerk 与账号 clerk | `lab/12_seed.php` → `lab/out_12_seed.txt` |
| L13 | 会话取证 | 容器内用 curl 走完：打开后台、错误口令、登录、首页、订单列表第 1、2 页、筛选、订单详情、改状态（AJAX）、顾客自动补全（AJAX）、缺令牌、只有令牌没有 Cookie、店员登录与越权、退出。每一步记下状态、响应头、字节数、探针记录与新增 SQL | `lab/13_trace.py` → `lab/out_13_trace.json` |
| L14 | 磁盘取证 | 数据目录文件、表状态、设置表、文件缓存、缩略图缓存、源码规模、前端资源大小、访问日志、默认引擎 | `lab/14_storage.sh` → `lab/out_14_storage.txt` |
| L15 | 浏览器 | 宿主上的 Chrome 155 无头模式，1280×800、2 倍像素，打开容器里的后台截图，并记录每页的全部请求。Arial 由 Liberation Sans 代替渲染（字宽相同、字形不同） | `lab/15_screens.mjs` → `lab/out_15_screens/` |
| L17 | 用户组权限 | 各组 access / modify 清单的路由数与字段长度 | `lab/17_permission.sh` → `lab/out_17_permission.txt` |
| L16 | 事务实验 | 同一台 MySQL 上对 MyISAM 表与 InnoDB 副本分别执行「开启事务—改一行—回滚」 | `lab/16_transaction.sh` → `lab/out_16_transaction.txt` |

复现：`OC_SRC=<OpenCart 1.5.6.4 的 upload 目录> sh research/lab/run_all.sh`（需要 docker、python3、node 与 puppeteer-core）。源码包取自 `https://codeload.github.com/opencart/opencart/tar.gz/31323f8ce70338e88570217f76e1111f7b2bcc8f`，SHA-256 为 `abc71b891d0c8e10b7fd9b379a31616e2d9d1c7298c1b6991d6de1bec6c794b2`，不入库。

会话编号、令牌每次运行都不同。原始实验记录仅留本机，本页不公开具体口令、令牌、会话编号及其密码哈希；展示使用明确标为示意的占位值。截图来自同一官方演示容器的稍后会话，客户姓名、订单与金额均为独立合成数据，与 CASE-A 无关。L10–L17 的原始捕获及执行脚本尚未完成本轮公开审核，在本片 .gitignore 中保留为本机材料；公开事实沿用相应日期的已记录测量，本轮没有重跑这些实验。

## 来源目录

| 编号 | 来源 | 位置与核查 |
|---|---|---|
| O | OpenCart 1.5.6.4 源码，提交 `31323f8` | `https://github.com/opencart/opencart/blob/31323f8ce70338e88570217f76e1111f7b2bcc8f/upload/<路径>`；下文写 `O:<路径>:<行>` |
| G1 | 提交 `60827089ecea70dc599f830e0f4f87cabc0113d3`，2011-04-27，「First 1.5.0 version pushed to trunk」 | GitHub API，2026-10-11 读取 |
| G2 | 提交 `98a533e867`（2012-06-22）的 `system/library/user.php`：登录只比较 `md5($password)` | raw.githubusercontent.com，2026-10-11 读取 |
| G3 | 提交 `86b36604cb9ae2447a661f3fee3f388113fe0c9f`，2012-08-10，「updated the password system to use salt and sha1 hashing」 | GitHub API，2026-10-11 读取 |
| G4 | 标签 1.5.6.4 → 提交 `31323f8`，2014-04-24；标签 2.0.0.0 → 提交 `7911c76`，2014-10-01；仓库标签里 1.5 系列的最后一个是 1.5.6.4 | GitHub API `git/ref/tags`、`tags`，2026-10-11 读取 |
| W1 | php.net：PHP 5.3.0 发布于 2009-06-30；5.3 支持终止于 2014-08-14 | [releases](https://www.php.net/releases/index.php)、[eol](https://www.php.net/eol.php)，2026-10-11 读取 |
| W2 | php.net 手册：`mysql` 扩展「deprecated in PHP 5.5.0, and it was removed in PHP 7.0.0」 | [mysql_query](https://www.php.net/manual/en/function.mysql-query.php)，2026-10-11 读取 |
| W3 | php.net 手册：`mysql_real_escape_string` 在 `\x00 \n \r \ ' " \x1a` 前加反斜杠 | [mysql_real_escape_string](https://www.php.net/manual/en/function.mysql-real-escape-string.php)，2026-10-11 读取 |
| W4 | php.net 手册：`extract` 把数组导入为当前作用域的变量 | [extract](https://www.php.net/manual/en/function.extract.php)，2026-10-11 读取 |
| W5 | RFC 9110：HTTP 是无状态协议（摘要与 §3.3 附近原文 "HTTP is defined as a stateless protocol"） | [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110)，2026-10-11 读取 |
| W6 | RFC 6265 §1：服务器用 Set-Cookie 交给用户代理名值对，之后的请求在 Cookie 头里送回 | [RFC 6265](https://www.rfc-editor.org/rfc/rfc6265)，2026-10-11 读取 |
| W7 | OWASP CSRF Prevention Cheat Sheet：同步令牌模式；「A CSRF token must not be leaked in the server logs or in the URL」，GET 会把令牌留在浏览器历史、日志与 Referer | [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)，2026-10-11 读取 |
| W8 | OWASP：SQL 注入是经客户端输入把 SQL 插入查询 | [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)，2026-10-11 读取 |
| W9 | LAMP：Linux、Apache、MySQL、PHP（P 也可为 Perl、Python）的首字母缩写 | [Wikipedia: LAMP (software bundle)](https://en.wikipedia.org/wiki/LAMP_(software_bundle))，其引用的 TechTarget 定义「LAMP (Linux, Apache, MySQL, PHP)」；2026-10-11 读取 |
| W10 | jquery.com：「HTML document traversal and manipulation, event handling, animation, and Ajax」 | [jquery.com](https://jquery.com/)，2026-10-11 读取 |
| S1 | CASE-A 2026-10-09 历史静态统计，2026-10-19 已收紧为匿名编号和计数 | [out_01_case_inventory.json](lab/out_01_case_inventory.json)；公开框架入口 / 权限机制参见 PRESTUDY V03、V04 与本轮 A18。旧自定义路径、原始文件指纹和项目历史定位不随当前包公开 |
| S3 | CASE-A 交接文档（私有，2026-09 记录）：生产环境 PHP 5.2.11 与 5.6.40，手工上传发布 | 不公开原文；属历史文档记载，未重新登录生产核验，旁白以「交接文档记载」限定 |

## 逐句依据

状态：「实测」= 本次实验回显；「源码」= 固定提交的源码；「文档」= 官方文档或规范；「推断」= 由源码与实验直接推出、旁白已按推断措辞。全部条目核查日期 2026-10-11。

### open

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| o1 | 2010 年代初的一种网店后台：OpenCart 1.5 | G1、G4：1.5 系列 2011-04 至 2014-04；画面为 L15 实际截图 | 文档 |
| o2 | 1.5 系列从 2011 年更新到 2014 年 | G1（2011-04-27 推入 1.5.0）、G4（1.5.6.4，2014-04-24；2.0.0.0，2014-10-01） | 文档 |
| o3 | 点开订单，一张表出现 | L15 `04_order_list.png`；L13 `order_list` 状态 200 | 实测 |
| o4 | 服务器读入 49 个文件 | L13 `order_list.probe[0].file_count = 49`（46 个 `.php` 与 3 个 `.tpl`，不含探针） | 实测 |
| o5 | 发出 16 条 SQL 语句 | L13 `order_list.sql` 中 `Query` 16 条（含 4 条 `SET`） | 实测 |
| o6 | 36,751 字节的网页 | L13 `order_list.bytes = 36751`，探针 `out_bytes` 相同 | 实测 |
| o9 | Ubuntu 12.04 自带版本 | L10 | 实测 |
| o10 | OpenCart 1.5.6.4，数据全部是演示数据 | L11、L12 | 实测 |

### host（01 一台主机）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| a1–a6 | Linux、Apache（网页服务器）、PHP、MySQL 四部分；Apache 把 .php 交给 PHP 执行 | L10 包清单（`libapache2-mod-php5` 是 Apache 的 PHP 模块）；Apache 日志「Apache/2.2.22 (Ubuntu) PHP/5.3.10… configured」；L13 响应头 `X-Powered-By: PHP/5.3.10-1ubuntu3.48` | 实测 |
| a4 | 程序以源码的形式放在服务器上 | `O:install.txt`「Upload all the files and folders to your server」；L11 安装即拷入源码目录 | 文档 |
| a6 | 首字母合称 LAMP | W9 | 文档 |
| a7–a8 | admin 后台、catalog 前台、system 共用；目录里是 PHP 文件 | L14：admin 425 个 .php / 260 个 .tpl，catalog 344 / 130，system 45 / 0；`O:admin/index.php:17` 与 `O:index.php` 都载入 `DIR_SYSTEM` | 实测、源码 |
| a9 | 安装说明：上传全部文件，建一个数据库 | `O:install.txt` 第 1、4 步（"manual installation using FTP, cPanel…"） | 文档 |
| a10–a11 | config.php 写着数据库地址、账号、口令和目录位置 | L11 回显的 `admin/config.php`（口令已遮蔽） | 实测 |
| a12–a13 | 每个请求从头执行：重新连接数据库、重读设置，处理完断开 | L13 每一步的探针记录都从 `admin/index.php` 开始；general log 每个请求一个新的线程号，`Connect` 开头、`Quit` 结尾；每个请求都执行 `SELECT * FROM oc_setting WHERE store_id = '0'` | 实测 |
| a14 | 两个请求之间要记住的，只能存到程序以外 | 由 a12–a13 与第 04 章的会话文件推出 | 推断 |

### entry（02 一个入口）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| b1–b4 | 每一页都指向 index.php，用参数 route 区分；sale/order 是订单列表 | L13 全部后台地址；`O:admin/index.php:155–159` | 实测、源码 |
| b5–b7 | 按斜杠拆分，找 `controller/sale/order.php`，类名 `ControllerSaleOrder`，第三段为方法名，缺省 index | `O:system/engine/action.php:11–45`（按斜杠拆分第 11 行，拼类名第 27 行，缺省 `index` 第 44 行）；L13 `order_info` 载入同一控制器 | 源码、实测 |
| b8–b9 | 控制器、模型、模板各是一个文件 | L13 `order_list` 载入 `admin/controller/sale/order.php`、`admin/model/sale/order.php`、`admin/view/template/sale/order_list.tpl` | 实测 |
| b11 | 读出 131 条设置 | L14 `oc_setting` 中 `store_id = 0` 131 行；`O:admin/index.php:41–49` | 实测 |
| b12–b13 | 语言、货币、计量单位、当前用户；任何一页先执行这 12 条 | L13 已登录请求的前 12 条 `Query`：4 条 `SET`、setting、language、currency、weight_class、length_class、user、`UPDATE oc_user SET ip`、user_group | 实测 |
| b14–b15 | 两道检查：登录、权限 | `O:admin/index.php:148–152` 两个 `addPreAction`；`O:system/engine/front.php` 先执行预动作 | 源码 |

### login（03 登录）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| c1 | 没有登录，打开哪一页都换成登录页 | L13 `open_admin`、`foreign_token`：标题 Administration（登录页）；`O:admin/controller/common/home.php:321` 起的 `login()` 返回 `forward('common/login')` | 实测、源码 |
| c2–c3 | 表单发出账号口令，拼进一条 SQL 查用户表 | L13 `login` 的 POST 与 general log 对应；公开说明只保留账号条件、加盐 SHA1 / 旧 MD5 分支及 status 条件，口令和密码哈希省略；示意 SQL 不作为原始回显 | 原轮实测；公开记录已脱敏 |
| c4 | SQL 的定义 | 解释性表述，画面配 c3 的实际语句 | 定义 |
| c5 | 口令以原文出现在语句里 | 同 c3 的 general log；`O:system/library/user.php:37` | 实测 |
| c6–c7 | 存的是哈希值；哈希单向 | L11 `oc_user.password` 40 个字符；SHA1 的单向性为通行定义，旁白用「反推很难」 | 实测、定义 |
| c8–c10 | SHA1 加盐；盐为每个账号 9 个随机字符；口令相同存值不同 | L11 `CHAR_LENGTH(salt) = 9`；`O:install/model/install.php:39` 与 L12 均以 `substr(md5(uniqid(rand(), true)), 0, 9)` 生成盐 | 实测、源码 |
| c11 | 三次 SHA1，中间两次接上盐，由 MySQL 计算 | c3 的 SQL：`SHA1(CONCAT(salt, SHA1(CONCAT(salt, SHA1('…')))))` | 实测 |
| c12–c14 | 另一分支比较 MD5；2012 年 8 月以前只存 MD5；分支让旧账号能登录 | c3 的 SQL；G2（之前只比较 MD5）、G3（2012-08-10 改为加盐 SHA1）；「旧账号能登录」由条件中的 `OR` 推出 | 实测、文档、推断 |
| c15 | 找不到时提示账号或口令不符 | L13 `login_wrong`：「No match for Username and/or Password.」 | 实测 |

### session（04 会话）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| d1 | HTTP 不记得上一次请求 | W5 | 文档 |
| d2–d5 | 会话给每个访问者随机编号，放进 Cookie；之后的请求自动带上 | L13 `open_admin` 响应头 `Set-Cookie: PHPSESSID=…`（26 个字符）；W6 | 实测、文档 |
| d6–d8 | 磁盘上一个文件，登录后 81 字节，记着货币、用户编号、令牌 | L13 `session_after_login`：原轮实验量得 81 字节；公开记录仅列字段与 32 字符令牌长度，不保留会话编号或令牌值。重建画面使用占位并标“示意” | 原轮实测；公开记录已脱敏 |
| d9–d10 | 序列化格式：名字、类型、长度、值 | 同上内容的结构 | 实测 |
| d11–d12 | 之后的请求按编号读回用户编号，再查用户表确认有效 | `O:system/library/session.php`、`O:system/library/user.php:12–13`；L13 `order_list` 的 `SELECT * FROM oc_user WHERE user_id = '1' AND status = '1'` | 源码、实测 |
| d13 | 退出时文件被删除 | L13 `session_after_logout.exists = false`；`O:system/library/user.php:61–67` `logout()` 调用 `session_destroy()` | 实测 |

### token（05 令牌）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| e1–e3 | 登录时生成 32 个字符的令牌，存进会话，接在跳转地址末尾，之后每个链接都带着 | `O:admin/controller/common/login.php:15` `md5(mt_rand())`；L13 `login` 响应 `Location: …route=common/home&token=TOKEN_PLACEHOLDER`；会话内容含同一令牌；L13 `order_list` 页面链接带 token | 源码、实测 |
| e4 | 比对地址与会话里的令牌 | `O:admin/controller/common/home.php` 的 `login()`；本轮 S19-04 重核令牌比较及豁免范围 | 源码 |
| e5 | Cookie 正确、缺令牌，照样换成登录页 | L13 `no_token`：「Invalid token session. Please login again.」 | 实测 |
| e6–e9 | Cookie 由浏览器自动附上；跨站请求伪造；对方不知道令牌 | W6；W7 同步令牌模式 | 文档 |
| e10 | 没有令牌过不了第一道检查 | e4、e5 | 源码、实测 |
| e11–e12 | 令牌写在地址里，浏览器历史和访问日志会记下 | L14 Apache 访问日志中 12 行带 `token=`；W7 | 实测、文档 |
| e13 | 今天的安全建议不再把令牌放进网址 | W7（2026-10-11 读取的版本） | 文档 |

### perm（06 权限）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| f2–f4 | 权限记在用户组上，两张路由清单 access、modify，序列化后存在一个字段 | L12 Clerk 组 `permission` 原文；`O:system/library/user.php:21–29` | 实测、源码 |
| f5 | 管理员组两张清单各 146 个路由 | `lab/17_permission.sh` → `lab/out_17_permission.txt`：`Top Administrator` 的 access 146、modify 146，字段 8,982 字节 | 实测 |
| f6 | 店员组：查看订单和顾客，只能改订单 | L12 `a:2:{s:6:"access";a:2:{…"sale/order"…"sale/customer"…}s:6:"modify";a:1:{…"sale/order";}}` | 实测 |
| f7–f8 | 店员打开 user/user，被换成没有权限的页面 | L13 `clerk_users`：标题「Permission Denied!」；L15 `11_permission_denied.png` | 实测 |
| f9 | 修改权限在控制器写入之前检查 | `O:admin/controller/sale/order.php` 的 `history()` POST 分支，`hasPermission('modify', 'sale/order')`；本轮 S19-05 已重新定位 | 源码 |
| f10 | 两道检查通过才交给订单控制器 | `O:system/engine/front.php:18–30` | 源码 |


### read（07 取数据）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| g2–g3 | 每页 20 条；第 2 页起点 20 | L14 `config_admin_limit = 20`；`O:admin/controller/sale/order.php:308` `($page - 1) * config_admin_limit` | 实测、源码 |
| g4–g7 | 模型拼接 SQL，最后接排序和 LIMIT 20,20 | `O:admin/model/sale/order.php:495–560`；L13 `order_list_p2` 的语句 `… ORDER BY o.order_id DESC LIMIT 20,20` | 源码、实测 |
| g8 | 另一条只数总数：46，3 页 | L13 `SELECT COUNT(*) AS total FROM oc_order WHERE order_status_id > '0'`；L12 46 张；L15 页面分页 | 实测 |
| g9–g10 | 筛选文字拼进语句，之前先转义 | L13 `order_filter`：`LIKE '%Customer 07%'`；`O:admin/model/sale/order.php:509` `$this->db->escape()`；W3 | 实测、源码、文档 |
| g11–g12 | 漏掉转义可能改写语句：SQL 注入 | W8 | 文档 |
| g13 | 数字先转整数 | `O:admin/model/sale/order.php:499,505,554` 的 `(int)` | 源码 |
| g14 | mysql_query 发出，结果逐行变成数组 | `O:system/database/mysql.php:20–45` | 源码 |
| g15 | PHP 5.5 标为废弃，PHP 7 删除 | W2 | 文档 |
| g16–g19 | 第二次打开少一条查订单状态的语句；结果写成 cache 文件；文件名末尾是写入时刻加 3600 秒 | L13：`order_list` 有 `SELECT order_status_id, name FROM oc_order_status …`，`order_list_p2` 没有；L14 `cache.order_status.1.1791694520`；`O:system/library/cache.php:3,30` `$expire = 3600`、`time() + $this->expire` | 实测、源码 |

### write（08 写数据）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| h1 | 把 7 号订单改为「已发货」 | L13 `history_add`：POST `order_status_id=3`（Shipped） | 实测 |
| h2–h3 | 由页面脚本发出、不刷新整页：AJAX | `O:admin/view/template/sale/order_info.tpl:940–960` `$.ajax({ url: '…route=sale/order/history…', type: 'post' })`；L13 返回 785 字节的片段 | 源码、实测 |
| h4–h5 | 两条写入：UPDATE 订单表，INSERT 历史表 | L13 `history_add` 的 general log；`O:admin/model/sale/order.php:692–695` | 实测、源码 |
| h6 | 两条独立，中途出错前一条不撤回 | 源码里两条语句之间没有事务语句；L16 MyISAM 回滚无效 | 源码、实测（推断措辞） |
| h7 | 事务的定义 | 解释性表述，画面配 L16 的对照 | 定义 |
| h8 | 115 张表全部 MyISAM | L11 `MyISAM 115`；`O:install/opencart.sql` 115 处 `ENGINE=MyISAM` | 实测、源码 |
| h10 | 每张表三个文件 | L14 `.frm .MYD .MYI` 各 115 个；`oc_order` 为 19,668 / 12,192 / 2,048 字节 | 实测 |
| h11–h13 | MyISAM 不支持事务；回滚后改动仍在；警告 1196 | L16：`ENGINES` 表 MyISAM `TRANSACTIONS = NO`；`order_status_id` 1 → 7，ROLLBACK 后仍为 7；`Warning 1196 Some non-transactional changed tables couldn't be rolled back` | 实测 |
| h14–h15 | 同一台 MySQL 5.5 默认引擎是 InnoDB，回滚可以撤回 | L14 `@@default_storage_engine = InnoDB`；L16 InnoDB 副本 1 → 7，ROLLBACK 后为 1 | 实测 |

### page（09 出页面）

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| i2–i4 | 数据放进数组交给模板；模板是嵌着 PHP 输出语句的 HTML；每项变成同名变量 | `O:admin/controller/sale/order.php:475–483`；`O:system/engine/controller.php:72–93`（第 78 行 `extract($this->data)`）；W4 | 源码、文档 |
| i5 | 页头页尾是另外两个控制器，渲染后嵌入 | `$this->children = array('common/header', 'common/footer')`；L13 载入 `common/header.php`、`header.tpl`、`common/footer.php`、`footer.tpl` | 源码、实测 |
| i6 | 合起来 36,751 字节 | o6 | 实测 |
| i7 | 浏览器又下载 19 个文件 | L15 `requests.json` 中 `04_order_list` 共 20 个响应，除文档本身外 19 个 | 实测 |
| i8 | jQuery 与 jQuery UI 约 300 KB | L14：`jquery-1.7.1.min.js` 93,868 字节、`jquery-ui-1.8.16.custom.min.js` 210,463 字节，合计 304,331 | 实测 |
| i9 | jQuery 的用途 | W10 | 文档 |
| i10–i11 | 蓝色渐变是 5 像素宽的图片横向铺满；菜单也是细长图片 | `O:admin/view/stylesheet/stylesheet.css` `#header .div1 { background: url('../image/header.png') repeat-x }`、`#menu { background: url('../image/menu.png') repeat-x }`；图片尺寸 header.png 5×56、menu.png 19×34、selected.png 19×34 | 源码 |
| i12 | 12 像素 Arial；悬停底色淡黄 | 同一样式表 `font-family: Arial…; font-size: 12px`、`.list tbody tr:hover td { background-color: #FFFFCB }` | 源码 |
| i13–i15 | 筛选框打字时向服务器要顾客名单，返回 JSON | `O:admin/view/template/sale/order_list.tpl:190` `route=sale/customer/autocomplete`；L13 `autocomplete` 返回 1,972 字节的 JSON 数组 | 源码、实测 |

### case（10 一个真实的后台）

案例的真实名称、单位、人员、地址与业务数据一律不公开，见 [REDACTION.md](REDACTION.md)。画面只出现代号 CASE-A / 案例 A、通用业务名、计数与结构。

| 句号 | 陈述 | 依据 | 状态 |
|---|---|---|---|
| j2 | 仍在使用的仓储后台 | S3（2026-09 交接文档描述现行生产环境）；S1 业务菜单；Git 记录到 2026-10 仍有提交 | 文档（私有，历史记载） |
| j3 | 入口版本号 1.4.9.3 | S1 `declared_version`；PRESTUDY V01 | 源码 |
| j4 | 入口、路由、控制器、模板是同一套 | PRESTUDY V03、V04；2026-10-11 核对 `admin/index.php` 的两个 `addPreAction` | 源码 |
| j5 | 采购、入库、库位、称重、绩效 | S1 `menu_label_lines`（采购计划、入库记录、库位管理、称重记录、绩效工资） | 源码 |
| j6 | 加功能通常沿控制器、模型和模板扩展 | 历史匿名 R 样本的引用数量；本轮 A18-02、A18-04；不把它当所有改造的唯一形式 | 源码 |
| j7 | 新控制器放进目录就出现在权限清单里 | `O:admin/controller/user/user_permission.php:349` 用 `glob` 列出控制器；CASE-A 同一文件同一写法（S1 补充） | 源码 |
| j8 | 继承控制器的类五百多个 | S1 `declared_controller_classes = 529`（词法匹配，含旧副本）；画面注明「含副本」 | 源码 |
| j9 | 后续查询页仍可沿路由进入控制器 | 历史静态观察；新稿采用 A18-04、A18-05 的匿名结构，不公开原始业务文件名和提交定位 | 源码 |
| j10 | 交接文档：生产 PHP 5.2 与 5.6，手工上传发布 | S3 | 文档（私有，历史记载） |

### end（11 回到那一下点击）

k2–k6 复述前文，依据同各章。k5 的「20 行」为 L13 `order_list` 第 1 页的 `LIMIT 0,20`。k7「约 11 毫秒」为 L13 `order_list.probe[0].ms = 10.68`，是探针从入口到请求结束的 PHP 执行时间，仅代表这台演示主机。

## 术语与首次解释

交审时附此表（feedback P9）。每个术语第一次出现的句子与解释它的句子：

| 术语 | 首次出现 | 解释句 |
|---|---|---|
| Apache、网页服务器 | a2 | a2「接收请求，送回网页」 |
| PHP | a3 | a4「脚本语言，程序以源码的形式放在服务器上」 |
| MySQL、数据库 | a5 | a5「程序要数据，再去问 MySQL 数据库」 |
| LAMP | a6 | a6「四者的首字母合起来」 |
| route、路由 | b2 | b3「决定这一次请求交给哪一段代码」 |
| 控制器、模型、模板 | b8、b9 | b8、b9 |
| SQL | o5 | c4（o5 只作数量出现，画面同时出现语句原文） |
| 哈希、SHA1、MD5 | c6、c8、c12 | c7；SHA1、MD5 是两种哈希算法的名字，画面标注 |
| 盐 | c8 | c9–c10 |
| HTTP | d1 | d1「浏览器与服务器之间的协议」 |
| 会话 | d2 | d2 |
| Cookie | d3 | d4–d5 |
| 序列化 | d9 | d10 |
| 令牌 | d8 | e1–e4（d8 先作为会话里的一项出现，e1 正式说明） |
| 跨站请求伪造 | e8 | e7–e8 |
| 用户组、access、modify | f2、f3 | f2–f3 |
| LIMIT | g6 | g7 |
| 转义 | g10 | g10 |
| SQL 注入 | g12 | g11 |
| AJAX | h3 | h2–h3 |
| 事务 | h7 | h7 |
| MyISAM、存储引擎 | h8 | h9–h10 |
| InnoDB | h14 | h15（只作对照，不展开） |
| 模板、渲染 | i2、i4 | i3–i4 |
| jQuery | i8 | i9 |
| JSON | i14 | i14 |

## 未进入成片的事实

- 仪表盘默认会在渲染时用 curl 请求 `download.finance.yahoo.com` 更新汇率（`O:admin/model/localisation/currency.php:104–128`）；第一次运行时首页因此耗时约 4.6 秒。实验关闭了这一项，该服务的现状未核查。
- 商品列表第一次打开时，`image/cache/no_image-40x40.jpg`（976 字节）按需生成（L14）。
- 订单详情页执行 32 条语句；首页 23 条（L13）。
- 管理员组权限字段 8,982 字节；店员组的序列化原文见 L12。
- 数据库连接 `SET SQL_MODE = ''`（`O:system/database/mysql.php:17`），关闭了严格模式。
- 后台菜单下拉由 superfish 插件实现，无头浏览器未能截到展开状态（L15 说明）。
- PHP 5.3.0 发布于 2009-06-30、5.3 系列 2014-08-14 停止支持（W1）。

## 文案审查

| 轮次 | 交审日期 | 稿本 | 审查意见与修改 | 结论与日期 |
|---|---|---|---|---|
| 2–3 | 2026-10-19 | R2 及当前 [R3](SCRIPT-R3.md)，哈希见各稿和 review/approval.json | R2 补各子系统；WaterRun 反馈后 R3 补现代到旧版的引入、年代、生态位置、路线与新版对照；片尾说明移出正文 | 尚未确认；WaterRun 先阅读，未开始配音 / 场景 |
| 1 | 2026-10-11 | `src/js/script.js`（交审时的 SHA-256 记于 [SCRIPT-REVIEW.md](SCRIPT-REVIEW.md)） | 待审 | 未确认；确认前不配音、不写场景 |

## 制作署名

策划：WaterRun（依据：仓库制作规范）。

| 模型 | 分工 | 依据 |
|---|---|---|
| Codex，基于 GPT-6（会话未提供更细版本） | 2026-10-09 选题前预研：CASE-A 与官方源码测绘、脱敏规则 | [PRESTUDY-FACTS.md](PRESTUDY-FACTS.md) 的制作署名 |
| Claude Opus 5.5 | 2026-10-11 起：实验环境、取证、脚本（中文稿） | 本次制作会话 |
| GPT-6 Astra | 2026-10-18–19：CASE-A 只读深入测绘、脱敏验证、A 方案记录、子系统与时代背景复核、R2 / R3 文案、Opus 交接、跨片反馈落实 | WaterRun 明确的模型 credit；A18、S19、C19、SCRIPT-R3.md、DEEP-MAP.md |

后续的翻译、视觉设计、场景、声音与审查完成后再补；语音为 Microsoft Edge 在线语音（zh-CN-YunyangNeural 等，按实际使用记录）。

开源视频：[GitHub · Water-Run/ft](https://github.com/Water-Run/ft)（依据：仓库制作规范；交付前核对公开仓库页面并记录日期与结果）。

## 复核

成片尚未制作，无复核记录。

## 2026-10-18 深入测绘与风格确认

| 编号 | 已确认的内容 | 依据 | 边界 |
|---|---|---|---|
| A18-01 | CASE-A 本地应用有 50,676 个跟踪路径，控制器目录 2,785 个 PHP 路径，其中 532 个文件命中 Controller 继承声明 | lab/out_18_case_deep_audit.json 的 counts；程序 18_case_deep_audit.cjs | 包含历史副本，不是在线页面数或业务规模 |
| A18-02 | 入口有共享对象初始化、登录 / 权限预动作和 dispatch；路由层有类名拼装、动态调用；页面层有模板数据展开和 require | 输出 core 的 S01–S05，附规则命中行号 | 静态确认，不代表每个线上分支均运行 |
| A18-03 | 会话、登录状态、权限和 token 检查在相应框架代码中存在 | 输出 core 的 S06–S08 | 不读取实际账号、权限表、会话或配置；不作安全验收结论 |
| A18-04 | 深查了 15 组业务控制器及可静态解析的模型 / 模板；覆盖订单、采购、财务、称重和人员查询 | 输出 samples 的 B01–B15 | 自定义文件只用匿名编号，未执行业务动作 |
| A18-05 | 后续查询样本中存在列存、关系数据库归档、导出 / 下载、帮助等代码信号 | 输出 domains 与 samples 的 evidence | 属于案例后续改造，不归于官方 1.5；未核服务连通、性能或数据一致性 |
| A18-06 | 存在本地无法解析到文件的字面模型 / 模板引用 | 输出中的 missing_* 计数 | 统计包括重复引用、历史副本和条件分支；不能称为线上故障数 |
| A18-07 | WaterRun 明确选定 A“后台即舞台” | 本轮指令与所附 d_a_f1 / d_a_f2 / d_a_f3 缩略图；STYLE-DECISION.md | 仅确认风格方向；中文稿仍未获批准，成片尚未制作 |
| A18-08 | 本轮公开测绘只含固定框架路径、匿名样本编号、行号、布尔信号与计数；没有复制私有源码、业务记录、业务路径、原始哈希或网络配置 | 程序输出字段白名单；18_case_deep_audit.test.cjs 的合成私密标记测试通过 | 自动检查不替代最终字幕、画面和投稿资料的再次脱敏 |

本轮实际参与模型已记于制作署名。事实可用于后续讨论，但正文应按 F01–F12 取舍：先走完一次请求，不把规模数字和接口清单堆进影片。公开版本没有运行私有应用或访问生产。
