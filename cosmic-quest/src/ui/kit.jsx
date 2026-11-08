import { Ico } from '../ui/Ico.jsx';
import { useEffect, useState } from 'react';
import { save, PALETTES, MODULES, PLANET_ORDER, patch } from '../game/save.js';
import { flow, leaveMission, STORY } from '../game/flow.js';
import { sfx, speak } from '../game/sound.js';

export function Btn({ children, kind = '', onClick, sound = 'click', ...p }) {
  return (
    <button
      className={`btn ${kind}`}
      onClick={(e) => {
        sfx(sound);
        onClick && onClick(e);
      }}
      {...p}
    >
      {children}
    </button>
  );
}

// Round robot portrait drawn with CSS, using the player's real colours
export function RobotFace({ size = 64 }) {
  const s = save.use();
  const pal = PALETTES[s.robot.palette] || PALETTES[0];
  const sq = s.robot.head === 'visor' || s.robot.head === 'screen';
  return (
    <div className="face" style={{ width: size, height: size, background: pal.c1, borderRadius: sq ? '22%' : '50%', borderColor: pal.c2 }}>
      <div className="face-screen">
        <i />
        <i />
      </div>
    </div>
  );
}

export function Speech({ text }) {
  useEffect(() => {
    if (text) speak(text);
  }, [text]);
  if (!text) return null;
  return (
    <div className="speech panel" role="status" aria-live="polite">
      <RobotFace size={58} />
      <div>
        <b>{save.get().robot.name || 'Robot'}</b>
        <p>{text}</p>
      </div>
    </div>
  );
}

export function Tutorial({ steps, onClose, title = 'How to play' }) {
  return (
    <div className="modal" role="dialog" aria-label={title}>
      <div className="panel tut">
        <h2>{title}</h2>
        <div className="tut-steps">
          {steps.map((s, i) => (
            <div key={i} className="tut-step" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="tut-icon"><Ico e={s.icon} /></div>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
        <Btn onClick={onClose}>Got it!</Btn>
      </div>
    </div>
  );
}

export function SettingsButtons() {
  const s = save.use();
  return (
    <>
      <button className="icon-btn" aria-label={s.muted ? 'Turn sound on' : 'Turn sound off'} title="Sound" onClick={() => patch({ muted: !s.muted })}>
        {s.muted ? <Ico e="🔇" /> : <Ico e="🔊" />}
      </button>
      <button className={`icon-btn ${s.speech ? 'on' : ''}`} aria-label="Read the robot's words aloud" title="Read aloud" onClick={() => patch({ speech: !s.speech })}>
        <Ico e="🗣️" />
      </button>
      <button className={`icon-btn ${s.low ? 'on' : ''}`} aria-label="Lower picture quality for slower computers" title={s.low ? 'Low quality (on)' : 'Low quality'} onClick={() => patch({ low: !s.low })}>
        <Ico e="🐢" />
      </button>
    </>
  );
}

// Mission frame: planet chip, objective, steps, help, robot speech and action dock
export function Shell({ id, objective, steps = [], step = 0, say, tutorial, children }) {
  const [help, setHelp] = useState(false);
  const info = STORY[id];
  return (
    <>
      <div className="hud-tl">
        <div className="panel chip-planet">
          <span className="big-emoji"><Ico e={info.emoji} /></span>
          <div>
            <b>{info.name}</b>
            <small>{info.title}</small>
          </div>
        </div>
        {objective && (
          <div className="panel objective">
            <span><Ico e="🎯" /></span> {objective}
          </div>
        )}
        {steps.length > 0 && (
          <div className="steps" aria-label="Progress">
            {steps.map((s, i) => (
              <span key={s} className={i < step ? 'done' : i === step ? 'now' : ''} title={s}>
                {i < step ? <Ico e="✓" /> : i + 1}
                <em>{s}</em>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="hud-tr">
        {tutorial && (
          <button className="icon-btn" aria-label="Help" title="Help" onClick={() => setHelp(true)}>
            <Ico e="❓" />
          </button>
        )}
        <SettingsButtons />
        <button className="btn ghost small" onClick={() => { sfx('click'); leaveMission(); }}>
          <Ico e="🪐" /> Galaxy
        </button>
      </div>
      <div className="bottom">
        <Speech text={say} />
        <div className="dock">{children}</div>
      </div>
      {help && tutorial && <Tutorial steps={tutorial} onClose={() => setHelp(false)} />}
    </>
  );
}

export function ProgressBar({ value, max = 1, label }) {
  return (
    <div className="pbar" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
      <div style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}

export function RobotChip() {
  const s = save.use();
  return (
    <div className="panel robot-chip">
      <RobotFace size={46} />
      <div>
        <b>{s.robot.name}</b>
        <div className="mods">
          {PLANET_ORDER.map((p) => (
            <span key={p} className={s.completed[p] ? 'got' : ''} title={MODULES[p].name}>
              {s.completed[p] ? <Ico e={MODULES[p].icon} /> : '•'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export { flow };
