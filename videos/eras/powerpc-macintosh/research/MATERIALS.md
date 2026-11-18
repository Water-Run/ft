# 实物、界面与声音材料

2026-11-18 取得并核对。首选摄影者自己的相册。片内 `src/design/photos/` 保存本轮使用的 WebP 图，长边缩至审片所需尺寸。摄影不是制作方拍摄。

| 成片对象 / 本地名 | 摄影者与来源 | 权利、处理 |
|---|---|---|
| 初代 iMac 侧面 `profile.webp` | Stephen Hackett，[实拍原图](https://media.512pixels.net/wp-content/uploads/2016/05/Bondi-IMG_3165.jpg) | [摄影者授权页](https://512pixels.net/projects/imacg3/)，[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)，转码、缩放 |
| 初代 iMac 正面 `bondi.webp` | Stephen Hackett，[实拍原图](https://media.512pixels.net/wp-content/uploads/2016/05/Bondi-IMG_3179.jpg) | 同上，正面可辨光盘托盘、机身字标和两侧扬声器 |
| 五色侧影 `blueberry / grape / tangerine / lime / strawberry.webp` | Stephen Hackett，[完整实拍图谱](https://512pixels.net/2016/05/all-13-colors/)，依次为 Blueberry-IMG_3180、Grape-IMG_3207、Tangerine-IMG_3202、Lime-IMG_3188、Strawberry-IMG_3195 | 同上，选取五种配色，未把邦迪蓝当成蓝莓色。图谱含不同修订的实机，画面只比较外壳颜色 |
| Power Mac G5 前面板 `tower.webp` | William J Sisti，[Old G5 Server – Front](https://www.flickr.com/photos/92455828@N00/9039212657/)，[来源及许可复核](https://commons.wikimedia.org/wiki/File:Old_G5_Server_-_Front_(9039212657).jpg) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)，转码、局部裁切、关键帧转灰度。用于家族外观，照片未断言是 2003 年首批机型 |
| 旧式 Apple 菜单标志 | [Simple Icons 15.0.0 的 Apple 轮廓](https://github.com/simple-icons/simple-icons/blob/15.0.0/icons/apple.svg)；[许可说明](https://github.com/simple-icons/simple-icons/blob/15.0.0/LICENSE.md) | 保留矢量轮廓，CSS 按时代着色。图标库自有贡献以 CC0 提供，Apple 商标属于 Apple。仅用于片中历史识别 |
| System 7、Aqua、Tiger 示意界面 | Apple 的[首代 Power Macintosh 开发说明](https://www.macdat.net/files/pdf/apple/developer_notes/power_macintosh_6100_7100_8100.pdf)、[Aqua 发布](https://www.apple.com/newsroom/2000/01/05Apple-Unveils-Mac-OS-X/)，并参考 [System 7.5.3 的画面](https://guidebookgallery.org/screenshots/macos753) 与 [Mac OS X 10.0.4](https://guidebookgallery.org/screenshots/macosx100) 的界面档案 | 自绘教学窗口、图标、背景与布局。窗口内为讲解文字，非系统原始对话框 |
| 字体 | 仓库固定版本 Noto Sans SC、Noto Serif SC、Inter，见 `kit/assets.json`。页面内嵌两种 Noto 的文字子集，保留 OFL 全文 | SIL OFL 1.1，字体许可随单文件审片页提供。西文印刷标题使用本机 Georgia / Times 系列 |
| 音乐与试读 | 三首配乐为本片原创程序合成，源码 `tools/music.py`，全程无外部采样。五款 MiniMax speech-2.8-hd 同文试读，型号与完整音色 ID 见 `project.json` 的 `credits.services`，生成程序为 `tools/voices.py` | 试听仅在本轮审片页使用，正式旁白仍待确定。配乐源码 GPL-3.0-or-later。第三方语音的发布条件沿用仓库第三方材料约定 |

页面标出摄影者与许可证。各照片及其经处理的图像部分沿用各自许可。
