"""01 整体结构与「增」。

建系列共用的 users 表（主键、姓名、年龄三个索引），按注册顺序逐行插入 4096 行（每行一句、自动提交），
每插一行看一次堆与三棵 B 树的页数、根与层数，有变化就记下（树怎样长出来、什么时候分裂、什么时候长高）。
插完记整体结构：各对象的文件路径与大小、堆的页数与每页行数、Alice 的 ctid；每棵树各层的页；从根走到 Alice 的路径。
Alice 所在的堆页原样存进 pages/，用 pageinspect 与自写解析两路核对。最后做一次 VACUUM，看 FSM、VM 两个分支文件。
用法：python 01_build.py
"""
import os
import re
from pglab import Lab, LAB, build, parse_heap_page, flags, sha256

INDEXES = ['users_pkey', 'idx_name', 'idx_age']
PAGES = LAB / 'pages'
PAGES.mkdir(exist_ok=True)


def blk_of(tid: str) -> int:
    return int(re.match(r'\((\d+),', tid).group(1))


with Lab('01_build') as lab:
    a = lab.conn('admin'); q = lab.q
    q(a, 'SELECT version()')
    q(a, "SELECT name, setting, unit FROM pg_settings WHERE name IN ('server_version', 'server_version_num', 'block_size', 'data_checksums', "
         "'wal_segment_size', 'wal_block_size', 'shared_buffers') ORDER BY name")
    q(a, "SELECT oid, datname, datcollate, pg_encoding_to_char(encoding) AS encoding FROM pg_database WHERE datname = current_database()")
    def leaf_with(idx, tid):
        n = q(a, f"SELECT pg_relation_size('{idx}') / 8192 AS n", record=False)[0]['n']
        for b in range(1, n):
            st = q(a, f"SELECT type FROM bt_page_stats('{idx}', {b})", record=False)[0]
            if st['type'] != 'l':
                continue
            hit = q(a, f"SELECT itemoffset, ctid::text AS ctid, itemlen, htid::text AS htid, tids::text AS tids, data FROM bt_page_items('{idx}', {b}) "
                       f"WHERE htid = '{tid}' OR '{tid}' = ANY(tids)", record=False)
            if hit:
                return b, hit[0]
        return None, None

    # ── 逐行插入，记生长 ──
    size_sql = ("SELECT pg_relation_size('users') / 8192 AS heap, " + ', '.join(f"pg_relation_size('{i}') / 8192 AS \"{i}\"" for i in INDEXES))
    meta_sql = ' UNION ALL '.join(f"SELECT '{i}' AS idx, root, level, fastroot, fastlevel FROM bt_metap('{i}')" for i in INDEXES)
    events, prev = [], None

    def on_row(i):
        global prev
        sizes = q(a, size_sql, record=False)[0]
        meta = {m['idx']: {'root': m['root'], 'level': m['level']} for m in q(a, meta_sql, record=False)}
        key = (tuple(sizes.values()), tuple((m['root'], m['level']) for m in meta.values()))
        if key != prev:
            events.append({'row': i, 'pages': dict(sizes), 'meta': meta})
            prev = key
        if i == 2050:
            # Alice 刚插入时：她的行在哪一页，三棵树各把她放进哪一页叶子
            at = q(a, "SELECT ctid::text AS ctid, xmin::text AS xmin, * FROM users WHERE id = 2050", tag='alice just inserted')[0]
            lab.r['alice_at_insert'] = {'ctid': at['ctid'], 'xmin': at['xmin'], 'leaf': {}, 'rightmost_leaf': {}}
            for idx in INDEXES:
                lab.r['alice_at_insert']['leaf'][idx] = leaf_with(idx, at['ctid'])[0]
                lab.r['alice_at_insert']['rightmost_leaf'][idx] = q(a, f"SELECT blkno FROM generate_series(1, (pg_relation_size('{idx}') / 8192)::int - 1) AS b, "
                                                                      f"LATERAL bt_page_stats('{idx}', b) WHERE type = 'l' AND btpo_next = 0", record=False)[0]['blkno']
            lab.r['alice_at_insert']['heap_pages'] = q(a, "SELECT pg_relation_size('users') / 8192 AS n", record=False)[0]['n']

    build(lab, a, on_row)
    q(a, "SELECT c.relname, c.relkind, c.oid, c.relfilenode, pg_relation_filepath(c.oid) AS path FROM pg_class c "
         "WHERE c.relname IN ('users', 'users_pkey', 'idx_name', 'idx_age') ORDER BY c.oid")
    lab.r['growth'] = events
    lab.r['growth_sql'] = {'sizes': size_sql, 'meta': meta_sql, 'note': '每插一行执行一次，结果有变化才记'}

    # ── 插完：整体结构 ──
    q(a, 'CHECKPOINT')
    q(a, "SELECT count(*) AS rows, pg_relation_size('users') AS heap_bytes, pg_relation_size('users') / 8192 AS heap_pages FROM users")
    q(a, "SELECT (ctid::text::point)[0]::int AS blk, count(*) AS rows, min(id) AS first_id, max(id) AS last_id FROM users GROUP BY 1 ORDER BY 1", tag='rows per heap page')
    alice = q(a, "SELECT ctid::text AS ctid, xmin::text AS xmin, xmax::text AS xmax, id, name, length(name) AS len, octet_length(name) AS octets, age, "
                 "pg_column_size(name) AS name_size, pg_column_size(users.*) AS row_size FROM users WHERE id = 2050", tag='alice')[0]
    q(a, "SELECT ctid::text AS ctid, id, name, age, pg_column_size(name) AS name_size, pg_column_size(users.*) AS row_size FROM users WHERE id IN (1, 2049, 2051, 4096) ORDER BY id")
    for idx in ['users'] + INDEXES:
        q(a, f"SELECT '{idx}' AS rel, pg_relation_size('{idx}', 'main') AS main, pg_relation_size('{idx}', 'fsm') AS fsm, "
             f"pg_relation_size('{idx}', 'vm') AS vm, pg_relation_size('{idx}', 'init') AS init")

    trees = {}
    for idx in INDEXES:
        meta = q(a, f"SELECT * FROM bt_metap('{idx}')")[0]
        n = q(a, f"SELECT pg_relation_size('{idx}') / 8192 AS n")[0]['n']
        pages = q(a, f"SELECT s.* FROM generate_series(1, {n - 1}) AS b, LATERAL bt_page_stats('{idx}', b) AS s ORDER BY s.blkno", tag=f'{idx} pages')
        levels = {}
        for p in pages:
            levels.setdefault(p['btpo_level'], []).append(p['blkno'])
        root_items = q(a, f"SELECT itemoffset, ctid::text AS ctid, itemlen, data FROM bt_page_items('{idx}', {meta['root']})", tag=f'{idx} root items')
        b, item = leaf_with(idx, alice['ctid'])
        # 从叶子往上找父页：内部页里下指针（ctid 的块号）等于孩子的那一项
        path, child = [], b
        for lvl in range(1, meta['level'] + 1):
            for parent in levels.get(lvl, []):
                hit = [it for it in q(a, f"SELECT itemoffset, ctid::text AS ctid, data FROM bt_page_items('{idx}', {parent})", record=False) if blk_of(it['ctid']) == child]
                if hit:
                    path.insert(0, {'level': lvl, 'page': parent, 'item': hit[0]})
                    child = parent
                    break
        leaf_items = q(a, f"SELECT itemoffset, ctid::text AS ctid, itemlen, htid::text AS htid, tids::text AS tids, data FROM bt_page_items('{idx}', {b})", tag=f'{idx} alice leaf items')
        trees[idx] = {'meta': {k: meta[k] for k in ('root', 'level', 'fastroot', 'fastlevel', 'allequalimage')},
                      'pages_total': n, 'levels': {str(k): v for k, v in sorted(levels.items(), reverse=True)},
                      'leaf_live_items': sum(p['live_items'] for p in pages if p['type'] == 'l'),
                      'alice_leaf': b, 'alice_item': item, 'path_from_root': path, 'leaf_item_count': len(leaf_items)}
    lab.r['trees'] = trees
    lab.r['alice'] = alice

    # ── Alice 所在的堆页：原样存下，两路解析 ──
    blk = blk_of(alice['ctid'])
    raw = bytes.fromhex(q(a, f"SELECT get_raw_page('users', {blk}) AS raw", record=False)[0]['raw'].hex())
    page_file = PAGES / f'01_users_blk{blk}.page'
    page_file.write_bytes(raw)
    head = q(a, f"SELECT * FROM page_header(get_raw_page('users', {blk}))", tag='alice page header')[0]
    items = q(a, f"SELECT lp, lp_off, lp_flags, lp_len, t_xmin::text AS t_xmin, t_xmax::text AS t_xmax, t_field3, t_ctid::text AS t_ctid, "
                 f"t_infomask2, t_infomask, t_hoff, t_bits, t_data FROM heap_page_items(get_raw_page('users', {blk})) ORDER BY lp", tag='alice page items')
    mine = parse_heap_page(raw)
    checks = {'lower': mine['pd_lower'] == head['lower'], 'upper': mine['pd_upper'] == head['upper'], 'special': mine['pd_special'] == head['special'],
              'checksum': mine['pd_checksum'] == head['checksum'], 'lsn': mine['pd_lsn'] == str(head['lsn']).upper(),
              'item_count': len(mine['items']) == len(items)}
    same = True
    for m, p in zip(mine['items'], items):
        for k in ('lp_off', 'lp_flags', 'lp_len', 't_infomask2', 't_infomask', 't_hoff'):
            same &= m.get(k) == p[k]
        same &= str(m.get('t_xmin')) == p['t_xmin'] and m.get('t_ctid') == p['t_ctid'] and m.get('data_hex') == bytes(p['t_data']).hex()
    checks['items_equal'] = same
    # 缓冲区里的页不带校验和（写盘时才在副本上算）。再做一次检查点把这一页写回，从数据文件里直接读，再按内容重算核对
    q(a, 'CHECKPOINT', tag='checkpoint before reading the page from disk')
    path = q(a, "SELECT pg_relation_filepath('users') AS p", record=False)[0]['p']
    with open(lab.data / path, 'rb') as f:
        f.seek(blk * 8192); disk = f.read(8192)
    (PAGES / f'01_users_blk{blk}.disk.page').write_bytes(disk)
    want = q(a, f"SELECT page_checksum(decode(%s, 'hex'), {blk}) AS c", (disk.hex(),), record=False)[0]['c']
    dmine = parse_heap_page(disk)
    checks['disk_checksum_matches'] = (dmine['pd_checksum'] & 0xFFFF) == (want & 0xFFFF)
    checks['disk_equals_buffer_except_checksum'] = disk[:8] == raw[:8] and disk[10:] == raw[10:]
    diff = [i for i in range(8192) if disk[i] != raw[i]]
    lab.r['disk_vs_buffer_diff_offsets'] = diff[:64]
    lab.r['alice_page_on_disk'] = {'file': f'pages/01_users_blk{blk}.disk.page', 'sha256': sha256(disk), 'pd_checksum': dmine['pd_checksum'],
                                   'page_checksum()': want, 'note': '缓冲区里的页 pd_checksum 为 0；写盘时才在副本上算校验和'}
    a_item = next(m for m in mine['items'] if f"({blk},{m['lp']})" == alice['ctid'])
    lab.r['alice_page'] = {'blk': blk, 'file': page_file.relative_to(LAB).as_posix(), 'sha256': sha256(raw), 'bytes': len(raw),
                           'header': {k: mine[k] for k in mine if k != 'items'}, 'line_pointers': len(mine['items']),
                           'alice_item': {**a_item, 'flags': flags(a_item['t_infomask'], a_item['t_infomask2'])}, 'checks': checks}

    # ── 分支文件：VACUUM 前后 ──
    dboid = q(a, 'SELECT oid FROM pg_database WHERE datname = current_database()', record=False)[0]['oid']
    nodes = {r['relname']: str(r['relfilenode']) for r in q(a, "SELECT relname, relfilenode FROM pg_class WHERE relname IN ('users', 'users_pkey', 'idx_name', 'idx_age')", record=False)}

    def files():
        d = lab.data / 'base' / str(dboid)
        out = {}
        for rel, node in nodes.items():
            out[rel] = {f: os.path.getsize(d / f) for f in sorted(os.listdir(d)) if f == node or f.startswith(node + '_') or f.startswith(node + '.')}
        return out
    lab.r['files_before_vacuum'] = files()
    q(a, "SELECT * FROM pg_visibility_map_summary('users')", tag='vm before vacuum')
    q(a, 'VACUUM (VERBOSE) users', tag='vacuum')
    lab.r['files_after_vacuum'] = files()
    q(a, "SELECT * FROM pg_visibility_map_summary('users')", tag='vm after vacuum')
    q(a, "SELECT blkno, avail FROM pg_freespace('users') ORDER BY blkno", tag='fsm after vacuum')
    q(a, f"SELECT * FROM pg_visibility('users', {blk})", tag='alice page visibility')

    per_page = next(r['rows'] for r in lab.r['queries'] if r.get('tag') == 'rows per heap page')
    print('heap pages', len(per_page), 'rows/page', sorted({p['rows'] for p in per_page}), 'last page', per_page[-1])
    print('alice', alice['ctid'], 'xmin', alice['xmin'], 'row_size', alice['row_size'], 'name_size', alice['name_size'])
    for idx, t in trees.items():
        print(idx, 'pages', t['pages_total'], 'levels', {k: len(v) for k, v in t['levels'].items()}, 'root', t['meta']['root'], 'alice leaf', t['alice_leaf'],
              'path', [(p['level'], p['page']) for p in t['path_from_root']])
    print('alice page', blk, 'lower/upper', mine['pd_lower'], mine['pd_upper'], 'lps', len(mine['items']), 'checks', checks)
    print('growth events', len(events), 'files', lab.r['files_after_vacuum']['users'])
