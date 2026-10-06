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
  const type=/^zz_MG_/.test(folder)?'minigame':/^zz_CHEAT/.test(folder)?'cheat':'game';
  const dirs=(byFile[folder+'-1.vmu']||[]);const gdir=dirs.find(d=>d.toLowerCase().includes(game.toLowerCase().replace(/[<>:"\/\\|?*]/g,' -').slice(0,12)))||dirs[0]||'';
  return {id:folder,t:game,r:region==='-'?'':region,s:status==='ready'?'ready':'review',k:type,w:(status==='ready'?'':(why[folder+'|'+game]||'')).slice(0,220),bt:gdir};});
// VM2 folder = disc-header Product Number exactly as printed (dash kept, e.g. MK-51054); the VMU Pro strips dashes.
// Confirmed on a VM2: T1201N, T1212N (no dash in header) load; MK-51054 / MK-51186 are what the VM2 creates itself.
// The "xxxxx 00" headers (Armada, Hoyle Casino, Wild Metal) are unconfirmed, so both spellings are offered.
const G=require('../gameid.json');const nrm=x=>x.replace(/ 00$/,'').replace(/[-\s]/g,'');
const rawBy={};for(const g of G){if(g.p)(rawBy[nrm(g.p)]??=new Set()).add(g.p);}
for(const i of items){if(i.k!=='game')continue;const s=rawBy[i.id];const n=new Set(s&&s.size===1?s:[i.id]);for(const x of [...n])if(/ 00$/.test(x))n.add(x.replace(/ 00$/,'00'));i.v2=[...n];}
items.sort((a,b)=>a.t.localeCompare(b.t,'en',{sensitivity:'base'})||a.id.localeCompare(b.id));
const enc=p=>p.split('/').map(encodeURIComponent).join('/');
const raw=id=>`https://github.com/${USER}/raw/${BR}/vmupro/Dreamcast/${id}/${id}-1.vmu`;
// ---- INDEX.md
const L=['# Card index','','Find a game, open its folder or download the single card. **Folder names are disc IDs** (that is how the VMU Pro finds the card).',
 `Prefer search and a build-your-own SD zip? Use the catalog website: **https://heyjonanderson.github.io/DreamcastVMUProSaves/**`,'',
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
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,sans-serif}main{max-width:1400px;margin:0 auto;padding:16px}
h1{font-size:1.5rem;margin:.2rem 0 .4rem}h2{font-size:1.05rem;margin:0 0 .6rem}p{color:var(--mut);margin:.5rem 0}.lead{font-size:1.05rem;color:var(--fg);margin:.4rem 0 1rem}.help{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:14px 18px;margin:0 0 6px}.help ol{margin:0;padding-left:1.3rem}.help li{margin:0 0 .85rem;line-height:1.55}.help li:last-child{margin-bottom:.3rem}.help p{margin:.9rem 0 0;line-height:1.55}.stick{position:sticky;top:0;z-index:3;background:var(--bg);padding:10px 0 8px;border-bottom:1px solid var(--line);margin:12px 0 4px}.bar{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 8px}.bar:last-child{margin-bottom:0}.lead,.help{max-width:900px}
input,select,button{font:inherit;padding:7px 10px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--fg)}input[type=search]{flex:1;min-width:180px}button{cursor:pointer}button.p{background:var(--acc);border-color:var(--acc);color:#fff}
table{width:100%;border-collapse:collapse}th,td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{font-size:.8rem;color:var(--mut)}tr:hover td{background:var(--card)}
.ok{color:var(--ok)}.wn{color:var(--warn)}code{background:var(--card);padding:1px 5px;border-radius:4px}a{color:var(--acc)}.sm{font-size:.82rem;color:var(--mut)}
td:last-child{white-space:nowrap}.tw{overflow-x:auto}@media(max-width:640px){.hm{display:none}td:last-child{white-space:normal}}</style></head><body><main>
<h1>Dreamcast VMU Pro saves</h1>
<p class="lead">Save files for your Dreamcast games, ready to drop onto a VMU Pro. Pick the games you own and download them as one zip.</p>
<section class="help"><h2>How to use this</h2>
<ol>
<li><b>Find your games.</b> Search by title, or filter by region. Tick the box next to each game you own, or press <i>Select visible</i> to tick everything in the current list.</li>
<li><b>Download.</b> Press <i>Build SD zip</i>. Your browser builds a zip of the games you ticked. This takes a few seconds and needs an internet connection.</li>
<li><b>Unzip it.</b> Extract the zip. Inside is a folder called <code>Dreamcast</code>.</li>
<li><b>Copy to the SD card.</b> Put the <code>Dreamcast</code> folder in the top level of the VMU Pro's microSD card, so you end up with paths like <code>Dreamcast/T1201N/T1201N-1.vmu</code>. If the card already has a <code>Dreamcast</code> folder, merge them. Back up your own saves first, because a folder with the same name will be overwritten.</li>
<li><b>Play.</b> Put the card back in the VMU Pro and start a game. When the folder name matches the disc, the VMU Pro loads that save automatically. You can also browse every card in the VMU Browser. Minigames and cheat cards are named <code>zz_</code> so they sit at the end of the list.</li>
</ol>
<p class="sm"><b>Using a VM2?</b> Switch the box next to the build button to <i>For VM2</i> first. The zip then holds one folder per game, named with the disc ID as printed on the disc (for example <code>MK-51054</code>), each with a <code>GAME.VMU</code> inside. Copy those folders straight to the top level of the VM2 SD card, with no <code>Dreamcast</code> folder. VM2 zips cover games only, not minigames or cheat cards yet.</p>
<p class="sm">Folder names are disc IDs (that is how the VMU Pro finds the right card), so the zip looks cryptic but is correct. Games marked ⚠️ have a weaker or unconfirmed save; the note under the title says why. Not every game has been tested on a real device. Full details are in the <a href="https://github.com/${USER}#readme">README</a>.</p></section>
<div class="stick"><div class="bar"><input id="q" type="search" placeholder="Search title or ID…"><select id="r"><option value="">All regions</option><option>US</option><option>EU</option><option>JP</option></select>
<select id="k"><option value="game">Games</option><option value="minigame">Minigames</option><option value="cheat">Cheat cards</option><option value="">Everything</option></select>
<select id="s"><option value="">Any status</option><option value="ready">✅ ready</option><option value="review">⚠️ needs review</option></select></div>
<div class="bar"><button id="all">Select visible</button><button id="none">Clear</button><select id="dev"><option value="pro">For VMU Pro</option><option value="vm2">For VM2</option></select><button id="zip" class="p">Build SD zip (<span id="n">0</span>)</button><span id="msg" class="sm"></span></div></div>
<div class="tw"><table><thead><tr><th></th><th>Game</th><th class="hm">Folder</th><th>Region</th><th></th><th>Card</th></tr></thead><tbody id="t"></tbody></table></div>
<p class="sm" id="cnt"></p><p class="sm">${items.filter(i=>i.k==='game').length} games, ${items.filter(i=>i.k==='minigame').length} VMU minigames and ${items.filter(i=>i.k==='cheat').length} cheat-device cards in total.</p></main>
<script>${fs.readFileSync(path.join(__dirname,"vendor","jszip.min.js"),"utf8")}</script>
<script>const D=${JSON.stringify(items)};const U='${USER}',B='${BR}';const sel=new Set();
const $=id=>document.getElementById(id);const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function vis(){const q=$('q').value.toLowerCase(),r=$('r').value,k=$('k').value,s=$('s').value;return D.filter(i=>(!q||i.t.toLowerCase().includes(q)||i.id.toLowerCase().includes(q))&&(!r||i.r===r)&&(!k||i.k===k)&&(!s||i.s===s));}
function render(){const v=vis();$('t').innerHTML=v.map(i=>'<tr><td><input type="checkbox" data-id="'+i.id+'"'+(sel.has(i.id)?' checked':'')+'></td><td>'+esc(i.t)+(i.w?'<div class="sm wn">'+esc(i.w)+'</div>':'')+'</td><td class="hm"><code>'+i.id+'</code></td><td>'+i.r+'</td><td class="'+(i.s==='ready'?'ok':'wn')+'">'+(i.s==='ready'?'✅':'⚠️')+'</td><td><a href="https://github.com/'+U+'/raw/'+B+'/vmupro/Dreamcast/'+i.id+'/'+i.id+'-1.vmu">download</a>'+(i.bt?' · <a href="https://github.com/'+U+'/tree/'+B+'/by-title/'+i.bt.split('/').map(encodeURIComponent).join('/')+'">files</a>':'')+'</td></tr>').join('');$('cnt').textContent=v.length+' shown';$('n').textContent=sel.size;}
document.addEventListener('change',e=>{if(e.target.dataset&&e.target.dataset.id){e.target.checked?sel.add(e.target.dataset.id):sel.delete(e.target.dataset.id);$('n').textContent=sel.size;}});
['q','r','k','s'].forEach(x=>$(x).addEventListener('input',render));
$('all').onclick=()=>{vis().forEach(i=>sel.add(i.id));render()};$('none').onclick=()=>{sel.clear();render()};
$('zip').onclick=async()=>{if(!sel.size){$('msg').textContent='Tick some games first.';return}const z=new JSZip();let n=0;
 const vm2=$('dev').value==='vm2',byId=Object.fromEntries(D.map(i=>[i.id,i]));let skipped=0;
 for(const id of sel){$('msg').textContent='Fetching '+(++n)+' of '+sel.size+'…';if(vm2&&!byId[id].v2){skipped++;continue}try{const r=await fetch('https://raw.githubusercontent.com/'+U+'/'+B+'/vmupro/Dreamcast/'+id+'/'+id+'-1.vmu');if(!r.ok)throw 0;const buf=await r.arrayBuffer();if(vm2)for(const f of byId[id].v2)z.file(f+'/GAME.VMU',buf);else z.file('Dreamcast/'+id+'/'+id+'-1.vmu',buf);}catch(e){$('msg').textContent='Failed on '+id;return}}
 const b=await z.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:9}});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=vm2?'VM2-SD-card-custom.zip':'VMUPro-SD-card-custom.zip';a.click();$('msg').textContent=vm2?'Done. Copy the folders to the root of the VM2 SD card.'+(skipped?' Minigames and cheat cards are not included for the VM2 yet.':''):'Done. Extract to the root of the SD card.';};
render();</script></body></html>`;
fs.mkdirSync(path.join(ROOT,'docs'),{recursive:true});fs.writeFileSync(path.join(ROOT,'docs','index.html'),html);
console.log(items.length,'catalog entries; INDEX.md',L.join('\n').length,'bytes; docs/index.html',html.length,'bytes');
