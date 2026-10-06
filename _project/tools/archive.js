// Parses bucanero/dreamcast-saves: per-game README tables + CREDITS.HTM
const fs=require('fs'),path=require('path');
const SRC=path.join(__dirname,'..','src');
const gl={};for(const l of fs.readFileSync(path.join(SRC,'GAMELIST.TXT'),'utf8').split(/\r?\n/)){const i=l.indexOf('=');if(i>0)gl[l.slice(0,i)]=l.slice(i+1);}
const html=fs.readFileSync(path.join(SRC,'CREDITS.HTM'),'latin1');
const sections=html.split('<!-- game div -->').map(sec=>{const m={};for(const x of sec.matchAll(/(\S+\.vmi) Submitted by: <a href="[^"]*">([^<]*)<\/a>/gi))m[x[1].toLowerCase()]=x[2].trim();return m;});
function ci(dir,name){const f=fs.readdirSync(dir).find(x=>x.toLowerCase()===name.toLowerCase());return f?path.join(dir,f):null;}
function load(d){
  const dir=path.join(SRC,d);const rd=ci(dir,'README.md');if(!rd)return null;
  const rows=[];
  for(const l of fs.readFileSync(rd,'utf8').split(/\r?\n/)){
    const m=l.match(/^\|\s*!\[[^\]]*\]\([^)]*\)\s*\|\s*`([^`]*)`\s*\|\s*\[([^\]]+)\]\([^)]*\)\s*\|\s*\[([^\]]+)\]\([^)]*\)\s*\|(.*)\|\s*$/);
    if(m)rows.push({fname:m[1],vmi:m[2],vms:m[3],desc:m[4].trim()});
  }
  // other sections (minigames / downloads)
  const other=fs.readFileSync(rd,'utf8').split(/\r?\n/).filter(l=>/^##\s/.test(l)).map(l=>l.replace(/^##\s*/,''));
  let best=null,bs=0;
  for(const s of sections){let n=0;for(const r of rows)if(s[r.vmi.toLowerCase()])n++;if(n>bs){bs=n;best=s;}}
  for(const r of rows)r.creator=(best&&best[r.vmi.toLowerCase()])||'';
  return {dir:d,title:gl[d]||d,rows,headings:other,path:dir};
}
module.exports={SRC,gl,load,ci};
if(require.main===module){
  for(const d of process.argv.slice(2)){const g=load(d);console.log('\n## '+d+' | '+g.title+' | '+g.headings.join(',')+' | rows='+g.rows.length);
   for(const r of g.rows)console.log(`${r.vmi} ${r.fname} [${r.creator}] ${r.desc.slice(0,170)}`);}
}
