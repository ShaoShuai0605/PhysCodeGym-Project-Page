"""Check referenced public media against the pinned Hugging Face Git/LFS tree."""
from pathlib import Path
from datetime import datetime, timezone
import json
import urllib.request
import re

ROOT = Path(__file__).resolve().parents[1]
catalog = json.loads((ROOT / 'qa/video-catalog-manifest.json').read_text())
repository, commit = catalog['repository'], catalog['commit']
base = f'https://huggingface.co/datasets/{repository}/resolve/{commit}/'
expected = {item['video'][len(base):]: item['source_sha256']
            for item in catalog['assets'] if item['video'].startswith(base)}
found = {}
for directory in ['generated/videos', 'videos']:
    url = f'https://huggingface.co/api/datasets/{repository}/tree/{commit}/{directory}?recursive=true&limit=1000'
    while url:
        with urllib.request.urlopen(url, timeout=45) as response:
            rows = json.load(response)
            links = response.headers.get('Link', '')
        for row in rows:
            if row['type'] == 'file' and row['path'] in expected:
                sha = row.get('lfs', {}).get('oid')
                assert sha == expected[row['path']], row['path']
                found[row['path']] = {'sha256': sha, 'bytes': row['size']}
        next_page = re.search(r'<([^>]+)>;\s*rel="next"', links)
        url = next_page.group(1) if next_page else None
assert set(expected) == set(found), sorted(set(expected) - set(found))
report = {'checked_at_utc': datetime.now(timezone.utc).isoformat(), 'repository': repository,
          'commit': commit, 'all_referenced_files_verified': True, 'count': len(found), 'files': found}
(ROOT / 'qa/published-media-check.json').write_text(json.dumps(report, indent=2) + '\n')
print(f'Verified {len(found)} pinned public video identities.')
