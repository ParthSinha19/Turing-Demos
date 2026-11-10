import React from 'react';
import { ListChecks, Terminal } from 'lucide-react';
import SequenceActivity from './SequenceActivity';
import TypeActivity from './TypeActivity';

// Composite activity: follow a safe process in order, then enter the corrected command.
export default function ProcessActivity({ config, value, onChange, disabled }) {
  return (
    <div className="act act-process" data-component="ProcessActivity">
      <section className="process-steps">
        <h3 className="act-question"><ListChecks size={18} /> 1. Put the safety instructions in order</h3>
        <p className="act-note">A machine should follow its checks in the right order before a door opens.</p>
        <SequenceActivity
          config={config.sequence}
          value={{ order: value?.order }}
          onChange={({ order }) => onChange({ ...value, order })}
          disabled={disabled}
        />
      </section>
      <section className="process-command">
        <h3 className="act-question"><Terminal size={18} /> 2. Repair the command</h3>
        <TypeActivity
          config={config.command}
          value={{ text: value?.text || '' }}
          onChange={({ text }) => onChange({ ...value, text })}
          disabled={disabled}
        />
      </section>
    </div>
  );
}
