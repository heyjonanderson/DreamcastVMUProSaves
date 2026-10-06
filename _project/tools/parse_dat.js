const fs=require('fs');
const f=fs.readdirSync('redump').find(x=>x.endsWith('.dat'));
const x=fs.readFileSync('redump/'+f,'utf8');
const out=[];
for(const m of x.matchAll(/<game name="([^"]*)">([\s\S]*?)<\/game>/g)){
  const s=(m[2].match(/<serial>([^<]*)<\/serial>/)||[])[1]||'';
  const name=m[1].replace(/&amp;/g,'&').replace(/&apos;/g,"'").replace(/&quot;/g,'"');
  const reg=(name.match(/\(([^)]*)\)/)||[])[1]||'';
  out.push({name,serial:s,region:reg});
}
fs.writeFileSync('redump.json',JSON.stringify(out,null,1));
console.log(out.length, out.filter(o=>!o.serial).length);
