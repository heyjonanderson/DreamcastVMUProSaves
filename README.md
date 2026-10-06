# Dreamcast VMU Pro saves

Save files for Dreamcast games, packed up for the 8BitMods VMU Pro. Most of them are fully unlocked or close to it.

## Get your saves (the easy way)

**Go to the catalog: https://heyjonanderson.github.io/DreamcastVMUProSaves/**

Search for the games you own, tick them, and press **Build SD zip**. You get one zip with everything laid out the way the VMU Pro expects.

Then:

- Unzip it. You'll find a folder called `Dreamcast`.
- Copy that folder to the top level of the VMU Pro's microSD card. If the card already has a `Dreamcast` folder, merge them.
- Put the card back in the VMU Pro and start a game. If the folder name matches the disc, the VMU Pro loads the save by itself.

That's the whole process. The rest of this page is for when something goes sideways, or you're curious how it works.

## What you get

- **366 games** on 374 cards, one card per game. I picked the US release first, then Europe, then Japan.
- **219 VMU minigames and animations**, one per card.
- **9 cheat-device code cards** for Action Replay, GameShark and Xploder. They only do anything if you own the matching cheat disc.

Each card is a plain 128 KB VMU image holding that game's save, plus any downloads or icons that fit. It's a single save, not a full memory card.

## About "tested"

Every card passes two separate format checkers, and I've seen a handful of them load on a real VMU Pro (the card list, the names and the minigames). I have not loaded all 370 in their games. Some saves came from 20-year-old forum uploads, and "best save" means the uploader said so.

Games marked with a warning sign in the catalog have a weaker save or an unconfirmed region. The note under the title tells you why. If one doesn't work for you, open an issue and say which game.

## If something doesn't show up

- **Nothing in the VMU Browser.** Check the path on the SD card. It should be `/Dreamcast/<name>/<name>-1.vmu`, with the `-1` and a hyphen, not an underscore. A common slip is ending up with `/Dreamcast/Dreamcast/...` after unzipping.
- **A card shows a raw ID instead of a name.** The VMU Pro doesn't recognize that ID. Tell me which one and I'll fix the folder name.
- **The game doesn't see the save.** Some games only read saves from their own region. Check that the card's region (in the catalog) matches your disc.
- **You already have saves under the same folder name.** Don't overwrite them. Rename one folder, or merge the two in the eVMU emulator.

## Folder naming

The VMU Pro finds a game's card by matching the folder name to the disc's product ID, so the folders are things like `T1201N` (that's Power Stone) and `MK51000` (Sonic Adventure). It's ugly, but it's what makes the automatic loading work.

The ID is the one printed in the disc header with the dashes and spaces taken out. For games with several versions that differ only in the last two digits, you can drop those two digits and one folder covers them all.

To find a game without memorizing IDs, use the catalog, or browse the [`by-title`](by-title) folder (same cards, named by game title). [`INDEX.md`](INDEX.md) is the full list with direct links, and `INDEX.csv` is the same thing for spreadsheets.

## Minigames and cheat cards

Each minigame is its own card, because a VMU only launches the game stored at the start of the card (put two on one card and both launch the first one, which I learned the slow way). They're named `zz_MG_<game>`, and the cheat cards `zz_CHEAT...`. The `zz_` puts them at the end of the VMU Browser list, so they stay out of your way.

Open one in the VMU Browser, pick the game, and choose "Play Game in VMU". The original `.VMI` and `.VMS` files are in `originals/minigames/`.

## What's in this repo

| Path | What it is |
|---|---|
| `vmupro/Dreamcast/<ID>/<ID>-1.vmu` | The cards |
| `by-title/` | The same cards in folders named by game title (for browsing, not for the SD card) |
| `docs/` | The catalog website |
| `INDEX.md`, `INDEX.csv` | Every card: game, region, status, and the save used |
| `STEP3_REPORT.md` | Status summary and the list of cards that still need work |
| `originals/` | The original `.VMI` and `.VMS` files and descriptions for every game |
| `_project/` | The scripts, credits and notes behind all of it |

`_project/credits.csv` has the source link and uploader for each save where the archive named one. Email addresses are left out on purpose.

## Known gaps

- A few games have no complete save anywhere I could find. They're marked in the catalog.
- Where a game has no "everything unlocked" state (sports rosters, casino money), you get the best roster or late-game save.
- Games with several save files sometimes get just one of them. The Resident Evil scenario saves are an example.
- Each region has its own ID, so a card for the US release won't be picked up by a European or Japanese disc of the same game.

## Testing

[`TESTING.md`](TESTING.md) covers the offline checks (card structure, and a cross-check of every folder ID against another save database) plus how to test on the device and in a real game.

## Rebuilding from scratch

You need Node. Clone the source archive (it's gitignored), then run these from `_project/`:

```
git clone --depth 1 https://github.com/bucanero/dreamcast-saves src
node tools/step3.js && node tools/extras.js && node tools/build.js && node tools/make_catalog.js && node tools/skiplist.js
node tools/report.js                       # from the repo root
python3 -I _project/tools/check_cards.py   # from the repo root
```

Notes on the file format and the decisions behind the picks are in `_project/notes.md`.

## Credits and licence

Most saves come from [bucanero/dreamcast-saves](https://github.com/bucanero/dreamcast-saves) (GPL-3.0), which gathers saves shared by a lot of community members over the years. See `NOTICE.md`, `LICENSE-GPL-3.0.txt` and `_project/credits.csv`.

A second batch comes from the VMU Tool / Dream Explorer CD (v0.8.5, by Speud), preserved at <https://archive.org/details/dreamxplorer>. It bundles collections from DC_KOOL (Joe Endy), HEEZY (hrb2k), JEFFMA, PURHAZE, Planetweb (Ken Soohoo), Blue Swirl, and games by The Rockin'-B. Those saves live in `_project/extra/`. About 80 more minigames come from the game pack bundled with the VM2 organizer (community and fan VMU games). The three `zz_MG_Shenmue_Goodies` cards hold a character viewer plus 203 Shenmue character files.

Blue Swirl's note on that disc asked that its collection not be released without VMU Tool. That was written around 2006, the site has been gone for years, and the VMU Pro didn't exist yet, so I included it for preservation, with credit. If Blue Swirl or anyone else objects, say so and it comes out. The cards are flagged `restricted` in `_project/selections_disc.json`, and `NO_BLUESWIRL=1 node tools/build.js` rebuilds without them.

The folder layout follows the 8BitMods VMU Pro docs: <https://www.8bitmods.wiki/importing-saves>.
