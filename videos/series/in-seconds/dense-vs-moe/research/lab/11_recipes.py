# 11 vLLM 官方部署配方（recipes.vllm.ai）里 Qwen3.8-2.4T-A95B 与 Qwen3.8-27B 的显卡用量
#    - 2.4T：「Choosing a variant」表，各精度的权重大小与在各型号显卡上要几张
#    - 27B：页首摘要「Fits one Blackwell GPU in every precision …」
#    - Flash-Next：n-gram 嵌入可以异步卸载到主机内存（第四部分账本的脚注）
#    第四部分「许多张显卡」「一张显卡」两个画面的依据。页面会更新：回显里记下取用日期
import datetime, html, json, os, re, time, urllib.request
LAB = os.path.dirname(os.path.abspath(__file__))
def lines(url):
    for k in range(5):   # 偶发连接重置：重试
        try:
            with urllib.request.urlopen(url, timeout=60) as r: t = r.read().decode('utf-8', 'replace')
            break
        except OSError:
            if k == 4: raise
            time.sleep(3)
    t = re.sub(r'<script.*?</script>|<style.*?</style>', '', t, flags=re.S)
    return [l.strip() for l in html.unescape(re.sub(r'<[^>]+>', '\n', t)).splitlines() if l.strip()]
out = open(os.path.join(LAB, 'out_11_recipes.txt'), 'w', encoding='utf-8', newline='\n')
def say(*a):
    s = ' '.join(str(x) for x in a); print(s); out.write(s + '\n')
say('取用日期', datetime.date.today().isoformat())
U24 = 'https://recipes.vllm.ai/Qwen/Qwen3.8-2.4T-A95B'
L = lines(U24)
i = L.index('Variant')
head = L[i:i + 7]                                  # Variant / Weights / Sized / B300 / MI355X / H200 / GB300 tray
assert head[3:] == ['B300 (268 GB)', 'MI355X (288 GB)', 'H200 (141 GB)', 'GB300 tray (4 GPU)'], head
rows, j = [], i + 7
while L[j] != 'TP must divide the 64 attention heads':
    rows.append(L[j:j + 7]); j += 7
say(f'== {U24}  「Choosing a variant」')
say('   ' + ' | '.join(head))
for r in rows: say('   ' + ' | '.join(r))
bf16 = next(r for r in rows if r[0] == 'BF16')
assert bf16[2] == '5871 GB' and bf16[3] == '24 GPUs' and bf16[5] == '48 GPUs'
U27 = 'https://recipes.vllm.ai/Qwen/Qwen3.8-27B'
L = lines(U27)
fit = next(l for l in L if l.startswith('Fits one Blackwell GPU'))
say(f'== {U27}\n   {fit}')
assert fit.startswith('Fits one Blackwell GPU in every precision')
UFL = 'https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next'
L = lines(UFL)
i = next(k for k, l in enumerate(L) if 'offloaded to host memory' in l)
off = ' '.join(L[i - 1:i + 2])                    # 连同后面的括注「目前只在 Nvidia 设备上可用」
say(f'== {UFL}\n   {off}')
assert '51B lookup memory' in off and 'offloaded to host memory' in off
json.dump({'max': {'url': U24, 'head': head, 'rows': rows}, 'q27': {'url': U27, 'fit': fit}, 'flash': {'url': UFL, 'offload': off}},
          open(os.path.join(LAB, 'recipes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
out.close()
