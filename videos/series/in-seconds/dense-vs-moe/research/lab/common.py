# 取证脚本共用：路径与输出。模型与虚拟环境放在 research/_src/（不入库）。
import os, sys, io, json
LAB = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(os.path.dirname(LAB), '_src')
REPO_ID = 'allenai/OLMoE-1B-7B-0924'
REVISION = '6d84c48581ece794365f2b8e9cfb043c68ade9c5'   # Hugging Face 上该仓库的提交号（2024-10-19）
MODEL_DIR = os.path.join(SRC, 'OLMoE-1B-7B-0924')
# 演示句：Shazeer 等 2017 年论文（arXiv:1701.06538）摘要的第一句
SENTENCE = 'The capacity of a neural network to absorb information is limited by its number of parameters.'

class Tee:
    """同时写到屏幕与 out_<名>.txt（UTF-8、LF）。"""
    def __init__(self, name):
        self.f = open(os.path.join(LAB, f'out_{name}.txt'), 'w', encoding='utf-8', newline='\n')
    def __call__(self, *a):
        s = ' '.join(str(x) for x in a)
        print(s); self.f.write(s + '\n'); self.f.flush()
