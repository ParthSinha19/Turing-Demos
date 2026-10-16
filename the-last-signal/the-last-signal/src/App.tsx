import { useEffect, useMemo, useState } from 'react'
import { ChapterActivity } from './chapters/ChapterActivities'
import { IslandIllustration, Nova, SignalIcon } from './components/Illustrations'
import { Button, ProgressBar, StatusPill } from './components/Primitives'
import { CHAPTERS, CHAPTER_BY_ID, type ChapterId } from './data/chapters'
import { isChapterUnlocked, loadProgress, resetProgress, saveProgress, type GameProgress } from './state/progress'

type Screen = 'home' | 'map' | 'chapter' | 'completion' | 'epilogue'

function AppHeader({ onHome, onMap, screen, completedCount, teacherMode, onToggleTeacher }: {
  onHome: () => void; onMap: () => void; screen: Screen; completedCount: number; teacherMode: boolean; onToggleTeacher: () => void
}) {
  return <header className="app-header">
    <button type="button" className="brand-button" onClick={onHome} aria-label="The Last Signal home"><span className="brand-mark"><SignalIcon size={24} /></span><span className="brand-type"><strong>THE LAST SIGNAL</strong><small>NOVA FIELD OPERATIONS</small></span></button>
    <nav className="header-nav" aria-label="Main navigation"><button type="button" className={screen === 'home' ? 'nav-current' : ''} onClick={onHome}>Home</button><button type="button" className={screen === 'map' || screen === 'chapter' || screen === 'completion' || screen === 'epilogue' ? 'nav-current' : ''} onClick={onMap}>Island map</button><span className="nav-progress"><span className="nav-progress-dot" />{completedCount} / 6 restored</span><button type="button" className={`teacher-trigger ${teacherMode ? 'teacher-active' : ''}`} onClick={onToggleTeacher} aria-expanded={teacherMode} title="Open teacher controls"><span aria-hidden="true">⚙</span><span>Teacher mode</span></button></nav>
  </header>
}

function TeacherPanel({ enabled, onEnable, onDisable, onReset, onClose, onOpenChapter }: {
  enabled: boolean; onEnable: () => void; onDisable: () => void; onReset: () => void; onClose: () => void; onOpenChapter: (id: ChapterId) => void
}) {
  return <div className="teacher-shade" role="presentation" onClick={onClose}><section className="teacher-panel" role="dialog" aria-modal="true" aria-labelledby="teacher-title" onClick={(event) => event.stopPropagation()}>
    <div className="panel-heading"><div><span className="eyebrow">CLASSROOM TOOLS</span><h2 id="teacher-title">Teacher controls</h2></div><button type="button" className="close-button" onClick={onClose} aria-label="Close teacher controls">×</button></div>
    <p className="teacher-explainer">Preview activities, test later chapters, or recover a stuck session. These controls affect only this browser.</p>
    <div className="teacher-toggle-row"><div><strong>Testing mode</strong><small>Unlock every location for previewing.</small></div><button type="button" className={`switch ${enabled ? 'switch-on' : ''}`} aria-pressed={enabled} onClick={enabled ? onDisable : onEnable}><span /></button></div>
    {enabled && <div className="teacher-shortcuts"><strong>Jump to a chapter</strong><div className="teacher-chapter-grid">{CHAPTERS.map((chapter) => <button type="button" key={chapter.id} onClick={() => onOpenChapter(chapter.id)}>{chapter.number} <span>{chapter.shortTitle}</span><span aria-hidden="true">↗</span></button>)}</div></div>}
    <div className="teacher-foot"><p><strong>Local progress only.</strong> There is no central teacher dashboard or cross-device tracking.</p><Button variant="danger" onClick={onReset}>Reset all progress</Button></div>
  </section></div>
}

function HomeScreen({ progress, storageWarning, onBegin, onContinue, onPrediction }: {
  progress: GameProgress; storageWarning: boolean; onBegin: () => void; onContinue: () => void; onPrediction: (value: string) => void
}) {
  const [selectedClue, setSelectedClue] = useState<'update' | 'power' | null>(null)
  const selectedPrediction = progress.storyPrediction
  const hasProgress = progress.completed.length > 0 || Boolean(progress.storyPrediction) || progress.finished
  return <main className="home-screen page-wrap">
    <section className="hero-grid">
      <div className="hero-copy"><div className="hero-kicker"><span className="signal-pulse" /> INCOMING TRANSMISSION · 07:42 AM</div><h1>THE LAST <em>SIGNAL</em></h1><p className="hero-subtitle">One island. One failing system. <strong>Can you figure out what went wrong?</strong></p><p className="hero-description">A remote research station has gone quiet. Systems are failing, doors are locked, and the communications tower is losing power. You’re the junior engineer they called to help.</p>
        <div className="hero-actions"><Button onClick={onBegin}>Begin investigation <span aria-hidden="true">→</span></Button>{hasProgress && <Button variant="secondary" onClick={onContinue}>Continue investigation <span aria-hidden="true">↗</span></Button>}</div>
        <div className="hero-footnote"><span className="mini-check">✓</span> No account needed <span className="foot-divider">·</span> Progress saved on this device</div>
      </div>
      <div className="hero-art-wrap"><div className="art-card-top"><span><span className="online-dot" /> STATION TELEMETRY</span><span>ISLAND // 01</span></div><IslandIllustration /><div className="art-caption"><div className="nova-avatar-small"><Nova size={46} face="curious" /></div><div><strong>NOVA is ready.</strong><small>Exploration unit · Model 04</small></div><span className="status-live">AWAITING INPUT</span></div></div>
    </section>
    <section className="prologue-section"><div className="prologue-heading"><span className="story-index">PROLOGUE / 00</span><div><h2>A message with missing pieces.</h2><p>NOVA recovered two fragments from the station’s last transmission. Inspect them and make your first prediction.</p></div></div><div className="clue-grid">
      <button type="button" className={`clue-card ${selectedClue === 'update' ? 'clue-selected' : ''}`} onClick={() => setSelectedClue('update')}><span className="clue-stamp">FRAGMENT A</span><span className="clue-icon update-icon">⌘</span><strong>System update log</strong><p>“Automated repair sequence replaced…”</p><span className="clue-action">Inspect fragment <span>→</span></span></button>
      <button type="button" className={`clue-card ${selectedClue === 'power' ? 'clue-selected' : ''}`} onClick={() => setSelectedClue('power')}><span className="clue-stamp">FRAGMENT B</span><span className="clue-icon power-clue">ϟ</span><strong>Power monitor</strong><p>“Output falling. Backup cells unverified.”</p><span className="clue-action">Inspect fragment <span>→</span></span></button>
      <div className="prediction-card"><Nova size={54} face="thinking" /><div className="prediction-content"><span className="eyebrow">ENGINEER’S NOTE</span><strong>{selectedClue ? selectedClue === 'update' ? 'Fragment A inspected.' : 'Fragment B inspected.' : 'What caused the outage?'}</strong><p>{selectedClue ? selectedClue === 'update' ? 'The update log is incomplete. Keep it as evidence while you test your theory.' : 'The power monitor shows a symptom, but not necessarily the cause.' : 'Make a first prediction. You can change your mind as you collect evidence.'}</p><div className="prediction-options"><button type="button" className={selectedPrediction === 'update-theory' ? 'prediction-selected' : ''} onClick={() => onPrediction('update-theory')}>The update changed the instructions</button><button type="button" className={selectedPrediction === 'power-theory' ? 'prediction-selected' : ''} onClick={() => onPrediction('power-theory')}>The power cells failed</button></div><span className="prediction-status">{selectedPrediction ? `THEORY RECORDED · ${selectedPrediction === 'update-theory' ? 'SOFTWARE' : 'POWER'}` : 'WAITING FOR YOUR THEORY'}</span></div></div>
    </div></section>
    <section className="skills-strip"><div><span className="skill-symbol">↗</span><strong>Write instructions</strong><small>Build and test programs</small></div><div><span className="skill-symbol">{`{ }`}</span><strong>Think logically</strong><small>Variables and conditions</small></div><div><span className="skill-symbol">⌕</span><strong>Find the bug</strong><small>Trace what really happens</small></div><div><span className="skill-symbol">▦</span><strong>Test your rules</strong><small>Use evidence, not guesses</small></div></section>
    {storageWarning && <div className="storage-warning" role="status">Your browser blocked local storage. The adventure still works, but progress may not survive a refresh.</div>}
  </main>
}

const MAP_POSITIONS: Record<ChapterId, { left: string; top: string }> = {
  trail: { left: '13%', top: '65%' }, laboratory: { left: '31%', top: '43%' }, factory: { left: '47.5%', top: '63%' },
  'control-room': { left: '61%', top: '39%' }, 'central-system': { left: '74%', top: '59%' }, tower: { left: '86%', top: '27%' },
}

function MapIllustration() {
  return <svg className="map-illustration" viewBox="0 0 1000 500" role="img" aria-label="Map of an island with trails connecting research facilities">
    <rect width="1000" height="500" rx="26" fill="#d5e7d8" />
    <path d="M0 362q120 -40 238 0t232 -4t266 4t264 -5v143H0Z" fill="#8fc8bf" />
    <path d="M45 306Q22 225 98 166Q142 91 227 120Q296 61 371 112Q426 81 481 132Q576 84 631 153Q708 125 759 178Q851 182 889 246Q929 308 847 347Q769 389 686 355Q602 398 518 363Q433 397 355 362Q254 393 189 357Q88 383 45 306Z" fill="#a2bd8d" stroke="#658e79" strokeWidth="4" />
    <path d="M65 305Q169 247 246 258T375 210T511 250T640 224T837 270" fill="none" stroke="#ead6a1" strokeWidth="17" strokeLinecap="round" />
    <path d="M65 305Q169 247 246 258T375 210T511 250T640 224T837 270" fill="none" stroke="#b69b65" strokeWidth="2" strokeDasharray="5 10" />
    <path d="M246 258Q259 177 322 154Q371 142 375 210M511 250Q533 301 560 319Q623 327 686 355M640 224Q691 208 731 229T837 270" fill="none" stroke="#ead6a1" strokeWidth="12" strokeLinecap="round" />
    <g fill="#4d8468" stroke="#376c5b" strokeWidth="2"><path d="M101 204 118 167 135 204Z"/><path d="M120 224 142 174 164 224Z"/><path d="M151 195 169 153 187 195Z"/><path d="M178 232 195 191 212 232Z"/><path d="M224 164 243 120 262 164Z"/><path d="M271 202 292 157 313 202Z"/><path d="M324 324 345 279 366 324Z"/><path d="M389 334 410 289 431 334Z"/><path d="M725 320 746 275 767 320Z"/><path d="M789 318 808 277 827 318Z"/><path d="M845 302 862 264 879 302Z"/></g>
    <g transform="translate(420 175)"><rect width="77" height="55" rx="4" fill="#f5eddb" stroke="#466f67" strokeWidth="3"/><path d="M-6 5 38 -25 83 5Z" fill="#c87a56" stroke="#466f67" strokeWidth="3"/><rect x="12" y="18" width="17" height="18" fill="#7cb9b1"/><rect x="45" y="16" width="18" height="39" fill="#83a58e"/></g>
    <g transform="translate(766 139)"><path d="M18 6 4 103M18 6l14 97M7 83h22M10 63h17M13 42h11M4 103h28" stroke="#466f67" strokeWidth="4" strokeLinecap="round"/><circle cx="18" cy="5" r="6" fill="#d9aa60" stroke="#466f67" strokeWidth="2"/><path d="M3 -8q-13 13 0 25M33 -8q13 13 0 25" fill="none" stroke="#d9aa60" strokeWidth="3"/></g>
    <g fill="#f0e4bf" opacity=".8"><circle cx="576" cy="144" r="4"/><circle cx="600" cy="164" r="3"/><circle cx="652" cy="290" r="4"/><circle cx="296" cy="308" r="3"/></g>
  </svg>
}

function IslandMap({ progress, teacherMode, onOpen }: { progress: GameProgress; teacherMode: boolean; onOpen: (id: ChapterId) => void }) {
  const completedCount = progress.completed.length
  return <main className="map-screen page-wrap">
    <div className="page-heading-row"><div><span className="eyebrow">FIELD MAP // ISLAND 01</span><h1>Your investigation.</h1><p>Six locations. Every repair uncovers another part of the story.</p></div><div className="map-progress-card"><div><span className="eyebrow">STATION STATUS</span><strong>{completedCount === 6 ? 'All systems restored' : `${completedCount} of 6 systems restored`}</strong></div><ProgressBar value={completedCount / 6 * 100} /></div></div>
    {teacherMode && <div className="teacher-banner"><span aria-hidden="true">⚙</span><div><strong>Teacher testing mode is on</strong><p>All locations are available for preview. Turn it off to restore normal chapter locks.</p></div><StatusPill tone="warn">PREVIEW</StatusPill></div>}
    <div className="island-map-wrap"><div className="map-top-label"><span><span className="online-dot" /> LIVE ISLAND SCAN</span><span>6 LOCATIONS · NORTH ↑</span></div><div className="island-map-canvas"><MapIllustration /><svg className="route-overlay" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true"><path d="M130 325 C170 300 200 265 310 215 S410 250 475 315 S560 255 610 195 S690 245 740 295 S820 190 860 135" fill="none" stroke="#fff4d2" strokeWidth="5" strokeLinecap="round" strokeDasharray="9 11" opacity=".9"/></svg>
      {CHAPTERS.map((chapter) => {
        const complete = progress.completed.includes(chapter.id)
        const unlocked = isChapterUnlocked(chapter.id, progress.completed, teacherMode)
        return <button type="button" key={chapter.id} className={`map-node ${complete ? 'node-complete' : unlocked ? 'node-available' : 'node-locked'} ${progress.currentChapter === chapter.id && !complete ? 'node-current' : ''}`} style={MAP_POSITIONS[chapter.id]} disabled={!unlocked} onClick={() => onOpen(chapter.id)} aria-label={`${chapter.title}: ${complete ? 'completed, revisit' : unlocked ? 'available, open chapter' : 'locked'}`}>
          <span className="node-marker">{complete ? <span aria-hidden="true">✓</span> : unlocked ? <span>{chapter.number}</span> : <span aria-hidden="true">⌑</span>}</span><span className="node-caption"><strong>{chapter.shortTitle}</strong><small>{complete ? 'RESTORED' : unlocked ? `${chapter.duration} · READY` : 'LOCKED'}</small></span>
        </button>
      })}</div><div className="map-legend"><span><i className="legend-ready" /> Available</span><span><i className="legend-completed" /> Restored</span><span><i className="legend-locked" /> Locked</span><span className="map-legend-note">Tip: completed locations can be revisited.</span></div></div>
    <div className="map-bottom-row"><div className="map-story-note"><div className="map-note-icon"><Nova size={46} face="curious" /></div><div><span className="eyebrow">NOVA’S FIELD NOTE</span><strong>{completedCount === 0 ? 'We should start with the trail.' : completedCount < 6 ? 'Every fix gives us another clue.' : 'All records recovered.'}</strong><p>{completedCount === 0 ? 'The nearest signal marker is just beyond the overgrowth. I can navigate—but you have to write the instructions.' : completedCount < 6 ? 'The station’s failures are connected. Keep collecting logs and testing the repair procedures.' : 'The system is stable, the signal is back, and the mystery is solved.'}</p></div></div><div className="map-legend-box"><span className="eyebrow">MISSION OBJECTIVE</span><strong>Restore communications.</strong><p>Use computing and logic to uncover what went wrong.</p></div></div>
  </main>
}

function ChapterScreen({ chapterId, progress, teacherMode, challengeMode, onBack, onComplete }: {
  chapterId: ChapterId; progress: GameProgress; teacherMode: boolean; challengeMode: boolean; onBack: () => void; onComplete: (optional?: boolean) => void
}) {
  const chapter = CHAPTER_BY_ID[chapterId]
  const [hintIndex, setHintIndex] = useState(-1)
  const [showHint, setShowHint] = useState(false)
  const [showBrief, setShowBrief] = useState(true)
  const [activityKey, setActivityKey] = useState(0)
  const completedCount = progress.completed.length
  const progressPercent = completedCount / 6 * 100
  return <main className="chapter-screen page-wrap">
    <div className="chapter-topbar"><button type="button" className="back-link" onClick={onBack}><span aria-hidden="true">←</span> Island map</button><div className="chapter-top-progress"><span>INVESTIGATION PROGRESS</span><ProgressBar value={progressPercent} label={`${completedCount}/6`} /></div><button type="button" className="restart-chapter" onClick={() => { setActivityKey((key) => key + 1); setHintIndex(-1); setShowHint(false); setShowBrief(true) }} title="Reset this chapter's activity without clearing saved investigation progress">↻ Restart chapter</button><span className="chapter-duration">◷ {chapter.duration}</span></div>
    <div className="chapter-heading"><div className={`chapter-number chapter-accent-${chapter.accent}`}>{chapter.number}</div><div><span className="eyebrow">CHAPTER {chapter.number} / 06 {challengeMode ? '· ENGINEERING CHALLENGE' : ''}</span><h1>{chapter.title}</h1><p>{chapter.subtitle}</p></div><div className="chapter-concept"><span className="eyebrow">YOU’LL PRACTISE</span><strong>{chapter.concept}</strong></div></div>
    <div className="chapter-workspace">
      <aside className="mission-rail"><div className="mission-card"><div className="mission-label"><span className="mission-pin" /> MISSION BRIEF</div><div className="mission-nova"><Nova size={66} face="curious" /><span className="speech-tail" /></div><p className="mission-story">{chapter.brief}</p><div className="mission-rule" /><span className="eyebrow">YOUR OBJECTIVE</span><p className="mission-objective">{chapter.objective}</p><button className="brief-toggle" type="button" onClick={() => setShowBrief(!showBrief)} aria-expanded={showBrief}>{showBrief ? 'Hide field note' : 'Show field note'} <span>{showBrief ? '−' : '+'}</span></button>{showBrief && <div className="mission-field-note"><span aria-hidden="true">⌁</span><p>{chapter.id === 'tower' ? 'A final check is not paperwork. It is part of the system.' : chapter.id === 'factory' ? 'A rule is only useful when it works on more than the easy examples.' : 'Experiment freely. A failed run is information, not a penalty.'}</p></div>}</div>
        <div className={`hint-card ${showHint ? 'hint-expanded' : ''}`}><div className="hint-card-heading"><div className="hint-icon">✳</div><div><strong>Need a nudge?</strong><small>{hintIndex < 0 ? 'Hints reveal one step at a time.' : `Hint ${hintIndex + 1} of 3`}</small></div></div>{showHint && <p className="hint-text">{chapter.hints[Math.max(0, hintIndex)]}</p>}<Button variant="secondary" onClick={() => { setShowHint(true); setHintIndex((prev) => prev >= 2 ? 0 : prev + 1) }}>{!showHint ? 'Show hint' : hintIndex === 2 ? 'Start hints again' : 'Another hint'} <span aria-hidden="true">→</span></Button></div>
        <div className="chapter-checklist"><span className="eyebrow">FIELD CHECKLIST</span><div><span className="check-empty">{progress.completed.includes(chapterId) ? '✓' : '1'}</span><span>{progress.completed.includes(chapterId) ? 'Chapter restored' : 'Experiment and test'}</span></div><div><span className="check-empty">{progress.completed.includes(chapterId) ? '✓' : '2'}</span><span>{progress.completed.includes(chapterId) ? 'Clue added to archive' : 'Find a working solution'}</span></div></div>
      </aside>
      <section className="activity-card"><div className="activity-card-top"><div><span className="eyebrow">INTERACTIVE WORKSPACE</span><strong>{challengeMode ? 'Engineering challenge' : 'Test bench'}</strong></div><span className="workspace-status"><i /> LOCAL SIMULATION</span></div><ChapterActivity key={activityKey} chapterId={chapterId} progress={progress} teacherMode={teacherMode} challengeMode={challengeMode} onComplete={onComplete} /></section>
    </div>
  </main>
}

function CompletionScreen({ chapterId, progress, onMap, onTryChallenge }: { chapterId: ChapterId; progress: GameProgress; onMap: () => void; onTryChallenge: () => void }) {
  const chapter = CHAPTER_BY_ID[chapterId]
  return <main className="completion-screen page-wrap"><div className="completion-card"><div className="completion-top-art"><div className="completion-stamp"><span>✓</span></div><div className="completion-scenery"><div className="sun-disc" /><div className="hill hill-one" /><div className="hill hill-two" /><div className="completion-signal-tower"><span /></div><Nova size={84} face="happy" /></div><span className="completion-label">SYSTEM REPAIRED · CHAPTER {chapter.number}</span></div><div className="completion-body"><span className="eyebrow">FIELD REPORT ADDED</span><h1>{chapter.title} <em>restored.</em></h1><p className="completion-story">{chapter.completion}</p><div className="completion-learning"><div className="learning-icon">✦</div><div><span className="eyebrow">WHAT YOU PRACTISED</span><strong>{chapter.concept}</strong><p>{chapter.learning}</p></div></div><div className="completion-clue"><span className="clue-pin">⌕</span><div><span className="eyebrow">NEW CLUE IN THE ARCHIVE</span><strong>{chapterId === 'trail' ? 'The update changed the station’s instructions.' : chapterId === 'laboratory' ? 'The access log shows a condition was changed.' : chapterId === 'factory' ? 'The battery sorter used colour as its only rule.' : chapterId === 'control-room' ? 'The relay program checked requirements in the wrong order.' : 'The core only restored power after every condition was met.'}</strong></div></div><div className="completion-actions"><Button onClick={onMap}>Return to island map <span aria-hidden="true">→</span></Button><Button variant="secondary" onClick={onTryChallenge}>Try an engineering challenge</Button></div><p className="completion-progress">{progress.completed.length} of 6 chapters restored · You can revisit any completed location.</p></div></div></main>
}

function EpilogueScreen({ progress, onSave, onMap, teacherPreview = false }: { progress: GameProgress; onSave: (key: 'reflectionError' | 'reflectionFix', value: string) => void; onMap: () => void; teacherPreview?: boolean }) {
  return <main className="epilogue-screen page-wrap"><div className="epilogue-hero"><div className="epilogue-copy"><span className="eyebrow"><span className="online-dot" /> FINAL TRANSMISSION RECEIVED</span><h1>The last signal<br /><em>was a warning.</em></h1><p>“To whoever finds this: the station did not fail all at once. An update changed the order of our repair checks. We trusted the output without tracing the instructions.”</p><div className="epilogue-signoff"><Nova size={62} face="happy" /><div><strong>NOVA // Investigation complete</strong><small>{progress.completed.length} of 6 locations restored · Station archive recovered</small></div></div></div><div className="epilogue-art"><IslandIllustration compact /><div className="transmission-badge"><SignalIcon size={22} /><span>TRANSMISSION<br /><strong>STABLE</strong></span></div></div></div>
    <div className="theory-reveal"><div><span className="eyebrow">YOUR FIRST THEORY</span><strong>{progress.storyPrediction === 'update-theory' ? 'The update changed the instructions' : progress.storyPrediction === 'power-theory' ? 'The power cells failed' : 'No theory was recorded'}</strong></div><div><StatusPill tone={progress.storyPrediction === 'update-theory' ? 'good' : 'neutral'}>{progress.storyPrediction === 'update-theory' ? 'SUPPORTED BY THE EVIDENCE' : progress.storyPrediction === 'power-theory' ? 'A REAL SYMPTOM, NOT THE ROOT CAUSE' : 'EVIDENCE RECOVERED'}</StatusPill><p>{progress.storyPrediction === 'power-theory' ? 'The power dip was real, but damaged batteries and a faulty sequence were symptoms. The update had changed the instructions the station used to respond.' : 'The update log, the colour-only battery rule, and the relay trace all point to the same root cause: incorrect automated instructions.'}</p></div></div>
    <div className="truth-section"><div className="truth-heading"><span className="eyebrow">THE EVIDENCE, CONNECTED</span><h2>What really happened?</h2><p>The clues were small, but they pointed to the same problem.</p></div><div className="truth-timeline">{[{ n: '01', title: 'A changed instruction', text: 'The trail note and update log showed that the automated procedure had been replaced.' }, { n: '02', title: 'A rule that looked right', text: 'The factory trusted battery colour, while the control room trusted a condition that did not check everything.' }, { n: '03', title: 'Checks in the wrong order', text: 'The relay and core stayed offline until their programs checked real state in the correct sequence.' }].map((item) => <div className="truth-step" key={item.n}><span>{item.n}</span><div><strong>{item.title}</strong><p>{item.text}</p></div></div>)}</div></div>
    <div className="archive-section"><div><span className="eyebrow">INVESTIGATION ARCHIVE</span><strong>Recovered chapter files</strong></div><div className="archive-grid">{CHAPTERS.map((chapter) => { const done = progress.completed.includes(chapter.id); return <div className={`archive-item ${done ? 'archive-done' : 'archive-skipped'}`} key={chapter.id}><span>{done ? '✓' : '—'}</span><div><strong>{chapter.shortTitle}</strong><small>{done ? 'FILE RECOVERED' : 'NOT COMPLETED IN THIS SESSION'}</small></div></div> })}</div></div>
    <div className="reflection-section"><div><span className="eyebrow">ENGINEER’S DEBRIEF</span><h2>Explain your fix.</h2><p>There is no automatic grading. Use your own words to record what you figured out.</p><div className="reflection-prompts"><label htmlFor="reflection-error">The robot or system failed because…</label><textarea id="reflection-error" rows={3} value={progress.reflectionError} disabled={teacherPreview} onChange={(event) => onSave('reflectionError', event.target.value)} placeholder="I noticed that the program…" /><label htmlFor="reflection-fix">I fixed it by…</label><textarea id="reflection-fix" rows={3} value={progress.reflectionFix} disabled={teacherPreview} onChange={(event) => onSave('reflectionFix', event.target.value)} placeholder="I changed the instructions so that…" /><span className="saved-note">{teacherPreview ? 'Teacher preview · reflections are read-only' : '✓ Saved on this device'}</span></div></div><div className="reflection-summary"><Nova size={82} face="thinking" /><span className="eyebrow">YOUR ENGINEERING TOOLKIT</span><h3>Take these skills with you.</h3><ul><li>Break a big task into precise steps.</li><li>Use conditions that match the real requirements.</li><li>Test rules against difficult examples.</li><li>Trace, debug, and explain your changes.</li></ul><Button onClick={onMap}>Return to the island map <span aria-hidden="true">→</span></Button></div></div>
  </main>
}

export default function App() {
  const [progress, setProgress] = useState<GameProgress>(() => loadProgress())
  const [activeChapter, setActiveChapter] = useState<ChapterId>(() => progress.currentChapter)
  const [screen, setScreen] = useState<Screen>('home')
  const [teacherPanelOpen, setTeacherPanelOpen] = useState(false)
  const [teacherMode, setTeacherMode] = useState(false)
  const [challengeMode, setChallengeMode] = useState(false)
  const [completedChapter, setCompletedChapter] = useState<ChapterId>('trail')
  const [storageWarning, setStorageWarning] = useState(false)
  const doneSet = useMemo(() => new Set(progress.completed), [progress.completed])

  useEffect(() => { setStorageWarning(!saveProgress(progress)) }, [progress])

  const goHome = () => setScreen('home')
  const goMap = () => { setChallengeMode(false); setScreen('map') }
  const openChapter = (id: ChapterId, challenge = false) => {
    setActiveChapter(id)
    if (!teacherMode) setProgress((prev) => ({ ...prev, currentChapter: id }))
    setChallengeMode(challenge)
    setScreen('chapter')
    setTeacherPanelOpen(false)
  }
  const handleComplete = (optional = false) => {
    const id = activeChapter
    if (!teacherMode) {
      const updated: GameProgress = {
        ...progress,
        currentChapter: id,
        completed: progress.completed.includes(id) ? progress.completed : [...progress.completed, id],
        optionalCompleted: optional && !progress.optionalCompleted.includes(id) ? [...progress.optionalCompleted, id] : progress.optionalCompleted,
        finished: id === 'tower' ? true : progress.finished,
      }
      setProgress(updated)
    }
    setCompletedChapter(id)
    setChallengeMode(false)
    setScreen(id === 'tower' ? 'epilogue' : 'completion')
  }
  const updateReflection = (key: 'reflectionError' | 'reflectionFix', value: string) => { if (!teacherMode) setProgress((prev) => ({ ...prev, [key]: value })) }
  const handleReset = () => {
    if (!window.confirm('Reset the entire investigation on this device? This will remove all saved chapter progress and reflections.')) return
    resetProgress()
    const reset = loadProgress()
    setProgress(reset)
    setActiveChapter(reset.currentChapter)
    setTeacherMode(false)
    setTeacherPanelOpen(false)
    setScreen('home')
    setChallengeMode(false)
  }
  const begin = () => { const next = progress.completed.includes('trail') ? progress.currentChapter : 'trail'; setProgress((prev) => ({ ...prev, currentChapter: next })); setActiveChapter(next); setScreen('map') }
  const continueGame = () => { setActiveChapter(progress.currentChapter); setChallengeMode(false); setScreen('map') }

  return <div className="app-shell">
    <AppHeader onHome={goHome} onMap={goMap} screen={screen} completedCount={doneSet.size} teacherMode={teacherMode} onToggleTeacher={() => setTeacherPanelOpen((prev) => !prev)} />
    {screen === 'home' && <HomeScreen progress={progress} storageWarning={storageWarning} onBegin={begin} onContinue={continueGame} onPrediction={(value) => setProgress((prev) => ({ ...prev, storyPrediction: value }))} />}
    {screen === 'map' && <IslandMap progress={progress} teacherMode={teacherMode} onOpen={(id) => openChapter(id)} />}
    {screen === 'chapter' && <ChapterScreen key={activeChapter} chapterId={activeChapter} progress={progress} teacherMode={teacherMode} challengeMode={challengeMode} onBack={goMap} onComplete={handleComplete} />}
    {screen === 'completion' && <CompletionScreen chapterId={completedChapter} progress={progress} onMap={goMap} onTryChallenge={() => openChapter(completedChapter, true)} />}
    {screen === 'epilogue' && <EpilogueScreen progress={progress} onSave={updateReflection} onMap={goMap} teacherPreview={teacherMode} />}
    <footer className="app-footer"><button type="button" onClick={goHome} className="footer-brand"><span className="brand-mark small"><SignalIcon size={18} /></span> THE LAST SIGNAL</button><span>Built for curious minds. Powered by good questions.</span><button type="button" onClick={() => setTeacherPanelOpen(true)}>Teacher controls</button></footer>
    {teacherPanelOpen && <TeacherPanel enabled={teacherMode} onEnable={() => setTeacherMode(true)} onDisable={() => { setTeacherMode(false); setTeacherPanelOpen(false); setChallengeMode(false); setActiveChapter(progress.currentChapter); setScreen('map') }} onClose={() => setTeacherPanelOpen(false)} onReset={handleReset} onOpenChapter={(id) => openChapter(id)} />}
  </div>
}
