"""Build a deterministic Foundry package from an explicit tracked-file allowlist."""
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile
import tempfile

root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / 'system.json').read_text(encoding='utf-8'))
name = f'avatar-legends-v{manifest["version"]}.zip'
expected_url = f'https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends/releases/download/v{manifest["version"]}/{name}'
assert manifest['download'] == expected_url
allowed_dirs = {'images', 'lang', 'module', 'templates', 'docs'}
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
# Convert shipped compendiums without changing the upstream source databases.
with tempfile.TemporaryDirectory(prefix='avatar-legends-packs-') as scratch:
    subprocess.run(['node', str(root / 'scripts/convert-packs.mjs'), str(root), scratch], check=True)
    for path in sorted(Path(scratch).rglob('*')):
        if path.is_file() and path.name not in {'LOCK', 'LOG', 'LOG.old'}:
            paths.append((path.relative_to(scratch).as_posix(), path.read_bytes()))
paths.sort()
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

module = json.loads((root / 'migration-module/module.json').read_text(encoding='utf-8'))
module_name = f'avatar-legends-migration-v{module["version"]}.zip'
with zipfile.ZipFile(dist / module_name, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    files = [(Path(p).relative_to('migration-module').as_posix(), (root / p).read_bytes())
             for p in sorted(filter(None, tracked)) if Path(p).parts[0] == 'migration-module']
    files.append(('LICENSE', (root / 'LICENSE').read_bytes()))
    for name, content in files:
        info = zipfile.ZipInfo(name, (2020, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.create_system = 3
        info.external_attr = 0o100644 << 16
        archive.writestr(info, content)
with zipfile.ZipFile(dist / module_name) as archive:
    assert archive.testzip() is None
    for name, content in files:
        assert archive.read(name) == content
(dist / 'module.json').write_bytes((root / 'migration-module/module.json').read_bytes())
for path in [dist / module_name, dist / 'module.json']:
    hashes.append(f'{hashlib.sha256(path.read_bytes()).hexdigest()}  {path.name}')
(dist / 'SHA256SUMS.txt').write_text('\n'.join(hashes) + '\n', encoding='utf-8')
print('Built migration module: ' + module_name)
