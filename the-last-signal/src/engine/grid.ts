export type Direction = 'N' | 'E' | 'S' | 'W'
export type GridBlockType = 'forward' | 'left' | 'right' | 'repeat-forward' | 'repeat-left' | 'repeat-right'

export interface GridBlock {
  id: string
  type: GridBlockType
  count?: number
}

export interface GridMap {
  cols: number
  rows: number
  start: { x: number; y: number; direction: Direction }
  target: { x: number; y: number }
  obstacles: Array<{ x: number; y: number }>
}

export interface GridTraceStep {
  x: number
  y: number
  direction: Direction
  blockIndex: number
  note: string
  success?: boolean
  error?: boolean
}

export interface GridRunResult {
  trace: GridTraceStep[]
  success: boolean
  error?: string
  final: { x: number; y: number; direction: Direction }
  moves: number
}

export const GRID_LEVELS: GridMap[] = [
  { cols: 5, rows: 4, start: { x: 0, y: 3, direction: 'E' }, target: { x: 4, y: 3 }, obstacles: [] },
  { cols: 5, rows: 4, start: { x: 0, y: 3, direction: 'N' }, target: { x: 4, y: 0 }, obstacles: [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }] },
  { cols: 6, rows: 5, start: { x: 0, y: 4, direction: 'N' }, target: { x: 5, y: 0 }, obstacles: [{ x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 1 }] },
]

const directionOrder: Direction[] = ['N', 'E', 'S', 'W']

function turn(direction: Direction, amount: number): Direction {
  const index = directionOrder.indexOf(direction)
  return directionOrder[(index + amount + 4) % 4]
}

export function interpretGridProgram(program: GridBlock[], world: GridMap): GridRunResult {
  let { x, y, direction } = world.start
  const trace: GridTraceStep[] = []
  let moves = 0
  let success = x === world.target.x && y === world.target.y
  let error: string | undefined
  const blocked = (nx: number, ny: number) => nx < 0 || ny < 0 || nx >= world.cols || ny >= world.rows || world.obstacles.some((p) => p.x === nx && p.y === ny)

  for (let blockIndex = 0; blockIndex < program.length && !success && !error; blockIndex += 1) {
    const block = program[blockIndex]
    const count = block.type.startsWith('repeat-') ? Math.max(1, Math.min(8, Math.trunc(block.count ?? 2))) : 1
    const action = block.type.replace('repeat-', '') as 'forward' | 'left' | 'right'
    for (let repeatIndex = 0; repeatIndex < count && !success && !error; repeatIndex += 1) {
      if (action === 'left') direction = turn(direction, -1)
      if (action === 'right') direction = turn(direction, 1)
      if (action === 'forward') {
        const delta = direction === 'N' ? [0, -1] : direction === 'E' ? [1, 0] : direction === 'S' ? [0, 1] : [-1, 0]
        const nx = x + delta[0]
        const ny = y + delta[1]
        moves += 1
        if (blocked(nx, ny)) {
          error = nx < 0 || ny < 0 || nx >= world.cols || ny >= world.rows
            ? 'NOVA would leave the path. Check the grid edges and the direction it is facing.'
            : 'NOVA bumped into an obstacle. Try a different route around the blocked tile.'
          trace.push({ x, y, direction, blockIndex, note: error, error: true })
          break
        }
        x = nx
        y = ny
      }
      success = x === world.target.x && y === world.target.y
      trace.push({
        x, y, direction, blockIndex,
        note: success ? 'Signal marker reached!' : action === 'forward' ? 'Moved one tile.' : action === 'left' ? 'Turned left.' : 'Turned right.',
        success,
      })
    }
  }
  if (!success && !error) error = 'The program finished before NOVA reached the signal marker. Add or change instructions and try again.'
  return { trace, success, error, final: { x, y, direction }, moves }
}
