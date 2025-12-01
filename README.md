# CMPM 121 D3 Project

Project Summary — D3.a & D3.b

World of Bits is a map-based crafting game played on a grid of latitude–longitude cells. Each cell may contain a token, and the player can pick up, move, and merge equal-valued tokens to create higher-value ones. The grid is rendered with Leaflet and covers the visible map area, with token values always visible inside each cell.

In this stage (D3.b), the game supports globe-spanning play: the grid and deterministic token generation work anywhere in the world, and the player can “travel” by right-clicking on the map to move their avatar. Interaction is limited to nearby cells, the player can hold only one token at a time, and merging equal tokens doubles their value. A higher target token value encourages exploring multiple regions to gather enough resources to win.

D3.c — Object Persistence

In this milestone, the game now keeps a persistent world state even when cells scroll off the screen. Logical cell data (token values) is stored independently from the Leaflet map layers, so removing visual layers does not reset gameplay. When the player returns to an area, the cells are re-rendered from the saved state rather than regenerated.

This also fixes the “farming exploit”: players can no longer leave a region and come back to find free new tokens. All pickups, drops, and merges permanently modify the world grid until the player intentionally changes them again.

The game now maintains a clean separation between game state (the data model) and rendering (visual layers), supporting correct long-term gameplay across large map regions.

D3.d — Cross-Session Persistence & Real-World Movement

In this milestone, the game supports long-term play across multiple real-world sessions.
All important data — including the player’s position, token in hand, modified cell states, and win status — is saved to localStorage and automatically restored on page load. This allows players to close the browser and continue exactly where they left off.

The game now supports two forms of movement:

Manual movement by right-clicking anywhere on the map

Real-world movement using device geolocation

Players can enable GPS tracking through the UI

When enabled, the in-game player follows the device’s actual physical position

These features combine to create a persistent game world that spans physical space and real time, allowing the player to explore, collect, merge, and progress across multiple gameplay sessions.

If you want, I can also help you reorganize the README into a clean multi-section format (Overview, How to Play, Controls, Technical Notes, Assignment Milestones)
