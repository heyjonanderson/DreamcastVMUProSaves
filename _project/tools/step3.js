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
nhl2k:/^NHL 2K /,metropolisracer:/^MSR /,buzzlightyear:/Buzz Lightyear of Star Command/,ready_rumble:/^Ready 2 Rumble Boxing \(/,ready_rumble2:/Round 2/,
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
// Manual decisions after reading all archive descriptions (override the heuristic pick).
// files: explicit VMI picks; fn: pick best-scoring row whose archive filename matches; extras: optional extra VMIs added if they fit
const R_='ready',N_='needs review';
const FORCE={
'4wheelthunder':{files:['4WHEEL.VMI'],st:R_,note:'All unlocked per description'},
'armada':{files:['v44206.vmi'],st:R_,note:'Highest-level character save (level 44 Terran); game has no unlock-everything state'},
'bangaio':{files:['v95185.vmi'],st:R_,note:'All stages completed per description'},
'bomberman':{files:['v32866.vmi'],st:R_,note:'"99% game" per description'},
'caesar':{files:['v7771.vmi'],st:R_,note:'Only save in archive (lots of money); casino game has no unlock state'},
'champsurfer':{files:['v86604.vmi'],st:R_,note:'All 10 beaches per description'},
'dabi1':{files:['DABI1.VMI'],st:R_,note:'Only save in archive (money max)'},dabi2:{files:['DABI2.VMI'],st:R_,note:'Only save in archive (money max)'},
'deepfighter':{files:['v2644.vmi'],st:R_,note:'Beaten-game save (uploader unsure it saved after final boss)'},
'draconus':{files:['v59123.vmi'],st:R_,note:'Last level, very strong character'},
'dragon':{files:['v68252.vmi'],st:R_,note:'End of game, all complete except gold fire lizard egg'},
'eldorado1':{files:['eldgate1.VMI'],st:R_,note:'Only save in archive (last boss)'},eldorado7:{files:['eldgate7.VMI'],st:R_,note:'Only save in archive (last boss)'},
'espnnba':{files:['v36243.vmi'],st:N_,note:'Only save: early in a season, not a completed state'},
'evildead':{files:['v97286.vmi'],st:R_,note:'Last save point before final boss'},
'evolution2':{files:['00000012.vmi'],st:R_,note:'"Perfect Save! All Open!" per description'},
'expendable':{files:['v91860.vmi'],st:R_,note:'Starts at level 21, the last level'},
'f1worldprix':{files:['v75648.vmi'],st:N_,note:'Mid-championship save; no completed save in archive'},
'fightforce2':{files:['v94821.vmi'],st:N_,note:'Level 8 save; archive has no completed save'},
'fireprowd':{files:['SYS.VMI'],st:R_,note:'System file (all wrestlers). 250+ individual move/edit files in archive not included'},
'flag2flag':{files:['v54673.vmi'],st:R_,note:'Extra cars, camera angle, super speed mode unlocked'},
'framegride':{files:['FRAMEGR.VMI'],st:R_,note:'Only save in archive (final stage)'},
'fushigi':{files:['asuka001.VMI'],st:R_,note:'Weapon level 99 (only 2 saves in archive)'},
'gauntletlegends':{files:['v48502.vmi'],st:R_,note:'Level 99 Jester, all runes/shards/obelisks, max stats'},
'godzilla':{files:['GODZILLA.VMI'],st:R_,note:'Only save in archive (hidden characters opened)'},
'grandia2':{files:['v81729.vmi'],st:R_,note:'All characters maxed at final boss, no cheat device used per description'},
'gunbird2':{files:['v33167.vmi'],st:N_,note:'Only save; description gives no unlock info'},
'gundamol':{files:['GUNDAMO2.VMI'],st:R_,note:'All pilots level 20'},
'gundambz':{files:['00000181.vmi'],st:R_,note:'"Perfect Save! All Open!"'},
'hoyle':{files:['v7562.vmi'],st:R_,note:'Millions in money; casino game has no unlock state'},
'hswords':{files:['100SWOR3.VMI'],st:R_,note:'"Last save, will be cleared"'},
'illbleed':{files:['v53049.vmi'],st:R_,note:'Save before final boss plus a save after beating the game twice'},
'jeremymcgrath':{files:['v85569.vmi'],st:R_,note:'125cc beaten, custom items, tabletop freestyle open'},
'langrisser':{files:['langris2.VMI'],st:R_,note:'High-level save (only 2 in archive)'},
'monacoprix':{files:['v88272.vmi'],st:R_,note:'Season 2002 cars and drivers (data update; no completion state)'},
'namcomuseum':{files:['v15212.vmi'],st:R_,note:'High scores for each game'},
'nbahoopz':{files:['v13529.vmi'],st:R_,note:'Only save: updated roster'},
'ncaa':{files:['v26223.vmi'],st:R_,note:'Only save: bowl games, Rose Bowl'},
'nflblitz':{files:['v21453.vmi'],st:R_,note:'Only save: Super Bowl run, 31-game win streak'},
'nflblitz2k1':{files:['v58068.vmi'],st:R_,note:'Team/roster saves only; no completion state. Alts: v78336, v11701'},
'nightcreature2':{files:['v22798.vmi'],st:R_,note:'Right before the final level'},
'omikron':{files:['v89140.vmi'],st:R_,note:'Last save before last boss'},
'pso':{files:['USFIRES1.VMI','USFIRES2.VMI','USSTEEL1.VMI','USSTEEL2.VMI'],extras:['LETTER1.VMI','LETTER2.VMI','RAREMAT1.VMI','RAREMAT2.VMI','RETIRED1.VMI','RETIRED2.VMI','SOULV2_1.VMI','SOULV2_2.VMI','FIRE1.VMI','FIRE2.VMI','EASTER1.VMI','EASTER2.VMI','EASTER3.VMI'],st:N_,note:'Archive has only official download quest files (no character save); US-labelled quests plus as many others as fit; JP-labelled download saves skipped'},
'princessh':{files:['PRINCESS.VMI'],st:N_,note:'Only save; description gives no progress info'},
'puyopuyo4':{files:['PUYOP4.VMI'],st:R_,note:'Only save: hidden stages and characters opened'},
'redlineracer':{files:['REDRACE.VMI'],st:N_,note:'Only save: first set of racers only'},
'residentevil2':{fn:/^RESEVIL2\.SYS/,st:R_,note:'System data: all 3D models, movies, illustrations. RESEVIL2 = US/EU name (BIOHAZRD2 is the JP name). Scenario saves (.A01/.O01) not included'},
'residentevil3':{fn:/^RESEVIL3\.SYS/,st:R_,note:'RESEVIL3 = US/EU name (BIOHAZRD3 is the JP name)'},
'resident_evil':{files:['v65733.vmi'],st:R_,note:'RE_CV000 = US/EU name (VERONICA is the JP name)'},
'roadsters':{files:['v96969.vmi'],st:N_,note:'Starts at season two; archive has no completed save'},
'roommate':{files:['ROOMMATE.VMI'],st:R_,note:'Only save in archive ("ultimate" save)'},
'sakato1':{files:['TEDAH1_1.VMI'],st:R_,note:'Official team download only; archive has no regular save'},
'sakato2':{files:['TEDAH2e1.VMI'],st:R_,note:'Official song download only; archive has no regular save'},
'sakura_card':{files:['v14383.vmi'],st:N_,note:'Only save: second stage'},
'sakurapz':{files:['sakurapz.VMI'],st:N_,note:'Only save; description gives no progress info'},
'bassfish2':{files:['v40328.vmi'],st:R_,note:'Complete: all lures, colours, tournaments won, all characters. BASSFISHING2 = US name (GETBASS2DATA is JP)'},
'smashpack':{files:['MDEMU001.VMI','MDEMU002.VMI','v28454.vmi'],st:R_,note:'One save per included game: Phantasy Star II best save, Shining Force last save, Sonic 3D-era save (last stage as Super Sonic)'},
'nba2k':{files:['v90157.vmi'],st:R_,note:'Roster/data save, no completion state'},
'nfl2k':{files:['v41856.vmi'],st:R_,note:'Roster/data save, no completion state'},
'segagaga':{files:['SEGAGAGA.VMI'],st:R_,note:'"Super Save! Money Max!"'},
'seirei':{files:['SHENGLJ2.VMI'],st:N_,note:'Only stage 1 saves in archive'},
'silver':{files:['v760.vmi'],st:R_,note:'All orbs, weapons and specials at end of game'},
'slave_zero':{files:['v31826.vmi'],st:R_,note:'Final boss with invincibility'},
'snocross':{files:['v78041.vmi'],st:R_,note:'Almost all open'},
'sorcer':{files:['7XING.VMI'],st:R_,note:'Money and EXP max'},
'soulfighter':{files:['v20176.vmi'],st:R_,note:'Only save in archive (last level)'},
'stupidinvaders':{files:['v1814.vmi'],st:R_,note:'Disc 2 final stage (in the rocket)'},
'srw':{files:['SRWLAST2.VMI','SRWSYSTE.VMI'],st:R_,note:'All max at last stage + system data (all options open)'},
'rzephyr':{files:['XIFENG02.VMI'],st:R_,note:'"The latest save"'},
'thering':{files:['THERING.VMI'],st:R_,note:'Shortly before the ending'},
'tricolore':{files:['3jiao3.VMI'],st:R_,note:'EXP 999999'},
'virtuaathlete':{files:['v1963.vmi'],st:R_,note:'All records'},
'wetrix':{files:['v39228.vmi'],st:R_,note:'New pieces and floors unlocked'},
'baseball2k1':{files:['v54876.vmi'],st:R_,note:'Roster/season save, no completion state'},baseball2k2:{files:['v95783.vmi'],st:R_,note:'Roster/season save, no completion state'},
'teeoff':{fn:/^TEE_OFF_/,st:R_,note:'TEE_OFF_ = US name (SHIYOUY2 is the JP Golf Shiyouyo save)'},
'lemans':{fn:/^TDLEMANS\.001/,st:R_,note:'TDLEMANS = US name (LEMANS24 is the 24 Hours/EU-JP name)'},
'vrally':{fn:/^TDVRALLY/,st:R_,note:'TDVRALLY = US name (_VRALLY2_ is V-Rally 2)'},
'tetris':{fn:/^NEXTTETRIS/,st:R_,note:'NEXTTETRIS = Next Tetris (US); SEGATETRIS is the JP Sega Tetris save'},
'tokyo2':{fn:/^TXRACER/,st:R_,note:'TXRACER = US name (SHUTOKOU is the JP name)'},
'dynamitecop':{fn:/^D_COP_US\.REC/,st:R_,note:'D_COP_US = US name (DDEKA2DC is the JP Dynamite Deka 2 save)'},
'espntrack':{fn:/^ITANDF_U/,st:R_,note:'ITANDF_U = US name (ITANDF_E = EU)'},
'gundam':{fn:/^GUNDAM_US/,st:R_,note:'GUNDAM_US = US name'},
'house_dead':{fn:/^HOD2DC_U/,st:R_,note:'HOD2DC_U = US name'},
'jetgrindradio':{fn:/^JETGRIND_SYS/,st:R_,note:'JETGRIND = US name (JETRADIO is Jet Set Radio JP/EU)'},
'metropolisracer':{fn:/^MSRSINGL/,st:R_,note:'MSRSINGL = single-player save (MSRGHOST is ghost data)'},
'rainbowsix':{fn:/^RAINBOW6/,st:R_,note:'RAINBOW6.CMP campaign save; *.PLN mission plan files not included'},
'samba':{fn:/^SAMBAUS1\.SYS/,st:R_,note:'SAMBAUS1 = US name (SAMBADE1 = EU/DE, SAMBAV2K = JP Ver.2000)'},
'arcadia':{fn:/^S\.ARCADIA001/,st:R_,note:'S.ARCADIA = US name (E.ARCADIA = JP, ARCADIA_E = EU, per archive download descriptions)'},
'segarally':{files:['SGRALLY2.VMI'],st:R_,note:'Labelled "All unlocked (USA)" in archive; SGRALLY2I0VD = US name (SG_RALLY20VD is the JP version)'},
'golfshiyo':{files:['SHIGOLF2.VMI'],st:R_,note:'Save filename SHIYOUY2 matches Golf Shiyou yo 2 (T-44501M); only save in archive'},
'silentscope':{fn:/^SSCOPE01/,st:R_,note:'SSCOPE01 = US/EU name (SILENT01 is the JP name); confirmed by K3zter save-db'},
'xsports':{files:['v34612.vmi'],st:R_,note:'XTREMESP = Xtreme Sports (US). EXTREMES.SYS is the different game Sega Extreme Sports (EU/JP) and was wrongly used before; confirmed by K3zter save-db'},
'f1worldprix':{fn:/^F1WGP4DC_/,st:N_,note:'F1WGP4DC_ = F1 World Grand Prix (US). F1WGP4DC2 saves belong to F1 World Grand Prix II (JP/EU), which was wrongly used before; this US save is mid-season, no completed US save in archive'},
'd2':{fn:/^D2_______001/,st:R_,note:'D2_______001 slot; D2SYSTEM file not included'},
};
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
  let pickRows=[pick.r];
  const F=FORCE[m.dir];
  if(F){
    if(F.files){pickRows=F.files.map(v=>rows.find(r=>r.vmi.toLowerCase()===v.toLowerCase()));if(pickRows.some(x=>!x))throw new Error(m.dir+': forced file missing');}
    else{const c=rows.filter(r=>F.fn.test(r.fname)).map(r=>({r,s:score(r.desc)})).sort((a,b)=>b.s-a.s);if(!c.length)throw new Error(m.dir+': no fn match');pickRows=[c[0].r];}
    pick.r=pickRows[0];status=F.st;notes.length=0;notes.push(...notes0);notes.push(F.note);
  }
  const comp=g.rows.length>1?`Best of ${rows.length}: ${pick.r.desc.replace(/\s+/g,' ').slice(0,140)}`:`Only save: ${pick.r.desc.replace(/\s+/g,' ').slice(0,140)}`;
  if(OV[m.dir]&&/^(aeroi|aeroif|jetsetdx)$/.test(m.dir)){status='needs review';notes.push('Redump mapping inferred from filename/title, not confirmed');}
  const companions=[...new Set(rows.map(r=>r.fname).filter(f=>/\.(SYS|OPT|CFG|CNF)$|_(SYS|CFG|CNF|SET)$/.test(f)&&f!==pick.r.fname))];
  if(companions.length&&!/\.(SYS|OPT|CFG|CNF)$|_(SYS|CFG|CNF|SET)$/.test(pick.r.fname))notes.push('game also has settings/system file(s) ('+companions.slice(0,3).join(',')+') not included');
  if(regionsAvail.length>1)notes.push('also released: '+regionsAvail.filter(x=>x!==rname[best]).join('/'));
  if(m.dir==='seventhcrossevolution'){status='ready';notes.push('VMI header size field (44 blocks) is wrong; the VMS itself is 172 blocks with no trailing padding, and the card uses the full VMS');}
  out.push({dir:m.dir,title:m.title,rname:rn.join(' | '),ids,region:R,files:pickRows.map(r=>r.vmi),extras:F&&F.extras,completion:F?pickRows.map(r=>r.desc.replace(/\s+/g,' ').slice(0,90)).join(' + '):comp,status,notes:notes.join('; ')});
}
fs.writeFileSync(path.join(__dirname,'..','selections3.json'),JSON.stringify(out,null,1));
const csv=rows=>rows.map(r=>r.map(c=>/[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c).join(',')).join('\r\n')+'\r\n';
fs.writeFileSync(path.join(__dirname,'..','unmapped_or_skipped.csv'),csv(extra));
console.log(out.length,'selections;',extra.length-1,'skipped/unmapped');
