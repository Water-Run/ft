# 事实出处

对象：Firebird 关系数据库及其前身 InterBase 的来历、Mozilla 改名事件、两种连接方式。取证日期 2026-11-08（制作方：Claude Opus 5.5）。旧版（已发布归档，提交 `e3f8a3e`）的材料只作线索，本表每条都重新读过原文或重做了实验。

优先级：亲手做实验 > 源码 > 官方文档 > 其他。第三方安装包放 `research/_src/`（不入库）。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| Firebird | 5.0.4.1812 Windows x64 官方 zip，25,206,603 字节，SHA-256 `01e844fce4d5f53272a76205dbc3a1ba4b782ab8e8eadcd808cdbccd9ce13b72` | GitHub Release [v5.0.4](https://github.com/FirebirdSQL/firebird/releases/tag/v5.0.4)，2026-04-17 发布 |
| 实验 | `lab/01_two_modes.py`，回显 `lab/out_01_two_modes.txt`；Windows 11，配置全缺省（只改端口 3051），口令现场生成未入库，路径已替换为 `<fb>` | 2026-11-08 |
| 排名 | `lab/02_dbengines.py`，回显 `lab/out_02_dbengines.txt` | 2026-11-08 取回，2026 年 11 月榜 |

## 对象与解释路径

InterBase 源于 Jim Starkey 的多版本想法（H01–H02），1984 年在自家客房创业（H03–H07），目标之一是「能放进应用程序里」（H09）。1991 年随收购到 Borland（H11），1999 年底 Borland 要裁员、停第六版（H12–H13），用户想集资买下（H14），2000 年 7 月 25 日谈判破裂同日开源（H15–H16）；社区 24 小时搭起源码树，7 月 31 日 Firebird 项目诞生（H17–H18）。半年后后门账号被发现（B01–B04）。2003 年 Mozilla 用了同一个名字，2004 年改名 Firefox（N01–N06）。今天它是完整的关系数据库，同一引擎、同一文件可走嵌入式也可走服务端（E01–E06）。

未弄清：Firebird 这个名字由谁提议（本片不讲）；广为流传的「M1 坦克」故事无可靠出处，不进成片（见末节）。

## 逐章

### 来历

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 状态（2026-11-08） |
|---|---|---|---|---|
| H00 | 这段工作的时间在八十年代初：官网称该数据库「since 1981」已用于生产；1984 年创业前 Starkey 已在 DEC 写 jrd | [About Firebird](https://firebirdsql.org/en/about-firebird/)；H04 | Wikipedia Jim Starkey 条目（1975 年进 DEC、1984 年创业，只印证前后时段） | 已核，旁白只说「八十年代初」 |
| H01 | Starkey 在 DEC 工作，设计过 Datatrieve；一天早上在淋浴时想到版本（shadow）可以防更新冲突、撤销失败事务，「多版本数据库」由此而来 | Ann Harrison 回忆，[How did Interbase appear?](https://cvalde.net/misc/how_appeared.htm)（站内转载）；官方[历史页](https://firebirdsql.org/en/historical-reference/)「Ann Harrison's Reminiscences」同文开头 | 官方页摘要与全文转载一致；当事人回忆 | 已核 |
| H02 | 版本让读不阻塞更新（repeatable read without blocking updates），回滚简单、崩溃恢复自动 | 同上段落 | — | 已核，属当事人陈述 |
| H03 | DEC 内部同时有 Rdb 与 jrd 两个项目，「database wars」，内耗激烈 | 同上 | — | 已核，当事人回忆 |
| H04 | 1984 年劳动节周末次日成立公司；Starkey 在 DEC 近十年 | 官方历史页「How Jim Starkey remembers it」 | Wikipedia Jim Starkey 条目（1984、Groton Database Systems） | 已核 |
| H05 | 创始人 Jim Starkey、Ann Harrison、Don DePalma；Starkey 搬进自家二楼客房开始写代码 | Ann Harrison 回忆 | 同上 | 已核 |
| H06 | 初始资金 243.50 美元：一把舒服的椅子、两个文件柜，柜上架一扇门当桌子 | 同上：「The initial capitalization was $243.50 for a comfortable chair and two filing cabinets to hold up the door that served as a desk.」 | — | 已核，当事人回忆 |
| H07 | 猫睡在电脑上，Apollo 的维修人员每周来吸尘 | 同上 | — | 已核，当事人回忆 |
| H08 | 备份恢复工具叫 Burp（backup and restore program），后来为显得正式改掉；今天源码仍有 `src/burp`、`src/alice` 目录 | 同上；[FirebirdSQL/firebird `src/`](https://github.com/FirebirdSQL/firebird/tree/master/src) 目录列表（2026-11-08 API） | 两路 | 已核 |
| H09 | 目标：不碍事的关系数据库，易安装、几乎不需管理、能在应用程序内工作 | 同上：「simple to install, required little or no administration, and would work inside applications」 | — | 已核，当事人回忆 |
| H10 | 公司起名 Groton Database Systems，因其它名字都过不了商标检索；有人接电话念成「Rrrrotten Database Systems」，促成改名 InterBase | 同上 | — | 已核，当事人回忆 |
| H11 | 1991 年 10 月 Borland 收购 Ashton-Tate，InterBase（当时第 3 版）随之归 Borland | 官方历史页「InterBase at Borland」 | [Release History](https://firebirdsql.org/file/documentation/papers_presentations/html/paper-fbent-history.html)「early 1990s through acquisition」 | 已核 |
| H12 | 1999 年圣诞前管理层告知 InterBase 部门：收入不足，要裁至少一半（39 人）。来源措辞为「informed personnel」所述 | 官方历史页转载 Paul Reeves（UK BUG 杂志 2000 年 11/12 月） | 官方页 1999-12-28 eWeek 条目（Inprise mulls future of InterBase division） | 已核，旁白不写具体人数 |
| H13 | 1999 年底第 6 版开发因 Borland 财务状况停止 | [Release History](https://firebirdsql.org/file/documentation/papers_presentations/html/paper-fbent-history.html) | H12 来源（作者推测拟取消 6.0） | 已核 |
| H14 | 产品经理 Bill Karwin 与负责美国以外销售的 Paul Beach 辞职；开发者组成 IBDI，愿出的钱「够买 InterBase 好几回」，但未能成交 | 官方历史页转载 Paul Reeves | — | 已核，单一转载，旁白按原文 |
| H15 | 2000 年 1 月 3 日宣布开源，2 月 14 日宣布新公司管理 InterBase | 官方历史页事件表 | Wikipedia（early 2000 宣布） | 已核 |
| H16 | 2000 年 7 月 25 日，同日两份新闻稿：终止出售谈判；InterBase 6.0 免费开源 | 官方历史页事件表（两条 July 25） | Wikipedia；官网 About（25 July 2000） | 已核 |
| H16b | 两份新闻稿的原题：「Inprise/Borland Terminates Negotiations to Sell InterBase® Product Line」「Inprise/Borland Introduces InterBase 6.0 Now Free and Open Source on Linux®, Windows, and Solaris®」 | 官方历史页事件表（两条 July 25，标题原文） | — | 已核，画面用原题 |
| H17 | 开源后 24 小时内有了源码树；社区不愿等公司，首个周末结束时在 SourceForge 建 Firebird 项目 | 官方历史页「Firebird records」 | Release History：两位澳大利亚开发者下载源码并在 SourceForge 建项目 | 已核 |
| H19 | 源码树里有 `jrd`、`burp`、`alice` 目录：GitHub 仓库现存最早的提交（2001-05-23「First steps towards a C++ conversion」）已包含；画面取这三个名字示意 | GitHub API `commits?path=src/burp` 等，2026-11-09 | H08 | 已核；2000 年 7 月当天的目录清单未单独取证，画面不写文件数 |
| H18 | 2000 年 7 月 31 日 Firebird 项目诞生（距开源 6 天） | 官方历史页事件表 | Wikipedia「Within a week」 | 已核 |

### 传闻（按策划者 2026-11-09 要求作为梗使用，旁白明说未证实）

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 状态 |
|---|---|---|---|---|
| L01 | 坦克故事：某版 InterBase 用在美军 M1 坦克上，开炮的电涌使车载系统崩溃，InterBase 重启后总能恢复工作。发帖人自称「a bit of folklore, now」 | [firebird-support 2002-02 #8615](https://fb-list-archive.lawinegevaar.nl/firebird-support/2002/2/8615.html) | [firebird-support 2004-03 #39571](https://fb-list-archive.lawinegevaar.nl/firebird-support/2004/3/39571.html)（再次转述）；[Embarcadero InterBase 产品页](https://embarcadero.com/products/interbase/features/admin-free)「deployed in tanks, helicopters, and medical equipment」（厂商宣传，未提型号与电涌）。均非军方或当事人证据 | **传闻，未证实**；旁白 a16–a19 只作传闻讲，画面须标「传说」，不写型号之外的细节 |

### 后门

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 状态 |
|---|---|---|---|---|
| B01 | 用户名 politically、口令 correct 硬编码在程序中，用它们可访问任一 InterBase 数据库 | Schneier，[Back Door Security Threat in Interbase](https://www.schneier.com/essays/archives/2001/03/back_door_security_t.html)（2001-03） | [CERT VU#247371](https://kb.cert.org/vuls/id/247371)（内置后门账号）；CVE-2001-0008 | 已核，新闻层面 |
| B02 | 过去七年发布的版本（4.x 至 6.01）都有 | Schneier | LWN「six odd years」；FreeBSD 通告写 1992 年引入，来源有分歧，旁白只用 Schneier「七年」 | 已核，分歧已记 |
| B03 | 开源后约半年，由一位德国开发者发现 | Schneier「six months later by a German software developer」 | [LWN 2001-01-18](https://lwn.net/2001/0118/security.php3) 点名 Frank Schlottmann-Goedde；FreeBSD 通告归功 Firebird 项目 | 已核，旁白不点人名 |
| B05 | 后门公开的时间在 2001 年 1 月，日历画面标「2001 年 1 月」 | [LWN 2001-01-18](https://lwn.net/2001/0118/security.php3)；[CERT VU#247371](https://kb.cert.org/vuls/id/247371)（2001-01） | 官方历史页 January 09, 2001 (IBPhoenix) InterBase Security Alert | 已核 |
| B04 | Borland 与 Firebird 项目都发布了修复 | CERT VU#247371 | FreeBSD-SA-01:26 | 已核 |

### 名字

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 状态 |
|---|---|---|---|---|
| N01 | Mozilla 的浏览器原名 Phoenix，与 Phoenix Technologies 商标冲突，2003 年 4 月宣布改名 Firebird | [CNET 2003-05-07](https://www.cnet.com/news/mozillas-firebird-gets-wings-clipped/) | MozillaZine 2004-02-09（「announced in April」） | 已核 |
| N02 | IBPhoenix（Firebird 数据库的赞助方）称打不起官司，转而号召开发者写邮件给 Mozilla 抗议 | CNET 2003-05-07：「Pleading poverty…urging developers to e-mail Mozilla staffers」 | MozillaZine：「high-profile campaign」 | 已核 |
| N03 | Mozilla 起初不改，后在压力下让步，先改称 Mozilla Firebird，只作代号 | [CNET 2004-02-09](https://www.cnet.com/news/mozilla-holds-fire-in-naming-fight/) | [Mozilla branding 2003-04-25](https://web.archive.org/web/20030426081552/http://www.mozilla.org/roadmap/branding.html) | 已核 |
| N04 | 2004 年 2 月 9 日改名 Firefox，发布 0.8 | [MozillaZine](http://www.mozillazine.org/talkback.html?article=4278) | CNET 2004-02-09 | 已核；Firebird 名义约 10 个月（2003-04 至 2004-02） |
| N05 | Mozilla 官方说明：改名为避免重叠，「Firebird」也被另一开源项目使用；不认为侵权，但想回应同行的关切 | [Brand Name FAQ](https://www-archive.mozilla.org/projects/firefox/firefox-name-faq.html)「Why change the name?」 | — | 已核，一手 |
| N06 | Firefox 这个名字选取原因之一是与 Firebird 相近 | 同上「Why Firefox?」 | — | 已核 |
| N07 | Firebird 是传说中的神鸟，常被视作 phoenix 的同义词，能在自焚后重生 | CNET 2003-05-07 | CNET 2004-02-09（同义表述） | 已核；旁白只说传说含义，不声称项目因此取名 |

### 今天

| 编号 | 陈述 | 原始出处与定位 | 独立印证 | 状态 |
|---|---|---|---|---|
| E01 | 没有服务进程，`isql` 直接建库、建表、写入并读出（嵌入式连接） | `lab/out_01_two_modes.txt`「嵌入式」段 | [Quick Start Guide 5](https://firebirdsql.org/file/documentation/html/en/firebirddocs/qsg5/firebird-5-quickstartguide.html)：embedded 连接由 Engine13 处理，客户端进程直接打开库文件 | 已实测 |
| E02 | 启动 `firebird.exe` 后，同一文件经 `inet://` 连上，读到同一行，`MON$REMOTE_PROTOCOL = TCPv4` | 回显「服务端」段 | 同上 | 已实测 |
| E03 | 停掉服务后，同一文件仍可嵌入式打开，`MON$REMOTE_PROTOCOL` 为空 | 回显末段 | 同上 | 已实测 |
| E04 | 连接串带网络协议走服务端；本地路径时客户端先尝试嵌入式直连 | Quick Start Guide 5「Upon receiving a local connection string…」 | 安装包 `doc/README.providers.html` | 已核 |
| E05 | 是关系数据库，支持存储过程与触发器；运行于 Linux、Windows 与多种 Unix；5.0 面向 Windows、Linux、macOS、Android | [About Firebird](https://firebirdsql.org/en/about-firebird/)；[5.0 发布公告](https://firebirdsql.org/en/news/firebird-5-0-is-released/) | 同站两页 | 已核 |
| E06 | 下载、注册、授权、部署都不收费，随商业软件分发也一样（FREE LIKE FREE BEER）；官网另写 FREE LIKE A BIRD | About Firebird | [QSG5 第 2 章](https://firebirdsql.org/file/documentation/html/en/firebirddocs/qsg5/firebird-5-quickstartguide.html)（商业用途免费） | 已核 |
| E07 | MySQL、PostgreSQL 常规用法是客户端/服务端；SQLite 不设服务进程 | [PostgreSQL 18 §18.3](https://www.postgresql.org/docs/18/server-start.html)；[SQLite Serverless](https://sqlite.org/serverless.html)；[MySQL 手册 mysqld](https://dev.mysql.com/doc/refman/9.7/en/mysqld-server.html) | 旧版 FACTS C01–C02 | 已核；说的是常规用法，不称「只有 Firebird 能两种」 |
| E08 | PostgreSQL 以 MVCC 实现并发控制 | [PostgreSQL 18 §13.1](https://www.postgresql.org/docs/18/mvcc-intro.html) | — | 已核 |
| U01 | 官网案例：莫斯科第 31 医院分析系统、洗车行业收银系统、电信计费系统 XPertBilling | [Case Studies](https://firebirdsql.org/en/case-studies/) | — | 已核；官网展示的案例，不代表全部用户 |
| U02 | DB-Engines 2026 年 11 月关系数据库榜（170 个系统）：MySQL 第 2、823.23；PostgreSQL 第 4、689.69；SQLite 第 8、94.68；Firebird 第 20、18.45。MySQL ÷ Firebird ≈ 44.6。得分为相对流行度，不是装机量或市场份额 | `lab/out_02_dbengines.txt` | — | 已取；交付前重取一次 |
| U03 | 项目商业上独立，靠自愿资助 | About Firebird | — | 已核 |
| U04 | 5.0 于 2024-01-11 发布；5.0.4 于 2026-04-17 发布；第 6 版路线图已公布，计划 2026 年发布，截至 2026-11-08 官方未发布 6.0 | [公告](https://firebirdsql.org/en/news/firebird-5-0-is-released/)；GitHub Releases；[路线图](https://www.firebirdsql.org/en/news/firebird-6-roadmap-is-published) | GitHub tags 无 v6 | 已核；交付前复查 |

## 取证中发现、没有进入成片的事实

- 办公室靠电脑取暖，煤气公司以为他们偷气（Ann Harrison 回忆）；搬到干洗店楼上的故事；Sybase 同期成立。备用细节。
- LibreOffice Base 提供 Firebird Embedded，但各资料对是否仍是实验功能说法不一，不用。
- Firebird 1.0 发布于 2002 年；1.5 把代码从 C 改到 C++；3.0（2016）合并各运行形态的核心。

## 复核

未做（尚未成片）。
