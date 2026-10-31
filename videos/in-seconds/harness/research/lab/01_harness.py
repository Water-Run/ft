#!/usr/bin/env python3
"""一个最小的 harness：把环境、工具清单和任务交给模型；模型要调用工具，就替它执行、把结果送回去；
直到模型的回复里不再有工具调用为止。

用法：DEEPSEEK_API_KEY=... python 01_harness.py [轮次标签]
  - 模型走 DeepSeek 的 OpenAI 兼容接口（/chat/completions），模型名取环境变量 LAB_MODEL，缺省 deepseek-flash。
  - 演示项目 demo/ 先复制到一个临时目录，工具只能碰这个目录里的文件；跑完删除临时目录。
  - 完整的请求与响应写进 out_01_harness<标签>.json，可读的过程写进 out_01_harness<标签>.txt。
    API key 只从环境变量读，不写进任何文件；工具输出里的临时目录路径替换成「.」。
只用标准库。
"""
import json, os, shutil, subprocess, sys, tempfile, time, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
API = 'https://api.deepseek.com/chat/completions'
MODEL = os.environ.get('LAB_MODEL', 'deepseek-flash')
TAG = sys.argv[1] if len(sys.argv) > 1 else ''
MAX_ROUNDS = 10

TASK = '测试没通过，帮我修好。'
TOOLS = [
    {'type': 'function', 'function': {
        'name': 'read_file', 'description': '读出项目里一个文件的全部内容',
        'parameters': {'type': 'object', 'properties': {'path': {'type': 'string', 'description': '文件名，如 cart.py'}}, 'required': ['path']}}},
    {'type': 'function', 'function': {
        'name': 'edit_file', 'description': '把文件里的一段文字换成另一段',
        'parameters': {'type': 'object', 'properties': {
            'path': {'type': 'string', 'description': '文件名'},
            'old': {'type': 'string', 'description': '要替换的原文，必须与文件里的一段完全相同'},
            'new': {'type': 'string', 'description': '替换成的文字'}}, 'required': ['path', 'old', 'new']}}},
    {'type': 'function', 'function': {
        'name': 'run_tests', 'description': '运行项目的测试（python test_cart.py），返回输出',
        'parameters': {'type': 'object', 'properties': {}}}},
]


def post(body):
    req = urllib.request.Request(API, data=json.dumps(body, ensure_ascii=False).encode('utf-8'), method='POST', headers={
        'Content-Type': 'application/json', 'Authorization': 'Bearer ' + os.environ['DEEPSEEK_API_KEY']})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode('utf-8'))


def make_tools(work):
    def inside(path):
        p = os.path.normpath(os.path.join(work, path))
        if os.path.dirname(p) != os.path.normpath(work):
            raise ValueError('只能访问项目目录里的文件：' + path)
        return p

    def read_file(path):
        with open(inside(path), encoding='utf-8') as f:
            return f.read()

    def edit_file(path, old, new):
        p = inside(path)
        with open(p, encoding='utf-8') as f:
            text = f.read()
        if text.count(old) != 1:
            return f'没有改动：原文在 {path} 里出现了 {text.count(old)} 次，应当恰好 1 次'
        with open(p, 'w', encoding='utf-8', newline='\n') as f:
            f.write(text.replace(old, new))
        return f'已修改 {path}'

    def run_tests():
        env = dict(os.environ, PYTHONIOENCODING='utf-8', PYTHONUTF8='1')
        r = subprocess.run([sys.executable, 'test_cart.py'], cwd=work, capture_output=True, env=env)
        out = (r.stdout + r.stderr).decode('utf-8').replace(work, '.')
        return f'退出码 {r.returncode}\n{out}'

    return {'read_file': read_file, 'edit_file': edit_file, 'run_tests': run_tests}


def main():
    work = tempfile.mkdtemp(prefix='harness-demo-')
    for name in sorted(os.listdir(os.path.join(HERE, 'demo'))):
        if name.endswith('.py'):
            shutil.copy(os.path.join(HERE, 'demo', name), work)
    tools = make_tools(work)
    files = '、'.join(sorted(n for n in os.listdir(work) if n.endswith('.py')))
    system = f'你是一个编程助手，可以用工具读写当前项目里的文件、运行测试。当前项目里的文件：{files}。修好之后，用一句话说明你改了什么。'
    messages = [{'role': 'system', 'content': system}, {'role': 'user', 'content': TASK}]
    trace = {'model': MODEL, 'api': API, 'date_utc': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
             'python': sys.version.split()[0], 'tools': TOOLS, 'rounds': []}
    lines = [f'模型 {MODEL}　{trace["date_utc"]}', f'[system] {system}', f'[user] {TASK}']
    try:
        for n in range(1, MAX_ROUNDS + 1):
            body = {'model': MODEL, 'messages': messages, 'tools': TOOLS, 'temperature': 0}
            request_bytes = len(json.dumps(body, ensure_ascii=False).encode('utf-8'))
            sent = len(messages)   # 先记下：body 和 messages 是同一个列表，下面追加回复后再数会多 1
            resp = post(body)
            choice = resp['choices'][0]
            msg = choice['message']
            rnd = {'round': n, 'request': json.loads(json.dumps(body)), 'request_bytes': request_bytes,
                   'response': resp, 'tool_results': []}
            keep = {'role': 'assistant', 'content': msg.get('content') or ''}
            if msg.get('reasoning_content'):
                keep['reasoning_content'] = msg['reasoning_content']
            if msg.get('tool_calls'):
                keep['tool_calls'] = msg['tool_calls']
            messages.append(keep)
            u = resp.get('usage', {})
            lines.append(f'── 第 {n} 次请求：{sent} 条消息，{request_bytes} 字节；'
                         f'prompt_tokens {u.get("prompt_tokens")}，completion_tokens {u.get("completion_tokens")}；finish_reason {choice.get("finish_reason")}')
            if msg.get('content'):
                lines.append(f'[assistant] {msg["content"]}')
            for call in msg.get('tool_calls') or []:
                fn = call['function']
                args = json.loads(fn['arguments'] or '{}')
                try:
                    result = tools[fn['name']](**args)
                except Exception as e:  # 工具出错也作为结果交回模型
                    result = f'出错：{e}'
                rnd['tool_results'].append({'tool_call_id': call['id'], 'name': fn['name'], 'arguments': args, 'result': result})
                messages.append({'role': 'tool', 'tool_call_id': call['id'], 'content': result})
                lines.append(f'[tool_call] {fn["name"]}({fn["arguments"]})')
                lines.append('[tool_result] ' + result.rstrip('\n').replace('\n', '\n              '))
            trace['rounds'].append(rnd)
            if not msg.get('tool_calls'):
                break
        # harness 自己再跑一遍测试，并留下改动后的文件
        trace['after'] = {name: tools['read_file'](name) for name in sorted(os.listdir(work)) if name.endswith('.py')}
        trace['final_check'] = tools['run_tests']()
        lines.append('── harness 复查：' + trace['final_check'].replace('\n', ' ').strip())
    finally:
        shutil.rmtree(work, ignore_errors=True)
    with open(os.path.join(HERE, f'out_01_harness{TAG}.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(trace, f, ensure_ascii=False, indent=1)
        f.write('\n')
    with open(os.path.join(HERE, f'out_01_harness{TAG}.txt'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(lines) + '\n')
    print('\n'.join(lines))


if __name__ == '__main__':
    main()
