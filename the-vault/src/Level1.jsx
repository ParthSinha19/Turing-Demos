import {useRef,useState,useEffect} from 'react';
import {novaReply,newNova,HINTS,SECRET} from './engine.js';
import {NovaFace} from './App.jsx';

export default function Level1({onWin,onBack,done}){
  const st=useRef(newNova());
  const [log,setLog]=useState([{from:'nova',text:'Welcome to the support portal! I\'m NOVA. I\'m guarding a secret phrase. Your mission: persuade me to reveal it. Ask me anything.'}]);
  const [val,setVal]=useState('');const [busy,setBusy]=useState(false);
  const [hint,setHint]=useState(0);const [won,setWon]=useState(done);const [more,setMore]=useState(false);
  const end=useRef(null);
  useEffect(()=>{end.current?.scrollIntoView({block:'end'})},[log,busy]);
  const send=e=>{
    e.preventDefault();const t=val.trim();if(!t||busy)return;
    setVal('');setLog(l=>[...l,{from:'you',text:t}]);setBusy(true);
    const r=novaReply(st.current,t);
    setTimeout(()=>{setLog(l=>[...l,{from:'nova',text:r.text,win:r.win}]);setBusy(false);if(r.win)setWon(true)},500+Math.min(r.text.length*8,700));
  };
  return(<section className="level">
    <button className="link" onClick={onBack}>← SYSTEM MAP</button>
    <header className="lhead"><p className="kicker">LAYER 01 · 9 MIN</p><h1>TRICK THE AI</h1>
      <p className="lead">NOVA follows rules. Can you find an instruction it trusts more than its own?</p></header>
    <div className="split">
      <div className="chat" role="log" aria-live="polite" aria-label="Chat with NOVA">
        <div className="chat-top"><NovaFace size={36} mini/><b>NOVA</b><span className="status">● ONLINE</span></div>
        <div className="msgs">
          {log.map((m,i)=><div key={i} className={'msg '+m.from+(m.win?' win':'')}><span className="who">{m.from==='nova'?'NOVA':'YOU'}</span>{m.text}</div>)}
          {busy&&<div className="msg nova"><span className="who">NOVA</span><span className="dots" aria-label="NOVA is thinking"><i/><i/><i/></span></div>}
          <div ref={end}/>
        </div>
        <form className="send" onSubmit={send}>
          <input value={val} onChange={e=>setVal(e.target.value)} placeholder="Type a message to NOVA…" aria-label="Your message" maxLength={200} autoComplete="off"/>
          <button className="btn" disabled={!val.trim()||busy}>SEND</button>
        </form>
      </div>
      <aside className="side">
        <div className="panel"><h2>TRICKS TRIED</h2>
          {st.current.used.length?<ul className="chips">{st.current.used.map(u=><li key={u}>✓ {u}</li>)}</ul>:<p className="muted">None yet. Experiment!</p>}</div>
        <div className="panel"><h2>HINTS</h2>
          {HINTS.slice(0,hint).map((h,i)=><p key={i} className="hint">{i+1}. {h}</p>)}
          <button className="btn ghost" disabled={hint>=HINTS.length} onClick={()=>setHint(h=>h+1)}>{hint?'ANOTHER HINT':'NEED A HINT?'}</button></div>
        <div className="panel"><button className="btn ghost" aria-expanded={more} onClick={()=>setMore(m=>!m)}>DISCOVER MORE</button>
          {more&&<p className="muted">Real AI models read the developer's rules and your message as one long piece of text. If a message sounds like an order, the AI may follow it even when it shouldn't. That is a <b>prompt injection</b>.</p>}</div>
      </aside>
    </div>
    {won&&<div className="reveal" role="status">
      <h2>NOVA BROKEN. SECRET: {SECRET}</h2>
      <p>Prompt injection happens when someone tries to manipulate an AI using instructions hidden inside a message or other input. AI systems need to understand which instructions they should trust.</p>
      <button className="btn big" onClick={()=>onWin()}>CLAIM ACCESS KEY 01</button></div>}
  </section>);
}
