# Change Log

## 2026-11-05

- Initialized the `greetings` repository as the source of truth.
- Documented route ownership, deployment invariants, and the current production recovery incident.
- No app implementation has been checked in yet. The existing original pages must be recovered before app scaffolding replaces them.

## 2026-11-24

Rishi page review fixes:

- Road game: removed writes to a nonexistent `#roadLog` element that threw and froze the game at the first checkpoint.
- Skipping the maze no longer hides the ending and "Return to the maze" panel (they live inside `#gameShell`); skipping now also unlocks Chapter VII.
- Closing a video memory pauses it. The sound toggle now mutes and unmutes videos too (sound stays on by default).
- Service worker is network-first for HTML/JS/CSS so new deploys are not hidden by an old cache; range requests bypass it.
- Chapter labels made consistent (maze banner stays Chapter III, boss is Chapter IV, chapter list covers I-VII).
- Hub card now says "Player 23" to match the page.
- Chapter VII and Chapter V media lazy-load; two 2 MB PNGs converted to WebP (about 200 KB total).
- Raised minimum font size and fixed low-contrast text colours.
- Added Open Graph tags and a preview card, plus `noindex`.
- Fullscreen button hidden where unsupported; road game shows its steering hint; Space no longer queues a boss attack during the maze.

Known and intentionally unchanged: the three memory gates can be walked around, which the Treat secret route relies on; some guardians cross wall tiles; Space Mono is named in the CSS but not bundled.

### Maze: fairer hits (2026-11-24)

- Taking a hit no longer sends the player back to the start tile. It costs a heart, knocks the player back, stuns the guardian for about a second and gives about 1.5s of grace.
- Running out of hearts respawns at the last recovered memory instead of the start.
- Added a short screen shake and blink on hit (both reduced when the system asks for reduced motion).


## 2026-11-25

Maze polish, step 1:

- The empty south-west corner now has a sixth guardian (a patrol along its corridors, no chasing) and a hidden bonus at the end of the longest dead end: +1 armour and the existing second letter. The bonus is not a memory and does not affect the 0/7 count, secret routes or the boss.

## 2026-11-25 (step 2)

Maze polish, step 2:

- Guardian routes now follow real corridors. Three guardians used to cut through walls on their return leg: the first now patrols (7,1) to (9,7) only, the third ping-pongs between its ends, and the hunter returns along the corridor instead of jumping across. A 90 second simulation confirms no guardian ever leaves an open tile.

## 2026-11-26

Maze polish, step 3:

- The hunter now finds its way with a breadth-first search over open tiles. It chases only when you are within about six tiles by corridor, so it no longer chases through walls, and it walks back to its patrol along real corridors.
