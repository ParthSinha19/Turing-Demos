import React from 'react';
import { X } from 'lucide-react';

// HUD building blocks. Chamfered panels, corner brackets, pip meters.
export function HudPanel({ className = '', children, title, tag, ...rest }) {
  return (
    <section className={`hud ${className}`} {...rest}>
      {(title || tag) && (
        <header className="hud-head">
          {tag && <span className="hud-tag">{tag}</span>}
          {title && <h3>{title}</h3>}
        </header>
      )}
      {children}
    </section>
  );
}

export function HudButton({ children, primary, ghost, small, className = '', ...rest }) {
  return (
    <button className={`hbtn ${primary ? 'primary' : ''} ${ghost ? 'ghost' : ''} ${small ? 'small' : ''} ${className}`} {...rest}>
      <span className="hbtn-in">{children}</span>
    </button>
  );
}

export function PipMeter({ total, value, label }) {
  return (
    <div className="pips" role="img" aria-label={label || `${value} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => <i key={i} className={i < value ? 'on' : ''} />)}
    </div>
  );
}

// Full-screen modal frame used by notebook, board, map, workshop, settings.
export function Overlay({ title, tag, onClose, children, wide, className = '' }) {
  return (
    <div className="overlay" role="dialog" aria-label={title} onClick={onClose}>
      <HudPanel className={`overlay-card ${wide ? 'wide' : ''} ${className}`} onClick={(e) => e.stopPropagation()}>
        <header className="overlay-head">
          <div>{tag && <span className="hud-tag">{tag}</span>}<h2>{title}</h2></div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </header>
        <div className="overlay-body">{children}</div>
      </HudPanel>
    </div>
  );
}

export function GlitchSigil({ size = 64, color = '#ff4fd8', className = '' }) {
  return (
    <svg className={`sigil ${className}`} width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <path fillRule="evenodd" fill={color} d="M50 4 L96 50 L50 96 L4 50 Z M50 24 L76 50 L50 76 L24 50 Z" />
      <path d="M34 66 L66 34" stroke={color} strokeWidth="7" strokeLinecap="round" />
      <circle cx="50" cy="50" r="6" fill={color} />
    </svg>
  );
}
