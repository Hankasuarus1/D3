// @deno-types="npm:@types/leaflet"
import leaflet from "leaflet";

import "leaflet/dist/leaflet.css";
import "./_leafletWorkaround.ts";
import luck from "./_luck.ts";
import "./style.css";

// Create panels
const controlPanelDiv = document.createElement("div");
controlPanelDiv.id = "controlPanel";
document.body.append(controlPanelDiv);

const mapDiv = document.createElement("div");
mapDiv.id = "map";
document.body.append(mapDiv);

const statusPanelDiv = document.createElement("div");
statusPanelDiv.id = "statusPanel";
document.body.append(statusPanelDiv);

// Constants
const INITIAL_PLAYER_LATLNG = leaflet.latLng(
  36.997936938057016,
  -122.05703507501151,
);

const GAMEPLAY_ZOOM_LEVEL = 19;
const TILE_DEGREES = 0.0001;
const INTERACTION_RADIUS_CELLS = 3;
const TOKEN_SPAWN_PROBABILITY = 0.25;
const TARGET_TOKEN_VALUE = 64;

// Types
type TokenValue = number;

interface CellState {
  token: TokenValue;
}

// Game state
const cellStates = new Map<string, CellState>();
let handToken: TokenValue | null = null;
let hasWon = false;

// Player position (movable)
let playerLatLng = INITIAL_PLAYER_LATLNG.clone();

// Leaflet map setup
const map = leaflet.map(mapDiv, {
  center: INITIAL_PLAYER_LATLNG,
  zoom: GAMEPLAY_ZOOM_LEVEL,
  minZoom: GAMEPLAY_ZOOM_LEVEL,
  maxZoom: GAMEPLAY_ZOOM_LEVEL,
  zoomControl: false,
  scrollWheelZoom: false,
  dragging: true,
});

leaflet
  .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  })
  .addTo(map);

// Player marker
const playerMarker = leaflet.marker(playerLatLng);
playerMarker.bindTooltip("You are here");
playerMarker.addTo(map);

// Grid origin
const ORIGIN = INITIAL_PLAYER_LATLNG;

// Helpers
function cellKey(i: number, j: number): string {
  return `${i},${j}`;
}

function latLngToCell(latlng: leaflet.LatLng): { i: number; j: number } {
  const i = Math.floor((latlng.lat - ORIGIN.lat) / TILE_DEGREES);
  const j = Math.floor((latlng.lng - ORIGIN.lng) / TILE_DEGREES);
  return { i, j };
}

function cellToBounds(i: number, j: number): leaflet.LatLngBounds {
  return leaflet.latLngBounds([
    [ORIGIN.lat + i * TILE_DEGREES, ORIGIN.lng + j * TILE_DEGREES],
    [ORIGIN.lat + (i + 1) * TILE_DEGREES, ORIGIN.lng + (j + 1) * TILE_DEGREES],
  ]);
}

function cellCenterLatLng(i: number, j: number): leaflet.LatLng {
  return leaflet.latLng(
    ORIGIN.lat + (i + 0.5) * TILE_DEGREES,
    ORIGIN.lng + (j + 0.5) * TILE_DEGREES,
  );
}

function getPlayerCell(): { i: number; j: number } {
  return latLngToCell(playerLatLng);
}

function isCellNearPlayer(i: number, j: number): boolean {
  const pc = getPlayerCell();
  const dx = i - pc.i;
  const dy = j - pc.j;
  const d = Math.max(Math.abs(dx), Math.abs(dy));
  return d <= INTERACTION_RADIUS_CELLS;
}

// Token spawning
function spawnInitialToken(i: number, j: number): TokenValue {
  const r = luck(`cell-exists:${i},${j}`);
  if (r >= TOKEN_SPAWN_PROBABILITY) return 0;

  const r2 = luck(`cell-value:${i},${j}`);
  return r2 < 0.5 ? 1 : 2;
}

function getOrCreateCellState(i: number, j: number): CellState {
  const key = cellKey(i, j);
  let state = cellStates.get(key);
  if (!state) {
    state = { token: spawnInitialToken(i, j) };
    cellStates.set(key, state);
  }
  return state;
}

// Cell rendering
const cellLayers = new Map<string, leaflet.LayerGroup>();

function createCellLayer(i: number, j: number): void {
  const key = cellKey(i, j);
  const cellState = getOrCreateCellState(i, j);

  const bounds = cellToBounds(i, j);
  const rect = leaflet.rectangle(bounds, {
    color: "#999",
    weight: 1,
    fillOpacity: cellState.token > 0 ? 0.2 : 0.05,
  });

  rect.on("click", () => handleCellClick(i, j));

  const center = cellCenterLatLng(i, j);
  const label = leaflet.marker(center, {
    interactive: false,
    icon: leaflet.divIcon({
      className: "cell-label",
      html: cellState.token > 0 ? cellState.token.toString() : "",
    }),
  });

  const group = leaflet.layerGroup([rect, label]);
  group.addTo(map);
  cellLayers.set(key, group);
}

function updateCellLayer(i: number, j: number): void {
  const key = cellKey(i, j);
  const existing = cellLayers.get(key);
  if (existing) {
    map.removeLayer(existing);
    cellLayers.delete(key);
  }
  createCellLayer(i, j);
}

function ensureGridCoversView(): void {
  const bounds = map.getBounds();
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  const minI = Math.floor((sw.lat - ORIGIN.lat) / TILE_DEGREES);
  const maxI = Math.floor((ne.lat - ORIGIN.lat) / TILE_DEGREES);
  const minJ = Math.floor((sw.lng - ORIGIN.lng) / TILE_DEGREES);
  const maxJ = Math.floor((ne.lng - ORIGIN.lng) / TILE_DEGREES);

  for (let i = minI; i <= maxI; i++) {
    for (let j = minJ; j <= maxJ; j++) {
      const key = cellKey(i, j);
      if (!cellLayers.has(key)) createCellLayer(i, j);
    }
  }
}

// UI helpers
function updateHandDisplay(): void {
  const handText = handToken === null
    ? "Hand: empty"
    : `Hand: ${handToken.toString()}`;

  controlPanelDiv.innerHTML = `
    <div><strong>${handText}</strong></div>
    <div>Target token: ${TARGET_TOKEN_VALUE}</div>
    <div>Right-click to move the player</div>
  `;
}

function setStatus(message: string): void {
  statusPanelDiv.textContent = message;
}

function checkWinCondition(): void {
  if (!hasWon && handToken !== null && handToken >= TARGET_TOKEN_VALUE) {
    hasWon = true;
    alert(`You crafted a token of value ${handToken}! You win!`);
  }
}

// Player movement
function movePlayerTo(latlng: leaflet.LatLng): void {
  playerLatLng = latlng;
  playerMarker.setLatLng(playerLatLng);
  map.panTo(playerLatLng);

  const pc = getPlayerCell();
  setStatus(`Player moved to cell (${pc.i}, ${pc.j})`);
}

// Right-click to move player
map.on("contextmenu", (event: leaflet.LeafletMouseEvent) => {
  movePlayerTo(event.latlng);
});

// Update grid on map move
map.on("moveend", () => {
  ensureGridCoversView();
});

// Interaction logic
function handleCellClick(i: number, j: number): void {
  if (!isCellNearPlayer(i, j)) {
    setStatus("Cell is too far away.");
    return;
  }

  const cell = getOrCreateCellState(i, j);

  // Picking up
  if (handToken === null) {
    if (cell.token > 0) {
      handToken = cell.token;
      cell.token = 0;
      setStatus(`Picked up ${handToken}`);
      updateCellLayer(i, j);
      updateHandDisplay();
      checkWinCondition();
    } else {
      setStatus("No token to pick up.");
    }
    return;
  }

  // Dropping onto empty cell
  if (cell.token === 0) {
    cell.token = handToken;
    setStatus(`Placed ${handToken}`);
    handToken = null;
    updateCellLayer(i, j);
    updateHandDisplay();
    checkWinCondition();
    return;
  }

  // Merge
  if (cell.token === handToken) {
    const newValue = handToken * 2;
    cell.token = newValue;
    handToken = null;
    setStatus(`Merged into ${newValue}`);
    updateCellLayer(i, j);
    updateHandDisplay();
    return;
  }

  // Mismatch
  setStatus(`Cannot merge: ${cell.token} vs ${handToken}`);
}

// Init
ensureGridCoversView();
updateHandDisplay();
setStatus("Click nearby cells to interact. Right-click to move.");
