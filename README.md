# CMPM 121 D3 Project

## 📝 Project Summary — D3.a & D3.b

World of Bits is a map-based crafting game played on a grid of latitude–longitude cells. Each cell may contain a token, and the player can pick up, move, and merge equal-valued tokens to create higher-value ones. The grid is rendered with Leaflet and covers the visible map area, with token values always visible inside each cell.

In this stage (D3.b), the game supports globe-spanning play: the grid and deterministic token generation work anywhere in the world, and the player can “travel” by right-clicking on the map to move their avatar. Interaction is limited to nearby cells, the player can hold only one token at a time, and merging equal tokens doubles their value. A higher target token value encourages exploring multiple regions to gather enough resources to win.
