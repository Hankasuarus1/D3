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

#### Setup & scaffolding

- [ ] Create this `PLAN.md` file in the project root and commit it
- [ ] Verify Vite + TypeScript project builds and runs (`npm run dev` or equivalent)
- [ ] Install Leaflet and its types (`npm install leaflet @types/leaflet`)
- [ ] Import Leaflet CSS and JS into `main.ts` (or equivalent entry file)

#### Map & player representation

- [ ] Show a basic Leaflet map centered on a starting location (e.g., UCSC campus)
- [ ] Make the map fill the viewport (desktop + mobile friendly)
- [ ] Draw a marker or icon for the player’s current position (initially a fixed lat/lon)
- [ ] Add a simple HUD overlay (e.g., div on top of map) showing:
  - [ ] Current token in hand (or “empty”)
  - [ ] Target token value (e.g., 256)

#### Grid & cell model

- [ ] Choose a grid resolution (e.g., 0.001° lat × 0.001° lon per cell)
- [ ] Implement a function `latLonToCell(lat, lon)` that maps to discrete cell coordinates
- [ ] Implement `cellToLatLon(cellX, cellY)` that gives the center of a cell
- [ ] Implement a unique `cellId(x, y)` string to use as a key in a map/dictionary
- [ ] Define TypeScript types/interfaces for:
  - [ ] Token values (powers of 2)
  - [ ] Cell state (token or empty)
  - [ ] Overall game state (cells, player position, hand token, target value)
- [ ] Initialize a small region of cells around the starting location with random tokens (e.g., value 1 or empty)

#### Drawing cells and tokens on the map

- [ ] Render a visual grid (rectangles or implicit grid) for a small area around the player
- [ ] For each cell with a token, draw a marker or icon on the map at the cell center
- [ ] Display the token’s value on the marker (e.g., via label or custom icon)
- [ ] Provide a function that re-renders all map markers based on current game state

#### Nearby interaction logic

- [ ] Choose a “nearby” radius (e.g., 75 meters)
- [ ] Implement a distance check helper: given player position and cell position, determine if the cell is nearby
- [ ] Add a map click handler:
  - [ ] On map click, convert click lat/lon to a cell via `latLonToCell`
  - [ ] Check if that cell is nearby the player; if not, ignore or show a message
- [ ] Implement game interaction rules:
  - [ ] If hand is empty and nearby cell has a token → pick up (hand = token, cell becomes empty)
  - [ ] If hand has a token and nearby cell is empty → drop token there
  - [ ] If hand has a token and nearby cell has same value → merge into one cell with doubled value and clear hand
  - [ ] If hand has a token and cell has different value → no-op or show feedback (cannot merge)

#### Win condition & feedback

- [ ] Set a target token value for the milestone (e.g., 256)
- [ ] After each interaction, check if any cell (or hand) has reached the target value
- [ ] When the target value is reached, show a victory message/banner (simple alert is okay for D3.a)
- [ ] Ensure the player can continue playing after winning (or at least reload to restart)

#### Cleanup & deployment

- [ ] Do at least one cleanup-only commit (removing dead code, console logs, etc.)
- [ ] Verify that the map and HUD work on a mobile browser (or mobile devtools)
- [ ] Set up or update GitHub Pages deployment for the project
- [ ] Confirm that the deployed URL loads the playable D3.a version of the game
- [ ] Add a commit with a clear message marking D3.a completion (e.g. `feat: (D3.a complete)`)

---

## D3.b: Globe-spanning gameplay

Key technical challenge: Support gameplay anywhere in the real world, not just near our classroom.\
Key gameplay challenge: Players can craft an even higher value token by moving to other locations to get access to additional crafting materials.

### Steps

- [ ] Generalize grid/token generation so it works for any latitude/longitude
- [ ] Introduce deterministic token generation per cell (e.g., seeded by cellId) so cells are consistent across sessions
- [ ] Increase target token value (e.g., 512 or 1024) to encourage movement
- [ ] Add UI feedback encouraging players to explore new regions
- [ ] Update deployment and test interaction in a distant area (simulate by panning map)

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
