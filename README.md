# Dreamcast VMU Pro saves

Fully unlocked (or best-available) Dreamcast save data, one 128 KB `.vmu` card image per game, laid out for the
8BitMods VMU Pro: `vmupro/Dreamcast/<GAMEID>/<GAMEID>-1.vmu`. **364 games, 370 game cards**, plus 136 VMU minigame
cards (one game each, `MG_*`) and 9 cheat-device code cards. One game per title: US release preferred, else EU, else JP. Folder names are the disc-header **Product Number** (e.g. Sonic Adventure US is `MK-51000` -> `MK51000`), taken from the
kevh182/Redump_GameID list, because that is the ID the VMU Pro's GameID matches. (Redump's own serial for that disc, `51000`,
is different and would not match.) A disc with several header numbers (revisions) gets a card under each.

> **Not hardware-tested.** Every card parses back cleanly with two independent checkers, but none has been loaded in EVMU,
> a Dreamcast, or a VMU Pro. Try one first (see "Try one first" below) and tell me what happens.

## Quick start
**Nothing showing in the VMU Browser?** Check the card holds exactly `/Dreamcast/<name>/<name>-1.vmu` at the root (not `/Dreamcast/Dreamcast/...` or inside an extra folder from unzipping), then test with just a few cards first (for example `T1201N`, `MK51000`, `MG_VMU_Football`) to rule out a card-count limit.

1. **Back up your microSD card** (and any existing `/Dreamcast` folder). Nothing here writes to a device for you.
2. Copy the **contents of `vmupro/`** (the `dreamcast` folder) to the root of the VMU Pro's microSD card, so you end up with
   `/Dreamcast/T1201N/T1201N-1.vmu`, etc. You can copy only the games you want.
3. Put the card in the VMU Pro, boot a game. If the folder name matches the game's ID the VMU Pro loads that card
   automatically (the card is channel 1; this repo supplies channel 1 only).
4. Folder names on the SD card must be product IDs (that is how the VMU Pro finds the right card), so they are not readable.
   To find a game: browse **[by-title/](by-title)** (folders named by game title), open **[INDEX.md](INDEX.md)** and Ctrl-F the title,
   or see the table GitHub shows under `vmupro/Dreamcast/` (`INDEX.csv` is the same data for spreadsheets). Always copy cards
   from `vmupro/Dreamcast/`, not `by-title/`. (`vmupro/Dreamcast/README.md` is just a lookup file; the VMU Pro ignores it.)

### Try one first
Copy a single folder such as `T1201N` (Marvel vs. Capcom) or `51000` (Sonic Adventure), boot that game, check the save
loads. If you use EVMU, you can also open the `.vmu` there to inspect it. If it works, copy the rest.

### How game IDs map to folders
The folder name is the disc's product ID with dashes and spaces removed (`T-1201N` -> `T1201N`, `MK-51054-50` ->
`MK5105450`). Per the VMU Pro docs, for games with several versions whose IDs differ only in the last two digits you can
drop those two digits so one folder serves them all (`MK5105450` -> `MK51054`). If a game does not pick up its card, compare
the disc's ID with the folder name in `INDEX.md` and rename the folder.

### Existing saves
A folder you already have with the same name will conflict. Do not overwrite it: rename ours, or merge the two in EVMU.
Each card here holds just that game's chosen save (plus downloads/icons that fit), not a full memory card.

### Minigames and cheat cards
Each VMU minigame is its own card, named `MG_<game>` (for example `MG_VMU_Football`). A VMU only launches the game stored
at the start of the card, so putting several games on one card made them all launch the first one. Open the card in the
VMU Browser, pick the game, and choose "Play Game in VMU". They sort together in the VMC list under `MG_`.
The minigames come from the archive's homebrew/fan collection plus official Sega/Capcom/Namco ones; the original `.VMI`/`.VMS`
files are in `originals/minigames/`. `CHEAT*` cards are Action Replay / GameShark / Xploder code saves and only work with the
matching cheat disc.

## Testing
See [TESTING.md](TESTING.md): structure check, an ID cross-check against K3zter's save database, an on-device check and a per-game check.

## Naming rule (from the official docs)
8BitMods' Importing Saves page specifies `Dreamcast\<name>\<name>-1.vmu` (hyphen before the channel number, 128 KB file,
folder and file name must match) and, for GameID, the disc ID with dashes and spaces stripped. K3zter's
[vmu-save-splitter](https://github.com/K3zter/vmu-save-splitter) writes the same `<id>/<id>-<n>.vmu` form.
An earlier revision of this repo wrongly used an underscore; if you downloaded that one, re-download.

## What is in here
| Path | Contents |
|---|---|
| `vmupro/Dreamcast/<ID>/<ID>-1.vmu` | The cards. Game cards use the product ID; extras are `MG_*` (minigames), `CHEAT*` |
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
Some saves (cards whose source folder in `_project/extra/` starts with `disc_`) come from the **VMU Tool / Dream Explorer**
(v0.8.5, by Speud) community CD, which bundles saves and VMU games from: DC_KOOL (Joe Endy, fp.enter.net/~jkool/DCSaves.htm),
HEEZY (hrb2k), JEFFMA (jeffma.51.net/dcgl), PURHAZE (geocities.com/purhaze5/vmu.html), Planetweb (Ken Soohoo), **Blue Swirl**
(blueswirl.shorturl.com, (c) 2006 Blue Swirl) and The Rockin'-B (rockin-b.de). The disc image is preserved at
<https://archive.org/details/dreamxplorer>.

Blue Swirl's note on the disc asked that its collection not be released without VMU Tool. That site is long gone and the VMU Pro did not
exist then; the repo owner chose to include it for preservation, with credit. If Blue Swirl or anyone else objects, those cards are easy to
remove: they are flagged `restricted` in `_project/selections_disc.json`, and `NO_BLUESWIRL=1 node tools/build.js` rebuilds without them.

Layout follows the 8BitMods VMU Pro docs
(<https://www.8bitmods.wiki/importing-saves>); check the current docs if the device firmware changes.
