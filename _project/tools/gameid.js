// Builds gameid.json: Redump disc name -> disc-header Product Number (what the VMU Pro GameID matches), from
// kevh182/Redump_GameID Sega_Dreamcast_Redump_GameID_List.csv. Usage: node tools/gameid.js <path to that csv>
const fs=require('fs');
function parse(t){const rows=[];let r=[],c='',q=false;t=t.replace(/^﻿/,'');for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=false}else c+=ch}else if(ch=='"')q=true;else if(ch==',')r.push(c),c='';else if(ch=='\n'){r.push(c.replace(/\r$/,''));rows.push(r);r=[];c=''}else c+=ch}if(c||r.length){r.push(c);rows.push(r)}return rows}
const rows=parse(fs.readFileSync(process.argv[2],'utf8'));const h=rows[0];
const ix=n=>h.indexOf(n);
const out=[];
for(const r of rows.slice(1)){if(r[ix('Type')]!=='Redump')continue;const name=r[ix('File Name')],pn=r[ix('Product Number')];if(name&&pn)out.push({n:name,p:pn,s:[r[ix('Redump Serial 1')],r[ix('Redump Serial 2')],r[ix('Redump Serial 3')]].filter(Boolean),r:r[ix('Playable Regions')]});}
fs.writeFileSync(__dirname+'/../gameid.json',JSON.stringify(out,null,0));console.log(out.length,'entries');
