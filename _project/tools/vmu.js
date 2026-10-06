// VMU (Dreamcast memory card) image builder / parser. 128KB = 256 blocks x 512 bytes.
// Layout per Marcus Comstedt's VMS flash docs: user 0-199, unused 200-240, directory 241-253 (253 first),
// FAT 254, root 255. FAT entries: 0xFFFC free, 0xFFFA end-of-chain.
const BLK=512,NBLK=256,FREE=0xfffc,EOC=0xfffa,ROOT=255,FATB=254,DIRB=253,DIRN=13,USER=200;
const bcd=n=>((Math.floor(n/10)<<4)|(n%10));
const unbcd=b=>(b>>4)*10+(b&15);
function ts(d){ // {y,mo,d,h,mi,s} -> 8 BCD bytes
  const dt=new Date(Date.UTC(d.y,d.mo-1,d.d));const dow=(dt.getUTCDay()+6)%7;
  return Buffer.from([bcd(Math.floor(d.y/100)),bcd(d.y%100),bcd(d.mo),bcd(d.d),bcd(d.h),bcd(d.mi),bcd(d.s),dow]);
}
function parseVmi(b){
  if(b.length!==108)throw new Error('VMI size '+b.length);
  const z=(o,n)=>b.toString('latin1',o,o+n).replace(/\0.*$/,'').trimEnd();
  const t={y:b.readUInt16LE(0x44),mo:b[0x46],d:b[0x47],h:b[0x48],mi:b[0x49],s:b[0x4a]};
  const ok=t.y>=1998&&t.y<=2100&&t.mo>=1&&t.mo<=12&&t.d>=1&&t.d<=31&&t.h<24&&t.mi<60&&t.s<60;
  return {description:z(4,32),copyright:z(0x24,32),resource:z(0x50,8),name:z(0x58,12),mode:b.readUInt16LE(0x64),size:b.readUInt32LE(0x68),time:ok?t:{y:2000,mo:1,d:1,h:0,mi:0,s:0},timeValid:ok};
}
// files: [{name,data(Buffer),type(0x33|0xcc),protect(bool),time}]
function build(files){
  const img=Buffer.alloc(BLK*NBLK,0);
  const fat=Buffer.alloc(NBLK*2);
  for(let i=0;i<NBLK;i++)fat.writeUInt16LE(FREE,i*2);
  // root
  const r=ROOT*BLK;img.fill(0x55,r,r+16);
  ts({y:2000,mo:1,d:1,h:0,mi:0,s:0}).copy(img,r+0x30);
  img.writeUInt16LE(FATB,r+0x46);img.writeUInt16LE(1,r+0x48);img.writeUInt16LE(DIRB,r+0x4a);img.writeUInt16LE(DIRN,r+0x4c);img.writeUInt16LE(0,r+0x4e);img.writeUInt16LE(USER,r+0x50);
  fat.writeUInt16LE(EOC,ROOT*2);fat.writeUInt16LE(EOC,FATB*2);
  for(let i=0;i<DIRN;i++)fat.writeUInt16LE(i===DIRN-1?EOC:DIRB-i-1,(DIRB-i)*2);
  // Game (0xCC) files: header sits at block 1 of the file (dir hdr-offset=1) and they are laid out ascending from block 0,
  // as on a real VMU. Data files are laid out descending from block 199 (as the Dreamcast does).
  let nextLow=0,nextHigh=USER-1;
  files.forEach((f,idx)=>{
    const nb=Math.ceil(f.data.length/BLK);
    const isGame=f.type===0xcc;
    const blocks=[];for(let i=0;i<nb;i++){
      const b=isGame?nextLow++:nextHigh--;
      if(isGame?b>nextHigh:b<nextLow)throw new Error('card full');blocks.push(b);}
    blocks.forEach((b,i)=>{f.data.copy(img,b*BLK,i*BLK,Math.min((i+1)*BLK,f.data.length));fat.writeUInt16LE(i===nb-1?EOC:blocks[i+1],b*2);});
    const e=(DIRB-Math.floor(idx/16))*BLK+(idx%16)*32;
    img[e]=f.type||0x33;img[e+1]=f.protect?0xff:0;img.writeUInt16LE(blocks[0],e+2);
    Buffer.from(f.name.padEnd(12,'\0').slice(0,12),'latin1').copy(img,e+4);
    ts(f.time).copy(img,e+0x10);img.writeUInt16LE(nb,e+0x18);img.writeUInt16LE(isGame?1:0,e+0x1a);
  });
  fat.copy(img,FATB*BLK);
  return img;
}
function parse(img){
  const errs=[];
  if(img.length!==131072)errs.push('size '+img.length);
  const r=ROOT*BLK;
  for(let i=0;i<16;i++)if(img[r+i]!==0x55){errs.push('root magic');break;}
  const fatLoc=img.readUInt16LE(r+0x46),dirLoc=img.readUInt16LE(r+0x4a),dirSz=img.readUInt16LE(r+0x4c);
  if(fatLoc!==FATB)errs.push('fat loc '+fatLoc);
  const fat=i=>img.readUInt16LE(fatLoc*BLK+i*2);
  const files=[];const used=new Set();
  // walk directory chain
  let b=dirLoc,n=0;const dirBlocks=[];
  while(true){dirBlocks.push(b);const nx=fat(b);if(nx===EOC)break;b=nx;if(++n>20){errs.push('dir loop');break;}}
  if(dirBlocks.length!==dirSz)errs.push('dir chain len '+dirBlocks.length);
  for(const db of dirBlocks)for(let k=0;k<16;k++){
    const e=db*BLK+k*32;if(img[e]===0)continue;
    const nb=img.readUInt16LE(e+0x18);let c=img.readUInt16LE(e+2);const chain=[];
    while(true){chain.push(c);if(used.has(c))errs.push('block reuse '+c);used.add(c);const nx=fat(c);if(nx===EOC)break;c=nx;if(chain.length>nb+1){errs.push('chain too long');break;}}
    if(chain.length!==nb)errs.push('chain/size mismatch');
    const data=Buffer.concat(chain.map(x=>img.subarray(x*BLK,(x+1)*BLK)));
    const t=img.subarray(e+0x10,e+0x18);
    files.push({type:img[e],protect:img[e+1]===0xff,name:img.toString('latin1',e+4,e+16).replace(/\0.*$/,''),blocks:nb,first:chain[0],data,time:`${unbcd(t[0])}${String(unbcd(t[1])).padStart(2,'0')}-${String(unbcd(t[2])).padStart(2,'0')}-${String(unbcd(t[3])).padStart(2,'0')}`});
  }
  // FAT consistency: allocated blocks must be exactly dir+fat+root+file blocks
  let alloc=0;for(let i=0;i<NBLK;i++)if(fat(i)!==FREE)alloc++;
  const expect=dirBlocks.length+2+used.size;
  if(alloc!==expect)errs.push(`fat alloc ${alloc} != ${expect}`);
  return {errs,files,freeUser:USER-used.size};
}
module.exports={build,parse,parseVmi,BLK};
