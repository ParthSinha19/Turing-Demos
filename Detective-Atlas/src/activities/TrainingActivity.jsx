import React from 'react';
import { BrainCircuit, CheckCircle2 } from 'lucide-react';
import Character from '../components/Characters';
import { SpecimenVisual } from './visuals';
import ClassifyActivity from './ClassifyActivity';
import ChoiceActivity from './ChoiceActivity';

// A child labels useful examples first. Only after every example has been
// supplied does the simulated AI attempt a new specimen.
export default function TrainingActivity({ config, value, onChange, disabled }) {
  const placements = value?.placements || {};
  const trained = config.examples.items.every((item) => Boolean(placements[item.id]));
  const setExamples = ({ placements: next }) => onChange({ ...value, placements: next });
  const setPrediction = ({ choice }) => onChange({ ...value, prediction: choice });

  return (
    <div className="act act-training" data-component="TrainingActivity">
      <div className={`training-ai ${trained ? 'trained' : ''}`}>
        <Character id="forest" size={70} bust expression={trained ? 'happy' : 'thinking'} />
        <div>
          <b><BrainCircuit size={16} /> F.O.R.E.S.T. learning log</b>
          <p>{trained
            ? 'Examples saved! I can now compare a new footprint with the features you showed me.'
            : `I have ${Object.keys(placements).length} of ${config.examples.items.length} labelled examples. Please teach me where each one belongs.`}</p>
        </div>
      </div>
      <section className="training-examples">
        <h3 className="act-question">1. Teach me with labelled examples</h3>
        <p className="act-note">Look at the toes, claws and shape. Choose the group that matches each print.</p>
        <ClassifyActivity config={config.examples} value={{ placements }} onChange={setExamples} disabled={disabled} />
      </section>
      {trained && (
        <section className="training-challenge">
          <div className="training-ready"><CheckCircle2 size={18} /> Training examples complete</div>
          <h3 className="act-question">2. Try a new footprint</h3>
          <p className="act-note">F.O.R.E.S.T. has not seen this print before. Compare its features with the examples. What should it predict?</p>
          <div className="training-specimen">
            <SpecimenVisual visual={config.challenge.item.visual} size={86} />
            <div><b>{config.challenge.item.name}</b><ul>{config.challenge.item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></div>
          </div>
          <ChoiceActivity
            config={config.challenge}
            value={{ choice: value?.prediction }}
            onChange={setPrediction}
            disabled={disabled}
          />
          {value?.prediction && <p className="training-prediction">F.O.R.E.S.T. will compare this guess with the evidence when you check your answer.</p>}
        </section>
      )}
    </div>
  );
}
