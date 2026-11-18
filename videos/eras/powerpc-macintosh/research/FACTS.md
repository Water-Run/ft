# PowerPC 时代的麦金塔 · 事实底稿

2026-11-18 核对。对象是 1994 年首代 Power Macintosh 至 2006 年消费与专业 Mac 产品线更换处理器。材料来自同期开发者文档、产品说明、实物摄影与发布演讲。开场是一项可从机器正面核对的假设动作，全文没有冒充亲历者的引语。

## 对象与解释路径

一张软盘揭示硬件接口的断点，一次打开旧应用揭示软件延续的条件。两次处理器转换之间，还有一次操作系统转换。G3、G4、G5 是 PowerPC 家族的不同代际。Aqua 是界面，Classic 是 Mac OS X 中使用许多 Mac OS 9 应用的环境，第一代 Rosetta 才负责 Intel Mac 上的 PowerPC 应用翻译。

## 逐章核对

| 位置 | 已核实的陈述与适用范围 | 原始材料与定位 | 交叉核对 |
|---|---|---|---|
| 开场 / 接口 | 初代 iMac，1998 年，邦迪蓝半透明外壳，内置 15 英寸 CRT、G3、光驱，内置软驱缺席。两只 USB 口，随机器的键鼠使用 USB，有调制解调器与以太网。光盘托盘可从正面照片辨认，侧盖下为连接面板。 | [Apple 原机技术规格](https://support.apple.com/en-sa/112281)，Ports / Storage / Notes；[两张同机实拍及授权](https://512pixels.net/projects/imacg3/) | [计算机历史博物馆 1998 年条目](https://www.computerhistory.org/timeline/1998/)；[Hackett 对初代发布及当期 Macworld 的考证](https://512pixels.net/2016/05/imac-g3-introduction/)，USB 外置软驱 |
| 起点 / 6100 | 1994 年 3 月第一批 Power Macintosh 包括 6100/60、7100/66、8100/80。6100/60 是矮桌面机，601 处理器。PowerPC 由 Apple、IBM 与 Motorola 共同开发。68k 是此前 680x0 芯片家族的简称，指令集不同。 | [Apple《Power Macintosh Computers》](https://www.macdat.net/files/pdf/apple/developer_notes/power_macintosh_6100_7100_8100.pdf)，第 1 章外形图、附录 A 印刷页 67 起；[Apple 1994 年 3 月技术说明](https://savagetaylor.com/TIL/TIL14844.pdf)，第 1 页 | [发布当日 TidBITS 记录](https://tidbits.com/1994/03/14/the-power-macintosh-picture/)；[藏品 6100/60](https://www.computinghistory.org.uk/det/2861/Apple-Power-Macintosh-6100-60/)，只用条目日期与 CPU 表格，正文混有别的配置 |
| 起点 / 兼容 | System 7.1.2 包含 68LC040 模拟器，可以在 PowerPC 上执行符合条件的 68k 应用；新的原生代码可直接执行。系统软件自身也含两种代码，Mixed Mode Manager 协调运行环境切换。没有为某款应用声称测试通过。 | [Apple TIL 14844](https://savagetaylor.com/TIL/TIL14844.pdf)，System 7.1.2 / 68LC040 Emulator / Mixed Mode Manager | [首代 Power Macintosh 开发说明](https://www.macdat.net/files/pdf/apple/developer_notes/power_macintosh_6100_7100_8100.pdf)，第 7 章 System Software；[当日报告](https://tidbits.com/1994/03/14/the-power-macintosh-picture/) |
| 回到 iMac / 五色 | 1999 年 1 月的五色为蓝莓、葡萄、橘子、青柠、草莓。同批五色机配置相同。初代邦迪蓝单列；后来同一颜色亦出现在其他修订机型上。所用单色照片只作配色对照。 | [藏家实物图谱](https://512pixels.net/2016/05/all-13-colors/)；[同场发布回顾及录像入口](https://512pixels.net/2016/05/the-five-flavors/) | [当期 Macworld 报道](https://www.macworld.com/article/159018/flavorfulimacs.html) |
| 窗口 / 系统 | Mac OS X 正式零售版于 2001 年 3 月 24 日推出。Aqua 的高光、半透明控件；Dock 管理应用、文档与窗口。Darwin 基于 UNIX，有内存保护。Classic 依赖 Mac OS 9，可运行许多既有应用。仅在适用 PowerPC 机器与版本内讨论。 | [Apple 公布 Aqua](https://www.apple.com/newsroom/2000/01/05Apple-Unveils-Mac-OS-X/)；[Mac OS X 上市说明](https://www.apple.com/newsroom/2001/03/07Mac-OS-X-Gold-Master-Released-To-Manufacturing/)；[Apple 1 月说明](https://www.apple.com/newsroom/2001/01/09Apples-Mac-OS-X-to-Ship-on-March-24/)，Classic API、Mac OS 9.1 | [当年 Aqua 操作观察](https://tidbits.com/2000/01/17/a-quick-dip-into-aqua-the-mac-os-x-interface/)；[2002 年出厂配置](https://www.apple.com/newsroom/2002/01/07Apple-Makes-Mac-OS-X-the-Default-Operating-System-on-All-Macs/) |
| 窗口 / G4 | 2002 年 1 月推出的平板 iMac 配 PowerPC G4，15 英寸 LCD 高度和角度可调，主机部件在底座里。预装 Mac OS X 10.1.2、Mac OS 9.2.2。iPhoto 可从数码相机导入及整理照片。 | [Apple 发布及配置](https://www.apple.com/newsroom/2002/01/07Apple-Unveils-the-New-iMac/)，首三段、iPhoto、配置 | [发货说明](https://www.apple.com/newsroom/2002/01/28Apple-Begins-Shipping-New-iMacs/)；[实物图](https://commons.wikimedia.org/wiki/File:IMac_G4_sunflower6.png) |
| 散热 / G5 | 2003 年 Power Mac G5 为专业桌面塔机，使用 64 位 PowerPC G5；机箱是阳极氧化铝，有把手和穿孔面板，内部四个独立控制的热区，按热量及功耗控制风扇。热区示意不按物理比例。 | [Apple 2003 年 6 月发布](https://www.apple.com/newsroom/2003/06/23Apple-Unleashes-the-Worlds-Fastest-Personal-Computer-the-Power-Mac-G5/)，处理器、enclosure / thermal zones | [双处理器实机侧盖打开照片](https://commons.wikimedia.org/wiki/File:Power_Mac_G5_open.jpg)；[8 月发货稿](https://www.apple.com/newsroom/2003/08/18Apple-Ships-New-Power-Mac-G5/) |
| 换芯 / 动因 | 2005 年 6 月 WWDC，Jobs 指出 PowerBook 未能用上 G5，解释其对未来每瓦性能的判断；宣布转向 Intel。用苹果当时的判断归因，不外推到所有 PowerPC。 | [WWDC 发布稿](https://www.apple.com/newsroom/2005/06/06Apple-to-Use-Intel-Microprocessors-Beginning-in-2006/)，Jobs 对路线图的说明；[同场 Jobs 演讲摘录与字幕](https://www.linkedin.com/posts/garr-reynolds_in-this-video-from-the-presentation-zen-youtube-activity-7429124809860575232-oeP2)，PowerBook、performance per Watt | [当日会议报道](https://tidbits.com/2005/06/06/apple-to-transition-to-intel-processors/) |
| 换芯 / 交班 | 2006 年 1 月 iMac 换 Intel Core Duo，外形沿用上代，MacBook Pro 同期发布。Universal 应用带适用的两种处理器代码。原版 Rosetta 可翻译多数 Mac OS X 的 PowerPC 应用，有兼容限制。8 月苹果发布 Mac Pro 并宣布 Mac 家族完成 Intel 转换，指新机产品线。 | [Intel iMac 发布与 Rosetta 注释](https://www.apple.com/newsroom/2006/01/10Apple-Unveils-New-iMac-with-Intel-Core-Duo-Processor/)；[MacBook Pro](https://www.apple.com/newsroom/2006/01/10Apple-Introduces-MacBook-Pro/)；[Mac Pro 发布](https://www.apple.com/newsroom/2006/08/07Apple-Unveils-New-Mac-Pro-Featuring-Quad-64-bit-Xeon-Processors/) | [两种架构的开发转换包公告](https://www.apple.com/newsroom/2005/06/06Apple-to-Use-Intel-Microprocessors-Beginning-in-2006/)；[Intel Mac mini 发布对 Universal、Rosetta 的说明](https://www.apple.com/uk/newsroom/2006/02/28Apple-Unveils-Mac-mini-with-Intel-Core-Duo/) |

## 复核范围

1994、2001 与 2006 的界面仅展示对应主题。B1 用经典单色窗框与彩色 Apple 菜单图形；B2 的条纹、高光和 Dock 参考初代 Aqua；B3 用后期 OS X 窗口解释两种代码路径。参考 [经典界面档案](https://guidebookgallery.org/screenshots/macos753)、[10.0.4 界面档案](https://guidebookgallery.org/screenshots/macosx100) 与 [Apple 对 Aqua 的说明](https://www.apple.com/newsroom/2000/01/05Apple-Unveils-Mac-OS-X/)。只借用相邻版本的共同外观，不声称重现特定系统截图。

本轮为审片底稿；没有接触实机或运行模拟器。界面画面中的文稿名、路径分支、解释窗均为教学示意。未采用“世界最快”、销量、平台死因等需要额外比较的数据。
