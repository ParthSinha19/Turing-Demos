import React from 'react';
import { Check, Circle } from 'lucide-react';

export default function SelectActivity({ config, value, onChange, disabled }) {
  const selected = value?.selected || [];
  const toggle = (id) => onChange({ selected: selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id] });
  return (
    <div className="act act-select">
      <h3 className="act-question">{config.question}</h3>
      <p className="act-note">{config.note || 'Choose every clue that helps answer the question.'}</p>
      <div className="select-grid">
        {config.items.map((item) => {
          const on = selected.includes(item.id);
          return <button key={item.id} className={`select-card ${on ? 'on' : ''}`} onClick={() => toggle(item.id)} disabled={disabled} aria-pressed={on}>
            {on ? <Check size={19} /> : <Circle size={19} />}
            <span><b>{item.label}</b>{item.detail && <small>{item.detail}</small>}</span>
          </button>;
        })}
      </div>
      <div className="act-count">{selected.length} selected</div>
    </div>
  );
}
