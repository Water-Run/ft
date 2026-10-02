#!/usr/bin/env python3
# 把实验机上 MySQL 5.5.62 的真实数据文件（research/lab/remote/snap_*）转成 src/js/data.js，画面里出现的字节与数字都来自这里。
# 用法：python videos/series/database-engines/myisam/tools/gen_data.py
import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'research'))
import myi
R = os.path.join(os.path.dirname(__file__), '..', 'research', 'lab', 'remote')
def rd(p): return open(os.path.join(R, p), 'rb').read()
def hx(b): return b.hex()
be = myi.be
D = {}
D['usersMYD'] = [hx(rd('snap_0%s/users.MYD' % s)) for s in ['1_create', '2_delete', '3_reuse', '4_reuse2']]
D['notesMYD'] = [hx(rd('snap_0%s/notes.MYD' % s)) for s in ['1_create', '2_delete', '3_reuse', '4_reuse2']]
m = rd('snap_01_create/users.MYI')
D['usersMYI'] = {'size': len(m), 'head': hx(m[:396]), 'page1': hx(m[1024:1024+82]), 'page2': hx(m[2048:2048+94])}
D['usersFRM'] = {'size': len(rd('snap_01_create/users.frm')), 'head': hx(rd('snap_01_create/users.frm')[:32])}
def state(path):
    i = myi.parse(os.path.join(R, path), walk=False, verbose=False)
    return {k: [v[0], v[1], v[2] if v[2] < 2**53 else -1] for k, v in i['s'].items()}
D['state'] = {s: state('snap_0%s/users.MYI' % s) for s in ['1_create', '2_delete', '3_reuse', '4_reuse2']}
D['stateCrash'] = state('snap_06_crash/users_crashed.MYI')
D['crashMYD'] = hx(rd('snap_06_crash/users_crashed.MYD'))
# 十万行表的 B 树
big = myi.parse(os.path.join(R, 'snap_05_big/users_big.MYI'), walk=False, verbose=False)
d = big['d']
def page(pos):
    hdr = be(d[pos:pos+2]); nod = hdr >> 15; used = hdr & 0x7fff; kref = 5 if nod else 0
    n = (used - 2 - kref) // (10 + kref); p = pos + 2; keys = []; ch = []
    for j in range(n):
        if nod: ch.append(be(d[p:p+kref]) * 1024)
        keys.append([be(d[p+kref:p+kref+4]), be(d[p+kref+4:p+kref+10])]); p += kref + 10
    if nod: ch.append(be(d[p:p+kref]) * 1024)
    return {'pos': pos, 'nod': nod, 'used': used, 'keys': keys, 'children': ch, 'raw': hx(d[pos:pos+48])}
root = big['s']['key_root[0]'][2]
lv = myi.walk_tree(big, 0, root, verbose=False)
bd = rd('snap_05_big/users_big.MYD')
D['big'] = {
    'records': big['s']['records'][2], 'keyFileLength': big['s']['key_file_length'][2], 'dataFileLength': len(bd),
    'root': page(root), 'node': page(3072), 'leaf': page(95232),
    'levels': [{'pages': len(lv[k]), 'keys': sum(x[3] for x in lv[k])} for k in sorted(lv)],
    'row4242': hx(bd[4241*16:4241*16+16]), 'rowOffset': 4241*16,
    'fan': [len(page(c)['children']) for c in page(root)['children']],
    'nodeFirst': [page(c)['keys'][0][0] for c in page(root)['children']],
}
out = os.path.join(os.path.dirname(__file__), '..', 'src', 'js', 'data.js')
open(out, 'w').write('// 由 tools/gen_data.py 从真实的 MySQL 5.5.62 MyISAM 文件生成，勿手改\nwindow.REAL = ' + json.dumps(D, separators=(',', ':')) + ';\n')
print('data.js', os.path.getsize(out), 'bytes')
print('root keys', [k[0] for k in D['big']['root']['keys']][:6], '... children', D['big']['root']['children'][:3])
print('node keys', [k[0] for k in D['big']['node']['keys']][:4], '...', [k[0] for k in D['big']['node']['keys']][-3:], 'child41', D['big']['node']['children'][41])
print('leaf keys', D['big']['leaf']['keys'][0], D['big']['leaf']['keys'][-1], len(D['big']['leaf']['keys']))
print('levels', D['big']['levels'], 'row', D['big']['row4242'])
