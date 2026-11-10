import React from 'react';
import { Telescope } from 'lucide-react';

export default function PredictActivity({ config, value, onChange, disabled }) {
  return (
    <div className="act act-predict">
      <div className="prediction-observations"><Telescope size={22} /><div><b>What the records show</b><ul>{config.observations.map((item, index) => <li key={index}>{item}</li>)}</ul></div></div>
      <h3 className="act-question">{config.question}</h3>
      <div className="choice-grid">
        {config.options.map((item) => <button key={item.id} className={`choice-card ${value?.answer === item.id ? 'on' : ''}`} onClick={() => onChange({ answer: item.id })} disabled={disabled}>
          <b>{item.label}</b>{item.detail && <span>{item.detail}</span>}
        </button>)}
      </div>
      <p className="act-note">A prediction is a reasoned guess. It is not a fact until it is checked.</p>
    </div>
  );
}
