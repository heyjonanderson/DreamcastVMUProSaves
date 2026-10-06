// Redump dat entry -> disc-header Product Number(s), via kevh182 GameID list (gameid.json)
const G=require('../gameid.json');
const strip=n=>n.replace(/ \((?:[A-Z][a-z](?:,[A-Z][a-z])*)\)/g,'').replace(/\s+/g,' ');
const byName=new Map(),byStrip=new Map();
for(const g of G){byName.set(g.n,g);const k=strip(g.n);(byStrip.get(k)||byStrip.set(k,[]).get(k)).push(g);}
function lookup(entry){ // entry: {name,serial}
  const g=byName.get(entry.name);if(g)return g.p;
  const l=byStrip.get(strip(entry.name));if(l&&l.length)return l[0].p;
  // serial match restricted to same region word in name
  const rg=(entry.name.match(/\((USA|Europe|Japan|UK|Germany)[^)]*\)/)||[])[1];
  const ser=entry.serial.split(/,\s*/);
  const c=G.filter(g=>g.s.some(x=>ser.includes(x))&&(!rg||g.n.includes('('+rg)));
  return c.length?c[0].p:null;
}
module.exports={lookup};
