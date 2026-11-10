import React from 'react';
import { Bug, Wrench } from 'lucide-react';

export default function DebugActivity({ config, value, onChange, disabled }) {
  return (
    <div className="act act-debug">
      <div className="debug-problem"><Bug size={22} /><div><b>{config.problemTitle}</b><p>{config.problem}</p></div></div>
      <div className="debug-line"><code>{config.broken}</code><span>← incorrect instruction</span></div>
      <h3 className="act-question">{config.question}</h3>
      <div className="debug-options">
        {config.options.map((option) => <button key={option.id} className={value?.fixId === option.id ? 'on' : ''} onClick={() => onChange({ fixId: option.id })} disabled={disabled}><Wrench size={17} /><span>{option.label}</span></button>)}
      </div>
    </div>
  );
}
