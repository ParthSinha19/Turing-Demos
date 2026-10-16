import { describe, expect, it } from 'vitest'
import { interpretCoreRoute } from './central'

const workingRoute = ['EAST', 'EAST', 'NORTH', 'NORTH', 'EAST', 'EAST', 'SOUTH', 'SOUTH'] as const

describe('central-system repair route', () => {
  it('collects the actual items, powers the switch, and restores the core', () => {
    const result = interpretCoreRoute([...workingRoute])
    expect(result.success).toBe(true)
    expect(result.moves).toBe(8)
    expect(result.trace.at(-1)?.collected).toEqual(['card', 'battery', 'core'])
    expect(result.trace.at(-1)?.switchOn).toBe(true)
  })

  it('does not let a route repair the core when the access card was bypassed', () => {
    const result = interpretCoreRoute(['NORTH', 'NORTH', 'EAST', 'EAST', 'EAST', 'EAST', 'SOUTH', 'SOUTH'])
    expect(result.success).toBe(false)
    expect(result.error).toContain('access card')
  })

  it('detects blocked tiles and map boundaries', () => {
    const obstacle = interpretCoreRoute(['EAST', 'NORTH'])
    expect(obstacle.success).toBe(false)
    expect(obstacle.error).toContain('blocks that tile')
    const edge = interpretCoreRoute(['NORTH', 'NORTH', 'NORTH'])
    expect(edge.success).toBe(false)
    expect(edge.error).toContain('leave the map')
  })
})
