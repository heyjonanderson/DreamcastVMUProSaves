#!/usr/bin/env python3
"""Independent check that each card's folder ID matches what its saves identify as, using K3zter's save-db.csv
(github.com/K3zter/vmu-save-splitter), which maps in-card save filenames (with ? wildcards) to disc GameIDs.
No game discs needed. Usage (from repo root):
    python _project/tools/verify_ids.py path/to/save-db.csv [vmupro/Dreamcast]
Result per card: OK (a save matches this ID, allowing the VMU Pro 'drop last two digits' rule), MISMATCH (the DB says these saves
belong to other IDs), UNKNOWN (no DB entry for any save in the card). Writes verify_ids_report.csv."""
import csv, fnmatch, os, struct, sys

def card_files(path):
    b = open(path, 'rb').read()
    if len(b) != 131072: return None
    names = []
    for bi in range(253, 240, -1):
        for e in range(16):
            ent = b[bi*512 + e*32: bi*512 + (e+1)*32]
            if ent[0] in (0x33, 0xcc): names.append(ent[4:16].rstrip(b'\0').decode('latin1'))
    return names

def norm(s): return s.replace('-', '').replace(' ', '').strip().upper()

def main():
    dbp = sys.argv[1]; root = sys.argv[2] if len(sys.argv) > 2 else 'vmupro/Dreamcast'
    db = []
    with open(dbp, newline='', encoding='ISO-8859-1') as f:
        r = csv.reader(f); next(r, None)
        for row in r:
            if len(row) >= 4: db.append((row[0], row[1], norm(row[2]), row[3]))
    rows = [['folder', 'result', 'saves in card', 'db candidates (title / id / region)']]
    cnt = {'OK': 0, 'MISMATCH': 0, 'UNKNOWN': 0, 'SKIP': 0}
    for folder in sorted(os.listdir(root)):
        p = os.path.join(root, folder, folder + '-1.vmu')
        if not os.path.isfile(p): continue
        if folder.startswith(('zz_',)): cnt['SKIP'] += 1; continue
        names = card_files(p) or []
        f = folder.upper(); cands = []; ok = False
        for n in names:
            if n == 'ICONDATA_VMS': continue
            for pat, title, gid, region in db:
                if fnmatch.fnmatch(n, pat):
                    cands.append(f'{title} / {gid} / {region}')
                    if gid == f or gid.startswith(f) or f.startswith(gid[:-2] if len(gid) > 6 else gid): ok = True
        res = 'OK' if ok else ('MISMATCH' if cands else 'UNKNOWN')
        cnt[res] += 1
        rows.append([folder, res, ' + '.join(names), ' | '.join(sorted(set(cands)))[:400]])
    with open('verify_ids_report.csv', 'w', newline='', encoding='utf8') as f: csv.writer(f).writerows(rows)
    print(cnt, '-> verify_ids_report.csv')
main()
