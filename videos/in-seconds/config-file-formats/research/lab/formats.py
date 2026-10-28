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
# 全片主画面用的完整示例：server 里套一层 db
XML2 = '<config><server><host>localhost</host><port>8080</port><db><user>app</user><port>5432</port></db></server></config>'
JSON2 = '{"server":{"host":"localhost","port":8080,"db":{"user":"app","port":5432}}}'
TOML2 = '[server]\nhost = "localhost"\nport = 8080\n\n[server.db]\nuser = "app"\nport = 5432\n'
WANT = {'server': {'host': 'localhost', 'port': 8080, 'db': {'user': 'app', 'port': 5432}}}
DATA2 = 'localhost8080app5432'
print('完整示例 XML 字符', nows(XML2), '数据', len(DATA2), '标签', nows(XML2) - len(DATA2))
print('完整示例 JSON 字符', nows(JSON2), json.loads(JSON2) == WANT, '| TOML', tomllib.loads(TOML2) == WANT)
Y2 = 'server:\n  host: localhost\n  port: 8080\n  db:\n    user: app\n{}port: 5432\n'
for n in (4, 3, 2):
    try: print('完整示例 YAML 末行缩进', n, '->', yaml.safe_load(Y2.format(' ' * n)))
    except yaml.YAMLError as e: print('完整示例 YAML 末行缩进', n, '->', type(e).__name__)
for name, doc in [('正确', 'server:\n  db:\n    port: 8080\n    host: a\n'),
                  ('少一个空格', 'server:\n  db:\n    port: 8080\n   host: a\n'),
                  ('少两个空格', 'server:\n  db:\n    port: 8080\n  host: a\n')]:
    try: print('YAML', name, '->', yaml.safe_load(doc))
    except yaml.YAMLError as e: print('YAML', name, '->', type(e).__name__)
