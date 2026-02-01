'use client';

import { SimulationState, SimulationConfig, CellType, CELL_COLORS } from '@/lib/types';

interface Props {
  state: SimulationState;
  config: SimulationConfig;
  running: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onConfigChange: (config: Partial<SimulationConfig>) => void;
}

export default function Controls({
  state,
  config,
  running,
  onStart,
  onPause,
  onReset,
  onConfigChange,
}: Props) {
  // Count organisms by dominant cell type
  const speciesCount = new Set(state.organisms.map(o => o.color)).size;
  const totalCells = state.organisms.reduce((sum, o) => sum + o.cells.length, 0);
  const avgSize = state.organisms.length > 0 
    ? (totalCells / state.organisms.length).toFixed(1) 
    : '0';

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      {/* Playback Controls */}
      <div className="flex gap-2">
        {running ? (
          <button
            onClick={onPause}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white font-semibold transition"
          >
            ⏸ Pause
          </button>
        ) : (
          <button
            onClick={onStart}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-semibold transition"
          >
            ▶ Start
          </button>
        )}
        <button
          onClick={onReset}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-semibold transition"
        >
          ↺ Reset
        </button>
      </div>

      {/* Statistics */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="font-semibold text-white mb-2">Statistics</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-400">Tick:</div>
          <div className="text-white">{state.tick}</div>
          <div className="text-gray-400">Population:</div>
          <div className="text-white">{state.organisms.length}</div>
          <div className="text-gray-400">Species:</div>
          <div className="text-white">{speciesCount}</div>
          <div className="text-gray-400">Avg Size:</div>
          <div className="text-white">{avgSize} cells</div>
        </div>
      </div>

      {/* Cell Legend */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="font-semibold text-white mb-2">Cell Types</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: CELL_COLORS[CellType.FOOD] }}></div>
            <span className="text-gray-300">Food</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: CELL_COLORS[CellType.MOUTH] }}></div>
            <span className="text-gray-300">Mouth (eats food)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: CELL_COLORS[CellType.PRODUCER] }}></div>
            <span className="text-gray-300">Producer (makes food)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: CELL_COLORS[CellType.MOVER] }}></div>
            <span className="text-gray-300">Mover (enables movement)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: CELL_COLORS[CellType.KILLER] }}></div>
            <span className="text-gray-300">Killer (damages others)</span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="font-semibold text-white mb-2">Settings</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Mutation Rate: {(config.mutationRate * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.mutationRate * 100}
              onChange={(e) => onConfigChange({ mutationRate: parseInt(e.target.value) / 100 })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Food Spawn Rate: {(config.foodSpawnRate * 1000).toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={config.foodSpawnRate * 10000}
              onChange={(e) => onConfigChange({ foodSpawnRate: parseInt(e.target.value) / 10000 })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Max Organisms: {config.maxOrganisms}
            </label>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={config.maxOrganisms}
              onChange={(e) => onConfigChange({ maxOrganisms: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
