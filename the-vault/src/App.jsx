import {useState,useEffect} from 'react';
import Rain from './Rain.jsx';
import Level1 from './Level1.jsx';import Level2 from './Level2.jsx';import Level3 from './Level3.jsx';import Level4 from './Level4.jsx';import Level5 from './Level5.jsx';import Final from './Final.jsx';
import {useProgress} from './engine.js';

const LEVELS=[['01','PROMPT INJECTION'],['02','SYSTEM OVERRIDE'],['03','PASSWORD PROTOCOL'],['04','SIGNAL BREAKDOWN'],['05','DATA VAULT']];
const BOOT=['> BOOTING EXPERIMENTAL AI COMPUTER…','> LOADING NOVA ........ OK','> FIVE PROTECTED LAYERS DETECTED','> WARNING: SOMETHING IS WATCHING THIS TERMINAL','> THE DEEPER YOU GO, THE STRANGER THINGS BECOME'];

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

function Landing({go}){return(<div className="site">
  <nav className="topnav"><b className="logo">▲ The System</b><div className="navlinks"><a href="#about">About</a><a href="#teachers">For teachers</a><a href="#help">Help</a></div><button className="btn light" onClick={go}>Start</button></nav>
  <main className="hero" id="about"><div className="hero-copy">
    <p className="eyebrow">An experimental AI computer</p>
    <h1>Welcome to the System.</h1>
    <p className="lead">You have been selected to investigate an experimental AI computer. It contains five protected layers. Your mission: recover the access keys and restore the system.</p>
    <button className="btn big light" onClick={go}>Begin the mission</button>
    <p className="small">Takes about 55 minutes · No sign-up · Nothing leaves your computer</p></div>
    <div className="hero-art"><NovaFace size={220}/><p className="bubble">Hi! I'm NOVA. Everything here is completely normal. <span className="tiny">Probably.</span></p></div></main></div>);}

function Briefing({done}){
  const [n,setN]=useState(0);
  useEffect(()=>{if(n>=BOOT.length)return;const id=setTimeout(()=>setN(n+1),matchMedia('(prefers-reduced-motion: reduce)').matches?0:650);return()=>clearTimeout(id)},[n]);
  return(<section className="level boot"><div className="term" aria-live="polite">{BOOT.slice(0,n).map(l=><p key={l}>{l}</p>)}{n<BOOT.length&&<span className="cursor">█</span>}</div>
    <p className="lead">Some layers need you to think like a hacker. Others need you to understand how computers and AI really work.</p>
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

export default function App(){
  const pr=useProgress();const {keys,seen}=pr.p;
  const [view,setView]=useState(seen?'map':'landing');
  const [flash,setFlash]=useState(false);
  const decay=keys.length;const sys=view!=='landing';
  const enter=()=>{setFlash(true);setTimeout(()=>{setView('boot');setFlash(false)},450)};
  const win=id=>{pr.award(id);setView(id==='05'&&!keys.includes('05')?'final':'map')};
  const wipe=()=>{if(confirm('Teacher reset: clear all progress on this computer?')){pr.reset();setView('landing')}};
  return(<div className={sys?'sys':'web'} data-decay={decay}>
    {sys&&<><Rain intensity={1+decay}/><div className="scan" aria-hidden="true"/></>}
    {flash&&<div className="flash" aria-hidden="true"/>}
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
