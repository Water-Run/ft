"""Extract the demonstrated method and its output from the recorded Java run."""
# SPDX-License-Identifier: GPL-3.0-or-later
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
log = (ROOT / "research/lab/add.txt").read_text(encoding="utf-8")
method = log.split("static int add(int, int);", 1)[1].split("public static void main", 1)[0]
instructions = [[int(offset), name] for offset, name in re.findall(r"^\s*(\d+): (\w+)", method, re.M)]
source = (ROOT / "research/lab/Add.java").read_text(encoding="utf-8")
arguments = [int(value) for value in re.search(r"println\(add\((\d+), (\d+)\)\)", source).groups()]
output = int(log.rstrip().splitlines()[-1])
if [name for _, name in instructions] != ["iload_0", "iload_1", "iadd", "ireturn"] or sum(arguments) != output:
    raise ValueError("The recorded program no longer matches the storyboard.")

data = json.dumps(dict(instructions=instructions, arguments=arguments, output=output), ensure_ascii=False)
(ROOT / "src/js/data.js").write_text(
    "// 由 tools/gen_data.py 生成，不要手改。\nwindow.JAVA_DEMO = " + data + ";\n",
    encoding="utf-8", newline="\n",
)
