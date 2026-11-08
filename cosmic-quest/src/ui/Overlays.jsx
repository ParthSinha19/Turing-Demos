import { Ico } from '../ui/Ico.jsx';
import { useMemo } from 'react';
import { save, MODULES, PLANET_ORDER } from '../game/save.js';
import { flow, leaveMission, go, STORY, launch } from '../game/flow.js';
import { Btn } from './kit.jsx';

function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        l: Math.random() * 100,
        d: Math.random() * 1.8,
        t: 2.4 + Math.random() * 2,
        c: ['#ffd166', '#ff6b6b', '#4cc9f0', '#06d6a0', '#a66bff', '#fff'][i % 6],
        w: 6 + Math.random() * 8,
      })),
    []
  );
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <i key={i} style={{ left: `${b.l}%`, animationDelay: `${b.d}s`, animationDuration: `${b.t}s`, background: b.c, width: b.w, height: b.w * 1.6 }} />
      ))}
    </div>
  );
}

// Shown when a planet mission is complete: the reward and robot upgrade
export function RewardOverlay() {
  const f = flow.use();
  const s = save.use();
  if (!f.reward || f.reward === 'final') return null;
  const m = MODULES[f.reward];
  const idx = PLANET_ORDER.indexOf(f.reward);
  const next = PLANET_ORDER[idx + 1];
  return (
    <div className="reward">
      <Confetti />
      <div className="panel reward-card" role="dialog" aria-label="Mission complete">
        <small>MISSION COMPLETE</small>
        <h2>{STORY[f.reward].name} done!</h2>
        <div className="reward-icon"><Ico e={m.icon} /></div>
        <h3>You unlocked the {m.name}</h3>
        <p>{m.blurb}</p>
        <p className="muted">Look at {s.robot.name}: it has changed!</p>
        <div className="row">
          <Btn kind="good" onClick={leaveMission}>
            {next ? `On to ${STORY[next].name}` : 'Galaxy map'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

export function Certificate({ onClose }) {
  const s = save.use();
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div className="modal print-area" role="dialog" aria-label="Certificate">
      <div className="cert">
        <div className="cert-inner">
          <small>GALACTIC EXPLORATION ACADEMY</small>
          <h1>Galactic Explorer</h1>
          <p>This certificate is awarded to the robot explorer</p>
          <h2>{s.robot.name}</h2>
          <p>and their human crew-mate, for restoring the Galactic Network and teaching a robot to learn, plan, decide, recognise and discover.</p>
          <div className="cert-planets">
            {PLANET_ORDER.map((p) => (
              <span key={p}><Ico e={STORY[p].emoji} /><em>{STORY[p].name}</em></span>
            ))}
          </div>
          <p className="muted">{date}</p>
        </div>
        <div className="row no-print">
          <Btn onClick={() => window.print()}><Ico e="🖨️" /> Print</Btn>
          <Btn kind="ghost" onClick={onClose}>Close</Btn>
        </div>
      </div>
    </div>
  );
}

// The ending: network restored, robot with all its upgrades, certificate, revisit missions
export function Ending() {
  const f = flow.use();
  const s = save.use();
  const [cert, setCert] = [flow.get().cert, (v) => flow.set({ cert: v })];
  if (f.reward !== 'final') return null;
  return (
    <div className="reward ending">
      <Confetti />
      <div className="panel reward-card wide" role="dialog" aria-label="The Galactic Network is restored">
        <small>THE GALACTIC NETWORK IS BACK ONLINE</small>
        <h2>You did it, {s.robot.name} and you!</h2>
        <p>Every planet is shining again. {s.robot.name} learned from examples, planned routes, followed rules, recognised new things and discovered groups.</p>
        <div className="done-planets">
          {PLANET_ORDER.map((p) => (
            <button key={p} className="planet-pill done" onClick={() => { flow.set({ reward: null, screen: 'map', selected: p }); }}>
              <Ico e={STORY[p].emoji} /> <span>{STORY[p].name}</span> <Ico e="✓" />
            </button>
          ))}
        </div>
        <div className="row">
          <Btn kind="good" onClick={() => setCert(true)}><Ico e="🏅" /> Get my certificate</Btn>
          <Btn kind="ghost" onClick={() => flow.set({ reward: null, screen: 'map', selected: null })}><Ico e="🔁" /> Revisit missions</Btn>
        </div>
      </div>
      {f.cert && <Certificate onClose={() => setCert(false)} />}
    </div>
  );
}

export function ConfirmReset({ onYes, onNo }) {
  return (
    <div className="modal" role="alertdialog" aria-label="Start again?">
      <div className="panel tut">
        <h2>Start again?</h2>
        <p>This will delete your robot and all your planets. You cannot undo it.</p>
        <div className="row">
          <Btn kind="ghost" onClick={onNo}>No, keep playing</Btn>
          <Btn kind="danger" onClick={onYes}>Yes, delete everything</Btn>
        </div>
      </div>
    </div>
  );
}

export { go, launch };
