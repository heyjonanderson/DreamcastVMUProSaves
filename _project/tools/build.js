// Builds VMU Pro cards + originals + credits/report CSVs from selections.js, then validates by parsing back.
const fs=require('fs'),path=require('path');
const A=require('./archive'),V=require('./vmu');
const ROOT=path.join(__dirname,'..','..');
const sel=require('../selections');
const REPO='https://github.com/bucanero/dreamcast-saves/blob/master/';
const csv=rows=>rows.map(r=>r.map(c=>{c=String(c??'');return /[",\n\r]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c;}).join(',')).join('\r\n')+'\r\n';
const credits=[['game','product_id','region','source_path','source_url','creator','description','original_vmi','original_vms','format','archive_filename','vmi_vms_blocks']];
const report=[['game','folder','product_id','region','save_chosen','completion','source','creator','status','notes']];
const allSaves=[['game','archive_dir','vmi','vms','archive_filename','creator','description','chosen']];const seenSave=new Map();
const problems=[];
const only=process.argv.slice(2);
for(const s of sel){
  if(only.length&&!only.includes(s.dir))continue;
  const g=A.load(s.srcdir||s.dir);
  if(!g){problems.push(s.dir+': no README');continue;}
  const used=[];const skippedExtras=[];
  let blocksUsed=0;
  for(const v of [...s.files,...(s.extras||[])]){
    const isExtra=!s.files.includes(v);
    const row=g.rows.find(r=>r.vmi.toLowerCase()===v.toLowerCase());
    if(!row){problems.push(`${s.dir}: ${v} not in README`);continue;}
    const vmiP=A.ci(g.path,row.vmi),vmsP=A.ci(g.path,row.vms);
    if(!vmiP||!vmsP){problems.push(`${s.dir}: missing file ${row.vmi}/${row.vms}`);continue;}
    const vmi=V.parseVmi(fs.readFileSync(vmiP)),data=fs.readFileSync(vmsP);
    if(vmi.name!==row.fname)problems.push(`${s.dir}/${v}: VMI name "${vmi.name}" != README "${row.fname}"`);
    if(vmi.size!==data.length)problems.push(`${s.dir}/${v}: VMI size ${vmi.size} != VMS ${data.length}`);
    const nb=Math.ceil(data.length/512);
    if(isExtra&&(blocksUsed+nb>200||used.some(u=>u.vmi.name===vmi.name))){skippedExtras.push(row.vmi+' ('+vmi.name+')');continue;}
    blocksUsed+=nb;
    used.push({row,vmi,data,vmiP,vmsP,isExtra});
  }
  if(used.filter(u=>!u.isExtra).length!==s.files.length)continue;
  // allSaves
  for(const r of g.rows){const k=s.dir+'/'+r.vmi;const ch=[...s.files,...(s.extras||[])].some(f=>f.toLowerCase()===r.vmi.toLowerCase())?'yes':'';
    if(seenSave.has(k)){if(ch)seenSave.get(k)[7]='yes';continue;}
    const row=[s.dir==='minigames'?'VMU Mini Games':g.title,s.dir,r.vmi,r.vms,r.fname,r.creator,r.desc,ch];seenSave.set(k,row);allSaves.push(row);}
  // originals: everything downloaded for the game (VMI/VMS + description text)
  const od=path.join(ROOT,'originals',s.dir,...(s.srcdir&&s.srcdir!==s.dir?['vmu-dream-explorer-disc']:[]));fs.mkdirSync(od,{recursive:true});
  for(const f of fs.readdirSync(g.path)){if(/\.(gif|png)$/i.test(f))continue;fs.copyFileSync(path.join(g.path,f),path.join(od,f));}
  // card(s)
  const files=used.map(u=>({name:u.vmi.name,data:u.data,type:(u.vmi.mode&2)?0xcc:0x33,protect:!!(u.vmi.mode&1),time:u.vmi.time}));
  const img=V.build(files);
  for(const id of s.ids){
    const folder=id.replace(/[-\s]/g,'');
    const dir=path.join(ROOT,'vmupro',...(s.outdir||'Dreamcast').split('/'),folder);fs.mkdirSync(dir,{recursive:true});
    const out=path.join(dir,folder+'-1.vmu');fs.writeFileSync(out,img);
    credits.push([]);credits.pop();
    used.forEach(u=>credits.push([s.title,id,s.region,g.extra?`extra/${s.srcdir||s.dir}/${u.row.vmi}`:`src/${s.dir}/${u.row.vmi}`,g.extra?'VMU Tool Dream Explorer disc (CD): VMU_SAVES/'+u.row.desc.replace(/^.*source: ([^;\]]+).*$/,'$1'):REPO+s.dir+'/'+path.basename(u.vmsP),u.row.creator,u.row.desc,path.basename(u.vmiP),path.basename(u.vmsP),'VMI+VMS (single save, wrapped into 128KB card)',u.row.fname,Math.ceil(u.data.length/512)]));
    // validate by parsing back from disk
    const back=fs.readFileSync(out),p=V.parse(back);
    const errs=[...p.errs];
    if(p.files.length!==used.length)errs.push('file count '+p.files.length);
    used.forEach((u,i)=>{const f=p.files.find(x=>x.name===u.vmi.name);if(!f)errs.push('missing '+u.vmi.name);else if(!f.data.subarray(0,u.data.length).equals(u.data))errs.push('data mismatch '+u.vmi.name);});
    const contents=p.files.map(f=>`${f.name}(${f.blocks}blk)`).join('+');
    let status=s.status,notes=s.notes;
    const ex=used.filter(u=>u.isExtra).map(u=>u.row.vmi);if(ex.length)notes+=` | extras on card: ${ex.join(',')}`;
    if(skippedExtras.length)notes+=` | extras not fitted (card full or name clash): ${skippedExtras.join(',')}`;
    if(errs.length){status='needs review';notes+=' | VALIDATION: '+errs.join('; ');problems.push(`${s.dir}/${folder}: ${errs.join('; ')}`);}
    const idNote=s.ids.length>1?` (alt ID ${s.ids.filter(x=>x!==id).join(',')})`:'';
    report.push([s.title,folder,id,s.region,used.map(u=>u.row.vmi).join('+'),s.completion,(g.extra?'VMU Tool Dream Explorer disc ('+s.srcdir+')':`bucanero/dreamcast-saves/${s.dir}`),[...new Set(used.map(u=>u.row.creator).filter(Boolean))].join('; ')||'(unnamed)',status,`${notes}${idNote} | card: ${contents}, ${p.freeUser} blocks free, ${back.length} bytes`]);
  }
}
const w=(f,rows)=>fs.writeFileSync(path.join(__dirname,'..',f),csv(rows));
const merge=(f,rows)=>{ // keep rows of other games on partial runs
  const p=path.join(__dirname,'..',f);w(f,rows);};
// human-readable index: folder -> game title (also written to repo root)
const index=[['folder','game','region','status','redump_title','archive_dir','save_chosen']];
for(const s of sel){if(only.length&&!only.includes(s.dir))continue;
  for(const id of s.ids){const folder=id.replace(/[-\s]/g,'');const r=report.find(x=>x[1]===folder&&x[0]===s.title);
    if(r)index.push([folder,s.title,s.region,r[8],s.rname||s.title,s.dir,r[4]]);}}
index.slice(1).sort((a,b)=>a[1].localeCompare(b[1]));
const idxRows=[index[0],...index.slice(1).sort((a,b)=>a[1].localeCompare(b[1])||a[0].localeCompare(b[0]))];
fs.writeFileSync(path.join(ROOT,'INDEX.csv'),csv(idxRows));
fs.writeFileSync(path.join(ROOT,'INDEX.md'),'# Card index (SD card path /Dreamcast/<folder>/<folder>-1.vmu -> game)\n\n| Folder | Game | Region | Status | Save |\n|---|---|---|---|---|\n'+idxRows.slice(1).map(r=>`| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} | ${r[6]} |`).join('\n')+'\n');

// Human-readable browse tree: by-title/<Game title> [REGION]/<ID>-1.vmu (copies of the cards), plus a README in vmupro/Dreamcast that GitHub renders under the folder list.
if(!only.length){
  const bt=path.join(ROOT,'by-title');fs.rmSync(bt,{recursive:true,force:true});
  const safe=t=>t.replace(/[<>:"\/\\|?*]/g,' -').replace(/\s+/g,' ').replace(/[. ]+$/,'').trim();
  const used=new Set();
  for(const s of sel){
    let name=safe(s.title)+(s.region&&s.region!=='-'?' ['+s.region+']':'');
    if(/^MINIGAMES|^CHEAT/.test(s.ids[0]))name='_Extras/'+safe(s.title.replace(/^VMU minigames (\d+)/,'Minigames $1'))+' ('+s.ids[0]+')';
    if(used.has(name.toLowerCase()))name+=' ('+s.ids[0]+')';used.add(name.toLowerCase());
    const d=path.join(bt,...name.split('/'));fs.mkdirSync(d,{recursive:true});
    for(const id of s.ids){const f=id.replace(/[-\s]/g,'');const src=path.join(ROOT,'vmupro',...(s.outdir||'Dreamcast').split('/'),f,f+'-1.vmu');if(fs.existsSync(src))fs.copyFileSync(src,path.join(d,f+'-1.vmu'));}
  }
  const rd=['# vmupro/Dreamcast: folder -> game','','Folder names are Dreamcast product IDs (the VMU Pro matches the folder name to the disc ID), so they are not readable. This is the lookup; the same table with more detail is in [INDEX.md](../../INDEX.md), and a browsable copy named by title is in [by-title/](../../by-title).','','| Folder | Game | Region | Status |','|---|---|---|---|',...idxRows.slice(1).map(r=>`| [${r[0]}](${r[0]}) | ${r[1].replace(/\|/g,'/')} | ${r[2]} | ${r[3]} |`),''];
  fs.writeFileSync(path.join(ROOT,'vmupro','Dreamcast','README.md'),rd.join('\n'));
  fs.writeFileSync(path.join(bt,'README.md'),'# by-title\n\nSame cards as `vmupro/Dreamcast/`, in folders named by game title for browsing. These are **not** laid out for the VMU Pro: to use a card, copy it from `vmupro/Dreamcast/<ID>/` (folder name must be the product ID) or rename the folder to the ID shown in the card filename. See the top-level README and INDEX.md.\n');
}
w('credits.csv',credits);w('report.csv',report);w('saves_all.csv',allSaves);
console.log('cards built; problems:',problems.length);problems.forEach(x=>console.log(' -',x));
