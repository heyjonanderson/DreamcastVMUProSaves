// Step 3 generator: maps every remaining archive folder to Redump IDs, picks one save per game by description heuristics,
// writes selections3.json (consumed by selections.js) plus unmapped_or_skipped.csv. Run from _project: node tools/step3.js
const fs=require('fs'),path=require('path');
const A=require('./archive');
const dat=require('../redump.json');
const base=require('./selections_12');
const done=new Set(base.map(s=>s.dir));
const map1=require('../map1.json');
// dir -> regex on Redump name (overrides auto fuzzy match)
const OV={
aeroi:/^Aero Dancing i \(Japan\)/,aeroif:/Aero Dancing i - Jikai/,aerowings:/^AeroWings \(/,aerowings2:/^AeroWings 2/,airforcedelta:/^AirForce Delta/,caesar:/^Caesars Palace 2000/,canvas:/^Canvas - /,
dinosaur:/^Disney's Dinosaur/,evarei:/Ayanami Ikusei/,evaproe:/Typing E Keikaku/,eviltwin:/^Evil Twin/,evolution:/^Evolution - The World/,floiganbros:/^Floigan/,fushigi:/^Fushigi no Dungeon/,
giantgram:/^Giant Gram 2000/,gigawing:/^GigaWing \(/,gigawing2:/^GigaWing 2 \(/,gundambz:/Gihren no Yabou/,headhunt:/^Headhunter/,nakoruru:/^Nakoruru/,penpen:/^PenPen/,princessh:/^Princess Holiday/,
rsrogue:/Rogue Spear/,sakato1:/^Sakatsuku Tokudaigou - /,sakato2:/^Sakatsuku Tokudaigou 2/,sakura1:/^Sakura Taisen \(Japan\) \(Disc [12]\)/,sakura2:/^Sakura Taisen 2 - Kimi/,
sakura3:/^Sakura Taisen 3 - Paris wa Moeteiru ka \(Japan\) \(Disc/,sakura4:/^Sakura Taisen 4 - Koi seyo Otome \(Japan\)/,sakurapz:/Columns 2/,sakuraks:/Kayou Show/,seirei:/^Seireiki Rayblade/,
sorcer:/^Sorcerian/,spiderman:/^Spider-Man/,starlancer:/^StarLancer/,toystory:/Toy Story 2/,chuchu:/Chu-?Chu Rocket/,dabi1:/^Dabitsuku - /,dabi2:/^Dabitsuku 2/,ddrclubmix:/Club Version/,
golfshiyo:/^Golf Shiyou yo 2/,grandia2:/^Grandia II/,jetsetdx:/^De La Jet Set Radio/,lovehina:/Totsuzen no Engage/,lovehina2:/Smile Again/,mdk2:/^MDK2/,nadesico:/Nadesico the Mission/,puyopuyo4:/^Puyo Puyoon/,
rainbowsix:/Rainbow Six (with|incl)/,shenmue:/^Shenmue \((USA|Europe|Japan)\)/,snocross:/^SnoCross/,nba2k:/^NBA 2K \(/,nba2k1:/^NBA 2K1 /,nba2k2:/^NBA 2K2 /,nfl2k:/^NFL 2K \(/,nfl2k1:/^NFL 2K1 /,nfl2k2:/^NFL 2K2 /,
nhl2k:/^NHL 2K /,metropolisracer:/^MSR /,buzzlightyear:/Buzz Lightyear of Star Command/,
};
// no Redump entry / not a game save
const NOID={bluesub6:'No matching Redump disc (Blue Submarine No. 6 not found)',halflife:'Half-Life Dreamcast was never released; no Redump disc',fe776:'Fire Emblem 776 is a homebrew/fan release; no Redump disc',prop_arena:'Propeller Arena was cancelled/unreleased; no retail disc in Redump',nijyuei:'No matching Redump disc',sega_swirl:'Sega Swirl is a web/promo title; no Redump retail disc',dvine:'No saves in archive'};
const SKIP={minigames:'VMU minigames/downloads, not game saves',arcdx:'Cheat-device (Action Replay CDX) code storage, not a game save',gscdx:'Cheat-device (GameShark CDX) code storage, not a game save',xploder:'Cheat-device (Code Breaker/Xploder) code storage, not a game save',pwbrowser:'Web browser bookmarks/settings, not a game save',dp3:'Dream Passport ISP browser data, not a game save',atari:'Archive contains only an icon/VMU file, no game save'};
const EXCL=/\((Demo|Beta|Proto|Taikenban|Tentou|Kiosk|Preview|Sample|Trial|Video ROM|Tentou-you)|Drama Download|Premium Disc|Special Edition|Trial Edition|Fan Disc/i;
const cls=n=>/\((USA|Canada)|\(USA,/.test(n)?0:/\((Europe|UK)\)/.test(n)?1:/\(Japan\)|\(Japan\) /.test(n)||/\(Japan/.test(n)?2:3;
const rname=['USA','EU','JP','other'];
const DROPID=new Set(['HDR-0201']);
const cleanIds=s=>{let ids=s.split(/,\s*/).filter(i=>!DROPID.has(i));const keep=ids.filter(i=>!/^(952|950|830)-/.test(i));return keep.length?keep:ids;};
const NOSAVE=/^(ICONDATA_VMS|CDX_|FCDCHEATS|roster\.upd|PW_|DC_ANIM)/i;
const tagOf=d=>{const t=new Set();
 if(/\b(USA?|NTSC-?U|U\.S\.A?)\b/.test(d)||/\b(american|north america|usa)\b/i.test(d))t.add('US');
 if(/\b(PAL|UK|EU|EUR)\b/.test(d)||/\b(euro|europe|european)\b/i.test(d))t.add('EU');
 if(/\b(JP|JPN|NTSC-?J)\b/.test(d)||/\b(japan|japanese)\b/i.test(d))t.add('JP');
 return t.size===1?[...t][0]:null;};
const POS=/(100\s?%|everything|\bfull\b|fully|complete|perfect|maxed|finished|unlock|beat|cleared|all\b|every\b|best|master|99|max)/ig;
const NEG=/(\bstart|\bbegin|early|\bjust\b|new game|\bfirst\b|almost|nearly|partial|missing|\bonly\b|\bnot\b|except|1st|\bfew\b|little|\bsome\b|demo|empty|blank|beginning)/ig;
const STRONG=/(100\s?%|100 percent|everything|\bfully\b|\bfull\b|complete|perfect|maxed|all (open|unlock|secret|character|car|track|stage|level|course|mission|item|weapon|player|plane|ship|vehicle|boat|bike|team|event|map|lure|song|cheat|code)|unlock|beaten|cleared|finished|all done|tudo|todo|100)/i;
const score=d=>{let s=0;const p=d.match(POS),n=d.match(NEG);s+=2*(p?p.length:0)-2*(n?n.length:0);if(/100\s?%/.test(d))s+=4;return s;};
const owner={};for(const s of base)for(const i of s.ids)owner[i.replace(/[-\s]/g,'')]=s.dir;
const out=[],extra=[['game','archive_dir','reason']];
for(const m of map1){
  if(done.has(m.dir))continue;
  if(SKIP[m.dir]){extra.push([m.title,m.dir,'skipped: '+SKIP[m.dir]]);continue;}
  if(NOID[m.dir]){extra.push([m.title,m.dir,'no card: '+NOID[m.dir]]);continue;}
  const g=A.load(m.dir);
  if(!g||!g.rows.length){extra.push([m.title,m.dir,'no card: no saves in archive']);continue;}
  // redump candidates
  const notes0=[];
  let cands;
  if(OV[m.dir])cands=dat.filter(d=>d.serial&&OV[m.dir].test(d.name)&&!EXCL.test(d.name));
  else{const names=new Set(m.hits.map(h=>h.replace(/ \[[^\]]*\]$/,'')));cands=dat.filter(d=>d.serial&&names.has(d.name)&&!EXCL.test(d.name));}
  if(!cands.length){extra.push([m.title,m.dir,'no card: no Redump match']);continue;}
  const classes=[...new Set(cands.map(c=>cls(c.name)))].sort();
  const regionsAvail=[...new Set(cands.map(c=>rname[cls(c.name)]))];
  const g0=g.rows.filter(r=>!NOSAVE.test(r.fname)&&!/\.(DWN|EXE)$/i.test(r.fname));
  if(!g0.length){extra.push([m.title,m.dir,'no card: archive has no usable game save']);continue;}
  const fnTags={};for(const r of g0){const t=tagOf(r.desc);(fnTags[r.fname]=fnTags[r.fname]||new Set()).add(t);}
  const bases0=new Set(g0.map(r=>r.fname.slice(0,8).toUpperCase()));
  const compatFor=R=>r=>{const t=tagOf(r.desc);if(t)return t===R;if(bases0.size===1)return true;const o=[...fnTags[r.fname]].filter(x=>x&&x!==R);return !o.length||fnTags[r.fname].has(R);};
  let best=classes[0],regionNote='';
  const rcode=c=>['US','EU','JP','JP'][c];
  const okClass=classes.find(c=>g0.some(compatFor(rcode(c))));
  if(okClass!==undefined){best=okClass;if(okClass!==classes[0])notes0.push('archive saves are for the '+rcode(okClass)+' release, so the '+rcode(okClass)+' ID is used');}
  else regionNote='all archive saves are tagged for a different region than the Redump disc';
  const chosen=cands.filter(c=>cls(c.name)===best);
  const R=rcode(best);
  let ids=[...new Set(chosen.flatMap(c=>cleanIds(c.serial)))];
  const notes=[...notes0];
  const dropped=ids.filter(i=>owner[i.replace(/[-\s]/g,'')]&&owner[i.replace(/[-\s]/g,'')]!==m.dir);
  if(dropped.length){ids=ids.filter(i=>!dropped.includes(i));notes.push(`ID ${dropped.join(',')} shared with another game's disc, card not duplicated`);}
  if(!ids.length){extra.push([m.title,m.dir,'no card: only Redump ID(s) are shared with another game ('+dropped.join(',')+')']);continue;}
  ids.forEach(i=>owner[i.replace(/[-\s]/g,'')]=m.dir);
  const rn=[...new Set(chosen.map(c=>c.name))];
  const rows=g0;
  const bases=new Set(rows.map(r=>r.fname.slice(0,8).toUpperCase()));
  const compat=compatFor(R);
  let pool=rows.filter(compat);
  if(!pool.length)pool=rows;
  pool=pool.map(r=>({r,s:score(r.desc)+(tagOf(r.desc)===R?2:0)}));
  pool.sort((a,b)=>b.s-a.s);
  const pick=pool[0];
  const explicit=tagOf(pick.r.desc)===R;
  let status='ready';
  if(regionNote){status='needs review';notes.push(regionNote);}
  if(!explicit&&bases.size>1&&regionsAvail.length>1){status='needs review';notes.push(`archive has ${bases.size} filename variants (${[...bases].slice(0,4).join('/')}); region of chosen save not confirmed`);}
  else if(!explicit&&regionsAvail.length>1&&bases.size===1)notes.push('single filename across archive; region of save unlabelled');
  if(pick.s<2||!STRONG.test(pick.r.desc)){status='needs review';notes.push('description does not show a clearly complete save');}
  if(!explicit&&R!=='JP'&&regionsAvail.length===1&&bases.size>1){status='needs review';notes.push(`archive has ${bases.size} filename variants`);}
  const comp=g.rows.length>1?`Best of ${rows.length}: ${pick.r.desc.replace(/\s+/g,' ').slice(0,140)}`:`Only save: ${pick.r.desc.replace(/\s+/g,' ').slice(0,140)}`;
  if(OV[m.dir]&&/^(aeroi|aeroif|golfshiyo|jetsetdx)$/.test(m.dir)){status='needs review';notes.push('Redump mapping inferred from filename/title, not confirmed');}
  const companions=[...new Set(rows.map(r=>r.fname).filter(f=>/\.(SYS|OPT|CFG|CNF)$|_(SYS|CFG|CNF|SET)$/.test(f)&&f!==pick.r.fname))];
  if(companions.length&&!/\.(SYS|OPT|CFG|CNF)$|_(SYS|CFG|CNF|SET)$/.test(pick.r.fname))notes.push('game also has settings/system file(s) ('+companions.slice(0,3).join(',')+') not included');
  if(regionsAvail.length>1)notes.push('also released: '+regionsAvail.filter(x=>x!==rname[best]).join('/'));
  if(m.dir==='seventhcrossevolution'){status='needs review';notes.push('VMI size field (44 blocks) disagrees with VMS size (172 blocks); card uses the VMS as-is, same in both archive saves');}
  out.push({dir:m.dir,title:m.title,rname:rn.join(' | '),ids,region:R,files:[pick.r.vmi],completion:comp,status,notes:notes.join('; ')});
}
fs.writeFileSync(path.join(__dirname,'..','selections3.json'),JSON.stringify(out,null,1));
const csv=rows=>rows.map(r=>r.map(c=>/[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c).join(',')).join('\r\n')+'\r\n';
fs.writeFileSync(path.join(__dirname,'..','unmapped_or_skipped.csv'),csv(extra));
console.log(out.length,'selections;',extra.length-1,'skipped/unmapped');
