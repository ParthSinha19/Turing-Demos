export interface Battery {
  id: string
  charge: number
  damaged: boolean
  colour: 'green' | 'yellow' | 'red'
}

export const BATTERIES: Battery[] = [
  { id: 'A-14', charge: 91, damaged: false, colour: 'green' },
  { id: 'B-08', charge: 76, damaged: true, colour: 'red' },
  { id: 'C-22', charge: 28, damaged: false, colour: 'green' },
  { id: 'D-03', charge: 55, damaged: false, colour: 'yellow' },
  { id: 'E-19', charge: 63, damaged: false, colour: 'red' },
]

export type BatteryRule = 'green' | 'charge' | 'reliable'

export function batteryIsUsable(battery: Battery): boolean {
  return battery.charge >= 40 && !battery.damaged
}

export function evaluateBatteryRule(battery: Battery, rule: BatteryRule): boolean {
  if (rule === 'green') return battery.colour === 'green'
  if (rule === 'charge') return battery.charge >= 50
  return battery.charge >= 40 && !battery.damaged
}

export type DebugStep = 'INSTALL_BATTERY' | 'CHECK_BATTERY' | 'POWER_SWITCH' | 'CHECK_SWITCH' | 'ACTIVATE_RELAY'
export type LogicOperator = 'AND' | 'OR'

export interface DebugRun {
  success: boolean
  relayActive: boolean
  switchOn: boolean
  batteryInstalled: boolean
  log: string[]
  error?: string
}

export function interpretDebugProgram(steps: DebugStep[], operator: LogicOperator, batteryInitiallyInstalled = true): DebugRun {
  let batteryInstalled = batteryInitiallyInstalled
  let batteryChecked = false
  let switchChecked = false
  let switchOn = false
  let relayActive = false
  const log: string[] = []

  for (const step of steps) {
    if (step === 'INSTALL_BATTERY') {
      batteryInstalled = true
      log.push('Battery bay: backup battery installed.')
    } else if (step === 'CHECK_BATTERY') {
      batteryChecked = batteryInstalled
      log.push(batteryChecked ? 'Battery check: a working battery is present.' : 'Battery check failed: no working battery is connected.')
    } else if (step === 'POWER_SWITCH') {
      switchOn = batteryInstalled
      log.push(switchOn ? 'Power switch: switched on.' : 'Power switch failed: no battery is connected.')
    } else if (step === 'CHECK_SWITCH') {
      switchChecked = switchOn
      log.push(switchChecked ? 'Switch check: power is on.' : 'Switch check failed: the switch is still off.')
    } else {
      const condition = operator === 'AND' ? batteryChecked && switchChecked : batteryChecked || switchChecked
      if (!condition) {
        log.push(`Relay blocked: the ${operator} condition evaluated to false.`)
      } else if (operator === 'OR') {
        log.push('Safety interlock rejected OR: it could activate after only one check passed. Use AND so both required checks must pass.')
      } else if (!batteryInstalled || !switchOn) {
        log.push('Relay refused to activate: the physical system still needs a battery and power.')
      } else {
        relayActive = true
        log.push('Relay activated. Both required physical checks passed.')
      }
    }
    if (relayActive) break
  }

  const success = relayActive
  return {
    success, relayActive, switchOn, batteryInstalled, log,
    error: success ? undefined : 'The relay is still offline. Check the missing steps, their order, and whether the condition matches the two checks.',
  }
}

export type TowerStep = 'CHECK_POWER' | 'VERIFY_REPAIRS' | 'SEND_SIGNAL'

export function interpretTowerSequence(sequence: TowerStep[], powerRestored: boolean): { success: boolean; log: string[] } {
  let powerChecked = false
  let repairsVerified = false
  let signalSent = false
  const log: string[] = []
  for (const step of sequence) {
    if (step === 'CHECK_POWER') {
      powerChecked = powerRestored
      log.push(powerChecked ? 'Power check passed.' : 'Power check failed: the central system is not restored yet.')
    } else if (step === 'VERIFY_REPAIRS') {
      repairsVerified = powerChecked
      log.push(repairsVerified ? 'Repair records verified.' : 'Verification failed: check power first.')
    } else {
      signalSent = repairsVerified
      log.push(signalSent ? 'Signal transmitted. NOVA received the missing station record.' : 'Transmission blocked: repair checks have not been verified.')
    }
  }
  return { success: signalSent, log }
}
