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
