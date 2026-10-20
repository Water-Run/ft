"""本片用到的公开模型仓库。

策划者 2026-10-20 的要求：「模型不要太老，至少 26 年 8 月之后的」，
并指出「qwen3 这种一年半前的模型就属于典型的太老」。
因此本片只使用 **createdAt 晚于 2026-08-01** 的公开仓库；
筛选与普查见 06_recent_models.py、07_scale_survey.py 的回显。

MAIN  片中反复读的那份配置文件（主例子）
MOE   边界章的混合专家例子
REPOS 全片出现的那一列（量级对照），按参数量从小到大
"""

MAIN = "openbmb/MiniCPM5-2B"
MOE = "LiquidAI/LFM2.5-24B-A2B"

# (仓库, 在片中扮演的角色)
REPOS = [
    ("AxiomicLabs/GPT-X3-150M", "量级对照：最小，1.5 亿（名字里的 150M）"),
    ("openbmb/MiniCPM5-2B", "主例子：稠密、配置干净、单分片"),
    ("LiquidAI/LFM2.5-24B-A2B", "混合专家：64 个专家，每个 token 走 4 个"),
    ("Qwen/Qwen3.8-2.4T-A95B", "量级对照：最大，2.4 万亿"),
]
