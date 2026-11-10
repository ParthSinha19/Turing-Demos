import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import Glyph from '../components/Glyph';

export default function ChoiceActivity({ config, value, onChange, disabled }) {
  return (
    <div className="act act-choice">
      <h3 className="act-question">{config.question}</h3>
      <div className="choice-grid">
        {config.options.map((option) => (
          <button key={option.id} className={`choice-card ${value?.choice === option.id ? 'on' : ''}`} onClick={() => onChange({ choice: option.id })} disabled={disabled}>
            {option.glyph && <Glyph name={option.glyph} size={24} />}
            <b>{option.label || option.text}</b>
            {option.detail && <span>{option.detail}</span>}
            {value?.choice === option.id && <CheckCircle2 size={18} className="choice-check" />}
          </button>
        ))}
      </div>
    </div>
  );
}
