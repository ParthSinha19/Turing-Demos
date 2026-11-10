import React from 'react';
import { ArrowLeft, BookOpen, Network, Target, Sparkles } from 'lucide-react';
import Environment from '../components/Environment';
import Character from '../components/Characters';
import Hotspot from '../components/Hotspot';
import HintPanel from '../components/Hint';
import { DialogueStage } from '../components/Dialogue';
import { EvidenceCard, EvidenceTray } from '../components/Evidence';
import { HudPanel, HudButton, PipMeter } from '../components/Hud';
import ActivityShell from '../activities';
import { useGame } from '../state/GameContext';
import { getMission, MISSIONS } from '../data/missions';
import { EVIDENCE, CONCEPTS } from '../data/evidence';
import { GADGETS } from '../data/customise';

// One mission presentation serves every chapter. Interaction state is persisted
// in GameContext so a refresh can resume the active case.
export default function MissionScreen() {
  const { state, go, openOverlay, submitActivity, collectEvidence, completeMission, setMissionSession } = useGame();
  const m = getMission(state.activeMissionId);
  const session = state.missionSession?.missionId === m?.id
    ? state.missionSession
    : { phase: 'intro', value: null, status: 'idle', message: '', hintLevel: 0 };

  if (!m) {
    return <div className="screen mission" data-screen="MissionScreen"><div className="missing-case hud"><h2>Case file unavailable</h2><p>This investigation could not be loaded.</p><HudButton primary onClick={() => go('hq', { kind: 'none' })}>Return to headquarters</HudButton></div></div>;
  }

  const phase = session.phase || 'intro';
  const value = session.value;
  const status = session.status || 'idle';
  const submit = () => {
    const result = submitActivity(m.id, value);
    setMissionSession({ status: result.ok ? 'success' : 'retry', message: result.message });
  };
  const solved = () => completeMission(m.id);
  const reset = () => setMissionSession({ value: null, status: 'idle', message: '' });
  const leave = () => {
    const destination = m.cinematic && state.completed.includes(m.id) ? 'cinematic' : 'hq';
    go(destination, { kind: destination === 'cinematic' ? 'scan' : 'iris' });
  };
  const idx = MISSIONS.findIndex((item) => item.id === m.id);
  const conceptIds = [...new Set([m.concept, ...(m.concepts || [])].filter(Boolean))];

  return (
    <div className={`screen mission phase-${phase}`} data-screen="MissionScreen" data-mission-id={m.id} data-realm={m.realm}>
      <Environment id={m.env} glitch={m.glitch}>
        {phase === 'intro' && <DialogueStage lines={m.intro} companion={m.companion} onDone={() => setMissionSession({ phase: 'play' })} />}

        {phase !== 'intro' && phase !== 'complete' && (
          <>
            {m.sceneClues.map((clue) => {
              const evidence = EVIDENCE.find((item) => item.id === clue.evidenceId);
              const collected = state.evidence.includes(clue.evidenceId);
              return <Hotspot key={clue.id} id={clue.id} x={clue.x} y={clue.y} label={collected ? 'Collected' : clue.label} icon={evidence?.glyph || 'star'} className={collected ? 'done' : 'clue'} onClick={() => collectEvidence(clue.evidenceId)} />;
            })}
            <header className="hud-top mission-bar">
              <HudButton ghost small onClick={() => go('hq')}><ArrowLeft size={16} /> HQ</HudButton>
              <div className="hud mission-title"><small>Chapter {m.chapterLabel}</small><b>{m.title}</b></div>
              <div className="hud mission-prog"><small>Case {idx + 1} of {MISSIONS.length}</small><PipMeter total={MISSIONS.length} value={state.completed.length} /></div>
              <EvidenceTray ids={m.evidence} collected={state.evidence} />
              <div className="bar-btns">
                <button className="icon-btn hud" onClick={() => openOverlay('notebook')} aria-label="Notebook"><BookOpen size={20} /></button>
                <button className="icon-btn hud" onClick={() => openOverlay('board')} aria-label="Investigation board"><Network size={20} /></button>
              </div>
            </header>
            <div className="play-grid">
              <aside className="play-left">
                <HudPanel className="objective" tag="Objective" data-component="ObjectivePanel"><p><Target size={16} /> {m.objective}</p></HudPanel>
                <div className="spacer" />
                <HintPanel hints={m.hints} level={session.hintLevel || 0} onReveal={() => setMissionSession({ hintLevel: Math.min(m.hints.length, (session.hintLevel || 0) + 1) })} companion={m.companion === 'pip' ? 'pip' : 'fern'} />
                <div className="play-cast">
                  <Character id="detective" player={state.player} size={300} expression={status === 'success' ? 'happy' : status === 'retry' ? 'worried' : 'neutral'} />
                  <Character id={m.companion} size={m.companion === 'pip' ? 170 : 200} expression={status === 'success' ? 'happy' : status === 'retry' ? 'worried' : 'neutral'} flip />
                </div>
              </aside>
              <div className="play-right">
                {phase === 'play' && <ActivityShell
                  activity={m.activity}
                  value={value}
                  onChange={(next) => setMissionSession({ value: next, ...(status === 'retry' ? { status: 'idle', message: '' } : {}) })}
                  status={status}
                  message={session.message}
                  onSubmit={submit}
                  onReset={reset}
                  onSolved={solved}
                />}
              </div>
            </div>
          </>
        )}

        {phase === 'complete' && (
          <div className="reward" data-component="MissionComplete">
            <HudPanel className="reward-card" tag="Case file updated" title={m.ending ? 'The network is safe!' : 'Case solved!'}>
              <p className="reward-sum">{m.discovery}</p>
              <div className="reward-row">
                {m.evidence.map((id, index) => <EvidenceCard key={id} evidence={EVIDENCE.find((item) => item.id === id)} isNew style={{ animationDelay: `${0.25 + index * 0.25}s` }} />)}
              </div>
              {conceptIds.map((id) => CONCEPTS[id] && <div className="concept-chip" key={id}><Sparkles size={16} /><div><small>New in your notebook</small><b>{CONCEPTS[id].title}</b><span>{CONCEPTS[id].text}</span></div></div>)}
              {(m.gadgets || []).map((id) => { const gadget = GADGETS.find((item) => item.id === id); return gadget ? <div className="gadget-reward" key={id}><Sparkles size={18} /><div><small>Gadget unlocked</small><b>{gadget.label}</b><span>{gadget.blurb}</span></div></div> : null; })}
              {m.hqLevelAfter > 1 && state.hqJustExpanded && <p className="unlock-line">Your headquarters has been upgraded.</p>}
              {m.id === 'forest-5' && <p className="unlock-line">Space Wing unlocked — the same symbol has appeared beyond the forest.</p>}
              <footer className="reward-foot">
                <HudButton primary onClick={leave} data-id="continue-button">{m.leaveLabel || (m.cinematic ? 'Incoming transmission…' : m.ending ? 'Return to HQ' : 'Back to headquarters')}</HudButton>
              </footer>
            </HudPanel>
          </div>
        )}
      </Environment>
    </div>
  );
}
