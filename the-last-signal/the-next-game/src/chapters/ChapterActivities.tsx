import { useEffect, useMemo, useRef, useState } from 'react'
import { Nova } from '../components/Illustrations'
import { Button, StatusPill } from '../components/Primitives'
import type { ChapterId } from '../data/chapters'
import { GRID_LEVELS, interpretGridProgram, type Direction, type GridBlock, type GridMap, type GridTraceStep } from '../engine/grid'
import { CORE_ITEMS, CORE_LABELS, CORE_WORLD, interpretCoreRoute, type CoreCommand, type CoreTrace } from '../engine/central'
import { BATTERIES, batteryIsUsable, evaluateBatteryRule, interpretDebugProgram, interpretTowerSequence, type BatteryRule, type DebugStep, type LogicOperator, type TowerStep } from '../engine/logic'
import type { GameProgress } from '../state/progress'

export interface ActivityProps {
  onComplete: (optional?: boolean) => void
  challengeMode: boolean
  teacherMode: boolean
  progress: GameProgress
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))
let blockSeed = 0
const makeBlock = (type: GridBlock['type'], count?: number): GridBlock => ({ id: `block-${++blockSeed}`, type, count })

function HintLine({ children }: { children: string }) {
  return <div className="hint-line"><span className="hint-spark" aria-hidden="true">i</span><p>{children}</p></div>
}

function SolvedActions({ onFinish, onChallenge, challengeLabel = 'Try a harder challenge', finishLabel = 'Complete chapter' }: { onFinish: () => void; onChallenge?: () => void; challengeLabel?: string; finishLabel?: string }) {
  return <div className="solved-actions"><Button onClick={onFinish}>{finishLabel} <span aria-hidden="true">→</span></Button>{onChallenge && <Button variant="secondary" onClick={onChallenge}>{challengeLabel}</Button>}</div>
}

function ProgramBlockLabel({ block }: { block: GridBlock }) {
  const labels: Record<GridBlock['type'], string> = {
    forward: 'Move forward', left: 'Turn left', right: 'Turn right',
    'repeat-forward': 'Repeat · move forward', 'repeat-left': 'Repeat · turn left', 'repeat-right': 'Repeat · turn right',
  }
  return <>{labels[block.type]}{block.type.startsWith('repeat-') && <span className="repeat-count">× {block.count ?? 2}</span>}</>
}

function GridBoard({ world, robot, trace, items = [], collected = [] }: {
  world: GridMap
  robot: { x: number; y: number; direction: Direction }
  trace?: GridTraceStep[]
  items?: Array<{ x: number; y: number; key: string; label: string; symbol: string }>
  collected?: string[]
}) {
  const pathCoordinates = new Set((trace ?? []).map((step) => `${step.x},${step.y}`))
  return <div className="grid-board-wrap"><div className="grid-board" style={{ gridTemplateColumns: `repeat(${world.cols}, minmax(0, 1fr))` }} role="img" aria-label="NOVA's interactive grid world">
    {Array.from({ length: world.rows * world.cols }, (_, index) => {
      const x = index % world.cols
      const y = Math.floor(index / world.cols)
      const obstacle = world.obstacles.some((p) => p.x === x && p.y === y)
      const item = items.find((object) => object.x === x && object.y === y && !collected.includes(object.key))
      const isRobot = robot.x === x && robot.y === y
      const isGoal = world.target.x === x && world.target.y === y
      return <div key={`${x}-${y}`} className={`grid-cell ${obstacle ? 'cell-obstacle' : ''} ${isGoal ? 'cell-goal' : ''} ${pathCoordinates.has(`${x},${y}`) ? 'cell-travelled' : ''} ${isRobot ? 'cell-robot' : ''}`}>
        {isGoal && <span className="cell-marker goal-marker" aria-label="Goal">⌖</span>}
        {obstacle && <span className="rock-mark" aria-label="Obstacle"><svg viewBox="0 0 32 28" aria-hidden="true"><path d="M3 23 5 11 12 5 21 8 29 18 27 24Z" fill="#71817a" stroke="#3c5652" strokeWidth="2"/><path d="m7 13 6 1 2 7M20 10l-2 6 8 2" fill="none" stroke="#aebbb0" strokeWidth="2"/></svg></span>}
        {item && <span className="tile-item" title={item.label}><span>{item.symbol}</span></span>}
        {isRobot && <Nova size={Math.min(36, Math.floor(240 / world.cols))} face="curious" className={`tile-nova facing-${robot.direction.toLowerCase()}`} />}
      </div>
    })}
  </div><div className="grid-legend"><span><i className="legend-nova"><Nova size={20} /></i> NOVA</span><span><i className="legend-goal">⌖</i> Signal marker</span>{world.obstacles.length > 0 && <span><i className="legend-rock">◆</i> Obstacle</span>}</div></div>
}

export function TrailActivity({ onComplete, challengeMode }: ActivityProps) {
  const [level, setLevel] = useState(challengeMode ? 2 : 1)
  const world = GRID_LEVELS[level - 1]
  const [program, setProgram] = useState<GridBlock[]>([makeBlock('forward')])
  const [robot, setRobot] = useState(world.start)
  const [activeBlock, setActiveBlock] = useState(-1)
  const [running, setRunning] = useState(false)
  const [solved, setSolved] = useState(false)
  const [feedback, setFeedback] = useState('Build a program, then run it to see what NOVA actually does.')
  const [trace, setTrace] = useState<GridTraceStep[]>([])
  const runToken = useRef(0)

  useEffect(() => {
    runToken.current += 1
    setProgram([makeBlock('forward')])
    setRobot(world.start)
    setTrace([])
    setActiveBlock(-1)
    setRunning(false)
    setSolved(false)
    setFeedback(level === 1 ? 'A straight path is a great place to start.' : 'This route has a blocked section. Plan before you press run.')
    return () => { runToken.current += 1 }
  }, [level, world])

  const add = (type: GridBlock['type']) => { setProgram((prev) => [...prev, makeBlock(type, type.startsWith('repeat-') ? 2 : undefined)]); setSolved(false) }
  const updateCount = (id: string, count: number) => { setProgram((prev) => prev.map((block) => block.id === id ? { ...block, count } : block)); setSolved(false) }
  const moveBlock = (index: number, delta: number) => { setProgram((prev) => { const next = [...prev]; const destination = index + delta; if (destination < 0 || destination >= next.length) return prev; [next[index], next[destination]] = [next[destination], next[index]]; return next }); setSolved(false) }
  const run = async () => {
    if (running) { runToken.current += 1; setRunning(false); setFeedback('Run stopped. Change the program and try again.'); return }
    const token = ++runToken.current
    const result = interpretGridProgram(program, world)
    setRobot(world.start)
    setTrace([])
    setSolved(false)
    setFeedback('Running your program…')
    setRunning(true)
    for (const step of result.trace) {
      await wait(230)
      if (token !== runToken.current) return
      setRobot({ x: step.x, y: step.y, direction: step.direction })
      setActiveBlock(step.blockIndex)
      setTrace((prev) => [...prev, step])
      setFeedback(step.note)
      if (step.error) break
    }
    if (token !== runToken.current) return
    setRunning(false)
    if (result.success) {
      setSolved(true)
      setFeedback(`Signal marker reached in ${result.moves} move${result.moves === 1 ? '' : 's'}. Nicely traced!`)
    } else setFeedback(result.error ?? 'The program needs another look.')
  }
  const reset = () => {
    runToken.current += 1
    setRunning(false)
    setRobot(world.start)
    setTrace([])
    setActiveBlock(-1)
    setSolved(false)
    setFeedback('Robot reset. Your blocks are still here to edit.')
  }

  return <div className="activity-stack">
    <div className="challenge-topline"><span className="eyebrow">ROUTE PROGRAMMER</span><span className="level-switcher" aria-label="Challenge level">{[1, 2, 3].map((n) => <button type="button" key={n} onClick={() => setLevel(n)} className={level === n ? 'selected' : ''} aria-pressed={level === n}>Level {n}</button>)}</span></div>
    <div className="activity-intro"><div><h3>{level === 1 ? 'Reach the marker' : level === 2 ? 'Find the clear route' : 'Make the route efficient'}</h3><p>{level === 1 ? 'Move east along the trail. Can you reach the marker with the fewest instructions?' : level === 2 ? 'The middle of the trail is blocked. Turn and find a way around it.' : 'A longer route is waiting. Use loops to write less code.'}</p></div><StatusPill tone="neutral">{level === 1 ? 'Core mission' : level === 2 ? 'Investigation' : 'Engineering challenge'}</StatusPill></div>
    <GridBoard world={world} robot={robot} trace={trace} />
    <div className="builder-panel">
      <div className="builder-heading"><div><span className="eyebrow">YOUR PROGRAM</span><h3>Instructions</h3></div><span className="block-count">{program.length} block{program.length === 1 ? '' : 's'}</span></div>
      <div className="block-list" aria-label="Program instructions">
        {program.map((block, index) => <div className={`program-block block-${block.type.startsWith('repeat') ? 'loop' : block.type === 'forward' ? 'move' : 'turn'} ${activeBlock === index ? 'block-active' : ''}`} key={block.id}>
          <span className="block-index">{index + 1}</span><span className="block-symbol" aria-hidden="true">{block.type === 'forward' || block.type === 'repeat-forward' ? '↑' : block.type.endsWith('left') || block.type === 'left' ? '↶' : '↷'}</span><span className="block-label"><ProgramBlockLabel block={block} /></span>
          {block.type.startsWith('repeat-') && <select aria-label={`Repeat count for block ${index + 1}`} value={block.count ?? 2} onChange={(event) => updateCount(block.id, Number(event.target.value))}>{[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} times</option>)}</select>}
          <div className="block-controls"><button type="button" aria-label={`Move instruction ${index + 1} up`} disabled={index === 0 || running} onClick={() => moveBlock(index, -1)}>↑</button><button type="button" aria-label={`Move instruction ${index + 1} down`} disabled={index === program.length - 1 || running} onClick={() => moveBlock(index, 1)}>↓</button><button type="button" aria-label={`Remove instruction ${index + 1}`} disabled={running} onClick={() => { setProgram((prev) => prev.filter((item) => item.id !== block.id)); setSolved(false) }}>×</button></div>
        </div>)}
        {program.length === 0 && <p className="empty-code">Your program is empty. Add a block below.</p>}
      </div>
      <div className="block-palette"><span className="palette-label">ADD BLOCK</span><button type="button" onClick={() => add('forward')} disabled={running}>↑ Move forward</button><button type="button" onClick={() => add('left')} disabled={running}>↶ Turn left</button><button type="button" onClick={() => add('right')} disabled={running}>↷ Turn right</button><button type="button" onClick={() => add('repeat-forward')} disabled={running}>↻ Repeat forward</button></div>
      <div className={`run-feedback ${solved ? 'feedback-success' : feedback.toLowerCase().includes('bump') || feedback.toLowerCase().includes('before') || feedback.toLowerCase().includes('leave') ? 'feedback-error' : ''}`} role="status"><span className="feedback-dot" />{feedback}</div>
      <div className="activity-actions"><Button onClick={run}>{running ? 'Stop run' : '▶ Run program'}</Button><Button variant="secondary" onClick={reset}>↺ Reset robot</Button></div>
      {solved && <div className="success-panel"><Nova size={54} face="happy" /><div><strong>Route complete!</strong><p>{level === 1 ? 'You gave NOVA a working sequence of instructions.' : level === 2 ? 'You traced a route around the blocked tiles.' : 'You used a repeat block to keep your program tidy.'}</p><SolvedActions onFinish={() => onComplete(level > 1 || challengeMode)} onChallenge={level < 3 ? () => setLevel(level + 1) : undefined} challengeLabel="Try the next route" /></div></div>}
    </div>
    <HintLine>{level === 1 ? 'NOVA begins facing east. Each Move Forward block advances exactly one tile.' : level === 2 ? 'NOVA starts facing north. A turn changes direction but does not move the robot.' : 'Repeat Forward runs its instruction the chosen number of times. Watch the highlighted block while it runs.'}</HintLine>
  </div>
}

export function LaboratoryActivity({ onComplete, challengeMode }: ActivityProps) {
  const [advanced, setAdvanced] = useState(challengeMode)
  const [hasCard, setHasCard] = useState(false)
  const [powerOn, setPowerOn] = useState(false)
  const [solved, setSolved] = useState(false)
  const [feedback, setFeedback] = useState('The terminal is waiting for NOVA’s state to satisfy the access rule.')
  const canOpen = hasCard && (!advanced || powerOn)
  const tryDoor = () => {
    if (canOpen) { setSolved(true); setFeedback('Access granted. The door has opened because the condition evaluated to true.') }
    else setFeedback(advanced && !powerOn && hasCard ? 'Card accepted, but the power switch is still off. The second condition is false.' : !hasCard ? 'Access denied. NOVA has not collected the access card yet.' : 'Access denied. Check the condition and try again.')
  }
  return <div className="activity-stack">
    <div className="challenge-topline"><span className="eyebrow">STATE & CONDITIONALS</span><label className="toggle-control"><input type="checkbox" checked={advanced} onChange={(event) => { setAdvanced(event.target.checked); setSolved(false); setFeedback('Condition updated. Try the door again.') }} /> Advanced lock</label></div>
    <div className="lab-scene">
      <div className="lab-door"><div className={`door-light ${canOpen ? 'lit' : ''}`} /><div className="door-window"><span>{canOpen ? 'OPEN' : 'LOCKED'}</span></div><div className="door-handle" /></div>
      <div className="lab-terminal"><div className="terminal-top"><span /><span /><span /> SECURITY TERMINAL</div><div className="terminal-screen"><span className="code-muted">IF</span> <strong>hasCard</strong> <span className="code-muted">{advanced ? 'AND' : 'THEN'}</span>{advanced && <> <strong>powerOn</strong></>}<br/><span className="code-muted">THEN</span> <strong>unlockDoor()</strong><div className={`condition-output ${canOpen ? 'condition-true' : 'condition-false'}`}>{canOpen ? 'CONDITION: TRUE' : 'CONDITION: FALSE'}</div></div></div>
      <Nova size={86} face={solved ? 'happy' : 'thinking'} />
    </div>
    <div className="state-grid"><div className={`state-card ${hasCard ? 'state-on' : ''}`}><span className="state-icon key-icon">▰</span><div><strong>hasCard</strong><small>Boolean variable</small></div><StatusPill tone={hasCard ? 'good' : 'warn'}>{String(hasCard)}</StatusPill></div>{advanced && <div className={`state-card ${powerOn ? 'state-on' : ''}`}><span className="state-icon power-icon">⏻</span><div><strong>powerOn</strong><small>Boolean variable</small></div><StatusPill tone={powerOn ? 'good' : 'warn'}>{String(powerOn)}</StatusPill></div>}</div>
    <div className="action-row"><Button variant={hasCard ? 'secondary' : 'primary'} onClick={() => { setHasCard(!hasCard); setSolved(false); setFeedback(!hasCard ? 'Card collected. The hasCard variable is now true.' : 'Card returned to the shelf. The hasCard variable is now false.') }} disabled={solved}>{hasCard ? 'Return access card' : 'Collect access card'}</Button>{advanced && <Button variant={powerOn ? 'secondary' : 'primary'} onClick={() => { setPowerOn(!powerOn); setSolved(false); setFeedback(`Power switch ${!powerOn ? 'activated' : 'turned off'}.`) }} disabled={solved}>{powerOn ? 'Turn power off' : 'Activate power switch'}</Button>}<Button onClick={tryDoor} disabled={solved}>Try the door</Button></div>
    <div className={`run-feedback ${solved ? 'feedback-success' : feedback.startsWith('Access denied') ? 'feedback-error' : ''}`} role="status"><span className="feedback-dot" />{feedback}</div>
    {solved && <div className="success-panel"><Nova size={54} face="happy" /><div><strong>Condition satisfied.</strong><p>A variable stored the state; the conditional checked it before unlocking the door.</p><SolvedActions onFinish={() => onComplete(challengeMode || advanced)} onChallenge={!advanced ? () => { setAdvanced(true); setHasCard(false); setPowerOn(false); setSolved(false); setFeedback('Advanced lock enabled. This door needs the card and power switch.') } : undefined} challengeLabel="Try the two-part lock" /></div></div>}
    <HintLine>{advanced ? 'The advanced rule uses AND: both hasCard and powerOn must be true. A missing requirement makes the whole condition false.' : 'Collect the access card to change hasCard from false to true, then try the door again.'}</HintLine>
  </div>
}

export function FactoryActivity({ onComplete, challengeMode }: ActivityProps) {
  const extra = [{ id: 'F-41', charge: 40, damaged: false, colour: 'yellow' as const }, { id: 'G-06', charge: 88, damaged: true, colour: 'green' as const }]
  const [testingNewExamples, setTestingNewExamples] = useState(challengeMode)
  const batteries = useMemo(() => testingNewExamples ? [...BATTERIES, ...extra] : BATTERIES, [testingNewExamples])
  const [rule, setRule] = useState<BatteryRule>('green')
  const [tested, setTested] = useState(false)
  const [solved, setSolved] = useState(false)
  const predictions = batteries.map((battery) => ({ battery, predicted: evaluateBatteryRule(battery, rule), actual: batteryIsUsable(battery) }))
  const correct = predictions.filter((item) => item.predicted === item.actual).length
  const tryRule = () => {
    setTested(true)
    if (correct === batteries.length) setSolved(true)
    else setSolved(false)
  }
  const ruleDescriptions: Record<BatteryRule, string> = {
    green: 'Usable if colour is green',
    charge: 'Usable if charge is at least 50%',
    reliable: 'Usable if charge is at least 40% AND it is not damaged',
  }
  return <div className="activity-stack">
    <div className="challenge-topline"><span className="eyebrow">RULE LABORATORY</span><span className="block-count">{batteries.length} test cells</span></div>
    <div className="activity-intro"><div><h3>What makes a battery usable?</h3><p>Choose a rule, test every battery, and inspect where it gets things wrong.</p></div><StatusPill tone="neutral">{testingNewExamples ? 'New examples' : 'Rule testing'}</StatusPill></div>
    <div className="battery-grid">{batteries.map((battery) => <div className={`battery-card battery-${battery.colour} ${tested ? predictions.find((p) => p.battery.id === battery.id)?.predicted === batteryIsUsable(battery) ? 'battery-correct' : 'battery-wrong' : ''}`} key={battery.id}>
      <div className="battery-illustration"><div className="battery-cap" /><div className="battery-body"><div className="battery-charge" style={{ height: `${battery.charge}%` }} /></div></div><strong>{battery.id}</strong><span className="battery-colour">{battery.colour} casing</span><span className="battery-property">Charge <b>{battery.charge}%</b></span><span className="battery-property">Damage <b>{battery.damaged ? 'Detected' : 'None'}</b></span>{tested && <StatusPill tone={predictions.find((p) => p.battery.id === battery.id)?.predicted === batteryIsUsable(battery) ? 'good' : 'warn'}>{predictions.find((p) => p.battery.id === battery.id)?.predicted ? 'Rule says usable' : 'Rule says faulty'}</StatusPill>}
    </div>)}</div>
    <div className="rule-picker"><span className="eyebrow">CHOOSE A CLASSIFICATION RULE</span><div className="rule-options">{(['green', 'charge', 'reliable'] as BatteryRule[]).map((choice) => <button type="button" key={choice} className={`rule-option ${rule === choice ? 'rule-selected' : ''}`} onClick={() => { setRule(choice); setTested(false); setSolved(false) }}><span className="radio-dot" /><span><strong>{choice === 'green' ? 'Colour shortcut' : choice === 'charge' ? 'Charge threshold' : 'Charge + damage check'}</strong><small>{ruleDescriptions[choice]}</small></span></button>)}</div><div className="rule-footer"><p>Rule preview: <code>{rule === 'green' ? 'colour === green' : rule === 'charge' ? 'charge >= 50' : 'charge >= 40 && !damaged'}</code></p><Button onClick={tryRule}>Test this rule</Button></div></div>
    {tested && <div className={`run-feedback ${solved ? 'feedback-success' : 'feedback-error'}`} role="status"><span className="feedback-dot" />{solved ? `Perfect classification — ${correct}/${batteries.length} batteries match the rule.` : `${correct} of ${batteries.length} classifications correct. Check: ${predictions.filter((p) => p.predicted !== p.actual).map((p) => p.battery.id).join(', ')}. Those examples expose a weakness in the rule.`}</div>}
    {solved && <div className="success-panel"><Nova size={54} face="happy" /><div><strong>Reliable rule found.</strong><p>You checked properties that matter and tested the rule against edge cases.</p><SolvedActions onFinish={() => onComplete(challengeMode || testingNewExamples)} onChallenge={!testingNewExamples ? () => { setTestingNewExamples(true); setRule('reliable'); setTested(false); setSolved(false) } : undefined} challengeLabel="Test on new batteries" /></div></div>}
    <HintLine>Colour and charge alone both miss an important detail. Damage matters even when a battery looks powerful.</HintLine>
  </div>
}

const DEBUG_STEP_META: Record<DebugStep, { label: string; explanation: string; symbol: string }> = {
  INSTALL_BATTERY: { label: 'Install backup battery', explanation: 'Connect the spare cell in the empty battery bay.', symbol: '▥' },
  CHECK_BATTERY: { label: 'Check battery', explanation: 'Confirm a working battery is installed.', symbol: '⌕' },
  POWER_SWITCH: { label: 'Power switch on', explanation: 'Turn the control-room switch on.', symbol: '⏻' },
  CHECK_SWITCH: { label: 'Check switch', explanation: 'Record whether the switch is on.', symbol: '✓' },
  ACTIVATE_RELAY: { label: 'Activate relay', explanation: 'Attempt to activate the relay using the condition.', symbol: 'ϟ' },
}

export function ControlRoomActivity({ onComplete, challengeMode }: ActivityProps) {
  const initial: DebugStep[] = challengeMode ? ['CHECK_BATTERY', 'POWER_SWITCH', 'ACTIVATE_RELAY'] : ['CHECK_BATTERY', 'ACTIVATE_RELAY']
  const [steps, setSteps] = useState<DebugStep[]>(initial)
  const [operator, setOperator] = useState<LogicOperator>('OR')
  const [extension, setExtension] = useState(challengeMode)
  const [batteryPresentAtStart, setBatteryPresentAtStart] = useState(!challengeMode)
  const [log, setLog] = useState<string[]>([])
  const [solved, setSolved] = useState(false)
  const [feedback, setFeedback] = useState('The original automation skips a check and uses a risky condition.')
  useEffect(() => { setSteps(challengeMode ? ['CHECK_BATTERY', 'POWER_SWITCH', 'ACTIVATE_RELAY'] : ['CHECK_BATTERY', 'ACTIVATE_RELAY']); setOperator('OR'); setExtension(challengeMode); setBatteryPresentAtStart(!challengeMode); setLog([]); setSolved(false); setFeedback(challengeMode ? 'Engineering challenge: the spare battery is disconnected. Repair the program and its condition.' : 'The original automation skips a check and uses a risky condition.') }, [challengeMode])
  const addStep = (step: DebugStep) => { setSteps((prev) => [...prev, step]); setSolved(false); setLog([]) }
  const shiftStep = (index: number, delta: number) => { setSteps((prev) => { const next = [...prev]; const target = index + delta; if (target < 0 || target >= next.length) return prev; [next[index], next[target]] = [next[target], next[index]]; return next }); setSolved(false); setLog([]) }
  const run = () => {
    const result = interpretDebugProgram(steps, operator, batteryPresentAtStart)
    setLog(result.log)
    setSolved(result.success)
    setFeedback(result.error ?? 'Relay is stable. The edited program succeeded.')
  }
  return <div className="activity-stack">
    <div className="challenge-topline"><span className="eyebrow">DEBUG CONSOLE</span><StatusPill tone={solved ? 'good' : 'warn'}>{solved ? 'Relay online' : 'Relay offline'}</StatusPill></div>
    <div className="console-screen"><div className="console-top"><span /><span /><span /><b>CTRL // AUTOMATION TRACE</b></div><div className="console-banner"><div className={`relay-lamp ${solved ? 'lamp-on' : ''}`} /><div><strong>{solved ? 'RELAY: ACTIVE' : 'RELAY: NOT RESPONDING'}</strong><small>System requirements: battery present + switch on</small><small>{batteryPresentAtStart || challengeMode || extension ? 'Challenge state: spare battery may need installing' : 'Starting state: battery present, switch off'}</small></div></div>
      <div className="condition-editor"><span className="eyebrow">CONDITION OPERATOR</span><div className="operator-toggle"><button type="button" className={operator === 'AND' ? 'operator-selected' : ''} onClick={() => { setOperator('AND'); setSolved(false); setLog([]) }}>AND <small>both checks</small></button><button type="button" className={operator === 'OR' ? 'operator-selected' : ''} onClick={() => { setOperator('OR'); setSolved(false); setLog([]) }}>OR <small>either check</small></button></div></div>
    </div>
    <div className="builder-panel"><div className="builder-heading"><div><span className="eyebrow">EDIT THE BROKEN PROGRAM</span><h3>Execution order</h3></div><span className="block-count">{steps.length} steps</span></div>
      <div className="debug-step-list">{steps.map((step, index) => <div className="debug-step" key={`${step}-${index}`}><span className="block-index">{index + 1}</span><span className="debug-step-symbol">{DEBUG_STEP_META[step].symbol}</span><div><strong>{DEBUG_STEP_META[step].label}</strong><small>{DEBUG_STEP_META[step].explanation}</small></div><div className="block-controls"><button type="button" aria-label={`Move ${DEBUG_STEP_META[step].label} up`} disabled={index === 0} onClick={() => shiftStep(index, -1)}>↑</button><button type="button" aria-label={`Move ${DEBUG_STEP_META[step].label} down`} disabled={index === steps.length - 1} onClick={() => shiftStep(index, 1)}>↓</button><button type="button" aria-label={`Remove ${DEBUG_STEP_META[step].label}`} onClick={() => { setSteps((prev) => prev.filter((_, i) => i !== index)); setSolved(false); setLog([]) }}>×</button></div></div>)}</div>
      <div className="block-palette debug-palette"><span className="palette-label">INSERT STEP</span>{(Object.keys(DEBUG_STEP_META) as DebugStep[]).map((step) => <button type="button" key={step} onClick={() => addStep(step)}>+ {DEBUG_STEP_META[step].label}</button>)}</div>
      <div className="activity-actions"><Button onClick={run}>▶ Run repaired program</Button><Button variant="secondary" onClick={() => { setLog([]); setSolved(false); setFeedback('Trace cleared. Your edited program is ready to test again.') }}>Clear trace</Button></div>
    </div>
    {log.length > 0 && <div className="trace-panel"><div className="trace-heading"><span className="eyebrow">LIVE EXECUTION TRACE</span><span>{log.length} events</span></div>{log.map((line, index) => <div className="trace-line" key={`${line}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><p>{line}</p></div>)}</div>}
    {feedback && <div className={`run-feedback ${solved ? 'feedback-success' : log.length ? 'feedback-error' : ''}`} role="status"><span className="feedback-dot" />{feedback}</div>}
    {solved && <div className="success-panel"><Nova size={54} face="happy" /><div><strong>Bug repaired.</strong><p>The relay came online because the program checked both requirements in the correct order.</p><SolvedActions onFinish={() => onComplete(challengeMode || extension)} onChallenge={!challengeMode ? () => { setExtension(true); setBatteryPresentAtStart(false); setSteps(['CHECK_BATTERY', 'POWER_SWITCH', 'ACTIVATE_RELAY']); setOperator('OR'); setLog([]); setSolved(false); setFeedback('Engineering challenge: the backup battery is disconnected. Add and order the missing steps, then repair the condition.') } : undefined} challengeLabel="Test a missing-battery fault" /></div></div>}
    <HintLine>Check the execution order, not just the names of the steps. AND is only correct when both checks have really been carried out.</HintLine>
  </div>
}

export function CentralSystemActivity({ onComplete, challengeMode }: ActivityProps) {
  const initial = challengeMode ? [] as CoreCommand[] : ['EAST'] as CoreCommand[]
  const [program, setProgram] = useState<CoreCommand[]>(initial)
  const [robot, setRobot] = useState(CORE_WORLD.start)
  const [collected, setCollected] = useState<string[]>([])
  const [switchOn, setSwitchOn] = useState(false)
  const [extension, setExtension] = useState(challengeMode)
  const [trace, setTrace] = useState<CoreTrace[]>([])
  const [running, setRunning] = useState(false)
  const [solved, setSolved] = useState(false)
  const [feedback, setFeedback] = useState('NOVA must collect the card and battery, activate the switch, then reach the core.')
  const runToken = useRef(0)
  useEffect(() => { setProgram(challengeMode ? [] : ['EAST']); setRobot(CORE_WORLD.start); setCollected([]); setSwitchOn(false); setExtension(challengeMode); setTrace([]); setRunning(false); setSolved(false); setFeedback(challengeMode ? 'Engineering challenge: write the shortest route that collects both items, powers the switch, and reaches the core.' : 'NOVA must collect the card and battery, activate the switch, then reach the core.'); return () => { runToken.current += 1 } }, [challengeMode])
  const editRoute = (update: (previous: CoreCommand[]) => CoreCommand[]) => { setProgram(update); setSolved(false); setTrace([]) }
  const run = async () => {
    if (running) { runToken.current += 1; setRunning(false); return }
    const token = ++runToken.current
    const result = interpretCoreRoute(program)
    setRobot(CORE_WORLD.start); setCollected([]); setSwitchOn(false); setTrace([]); setSolved(false); setRunning(true); setFeedback('Executing route from the start…')
    for (const step of result.trace) {
      await wait(190)
      if (token !== runToken.current) return
      setRobot({ x: step.x, y: step.y, direction: step.direction })
      setCollected(step.collected); setSwitchOn(step.switchOn); setTrace((prev) => [...prev, step]); setFeedback(step.note)
      if (step.error || step.success) break
    }
    if (token !== runToken.current) return
    setRunning(false)
    setSolved(result.success)
    setFeedback(result.success ? `Core repaired in ${result.moves} moves. NOVA satisfied every required condition.` : result.error ?? 'Core still offline.')
  }
  return <div className="activity-stack">
    <div className="challenge-topline"><span className="eyebrow">CENTRAL SYSTEM REPAIR</span><StatusPill tone={switchOn ? 'good' : 'warn'}>{switchOn ? 'Switch powered' : 'Power switch off'}</StatusPill></div>
    <div className="activity-intro"><div><h3>Plan the repair route</h3><p>NOVA collects objects automatically by stepping onto their tiles. The core checks what you actually collected.</p></div><StatusPill tone="neutral">{challengeMode ? 'Efficiency run' : 'Multi-step mission'}</StatusPill></div>
    <GridBoard world={CORE_WORLD} robot={robot} trace={trace} items={CORE_ITEMS} collected={collected} />
    <div className="inventory-strip"><span className="eyebrow">NOVA’S INVENTORY</span>{[{ key: 'card', label: 'Access card', symbol: '▰' }, { key: 'battery', label: 'Battery', symbol: '▥' }, { key: 'switch', label: 'Switch on', symbol: 'ϟ' }].map((item) => { const owned = item.key === 'switch' ? switchOn : collected.includes(item.key); return <div key={item.key} className={`inventory-item ${owned ? 'inventory-owned' : ''}`}><span>{item.symbol}</span><div><strong>{item.label}</strong><small>{owned ? 'Ready' : 'Not yet'}</small></div><span className="inventory-check">{owned ? '✓' : '—'}</span></div> })}</div>
    <div className="builder-panel"><div className="builder-heading"><div><span className="eyebrow">YOUR ROUTE</span><h3>Movement instructions</h3></div><span className="block-count">{program.length} moves</span></div>
      <div className="core-program">{program.map((command, index) => <div className="core-command" key={`${command}-${index}`}><span className="block-index">{index + 1}</span><strong>{CORE_LABELS[command]}</strong><div className="block-controls"><button type="button" aria-label={`Move command ${index + 1} up`} disabled={index === 0 || running} onClick={() => editRoute((prev) => { const next = [...prev]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next })}>↑</button><button type="button" aria-label={`Move command ${index + 1} down`} disabled={index === program.length - 1 || running} onClick={() => editRoute((prev) => { const next = [...prev]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; return next })}>↓</button><button type="button" aria-label={`Remove command ${index + 1}`} disabled={running} onClick={() => editRoute((prev) => prev.filter((_, i) => i !== index))}>×</button></div></div>)}</div>
      <div className="block-palette"><span className="palette-label">ADD MOVE</span>{(['NORTH', 'EAST', 'SOUTH', 'WEST'] as CoreCommand[]).map((command) => <button type="button" key={command} disabled={running} onClick={() => editRoute((prev) => [...prev, command])}>+ {CORE_LABELS[command]}</button>)}</div>
      <div className="activity-actions"><Button onClick={run}>{running ? 'Stop route' : '▶ Run route'}</Button><Button variant="secondary" disabled={running} onClick={() => { runToken.current += 1; setRobot(CORE_WORLD.start); setCollected([]); setSwitchOn(false); setTrace([]); setSolved(false); setFeedback('NOVA reset to the start. Your instructions remain editable.') }}>Reset NOVA</Button></div>
    </div>
    <div className={`run-feedback ${solved ? 'feedback-success' : feedback.toLowerCase().includes('locked') || feedback.toLowerCase().includes('blocked') || feedback.toLowerCase().includes('leave') ? 'feedback-error' : ''}`} role="status"><span className="feedback-dot" />{feedback}</div>
    {trace.length > 0 && <div className="trace-panel"><div className="trace-heading"><span className="eyebrow">ROUTE TRACE</span><span>{trace.length} steps</span></div>{trace.slice(-5).map((step, i) => <div className="trace-line" key={`${step.blockIndex}-${i}`}><span>{String(step.blockIndex + 1).padStart(2, '0')}</span><p>{step.note}</p></div>)}</div>}
    {solved && <div className="success-panel"><Nova size={54} face="happy" /><div><strong>Central system restored.</strong><p>The repair worked because the program collected all required components and activated the switch before reaching the core.</p><SolvedActions onFinish={() => onComplete(challengeMode || extension)} onChallenge={!challengeMode ? () => { setExtension(true); setProgram([]); setSolved(false); setFeedback('Efficiency challenge: build the shortest route that collects all required items. Eight moves is the best possible route on this map.') } : undefined} challengeLabel="Build the shortest route" /></div></div>}
    <HintLine>Visit the access card at (3rd column, 3rd row), the battery near the top, the switch at the top right, then the core.</HintLine>
  </div>
}

const TOWER_META: Record<TowerStep, { label: string; detail: string }> = {
  CHECK_POWER: { label: 'Check power', detail: 'Confirm the central system is online.' },
  VERIFY_REPAIRS: { label: 'Verify repairs', detail: 'Confirm the repair record after power is checked.' },
  SEND_SIGNAL: { label: 'Send signal', detail: 'Transmit the recovered station record.' },
}

export function TowerActivity({ onComplete, challengeMode, teacherMode, progress }: ActivityProps) {
  const [sequence, setSequence] = useState<TowerStep[]>(challengeMode ? ['CHECK_POWER', 'SEND_SIGNAL', 'VERIFY_REPAIRS'] : ['SEND_SIGNAL', 'CHECK_POWER', 'VERIFY_REPAIRS'])
  const [log, setLog] = useState<string[]>([])
  const [solved, setSolved] = useState(false)
  const powerRestored = teacherMode || progress.completed.includes('central-system')
  useEffect(() => { setSequence(challengeMode ? ['CHECK_POWER', 'SEND_SIGNAL', 'VERIFY_REPAIRS'] : ['SEND_SIGNAL', 'CHECK_POWER', 'VERIFY_REPAIRS']); setLog([]); setSolved(false) }, [challengeMode])
  const move = (index: number, delta: number) => setSequence((prev) => { const next = [...prev]; const target = index + delta; if (target < 0 || target >= next.length) return prev; [next[index], next[target]] = [next[target], next[index]]; setLog([]); setSolved(false); return next })
  const run = () => { const result = interpretTowerSequence(sequence, powerRestored); setLog(result.log); setSolved(result.success) }
  return <div className="activity-stack">
    <div className="challenge-topline"><span className="eyebrow">TRANSMISSION SEQUENCER</span><StatusPill tone={powerRestored ? 'good' : 'warn'}>{powerRestored ? 'Core online' : 'Power not confirmed'}</StatusPill></div>
    <div className="tower-visual"><div className="tower-art"><div className={`tower-beacon ${solved ? 'beacon-on' : ''}`} /><div className="tower-mast" /><div className="tower-base" /></div><div className="tower-copy"><span className="eyebrow">OUTGOING TRANSMISSION</span><h3>{solved ? 'Signal restored.' : 'The sequence is scrambled.'}</h3><p>{solved ? 'A new message is arriving from the island archive.' : 'A safe system checks readiness before it verifies repairs and transmits.'}</p><div className="signal-meter"><div className={solved ? 'signal-meter-fill full' : 'signal-meter-fill'} /></div></div><Nova size={68} face={solved ? 'happy' : 'thinking'} /></div>
    <div className="builder-panel"><div className="builder-heading"><div><span className="eyebrow">REORDER THE PROCEDURE</span><h3>Transmission steps</h3></div><span className="block-count">3 steps</span></div>
      <div className="tower-sequence">{sequence.map((step, index) => <div className={`tower-step ${solved ? 'tower-step-done' : ''}`} key={step}><span className="step-number">{index + 1}</span><div className="tower-step-icon">{step === 'CHECK_POWER' ? 'ϟ' : step === 'VERIFY_REPAIRS' ? '✓' : '↗'}</div><div><strong>{TOWER_META[step].label}</strong><small>{TOWER_META[step].detail}</small></div><div className="block-controls"><button type="button" aria-label={`Move ${TOWER_META[step].label} up`} disabled={index === 0} onClick={() => move(index, -1)}>↑</button><button type="button" aria-label={`Move ${TOWER_META[step].label} down`} disabled={index === sequence.length - 1} onClick={() => move(index, 1)}>↓</button></div></div>)}</div>
      <div className="activity-actions"><Button onClick={run}>▶ Test sequence</Button><Button variant="secondary" onClick={() => { setSequence(['SEND_SIGNAL', 'CHECK_POWER', 'VERIFY_REPAIRS']); setLog([]); setSolved(false) }}>Reset sequence</Button></div>
    </div>
    {log.length > 0 && <div className="trace-panel"><div className="trace-heading"><span className="eyebrow">TRANSMISSION LOG</span><span>{log.length} events</span></div>{log.map((line, index) => <div className="trace-line" key={`${line}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><p>{line}</p></div>)}</div>}
    {solved && <div className="success-panel"><Nova size={54} face="happy" /><div><strong>We have a signal.</strong><p>The order matters: check power first, verify the repair record, and only then transmit.</p><SolvedActions onFinish={() => onComplete(challengeMode)} /></div></div>}
    <HintLine>The station’s records say the core is restored. That is evidence—but a safe sequence still verifies it before sending the signal.</HintLine>
  </div>
}

export function ChapterActivity({ chapterId, ...props }: ActivityProps & { chapterId: ChapterId }) {
  switch (chapterId) {
    case 'trail': return <TrailActivity {...props} />
    case 'laboratory': return <LaboratoryActivity {...props} />
    case 'factory': return <FactoryActivity {...props} />
    case 'control-room': return <ControlRoomActivity {...props} />
    case 'central-system': return <CentralSystemActivity {...props} />
    case 'tower': return <TowerActivity {...props} />
  }
}
