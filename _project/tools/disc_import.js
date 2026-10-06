// Pulls chosen saves from the VMU Tool "Dream Explorer" disc (extracted VMU_SAVES) into _project/extra/<key>/ (VMI+VMS+README table,
// same format as the bucanero archive) and writes selections_disc.json (upgrades to existing games + new games).
// Usage: node tools/disc_import.js <disc.json from the scratch loader>   (generated data is committed; the disc itself is not)
// Blue Swirl content is excluded here on purpose: its licence says it must not be released without VMU Tool.
const fs=require('fs'),path=require('path');
const disc=require(path.resolve(process.argv[2]));
const EXTRA=path.join(__dirname,'..','extra');
const SRCNAME={DC_KOOL:'DC_KOOL (Joe Endy, fp.enter.net/~jkool/DCSaves.htm)',HEEZY:'HEEZY (hrb2k)',JEFFMA:'JEFFMA (jeffma.51.net/dcgl)',PURHAZE:'PURHAZE (geocities.com/purhaze5/vmu.html)'};
// upgrades: replace the save(s) used for an existing game (key = existing selection dir)
const UPGRADES={
 capcomsnk:{pick:[['DC_KOOL','00000022']],status:'ready',note:'Region labelled US in the DC_KOOL collection (VS.SNKMF_SYS); confirms the US filename. "All Unlocked"'},
 streetfighter3:{pick:[['DC_KOOL','00000287']],status:'ready',note:'US-labelled SYS save: all 30 masters beaten and full-power World Tour characters (replaces the unlabelled SYS+WTR pair)',drop:['v20786.vmi']},
 ufc:{pick:[['DC_KOOL','00000345']],status:'ready',note:'US-labelled SYS save: all belts, Bruce Buffer card girl, fighting styles, voice and nickname unlocked (replaces the SYS+EDT pair from different creators)'},
 chuchu:{pick:[['DC_KOOL','00000031']],status:'ready',note:'US-labelled: all 1P puzzle stages completed with stars, all challenge stages and characters'},
};
// new games (all from non-restricted sources): rname = exact Redump name(s)
const NEW=[
 {key:'climaxlanders',title:'Climax Landers',rname:['Climax Landers (Japan)'],region:'JP',pick:[['DC_KOOL','00000032']]},
 {key:'coolboardersburrrn',title:'Cool Boarders Burrrn!',rname:['Cool Boarders Burrrn! (Japan)'],region:'JP',pick:[['DC_KOOL','00000035']]},
 {key:'getbass',title:'Get Bass (Sega Bass Fishing JP)',rname:['Get Bass (Japan)'],region:'JP',pick:[['DC_KOOL','00000096']]},
 {key:'giantgram1',title:'Giant Gram: Zen Nihon Pro Wres 2',rname:['Giant Gram - Zen Nihon Pro Wres 2 in Nippon Budoukan (Japan)'],region:'JP',pick:[['DC_KOOL','00000097']]},
 {key:'jetcoasterdream',title:'Jet Coaster Dream',rname:['Jet Coaster Dream (Japan)'],region:'JP',pick:[['DC_KOOL','00000115']]},
 {key:'toukon4',title:'Shin Nihon Pro Wrestling: Toukon Retsuden 4',rname:['Shin Nihon Pro Wrestling - Toukon Retsuden 4 (Japan)'],region:'JP',pick:[['DC_KOOL','00000146']]},
 {key:'nhl2k2',title:'Sega Sports NHL 2K2',rname:['NHL 2K2 (USA)'],region:'US',pick:[['DC_KOOL','00000150']],note:'Roster update (5 Nov 2002); no completion state'},
 {key:'popnmusic3',title:"Pop'n Music 3 Append Disc",rname:["Pop'n Music 3 - Append Disc (Japan)"],region:'JP',pick:[['DC_KOOL','00000160']]},
 {key:'superspeedracing',title:'Super Speed Racing',rname:['Super Speed Racing (Japan)'],region:'JP',pick:[['DC_KOOL','00000321']]},
 {key:'kikaioh',title:'Choukou Senki Kikaioh (Tech Romancer JP)',rname:['Choukou Senki Kikaioh (Japan)'],region:'JP',pick:[['DC_KOOL','00000325']],note:'JP save; the US release (Tech Romancer) uses a different filename'},
 {key:'aerodancing',title:'Aero Dancing featuring Blue Impulse',rname:['Aero Dancing featuring Blue Impulse (Japan)'],region:'JP',pick:[['DC_KOOL','00000004']]},
 {key:'aerodancingf',title:'Aero Dancing F',rname:['Aero Dancing F (Japan)','Aero Dancing F (Japan) (Rev A)'],region:'JP',pick:[['DC_KOOL','00000005']],note:'Fighter Pilot complete / Tactical #8'},
 {key:'borderdown',title:'Border Down',rname:['Border Down (Japan)'],region:'JP',pick:[['HEEZY','00000025']],note:'Both Arcade and Remix mode unlocked (HEEZY, JP-labelled)'},
 {key:'seaman',title:'Seaman',rname:['Seaman (USA)'],region:'US',pick:[['PURHAZE','SEA1'],['PURHAZE','SEA2']],status:'needs review',note:'PURHAZE saves have no description; USR and _VM files taken together'},
 {key:'dvineluv',title:'D+Vine [Luv]',rname:['D+Vine [Luv] (Japan)'],region:'JP',pick:[['JEFFMA','DVINELUV']],status:'needs review',note:'JEFFMA save has no description'},
];
const find=(src,base)=>{const m=disc.filter(x=>x.src===src&&x.base===base);if(m.length!==1)throw new Error('pick '+src+'/'+base+' -> '+m.length);return m[0];};
const credit=d=>{const m=d.match(/Save By:\s*(.+)$/i);return m?m[1].trim():''};
const w=(key,picks)=>{const dir=path.join(EXTRA,key);fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
  const rows=[];const names=[];
  for(const [src,base] of picks){const x=find(src,base);const n=`${src.toLowerCase()}_${base}`;
    fs.copyFileSync(x.vmi,path.join(dir,n+'.vmi'));fs.copyFileSync(x.vms,path.join(dir,n+'.VMS'));
    const desc=(x.desc.replace(/^(US|JP|EU|UK|USA|PAL)\b\s*/,'').replace(/Save By:.*$/i,'').trim()||'(no description)')+` [source: ${SRCNAME[src]}${credit(x.desc)?'; saved by '+credit(x.desc):''}${x.region?'; region '+x.region:/^(US|JP|EU)\b/.test(x.desc)?'; region '+x.desc.match(/^(US|JP|EU)/)[1]:''}]`;
    rows.push(`| ![](x.gif) | \`${x.fname}\` | [${n}.vmi](${n}.vmi) | [${n}.VMS](${n}.VMS) | ${desc} |`);names.push(n+'.vmi');}
  fs.writeFileSync(path.join(dir,'README.md'),`# ${key}\n\n| Icon | Filename | VMI | VMS | Description |\n|---|---|---|---|---|\n${rows.join('\n')}\n`);return names;};
const out={upgrades:{},new:[]};
for(const [dir,u] of Object.entries(UPGRADES)){const names=w('disc_'+dir,u.pick);out.upgrades[dir]={srcdir:'disc_'+dir,files:names,status:u.status,notes:u.note,drop:u.drop||[]};}
for(const n of NEW){const names=w('disc_'+n.key,n.pick);out.new.push({dir:'disc_'+n.key,srcdir:'disc_'+n.key,title:n.title,rname:n.rname.join(' | '),ids:['?'],region:n.region,files:names,completion:'See notes',status:n.status||'ready',notes:(n.note?n.note+'. ':'')+'From the VMU Tool Dream Explorer disc ('+n.pick.map(p=>p[0]).filter((v,i,a)=>a.indexOf(v)===i).join(', ')+')'});}
fs.writeFileSync(path.join(__dirname,'..','selections_disc.json'),JSON.stringify(out,null,1));
console.log(Object.keys(out.upgrades).length,'upgrades,',out.new.length,'new games');
