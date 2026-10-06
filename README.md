# Dreamcast VMU Pro saves

Fully unlocked (or best-available) Dreamcast save data, one 128 KB `.vmu` card image per game, laid out for the
8BitMods VMU Pro: `vmupro/dreamcast/<GAMEID>/<GAMEID>_1.vmu`. **337 games, 366 game cards**, plus 26 VMU minigame
cards and 9 cheat-device code cards. One game per title: US release preferred, else EU, else JP. Game IDs come from the
Redump Dreamcast database; discs with several IDs get the same card under each ID.

> **Not hardware-tested.** Every card parses back cleanly with two independent checkers, but none has been loaded in EVMU,
> a Dreamcast, or a VMU Pro. Try one first (see "Try one first" below) and tell me what happens.

## Quick start
**Nothing showing in the VMU Browser?** Check the card holds exactly `/dreamcast/<name>/<name>_1.vmu` at the root (not `/dreamcast/dreamcast/...` or inside an extra folder from unzipping), then try `VMUPro-TEST-3-cards.zip`-style minimal setup: only three cards first.

1. **Back up your microSD card** (and any existing `/dreamcast` folder). Nothing here writes to a device for you.
2. Copy the **contents of `vmupro/`** (the `dreamcast` folder) to the root of the VMU Pro's microSD card, so you end up with
   `/dreamcast/t1201n/t1201n_1.vmu`, etc. You can copy only the games you want.
3. Put the card in the VMU Pro, boot a game. If the folder name matches the game's ID the VMU Pro loads that card
   automatically (the card is channel 1; this repo supplies channel 1 only).
4. Folder names on the SD card must be product IDs (that is how the VMU Pro finds the right card), so they are not readable.
   To find a game: browse **[by-title/](by-title)** (folders named by game title), open **[INDEX.md](INDEX.md)** and Ctrl-F the title,
   or see the table GitHub shows under `vmupro/dreamcast/` (`INDEX.csv` is the same data for spreadsheets). Always copy cards
   from `vmupro/dreamcast/`, not `by-title/`. (`vmupro/dreamcast/README.md` is just a lookup file; the VMU Pro ignores it.)

### Try one first
Copy a single folder such as `t1201n` (Marvel vs. Capcom) or `51000` (Sonic Adventure), boot that game, check the save
loads. If you use EVMU, you can also open the `.vmu` there to inspect it. If it works, copy the rest.

### How game IDs map to folders
The folder name is the disc's product ID with dashes and spaces removed, in lowercase like the 8BitMods docs' examples (`T-1201N` -> `t1201n`, `MK-51054-50` ->
`mk5105450`). Per the VMU Pro docs, for games with several versions whose IDs differ only in the last two digits you can
drop those two digits so one folder serves them all (`mk5105450` -> `mk51054`). If a game does not pick up its card, compare
the disc's ID with the folder name in `INDEX.md` and rename the folder.

### Existing saves
A folder you already have with the same name will conflict. Do not overwrite it: rename ours, or merge the two in EVMU.
Each card here holds just that game's chosen save (plus downloads/icons that fit), not a full memory card.

### Minigames and cheat cards
`minigames01`...`minigames26` hold the VMU minigames and animations from the archive (grouped: homebrew, official, animations;
several share an in-card name so they can't be on one card). `cheat*` cards are Action Replay / GameShark / Xploder code
saves; they only work with the matching cheat disc. These show up as ordinary virtual memory cards by folder name.
Whether the VMU Pro can launch minigames from these cards is **unverified**. The VMU Pro docs describe a separate `games/`
folder for `.vmupack` files, and say individual `.VMS`/`.VMI` games can be converted to a `.vmu` by opening them in EVMU
and saving. The original `.VMI`/`.VMS` files are in `originals/minigames/`.

## What is in here
| Path | Contents |
|---|---|
| `vmupro/dreamcast/<ID>/<ID>_1.vmu` | The cards. Game cards use the product ID; extras are `MINIGAMES01-26`, `cheat*` |
| `by-title/<Game title> [REGION]/` | Browsable copy of every card in folders named by title (not SD layout) |
| `INDEX.md`, `INDEX.csv` | Folder -> game title, region, status, Redump title, save used |
| `STEP3_REPORT.md` | Overall status and the list of cards still needing review |
| `originals/<game>/` | All original `.VMI`/`.VMS` files and descriptions from the source archive |
| `_project/credits.csv` | Per-save credit: source URL, creator name where the archive names one, description |
| `_project/report.csv`, `saves_all.csv` | Per-card report; every save considered per game |
| `_project/unmapped_or_skipped.csv`, `not_on_cards_extras.csv` | What was left out and why |
| `_project/tools/` | Node tooling (no dependencies) that builds and validates everything |

## Status meaning
- **ready**: save judged complete or best available, and its in-card filename is consistent with the chosen region.
- **needs review**: region or contents uncertain, Redump mapping inferred, or the archive has no complete save for it.
  The reason is in `_project/report.csv` and `STEP3_REPORT.md`.

## Known limits
- Picks are heuristics plus a manual read of the archive descriptions; "best save" is the uploader's claim and untested.
- Region-locked saves: some games only load saves whose in-card filename matches the disc's region. Filename evidence is in each game's notes.
- Some games have no "everything unlocked" state (sports rosters, casino money); those get the best roster/late-game save.
- Gaps still to fill from the VMU Dream Explorer disc image are listed as "needs review" in `STEP3_REPORT.md`.

## Finding things in git history
Commit messages list `<folder> = <game title> [region, status]`, so `git log --grep="Resident Evil"` finds the commit that
added or changed a game. `INDEX.csv` is the quickest lookup.

## Rebuilding
Needs Node. Clone the source archive (gitignored), then from `_project/`:
```
git clone --depth 1 https://github.com/bucanero/dreamcast-saves src
node tools/step3.js && node tools/extras.js && node tools/build.js && node tools/skiplist.js
node tools/report.js                 # from repo root
python3 -I _project/tools/check_cards.py   # from repo root; independent card checker
```
Format and decision notes: `_project/notes.md`.

## Credits and licence
Save data comes from [bucanero/dreamcast-saves](https://github.com/bucanero/dreamcast-saves) (GPL-3.0), which collects
saves shared by many community members. See `NOTICE.md`, `LICENSE-GPL-3.0.txt` and `_project/credits.csv`. Creator email
addresses are deliberately not reproduced. Layout follows the 8BitMods VMU Pro docs
(<https://www.8bitmods.wiki/importing-saves>); check the current docs if the device firmware changes.
