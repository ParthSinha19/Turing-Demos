import React from 'react';
import SequenceActivity from './SequenceActivity';
import SelectActivity from './SelectActivity';

// A network investigation combines two existing reusable interactions:
// route the message, then audit the records travelling through that route.
export default function NetworkActivity({ config, value, onChange, disabled }) {
  return (
    <div className="act act-network">
      <section className="network-route">
        <h3 className="act-question">1. Route the message</h3>
        <p className="act-note">Arrange the relays from sender to receiver.</p>
        <SequenceActivity config={config.sequence} value={{ order: value?.order }} onChange={({ order }) => onChange({ ...value, order })} disabled={disabled} />
      </section>
      <section className="network-audit">
        <h3 className="act-question">2. Check the signal records</h3>
        <SelectActivity config={config.audit} value={{ selected: value?.selected || [] }} onChange={({ selected }) => onChange({ ...value, selected })} disabled={disabled} />
      </section>
    </div>
  );
}
