'use client';

import { useRef, useEffect, useCallback } from 'react';
import { SimulationState, SimulationConfig, CellType, CELL_COLORS, Organism } from '@/lib/types';

interface Props {
  state: SimulationState;
  config: SimulationConfig;
}

export default function SimulationCanvas({ state, config }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { cellSize } = config;

    // Clear canvas
    ctx.fillStyle = CELL_COLORS[CellType.EMPTY];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid cells (food and walls)
    for (let y = 0; y < state.height; y++) {
      for (let x = 0; x < state.width; x++) {
        const cell = state.grid[y][x];
        if (cell !== CellType.EMPTY) {
          ctx.fillStyle = CELL_COLORS[cell];
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // Draw organisms
    for (const org of state.organisms) {
      for (const cell of org.cells) {
        const x = org.position.x + cell.relativePos.x;
        const y = org.position.y + cell.relativePos.y;

        if (x >= 0 && x < state.width && y >= 0 && y < state.height) {
          // Draw cell with organism's color tint
          ctx.fillStyle = CELL_COLORS[cell.type];
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

          // Add slight color overlay for species identification
          ctx.fillStyle = org.color;
          ctx.globalAlpha = 0.3;
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          ctx.globalAlpha = 1;

          // Draw cell border
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [state, config]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={state.width * config.cellSize}
      height={state.height * config.cellSize}
      className="border border-gray-700 rounded-lg"
    />
  );
}
