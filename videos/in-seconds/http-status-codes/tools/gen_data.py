# 画面数据：从本片的实验回显 research/lab/out_11_status_codes.txt 生成 src/js/data.js。画面上的命令、状态行与头字段都取自这里，不手写。
# 用法（在本片目录下）：python tools/gen_data.py
# 回显按「== 标题」分段；每段第一行是 curl 命令，其后是响应（可能有两个：100 Continue 之后的最终响应）。
# 输出 window.ECHO = { 键: { title, cmd, status: [状态行…], head: [头字段…], body: [正文…] } }；
# 键是状态码，同一个码出现多次时按出现顺序加后缀：404（源站）、404b（经网关）；403、403b（带有效凭据）；200、200b（凭据与权限都够）……
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'research', 'lab', 'out_11_status_codes.txt')
OUT = os.path.join(HERE, '..', 'src', 'js', 'data.js')

text = open(SRC, encoding='utf-8').read().replace('\r\n', '\n')
blocks = re.split(r'^== ', text, flags=re.M)[1:]
echo, seen = {}, {}
for b in blocks:
    lines = b.split('\n')
    title = lines[0].strip()
    if not lines[1].startswith('$ curl'):
        continue                                  # 「环境」一段
    cmd = lines[1][2:]
    rest = lines[2:]
    status, head, body, part = [], [], [], 'head'
    for ln in rest:
        if ln.startswith('HTTP/'):
            status.append(ln); part = 'head'; continue
        if ln == '':
            part = 'body' if part == 'head' else part; continue
        (head if part == 'head' else body).append(ln)
    code = status[-1].split(' ')[1]
    n = seen.get(code, 0); seen[code] = n + 1
    key = code + ('' if n == 0 else 'abcdefgh'[n])
    echo[key] = {'title': title, 'cmd': cmd, 'status': status, 'head': head, 'body': [x for x in body if x]}

with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    f.write('// 由 tools/gen_data.py 从 research/lab/out_11_status_codes.txt 生成，不要手改。\n')
    f.write('window.ECHO = ' + json.dumps(echo, ensure_ascii=False, indent=1) + ';\n')
print('写入', os.path.relpath(OUT), '：', ' '.join(echo))
