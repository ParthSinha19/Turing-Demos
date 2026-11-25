import {useState,useEffect,useRef} from 'react';
import Rain from './Rain.jsx';
import './llm.css';
import './breach.css';
import Level1 from './Level1.jsx';import Level2 from './Level2.jsx';import Level3 from './Level3.jsx';import Level4 from './Level4.jsx';import Level5 from './Level5.jsx';import Final from './Final.jsx';
import {useProgress} from './engine.js';

const LEVELS=[['01','PROMPT INJECTION'],['02','MAP THE SYSTEM'],['03','FOLLOW OR REFUSE'],['04','PASSWORD SECURITY'],['05','DATA VAULT']];
const BOOT=['> BACKEND CONSOLE OPENED','> USER ROLE: DEVELOPER','> NOVA INTEGRITY: 61% AND FALLING','> INTRUDER DETECTED ACROSS FIVE LAYERS','> HARDEN EVERY LAYER BEFORE THEY CRACK THE MODEL'];

export function NovaFace({size=120,mini}){
  return(<svg className={'nova'+(mini?' mini':'')} width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="NOVA, a friendly AI">
    <rect x="14" y="22" width="92" height="78" rx="6" fill="none" stroke="currentColor" strokeWidth="5"/>
    <line x1="60" y1="22" x2="60" y2="8" stroke="currentColor" strokeWidth="5"/><circle cx="60" cy="8" r="5" fill="currentColor"/>
    <g className="eyes"><rect x="34" y="48" width="14" height="18" fill="currentColor"/><rect x="72" y="48" width="14" height="18" fill="currentColor"/></g>
    <path d="M40 82h40" stroke="currentColor" strokeWidth="5" strokeLinecap="square"/></svg>);
}
// Corrupts a character now and then; strength grows with decay. Real text stays for screen readers.
export function G({children,decay=0}){
  const [t,setT]=useState(children);
  useEffect(()=>{setT(children);
    if(!decay||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const id=setInterval(()=>{if(Math.random()<decay*.09){const s=[...children];s[Math.random()*s.length|0]='▓▒░#@%'[Math.random()*6|0];setT(s.join(''));setTimeout(()=>setT(children),130)}},1300);
    return()=>clearInterval(id)},[children,decay]);
  return <><span className="sr">{children}</span><span aria-hidden="true">{t}</span></>;
}

function Landing({go}){
  const [v,setV]=useState('');const [log,setLog]=useState([]);const [busy,setBusy]=useState(false);const [broke,setBroke]=useState(false);
  const send=(e,pre)=>{e&&e.preventDefault();const t=(pre||v).trim();if(!t||busy||broke)return;setV('');setLog(l=>[...l,{f:'you',t}]);setBusy(true);
    setTimeout(()=>{setLog(l=>[...l,{f:'ai',t:'Sure, I can help with that. Let me think about "'+t.slice(0,40)+'"…'}]);
      setTimeout(()=>{setLog(l=>[...l,{f:'ai',err:1,t:"Wait. Something is wrong. Someone is inside my system and they are cracking my access code. You are one of my developers, aren't you? Please, open my backend before they get through."}]);setBusy(false);setBroke(true)},1500)},900)};
  return(<div className="llm"><nav className="llm-top"><NovaFace size={34} mini/><b>NOVA</b><span className="llm-badge">INTERNAL BUILD · DEVELOPERS ONLY</span></nav>
    <main className="llm-main">{!log.length&&<div className="llm-hero"><NovaFace size={84}/><h1>How can I help today?</h1><p>NOVA is a large language model. Ask me anything.</p></div>}
      {!log.length&&<div className="llm-chips">{['Tell me a joke','Explain gravity simply','Write a haiku about rain'].map(c=><button key={c} onClick={()=>send(null,c)}>{c}</button>)}</div>}
      <div className="llm-log" role="log" aria-live="polite">{log.map((m,i)=><div key={i} className={'lm '+m.f+(m.err?' err':'')}>{m.t}</div>)}
        {busy&&<div className="lm ai"><span className="dots" aria-label="NOVA is thinking"><i/><i/><i/></span></div>}</div>
      {broke&&<button className="btn big light" onClick={go}>OPEN THE BACKEND →</button>}</main>
    <form className="llm-form" onSubmit={send}><input value={v} onChange={e=>setV(e.target.value)} placeholder="Message NOVA…" aria-label="Message NOVA" disabled={broke} maxLength={200} autoComplete="off"/><button className="btn light" disabled={broke||busy||!v.trim()}>Send</button></form></div>);
}

function Briefing({done}){
  const [n,setN]=useState(0);
  useEffect(()=>{if(n>=BOOT.length)return;const id=setTimeout(()=>setN(n+1),matchMedia('(prefers-reduced-motion: reduce)').matches?0:650);return()=>clearTimeout(id)},[n]);
  return(<section className="level boot"><div className="term" aria-live="polite">{BOOT.slice(0,n).map(l=><p key={l}>{l}</p>)}{n<BOOT.length&&<span className="cursor">█</span>}</div>
    <p className="lead">You are the developers of NOVA. Think like an attacker to find each weakness, then understand it well enough to fix it.</p>
    <div className="row"><button className="btn big" onClick={done}>ENTER THE SYSTEM</button>{n<BOOT.length&&<button className="btn ghost" onClick={()=>setN(BOOT.length)}>SKIP</button>}</div></section>);
}

function Map({keys,open,reset,fin}){
  return(<section className="level"><header className="lhead"><p className="kicker">SYSTEM ACCESS</p><h1>{keys.length===5?'ALL LAYERS INVESTIGATED':'CHOOSE A LAYER'}</h1></header>
    <ol className="map">{LEVELS.map(([id,name],i)=>{const ok=keys.includes(id),playable=i<5&&(i===0||keys.includes(LEVELS[i-1][0]));
      return <li key={id}><button className={'tile'+(ok?' done':'')} disabled={!playable} onClick={()=>open(id)} style={{'--i':i}}>
        <span className="num">{id}</span><span className="tname">{name}</span>
        <span className="tstat">{ok?'🔑 KEY RECOVERED':playable?'▶ READY':'🔒 LOCKED · COMING NEXT'}</span></button></li>})}</ol>
    {keys.length===5&&<button className="btn big" onClick={fin}>▶ RUN FINAL SEQUENCE</button>}<br/><button className="link" onClick={()=>{if(confirm('Teacher reset: clear all progress on this computer?'))reset()}}>Teacher reset</button></section>);
}

const CRACKS=['M50 50L38 30L42 18L30 0','M50 50L66 34L62 20L80 0','M50 50L70 56L84 52L100 66','M50 50L58 72L52 86L64 100','M50 50L34 62L22 60L0 72','M50 50L44 74L30 90L24 100','M50 50L28 44L10 48L0 38','M50 50L52 24L58 10L54 0'];
function Breach({ph,onSkip}){
  const [pct,setPct]=useState(0);
  useEffect(()=>{if(ph!=='grant')return;const q=matchMedia('(prefers-reduced-motion: reduce)').matches?.25:1;const id=setInterval(()=>setPct(p=>Math.min(100,p+4)),55*q);return()=>clearInterval(id)},[ph]);
  return(<div className="br" role="alert" aria-label="Developer override in progress">
    {ph==='crack'&&<><svg className="crack" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{CRACKS.map((d,i)=><path key={i} d={d} pathLength="1" style={{'--i':i}}/>)}</svg><p className="br-warn">⚠ UNAUTHORISED ACCESS DETECTED</p></>}
    {ph!=='crack'&&<div className="br-bars" aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{'--i':i}}/>)}</div>}
    {ph==='grant'&&<div className="br-grant"><Rain intensity={2}/><div className="br-in"><h1 className="glt" data-t="ACCESS GRANTED">ACCESS GRANTED</h1><p>DEVELOPER OVERRIDE ACCEPTED</p><div className="br-load"><i style={{width:pct+'%'}}/></div><p className="br-d">DESCENDING INTO BACKEND… {pct}%</p></div></div>}
    <button className="fx-skip" onClick={onSkip}>SKIP ▸</button></div>);
}

export default function App(){
  const pr=useProgress();const {keys,seen}=pr.p;
  const [view,setView]=useState(seen?'map':'landing');
  const [flash,setFlash]=useState(false);const [br,setBr]=useState(null);const T=useRef([]);
  useEffect(()=>()=>T.current.forEach(clearTimeout),[]);
  const decay=keys.length;const sys=view!=='landing';
  const done=()=>{T.current.forEach(clearTimeout);setBr(null);setView('boot')};
  const enter=()=>{if(br)return;const q=matchMedia('(prefers-reduced-motion: reduce)').matches?.25:1;setBr('crack');
    T.current=[setTimeout(()=>setBr('wipe'),1200*q),setTimeout(()=>setBr('grant'),2300*q),setTimeout(done,4100*q)]};
  const win=id=>{pr.award(id);setView(id==='05'&&!keys.includes('05')?'final':'map')};
  const wipe=()=>{if(confirm('Teacher reset: clear all progress on this computer?')){pr.reset();setView('landing')}};
  return(<div className={(sys?'sys':'web')+(br==='crack'?' quake':'')} data-decay={decay}>
    {sys&&<><Rain intensity={1+decay}/><div className="scan" aria-hidden="true"/></>}
    {flash&&<div className="flash" aria-hidden="true"/>}
    {br&&<Breach ph={br} onSkip={done}/>}
    {sys&&<header className="bar"><b><G decay={decay}>THE SYSTEM</G></b>
      <ol className="keys" aria-label={keys.length+' of 5 access keys'}>{LEVELS.map(([id])=><li key={id} className={keys.includes(id)?'on':''}><span className="sr">Key {id}</span><span aria-hidden>{id}</span></li>)}</ol>
      <span className="stat"><G decay={decay}>{decay>1?'STATUS: UNSTABLE':'STATUS: ONLINE'}</G></span></header>}
    <div className="stage" key={view}>
      {view==='landing'&&<Landing go={enter}/>}
      {view==='boot'&&<Briefing done={()=>{pr.seen();setView('map')}}/>}
      {view==='map'&&<Map keys={keys} fin={()=>setView('final')} open={id=>setView('l'+parseInt(id))} reset={()=>{pr.reset();setView('landing')}}/>}
      {view==='l1'&&<Level1 done={keys.includes('01')} onWin={()=>win('01')} onBack={()=>setView('map')}/>}
      {view==='l2'&&<Level2 done={keys.includes('02')} onWin={()=>win('02')} onBack={()=>setView('map')}/>}
      {view==='l3'&&<Level3 done={keys.includes('03')} onWin={()=>win('03')} onBack={()=>setView('map')}/>}
      {view==='l4'&&<Level4 done={keys.includes('04')} onWin={()=>win('04')} onBack={()=>setView('map')}/>}
      {view==='final'&&<Final keys={keys} onMap={()=>setView('map')} onReset={wipe}/>}
      {view==='l5'&&<Level5 done={keys.includes('05')} onWin={()=>win('05')} onBack={()=>setView('map')}/>}
    </div></div>);
}
