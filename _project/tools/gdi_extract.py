#!/usr/bin/env python3
"""List and extract files from the data area of a Dreamcast GDI image (ISO9660 on the last data track).
No dependencies. Usage:
    python gdi_extract.py "C:\\path\\to\\VMU Dream Explorer (PD)\\Disc.gdi" out_folder [--max-mb 2]
Writes out_folder/LISTING.txt (every file with size) and extracts every file up to --max-mb (default 2 MB), keeping folders.
Reads only; never writes outside out_folder."""
import os, struct, sys

def parse_gdi(path):
    base = os.path.dirname(os.path.abspath(path))
    lines = [l.split() for l in open(path, encoding='utf8', errors='replace').read().splitlines() if l.strip()]
    n = int(lines[0][0]); tracks = []
    for l in lines[1:1 + n]:
        num, lba, typ, ss = int(l[0]), int(l[1]), int(l[2]), int(l[3])
        fname = ' '.join(l[4:-1]).strip('"'); tracks.append(dict(num=num, lba=lba, type=typ, ss=ss, file=os.path.join(base, fname)))
    return tracks

class Track:
    def __init__(self, t):
        self.t = t; self.f = open(t['file'], 'rb'); self.ss = t['ss']; self.start = t['lba']
        self.off = 16 if self.ss == 2352 else 0
    def read_sector(self, rel):  # sector relative to track start
        self.f.seek(rel * self.ss + self.off); return self.f.read(2048)
    def read(self, rel, length):
        out = bytearray(); n = (length + 2047) // 2048
        self.f.seek(rel * self.ss + self.off)
        for i in range(n):
            self.f.seek((rel + i) * self.ss + self.off); out += self.f.read(2048)
        return bytes(out[:length])

def parse_dir(tr, rel, size, abs_lba, shift):
    data = tr.read(rel, size); i = 0; ents = []
    while i < len(data):
        ln = data[i]
        if ln == 0:
            i = (i // 2048 + 1) * 2048; continue
        ext = struct.unpack('<I', data[i + 2:i + 6])[0]; sz = struct.unpack('<I', data[i + 10:i + 14])[0]
        flags = data[i + 25]; nl = data[i + 32]; name = data[i + 33:i + 33 + nl]
        if name not in (b'\x00', b'\x01'):
            nm = name.decode('latin1').split(';')[0]
            ents.append((nm, ext, sz, bool(flags & 2)))
        i += ln
    return ents

def walk(tr, shift, lba_ext, size, path, out):
    for nm, ext, sz, isdir in parse_dir(tr, lba_ext - shift, size, True, shift):
        p = path + '/' + nm
        if isdir: walk(tr, shift, ext, sz, p, out)
        else: out.append((p, ext, sz))

def main():
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    mb = float(sys.argv[sys.argv.index('--max-mb') + 1]) if '--max-mb' in sys.argv else 2.0
    if len(a) < 2: print(__doc__); return 1
    gdi, outdir = a[0], a[1]
    tracks = [t for t in parse_gdi(gdi) if t['type'] == 4 and os.path.exists(t['file'])]
    if not tracks: print('no data tracks found next to the GDI'); return 1
    tracks.sort(key=lambda t: t['lba'])
    for t in reversed(tracks):  # high-density area first
        tr = Track(t)
        pvd = tr.read_sector(16)
        if pvd[1:6] != b'CD001': 
            print('track', t['num'], ': no ISO9660 header at sector 16'); continue
        root = pvd[156:190]; ext = struct.unpack('<I', root[2:6])[0]; sz = struct.unpack('<I', root[10:14])[0]
        for shift in (t['lba'], 0):  # extents are absolute LBA on GD-ROM; fall back to relative
            try:
                out = []; walk(tr, shift, ext, sz, '', out)
                if out or shift == 0: break
            except Exception as e: out = []
        print('track', t['num'], 'files:', len(out)); break
    else:
        print('could not read an ISO9660 filesystem'); return 1
    os.makedirs(outdir, exist_ok=True)
    with open(os.path.join(outdir, 'LISTING.txt'), 'w', encoding='utf8') as L:
        for p, e, s in sorted(out): L.write(f'{s:>12}  {p}\n')
    n = 0
    for p, e, s in out:
        if s > mb * 1048576 or s == 0: continue
        dst = os.path.join(outdir, *p.strip('/').split('/')); os.makedirs(os.path.dirname(dst), exist_ok=True)
        open(dst, 'wb').write(tr.read(e - shift, s)); n += 1
    print(f'wrote LISTING.txt and extracted {n} files (<= {mb} MB) to {outdir}')
    return 0
sys.exit(main())
