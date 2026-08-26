from __future__ import annotations

import argparse
import os
import shutil
from pathlib import Path


MARKER = '# BEGIN TIANYA HOMEPAGE'


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--target', required=True, type=Path)
    parser.add_argument('--block', required=True, type=Path)
    parser.add_argument('--backup', required=True, type=Path)
    args = parser.parse_args()

    current = args.target.read_text(encoding='utf-8')
    if MARKER in current:
        print('nginx site block already installed')
        return

    block = args.block.read_text(encoding='utf-8').strip()
    if MARKER not in block:
        raise SystemExit('deployment block marker is missing')

    args.backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(args.target, args.backup)

    candidate = args.target.with_suffix(args.target.suffix + '.candidate')
    candidate.write_text(f'{current.rstrip()}\n\n{block}\n', encoding='utf-8')
    os.replace(candidate, args.target)
    print(f'installed nginx site block; backup={args.backup}')


if __name__ == '__main__':
    main()
