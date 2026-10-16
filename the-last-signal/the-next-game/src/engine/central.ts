import type { Direction, GridMap } from './grid'

export type CoreCommand = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST'
export interface CoreTrace {
  x: number
  y: number
  direction: Direction
  collected: string[]
  switchOn: boolean
  note: string
  error?: boolean
  success?: boolean
  blockIndex: number
}

export const CORE_WORLD: GridMap = {
  cols: 5,
  rows: 4,
  start: { x: 0, y: 2, direction: 'N' },
  target: { x: 4, y: 2 },
  obstacles: [{ x: 1, y: 1 }, { x: 3, y: 1 }],
}

export const CORE_ITEMS = [
  { x: 2, y: 2, key: 'card', label: 'Access card', symbol: '▰' },
  { x: 2, y: 0, key: 'battery', label: 'Power battery', symbol: '▥' },
  { x: 4, y: 0, key: 'switch', label: 'Power switch', symbol: 'ϟ' },
  { x: 4, y: 2, key: 'core', label: 'Central core', symbol: '⌘' },
]

export const CORE_LABELS: Record<CoreCommand, string> = {
  NORTH: 'Move north', EAST: 'Move east', SOUTH: 'Move south', WEST: 'Move west',
}

export interface CoreRunResult {
  trace: CoreTrace[]
  success: boolean
  error?: string
  moves: number
}

/** Execute a route against the actual map and inventory; there is no canned success animation. */
export function interpretCoreRoute(program: CoreCommand[]): CoreRunResult {
  let x = CORE_WORLD.start.x
  let y = CORE_WORLD.start.y
  let direction: Direction = CORE_WORLD.start.direction
  let collected: string[] = []
  let switchOn = false
  const trace: CoreTrace[] = []
  let success = false
  let error: string | undefined
  let moves = 0

  for (let blockIndex = 0; blockIndex < program.length; blockIndex += 1) {
    const command = program[blockIndex]
    const delta: Record<CoreCommand, [number, number, Direction]> = {
      NORTH: [0, -1, 'N'], EAST: [1, 0, 'E'], SOUTH: [0, 1, 'S'], WEST: [-1, 0, 'W'],
    }
    const [dx, dy, newDirection] = delta[command]
    const nx = x + dx
    const ny = y + dy
    moves += 1

    if (nx < 0 || ny < 0 || nx >= CORE_WORLD.cols || ny >= CORE_WORLD.rows) {
      error = 'NOVA would leave the map. Recheck the route.'
      trace.push({ x, y, direction, collected, switchOn, note: error, error: true, blockIndex })
      break
    }
    if (CORE_WORLD.obstacles.some((p) => p.x === nx && p.y === ny)) {
      error = 'A fallen panel blocks that tile. Try another route.'
      trace.push({ x, y, direction, collected, switchOn, note: error, error: true, blockIndex })
      break
    }

    x = nx
    y = ny
    direction = newDirection
    const object = CORE_ITEMS.find((item) => item.x === x && item.y === y)
    let note = `Moved ${command.toLowerCase()}.`
    if (object?.key === 'card' && !collected.includes('card')) {
      collected = [...collected, 'card']
      note = 'Access card collected.'
    }
    if (object?.key === 'battery' && !collected.includes('battery')) {
      collected = [...collected, 'battery']
      note = 'Power battery collected.'
    }
    if (object?.key === 'switch') {
      if (collected.includes('battery')) {
        switchOn = true
        note = 'Power switch activated.'
      } else note = 'Switch is here, but there is no battery to power it.'
    }
    if (object?.key === 'core') {
      const ready = collected.includes('card') && collected.includes('battery') && switchOn
      if (ready) {
        success = true
        collected = [...collected, 'core']
        note = 'Core repaired. All required conditions are true.'
      } else {
        error = `Core locked: ${[
          !collected.includes('card') ? 'access card' : '',
          !collected.includes('battery') ? 'battery' : '',
          !switchOn ? 'active switch' : '',
        ].filter(Boolean).join(', ')} still required.`
        note = error
      }
    }
    trace.push({ x, y, direction, collected, switchOn, note, error: Boolean(error), success, blockIndex })
    if (error || success) break
  }

  if (!success && !error) error = 'The program ended before the core was repaired. Add the missing route instructions.'
  return { trace, success, error, moves }
}
