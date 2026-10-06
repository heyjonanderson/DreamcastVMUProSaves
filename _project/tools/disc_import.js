// Pulls chosen saves from the VMU Tool "Dream Explorer" disc (extracted VMU_SAVES) into _project/extra/<key>/ (VMI+VMS+README table,
// same format as the bucanero archive) and writes selections_disc.json (upgrades to existing games + new games).
// Usage: node tools/disc_import.js <disc.json from the scratch loader>   (generated data is committed; the disc itself is not)
// Blue Swirl picks are flagged restricted:'blueswirl' (the disc README asked that they not be released without VMU Tool; the site is gone and the owner chose to publish).
// Build without them with: NO_BLUESWIRL=1 node tools/build.js  (selections.js drops flagged entries).
const fs=require('fs'),path=require('path');
const disc=require(path.resolve(process.argv[2]));
const EXTRA=path.join(__dirname,'..','extra');
const SRCNAME={BLUE_SWIRL:'BLUE_SWIRL (blueswirl.shorturl.com, (c) 2006 Blue Swirl; site now offline)',DC_KOOL:'DC_KOOL (Joe Endy, fp.enter.net/~jkool/DCSaves.htm)',HEEZY:'HEEZY (hrb2k)',JEFFMA:'JEFFMA (jeffma.51.net/dcgl)',PURHAZE:'PURHAZE (geocities.com/purhaze5/vmu.html)'};
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
const find=(src,base,game)=>{const m=disc.filter(x=>x.src===src&&x.base===base&&(!game||x.game===game));if(m.length!==1)throw new Error('pick '+src+'/'+base+'/'+game+' -> '+m.length);return m[0];};
const clean=t=>t.replace(/<[^>]*@[^>]*>/g,'').replace(/\S+@\S+/g,'').replace(/\s+/g,' ').trim();
const credit=d=>{d=clean(d);const m=d.match(/Save By:\s*(.+)$/i);return m?m[1].trim():''};
const w=(key,picks)=>{const dir=path.join(EXTRA,key);fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
  const rows=[];const names=[];
  for(const [src,base,game] of picks){const x=find(src,base,game);const n=`${src.toLowerCase()}_${game?game.toLowerCase().slice(0,10)+'_':''}${base}`;
    fs.copyFileSync(x.vmi,path.join(dir,n+'.vmi'));fs.copyFileSync(x.vms,path.join(dir,n+'.VMS'));
    const desc=(clean(x.desc).replace(/^(US|JP|EU|UK|USA|PAL)\b\s*/,'').replace(/Save By:.*$/i,'').trim()||'(no description)')+` [source: ${SRCNAME[src]}${credit(x.desc)?'; saved by '+credit(x.desc):''}${x.region?'; region '+x.region:/^(US|JP|EU)\b/.test(x.desc)?'; region '+x.desc.match(/^(US|JP|EU)/)[1]:''}]`;
    rows.push(`| ![](x.gif) | \`${x.fname}\` | [${n}.vmi](${n}.vmi) | [${n}.VMS](${n}.VMS) | ${desc} |`);names.push(n+'.vmi');}
  fs.writeFileSync(path.join(dir,'README.md'),`# ${key}\n\n| Icon | Filename | VMI | VMS | Description |\n|---|---|---|---|---|\n${rows.join('\n')}\n`);return names;};
const out={upgrades:{},new:[]};
for(const [dir,u] of Object.entries(UPGRADES)){const names=w('disc_'+dir,u.pick);out.upgrades[dir]={srcdir:'disc_'+dir,files:names,status:u.status,notes:u.note,drop:u.drop||[]};}
for(const n of NEW){const names=w('disc_'+n.key,n.pick);out.new.push({dir:'disc_'+n.key,srcdir:'disc_'+n.key,title:n.title,rname:n.rname.join(' | '),ids:['?'],region:n.region,files:names,completion:'See notes',status:n.status||'ready',notes:(n.note?n.note+'. ':'')+'From the VMU Tool Dream Explorer disc ('+n.pick.map(p=>p[0]).filter((v,i,a)=>a.indexOf(v)===i).join(', ')+')'});}

// ---- Blue Swirl picks (restricted flag) ----
const BS_UP={ // existing game dir -> pick
 fightvip2:{pick:[['BLUE_SWIRL','SAVE0000','FIGHTING_VIPERS_2']],note:'Blue Swirl collection: "everything unlocked" (French uploader)'},
 redlineracer:{pick:[['BLUE_SWIRL','SAVE0000','REDLINE_RACER']],note:'Blue Swirl collection: all tracks free'},
 sakura_card:{pick:[['BLUE_SWIRL','SAVE0000','SAKURA_CARD_CAPTOR_TOMOYO_VIDEO']],note:'Blue Swirl collection (JP): nearly all stages open plus some extras'},
 godzilla:{pick:[['BLUE_SWIRL','SAVE0000','GODZILLA_GENERATIONS']],note:'Blue Swirl collection: all characters unlocked'},
 f1worldprix:{pick:[['BLUE_SWIRL','SAVE0000','F1_WORLD_GRAND_PRIX_II']],note:'Blue Swirl collection: tournament at the last course',status:'ready'},
};
const BS_NEW=[
 {key:'aquagt',title:'Aqua GT',rname:['Aqua GT (Europe) (En,Fr,De)'],region:'EU',pick:[['BLUE_SWIRL','SAVE0000','AQUA_GT']],note:'All boats and tracks unlocked in arcade mode'},
 {key:'cvspro',title:'Capcom vs. SNK Millennium Fight 2000 Pro',rname:['Capcom vs. SNK - Millennium Fight 2000 Pro (Japan)'],region:'JP',pick:[['BLUE_SWIRL','SAVE0000','CAPCOM_VS_SNK_PRO']],note:'Everything open ("tudo aberto")'},
 {key:'ddr2nd',title:'Dance Dance Revolution 2nd Mix',rname:['Dance Dance Revolution 2nd Mix - Dreamcast Edition (Japan)'],region:'JP',pick:[['BLUE_SWIRL','SAVE0000','DANCE_DANCE_REVOLUTION_2ND_MIX']],note:'Just about everything unlocked'},
 {key:'gunspike',title:'Gunspike',rname:['Gunspike (Japan)'],region:'JP',pick:[['BLUE_SWIRL','SAVE0000','GUNSPIKE']],note:'Game finished'},
 {key:'nanatsu',title:'Nanatsu no Hikan (Seven Mansions)',rname:['Nanatsu no Hikan - Senritsu no Bishou (Japan)'],region:'JP',pick:[['BLUE_SWIRL','SAVE0000','SEVEN_MANSIONS']],note:'Complete'},
 {key:'snowsurfers',title:'Snow Surfers',rname:['Snow Surfers (Europe)'],region:'EU',pick:[['BLUE_SWIRL','SAVE0000','SNOW_SURFERS']],note:'All secrets unlocked'},
 {key:'thc2',title:'Tokyo Highway Challenge 2',rname:['Tokyo Highway Challenge 2 (Europe)'],region:'EU',pick:[['BLUE_SWIRL','SAVE0000','TOKYO_HIGHWAY_CHALLENGE_2']],note:'All tracks open, 258 rivals beaten'},
 {key:'deadlyskies',title:'Deadly Skies',rname:['Deadly Skies (Europe) (En,Fr,De,Es,It)'],region:'EU',pick:[['BLUE_SWIRL','SAVE0000','DEADLY_SKIES']],status:'needs review',note:'19 missions cleared; no completed save'},
 {key:'dragonsblood',title:'Dragons Blood',rname:['Dragons Blood (Europe) (En,Fr,De)'],region:'EU',pick:[['BLUE_SWIRL','SAVE0000','DRAGONS_BLOOD']],note:'Final level (PAL)'},
 {key:'runecast',title:'Rune Caster',rname:['Rune Caster (Japan)'],region:'JP',pick:[['BLUE_SWIRL','SAVE0000','RUNECAST'],['BLUE_SWIRL','SAVE0001','RUNECAST'],['BLUE_SWIRL','SAVE0002','RUNECAST']],status:'needs review',note:'Three-file save set (SYS, DAT, CP2); no clear description'},
 {key:'puyoda',title:'Puyo Puyo Da!',rname:['Puyo Puyo Da! Featuring Ellena System (Japan)'],region:'JP',pick:[['BLUE_SWIRL','SAVE0000','PUYO_PUYO_DA']],status:'needs review',note:'No description'},
 {key:'vampirechron',title:'Vampire Chronicle',rname:['Vampire Chronicle for Matching Service (Japan)'],region:'JP',pick:[['BLUE_SWIRL','SAVE0000','VAMPIRE_CHRONICLE']],status:'needs review',note:'No description'},
];
for(const [dir,u] of Object.entries(BS_UP)){const names=w('disc_bs_'+dir,u.pick);out.upgrades[dir]={srcdir:'disc_bs_'+dir,files:names,status:u.status||'ready',notes:u.note,drop:[],restricted:'blueswirl'};}
for(const n of BS_NEW){const names=w('disc_bs_'+n.key,n.pick);out.new.push({dir:'disc_bs_'+n.key,srcdir:'disc_bs_'+n.key,title:n.title,rname:n.rname.join(' | '),ids:['?'],region:n.region,files:names,completion:'See notes',status:n.status||'ready',notes:n.note+'. From the Blue Swirl collection on the VMU Tool Dream Explorer disc',restricted:'blueswirl'});}

// ---- Blue Swirl / Rockin'-B VMU games from the disc's VMU_GAMES (arg 2 = extracted VMU_GAMES folder), minus ones already in the archive minigames ----
if(process.argv[3]){
  const crypto=require('crypto'),A=require('./archive'),V=require('./vmu');
  const H=b=>crypto.createHash('md5').update(b).digest('hex');const have=new Set();const m0=A.load('minigames');for(const r of m0.rows)have.add(H(fs.readFileSync(A.ci(m0.path,r.vms))));
  const dir=path.join(EXTRA,'disc_bs_minigames');fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});const rows=[];
  for(const cat of fs.readdirSync(process.argv[3])){const cd=path.join(process.argv[3],cat);if(!fs.statSync(cd).isDirectory())continue;
    for(const f of fs.readdirSync(cd).filter(f=>/\.VMS$/i.test(f)).sort()){const base=f.replace(/\.VMS$/i,'');const vmi=path.join(cd,base+'.VMI');if(!fs.existsSync(vmi))continue;
      const data=fs.readFileSync(path.join(cd,f));if(have.has(H(data)))continue;have.add(H(data));
      const pv=V.parseVmi(fs.readFileSync(vmi));const clean2=b=>b.toString('latin1').replace(/[^\x20-\x7e]/g,'').replace(/\S+@\S+/g,'').trim();
      const t=clean2(data.subarray(0x210,0x230))||clean2(data.subarray(0x200,0x210))||base;const n=`bs_${cat.toLowerCase()}_${base.toLowerCase()}`;
      fs.copyFileSync(vmi,path.join(dir,n+'.vmi'));fs.copyFileSync(path.join(cd,f),path.join(dir,n+'.VMS'));
      rows.push(`| ![](x.gif) | \`${pv.name}\` | [${n}.vmi](${n}.vmi) | [${n}.VMS](${n}.VMS) | ${t} (${cat.toLowerCase()}) [source: Blue Swirl collection / Rockin'-B games on the VMU Tool disc; (c) 2006 Blue Swirl] |`);}}
  fs.writeFileSync(path.join(dir,'README.md'),`# disc_bs_minigames\n\n| Icon | Filename | VMI | VMS | Description |\n|---|---|---|---|---|\n${rows.join('\n')}\n`);console.log(rows.length,'extra minigames');}
fs.writeFileSync(path.join(__dirname,'..','selections_disc.json'),JSON.stringify(out,null,1));
console.log(Object.keys(out.upgrades).length,'upgrades,',out.new.length,'new games');
