# 事实出处

取证日期：2026-10-21 至 2026-10-22（北京时间）。对象：PHP2Shell，即 PHP 的两个漏洞 CVE-2026-109618、CVE-2026-109619，以及 2026-10-21 的 PHP 安全更新。**本片信息截至北京时间 2026-10-22 0 时（UTC 2026-10-21 16:00）**；事件仍在发展，交付前须按「复核」一节重查会变化的条目。

优先级：PHP 官方公告与 php-src 源码 > 发现者自述 > 政府机构 > 媒体。媒体与安全厂商的说法互相冲突时，片中说出是谁说的，不替任何一方下结论。按策划者 2026-10-22 的要求（「你不需要真实的去实验……整理新闻即可」），本片只整理公开新闻与官方材料，不做漏洞相关的实验；片中只讲官方公告层面的原理，不讲利用细节。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| 网页快照 | 2026-10-21 UTC 约 15:00–16:10 抓取 | `curl` 存入 `research/_src/web/`（不入库）；少数页面经 WebFetch，表中注明 |
| php-src 修复提交（主线） | `31c0ea7d7ff1d1fccb6492e52dab544011628065` | `gh api repos/php/php-src/commits/31c0ea7d7f` |
| php-src 修复提交（8.1 最小回移） | `1d7dec178a094e6e75b229ce22754045f8c6070a`，分支 `PHP-8.1-CVE-2026-109618-109619` | `gh api … -H "Accept: application/vnd.github.diff"` 存为 `_src/1d7dec178a09.diff`，SHA-256 `5bd88c386523dde98fefaa7bac97ec80f754b84cc58d6511c01dfde39ce1fbe2` |
| php-src NEWS（PHP 5.4.0） | 标签 `php-5.4.0` | `https://raw.githubusercontent.com/php/php-src/php-5.4.0/NEWS` |
| 缺省配置 | 官方镜像 `php:8.5.11-cli`（无 php.ini，内置缺省值） | `research/lab/01_defaults_and_oom.sh` ↔ `out_01_defaults_and_oom.txt`（在策划者叫停实验之前做的唯一一次，只看版本、缺省配置与普通的内存超限报错） |

## 来源一览

| 代号 | 来源 | 日期 |
|---|---|---|
| PHP-A | php.net 新闻存档 2026：「Upcoming Critical PHP Security Release」<https://www.php.net/archive/2026.php#2026-10-20-1> | 2026-10-20 |
| PHP-B | php.net：「Security advisory: Critical remote code execution vulnerabilities, update now」<https://www.php.net/archive/2026.php#2026-10-21-5>；同日 8.5.12 / 8.4.27 / 8.3.36 / 8.2.35 发布公告 | 2026-10-21 |
| GHSA-1 | GitHub 公告 GHSA-w8hw-w9fx-j79w「RCE via OOM corruption」（CVE-2026-109618）<https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w> | published_at 2026-10-21T13:34:25Z |
| GHSA-2 | GitHub 公告 GHSA-6wmf-4rv5-p3rp「RCE via stale global state」（CVE-2026-109619）<https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp> | published_at 2026-10-21T13:34:13Z |
| SRC-1 | php-src 提交 `31c0ea7d7f`「Avoid state corruption via bailout」 | 2026-10-18 |
| SRC-2 | php-src 提交 `1d7dec178a09`（8.1 最小回移） | 2026-10-18 |
| SRC-3 | php-src `NEWS`，标签 php-5.4.0 | 2012-03-01 |
| RFC | <https://wiki.php.net/rfc/session_upload_progress>「Upload progress in sessions」 | 2008-09-08 |
| WIZ | Wiz：「PHP2Shell: AI uncovers critical RCE vulnerabilities…」<https://www.wiz.io/blog/php2shell-php-rce> | 2026-10-21 |
| CALIF | Calif：<https://calif.io/php2shell/> | 2026-10-21 |
| OAI | OpenAI 新闻 RSS 条目「Patch the Planet: global response coordination as agents uncover critical vulnerabilities」（正文页 403，只取到标题与摘要） | 2026-10-21 12:00 GMT |
| HN | Hacker News 帖子 <https://news.ycombinator.com/item?id=50167754> | 2026-10-20 15:20 UTC |
| THN | The Hacker News <https://thehackernews.com/2026/10/php2shell-two-unpatched-critical-php.html> | 2026-10-21 |
| SW | SecurityWeek <https://www.securityweek.com/php2shell-mass-exploitation-looms-for-leaked-critical-php-flaws/> | 2026-10-21 07:02 UTC |
| BC | BleepingComputer <https://www.bleepingcomputer.com/news/security/php-ships-emergency-patches-for-critical-php2shell-flaws/> | 2026-10-21 |
| CF | Cloudflare 博客 <https://blog.cloudflare.com/php-vulnerabilities-waf-protection/>；CTO Dane Knecht 的 X 帖（经 api.fxtwitter.com） | 2026-10-21 |
| WT | watchTowr FAQ <https://watchtowr.com/intelligence/php-cve-2026-109618-faq/> | 发布 2026-10-20T19:35Z，修改 2026-10-21T15:13Z |
| HUN | Huntress（经 WebFetch） | 「Update: 10/21/26 @ 10am ET」 |
| NCSC-UK | <https://www.ncsc.gov.uk/news/critical-security-issue-affecting-php> | 2026-10-21 |
| NSA | @NSACyber X 帖（经 api.fxtwitter.com）；PCMag <https://www.pcmag.com/news/php-flaw-is-so-serious-websites-should-consider-going-offline-nsa-says> | 2026-10-21 13:45 UTC |
| CERT-EU | <https://cert.europa.eu/> 公告 2026-018 v1.1 | 2026-10-21 |
| NOS | NOS「Websites van overheid en in onderwijs offline vanwege lek, risico op hacks」<https://nos.nl/artikel/2636055-websites-van-overheid-en-in-onderwijs-offline-vanwege-lek-risico-op-hacks>（经 WebFetch） | 2026-10-21 11:10，13:49 更新（荷兰时间） |
| TPO | Tpo.nl「PHP-lek legt DigiD, MijnOverheid en Tweede Kamer plat」<https://tpo.nl/2026/10/21/php2shell-websites-offline-digid-ncsc/>（只读到搜索摘要） | 2026-10-21 |
| JP-PM | 高市早苗 X 帖 <https://x.com/takaichi_sanae/status/2112890642590564386>；每日新闻、时事通信、TBS、共同通信的转述（搜索结果标题与摘要） | 2026-10-21 |
| ITM | ITmedia NEWS <https://www.itmedia.co.jp/news/article/2610/21/2000002472/> | 2026-10-21 17:47（日本时间） |
| WMF | 维基媒体基金会 <https://diff.wikimedia.org/2026/10/21/impact-of-php-vulnerabilities-on-wikimedia-tools-and-services/> | 2026-10-21 13:41 UTC，15:52 UTC 更新 |
| 4CH | International Cyber Digest X 帖转引 4chan 声明；Sunday Guardian 称只是部分功能停用（搜索结果） | 2026-10-21 |
| W3T | W3Techs <https://w3techs.com/technologies/details/pl-php> | 页面日期 2026-10-21 |
| VT | VirusTotal 博客（BC 的出处） | 2026-10-21 |

## 逐章

### open：开场

| 句号 | 陈述 | 依据 | 独立印证 | 状态 |
|---|---|---|---|---|
| o1–o3 | 10 月 21 日，荷兰 DigiD、MijnOverheid、议会网站下线；荷兰国家网络安全中心（NCSC）也关掉了自己的网站 | NOS：「Het gaat onder meer om MijnOverheid.nl, DigiD en de website van de Tweede Kamer.」「Ook het Nationaal Cyber Security Centrum (NCSC) van de overheid heeft zijn website uit de lucht gehaald」 | TPO 标题「PHP-lek legt DigiD, MijnOverheid en Tweede Kamer plat」 | 已核（两路） |
| o2 | DigiD 是荷兰公民的数字身份登录系统；MijnOverheid 是政务门户 | 常识性释义，见 <https://www.digid.nl/>、<https://mijn.overheid.nl/> | — | 已核 |
| o4–o6 | 同一天，日本首相高市早苗在 X 发帖，请大家今晚准备打补丁；难以及时打补丁的，暂停网站也是降低风险的办法之一 | JP-PM 原帖：「今夜、10月21日午後11時（日本時間）に公開される修正パッチについて、可及的速やかに適用できるよう準備をお願いします」「修正パッチを速やかに適用することが困難な場合は、例えばウェブサイト等を一時的に停止させることも、リスクを低減させるための有効策の一つと考えられます」 | 每日新闻、时事通信、TBS、共同通信均报道 | 已核 |
| o6a–o6b | 她本人的个人网站 sanae.gr.jp 当晚只显示服务器默认页「It works!」；原因没有公布 | 制作方 2026-10-21 16:02 UTC 用 curl 访问，返回 Apache 缺省页 `<title>It works! Apache httpd</title>`；16:23 UTC 再访问返回 403 | 策划者在会话中报告看到同样的页面（2026-10-22）；日文报道中没有找到该站被入侵或下线原因的报道 | 已核（亲自访问＋策划者目击）；片中不说「被黑」，只说页面所见与「原因没有公布」 |
| o7–o8 | 起因是 PHP 的两个漏洞，被叫作 PHP2Shell | BC：「tracked collectively as PHP2Shell」；PHP-B 两个 CVE | THN：名称由研究者非正式起的，不是 PHP 官方命名 | 已核；画面不说成官方命名 |

### what：它是什么，有多严重

| 句号 | 陈述 | 依据 | 独立印证 | 状态 |
|---|---|---|---|---|
| a1–a2 | 在能识别服务端语言的网站里，约 69.3% 用 PHP（片中说「近七成」） | W3T：「PHP is used by 69.3% of all the websites whose server-side programming language we know.」（2026-10-21） | Wiz 说「70% of the Internet」口径不同，不用 | 已核；必须保留「能识别服务端语言的网站」这一限定 |
| a3 | WordPress、Drupal、Joomla 跑在 PHP 上 | 各项目官方说明（PHP 写成，常识） | WIZ：对三者均演示了远程代码执行 | 已核 |
| a4 | 问题在 PHP 本身，不在某个网站的代码 | PHP-B：「all PHP installations serving web requests」；WIZ：「Exploitation does not depend on a flaw in the application's code」 | — | 已核 |
| 画面 | 编号 CVE-2026-109618、CVE-2026-109619（只上画面，不念） | PHP-B、GHSA-1、GHSA-2 | SRC-1 提交说明 | 已核 |
| a6–a8 | RCE：远程代码执行，攻击者隔着网络让服务器运行他的代码 | PHP-B：「can allow unauthenticated remote code execution」 | WT：「allow an unauthenticated attacker to execute their own code on a server running PHP」 | 已核 |
| a8 | 不用登录、不用谁点链接 | GHSA-1/2 的 CVSS 向量 `PR:N/UI:N`（无需权限、无需用户交互） | PHP-B「unauthenticated」 | 已核 |
| a10 | PHP 官方评分 CVSS v4.0 9.2，满分 10 | PHP-A：「both rated CVSS v4.0 9.2」 | GHSA-1/2 | 已核；watchTowr 与泄露帖给的 10.0 不进正文 |
| a11 | 官方说 mod_php 风险最高，已有演示：攻击可以在网站自己的代码运行之前触发 | PHP-B：「We consider the risk highest for mod_php, with a demonstrated exploit where an unauthenticated request can trigger the attack before any application code runs.」 | BC 引同句 | 已核 |
| a12–a13 | Wiz 说，哪怕只有一句 Hello World 的网站也可能中招 | WIZ：「even a simple "Hello World" application running on an affected PHP version can be vulnerable.」 | 与 a11 官方说法一致 | 已核；片中标明是 Wiz 说的 |

### how：原理（只讲官方公告层面）

| 句号 | 陈述 | 依据 | 独立印证 | 状态 |
|---|---|---|---|---|
| b2 | PHP 的工作进程一次接一次地处理访问 | GHSA-2：「A later request handled by the same worker」；PHP-B 同义 | WIZ：「A later request on the same worker」 | 已核 |
| b4 | 每次访问有属于它的内存，访问结束时收回 | GHSA-2：「request-owned … state」「the request heap is freed」 | WIZ：「the request heap is destroyed」 | 已核 |
| b6–b7 | 访问意外中断时出问题，例如内存用超了，PHP 中途打断它 | PHP-B：「out-of-memory handling can interrupt PHP while internal request data is only partially initialized」 | CALIF：「when an allocation would exceed memory_limit, or another fatal error interrupts native code before its normal cleanup completes」 | 已核 |
| b8 | 内存收回了，有些记录还指着那块内存 | PHP-B：「request-owned internal state can survive after its backing memory has been freed」 | CALIF：「PHP can leave dangling pointers/state」 | 已核 |
| b8、b10 | 比喻：退了房，房卡没作废 | 制作者的比喻，对应 b8 | — | 比喻，不是事实陈述 |
| b9–b10 | 同一进程的下一次访问，可能在正常初始化之前就用了这份旧记录 | PHP-B：「A later request handled by the same worker may use that stale state before normal initialization resets it.」 | GHSA-2 Summary 同义 | 已核 |
| b10 | 后果可能是服务器被人控制（远程代码执行） | GHSA-2 Impact：「remote code execution with the web worker's privileges」 | PHP-B | 已核；只讲后果 |
| b13–b15 | 修复：内存超限不再中途跳出；请求结束时把这些状态复位 | SRC-1 提交说明：「Replace bailout on OOM with UnwindExit」「Properly reset various globals that may be accessed during startup」 | GHSA-1 Fix：「removes `longjmp()` for OOM」，改为在安全点优雅结束 | 已核 |
| b16 | 补丁里有好几处，就是释放内存后补一句「置空」 | SRC-2 `main/SAPI.c`：`efree(SG(request_info).auth_user);` 之后新增 `SG(request_info).auth_user = NULL;`，同样的改动共 5 处 | SRC-1 同名函数 | 已核 |
| b17 | Calif 说 PHP 5.4.0 起都受影响；5.4.0 发布于 2012 年 3 月 1 日 | CALIF 标题「PHP >= 5.4.0 RCE」，「The earliest affected path we found dates to PHP 5.4.0」；SRC-3 第 1 行「01 Mar 2012, PHP 5.4.0」 | WIZ：「going back to version 5.4」 | 已核；官方公告没有写最早受影响版本，片中说「发现者说」 |
| b18 | 5.4.0 加入了「上传进度」功能，缺省开启；它是官方给出的临时缓解措施之一要关闭的功能 | SRC-3：「Added support for storing upload progress feedback in session data. (Arnaud)」；GHSA-2：「It is enabled by default」 | PHP-B 临时措施：`session.upload_progress.enabled=0` | 已核 |
| b19 | 2012 到 2026，约 14 年 | 2012-03-01 → 2026-10-21 为 14 年 7 个月 | WIZ：「remained hidden in the PHP codebase for more than a decade」 | 已核；标题「隐藏 14 年」据此 |
| b20–b21 | 当年加入上传进度功能的开发者 Arnaud Le Blanc，也是这次修复提交的作者 | RFC：「Author: Arnaud Le Blanc」；SRC-3「(Arnaud)」 | SRC-1、SRC-2 作者均为「Arnaud Le Blanc」 | 已核 |

### time：时间线

时间统一换算为北京时间（UTC+8）。

| 句号 | 陈述 | 依据 | 独立印证 | 状态 |
|---|---|---|---|---|
| c1–c2 | 8 月 1 日 Calif 找到问题，8 月 11 日报告给 PHP | CALIF：「August 1 Calif discovered multiple different paths…」「August 11 Calif reported the first bug to PHP」 | GHSA 致谢名单含 `lcfr-hax`（Calif） | 已核（Calif 自述，致谢佐证） |
| c1–c2 | 8 月 19 日 Wiz 独立找到，8 月 24 日报告 | WIZ 时间线：「August 19, 2026: Wiz Research discovers the first PHP vulnerability…」「August 24, 2026: Wiz Research reports the vulnerabilities to the PHP security team.」 | GHSA 致谢含 `sagitzadik-wiz` | 已核 |
| c5 | Wiz 说用了 Gemini 4 Argon 和 GPT-5.6 Sol | WIZ：「We used Wiz Atlas, Gemini 4 Argon and GPT-5.6 Sol throughout this research.」 | — | Wiz 自述，片中标明 |
| c3–c4 | OpenAI 的研究员也在发现者之列；这是 OpenAI「修补地球」（Patch the Planet）计划的一部分 | CALIF：「discovered by Calif, OpenAI and Wiz」「OpenAI invited us to join its Patch the Planet initiative」 | BC：「discovered by Calif, Wiz, and OpenAI security researchers」；OAI RSS 标题；GHSA 致谢含 `amyb-oai` | 已核 |
| c8 | 10 月 20 日晚（北京时间 23:20），Hacker News 上有人爆料两个 PHP 远程执行漏洞即将公布 | HN 帖：「…regarding 2x PHP RCEs with a CVSS score of 10.0. I have no evidence beyond "source: trust me, bro"」，2026-10-20T15:20:35Z | THN：「On October 20, a post on HN said two PHP remote code execution flaws… would be disclosed」 | 已核 |
| c8–c9 | 修复原在保密中进行（embargo），泄露后 watchTowr 证实漏洞是真的 | SW：WatchTowr CEO Benjamin Harris：「we can confirm that these vulnerabilities are indeed real」 | THN：watchTowr「posted on X that the leaked information was real」 | 已核 |
| c10 | PHP 官方随即发预告，修复定在 21 日 14:00 UTC（北京时间 22:00） | PHP-A：「It is scheduled for Wednesday, 21 October 2026 at 14:00 UTC.」 | THN：预告发于 19:33 UTC | 已核；预告的具体时刻两处不一致（THN 19:33 UTC，php.net 页面属性 20:32 UTC），片中只说「随即」不说时刻 |
| c11–c12 | 补丁发布前，Cloudflare 先给客户上了临时防护规则，称已看到早期攻击 | CF 博客：「Starting on October 21 3:02 am UTC, Cloudflare customers… were protected by default」；Knecht：「We are seeing early attacks emerging…」（07:43 UTC） | BC：「Cloudflare … was already observing early attacks」 | 已核 |
| c13 | 北京时间 21 日 21:34 前后，GitHub 公告上线；PHP 发布 8.5.12、8.4.27、8.3.36、8.2.35 | GHSA-1/2 published_at 13:34:25Z / 13:34:13Z；PHP-B | CERT-EU：「released the fixes today, 21 October 2026 at 13:30 UTC」 | 已核；片中说「晚上九点半左右」 |

### impact：影响

| 句号 | 陈述 | 依据 | 独立印证 | 状态 |
|---|---|---|---|---|
| d1–d2 | 英国 NCSC、美国 NSA 都建议：无法及时修补就让系统下线 | NCSC-UK：「…you should consider taking the system offline until it can be fully mitigated.」；NSA：「If an immediate update is not feasible, it is recommend that organizations take the system offline until it can be fully mitigated.」 | PCMag 转引 NSA；CERT-EU 建议隔离面向互联网的应用 | 已核 |
| d4 | 荷兰：政府网站之外，高校的一些系统也下线 | NOS：「Ook verschillende systemen in het hoger onderwijs zijn offline gehaald.」 | TPO | 已核 |
| d5–d6 | 日本：Shadowverse: Worlds Beyond、BASE、pictSQUARE 等服务因 PHP 问题暂停 | ITM：「このうちShadowverse: Worlds Beyondやキンブル、pictSQUARE、BASEはPHPの影響であることが、各社の発表やITmedia NEWSの取材で分かっている。」 | JP-PM 首相呼吁可暂停网站；维基百科转述同一 ITmedia 报道（非独立） | 已核（单一媒体，但依据各公司自己的公告）；不说具体家数 |
| d8 | 4chan 一度只读 | 4CH：4chan「temporarily read-only while we await an urgent PHP security update」 | Sunday Guardian：发帖、验证码等动态页面暂停，版面仍可浏览 | 已核；片中说「暂停发帖」，不说「下线」 |
| d11–d13 | 是否已被利用说法不一：Cloudflare、watchTowr 说看到了攻击；荷兰 NCSC、Huntress 说尚未看到 | CF；WT：「Exploitation has been observed in the wild as of the 21st of October…」；NOS：「Het NCSC heeft nog geen actief misbruik van het lek gezien.」；HUN：「Huntress has not yet seen in-the-wild exploitation…」 | THN：「No source has confirmed a successful break-in.」 | 已核；片中并列各方说法 |

### now：怎么办，截至何时

| 句号 | 陈述 | 依据 | 独立印证 | 状态 |
|---|---|---|---|---|
| e1–e2 | 升级到 8.5.12、8.4.27、8.3.36 或 8.2.35 | PHP-B | GHSA-1/2 patched versions | 已核 |
| e3–e4 | 正式修复只覆盖 8.2 及以上；7.4 到 8.1 只有官方的最小源码补丁；PHP 5 没有任何官方补丁；可找发行版或长期支持厂商 | PHP-B：「PHP 8.1 and older no longer receive updates from the PHP project.」「the PHP security team provided minimal source-backports for PHP 7.4 …, PHP 8.0 …, and PHP 8.1」 | SRC-2：8.1 回移分支与提交 | 已核 |
| e6 | 关掉上传进度等临时办法只能挡住部分路径；官方原话：更新是唯一安全的选择 | PHP-B：「the following measures reduce exposure to specific attack paths but do not make an installation safe」；8.5.12 公告：「There are no complete mitigations, updating is the only safe choice.」 | GHSA-1：「updating is the only complete mitigation」 | 已核 |
| e3c | 用 PHP 的网站里约三分之一停在 7 和 5 | W3T 版本页：「Version 8 65.2% Version 7 27.0% Version 5 7.7% Version 4 0.1%」（W3Techs.com, 21 October 2026）；27.0% + 7.7% = 34.7% | — | 已核（单一统计源；口径为 W3Techs 能识别版本的网站） |
| e3d | 最多的是早已停止维护的 7.4 和 5.6，还有 5.3 | W3T 子版本页：PHP 7 中「Version 7.4 73.4%」；PHP 5 中「Version 5.6 55.0% Version 5.3 15.3% Version 5.4 14.7%」（2026-10-21） | php.net/eol.php：7.4 停止支持于 28 Nov 2022，5.6 于 31 Dec 2018，5.3 于 14 Aug 2014 | 已核；不说 5.3 受本次漏洞影响（发现者说的范围从 5.4 起） |
| e6a–e6b | 21 日 Node.js 发布安全更新，其中有可致远程代码执行的高危问题 | Node.js 官方「Wednesday, October 21, 2026 Security Releases」<https://nodejs.org/en/blog/vulnerability/october-2026-security-releases>：「Node.js Brotli decoder out-of-bounds write permits remote code execution (CVE-2026-111497) - (high)」 | — | 已核（官方一手） |
| e6c | 19 日 Go 也发布了安全修复 | go.dev 发布历史：「go1.27.3 (released 2026-10-19) includes security fixes to the crypto/x509 package」 | 同页 go1.26.10 | 已核；策划者说「Go 今天也爆出重大漏洞」，官方发布历史截至取证时没有 21 日的版本，也没有写严重程度，片中只说 19 日的安全修复 |
| e7–e8 | 本片信息截至北京时间 2026 年 10 月 22 日 0 时 | 本表全部来源的抓取时间均早于 UTC 2026-10-21 16:10 | — | 制作说明，交付前按实际复核时间改 |

## 取证中发现、没有进入成片的事实

- **高市早苗个人网站**：策划者在会话中提到「高市早苗的网站已经被黑 https://www.sanae.gr.jp/」。截至取证时，没有找到任何媒体或官方关于该站被入侵的报道；2026-10-21 16:02 UTC 访问时，该站返回 Apache 缺省页「It works!」，这与主动下线或重装一致，不能证明被入侵。片中不说「被黑」，只用已证实的首相发帖。
- 泄露帖与 watchTowr 给的 CVSS 10.0；官方为 9.2。
- Wiz、Calif 的技术细节不进片。
- 第 1 稿删去的句子：维基媒体关掉 Toolforge、Cloud VPS 等支撑服务（WMF）；VirusTotal 统计约 510 万个 IP 运行 PHP（不等于都有漏洞）。
- 第 1 稿删去的两句（依据仍有效，日后可用）：Wiz 称「一个研究员一周完成了过去顶尖团队几个月的工作」；Wiz 称 9 月 21 日 PHP 确认并开始协调修复。
- 发现顺序：Calif 自述 8 月 1 日最早；Wiz 8 月 19 日。Cloudflare 博客另列 Quarkslab 为披露方之一，别处未见。
- PCMag 称 OpenAI 透露 Calif 用了 GPT-5.6 Sol；OpenAI 原文页面 403 未读到，Calif 页面没有写模型名，只写「没有用一般人拿不到的模型」。不进片。
- 暴露数：Mallory 统计 2026-10-20 约 88.4 万台主机的 banner 报告 PHP 8.1 或更早（THN）。
- PHP 份额的其他说法：Wiz「70%」，BleepingComputer「75% 到 80%」，口径不同，只用 W3Techs。
- Sansec 曾说「补丁发布后 15 分钟内就会出现大规模攻击」（PC Gamer、SecurityWeek），其官网现在的版本已无此句。
- 法兰德斯政府与议会网站预防性下线（Brussels Times，经 WebFetch 转述，未逐字核对）。
- 荷兰另有 Autoriteit Persoonsgegevens、Notubiz 下线（NOS）。

## 复核

<!-- 成片后逐句、逐画面再核一遍：记录核查范围、日期、依据、发现的问题与更正。没做的写「未做」，待核查的不写成通过。 -->

未做。会变化的条目（是否已被利用、各网站是否恢复、修复版本有无后续）交付前须重查，并更新 e5 的截止时间。
