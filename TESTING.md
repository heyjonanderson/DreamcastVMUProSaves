# Testing the cards

Run these from the repo root. Python 3 only (no extra packages) unless noted.

## 1. Card structure (offline, seconds)
```
python _project/tools/check_cards.py
```
Re-parses every `.vmu` in `vmupro/` from the VMS format notes: 131,072 bytes, format marker, root block, directory, FAT chains, no orphans.

## 2. Does each folder ID match what its saves are? (offline, seconds)
Uses K3zter's save database, which maps in-card save filenames to disc IDs and regions.
```
git clone --depth 1 https://github.com/K3zter/vmu-save-splitter k3zter
python _project/tools/verify_ids.py k3zter/save-db.csv
```
Prints OK / MISMATCH / UNKNOWN counts and writes `verify_ids_report.csv`. OK = a save in the card identifies as this ID (the
VMU Pro "drop the last two digits" rule is allowed). MISMATCH on a folder that is an alias (`T13701N`, `T17704N`, `T36801N`,
`T9504M`) is expected: those are alternate IDs I kept on purpose because two sources disagree. UNKNOWN means the database has no
entry for the save (new games, mostly). This check already caught three wrong-game saves (Xtreme Sports, F1 World Grand Prix, Silent Scope).

## 3. On the VMU Pro (about 5 minutes)
Copy `vmupro/Dreamcast` to the SD card, open the VMU Browser and scroll the list. A card that shows a **game name** has an ID the
VMU Pro knows. A card that shows only its raw ID has an ID the VMU Pro does not recognise: note those, they are the ones to look at.
For minigame cards (`ZZ_MG_*`) pick the game and choose "Play Game in VMU".

## 4. In a real game (manual, per game)
The only test that proves a save loads. With an emulator such as Flycast (a VMU there is a 128 KB image, the same format as these
cards; check its docs for the exact file name and location), copy a card in as the VMU for port A1, boot the game and open its
load screen. This needs your own disc images, so I have not automated it. A script that boots each game from your library with the
matching card is possible if you want to build it; the disc ID in each disc's IP.BIN identifies which card to mount.
