# -*- coding: utf-8 -*-
"""
Fix all Chinese encoding issues in referee-express HTML files.
Two problems handled:
  1. hyd2026.html  - Chinese replaced with '?'  → restore from backup
  2. Mojibake      - UTF-8 bytes stored as Latin-1 → re-decode
"""

import os
import re
import shutil

BASE = os.path.dirname(os.path.abspath(__file__))
BACKUP = os.path.join(BASE, 'backup', '29042026')


# ── 1. Restore hyd2026.html from backup ───────────────────────────────────────
def restore_hyd2026():
    src  = os.path.join(BACKUP, 'hyd2026.html')
    dest = os.path.join(BASE,   'hyd2026.html')
    if not os.path.exists(src):
        print('  ✗ Backup hyd2026.html not found')
        return
    shutil.copy2(src, dest)
    print('  ✓ hyd2026.html restored from backup')


# ── 2. Mojibake fixer ──────────────────────────────────────────────────────────
# Match runs of Latin-1 "high" characters (≥ 0x80) that are at least 4 chars
# long.  Four chars = minimum to encode two CJK characters.
MOJIBAKE_RE = re.compile(r'[\x80-\xff]{4,}')


def try_fix_mojibake(m):
    """Try to decode a mojibake match back to proper UTF-8."""
    raw = m.group(0)
    try:
        fixed = raw.encode('latin-1').decode('utf-8')
        # Only accept if the result contains CJK or common Chinese punctuation
        if re.search(r'[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]', fixed):
            return fixed
    except (UnicodeEncodeError, UnicodeDecodeError):
        pass
    return raw  # leave untouched if conversion fails


def fix_mojibake_in_file(path):
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        original = f.read()

    fixed = MOJIBAKE_RE.sub(try_fix_mojibake, original)

    if fixed != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(fixed)
        count = len(MOJIBAKE_RE.findall(original))
        print(f'  ✓ Fixed {count} mojibake run(s) in {os.path.basename(path)}')
        return True
    return False


# ── 3. Main ────────────────────────────────────────────────────────────────────
def main():
    print('=' * 60)
    print('Referee-Express Chinese Encoding Fix')
    print('=' * 60)

    # Step 1: restore hyd2026.html
    print('\n[1] Restoring hyd2026.html from backup …')
    restore_hyd2026()

    # Step 2: fix mojibake in all HTML files
    print('\n[2] Scanning HTML files for mojibake …')
    html_files = [
        os.path.join(BASE, f)
        for f in os.listdir(BASE)
        if f.endswith('.html')
    ]
    fixed_any = False
    for path in sorted(html_files):
        result = fix_mojibake_in_file(path)
        if result:
            fixed_any = True

    if not fixed_any:
        print('  (no mojibake found in any file)')

    print('\n' + '=' * 60)
    print('✓ Done!')
    print('=' * 60)


if __name__ == '__main__':
    main()
