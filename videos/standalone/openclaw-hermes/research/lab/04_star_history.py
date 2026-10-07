#!/usr/bin/env python3
"""取证脚本 04：星标曲线。GitHub 的星标时间戳接口（stargazers）要求认证，这里改取 star-history.com 的 SVG 图，
从曲线的路径坐标和坐标轴刻度反算采样点（日期、星标数）。采样点是该服务取的约 15–20 个点，两点之间是平滑曲线，不是逐日数据；
末点与 GitHub API 的 stargazers_count 对照（out_01_github.json）。
用法：python3 04_star_history.py [输出目录]；输出 out_15_star_history.json（含反算的点与 SVG 的 SHA-256，不保存 SVG 本身）。"""
import re, sys, json, hashlib, datetime as dt, urllib.request, os
OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
MONTHS = {m: i + 1 for i, m in enumerate(['January','February','March','April','May','June','July','August','September','October','November','December'])}
def fetch(repo):
    url = f'https://api.star-history.com/svg?repos={repo}&type=Date'
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read().decode('utf8')
def points(svg):
    s = re.sub(r'href="data:[^"]*"', 'href="DATA"', svg); s = re.sub(r'url\(data:[^)]*\)', 'url(DATA)', s)
    xt = [(float(m.group(1)), re.sub('<[^>]+>', '', m.group(2))) for m in re.finditer(r'<text[^>]*class="tick"[^>]*transform="translate\(([\d.]+) [\d.]+\)"[^>]*>(.*?)</text>', s)]
    yt = [(float(m.group(1)), re.sub('<[^>]+>', '', m.group(2)).strip()) for m in re.finditer(r'<text x="-7"[^>]*transform="translate\(0 ([\d.]+)\)"[^>]*>(.*?)</text>', s)]
    d = re.search(r'<path fill="none" stroke="#[0-9a-fA-F]+" d="(m[^"]+)"', s).group(1)
    # x 轴刻度：月份名（一月取年份）；按顺序补全年月
    ticks = []; year = None
    for x, lab in xt:
        if lab.isdigit(): year = int(lab); ticks.append((x, dt.date(year, 1, 1)))
        else:
            if year is None: year = 2025 if MONTHS[lab] >= 9 else 2026   # 取证日期 2026-10；首个刻度若是月份名，属于 2025 年
            elif MONTHS[lab] == 1: year += 1
            ticks.append((x, dt.date(year, MONTHS[lab], 1)))
    # 年份刻度之后出现的月份名，年份不变；首个刻度为月份名且之后遇到「2026」时，之前的刻度是 2025
    xs = [t[0] for t in ticks]; ds = [t[1] for t in ticks]
    px_day = (xs[-1] - xs[0]) / (ds[-1] - ds[0]).days
    def kval(lab): return float(lab[:-1]) * 1000 if lab.endswith('K') else (float(lab) if lab else 0.0)
    y0t = [y for y, l in yt if l == ''][0]; yk = [(y, kval(l)) for y, l in yt if l != ''][0]
    per_star = (y0t - yk[0]) / yk[1]
    # 解析 SVG 路径的端点：m/l/h/v/c/q/a 及对应的绝对写法
    pts = []; x = y = 0.0; N = {'m': 2, 'l': 2, 'h': 1, 'v': 1, 'c': 6, 'q': 4, 'a': 7, 's': 4, 't': 2}
    for cmd, args in re.findall(r'([MmLlHhVvCcQqAaSsTtZz])([^MmLlHhVvCcQqAaSsTtZz]*)', d):
        nums = [float(n) for n in re.findall(r'-?\d*\.?\d+(?:e-?\d+)?', args)]; c = cmd.lower(); rel = cmd.islower()
        if c == 'z' or not nums: continue
        k = N[c]
        for i in range(0, len(nums) - k + 1, k):
            g = nums[i:i + k]
            if c in 'ml': x, y = (x + g[0], y + g[1]) if rel else (g[0], g[1])
            elif c == 'h': x = x + g[0] if rel else g[0]
            elif c == 'v': y = y + g[0] if rel else g[0]
            else: x, y = (x + g[-2], y + g[-1]) if rel else (g[-2], g[-1])
            pts.append((x, y))
    y0 = pts[0][1]   # 曲线起点 = 0 星
    out = []
    for px, py in pts:
        date = ds[0] + dt.timedelta(days=round((px - xs[0]) / px_day)); out.append([date.isoformat(), round((y0 - py) / per_star)])
    return out
res = {'note': 'star-history.com 的曲线采样点（由 SVG 路径反算，约 15–20 个点，点间是平滑曲线）；末点与 GitHub API 对照', 'retrieved': dt.date.today().isoformat()}
for repo in ['openclaw/openclaw', 'NousResearch/hermes-agent']:
    svg = fetch(repo); res[repo] = {'sha256': hashlib.sha256(svg.encode()).hexdigest(), 'points': points(svg)}
json.dump(res, open(os.path.join(OUT, 'out_15_star_history.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
for k in ['openclaw/openclaw', 'NousResearch/hermes-agent']: print(k, res[k]['points'][:3], '…', res[k]['points'][-2:])
