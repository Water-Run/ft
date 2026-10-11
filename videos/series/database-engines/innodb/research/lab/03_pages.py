#!/usr/bin/env python3
"""Decode the measured users.ibd sample, not arbitrary InnoDB files.

Scope: 16 KiB, uncompressed/unencrypted DYNAMIC, latin1, all columns NOT NULL,
INT/CHAR(10)/TINYINT schema in 00_schema.sql; root pages are leaves here.
Header offsets follow the pinned page0types.h, fil0fil.h and rem0rec definitions.
"""
import hashlib
import json
from pathlib import Path

LAB = Path(__file__).resolve().parent
PAGE_SIZE = 16384


def uint(data, offset, length):
    return int.from_bytes(data[offset:offset+length], 'big')


def main():
    raw = (LAB.parent / '_src/users.ibd').read_bytes()
    records = json.loads((LAB/'out_01_probe.json').read_text(encoding="utf-8"))
    indexes = []
    for step in records:
        if step['group'] == 'index_metadata':
            for row in step['output']:
                fields = row.split('\t')
                if fields[0] == 'innodb_demo/users':
                    indexes.append({'name':fields[1], 'index_id':int(fields[2]), 'root_page':int(fields[5]),'space_id':int(fields[6])})
    assert len(indexes) == 2
    result = {'version':'9.7.2','file':'users.ibd','sha256':hashlib.sha256(raw).hexdigest(),'file_bytes':len(raw),'page_bytes':PAGE_SIZE,'pages':[],'indexes':indexes}
    for page_no in range(len(raw)//PAGE_SIZE):
        page = raw[page_no*PAGE_SIZE:(page_no+1)*PAGE_SIZE]
        result['pages'].append({'page_no':page_no,'file_offset':page_no*PAGE_SIZE,'stored_page_no':uint(page,4,4),'type':uint(page,24,2),'space_id':uint(page,34,4)})
    for index in indexes:
        page_no=index['root_page']; page=raw[page_no*PAGE_SIZE:(page_no+1)*PAGE_SIZE]
        assert uint(page,24,2)==17855
        assert uint(page,4,4)==page_no
        assert uint(page,66,8)==index['index_id']
        assert uint(page,64,2)==0, 'This decoder only handles leaf root samples'
        index.update(level=0,n_recs=uint(page,54,2),records=[])
        origin=99  # PAGE_NEW_INFIMUM = PAGE_HEADER(38)+36+2*FSEG_HEADER_SIZE(10)+5
        seen=set()
        while True:
            origin=(origin+uint(page,origin-2,2))%PAGE_SIZE
            if origin==112:  # PAGE_NEW_SUPREMUM
                break
            assert origin not in seen and 120<origin<PAGE_SIZE-8
            seen.add(origin)
            entry={'page_offset':origin,'file_offset':page_no*PAGE_SIZE+origin,'deleted':bool(page[origin-5]&0x20),'record_header_hex':page[origin-5:origin].hex(' ')}
            if index['name']=='PRIMARY':
                entry.update(id=uint(page,origin,4)^0x80000000,
                             trx_id=uint(page,origin+4,6),
                             roll_ptr_hex=page[origin+10:origin+17].hex(' '),
                             name=page[origin+17:origin+27].decode('latin1').rstrip(' '),
                             age=page[origin+27]^0x80,
                             payload_hex=page[origin:origin+28].hex(' '))
            else:
                entry.update(name=page[origin:origin+10].decode('latin1').rstrip(' '),
                             id=uint(page,origin+10,4)^0x80000000,
                             payload_hex=page[origin:origin+14].hex(' '))
            index['records'].append(entry)
        assert len(index['records'])==index['n_recs']
    primary=next(i for i in indexes if i['name']=='PRIMARY')
    secondary=next(i for i in indexes if i['name']=='idx_name')
    expected=[(1,'alice',30),(2,'bob',25),(3,'carol',41),(4,'dave',19),(5,'erin',33),(6,'frank',52),(7,'grace',28),(8,'heidi',36)]
    got=[(r['id'],r['name'],r['age']) for r in primary['records'] if not r['deleted']]
    assert got==expected,(got,expected)
    assert sorted((r['id'],r['name']) for r in secondary['records'] if not r['deleted'])==[(a,b) for a,b,c in expected]
    (LAB/'out_03_pages.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print('Verified two real leaf roots, clustered row payloads and secondary name+primary-key payloads')
    print(json.dumps({i['name']:{'root_page':i['root_page'],'records':i['n_recs']} for i in indexes}))


if __name__=='__main__':
    main()
