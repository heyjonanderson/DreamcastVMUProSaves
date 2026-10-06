# Status report

Game cards: 401 (.vmu, 131072 bytes each) for 371 games, plus 0 extras cards (minigames, cheat-device codes) as folders named MINIGAMESnn / CHEAT* beside the game folders.
Every card parses back cleanly (checked by tools/vmu.js and by an independent Python checker written from the VMS format notes: directory, FAT chains, save data). **No card has been opened in EVMU or on VMU Pro hardware.**

- ready: 339 games (heuristic or manual pick judged complete/best available, filename/region check passed)
- needs review: 32 games (listed below)
- failed to build: 0
- extras cards: 0 (cheat-device cards are marked needs review because they only work with the matching cheat disc)
- no card: see _project/unmapped_or_skipped.csv; extras not on a card: _project/not_on_cards_extras.csv
- Folder -> game names: INDEX.md / INDEX.csv

## Needs review (reason)

| Game | Folder(s) | Region | Why |
|---|---|---|---|
| Capcom vs. SNK: Millennium Fight 2000 | t1218n | US | US filename VS.SNKMF_SYS inferred from archive description ("for the American release") vs JP CAPVSSNK_SYS; not hardware-verified. Alt 100% saves: v90895, v27880 / extras on card: v56329.vmi |
| Street Fighter Alpha 3 | t1203n | US | SYS (SFALPHA3.SYS) and WTR (SFALPHA3.WTR) files on one card. Neither is region-labelled / extras on card: v20786.vmi |
| Garou: Mark of the Wolves | t3108m, t47302m | JP | JP-only. Two serials in Redump; card duplicated under both. Partial save (alt ID T-47302M) |
| Fighting Vipers 2 | mk5115450 | EU | No US release; EU ID used. Archive save region unlabelled |
| Ultimate Fighting Championship | t40204n | US | SYS and EDT from different creators combined on one card; compatibility not verified |
| Virtual-On: Oratorio Tangram | t13004n | US | Save region unlabelled; unsure US filename matches / extras on card: v39368.vmi,v8748.vmi |
| Kidou Senshi Gundam: Renpou vs. Zeon & DX | t13306m | JP | JP-only, 2 discs share serial T-13306M. Partial save, creator unnamed |
| Aero Dancing | t6807m | JP | Redump mapping inferred from filename/title, not confirmed |
| Aero Dancing Fan Disc | t6809m | JP | Redump mapping inferred from filename/title, not confirmed |
| ESPN NBA 2 Night | t9503n | US | Only save: early in a season, not a completed state |
| F1 World Grand Prix | 51030 | US | Mid-championship save; no completed save in archive |
| Fighting Force 2 | t36801n | US | Level 8 save; archive has no completed save; also released: other/EU |
| Gunbird 2 | t1214n | US | Only save; description gives no unlock info; also released: JP/EU |
| Jet Set Radio DX | hdr0128, hdr0186 | JP | Redump mapping inferred from filename/title, not confirmed (alt ID HDR-0186) |
| Phantasy Star Online | 51100 | US | Archive has only official download quest files (no character save); US-labelled quests plus as many others as fit; JP-labelled download saves skipped; also released: EU/JP / extras on card: LETTER1.VMI,RAREMAT1.VMI,RAREMAT2.VMI / extras not fitted (card full or name clash): LETTER2.VMI (PSO______017),RETIRED1.VMI (PSO______028),RETIRED2.VMI (PSO______029),SOULV2_1.VMI (PSO______030),SOULV2_2.VMI (PSO______031),FIRE1.VMI (PSO______024),FIRE2.VMI (PSO______025),EASTER1.VMI (PSO______010),EASTER2.VMI (PSO______011),EASTER3.VMI (PSO______012) |
| Princess Holiday | t47105m, t47106m | JP | Only save; description gives no progress info (alt ID T-47106M) |
| Redline Racer | t15002m | JP | Only save: first set of racers only |
| Roadsters | t22901n | US | Starts at season two; archive has no completed save; also released: EU |
| Sakura Card Captor: Tomoyo Video | hdr0115, hdr0132 | JP | Only save: second stage (alt ID HDR-0132) |
| Sakura Wars Columns | hdr0046 | JP | Only save; description gives no progress info |
| Seirei Hata Ray Blade | t42201m | JP | Only stage 1 saves in archive |
| Sonic Shuffle | 51060 | US | archive has 2 filename variants (SSHUFFLE/SONICSHU); region of chosen save not confirmed; also released: JP/EU |
| Xtreme Sports | t15126n | US | archive has 2 filename variants |
| Cheat-device code save: Action Replay CDX code save (many codes loaded) | cheatarcdx01 | - | Only useful with the matching cheat device disc; not tested |
| Cheat-device code save: Action Replay CDX code save: 423 games, all regions | cheatarcdx02 | - | Only useful with the matching cheat device disc; not tested |
| Cheat-device code save: GameShark CDX code save | cheatgscdx01, cheatgscdx02 | - | Only useful with the matching cheat device disc; not tested |
| Cheat-device code save: Code Breaker / Xploder DC code save (30 games) | cheatxploder30 | - | Only useful with the matching cheat device disc; not tested |
| Cheat-device code save: GameShark CDX codes for Phantasy Star Online (JP & US) | cheatpsogs | - | Only useful with the matching cheat device disc; not tested |
| Cheat-device code save: Xploder codes for Phantasy Star Online Ver. 2 | cheatpso2xp | - | Only useful with the matching cheat device disc; not tested |
| Cheat-device code save: GameShark codes for Phantasy Star Online Ver. 2 | cheatpso2gs | - | Only useful with the matching cheat device disc; not tested |
| Cheat-device code save: GameShark codes for Soldier of Fortune (unlimited armor/ammo) | cheatsofgs | - | Only useful with the matching cheat device disc; not tested |
| Atari Anniversary Edition (VMU icon only) | t15130n | US | Icon-only card; no game progress to save in this title |
