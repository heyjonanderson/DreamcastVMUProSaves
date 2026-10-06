# Project notes (handoff)

Tools (Node 24, no deps): `_project/tools/`
- `vmu.js`      build/parse 128KB VMU images (root 255, FAT 254, dir 241-253, user 0-199; files allocated downward from 199)
- `archive.js`  parses bucanero README tables + CREDITS.HTM (creator names only; emails deliberately dropped)
- `build.js`    reads `_project/selections.js`, writes cards, copies originals, regenerates credits.csv / report.csv / saves_all.csv, validates by parsing back. `node tools/build.js [dir ...]`
- `parse_dat.js` Redump datfile -> `redump.json` (serial per disc)
Inputs: `_project/src` (git clone of bucanero/dreamcast-saves @ 67019645), `_project/redump/*.dat` (2026-06-14)

Facts found
- Archive has only VMI+VMS (no DCI). 351 folders, ~8000 files.
- Save filename inside VMS differs by region for some games (MVC2: MVLVSCP2_SYS=US, MVLVS.C2_SYS=JP; Soulcalibur MBU=US, MBE=EU; DOA2 DEADORALIVE2=US/EU, DOA2DATA_JPN=JP; KOF Evolution KOF_EVOL.SYS=US, KOF99EVO.SYS=JP; CvS1 VS.SNKMF_SYS=US(inferred), CAPVSSNK_SYS=JP). Use this to judge region of unlabelled saves.
- Redump serials: some US serials have no prefix (Virtua Tennis 51054, VF3tb 51001, Tennis 2K2 51186); some discs have 2 serials (Garou, Guilty Gear X) -> card built under both.
- Redump has no 'Soul Calibur' spelling: use 'Soulcalibur'. Virtua Tennis 2 US = "Tennis 2K2" (51186, archive dir virtuatennis2 'Sega Sports Tennis 2K2').
- Not verified: no card has been opened in EVMU/hardware. VMU Pro layout from Comstedt's VMS docs; verify one card on device.

Step 1 deferred / borderline (not yet built): wrestling/boxing (fireprowd, giantgram, wwfattitude, wwfrumble, ecw, ecwanarchy, ready_rumble, ready_rumble2), beat-em-ups (soulfighter, fightforce2, cannonspike, dynamitecop).
DLC/minigame-type saves seen so far (skipped): SFALPHA3.DWN (v20786 Master Rolento), SPAWNNGM.701 & SPAWNL0U.A01 (Spawn downloads), CvS2 replay files CVS.S2___RD*. Full list to be produced in step 3.
Not yet built: Virtua Tennis (virtuatennis -> 51054, virtuatennis2 -> 51186), then everything else.


## Status after steps 2-3 + extras (update)
- Step 2 done (Virtua Tennis, Virtua Tennis 2). Step 3 done: `tools/step3.js` maps every archive folder to Redump IDs and picks a save
  (heuristic scoring + a manual `FORCE` table written after reading all descriptions); output `selections3.json`. `selections.js` merges
  steps 1-2 (`tools/selections_12.js`), step 3, per-game attachments (`extras_attach.json`) and extras cards (`selections_extras.json`, from `tools/extras.js`).
- Region evidence from in-card filenames: HOD2DC_U=US, SAMBAUS1=US, S.ARCADIA=US (E.ARCADIA=JP, ARCADIA_E=EU), TDLEMANS/TDVRALLY=US, TXRACER=US (SHUTOKOU=JP),
  RESEVIL2/3 = US/EU (BIOHAZRD = JP), SGRALLY2I0VD=US (SG_RALLY20VD=JP), D_COP_US=US (DDEKA2DC=JP), ITANDF_U=US (_E=EU), GUNDAM_US=US.
- Shared Redump IDs: HDR-0201 (Sakura Taisen Rev A discs) is dropped to avoid one folder serving several games.
- Seventh Cross Evolution: VMI size field is wrong in the archive (44 vs 172 blocks); card uses the full 172-block VMS.
- Remaining needs-review: see STEP3_REPORT.md. Gap-filling from the VMU Dream Explorer disc image is still pending (disc is local only; first check
  whether its saves are plain VMS/VMI or proprietary).
- `tools/check_cards.py`: independent card checker (run from repo root).

- Layout fix: VMU Pro convention is /dreamcast/<GAMEID>/<GAMEID>_1.vmu (underscore, lowercase root), per 8BitMods docs (via search summaries; the wiki itself was not fetchable from here). Earlier commits used `Dreamcast/<ID>/<ID>-1.vmu`. Extras are plain folders (MINIGAMES01-26, CHEAT*) in the same dir; the old `_EXTRAS` subfolder was dropped.

- CORRECTION (supersedes the layout note above): official 8BitMods docs (Importing Saves page, read from the saved HTML) say `Dreamcast\<name>\<name>-1.vmu`, HYPHEN, and GameID folder = ID with dashes/spaces stripped, partial match by dropping last 2 digits. A search-summary had suggested underscore/lowercase, which was wrong and made cards not appear in the VMU Browser. Layout restored to Dreamcast/<ID>/<ID>-1.vmu with uppercase IDs (as in the docs example). K3zter/vmu-save-splitter uses the same form.
- GameID fix: VMU Pro GameID = disc-header Product Number (stripped), not the Redump serial. Sega US titles differ (Redump 51000 vs header MK-51000). `tools/gameid.js` builds `gameid.json` from kevh182/Redump_GameID's Sega_Dreamcast_Redump_GameID_List.csv; `selections.js` remaps card ids through it (name match, then serial match). T0000M-style placeholder headers also keep the Redump-serial folder.
- Minigame (0xCC) files: dir header-offset must be 1 (header at block 1 of the file) and they are laid out ascending from block 0; earlier builds wrote 0 and descending, which probably hid them in the VMU Browser. Fixed in vmu.js.
- Minigames: one card per game (MG_<name>); a VMU only boots the game at block 0, so multi-game cards launched the first game (found when Alien Fighter started Football).

- VMU Tool Dream Explorer disc (GDI; extracted with tools/gdi_extract.py): VMU_SAVES has BLUE_SWIRL (1391, restricted: not released without VMU Tool), PLANETWEB (2681, ~95% already in bucanero), DC_KOOL (359, region-labelled US/JP/EU), JEFFMA (268, ~all dup), PURHAZE (192), HEEZY (US/EU/JP subfolders). Imported only non-Blue-Swirl saves via tools/disc_import.js -> _project/extra/disc_* + selections_disc.json: 4 upgrades (capcomsnk, streetfighter3, ufc, chuchu) and 15 new games. Blue Swirl would add better/new saves for ~10 needs-review games and ~15 new games, plus 129 VMU minigames; kept out pending the user's decision.

- Blue Swirl content IS now integrated (owner's decision; site offline; archive.org/details/dreamxplorer linked). 5 save upgrades (fightvip2, redlineracer, sakura_card, godzilla, f1worldprix), 12 new games, 69 extra minigames, all flagged restricted:'blueswirl' in selections_disc.json / selections_extras.json; `NO_BLUESWIRL=1 node tools/build.js` (also run extras.js with it) drops them. disc_import.js takes the extracted VMU_GAMES folder as arg 2. CSVs now redact email addresses.

- ID cross-check (tools/verify_ids.py with K3zter save-db.csv) found 3 wrong-game saves, fixed: Xtreme Sports (XTREMESP vs EXTREMES = Sega Extreme Sports), F1 World Grand Prix (F1WGP4DC_ vs F1WGP4DC2 = II), Silent Scope (SSCOPE01 US vs SILENT01 JP). Added cards: Sega Extreme Sports (EU, JP), F1 World Grand Prix II (JP). Alias IDs kept where sources disagree (nightcreature2 T9504N).
- GameID quirk found on device: three US discs have header numbers with a trailing ' 00' (Hoyle Casino 'T-11008N 00', Armada 'T-40301N 00', Wild Metal 'T-42101N 00'); the VMU Pro did not name those cards. Folders are now T11008N, T40301N, T42101N (drop the trailing 00; VMU Pro partial-match rule).
- Extras renamed with a ZZ_ prefix (ZZ_MG_<game>, ZZ_CHEAT*) so the VMU Browser's alphabetical list puts them last.
