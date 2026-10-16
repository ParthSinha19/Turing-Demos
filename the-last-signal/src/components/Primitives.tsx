import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; children: ReactNode }) {
  return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>
}

export function SectionTitle({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <div className="section-title">{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div>
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value))
  return <div className="progress-wrap" aria-label={label ?? `${clamped}% complete`}><div className="progress-track"><div className="progress-fill" style={{ width: `${clamped}%` }} /></div>{label && <span>{label}</span>}</div>
}

export function StatusPill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'locked' }) {
  return <span className={`status-pill status-${tone}`}>{children}</span>
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="empty-state"><span className="empty-orbit" aria-hidden="true" /><h3>{title}</h3><p>{body}</p></div>
}
