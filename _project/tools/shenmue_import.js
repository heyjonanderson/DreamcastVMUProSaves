// Shenmue Goodies Passport: a VMU viewer game (FILE0000, "needed to view the anims") plus 203 two-block character data files (V_SHENMUE###).
// Copies them from the disc's VMU_MISC/SHENMUE_PASSPORT into _project/extra/disc_bs_shenmue/ (archive table format). extras.js then builds
// three cards, each holding the viewer plus up to 75 characters (50 + 75*2 = 200 blocks).
// Usage: node tools/shenmue_import.js <VMU_MISC/SHENMUE_PASSPORT folder>
const fs=require('fs'),path=require('path');const V=require('./vmu');
const src=path.resolve(process.argv[2]),dir=path.join(__dirname,'..','extra','disc_bs_shenmue');
fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
const rows=[];
for(const f of fs.readdirSync(src).filter(x=>/\.VMS$/i.test(x)).sort()){const base=f.replace(/\.VMS$/i,'');const vmiP=path.join(src,base+'.VMI');if(!fs.existsSync(vmiP))continue;
  const v=V.parseVmi(fs.readFileSync(vmiP));const n='bs_shenmue_'+base.toLowerCase();
  fs.copyFileSync(vmiP,path.join(dir,n+'.vmi'));fs.copyFileSync(path.join(src,f),path.join(dir,n+'.VMS'));
  const desc=base==='FILE0000'?'Shenmue Goodies viewer (needed to view the character data)':v.description;
  rows.push(`| ![](x.gif) | \`${v.name}\` | [${n}.vmi](${n}.vmi) | [${n}.VMS](${n}.VMS) | ${desc} [source: Shenmue Goodies Passport, Blue Swirl collection on the VMU Tool disc; fan data from shenmue.planets.gamespy.com] |`);}
fs.writeFileSync(path.join(dir,'README.md'),`# disc_bs_shenmue\n\n| Icon | Filename | VMI | VMS | Description |\n|---|---|---|---|---|\n${rows.join('\n')}\n`);
console.log(rows.length,'files');
