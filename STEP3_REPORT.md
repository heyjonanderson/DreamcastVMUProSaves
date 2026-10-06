# Step 3 report (plus overall status)

Cards: 365 (.vmu, 131072 bytes each) for 336 games. All parse back cleanly (directory, FAT, save data match the source). **None has been opened in EVMU or on hardware.**

- ready: 230 games
- needs review: 106 games
- failed to build: 0
- no card (no Redump ID / no usable save / non-game): see unmapped_or_skipped.csv
- VMU minigames / downloads / cheat-device files not built: see skipped_minigames_dlc.csv

## Needs review (reason)

| Game | Folder(s) | Region | Why |
|---|---|---|---|
| Capcom vs. SNK: Millennium Fight 2000 | T1218N | US | US filename VS.SNKMF_SYS inferred from archive description ("for the American release") vs JP CAPVSSNK_SYS; not hardware-verified. Alt 100% saves: v90895, v27880 |
| Street Fighter Alpha 3 | T1203N | US | SYS (SFALPHA3.SYS) and WTR (SFALPHA3.WTR) files on one card. Neither is region-labelled |
| Garou: Mark of the Wolves | T3108M, T47302M | JP | JP-only. Two serials in Redump; card duplicated under both. Partial save (alt ID T-47302M) |
| Fighting Vipers 2 | MK5115450 | EU | No US release; EU ID used. Archive save region unlabelled |
| Ultimate Fighting Championship | T40204N | US | SYS and EDT from different creators combined on one card; compatibility not verified |
| Virtual-On: Oratorio Tangram | T13004N | US | Save region unlabelled; unsure US filename matches |
| Kidou Senshi Gundam: Renpou vs. Zeon & DX | T13306M | JP | JP-only, 2 discs share serial T-13306M. Partial save, creator unnamed |
| Virtua Tennis | 51054 | US | In-VMS name VIRTUATENNIS (JP Power Smash saves use POWER_SMASH.); region of save not explicitly labelled, US/EU share name. Alts: v36332 (grand master, all clothing), v60789 (100%) |
| 4 Wheel Thunder | T9708N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| Aero Dancing | T6807M | JP | Redump mapping inferred from filename/title, not confirmed |
| Aero Dancing Fan Disc | T6809M | JP | Redump mapping inferred from filename/title, not confirmed |
| Armada | T40301N | US | description does not show a clearly complete save |
| Bangai-O | T40217N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| Bomberman Online | 51065 | US | description does not show a clearly complete save |
| Caesar's Palace 2000 | T12504N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| Championship Surfer | T41403N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| D2 | 51036 | US | archive has 3 filename variants |
| Dabitsuku 1 | HDR0084 | JP | description does not show a clearly complete save |
| Dabitsuku 2 | HDR0167 | JP | description does not show a clearly complete save |
| Deep Fighter | T17705N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU/other |
| Draconus: Cult of the Wyrm | T40203N | US | description does not show a clearly complete save |
| Dragon Riders: Chronicles of Pern | T17720N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| Dynamite Cop | 51013 | US | archive has 3 filename variants (D_COP_US/D_COP_PL/DDEKA2DC); region of chosen save not confirmed; also released: EU |
| Eldorado Gate 1 | T1223M | JP | description does not show a clearly complete save |
| Eldorado Gate 7 | T1229M | JP | description does not show a clearly complete save |
| ESPN International Track and Field | T9509N | US | archive has 2 filename variants (ITANDF_U/ITANDF_E); region of chosen save not confirmed; also released: EU |
| ESPN NBA 2 Night | T9503N | US | description does not show a clearly complete save |
| Evil Dead: Hail to the King | T10003N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: other/EU |
| Evolution 2: A Far Off Promise | T17711N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| Expendable | T15104N | US | description does not show a clearly complete save |
| F1 World Grand Prix | 51030 | US | description does not show a clearly complete save |
| Fighting Force 2 | T36801N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: other/EU |
| Fire Pro Wrestling D | T18804M | JP | description does not show a clearly complete save |
| Flag To Flag | 51007 | US | description does not show a clearly complete save |
| Frame Gride | T34201M | JP | description does not show a clearly complete save |
| Fushigi Dungeon | HDR0187 | JP | description does not show a clearly complete save |
| Gauntlet Legends | T9710N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| Godzilla Generations | HDR0004 | JP | description does not show a clearly complete save |
| Golf Shiyouyo | T44501M | JP | Redump mapping inferred from filename/title, not confirmed |
| Grandia 2 | T17716N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU/JP |
| Gunbird 2 | T1214N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: JP/EU |
| Gundam Battle Online | T13304M | JP | description does not show a clearly complete save |
| Gundam: Blood Of Zeon | T13305M | JP | description does not show a clearly complete save |
| Gundam Side Story 0079 | T13301N | US | archive has 3 filename variants (GUNDAM_U/GUNDAM_S/GUNDAM_P); region of chosen save not confirmed; also released: JP |
| House of the Dead 2 | 51002 | US | archive has 2 filename variants (HOD2DC_U/HOD2DC__); region of chosen save not confirmed; also released: EU/JP |
| Hoyle Casino | T11008N | US | description does not show a clearly complete save |
| Hundred Swords | HDR0124, HDR0127 | JP | description does not show a clearly complete save (alt ID HDR-0127) |
| Illbleed | T46001N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: JP/other |
| Jeremy McGrath Supercross 2000 | T8104N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| Jet Grind Radio | 51058, 51084 | US | archive has 2 filename variants (alt ID 51084) |
| Jet Set Radio DX | HDR0128, HDR0186 | JP | Redump mapping inferred from filename/title, not confirmed (alt ID HDR-0186) |
| Langrisser Millennium | T2501M | JP | description does not show a clearly complete save |
| Metropolis Street Racer | 51012 | US | archive has 2 filename variants (MSRSINGL/MSRGHOST); region of chosen save not confirmed; also released: EU |
| Monaco Grand Prix | T17701N | US | description does not show a clearly complete save |
| Namco Museum | T1403N | US | description does not show a clearly complete save |
| NBA Hoopz | T9709N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| NCAA College Football 2K2: Road to the Rose Bowl | 51176 | US | description does not show a clearly complete save |
| NFL Blitz 2000 | T9703N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| NFL Blitz 2001 | T9712N | US | description does not show a clearly complete save |
| Nightmare Creatures 2 | T9504N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| Omikron: The Nomad Soul | T36807N | US | description does not show a clearly complete save |
| Phantasy Star Online | 51100 | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU/JP |
| Princess Holiday | T47105M, T47106M | JP | description does not show a clearly complete save (alt ID T-47106M) |
| Puyo Puyo 4 | HDR0014 | JP | description does not show a clearly complete save |
| Rainbow Six | T40401N | US | archive has 7 filename variants (EW_LW_01/RAINBOW6/R6_LF_13/R6_FW_07); region of chosen save not confirmed; also released: other/EU |
| Redline Racer | T15002M | JP | description does not show a clearly complete save |
| Resident Evil 2 | T1205N | US | archive has 2 filename variants (RESEVIL2/BIOHAZRD); region of chosen save not confirmed; description does not show a clearly complete save; game also has settings/system file(s) (RESEVIL2.SYS) not included; also released: EU |
| Resident Evil 3: Nemesis | T1220N | US | archive has 2 filename variants (RESEVIL3/BIOHAZRD); region of chosen save not confirmed; also released: EU/other |
| Resident Evil: Code Veronica | T1204N | US | archive has 2 filename variants (RE_CV000/VERONICA); region of chosen save not confirmed; game also has settings/system file(s) (RE_CV000.SYS,VERONICA.SYS) not included; also released: EU/other |
| Roadsters | T22901N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| Roommate Novel | T19502M | JP | description does not show a clearly complete save |
| SaKaToKu 1 | HDR0126 | JP | description does not show a clearly complete save |
| SaKaToKu 2 | HDR0183 | JP | description does not show a clearly complete save |
| Sakura Card Captor: Tomoyo Video | HDR0115, HDR0132 | JP | description does not show a clearly complete save (alt ID HDR-0132) |
| Sakura Wars Columns | HDR0046 | JP | description does not show a clearly complete save |
| Samba de Amigo | 51092 | US | archive has 3 filename variants (SAMBAUS1/SAMBAV2K/SAMBADE1); region of chosen save not confirmed; also released: JP/EU |
| Sega Bass Fishing 2 | 51166 | US | description does not show a clearly complete save; archive has 2 filename variants |
| Sega Rally Championship 2 | 51019 | US | archive has 2 filename variants (SGRALLY2/SG_RALLY); region of chosen save not confirmed; also released: JP/EU |
| Sega Smash Pack Vol. 1 | 51146 | US | description does not show a clearly complete save; archive has 3 filename variants |
| Sega Sports NBA 2K | 51004 | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU/JP |
| Sega Sports NFL 2K | 51003 | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: JP |
| SeGaGaGa | HDR0083, HDR0151, HDR0171 | JP | description does not show a clearly complete save (alt ID HDR-0151,HDR-0171) |
| Seirei Hata Ray Blade | T42201M | JP | description does not show a clearly complete save |
| Seventh Cross Evolution | T41301N | US | VMI size field (44 blocks) disagrees with VMS size (172 blocks); card uses the VMS as-is, same in both archive saves |
| Silver | T15108N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; game also has settings/system file(s) (_SILVER_.SYS) not included; also released: other/EU |
| Skies of Arcadia | 51052 | US | archive has 3 filename variants (S.ARCADI/ARCADIA_/E.ARCADI); region of chosen save not confirmed; also released: EU |
| Slave Zero | T15106N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| Sno-Cross Championship Racing | T40207N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| Sonic Shuffle | 51060 | US | archive has 2 filename variants (SSHUFFLE/SONICSHU); region of chosen save not confirmed; also released: JP/EU |
| Sorcerian | T9102M, T9103M | JP | description does not show a clearly complete save (alt ID T-9103M) |
| Soul Fighter | T41401N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| Stupid Invaders | T17708N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; game also has settings/system file(s) (STUPIDIN_SET) not included; also released: EU/other |
| Super Robot Wars Alpha | T20602M | JP | description does not show a clearly complete save; game also has settings/system file(s) (SRWALPHA.SYS) not included |
| Tee-Off | T8108N | US | archive has 2 filename variants (SHIYOUY2/TEE_OFF_); region of chosen save not confirmed; game also has settings/system file(s) (TEE_OFF_.SYS) not included; also released: EU |
| Test Drive Le Mans | T15123N | US | archive has 2 filename variants |
| Test Drive V-Rally | T15110N | US | archive has 2 filename variants |
| The Next Tetris: Net Edition | T40214N | US | archive has 2 filename variants |
| The Rhapsody Of Zephyr | T44502M | JP | description does not show a clearly complete save |
| The Ring: Terror's Realm | T15122N | US | description does not show a clearly complete save |
| Tokyo Xtreme Racer 2 | T40211N | US | archive has 2 filename variants |
| Tricolore Crise | T9104M | JP | description does not show a clearly complete save |
| Virtua Athlete 2K | MK5109450 | EU | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: JP |
| Wetrix+ | T8111N | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: EU |
| World Series Baseball 2K1 | 51055 | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: JP |
| World Series Baseball 2K2 | 51152 | US | single filename across archive; region of save unlabelled; description does not show a clearly complete save; also released: JP |
| Xtreme Sports | T15126N | US | archive has 2 filename variants |
