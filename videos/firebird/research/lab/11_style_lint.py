"""按 kit/tools/check.js 的同一条规则做一次本地 lint 预览。

check.js 在文案确认之前就退出，跑不到这里的样式检查；本脚本用同一套规则
（flat / no_radius / palette / no_emoji）先扫一遍，避免等到确认之后才发现版面违规。

用法：python 11_style_lint.py <视频目录>
"""

import json
import os
import re
import sys

RULES = [
    (re.compile(r"box-shadow|boxShadow|text-shadow|textShadow|drop-shadow"), "本片不用阴影（平涂）"),
    (re.compile(r"gradient\("), "本片不用渐变（平涂）"),
    (re.compile(r"blur\(|backdrop-filter|backdropFilter"), "本片不用模糊滤镜"),
    (re.compile(r"border-radius\s*:(?!\s*50%)|borderRadius\s*:\s*['\"`]?(?!\s*50%)"), "本片不用圆角（圆形 50% 除外）"),
    (re.compile(r"rgba?\(|hsla?\("), "颜色只用样式表里的变量，不写 rgb()/rgba()/hsl()"),
    (re.compile(r"[\U0001F000-\U0001FAFF☀-➿⬀-⯿]"), "本片不用 emoji 与装饰符号"),
]

HEX = re.compile(r"#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")
LINE_COMMENT = re.compile(r"(^|[^:\"'])//.*$")
BLOCK_COMMENT = re.compile(r"/\*.*?\*/")


def norm(h):
    return ("".join(c + c for c in h) if len(h) == 3 else h).upper()


def main():
    video = sys.argv[1]
    project = json.load(open(os.path.join(video, "project.json"), encoding="utf-8"))
    style = (project.get("check") or {}).get("style") or {}
    palette = [norm(c.replace("#", "")) for c in (style.get("palette") or [])]

    src = os.path.join(video, "src")
    files = []
    for root, _dirs, names in os.walk(src):
        for n in names:
            if n.endswith(".css") or n.endswith(".html") or n.endswith(".js"):
                files.append(os.path.join(root, n))
    files = [f for f in files if os.path.basename(f) in ("style.css", "base.css", "cover.html", "config.js")]

    problems = []
    for f in files:
        rel = os.path.relpath(f, src).replace("\\", "/")
        for i, line in enumerate(open(f, encoding="utf-8").read().splitlines(), 1):
            code = LINE_COMMENT.sub(r"\1", line)
            code = BLOCK_COMMENT.sub("", code)
            for re_, why in RULES:
                if re_.search(code):
                    problems.append("%s:%d  %s" % (rel, i, why))
            if palette:
                for m in HEX.finditer(code):
                    h = norm(m.group(1))
                    if h not in palette:
                        problems.append("%s:%d  颜色 #%s 不在本片的调色板里" % (rel, i, m.group(1)))

    print("扫描文件：", ", ".join(os.path.basename(f) for f in files))
    print("调色板：", palette or "(未设置)")
    if problems:
        print("发现 %d 处：" % len(problems))
        for p in problems:
            print("  " + p)
        sys.exit(1)
    print("样式检查通过：无渐变、阴影、模糊、圆角、rgb()/hsl() 与 emoji；颜色全部在调色板内。")


if __name__ == "__main__":
    main()
