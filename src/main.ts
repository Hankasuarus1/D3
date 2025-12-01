import leaflet from "leaflet";

// Styles
import "leaflet/dist/leaflet.css";
import "./style.css";

// Fix missing marker images
import "./_leafletWorkaround.ts";

// Deterministic RNG for token spawning
import luck from "./_luck.ts";

// DOM setup

const controlPanelDiv = document.createElement("div");
controlPanelDiv.id = "controlPanel";
document.body.append(controlPanelDiv);

const mapDiv = document.createElement("div");
mapDiv.id = "map";
document.body.append(mapDiv);

const statusPanelDiv = document.createElement("div");
statusPanelDiv.id = "statusPanel";
document.body.append(statusPanelDiv);

// Constants & types

const CLASSROOM_LATLNG = leaflet.latLng(
  36.997936938057016,
  -122.05703507501151,
);

const GAMEPLAY_ZOOM_LEVEL = 19;
const TILE_DEGREES = 1e-4; //
const INTERACTION_RADIUS_CELLS = 3;
const TOKEN_SPAWN_PROBABILITY = 0.25;
const TARGET_TOKEN_VALUE = 16;

// Token and cell types
type TokenValue = number;

interface CellState {
  token: TokenValue;
}

// Game state in memory
const cellStates = new Map<string, CellState>();
let handToken: TokenValue | null = null;
let hasWon = false;

// Map setup

const map = leaflet.map(mapDiv, {
  center: CLASSROOM_LATLNG,
  zoom: GAMEPLAY_ZOOM_LEVEL,
  minZoom: GAMEPLAY_ZOOM_LEVEL,
  maxZoom: GAMEPLAY_ZOOM_LEVEL,
  zoomControl: false,
  scrollWheelZoom: false,
  dragging: true,
});

// Background tiles
leaflet
  .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  })
  .addTo(map);

// Player marker (fixed to classroom location)
const playerMarker = leaflet.marker(CLASSROOM_LATLNG);
playerMarker.bindTooltip("You are here");
playerMarker.addTo(map);

// Coordinate helpers

const ORIGIN = CLASSROOM_LATLNG;

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

// The player's grid cell (fixed)
const playerCell = latLngToCell(CLASSROOM_LATLNG);

function isCellNearPlayer(i: number, j: number): boolean {
  const dx = i - playerCell.i;
  const dy = j - playerCell.j;
  const chebyshevDist = Math.max(Math.abs(dx), Math.abs(dy));
  return chebyshevDist <= INTERACTION_RADIUS_CELLS;
}

// Token spawning (deterministic)

function spawnInitialToken(i: number, j: number): TokenValue {
  const r = luck(`cell-exists:${i},${j}`);
  if (r >= TOKEN_SPAWN_PROBABILITY) {
    return 0;
  }

  const r2 = luck(`cell-value:${i},${j}`);
  return r2 < 0.5 ? 1 : 2;
}

function getOrCreateCellState(i: number, j: number): CellState {
  const key = cellKey(i, j);
  let state = cellStates.get(key);
  if (!state) {
    const initialToken = spawnInitialToken(i, j);
    state = { token: initialToken };
    cellStates.set(key, state);
  }
  return state;
}

// Rendering cells & labels

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

// Fill the visible map area with grid cells so it looks like the grid
// extends to the edges of the world.
function populateInitialGrid(): void {
  const bounds = map.getBounds();
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();

  const minI = Math.floor((southWest.lat - ORIGIN.lat) / TILE_DEGREES);
  const maxI = Math.floor((northEast.lat - ORIGIN.lat) / TILE_DEGREES);
  const minJ = Math.floor((southWest.lng - ORIGIN.lng) / TILE_DEGREES);
  const maxJ = Math.floor((northEast.lng - ORIGIN.lng) / TILE_DEGREES);

  for (let i = minI; i <= maxI; i++) {
    for (let j = minJ; j <= maxJ; j++) {
      createCellLayer(i, j);
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
    <div>Target token in hand: ${TARGET_TOKEN_VALUE}</div>
    <div>Interaction radius: ${INTERACTION_RADIUS_CELLS} cells</div>
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

// Interaction logic

function handleCellClick(i: number, j: number): void {
  if (!isCellNearPlayer(i, j)) {
    setStatus("That cell is too far away to interact with.");
    return;
  }

  const cell = getOrCreateCellState(i, j);

  if (handToken === null) {
    if (cell.token > 0) {
      handToken = cell.token;
      cell.token = 0;
      setStatus(`Picked up token ${handToken} from cell (${i}, ${j}).`);
      updateCellLayer(i, j);
      updateHandDisplay();
      checkWinCondition();
    } else {
      setStatus("There is no token here to pick up.");
    }
    return;
  }

  if (cell.token === 0) {
    cell.token = handToken;
    setStatus(`Placed token ${handToken} on cell (${i}, ${j}).`);
    handToken = null;
    updateCellLayer(i, j);
    updateHandDisplay();
    checkWinCondition();
  } else if (cell.token === handToken) {
    // Merge equal-valued tokens
    const newValue = handToken * 2;
    cell.token = newValue;
    handToken = null;
    setStatus(`Crafted token ${newValue} at cell (${i}, ${j}).`);
    updateCellLayer(i, j);
    updateHandDisplay();

    // Win condition is specifically about token in hand, but
    // player can pick up this high-value token afterwards.
  } else {
    setStatus(
      `Cannot craft: cell has ${cell.token} and your hand has ${handToken}. Values must match.`,
    );
  }
}

// Initialize

populateInitialGrid();
updateHandDisplay();
setStatus("Click nearby cells to pick up and combine tokens.");
