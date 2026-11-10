import React from 'react';
import Glyph from './Glyph';
import { EVIDENCE } from '../data/evidence';

// <EvidenceCard evidence={…} isNew small locked />
export function EvidenceCard({ evidence, isNew, small, locked, style, ...rest }) {
  if (locked) return <div className={`ev-card locked ${small ? 'small' : ''}`} style={style} data-component="EvidenceCard" {...rest}><span className="ev-q">?</span></div>;
  return (
    <article className={`ev-card realm-${evidence.realm} ${small ? 'small' : ''} ${isNew ? 'is-new' : ''}`} style={style} data-component="EvidenceCard" data-evidence-id={evidence.id} {...rest}>
      <div className="ev-glyph"><Glyph name={evidence.glyph} size={small ? 22 : 34} /></div>
      <div className="ev-text"><h4>{evidence.title}</h4>{!small && <><p>{evidence.blurb}</p>{evidence.originChapter && <small>Discovered in Chapter {evidence.originChapter}</small>}</>}</div>
    </article>
  );
}

// Slots showing which evidence a mission can award.
export function EvidenceTray({ ids, collected }) {
  return (
    <div className="ev-tray" data-component="EvidenceTray">
      {ids.map((id) => {
        const e = EVIDENCE.find((x) => x.id === id);
        const has = collected.includes(id);
        return <div key={id} className={`ev-slot ${has ? 'has' : ''}`} title={has ? e.title : 'Undiscovered'}>{has ? <Glyph name={e.glyph} size={20} /> : <span>?</span>}</div>;
      })}
    </div>
  );
}
