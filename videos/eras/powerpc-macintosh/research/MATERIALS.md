# 讲解对象自己的材料

<!-- 准备方提供原始材料与出处，不给设计方案（docs/roles.md 第 3 节）。视觉系统由制作方定；策划者已明确要求「设计风格需要严格符合那个年代的苹果风格」，那条要求写在本片 README 的「简报」与「视觉系统」。 -->

本片讲的是 1994–2006 年那批 PowerPC 时代的麦金塔。这一代 Apple 在十二年里换过两套工业设计与两套界面语言，材料必须来自 Apple 自己当年的发布材料，不能靠记忆里的印象。

用法：每一项写清「是什么」「在哪一页」「怎么取」。制作方从这些一手材料取形取色，取到的实际色值与版式记回本文件；不逐像素复刻任何现成成品，讲解对象自己的标志、界面与产品照可以展示并注明出处。

## 机器本体

| 材料 | 出处 | 取法与注意 |
|---|---|---|
| iMac G3 五种机身色：Strawberry、Blueberry、Grape、Lime、Tangerine | Apple 支持站《iMac (333 MHz) 技术规格》（112286），原文 «Comes in five different colors: Strawberry, Blueberry, Grape, Lime and Tangerine»；同页有产品照 | https://support.apple.com/en-us/112286 。注意该页对应的是 1999-04-15 上市、1999-10-07 停产的托盘装载机型，**不是** 1998 年 8 月首发的那台，不能说「1998 年的 iMac 就是这个规格」 |
| Power Mac G5 的阳极氧化铝机身 | Apple 新闻稿 2003-06-23（«a stunning new anodized aluminum alloy enclosure»）与 2003-08-18（«a stunning new professional aluminum enclosure featuring innovative computer-controlled cooling»） | https://www.apple.com/newsroom/2003/06/23Apple-Unveils-the-Worlds-Fastest-Personal-Computer-the-Power-Mac-G5 、https://www.apple.com/newsroom/2003/08/18Apple-Ships-New-Power-Mac-G5 。两稿的配图是同一台机器的官方照片，机身比例与散热格栅以照片为准 |
| 铝制外壳的紧凑机身（Mac mini） | Apple 支持站《Mac mini (original) 技术规格》（112579） | https://support.apple.com/en-us/112579 。同页有产品照与 512 MB PC2700 DDR、40/80 GB Ultra ATA 等字段 |
| 一英寸厚的笔记本（MacBook Pro） | Apple 新闻稿《Apple Introduces MacBook Pro》（2006-01-10） | https://www.apple.com/newsroom/2006/01/10Apple-Introduces-MacBook-Pro 。同稿有产品照与「thin and lightweight design」的表述 |
| 1994 年第一代 Power Macintosh 6100/60、7100/66、8100/80 的外观与 System 7 时代的界面 | Internet Archive《A Guide To The Power Macintosh》（© 1994 Apple Computer，34 页小册子） | https://archive.org/details/AGuideToThePowerMacintosh1994Apple 。含产品线图示与当时的界面图，是 1994 年那一代唯一的一手视觉材料 |
| 68k 同期在售机型：Quadra 800、Performa 475、LC III | Apple 支持站 112217、112336、112230 | https://support.apple.com/en-us/112217 、https://support.apple.com/en-us/112336 、https://support.apple.com/en-us/112230 。各页有产品照，用来表现「两种芯片同时在卖」 |

## 界面语言

| 材料 | 出处 | 取法与注意 |
|---|---|---|
| 顶部菜单栏、窗口的蓝白配色、系统版本（Mac OS 8.5.1 / 8.6 / 9 / X） | Apple 支持站规格页的 Orig SSW 与 Mac OS Supported 字段（112286、112579） | https://support.apple.com/en-us/112286 、https://support.apple.com/en-us/112579 。这些字段给出当年在跑的系统版本，界面取色与控件样式以这些系统版本的官方影像为准 |
| 1991 年发布会现场（Jobs 之后由 Sculley 对三家联盟分工的说明） | Internet Archive《Apple/IBM/Motorola Alliance Press Conference Highlights》（出版者 Apple Inc.，1991-10-03） | https://archive.org/details/ibm-apple-highlights 。含当年发布会影像与文字稿，是全片最上游的一手材料 |
| 开机时的灰色 Apple 标志 | Apple 官方品牌材料 | 官方站点与新闻稿中的标志用法；使用时注明「Apple 官方标志」 |

## 文字与排版

- **当年的系统字型**：Mac OS 8/9 用 Charcoal，Mac OS X 用 Lucida Grande（拉丁文），两者的中文界面另有系统自带字形。**具体字族与许可须一手确认后再用**，本轮没有取得一手材料，表里不写死。
- **仓库现状**：`kit/assets.json` 目前只有 Noto Sans SC、Noto Serif SC、Inter、JetBrains Mono、VT323 五款（OFL 许可，google/fonts 固定提交）。要用 Charcoal 或 Chicago 气质，需要维护者往 `kit/assets.json` 增补字体文件与校验和；准备方不能改 `kit/`。未增补时只能用现有字体近似，并在本片 README 写明这是近似。
- **中文界面字形**：本轮未取到一手材料，不在片中断言当年中文界面用的是哪一款字形。

## 色值

具体色值**不在本文件里写死**。当年的界面与机身照片都经过压缩与色彩管理，凭记忆写 hex 无法复查，交付前也核不了。做法：制作方从上面列出的官方图片取样，把实际色值、来源页面与取样日期写回本文件；定稿后把色值写进 `project.json` 的 `check.style.palette`，让总闸门按片核对。

## 合规

- Apple 的标志与产品名是 Apple 的商标；本片作为讲史用途展示官方材料并注明出处。
- 第三方组件与许可的通用约定见 [docs/reference/third-party.md](../../../docs/reference/third-party.md)。
