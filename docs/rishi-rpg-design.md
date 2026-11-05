# Rishi RPG Adventure

## Product goal

Turn Rishi's birthday page into a small, replayable RPG rather than a collection of clickable birthday cards.

The core emotional loop is:

**explore → discover → get blocked → learn → get stronger → recover memories → fight the final challenge → win**

Failure is progression. A failed attempt teaches the player a route or attack pattern and permanently improves mobility/bravery for the current session.

## Experience structure

### 0. Title screen
- "RISHI // PLAYER 24"
- Birthday-specific framing, not generic arcade filler.
- Single **START ADVENTURE** action.
- Starting the adventure scrolls the game board to the visual center and moves keyboard focus to the game stage.

### 1. Maze of Memories
- 19 × 14 tile maze.
- Keyboard: WASD + arrow keys.
- Mobile: on-screen directional pad.
- The game stage is focusable and announces controls.
- Seven memory relics.
- Relics persist after death.
- Three sealed passages create meaningful progression gates:
  - Gate I opens after 2 memories.
  - Gate II opens after 4 memories.
  - Gate III opens after 6 memories.
- The map is intentionally constructed so the sealed relics are visibly nearby but inaccessible until their gate condition is met.
- No dead-end "wall embedded" collectibles.

### 2. Guardians
Five guardians use different movement behaviors:
- Vertical patrol.
- Horizontal patrol.
- Ping-pong corridor patrol.
- Short chase burst when the player enters a warning radius, then return to route.
- Orbit/loop movement around a small corridor.
- Guardians have idle bobbing, pulse rings, direction changes, warning states and small movement interpolation.
- Collision respawns the player.
- Collected relics remain collected.
- Every death increments bravery and mobility.
- Mobility is capped so the game remains controllable.

### 3. Memory relics
Each relic has:
- unique icon
- title
- type
- short flavor text
- placeholder media slot
- progression reward

Current placeholders:
1. First Memory / PHOTO
2. Hidden Note / MESSAGE
3. Moving Memory / VIDEO
4. Player Memory / GAME
5. Ordinary Day / MEMORY
6. Birthday Letter / LETTER
7. Final Relic / LEGEND

The actual photos, videos and messages will replace the placeholders later.

### 4. Reward interaction
Opening a relic uses a proper modal dialog:
- focus moves to Close
- Escape closes
- Enter/Space on Close works
- Tab is trapped inside the dialog
- background game simulation pauses while the dialog is open
- closing returns focus to the game stage
- the player cannot die behind an unread memory

This fixes the original accessibility/gameplay bug where the popup blocked the game while guardians continued moving.

### 5. Boss arena
After relic 7:
- maze is cleared
- player enters a dedicated boss arena
- WASD/arrows move
- Space attacks
- boss has HP and visible attack patterns
- player has HP
- boss uses projectiles and movement phases
- player death restarts the boss encounter, not the entire maze
- each boss defeat teaches an attack pattern and improves bravery/mobility
- boss defeat messages rotate so repeated attempts do not feel identical

### 6. Ending
After the boss reaches 0 HP:
- "QUEST COMPLETE"
- "HAPPY BIRTHDAY, RISHI."
- short personalized message
- progression summary
- final media slot for the strongest birthday memory
- no arbitrary "play again" requirement

## Progression model

| Event | Persistent in session |
|---|---|
| Collect relic | Yes |
| Death in maze | Yes, relics retained |
| Maze mobility gain | Yes |
| Bravery gain | Yes |
| Gate unlock | Yes |
| Boss death | Yes, boss knowledge/progression |
| Refresh page | Reset |

A future version can persist progress with localStorage if desired, but the first real version stays session-based to keep the birthday experience simple.

## Visual direction

- Dark arcade / retro RPG.
- Cyan player and UI.
- Pink guardians and boss.
- Gold relics.
- Deep navy maze.
- No gradients as the primary visual device.
- Pixel/monospace typography for HUD.
- Large readable game stage.
- Motion should communicate game state, not decorate it.

## Interaction rules

- Never allow keyboard focus to disappear into the page after the game starts.
- Never let a modal remain open while simulation continues.
- Never require mouse interaction for a keyboard-accessible reward.
- Never make a collectible permanently unreachable.
- Never reset collected memories because of a normal death.
- Do not use autoplay audio.

## Content placeholders

The game is intentionally built around replaceable content objects. Real birthday photos, messages and videos can be inserted without rewriting the game engine.

## Non-goals

- No backend.
- No accounts.
- No multiplayer.
- No external game engine.
- No complex inventory system.
- No procedural maze generation for this birthday version.
