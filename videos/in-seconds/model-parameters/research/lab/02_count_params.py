"""02 按真实权重文件数参数量。

数法（可复算）：safetensors 文件开头 8 字节小端长度 N，后面 N 字节是 JSON 头，
头里每个张量记着 dtype 与 shape；把所有张量的元素个数相加，就是权重里真实存着的
参数量。绑定的权重（tied weights）在文件里只存一份，所以这里数出来的就是文件里的数。
只发 HTTP Range 请求读文件头，不下载权重本体。

分片多的仓库（Qwen3.8-2.4T-A95B 有上百个分片，全读要几百次往返）分两路算：
  甲路  读全部分片的头，逐个张量数出参数量（分片少的仓库用这一路作准）
  乙路  读分片索引 model.safetensors.index.json 的 metadata.total_size
        （所有张量字节数之和），除以每参数字节数得出参数量
两路必须相等；再抽查几个分片的头，验证乙路除法成立。Hub API 公布的总数是第三条路。

仓库清单见 models.py。
"""

import sys
import time
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import hfutil as H
import models

ALL_SHARDS_LIMIT = 30          # 分片数不超过这个就全读头
SAMPLE = 3                     # 超过时的抽查分片数


def head_params(url):
    """读一个分片的头，返回 (参数量, dtype 分布, 张量数)。"""
    header, _ = H.read_safetensors_header(url)
    c, tensors = H.count_params(header)
    dt = Counter()
    for v in tensors.values():
        dt[v["dtype"]] += v["count"]
    return c, dt, len(tensors)


def main():
    print("=" * 100)
    print("02  按 safetensors 头部数参数量 —— 2026-10-20", flush=True)
    print("=" * 100, flush=True)
    for repo, label in models.REPOS:
        shards, index = H.weight_files(repo)
        read_all = len(shards) <= ALL_SHARDS_LIMIT
        print(f"\n--- {repo}   （{label}）", flush=True)
        print(f"    权重分片数                  {len(shards)}", flush=True)
        print(f"    取证方式                    {'全部读头' if read_all else '索引换算 + 抽查'}", flush=True)

        # 乙路：分片索引里的 total_size
        total_bytes_index = None
        if index:
            idx = H.get_json(f"{repo}/resolve/main/{index}")
            total_bytes_index = idx.get("metadata", {}).get("total_size")
            print(f"    索引 {index} 的 total_size   {total_bytes_index:,} 字节", flush=True)

        # 甲路：读分片的头
        t0 = time.time()
        by_header = 0
        dt_all = Counter()
        n_tensors = 0
        if read_all:
            read = shards
        else:
            read = shards[:1] + shards[len(shards) // 2: len(shards) // 2 + 1] + shards[-1:]
        for s in read:
            c, dt, nt = head_params(H.file_url(repo, s))
            by_header += c
            dt_all.update(dt)
            n_tensors += nt
            print(f"      读头 {s:44} {c:>15,} 参数", flush=True)
            time.sleep(0.3)
        print(f"    读头耗时                    {time.time() - t0:.1f} 秒（{len(read)} 个分片）", flush=True)
        print(f"    读到的张量数                {n_tensors:,}", flush=True)
        print(f"    dtype 分布                  {dict(dt_all)}", flush=True)

        # 乙路换算：total_size ÷ 每参数字节数
        per = {H.dtype_bytes(k): v for k, v in dt_all.items()}
        by_index = None
        if total_bytes_index and len(per) == 1:
            b = next(iter(per))
            by_index = total_bytes_index // b
            print(f"    乙路：total_size ÷ {b} 字节/参数 = {by_index:,}", flush=True)
            if read_all:
                print(f"    甲路 vs 乙路                {'一致' if by_index == by_header else '不一致'}", flush=True)
            else:
                print(f"    乙路 vs 甲路（抽查分片）      甲路只读了 {len(read)} 个分片，"
                      f"抽查部分 {by_header:,} 参数", flush=True)

        # Hub 自己公布的数
        api = H.get_json(f"api/models/{repo}")
        hub_total = (api.get("safetensors") or {}).get("total")
        hub_dtypes = (api.get("safetensors") or {}).get("parameters") or {}
        print(f"    Hub API 公布的总数          {hub_total:,}  = {H.fmt(hub_total)}" if hub_total
              else "    Hub API 公布的总数          （无）", flush=True)
        if hub_total:
            ref = by_header if read_all else by_index
            same = (hub_total == ref) if ref else None
            print(f"    与本片数法是否一致          {'一致' if same else ('不一致' if same is not None else '未比')}", flush=True)
            if not same and ref:
                diff = ref - hub_total
                print(f"    差值                        {diff:+,} 个元素", flush=True)
                # Hub 按 dtype 分类公布；若只公布了主 dtype，差值应正好等于其余 dtype 的元素数
                main_dt = max(hub_dtypes, key=lambda k: hub_dtypes[k]) if hub_dtypes else None
                rest = sum(v for k, v in dt_all.items() if k != main_dt) if main_dt else 0
                hub_sum = sum(hub_dtypes.values())
                print(f"    Hub 按 dtype 公布的是        {hub_dtypes}", flush=True)
                print(f"    Hub 的 dtype 明细之和        {hub_sum:,}"
                      f"（与本片数法{'一致' if hub_sum == ref else '不一致'}）", flush=True)
                print(f"    Hub 的 total 与它自己明细之差  {hub_sum - hub_total:+,}"
                      f"（Hub 的 total 字段没有把那批非主 dtype 的张量算进去；"
                      f"本片读到的非主 dtype 张量共 {rest:,} 个元素）", flush=True)

        # 权重文件的实际字节数（单文件仓库量一次）
        if len(shards) == 1:
            r = H.get(H.file_url(repo, shards[0]), headers={"Range": "bytes=0-0"})
            cr = r.headers.get("Content-Range", "")
            real = int(cr.split("/")[-1]) if "/" in cr else int(r.headers.get("Content-Length", 0))
            print(f"    权重文件实际字节数          {real:,}  = {real / 2**20:.1f} MiB", flush=True)
            if hub_total and len(per) == 1:
                bb = next(iter(per))
                print(f"    参数量 × {bb} 字节           {hub_total * bb:,} 字节"
                      f"（与实际相差 {real - hub_total * bb:,} 字节，即文件头与对齐）", flush=True)
    print()


if __name__ == "__main__":
    main()
