import React from 'react';
import { RotateCcw, ArrowRight, ShieldQuestion } from 'lucide-react';
import { HudButton } from '../components/Hud';
import { FeedbackBanner } from '../components/Feedback';
import ClassifyActivity from './ClassifyActivity';
import SequenceActivity from './SequenceActivity';
import MatchActivity from './MatchActivity';
import PromptActivity from './PromptActivity';
import PatternActivity from './PatternActivity';
import TypeActivity from './TypeActivity';
import ChoiceActivity from './ChoiceActivity';
import SelectActivity from './SelectActivity';
import CompareActivity from './CompareActivity';
import PredictActivity from './PredictActivity';
import DebugActivity from './DebugActivity';
import NetworkActivity from './NetworkActivity';
import TrainingActivity from './TrainingActivity';
import ProcessActivity from './ProcessActivity';

// The registry is the only place the mission shell needs to know activity UI.
// Each activity receives { config, value, onChange, status, disabled }.
export const ACTIVITY_TYPES = {
  classify: { label: 'Sort & Classify', Body: ClassifyActivity },
  sequence: { label: 'Order & Sequence', Body: SequenceActivity },
  match: { label: 'Match Records', Body: MatchActivity },
  prompt: { label: 'Talk to the AI', Body: PromptActivity },
  pattern: { label: 'Find the Pattern', Body: PatternActivity },
  type: { label: 'Debug Console', Body: TypeActivity },
  choice: { label: 'Identify the Clue', Body: ChoiceActivity },
  select: { label: 'Select Useful Information', Body: SelectActivity },
  compare: { label: 'Compare Examples', Body: CompareActivity },
  predict: { label: 'Test a Prediction', Body: PredictActivity },
  debug: { label: 'Repair the System', Body: DebugActivity },
  network: { label: 'Route & Audit Signals', Body: NetworkActivity },
  train: { label: 'Train & Test the AI', Body: TrainingActivity },
  process: { label: 'Follow & Debug a Process', Body: ProcessActivity },
};

function Unknown({ type }) { return <div className="act"><ShieldQuestion /> Unknown activity type “{type}”.</div>; }

export default function ActivityShell({ activity, value, onChange, status, message, onSubmit, onReset, onSolved }) {
  const def = ACTIVITY_TYPES[activity.type];
  const Body = def?.Body;
  return (
    <section className="hud workspace" id={`workspace-${activity.id}`} data-component="ActivityShell" data-activity-type={activity.type}>
      <header className="ws-head">
        <span className="hud-tag">{def?.label || activity.type}</span>
        <h2>{activity.title}</h2>
        <p>{activity.instruction}</p>
      </header>
      <div className="ws-body">{Body ? <Body config={activity.config} value={value} onChange={onChange} status={status} disabled={status === 'success'} /> : <Unknown type={activity.type} />}</div>
      <FeedbackBanner status={status} message={message} />
      <footer className="ws-foot">
        <HudButton ghost small onClick={onReset} disabled={status === 'success'}><RotateCcw size={16} /> Reset</HudButton>
        {status === 'success'
          ? <HudButton primary onClick={onSolved} data-id="solved-button">Case solved <ArrowRight size={18} /></HudButton>
          : <HudButton primary onClick={onSubmit} data-id="check-button">Check answer</HudButton>}
      </footer>
    </section>
  );
}
