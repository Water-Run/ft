"""从入库的真实页回显解码字段，与 pageinspect/SQL 逐项核对；无数据库或网络依赖。"""
from pathlib import Path
import hashlib
import json
import struct

HERE = Path(__file__).resolve().parent

def main():
    record_path = HERE / 'out_01_probe.json'
    run = json.loads(record_path.read_text(encoding='utf-8'))
    raw_pages = [q['rows'][0]['bytes'] for q in run['queries'] if q['sql'] == "SELECT get_raw_page('users', 0) AS bytes"]
    assert len(raw_pages) == len(run['snapshots'])
    mapped = {}
    fields = ['checksum','flags','lower','upper','special','pagesize_version','prune_xid']
    matched = 0
    for (key, expected), encoded in zip(run['snapshots'].items(), raw_pages):
        page = bytes.fromhex(encoded)
        assert hashlib.sha256(page).hexdigest() == expected['sha256']
        header = dict(zip(fields, struct.unpack_from('<HHHHHHI',page,8)))
        for name in ['checksum','flags','lower','upper','special']:
            assert header[name] == expected['header'][name]
        assert len(page) == expected['bytes'] == expected['header']['pagesize']
        assert (header['lower'] - 24) // 4 == len(expected['items'])
        rows = []
        for sql in expected['items']:
            lp = sql['lp']
            bits = struct.unpack_from('<I',page,24+(lp-1)*4)[0]
            off, flag, length = bits & 0x7fff, (bits >> 15) & 3, bits >> 17
            assert (off,flag,length) == (sql['lp_off'],sql['lp_flags'],sql['lp_len'])
            row = {'lp':lp,'offset':off,'flags':flag,'length':length}
            if flag == 1:
                xmin,xmax = struct.unpack_from('<II',page,off)
                hi,lo,pos = struct.unpack_from('<HHH',page,off+12)
                mask2,mask = struct.unpack_from('<HH',page,off+18)
                hoff = page[off+22]
                data = page[off+hoff:off+length]
                assert data.hex() == sql['data_hex']
                assert (str(xmin),str(xmax),f'({(hi<<16)|lo},{pos})',mask,mask2,hoff) == (sql['t_xmin'],sql['t_xmax'],sql['t_ctid'],sql['t_infomask'],sql['t_infomask2'],sql['t_hoff'])
                # 当前固定 schema、无 NULL、x86-64 小端；bpchar 使用短 varlena 头。
                identifier = struct.unpack_from('<i',data)[0]
                assert data[4] & 1
                var_size = data[4] >> 1
                name = data[5:4+var_size].decode('ascii').rstrip(' ')
                age_off = (4+var_size+1) & ~1
                age = struct.unpack_from('<h',data,age_off)[0]
                row.update(id=identifier,name=name,age=age,xmin=xmin,xmax=xmax,ctid=f'({(hi<<16)|lo},{pos})',
                           hot_updated=bool(mask2 & 0x4000),heap_only=bool(mask2 & 0x8000),data_hex=data.hex())
                matched += 1
            rows.append(row)
        mapped[key] = {'header_bytes':24,'item_bytes':4,'page_bytes':len(page),'lower':header['lower'],
                       'upper':header['upper'],'free_bytes':header['upper']-header['lower'],'rows':rows,'sha256':expected['sha256']}
    before = [r for r in mapped['before']['rows'] if r['flags']==1]
    assert [(r['id'],r['name'],r['age']) for r in before] == [(r['id'],r['name'].rstrip(),r['age']) for r in run['initial_rows']]
    changed = [r for r in mapped['uncommitted']['rows'] if r.get('id')==1]
    assert [r['age'] for r in changed] == [30,31]
    assert changed[0]['hot_updated'] and changed[1]['heap_only']
    released = mapped['vacuum_released']['rows'][0]
    assert released['flags']==2 and released['offset']==9 and released['length']==0
    plans = {k:v[0]['QUERY PLAN'][0]['Plan']['Node Type'] for k,v in run['plans'].items()}
    assert plans == {'small':'Seq Scan','many':'Index Scan'}
    assert all(run['checks'].values()) and run['success']
    result = {'schema':1,'source':'out_01_probe.json','source_sha256':hashlib.sha256(record_path.read_bytes()).hexdigest(),
              'version':run['environment']['server']['version'],'checked_items':matched,'checks':run['checks'],
              'layout':run['layout'],'plans':plans,'snapshots':mapped,'bookings':run['bookings'],
              'extensions':run['extensions'],'after_recovery':run['after_recovery']}
    (HERE / 'out_03_decode.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps({'decoded_tuples':matched,'snapshots':len(mapped),'checks':len(run['checks']),'plans':plans,'passed':True}))

if __name__ == '__main__':
    main()
