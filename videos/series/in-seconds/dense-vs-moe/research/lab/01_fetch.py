# 01 下载 OLMoE-1B-7B-0924（固定提交号），列出文件与 SHA-256
import os, hashlib
from common import *
from huggingface_hub import snapshot_download
out = Tee('01_fetch')
snapshot_download(REPO_ID, revision=REVISION, local_dir=MODEL_DIR)
out('repo', REPO_ID, 'revision', REVISION)
total = 0
for fn in sorted(os.listdir(MODEL_DIR)):
    p = os.path.join(MODEL_DIR, fn)
    if not os.path.isfile(p): continue
    size = os.path.getsize(p); total += size if fn.endswith('.safetensors') else 0
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 24), b''): h.update(b)
    out(f'{fn:40s} {size:>14,d}  sha256 {h.hexdigest()}')
out(f'safetensors total bytes {total:,d}')
