# 05 用 Qwen3.8 自己的分词器（Qwen3.8-27B 仓库里的 tokenizer.json，提交 1d4bf0f2ff60）切分开场字幕，画面上的 token 切分取自这里（画面不点模型的名字）
import os, json
from transformers import AutoTokenizer
LAB = os.path.dirname(os.path.abspath(__file__))
TOK = os.path.join(os.path.dirname(LAB), '_src', 'qwen38-tokenizer')   # 不入库；获取方式见 FACTS.md
SENTENCES = {
    'zh': '大模型先把文字切成一个个 token。',
    'en': 'Large models first cut text into tokens.',
}
tok = AutoTokenizer.from_pretrained(TOK)
res = {}
with open(os.path.join(LAB, 'out_05_tokenize.txt'), 'w', encoding='utf-8', newline='\n') as out:
    out.write(f'tokenizer vocab size {len(tok)}\n')
    for lang, s in SENTENCES.items():
        ids = tok(s, add_special_tokens=False)['input_ids']
        pieces = [tok.decode([i]) for i in ids]
        assert ''.join(pieces) == s, 'decode mismatch'
        res[lang] = {'text': s, 'ids': ids, 'pieces': pieces}
        out.write(f'{lang}: {len(ids)} tokens  {json.dumps(pieces, ensure_ascii=False)}\n')
        out.write(f'{lang}: ids {ids}\n')
json.dump(res, open(os.path.join(LAB, 'tokens.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(open(os.path.join(LAB, 'out_05_tokenize.txt'), encoding='utf-8').read())
