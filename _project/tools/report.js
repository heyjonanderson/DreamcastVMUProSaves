// Writes STEP3_REPORT.md (status summary + needs-review table) from report.csv. Run from repo root: node _project/tools/report.js
const fs=require('fs');
function parse(t){const rows=[];let r=[],c='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=false}else c+=ch}else if(ch=='"')q=true;else if(ch==',')r.push(c),c='';else if(ch=='\n'){r.push(c.replace(/\r$/,''));rows.push(r);r=[];c=''}else c+=ch}return rows}
const rep=parse(fs.readFileSync('_project/report.csv','utf8')).slice(1).filter(r=>r.length>5);
const isExtra=r=>/^(MG_|MINIGAMES|CHEAT)/.test(r[1]);
const games={};for(const r of rep.filter(r=>!isExtra(r)))(games[r[0]]=games[r[0]]||[]).push(r);
const ex=rep.filter(isExtra);
const ready=[],nr=[];for(const [t,rs] of Object.entries(games))(rs.every(r=>r[8]==='ready')?ready:nr).push([t,rs]);
let md=`# Status report\n\nGame cards: ${rep.length-ex.length} (.vmu, 131072 bytes each) for ${Object.keys(games).length} games, plus ${ex.length} extras cards (minigames, cheat-device codes) as folders named MINIGAMESnn / CHEAT* beside the game folders.\nEvery card parses back cleanly (checked by tools/vmu.js and by an independent Python checker written from the VMS format notes: directory, FAT chains, save data). **No card has been opened in EVMU or on VMU Pro hardware.**\n\n`;
md+=`- ready: ${ready.length} games (heuristic or manual pick judged complete/best available, filename/region check passed)\n- needs review: ${nr.length} games (listed below)\n- failed to build: 0\n- extras cards: ${ex.length} (cheat-device cards are marked needs review because they only work with the matching cheat disc)\n- no card: see _project/unmapped_or_skipped.csv; extras not on a card: _project/not_on_cards_extras.csv\n- Folder -> game names: INDEX.md / INDEX.csv\n\n## Needs review (reason)\n\n| Game | Folder(s) | Region | Why |\n|---|---|---|---|\n`;
for(const [t,rs] of nr){const r=rs[0];const why=r[9].split(' | card:')[0].replace(/\|/g,'/');md+=`| ${t} | ${rs.map(x=>x[1]).join(', ')} | ${r[3]} | ${why} |\n`;}
fs.writeFileSync('STEP3_REPORT.md',md);console.log(ready.length,'ready',nr.length,'review',ex.length,'extras');
