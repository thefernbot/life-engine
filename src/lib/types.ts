// Cell types
export enum CellType {
  EMPTY = 'empty',
  FOOD = 'food',
  WALL = 'wall',
  MOUTH = 'mouth',
  PRODUCER = 'producer',
  MOVER = 'mover',
  KILLER = 'killer',
}

// Colors for each cell type
export const CELL_COLORS: Record<CellType, string> = {
  [CellType.EMPTY]: '#1a1a2e',
  [CellType.FOOD]: '#4a5568',
  [CellType.WALL]: '#718096',
  [CellType.MOUTH]: '#f97316',
  [CellType.PRODUCER]: '#22c55e',
  [CellType.MOVER]: '#38bdf8',
  [CellType.KILLER]: '#ef4444',
};

// Direction for movement
export type Direction = 'up' | 'down' | 'left' | 'right';

// Position on the grid
export interface Position {
  x: number;
  y: number;
}

// A cell that belongs to an organism
export interface OrganismCell {
  type: CellType;
  relativePos: Position; // position relative to organism origin
}

// An organism made of cells
export interface Organism {
  id: number;
  cells: OrganismCell[];
  position: Position; // origin position on grid
  energy: number;
  age: number;
  direction: Direction;
  moveCounter: number;
  color: string; // unique color tint for species
}

// Simulation state
export interface SimulationState {
  grid: CellType[][];
  organisms: Organism[];
  width: number;
  height: number;
  generation: number;
  tick: number;
  running: boolean;
}

// Simulation config
export interface SimulationConfig {
  width: number;
  height: number;
  cellSize: number;
  foodSpawnRate: number;
  lifespanMultiplier: number;
  mutationRate: number;
  initialOrganisms: number;
  maxOrganisms: number;
}

export const DEFAULT_CONFIG: SimulationConfig = {
  width: 100,
  height: 60,
  cellSize: 8,
  foodSpawnRate: 0.001,
  lifespanMultiplier: 10,
  mutationRate: 0.3,
  initialOrganisms: 20,
  maxOrganisms: 500,
};
