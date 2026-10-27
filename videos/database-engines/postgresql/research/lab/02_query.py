"""02 查。

同一张表（pglab.build）ANALYZE 之后：
1. 几种查询的执行计划（EXPLAIN ANALYZE BUFFERS，不计时间以便复现）：按编号、按名字、按年龄、编号范围、全表计数，
   以及只取编号、只取名字（仅索引扫描）——和 InnoDB 对照：InnoDB 的二级索引里带主键，PostgreSQL 的索引里只有键与行地址。
2. 冷缓存的路径：每次查询前重启集群（共享缓冲区清空），查完用 pg_buffercache 列出这几个对象被读进缓冲区的页号。
3. 仅索引扫描与可见性映射：VACUUM 前后各跑一次 SELECT name … WHERE name = 'Alice'，看 Heap Fetches。
用法：python 02_query.py
"""
from pglab import Lab, build

RELS = "('users', 'users_pkey', 'idx_name', 'idx_age')"
EXPLAIN = 'EXPLAIN (ANALYZE, BUFFERS, TIMING OFF, SUMMARY OFF) '
QUERIES = {
    'by_id': "SELECT * FROM users WHERE id = 2050",
    'by_name': "SELECT * FROM users WHERE name = 'Alice'",
    'by_age': "SELECT * FROM users WHERE age = 42",
    'id_range': "SELECT * FROM users WHERE id BETWEEN 2000 AND 2100",
    'count_all': "SELECT count(*) FROM users",
    'id_by_name': "SELECT id FROM users WHERE name = 'Alice'",
    'name_by_name': "SELECT name FROM users WHERE name = 'Alice'",
}

with Lab('02_query') as lab:
    a = lab.conn('admin'); q = lab.q
    build(lab, a)
    q(a, 'ANALYZE users', tag='analyze')
    q(a, "SELECT relname, relpages, reltuples FROM pg_class WHERE relname IN " + RELS + " ORDER BY relname")
    plans = {}
    for k, sql in QUERIES.items():
        plans[k] = [r['QUERY PLAN'] for r in q(a, EXPLAIN + sql, tag='plan ' + k)]
    lab.r['plans_before_vacuum'] = plans

    # ── 冷缓存的路径 ──
    paths = {}
    for k in ('by_id', 'by_name', 'count_all'):
        lab.stop(); lab.start()
        c = lab.conn('cold-' + k)
        q(c, "SELECT count(*) AS n FROM pg_buffercache b JOIN pg_class r ON b.relfilenode = r.relfilenode WHERE r.relname IN " + RELS, tag='cold check ' + k)
        plan = [r['QUERY PLAN'] for r in q(c, EXPLAIN + QUERIES[k], tag='cold plan ' + k)]
        pages = q(c, "SELECT r.relname, b.relforknumber AS fork, array_agg(b.relblocknumber ORDER BY b.relblocknumber) AS blocks, count(*) AS n "
                     "FROM pg_buffercache b JOIN pg_class r ON b.relfilenode = r.relfilenode WHERE r.relname IN " + RELS +
                     " GROUP BY 1, 2 ORDER BY 1, 2", tag='cold pages ' + k)
        paths[k] = {'plan': plan, 'pages': pages}
    lab.r['cold_paths'] = paths

    # ── 仅索引扫描与可见性映射 ──
    c = lab.conn('vm')
    q(c, "SELECT * FROM pg_visibility_map_summary('users')", tag='vm before vacuum')
    before = [r['QUERY PLAN'] for r in q(c, EXPLAIN + QUERIES['name_by_name'], tag='ios before vacuum')]
    q(c, 'VACUUM users', tag='vacuum')
    q(c, "SELECT * FROM pg_visibility_map_summary('users')", tag='vm after vacuum')
    after = [r['QUERY PLAN'] for r in q(c, EXPLAIN + QUERIES['name_by_name'], tag='ios after vacuum')]
    after_id = [r['QUERY PLAN'] for r in q(c, EXPLAIN + QUERIES['id_by_name'], tag='id by name after vacuum')]
    lab.r['index_only'] = {'before_vacuum': before, 'after_vacuum': after, 'id_by_name_after_vacuum': after_id}

    for k, p in plans.items():
        print('==', k); print('\n'.join(p))
    for k, v in paths.items():
        print('== cold', k, [(r['relname'], r['fork'], r['blocks'] if r['n'] < 12 else f"{r['n']} pages") for r in v['pages']])
    print('== ios before\n' + '\n'.join(before)); print('== ios after\n' + '\n'.join(after))
