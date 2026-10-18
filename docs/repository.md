# 仓库结构与维护约定

目录按“共享制作能力、逐片源码、公开制作记录、本机生成物”划分。新使用者从根 README 进入；具体制作遵循 [workflow.md](workflow.md)，文案校对和收尾分别见 [script-review.md](script-review.md)、[lifecycle.md](lifecycle.md)。

## 1. 目录职责

```text
ft/
  README.md                  中文项目介绍、入门入口、作品索引
  AGENTS.md                  Agent 按任务选文档的入口
  CONTRIBUTING.md             贡献方式、验证与提交边界
  SECURITY.md                问题报告与公开材料处理
  LICENSE                    仓库许可
  package*.json              JS 依赖、锁文件与常用命令
  .github/                   自动检查、问题和 PR 模板
  docs/                      规范、教程、历史反馈和作品计划
  kit/
    studio.json              新片的公开策划、校对者与仓库默认值
    config.local.example.json 本机可执行程序位置的样例
    requirements*.txt        Python 依赖范围
    assets.json              下载来源与校验和
    engine/                  供新片拷贝的引擎
    template/                自制片骨架与校对、收尾记录
    delegation/              委托片覆盖模板
    tools/                   Node 入口及 Python 实现
    tests/                   隔离仓库中的回归测试
  videos/
    catalog.json             作品与计划的唯一结构化片单
    standalone/<slug>/       独立片
    series/<series>/         系列说明、可选 _base/ 和分集
  assets/                    本机字体与二进制依赖，忽略
  out/sandbox/               新使用者练习和浏览器验证，忽略
  out/reviews/               成片复盘的原始材料，忽略
```

现有影片目录和公开链接保持稳定。`src/` 下的引擎是立项时的快照；共享引擎升级只影响之后的新片，不批量替换历史作品。系列基座同样只在新建立项时拷贝。

仓库文档统一使用中文，不另维护英文译本。代码标识符、原始引用和影片本身的各语言稿本按实际用途保留；影片译文仍需逐句校对。

## 2. 每部片子自成一个项目

正式片子的所有源码、依据、审稿与输出均落在自己的目录中。新模板同时生成自制片的 AGENTS 入口；委托片用 `kit/delegation/` 覆盖入口并补任务书。完整文件树见 [tools.md](tools.md) 第 5 节。

新增文件时按用途放置：

- 内容事实进入 `research/FACTS.md`，实验与已脱敏回显进入 `research/lab/`。
- 对人的讨论、逐句意见和确认进入 `review/`，当前状态与接续说明进入 README。
- 动画进入 `src/`，一次性数据转换放入本片 `tools/`；运行时不依赖另一部片子的目录。
- 成片与缓存只进入四个生成物目录；复盘证据可归档，公开结论保留在源码记录中。
- 本机配置只写 `kit/config.local.json` 或环境变量；公开署名写 studio / project 配置，不能混在本机配置里。

## 3. 单一来源与生成文件

| 内容 | 唯一来源 | 派生产物 |
|---|---|---|
| 片单与系列顺序 | `videos/catalog.json` | `docs/catalog.md`、系列 README 中标记区间 |
| 文案 | 本片 `src/js/script.js` | 按内容哈希保存的校对稿、配音输入、字幕 |
| 事实 | 本片 `research/FACTS.md` 与对应证据 | 片中陈述、画面数据与说明 |
| 已确认的版本 | 人的明确确认，记录在 NOTES | `approval.json` 的一致性检查 |
| 持续制作反馈 | `docs/feedback.md` 的来源记录与 `feedback-rules.json` 的当前规则 | 新片 / 委托模板、每片 `review/feedback.json`、配音前和交付前检查 |
| 实测时间 | 实际旁白及 `timing.*.js` | 场景时间线、音效与混音安排 |
| 归档清单 | 对实际文件计算 | `manifest.json`，供恢复校验 |

生成文件开头注明来源。只有源码能推导出的表格才由工具生成；已发布链接、用户评价、观看与试听结论不得自动猜测。

## 4. 维护质量

```sh
npm test
npm run check:repo
```

前者验证新建、校对状态与内容变化、配音前拦截、清理归档恢复、路径边界和制作锁；后者检查工具语法、依赖锁一致、根目录与 docs 顶层文档的本地文件链接、入库边界、片单同步。它们不检查网络链接、片中事实或整片观感。

模板、浏览器和引擎相关改动另跑 `npm run smoke`，并按改动范围检查静帧、顺序播放与直接跳转。整部视频的自动与人工验收见 [review.md](review.md)，不能由仓库 CI 代替。

CI 配置覆盖 Windows、Linux、macOS 与 Node 22.12 / 24；真实通过情况以对应运行记录为准。依赖、浏览器或平台更新后发现差异时，先补一个能复现问题的隔离测试。Actions 的用法依据官方 [checkout](https://github.com/actions/checkout) 与 [setup-node](https://github.com/actions/setup-node) 文档；版本固定到提交，更新时同步核对。

共享规则修改遵循“文档 → 模板 → 工具 → 验证”的对应关系。质量门槛的调整须说明原因和受影响的作品；不把历史缺陷悄悄改写成已经解决。
