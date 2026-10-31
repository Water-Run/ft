# 实验

| 文件 | 内容 |
|---|---|
| `demo/` | 演示项目：`cart.py`（有一处错误）与 `test_cart.py` |
| `01_harness.py` | 一个最小的 Harness：只用 Python 标准库，经 DeepSeek 的 OpenAI 兼容接口调用模型，提供 `read_file`、`edit_file`、`run_tests` 三个工具，循环到模型的回复里没有工具调用为止 |
| `out_01_harness_a.json`、`.txt` | 2026-10-31 第一次运行：每次请求的完整请求体与响应、工具结果、改动后的文件与复查结果。片中所用 |
| `out_01_harness_b.json`、`.txt` | 同日第二次运行，用来看过程是否稳定 |

重做：

```bash
cd videos/in-seconds/harness/research/lab
DEEPSEEK_API_KEY=… python 01_harness.py _a      # 可用 LAB_MODEL 换模型，缺省 deepseek-flash
```

模型的回复每次可能不同；重做得到的是新的一份记录，不会与已存的逐字节相同。API key 只从环境变量读，不写进记录。

勘误（2026-10-31）：两份 `.txt` 里「第 N 次请求：… 条消息」是旧脚本写的，在追加模型回复之后才数，每次多算 1 条（3、6、8、10、12）。实际发出的条数以 `.json` 的 `request.messages` 为准：2、5、7、9、11。脚本已改为发请求前就记下条数；已存的两份记录保持原样，不改。
