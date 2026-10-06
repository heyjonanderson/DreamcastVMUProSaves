# Status report

Game cards: 374 (.vmu, 131072 bytes each) for 366 games, plus 145 extras cards (minigames, cheat-device codes) as folders named MINIGAMESnn / CHEAT* beside the game folders.
Every card parses back cleanly (checked by tools/vmu.js and by an independent Python checker written from the VMS format notes: directory, FAT chains, save data). **No card has been opened in EVMU or on VMU Pro hardware.**

- ready: 343 games (heuristic or manual pick judged complete/best available, filename/region check passed)
- needs review: 23 games (listed below)
- failed to build: 0
- extras cards: 145 (cheat-device cards are marked needs review because they only work with the matching cheat disc)
- no card: see _project/unmapped_or_skipped.csv; extras not on a card: _project/not_on_cards_extras.csv
- Folder -> game names: INDEX.md / INDEX.csv

## Needs review (reason)

| Game | Folder(s) | Region | Why |
|---|---|---|---|
| Garou: Mark of the Wolves | T3108M | JP | JP-only. Two serials in Redump; card duplicated under both. Partial save |
| Virtual-On: Oratorio Tangram | T13004N | US | Save region unlabelled; unsure US filename matches / extras on card: v39368.vmi,v8748.vmi |
| Kidou Senshi Gundam: Renpou vs. Zeon & DX | T13306M | JP | JP-only, 2 discs share serial T-13306M. Partial save, creator unnamed |
| Aero Dancing | T6807M | JP | Redump mapping inferred from filename/title, not confirmed |
| Aero Dancing Fan Disc | T6809M | JP | Redump mapping inferred from filename/title, not confirmed |
| ESPN NBA 2 Night | T9505N | US | Only save: early in a season, not a completed state |
| F1 World Grand Prix | T3001N | US | F1WGP4DC_ = F1 World Grand Prix (US). F1WGP4DC2 saves belong to F1 World Grand Prix II (JP/EU), which was wrongly used before; this US save is mid-season, no completed US save in archive |
| Fighting Force 2 | 36801N, T36801N | US | Level 8 save; archive has no completed save; also released: other/EU (alt ID T36801N) |
| Gunbird 2 | T1214N | US | Only save; description gives no unlock info; also released: JP/EU |
| Jet Set Radio DX | HDR0128 | JP | Redump mapping inferred from filename/title, not confirmed |
| Phantasy Star Online | MK51100 | US | Archive has only official download quest files (no character save); US-labelled quests plus as many others as fit; JP-labelled download saves skipped; also released: EU/JP / extras on card: LETTER1.VMI,RAREMAT1.VMI,RAREMAT2.VMI / extras not fitted (card full or name clash): LETTER2.VMI (PSO______017),RETIRED1.VMI (PSO______028),RETIRED2.VMI (PSO______029),SOULV2_1.VMI (PSO______030),SOULV2_2.VMI (PSO______031),FIRE1.VMI (PSO______024),FIRE2.VMI (PSO______025),EASTER1.VMI (PSO______010),EASTER2.VMI (PSO______011),EASTER3.VMI (PSO______012) |
| Princess Holiday | T47106M | JP | Only save; description gives no progress info |
| Roadsters | T22901N | US | Starts at season two; archive has no completed save; also released: EU |
| Sakura Wars Columns | HDR0046 | JP | Only save; description gives no progress info |
| Seirei Hata Ray Blade | T42201M | JP | Only stage 1 saves in archive |
| Sonic Shuffle | MK51060 | US | archive has 2 filename variants (SSHUFFLE/SONICSHU); region of chosen save not confirmed; also released: JP/EU |
| Seaman | MK51048 | US | PURHAZE saves have no description; USR and _VM files taken together. From the VMU Tool Dream Explorer disc (PURHAZE) |
| D+Vine [Luv] | T46501M | JP | JEFFMA save has no description. From the VMU Tool Dream Explorer disc (JEFFMA) |
| Deadly Skies | T9501N50 | EU | 19 missions cleared; no completed save. From the Blue Swirl collection on the VMU Tool Dream Explorer disc |
| Rune Caster | T40001M | JP | Three-file save set (SYS, DAT, CP2); no clear description. From the Blue Swirl collection on the VMU Tool Dream Explorer disc |
| Puyo Puyo Da! | T6601M | JP | No description. From the Blue Swirl collection on the VMU Tool Dream Explorer disc |
| Vampire Chronicle | T1235M | JP | No description. From the Blue Swirl collection on the VMU Tool Dream Explorer disc |
| Atari Anniversary Edition (VMU icon only) | T15130N | US | Icon-only card; no game progress to save in this title |
