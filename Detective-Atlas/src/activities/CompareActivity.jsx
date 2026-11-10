import React from 'react';
import { GitCompareArrows } from 'lucide-react';

export default function CompareActivity({ config, value, onChange, disabled }) {
  return (
    <div className="act act-compare">
      <h3 className="act-question">{config.question}</h3>
      <div className="compare-grid">
        {config.examples.map((item) => <button key={item.id} className={`compare-card ${value?.choice === item.id ? 'on' : ''}`} onClick={() => onChange({ choice: item.id })} disabled={disabled}>
          <span className="compare-mark"><GitCompareArrows size={20} /></span>
          <b>{item.title}</b><p>{item.description}</p>
          {item.label && <small>{item.label}</small>}
        </button>)}
      </div>
    </div>
  );
}
