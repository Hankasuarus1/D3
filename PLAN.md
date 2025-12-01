# D3: World of Bits

# Game Design Vision

A map-based merge game played on a grid over the real world. Each cell can hold at most one token, and players move around the map (like in Pokémon Go) to collect and combine nearby tokens. Tokens of the same value can be merged into a single token of twice the value, with the goal of crafting a high-value token (e.g. 256) through strategic movement and merging.

# Technologies

- TypeScript for most game code, minimal explicit HTML, and shared CSS in `style.css`
- Deno and Vite for building and local development
- Leaflet for map rendering and interaction
- Git + GitHub for version control
- GitHub Actions + GitHub Pages for deployment automation

# Assignments

---

## D3.a: Core mechanics (token collection and crafting)

Key technical challenge: Can you assemble a map-based user interface using the Leaflet mapping framework?\
Key gameplay challenge: Can players collect and craft tokens from nearby locations to finally make one of sufficiently high value?

### Steps

#### Setup & cleanup

- [x] Create `PLAN.md` in the repo root and commit it
- [x] Delete all existing code in `src/main.ts` (keep `_leafletWorkaround.ts`, `_luck.ts`, and `style.css` as-is)
- [x] Import Leaflet CSS, `style.css`, `_leafletWorkaround.ts`, and `luck` into the new `main.ts`

#### Map & player setup

- [x] Create a Leaflet map centered on the fixed classroom location at a single zoom level
- [x] Disable zooming (your code uses fixed zoom + disabled zoom wheel)
- [x] Add a marker representing the player at the classroom location
- [x] Ensure the map is sized so cells fill the entire visible area of the map container _(your CSS supports this and the map fills the viewport)_

#### Grid & cell rendering

- [x] Choose a fixed grid cell size (`TILE_DEGREES = 0.0001`)
- [x] Implement `latLngToCell(latlng)` → `{ i, j }` grid coordinates relative to classroom origin
- [x] Implement `cellToBounds(i, j)` → Leaflet `LatLngBounds` for the cell rectangle
- [x] Implement `cellCenterLatLng(i, j)` → center position for label placement
- [x] On startup, compute the map’s visible bounds and determine the `(i, j)` range covering the entire viewport
- [x] For each visible cell, draw a rectangle so the grid extends to map edges
- [x] Add always-visible labels at the cell center showing:
  - [x] the token value if the cell has a token
  - [x] blank if the cell is empty

#### Token spawning (deterministic)

- [x] Use the `luck` function with a situation string including cell coordinates to determine:
  - [x] Whether a cell initially has a token
  - [x] What the initial token value is (simple 1/2 choice already implemented)
- [x] Store cell state in a `Map` keyed by cell id so mutations (pick up / drop / merge) happen in memory
- [x] Ensure that the initial token layout is deterministic across page loads (same cell coordinates → same initial token)

#### Interaction rules

- [x] Define a fixed interaction radius in grid cells (e.g. 3 cells away from player cell)
- [x] Implement a click handler for each cell rectangle:
  - [x] Convert click to `(i, j)` and check whether the cell is within the interaction radius
  - [x] If too far away, ignore or show a message
- [x] Maintain `handToken: number | null` in game state
- [x] Implement interactions:
  - [x] If `handToken === null` and cell has a token → pick up token (remove from cell, put into hand)
  - [x] If `handToken !== null` and cell is empty → drop token onto cell
  - [x] If `handToken !== null` and cell has equal token value → merge to double value in the cell and clear hand
  - [x] If `handToken !== null` and cell has unequal token value → no-op with a clear message

#### UI feedback & win condition

- [x] Show current hand contents in a visible control/status panel (you display `Hand: ...`)
- [x] Define a target token value in hand (e.g. 8 or 16)
- [x] After each action, check whether the player’s `handToken` is at least the target value
- [x] When the player reaches the target in hand, show a clear win message (alert or banner)
- [x] Keep at least one cleanup-only commit and one `(D3.a complete)` commit message _(do this when submitting)_

---

## D3.b: Globe-spanning gameplay

Key technical challenge: Support gameplay anywhere in the real world, not just near our classroom.\
Key gameplay challenge: Players can craft an even higher value token by moving to other locations to get access to additional crafting materials.

### Steps

#### World-wide grid & rendering

- [x] Make sure the grid system works for any latitude/longitude (not just near the classroom)
- [x] Change the grid generation so it expands as the camera moves:
  - [x] On map `moveend`, compute the visible bounds
  - [x] For each visible cell, create rectangles and labels if they don’t already exist
- [x] Confirm that when the player pans to a far-away area (e.g., across the world), the grid and tokens still appear there

#### Player movement (simulated travel)

- [x] Replace the fixed player position with a dynamic `playerLatLng`
- [x] Update `isCellNearPlayer` to use the current `playerLatLng` instead of a hard-coded cell
- [x] Add a way to move the player anywhere on the map (right-click on the map):
  - [x] Move the player marker to the new location
  - [x] Recompute the player’s grid cell
  - [x] Recenter the map on the player
- [x] Update the status text / UI to explain how to move the player

#### Higher-value crafting goal

- [x] Increase the `TARGET_TOKEN_VALUE` (e.g., from 16 to 64) to encourage movement
- [x] Test that it is still possible (but more challenging) to reach the goal using resources from multiple areas
- [x] Verify that the win condition still triggers correctly after travel

#### Cleanup & commit

- [x] Do at least one cleanup-only commit for D3.b (no new features, just code quality)
- [x] Add a commit with a clear message marking D3.b completion (e.g. `(D3.b complete)`)

---

## D3.c: Object persistence

Key technical challenge: Remember the state of map cells even when they scroll off the screen.\
Key gameplay challenge: Prevent players from farming tokens by repeatedly entering/leaving a region.

### Steps

#### Separate game state from rendering

- [x] Store cell data (token values) in a separate data structure (`cellStates: Map<string, CellState>`)
- [x] Make rendering functions (`createCellLayer`, `updateCellLayer`) read from `cellStates` instead of recomputing tokens
- [x] Ensure mutated cells (picked up, merged, etc.) update `cellStates` and then re-render from that state

#### Handle off-screen cells

- [x] Use `ensureGridCoversView` to generate layers only for currently visible cells
- [x] Add logic to remove cell layers that are far outside the current view, while keeping their `cellStates` entries
- [x] Confirm that when you scroll away and back, cells keep their modified token values

#### Prevent token farming exploit

- [x] Manually test for the farming bug:
  - [x] Pick up a token from a cell
  - [x] Move or pan far away so that region is off-screen
  - [x] Return to that region (or move the player back)
  - [x] Verify that the cell is still empty and does not get a new free token
- [x] Ensure tokens are only created the first time a cell is seen (via `getOrCreateCellState` + `cellStates`)

#### Cleanup & commit

- [x] Do at least one cleanup-only commit for D3.c (no new features, just code quality)
- [x] Add a commit with a clear message marking D3.c completion (e.g. `(D3.c complete)`)

---

## D3.d: Gameplay across real-world space and time

Key technical challenges: Persist game state across page closes; control player movement via real-world geolocation.\
Key gameplay challenge: Support multiple play sessions, some with real movement and some with simulated movement.

### Steps

#### State persistence across sessions

- [x] Design a serializable game state format (hand token, player position, win flag, cells)
- [x] Implement `saveGameState` to write JSON into `localStorage`
- [x] Implement `loadGameState` to restore state on page load
- [x] Ensure `saveGameState` is called after important actions (pickup, drop, merge, movement, win)
- [x] Manually test: refresh the page and confirm that player position, hand token, and modified cells are preserved

#### Real-world and simulated movement

- [x] Keep simulated player movement via right-click on the map
- [x] Add a “Enable GPS tracking” button in the UI
- [x] Use `navigator.geolocation.watchPosition` to update the player’s in-game position from the device GPS
- [x] Update UI text to show GPS status (off, tracking, error)
- [x] Manually test GPS on a real device (or emulator) to confirm that walking around moves the in-game player

#### Combined gameplay across sessions

- [x] Play at least two sessions:
  - [x] Session 1: move, collect, and merge tokens, then close the tab
  - [x] Session 2: reopen the page and verify that the world, player position, and inventory match where you left off
- [x] Confirm that both GPS movement and right-click movement work after reloading

#### Cleanup & commit

- [ ] Do at least one cleanup-only commit for D3.d (no new features, just code quality/docs)
- [ ] Add a commit with a clear message marking D3.d completion (e.g. `(D3.d complete)`)
