from __future__ import annotations

import argparse
import os
import shutil
from pathlib import Path


START = '# BEGIN TIANYA HOMEPAGE'
END = '# END TIANYA HOMEPAGE'


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--target', required=True, type=Path)
    parser.add_argument('--block', required=True, type=Path)
    parser.add_argument('--backup', required=True, type=Path)
    args = parser.parse_args()

    current = args.target.read_text(encoding='utf-8')
    start = current.find(START)
    end = current.find(END, start)
    if start < 0 or end < 0:
        raise SystemExit('installed site block was not found')
    end += len(END)

    block = args.block.read_text(encoding='utf-8').strip()
    if START not in block or END not in block:
        raise SystemExit('replacement block markers are missing')

    replacement = f'{current[:start]}{block}{current[end:]}'
    args.backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(args.target, args.backup)

    with args.target.open('w', encoding='utf-8', newline='\n') as handle:
        handle.write(replacement)
        handle.flush()
        os.fsync(handle.fileno())

    print(f'replaced nginx site block; backup={args.backup}')


if __name__ == '__main__':
    main()
