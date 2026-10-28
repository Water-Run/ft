# 取证实验：同一段配置在五种格式里的写法与字符数；YAML 缩进与 NO 的解析行为。
# 运行：python research/lab/formats.py（需要 PyYAML；Python 3.11+ 自带 tomllib）
import json, re, tomllib, yaml

XML = '<config><server><port>8080</port><host>localhost</host></server></config>'
JSON = '{"server":{"port":8080,"host":"localhost"}}'
TOML = '[server]\nport = 8080\nhost = "localhost"\n'
DATA = '8080localhost'
nows = lambda s: len(re.sub(r'\s', '', s))
print('XML 字符', nows(XML), '数据', len(DATA), '标签', nows(XML) - len(DATA))
print('JSON 字符', nows(JSON), json.loads(JSON))
print('TOML', tomllib.loads(TOML), tomllib.loads('[server.db]\nport = 8080\n'))
print('YAML NO ->', yaml.safe_load('country: NO'))
for name, doc in [('正确', 'server:\n  db:\n    port: 8080\n    host: a\n'),
                  ('少一个空格', 'server:\n  db:\n    port: 8080\n   host: a\n'),
                  ('少两个空格', 'server:\n  db:\n    port: 8080\n  host: a\n')]:
    try: print('YAML', name, '->', yaml.safe_load(doc))
    except yaml.YAMLError as e: print('YAML', name, '->', type(e).__name__)
