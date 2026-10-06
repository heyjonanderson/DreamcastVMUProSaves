// Lists archive saves that are VMU minigames / downloads / cheat-device files (not built into cards). Run from _project.
const fs=require('fs'),A=require('./archive');
const rows=[['game','archive_dir','vmi','vms','archive_filename','description','reason']];
const re=/\.(DWN|EXE)$|^ICONDATA_VMS|^CDX_|^FCDCHEATS|^PW_BOOKMARKS|^roster\.upd$/i;
const dre=/\b(mini ?-?games?|downloadable|dlc|download (save|file|quest|data)|replay)\b/i;
for(const d of fs.readdirSync(A.SRC)){
  if(!fs.existsSync(A.SRC+'/'+d+'/README.md'))continue;
  const g=A.load(d);if(!g)continue;
  for(const r of g.rows){
    let why='';
    if(d==='minigames')why='VMU minigame';
    else if(re.test(r.fname))why='download/icon/cheat-device file';
    else if(dre.test(r.desc)||/_RD\d?$|\.RD\d/i.test(r.fname)&&/replay/i.test(r.desc))why='download/minigame/replay per description';
    if(why)rows.push([g.title,d,r.vmi,r.vms,r.fname,r.desc.replace(/\s+/g,' '),why]);
  }
}
const csv=rs=>rs.map(r=>r.map(c=>/[",\n]/.test(c)?'"'+String(c).replace(/"/g,'""')+'"':c).join(',')).join('\r\n')+'\r\n';
fs.writeFileSync(__dirname+'/../skipped_minigames_dlc.csv',csv(rows));
console.log(rows.length-1,'rows in',new Set(rows.slice(1).map(r=>r[1])).size,'games');
