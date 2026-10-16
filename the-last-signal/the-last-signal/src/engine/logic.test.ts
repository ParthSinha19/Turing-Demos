import { describe, expect, it } from 'vitest'
import { BATTERIES, batteryIsUsable, evaluateBatteryRule, interpretDebugProgram, interpretTowerSequence } from './logic'

describe('battery rule evaluation', () => {
  it('uses charge and damage, not colour alone', () => {
    expect(batteryIsUsable(BATTERIES[0])).toBe(true)
    expect(evaluateBatteryRule(BATTERIES[1], 'green')).toBe(false)
    expect(evaluateBatteryRule(BATTERIES[1], 'charge')).toBe(true)
    expect(batteryIsUsable(BATTERIES[1])).toBe(false)
  })

  it('identifies the rule that correctly classifies every provided battery', () => {
    expect(BATTERIES.every((battery) => evaluateBatteryRule(battery, 'reliable') === batteryIsUsable(battery))).toBe(true)
    expect(BATTERIES.every((battery) => evaluateBatteryRule(battery, 'green') === batteryIsUsable(battery))).toBe(false)
  })
})

describe('debug program interpreter', () => {
  it('rejects an incomplete procedure', () => {
    const result = interpretDebugProgram(['CHECK_BATTERY', 'ACTIVATE_RELAY'], 'AND')
    expect(result.success).toBe(false)
  })

  it('requires the steps to happen in the correct order and a true condition', () => {
    const result = interpretDebugProgram(['CHECK_BATTERY', 'POWER_SWITCH', 'CHECK_SWITCH', 'ACTIVATE_RELAY'], 'AND')
    expect(result.success).toBe(true)
    expect(result.relayActive).toBe(true)
  })

  it('does not treat OR as a reliable substitute for two checks, even when both pass', () => {
    const result = interpretDebugProgram(['CHECK_BATTERY', 'POWER_SWITCH', 'CHECK_SWITCH', 'ACTIVATE_RELAY'], 'OR')
    expect(result.success).toBe(false)
    expect(result.log.at(-1)).toContain('Safety interlock rejected OR')
  })

  it('requires installing and re-checking a missing battery in the challenge', () => {
    const incomplete = interpretDebugProgram(['CHECK_BATTERY', 'POWER_SWITCH', 'CHECK_SWITCH', 'ACTIVATE_RELAY'], 'AND', false)
    expect(incomplete.success).toBe(false)
    const repaired = interpretDebugProgram(['INSTALL_BATTERY', 'CHECK_BATTERY', 'POWER_SWITCH', 'CHECK_SWITCH', 'ACTIVATE_RELAY'], 'AND', false)
    expect(repaired.success).toBe(true)
    expect(repaired.batteryInstalled).toBe(true)
  })
})

describe('tower sequence interpreter', () => {
  it('only sends the signal after power and repair verification', () => {
    expect(interpretTowerSequence(['SEND_SIGNAL', 'CHECK_POWER', 'VERIFY_REPAIRS'], true).success).toBe(false)
    expect(interpretTowerSequence(['CHECK_POWER', 'VERIFY_REPAIRS', 'SEND_SIGNAL'], true).success).toBe(true)
    expect(interpretTowerSequence(['CHECK_POWER', 'VERIFY_REPAIRS', 'SEND_SIGNAL'], false).success).toBe(false)
  })
})
