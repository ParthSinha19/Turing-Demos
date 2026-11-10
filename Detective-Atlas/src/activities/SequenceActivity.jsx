import React, { useState } from 'react';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import Glyph from '../components/Glyph';
import SelectActivity from './SelectActivity';

// config.kind: 'blocks' (code blocks) | 'records' (tickets with `meta`)
// value: { order: [blockId…] }  ·  starts in the order given by config.blocks
export default function SequenceActivity({ config, value, onChange, disabled }) {
  const order = value?.order || config.blocks.map((b) => b.id);
  const [drag, setDrag] = useState(null);
  const by = Object.fromEntries(config.blocks.map((b) => [b.id, b]));
  const move = (from, to) => {
    if (disabled || to < 0 || to >= order.length || from === to) return;
    const n = [...order]; const [x] = n.splice(from, 1); n.splice(to, 0, x); onChange({ ...value, order: n });
  };
  return (
    <>
    <ol className={`act act-sequence kind-${config.kind}`} data-component="SequenceActivity">
      {order.map((id, i) => {
        const b = by[id];
        return (
          <li key={id} draggable={!disabled} className={`seq-block ${drag === id ? 'dragging' : ''}`} data-block-id={id}
            onDragStart={(e) => { if (disabled) { e.preventDefault(); return; } setDrag(id); }} onDragEnd={() => setDrag(null)} onDragOver={(e) => { if (!disabled) e.preventDefault(); }}
            onDrop={() => !disabled && move(order.indexOf(drag), i)}>
            <GripVertical size={18} className="grip" />
            <span className="seq-n">{i + 1}</span>
            <span className="seq-ic"><Glyph name={b.glyph} size={20} /></span>
            <span className="seq-label">{b.label}</span>
            {b.meta && <span className="seq-meta">{b.meta}</span>}
            <span className="seq-btns">
              <button onClick={() => move(i, i - 1)} disabled={disabled || i === 0} aria-label="Move up"><ArrowUp size={16} /></button>
              <button onClick={() => move(i, i + 1)} disabled={disabled || i === order.length - 1} aria-label="Move down"><ArrowDown size={16} /></button>
            </span>
          </li>
        );
      })}
    </ol>
    {config.audit && <div className="sequence-audit"><h3>{config.audit.heading || 'Check the records too'}</h3><SelectActivity config={config.audit} value={{ selected: value?.auditSelected || [] }} onChange={({ selected }) => onChange({ ...value, auditSelected: selected })} disabled={disabled} /></div>}
    </>
  );
}
