import {
  CellType,
  Direction,
  Organism,
  OrganismCell,
  Position,
  SimulationConfig,
  SimulationState,
  DEFAULT_CONFIG,
} from './types';

let nextOrganismId = 1;

// Random helpers
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDirection(): Direction {
  const dirs: Direction[] = ['up', 'down', 'left', 'right'];
  return dirs[randomInt(0, 3)];
}

function randomColor(): string {
  const hue = randomInt(0, 360);
  return `hsl(${hue}, 70%, 50%)`;
}

// Get direction offset
function getDirectionOffset(dir: Direction): Position {
  switch (dir) {
    case 'up': return { x: 0, y: -1 };
    case 'down': return { x: 0, y: 1 };
    case 'left': return { x: -1, y: 0 };
    case 'right': return { x: 1, y: 0 };
  }
}

// Create initial grid
function createGrid(width: number, height: number): CellType[][] {
  return Array(height).fill(null).map(() =>
    Array(width).fill(CellType.EMPTY)
  );
}

// Create a basic organism
function createOrganism(x: number, y: number, cells?: OrganismCell[]): Organism {
  const defaultCells: OrganismCell[] = cells || [
    { type: CellType.MOUTH, relativePos: { x: 0, y: 0 } },
    { type: CellType.MOVER, relativePos: { x: 1, y: 0 } },
  ];

  return {
    id: nextOrganismId++,
    cells: defaultCells,
    position: { x, y },
    energy: 0,
    age: 0,
    direction: randomDirection(),
    moveCounter: randomInt(5, 15),
    color: randomColor(),
  };
}

// Check if position is valid
function isValidPosition(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

// Get absolute positions of organism cells
function getOrganismCellPositions(org: Organism): Position[] {
  return org.cells.map(cell => ({
    x: org.position.x + cell.relativePos.x,
    y: org.position.y + cell.relativePos.y,
  }));
}

// Check if organism can be placed at position
function canPlaceOrganism(
  org: Organism,
  grid: CellType[][],
  organisms: Organism[],
  width: number,
  height: number
): boolean {
  const positions = getOrganismCellPositions(org);
  
  for (const pos of positions) {
    if (!isValidPosition(pos.x, pos.y, width, height)) return false;
    if (grid[pos.y][pos.x] !== CellType.EMPTY && grid[pos.y][pos.x] !== CellType.FOOD) return false;
  }
  
  // Check collision with other organisms
  for (const other of organisms) {
    if (other.id === org.id) continue;
    const otherPositions = getOrganismCellPositions(other);
    for (const pos of positions) {
      for (const otherPos of otherPositions) {
        if (pos.x === otherPos.x && pos.y === otherPos.y) return false;
      }
    }
  }
  
  return true;
}

// Initialize simulation
export function initSimulation(config: SimulationConfig = DEFAULT_CONFIG): SimulationState {
  const grid = createGrid(config.width, config.height);
  const organisms: Organism[] = [];
  
  // Spawn initial organisms
  for (let i = 0; i < config.initialOrganisms; i++) {
    const x = randomInt(5, config.width - 5);
    const y = randomInt(5, config.height - 5);
    const org = createOrganism(x, y);
    if (canPlaceOrganism(org, grid, organisms, config.width, config.height)) {
      organisms.push(org);
    }
  }
  
  // Spawn some initial food
  for (let i = 0; i < config.width * config.height * 0.05; i++) {
    const x = randomInt(0, config.width - 1);
    const y = randomInt(0, config.height - 1);
    if (grid[y][x] === CellType.EMPTY) {
      grid[y][x] = CellType.FOOD;
    }
  }
  
  return {
    grid,
    organisms,
    width: config.width,
    height: config.height,
    generation: 1,
    tick: 0,
    running: false,
  };
}

// Mutate an organism
function mutateOrganism(org: Organism, mutationRate: number): OrganismCell[] {
  if (Math.random() > mutationRate) {
    return org.cells.map(c => ({ ...c, relativePos: { ...c.relativePos } }));
  }
  
  const newCells = org.cells.map(c => ({ ...c, relativePos: { ...c.relativePos } }));
  const mutationType = randomInt(0, 2);
  
  const cellTypes = [CellType.MOUTH, CellType.PRODUCER, CellType.MOVER, CellType.KILLER];
  
  switch (mutationType) {
    case 0: // Add cell
      if (newCells.length < 20) {
        const parentCell = newCells[randomInt(0, newCells.length - 1)];
        const offset = getDirectionOffset(randomDirection());
        const newPos = {
          x: parentCell.relativePos.x + offset.x,
          y: parentCell.relativePos.y + offset.y,
        };
        // Check if position is already occupied
        const occupied = newCells.some(c => 
          c.relativePos.x === newPos.x && c.relativePos.y === newPos.y
        );
        if (!occupied) {
          newCells.push({
            type: cellTypes[randomInt(0, cellTypes.length - 1)],
            relativePos: newPos,
          });
        }
      }
      break;
    case 1: // Remove cell
      if (newCells.length > 2) {
        const idx = randomInt(0, newCells.length - 1);
        newCells.splice(idx, 1);
      }
      break;
    case 2: // Change cell type
      const idx = randomInt(0, newCells.length - 1);
      newCells[idx].type = cellTypes[randomInt(0, cellTypes.length - 1)];
      break;
  }
  
  return newCells;
}

// Get adjacent positions
function getAdjacentPositions(pos: Position): Position[] {
  return [
    { x: pos.x - 1, y: pos.y },
    { x: pos.x + 1, y: pos.y },
    { x: pos.x, y: pos.y - 1 },
    { x: pos.x, y: pos.y + 1 },
  ];
}

// Update single organism
function updateOrganism(
  org: Organism,
  state: SimulationState,
  config: SimulationConfig,
  newOrganisms: Organism[]
): boolean {
  org.age++;
  
  // Check lifespan
  const maxAge = org.cells.length * config.lifespanMultiplier;
  if (org.age > maxAge) {
    // Die and become food
    const positions = getOrganismCellPositions(org);
    for (const pos of positions) {
      if (isValidPosition(pos.x, pos.y, state.width, state.height)) {
        state.grid[pos.y][pos.x] = CellType.FOOD;
      }
    }
    return false;
  }
  
  const cellPositions = getOrganismCellPositions(org);
  
  // Process each cell
  for (let i = 0; i < org.cells.length; i++) {
    const cell = org.cells[i];
    const absPos = cellPositions[i];
    
    if (!isValidPosition(absPos.x, absPos.y, state.width, state.height)) continue;
    
    switch (cell.type) {
      case CellType.MOUTH:
        // Eat adjacent food
        const adjacent = getAdjacentPositions(absPos);
        for (const adjPos of adjacent) {
          if (isValidPosition(adjPos.x, adjPos.y, state.width, state.height)) {
            if (state.grid[adjPos.y][adjPos.x] === CellType.FOOD) {
              state.grid[adjPos.y][adjPos.x] = CellType.EMPTY;
              org.energy++;
              break;
            }
          }
        }
        break;
        
      case CellType.PRODUCER:
        // Produce food randomly
        if (Math.random() < 0.02) {
          const adjacent = getAdjacentPositions(absPos);
          const emptyAdjacent = adjacent.filter(p => 
            isValidPosition(p.x, p.y, state.width, state.height) &&
            state.grid[p.y][p.x] === CellType.EMPTY
          );
          if (emptyAdjacent.length > 0) {
            const target = emptyAdjacent[randomInt(0, emptyAdjacent.length - 1)];
            state.grid[target.y][target.x] = CellType.FOOD;
          }
        }
        break;
        
      case CellType.KILLER:
        // Kill adjacent organisms
        // (simplified - just marks them for death)
        break;
    }
  }
  
  // Movement
  const hasMover = org.cells.some(c => c.type === CellType.MOVER);
  if (hasMover) {
    org.moveCounter--;
    if (org.moveCounter <= 0) {
      org.direction = randomDirection();
      org.moveCounter = randomInt(5, 15);
    }
    
    const offset = getDirectionOffset(org.direction);
    const newPos = {
      x: org.position.x + offset.x,
      y: org.position.y + offset.y,
    };
    
    const testOrg = { ...org, position: newPos };
    if (canPlaceOrganism(testOrg, state.grid, state.organisms, state.width, state.height)) {
      org.position = newPos;
    } else {
      // Bounce off obstacle
      org.direction = randomDirection();
    }
  }
  
  // Reproduction
  if (org.energy >= org.cells.length && state.organisms.length + newOrganisms.length < config.maxOrganisms) {
    org.energy = 0;
    
    // Create offspring
    const childCells = mutateOrganism(org, config.mutationRate);
    const offset = getDirectionOffset(randomDirection());
    const distance = Math.max(...org.cells.map(c => 
      Math.abs(c.relativePos.x) + Math.abs(c.relativePos.y)
    )) + 3;
    
    const childPos = {
      x: org.position.x + offset.x * distance,
      y: org.position.y + offset.y * distance,
    };
    
    const child = createOrganism(childPos.x, childPos.y, childCells);
    child.color = org.color; // Inherit color
    
    // Slight color mutation
    if (Math.random() < 0.1) {
      child.color = randomColor();
    }
    
    if (canPlaceOrganism(child, state.grid, [...state.organisms, ...newOrganisms], state.width, state.height)) {
      newOrganisms.push(child);
    }
  }
  
  return true;
}

// Update simulation by one tick
export function updateSimulation(state: SimulationState, config: SimulationConfig): SimulationState {
  const newState = { ...state, tick: state.tick + 1 };
  const newOrganisms: Organism[] = [];
  
  // Spawn food randomly
  if (Math.random() < config.foodSpawnRate * state.width * state.height) {
    const x = randomInt(0, state.width - 1);
    const y = randomInt(0, state.height - 1);
    if (newState.grid[y][x] === CellType.EMPTY) {
      newState.grid[y][x] = CellType.FOOD;
    }
  }
  
  // Update organisms
  newState.organisms = newState.organisms.filter(org => 
    updateOrganism(org, newState, config, newOrganisms)
  );
  
  // Add new organisms
  newState.organisms.push(...newOrganisms);
  
  // Track generations
  if (newOrganisms.length > 0) {
    newState.generation++;
  }
  
  return newState;
}

// Reset simulation
export function resetSimulation(config: SimulationConfig): SimulationState {
  nextOrganismId = 1;
  return initSimulation(config);
}
