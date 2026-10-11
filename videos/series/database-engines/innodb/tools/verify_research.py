#!/usr/bin/env python3
"""Verify the research evidence and generated artifact, not finished-video quality."""
import hashlib
import json
from pathlib import Path
from gen_data import render

ROOT=Path(__file__).resolve().parents[1]


def main():
    steps=json.loads((ROOT/'research/lab/out_01_probe.json').read_text(encoding="utf-8"))
    pages=json.loads((ROOT/'research/lab/out_03_pages.json').read_text(encoding="utf-8"))
    sources=json.loads((ROOT/'research/sources.json').read_text(encoding="utf-8"))
    project=json.loads((ROOT/'project.json').read_text(encoding="utf-8"))
    checks=[]
    def check(name,value):
        assert value,name
        checks.append(name)
    def output(group):
        return [line for s in steps if s['group']==group for line in s['output']]
    check('Chinese-only project',project['languages']==['zh'])
    check('Runtime and image version',output('environment')[0].startswith('9.7.2\t') and json.loads((ROOT/'research/lab/image.json').read_text(encoding="utf-8"))['mysql_version']=='9.7.2')
    check('ROLLBACK restores both rows',any(s['group']=='rollback' and s['session']=='A' and s['output']==['30','hello'] for s in steps))
    check('MyISAM cannot rollback',any('1196' in s for s in output('myisam_control')))
    check('RR and locking read differ',all(x in output('rr_snapshot') for x in ('31','32')))
    check('RC gets fresh read',all(x in output('rc_snapshot') for x in ('32','33')))
    check('Record lock timeout and lock type',any('1205' in s for s in output('record_locks')) and any('X,REC_NOT_GAP' in s for s in output('record_locks')))
    check('Gap lock blocks insert',any('1205' in s for s in output('gap_locks')) and any('X,GAP' in s for s in output('gap_locks')))
    check('Deadlock detected',any('1213' in s for s in output('deadlock')))
    check('Committed row survives crash, uncommitted row absent',any(s['group']=='crash_recovery' and s['sql'].startswith('SELECT') and s['output']==['90\tcommitted'] for s in steps))
    log=(ROOT/'research/lab/out_01_recovery.log').read_text(encoding="utf-8")
    check('Crash redo and rollback logged','Starting crash recovery' in log and 'row operations to undo' in log and 'rollback of uncommitted transactions' in log)
    primary=next(i for i in pages['indexes'] if i['name']=='PRIMARY')
    secondary=next(i for i in pages['indexes'] if i['name']=='idx_name')
    check('Primary/secondary agree on all eight rows',sorted((r['id'],r['name']) for r in primary['records'] if not r['deleted'])==sorted((r['id'],r['name']) for r in secondary['records'] if not r['deleted']) and len(primary['records'])==8)
    check('Each source was retrieved',all(r['status']=='fetched' for r in sources))
    check('Source tag matches binary',all(r.get('tag')=='mysql-9.7.2' for r in sources if r['kind']=='official_source'))
    verified_raw=0
    for source in sources:
        path=ROOT/'research'/source['local']
        if path.exists():
            check('SHA256 '+source['id'],hashlib.sha256(path.read_bytes()).hexdigest()==source['sha256'])
            verified_raw+=1
    snapshot=ROOT/'research/_src/users.ibd'
    if snapshot.exists():
        check('Snapshot SHA256',hashlib.sha256(snapshot.read_bytes()).hexdigest()==pages['sha256'])
    check('Generated data matches saved evidence',(ROOT/'src/js/data.js').read_text(encoding="utf-8")==render())
    report={'scope':'research only, not script or finished-video acceptance','passed':len(checks),'checks':checks,'raw_sources_present_and_verified':verified_raw,'source_count':len(sources),'date':'2026-10-09'}
    (ROOT/'research/lab/out_04_verify.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
    print('PASS: '+str(len(checks))+' evidence checks; '+str(verified_raw)+' source hashes')


if __name__=='__main__':
    main()
