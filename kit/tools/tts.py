# 逐句合成旁白（edge-tts，或 MiniMax）。由 kit/tools/tts.js 调用，环境变量：LVS_VIDEO、LVS_LANG、LVS_VOICE、LVS_RATE；
# LVS_ENGINE=minimax 时另读 LVS_MODEL、LVS_SPEED（音色仍是 LVS_VOICE），见 minimax_tts.py。
# 读 build/cues.<语言>.json（[{id, tts}]），写 audio/<语言>/cues/<id>.mp3、audio/<语言>/cache.json、audio/<语言>/dur.json。
# dur.json: { id: { d: 语音时长秒, words: [[起点秒, 时长秒, 文本], ...] } }
# 以（引擎、模型、音色、语速、文本）的哈希做缓存：改了哪句只重新合成哪句。edge 的缓存键保持旧格式（音色|语速|文本）。
import asyncio, json, os, hashlib
VIDEO = os.environ["LVS_VIDEO"]; VLANG = os.environ["LVS_LANG"]
VOICE = os.environ["LVS_VOICE"]; RATE = os.environ.get("LVS_RATE", "+0%")
ENGINE = os.environ.get("LVS_ENGINE") or "edge"
MODEL = os.environ.get("LVS_MODEL", ""); SPEED = os.environ.get("LVS_SPEED") or "1"
if ENGINE == "minimax":
    import minimax_tts
else:
    import edge_tts
AUD = os.path.join(VIDEO, "audio", VLANG); OUT = os.path.join(AUD, "cues")
os.makedirs(OUT, exist_ok=True)
cues = json.load(open(os.path.join(VIDEO, "build", "cues.%s.json" % VLANG), encoding="utf-8"))
cache_path = os.path.join(AUD, "cache.json")
cache = json.load(open(cache_path, encoding="utf-8")) if os.path.exists(cache_path) else {}
sem = asyncio.Semaphore(int(os.environ.get("LVS_TTS_JOBS") or 4))
made = 0
async def synth(cid, text):
    global made
    spec = "%s|%s|%s" % (VOICE, RATE, text) if ENGINE == "edge" else "minimax|%s|%s|%s|%s" % (MODEL, VOICE, SPEED, text)
    key = hashlib.sha1(spec.encode("utf-8")).hexdigest()
    path = os.path.join(OUT, cid + ".mp3")
    if cache.get(cid, {}).get("key") == key and os.path.exists(path):
        return
    async with sem:
        if ENGINE == "minimax":
            for attempt in range(7):
                try:
                    d, words = await asyncio.to_thread(minimax_tts.synth, text, VLANG, MODEL, VOICE, SPEED, path)
                    cache[cid] = {"key": key, "d": d, "words": words, "text": text}
                    made += 1
                    print("synth", cid, d, flush=True)
                    return
                except SystemExit:
                    raise
                except Exception as e:
                    print("retry", cid, str(e)[:200], flush=True)     # 只打印错误摘要；密钥不在异常文本里
                    await asyncio.sleep(min(30, 2 * 2 ** attempt))
            raise SystemExit("failed: " + cid)
        for attempt in range(4):
            try:
                c = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary")
                words = []; data = bytearray()
                async for ch in c.stream():
                    if ch["type"] == "audio": data += ch["data"]
                    elif ch["type"] == "WordBoundary":
                        words.append([round(ch["offset"]/1e7, 3), round(ch["duration"]/1e7, 3), ch["text"]])
                if not words or not data: raise RuntimeError("empty")
                open(path, "wb").write(bytes(data))
                d = round(words[-1][0] + words[-1][1] + 0.12, 3)
                cache[cid] = {"key": key, "d": d, "words": words, "text": text}
                made += 1
                print("synth", cid, d, flush=True)
                return
            except Exception as e:
                print("retry", cid, repr(e), flush=True)
                await asyncio.sleep(1.5 * (attempt + 1))
        raise SystemExit("failed: " + cid)
async def main():
    await asyncio.gather(*[synth(c["id"], c["tts"]) for c in cues])
    ids = {c["id"] for c in cues}
    for k in list(cache):
        if k not in ids:
            del cache[k]
            try: os.remove(os.path.join(OUT, k + ".mp3"))          # 脚本里已经删掉的句子，音频也一并清掉
            except OSError: pass
    json.dump(cache, open(cache_path, "w", encoding="utf-8"), ensure_ascii=False)
    dur = {k: {"d": v["d"], "words": v["words"]} for k, v in cache.items()}
    json.dump(dur, open(os.path.join(AUD, "dur.json"), "w", encoding="utf-8"), ensure_ascii=False)
    total = sum(v["d"] for v in dur.values())
    chars = sum(len(v["text"]) for v in cache.values())
    sp = "engine=minimax model=%s voice=%s speed=%s base=%s" % (MODEL, VOICE, SPEED, minimax_tts.base_used()) if ENGINE == "minimax" else "voice=%s rate=%s" % (VOICE, RATE)
    print("%s  %s  cues %d (synthesized %d, cached %d)  speech %.1fs  %.2f chars/s" % (VLANG, sp, len(dur), made, len(dur) - made, total, chars / max(1e-6, total)))
asyncio.run(main())
