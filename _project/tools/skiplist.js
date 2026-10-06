// Lists archive saves of the "extras" kind (minigames, downloads, icons, cheat files, browser data) that are NOT on any card.
// Reads saves_all.csv (written by build.js). Run from _project after build.js.
const fs=require('fs'),A=require('./archive');
const txt=fs.readFileSync(__dirname+'/../saves_all.csv','utf8');
const parse=t=>{const rows=[];let r=[],c='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=false}else c+=ch}else if(ch=='"')q=true;else if(ch==',')r.push(c),c='';else if(ch=='\n'){r.push(c.replace(/\r$/,''));rows.push(r);r=[];c=''}else c+=ch}return rows};
const built=new Set(parse(txt).slice(1).filter(r=>r[7]==='yes').map(r=>r[1]+'/'+r[2]));
const rows=[['game','archive_dir','vmi','vms','archive_filename','description','reason not on a card']];
const re=/\.(DWN|EXE)$|^ICONDATA_VMS|^CDX_CODES|^FCDCHEATS|^PW_BOOKMARKS|^PASSPORT|^DREAMCE|^roster\.upd$/i;
const dre=/\b(download save|download file|downloadable|dlc|replay)\b/i;
for(const d of fs.readdirSync(A.SRC)){
  if(!fs.existsSync(A.SRC+'/'+d+'/README.md'))continue;
  const g=A.load(d);if(!g)continue;
  for(const r of g.rows){
    if(built.has(d+'/'+r.vmi))continue;
    let why='';
    if(re.test(r.fname)||dre.test(r.desc)||d==='minigames'){
      if(/PW_BOOKMARKS|PASSPORT|DREAMCE/.test(r.fname)||/^(pwbrowser|dp3)$/.test(d))why='browser/ISP data: dead-site bookmarks and settings, not game data';
      else if(/ICONDATA/.test(r.fname))why='extra icon variant: one icon per game is already included where the game has a card';
      else if(/CDX_CODES|FCDCHEATS/.test(r.fname))why='cheat-device code save not included (duplicate filename on a card already present, or no matching game)';
      else if(/roster\.upd/i.test(r.fname))why='alternative roster update; one is included per game';
      else if(/D1J|D2J|_D0|ED0|\.D0/.test(r.fname)||/\(Japan version\)|PAL version/.test(r.desc))why='download save for a different region than the card';
      else if(/replay/i.test(r.desc))why='combo/replay save that did not fit on the card or clashes with a filename already on it';
      else why='download/extra that did not fit on the game card or clashes with a filename already on it';
      rows.push([g.title,d,r.vmi,r.vms,r.fname,r.desc.replace(/\s+/g,' '),why]);
    }
  }
}
const csv=rs=>rs.map(r=>r.map(c=>/[",\n]/.test(c)?'"'+String(c).replace(/"/g,'""')+'"':c).join(',')).join('\r\n')+'\r\n';
fs.writeFileSync(__dirname+'/../not_on_cards_extras.csv',csv(rows));
console.log(rows.length-1,'extras-type files not on a card');
