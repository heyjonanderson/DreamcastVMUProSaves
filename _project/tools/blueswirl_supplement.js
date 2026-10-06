// PRIVATE supplement: builds cards from the Blue Swirl content of the VMU Tool disc. Output goes to ../_private/ and a zip in the repo root,
// both gitignored. Do not commit or publish the output (licence: must not be released without VMU Tool).
// Usage: node tools/blueswirl_supplement.js <disc.json (loader output)> <VMU_GAMES root> <outdir>
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const V=require('./vmu'),A=require('./archive'),{lookup}=require('./gameid_lookup');
const dat=require('../redump.json'),sel=require('../selections');
const disc=require(path.resolve(process.argv[2])),GAMES=process.argv[3],OUT=path.resolve(process.argv[4]);
fs.rmSync(OUT,{recursive:true,force:true});
const csv=rows=>rows.map(r=>r.map(c=>/[",\n]/.test(String(c))?'"'+String(c).replace(/"/g,'""')+'"':c).join(',')).join('\r\n')+'\r\n';
const idx=[['folder','kind','game','region','file_in_card','description (from disc)','disc path']];
const find=(game,base)=>{const m=disc.filter(x=>x.src==='BLUE_SWIRL'&&x.game===game&&x.base===base);if(m.length!==1)throw new Error(game+'/'+base);return m[0];};
const card=(folder,files)=>{const dir=path.join(OUT,'Dreamcast',folder);fs.mkdirSync(dir,{recursive:true});
  const img=V.build(files.map(f=>({name:f.vmi.name,data:f.data,type:(f.vmi.mode&2)?0xcc:0x33,protect:!!(f.vmi.mode&1),time:f.vmi.time})));
  const p=path.join(dir,folder+'-1.vmu');fs.writeFileSync(p,img);const back=V.parse(fs.readFileSync(p));
  if(back.errs.length||back.files.length!==files.length)throw new Error('validate '+folder+' '+back.errs.join(';'));};
const load=x=>({vmi:V.parseVmi(fs.readFileSync(x.vmi)),data:fs.readFileSync(x.vms)});
// A) better saves for existing games (same folder ID as the card in the public set: copy over it)
const UP=[['fightvip2','FIGHTING_VIPERS_2','SAVE0000','French uploader, "everything unlocked"'],['redlineracer','REDLINE_RACER','SAVE0000',''],
 ['sakura_card','SAKURA_CARD_CAPTOR_TOMOYO_VIDEO','SAVE0000',''],['godzilla','GODZILLA_GENERATIONS','SAVE0000',''],['f1worldprix','F1_WORLD_GRAND_PRIX_II','SAVE0000','']];
for(const [dir,g,b,n] of UP){const s=sel.find(x=>x.dir===dir);if(!s)throw new Error(dir);const x=find(g,b);const f=load(x);
  for(const id of s.ids){const folder=id.replace(/[-\s]/g,'');card(folder,[f]);idx.push([folder,'REPLACES existing card',s.title,s.region,x.fname,x.desc,`VMU_SAVES/BLUE_SWIRL/${g}/${b}`]);}}
// B) new games (names are exact Redump names)
const NEW=[['Aqua GT','AQUA_GT',['SAVE0000'],'Aqua GT (Europe) (En,Fr,De)','EU','ready'],['Capcom vs. SNK Millennium Fight 2000 Pro','CAPCOM_VS_SNK_PRO',['SAVE0000'],'Capcom vs. SNK - Millennium Fight 2000 Pro (Japan)','JP','ready'],
 ['Dance Dance Revolution 2nd Mix','DANCE_DANCE_REVOLUTION_2ND_MIX',['SAVE0000'],'Dance Dance Revolution 2nd Mix - Dreamcast Edition (Japan)','JP','ready'],['Gunspike','GUNSPIKE',['SAVE0000'],'Gunspike (Japan)','JP','ready'],
 ['Nanatsu no Hikan (Seven Mansions)','SEVEN_MANSIONS',['SAVE0000'],'Nanatsu no Hikan - Senritsu no Bishou (Japan)','JP','ready'],['Snow Surfers','SNOW_SURFERS',['SAVE0000'],'Snow Surfers (Europe)','EU','ready'],
 ['Tokyo Highway Challenge 2','TOKYO_HIGHWAY_CHALLENGE_2',['SAVE0000'],'Tokyo Highway Challenge 2 (Europe)','EU','ready'],['Deadly Skies','DEADLY_SKIES',['SAVE0000'],'Deadly Skies (Europe) (En,Fr,De,Es,It)','EU','needs review'],
 ['Dragons Blood','DRAGONS_BLOOD',['SAVE0000'],'Dragons Blood (Europe) (En,Fr,De)','EU','ready'],['Rune Caster','RUNECAST',['SAVE0000','SAVE0001','SAVE0002'],'Rune Caster (Japan)','JP','needs review'],
 ['Puyo Puyo Da!','PUYO_PUYO_DA',['SAVE0000'],'Puyo Puyo Da! Featuring Ellena System (Japan)','JP','needs review'],['Vampire Chronicle','VAMPIRE_CHRONICLE',['SAVE0000'],'Vampire Chronicle for Matching Service (Japan)','JP','needs review']];
for(const [title,g,bases,rname,reg,st] of NEW){const e=dat.find(d=>d.name===rname);if(!e)throw new Error('redump '+rname);const pn=(lookup(e)||'').replace(/[-\s]/g,'');if(!pn)throw new Error('pn '+rname);
  const xs=bases.map(b=>find(g,b));card(pn,xs.map(load));for(const x of xs)idx.push([pn,'NEW game ('+st+')',title,reg,x.fname,x.desc,`VMU_SAVES/BLUE_SWIRL/${g}/${x.base}`]);}
// C) VMU minigames/animations from the disc's VMU_GAMES that are not already in the public minigame set (compare by VMS hash), one per card
const H=b=>crypto.createHash('md5').update(b).digest('hex');
const have=new Set();const mg=A.load('minigames');for(const r of mg.rows)have.add(H(fs.readFileSync(A.ci(mg.path,r.vms))));
const used=new Set();let nm=0,dup=0;
for(const cat of fs.readdirSync(GAMES)){const cd=path.join(GAMES,cat);if(!fs.statSync(cd).isDirectory())continue;
  for(const f of fs.readdirSync(cd).filter(f=>/\.VMS$/i.test(f)).sort()){const base=f.replace(/\.VMS$/i,'');const vms=path.join(cd,f);const vmi=path.join(cd,base+'.VMI');if(!fs.existsSync(vmi))continue;
    const data=fs.readFileSync(vms);if(have.has(H(data))){dup++;continue;}have.add(H(data));
    const pv=V.parseVmi(fs.readFileSync(vmi));const t=(data.subarray(0x210,0x230).toString('latin1').replace(/[^\x20-\x7e]/g,'').trim()||data.subarray(0x200,0x210).toString('latin1').replace(/[^\x20-\x7e]/g,'').trim()||base);
    let slug=t.replace(/www\.\S+|by .*$/i,'').replace(/[^A-Za-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,22)||base;if(slug.length<5||/^(http|written|ooooo|vmufan)/i.test(slug))slug='Game_'+cat.slice(0,5)+'_'+base.slice(-4);if(/^DC_Animation/.test(slug))slug='DCAnim_'+cat.slice(0,5)+'_'+base.slice(-4);let id='MG_'+slug,k=2;while(used.has(id.toLowerCase())){id='MG_'+slug.slice(0,14)+'_'+cat.slice(0,4)+'_'+base.slice(-4);if(used.has(id.toLowerCase()))id=id+'_'+k++;}used.add(id.toLowerCase());
    card(id,[{vmi:pv,data}]);idx.push([id,'minigame ('+cat+')','VMU minigame: '+t,'-',pv.name,`${t} (${data.length} bytes)`,`VMU_GAMES/${cat}/${base}`]);nm++;}}
fs.writeFileSync(path.join(OUT,'INDEX.csv'),csv(idx));
fs.writeFileSync(path.join(OUT,'README.txt'),`Blue Swirl supplement (PRIVATE, for personal use)
================================================
Built from the Blue Swirl collection on the VMU Tool "Dream Explorer" disc (v0.8.5, by Speud). The disc README says Blue Swirl's
collection and games "must not be released without VMU Tool", so this zip is NOT in the public repository. Please do not publish it.

Contents (all cards are Dreamcast/<ID>/<ID>-1.vmu; copy the Dreamcast folder to the root of the VMU Pro SD card):
 - ${UP.length} cards that REPLACE a card of the same folder name from the main set with a better save
 - ${NEW.length} new games not in the main set
 - ${nm} VMU minigames/animations (MG_*) not already in the main set (one game per card), ${dup} duplicates of the main set skipped
INDEX.csv lists every card with its game, disc path and the uploader's description.
Not tested on hardware. Source collections: Blue Swirl (c) 2006, http://blueswirl.shorturl.com; Rockin'-B games from rockin-b.de.
`);
console.log('upgrades',UP.length,'new',NEW.length,'minigames',nm,'dups skipped',dup);
