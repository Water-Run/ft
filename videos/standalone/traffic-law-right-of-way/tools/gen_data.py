"""Generate illustrative scenario inputs, never measured road data.

Input: tracked research/lab/cases.json; no ignored source snapshots required.
Run from any directory. The output has no wall-clock timestamp and is deterministic.
"""
from hashlib import sha256
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]


def render():
    raw = (ROOT/'research/lab/cases.json').read_bytes()
    data = json.loads(raw)
    payload = {'input_sha256':sha256(raw).hexdigest(),**data}
    return ('// 由 tools/gen_data.py 生成，不要手改。教学示意，不是实测道路数据。\n'
            '(function (root) {\n  const data = ' + json.dumps(payload,ensure_ascii=False,indent=2) + ';\n'
            '  if (typeof module !== "undefined" && module.exports) module.exports = data;\n'
            '  else root.ROAD_CASES = data;\n})(globalThis);\n').encode('utf-8')


if __name__ == '__main__':
    output = render()
    (ROOT/'src/js/data.js').write_bytes(output)
    print('src/js/data.js sha256=' + sha256(output).hexdigest())
