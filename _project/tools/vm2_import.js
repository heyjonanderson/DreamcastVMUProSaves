// Imports VMU minigames from the VM2 organizer's "VMU Games" pack (one .VMU card image per game) into _project/extra/disc_vm2_minigames/
// as VMI+VMS (same table format as the archive), skipping games whose data is already in the repo (hash) or that are the same game by name.
// Usage: node tools/vm2_import.js <folder with the .VMU files>
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const V=require('./vmu'),A=require('./archive');
const src=path.resolve(process.argv[2]);
const H=b=>crypto.createHash('md5').update(b).digest('hex');
const have=new Set();
for(const d of ['minigames','disc_bs_minigames']){const g=A.load(d);for(const r of g.rows)have.add(H(fs.readFileSync(A.ci(g.path,r.vms))));}
const SKIP=new Set(['fat rain','glucky laby','glucky labyrinth','paper attack','swampy','breakout','light','sound 3','pac-it']); // same games as ones already on cards
const dir=path.join(__dirname,'..','extra','disc_vm2_minigames');fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
const vmi=(f,desc)=>{const b=Buffer.alloc(108);const res=Buffer.from(f.name.slice(0,8).padEnd(8,'\0'),'latin1');
  const sega=Buffer.from('SEGA');for(let i=0;i<4;i++)b[i]=res[i]&sega[i];
  b.write(desc.slice(0,32),4,'latin1');b.write('VM2 game pack',0x24,'latin1');b.writeUInt16LE(2000,0x44);b[0x46]=1;b[0x47]=1;
  res.copy(b,0x50);Buffer.from(f.name.padEnd(12,'\0').slice(0,12),'latin1').copy(b,0x58);b.writeUInt16LE(f.type===0xcc?2:0,0x64);b.writeUInt32LE(f.data.length,0x68);return b;};
const rows=[];let skipped=0,dups=0;const seenName=new Set();
for(const f of fs.readdirSync(src).filter(x=>/\.vmu$/i.test(x)).sort()){
  const name=f.replace(/\.vmu$/i,'');const p=V.parse(fs.readFileSync(path.join(src,f)));if(p.errs.length||p.files.length!==1){skipped++;continue;}
  const e=p.files[0];const h=H(e.data.subarray(0,e.blocks*512));
  if(have.has(h)||have.has(H(e.data))){dups++;continue;}
  if(SKIP.has(name.toLowerCase())||seenName.has(name.toLowerCase().replace(/[^a-z0-9]/g,''))){dups++;continue;}
  seenName.add(name.toLowerCase().replace(/[^a-z0-9]/g,''));have.add(h);
  const n='vm2_'+name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  fs.writeFileSync(path.join(dir,n+'.VMS'),e.data);fs.writeFileSync(path.join(dir,n+'.vmi'),vmi(e,name));
  rows.push(`| ![](x.gif) | \`${e.name.trimEnd()}\` | [${n}.vmi](${n}.vmi) | [${n}.VMS](${n}.VMS) | ${name} (vm2) [source: game pack bundled with the VM2 organizer; community and fan VMU games] |`);}
fs.writeFileSync(path.join(dir,'README.md'),`# disc_vm2_minigames\n\n| Icon | Filename | VMI | VMS | Description |\n|---|---|---|---|---|\n${rows.join('\n')}\n`);
console.log(rows.length,'new minigames;',dups,'already present;',skipped,'skipped (not single-file cards)');
