import React from 'react';

// value: { text }
export default function TypeActivity({ config, value, onChange, disabled }) {
  return (
    <div className="act act-type" data-component="TypeActivity">
      <pre className="console-log">{config.log.join('\n')}</pre>
      <label className="console-in"><span>{config.prompt}</span>
        <div><b>&gt;</b><input data-id="type-input" value={value?.text || ''} placeholder={config.placeholder} spellCheck="false" autoComplete="off" disabled={disabled} onChange={(e) => onChange({ text: e.target.value })} /></div>
      </label>
    </div>
  );
}
