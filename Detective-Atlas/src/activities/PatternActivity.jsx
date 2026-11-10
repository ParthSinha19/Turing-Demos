import React from 'react';
import { Sym } from './visuals';

// config.mode: 'missing' (finish the sequence) | 'odd' (anomaly detection)
// value: { answer: optionId }
export default function PatternActivity({ config, value, onChange, disabled }) {
  const ans = value?.answer;
  const chosen = config.options.find((o) => o.id === ans);
  return (
    <div className={`act act-pattern mode-${config.mode}`} data-component="PatternActivity">
      {config.mode === 'missing' && (
        <div className="signal-strip">
          {config.sequence.map((s, i) => <div key={i} className={`sig-cell ${s ? '' : 'gap'}`}>{s ? <Sym {...s} /> : chosen ? <Sym {...chosen} /> : <span>?</span>}</div>)}
        </div>
      )}
      <div className={`sig-options ${config.mode === 'odd' ? 'grid' : ''}`}>
        {config.options.map((o) => <button key={o.id} data-option-id={o.id} className={`sig-opt ${ans === o.id ? 'on' : ''}`} onClick={() => onChange({ answer: o.id })} disabled={disabled}><Sym {...o} size={config.mode === 'odd' ? 56 : 46} /></button>)}
      </div>
    </div>
  );
}
