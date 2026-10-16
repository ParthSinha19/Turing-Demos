import { describe, expect, it } from 'vitest'
import { GRID_LEVELS, interpretGridProgram, type GridBlock } from './grid'

const blocks = (...parts: Array<[GridBlock['type'], number?]>): GridBlock[] => parts.map(([type, count], i) => ({ id: String(i), type, count }))

describe('grid program interpreter', () => {
  it('executes the student-created sequence and detects the target', () => {
    const result = interpretGridProgram(blocks(['repeat-forward', 4]), GRID_LEVELS[0])
    expect(result.success).toBe(true)
    expect(result.final).toEqual({ x: 4, y: 3, direction: 'E' })
    expect(result.moves).toBe(4)
  })

  it('can solve the obstacle route with a sequence and turns', () => {
    const result = interpretGridProgram(blocks(['repeat-forward', 3], ['right'], ['repeat-forward', 4]), GRID_LEVELS[1])
    expect(result.success).toBe(true)
    expect(result.final).toEqual({ x: 4, y: 0, direction: 'E' })
  })

  it('can solve the longer route with configurable repeat blocks', () => {
    const result = interpretGridProgram(blocks(['repeat-forward', 4], ['right'], ['repeat-forward', 5]), GRID_LEVELS[2])
    expect(result.success).toBe(true)
    expect(result.final).toEqual({ x: 5, y: 0, direction: 'E' })
    expect(result.moves).toBe(9)
  })

  it('stops on a collision instead of playing a canned animation', () => {
    const result = interpretGridProgram(blocks(['forward']), GRID_LEVELS[1])
    expect(result.success).toBe(false)
    expect(result.error).toContain('before NOVA reached')
  })

  it('detects obstacles using the actual grid', () => {
    const result = interpretGridProgram(blocks(['forward'], ['right'], ['repeat-forward', 2]), GRID_LEVELS[1])
    expect(result.success).toBe(false)
    expect(result.error).toContain('bumped')
  })

  it('reports an edge collision', () => {
    const result = interpretGridProgram(blocks(['right'], ['repeat-forward', 2]), GRID_LEVELS[0])
    expect(result.success).toBe(false)
    expect(result.error).toContain('leave the path')
  })
})
