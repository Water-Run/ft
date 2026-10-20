# 仓库结构

目录按三个层级划分：仓库级（所有片子共用的规则与工具）、系列级、视频级。`videos/` 下第一层是系列（以及放独立片子的 `standalone`），第二层是片子；slug 全仓库唯一，片子属于哪个系列以片单的 `series` 字段为准，目录与它一致。每一类信息只放在一个地方，见 [文档地图](../README.md) 的「信息归属」。

## 1. 目录

```text
ft/
  README.md                  项目介绍与入口
  AGENTS.md                  模型在这里工作的入口：角色、边界、去哪里读
  CONTRIBUTING.md            参与方式与验证
  SECURITY.md                问题报告与公开材料处理
  LICENSE                    GPL-3.0-or-later
  package*.json              JS 依赖、锁文件与常用命令
  .github/                   自动检查、问题和 PR 模板
  docs/                      仓库级规则（见文档地图）
    log/                     只追加的历史：反馈记录、测绘、旧排期、大事记
  kit/
    studio.json              策划、校对者与源码仓库（独立 fork 改这里）
    engine/                  引擎：新片拷贝一份快照
    template/                新片的骨架
    starters/<名字>/         系列的起点代码
    tools/                   工具（Node 入口，部分调用 Python）
    tests/                   隔离仓库中的回归测试
    config.local.example.json 本机可执行程序位置的样例
    requirements*.txt        Python 依赖范围
    assets.json              字体等的下载来源与校验和
  videos/
    catalog.json             片单：全部系列与视频的唯一登记
    README.md                片单索引（生成）
    <系列>/
      README.md              系列说明
      <片>/                  系列里的一集
    standalone/
      <片>/                  独立的片子
  assets/                    本机字体与二进制依赖，不入库
  out/                       本机的练习目录与临时产物，不入库
```

根目录只放上面这些；`repo-check.js` 拒绝多出来的顶层目录与文件。

## 2. 一部片子的目录

```text
videos/<系列或 standalone>/<片>/
  README.md        状态、简报、交接、设计、交付、评价与复盘、复现
  project.json     配置与记录：语言、配音、检查阈值；阶段 stage / next；署名 credits；交付 delivery；发布 release；评价 reception
  research/
    FACTS.md       事实与出处，本片唯一的事实来源
    MATERIALS.md   讲解对象自己的视觉与声音材料（可选）
    lab/           实验脚本与完整回显（已脱敏）
    _src/          第三方源码与安装包，不入库
  review/
    script.<语言>.<哈希>.md   导出的校对稿（工具生成，不手改）
    NOTES.md       交审说明、逐条意见、修改回应、确认记录
    approval.json  确认状态与内容哈希
    lessons.json   经验规则的逐条复核结论
  src/             画面源码：index.html、css/、js/（script.js、timing.*.js、config.js、scenes/）、cover.html、design/
  tools/           本片的数据生成（gen_data.py）、配乐（music.py）等
  expect.<语言>.json  每句说完时画面上必须有的文字（可选）
  audio/ out/ shots/ build/   生成物，不入库
```

新片（`project.json` 的 `layout` 为 2）只放这些；`repo-check.js` 拒绝多出来的文件，例如每片的 `AGENTS.md`、`brief/`、`DELIVERY.md`——任务入口是根目录的 `AGENTS.md`，简报、交接与交付说明都在 README 里。2026-10-20 之前开工的片子保留各自当时的结构，不追改。

运行时不依赖另一部片子的目录。引擎是立项时拷入的快照，之后升级 `kit/engine/` 不影响已有的片子。

## 3. 生成的文件

| 文件 | 由谁生成 | 源头 |
|---|---|---|
| `videos/README.md`、各系列说明（`videos/<系列>/README.md`）的分集表 | `catalog.js` | `videos/catalog.json` 与各片 `project.json` |
| `docs/lessons.md` 的规则表 | `lessons.js render` | `docs/lessons.json` |
| `review/script.*.md` | `script-review.js export` | `src/js/script.js` |
| `src/js/timing.*.js` | `tts.js` | 旁白与实际合成结果 |
| `src/js/data.js` | 本片 `tools/gen_data.py` | `research/lab/` 的回显与产物 |

生成的文件开头注明来源，不手改；改源头再重新生成。已发布链接、评分、看过听过的结论不由工具猜测，由人或制作者据实写入。

## 4. 维护

```sh
npm test
npm run check:repo
```

前者在隔离的临时仓库里验证新建、校对、经验规则、清理归档恢复、路径边界与制作锁；后者检查入库边界、根目录、经验规则与反馈记录的编号、依赖锁、工具语法、文档登记与链接、视频目录、片单与署名。它们不检查网络链接、片中事实或成片观感。模板、浏览器或引擎相关的改动另跑 `npm run smoke`。

CI 覆盖 Windows、Linux、macOS 与 Node 22.12 / 24。共享规则修改遵循「文档 → 模板 → 工具 → 测试」的对应关系，规则见 [文档地图](../README.md) 第 5 节。
