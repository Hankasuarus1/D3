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
- [ ] Keep at least one cleanup-only commit and one `(D3.a complete)` commit message _(do this when submitting)_

---

## D3.b: Globe-spanning gameplay

Key technical challenge: Support gameplay anywhere in the real world, not just near our classroom.\
Key gameplay challenge: Players can craft an even higher value token by moving to other locations to get access to additional crafting materials.

### Steps

#### World-wide grid & rendering

- [ ] Make sure the grid system works for any latitude/longitude (not just near the classroom).
- [ ] Change the grid generation so it expands as the camera moves:
  - [ ] On map `moveend`, compute the visible bounds
  - [ ] For each visible cell, create rectangles and labels if they don’t already exist
- [ ] Confirm that when the player pans to a far-away area (e.g., across the world), the grid and tokens still appear there.

#### Player movement (simulated travel)

- [ ] Replace the fixed player position with a dynamic `playerLatLng`.
- [ ] Update `isCellNearPlayer` to use the current `playerLatLng` instead of a hard-coded cell.
- [ ] Add a way to move the player anywhere on the map (e.g., right-click or a special button):
  - [ ] Move the player marker to the new location
  - [ ] Recompute the player’s grid cell
  - [ ] Optionally recenter the map on the player
- [ ] Update the status text / UI to explain how to move the player.

#### Higher-value crafting goal

- [ ] Increase the `TARGET_TOKEN_VALUE` (e.g., from 16 to 64 or 128).
- [ ] Test that it is still possible (but more challenging) to reach the goal using resources from multiple areas.
- [ ] Verify that the win condition still triggers correctly after travel.

#### Cleanup & commit

- [ ] Do at least one cleanup-only commit for D3.b (no new features, just code quality).
- [ ] Add a commit with a clear message marking D3.b completion (e.g. `(D3.b complete)`).

---

## D3.c: Object persistence

Key technical challenge: Remember the state of map cells even when they scroll off the screen.\
Key gameplay challenge: Prevent players from farming tokens by repeatedly entering/leaving a region.

### Steps

- [ ] Separate long-term cell state from on-screen rendering (logical state vs. view)
- [ ] Ensure cells that have been interacted with keep their modified token values
- [ ] Detect and fix any exploit where leaving and re-entering the map region respawns tokens
- [ ] Add developer/debug controls/UI to inspect cell state for off-screen regions

---

## D3.d: Gameplay across real-world space and time

Key technical challenges: Persist game across page closes; control player movement via real-world geolocation.\
Key gameplay challenge: Support multiple play sessions, some with real movement and some with simulated movement.

### Steps

- [ ] Implement game state serialization to JSON (Memento-style snapshot)
- [ ] Save game state to `localStorage` at key moments (e.g., after each interaction)
- [ ] Load and restore game state from `localStorage` on page load
- [ ] Use `navigator.geolocation` to set player position from the device’s GPS
- [ ] Provide a fallback/simulation mode for testing on desktop without real movement
- [ ] Test gameplay across multiple sessions: close the tab and reopen, verify persistence
- [ ] Final cleanup commit + `(D3.d complete)` marker commit
