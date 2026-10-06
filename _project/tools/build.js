// Builds VMU Pro cards + originals + credits/report CSVs from selections.js, then validates by parsing back.
const fs=require('fs'),path=require('path');
const A=require('./archive'),V=require('./vmu');
const ROOT=path.join(__dirname,'..','..');
const sel=require('../selections');
const REPO='https://github.com/bucanero/dreamcast-saves/blob/master/';
const csv=rows=>rows.map(r=>r.map(c=>{c=String(c??'');return /[",\n\r]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c;}).join(',')).join('\r\n')+'\r\n';
const credits=[['game','product_id','region','source_path','source_url','creator','description','original_vmi','original_vms','format','archive_filename','vmi_vms_blocks']];
const report=[['game','folder','product_id','region','save_chosen','completion','source','creator','status','notes']];
const allSaves=[['game','archive_dir','vmi','vms','archive_filename','creator','description','chosen']];
const problems=[];
const only=process.argv.slice(2);
for(const s of sel){
  if(only.length&&!only.includes(s.dir))continue;
  const g=A.load(s.dir);
  if(!g){problems.push(s.dir+': no README');continue;}
  const used=[];
  for(const v of s.files){
    const row=g.rows.find(r=>r.vmi.toLowerCase()===v.toLowerCase());
    if(!row){problems.push(`${s.dir}: ${v} not in README`);continue;}
    const vmiP=A.ci(g.path,row.vmi),vmsP=A.ci(g.path,row.vms);
    if(!vmiP||!vmsP){problems.push(`${s.dir}: missing file ${row.vmi}/${row.vms}`);continue;}
    const vmi=V.parseVmi(fs.readFileSync(vmiP)),data=fs.readFileSync(vmsP);
    if(vmi.name!==row.fname)problems.push(`${s.dir}/${v}: VMI name "${vmi.name}" != README "${row.fname}"`);
    if(vmi.size!==data.length)problems.push(`${s.dir}/${v}: VMI size ${vmi.size} != VMS ${data.length}`);
    used.push({row,vmi,data,vmiP,vmsP});
  }
  if(used.length!==s.files.length)continue;
  // allSaves
  for(const r of g.rows)allSaves.push([s.title,s.dir,r.vmi,r.vms,r.fname,r.creator,r.desc,s.files.some(f=>f.toLowerCase()===r.vmi.toLowerCase())?'yes':'']);
  // originals: everything downloaded for the game (VMI/VMS + description text)
  const od=path.join(ROOT,'originals',s.dir);fs.mkdirSync(od,{recursive:true});
  for(const f of fs.readdirSync(g.path)){if(/\.(gif|png)$/i.test(f))continue;fs.copyFileSync(path.join(g.path,f),path.join(od,f));}
  // card(s)
  const files=used.map(u=>({name:u.vmi.name,data:u.data,type:(u.vmi.mode&2)?0xcc:0x33,protect:!!(u.vmi.mode&1),time:u.vmi.time}));
  const img=V.build(files);
  for(const id of s.ids){
    const folder=id.replace(/[-\s]/g,'');
    const dir=path.join(ROOT,'vmupro','Dreamcast',folder);fs.mkdirSync(dir,{recursive:true});
    const out=path.join(dir,folder+'-1.vmu');fs.writeFileSync(out,img);
    credits.push([]);credits.pop();
    used.forEach(u=>credits.push([s.title,id,s.region,`src/${s.dir}/${u.row.vmi}`,REPO+s.dir+'/'+path.basename(u.vmsP),u.row.creator,u.row.desc,path.basename(u.vmiP),path.basename(u.vmsP),'VMI+VMS (single save, wrapped into 128KB card)',u.row.fname,Math.ceil(u.data.length/512)]));
    // validate by parsing back from disk
    const back=fs.readFileSync(out),p=V.parse(back);
    const errs=[...p.errs];
    if(p.files.length!==used.length)errs.push('file count '+p.files.length);
    used.forEach((u,i)=>{const f=p.files.find(x=>x.name===u.vmi.name);if(!f)errs.push('missing '+u.vmi.name);else if(!f.data.subarray(0,u.data.length).equals(u.data))errs.push('data mismatch '+u.vmi.name);});
    const contents=p.files.map(f=>`${f.name}(${f.blocks}blk)`).join('+');
    let status=s.status,notes=s.notes;
    if(errs.length){status='needs review';notes+=' | VALIDATION: '+errs.join('; ');problems.push(`${s.dir}/${folder}: ${errs.join('; ')}`);}
    const idNote=s.ids.length>1?` (alt ID ${s.ids.filter(x=>x!==id).join(',')})`:'';
    report.push([s.title,folder,id,s.region,used.map(u=>u.row.vmi).join('+'),s.completion,`bucanero/dreamcast-saves/${s.dir}`,[...new Set(used.map(u=>u.row.creator).filter(Boolean))].join('; ')||'(unnamed)',status,`${notes}${idNote} | card: ${contents}, ${p.freeUser} blocks free, ${back.length} bytes`]);
  }
}
const w=(f,rows)=>fs.writeFileSync(path.join(__dirname,'..',f),csv(rows));
const merge=(f,rows)=>{ // keep rows of other games on partial runs
  const p=path.join(__dirname,'..',f);w(f,rows);};
w('credits.csv',credits);w('report.csv',report);w('saves_all.csv',allSaves);
console.log('cards built; problems:',problems.length);problems.forEach(x=>console.log(' -',x));
