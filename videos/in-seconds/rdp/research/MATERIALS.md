# 讲解对象的材料

讲解对象自己的视觉与声音材料，供设计取用（经验规则 F16）。每一项写明取自哪里、怎样取得、取得的日期。这里只记**材料与约束**，不写怎么用——用法由制作方在 README 的「设计」里决定（`docs/roles.md` 第 3 节）。

| 材料 | 值或文件 | 出处 | 取得方式与日期 |
|---|---|---|---|
| 标志：ToDesk | `src/img/todesk.svg`（官网页头的横版标志，白字，128×28 视图框） | ToDesk 官网 `https://www.todesk.com/` 页头 `<img src="/dist/img/6d6c7bd.svg" alt="ToDesk" class="logo">`，即 `https://www.todesk.com/dist/img/6d6c7bd.svg` | 2026-11-07 curl 下载；sha256 见下 |
| 标志：网易 UU 远程 | `src/img/uu.png`（官网页头的浅色版横版标志「网易UU远程」，256×72 PNG） | 网易 UU 远程官网 `https://uuyc.163.com/` 页头 `https://uuyc.res.netease.com/pc/gw/20241129172408/img/logo_light_134a4fbb.png` | 2026-11-07 curl 下载；sha256 见下 |
| 主色、辅色 | | | |
| 字体 | | | |
| 官方部件（界面、文档里的表格、提示框等） | | | |
| 真实界面或输出的截图（已脱敏） | | | |

文件校验：`src/img/todesk.svg` 与 `src/img/uu.png` 的 sha256 记在本片提交说明与下方。两件标志是各自所有者的商标，只用于指明片中所讲的对象，不随本仓库的 GPL 许可授出（`docs/reference/third-party.md`「商标」）。

## 策划者对视觉与声音的明确要求

<!-- 原话与日期；没有就写「无」。 -->

- 2026-11-07：「风格契合"MS Windows"的感觉哈」；选定「磁贴」（Metro）视觉与配乐。
- 2026-11-07（预览 r1 之后）：「ToDesk和UU远程要有Logo」；「目前样式和效果总体而言展示的简陋 需要优化」。

```
63d49a260f8db0f51337a87292e0d8c417d7c64fe8d202371b2c6c90e70258e3 src/img/todesk.svg
9bd2645fef2b730b92831ad9712d5f19b7f29fe8bda41a374a158cb0bbb1425c src/img/uu.png
```
