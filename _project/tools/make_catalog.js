// Builds the browsable catalog: INDEX.md (linked, A-Z) and docs/index.html (search, filters, per-card download, build-your-own SD zip).
// Run after build.js, from _project:  node tools/make_catalog.js
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
const USER='heyjonanderson/DreamcastVMUProSaves',BR='main';
function parse(t){const rows=[];let r=[],c='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=false}else c+=ch}else if(ch=='"')q=true;else if(ch==',')r.push(c),c='';else if(ch=='\n'){r.push(c.replace(/\r$/,''));rows.push(r);r=[];c=''}else c+=ch}return rows}
const idx=parse(fs.readFileSync(path.join(ROOT,'INDEX.csv'),'utf8')).slice(1).filter(r=>r.length>5);
const rep=parse(fs.readFileSync(path.join(__dirname,'..','report.csv'),'utf8')).slice(1).filter(r=>r.length>9);
const why={};for(const r of rep)why[r[1]+'|'+r[0]]=r[9].split(' | card:')[0];
// by-title folder name per card (same rule as build.js)
const bt=[];const walk=(d,p)=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){if(e.isDirectory())walk(path.join(d,e.name),p+e.name+'/');else if(/\.vmu$/.test(e.name))bt.push(p+e.name);}};
walk(path.join(ROOT,'by-title'),'');
const byFile={};for(const f of bt)byFile[path.basename(f)]=(byFile[path.basename(f)]||[]).concat(path.dirname(f));
const items=idx.map(r=>{const [folder,game,region,status,redump,dir,save]=r;
  const type=/^ZZ_MG_/.test(folder)?'minigame':/^ZZ_CHEAT/.test(folder)?'cheat':'game';
  const dirs=(byFile[folder+'-1.vmu']||[]);const gdir=dirs.find(d=>d.toLowerCase().includes(game.toLowerCase().replace(/[<>:"\/\\|?*]/g,' -').slice(0,12)))||dirs[0]||'';
  return {id:folder,t:game,r:region==='-'?'':region,s:status==='ready'?'ready':'review',k:type,w:(status==='ready'?'':(why[folder+'|'+game]||'')).slice(0,220),bt:gdir};});
items.sort((a,b)=>a.t.localeCompare(b.t,'en',{sensitivity:'base'})||a.id.localeCompare(b.id));
const enc=p=>p.split('/').map(encodeURIComponent).join('/');
const raw=id=>`https://github.com/${USER}/raw/${BR}/vmupro/Dreamcast/${id}/${id}-1.vmu`;
// ---- INDEX.md
const L=['# Card index','','Find a game, open its folder or download the single card. **Folder names are disc IDs** (that is how the VMU Pro finds the card).',
 `Prefer search and a build-your-own SD zip? Use the catalog page: **[docs/index.html](docs/index.html)** (open it from a download, or enable GitHub Pages on \`/docs\`).`,'',
 '| Legend | |','|---|---|','| ✅ | save judged complete or best available |','| ⚠️ | needs review (reason in `_project/report.csv` and [STEP3_REPORT.md](STEP3_REPORT.md)) |','',
 `${items.filter(i=>i.k==='game').length} games · ${items.filter(i=>i.k==='minigame').length} VMU minigames · ${items.filter(i=>i.k==='cheat').length} cheat-device cards`,''];
const games=items.filter(i=>i.k==='game'),letters=[...new Set(games.map(i=>/^[A-Za-z]/.test(i.t)?i.t[0].toUpperCase():'#'))];
L.push('**Jump to:** '+letters.map(l=>`[${l}](#${l==='#'?'num':l.toLowerCase()})`).join(' · ')+' · [Minigames](#minigames) · [Cheat cards](#cheat)','');
const row=i=>`| ${i.t.replace(/\|/g,'/')} | [${i.id}](vmupro/Dreamcast/${i.id}) | ${i.r} | ${i.s==='ready'?'✅':'⚠️'} | [card](${raw(i.id)}) | ${i.bt?`[by title](by-title/${enc(i.bt)})`:''} |`;
const head=['| Game | Folder | Region | | Download | Browse |','|---|---|---|---|---|---|'];
for(const l of letters){L.push(`<a id="${l==='#'?'num':l.toLowerCase()}"></a>`,`### ${l}`,'',...head,...games.filter(i=>(/^[A-Za-z]/.test(i.t)?i.t[0].toUpperCase():'#')===l).map(row),'');}
L.push('<a id="minigames"></a>','### Minigames (VMU games; one per card, listed last on the VMU Pro)','',...head,...items.filter(i=>i.k==='minigame').map(row),'');
L.push('<a id="cheat"></a>','### Cheat-device code cards','',...head,...items.filter(i=>i.k==='cheat').map(row),'');
fs.writeFileSync(path.join(ROOT,'INDEX.md'),L.join('\n'));
// ---- docs/index.html
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dreamcast VMU Pro saves catalog</title>
<style>:root{--bg:#fff;--fg:#1b1f24;--mut:#59636e;--line:#d1d9e0;--acc:#0969da;--ok:#1a7f37;--warn:#9a6700;--card:#f6f8fa}
@media(prefers-color-scheme:dark){:root{--bg:#0d1117;--fg:#e6edf3;--mut:#8d96a0;--line:#30363d;--acc:#4493f8;--ok:#3fb950;--warn:#d29922;--card:#161b22}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,sans-serif}main{max-width:1000px;margin:0 auto;padding:16px}
h1{font-size:1.4rem;margin:.2rem 0}p{color:var(--mut);margin:.3rem 0}.bar{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0;position:sticky;top:0;background:var(--bg);padding:8px 0;z-index:2}
input,select,button{font:inherit;padding:7px 10px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--fg)}input[type=search]{flex:1;min-width:180px}button{cursor:pointer}button.p{background:var(--acc);border-color:var(--acc);color:#fff}
table{width:100%;border-collapse:collapse}th,td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{font-size:.8rem;color:var(--mut)}tr:hover td{background:var(--card)}
.ok{color:var(--ok)}.wn{color:var(--warn)}code{background:var(--card);padding:1px 5px;border-radius:4px}a{color:var(--acc)}.sm{font-size:.82rem;color:var(--mut)}
@media(max-width:640px){.hm{display:none}}</style></head><body><main>
<h1>Dreamcast VMU Pro saves</h1>
<p>${items.filter(i=>i.k==='game').length} games, ${items.filter(i=>i.k==='minigame').length} VMU minigames, ${items.filter(i=>i.k==='cheat').length} cheat cards. Tick the games you own, then build an SD-card zip with the right folder layout.
Folder names are disc IDs. <a href="https://github.com/${USER}#readme">README</a> · <a href="https://github.com/${USER}/blob/${BR}/TESTING.md">testing</a> · <span class="sm">not hardware-tested for every game</span></p>
<div class="bar"><input id="q" type="search" placeholder="Search title or ID…"><select id="r"><option value="">All regions</option><option>US</option><option>EU</option><option>JP</option></select>
<select id="k"><option value="game">Games</option><option value="minigame">Minigames</option><option value="cheat">Cheat cards</option><option value="">Everything</option></select>
<select id="s"><option value="">Any status</option><option value="ready">✅ ready</option><option value="review">⚠️ needs review</option></select></div>
<div class="bar" style="position:static"><button id="all">Select visible</button><button id="none">Clear</button><button id="zip" class="p">Build SD zip (<span id="n">0</span>)</button><span id="msg" class="sm"></span></div>
<table><thead><tr><th></th><th>Game</th><th class="hm">Folder</th><th>Region</th><th></th><th>Card</th></tr></thead><tbody id="t"></tbody></table>
<p class="sm" id="cnt"></p></main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script>const D=${JSON.stringify(items)};const U='${USER}',B='${BR}';const sel=new Set();
const $=id=>document.getElementById(id);const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function vis(){const q=$('q').value.toLowerCase(),r=$('r').value,k=$('k').value,s=$('s').value;return D.filter(i=>(!q||i.t.toLowerCase().includes(q)||i.id.toLowerCase().includes(q))&&(!r||i.r===r)&&(!k||i.k===k)&&(!s||i.s===s));}
function render(){const v=vis();$('t').innerHTML=v.map(i=>'<tr><td><input type="checkbox" data-id="'+i.id+'"'+(sel.has(i.id)?' checked':'')+'></td><td>'+esc(i.t)+(i.w?'<div class="sm wn">'+esc(i.w)+'</div>':'')+'</td><td class="hm"><code>'+i.id+'</code></td><td>'+i.r+'</td><td class="'+(i.s==='ready'?'ok':'wn')+'">'+(i.s==='ready'?'✅':'⚠️')+'</td><td><a href="https://github.com/'+U+'/raw/'+B+'/vmupro/Dreamcast/'+i.id+'/'+i.id+'-1.vmu">download</a>'+(i.bt?' · <a href="https://github.com/'+U+'/tree/'+B+'/by-title/'+i.bt.split('/').map(encodeURIComponent).join('/')+'">files</a>':'')+'</td></tr>').join('');$('cnt').textContent=v.length+' shown';$('n').textContent=sel.size;}
document.addEventListener('change',e=>{if(e.target.dataset&&e.target.dataset.id){e.target.checked?sel.add(e.target.dataset.id):sel.delete(e.target.dataset.id);$('n').textContent=sel.size;}});
['q','r','k','s'].forEach(x=>$(x).addEventListener('input',render));
$('all').onclick=()=>{vis().forEach(i=>sel.add(i.id));render()};$('none').onclick=()=>{sel.clear();render()};
$('zip').onclick=async()=>{if(!sel.size){$('msg').textContent='Tick some games first.';return}const z=new JSZip();let n=0;
 for(const id of sel){$('msg').textContent='Fetching '+(++n)+' of '+sel.size+'…';try{const r=await fetch('https://raw.githubusercontent.com/'+U+'/'+B+'/vmupro/Dreamcast/'+id+'/'+id+'-1.vmu');if(!r.ok)throw 0;z.file('Dreamcast/'+id+'/'+id+'-1.vmu',await r.arrayBuffer());}catch(e){$('msg').textContent='Failed on '+id;return}}
 const b=await z.generateAsync({type:'blob'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='VMUPro-SD-card-custom.zip';a.click();$('msg').textContent='Done. Extract to the root of the SD card.';};
render();</script></body></html>`;
fs.mkdirSync(path.join(ROOT,'docs'),{recursive:true});fs.writeFileSync(path.join(ROOT,'docs','index.html'),html);
console.log(items.length,'catalog entries; INDEX.md',L.join('\n').length,'bytes; docs/index.html',html.length,'bytes');
