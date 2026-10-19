"""从已入库的实验/测绘 JSON 生成画面数据；不手填页偏移、事务号或调查百分比。"""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]

def main():
    paths = {'physical':'research/lab/out_03_decode.json','survey':'research/lab/out_04_survey.json','style':'research/lab/out_05_style.json','compare':'research/lab/out_08_compare.json','trend':'research/lab/out_10_trend.json'}
    data = {'provenance':{}}
    for key,relative in paths.items():
        content = (ROOT / relative).read_bytes()
        data[key] = json.loads(content)
        data['provenance'][key] = {'file':relative,'sha256':hashlib.sha256(content).hexdigest()}
    # 原始页字节保留在研究回显中；画面只载入解码后的必要数据。
    encoded = json.dumps(data,ensure_ascii=False,indent=2)
    source = '// 由 tools/gen_data.py 从研究记录生成，不要手改。\n(function(root){\nconst data = ' + encoded + ';\nif(typeof module!=="undefined" && module.exports) module.exports=data;\nelse root.PG_DATA=data;\n})(typeof window!=="undefined"?window:globalThis);\n'
    dest = ROOT / 'src/js/data.js'
    dest.write_text(source,encoding='utf-8',newline='\n')
    print(json.dumps({'file':'src/js/data.js','sha256':hashlib.sha256(dest.read_bytes()).hexdigest()},ensure_ascii=False))

if __name__=='__main__':
    main()
