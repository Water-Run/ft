"""取证的公共工具：访问 Hugging Face 公开仓库，读配置与 safetensors 头部。

只用公开 HTTP 接口，不需要登录。参数量的数法见 02_count_params.py：
safetensors 文件开头是一个 8 字节的小端长度，后面跟着同样长的 JSON 头，
头里每个张量记着 dtype 与 shape；把各张量的元素个数相加就是权重里的参数个数。
用 HTTP Range 只取这几 KB，不必下载整个权重文件。
"""

import json
import math
import os
import sys
import time
from pathlib import Path

import requests

HF = "https://huggingface.co"
UA = {"User-Agent": "ft-research/model-parameters"}
TIMEOUT = 30
RETRIES = 6


def get(url, headers=None, stream=False):
    """带重试的 GET。CDN 偶发 SSL 断连，退避后重试。

    4xx 不重试：匿名访问 gated 仓库会返回 401，重试没有意义。
    """
    last = None
    for i in range(RETRIES):
        try:
            r = requests.get(url, headers={**UA, **(headers or {})}, timeout=TIMEOUT, stream=stream)
            if 400 <= r.status_code < 500:
                raise RuntimeError(f"HTTP {r.status_code} for {url}")
            r.raise_for_status()
            return r
        except RuntimeError:
            raise
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(min(2 * (i + 1), 12) + (i * 0.7))
    raise RuntimeError(f"GET failed: {url} -> {last}")


def get_json(path):
    r = get(f"{HF}/{path}")
    return r.json()


def repo_files(repo):
    """仓库文件清单。"""
    return get_json(f"api/models/{repo}")["siblings"]


def file_url(repo, filename, revision="main"):
    return f"{HF}/{repo}/resolve/{revision}/{filename}"


def fetch_config(repo, revision="main"):
    return get_json(f"{repo}/resolve/{revision}/config.json")


def weight_files(repo):
    """仓库里的权重文件：单文件 model.safetensors，或分片的 model-0000N-of-0000M.safetensors。"""
    names = [s["rfilename"] for s in repo_files(repo)]
    shards = sorted(n for n in names if n.endswith(".safetensors"))
    index = "model.safetensors.index.json" if "model.safetensors.index.json" in names else None
    return shards, index


def read_safetensors_header(url):
    """只取 safetensors 的 JSON 头，不下载权重本体。

    返回 (header_dict, header_bytes)。header 里每个键是张量名，
    值含 dtype、shape、data_offsets；另有 '__metadata__'。
    """
    head = get(url, headers={"Range": "bytes=0-7"}).content
    if len(head) < 8:
        raise RuntimeError(f"short read for {url}")
    n = int.from_bytes(head[:8], "little")
    if n <= 0 or n > 100 * 1024 * 1024:
        raise RuntimeError(f"implausible header length {n} for {url}")
    raw = get(url, headers={"Range": f"bytes=8-{7 + n}"}).content
    return json.loads(raw.decode("utf-8")), n


def count_params(header):
    """按张量 shape 数出参数量。

    重复存储的张量（权重绑定）safetensors 只存一份，所以这里数的是
    权重文件里真实存着的参数量。
    """
    total = 0
    tensors = {}
    for name, meta in header.items():
        if name == "__metadata__":
            continue
        shape = meta.get("shape") or []
        c = 1
        for d in shape:
            c *= int(d)
        total += c
        tensors[name] = {"shape": shape, "dtype": meta.get("dtype"), "count": c}
    return total, tensors


def dtype_bytes(dtype):
    return {"F64": 8, "F32": 4, "F16": 2, "BF16": 2, "I64": 8, "I32": 4,
            "I16": 2, "I8": 1, "U8": 1, "BOOL": 1, "F8_E4M3": 1, "F8_E5M2": 1}.get(dtype, 0)


def repo_param_count(repo, revision="main", verbose=True):
    """数一个仓库的参数量。分片模型读全部分片的头。"""
    shards, index = weight_files(repo)
    if not shards:
        raise RuntimeError(f"no safetensors in {repo}")
    total = 0
    tensors = {}
    file_bytes = 0
    for s in shards:
        url = file_url(repo, s, revision)
        header, _ = read_safetensors_header(url)
        c, t = count_params(header)
        total += c
        file_bytes += int(header.get("__metadata__", {}).get("total_size", 0)) or 0
        for k, v in t.items():
            tensors[k] = v
    return {"repo": repo, "shards": shards, "index": index, "params": total,
            "tensors": tensors, "weight_bytes": file_bytes}


def save_json(path, obj):
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    return p


def lab_dir():
    return Path(__file__).resolve().parent


def fmt(n):
    """把参数量写成带量级后缀的形式。"""
    if n >= 1e9:
        return f"{n / 1e9:.3f} B"
    if n >= 1e6:
        return f"{n / 1e6:.2f} M"
    if n >= 1e3:
        return f"{n / 1e3:.1f} K"
    return str(n)
