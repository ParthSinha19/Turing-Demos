import React from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useGame } from '../state/GameContext';

// <FeedbackBanner status="idle|success|retry" message="…" />
export function FeedbackBanner({ status, message }) {
  if (status === 'idle') return null;
  return (
    <div className={`feedback ${status}`} role="status" data-component="FeedbackBanner">
      {status === 'success' ? <CheckCircle2 size={22} /> : <RotateCcw size={22} />}<span>{message}</span>
    </div>
  );
}

export function ToastLayer() {
  const { state } = useGame();
  const t = state.toast;
  if (!t) return null;
  return (
    <div className={`toast realm-${t.realm || 'forest'}`} key={t.id} role="status" data-component="DiscoveryToast">
      <b>{t.title}</b><span>{t.text}</span>
    </div>
  );
}
