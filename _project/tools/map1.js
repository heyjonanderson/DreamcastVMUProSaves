const fs=require('fs');
const dat=require('../redump.json');
const gl=fs.readFileSync('src/GAMELIST.TXT','utf8').split(/\r?\n/).filter(Boolean).map(l=>{const i=l.indexOf('=');return {dir:l.slice(0,i),title:l.slice(i+1)}});
const norm=s=>s.toLowerCase().replace(/&/g,' and ').replace(/\(.*?\)/g,' ').replace(/[^a-z0-9]+/g,' ').trim();
const toks=s=>new Set(norm(s).split(' ').filter(w=>w&&!['the','of','and','a'].includes(w)));
const bad=/\((Demo|Beta|Proto|Taikenban|Tentou|Sample|Kiosk|Disc \d|Trial|Preview|Promo|Not for Resale|Pre-Release)/i;
const cands=dat.filter(d=>d.serial&&!/\((Demo|Beta|Proto|Taikenban|Tentou|Kiosk|Preview|Sample)/i.test(d.name));
const res=[];
for(const g of gl){
  const gt=toks(g.title);
  let sc=[];
  for(const c of cands){
    const ct=toks(c.name.replace(/ - .*?(?= \(|$)/,x=>x)); 
    let inter=0;for(const t of gt)if(ct.has(t))inter++;
    const score=inter/Math.max(gt.size,ct.size);
    if(score>=0.5)sc.push([score,c]);
  }
  sc.sort((a,b)=>b[0]-a[0]);
  const best=sc.length?sc[0][0]:0;
  res.push({dir:g.dir,title:g.title,best,hits:sc.filter(s=>s[0]>=best-0.001).map(s=>s[1].name+' ['+s[1].serial+']')});
}
fs.writeFileSync('map1.json',JSON.stringify(res,null,1));
for(const r of res)console.log(r.dir+' | '+r.title+' | '+r.best.toFixed(2)+' | '+r.hits.slice(0,4).join(' ; '));
