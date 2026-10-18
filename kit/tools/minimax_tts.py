# MiniMax T2A v2 语音合成（HTTP，非流式）。由 tts.py / tts_probe.py 在 project.json 的 tts.engine 为 minimax 时调用。
# 密钥：环境变量 MINIMAX_API_KEY，或 kit/local/minimax-tts.md「## 密钥」下的代码块（kit/local/ 不入库）。密钥只放在请求头里，不打印、不写盘。
# 接口地址：LVS_MINIMAX_BASE（tts.js 从 kit/config.local.json 的 minimax_base 传入）；没有时依次试中国区与国际区。
# 词边界：subtitle_type=word 返回逐字/逐词时间戳，按原文偏移合并成 [[起点秒, 时长秒, 文本], ...]，与 edge-tts 的 words 同格式。
import json, os, re, subprocess, time
import requests

BASES = ["https://api.minimaxi.com", "https://api.minimax.io"]
BOOST = {"zh": "Chinese", "en": "English"}

def load_key():
    k = os.environ.get("MINIMAX_API_KEY", "").strip()
    if k:
        return k
    repo = os.environ.get("LVS_REPO") or os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    f = os.path.join(repo, "kit", "local", "minimax-tts.md")
    try:
        m = re.search(r"##\s*密钥.*?```[^\n]*\n(.*?)\n```", open(f, encoding="utf-8").read(), re.S)
        return m.group(1).strip() if m else ""
    except OSError:
        return ""

class ApiError(Exception):
    def __init__(self, code, msg):
        super().__init__("MiniMax %s %s" % (code, msg)); self.code = code

_base = [os.environ.get("LVS_MINIMAX_BASE") or None]

def _post(base, key, body):
    r = requests.post(base + "/v1/t2a_v2", headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"}, json=body, timeout=120)
    try:
        j = r.json()
    except ValueError:
        raise ApiError(r.status_code, "non-JSON response")
    br = j.get("base_resp") or {}
    if br.get("status_code", -1) != 0:
        raise ApiError(br.get("status_code"), br.get("status_msg", ""))
    return j

def _get_json(url):
    # 字幕文件放在对象存储上；经代理常超时，先直连再走代理
    last = None
    for direct in (True, False):
        try:
            s = requests.Session(); s.trust_env = not direct
            return s.get(url, timeout=30).json()
        except Exception as e:
            last = e
    raise last

def probe_seconds(path):
    ff = os.environ.get("LVS_FFPROBE")
    if not ff:
        return None
    try:
        out = subprocess.run([ff, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True, timeout=30).stdout.strip()
        return float(out)
    except Exception:
        return None

def words_from_subtitle(text, segs):
    """把 timestamped_words 合并成 [[起点, 时长, 原文片段]]：同一原文片段（如「1.5」读成「一点五」）合成一条。"""
    out = []
    for seg in segs or []:
        prev = None
        for w in seg.get("timestamped_words") or []:
            span = (w.get("word_begin"), w.get("word_end"))
            t0, t1 = w["time_begin"] / 1000.0, w["time_end"] / 1000.0
            if prev is not None and span == prev[0]:
                prev[1][1] = max(prev[1][1], t1)
                continue
            wt = w.get("word") or ""
            if not wt.strip():
                continue
            prev = (span, [t0, t1, wt])
            out.append(prev[1])
    return [[round(a, 3), round(max(0.0, b - a), 3), t] for a, b, t in out]

def synth(text, lang, model, voice, speed, out_path):
    """合成一句，写 out_path（mp3），返回 (d, words)。失败抛异常，由调用方重试。"""
    key = load_key()
    if not key:
        raise SystemExit("MiniMax：没有密钥（MINIMAX_API_KEY 或 kit/local/minimax-tts.md）")
    body = {"model": model, "text": text, "stream": False,
            "voice_setting": {"voice_id": voice, "speed": float(speed), "vol": 1.0, "pitch": 0},
            "audio_setting": {"sample_rate": 32000, "bitrate": 128000, "format": "mp3", "channel": 1},
            "subtitle_enable": True, "subtitle_type": "word", "language_boost": BOOST.get(lang, "auto")}
    bases = [_base[0]] if _base[0] else BASES
    j = None
    for i, b in enumerate(bases):
        try:
            j = _post(b, key, body); _base[0] = b; break
        except ApiError as e:
            if e.code in (1004, 2049) and i + 1 < len(bases):      # 鉴权失败：可能是另一区域的密钥
                continue
            raise
    data = j.get("data") or {}
    if not data.get("audio"):
        raise RuntimeError("MiniMax: empty audio")
    audio = bytes.fromhex(data["audio"])
    if not data.get("subtitle_file"):
        raise RuntimeError("MiniMax: no subtitle_file")
    words = words_from_subtitle(text, _get_json(data["subtitle_file"]))
    if not words:
        raise RuntimeError("MiniMax: no word timestamps")
    open(out_path, "wb").write(audio)
    real = probe_seconds(out_path) or ((j.get("extra_info") or {}).get("audio_length", 0) / 1000.0)
    d = words[-1][0] + words[-1][1] + 0.12                     # 与 edge 路径一致：最后一个词结束后留 0.12 s
    if real:
        d = min(d, real)
    return round(d, 3), words

def base_used():
    return _base[0]
