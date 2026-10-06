# 120 秒关于什么是 2FA，以及它是怎么工作的

「XX 秒速通」系列的首集。一部 120 秒的科普片：先给出双因素认证（2FA）的定义，再用一组真实算出的数据演示 TOTP 验证码怎样由一个共享密钥和当前时间得到，最后比较几种验证方式的强弱。中文与英文两个版本，时长相同。

制作流程与标准见仓库的 `docs/`；片中每一句陈述的出处见 `research/FACTS.md`；系列的约定见 [`../README.md`](../README.md)。

## 内容

全片 120 秒，正好是 TOTP 的 4 个时间步（每步 30 秒）。前四个场景各从一个时间步的起点开始，右上角的验证码在场景交界处更换；片尾名单从 112.5 秒起。

| 场景 | 起点 | 内容 |
|---|---|---|
| open | 0:00 | 现象：6 位数字每 30 秒一换，手机不联网，服务器却知道它 → 片名 → 只验证密码时密码泄露即失守 → 验证依据的三类 → 双因素 = 不同的两类 |
| seed | 0:30 | TOTP 的名字 → 服务器生成密钥，经二维码交给手机 → 另一个输入是时间：一条从 1970 年画起的时间轴（1984 专利申请、1997 HMAC、2005 HOTP、2011 TOTP）→ 由「年」推近到「秒」→ 除以 30 取整得到计数器 |
| code | 1:00 | 密钥与计数器送进 HMAC-SHA-1 → 20 个字节 → 末字节的低 4 位给出偏移 → 取 4 个字节、去掉最高位、读成整数、留末 6 位 → 服务器同算一遍，两边一致 |
| rank | 1:30 | 短信验证码、TOTP、WebAuthn 各自会被哪种攻击攻破（CISA 2022）→ 结论：任何一种都好过只有密码（Google 2019 的数据） |
| outro | 1:52.5 | 制作名单与开源仓库地址 |

**定长的时间线。** 片名里的秒数就是成片的时长。`src/js/script.js` 里每个场景带一个 `at`（开始的时刻），`TOTAL = 120`；一场的旁白说完后余下的时间留白到下一场的定点，说不完就记入 `L.problems`，总闸门不通过。两种语言各排各的句间停顿，场景的起点相同。

## 视觉系统

名称「计时盘」。墨色 `#0c0d0f`、纸色 `#f2efe8` 两种底，一种强调色朱红 `#ff4a1c`；平涂，不用阴影、渐变与圆角。

| 约定 | 含义 |
|---|---|
| 墨色底 / 纸色底 | 手机一侧 / 服务器一侧。两侧并排时是一张左右对开的画面：开场提出问题时出现一次，code 一章算完之后再出现一次 |
| 朱红 | 只给「此刻」：表盘的指针与走过的刻度、时间轴上的现在、被选中的字节、最终的验证码；整屏朱红只用于片名与结论 |
| 圆 | 只表示时间：30 道刻度的表盘，指针每秒跳一格，每个时间步归零 |
| 方块 | 数据：字节格、比特格（实心为 1，空心为 0）、二维码的模块 |
| 斜线 | 不可信的一方：泄露出去的密码副本、走得通的攻击、假网站 |
| 字体 | 数字与数据用 JetBrains Mono，拉丁文字用 Inter，中文用 Noto Sans SC |

常驻元素：底部的字幕带上沿是一把 120 格的秒尺，一秒一格，走过的变朱红；左上角是剩余秒数；右上角是此刻真实的验证码与 30 秒表盘。每逢 30 秒，表盘的指针放大到全屏扫一圈，新场景从扇形里露出来，这是全片唯一的换场方式；片尾名单不在换码时刻开始，改为由左向右直刷。

时间轴由 `s1_seed.js` 逐帧按当前的缩放重算刻度与标注（十年、年、月、日、时、分、十秒、秒八级），镜头不动，轴自己从 56 年的全景连续推到每秒 40 像素。

**参考与原创。** 没有参照某一部现成的视频或产品。两处取材于通行的界面惯例，并按本片内容重新设计：验证器应用里「六位数字加一个 30 秒计时」的呈现方式（本片改成带刻度与跳秒指针的表盘，不沿用任何一款应用的圆环或配色）；二维码与 `otpauth://` 链接是讲解对象本身，按实验生成的真实矩阵原样画出。文案、分镜、构图与动效均为本片自行设计。选定方向之前比较过三组关键帧（计时盘、黄黑模块、刻度纸），比较页留在 `src/design/kf.html`。

## 取证

- 算法以 RFC 4226、RFC 6238 为准；`research/lab/totp_ref.py` 逐步实现并返回中间值，`00_rfc_vectors.py` 用两份 RFC 自带的测试向量核对，全部一致。
- 片中的密钥、计数器、HMAC 的 20 个字节、偏移量、31 位整数与四个验证码由 `02_film_values.py` 算出，另用 Node.js 的 `crypto`（`03_cross_node.js`）与 PyOTP（`04_cross_pyotp.py`）各算一遍，三者一致。
- 二维码由 `05_qr.py` 生成，并用 OpenCV 解码回文本，与密钥 URI 相同。
- `tools/gen_data.py` 把上述结果转成 `src/js/data.js`；场景代码不手写这些数。
- 演示密钥是固定短语的 SHA-1，不对应任何真实账号；演示时刻是任取的，选取规则写在 `01_pick_time.py` 里。
- 定义、强弱比较与历史节点的出处（NIST、CISA、Google、W3C、专利文本等）逐条列在 `research/FACTS.md`。

重做一遍（需要 Python 3、Node.js，以及 `pip install pyotp segno opencv-python-headless`）：

```bash
cd videos/series/in-seconds/two-factor-auth/research/lab
python 00_rfc_vectors.py && python 01_pick_time.py && python 02_film_values.py
node 03_cross_node.js && python 04_cross_pyotp.py && python 05_qr.py
python ../../tools/gen_data.py          # 重新生成 src/js/data.js，应逐字节不变
```

## 读法

字幕写正式拼写，送去合成的文本按 `script.js` 的 `SAY` 表替换，均经 `tts_probe.js` 试验：

| 字幕 | 中文旁白的写法 | 英文旁白的写法 | 原因 |
|---|---|---|---|
| 2FA | two F A | 不变 | 中文音色缺省读成近似「二 A F」的音 |
| HMAC | H mac | 不变 | 中文音色缺省逐字母读 |
| WebAuthn | Web Authen | Web Authen | 两种音色缺省都读不成词，英文读成 web often |

中文稿里「计数」与「技术」同音，定稿用「计数器」。语速：中文 +6%，英文 +8%；英文的「过快」阈值按本系列定为每秒 4 词（短词多的句子按词数计会偏高）。

## 声音

配乐由本片的 `tools/music.py` 合成（`project.json` 的 `audio.music` 指向它，由 `kit/tools/mix.py` 调用），120 拍/分，一秒两拍；每个时间步 15 小节，段落交界落在换码的那一拍。编排：引子只有铺底与每秒一声的「秒针」，第 8 秒起加轻的底鼓与低音；第二段加拨弦琶音；第三段再叠十六分音符的高音区琶音；第四段转半拍，结论那一拍（大字落下的同一拍）抬起；片尾只留铺底、秒针与一声收束。画面上的重音吸附在八分音符（0.25 秒）的网格上。

配乐与音效都是程序合成的，制作者听不到：混音数值见「成片」，听感由人确认。

## 制作署名与片尾

策划：WaterRun。

开源视频：[GitHub · Water-Run/ft](https://github.com/Water-Run/ft)。

| 参与模型（含可确认的版本） | 实际分工 |
|---|---|
| Claude Opus 5.5 | 取证、脚本、翻译、视觉设计、场景与动画、配乐编写、封面、审查 |
| Microsoft Edge 在线语音合成（音色 zh-CN-YunyangNeural、en-US-AndrewNeural；模型未披露） | 两种语言的旁白 |
| Whisper small（faster-whisper，本地运行） | 读法试验与读音回听 |
| 制作会话自带的 WebSearch、WebFetch（内部所用模型未披露） | 取证时查找与摘录原始来源 |

片尾时段：两种语言都是 112.5–120.0 秒，名单六行自 113.1 秒起逐行出现、约 114 秒全部到位，停留到片尾。各版本的核对结果见「成片」。

## 复现

```bash
node kit/tools/tts.js     videos/series/in-seconds/two-factor-auth     # 合成旁白，更新时间线
node kit/tools/check.js   videos/series/in-seconds/two-factor-auth     # 制作期总闸门
node kit/tools/audio.js   videos/series/in-seconds/two-factor-auth     # 混音
node kit/tools/preview.js videos/series/in-seconds/two-factor-auth     # 低清预演
node kit/tools/render.js  videos/series/in-seconds/two-factor-auth     # 渲染
node kit/tools/finish.js  videos/series/in-seconds/two-factor-auth     # 封装成片
node kit/tools/covers.js  videos/series/in-seconds/two-factor-auth     # 封面
node kit/tools/check.js   videos/series/in-seconds/two-factor-auth --final
```

## 成片

两种语言都在 `out/`，由 `node kit/tools/check.js videos/series/in-seconds/two-factor-auth --final` 核对通过，结论为「全部通过」，其中包含两版的交付物清单，以及「渲染之后源文件未再改动」的过期检测。

| | 中文 | 英文 |
|---|---|---|
| 时长 | 120.00 秒（7200 帧） | 120.00 秒（7200 帧） |
| 画面 | 1920×1080，60 帧/秒，H.264 | 同左 |
| 声音 | AAC | 同左 |
| 整体响度 | -16.7 LUFS（封装增益 +3.2 dB） | -15.6 LUFS（+3.8 dB） |
| 真峰值 | -1.4 dBFS | -1.5 dBFS |
| 静帧（≥3 秒） | 无 | 无 |
| 空画面 | 无（内容占比中位 16.2%，最小 1.41%） | 无（中位 14.8%，最小 1.32%） |

封装前的混音轨，两版各 181 个音效事件，分布一致（open 40 / seed 32 / code 52 / rank 25 / outro 12）：

| | 中文 | 英文 |
|---|---|---|
| 旁白 | -21.7 dB | -21.8 dB |
| 配乐 | -36.9 dB | -37.1 dB |
| 音效 | -32.1 dB | -31.9 dB |
| 混音轨峰值 | 0.97 | 0.62 |
| 成片整体 | -23.0 dB | -22.6 dB |
| 混音轨响度（增益前） | I -18.8 LUFS，LRA 5.7 LU，峰值 -0.3 dBFS | I -19.4 LUFS，LRA 3.9 LU，峰值 -4.1 dBFS |

交付物（`out/`）：

| 文件 | 中文 | 英文 |
|---|---|---|
| 成片 | `two-factor-auth-zh-1080p60.mp4`（37.7 MB） | `two-factor-auth-en-1080p60.mp4`（37.7 MB） |
| 去配乐 | `two-factor-auth-zh-1080p60-no-music.mp4`（37.2 MB） | `two-factor-auth-en-1080p60-no-music.mp4`（37.2 MB） |
| 仅旁白 | `two-factor-auth-zh-1080p60-voice-only.mp4`（36.7 MB） | `two-factor-auth-en-1080p60-voice-only.mp4`（36.7 MB） |
| 字幕 | `two-factor-auth-zh.srt`（31 条） | `two-factor-auth-en.srt`（31 条） |
| 封面 16:9 | `cover-zh-16x9.jpg`、`cover-zh-16x9-3840x2160.png` | `cover-en-16x9.jpg`、`cover-en-16x9-3840x2160.png` |
| 封面 4:3 | `cover-zh-4x3.jpg`、`cover-zh-4x3-3200x2400.png` | `cover-en-4x3.jpg`、`cover-en-4x3-3200x2400.png` |

**需要人来判断的事项。**

- 旁白的发音。Whisper small 对成片回听，「读法」一节的改写确实生效：「two F A」回听为「2FA」、「H mac」为「HMAC」、英文的「Web Authen」为「WebAuthn」，都符合预期。中文版另有几处被听错：「取整」听成「取成」、「令牌」听成「令台」、「假网站」听成「甲网站」、「私钥」听成「私要」、「域名」听成「预名」；英文版 2011 年那句的「TOTP」被听成「TOEP」。回听文本只是识别结果，不足以断定合成有问题，需人工试听确认。Whisper 的分段也有偏移（多处把相邻两句并成一段），那是识别侧的切分，不是配音断了。
- 画面的留边与密度。闸门提示不计入通过与否：开场 5.5–8.5 秒两版各有 4 处文字贴近左右边缘（留边 < 60px），87.5–90.5 秒各有一处数字贴边，90.0 秒同时可见 74 段文字（建议 ≤16）。要不要收由人判断。
- 声音的听感。闸门只保证响度与峰值落在目标内，配乐与人声的实际听感没有经过人耳确认。
- 发布。成片还在制作机上，没有上传；片尾与本页给出的仓库公开页面尚未核对。
