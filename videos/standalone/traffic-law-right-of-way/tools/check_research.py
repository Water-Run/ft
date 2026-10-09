"""Check handoff data integrity; does not certify law, narration, or final video.

Works without ignored raw snapshots. If snapshots exist, validates their hashes.
Run with --require-snapshots when verifying the preparation machine's archive.
"""
from hashlib import sha256
from pathlib import Path
import argparse
import json
import re
import sys
sys.dont_write_bytecode = True
from gen_data import render

ROOT = Path(__file__).resolve().parents[1]
def read_json(name):
    return json.loads((ROOT/name).read_text(encoding='utf-8'))


def check(require_snapshots=False):
    project = read_json('project.json')
    assert project['languages']==['zh'], 'Only Chinese is authorized'
    for key in ('titles','voices','rates','asr_prompts'):
        assert set(project[key])=={'zh'}, key
    assert set(project['check']['caption_width'])=={'zh'}
    sources = read_json('research/sources.json')['sources']
    ids = [s['id'] for s in sources]
    assert len(ids)==len(set(ids)), 'Duplicate source ID'
    manifest = read_json('research/lab/source_snapshot_manifest.json')['sources']
    assert set(ids)=={r['id'] for r in manifest}, 'Source/manifest mismatch'
    records = {r['id']:r for r in manifest}
    raw_count = 0
    for source in sources:
        rec=records[source['id']]
        assert source['url']==rec['url']
        assert source['capture_status']==rec['status']
        assert source['reviewed_sections'] and source['reviewed_on']
        if rec['status']=='captured':
            for kind in ('html','txt'):
                path=ROOT/rec[kind+'_path']
                if require_snapshots or path.exists():
                    assert path.is_file(), f'Missing snapshot: {source["id"]} {kind}'
                    assert sha256(path.read_bytes()).hexdigest()==rec[kind+'_sha256'], f'Snapshot changed: {source["id"]}'
                    raw_count+=1
    facts=(ROOT/'research/FACTS.md').read_text(encoding='utf-8')
    claims=re.findall(r'<a id="(R\d+)"></a>',facts)
    assert len(claims)==len(set(claims)), 'Duplicate claim ID'
    source_refs=dict(re.findall(r'^\[([A-Z]\d+[A-Z]?)\]: (https://\S+)$',facts,re.M))
    assert set(source_refs)==set(ids), 'FACTS source reference mismatch'
    for source in sources: assert source_refs[source['id']]==source['url']
    cases=read_json('research/lab/cases.json')['cases']
    case_ids=[c['id'] for c in cases]
    assert len(case_ids)==len(set(case_ids)), 'Duplicate case ID'
    straight={'N':'S','E':'W','S':'N','W':'E'}
    left={'N':'E','E':'S','S':'W','W':'N'}
    right={v:k for k,v in left.items()}
    for case in cases:
        assert case['illustrative'] is True
        assert case['conditions'] and case['counterexample_zh']
        assert set(case['claim_refs'])<=set(claims), case['id']
        actors={a['id'] for a in case['actors']}
        assert len(actors)==len(case['actors'])
        for key in ('yielding_actors','proceeds_first','teaching_sequence'):
            assert set(case.get(key,[]))<=actors, (case['id'],key)
        assert not set(case['yielding_actors']) & set(case['proceeds_first'])
        for actor in case['actors']:
            for maneuver, mapping in [('straight',straight),('left',left),('right',right)]:
                if actor['maneuver']==maneuver and actor['from'] in mapping and actor['to'] in mapping:
                    assert mapping[actor['from']]==actor['to'], f'{case["id"]}: turn geometry mismatch'
        if 'compare_with' in case:
            parent=next(c for c in cases if c['id']==case['compare_with'])
            assert parent['actors']==case['actors'], 'Comparison changed actor geometry'
            changed={k for k in set(case['conditions'])|set(parent['conditions']) if case['conditions'].get(k)!=parent['conditions'].get(k)}
            assert changed=={case['changed_condition']}, 'Not a one-condition comparison'
        for variant in case.get('variants',[]):
            assert variant['changed_condition'] in case['conditions']
            assert set(variant['yielding_actors'])|set(variant['proceeds_first'])<=actors
    excerpts=read_json('research/lab/statutory-excerpts.json')['excerpts']
    for item in excerpts:
        rec=records[item['source_id']]
        assert item['snapshot_sha256']==rec['txt_sha256']
        assert item['text'].startswith(item['article'])
        if (ROOT/rec['txt_path']).exists():
            assert item['text'] in (ROOT/rec['txt_path']).read_text(encoding='utf-8'), 'Excerpt differs from snapshot'
    assert (ROOT/'src/js/data.js').read_bytes()==render(), 'Generated data stale; run gen_data.py'
    print('PASS: Chinese-only project metadata.')
    print(f'PASS: {len(sources)} source records; {sum(r["status"]=="captured" for r in manifest)} captured pages; {raw_count} raw-file hashes checked.')
    print(f'PASS: {len(claims)} claim anchors, {len(cases)} illustrative cases, relative turn geometry and condition comparisons.')
    print(f'PASS: {len(excerpts)} statutory excerpts tied to source snapshot hashes.')
    print('PASS: generated data.js matches tracked case input byte for byte.')
    print('LIMIT: data integrity only; pending evidence and drawing details remain in FACTS.')
    print('LIMIT: no approved script, TTS, rendered video, legal certification, or audiovisual acceptance is asserted.')


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--require-snapshots',action='store_true')
    args=parser.parse_args()
    check(args.require_snapshots)
