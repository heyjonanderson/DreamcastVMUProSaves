# Status report

Game cards: 410 (.vmu, 131072 bytes each) for 404 games, plus 9 extras cards (minigames, cheat-device codes) as folders named MINIGAMESnn / CHEAT* beside the game folders.
Every card parses back cleanly (checked by tools/vmu.js and by an independent Python checker written from the VMS format notes: directory, FAT chains, save data). **No card has been opened in EVMU or on VMU Pro hardware.**

- ready: 380 games (heuristic or manual pick judged complete/best available, filename/region check passed)
- needs review: 24 games (listed below)
- failed to build: 0
- extras cards: 9 (cheat-device cards are marked needs review because they only work with the matching cheat disc)
- no card: see _project/unmapped_or_skipped.csv; extras not on a card: _project/not_on_cards_extras.csv
- Folder -> game names: INDEX.md / INDEX.csv

## Needs review (reason)

| Game | Folder(s) | Region | Why |
|---|---|---|---|
| Capcom vs. SNK: Millennium Fight 2000 | T1218N | US | US filename VS.SNKMF_SYS inferred from archive description ("for the American release") vs JP CAPVSSNK_SYS; not hardware-verified. Alt 100% saves: v90895, v27880 / extras on card: v56329.vmi |
| Street Fighter Alpha 3 | T1203N | US | SYS (SFALPHA3.SYS) and WTR (SFALPHA3.WTR) files on one card. Neither is region-labelled / extras on card: v20786.vmi |
| Garou: Mark of the Wolves | T3108M | JP | JP-only. Two serials in Redump; card duplicated under both. Partial save |
| Fighting Vipers 2 | MK5115450 | EU | No US release; EU ID used. Archive save region unlabelled |
| Ultimate Fighting Championship | T40204N | US | SYS and EDT from different creators combined on one card; compatibility not verified |
| Virtual-On: Oratorio Tangram | T13004N | US | Save region unlabelled; unsure US filename matches / extras on card: v39368.vmi,v8748.vmi |
| Kidou Senshi Gundam: Renpou vs. Zeon & DX | T13306M | JP | JP-only, 2 discs share serial T-13306M. Partial save, creator unnamed |
| Aero Dancing | T6807M | JP | Redump mapping inferred from filename/title, not confirmed |
| Aero Dancing Fan Disc | T6809M | JP | Redump mapping inferred from filename/title, not confirmed |
| ESPN NBA 2 Night | T9505N | US | Only save: early in a season, not a completed state |
| F1 World Grand Prix | T3001N | US | Mid-championship save; no completed save in archive |
| Fighting Force 2 | 36801N, T36801N | US | Level 8 save; archive has no completed save; also released: other/EU (alt ID T36801N) |
| Gunbird 2 | T1214N | US | Only save; description gives no unlock info; also released: JP/EU |
| Jet Set Radio DX | HDR0128 | JP | Redump mapping inferred from filename/title, not confirmed |
| Phantasy Star Online | MK51100 | US | Archive has only official download quest files (no character save); US-labelled quests plus as many others as fit; JP-labelled download saves skipped; also released: EU/JP / extras on card: LETTER1.VMI,RAREMAT1.VMI,RAREMAT2.VMI / extras not fitted (card full or name clash): LETTER2.VMI (PSO______017),RETIRED1.VMI (PSO______028),RETIRED2.VMI (PSO______029),SOULV2_1.VMI (PSO______030),SOULV2_2.VMI (PSO______031),FIRE1.VMI (PSO______024),FIRE2.VMI (PSO______025),EASTER1.VMI (PSO______010),EASTER2.VMI (PSO______011),EASTER3.VMI (PSO______012) |
| Princess Holiday | T47106M | JP | Only save; description gives no progress info |
| Redline Racer | T15002M | JP | Only save: first set of racers only |
| Roadsters | T22901N | US | Starts at season two; archive has no completed save; also released: EU |
| Sakura Card Captor: Tomoyo Video | HDR0115 | JP | Only save: second stage |
| Sakura Wars Columns | HDR0046 | JP | Only save; description gives no progress info |
| Seirei Hata Ray Blade | T42201M | JP | Only stage 1 saves in archive |
| Sonic Shuffle | MK51060 | US | archive has 2 filename variants (SSHUFFLE/SONICSHU); region of chosen save not confirmed; also released: JP/EU |
| Xtreme Sports | T15126N | US | archive has 2 filename variants |
| Atari Anniversary Edition (VMU icon only) | T15130N | US | Icon-only card; no game progress to save in this title |
