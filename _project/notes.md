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
