# 用 Whisper 回听旁白，核对读音与逐句内容（只做检查，不参与成片）。由 kit/tools/asr.js 调用。
# 环境变量：LVS_REPO、LVS_VIDEO、LVS_LANG、LVS_ASR_PROMPT；可选 LVS_ASR_MODEL（默认 fw-small）、LVS_ASR_DEVICE（默认 cpu）、LVS_ASR_AUDIO（默认 out/<语言>/audio_voice.wav）
import os, sys
from faster_whisper import WhisperModel
REPO = os.environ["LVS_REPO"]; VIDEO = os.environ["LVS_VIDEO"]; VLANG = os.environ.get("LVS_LANG", "zh").strip()
AUDIO = os.environ.get("LVS_ASR_AUDIO") or os.path.join(VIDEO, "out", VLANG, "audio_voice.wav")
OUT = os.path.join(VIDEO, "out", VLANG, "asr.txt")
name = os.environ.get("LVS_ASR_MODEL") or "fw-small"
local = os.path.join(REPO, "assets", "whisper")
if os.path.isdir(os.path.join(local, name)):
    os.chdir(local)                      # 模型按相对路径加载：仓库路径里有非 ASCII 字符时，底层库按本地代码页解析绝对路径会失败
elif name == "fw-small":
    name = "small"                       # 本机没有放模型：交给 faster-whisper 自行下载到它的缓存目录
m = WhisperModel(name, device=os.environ.get("LVS_ASR_DEVICE") or "cpu", compute_type="int8", cpu_threads=max(2, min(12, (os.cpu_count() or 4) - 2)))
segs, info = m.transcribe(AUDIO, language=VLANG, vad_filter=True, word_timestamps=False, condition_on_previous_text=False, initial_prompt=os.environ.get("LVS_ASR_PROMPT") or None)
out = ["%7.2f %7.2f %s" % (s.start, s.end, s.text.strip()) for s in segs]
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w", encoding="utf-8").write("\n".join(out))
print("segments", len(out), file=sys.stderr)
