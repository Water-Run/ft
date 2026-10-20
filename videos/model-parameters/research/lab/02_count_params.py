"""02 按真实权重文件数参数量。

数法（可复算）：safetensors 文件开头 8 字节小端长度 N，后面 N 字节是 JSON 头，
头里每个张量记着 dtype 与 shape；把所有张量的元素个数相加，就是权重里真实存着的
参数量。绑定的权重（tied weights）在文件里只存一份，所以这里数出来的就是文件里的数。

只发 HTTP Range 请求读文件头，不下载权重本体。

交叉核对两件事：
  1. 分片仓库的 index.json 里 metadata.total_size（张量字节数总和）与头里数出的参数量
     是否一致（前提是 dtype 统一，脚本会打印 dtype 分布）；
  2. 权重文件的实际字节数（Content-Range 里的总长），用来和「参数量 × 每个参数几个字节」比。
"""

import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import hfutil as H

REPOS = [
    "google-bert/bert-base-uncased",
    "HuggingFaceTB/SmolLM2-135M",
    "unsloth/Llama-3.2-1B",
    "unsloth/Llama-3.1-8B",
    "mistralai/Mixtral-8x7B-v0.1",
    "Qwen/Qwen3-235B-A22B",
]


def file_size(url):
    r = H.get(url, headers={"Range": "bytes=0-0"})
    cr = r.headers.get("Content-Range", "")
    if "/" in cr:
        return int(cr.split("/")[-1])
    return int(r.headers.get("Content-Length", 0))


def main():
    print("=" * 100)
    print("02  按 safetensors 头部数参数量 —— 2026-10-20")
    print("=" * 100)
    for repo in REPOS:
        shards, index = H.weight_files(repo)
        total = 0
        dt = Counter()
        tensors = {}
        for s in shards:
            url = H.file_url(repo, s)
            header, _ = H.read_safetensors_header(url)
            c, t = H.count_params(header)
            total += c
            for k, v in t.items():
                tensors[k] = v
                dt[v["dtype"]] += v["count"]

        print(f"\n--- {repo}")
        print(f"    权重分片数            {len(shards)}")
        print(f"    参数量（按张量 shape） {total:,}  = {H.fmt(total)}")
        print(f"    dtype 分布             {dict(dt)}")
        bytes_per = {H.dtype_bytes(k): v for k, v in dt.items()}
        print(f"    按 dtype 推出的字节数   {sum(b * n for b, n in bytes_per.items()):,}")

        if index:
            idx = H.get_json(f"{repo}/resolve/main/{index}")
            meta = idx.get("metadata", {})
            ts = meta.get("total_size")
            if ts:
                print(f"    index total_size       {ts:,}  （与上面按 dtype 推出的字节数"
                      f"{'一致' if ts == sum(b * n for b, n in bytes_per.items()) else '不一致'}）")
                per = {H.dtype_bytes(k): v for k, v in dt.items()}
                if len(per) == 1:
                    b = next(iter(per))
                    print(f"    total_size ÷ {b} 字节/参数 = {ts // b:,}")

        # 文件实际字节数
        total_bytes = 0
        for s in shards:
            total_bytes += file_size(H.file_url(repo, s))
        print(f"    权重文件实际字节数     {total_bytes:,}  = {total_bytes / 2**20:.1f} MiB")

        # 最大的几个张量
        top = sorted(tensors.items(), key=lambda kv: -kv[1]["count"])[:5]
        print("    最大的 5 个张量：")
        for name, v in top:
            print(f"      {name:52} {str(v['shape']):24} {v['dtype']:5} {v['count']:>14,}")
    print()


if __name__ == "__main__":
    main()
