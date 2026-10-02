#!/usr/bin/env python3
"""按 MySQL 5.5.62 storage/myisam/mi_open.c 的落盘顺序解析 .MYI，用于核对视频里的每个数字。"""
import sys, struct, collections
def be(b): return int.from_bytes(b,'big')
def parse(path, walk=True, verbose=True):
    d=open(path,'rb').read()
    h={}
    h['magic']=d[0:4].hex(' ')
    h['options']=be(d[4:6]); h['header_length']=be(d[6:8]); h['state_info_length']=be(d[8:10])
    h['base_info_length']=be(d[10:12]); h['base_pos']=be(d[12:14]); h['key_parts']=be(d[14:16])
    h['unique_key_parts']=be(d[16:18]); h['keys']=d[18]; h['uniques']=d[19]; h['language']=d[20]
    h['max_block_size_index']=d[21]; h['fulltext_keys']=d[22]
    p=24; s=collections.OrderedDict()
    def take(n,name):
        nonlocal p
        s[name]=(p,n,be(d[p:p+n])); p+=n
    take(2,'open_count'); take(1,'changed'); take(1,'sortkey')
    for n in ['records','del','split','dellink','key_file_length','data_file_length','empty','key_empty','auto_increment','checksum']: take(8,n)
    for n in ['process','unique','status','update_count']: take(4,n)
    for i in range(h['keys']): take(8,'key_root[%d]'%i)
    for i in range(h['max_block_size_index']): take(8,'key_del[%d]'%i)
    take(4,'sec_index_changed'); take(4,'sec_index_used'); take(4,'version'); take(8,'key_map')
    take(8,'create_time'); take(8,'recover_time'); take(8,'check_time'); take(8,'rec_per_key_rows')
    for i in range(h['key_parts']): take(4,'rec_per_key_part[%d]'%i)
    state_end=p
    p=h['base_pos']; b=collections.OrderedDict()
    def tb(n,name):
        nonlocal p
        b[name]=(p,n,be(d[p:p+n])); p+=n
    for n in ['keystart','max_data_file_length','max_key_file_length','records','reloc']: tb(8,n)
    for n in ['mean_row_length','reclength','pack_reclength','min_pack_length','max_pack_length','min_block_length','fields','pack_fields']: tb(4,n)
    for n in ['rec_reflength','key_reflength','keys','auto_key']: tb(1,n)
    for n in ['pack_bits','blobs','max_key_block_length','max_key_length','extra_alloc_bytes']: tb(2,n)
    tb(1,'extra_alloc_procent'); p+=13
    base_end=p
    keydefs=[]
    for i in range(h['keys']):
        kp=p
        kd=dict(pos=kp,keysegs=d[p],key_alg=d[p+1],flag=be(d[p+2:p+4]),block_length=be(d[p+4:p+6]),keylength=be(d[p+6:p+8]),minlength=be(d[p+8:p+10]),maxlength=be(d[p+10:p+12])); p+=12
        segs=[]
        for j in range(kd['keysegs']):
            segs.append(dict(type=d[p],language=d[p+1]|(d[p+4]<<8),null_bit=d[p+2],flag=be(d[p+6:p+8]),length=be(d[p+8:p+10]),start=be(d[p+10:p+14]))); p+=18
        kd['segs']=segs; keydefs.append(kd)
    keydef_end=p
    p+=h['uniques']*4
    rec=[]
    nf=b['fields'][2]
    for i in range(nf):
        rec.append(dict(type=be(d[p:p+2]),length=be(d[p+2:p+4]),null_bit=d[p+4],null_pos=be(d[p+5:p+7]))); p+=7
    rec_end=p
    if verbose:
        print('FILE',path,len(d),'bytes')
        print('HEADER',h)
        for k,(o,n,v) in s.items(): print('  state @%4d +%d %-22s %d (0x%x)'%(o,n,k,v,v))
        print('  state_end',state_end)
        for k,(o,n,v) in b.items(): print('  base  @%4d +%d %-22s %d (0x%x)'%(o,n,k,v,v))
        print('  base_end',base_end)
        for kd in keydefs: print('  keydef',kd)
        print('  keydef_end',keydef_end)
        for r in rec: print('  recinfo',r)
        print('  rec_end',rec_end,'keystart',b['keystart'][2])
    info=dict(h=h,s=s,b=b,keydefs=keydefs,rec=rec,d=d,rec_end=rec_end)
    if walk:
        for i,kd in enumerate(keydefs):
            root=s['key_root[%d]'%i][2]
            if root==0xffffffffffffffff: print('  key',i,'empty'); continue
            stats=walk_tree(info,i,root,verbose)
    return info
def page(info,ki,pos):
    d=info['d']; kd=info['keydefs'][ki]; bl=kd['block_length']
    hdr=be(d[pos:pos+2]); nod=hdr>>15; used=hdr&0x7fff
    kref=info['b']['key_reflength'][2] if nod else 0
    rref=info['b']['rec_reflength'][2]
    return bl,nod,used,kref,rref
def walk_tree(info,ki,root,verbose=True):
    d=info['d']; kd=info['keydefs'][ki]
    packed = kd['flag'] & (2|32|8)  # HA_PACK_KEY=2, HA_BINARY_PACK_KEY=32, HA_VAR_LENGTH_KEY=8
    levels=collections.defaultdict(list)
    def rec(pos,depth):
        bl,nod,used,kref,rref=page(info,ki,pos)
        if packed:
            levels[depth].append((pos,nod,used,None)); 
            if nod:
                # 只跟第一个子指针往下走，量深度
                child=be(d[pos+2:pos+2+kref])*1024
                rec(child,depth+1)
            return
        klen=kd['keylength']  # 含 rec_reflength
        n=(used-2-kref)//(klen+kref)
        levels[depth].append((pos,nod,used,n))
        if nod:
            p=pos+2
            for i in range(n+1):
                child=be(d[p:p+kref])*1024
                rec(child,depth+1)
                p+=kref+klen
    rec(root,0)
    if verbose:
        print('  == key %d root@%d flag=0x%x keylength=%d packed=%s'%(ki,root,kd['flag'],kd['keylength'],bool(packed)))
        for dep in sorted(levels):
            L=levels[dep]
            ns=[x[3] for x in L if x[3] is not None]
            print('     level %d: pages=%d nod=%s used(min/max)=%d/%d keys/page(min/max/avg)=%s total_keys=%s'%(dep,len(L),L[0][1],min(x[2] for x in L),max(x[2] for x in L),(min(ns),max(ns),round(sum(ns)/len(ns),1)) if ns else None,sum(ns) if ns else None))
    return levels
if __name__=='__main__':
    parse(sys.argv[1])
