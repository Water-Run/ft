# TTFT：事实与依据

取证日期：2026-11-17。对象：流式大语言模型请求的首段输出延迟；不限定模型或产品版本。环境：阅读公开的一手文档，未连接实际推理服务。例子中的两秒是人为设定，用来演示减法，不是性能实测。

## 对象与解释路径

客户端发送请求，经网络到达服务端，可能排队，再处理输入、生成并返回输出。客户端收到第一段非空输出时结束计时；此后仍可能有输出，直到全文结束。这个客户端口径与从服务端接收请求开始的口径不同。首段可能包含多个 token，界面上看到的文字也不一定与单个 token 一一对应。

| 陈述 | 可复查依据与状态 |
|---|---|
| 客户端口径从发送请求到收到第一个 token 或包含 token 的数据块；计入网络、排队、输入处理与首段生成。 | 已核查：[NVIDIA AIPerf Metrics Reference，Time to First Token](https://docs.nvidia.com/aiperf/v0.13.0/reference/ai-perf-metrics-reference)；[Google Cloud AI infrastructure，Time-to-first-token](https://cloud.google.com/resources/report/content/an-it-leaders-encyclopedia-for-ai-infrastructure?hl=it)。两份均于 2026-11-17 阅读。 |
| 模型文本输出以 token 为单位；一个流式数据块可以包含多个 token。 | 已核查：[NVIDIA AIPerf Metrics Reference，Streaming Metrics](https://docs.nvidia.com/aiperf/v0.13.0/reference/ai-perf-metrics-reference)；[Google Cloud AI infrastructure，Tokens per second](https://cloud.google.com/resources/report/content/an-it-leaders-encyclopedia-for-ai-infrastructure?hl=it)。2026-11-17 阅读。 |
| 输入处理后开始逐步生成；首段收到后，后续回答仍可能继续。 | 已核查：[NVIDIA NIM Metrics，TTFT 与 End-to-End Request Latency](https://docs.nvidia.com/nim/benchmarking/llm/1.0.0/metrics.html)；[Google Cloud，Consumption options，Latency](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/deploy/consumption-options)。2026-11-17 阅读。 |
| 非空输出才参与该客户端示例的计时；空响应不算。 | 已核查：[NVIDIA NIM Metrics，Time to First Token](https://docs.nvidia.com/nim/benchmarking/llm/1.0.0/metrics.html)；[NVIDIA AIPerf Metrics Reference，Streaming Metrics](https://docs.nvidia.com/aiperf/v0.13.0/reference/ai-perf-metrics-reference)。2026-11-17 阅读；此处为工具口径，不声称所有系统相同。 |
| TTFT 不等于完整响应时间；排队、输入长度及负载可能影响比较。 | 已核查：[NVIDIA NIM Metrics，TTFT 与 End-to-End Request Latency](https://docs.nvidia.com/nim/benchmarking/llm/1.0.0/metrics.html)；[Google Cloud，Consumption options，Latency](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/deploy/consumption-options)。2026-11-17 阅读。 |
| 服务端的起点和客户端可不同；某些产品还区分思考输出和最终答案的首段。 | 已核查：[NVIDIA Dynamo Glossary，Time-To-First-Token](https://docs.nvidia.com/dynamo/dev/reference/glossary)；[Google Cloud Access metrics，Latency metrics](https://docs.cloud.google.com/gemini/enterprise/docs/access-metrics?hl=en)。2026-11-17 阅读。 |

## 未进入文案

不同系统可能统计思考 token、首个内容块或服务端生成时间；具体诊断和缓存原理留给后续主题。这里未测真实服务，不能据此评判模型或供应商性能。
