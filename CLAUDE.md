# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Overlord Rising" is a client-side Phaser.js web game where players collect coins by tapping the screen. Players purchase coins with points, tap to make them jump and earn points, then buy more coins.

**Tech Stack:**
- Phaser.js v3.88.2 (embedded as `phaser.js`, no npm)
- Vanilla JavaScript with ES6 modules (no build tools)
- HTML5 Canvas rendering

## Running the Game

No build process required - simply open `index.html` in a web browser. The game uses native ES6 module support.

## Deployment

```bash
./server.sh
```

Packages the game (excluding node_modules, dist, .git) and deploys to `yang:/opt/games/phaser01/` via SCP.

## Architecture

### Scene Pattern
All game logic is in the `Start` scene class (`src/scenes/Start.js`). Phaser's scene lifecycle manages the game:
- `preload()` - Loads sprite sheets and audio assets
- `create()` - Initializes game state, UI, input handlers, animations
- Custom methods handle gameplay mechanics

### Configuration
`src/GameConfig.js` centralizes constants:
- `CoinTypes` - Silver, gold, diamond coin types
- `Prices` - Point cost to purchase each coin type
- `Values` - Points earned when each coin type jumps
- `InitialScore` - Starting points (100 for testing)

### Key Game Mechanics

**Coin System:**
- Three coin types (silver, gold, diamond) with different costs and point values
- Coins are spawned via `spawnCoin()` with collision detection to prevent overlap
- Shop UI at bottom allows purchasing coins if player has sufficient points

**Jump Mechanic:**
- Clicking anywhere (except bottom UI bar) triggers `jumpCoins()`
- All coins jump simultaneously using tweens
- Each coin plays its rotation animation and earns its point value
- `isJumping` flag prevents spam-clicking issues

**Assets:**
- Sprite sheets: `coin1.webp`, `coin2.webp`, `coin3.webp` (8 frames each, 428x428)
- Audio: `coin.wav`, `drop.wav`
- Background tile: `tail.png`

## Asset Generation

The README.md contains prompts for generating coin sprite sheets using image generation tools. When creating new coin assets:
- Use horizontal sprite sheets
- 8 frames for full rotation (45-degree increments)
- 428x428 frame dimensions
- Transparent background
- Consistent proportions

## Code Organization

```
src/
├── main.js          # Game config and Phaser.Game initialization
├── GameConfig.js    # Centralized constants
└── scenes/
    └── Start.js     # Main game scene (all gameplay logic)
```

When adding new features:
1. Add configuration values to `GameConfig.js`
2. Implement gameplay logic in `Start.js`
3. Update `preload()` for new assets
4. Use Phaser tweens for animations (not physics engine)
5. Handle window resize via the `resize()` method
