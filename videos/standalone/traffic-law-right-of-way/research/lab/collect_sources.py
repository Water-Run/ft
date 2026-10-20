"""Archive public official pages for this film; no login or browser profile access.

Run from anywhere: python <video>/research/lab/collect_sources.py
Raw pages stay under research/_src/official/ and are excluded from Git.
The manifest records actual HTTP results; a failed fetch is never a verified source.
This downloader does not establish a legal conclusion or a source's current validity.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
import argparse
import json
import re
import urllib.error
import urllib.request

RESEARCH = Path(__file__).resolve().parents[1]
SOURCES = json.loads((RESEARCH / 'sources.json').read_text(encoding='utf-8'))
OUT = RESEARCH / '_src' / 'official' / SOURCES['research_date']
OUT.mkdir(parents=True, exist_ok=True)


class PlainText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'noscript'):
            self.skip += 1
        if not self.skip and tag in ('p', 'div', 'br', 'li', 'h1', 'h2', 'h3', 'tr'):
            self.parts.append('\n')

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript') and self.skip:
            self.skip -= 1
        if not self.skip and tag in ('p', 'div', 'li', 'h1', 'h2', 'h3', 'tr'):
            self.parts.append('\n')

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)

    def text(self):
        lines = [re.sub(r'[\t \u3000\xa0]+', ' ', line).strip()
                 for line in ''.join(self.parts).splitlines()]
        return '\n'.join(line for line in lines if line) + '\n'


def fetch(source):
    record = {'id': source['id'], 'url': source['url'],
              'captured_at_utc': datetime.now(timezone.utc).isoformat(),
              'method': 'stdlib urllib HTTP GET; HTMLParser text extraction'}
    try:
        request = urllib.request.Request(source['url'], headers={
            'User-Agent': 'Mozilla/5.0 (compatible; documentary-source-research/1.0)',
            'Accept': 'text/html,application/xhtml+xml'})
        with urllib.request.urlopen(request, timeout=25) as response:
            raw = response.read(12 * 1024 * 1024)
            record['http_status'] = response.status
            record['final_url'] = response.geturl()
            encoding = response.headers.get_content_charset()
        if not encoding:
            match = re.search(br'charset\s*=\s*["\']?([A-Za-z0-9_-]+)', raw[:12000], re.I)
            encoding = match.group(1).decode('ascii') if match else 'utf-8'
        try:
            html = raw.decode(encoding)
        except (UnicodeDecodeError, LookupError):
            html = raw.decode('gb18030', errors='replace')
        parser = PlainText()
        parser.feed(html)
        plain = parser.text()
        matches = [token for token in source['check_tokens_any'] if token in plain]
        record['matched_tokens'] = matches
        record['content_check_passed'] = bool(matches)
        record['status'] = 'captured' if matches else 'unexpected_content'
        for suffix, data in [('html', raw), ('txt', plain.encode('utf-8'))]:
            target = OUT / (source['id'] + '.' + suffix)
            target.write_bytes(data)
            record[suffix + '_path'] = target.relative_to(RESEARCH.parent).as_posix()
            record[suffix + '_sha256'] = sha256(data).hexdigest()
            record[suffix + '_bytes'] = len(data)
    except (OSError, urllib.error.URLError, ValueError) as error:
        record.update(status='fetch_failed', error=str(error))
    return record


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--only', nargs='+', help='Fetch only these source IDs; preserve other manifest records.')
    args = parser.parse_args()
    selected = [item for item in SOURCES['sources'] if not args.only or item['id'] in args.only]
    if args.only and set(args.only) - {item['id'] for item in selected}:
        parser.error('Unknown source ID')
    manifest_path = RESEARCH / 'lab' / 'source_snapshot_manifest.json'
    records = []
    if args.only and manifest_path.exists():
        records = [item for item in json.loads(manifest_path.read_text(encoding='utf-8'))['sources']
                   if item['id'] not in args.only]
    with ThreadPoolExecutor(max_workers=4) as pool:
        for future in as_completed([pool.submit(fetch, item) for item in selected]):
            record = future.result()
            records.append(record)
            print(record['id'], record['status'], flush=True)
    records.sort(key=lambda item: item['id'])
    manifest = {'research_date': SOURCES['research_date'], 'sources': records,
                'note': 'HTTP capture and keyword checks are evidence collection, not legal verification.'}
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Captured', sum(row['status'] == 'captured' for row in records), '/', len(records))
