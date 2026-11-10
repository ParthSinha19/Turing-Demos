import React, { useState } from 'react';
import { Shuffle, ArrowRight } from 'lucide-react';
import Environment from '../components/Environment';
import Character, { Detective } from '../components/Characters';
import { HudPanel, HudButton } from '../components/Hud';
import { useGame } from '../state/GameContext';
import { SKINS, HAIR_COLORS, OUTFIT_COLORS, HAIRS, OUTFITS, ACCESSORIES, GADGETS, EXPRESSIONS } from '../data/customise';

const TABS = [['look', 'Look'], ['hair', 'Hair & Hats'], ['outfit', 'Outfit'], ['gear', 'Gear']];

function Swatches({ list, value, onPick, label }) {
  return <div className="swatches" role="radiogroup" aria-label={label}>{list.map((c) => <button key={c} role="radio" aria-checked={value === c} className={value === c ? 'on' : ''} style={{ background: c }} onClick={() => onPick(c)} aria-label={c} />)}</div>;
}
function Tiles({ list, value, onPick, patch, view }) {
  const { state } = useGame();
  return (
    <div className="tiles">
      {list.map((o) => (
        <button key={o.id} className={`tile ${value === o.id ? 'on' : ''}`} onClick={() => onPick(o.id)} data-option-id={o.id}>
          {patch && <Detective player={{ ...state.player, ...patch(o.id) }} view={view} size={view === 'bust' ? 74 : 88} />}
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function Customise() {
  const { state, setPlayer, go } = useGame();
  const p = state.player;
  const editing = state.storyFlags.includes('intro-seen') || state.completed.length > 0;
  const home = state.completed.includes('forest-5') ? 'shuttle' : 'hq';
  const [tab, setTab] = useState('look');
  const [expr, setExpr] = useState('happy');
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = () => setPlayer({ skin: rand(SKINS), hair: rand(HAIRS).id, hairColor: rand(HAIR_COLORS), outfit: rand(OUTFITS).id, outfitColor: rand(OUTFIT_COLORS), accessory: rand(ACCESSORIES).id, gadget: rand(GADGETS.filter((g) => state.gadgets.includes(g.id))).id });
  return (
    <div className="screen customise" data-screen="Customise" data-realm={home === 'shuttle' ? 'space' : 'hq'}>
      <Environment id={home} level={state.hqLevel}>
        <div className="cust-layout">
          <div className="cust-stage">
            <div className="podium"><i /><i /><i /></div>
            <Character id="detective" player={p} size={430} expression={expr} />
            <div className="expr-row">{EXPRESSIONS.map((e) => <button key={e} className={expr === e ? 'on' : ''} onClick={() => setExpr(e)}>{e}</button>)}</div>
          </div>
          <HudPanel className="cust-panel" tag="Detective ID" title="Create your detective">
            <label className="name-field"><span>Detective name</span><input value={p.name} maxLength={14} onChange={(e) => setPlayer({ name: e.target.value })} data-id="player-name" /></label>
            <div className="tabs" role="tablist">{TABS.map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{l}</button>)}</div>
            <div className="cust-body">
              {tab === 'look' && <><h4>Skin tone</h4><Swatches list={SKINS} value={p.skin} onPick={(c) => setPlayer({ skin: c })} label="Skin tone" /></>}
              {tab === 'hair' && <><h4>Style</h4><Tiles list={HAIRS} value={p.hair} onPick={(id) => setPlayer({ hair: id })} patch={(id) => ({ hair: id })} view="bust" /><h4>Hair colour</h4><Swatches list={HAIR_COLORS} value={p.hairColor} onPick={(c) => setPlayer({ hairColor: c })} label="Hair colour" /></>}
              {tab === 'outfit' && <><h4>Outfit</h4><Tiles list={OUTFITS} value={p.outfit} onPick={(id) => setPlayer({ outfit: id })} patch={(id) => ({ outfit: id })} view="torso" /><h4>Colour</h4><Swatches list={OUTFIT_COLORS} value={p.outfitColor} onPick={(c) => setPlayer({ outfitColor: c })} label="Outfit colour" /></>}
              {tab === 'gear' && <><h4>Accessory</h4><Tiles list={ACCESSORIES} value={p.accessory} onPick={(id) => setPlayer({ accessory: id })} patch={(id) => ({ accessory: id })} view="torso" /><h4>Detective gadget</h4><p className="gadget-note">New gadgets are earned by solving cases.</p><div className="gadgets">{GADGETS.filter((g) => state.gadgets.includes(g.id)).map((g) => <button key={g.id} className={p.gadget === g.id ? 'on' : ''} onClick={() => setPlayer({ gadget: g.id })}><b>{g.label}</b><span>{g.blurb}</span></button>)}</div></>}
            </div>
            <footer className="cust-foot">
              <HudButton ghost small onClick={shuffle}><Shuffle size={16} /> Surprise me</HudButton>
              <HudButton primary onClick={() => go(editing ? home : 'intro')} data-id="begin-case">{editing ? 'Save my detective' : 'Begin your first case'} <ArrowRight size={18} /></HudButton>
            </footer>
          </HudPanel>
        </div>
      </Environment>
    </div>
  );
}
