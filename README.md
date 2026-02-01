# Life Engine

A cellular automaton that simulates biological evolution. Organisms eat, reproduce, mutate, and compete through natural selection.

**Live:** https://life-engine-liard.vercel.app

## Features

- Grid-based environment with food spawning
- Organisms composed of multiple cell types (mouth, mover, producer, killer)
- Reproduction when organisms consume enough food
- Mutation on reproduction (add, remove, or change cells)
- Species tracking via color inheritance
- Adjustable simulation parameters (mutation rate, food spawn rate, population cap)

## Cell Types

- **Mouth** (orange) - Consumes adjacent food
- **Mover** (blue) - Enables organism movement
- **Producer** (green) - Generates food in adjacent cells
- **Killer** (red) - Damages adjacent organisms

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Canvas API

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Credits

Inspired by [The Life Engine](https://thelifeengine.net) by Max Robinson.
