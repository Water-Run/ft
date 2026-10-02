# 读法试验：把若干写法各合成一句，再用 Whisper 回听。由 kit/tools/tts_probe.js 调用。
# 环境变量：LVS_REPO、LVS_VIDEO、LVS_LANG、LVS_VOICE、LVS_RATE；句子从标准输入读（JSON 数组）。
import asyncio, sys, json, os, edge_tts
REPO = os.environ["LVS_REPO"]; VIDEO = os.environ["LVS_VIDEO"]; VLANG = os.environ["LVS_LANG"]
voice = os.environ["LVS_VOICE"]; rate = os.environ["LVS_RATE"]
sents = json.loads(sys.stdin.buffer.read().decode("utf-8"))
out = os.path.join(VIDEO, "audio", "probe"); os.makedirs(out, exist_ok=True)
async def synth(i, text):
    c = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    data = bytearray(); words = []
    async for ch in c.stream():
        if ch["type"] == "audio": data += ch["data"]
        elif ch["type"] == "WordBoundary": words.append(ch["text"])
    open(os.path.join(out, "p%02d.mp3" % i), "wb").write(bytes(data))
    return words
async def main():
    return await asyncio.gather(*[synth(i, s) for i, s in enumerate(sents)])
wb = asyncio.run(main())
heard = None
try:
    from faster_whisper import WhisperModel
    name = os.environ.get("LVS_ASR_MODEL") or "fw-small"; local = os.path.join(REPO, "assets", "whisper")
    files = [os.path.abspath(os.path.join(out, "p%02d.mp3" % i)) for i in range(len(sents))]
    if os.path.isdir(os.path.join(local, name)): os.chdir(local)
    elif name == "fw-small": name = "small"
    m = WhisperModel(name, device=os.environ.get("LVS_ASR_DEVICE") or "cpu", compute_type="int8", cpu_threads=max(2, min(12, (os.cpu_count() or 4) - 2)))
    heard = [" ".join(x.text.strip() for x in m.transcribe(f, language=VLANG, vad_filter=False, condition_on_previous_text=False)[0]) for f in files]
except ImportError:
    pass
for i, s in enumerate(sents):
    print("%02d 写法: %s\n   听到: %s\n   词边界: %s" % (i, s, heard[i] if heard else "（未安装 faster-whisper，无法回听）", "|".join(wb[i])), flush=True)
print("音频留在 audio/probe/p<序号>.mp3，可直接试听。")
