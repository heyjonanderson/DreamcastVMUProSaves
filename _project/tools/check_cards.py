# Independent VMU image checker written from the Comstedt VMS format notes, deliberately not sharing code with tools/vmu.js
import sys,os,struct
bad=0;n=0
def bcd_ok(b): return all(((x>>4)<10 and (x&15)<10) for x in b)
import glob
for p in sorted(glob.glob('vmupro/**/*.vmu',recursive=True)):
    if True:
        b=open(p,'rb').read();n+=1;errs=[]
        if len(b)!=131072: errs.append('size')
        blk=lambda i:b[i*512:(i+1)*512]
        root=blk(255)
        if root[:16]!=b'\x55'*16: errs.append('format marker')
        if not bcd_ok(root[0x30:0x38]): errs.append('root bcd time')
        fatblk,fatsz,dirblk,dirsz,iconshape,usrblk,usrcnt=struct.unpack('<HHHHHHH',root[0x46:0x46+14])
        if (fatblk,fatsz,dirblk,dirsz,usrblk)!=(254,1,253,13,200): errs.append(f'root ptrs {(fatblk,fatsz,dirblk,dirsz,usrblk,usrcnt)}')
        fat=struct.unpack('<256H',blk(254))
        used=set()
        # directory: blocks 253 down to 241, 32-byte entries
        files=[]
        for bi in range(253,240,-1):
            for e in range(16):
                ent=blk(bi)[e*32:(e+1)*32]
                if ent[0]==0: continue
                ftype=ent[0];name=ent[4:16];first,size=struct.unpack('<HH',ent[2:4]+ent[0x18:0x1a])[0:2] if False else (struct.unpack('<H',ent[2:4])[0],struct.unpack('<H',ent[0x18:0x1a])[0])
                if ftype not in (0x33,0xcc): errs.append(f'ftype {ftype:x}')
                if not bcd_ok(ent[0x10:0x18]): errs.append('dir bcd')
                # follow chain
                chain=[];cur=first
                while True:
                    if cur>=200 or cur in used or cur in chain: errs.append(f'bad chain at {cur}');break
                    chain.append(cur);nxt=fat[cur]
                    if nxt==0xfffa: break
                    cur=nxt
                    if len(chain)>200: break
                if len(chain)!=size: errs.append(f'chain {len(chain)} != size {size}')
                used|=set(chain);files.append((name,size))
        # FAT consistency: every non-free user block must be in a chain; system blocks marked 0xfffc
        for i in range(200):
            if fat[i]!=0xfffc and i not in used: errs.append(f'orphan {i}')
            if fat[i]==0xfffc and False: pass
        for i in range(200):
            if i in used and fat[i]==0xfffc: errs.append('used but free')
        for i in range(241,256):
            if fat[i]!=0xfffa and fat[i]!=0xfffc and i not in (254,): pass
        if fat[255]!=0xfffa or fat[254]!=0xfffa: errs.append('system fat entries')
        if not files: errs.append('no files')
        if errs: bad+=1;print(p,errs[:4])
print('checked',n,'cards;',bad,'with problems')
