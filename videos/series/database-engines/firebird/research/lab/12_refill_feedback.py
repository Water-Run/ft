"""把 feedback.json 里被 sync 置回 pending 的三项重新填上。

feedback.js sync 会保留内容未变的项；规则文本变过的项会置回 pending，
要求按新规则重新应用。这个脚本只改指定的三项，其余原样保留。

用法：python 12_refill_feedback.py <视频目录>
"""

import json
import os
import sys

FILL = {
    "F05": {
        "applicability": "applies",
        "reason": "",
        "plan": "适用。运动只用来表达关系，不用来凑动态：外壳（灰框）与引擎（黑框 + 火焰）分开，火焰从方框里升起表示「引擎在库里、外壳在外面」；火苗分成三股表示提供程序按顺序试；库文件按页切分并按类型上色表示页的分布；数据页上同一个 alice 的两份副本在画面上分处两地并各自标注；两会话的读数是两块并排的读数板，值变化时只换数字。整屏刷换只留给章节卡一处，解释段不换面板。",
        "script_evidence": "src/js/script.js 的 e3–e9（外壳与引擎的关系）、e11–e12（提供程序分流）、u4–u7（两份副本）、c4–c6（两块读数板）；src/css/style.css 的 .shell / .engine / .flame-mark / .dbfile / .pgbox 部件；src/js/config.js 的章节卡换场是唯一的整屏刷换。",
    },
    "F09": {
        "applicability": "applies",
        "reason": "",
        "plan": "适用。每一句陈述在 research/FACTS.md 里都有编号与出处，分为实验、源码、官方文档三路：实测值（页大小 8192、240 页、87 个数据页、1 → 2 个副本、1,900,254 字节偏移、三个二进制的体积）、官方文档的结论（提供程序链、行版本与回收）、源码常量（页类型编号）三类分开标注。历史只取公开可查的三件事（2000 年公开源码、2002 年 3 月 11 日发布 1.0、今天 5.0.4），来源互相印证。行版本头的字段布局没有逐字段核实，因此不进旁白也不进画面。策划者意见、观众评论与模型推断都不作为片中事实的依据；本片尚无发布后的反馈可引。",
        "script_evidence": "research/FACTS.md 的 T/H/E/D/U/M/W/V/S 编号（每条含陈述与出处两列）；src/js/script.js 每条 cue 的 facts 字段指向这些编号；research/FACTS.md 第 10 节列出查到但不讲的材料。",
    },
    "F10": {
        "applicability": "applies",
        "reason": "",
        "plan": "适用。本集独立可懂，不靠观众记住前集。开场 o5 只说「两个开源巨头之外，一个更小众的选择」，不解释那两个巨头是谁；其余章节直接提出本章的问题（数据怎么放、一次修改、怎么并发、出错怎么办），不出现「上一期第几个问题」这类导航。收尾的四个问题按本系列统一提法列出（放/找/改/并发/出错），但不逐条对照前两集的答案。唯一的跨集内容是收尾引出 SQLite——那是本系列自己的下一集顺序，不是对前集的回顾。",
        "script_evidence": "src/js/script.js 的 o5（只作位置交代）、d1–d9/u1–u8/c1–c10/w1–w6（每章自带问题）、z1–z6（只列本系列统一提法，不点前集）、n1–n4（引出下一集）。",
    },
}


def main():
    video = sys.argv[1]
    path = os.path.join(video, "review", "feedback.json")
    with open(path, encoding="utf-8") as fh:
        state = json.load(fh)

    for item in state["items"]:
        fill = FILL.get(item["id"])
        if not fill:
            continue
        for key, value in fill.items():
            item[key] = value
        item["result"] = "pending"
        item["verification"] = ""
        item["clips"] = []

    with open(path, "w", encoding="utf-8") as fh:
        json.dump(state, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    print("已重填：", ", ".join(FILL))


if __name__ == "__main__":
    main()
