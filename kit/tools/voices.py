# 音色试听库：用同一段范例文本，把本机能用的每个配音音色各合成一遍，写进仓库根的 out/voices/（不入库），并生成一张试听页 index.html。
# 由 kit/tools/voices.js 调用，不直接运行。环境变量：LVS_REPO、LVS_OUT、LVS_ENGINES（edge,minimax）、LVS_LANGS（zh,en）、LVS_ONLY（音色 id 里包含的字样）、
#   LVS_FORCE（1 = 不用缓存重合成）、LVS_FFPROBE、LVS_MINIMAX_BASE。
# 范例文本覆盖配音里最容易出问题的几样：解释句与长句、年份、英文缩写与版本号、数字（404、500）、列举、问句与结论句（F12、F17）。
# 语速一律用引擎的缺省值（edge +0%，MiniMax 1.0），好比较音色本身；片子里实际用的语速记在各片的 project.json。
import asyncio, datetime, hashlib, html, json, os, re, subprocess, sys, time, zipfile

SAMPLES = {
    'zh': '垃圾回收器每隔一段时间扫描一次堆，找出不再被引用的对象，把内存还回去。1990 年，HTTP 只有一个 GET 方法；到了 2022 年，HTTP/3 已经跑在 QUIC 之上。'
          '比如 404，是没找到；500，是服务器崩了。为什么短短三位数，能说清请求停在了哪里、又该由谁负责？答案就在第一位数字。',
    'en': 'A garbage collector scans the heap from time to time, finds objects nothing refers to, and gives the memory back. '
          'In 1990, HTTP had a single method, GET; by 2022, HTTP/3 ran on top of QUIC. A 404 means not found; a 500 means the server broke. '
          'So how can three digits tell you where a request stopped, and who has to fix it? The answer is in the first digit.',
}
# MiniMax 的 get_voice 只列出少数英文音色；下面这些 id 在 2026-10-21 实测可以合成（或值得一试），合成失败的在试听页上标「不可用」
MINIMAX_EN_EXTRA = [
    'English_CalmWoman', 'English_ConfidentWoman', 'English_Wiselady', 'English_SereneWoman', 'English_expressive_narrator',
    'English_compelling_lady1', 'English_MatureBoss', 'English_Steadymentor', 'English_radiant_girl', 'English_Upbeat_Woman',
    'English_magnetic_voiced_man', 'English_FriendlyPerson', 'English_AnimeCharacter', 'English_SentimentalLady', 'English_ImposingManner',
    'English_captivating_female1', 'English_Soft-spokenGirl', 'English_Lucky_Robot', 'English_PlayfulGirl', 'English_Kind-heartedGirl',
    'Wise_Woman', 'Calm_Woman', 'Deep_Voice_Man', 'Imposing_Manner', 'Determined_Man', 'Inspirational_girl', 'Lively_Girl',
    'Friendly_Person', 'Decent_Boy', 'Elegant_Man', 'Exuberant_Girl', 'Abbess', 'Young_Knight', 'Patient_Man', 'Casual_Guy', 'Lovely_Girl',
]
EDGE_LOCALES = {'zh': ('zh-CN', 'zh-TW'), 'en': ('en-US', 'en-GB')}
REPO = os.environ['LVS_REPO']
OUT = os.environ.get('LVS_OUT') or os.path.join(REPO, 'out', 'voices')
ENGINES = (os.environ.get('LVS_ENGINES') or 'edge,minimax').split(',')
LANGS = (os.environ.get('LVS_LANGS') or 'zh,en').split(',')
ONLY = os.environ.get('LVS_ONLY') or ''
FORCE = os.environ.get('LVS_FORCE') == '1'
ZIP = os.environ.get('LVS_ZIP') == '1'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.makedirs(OUT, exist_ok=True)
CJK = re.compile(r'[一-鿿]')
OTHER_LANG = ('Cantonese', 'Japanese', 'Korean', 'Spanish', 'Portuguese', 'French', 'Indonesian', 'German', 'Russian', 'Arabic',
              'Turkish', 'Ukrainian', 'Italian', 'Dutch', 'Vietnamese', 'Thai', 'Polish', 'Romanian', 'Greek', 'Czech', 'Finnish', 'Hindi')

def probe(path):
    ff = os.environ.get('LVS_FFPROBE')
    if not ff: return None
    try:
        return float(subprocess.run([ff, '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True, timeout=30).stdout.strip())
    except Exception:
        return None

def fname(engine, lang, vid):
    key = hashlib.sha1(json.dumps([engine, vid, SAMPLES[lang]], ensure_ascii=False).encode('utf-8')).hexdigest()[:8]
    return '%s-%s-%s-%s.mp3' % (engine, lang, re.sub(r'[^A-Za-z0-9_-]+', '', vid.replace(' ', '_')), key)

# ── 列出音色 ──
def edge_voices():
    import edge_tts
    vs = asyncio.run(edge_tts.list_voices())
    out = []
    for lang in LANGS:
        for v in vs:
            if v['Locale'].startswith(EDGE_LOCALES.get(lang, ())):
                tags = ', '.join(v.get('VoiceTag', {}).get('VoicePersonalities', []))
                out.append({'engine': 'edge', 'lang': lang, 'id': v['ShortName'], 'name': v['ShortName'].split('-')[-1].replace('Neural', ''),
                            'desc': '%s · %s%s' % (v['Locale'], {'Female': '女声', 'Male': '男声'}.get(v['Gender'], v['Gender']), (' · ' + tags) if tags else '')})
    return out

def minimax_voices():
    import requests, minimax_tts
    key = minimax_tts.load_key()
    if not key:
        print('MiniMax：没有密钥，跳过（MINIMAX_API_KEY 或 kit/local/minimax-tts.md）'); return []
    base = os.environ.get('LVS_MINIMAX_BASE') or 'https://api.minimaxi.com'
    j = None
    for direct in (False, True):                  # 先按环境变量里的代理连，不通再直连
        try:
            s = requests.Session(); s.trust_env = not direct
            j = s.post(base + '/v1/get_voice', headers={'Authorization': 'Bearer ' + key}, json={'voice_type': 'system'}, timeout=60).json(); break
        except Exception as e:
            last = e
    if j is None:
        print('MiniMax：取音色列表失败', last); return []
    sysv = j.get('system_voice') or []
    out, seen = [], set()
    for v in sysv:
        vid, nm = v.get('voice_id', ''), v.get('voice_name', '') or ''
        d = v.get('description'); d = ' '.join(d) if isinstance(d, list) else (d or '')
        if vid.startswith(OTHER_LANG): continue
        if vid.startswith('Chinese (Mandarin)_') or vid.startswith(('male-', 'female-', 'presenter_', 'audiobook_')) or CJK.search(nm) and not vid.startswith('English_'):
            lang = 'zh'
        elif vid.startswith('English_') or not CJK.search(nm):
            lang = 'en'
        else:
            continue
        if lang in LANGS:
            out.append({'engine': 'minimax', 'lang': lang, 'id': vid, 'name': nm, 'desc': d}); seen.add(vid)
    if 'en' in LANGS:
        for vid in MINIMAX_EN_EXTRA:
            if vid not in seen: out.append({'engine': 'minimax', 'lang': 'en', 'id': vid, 'name': vid.replace('English_', '').replace('_', ' '), 'desc': '不在 get_voice 的列表里'})
    return out

# ── 合成 ──
def synth_edge(v, path):
    import edge_tts
    async def go():
        c = edge_tts.Communicate(SAMPLES[v['lang']], v['id'])
        await c.save(path)
    asyncio.run(go())

def synth_minimax(v, path):
    import minimax_tts
    for k in range(8):
        try:
            minimax_tts.synth(SAMPLES[v['lang']], v['lang'], 'speech-2.8-hd', v['id'], '1', path); return
        except minimax_tts.ApiError as e:
            if e.code == 1002: time.sleep(4 + 2 * k); continue      # 每分钟请求数超限：等一等再试
            raise

def main():
    voices = []
    if 'edge' in ENGINES:
        try: voices += edge_voices()
        except Exception as e: print('edge：取音色列表失败', type(e).__name__, str(e)[:120])
    if 'minimax' in ENGINES: voices += minimax_voices()
    if ONLY: voices = [v for v in voices if ONLY.lower() in v['id'].lower()]
    meta_path = os.path.join(OUT, 'voices.json')
    meta = {}
    if os.path.exists(meta_path):
        try: meta = {(m['engine'], m['lang'], m['id']): m for m in json.load(open(meta_path, encoding='utf-8'))}
        except Exception: meta = {}
    for i, v in enumerate(voices):
        f = fname(v['engine'], v['lang'], v['id']); p = os.path.join(OUT, f)
        v['file'] = f
        if os.path.exists(p) and not FORCE:
            v['d'] = probe(p); v['ok'] = True; print('[%d/%d] 缓存 %s %s' % (i + 1, len(voices), v['engine'], v['id'])); continue
        try:
            (synth_edge if v['engine'] == 'edge' else synth_minimax)(v, p)
            v['d'] = probe(p); v['ok'] = True
            print('[%d/%d] 合成 %s %s %.1fs' % (i + 1, len(voices), v['engine'], v['id'], v['d'] or 0), flush=True)
        except Exception as e:
            v['ok'] = False; v['err'] = str(e)[:160]
            if os.path.exists(p): os.remove(p)
            print('[%d/%d] 不可用 %s %s：%s' % (i + 1, len(voices), v['engine'], v['id'], v['err']), flush=True)
    for v in voices: meta[(v['engine'], v['lang'], v['id'])] = v
    allv = sorted(meta.values(), key=lambda m: (m['lang'], m['engine'], not m.get('ok'), m['id']))
    json.dump(allv, open(meta_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    write_index(allv)
    write_sheet(allv)
    if ZIP: pack(allv)
    print('试听页：%s（%d 个可用，%d 个不可用）' % (os.path.join(OUT, 'index.html'), sum(1 for m in allv if m.get('ok')), sum(1 for m in allv if not m.get('ok'))))

# ── 评价表与压缩包：交给策划者离线试听，评价写回 docs/guides/script.md 第 9 节 ──
def write_sheet(allv):
    ok = sorted((m for m in allv if m.get('ok')), key=lambda m: (m['lang'] != 'zh', m['engine'], m['id']))
    L = ['# 音色评价表', '', '试听：用浏览器打开同目录的 `index.html`（可整组连续播放），或直接播放 mp3。每个音色读同一段文本，语速是引擎的缺省值。', '',
         '在「评价」一栏写感受（例如「严肃、可用」「太老气」「停用」），写完交回；评价记进 `docs/guides/script.md` 第 9 节。', '',
         '| # | 语言 | 引擎 | 音色 id | 名称 | 时长 | 文件 | 评价 |', '|---|---|---|---|---|---|---|---|']
    for i, m in enumerate(ok, 1):
        L.append('| %d | %s | %s | `%s` | %s | %.1f s | %s |  |' % (i, {'zh': '中文', 'en': '英文'}[m['lang']], {'edge': 'Edge', 'minimax': 'MiniMax'}[m['engine']],
                 m['id'], (m.get('name') or '').replace('|', '/'), m.get('d') or 0, m['file']))
    open(os.path.join(OUT, '评价表.md'), 'w', encoding='utf-8', newline='\n').write('\n'.join(L) + '\n')

def pack(allv):
    z = os.path.join(os.path.dirname(OUT), 'voices-%s.zip' % datetime.date.today().isoformat())
    with zipfile.ZipFile(z, 'w', zipfile.ZIP_STORED) as f:
        for name in ['index.html', '评价表.md', 'voices.json'] + [m['file'] for m in allv if m.get('ok')]:
            f.write(os.path.join(OUT, name), 'voices/' + name)
    print('压缩包：%s' % z)

# ── 试听页 ──
def notes_from_docs():
    """docs/guides/script.md 第 9 节「音色记录」表里的评价，按音色 id 取出来，显示在试听页上。"""
    f = os.path.join(REPO, 'docs', 'guides', 'script.md')
    out = {}
    try:
        for ln in open(f, encoding='utf-8'):
            m = re.match(r'\|\s*`([^`]+)`[^|]*\|(.*)\|\s*$', ln)
            if m:
                cells = [c.strip() for c in m.group(2).split('|')]
                out[m.group(1)] = ' / '.join(c for c in cells if c)
    except OSError:
        pass
    return out

def write_index(allv):
    notes = notes_from_docs()
    E = html.escape
    rows = {}
    for m in allv:
        rows.setdefault((m['lang'], m['engine']), []).append(m)
    parts = []
    for (lang, engine), ms in sorted(rows.items(), key=lambda kv: (kv[0][0] != 'zh', kv[0][1])):   # 中文在前
        title = {'zh': '中文', 'en': '英文'}[lang] + ' · ' + {'edge': 'Edge（edge-tts，免费在线语音）', 'minimax': 'MiniMax speech-2.8-hd'}[engine]
        parts.append('<h2>%s <button onclick="playAll(this)">连续播放</button></h2><table><tr><th>音色 id</th><th>名称与描述</th><th>试听</th><th>时长</th><th>语速</th><th>仓库里的评价</th></tr>' % E(title))
        n = len(re.sub(r'[，。；：、？\s,.;:?]', '', SAMPLES[lang])) if lang == 'zh' else len(SAMPLES[lang].split())
        for m in ms:
            if m.get('ok'):
                rate = ('%.1f 字/秒' % (n / m['d'])) if lang == 'zh' and m.get('d') else ('%.2f 词/秒' % (n / m['d'])) if m.get('d') else ''
                cell = '<audio controls preload="none" src="%s"></audio>' % E(m['file'])
                dur = '%.1f s' % m['d'] if m.get('d') else ''
            else:
                rate, cell, dur = '', '<span class="bad">不可用</span><br><small>%s</small>' % E(m.get('err', '')), ''
            parts.append('<tr><td><code>%s</code></td><td>%s<br><small>%s</small></td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>' % (
                E(m['id']), E(m.get('name', '')), E(m.get('desc', '')), cell, dur, rate, E(notes.get(m['id'], ''))))
        parts.append('</table>')
    page = '''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>音色试听</title><style>
body{font:15px/1.5 system-ui,sans-serif;margin:24px;max-width:1500px;color:#1d1d1d;background:#fafaf7}
table{border-collapse:collapse;width:100%%;margin-bottom:28px}td,th{border-bottom:1px solid #ddd;padding:6px 8px;text-align:left;vertical-align:top}
th{background:#eee}code{font-size:13px}small{color:#666}.bad{color:#b33}blockquote{background:#fff;border-left:4px solid #999;margin:8px 0;padding:8px 12px}
h2{margin-top:32px}button{font-size:13px;margin-left:12px}</style></head><body>
<h1>音色试听</h1>
<p>由 <code>node kit/tools/voices.js</code> 生成。每个音色读同一段文本，语速用引擎缺省值（Edge +0%%，MiniMax 1.0），只比较音色本身；片子里常把语速调到 1.05–1.25。评价写进 <code>docs/guides/script.md</code> 第 9 节「音色记录」，下次生成时显示在最后一栏。</p>
<p><b>中文范例</b></p><blockquote>%s</blockquote><p><b>英文范例</b></p><blockquote>%s</blockquote>
%s
<script>
function playAll(btn){const t=btn.closest('h2').nextElementSibling,as=[...t.querySelectorAll('audio')];let i=0;
 const next=()=>{if(i>=as.length)return;const a=as[i++];a.scrollIntoView({block:'center'});a.onended=next;a.play();};next();}
</script></body></html>''' % (E(SAMPLES['zh']), E(SAMPLES['en']), '\n'.join(parts))
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(page)

main()
