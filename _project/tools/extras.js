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
const items=g.rows.map(r=>{const vmi=V.parseVmi(fs.readFileSync(A.ci(g.path,r.vmi)));const d=fs.readFileSync(A.ci(g.path,r.vms));
  const key=r.vmi.replace(/\.vmi$/i,'');
  const cat=CAT.homebrew.includes(key)?0:CAT.official.includes(key)?1:2;
  return {r,key,cat,blocks:Math.ceil(d.length/512),name:vmi.name};});
items.sort((a,b)=>a.cat-b.cat||b.blocks-a.blocks);
const cards=[];
for(const it of items){let c=cards.find(c=>c.cat===it.cat&&c.used+it.blocks<=200&&!c.names.has(it.name));
  if(!c){c={cat:it.cat,used:0,names:new Set(),items:[]};cards.push(c);}
  c.used+=it.blocks;c.names.add(it.name);c.items.push(it);}
const CN=['Homebrew & fan minigames','Official / publisher minigames','Animations & music videos'];
const out=[];let n=0;
const cnt={};
for(const c of cards){cnt[c.cat]=(cnt[c.cat]||0)+1;n++;const num=String(n).padStart(2,'0');
  out.push({dir:'minigames',outdir:'Dreamcast',title:`VMU minigames ${num}: ${CN[c.cat]}`,rname:'(not a disc: standalone VMU minigame collection)',ids:['MINIGAMES'+num],region:'-',files:c.items.map(i=>i.r.vmi),
   completion:c.items.map(i=>i.key+' ('+i.name+')').join(', '),status:'ready',notes:`${c.items.length} VMU game/animation files, ${c.used} blocks. Placement/folder convention on VMU Pro not verified; original .VMI/.VMS are in originals/minigames`});}
// cheat-device cards (one per code file; most share a filename so each gets its own card)
const CH=[
 ['arcdx','arcdx1.VMI','CHEATARCDX01','Action Replay CDX code save (many codes loaded)'],['arcdx','AR423.VMI','CHEATARCDX02','Action Replay CDX code save: 423 games, all regions'],
 ['gscdx','gscdx1.VMI','CHEATGSCDX01','GameShark CDX code save'],['gscdx','GSCDX.vmi','CHEATGSCDX02','GameShark CDX code save'],
 ['xploder','XPLODER.VMI','CHEATXPLODER30','Code Breaker / Xploder DC code save (30 games)'],
 ['pso','psocodes.VMI','CHEATPSOGS','GameShark CDX codes for Phantasy Star Online (JP & US)'],['pso2','v45276.vmi','CHEATPSO2XP','Xploder codes for Phantasy Star Online Ver. 2'],['pso2','FCDCHEAT.VMI','CHEATPSO2GS','GameShark codes for Phantasy Star Online Ver. 2'],
 ['soldierfortune','v64385.vmi','CHEATSOFGS','GameShark codes for Soldier of Fortune (unlimited armor/ammo)'],
];
for(const [dir,f,id,t] of CH)out.push({dir,outdir:'Dreamcast',title:'Cheat-device code save: '+t,rname:'(cheat device data, not a disc)',ids:[id],region:'-',files:[f],completion:t,status:'needs review',notes:'Only useful with the matching cheat device disc; not tested'});
out.push({dir:'atari',title:'Atari Anniversary Edition (VMU icon only)',rname:'Atari Anniversary Edition (USA)',ids:['T-15130N'],region:'US',files:['ATARI.VMI'],completion:'VMU icon file only; archive has no game save',status:'needs review',notes:'Icon-only card; no game progress to save in this title'});
fs.writeFileSync(path.join(__dirname,'..','selections_extras.json'),JSON.stringify(out,null,1));
fs.writeFileSync(path.join(__dirname,'..','extras_attach.json'),JSON.stringify(ATTACH,null,1));
console.log(cards.length,'minigame cards,',CH.length,'cheat cards');
