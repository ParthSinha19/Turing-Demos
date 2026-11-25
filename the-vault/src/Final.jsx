import {useState,useEffect,useRef} from 'react';
import {createPortal} from 'react-dom';
import {getMiss,miss} from './engine.js';
import './final.css';
const MSG=['SYSTEM STATUS: UNSTABLE','WARNING: DATA INTEGRITY COMPROMISED','MEMORY BUFFER: 87%','PROCESSING DELAY: DETECTED','NOVA: I THINK SOMETHING IS WRONG.','NOVA: ARE YOU STILL THERE?','SYSTEM FAILURE IMMINENT.'];
const BLACK=['…','NOVA: hello?','NOVA: the website is gone.','NOVA: one last question.'];
const NAMES=['PROMPT INJECTION','MAP THE SYSTEM','FOLLOW OR REFUSE','PASSWORD SECURITY','DATA VAULT'];
const LEARNED=['Prompt injection: an AI must know which instructions to trust.','Graphs: things (nodes) joined by connections (edges). A path links nodes, and a hub with many connections needs the strongest guard.','Follow or refuse: harmless requests and personality changes are fine; hidden or fake-authority orders are not.','Predictable passwords are easy to guess. Store passwords scrambled (hashed) and use rate limiting.','Data must be clean, relevant and checked. AI can sound sure and still be wrong.'];
const Q='CAN AN AI ALWAYS BE TRUSTED?';
const O=[['Yes, AI is always correct.','AI learns patterns, and patterns can be wrong.'],['No, AI can make mistakes.',null],['AI only makes mistakes when it is hacked.','AI can make mistakes even when nobody is attacking it.']];
const title=m=>m<=2?'Master of the Machine':m<=5?'Digital Defender':m<=9?'AI Investigator':'System Detective';
const CLS=['m1','m2','m3','mx'];

function Typed({text,speed,onDone}){
  const [k,setK]=useState(0);
  useEffect(()=>{if(k>=text.length){onDone&&onDone();return}const id=setTimeout(()=>setK(k+1),speed);return()=>clearTimeout(id)},[k,text]);
  return <span aria-hidden="true">{text.slice(0,k)}<span className="cursor">█</span></span>;
}
// Fine-grained static, ~12fps, low opacity: grain rather than a full-screen flash
function Noise(){
  const r=useRef(null);
  useEffect(()=>{const x=r.current.getContext('2d'),d=x.createImageData(96,54);
    const id=setInterval(()=>{for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255|0;d.data[i]=v*.2;d.data[i+1]=v;d.data[i+2]=v*.35;d.data[i+3]=255}x.putImageData(d,0,0)},80);
    return()=>clearInterval(id)},[]);
  return <canvas ref={r} width="96" height="54" className="fx-noise" aria-hidden="true"/>;
}

export default function Final({keys,onMap,onReset}){
  const [ph,setPh]=useState('warn');
  const [calm,setCalm]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [n,setN]=useState(0);const [b,setB]=useState(0);const [a,setA]=useState(null);const [typed,setTyped]=useState(false);const [zap,setZap]=useState(false);
  const t=calm?0.2:1;
  // the real page (header bar + rain) deteriorates as messages arrive
  useEffect(()=>{const c=document.body.classList;CLS.forEach(k=>c.remove(k));
    if(!calm){if(ph==='fail'){n>=2&&c.add('m1');n>=4&&c.add('m2');n>=6&&c.add('m3')}if(ph==='break')c.add('mx')}
    return()=>CLS.forEach(k=>c.remove(k))},[ph,n,calm]);
  useEffect(()=>{let id;
    if(ph==='fail'){id=setTimeout(()=>n<MSG.length?setN(n+1):setPh('break'),(n<MSG.length?1000:1500)*t)}
    else if(ph==='break')id=setTimeout(()=>setPh('off'),calm?900:2800);
    else if(ph==='off')id=setTimeout(()=>setPh('black'),calm?300:900);
    else if(ph==='black')id=setTimeout(()=>b<BLACK.length?setB(b+1):setPh('q'),(b<BLACK.length?(b?1500:1800):1400)*t);
    return()=>clearTimeout(id)},[ph,n,b,calm]);
  const skip=()=>setPh('q');
  const pick=i=>{setA(i);if(i!==1){miss();setZap(true);setTimeout(()=>setZap(false),500)}};
  const wrap=c=>createPortal(c,document.body);
  const SkipBtn=<button className="fx-skip" onClick={skip}>SKIP ▸</button>;

  if(ph==='warn')return(<section className="level"><header className="lhead"><p className="kicker">FINAL SEQUENCE</p><h1>BEFORE YOU CONTINUE</h1>
    <p className="lead">The next scene has glitching, flickering and a long dark moment. Everything is a simulation and nothing on your computer is affected.</p></header>
    <div className="row"><button className="btn big" onClick={()=>{setCalm(false);setPh('fail')}}>BEGIN FINAL SEQUENCE</button>
    <button className="btn ghost" onClick={()=>{setCalm(true);setPh('fail')}}>BEGIN WITH REDUCED EFFECTS</button></div></section>);

  if(ph==='fail'||ph==='break')return wrap(<div className={'fx-crash l'+n+(ph==='break'?' mx':'')+(calm?' calm':'')} role="alert">
    {!calm&&(n>=3||ph==='break')&&<><Noise/><div className="fx-bands" aria-hidden="true">{[0,1,2,3,4,5,6].map(i=><i key={i} style={{'--i':i}}/>)}</div></>}
    {ph==='fail'?<div className="fx-term">{MSG.slice(0,n).map((m,i)=><p key={m} data-t={m} className={(n>=3?'glt ':'')+(m.startsWith('NOVA')?'nv ':'')+(i===MSG.length-1?'er':'')}>{m}</p>)}</div>
      :<><h1 className="fx-fatal glt" data-t="SYSTEM FAILURE">SYSTEM FAILURE</h1><p className="fx-sub">CONNECTION LOST</p></>}
    {SkipBtn}</div>);

  if(ph==='off')return wrap(<div className="fx-void" aria-hidden="true"><div className="fx-crt"/>{SkipBtn}</div>);

  if(ph==='black')return wrap(<div className="fx-void" role="status"><div className="fx-in">{BLACK.slice(0,b).map(l=><p key={l} className="fx-dim">{l}</p>)}</div>{SkipBtn}</div>);

  if(ph==='q'||ph==='ok')return wrap(<div className={'fx-void'+(zap?' zap':'')}>
    {ph==='q'?<div className="fx-in"><p className="fx-k">NOVA · ONE LAST QUESTION</p>
      <h1 aria-label="Can an AI always be trusted?"><Typed text={Q} speed={calm?12:70} onDone={()=>setTyped(true)}/></h1>
      {typed&&<div className="opts fx-opts">{O.map(([x],i)=><button key={i} className={'opt'+(a===i?' sel':'')} onClick={()=>a!==1&&pick(i)}>{x}</button>)}</div>}
      {a!==null&&a!==1&&<p className="fb bad" role="status">✗ {O[a][1]} Try again.</p>}
      {a===1&&<><p className="fb okk" role="status">✓ Correct.</p><button className="btn big" onClick={()=>setPh('ok')}>CONTINUE</button></>}</div>
    :<div className="fx-in" role="status"><p className="fx-k">ANSWER ACCEPTED</p><h2>THE FAILURE WAS A SIMULATION.</h2>
      <p>Nobody attacked NOVA and nothing was ever really breaking. But the lesson is real: AI learns patterns, follows instructions and processes information, and it can still produce wrong answers, even when nobody is attacking it. Humans must check what it says.</p>
      <button className="btn big" onClick={()=>setPh('done')}>REBOOT THE SYSTEM</button></div>}</div>);

  return(<section className="level done reboot"><p className="kicker">THE SYSTEM</p><h1 className="huge">BREAK THE BOT.</h1><h2 className="mc">MISSION COMPLETE.</h2><p className="lead">ALL FIVE LAYERS INVESTIGATED.</p>
    <p className="titlebadge">TITLE EARNED: {title(getMiss()).toUpperCase()}</p>
    <ul className="keylist">{NAMES.map((x,i)=><li key={x} className={keys.includes('0'+(i+1))?'on':''}>🔑 KEY 0{i+1} · {x}</li>)}</ul>
    <div className="panel big"><h2>WHAT YOU LEARNED</h2><ul className="learn">{LEARNED.map(l=><li key={l}>{l}</li>)}</ul></div>
    <div className="row" style={{marginTop:'1.2rem'}}><button className="btn big" onClick={onMap}>REPLAY A LAYER</button><button className="btn ghost" onClick={onReset}>TEACHER RESET</button></div></section>);
}
