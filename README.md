# Dreamcast VMU Pro saves

Fully unlocked (or best-available) Dreamcast save data, one 128 KB `.vmu` card image per game, laid out for the
VMU Pro: `vmupro/Dreamcast/<product ID>/<product ID>-1.vmu`. Product IDs come from the Redump Dreamcast database;
one game per title, US preferred, else EU, else JP. Discs with several IDs get the same card under each ID.

## Find a game
Folders are product IDs, so use **[INDEX.md](INDEX.md)** (or `INDEX.csv`) to map folder -> game, region, status and
which archive save was used. `STEP3_REPORT.md` has the overall status and the list of cards that still need review.

## What is in here
| Path | Contents |
|---|---|
| `vmupro/Dreamcast/<ID>/` | Game cards (366 cards, 337 games) |
| `vmupro/Dreamcast/_EXTRAS/` | 26 VMU minigame cards (`MINIGAMES01-26`) and 9 cheat-device code cards (`CHEAT*`) |
| `originals/<game>/` | All original `.VMI`/`.VMS` files from the source archive plus its descriptions |
| `INDEX.md`, `INDEX.csv` | Folder -> game index |
| `_project/credits.csv` | Per-save credit: source URL, creator name (where the archive names one), description |
| `_project/report.csv`, `saves_all.csv` | Per-card report; every save considered per game |
| `_project/unmapped_or_skipped.csv`, `not_on_cards_extras.csv` | What was left out and why |
| `_project/tools/` | Node tooling (no dependencies) that builds and validates everything |

## Status meaning
- **ready**: save judged complete or best available, and its in-card filename is consistent with the chosen region.
- **needs review**: region or save contents uncertain, Redump mapping inferred, or no complete save exists in the archive. Reason is in `report.csv`.

## Caveats (read these)
- **No card has been opened in EVMU or on VMU Pro hardware.** Cards parse back cleanly with two independent checkers
  (`_project/tools/vmu.js` and `_project/tools/check_cards.py`) but that is not the same as loading in a game.
- Layout and the `_EXTRAS` folder for non-game cards are unverified against the VMU Pro's own conventions.
- Picks are heuristic plus manual review of archive descriptions; a "best" save is the uploader's claim, not tested.
- Region-locked saves: some games only load saves whose in-card filename matches the disc region. Filename evidence is noted per game.
- Each card holds a single game's chosen save (plus any downloads/icons that fit), not a full memory card.

## Rebuilding
Needs Node. Clone the source archive and Redump datfile (both gitignored), then from `_project/`:
```
git clone --depth 1 https://github.com/bucanero/dreamcast-saves src
node tools/step3.js && node tools/extras.js && node tools/build.js && node tools/skiplist.js
node tools/report.js   # from repo root
python3 -I tools/check_cards.py   # from repo root, independent checker
```
Notes on the format and decisions are in `_project/notes.md`.

## Credits and licence
Save data comes from [bucanero/dreamcast-saves](https://github.com/bucanero/dreamcast-saves) (GPL-3.0), which collects
saves shared by many community members. See `NOTICE.md`, `LICENSE-GPL-3.0.txt` and `_project/credits.csv`. Creator email
addresses are deliberately not reproduced.
