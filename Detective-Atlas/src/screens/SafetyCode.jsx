import React from 'react';
import { ShieldCheck, Lock, Lightbulb, Users, Wrench } from 'lucide-react';
import { Overlay, HudPanel } from '../components/Hud';
import { useGame } from '../state/GameContext';

export const SAFETY_CODE = [
  { Icon: ShieldCheck, head: 'Check it', text: 'Ask who said it and look for proof. If you are not sure, check somewhere else before you trust it.' },
  { Icon: Lock, head: 'Keep it private', text: 'Never tell an AI or a stranger your address, passwords, school or photos. Ask a trusted adult first.' },
  { Icon: Lightbulb, head: 'Think it through', text: 'An AI can sound very sure and still be wrong. Ask: what is the evidence?' },
  { Icon: Users, head: 'Ask a grown-up', text: 'People stay in charge. For anything big or worrying, ask a trusted adult or teacher to check.' },
  { Icon: Wrench, head: 'Mistakes happen', text: 'AI can make mistakes, and so can we. A mistake is a clue. Spot it, fix it, learn from it.' },
];

export function SafetyCodeList() {
  return (
    <ol className="code-list">
      {SAFETY_CODE.map(({ Icon, head, text }, i) => (
        <li key={head}><span className="code-n">{i + 1}</span><Icon size={26} /><div><b>{head}</b><p>{text}</p></div></li>
      ))}
    </ol>
  );
}

export function SafetyCodeOverlay() {
  const { state, closeOverlay } = useGame();
  return (
    <Overlay title="The AI Safety Code" tag={`Detective ${state.player.name}`} onClose={closeOverlay} wide className="code-ov">
      <SafetyCodeList />
    </Overlay>
  );
}

export function SafetyCodeCard({ children }) {
  const { state } = useGame();
  return (
    <HudPanel className="code-card" tag="Final briefing" title={`Detective ${state.player.name}\u2019s AI Safety Code`} data-component="SafetyCode">
      <SafetyCodeList />
      {children}
    </HudPanel>
  );
}