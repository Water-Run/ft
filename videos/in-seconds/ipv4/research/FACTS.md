# 事实出处

- 取证日期：2026-10-31；2026-11-01 按策划者要求补开头历史与结尾的局限、IPv6，并按第 3 稿（面向不知道什么是 IP 的观众）重排句号（制作方 Claude Opus 5.5 补证）。
- 对象：IPv4 地址、CIDR 网络前缀、同网与跨网交付、环回及私有地址；开头的诞生与启用，结尾的地址耗尽与 IPv6。
- 版本边界：地址与头部格式依据 RFC 791；现代前缀写法依据 RFC 4632，不采用 RFC 791 已过时的 A/B/C 分类作为本片讲法。特殊地址以各自 RFC 及 RFC 6890 的初始注册表交叉核查；`localhost` 同时可能是 IPv6 名字，本片只陈述其 IPv4 行为。IPv6 只在结尾出现：只讲它接替 IPv4、地址加长到 128 位、仍按前缀与下一跳找路，不展开其地址写法与机制。

## 环境与版本

| 项 | 版本 | 获取方式 |
|---|---|---|
| 实验系统 | Windows，本机会话；非干净容器，仅运行 loopback 与本机计算，不读取或记录真实网络配置 | `research/lab/10_ipv4.py` |
| Python | 3.14.3，标准库 `ipaddress`、`socket` | `research/lab/out_10_ipv4.txt` 首行 |
| 协议原文 | RFC 791、1122、1918、3022、4632、5737、6761、6890，均于 2026-10-31 读取原文；RFC 801、1296、1631、1883、4291、4861、8200 于 2026-11-01 读取原文 | 下表各直达链接与章节 |
| 登记与历史 | IANA IPv4 地址空间登记表 CSV、NRO 2011-02-03 新闻稿、Internet Society《A Brief History of the Internet》，均于 2026-11-01 读取 | `research/lab/20_iana_pool.py`（CSV 存 `research/_src/`，不入库） |

## 对象与解释路径

IPv4 用四字节、共 32 位的地址标识网络接口；一台主机可以有多个接口和多个地址，因此初稿说“给联网接口地址”，不说“一台设备只能有一个地址”（F03、F04）。常见文本形式把四字节写成四段十进制，每段 8 位，数值范围为 0–255（F05、F06）。

主例中，源接口为 `192.168.1.10/24`，目的为 `203.0.113.80`。`/24` 表示前 24 位是网络前缀；源网络为 `192.168.1.0/24`，按同一前缀长度计算的目的网络为 `203.0.113.0/24`，两者不同（F07–F10）。源主机因此在 IP 层把跨网数据交给默认网关；同网目的则直接交付。路由器依据目的地址和路由表逐跳转发，多条路由匹配时使用最长前缀匹配（F11–F15）。本片旁白只说“查路由表，送往下一站”，不展开路由协议。

`localhost` 是特殊用途名字，不是 IPv4 地址；IPv4 地址查询应得到环回地址，本机实测得到 `127.0.0.1`（F16）。整个 `127.0.0.0/8` 是环回网段，环回地址不应出现在主机之外（F17）。`192.168.0.0/16` 是三个 RFC 1918 私有网段之一，可在彼此独立的私有网络中重复使用；私有主机访问外部网络通常经 NAT/NAPT 转换地址，多台内网主机可共享一个外部地址（F18、F19）。

完整操作路径为：应用给出目的地址 → 源接口写入源与目的地址 → 以本机前缀判断是否同网 → 同网直交或跨网交给默认网关 → 路由器查表选择下一跳 → 到达目的网络。环回路径不离开本机；私有地址跨公网时还涉及地址转换。未展开的链路层寻址、名称解析的一般过程、路由协议与 NAT 端口细节均不是本片结论的前提。

## 逐段事实表

### open

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| o1、o2 | 数据靠地址找到目的设备：IP 把数据报从源送到目的，源和目的都是用定长地址标识的主机。 | [RFC 791 §1.2](https://www.rfc-editor.org/rfc/rfc791.html#section-1.2)：`transmitting blocks of data called datagrams from sources to destinations, where sources and destinations are hosts identified by fixed length addresses` | [RFC 791 §2.3](https://www.rfc-editor.org/rfc/rfc791.html#section-2.3) Addressing 段；`out_10_ipv4.txt` 的源、目的、网关路径 | IPv4 | 2026-11-01，已核查 |
| o3 | IP 即 Internet Protocol（互联网协议），规定按地址送数据报的规则。 | RFC 791 标题 `INTERNET PROTOCOL` 与 §1.2 Scope | RFC 801 关键文档表 `IP … RFC 791` | IPv4 | 2026-11-01，已核查；「互联网协议」只上画面 |
| o4 | IPv4 是 IP 的第 4 版，规范 RFC 791 日期为 1981 年 9 月；2026 年的系统仍在使用（本机 `localhost` 解析为 `127.0.0.1` 并完成 IPv4 环回连接）。 | RFC 791 首页 `September 1981` 与 §3.1 Version 字段 `This document describes version 4` | [RFC 801](https://www.rfc-editor.org/rfc/rfc801.html)（1981 年 11 月）：IP `is specified in RFCs 791 and 792`；`out_10_ipv4.txt` | IPv4；2026-10-31 实验环境 | 2026-11-01，已核查 |
| 画面 | 关于对话框列出 IP 全称、第 4 版、1981 年 9 月、RFC 791。阿帕网不进旁白也不上画面（策划者：速通观众不认识）。 | 同上 | 同上 | — | 2026-11-01 |

### address

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| a1、a2 | IPv4 地址固定为四个八位字节，即 32 位（旁白：三十二个零或一，每八个一组写成十进制）。 | [RFC 791 §2.3](https://www.rfc-editor.org/rfc/rfc791.html#section-2.3)，`Addresses are fixed length of four octets (32 bits)` | `out_10_ipv4.txt`：`source_bit_length=32`、`source_octets=[192, 168, 1, 10]` | IPv4 | 2026-10-31，已核查 |
| a1 | 地址对应网络接口；一台主机可有多个接口与多个地址。 | [RFC 791 §2.3](https://www.rfc-editor.org/rfc/rfc791.html#section-2.3)，Addressing 段关于 multi-homing 与多个逻辑地址的说明 | 与上一句同源规范的结构约束；旁白仅采用“联网接口”以避免“一机一址”的错误推断 | IPv4 | 2026-10-31，已核查；第二路为范围限定而非独立实现 |
| a2 | `192.168.1.10` 以四段十进制表示四个字节。 | [RFC 4632 §3.1](https://www.rfc-editor.org/rfc/rfc4632.html#section-3.1)，CIDR 记法中的 `4-octet quantity` 与斜杠记法 | `out_10_ipv4.txt`：`source=192.168.1.10`、`source_octets=[192, 168, 1, 10]` | 现代 IPv4 文本表示 | 2026-10-31，已核查 |
| 画面 | 每段 8 位，可表示 0–255；示例四段为 192、168、1、10（第 3 稿旁白不口播 0–255，只在位视图上注明）。 | [RFC 4632 §3.1](https://www.rfc-editor.org/rfc/rfc4632.html#section-3.1)，8-bit octet 与掩码位说明 | `out_10_ipv4.txt`：四字节值与 32 位二进制展开；8 位无符号整数范围为 0–255 | IPv4 | 2026-10-31，已核查 |
| a1–a4、recap | 32 位地址共有 `2^32 = 4,294,967,296` 种位组合；这是理论组合数，不等于可分配公网地址数。 | [RFC 4632 §3.1](https://www.rfc-editor.org/rfc/rfc4632.html#section-3.1)，地址块最大为 `2^32` | `out_10_ipv4.txt`：`ipv4_address_count=4294967296` | 全 IPv4 地址空间，含特殊用途地址 | 2026-10-31，已核查；当前初稿未口播该数字 |

### prefix

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| p1 | 地址分两截：前面是网络号，后面是网络内的本地部分（RFC 791 `An address begins with a network number, followed by local address`）；CIDR 中斜杠后的十进制数给出前一截的位数，范围为 0–32。 | [RFC 4632 §3.1](https://www.rfc-editor.org/rfc/rfc4632.html#section-3.1)，Prefix Notation | `out_10_ipv4.txt`：`prefix_length=24` | CIDR 记法 | 2026-10-31，已核查 |
| p2 | `/24` 将前 24 位作为网络部分，剩余 8 位用于网络内终端编址（旁白「后一截是设备」）。 | [RFC 4632 §3.1](https://www.rfc-editor.org/rfc/rfc4632.html#section-3.1)，网络位与终端位的定义及 `/24` 示例 | `out_10_ipv4.txt`：`source_network=192.168.1.0/24` | 本例 `/24`，不推广为所有接口的固定掩码 | 2026-10-31，已核查 |
| 画面 | `192.168.1.10/24` 所属网络是 `192.168.1.0/24`。 | [RFC 4632 §3.1](https://www.rfc-editor.org/rfc/rfc4632.html#section-3.1)，前缀与掩码算法 | `out_10_ipv4.txt`：`source_network=192.168.1.0/24`，脚本含断言 | 本例 | 2026-10-31，已核查 |
| p3 | 按本机 `/24` 计算，目的 `203.0.113.80` 对应 `203.0.113.0/24`，与源网络不同。 | [RFC 4632 §3.1](https://www.rfc-editor.org/rfc/rfc4632.html#section-3.1) | `out_10_ipv4.txt`：`destination_network=203.0.113.0/24`、`same_network=False` | 源接口为 `/24` 的本例 | 2026-10-31，已核查 |

### route

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 画面 | IPv4 头部含 32 位源地址和 32 位目的地址（画面上的头部图取自 RFC 791 Figure 4；旁白不口播）。 | [RFC 791 §3.1](https://www.rfc-editor.org/rfc/rfc791.html#section-3.1)，Source Address、Destination Address 字段 | [RFC 791 §2.2 Model of Operation](https://www.rfc-editor.org/rfc/rfc791.html#section-2.2)，发送模块据目的地址构造数据报 | IPv4 | 2026-10-31，已核查 |
| r1、r2 | 同网目的可直接交付；跨网目的经网关进入其他网络。默认网关是主机在没有更具体路由时使用的出口；旁白以「家里的路由器」举例，画面标注「默认网关：本网的出口」，示例网关地址 `192.168.1.1`。 | [RFC 791 §2.2](https://www.rfc-editor.org/rfc/rfc791.html#section-2.2)，发送方把跨网数据报交给 gateway；[RFC 1122 §3.3.1.2](https://www.rfc-editor.org/rfc/rfc1122.txt) 的 Gateway Selection | `out_10_ipv4.txt`：`same_network=False`、`gateway_in_source_network=True` | 本例忽略链路层细节，不改变 IP 层判断 | 2026-10-31，已核查 |
| r3 | 路由器解释目的地址、查路由表逐跳转发，直至目的网络；匹配多条路由时采用最长前缀匹配。 | [RFC 791 §2.3](https://www.rfc-editor.org/rfc/rfc791.html#section-2.3)，数据报经各网络与 gateway 到目的；[RFC 4632 §5.1 规则 1](https://www.rfc-editor.org/rfc/rfc4632.html#section-5.1)，`longest-match basis` | `out_10_ipv4.txt`：同时匹配 `/0` 与 `/24`，选择 `203.0.113.0/24` | IPv4 路由；旁白不展开选择算法 | 2026-10-31，已核查 |
| 示例地址 | `203.0.113.0/24` 与 `198.51.100.0/24` 只用于文档示例，不应当在公网出现。 | [RFC 5737 §3–4](https://www.rfc-editor.org/rfc/rfc5737.html#section-3) | [RFC 6890 §2.2.2 表 13、14](https://www.rfc-editor.org/rfc/rfc6890.html#section-2.2.2)，Documentation 条目 | 本片全部示例与实验 | 2026-10-31，已核查 |

### special

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| 画面 | `localhost` 是特殊用途名字；其 IPv4 地址查询应返回环回地址，本机实测为 `127.0.0.1`。第 3 稿按策划者要求只口播 127.0.0.1，localhost 只作画面标签。 | [RFC 6761 §6.3](https://www.rfc-editor.org/rfc/rfc6761.html#section-6.3)，Users 与 Name Resolution APIs 条目 | `out_10_ipv4.txt`：`localhost_ipv4=['127.0.0.1']`，并完成该名字的 TCP 环回连接 | 仅陈述 IPv4；IPv6 不在本片范围 | 2026-10-31，已核查 |
| s1 | `127.0.0.1` 属于环回地址段 `127.0.0.0/8`（画面：127 开头的都绕回本机）；此类地址不得出现在主机之外，所以它指的就是本机自己。 | [RFC 1122 §3.2.1.3(g)](https://www.rfc-editor.org/rfc/rfc1122.txt)，`{127, <any>}` 与 `MUST NOT appear outside a host` | [RFC 6890 §2.2.2 表 4](https://www.rfc-editor.org/rfc/rfc6890.html#section-2.2.2)；`out_10_ipv4.txt` 的网段成员断言及 `loopback_payload=IPv4 loopback` | 一般 IPv4 环回；RFC 6890 脚注所列特殊协议例外未进入本片 | 2026-10-31，已核查 |
| s2 | `192.168.0.0/16`（旁白：192.168 开头的）是私有地址段，只须在相应私有网络内唯一，可被不同私有网络重复使用。 | [RFC 1918 §3](https://www.rfc-editor.org/rfc/rfc1918.html#section-3)，三个保留网段及唯一性范围 | [RFC 6890 §2.2.2 表 11](https://www.rfc-editor.org/rfc/rfc6890.html#section-2.2.2)；`out_10_ipv4.txt` 的三个私有网段与成员断言 | `192.168.0.0/16`，不是泛指所有以相似数字开头的地址 | 2026-10-31，已核查 |
| s3 | 私有网络访问外部网络时可经 NAT/NAPT 转换地址（旁白：整个内网通常共用一个公网地址）；NAPT 可让多台内网节点共享一个外部 IPv4 地址。 | [RFC 3022 摘要、§1、§2.2](https://www.rfc-editor.org/rfc/rfc3022.html#section-2.2)，私有到外部地址映射及 SOHO 单地址共享 | [Amazon VPC：NAT gateways](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html)，私有源地址转换及回程反向转换的实际服务文档 | 常见家庭/组织出口 NAT；不声称所有网络都必须 NAT | 2026-10-31，已核查 |

### limit

| 句号或位置 | 陈述 | 原始出处与定位 | 独立印证 | 适用版本、环境与截至日期 | 核查日期与状态 |
|---|---|---|---|---|---|
| e1 | 32 位共有 `2^32 = 4,294,967,296` 种组合，约四十三亿；地址转换的提出就是为了应对地址耗尽。 | [RFC 1631](https://www.rfc-editor.org/rfc/rfc1631.html) 摘要（1994 年 5 月）：`The two most compelling problems facing the IP Internet are IP address depletion and scaling in routing`，NAT 以地址复用 `solving the address depletion problem` | address 段的 `2^32` 行与 `out_10_ipv4.txt`：`ipv4_address_count=4294967296`；[RFC 1918 §2、§4](https://www.rfc-editor.org/rfc/rfc1918.html#section-2)（1996 年 2 月）：担心全局唯一地址耗尽，私有地址可 `conserve the globally unique address space` | 理论组合数，含特殊用途地址 | 2026-11-01，已核查 |
| e2 | 2011 年 2 月 3 日，IANA 的 IPv4 空闲地址池（旁白：全球统一管理的地址池）分配完毕：最后五个 /8 平均分给五个地区注册机构。各地区注册机构仍有余量，此后陆续用完，旁白不说「全世界再无 IPv4 地址」。 | [NRO 新闻稿，2011-02-03](https://www.nro.net/ipv4-free-pool-depleted/)：`the free pool of available IPv4 addresses is now fully depleted` | [IANA IPv4 地址空间登记表](https://www.iana.org/assignments/ipv4-address-space/)：102/8 AFRINIC、103/8 APNIC、104/8 ARIN、179/8 LACNIC、185/8 RIPE NCC 均为 2011-02；`out_20_iana_pool.txt` | IANA 总地址池；截至 2026-11-01 的登记表 | 2026-11-01，已核查 |
| e3 | IPv6 被设计为 IPv4 的接班者，地址从 32 位加长到 128 位。 | [RFC 8200 §1](https://www.rfc-editor.org/rfc/rfc8200.html#section-1)（2017 年 7 月）：`designed as the successor to IP version 4`；`increases the IP address size from 32 bits to 128 bits` | [RFC 1883 §1](https://www.rfc-editor.org/rfc/rfc1883.html#section-1)（1995 年 12 月）同样的两句 | IPv6 | 2026-11-01，已核查 |
| e4 | IPv6 仍先看网络、再交给下一跳：前缀写法与 IPv4 的 CIDR 相似；发送方按最长前缀匹配判断目的是否在本链路，在则直接发给目的，否则交给默认路由器。 | [RFC 4291 §2.3](https://www.rfc-editor.org/rfc/rfc4291.html#section-2.3)（2006 年 2 月）：`similar to the way IPv4 address prefixes are written in … CIDR notation` | [RFC 4861 §5.2](https://www.rfc-editor.org/rfc/rfc4861.html#section-5.2)（2007 年 9 月）Conceptual Sending Algorithm 的 next-hop determination | 旁白只说「找路的办法照旧：先看网络，再交给下一站」 | 2026-11-01，已核查 |
| 画面 | IPv4 地址空间分为 256 个 /8：其中 35 个为 IANA 保留或特殊用途（0、10、127，组播 224–239，将来使用 240–255），5 个是 2011 年 2 月的最后五块，其余 216 个已分配。 | IANA IPv4 地址空间登记表 | `out_20_iana_pool.txt` 的 `kinds_count` 与断言 | 截至 2026-11-01 的登记表；登记表的年月不全是最初分配时间，画面不按年份演进 | 2026-11-01，已核查 |

## 取证中发现、没有进入成片的事实

- RFC 1918 的完整私有网段为 `10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`；初稿只口播策划者点名的 `192.168` 段，完整回显已留存。
- RFC 6890 的初始注册表还列出 `0.0.0.0/8`（本网络中的本主机）、`169.254.0.0/16`（链路本地）、`100.64.0.0/10`（共享地址空间）、组播与受限广播等。它们不是同一用途，不应把“特殊地址”都讲成“私有地址”。受 100 秒与低认知负担约束，本片不逐项展开。
- NAPT 还转换 TCP/UDP 端口或 ICMP 标识，并需要保持映射；初稿只说“地址转换”，不把 Basic NAT 与 NAPT 混为同一机制。
- 最长前缀匹配已由 `/0` 与 `/24` 的计算实验验证；初稿不增加术语，只保留“查路由表，送往下一站”。
- IPv4 头部还含 TTL、校验和、分片等字段，与主例的地址路径无直接关系，未进入初稿。
- 各 RIR 用完自己最后余量的时间（如 APNIC 2011 年 4 月、RIPE NCC 2019 年 11 月）、IPv6 当前的使用比例都没有核查到可直接引用的原文与独立印证，不进入旁白与画面。
- 1983 年元旦阿帕网整网从 NCP 改用 TCP/IP（RFC 801 计划；Internet Society《A Brief History of the Internet》印证）：第 2 稿用过，第 3 稿按策划者「速通观众都不懂什么阿帕网的」删去。
- RFC 1296（1992 年 1 月）表 N.1：1981 年 8 月网上有 213 台主机（SRI-NIC 主机表第 152 版）；只找到 Internet Society 文中「a modest number of time-shared hosts」的定性印证，第 3 稿为守住时长也未用。
- 私有地址（RFC 1918，1996 年；前身 RFC 1597，1994 年）与地址转换（RFC 1631，1994 年）都出自九十年代：第 2 稿口播过，第 3 稿删去。
- Vint Cerf 等人对 32 位选择的回忆未取得原始出处，不使用。

## 复核

2026-10-31 准备方已逐句对照上表与实验回显；2026-11-01 制作方 Claude Opus 5.5 补入 open、limit 两段的新事实，并按第 3 稿的句号重排各段引用。人工文案校对、配音后读音回听及成片逐画面事实复核均未做；不得据此写成已确认或已验收。
