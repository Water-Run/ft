"""核对官方三色大象 SVG 的蓝色，计算拟用字色/底色对比；不生成图像或音频。"""
from pathlib import Path
import hashlib
import json
import re
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]

def luminance(color):
    rgb = [int(color[i:i+2],16)/255 for i in (1,3,5)]
    rgb = [x/12.92 if x<=0.04045 else ((x+0.055)/1.055)**2.4 for x in rgb]
    return sum(a*b for a,b in zip(rgb,[0.2126,0.7152,0.0722]))

def main():
    source = 'https://wiki.postgresql.org/wiki/File:PostgreSQL_logo.3colors.svg'
    page = requests.get(source,timeout=40)
    page.raise_for_status()
    soup = BeautifulSoup(page.content,'html.parser')
    link = soup.select_one('.fullMedia a')
    assert link is not None
    url = urljoin(source,link['href'])
    svg = requests.get(url,timeout=40)
    svg.raise_for_status()
    colors = sorted(set(x.lower() for x in re.findall(r'#[0-9a-fA-F]{6}',svg.text)))
    assert '#336791' in colors
    (ROOT / 'research/_src/sources/logo-3colors.svg').write_bytes(svg.content)
    palette = {'blue':'#336791','paper':'#f4f5f6','graphite':'#20282e','white':'#ffffff','alert':'#a94819'}
    pairs = [('graphite','paper'),('blue','paper'),('white','blue'),('alert','paper')]
    contrast = []
    for text,background in pairs:
        a,b = sorted([luminance(palette[text]),luminance(palette[background])])
        ratio = (b+0.05)/(a+0.05)
        assert ratio>=4.5
        contrast.append({'text':text,'background':background,'ratio':round(ratio,3),'normal_text_pass':True})
    out = {'checked_at':'2026-10-19','source_page':source,'svg_url':url,'svg_sha256':hashlib.sha256(svg.content).hexdigest(),
           'svg_colors':colors,'palette':palette,'contrast':contrast,'status':'方案数值校验；未制作关键帧或确认观感'}
    (HERE / 'out_05_style.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps({'colors':colors,'contrast':contrast},ensure_ascii=False))

if __name__=='__main__':
    main()
