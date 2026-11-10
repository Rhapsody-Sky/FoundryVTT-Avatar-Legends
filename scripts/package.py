"""Build a deterministic Foundry package from an explicit tracked-file allowlist."""
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / 'system.json').read_text(encoding='utf-8'))
name = f'legends-v{manifest["version"]}.zip'
expected_url = f'https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/releases/download/v{manifest["version"]}/{name}'
assert manifest['download'] == expected_url
allowed_dirs = {'images', 'lang', 'module', 'packs', 'templates', 'docs'}
allowed_files = {'legends.js', 'LICENSE', 'README.md', 'CHANGELOG.md', 'system.json', 'template.json'}
tracked = subprocess.check_output(['git', 'ls-files', '-z'], cwd=root).decode().split('\0')
paths = []
for name_in_repo in sorted(filter(None, tracked)):
    p = Path(name_in_repo)
    include = p.parts[0] in allowed_dirs or name_in_repo in allowed_files
    include |= p.parts[0] == 'styles' and (p.suffix == '.css' or (len(p.parts) > 1 and p.parts[1] in {'fonts', 'images'}))
    if not include:
        continue
    path = root / p
    assert path.is_file() and not path.is_symlink(), path
    paths.append((name_in_repo, path.read_bytes()))
assert any(p == 'system.json' for p, _ in paths)
dist = root / 'dist'
dist.mkdir(exist_ok=True)
output = dist / name
with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path, content in paths:
        info = zipfile.ZipInfo(path, (2020, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.create_system = 3
        info.external_attr = 0o100644 << 16
        archive.writestr(info, content)
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
    for path, content in paths:
        assert archive.read(path) == content
(dist / 'system.json').write_bytes((root / 'system.json').read_bytes())
hashes = [f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}' for p in [output, dist / 'system.json']]
(dist / 'SHA256SUMS.txt').write_text('\n'.join(hashes) + '\n', encoding='utf-8')
print(f'Built and verified {output.name}: {len(paths)} files')
print('\n'.join(hashes))
