"""按 2026-10-20.2 的规则补 F20，并按承上启下的要求调整 F01 与 F10。

用法：python 13_patch_feedback.py <视频目录>
"""

import json
import os
import sys

PATCH = {
    "F01": {
        "plan": "全片只回答一个问题：Firebird 的引擎为什么能既是服务端又是嵌入式。开场 o1–o6 直接抛出反直觉的现象（服务端可以整个关掉），不铺历史；历史压到第 01 章三句（h1–h6）。主骨架是 engine/modes 两章：先讲「引擎是库、服务端是壳」，再用「停掉服务端，只有嵌入式还活着」这个实测把形态差异变成可验证的事实。store/update/concur/durable 四章是这套形态带来的机制后果，outro 用系列的四个老问题收束并说出与 MySQL、PostgreSQL 的对照，next 引出 SQLite。每一段都服务于「形态差异」这一条线。不开选型比较章，不列功能清单，不逐集回顾前两集。",
        "script_evidence": "src/js/script.js 场景顺序 open → history → engine → modes → store → update → concur → durable → outro → next；engine 12 句（e1–e12）、modes 9 句（m1–m9）为主干；outro z1–z8 逐条回答「怎么放/怎么找/怎么改/怎么并发/出错怎么办」，z7 给出与 MySQL、PostgreSQL 的对照；next n1–n4 把三个形态排成一条轴。",
    },
    "F10": {
        "plan": "本集独立可懂，不靠观众记住前集。开场 o5–o5a 只点名 MySQL 与 PostgreSQL（自足的事实陈述，没看过前集的人也懂）；其余章节直接提出本章的问题（数据怎么放、一次修改、怎么并发、出错怎么办），不出现「上一期第几个问题」这类导航。收尾的四个问题按本系列统一提法列出（放/找/改/并发/出错）；唯一与前集有关的两句是 z7（它们的引擎住在服务端进程里）与 z3–z4 的形态轴（服务型 → 库型 → 嵌入型），都只依赖本片已给出的事实与系列自己的路线（FACTS 的 C01、C03）。前集的对照依据留在本片 FACTS 与 README，不逐集回顾前两集讲了什么。",
        "script_evidence": "src/js/script.js 的 o5–o5a（点名）、d1–d9/u1–u8/c1–c10/w1–w6（每章自带问题）、z1–z8（系列统一提法 + 与 MySQL/PostgreSQL 的一句对照）、n1–n4（形态轴与 SQLite）；research/FACTS.md 的 C01–C03。",
    },
    "F16": {
        "plan": "适用，**本片的硬要求**。视觉严格取自 Firebird 自己的材料：官网火鸟标志的实测三色（金 #FAAC19 / 橙 #F68A21 / 红 #EE2B24，由标志位图的像素统计得出）、官网正文墨色 #17222b 与同款拉丁字体 Heebo（OFL，随片放在 src/type/）；再加上 Firebird 自己的语汇（isql 的 SQL>、MON$ 监控表字段、.fdb 的页结构、页类型的官方编号与名称）。这些材料与出处写进 research/STYLE.md，色板锁在 project.json 的 check.style.palette（闸门按字面比对），字体要求写进 brief/03-visual.md。**怎么用这些材料、怎么设计版面与图形语言，归受托方**——准备方不预置方案（docs/delegation.md 的「准备方不替受托方做审美方案」）。postgresql 一集是 F16 的正面对照。",
        "script_evidence": "research/STYLE.md 第 1 节（材料与实测值的出处表）；research/lab/out_09_logo_colors.txt（标志配色统计）；project.json 的 check.style.palette；brief/03-visual.md 第 1 节；src/type/Heebo-wght.ttf 与 src/type/OFL-Heebo.txt。",
    },
    "F18": {
        "plan": "适用。PostgreSQL 一集因为「动画过于简陋、缺乏视觉冲击力」被记为 P31，本片按它开工。要求：每章定一个以 Firebird 自己的对象为主角、观众看完能说出名字的主画面；表格逐行出现、文字高亮、淡入这类最小动作只能作辅助；不靠镜头晃动或特效堆叠充数。**具体用哪个对象、怎么动、什么节奏由受托方决定**；准备方在 brief/04-storyboard.md 里逐段给出「这一段要让观众明白什么」与「必须出现的真实数值」，在 src/js/scenes/ 的骨架文件里也各写了一句目标，由受托方实现。",
        "script_evidence": "src/js/scenes/ 下十一个骨架文件里各自写明的这一段目标；brief/04-storyboard.md 的逐场景表与「每章一个主画面」的要求；src/js/script.js 的 u4–u7、c3–c6、d7–d9、w3–w6 这些有明确「看得见」落点的段落。",
    },
    "F20": {
        "plan": "适用（2026-10-20.2 新增）。本片有大量「同一个对象的多个状态」要画（同一行数据的新旧两份副本、两个会话的读数、页与页类型、服务端与引擎），最容易出「空框充数」和「形状换含义」。做法：每个图形必须能指出它对应哪一句旁白里的哪个对象——页、页类型、事务清单、版本链、两个读数板、服务端外壳、引擎库、三个二进制，各有且只有一个含义，全片不换用；形状语义与颜色语义的对应表由受托方在 `brief/storyboard-detail.md` 里写下来并全片遵守。不用几何姿态（倾倒、旋转、堆叠、漂移）代替因果说明：副本为什么多一份、读数为什么从 30 变 31，都要靠「页上真的多了一份」「提交之后读数才变」这类在场的事实表达，不靠图形摆姿势。图形在旁白讲到它时已经在场，讲完才退场。",
        "script_evidence": "src/js/script.js 的 u4–u7（页上多出一份副本）、c3–c6（两个会话的读数）、d3–d9（页与页类型）、e1–e9（外壳、引擎与三个二进制）、w3–w6（服务端里的两个角色）；src/js/scenes/ 下十一个骨架文件里各自写明这一段要让观众明白什么。",
    },
}


def main():
    video = sys.argv[1]
    path = os.path.join(video, "review", "feedback.json")
    with open(path, encoding="utf-8") as fh:
        state = json.load(fh)

    for item in state["items"]:
        patch = PATCH.get(item["id"])
        if not patch:
            continue
        for key, value in patch.items():
            item[key] = value
        item["applicability"] = "applies"
        item["reason"] = ""
        item["result"] = "pending"
        item["verification"] = ""
        item["clips"] = []

    with open(path, "w", encoding="utf-8") as fh:
        json.dump(state, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    print("已补：", ", ".join(PATCH))


if __name__ == "__main__":
    main()
