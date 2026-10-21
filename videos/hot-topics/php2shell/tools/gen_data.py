# 画面数据：research/lab/02_figures.json → src/js/data.js（由本脚本生成，不要手改 data.js）。
# 用法：python -I videos/hot-topics/php2shell/tools/gen_data.py
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
d = json.loads((root / 'research/lab/02_figures.json').read_text(encoding='utf-8'))
d.pop('_about', None)
# 换算：各大版本在「全部 PHP 网站」里的占比；7.4、5.6、5.3 换算成占全部 PHP 网站的比例
d['old_share'] = round(d['php_major_share']['7'] + d['php_major_share']['5'], 1)
d['sub_of_all'] = {
    '7.4': round(d['php_major_share']['7'] * d['php7_sub']['7.4'] / 100, 1),
    '5.6': round(d['php_major_share']['5'] * d['php5_sub']['5.6'] / 100, 1),
    '5.3': round(d['php_major_share']['5'] * d['php5_sub']['5.3'] / 100, 1),
}
out = '// 由 tools/gen_data.py 从 research/lab/02_figures.json 生成，不要手改。\nwindow.DATA = ' + json.dumps(d, ensure_ascii=False, indent=1) + ';\n'
(root / 'src/js/data.js').write_text(out, encoding='utf-8', newline='\n')
print('data.js', d['old_share'], d['sub_of_all'])
