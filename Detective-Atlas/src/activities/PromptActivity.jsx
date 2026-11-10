import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Character from '../components/Characters';
import { useGame } from '../state/GameContext';

// value: { slots: { [slotId]: optionId }, review?: optionId }
export default function PromptActivity({ config, value, onChange, status, disabled }) {
  const { state } = useGame();
  const slots = value?.slots || {};
  const [open, setOpen] = useState(config.slots[0]?.id);
  const slot = config.slots.find((item) => item.id === open) || config.slots[0];
  const allFilled = config.slots.every((item) => Boolean(slots[item.id]));
  const set = (sid, oid) => {
    onChange({ ...value, slots: { ...slots, [sid]: oid } });
    const next = config.slots.find((item) => !slots[item.id] && item.id !== sid);
    if (next) setOpen(next.id);
  };
  const response = allFilled ? config.responseRules?.find((rule) => Object.entries(rule.when || {}).every(([id, optionId]) => slots[id] === optionId)) : null;
  const reply = response?.reply || config.defaultReply || config.aiReply;
  return (
    <div className="act act-prompt" data-component="PromptActivity">
      <div className="chat">
        <div className="bubble ai"><Character id={config.aiId} size={54} bust expression="neutral" /><p>{config.aiMessage}</p></div>
        <div className="bubble you"><p>
          {config.template.map((part, index) => {
            const match = /^\{(.+)\}$/.exec(part);
            if (!match) return <span key={index}> {part}</span>;
            const target = config.slots.find((item) => item.id === match[1]);
            const chosen = target.options.find((option) => option.id === slots[target.id]);
            return <button key={index} className={`gap ${open === target.id ? 'open' : ''} ${chosen ? 'filled' : ''}`} data-slot-id={target.id} onClick={() => !disabled && setOpen(target.id)} disabled={disabled}>{chosen ? chosen.text : `[ ${target.label} ]`}</button>;
          })}
        </p><Character id="detective" size={54} bust player={state.player} /></div>
        {allFilled && <div className="bubble ai reply"><Character id={config.aiId} size={54} bust expression={response?.showReview ? 'happy' : 'thinking'} /><p>{reply}</p></div>}
      </div>
      {slot && <div className="chips" data-component="PromptChips">
        <span className="prompt-pick-label">Choose or update {slot.label}:</span>
        {slot.options.map((option) => <button key={option.id} className={`chip ${slots[slot.id] === option.id ? 'on' : ''}`} data-option-id={option.id} onClick={() => set(slot.id, option.id)} disabled={disabled}>{option.text}</button>)}
      </div>}
      {allFilled && response?.showReview && config.review && <div className="prompt-review">
        <h3>{config.review.prompt}</h3>
        <div className="chips">
          {config.review.options.map((option) => <button key={option.id} className={`chip ${value?.review === option.id ? 'on' : ''}`} onClick={() => onChange({ ...value, review: option.id })} disabled={disabled}>{option.text}</button>)}
        </div>
        {value?.review && <p className="review-nudge"><CheckCircle2 size={16} /> You are checking the AI’s answer against evidence.</p>}
      </div>}
    </div>
  );
}
