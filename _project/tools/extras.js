// Extras: (a) per-game attachments (downloads, icons, replays) added to a game's card when they fit,
// (b) standalone VMU minigame cards, (c) cheat-device code cards. Run from _project: node tools/extras.js
const fs=require('fs'),path=require('path');
const A=require('./archive'),V=require('./vmu');
// dir -> vmi names appended to that game's card (only those that fit in 200 blocks are used; build.js reports the rest)
const ATTACH={
 arcadia:['sa_d01.vmi','sa_d02.vmi','sa_d03.vmi','v94208.vmi'],   // official USA download saves + icon
 streetfighter3:['v20786.vmi'],            // Master Rolento download
 capcomsnk2:['cvs2rep1.VMI','cvs2rep2.VMI','cvs2rep3.VMI','cvs2rep4.VMI','cvs2rep5.VMI','cvs2rep6.VMI','cvs2rex1.VMI'], // combo replays
 virtualon:['v39368.vmi','v8748.vmi'],     // replays
 sonic2:['v47754.vmi'],                    // official download file
 sonic:['v90593.vmi'],                     // VMU icon
 floiganbros:['FBROSJ.VMI'],               // January download
 illbleed:['v85416.vmi'],                  // minigame unlocked save
 rayman2:['v5124.vmi'],                    // downloadable minigame
 crazytaxi:['CRAZYT.VMI'],crazytaxi2:['v43160.vmi'],
 nba2k1:['v23656.vmi'],nfl2k1:['v45179.vmi'], // roster updates (official Seganet one for NFL)
 cannonspike:['v50562.vmi'],capcomsnk:['v56329.vmi'],chuchu:['v7640.vmi'],jetgrindradio:['v4596.vmi'],shadowman:['v8737.vmi'],
};
const CAT={
 homebrew:['4WINS','ALNFIGHT','FATRAIN','GLUCKY','IDOUDO','SI','LOGIC','MINE','PACMAN','PAPER','SKETCH','SLIDEPUZ','SNAKY','SOUND','SWAMPY','TETRIS','BREAKOUT','CHAO2','CHAOEDIT','FROG','JOJO','MINICLOC','PSOID','PSOPUZZL','VISION1','WHEREBRUCE','DRACER','FSKATER','TOKYOCAR','ZUQIU'],
 official:['POWERSTN','SCALIBU','4001','4004','4007','4008','GODZILLA','KITTYCAT','POPMUSI1','POPMUSI2','POPMUSI3','SOUL2ADV','VMFL_073','VMFL_081','VMFL_084','SOAMINI','PQ_NTSC','PQ_PAL','SCCBRK'],
};
const g=A.load('minigames');
const GBS=[...(process.env.NO_BLUESWIRL?[]:[A.load('disc_bs_minigames')]),A.load('disc_vm2_minigames')].filter(Boolean);
const items=g.rows.map(r=>{const vmi=V.parseVmi(fs.readFileSync(A.ci(g.path,r.vmi)));const d=fs.readFileSync(A.ci(g.path,r.vms));
  const key=r.vmi.replace(/\.vmi$/i,'');
  const cat=CAT.homebrew.includes(key)?0:CAT.official.includes(key)?1:2;
  return {r,key,cat,blocks:Math.ceil(d.length/512),name:vmi.name};});
// One card per game: a VMU runs the game stored at block 0 only, so several games on one card all launch the first one.
const CN=['Homebrew & fan minigame','Official / publisher minigame','Animation / music video','Collection minigame (Blue Swirl / VM2 pack)'];
for(const gbs of GBS)for(const r of gbs.rows){const vmi=V.parseVmi(fs.readFileSync(A.ci(gbs.path,r.vmi)));const d=fs.readFileSync(A.ci(gbs.path,r.vms));
  const m=r.desc.match(/^(.*?) \((\w+)\) \[source/);const title=m?m[1]:r.desc;const cat2=m?m[2]:'';
  const tc=/[a-z]/.test(title)?title:title.toLowerCase().replace(/\b([a-z])/g,m=>m.toUpperCase()).replace(/\b(Vmu|Cc|Qte|Psx|Pso|Gt|Fps|Soa)\b/g,m=>m.toUpperCase());
  let slug=tc.replace(/www\.\S+|by .*$/i,'').replace(/[^A-Za-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,26);
  const base=r.vmi.replace(/\.vmi$/i,'');
  if(slug.length<3||/^(http|written|ooooo|vmufan)/i.test(slug))slug='Game_'+cat2.slice(0,5)+'_'+base.slice(-4);
  if(/^DC_Animation/.test(slug))slug='DCAnim_'+cat2.slice(0,5)+'_'+base.slice(-4);
  items.push({r:{...r,desc:title},key:base,cat:3,blocks:Math.ceil(d.length/512),name:vmi.name,dir:gbs.dir,bsSlug:slug,restricted:/disc_bs_/.test(gbs.dir)?'blueswirl':undefined});}
const SLUG={'4007':'Marvel_vs_Capcom_2','4008':'Power_Stone_2_JP','PQ_NTSC':'Skies_Arcadia_Pintas_Quest_NTSC','PQ_PAL':'Skies_Arcadia_Pintas_Quest_PAL','SOAMINI':'Skies_Arcadia_Pintas_Quest','SCCBRK':'Cardcaptor_Breakout','DANGELO':'DAngelo_Music_Video','E0':'Enemy_Zero_Training','FASTFURI':'Fast_and_Furious_Animation','GREY':'Greyscale_Photo_Demo'};
const slugOf=(r,key,it)=>{if(it&&it.bsSlug)return it.bsSlug;if(SLUG[key])return SLUG[key];let t=r.desc.split(/:|\. /)[0].replace(/ mini ?game.*$/i,'').replace(/\(.*?\)/g,m=>m.replace(/[()]/g,'')).trim();
  t=t.replace(/[^A-Za-z0-9]+/g,'_').replace(/^_+|_+$/g,'');return (t||key).slice(0,26);};
items.sort((a,b)=>a.cat-b.cat||a.r.vmi.localeCompare(b.r.vmi));
for(const it of items)it.slug0=null;
const out=[];const usedIds=new Set();
for(const it of items){
  let slug='zz_MG_'+slugOf(it.r,it.key,it);let id=slug,n=2;while(usedIds.has(id.toLowerCase())){id=slug.slice(0,20)+'_'+it.key.slice(-4)+(n>2?'_'+n:'');n++;}usedIds.add(id.toLowerCase());
  const nice=id.replace(/^zz_MG_/,'').replace(/_/g,' ');
  out.push({dir:it.dir||'minigames',restricted:it.restricted,outdir:'Dreamcast',title:`VMU minigame: ${nice}`,rname:'(not a disc: standalone VMU minigame)',ids:[id],region:'-',files:[it.r.vmi],
   completion:`${it.key} (${it.name}): ${it.r.desc.replace(/\s+/g,' ').slice(0,100)}`,status:'ready',notes:`${CN[it.cat]}, ${it.blocks} blocks. One game per card because a VMU launches the game at block 0 only`});}

// Shenmue Goodies: viewer game + character data, 3 cards (viewer 50 blocks + up to 75 two-block characters each)
if(!process.env.NO_BLUESWIRL&&A.load('disc_bs_shenmue')){const gs=A.load('disc_bs_shenmue');
  const viewer=gs.rows.find(r=>/viewer/.test(r.desc));const chars=gs.rows.filter(r=>r!==viewer);const per=75;
  for(let i=0;i*per<chars.length;i++){const part=chars.slice(i*per,(i+1)*per);
    out.push({dir:'disc_bs_shenmue',restricted:'blueswirl',outdir:'Dreamcast',title:`VMU minigame: Shenmue Goodies ${i+1} of ${Math.ceil(chars.length/per)}`,rname:'(not a disc: Shenmue character viewer + data)',ids:['zz_MG_Shenmue_Goodies_'+(i+1)],region:'-',
      files:[viewer.vmi,...part.map(r=>r.vmi)],completion:`Viewer plus ${part.length} characters: ${part[0].desc.split(' [')[0]} ... ${part[part.length-1].desc.split(' [')[0]}`,status:'ready',notes:'Run the viewer game; it reads the character files stored on the same card. Cards 1-3 hold different characters'});}}
// cheat-device cards (one per code file; most share a filename so each gets its own card)
const CH=[
 ['arcdx','arcdx1.VMI','CHEATARCDX01','Action Replay CDX code save (many codes loaded)'],['arcdx','AR423.VMI','CHEATARCDX02','Action Replay CDX code save: 423 games, all regions'],
 ['gscdx','gscdx1.VMI','CHEATGSCDX01','GameShark CDX code save'],['gscdx','GSCDX.vmi','CHEATGSCDX02','GameShark CDX code save'],
 ['xploder','XPLODER.VMI','CHEATXPLODER30','Code Breaker / Xploder DC code save (30 games)'],
 ['pso','psocodes.VMI','CHEATPSOGS','GameShark CDX codes for Phantasy Star Online (JP & US)'],['pso2','v45276.vmi','CHEATPSO2XP','Xploder codes for Phantasy Star Online Ver. 2'],['pso2','FCDCHEAT.VMI','CHEATPSO2GS','GameShark codes for Phantasy Star Online Ver. 2'],
 ['soldierfortune','v64385.vmi','CHEATSOFGS','GameShark codes for Soldier of Fortune (unlimited armor/ammo)'],
];
for(const [dir,f,id,t] of CH)out.push({dir,outdir:'Dreamcast',title:'Cheat-device code save: '+t,rname:'(cheat device data, not a disc)',ids:['zz_'+id],region:'-',files:[f],completion:t,status:'needs review',notes:'Only useful with the matching cheat device disc; not tested'});
out.push({dir:'atari',title:'Atari Anniversary Edition (VMU icon only)',rname:'Atari Anniversary Edition (USA)',ids:['T-15130N'],region:'US',files:['ATARI.VMI'],completion:'VMU icon file only; archive has no game save',status:'needs review',notes:'Icon-only card; no game progress to save in this title'});
fs.writeFileSync(path.join(__dirname,'..','selections_extras.json'),JSON.stringify(out,null,1));
fs.writeFileSync(path.join(__dirname,'..','extras_attach.json'),JSON.stringify(ATTACH,null,1));
console.log(items.length,'minigame cards,',CH.length,'cheat cards');
